/**
 * Vector - A comprehensive 2D vector mathematics library.
 * Provides essential operations for physics-based simulations, including
 * arithmetic, normalization, distance calculations, and static utilities.
 * 
 * @class Vector
 */
export class Vector {
    /**
     * Creates a new 2D vector.
     * @param {number} [x=0] - Initial X coordinate.
     * @param {number} [y=0] - Initial Y coordinate.
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Adds another vector to this instance.
     * @param {Vector} v - Vector to add.
     * @returns {Vector} Current instance for chaining.
     */
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    /**
     * Subtracts another vector from this instance.
     * @param {Vector} v - Vector to subtract.
     * @returns {Vector} Current instance for chaining.
     */
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    /**
     * Multiplies current vector by a scalar.
     * @param {number} n - Multiplication factor.
     * @returns {Vector} Current instance for chaining.
     */
    mult(n) {
        this.x *= n;
        this.y *= n;
        return this;
    }

    /**
     * Divides current vector by a scalar.
     * @param {number} n - Division factor.
     * @returns {Vector} Current instance for chaining.
     */
    div(n) {
        if (n !== 0) {
            this.x /= n;
            this.y /= n;
        }
        return this;
    }

    /**
     * Calculates the magnitude (length) of the vector.
     * @returns {number} The magnitude.
     */
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Calculates the squared magnitude. Faster than mag() for comparisons.
     * @returns {number} Squared magnitude.
     */
    magSq() {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * Normalizes the vector to unit length (1).
     * @returns {Vector} Current instance for chaining.
     */
    normalize() {
        const m = this.mag();
        if (m > 0) {
            this.div(m);
        }
        return this;
    }

    /**
     * Limits the magnitude of the vector to a maximum value.
     * @param {number} max - Maximum magnitude allowed.
     * @returns {Vector} Current instance for chaining.
     */
    limit(max) {
        const mSq = this.magSq();
        if (mSq > max * max) {
            this.normalize().mult(max);
        }
        return this;
    }

    /**
     * Sets the magnitude of the vector precisely.
     * @param {number} n - New magnitude.
     * @returns {Vector} Current instance for chaining.
     */
    setMag(n) {
        return this.normalize().mult(n);
    }

    /**
     * Calculates the Euclidean distance to another vector.
     * @param {Vector} v - Target vector.
     * @returns {number} Distance.
     */
    dist(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculates the squared Euclidean distance to another vector.
     * @param {Vector} v - Target vector.
     * @returns {number} Squared distance.
     */
    distSq(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return dx * dx + dy * dy;
    }

    /**
     * Calculates the dot product with another vector.
     * @param {Vector} v - Other vector.
     * @returns {number} Dot product.
     */
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    /**
     * Calculates the angle of the vector relative to the X-axis.
     * @returns {number} Angle in radians.
     */
    heading() {
        return Math.atan2(this.y, this.x);
    }

    /**
     * Rotates the vector by a given angle.
     * @param {number} angle - Angle in radians.
     * @returns {Vector} Current instance for chaining.
     */
    rotate(angle) {
        const newHeading = this.heading() + angle;
        const m = this.mag();
        this.x = Math.cos(newHeading) * m;
        this.y = Math.sin(newHeading) * m;
        return this;
    }

    /**
     * Linearly interpolates between this vector and another.
     * @param {Vector} v - Target vector.
     * @param {number} amt - Interpolation amount (0 to 1).
     * @returns {Vector} Current instance for chaining.
     */
    lerp(v, amt) {
        this.x += (v.x - this.x) * amt;
        this.y += (v.y - this.y) * amt;
        return this;
    }

    /**
     * Creates a deep copy of the vector.
     * @returns {Vector} A new identical Vector instance.
     */
    copy() {
        return new Vector(this.x, this.y);
    }

    // Static Utilities

    /**
     * Static addition of two vectors.
     * @param {Vector} v1 
     * @param {Vector} v2 
     * @returns {Vector}
     */
    static add(v1, v2) {
        return new Vector(v1.x + v2.x, v1.y + v2.y);
    }

    /**
     * Static subtraction of two vectors.
     * @param {Vector} v1 
     * @param {Vector} v2 
     * @returns {Vector}
     */
    static sub(v1, v2) {
        return new Vector(v1.x - v2.x, v1.y - v2.y);
    }

    /**
     * Static multiplication of a vector by a scalar.
     * @param {Vector} v 
     * @param {number} n 
     * @returns {Vector}
     */
    static mult(v, n) {
        return new Vector(v.x * n, v.y * n);
    }

    /**
     * Static division of a vector by a scalar.
     * @param {Vector} v 
     * @param {number} n 
     * @returns {Vector}
     */
    static div(v, n) {
        return new Vector(v.x / n, v.y / n);
    }

    /**
     * Creates a new vector with random direction and unit magnitude.
     * @returns {Vector}
     */
    static random2D() {
        const angle = Math.random() * Math.PI * 2;
        return new Vector(Math.cos(angle), Math.sin(angle));
    }

    /**
     * Calculates the angle between two vectors.
     * @param {Vector} v1 
     * @param {Vector} v2 
     * @returns {number} Angle in radians.
     */
    static angleBetween(v1, v2) {
        const dot = v1.dot(v2);
        const amt = dot / (v1.mag() * v2.mag());
        return Math.acos(Math.min(1, Math.max(-1, amt)));
    }
}
