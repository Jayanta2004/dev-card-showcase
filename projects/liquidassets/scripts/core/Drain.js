import { Vector2 } from '../fluid/Vector2.js';

export class Drain {
    constructor(id, name, amount, x, y, color) {
        this.id = id;
        this.name = name;
        this.amount = amount;
        this.pos = new Vector2(x, y);
        this.color = color;

        // Radius linked to expense amount (visual metaphor)
        // Min 20px, Max 60px
        this.radius = Math.min(60, Math.max(25, Math.sqrt(amount) * 0.8));
        this.radiusSq = this.radius * this.radius;

        this.isDragging = false;
    }

    updateConfig(name, amount, color) {
        this.name = name;
        this.amount = amount;
        this.color = color;
        this.radius = Math.min(60, Math.max(25, Math.sqrt(amount) * 0.8));
        this.radiusSq = this.radius * this.radius;
    }

    contains(x, y) {
        const dx = this.pos.x - x;
        const dy = this.pos.y - y;
        return (dx * dx + dy * dy) < this.radiusSq;
    }
}
