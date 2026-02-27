/**
 * GRAVITYTYPE // CONSTRAINT MODULE
 * scripts/physics/constraint.js
 * 
 * Implements physical constraints between bodies.
 * Primarily DistanceConstraint for chain effects.
 */

class DistanceConstraint {
    /**
     * @param {RigidBody} bodyA 
     * @param {RigidBody} bodyB 
     * @param {number} length Target distance (default: current dist)
     * @param {number} stiffness 0..1 (1 = rigid, lower = elastic)
     */
    constructor(bodyA, bodyB, length = -1, stiffness = 0.5) {
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        this.stiffness = stiffness;

        if (length < 0) {
            this.length = bodyA.pos.dist(bodyB.pos);
        } else {
            this.length = length;
        }
    }

    /**
     * Solve constraint for current frame.
     */
    resolve() {
        const dx = this.bodyA.pos.x - this.bodyB.pos.x;
        const dy = this.bodyA.pos.y - this.bodyB.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist === 0) return; // Singular

        // Difference factor
        const diff = (this.length - dist) / dist;

        // Apply correction (half to A, half to B)
        const percent = diff * 0.5 * this.stiffness;
        const offX = dx * percent;
        const offY = dy * percent;

        if (!this.bodyA.isStatic) {
            this.bodyA.pos.x += offX;
            this.bodyA.pos.y += offY;
        }

        if (!this.bodyB.isStatic) {
            this.bodyB.pos.x -= offX;
            this.bodyB.pos.y -= offY;
        }
    }

    /**
     * Render for debug.
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.bodyA.pos.x, this.bodyA.pos.y);
        ctx.lineTo(this.bodyB.pos.x, this.bodyB.pos.y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
    }
}
