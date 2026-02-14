
export class ParticleSystem {
    constructor(ctx) {
        this.ctx = ctx;
        this.particles = [];
        this.frame = 0;
    }

    emit(x, y, options = {}) {
        const amount = options.amount || 1;
        const color = options.color || '#fff';
        const speed = options.speed || 1;
        const life = options.life || 60;
        const type = options.type || 'dust'; // dust, ectoplasm, glitch

        for (let i = 0; i < amount; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * speed,
                vy: (Math.random() - 0.5) * speed,
                life: life + Math.random() * 20,
                maxLife: life + 20,
                color,
                type,
                size: Math.random() * 3 + 1
            });
        }
    }

    update() {
        this.frame++;
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life--;

            if (p.type === 'ectoplasm') {
                p.vy -= 0.05; // Float up
                p.x += Math.sin(this.frame * 0.1 + p.life) * 0.5;
            } else if (p.type === 'glitch') {
                if (Math.random() > 0.8) {
                    p.x += (Math.random() - 0.5) * 10;
                    p.y += (Math.random() - 0.5) * 10;
                }
            } else {
                p.x += p.vx;
                p.y += p.vy;
            }

            p.vx *= 0.95;
            p.vy *= 0.95;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw() {
        this.ctx.save();

        for (const p of this.particles) {
            const alpha = p.life / p.maxLife;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = p.color;

            if (p.type === 'glitch') {
                this.ctx.fillRect(p.x, p.y, p.size * 2, p.size / 2);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        this.ctx.restore();
    }
}
