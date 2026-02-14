/**
 * PresetManager - Handles persistence of simulation settings.
 * Allows users to save their favorite combinations of behavior weights,
 * colors, and forces to LocalStorage and reload them later.
 * 
 * @class PresetManager
 */
export class PresetManager {
    /**
     * Initializes the preset manager.
     * @param {Object} simulation - Reference to the main Simulation instance.
     */
    constructor(simulation) {
        /** @type {Object} The simulation being managed */
        this.simulation = simulation;

        /** @type {string} Key used for LocalStorage */
        this.storageKey = 'boidtype_presets';

        /** @type {Object} Map of saved presets */
        this.presets = this.loadPresetsFromStorage();
    }

    /**
     * Captures the current state of the simulation as a named preset.
     * 
     * @param {string} name - Unique identifier for the preset.
     */
    saveCurrentAs(name) {
        const state = {
            weights: { ...this.simulation.boids[0]?.weights },
            boidColor: this.simulation.boidColor || '#00f2ff',
            repulsionRadius: this.simulation.repulsionRadius,
            text: this.simulation.config.text,
            density: this.simulation.config.density,
            physics: {
                turbulence: this.simulation.physicsRegistry.turbulence,
                friction: this.simulation.physicsRegistry.friction,
                timeScale: this.simulation.physicsRegistry.timeScale
            }
        };

        this.presets[name] = state;
        this.savePresetsToStorage();
        console.log(`PresetManager: Saved preset "${name}"`);
    }

    /**
     * Applies a saved preset to the current simulation.
     * 
     * @param {string} name - Name of the preset to load.
     * @returns {boolean} True if loaded successfully.
     */
    load(name) {
        const state = this.presets[name];
        if (!state) {
            console.warn(`PresetManager: Preset "${name}" not found.`);
            return false;
        }

        // Apply weights to all existing boids
        this.simulation.boids.forEach(boid => {
            boid.weights = { ...state.weights };
        });

        // Apply global simulation settings
        this.simulation.repulsionRadius = state.repulsionRadius;
        this.simulation.config.density = state.density;
        this.simulation.boidColor = state.boidColor;

        // Apply physics settings
        if (state.physics) {
            this.simulation.physicsRegistry.turbulence = state.physics.turbulence;
            this.simulation.physicsRegistry.friction = state.physics.friction;
            this.simulation.physicsRegistry.timeScale = state.physics.timeScale;
        }

        // Trigger text update
        this.simulation.updateTargets(state.text);

        console.log(`PresetManager: Loaded preset "${name}"`);
        return true;
    }

    /**
     * Deletes a preset by name.
     * @param {string} name 
     */
    remove(name) {
        delete this.presets[name];
        this.savePresetsToStorage();
    }

    /**
     * Internal: Persists the presets map into LocalStorage.
     */
    savePresetsToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.presets));
        } catch (e) {
            console.error("PresetManager: Failed to save to LocalStorage.", e);
        }
    }

    /**
     * Internal: Retrieves presets from LocalStorage.
     * @returns {Object} Presets map.
     */
    loadPresetsFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : this.getDefaultPresets();
        } catch (e) {
            console.error("PresetManager: Failed to load from LocalStorage.", e);
            return this.getDefaultPresets();
        }
    }

    /**
     * Generates a set of factory-default presets.
     * @returns {Object} Default presets map.
     */
    getDefaultPresets() {
        return {
            'Classic': {
                weights: { separation: 1.5, alignment: 1.0, cohesion: 1.0, arrive: 2.0, flee: 6.0, wander: 0.3, avoid: 4.0 },
                boidColor: '#00f2ff',
                repulsionRadius: 150,
                text: 'BOIDTYPE',
                density: 6,
                physics: { turbulence: 0.05, friction: 0.98, timeScale: 1.0 }
            },
            'Chaotic': {
                weights: { separation: 3.0, alignment: 0.1, cohesion: 0.1, arrive: 0.5, flee: 10.0, wander: 2.0, avoid: 2.0 },
                boidColor: '#ff00ff',
                repulsionRadius: 300,
                text: 'CHAOS',
                density: 4,
                physics: { turbulence: 0.5, friction: 0.99, timeScale: 1.2 }
            },
            'Frozen': {
                weights: { separation: 0.5, alignment: 0.0, cohesion: 2.0, arrive: 5.0, flee: 1.0, wander: 0.0, avoid: 10.0 },
                boidColor: '#ffffff',
                repulsionRadius: 50,
                text: 'STABLE',
                density: 8,
                physics: { turbulence: 0.0, friction: 0.90, timeScale: 0.5 }
            }
        };
    }

    /**
     * Returns an array of available preset names.
     * @returns {string[]}
     */
    getPresetNames() {
        return Object.keys(this.presets);
    }
}
