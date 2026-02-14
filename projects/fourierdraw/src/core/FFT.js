import { Complex } from './Vector.js';

/**
 * @fileoverview Fast Fourier Transform (FFT) logic.
 * Implements a recursive Cooley-Tukey algorithm for faster signal processing.
 */

/**
 * Performs a radix-2 Fast Fourier Transform.
 * Input array length must be a power of two.
 * @param {Complex[]} x - Array of complex numbers.
 * @returns {Complex[]} The transformed array.
 */
export function fft(x) {
    const N = x.length;

    // Base case
    if (N <= 1) return x;

    // Split even and odd indexed elements
    const even = [];
    const odd = [];
    for (let i = 0; i < N / 2; i++) {
        even.push(x[i * 2]);
        odd.push(x[i * 2 + 1]);
    }

    // Recursive calls
    const evenResult = fft(even);
    const oddResult = fft(odd);

    const result = new Array(N);
    for (let k = 0; k < N / 2; k++) {
        const phi = (-2 * Math.PI * k) / N;
        const t = Complex.fromPolar(1, phi).multiply(oddResult[k]);

        result[k] = evenResult[k].add(t);
        result[k + N / 2] = evenResult[k].subtract(t);
    }

    return result;
}

/**
 * Wraps FFT for use in the epicycle renderer.
 * @param {Complex[]} signal - Input coordinates as complex numbers.
 * @returns {Object[]} Frequency components formatted for Renderer.js
 */
export function processSignalFFT(signal) {
    // Pad signal to power of 2
    let n = 1;
    while (n < signal.length) n *= 2;

    const paddedSignal = [...signal];
    while (paddedSignal.length < n) {
        paddedSignal.push(signal[signal.length - 1].copy());
    }

    const transformed = fft(paddedSignal);
    const result = transformed.map((val, k) => {
        // Normalize
        const normVal = val.scalarMultiply(1 / n);
        return {
            re: normVal.re,
            im: normVal.im,
            freq: k,
            amp: normVal.amplitude,
            phase: normVal.phase
        };
    });

    return result.sort((a, b) => b.amp - a.amp);
}
