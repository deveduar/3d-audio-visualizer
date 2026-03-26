<script lang="ts">
    import { tracks, currentIndex, isPlaying, removeTrack, addTracks, moveTrack, sidebarOpen } from '$lib/stores/playlistStore';
    import { playTrackAt } from '$lib/stores/audioEngine';

    let collapsed = $state(true);
    let dragOver = $state(false);
    let draggedIndex = $state<number | null>(null);

    function handleDrop(e: DragEvent) {
        e.preventDefault();
        dragOver = false;

        if (e.dataTransfer?.files) {
            const files = Array.from(e.dataTransfer.files).filter(
                (f) => f.type.startsWith('audio/') || f.name.match(/\.(mp3|wav|ogg|flac|m4a|aac)$/i)
            );
            if (files.length > 0) {
                addTracks(files);
            }
        }
    }

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        dragOver = true;
    }

    function handleDragLeave() {
        dragOver = false;
    }

    function handleFileInput(e: Event) {
        const target = e.target as HTMLInputElement;
        if (target.files) {
            addTracks(Array.from(target.files));
        }
    }

    async function handleTrackSelect(index: number) {
        await playTrackAt(index);
    }

    function handleTrackDragStart(index: number) {
        draggedIndex = index;
    }

    function handleTrackItemDragOver(e: DragEvent) {
        e.preventDefault();
    }

    function handleTrackDrop(index: number) {
        if (draggedIndex === null) return;
        moveTrack(draggedIndex, index);
        draggedIndex = null;
    }

    function handleTrackDragEnd() {
        draggedIndex = null;
    }

    function toggleSidebar() {
        collapsed = !collapsed;
        sidebarOpen.set(!collapsed);
    }
</script>

<button class="mobile-toggle" class:visible={collapsed} onclick={toggleSidebar}>
    OPEN
</button>

