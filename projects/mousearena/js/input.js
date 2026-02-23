// ===== INPUT SYSTEM =====
// Handles mouse tracking, velocity calculation, and gesture detection

export class InputSystem {
    constructor() {
        this.mousePos = { x: 0, y: 0 };
        this.prevMousePos = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.speed = 0;
        this.acceleration = 0;

        // Gesture detection
        this.gestureHistory = [];
        this.maxHistoryLength = 30;
        this.gestureState = 'none'; // none, flick, circle, hold

        // Flick detection (enhanced)
        this.flickThreshold = 12; // Lower threshold for easier attacks
        this.flickDirection = { x: 0, y: 0 };
        this.lastFlickTime = 0;
        this.flickCooldown = 300; // Reduced cooldown

        // Circle detection (improved)
        this.angleAccumulation = 0;
        this.circleThreshold = Math.PI * 1.3; // 234 degrees - easier to trigger
        this.lastAngle = 0;
        this.circleResetTime = 0;

        // Hold detection
        this.holdStartTime = 0;
        this.holdThreshold = 250; // Faster activation
        this.isHolding = false;
        this.holdMovementThreshold = 2;

        // Trail rendering
        this.trailParticles = [];
        this.trailContainer = document.getElementById('cursor-trail');

        // Bind events
        this.initEvents();
    }

    initEvents() {
        // Disable keyboard
        document.addEventListener('keydown', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, true);

        document.addEventListener('keyup', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, true);

        document.addEventListener('keypress', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, true);

        // Mouse tracking
        document.addEventListener('mousemove', (e) => {
            this.updateMousePosition(e.clientX, e.clientY);
        });

        // Prevent context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    updateMousePosition(x, y) {
        this.prevMousePos.x = this.mousePos.x;
        this.prevMousePos.y = this.mousePos.y;
        this.mousePos.x = x;
        this.mousePos.y = y;

        // Calculate velocity
        const dx = this.mousePos.x - this.prevMousePos.x;
        const dy = this.mousePos.y - this.prevMousePos.y;
        this.velocity.x = dx;
        this.velocity.y = dy;

        // Calculate speed
        const prevSpeed = this.speed;
        this.speed = Math.sqrt(dx * dx + dy * dy);
        this.acceleration = this.speed - prevSpeed;

        // Add to history
        this.gestureHistory.push({
            x: this.mousePos.x,
            y: this.mousePos.y,
            time: Date.now(),
            speed: this.speed
        });

        if (this.gestureHistory.length > this.maxHistoryLength) {
            this.gestureHistory.shift();
        }

        // Create trail particle
        this.createTrailParticle(x, y);
    }

    update(deltaTime) {
        this.detectGestures();
        this.updateTrailParticles();
    }

    detectGestures() {
        // Reset gesture state
        const prevGesture = this.gestureState;
        this.gestureState = 'none';

        // Check for flick
        if (this.detectFlick()) {
            this.gestureState = 'flick';
            return;
        }

        // Check for circle
        if (this.detectCircle()) {
            this.gestureState = 'circle';
            return;
        }

        // Check for hold
        if (this.detectHold()) {
            this.gestureState = 'hold';
            return;
        }
    }

    detectFlick() {
        const now = Date.now();

        // Cooldown check (reduced for better responsiveness)
        if (now - this.lastFlickTime < this.flickCooldown) {
            return false;
        }

        // Speed threshold
        if (this.speed > this.flickThreshold) {
            // Calculate direction
            const magnitude = Math.sqrt(
                this.velocity.x * this.velocity.x +
                this.velocity.y * this.velocity.y
            );

            if (magnitude > 0) {
                this.flickDirection.x = this.velocity.x / magnitude;
                this.flickDirection.y = this.velocity.y / magnitude;
                this.lastFlickTime = now;
                return true;
            }
        }

        return false;
    }

    detectCircle() {
        const now = Date.now();

        // Reset accumulation if too much time passed
        if (now - this.circleResetTime > 1000) {
            this.angleAccumulation = 0;
        }

        if (this.gestureHistory.length < 8) {
            return false;
        }

        // Get recent positions (more points for better detection)
        const recent = this.gestureHistory.slice(-15);

        // Calculate center as average position
        let centerX = 0, centerY = 0;
        for (const point of recent) {
            centerX += point.x;
            centerY += point.y;
        }
        centerX /= recent.length;
        centerY /= recent.length;

        // Calculate angles and accumulate
        let totalAngleChange = 0;
        let prevAngle = null;

        for (let i = 0; i < recent.length; i++) {
            const point = recent[i];
            const dx = point.x - centerX;
            const dy = point.y - centerY;
            const angle = Math.atan2(dy, dx);

            if (prevAngle !== null) {
                let angleDiff = angle - prevAngle;

                // Normalize angle difference
                if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

                totalAngleChange += Math.abs(angleDiff);
            }

            prevAngle = angle;
        }

        // Check if we've completed a circle
        if (totalAngleChange > this.circleThreshold) {
            this.angleAccumulation = 0;
            this.circleResetTime = now;
            return true;
        }

        this.circleResetTime = now;
        return false;
    }

    detectHold() {
        const now = Date.now();

        // Check if mouse is relatively stationary
        if (this.speed < this.holdMovementThreshold) {
            if (!this.isHolding) {
                this.holdStartTime = now;
                this.isHolding = true;
            }

            // Check if hold duration met
            if (now - this.holdStartTime > this.holdThreshold) {
                return true;
            }
        } else {
            this.isHolding = false;
            this.holdStartTime = 0;
        }

        return false;
    }

    createTrailParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'trail-particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';

        // Color based on speed
        const speedRatio = Math.min(this.speed / 20, 1);
        const hue = 180 + speedRatio * 60; // Blue to yellow
        particle.style.background = `hsl(${hue}, 100%, 60%)`;

        this.trailContainer.appendChild(particle);

        // Remove after animation
        setTimeout(() => {
            particle.remove();
        }, 600);
    }

    updateTrailParticles() {
        // Cleanup handled by CSS animation
    }

    getGestureState() {
        return this.gestureState;
    }

    getFlickDirection() {
        return this.flickDirection;
    }

    getMousePosition() {
        return this.mousePos;
    }

    getVelocity() {
        return this.velocity;
    }

    getSpeed() {
        return this.speed;
    }

    reset() {
        this.gestureHistory = [];
        this.gestureState = 'none';
        this.angleAccumulation = 0;
        this.isHolding = false;
        this.holdStartTime = 0;
    }
}
