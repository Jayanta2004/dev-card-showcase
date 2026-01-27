/**
 * main.js
 * 
 * Entry point for the application.
 * Bootstraps the systems and manages the animation loop.
 */

class Application {
    constructor() {
        this.isRunning = false;
        this.lastTime = 0;

        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('Booting Text Dodge Engine...');

        // Initialize systems
        if (window.TextManager) {
            window.TextManager.init();
        } else {
            console.error('TextManager not found!');
        }

        // Start Loop
        this.isRunning = true;
        this.animate(0);

        // Remove loading class if exists
        document.body.classList.add('app-loaded');
    }

    /**
     * Main Animation Loop
     * @param {number} timestamp 
     */
    animate(timestamp) {
        if (!this.isRunning) return;

        // Calculate Delta Time (for consistent physics across frame rates)
        // Note: Our physics currently per-frame tuned, but could be delta-time based.
        // For simplicity and smoothness in web (usually 60fps), we stick to frame-based for now
        // but clamp large deltas to prevent physics explosions on tab switch.

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Update Systems
        if (window.Cursor) window.Cursor.update();
        if (window.TextManager) {
            window.TextManager.update();
            window.TextManager.render();
        }

        requestAnimationFrame((t) => this.animate(t));
    }

    pause() {
        this.isRunning = false;
    }

    resume() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            this.animate(this.lastTime);
        }
    }
}

// Start App
window.App = new Application();
