/**
 * GRAVITYTYPE // COLLISION MODULE
 * scripts/physics/collision.js
 * 
 * Handles narrow-phase collision detection and manifold generation.
 */

class CollisionManifold {
    constructor() {
        this.normal = new Vector2();
        this.depth = 0;
        this.hasCollision = false;
        this.contacts = [];
    }

    reset() {
        this.hasCollision = false;
        this.depth = 0;
        this.contacts = [];
    }
}

class Collision {

    /**
     * Detects collision between two RigidBodies (Rect-VS-Rect).
     * @param {RigidBody} a 
     * @param {RigidBody} b 
     * @param {CollisionManifold} manifold 
     */
    static solveRectRect(a, b, manifold) {
        manifold.reset();

        // Vector from A to B
        const n = b.pos.clone().sub(a.pos);

        // Overlap on X
        const aExtentX = a.width / 2;
        const bExtentX = b.width / 2;
        const xOverlap = aExtentX + bExtentX - Math.abs(n.x);

        if (xOverlap > 0) {
            // Overlap on Y
            const aExtentY = a.height / 2;
            const bExtentY = b.height / 2;
            const yOverlap = aExtentY + bExtentY - Math.abs(n.y);

            if (yOverlap > 0) {
                // Collision confirmed - find axis of least penetration
                manifold.hasCollision = true;

                if (xOverlap < yOverlap) {
                    // Push along X
                    if (n.x < 0) {
                        manifold.normal.set(-1, 0);
                    } else {
                        manifold.normal.set(1, 0);
                    }
                    manifold.depth = xOverlap;
                } else {
                    // Push along Y
                    if (n.y < 0) {
                        manifold.normal.set(0, -1);
                    } else {
                        manifold.normal.set(0, 1);
                    }
                    manifold.depth = yOverlap;
                }
            }
        }
    }

    /**
     * Resolves the collision by separating bodies and applying impulse.
     * @param {RigidBody} a 
     * @param {RigidBody} b 
     * @param {CollisionManifold} m 
     */
    static resolve(a, b, m) {
        if (!m.hasCollision) return;

        // 1. Positional Correction (prevent sinking)
        const percent = 0.8; // Penetration percentage to correct
        const slop = 0.01;   // Penetration allowance
        const correction = Math.max(m.depth - slop, 0) / (a.invMass + b.invMass) * percent;

        const corrVector = m.normal.clone().mult(correction);

        if (!a.isStatic) a.pos.sub(corrVector.clone().mult(a.invMass));
        if (!b.isStatic) b.pos.add(corrVector.clone().mult(b.invMass));

        // Update AABBs immediately
        a.updateAABB();
        b.updateAABB();

        // 2. Velocity Impulse (Verlet approximation)
        // Calculate relative velocity
        const va = a.getVelocity();
        const vb = b.getVelocity();
        const rv = vb.sub(va);

        // Velocity along normal
        const velAlongNormal = rv.dot(m.normal);

        // Do not resolve if velocities are separating
        if (velAlongNormal > 0) return;

        // Calculate restitution (bounciness)
        const e = Math.min(a.restitution, b.restitution);

        // Impulse scalar
        let j = -(1 + e) * velAlongNormal;
        j /= (a.invMass + b.invMass);

        // Apply impulse
        const impulse = m.normal.clone().mult(j);

        // Verlet Hack: Modify oldPos to change velocity for next frame
        // v = pos - oldPos -> oldPos = pos - v_new
        // v_new = v_old ± impulse
        if (!a.isStatic) {
            const vChange = impulse.clone().mult(a.invMass);
            a.oldPos.add(vChange); // Subtracting from oldPos adds to velocity? No.
            // pos_new = pos + (v - change) ... 
            // Actually: currentVel - change = newVel. 
            // So oldPos should be moved "forward" to reduce velocity Diff.
            // Let's stick to standard Verlet impulse application:
            // v_new = v_old + impulse/m
            // pos - oldPos_new = (pos - oldPos_old) + impulse/m
            // oldPos_new = oldPos_old - impulse/m
            a.oldPos.sub(vChange);
        }

        if (!b.isStatic) {
            const vChange = impulse.clone().mult(b.invMass);
            b.oldPos.add(vChange); // Add to oldPos to reduce velocity relative to pos
        }

        return j; // Return impulse magnitude for effects (sparks)
    }
}
