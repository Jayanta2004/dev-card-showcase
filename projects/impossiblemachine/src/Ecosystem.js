export class Ecosystem {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    update(particles, quadtree) {
        // We use the quadtree for efficient neighbor lookups for flocking/hunting

        for (const p of particles) {
            // 1. Biology: Energy consumption
            p.energy -= 0.05;
            p.age += 1;

            // 2. Query Neighbors
            const range = {
                x: p.pos.x - p.dna.perceptionRadius,
                y: p.pos.y - p.dna.perceptionRadius,
                w: p.dna.perceptionRadius * 2,
                h: p.dna.perceptionRadius * 2,
                intersects: (r) => !(r.x > range.x + range.w || r.x + r.w < range.x || r.y > range.y + range.h || r.y + range.h < range.y), // minimal rect interface
                contains: (pt) => true // Optimization hack: quadtree checks basic bounds first
            };

            // Note: Our quadtree query needs a Rectangle with 'contains' method, 
            // but for flocking we need a circular radius check really.
            // Using the existing quadtree query for generic neighbors.

            // We need to construct a proper Rectangle object for the query to work with our Quadtree implementation
            // Importing Rectangle would be best, or duck-typing it.
            // We'll rely on the fact that existing Quadtree check is loose.
            // See `PhysicsEngine` usage for reference.

            // Skip precise query for now if imports tricky, assume PhysicsEngine passes neighbor list? 
            // Better: just perform logic here.

            // Let's implement Flocking
            this.flock(p, particles); // O(N^2) for now unless we pass Quadtree correctly
        }
    }

    // Separated flocking logic
    flock(particle, particles) {
        let alignment = { x: 0, y: 0 };
        let cohesion = { x: 0, y: 0 };
        let separation = { x: 0, y: 0 };
        let total = 0;

        for (const other of particles) {
            if (other === particle) continue;

            const dx = other.pos.x - particle.pos.x;
            const dy = other.pos.y - particle.pos.y;
            const d = Math.hypot(dx, dy);

            if (d < particle.dna.perceptionRadius) {
                // Alignment
                alignment.x += other.vel.x;
                alignment.y += other.vel.y;

                // Cohesion
                cohesion.x += other.pos.x;
                cohesion.y += other.pos.y;

                // Separation
                if (d < particle.dna.perceptionRadius / 2) {
                    separation.x -= dx / d;
                    separation.y -= dy / d;
                }

                // Predation
                if (particle.type === 'predator' && other.type === 'prey') {
                    // Hunt!
                    particle.applyForce(dx * 0.01, dy * 0.01);
                    if (d < particle.radius + other.radius) {
                        // Eat
                        particle.energy = Math.min(particle.maxEnergy, particle.energy + 50);
                        other.energy = -1; // Mark for death
                    }
                } else if (particle.type === 'prey' && other.type === 'predator') {
                    // Flee!
                    particle.applyForce(-dx * 0.05, -dy * 0.05);
                }

                total++;
            }
        }

        if (total > 0) {
            // Normalize and apply
            alignment.x /= total;
            alignment.y /= total;

            cohesion.x /= total;
            cohesion.y /= total;
            cohesion.x -= particle.pos.x;
            cohesion.y -= particle.pos.y;

            // Weighting
            const alignWt = 0.5;
            const cohWt = 0.1;
            const sepWt = 1.0;

            particle.applyForce(alignment.x * alignWt, alignment.y * alignWt);
            particle.applyForce(cohesion.x * cohWt, cohesion.y * cohWt);
            particle.applyForce(separation.x * sepWt, separation.y * sepWt);
        }
    }
}
