/* ===================================
   BATTERY DRAINER - BATTERY API MODULE
   Handles Battery Status API integration and state management
   =================================== */

/**
 * Battery State Manager
 * Manages battery data, listeners, and state updates
 */
class BatteryStateManager {
    constructor() {
        this.battery = null;
        this.isCharging = false;
        this.level = 1.0; // 0.0 to 1.0
        this.chargingTime = 0;
        this.dischargingTime = 0;
        this.listeners = {
            levelChange: [],
            chargingChange: [],
            chargingTimeChange: [],
            dischargingTimeChange: []
        };
        this.demoMode = false;
        this.demoInterval = null;
        this.updateCallbacks = [];
    }

    /**
     * Initialize battery API connection
     */
    async init() {
        try {
            // Check if Battery Status API is supported
            if (!navigator.getBattery) {
                console.warn('Battery Status API not supported');
                this.enableDemoMode();
                return false;
            }

            // Get battery object
            this.battery = await navigator.getBattery();
            
            // Initialize state from battery
            this.updateStateFromBattery();
            
            // Attach event listeners
            this.attachBatteryListeners();
            
            console.log('Battery API initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing Battery API:', error);
            this.enableDemoMode();
            return false;
        }
    }

    /**
     * Update internal state from battery object
     */
    updateStateFromBattery() {
        if (!this.battery) return;

        this.level = this.battery.level;
        this.isCharging = this.battery.charging;
        this.chargingTime = this.battery.chargingTime;
        this.dischargingTime = this.battery.dischargingTime;
    }

    /**
     * Attach listeners to battery events
     */
    attachBatteryListeners() {
        if (!this.battery) return;

        // Level change listener
        this.battery.addEventListener('levelchange', () => {
            const oldLevel = this.level;
            this.level = this.battery.level;
            this.notifyListeners('levelChange', this.level, oldLevel);
            this.triggerUpdate();
        });

        // Charging status change listener
        this.battery.addEventListener('chargingchange', () => {
            const oldCharging = this.isCharging;
            this.isCharging = this.battery.charging;
            this.notifyListeners('chargingChange', this.isCharging, oldCharging);
            this.triggerUpdate();
        });

        // Charging time change listener
        this.battery.addEventListener('chargingtimechange', () => {
            this.chargingTime = this.battery.chargingTime;
            this.notifyListeners('chargingTimeChange', this.chargingTime);
            this.triggerUpdate();
        });

        // Discharging time change listener
        this.battery.addEventListener('dischargingtimechange', () => {
            this.dischargingTime = this.battery.dischargingTime;
            this.notifyListeners('dischargingTimeChange', this.dischargingTime);
            this.triggerUpdate();
        });
    }

    /**
     * Register a listener for specific event type
     */
    addListener(eventType, callback) {
        if (this.listeners[eventType]) {
            this.listeners[eventType].push(callback);
        }
    }

    /**
     * Notify all listeners of an event
     */
    notifyListeners(eventType, newValue, oldValue = null) {
        if (this.listeners[eventType]) {
            this.listeners[eventType].forEach(callback => {
                callback(newValue, oldValue);
            });
        }
    }

    /**
     * Register a global update callback
     */
    onUpdate(callback) {
        this.updateCallbacks.push(callback);
    }

    /**
     * Trigger all update callbacks
     */
    triggerUpdate() {
        const state = this.getState();
        this.updateCallbacks.forEach(callback => callback(state));
    }

    /**
     * Get current battery state
     */
    getState() {
        return {
            level: this.level,
            percentage: Math.round(this.level * 100),
            isCharging: this.isCharging,
            chargingTime: this.chargingTime,
            dischargingTime: this.dischargingTime,
            demoMode: this.demoMode
        };
    }

    /**
     * Get emotional state based on battery level
     */
    getEmotionalState() {
        const percentage = this.level * 100;
        
        if (this.isCharging) {
            return {
                emotion: 'charging',
                label: 'Charging Up!',
                emoji: '⚡',
                color: '#4ade80'
            };
        }
        
        if (percentage > 75) {
            return {
                emotion: 'happy',
                label: 'Feeling Great!',
                emoji: '😊',
                color: '#3b82f6'
            };
        } else if (percentage > 50) {
            return {
                emotion: 'content',
                label: 'Doing Fine',
                emoji: '🙂',
                color: '#3b82f6'
            };
        } else if (percentage > 30) {
            return {
                emotion: 'worried',
                label: 'Getting Low...',
                emoji: '😟',
                color: '#f59e0b'
            };
        } else if (percentage > 15) {
            return {
                emotion: 'sad',
                label: 'Need Power Soon',
                emoji: '😢',
                color: '#ef4444'
            };
        } else {
            return {
                emotion: 'critical',
                label: 'Almost Empty!',
                emoji: '😱',
                color: '#991b1b'
            };
        }
    }

