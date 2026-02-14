/**
 * spatial.js
 * Grid-based spatial partitioning to optimize collision detection from O(n^2) to ~O(n).
 */

class SpatialGrid {
    constructor(width, height, cellSize) {
        this.cellSize = cellSize;
        this.updateDimensions(width, height);
    }

    updateDimensions(width, height) {
        this.width = width;
        this.height = height;
        this.cols = Math.ceil(width / this.cellSize);
        this.rows = Math.ceil(height / this.cellSize);
        this.clear();
    }

    clear() {
        // Initialize or clear the grid
        this.grid = new Array(this.cols * this.rows);
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = [];
        }
    }

    /**
     * Map coordinates to grid index
     */
    getIndex(x, y) {
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);

        // Clamp to grid bounds
        const col = Utils.clamp(cx, 0, this.cols - 1);
        const row = Utils.clamp(cy, 0, this.rows - 1);

        return row * this.cols + col;
    }

    /**
     * Add an object to the grid based on its position
     */
    insert(obj) {
        const idx = this.getIndex(obj.x, obj.y);
        this.grid[idx].push(obj);
    }

    /**
     * Get all objects in a specific cell and its 8 neighbors
     */
    getNearby(obj) {
        const cx = Math.floor(obj.x / this.cellSize);
        const cy = Math.floor(obj.y / this.cellSize);
        const results = [];

        for (let y = cy - 1; y <= cy + 1; y++) {
            for (let x = cx - 1; x <= cx + 1; x++) {
                if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
                    const idx = y * this.cols + x;
                    const cell = this.grid[idx];
                    for (let i = 0; i < cell.length; i++) {
                        results.push(cell[i]);
                    }
                }
            }
        }
        return results;
    }
}
