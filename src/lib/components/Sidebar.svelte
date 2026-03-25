<script lang="ts">
    import { tracks, currentIndex, isPlaying, removeTrack, addTracks, moveTrack } from '$lib/stores/playlistStore';
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
</script>

<aside class="sidebar" class:collapsed>
    <button class="toggle" onclick={() => (collapsed = !collapsed)}>
        {collapsed ? 'OPEN' : 'CLOSE'}
    </button>

    {#if !collapsed}
        <div class="content">
            <h2>PLAYLIST</h2>

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
                    DROP AUDIO OR CLICK
                </label>
                <input
                    type="file"
                    id="file-input"
                    accept=".mp3,.wav,.ogg,.flac,.m4a,.aac"
                    multiple
                    onchange={handleFileInput}
                />
            </div>

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
    {/if}
</aside>

<style>
    .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: 280px;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(10px);
        z-index: 80;
        transition: transform 0.3s ease;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
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
        background: rgba(0, 0, 0, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: white;
        cursor: pointer;
        font-size: 10px;
        letter-spacing: 0.2em;
    }

    .content {
        padding: 20px;
        height: 100%;
        overflow-y: auto;
        color: white;
        font-family: 'Courier New', monospace;
    }

    h2 {
        font-size: 14px;
        margin: 0 0 20px 0;
        letter-spacing: 2px;
        opacity: 0.7;
    }

    .dropzone {
        border: 2px dashed rgba(255, 255, 255, 0.3);
        padding: 20px;
        text-align: center;
        margin-bottom: 20px;
        transition: all 0.2s;
    }

    .dropzone.dragover {
        border-color: white;
        background: rgba(255, 255, 255, 0.1);
    }

    .drop-label {
        font-size: 11px;
        cursor: pointer;
        opacity: 0.7;
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
    }

    .track-item.active {
        border-color: white;
    }

    .track-item.playing {
        background: rgba(255, 255, 255, 0.06);
    }

    .track-item.dragging {
        opacity: 0.4;
    }

    .track-btn {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 10px;
        background: none;
        border: none;
        color: white;
        padding: 8px;
        cursor: pointer;
        text-align: left;
        font-family: inherit;
    }

    .track-btn:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    .playing-indicator {
        width: 36px;
        font-size: 10px;
        opacity: 0.7;
        flex-shrink: 0;
    }

    .track-item.playing .playing-indicator {
        opacity: 1;
    }

    .track-name {
        font-size: 12px;
        opacity: 0.8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .remove-btn {
        background: none;
        border: none;
        color: white;
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
    }
</style>
