/**
 * GRAVITYTYPE // INPUT HANDLER
 * scripts/logic/input.js
 * 
 * Captures keyboard and mouse events.
 */

class InputHandler {
    constructor(typewriter, renderer) {
        this.typewriter = typewriter;
        this.renderer = renderer; // For potential mouse picking

        // State
        this.isTypingLocked = false;

        this.init();
    }

    init() {
        window.addEventListener('keydown', (e) => this.onKeyDown(e));

        // Mouse interaction could be added here (dragging bodies)
    }

    onKeyDown(e) {
        if (this.isTypingLocked) return;

        // Prevent default on common keys to stop browser scrolling
        if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            // e.preventDefault(); // Optional, might annoy user if strict
        }

        // Ignore inputs if focus is on a UI element (like slider)
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;

        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            // Single char
            this.typewriter.type(e.key);
        } else if (e.key === 'Enter') {
            this.typewriter.returnCarriage();
        } else if (e.key === 'Backspace') {
            this.typewriter.backspace();
        }
    }
}
