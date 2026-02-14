import { Complex } from './Vector.js';

/**
 * @fileoverview Discrete Fourier Transform (DFT) Engine.
 * Provides the mathematical transformation of spatial coordinates into the frequency domain.
 */

/**
 * Computes the Discrete Fourier Transform for 1D complex numbers.
 * 
 * The DFT transforms a sequence of N complex numbers {x_n} into another sequence 
 * of N complex numbers {X_k} according to the formula:
 * X_k = sum_{n=0}^{N-1} x_n * exp(-i * 2 * pi * k * n / N)
 * 
 * @param {Complex[]} x - Array of complex numbers representing the spatial path.
 * @returns {Object[]} An array of objects representing frequency components (epicycles).
 * Each component contains:
 * - re, im: Real and imaginary parts of the frequency coefficient.
 * - freq: The angular frequency index k.
 * - amp: The magnitude or amplitude of this frequency.
 * - phase: The initial phase offset in radians.
 */
export function dft(x) {
    const X = [];
    const N = x.length;

    /**
     * We iterate through each frequency bin k (from 0 to N-1).
     * This represents one epicycle in the reconstruction.
     */
    for (let k = 0; k < N; k++) {
        let sum = new Complex(0, 0);

        for (let n = 0; n < N; n++) {
            // Calculate the angle for this specific n and k pair
            const phi = (2 * Math.PI * k * n) / N;

            // exp(-i * phi) = cos(phi) - i * sin(phi)
            const c = new Complex(Math.cos(phi), -Math.sin(phi));

            // x_n * c
            sum = sum.add(x[n].multiply(c));
        }

        // Normalize the coefficient by the number of points
        sum.re = sum.re / N;
        sum.im = sum.im / N;

        const freq = k;
        const amp = sum.amplitude;
        const phase = sum.phase;

        X[k] = {
            re: sum.re,
            im: sum.im,
            freq,
            amp,
            phase
        };
    }

    /**
     * Sorting by amplitude ensures that the large circles are drawn first,
     * which creates the characteristic "spinning arm" look of epicyclic drawings.
     */
    return X.sort((a, b) => b.amp - a.amp);
}

/**
 * Normalizes a list of complex numbers around their average center.
 * @param {Complex[]} path - The raw captured path.
 * @returns {{normalized: Complex[], center: {x: number, y: number}}}
 */
export function normalizePath(path) {
    if (path.length === 0) return { normalized: [], center: { x: 0, y: 0 } };

    let sumX = 0;
    let sumY = 0;

    path.forEach(p => {
        sumX += p.re;
        sumY += p.im;
    });

    const avgX = sumX / path.length;
    const avgY = sumY / path.length;

    const normalized = path.map(p => new Complex(p.re - avgX, p.im - avgY));

    return {
        normalized,
        center: { x: avgX, y: avgY }
    };
}
