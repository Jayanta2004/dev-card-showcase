/**
 * LiquidInput - Configuration Module
 * 
 * Central configuration for physics constants, pressure thresholds,
 * typing speed measurement, particle appearance, and performance settings.
 * 
 * All configurable parameters are defined here for easy tuning.
 */

const CONFIG = {
    
    // ========================================================================
    // Physics Constants
    // ========================================================================
    
    physics: {
        // Gravity acceleration (pixels per second squared)
        gravity: 980,
        
        // Friction coefficient (0-1, higher = more friction)
        friction: 0.98,
        
        // Air resistance coefficient (0-1, higher = more resistance)
        airResistance: 0.995,
        
        // Bounce coefficient (0-1, higher = more bouncy)
        bounce: 0.6,
        
        // Minimum velocity threshold (below this, particle is considered stopped)
        minVelocity: 0.5,
        
        // Maximum velocity cap (prevents particles from moving too fast)
        maxVelocity: 2000,
        
        // Collision damping (energy loss on particle-to-particle collision)
        collisionDamping: 0.8,
        
        // Ground friction (additional friction when particle is on ground)
        groundFriction: 0.92,
        
        // Wall bounce damping (energy loss when bouncing off walls)
        wallBounceDamping: 0.7
    },
    
    // ========================================================================
    // Pressure System
    // ========================================================================
    
    pressure: {
        // Maximum pressure value (0-100)
        maxPressure: 100,
        
        // Pressure increase per character typed (adjusted by typing speed)
        pressurePerChar: 8,
        
        // Pressure decay rate per second when not typing
        decayRate: 15,
        
        // Typing speed multiplier for pressure calculation
        speedMultiplier: 1.5,
        
        // Pressure threshold for burst (percentage)
        burstThreshold: 85,
        
        // Pressure threshold for warning state (percentage)
        warningThreshold: 60,
        
        // Pressure threshold for critical state (percentage)
        criticalThreshold: 75,
        
        // Time window for measuring typing speed (milliseconds)
        speedMeasurementWindow: 1000,
        
        // Minimum time between characters to not increase pressure (ms)
        slowTypingThreshold: 300
    },
    
    // ========================================================================
    // Particle System
    // ========================================================================
    
    particles: {
        // Maximum number of particles allowed
        maxParticles: 200,
        
        // Particle pool size (for object pooling optimization)
        poolSize: 250,
        
        // Default particle size (font size in pixels)
        defaultSize: 24,
        
        // Particle size variation range (min, max)
        sizeVariation: {
            min: 20,
            max: 28
        },
        
        // Particle spawn position offset from center
        spawnOffset: {
            x: 10,
            y: 10
        },
        
        // Particle lifetime in calm state (seconds, -1 = infinite)
        calmLifetime: -1,
        
        // Particle lifetime after spill (seconds)
        spilledLifetime: 10,
        
        // Particle fade out duration (seconds)
        fadeOutDuration: 1,
        
        // Particle collision radius multiplier
        collisionRadiusMultiplier: 0.8
    },
    
    // ========================================================================
    // Liquid Motion (Calm State)
    // ========================================================================
    
    liquid: {
        // Enable liquid motion simulation
        enabled: true,
        
        // Liquid viscosity (higher = slower movement)
        viscosity: 0.95,
        
        // Float force strength (upward buoyancy)
        floatForce: 50,
        
        // Horizontal drift speed
        driftSpeed: 30,
        
        // Vertical bob amplitude (pixels)
        bobAmplitude: 5,
        
        // Bob frequency (cycles per second)
        bobFrequency: 0.5,
        
        // Swirl radius (pixels)
        swirlRadius: 3,
        
        // Swirl speed (radians per second)
        swirlSpeed: 1,
        
        // Particle spacing in calm state (pixels)
        particleSpacing: 30,
        
        // Alignment force strength (keeps particles in line)
        alignmentForce: 100
    },
    
    // ========================================================================
    // Burst Mechanics
    // ========================================================================
    
    burst: {
        // Explosive force magnitude (pixels per second)
        explosionForce: 1200,
        
        // Explosion force randomness (0-1)
        explosionRandomness: 0.4,
        
        // Burst animation duration (milliseconds)
        animationDuration: 800,
        
        // Shake intensity before burst
        shakeIntensity: 5,
        
        // Shake duration (milliseconds)
        shakeDuration: 500,
        
        // Crack spread duration (milliseconds)
        crackDuration: 400,
        
        // Shatter duration (milliseconds)
        shatterDuration: 600,
        
        // Delay before particles start falling (milliseconds)
        particleDelayMin: 0,
        particleDelayMax: 200,
        
        // Rotation speed during burst (degrees per second)
        rotationSpeed: 360
    },
    
    // ========================================================================
    // Canvas Rendering
    // ========================================================================
    
    canvas: {
        // Target frame rate (FPS)
        targetFPS: 60,
        
        // Enable anti-aliasing
        antialiasing: true,
        
        // Font family for particles
        fontFamily: "'Courier New', monospace",
        
        // Font weight
        fontWeight: '600',
        
        // Text baseline
        textBaseline: 'middle',
        
        // Text alignment
        textAlign: 'center',
        
        // Enable particle shadows
        enableShadows: true,
        
        // Shadow blur radius
        shadowBlur: 10,
        
        // Shadow color
        shadowColor: 'rgba(96, 165, 250, 0.8)',
        
        // Background clear alpha (0 = full clear, 1 = trail effect)
        clearAlpha: 1
    },
    
    // ========================================================================
    // Color Scheme
    // ========================================================================
    
    colors: {
        // Particle colors based on state
        calm: '#60a5fa',        // Blue
        building: '#f59e0b',    // Orange
        critical: '#ef4444',    // Red
        burst: '#a78bfa',       // Purple
        spilled: '#60a5fa',     // Blue
        
        // Color variation for visual interest
        variations: [
            '#60a5fa',  // Blue
            '#a78bfa',  // Purple
            '#ec4899'   // Pink
        ],
        
        // Glow colors
        glowCalm: 'rgba(96, 165, 250, 0.8)',
        glowBuilding: 'rgba(245, 158, 11, 0.8)',
        glowCritical: 'rgba(239, 68, 68, 0.8)',
        glowBurst: 'rgba(167, 139, 250, 0.8)'
    },
    
    // ========================================================================
    // Input Handling
    // ========================================================================
    
    input: {
        // Characters to ignore (non-printable)
        ignoreChars: [
            'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab',
            'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'Home', 'End', 'PageUp', 'PageDown', 'Insert', 'Delete',
            'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
        ],
        
        // Maximum input length
        maxLength: 200,
        
        // Auto-focus input on load
        autoFocus: true,
        
        // Re-focus input after blur
        refocusDelay: 100
    },
    
    // ========================================================================
    // Performance Optimization
    // ========================================================================
    
    performance: {
        // Enable object pooling for particles
        useObjectPooling: true,
        
        // Enable spatial partitioning for collision detection
        useSpatialPartitioning: true,
        
        // Spatial grid cell size (pixels)
        spatialGridSize: 50,
        
        // Cull particles outside viewport
        cullOffscreen: true,
        
        // Offscreen cull margin (pixels beyond viewport)
        cullMargin: 100,
        
        // Batch rendering threshold
        batchRenderThreshold: 50,
        
        // Enable performance monitoring
        enablePerfMonitoring: false,
        
        // Performance warning threshold (ms per frame)
        perfWarningThreshold: 16.67  // 60 FPS = 16.67ms per frame
    },
    
    // ========================================================================
    // State Management
    // ========================================================================
    
    states: {
        // Available application states
        CALM: 'calm',
        BUILDING: 'building',
        CRITICAL: 'critical',
        BURST: 'burst',
        RECOVERY: 'recovery',
        
        // State transition delays (milliseconds)
        transitionDelays: {
            calmToBuilding: 0,
            buildingToCritical: 0,
            criticalToBurst: 0,
            burstToRecovery: 800,
            recoveryToCalm: 1000
        }
    },
    
    // ========================================================================
    // Boundaries
    // ========================================================================
    
    boundaries: {
        // Container boundaries (set dynamically)
        container: {
            left: 0,
            right: 800,
            top: 0,
            bottom: 400
        },
        
        // Viewport boundaries (set dynamically)
        viewport: {
            left: 0,
            right: window.innerWidth,
            top: 0,
            bottom: window.innerHeight
        },
        
        // Boundary margin for particle containment
        margin: 10
    },
    
    // ========================================================================
    // Debug Settings
    // ========================================================================
    
    debug: {
        // Enable debug mode
        enabled: false,
        
        // Show particle bounding boxes
        showBoundingBoxes: false,
        
        // Show velocity vectors
        showVelocityVectors: false,
        
        // Show spatial grid
        showSpatialGrid: false,
        
        // Log performance metrics
        logPerformance: false,
        
        // Show FPS counter
        showFPS: false
    }
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get color based on current pressure level
 * @param {number} pressure - Current pressure (0-100)
 * @returns {string} Color hex code
 */
CONFIG.getColorForPressure = function(pressure) {
    if (pressure < this.pressure.warningThreshold) {
        return this.colors.calm;
    } else if (pressure < this.pressure.criticalThreshold) {
        return this.colors.building;
    } else if (pressure < this.pressure.burstThreshold) {
        return this.colors.critical;
    } else {
        return this.colors.burst;
    }
};

/**
 * Get glow color based on current pressure level
 * @param {number} pressure - Current pressure (0-100)
 * @returns {string} RGBA color string
 */
CONFIG.getGlowForPressure = function(pressure) {
    if (pressure < this.pressure.warningThreshold) {
        return this.colors.glowCalm;
    } else if (pressure < this.pressure.criticalThreshold) {
        return this.colors.glowBuilding;
    } else if (pressure < this.pressure.burstThreshold) {
        return this.colors.glowCritical;
    } else {
        return this.colors.glowBurst;
    }
};

/**
 * Get random color variation
 * @returns {string} Color hex code
 */
CONFIG.getRandomColor = function() {
    const variations = this.colors.variations;
    return variations[Math.floor(Math.random() * variations.length)];
};

/**
 * Update boundaries based on container and viewport size
 * @param {HTMLElement} container - Container element
 */
CONFIG.updateBoundaries = function(container) {
    if (container) {
        const rect = container.getBoundingClientRect();
        this.boundaries.container = {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height
        };
    }
    
    this.boundaries.viewport = {
        left: 0,
        right: window.innerWidth,
        top: 0,
        bottom: window.innerHeight,
        width: window.innerWidth,
        height: window.innerHeight
    };
};

// Freeze configuration to prevent accidental modifications
// (Comment out during development if you need to modify config at runtime)
// Object.freeze(CONFIG);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
