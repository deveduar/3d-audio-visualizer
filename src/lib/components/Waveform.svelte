<script lang="ts">
    import { isPlaying, rms } from '$lib/stores/playlistStore';
    import { onMount } from 'svelte';
    
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null = null;
    let animationId: number | null = null;
    let bars: number[] = Array(64).fill(0);
    
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
        
        ctx.clearRect(0, 0, width, height);
        
        const barCount = bars.length;
        const barWidth = width / barCount;
        
        for (let i = 0; i < barCount; i++) {
            const target = $isPlaying ? Math.random() * $rms * 100 : 0;
            bars[i] += (target - bars[i]) * 0.3;
            
            const barHeight = bars[i] * height;
            const x = i * barWidth;
            const y = (height - barHeight) / 2;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + bars[i] * 0.7})`;
            ctx.fillRect(x, y, barWidth - 2, barHeight);
        }
        
        animationId = requestAnimationFrame(drawLoop);
    }
</script>

<div class="waveform-container">
    <canvas bind:this={canvas}></canvas>
</div>

<style>
    .waveform-container {
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
