/**
 * @file input.js
 * @description Manages user input from the keyboard (arrow keys).
 * Uses a polling system to ensure smooth, continuous drawing movement regardless
 * of the operating system's key-repeat delay.
 * 
 * FEATURES:
 * - Polling-based movement for 60fps smoothness.
 * - Multi-key support (diagonal drawing).
 * - "Turbo" mode (Shift key) for faster traversal.
 * - Gamepad support stub (ready for expansion).
 */

const Input = (() => {
    // --- Constants ---

    /** @type {number} Standard pixels per frame */
    const BASE_SPEED = 2;
    /** @type {number} Speed multiplier when Shift is held */
    const TURBO_MULTIPLIER = 2.5;

    // --- Private State ---

    /** 
     * @type {Object<string, boolean>} 
     * Mapping of key codes to their current pressed state.
     */
    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        ShiftLeft: false,
        ShiftRight: false
    };

    /** @type {Function|null} Callback for movement: (dx, dy) => void */
    let onMoveCallback = null;
    /** @type {number|null} Current RequestAnimationFrame ID */
    let frameId = null;
    /** @type {boolean} Internal flag for pause/resume */
    let isPaused = false;

    // --- Private Methods ---

    /**
     * The input processing loop. Fires every frame to check key states.
     * This is decoupled from actual event listeners to avoid jitter.
     */
    function processInput() {
        if (isPaused) {
            frameId = requestAnimationFrame(processInput);
            return;
        }

        let dx = 0;
        let dy = 0;

        // Calculate speed based on Turbo state
        const isTurbo = keys.ShiftLeft || keys.ShiftRight;
        const currentSpeed = isTurbo ? BASE_SPEED * TURBO_MULTIPLIER : BASE_SPEED;

        // X-Axis Calculation
        if (keys.ArrowLeft) dx -= currentSpeed;
        if (keys.ArrowRight) dx += currentSpeed;

        // Y-Axis Calculation
        if (keys.ArrowUp) dy -= currentSpeed;
        if (keys.ArrowDown) dy += currentSpeed;

        // Dispatch movement if delta is non-zero
        if ((dx !== 0 || dy !== 0) && onMoveCallback) {
            onMoveCallback(dx, dy);
        }

        frameId = requestAnimationFrame(processInput);
    }

    /**
     * Standardizes key codes and updates the state map.
     * @param {KeyboardEvent} e 
     * @param {boolean} isPressed 
     */
    function updateKeyState(e, isPressed) {
        // We use .code for physical location consistency
        if (keys.hasOwnProperty(e.code)) {
            keys[e.code] = isPressed;

            // Prevent scrolling when drawing
            if (e.code.startsWith('Arrow')) {
                e.preventDefault();
            }
        }
    }

    // --- Public API ---

    /**
     * Initializes the input system and hooks into the DOM.
     * @param {Function} callback - Function(dx, dy) to invoke on move.
     */
    function init(callback) {
        if (typeof callback !== 'function') {
            Logger.error('Input system requires a valid movement callback function.');
            return;
        }

        onMoveCallback = callback;

        // Attach listeners to window for global scope
        window.addEventListener('keydown', (e) => updateKeyState(e, true));
        window.addEventListener('keyup', (e) => updateKeyState(e, false));

        // Start the engine heartbeat
        isPaused = false;
        frameId = requestAnimationFrame(processInput);

        Logger.info('Input system initialized. Polling started at 60Hz.');
        Logger.debug('Turbo mode enabled via [Shift] key.');
    }

    /**
     * Temporarily halts input processing.
     */
    function pause() {
        isPaused = true;
        Logger.debug('Input processing paused.');
    }

    /**
     * Resumes input processing.
     */
    function resume() {
        isPaused = false;
        Logger.debug('Input processing resumed.');
    }

    /**
     * Gracefully clears all listeners and stops the loop.
     */
    function shutdown() {
        if (frameId) {
            cancelAnimationFrame(frameId);
            frameId = null;
        }

        // Remove listeners
        window.removeEventListener('keydown', updateKeyState);
        window.removeEventListener('keyup', updateKeyState);

        Logger.info('Input system has been shut down.');
    }

    /**
     * Gets a detailed breakdown of the current input state.
     * @returns {Object}
     */
    function getDiagnostics() {
        return {
            activeKeys: Object.entries(keys).filter(([_, pressed]) => pressed).map(([k]) => k),
            pollingActive: !!frameId,
            paused: isPaused,
            hasCallback: !!onMoveCallback
        };
    }

    // Public API surface
    return {
        init,
        pause,
        resume,
        shutdown,
        getDiagnostics
    };
})();
