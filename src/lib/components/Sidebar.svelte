<script lang="ts">
    import { tracks, currentIndex, isPlaying, removeTrack, addTracks, moveTrack, sidebarOpen } from '$lib/stores/playlistStore';
    import { playTrackAt } from '$lib/stores/audioEngine';

    let collapsed = $state(true);
    let dragOver = $state(false);
    let draggedIndex = $state<number | null>(null);
    let footerOpen = $state(false);

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
                <button class="footer-toggle" onclick={() => footerOpen = !footerOpen}>
                    <div class="toggle-label">
                        <svg class="info-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                        </svg>
                        <span>INFO / AUTHOR</span>
                    </div>
                    <span class="chevron" class:open={footerOpen}>▾</span>
                </button>

                {#if footerOpen}
                    <div class="footer-panel">
                        <div class="info-section">
                            <div class="info-header">
                                <span>VERSION 1.2 / STABLE</span>
                            </div>
                            <p class="info-text">
                                Drag & drop tracks to load them. Reorder any time. Use the Live Editor to shape your visuals. Designed for creative live performances.
                            </p>
                        </div>

                        <a class="github-link" href="https://github.com/deveduar" target="_blank" rel="noreferrer">
                            <svg class="github-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                            </svg>
                            <span>AUTHOR: DEVEDUAR</span>
                        </a>
                    </div>
                {/if}
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
        margin-top: auto;
        padding-top: 14px;
        padding-bottom: 84px;
        border-top: 1px solid var(--ui-panel-border);
    }
    
    .footer-toggle {
        width: 100%;
        background: none;
        border: none;
        color: var(--ui-text);
        padding: 10px 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        opacity: 0.6;
        transition: opacity 0.2s;
    }

    .footer-toggle:hover {
        opacity: 1;
    }

    .toggle-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 10px;
        letter-spacing: 0.12em;
        font-weight: bold;
    }

    .chevron {
        font-size: 12px;
        transition: transform 0.3s;
    }

    .chevron.open {
        transform: rotate(180deg);
    }
    
    .footer-panel {
        background: color-mix(in srgb, var(--ui-panel-bg) 80%, #fff 2%);
        border: 1px solid var(--ui-panel-border);
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        transition: background 0.2s;
    }
    
    .footer-panel:hover {
        background: color-mix(in srgb, var(--ui-panel-bg) 95%, var(--ui-accent) 5%);
    }

    .info-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .info-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 10px;
        letter-spacing: 0.12em;
        font-weight: bold;
        color: var(--ui-accent);
    }
    
    .info-icon {
        flex-shrink: 0;
    }

    .info-text {
        margin: 0;
        font-size: 11px;
        line-height: 1.4;
        opacity: 0.65;
    }

    .github-link {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--ui-text);
        text-decoration: none;
        font-size: 10px;
        letter-spacing: 0.1em;
        opacity: 0.55;
        transition: opacity 0.2s, color 0.2s;
        padding-top: 8px;
        border-top: 1px solid color-mix(in srgb, var(--ui-panel-border) 40%, transparent);
    }

    .github-link:hover {
        opacity: 1;
        color: var(--ui-accent);
    }

    .github-icon {
        flex-shrink: 0;
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
