/**
 * BubblePop - Main Orchestrator
 * 
 * Entry point for the application. Initializes all modules
 * in the correct order and handles global lifecycle events.
 */

import { State } from './state.js';
import { Generator } from './generator.js';
import { Interaction } from './interaction.js';
import { UI } from './ui.js';

class App {
    constructor() {
        this.isLoaded = false;
        console.log('%c BubblePop Initializing... ', 'background: #8e94f2; color: #fff; border-radius: 4px;');
    }

    /**
     * Kickstart everything.
     */
    async init() {
        try {
            // 1. Initialize UI (State listeners, counter display)
            UI.init();

            // 2. Setup Interaction listeners
            Interaction.init();

            // 3. Start the Grid Generator (Initial bubbles)
            Generator.init();

            // 4. Handle Window Events
            this.setupWindowEvents();

            this.isLoaded = true;
            console.log('%c BubblePop Ready! ', 'background: #72efdd; color: #333; border-radius: 4px;');
        } catch (error) {
            console.error('App: Initialization failed', error);
        }
    }

    /**
     * Global window events (resize, beforeunload).
     */
    setupWindowEvents() {
        // Save state before leaving
        window.addEventListener('beforeunload', () => {
            State.save();
        });

        // Optimization: Stop audio if page is hidden
        document.addEventListener('visibilitychange', () => {
            // State management for audio focus could go here if needed
        });
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const bubblePopApp = new App();
    bubblePopApp.init();
});
