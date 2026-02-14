import { Config } from '../core/Config.js';
import { Vector2 } from '../utils/Vector2.js';

/**
 * @class SpatialHash
 * @description A spatial partitioning system to optimize collision detection.
 * painting strokes works by checking "points" or "segments".
 * We hash segments into grid cells. checking for intersections only checks neighbor cells.
 */
export class SpatialHash {
    constructor() {
        this.cellSize = Config.DRAWING.SPATIAL_CELL_SIZE;
        this.cells = new Map(); // Key: "x,y", Value: Array of items
    }

    /**
     * @method _getKey
     * @param {number} x 
     * @param {number} y 
     * @returns {string} Cell key
     */
    _getKey(x, y) {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX},${cellY}`;
    }

    /**
     * @method insert
     * @description Inserts an item into the hash.
     * @param {Vector2} position - Position of the item point
     * @param {Object} data - Metadata (e.g., strokeId)
     */
    insert(position, data) {
        const key = this._getKey(position.x, position.y);

        if (!this.cells.has(key)) {
            this.cells.set(key, []);
        }

        this.cells.get(key).push({
            position: position,
            data: data
        });
    }

    /**
     * @method query
     * @description Retrieve items near a position.
     * Checks the cell containing the position and immediate neighbors (3x3 grid).
     * @param {Vector2} position 
     * @returns {Array} Array of items
     */
    query(position) {
        const results = [];
        const cellX = Math.floor(position.x / this.cellSize);
        const cellY = Math.floor(position.y / this.cellSize);

        // Check 3x3 surrounding cells
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                const key = `${cellX + x},${cellY + y}`;
                if (this.cells.has(key)) {
                    const items = this.cells.get(key);
                    for (let item of items) {
                        results.push(item);
                    }
                }
            }
        }
        return results;
    }

    /**
     * @method clear
     */
    clear() {
        this.cells.clear();
    }
}
