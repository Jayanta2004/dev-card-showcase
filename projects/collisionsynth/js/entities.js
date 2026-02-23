/**
 * @file entities.js
 * @description Defines the core interactive objects in the CollisionSynth world.
 */

class Entity {
    constructor(id) {
        this.id = id || `ent_${Math.random().toString(36).substr(2, 9)}`;
        this.active = true;
    }
}

/**
 * Ball Class
 * A dynamic agent that bounces off walls and generates sound.
 */
class Ball extends Entity {
    constructor(x, y, radius = 10) {
        super();
        this.pos = new Utils.Vec2(x, y);
        this.vel = new Utils.Vec2(Utils.random(-5, 5), Utils.random(-5, 5));
        this.acc = new Utils.Vec2(0, 0);
        this.radius = radius;
        this.color = Utils.getCSSVar('--accent-primary');
        this.mass = radius * 0.1;
        this.elasticity = 0.95;
        this.trail = [];
        this.maxTrail = 20;

        // Audio specific properties
        this.lastTriggerTime = 0;
        this.energy = 1.0; // Fades after collision
    }

    update(dt, gravity, friction) {
        // Apply forces
        this.acc.add(new Utils.Vec2(0, gravity * 0.1));
        this.vel.add(this.acc);
        this.vel.mul(friction);
        this.pos.add(new Utils.Vec2(this.vel.x * dt, this.vel.y * dt));
        this.acc.set(0, 0);

        // Update trail
        this.trail.unshift(this.pos.copy());
        if (this.trail.length > this.maxTrail) this.trail.pop();

        // Reclaim energy
        this.energy = Utils.lerp(this.energy, 0, 0.05);
    }

    draw(ctx) {
        // Draw trail
        ctx.save();
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = 1 - (i / this.trail.length);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = alpha * 0.3;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, this.radius * (1 - i / this.trail.length), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // Draw ball
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner core
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(this.pos.x - this.radius * 0.2, this.pos.y - this.radius * 0.2, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

/**
 * Wall Class
 * A static (but draggable) boundary that triggers sound and physics response.
 */
class Wall extends Entity {
    constructor(x1, y1, x2, y2) {
        super();
        this.p1 = new Utils.Vec2(x1, y1);
        this.p2 = new Utils.Vec2(x2, y2);
        this.color = Utils.getCSSVar('--glass-border');
        this.activeColor = Utils.getCSSVar('--accent-secondary');
        this.hitIntensity = 0;
        this.thickness = 4;

        // Metadata for interaction
        this.isDragging = false;
        this.isHovered = false;
    }

    get length() {
        return this.p1.dist(this.p2);
    }

    get center() {
        return new Utils.Vec2((this.p1.x + this.p2.x) / 2, (this.p1.y + this.p2.y) / 2);
    }

    update() {
        if (this.hitIntensity > 0) {
            this.hitIntensity *= 0.9;
        }
    }

    draw(ctx) {
        ctx.save();

        // Main line
        ctx.beginPath();
        const strokeColor = Utils.lerp(0.1, 1, this.hitIntensity);
        ctx.strokeStyle = this.isHovered || this.isDragging ? this.activeColor : `rgba(255, 255, 255, ${strokeColor})`;
        ctx.lineWidth = this.thickness + (this.hitIntensity * 10);

        if (this.hitIntensity > 0.1) {
            ctx.shadowBlur = 20 * this.hitIntensity;
            ctx.shadowColor = this.activeColor;
        }

        ctx.lineCap = 'round';
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.stroke();

        // End points indicators
        if (this.isHovered || this.isDragging) {
            ctx.fillStyle = this.activeColor;
            ctx.beginPath();
            ctx.arc(this.p1.x, this.p1.y, 6, 0, Math.PI * 2);
            ctx.arc(this.p2.x, this.p2.y, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    triggerHit() {
        this.hitIntensity = 1.0;
    }
}
