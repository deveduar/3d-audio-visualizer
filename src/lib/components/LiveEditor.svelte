<script lang="ts">
    import { onMount } from 'svelte';
    import { Pane } from 'tweakpane';
    import { params } from '$lib/stores/params';
    
    let container: HTMLDivElement;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pane: any;
    
    const localParams = $state({
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
        params.subscribe(p => {
            localParams.noiseFreq = p.noiseFreq;
            localParams.noiseAmp = p.noiseAmp;
            localParams.noiseSpeed = p.noiseSpeed;
            localParams.baseRadius = p.baseRadius;
            localParams.wireframeOpacity = p.wireframeOpacity;
            localParams.bloomStrength = p.bloomStrength;
            localParams.bloomRadius = p.bloomRadius;
            localParams.bloomThreshold = p.bloomThreshold;
        });
        
        pane = new Pane({
            container: container,
            title: 'SHADER PARAMS',
        });
        
        const geomFolder = pane.addFolder({
            title: 'GEOMETRY',
        });
        
        geomFolder.addBinding(localParams, 'noiseFreq', {
            min: 0.01,
            max: 0.5,
            step: 0.01,
            onChange: () => syncToStore()
        });
        
        geomFolder.addBinding(localParams, 'noiseAmp', {
            min: 0,
            max: 50,
            step: 1,
            onChange: () => syncToStore()
        });
        
        geomFolder.addBinding(localParams, 'noiseSpeed', {
            min: 0.1,
            max: 2,
            step: 0.1,
            onChange: () => syncToStore()
        });
        
        geomFolder.addBinding(localParams, 'baseRadius', {
            min: 10,
            max: 40,
            step: 1,
            onChange: () => syncToStore()
        });
        
        const audioFolder = pane.addFolder({
            title: 'AUDIO',
        });
        
        audioFolder.addBinding(localParams, 'wireframeOpacity', {
            min: 0.1,
            max: 1,
            step: 0.1,
            onChange: () => syncToStore()
        });
        
        const postFolder = pane.addFolder({
            title: 'POST-PROCESS',
        });
        
        postFolder.addBinding(localParams, 'bloomStrength', {
            min: 0,
            max: 2,
            step: 0.1,
            onChange: () => syncToStore()
        });
        
        postFolder.addBinding(localParams, 'bloomRadius', {
            min: 0,
            max: 1,
            step: 0.1,
            onChange: () => syncToStore()
        });
        
        postFolder.addBinding(localParams, 'bloomThreshold', {
            min: 0,
            max: 1,
            step: 0.1,
            onChange: () => syncToStore()
        });
        
        function syncToStore() {
            params.set({ ...localParams });
        }
        
        return () => {
            pane.dispose();
        };
    });
</script>

<div class="editor" bind:this={container}></div>

<style>
    .editor {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 300;
    }
    
    :global(.tp-dfwv) {
        width: 280px !important;
    }
    
    :global(.tp-lblv_l) {
        font-family: 'Courier New', monospace !important;
    }
    
    :global(.tp-valtxt) {
        font-family: 'Courier New', monospace !important;
    }
</style>
