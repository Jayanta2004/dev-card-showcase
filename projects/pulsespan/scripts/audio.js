/**
 * Sonic Focus Engine
 * Uses Web Audio API to generate focus-enhancing soundscapes
 */
const AudioEngine = {
    ctx: null,
    isPlaying: false,
    gainNode: null,
    noiseNode: null,
    oscillator1: null,
    oscillator2: null, // For binaural beat

    init: () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            AudioEngine.ctx = new AudioContext();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    },

    toggle: () => {
        if (!AudioEngine.ctx) AudioEngine.init();
        if (AudioEngine.ctx.state === 'suspended') AudioEngine.ctx.resume();

        if (AudioEngine.isPlaying) {
            AudioEngine.stop();
        } else {
            AudioEngine.start();
        }
        return AudioEngine.isPlaying;
    },

    start: () => {
        if (AudioEngine.isPlaying) return;

        // Master Gain (Volume)
        AudioEngine.gainNode = AudioEngine.ctx.createGain();
        AudioEngine.gainNode.gain.value = 0.05; // Low volume background
        AudioEngine.gainNode.connect(AudioEngine.ctx.destination);

        // 1. Brown Noise Generator (Soft background rumble)
        const bufferSize = 2 * AudioEngine.ctx.sampleRate;
        const buffer = AudioEngine.ctx.createBuffer(1, bufferSize, AudioEngine.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; // Compensate for gain
        }

        AudioEngine.noiseNode = AudioEngine.ctx.createBufferSource();
        AudioEngine.noiseNode.buffer = buffer;
        AudioEngine.noiseNode.loop = true;
        AudioEngine.noiseNode.connect(AudioEngine.gainNode);
        AudioEngine.noiseNode.start();

        // 2. Binaural Beats (Alpha Waves ~10Hz for Flow)
        // Left Ear 440Hz, Right Ear 450Hz = 10Hz beat
        AudioEngine.oscillator1 = AudioEngine.ctx.createOscillator();
        AudioEngine.oscillator1.type = 'sine';
        AudioEngine.oscillator1.frequency.value = 200; // Carrier

        AudioEngine.oscillator2 = AudioEngine.ctx.createOscillator();
        AudioEngine.oscillator2.type = 'sine';
        AudioEngine.oscillator2.frequency.value = 210; // +10Hz Alpha beat

        // Stereo Panner
        const merger = AudioEngine.ctx.createChannelMerger(2);

        AudioEngine.oscillator1.connect(merger, 0, 0); // Left
        AudioEngine.oscillator2.connect(merger, 0, 1); // Right

        merger.connect(AudioEngine.gainNode);

        AudioEngine.oscillator1.start();
        AudioEngine.oscillator2.start();

        AudioEngine.isPlaying = true;
    },

    stop: () => {
        if (!AudioEngine.isPlaying) return;

        const now = AudioEngine.ctx.currentTime;
        // Fade out
        AudioEngine.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1);

        setTimeout(() => {
            if (AudioEngine.noiseNode) AudioEngine.noiseNode.stop();
            if (AudioEngine.oscillator1) AudioEngine.oscillator1.stop();
            if (AudioEngine.oscillator2) AudioEngine.oscillator2.stop();
            AudioEngine.isPlaying = false;
        }, 1000);
    }
};

window.AudioEngine = AudioEngine;
