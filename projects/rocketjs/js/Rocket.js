export class Rocket {
    constructor() {
        this.width = 40;
        this.height = 200;
        this.color = '#e0e0e0';

        // Physics State
        this.x = 0; // Relative center (0 is center of screen)
        this.y = 0;
        this.vx = 0;
        this.tilt = 0;
        this.fuel = 100;
        this.health = 100;
        this.isDead = false;

        // Visual State
        this.stage1Separated = false;
        this.fairingSeparated = false;

        // Animation
        this.wobbleResult = 0;
    }

    draw(ctx, screenCenterX, screenCenterY) {
        if (this.isDead) return;

        ctx.save();
        // Rocket horizontal position is relative to center
        ctx.translate(screenCenterX + this.x, screenCenterY);
        ctx.rotate(this.tilt);

        // --- DRAW ROCKET ---

        // Metallic Gradient
        const grad = ctx.createLinearGradient(-this.width / 2, 0, this.width / 2, 0);
        grad.addColorStop(0, '#8899a6');
        grad.addColorStop(0.2, '#ffffff');
        grad.addColorStop(0.5, '#d0dbe6');
        grad.addColorStop(0.8, '#8899a6');
        grad.addColorStop(1, '#556677');

        // Stage 1 (Booster)
        if (!this.stage1Separated) {
            ctx.fillStyle = grad;
            // Main Body
            ctx.beginPath();
            ctx.moveTo(-this.width / 2, 0);
            ctx.lineTo(this.width / 2, 0);
            ctx.lineTo(this.width / 2, 120);
            ctx.lineTo(-this.width / 2, 120);
            ctx.closePath();
            ctx.fill();

            // Fins
            ctx.fillStyle = '#445566';
            ctx.beginPath();
            ctx.moveTo(-this.width / 2, 100);
            ctx.lineTo(-this.width, 140);
            ctx.lineTo(-this.width / 2, 120);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(this.width / 2, 100);
            ctx.lineTo(this.width, 140);
            ctx.lineTo(this.width / 2, 120);
            ctx.fill();

            // Engine Nozzles
            ctx.fillStyle = '#111';
            ctx.fillRect(-15, 120, 10, 15);
            ctx.fillRect(5, 120, 10, 15);
        }

        // Stage 2 & Payload
        const grad2 = ctx.createLinearGradient(-this.width / 2, 0, this.width / 2, 0);
        grad2.addColorStop(0, '#99aabb');
        grad2.addColorStop(0.4, '#ffffff');
        grad2.addColorStop(1, '#667788');

        ctx.fillStyle = grad2;
        // Upper Body
        ctx.beginPath();
        ctx.moveTo(-this.width / 2 + 2, 0);
        ctx.lineTo(this.width / 2 - 2, 0);
        ctx.lineTo(this.width / 2 - 2, -60);
        ctx.lineTo(-this.width / 2 + 2, -60);
        ctx.closePath();
        ctx.fill();

        // Capsule / Fairing
        ctx.beginPath();
        ctx.moveTo(-this.width / 2 + 2, -60);
        ctx.lineTo(this.width / 2 - 2, -60);
        ctx.quadraticCurveTo(0, -110, -this.width / 2 + 2, -60); // Cone
        ctx.fill();

        // Detail Lines
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-this.width / 2, 0);
        ctx.lineTo(this.width / 2, 0);
        ctx.stroke();

        ctx.restore();
    }
}
