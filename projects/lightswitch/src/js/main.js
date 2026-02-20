/**
 * @file main.js
 * @description The central nervous system of the LightSwitch application.
 * 
 * ORCHESTRATION ARCHITECTURE:
 * This script serves as the 'Mediator'. It is responsible for bridging
 * user intent (DOM Events) with internal logic (State) and external 
 * feedback (Audio/Animation).
 * 
 * MODULE DEPENDENCIES:
 * - appState: The source of truth for current mode (Dark/Bright).
 * - audioEngine: Procedural sound synthesis using Web Audio API.
 * - animationController: UI/UX state synchronization.
 * - Logger/DOMUtils: Shared helpers from utils.js.
 * 
 * @author Antigravity
 * @version 1.1.0
 */

import { appState } from './state.js';
import { audioEngine } from './audio.js';
import { animationController } from './animation.js';
import { Logger, DOMUtils } from './utils.js';
import { initializeTests } from './tests.js';

/**
 * Encapsulates the core application logic to avoid global scope pollution.
 */
class LightSwitchApp {
    constructor() {
        /** 
         * Application health and readiness status.
         * @private 
         */
        this._isReady = false;

        /** 
         * Reference to the primary interaction element.
         * @private 
         */
        this._mainSwitch = null;

        /** 
         * Specialized logger for the Main module.
         * @private 
         */
        this._logger = new Logger("LightSwitch", "#00d4ff");

        /**
         * Tracks application uptime for metrics.
         * @private
         */
        this._startTime = Date.now();
    }

    /**
     * Entry point for application start.
     * Executes the initialization sequence in the correct priority order.
     */
    run() {
        this._logger.info("Booting System...");

        try {
            // 1. Locate critical UI elements
            this._mainSwitch = DOMUtils.qs('#main-switch');

            // 2. Setup internal wiring
            this._setupStateSubscriptions();
            this._bindInputEvents();
            this._performHealthCheck();

            // 3. Optional: Trigger internal test suite in development
            if (this._isDevelopmentMode()) {
                initializeTests();
            }

            // 4. Finalize
            this._isReady = true;
            this._logger.info(`System Ready. Uptime: ${((Date.now() - this._startTime) / 1000).toFixed(2)}s`);

            // Initial UI feedback
            this._logger.debug("Awaiting first user gesture to initialize AudioContext.");
        } catch (err) {
            this._logger.error("CRITICAL FAILURE during boot sequence.", err);
            this._reportHardwareIncompatibility(err.message);
        }
    }

    /**
     * Connects state changes to the various feedback modules.
     * Uses a reactive model to ensure synchronization.
     * @private
     */
    _setupStateSubscriptions() {
        this._logger.info("Registering Module Hooks...");

        appState.subscribe((isOn) => {
            // Priority 1: Audio Feedback (Immediate synthesis)
            audioEngine.playClick(isOn);

            // Priority 2: Visual Transitions (Coordinated DOM changes)
            animationController.updateUI(isOn);

            // Priority 3: Peripheral Updates (Meta data, tab title)
            this._syncDocumentTitle(isOn);
            this._logStateChange(isOn);
        });
    }

    /**
     * Mapping user input methods to state transitions.
     * Supports Mouse, Touch, and Keyboard (Accessibility).
     * @private
     */
    _bindInputEvents() {
        // Mouse/Touch Interaction
        this._mainSwitch.addEventListener('click', (e) => {
            this._logger.debug("Input Triggered: Click/Touch");
            this._handleUserInteraction();
        });

        // Keyboard Interaction (WCAG 2.1 Compliance)
        window.addEventListener('keydown', (e) => {
            if (this._isActivationKey(e.code)) {
                this._logger.debug(`Input Triggered: Keydown (${e.code})`);
                e.preventDefault(); // Prevent default browser actions (like scrolling)
                this._handleUserInteraction();
            }

            // Secret developer key combo: Shift + D for System Info
            if (e.shiftKey && e.code === 'KeyD') {
                this._showDeveloperDiagnostics();
            }
        });

        // ARIA attribute population for screen readers
        this._mainSwitch.setAttribute('role', 'button');
        this._mainSwitch.setAttribute('tabindex', '0');
        this._mainSwitch.setAttribute('aria-label', 'Toggle Light Switch');
    }

