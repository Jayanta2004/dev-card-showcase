/**
 * @class Logger
 * @description Centralized logging utility for BlindPainter.
 * Allows filtering logs by severity level to keep the console clean in production.
 */
export class Logger {
    static LEVEL = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        NONE: 4
    };

    static currentLevel = Logger.LEVEL.INFO;

    /**
     * @static
     * @method setLevel
     * @param {number} level - One of Logger.LEVEL constants
     */
    static setLevel(level) {
        Logger.currentLevel = level;
    }

    /**
     * @static
     * @method debug
     * @param {string} message 
     * @param  {...any} args 
     */
    static debug(message, ...args) {
        if (Logger.currentLevel <= Logger.LEVEL.DEBUG) {
            console.debug(`[DEBUG] ${Logger._timestamp()}: ${message}`, ...args);
        }
    }

    /**
     * @static
     * @method info
     * @param {string} message 
     * @param  {...any} args 
     */
    static info(message, ...args) {
        if (Logger.currentLevel <= Logger.LEVEL.INFO) {
            console.info(`[INFO] ${Logger._timestamp()}: ${message}`, ...args);
        }
    }

    /**
     * @static
     * @method warn
     * @param {string} message 
     * @param  {...any} args 
     */
    static warn(message, ...args) {
        if (Logger.currentLevel <= Logger.LEVEL.WARN) {
            console.warn(`[WARN] ${Logger._timestamp()}: ${message}`, ...args);
        }
    }

    /**
     * @static
     * @method error
     * @param {string} message 
     * @param  {...any} args 
     */
    static error(message, ...args) {
        if (Logger.currentLevel <= Logger.LEVEL.ERROR) {
            console.error(`[ERROR] ${Logger._timestamp()}: ${message}`, ...args);
        }
    }

    /**
     * @static
     * @private
     * @method _timestamp
     * @returns {string} HH:MM:SS.mmm
     */
    static _timestamp() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        const ms = String(now.getMilliseconds()).padStart(3, '0');
        return `${h}:${m}:${s}.${ms}`;
    }
}
