<script lang="ts">
    import { T, useTask } from '@threlte/core';
    import { Float, useTexture } from '@threlte/extras';
    import { currentTrack, rms, bass, transient } from '$lib/stores/playlistStore';
    import { params } from '$lib/stores/params';
    import { get } from 'svelte/store';
    import * as THREE from 'three';

    let mesh = $state<THREE.Mesh>();
    let rotation = $state(0);
    let scale = $state(1);

    const defaultCover = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    
    // We use a reactive texture loader
    const texture = $derived.by(() => {
        const url = $currentTrack?.coverUrl || defaultCover;
        return useTexture(url);
    });

    useTask((delta) => {
        const p = $params;
        const audioMultiplier = p.audioReactAmount;
        const bounceMult = p.geometryBounce;
        
        // Rotation logic
        const autoRotateSpeed = p.autoRotate ? 0.05 : 0;
        const currentBass = get(bass);
        rotation += delta * (autoRotateSpeed + currentBass * 0.4 * audioMultiplier);

        // Scale/Bounce logic
        const currentRms = Math.max(0, get(rms));
        const currentTransient = get(transient);
        const targetScale = 1.0 + (currentRms * 1.5 + currentBass * 0.3 + currentTransient * 0.5) * audioMultiplier * bounceMult;
        
        scale = scale + (targetScale - scale) * 0.15;
    });
</script>

{#await texture then tex}
    <Float 
        speed={1.5} 
        rotationIntensity={0.5} 
        floatIntensity={0.5}
    >
        <T.Group rotation.y={rotation} scale={scale}>
            {#if $params.coverStyle === 'flat'}
                <T.Mesh bind:ref={mesh}>
                    <T.PlaneGeometry args={[40, 40]} />
                    <T.MeshStandardMaterial 
                        map={tex} 
                        side={THREE.DoubleSide}
                        transparent={true}
                        opacity={$params.solidOpacity}
                    />
                </T.Mesh>
            {:else}
                <T.Mesh bind:ref={mesh}>
                    <T.BoxGeometry args={[40, 40, 2]} />
                    <!-- Map to all sides, but primarily front/back -->
                    <T.MeshStandardMaterial 
                        map={tex} 
                        transparent={true}
                        opacity={$params.solidOpacity}
                    />
                </T.Mesh>
            {/if}
        </T.Group>
    </Float>
{/await}

{#await texture catch error}
    <Float 
        speed={1.5} 
        rotationIntensity={0.5} 
        floatIntensity={0.5}
    >
        <T.Group rotation.y={rotation} scale={scale}>
            {#if $params.coverStyle === 'flat'}
                <T.Mesh>
                    <T.PlaneGeometry args={[40, 40]} />
                    <T.MeshStandardMaterial color="#333" />
                </T.Mesh>
            {:else}
                <T.Mesh>
                    <T.BoxGeometry args={[40, 40, 2]} />
                    <T.MeshStandardMaterial color="#333" />
                </T.Mesh>
            {/if}
        </T.Group>
    </Float>
{/await}

<T.AmbientLight intensity={0.5} />
<T.DirectionalLight position={[10, 10, 10]} intensity={1} />
