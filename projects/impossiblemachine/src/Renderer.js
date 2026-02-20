export class Renderer {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
    }

    clear() {
        this.ctx.fillStyle = 'rgba(5, 5, 5, 0.3)'; // Trail effect
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawParticles(particles) {
        // Draw trails first (so they are behind)
        this.ctx.lineWidth = 2;
        for (const p of particles) {
            if (p.history.length < 2) continue;

            this.ctx.beginPath();
            this.ctx.moveTo(p.history[0].x, p.history[0].y);
            for (let i = 1; i < p.history.length; i++) {
                this.ctx.lineTo(p.history[i].x, p.history[i].y);
            }
            // Trail color matches particle but fading
            this.ctx.strokeStyle = p.color.replace('1)', '0.3)');
            this.ctx.stroke();
        }

        for (const p of particles) {
            this.ctx.beginPath();
            this.ctx.arc(p.pos.x, p.pos.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;

            // Glow effect based on energy/velocity or DNA
            const speed = Math.hypot(p.vel.x, p.vel.y);
            const energyGlow = Math.min(20, speed / 10);

            this.ctx.shadowBlur = energyGlow;
            this.ctx.shadowColor = p.color;

            // Extra glow for anti-gravity
            if (p.dna.gravity.y < 0) {
                this.ctx.shadowBlur += 15;
                this.ctx.shadowColor = '#00ffff'; // Cyan glow for floaters
            }

            this.ctx.fill();
            this.ctx.closePath();

            // Reset shadow for next operations if needed (though we overwrite it)
            this.ctx.shadowBlur = 0;
        }
    }
}
