<script lang="ts">
    import { tracks, currentIndex, isPlaying, playTrack, removeTrack, addTracks } from '$lib/stores/playlistStore';
    
    let collapsed = $state(true);
    let dragOver = $state(false);
    
    function handleDrop(e: DragEvent) {
        e.preventDefault();
        dragOver = false;
        
        if (e.dataTransfer?.files) {
            const files = Array.from(e.dataTransfer.files).filter(
                f => f.type.startsWith('audio/') || 
                     f.name.match(/\.(mp3|wav|ogg|flac|m4a|aac)$/i)
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
            const files = Array.from(target.files);
            addTracks(files);
        }
    }
</script>

<aside class="sidebar" class:collapsed>
    <button class="toggle" onclick={() => collapsed = !collapsed}>
        {collapsed ? '▶' : '◀'}
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
                    accept=".mp3,.wav,.ogg,.flac"
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
                    >
                        <button 
                            class="track-btn"
                            onclick={() => playTrack(index)}
                        >
                            <span class="playing-indicator">
                                {index === $currentIndex && $isPlaying ? '▶' : index === $currentIndex ? '●' : '○'}
                            </span>
                            <span class="track-name">{track.name}</span>
                        </button>
                        <button 
                            class="remove-btn"
                            onclick={() => removeTrack(track.id)}
                        >
                            ×
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
        z-index: 200;
        transition: transform 0.3s ease;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .sidebar.collapsed {
        transform: translateX(-260px);
    }
    
    .toggle {
        position: absolute;
        right: -30px;
        top: 50%;
        transform: translateY(-50%);
        width: 30px;
        height: 60px;
        background: rgba(0, 0, 0, 0.8);
        border: none;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
        cursor: pointer;
        font-size: 10px;
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
        transition: border-color 0.2s;
    }
    
    .track-item.active {
        border-color: white;
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
        width: 16px;
        font-size: 10px;
        opacity: 0.7;
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
        font-size: 16px;
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
