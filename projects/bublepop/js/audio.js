/**
 * BubblePop - Audio Engine
 * 
 * Uses Web Audio API to procedurally generate satisfying pop sounds.
 * This avoids the need for external audio files and allows for
 * real-time variation in pitch and texture.
 */

/**
 * BubblePop - Audio Engine v1.0.0
 * 
 * @file audio.js
 * @description A high-performance, procedural audio synthesis engine for the BubblePop
 * experience. This module leverages the Web Audio API to create unique, satisfying
 * sound effects in real-time, eliminating the need for external assets and allowing
 * for infinite variation in audio feedback.
 * 
 * @author Antigravity
 * @version 1.0.0
 */

/**
 * @typedef {Object} SoundProfile
 * @property {number} freq - Base frequency in Hz.
 * @property {number} decay - Time in seconds for the sound to fade out.
 * @property {number} q - Quality factor for the filter.
 * @property {string} waveType - Oscillator wave type (sine, square, etc).
 */

class AudioEngine {
    /**
     * Initializes the AudioEngine instance.
     * Note: The AudioContext is not created immediately to comply with 
     * browser autoplay policies requiring a user gesture.
     */
    constructor() {
        /** @type {AudioContext|null} */
        this.ctx = null;

        /** @type {GainNode|null} */
        this.masterGain = null;

        /** @type {boolean} */
        this.isInitialized = false;

        /** 
         * Procedural Sound Profiles
         * @type {Object.<string, SoundProfile>} 
         */
        this.soundProfiles = {
            soft: { freq: 400, decay: 0.12, q: 5, waveType: 'sine' },
            snappy: { freq: 750, decay: 0.08, q: 12, waveType: 'sine' },
            deep: { freq: 180, decay: 0.25, q: 3, waveType: 'sine' },
            sharp: { freq: 1200, decay: 0.04, q: 20, waveType: 'triangle' },
            hollow: { freq: 300, decay: 0.15, q: 8, waveType: 'sine' }
        };

        /** 
         * Reverb/Echo settings for spatial feel 
         * @private
         */
        this._reverbBuffer = null;
    }

    /**
     * Creates and initializes the Web Audio API Context and Master Gain stage.
     * This method must be invoked within a user-triggered event handler (e.g., click).
     * 
     * @returns {void}
     */
    init() {
        if (this.isInitialized) {
            console.warn('AudioEngine: Already initialized.');
            return;
        }

        try {
            // Support legacy vendor prefixes
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;

            if (!AudioContextClass) {
                throw new Error('Web Audio API is not supported in this browser.');
            }

            this.ctx = new AudioContextClass();
            this.masterGain = this.ctx.createGain();

            // Connect to final destination (speakers)
            this.masterGain.connect(this.ctx.destination);

            // Default volume leveling
            this.masterGain.gain.setValueAtTime(0.45, this.ctx.currentTime);

            this.isInitialized = true;
            console.log('AudioEngine: Successfully initialized Web Audio Context.');

            // Prevent context suspension issues
            this.resume();
        } catch (error) {
            console.error('AudioEngine: Initialization fatal error:', error);
        }
    }

    /**
     * Resumes the AudioContext if it has been suspended by the browser.
     * This is an asynchronous operation.
     * 
     * @returns {Promise<void>}
     */
    async resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            try {
                await this.ctx.resume();
                console.log('AudioEngine: Context resumed.');
            } catch (error) {
                console.error('AudioEngine: Failed to resume context:', error);
            }
        }
    }

    /**
     * Core synthesis logic for a "pop" sound.
     * Combines a low-frequency oscillator thud with a high-frequency noise snap.
     * 
     * @param {string} [profileName='soft'] - The identifier for the sound profile.
     * @param {number} [pitchMultiplier=1.0] - Scaling factor for the base frequency.
     * @returns {void}
     */
    playPop(profileName = 'soft', pitchMultiplier = 1.0) {
        if (!this.isInitialized || !this.ctx) {
            return;
        }

        // Ensure context is live
        this.resume();

        const profile = this.soundProfiles[profileName] || this.soundProfiles.soft;
        const now = this.ctx.currentTime;

        // 1. Oscillatory Body (The thud/pop core)
        const oscillator = this.ctx.createOscillator();
        const bodyGain = this.ctx.createGain();
        const bodyFilter = this.ctx.createBiquadFilter();

        // High-precision frequency ramping for the "pop" feel
        const baseFreq = profile.freq * pitchMultiplier;
        const variation = (Math.random() * 0.1 - 0.05) * baseFreq; // +/- 5% variation

        oscillator.type = profile.waveType;
        oscillator.frequency.setValueAtTime(baseFreq + variation, now);

        // Rapid pitch drop simulates air escaping a bubble
        oscillator.frequency.exponentialRampToValueAtTime(10, now + profile.decay);

        // Filter out unwanted high-end harshness from the main oscillator
        bodyFilter.type = 'lowpass';
        bodyFilter.frequency.setValueAtTime(baseFreq * 2.5, now);
        bodyFilter.Q.setValueAtTime(profile.q, now);

        // Amplitude Envelope
        bodyGain.gain.setValueAtTime(0, now);
        bodyGain.gain.linearRampToValueAtTime(0.7, now + 0.003); // Instant attack
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + profile.decay);

        // Routing
        oscillator.connect(bodyFilter);
        bodyFilter.connect(bodyGain);
        bodyGain.connect(this.masterGain);

        // 2. High-Frequency Snap (The plastic texture)
        this.generateWhiteNoiseSnap(now, profile.decay * 0.1);

        // Execution and Cleanup
        oscillator.start(now);
        oscillator.stop(now + profile.decay + 0.05);

        oscillator.onended = () => {
            oscillator.disconnect();
            bodyFilter.disconnect();
            bodyGain.disconnect();
        };
    }

    /**
     * Generates a short burst of high-passed white noise to simulate
     * the "snap" of the plastic bubble bursting.
     * 
     * @param {number} time - The AudioContext time to trigger the sound.
     * @param {number} duration - How long the snap lasts.
     * @private
     */
    generateWhiteNoiseSnap(time, duration) {
        if (!this.ctx) return;

        const bufferSize = this.ctx.sampleRate * 0.015; // 15ms
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // Populate with white noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = buffer;

        const snapFilter = this.ctx.createBiquadFilter();
        snapFilter.type = 'highpass';
        snapFilter.frequency.setValueAtTime(6500, time);

        const snapGain = this.ctx.createGain();
        snapGain.gain.setValueAtTime(0.25, time);
        snapGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        noiseSource.connect(snapFilter);
        snapFilter.connect(snapGain);
        snapGain.connect(this.masterGain);

        noiseSource.start(time);
        noiseSource.stop(time + duration + 0.01);

        noiseSource.onended = () => {
            noiseSource.disconnect();
            snapFilter.disconnect();
            snapGain.disconnect();
        };
    }

    /**
     * Set the master output level.
     * @param {number} volume - Volume from 0.0 to 1.0.
     */
    setVolume(volume) {
        if (this.masterGain && this.ctx) {
            const clampedVolume = Math.max(0, Math.min(1.0, volume));
            this.masterGain.gain.linearRampToValueAtTime(clampedVolume, this.ctx.currentTime + 0.1);
        }
    }
}

/**
 * Singleton instance of AudioEngine for application-wide use.
 * @export
 */
export const Audio = new AudioEngine();
