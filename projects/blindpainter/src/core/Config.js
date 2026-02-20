/**
 * @class Config
 * @description Centralized configuration for BlindPainter.
 * Tweaking these values changes the "feel" of the instrument.
 */
export const Config = {
    // Audio Settings
    AUDIO: {
        ROOT_FREQ: 220, // A3
        MAX_FREQ: 880,  // A5
        MIN_GAIN: 0.0,
        MAX_GAIN: 0.6,
        ATTACK_TIME: 0.05,
        RELEASE_TIME: 0.3,
        CROSS_TIMBRE_FREQ_MULT: 1.5, // Multiplier when crossing lines
        CROSS_TIMBRE_TYPE: 'sawtooth', // Timbre when crossing
        DEFAULT_TYPE: 'sine',
        FILTER_Q: 1,
        DELAY_TIME: 0.3, // Seconds
        DELAY_FEEDBACK: 0.4
    },

    // Input Settings
    INPUT: {
        MIN_SPEED: 0,
        MAX_SPEED: 50, // Pixels per frame approx
        SMOOTHING_FACTOR: 0.1 // For speed smoothing
    },

    // Drawing/Collision Settings
    DRAWING: {
        SPATIAL_CELL_SIZE: 50, // Grid size for spatial hash
        COLLISION_RADIUS: 5,  // Detection radius
        MAX_HISTORY: 1000,    // Max strokes to keep
        FADE_RATE: 0.01       // Visual fade (if we render anything)
    },

    // UI Settings
    UI: {
        DEBUG_MODE: false
    }
};
