/**
 * BubblePop - System Utilities & Helper Library
 * 
 * @file utils.js
 * @description A collection of reusable utility functions for DOM manipulation,
 * mathematical calculations, and performance optimization (throttling/debouncing).
 * This library provides the foundation for the application's procedural logic.
 * 
 * @author Antigravity
 * @version 1.0.0
 */

/**
 * Global Utility Repository
 * @namespace Utils
 */
export const Utils = {
    /**
     * Higher-order element factory. Creates a DOM element, applies attributes,
     * handles datasets, and ensures class consistency.
     * 
     * @param {string} tag - The HTML tag name (e.g., 'div', 'span').
     * @param {Object} [attrs={}] - Key-value pairs of attributes.
     * @param {Array<string>} [classes=[]] - CSS classes to append.
     * @returns {HTMLElement} The prepared DOM element.
     * 
     * @example
     * const btn = Utils.createElement('button', { id: 'test' }, ['primary', 'large']);
     */
    createElement(tag, attrs = {}, classes = []) {
        if (!tag) throw new Error('Utils.createElement: Tag name is required.');

        const element = document.createElement(tag);

        // Apply attributes
        Object.keys(attrs).forEach(key => {
            if (key === 'dataset' && typeof attrs.dataset === 'object') {
                // Handle nested datasets
                Object.keys(attrs.dataset).forEach(dataKey => {
                    element.dataset[dataKey] = attrs.dataset[dataKey];
                });
            } else if (key === 'role' || key.startsWith('aria-')) {
                // Ensure accessibility attributes are set
                element.setAttribute(key, attrs[key]);
            } else {
                element.setAttribute(key, attrs[key]);
            }
        });

        // Apply classes
        classes.forEach(cls => {
            if (cls && typeof cls === 'string') {
                element.classList.add(cls.trim());
            }
        });

        return element;
    },

    /**
     * Generates a random integer within a closed interval [min, max].
     * 
     * @param {number} min - Lower bound.
     * @param {number} max - Upper bound.
     * @returns {number} Random integer.
     */
    randomRange(min, max) {
        const floorMin = Math.ceil(min);
        const floorMax = Math.floor(max);
        return Math.floor(Math.random() * (floorMax - floorMin + 1)) + floorMin;
    },

    /**
     * Generates a random floating-point number within an open interval (min, max).
     * 
     * @param {number} min - Lower bound.
     * @param {number} max - Upper bound.
     * @returns {number} Random float.
     */
    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Batch updates CSS Custom Properties (Variables) on an element's style declaration.
     * Useful for passing procedural data to the CSS animation engine.
     * 
     * @param {HTMLElement} element - Target element.
     * @param {Object.<string, string|number>} properties - Property-value map.
     * @returns {void}
     */
    setCSSVars(element, properties) {
        if (!element || !element.style) return;

        Object.entries(properties).forEach(([key, value]) => {
            // Automatically prefix with double-dash if missing
            const propertyName = key.startsWith('--') ? key : `--${key}`;
            element.style.setProperty(propertyName, String(value));
        });
    },

    /**
     * Throttles a function execution. The function will be called at most once
     * per specified limit duration. Ideal for scroll or heavy resize events.
     * 
     * @param {Function} func - Function to throttle.
     * @param {number} limit - Throttle period in milliseconds.
     * @returns {Function} Throttled wrapper.
     */
    throttle(func, limit) {
        let inThrottle = false;

        return function (...args) {
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => {
                    inThrottle = false;
                }, limit);
            }
        };
    },

    /**
     * Debounces a function execution. The function will be called only after
     * a specified delay has passed since the last invocation.
     * Ideal for layout recalculations on window resize.
     * 
     * @param {Function} func - Function to debounce.
     * @param {number} delay - Debounce delay in milliseconds.
     * @returns {Function} Debounced wrapper.
     */
    debounce(func, delay) {
        let timeoutId = null;

        return function (...args) {
            const context = this;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    },

    /**
     * Asynchronously waits for a specified duration.
     * 
     * @param {number} ms - Milliseconds to delay.
     * @returns {Promise<void>}
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Clamps a value between a minimum and maximum bound.
     * 
     * @param {number} val 
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }
};
