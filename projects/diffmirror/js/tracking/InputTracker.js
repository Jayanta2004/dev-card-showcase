/**
 * InputTracker.js
 * Captures user interaction vectors and forwards them to DataManager.
 * Emits events for real-time reactivity.
 */

export class InputTracker {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.mouse = { x: 0, y: 0, lastX: 0, lastY: 0, velocity: 0 };
        this.isTracking = false;

        this.onMoveCallback = null;
        this.onClickCallback = null;

        this._initListeners();
    }

    _initListeners() {
        window.addEventListener('mousemove', (e) => this._handleMove(e));
        window.addEventListener('mousedown', (e) => this._handleClick(e));
        window.addEventListener('touchstart', (e) => this._handleTouch(e), { passive: false });
        window.addEventListener('touchmove', (e) => this._handleTouch(e), { passive: false });

        // Auto-save on visibility change or before unload
        window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.dataManager.save();
            }
        });
    }

    _handleMove(e) {
        const x = e.clientX;
        const y = e.clientY;

        // Calculate velocity
        const dx = x - this.mouse.lastX;
        const dy = y - this.mouse.lastY;
        this.mouse.velocity = Math.sqrt(dx * dx + dy * dy);

        this.mouse.lastX = this.mouse.x;
        this.mouse.lastY = this.mouse.y;
        this.mouse.x = x;
        this.mouse.y = y;

        // Record to data manager
        this.dataManager.addSample(x, y);

        if (this.onMoveCallback) {
            this.onMoveCallback(this.mouse);
        }
    }

    _handleClick(e) {
        this.dataManager.addClick(e.clientX, e.clientY);

        if (this.onClickCallback) {
            this.onClickCallback(e.clientX, e.clientY);
        }
    }

    _handleTouch(e) {
        // Simple touch to mouse mapping for basic support
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            const fakeEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY
            };

            if (e.type === 'touchmove') {
                this._handleMove(fakeEvent);
            } else if (e.type === 'touchstart') {
                this._handleClick(fakeEvent);
            }
        }
    }

    /**
     * Registers a callback for real-time movement updates.
     */
    onMove(callback) {
        this.onMoveCallback = callback;
    }

    /**
     * Registers a callback for interaction events.
     */
    onClick(callback) {
        this.onClickCallback = callback;
    }
}
