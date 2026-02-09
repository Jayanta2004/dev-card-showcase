/**
 * NonEuclidScroll | Constants & Config
 * Centralized configuration for the NonEuclid engine.
 */

const Config = {
    CORRIDOR: {
        WIDTH: 600,
        HEIGHT: 400,
        DEPTH: 1000,
        PERSPECTIVE: 1000
    },
    SCROLL: {
        SENSITIVITY: 1.2,
        FRICTION: 0.95,
        THRESHOLD: 1000,
        MOMENTUM_LERP: 0.1
    },
    TRANSITION: {
        DURATION: 1000,
        GLITCH_INTENSITY: 0.5
    },
    AUDIO: {
        MASTER_VOLUME: 0.3,
        DRONE_BASE_FREQ: 55,
        LOWPASS_FREQ: 400
    },
    DEBUG: {
        ENABLED_BY_DEFAULT: false
    }
};

/**
 * Extended Utils for visual effects.
 */
Utils.color = {
    /**
     * Convert HSL to HEX.
     */
    hslToHex: (h, s, l) => {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }
};

Utils.spatial = {
    /**
     * Calculate 3D distance between two spatial nodes.
     */
    distance3D: (p1, p2) => {
        return Math.sqrt(
            Math.pow(p2.x - p1.x, 2) +
            Math.pow(p2.y - p1.y, 2) +
            Math.pow(p2.z - p1.z, 2)
        );
    }
};
