/**
 * ParticleSystem.js
 * Base engine for governing particle lifecycles.
 */
import DOMHelper from '../core/DOMHelper.js';

export default class ParticleSystem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.particles = [];
        this.isActive = false;
        this.animationFrameId = null;
        this.maxParticles = 50;
        this.spawnRate = 100; // ms
        this.lastSpawn = 0;
        this.ParticleClass = null; // To be set by specific mood
    }

    /**
     * Start the particle system with a specific particle type
     * @param {class} ParticleClass 
     * @param {object} options 
     */
    start(ParticleClass, options = {}) {
        this.stop(); // Clear previous
        this.ParticleClass = ParticleClass;
        this.options = options;
        this.isActive = true;
        this.maxParticles = options.maxParticles || 50;
        this.spawnRate = options.spawnRate || 100;

        this.loop();
    }

    stop() {
        this.isActive = false;

        // Cancel loop
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        // Cleanup existing DOM elements
        this.particles.forEach(p => p.destroy());
        this.particles = [];
        this.container.innerHTML = '';
    }

    loop(timestamp) {
        if (!this.isActive) return;

        // Spawn new particles
        if (!this.lastSpawn || timestamp - this.lastSpawn > this.spawnRate) {
            if (this.particles.length < this.maxParticles) {
                this.spawnParticle();
            }
            this.lastSpawn = timestamp;
        }

        // Update existing
        this.particles.forEach((p, index) => {
            p.update();
            if (p.isDead()) {
                p.destroy();
                this.particles.splice(index, 1);
            }
        });

        this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
    }

    spawnParticle() {
        if (!this.ParticleClass) return;
        const p = new this.ParticleClass(this.container, this.options);
        this.particles.push(p);
    }
}
