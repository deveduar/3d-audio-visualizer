<script lang="ts">
    import { T, useTask } from '@threlte/core';
    import { Color, DoubleSide, ShaderMaterial, Vector2 } from 'three';
    import { get } from 'svelte/store';
    import { bass, currentTime, duration, mid, rms, transient, treble } from '$lib/stores/playlistStore';
    import { params } from '$lib/stores/params';

    let innerWidth = $state(1280);
    let innerHeight = $state(720);

    const vertexShader = `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform vec2 uResolution;
        uniform float uTime;
        uniform float uTrackTime;
        uniform float uTrackProgress;
        uniform float uBass;
        uniform float uMid;
        uniform float uTreble;
        uniform float uRms;
        uniform float uTransient;
        uniform float uDensity;
        uniform float uSpeed;
        uniform float uDrive;
        uniform float uTwist;
        uniform float uPulse;
        uniform float uDrift;
        uniform float uGain;
        uniform float uOpacity;
        uniform float uVariant;
        uniform float uRenderMode;
        uniform float uPostEnabled;
        uniform float uBloomStrength;
        uniform float uBloomRadius;
        uniform float uBloomThreshold;
        uniform vec3 uPrimaryColor;
        uniform vec3 uSecondaryColor;
        uniform vec3 uBackgroundColor;

        varying vec2 vUv;

        float lineMask(float value, float width) {
            float cell = abs(fract(value) - 0.5);
            return 1.0 - smoothstep(width, width + 0.02, cell);
        }

        mat2 rotate2d(float a) {
            float s = sin(a);
            float c = cos(a);
            return mat2(c, -s, s, c);
        }

        void main() {
            vec2 uv = vUv * 2.0 - 1.0;
            uv.x *= uResolution.x / max(uResolution.y, 1.0);

            float travel = uTrackTime * (0.28 + uSpeed * 1.45 + uDrive * 0.8)
                + uTrackProgress * (4.0 + uSpeed * 9.0);

            vec2 planeUv = uv;
            planeUv.y = -planeUv.y + 0.28;

            float depth = 1.0 / max(planeUv.y + 1.15, 0.22);
            float sweep = sin(travel * 0.14 + planeUv.y * 2.8) * (uDrift * 0.08 + uMid * 0.03);
            planeUv.x += sweep;
            planeUv *= rotate2d(sin(travel * 0.05) * (uTwist * 0.08));

            float worldX = planeUv.x * depth * (4.2 + uDensity * 4.8);
            float worldZ = depth * (2.0 + uDensity * 5.5) + travel * (0.65 + uSpeed);

            float audioWarp = sin(worldZ * 0.42 + uTime * 0.9) * (uBass * 0.28 + uTwist * 0.24);
            audioWarp += cos(worldX * 0.32 - travel * 0.22) * (uMid * 0.18 + uPulse * 0.14);

            if (uVariant > 0.5 && uVariant < 1.5) {
                worldX += sin(worldZ * 0.18 + uTime * 0.7) * (0.35 + uTwist * 0.55);
            } else if (uVariant >= 1.5) {
                audioWarp += sin(worldZ * 1.1 - travel * 0.85) * (uTransient * 0.6 + uPulse * 0.4);
            }

            float elevatedY = audioWarp * depth * (0.55 + uGain * 0.015);
            float verticalPerspective = 1.0 - smoothstep(-0.85, 0.65, uv.y + elevatedY * 0.22);

            float majorWidth = mix(0.04, 0.012, uDensity);
            float minorWidth = majorWidth * 0.45;

            float gridXMajor = lineMask(worldX * 0.18, majorWidth);
            float gridXMinor = lineMask(worldX * 0.72, minorWidth) * 0.35;
            float gridZMajor = lineMask(worldZ * 0.12, majorWidth);
            float gridZMinor = lineMask(worldZ * 0.46, minorWidth) * 0.3;

            float lineGrid = max(gridXMajor + gridXMinor, gridZMajor + gridZMinor);
            float pointGrid = (gridXMajor * gridZMajor) + (gridXMinor * gridZMinor * 0.7);
            float barGrid = gridZMajor * 1.25 + gridZMinor * 0.55 + gridXMajor * 0.22;
            float scanlines = lineMask((uv.y + travel * 0.025) * (18.0 + uDensity * 10.0), 0.18) * (0.08 + uTreble * 0.16);
            float pulse = smoothstep(0.45, 1.0, sin(worldZ * (0.35 + uPulse * 0.6) - travel * (1.3 + uPulse)) * 0.5 + 0.5)
                * (uTransient * 0.9 + uRms * 0.22);

            float grid = lineGrid;
            if (uRenderMode > 0.5 && uRenderMode < 1.5) {
                grid = pointGrid * 1.45;
            } else if (uRenderMode >= 1.5) {
                grid = barGrid;
            }

            float horizonGlow = smoothstep(0.38, -0.22, planeUv.y) * (0.02 + uBass * 0.08);
            float floorFade = smoothstep(0.08, 0.95, verticalPerspective);
            float signal = (grid + scanlines + pulse) * floorFade;

            float threshold = mix(0.04, 1.2, uBloomThreshold);
            float bloomRadius = mix(0.08, 1.5, uBloomRadius);
            float bloomMask = smoothstep(threshold, threshold + bloomRadius, signal);
            float bloom = uPostEnabled > 0.5 ? bloomMask * (0.14 + uBloomStrength * 0.75) : 0.0;

            vec3 floorColor = mix(uSecondaryColor, uPrimaryColor, clamp(gridXMajor + pulse + uTreble * 0.24, 0.0, 1.0));
            float ambientGlow = clamp((uGain / 40.0) * 0.35, 0.0, 0.35);
            vec3 hazeColor = mix(uBackgroundColor, uSecondaryColor, clamp(horizonGlow + scanlines * (0.4 + ambientGlow), 0.0, 1.0));
            vec3 color = mix(uBackgroundColor, hazeColor, horizonGlow * (0.2 + ambientGlow) + scanlines * ambientGlow);
            color += floorColor * (signal * (0.55 + uGain * 0.03) + bloom);

            float vignette = smoothstep(1.85, 0.18, length(vec2(uv.x * 0.9, uv.y * 1.05)));
            color *= vignette;

            gl_FragColor = vec4(color, clamp(uOpacity, 0.0, 1.0));
        }
    `;

    const material = new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: false,
        side: DoubleSide,
        uniforms: {
            uResolution: { value: new Vector2(1, 1) },
            uTime: { value: 0 },
            uTrackTime: { value: 0 },
            uTrackProgress: { value: 0 },
            uBass: { value: 0 },
            uMid: { value: 0 },
            uTreble: { value: 0 },
            uRms: { value: 0 },
            uTransient: { value: 0 },
            uDensity: { value: 0.7 },
            uSpeed: { value: 0.9 },
            uDrive: { value: 0.6 },
            uTwist: { value: 0.35 },
            uPulse: { value: 0.75 },
            uDrift: { value: 0.4 },
            uGain: { value: 15 },
            uOpacity: { value: 1 },
            uVariant: { value: 0 },
            uRenderMode: { value: 0 },
            uPostEnabled: { value: 1 },
            uBloomStrength: { value: 0.5 },
            uBloomRadius: { value: 0.5 },
            uBloomThreshold: { value: 0.2 },
            uPrimaryColor: { value: new Color('#ffffff') },
            uSecondaryColor: { value: new Color('#9f9f9f') },
            uBackgroundColor: { value: new Color('#000000') }
        }
    });

    useTask((delta) => {
        const p = get(params);
        const durationValue = get(duration);
        const trackTime = get(currentTime);
        const trackProgress = durationValue > 0 ? trackTime / durationValue : 0;

        material.uniforms.uTime.value += delta;
        material.uniforms.uTrackTime.value = trackTime;
        material.uniforms.uTrackProgress.value = trackProgress;
        const audioMultiplier = p.audioReactAmount;
        material.uniforms.uBass.value = get(bass) * audioMultiplier;
        material.uniforms.uMid.value = get(mid) * audioMultiplier;
        material.uniforms.uTreble.value = get(treble) * audioMultiplier;
        material.uniforms.uRms.value = get(rms) * audioMultiplier;
        material.uniforms.uTransient.value = get(transient) * audioMultiplier;
        material.uniforms.uDensity.value = p.tunnelDensity;
        material.uniforms.uSpeed.value = p.tunnelSpeed;
        material.uniforms.uDrive.value = p.noiseSpeed;
        material.uniforms.uTwist.value = p.tunnelTwist;
        material.uniforms.uPulse.value = p.tunnelPulse;
        material.uniforms.uDrift.value = p.noiseFreq * 4.0;
        material.uniforms.uGain.value = p.noiseAmp;
        material.uniforms.uOpacity.value = p.wireframeOpacity;
        material.uniforms.uVariant.value =
            p.tunnelVariant === 'helix' ? 1 : p.tunnelVariant === 'pulse' ? 2 : 0;
        material.uniforms.uRenderMode.value =
            p.gridRender === 'points' ? 1 : p.gridRender === 'bars' ? 2 : 0;
        material.uniforms.uPostEnabled.value = p.postEnabled ? 1 : 0;
        material.uniforms.uBloomStrength.value = p.bloomStrength;
        material.uniforms.uBloomRadius.value = p.bloomRadius;
        material.uniforms.uBloomThreshold.value = p.bloomThreshold;
        material.uniforms.uPrimaryColor.value.set(p.primaryColor);
        material.uniforms.uSecondaryColor.value.set(p.secondaryColor);
        material.uniforms.uBackgroundColor.value.set(p.backgroundColor);
        material.uniforms.uResolution.value.set(innerWidth, innerHeight);
    });
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<T.Mesh position={[0, 0, -8]} renderOrder={20}>
    <T.PlaneGeometry args={[24, 24, 1, 1]} />
    <T is={material} />
</T.Mesh>
