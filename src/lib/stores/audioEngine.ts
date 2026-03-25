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
    currentTrack
} from './playlistStore';

let player: Tone.Player | null = null;
let limiter: Tone.Limiter | null = null;
let meter: Tone.Meter | null = null;
let analyser: Tone.Analyser | null = null;
let animationId: number | null = null;
let loaded = false;

export async function initAudio(): Promise<void> {
    if (Tone.context.state !== 'running') {
        await Tone.start();
    }
    
    if (Tone.Transport.state !== 'started') {
        Tone.Transport.start();
    }
    
    limiter = new Tone.Limiter(-1).toDestination();
    meter = new Tone.Meter();
    analyser = new Tone.Analyser('fft', 512);
    
    player = new Tone.Player({
        loop: false,
        volume: Tone.gainToDb(get(volume))
    });
    
    player.chain(limiter, meter, analyser, Tone.Destination);
    
    startLoop();
}

let trackStartTime = 0;
let pausedPosition = 0;

export async function loadCurrentTrack(): Promise<void> {
    const $tracks = get(tracks);
    const $currentIndex = get(currentIndex);
    const track = $tracks[$currentIndex];
    
    if (!track || !player) return;
    
    loaded = false;
    isPlaying.set(false);
    currentTime.set(0);
    pausedPosition = 0;
    trackStartTime = 0;
    
    await player.load(track.url);
    
    duration.set(player.buffer.duration);
    loaded = true;
}

export async function togglePlay(): Promise<void> {
    if (!player) {
        await initAudio();
    }
    
    if (Tone.context.state !== 'running') {
        await Tone.start();
    }
    
    if (Tone.Transport.state !== 'started') {
        Tone.Transport.start();
    }
    
    const $tracks = get(tracks);
    const $currentIndex = get(currentIndex);
    
    if ($tracks.length === 0) return;
    
    if (!loaded || !player?.buffer.loaded) {
        await loadCurrentTrack();
    }
    
    if (player && player.state === 'started') {
        pausedPosition = Tone.Transport.seconds - trackStartTime;
        player.stop();
        isPlaying.set(false);
    } else if (player) {
        player.start(undefined, pausedPosition);
        trackStartTime = Tone.Transport.seconds - pausedPosition;
        isPlaying.set(true);
    }
}

export async function seek(percent: number): Promise<void> {
    const $duration = get(duration);
    if (!$duration || $duration <= 0) return;
    
    const time = Math.max(0, Math.min(percent * $duration, $duration));
    
    pausedPosition = time;
    currentTime.set(time);
    
    if (player && loaded) {
        try {
            if (player.state === 'started') {
                player.stop();
            }
            player.start(undefined, time);
            trackStartTime = Tone.Transport.seconds - time;
            isPlaying.set(true);
        } catch (e) {
            console.error('Seek error:', e);
        }
    }
}

export function setVolume(val: number): void {
    if (player) {
        player.volume.value = Tone.gainToDb(val);
    }
    volume.set(val);
}

function startLoop(): void {
    function loop(): void {
        if (player) {
            if (player.state === 'started') {
                const position = Tone.Transport.seconds - trackStartTime;
                currentTime.set(position);
                
                const bufDur = player.buffer.duration;
                if (position >= bufDur && bufDur > 0) {
                    isPlaying.set(false);
                    currentTime.set(0);
                    trackStartTime = 0;
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
        player.stop();
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

currentIndex.subscribe(async () => {
    const wasPlaying = get(isPlaying);
    if (player && get(tracks).length > 0) {
        await loadCurrentTrack();
        if (wasPlaying && player) {
            player.start();
            trackStartTime = Tone.Transport.seconds;
        }
    }
});
