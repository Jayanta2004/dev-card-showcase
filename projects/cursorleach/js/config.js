/**
 * CursorLeech Configuration
 * Central configuration for all game mechanics and visual parameters
 */

const CONFIG = {
    
    // Parasite Visual Settings
    parasite: {
        size: 10,                    // Base size in pixels
        color: '#ff0000',            // Primary color (red)
        glowColor: '#ff3333',        // Glow effect color
        pulseColor: '#ff6666',       // Pulse animation color
        coreOpacity: 1.0,            // Core opacity
        glowOpacity: 0.6,            // Glow opacity
        pulseOpacity: 0.3,           // Pulse opacity
        shadowBlur: 20,              // Shadow blur radius
        shadowSpread: 5,             // Shadow spread
        zIndex: 9998                 // Layer position
    },
    
    // Parasite Physics & Movement
    parasitePhysics: {
        maxSpeed: 8,                 // Maximum speed (pixels per frame)
        minSpeed: 0.5,               // Minimum speed threshold
        acceleration: 0.15,          // Acceleration rate
        deceleration: 0.92,          // Deceleration multiplier
        interpolationSpeed: 0.08,    // Base interpolation (lerp) factor
        adaptiveSpeed: true,         // Enable adaptive speed based on distance
        speedBoost: 1.5,             // Speed multiplier when far from cursor
        speedBoostDistance: 200,     // Distance threshold for speed boost
        easing: 'quadratic',         // Easing function: 'linear', 'quadratic', 'cubic'
        unpredictability: 0.02,      // Random variation factor (0-1)
        smoothingFactor: 0.15,       // Movement smoothing
        arrivalRadius: 15,           // Slow down when within this radius
        arrivalDamping: 0.5          // Speed reduction near target
    },
    
    // Cursor Settings
    cursor: {
        size: 12,                    // Custom cursor size
        color: '#ffffff',            // Cursor color
        ringSize: 24,                // Outer ring size
        ringColor: '#ffffff',        // Ring color
        ringOpacity: 0.3,            // Ring opacity
        hideNativeCursor: true,      // Hide system cursor
        smoothing: 0.2,              // Cursor movement smoothing
        zIndex: 9999                 // Layer position (above parasite)
    },
    
    // Attachment Mechanics
    attachment: {
        detectionRadius: 12,         // Distance for attachment trigger
        attachmentDelay: 150,        // Milliseconds before full attachment
        touchFrames: 3,              // Consecutive frames needed for attachment
        attachmentStrength: 1.0,     // Initial attachment strength
        strengthDecay: 0.002,        // Strength decay per frame when not touching
        strengthGrowth: 0.05,        // Strength growth per frame when touching
        minStrength: 0.0,            // Minimum attachment strength
        maxStrength: 1.0,            // Maximum attachment strength
        detachmentThreshold: 0.1,    // Strength below which parasite detaches
        vibrationIntensity: 2,       // Parasite vibration when attached
        vibrationFrequency: 0.1      // Vibration speed
    },
    
    // Resistance System (Cursor Lag/Inertia)
    resistance: {
        enabled: true,               // Enable resistance when attached
        baseResistance: 0.4,         // Base resistance factor (0-1)
        maxResistance: 0.8,          // Maximum resistance
        resistanceGrowth: 0.01,      // Resistance increase per frame
        resistanceDecay: 0.05,       // Resistance decrease per frame
        inertiaFactor: 0.3,          // Cursor inertia/lag factor
        dampingFactor: 0.7,          // Damping for cursor velocity
        smoothingIterations: 3,      // Smoothing iterations for lag effect
        visualFeedback: true,        // Show visual feedback for resistance
        cursorOffsetMax: 15,         // Maximum cursor visual offset
        elasticity: 0.15             // Elastic return factor
    },
    
    // Detachment Mechanics
    detachment: {
        velocityThreshold: 15,       // Minimum velocity for detachment attempt
        jerkThreshold: 2.5,          // Jerk (rate of acceleration change) threshold
        directionChangeThreshold: 0.7, // Direction change threshold (dot product)
        rapidMovementDuration: 300,  // Milliseconds of rapid movement needed
        erraticThreshold: 3,         // Number of direction changes needed
        detachmentChance: 0.15,      // Chance per frame when conditions met
        cooldownTime: 100,           // Cooldown between detachment attempts (ms)
        velocityDecayFactor: 0.95,   // Velocity history decay
        historySize: 10              // Number of frames to track for analysis
    },
    
    // State Management
    states: {
        FREE: 'free',                // Parasite is separate from cursor
        APPROACHING: 'approaching',  // Parasite is moving toward cursor
        TOUCHING: 'touching',        // Parasite is in contact but not attached
        ATTACHED: 'attached',        // Parasite is fully attached
        DETACHING: 'detaching'       // Parasite is being shaken off
    },
    
    // Performance Settings
    performance: {
        targetFPS: 60,               // Target frames per second
        frameInterval: 1000 / 60,    // Frame interval in milliseconds
        useRAF: true,                // Use requestAnimationFrame
        enableCanvas: true,          // Enable canvas effects
        canvasAlpha: true,           // Canvas transparency
        maxParticles: 50,            // Maximum particle count for effects
        particleLifetime: 1000       // Particle lifetime in milliseconds
    },
    
    // Visual Effects
    effects: {
        enableGlow: true,            // Enable glow effects
        enablePulse: true,           // Enable pulse animations
        enableTrail: false,          // Enable parasite trail
        enableParticles: true,       // Enable particle effects
        glowIntensity: 1.0,          // Glow intensity multiplier
        pulseSpeed: 2000,            // Pulse animation duration (ms)
        trailLength: 10,             // Trail segments
        trailFade: 0.9,              // Trail fade factor
        attachmentGlowColor: '#ff6600', // Glow color when attached
        detachmentParticles: 20,     // Particles on detachment
        screenShake: true,           // Enable screen shake on attachment
        shakeIntensity: 3,           // Shake intensity in pixels
        shakeDuration: 300           // Shake duration in milliseconds
    },
    
    // UI Settings
    ui: {
        showInstructions: true,      // Show instructions overlay
        showStatus: true,            // Show status panel
        showDebug: false,            // Show debug panel (toggle with 'D' key)
        statusUpdateInterval: 100,   // Status update frequency (ms)
        fadeInstructions: true,      // Fade out instructions after time
        instructionFadeDelay: 5000,  // Delay before fading instructions
        fontSize: 14,                // Base font size
        panelOpacity: 0.9,           // UI panel opacity
        animationSpeed: 300          // UI animation speed (ms)
    },
    
    // Debug & Development
    debug: {
        logPhysics: false,           // Log physics calculations
        logState: false,             // Log state changes
        logAttachment: false,        // Log attachment events
        logDetachment: false,        // Log detachment events
        visualDebug: false,          // Show visual debug indicators
        showHitboxes: false,         // Show collision hitboxes
        showVectors: false,          // Show velocity vectors
        performanceMonitor: false    // Monitor and log performance
    },
    
    // Audio Settings (for future expansion)
    audio: {
        enabled: false,              // Enable audio (not implemented)
        attachmentSound: true,       // Play sound on attachment
        detachmentSound: true,       // Play sound on detachment
        ambientSound: false,         // Background ambient sound
        volume: 0.5                  // Master volume
    },
    
    // Gameplay Tuning
    gameplay: {
        initialDelay: 1000,          // Delay before parasite starts moving (ms)
        spawnDistance: 300,          // Initial spawn distance from cursor
        respawnOnDetach: false,      // Respawn far away on detachment
        difficultyScale: 1.0,        // Global difficulty multiplier
        adaptiveDifficulty: false,   // Adjust difficulty based on performance
        maxAttachmentTime: null,     // Max attachment duration (null = infinite)
        warningDistance: 50          // Distance to show warning
    }
    
};

// Freeze configuration to prevent accidental modification
Object.freeze(CONFIG);

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
