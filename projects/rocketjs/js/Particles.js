import { Utils } from './Utils.js';

export class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.life = 0;
        this.maxLife = 0;
        this.color = '#fff';
        this.size = 1;
        this.active = false;
        this.type = 'smoke'; // 'smoke', 'fire', 'speak'
        this.alpha = 1;
    }

    update(dt) {
        if (!this.active) return;

        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;

        if (this.life <= 0) {
            this.active = false;
        }

        // Logic per type
        if (this.type === 'smoke') {
            this.size += 50 * dt; // Expand
            this.alpha = this.life / this.maxLife; // Fade out
            this.vx *= 0.95; // Drag
        } else if (this.type === 'fire') {
            this.size += 10 * dt;
            this.alpha = Utils.easeInCubic(this.life / this.maxLife);
        } else if (this.type === 'spark') {
            this.vy += 200 * dt; // Gravity
        }
    }
}

export class ParticleSystem {
    constructor(capacity = 2000) {
        this.capacity = capacity;
        this.pool = [];
        this.activeCount = 0;

        for (let i = 0; i < capacity; i++) {
            this.pool.push(new Particle());
        }
    }

    spawn(x, y, type, config = {}) {
        // Find first inactive particle
        let p = null;
        for (let i = 0; i < this.capacity; i++) {
            if (!this.pool[i].active) {
                p = this.pool[i];
                break;
            }
        }

        if (!p) return; // Pool empty

        p.active = true;
        p.x = x;
        p.y = y;
        p.type = type;

        // Defaults based on type
        if (type === 'smoke') {
            p.vx = Utils.randomRange(-20, 20);
            p.vy = Utils.randomRange(10, 50);
            p.maxLife = Utils.randomRange(2, 4);
            p.size = Utils.randomRange(10, 30);
            p.color = config.color || `rgb(${Utils.randomInt(200, 255)}, ${Utils.randomInt(200, 255)}, ${Utils.randomInt(200, 255)})`;
        } else if (type === 'fire') {
            p.vx = Utils.randomRange(-10, 10) + (config.vx || 0);
            p.vy = Utils.randomRange(100, 300) + (config.vy || 0);
            p.maxLife = Utils.randomRange(0.1, 0.4);
            p.size = Utils.randomRange(5, 15);
            p.color = config.color || '#ffaa00';
        } else if (type === 'spark') {
            p.vx = Utils.randomRange(-100, 100);
            p.vy = Utils.randomRange(-100, 100);
            p.maxLife = Utils.randomRange(0.5, 1.5);
            p.size = Utils.randomRange(2, 4);
            p.color = '#ffffff';
        }

        // Overrides
        if (config.vx) p.vx = config.vx;
        if (config.vy) p.vy = config.vy;
        if (config.color) p.color = config.color;

        p.life = p.maxLife;
        p.alpha = 1;

        this.activeCount++;
    }

    update(dt) {
        this.activeCount = 0;
        for (let i = 0; i < this.capacity; i++) {
            if (this.pool[i].active) {
                this.pool[i].update(dt);
                this.activeCount++;
            }
        }
    }

    draw(ctx, cameraY) {
        // We will separate particles by type to optimize batching (state changes are expensive)
        // But for < 2000 particles, simple loop is usually 60fps ok on modern devices.
        // Let's optimize by sorting? No, too slow. Just drawing.

        // Improve: Add globalAlpha once per batch if needed.

        for (let i = 0; i < this.capacity; i++) {
            const p = this.pool[i];
            if (!p.active) continue;

            // Simple culling
            if (p.y - cameraY > window.innerHeight + 100 || p.y - cameraY < -100) continue;

            ctx.globalAlpha = p.alpha;

            if (p.type === 'fire') {
                // Glow effect for fire
                const grad = ctx.createRadialGradient(p.x, p.y - cameraY, 0, p.x, p.y - cameraY, p.size);
                grad.addColorStop(0, '#ffffcc'); // White hot core
                grad.addColorStop(0.4, p.color); // Color
                grad.addColorStop(1, 'rgba(0,0,0,0)'); // Transparent edge
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.x, p.y - cameraY, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y - cameraY, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    }
}
