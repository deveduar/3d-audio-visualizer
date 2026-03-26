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
    transient,
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
let bassFilter: Tone.Filter | null = null;
let midFilter: Tone.Filter | null = null;
let trebleFilter: Tone.Filter | null = null;
let bassMeter: Tone.Meter | null = null;
let midMeter: Tone.Meter | null = null;
let trebleMeter: Tone.Meter | null = null;
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
let smoothedRms = 0;
let smoothedBass = 0;
let smoothedMid = 0;
let smoothedTreble = 0;
let smoothedDb = -60;
let transientEnergy = 0;
let transientCooldown = 0;

const ATTACK_RATE = 0.22;
const RELEASE_RATE = 0.08;
const TRANSIENT_THRESHOLD = 0.16;
const TRANSIENT_COOLDOWN_FRAMES = 8;

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

function smoothTowards(current: number, target: number, attack = ATTACK_RATE, release = RELEASE_RATE): number {
    const factor = target > current ? attack : release;
    return current + (target - current) * factor;
}

function meterToUnit(value: number, gain = 1.2): number {
    return Math.max(0, Math.min(1, Tone.dbToGain(value) * gain));
}

function resetAnalysisState(): void {
    lufsHistory = [];
    smoothedRms = 0;
    smoothedBass = 0;
    smoothedMid = 0;
    smoothedTreble = 0;
    smoothedDb = -60;
    transientEnergy = 0;
    transientCooldown = 0;
    rms.set(0);
    bass.set(0);
    mid.set(0);
    treble.set(0);
    transient.set(0);
    dbLevel.set(-60);
    lufs.set(-60);
    waveformData.set(null);
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
    
    limiter = new Tone.Limiter(-1);
    meter = new Tone.Meter();
    analyser = new Tone.Analyser('waveform', 512);
    bassFilter = new Tone.Filter({
        type: 'lowpass',
        frequency: 180,
        rolloff: -24
    });
    midFilter = new Tone.Filter({
        type: 'bandpass',
        frequency: 1000,
        Q: 0.9
    });
    trebleFilter = new Tone.Filter({
        type: 'highpass',
        frequency: 2500,
        rolloff: -24
    });
    bassMeter = new Tone.Meter();
    midMeter = new Tone.Meter();
    trebleMeter = new Tone.Meter();
    
    player = new Tone.Player({
        loop: false,
        volume: Tone.gainToDb(get(volume))
    });
    
    player.connect(limiter);
    limiter.toDestination();
    limiter.connect(meter);
    limiter.connect(analyser);
    limiter.connect(bassFilter);
    limiter.connect(midFilter);
    limiter.connect(trebleFilter);
    bassFilter.connect(bassMeter);
    midFilter.connect(midMeter);
    trebleFilter.connect(trebleMeter);
    
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
    resetAnalysisState();
    
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
        
        if (analyser && meter && bassMeter && midMeter && trebleMeter) {
            try {
                const waveformValues = analyser.getValue() as Float32Array;
                const meterValue = meter.getValue() as number;
                const bassValue = bassMeter.getValue() as number;
                const midValue = midMeter.getValue() as number;
                const trebleValue = trebleMeter.getValue() as number;

                const targetRms = meterToUnit(meterValue);
                const targetBass = meterToUnit(bassValue, 1.7);
                const targetMid = meterToUnit(midValue, 1.55);
                const targetTreble = meterToUnit(trebleValue, 1.45);

                smoothedRms = smoothTowards(smoothedRms, targetRms);
                smoothedBass = smoothTowards(smoothedBass, targetBass, 0.26, 0.09);
                smoothedMid = smoothTowards(smoothedMid, targetMid, 0.24, 0.08);
                smoothedTreble = smoothTowards(smoothedTreble, targetTreble, 0.24, 0.08);
                smoothedDb = smoothTowards(smoothedDb, meterValue, 0.18, 0.06);

                const transientDelta = smoothedRms - (smoothedBass * 0.35 + smoothedMid * 0.25);
                if (transientCooldown > 0) {
                    transientCooldown -= 1;
                }
                if (transientDelta > TRANSIENT_THRESHOLD && transientCooldown === 0) {
                    transientEnergy = Math.min(1, transientDelta * 3.2);
                    transientCooldown = TRANSIENT_COOLDOWN_FRAMES;
                } else {
                    transientEnergy *= 0.88;
                }

                rms.set(smoothedRms);
                bass.set(smoothedBass);
                mid.set(smoothedMid);
                treble.set(smoothedTreble);
                transient.set(transientEnergy);
                dbLevel.set(smoothedDb);
                waveformData.set(Float32Array.from(waveformValues));

                lufsHistory.push(smoothedDb);
                if (lufsHistory.length > 30) {
                    lufsHistory.shift();
                }

                const averagedLufs = lufsHistory.reduce((sum, value) => sum + value, 0) / Math.max(1, lufsHistory.length);
                lufs.set(averagedLufs);
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
    resetAnalysisState();
    if (transitionTimeout) {
        clearTimeout(transitionTimeout);
        transitionTimeout = null;
    }
    if (bassFilter) {
        bassFilter.dispose();
        bassFilter = null;
    }
    if (midFilter) {
        midFilter.dispose();
        midFilter = null;
    }
    if (trebleFilter) {
        trebleFilter.dispose();
        trebleFilter = null;
    }
    if (bassMeter) {
        bassMeter.dispose();
        bassMeter = null;
    }
    if (midMeter) {
        midMeter.dispose();
        midMeter = null;
    }
    if (trebleMeter) {
        trebleMeter.dispose();
        trebleMeter = null;
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
