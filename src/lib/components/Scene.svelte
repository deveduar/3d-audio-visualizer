<script lang="ts">
    import { T, useTask } from '@threlte/core';
    import { OrbitControls } from '@threlte/extras';
    import WireframeSphere from './WireframeSphere.svelte';
    import { params } from '$lib/stores/params';
    import { bass, transient } from '$lib/stores/playlistStore';
    import { get } from 'svelte/store';

    let cameraX = $state(0);
    let cameraY = $state(0);
    let cameraZ = $state(80);
    let lightA = $state(1);
    let lightB = $state(0.5);

    useTask((delta) => {
        const impact = get(transient);
        const low = get(bass);
        const p = get(params);
        const eventIntensity = p.showImpactOverlay ? impact * (0.45 + p.impactFrame * 1.2) : 0;
        const cameraPush = eventIntensity * (0.4 + p.impactFlash * 1.4);
        const targetX = low * 1.1 * cameraPush;
        const targetY = eventIntensity * 0.8;
        const targetZ = 80 - eventIntensity * (3.5 + p.impactFlash * 2.5) - low * 2.2;

        cameraX += (targetX - cameraX) * 0.16;
        cameraY += (targetY - cameraY) * 0.16;
        cameraZ += (targetZ - cameraZ) * 0.16;
        lightA += ((1 + low * 0.45 + eventIntensity * (1.3 + p.impactFlash)) - lightA) * 0.12;
        lightB += ((0.5 + eventIntensity * (0.7 + p.impactFrame * 0.55)) - lightB) * 0.12;
    });
</script>

<T.PerspectiveCamera makeDefault position={[cameraX, cameraY, cameraZ]} fov={60}>
    <OrbitControls enableZoom={false} enablePan={false} enableDamping />
</T.PerspectiveCamera>

<T.PointLight position={[10, 10, 10]} intensity={lightA} />
<T.PointLight position={[-10, -10, -10]} intensity={lightB} />

{#if $params.displayMode === 'sphere'}
    <WireframeSphere />
{/if}
