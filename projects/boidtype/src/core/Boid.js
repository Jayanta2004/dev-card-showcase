import { Vector } from './Vector.js';

/**
 * Boid - An advanced autonomous agent implementing Craig Reynolds' steering behaviors.
 * This class handles individual physics state, target acquisition, and complex 
 * interactions within a flocking simulation.
 * 
 * @class Boid
 */
export class Boid {
    /**
     * Initializes a new Boid agent.
     * @param {number} x - Initial horizontal position.
     * @param {number} y - Initial vertical position.
     */
    constructor(x, y) {
        /** @type {Vector} Current spatial coordinates */
        this.position = new Vector(x, y);

        /** @type {Vector} Current movement vector */
        this.velocity = Vector.random2D().mult(Math.random() * 2 + 1);

        /** @type {Vector} Force accumulation buffer */
        this.acceleration = new Vector(0, 0);

        /** @type {Vector|null} Current assigned destination */
        this.target = null;

        /** @type {number} Maximum movement speed */
        this.maxSpeed = 4;

        /** @type {number} Maximum steering force limit */
        this.maxForce = 0.2;

        /** @type {number} Visual radius / physical scale */
        this.size = 2;

        /** @type {number} Internal wander angle for procedural movement */
        this.wanderAngle = Math.random() * Math.PI * 2;

        /** @type {Object} State weights for behavior blending */
        this.weights = {
            separation: 1.5,
            alignment: 1.0,
            cohesion: 1.0,
            arrive: 2.0,
            flee: 6.0,
            wander: 0.3,
            avoid: 4.0
        };

        /** @type {string} Visual theme / color association */
        this.color = '#00f2ff';
    }

    /**
     * Accumulates a force into the current acceleration.
     * @param {Vector} force - The force vector to apply.
     */
    applyForce(force) {
        this.acceleration.add(force);
    }

    /**
     * Core physics update loop for the agent.
     * Integrates acceleration into velocity and position.
     * Implements friction and force resetting.
     */
    update() {
        // Apply acceleration to velocity
        this.velocity.add(this.acceleration);

        // Respect speed limits
        this.velocity.limit(this.maxSpeed);

        // Move the agent
        this.position.add(this.velocity);

        // Reset acceleration for next frame
        this.acceleration.mult(0);

        // Apply air resistance / friction
        this.velocity.mult(0.99);
    }

    /**
     * Calculates and applies the classic Reynolds Flocking behavioral forces.
     * @param {Boid[]} boids - The set of nearby agents to consider.
     */
    flock(boids) {
        let sep = this.separate(boids);
        let ali = this.align(boids);
        let coh = this.cohesion(boids);

        sep.mult(this.weights.separation);
        ali.mult(this.weights.alignment);
        coh.mult(this.weights.cohesion);

        this.applyForce(sep);
        this.applyForce(ali);
        this.applyForce(coh);
    }

    /**
     * Steers the agent towards a target with smooth slowing as it approaches.
     * @param {Vector} target - The target coordinates.
     * @returns {Vector} Calculation steering force.
     */
    arrive(target) {
        let desired = Vector.sub(target, this.position);
        let dist = desired.mag();

        // Slow down within 100px radius
        if (dist < 100) {
            let speed = (dist / 100) * this.maxSpeed;
            desired.setMag(speed);
        } else {
            desired.setMag(this.maxSpeed);
        }

        let steer = Vector.sub(desired, this.velocity);
        steer.limit(this.maxForce);
        return steer;
    }

    /**
     * Repels the agent away from a specific point within a radius.
     * @param {Vector} target - Point of repulsion.
     * @param {number} [radius=100] - Proximity threshold.
     * @returns {Vector} Resulting steering force.
     */
    flee(target, radius = 100) {
        let desired = Vector.sub(target, this.position);
        let dist = desired.mag();

        if (dist < radius) {
            desired.setMag(this.maxSpeed);
            desired.mult(-1); // Opposite direction
            let steer = Vector.sub(desired, this.velocity);
            steer.limit(this.maxForce * 3); // High priority
            return steer;
        }
        return new Vector(0, 0);
    }

