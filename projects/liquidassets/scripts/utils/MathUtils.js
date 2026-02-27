export const MathUtils = {
    clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    },

    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    map(val, inMin, inMax, outMin, outMax) {
        return (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },

    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    },

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    distSq(x1, y1, x2, y2) {
        return (x1 - x2) ** 2 + (y1 - y2) ** 2;
    },

    // Color helpers
    hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => {
            return r + r + g + g + b + b;
        });

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    rgba(r, g, b, a) {
        return `rgba(${r},${g},${b},${a})`;
    }
};
