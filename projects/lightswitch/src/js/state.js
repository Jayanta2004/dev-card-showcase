/**
 * @file state.js
 * @description Centralized state management for the LightSwitch application.
 * 
 * DESIGN RATIONALE:
 * The application follows a strict unidirectional data flow. The 'State' is 
 * the single source of truth. By using a subscription model, we decouple 
 * the visual representation (UI) and the audio feedback from the core logic.
 * 
 * MODULE RESPONSIBILITIES:
 * 1. Maintain the 'isOn' boolean status.
 * 2. Manage a list of subscribers to notify on change.
 * 3. Enforce a transition lock to prevent interaction-spamming during animations.
 * 4. Maintain a history of interactions for debugging and potential future features.
 * 
 * @module StateManager
 */

/**
 * Helper class for internal logging to maintain consistency and meet code standards.
 */
class StateLogger {
    /**
     * @param {string} prefix - The message prefix for the console.
     */
    constructor(prefix = "[State]") {
        this.prefix = prefix;
        this.timestamp = () => new Date().toISOString();
    }

    /**
     * Logs an informational message.
     * @param {string} msg 
     * @param {any} data 
     */
    info(msg, data = "") {
        console.log(`${this.prefix} INFO [${this.timestamp()}]: ${msg}`, data);
    }

    /**
     * Logs a warning message.
     * @param {string} msg 
     */
    warn(msg) {
        console.warn(`${this.prefix} WARN [${this.timestamp()}]: ${msg}`);
    }

    /**
     * Logs an error message.
     * @param {string} msg 
     * @param {Error} err 
     */
    error(msg, err) {
        console.error(`${this.prefix} ERROR [${this.timestamp()}]: ${msg}`, err);
    }
}

/**
 * Manages the application-wide state.
 */
export class StateManager {
    /**
     * Creates an instance of StateManager.
     * @param {boolean} [initialState=false] - The initial toggle state (false = Dark, true = Bright).
     */
    constructor(initialState = false) {
        /** 
         * The core state variable.
         * @private
         * @type {boolean}
         */
        this._isOn = initialState;

        /**
         * List of functions to be executed when the state changes.
         * @private
         * @type {Array<Function>}
         */
        this._subscribers = [];

        /**
         * Flag to prevent overlapping transitions.
         * @private
         * @type {boolean}
         */
        this._isTransitioning = false;

        /**
         * History of state changes for auditing.
         * @private
         * @type {Array<object>}
         */
        this._history = [{
            state: this._isOn,
            timestamp: Date.now(),
            reason: "INITIAL_LOAD"
        }];

        /**
         * Internal logger instance.
         * @private
         */
        this._logger = new StateLogger("[StateManager]");

        this._logger.info("Initialized. Starting in mode:", this._isOn ? "BRIGHT" : "DARK");
    }

    /**
     * Getter for the current on/off state.
     * @returns {boolean} True if the switch is ON (Bright Mode).
     */
    get isOn() {
        return this._isOn;
    }

    /**
     * Getter to check if the app is currently in a transition phase.
     * @returns {boolean}
     */
    get isTransitioning() {
        return this._isTransitioning;
    }

    /**
     * Toggles the current state if no transition is active.
     * This is the primary entry point for state changes initiated by user interaction.
     * 
     * @returns {boolean} The newly updated state.
     */
    toggle() {
        // Anti-Spam Check: Ignore clicks if we are already animating.
        // This ensures the audio and visual feedback remain perfectly synced.
        if (this._isTransitioning) {
            this._logger.warn("Toggle intent ignored. An animation is currently in progress.");
            return this._isOn;
        }

        const previousState = this._isOn;
        this._isOn = !this._isOn;

        // Record the event in history
        this._recordHistory(this._isOn);

        // Notify all interested parties (Audio, Animation, etc.)
        this._logger.info(`Toggling state: ${previousState} -> ${this._isOn}`);
        this._notify();

        return this._isOn;
    }

    /**
     * Updates the transition lock status.
     * Generally called by the AnimationController when it finishes its visual work.
     * 
     * @param {boolean} status - True to lock interaction, false to unlock.
     */
    setTransitioning(status) {
        if (typeof status !== 'boolean') {
            this._logger.error("Invalid transition status provided. Expected boolean.", new Error("TypeMismatch"));
            return;
        }

        this._isTransitioning = status;
        this._logger.info(`Transition Lock: ${status ? "LOCKED" : "UNLOCKED"}`);
    }

    /**
     * Adds a new subscriber callback function.
     * Subscribers are called every time the state successfully toggles.
     * 
     * @param {Function} callback - Function that receives (isOn) as an argument.
     * @throws {Error} If the provided callback is not a function.
     */
    subscribe(callback) {
        if (typeof callback !== 'function') {
            const err = new Error("Subscriber must be a callable function.");
            this._logger.error("Subscription failed.", err);
            throw err;
        }

        this._subscribers.push(callback);
        this._logger.info(`New subscriber added. Total subscribers: ${this._subscribers.length}`);
    }

    /**
     * Returns a copy of the interaction history.
     * Useful for debugging or analytics.
     * 
     * @returns {Array<object>}
     */
    getHistory() {
        return [...this._history];
    }

    /**
     * Internal helper to record state changes.
     * @private
     * @param {boolean} newState 
     */
    _recordHistory(newState) {
        this._history.push({
            state: newState,
            timestamp: Date.now(),
            reason: "USER_TOGGLE"
        });

        // Keep history manageable: only keep last 10 interactions
        if (this._history.length > 10) {
            this._history.shift();
        }
    }

    /**
     * Iterates through all subscribers and executes their response logic.
     * Encapsulated in a try-catch to ensure one bad subscriber doesn't break the whole app.
     * 
     * @private
     */
    _notify() {
        this._subscribers.forEach((callback, index) => {
            try {
                callback(this._isOn);
            } catch (error) {
                this._logger.error(`Error executing subscriber at index ${index}:`, error);
            }
        });
    }
}

/**
 * Singleton instance for global access.
 * We export the instance directly to ensure every module shares the same state.
 */
export const appState = new StateManager(false);
