/**
 * input.js
 * 
 * Handles all user input events (Mouse and Touch).
 * Sanitizes and synchronizes input data with the global state.
 * 
 * @module Input
 */

import { STATE, updateCursorPosition, updateViewportMetrics } from './state.js';
import { debounce } from './utils.js';
import { CONFIG } from './config.js';

/**
 * Initializes all input event listeners.
 */
export const initInputListeners = () => {
    // Mouse Movement
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Touch Support
    window.addEventListener('touchstart', handleTouchMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Viewport Resize
    window.addEventListener('resize', debounce(() => {
        updateViewportMetrics();
        // Emit custom event if needed for components to recalibrate
        window.dispatchEvent(new CustomEvent('shytext:resize'));
    }, CONFIG.INTERACTION.RESIZE_DEBOUNCE));

    // Visibility Change (Pause when backgrounded)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (CONFIG.DEBUG) {
        console.log('Input listeners initialized.');
    }
};

/**
 * Handles mouse movement events.
 * 
 * @param {MouseEvent} event 
 */
const handleMouseMove = (event) => {
    updateCursorPosition(event.clientX, event.clientY);
};

/**
 * Handles touch events and extracts the first touch point.
 * 
 * @param {TouchEvent} event 
 */
const handleTouchMove = (event) => {
    if (event.touches && event.touches.length > 0) {
        const touch = event.touches[0];
        updateCursorPosition(touch.clientX, touch.clientY);
    }
};

/**
 * Pauses or resumes the application based on tab visibility.
 */
const handleVisibilityChange = () => {
    if (document.hidden) {
        STATE.lifecycle.isBackgrounded = true;
    } else {
        STATE.lifecycle.isBackgrounded = false;
    }
};

/**
 * Technical Detail: Passive Event Listeners
 * 
 * We use { passive: true } for mouse and touch listeners. This tells the 
 * browser that the handler will not call preventDefault(), allowing 
 * for much smoother scrolling and interaction performance as the 
 * browser doesn't have to wait for the JS to finish execution before 
 * proceeding with UI updates.
 */
