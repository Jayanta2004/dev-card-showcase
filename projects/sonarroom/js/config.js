/**
 * SonarRoom - Configuration
 * Central configuration file for all application constants and parameters
 */

const CONFIG = {
    // ============================================
    // Audio Configuration
    // ============================================
    audio: {
        // Oscillator settings
        oscillatorType: 'sine', // sine, square, sawtooth, triangle

        // Frequency range (Hz) - maps to distance
        minFrequency: 200,      // Far from target
        maxFrequency: 2000,     // Very close to target

        // Ping duration (seconds)
        pingDuration: 0.08,     // Short, sharp ping

        // Volume settings
        masterVolume: 0.3,      // Overall volume (0.0 - 1.0)
        minVolume: 0.1,         // Minimum ping volume
        maxVolume: 0.4,         // Maximum ping volume

        // Envelope settings (ADSR)
        attackTime: 0.01,       // Attack phase duration
        decayTime: 0.05,        // Decay phase duration
        sustainLevel: 0.7,      // Sustain level (0.0 - 1.0)
        releaseTime: 0.02,      // Release phase duration

        // Stereo panning
        enablePanning: true,    // Enable spatial audio
        panningStrength: 0.8,   // Panning intensity (0.0 - 1.0)

        // Performance settings
        maxOscillators: 10,     // Maximum concurrent oscillators
        oscillatorPoolSize: 5,  // Pre-allocated oscillator pool
    },

    // ============================================
    // Distance & Proximity Configuration
    // ============================================
    distance: {
        // Target detection radius (pixels)
        successRadius: 40,      // Click within this radius to succeed

        // Distance normalization
        maxDistance: 1500,      // Maximum trackable distance (pixels)

        // Proximity zones (normalized 0-1)
        zones: {
            veryClose: 0.1,     // < 10% of max distance
            close: 0.25,        // < 25% of max distance
            medium: 0.5,        // < 50% of max distance
            far: 0.75,          // < 75% of max distance
            veryFar: 1.0        // >= 75% of max distance
        },

        // Mapping curves
        frequencyExponent: 2.0, // Exponential curve for frequency (higher = more dramatic)
        intervalExponent: 1.5,  // Exponential curve for ping interval
    },

    // ============================================
    // Timing Configuration
    // ============================================
    timing: {
        // Ping interval range (milliseconds)
        minPingInterval: 50,    // Very close to target (rapid pings)
        maxPingInterval: 800,   // Far from target (slow pings)

        // Throttling
        mouseMoveThrottle: 16,  // ~60fps throttle for mouse movement

        // Transition durations (milliseconds)
        overlayFadeIn: 600,
        overlayFadeOut: 400,
        successDelay: 1500,     // Delay before showing success screen

        // Debouncing
        clickDebounce: 300,     // Prevent rapid clicking
    },

    // ============================================
    // Target Configuration
    // ============================================
    target: {
        // Size
        width: 80,              // Target width (pixels)
        height: 80,             // Target height (pixels)

        // Placement constraints
        marginFromEdge: 100,    // Minimum distance from viewport edges

        // Random placement
        randomize: true,        // Randomize position on each game

        // Visual debug mode
        debugVisible: false,    // Show target outline (for testing)
    },

    // ============================================
    // UI Configuration
    // ============================================
    ui: {
        // Proximity indicator
        showProximityBar: true, // Show visual proximity indicator
        proximityThreshold: 0.5, // Show indicator when closer than this (normalized)

        // Audio status indicator
        showAudioStatus: true,  // Show audio active indicator

        // Canvas feedback
        enableCanvasFeedback: true, // Enable visual sonar pings on canvas
        canvasOpacity: 0.3,     // Canvas layer opacity

        // Overlay behavior
        autoHideInstructions: true, // Hide instructions on first mouse move

        // Stats tracking
        trackStats: true,       // Track time, movements, accuracy
    },

    // ============================================
    // Performance Configuration
    // ============================================
    performance: {
        // Canvas rendering
        canvasUpdateInterval: 100, // Update canvas every N ms
        maxCanvasParticles: 20,    // Maximum particles on canvas

        // Memory management
        enableGarbageCollection: true, // Clean up unused resources
        gcInterval: 5000,              // Garbage collection interval (ms)

        // Browser compatibility
        fallbackToSimpleAudio: true, // Use simpler audio if Web Audio API fails
    },

    // ============================================
    // Game Logic Configuration
    // ============================================
    game: {
        // States
        states: {
            IDLE: 'idle',
            EXPLORING: 'exploring',
            SUCCESS: 'success',
            PAUSED: 'paused'
        },

        // Initial state
        initialState: 'idle',

        // Success behavior
        onSuccess: {
            showStats: true,        // Display performance stats
            playSuccessSound: true, // Play success audio cue
            resetOnRestart: true,   // Generate new target on restart
        },

        // Difficulty (future expansion)
        difficulty: 'normal',       // easy, normal, hard
    },

    // ============================================
    // Debug Configuration
    // ============================================
    debug: {
        // Logging
        enableLogging: false,       // Console logging
        logLevel: 'info',           // error, warn, info, debug

        // Visual debugging
        showTargetOutline: false,   // Show target border
        showDistanceLines: false,   // Draw line from cursor to target
        showCoordinates: false,     // Display cursor coordinates

        // Performance monitoring
        showFPS: false,             // Display FPS counter
        showMemoryUsage: false,     // Display memory usage
    },

    // ============================================
    // Accessibility Configuration
    // ============================================
    accessibility: {
        // Keyboard navigation
        enableKeyboardControls: true,

        // Screen reader support
        announceProximity: false,    // Announce proximity changes

        // Reduced motion
        respectReducedMotion: true,  // Honor prefers-reduced-motion
    },
};

