/**
 * @class AudioUtils
 * @description Additional helper functions specifically for Audio operations.
 * Helps decouple raw math from audio concepts.
 */
export class AudioUtils {
    /**
     * @static
     * @method midiToFreq
     * @description Converts MIDI note number to frequency.
     * @param {number} midi - MIDI note (0-127)
     * @returns {number} Frequency in Hz
     */
    static midiToFreq(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    /**
     * @static
     * @method freqToMidi
     * @description Converts frequency to MIDI note number.
     * @param {number} freq - Frequency in Hz
     * @returns {number} MIDI note
     */
    static freqToMidi(freq) {
        return 69 + 12 * Math.log2(freq / 440);
    }

    /**
     * @static
     * @method dbToGain
     * @description Decibels to linear gain.
     * @param {number} db 
     * @returns {number} Gain (0-1+)
     */
    static dbToGain(db) {
        return Math.pow(10, db / 20);
    }

    /**
     * @static
     * @method gainToDb
     * @description Linear gain to Decibels.
     * @param {number} gain 
     * @returns {number} Decibels
     */
    static gainToDb(gain) {
        return 20 * Math.log10(gain);
    }

    /**
     * @static
     * @method createImpulseHelper
     * @description Helper to create a simple noise buffer for reverb (if we wanted convolution).
     * @param {AudioContext} ctx 
     * @param {number} duration 
     * @param {number} decay 
     * @returns {AudioBuffer}
     */
    static createImpulseHelper(ctx, duration, decay) {
        const rate = ctx.sampleRate;
        const length = rate * duration;
        const impulse = ctx.createBuffer(2, length, rate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const n = i / length;
            // Exponential decay noise
            const factor = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
            left[i] = factor;
            right[i] = factor;
        }

        return impulse;
    }
}
