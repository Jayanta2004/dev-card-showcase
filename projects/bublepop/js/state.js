/**
 * BubblePop - State Management System
 * 
 * @file state.js
 * @description Centralized state management for the BubblePop experience.
 * Implements a Pub/Sub (Observer) pattern to ensure UI components sync
 * with the underlying data model. Handles persistence via localStorage.
 * 
 * @author Antigravity
 * @version 1.0.0
 */

/**
 * @typedef {Object} AppData
 * @property {number} totalPops - Lifecycle total pops across all sessions.
 * @property {boolean} isAudioEnabled - User preference for sound effects.
 * @property {boolean} hapticEnabled - User preference for vibration feedback.
 * @property {number} sessionPops - Pops registered in the current active session.
 * @property {string} currentTheme - Active visual theme (e.g., 'light', 'dark', 'pastel').
 */

class ApplicationState {
    /**
     * Initializes the state management system.
     */
    constructor() {
        /** @private @const {string} */
        this.STORAGE_KEY = 'bubble-pop-v1-data';

        /** 
         * The core reactive data object.
         * @type {AppData} 
         */
        this.data = {
            totalPops: 0,
            isAudioEnabled: false,
            hapticEnabled: true,
            sessionPops: 0,
            currentTheme: 'classic'
        };

        /** 
         * Array of subscriber functions.
         * @type {Array<Function>} 
         * @private
         */
        this.listeners = [];

        // Load persisted data on instantiation
        this.load();

        console.log('State: Initialized with', this.data.totalPops, 'previous pops.');
    }

    /**
     * Retrieves stored data from the browser's localStorage.
     * Safely handles parsing errors and missing keys.
     * 
     * @returns {void}
     */
    load() {
        try {
            const rawData = localStorage.getItem(this.STORAGE_KEY);
            if (rawData) {
                const parsed = JSON.parse(rawData);

                // Merge loaded data into default state
                this.data = {
                    ...this.data,
                    totalPops: parsed.totalPops || 0,
                    hapticEnabled: parsed.hapticEnabled ?? true,
                    currentTheme: parsed.currentTheme || 'classic'
                };
            }
        } catch (error) {
            console.error('State: Critical failure loading data from storage:', error);
            // Fallback to defaults already set in constructor
        }
    }

    /**
     * Serializes and persists critical state data to localStorage.
     * 
     * @returns {boolean} True if save was successful.
     */
    save() {
        try {
            const payload = {
                totalPops: this.data.totalPops,
                hapticEnabled: this.data.hapticEnabled,
                currentTheme: this.data.currentTheme
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
            return true;
        } catch (error) {
            console.warn('State: Failed to persist data:', error);
            return false;
        }
    }

    /**
     * Registers a new pop event.
     * Increments counters, triggers notifications, and auto-saves periodically.
     * 
     * @returns {number} The new total pop count.
     */
    registerPop() {
        this.data.totalPops++;
        this.data.sessionPops++;

        // Notify subscribers of the update
        this.notify('pop', this.data.totalPops);

        // Throttled persistence (save every 5 pops to reduce disk I/O)
        if (this.data.totalPops % 5 === 0) {
            this.save();
        }

        return this.data.totalPops;
    }

    /**
     * Toggles the audio engine state.
     * 
     * @param {boolean|null} [forceState=null] - Optional specific boolean to set.
     * @returns {boolean} The new audio state.
     */
    toggleAudio(forceState = null) {
        const newState = forceState !== null ? forceState : !this.data.isAudioEnabled;
        this.data.isAudioEnabled = newState;

        this.notify('audio', newState);
        return newState;
    }

    /**
     * Switches the visual theme of the application.
     * 
     * @param {string} themeName - Name of the theme to apply.
     */
    setTheme(themeName) {
        this.data.currentTheme = themeName;
        this.notify('theme', themeName);
        this.save();
    }

    /**
     * Registers a listener callback for state changes.
     * 
     * @param {Function} callback - Function to invoke on changes.
     */
    subscribe(callback) {
        if (typeof callback !== 'function') {
            console.error('State: Subscriber must be a function.');
            return;
        }
        this.listeners.push(callback);
    }

    /**
     * Dispatches notifications to all active subscribers.
     * 
     * @param {string} eventType - The type of event (e.g., 'pop', 'audio').
     * @param {any} payload - The data associated with the event.
     * @private
     */
    notify(eventType, payload) {
        this.listeners.forEach(callback => {
            try {
                callback(eventType, payload);
            } catch (error) {
                console.error('State: Notification error in subscriber:', error);
            }
        });
    }

    /**
     * @returns {number} The total cumulative pops.
     */
    get totalPops() {
        return this.data.totalPops;
    }

    /**
     * @returns {boolean} Current audio status.
     */
    get isAudioEnabled() {
        return this.data.isAudioEnabled;
    }
}

/**
 * Singleton instance of the ApplicationState.
 * @export
 */
export const State = new ApplicationState();
