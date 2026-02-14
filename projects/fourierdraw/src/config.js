/**
 * @fileoverview Central configuration for the FourierDraw application.
 * Defines visual constants, audio parameters, and system limits.
 */

export const CONFIG = {
    /**
     * Color palette for the application.
     */
    COLORS: {
        BACKGROUND: '#050508',
        SKETCH: 'rgba(255, 255, 255, 0.25)',
        SKETCH_ACTIVE: 'rgba(99, 102, 241, 0.8)',
        EPICYCLE_RING: 'rgba(99, 102, 241, 0.4)',
        EPICYCLE_RADIUS: 'rgba(255, 255, 255, 0.15)',
        PATH_TRACE: '#6366f1',
        PATH_SHADOW: 'rgba(99, 102, 241, 0.6)',
        PARTICLE_COLOR: 'rgba(129, 140, 248, 0.8)',
        GRID_COLOR: 'rgba(255, 255, 255, 0.03)'
    },

    /**
     * Animation and timing parameters.
     */
    ANIMATION: {
        DEFAULT_SPEED: 0.05,
        TRACE_LENGTH: 1500,
        PATH_JOIN_THRESHOLD: 15,
        PARTICLE_LIFESPAN: 60,
        PARTICLE_COUNT: 5,
        MAX_TRAIL_POINTS: 1000
    },

    /**
     * Discrete Fourier Transform configuration.
     */
    DFT: {
        MAX_POINTS: 2000,
        SKIP_RATE: 1,
        SORT_BY_MAGNITUDE: true,
        RESOLUTION_LIMIT: 0.001
    },

    /**
     * Web Audio API configuration.
     */
    AUDIO: {
        BASE_FREQ: 220, // A3
        OCTAVE_RANGE: 2,
        MAX_OSCILLATORS: 10,
        VOLUME: 0.15,
        REVERB_WET: 0.3,
        DELAY_TIME: 0.25,
        DELAY_FEEDBACK: 0.4
    },

    /**
     * Symmetry and brush settings.
     */
    SKETCH_MODES: {
        SYMMETRY: {
            RADIAL: 1, // 1 = none, 2 = bilateral, etc.
            MIRROR: false
        },
        BRUSH: {
            MIN_SIZE: 1,
            MAX_SIZE: 8,
            SMOOTHING: 0.5
        }
    },

    /**
     * UI Constants.
     */
    UI: {
        GLASS_BLUR: '12px',
        BR_RADIUS: '1.5rem',
        TRANSITION_FAST: '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        TRANSITION_NORMAL: '0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }
};
