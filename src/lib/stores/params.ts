import { writable } from 'svelte/store';

export type DisplayMode = 'sphere' | 'waveform';
export type GeometryType = 'icosahedron' | 'sphere' | 'torus' | 'octahedron';

export interface VisualParams {
    displayMode: DisplayMode;
    geometryType: GeometryType;
    noiseSpeed: number;
    noiseAmp: number;
    noiseFreq: number;
    wireframeOpacity: number;
    bloomStrength: number;
    bloomRadius: number;
    bloomThreshold: number;
    baseRadius: number;
}

export const params = writable<VisualParams>({
    displayMode: 'sphere',
    geometryType: 'icosahedron',
    noiseSpeed: 0.6,
    noiseAmp: 15,
    noiseFreq: 0.1,
    wireframeOpacity: 1.0,
    bloomStrength: 0.5,
    bloomRadius: 0.5,
    bloomThreshold: 0.2,
    baseRadius: 20
});
