/**
 * GravityFont - Glyph Class
 * Manages the creation of particles and constraints for a single letter.
 */

class Glyph {
    /**
     * @param {string} char Character to represent
     * @param {Vector} position Spawn position
     * @param {TextParser} parser Reference to the parser
     * @param {string} groupId Unique ID for this glyph group
     */
    constructor(char, position, parser, groupId) {
        this.char = char;
        this.center = position.clone();
        this.groupId = groupId;

        this.particles = [];
        this.constraints = [];

        // Extract raw points
        const points = parser.parseCharacter(char);
        this.createSoftBody(points);
    }

    /**
     * Creates a network of particles and constraints from raw points.
     */
    createSoftBody(points) {
        if (points.length === 0) return;

        // 1. Create Particles
        points.forEach(p => {
            const particle = new Particle(
                this.center.x + p.x,
                this.center.y + p.y,
                {
                    radius: 3,
                    mass: 1,
                    groupId: this.groupId,
                    originalOffset: p.clone(),
                    color: this.getRandomColor()
                }
            );
            this.particles.push(particle);
        });

        // 2. Create Structural Constraints
        // We connect each particle to its nearest neighbors to form a mesh
        const neighborRadius = 12; // Radius to look for neighbors

        for (let i = 0; i < this.particles.length; i++) {
            const p1 = this.particles[i];

            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dist = p1.position.dist(p2.position);

                if (dist < neighborRadius) {
                    this.constraints.push(new Constraint(p1, p2, {
                        distance: dist,
                        stiffness: 0.15,
                        color: 'rgba(255, 255, 255, 0.05)'
                    }));
                }

                // Add some cross-bracing for structure stability (further neighbors)
                if (dist > neighborRadius && dist < neighborRadius * 1.8) {
                    this.constraints.push(new Constraint(p1, p2, {
                        distance: dist,
                        stiffness: 0.05,
                        color: 'rgba(255, 255, 255, 0.02)'
                    }));
                }
            }
        }
    }

    getRandomColor() {
        const colors = [
            '#3a86ff', // Blue
            '#8338ec', // Purple
            '#ff006e', // Pink
            '#fb5607', // Orange
            '#ffbe0b'  // Yellow
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Gets the current bounding box of the glyph.
     */
    getBoundingBox() {
        if (this.particles.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        this.particles.forEach(p => {
            minX = Math.min(minX, p.position.x);
            minY = Math.min(minY, p.position.y);
            maxX = Math.max(maxX, p.position.x);
            maxY = Math.max(maxY, p.position.y);
        });

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
}
