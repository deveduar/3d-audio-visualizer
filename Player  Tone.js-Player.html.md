---
title: "Player | Tone.js-Player.html"
source: "https://tonejs.github.io/docs/14.9.17/classes/Player.html"
published:
date_saved: 2026-03-25 15:48
description: "Documentation for Tone.js"
tags:
  - "JS"
source_domain: "github.io"
---
# Player | Tone.js-Player.html
> [!example] Date: 2026-03-25 15:48	
> [Read Original](https://tonejs.github.io/docs/14.9.17/classes/Player.html)
#JS
## Highlights
- 

# Content
- [Tone.js](https://tonejs.github.io/docs/14.9.17/modules.html)
- [Player](https://tonejs.github.io/docs/14.9.17/classes/Player.html)

# Class Player

Player is an audio file player with start, loop, and stop functions.

#### Example

```ts
const player = new Tone.Player("https://tonejs.github.io/audio/berklee/gong_1.mp3").toDestination();// play as soon as the buffer is loadedplayer.autostart = true;
```

#### Hierarchy

- Source<[PlayerOptions](https://tonejs.github.io/docs/14.9.17/interfaces/PlayerOptions.html)>
    - Player

- Defined in [Tone/source/buffer/Player.ts:33](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L33)

### Constructors

[constructor](https://tonejs.github.io/docs/14.9.17/classes/Player.html#constructor)

### Properties

[autostart](https://tonejs.github.io/docs/14.9.17/classes/Player.html#autostart)[context](https://tonejs.github.io/docs/14.9.17/classes/Player.html#context)[debug](https://tonejs.github.io/docs/14.9.17/classes/Player.html#debug)[fadeIn](https://tonejs.github.io/docs/14.9.17/classes/Player.html#fadeIn)[fadeOut](https://tonejs.github.io/docs/14.9.17/classes/Player.html#fadeOut)[input](https://tonejs.github.io/docs/14.9.17/classes/Player.html#input)[name](https://tonejs.github.io/docs/14.9.17/classes/Player.html#name)[onstop](https://tonejs.github.io/docs/14.9.17/classes/Player.html#onstop)[output](https://tonejs.github.io/docs/14.9.17/classes/Player.html#output)[volume](https://tonejs.github.io/docs/14.9.17/classes/Player.html#volume)[version](https://tonejs.github.io/docs/14.9.17/classes/Player.html#version)

### Accessors

[blockTime](https://tonejs.github.io/docs/14.9.17/classes/Player.html#blockTime)[buffer](https://tonejs.github.io/docs/14.9.17/classes/Player.html#buffer)[channelCount](https://tonejs.github.io/docs/14.9.17/classes/Player.html#channelCount)[channelCountMode](https://tonejs.github.io/docs/14.9.17/classes/Player.html#channelCountMode)[channelInterpretation](https://tonejs.github.io/docs/14.9.17/classes/Player.html#channelInterpretation)[disposed](https://tonejs.github.io/docs/14.9.17/classes/Player.html#disposed)[loaded](https://tonejs.github.io/docs/14.9.17/classes/Player.html#loaded)[loop](https://tonejs.github.io/docs/14.9.17/classes/Player.html#loop)[loopEnd](https://tonejs.github.io/docs/14.9.17/classes/Player.html#loopEnd)[loopStart](https://tonejs.github.io/docs/14.9.17/classes/Player.html#loopStart)[mute](https://tonejs.github.io/docs/14.9.17/classes/Player.html#mute)[numberOfInputs](https://tonejs.github.io/docs/14.9.17/classes/Player.html#numberOfInputs)[numberOfOutputs](https://tonejs.github.io/docs/14.9.17/classes/Player.html#numberOfOutputs)[playbackRate](https://tonejs.github.io/docs/14.9.17/classes/Player.html#playbackRate)[reverse](https://tonejs.github.io/docs/14.9.17/classes/Player.html#reverse)[sampleTime](https://tonejs.github.io/docs/14.9.17/classes/Player.html#sampleTime)[state](https://tonejs.github.io/docs/14.9.17/classes/Player.html#state)

### Methods

[chain](https://tonejs.github.io/docs/14.9.17/classes/Player.html#chain)[connect](https://tonejs.github.io/docs/14.9.17/classes/Player.html#connect)[disconnect](https://tonejs.github.io/docs/14.9.17/classes/Player.html#disconnect)[dispose](https://tonejs.github.io/docs/14.9.17/classes/Player.html#dispose)[fan](https://tonejs.github.io/docs/14.9.17/classes/Player.html#fan)[get](https://tonejs.github.io/docs/14.9.17/classes/Player.html#get)[immediate](https://tonejs.github.io/docs/14.9.17/classes/Player.html#immediate)[load](https://tonejs.github.io/docs/14.9.17/classes/Player.html#load)[now](https://tonejs.github.io/docs/14.9.17/classes/Player.html#now)[restart](https://tonejs.github.io/docs/14.9.17/classes/Player.html#restart)[seek](https://tonejs.github.io/docs/14.9.17/classes/Player.html#seek)[set](https://tonejs.github.io/docs/14.9.17/classes/Player.html#set)[setLoopPoints](https://tonejs.github.io/docs/14.9.17/classes/Player.html#setLoopPoints)[start](https://tonejs.github.io/docs/14.9.17/classes/Player.html#start)[stop](https://tonejs.github.io/docs/14.9.17/classes/Player.html#stop)[sync](https://tonejs.github.io/docs/14.9.17/classes/Player.html#sync)[toDestination](https://tonejs.github.io/docs/14.9.17/classes/Player.html#toDestination)[toFrequency](https://tonejs.github.io/docs/14.9.17/classes/Player.html#toFrequency)[toMaster](https://tonejs.github.io/docs/14.9.17/classes/Player.html#toMaster)[toSeconds](https://tonejs.github.io/docs/14.9.17/classes/Player.html#toSeconds)[toString](https://tonejs.github.io/docs/14.9.17/classes/Player.html#toString)[toTicks](https://tonejs.github.io/docs/14.9.17/classes/Player.html#toTicks)[unsync](https://tonejs.github.io/docs/14.9.17/classes/Player.html#unsync)[getDefaults](https://tonejs.github.io/docs/14.9.17/classes/Player.html#getDefaults)

## Constructors

### constructor[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#constructor)

- new Player(url?, onload?): [Player](https://tonejs.github.io/docs/14.9.17/classes/Player.html)[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#constructor.new_Player)
- #### Parameters
    
    - `Optional` url: string | AudioBuffer | [ToneAudioBuffer](https://tonejs.github.io/docs/14.9.17/classes/ToneAudioBuffer.html)
        
        Either the AudioBuffer or the url from which to load the AudioBuffer
        
    - `Optional` onload: (() => void)
        
        The function to invoke when the buffer is loaded.
        
        - - (): void
            - #### Returns void
                
    
    #### Returns [Player](https://tonejs.github.io/docs/14.9.17/classes/Player.html)
    
    Overrides Source<PlayerOptions>.constructor
    
    - Defined in [Tone/source/buffer/Player.ts:88](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L88)
    
- new Player(options?): [Player](https://tonejs.github.io/docs/14.9.17/classes/Player.html)[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#constructor.new_Player-1)
- #### Parameters
    
    - `Optional` options: Partial<[PlayerOptions](https://tonejs.github.io/docs/14.9.17/interfaces/PlayerOptions.html)>
    
    #### Returns [Player](https://tonejs.github.io/docs/14.9.17/classes/Player.html)
    
    Overrides Source<PlayerOptions>.constructor
    
    - Defined in [Tone/source/buffer/Player.ts:92](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L92)
    

## Properties

### autostart[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#autostart)

autostart: boolean

If the file should play as soon as the buffer is loaded.

- Defined in [Tone/source/buffer/Player.ts:40](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L40)

### `Readonly`context[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#context)

context: [BaseContext](https://tonejs.github.io/docs/14.9.17/classes/BaseContext.html)

The context belonging to the node.

Inherited from Source.context

- Defined in [Tone/core/context/ToneWithContext.ts:40](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneWithContext.ts#L40)

### debug[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#debug)

debug: boolean = false

Set this debug flag to log all events that happen in this class.

Inherited from Source.debug

- Defined in [Tone/core/Tone.ts:50](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/Tone.ts#L50)

### fadeIn[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#fadeIn)

fadeIn: [Unit](https://tonejs.github.io/docs/14.9.17/modules/Unit.html).[Time](https://tonejs.github.io/docs/14.9.17/types/Unit.Time.html)

The fadeIn time of the amplitude envelope.

- Defined in [Tone/source/buffer/Player.ts:76](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L76)

### fadeOut[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#fadeOut)

fadeOut: [Unit](https://tonejs.github.io/docs/14.9.17/modules/Unit.html).[Time](https://tonejs.github.io/docs/14.9.17/types/Unit.Time.html)

The fadeOut time of the amplitude envelope.

- Defined in [Tone/source/buffer/Player.ts:82](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L82)

### input[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#input)

input: undefined = undefined

Sources have no inputs

Inherited from Source.input

- Defined in [Tone/source/Source.ts:63](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/Source.ts#L63)

### `Readonly`name[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#name)

name: string = "Player"

Overrides Source.name

- Defined in [Tone/source/buffer/Player.ts:34](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L34)

### onstop[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#onstop)

onstop: onStopCallback

The callback to invoke when the source is stopped.

Inherited from Source.onstop

- Defined in [Tone/source/Source.ts:76](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/Source.ts#L76)

### output[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#output)

output: [OutputNode](https://tonejs.github.io/docs/14.9.17/types/OutputNode.html)

The output node

Inherited from Source.output

- Defined in [Tone/source/Source.ts:58](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/Source.ts#L58)

### volume[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#volume)

volume: [Param](https://tonejs.github.io/docs/14.9.17/classes/Param.html)<"decibels">

The volume of the output in decibels.

#### Example

```ts
const source = new Tone.PWMOscillator().toDestination();source.volume.value = -6;
```

Inherited from Source.volume

- Defined in [Tone/source/Source.ts:71](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/Source.ts#L71)

### `Static`version[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#version)

version: string = version

The version number semver

Inherited from Source.version

- Defined in [Tone/core/Tone.ts:29](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/Tone.ts#L29)

## Accessors

### blockTime[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#blockTime)

- get blockTime(): number
- The number of seconds of 1 processing block (128 samples)
    
    #### Returns number
    
    #### Example
    
    ```ts
    console.log(Tone.Destination.blockTime);
    ```
    
    Inherited from Source.blockTime
    
    - Defined in [Tone/core/context/ToneWithContext.ts:108](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneWithContext.ts#L108)
    

### buffer[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#buffer)

- get buffer(): [ToneAudioBuffer](https://tonejs.github.io/docs/14.9.17/classes/ToneAudioBuffer.html)
- The audio buffer belonging to the player.
    
    #### Returns [ToneAudioBuffer](https://tonejs.github.io/docs/14.9.17/classes/ToneAudioBuffer.html)
    
    - Defined in [Tone/source/buffer/Player.ts:369](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L369)
    
- set buffer(buffer): void
- #### Parameters
    
    - buffer: [ToneAudioBuffer](https://tonejs.github.io/docs/14.9.17/classes/ToneAudioBuffer.html)
    
    #### Returns void
    
    - Defined in [Tone/source/buffer/Player.ts:372](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L372)
    

### channelCount[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#channelCount)

- get channelCount(): number
- channelCount is the number of channels used when up-mixing and down-mixing connections to any inputs to the node. The default value is 2 except for specific nodes where its value is specially determined.
    
    #### Returns number
    
    Inherited from Source.channelCount
    
    - Defined in [Tone/core/context/ToneAudioNode.ts:147](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneAudioNode.ts#L147)
    
- set channelCount(channelCount): void
- #### Parameters
    
    - channelCount: number
    
    #### Returns void
    
    Inherited from Source.channelCount
    
    - Defined in [Tone/core/context/ToneAudioNode.ts:150](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneAudioNode.ts#L150)
    

### channelCountMode[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#channelCountMode)

- get channelCountMode(): ChannelCountMode
- channelCountMode determines how channels will be counted when up-mixing and down-mixing connections to any inputs to the node. The default value is "max". This attribute has no effect for nodes with no inputs.
    
    - "max" - computedNumberOfChannels is the maximum of the number of channels of all connections to an input. In this mode channelCount is ignored.
    - "clamped-max" - computedNumberOfChannels is determined as for "max" and then clamped to a maximum value of the given channelCount.
    - "explicit" - computedNumberOfChannels is the exact value as specified by the channelCount.
    
    #### Returns ChannelCountMode
    
    Inherited from Source.channelCountMode
    
    - Defined in [Tone/core/context/ToneAudioNode.ts:164](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneAudioNode.ts#L164)
    
- set channelCountMode(channelCountMode): void
- #### Parameters
    
    - channelCountMode: ChannelCountMode
    
    #### Returns void
    
    Inherited from Source.channelCountMode
    
    - Defined in [Tone/core/context/ToneAudioNode.ts:167](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneAudioNode.ts#L167)
    

### channelInterpretation[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#channelInterpretation)

- get channelInterpretation(): ChannelInterpretation
- channelInterpretation determines how individual channels will be treated when up-mixing and down-mixing connections to any inputs to the node. The default value is "speakers".
    
    #### Returns ChannelInterpretation
    
    Inherited from Source.channelInterpretation
    
    - Defined in [Tone/core/context/ToneAudioNode.ts:178](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneAudioNode.ts#L178)
    
- set channelInterpretation(channelInterpretation): void
- #### Parameters
    
    - channelInterpretation: ChannelInterpretation
    
    #### Returns void
    
    Inherited from Source.channelInterpretation
    
    - Defined in [Tone/core/context/ToneAudioNode.ts:181](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneAudioNode.ts#L181)
    

### disposed[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#disposed)

- get disposed(): boolean
- Indicates if the instance was disposed. 'Disposing' an instance means that all of the Web Audio nodes that were created for the instance are disconnected and freed for garbage collection.
    
    #### Returns boolean
    
    Inherited from Source.disposed
    
    - Defined in [Tone/core/Tone.ts:94](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/Tone.ts#L94)
    

### loaded[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#loaded)

- get loaded(): boolean
- If the buffer is loaded
    
    #### Returns boolean
    
    - Defined in [Tone/source/buffer/Player.ts:452](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L452)
    

### loop[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#loop)

- get loop(): boolean
- If the buffer should loop once it's over.
    
    #### Returns boolean
    
    #### Example
    
    ```ts
    const player = new Tone.Player("https://tonejs.github.io/audio/drum-samples/breakbeat.mp3").toDestination();player.loop = true;player.autostart = true;
    ```
    
    - Defined in [Tone/source/buffer/Player.ts:383](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L383)
    
- set loop(loop): void
- #### Parameters
    
    - loop: boolean
    
    #### Returns void
    
    - Defined in [Tone/source/buffer/Player.ts:386](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L386)
    

### loopEnd[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#loopEnd)

- get loopEnd(): [Unit](https://tonejs.github.io/docs/14.9.17/modules/Unit.html).[Time](https://tonejs.github.io/docs/14.9.17/types/Unit.Time.html)
- If loop is true, the loop will end at this position.
    
    #### Returns [Unit](https://tonejs.github.io/docs/14.9.17/modules/Unit.html).[Time](https://tonejs.github.io/docs/14.9.17/types/Unit.Time.html)
    
    - Defined in [Tone/source/buffer/Player.ts:352](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L352)
    
- set loopEnd(loopEnd): void
- #### Parameters
    
    - loopEnd: [Unit](https://tonejs.github.io/docs/14.9.17/modules/Unit.html).[Time](https://tonejs.github.io/docs/14.9.17/types/Unit.Time.html)
    
    #### Returns void
    
    - Defined in [Tone/source/buffer/Player.ts:355](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L355)
    

### loopStart[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#loopStart)

- get loopStart(): [Unit](https://tonejs.github.io/docs/14.9.17/modules/Unit.html).[Time](https://tonejs.github.io/docs/14.9.17/types/Unit.Time.html)
- If loop is true, the loop will start at this position.
    
    #### Returns [Unit](https://tonejs.github.io/docs/14.9.17/modules/Unit.html).[Time](https://tonejs.github.io/docs/14.9.17/types/Unit.Time.html)
    
    - Defined in [Tone/source/buffer/Player.ts:335](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L335)
    
- set loopStart(loopStart): void
- #### Parameters
    
    - loopStart: [Unit](https://tonejs.github.io/docs/14.9.17/modules/Unit.html).[Time](https://tonejs.github.io/docs/14.9.17/types/Unit.Time.html)
    
    #### Returns void
    
    - Defined in [Tone/source/buffer/Player.ts:338](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L338)
    

### mute[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#mute)

- get mute(): boolean
- Mute the output.
    
    #### Returns boolean
    
    #### Example
    
    ```ts
    const osc = new Tone.Oscillator().toDestination().start();// mute the outputosc.mute = true;
    ```
    
    Inherited from Source.mute
    
    - Defined in [Tone/source/Source.ts:159](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/Source.ts#L159)
    
- set mute(mute): void
- #### Parameters
    
    - mute: boolean
    
    #### Returns void
    
    Inherited from Source.mute
    
    - Defined in [Tone/source/Source.ts:162](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/Source.ts#L162)
    

### numberOfInputs[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#numberOfInputs)

- get numberOfInputs(): number
- The number of inputs feeding into the AudioNode. For source nodes, this will be 0.
    
    #### Returns number
    
    #### Example
    
    ```ts
    const node = new Tone.Gain();console.log(node.numberOfInputs);
    ```
    
    Inherited from Source.numberOfInputs
    
    - Defined in [Tone/core/context/ToneAudioNode.ts:52](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneAudioNode.ts#L52)
    

### numberOfOutputs[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#numberOfOutputs)

- get numberOfOutputs(): number
- The number of outputs of the AudioNode.
    
    #### Returns number
    
    #### Example
    
    ```ts
    const node = new Tone.Gain();console.log(node.numberOfOutputs);
    ```
    
    Inherited from Source.numberOfOutputs
    
    - Defined in [Tone/core/context/ToneAudioNode.ts:70](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneAudioNode.ts#L70)
    

### playbackRate[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#playbackRate)

- get playbackRate(): number
- Normal speed is 1. The pitch will change with the playback rate.
    
    #### Returns number
    
    #### Example
    
    ```ts
    const player = new Tone.Player("https://tonejs.github.io/audio/berklee/femalevoices_aa2_A5.mp3").toDestination();// play at 1/4 speedplayer.playbackRate = 0.25;// play as soon as the buffer is loadedplayer.autostart = true;
    ```
    
    - Defined in [Tone/source/buffer/Player.ts:414](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L414)
    
- set playbackRate(rate): void
- #### Parameters
    
    - rate: number
    
    #### Returns void
    
    - Defined in [Tone/source/buffer/Player.ts:417](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L417)
    

### reverse[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#reverse)

- get reverse(): boolean
- If the buffer should be reversed. Note that this sets the underlying [ToneAudioBuffer.reverse](https://tonejs.github.io/docs/14.9.17/classes/ToneAudioBuffer.html#reverse), so if multiple players are pointing at the same ToneAudioBuffer, they will all be reversed.
    
    #### Returns boolean
    
    #### Example
    
    ```ts
    const player = new Tone.Player("https://tonejs.github.io/audio/berklee/chime_1.mp3").toDestination();player.autostart = true;player.reverse = true;
    ```
    
    - Defined in [Tone/source/buffer/Player.ts:442](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L442)
    
- set reverse(rev): void
- #### Parameters
    
    - rev: boolean
    
    #### Returns void
    
    - Defined in [Tone/source/buffer/Player.ts:445](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L445)
    

### sampleTime[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#sampleTime)

- get sampleTime(): number
- The duration in seconds of one sample.
    
    #### Returns number
    
    Inherited from Source.sampleTime
    
    - Defined in [Tone/core/context/ToneWithContext.ts:99](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneWithContext.ts#L99)
    

### state[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#state)

- get state(): [BasicPlaybackState](https://tonejs.github.io/docs/14.9.17/types/BasicPlaybackState.html)
- Returns the playback state of the source, either "started" or "stopped".
    
    #### Returns [BasicPlaybackState](https://tonejs.github.io/docs/14.9.17/types/BasicPlaybackState.html)
    
    #### Example
    
    ```ts
    const player = new Tone.Player("https://tonejs.github.io/audio/berklee/ahntone_c3.mp3", () => {    player.start();    console.log(player.state);}).toDestination();
    ```
    
    Inherited from Source.state
    
    - Defined in [Tone/source/Source.ts:138](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/Source.ts#L138)
    

## Methods

### chain[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#chain)

- chain(...nodes): this[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#chain.chain-1)
- Connect the output of this node to the rest of the nodes in series.
    
    #### Parameters
    
    - `Rest` ...nodes: [InputNode](https://tonejs.github.io/docs/14.9.17/types/InputNode.html)[]
    
    #### Returns this
    
    #### Example
    
    ```ts
    const player = new Tone.Player("https://tonejs.github.io/audio/drum-samples/handdrum-loop.mp3");player.autostart = true;const filter = new Tone.AutoFilter(4).start();const distortion = new Tone.Distortion(0.5);// connect the player to the filter, distortion and then to the master outputplayer.chain(filter, distortion, Tone.Destination);
    ```
    
    Inherited from Source.chain
    
    - Defined in [Tone/core/context/ToneAudioNode.ts:241](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneAudioNode.ts#L241)
    

### connect[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#connect)

- connect(destination, outputNum?, inputNum?): this[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#connect.connect-1)
- connect the output of a ToneAudioNode to an AudioParam, AudioNode, or ToneAudioNode
    
    #### Parameters
    
    - destination: [InputNode](https://tonejs.github.io/docs/14.9.17/types/InputNode.html)
        
        The output to connect to
        
    - outputNum: number = 0
        
        The output to connect from
        
    - inputNum: number = 0
        
        The input to connect to
        
    
    #### Returns this
    
    Inherited from Source.connect
    
    - Defined in [Tone/core/context/ToneAudioNode.ts:197](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneAudioNode.ts#L197)
    

### disconnect[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#disconnect)

- disconnect(destination?, outputNum?, inputNum?): this[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#disconnect.disconnect-1)
- disconnect the output
    
    #### Parameters
    
    - `Optional` destination: [InputNode](https://tonejs.github.io/docs/14.9.17/types/InputNode.html)
    - outputNum: number = 0
    - inputNum: number = 0
    
    #### Returns this
    
    Inherited from Source.disconnect
    
    - Defined in [Tone/core/context/ToneAudioNode.ts:226](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneAudioNode.ts#L226)
    

### dispose[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#dispose)

- dispose(): this[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#dispose.dispose-1)
- #### Returns this
    
    Overrides Source.dispose
    
    - Defined in [Tone/source/buffer/Player.ts:456](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L456)
    

### fan[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#fan)

- fan(...nodes): this[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#fan.fan-1)
- connect the output of this node to the rest of the nodes in parallel.
    
    #### Parameters
    
    - `Rest` ...nodes: [InputNode](https://tonejs.github.io/docs/14.9.17/types/InputNode.html)[]
    
    #### Returns this
    
    #### Example
    
    ```ts
    const player = new Tone.Player("https://tonejs.github.io/audio/drum-samples/conga-rhythm.mp3");player.autostart = true;const pitchShift = new Tone.PitchShift(4).toDestination();const filter = new Tone.Filter("G5").toDestination();// connect a node to the pitch shift and filter in parallelplayer.fan(pitchShift, filter);
    ```
    
    Inherited from Source.fan
    
    - Defined in [Tone/core/context/ToneAudioNode.ts:256](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneAudioNode.ts#L256)
    

### get[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#get)

- get(): [PlayerOptions](https://tonejs.github.io/docs/14.9.17/interfaces/PlayerOptions.html)[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#get.get-1)
- Get the object's attributes.
    
    #### Returns [PlayerOptions](https://tonejs.github.io/docs/14.9.17/interfaces/PlayerOptions.html)
    
    #### Example
    
    ```ts
    const osc = new Tone.Oscillator();console.log(osc.get());
    ```
    
    Inherited from Source.get
    
    - Defined in [Tone/core/context/ToneWithContext.ts:170](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneWithContext.ts#L170)
    

### immediate[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#immediate)

- immediate(): number[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#immediate.immediate-1)
- Return the current time of the Context clock without any lookAhead.
    
    #### Returns number
    
    #### Example
    
    ```ts
    setInterval(() => {    console.log(Tone.immediate());}, 100);
    ```
    
    Inherited from Source.immediate
    
    - Defined in [Tone/core/context/ToneWithContext.ts:92](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneWithContext.ts#L92)
    

### load[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#load)

- load(url): Promise<[Player](https://tonejs.github.io/docs/14.9.17/classes/Player.html)>[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#load.load-1)
- Load the audio file as an audio buffer. Decodes the audio asynchronously and invokes the callback once the audio buffer loads. Note: this does not need to be called if a url was passed in to the constructor. Only use this if you want to manually load a new url.
    
    #### Parameters
    
    - url: string
        
        The url of the buffer to load. Filetype support depends on the browser.
        
    
    #### Returns Promise<[Player](https://tonejs.github.io/docs/14.9.17/classes/Player.html)>
    
    - Defined in [Tone/source/buffer/Player.ts:144](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L144)
    

### now[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#now)

- now(): number[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#now.now-1)
- Return the current time of the Context clock plus the lookAhead.
    
    #### Returns number
    
    #### Example
    
    ```ts
    setInterval(() => {    console.log(Tone.now());}, 100);
    ```
    
    Inherited from Source.now
    
    - Defined in [Tone/core/context/ToneWithContext.ts:81](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneWithContext.ts#L81)
    

### restart[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#restart)

- restart(time?, offset?, duration?): this[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#restart.restart-1)
- Stop and then restart the player from the beginning (or offset)
    
    #### Parameters
    
    - `Optional` time: number
        
        When the player should start.
        
    - `Optional` offset: [Unit](https://tonejs.github.io/docs/14.9.17/modules/Unit.html).[Time](https://tonejs.github.io/docs/14.9.17/types/Unit.Time.html)
        
        The offset from the beginning of the sample to start at.
        
    - `Optional` duration: [Unit](https://tonejs.github.io/docs/14.9.17/modules/Unit.html).[Time](https://tonejs.github.io/docs/14.9.17/types/Unit.Time.html)
        
        How long the sample should play. If no duration is given, it will default to the full length of the sample (minus any offset)
        
    
    #### Returns this
    
    Overrides Source.restart
    
    - Defined in [Tone/source/buffer/Player.ts:281](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L281)
    

### seek[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#seek)

- seek(offset, when?): this[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#seek.seek-1)
- Seek to a specific time in the player's buffer. If the source is no longer playing at that time, it will stop.
    
    #### Parameters
    
    - offset: [Unit](https://tonejs.github.io/docs/14.9.17/modules/Unit.html).[Time](https://tonejs.github.io/docs/14.9.17/types/Unit.Time.html)
        
        The time to seek to.
        
    - `Optional` when: [Unit](https://tonejs.github.io/docs/14.9.17/modules/Unit.html).[Time](https://tonejs.github.io/docs/14.9.17/types/Unit.Time.html)
        
        The time for the seek event to occur.
        
    
    #### Returns this
    
    #### Example
    
    ```ts
    const player = new Tone.Player("https://tonejs.github.io/audio/berklee/gurgling_theremin_1.mp3", () => {    player.start();    // seek to the offset in 1 second from now    player.seek(0.4, "+1");}).toDestination();
    ```
    
    - Defined in [Tone/source/buffer/Player.ts:303](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L303)
    

### set[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#set)

- set(props): this[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#set.set-1)
- Set multiple properties at once with an object.
    
    #### Parameters
    
    - props: RecursivePartial<[PlayerOptions](https://tonejs.github.io/docs/14.9.17/interfaces/PlayerOptions.html)>
    
    #### Returns this
    
    #### Example
    
    ```ts
    const filter = new Tone.Filter().toDestination();// set values using an objectfilter.set({    frequency: "C6",    type: "highpass"});const player = new Tone.Player("https://tonejs.github.io/audio/berklee/Analogsynth_octaves_highmid.mp3").connect(filter);player.autostart = true;
    ```
    
    Inherited from Source.set
    
    - Defined in [Tone/core/context/ToneWithContext.ts:215](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneWithContext.ts#L215)
    

### setLoopPoints[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#setLoopPoints)

- setLoopPoints(loopStart, loopEnd): this[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#setLoopPoints.setLoopPoints-1)
- Set the loop start and end. Will only loop if loop is set to true.
    
    #### Parameters
    
    - loopStart: [Unit](https://tonejs.github.io/docs/14.9.17/modules/Unit.html).[Time](https://tonejs.github.io/docs/14.9.17/types/Unit.Time.html)
        
        The loop start time
        
    - loopEnd: [Unit](https://tonejs.github.io/docs/14.9.17/modules/Unit.html).[Time](https://tonejs.github.io/docs/14.9.17/types/Unit.Time.html)
        
        The loop end time
        
    
    #### Returns this
    
    #### Example
    
    ```ts
    const player = new Tone.Player("https://tonejs.github.io/audio/berklee/malevoices_aa2_F3.mp3").toDestination();// loop between the given pointsplayer.setLoopPoints(0.2, 0.3);player.loop = true;player.autostart = true;
    ```
    
    - Defined in [Tone/source/buffer/Player.ts:326](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L326)
    

### start[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#start)

- start(time?, offset?, duration?): this[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#start.start-1)
- Play the buffer at the given startTime. Optionally add an offset and/or duration which will play the buffer from a position within the buffer for the given duration.
    
    #### Parameters
    
    - `Optional` time: [Unit](https://tonejs.github.io/docs/14.9.17/modules/Unit.html).[Time](https://tonejs.github.io/docs/14.9.17/types/Unit.Time.html)
        
        When the player should start.
        
    - `Optional` offset: [Unit](https://tonejs.github.io/docs/14.9.17/modules/Unit.html).[Time](https://tonejs.github.io/docs/14.9.17/types/Unit.Time.html)
        
        The offset from the beginning of the sample to start at.
        
    - `Optional` duration: [Unit](https://tonejs.github.io/docs/14.9.17/modules/Unit.html).[Time](https://tonejs.github.io/docs/14.9.17/types/Unit.Time.html)
        
        How long the sample should play. If no duration is given, it will default to the full length of the sample (minus any offset)
        
    
    #### Returns this
    
    Overrides Source.start
    
    - Defined in [Tone/source/buffer/Player.ts:189](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L189)
    

### stop[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#stop)

- stop(time?): this[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#stop.stop-1)
- Stop the source at the specified time. If no time is given, stop the source now.
    
    #### Parameters
    
    - `Optional` time: [Unit](https://tonejs.github.io/docs/14.9.17/modules/Unit.html).[Time](https://tonejs.github.io/docs/14.9.17/types/Unit.Time.html)
        
        When the source should be stopped.
        
    
    #### Returns this
    
    #### Example
    
    ```ts
    const source = new Tone.Oscillator().toDestination();source.start();source.stop("+0.5"); // stops the source 0.5 seconds from now
    ```
    
    Inherited from Source.stop
    
    - Defined in [Tone/source/Source.ts:264](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/Source.ts#L264)
    

### sync[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#sync)

- sync(): this[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#sync.sync-1)
- Sync the source to the Transport so that all subsequent calls to `start` and `stop` are synced to the TransportTime instead of the AudioContext time.
    
    #### Returns this
    
    #### Example
    
    ```ts
    const osc = new Tone.Oscillator().toDestination();// sync the source so that it plays between 0 and 0.3 on the Transport's timelineosc.sync().start(0).stop(0.3);// start the transport.Tone.Transport.start();// set it to loop once a secondTone.Transport.loop = true;Tone.Transport.loopEnd = 1;
    ```
    
    Inherited from Source.sync
    
    - Defined in [Tone/source/Source.ts:317](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/Source.ts#L317)
    

### toDestination[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#toDestination)

- toDestination(): this[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#toDestination.toDestination-1)
- Connect the output to the context's destination node.
    
    #### Returns this
    
    #### Example
    
    ```ts
    const osc = new Tone.Oscillator("C2").start();osc.toDestination();
    ```
    
    Inherited from Source.toDestination
    
    - Defined in [Tone/core/context/ToneAudioNode.ts:208](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneAudioNode.ts#L208)
    

### toFrequency[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#toFrequency)

- toFrequency(freq): number[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#toFrequency.toFrequency-1)
- Convert the input to a frequency number
    
    #### Parameters
    
    - freq: [Unit](https://tonejs.github.io/docs/14.9.17/modules/Unit.html).[Frequency](https://tonejs.github.io/docs/14.9.17/types/Unit.Frequency.html)
    
    #### Returns number
    
    #### Example
    
    ```ts
    const gain = new Tone.Gain();console.log(gain.toFrequency("4n"));
    ```
    
    Inherited from Source.toFrequency
    
    - Defined in [Tone/core/context/ToneWithContext.ts:132](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneWithContext.ts#L132)
    

### toMaster[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#toMaster)

- toMaster(): this[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#toMaster.toMaster-1)
- Connect the output to the context's destination node.
    
    #### Returns this
    
    #### See
    
    [toDestination](https://tonejs.github.io/docs/14.9.17/classes/Player.html#toDestination)
    
    #### Deprecated
    
    Inherited from Source.toMaster
    
    - Defined in [Tone/core/context/ToneAudioNode.ts:218](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneAudioNode.ts#L218)
    

### toSeconds[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#toSeconds)

- toSeconds(time?): number[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#toSeconds.toSeconds-1)
- Convert the incoming time to seconds. This is calculated against the current TransportClass bpm
    
    #### Parameters
    
    - `Optional` time: [Unit](https://tonejs.github.io/docs/14.9.17/modules/Unit.html).[Time](https://tonejs.github.io/docs/14.9.17/types/Unit.Time.html)
    
    #### Returns number
    
    #### Example
    
    ```ts
    const gain = new Tone.Gain();setInterval(() => console.log(gain.toSeconds("4n")), 100);// ramp the tempo to 60 bpm over 30 secondsTone.getTransport().bpm.rampTo(60, 30);
    ```
    
    Inherited from Source.toSeconds
    
    - Defined in [Tone/core/context/ToneWithContext.ts:121](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneWithContext.ts#L121)
    

### toString[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#toString)

- toString(): string[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#toString.toString-1)
- Convert the class to a string
    
    #### Returns string
    
    #### Example
    
    ```ts
    const osc = new Tone.Oscillator();console.log(osc.toString());
    ```
    
    Inherited from Source.toString
    
    - Defined in [Tone/core/Tone.ts:104](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/Tone.ts#L104)
    

### toTicks[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#toTicks)

- toTicks(time?): number[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#toTicks.toTicks-1)
- Convert the input time into ticks
    
    #### Parameters
    
    - `Optional` time: [Unit](https://tonejs.github.io/docs/14.9.17/modules/Unit.html).[Time](https://tonejs.github.io/docs/14.9.17/types/Unit.Time.html) | [TimeClass](https://tonejs.github.io/docs/14.9.17/classes/TimeClass.html)<number, TimeBaseUnit>
    
    #### Returns number
    
    #### Example
    
    ```ts
    const gain = new Tone.Gain();console.log(gain.toTicks("4n"));
    ```
    
    Inherited from Source.toTicks
    
    - Defined in [Tone/core/context/ToneWithContext.ts:142](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/core/context/ToneWithContext.ts#L142)
    

### unsync[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#unsync)

- unsync(): this[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#unsync.unsync-1)
- Unsync the source to the Transport.
    
    #### Returns this
    
    #### See
    
    [sync](https://tonejs.github.io/docs/14.9.17/classes/Player.html#sync)
    
    Inherited from Source.unsync
    
    - Defined in [Tone/source/Source.ts:368](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/Source.ts#L368)
    

### `Static`getDefaults[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#getDefaults)

- getDefaults(): [PlayerOptions](https://tonejs.github.io/docs/14.9.17/interfaces/PlayerOptions.html)[](https://tonejs.github.io/docs/14.9.17/classes/Player.html#getDefaults.getDefaults-1)
- #### Returns [PlayerOptions](https://tonejs.github.io/docs/14.9.17/interfaces/PlayerOptions.html)
    
    Overrides Source.getDefaults
    
    - Defined in [Tone/source/buffer/Player.ts:120](https://github.com/Tonejs/Tone.js/blob/28c921f93acfb1510715dbffa981f5a7c108a0a3/Tone/source/buffer/Player.ts#L120)