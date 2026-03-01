/**
 * Neural Bio-Audio Synthesis Engine (PRO Edition)
 * 
 * A specialized generative audio system that creates organic soundscapes
 * synchronized with the reaction-diffusion patterns. It uses subtractive
 * and additive synthesis techniques to translate visual density into
 * sonic texture.
 * 
 * Architecture:
 * Oscillators (Drone) -> Multi-mode Filter -> Entropy Gain -> Master
 * 
 * @class AudioEngine
 */
export class AudioEngine {
    constructor() {
        /** @type {AudioContext} Main web audio context */
        this.ctx = null;

        /** @type {boolean} Flag tracking engine state */
        this.isEnabled = false;

        // --- Signal Chain Nodes ---

        /** @type {GainNode} Final output stage */
        this.masterGain = null;

        /** @type {GainNode} Drone sub-mix volume */
        this.droneGain = null;

        /** @type {OscillatorNode[]} Active additive synthesis bank */
        this.oscillators = [];

        /** @type {BiquadFilterNode} Primary resonant low-pass filter */
        this.filter = null;

        // --- Modulation State ---

        /** @type {number} Previous concentration entropy for smoothing */
        this.currentEntropy = 0;

        /** @type {number} Previous mean pattern density */
        this.currentDensity = 0;

        /** @type {string} Active synthesis algorithm */
        this.mode = 'ambient';
    }

    /**
     * Engages the Web Audio system. 
     * MUST be triggered by a direct user interaction (click/touch) to 
     * comply with modern browser autoplay policies.
     * 
     * @returns {Promise<void>}
     */
    async enable() {
        if (this.isEnabled) return;

        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        // 1. Create Master Output Chain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.0; // Start silent
        this.masterGain.connect(this.ctx.destination);

        // 2. Create Global Timbral Filter
        this.filter = this.ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.value = 1000;
        this.filter.Q.value = 5.0; // Resonant peak for "organic" character
        this.filter.connect(this.masterGain);

        // 3. Initialize Additive Drone Bank
        this.initDrone();

        // 4. Fade in master gain to prevent clicks
        this.masterGain.gain.setTargetAtTime(0.3, this.ctx.currentTime, 1.5);

        this.isEnabled = true;
        console.log('Neural Sonic Engine: Matrix Active');
    }

    /**
     * Initializes a bank of harmonically related oscillators to create
     * a complex, shifting "biological" drone.
     * 
     * @private
     */
    initDrone() {
        this.droneGain = this.ctx.createGain();
        this.droneGain.gain.value = 0.15;
        this.droneGain.connect(this.filter);

        // Fundamental frequencies inspired by the Schumann Resonance (harmonic series)
        const baseFreqs = [55, 110, 165, 220, 275];

        baseFreqs.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();

            // Blend sine and triangle for a rich, warm tone
            osc.type = i % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            const oscGain = this.ctx.createGain();
            // Harmonic roll-off (higher frequencies are quieter)
            oscGain.gain.value = 0.08 / (i + 1);

            osc.connect(oscGain);
            oscGain.connect(this.droneGain);

            osc.start();
            this.oscillators.push(osc);

            // Add subtle detuning LFO to prevent phase cancellations
            // and create a "swirling" stereophonic feel.
            this.addLFO(osc.frequency, 0.08 * (i + 1), 3.0);
        });
    }

    /**
     * Attaches a Low Frequency Oscillator to an AudioParam.
     * 
     * @param {AudioParam} target - The parameter to modulate (e.g. frequency)
     * @param {number} rate - LFO speed in Hz
     * @param {number} depth - Modulation intensity
     * @private
     */
    addLFO(target, rate, depth) {
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();

        lfo.frequency.value = rate;
        lfoGain.gain.value = depth;

        lfo.connect(lfoGain);
        lfoGain.connect(target);
        lfo.start();
    }

    /**
     * Bridges the gap between visual simulation and sonic output.
     * Dynamically maps simulation metrics to synthesis parameters.
     * 
     * @param {number} density - Mean concentration of Substance B (0.0 to 1.0)
     * @param {number} entropy - Rate of change or complexity metric
     */
    update(density, entropy) {
        if (!this.isEnabled) return;

        const t = this.ctx.currentTime;

        // 1. Density -> Filter Cutoff
        // Denser patterns result in brighter, more translucent sounds.
        const targetFreq = 150 + (density * 2500);
        this.filter.frequency.setTargetAtTime(Math.min(5000, targetFreq), t, 0.2);

        // 2. Entropy -> Volume Modulation
        // Chaotic movements in the grid increase the presence of the audio.
        const targetGain = 0.1 + (entropy * 0.8);
        this.masterGain.gain.setTargetAtTime(Math.min(0.6, targetGain), t, 0.3);

        // 3. Density -> Harmonic Pitch Shift
        // Patterns shifts the drone fundamental slightly for an eerie, alive feel.
        this.oscillators.forEach((osc, i) => {
            const base = 55 * (i + 1);
            osc.frequency.setTargetAtTime(base + (density * 15), t, 0.5);
        });
    }

    /**
     * Adjusts the overall output volume.
     * @param {number} val - Volume level (0.0 to 1.0)
     */
    setVolume(val) {
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.1);
        }
    }

    /**
     * Changes the internal synthesis algorithm.
     * @param {string} mode - Mode key ('ambient', 'granular', 'drone')
     */
    setMode(mode) {
        this.mode = mode;
        // Optimization: In a more complex build, this would modify node graph
    }
}
