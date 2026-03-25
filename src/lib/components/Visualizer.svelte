<script lang="ts">
    import { Canvas } from '@threlte/core';
    import Scene from './Scene.svelte';
    import PlayerUI from './PlayerUI.svelte';
    import Sidebar from './Sidebar.svelte';
    import LiveEditor from './LiveEditor.svelte';
    import Waveform from './Waveform.svelte';
    import { onDestroy } from 'svelte';
    import { cleanup as cleanupAudio } from '$lib/stores/audioEngine';
    import { cleanup as cleanupPlaylist } from '$lib/stores/playlistStore';
    import { params } from '$lib/stores/params';
    
    onDestroy(() => {
        cleanupAudio();
        cleanupPlaylist();
    });
</script>

<div class="visualizer">
    <Canvas>
        <Scene />
    </Canvas>
    {#if $params.displayMode === 'waveform'}
        <Waveform />
    {/if}
    <Sidebar />
    <LiveEditor />
    <PlayerUI />
</div>

<style>
    .visualizer {
        width: 100vw;
        height: 100vh;
        background: #000;
        overflow: hidden;
        position: relative;
    }
    
    :global(canvas) {
        display: block;
        background: #000 !important;
    }
</style>
