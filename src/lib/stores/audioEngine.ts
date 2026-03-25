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
let seekOffset = 0;
let pausePosition = 0;
let lastSeekTime = 0;

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
        if (!isTransitioning && !isSeeking) {
            const repeatEnabled = get(repeat);
            
            if (!repeatEnabled) {
                if (get(isPlaying) && get(autoPlay)) {
                    setTimeout(() => {
                        const $tracks = get(tracks);
                        const $currentIndex = get(currentIndex);
                        if ($tracks.length > 0) {
                            isTransitioning = true;
                            currentIndex.set(($currentIndex + 1) % $tracks.length);
                            setTimeout(() => { isTransitioning = false; }, 200);
                        }
                    }, 100);
                } else if (get(isPlaying) && !get(autoPlay)) {
                    isPlaying.set(false);
                }
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
        player.stop();
    } catch (e) {}
    
    loaded = false;
    isPlaying.set(false);
    currentTime.set(0);
    pausePosition = 0;
    seekOffset = 0;
    lastSeekTime = 0;
    
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
        pausePosition = transport.seconds;
        player.stop();
        isPlaying.set(false);
    } else {
        try {
            const startPos = pausePosition > 0 ? pausePosition : 0;
            transport.cancel();
            transport.seconds = startPos;
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
    lastSeekTime = clampedTime;
    
    if (wasPlaying) {
        try {
            player.stop();
        } catch (e) {}
        
        await new Promise(r => setTimeout(r, 100));
        
        const transport = Tone.getTransport();
        transport.cancel();
        transport.seconds = 0;
        
        try {
            player.start(0, clampedTime);
            isPlaying.set(true);
            currentTime.set(clampedTime);
        } catch (e) {
            console.error('Seek start error:', e);
        }
    } else {
        seekOffset = clampedTime;
        const transport = Tone.getTransport();
        transport.cancel();
        transport.seconds = 0;
        currentTime.set(clampedTime);
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
                    let pos = transport.seconds + lastSeekTime;
                    if (pos > bufDur) pos = bufDur;
                    if (pos < 0) pos = 0;
                    currentTime.set(pos);
                    
                    if (pos >= bufDur - 0.1 && player.loop) {
                        lastSeekTime = 0;
                        currentTime.set(0);
                    }
                } else if (seekOffset > 0 && !isSeeking) {
                    currentTime.set(seekOffset);
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
    
    if (player && player.state === 'started') {
        try {
            player.stop();
        } catch (e) {}
    }
    
    currentIndex.set(index);
    await loadCurrentTrack();
    
    await new Promise(r => setTimeout(r, 100));
    
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
