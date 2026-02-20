/**
 * GravityFont - Simulation Presets
 * Defines different behaviors for the soft-body letters.
 */

const SimulationPresets = {
    FABRIC: {
        name: "Classic Fabric",
        gravity: 0.5,
        stiffness: 0.15,
        friction: 0.99,
        bounce: 0.5,
        iterations: 8,
        particleRadius: 3,
        neighborRadius: 12
    },
    SILK: {
        name: "Smooth Silk",
        gravity: 0.3,
        stiffness: 0.08,
        friction: 0.995,
        bounce: 0.2,
        iterations: 12,
        particleRadius: 2,
        neighborRadius: 15
    },
    LEATHER: {
        name: "Thick Leather",
        gravity: 0.8,
        stiffness: 0.3,
        friction: 0.95,
        bounce: 0.1,
        iterations: 5,
        particleRadius: 4,
        neighborRadius: 10
    },
    JELLY: {
        name: "Jelly Mold",
        gravity: 0.2,
        stiffness: 0.05,
        friction: 0.98,
        bounce: 0.8,
        iterations: 15,
        particleRadius: 5,
        neighborRadius: 20
    }
};

/**
 * Utility to apply a preset to the engine and future glyphs.
 */
class PresetManager {
    constructor(app) {
        this.app = app;
        this.currentPreset = SimulationPresets.FABRIC;
    }

    apply(presetKey) {
        const preset = SimulationPresets[presetKey];
        if (!preset) return;

        this.currentPreset = preset;

        // Update engine
        this.app.engine.gravity.y = preset.gravity;
        this.app.engine.iterations = preset.iterations;

        // Update existing particles if needed (optional)
        this.app.engine.particles.forEach(p => {
            p.friction = preset.friction;
            p.bounce = preset.bounce;
        });

        console.log(`Applied preset: ${preset.name}`);
    }
}
