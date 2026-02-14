/**
 * GRAVITYTYPE // PARTICLE SYSTEM
 * scripts/visuals/particles.js
 * 
 * Manages transient visual effects.
 */

class Particle {
    constructor() {
        this.pos = new Vector2();
        this.vel = new Vector2();
        this.color = '#fff';
        this.life = 1.0;
        this.decay = 0.02;
        this.size = 2;
        this.active = false;
    }

    spawn(x, y, color) {
        this.pos.set(x, y);
        const angle = Math.random() * Math.PI * 2;
        const speed = MathUtils.randRange(1, 6);
        this.vel.set(Math.cos(angle) * speed, Math.sin(angle) * speed);
        this.color = color;
        this.life = 1.0;
        this.decay = MathUtils.randRange(0.02, 0.05);
        this.size = MathUtils.randRange(1, 3);
        this.active = true;
    }

    update() {
        if (!this.active) return;
        this.pos.add(this.vel);
        this.life -= this.decay;
        if (this.life <= 0) this.active = false;
    }
}

class ParticleSystem {
    constructor(maxParticles = 500) {
        this.pool = [];
        this.max = maxParticles;
        for (let i = 0; i < maxParticles; i++) {
            this.pool.push(new Particle());
        }
    }

    emit(x, y, count = 5, color = '#fff') {
        let spawned = 0;
        for (const p of this.pool) {
            if (!p.active) {
                p.spawn(x, y, color);
                spawned++;
                if (spawned >= count) break;
            }
        }
    }

    explode(x, y, color) {
        this.emit(x, y, 20, color);
    }

    update() {
        for (const p of this.pool) {
            p.update();
        }
    }

    draw(ctx) {
        ctx.save();
        for (const p of this.pool) {
            if (p.active) {
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.pos.x, p.pos.y, p.size, p.size);
            }
        }
        ctx.restore();
    }
}
