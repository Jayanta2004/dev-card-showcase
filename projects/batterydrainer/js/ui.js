/* ===================================
   BATTERY DRAINER - UI MODULE
   Handles UI updates, DOM manipulation, and user interactions
   =================================== */

/**
 * UI Manager
 * Manages all UI updates and DOM interactions
 */
class UIManager {
    constructor() {
        this.elements = {};
        this.previousState = null;
        this.warningShown = false;
    }

    /**
     * Initialize and cache DOM elements
     */
    init() {
        this.elements = {
            // Display elements
            batteryPercent: document.getElementById('batteryPercent'),
            batteryStatus: document.getElementById('batteryStatus'),
            batteryTime: document.getElementById('batteryTime'),
            emotionalState: document.getElementById('emotionalState'),
            emotionEmoji: document.getElementById('emotionEmoji'),
            emotionText: document.getElementById('emotionText'),
            
            // Container elements
            warningMessage: document.getElementById('warningMessage'),
            warningText: document.getElementById('warningText'),
            browserNotice: document.getElementById('browserNotice'),
            loadingScreen: document.getElementById('loadingScreen'),
            fallbackUI: document.getElementById('fallbackUI'),
            
            // Interactive elements
            startDemoButton: document.getElementById('startDemoButton')
        };

        console.log('UI Manager initialized');
    }

    /**
     * Update battery percentage display
     */
    updatePercentage(percentage) {
        if (this.elements.batteryPercent) {
            this.elements.batteryPercent.textContent = `${percentage}%`;
            
            // Add appropriate class for styling
            this.elements.batteryPercent.classList.remove('charging', 'low', 'critical');
            
            if (percentage <= 15) {
                this.elements.batteryPercent.classList.add('critical');
            } else if (percentage <= 30) {
                this.elements.batteryPercent.classList.add('low');
            }
        }
    }

    /**
     * Update battery status display
     */
    updateStatus(isCharging, isDemoMode = false) {
        if (this.elements.batteryStatus) {
            let statusText = isCharging ? 'Charging' : 'Discharging';
            
            if (isDemoMode) {
                statusText += ' (Demo)';
            }
            
            this.elements.batteryStatus.textContent = statusText;
            
            // Add charging class for styling
            if (isCharging) {
                this.elements.batteryStatus.classList.add('charging');
            } else {
                this.elements.batteryStatus.classList.remove('charging');
            }
        }
    }

    /**
     * Update time remaining display
     */
    updateTimeRemaining(timeString) {
        if (this.elements.batteryTime) {
            this.elements.batteryTime.textContent = timeString;
        }
    }

    /**
     * Update emotional state display
     */
    updateEmotionalState(emotionData) {
        if (this.elements.emotionalState) {
            this.elements.emotionalState.textContent = emotionData.label;
        }
        
        if (this.elements.emotionEmoji) {
            this.elements.emotionEmoji.textContent = emotionData.emoji;
        }
        
        if (this.elements.emotionText) {
            this.elements.emotionText.textContent = emotionData.label;
        }
    }

    /**
     * Show or hide warning message
     */
    updateWarning(shouldShow, percentage) {
        if (!this.elements.warningMessage) return;

        if (shouldShow && !this.warningShown) {
            this.elements.warningMessage.classList.remove('hidden');
            this.elements.warningMessage.classList.add('active');
            
            // Update warning text based on severity
            let warningText = 'Low Battery Warning';
            if (percentage <= 10) {
                warningText = 'Critical Battery Level!';
            } else if (percentage <= 20) {
                warningText = 'Battery Running Low!';
            }
            
            if (this.elements.warningText) {
                this.elements.warningText.textContent = warningText;
            }
            
            this.warningShown = true;
        } else if (!shouldShow && this.warningShown) {
            this.elements.warningMessage.classList.remove('active');
            this.elements.warningMessage.classList.add('hidden');
            this.warningShown = false;
        }
    }

    /**
     * Update entire UI based on battery state
     */
    updateUI(state, batteryManager) {
        const { percentage, isCharging, demoMode } = state;
        
        // Update percentage
        this.updatePercentage(percentage);
        
        // Update status
        this.updateStatus(isCharging, demoMode);
        
        // Update time remaining
        const timeRemaining = batteryManager.formatTimeRemaining();
        this.updateTimeRemaining(timeRemaining);
        
        // Get emotional state
        const emotionData = batteryManager.getEmotionalState();
        this.updateEmotionalState(emotionData);
        
        // Show warning if battery is low and not charging
        const shouldShowWarning = percentage <= 20 && !isCharging;
        this.updateWarning(shouldShowWarning, percentage);
        
        // Store current state
        this.previousState = state;
    }

