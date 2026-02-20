/**
 * LiveTypingAura - InputHandler
 * Detects user input, calculates WPM/intensity, and manages text state.
 */

import { CONFIG } from './config.js';

export class InputHandler {
    constructor(callbacks) {
        this.callbacks = callbacks; // { onType, onBackspace, onIdle }

        this.lastKeyTime = 0;
        this.typingSpeed = 0; // 0 to 1 scale roughly
        this.idleTimer = null;
        this.idleThreshold = 2000;

        this.currentWord = "";

        this.init();
    }

    init() {
        // We attach to the window for global capture
        window.addEventListener('keydown', (e) => this.handleKey(e));
    }

    handleKey(e) {
        const now = Date.now();

        // Ignore meta keys
        if (e.ctrlKey || e.altKey || e.metaKey) return;

        // Reset idle timer
        clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => {
            if (this.callbacks.onIdle) this.callbacks.onIdle();
        }, this.idleThreshold);

        // Calculate "velocity" based on time since last key
        const dt = now - this.lastKeyTime;
        this.lastKeyTime = now;

        // Faster typing = smaller dt. 
        // Normalize: if dt < 100ms -> intense (1.0), if dt > 500ms -> slow (0.2)
        let intensity = Math.min(1.0, 100 / Math.max(dt, 50));

        // Backspace handling
        if (e.key === 'Backspace') {
            this.currentWord = this.currentWord.slice(0, -1);
            if (this.callbacks.onBackspace) this.callbacks.onBackspace(intensity);
            return;
        }

        // Regular typing
        if (e.key.length === 1) {
            // Handle Word Break / Reset
            if (e.key === ' ' || e.key === 'Enter') {
                this.currentWord = "";
                // We still want to see the particle for space
                if (this.callbacks.onType) {
                    this.callbacks.onType({
                        char: e.key,
                        intensity: intensity,
                        x: Math.random(),
                        y: Math.random()
                    });
                }
                return; // Don't add space to word usage for keyword check
            }

            this.currentWord += e.key;

            if (this.callbacks.onType) {
                // ... (existing call, will simple update below if needed, but let's just trigger theme later)
                this.callbacks.onType({
                    char: e.key,
                    intensity: intensity,
                    x: Math.random(),
                    y: Math.random()
                });
            }

            // Check for potential keyword match on space or enter? 
            // Or just check as they type? 
            // "fire" -> as soon as 'e' is typed? 
            // Let's do it on word boundaries (Space or Enter) OR immediately if we want instant magic
            // Let's do partial match? No, exact match is better.
            // Let's check on every key stroke for exact matches of known themes
            this.checkTheme();
        }
    }

    checkTheme() {
        const word = this.currentWord.toLowerCase();

        // We need access to CONFIG to know themes, or we assume they are passed/imported?
        // InputHandler shouldn't depend on config generally, but for simplicity let's import it or assume callback handles it?
        // Let's pass the word to a new callback 'onWordUpdate' or just add logic here.
        // Better: import CONFIG.
        // Dynamic import or assumed import at top. Let's add import to top of this file first.
        // Actually, let's just emit an event if it matches.

        if (this.callbacks.onThemeTrigger) {
            this.callbacks.onThemeTrigger(word);
        }
    }
}
