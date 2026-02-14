/**
 * main.js
 * 
 * Main orchestration script for ShyText.
 * Bootstraps the application, initializes all modules, 
 * and maintains the high-performance animation loop.
 * 
 * @module Main
 */

import { CONFIG } from './config.js';
import { STATE, setAppPaused } from './state.js';
import { initInputListeners } from './input.js';
import { ProximityEngine } from './proximity.js';
import { UIRenderer } from './ui.js';
import { AmbientFX } from './fx.js';
import { Logger } from './logger.js';
import { Audio } from './audio.js';
import { Theme } from './theme.js';
import { WhisperLog } from './whisper.js';

/**
 * The Controller class manages the interaction loop.
 */
class ApplicationController {
    constructor() {
        this.proximity = new ProximityEngine();
        this.ui = new UIRenderer(this);
        this.fx = new AmbientFX('ambient-canvas');
        this.whisper = new WhisperLog('whisper-container');

        this.lastFrameTime = 0;
        this.isInitialized = false;
        this.interactionStarted = false;
    }

    /**
     * Starts the application.
     */
    async start() {
        Logger.system("ShyText System Initializing...");

        // Initialize Listeners
        initInputListeners();

        // Initialize Theme
        Theme.setTheme('nervous');

        // Initial Calibration
        this.proximity.refreshTargets();

        // Final UI adjustments
        this.ui.showIntro();

        // Start Loop
        this.isInitialized = true;
        requestAnimationFrame(this.loop.bind(this));

        Logger.info("ShyText Engine: Online.");

        // Event listener for user interaction to start audio
        document.addEventListener('mousedown', (e) => this.handleFirstInteraction(e), { once: true });
        document.addEventListener('keydown', (e) => this.handleFirstInteraction(e), { once: true });
    }

    /**
     * Handles the first interaction to unlock audio and other protected APIs.
     */
    async handleFirstInteraction(e) {
        if (this.interactionStarted) return;
        this.interactionStarted = true;

        await Audio.init();

        if (e && e.key && e.key.toLowerCase() === 'm') {
            Logger.info("Audio unlocked via 'M' key.");
        } else {
            Audio.setMute(false);
            Logger.info("Audio unlocked and enabled.");
        }
    }

    /**
     * Core Animation Loop (Heartbeat of the app)
     * 
     * @param {number} timestamp - Current clock time
     */
    loop(timestamp) {
        if (STATE.lifecycle.isPaused || STATE.lifecycle.isBackgrounded) {
            requestAnimationFrame(this.loop.bind(this));
            return;
        }

        // Throttle updates based on config for power efficiency
        const elapsed = timestamp - this.lastFrameTime;
        if (elapsed < CONFIG.VISUALS.UPDATE_INTERVAL) {
            requestAnimationFrame(this.loop.bind(this));
            return;
        }

        this.lastFrameTime = timestamp;

        try {
            // 1. Calculate Proximity
            const targetStates = this.proximity.update();

            // 2. Render Visual Updates to Text
            this.ui.render(targetStates);

            // 3. Update Ambient Background
            // Use the maximum proximity from all targets for the background intensity
            const maxProx = targetStates.reduce((max, t) => Math.max(max, t.currentProximity), 0);
            this.fx.update(maxProx);

            // 4. Update Audio Tension
            Audio.update(maxProx);

            // 5. Update Whispers
            this.whisper.update(maxProx);

        } catch (error) {
            Logger.error("ShyText Engine Fault:", error);
            // Attempt to recover by recalibrating
            this.proximity.recalibrate();
        }

        requestAnimationFrame(this.loop.bind(this));
    }

    /**
     * Diagnostic report for the session.
     */
    getStats() {
        return {
            fps: Math.round(1000 / CONFIG.VISUALS.UPDATE_INTERVAL),
            targets: this.proximity.targets.length,
            cursor: `${STATE.cursor.x}, ${STATE.cursor.y}`
        };
    }
}

// Instantiate and start the application
const App = new ApplicationController();

// Boot on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    App.start().catch(err => {
        console.error("Critical Boot Error:", err);
    });
});

// Expose debug tools if configured
if (CONFIG.DEBUG) {
    window.SHYTEXT_DEBUG = App;
}

/**
 * Architectural Note: Module Pattern
 * 
 * We use a clean separation of concerns:
 * - config.js: Static parameters
 * - state.js: Mutable global state
 * - input.js: DOM event harvesting
 * - proximity.js: Mathematical analysis
 * - ui.js: DOM mutation (Output)
 * - fx.js: Canvas rendering (Output)
 * - main.js: Loop control and synchronization
 * 
 * This ensures that as complexity grows, the codebase remains 
 * manageable and performant. With current optimizations, 
 * the engine handles 60fps even with complex blur filters.
 */