// ============================================
// Derived Constants (calculated from config)
// ============================================

CONFIG.derived = {
    // Calculate target center offset
    targetCenterOffsetX: CONFIG.target.width / 2,
    targetCenterOffsetY: CONFIG.target.height / 2,

    // Calculate safe placement bounds
    minX: CONFIG.target.marginFromEdge,
    minY: CONFIG.target.marginFromEdge,
    maxX: window.innerWidth - CONFIG.target.marginFromEdge - CONFIG.target.width,
    maxY: window.innerHeight - CONFIG.target.marginFromEdge - CONFIG.target.height,

    // Frequency range
    frequencyRange: CONFIG.audio.maxFrequency - CONFIG.audio.minFrequency,

    // Interval range
    intervalRange: CONFIG.timing.maxPingInterval - CONFIG.timing.minPingInterval,
};

// ============================================
// Configuration Validation
// ============================================

/**
 * Validates configuration values
 * @returns {boolean} True if config is valid
 */
CONFIG.validate = function () {
    const errors = [];

    // Validate audio settings
    if (this.audio.minFrequency >= this.audio.maxFrequency) {
        errors.push('Audio: minFrequency must be less than maxFrequency');
    }

    if (this.audio.masterVolume < 0 || this.audio.masterVolume > 1) {
        errors.push('Audio: masterVolume must be between 0 and 1');
    }

    // Validate timing settings
    if (this.timing.minPingInterval >= this.timing.maxPingInterval) {
        errors.push('Timing: minPingInterval must be less than maxPingInterval');
    }

    // Validate target settings
    if (this.target.width <= 0 || this.target.height <= 0) {
        errors.push('Target: width and height must be positive');
    }

    // Log errors if any
    if (errors.length > 0 && this.debug.enableLogging) {
        console.error('Configuration validation failed:', errors);
        return false;
    }

    return true;
};

// ============================================
// Configuration Update Methods
// ============================================

/**
 * Updates configuration dynamically
 * @param {string} path - Dot-notation path (e.g., 'audio.masterVolume')
 * @param {*} value - New value
 */
CONFIG.set = function (path, value) {
    const keys = path.split('.');
    let obj = this;

    for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
    }

    obj[keys[keys.length - 1]] = value;

    if (this.debug.enableLogging) {
        console.log(`Config updated: ${path} = ${value}`);
    }
};

/**
 * Gets configuration value
 * @param {string} path - Dot-notation path
 * @returns {*} Configuration value
 */
CONFIG.get = function (path) {
    const keys = path.split('.');
    let obj = this;

    for (const key of keys) {
        obj = obj[key];
        if (obj === undefined) return undefined;
    }

    return obj;
};

// ============================================
// Export Configuration
// ============================================

// Freeze config to prevent accidental modifications
// (use CONFIG.set() for intentional updates)
if (Object.freeze) {
    Object.freeze(CONFIG.audio);
    Object.freeze(CONFIG.distance);
    Object.freeze(CONFIG.timing);
    Object.freeze(CONFIG.target);
    Object.freeze(CONFIG.ui);
    Object.freeze(CONFIG.performance);
    Object.freeze(CONFIG.game);
    Object.freeze(CONFIG.debug);
    Object.freeze(CONFIG.accessibility);
}

// Validate on load
if (CONFIG.debug.enableLogging) {
    console.log('Configuration loaded:', CONFIG);
    CONFIG.validate();
}
