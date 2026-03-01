/**
 * GRAVITYTYPE // AABB MODULE
 * scripts/physics/aabb.js
 * 
 * Axis-Aligned Bounding Box implementation for Broadphase Collision.
 */

class AABB {
    /**
     * Create AABB.
     * @param {Vector2} center - Center position
     * @param {number} width 
     * @param {number} height 
     */
    constructor(center, width, height) {
        this.min = new Vector2();
        this.max = new Vector2();
        this.update(center, width, height);
    }

    /**
     * Update bounds based on new position and dimensions.
     * @param {Vector2} center 
     * @param {number} width 
     * @param {number} height 
     */
    update(center, width, height) {
        const hw = width / 2;
        const hh = height / 2;

        // Min: Top-Left
        this.min.x = center.x - hw;
        this.min.y = center.y - hh;

        // Max: Bottom-Right
        this.max.x = center.x + hw;
        this.max.y = center.y + hh;
    }

    /**
     * Check intersection with another AABB.
     * @param {AABB} other 
     * @returns {boolean}
     */
    intersects(other) {
        // Exit early if gap found on any axis
        if (this.max.x < other.min.x || this.min.x > other.max.x) return false;
        if (this.max.y < other.min.y || this.min.y > other.max.y) return false;

        return true;
    }

    /**
     * Check if point is inside.
     * @param {Vector2} point 
     * @returns {boolean}
     */
    contains(point) {
        return (
            point.x >= this.min.x &&
            point.x <= this.max.x &&
            point.y >= this.min.y &&
            point.y <= this.max.y
        );
    }
}
