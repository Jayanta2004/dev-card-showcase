import { Logger } from '../utils/Logger.js';

/**
 * @class EventManager
 * @description A robust Publish/Subscribe event system.
 * Decouples the AudioEngine from InputHandler and DrawingLogic.
 * Allows systems to react to events like 'STROKE_START', 'STROKE_CROSS', 'SPEED_CHANGE' without hard dependencies.
 */
export class EventManager {
    constructor() {
        this.listeners = new Map();
    }

    /**
     * @method on
     * @description Subscribe to an event.
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * @method off
     * @description Unsubscribe from an event.
     * @param {string} event - Event name
     * @param {Function} callback - Callback to remove
     */
    off(event, callback) {
        if (!this.listeners.has(event)) return;

        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);

        if (index !== -1) {
            callbacks.splice(index, 1);
        }
    }

    /**
     * @method emit
     * @description Publish an event to all subscribers.
     * @param {string} event - Event name
     * @param {any} payload - Data to pass to callbacks
     */
    emit(event, payload) {
        // Logger.debug(`Event Emitted: ${event}`, payload); // Verbose logging if needed

        if (!this.listeners.has(event)) return;

        const callbacks = this.listeners.get(event);
        callbacks.forEach(cb => {
            try {
                cb(payload);
            } catch (err) {
                Logger.error(`Error in event listener for ${event}:`, err);
            }
        });
    }

    /**
     * @method clear
     * @description Remove all listeners.
     */
    clear() {
        this.listeners.clear();
    }
}

// Global instance for singleton pattern usage if needed from App
export const globalEvents = new EventManager();
