class PhysicsEngine {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        this.ball = {
            x: canvasWidth / 2,
            y: canvasHeight / 2,
            radius: 20,
            vx: 0,
            vy: 0,
            ax: 0,
            ay: 0,
            mass: 1,
            color: '#6366f1',
            trail: []
        };

        this.gravity = 0.3;
        this.friction = 0.98;
        this.bounceDamping = 0.7;
        this.maxVelocity = 20;
        this.maxTrailLength = 30;

        this.forceMultiplier = 0.5;
        this.jumpForce = 15;
        this.boostForce = 8;

        this.isGrounded = false;
        this.wallCollision = false;
    }

    update(audioData) {
        if (!audioData) return;

        const normalizedVolume = audioData.normalized;
        const currentVolume = audioData.current;

        const horizontalForce = (Math.random() - 0.5) * normalizedVolume * this.forceMultiplier;
        this.ball.ax = horizontalForce;

        const upwardForce = normalizedVolume * this.forceMultiplier * 0.8;
        this.ball.ay = -upwardForce;

        this.ball.vx += this.ball.ax;
        this.ball.vy += this.ball.ay;

        this.ball.vy += this.gravity;

        this.ball.vx *= this.friction;
        this.ball.vy *= this.friction;

        this.ball.vx = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, this.ball.vx));
        this.ball.vy = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, this.ball.vy));

        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        this.handleCollisions();

        this.updateTrail();

        this.updateBallColor(normalizedVolume);
    }

    handleCollisions() {
        this.isGrounded = false;
        this.wallCollision = false;

        if (this.ball.x - this.ball.radius < 0) {
            this.ball.x = this.ball.radius;
            this.ball.vx = Math.abs(this.ball.vx) * this.bounceDamping;
            this.wallCollision = true;
        }

        if (this.ball.x + this.ball.radius > this.canvasWidth) {
            this.ball.x = this.canvasWidth - this.ball.radius;
            this.ball.vx = -Math.abs(this.ball.vx) * this.bounceDamping;
            this.wallCollision = true;
        }

        if (this.ball.y - this.ball.radius < 0) {
            this.ball.y = this.ball.radius;
            this.ball.vy = Math.abs(this.ball.vy) * this.bounceDamping;
        }

        if (this.ball.y + this.ball.radius > this.canvasHeight) {
            this.ball.y = this.canvasHeight - this.ball.radius;
            this.ball.vy = -Math.abs(this.ball.vy) * this.bounceDamping;
            this.isGrounded = true;
        }
    }

    updateTrail() {
        this.ball.trail.push({
            x: this.ball.x,
            y: this.ball.y,
            timestamp: Date.now()
        });

        if (this.ball.trail.length > this.maxTrailLength) {
            this.ball.trail.shift();
        }
    }

    updateBallColor(intensity) {
        const hue = 240 + (intensity * 120);
        const saturation = 70 + (intensity * 30);
        const lightness = 50 + (intensity * 20);
        this.ball.color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    applyJump(intensity) {
        const force = this.jumpForce * Math.min(intensity, 2);
        this.ball.vy = -force;

        const horizontalBoost = (Math.random() - 0.5) * this.boostForce;
        this.ball.vx += horizontalBoost;
    }

    applyBoost(intensity) {
        const angle = Math.random() * Math.PI * 2;
        const force = this.boostForce * Math.min(intensity, 1.5);

        this.ball.vx += Math.cos(angle) * force;
        this.ball.vy += Math.sin(angle) * force;
    }

    setGravity(value) {
        this.gravity = value * 0.6;
    }

    setFriction(value) {
        this.friction = 0.9 + (value * 0.09);
    }

    setForceMultiplier(value) {
        this.forceMultiplier = value;
    }

    reset() {
        this.ball.x = this.canvasWidth / 2;
        this.ball.y = this.canvasHeight / 2;
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.ball.ax = 0;
        this.ball.ay = 0;
        this.ball.trail = [];
    }

    resize(width, height) {
        const xRatio = width / this.canvasWidth;
        const yRatio = height / this.canvasHeight;

        this.ball.x *= xRatio;
        this.ball.y *= yRatio;

        this.canvasWidth = width;
        this.canvasHeight = height;
    }

    getBallState() {
        return {
            position: { x: this.ball.x, y: this.ball.y },
            velocity: { x: this.ball.vx, y: this.ball.vy },
            acceleration: { x: this.ball.ax, y: this.ball.ay },
            radius: this.ball.radius,
            color: this.ball.color,
            trail: this.ball.trail,
            isGrounded: this.isGrounded,
            speed: Math.sqrt(this.ball.vx ** 2 + this.ball.vy ** 2)
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhysicsEngine;
}
