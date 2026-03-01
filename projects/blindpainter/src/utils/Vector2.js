/**
 * @class Vector2
 * @description A robust 2D vector class for geometry operations in BlindPainter.
 * Handles position, velocity, and force calculations.
 * 
 * We use this extensively for the physical representation of strokes.
 */
export class Vector2 {
    /**
     * @constructor
     * @param {number} x - The x component
     * @param {number} y - The y component
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * @method add
     * @description Adds another vector to this one.
     * @param {Vector2} v - The vector to add
     * @returns {Vector2} New Vector2
     */
    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    /**
     * @method sub
     * @description Subtracts another vector from this one.
     * @param {Vector2} v - The vector to subtract
     * @returns {Vector2} New Vector2
     */
    sub(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    /**
     * @method mult
     * @description Multiplies vector by scalar.
     * @param {number} n - Scalar
     * @returns {Vector2} New Vector2
     */
    mult(n) {
        return new Vector2(this.x * n, this.y * n);
    }

    /**
     * @method div
     * @description Divides vector by scalar.
     * @param {number} n - Scalar
     * @returns {Vector2} New Vector2
     */
    div(n) {
        if (n === 0) {
            console.warn("Vector2: Division by zero");
            return new Vector2(0, 0);
        }
        return new Vector2(this.x / n, this.y / n);
    }

    /**
     * @method mag
     * @description Calculates magnitude (length).
     * @returns {number} Magnitude
     */
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * @method normalize
     * @description Normalizes the vector (length 1).
     * @returns {Vector2} Normalized Vector2
     */
    normalize() {
        const m = this.mag();
        if (m === 0) return new Vector2(0, 0);
        return this.div(m);
    }

    /**
     * @method dist
     * @description Euclidean distance to another vector.
     * @param {Vector2} v - Target vector
     * @returns {number} Distance
     */
    dist(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * @method dot
     * @description Dot product.
     * @param {Vector2} v - Other vector
     * @returns {number} Dot product
     */
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    /**
     * @method clone
     * @returns {Vector2} Copy of this vector
     */
    clone() {
        return new Vector2(this.x, this.y);
    }

    /**
     * @method toString
     * @returns {string} String representation
     */
    toString() {
        return `Vector2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }

    /**
     * @static
     * @method fromObject
     * @param {Object} obj - {x, y}
     * @returns {Vector2}
     */
    static fromObject(obj) {
        return new Vector2(obj.x, obj.y);
    }
}
