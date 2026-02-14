import { SPHSolver } from '../fluid/SPHSolver.js';
import { SpatialGrid } from '../fluid/SpatialGrid.js';
import { Emitter } from './Emitter.js';
import { Config } from '../Config.js';
import { Drain } from './Drain.js';

import { FluidRenderer } from './FluidRenderer.js';

/**
 * Main Simulation Loop
 * 
 * Orchestrates the physics solver, entity management, and rendering.
 * Maintains the game loop timing and state.
 */
export class Simulation {
    /**
     * @param {HTMLCanvasElement} canvas - The main simulation canvas
     */
    constructor(canvas) {
        this.canvas = canvas;
        // this.ctx not strictly needed if renderer handles it, but good for clearing
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.width = canvas.width;
        this.height = canvas.height;

        // Physics
        /** @type {SPHSolver} Physics engine */
        this.solver = new SPHSolver(this.width, this.height);
        /** @type {SpatialGrid} Neighbor acceleration */
        this.grid = new SpatialGrid(this.width, this.height);
        this.solver.grid = this.grid;

        // Renderer
        this.renderer = new FluidRenderer(canvas, this);

        // Entities
        /** @type {Emitter} Income source */
        this.emitter = new Emitter(this.width / 2, 50, this.solver);
        /** @type {Drain[]} Expense sinks */
        this.drains = [];

        // Loop
        this.isRunning = true;
        this.lastTime = 0;
        this.volume = 0; // Total liquid amount
    }

    /**
     * Resizes the simulation domain.
     * @param {number} w - New width
     * @param {number} h - New height
     */
    resize(w, h) {
        this.width = w;
        this.height = h;
        this.canvas.width = w;
        this.canvas.height = h;
        this.solver.width = w;
        this.solver.height = h;

        // Rebuild grid for new dims
        this.grid = new SpatialGrid(w, h);
        this.solver.grid = this.grid;

        // Reposition emitter
        this.emitter.x = w / 2;

        // Re-init renderer (gradients etc)
        if (this.renderer) {
            this.renderer.createGradients();
        }
    }

    addDrain(drain) {
        this.drains.push(drain);
    }

    removeDrain(id) {
        this.drains = this.drains.filter(d => d.id !== id);
    }

    update(timestamp) {
        if (!this.isRunning) return;

        const dt = Config.DT; // Fixed step

        // 1. Update Emitter (Income)
        this.emitter.update(dt);

        // 2. Physics Step
        this.solver.update(dt, this.drains);

        // 3. Render
        this.render();

        // 4. Calculate Stats
        // Approximation: numParticles * arbitrary_volume_unit
        this.volume = this.solver.particles.length;
    }

    render() {
        if (!this.renderer) {
            // Lazy load renderer or passed in ctor? 
            // Better to have it passed or instantiated. 
            // For now, let's assume it's instantiated in constructor or we do it here.
            // But to be clean, let's update constructor.
        }
        // Delegated to external renderer
        this.renderer.render(Config.DT);
    }

    // Specifically for the "Pixel Data" requirement
    calculateVolumePixels() {
        // This is expensive, so maybe call only once per second or use a smaller offscreen canvas
        // For now, let's just return normalized particle count
        return this.solver.particles.length;
    }
}