    /**
     * Generates a smooth, procedural "wandering" force.
     * @returns {Vector} Procedural movement force.
     */
    wander() {
        const radius = 50;
        const distance = 100;
        const change = 0.3;

        this.wanderAngle += (Math.random() - 0.5) * change;

        // Calculate point on circle in front of agent
        let circleCenter = this.velocity.copy();
        circleCenter.normalize().mult(distance);

        let displacement = new Vector(0, -1);
        displacement.mult(radius);
        displacement.rotate(this.wanderAngle);

        let wanderForce = circleCenter.add(displacement);
        wanderForce.limit(this.maxForce * 0.5);

        return wanderForce;
    }

    /**
     * Calculates a force to avoid obstacles registered in the simulation.
     * @param {Object[]} obstacles - Array of {position, radius} objects.
     * @returns {Vector} Avoidance steering force.
     */
    avoidObstacles(obstacles) {
        let steer = new Vector(0, 0);
        let count = 0;
        const margin = 20;

        for (let obs of obstacles) {
            let d = this.position.dist(obs.position);
            if (d < obs.radius + margin) {
                let diff = Vector.sub(this.position, obs.position);
                diff.normalize();
                diff.div(d); // Weight by inverse distance
                steer.add(diff);
                count++;
            }
        }

        if (count > 0) {
            steer.div(count);
            steer.setMag(this.maxSpeed);
            steer.sub(this.velocity);
            steer.limit(this.maxForce * 2);
        }
        return steer;
    }

    // Reynolds Flocking Components

    /**
     * Separation: Steer to avoid crowding local flockmates.
     * @param {Boid[]} boids 
     * @returns {Vector}
     */
    separate(boids) {
        let perception = 30;
        let steer = new Vector(0, 0);
        let count = 0;

        for (let other of boids) {
            let dSq = this.position.distSq(other.position);
            if (other !== this && dSq < perception * perception) {
                let diff = Vector.sub(this.position, other.position);
                diff.normalize().div(Math.sqrt(dSq)); // Weight by distance
                steer.add(diff);
                count++;
            }
        }

        if (count > 0) {
            steer.div(count).setMag(this.maxSpeed).sub(this.velocity).limit(this.maxForce);
        }
        return steer;
    }

    /**
     * Alignment: Steer towards the average heading of local flockmates.
     * @param {Boid[]} boids 
     * @returns {Vector}
     */
    align(boids) {
        let perception = 50;
        let sum = new Vector(0, 0);
        let count = 0;

        for (let other of boids) {
            let dSq = this.position.distSq(other.position);
            if (other !== this && dSq < perception * perception) {
                sum.add(other.velocity);
                count++;
            }
        }

        if (count > 0) {
            sum.div(count).setMag(this.maxSpeed).sub(this.velocity).limit(this.maxForce);
            return sum;
        }
        return new Vector(0, 0);
    }

    /**
     * Cohesion: Steer to move towards the average position of local flockmates.
     * @param {Boid[]} boids 
     * @returns {Vector}
     */
    cohesion(boids) {
        let perception = 50;
        let sum = new Vector(0, 0);
        let count = 0;

        for (let other of boids) {
            let dSq = this.position.distSq(other.position);
            if (other !== this && dSq < perception * perception) {
                sum.add(other.position);
                count++;
            }
        }

        if (count > 0) {
            sum.div(count);
            let desired = Vector.sub(sum, this.position);
            desired.setMag(this.maxSpeed).sub(this.velocity).limit(this.maxForce);
            return desired;
        }
        return new Vector(0, 0);
    }

    /**
     * Wraps the boids around the screen edges if not following a target.
     * @param {number} width 
     * @param {number} height 
     */
    edges(width, height) {
        if (this.position.x > width) this.position.x = 0;
        else if (this.position.x < 0) this.position.x = width;

        if (this.position.y > height) this.position.y = 0;
        else if (this.position.y < 0) this.position.y = height;
    }
}
