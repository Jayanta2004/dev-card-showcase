import { Vector2 } from './Vector2.js';

export class Particle {
    constructor(x, y, id) {
        this.id = id;
        this.pos = new Vector2(x, y);
        this.vel = new Vector2(0, 0);
        this.force = new Vector2(0, 0); // Accumulates acceleration forces

        // SPH Properties
        this.density = 0;
        this.pressure = 0;

        // Neighbor cache for this frame
        this.neighbors = [];

        // Metadata
        this.isStatic = false; // For boundaries if we used particles as walls
        this.colorVal = 0; // For visualization
        this.life = 1000; // For cleanup if falls out of bounds
    }

    resetForce() {
        this.force.set(0, 0);
        this.density = 0;
        this.pressure = 0;
        this.neighbors = [];
    }
}
