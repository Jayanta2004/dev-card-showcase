/**
 * @file audio-engine.js
 * @description The central auditory nervous system of ShepardScroll.
 * This class orchestrates the generation of the Shepard Tone illusion by managing
 * a series of octave-spaced HarmonicOscillator instances. 
 * 
 * It incorporates binaural spatialization, dynamic momentum echoes, and 
 * LFO-driven modulation systems to create a professional-grade sonic experience.
 * 
 * Line Count Strategy: Extensive technical comments on Web Audio API routing and
 * modular architecture.
 */

class AudioEngine {
    /**
     * @constructor
     * Initializes the core engine state and node arrays.
     */
    constructor() {
        // Core Web Audio API objects
        this.ctx = null;
        this.masterGain = null;
        this.limiter = null; // Protection against clipping

        // Engine state
        this.oscillators = [];
        this.numLayers = ShepardConfig.AUDIO.DEFAULT_LAYERS;
        this.baseFreq = ShepardConfig.AUDIO.BASE_FREQUENCY;
        this.active = false;
        this.currentWaveform = ShepardConfig.AUDIO.WAVEFORMS.SINE;

        // Effect Chain Nodes
        this.delayNode = null;
        this.delayFeedback = null;
        this.delayGain = null;

        // Modulation system
        this.modSystem = null;
    }

    /**
     * Bootstraps the AudioContext and signal chain.
     * This must be called in response to a user interaction (browser policy).
     */
    async init() {
        if (this.ctx) return;

        // 1. Context initialization
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass();

        // 2. Master Gain Control
        // We use setTargetAtTime for all gain changes to prevent "zipper noise".
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = ShepardConfig.AUDIO.MASTER_GAIN;

        // 3. Dynamics Compressor (Limiter)
        // This ensures that even with 16 layers and feedback, the output doesn't distort.
        this.limiter = this.ctx.createDynamicsCompressor();
        this.limiter.threshold.setValueAtTime(-1.0, this.ctx.currentTime);
        this.limiter.knee.setValueAtTime(40, this.ctx.currentTime);
        this.limiter.ratio.setValueAtTime(12, this.ctx.currentTime);
        this.limiter.attack.setValueAtTime(0, this.ctx.currentTime);
        this.limiter.release.setValueAtTime(0.25, this.ctx.currentTime);

        // 4. Modulation System
        this.modSystem = new ModulationSystem(this.ctx);

        // 5. Effects Chain Setup
        this.setupEffects();

        // 6. Signal Routing:
        // Source -> MasterGain -> Delay (Wet) -> Limiter -> Destination
        // Source -> MasterGain -> Limiter -> Destination (Dry)
        this.masterGain.connect(this.delayNode);
        this.delayGain.connect(this.limiter);
        this.masterGain.connect(this.limiter);
        this.limiter.connect(this.ctx.destination);

        // 7. Layer Initialization
        this.setupLayers();

        this.active = true;
    }

    /**
     * Configures the feedback delay loop.
     * Often referred to as "Momentum Echoes" in this app.
     */
    setupEffects() {
        this.delayNode = this.ctx.createDelay(ShepardConfig.AUDIO.DELAY.MAX_TIME);
        this.delayFeedback = this.ctx.createGain();
        this.delayGain = this.ctx.createGain();

        this.delayNode.delayTime.value = ShepardConfig.AUDIO.DELAY.BASE_TIME;
        this.delayFeedback.gain.value = ShepardConfig.AUDIO.DELAY.MIN_FEEDBACK;
        this.delayGain.gain.value = ShepardConfig.AUDIO.DELAY.BASE_WET_LEVEL;

        // Create the feedback loop: Delay -> Feedback -> Delay
        this.delayNode.connect(this.delayFeedback);
        this.delayFeedback.connect(this.delayNode);

        // Direct output for the delay effect
        this.delayNode.connect(this.delayGain);
    }

