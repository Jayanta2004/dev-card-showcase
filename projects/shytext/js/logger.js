/**
 * logger.js
 * 
 * A robust logging and telemetry module for the ShyText engine.
 * Provides formatted console output, performance tracking, 
 * and state snapshots for debugging purposes.
 * 
 * @module Telemetry
 */

import { CONFIG } from './config.js';

/**
 * Log Levels
 */
const LEVELS = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    SYSTEM: 'SYSTEM',
    TRACE: 'TRACE'
};

/**
 * Styling for Console Logs
 */
const STYLES = {
    [LEVELS.INFO]: 'color: #3b82f6; font-weight: bold;',
    [LEVELS.WARN]: 'color: #fbbf24; font-weight: bold;',
    [LEVELS.ERROR]: 'color: #ef4444; font-weight: bold; background: #fee2e2;',
    [LEVELS.SYSTEM]: 'color: #8b5cf6; font-weight: bold; border-left: 3px solid #8b5cf6; padding-left: 5px;',
    [LEVELS.TRACE]: 'color: #94a3b8; font-style: italic;'
};

class ShyLogger {
    constructor() {
        this.buffer = [];
        this.maxBufferSize = 100;
        this.startTime = performance.now();
        this.isEnabled = CONFIG.DEBUG;
    }

    /**
     * Internal formatting helper.
     */
    _format(level, message, data) {
        const timestamp = ((performance.now() - this.startTime) / 1000).toFixed(3);
        const prefix = `[ShyText:${level} @ ${timestamp}s]`;

        if (this.isEnabled || level === LEVELS.ERROR || level === LEVELS.SYSTEM) {
            if (data) {
                console.groupCollapsed(`%c${prefix} ${message}`, STYLES[level]);
                console.dir(data);
                console.groupEnd();
            } else {
                console.log(`%c${prefix} ${message}`, STYLES[level]);
            }
        }

        // Buffer the log for later export if needed
        this._bufferLog({ level, message, data, timestamp });
    }

    _bufferLog(entry) {
        this.buffer.push(entry);
        if (this.buffer.length > this.maxBufferSize) {
            this.buffer.shift();
        }
    }

    /**
     * Public Logging Methods
     */

    info(msg, data) { this._format(LEVELS.INFO, msg, data); }
    warn(msg, data) { this._format(LEVELS.WARN, msg, data); }
    error(msg, data) { this._format(LEVELS.ERROR, msg, data); }
    system(msg, data) { this._format(LEVELS.SYSTEM, msg, data); }
    trace(msg, data) { if (CONFIG.DEBUG) this._format(LEVELS.TRACE, msg, data); }

    /**
     * Performance Tracking
     */

    startTimer(label) {
        if (!this.isEnabled) return;
        console.time(`ShyTimer:${label}`);
    }

    endTimer(label) {
        if (!this.isEnabled) return;
        console.timeEnd(`ShyTimer:${label}`);
    }

    /**
     * State Snapshot
     */
    snapshot(state) {
        if (!this.isEnabled) return;
        this.system('Current Engine State Snapshot', state);
    }

    /**
     * Export Logs
     * Useful for remote debugging.
     */
    export() {
        return JSON.stringify(this.buffer, null, 2);
    }
}

// Export singleton instance
export const Logger = new ShyLogger();

/**
 * TECHNICAL NOTE: Logging Overhead
 * 
 * High-frequency logging in a 60fps interaction loop can cause 
 * "Console Bloat", leading to memory leaks and dropped frames.
 * The ShyLogger mitigates this by:
 * 1. Defaulting to disabled state in production.
 * 2. Using groupCollapsed for heavy data objects.
 * 3. Throttling repetitive trace logs (to be implemented if needed).
 * 4. Buffering instead of immediate printing for high-volume data.
 */
