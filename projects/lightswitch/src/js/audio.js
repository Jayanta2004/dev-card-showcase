/**
 * @file audio.js
 * @description Advanced procedural audio engine for the LightSwitch application.
 * 
 * SOUND DESIGN PRINCIPLES:
 * Physical switches producing a 'click' sound actually generate two distinct phases:
 * 1. The 'Impact': A short, sharp burst of high-frequency noise/waveforms as the metal contacts hit.
 * 2. The 'Resonance': A lower frequency decay that mimics the sound echoing within the switch housing.
 * 
 * This module uses the Web Audio API to synthesize these phases procedurally.
 * This approach is superior to using static WAV files because:
 * - Zero latency (no network fetch).
 * - Infinite variation (we can slightly randomize pitch each time).
 * - Zero external dependencies.
 * 
 * @module AudioEngine
 */

/**
 * Constants for the audio synthesis engine.
 * Tuned for a "crisp, premium feel".
 */
const AUDIO_CONFIG = {
    CLICK_DURATION: 0.12,          // Total duration in seconds
    IMPACT_ATTACK: 0.002,          // Extremely fast attack for the 'snap'
    DECAY_TIME: 0.1,               // Smooth ramp down to silence
    FREQ_ON: 220,                  // Tone when switching to Light Mode
    FREQ_OFF: 180,                 // Tone when switching to Dark Mode
    MOD_DEPTH: 50,                 // Frequency modulation intensity
    GAIN_INTENSITY: 0.4            // Master output volume scale (0 to 1)
};

/**
 * Handles all audio synthesis and context management.
 */
export class AudioEngine {
    /**
     * Initializes the component structure.
     * Note: AudioContext is NOT created until the first user interaction.
     */
    constructor() {
        /** 
         * The primary audio context.
         * @private
         * @type {AudioContext|null}
         */
        this._audioCtx = null;

        /**
         * Tracks initialization status.
         * @private
         * @type {boolean}
         */
        this._isInitialized = false;

        /**
         * Used for slight pitch randomization to prevent 'machine-gun' effect.
         * @private
         */
        this._lastPitchMod = 0;

        console.log("[AudioEngine] Module successfully registered.");
    }

    /**
     * Initializes the Web Audio environment.
     * IMPORTANT: This must be called from within a user gesture (like click).
     * 
     * @returns {boolean} True if successfully initialized.
     */
    init() {
        if (this._isInitialized) {
            // Context might be suspended if the tab was inactive.
            this._resumeIfNeeded();
            return true;
        }

        try {
            // Support both modern and legacy browser variants.
            this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this._isInitialized = true;

            this._logContextSpecs();
            return true;
        } catch (error) {
            console.error("[AudioEngine] CRITICAL: Web Audio initialization failed.", error);
            return false;
        }
    }

    /**
     * Synthesizes and plays a tactile 'click' sound.
     * Dynamically adjusts frequency and waveform based on the toggle direction.
     * 
     * @param {boolean} isSwitchingOn - Direction of the toggle.
     */
    playClick(isSwitchingOn) {
        // Guard: Context must be available.
        if (!this._isInitialized && !this.init()) {
            return;
        }

        // Perform lazy initialization/resume if needed.
        this._resumeIfNeeded();

        const now = this._audioCtx.currentTime;

        /**
         * 1. OSCILLATOR CONFIGURATION
         * We use a 'square' wave when switching ON for a sharper, more energetic feel.
         * We use a 'triangle' wave when switching OFF for a softer, duller feel.
         */
        const oscillator = this._audioCtx.createOscillator();
        const gainNode = this._audioCtx.createGain();

        // Waveform Selection
        oscillator.type = isSwitchingOn ? 'square' : 'triangle';

        // Frequency Calculation (with subtle randomization)
        const baseFreq = isSwitchingOn ? AUDIO_CONFIG.FREQ_ON : AUDIO_CONFIG.FREQ_OFF;
        const randomMod = (Math.random() - 0.5) * 5; // +/- 2.5Hz
        const finalFreq = baseFreq + randomMod;

        // Apply Frequency Ramp (simulates the impact physics)
        oscillator.frequency.setValueAtTime(finalFreq, now);
        oscillator.frequency.exponentialRampToValueAtTime(10, now + AUDIO_CONFIG.CLICK_DURATION);

        /**
         * 2. ENVELOPE CONFIGURATION
         * Creates a sharp percussive hit.
         */
        gainNode.gain.setValueAtTime(0.001, now);
        // Attack
        gainNode.gain.linearRampToValueAtTime(AUDIO_CONFIG.GAIN_INTENSITY, now + AUDIO_CONFIG.IMPACT_ATTACK);
        // Decay
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + AUDIO_CONFIG.CLICK_DURATION);

        /**
         * 3. SIGNAL ROUTING
         */
        oscillator.connect(gainNode);
        gainNode.connect(this._audioCtx.destination);

        // Execute Playback
        oscillator.start(now);
        oscillator.stop(now + AUDIO_CONFIG.CLICK_DURATION);

        this._debugLastPlayback(isSwitchingOn, finalFreq);
    }

    /**
     * Resumes the audio context if it was suspended by the browser power management.
     * @private
     */
    _resumeIfNeeded() {
        if (this._audioCtx && this._audioCtx.state === 'suspended') {
            this._audioCtx.resume().then(() => {
                console.log("[AudioEngine] Context resumed from suspension.");
            });
        }
    }

    /**
     * Internal logging for hardware compatibility check.
     * @private
     */
    _logContextSpecs() {
        if (!this._audioCtx) return;

        const details = {
            sampleRate: this._audioCtx.sampleRate,
            state: this._audioCtx.state,
            baseLatency: this._audioCtx.baseLatency || "N/A"
        };

        console.table({ "[AudioEngine] Device Hardware Specs": details });
    }

    /**
     * Debugging helper to visualize the synthesized parameters.
     * @private
     */
    _debugLastPlayback(isOn, freq) {
        // Only log every 5 clicks in production, or once if needed.
        // For development, we log more frequently.
        console.log(`[AudioEngine] %cCLICK: ${isOn ? 'ON' : 'OFF'} @ ${freq.toFixed(2)}Hz`, 'color: #ff6b6b; font-style: italic;');
    }
}

/**
 * Singleton instance.
 */
export const audioEngine = new AudioEngine();
