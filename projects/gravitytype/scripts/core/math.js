/**
 * GRAVITYTYPE // MATH MODULE
 * scripts/core/math.js
 * 
 * Provides robust vector math and utility functions.
 * Designed for high-performance physics calculations.
 */

/**
 * @typedef {Object} IVector2
 * @property {number} x
 * @property {number} y
 */

/**
 * A 2D mutable vector class with chainable methods.
 */
class Vector2 {
    /**
     * Creates a new Vector2 instance.
     * @param {number} x - The X component.
     * @param {number} y - The Y component.
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Set vector components.
     * @param {number} x 
     * @param {number} y 
     * @returns {Vector2}
     */
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Add another vector to this one.
     * @param {Vector2} v 
     * @returns {Vector2}
     */
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    /**
     * Subtract another vector from this one.
     * @param {Vector2} v 
     * @returns {Vector2}
     */
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    /**
     * Multiply this vector by a scalar.
     * @param {number} s 
     * @returns {Vector2}
     */
    mult(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }

    /**
     * Divide this vector by a scalar.
     * @param {number} s 
     * @returns {Vector2}
     */
    div(s) {
        if (s !== 0) {
            this.x /= s;
            this.y /= s;
        }
        return this;
    }

    /**
     * Calculate magnitude (length).
     * @returns {number}
     */
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Calculate squared magnitude (optimization for comparisons).
     * @returns {number}
     */
    magSq() {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * Normalize this vector to unit length.
     * @returns {Vector2}
     */
    normalize() {
        const m = this.mag();
        if (m > 0) {
            this.div(m);
        }
        return this;
    }

    /**
     * Calculate distance to another vector.
     * @param {Vector2} v 
     * @returns {number}
     */
    dist(v) {
        return Math.sqrt(this.distSq(v));
    }

    /**
     * Calculate squared distance.
     * @param {Vector2} v 
     * @returns {number}
     */
    distSq(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return dx * dx + dy * dy;
    }

    /**
     * Dot product.
     * @param {Vector2} v 
     * @returns {number}
     */
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    /**
     * Create a copy of this vector.
     * @returns {Vector2}
     */
    clone() {
        return new Vector2(this.x, this.y);
    }

    /**
     * Static helper: Add two vectors and return new one.
     * @param {Vector2} v1 
     * @param {Vector2} v2 
     * @returns {Vector2}
     */
    static add(v1, v2) {
        return new Vector2(v1.x + v1.y, v2.x + v2.y);
    }
}

/**
 * General Math Utilities
 */
const MathUtils = {
    /**
     * Clamp a value between min and max.
     * @param {number} val 
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    clamp: (val, min, max) => Math.max(min, Math.min(max, val)),

    /**
     * Generate random number in range [min, max).
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    randRange: (min, max) => Math.random() * (max - min) + min,

    /**
     * Generate random hex color from predefined neon palette.
     * @returns {string}
     */
    randNeon: () => {
        const palette = [
            '#00f3ff', // Cyan
            '#bc13fe', // Pink
            '#0aff0a', // Green
            '#f0e600', // Yellow
            '#ffffff'  // White
        ];
        return palette[Math.floor(Math.random() * palette.length)];
    },

    /**
     * Linear interpolation.
     * @param {number} start 
     * @param {number} end 
     * @param {number} t 
     * @returns {number}
     */
    lerp: (start, end, t) => start * (1 - t) + end * t
};