    /**
     * Show loading screen
     */
    showLoading() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.remove('hidden');
        }
    }

    /**
     * Hide loading screen
     */
    hideLoading() {
        if (this.elements.loadingScreen) {
            setTimeout(() => {
                this.elements.loadingScreen.classList.add('hidden');
            }, 1000);
        }
    }

    /**
     * Show browser not supported notice
     */
    showBrowserNotice() {
        if (this.elements.browserNotice) {
            this.elements.browserNotice.classList.remove('hidden');
        }
    }

    /**
     * Hide browser notice
     */
    hideBrowserNotice() {
        if (this.elements.browserNotice) {
            this.elements.browserNotice.classList.add('hidden');
        }
    }

    /**
     * Show fallback UI
     */
    showFallbackUI() {
        if (this.elements.fallbackUI) {
            this.elements.fallbackUI.classList.remove('hidden');
        }
    }

    /**
     * Hide fallback UI
     */
    hideFallbackUI() {
        if (this.elements.fallbackUI) {
            this.elements.fallbackUI.classList.add('hidden');
        }
    }
}

/**
 * Application Controller
 * Main application logic and coordination
 */
class AppController {
    constructor() {
        this.batteryManager = null;
        this.animationController = null;
        this.uiManager = null;
        this.effectsManager = null;
        this.initialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing Battery Drainer Application...');
        
        // Show loading screen
        this.uiManager = new UIManager();
        this.uiManager.init();
        this.uiManager.showLoading();
        
        // Initialize animation controller
        this.animationController = new AnimationController();
        this.animationController.init();
        
        // Initialize effects manager
        this.effectsManager = new EffectsManager();
        
        // Initialize battery manager
        this.batteryManager = new BatteryStateManager();
        const batterySupported = await this.batteryManager.init();
        
        // Setup update handlers
        this.setupUpdateHandlers();
        
        // Handle battery API support
        if (!batterySupported) {
            this.handleUnsupportedBattery();
        } else {
            this.uiManager.hideBrowserNotice();
        }
        
        // Initial update
        this.updateAll();
        
        // Hide loading screen
        this.uiManager.hideLoading();
        
        this.initialized = true;
        console.log('Application initialized successfully');
    }

    /**
     * Setup battery state update handlers
     */
    setupUpdateHandlers() {
        // Listen for battery updates
        this.batteryManager.onUpdate((state) => {
            this.updateAll();
            
            // Special effects for critical battery
            if (state.percentage <= 10 && !state.isCharging) {
                this.effectsManager.screenShake(5, 300);
            }
        });
        
        // Listen for specific events
        this.batteryManager.addListener('chargingChange', (isCharging) => {
            if (isCharging) {
                this.effectsManager.flash('#4ade80', 300);
            }
        });
    }

    /**
     * Update all components
     */
    updateAll() {
        const state = this.batteryManager.getState();
        const emotionData = this.batteryManager.getEmotionalState();
        
        // Update UI
        this.uiManager.updateUI(state, this.batteryManager);
        
        // Update animations
        this.animationController.updateBatteryLevel(state.percentage);
        this.animationController.updateBatteryColor(state.percentage, state.isCharging);
        this.animationController.updateChargingIndicator(state.isCharging);
        this.animationController.updateEmotionalState(emotionData);
    }

    /**
     * Handle unsupported battery API
     */
    handleUnsupportedBattery() {
        this.uiManager.showBrowserNotice();
        this.uiManager.showFallbackUI();
        
        // Setup demo button
        const demoButton = this.uiManager.elements.startDemoButton;
        if (demoButton) {
            demoButton.addEventListener('click', () => {
                this.startDemo();
            });
        }
    }

    /**
     * Start demo mode
     */
    startDemo() {
        this.uiManager.hideFallbackUI();
        this.batteryManager.startDemo();
        this.effectsManager.flash('#3b82f6', 400);
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        if (this.batteryManager) {
            this.batteryManager.destroy();
        }
        
        if (this.animationController) {
            this.animationController.destroy();
        }
    }
}

/**
 * Utility functions
 */
const Utils = {
    /**
     * Format number with leading zeros
     */
    padZero(num, length = 2) {
        return String(num).padStart(length, '0');
    },
    
    /**
     * Clamp value between min and max
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    /**
     * Linear interpolation
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    },
    
    /**
     * Map value from one range to another
     */
    map(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    },
    
    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Random number between min and max
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    /**
     * Random integer between min and max
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    const app = new AppController();
    app.init();
    
    // Expose to window for debugging
    window.app = app;
    window.utils = Utils;
    
    // Handle page visibility for performance
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Pause animations when tab is hidden
            console.log('Tab hidden - pausing animations');
        } else {
            // Resume animations when tab is visible
            console.log('Tab visible - resuming animations');
            app.updateAll();
        }
    });
    
    // Handle errors globally
    window.addEventListener('error', (event) => {
        console.error('Application error:', event.error);
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
    });
});

// Export for use in other modules
window.UIManager = UIManager;
window.AppController = AppController;
window.Utils = Utils;
