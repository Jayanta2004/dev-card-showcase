import { Config } from '../Config.js';
import { Vector2 } from './Vector2.js';

/**
 * SPHSolver (Smoothed Particle Hydrodynamics)
 * 
 * This class implements a Lagrangian fluid simulation using the SPH method.
 * It handles the core physics loop:
 * 1. Neighborhood search (Spatial Hashing)
 * 2. Density & Pressure estimation (Kernel summation)
 * 3. Force computation (Pressure Gradient, Viscosity, Gravity)
 * 4. Integration (Time stepping)
 * 
 * Kernels used:
 * - Poly6: For density estimation (smooth falloff)
 * - Spiky: For pressure forces (prevents clumping, high repulsion at core)
 * - Viscosity: For viscosity forces
 */
export class SPHSolver {
    /**
     * Initializes the physics solver.
     * @param {number} width - Domain width
     * @param {number} height - Domain height
     */
    constructor(width, height) {
        this.width = width;
        this.height = height;

        /** @type {Particle[]} Active particles in the simulation */
        this.particles = [];

        /** @type {SpatialGrid} Acceleration structure for neighbor search */
        this.grid = null; // Will be set by Simulation

        // --- Kernel Constants Precomputation ---
        // We precompute these to avoid expensive pow() calls in the inner loop.

        // Smoothing Radius (h)
        this.h = Config.SMOOTHING_RADIUS;
        this.h2 = this.h * this.h;
        this.h3 = this.h2 * this.h;
        this.h4 = this.h2 * this.h2;
        this.h5 = this.h4 * this.h; // Added missing h5 definition

        // Poly6 Kernel Constant: 315 / (64 * PI * h^9)
        // W(r, h) = (315/(64*pi*h^9)) * (h^2 - r^2)^3
        this.POLY6_CONST = 315 / (64 * Math.PI * Math.pow(this.h, 9));

        // Spiky Gradient Constant: -45 / (PI * h^6)
        // Grad(W) = (-45/(pi*h^6)) * (h-r)^2 * r_hat
        this.SPIKY_CONST = -45 / (Math.PI * Math.pow(this.h, 6)); // Corrected power to h^6 for gradient

        // Viscosity Kernel Constant: 45 / (PI * h^6)
        // Laplacian(W) = (45/(pi*h^6)) * (h-r)
        this.VISC_CONST = 45 / (Math.PI * Math.pow(this.h, 6));

        // Reusable vectors to avoid GC
        this.tempVec = new Vector2();
    }

    // Check collisions with Drains (Circles)
    resolveDrainCollisions(drains) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            let removed = false;