    /**
     * Unified handler for any toggle intent.
     * Validates state lock and handles lazy-initialization of Web Audio.
     * @private
     */
    _handleUserInteraction() {
        if (!this._isReady) {
            this._logger.warn("Interaction ignored: Application not ready.");
            return;
        }

        // Web Audio context must be resumed/created following a user gesture.
        // We notify the engine that a gesture has occurred.
        audioEngine.init();

        // Anti-Spam Check:
        // We transition to a 'locked' state during the background fade to prevent
        // rapid clicks from causing visual desync or audio clipping.
        if (appState.isTransitioning) {
            this._logger.warn("Rapid interaction detected. Input blocked by transition lock.");
            animationController.triggerFeedbackError();
            return;
        }

        appState.toggle();
    }

    /**
     * Logic to determine if a keypress should trigger the switch.
     * @private
     * @param {string} keyCode 
     * @returns {boolean}
     */
    _isActivationKey(keyCode) {
        return ['Space', 'Enter'].includes(keyCode);
    }

    /**
     * Updates the browser tab title to reflect the current ambiance.
     * @private
     * @param {boolean} isOn 
     */
    _syncDocumentTitle(isOn) {
        const titlePrefix = isOn ? "🔆 BRIGHT" : "🌑 DARK";
        document.title = `${titlePrefix} | LightSwitch`;
    }

    /**
     * Basic verification of required browser APIs.
     * Logs support matrix to console for debugging.
     * @private
     */
    _performHealthCheck() {
        const checks = {
            webAudio: !!(window.AudioContext || window.webkitAudioContext),
            cssVariables: window.CSS && window.CSS.supports && window.CSS.supports('--test', 0),
            localStorage: this._checkStorageAccess(),
            highResTime: !!performance.now
        };

        this._logger.info("Environment Compatibility Check:");
        console.table(checks);

        if (!checks.webAudio || !checks.cssVariables) {
            this._logger.warn("Environment lacks modern features. User experience may be degraded.");
        }
    }

    /**
     * Diagnostics tool for developers.
     * @private
     */
    _showDeveloperDiagnostics() {
        const history = appState.getHistory();
        const stats = {
            totalToggles: history.length - 1,
            uptime: `${((Date.now() - this._startTime) / 1000).toFixed(1)}s`,
            browser: navigator.userAgent.split(' ').pop()
        };

        console.group("%c[System Diagnostics]", "color: #ff00ff; font-weight: bold;");
        console.table(stats);
        console.log("Recent Interactions:", history);
        console.groupEnd();

        alert(`LightSwitch Diagnostics\n-------------------\nTotal Toggles: ${stats.totalToggles}\nUptime: ${stats.uptime}\nSee console for detailed log.`);
    }

    /**
     * Detects if the app is running in a development context.
     * @private
     */
    _isDevelopmentMode() {
        // Simple heuristic based on hostname
        return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    }

    /**
     * Helper to verify if browser allows storage access.
     * @private
     */
    _checkStorageAccess() {
        try {
            localStorage.setItem('__test__', '1');
            localStorage.removeItem('__test__');
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Formats state changes for the log history.
     * @private
     */
    _logStateChange(isOn) {
        const ambiance = isOn ? "Bright and energetic." : "Dark and minimalist.";
        this._logger.info(`Ambiance Shift: ${ambiance}`);
    }

    /**
     * Fallback UI in case of total failure (e.g. no JavaScript, no CSS Vars).
     * @private
     * @param {string} reason 
     */
    _reportHardwareIncompatibility(reason) {
        const body = document.body;
        body.innerHTML = `
            <div style="padding: 10%; text-align: center; font-family: 'Inter', sans-serif; background: #000; color: #fff; height: 100vh;">
                <h1>SYSTEM ERROR</h1>
                <p>Hardware Incompatibility Detected.</p>
                <p style="opacity: 0.5;">Reason: ${reason}</p>
                <button onclick="location.reload()" style="margin-top: 20px; background: transparent; color: #fff; border: 1px solid #fff; padding: 10px 20px; cursor: pointer;">RETRY BOOT</button>
            </div>
        `;
    }
}

/**
 * GLOBAL INITIALIZATION
 * ---------------------
 * We instantiate the app and attach it to the DOM lifecycle.
 */
const lightSwitch = new LightSwitchApp();

// Handle cross-browser DOM loading
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => lightSwitch.run());
} else {
    lightSwitch.run();
}

/**
 * PRODUCTION OVERRIDE:
 * In a production environment, we might want to suppress certain logs.
 * However, for this project, the logs are part of the 'satisfying' debug experience.
 */
window.toggleDebug = (enabled) => {
    window.__LS_DEBUG__ = enabled;
    console.log(`[LightSwitch] Debug Mode: ${enabled ? 'ON' : 'OFF'}`);
};
