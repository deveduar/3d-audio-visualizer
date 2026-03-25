<script lang="ts">
    import { onMount } from 'svelte';
    import { Pane } from 'tweakpane';
    import { params, type DisplayMode, type GeometryType } from '$lib/stores/params';
    import { dbLevel, lufs } from '$lib/stores/playlistStore';

    let container: HTMLDivElement;
    let pane: Pane | null = null;
    let dbValue = $state('-60.0');
    let lufsValue = $state('-60.0');

    const localParams = $state({
        displayMode: 'sphere' as DisplayMode,
        geometryType: 'icosahedron' as GeometryType,
        noiseFreq: 0.1,
        noiseAmp: 15,
        noiseSpeed: 0.6,
        baseRadius: 20,
        wireframeOpacity: 1.0,
        bloomStrength: 0.5,
        bloomRadius: 0.5,
        bloomThreshold: 0.2
    });

    onMount(() => {
        const unsubParams = params.subscribe((p) => {
            localParams.displayMode = p.displayMode;
            localParams.geometryType = p.geometryType;
            localParams.noiseFreq = p.noiseFreq;
            localParams.noiseAmp = p.noiseAmp;
            localParams.noiseSpeed = p.noiseSpeed;
            localParams.baseRadius = p.baseRadius;
            localParams.wireframeOpacity = p.wireframeOpacity;
            localParams.bloomStrength = p.bloomStrength;
            localParams.bloomRadius = p.bloomRadius;
            localParams.bloomThreshold = p.bloomThreshold;
        });

        const unsubDb = dbLevel.subscribe((value) => {
            dbValue = value.toFixed(1);
        });

        const unsubLufs = lufs.subscribe((value) => {
            lufsValue = value.toFixed(1);
        });

        pane = new Pane({
            container,
            title: 'LIVE EDITOR'
        });

        const viewFolder = pane.addFolder({ title: 'VIEW' });
        const displayBinding = viewFolder.addBinding(localParams, 'displayMode', {
            options: {
                Sphere: 'sphere',
                Waveform: 'waveform'
            }
        });
        displayBinding.on('change', syncToStore);

        const shapeBinding = viewFolder.addBinding(localParams, 'geometryType', {
            options: {
                Icosa: 'icosahedron',
                Sphere: 'sphere',
                Torus: 'torus',
                Octa: 'octahedron'
            }
        });
        shapeBinding.on('change', syncToStore);

        const geomFolder = pane.addFolder({ title: 'GEOMETRY' });
        geomFolder.addBinding(localParams, 'noiseFreq', { min: 0.01, max: 0.5, step: 0.01 }).on('change', syncToStore);
        geomFolder.addBinding(localParams, 'noiseAmp', { min: 0, max: 50, step: 1 }).on('change', syncToStore);
        geomFolder.addBinding(localParams, 'noiseSpeed', { min: 0.1, max: 2, step: 0.1 }).on('change', syncToStore);
        geomFolder.addBinding(localParams, 'baseRadius', { min: 8, max: 36, step: 1 }).on('change', syncToStore);

        const audioFolder = pane.addFolder({ title: 'AUDIO' });
        audioFolder.addBinding(localParams, 'wireframeOpacity', { min: 0.1, max: 1, step: 0.05 }).on('change', syncToStore);

        const postFolder = pane.addFolder({ title: 'POST' });
        postFolder.addBinding(localParams, 'bloomStrength', { min: 0, max: 2, step: 0.1 }).on('change', syncToStore);
        postFolder.addBinding(localParams, 'bloomRadius', { min: 0, max: 1, step: 0.1 }).on('change', syncToStore);
        postFolder.addBinding(localParams, 'bloomThreshold', { min: 0, max: 1, step: 0.1 }).on('change', syncToStore);

        function syncToStore() {
            params.set({ ...localParams });
        }

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
    <div class="meters">
        <div class="meter-row">
            <span>DB</span>
            <strong>{dbValue}</strong>
        </div>
        <div class="meter-row">
            <span>LUFS</span>
            <strong>{lufsValue}</strong>
        </div>
    </div>
</div>

<style>
    .editor-shell {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 300;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .meters {
        background: rgba(0, 0, 0, 0.86);
        border: 1px solid rgba(255, 255, 255, 0.15);
        padding: 10px 12px;
        color: white;
        font-family: 'Courier New', monospace;
    }

    .meter-row {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        font-size: 11px;
        letter-spacing: 0.12em;
    }

    .meter-row + .meter-row {
        margin-top: 6px;
    }

    :global(.tp-dfwv) {
        width: 300px !important;
    }

    :global(.tp-lblv_l),
    :global(.tp-valtxt),
    :global(.tp-fldv_t) {
        font-family: 'Courier New', monospace !important;
    }
</style>
