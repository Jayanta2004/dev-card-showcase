/**
 * @file utils.js
 * @description Shared utility functions and common helpers for the LightSwitch project.
 * 
 * Provides standardized methods for:
 * - Time and Delays
 * - Mathematical operations for Audio/Visual interpolation
 * - Robust Logging with levels and colors
 * - DOM manipulation shortcuts
 */

/**
 * Enhanced Logger with level support and custom styles.
 */
export class Logger {
    /**
     * @param {string} namespace - The module name for the prefix.
     * @param {string} color - CSS color for the console prefix.
     */
    constructor(namespace, color = '#ffffff') {
        this.namespace = namespace;
        this.color = color;
    }

    /**
     * Logs a debug message.
     * @param {string} message 
     * @param {...any} args 
     */
    debug(message, ...args) {
        console.groupCollapsed(`%c[${this.namespace}] DEBUG`, `color: ${this.color}; font-weight: bold;`, message);
        console.trace("Call Stack");
        if (args.length > 0) console.dir(args);
        console.groupEnd();
    }

    /**
     * Logs an info message.
     * @param {string} message 
     * @param {...any} args 
     */
    info(message, ...args) {
        console.log(`%c[${this.namespace}]`, `color: ${this.color}; font-weight: bold;`, message, ...args);
    }

    /**
     * Logs a warning.
     * @param {string} message 
     */
    warn(message) {
        console.warn(`%c[${this.namespace}] WARN:`, `color: #ffcc00; font-weight: bold;`, message);
    }

    /**
     * Logs an error with optional stack trace.
     * @param {string} message 
     * @param {Error} error 
     */
    error(message, error = null) {
        console.error(`%c[${this.namespace}] ERROR:`, `color: #ff3333; font-weight: bold;`, message);
        if (error) console.error(error);
    }
}

/**
 * Utility class for mathematical operations.
 */
export const MathUtils = {
    /**
     * Clamps a value between a minimum and maximum range.
     * @param {number} value 
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),

    /**
     * Linearly interpolates between two numbers.
     * @param {number} start 
     * @param {number} end 
     * @param {number} t - Progress (0 to 1) 
     * @returns {number}
     */
    lerp: (start, end, t) => start * (1 - t) + end * t,

    /**
     * Maps a value from one range to another.
     * @param {number} value 
     * @param {number} low1 
     * @param {number} high1 
     * @param {number} low2 
     * @param {number} high2 
     * @returns {number}
     */
    mapRange: (value, low1, high1, low2, high2) => {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    },

    /**
     * Generates a random float within a range.
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    randomFloat: (min, max) => Math.random() * (max - min) + min,

    /**
     * Generates a random integer within a range.
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
};

/**
 * Utility class for timing and async operations.
 */
export const TimeUtils = {
    /**
     * Standardized delay using Promises.
     * @param {number} ms - Milliseconds to wait.
     * @returns {Promise<void>}
     */
    delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    /**
     * Returns the current high-resolution timestamp.
     * @returns {number}
     */
    now: () => performance.now(),

    /**
     * Simple debounce function to limit execution frequency.
     * @param {Function} func 
     * @param {number} wait 
     * @returns {Function}
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
    }
};

/**
 * Utility class for DOM manipulation.
 */
export const DOMUtils = {
    /**
     * Safely selects an element and throws an error if not found.
     * @param {string} selector 
     * @returns {HTMLElement}
     */
    qs: (selector) => {
        const el = document.querySelector(selector);
        if (!el) throw new Error(`Element not found: ${selector}`);
        return el;
    },

    /**
     * Safely selects all elements matching a selector.
     * @param {string} selector 
     * @returns {NodeList}
     */
    qsa: (selector) => document.querySelectorAll(selector),

    /**
     * Adds multiple classes to an element at once.
     * @param {HTMLElement} el 
     * @param {string[]} classes 
     */
    addClasses: (el, classes) => el.classList.add(...classes),

    /**
     * Sets multiple CSS variables on an element.
     * @param {HTMLElement} el 
     * @param {Object} variables - Key-value pairs of variable names and values.
     */
    setVariables: (el, variables) => {
        Object.entries(variables).forEach(([key, value]) => {
            el.style.setProperty(`--${key}`, value);
        });
    }
};
