/**
 * @file ui.js
 * @description Manages the physical UI elements of the SketchPad.
 * This includes the knobs, branding, and instruction overlays.
 * It translates logical movement into visual rotations and feedback.
 */

const UI = (() => {
    // --- Selectors ---
    const SELECTORS = {
        KNOB_X: '#knob-x',
        KNOB_Y: '#knob-y',
        BRAND: '.brand-text',
        SCREEN: '#screen-container',
        BTNS: '.shake-button'
    };

    // --- Private State ---
    const state = {
        rotationX: 0,
        rotationY: 0,
        knobSensitivity: 3 // multiplier for rotation
    };

    /** @type {HTMLElement|null} */
    let knobX = null;
    /** @type {HTMLElement|null} */
    let knobY = null;

    // --- Private Methods ---

    /**
     * Applies rotation styling to a knob element.
     * @param {HTMLElement} el 
     * @param {number} deg 
     */
    function applyRotation(el, deg) {
        if (!el) return;
        el.style.transform = `rotate(${deg}deg)`;
    }

    /**
     * Toggles a pulse animation on a knob.
     * @param {HTMLElement} el 
     * @param {boolean} active 
     */
    function togglePulse(el, active) {
        if (!el) return;
        if (active) {
            el.classList.add('active-knob');
        } else {
            el.classList.remove('active-knob');
        }
    }

    // --- Public API ---

    /**
     * Initializes the UI module.
     */
    function init() {
        Logger.info('Initializing UI module elements...');

        knobX = Utils.qs(SELECTORS.KNOB_X);
        knobY = Utils.qs(SELECTORS.KNOB_Y);

        if (!knobX || !knobY) {
            Logger.warn('UI Warning: Physical knobs not found in DOM.');
        }

        // Add hover effects via JS for more precise control if needed
        const btns = Utils.qsa(SELECTORS.BTNS);
        btns.forEach(btn => {
            btn.addEventListener('mouseenter', () => Logger.debug('Shake button hovered'));
        });

        Logger.info('UI System online.');
    }

    /**
     * Updates the physical state of the toy based on movement.
     * @param {number} dx 
     * @param {number} dy 
     */
    function update(dx, dy) {
        // Horizontal Movement -> Left Knob
        if (dx !== 0) {
            state.rotationX += dx * state.knobSensitivity;
            applyRotation(knobX, state.rotationX);
            togglePulse(knobX, true);
        } else {
            togglePulse(knobX, false);
        }

        // Vertical Movement -> Right Knob
        if (dy !== 0) {
            state.rotationY += dy * state.knobSensitivity;
            applyRotation(knobY, state.rotationY);
            togglePulse(knobY, true);
        } else {
            togglePulse(knobY, false);
        }
    }

    /**
     * Resets the UI components to their initial visual state.
     */
    function reset() {
        Logger.info('Resetting physical components to zero state.');

        state.rotationX = 0;
        state.rotationY = 0;

        // Reset X Knob
        if (knobX) {
            knobX.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            applyRotation(knobX, 0);
            setTimeout(() => {
                if (knobX) knobX.style.transition = '';
            }, 500);
        }

        // Reset Y Knob
        if (knobY) {
            knobY.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            applyRotation(knobY, 0);
            setTimeout(() => {
                if (knobY) knobY.style.transition = '';
            }, 500);
        }
    }

    /**
     * Sets the knob sensitivity.
     * @param {number} val 
     */
    function setSensitivity(val) {
        state.knobSensitivity = Utils.clamp(val, 1, 10);
        Logger.debug(`Knob sensitivity set to: ${state.knobSensitivity}`);
    }

    // Exported Object
    return {
        init,
        update,
        reset,
        setSensitivity
    };
})();
