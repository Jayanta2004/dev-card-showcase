/**
 * GuitarJS - Audio Engine
 * Handles Web Audio API context, synthesis, and sound generation.
 * Strict adherence to 'Real, Clear, Loud' guitar tone.
 */

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.limiter = null;
        this.activeNotes = new Map(); // Store active oscillators for stopping/damping
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext({ latencyHint: 'interactive' });

        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.8; // Headroom

        // Dynamics Compressor (Limiter) to prevent clipping
        this.limiter = this.ctx.createDynamicsCompressor();
        this.limiter.threshold.value = -10;
        this.limiter.knee.value = 40;
        this.limiter.ratio.value = 12;
        this.limiter.attack.value = 0;
        this.limiter.release.value = 0.25;

        this.masterGain.connect(this.limiter);
        this.limiter.connect(this.ctx.destination);

        // Warm up the context
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }

        this.initialized = true;
        console.log("GuitarJS Audio Engine Initialized");
    }

    /**
     * Synthesize a guitar string pluck.
     * @param {number} frequency - Frequency in Hz
     * @param {number} velocity - 0.0 to 1.0 (pluck strength)
     * @param {number} stringIndex - Used for timbre variation (optional)
     * @returns {Object} Note identifier to allow stopping
     */
    pluck(frequency, velocity = 1.0, stringIndex = 0) {
        if (!this.initialized || !this.ctx) return null;

        const t = this.ctx.currentTime;
        const toneId = `${frequency.toFixed(2)}-${Date.now()}`;

        // 1. Oscillator (The vibration)
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth'; // Rich harmonics, standard for strings
        osc.frequency.setValueAtTime(frequency, t);

        // 2. Filter (The body/timbre)
        // Guitar strings start bright (pluck) and quickly lose high frequencies.
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.value = 0; // Low resonance for a cleaner string sound

        // Filter Envelope
        // Bright attack proportional to velocity
        const minCutoff = frequency * 2; // Keep some harmonics
        const maxCutoff = frequency * 10 * velocity;

        filter.frequency.setValueAtTime(minCutoff, t);
        filter.frequency.linearRampToValueAtTime(maxCutoff, t + 0.005); // Attack
        filter.frequency.exponentialRampToValueAtTime(minCutoff, t + 0.2); // Decay of brightness

        // 3. Gain (Volume Envelope)
        const gainNode = this.ctx.createGain();
        const peakGain = 0.5 * velocity;

        gainNode.gain.setValueAtTime(0, t);
        gainNode.gain.linearRampToValueAtTime(peakGain, t + 0.015); // Fast attack, not instant (pluck sound)
        gainNode.gain.exponentialRampToValueAtTime(peakGain * 0.1, t + 3.0); // Long decay if held
        gainNode.gain.linearRampToValueAtTime(0, t + 8.0); // Final fade out

        // 4. Connect Graph
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);

        // 5. Start
        osc.start(t);

        // Store active note for damping
        const noteObj = { osc, gainNode, filter, toneId };
        this.activeNotes.set(toneId, noteObj);

        // Auto cleanup
        osc.onended = () => {
            if (this.activeNotes.has(toneId)) {
                this.activeNotes.delete(toneId);
            }
        };

        // Stop oscillator eventually to save CPU
        osc.stop(t + 8.0);

        return noteObj;
    }

    /**
     * Simulates damping the string (key release or mute).
     * @param {Object} noteObj - The object returned by pluck
     */
    dampen(noteObj) {
        if (!noteObj || !this.ctx) return;
        const { gainNode, osc, toneId } = noteObj;

        // Don't cut instantly, quick fade to zero (mute sound)
        const t = this.ctx.currentTime;

        // Cancel scheduled values to take control
        gainNode.gain.cancelScheduledValues(t);

        // Current value?
        const currentGain = gainNode.gain.value;
        gainNode.gain.setValueAtTime(currentGain, t);

        // Quick mute (release)
        gainNode.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);

        // Stop osc shortly after
        osc.stop(t + 0.15);
        this.activeNotes.delete(toneId);
    }

    dampenAll() {
        this.activeNotes.forEach(note => this.dampen(note));
        this.activeNotes.clear();
    }
}

// Export singleton
window.audioEngine = new AudioEngine();
