/**
 * SonarRoom - Audio Engine
 * Web Audio API implementation for sonar ping generation
 */

const AudioEngine = (function () {
    // ============================================
    // Private State
    // ============================================

    let audioContext = null;
    let masterGain = null;
    let isInitialized = false;
    let activeOscillators = [];
    let lastPingTime = 0;
    let currentPingInterval = CONFIG.timing.maxPingInterval;
    let isPinging = false;
    let pingIntervalId = null;

    // ============================================
    // Initialization
    // ============================================

    /**
     * Initialize Web Audio API context
     * Must be called after user gesture (click/touch)
     * @returns {boolean} True if successful
     */
    function init() {
        if (isInitialized) {
            Utils.log('warn', 'AudioEngine already initialized');
            return true;
        }

        try {
            // Create audio context
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;

            if (!AudioContextClass) {
                Utils.log('error', 'Web Audio API not supported');
                return false;
            }

            audioContext = new AudioContextClass();

            // Create master gain node for volume control
            masterGain = audioContext.createGain();
            masterGain.gain.value = CONFIG.audio.masterVolume;
            masterGain.connect(audioContext.destination);

            isInitialized = true;
            Utils.log('info', 'AudioEngine initialized successfully');

            return true;

        } catch (error) {
            Utils.log('error', 'Failed to initialize AudioEngine', error);
            return false;
        }
    }

    /**
     * Resume audio context (required for some browsers)
     */
    function resume() {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
            Utils.log('info', 'AudioContext resumed');
        }
    }

    // ============================================
    // Ping Generation
    // ============================================

    /**
     * Create and play a single sonar ping
     * @param {number} frequency - Ping frequency in Hz
     * @param {number} pan - Stereo pan (-1 to 1)
     */
    function playPing(frequency, pan = 0) {
        if (!isInitialized || !audioContext) {
            Utils.log('warn', 'AudioEngine not initialized');
            return;
        }

        try {
            const now = audioContext.currentTime;

            // Create oscillator
            const oscillator = audioContext.createOscillator();
            oscillator.type = CONFIG.audio.oscillatorType;
            oscillator.frequency.value = frequency;

            // Create gain node for envelope
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0;

            // Create stereo panner (if enabled)
            let pannerNode = null;
            if (CONFIG.audio.enablePanning) {
                pannerNode = audioContext.createStereoPanner();
                pannerNode.pan.value = Utils.clamp(pan * CONFIG.audio.panningStrength, -1, 1);
            }

            // Connect nodes
            oscillator.connect(gainNode);

            if (pannerNode) {
                gainNode.connect(pannerNode);
                pannerNode.connect(masterGain);
            } else {
                gainNode.connect(masterGain);
            }

            // Apply ADSR envelope
            const attackTime = CONFIG.audio.attackTime;
            const decayTime = CONFIG.audio.decayTime;
            const sustainLevel = CONFIG.audio.sustainLevel;
            const releaseTime = CONFIG.audio.releaseTime;
            const pingDuration = CONFIG.audio.pingDuration;

            // Attack
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(
                CONFIG.audio.maxVolume,
                now + attackTime
            );

            // Decay to sustain
            gainNode.gain.linearRampToValueAtTime(
                CONFIG.audio.maxVolume * sustainLevel,
                now + attackTime + decayTime
            );

            // Hold sustain
            gainNode.gain.setValueAtTime(
                CONFIG.audio.maxVolume * sustainLevel,
                now + pingDuration - releaseTime
            );

            // Release
            gainNode.gain.linearRampToValueAtTime(
                0,
                now + pingDuration
            );

            // Start and stop oscillator
            oscillator.start(now);
            oscillator.stop(now + pingDuration);

            // Track active oscillator
            activeOscillators.push(oscillator);

            // Clean up when finished
            oscillator.onended = () => {
                oscillator.disconnect();
                gainNode.disconnect();
                if (pannerNode) pannerNode.disconnect();

                // Remove from active list
                const index = activeOscillators.indexOf(oscillator);
                if (index > -1) {
                    activeOscillators.splice(index, 1);
                }
            };

            lastPingTime = Date.now();

        } catch (error) {
            Utils.log('error', 'Failed to play ping', error);
        }
    }

    /**
     * Play success sound (higher pitch, longer duration)
     */
    function playSuccessSound() {
        if (!isInitialized) return;

        try {
            const now = audioContext.currentTime;
            const duration = 0.5;

            // Create ascending tone
            const oscillator = audioContext.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(400, now);
            oscillator.frequency.exponentialRampToValueAtTime(800, now + duration);

            const gainNode = audioContext.createGain();
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
            gainNode.gain.linearRampToValueAtTime(0, now + duration);

            oscillator.connect(gainNode);
            gainNode.connect(masterGain);

            oscillator.start(now);
            oscillator.stop(now + duration);

            oscillator.onended = () => {
                oscillator.disconnect();
                gainNode.disconnect();
            };

        } catch (error) {
            Utils.log('error', 'Failed to play success sound', error);
        }
    }

    // ============================================
    // Ping Rhythm Control
    // ============================================

    /**
     * Start automatic pinging with current interval
     * @param {number} frequency - Initial frequency
     * @param {number} pan - Initial pan
     */
    function startPinging(frequency, pan = 0) {
        if (isPinging) return;

        isPinging = true;

        // Play first ping immediately
        playPing(frequency, pan);

        Utils.log('info', 'Started pinging');
    }

    /**
     * Stop automatic pinging
     */
    function stopPinging() {
        if (!isPinging) return;

        isPinging = false;

        if (pingIntervalId) {
            clearInterval(pingIntervalId);
            pingIntervalId = null;
        }

        Utils.log('info', 'Stopped pinging');
    }

    /**
     * Update ping parameters (called on mouse move)
     * @param {number} frequency - New frequency
     * @param {number} interval - New interval (ms)
     * @param {number} pan - New pan value
     */
    function updatePing(frequency, interval, pan = 0) {
        if (!isPinging) return;

        currentPingInterval = interval;

        // Check if enough time has passed for next ping
        const timeSinceLastPing = Date.now() - lastPingTime;

        if (timeSinceLastPing >= currentPingInterval) {
            playPing(frequency, pan);
        }
    }

    // ============================================
    // Volume Control
    // ============================================

    /**
     * Set master volume
     * @param {number} volume - Volume (0-1)
     */
    function setVolume(volume) {
        if (!masterGain) return;

        const clampedVolume = Utils.clamp(volume, 0, 1);
        masterGain.gain.setValueAtTime(
            clampedVolume,
            audioContext.currentTime
        );

        Utils.log('debug', `Volume set to ${clampedVolume}`);
    }

    /**
     * Fade volume to target
     * @param {number} targetVolume - Target volume (0-1)
     * @param {number} duration - Fade duration (seconds)
     */
    function fadeVolume(targetVolume, duration = 0.5) {
        if (!masterGain) return;

        const clampedVolume = Utils.clamp(targetVolume, 0, 1);
        masterGain.gain.linearRampToValueAtTime(
            clampedVolume,
            audioContext.currentTime + duration
        );
    }

    // ============================================
    // Cleanup
    // ============================================

    /**
     * Stop all active oscillators
     */
    function stopAllOscillators() {
        activeOscillators.forEach(osc => {
            try {
                osc.stop();
                osc.disconnect();
            } catch (error) {
                // Oscillator may already be stopped
            }
        });

        activeOscillators = [];
        Utils.log('info', 'All oscillators stopped');
    }

    /**
     * Clean up and destroy audio context
     */
    function destroy() {
        stopPinging();
        stopAllOscillators();

        if (audioContext) {
            audioContext.close();
            audioContext = null;
        }

        masterGain = null;
        isInitialized = false;

        Utils.log('info', 'AudioEngine destroyed');
    }

    // ============================================
    // State Queries
    // ============================================

    /**
     * Check if audio engine is initialized
     * @returns {boolean} True if initialized
     */
    function getIsInitialized() {
        return isInitialized;
    }

    /**
     * Check if currently pinging
     * @returns {boolean} True if pinging
     */
    function getIsPinging() {
        return isPinging;
    }

    /**
     * Get current audio context state
     * @returns {string} Context state
     */
    function getContextState() {
        return audioContext ? audioContext.state : 'none';
    }

    /**
     * Get number of active oscillators
     * @returns {number} Active oscillator count
     */
    function getActiveOscillatorCount() {
        return activeOscillators.length;
    }

    // ============================================
    // Public API
    // ============================================

    return {
        init,
        resume,
        playPing,
        playSuccessSound,
        startPinging,
        stopPinging,
        updatePing,
        setVolume,
        fadeVolume,
        stopAllOscillators,
        destroy,

        // Getters
        isInitialized: getIsInitialized,
        isPinging: getIsPinging,
        getContextState,
        getActiveOscillatorCount
    };
})();

// ============================================
// Export
// ============================================

// Freeze public API
if (Object.freeze) {
    Object.freeze(AudioEngine);
}
