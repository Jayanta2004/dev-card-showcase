/**
 * ScreamScroll - Scrolling Engine
 * 
 * Manages momentum-based scrolling, physics-inspired velocity,
 * and mapping of audio amplitude to scroll movement.
 */

class ScrollingEngine {
    constructor() {
        this.velocity = 0;
        this.maxVelocity = 50;
        this.friction = 0.95; // How quickly the scroll slows down
        this.accelerationFactor = 100; // Multiplier for amplitude to velocity

        this.currentScrollY = window.scrollY;
        this.isScrolling = false;

        // Momentum state
        this.lastUpdateTime = performance.now();

        // Locking standard scroll
        this.lockStandardScroll();
    }

    /**
     * Prevent mouse and keyboard scrolling
     */
    lockStandardScroll() {
        window.addEventListener('wheel', (e) => {
            if (this.isScrolling) e.preventDefault();
        }, { passive: false });

        window.addEventListener('keydown', (e) => {
            const keys = ['ArrowUp', 'ArrowDown', 'Space', 'PageUp', 'PageDown', 'Home', 'End'];
            if (keys.includes(e.key)) {
                e.preventDefault();
            }
        });
    }

    /**
     * Map audio amplitude to scroll acceleration
     * @param {Object} audio - Object containing sustained amplitude and whistling state
     */
    applyAudioInput(audio) {
        const { sustained, isWhistling } = audio;

        if (sustained > 0) {
            const acceleration = sustained * this.accelerationFactor;

            if (isWhistling) {
                // Reverse scroll for whistling
                this.velocity -= acceleration * 1.5; // Slightly faster reverse
            } else {
                // Normal scroll for humming
                this.velocity += acceleration;
            }

            // Cap velocity both ways
            this.velocity = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, this.velocity));
            this.isScrolling = true;
        } else {
            // Decelerate quickly when sound stops instead of instant stop for better feel
            this.velocity *= 0.5;
            if (Math.abs(this.velocity) < 0.5) {
                this.velocity = 0;
                this.isScrolling = false;
            }
        }
    }

    /**
     * Animation frame update for scrolling physics
     */
    update() {
        const now = performance.now();
        const deltaTime = (now - this.lastUpdateTime) / 16.67; // Normalize to ~60fps
        this.lastUpdateTime = now;

        if (this.velocity > 0.1) {
            // Apply friction
            this.velocity *= Math.pow(this.friction, deltaTime);

            // Update scroll position
            this.currentScrollY += this.velocity;

            // Bound scrolling to document height
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (this.currentScrollY > maxScroll) {
                this.currentScrollY = maxScroll;
                this.velocity = 0;
            } else if (this.currentScrollY < 0) {
                this.currentScrollY = 0;
                this.velocity = 0;
            }

            // Perform actual scroll
            window.scrollTo(0, this.currentScrollY);
        } else {
            this.velocity = 0;
        }

        return {
            velocity: this.velocity,
            isMoving: this.velocity > 0
        };
    }

    /**
     * Reset scroll to top (calibration/init helper)
     */
    reset() {
        this.velocity = 0;
        this.currentScrollY = 0;
        window.scrollTo(0, 0);
    }
}

// Export as a singleton
window.ScrollingEngine = new ScrollingEngine();