<aside class="sidebar" class:collapsed>
    <button class="toggle" onclick={toggleSidebar}>
        {collapsed ? 'OPEN' : 'CLOSE'}
    </button>

    {#if !collapsed}
        <div class="content">
            <header class="sidebar-header">
                <div class="title-row">
                    <h2>PLAYLIST</h2>
                    <span class="track-count">{$tracks.length} TRACKS</span>
                </div>

                <div
                    class="dropzone"
                    class:dragover={dragOver}
                    ondrop={handleDrop}
                    ondragover={handleDragOver}
                    ondragleave={handleDragLeave}
                    role="button"
                    tabindex="0"
                >
                    <label for="file-input" class="drop-label">
                        <span class="drop-label-desktop">DROP AUDIO OR CLICK</span>
                        <span class="drop-label-mobile">SELECT AUDIO</span>
                    </label>
                    <input
                        type="file"
                        id="file-input"
                        accept=".mp3,.wav,.ogg,.flac,.m4a,.aac"
                        multiple
                        onchange={handleFileInput}
                    />
                </div>
            </header>

            <main class="sidebar-main">
                <div class="track-scroll">
                    <ul class="track-list">
                        {#each $tracks as track, index (track.id)}
                            <li
                                class="track-item"
                                class:active={index === $currentIndex}
                                class:playing={index === $currentIndex && $isPlaying}
                                class:dragging={index === draggedIndex}
                                draggable="true"
                                ondragstart={() => handleTrackDragStart(index)}
                                ondragover={handleTrackItemDragOver}
                                ondrop={() => handleTrackDrop(index)}
                                ondragend={handleTrackDragEnd}
                            >
                                <button class="track-btn" onclick={() => handleTrackSelect(index)}>
                                    <span class="playing-indicator">
                                        {#if index === $currentIndex && $isPlaying}
                                            LIVE
                                        {:else if index === $currentIndex}
                                            PLAY
                                        {:else}
                                            {index + 1}
                                        {/if}
                                    </span>
                                    <span class="track-name">{track.name}</span>
                                </button>
                                <button class="remove-btn" onclick={() => removeTrack(track.id)} aria-label="Remove track">
                                    X
                                </button>
                            </li>
                        {/each}
                    </ul>

                    {#if $tracks.length === 0}
                        <p class="empty">No tracks loaded</p>
                    {/if}
                </div>
            </main>

            <footer class="sidebar-footer">
                <details class="info-panel">
                    <summary>INFO</summary>
                    <p>Load audio, reorder tracks by drag and drop, click any track to play it, and use the live editor to shape the visual response in real time.</p>
                </details>
                <a class="github-link" href="https://github.com/deveduar" target="_blank" rel="noreferrer">
                    DEVELOPED BY DEVEDUAR
                </a>
            </footer>
        </div>
    {/if}
</aside>

<style>
    .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: 280px;
        background: var(--ui-panel-bg);
        backdrop-filter: blur(10px);
        z-index: 80;
        transition: transform 0.3s ease;
        border-right: 1px solid var(--ui-panel-border);
    }

    .sidebar.collapsed {
        transform: translateX(-260px);
    }

    .toggle {
        position: absolute;
        right: -48px;
        top: 50%;
        transform: translateY(-50%) rotate(-90deg);
        width: 96px;
        height: 28px;
        background: var(--ui-panel-bg);
        border: 1px solid var(--ui-panel-border);
        color: var(--ui-text);
        cursor: pointer;
        font-size: 10px;
        letter-spacing: 0.2em;
    }

    .mobile-toggle {
        display: none;
    }

    .content {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 20px 20px 18px;
        color: var(--ui-text);
        font-family: 'Courier New', monospace;
    }

    .sidebar-header {
        flex-shrink: 0;
    }

    .title-row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 18px;
    }

    .track-count {
        font-size: 10px;
        opacity: 0.55;
        letter-spacing: 0.12em;
    }

    h2 {
        font-size: 14px;
        margin: 0;
        letter-spacing: 2px;
        opacity: 0.7;
    }

    .dropzone {
        border: 2px dashed var(--ui-panel-border);
        padding: 20px;
        text-align: center;
        margin-bottom: 20px;
        transition: all 0.2s;
    }

    .dropzone.dragover {
        border-color: var(--ui-accent);
        background: color-mix(in srgb, var(--ui-accent) 12%, transparent);
    }

    .sidebar-main {
        min-height: 0;
        flex: 1;
        padding: 4px 0 12px;
    }

    .track-scroll {
        height: 100%;
        overflow-y: auto;
        padding-right: 4px;
        scrollbar-width: thin;
        scrollbar-color: var(--ui-scroll-thumb) var(--ui-scroll-track);
    }

    .track-scroll::-webkit-scrollbar {
        width: 10px;
    }

    .track-scroll::-webkit-scrollbar-track {
        background: var(--ui-scroll-track);
    }

    .track-scroll::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, var(--ui-scroll-thumb), var(--ui-scroll-thumb-soft));
        border-radius: 999px;
        border: 2px solid transparent;
    }

    .drop-label {
        font-size: 11px;
        cursor: pointer;
        opacity: 0.7;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 100%;
    }

    .drop-label-mobile {
        display: none;
    }

    .dropzone input {
        display: none;
    }

    .track-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .track-item {
        display: flex;
        align-items: center;
        margin-bottom: 4px;
        border: 1px solid transparent;
        transition: border-color 0.2s, background 0.2s, opacity 0.2s;
        overflow: hidden;
    }

    .track-item.active {
        border-color: var(--ui-accent);
    }

    .track-item.playing {
        background: var(--ui-track-bg);
    }

    .track-item.dragging {
        opacity: 0.4;
    }

    .track-btn {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
        background: none;
        border: none;
        color: var(--ui-text);
        padding: 8px;
        cursor: pointer;
        text-align: left;
        font-family: inherit;
        overflow: hidden;
    }

    .track-btn:hover {
        background: color-mix(in srgb, var(--ui-accent) 12%, transparent);
    }

    .playing-indicator {
        width: 32px;
        font-size: 10px;
        opacity: 0.7;
        flex-shrink: 0;
    }

    .track-item.playing .playing-indicator {
        opacity: 1;
    }

    .track-name {
        min-width: 0;
        flex: 1;
        font-size: 12px;
        opacity: 0.8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 140px;
    }

    .remove-btn {
        flex-shrink: 0;
        background: none;
        border: none;
        color: var(--ui-text);
        opacity: 0.3;
        cursor: pointer;
        font-size: 14px;
        padding: 8px;
    }

    .remove-btn:hover {
        opacity: 1;
    }

    .empty {
        font-size: 12px;
        opacity: 0.5;
        text-align: center;
        margin: 22px 0 0;
    }

    .sidebar-footer {
        flex-shrink: 0;
        padding-top: 14px;
        border-top: 1px solid var(--ui-panel-border);
        display: grid;
        gap: 12px;
    }

    .info-panel {
        background: color-mix(in srgb, var(--ui-bg) 70%, transparent);
        border: 1px solid var(--ui-panel-border);
        padding: 10px 12px;
    }

    .info-panel summary {
        cursor: pointer;
        font-size: 11px;
        letter-spacing: 0.16em;
        list-style: none;
    }

    .info-panel summary::-webkit-details-marker {
        display: none;
    }

    .info-panel p {
        margin: 10px 0 0;
        font-size: 11px;
        line-height: 1.5;
        opacity: 0.75;
    }

    .github-link {
        display: block;
        color: var(--ui-text);
        text-decoration: none;
        font-size: 10px;
        letter-spacing: 0.16em;
        opacity: 0.65;
    }

    .github-link:hover {
        opacity: 1;
    }

    @media (max-width: 900px) {
        .mobile-toggle {
            display: none;
            position: fixed;
            top: 16px;
            left: 16px;
            z-index: 160;
            min-width: 88px;
            height: 32px;
            padding: 0 14px;
            background: var(--ui-panel-bg);
            border: 1px solid var(--ui-panel-border);
            color: var(--ui-text);
            font-size: 10px;
            letter-spacing: 0.14em;
            font-family: 'Courier New', monospace;
        }

        .mobile-toggle.visible {
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .sidebar {
            width: 100vw;
            bottom: 118px;
            z-index: 120;
        }

        .sidebar.collapsed {
            transform: translateX(-100%);
        }

        .toggle {
            left: 16px;
            right: auto;
            top: 16px;
            transform: none;
            width: auto;
            min-width: 88px;
            height: 32px;
            padding: 0 14px;
            letter-spacing: 0.14em;
            z-index: 140;
        }

        .content {
            padding: 20px 16px 16px;
        }

        .sidebar-main {
            padding-bottom: 8px;
        }

        .dropzone {
            padding: 14px;
        }

        .drop-label-desktop {
            display: none;
        }

        .drop-label-mobile {
            display: inline;
        }

        .track-name {
            max-width: none;
        }

        .sidebar-footer {
            gap: 10px;
            padding-bottom: 4px;
        }
    }
</style>
