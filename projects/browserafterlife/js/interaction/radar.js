
export class Radar {
    constructor() {
        this.container = document.querySelector('.spirit-box');

        this.canvas = document.createElement('canvas');
        this.canvas.width = 280;
        this.canvas.height = 280;
        this.canvas.className = 'radar-display';
        this.canvas.style.marginTop = '15px';
        this.canvas.style.border = '1px solid #1f3a2d';
        this.canvas.style.borderRadius = '50%';
        this.canvas.style.background = 'radial-gradient(circle, #05100a 0%, #000 100%)';

        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.angle = 0;
    }

    update(ghosts, playerX, playerY) {
        this.angle += 0.05;
        this.draw(ghosts, playerX, playerY);
    }

    draw(ghosts, px, py) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        // Fade out for trail effect
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(0, 0, w, h);

        // Grid rings
        ctx.strokeStyle = '#1f3a2d';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, w * 0.2, 0, Math.PI * 2);
        ctx.arc(cx, cy, w * 0.35, 0, Math.PI * 2);
        ctx.arc(cx, cy, w * 0.48, 0, Math.PI * 2);
        ctx.stroke();

        // Crosshair
        ctx.beginPath();
        ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
        ctx.moveTo(0, cy); ctx.lineTo(w, cy);
        ctx.stroke();

        // Sweep Line
        const sx = cx + Math.cos(this.angle) * (w * 0.5);
        const sy = cy + Math.sin(this.angle) * (h * 0.5);

        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#0f0';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(sx, sy);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Blips
        // Map world coords to radar
        // Assume world is window size? Scaling needed.
        const scaler = 0.15; // Zoom scale

        ghosts.forEach(g => {
            // Relative to player? Or absolute? Let's do relative to center of screen (player?)
            // If playerX is passed (or assume center of screen is 0,0 for radar)
            // Let's assume radar centered on window center.

            const dx = g.x - (window.innerWidth / 2);
            const dy = g.y - (window.innerHeight / 2);

            const rx = cx + dx * scaler;
            const ry = cy + dy * scaler;

            // Check if within radar circle
            const d = Math.sqrt(dx * dx + dy * dy) * scaler;
            if (d < w * 0.5) {
                // Calculate angle to blip
                const blipAngle = Math.atan2(dy, dx);
                // Difference from sweep angle
                // Normalize angles
                let angDiff = (blipAngle - this.angle) % (Math.PI * 2);
                if (angDiff < 0) angDiff += Math.PI * 2;

                // If sweep just passed it (small positive diff? No, sweep rotates clockwise)
                // Actually, if sweep is close to blip angle

                // Simple render for now: Just draw them as dots
                ctx.fillStyle = g.soul.color;
                ctx.beginPath();
                ctx.arc(rx, ry, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
}
