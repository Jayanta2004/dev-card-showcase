export class PhysicsDNA {
    constructor() {
        // Default "Earth-like" physics
        this.gravity = { x: 0, y: 500 }; // Positive Y is down
        this.friction = 0.99; // Air resistance equivalent
        this.restitution = 0.7; // Bounciness
    }

    // Method to mutate genes
    mutate(gene, amount) {
        if (this.hasOwnProperty(gene)) {
            if (typeof this[gene] === 'number') {
                this[gene] += amount;
            } else if (typeof this[gene] === 'object') {
                // Vector mutation
                this[gene].x += amount.x || 0;
                this[gene].y += amount.y || 0;
            }
        }
    }

    clone() {
        const copy = new PhysicsDNA();
        copy.gravity = { ...this.gravity };
        copy.friction = this.friction;
        copy.restitution = this.restitution;
        return copy;
    }
}
