import { Boid } from './Boid.js';
import { Vector } from './Vector.js';
import { SpatialGrid } from './SpatialGrid.js';
import { PhysicsRegistry } from './PhysicsRegistry.js';
import { FontAnalyzer } from '../modules/FontAnalyzer.js';
import { SequenceEngine } from '../modules/SequenceEngine.js';
import { PresetManager } from '../modules/PresetManager.js';
import { AudioEngine } from '../modules/AudioEngine.js';

/**
 * Simulation - The primary controller for the BoidType environment.
 * Responsible for population management, behavior orchestration, 
 * environmental integration, and typographic targeting.
 * 
 * @class Simulation
 */
export class Simulation {
    /**
     * Initializes the simulation environment and core systems.
     */
    constructor() {
        /** @type {Boid[]} Active population of autonomous agents */
        this.boids = [];

        /** @type {Vector[]} Current set of typographic target positions */
        this.targets = [];

        /** @type {FontAnalyzer} Typography analysis utility */
        this.analyzer = new FontAnalyzer();

        /** @type {SpatialGrid} Acceleration structure for neighborhood searches */
        this.grid = new SpatialGrid(window.innerWidth, window.innerHeight, 50);

        /** @type {PhysicsRegistry} Global environmental force registry */
        this.physicsRegistry = new PhysicsRegistry();

        /** @type {SequenceEngine} Timed word progression controller */
        this.sequence = new SequenceEngine(this);

        /** @type {PresetManager} Persistence handler for simulation states */
        this.presets = new PresetManager(this);

        /** @type {AudioEngine} Sound reactivity engine */
        this.audio = new AudioEngine();

        /** @type {Vector} Current cursor position in 2D space */
        this.mouse = new Vector(-1000, -1000);

        /** @type {number} Proximity threshold for cursor repulsion */
        this.repulsionRadius = 150;

        /** @type {string} Master color for boids (hex string) */
        this.boidColor = '#00f2ff';

        /** @type {Object} Core configuration state */
        this.config = {
            text: 'BOIDTYPE',
            density: 6,
            autoMorph: false
        };

        /** @type {number} Elapsed time tracking for physics updates */
        this.lastTime = 0;
    }

    /**
     * Performs initial setup, including default target generation.
     */
    init() {
        this.updateTargets(this.config.text);
    }

    /**
     * Calculates new target positions based on text and updates the boid population.
     * Efficiently spawns or removes boids to match the target count.
     * 
     * @param {string} text - The words to form with particles.
     */
    updateTargets(text) {
        if (!text || text.trim().length === 0) return;

        this.config.text = text.toUpperCase();
        this.targets = this.analyzer.extractPoints(this.config.text, this.config.density);

        // Match population size to target count
        if (this.boids.length < this.targets.length) {
            const needed = this.targets.length - this.boids.length;
            for (let i = 0; i < needed; i++) {
                const x = Math.random() < 0.5 ? -50 : window.innerWidth + 50;
                const y = Math.random() * window.innerHeight;
                const boid = new Boid(x, y);
                boid.color = this.boidColor;
                this.boids.push(boid);
            }
        } else if (this.boids.length > this.targets.length) {
            // Cull excessive boids from the end
            this.boids.splice(this.targets.length);
        }

        // Weighted target assignment (simple index mapping)
        // Optimization: Use bipartite matching for smoother transitions if needed
        for (let i = 0; i < this.boids.length; i++) {
            this.boids[i].target = this.targets[i];
        }
    }

    /**
     * Synchronizes external mouse coordinates with the internal simulation state.
     * @param {number} x - Pixel X coordinate.
     * @param {number} y - Pixel Y coordinate.
     */
    updateMouse(x, y) {
        this.mouse.x = x;
        this.mouse.y = y;
    }

    /**
     * Main animation frame update logic.
     * Called 60 times per second.
     * 
     * @param {number} time - Performance timestamp.
     */
    update(time = 0) {
        // Update environmental forces
        this.physicsRegistry.update(time);
        this.audio.update();

        // Refresh spatial partitioning grid
        this.grid.clear();
        for (let boid of this.boids) {
            this.grid.insert(boid);
        }

        const bassScale = 1 + this.audio.getBass() * 2;

        // Process individual boid logic
        for (let boid of this.boids) {
            // Get local neighborhood
            const neighbors = this.grid.getNearby(boid, 60);

            // 1. Core Social Behaviors (Separation, Alignment, Cohesion)
            boid.flock(neighbors);

            // 2. Typographic Target Tracking
            if (boid.target) {
                const arriveForce = boid.arrive(boid.target);
                boid.applyForce(arriveForce);
            }

            // 3. User Interaction - Cursor Repulsion
            const fleeForce = boid.flee(this.mouse, this.repulsionRadius);
            boid.applyForce(fleeForce);

            // 4. Procedural Wander (Active when far from targets)
            if (!boid.target || boid.position.dist(boid.target) > 200) {
                const wanderForce = boid.wander();
                boid.applyForce(wanderForce.mult(boid.weights.wander));
            }

            // 5. Global Environmental Influences
            boid.applyForce(this.physicsRegistry.wind);
            boid.applyForce(this.physicsRegistry.gravity);

            // 6. Obstacle Avoidance
            if (this.physicsRegistry.obstacles.length > 0) {
                const avoidForce = boid.avoidObstacles(this.physicsRegistry.obstacles);
                boid.applyForce(avoidForce.mult(boid.weights.avoid));
            }

            // 7. Audio Modulated Scaling
            boid.size = 2 * bassScale;

            // Final integration
            boid.update();
            boid.edges(window.innerWidth, window.innerHeight);
        }
    }

    /**
     * Handles window resize events by reinitializing spatial structures
     * and recalculating centered target positions.
     */
    resize() {
        this.grid = new SpatialGrid(window.innerWidth, window.innerHeight, 50);
        this.updateTargets(this.config.text);
    }

    /**
     * Globally changes the visual color of all boids.
     * @param {string} color - Hex color code.
     */
    setColor(color) {
        this.boidColor = color;
        for (let boid of this.boids) {
            boid.color = color;
        }
    }
}
