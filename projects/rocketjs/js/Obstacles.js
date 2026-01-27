import { Utils } from './Utils.js';

export class ObstacleManager {
    constructor(gameWidth, gameHeight) {
        this.obstacles = [];
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.spawnTimer = 0;
        this.difficulty = 1;
    }

    reset() {
        this.obstacles = [];
        this.difficulty = 1;
        this.spawnTimer = 0;
    }

    spawn(velocity) {
        const size = Utils.randomRange(20, 60);
        const x = Utils.randomRange(size, this.gameWidth - size);

        this.obstacles.push({
            x: x,
            y: -100, // Spawn above screen
            size: size,
            speed: 200 + (velocity * 0.5), // Falls faster if we are moving up fast? 
            // Actually relative speed: if rocket moves up -> obstacles move down faster
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: Utils.randomRange(-2, 2),
            type: Math.random() > 0.8 ? 'metallic' : 'rocky'
        });
    }

    update(dt, bgSpeed) {
        // Increase difficulty
        this.difficulty += dt * 0.05;

        // Spawn logic
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawn(bgSpeed);
            // Faster spawn rate as difficulty increases
            this.spawnTimer = Math.max(0.2, 1.5 - (this.difficulty * 0.1));
        }

        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];

            // Move down relative to camera/rocket
            obs.y += (obs.speed + bgSpeed) * dt;
            obs.rotation += obs.rotSpeed * dt;

            // Remove if off screen
            if (obs.y > this.gameHeight + 100) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        ctx.save();
        for (const obs of this.obstacles) {
            ctx.translate(obs.x, obs.y);
            ctx.rotate(obs.rotation);

            // Shape
            ctx.beginPath();
            if (obs.type === 'rocky') {
                ctx.fillStyle = '#665544';
                // Rough circle
                const r = obs.size;
                ctx.moveTo(r, 0);
                for (let a = 0; a < 7; a++) {
                    const angle = (Math.PI * 2 * a) / 7;
                    const rad = r * (0.8 + Math.random() * 0.4); // This random makes it jittery every frame! 
                    // Need to store geometry or just use simple shape. 
                    // Let's stick to simple shape for performance/stability.
                }
                // Fixed jagged shape
                const r2 = r * 0.7;
                ctx.moveTo(r, 0);
                ctx.lineTo(r2, r2);
                ctx.lineTo(0, r);
                ctx.lineTo(-r2, r2);
                ctx.lineTo(-r, 0);
                ctx.lineTo(-r2, -r2);
                ctx.lineTo(0, -r);
                ctx.lineTo(r2, -r2);
            } else {
                ctx.fillStyle = '#444455';
                const s = obs.size;
                ctx.rect(-s / 2, -s / 2, s, s);
            }
            ctx.fill();

            // Detail
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fill();

            ctx.rotate(-obs.rotation);
            ctx.translate(-obs.x, -obs.y);
        }
        ctx.restore();
    }

    // New safe draw method avoiding random generator in loop
    drawOptimized(ctx) {
        for (const obs of this.obstacles) {
            ctx.save();
            ctx.translate(obs.x, obs.y);
            ctx.rotate(obs.rotation);

            if (obs.type === 'rocky') {
                // Asteroid Look
                ctx.fillStyle = '#8c7b6c';
                ctx.beginPath();
                const r = obs.size;
                ctx.moveTo(r, 0);
                ctx.lineTo(r * 0.5, r * 0.8);
                ctx.lineTo(-r * 0.6, r * 0.7);
                ctx.lineTo(-r, -r * 0.2);
                ctx.lineTo(-r * 0.3, -r * 0.9);
                ctx.lineTo(r * 0.7, -r * 0.6);
                ctx.closePath();
                ctx.fill();

                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath();
                ctx.arc(-r / 3, r / 3, r / 3, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Debris Look
                ctx.fillStyle = '#7a8ba0';
                ctx.beginPath();
                const s = obs.size;
                ctx.moveTo(-s / 2, -s / 2);
                ctx.lineTo(s / 2, -s / 2);
                ctx.lineTo(s / 2, s / 2);
                ctx.lineTo(0, s / 3); // dent
                ctx.lineTo(-s / 2, s / 2);
                ctx.closePath();
                ctx.fill();

                // Tech detail
                ctx.strokeStyle = '#aaccff';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            ctx.restore();
        }
    }
}
