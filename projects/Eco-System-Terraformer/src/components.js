// src/components.js

export class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

export class Velocity {
    constructor(dx, dy) {
        this.dx = dx;
        this.dy = dy;
    }
}

export class Type {
    constructor(type) {
        this.type = type; // 'Grass', 'Rabbit', 'Wolf'
    }
}

export class Life {
    constructor(maxEnergy, decayRate) {
        this.energy = maxEnergy * 0.5; // Start half full
        this.maxEnergy = maxEnergy;
        this.decayRate = decayRate;
        this.alive = true;
    }
}

export class Renderable {
    constructor(color, size) {
        this.color = color;
        this.size = size;
    }
}

export class Vision {
    constructor(range) {
        this.range = range;
    }
}
