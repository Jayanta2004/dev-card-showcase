/**
 * GravityFont - Visual Particle System
 * Adds ambient dust, sparks, and flow particles to the scene.
 * This is separate from the physics engine to keep visual flair distinct from simulation logic.
 */

class VisualParticleSystem {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;

        this.particles = [];
        this.maxParticles = 100;
        this.emitRate = 2; // Particles per frame
    }

    /**
     * Emits a new particle at a random or specific location.
     */
    emit(x, y) {
        if (this.particles.length >= this.maxParticles) return;

        this.particles.push({
            x: x || Math.random() * this.width,
            y: y || Math.random() * this.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 1.0,
            decay: 0.01 + Math.random() * 0.02,
            size: 1 + Math.random() * 3,
            color: `hsla(${Math.random() * 60 + 200}, 80%, 70%, 1)` // Blue-ish hues
        });
    }

    /**
     * Updates and draws all visual particles.
     */
    updateAndDraw() {
        // Emit ambient particles
        if (Math.random() < 0.1) {
            this.emit();
        }

        this.ctx.globalCompositeOperation = 'lighter';

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            // Interaction with mouse (simple repulsion)
            // We assume mouse pos is available globally or passed in, 
            // but for stand-alone simplicity we'll just drift.

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color.replace('1)', `${p.life})`);
            this.ctx.fill();
        }

        this.ctx.globalCompositeOperation = 'source-over';
    }

    /**
     * Resizes the system bounds.
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
    }
}
