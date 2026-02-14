/**
 * NonEuclidScroll | Utils
 * Mathematical helper functions for the non-Euclidean engine.
 */

const Utils = {
    /**
     * Linearly interpolates between two values.
     * @param {number} a - Start value
     * @param {number} b - End value
     * @param {number} t - Progress (0 to 1)
     * @returns {number}
     */
    lerp: (a, b, t) => a + (b - a) * t,

    /**
     * Constraints a value between min and max.
     * @param {number} val - Value to clamp
     * @param {number} min - Minimum limit
     * @param {number} max - Maximum limit
     * @returns {number}
     */
    clamp: (val, min, max) => Math.max(min, Math.min(max, val)),

    /**
     * Generates a random integer between min and max.
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

    /**
     * Generates a unique ID for DOM elements or sections.
     * @returns {string}
     */
    generateId: () => `node-${Math.random().toString(36).substr(2, 9)}`,

    /**
     * Formats a distance value for HUD display.
     * @param {number} dist 
     * @returns {string}
     */
    formatDistance: (dist) => `${Math.abs(Math.round(dist))}m`,

    /**
     * Debounce helper for performance optimization.
     */
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Easing function for smooth scroll momentum.
     * Quartic easing out.
     */
    easeOutQuart: (x) => 1 - Math.pow(1 - x, 4)
};
