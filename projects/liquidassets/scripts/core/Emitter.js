import { Particle } from '../fluid/Particle.js';
import { Config } from '../Config.js';

export class Emitter {
    constructor(x, y, solver) {
        this.x = x;
        this.y = y;
        this.solver = solver;
        this.spawnRateCurve = 0; // Accumulated time
        this.salary = 5000; // Default salary
        this.particleIdCounter = 0;
    }

    setSalary(amount) {
        this.salary = amount;
    }

    update(dt) {
        // Map salary to spawn rate
        // Higher salary = more particles/sec
        // Base rate: 5000 salary -> 10 particles/frame (approx)
        // We need to balance this with MAX_PARTICLES

        let particlesPerSec = (this.salary / 100); // 5000 -> 50 p/s

        // Safety cap
        if (particlesPerSec > 200) particlesPerSec = 200;

        const interval = 1.0 / particlesPerSec;
        this.spawnRateCurve += dt;

        while (this.spawnRateCurve > interval) {
            this.spawnRateCurve -= interval;
            this.emit();
        }
    }

    emit() {
        if (this.solver.particles.length >= Config.MAX_PARTICLES) return;

        // Jitter position slightly for natural flow
        const jitterX = (Math.random() - 0.5) * 10;
        const p = new Particle(this.x + jitterX, this.y, this.particleIdCounter++);

        // Initial velocity downwards
        p.vel.y = 200;
        p.vel.x = (Math.random() - 0.5) * 50;

        this.solver.particles.push(p);
    }
}
