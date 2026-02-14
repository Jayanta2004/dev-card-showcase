/**
 * Presets.js
 * Decorative behavioral presets for DiffMirror.
 * Defines complex mappings between deltas and visual styles.
 */

export const PRESETS = {
    FLUID: {
        name: 'Liquid Mirror',
        particleGap: 18,
        friction: 0.95,
        stiffness: 0.08,
        colorRange: [200, 240], // Blue-sh
        trailIntensity: 0.2
    },
    CRYSTAL: {
        name: 'Fracture Mirror',
        particleGap: 25,
        friction: 0.85,
        stiffness: 0.15,
        colorRange: [180, 200], // Cyan-ish
        trailIntensity: 0.05
    },
    GHOST: {
        name: 'Echo Mirror',
        particleGap: 12,
        friction: 0.98,
        stiffness: 0.02,
        colorRange: [280, 320], // Purple-ish
        trailIntensity: 0.5
    },
    VOID: {
        name: 'Void Mirror',
        particleGap: 30,
        friction: 0.9,
        stiffness: 0.05,
        colorRange: [0, 40], // Warm/Glow
        trailIntensity: 0.1
    }
};

export class PresetManager {
    constructor() {
        this.current = PRESETS.FLUID;
    }

    /**
     * Switches the active preset based on behavioral composite.
     * Large deltas force the system into more chaotic presets.
     * @param {Object} deltas 
     */
    autoSwitch(deltas) {
        if (deltas.composite > 0.7) {
            this.current = PRESETS.VOID;
        } else if (deltas.spatial > 0.5) {
            this.current = PRESETS.GHOST;
        } else if (deltas.velocity > 0.5) {
            this.current = PRESETS.CRYSTAL;
        } else {
            this.current = PRESETS.FLUID;
        }
    }

    getConfig() {
        return this.current;
    }
}
