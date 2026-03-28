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

    // A white musical note SVG to use as a mask/icon
    const iconSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTI1NiAxOTJWMzIwTTI1NiAzMjBDMjU2IDM0MiAyMzggMzYwIDIxNiAzNjBDMTk0IDM2MCAxNzYgMzQyIDE3NiAzMjBDMTk2IDI5OCAyMTQgMzIwIDIzNiAzMjBMMjU2IDE5MlpNMjU2IDE5MkwzMjAgMjI0IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=';
    const iconTexture = useTexture(iconSvg);
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
        
        // Root rotation: only if autoRotate is enabled
        if (p.autoRotate) {
            rotation += delta * (autoRotateSpeed + currentBass * 0.4 * audioMultiplier);
        }

        // Scale/Bounce logic
        const currentRms = Math.max(0, get(rms));
        const currentTransient = get(transient);
        const targetScale = 1.0 + (currentRms * 1.5 + currentBass * 0.3 + currentTransient * 0.5) * audioMultiplier * bounceMult;
        
        scale = scale + (targetScale - scale) * 0.15;
    });
</script>

{#if $currentTrack?.coverUrl}
    {#await texture then tex}
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
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
                    <!-- Box Mode: Body + Textured Faces -->
                    <T.Group>
                        <!-- Main Box Body -->
                        <T.Mesh>
                            <T.BoxGeometry args={[40, 40, 2]} />
                            <T.MeshStandardMaterial color={$params.secondaryColor} opacity={$params.solidOpacity} transparent />
                        </T.Mesh>
                        <!-- Front Face -->
                        <T.Mesh position.z={1.01}>
                            <T.PlaneGeometry args={[39.8, 39.8]} />
                            <T.MeshStandardMaterial map={tex} transparent opacity={$params.solidOpacity} />
                        </T.Mesh>
                        <!-- Back Face -->
                        <T.Mesh position.z={-1.01} rotation.y={Math.PI}>
                            <T.PlaneGeometry args={[39.8, 39.8]} />
                            <T.MeshStandardMaterial map={tex} transparent opacity={$params.solidOpacity} />
                        </T.Mesh>
                    </T.Group>
                {/if}
            </T.Group>
        </Float>
    {/await}
{:else}
    <!-- Placeholder Mode with Reactive SVG Icon -->
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <T.Group rotation.y={rotation} scale={scale}>
            {#if $params.coverStyle === 'flat'}
                <!-- Background -->
                <T.Mesh>
                    <T.PlaneGeometry args={[40, 40]} />
                    <T.MeshStandardMaterial color={$params.primaryColor} side={THREE.DoubleSide} />
                </T.Mesh>
                <!-- Icon -->
                {#await iconTexture then tex}
                    <T.Mesh position.z={0.1}>
                        <T.PlaneGeometry args={[25, 25]} />
                        <T.MeshStandardMaterial map={tex} transparent color={$params.secondaryColor} />
                    </T.Mesh>
                    <T.Mesh position.z={-0.1} rotation.y={Math.PI}>
                        <T.PlaneGeometry args={[25, 25]} />
                        <T.MeshStandardMaterial map={tex} transparent color={$params.secondaryColor} />
                    </T.Mesh>
                {/await}
            {:else}
                <!-- Box Body -->
                <T.Mesh>
                    <T.BoxGeometry args={[40, 40, 2]} />
                    <T.MeshStandardMaterial color={$params.primaryColor} />
                </T.Mesh>
                
                <!-- Front Icon -->
                {#await iconTexture then tex}
                    <T.Mesh position.z={1.01}>
                        <T.PlaneGeometry args={[25, 25]} />
                        <T.MeshStandardMaterial map={tex} transparent color={$params.secondaryColor} />
                    </T.Mesh>
                    <!-- Back Icon -->
                    <T.Mesh position.z={-1.01} rotation.y={Math.PI}>
                        <T.PlaneGeometry args={[25, 25]} />
                        <T.MeshStandardMaterial map={tex} transparent color={$params.secondaryColor} />
                    </T.Mesh>
                {/await}
            {/if}
        </T.Group>
    </Float>
{/if}

{#await texture catch error}
    <!-- Loading/Error Fallback -->
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <T.Group rotation.y={rotation} scale={scale}>
            <T.Mesh>
                <T.BoxGeometry args={[40, 40, 2]} />
                <T.MeshStandardMaterial color="#333" />
            </T.Mesh>
        </T.Group>
    </Float>
{/await}

<T.AmbientLight intensity={0.5} />
<T.DirectionalLight position={[10, 10, 10]} intensity={1} />
