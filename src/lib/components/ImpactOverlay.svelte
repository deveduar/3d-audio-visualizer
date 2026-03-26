<script lang="ts">
    import { onMount } from 'svelte';
    import { currentIndex, transient } from '$lib/stores/playlistStore';
    import { params } from '$lib/stores/params';

    let impact = $state(0);
    let flash = $state(0);
    let framePulse = $state(0);
    let pulseSeed = $state(0);
    let lineOffset = $state(0);
    let animationId: number | null = null;
    let lastTransient = 0;
    let lastTrackIndex = -1;

    function tick() {
        impact *= 0.9;
        flash *= 0.86;
        framePulse *= 0.92;
        animationId = requestAnimationFrame(tick);
    }

    onMount(() => {
        const unsubTransient = transient.subscribe((value) => {
            if (!$params.showImpactOverlay) {
                lastTransient = value;
                return;
            }

            if (value > $params.impactSensitivity && value >= lastTransient) {
                const shapedImpact = Math.min(1, value * (1.8 + $params.impactFrame * 0.4));
                impact = Math.max(impact, shapedImpact);
                flash = Math.max(flash, Math.min(1, shapedImpact * $params.impactFlash));
                framePulse = Math.max(framePulse, Math.min(1, shapedImpact * (0.85 + $params.impactFrame * 0.55)));
                pulseSeed += 1;
                lineOffset = ((pulseSeed * 7) % 22) - 11;
            }
            lastTransient = value;
        });

        const unsubIndex = currentIndex.subscribe((value) => {
            if ($params.showImpactOverlay && lastTrackIndex !== -1 && value !== lastTrackIndex) {
                flash = 0.45 * $params.impactFlash;
                framePulse = 0.65 * $params.impactFrame;
                pulseSeed += 1;
                lineOffset = ((pulseSeed * 7) % 22) - 11;
            }
            lastTrackIndex = value;
        });

        tick();

        return () => {
            unsubTransient();
            unsubIndex();
            if (animationId) cancelAnimationFrame(animationId);
        };
    });
</script>

{#if $params.showImpactOverlay}
    <div
        class="impact-overlay"
        style={`--impact:${impact}; --flash:${flash}; --frame:${framePulse}; --line-offset:${lineOffset}px; --burst-alpha:${$params.cameraEnablePan ? 0 : 1};`}
    >
        <div class="impact-burst"></div>
        <div class="impact-lines"></div>
    </div>
{/if}

<style>
    .impact-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 20;
        overflow: hidden;
    }

    .impact-burst,
    .impact-lines {
        position: absolute;
        inset: 0;
        pointer-events: none;
    }

    .impact-burst {
        opacity: calc(var(--flash) * 0.65 * var(--burst-alpha));
        background:
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.32), transparent 22%),
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12), transparent 48%);
        transform: scale(calc(1 + var(--impact) * 0.35));
        mix-blend-mode: screen;
    }

    .impact-lines {
        opacity: calc(var(--impact) * 0.45);
        background:
            repeating-linear-gradient(
                180deg,
                rgba(255,255,255,0.08) 0px,
                rgba(255,255,255,0.08) 1px,
                transparent 1px,
                transparent 8px
            );
        transform:
            translateY(var(--line-offset))
            scaleY(calc(1 + var(--impact) * 0.08));
        mix-blend-mode: screen;
    }

</style>
