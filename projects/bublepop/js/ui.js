/**
 * BubblePop - UI Presentation & Effects Layer
 * 
 * @file ui.js
 * @description Manages the visual state of the application, including DOM updates,
 * high-performance particle animations, and coordinating complex UI transitions.
 * This module adheres to a reactive pattern by subscribing to global state changes.
 * 
 * @author Antigravity
 * @version 1.0.0
 */

import { State } from './state.js';
import { Audio } from './audio.js';
import { Utils } from './utils.js';

/**
 * UI Controller Module
 * Handles the visual orchestration of the BubblePop experience.
 * 
 * @module UI
 */
export const UI = {
    /** @type {HTMLElement|null} */
    counterEl: null,

    /** @type {HTMLElement|null} */
    audioToggleEl: null,

    /** @type {HTMLElement|null} */
    particleContainer: null,

    /**
     * Initializes the UI module by caching DOM elements and
     * setting up initial visual states.
     * 
     * @returns {void}
     */
    init() {
        // Cache frequently accessed DOM nodes
        this.counterEl = document.getElementById('pop-counter');
        this.audioToggleEl = document.getElementById('audio-status');
        this.particleContainer = document.getElementById('particle-container');

        if (!this.counterEl || !this.audioToggleEl || !this.particleContainer) {
            console.error('UI: Critical DOM elements missing. Initialization aborted.');
            return;
        }

        // Synchronize initial UI with current State
        this.updateCounterDisplay(State.totalPops);
        this.updateAudioIndicator(State.isAudioEnabled);

        // Setup interaction overlays and global listeners
        this.setupOverlayControllers();

        /**
         * Subscribe to state updates.
         * The UI reacts automatically to changes in the data layer.
         */
        State.subscribe((eventType, data) => {
            switch (eventType) {
                case 'pop':
                    this.updateCounterDisplay(data);
                    break;
                case 'audio':
                    this.updateAudioIndicator(data);
                    break;
                case 'theme':
                    this.applyThemeStyles(data);
                    break;
                default:
                    // Generic event handling
                    break;
            }
        });

        console.log('UI: Presentation layer initialized.');
    },

    /**
     * Updates the pop counter with a smooth pulse animation.
     * 
     * @param {number} count - The current total pop count.
     * @returns {void}
     */
    updateCounterDisplay(count) {
        if (!this.counterEl) return;

        // Perform text update
        this.counterEl.textContent = count.toLocaleString();

        // Trigger pulse animation by cycling the CSS class
        this.counterEl.classList.remove('pulse');

        /**
         * Forced reflow to ensure the browser registers the removal
         * before re-adding the class, allowing animation replay.
         */
        void this.counterEl.offsetWidth;

        this.counterEl.classList.add('pulse');
    },

    /**
     * Reflects the current audio state in the UI toggle button.
     * 
     * @param {boolean} isEnabled - Whether audio is currently active.
     * @returns {void}
     */
    updateAudioIndicator(isEnabled) {
        if (!this.audioToggleEl) return;

        this.audioToggleEl.textContent = isEnabled ? 'Sound On' : 'Sound Off';

        if (isEnabled) {
            this.audioToggleEl.classList.add('active');
        } else {
            this.audioToggleEl.classList.remove('active');
        }
    },

    /**
     * Configures the behavior of the start overlay.
     * Required to handle Web Audio API unlock requirements.
     * 
     * @private
     */
    setupOverlayControllers() {
        const overlay = document.getElementById('start-overlay');
        const startBtn = document.getElementById('start-btn');

        if (!overlay || !startBtn) return;

        /**
         * Handle first-touch interaction.
         * This satisfies browser "interaction required" policies for audio and haptics.
         */
        startBtn.addEventListener('click', () => {
            // Dismiss overlay with transition
            overlay.classList.add('hidden');

            // Activate Audio Engine
            State.toggleAudio(true);
            Audio.init();

            // Clean up overlay from DOM after transition (optional performance)
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 600);
        }, { once: true });

        // Additional listener for the manual audio toggle in header
        this.audioToggleEl.addEventListener('click', (e) => {
            e.stopPropagation();
            State.toggleAudio();
        });
    },

    /**
     * Orchestrates a "satisfying" particle explosion at specific coordinates.
     * Uses CSS custom properties for hardware-accelerated movement.
     * 
     * @param {number} x - Horizontal coordinate.
     * @param {number} y - Vertical coordinate.
     * @returns {void}
     */
    createBurst(x, y) {
        if (!this.particleContainer) return;

        /** @const {number} Total particles in each burst */
        const PARTICLE_COUNT = 10;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // Create a lightweight <div> for each particle
            const particle = Utils.createElement('div', {}, ['particle']);

            /** 
             * Mathematical distribution for the burst.
             * Randomizing angle, distance, and duration for organic feel.
             */
            const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + (Math.random() * 0.6 - 0.3);
            const radius = Utils.randomRange(50, 100);

            // Calculate terminal coordinates
            const tx = Math.cos(angle) * radius;
            const ty = Math.sin(angle) * radius;

            // Randomize animation duration for depth
            const duration = Utils.randomFloat(0.4, 0.7);

            // Set initial position
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;

            // Inject variables into the CSS animation pipeline
            Utils.setCSSVars(particle, {
                '--tx': `${tx}px`,
                '--ty': `${ty}px`,
                '--dur': `${duration}s`
            });

            // Append to DOM and trigger CSS animation
            this.particleContainer.appendChild(particle);
            particle.classList.add('animating');

            /**
             * Garbage Collection:
             * Explicitly remove the particle after the animation completes.
             */
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, duration * 1000);
        }
    },

    /**
     * Updates the application's global theme.
     * Future-proofing for visual variations.
     * 
     * @param {string} themeName 
     */
    applyThemeStyles(themeName) {
        document.body.dataset.theme = themeName;
        console.log(`UI: Theme changed to ${themeName}`);
    }
};
