import { writable, derived, get } from 'svelte/store';
// @ts-ignore
import jsmediatags from 'jsmediatags';

export interface Track {
    id: string;
    name: string;
    url: string;
    coverUrl?: string;
    customCover?: boolean;
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
export const transient = writable(0);
export const dbLevel = writable(-60);
export const lufs = writable(-60);
export const waveformData = writable<Float32Array | null>(null);
export const autoPlay = writable(true);
export const repeat = writable(false);
export const sidebarOpen = writable(false);

export const currentTrack = derived(
    [tracks, currentIndex],
    ([$tracks, $currentIndex]) => $tracks[$currentIndex] || null
);

let objectUrls: string[] = [];
let coverUrls: string[] = [];

function extractCover(blob: Blob): Promise<string | undefined> {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            console.warn('Metadata extraction timed out');
            resolve(undefined);
        }, 4000);

        try {
            jsmediatags.read(blob, {
                onSuccess: (tag: any) => {
                    clearTimeout(timeout);
                    const { picture } = tag.tags;
                    if (picture) {
                        const { data, format } = picture;
                        const uint8 = new Uint8Array(data);
                        const coverBlob = new Blob([uint8], { type: format });
                        const url = URL.createObjectURL(coverBlob);
                        coverUrls.push(url);
                        resolve(url);
                    } else {
                        resolve(undefined);
                    }
                },
                onError: (error: any) => {
                    clearTimeout(timeout);
                    console.warn('Metadata extraction error:', error);
                    resolve(undefined);
                }
            });
        } catch (error) {
            clearTimeout(timeout);
            console.warn('JSmediatags crash:', error);
            resolve(undefined);
        }
    });
}

const STATIC_TRACKS = [
    '/track.mp3',
    '/lain drop_26.mp3',
    '/time every3_1554.mp3'
];

export async function loadStaticTracks(): Promise<void> {
    const results = await Promise.all(
        STATIC_TRACKS.map(async (url): Promise<Track | null> => {
            try {
                const name = url.split('/').pop() || 'Unknown';
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const blob = await response.blob();
                const coverUrl = await extractCover(blob);
                
                return {
                    id: crypto.randomUUID(),
                    name,
                    url,
                    coverUrl,
                    duration: 0,
                    blob
                };
            } catch (err) {
                console.warn(`Failed to load static track ${url}:`, err);
                return null;
            }
        })
    );
    
    const loadedTracks: Track[] = results.filter((t): t is Track => t !== null);
    
    tracks.set(loadedTracks);
    if (loadedTracks.length > 0) {
        currentIndex.set(0);
    }
}

export async function addTracks(files: File[]): Promise<void> {
    const newTracks: Track[] = await Promise.all(
        files.map(async (file) => {
            const coverUrl = await extractCover(file);
            return {
                id: crypto.randomUUID(),
                name: file.name,
                url: URL.createObjectURL(file),
                coverUrl,
                duration: 0,
                blob: file
            };
        })
    );
    
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
            
            if (track.coverUrl) {
                URL.revokeObjectURL(track.coverUrl);
                coverUrls = coverUrls.filter(url => url !== track.coverUrl);
            }
            
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

export function moveTrack(fromIndex: number, toIndex: number): void {
    tracks.update(($tracks) => {
        if (
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >= $tracks.length ||
            toIndex >= $tracks.length ||
            fromIndex === toIndex
        ) {
            return $tracks;
        }

        const reordered = [...$tracks];
        const [moved] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, moved);

        const current = get(currentIndex);
        if (current === fromIndex) {
            currentIndex.set(toIndex);
        } else if (fromIndex < current && toIndex >= current) {
            currentIndex.set(current - 1);
        } else if (fromIndex > current && toIndex <= current) {
            currentIndex.set(current + 1);
        }

        return reordered;
    });
}

export function updateTrackCover(id: string, file: File): void {
    const url = URL.createObjectURL(file);
    coverUrls.push(url);
    
    tracks.update($tracks => {
        return $tracks.map(t => {
            if (t.id === id) {
                if (t.coverUrl && !t.coverUrl.startsWith('/')) { // Only revoke if it's a blob URL
                     URL.revokeObjectURL(t.coverUrl);
                     coverUrls = coverUrls.filter(u => u !== t.coverUrl);
                }
                return { ...t, coverUrl: url, customCover: true };
            }
            return t;
        });
    });
}

export function cleanup(): void {
    objectUrls.forEach(url => URL.revokeObjectURL(url));
    coverUrls.forEach(url => URL.revokeObjectURL(url));
    objectUrls = [];
    coverUrls = [];
    tracks.set([]);
    currentIndex.set(0);
    isPlaying.set(false);
    currentTime.set(0);
    duration.set(0);
    rms.set(0);
    bass.set(0);
    mid.set(0);
    treble.set(0);
    transient.set(0);
    dbLevel.set(-60);
    lufs.set(-60);
    waveformData.set(null);
    sidebarOpen.set(false);
}