    /**
     * Format time remaining
     */
    formatTimeRemaining() {
        let seconds = this.isCharging ? this.chargingTime : this.dischargingTime;
        
        // Handle infinity or invalid values
        if (!isFinite(seconds) || seconds <= 0) {
            return 'Calculating...';
        }

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes} minutes`;
        } else {
            return 'Less than 1 min';
        }
    }

    /**
     * Enable demo mode (fallback when API not available)
     */
    enableDemoMode() {
        this.demoMode = true;
        this.level = 1.0; // Start at 100%
        this.isCharging = false;
        
        console.log('Demo mode enabled');
        
        // Don't auto-start demo, wait for user interaction
    }

    /**
     * Start demo drain simulation
     */
    startDemo() {
        if (!this.demoMode) return;

        // Clear any existing demo interval
        if (this.demoInterval) {
            clearInterval(this.demoInterval);
        }

        // Reset to full
        this.level = 1.0;
        this.isCharging = false;
        this.triggerUpdate();

        // Simulate battery drain
        this.demoInterval = setInterval(() => {
            // Decrease by 1% every 500ms
            this.level = Math.max(0, this.level - 0.01);
            
            // Randomly toggle charging when battery gets low
            if (this.level <= 0.2 && Math.random() > 0.7) {
                this.isCharging = true;
            }
            
            // If charging, increase battery
            if (this.isCharging && this.level < 1.0) {
                this.level = Math.min(1.0, this.level + 0.02);
                
                // Stop charging when full
                if (this.level >= 1.0) {
                    this.isCharging = false;
                }
            }
            
            // Update listeners
            this.notifyListeners('levelChange', this.level);
            if (this.isCharging) {
                this.notifyListeners('chargingChange', this.isCharging);
            }
            
            this.triggerUpdate();
            
            // Reset when battery fully depleted
            if (this.level <= 0 && !this.isCharging) {
                setTimeout(() => {
                    this.level = 1.0;
                    this.triggerUpdate();
                }, 2000);
            }
        }, 500);
    }

    /**
     * Stop demo simulation
     */
    stopDemo() {
        if (this.demoInterval) {
            clearInterval(this.demoInterval);
            this.demoInterval = null;
        }
    }

    /**
     * Cleanup and remove listeners
     */
    destroy() {
        this.stopDemo();
        
        if (this.battery) {
            // Remove all event listeners (if needed)
            // Note: Battery API doesn't provide removeEventListener reference
            this.battery = null;
        }
        
        this.listeners = {
            levelChange: [],
            chargingChange: [],
            chargingTimeChange: [],
            dischargingTimeChange: []
        };
        
        this.updateCallbacks = [];
    }
}

/**
 * Battery data validator
 */
class BatteryValidator {
    /**
     * Validate battery level (0.0 to 1.0)
     */
    static validateLevel(level) {
        return typeof level === 'number' && level >= 0 && level <= 1;
    }

    /**
     * Validate charging state
     */
    static validateCharging(charging) {
        return typeof charging === 'boolean';
    }

    /**
     * Validate time values
     */
    static validateTime(time) {
        return typeof time === 'number' && (time >= 0 || !isFinite(time));
    }

    /**
     * Validate complete battery state
     */
    static validateState(state) {
        return (
            this.validateLevel(state.level) &&
            this.validateCharging(state.isCharging) &&
            this.validateTime(state.chargingTime) &&
            this.validateTime(state.dischargingTime)
        );
    }
}

/**
 * Battery event logger for debugging
 */
class BatteryLogger {
    constructor(enabled = false) {
        this.enabled = enabled;
        this.logs = [];
        this.maxLogs = 100;
    }

    log(event, data) {
        if (!this.enabled) return;

        const logEntry = {
            timestamp: new Date().toISOString(),
            event,
            data
        };

        this.logs.push(logEntry);
        
        // Keep only last maxLogs entries
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        console.log(`[Battery] ${event}:`, data);
    }

    getLogs() {
        return [...this.logs];
    }

    clearLogs() {
        this.logs = [];
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }
}

// Export for use in other modules
window.BatteryStateManager = BatteryStateManager;
window.BatteryValidator = BatteryValidator;
window.BatteryLogger = BatteryLogger;
