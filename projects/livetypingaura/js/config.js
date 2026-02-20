/**
 * LiveTypingAura - Configuration
 * Tunable constants for the particle system and behavior.
 */

export const CONFIG = {
    // Particle Physics
    PARTICLE: {
        COUNT_LIMIT: 800, // Doubled for density
        GRAVITY: 0.05,
        FRICTION: 0.96,
        LIFE_DECAY: 0.012, // Slower decay for longer trails
        GROWTH_RATE: 0.15,
        MIN_SIZE: 3,
        MAX_SIZE: 12,      // Chunky particles
        INITIAL_SPEED: 6   // Faster base speed
    },

    // Visuals
    COLORS: {
        BASE_HUE: 180,
        HUE_VARIANCE: 50,  // More colorful
        GLOW_BLUR: 25      // Stronger glow
    },

    // Typography & Layout
    FONT: {
        FAMILY: '"Inter", "Segoe UI", sans-serif',
        SIZE: 'clamp(2rem, 5vw, 4rem)',
        COLOR: 'rgba(255, 255, 255, 0.1)'
    },

    // Interaction Thresholds
    IDLE: {
        TIMEOUT: 2000,
        DISSOLVE_RATE: 0.05
    },

    // Phase 2: Heat System
    HEAT: {
        DECAY: 0.05,
        GAIN_PER_CHAR: 0.5, // Faster heat up
        MAX: 5.0,
        TIERS: [
            { threshold: 0, color: 180 },
            { threshold: 2, color: 260 },
            { threshold: 4, color: 320 }
        ]
    },

    // Phase 3: Depth Illusion
    DEPTH: {
        NEAR_SCALE: 2.0,   // More dramatic scale
        FAR_SCALE: 0.4,
        NEAR_ALPHA: 1.0,
        FAR_ALPHA: 0.2,
        PARALLAX_STRENGTH: 3.0
    },

    // Phase 4: Unique Features
    THEMES: {
        'fire': { color: 20, active: true },
        'ice': { color: 190, active: true },
        'void': { color: 270, active: true },
        'matrix': { color: 120, active: true },
        'gold': { color: 45, active: true },
        'love': { color: 340, active: true },
        'water': { color: 200, active: true },    // Azure/Blue
        'sand': { color: 30, active: true },      // Sandy Orange
        'reset': { color: null, active: true } // Special key to reset
    },

    PHYSICS: {
        SHOCKWAVE_RADIUS: 500, // Huge radius
        SHOCKWAVE_FORCE: 40,   // Massive force

        // Phase 6: God Mode
        MOUSE_REPULSION_RADIUS: 150,
        MOUSE_REPULSION_FORCE: 2,
        GRAVITY_WELL_FORCE: 1.5 // Strength of Shift-key black hole
    }
};
