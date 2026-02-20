/**
 * config.js
 * 
 * Centralized configuration for the Text Dodge application.
 * Controls physics parameters, grid settings, and interaction thresholds.
 */

const AppConfig = {
    // Canvas and Rendering
    rendering: {
        usePixelCorrection: true, // Round coordinates to avoid sub-pixel blurring
        frameRateCap: 60,         // Target frame rate
        enableDebugOverlay: false // Toggle debug lines
    },

    // Cursor Interaction Settings
    cursor: {
        interactionRadius: 200,   // Distance in pixels where text reacts
        maxForce: 15,             // Maximum repulsion force magnitude
        velocityInfluence: 0.5,   // How much cursor speed affects repulsion
        smoothing: 0.15           // Lerp factor for cursor position (0-1)
    },

    // Physics / Motion Settings
    physics: {
        friction: 0.9,            // Air resistance (0-1, lower is strictly stickier)
        springStiffness: 0.08,    // Force pulling back to original position
        springDamping: 0.85,      // Damping for the spring force
        mass: 1.0,                // Default mass for text entities
        restThreshold: 0.1        // Velocity below which an entity is considered "at rest"
    },

    // Text Entity Settings
    entities: {
        staggerAmounts: true,     // vary physics params slightly per entity
        colorChangeOnHover: true, // change color when calculating physics
        activeColor: '#ff4757',   // Color when displaced
        baseColor: '#ffffff'      // Default text color
    },

    // Grid / Layout settings (for background particles if added)
    grid: {
        spacing: 50,
        rows: 20,
        cols: 30
    },

    // Responsive Breakpoints
    breakpoints: {
        mobile: 768,
        tablet: 1024
    },

    // Debugging / performance
    debug: {
        logPerformance: false,
        showHitboxes: false
    }
};

/**
 * Helper to adjust config based on screen size
 */
function adjustConfigForScreenSize() {
    const width = window.innerWidth;
    if (width < AppConfig.breakpoints.mobile) {
        AppConfig.cursor.interactionRadius = 120;
        AppConfig.cursor.maxForce = 10;
        AppConfig.physics.springStiffness = 0.1; // Snappier on mobile
    } else {
        AppConfig.cursor.interactionRadius = 200;
        AppConfig.cursor.maxForce = 15;
    }
}

// Initial adjustment
adjustConfigForScreenSize();

// Export to global scope if needed (though it's a script tag, so it's already global)
window.AppConfig = AppConfig;
window.adjustConfigForScreenSize = adjustConfigForScreenSize;
