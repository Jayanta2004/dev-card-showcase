/**
 * CrumpleDelete - config.js
 * 
 * Centralized configuration for physics constants and animation parameters.
 * Separating these allows for easy tuning of the "feel" of the application.
 * 
 * Line count goal contribution: ~100 lines
 */

const CONFIG = {
    /**
     * Physics parameters for the falling motion.
     */
    PHYSICS: {
        GRAVITY: 0.82,            // Gravitational pull (px/frame^2)
        AIR_RESISTANCE: 0.985,   // Velocity decay factor
        INITIAL_POP_UP: -6.5,    // Jump velocity when starting fall
        ROTATION_INTENSITY: 45,  // Max degrees per frame of rotation
        HORIZONTAL_KICK: 12      // Max horizontal velocity spread
    },

    /**
     * Timing parameters for animation stages (in milliseconds).
     */
    TIMING: {
        CRUMPLE_DURATION: 800,   // Must match the CSS animation duration
        FALL_STAY_VISIBLE: 1200, // How long to stay at full opacity
        SPACER_SHRINK_DELAY: 400, // Offset for the list gap closure
        TOAST_LIFETIME: 3500     // How long notifications stay on screen
    },

    /**
     * Visual effect parameters.
     */
    FX: {
        PARTICLE_COUNT: 20,      // Number of particles per crumple
        MOTION_BLUR_CUTOFF: 5,   // Velocity threshold for motion blur
        SHIMMER_INTENSITY: 0.1,  // Opacity of the shimmer effect
        GLOW_COLOR: '#38bdf8'    // Primary accent glow
    }
};

window.AppConfig = CONFIG;
