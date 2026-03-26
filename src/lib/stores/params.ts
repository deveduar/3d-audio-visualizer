import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';

export type DisplayMode = 'sphere' | 'waveform';
export type GeometryType = 'icosahedron' | 'sphere' | 'torus' | 'cube';
export type WaveformStyle = 'line' | 'bars' | 'mirror';

export interface VisualParams {
    displayMode: DisplayMode;
    geometryType: GeometryType;
    waveformStyle: WaveformStyle;
    noiseSpeed: number;
    noiseAmp: number;
    noiseFreq: number;
    wireframeOpacity: number;
    bloomStrength: number;
    bloomRadius: number;
    bloomThreshold: number;
    baseRadius: number;
    showMeters: boolean;
}

export type VisualPresetMap = Record<string, VisualParams>;

export const defaultVisualParams: VisualParams = {
    displayMode: 'sphere',
    geometryType: 'icosahedron',
    waveformStyle: 'line',
    noiseSpeed: 0.6,
    noiseAmp: 15,
    noiseFreq: 0.1,
    wireframeOpacity: 1.0,
    bloomStrength: 0.5,
    bloomRadius: 0.5,
    bloomThreshold: 0.2,
    baseRadius: 20,
    showMeters: true
};

const DEFAULT_PRESETS: VisualPresetMap = {
    default: { ...defaultVisualParams },
    pulse_torus: {
        ...defaultVisualParams,
        geometryType: 'torus',
        noiseAmp: 22,
        noiseSpeed: 0.9,
        baseRadius: 16
    },
    flat_wave: {
        ...defaultVisualParams,
        displayMode: 'waveform',
        waveformStyle: 'mirror',
        noiseAmp: 8,
        noiseFreq: 0.05
    }
};

const STORAGE_KEY = 'visualizer-presets';

function isDisplayMode(value: unknown): value is DisplayMode {
    return value === 'sphere' || value === 'waveform';
}

function isGeometryType(value: unknown): value is GeometryType {
    return value === 'icosahedron' || value === 'sphere' || value === 'torus' || value === 'cube';
}

function isWaveformStyle(value: unknown): value is WaveformStyle {
    return value === 'line' || value === 'bars' || value === 'mirror';
}

function sanitizeParams(value: Partial<VisualParams> | null | undefined): VisualParams {
    return {
        displayMode: isDisplayMode(value?.displayMode) ? value.displayMode : defaultVisualParams.displayMode,
        geometryType: isGeometryType(value?.geometryType) ? value.geometryType : defaultVisualParams.geometryType,
        waveformStyle: isWaveformStyle(value?.waveformStyle) ? value.waveformStyle : defaultVisualParams.waveformStyle,
        noiseSpeed: typeof value?.noiseSpeed === 'number' ? value.noiseSpeed : defaultVisualParams.noiseSpeed,
        noiseAmp: typeof value?.noiseAmp === 'number' ? value.noiseAmp : defaultVisualParams.noiseAmp,
        noiseFreq: typeof value?.noiseFreq === 'number' ? value.noiseFreq : defaultVisualParams.noiseFreq,
        wireframeOpacity: typeof value?.wireframeOpacity === 'number' ? value.wireframeOpacity : defaultVisualParams.wireframeOpacity,
        bloomStrength: typeof value?.bloomStrength === 'number' ? value.bloomStrength : defaultVisualParams.bloomStrength,
        bloomRadius: typeof value?.bloomRadius === 'number' ? value.bloomRadius : defaultVisualParams.bloomRadius,
        bloomThreshold: typeof value?.bloomThreshold === 'number' ? value.bloomThreshold : defaultVisualParams.bloomThreshold,
        baseRadius: typeof value?.baseRadius === 'number' ? value.baseRadius : defaultVisualParams.baseRadius,
        showMeters: typeof value?.showMeters === 'boolean' ? value.showMeters : defaultVisualParams.showMeters
    };
}

function readStoredPresets(): VisualPresetMap {
    if (!browser) {
        return { ...DEFAULT_PRESETS };
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return { ...DEFAULT_PRESETS };
        }

        const parsed = JSON.parse(raw) as Record<string, Partial<VisualParams>>;
        const normalized = Object.fromEntries(
            Object.entries(parsed).map(([name, preset]) => [name, sanitizeParams(preset)])
        );

        return {
            ...DEFAULT_PRESETS,
            ...normalized
        };
    } catch {
        return { ...DEFAULT_PRESETS };
    }
}

function writeStoredPresets(presets: VisualPresetMap): void {
    if (!browser) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

export const params = writable<VisualParams>({ ...defaultVisualParams });

export function getPresetMap(): VisualPresetMap {
    return readStoredPresets();
}

export function getPresetNames(): string[] {
    return Object.keys(readStoredPresets());
}

export function savePreset(name: string, values: VisualParams = get(params)): string[] {
    const trimmedName = name.trim().toLowerCase().replace(/\s+/g, '_');
    if (!trimmedName) {
        return getPresetNames();
    }

    const presets = readStoredPresets();
    presets[trimmedName] = sanitizeParams(values);
    writeStoredPresets(presets);
    return Object.keys(presets);
}

export function loadPreset(name: string): VisualParams | null {
    const preset = readStoredPresets()[name];
    if (!preset) {
        return null;
    }

    const normalized = sanitizeParams(preset);
    params.set(normalized);
    return normalized;
}

export function deletePreset(name: string): string[] {
    if (name in DEFAULT_PRESETS) {
        return getPresetNames();
    }

    const presets = readStoredPresets();
    delete presets[name];
    writeStoredPresets(presets);
    return Object.keys(presets);
}

export function resetParams(): void {
    params.set({ ...defaultVisualParams });
}

export function exportPresets(): string {
    return JSON.stringify(readStoredPresets(), null, 2);
}

export function importPresets(json: string): string[] {
    const parsed = JSON.parse(json) as Record<string, Partial<VisualParams>>;
    const presets = readStoredPresets();

    for (const [name, preset] of Object.entries(parsed)) {
        const trimmedName = name.trim().toLowerCase().replace(/\s+/g, '_');
        if (!trimmedName) continue;
        presets[trimmedName] = sanitizeParams(preset);
    }

    writeStoredPresets(presets);
    return Object.keys(presets);
}
