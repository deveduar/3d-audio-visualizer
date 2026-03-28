<script lang="ts">
    import { sidebarOpen } from '$lib/stores/playlistStore';
    import { sharedCameraZoom, params } from '$lib/stores/params';

    const min = 0.1;
    const max = 30.0;

    const logMin = Math.log10(min);
    const logMax = Math.log10(max);

    function handleInput(e: Event) {
        if (!$params.cameraEnableZoom) return;
        const val = parseFloat((e.target as HTMLInputElement).value);
        sharedCameraZoom.set(Math.pow(10, val));
    }

    function handleWheel(e: WheelEvent) {
        if (!$params.cameraEnableZoom) return;
        e.stopPropagation();
        e.preventDefault();
        sharedCameraZoom.update(z => {
            const step = z * 0.1;
            const next = z + (e.deltaY < 0 ? step : -step);
            return Math.max(min, Math.min(max, next));
        });
    }

    const percent = $derived.by(() => {
        const currentLog = Math.log10($sharedCameraZoom);
        const p = ((currentLog - logMin) / (logMax - logMin)) * 100;
        return Math.max(0, Math.min(100, p));
    });
</script>

{#if $params.showZoomControl}
<div 
    class="zoom-control {$params.cameraEnableZoom ? '' : 'zoom-disabled'} {$sidebarOpen ? 'sidebar-open' : ''}" 
    onwheel={handleWheel}
>
    <div class="zoom-label">ZOOM</div>
    <div class="slider-container">
        <input 
            type="range" 
            min={logMin} 
            max={logMax} 
            step="0.001" 
            value={Math.log10($sharedCameraZoom)} 
            oninput={handleInput}
            class="vertical-slider"
            style="--percent: {percent}%"
            disabled={!$params.cameraEnableZoom}
        />
    </div>
    <div class="zoom-value">{$sharedCameraZoom.toFixed(2)}x</div>
</div>
{/if}

<style>
    .zoom-control {
        position: absolute;
        left: 30px;
        top: 60%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        z-index: 110;
        pointer-events: auto;
        user-select: none;
        transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .zoom-control.sidebar-open {
        left: 326px; /* Offset to slide past sidebar */
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
