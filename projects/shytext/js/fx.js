/**
 * fx.js
 * 
 * Manages the "atmosphere" of ShyText.
 * Includes a canvas-based particle system that responds to global 
 * proximity levels, creating a more immersive and "alive" environment.
 * 
 * @module Effects
 */

import { CONFIG } from './config.js';
import { STATE } from './state.js';
import { randomInt, lerp } from './utils.js';

export class AmbientFX {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.trail = [];
        this.maxTrailLength = 20;
        this.animationFrameId = null;

        this.init();
    }

    /**
     * Initializes pixels and particle array.
     */
    init() {
        this.resize();
        this.createParticles();

        window.addEventListener('shytext:resize', () => this.resize());

        if (CONFIG.DEBUG) {
            console.log('AmbientFX: Initialized with', CONFIG.AMBIENT.PARTICLE_COUNT, 'particles.');
        }
    }

    /**
     * Resizes the canvas to match host dimensions.
     */
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * Populates the particle pool.
     */
    createParticles() {
        this.particles = [];
        const count = CONFIG.AMBIENT.PARTICLE_COUNT;

        for (let i = 0; i < count; i++) {
            this.particles.push(this.spawnParticle());
        }
    }

    /**
     * Spawns a single particle with randomized properties.
     * 
     * @returns {Object} Particle configuration
     */
    spawnParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * CONFIG.AMBIENT.MOVEMENT_SPEED,
            speedY: (Math.random() - 0.5) * CONFIG.AMBIENT.MOVEMENT_SPEED,
            opacity: Math.random() * 0.4 + 0.1,
            hue: randomInt(230, 250) // Subtle blue/purple hues
        };
    }

    /**
     * Main animation loop for the background.
     * 
     * @param {number} globalProximity - Current intensity level (0-1)
     */
    update(globalProximity) {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update Trail
        this.updateTrail();

        // Particle update and draw loop
        this.particles.forEach(p => {
            // Update position
            p.x += p.speedX;
            p.y += p.speedY;

            // React to proximity (particles speed up when "nervous")
            const thrillFactor = 1 + (globalProximity * 2.5);
            p.x += p.speedX * thrillFactor;
            p.y += p.speedY * thrillFactor;

            // Wrap around screen
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            // Draw particle
            const alpha = p.opacity * (1 - globalProximity * 0.5);
            this.ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Interact with trail
            this.interactWithTrail(p);

            // Subtle connections between close particles
            this.drawConnections(p, globalProximity);
        });

        // Add a "nervous" vignetting effect when proximity is high
        if (globalProximity > 0.5) {
            this.drawVignette(globalProximity);
        }
    }

    /**
     * Draws faint lines between particles that are close together.
     */
    drawConnections(p, globalProximity) {
        const connectionDist = 100;
        this.particles.forEach(p2 => {
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionDist) {
                const alpha = (1 - dist / connectionDist) * 0.05 * (1 - globalProximity);
                this.ctx.strokeStyle = `rgba(150, 150, 255, ${alpha})`;
                this.ctx.lineWidth = 0.5;
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p2.x, p2.y);
                this.ctx.stroke();
            }
        });
    }

    /**
     * Draws a subtle reactive vignette.
     */
    drawVignette(intensity) {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width * 0.8
        );

        const alpha = (intensity - 0.5) * 0.15;
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, `rgba(0,0,0,${alpha})`);

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updateTrail() {
        this.trail.unshift({ x: STATE.cursor.x, y: STATE.cursor.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
        }

        // Draw Trail (Ghostly)
        this.ctx.beginPath();
        this.ctx.strokeStyle = `rgba(99, 102, 241, 0.15)`;
        this.ctx.lineWidth = 2;
        for (let i = 0; i < this.trail.length - 1; i++) {
            this.ctx.moveTo(this.trail[i].x, this.trail[i].y);
            this.ctx.lineTo(this.trail[i + 1].x, this.trail[i + 1].y);
        }
        this.ctx.stroke();
    }

    interactWithTrail(p) {
        if (this.trail.length === 0) return;
        const head = this.trail[0];
        const dx = p.x - head.x;
        const dy = p.y - head.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
            const force = (100 - dist) / 500;
            p.speedX += (dx / dist) * force;
            p.speedY += (dy / dist) * force;
        }
    }
}

/**
 * Technical Reflection: Kinetic Visuals
 * 
 * The background layer isn't just static; it acts as a secondary 
 * feedback mechanism. By increasing particle velocity and 
 * color intensity in response to cursor proximity, we create a 
 * "kinetic anxiety" in the interface that mirrors the behavior 
 * of the text itself.
 */
