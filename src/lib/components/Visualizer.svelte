<script lang="ts">
    import { Canvas } from '@threlte/core';
    import Scene from './Scene.svelte';
    import PlayerUI from './PlayerUI.svelte';
    import { onDestroy } from 'svelte';
    import { cleanup } from '$lib/stores/audioEngine';
    
    onDestroy(() => {
        cleanup();
    });
</script>

<div class="visualizer">
    <Canvas>
        <Scene />
    </Canvas>
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