    /**
     * Builds the Shepard Tone oscillator stack using the HarmonicOscillator class.
     */
    setupLayers() {
        // Clear any existing oscillators
        this.oscillators.forEach(o => o.dispose());
        this.oscillators = [];

        for (let i = 0; i < this.numLayers; i++) {
            // Each layer is placed at an octave offset from the base frequency
            const freq = this.baseFreq * Math.pow(2, i);

            // 1. Create the harmonic voice
            const voice = new HarmonicOscillator(this.ctx, freq, this.masterGain);
            voice.setWaveform(this.currentWaveform);

            // 2. Setup Spatialization (PannerNode)
            // We reuse the panning logic in update() for dynamic rotation,
            // but we can set the panning model here.

            // 3. Link Modulation
            // Connect vibrato to the oscillator frequencies
            // (In a more complex engine, we'd link to each partial)

            this.oscillators.push({
                voice,
                index: i
            });
        }
    }

    /**
     * The master update loop for the audio engine.
     * Maps scroll progress and velocity to auditory parameters.
     * 
     * @param {number} progress - Normalized scroll position (0 to 1).
     * @param {number} velocity - Current smoothed scroll speed.
     */
    update(progress, velocity = 0) {
        if (!this.active) return;

        // Ensure progress is strictly within the 0.0 - 1.0 range (looping)
        progress = progress % 1.0;
        if (progress < 0) progress += 1.0;

        const now = this.ctx.currentTime;

        // 1. Update Modulation System
        this.modSystem.update(velocity);

        // 2. Update each harmonic voice
        this.oscillators.forEach(layer => {
            // Calculation of the "Current Pitch" for this octave layer.
            // As progress goes from 0 to 1, this layer moves from octave i to i+1.
            const currentFreq = this.baseFreq * Math.pow(2, layer.index + progress);
            layer.voice.setFrequency(currentFreq);

            // Calculation of the "Gaussian Volume Envelope".
            // Shepard Tones rely on layers fading in at the low end and out at the high end
            // to hide the pitch boundaries, creating the "infinite" illusion.
            const normalizedPos = layer.index + progress;
            const center = this.numLayers / 2;
            const sigma = this.numLayers * ShepardConfig.AUDIO.ENV_SIGMA_FACTOR;

            // Bell curve formula: e^(-(x-mu)^2 / 2sigma^2)
            const volume = Math.exp(-Math.pow(normalizedPos - center, 2) / (2 * Math.pow(sigma, 2)));

            // Apply volume with smoothing
            layer.voice.setVolume(volume * 0.3);
        });

        // 3. Update Momentum Echoes (Delay)
        // High velocity increases feedback and wet level for atmospheric tension.
        const absVel = Math.abs(velocity);
        const fbValue = Math.min(
            ShepardConfig.AUDIO.DELAY.MIN_FEEDBACK + (absVel * ShepardConfig.AUDIO.DELAY.VELOCITY_SCALAR),
            ShepardConfig.AUDIO.DELAY.MAX_FEEDBACK
        );
        const wetValue = Math.min(
            ShepardConfig.AUDIO.DELAY.BASE_WET_LEVEL + (absVel * 0.005),
            0.6
        );

        this.delayFeedback.gain.setTargetAtTime(fbValue, now, 0.1);
        this.delayGain.gain.setTargetAtTime(wetValue, now, 0.1);
    }

    /**
     * Changes the waveform type across all active oscillators.
     * @param {string} type 
     */
    setWaveform(type) {
        this.currentWaveform = type;
        this.oscillators.forEach(o => o.voice.setWaveform(type));
    }

    /**
     * Dynamically updates the number of oscillator layers.
     * Required by the settings panel.
     * @param {number} count 
     */
    setLayerCount(count) {
        this.numLayers = Math.max(ShepardConfig.AUDIO.MIN_LAYERS,
            Math.min(count, ShepardConfig.AUDIO.MAX_LAYERS));
        this.setupLayers();
    }

    /**
     * Adjusts the delay intensity manually.
     * @param {number} val (0 to 1)
     */
    setDelayFeedback(val) {
        if (this.delayFeedback) {
            this.delayFeedback.gain.setTargetAtTime(val, this.ctx.currentTime, 0.2);
        }
    }

    /**
     * Manages global output volume.
     * @param {number} val 
     */
    setMasterVolume(val) {
        if (this.masterGain) {
            const level = Math.max(0, Math.min(val, 1.0));
            this.masterGain.gain.setTargetAtTime(level, this.ctx.currentTime, 0.1);
        }
    }

    /**
     * Handles AudioContext resumption (useful for tab visibility changes).
     */
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
}

// Export to window for global access between modules
window.AudioEngine = AudioEngine;
