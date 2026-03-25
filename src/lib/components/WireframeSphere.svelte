<script lang="ts">
    import { T, useTask } from '@threlte/core';
    import { ShaderMaterial, DoubleSide } from 'three';
    import { get } from 'svelte/store';
    import { rms, bass, treble, currentIndex } from '$lib/stores/playlistStore';
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
            float displacement = noise * uNoiseAmp * uRMS * (1.0 + uBass * 2.0);

            vDisplacement = displacement;
            vec3 newPosition = position + normal * displacement;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
    `;

    const fragmentShader = `
        uniform float uOpacity;
        uniform float uTreble;

        varying float vDisplacement;

        void main() {
            float absDisp = abs(vDisplacement);
            float glow = smoothstep(0.0, 10.0, absDisp);
            float brightness = 0.5 + glow * 0.5 + uTreble * 0.5;

            gl_FragColor = vec4(vec3(brightness), uOpacity);
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
            uTreble: { value: 0 },
            uOpacity: { value: 1.0 }
        }
    });

    useTask((delta) => {
        const p = get(params);
        time += delta * p.noiseSpeed;
        rotation += delta * 0.2;

        const currentRms = Math.max(0.1, get(rms));
        const targetScale = 0.55 + currentRms * 1.5;
        scale = scale + (targetScale - scale) * 0.1;
        animScale += (1 - animScale) * 0.05;

        material.uniforms.uTime.value = time;
        material.uniforms.uRMS.value = currentRms;
        material.uniforms.uBass.value = get(bass);
        material.uniforms.uTreble.value = get(treble);
        material.uniforms.uNoiseFreq.value = p.noiseFreq;
        material.uniforms.uNoiseAmp.value = p.noiseAmp;
        material.uniforms.uOpacity.value = p.wireframeOpacity;
    });
</script>

<T.Group rotation.y={rotation} scale={scale * animScale}>
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
    {:else if $params.geometryType === 'octahedron'}
        <T.Mesh>
            <T.OctahedronGeometry args={[$params.baseRadius, 6]} />
            <T is={material} />
        </T.Mesh>
    {:else}
        <T.Mesh>
            <T.IcosahedronGeometry args={[$params.baseRadius, 4]} />
            <T is={material} />
        </T.Mesh>
    {/if}
</T.Group>
