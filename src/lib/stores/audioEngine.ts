import * as Tone from 'tone';
import { get } from 'svelte/store';
import { 
    tracks, 
    currentIndex, 
    isPlaying, 
    currentTime, 
    duration, 
    volume,
    rms,
    bass,
    mid,
    treble,
    dbLevel,
    lufs,
    waveformData,
    autoPlay,
    repeat
} from './playlistStore';

let player: Tone.Player | null = null;
let limiter: Tone.Limiter | null = null;
let meter: Tone.Meter | null = null;
let analyser: Tone.Analyser | null = null;
let animationId: number | null = null;
let loaded = false;

let isTransitioning = false;
let isSeeking = false;
let pausePosition = 0;
let playbackOffset = 0;
let stopIntent: 'none' | 'pause' | 'seek' | 'track-change' = 'none';
let lufsHistory: number[] = [];
let operationId = 0;
let transitionTimeout: ReturnType<typeof setTimeout> | null = null;

function resetPlaybackPosition(time = 0): void {
    playbackOffset = time;
    pausePosition = time;
    currentTime.set(time);
}

function releaseTransition(delay = 200): void {
    if (transitionTimeout) {
        clearTimeout(transitionTimeout);
    }

    transitionTimeout = setTimeout(() => {
        isTransitioning = false;
        transitionTimeout = null;
    }, delay);
}

export async function initAudio(): Promise<void> {
    const context = Tone.getContext();
    if (context.state !== 'running') {
        await Tone.start();
    }
    
    const transport = Tone.getTransport();
    if (transport.state !== 'started') {
        transport.start();
    }
    
    limiter = new Tone.Limiter(-1).toDestination();
    meter = new Tone.Meter();
    analyser = new Tone.Analyser('waveform', 512);
    
    player = new Tone.Player({
        loop: false,
        volume: Tone.gainToDb(get(volume))
    });
    
    player.chain(limiter, meter, analyser, Tone.Destination);
    
    player.onstop = () => {
        const intent = stopIntent;
        stopIntent = 'none';

        if (intent !== 'none' || isSeeking) {
            return;
        }

        const repeatEnabled = get(repeat);
        const autoPlayEnabled = get(autoPlay);
        const isCurrentlyPlaying = get(isPlaying);

        resetPlaybackPosition(0);

        if (!repeatEnabled) {
            if (isCurrentlyPlaying && autoPlayEnabled) {
                const $tracks = get(tracks);
                const $currentIndex = get(currentIndex);
                if ($tracks.length > 0) {
                    const nextIndex = ($currentIndex + 1) % $tracks.length;
                    currentIndex.set(nextIndex);

                    setTimeout(async () => {
                        const requestId = ++operationId;
                        const didLoad = await loadCurrentTrack(requestId);
                        if (didLoad && player && loaded && requestId === operationId) {
                            try {
                                playbackOffset = 0;
                                player.start(0, 0);
                                isPlaying.set(true);
                            } catch (e) {
                                console.error('Autoplay error:', e);
                            }
                        }
                    }, 100);
                }
            } else if (isCurrentlyPlaying && !autoPlayEnabled) {
                isPlaying.set(false);
            }
        }
    };
    
    startLoop();
}

export async function loadCurrentTrack(requestId = ++operationId): Promise<boolean> {
    const $tracks = get(tracks);
    const $currentIndex = get(currentIndex);
    const track = $tracks[$currentIndex];
    
    if (!track || !player) return false;
    
    try {
        stopIntent = 'track-change';
        player.stop();
    } catch (e) {}
    
    const transport = Tone.getTransport();
    transport.cancel();
    transport.seconds = 0;
    
    loaded = false;
    isPlaying.set(false);
    resetPlaybackPosition(0);
    lufsHistory = [];
    dbLevel.set(-60);
    lufs.set(-60);
    waveformData.set(null);
    
    await player.load(track.url);

    if (requestId !== operationId) {
        return false;
    }
    
    const dur = player.buffer.duration;
    duration.set(dur);
    loaded = true;
    
    player.loop = get(repeat);
    return true;
}

export async function togglePlay(): Promise<void> {
    if (isTransitioning) return;
    
    if (!player) {
        await initAudio();
    }
    
    const context = Tone.getContext();
    if (context.state !== 'running') {
        await Tone.start();
    }
    
    const transport = Tone.getTransport();
    if (transport.state !== 'started') {
        transport.start();
    }
    
    const $tracks = get(tracks);
    if ($tracks.length === 0) return;
    
    if (!loaded || !player?.buffer.loaded) {
        const didLoad = await loadCurrentTrack();
        if (!didLoad) {
            isTransitioning = false;
            return;
        }
    }
    
    if (!player) return;
    
    isTransitioning = true;
    
    if (player.state === 'started') {
        pausePosition = get(currentTime);
        playbackOffset = pausePosition;
        stopIntent = 'pause';
        isPlaying.set(false);
        player.stop();
    } else {
        try {
            const startPos = pausePosition > 0 ? pausePosition : 0;
            transport.cancel();
            transport.seconds = 0;
            playbackOffset = startPos;
            player.start(0, startPos);
            isPlaying.set(true);
        } catch (e) {
            console.error('Play error:', e);
        }
    }
    
    releaseTransition();
}

