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
        type NebulaVariant,
        type GridRender,
        type TunnelVariant,
        type VisualParams,
        resetCameraView,
        defaultVisualParams,
        getPresetNames,
        savePreset,
        loadPreset,
        deletePreset,
        exportPresets,
        importPresets,
        resetParams,
        getThemePalette,
        sharedCameraZoom
    } from '$lib/stores/params';
    import { bass, dbLevel, lufs, mid, transient, treble, sidebarOpen } from '$lib/stores/playlistStore';
    import { get } from 'svelte/store';

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

    let localParams = $state<VisualParams>(defaultVisualParams);

    const presetState = $state({
        selectedPreset: 'default',
        presetName: 'custom'
    });

    function syncToStore() {
        // General sync for all params
        params.set({ ...localParams });
    }

    const zoomProxy = {
        get level() { return get(sharedCameraZoom); },
        set level(v) { sharedCameraZoom.set(v); }
    };

    $effect(() => {
        // Trigger Tweakpane refresh when zoom updates externally
        const _z = $sharedCameraZoom;
        if (pane) pane.refresh();
    });

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

    function applyUIThemePreset(preset: ThemePreset) {
        const palette = getThemePalette(preset);
        localParams.uiThemePreset = preset;
        localParams.uiThemeMode = palette.themeMode;
        localParams.uiPrimaryColor = palette.primaryColor;
        localParams.uiSecondaryColor = palette.secondaryColor;
        localParams.uiBackgroundColor = palette.backgroundColor;
    }

    function rebuildPane() {
        try {
            pane?.dispose();
        } catch (err) {
            console.warn('Tweakpane dispose warning:', err);
        }

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
                        Waveform: 'waveform',
                        Nebula: 'nebula',
                        Grid: 'tunnel'
                    }
                })
            .on('change', () => {
                syncToStore();
                setTimeout(() => rebuildPane(), 0);
            });

        if (localParams.displayMode === 'sphere') {
            viewFolder
                .addBinding(localParams, 'geometryType', {
                    options: {
                        Icosa: 'icosahedron',
                        Sphere: 'sphere',
                        Torus: 'torus',
                        Cube: 'cube',
                        Dodeca: 'dodecahedron',
                        Cone: 'cone',
                        Cylinder: 'cylinder'
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
                .on('change', syncToStore)
                .on('change', () => {
                    setTimeout(() => rebuildPane(), 0);
                });
        } else if (localParams.displayMode === 'waveform') {
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

        const interfaceFolder = editorPane.addFolder({ title: 'INTERFACE' });
        interfaceFolder
            .addBinding(localParams, 'uiThemePreset', {
                label: 'theme-ui',
                options: {
                    Mono: 'mono',
                    Sunset: 'sunset',
                    Ice: 'ice',
                    Acid: 'acid'
                }
            })
            .on('change', (event: TpChangeEvent<ThemePreset>) => {
                applyUIThemePreset(event.value as ThemePreset);
                syncToStore();
                refreshPane();
            });
        interfaceFolder
            .addBinding(localParams, 'uiThemeMode', {
                label: 'mode-ui',
                options: {
                    Dark: 'dark',
                    Light: 'light'
                }
            })
            .on('change', syncToStore);
        interfaceFolder
            .addBinding(localParams, 'uiPrimaryColor', {
                label: 'primary-ui',
                view: 'color'
            })
            .on('change', syncToStore);
        interfaceFolder
            .addBinding(localParams, 'uiSecondaryColor', {
                label: 'secondary-ui',
                view: 'color'
            })
            .on('change', syncToStore);
        interfaceFolder
            .addBinding(localParams, 'uiBackgroundColor', {
                label: 'background-ui',
                view: 'color'
            })
            .on('change', syncToStore);
        interfaceFolder
            .addBinding(localParams, 'showMeters', {
                label: 'meters'
            })
            .on('change', syncToStore);
        interfaceFolder
            .addBinding(localParams, 'showBands', {
                label: 'bands'
            })
            .on('change', syncToStore);
        interfaceFolder
            .addBinding(localParams, 'showZoomControl', {
                label: 'zoom UI'
            })
            .on('change', syncToStore);
        const settingsFolder = editorPane.addFolder({ title: 'VISUALS' });
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
        settingsFolder
            .addBinding(localParams, 'audioReactAmount', { label: 'audio react', min: 0, max: 2, step: 0.05 })
            .on('change', syncToStore);

        if (localParams.displayMode === 'nebula') {
            const nebulaFolder = editorPane.addFolder({ title: 'NEBULA' });
            nebulaFolder
                .addBinding(localParams, 'nebulaVariant', {
                    label: 'mode',
                    options: {
                        Cloud: 'cloud',
                        Vortex: 'vortex',
                        Ribbons: 'ribbons'
                    }
                })
                .on('change', syncToStore);
            nebulaFolder
                .addBinding(localParams, 'nebulaDensity', { label: 'density', min: 0.1, max: 1.4, step: 0.01 })
                .on('change', syncToStore);
            nebulaFolder
                .addBinding(localParams, 'nebulaFlow', { label: 'flow', min: 0, max: 1.4, step: 0.01 })
                .on('change', syncToStore);
            nebulaFolder
                .addBinding(localParams, 'nebulaDrift', { label: 'drift', min: 0, max: 1.6, step: 0.01 })
                .on('change', syncToStore);
            nebulaFolder
                .addBinding(localParams, 'nebulaPulse', { label: 'pulse', min: 0, max: 1.5, step: 0.01 })
                .on('change', syncToStore);
            nebulaFolder
                .addBinding(localParams, 'nebulaSpread', { label: 'spread', min: 0, max: 1.4, step: 0.01 })
                .on('change', syncToStore);
            nebulaFolder.addBinding(localParams, 'noiseSpeed', { label: 'speed', min: 0.05, max: 1.4, step: 0.05 }).on('change', syncToStore);
            nebulaFolder.addBinding(localParams, 'noiseAmp', { label: 'gain', min: 0, max: 40, step: 1 }).on('change', syncToStore);
            nebulaFolder
                .addBinding(localParams, 'wireframeOpacity', { label: 'opacity', min: 0.1, max: 1, step: 0.05 })
                .on('change', syncToStore);
        } else if (localParams.displayMode === 'tunnel') {
            const tunnelFolder = editorPane.addFolder({ title: 'GRID WARP' });
            tunnelFolder
                .addBinding(localParams, 'tunnelVariant', {
                    label: 'mode',
                    options: {
                        Plane: 'rings',
                        Drift: 'helix',
                        Scan: 'pulse'
                    }
                })
                .on('change', syncToStore);
            tunnelFolder
                .addBinding(localParams, 'gridRender', {
                    label: 'render',
                    options: {
                        Lines: 'lines',
                        Points: 'points',
                        Bars: 'bars'
                    }
                })
                .on('change', syncToStore);
            tunnelFolder
                .addBinding(localParams, 'tunnelDensity', { label: 'density', min: 0.2, max: 1.4, step: 0.01 })
                .on('change', syncToStore);
            tunnelFolder
                .addBinding(localParams, 'tunnelSpeed', { label: 'speed', min: 0.1, max: 1.8, step: 0.01 })
                .on('change', syncToStore);
            tunnelFolder
                .addBinding(localParams, 'tunnelTwist', { label: 'twist', min: 0, max: 1.4, step: 0.01 })
                .on('change', syncToStore);
            tunnelFolder
                .addBinding(localParams, 'tunnelPulse', { label: 'pulse', min: 0, max: 1.5, step: 0.01 })
                .on('change', syncToStore);
            tunnelFolder
                .addBinding(localParams, 'noiseFreq', { label: 'drift', min: 0, max: 0.4, step: 0.01 })
                .on('change', syncToStore);
            tunnelFolder
                .addBinding(localParams, 'noiseSpeed', { label: 'drive', min: 0.1, max: 2.4, step: 0.05 })
                .on('change', syncToStore);
            tunnelFolder
                .addBinding(localParams, 'noiseAmp', { label: 'glow', min: 0, max: 40, step: 1 })
                .on('change', syncToStore);
            tunnelFolder
                .addBinding(localParams, 'wireframeOpacity', { label: 'opacity', min: 0.1, max: 1, step: 0.05 })
                .on('change', syncToStore);
        } else {
            const geomFolder = editorPane.addFolder({ title: 'GEOMETRY' });
            geomFolder.addBinding(localParams, 'noiseFreq', { min: 0.01, max: 0.5, step: 0.01 }).on('change', syncToStore);
            geomFolder.addBinding(localParams, 'noiseAmp', { min: 0, max: 50, step: 1 }).on('change', syncToStore);
            geomFolder.addBinding(localParams, 'noiseSpeed', { min: 0.1, max: 2, step: 0.1 }).on('change', syncToStore);
            geomFolder.addBinding(localParams, 'geometryBounce', { label: 'bounce', min: 0, max: 5, step: 0.05 }).on('change', syncToStore);
            geomFolder.addBinding(localParams, 'autoRotate', { label: 'auto-rotate' }).on('change', syncToStore);

            if (localParams.displayMode === 'sphere') {
                geomFolder.addBinding(localParams, 'baseRadius', { min: 8, max: 36, step: 1 }).on('change', syncToStore);

                if (localParams.renderMode === 'solid') {
                    geomFolder
                        .addBinding(localParams, 'solidOpacity', {
                            label: 'solid opacity',
                            min: 0.1,
                            max: 1.0,
                            step: 0.05
                        })
                        .on('change', syncToStore);

                    geomFolder
                        .addBinding(localParams, 'solidBackfaceCulling', { label: 'solid culling' })
                        .on('change', syncToStore);
                }
            }

            if (localParams.renderMode === 'wireframe') {
                geomFolder
                    .addBinding(localParams, 'wireframeOpacity', { min: 0.1, max: 1, step: 0.05 })
                    .on('change', syncToStore);
            }
        }
        if (localParams.displayMode === 'sphere') {
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
                .addBinding(localParams, 'cameraReactiveAmount', { label: 'reactive', min: 0, max: 6, step: 0.1 })
                .on('change', syncToStore);
            cameraFolder
                .addBinding(localParams, 'cameraDamping', { label: 'damping', min: 0.02, max: 0.9, step: 0.01 })
            cameraFolder
                .addBinding(localParams, 'cameraEnableZoom', { label: 'enable zoom' })
                .on('change', syncToStore);
            cameraFolder
                .addBinding(zoomProxy, 'level', { label: 'zoom', min: 0.1, max: 20.0, step: 0.1 })
                .on('change', () => pane?.refresh());
            cameraFolder
                .addBinding(localParams, 'cameraEnablePan', { label: 'pan' })
                .on('change', syncToStore);
            cameraFolder.addButton({ title: 'RESET CAMERA' }).on('click', handleResetCamera);
        }


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
            localParams.nebulaVariant = p.nebulaVariant;
            localParams.nebulaDensity = p.nebulaDensity;
            localParams.nebulaFlow = p.nebulaFlow;
            localParams.nebulaDrift = p.nebulaDrift;
            localParams.nebulaPulse = p.nebulaPulse;
            localParams.nebulaSpread = p.nebulaSpread;
            localParams.tunnelVariant = p.tunnelVariant;
            localParams.gridRender = p.gridRender;
            localParams.tunnelDensity = p.tunnelDensity;
            localParams.tunnelSpeed = p.tunnelSpeed;
            localParams.tunnelTwist = p.tunnelTwist;
            localParams.tunnelPulse = p.tunnelPulse;
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
            localParams.audioReactAmount = p.audioReactAmount;
            localParams.geometryBounce = p.geometryBounce;
            localParams.autoRotate = p.autoRotate;
            localParams.solidOpacity = p.solidOpacity;
            localParams.solidBackfaceCulling = p.solidBackfaceCulling;
            localParams.uiThemeMode = p.uiThemeMode;
            localParams.uiThemePreset = p.uiThemePreset;
            localParams.uiPrimaryColor = p.uiPrimaryColor;
            localParams.uiSecondaryColor = p.uiSecondaryColor;
            localParams.uiBackgroundColor = p.uiBackgroundColor;
            // No rebuild on every params update to avoid disposing the active view repeatedly
            // refreshPane();
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

<div class="editor-shell" class:sidebar-open={$sidebarOpen}>
    <div class="editor-scroll">
        <div class="editor" bind:this={container}></div>
    </div>
    {#if localParams.showMeters}
        <div class="meters-panel" class:sidebar-open={$sidebarOpen}>
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
        <div class="band-panel" class:sidebar-open={$sidebarOpen}>
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
        bottom: 132px;
        z-index: 300;
        width: 320px;
        max-height: calc(100vh - 172px);
        overflow: hidden;
        pointer-events: none;
    }

    .editor {
        pointer-events: auto;
        min-height: 100%;
    }

    .editor-scroll {
        height: 100%;
        max-height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        pointer-events: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--ui-scroll-thumb) var(--ui-scroll-track);
    }

    .editor-scroll::-webkit-scrollbar {
        width: 10px;
    }

    .editor-scroll::-webkit-scrollbar-track {
        background: var(--ui-scroll-track);
    }

    .editor-scroll::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, var(--ui-scroll-thumb), var(--ui-scroll-thumb-soft));
        border-radius: 999px;
        border: 2px solid transparent;
    }

    :global(.tp-dfwv) {
        width: 300px !important;
        max-height: none;
        height: auto;
        overflow: visible !important;
        box-sizing: border-box;
        background: var(--ui-panel-bg) !important;
        border: 1px solid var(--ui-panel-border);
        color: var(--ui-editor-text) !important;
        scrollbar-width: thin;
        scrollbar-color: var(--ui-scroll-thumb) var(--ui-scroll-track);
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
        color: var(--ui-editor-text) !important;
    }

    .meters-panel {
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 70;
        width: 300px;
        padding: 12px 14px;
        background: var(--ui-panel-bg);
        border: 1px solid var(--ui-panel-border);
        backdrop-filter: blur(12px);
        color: var(--ui-text);
        font-family: 'Courier New', monospace;
        transition: left 0.3s ease;
    }

    .meters-panel.sidebar-open {
        left: 316px;
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
        left: 20px;
        z-index: 70;
        width: 300px;
        padding: 12px 14px;
        background: var(--ui-panel-bg);
        border: 1px solid var(--ui-panel-border);
        backdrop-filter: blur(12px);
        color: var(--ui-text);
        font-family: 'Courier New', monospace;
        transition: left 0.3s ease;
    }

    .band-panel.sidebar-open {
        left: 316px;
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

    @media (max-width: 1280px) {
        .editor-shell {
            top: 16px;
            right: 16px;
            bottom: 182px;
            width: 300px;
            max-height: calc(100vh - 214px);
            overflow: hidden;
        }

        :global(.tp-dfwv) {
            max-height: 100%;
            height: 100%;
            overflow-y: auto !important;
        }

        .editor-shell.sidebar-open {
            z-index: 60;
        }

        .editor-shell.sidebar-open .editor {
            pointer-events: none;
        }

        .editor-shell.sidebar-open .editor-scroll {
            pointer-events: none;
        }

        .meters-panel,
        .band-panel {
            position: absolute;
            right: 0;
            left: auto;
            width: 300px;
        }

        .meters-panel,
        .meters-panel.sidebar-open {
            top: calc(100% + 12px);
            left: auto;
        }

        .band-panel,
        .band-panel.sidebar-open {
            top: calc(100% + 112px);
            left: auto;
        }
    }
</style>
