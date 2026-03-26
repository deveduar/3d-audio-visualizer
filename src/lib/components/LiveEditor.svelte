<script lang="ts">
    import { onMount } from 'svelte';
    import { Pane, type FolderApi } from 'tweakpane';
    import {
        params,
        type DisplayMode,
        type GeometryType,
        type WaveformStyle,
        defaultVisualParams,
        getPresetNames,
        savePreset,
        loadPreset,
        deletePreset,
        exportPresets,
        importPresets,
        resetParams
    } from '$lib/stores/params';
    import { dbLevel, lufs } from '$lib/stores/playlistStore';

    type EditorPane = FolderApi & {
        refresh: () => void;
        dispose: () => void;
    };

    let container: HTMLDivElement;
    let importInput: HTMLInputElement;
    let pane: EditorPane | null = null;
    let dbValue = $state('-60.0');
    let lufsValue = $state('-60.0');
    let presetNames = $state<string[]>(getPresetNames());

    const localParams = $state({
        displayMode: 'sphere' as DisplayMode,
        geometryType: 'icosahedron' as GeometryType,
        waveformStyle: 'line' as WaveformStyle,
        noiseFreq: 0.1,
        noiseAmp: 15,
        noiseSpeed: 0.6,
        baseRadius: 20,
        wireframeOpacity: 1.0,
        bloomStrength: 0.5,
        bloomRadius: 0.5,
        bloomThreshold: 0.2,
        showMeters: true
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
                options: {
                    Sphere: 'sphere',
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

        const audioFolder = editorPane.addFolder({ title: 'AUDIO' });
        audioFolder
            .addBinding(localParams, 'showMeters', {
                label: 'meters'
            })
            .on('change', syncToStore);

        const postFolder = editorPane.addFolder({ title: 'POST' });
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
        Object.assign(localParams, defaultVisualParams);
        presetState.selectedPreset = 'default';
        presetState.presetName = 'default';
        rebuildPane();
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
            localParams.waveformStyle = p.waveformStyle;
            localParams.noiseFreq = p.noiseFreq;
            localParams.noiseAmp = p.noiseAmp;
            localParams.noiseSpeed = p.noiseSpeed;
            localParams.baseRadius = p.baseRadius;
            localParams.wireframeOpacity = p.wireframeOpacity;
            localParams.bloomStrength = p.bloomStrength;
            localParams.bloomRadius = p.bloomRadius;
            localParams.bloomThreshold = p.bloomThreshold;
            localParams.showMeters = p.showMeters;
            refreshPane();
        });

        const unsubDb = dbLevel.subscribe((value) => {
            dbValue = value.toFixed(1);
        });

        const unsubLufs = lufs.subscribe((value) => {
            lufsValue = value.toFixed(1);
        });

        refreshPresetNames();
        rebuildPane();

        return () => {
            unsubParams();
            unsubDb();
            unsubLufs();
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
    <input bind:this={importInput} type="file" accept="application/json" onchange={handleImportPresets} hidden />
</div>

<style>
    .editor-shell {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 300;
        display: grid;
        gap: 12px;
    }

    :global(.tp-dfwv) {
        width: 300px !important;
    }

    :global(.tp-lblv_l),
    :global(.tp-valtxt),
    :global(.tp-fldv_t),
    :global(.tp-btnv_t) {
        font-family: 'Courier New', monospace !important;
    }

    .meters-panel {
        width: 300px;
        padding: 12px 14px;
        background: rgba(0, 0, 0, 0.82);
        border: 1px solid rgba(255, 255, 255, 0.18);
        backdrop-filter: blur(12px);
        color: #fff;
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
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.14);
        overflow: hidden;
    }

    .meter-fill {
        height: 100%;
        background: linear-gradient(90deg, #fff 0%, rgba(255, 255, 255, 0.45) 100%);
    }
</style>
