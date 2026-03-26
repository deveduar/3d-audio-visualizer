<script lang="ts">
    import { waveformData, isPlaying, rms, transient } from '$lib/stores/playlistStore';
    import { onMount } from 'svelte';
    import { params } from '$lib/stores/params';

    let { compact = false }: { compact?: boolean } = $props();

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null = null;
    let animationId: number | null = null;

    onMount(() => {
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
        drawLoop();

        return () => {
            window.removeEventListener('resize', resize);
            if (animationId) cancelAnimationFrame(animationId);
        };
    });

    function resize() {
        const rect = canvas.parentElement?.getBoundingClientRect();
        if (rect) {
            canvas.width = rect.width;
            canvas.height = rect.height;
        }
    }

    function drawLoop() {
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const centerY = height / 2;
        const points = $waveformData ?? new Float32Array(0);
        const primary = $params.primaryColor;
        const secondary = $params.secondaryColor;
        const bg = $params.backgroundColor;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = `${bg}55`;
        ctx.fillRect(0, 0, width, height);
        ctx.save();

        if (points.length > 0) {
            const style = $params.waveformStyle;
            const gain = 0.45 + $params.noiseAmp / 40 + $transient * 0.35;
            const bloomRadius = $params.postEnabled ? $params.bloomRadius : 0;
            const bloomStrength = $params.postEnabled ? $params.bloomStrength : 0;
            const threshold = ($params.postEnabled ? $params.bloomThreshold : 0) * 0.45;
            const lineWidth = compact ? 1.5 : 1.5 + bloomRadius * 3;
            const alpha = 0.5 + $params.wireframeOpacity * 0.45 + $transient * 0.12;

            ctx.strokeStyle = `${primary}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.fillStyle = `${secondary}${Math.round((0.2 + bloomStrength * 0.18) * 255).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = lineWidth;
            ctx.shadowBlur = bloomStrength * 24 + $transient * 18;
            ctx.shadowColor = primary;

            if (style === 'bars') {
                const step = Math.max(3, Math.floor(points.length / 96));
                const barWidth = Math.max(2, width / Math.max(24, points.length / step) - 2);

                for (let i = 0; i < points.length; i += step) {
                    const x = (i / Math.max(1, points.length - 1)) * width;
                    const sample = Math.abs(points[i]) < threshold ? 0 : points[i];
                    const magnitude = Math.abs(sample) * centerY * gain;
                    ctx.fillRect(x, centerY - magnitude, barWidth, magnitude * 2);
                }
            } else {
                ctx.beginPath();

                for (let i = 0; i < points.length; i++) {
                    const x = (i / Math.max(1, points.length - 1)) * width;
                    const sample = Math.abs(points[i]) < threshold ? 0 : points[i];
                    const y = centerY + sample * centerY * gain;
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }

                ctx.stroke();

                if (style === 'mirror') {
                    ctx.beginPath();
                    for (let i = 0; i < points.length; i++) {
                        const x = (i / Math.max(1, points.length - 1)) * width;
                        const sample = Math.abs(points[i]) < threshold ? 0 : points[i];
                        const y = centerY - sample * centerY * gain;
                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                    ctx.stroke();
                }
            }

            ctx.shadowBlur = 0;
        } else {
            const amplitude = ($isPlaying ? $rms : 0.02) * height * 0.35;
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            ctx.lineTo(width, centerY + amplitude);
            ctx.strokeStyle = `${secondary}66`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.restore();

        animationId = requestAnimationFrame(drawLoop);
    }
</script>

<div
    class={compact ? 'compact-waveform' : 'waveform-container'}
    style={`--wave-bg:${$params.backgroundColor}; --wave-primary:${$params.primaryColor}; --wave-secondary:${$params.secondaryColor};`}
>
    <canvas bind:this={canvas}></canvas>
</div>

<style>
    .waveform-container {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, color-mix(in srgb, var(--wave-secondary) 6%, transparent), color-mix(in srgb, var(--wave-bg) 84%, #000 16%));
        pointer-events: none;
    }

    .compact-waveform {
        width: 100%;
        height: 60px;
        background: color-mix(in srgb, var(--wave-bg) 76%, transparent);
    }

    canvas {
        width: 100%;
        height: 100%;
        display: block;
    }
</style>
