<script lang="ts">
    import { T, useThrelte, useTask, useFrame } from '@threlte/core';
    import { get } from 'svelte/store';
    import { onMount } from 'svelte';
    import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
    import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
    import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
    import { Vector2 } from 'three';
    import { params } from '$lib/stores/params';
    import { treble } from '$lib/stores/audioEngine';
    
    let composer: EffectComposer;
    let bloomPass: UnrealBloomPass;
    let mounted = $state(false);
    
    const { renderer, scene, camera, size } = useThrelte();
    
    onMount(() => {
        if (!$renderer || !$scene || !$camera) return;
        
        const comp = new EffectComposer($renderer);
        const renderPass = new RenderPass($scene, $camera);
        comp.addPass(renderPass);
        
        const bloom = new UnrealBloomPass(
            new Vector2(window.innerWidth, window.innerHeight),
            0.5,
            0.5,
            0.2
        );
        comp.addPass(bloom);
        
        composer = comp;
        bloomPass = bloom;
        mounted = true;
        
        return () => {
            comp.dispose();
        };
    });
    
    useFrame(() => {
        if (!composer || !bloomPass || !mounted) return;
        
        const p = get(params);
        const t = get(treble);
        
        bloomPass.strength = p.bloomStrength + t * 0.5;
        bloomPass.radius = p.bloomRadius;
        bloomPass.threshold = p.bloomThreshold;
        
        composer.render();
    }, 1);
</script>
