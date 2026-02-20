/**
 * LiquidInput - Main Application Module
 * 
 * Application orchestration, initialization, animation loop coordination,
 * UI updates, and event handling.
 * 
 * Entry point for the LiquidInput fluid-dynamics text input application.
 */

(function () {
    'use strict';

    // ========================================================================
    // DOM Elements
    // ========================================================================

    let canvas = null;
    let hiddenInput = null;
    let glassContainer = null;
    let containerOverlay = null;
    let pressureBar = null;
    let pressureValue = null;
    let pressureIndicator = null;
    let stateValue = null;
    let particleCount = null;
    let typingSpeed = null;
    let resetBtn = null;
    let clearBtn = null;

    // ========================================================================
    // Application State
    // ========================================================================

    let isRunning = false;
    let animationFrameId = null;
    let lastUpdateTime = 0;

    // ========================================================================
    // Initialization
    // ========================================================================

    /**
     * Initialize the application
     */
    function init() {
        // Get DOM elements
        getDOMElements();

        // Initialize modules
        initializeModules();

        // Set up event listeners
        setupEventListeners();

        // Start animation loop
        startAnimationLoop();

        console.log('LiquidInput initialized successfully');
    }

    /**
     * Get all required DOM elements
     */
    function getDOMElements() {
        canvas = document.getElementById('particleCanvas');
        hiddenInput = document.getElementById('hiddenInput');
        glassContainer = document.getElementById('glassContainer');
        containerOverlay = document.getElementById('containerOverlay');
        pressureBar = document.getElementById('pressureBar');
        pressureValue = document.getElementById('pressureValue');
        pressureIndicator = document.getElementById('pressureIndicator');
        stateValue = document.getElementById('stateValue');
        particleCount = document.getElementById('particleCount');
        typingSpeed = document.getElementById('typingSpeed');
        resetBtn = document.getElementById('resetBtn');
        clearBtn = document.getElementById('clearBtn');

        // Validate critical elements
        if (!canvas || !hiddenInput || !glassContainer) {
            console.error('Critical DOM elements not found');
            return false;
        }

        return true;
    }

    /**
     * Initialize all modules
     */
    function initializeModules() {
        // Initialize particle engine
        ParticleEngine.init(canvas);

        // Initialize input logic
        InputLogic.init(hiddenInput, {
            onPressureChange: handlePressureChange,
            onBurstTrigger: handleBurstTrigger,
            onStateChange: handleStateChange
        });

        // Initialize burst controller
        BurstController.init(glassContainer, containerOverlay, {
            onBurstComplete: handleBurstComplete
        });

        // Update boundaries
        CONFIG.updateBoundaries(glassContainer);
    }

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Window resize
        window.addEventListener('resize', handleResize);

        // Button clicks
        if (resetBtn) {
            resetBtn.addEventListener('click', handleReset);
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', handleClear);
        }

        // Prevent default behaviors
        document.addEventListener('contextmenu', (e) => {
            if (e.target === canvas) {
                e.preventDefault();
            }
        });
    }

    // ========================================================================
    // Animation Loop
    // ========================================================================

    /**
     * Start the animation loop
     */
    function startAnimationLoop() {
        if (isRunning) return;

        isRunning = true;
        lastUpdateTime = performance.now();
        animate(lastUpdateTime);
    }

    /**
     * Stop the animation loop
     */
    function stopAnimationLoop() {
        isRunning = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    /**
     * Main animation loop
     * @param {number} timestamp - Current timestamp
     */
    function animate(timestamp) {
        if (!isRunning) return;

        // Update input logic
        InputLogic.update(timestamp);

        // Get current pressure
        const pressure = InputLogic.getPressure();

        // Animate particles
        ParticleEngine.animate(timestamp, pressure);

        // Apply alignment to calm particles
        const deltaTime = (timestamp - lastUpdateTime) / 1000;
        ParticleEngine.applyAlignment(deltaTime);

        // Update UI
        updateUI(timestamp);

        // Update last update time
        lastUpdateTime = timestamp;

        // Request next frame
        animationFrameId = requestAnimationFrame(animate);
    }

    // ========================================================================
    // UI Updates
    // ========================================================================

    /**
     * Update UI elements
     * @param {number} timestamp - Current timestamp
     */
    function updateUI(timestamp) {
        // Update particle count
        if (particleCount) {
            particleCount.textContent = ParticleEngine.getParticleCount();
        }

        // Update typing speed
        if (typingSpeed) {
            const speed = InputLogic.getTypingSpeed();
            typingSpeed.textContent = `${speed.toFixed(1)} cps`;
        }
    }

    /**
     * Update pressure indicator
     * @param {number} pressure - Current pressure (0-100)
     */
    function updatePressureIndicator(pressure) {
        if (!pressureBar || !pressureValue) return;

        // Update bar width
        pressureBar.style.width = `${pressure}%`;

        // Update value text
        pressureValue.textContent = `${Math.round(pressure)}%`;

        // Update bar color level
        if (pressure < CONFIG.pressure.warningThreshold) {
            pressureBar.setAttribute('data-level', 'low');
        } else if (pressure < CONFIG.pressure.criticalThreshold) {
            pressureBar.setAttribute('data-level', 'medium');
        } else {
            pressureBar.setAttribute('data-level', 'high');
        }

        // Update indicator animation
        if (pressureIndicator) {
            if (pressure >= CONFIG.pressure.criticalThreshold) {
                pressureIndicator.classList.add('critical');
            } else {
                pressureIndicator.classList.remove('critical');
            }
        }
    }

    /**
     * Update state display
     * @param {string} state - Current state
     */
    function updateStateDisplay(state) {
        if (!stateValue) return;

        // Format state name
        const stateNames = {
            [CONFIG.states.CALM]: 'Calm',
            [CONFIG.states.BUILDING]: 'Building Pressure',
            [CONFIG.states.CRITICAL]: 'Critical!',
            [CONFIG.states.BURST]: 'Burst!',
            [CONFIG.states.RECOVERY]: 'Recovering'
        };

        stateValue.textContent = stateNames[state] || state;

        // Update state color
        if (state === CONFIG.states.CRITICAL || state === CONFIG.states.BURST) {
            stateValue.style.color = '#ef4444';
        } else if (state === CONFIG.states.BUILDING) {
            stateValue.style.color = '#f59e0b';
        } else {
            stateValue.style.color = '#e0e6ed';
        }
    }

    // ========================================================================
    // Event Handlers
    // ========================================================================

    /**
     * Handle pressure change
     * @param {number} pressure - New pressure value
     */
    function handlePressureChange(pressure) {
        updatePressureIndicator(pressure);
    }

    /**
     * Handle burst trigger
     */
    function handleBurstTrigger() {
        BurstController.triggerBurst();
    }

    /**
     * Handle state change
     * @param {string} state - New state
     */
    function handleStateChange(state) {
        updateStateDisplay(state);
        BurstController.handleStateChange(state);
    }

    /**
     * Handle burst complete
     */
    function handleBurstComplete() {
        // Reset pressure after burst
        setTimeout(() => {
            InputLogic.resetPressure();
        }, 500);
    }

    /**
     * Handle window resize
     */
    function handleResize() {
        // Resize canvas
        ParticleEngine.resize();

        // Update boundaries
        CONFIG.updateBoundaries(glassContainer);
    }

    /**
     * Handle reset button click
     */
    function handleReset() {
        // Add button animation
        resetBtn.classList.add('clicked');
        setTimeout(() => {
            resetBtn.classList.remove('clicked');
        }, 300);

        // Reset application
        BurstController.reset();
        InputLogic.resetPressure();
        InputLogic.setState(CONFIG.states.CALM);

        // Clear particles
        ParticleEngine.clearAll();

        // Refocus input
        if (hiddenInput) {
            hiddenInput.focus();
        }
    }

    /**
     * Handle clear button click
     */
    function handleClear() {
        // Add button animation
        clearBtn.classList.add('clearing');
        setTimeout(() => {
            clearBtn.classList.remove('clearing');
        }, 500);

        // Clear input and particles
        InputLogic.clearInput();
        ParticleEngine.clearAll();

        // Refocus input
        if (hiddenInput) {
            hiddenInput.focus();
        }
    }

    // ========================================================================
    // Utility Functions
    // ========================================================================

    /**
     * Get application info
     * @returns {Object} Application information
     */
    function getInfo() {
        return {
            version: '1.0.0',
            particleCount: ParticleEngine.getParticleCount(),
            pressure: InputLogic.getPressure(),
            state: InputLogic.getState(),
            typingSpeed: InputLogic.getTypingSpeed(),
            isRunning: isRunning
        };
    }

    /**
     * Enable debug mode
     */
    function enableDebug() {
        CONFIG.debug.enabled = true;
        CONFIG.debug.showFPS = true;
        CONFIG.debug.logPerformance = true;
        console.log('Debug mode enabled');
    }

    /**
     * Disable debug mode
     */
    function disableDebug() {
        CONFIG.debug.enabled = false;
        CONFIG.debug.showFPS = false;
        CONFIG.debug.logPerformance = false;
        console.log('Debug mode disabled');
    }

    // ========================================================================
    // Public API (for debugging/testing)
    // ========================================================================

    window.LiquidInput = {
        getInfo,
        enableDebug,
        disableDebug,
        reset: handleReset,
        clear: handleClear,
        forceBurst: () => InputLogic.forceBurst(),

        // Module access for debugging
        modules: {
            ParticleEngine,
            InputLogic,
            BurstController,
            Physics,
            CONFIG
        }
    };

    // ========================================================================
    // Application Entry Point
    // ========================================================================

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
