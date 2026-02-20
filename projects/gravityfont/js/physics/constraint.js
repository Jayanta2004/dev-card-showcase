/**
 * GravityFont - Constraint Class
 * Connects two particles with a specified distance and stiffness.
 */

class Constraint {
    /**
     * @param {Particle} p1 First particle
     * @param {Particle} p2 Second particle
     * @param {Object} options Configuration options
     */
    constructor(p1, p2, options = {}) {
        this.p1 = p1;
        this.p2 = p2;

        // Distance to maintain
        this.distance = options.distance !== undefined ?
            options.distance :
            p1.position.dist(p2.position);

        this.stiffness = options.stiffness || 0.1;
        this.visible = options.visible !== undefined ? options.visible : true;
        this.color = options.color || 'rgba(255, 255, 255, 0.2)';
        this.thickness = options.thickness || 1;

        // Stress factor for visual feedback
        this.stress = 0;
        this.isBroken = false;
        this.breakThreshold = options.breakThreshold || 0; // 0 means unbreakable
    }

    /**
     * Solves the constraint by pushing/pulling particles.
     * This method calculates the difference between current distance and target distance,
     * then applies a correction force to both particles proportional to the stiffness.
     */
    resolve() {
        if (this.isBroken) return;

        const dx = this.p2.position.x - this.p1.position.x;
        const dy = this.p2.position.y - this.p1.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Prevent division by zero
        if (dist === 0) return;

        // Calculate the difference ratio
        // diff > 0 means stretched, diff < 0 means compressed
        const diff = (this.distance - dist) / dist;

        // Store stress for rendering (how much it is stretched/compressed)
        this.stress = Math.abs(this.distance - dist) / this.distance;

        // Break logic: if stress exceeds threshold, snap the constraint
        if (this.breakThreshold > 0 && this.stress > this.breakThreshold) {
            this.isBroken = true;
            return;
        }

        // Calculate the offset vector
        const offsetX = dx * diff * this.stiffness;
        const offsetY = dy * diff * this.stiffness;

        // Apply corrections based on mass (simplified here to equal mass)
        // If one particle is static, the other takes the full displacement
        if (!this.p1.isStatic) {
            this.p1.position.x -= offsetX;
            this.p1.position.y -= offsetY;
        }

        if (!this.p2.isStatic) {
            this.p2.position.x += offsetX;
            this.p2.position.y += offsetY;
        }
    }
}
