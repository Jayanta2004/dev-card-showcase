/**
 * NonEuclidScroll | Audio Engine
 * Provides procedural soundscapes and navigation feedback.
 */

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.initialized = false;

        // Audio nodes
        this.masterGain = null;
        this.droneOsc = null;
        this.droneGain = null;
        this.lowpass = null;

        // State
        this.baseFreq = 55; // A1
    }

    /**
     * Start the audio context (must be triggered by user interaction).
     */
    async init() {
        if (this.initialized) return;

        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.3;

        this.initialized = true;
        this.setupBackgroundDrone();
        console.log("Audio Engine Initialized.");
    }

    /**
     * Creates a constant low-frequency drone.
     */
    setupBackgroundDrone() {
        this.droneOsc = this.ctx.createOscillator();
        this.droneGain = this.ctx.createGain();
        this.lowpass = this.ctx.createBiquadFilter();

        this.droneOsc.type = 'sawtooth';
        this.droneOsc.frequency.setValueAtTime(this.baseFreq, this.ctx.currentTime);

        this.lowpass.type = 'lowpass';
        this.lowpass.frequency.setValueAtTime(400, this.ctx.currentTime);
        this.lowpass.Q.setValueAtTime(10, this.ctx.currentTime);

        this.droneGain.gain.setValueAtTime(0.05, this.ctx.currentTime);

        this.droneOsc.connect(this.lowpass);
        this.lowpass.connect(this.droneGain);
        this.droneGain.connect(this.masterGain);

        this.droneOsc.start();
    }

    /**
     * Modulate drone frequency based on scroll momentum.
     * @param {number} momentum 
     */
    updateTone(momentum) {
        if (!this.initialized) return;

        const mod = Math.abs(momentum) * 0.1;
        this.droneOsc.frequency.setTargetAtTime(this.baseFreq + mod, this.ctx.currentTime, 0.1);
        this.lowpass.frequency.setTargetAtTime(400 + mod * 5, this.ctx.currentTime, 0.1);
    }

    /**
     * Play a glitchy sound on transition.
     */
    playTransition(direction) {
        if (!this.initialized) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        const startFreq = direction === 'down' ? 440 : 220;
        const endFreq = direction === 'down' ? 110 : 880;

        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }

    /**
     * Stop all audio.
     */
    stop() {
        if (this.ctx) this.ctx.close();
    }
}

const Audio = new AudioEngine();
