<script lang="ts">
    import { sharedCameraZoom, params } from '$lib/stores/params';

    const min = 0.3;
    const max = 3.0;

    function handleInput(e: Event) {
        if (!$params.cameraEnableZoom) return;
        const val = parseFloat((e.target as HTMLInputElement).value);
        sharedCameraZoom.set(val);
    }

    function handleWheel(e: WheelEvent) {
        if (!$params.cameraEnableZoom) return;
        e.stopPropagation();
        e.preventDefault();
        const step = 0.05;
        sharedCameraZoom.update(z => {
            const next = z + (e.deltaY < 0 ? step : -step);
            return Math.max(min, Math.min(max, next));
        });
    }

    const percent = $derived.by(() => {
        const p = (($sharedCameraZoom - min) / (max - min)) * 100;
        return Math.max(0, Math.min(100, p));
    });
</script>

<div 
    class="zoom-control {$params.cameraEnableZoom ? '' : 'zoom-disabled'}" 
    onwheel={handleWheel}
>
    <div class="zoom-label">ZOOM</div>
    <div class="slider-container">
        <input 
            type="range" 
            {min} 
            {max} 
            step="0.01" 
            value={$sharedCameraZoom} 
            oninput={handleInput}
            class="vertical-slider"
            style="--percent: {percent}%"
            disabled={!$params.cameraEnableZoom}
        />
    </div>
    <div class="zoom-value">{$sharedCameraZoom.toFixed(2)}x</div>
</div>

<style>
    .zoom-control {
        position: absolute;
        right: 310px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        z-index: 2000;
        pointer-events: auto;
        user-select: none;
    }

    .zoom-label {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        opacity: 0.5;
        writing-mode: vertical-rl;
    }

    .zoom-value {
        font-size: 11px;
        font-family: monospace;
        opacity: 0.7;
        width: 40px;
        text-align: center;
    }

    .slider-container {
        height: 200px;
        width: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .vertical-slider {
        -webkit-appearance: none;
        appearance: none;
        width: 160px;
        height: 4px;
        background: var(--ui-panel-border);
        transform: rotate(-90deg);
        cursor: ns-resize;
        position: relative;
        outline: none;
        margin: 0;
        transition: opacity 0.2s;
        border-radius: 2px;
    }

    .vertical-slider::-webkit-slider-runnable-track {
        background: linear-gradient(to right, var(--ui-accent) 0%, var(--ui-accent) var(--percent), var(--ui-panel-border) var(--percent));
        height: 100%;
        border-radius: 2px;
    }

    .vertical-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        height: 12px;
        width: 12px;
        border-radius: 50%;
        background: var(--ui-accent);
        cursor: pointer;
        margin-top: -5px;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
        border: 2px solid var(--ui-panel-bg);
    }

    .vertical-slider::-moz-range-thumb {
        height: 12px;
        width: 12px;
        border-radius: 50%;
        background: var(--ui-accent);
        cursor: pointer;
        border: 2px solid var(--ui-panel-bg);
    }

    .zoom-disabled {
        opacity: 0.3;
        pointer-events: none;
        transition: opacity 0.3s ease;
    }

    .vertical-slider:disabled::-webkit-slider-thumb {
        cursor: not-allowed;
        background: var(--ui-scroll-thumbSoft);
    }
</style>
