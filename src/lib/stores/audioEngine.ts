import { writable, get } from 'svelte/store';
import * as Tone from 'tone';

export const isPlaying = writable(false);
export const currentTime = writable(0);
export const duration = writable(0);
export const volume = writable(0.8);
export const currentTrackName = writable('Still.mp3');

export const rms = writable(0);
export const bass = writable(0);
export const mid = writable(0);
export const treble = writable(0);
export const waveformData = writable<Float32Array | null>(null);

let audio: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let meter: AnalyserNode | null = null;
let animationId: number | null = null;
let startTime = 0;
let pausedAt = 0;

export async function initAudio() {
    audio = new Audio('/track.mp3');
    audio.crossOrigin = 'anonymous';
    
    await new Promise<void>((resolve, reject) => {
        audio!.oncanplaythrough = () => resolve();
        audio!.onerror = () => reject();
    });
    
    duration.set(audio.duration);
    
    audioContext = new AudioContext();
    const source = audioContext.createMediaElementSource(audio);
    
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    
    meter = audioContext.createAnalyser();
    meter.fftSize = 256;
    
    source.connect(analyser);
    source.connect(meter);
    meter.connect(audioContext.destination);
    
    startLoop();
}

export async function loadTrack(file: File) {
    if (audio) {
        audio.pause();
    }
    
    currentTrackName.set(file.name);
    isPlaying.set(false);
    currentTime.set(0);
    pausedAt = 0;
    
    const url = URL.createObjectURL(file);
    audio = new Audio(url);
    
    await new Promise<void>((resolve, reject) => {
        audio!.oncanplaythrough = () => resolve();
        audio!.onerror = () => reject();
    });
    
    duration.set(audio.duration);
    
    if (!audioContext) {
        audioContext = new AudioContext();
        const source = audioContext.createMediaElementSource(audio);
        
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        
        meter = audioContext.createAnalyser();
        meter.fftSize = 256;
        
        source.connect(analyser);
        source.connect(meter);
        meter.connect(audioContext.destination);
    } else {
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        source.connect(meter);
    }
}

export function togglePlay() {
    if (!audio) {
        initAudio();
        return;
    }
    
    if (audio.paused) {
        if (audioContext?.state === 'suspended') {
            audioContext.resume();
        }
        audio.currentTime = pausedAt;
        audio.play();
        startTime = Date.now();
        isPlaying.set(true);
    } else {
        pausedAt = audio.currentTime;
        audio.pause();
        isPlaying.set(false);
    }
}

export function seek(percent: number) {
    if (!audio) return;
    const time = percent * get(duration);
    audio.currentTime = time;
    pausedAt = time;
    currentTime.set(time);
}

export function setVolume(val: number) {
    if (audio) {
        audio.volume = val;
    }
    volume.set(val);
}

function startLoop() {
    function loop() {
        if (audio) {
            if (!audio.paused) {
                currentTime.set(audio.currentTime);
            }
            
            if (audio.ended) {
                isPlaying.set(false);
                pausedAt = 0;
                currentTime.set(0);
            }
        }
        
        if (analyser && meter) {
            try {
                const fftData = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(fftData);
                
                const meterData = new Uint8Array(meter.frequencyBinCount);
                meter.getByteFrequencyData(meterData);
                
                let rmsSum = 0;
                for (let i = 0; i < meterData.length; i++) {
                    rmsSum += meterData[i];
                }
                rms.set(rmsSum / meterData.length / 255);
                
                const bins = fftData.length;
                const bassEnd = Math.floor(bins * 0.1);
                const midEnd = Math.floor(bins * 0.5);
                
                let bassSum = 0, midSum = 0, trebleSum = 0;
                
                for (let i = 0; i < bassEnd; i++) bassSum += fftData[i];
                for (let i = bassEnd; i < midEnd; i++) midSum += fftData[i];
                for (let i = midEnd; i < bins; i++) trebleSum += fftData[i];
                
                bass.set(bassSum / bassEnd / 255);
                mid.set(midSum / (midEnd - bassEnd) / 255);
                treble.set(trebleSum / (bins - midEnd) / 255);
            } catch (e) {}
        }
        
        animationId = requestAnimationFrame(loop);
    }
    
    loop();
}

export function cleanup() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    if (audio) {
        audio.pause();
        audio = null;
    }
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    analyser = null;
    meter = null;
}
