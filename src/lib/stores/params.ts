import { writable } from 'svelte/store';

export const params = writable({
    noiseSpeed: 0.6,
    noiseAmp: 15,
    noiseFreq: 0.1,
    wireframeOpacity: 1.0,
    bloomStrength: 0.5,
    bloomRadius: 0.5,
    bloomThreshold: 0.2,
    baseRadius: 20
});