export async function seek(time: number): Promise<void> {
    if (isTransitioning || isSeeking || !player || !loaded) return;
    
    const $duration = get(duration);
    if (!$duration || $duration <= 0) return;
    
    const clampedTime = Math.max(0, Math.min(time, $duration));
    const wasPlaying = player.state === 'started';
    
    isSeeking = true;
    isTransitioning = true;
    playbackOffset = clampedTime;
    pausePosition = clampedTime;
    currentTime.set(clampedTime);
    
    if (wasPlaying) {
        try {
            stopIntent = 'seek';
            player.stop();
        } catch (e) {}
        
        await new Promise(r => setTimeout(r, 100));
        
        const transport = Tone.getTransport();
        transport.cancel();
        transport.seconds = 0;
        
        try {
            player.start(0, clampedTime);
            isPlaying.set(true);
        } catch (e) {
            console.error('Seek start error:', e);
        }
    } else {
        const transport = Tone.getTransport();
        transport.cancel();
        transport.seconds = 0;
    }
    
    releaseTransition(100);
    setTimeout(() => {
        isSeeking = false;
    }, 100);
}

export function setVolume(val: number): void {
    if (player) {
        player.volume.value = Tone.gainToDb(val);
    }
    volume.set(val);
}

export function toggleRepeatMode(): void {
    const newValue = !get(repeat);
    repeat.set(newValue);
    if (player) {
        player.loop = newValue;
    }
}

function startLoop(): void {
    function loop(): void {
        if (player && loaded) {
            const bufDur = player.buffer.duration;
            if (bufDur > 0) {
                if (player.state === 'started') {
                    const transport = Tone.getTransport();
                    let pos = playbackOffset + transport.seconds;
                    if (pos > bufDur) pos = bufDur;
                    if (pos < 0) pos = 0;
                    currentTime.set(pos);
                    
                    if (pos >= bufDur - 0.1 && player.loop) {
                        playbackOffset = 0;
                        currentTime.set(0);
                    }
                } else if (!isSeeking) {
                    currentTime.set(pausePosition);
                }
            }
        }
        
        if (analyser && meter) {
            try {
                const waveformValues = analyser.getValue() as Float32Array;
                const meterValue = meter.getValue() as number;
                
                const rmsValue = Math.max(0, Tone.dbToGain(meterValue));
                rms.set(rmsValue);
                dbLevel.set(meterValue);
                waveformData.set(Float32Array.from(waveformValues));

                lufsHistory.push(meterValue);
                if (lufsHistory.length > 30) {
                    lufsHistory.shift();
                }

                const averagedLufs = lufsHistory.reduce((sum, value) => sum + value, 0) / Math.max(1, lufsHistory.length);
                lufs.set(averagedLufs);
                
                const bins = waveformValues.length;
                const bassEnd = Math.floor(bins * 0.1);
                const midEnd = Math.floor(bins * 0.5);
                
                let bassSum = 0, midSum = 0, trebleSum = 0;
                
                for (let i = 0; i < bassEnd; i++) {
                    bassSum += Math.abs(waveformValues[i]);
                }
                for (let i = bassEnd; i < midEnd; i++) {
                    midSum += Math.abs(waveformValues[i]);
                }
                for (let i = midEnd; i < bins; i++) {
                    trebleSum += Math.abs(waveformValues[i]);
                }
                
                bass.set(Math.max(0, Math.min(1, bassSum / Math.max(1, bassEnd) * 2.5)));
                mid.set(Math.max(0, Math.min(1, midSum / Math.max(1, midEnd - bassEnd) * 2.5)));
                treble.set(Math.max(0, Math.min(1, trebleSum / Math.max(1, bins - midEnd) * 2.5)));
            } catch (e) {}
        }
        
        animationId = requestAnimationFrame(loop);
    }
    
    loop();
}

export function cleanup(): void {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    if (player) {
        player.dispose();
        player = null;
    }
    if (limiter) {
        limiter.dispose();
        limiter = null;
    }
    if (meter) {
        meter.dispose();
        meter = null;
    }
    if (analyser) {
        analyser.dispose();
        analyser = null;
    }
    loaded = false;
    lufsHistory = [];
    waveformData.set(null);
    if (transitionTimeout) {
        clearTimeout(transitionTimeout);
        transitionTimeout = null;
    }
}

export async function playTrackAt(index: number): Promise<void> {
    const $tracks = get(tracks);
    if (index < 0 || index >= $tracks.length) return;

    const requestId = ++operationId;
    isTransitioning = true;
    
    resetPlaybackPosition(0);
    
    if (player && player.state === 'started') {
        try {
            stopIntent = 'track-change';
            player.stop();
        } catch (e) {}
    }
    
    const transport = Tone.getTransport();
    transport.cancel();
    transport.seconds = 0;
    
    currentIndex.set(index);
    
    const didLoad = await loadCurrentTrack(requestId);
    if (!didLoad || requestId !== operationId) {
        releaseTransition();
        return;
    }

    if (player && loaded && requestId === operationId) {
        try {
            player.start(0, 0);
            isPlaying.set(true);
        } catch (e) {
            console.error('playTrackAt error:', e);
        }
    }
    
    releaseTransition();
}
