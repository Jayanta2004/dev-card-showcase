/**
 * utils.js
 * 
 * A collection of mathematical and functional utility wrappers.
 * Used for interpolation, distance calculations, and performance optimizations.
 * 
 * @module Utils
 */

/**
 * Calculates the Euclidean distance between two points.
 * 
 * @param {number} x1 - X-coordinate of point A
 * @param {number} y1 - Y-coordinate of point A
 * @param {number} x2 - X-coordinate of point B
 * @param {number} y2 - Y-coordinate of point B
 * @returns {number} The distance between point A and B
 */
export const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

/**
 * Linear Interpolation (LERP)
 * 
 * @param {number} start - The starting value
 * @param {number} end - The target value
 * @param {number} factor - The interpolation factor (0-1)
 * @returns {number} The interpolated value
 */
export const lerp = (start, end, factor) => {
    return start + (end - start) * factor;
};

/**
 * Clamps a value between a minimum and maximum range.
 * 
 * @param {number} val - The input value
 * @param {number} min - The lower bound
 * @param {number} max - The upper bound
 * @returns {number} The clamped value
 */
export const clamp = (val, min, max) => {
    return Math.max(min, Math.min(max, val));
};

/**
 * Maps a value from one range to another.
 * 
 * @param {number} val - The input value
 * @param {number} inMin - Lower bound of input range
 * @param {number} inMax - Upper bound of input range
 * @param {number} outMin - Lower bound of output range
 * @param {number} outMax - Upper bound of output range
 * @returns {number} The mapped value
 */
export const mapRange = (val, inMin, inMax, outMin, outMax) => {
    return (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
};

/**
 * Debounce function to limit execution frequency.
 * 
 * @param {Function} func - The function to execute
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} The debounced function
 */
export const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
};

/**
 * Throttles function execution based on a time interval.
 * 
 * @param {Function} func - The function to execute
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} The throttled function
 */
export const throttle = (func, limit) => {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
};

/**
 * Generates a random integer within a range.
 * 
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number}
 */
export const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Gets the center coordinates of a DOM element.
 * 
 * @param {HTMLElement} element - The target element
 * @returns {Object} {x, y} coordinates
 */
export const getElementCenter = (element) => {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
};

/**
 * Creates an easing effect for a value between 0 and 1.
 * 
 * @param {number} t - The value to ease
 * @returns {number} The eased value
 */
export const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
