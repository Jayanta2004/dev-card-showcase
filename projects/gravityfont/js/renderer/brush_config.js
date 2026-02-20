/**
 * GravityFont - Brush Configuration
 * Defines parameters for the varying brush styles.
 */

const BrushConfig = {
    neon: {
        glowBlur: 10,
        lineWidth: 2,
        coreWidth: 0.5,
        opacity: 1.0
    },
    sketch: {
        jitter: 4,
        lines: 3,
        opacity: 0.4
    },
    dotted: {
        dash: [2, 4],
        thickness: 1
    },
    organic: {
        widthMultiplier: 3
    }
};

/**
 * Utility to get brush settings safely.
 */
function getBrushSettings(name) {
    return BrushConfig[name] || BrushConfig.neon;
}
