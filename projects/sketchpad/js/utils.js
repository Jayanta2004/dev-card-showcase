/**
 * @file utils.js
 * @description A collection of utility functions used throughout the SketchPad 
 * application. These include mathematical helpers, DOM manipulation shortcuts,
 * and standardizing constants.
 * 
 * Purpose:
 * Centralizing utility logic prevents code duplication and makes the system
 * easier to maintain as it grows in complexity.
 */

const Utils = (() => {

    // --- Mathematical Utilities ---

    /**
     * Clamps a value between a minimum and maximum range.
     * @param {number} value - The number to clamp.
     * @param {number} min - The lower bound.
     * @param {number} max - The upper bound.
     * @returns {number}
     */
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Linearly interpolates between two values.
     * @param {number} start - The starting value.
     * @param {number} end - The ending value.
     * @param {number} t - The interpolation factor (0.0 to 1.0).
     * @returns {number}
     */
    function lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }

    /**
     * Calculates the distance between two points.
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     * @returns {number}
     */
    function distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // --- DOM Utilities ---

    /**
     * Safely selects an element from the DOM.
     * @param {string} selector - The CSS selector.
     * @returns {HTMLElement|null}
     */
    function qs(selector) {
        return document.querySelector(selector);
    }

    /**
     * Safely selects multiple elements from the DOM.
     * @param {string} selector - The CSS selector.
     * @returns {NodeListOf<HTMLElement>}
     */
    function qsa(selector) {
        return document.querySelectorAll(selector);
    }

    /**
     * Adds multiple event listeners at once.
     * @param {EventTarget} target - The target element.
     * @param {Object} events - Mapping of event types to handlers.
     */
    function addEvents(target, events) {
        for (const [type, handler] of Object.entries(events)) {
            target.addEventListener(type, handler);
        }
    }

    // --- Performance Utilities ---

    /**
     * Limits how often a function can be called.
     * @param {Function} func - The function to throttle.
     * @param {number} limit - The time limit in milliseconds.
     * @returns {Function}
     */
    function throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Delays execution of a function until after a certain period of inactivity.
     * @param {Function} func - The function to debounce.
     * @param {number} delay - The delay in milliseconds.
     * @returns {Function}
     */
    function debounce(func, delay) {
        let timeout;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    // --- SketchPad Specific Utilities ---

    /**
     * Generates a random coordinate within a rectangle.
     * Useful for noise generation or effects.
     * @param {number} width 
     * @param {number} height 
     * @returns {{x: number, y: number}}
     */
    function getRandomPoint(width, height) {
        return {
            x: Math.random() * width,
            y: Math.random() * height
        };
    }

    // Exported Object
    return {
        clamp,
        lerp,
        distance,
        qs,
        qsa,
        addEvents,
        throttle,
        debounce,
        getRandomPoint
    };
})();
