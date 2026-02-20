/**
 * SpatialGrid - Optimizes neighborhood searches by dividing space into cells.
 */
export class SpatialGrid {
    constructor(width, height, cellSize = 50) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.grid = new Array(this.cols * this.rows).fill(null).map(() => []);
    }

    clear() {
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i].length = 0;
        }
    }

    insert(boid) {
        const col = Math.floor(boid.position.x / this.cellSize);
        const row = Math.floor(boid.position.y / this.cellSize);

        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
            this.grid[row * this.cols + col].push(boid);
        }
    }

    getNearby(boid, radius) {
        const col = Math.floor(boid.position.x / this.cellSize);
        const row = Math.floor(boid.position.y / this.cellSize);
        const range = Math.ceil(radius / this.cellSize);
        const neighbors = [];

        for (let r = -range; r <= range; r++) {
            for (let c = -range; c <= range; c++) {
                const targetCol = col + c;
                const targetRow = row + r;

                if (targetCol >= 0 && targetCol < this.cols && targetRow >= 0 && targetRow < this.rows) {
                    neighbors.push(...this.grid[targetRow * this.cols + targetCol]);
                }
            }
        }
        return neighbors;
    }
}
