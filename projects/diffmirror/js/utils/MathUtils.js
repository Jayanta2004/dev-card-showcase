/**
 * MathUtils.js
 * Comprehensive mathematical utility library for DiffMirror.
 * Handles vector operations, interpolation, and statistical normalization.
 */

export class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Adds another vector to this one.
     * @param {Vector2D} v 
     * @returns {Vector2D}
     */
    add(v) {
        return new Vector2D(this.x + v.x, this.y + v.y);
    }

    /**
     * Subtracts another vector from this one.
     * @param {Vector2D} v 
     * @returns {Vector2D}
     */
    sub(v) {
        return new Vector2D(this.x - v.x, this.y - v.y);
    }

    /**
     * Multiplies the vector by a scalar.
     * @param {number} s 
     * @returns {Vector2D}
     */
    mul(s) {
        return new Vector2D(this.x * s, this.y * s);
    }

    /**
     * Divides the vector by a scalar.
     * @param {number} s 
     * @returns {Vector2D}
     */
    div(s) {
        return s !== 0 ? new Vector2D(this.x / s, this.y / s) : new Vector2D();
    }

    /**
     * Calculates the magnitude (length) of the vector.
     * @returns {number}
     */
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Returns a normalized version of the vector.
     * @returns {Vector2D}
     */
    normalize() {
        const m = this.mag();
        return m > 0 ? this.div(m) : new Vector2D();
    }

    /**
     * Calculates the distance to another vector.
     */
    dist(v) {
        return this.sub(v).mag();
    }

    /**
     * Linear interpolation between this and another vector.
     */
    lerp(v, t) {
        return new Vector2D(
            this.x + (v.x - this.x) * t,
            this.y + (v.y - this.y) * t
        );
    }

    clone() {
        return new Vector2D(this.x, this.y);
    }
}

export const MathUtils = {
    /**
     * Maps a value from one range to another.
     */
    map(n, start1, stop1, start2, stop2) {
        return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
    },

    /**
     * Constrains a value within a range.
     */
    clamp(n, low, high) {
        return Math.max(Math.min(n, high), low);
    },

    /**
     * Linear interpolation between two numbers.
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    /**
     * Smoother interpolation.
     */
    smootherstep(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    },

    /**
     * Generates a random float within a range.
     */
    random(min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return Math.random() * (max - min) + min;
    },

    /**
     * Calculates the average value of an array of numbers.
     */
    average(arr) {
        if (!arr.length) return 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    },

    /**
     * Calculates the standard deviation of an array of numbers.
     * Useful for behavioral consistency analysis.
     */
    standardDeviation(arr) {
        const avg = this.average(arr);
        const squareDiffs = arr.map(v => Math.pow(v - avg, 2));
        return Math.sqrt(this.average(squareDiffs));
    }
};
