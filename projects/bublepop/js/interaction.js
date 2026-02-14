/**
 * BubblePop - User Interaction & Input Synthesis
 * 
 * @file interaction.js
 * @description Coordinates hardware input (mouse, touch) with application logic.
 * This module is responsible for detecting "popping" intents and routing
 * them to the Audio, UI, and State modules for synchronized feedback.
 * 
 * @author Antigravity
 * @version 1.0.0
 */

import { State } from './state.js';
import { Audio } from './audio.js';
import { UI } from './ui.js';

/**
 * Interaction Controller Module
 * Manages the transition between user input and satisfying digital feedback.
 * 
 * @module Interaction
 */
export const Interaction = {
    /**
     * Initializes the interaction listeners.
     * Sets up delegation for high-performance event handling.
     * 
     * @returns {void}
     */
    init() {
        /** 
         * Event Delegation:
         * We attach listeners to the arena rather than individual bubbles.
         * This prevents memory bloat and simplifies infinite grid management.
         */
        const arena = document.getElementById('bubble-arena');

        if (!arena) {
            console.error('Interaction: Fatal error - Arena container missing.');
            return;
        }

        /**
         * Handling Pointer Events:
         * pointerdown provides lower latency than 'click' and works
         * natively with touch, mouse, and stylus devices.
         */
        arena.addEventListener('pointerdown', (event) => {
            // Find the nearest bubble ancestor
            const targetBubble = event.target.closest('.bubble');

            /**
             * Condition Check:
             * 1. Target must be a bubble.
             * 2. Bubble must not be already popped.
             */
            if (targetBubble && targetBubble.dataset.popped === 'false') {
                this.executePopSequence(targetBubble, event);
            }
        });

        // Inform user/dev about haptic status
        if (!('vibrate' in navigator)) {
            console.log('Interaction: Haptic feedback is not supported on this hardware.');
        } else {
            console.log('Interaction: Haptic engine engaged.');
        }
    },

    /**
     * Orchestrates the multi-module "Pop" sequence.
     * This method is the heartbeat of the satisfying experience.
     * 
     * @param {HTMLElement} bubble - The DOM element being interaction with.
     * @param {PointerEvent} event - The raw event for coordinate tracking.
     * @returns {void}
     * @private
     */
    executePopSequence(bubble, event) {
        /**
         * STEP 1: Logical Invalidation
         * Mark as popped immediately to prevent rapid-fire double pops
         * on the same element before animations complete.
         */
        bubble.dataset.popped = 'true';

        /**
         * STEP 2: Visual Transformation
         * Add CSS classes to trigger the "burst" and "empty" styles.
         */
        bubble.classList.add('popped', 'popping');

        /**
         * STEP 3: Audio Synthesis
         * Play a random profile sound to maintain auditory freshness.
         */
        if (State.isAudioEnabled) {
            const availableProfiles = ['soft', 'snappy', 'deep', 'sharp', 'hollow'];
            const chosenProfile = availableProfiles[Math.floor(Math.random() * availableProfiles.length)];

            // Apply slight pitch randomization for "natural" variation
            const pitchVariation = 0.9 + (Math.random() * 0.2);
            Audio.playPop(chosenProfile, pitchVariation);
        }

        /**
         * STEP 4: Tactical/Haptic Feedback
         * Trigger a short browser vibration on mobile devices.
         */
        if (navigator.vibrate) {
            // A quick, sharp 15ms pulse is the "gold standard" for UI feedback
            navigator.vibrate(15);
        }

        /**
         * STEP 5: Particle Orchestration
         * Fire the high-performance particle burst at the exact contact point.
         */
        UI.createBurst(event.clientX, event.clientY);

        /**
         * STEP 6: State Synchronization
         * Update the reactive data model. This will automatically
         * trigger the counter update in the Header.
         */
        State.registerPop();

        /**
         * STEP 7: Cleanup
         * Remove temporary animation classes to keep the DOM clean.
         */
        this.scheduleCleanup(bubble);
    },

    /**
     * Schedules the removal of transient animation classes.
     * 
     * @param {HTMLElement} element - The bubble to clean up.
     * @private
     */
    scheduleCleanup(element) {
        /** 
         * Duration (400ms) matches the @keyframes in animations.css 
         */
        setTimeout(() => {
            if (element && element.classList.contains('popping')) {
                element.classList.remove('popping');
            }
        }, 400);
    }
};
