// ============================================
// AUDIO-ENGINE.JS
// Web Audio API implementation for sonar ping sounds
// ============================================

/**
 * AudioEngine Module
 * Handles all audio generation and playback using Web Audio API
 */
const AudioEngine = (function () {
    'use strict';

    // Private variables
    let audioContext = null;
    let masterGain = null;
    let pingInterval = null;
    let currentFrequency = 440;
    let currentInterval = 1000;
    let isPlaying = false;
    let isPaused = false;
    let isMuted = false; // Sound enabled by default

    // Audio settings
    const SETTINGS = {
        MASTER_VOLUME: 0.3, // Normal volume
        PING_DURATION: 0.1,        // seconds
        PING_ATTACK: 0.01,         // seconds
        PING_RELEASE: 0.09,        // seconds
        SUCCESS_CHORD_DURATION: 2, // seconds
        FILTER_FREQUENCY: 2000,    // Hz
        FILTER_Q: 1
    };

    // Success chord frequencies (major chord)
    const SUCCESS_CHORD = [523.25, 659.25, 783.99]; // C5, E5, G5

    /**
     * Initialize the audio engine
     */
    function init() {
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();

            // Create master gain node
            masterGain = audioContext.createGain();
            masterGain.gain.value = SETTINGS.MASTER_VOLUME;
            masterGain.connect(audioContext.destination);

            // Resume audio context on user interaction (browser requirement)
            document.addEventListener('click', resumeAudioContext);
            document.addEventListener('touchstart', resumeAudioContext);

            return true;
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            return false;
        }
    }

    /**
     * Resume audio context (required by browsers)
     */
    function resumeAudioContext() {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }

    /**
     * Create and play a single ping sound
     * @param {number} frequency - Frequency in Hz
     */
    function playPing(frequency) {
        if (!audioContext || isPaused) return;

        const now = audioContext.currentTime;

        // Create oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;

        // Create gain envelope
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0;

        // Create filter for tone shaping
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = SETTINGS.FILTER_FREQUENCY;
        filter.Q.value = SETTINGS.FILTER_Q;

        // Connect nodes
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(masterGain);

        // ADSR envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + SETTINGS.PING_ATTACK);
        gainNode.gain.linearRampToValueAtTime(0, now + SETTINGS.PING_DURATION);

        // Start and stop oscillator
        oscillator.start(now);
        oscillator.stop(now + SETTINGS.PING_DURATION);

        // Cleanup
        oscillator.onended = () => {
            oscillator.disconnect();
            filter.disconnect();
            gainNode.disconnect();
        };
    }

    /**
     * Start the ping loop
     * @param {number} frequency - Initial frequency
     * @param {number} interval - Initial interval
     */
    function startPingLoop(frequency = 440, interval = 1000) {
        if (isPlaying) return;

        currentFrequency = frequency;
        currentInterval = interval;
        isPlaying = true;
        isPaused = false;

        // Play first ping immediately
        playPing(currentFrequency);

        // Start interval
        schedulePing();
    }

    /**
     * Schedule next ping
     */
    function schedulePing() {
        if (!isPlaying || isPaused) return;

        pingInterval = setTimeout(() => {
            playPing(currentFrequency);
            schedulePing();
        }, currentInterval);
    }

    /**
     * Stop the ping loop
     */
    function stopPingLoop() {
        isPlaying = false;
        if (pingInterval) {
            clearTimeout(pingInterval);
            pingInterval = null;
        }
    }

    /**
     * Pause the ping loop
     */
    function pause() {
        isPaused = true;
        if (pingInterval) {
            clearTimeout(pingInterval);
            pingInterval = null;
        }
    }

    /**
     * Resume the ping loop
     */
    function resume() {
        if (!isPlaying) return;
        isPaused = false;
        schedulePing();
    }

    /**
     * Update ping parameters
     * @param {number} frequency - New frequency
     * @param {number} interval - New interval
     */
    function updatePing(frequency, interval) {
        currentFrequency = frequency;

        // If interval changed significantly, restart the timer
        if (Math.abs(currentInterval - interval) > 50) {
            currentInterval = interval;

            if (isPlaying && !isPaused) {
                if (pingInterval) {
                    clearTimeout(pingInterval);
                }
                schedulePing();
            }
        } else {
            currentInterval = interval;
        }
    }

    /**
     * Play success chord sequence
     */
    function playSuccessChord() {
        if (!audioContext) return;

        const now = audioContext.currentTime;
        const duration = SETTINGS.SUCCESS_CHORD_DURATION;

        // Stop ping loop
        stopPingLoop();

        // Play each note in the chord
        SUCCESS_CHORD.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.value = freq;

            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0;

            // Connect nodes
            oscillator.connect(gainNode);
            gainNode.connect(masterGain);

            // Envelope - stagger the start times
            const startTime = now + (index * 0.1);
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
            gainNode.gain.linearRampToValueAtTime(0.15, startTime + duration - 0.5);
            gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

            // Start and stop
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);

            // Cleanup
            oscillator.onended = () => {
                oscillator.disconnect();
                gainNode.disconnect();
            };
        });

        // Add rising sweep for extra effect
        playSuccessSweep(now, duration);
    }

    /**
     * Play rising frequency sweep for success
     * @param {number} startTime - Start time
     * @param {number} duration - Duration
     */
    function playSuccessSweep(startTime, duration) {
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';

        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0;

        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        // Connect
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(masterGain);

        // Frequency sweep
        oscillator.frequency.setValueAtTime(200, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, startTime + duration);

        // Gain envelope
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        // Start and stop
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);

        // Cleanup
        oscillator.onended = () => {
            oscillator.disconnect();
            filter.disconnect();
            gainNode.disconnect();
        };
    }

    /**
     * Play failure sound (descending tone)
     */
    function playFailureSound() {
        if (!audioContext) return;

        const now = audioContext.currentTime;
        const duration = 1.5;

        // Stop ping loop
        stopPingLoop();

        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sawtooth';

        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0;

        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        // Connect
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(masterGain);

        // Descending frequency
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + duration);

        // Gain envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);

        // Start and stop
        oscillator.start(now);
        oscillator.stop(now + duration);

        // Cleanup
        oscillator.onended = () => {
            oscillator.disconnect();
            filter.disconnect();
            gainNode.disconnect();
        };
    }

    /**
     * Play click sound
     */
    function playClickSound() {
        if (!audioContext) return;

        const now = audioContext.currentTime;
        const duration = 0.05;

        const oscillator = audioContext.createOscillator();
        oscillator.type = 'square';
        oscillator.frequency.value = 800;

        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0;

        // Connect
        oscillator.connect(gainNode);
        gainNode.connect(masterGain);

        // Quick envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);

        // Start and stop
        oscillator.start(now);
        oscillator.stop(now + duration);

        // Cleanup
        oscillator.onended = () => {
            oscillator.disconnect();
            gainNode.disconnect();
        };
    }

    /**
     * Set master volume
     * @param {number} volume - Volume (0-1)
     */
    function setVolume(volume) {
        if (masterGain) {
            masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    /**
     * Get current volume
     * @returns {number} Current volume
     */
    function getVolume() {
        return masterGain ? masterGain.gain.value : 0;
    }

    /**
     * Mute audio
     */
    function mute() {
        isMuted = true;
        if (masterGain) {
            masterGain.gain.value = 0;
        }
    }

    /**
     * Unmute audio
     */
    function unmute() {
        isMuted = false;
        if (masterGain) {
            masterGain.gain.value = 0.3; // Set to normal volume
        }
    }

    /**
     * Check if audio is initialized
     * @returns {boolean} True if initialized
     */
    function isInitialized() {
        return audioContext !== null;
    }

    /**
     * Check if currently playing
     * @returns {boolean} True if playing
     */
    function getIsPlaying() {
        return isPlaying;
    }

    /**
     * Cleanup and destroy audio context
     */
    function destroy() {
        stopPingLoop();

        if (audioContext) {
            audioContext.close();
            audioContext = null;
        }

        masterGain = null;

        document.removeEventListener('click', resumeAudioContext);
        document.removeEventListener('touchstart', resumeAudioContext);
    }

    // Public API
    return {
        init: init,
        startPingLoop: startPingLoop,
        stopPingLoop: stopPingLoop,
        pause: pause,
        resume: resume,
        updatePing: updatePing,
        playSuccessChord: playSuccessChord,
        playFailureSound: playFailureSound,
        playClickSound: playClickSound,
        setVolume: setVolume,
        getVolume: getVolume,
        mute: mute,
        unmute: unmute,
        isInitialized: isInitialized,
        isPlaying: getIsPlaying,
        isMuted: () => isMuted,
        destroy: destroy
    };
})();
