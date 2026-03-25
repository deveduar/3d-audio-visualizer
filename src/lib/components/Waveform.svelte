<script lang="ts">
    import { waveformData, isPlaying, rms } from '$lib/stores/playlistStore';
    import { onMount } from 'svelte';

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

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(0, 0, width, height);

        if (points.length > 0) {
            ctx.beginPath();
            ctx.lineWidth = compact ? 1.5 : 2.5;
            ctx.strokeStyle = 'rgba(255,255,255,0.96)';

            for (let i = 0; i < points.length; i++) {
                const x = (i / Math.max(1, points.length - 1)) * width;
                const y = centerY + points[i] * centerY * 0.7;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.stroke();
        } else {
            const amplitude = ($isPlaying ? $rms : 0.02) * height * 0.35;
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            ctx.lineTo(width, centerY + amplitude);
            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        animationId = requestAnimationFrame(drawLoop);
    }
</script>

<div class={compact ? 'compact-waveform' : 'waveform-container'}>
    <canvas bind:this={canvas}></canvas>
</div>

<style>
    .waveform-container {
        position: absolute;
        inset: 0;
        background:
            radial-gradient(circle at center, rgba(255, 255, 255, 0.06), transparent 50%),
            linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.82));
        pointer-events: none;
    }

    .compact-waveform {
        width: 100%;
        height: 60px;
        background: rgba(0, 0, 0, 0.5);
    }

    canvas {
        width: 100%;
        height: 100%;
        display: block;
    }
</style>
