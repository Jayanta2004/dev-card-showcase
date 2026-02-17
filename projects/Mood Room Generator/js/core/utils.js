/**
 * utils.js
 * Common math and helper functions.
 */

export const MathUtils = {
    /**
     * Random float between min and max
     * @param {number} min 
     * @param {number} max 
     */
    randFloat(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Random integer between min and max
     * @param {number} min 
     * @param {number} max 
     */
    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Clamp a value between min and max
     * @param {number} val 
     * @param {number} min 
     * @param {number} max 
     */
    clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    },

    /**
     * Map a value from one range to another
     * @param {number} value 
     * @param {number} inMin 
     * @param {number} inMax 
     * @param {number} outMin 
     * @param {number} outMax 
     */
    map(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }
};

export const DOMUtils = {
    /**
     * Sleep for ms
     * @param {number} ms 
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
