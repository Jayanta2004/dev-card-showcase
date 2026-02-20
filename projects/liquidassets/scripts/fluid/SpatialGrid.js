import { Config } from '../Config.js';

export class SpatialGrid {
    constructor(width, height) {
        this.cellSize = Config.GRID_CELL_SIZE;
        this.cols = Math.ceil(width / this.cellSize);
        this.rows = Math.ceil(height / this.cellSize);
        this.cells = new Array(this.cols * this.rows).fill(null).map(() => []);
    }

    clear() {
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i].length = 0; // Clear without reallocating array
        }
    }

    // Hash function
    getIndex(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);

        // Clamp to boundaries
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
            return -1;
        }
        return row * this.cols + col;
    }

    addParticle(particle) {
        const idx = this.getIndex(particle.pos.x, particle.pos.y);
        if (idx !== -1) {
            this.cells[idx].push(particle);
        }
    }

    // Get particles in the 3x3 surrounding cells
    getPotentialNeighbors(particle, outArray) {
        const col = Math.floor(particle.pos.x / this.cellSize);
        const row = Math.floor(particle.pos.y / this.cellSize);

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const c = col + i;
                const r = row + j;

                if (c >= 0 && c < this.cols && r >= 0 && r < this.rows) {
                    const idx = r * this.cols + c;
                    const cellParticles = this.cells[idx];
                    for (let k = 0; k < cellParticles.length; k++) {
                        outArray.push(cellParticles[k]);
                    }
                }
            }
        }
    }
}
