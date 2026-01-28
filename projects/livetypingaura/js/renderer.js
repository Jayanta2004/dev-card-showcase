/**
 * LiveTypingAura - Renderer
 * Manages the Canvas context and the animation loop.
 */

import { CONFIG } from './config.js';
import { Particle } from './particle.js';

export class Renderer {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);

        this.particles = [];
        this.w = 0;
        this.h = 0;

        this.lastTime = 0;
        this.environment = 'none';

        this.bindEvents();
        this.resize();
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        // Track mouse
        this.mouseX = -1000;
        this.mouseY = -1000;
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Gravity Well State
        this.gravityActive = false;
        this.gravityTargetX = 0;
        this.gravityTargetY = 0;
    }

    setGravityWell(active, x, y) {
        this.gravityActive = active;
        this.gravityTargetX = x;
        this.gravityTargetY = y;
    }

    resize() {
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.canvas.width = this.w;
        this.canvas.height = this.h;
    }

    spawnParticles(x, y, count, intensity, overrideHue = null) {
        // Limit total particles
        if (this.particles.length > CONFIG.PARTICLE.COUNT_LIMIT) {
            this.particles.splice(0, count); // Remove oldest
        }

        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, intensity, overrideHue));
        }
    }

    // Effect for backspace: pull particles to center or dissolve them
    triggerImplosion() {
        // Find center
        const cx = this.w / 2;
        const cy = this.h / 2;

        this.particles.forEach(p => {
            p.implode(cx, cy);
        });
    }

    // Trigger shockwave: repels particles from center
    createShockwave(x, y) {
        const radius = CONFIG.PHYSICS.SHOCKWAVE_RADIUS;
        const force = CONFIG.PHYSICS.SHOCKWAVE_FORCE;

        this.particles.forEach(p => {
            if (!p.active) return;

            const dx = p.x - x;
            const dy = p.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < radius) {
                // Calculate repulsion vector
                // Closer particles get pushed harder
                const power = (1 - (dist / radius)) * force;
                const angle = Math.atan2(dy, dx);

                // Add velocity away from center
                p.applyForce(Math.cos(angle) * power, Math.sin(angle) * power);
            }
        });
    }

    start() {
        requestAnimationFrame((t) => this.loop(t));
    }

    loop(timestamp) {
        requestAnimationFrame((t) => this.loop(t));

        const dt = (timestamp - this.lastTime) / 16.66;
        this.lastTime = timestamp;

        this.ctx.clearRect(0, 0, this.w, this.h);

        // Global Force Application
        const mRadius = CONFIG.PHYSICS.MOUSE_REPULSION_RADIUS;
        const mForce = CONFIG.PHYSICS.MOUSE_REPULSION_FORCE;
        const gForce = CONFIG.PHYSICS.GRAVITY_WELL_FORCE;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Environment Physics Override
            if (this.environment === 'water') {
                p.vy -= 0.05 * dt; // Bubbles float up
                p.vx += Math.sin(p.y * 0.05 + timestamp * 0.001) * 0.02; // Wave sway
            } else if (this.environment === 'sand') {
                p.vy += 0.02 * dt; // Sand falls
                p.vx += (Math.random() - 0.5) * 0.5; // Jitter
            } else if (this.environment === 'fire') {
                p.vy -= 0.08 * dt; // Heat rises fast
            } else if (this.environment === 'ice') {
                p.vx *= 0.9; // Stop horizontal movement, freeze
                p.vy *= 0.9;
            }

            // 1. Mouse Repulsion
            const mdx = p.x - this.mouseX;
            const mdy = p.y - this.mouseY;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

            if (mDist < mRadius) {
                const power = (1 - (mDist / mRadius)) * mForce;
                const angle = Math.atan2(mdy, mdx);
                p.applyForce(Math.cos(angle) * power, Math.sin(angle) * power);
            }

            // 2. Gravity Well (Shift Key)
            if (this.gravityActive) {
                const gdx = this.gravityTargetX - p.x;
                const gdy = this.gravityTargetY - p.y;
                // Normalize and apply
                const gDist = Math.sqrt(gdx * gdx + gdy * gdy);
                if (gDist > 10) {
                    const gAngle = Math.atan2(gdy, gdx);
                    p.applyForce(Math.cos(gAngle) * gForce, Math.sin(gAngle) * gForce);
                }
            }

            p.update(dt);
            p.draw(this.ctx);

            if (!p.active) {
                this.particles.splice(i, 1);
            }
        }
    }
}
