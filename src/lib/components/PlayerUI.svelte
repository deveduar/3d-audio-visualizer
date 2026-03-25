<script lang="ts">
    import { isPlaying, currentTime, duration, currentTrackName, togglePlay, loadTrack, seek, setVolume, initAudio } from '$lib/stores/audioEngine';
    import Waveform from './Waveform.svelte';
    import { onMount } from 'svelte';
    
    let volumeValue = $state(0.8);
    
    onMount(() => {
        initAudio();
    });
    
    function handleFile(e: Event) {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            loadTrack(target.files[0]);
        }
    }
    
    function handleProgressClick(e: MouseEvent) {
        if (!$duration) return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        seek(Math.max(0, Math.min(1, percent)));
    }
    
    function handleProgressKey(e: KeyboardEvent) {
        if (!$duration) return;
        if (e.key === 'ArrowRight') {
            seek(($currentTime / $duration) + 0.05);
        } else if (e.key === 'ArrowLeft') {
            seek(($currentTime / $duration) - 0.05);
        }
    }
    
    function handleVolume(e: Event) {
        const target = e.target as HTMLInputElement;
        const val = parseFloat(target.value);
        volumeValue = val;
        setVolume(val);
    }
    
    function formatTime(t: number): string {
        if (!t || isNaN(t)) return '0:00';
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${m}:${s < 10 ? '0' + s : s}`;
    }
    
    function getProgress(): number {
        if (!$duration) return 0;
        return ($currentTime / $duration) * 100;
    }
</script>

<div class="ui">
    <div class="top">
        <label for="audio" class="upload-btn">SUBIR TRACK</label>
        <input type="file" id="audio" accept=".mp3,.wav,.ogg" onchange={handleFile} />
        <span class="track-name">{$currentTrackName}</span>
    </div>
    
    <Waveform />
    
    <div class="controls">
        <button class="play-btn" onclick={togglePlay}>
            {$isPlaying ? '⏸' : '▶'}
        </button>
    </div>
    
    <div class="bottom">
        <div class="time-info">
            <span>{formatTime($currentTime)}</span>
            <span>{formatTime($duration)}</span>
        </div>
        
        <button 
            class="progress-wrapper" 
            onclick={handleProgressClick}
            onkeydown={handleProgressKey}
            type="button"
            aria-label="Progress bar"
        >
            <div class="progress-bg">
                <div class="progress-fill" style="width: {getProgress()}%"></div>
            </div>
        </button>
        
        <div class="volume-control">
            <span>VOL</span>
            <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volumeValue}
                oninput={handleVolume}
            />
        </div>
    </div>
</div>

<style>
    .ui {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 20px;
        background: linear-gradient(transparent, rgba(0,0,0,0.95));
        color: white;
        font-family: 'Courier New', monospace;
        z-index: 100;
    }
    
    .top {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
    }
    
    .upload-btn {
        background: white;
        color: black;
        padding: 8px 16px;
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
        border: none;
    }
    
    input[type="file"] { display: none; }
    
    .track-name { font-size: 14px; opacity: 0.8; }
    
    .controls {
        display: flex;
        justify-content: center;
        margin: 15px 0;
    }
    
    .play-btn {
        background: white;
        color: black;
        border: none;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
    }
    
    .play-btn:hover {
        transform: scale(1.1);
    }
    
    .bottom { display: flex; flex-direction: column; gap: 8px; }
    
    .time-info {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        opacity: 0.7;
    }
    
    .progress-wrapper {
        width: 100%;
        cursor: pointer;
        padding: 8px 0;
        background: none;
        border: none;
    }
    
    .progress-bg {
        width: 100%;
        height: 4px;
        background: rgba(255,255,255,0.2);
        position: relative;
    }
    
    .progress-fill {
        height: 100%;
        background: white;
        position: absolute;
        left: 0;
        top: 0;
    }
    
    .volume-control {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 10px;
    }
    
    .volume-control span { font-size: 12px; opacity: 0.7; }
    
    .volume-control input[type="range"] {
        width: 100px;
        height: 4px;
        -webkit-appearance: none;
        background: rgba(255,255,255,0.2);
    }
    
    .volume-control input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50%;
    }
</style>
