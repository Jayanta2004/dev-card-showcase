import AudioEngine from './audio/AudioEngine.js';
import Deck from './audio/Deck.js';
import Mixer from './audio/Mixer.js';
import { Delay, Distortion } from './audio/Effects.js';
import { Controls } from './ui/Controls.js';
import { Waveform } from './ui/Waveform.js';
import Visualizer from './ui/Visuals.js';

console.log("DJJS: Initializing...");

const loader = document.getElementById('loader');
const app = document.getElementById('app');

// Instances
const deckA = new Deck('A');
const deckB = new Deck('B');
const delay = new Delay();
const distortion = new Distortion();

// Routing: Deck -> Mixer -> [Effects] -> Master
// Mixer Output is already connected to Master/Context? NO.
// Mixer.js: this.output = AudioEngine.context.createGain(); 
// We need to connect Mixer.output to Effects -> AudioEngine.masterGain

Mixer.output.connect(distortion.input);
distortion.output.connect(delay.input);
delay.output.connect(AudioEngine.masterGain);

// Connect Decks to Mixer
deckA.gainNode.connect(Mixer.channelA.input);
deckB.gainNode.connect(Mixer.channelB.input);

// UI
const waveformA = new Waveform('waveform-a', '#00bcd4');
const waveformB = new Waveform('waveform-b', '#ff4081');
const controls = new Controls({ 'A': deckA, 'B': deckB }, Mixer, { delay, distortion });

import AutoDJ from './utils/AutoDJ.js';
AutoDJ.init(Mixer, { 'A': deckA, 'B': deckB }, { delay, distortion });

// Bind Top Bar Buttons
document.getElementById('auto-play-btn').addEventListener('click', (e) => {
    const isActive = AutoDJ.toggleAuto();
    e.target.classList.toggle('active', isActive);
});

document.getElementById('chaos-btn').addEventListener('click', () => {
    AutoDJ.triggerChaos();
});

// Audio Context requires user interaction
loader.addEventListener('click', async () => {
    try {
        await AudioEngine.init();

        // Load default tracks (for demo)
        // Ideally we fetch some short loops or synths. 
        // For now, let's try to generate or load play.
        // Since I cannot access internet files reliably without CORS, 
        // I will Generate Simple Test Tone Buffers or allow Drag/Drop later.
        // For MVP: Let's GENERATE a beat.

        await loadDemoTracks();

        // Transition UI
        loader.style.opacity = 0;
        setTimeout(() => {
            loader.style.display = 'none';
            app.style.display = 'flex';
            waveformA.resize();
            waveformB.resize();
            Visualizer.start();
            console.log("DJJS: System Active");
        }, 500);

    } catch (e) {
        console.error("DJJS: Audio Init Failed", e);
        alert("Audio Init Failed: " + e.message);
    }
});

async function loadDemoTracks() {
    // Generate simple buffers if Playback fails, but let's try to fetch if possible.
    // Or just create noise.

    // Let's create a procedural beat (Kick + HiHat) for A
    // And a Pad for B
    const bufferA = createBeatBuffer(120);
    deckA.load(bufferA);
    waveformA.load(bufferA);

    const bufferB = createPadBuffer();
    deckB.load(bufferB);
    waveformB.load(bufferB);
}

function createBeatBuffer(bpm) {
    const sr = AudioEngine.context.sampleRate;
    const len = sr * 4; // 4 seconds loop
    const buffer = AudioEngine.context.createBuffer(1, len, sr);
    const data = buffer.getChannelData(0);

    const beatLen = sr * (60 / bpm);

    for (let i = 0; i < len; i++) {
        const beatPos = i % parseInt(beatLen);
        // Kick
        if (beatPos < 1000) data[i] = (1 - beatPos / 1000) * Math.sin(i * 0.01);
        // Hat on offbeat
        if (i % parseInt(beatLen / 2) > parseInt(beatLen / 2) - 500) {
            data[i] += (Math.random() * 2 - 1) * 0.1;
        }
    }
    return buffer;
}

function createPadBuffer() {
    const sr = AudioEngine.context.sampleRate;
    const len = sr * 4;
    const buffer = AudioEngine.context.createBuffer(1, len, sr);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < len; i++) {
        // AM/FM Pad
        data[i] = Math.sin(i * 0.01) * Math.sin(i * 0.005) * 0.5;
        // Stereo? This is mono buffer.
    }
    return buffer;
}

