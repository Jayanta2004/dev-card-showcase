/**
 * @file animation.js
 * @description Advanced UI orchestration and transition management for LightSwitch.
 * 
 * VISUAL DESIGN STRATEGY:
 * The application relies on 'Perceptual Continuity'. When a user toggles the switch,
 * multiple properties must change in perfect synchronization to maintain the 
 * illusion of a physical light turning on/off in a room.
 * 
 * COORDINATED ELEMENTS:
 * 1. Body Background: Fade between deep black and warm white.
 * 2. Status Typography: Morphing text and opacity shifts.
 * 3. Switch Track: Subtle depth and color change.
 * 4. Glow Backdrop: Radial gradient intensity modulation.
 * 5. Document Meta: Theme color updates for mobile browsers.
 * 
 * @module AnimationController
 */

import { appState } from './state.js';

/**
 * Manages all visual states and transitions.
 */
export class AnimationController {
    /**
     * Initializes the controller and caches DOM references.
     */
    constructor() {
        /** 
         * The interactive switch element.
         * @private
         */
        this._switchEl = document.getElementById('main-switch');

        /**
         * The text label showing current mode.
         * @private
         */
        this._statusEl = document.getElementById('status-label');

        /**
         * The radial glow element.
         * @private
         */
        this._glowEl = document.querySelector('.glow-backdrop');

        /**
         * Root body reference for theme class switching.
         * @private
         */
        this._bodyEl = document.body;

        /**
         * Animation timing configuration.
         * Must match CSS --transition-slow for perfect sync.
         * @type {number}
         */
        this.TRANSITION_DURATION = 600;

        /**
         * Tracks visibility of helper hints.
         * @private
         */
        this._hintsShown = false;

        this._setupInitializationStyles();
        console.log("[AnimationController] UI Controller initialized and synced with design tokens.");
    }

    /**
     * Updates the entire visual state of the application.
     * Orchestrates the transition lock and class manipulation.
     * 
     * @param {boolean} isOn - The target state to animate towards.
     */
    updateUI(isOn) {
        this._logTransitionStart(isOn);

        // Notify StateManager to lock interaction during the animation.
        // This prevents 'glitching' where the user clicks multiple times 
        // while the background is mid-fade.
        appState.setTransitioning(true);
        this._bodyEl.classList.add('theme-transitioning');

        // Execute the visual property updates
        this._applyThemeClasses(isOn);
        this._updateBranding(isOn);
        this._updateMetaTheme(isOn);

        // Schedule the transition unlock.
        // We use a slight buffer (50ms) to ensure the GPU has finished rendering.
        setTimeout(() => {
            this._finalizeTransition();
        }, this.TRANSITION_DURATION + 50);
    }

    /**
     * Applies correct CSS classes to the primary containers.
     * @private
     * @param {boolean} isOn 
     */
    _applyThemeClasses(isOn) {
        if (isOn) {
            this._bodyEl.classList.add('light-mode');
            this._bodyEl.classList.remove('dark-mode');
            this._switchEl.classList.add('is-on');
        } else {
            this._bodyEl.classList.add('dark-mode');
            this._bodyEl.classList.remove('light-mode');
            this._switchEl.classList.remove('is-on');
        }
    }

    /**
     * Smoothly updates the text content with a fade effect.
     * @private
     * @param {boolean} isOn 
     */
    _updateBranding(isOn) {
        // Phase 1: Fade out
        this._statusEl.style.opacity = "0";

        // Phase 2: Switch text and fade in after a short delay
        setTimeout(() => {
            this._statusEl.innerText = isOn ? "B R I G H T M O D E" : "L I G H T S W I T C H";
            this._statusEl.style.opacity = "0.5";
        }, this.TRANSITION_DURATION / 2);
    }

    /**
     * Updates the browser's theme-color meta tag for integrated mobile UI feel.
     * @private
     * @param {boolean} isOn 
     */
    _updateMetaTheme(isOn) {
        let metaTheme = document.querySelector('meta[name="theme-color"]');
        if (!metaTheme) {
            metaTheme = document.createElement('meta');
            metaTheme.name = "theme-color";
            document.head.appendChild(metaTheme);
        }
        metaTheme.content = isOn ? "#fdfdfd" : "#0a0a0a";
    }

    /**
     * Cleans up transition state and releases the interaction lock.
     * @private
     */
    _finalizeTransition() {
        this._bodyEl.classList.remove('theme-transitioning');
        appState.setTransitioning(false);
        console.log("[AnimationController] UI finalize: Interaction lock released.");
    }

    /**
     * Pre-calculates or sets initial styles to avoid FOUC (Flash of Unstyled Content).
     * @private
     */
    _setupInitializationStyles() {
        this._statusEl.style.transition = `opacity ${this.TRANSITION_DURATION}ms ease`;
        this._bodyEl.style.transition = `background-color ${this.TRANSITION_DURATION}ms ease, color ${this.TRANSITION_DURATION}ms ease`;
    }

    /**
     * Debug logger for transition events.
     * @private
     */
    _logTransitionStart(isOn) {
        const style = isOn
            ? 'background: #fff; color: #000; padding: 2px 5px;'
            : 'background: #000; color: #fff; padding: 2px 5px;';
        console.log(`[AnimationController] %cAnimating to ${isOn ? 'BRIGHT' : 'DARK'}`, style);
    }

    /**
     * Visual feedback for invalid interactions.
     * Triggers a 'shake' animation if the user tries to click while locked.
     */
    triggerFeedbackError() {
        this._switchEl.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(0)' }
        ], {
            duration: 150,
            iterations: 1
        });
    }
}

/**
 * Singleton instance.
 */
export const animationController = new AnimationController();
