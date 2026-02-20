/**
 * @class MathUtils
 * @description Static utility class for mathematical operations.
 * Essential for mapping physical inputs (speed, distance) to audio parameters (frequency, gain).
 */
export class MathUtils {
    /**
     * @static
     * @method map
     * @description Maps a value from one range to another.
     * @param {number} value - Input value
     * @param {number} inMin - Input range minimum
     * @param {number} inMax - Input range maximum
     * @param {number} outMin - Output range minimum
     * @param {number} outMax - Output range maximum
     * @returns {number} Mapped value
     */
    static map(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    /**
     * @static
     * @method clamp
     * @description Clamps a value between min and max.
     * @param {number} value - Input value
     * @param {number} min - Minimum bound
     * @param {number} max - Maximum bound
     * @returns {number} Clamped value
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * @static
     * @method lerp
     * @description Linear interpolation between start and end.
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    static lerp(start, end, t) {
        return start + (end - start) * t;
    }

    /**
     * @static
     * @method randomRange
     * @description Random float between min and max.
     * @param {number} min - Minimum
     * @param {number} max - Maximum
     * @returns {number} Random float
     */
    static randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * @static
     * @method uuid
     * @description Generates a simple UUID for identifying strokes.
     * @returns {string} UUID
     */
    static uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * @static
     * @method smoothStep
     * @description Hermite interpolation for smoother transitions.
     * @param {number} edge0 - Lower edge
     * @param {number} edge1 - Upper edge
     * @param {number} x - Value
     * @returns {number} Smoothed value
     */
    static smoothStep(edge0, edge1, x) {
        const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t);
    }
}
