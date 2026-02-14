/**
 * Simple logging utility for debugging simulation state.
 * Can be toggled on/off in production.
 */
export class Logger {
    static enabled = true;
    static levels = {
        INFO: 'INFO',
        WARN: 'WARN',
        ERROR: 'ERROR',
        DEBUG: 'DEBUG'
    };

    static log(level, message, data = null) {
        if (!this.enabled) return;

        const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
        const prefix = `[${timestamp}] [${level}]`;

        switch (level) {
            case this.levels.INFO:
                console.log(`%c${prefix} ${message}`, 'color: #64ffda', data || '');
                break;
            case this.levels.WARN:
                console.warn(`%c${prefix} ${message}`, 'color: #ffd700', data || '');
                break;
            case this.levels.ERROR:
                console.error(`%c${prefix} ${message}`, 'color: #ff5f5f; font-weight: bold', data || '');
                break;
            case this.levels.DEBUG:
                console.debug(`%c${prefix} ${message}`, 'color: #8892b0', data || '');
                break;
        }
    }

    static info(msg, data) { this.log(this.levels.INFO, msg, data); }
    static warn(msg, data) { this.log(this.levels.WARN, msg, data); }
    static error(msg, data) { this.log(this.levels.ERROR, msg, data); }
    static debug(msg, data) { this.log(this.levels.DEBUG, msg, data); }
}
