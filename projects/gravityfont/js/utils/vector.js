/**
 * GravityFont - Vector Class
 * Efficient 2D vector operations for physics simulation.
 */

class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    clone() {
        return new Vector(this.x, this.y);
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    mul(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }

    div(s) {
        if (s === 0) return this;
        this.x /= s;
        this.y /= s;
        return this;
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    magSq() {
        return this.x * this.x + this.y * this.y;
    }

    normalize() {
        const m = this.mag();
        if (m > 0) this.div(m);
        return this;
    }

    dist(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    distSq(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return dx * dx + dy * dy;
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    /**
     * Linearly interpolates between this vector and another.
     * @param {Vector} v Target vector
     * @param {number} t Interpolation factor (0-1)
     * @returns {Vector} Current instance for chaining
     */
    lerp(v, t) {
        this.x += (v.x - this.x) * t;
        this.y += (v.y - this.y) * t;
        return this;
    }

    /**
     * Static addition of two vectors.
     * @param {Vector} v1 
     * @param {Vector} v2 
     * @returns {Vector} New vector result
     */
    static add(v1, v2) {
        return new Vector(v1.x + v2.x, v1.y + v2.y);
    }

    /**
     * Static subtraction of two vectors.
     * @param {Vector} v1 
     * @param {Vector} v2 
     * @returns {Vector} New vector result
     */
    static sub(v1, v2) {
        return new Vector(v1.x - v2.x, v1.y - v2.y);
    }

    /**
     * Static multiplication of a vector by a scalar.
     * @param {Vector} v 
     * @param {number} s 
     * @returns {Vector} New vector result
     */
    static mul(v, s) {
        return new Vector(v.x * s, v.y * s);
    }

    /**
     * Static distance calculation between two vectors.
     * @param {Vector} v1 
     * @param {Vector} v2 
     * @returns {number} Distance
     */
    static dist(v1, v2) {
        return v1.dist(v2);
    }

    /**
     * Generates a random vector within a specified range.
     * @param {number} x1 
     * @param {number} x2 
     * @param {number} y1 
     * @param {number} y2 
     * @returns {Vector} New random vector
     */
    static randomInRange(x1, x2, y1, y2) {
        return new Vector(
            x1 + Math.random() * (x2 - x1),
            y1 + Math.random() * (y2 - y1)
        );
    }
}

