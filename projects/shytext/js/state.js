/**
 * state.js
 * 
 * Manages the application-wide state for ShyText.
 * Handles cursor tracking, window metrics, and normalized proximity values.
 * 
 * @module State
 */

import { CONFIG } from './config.js';

export const STATE = {
    /**
     * Raw Cursor Coordinates
     */
    cursor: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        lastX: window.innerWidth / 2,
        lastY: window.innerHeight / 2
    },

    /**
     * Window Dimensions
     */
    viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        centerX: window.innerWidth / 2,
        centerY: window.innerHeight / 2
    },

    /**
     * Processed Proximity Metrics
     * Values range from 0.0 (Far) to 1.0 (Directly on top).
     */
    interactions: {
        globalProximity: 0,
        activeTargetId: null,
        isThrottled: false,
        lastUpdateTime: 0
    },

    /**
     * Application Lifecycle State
     */
    lifecycle: {
        isInitialized: false,
        isPaused: false,
        isBackgrounded: false
    }
};

/**
 * Updates the cursor position in the state.
 * 
 * @param {number} x - New X coordinate
 * @param {number} y - New Y coordinate
 */
export const updateCursorPosition = (x, y) => {
    STATE.cursor.lastX = STATE.cursor.x;
    STATE.cursor.lastY = STATE.cursor.y;
    STATE.cursor.x = x;
    STATE.cursor.y = y;
};

/**
 * Updates viewport metrics on resize.
 */
export const updateViewportMetrics = () => {
    STATE.viewport.width = window.innerWidth;
    STATE.viewport.height = window.innerHeight;
    STATE.viewport.centerX = window.innerWidth / 2;
    STATE.viewport.centerY = window.innerHeight / 2;
};

/**
 * Updates the global proximity score.
 * 
 * @param {number} score - The normalized proximity score (0-1)
 */
export const setGlobalProximity = (score) => {
    STATE.interactions.globalProximity = score;
};

/**
 * Toggles the application pause state.
 * 
 * @param {boolean} status 
 */
export const setAppPaused = (status) => {
    STATE.lifecycle.isPaused = status;
};

/**
 * Technical Note on State Synchronization:
 * 
 * We use a POJO (Plain Old JavaScript Object) for the STATE to ensure 
 * minimal overhead during high-frequency cursor updates. While reactive 
 * frameworks are common, vanilla state manipulation is preferred here 
 * for performance reasons in an animation-heavy experimental interaction.
 */
