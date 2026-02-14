/**
 * BlinkClick Audio Engine
 * synthesizes futuristic sound effects using Web Audio API. No external assets.
 */

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.initialized = false;
    }

    /**
     * Initialize the audio context on user interaction
     */
    init() {
        if (this.initialized) return;

        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.3;

        this.initialized = true;
    }

    /**
     * Play a futuristic beep
     */
    playBeep(freq = 440, duration = 0.1, type = 'sine') {
        if (!this.initialized) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + duration);

        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    /**
     * Successful blink trigger sound
     */
    playSuccess() {
        if (!this.initialized) return;

        this.playBeep(880, 0.2, 'square');
        setTimeout(() => this.playBeep(1200, 0.4, 'sine'), 100);
    }

    /**
     * UI interaction sound
     */
    playUI() {
        if (!this.initialized) return;
        this.playBeep(150, 0.05, 'triangle');
    }

    /**
     * Scanning ambient hum
     */
    startHum() {
        if (!this.initialized) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(55, this.ctx.currentTime);

        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 2;
        lfoGain.gain.value = 10;

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        gain.gain.value = 0.05;

        osc.connect(gain);
        gain.connect(this.masterGain);

        lfo.start();
        osc.start();

        return { osc, lfo };
    }
}

window.AudioEngine = AudioEngine;
