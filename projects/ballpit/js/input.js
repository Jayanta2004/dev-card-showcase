/**
 * input.js
 * Advanced input orchestration for the BallPit playground.
 * Handles mouse, touch, and keyboard interactions with physical feedback.
 */

const Input = {
    // Stores the velocity of mouse movement for "stirring" force calculation
    lastMouseX: 0,
    lastMouseY: 0,
    mouseVelX: 0,
    mouseVelY: 0,

    /**
     * Sets up all event listeners for the simulation.
     */
    init() {
        const canvas = Renderer.canvas;

        // Primary Mouse Events
        canvas.addEventListener('mousedown', (e) => this.handleDown(e));
        window.addEventListener('mousemove', (e) => this.handleMove(e));
        window.addEventListener('mouseup', (e) => this.handleUp(e));

        // Keyboard Shortcuts
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Disable Context Menu on Canvas to allow right-click obstacle placement
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Mobile Touch Events
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleDown(e.touches[0]);
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleMove(e.touches[0]);
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleUp();
        }, { passive: false });

        console.info("Input System Initialized.");
    },

    /**
     * Handles MouseDown / TouchStart logic.
     * Starts grabbing balls or placing obstacles.
     */
    handleDown(e) {
        // Initialize Audio context if it's the first interaction
        AudioEngine.init();

        const { x, y } = this.getCanvasCoords(e);
        STATE.mouseX = x;
        STATE.mouseY = y;
        STATE.isMouseDown = true;

        // RIGHT CLICK (or specific button) -> Place Obstacle
        if (e.button === 2) {
            this.placeObstacle(x, y);
            return;
        }

        // Find the closest ball to the click point
        let target = null;
        let bestDist = CONFIG.GRAB_DISTANCE;

        for (let i = 0; i < Physics.balls.length; i++) {
            const b = Physics.balls[i];
            const d = Utils.dist(x, y, b.x, b.y);
            if (d < b.radius + 10 && d < bestDist) {
                bestDist = d;
                target = b;
            }
        }

        if (target) {
            STATE.grabbedBall = target;
            target.isGrabbed = true;

            // Add a little visual juice on grab
            Particles.emit(target.x, target.y, target.color, 10);
        }
    },

    /**
     * Handles movement tracking for both Drag and Stir mechanics.
     */
    handleMove(e) {
        const { x, y } = this.getCanvasCoords(e);

        // Calculate dynamic velocity
        this.mouseVelX = x - this.lastMouseX;
        this.mouseVelY = y - this.lastMouseY;

        STATE.mouseX = x;
        STATE.mouseY = y;
        this.lastMouseX = x;
        this.lastMouseY = y;

        if (STATE.grabbedBall) {
            // "Teleport" the ball to mouse while keeping velocity for throw
            STATE.grabbedBall.x = x;
            STATE.grabbedBall.y = y;

            // Influence old position to affect velocity upon release (Verlet property)
            STATE.grabbedBall.oldX = x - this.mouseVelX * 0.8;
            STATE.grabbedBall.oldY = y - this.mouseVelY * 0.8;
        } else if (STATE.isMouseDown) {
            // Stirring mechanic logic
            this.applyStirringForce(x, y);
        }
    },

    /**
     * Releases any grabbed entities.
     */
    handleUp() {
        STATE.isMouseDown = false;
        if (STATE.grabbedBall) {
            STATE.grabbedBall.isGrabbed = false;

            // If ball was thrown fast, trigger sound
            const speed = Math.sqrt(this.mouseVelX ** 2 + this.mouseVelY ** 2);
            if (speed > 5) AudioEngine.playCollision(speed);

            STATE.grabbedBall = null;
        }
    },

    /**
     * Handles Keyboard inputs like SHIFT for Gravity Well.
     */
    handleKeyDown(e) {
        if (e.shiftKey) {
            STATE.gravityWellActive = true;
            // Update UI toggle to match
            const toggle = document.getElementById('well-toggle');
            if (toggle) toggle.checked = true;
        }

        if (e.key === 'r' || e.key === 'R') {
            UI.resetSimulation();
        }
    },

    handleKeyUp(e) {
        if (e.key === 'Shift') {
            STATE.gravityWellActive = false;
            const toggle = document.getElementById('well-toggle');
            if (toggle) toggle.checked = false;
        }
    },

    /**
     * Helper to get relative canvas coordinates from an event.
     */
    getCanvasCoords(e) {
        if (!Renderer.canvas) return { x: 0, y: 0 };
        const rect = Renderer.canvas.getBoundingClientRect();
        return {
            x: (e.clientX || 0) - rect.left,
            y: (e.clientY || 0) - rect.top
        };
    },

    /**
     * Places a static bumper (Obstacle) into the world.
     */
    placeObstacle(x, y) {
        const radius = Utils.random(40, 70);
        Physics.obstacles.push(new Obstacle(x, y, radius));
        AudioEngine.playCollision(5); // Feedback sound

        // Remove oldest obstacle if too many (keep perf stable)
        if (Physics.obstacles.length > 5) {
            Physics.obstacles.shift();
        }
    },

    /**
     * Applies a repulsive or attractive force to nearby balls 
     * based on mouse movement speed.
     */
    applyStirringForce(mx, my) {
        const speed = Math.sqrt(this.mouseVelX ** 2 + this.mouseVelY ** 2);
        if (speed < 1) return;

        const stirRadius = CONFIG.STIR_RADIUS;
        const forceMag = CONFIG.MOUSE_FORCE;

        for (let i = 0; i < Physics.balls.length; i++) {
            const b = Physics.balls[i];
            const dx = mx - b.x;
            const dy = my - b.y;
            const dSq = dx * dx + dy * dy;

            if (dSq < stirRadius * stirRadius) {
                const d = Math.sqrt(dSq) || 0.1;
                const ratio = (1 - d / stirRadius);

                // Push ball in direction of mouse movement
                b.x += this.mouseVelX * ratio * forceMag;
                b.y += this.mouseVelY * ratio * forceMag;
            }
        }
    }
};

/**
 * VR / ACCELEROMETER EXTENSION (Optional Concept):
 * For mobile users, we could integrate 'deviceorientation' here 
 * to shift the simulation gravity based on phone tilt. 
 * This would enhance the "digital toy" feel significantly.
 */
