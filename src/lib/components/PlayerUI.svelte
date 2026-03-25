<script lang="ts">
    import { isPlaying, currentTime, duration, volume, currentTrack, loadStaticTracks, autoPlay, repeat, tracks, currentIndex } from '$lib/stores/playlistStore';
    import { togglePlay, seek, setVolume, playTrackAt, toggleRepeatMode } from '$lib/stores/audioEngine';
    import { onMount } from 'svelte';
    import { get } from 'svelte/store';
    
    let volumeValue = $state(0.8);
    let initialized = $state(false);
    let loading = $state(true);
    let autoPlayEnabled = $state(true);
    let repeatEnabled = $state(false);
    let isDragging = $state(false);
    let displayProgress = $state(0);
    let displayTime = $state(0);
    
    onMount(() => {
        volume.subscribe(v => volumeValue = v);
        autoPlay.subscribe(v => autoPlayEnabled = v);
        repeat.subscribe(v => repeatEnabled = v);
        
        const unsub = currentTime.subscribe(t => {
            const dur = get(duration);
            if (dur > 0 && !isDragging) {
                displayProgress = t / dur;
                displayTime = t;
            }
        });
        
        duration.subscribe(d => {
            if (d > 0 && !isDragging && displayProgress === 0) {
                displayProgress = displayTime / d;
            }
        });
        
        loadStaticTracks().then(() => {
            initialized = true;
            loading = false;
        });
        
        return () => {
            unsub();
        };
    });
    
    function toggleAutoPlay() {
        autoPlay.update(v => !v);
    }
    
    function handleToggleRepeat() {
        toggleRepeatMode();
    }
    
    async function handlePlay() {
        if (!initialized) return;
        await togglePlay();
    }
    
    async function handlePrev() {
        const tracksVal = get(tracks);
        const currentIndexVal = get(currentIndex);
        if (tracksVal.length > 0) {
            const newIndex = currentIndexVal === 0 ? tracksVal.length - 1 : currentIndexVal - 1;
            await playTrackAt(newIndex);
        }
    }
    
    async function handleNext() {
        const tracksVal = get(tracks);
        const currentIndexVal = get(currentIndex);
        if (tracksVal.length > 0) {
            const newIndex = (currentIndexVal + 1) % tracksVal.length;
            await playTrackAt(newIndex);
        }
    }
    
    function handleProgressInput(e: Event) {
        const target = e.target as HTMLInputElement;
        const percent = parseFloat(target.value);
        displayProgress = percent;
        
        const durVal = get(duration);
        displayTime = percent * durVal;
        isDragging = true;
    }
    
    async function handleProgressChange(e: Event) {
        const target = e.target as HTMLInputElement;
        const percent = parseFloat(target.value);
        const durVal = get(duration);
        const time = percent * durVal;
        await seek(time);
        isDragging = false;
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
</script>

<div class="ui">
    <div class="progress-bar">
        <input 
            type="range" 
            class="progress-slider"
            min="0" 
            max="1" 
            step="0.001"
            value={displayProgress}
            oninput={handleProgressInput}
            onchange={handleProgressChange}
            style="width: 100%;"
        />
    </div>
    
    <div class="main">
        <div class="track-info">
            <span class="track-name">{loading ? 'Loading...' : $currentTrack?.name || 'No track loaded'}</span>
            <div class="time-display">
                <span>{formatTime(displayTime)}</span>
                <span class="separator">/</span>
                <span>{formatTime($duration)}</span>
            </div>
        </div>
        
        <div class="controls">
            <button 
                class="mode-btn" 
                class:active={repeatEnabled}
                onclick={handleToggleRepeat}
                title="Repeat"
            >
                ⟲
            </button>
            <button class="nav-btn" onclick={handlePrev}>⏮</button>
            <button class="play-btn" onclick={handlePlay}>
                {$isPlaying ? '⏸' : '▶'}
            </button>
            <button class="nav-btn" onclick={handleNext}>⏭</button>
            <button 
                class="mode-btn" 
                class:active={autoPlayEnabled}
                onclick={toggleAutoPlay}
                title="Auto-play"
            >
                ⟳
            </button>
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
        height: 20px;
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 0;
    }
    
    .progress-slider {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 4px;
        background: rgba(255,255,255,0.2);
        border-radius: 2px;
        cursor: pointer;
    }
    
    .progress-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50%;
        cursor: pointer;
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
    
    .mode-btn {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        opacity: 0.4;
        padding: 8px;
    }
    
    .mode-btn.active {
        opacity: 1;
    }
    
    .mode-btn:hover {
        opacity: 0.8;
    }
    
    .mode-btn.active:hover {
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