/**
 * config.js
 * 
 * Central configuration repository for the ShyText application.
 * Defines the parameters for the "shyness" effect, including
 * distance thresholds, blur intensities, and timing constants.
 * 
 * @module Config
 */

export const CONFIG = {
    /**
     * Proximity Settings
     * Thresholds are in pixels.
     */
    PROXIMITY: {
        // Distance from text where blur starts becoming noticeable
        MIN_THRESHOLD: 400,
        // Distance from text where blur is at its maximum (direct focus)
        MAX_THRESHOLD: 20,
        // Easing function for the proximity calculation (0 = linear, 1 = exponential)
        EASING_STRENGTH: 0.8
    },

    /**
     * Visual State Settings
     * Defines the range of CSS filter values.
     */
    VISUALS: {
        // Maximum blur in pixels applied to text elements
        MAX_BLUR: 12,
        // Minimum opacity applied when blurred (0.0 to 1.0)
        MIN_OPACITY: 0.25,
        // Scale transformation factor (1.0 = normal size)
        MAX_SCALE: 1.08,
        // Interval for state updates in milliseconds (for performance throttling)
        UPDATE_INTERVAL: 16 // ~60fps
    },

    /**
     * Ambient Background Settings
     * Particle and noise parameters for the background layer.
     */
    AMBIENT: {
        PARTICLE_COUNT: 45,
        BASE_COLOR: 'rgba(99, 102, 241, 0.1)',
        GRAFT_STRENGTH: 0.05,
        MOVEMENT_SPEED: 0.2
    },

    /**
     * Interaction Settings
     */
    INTERACTION: {
        // Debounce timer for window resizing
        RESIZE_DEBOUNCE: 150,
        // Smoothing factor for cursor position interpolation (0 to 1)
        LERP_FACTOR: 0.12
    },

    /**
     * Logging and Debugging
     * Set to true to enable console reporting of proximity metrics.
     */
    DEBUG: false
};

/**
 * Technical Documentation for Thresholds:
 * 
 * The ShyText effect is driven by an inverse proximity relationship.
 * As the distance (d) between the cursor and a text element decreases:
 * 1. Proximity P is calculated: P = clamp((MAX_DIST - d) / (MAX_DIST - MIN_DIST), 0, 1)
 * 2. Visual intensity I is derived from P using an easing curve.
 * 3. Blur B = MAX_BLUR * I
 */
