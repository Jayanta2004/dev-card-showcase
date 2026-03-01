/**
 * Random.js
 * Utility class for pseudorandom number generation.
 */
class Random {
    static range(min, max) {
        return Math.random() * (max - min) + min;
    }
}
