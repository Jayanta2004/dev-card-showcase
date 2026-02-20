/**
 * MathUtils
 * Core mathematical functions for vector analysis and statistical computation.
 * Essential for calculating entropy vectors and pattern deviations.
 */

export const MathUtils = {
    /**
     * Calculates the distance between two 2D points.
     * @param {Object} p1 - Point 1 {x, y}
     * @param {Object} p2 - Point 2 {x, y}
     * @returns {number} Distance
     */
    distance: (p1, p2) => {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    },

    /**
     * Calculates the magnitude of a vector.
     * @param {Object} v - Vector {x, y}
     * @returns {number} Magnitude
     */
    magnitude: (v) => {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    },

    /**
     * Normalizes a vector to unit length.
     * @param {Object} v - Vector {x, y}
     * @returns {Object} Normalized vector
     */
    normalize: (v) => {
        const mag = MathUtils.magnitude(v);
        if (mag === 0) return { x: 0, y: 0 };
        return { x: v.x / mag, y: v.y / mag };
    },

    /**
     * Calculates the angle of a vector in radians.
     * @param {Object} v - Vector {x, y}
     * @returns {number} Angle in radians
     */
    angle: (v) => {
        return Math.atan2(v.y, v.x);
    },

    /**
     * Maps a value from one range to another.
     * @param {number} value - Input value
     * @param {number} start1 - Source range start
     * @param {number} stop1 - Source range end
     * @param {number} start2 - Target range start
     * @param {number} stop2 - Target range end
     * @returns {number} Mapped value
     */
    map: (value, start1, stop1, start2, stop2) => {
        return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    },

    /**
     * Clamps a value between a min and max.
     * @param {number} value 
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    clamp: (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Calculates the mean of an array of numbers.
     * @param {number[]} data 
     * @returns {number}
     */
    mean: (data) => {
        if (!data.length) return 0;
        return data.reduce((sum, val) => sum + val, 0) / data.length;
    },

    /**
     * Calculates standard deviation.
     * @param {number[]} data 
     * @returns {number}
     */
    stdDev: (data) => {
        if (!data.length) return 0;
        const mean = MathUtils.mean(data);
        const squareDiffs = data.map(val => Math.pow(val - mean, 2));
        const avgSquareDiff = MathUtils.mean(squareDiffs);
        return Math.sqrt(avgSquareDiff);
    },

    /**
     * Linear interpolation between two values.
     * @param {number} start 
     * @param {number} end 
     * @param {number} amt 
     * @returns {number}
     */
    lerp: (start, end, amt) => {
        return (1 - amt) * start + amt * end;
    },

    /**
     * Converts degrees to radians.
     * @param {number} deg 
     * @returns {number}
     */
    degToRad: (deg) => deg * (Math.PI / 180),

    /**
     * Converts radians to degrees.
     * @param {number} rad 
     * @returns {number}
     */
    radToDeg: (rad) => rad * (180 / Math.PI)
};
