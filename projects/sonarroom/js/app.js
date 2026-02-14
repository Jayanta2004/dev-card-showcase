/**
 * SonarRoom - Main Application
 * Orchestrates all modules and manages application lifecycle
 */

const App = (function () {
    // ============================================
    // Private State
    // ============================================

    let isInitialized = false;
    let isRunning = false;

    // DOM elements
    let instructionsOverlay = null;
    let successOverlay = null;
    let startButton = null;
    let restartButton = null;
    let targetElement = null;

    // ============================================
    // Initialization
    // ============================================

    /**
     * Initialize the application
     */
    function init() {
        if (isInitialized) {
            Utils.log('warn', 'App already initialized');
            return;
        }

        Utils.log('info', 'Initializing SonarRoom...');

        // Check browser compatibility
        if (!checkCompatibility()) {
            showCompatibilityError();
            return;
        }

        // Get DOM elements
        getDOMElements();

        // Initialize modules
        if (!initializeModules()) {
            Utils.log('error', 'Failed to initialize modules');
            return;
        }

        // Bind UI events
        bindUIEvents();

        // Show instructions overlay
        showInstructions();

        isInitialized = true;
        Utils.log('info', 'SonarRoom initialized successfully');
    }

    /**
     * Check browser compatibility
     * @returns {boolean} True if compatible
     */
    function checkCompatibility() {
        // Check Web Audio API support
        if (!Utils.isWebAudioSupported()) {
            Utils.log('error', 'Web Audio API not supported');
            return false;
        }

        // Check for required DOM APIs
        if (!document.getElementById || !document.querySelector) {
            Utils.log('error', 'Required DOM APIs not supported');
            return false;
        }

        return true;
    }

    /**
     * Get DOM elements
     */
    function getDOMElements() {
        instructionsOverlay = Utils.getElement('instructions-overlay');
        successOverlay = Utils.getElement('success-overlay');
        startButton = Utils.getElement('start-button');
        restartButton = Utils.getElement('restart-button');
        targetElement = Utils.getElement('target');
    }

    /**
     * Initialize all modules
     * @returns {boolean} True if successful
     */
    function initializeModules() {
        try {
            // Initialize interaction system
            if (!InteractionSystem.init()) {
                Utils.log('error', 'Failed to initialize InteractionSystem');
                return false;
            }

            return true;

        } catch (error) {
            Utils.log('error', 'Module initialization failed', error);
            return false;
        }
    }

    /**
     * Bind UI event listeners
     */
    function bindUIEvents() {
        // Start button
        if (startButton) {
            startButton.addEventListener('click', handleStartClick);
        }

        // Restart button
        if (restartButton) {
            restartButton.addEventListener('click', handleRestartClick);
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyPress);

        Utils.log('info', 'UI events bound');
    }

    // ============================================
    // UI Event Handlers
    // ============================================

    /**
     * Handle start button click
     */
    function handleStartClick() {
        Utils.log('info', 'Start button clicked');

        // Initialize audio engine (requires user gesture)
        if (!AudioEngine.isInitialized()) {
            if (!AudioEngine.init()) {
                Utils.log('error', 'Failed to initialize AudioEngine');
                alert('Failed to initialize audio. Please check your browser settings.');
                return;
            }
        }

        // Resume audio context if suspended
        AudioEngine.resume();

        // Start the game
        startGame();
    }

    /**
     * Handle restart button click
     */
    function handleRestartClick() {
        Utils.log('info', 'Restart button clicked');

        // Reset and start new game
        resetGame();
        startGame();
    }

    /**
     * Handle keyboard input
     * @param {KeyboardEvent} event - Keyboard event
     */
    function handleKeyPress(event) {
        if (!CONFIG.accessibility.enableKeyboardControls) return;

        switch (event.key) {
            case 'Escape':
                // Pause or return to menu
                if (isRunning) {
                    pauseGame();
                }
                break;

            case 'r':
            case 'R':
                // Restart game
                if (InteractionSystem.getState() === CONFIG.game.states.SUCCESS) {
                    handleRestartClick();
                }
                break;

            case ' ':
                // Space to start
                if (InteractionSystem.getState() === CONFIG.game.states.IDLE) {
                    event.preventDefault();
                    handleStartClick();
                }
                break;
        }
    }

    // ============================================
    // Game Flow
    // ============================================

    /**
     * Start the game
     */
    function startGame() {
        if (isRunning) {
            Utils.log('warn', 'Game already running');
            return;
        }

        Utils.log('info', 'Starting game...');

        // Hide instructions overlay
        hideInstructions();

        // Generate random target position
        const targetPos = DistanceMapper.generateRandomTarget();
        DistanceMapper.setTargetPosition(targetPos.x, targetPos.y);

        // Position target element
        if (targetElement) {
            Utils.setStyles(targetElement, {
                left: `${targetPos.x}px`,
                top: `${targetPos.y}px`
            });
        }

        // Start interaction system
        InteractionSystem.start();

        isRunning = true;
        Utils.log('info', 'Game started');
    }

    /**
     * Pause the game
     */
    function pauseGame() {
        if (!isRunning) return;

        Utils.log('info', 'Game paused');

        InteractionSystem.stop();
        InteractionSystem.setState(CONFIG.game.states.PAUSED);

        isRunning = false;
    }

    /**
     * Reset the game
     */
    function resetGame() {
        Utils.log('info', 'Resetting game...');

        // Stop and reset interaction system
        InteractionSystem.reset();

        // Hide success overlay
        if (successOverlay) {
            Utils.removeClass(successOverlay, 'active');
        }

        // Stop audio
        AudioEngine.stopPinging();
        AudioEngine.stopAllOscillators();

        isRunning = false;

        Utils.log('info', 'Game reset complete');
    }

    // ============================================
    // UI Management
    // ============================================

    /**
     * Show instructions overlay
     */
    function showInstructions() {
        if (instructionsOverlay) {
            Utils.addClass(instructionsOverlay, 'active');
        }
    }

    /**
     * Hide instructions overlay
     */
    function hideInstructions() {
        if (instructionsOverlay) {
            Utils.removeClass(instructionsOverlay, 'active');

            // Fade out animation
            setTimeout(() => {
                instructionsOverlay.style.display = 'none';
            }, CONFIG.timing.overlayFadeOut);
        }
    }

    /**
     * Show compatibility error
     */
    function showCompatibilityError() {
        const message = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 68, 68, 0.9);
                color: white;
                padding: 2rem;
                border-radius: 0.5rem;
                font-family: monospace;
                text-align: center;
                z-index: 9999;
            ">
                <h2>Browser Not Supported</h2>
                <p>This application requires Web Audio API support.</p>
                <p>Please use a modern browser like Chrome, Firefox, or Edge.</p>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', message);
    }

    // ============================================
    // Debug & Development
    // ============================================

    /**
     * Get application state for debugging
     * @returns {Object} State object
     */
    function getDebugState() {
        return {
            isInitialized,
            isRunning,
            interactionState: InteractionSystem.getState(),
            interactionActive: InteractionSystem.isActive(),
            audioInitialized: AudioEngine.isInitialized(),
            audioPinging: AudioEngine.isPinging(),
            audioContextState: AudioEngine.getContextState(),
            stats: InteractionSystem.getStats(),
            distanceInfo: DistanceMapper.getDebugInfo(),
            config: CONFIG
        };
    }

    /**
     * Enable debug mode
     */
    function enableDebugMode() {
        CONFIG.debug.enableLogging = true;
        CONFIG.debug.showTargetOutline = true;

        // Show target outline
        if (targetElement) {
            targetElement.style.border = '2px dashed red';
            targetElement.style.background = 'rgba(255, 0, 0, 0.2)';
        }

        Utils.log('info', 'Debug mode enabled');
        console.log('Debug state:', getDebugState());
    }

    /**
     * Disable debug mode
     */
    function disableDebugMode() {
        CONFIG.debug.enableLogging = false;
        CONFIG.debug.showTargetOutline = false;

        // Hide target outline
        if (targetElement) {
            targetElement.style.border = 'none';
            targetElement.style.background = 'transparent';
        }

        console.log('Debug mode disabled');
    }

    // ============================================
    // Cleanup
    // ============================================

    /**
     * Destroy the application and clean up resources
     */
    function destroy() {
        Utils.log('info', 'Destroying application...');

        // Stop game
        resetGame();

        // Destroy modules
        AudioEngine.destroy();

        // Unbind events
        if (startButton) {
            startButton.removeEventListener('click', handleStartClick);
        }
        if (restartButton) {
            restartButton.removeEventListener('click', handleRestartClick);
        }
        document.removeEventListener('keydown', handleKeyPress);

        isInitialized = false;
        isRunning = false;

        Utils.log('info', 'Application destroyed');
    }

    // ============================================
    // Public API
    // ============================================

    return {
        init,
        startGame,
        pauseGame,
        resetGame,
        destroy,

        // Debug
        getDebugState,
        enableDebugMode,
        disableDebugMode,

        // Getters
        isInitialized: () => isInitialized,
        isRunning: () => isRunning
    };
})();

// ============================================
// Auto-initialize on DOM ready
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });
} else {
    // DOM already loaded
    App.init();
}

// ============================================
// Global debug access (development only)
// ============================================

if (CONFIG.debug.enableLogging) {
    window.SonarRoom = {
        App,
        AudioEngine,
        DistanceMapper,
        InteractionSystem,
        Utils,
        CONFIG
    };

    console.log('%c🎯 SonarRoom Debug Mode', 'color: #00d4ff; font-size: 16px; font-weight: bold');
    console.log('Access modules via window.SonarRoom');
    console.log('Try: SonarRoom.App.enableDebugMode()');
}

// ============================================
// Export
// ============================================

// Freeze public API
if (Object.freeze) {
    Object.freeze(App);
}
