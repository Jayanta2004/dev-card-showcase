class PhysicsEngine {
    constructor() {
        this.gravity = 980;
        this.bounceCoefficient = 0.85;
        this.friction = 0.99;
        this.minVelocity = 0.5;
        this.lastTimestamp = null;
    }

    initialize() {
        this.lastTimestamp = performance.now();
    }

    calculateDeltaTime(currentTimestamp) {
        if (!this.lastTimestamp) {
            this.lastTimestamp = currentTimestamp;
            return 0;
        }
        const deltaTime = (currentTimestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = currentTimestamp;
        return Math.min(deltaTime, 0.1);
    }

    applyGravity(velocity, deltaTime) {
        return {
            vx: velocity.vx,
            vy: velocity.vy + this.gravity * deltaTime
        };
    }

    applyFriction(velocity) {
        return {
            vx: velocity.vx * this.friction,
            vy: velocity.vy * this.friction
        };
    }

    updatePosition(position, velocity, deltaTime) {
        return {
            x: position.x + velocity.vx * deltaTime,
            y: position.y + velocity.vy * deltaTime
        };
    }

    checkCollision(position, radius, bounds) {
        const collisions = {
            top: false,
            right: false,
            bottom: false,
            left: false
        };

        if (position.y - radius <= 0) {
            collisions.top = true;
        }
        if (position.y + radius >= bounds.height) {
            collisions.bottom = true;
        }
        if (position.x - radius <= 0) {
            collisions.left = true;
        }
        if (position.x + radius >= bounds.width) {
            collisions.right = true;
        }

        return collisions;
    }

    handleBounce(position, velocity, radius, bounds, collisions) {
        let newPosition = { ...position };
        let newVelocity = { ...velocity };

        if (collisions.top) {
            newPosition.y = radius;
            newVelocity.vy = Math.abs(newVelocity.vy) * this.bounceCoefficient;
        }

        if (collisions.bottom) {
            newPosition.y = bounds.height - radius;
            newVelocity.vy = -Math.abs(newVelocity.vy) * this.bounceCoefficient;
        }

        if (collisions.left) {
            newPosition.x = radius;
            newVelocity.vx = Math.abs(newVelocity.vx) * this.bounceCoefficient;
        }

        if (collisions.right) {
            newPosition.x = bounds.width - radius;
            newVelocity.vx = -Math.abs(newVelocity.vx) * this.bounceCoefficient;
        }

        if (Math.abs(newVelocity.vx) < this.minVelocity) {
            newVelocity.vx = 0;
        }
        if (Math.abs(newVelocity.vy) < this.minVelocity) {
            newVelocity.vy = 0;
        }

        return { position: newPosition, velocity: newVelocity };
    }

    shouldTransferToOtherWindow(position, radius, bounds) {
        const threshold = radius * 0.4;

        if (position.y - radius < -threshold) {
            return { transfer: true, edge: 'top' };
        }
        if (position.y + radius > bounds.height + threshold) {
            return { transfer: true, edge: 'bottom' };
        }
        if (position.x - radius < -threshold) {
            return { transfer: true, edge: 'left' };
        }
        if (position.x + radius > bounds.width + threshold) {
            return { transfer: true, edge: 'right' };
        }

        return { transfer: false, edge: null };
    }

    calculateVelocityMagnitude(velocity) {
        return Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy);
    }

    isStationary(velocity) {
        return this.calculateVelocityMagnitude(velocity) < this.minVelocity;
    }

    clampPosition(position, radius, bounds) {
        return {
            x: Math.max(radius, Math.min(bounds.width - radius, position.x)),
            y: Math.max(radius, Math.min(bounds.height - radius, position.y))
        };
    }

    createRandomVelocity(minSpeed, maxSpeed) {
        const angle = Math.random() * Math.PI * 2;
        const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
        return {
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed
        };
    }

    addImpulse(velocity, impulse) {
        return {
            vx: velocity.vx + impulse.vx,
            vy: velocity.vy + impulse.vy
        };
    }

    scaleVelocity(velocity, scale) {
        return {
            vx: velocity.vx * scale,
            vy: velocity.vy * scale
        };
    }

    normalizeVelocity(velocity) {
        const magnitude = this.calculateVelocityMagnitude(velocity);
        if (magnitude === 0) {
            return { vx: 0, vy: 0 };
        }
        return {
            vx: velocity.vx / magnitude,
            vy: velocity.vy / magnitude
        };
    }

    interpolatePosition(pos1, pos2, alpha) {
        return {
            x: pos1.x + (pos2.x - pos1.x) * alpha,
            y: pos1.y + (pos2.y - pos1.y) * alpha
        };
    }

    predictPosition(position, velocity, time) {
        return {
            x: position.x + velocity.vx * time,
            y: position.y + velocity.vy * time
        };
    }
}

if (typeof window !== 'undefined') {
    window.PhysicsEngine = PhysicsEngine;
}
