/**
 * DistortionSystem.js
 * Handles the logic for generative particle behavior and visual distortion.
 * Reacts to DifferenceEngine deltas to morph the visual representation.
 */

import { Vector2D, MathUtils } from '../utils/MathUtils.js';
import { CollisionEngine } from '../engine/CollisionEngine.js';

/**
 * Particle Class
 * Represents a single point of data in the behavioral mirror.
 */
class Particle {
    /**
     * @param {number} x Initial X coordinate
     * @param {number} y Initial Y coordinate
     * @param {string} color Default color
     */
    constructor(x, y, color) {
        this.origin = new Vector2D(x, y);
        this.pos = new Vector2D(x, y);
        this.vel = new Vector2D(0, 0);
        this.acc = new Vector2D(0, 0);
        this.color = color;
        this.size = MathUtils.random(1.5, 4);
        this.friction = 0.92;
        this.ease = 0.05;
    }

    update(mouse, deltas) {
        // Behavioral Distortion logic:
        // High spatial delta = more chaotic movement
        // High velocity delta = higher sensitivity to mouse
        // High temporal delta = size/pulsation changes

        const dist = this.pos.dist(new Vector2D(mouse.x, mouse.y));
        const limit = 150 + (deltas.spatial * 200);

        if (dist < limit) {
            const angle = Math.atan2(this.pos.y - mouse.y, this.pos.x - mouse.x);
            const force = (limit - dist) / limit;

            // Higher velocity delta makes particles fly away faster (less stable)
            const power = force * (2 + deltas.velocity * 10);

            this.acc.x += Math.cos(angle) * power;
            this.acc.y += Math.sin(angle) * power;
        }

        // Return to origin (the "Mirror" aspect)
        // High spatial delta makes the "return" force weaker/slower
        const stiffness = 0.1 / (1 + deltas.spatial * 4);
        this.acc.x += (this.origin.x - this.pos.x) * stiffness;
        this.acc.y += (this.origin.y - this.pos.y) * stiffness;

        this.vel.x = (this.vel.x + this.acc.x) * this.friction;
        this.vel.y = (this.vel.y + this.acc.y) * this.friction;
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        this.acc.x *= 0;
        this.acc.y *= 0;

        // Temporal delta affects size jitter
        if (deltas.temporal > 0.5) {
            this.currentSize = this.size * (1 + Math.sin(Date.now() * 0.01) * deltas.temporal * 0.5);
        } else {
            this.currentSize = this.size;
        }
    }

    draw(ctx, deltas) {
        // Color shifts based on composite delta
        const hue = 210 + (deltas.composite * 60); // Shifts from Blue towards Magenta
        ctx.fillStyle = `hsla(${hue}, 80%, 70%, 0.6)`;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.currentSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

export class DistortionSystem {
    /**
     * @param {number} width Canvas width
     * @param {number} height Canvas height
     */
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.particles = [];
        this.collisionEngine = new CollisionEngine(width, height);
        this._initParticles();
    }

    /**
     * Initializes the grid of particles.
     * @private
     */
    _initParticles() {
        const gap = 20;
        for (let y = 0; y < this.height; y += gap) {
            for (let x = 0; x < this.width; x += gap) {
                this.particles.push(new Particle(x, y));
            }
        }
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
        this.particles = [];
        this.collisionEngine.resize(w, h);
        this._initParticles();
    }

    /**
     * Updates all generative particles and resolves collisions.
     * @param {Object} mouse Mouse state
     * @param {Object} deltas Behavioral deltas
     */
    update(mouse, deltas) {
        for (const p of this.particles) {
            p.update(mouse, deltas);
        }

        // Apply physical constraints if delta isn't too extreme
        if (deltas.composite < 0.9) {
            this.collisionEngine.resolve(this.particles, deltas);
        }
    }

    /**
     * Renders the distorted particle field.
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Object} deltas 
     */
    render(ctx, deltas) {
        // Draw connections for "structural" look if delta is low
        if (deltas.composite < 0.3) {
            this._drawConnections(ctx, deltas);
        }

        for (const p of this.particles) {
            p.draw(ctx, deltas);
        }
    }

    _drawConnections(ctx, deltas) {
        ctx.strokeStyle = `hsla(210, 50%, 50%, ${0.1 * (1 - deltas.composite)})`;
        ctx.lineWidth = 0.5;
        const maxDist = 40;

        for (let i = 0; i < this.particles.length; i += 5) {
            const p1 = this.particles[i];
            for (let j = i + 1; j < this.particles.length; j += 40) {
                const p2 = this.particles[j];
                const d = p1.pos.dist(p2.pos);
                if (d < maxDist) {
                    ctx.beginPath();
                    ctx.moveTo(p1.pos.x, p1.pos.y);
                    ctx.lineTo(p2.pos.x, p2.pos.y);
                    ctx.stroke();
                }
            }
        }
    }
}
