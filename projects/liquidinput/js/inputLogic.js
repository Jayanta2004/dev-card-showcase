/**
 * LiquidInput - Input Logic Module
 * 
 * Handles keyboard input, typing speed measurement, pressure calculation,
 * and particle spawning based on user input.
 * 
 * Manages the relationship between typing behavior and system state.
 */

const InputLogic = (function () {
    'use strict';

    // ========================================================================
    // Private Variables
    // ========================================================================

    let inputElement = null;
    let currentPressure = 0;
    let typingHistory = [];
    let lastTypingTime = 0;
    let currentTypingSpeed = 0;
    let inputText = '';
    let onPressureChange = null;
    let onBurstTrigger = null;
    let onStateChange = null;
    let currentState = CONFIG.states.CALM;

    // ========================================================================
    // Typing Speed Measurement
    // ========================================================================

    /**
     * Record a keypress event
     * @param {number} timestamp - Current timestamp
     */
    function recordKeypress(timestamp) {
        typingHistory.push(timestamp);
        lastTypingTime = timestamp;

        // Remove old entries outside measurement window
        const cutoff = timestamp - CONFIG.pressure.speedMeasurementWindow;
        typingHistory = typingHistory.filter(time => time > cutoff);
    }

    /**
     * Calculate current typing speed (characters per second)
     * @param {number} timestamp - Current timestamp
     * @returns {number} Typing speed in characters per second
     */
    function calculateTypingSpeed(timestamp) {
        if (typingHistory.length === 0) return 0;

        const windowStart = timestamp - CONFIG.pressure.speedMeasurementWindow;
        const recentKeypresses = typingHistory.filter(time => time > windowStart);

        // Calculate characters per second
        const timeSpan = CONFIG.pressure.speedMeasurementWindow / 1000;
        currentTypingSpeed = recentKeypresses.length / timeSpan;

        return currentTypingSpeed;
    }

    /**
     * Check if typing is considered "slow"
     * @param {number} timestamp - Current timestamp
     * @returns {boolean} True if typing slowly
     */
    function isTypingSlow(timestamp) {
        if (typingHistory.length < 2) return true;

        const timeSinceLastKey = timestamp - lastTypingTime;
        return timeSinceLastKey > CONFIG.pressure.slowTypingThreshold;
    }

    // ========================================================================
    // Pressure Management
    // ========================================================================

    /**
     * Update pressure based on typing speed
     * @param {number} timestamp - Current timestamp
     */
    function updatePressure(timestamp) {
        const speed = calculateTypingSpeed(timestamp);

        // Pressure increases with typing speed
        if (speed > 0) {
            const pressureIncrease = CONFIG.pressure.pressurePerChar *
                (speed * CONFIG.pressure.speedMultiplier);
            currentPressure += pressureIncrease * 0.016; // Normalize to ~60fps
        }

        // Pressure decays when not typing
        const timeSinceLastKey = timestamp - lastTypingTime;
        if (timeSinceLastKey > CONFIG.pressure.slowTypingThreshold) {
            const decay = CONFIG.pressure.decayRate * 0.016; // Normalize to ~60fps
            currentPressure -= decay;
        }

        // Clamp pressure
        currentPressure = Math.max(0, Math.min(CONFIG.pressure.maxPressure, currentPressure));

        // Update state based on pressure
        updateState();

        // Notify pressure change
        if (onPressureChange) {
            onPressureChange(currentPressure);
        }

        // Check for burst condition
        checkBurstCondition();
    }

    /**
     * Check if burst should be triggered
     */
    function checkBurstCondition() {
        if (currentPressure >= CONFIG.pressure.burstThreshold &&
            currentState !== CONFIG.states.BURST) {
            triggerBurst();
        }
    }

    /**
     * Trigger burst event
     */
    function triggerBurst() {
        currentState = CONFIG.states.BURST;
        currentPressure = CONFIG.pressure.maxPressure;

        if (onBurstTrigger) {
            onBurstTrigger();
        }

        if (onStateChange) {
            onStateChange(currentState);
        }
    }

    /**
     * Update application state based on pressure
     */
    function updateState() {
        let newState = currentState;

        if (currentPressure < CONFIG.pressure.warningThreshold) {
            newState = CONFIG.states.CALM;
        } else if (currentPressure < CONFIG.pressure.criticalThreshold) {
            newState = CONFIG.states.BUILDING;
        } else if (currentPressure < CONFIG.pressure.burstThreshold) {
            newState = CONFIG.states.CRITICAL;
        }

        // Only trigger state change if state actually changed
        if (newState !== currentState && currentState !== CONFIG.states.BURST) {
            currentState = newState;
            if (onStateChange) {
                onStateChange(currentState);
            }
        }
    }

    // ========================================================================
    // Keyboard Input Handling
    // ========================================================================

    /**
     * Handle keydown event
     * @param {KeyboardEvent} event - Keyboard event
     */
    function handleKeyDown(event) {
        const key = event.key;

        // Ignore special keys
        if (CONFIG.input.ignoreChars.includes(key)) {
            return;
        }

        const timestamp = performance.now();

        // Handle backspace
        if (key === 'Backspace') {
            handleBackspace();
            recordKeypress(timestamp);
            return;
        }

        // Handle Enter (optional: could trigger special behavior)
        if (key === 'Enter') {
            event.preventDefault();
            return;
        }

        // Handle printable characters
        if (key.length === 1) {
            handleCharacterInput(key, timestamp);
        }
    }

    /**
     * Handle character input
     * @param {string} char - Input character
     * @param {number} timestamp - Current timestamp
     */
    function handleCharacterInput(char, timestamp) {
        // Check input length limit
        if (inputText.length >= CONFIG.input.maxLength) {
            return;
        }

        // Add character to input text
        inputText += char;

        // Record keypress for speed calculation
        recordKeypress(timestamp);

        // Calculate typing speed
        const speed = calculateTypingSpeed(timestamp);

        // Spawn particle
        spawnParticleForCharacter(char, speed);

        // Update pressure
        updatePressure(timestamp);
    }

    /**
     * Handle backspace key
     */
    function handleBackspace() {
        if (inputText.length > 0) {
            inputText = inputText.slice(0, -1);

            // Remove last particle
            const particles = ParticleEngine.getParticles();
            if (particles.length > 0) {
                const lastParticle = particles[particles.length - 1];
                if (lastParticle.state === 'calm') {
                    lastParticle.startFadeOut();
                }
            }
        }
    }

    /**
     * Handle input event (for paste, etc.)
     * @param {Event} event - Input event
     */
    function handleInput(event) {
        const newValue = inputElement.value;

        // Handle paste or other bulk input
        if (newValue.length > inputText.length + 1) {
            const addedText = newValue.slice(inputText.length);
            const timestamp = performance.now();

            for (const char of addedText) {
                if (inputText.length < CONFIG.input.maxLength) {
                    handleCharacterInput(char, timestamp);
                }
            }
        }

        // Sync input element value with internal state
        inputElement.value = inputText;
    }

    // ========================================================================
    // Particle Spawning
    // ========================================================================

    /**
     * Spawn a particle for a typed character
     * @param {string} char - Character to spawn
     * @param {number} speed - Current typing speed
     */
    function spawnParticleForCharacter(char, speed) {
        const bounds = CONFIG.boundaries.container;
        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;

        // Calculate spawn position based on current particle count
        const particles = ParticleEngine.getParticles();
        const calmParticles = particles.filter(p => p.state === 'calm');
        const index = calmParticles.length;

        const targetPos = ParticleEngine.calculateCalmPosition(index, calmParticles.length + 1);

        // Create particle
        const particle = ParticleEngine.createParticle(char, targetPos.x, targetPos.y, 'calm');

        // Add initial velocity based on typing speed (for visual effect)
        if (speed > 5) {
            particle.velocityY = -50 - (speed * 10);
        }
    }

    // ========================================================================
    // Focus Management
    // ========================================================================

    /**
     * Ensure input element stays focused
     */
    function maintainFocus() {
        if (inputElement && document.activeElement !== inputElement) {
            setTimeout(() => {
                inputElement.focus();
            }, CONFIG.input.refocusDelay);
        }
    }

    /**
     * Handle blur event
     */
    function handleBlur() {
        // Re-focus after a short delay
        maintainFocus();
    }

    // ========================================================================
    // Reset and Clear
    // ========================================================================

    /**
     * Reset pressure to zero
     */
    function resetPressure() {
        currentPressure = 0;
        typingHistory = [];
        currentTypingSpeed = 0;
        currentState = CONFIG.states.CALM;

        if (onPressureChange) {
            onPressureChange(currentPressure);
        }

        if (onStateChange) {
            onStateChange(currentState);
        }
    }

    /**
     * Clear all input
     */
    function clearInput() {
        inputText = '';
        if (inputElement) {
            inputElement.value = '';
        }
        resetPressure();
    }

    // ========================================================================
    // Public API
    // ========================================================================

    return {
        /**
         * Initialize input logic
         * @param {HTMLInputElement} element - Input element
         * @param {Object} callbacks - Callback functions
         */
        init(element, callbacks = {}) {
            inputElement = element;
            onPressureChange = callbacks.onPressureChange || null;
            onBurstTrigger = callbacks.onBurstTrigger || null;
            onStateChange = callbacks.onStateChange || null;

            // Attach event listeners
            inputElement.addEventListener('keydown', handleKeyDown);
            inputElement.addEventListener('input', handleInput);
            inputElement.addEventListener('blur', handleBlur);

            // Auto-focus if enabled
            if (CONFIG.input.autoFocus) {
                inputElement.focus();
            }

            // Maintain focus
            document.addEventListener('click', maintainFocus);
        },

        /**
         * Update pressure (called from animation loop)
         * @param {number} timestamp - Current timestamp
         */
        update(timestamp) {
            updatePressure(timestamp);
        },

        /**
         * Get current pressure
         * @returns {number} Current pressure (0-100)
         */
        getPressure() {
            return currentPressure;
        },

        /**
         * Get current typing speed
         * @returns {number} Typing speed in characters per second
         */
        getTypingSpeed() {
            return currentTypingSpeed;
        },

        /**
         * Get current state
         * @returns {string} Current state
         */
        getState() {
            return currentState;
        },

        /**
         * Get input text
         * @returns {string} Current input text
         */
        getText() {
            return inputText;
        },

        /**
         * Reset pressure
         */
        resetPressure,

        /**
         * Clear all input
         */
        clearInput,

        /**
         * Set state (for external control)
         * @param {string} state - New state
         */
        setState(state) {
            currentState = state;
            if (onStateChange) {
                onStateChange(currentState);
            }
        },

        /**
         * Force trigger burst (for testing)
         */
        forceBurst() {
            triggerBurst();
        }
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputLogic;
}
