/**
 * GRAVITYTYPE // SPATIAL PARTITIONING
 * scripts/physics/spatial.js
 * 
 * Implements a Spatial Hash Grid for O(1) broadphase lookups.
 * Critical for 500+ body performance.
 */

class SpatialHash {
    /**
     * @param {number} cellSize Size of grid buckets (should be > avg body size)
     */
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.grid = new Map();
    }

    /**
     * Generate unique key for cell coordinates.
     * @param {number} x 
     * @param {number} y 
     * @returns {string} "x,y"
     */
    _key(x, y) {
        return `${x},${y}`;
    }

    /**
     * Clear grid for next frame.
     */
    clear() {
        this.grid.clear();
    }

    /**
     * Insert body into all cells it overlaps.
     * @param {RigidBody} body 
     */
    insert(body) {
        const aabb = body.aabb;

        const startX = Math.floor(aabb.min.x / this.cellSize);
        const startY = Math.floor(aabb.min.y / this.cellSize);
        const endX = Math.floor(aabb.max.x / this.cellSize);
        const endY = Math.floor(aabb.max.y / this.cellSize);

        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                const k = this._key(x, y);
                if (!this.grid.has(k)) {
                    this.grid.set(k, []);
                }
                this.grid.get(k).push(body);
            }
        }
    }

    /**
     * Retrieve potential collision candidates.
     * @param {RigidBody} body 
     * @returns {RigidBody[]} Unique list of nearby bodies
     */
    query(body) {
        const aabb = body.aabb;
        const candidates = new Set();

        const startX = Math.floor(aabb.min.x / this.cellSize);
        const startY = Math.floor(aabb.min.y / this.cellSize);
        const endX = Math.floor(aabb.max.x / this.cellSize);
        const endY = Math.floor(aabb.max.y / this.cellSize);

        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                const k = this._key(x, y);
                const cell = this.grid.get(k);
                if (cell) {
                    for (let i = 0; i < cell.length; i++) {
                        const other = cell[i];
                        if (other !== body) {
                            candidates.add(other);
                        }
                    }
                }
            }
        }

        return Array.from(candidates);
    }
}
