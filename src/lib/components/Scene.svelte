<script lang="ts">
    import { T, useTask } from '@threlte/core';
    import { OrbitControls } from '@threlte/extras';
    import WireframeSphere from './WireframeSphere.svelte';
    import { cameraResetSignal, params } from '$lib/stores/params';
    import { bass, transient } from '$lib/stores/playlistStore';
    import { get } from 'svelte/store';

    let cameraX = $state(0);
    let cameraY = $state(0);
    let cameraZ = $state(0);
    let lightA = $state(1);
    let lightB = $state(0.5);

    useTask((delta) => {
        const impact = get(transient);
        const low = get(bass);
        const p = get(params);
        const reactiveEnabled = p.cameraMode === 'reactive' || p.cameraMode === 'orbit-reactive';
        const eventIntensity = reactiveEnabled ? impact * p.cameraReactiveAmount * (0.45 + p.impactFrame * 1.2) : 0;
        const cameraPush = eventIntensity * (0.4 + p.impactFlash * 1.4);
        const targetX = low * 1.1 * cameraPush;
        const targetY = eventIntensity * 0.8;
        const targetZ = -eventIntensity * (3.5 + p.impactFlash * 2.5) - low * 2.2 * p.cameraReactiveAmount;

        cameraX += (targetX - cameraX) * p.cameraDamping;
        cameraY += (targetY - cameraY) * p.cameraDamping;
        cameraZ += (targetZ - cameraZ) * p.cameraDamping;
        lightA += ((1 + low * 0.45 + eventIntensity * (1.3 + p.impactFlash)) - lightA) * 0.12;
        lightB += ((0.5 + eventIntensity * (0.7 + p.impactFrame * 0.55)) - lightB) * 0.12;
    });
</script>

{#key $cameraResetSignal}
    <T.Group position={[cameraX, cameraY, cameraZ]}>
        <T.PerspectiveCamera makeDefault position={[0, 0, $params.cameraDistance]} fov={60}>
            <OrbitControls
                target={[0, 0, 0]}
                enableRotate={$params.cameraMode === 'orbit' || $params.cameraMode === 'orbit-reactive'}
                enableZoom={$params.cameraEnableZoom}
                enablePan={$params.cameraEnablePan}
                enableDamping
                dampingFactor={$params.cameraDamping}
            />
        </T.PerspectiveCamera>
    </T.Group>
{/key}

<T.PointLight position={[10, 10, 10]} intensity={lightA} />
<T.PointLight position={[-10, -10, -10]} intensity={lightB} />

{#if $params.displayMode === 'sphere'}
    <WireframeSphere />
{/if}
