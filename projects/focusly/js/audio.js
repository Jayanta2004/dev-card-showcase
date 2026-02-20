/**
 * js/audio.js
 * Web Audio API Engine for Binaural Beats & Soundscapes
 */

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.nodes = {
            leftOsc: null,
            rightOsc: null,
            gain: null,
            noise: null
        };
        this.active = false;

        // Frequencies for binaural beats
        // Alpha (8-13Hz): Relaxed focus
        // Beta (14-30Hz): Active concentration
        // Theta (4-8Hz): Deep meditation
        this.presets = {
            training: { base: 200, diff: 15 }, // Beta (High Focus)
            flow: { base: 200, diff: 10 },    // Alpha (Relaxed)
            zen: { base: 180, diff: 6 }       // Theta (Deep)
        };
    }

    async init() {
        if (this.ctx) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.nodes.gain = this.ctx.createGain();
        this.nodes.gain.gain.value = 0.1; // Base volume low
        this.nodes.gain.connect(this.ctx.destination);
    }

    start(mode = 'training') {
        if (!window.appState.get('config.settings.sound')) return;
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        this.stop(); // Clear existing

        const preset = this.presets[mode] || this.presets.training;

        // Create Oscillators (Left & Right)
        this.nodes.leftOsc = this.ctx.createOscillator();
        this.nodes.rightOsc = this.ctx.createOscillator();

        this.nodes.leftOsc.type = 'sine';
        this.nodes.rightOsc.type = 'sine';

        // Binaural Beat Calculation
        // Left Ear: Base Hz
        // Right Ear: Base + Diff Hz
        this.nodes.leftOsc.frequency.value = preset.base;
        this.nodes.rightOsc.frequency.value = preset.base + preset.diff;

        // Panning
        const pannerL = this.ctx.createStereoPanner();
        pannerL.pan.value = -1;

        const pannerR = this.ctx.createStereoPanner();
        pannerR.pan.value = 1;

        this.nodes.leftOsc.connect(pannerL);
        pannerL.connect(this.nodes.gain);

        this.nodes.rightOsc.connect(pannerR);
        pannerR.connect(this.nodes.gain);

        // Fade in
        this.nodes.gain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.nodes.gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 4);

        this.nodes.leftOsc.start();
        this.nodes.rightOsc.start();

        this.active = true;
    }

    stop() {
        if (!this.active) return;

        // Fade out
        if (this.nodes.gain) {
            this.nodes.gain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.nodes.gain.gain.setValueAtTime(this.nodes.gain.gain.value, this.ctx.currentTime);
            this.nodes.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
        }

        setTimeout(() => {
            if (this.nodes.leftOsc) {
                this.nodes.leftOsc.stop();
                this.nodes.leftOsc.disconnect();
                this.nodes.leftOsc = null;
            }
            if (this.nodes.rightOsc) {
                this.nodes.rightOsc.stop();
                this.nodes.rightOsc.disconnect();
                this.nodes.rightOsc = null;
            }
        }, 1000);

        this.active = false;
    }

    playGlitch() {
        if (!window.appState.get('config.settings.sound') || !this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }
}

window.appAudio = new AudioEngine();
