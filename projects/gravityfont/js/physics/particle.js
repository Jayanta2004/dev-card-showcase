/**
 * GravityFont - Particle Class
 * Represents a point mass in the Verlet integration system.
 */

class Particle {
    /**
     * @param {number} x Initial x position
     * @param {number} y Initial y position
     * @param {Object} options Configuration options
     */
    constructor(x, y, options = {}) {
        this.position = new Vector(x, y);
        this.oldPosition = new Vector(x, y);
        this.acceleration = new Vector(0, 0);

        this.radius = options.radius || 4;
        this.mass = options.mass || 1;
        this.friction = options.friction || 0.99;
        this.bounce = options.bounce || 0.5;
        this.isStatic = options.isStatic || false;

        // Rendering properties
        this.color = options.color || '#3a86ff';
        this.alpha = options.alpha || 1;

        // Custom data for letter structure
        this.groupId = options.groupId || null;
        this.originalOffset = options.originalOffset || new Vector(0, 0);
    }

    /**
     * Updates the particle position using Verlet integration.
     * @param {number} dt Delta time
     * @param {Vector} gravity External gravity force
     */
    update(dt, gravity) {
        if (this.isStatic) return;

        // Apply forces
        this.applyForce(gravity);

        // Verlet integration: x(t + dt) = 2*x(t) - x(t - dt) + a * dt^2
        const velocity = Vector.sub(this.position, this.oldPosition).mul(this.friction);

        this.oldPosition.set(this.position.x, this.position.y);

        // Apply acceleration (a * dt * dt)
        this.position.add(velocity).add(Vector.mul(this.acceleration, dt * dt));

        // Reset acceleration
        this.acceleration.set(0, 0);
    }

    /**
     * Applies a force to the particle.
     * @param {Vector} force 
     */
    applyForce(force) {
        if (this.isStatic) return;

        // a = F / m
        const f = Vector.mul(force, 1 / this.mass);
        this.acceleration.add(f);
    }

    /**
     * Constraint to screen boundaries.
     * Prevents the particle from leaving the visible area.
     * Applies a bounce effect when hitting walls.
     * @param {number} width Width of the boundary
     * @param {number} height Height of the boundary
     */
    constrainToBoundaries(width, height) {
        const velocity = Vector.sub(this.position, this.oldPosition).mul(this.friction);

        if (this.position.y > height - this.radius) {
            this.position.y = height - this.radius;
            this.oldPosition.y = this.position.y + velocity.y * this.bounce;
        } else if (this.position.y < this.radius) {
            this.position.y = this.radius;
            this.oldPosition.y = this.position.y + velocity.y * this.bounce;
        }

        if (this.position.x > width - this.radius) {
            this.position.x = width - this.radius;
            this.oldPosition.x = this.position.x + velocity.x * this.bounce;
        } else if (this.position.x < this.radius) {
            this.position.x = this.radius;
            this.oldPosition.x = this.position.x + velocity.x * this.bounce;
        }
    }

    /**
     * Resets the particle to a specific position.
     * Clears velocity by setting oldPosition to the same value.
     * @param {number} x New X coordinate
     * @param {number} y New Y coordinate
     */
    reset(x, y) {
        this.position.set(x, y);
        this.oldPosition.set(x, y);
        this.acceleration.set(0, 0);
    }

    /**
     * Applies a sudden impulse force to the particle.
     * Useful for explosions or sudden impacts.
     * @param {Vector} force Force vector to apply
     */
    impulse(force) {
        // In Verlet, we modify oldPosition to create velocity
        // v = p - oldP
        // newV = v + force
        // oldP = p - newV
        const velocity = Vector.sub(this.position, this.oldPosition);
        velocity.add(force);
        this.oldPosition = Vector.sub(this.position, velocity);
    }

    /**
     * Checks if this particle is within a certain distance of another.
     * @param {Particle} other The other particle
     * @param {number} dist Distance threshold
     * @returns {boolean} True if within distance
     */
    isNear(other, dist) {
        return this.position.distSq(other.position) < dist * dist;
    }


    /**
     * Directly set position (used for constraints and generation).
     */
    setPosition(x, y) {
        this.position.set(x, y);
        this.oldPosition.set(x, y);
    }
}
