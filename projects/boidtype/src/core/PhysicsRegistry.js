import { Vector } from './Vector.js';

/**
 * PhysicsRegistry - A central hub for managing global environmental forces
 * and simulation constants. This allows for unified application of 
 * forces like gravity, wind, and turbulence across all autonomous agents.
 * 
 * @class PhysicsRegistry
 */
export class PhysicsRegistry {
    /**
     * Initializes the physics registry with default environment constants.
     */
    constructor() {
        /** @type {Vector} Global gravity force vector */
        this.gravity = new Vector(0, 0);

        /** @type {Vector} Global wind force vector */
        this.wind = new Vector(0, 0);

        /** @type {number} Turbulence intensity (0.0 to 1.0) */
        this.turbulence = 0.05;

        /** @type {number} Fluid resistance / friction coefficient */
        this.friction = 0.98;

        /** @type {number} Current simulation time scale (1.0 = normal speed) */
        this.timeScale = 1.0;

        /** @type {Object} Map of active environmental obstacles */
        this.obstacles = [];
    }

    /**
     * Updates the environmental forces based on simulation time.
     * Useful for dynamic wind or noise-based turbulence.
     * 
     * @param {number} time - Current simulation timestamp.
     */
    update(time) {
        // Dynamic wind shift using sine waves
        this.wind.x = Math.sin(time * 0.001) * 0.05;
        this.wind.y = Math.cos(time * 0.0008) * 0.02;
    }

    /**
     * Adds a circular obstacle to the registry for avoidance logic.
     * 
     * @param {number} x - X coordinate of the obstacle.
     * @param {number} y - Y coordinate of the obstacle.
     * @param {number} radius - Avoidance radius of the obstacle.
     */
    addObstacle(x, y, radius) {
        this.obstacles.push({
            position: new Vector(x, y),
            radius: radius
        });
    }

    /**
     * Clears all registered obstacles.
     */
    clearObstacles() {
        this.obstacles = [];
    }

    /**
     * Calculates a pseudo-random turbulence force for a given position.
     * 
     * @param {Vector} position - The position of the agent.
     * @returns {Vector} The resulting turbulence force.
     */
    getTurbulence(position) {
        const angle = (Math.sin(position.x * 0.01) + Math.cos(position.y * 0.01)) * Math.PI;
        return new Vector(Math.cos(angle), Math.sin(angle)).mult(this.turbulence);
    }

    /**
     * Sets the global gravity vector.
     * 
     * @param {number} x - X component of gravity.
     * @param {number} y - Y component of gravity.
     */
    setGravity(x, y) {
        this.gravity.x = x;
        this.gravity.y = y;
    }

    /**
     * Sets the global wind vector.
     * 
     * @param {number} x - X component of wind.
     * @param {number} y - Y component of wind.
     */
    setWind(x, y) {
        this.wind.x = x;
        this.wind.y = y;
    }
}
