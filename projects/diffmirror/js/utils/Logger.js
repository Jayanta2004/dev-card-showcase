/**
 * Logger.js
 * Specialized logging utility for DiffMirror.
 * Silences logs in production and provides formatted analytical output.
 */

export class Logger {
    static LEVELS = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3
    };

    static currentLevel = Logger.LEVELS.INFO;

    /**
     * Log a debug message.
     */
    static debug(context, message, ...args) {
        if (this.currentLevel <= this.LEVELS.DEBUG) {
            console.log(`%c[DEBUG:%SAME%]`, 'color: #888', context, message, ...args);
        }
    }

    /**
     * Log an info message.
     */
    static info(context, message, ...args) {
        if (this.currentLevel <= this.LEVELS.INFO) {
            console.log(`%c[INFO:%SAME%]`, 'color: #00aaff', context, message, ...args);
        }
    }

    /**
     * Log a warning message.
     */
    static warn(context, message, ...args) {
        if (this.currentLevel <= this.LEVELS.WARN) {
            console.warn(`[WARN:%SAME%]`, context, message, ...args);
        }
    }

    /**
     * Log an error message.
     */
    static error(context, message, ...args) {
        if (this.currentLevel <= this.LEVELS.ERROR) {
            console.error(`[ERROR:%SAME%]`, context, message, ...args);
        }
    }

    /**
     * Logs behavioral data in a structured format.
     */
    static behavioral(deltas) {
        if (this.currentLevel <= this.LEVELS.DEBUG) {
            console.groupCollapsed('DiffMirror Behavioral Metrics');
            console.table(deltas);
            console.groupEnd();
        }
    }

    /**
     * Sets the logging level.
     */
    static setLevel(level) {
        if (typeof level === 'number') {
            this.currentLevel = level;
        }
    }
}
