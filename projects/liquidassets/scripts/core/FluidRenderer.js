import { Config } from '../Config.js';
import { MathUtils } from '../utils/MathUtils.js';

export class FluidRenderer {
    constructor(canvas, simulation) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.sim = simulation;

        // Cache gradients
        this.particleGradient = null;
        this.createGradients();
    }

    createGradients() {
        // We can't really use a single gradient for all particles if they move
        // But we can create a sprite/image for a single particle 
        // to draw faster than arc()

        this.particleSprite = document.createElement('canvas');
        this.particleSprite.width = Config.PARTICLE_RADIUS * 4;
        this.particleSprite.height = Config.PARTICLE_RADIUS * 4;
        const pCtx = this.particleSprite.getContext('2d');

        const center = this.particleSprite.width / 2;
        const radius = Config.PARTICLE_RADIUS;

        // Radial gradient for soft look
        const grad = pCtx.createRadialGradient(center, center, 1, center, center, radius * 2);
        grad.addColorStop(0, 'rgba(100, 255, 218, 0.8)'); // Bright core
        grad.addColorStop(0.5, 'rgba(10, 95, 208, 0.3)'); // Mid blue
        grad.addColorStop(1, 'rgba(10, 95, 208, 0)');   // Transparent edge

        pCtx.fillStyle = grad;
        pCtx.beginPath();
        pCtx.arc(center, center, radius * 2, 0, Math.PI * 2);
        pCtx.fill();
    }

    render(dt) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const particles = this.sim.solver.particles;
        const drains = this.sim.drains;

        // 1. Clear with trail effect for motion blur?
        // this.ctx.fillStyle = 'rgba(5, 10, 20, 0.3)';
        // this.ctx.fillRect(0, 0, width, height);

        this.ctx.fillStyle = '#050a14';
        this.ctx.fillRect(0, 0, width, height);

        // 2. Draw Drains (Expenses)
        this.drawDrains(drains);

        // 3. Draw Particles
        // Batch drawing if possible, or use composite operations

        // Additive blending for "glow" effect when particles overlap
        this.ctx.globalCompositeOperation = 'screen';

        const spriteSize = Config.PARTICLE_RADIUS * 4;
        const offset = spriteSize / 2;

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Optimization: Don't draw if off screen
            if (p.pos.x < -offset || p.pos.x > width + offset ||
                p.pos.y < -offset || p.pos.y > height + offset) continue;

            // Simple velocity-based stretch could go here

            this.ctx.drawImage(this.particleSprite, p.pos.x - offset, p.pos.y - offset);
        }

        this.ctx.globalCompositeOperation = 'source-over';
    }

    drawDrains(drains) {
        for (const drain of drains) {
            // Glow
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = drain.color;

            this.ctx.beginPath();
            this.ctx.arc(drain.pos.x, drain.pos.y, drain.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(10, 25, 47, 0.8)';
            this.ctx.fill();

            this.ctx.lineWidth = 3;
            // Gradient stroke?
            this.ctx.strokeStyle = drain.color;
            this.ctx.stroke();

            this.ctx.shadowBlur = 0;

            // Text
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 12px "Segoe UI", sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(drain.name, drain.pos.x, drain.pos.y);

            this.ctx.font = '10px "Segoe UI", sans-serif';
            this.ctx.fillStyle = 'rgba(255,255,255,0.7)';
            this.ctx.fillText(`$${drain.amount}`, drain.pos.x, drain.pos.y + 14);
        }
    }
}
