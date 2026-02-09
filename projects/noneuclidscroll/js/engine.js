/**
 * NonEuclidScroll | Scroll Engine
 * Translates raw wheel/touch events into non-Euclidean navigation.
 * 
 * DESIGN PHILOSOPHY:
 * The engine uses a momentum-based model where inputs (wheel, touch) 
 * add force to a virtual traveler. When the traveler exceeds a specific 
 * spatial threshold, a "fold" in space occurs (transition).
 * 
 * PERFORMANCE NOTES:
 * Uses requestAnimationFrame for all visual updates to ensure 60fps
 * even during rapid scroll intervals. Logic is decoupled from input
 * events to prevent layout thrashing.
 */

class ScrollEngine {
    /**
     * Initializes the scroll engine with cumulative momentum tracking.
     */
    constructor() {
        /** @type {number} Current virtual scroll position */
        this.scrollPos = 0;
        /** @type {number} Current smoothed velocity */
        this.momentum = 0;
        /** @type {number} Target velocity from user input */
        this.targetMomentum = 0;
        /** @type {number} Timestamp of the last frame */
        this.lastUpdateTime = performance.now();

        // Thresholds and Physics (Derived from Config)
        this.scrollThreshold = Config.SCROLL.THRESHOLD;
        this.friction = Config.SCROLL.FRICTION;
        this.sensitivity = Config.SCROLL.SENSITIVITY;

        /** @type {boolean} Prevents overlapping transitions */
        this.isTransitioning = false;

        this.initListeners();
        this.update();
    }

    /**
     * Set up event listeners for multiple input methods.
     */
    initListeners() {
        // Handle physical wheel movement
        window.addEventListener('wheel', (e) => {
            if (this.isTransitioning) return;

            // Normalize scroll delta (cross-browser compatibility)
            const delta = e.deltaY;
            this.targetMomentum += delta * this.sensitivity;

            // Unlock audio context on first scroll if not yet initialized
            if (!Audio.initialized) Audio.init();
        }, { passive: true });

        // Touch support for mobile/trackpad devices
        let touchStart = 0;
        window.addEventListener('touchstart', (e) => {
            if (this.isTransitioning) return;
            touchStart = e.touches[0].clientY;
            if (!Audio.initialized) Audio.init();
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (this.isTransitioning) return;
            const delta = touchStart - e.touches[0].clientY;
            this.targetMomentum += delta * this.sensitivity * 2;
            touchStart = e.touches[0].clientY;
        }, { passive: true });
    }

    /**
     * The internal simulation loop.
     * Calculated every frame to update positions and HUD.
     */
    update() {
        const now = performance.now();
        const dt = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;

        // Apply friction and lerp momentum for smoothness
        this.momentum = Utils.lerp(this.momentum, this.targetMomentum, Config.SCROLL.MOMENTUM_LERP);
        this.targetMomentum *= this.friction;

        // Apply velocity to position
        this.scrollPos += this.momentum * dt;

        // Sonic Feedback
        Audio.updateTone(this.momentum);

        // Visual feedback for HUD status
        this.updateHUD();

        // Spatial Branching Logic
        if (!this.isTransitioning) {
            if (this.scrollPos > this.scrollThreshold) {
                this.triggerTransition('down');
            } else if (this.scrollPos < -this.scrollThreshold) {
                this.triggerTransition('up');
            }
        }

        // Keep the engine running
        requestAnimationFrame(() => this.update());
    }

    /**
     * Executes the non-Euclidean transition between nodes.
     * @param {string} direction - The vector of travel ('down' | 'up')
     */
    async triggerTransition(direction) {
        this.isTransitioning = true;

        // Reset kinetic energy
        this.targetMomentum = 0;
        this.momentum = 0;

        // Trigger Audio feedback
        Audio.playTransition(direction);

        // Visual Disturbance (Glitch)
        document.body.classList.add('is-glitching');

        // Logic Flow:
        // 1. Advance the internal state machine
        State.navigate(direction);

        // 2. Perform DOM Swap through the DOM Manager
        // Note: The actual DOM swap is handled via State callback

        // 3. Simulated cool-down for animation duration
        await new Promise(r => setTimeout(r, Config.TRANSITION.DURATION));

        // Restoration
        this.scrollPos = 0;
        document.body.classList.remove('is-glitching');

        // Short grace period before accepting new input
        setTimeout(() => {
            this.isTransitioning = false;
        }, 100);
    }

    /**
     * Updates the Head-Up Display elements.
     */
    updateHUD() {
        const fill = document.getElementById('momentum-fill');
        const indicator = document.getElementById('scroll-direction-indicator');

        if (fill) {
            const progress = Math.abs(this.scrollPos) / this.scrollThreshold;
            const percent = progress * 100;
            fill.style.width = `${Utils.clamp(percent, 0, 100)}%`;

            // Color shift based on direction
            fill.style.backgroundColor = this.scrollPos > 0 ? 'var(--accent-color)' : '#ff0055';
        }

        if (indicator) {
            if (this.scrollPos > 100) indicator.innerText = 'DESCENDING VECTOR';
            else if (this.scrollPos < -100) indicator.innerText = 'ASCENDING VECTOR';
            else indicator.innerText = 'STATIONARY';
        }
    }
}

// Initialized in app.js
