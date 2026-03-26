import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';

export type DisplayMode = 'sphere' | 'waveform';
export type GeometryType = 'icosahedron' | 'sphere' | 'torus' | 'cube';
export type WaveformStyle = 'line' | 'bars' | 'mirror';
export type RenderMode = 'wireframe' | 'solid';
export type CameraMode = 'locked' | 'orbit' | 'reactive' | 'orbit-reactive';
export type ThemeMode = 'dark' | 'light';
export type ThemePreset = 'mono' | 'sunset' | 'ice' | 'acid';

export interface VisualParams {
    displayMode: DisplayMode;
    geometryType: GeometryType;
    renderMode: RenderMode;
    waveformStyle: WaveformStyle;
    cameraMode: CameraMode;
    cameraDistance: number;
    cameraReactiveAmount: number;
    cameraDamping: number;
    cameraEnableZoom: boolean;
    cameraEnablePan: boolean;
    themeMode: ThemeMode;
    themePreset: ThemePreset;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    noiseSpeed: number;
    noiseAmp: number;
    noiseFreq: number;
    wireframeOpacity: number;
    postEnabled: boolean;
    bloomStrength: number;
    bloomRadius: number;
    bloomThreshold: number;
    baseRadius: number;
    showMeters: boolean;
    showBands: boolean;
    showImpactOverlay: boolean;
    showOverlayLines: boolean;
    impactSensitivity: number;
    impactFlash: number;
    impactFrame: number;
}

export type VisualPresetMap = Record<string, VisualParams>;

export interface ThemePalette {
    themeMode: ThemeMode;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
}

