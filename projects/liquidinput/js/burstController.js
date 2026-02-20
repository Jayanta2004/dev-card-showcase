/**
 * LiquidInput - Burst Controller Module
 * 
 * Manages burst state transitions, container visual effects,
 * particle explosion mechanics, and recovery sequences.
 * 
 * Orchestrates the dramatic burst animation when pressure exceeds limits.
 */

const BurstController = (function () {
    'use strict';

    // ========================================================================
    // Private Variables
    // ========================================================================

    let containerElement = null;
    let overlayElement = null;
    let isBursting = false;
    let burstStartTime = 0;
    let onBurstComplete = null;

    // ========================================================================
    // Container Visual Effects
    // ========================================================================

    /**
     * Apply shake animation to container
     */
    function shakeContainer() {
        if (!containerElement) return;

        containerElement.classList.add('shaking');

        setTimeout(() => {
            containerElement.classList.remove('shaking');
        }, CONFIG.burst.shakeDuration);
    }

    /**
     * Apply crack overlay effect
     */
    function showCracks() {
        if (!overlayElement) return;

        overlayElement.classList.add('cracking');

        setTimeout(() => {
            overlayElement.classList.remove('cracking');
        }, CONFIG.burst.crackDuration);
    }

    /**
     * Apply shatter effect
     */
    function shatterContainer() {
        if (!overlayElement) return;

        overlayElement.classList.add('shattering');

        setTimeout(() => {
            overlayElement.classList.remove('shattering');
            overlayElement.style.opacity = '0';
        }, CONFIG.burst.shatterDuration);
    }

    /**
     * Update container visual state
     * @param {string} state - Current state
     */
    function updateContainerState(state) {
        if (!containerElement) return;

        // Remove all state classes
        containerElement.removeAttribute('data-state');
        containerElement.classList.remove('pressure-warning');

        // Apply new state
        containerElement.setAttribute('data-state', state);

        if (state === CONFIG.states.CRITICAL) {
            containerElement.classList.add('pressure-warning');
        }
    }

    // ========================================================================
    // Burst Sequence
    // ========================================================================

    /**
     * Execute burst animation sequence
     */
    function executeBurstSequence() {
        if (isBursting) return;

        isBursting = true;
        burstStartTime = performance.now();

        // Update container state
        updateContainerState(CONFIG.states.BURST);

        // Step 1: Shake container
        shakeContainer();

        // Step 2: Show cracks (after shake starts)
        setTimeout(() => {
            showCracks();
        }, CONFIG.burst.shakeDuration * 0.5);

        // Step 3: Explode particles
        setTimeout(() => {
            explodeParticles();
        }, CONFIG.burst.shakeDuration + CONFIG.burst.crackDuration * 0.5);

        // Step 4: Shatter container
        setTimeout(() => {
            shatterContainer();
        }, CONFIG.burst.shakeDuration + CONFIG.burst.crackDuration);

        // Step 5: Complete burst
        setTimeout(() => {
            completeBurst();
        }, CONFIG.burst.animationDuration);
    }

    /**
     * Explode all particles
     */
    function explodeParticles() {
        const particles = ParticleEngine.getParticles();
        const bounds = CONFIG.boundaries.container;
        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;

        // Apply explosive force to all particles
        Physics.explode(particles, centerX, centerY);

        // Set particles to burst state
        ParticleEngine.setAllParticlesState('burst');

        // After a delay, transition to spilled state
        setTimeout(() => {
            ParticleEngine.setAllParticlesState('spilled');
        }, CONFIG.burst.particleDelayMax);
    }

    /**
     * Complete burst sequence and start recovery
     */
    function completeBurst() {
        isBursting = false;

        // Notify completion
        if (onBurstComplete) {
            onBurstComplete();
        }

        // Start recovery sequence
        startRecovery();
    }

    // ========================================================================
    // Recovery Sequence
    // ========================================================================

    /**
     * Start recovery sequence
     */
    function startRecovery() {
        // Transition to recovery state
        updateContainerState(CONFIG.states.RECOVERY);

        // Wait for recovery duration
        setTimeout(() => {
            // Transition back to calm
            resetToCalm();
        }, CONFIG.states.transitionDelays.recoveryToCalm);
    }

    /**
     * Reset to calm state
     */
    function resetToCalm() {
        updateContainerState(CONFIG.states.CALM);

        // Reset overlay
        if (overlayElement) {
            overlayElement.style.opacity = '0';
            overlayElement.classList.remove('cracking', 'shattering');
        }
    }

    // ========================================================================
    // Manual Control
    // ========================================================================

    /**
     * Manually trigger burst
     */
    function triggerBurst() {
        if (!isBursting) {
            executeBurstSequence();
        }
    }

    /**
     * Manually reset to calm state
     */
    function reset() {
        isBursting = false;
        resetToCalm();

        // Clear all particles
        ParticleEngine.clearAll();
    }

    // ========================================================================
    // State Management
    // ========================================================================

    /**
     * Handle state change from input logic
     * @param {string} state - New state
     */
    function handleStateChange(state) {
        if (state === CONFIG.states.BURST) {
            executeBurstSequence();
        } else {
            updateContainerState(state);
        }
    }

    // ========================================================================
    // Public API
    // ========================================================================

    return {
        /**
         * Initialize burst controller
         * @param {HTMLElement} container - Container element
         * @param {HTMLElement} overlay - Overlay element
         * @param {Object} callbacks - Callback functions
         */
        init(container, overlay, callbacks = {}) {
            containerElement = container;
            overlayElement = overlay;
            onBurstComplete = callbacks.onBurstComplete || null;

            // Set initial state
            updateContainerState(CONFIG.states.CALM);
        },

        /**
         * Trigger burst animation
         */
        triggerBurst,

        /**
         * Reset to calm state
         */
        reset,

        /**
         * Handle state change
         * @param {string} state - New state
         */
        handleStateChange,

        /**
         * Check if currently bursting
         * @returns {boolean} True if bursting
         */
        isBursting() {
            return isBursting;
        },

        /**
         * Update container visual state
         * @param {string} state - New state
         */
        updateContainerState
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BurstController;
}
