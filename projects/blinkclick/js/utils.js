/**
 * BlinkClick Utilities
 * A collection of helper functions used across the application.
 */

const Utils = {
    /**
     * Map a value from one range to another
     */
    map: (value, low1, high1, low2, high2) => {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    },

    /**
     * Clamp a value between min and max
     */
    clamp: (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Smooth moving average
     */
    lerp: (start, end, amt) => {
        return (1 - amt) * start + amt * end;
    },

    /**
     * Generate a random hex color
     */
    randomColor: () => {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    },

    /**
     * Format a timestamp
     */
    formatTime: (date) => {
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },

    /**
     * Create a unique ID
     */
    generateId: () => {
        return 'node-' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Detect if mobile
     */
    isMobile: () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Wait for a specified duration
     */
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

window.Utils = Utils;
