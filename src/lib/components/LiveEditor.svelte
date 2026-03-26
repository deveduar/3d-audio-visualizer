<script lang="ts">
    import { onMount } from 'svelte';
    import { Pane, type FolderApi, type TpChangeEvent } from 'tweakpane';
    import {
        params,
        type DisplayMode,
        type CameraMode,
        type GeometryType,
        type RenderMode,
        type ThemeMode,
        type ThemePreset,
        type WaveformStyle,
        resetCameraView,
        defaultVisualParams,
        getPresetNames,
        savePreset,
        loadPreset,
        deletePreset,
        exportPresets,
        importPresets,
        resetParams,
        getThemePalette
    } from '$lib/stores/params';
    import { bass, dbLevel, lufs, mid, transient, treble } from '$lib/stores/playlistStore';

    type EditorPane = FolderApi & {
        refresh: () => void;
        dispose: () => void;
    };

    let container: HTMLDivElement;
    let importInput: HTMLInputElement;
    let pane: EditorPane | null = null;
    let dbValue = $state('-60.0');
    let lufsValue = $state('-60.0');
    let bassValue = $state(0);
    let midValue = $state(0);
    let trebleValue = $state(0);
    let transientValue = $state(0);
    let presetNames = $state<string[]>(getPresetNames());

    const localParams = $state({
        displayMode: 'sphere' as DisplayMode,
        geometryType: 'icosahedron' as GeometryType,
        renderMode: 'wireframe' as RenderMode,
        waveformStyle: 'line' as WaveformStyle,
        cameraMode: 'orbit-reactive' as CameraMode,
        cameraDistance: 80,
        cameraReactiveAmount: 0.7,
        cameraDamping: 0.1,
        cameraEnableZoom: false,
        cameraEnablePan: false,
        themeMode: 'dark' as ThemeMode,
        themePreset: 'mono' as ThemePreset,
        primaryColor: '#ffffff',
        secondaryColor: '#9f9f9f',
        backgroundColor: '#000000',
        noiseFreq: 0.1,
        noiseAmp: 15,
        noiseSpeed: 0.6,
        baseRadius: 20,
        wireframeOpacity: 1.0,
        postEnabled: true,
        bloomStrength: 0.5,
        bloomRadius: 0.5,
        bloomThreshold: 0.2,
        showMeters: true,
        showBands: true,
        showImpactOverlay: true,
        showOverlayLines: true,
        impactSensitivity: 0.08,
        impactFlash: 0.9,
        impactFrame: 1
    });

    const presetState = $state({
        selectedPreset: 'default',
        presetName: 'custom'
    });

    function syncToStore() {
        params.set({ ...localParams });
    }

    function refreshPresetNames(preferred?: string) {
        presetNames = getPresetNames();
        if (preferred && presetNames.includes(preferred)) {
            presetState.selectedPreset = preferred;
        } else if (!presetNames.includes(presetState.selectedPreset)) {
            presetState.selectedPreset = presetNames[0] ?? 'default';
        }
    }

    function refreshPane() {
        pane?.refresh();
    }

    function applyThemePreset(preset: ThemePreset) {
        const palette = getThemePalette(preset);
        localParams.themePreset = preset;
        localParams.themeMode = palette.themeMode;
        localParams.primaryColor = palette.primaryColor;
        localParams.secondaryColor = palette.secondaryColor;
        localParams.backgroundColor = palette.backgroundColor;
    }

    function rebuildPane() {
        pane?.dispose();

        const editorPane = new Pane({
            container,
            title: 'LIVE EDITOR'
        }) as unknown as EditorPane;
        pane = editorPane;

        const viewFolder = editorPane.addFolder({ title: 'VIEW' });
        viewFolder
            .addBinding(localParams, 'displayMode', {
                label: 'mode',
                options: {
                    Geometry: 'sphere',
                    Waveform: 'waveform'
                }
            })
            .on('change', () => {
                syncToStore();
                rebuildPane();
            });

        if (localParams.displayMode === 'sphere') {
            viewFolder
                .addBinding(localParams, 'geometryType', {
                    options: {
                        Icosa: 'icosahedron',
                        Sphere: 'sphere',
                        Torus: 'torus',
                        Cube: 'cube'
                    }
                })
                .on('change', syncToStore);

            viewFolder
                .addBinding(localParams, 'renderMode', {
                    label: 'render',
                    options: {
                        Wire: 'wireframe',
                        Solid: 'solid'
                    }
                })
                .on('change', syncToStore);
        } else {
            viewFolder
                .addBinding(localParams, 'waveformStyle', {
                    label: 'style',
                    options: {
                        Line: 'line',
                        Bars: 'bars',
                        Mirror: 'mirror'
                    }
                })
                .on('change', syncToStore);
        }

        const settingsFolder = editorPane.addFolder({ title: 'SETTINGS' });
        settingsFolder
            .addBinding(localParams, 'themePreset', {
                label: 'theme',
                options: {
                    Mono: 'mono',
                    Sunset: 'sunset',
                    Ice: 'ice',
                    Acid: 'acid'
                }
            })
            .on('change', (event: TpChangeEvent<ThemePreset>) => {
                applyThemePreset(event.value as ThemePreset);
                syncToStore();
                refreshPane();
            });
        settingsFolder
            .addBinding(localParams, 'themeMode', {
                label: 'mode',
                options: {
                    Dark: 'dark',
                    Light: 'light'
                }
            })
            .on('change', syncToStore);
        settingsFolder
            .addBinding(localParams, 'primaryColor', {
                label: 'primary',
                view: 'color'
            })
            .on('change', syncToStore);
        settingsFolder
            .addBinding(localParams, 'secondaryColor', {
                label: 'secondary',
                view: 'color'
            })
            .on('change', syncToStore);
        settingsFolder
            .addBinding(localParams, 'backgroundColor', {
                label: 'background',
                view: 'color'
            })
            .on('change', syncToStore);

        const geomFolder = editorPane.addFolder({ title: 'GEOMETRY' });
        geomFolder.addBinding(localParams, 'noiseFreq', { min: 0.01, max: 0.5, step: 0.01 }).on('change', syncToStore);
        geomFolder.addBinding(localParams, 'noiseAmp', { min: 0, max: 50, step: 1 }).on('change', syncToStore);
        geomFolder.addBinding(localParams, 'noiseSpeed', { min: 0.1, max: 2, step: 0.1 }).on('change', syncToStore);

        if (localParams.displayMode === 'sphere') {
            geomFolder.addBinding(localParams, 'baseRadius', { min: 8, max: 36, step: 1 }).on('change', syncToStore);
        }

        geomFolder
            .addBinding(localParams, 'wireframeOpacity', { min: 0.1, max: 1, step: 0.05 })
            .on('change', syncToStore);

        const cameraFolder = editorPane.addFolder({ title: 'CAMERA' });
        cameraFolder
            .addBinding(localParams, 'cameraMode', {
                label: 'mode',
                options: {
                    Locked: 'locked',
                    Orbit: 'orbit',
                    Reactive: 'reactive',
                    'Orbit+React': 'orbit-reactive'
                }
            })
            .on('change', syncToStore);
        cameraFolder
            .addBinding(localParams, 'cameraDistance', { label: 'distance', min: 50, max: 400, step: 1 })
            .on('change', syncToStore);
        cameraFolder
            .addBinding(localParams, 'cameraReactiveAmount', { label: 'reactive', min: 0, max: 6, step: 0.1 })
            .on('change', syncToStore);
        cameraFolder
            .addBinding(localParams, 'cameraDamping', { label: 'damping', min: 0.02, max: 0.9, step: 0.01 })
            .on('change', syncToStore);
        cameraFolder
            .addBinding(localParams, 'cameraEnableZoom', { label: 'zoom' })
            .on('change', syncToStore);
        cameraFolder
            .addBinding(localParams, 'cameraEnablePan', { label: 'pan' })
            .on('change', syncToStore);
        cameraFolder.addButton({ title: 'RESET CAMERA' }).on('click', handleResetCamera);

        const audioFolder = editorPane.addFolder({ title: 'AUDIO' });
        audioFolder
            .addBinding(localParams, 'showMeters', {
                label: 'meters'
            })
            .on('change', syncToStore);
        audioFolder
            .addBinding(localParams, 'showBands', {
                label: 'bands'
            })
            .on('change', syncToStore);

        const overlayFolder = editorPane.addFolder({ title: 'OVERLAY' });
        overlayFolder
            .addBinding(localParams, 'showImpactOverlay', {
                label: 'overlay'
            })
            .on('change', syncToStore);
        overlayFolder
            .addBinding(localParams, 'showOverlayLines', {
                label: 'lines'
            })
            .on('change', syncToStore);
        overlayFolder
            .addBinding(localParams, 'impactSensitivity', { label: 'threshold', min: 0.02, max: 0.6, step: 0.01 })
            .on('change', syncToStore);
        overlayFolder
            .addBinding(localParams, 'impactFlash', { label: 'flash', min: 0.2, max: 1.5, step: 0.05 })
            .on('change', syncToStore);
        overlayFolder
            .addBinding(localParams, 'impactFrame', { label: 'lines', min: 0.2, max: 2.5, step: 0.05 })
            .on('change', syncToStore);

        const postFolder = editorPane.addFolder({ title: 'POST' });
        postFolder.addBinding(localParams, 'postEnabled', { label: 'enabled' }).on('change', syncToStore);
        postFolder.addBinding(localParams, 'bloomStrength', { min: 0, max: 2, step: 0.1 }).on('change', syncToStore);
        postFolder.addBinding(localParams, 'bloomRadius', { min: 0, max: 1, step: 0.1 }).on('change', syncToStore);
        postFolder.addBinding(localParams, 'bloomThreshold', { min: 0, max: 1, step: 0.1 }).on('change', syncToStore);

        const presetFolder = editorPane.addFolder({ title: 'PRESETS' });
        presetFolder.addBinding(presetState, 'selectedPreset', {
            label: 'preset',
            options: Object.fromEntries(presetNames.map((name) => [name, name]))
        });
        presetFolder.addBinding(presetState, 'presetName', { label: 'name' });
        presetFolder.addButton({ title: 'APPLY' }).on('click', handleApplyPreset);
        presetFolder.addButton({ title: 'SAVE' }).on('click', handleSavePreset);
        presetFolder.addButton({ title: 'DELETE' }).on('click', handleDeletePreset);
        presetFolder.addButton({ title: 'RESET' }).on('click', handleResetParams);
        presetFolder.addButton({ title: 'EXPORT JSON' }).on('click', handleExportPresets);
        presetFolder.addButton({ title: 'IMPORT JSON' }).on('click', () => importInput?.click());

        refreshPane();
    }

    function handleApplyPreset() {
        const loaded = loadPreset(presetState.selectedPreset);
        if (loaded) {
            presetState.presetName = presetState.selectedPreset;
            Object.assign(localParams, loaded);
            rebuildPane();
        }
    }

    function handleSavePreset() {
        savePreset(presetState.presetName);
        const normalized = presetState.presetName.trim().toLowerCase().replace(/\s+/g, '_');
        refreshPresetNames(normalized);
        rebuildPane();
    }

    function handleDeletePreset() {
        deletePreset(presetState.selectedPreset);
        refreshPresetNames();
        rebuildPane();
    }

    function handleResetParams() {
        resetParams();
        resetCameraView();
        Object.assign(localParams, defaultVisualParams);
        presetState.selectedPreset = 'default';
        presetState.presetName = 'default';
        rebuildPane();
    }

    function handleResetCamera() {
        localParams.cameraMode = defaultVisualParams.cameraMode;
        localParams.cameraDistance = defaultVisualParams.cameraDistance;
        localParams.cameraReactiveAmount = defaultVisualParams.cameraReactiveAmount;
        localParams.cameraDamping = defaultVisualParams.cameraDamping;
        localParams.cameraEnableZoom = defaultVisualParams.cameraEnableZoom;
        localParams.cameraEnablePan = defaultVisualParams.cameraEnablePan;
        syncToStore();
        resetCameraView();
        refreshPane();
    }

    function handleExportPresets() {
        const blob = new Blob([exportPresets()], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'visualizer-presets.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    async function handleImportPresets(e: Event) {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            importPresets(text);
            refreshPresetNames();
            rebuildPane();
        } catch (error) {
            console.error('Preset import error:', error);
        }

        target.value = '';
    }

    onMount(() => {
        const unsubParams = params.subscribe((p) => {
            localParams.displayMode = p.displayMode;
            localParams.geometryType = p.geometryType;
            localParams.renderMode = p.renderMode;
            localParams.waveformStyle = p.waveformStyle;
            localParams.cameraMode = p.cameraMode;
            localParams.cameraDistance = p.cameraDistance;
            localParams.cameraReactiveAmount = p.cameraReactiveAmount;
            localParams.cameraDamping = p.cameraDamping;
            localParams.cameraEnableZoom = p.cameraEnableZoom;
            localParams.cameraEnablePan = p.cameraEnablePan;
            localParams.themeMode = p.themeMode;
            localParams.themePreset = p.themePreset;
            localParams.primaryColor = p.primaryColor;
            localParams.secondaryColor = p.secondaryColor;
            localParams.backgroundColor = p.backgroundColor;
            localParams.noiseFreq = p.noiseFreq;
            localParams.noiseAmp = p.noiseAmp;
            localParams.noiseSpeed = p.noiseSpeed;
            localParams.baseRadius = p.baseRadius;
            localParams.wireframeOpacity = p.wireframeOpacity;
            localParams.postEnabled = p.postEnabled;
            localParams.bloomStrength = p.bloomStrength;
            localParams.bloomRadius = p.bloomRadius;
            localParams.bloomThreshold = p.bloomThreshold;
            localParams.showMeters = p.showMeters;
            localParams.showBands = p.showBands;
            localParams.showImpactOverlay = p.showImpactOverlay;
            localParams.showOverlayLines = p.showOverlayLines;
            localParams.impactSensitivity = p.impactSensitivity;
            localParams.impactFlash = p.impactFlash;
            localParams.impactFrame = p.impactFrame;
            refreshPane();
        });

        const unsubDb = dbLevel.subscribe((value) => {
            dbValue = value.toFixed(1);
        });

        const unsubLufs = lufs.subscribe((value) => {
            lufsValue = value.toFixed(1);
        });

        const unsubBass = bass.subscribe((value) => {
            bassValue = value;
        });

        const unsubMid = mid.subscribe((value) => {
            midValue = value;
        });

        const unsubTreble = treble.subscribe((value) => {
            trebleValue = value;
        });

        const unsubTransient = transient.subscribe((value) => {
            transientValue = value;
        });

        refreshPresetNames();
        rebuildPane();

        return () => {
            unsubParams();
            unsubDb();
            unsubLufs();
            unsubBass();
            unsubMid();
            unsubTreble();
            unsubTransient();
            pane?.dispose();
        };
    });
