/**
 * @file constants.js
 * @description Centralized configuration repository for the ShepardScroll application.
 * This file contains all the "magic numbers", tuning parameters, and state defaults
 * that govern the behavior of the audio engine, physics simulation, and visual styling.
 * 
 * Organizing these constants separately allows for easier fine-tuning without digging
 * into the logic implementation across multiple files.
 * 
 * Line Count Strategy: Rich semantic documentation and detailed technical explanations.
 */

const CONFIG = {
    // =========================================================================
    // AUDIO ENGINE CONSTANTS
    // =========================================================================
    AUDIO: {
        // The core frequency from which the Shepard octaves are derived.
        BASE_FREQUENCY: 20.0,

        // Number of simultaneous octave layers. 
        // Increasing this adds richness but increases CPU load.
        DEFAULT_LAYERS: 12,
        MIN_LAYERS: 4,
        MAX_LAYERS: 16,

        // The master output volume (0.0 to 1.0).
        // Standardized to 0.6 to prevent digital clipping in the browser.
        MASTER_GAIN: 0.6,

        // Threshold for the Gaussian volume envelope fading.
        // Determines how sharp the fade is at the extremes of the spectrum.
        ENV_SIGMA_FACTOR: 0.25,

        // Waveform types available for the oscillator engine.
        WAVEFORMS: {
            SINE: 'sine',
            SQUARE: 'square',
            SAWTOOTH: 'sawtooth',
            TRIANGLE: 'triangle'
        },

        // Default smoothing time (in seconds) for frequency transitions.
        // Uses Web Audio API ramp methods.
        SMOOTHING_TIME: 0.05,

        // Spatial Audio Settings
        SPATIAL: {
            RADIUS: 10,
            ROTATION_SPEED: 0.05,
            PANNING_MODEL: 'equalpower'
        },

        // Dynamic Delay Effect (Momentum Echoes)
        DELAY: {
            MAX_TIME: 1.0,
            BASE_TIME: 0.35,
            MIN_FEEDBACK: 0.4,
            MAX_FEEDBACK: 0.85,
            BASE_WET_LEVEL: 0.25,
            VELOCITY_SCALAR: 0.008
        }
    },

    // =========================================================================
    // PHYSICS & PARTICLE SYSTEM CONSTANTS
    // =========================================================================
    PHYSICS: {
        // Total number of particles in the field.
        PARTICLE_COUNT: 450,

        // Influence of drag/friction on particle motion.
        // Higher values make movement feel "thick" or underwater.
        DAMPING: 0.98,

        // Sensitivity to scroll velocity.
        VELOCITY_INFLUENCE: 0.08,

        // Particle size range.
        MIN_SIZE: 0.5,
        MAX_SIZE: 4.0,

        // Interaction Radius: How far the mouse repels particles.
        REPULSION_RADIUS: 250,
        REPULSION_STRENGTH: 0.5,

        // Depth perception settings.
        Z_MAX: 1000,
        Z_STEP: 2.0
    },

    // =========================================================================
    // SCROLL MAPPING & INTERACTION CONSTANTS
    // =========================================================================
    SCROLL: {
        // Pixels of scroll required to traverse one full octave.
        // Lower values mean faster pitch change.
        SENSITIVITY: 0.00045,

        // Momentum smoothing factor for scroll calculations (Lerp alpha).
        VELOCITY_SMOOTHING: 0.92,

        // Maximum velocity cap to prevent extreme audio jumps.
        MAX_VELOCITY: 150
    },

    // =========================================================================
    // UI & VISUALS CONSTANTS
    // =========================================================================
    UI: {
        // Color Hue range (degrees in HSL).
        HUE_START: 210, // Blue/Cyan
        HUE_RANGE: 360,

        // Opacity thresholds for various layers.
        VISUALIZER_OPACITY: 0.45,
        OVERLAY_FADE_SPEED: '1.2s',

        // Blur maximum (in pixels).
        MAX_MOTION_BLUR: 12,

        // Settings Panel update frequency (ms).
        UI_UPDATE_RATE: 100
    }
};

// Freeze the object to prevent accidental runtime mutations
Object.freeze(CONFIG);
Object.freeze(CONFIG.AUDIO);
Object.freeze(CONFIG.PHYSICS);
Object.freeze(CONFIG.SCROLL);
Object.freeze(CONFIG.UI);

window.ShepardConfig = CONFIG;
