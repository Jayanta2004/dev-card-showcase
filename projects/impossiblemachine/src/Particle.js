import { PhysicsDNA } from './PhysicsDNA.js';

export class Particle {
    constructor(x, y) {
        this.pos = { x, y };
        this.vel = { x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100 };
        this.acc = { x: 0, y: 0 };

        this.radius = 5 + Math.random() * 5;
        this.mass = this.radius; // Simplified mass

        this.dna = new PhysicsDNA();

        // Ecology & Biology
        this.type = Math.random() > 0.8 ? 'predator' : 'prey'; // 20% Predators
        this.energy = 100;
        this.maxEnergy = 100;
        this.age = 0;

        // Flocking DNA (added directly to particle for now, or could guard in DNA)
        this.dna.perceptionRadius = 50 + Math.random() * 50;
        this.dna.maxSpeed = this.type === 'predator' ? 4 : 3;
        this.dna.maxForce = 0.1;

        // Visuals
        this.updateColor();
        this.history = []; // For trails
    }

    updateColor() {
        if (this.type === 'predator') {
            this.color = `hsla(0, 80%, 50%, 1)`; // Red
        } else {
            this.color = `hsla(120, 60%, 50%, 1)`; // Green
        }
    }

    applyForce(fx, fy) {
        this.acc.x += fx / this.mass;
        this.acc.y += fy / this.mass;
    }
}