</script>

<div class="editor-shell">
    <div class="editor" bind:this={container}></div>
    {#if localParams.showMeters}
        <div class="meters-panel">
            <div class="meter-row">
                <span class="meter-label">DB</span>
                <div class="meter-bar">
                    <div class="meter-fill" style={`width: ${Math.max(0, Math.min(100, ((Number(dbValue) + 60) / 60) * 100))}%`}></div>
                </div>
                <span class="meter-value">{dbValue}</span>
            </div>
            <div class="meter-row">
                <span class="meter-label">LUFS</span>
                <div class="meter-bar">
                    <div class="meter-fill" style={`width: ${Math.max(0, Math.min(100, ((Number(lufsValue) + 60) / 60) * 100))}%`}></div>
                </div>
                <span class="meter-value">{lufsValue}</span>
            </div>
        </div>
    {/if}
    {#if localParams.showBands}
        <div class="band-panel">
            <div class="band-row">
                <span class="band-label">BASS</span>
                <div class="band-bar"><div class="band-fill" style={`width: ${bassValue * 100}%`}></div></div>
                <span class="band-value">{Math.round(bassValue * 100)}</span>
            </div>
            <div class="band-row">
                <span class="band-label">MID</span>
                <div class="band-bar"><div class="band-fill" style={`width: ${midValue * 100}%`}></div></div>
                <span class="band-value">{Math.round(midValue * 100)}</span>
            </div>
            <div class="band-row">
                <span class="band-label">TREB</span>
                <div class="band-bar"><div class="band-fill" style={`width: ${trebleValue * 100}%`}></div></div>
                <span class="band-value">{Math.round(trebleValue * 100)}</span>
            </div>
            <div class="band-row transient-row">
                <span class="band-label">PEAK</span>
                <div class="band-bar"><div class="band-fill transient-fill" style={`width: ${transientValue * 100}%`}></div></div>
                <span class="band-value">{Math.round(transientValue * 100)}</span>
            </div>
        </div>
    {/if}
    <input bind:this={importInput} type="file" accept="application/json" onchange={handleImportPresets} hidden />
</div>

<style>
    .editor-shell {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 300;
        width: 320px;
    }

    :global(.tp-dfwv) {
        width: 300px !important;
        max-height: calc(100vh - 40px);
        overflow-y: auto;
        background: var(--ui-panel-bg) !important;
        border: 1px solid var(--ui-panel-border);
        color: var(--ui-text) !important;
        scrollbar-width: thin;
        scrollbar-color: var(--ui-scroll-thumb) var(--ui-scroll-track);
    }

    :global(.tp-rotv),
    :global(.tp-fldv),
    :global(.tp-lstv),
    :global(.tp-txtv),
    :global(.tp-btnv),
    :global(.tp-tabv) {
        background: transparent !important;
    }

    :global(.tp-dfwv::-webkit-scrollbar) {
        width: 10px;
    }

    :global(.tp-dfwv::-webkit-scrollbar-track) {
        background: var(--ui-scroll-track);
    }

    :global(.tp-dfwv::-webkit-scrollbar-thumb) {
        background: linear-gradient(180deg, var(--ui-scroll-thumb), var(--ui-scroll-thumb-soft));
        border-radius: 999px;
        border: 2px solid transparent;
    }

    :global(.tp-lblv_l),
    :global(.tp-valtxt),
    :global(.tp-fldv_t),
    :global(.tp-btnv_t) {
        font-family: 'Courier New', monospace !important;
        color: var(--ui-text) !important;
    }

    .meters-panel {
        position: fixed;
        top: 20px;
        left: 316px;
        z-index: 70;
        width: 300px;
        padding: 12px 14px;
        background: var(--ui-panel-bg);
        border: 1px solid var(--ui-panel-border);
        backdrop-filter: blur(12px);
        color: var(--ui-text);
        font-family: 'Courier New', monospace;
    }

    .meter-row {
        display: grid;
        grid-template-columns: 42px 1fr 48px;
        align-items: center;
        gap: 10px;
    }

    .meter-row + .meter-row {
        margin-top: 10px;
    }

    .meter-label,
    .meter-value {
        font-size: 12px;
        letter-spacing: 0.08em;
    }

    .meter-value {
        text-align: right;
    }

    .meter-bar {
        position: relative;
        height: 8px;
        background: var(--ui-track-bg);
        border: 1px solid var(--ui-panel-border);
        overflow: hidden;
    }

    .meter-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--ui-accent) 0%, var(--ui-accent-soft) 100%);
    }

    .band-panel {
        position: fixed;
        top: 118px;
        left: 316px;
        z-index: 70;
        width: 300px;
        padding: 12px 14px;
        background: var(--ui-panel-bg);
        border: 1px solid var(--ui-panel-border);
        backdrop-filter: blur(12px);
        color: var(--ui-text);
        font-family: 'Courier New', monospace;
    }

    .band-row {
        display: grid;
        grid-template-columns: 42px 1fr 38px;
        align-items: center;
        gap: 10px;
    }

    .band-row + .band-row {
        margin-top: 10px;
    }

    .band-label,
    .band-value {
        font-size: 12px;
        letter-spacing: 0.08em;
    }

    .band-value {
        text-align: right;
    }

    .band-bar {
        position: relative;
        height: 8px;
        background: var(--ui-track-bg);
        border: 1px solid var(--ui-panel-border);
        overflow: hidden;
    }

    .band-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--ui-accent-soft) 0%, var(--ui-accent) 100%);
    }

    .transient-fill {
        background: linear-gradient(90deg, color-mix(in srgb, var(--ui-accent-soft) 35%, transparent) 0%, var(--ui-accent) 100%);
    }
</style>
