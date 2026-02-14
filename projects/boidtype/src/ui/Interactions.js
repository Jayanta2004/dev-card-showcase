import { Vector } from '../core/Vector.js';

/**
 * Interactions - Manages advanced user input and creates interactive
 * environmental influences like explosions, black holes, and vortexes
 * within the simulation.
 * 
 * @class Interactions
 */
export class Interactions {
    /**
     * Initializes the interaction manager.
     * @param {Object} simulation - Reference to the main Simulation instance.
     */
    constructor(simulation) {
        /** @type {Object} The simulation being influenced */
        this.simulation = simulation;

        /** @type {Vector} Current pointer position */
        this.pointer = new Vector(-1000, -1000);

        /** @type {boolean} Is the primary pointer currently active (e.g., mouse down) */
        this.isPressed = false;

        /** @type {string} Current interaction mode ('repel', 'attract', 'vortex') */
        this.mode = 'repel';
    }

    /**
     * Updates the local pointer position.
     * @param {number} x 
     * @param {number} y 
     */
    updatePointer(x, y) {
        this.pointer.x = x;
        this.pointer.y = y;
    }

    /**
     * Handles pointer down/start events.
     */
    handleStart() {
        this.isPressed = true;

        // Trigger explosion-like effect on click
        if (this.mode === 'repel') {
            this.explode(this.pointer, 200, 10);
        }
    }

    /**
     * Handles pointer up/end events.
     */
    handleEnd() {
        this.isPressed = false;
    }

    /**
     * Applies active interaction forces to all boids.
     * Called every frame in the main update loop.
     */
    applyForces() {
        if (!this.isPressed) return;

        for (let boid of this.simulation.boids) {
            let force = new Vector(0, 0);
            const dist = this.pointer.dist(boid.position);
            const radius = 300;

            if (dist < radius) {
                if (this.mode === 'attract') {
                    force = Vector.sub(this.pointer, boid.position);
                    force.setMag(0.5 * (1 - dist / radius));
                } else if (this.mode === 'vortex') {
                    // Calculate perpendicular vector for rotation
                    let diff = Vector.sub(this.pointer, boid.position);
                    force = new Vector(-diff.y, diff.x);
                    force.setMag(0.8 * (1 - dist / radius));

                    // Add slight pull towards center
                    let pull = diff.normalize().mult(0.2);
                    force.add(pull);
                }
            }
            boid.applyForce(force);
        }
    }

    /**
     * Triggers a momentary high-intensity repulsion force from a point.
     * 
     * @param {Vector} origin - The center of the explosion.
     * @param {number} radius - How far the force reaches.
     * @param {number} strength - Initial magnitude of the force.
     */
    explode(origin, radius, strength) {
        for (let boid of this.simulation.boids) {
            const d = boid.position.dist(origin);
            if (d < radius) {
                let force = Vector.sub(boid.position, origin);
                force.normalize().mult(strength * (1 - d / radius));
                boid.applyForce(force);
            }
        }
    }

    /**
     * Changes the current active interaction mode.
     * @param {string} newMode - 'repel' | 'attract' | 'vortex'
     */
    setMode(newMode) {
        this.mode = newMode;
        console.log(`Interactions: Mode changed to ${newMode}`);
    }
}
