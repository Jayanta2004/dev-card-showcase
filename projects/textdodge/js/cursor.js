/**
 * cursor.js
 * 
 * Handles user input (Mouse/Touch) and tracks cursor physics.
 * Calculates position, velocity, and state of the cursor.
 */

class CursorSystem {
    constructor() {
        this.position = new Vector2(-1000, -1000); // Start off-screen
        this.targetPosition = new Vector2(-1000, -1000);
        this.velocity = new Vector2(0, 0);
        this.isActive = false; // Is the cursor currently in the window?
        this.isMoving = false;

        // Timeout to detect stop
        this.moveTimeout = null;

        this.initEventListeners();
    }

    initEventListeners() {
        // Mouse Move
        window.addEventListener('mousemove', (e) => {
            this.handleInput(e.clientX, e.clientY);
            this.isActive = true;
        });

        // Touch Move
        window.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            this.handleInput(touch.clientX, touch.clientY);
            this.isActive = true;
            e.preventDefault(); // Prevent scrolling while interacting
        }, { passive: false });

        // Touch Start
        window.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this.handleInput(touch.clientX, touch.clientY);
            this.isActive = true;
        }, { passive: true });

        // Mouse Leave (Window)
        document.addEventListener('mouseleave', () => {
            this.isActive = false;
            // Optionally move cursor way off screen
            this.targetPosition.set(-1000, -1000);
        });

        // Mouse Enter
        document.addEventListener('mouseenter', () => {
            this.isActive = true;
        });
    }

    handleInput(x, y) {
        this.targetPosition.set(x, y);
        this.isMoving = true;

        // Reset stop detection
        if (this.moveTimeout) clearTimeout(this.moveTimeout);
        this.moveTimeout = setTimeout(() => {
            this.isMoving = false;
        }, 100);
    }

    /**
     * Update loop called every frame
     */
    update() {
        if (!this.isActive) return;

        // Smoothly interpolate current position to target position
        // This adds a bit of "weight" to the cursor tracking if smoothing is enabled
        const smooth = AppConfig.cursor.smoothing || 1;

        let prevPos = this.position.copy();

        // Lerp position
        this.position.x = Utils.lerp(this.position.x, this.targetPosition.x, smooth);
        this.position.y = Utils.lerp(this.position.y, this.targetPosition.y, smooth);

        // Calculate velocity based on change
        this.velocity = Vector2.sub(this.position, prevPos);
    }

    /**
     * Get predicted position based on velocity
     * Useful for anticipating movement (anticipatory dodge)
     */
    getPredictedPosition(framesAhead = 5) {
        let prediction = this.position.copy();
        let vel = this.velocity.copy();
        prediction.add(vel.mult(framesAhead));
        return prediction;
    }
}

// Instantiate global cursor system
window.Cursor = new CursorSystem();
