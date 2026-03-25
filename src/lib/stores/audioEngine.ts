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

function resetPlaybackPosition(time = 0): void {
    playbackOffset = time;
    pausePosition = time;
    currentTime.set(time);
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
    analyser = new Tone.Analyser('fft', 512);
    
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
                        await loadCurrentTrack();
                        if (player && loaded) {
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

export async function loadCurrentTrack(): Promise<void> {
    const $tracks = get(tracks);
    const $currentIndex = get(currentIndex);
    const track = $tracks[$currentIndex];
    
    if (!track || !player) return;
    
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
    
    await player.load(track.url);
    
    const dur = player.buffer.duration;
    duration.set(dur);
    loaded = true;
    
    player.loop = get(repeat);
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
        await loadCurrentTrack();
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
    
    setTimeout(() => { isTransitioning = false; }, 200);
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
    
    setTimeout(() => {
        isSeeking = false;
        isTransitioning = false;
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
                const fftValues = analyser.getValue();
                const meterValue = meter.getValue();
                
                const rmsValue = Math.max(0, Tone.dbToGain(meterValue as number));
                rms.set(rmsValue);
                
                const bins = fftValues.length;
                const bassEnd = Math.floor(bins * 0.1);
                const midEnd = Math.floor(bins * 0.5);
                
                let bassSum = 0, midSum = 0, trebleSum = 0;
                
                for (let i = 0; i < bassEnd; i++) {
                    bassSum += (fftValues[i] as number + 100) / 100;
                }
                for (let i = bassEnd; i < midEnd; i++) {
                    midSum += (fftValues[i] as number + 100) / 100;
                }
                for (let i = midEnd; i < bins; i++) {
                    trebleSum += (fftValues[i] as number + 100) / 100;
                }
                
                bass.set(Math.max(0, Math.min(1, bassSum / bassEnd)));
                mid.set(Math.max(0, Math.min(1, midSum / (midEnd - bassEnd))));
                treble.set(Math.max(0, Math.min(1, trebleSum / (bins - midEnd))));
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
}

export async function playTrackAt(index: number): Promise<void> {
    const $tracks = get(tracks);
    if (index < 0 || index >= $tracks.length) return;
    
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
    
    await loadCurrentTrack();
    
    await new Promise(r => setTimeout(r, 150));
    
    if (player && loaded) {
        try {
            player.start();
            isPlaying.set(true);
        } catch (e) {
            console.error('playTrackAt error:', e);
        }
    }
    
    setTimeout(() => { isTransitioning = false; }, 200);
}
