/**
 * DOMHelper.js
 * Utility for creating and managing DOM elements.
 */
export default class DOMHelper {
    /**
     * Create an element with class and optional parent
     * @param {string} tag 
     * @param {string|string[]} className 
     * @param {HTMLElement} parent 
     */
    static createElement(tag, className, parent = null) {
        const el = document.createElement(tag);
        if (Array.isArray(className)) {
            el.classList.add(...className);
        } else if (className) {
            el.classList.add(className);
        }
        if (parent) parent.appendChild(el);
        return el;
    }

    /**
     * Set CSS variable on root
     * @param {string} variable 
     * @param {string} value 
     */
    static setCSSVar(variable, value) {
        document.documentElement.style.setProperty(variable, value);
    }
}
