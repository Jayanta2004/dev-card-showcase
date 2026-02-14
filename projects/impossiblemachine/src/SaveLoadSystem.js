import { Particle } from './Particle.js';
import { PhysicsDNA } from './PhysicsDNA.js';

export class SaveLoadSystem {
    constructor(simulation) {
        this.simulation = simulation;
        this.storageKey = 'impossible_machine_save_v1';
    }

    save() {
        const state = {
            particles: this.simulation.particles.map(p => ({
                pos: p.pos,
                vel: p.vel,
                mass: p.mass,
                radius: p.radius,
                dna: {
                    gravity: p.dna.gravity,
                    friction: p.dna.friction,
                    restitution: p.dna.restitution,
                    interactionRadius: p.dna.interactionRadius,
                    perceptionRadius: p.dna.perceptionRadius,
                    maxSpeed: p.dna.maxSpeed,
                    maxForce: p.dna.maxForce
                },
                type: p.type,
                energy: p.energy,
                age: p.age,
                color: p.color
            })),
            timestamp: Date.now()
        };

        try {
            const json = JSON.stringify(state);
            localStorage.setItem(this.storageKey, json);
            console.log(`Saved ${state.particles.length} particles.`);
            return true;
        } catch (e) {
            console.error("Save failed:", e);
            return false;
        }
    }

    load() {
        try {
            const json = localStorage.getItem(this.storageKey);
            if (!json) return false;

            const state = JSON.parse(json);

            // Reconstruct particles
            const newParticles = state.particles.map(data => {
                const p = new Particle(data.pos.x, data.pos.y);
                p.vel = data.vel;
                p.mass = data.mass;
                p.radius = data.radius;

                // Restore DNA
                p.dna = new PhysicsDNA();
                Object.assign(p.dna, data.dna);

                // Restore biology
                p.type = data.type;
                p.energy = data.energy;
                p.age = data.age;
                p.color = data.color;

                return p;
            });

            this.simulation.particles = newParticles;
            console.log(`Loaded ${newParticles.length} particles.`);
            return true;
        } catch (e) {
            console.error("Load failed:", e);
            return false;
        }
    }

    clear() {
        localStorage.removeItem(this.storageKey);
    }

    // Auto-save functionality
    startAutoSave(intervalMs = 30000) {
        this.stopAutoSave();
        this.intervalId = setInterval(() => this.save(), intervalMs);
    }

    stopAutoSave() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}
