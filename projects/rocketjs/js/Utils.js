export const Utils = {
    // Linear Interpolation
    lerp: (start, end, t) => {
        return start * (1 - t) + end * t;
    },

    // Clamping a number between min and max
    clamp: (num, min, max) => {
        return Math.min(Math.max(num, min), max);
    },

    // Random float between min and max
    randomRange: (min, max) => {
        return Math.random() * (max - min) + min;
    },

    // Random integer between min and max
    randomInt: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },

    // Ease In Cubic
    easeInCubic: (t) => {
        return t * t * t;
    },

    // Ease Out Cubic
    easeOutCubic: (t) => {
        return (--t) * t * t + 1;
    },
    
    // Smoothstep
    smoothstep: (min, max, value) => {
        var x = Math.max(0, Math.min(1, (value-min)/(max-min)));
        return x*x*(3 - 2*x);
    },

    // Convert HEX to RGB
    hexToRgb: (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
};
