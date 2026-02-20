import { MathUtils } from '../utils/math-utils.js';

/**
 * InputTracker
 * Captures high-frequency user input data (mouse movements, keystrokes).
 * Buffers data for analysis by the EntropyEngine.
 * 
 * @class
 */
export class InputTracker {
    constructor() {
        this.historySize = 1000; // Keep last N points
        this.mouseHistory = []; // {x, y, t}
        this.keyHistory = []; // {key, t}
        this.isTracking = false;

        this.currentPos = { x: 0, y: 0 };
        this.lastPos = { x: 0, y: 0 };

        this.listeners = {
            mousemove: this.handleMouseMove.bind(this),
            keydown: this.handleKeyDown.bind(this)
        };
    }

    /**
     * Starts event listeners.
     */
    start() {
        if (this.isTracking) return;

        document.addEventListener('mousemove', this.listeners.mousemove);
        document.addEventListener('keydown', this.listeners.keydown);
        this.isTracking = true;
        console.log('[System] Input tracking started.');
    }

    /**
     * Stops event listeners.
     */
    stop() {
        if (!this.isTracking) return;

        document.removeEventListener('mousemove', this.listeners.mousemove);
        document.removeEventListener('keydown', this.listeners.keydown);
        this.isTracking = false;
        console.log('[System] Input tracking paused.');
    }

    /**
     * Clears all history.
     */
    reset() {
        this.mouseHistory = [];
        this.keyHistory = [];
        console.log('[System] Input history cleared.');
    }

    /**
     * Handles mouse move events.
     * Throttled by requestAnimationFrame via polling in main loop usually, 
     * but here we capture raw events for precision pattern matching.
     * @param {MouseEvent} e 
     */
    handleMouseMove(e) {
        const now = performance.now();
        const newPos = { x: e.clientX, y: e.clientY, t: now };

        // Calculate instantaneous velocity if we have a previous point
        if (this.mouseHistory.length > 0) {
            const last = this.mouseHistory[this.mouseHistory.length - 1];
            const dist = MathUtils.distance(last, newPos);
            const dt = now - last.t;

            // Filter crazy outliers (e.g., context switch lags)
            if (dt > 0 && dt < 500) {
                newPos.velocity = dist / dt;
                newPos.angle = Math.atan2(newPos.y - last.y, newPos.x - last.x);
            } else {
                newPos.velocity = 0;
                newPos.angle = 0;
            }
        } else {
            newPos.velocity = 0;
            newPos.angle = 0;
        }

        this.mouseHistory.push(newPos);
        if (this.mouseHistory.length > this.historySize) {
            this.mouseHistory.shift();
        }

        this.currentPos = { x: newPos.x, y: newPos.y };
    }

    /**
     * Handles keyboard events.
     * @param {KeyboardEvent} e 
     */
    handleKeyDown(e) {
        // Ignore modifier keys alone for entropy purposes? 
        // Or count them as they are part of behavior.
        // We'll track everything.
        const now = performance.now();

        // Calculate interval from last key
        let interval = 0;
        if (this.keyHistory.length > 0) {
            interval = now - this.keyHistory[this.keyHistory.length - 1].t;
        }

        this.keyHistory.push({
            key: e.key,
            code: e.code,
            t: now,
            interval: interval
        });

        if (this.keyHistory.length > this.historySize) {
            this.keyHistory.shift();
        }
    }

    /**
     * Returns the latest mouse data points.
     * @param {number} count 
     * @returns {Array}
     */
    getRecentMouseData(count = 50) {
        return this.mouseHistory.slice(-count);
    }

    /**
     * Returns the huge buffer for complex analysis.
     */
    getFullMouseHistory() {
        return this.mouseHistory;
    }

    /**
     * Returns recent keystrokes.
     * @param {number} count 
     */
    getRecentKeyData(count = 20) {
        return this.keyHistory.slice(-count);
    }
}
