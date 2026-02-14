// ============================================
// GAME-STATE.JS
// Game state management and orchestration
// ============================================

/**
 * GameState Module
 * Main game controller that coordinates all modules
 */
const GameState = (function () {
    'use strict';

    // Game states
    const STATES = {
        IDLE: 'idle',
        PLAYING: 'playing',
        WON: 'won',
        PAUSED: 'paused'
    };

    // Private variables
    let currentState = STATES.IDLE;
    let targetPosition = { x: 0, y: 0 };
    let targetElement = null;
    let appContainer = null;
    let stateIndicator = null;
    let successOverlay = null;
    let hintPanel = null;
    let controlPanel = null;
    let updateLoopId = null;
    let gameStartTime = 0;
    let winThreshold = 25; // pixels
    let debugMode = false;
    let hintsEnabled = true;
    let hintTimeout = null;

    // Statistics
    let stats = {
        attempts: 0,
        timeElapsed: 0,
        closestDistance: Infinity
    };

    /**
     * Initialize the game
     */
    function init() {
        // Get DOM elements
        targetElement = document.getElementById('target');
        appContainer = document.getElementById('app-container');
        stateIndicator = document.getElementById('state-indicator');
        successOverlay = document.getElementById('success-overlay');
        hintPanel = document.getElementById('hint-panel');
        controlPanel = document.getElementById('control-panel');

        if (!targetElement || !appContainer) {
            console.error('Required DOM elements not found');
            return false;
        }

        // Initialize modules
        if (!DistanceCalculator.init()) {
            console.error('Failed to initialize DistanceCalculator');
            return false;
        }

        if (!AudioEngine.init()) {
            console.error('Failed to initialize AudioEngine');
            return false;
        }

        if (!HeatMap.init()) {
            console.error('Failed to initialize HeatMap');
            return false;
        }

        if (!CursorTracker.init()) {
            console.error('Failed to initialize CursorTracker');
            return false;
        }

        // Set up event listeners
        setupEventListeners();
        setupControlListeners();

        // Position target randomly
        positionTarget();

        // Auto-hide hint after 5 seconds
        scheduleHintHide();

        // Start the game
        startGame();

        return true;
    }

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Click to check if target found
        document.addEventListener('click', handleClick);

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyDown);

        // Visibility change (pause when tab hidden)
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Window focus/blur
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
    }

    /**
     * Set up control button listeners
     */
    function setupControlListeners() {
        const hintToggle = document.getElementById('hint-toggle');
        const soundToggle = document.getElementById('sound-toggle');
        const heatmapToggle = document.getElementById('heatmap-toggle');

        if (hintToggle) {
            hintToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleHints();
            });
        }

        if (soundToggle) {
            soundToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleSound();
            });
        }

        if (heatmapToggle) {
            heatmapToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleHeatMap();
            });
        }
    }

    /**
     * Schedule hint panel to hide
     */
    function scheduleHintHide() {
        if (hintTimeout) {
            clearTimeout(hintTimeout);
        }
        hintTimeout = setTimeout(() => {
            if (hintsEnabled && hintPanel) {
                hintPanel.classList.add('hidden');
            }
        }, 5000);
    }

    /**
     * Toggle hints
     */
    function toggleHints() {
        hintsEnabled = !hintsEnabled;
        const hintToggle = document.getElementById('hint-toggle');

        if (hintPanel) {
            if (hintsEnabled) {
                hintPanel.classList.remove('hidden');
                scheduleHintHide();
            } else {
                hintPanel.classList.add('hidden');
            }
        }

        if (hintToggle) {
            if (hintsEnabled) {
                hintToggle.classList.add('active');
            } else {
                hintToggle.classList.remove('active');
            }
        }
    }

    /**
     * Toggle sound
     */
    function toggleSound() {
        const soundToggle = document.getElementById('sound-toggle');
        const isMuted = AudioEngine.isMuted();

        if (isMuted) {
            AudioEngine.unmute();
            if (soundToggle) {
                soundToggle.querySelector('.btn-icon').textContent = '🔊';
                soundToggle.classList.add('active');
            }
        } else {
            AudioEngine.mute();
            if (soundToggle) {
                soundToggle.querySelector('.btn-icon').textContent = '🔇';
                soundToggle.classList.remove('active');
            }
        }
    }

    /**
     * Toggle heat map
     */
    function toggleHeatMap() {
        const heatmapToggle = document.getElementById('heatmap-toggle');
        const isEnabled = HeatMap.toggle();

        if (heatmapToggle) {
            if (isEnabled) {
                heatmapToggle.classList.add('active');
            } else {
                heatmapToggle.classList.remove('active');
            }
        }
    }

    /**
     * Position target at random location
     */
    function positionTarget() {
        const margin = 100; // Keep away from edges
        targetPosition = DistanceCalculator.getRandomPoint(margin);

        if (targetElement) {
            targetElement.style.left = targetPosition.x + 'px';
            targetElement.style.top = targetPosition.y + 'px';
        }

        // Update heat map target
        HeatMap.setTarget(targetPosition);
    }

    /**
     * Start the game
     */
    function startGame() {
        if (currentState === STATES.PLAYING) return;

        currentState = STATES.PLAYING;
        gameStartTime = performance.now();
        stats.attempts++;

        // Start audio
        AudioEngine.startPingLoop(440, 1000);

        // Start update loop
        startUpdateLoop();

        // Update UI
        updateStateIndicator('Listening...');
    }

    /**
     * Main update loop
     */
    function updateLoop() {
        if (currentState !== STATES.PLAYING) return;

        // Get cursor position
        const cursorPos = CursorTracker.getCursorPosition();

        // Calculate distance to target
        const distanceData = DistanceCalculator.getDistance(cursorPos, targetPosition);

        // Update closest distance stat
        if (distanceData.raw < stats.closestDistance) {
            stats.closestDistance = distanceData.raw;
        }

        // Get proximity zone
        const proximityZone = DistanceCalculator.getProximityZone(distanceData.normalized);

        // Update audio based on distance
        const frequency = DistanceCalculator.distanceToFrequency(distanceData.normalized);
        const interval = DistanceCalculator.distanceToInterval(distanceData.normalized);
        AudioEngine.updatePing(frequency, interval);

        // Update trail color based on proximity
        CursorTracker.setTrailColor(proximityZone);

        // Update visual state
        updateProximityState(proximityZone);

        // Update state indicator (if debug mode)
        if (debugMode) {
            updateStateIndicator(
                `Distance: ${Math.round(distanceData.raw)}px | ` +
                `Zone: ${proximityZone} | ` +
                `Freq: ${Math.round(frequency)}Hz | ` +
                `Interval: ${Math.round(interval)}ms`
            );
        }

        // Check win condition
        if (DistanceCalculator.isWithinThreshold(distanceData.raw, winThreshold)) {
            checkWinCondition(cursorPos);
        }

        // Update time elapsed
        stats.timeElapsed = performance.now() - gameStartTime;

        // Continue loop
        updateLoopId = requestAnimationFrame(updateLoop);
    }

    /**
     * Start update loop
     */
    function startUpdateLoop() {
        if (!updateLoopId) {
            updateLoop();
        }
    }

    /**
     * Stop update loop
     */
    function stopUpdateLoop() {
        if (updateLoopId) {
            cancelAnimationFrame(updateLoopId);
            updateLoopId = null;
        }
    }

    /**
     * Update proximity state visuals
     * @param {string} zone - Proximity zone
     */
    function updateProximityState(zone) {
        if (!appContainer) return;

        // Remove all proximity classes
        appContainer.classList.remove(
            'proximity-far',
            'proximity-medium',
            'proximity-close',
            'proximity-very-close'
        );

        // Add current proximity class
        appContainer.classList.add('proximity-' + zone);
    }

    /**
     * Check win condition
     * @param {Object} cursorPos - Cursor position
     */
    function checkWinCondition(cursorPos) {
        // Verify cursor is really close to target center
        const distanceToCenter = DistanceCalculator.getDistance(
            cursorPos,
            targetPosition
        );

        if (distanceToCenter.raw <= winThreshold) {
            // Small delay to let user feel the proximity
            setTimeout(() => {
                if (currentState === STATES.PLAYING) {
                    winGame();
                }
            }, 200);
        }
    }

    /**
     * Handle click event
     * @param {MouseEvent} event - Click event
     */
    function handleClick(event) {
        if (currentState !== STATES.PLAYING) {
            if (currentState === STATES.WON) {
                resetGame();
            }
            return;
        }

        // Play click sound
        AudioEngine.playClickSound();

        // Check if clicked near target
        const clickPos = { x: event.clientX, y: event.clientY };
        const distance = DistanceCalculator.getDistance(clickPos, targetPosition);

        if (distance.raw <= winThreshold) {
            winGame();
        }
    }

    /**
     * Win the game
     */
    function winGame() {
        if (currentState === STATES.WON) return;

        currentState = STATES.WON;

        // Stop update loop
        stopUpdateLoop();

        // Play success sound
        AudioEngine.playSuccessChord();

        // Create success visual effects
        CursorTracker.createSuccessTrail();

        // Show target
        if (targetElement) {
            targetElement.classList.add('active');
        }

        // Flash screen
        if (appContainer) {
            appContainer.classList.add('flash-success');
            setTimeout(() => {
                appContainer.classList.remove('flash-success');
            }, 500);
        }

        // Show success overlay
        if (successOverlay) {
            successOverlay.classList.remove('hidden');
            setTimeout(() => {
                successOverlay.classList.add('active');
            }, 50);
        }

        // Update state indicator
        updateStateIndicator(
            `Found! Time: ${(stats.timeElapsed / 1000).toFixed(2)}s | ` +
            `Click to play again`
        );

        // Log stats
        console.log('Game Won!', {
            timeElapsed: stats.timeElapsed,
            attempts: stats.attempts,
            closestDistance: stats.closestDistance
        });
    }

    /**
     * Reset game for new round
     */
    function resetGame() {
        // Reset state
        currentState = STATES.IDLE;

        // Hide success overlay
        if (successOverlay) {
            successOverlay.classList.remove('active');
            setTimeout(() => {
                successOverlay.classList.add('hidden');
            }, 500);
        }

        // Hide target
        if (targetElement) {
            targetElement.classList.remove('active');
        }

        // Clear trails
        CursorTracker.clearTrails();

        // Reset stats
        stats.closestDistance = Infinity;

        // Position new target
        positionTarget();

        // Start new game
        setTimeout(() => {
            startGame();
        }, 600);
    }

    /**
     * Pause game
     */
    function pauseGame() {
        if (currentState !== STATES.PLAYING) return;

        currentState = STATES.PAUSED;
        stopUpdateLoop();
        AudioEngine.pause();
        updateStateIndicator('Paused');
    }

    /**
     * Resume game
     */
    function resumeGame() {
        if (currentState !== STATES.PAUSED) return;

        currentState = STATES.PLAYING;
        startUpdateLoop();
        AudioEngine.resume();
        updateStateIndicator('Listening...');
    }

    /**
     * Update state indicator text
     * @param {string} text - Text to display
     */
    function updateStateIndicator(text) {
        if (stateIndicator) {
            stateIndicator.textContent = text;
        }
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} event - Keyboard event
     */
    function handleKeyDown(event) {
        switch (event.key) {
            case 'Escape':
                if (currentState === STATES.PLAYING) {
                    pauseGame();
                } else if (currentState === STATES.PAUSED) {
                    resumeGame();
                }
                break;

            case 'r':
            case 'R':
                if (currentState === STATES.WON || currentState === STATES.PAUSED) {
                    resetGame();
                }
                break;

            case 'd':
            case 'D':
                toggleDebugMode();
                break;

            case 'm':
            case 'M':
                toggleMute();
                break;
        }
    }

    /**
     * Toggle debug mode
     */
    function toggleDebugMode() {
        debugMode = !debugMode;

        if (appContainer) {
            if (debugMode) {
                appContainer.classList.add('debug-mode');
            } else {
                appContainer.classList.remove('debug-mode');
            }
        }

        console.log('Debug mode:', debugMode ? 'ON' : 'OFF');
    }

    /**
     * Toggle mute
     */
    function toggleMute() {
        const currentVolume = AudioEngine.getVolume();

        if (currentVolume > 0) {
            AudioEngine.mute();
            updateStateIndicator('Muted');
        } else {
            AudioEngine.unmute();
            updateStateIndicator('Unmuted');
        }
    }

    /**
     * Handle visibility change (tab hidden/shown)
     */
    function handleVisibilityChange() {
        if (document.hidden) {
            if (currentState === STATES.PLAYING) {
                pauseGame();
            }
        }
    }

    /**
     * Handle window blur
     */
    function handleBlur() {
        if (currentState === STATES.PLAYING) {
            pauseGame();
        }
    }

    /**
     * Handle window focus
     */
    function handleFocus() {
        if (currentState === STATES.PAUSED) {
            resumeGame();
        }
    }

    /**
     * Get current game state
     * @returns {string} Current state
     */
    function getState() {
        return currentState;
    }

    /**
     * Get game statistics
     * @returns {Object} Game stats
     */
    function getStats() {
        return { ...stats };
    }

    /**
     * Get target position (for debugging)
     * @returns {Object} Target position
     */
    function getTargetPosition() {
        return { ...targetPosition };
    }

    /**
     * Set win threshold
     * @param {number} threshold - New threshold in pixels
     */
    function setWinThreshold(threshold) {
        winThreshold = Math.max(10, Math.min(100, threshold));
    }

    /**
     * Get win threshold
     * @returns {number} Current threshold
     */
    function getWinThreshold() {
        return winThreshold;
    }

    /**
     * Destroy game and cleanup
     */
    function destroy() {
        stopUpdateLoop();

        AudioEngine.destroy();
        CursorTracker.destroy();
        HeatMap.destroy();

        if (hintTimeout) {
            clearTimeout(hintTimeout);
        }

        document.removeEventListener('click', handleClick);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleBlur);
        window.removeEventListener('focus', handleFocus);

        currentState = STATES.IDLE;
    }

    // Public API
    return {
        init: init,
        startGame: startGame,
        resetGame: resetGame,
        pauseGame: pauseGame,
        resumeGame: resumeGame,
        getState: getState,
        getStats: getStats,
        getTargetPosition: getTargetPosition,
        setWinThreshold: setWinThreshold,
        getWinThreshold: getWinThreshold,
        toggleDebugMode: toggleDebugMode,
        toggleMute: toggleMute,
        destroy: destroy
    };
})();

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        GameState.init();
    });
} else {
    GameState.init();
}
