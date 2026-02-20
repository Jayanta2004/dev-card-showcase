/**
 * @file lfo.js
 * @description Low-Frequency Oscillator (LFO) module for dynamic audio modulation.
 * LFOs are used to create slow, rhythmic changes in sound characteristics,
 * such as pitch (vibrato), volume (tremolo), or filter cutoff (wah-wah effect).
 * 
 * In ShepardScroll, these LFOs react to scroll velocity, making the sound feel
 * more "alive" and unstable during movement.
 */

class LFO {
    /**
     * @constructor
     * @param {AudioContext} ctx - Audio context.
     * @param {number} rate - Modulation frequency (Hz).
     * @param {number} depth - Amplitude of modulation.
     */
    constructor(ctx, rate = 5.0, depth = 0.5) {
        this.ctx = ctx;

        // 1. Create the Oscillator Node (The "Low Frequency" source)
        this.osc = ctx.createOscillator();
        this.osc.type = 'sine';
        this.osc.frequency.value = rate;

        // 2. Create the Gain Node (Controls how MUCH it modulates)
        this.gain = ctx.createGain();
        this.gain.gain.value = depth;

        // 3. Chain them: Osc -> Gain -> (External AudioParam)
        this.osc.connect(this.gain);

        // Start the LFO
        this.osc.start();

        this.active = false;
    }

    /**
     * Connects this LFO's output to a target Web Audio Parameter.
     * @param {AudioParam} targetParam - e.g., oscillator.frequency or gain.gain.
     */
    connect(targetParam) {
        this.gain.connect(targetParam);
        this.active = true;
    }

    /**
     * Disconnects the LFO from its targets.
     */
    disconnect() {
        this.gain.disconnect();
        this.active = false;
    }

    /**
     * Updates the modulation speed.
     * @param {number} val - Speed in Hz (usually 0.1 to 10.0).
     */
    setRate(val) {
        const now = this.ctx.currentTime;
        this.osc.frequency.setTargetAtTime(val, now, 0.1);
    }

    /**
     * Updates the modulation depth (intensity).
     * @param {number} val 
     */
    setDepth(val) {
        const now = this.ctx.currentTime;
        this.gain.gain.setTargetAtTime(val, now, 0.1);
    }

    /**
     * Disposes of the nodes to prevent memory leaks.
     */
    dispose() {
        this.osc.stop();
        this.osc.disconnect();
        this.gain.disconnect();
    }
}

/**
 * @class ModulationSystem
 * @description Wrapper to manage multiple LFOs across the audio engine.
 */
class ModulationSystem {
    constructor(ctx) {
        this.ctx = ctx;
        this.vibratoLfo = new LFO(ctx, 4.0, 10.0); // Modulates frequency
        this.tremoloLfo = new LFO(ctx, 2.0, 0.3);  // Modulates gain
    }

    /**
     * Updates LFO parameters based on application state.
     * @param {number} velocity - Current scroll speed.
     */
    update(velocity) {
        // High velocity increases modulation "jitter"
        const speedFactor = Math.abs(velocity) * 0.01;

        // Sync vibrato speed to scroll
        this.vibratoLfo.setRate(5.0 + speedFactor);
        this.vibratoLfo.setDepth(10.0 + (speedFactor * 15));

        // Sync tremolo speed to scroll
        this.tremoloLfo.setRate(2.0 + (speedFactor * 0.5));
    }

    /**
     * Links the LFOs to specific audio engine nodes.
     * @param {AudioParam} freqParam 
     * @param {AudioParam} gainParam 
     */
    link(freqParam, gainParam) {
        if (freqParam) this.vibratoLfo.connect(freqParam);
        if (gainParam) this.tremoloLfo.connect(gainParam);
    }
}

window.ModulationSystem = ModulationSystem;
window.LFO = LFO;
