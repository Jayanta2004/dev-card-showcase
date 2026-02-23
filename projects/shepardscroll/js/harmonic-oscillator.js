/**
 * @file harmonic-oscillator.js
 * @description Advanced synthesizer voice engine for ShepardScroll.
 * Instead of a single oscillator, this class manages a composite sound source
 * consisting of a fundamental frequency and its harmonic overtones.
 * 
 * This creates a much richer, "organic" sound texture likened to pipe organs
 * or analog synthesizers, which enhances the immersion of the Shepard illusion.
 */

class HarmonicOscillator {
    /**
     * @constructor
     * @param {AudioContext} ctx - The Web Audio API context.
     * @param {number} baseFreq - Initial fundamental frequency.
     * @param {AudioNode} destination - The mixer/gain node to output to.
     */
    constructor(ctx, baseFreq, destination) {
        this.ctx = ctx;
        this.destination = destination;
        this.baseFreq = baseFreq;

        // Node state management
        this.partials = [];
        this.harmonicCount = 4; // Fundamental + 3 overtones
        this.mainGain = ctx.createGain();
        this.mainGain.connect(destination);
        this.mainGain.gain.value = 0; // Start silent

        // Waveform configuration
        this.waveform = ShepardConfig.AUDIO.WAVEFORMS.SINE;

        this.init();
    }

    /**
     * Initializes the bank of oscillators.
     */
    init() {
        // Clear existing partials
        this.partials.forEach(p => {
            try { p.osc.stop(); } catch (e) { }
            p.osc.disconnect();
        });
        this.partials = [];

        // Build the harmonic series
        // Frequencies are multiples of the fundamental (1f, 2f, 3f...)
        for (let i = 1; i <= this.harmonicCount; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = this.waveform;
            osc.frequency.value = this.baseFreq * i;

            // Lower harmonics are usually louder than higher ones (natural falloff)
            const harmonicStrength = 1 / i;
            gain.gain.value = harmonicStrength * 0.5;

            osc.connect(gain);
            gain.connect(this.mainGain);

            osc.start();

            this.partials.push({ osc, gain, ratio: i });
        }
    }

    /**
     * Updates the pitch of all partials simultaneously.
     * @param {number} freq - The new fundamental frequency.
     */
    setFrequency(freq) {
        this.baseFreq = freq;
        const now = this.ctx.currentTime;

        this.partials.forEach(p => {
            // Smoothly transition between frequencies to avoid "clicks"
            p.osc.frequency.setTargetAtTime(
                freq * p.ratio,
                now,
                ShepardConfig.AUDIO.SMOOTHING_TIME
            );
        });
    }

    /**
     * Sets the volume of this specific harmony layer.
     * @param {number} val - Normalized gain value (0.0 to 1.0).
     */
    setVolume(val) {
        const now = this.ctx.currentTime;
        this.mainGain.gain.setTargetAtTime(
            val,
            now,
            ShepardConfig.AUDIO.SMOOTHING_TIME
        );
    }

    /**
     * Dynamically changes the waveform of all oscillators.
     * @param {string} type - 'sine', 'square', 'sawtooth', or 'triangle'.
     */
    setWaveform(type) {
        this.waveform = type;
        this.partials.forEach(p => {
            p.osc.type = type;
        });
    }

    /**
     * Updates the distribution of harmonic overtones.
     * Higher overtone counts create a more aggressive, "buzzier" sound.
     * @param {number} count 
     */
    setHarmonicCount(count) {
        this.harmonicCount = Math.max(1, Math.min(count, 8));
        this.init(); // Rebuild nodes
    }

    /**
     * Gracefully stops and cleans up audio nodes.
     */
    dispose() {
        this.partials.forEach(p => {
            p.osc.stop();
            p.osc.disconnect();
        });
        this.mainGain.disconnect();
    }
}

window.HarmonicOscillator = HarmonicOscillator;
