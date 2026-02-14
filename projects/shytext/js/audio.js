/**
 * audio.js
 * 
 * A minimalistic Web Audio API controller for ShyText.
 * Generates subtle ambient textures that respond to interaction.
 * 
 * @module Audio
 */

import { CONFIG } from './config.js';
import { Logger } from './logger.js';

class ShyAudio {
    constructor() {
        this.ctx = null;
        this.isMuted = true;
        this.oscillators = [];
        this.gainNode = null;
        this.isInitialized = false;
    }

    /**
     * Initializes the AudioContext.
     * Browsers require a user gesture to start audio.
     */
    async init() {
        if (this.isInitialized) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            // Create master gain
            this.gainNode = this.ctx.createGain();
            this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
            this.gainNode.connect(this.ctx.destination);

            this.createAmbience();
            this.isInitialized = true;

            Logger.system("Audio Engine: Initialized (Muted)");
        } catch (e) {
            Logger.error("Failed to initialize Web Audio API", e);
        }
    }

    /**
     * Creates a low-frequency ambient hum.
     */
    createAmbience() {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low G

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, this.ctx.currentTime);

        osc.connect(filter);
        filter.connect(this.gainNode);

        osc.start();
        this.oscillators.push(osc);
    }

    /**
     * Updates the frequency based on proximity.
     * Creates a "tension" effect.
     * 
     * @param {number} proximity - Normalized intensity (0-1)
     */
    update(proximity) {
        if (!this.isInitialized || this.isMuted) return;

        const targetFreq = 55 + (proximity * 220); // Scale up to 275Hz
        const volume = 0.02 + (proximity * 0.05);

        // Smooth transition to avoid clicking
        if (this.oscillators[0]) {
            this.oscillators[0].frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
        }
        if (this.gainNode) {
            this.gainNode.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.2);
        }
    }

    setMute(muted) {
        this.isMuted = muted;
        if (this.gainNode) {
            this.gainNode.gain.setTargetAtTime(this.isMuted ? 0 : 0.05, this.ctx.currentTime, 0.1);
        }
        return this.isMuted;
    }

    toggleMute() {
        return this.setMute(!this.isMuted);
    }
}

export const Audio = new ShyAudio();

/**
 * TECHNICAL NOTE: Sound for Interface
 * 
 * Audio is often overlooked in web interfaces, but for "experimental" 
 * UI, it provides a crucial layer of immersion. The ShyAudio engine 
 * uses an OscillatorNode with a BiquadFilter to create a purely 
 * synthesized "shy hum". By varying the frequency in resonance with 
 * the visual blur, we create a unified sensory experience.
 */
