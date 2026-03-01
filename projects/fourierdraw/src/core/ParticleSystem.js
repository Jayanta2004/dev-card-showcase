import { CONFIG } from '../config.js';

/**
 * @fileoverview Particle System for FourierDraw.
 * Manages individual particles emitted from the tracing point of the Fourier series.
 */

/**
 * Represents a single particle in the system.
 */
class Particle {
    /**
     * @param {number} x - Initial X coordinate.
     * @param {number} y - Initial Y coordinate.
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;

        // Random velocity
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;

        // Lifespan in frames
        this.life = CONFIG.ANIMATION.PARTICLE_LIFESPAN;
        this.initialLife = this.life;

        // Random size
        this.size = Math.random() * 3 + 1;
    }

    /**
     * Updates the particle state for one frame.
     */
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;

        // Apply a bit of friction
        this.vx *= 0.98;
        this.vy *= 0.98;
    }

    /**
     * Draws the particle to a canvas context.
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        const opacity = this.life / this.initialLife;
        ctx.fillStyle = CONFIG.COLORS.PARTICLE_COLOR.replace('0.8', opacity.toFixed(2));
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Checks if the particle is still alive.
     * @returns {boolean}
     */
    isDead() {
        return this.life <= 0;
    }
}

/**
 * Manages a collection of particles.
 */
export class ParticleSystem {
    constructor() {
        /** @type {Particle[]} */
        this.particles = [];
    }

    /**
     * Emits new particles at a given location.
     * @param {number} x 
     * @param {number} y 
     * @param {number} count 
     */
    emit(x, y, count = 1) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y));
        }
    }

    /**
     * Updates all active particles and removes dead ones.
     */
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * Renders all particles.
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }

    /**
     * Clears all particles.
     */
    clear() {
        this.particles = [];
    }
}