            for (const drain of drains) {
                const distSq = p.pos.distSq(drain.pos);
                if (distSq < drain.radiusSq) {
                    // Particle is inside drain - remove it
                    // Swap remove for O(1) performance
                    const last = this.particles[this.particles.length - 1];
                    this.particles[i] = last;
                    this.particles.pop();
                    removed = true;
                    break;
                }
            }
            // If dragging interacts with boundaries, can handle here too
        }
    }

    update(dt, drains) {
        const numParticles = this.particles.length;

        // 1. Update Grid
        this.grid.clear();
        for (let i = 0; i < numParticles; i++) {
            this.grid.addParticle(this.particles[i]);
            this.particles[i].resetForce();
        }

        // 2. Find Neighbors & Calculate Density/Pressure
        this.calculateDensityPressure();

        // 3. Calculate Forces
        this.calculateForces();

        // 4. Integrate & Enforce Boundaries
        this.integrate(dt);

        // 5. Remove particles inside Drains
        this.resolveDrainCollisions(drains);
    }

    calculateDensityPressure() {
        const numParticles = this.particles.length;

        for (let i = 0; i < numParticles; i++) {
            const p = this.particles[i];

            // Get potential neighbors from grid
            this.grid.getPotentialNeighbors(p, p.neighbors);

            // Self-density
            p.density = 0;

            for (let j = 0; j < p.neighbors.length; j++) {
                const n = p.neighbors[j];
                const distSq = p.pos.distSq(n.pos);

                if (distSq < this.h2) {
                    const diff = this.h2 - distSq;
                    p.density += this.POLY6_CONST * diff * diff * diff;
                }
            }

            // Prevent divide by zero / negative pressure artifacts
            p.density = Math.max(Config.TARGET_DENSITY, p.density);

            // Tait's EOS (Equation of State) approximation or Ideal Gas
            p.pressure = Config.PRESSURE_MULTIPLIER * (p.density - Config.TARGET_DENSITY);
        }
    }

    calculateForces() {
        const numParticles = this.particles.length;

        for (let i = 0; i < numParticles; i++) {
            const p = this.particles[i];

            // Gravity
            p.force.y += Config.GRAVITY * p.density;

            for (let j = 0; j < p.neighbors.length; j++) {
                const n = p.neighbors[j];
                if (p === n) continue;

                const distSq = p.pos.distSq(n.pos);

                if (distSq < this.h2 && distSq > 0.0001) {
                    const dist = Math.sqrt(distSq);

                    // --- PRESSURE FORCE ---
                    // F_pressure = - Mass^2 * (Pi + Pj) / (2 * rho_j) * Gradient(W)
                    // Simplified: (Pi + Pj)/(2 * rho * rho) ...

                    // Spiky Gradient: -45 / (PI * h^6) * (h - r)^2 * (r_vec / r)
                    const touch = this.h - dist;
                    const spikyTerm = this.SPIKY_CONST * touch * touch;

                    // Force Magnitude: (Pressure_i + Pressure_j) / (2 * Density_j) * Spiky
                    // Simplified SPH approximation
                    const pTerm = (p.pressure + n.pressure) / (2 * n.density);
                    const fPress = -pTerm * spikyTerm;

                    // Direction vector (p - n) normalized
                    const dx = (p.pos.x - n.pos.x) / dist;
                    const dy = (p.pos.y - n.pos.y) / dist;

                    p.force.x += fPress * dx;
                    p.force.y += fPress * dy;

                    // --- VISCOSITY FORCE ---
                    // F_visc = mu * Sum( (v_j - v_i) / rho_j * Laplacian(W) )
                    // Laplacian Viscosity Kernel: 45 / (PI * h^6) * (h - r)

                    const viscTerm = this.VISC_CONST * touch;
                    const viscMag = Config.VISCOSITY_SIGMA * viscTerm * (1.0 / n.density); // simplified mass=1

                    p.force.x += (n.vel.x - p.vel.x) * viscMag;
                    p.force.y += (n.vel.y - p.vel.y) * viscMag;
                }
            }
        }
    }

    integrate(dt) {
        const numParticles = this.particles.length;
        const width = this.width;
        const height = this.height;
        const damping = Config.COLLISION_DAMPING;
        const radius = Config.PARTICLE_RADIUS;

        for (let i = 0; i < numParticles; i++) {
            const p = this.particles[i];

            // F = ma => a = F/rho (since we treat "density" as mass accumulation in SPH approx usually)
            // But here force includes density scaling, so simpler to do: a = F / density

            const ax = p.force.x / p.density;
            const ay = p.force.y / p.density;

            p.vel.x += ax * dt;
            p.vel.y += ay * dt;

            p.pos.x += p.vel.x * dt;
            p.pos.y += p.vel.y * dt;

            // Boundaries
            if (p.pos.x < radius) {
                p.pos.x = radius;
                p.vel.x *= -damping;
            } else if (p.pos.x > width - radius) {
                p.pos.x = width - radius;
                p.vel.x *= -damping;
            }

            if (p.pos.y < radius) {
                p.pos.y = radius;
                p.vel.y *= -damping; // Bounce top? Unlikely needed but safe
            } else if (p.pos.y > height - radius) {
                p.pos.y = height - radius;
                p.vel.y *= -damping;
            }

            // Cap velocity for stability
            const maxSpeed = 1000; // pixels/sec
            const speedSq = p.vel.magSq();
            if (speedSq > maxSpeed * maxSpeed) {
                p.vel.normalize().mult(maxSpeed);
            }
        }
    }
}
