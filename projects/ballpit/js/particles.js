/**
 * particles.js
 * Visual effects for high-speed collisions.
 */

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.radius = Utils.random(1, 3);
        this.color = color;
        this.life = CONFIG.PARTICLE_LIFE;
        this.maxLife = CONFIG.PARTICLE_LIFE;

        const angle = Math.random() * Math.PI * 2;
        const speed = Utils.random(1, 4);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.vy += 0.1; // Local gravity for particles
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, color, count = 5) {
        if (!STATE.showParticles) return;
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (const p of this.particles) {
            p.draw(ctx);
        }
    }
}

const Particles = new ParticleSystem();
