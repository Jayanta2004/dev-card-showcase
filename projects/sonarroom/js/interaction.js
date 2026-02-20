/**
 * SonarRoom - Interaction System
 * Handles mouse events, click detection, and state management
 */

const InteractionSystem = (function () {
    // ============================================
    // Private State
    // ============================================

    let currentState = CONFIG.game.initialState;
    let isActive = false;
    let mousePosition = { x: 0, y: 0 };
    let mouseMoveCount = 0;
    let clickCount = 0;
    let startTime = null;
    let gameTimer = null;

    // Throttled handlers
    let throttledMouseMove = null;
    let debouncedClick = null;

    // DOM elements
    let targetElement = null;
    let proximityIndicator = null;
    let proximityBar = null;
    let audioStatus = null;
    let canvasElement = null;
    let canvasContext = null;

    // ============================================
    // Initialization
    // ============================================

    /**
     * Initialize interaction system
     * @returns {boolean} True if successful
     */
    function init() {
        try {
            // Get DOM elements
            targetElement = Utils.getElement('target');
            proximityIndicator = Utils.getElement('proximity-indicator');
            proximityBar = document.querySelector('.proximity-indicator__bar');
            audioStatus = Utils.getElement('audio-status');
            canvasElement = Utils.getElement('feedback-canvas');

            if (!targetElement) {
                Utils.log('error', 'Required DOM elements not found');
                return false;
            }

            // Initialize canvas
            if (canvasElement && CONFIG.ui.enableCanvasFeedback) {
                initCanvas();
            }

            // Create throttled/debounced handlers
            throttledMouseMove = Utils.throttle(
                handleMouseMove,
                CONFIG.timing.mouseMoveThrottle
            );

            debouncedClick = Utils.debounce(
                handleClick,
                CONFIG.timing.clickDebounce
            );

            // Create game timer
            gameTimer = Utils.createTimer();

            Utils.log('info', 'InteractionSystem initialized');
            return true;

        } catch (error) {
            Utils.log('error', 'Failed to initialize InteractionSystem', error);
            return false;
        }
    }

    /**
     * Initialize canvas for visual feedback
     */
    function initCanvas() {
        if (!canvasElement) return;

        canvasContext = canvasElement.getContext('2d');

        // Set canvas size to viewport
        resizeCanvas();

        // Listen for window resize
        window.addEventListener('resize', resizeCanvas);
    }

    /**
     * Resize canvas to match viewport
     */
    function resizeCanvas() {
        if (!canvasElement) return;

        const viewport = Utils.getViewportSize();
        canvasElement.width = viewport.width;
        canvasElement.height = viewport.height;
    }

    // ============================================
    // Event Handlers
    // ============================================

    /**
     * Handle mouse move event
     * @param {MouseEvent} event - Mouse event
     */
    function handleMouseMove(event) {
        if (!isActive) return;

        // Update mouse position
        mousePosition.x = event.clientX;
        mousePosition.y = event.clientY;
        mouseMoveCount++;

        // Get audio parameters from distance mapper
        const params = DistanceMapper.getAudioParameters(
            mousePosition.x,
            mousePosition.y
        );

        // Update audio engine
        AudioEngine.updatePing(
            params.frequency,
            params.interval,
            params.pan
        );

        // Update visual feedback
        updateProximityIndicator(params);

        // Draw canvas feedback
        if (CONFIG.ui.enableCanvasFeedback) {
            drawSonarPing(mousePosition.x, mousePosition.y, params);
        }

        // Log debug info
        if (CONFIG.debug.enableLogging && CONFIG.debug.logLevel === 'debug') {
            Utils.log('debug', 'Mouse move', {
                position: mousePosition,
                params
            });
        }
    }

    /**
     * Handle click event
     * @param {MouseEvent} event - Mouse event
     */
    function handleClick(event) {
        if (!isActive) return;

        clickCount++;

        const clickX = event.clientX;
        const clickY = event.clientY;

        // Check if target was hit
        const hit = DistanceMapper.isHit(clickX, clickY);

        if (hit) {
            handleSuccess();
        } else {
            handleMiss(clickX, clickY);
        }
    }

    /**
     * Handle successful target hit
     */
    function handleSuccess() {
        Utils.log('info', 'Success! Target found');

        // Stop game timer
        gameTimer.stop();

        // Change state
        setState(CONFIG.game.states.SUCCESS);

        // Stop pinging
        AudioEngine.stopPinging();

        // Play success sound
        if (CONFIG.game.onSuccess.playSuccessSound) {
            AudioEngine.playSuccessSound();
        }

        // Show success overlay with stats
        if (CONFIG.game.onSuccess.showStats) {
            showSuccessScreen();
        }
    }

    /**
     * Handle missed click
     * @param {number} x - Click X position
     * @param {number} y - Click Y position
     */
    function handleMiss(x, y) {
        Utils.log('debug', 'Miss at', { x, y });

        // Visual feedback for miss (optional)
        if (CONFIG.ui.enableCanvasFeedback) {
            drawMissIndicator(x, y);
        }
    }

    // ============================================
    // State Management
    // ============================================

    /**
     * Set current game state
     * @param {string} newState - New state
     */
    function setState(newState) {
        const oldState = currentState;
        currentState = newState;

        Utils.log('info', `State changed: ${oldState} -> ${newState}`);

        // Trigger state change handlers
        onStateChange(oldState, newState);
    }

    /**
     * Get current state
     * @returns {string} Current state
     */
    function getState() {
        return currentState;
    }

    /**
     * Handle state changes
     * @param {string} oldState - Previous state
     * @param {string} newState - New state
     */
    function onStateChange(oldState, newState) {
        switch (newState) {
            case CONFIG.game.states.EXPLORING:
                onExploringStart();
                break;
            case CONFIG.game.states.SUCCESS:
                onSuccessStart();
                break;
            case CONFIG.game.states.IDLE:
                onIdleStart();
                break;
        }
    }

    /**
     * Handle transition to exploring state
     */
    function onExploringStart() {
        // Start game timer
        gameTimer.start();

        // Show audio status
        if (audioStatus && CONFIG.ui.showAudioStatus) {
            Utils.addClass(audioStatus, 'active');
        }
    }

    /**
     * Handle transition to success state
     */
    function onSuccessStart() {
        // Hide proximity indicator
        if (proximityIndicator) {
            Utils.removeClass(proximityIndicator, 'visible');
        }

        // Hide audio status
        if (audioStatus) {
            Utils.removeClass(audioStatus, 'active');
        }
    }

    /**
     * Handle transition to idle state
     */
    function onIdleStart() {
        // Reset counters
        mouseMoveCount = 0;
        clickCount = 0;

        // Reset timer
        gameTimer.reset();
    }

    // ============================================
    // Visual Feedback
    // ============================================

    /**
     * Update proximity indicator bar
     * @param {Object} params - Audio parameters
     */
    function updateProximityIndicator(params) {
        if (!proximityBar || !CONFIG.ui.showProximityBar) return;

        const proximity = 1 - params.normalizedDistance;

        // Show indicator when close enough
        if (proximity >= CONFIG.ui.proximityThreshold) {
            Utils.addClass(proximityIndicator, 'visible');

            // Update bar width
            const percent = Utils.formatPercent(proximity, 0);
            proximityBar.style.width = percent;

            // Add "near" class for animation
            if (proximity >= 0.8) {
                Utils.addClass(proximityBar, 'near');
            } else {
                Utils.removeClass(proximityBar, 'near');
            }
        } else {
            Utils.removeClass(proximityIndicator, 'visible');
        }
    }

    /**
     * Draw sonar ping on canvas
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} params - Audio parameters
     */
    function drawSonarPing(x, y, params) {
        if (!canvasContext) return;

        // Clear canvas with fade effect
        canvasContext.fillStyle = 'rgba(0, 0, 0, 0.1)';
        canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);

        // Draw ping circle
        const proximity = 1 - params.normalizedDistance;
        const radius = 10 + proximity * 20;
        const alpha = 0.3 + proximity * 0.4;

        canvasContext.beginPath();
        canvasContext.arc(x, y, radius, 0, Math.PI * 2);
        canvasContext.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
        canvasContext.lineWidth = 2;
        canvasContext.stroke();

        // Draw inner glow
        canvasContext.beginPath();
        canvasContext.arc(x, y, radius / 2, 0, Math.PI * 2);
        canvasContext.fillStyle = `rgba(0, 212, 255, ${alpha * 0.3})`;
        canvasContext.fill();
    }

    /**
     * Draw miss indicator
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    function drawMissIndicator(x, y) {
        if (!canvasContext) return;

        // Draw X mark
        canvasContext.strokeStyle = 'rgba(255, 68, 68, 0.5)';
        canvasContext.lineWidth = 2;

        const size = 10;
        canvasContext.beginPath();
        canvasContext.moveTo(x - size, y - size);
        canvasContext.lineTo(x + size, y + size);
        canvasContext.moveTo(x + size, y - size);
        canvasContext.lineTo(x - size, y + size);
        canvasContext.stroke();
    }

    // ============================================
    // UI Updates
    // ============================================

    /**
     * Show success screen with stats
     */
    function showSuccessScreen() {
        const successOverlay = Utils.getElement('success-overlay');
        if (!successOverlay) return;

        // Calculate stats
        const timeElapsed = gameTimer.getElapsed();
        const accuracy = calculateAccuracy();

        // Update stat displays
        const timeStat = Utils.getElement('time-stat');
        const movesStat = Utils.getElement('moves-stat');
        const accuracyStat = Utils.getElement('accuracy-stat');

        if (timeStat) timeStat.textContent = Utils.formatTime(timeElapsed);
        if (movesStat) movesStat.textContent = Utils.formatNumber(mouseMoveCount);
        if (accuracyStat) accuracyStat.textContent = Utils.formatPercent(accuracy, 1);

        // Show overlay with delay
        setTimeout(() => {
            Utils.addClass(successOverlay, 'active');
        }, CONFIG.timing.successDelay);
    }

    /**
     * Calculate accuracy score
     * @returns {number} Accuracy (0-1)
     */
    function calculateAccuracy() {
        if (clickCount === 0) return 0;

        // Simple accuracy: 1 / clicks (perfect = 1 click)
        const baseAccuracy = 1 / clickCount;

        // Bonus for speed (faster = better)
        const timeBonus = Math.max(0, 1 - (gameTimer.getElapsed() / 30000)); // 30s baseline

        // Combine (weighted)
        const accuracy = (baseAccuracy * 0.7) + (timeBonus * 0.3);

        return Utils.clamp(accuracy, 0, 1);
    }

    // ============================================
    // Event Binding
    // ============================================

    /**
     * Bind event listeners
     */
    function bindEvents() {
        // Mouse move (throttled)
        document.addEventListener('mousemove', throttledMouseMove);

        // Click on target
        if (targetElement) {
            targetElement.addEventListener('click', debouncedClick);
        }

        // Click anywhere (for miss detection)
        document.addEventListener('click', (event) => {
            if (event.target !== targetElement && isActive) {
                debouncedClick(event);
            }
        });

        Utils.log('info', 'Events bound');
    }

    /**
     * Unbind event listeners
     */
    function unbindEvents() {
        document.removeEventListener('mousemove', throttledMouseMove);

        if (targetElement) {
            targetElement.removeEventListener('click', debouncedClick);
        }

        Utils.log('info', 'Events unbound');
    }

    // ============================================
    // Control Methods
    // ============================================

    /**
     * Start interaction (begin exploring)
     */
    function start() {
        if (isActive) return;

        isActive = true;
        setState(CONFIG.game.states.EXPLORING);
        bindEvents();

        // Start audio pinging
        AudioEngine.startPinging(CONFIG.audio.minFrequency, 0);

        Utils.log('info', 'Interaction started');
    }

    /**
     * Stop interaction
     */
    function stop() {
        if (!isActive) return;

        isActive = false;
        unbindEvents();

        // Stop audio
        AudioEngine.stopPinging();

        Utils.log('info', 'Interaction stopped');
    }

    /**
     * Reset interaction system
     */
    function reset() {
        stop();
        setState(CONFIG.game.states.IDLE);

        mouseMoveCount = 0;
        clickCount = 0;
        gameTimer.reset();

        // Clear canvas
        if (canvasContext) {
            canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
        }

        Utils.log('info', 'Interaction reset');
    }

    // ============================================
    // Getters
    // ============================================

    /**
     * Get current mouse position
     * @returns {Object} {x, y}
     */
    function getMousePosition() {
        return { ...mousePosition };
    }

    /**
     * Get game statistics
     * @returns {Object} Stats object
     */
    function getStats() {
        return {
            timeElapsed: gameTimer.getElapsed(),
            mouseMoveCount,
            clickCount,
            accuracy: calculateAccuracy(),
            state: currentState
        };
    }

    /**
     * Check if interaction is active
     * @returns {boolean} True if active
     */
    function getIsActive() {
        return isActive;
    }

    // ============================================
    // Public API
    // ============================================

    return {
        init,
        start,
        stop,
        reset,
        setState,
        getState,
        getMousePosition,
        getStats,
        isActive: getIsActive
    };
})();

// ============================================
// Export
// ============================================

// Freeze public API
if (Object.freeze) {
    Object.freeze(InteractionSystem);
}
