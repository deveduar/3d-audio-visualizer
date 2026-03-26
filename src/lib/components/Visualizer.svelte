<script lang="ts">
    import { Canvas } from '@threlte/core';
    import Scene from './Scene.svelte';
    import PlayerUI from './PlayerUI.svelte';
    import Sidebar from './Sidebar.svelte';
    import LiveEditor from './LiveEditor.svelte';
    import Waveform from './Waveform.svelte';
    import NebulaField from './NebulaField.svelte';
    import ImpactOverlay from './ImpactOverlay.svelte';
    import { onDestroy } from 'svelte';
    import { cleanup as cleanupAudio } from '$lib/stores/audioEngine';
    import { cleanup as cleanupPlaylist } from '$lib/stores/playlistStore';
    import { params } from '$lib/stores/params';

    function hexToRgb(hex: string) {
        const normalized = hex.replace('#', '');
        const safe = normalized.length === 3
            ? normalized
                  .split('')
                  .map((char) => char + char)
                  .join('')
            : normalized.padEnd(6, '0').slice(0, 6);

        return {
            r: parseInt(safe.slice(0, 2), 16),
            g: parseInt(safe.slice(2, 4), 16),
            b: parseInt(safe.slice(4, 6), 16)
        };
    }

    function rgba(hex: string, alpha: number) {
        const { r, g, b } = hexToRgb(hex);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    const themeVars = $derived.by(() => {
        const dark = $params.themeMode === 'dark';
        const text = dark ? '#f6f6f6' : '#0e0e0e';
        const muted = dark ? rgba($params.secondaryColor, 0.7) : rgba($params.secondaryColor, 0.82);
        const panelBg = dark ? rgba($params.backgroundColor, 0.82) : rgba('#ffffff', 0.82);
        const panelBorder = dark ? rgba($params.primaryColor, 0.18) : rgba($params.secondaryColor, 0.24);
        const trackBg = dark ? rgba($params.primaryColor, 0.08) : rgba($params.secondaryColor, 0.12);
        const scrollTrack = dark ? rgba($params.primaryColor, 0.08) : rgba($params.secondaryColor, 0.08);
        const scrollThumb = dark ? rgba($params.primaryColor, 0.34) : rgba($params.secondaryColor, 0.34);
        const scrollThumbSoft = dark ? rgba($params.secondaryColor, 0.22) : rgba($params.primaryColor, 0.22);

        return [
            `--ui-bg:${$params.backgroundColor}`,
            `--ui-text:${text}`,
            `--ui-muted:${muted}`,
            `--ui-panel-bg:${panelBg}`,
            `--ui-panel-border:${panelBorder}`,
            `--ui-track-bg:${trackBg}`,
            `--ui-accent:${$params.primaryColor}`,
            `--ui-accent-soft:${$params.secondaryColor}`,
            `--ui-scroll-track:${scrollTrack}`,
            `--ui-scroll-thumb:${scrollThumb}`,
            `--ui-scroll-thumb-soft:${scrollThumbSoft}`
        ].join('; ');
    });
    
    onDestroy(() => {
        cleanupAudio();
        cleanupPlaylist();
    });
</script>

<div class="visualizer" style={themeVars}>
    {#if $params.displayMode === 'sphere'}
        <Canvas>
            <Scene />
        </Canvas>
    {/if}
    <ImpactOverlay />
    {#if $params.displayMode === 'waveform'}
        <Waveform />
    {:else if $params.displayMode === 'nebula'}
        <NebulaField />
    {/if}
    <Sidebar />
    <LiveEditor />
    <PlayerUI />
</div>

<style>
    .visualizer {
        width: 100vw;
        height: 100vh;
        background: linear-gradient(180deg, color-mix(in srgb, var(--ui-bg) 92%, #000 8%), var(--ui-bg));
        overflow: hidden;
        position: relative;
        color: var(--ui-text);
    }
    
    :global(canvas) {
        display: block;
        background: transparent !important;
    }
</style>
