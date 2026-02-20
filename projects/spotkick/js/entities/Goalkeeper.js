import { Vector3 } from '../math/Vector3.js';
import { CONSTANTS } from '../constants.js';

export class Goalkeeper {
    constructor() {
        this.position = new Vector3(0, 0, CONSTANTS.FIELD.KEEPER_START_Z);
        this.velocity = new Vector3(0, 0, 0);
        this.state = 'IDLE'; // IDLE, PREPARING, DIVING_LEFT, DIVING_RIGHT, JUMPING, SAVING
        this.animationTimer = 0;
        this.targetDive = new Vector3(0, 0, 0); // Where they are trying to reach
    }

    reset() {
        this.position.set(0, 0, CONSTANTS.FIELD.KEEPER_START_Z);
        this.velocity.set(0, 0, 0);
        this.state = 'IDLE';
        this.animationTimer = 0;
    }

    startDive(directionVector, power = 1.0) {
        // Direction vector usually has x (-1 or 1) and y (0 or 1)
        this.velocity.copy(directionVector).multiplyScalar(5 * power); // Speed factor
        if (directionVector.x < -0.1) this.state = 'DIVING_LEFT';
        else if (directionVector.x > 0.1) this.state = 'DIVING_RIGHT';
        else this.state = 'JUMPING';
    }

    update(dt) {
        if (this.state.includes('DIVING') || this.state === 'JUMPING') {
            this.position.add(this.velocity.clone().multiplyScalar(dt));

            // Gravity on Keeper? sure, if they jump
            if (this.position.y > 0) {
                this.velocity.y -= CONSTANTS.PHYSICS.GRAVITY * dt;
            }

            // Floor collision
            if (this.position.y < 0) {
                this.position.y = 0;
                this.velocity.set(0, 0, 0);
                this.state = 'LANDED';
            }
        }
    }
}
