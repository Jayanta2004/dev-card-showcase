/**
 * TimeUtils
 * Helpers for timing and formatting.
 */

export const TimeUtils = {
    /**
     * Formats milliseconds into HH:MM:SS.
     * @param {Date} date 
     * @returns {string}
     */
    formatTime: (date) => {
        return date.toLocaleTimeString('en-GB', { hour12: false });
    },

    /**
     * Returns high-res timestamp.
     * @returns {number}
     */
    now: () => performance.now()
};
