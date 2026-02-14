/**
 * @file effects.js
 * @description Manages external visual and auditory effects, specifically 
 * the 'Shake' interaction that erases the drawing.
 * 
 * FEATURES:
 * - Managed sound pool for overlap protection.
 * - CSS Class orchestration for multi-element animations.
 * - Mid-animation clear timing for physical realism.
 * - Haptic feedback support stub.
 */

const Effects = (() => {
    // --- Constants ---
    const SHAKE_DURATION = 650; // Total MS for CSS animation
    const CLEAR_THRESHOLD = 300; // MS into animation when clear occurs

    // --- Selectors ---
    const SELECTORS = {
        FRAME: '#etch-a-sketch',
        SCREEN: '#sketch-canvas',
        SOUND: '#shake-sound'
    };

    // --- Private State ---
    /** @type {HTMLElement|null} */
    let frame = null;
    /** @type {HTMLElement|null} */
    let screen = null;
    /** @type {HTMLAudioElement|null} */
    let sound = null;

    /** @type {boolean} Mutex to prevent animation spamming */
    let active = false;

    // --- Private Methods ---

    /**
     * Plays the shake sound effect with volume and reset handling.
     */
    function playShakeSound() {
        if (!sound) return;

        try {
            sound.volume = 0.4;
            sound.currentTime = 0;
            const playPromise = sound.play();

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    Logger.debug('Audio play prevented: Interaction required or device silent.');
                });
            }
        } catch (err) {
            Logger.debug('Audio Engine Error');
        }
    }

    /**
     * Triggers haptic feedback if supported by the device.
     */
    function triggerHaptics() {
        if ('vibrate' in navigator) {
            // Pattern: Vibrate 100ms, Pause 50ms, Vibrate 100ms
            navigator.vibrate([100, 50, 100]);
        }
    }

    // --- Public API ---

    /**
     * Initializes the effects system.
     */
    function init() {
        Logger.info('Initializing Effects system components...');

        frame = Utils.qs(SELECTORS.FRAME);
        screen = Utils.qs(SELECTORS.SCREEN);
        sound = Utils.qs(SELECTORS.SOUND);

        if (!frame || !screen) {
            Logger.error('Effects system failed: Essential elements missing.');
            return;
        }

        Logger.info('Effects system ready.');
    }

    /**
     * Orchestrates the complex 'Shake' erase sequence.
     * @param {Function} onClear - Callback to execute the logical erase.
     */
    function shake(onClear) {
        if (active) return;

        Logger.info('Executing physical SHAKE command...');
        active = true;

        // 1. Audio-Visual Start
        playShakeSound();
        triggerHaptics();

        // Apply CSS classes to trigger hardware-accelerated animations
        frame.classList.add('shaking');
        screen.classList.add('clearing-canvas');

        // 2. Logic Trigger (Simulate powder shifting)
        setTimeout(() => {
            if (onClear) {
                onClear();
                Logger.debug('Physical clear threshold reached.');
            }
        }, CLEAR_THRESHOLD);

        // 3. Animation Completion and Cleanup
        setTimeout(() => {
            frame.classList.remove('shaking');
            screen.classList.remove('clearing-canvas');

            active = false;
            Logger.info('Shake sequence complete. Board state is now clear.');
        }, SHAKE_DURATION);
    }

    /**
     * Helper to check if an effect is currently running.
     * @returns {boolean}
     */
    function isAnimating() {
        return active;
    }

    // Public API surface
    return {
        init,
        shake,
        isAnimating
    };
})();
