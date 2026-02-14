/**
 * InputHandler - Manages mouse and keyboard events for Morse input
 */
export class InputHandler {
    constructor(callbacks) {
        this.onStart = callbacks.onStart;
        this.onEnd = callbacks.onEnd;
        this.isPressed = false;
        this.startTime = 0;

        this.setupListeners();
    }

    setupListeners() {
        const key = document.getElementById('morse-key');

        // Mouse/Touch events
        key.addEventListener('mousedown', (e) => this.handleStart(e));
        key.addEventListener('mouseup', (e) => this.handleEnd(e));
        key.addEventListener('mouseleave', (e) => this.handleEnd(e));

        key.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleStart(e);
        }, { passive: false });

        key.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleEnd(e);
        }, { passive: false });

        // Keyboard events
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isPressed) {
                e.preventDefault();
                this.handleStart(e);
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleEnd(e);
            }
        });
    }

    handleStart(event) {
        if (this.isPressed) return;
        this.isPressed = true;
        this.startTime = Date.now();

        if (this.onStart) this.onStart();
    }

    handleEnd(event) {
        if (!this.isPressed) return;
        this.isPressed = false;
        const duration = Date.now() - this.startTime;

        if (this.onEnd) this.onEnd(duration);
    }
}
