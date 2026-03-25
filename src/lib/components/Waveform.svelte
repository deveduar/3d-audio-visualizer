<script lang="ts">
    import { waveformData, isPlaying } from '$lib/stores/audioEngine';
    import { onMount } from 'svelte';
    
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null = null;
    
    onMount(() => {
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
        
        return () => {
            window.removeEventListener('resize', resize);
        };
    });
    
    function resize() {
        const rect = canvas.parentElement?.getBoundingClientRect();
        if (rect) {
            canvas.width = rect.width;
            canvas.height = rect.height;
        }
    }
    
    function draw() {
        if (!ctx || !$waveformData) return;
        
        const width = canvas.width;
        const height = canvas.height;
        const data = $waveformData;
        
        ctx.clearRect(0, 0, width, height);
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        const sliceWidth = width / data.length;
        let x = 0;
        
        for (let i = 0; i < data.length; i++) {
            const v = data[i];
            const y = (v + 1) / 2 * height;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        ctx.stroke();
    }
    
    $effect(() => {
        if ($waveformData && ctx) {
            draw();
        }
    });
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
