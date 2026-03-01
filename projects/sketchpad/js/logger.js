/**
 * @file logger.js
 * @description Provides a custom logging interface for the SketchPad application.
 * This allows for better debugging and insight into the application state during
 * the development and testing phases.
 * 
 * Features:
 * - Timestamps for all messages.
 * - Categorized logging (INFO, WARN, ERROR, DEBUG).
 * - Visual styling in the browser console.
 * - History tracking.
 */

const Logger = (() => {
    // --- Configuration ---
    const APP_NAME = 'SketchPad';
    const SHOW_DEBUG = true;

    // --- State ---
    /** @type {Array<{timestamp: Date, level: string, message: string}>} */
    const history = [];

    // --- Private Methods ---

    /**
     * Formats the timestamp for log messages.
     * @returns {string}
     */
    function getTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + now.getMilliseconds().toString().padStart(3, '0');
    }

    /**
     * Internal logging function.
     * @param {string} level 
     * @param {string} message 
     * @param {string} color 
     */
    function log(level, message, color = '#666') {
        const timestamp = getTime();
        const entry = { timestamp: new Date(), level, message };

        // Add to history
        history.push(entry);
        if (history.length > 100) history.shift(); // Keep history manageable

        // Format for browser console
        console.log(
            `%c[${timestamp}]%c ${level}%c [${APP_NAME}]: ${message}`,
            'color: #999; font-size: 0.8em;',
            `color: ${color}; font-weight: bold;`,
            'color: inherit; font-weight: normal;'
        );
    }

    // --- Public API ---

    /**
     * Logs an informational message.
     * @param {string} message 
     */
    function info(message) {
        log('INFO', message, '#2196F3');
    }

    /**
     * Logs a warning message.
     * @param {string} message 
     */
    function warn(message) {
        log('WARN', message, '#FF9800');
    }

    /**
     * Logs an error message.
     * @param {string} message 
     */
    function error(message) {
        log('ERROR', message, '#F44336');
    }

    /**
     * Logs a debug message if debugging is enabled.
     * @param {string} message 
     */
    function debug(message) {
        if (SHOW_DEBUG) {
            log('DEBUG', message, '#9C27B0');
        }
    }

    /**
     * Returns the full log history for diagnostics.
     * @returns {Array}
     */
    function getHistory() {
        return [...history];
    }

    /**
     * Clears the log history.
     */
    function clear() {
        history.length = 0;
        console.clear();
        info('Log history cleared.');
    }

    // Exported Object
    return {
        info,
        warn,
        error,
        debug,
        getHistory,
        clear
    };
})();
