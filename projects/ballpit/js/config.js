/**
 * config.js
 * Comprehensive configuration for the BallPit simulation.
 * Contains both architectural constants and environment-specific parameters.
 */

const CONFIG = {
    // -------------------------------------------------------------------------
    // RENDER SETTINGS
    // -------------------------------------------------------------------------
    DPI_SCALE: window.devicePixelRatio || 1,
    SUBSTEPS: 8,           // Higher values = more stable physics but higher CPU load
    FPS_TARGET: 60,        // Target frequency for the render loop

    // -------------------------------------------------------------------------
    // PHYSICS CONSTANTS
    // -------------------------------------------------------------------------
    GRAVITY: 0.98,         // Standard earth gravity
    FRICTION: 0.992,       // Air resistance / Velocity decay per frame
    BOUNCE: 0.75,          // Restitution for wall collisions (0.0 to 1.0)
    COLLISION_BOUNCE: 0.9, // Restitution for ball-to-ball impacts

    // -------------------------------------------------------------------------
    // ENTITY PROPERTIES
    // -------------------------------------------------------------------------
    MIN_RADIUS: 8,         // Smallest possible ball radius in pixels
    MAX_RADIUS: 24,        // Largest possible ball radius in pixels
    BALL_COUNT: 500,       // Default number of balls on startup

    // -------------------------------------------------------------------------
    // INTERACTION CONSTANTS
    // -------------------------------------------------------------------------
    MOUSE_FORCE: 0.25,      // Strength of the "stirring" effect
    STIR_RADIUS: 120,       // Distance at which mouse movement affects balls
    GRAVITY_WELL_FORCE: 1.2,// Sucking strength of the Gravity Well
    GRAVITY_WELL_RADIUS: 450,// Reach of the Gravity Well attraction
    GRAB_DISTANCE: 40,      // Maximum distance to grab a ball from its center

    // -------------------------------------------------------------------------
    // VISUAL FEEDBACK
    // -------------------------------------------------------------------------
    PARTICLE_LIFE: 35,      // Lifecycle of collision sparks in frames
    HEATMAP_VELOCITY_THRESHOLD: 12, // Speed above which balls start to "glow"
    GLOW_INTENSITY: 1.5,    // Scaling factor for velocity glowing

    // -------------------------------------------------------------------------
    // AESTHETIC PALETTE
    // -------------------------------------------------------------------------
    PALETTE: [
        '#38bdf8', // Cyber Blue
        '#818cf8', // Indigo Dream
        '#c084fc', // Vibrant Purple
        '#fb7185', // Rose Petal
        '#fb923c', // Sunset Orange
        '#facc15', // Neon Yellow
        '#4ade80', // Emerald Green
        '#2dd4bf', // Seafoam Teal
        '#e2e8f0', // Mist White
        '#64748b'  // Slate Gray
    ],

    // -------------------------------------------------------------------------
    // ENVIRONMENT PRESETS
    // Defines how physical constants shift in different modes.
    // -------------------------------------------------------------------------
    ENVIRONMENTS: {
        earth: {
            gravity: 0.98,
            friction: 0.992,
            label: "Earth - Standard Physics",
            color: "#38bdf8"
        },
        space: {
            gravity: 0,
            friction: 0.9995, // Near zero vacuum friction
            label: "Space - Zero Gravity",
            color: "#6366f1"
        },
        jupiter: {
            gravity: 2.8,    // Intense downward pull
            friction: 0.985,
            label: "Jupiter - High Gravity",
            color: "#f59e0b"
        },
        ocean: {
            gravity: 0.25,   // Buoyancy effect
            friction: 0.91,  // High water viscosity/drag
            label: "Ocean - Underwater",
            color: "#0ea5e9"
        }
    }
};

/**
 * STATE Object
 * Tracks the mutable, real-time status of the simulation.
 */
const STATE = {
    // Current Sim Values
    currentGravity: CONFIG.GRAVITY,
    currentFriction: CONFIG.FRICTION,
    ballCount: CONFIG.BALL_COUNT,
    activeEnvironment: 'earth',

    // Feature Toggles
    showHeatmap: true,
    showParticles: true,
    gravityWellActive: false,

    // Interaction Data
    mouseX: 0,
    mouseY: 0,
    isMouseDown: false,
    grabbedBall: null,

    // Screen Metrics
    screenW: window.innerWidth,
    screenH: window.innerHeight,

    // Performance Statistics
    stats: {
        fps: 0,
        collisions: 0,
        totalCollisionsEver: 0,
        frames: 0,
        lastTime: performance.now()
    }
};

/**
 * Note on Logic Requirements:
 * The separation of CONFIG and STATE allows the physics engine 
 * to remain pure while the UI and Main loop modify simulation behavior 
 * dynamically without hard-coding values into the logic modules.
 */
