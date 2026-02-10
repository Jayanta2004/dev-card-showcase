/**
 * GRAVITYTYPE // RIGIDBODY MODULE
 * scripts/physics/rigidbody.js
 * 
 * Defines physical bodies simulated by Verlet Integration.
 */

class RigidBody {
    /**
     * @param {number} x Initial X
     * @param {number} y Initial Y
     * @param {string} char The character content
     * @param {number} size Font size in px
     * @param {string} color Hex color
     */
    constructor(x, y, char, size, color) {
        // Position State
        this.pos = new Vector2(x, y);
        this.oldPos = new Vector2(x, y);
        this.acc = new Vector2(0, 0);

        // Visual Props
        this.char = char;
        this.fontSize = size;
        this.color = color;

        // Physical Dimensions
        // Approximate width based on font aspect ratio (0.6 is typical for monospace)
        this.width = size * 0.6;
        this.height = size;

        // Physical Props
        this.mass = 1.0;
        this.invMass = 1.0; // 1/mass, for inf mass support
        this.restitution = 0.5; // Bounciness
        this.friction = 0.99; // Air resistance

        // Bounds
        this.aabb = new AABB(this.pos, this.width, this.height);

        // Logic Flags
        this.isSleeping = false;
        this.isStatic = false;

        // Unique ID
        this.id = Math.random().toString(36).substr(2, 9);
    }

    /**
     * Apply a force to the body.
     * F = ma -> a = F/m
     * @param {Vector2} force 
     */
    applyForce(force) {
        if (this.isStatic) return;
        // copy force to avoid mutations, divide by mass
        const f = force.clone().div(this.mass);
        this.acc.add(f);
    }

    /**
     * Set specific velocity (manipulates oldPos).
     * @param {Vector2} vel 
     */
    setVelocity(vel) {
        this.oldPos = this.pos.clone().sub(vel);
    }

    /**
     * Get estimated velocity.
     * @returns {Vector2}
     */
    getVelocity() {
        return this.pos.clone().sub(this.oldPos);
    }

    /**
     * Verlet Integration Step.
     * @param {number} dt Delta time
     * @param {number} globalDrag Global air resistance
     */
    update(dt, globalDrag) {
        if (this.isStatic) return;

        // Calculate Velocity
        const vel = this.getVelocity();

        // Apply Drag
        vel.mult(globalDrag);

        // Save state
        this.oldPos.set(this.pos.x, this.pos.y);

        // Verlet: x' = x + v + a * dt^2
        // acc * dt * dt
        const accStep = this.acc.mult(dt * dt);

        this.pos.add(vel).add(accStep);

        // Reset Acceleration
        this.acc.set(0, 0);

        // Update Bounds
        this.updateAABB();
    }

    updateAABB() {
        this.aabb.update(this.pos, this.width, this.height);
    }

    /**
     * Constraint to World Bounds.
     * @param {number} w World width
     * @param {number} h World height
     */
    constrain(w, h) {
        const hw = this.width / 2;
        const hh = this.height / 2;
        const damping = 0.8; // Wall friction

        // Floor
        if (this.pos.y + hh > h) {
            this.pos.y = h - hh;
            // Reflect velocity via Verlet (modify oldPos)
            // v' = -v * damping implies:
            // oldPos = pos + (pos - oldPos) * damping
            const vy = this.pos.y - this.oldPos.y;
            this.oldPos.y = this.pos.y + vy;
        }

        // Walls
        if (this.pos.x + hw > w) {
            this.pos.x = w - hw;
            const vx = this.pos.x - this.oldPos.x;
            this.oldPos.x = this.pos.x + vx;
        } else if (this.pos.x - hw < 0) {
            this.pos.x = hw;
            const vx = this.pos.x - this.oldPos.x;
            this.oldPos.x = this.pos.x + vx;
        }
    }
}
