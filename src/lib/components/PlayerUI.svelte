<script lang="ts">
    import { isPlaying, currentTime, duration, volume, currentTrack, loadStaticTracks, autoPlay, repeat, tracks, currentIndex, sidebarOpen } from '$lib/stores/playlistStore';
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
        volume.subscribe((v) => (volumeValue = v));
        autoPlay.subscribe((v) => (autoPlayEnabled = v));
        repeat.subscribe((v) => (repeatEnabled = v));

        const unsub = currentTime.subscribe((t) => {
            const dur = get(duration);
            if (!isDragging) {
                displayProgress = dur > 0 ? t / dur : 0;
                displayTime = t;
            }
        });

        const unsubDuration = duration.subscribe((d) => {
            if (d > 0 && !isDragging) {
                displayProgress = displayTime > 0 ? displayTime / d : 0;
            }
        });

        const unsubIndex = currentIndex.subscribe(() => {
            displayProgress = 0;
            displayTime = 0;
        });

        loadStaticTracks().then(() => {
            initialized = true;
            loading = false;
        });

        return () => {
            unsub();
            unsubDuration();
            unsubIndex();
        };
    });

    function toggleAutoPlay() {
        autoPlay.update((v) => !v);
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
        if (!t || Number.isNaN(t)) return '0:00';
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${m}:${s < 10 ? '0' + s : s}`;
    }
</script>

<div class="ui" class:sidebar-open={$sidebarOpen}>
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
            <div class="marquee-container">
                <div class="marquee-content" class:scrolling={($currentTrack?.title || $currentTrack?.name || '').length > 30}>
                    <span class="track-name">
                        {#if loading}
                            Loading...
                        {:else if $currentTrack}
                            {$currentTrack.artist ? $currentTrack.artist + ' - ' : ''}{$currentTrack.title || $currentTrack.name}
                        {:else}
                            No track loaded
                        {/if}
                    </span>
                    {#if $currentTrack?.bpm}
                        <span class="bpm-tag">{$currentTrack.bpm} BPM</span>
                    {/if}

                    <!-- Duplicate for infinite scroll -->
                    {#if ($currentTrack?.title || $currentTrack?.name || '').length > 30}
                        <span class="track-name" aria-hidden="true" style="margin-left: 50px;">
                            {$currentTrack?.artist ? $currentTrack.artist + ' - ' : ''}{$currentTrack?.title || $currentTrack?.name}
                        </span>
                        {#if $currentTrack?.bpm}
                            <span class="bpm-tag" aria-hidden="true">{$currentTrack.bpm} BPM</span>
                        {/if}
                    {/if}
                </div>
            </div>
            <div class="time-display">
                <span>{formatTime(displayTime)}</span>
                <span class="separator">/</span>
                <span>{formatTime($duration)}</span>
            </div>
        </div>

        <div class="controls">
            <button class="mode-btn" class:active={repeatEnabled} onclick={handleToggleRepeat} title="Repeat">
                LOOP
            </button>
            <button class="nav-btn icon-btn" onclick={handlePrev} aria-label="Previous track">⏮</button>
            <button class="play-btn" onclick={handlePlay}>
                {$isPlaying ? '⏸' : '▶'}
            </button>
            <button class="nav-btn icon-btn" onclick={handleNext} aria-label="Next track">⏭</button>
            <button class="mode-btn" class:active={autoPlayEnabled} onclick={toggleAutoPlay} title="Auto-play">
                AUTO
            </button>
        </div>

        <div class="volume-control">
            <span>VOL</span>
            <input type="range" min="0" max="1" step="0.01" value={volumeValue} oninput={handleVolume} />
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
        background: var(--ui-panel-bg);
        backdrop-filter: blur(10px);
        border-top: 1px solid var(--ui-panel-border);
        color: var(--ui-text);
        font-family: 'Courier New', monospace;
        z-index: 100;
        transition: left 0.3s ease, width 0.3s ease, right 0.3s ease;
    }

    .ui.sidebar-open {
        left: 280px;
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
        background: var(--ui-track-bg);
        border-radius: 2px;
        cursor: pointer;
    }

    .progress-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        background: var(--ui-accent);
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
        display: flex;
        flex-direction: column;
    }

    .marquee-container {
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        position: relative;
    }

    .marquee-content {
        display: inline-block;
        padding-right: 50px;
    }

    .marquee-content.scrolling {
        animation: marquee 15s linear infinite;
    }

    @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
    }

    .track-name {
        font-size: 13px;
        font-weight: bold;
        opacity: 0.9;
    }

    .bpm-tag {
        font-size: 10px;
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        margin-left: 10px;
        opacity: 0.7;
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
        color: var(--ui-text);
        font-size: 11px;
        letter-spacing: 0.16em;
        cursor: pointer;
        opacity: 0.6;
        padding: 8px;
    }

    .nav-btn:hover {
        opacity: 1;
    }

    .icon-btn {
        font-size: 18px;
        letter-spacing: 0;
        line-height: 1;
    }

    .play-btn {
        background: var(--ui-accent);
        color: var(--ui-accent-soft);
        border: none;
        width: 52px;
        height: 44px;
        border-radius: 999px;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
    }

    .play-btn:hover {
        transform: scale(1.05);
    }

    .mode-btn {
        background: none;
        border: none;
        color: var(--ui-text);
        font-size: 11px;
        letter-spacing: 0.16em;
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

    .volume-control input[type='range'] {
        width: 80px;
        height: 4px;
        appearance: none;
        background: var(--ui-track-bg);
    }

    .volume-control input[type='range']::-webkit-slider-thumb {
        appearance: none;
        width: 10px;
        height: 10px;
        background: var(--ui-accent);
        border-radius: 50%;
    }

    @media (max-width: 900px) {
        .ui.sidebar-open {
            left: 0;
        }

        .main {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 12px 14px;
            align-items: center;
            padding: 12px 16px 14px;
        }

        .track-info {
            grid-column: 1 / -1;
            justify-self: center;
            width: min(100%, 360px);
            text-align: center;
        }

        .controls {
            grid-column: 1 / -1;
            justify-self: center;
            gap: 10px;
            flex-wrap: wrap;
        }

        .volume-control {
            justify-self: end;
        }
    }
</style>
