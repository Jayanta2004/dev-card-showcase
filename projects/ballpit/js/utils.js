/**
 * utils.js
 * Mathematical helpers and vector operations for the physics engine.
 */

const Utils = {
    /**
     * Clamp a number between min and max
     */
    clamp: (val, min, max) => Math.max(min, Math.min(max, val)),

    /**
     * Linear interpolation
     */
    lerp: (a, b, t) => a + (b - a) * t,

    /**
     * Get distance between two points
     */
    dist: (x1, y1, x2, y2) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Square distance (faster for comparisons)
     */
    distSq: (x1, y1, x2, y2) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    },

    /**
     * Generate random float in range [min, max)
     */
    random: (min, max) => Math.random() * (max - min) + min,

    /**
     * Get random element from array
     */
    randomChoice: (arr) => arr[Math.floor(Math.random() * arr.length)],

    /**
     * Convert HEX to RGB
     */
    hexToRgb: (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    /**
     * Create an RGBA string
     */
    toRgba: (rgb, alpha = 1) => `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`,

    /**
     * Smoothly ease a value
     */
    smoothstep: (x) => x * x * (3 - 2 * x)
};
