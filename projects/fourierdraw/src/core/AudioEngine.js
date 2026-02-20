import { CONFIG } from '../config.js';

/**
 * @fileoverview Audio Engine for FourierDraw.
 * Responsible for synthesizing sound based on the rotating epicycles.
 */

export class AudioEngine {
    constructor() {
        /** @type {AudioContext} */
        this.ctx = null;
        /** @type {GainNode} */
        this.mainGain = null;
        /** @type {OscillatorNode[]} */
        this.oscillators = [];
        /** @type {ConvolverNode} */
        this.reverb = null;
        /** @type {DelayNode} */
        this.delay = null;

        this.isInitialized = false;
        this.isEnabled = false;
    }

    /**
     * Initializes the Web Audio API context and nodes.
     * Must be called in response to a user gesture.
     */
    async init() {
        if (this.isInitialized) return;

        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.mainGain = this.ctx.createGain();
        this.mainGain.gain.value = CONFIG.AUDIO.VOLUME;

        // Create Delay
        this.delay = this.ctx.createDelay();
        this.delay.delayTime.value = CONFIG.AUDIO.DELAY_TIME;
        const delayFeedback = this.ctx.createGain();
        delayFeedback.gain.value = CONFIG.AUDIO.DELAY_FEEDBACK;

        this.delay.connect(delayFeedback);
        delayFeedback.connect(this.delay);

        // Connect main path
        this.mainGain.connect(this.delay);
        this.mainGain.connect(this.ctx.destination);
        this.delay.connect(this.ctx.destination);

        this.isInitialized = true;
        this.isEnabled = true;

        console.log('Audio Engine initialized');
    }

    /**
     * Sets up oscillators based on DFT data.
     * @param {Object[]} fourierData - The frequency components from DFT.
     */
    setupFrequencies(fourierData) {
        if (!this.isEnabled) return;

        this.stopAll();

        // Only take the top N strongest frequencies to avoid clipping and noise
        const topFrequencies = fourierData
            .filter(f => f.amp > 1)
            .slice(1, CONFIG.AUDIO.MAX_OSCILLATORS + 1);

        topFrequencies.forEach((data, index) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            // Map frequency frequency to audible range
            // We use the 'freq' index as a multiplier for a base frequency
            const freq = CONFIG.AUDIO.BASE_FREQ * (Math.abs(data.freq) * 0.1 + 1);
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            // Map amplitude to volume, normalized by oscillator count
            const volume = (data.amp / 100) * (1 / topFrequencies.length);
            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(volume * CONFIG.AUDIO.VOLUME, this.ctx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(this.mainGain);

            osc.start();
            this.oscillators.push({ osc, gain, baseVolume: volume });
        });
    }

    /**
     * Updates oscillator parameters based on current animation state.
     * @param {number} time - Current animation time.
     */
    update(time) {
        if (!this.isEnabled || this.oscillators.length === 0) return;

        // Subtle frequency modulation based on phase could go here
    }

    /**
     * Stops all active oscillators with a short fade-out.
     */
    stopAll() {
        if (!this.isInitialized) return;

        const fadeTime = 0.1;
        this.oscillators.forEach(({ osc, gain }) => {
            gain.gain.cancelScheduledValues(this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + fadeTime);
            setTimeout(() => osc.stop(), fadeTime * 1000);
        });
        this.oscillators = [];
    }

    /**
     * Toggles the audio engine on or off.
     */
    toggle() {
        this.isEnabled = !this.isEnabled;
        if (!this.isEnabled) this.stopAll();
    }
}
