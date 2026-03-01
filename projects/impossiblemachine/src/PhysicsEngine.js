import { MutationEngine } from './MutationEngine.js';
import { Quadtree, Rectangle } from './Quadtree.js';

export class PhysicsEngine {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
    }

    update(particles, deltaTime, mutationEngine, audioSystem) {
        // Limit delta time to prevent explosion on tab switch
        const dt = Math.min(deltaTime, 0.05);

        for (const p of particles) {
            // physics integration (Euler for simplicity, could upgrade to Verlet)

            // 1. Apply DNA forces (Gravity, etc.)
            p.applyForce(p.dna.gravity.x * p.mass, p.dna.gravity.y * p.mass);

            // 2. Update Velocity
            p.vel.x += p.acc.x * dt;
            p.vel.y += p.acc.y * dt;

            // 3. Apply DNA Friction
            p.vel.x *= p.dna.friction;
            p.vel.y *= p.dna.friction;

            // 4. Update Position
            p.pos.x += p.vel.x * dt;
            p.pos.y += p.vel.y * dt;

            // Update History (limit to 10 points for performance)
            if (p.history.length > 10) p.history.shift();
            p.history.push({ x: p.pos.x, y: p.pos.y });

            // 5. Reset Acc
            p.acc.x = 0;
            p.acc.y = 0;

            // 6. Bounds interactions
            this.handleBounds(p);
        }

        // 7. Resolve Collisions (simple circle-circle)
        this.handleCollisions(particles, mutationEngine, audioSystem);
    }

    handleBounds(p) {
        const bounce = p.dna.restitution;

        if (p.pos.x - p.radius < 0) {
            p.pos.x = p.radius;
            p.vel.x *= -bounce;
        } else if (p.pos.x + p.radius > this.width) {
            p.pos.x = this.width - p.radius;
            p.vel.x *= -bounce;
        }

        if (p.pos.y - p.radius < 0) {
            p.pos.y = p.radius;
            p.vel.y *= -bounce;
        } else if (p.pos.y + p.radius > this.height) {
            p.pos.y = this.height - p.radius;
            p.vel.y *= -bounce;
        }
    }

    handleCollisions(particles, mutationEngine, audioSystem) {
        // Optimized Collision Detection using Quadtree

        // 1. Build Quadtree
        const boundary = new Rectangle(0, 0, this.width, this.height);
        const qtree = new Quadtree(boundary, 4); // Capacity 4

        for (const p of particles) {
            qtree.insert(p);
        }

        // 2. Query for collisions
        for (const p1 of particles) {
            const range = new Rectangle(
                p1.pos.x - p1.radius * 2,
                p1.pos.y - p1.radius * 2,
                p1.radius * 4,
                p1.radius * 4
            );

            const candidates = qtree.query(range);

            for (const p2 of candidates) {
                if (p1 === p2) continue; // Skip self

                const dx = p2.pos.x - p1.pos.x;
                const dy = p2.pos.y - p1.pos.y;
                const dist = Math.hypot(dx, dy);
                const minDist = p1.radius + p2.radius;

                if (dist < minDist && dist > 0.001) {
                    // Collision Normal
                    const nx = dx / dist;
                    const ny = dy / dist;

                    // Relative Velocity
                    const dvx = p2.vel.x - p1.vel.x;
                    const dvy = p2.vel.y - p1.vel.y;

                    // Speed along normal
                    const velAlongNormal = dvx * nx + dvy * ny;

                    // Do not resolve if moving apart
                    if (velAlongNormal > 0) continue;

                    // Restitution (average of both)
                    const e = Math.min(p1.dna.restitution, p2.dna.restitution);

                    // Impulse scalar
                    let jVal = -(1 + e) * velAlongNormal;
                    jVal /= (1 / p1.mass + 1 / p2.mass);

                    // Apply impulse
                    const impulseX = jVal * nx;
                    const impulseY = jVal * ny;

                    p1.vel.x -= (1 / p1.mass) * impulseX;
                    p1.vel.y -= (1 / p1.mass) * impulseY;
                    p2.vel.x += (1 / p2.mass) * impulseX;
                    p2.vel.y += (1 / p2.mass) * impulseY;

                    // Positional Correction
                    const percent = 0.2;
                    const slop = 0.01;
                    const penetration = minDist - dist;
                    if (penetration > slop) {
                        const correction = penetration / (1 / p1.mass + 1 / p2.mass) * percent;
                        const cx = correction * nx;
                        const cy = correction * ny;
                        p1.pos.x -= (1 / p1.mass) * cx;
                        p1.pos.y -= (1 / p1.mass) * cy;
                        p2.pos.x += (1 / p2.mass) * cx;
                        p2.pos.y += (1 / p2.mass) * cy;
                    }

                    // Viral Physics: Mix DNA
                    if (mutationEngine) {
                        mutationEngine.mixDNA(p1, p2);
                    }

                    // Audio
                    if (audioSystem && Math.abs(jVal) > 0.5) {
                        const speed = Math.abs(jVal); // Impulse magnitude as proxy for impact speed
                        audioSystem.playCollisionSound(speed, p1.mass);
                    }
                }
            }
        }
    }
}


