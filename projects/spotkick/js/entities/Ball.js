import { Vector3 } from '../math/Vector3.js';
import { CONSTANTS } from '../constants.js';

export class Ball {
    constructor() {
        this.reset();
    }

    reset() {
        this.position = new Vector3(0, CONSTANTS.PHYSICS.BALL_RADIUS, CONSTANTS.FIELD.BALL_START_Z);
        this.velocity = new Vector3(0, 0, 0);
        this.spin = new Vector3(0, 0, 0); // Angular velocity
        this.radius = CONSTANTS.PHYSICS.BALL_RADIUS;

        this.isStatic = false;
        this.hasCollided = false;
        this.rotationAngle = 0; // Visual rotation for rendering
        this.rotationAxis = new Vector3(1, 0, 0);
    }

    applyImpulse(forceVector, spinVector) {
        // F = ma -> dv = F/m
        // Impulse J = F*dt = m*dv -> dv = J/m
        // We can treat the input forceVector as the velocity impulse for simplicity in game terms
        // or properly as Force applied over a short time.
        // Let's treat valid 'Kick' as setting initial velocity.

        this.velocity.copy(forceVector);
        if (spinVector) {
            this.spin.copy(spinVector);
        }
        this.isStatic = false;
    }
}
