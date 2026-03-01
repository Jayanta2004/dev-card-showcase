/**
 * GravityFont - Physics Engine
 * Manages the world, integration, and constraint resolution.
 */

class PhysicsEngine {
    constructor() {
        this.particles = [];
        this.constraints = [];
        this.gravity = new Vector(0, 0.5);
        this.iterations = 8; // Constraint resolution passes
        this.timeScale = 1;

        this.worldWidth = window.innerWidth;
        this.worldHeight = window.innerHeight;

        this.isPaused = false;
        this.enableGravity = true;

        // Interaction state
        this.mousePos = new Vector(-1000, -1000);
        this.isMouseDown = false;
        this.interactionRadius = 150;
        this.interactionStrength = 2;

        // Environment
        this.wind = new Vector(0, 0);
        this.windTime = 0;
    }

    /**
     * Updates environmental forces like wind.
     */
    updateEnvironment() {
        this.windTime += 0.01;
        this.wind.x = Math.sin(this.windTime) * 0.1;
        this.wind.y = Math.cos(this.windTime * 0.5) * 0.05;
    }

    /**
     * Handles mouse interaction with particles.
     */
    applyInteraction() {
        if (!this.isMouseDown) return;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            const distSq = p.position.distSq(this.mousePos);

            if (distSq < this.interactionRadius * this.interactionRadius) {
                const dist = Math.sqrt(distSq);
                const force = Vector.sub(p.position, this.mousePos)
                    .normalize()
                    .mul(this.interactionStrength * (1 - dist / this.interactionRadius));
                p.applyForce(force);
            }
        }
    }

    /**
     * Solves collisions between particles.
     * This ensures letters don't pass through each other completely.
     */
    resolveCollisions() {
        for (let i = 0; i < this.particles.length; i++) {
            const p1 = this.particles[i];

            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];

                // Only collide particles from different groups or further apart in same group
                if (p1.groupId === p2.groupId && Math.abs(i - j) < 2) continue;

                const dx = p2.position.x - p1.position.x;
                const dy = p2.position.y - p1.position.y;
                const distSq = dx * dx + dy * dy;
                const minDim = p1.radius + p2.radius;

                if (distSq < minDim * minDim) {
                    const dist = Math.sqrt(distSq);
                    const overlap = (minDim - dist) / 2;
                    const nx = dx / dist;
                    const ny = dy / dist;

                    if (!p1.isStatic) {
                        p1.position.x -= nx * overlap;
                        p1.position.y -= ny * overlap;
                    }
                    if (!p2.isStatic) {
                        p2.position.x += nx * overlap;
                        p2.position.y += ny * overlap;
                    }
                }
            }
        }
    }

    /**
     * Main update loop for the physics engine.
     * Processes forces, integration, constraints, and collisions.
     * @param {number} dt Delta time (normalized to ~16.6ms)
     */
    update(dt) {
        if (this.isPaused) return;

        this.updateEnvironment();
        this.applyInteraction();

        const adjustedDt = dt * this.timeScale;
        const currentGravity = this.enableGravity ?
            Vector.add(this.gravity, this.wind) :
            this.wind;

        // 1. Integration phase
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.update(adjustedDt, currentGravity);
            p.constrainToBoundaries(this.worldWidth, this.worldHeight);
        }

        // 2. Constraint and Collision phase
        for (let iter = 0; iter < this.iterations; iter++) {
            // Solve distance constraints
            for (let i = 0; i < this.constraints.length; i++) {
                this.constraints[i].resolve();
            }

            // Solve inter-particle collisions
            this.resolveCollisions();

            // Re-constrain to boundaries after each pass for better collision
            for (let i = 0; i < this.particles.length; i++) {
                this.particles[i].constrainToBoundaries(this.worldWidth, this.worldHeight);
            }
        }
    }

    /**
     * Adds a particle to the simulation.
     */
    addParticle(particle) {
        this.particles.push(particle);
        return particle;
    }

    /**
     * Adds a constraint between two particles.
     */
    addConstraint(p1, p2, options) {
        const c = new Constraint(p1, p2, options);
        this.constraints.push(c);
        return c;
    }

    /**
     * Removes a set of particles and constraints (e.g., when deleting a letter).
     */
    removeParticlesByGroup(groupId) {
        this.particles = this.particles.filter(p => p.groupId !== groupId);
        this.constraints = this.constraints.filter(c =>
            c.p1.groupId !== groupId && c.p2.groupId !== groupId
        );
    }

    clear() {
        this.particles = [];
        this.constraints = [];
    }

    resize(width, height) {
        this.worldWidth = width;
        this.worldHeight = height;
    }
}
