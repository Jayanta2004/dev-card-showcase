/**
 * SIMUGRID VECTOR MATH KERNEL
 * Custom 2D Linear Algebra implementation for Physics Simulations.
 * @author saiusesgithub
 */

class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    // --- Basic Arithmetic ---
    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }

    sub(v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }

    mul(s) {
        return new Vec2(this.x * s, this.y * s);
    }

    div(s) {
        if (s === 0) return new Vec2();
        return new Vec2(this.x / s, this.y / s);
    }

    // --- Vector Properties ---
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    magSq() {
        return this.x * this.x + this.y * this.y;
    }

    normalize() {
        const m = this.mag();
        return m > 0 ? this.div(m) : new Vec2();
    }

    // --- Geometric Operations ---
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    /**
     * 2D Cross Product Magnitude
     * In 2D, this represents the Z-component of the 3D cross product.
     */
    cross(v) {
        return this.x * v.y - this.y * v.x;
    }

    dist(v) {
        return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2);
    }

    /**
     * Normal Vector (90 degree rotation)
     * Useful for SAT collision detection to find axes.
     */
    perp() {
        return new Vec2(-this.y, this.x);
    }

    /**
     * Rotate the vector by an angle
     * @param {number} angle - Rotation in radians
     */
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vec2(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        );
    }

    copy() {
        return new Vec2(this.x, this.y);
    }

    static fromAngle(angle) {
        return new Vec2(Math.cos(angle), Math.sin(angle));
    }
}

// Global Export for SimuGrid Engine
window.Vec2 = Vec2;