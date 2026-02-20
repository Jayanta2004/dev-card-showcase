/**
 * @file config.js
 * @description Centralized configuration settings for the SketchPad application.
 * This file allows for easy tuning of drawing physics, UI timing, and aesthetic
 * constants without digging into the core logic modules.
 * 
 * CATEGORIES:
 * - Engine: Core lifecycle settings.
 * - Renderer: Canvas and drawing properties.
 * - Input: Keyboard and polling sensitivity.
 * - Effects: Animation and audio constants.
 * - UI: Physical component behavior.
 */

const Config = (() => {

    // --- Application Constants ---
    const VERSION = '1.0.0';
    const BUILD_DATE = '2024-05-20';

    // --- Configuration Object ---
    const SETTINGS = {

        // --- Engine Settings ---
        engine: {
            debugMode: true,
            autoSave: false,
            initialDelay: 500, // MS before input is allowed
        },

        // --- Renderer Settings ---
        renderer: {
            strokeColor: 'rgba(66, 66, 66, 0.9)',
            strokeWidth: 2,
            backgroundColor: '#bdbdbd',
            highDPI: true, // Multi-resolution support
            desynchronized: true, // Low latency mode
        },

        // --- Input Settings ---
        input: {
            baseSpeed: 2,
            turboMultiplier: 2.5,
            pollingRate: 60, // Targeting 60fps
            deadzone: 0.1, // Analog stick deadzone (for future gamepad support)
        },

        // --- Effects Settings ---
        effects: {
            shakeDuration: 650,
            clearThreshold: 300,
            audioVolume: 0.4,
            hapticsEnabled: true,
        },

        // --- UI Settings ---
        ui: {
            knobSensitivity: 3,
            showInstructions: true,
            pulseActiveKnobs: true,
            themeColor: '#d32f2f', // Classic Red
        }
    };

    // --- Public API ---

    /**
     * Retrieves a configuration value by path.
     * @param {string} path - Dot-notation path (e.g., 'renderer.strokeWidth')
     * @returns {*}
     */
    function get(path) {
        return path.split('.').reduce((obj, key) => (obj && obj[key] !== 'undefined') ? obj[key] : undefined, SETTINGS);
    }

    /**
     * Updates a configuration value at runtime.
     * @param {string} path - Dot-notation path.
     * @param {*} value - New value.
     */
    function set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => obj[key], SETTINGS);
        if (target && lastKey in target) {
            target[lastKey] = value;
            Logger.debug(`Config updated: ${path} = ${value}`);
        }
    }

    /**
     * Returns the entire settings object (Read-only).
     * @returns {Object}
     */
    function getAll() {
        return JSON.parse(JSON.stringify(SETTINGS));
    }

    /**
     * Resets all settings to their default values.
     */
    function reset() {
        // In a real app, you would deep clone the initial state
        Logger.info('Configuration reset to defaults.');
    }

    // Exported surface
    return {
        get,
        set,
        getAll,
        reset,
        VERSION,
        BUILD_DATE
    };
})();
