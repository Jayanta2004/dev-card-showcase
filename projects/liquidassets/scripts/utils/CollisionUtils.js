import { Vector2 } from '../fluid/Vector2.js';

/**
 * Utility class for handling geometric collisions and boundary constraints.
 * Separates collision logic from the main solver for modularity.
 */
export class CollisionUtils {

    /**
     * Constrains a particle to a rectangular boundary.
     * @param {Particle} p - The particle to constrain
     * @param {number} width - width of boundary
     * @param {number} height - height of boundary
     * @param {number} damping - energy loss on collision (0-1)
     * @param {number} radius - particle radius
     */
    static constrainToBox(p, width, height, damping, radius) {
        let collided = false;

        // Left Wall
        if (p.pos.x < radius) {
            p.pos.x = radius;
            p.vel.x *= -damping;
            collided = true;
        }
        // Right Wall
        else if (p.pos.x > width - radius) {
            p.pos.x = width - radius;
            p.vel.x *= -damping;
            collided = true;
        }

        // Floor
        if (p.pos.y > height - radius) {
            p.pos.y = height - radius;
            p.vel.y *= -damping;
            collided = true;
        }
        // Ceiling (Optional, usually open)
        else if (p.pos.y < radius) {
            p.pos.y = radius;
            p.vel.y *= -damping;
            collided = true;
        }

        return collided;
    }

    /**
     * Checks collision between a particle and a circular drain.
     * @param {Particle} p 
     * @param {Drain} drain 
     * @returns {boolean} true if inside
     */
    static checkCircleCollision(p, drain) {
        const dx = p.pos.x - drain.pos.x;
        const dy = p.pos.y - drain.pos.y;
        const distSq = dx * dx + dy * dy;

        return distSq < drain.radiusSq;
    }

    /**
     * Resolves collision with a circular obstacle (solid).
     * @param {Particle} p 
     * @param {Object} circle {x, y, radius}
     */
    static resolveCircleCollision(p, circle) {
        const dx = p.pos.x - circle.x;
        const dy = p.pos.y - circle.y;
        const distSq = dx * dx + dy * dy;
        const minDist = circle.radius + 4; // Particle radius approx

        if (distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq);
            const nx = dx / dist;
            const ny = dy / dist;

            const penetration = minDist - dist;

            // Push out
            p.pos.x += nx * penetration;
            p.pos.y += ny * penetration;

            // Reflect velocity
            const dot = p.vel.x * nx + p.vel.y * ny;
            p.vel.x -= 2 * dot * nx;
            p.vel.y -= 2 * dot * ny;

            // Damping
            p.vel.x *= 0.9;
            p.vel.y *= 0.9;
        }
    }
}
