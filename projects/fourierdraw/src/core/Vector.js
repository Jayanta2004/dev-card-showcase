/**
 * @fileoverview Enhanced Complex Number and Vector mathematics library.
 * Provides the foundation for all Fourier transformations and spatial operations.
 */

/**
 * Represents a Complex Number in the form a + bi.
 * Used for storing 2D coordinates in a way that is compatible with Fourier Transforms.
 */
export class Complex {
    /**
     * Create a complex number.
     * @param {number} re - The real part (corresponds to X in Cartesian).
     * @param {number} im - The imaginary part (corresponds to Y in Cartesian).
     */
    constructor(re = 0, im = 0) {
        /** @type {number} */
        this.re = re;
        /** @type {number} */
        this.im = im;
    }

    /**
     * Adds another complex number to this one.
     * @param {Complex} c - The complex number to add.
     * @returns {Complex} A new Complex instance representing the sum.
     */
    add(c) {
        return new Complex(this.re + c.re, this.im + c.im);
    }

    /**
     * Subtracts another complex number from this one.
     * @param {Complex} c - The complex number to subtract.
     * @returns {Complex} A new Complex instance representing the difference.
     */
    subtract(c) {
        return new Complex(this.re - c.re, this.im - c.im);
    }

    /**
     * Multiplies this complex number by another.
     * Formula: (a+bi)(c+di) = (ac-bd) + (ad+bc)i
     * @param {Complex} c - The complex number to multiply by.
     * @returns {Complex} A new Complex instance representing the product.
     */
    multiply(c) {
        const re = this.re * c.re - this.im * c.im;
        const im = this.re * c.im + this.im * c.re;
        return new Complex(re, im);
    }

    /**
     * Multiplies this complex number by a scalar value.
     * @param {number} s - The scalar value.
     * @returns {Complex} A new Complex instance.
     */
    scalarMultiply(s) {
        return new Complex(this.re * s, this.im * s);
    }

    /**
     * Calculates the conjugate of this complex number.
     * @returns {Complex} A new Complex instance with inverted imaginary part.
     */
    conjugate() {
        return new Complex(this.re, -this.im);
    }

    /**
     * The magnitude (or amplitude) of the complex number.
     * Equivalent to sqrt(re^2 + im^2).
     * @returns {number}
     */
    get amplitude() {
        return Math.sqrt(this.re * this.re + this.im * this.im);
    }

    /**
     * The phase (or argument) of the complex number in radians.
     * Equivalent to atan2(im, re).
     * @returns {number}
     */
    get phase() {
        return Math.atan2(this.im, this.re);
    }

    /**
     * Returns a string representation of the complex number.
     * @returns {string}
     */
    toString() {
        return `${this.re.toFixed(2)} + ${this.im.toFixed(2)}i`;
    }

    /**
     * Static utility to create a Complex number from polar coordinates.
     * @param {number} r - Radius (magnitude).
     * @param {number} phi - Angle in radians.
     * @returns {Complex}
     */
    static fromPolar(r, phi) {
        return new Complex(r * Math.cos(phi), r * Math.sin(phi));
    }

    /**
     * Clones the current complex number.
     * @returns {Complex}
     */
    copy() {
        return new Complex(this.re, this.im);
    }

    /**
     * Calculates the dot product as if these were 2D vectors.
     * @param {Complex} c 
     * @returns {number}
     */
    dot(c) {
        return this.re * c.re + this.im * c.im;
    }
}
