# 3D Audio Svelte

An experimental audio visualizer built with **SvelteKit**, **Tone.js**, and **Threlte**. This application functions as an audiovisual player featuring playlists, transport controls, audio-reactive 3D visualizations, and a Live Editor panel to adjust shader parameters and switch visual modes in real-time.

## Current Status

The application features a fully functional playback and visualization pipeline:

- **Playlist Management**: Initial static tracks included.
- **Audio Loading**: Support for file uploads via click or drag-and-drop.
- **Sidebar Integration**: Track selection and drag-and-drop reordering.
- **Navigation**: `Prev` and `Next` functionality.
- **Playback Modes**: `AUTO` (autoplay next track) and `LOOP` (repeat current track).
- **Progress Bar**: Seekable timeline with real-time feedback.
- **Volume Control**: Master gain adjustment.
- **3D Visualizer**: Custom shader-based 3D scene.
- **Waveform Mode**: Alternative 2D canvas-based audio signal rendering.
- **Live Editor**: Tweakpane integration to modify display modes, geometries, and shader uniforms.
- **Audio Metrics**: Approximate `dB` and `LUFS` metering.
- **Concurrency Protection**: Basic guardrails against rapid track switching to prevent race conditions.

## Tech Stack

### Frontend
- **Svelte 5** (Runes-based logic)
- **SvelteKit**
- **TypeScript**
- **Vite**

### Audio Engine
- **Tone.js**

### 3D / Visuals
- **Threlte** (Three.js for Svelte)
- **Custom GLSL Shaders**

### UI / Tooling
- **Tweakpane**

## Architecture Overview

- **`src/lib/stores/playlistStore.ts`**: Manages the playlist state, current track, timing, volume, audio analysis, and global states.
- **`src/lib/stores/audioEngine.ts`**: Orchestrates `Tone.Player`, asset loading, playback controls (play/pause/seek), and audio metrics.
- **`src/lib/stores/params.ts`**: Stores reactive parameters for the Live Editor and visualization engine.
- **`src/lib/components/Visualizer.svelte`**: Main layout container (Canvas, Sidebar, Editor, and Player UI).
- **`src/lib/components/Scene.svelte`**: The core Threlte 3D scene.
- **`src/lib/components/WireframeSphere.svelte`**: Audio-reactive shader logic and dynamic geometry switching.
- **`src/lib/components/Waveform.svelte`**: Renders the raw audio signal onto a 2D canvas.
- **`src/lib/components/Sidebar.svelte`**: Track list management, file uploads, and drag-and-drop reordering.
- **`src/lib/components/LiveEditor.svelte`**: Real-time parameter tweaking panel via Tweakpane.
- **`src/lib/components/PlayerUI.svelte`**: Transport controls and progress tracking.

## Visual Modes

The system currently supports two main modes:
- **`sphere`**: Displays the 3D scene with the audio-reactive shader.
- **`waveform`**: Displays a 2D real-time waveform of the audio signal.

## Available Geometries

Using the **Live Editor**, users can toggle between:
- `Icosahedron`
- `Sphere`
- `Torus`
- `Octahedron`

## Editable Parameters

The following can be adjusted in real-time:
- `displayMode` / `geometryType`
- `noiseFreq` / `noiseAmp` / `noiseSpeed`
- `baseRadius` / `wireframeOpacity`
- `bloomStrength` / `bloomRadius` / `bloomThreshold`

*Note: The post-processing block is currently being integrated into a full visual pipeline. Some parameters exist in the store/UI as a foundation for the next iteration.*

## Getting Started

### Install Dependencies
```sh
npm install
```

### Development Mode
```sh
npm run dev
```

### Production Build
```sh
npm run build
```

### Preview Production Build
```sh
npm run preview
```

### Type Checking
```sh
npm run check
```

## Application Workflow

1. **Launch**: Open the app to load the default environment.
2. **Library**: Use pre-loaded tracks or drag-and-drop your own `.mp3` files into the sidebar.
3. **Playback**: Click any track to play. Use transport controls for navigation.
4. **Experiment**: Open the **Live Editor** to switch visual modes and tweak shader math.
5. **Organize**: Reorder your playlist by dragging items within the sidebar.

## Design Conventions
- **Monochrome Aesthetic**: High-contrast black and white theme.
- **Dark Editor UI**: Professional, tool-oriented interface.
- **Typography**: Strictly monospace fonts for a technical feel.
- **Centralized Logic**: Audio and visual states are managed through specialized stores.

## Known Limitations
- **LUFS Metering**: This is a smoothed approximation, not a full EBU R128 standard implementation.
- **Post-Processing**: Bloom parameters are wired to the UI/Store but not yet fully connected to a dedicated post-processing pipeline.
- **Permisssions**: `npm run check` might trigger local system permission errors in certain restricted environments, though the project compiles successfully.

## Roadmap
- Refine audio engine stability under extreme user interaction.
- Connect real-time Bloom and post-processing effects.
- Add additional visual modes and fragment shader effects.
- Enhance drag-and-drop feedback for the playlist.
- Support full metadata extraction (ID3 tags) and real duration for user-uploaded tracks.
 