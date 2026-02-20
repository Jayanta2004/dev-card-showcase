export class Environment {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.obstacles = []; // Rectangles or Circles
        this.zones = []; // Areas with overridden physics

        // Add some default obstacles
        this.obstacles.push({ type: 'circle', x: width / 2, y: height / 2, r: 50 });
        this.obstacles.push({ type: 'rect', x: 100, y: height - 150, w: 200, h: 20 });
    }

    setObstacles(newObstacles) {
        this.obstacles = newObstacles;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        // Reposition center obstacle
        this.obstacles[0].x = width / 2;
        this.obstacles[0].y = height / 2;
    }

    applyConstraints(particles) {
        for (const p of particles) {
            for (const obs of this.obstacles) {
                if (obs.type === 'circle') {
                    const dx = p.pos.x - obs.x;
                    const dy = p.pos.y - obs.y;
                    const dist = Math.hypot(dx, dy);
                    const minDist = obs.r + p.radius;

                    if (dist < minDist) {
                        // Collision response
                        const nx = dx / dist;
                        const ny = dy / dist;
                        const pen = minDist - dist;

                        // Move out
                        p.pos.x += nx * pen;
                        p.pos.y += ny * pen;

                        // Bounce
                        const velAlongNormal = p.vel.x * nx + p.vel.y * ny;
                        if (velAlongNormal < 0) {
                            const j = -(1 + p.dna.restitution) * velAlongNormal;
                            p.vel.x += nx * j;
                            p.vel.y += ny * j;
                        }
                    }
                } else if (obs.type === 'rect') {
                    // Simple AABB vs Circle
                    // Find closest point on rect to circle center
                    const closestX = Math.max(obs.x, Math.min(p.pos.x, obs.x + obs.w));
                    const closestY = Math.max(obs.y, Math.min(p.pos.y, obs.y + obs.h));

                    const dx = p.pos.x - closestX;
                    const dy = p.pos.y - closestY;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < p.radius * p.radius) {
                        const dist = Math.sqrt(distSq);
                        // Avoid div/0
                        if (dist === 0) continue;

                        const nx = dx / dist;
                        const ny = dy / dist;
                        const pen = p.radius - dist;

                        p.pos.x += nx * pen;
                        p.pos.y += ny * pen;

                        const velAlongNormal = p.vel.x * nx + p.vel.y * ny;
                        if (velAlongNormal < 0) {
                            const j = -(1 + p.dna.restitution) * velAlongNormal;
                            p.vel.x += nx * j;
                            p.vel.y += ny * j;
                        }
                    }
                }
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#333';
        ctx.strokeStyle = '#555';

        for (const obs of this.obstacles) {
            ctx.beginPath();
            if (obs.type === 'circle') {
                ctx.arc(obs.x, obs.y, obs.r, 0, Math.PI * 2);
            } else if (obs.type === 'rect') {
                ctx.rect(obs.x, obs.y, obs.w, obs.h);
            }
            ctx.fill();
            ctx.stroke();
        }
    }
}
