<script lang="ts">
    import { onMount } from 'svelte';
    import { bass, mid, transient, treble } from '$lib/stores/playlistStore';
    import { params } from '$lib/stores/params';

    let canvas: HTMLCanvasElement;
    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let animationId: number | null = null;
    let startTime = 0;

    const vertexShaderSource = `
        attribute vec2 aPosition;
        varying vec2 vUv;

        void main() {
            vUv = aPosition * 0.5 + 0.5;
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
    `;

    const fragmentShaderSource = `
        precision mediump float;

        varying vec2 vUv;

        uniform vec2 uResolution;
        uniform float uTime;
        uniform float uBass;
        uniform float uMid;
        uniform float uTreble;
        uniform float uTransient;
        uniform float uDensity;
        uniform float uFlow;
        uniform float uDrift;
        uniform float uPulse;
        uniform float uSpread;
        uniform float uSpeed;
        uniform float uGain;
        uniform float uOpacity;
        uniform float uVariant;
        uniform float uBloomStrength;
        uniform vec3 uPrimaryColor;
        uniform vec3 uSecondaryColor;
        uniform vec3 uBackgroundColor;

        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        float fbm(vec2 p) {
            float value = 0.0;
            float amplitude = 0.5;
            for (int i = 0; i < 5; i++) {
                value += amplitude * noise(p);
                p *= 2.03;
                amplitude *= 0.52;
            }
            return value;
        }

        void main() {
            vec2 uv = vUv * 2.0 - 1.0;
            uv.x *= uResolution.x / max(uResolution.y, 1.0);

            float time = uTime * (0.35 + uSpeed * 0.45);
            float pulse = 1.0 + uBass * (0.14 + uPulse * 0.1) + uTransient * 0.12;
            uv /= pulse;

            vec2 travel = vec2(
                sin(time * (0.8 + uDrift) + uMid * 2.0),
                cos(time * (0.6 + uDrift * 0.7) + uBass * 1.8)
            ) * (0.08 + uSpread * 0.26);
            uv += travel;

            vec2 flowUv = uv;
            if (uVariant < 0.5) {
                flowUv += vec2(fbm(uv * 1.6 + time * 0.4), fbm(uv * 1.4 - time * 0.35)) * (0.35 + uFlow * 0.42);
            } else if (uVariant < 1.5) {
                float a = atan(uv.y, uv.x);
                float r = length(uv);
                flowUv = vec2(a * (0.4 + uFlow * 0.25), r * (1.4 + uSpread * 0.35));
                flowUv += vec2(time * 0.22, -time * 0.38);
            } else {
                flowUv = vec2(uv.x * (1.0 + uSpread), sin(uv.y * 6.0 + time) * 0.28 + uv.y * (1.2 + uFlow));
                flowUv += vec2(time * 0.35, -time * 0.18);
            }

            float base = fbm(flowUv * (1.2 + uDensity * 2.2));
            float wisps = fbm(flowUv * (2.4 + uFlow * 1.8) + vec2(time * 0.45, -time * 0.3));
            float sparks = pow(max(0.0, fbm(flowUv * (5.0 + uTreble * 2.5) - time * 0.6) - 0.58), 2.5);
            float cloud = smoothstep(0.28 - uDensity * 0.18, 0.95, base + wisps * 0.55);
            float halo = exp(-length(uv) * (1.4 - uSpread * 0.35));
            float brightness = cloud * (0.55 + uGain * 0.025) + halo * (0.18 + uPulse * 0.14) + sparks * (0.25 + uTreble * 0.55);

            vec3 nebulaColor = mix(uSecondaryColor, uPrimaryColor, clamp(base * 0.75 + sparks * 0.6 + uTransient * 0.25, 0.0, 1.0));
            vec3 color = uBackgroundColor;
            color += nebulaColor * brightness;
            color += mix(uPrimaryColor, uSecondaryColor, 0.3) * halo * (0.16 + uBloomStrength * 0.45);

            float vignette = smoothstep(1.65, 0.18, length(uv));
            color = mix(uBackgroundColor, color, vignette);
            float alpha = clamp(uOpacity * (0.45 + cloud * 0.55 + sparks * 0.35), 0.0, 1.0);

            gl_FragColor = vec4(color, alpha);
        }
    `;

    function compileShader(context: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
        const shader = context.createShader(type);
        if (!shader) return null;
        context.shaderSource(shader, source);
        context.compileShader(shader);
        if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
            console.error(context.getShaderInfoLog(shader));
            context.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function createProgram(context: WebGLRenderingContext): WebGLProgram | null {
        const vertexShader = compileShader(context, context.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = compileShader(context, context.FRAGMENT_SHADER, fragmentShaderSource);
        if (!vertexShader || !fragmentShader) return null;
        const shaderProgram = context.createProgram();
        if (!shaderProgram) return null;
        context.attachShader(shaderProgram, vertexShader);
        context.attachShader(shaderProgram, fragmentShader);
        context.linkProgram(shaderProgram);
        context.deleteShader(vertexShader);
        context.deleteShader(fragmentShader);
        if (!context.getProgramParameter(shaderProgram, context.LINK_STATUS)) {
            console.error(context.getProgramInfoLog(shaderProgram));
            context.deleteProgram(shaderProgram);
            return null;
        }
        return shaderProgram;
    }

    function resize() {
        if (!gl) return;
        const rect = canvas.parentElement?.getBoundingClientRect();
        if (!rect) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
        canvas.width = Math.max(320, Math.floor(rect.width * dpr));
        canvas.height = Math.max(240, Math.floor(rect.height * dpr));
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function hexToRgb(hex: string) {
        const normalized = hex.replace('#', '');
        const safe =
            normalized.length === 3
                ? normalized.split('').map((char) => char + char).join('')
                : normalized.padEnd(6, '0').slice(0, 6);
        return [
            parseInt(safe.slice(0, 2), 16) / 255,
            parseInt(safe.slice(2, 4), 16) / 255,
            parseInt(safe.slice(4, 6), 16) / 255
        ] as const;
    }

    function render(now: number) {
        if (!gl || !program) return;

        const time = (now - startTime) * 0.001;
        const [pr, pg, pb] = hexToRgb($params.primaryColor);
        const [sr, sg, sb] = hexToRgb($params.secondaryColor);
        const [br, bg, bb] = hexToRgb($params.backgroundColor);

        gl.clearColor(br, bg, bb, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);

        gl.uniform2f(gl.getUniformLocation(program, 'uResolution'), canvas.width, canvas.height);
        gl.uniform1f(gl.getUniformLocation(program, 'uTime'), time);
        const audioMultiplier = $params.disableBassRebound ? 0 : 1;
        gl.uniform1f(gl.getUniformLocation(program, 'uBass'), $bass * audioMultiplier);
        gl.uniform1f(gl.getUniformLocation(program, 'uMid'), $mid * audioMultiplier);
        gl.uniform1f(gl.getUniformLocation(program, 'uTreble'), $treble * audioMultiplier);
        gl.uniform1f(gl.getUniformLocation(program, 'uTransient'), $transient * audioMultiplier);
        gl.uniform1f(gl.getUniformLocation(program, 'uDensity'), $params.nebulaDensity);
        gl.uniform1f(gl.getUniformLocation(program, 'uFlow'), $params.nebulaFlow);
        gl.uniform1f(gl.getUniformLocation(program, 'uDrift'), $params.nebulaDrift);
        gl.uniform1f(gl.getUniformLocation(program, 'uPulse'), $params.nebulaPulse);
        gl.uniform1f(gl.getUniformLocation(program, 'uSpread'), $params.nebulaSpread);
        gl.uniform1f(gl.getUniformLocation(program, 'uSpeed'), $params.noiseSpeed);
        gl.uniform1f(gl.getUniformLocation(program, 'uGain'), $params.noiseAmp);
        gl.uniform1f(gl.getUniformLocation(program, 'uOpacity'), $params.wireframeOpacity);
        gl.uniform1f(
            gl.getUniformLocation(program, 'uVariant'),
            $params.nebulaVariant === 'vortex' ? 1 : $params.nebulaVariant === 'ribbons' ? 2 : 0
        );
        gl.uniform1f(gl.getUniformLocation(program, 'uBloomStrength'), $params.postEnabled ? $params.bloomStrength : 0);
        gl.uniform3f(gl.getUniformLocation(program, 'uPrimaryColor'), pr, pg, pb);
        gl.uniform3f(gl.getUniformLocation(program, 'uSecondaryColor'), sr, sg, sb);
        gl.uniform3f(gl.getUniformLocation(program, 'uBackgroundColor'), br, bg, bb);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        animationId = requestAnimationFrame(render);
    }

    onMount(() => {
        gl = canvas.getContext('webgl', {
            antialias: false,
            alpha: false,
            powerPreference: 'high-performance'
        });
        if (!gl) return;

        program = createProgram(gl);
        if (!program) return;

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
            gl.STATIC_DRAW
        );

        const positionLocation = gl.getAttribLocation(program, 'aPosition');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        resize();
        window.addEventListener('resize', resize);
        startTime = performance.now();
        animationId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', resize);
            if (animationId) cancelAnimationFrame(animationId);
            if (program) gl?.deleteProgram(program);
        };
    });
</script>

<div class="nebula-field">
    <canvas bind:this={canvas}></canvas>
</div>

<style>
    .nebula-field {
        position: absolute;
        inset: 0;
        pointer-events: none;
    }

    canvas {
        width: 100%;
        height: 100%;
        display: block;
    }
</style>
