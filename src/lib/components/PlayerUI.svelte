<script lang="ts">
    import { isPlaying, currentTime, duration, volume, currentTrack, playNext, playPrev, loadStaticTracks, tracks } from '$lib/stores/playlistStore';
    import { togglePlay, seek, setVolume, initAudio, loadCurrentTrack } from '$lib/stores/audioEngine';
    import { onMount } from 'svelte';
    
    let volumeValue = $state(0.8);
    let initialized = $state(false);
    let loading = $state(true);
    
    onMount(async () => {
        volume.subscribe(v => volumeValue = v);
        
        await loadStaticTracks();
        initialized = true;
        loading = false;
    });
    
    async function handlePlay() {
        if (!initialized) return;
        await togglePlay();
    }
    
    async function handlePrev() {
        await playPrev();
    }
    
    async function handleNext() {
        await playNext();
    }
    
    async function handleProgressClick(e: MouseEvent) {
        if (!$duration) return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        await seek(Math.max(0, Math.min(1, percent)));
    }
    
    async function handleProgressKey(e: KeyboardEvent) {
        if (!$duration) return;
        if (e.key === 'ArrowRight') {
            await seek(($currentTime / $duration) + 0.05);
        } else if (e.key === 'ArrowLeft') {
            await seek(($currentTime / $duration) - 0.05);
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
    <div class="progress-bar" onclick={handleProgressClick} onkeydown={handleProgressKey} role="slider" tabindex="0" aria-label="Progress" aria-valuenow={$currentTime} aria-valuemin={0} aria-valuemax={$duration}>
        <div class="progress-fill" style="width: {getProgress()}%"></div>
    </div>
    
    <div class="main">
        <div class="track-info">
            <span class="track-name">{loading ? 'Loading...' : $currentTrack?.name || 'No track loaded'}</span>
            <div class="time-display">
                <span>{formatTime($currentTime)}</span>
                <span class="separator">/</span>
                <span>{formatTime($duration)}</span>
            </div>
        </div>
        
        <div class="controls">
            <button class="nav-btn" onclick={handlePrev}>⏮</button>
            <button class="play-btn" onclick={handlePlay}>
                {$isPlaying ? '⏸' : '▶'}
            </button>
            <button class="nav-btn" onclick={handleNext}>⏭</button>
        </div>
        
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
        padding: 0;
        background: linear-gradient(transparent, rgba(0,0,0,0.95));
        color: white;
        font-family: 'Courier New', monospace;
        z-index: 100;
    }
    
    .progress-bar {
        width: 100%;
        height: 4px;
        background: rgba(255,255,255,0.2);
        cursor: pointer;
    }
    
    .progress-fill {
        height: 100%;
        background: white;
        transition: width 0.1s linear;
    }
    
    .main {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 15px 20px;
        gap: 20px;
    }
    
    .track-info {
        flex: 1;
        min-width: 0;
    }
    
    .track-name { 
        font-size: 13px; 
        opacity: 0.9; 
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
    }
    
    .time-display {
        font-size: 11px;
        opacity: 0.6;
        margin-top: 4px;
    }
    
    .separator {
        margin: 0 4px;
    }
    
    .controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 15px;
    }
    
    .nav-btn {
        background: none;
        border: none;
        color: white;
        font-size: 16px;
        cursor: pointer;
        opacity: 0.6;
        padding: 8px;
    }
    
    .nav-btn:hover {
        opacity: 1;
    }
    
    .play-btn {
        background: white;
        color: black;
        border: none;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        font-size: 16px;
        cursor: pointer;
    }
    
    .play-btn:hover {
        transform: scale(1.1);
    }
    
    .volume-control {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .volume-control span { 
        font-size: 10px; 
        opacity: 0.6; 
        white-space: nowrap;
    }
    
    .volume-control input[type="range"] {
        width: 80px;
        height: 4px;
        appearance: none;
        background: rgba(255,255,255,0.2);
    }
    
    .volume-control input[type="range"]::-webkit-slider-thumb {
        appearance: none;
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
    }
</style>
