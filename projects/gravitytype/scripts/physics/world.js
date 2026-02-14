/**
 * GRAVITYTYPE // PHYSICS WORLD
 * scripts/physics/world.js
 * 
 * The main simulation container.
 */

class PhysicsConfig {
    constructor() {
        this.gravity = new Vector2(0, 9.8);
        this.wind = new Vector2(0, 0);
        this.subSteps = 8;
        this.friction = 0.99;
    }
}

class PhysicsWorld {
    /**
     * @param {number} width 
     * @param {number} height 
     */
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.bodies = [];
        this.constraints = [];

        this.config = new PhysicsConfig();
        this.spatial = new SpatialHash(100);

        // Pre-allocate manifold to avoid GC
        this.manifold = new CollisionManifold();

        this.collisionEvents = []; // Hook for particle system
    }

    addBody(body) {
        this.bodies.push(body);
    }

    removeBody(body) {
        const idx = this.bodies.indexOf(body);
        if (idx !== -1) this.bodies.splice(idx, 1);
    }

    /**
     * Steps the simulation forward.
     * @param {number} dt Delta time (seconds)
     */
    step(dt) {
        const subSteps = this.config.subSteps;
        const subDt = dt / subSteps;

        this.collisionEvents = [];

        for (let i = 0; i < subSteps; i++) {
            // 1. Apply Global Forces
            this.applyForces();

            // 2. Spatial Partitioning
            this.spatial.clear();
            for (const b of this.bodies) {
                this.spatial.insert(b);
            }

            // 3. Integrate & Constrain
            for (const b of this.bodies) {
                b.update(subDt, this.config.friction);
                b.constrain(this.width, this.height);
            }

            // 4. Solve Constraints
            for (const c of this.constraints) {
                c.resolve();
            }

            // 5. Solve Collisions
            this.resolveCollisions();
        }
    }

    applyForces() {
        const totalForce = Vector2.add(this.config.gravity, this.config.wind);
        for (const b of this.bodies) {
            b.applyForce(totalForce);
        }
    }

    resolveCollisions() {
        for (const a of this.bodies) {
            // Get neighbors from grid
            const neighbors = this.spatial.query(a);

            for (const b of neighbors) {
                // Ensure unique pairs (id check optimization)
                if (a.id < b.id) {
                    Collision.solveRectRect(a, b, this.manifold);
                    if (this.manifold.hasCollision) {
                        const impulse = Collision.resolve(a, b, this.manifold);

                        // Register high-energy collisions
                        if (impulse > 2) {
                            this.collisionEvents.push({
                                point: Vector2.add(a.pos, b.pos).div(2),
                                energy: impulse
                            });
                        }
                    }
                }
            }
        }
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
    }
}
