<script lang="ts">
    import { Canvas } from '@threlte/core';
    import Scene from './Scene.svelte';
    import PlayerUI from './PlayerUI.svelte';
    import Sidebar from './Sidebar.svelte';
    import LiveEditor from './LiveEditor.svelte';
    import Waveform from './Waveform.svelte';
    import NebulaField from './NebulaField.svelte';
    import CoverArt from './CoverArt.svelte';
    import ImpactOverlay from './ImpactOverlay.svelte';
    import ZoomControl from './ZoomControl.svelte';
    import { onDestroy } from 'svelte';
    import { cleanup as cleanupAudio } from '$lib/stores/audioEngine';
    import { cleanup as cleanupPlaylist } from '$lib/stores/playlistStore';
    import { params, sharedCameraZoom } from '$lib/stores/params';

    function handleCanvasWheel(e: WheelEvent) {
        if (!$params.cameraEnableZoom) return;
        
        e.preventDefault();
        const step = 0.05;
        sharedCameraZoom.update(z => {
            const next = z + (e.deltaY < 0 ? step : -step);
            return Math.max(0.1, Math.min(30.0, next));
        });
    }

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
        const dark = $params.uiThemeMode === 'dark';
        const text = dark ? '#f6f6f6' : '#0e0e0e';
        const muted = dark ? rgba($params.uiSecondaryColor, 0.7) : rgba($params.uiSecondaryColor, 0.82);
        const panelBg = $params.uiBackgroundColor;
        const panelBorder = dark ? rgba($params.uiPrimaryColor, 0.18) : rgba($params.uiSecondaryColor, 0.24);
        const trackBg = dark ? rgba($params.uiPrimaryColor, 0.08) : rgba($params.uiSecondaryColor, 0.12);
        const scrollTrack = dark ? rgba($params.uiPrimaryColor, 0.08) : rgba($params.uiSecondaryColor, 0.08);
        const scrollThumb = dark ? rgba($params.uiPrimaryColor, 0.34) : rgba($params.uiSecondaryColor, 0.34);
        const scrollThumbSoft = dark ? rgba($params.uiSecondaryColor, 0.22) : rgba($params.uiPrimaryColor, 0.22);

        return [
            `--ui-bg:${$params.backgroundColor}`,
            `--ui-text:${text}`,
            `--ui-editor-text:#f0f0f0`,
            `--ui-muted:${muted}`,
            `--ui-panel-bg:${panelBg}`,
            `--ui-panel-border:${panelBorder}`,
            `--ui-track-bg:${trackBg}`,
            `--ui-accent:${$params.uiPrimaryColor}`,
            `--ui-accent-soft:${$params.uiSecondaryColor}`,
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
    {#if $params.displayMode === 'sphere' || $params.displayMode === 'tunnel' || $params.displayMode === 'cover'}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div style="position:absolute;inset:0;touch-action:none;" onwheel={handleCanvasWheel}>
            <Canvas>
                <Scene />
                {#if $params.displayMode === 'cover'}
                    <CoverArt />
                {/if}
            </Canvas>
        </div>
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
    {#if $params.displayMode !== 'waveform' && $params.displayMode !== 'nebula'}
        <ZoomControl />
    {/if}
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
