import { writable, derived, get } from 'svelte/store';

export interface Track {
    id: string;
    name: string;
    url: string;
    duration: number;
    blob: Blob;
}

export const tracks = writable<Track[]>([]);
export const currentIndex = writable(0);
export const isPlaying = writable(false);
export const currentTime = writable(0);
export const duration = writable(0);
export const volume = writable(0.8);
export const rms = writable(0);
export const bass = writable(0);
export const mid = writable(0);
export const treble = writable(0);
export const waveformData = writable<Float32Array | null>(null);
export const autoPlay = writable(true);
export const repeat = writable(false);

export const currentTrack = derived(
    [tracks, currentIndex],
    ([$tracks, $currentIndex]) => $tracks[$currentIndex] || null
);

let objectUrls: string[] = [];

const STATIC_TRACKS = [
    '/track.mp3',
    '/lain drop_26.mp3',
    '/time every3_1554.mp3'
];

export async function loadStaticTracks(): Promise<void> {
    const loadedTracks: Track[] = await Promise.all(
        STATIC_TRACKS.map(async (url) => {
            const name = url.split('/').pop() || 'Unknown';
            return {
                id: crypto.randomUUID(),
                name,
                url,
                duration: 0,
                blob: new Blob()
            };
        })
    );
    
    tracks.set(loadedTracks);
    if (loadedTracks.length > 0) {
        currentIndex.set(0);
    }
}

export function addTracks(files: File[]): void {
    const newTracks: Track[] = files.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        url: URL.createObjectURL(file),
        duration: 0,
        blob: file
    }));
    
    objectUrls.push(...newTracks.map(t => t.url));
    
    tracks.update(t => [...t, ...newTracks]);
    
    if (get(tracks).length === newTracks.length) {
        currentIndex.set(0);
    }
}

export function removeTrack(id: string): void {
    tracks.update(t => {
        const index = t.findIndex(track => track.id === id);
        if (index !== -1) {
            const track = t[index];
            URL.revokeObjectURL(track.url);
            objectUrls = objectUrls.filter(url => url !== track.url);
            
            const current = get(currentIndex);
            if (index < current) {
                currentIndex.update(i => i - 1);
            } else if (index === current && t.length > 1) {
                currentIndex.set(Math.max(0, current - 1));
            }
            return t.filter(track => track.id !== id);
        }
        return t;
    });
}

export function playNext(): void {
    const $tracks = get(tracks);
    const $currentIndex = get(currentIndex);
    if ($tracks.length > 0) {
        currentIndex.set(($currentIndex + 1) % $tracks.length);
    }
}

export function playPrev(): void {
    const $tracks = get(tracks);
    const $currentIndex = get(currentIndex);
    if ($tracks.length > 0) {
        currentIndex.set($currentIndex === 0 ? $tracks.length - 1 : $currentIndex - 1);
    }
}

export function playTrack(index: number): void {
    const $tracks = get(tracks);
    if (index >= 0 && index < $tracks.length) {
        currentIndex.set(index);
    }
}

export function cleanup(): void {
    objectUrls.forEach(url => URL.revokeObjectURL(url));
    objectUrls = [];
    tracks.set([]);
    currentIndex.set(0);
    isPlaying.set(false);
    currentTime.set(0);
    duration.set(0);
}
