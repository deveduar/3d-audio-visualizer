<script lang="ts">
    import { T, useTask } from '@threlte/core';
    import { ShaderMaterial, DoubleSide, Color } from 'three';
    import { get } from 'svelte/store';
    import { rms, bass, transient, treble, currentIndex } from '$lib/stores/playlistStore';
    import { params } from '$lib/stores/params';

    let time = $state(0);
    let scale = $state(0.5);
    let rotation = $state(0);
    let animScale = $state(0);
    let lastIndex = $state(-1);

    $effect(() => {
        if ($currentIndex !== lastIndex && $currentIndex >= 0) {
            lastIndex = $currentIndex;
            animScale = 0;
        }
    });

    const vertexShader = `
        uniform float uTime;
        uniform float uNoiseFreq;
        uniform float uNoiseAmp;
        uniform float uRMS;
        uniform float uBass;
        uniform float uTransient;

        varying float vDisplacement;

        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
            const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

            vec3 i = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);

            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);

            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;

            i = mod289(i);
            vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));

            float n_ = 0.142857142857;
            vec3 ns = n_ * D.wyz - D.xzx;

            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);

            vec4 x = x_ * ns.x + ns.yyyy;
            vec4 y = y_ * ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);

            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);

            vec4 s0 = floor(b0) * 2.0 + 1.0;
            vec4 s1 = floor(b1) * 2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));

            vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);

            vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;

            vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
        }

        void main() {
            float noise = snoise(vec3(position * uNoiseFreq + uTime));
            float displacement = noise * uNoiseAmp * (uRMS + uTransient * 0.55) * (1.0 + uBass * 2.0);

            vDisplacement = displacement;
            vec3 newPosition = position + normal * displacement;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
    `;

    const fragmentShader = `
        uniform float uOpacity;
        uniform float uTreble;
        uniform float uTransient;
        uniform float uBloomStrength;
        uniform float uBloomRadius;
        uniform float uBloomThreshold;
        uniform vec3 uPrimaryColor;
        uniform vec3 uSecondaryColor;

        varying float vDisplacement;

        void main() {
            float absDisp = abs(vDisplacement);
            float threshold = mix(0.05, 6.0, uBloomThreshold);
            float radius = mix(0.2, 8.0, uBloomRadius);
            float glow = smoothstep(threshold, threshold + radius, absDisp);
            float bloom = glow * (0.4 + uBloomStrength);
            float brightness = 0.18 + bloom + uTreble * (0.25 + uBloomStrength * 0.25) + uTransient * 0.35;
            float alpha = clamp(uOpacity * (0.35 + glow * 0.9), 0.0, 1.0);
            vec3 baseColor = mix(uSecondaryColor, uPrimaryColor, clamp(glow + uTreble * 0.65 + uTransient * 0.45, 0.0, 1.0));
            vec3 finalColor = baseColor * brightness;

            gl_FragColor = vec4(finalColor, alpha);
        }
    `;

    const material = new ShaderMaterial({
        vertexShader,
        fragmentShader,
        wireframe: true,
        transparent: true,
        side: DoubleSide,
        uniforms: {
            uTime: { value: 0 },
            uNoiseFreq: { value: 0.1 },
            uNoiseAmp: { value: 15 },
            uRMS: { value: 0.1 },
            uBass: { value: 0 },
            uTransient: { value: 0 },
            uTreble: { value: 0 },
            uOpacity: { value: 1.0 },
            uBloomStrength: { value: 0.5 },
            uBloomRadius: { value: 0.5 },
            uBloomThreshold: { value: 0.2 },
            uPrimaryColor: { value: new Color('#ffffff') },
            uSecondaryColor: { value: new Color('#9f9f9f') }
        }
    });

    useTask((delta) => {
        const p = get(params);
        time += delta * p.noiseSpeed;
        const currentBass = get(bass);
        const currentTreble = get(treble);
        rotation += delta * (0.08 + currentBass * 0.55 + currentTreble * 0.18);

        const currentRms = Math.max(0.01, get(rms));
        const currentTransient = get(transient);
        const targetScale = 0.48 + currentRms * 2.2 + currentBass * 0.45 + currentTransient * 0.85;
        scale = scale + (targetScale - scale) * 0.16;
        animScale += (1 - animScale) * 0.08;

        material.uniforms.uTime.value = time;
        material.uniforms.uRMS.value = currentRms;
        material.uniforms.uBass.value = currentBass;
        material.uniforms.uTransient.value = currentTransient;
        material.uniforms.uTreble.value = currentTreble;
        material.uniforms.uNoiseFreq.value = p.noiseFreq;
        material.uniforms.uNoiseAmp.value = p.noiseAmp;
        material.uniforms.uOpacity.value = p.wireframeOpacity;
        material.uniforms.uBloomStrength.value = p.postEnabled ? p.bloomStrength : 0;
        material.uniforms.uBloomRadius.value = p.postEnabled ? p.bloomRadius : 0;
        material.uniforms.uBloomThreshold.value = p.postEnabled ? p.bloomThreshold : 0;
        material.uniforms.uPrimaryColor.value.set(p.primaryColor);
        material.uniforms.uSecondaryColor.value.set(p.secondaryColor);
        material.wireframe = p.renderMode === 'wireframe';
    });
</script>

<T.Group rotation.y={rotation} rotation.x={rotation * 0.32} scale={scale * animScale}>
    {#key `${$params.geometryType}-${$params.renderMode}-${$params.baseRadius}`}
        {#if $params.geometryType === 'sphere'}
            <T.Mesh>
                <T.SphereGeometry args={[$params.baseRadius, 80, 80]} />
                <T is={material} />
            </T.Mesh>
        {:else if $params.geometryType === 'torus'}
            <T.Mesh>
                <T.TorusKnotGeometry args={[$params.baseRadius * 0.55, $params.baseRadius * 0.18, 220, 32]} />
                <T is={material} />
            </T.Mesh>
        {:else if $params.geometryType === 'cube'}
            <T.Mesh>
                <T.BoxGeometry args={[$params.baseRadius * 1.5, $params.baseRadius * 1.5, $params.baseRadius * 1.5, 12, 12, 12]} />
                <T is={material} />
            </T.Mesh>
        {:else if $params.geometryType === 'dodecahedron'}
            <T.Mesh>
                <T.DodecahedronGeometry args={[$params.baseRadius, 3]} />
                <T is={material} />
            </T.Mesh>
        {:else if $params.geometryType === 'cone'}
            <T.Mesh>
                <T.ConeGeometry args={[$params.baseRadius * 0.9, $params.baseRadius * 2.1, 96, 18]} />
                <T is={material} />
            </T.Mesh>
        {:else if $params.geometryType === 'cylinder'}
            <T.Mesh>
                <T.CylinderGeometry args={[$params.baseRadius * 0.72, $params.baseRadius * 0.72, $params.baseRadius * 2, 72, 18, true]} />
                <T is={material} />
            </T.Mesh>
        {:else}
            <T.Mesh>
                <T.IcosahedronGeometry args={[$params.baseRadius, 4]} />
                <T is={material} />
            </T.Mesh>
        {/if}
    {/key}
</T.Group>