export const defaultVisualParams: VisualParams = {
    displayMode: 'sphere',
    geometryType: 'icosahedron',
    renderMode: 'wireframe',
    waveformStyle: 'line',
    cameraMode: 'orbit-reactive',
    cameraDistance: 80,
    cameraReactiveAmount: 0.7,
    cameraDamping: 0.1,
    cameraEnableZoom: false,
    cameraEnablePan: false,
    themeMode: 'dark',
    themePreset: 'mono',
    primaryColor: '#ffffff',
    secondaryColor: '#9f9f9f',
    backgroundColor: '#000000',
    noiseSpeed: 0.6,
    noiseAmp: 15,
    noiseFreq: 0.1,
    wireframeOpacity: 1.0,
    postEnabled: true,
    bloomStrength: 0.5,
    bloomRadius: 0.5,
    bloomThreshold: 0.2,
    baseRadius: 20,
    showMeters: true,
    showBands: true,
    showImpactOverlay: true,
    showOverlayLines: true,
    impactSensitivity: 0.08,
    impactFlash: 0.9,
    impactFrame: 1
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

export const THEME_PRESETS: Record<ThemePreset, ThemePalette> = {
    mono: {
        themeMode: 'dark',
        primaryColor: '#ffffff',
        secondaryColor: '#9f9f9f',
        backgroundColor: '#000000'
    },
    sunset: {
        themeMode: 'dark',
        primaryColor: '#ff8a3d',
        secondaryColor: '#ff4d6d',
        backgroundColor: '#12040d'
    },
    ice: {
        themeMode: 'dark',
        primaryColor: '#aef4ff',
        secondaryColor: '#55a7ff',
        backgroundColor: '#03111c'
    },
    acid: {
        themeMode: 'dark',
        primaryColor: '#d7ff3f',
        secondaryColor: '#00f5b0',
        backgroundColor: '#020805'
    }
};

function isDisplayMode(value: unknown): value is DisplayMode {
    return value === 'sphere' || value === 'waveform';
}

function isGeometryType(value: unknown): value is GeometryType {
    return value === 'icosahedron' || value === 'sphere' || value === 'torus' || value === 'cube';
}

function isWaveformStyle(value: unknown): value is WaveformStyle {
    return value === 'line' || value === 'bars' || value === 'mirror';
}

function isRenderMode(value: unknown): value is RenderMode {
    return value === 'wireframe' || value === 'solid';
}

function isCameraMode(value: unknown): value is CameraMode {
    return value === 'locked' || value === 'orbit' || value === 'reactive' || value === 'orbit-reactive';
}

function isThemeMode(value: unknown): value is ThemeMode {
    return value === 'dark' || value === 'light';
}

function isThemePreset(value: unknown): value is ThemePreset {
    return value === 'mono' || value === 'sunset' || value === 'ice' || value === 'acid';
}

function sanitizeParams(value: Partial<VisualParams> | null | undefined): VisualParams {
    return {
        displayMode: isDisplayMode(value?.displayMode) ? value.displayMode : defaultVisualParams.displayMode,
        geometryType: isGeometryType(value?.geometryType) ? value.geometryType : defaultVisualParams.geometryType,
        renderMode: isRenderMode(value?.renderMode) ? value.renderMode : defaultVisualParams.renderMode,
        waveformStyle: isWaveformStyle(value?.waveformStyle) ? value.waveformStyle : defaultVisualParams.waveformStyle,
        cameraMode: isCameraMode(value?.cameraMode) ? value.cameraMode : defaultVisualParams.cameraMode,
        cameraDistance: typeof value?.cameraDistance === 'number' ? value.cameraDistance : defaultVisualParams.cameraDistance,
        cameraReactiveAmount:
            typeof value?.cameraReactiveAmount === 'number'
                ? value.cameraReactiveAmount
                : defaultVisualParams.cameraReactiveAmount,
        cameraDamping: typeof value?.cameraDamping === 'number' ? value.cameraDamping : defaultVisualParams.cameraDamping,
        cameraEnableZoom:
            typeof value?.cameraEnableZoom === 'boolean' ? value.cameraEnableZoom : defaultVisualParams.cameraEnableZoom,
        cameraEnablePan:
            typeof value?.cameraEnablePan === 'boolean' ? value.cameraEnablePan : defaultVisualParams.cameraEnablePan,
        themeMode: isThemeMode(value?.themeMode) ? value.themeMode : defaultVisualParams.themeMode,
        themePreset: isThemePreset(value?.themePreset) ? value.themePreset : defaultVisualParams.themePreset,
        primaryColor: typeof value?.primaryColor === 'string' ? value.primaryColor : defaultVisualParams.primaryColor,
        secondaryColor: typeof value?.secondaryColor === 'string' ? value.secondaryColor : defaultVisualParams.secondaryColor,
        backgroundColor: typeof value?.backgroundColor === 'string' ? value.backgroundColor : defaultVisualParams.backgroundColor,
        noiseSpeed: typeof value?.noiseSpeed === 'number' ? value.noiseSpeed : defaultVisualParams.noiseSpeed,
        noiseAmp: typeof value?.noiseAmp === 'number' ? value.noiseAmp : defaultVisualParams.noiseAmp,
        noiseFreq: typeof value?.noiseFreq === 'number' ? value.noiseFreq : defaultVisualParams.noiseFreq,
        wireframeOpacity: typeof value?.wireframeOpacity === 'number' ? value.wireframeOpacity : defaultVisualParams.wireframeOpacity,
        postEnabled: typeof value?.postEnabled === 'boolean' ? value.postEnabled : defaultVisualParams.postEnabled,
        bloomStrength: typeof value?.bloomStrength === 'number' ? value.bloomStrength : defaultVisualParams.bloomStrength,
        bloomRadius: typeof value?.bloomRadius === 'number' ? value.bloomRadius : defaultVisualParams.bloomRadius,
        bloomThreshold: typeof value?.bloomThreshold === 'number' ? value.bloomThreshold : defaultVisualParams.bloomThreshold,
        baseRadius: typeof value?.baseRadius === 'number' ? value.baseRadius : defaultVisualParams.baseRadius,
        showMeters: typeof value?.showMeters === 'boolean' ? value.showMeters : defaultVisualParams.showMeters,
        showBands: typeof value?.showBands === 'boolean' ? value.showBands : defaultVisualParams.showBands,
        showImpactOverlay: typeof value?.showImpactOverlay === 'boolean' ? value.showImpactOverlay : defaultVisualParams.showImpactOverlay,
        showOverlayLines: typeof value?.showOverlayLines === 'boolean' ? value.showOverlayLines : defaultVisualParams.showOverlayLines,
        impactSensitivity: typeof value?.impactSensitivity === 'number' ? value.impactSensitivity : defaultVisualParams.impactSensitivity,
        impactFlash: typeof value?.impactFlash === 'number' ? value.impactFlash : defaultVisualParams.impactFlash,
        impactFrame: typeof value?.impactFrame === 'number' ? value.impactFrame : defaultVisualParams.impactFrame
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
export const cameraResetSignal = writable(0);

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

export function getThemePalette(preset: ThemePreset): ThemePalette {
    return THEME_PRESETS[preset];
}

export function resetCameraView(): void {
    cameraResetSignal.update((value) => value + 1);
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
