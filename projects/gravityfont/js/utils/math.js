/**
 * GravityFont - Math Utilities
 */

const MathUtils = {
    /**
     * Maps a value from one range to another.
     */
    map: (value, start1, stop1, start2, stop2) => {
        return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    },

    /**
     * Returns a random float between min and max.
     */
    random: (min, max) => {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return Math.random() * (max - min) + min;
    },

    /**
     * Returns a random integer between min and max.
     */
    randomInt: (min, max) => {
        return Math.floor(MathUtils.random(min, max + 1));
    },

    /**
     * Clamps a value between min and max.
     */
    clamp: (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Linear interpolation.
     */
    lerp: (a, b, t) => {
        return a + (b - a) * t;
    },

    /**
     * Checks if two rectangles intersect.
     */
    rectIntersect: (x1, y1, w1, h1, x2, y2, w2, h2) => {
        return x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1;
    }
};
