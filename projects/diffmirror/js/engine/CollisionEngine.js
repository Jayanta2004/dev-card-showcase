/**
 * CollisionEngine.js
 * Handles spatial partitioning and collision detection between generative particles.
 * Adds a layer of physical realism that reacts to behavioral deltas.
 */

import { MathUtils } from '../utils/MathUtils.js';

export class CollisionEngine {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.gridSize = 50;
        this.grid = [];
        this._initGrid();
    }

    /**
     * Resets and initializes the spatial grid.
     */
    _initGrid() {
        this.cols = Math.ceil(this.width / this.gridSize);
        this.rows = Math.ceil(this.height / this.gridSize);
        this.grid = Array.from({ length: this.cols * this.rows }, () => []);
    }

    /**
     * Resizes the engine bounds.
     */
    resize(w, h) {
        this.width = w;
        this.height = h;
        this._initGrid();
    }

    /**
     * Solves collisions between a set of particles.
     * Higher deltas reduce collision stiffness, making the system feel "fluid" or "ghostly".
     * @param {Array} particles 
     * @param {Object} deltas 
     */
    resolve(particles, deltas) {
        this._clearGrid();
        this._populateGrid(particles);

        const stiffness = 0.5 * (1 - deltas.composite);
        const radius = 5; // Interaction radius

        for (let i = 0; i < this.grid.length; i++) {
            const cell = this.grid[i];
            if (cell.length < 2) continue;

            for (let j = 0; j < cell.length; j++) {
                const p1 = cell[j];
                for (let k = j + 1; k < cell.length; k++) {
                    const p2 = cell[k];

                    const dx = p2.pos.x - p1.pos.x;
                    const dy = p2.pos.y - p1.pos.y;
                    const distSq = dx * dx + dy * dy;
                    const minDist = radius * 2;

                    if (distSq < minDist * minDist) {
                        const dist = Math.sqrt(distSq);
                        const overlap = (minDist - dist) / 2;
                        const nx = dx / dist;
                        const ny = dy / dist;

                        p1.pos.x -= nx * overlap * stiffness;
                        p1.pos.y -= ny * overlap * stiffness;
                        p2.pos.x += nx * overlap * stiffness;
                        p2.pos.y += ny * overlap * stiffness;
                    }
                }
            }
        }
    }

    _clearGrid() {
        for (const cell of this.grid) {
            cell.length = 0;
        }
    }

    _populateGrid(particles) {
        for (const p of particles) {
            const col = Math.floor(p.pos.x / this.gridSize);
            const row = Math.floor(p.pos.y / this.gridSize);

            if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
                const index = col + row * this.cols;
                this.grid[index].push(p);
            }
        }
    }

    /**
     * Diagnostic help to visualize the spatial grid.
     */
    debugRender(ctx) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < this.width; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        for (let y = 0; y < this.height; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
    }
}
