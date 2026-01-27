import { CONSTANTS } from '../constants.js';
import { Vector3 } from '../math/Vector3.js';

export class PhysicsEngine {
    constructor() {
        this.gravity = new Vector3(0, -CONSTANTS.PHYSICS.GRAVITY, 0);
        this.dragCoeff = CONSTANTS.PHYSICS.DRAG_COEFFICIENT;
        this.airDensity = CONSTANTS.PHYSICS.AIR_DENSITY;
        this.ballRadius = CONSTANTS.PHYSICS.BALL_RADIUS;
        this.ballArea = Math.PI * this.ballRadius * this.ballRadius;
        this.ballMass = CONSTANTS.PHYSICS.BALL_MASS;
    }

    update(ball, dt) {
        // Sub-stepping for stability
        const steps = CONSTANTS.PHYSICS.SUB_STEPS;
        const subDt = dt / steps;

        for (let i = 0; i < steps; i++) {
            this.step(ball, subDt);
            if (ball.hasCollided || ball.isGoalLikely) break;
        }
    }

    step(ball, dt) {
        if (ball.isStatic) return;

        // 1. Calculate Forces

        // Gravity: Fg = m * g
        const forceGravity = this.gravity.clone().multiplyScalar(this.ballMass);

        // Drag: Fd = -0.5 * rho * A * Cd * |v| * v
        const velocityMagnitude = ball.velocity.length();
        const dragMagnitude = 0.5 * this.airDensity * this.ballArea * this.dragCoeff * velocityMagnitude * velocityMagnitude;
        const forceDrag = ball.velocity.clone().normalize().multiplyScalar(-dragMagnitude);

        // Magnus Effect: Fm = S * (w x v)
        const spin = ball.spin || new Vector3(0, 0, 0);
        const forceMagnus = spin.clone().cross(ball.velocity).multiplyScalar(CONSTANTS.PHYSICS.MAGNUS_EFFECT_MULTIPLIER);

        // Total Force
        const totalForce = new Vector3(0, 0, 0).add(forceGravity).add(forceDrag).add(forceMagnus);

        // 2. Integration (Semi-Implicit Euler)

        // Acceleration: a = F / m
        const acceleration = totalForce.divideScalar(this.ballMass);

        // Update Velocity: v = v + a * dt
        ball.velocity.add(acceleration.clone().multiplyScalar(dt));

        // Update Position: p = p + v * dt
        ball.position.add(ball.velocity.clone().multiplyScalar(dt));

        // 3. Collision Detection (Ground)
        if (ball.position.y <= this.ballRadius) {
            // Simple bounce
            ball.position.y = this.ballRadius;
            ball.velocity.y *= -0.6; // Restitution (dampened)
            ball.velocity.x *= 0.8; // Ground friction
            ball.velocity.z *= 0.8;

            // Rotation decay on ground
            ball.spin.multiplyScalar(0.9);

            // Stop if slow
            if (ball.velocity.length() < 0.2) {
                ball.isStatic = true;
                ball.velocity.set(0, 0, 0);
            }
        }
    }

    checkGoalCollision(ball) {
        const goalZ = CONSTANTS.FIELD.GOAL_Z;
        const goalWidth = CONSTANTS.FIELD.GOAL_WIDTH;
        const goalHeight = CONSTANTS.FIELD.GOAL_HEIGHT;

        // Use previous position to Raycast for better accuracy?
        // simple test for now: if crossed the plane
        // Ball Radius buffer

        if (ball.position.z >= goalZ) {

            // Check if within Width
            if (Math.abs(ball.position.x) < (goalWidth / 2) - this.ballRadius) {

                // Check Height
                if (ball.position.y < (goalHeight - this.ballRadius)) {
                    // It's in the net!
                    return 'GOAL';
                } else if (ball.position.y < (goalHeight + this.ballRadius)) {
                    // Hit Crossbar
                    return 'CROSSBAR';
                } else {
                    // Over
                    return 'MISS';
                }

            } else if (Math.abs(ball.position.x) < (goalWidth / 2) + this.ballRadius) {
                // Hit Post
                return 'POST';
            } else {
                // Wide
                return 'MISS';
            }
        }

        return null;
    }

    checkKeeperCollision(ball, keeper) {
        // Keeper is at Z = 11 (approx)
        // Ball is approaching Z = 11.

        // Simple hitbox check
        // Keeper Hitbox (Moving)
        // keeper.position matches his center/feet usually. 
        // Let's assume keeper.position is center of mass for simplicity in physics check

        if (!keeper) return false;

        const kPos = keeper.position;
        const reachX = 0.6; // half width reach
        const reachY = 1.0; // half height reach (from center)

        // If ball within Z-range of keeper
        if (Math.abs(ball.position.z - kPos.z) < 0.5) {
            if (Math.abs(ball.position.x - kPos.x) < reachX &&
                Math.abs(ball.position.y - kPos.y) < reachY) {
                return true;
            }
        }
        return false;
    }
}
