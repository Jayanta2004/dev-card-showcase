/**
 * SIMUGRID PHYSICS ENGINE
 * Manages Rigid Body dynamics, Verlet integration, and Spatial Partitioning.
 * @author saiusesgithub
 */

class RigidBody {
    constructor(options) {
        this.pos = new Vec2(options.x, options.y);
        this.prevPos = new Vec2(options.x, options.y); // For Verlet Integration
        this.vel = new Vec2(0, 0);
        this.acc = new Vec2(0, 0);
        
        this.angle = options.angle || 0;
        this.angularVel = 0;
        
        this.mass = options.mass || 1;
        this.invMass = this.mass === 0 ? 0 : 1 / this.mass;
        this.restitution = options.restitution || 0.6;
        this.friction = 0.98;

        this.type = options.type || 'box'; // 'box', 'circle', 'poly'
        this.color = options.color || '#ff9f0a';
        
        this.vertices = [];
        this.radius = 0; // Bounding radius for broad-phase
        this.initShape(options);
    }

    initShape(opt) {
        if (this.type === 'box') {
            const w = opt.w / 2;
            const h = opt.h / 2;
            this.vertices = [
                new Vec2(-w, -h), new Vec2(w, -h),
                new Vec2(w, h), new Vec2(-w, h)
            ];
            this.radius = Math.sqrt(w*w + h*h);
        } else if (this.type === 'circle') {
            this.shapeRadius = opt.r;
            this.radius = opt.r;
        }
    }

    /**
     * VERLET INTEGRATION
     * More stable than Euler for physics constraints.
     * x(t + dt) = 2x(t) - x(t - dt) + a(dt^2)
     */
    update(dt, gravity) {
        if (this.invMass === 0) return;

        this.acc = this.acc.add(gravity);
        
        const temp = this.pos.copy();
        const velocity = this.pos.sub(this.prevPos).mul(this.friction);
        
        this.pos = this.pos.add(velocity).add(this.acc.mul(dt * dt));
        this.prevPos = temp;
        
        // Reset acceleration
        this.acc = new Vec2(0, 0);
        this.vel = velocity.div(dt); // Estimated velocity for debug
    }

    getTransformedVertices() {
        return this.vertices.map(v => v.rotate(this.angle).add(this.pos));
    }

    getAxes() {
        const verts = this.getTransformedVertices();
        const axes = [];
        for (let i = 0; i < verts.length; i++) {
            const p1 = verts[i];
            const p2 = verts[(i + 1) % verts.length];
            const edge = p2.sub(p1);
            axes.push(edge.perp().normalize());
        }
        return axes;
    }

    project(axis) {
        if (this.type === 'circle') {
            const dot = this.pos.dot(axis);
            return new Projection(dot - this.shapeRadius, dot + this.shapeRadius);
        }
        const verts = this.getTransformedVertices();
        let min = verts[0].dot(axis);
        let max = min;
        for (let i = 1; i < verts.length; i++) {
            const p = verts[i].dot(axis);
            if (p < min) min = p;
            if (p > max) max = p;
        }
        return new Projection(min, max);
    }

    getClosestVertex(point) {
        const verts = this.getTransformedVertices();
        let closest = verts[0];
        let minDist = point.dist(verts[0]);
        for (let i = 1; i < verts.length; i++) {
            const d = point.dist(verts[i]);
            if (d < minDist) {
                minDist = d;
                closest = verts[i];
            }
        }
        return closest;
    }
}

/**
 * SPATIAL HASH GRID
 * Partitions space into a grid to optimize collision detection from O(N^2) to O(N).
 */
class SpatialHash {
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.grid = new Map();
    }

    clear() { this.grid.clear(); }

    insert(body) {
        const key = this._getKey(body.pos);
        if (!this.grid.has(key)) this.grid.set(key, []);
        this.grid.get(key).push(body);
    }

    _getKey(pos) {
        const x = Math.floor(pos.x / this.cellSize);
        const y = Math.floor(pos.y / this.cellSize);
        return `${x},${y}`;
    }

    getNearby(body) {
        const neighbors = [];
        const x = Math.floor(body.pos.x / this.cellSize);
        const y = Math.floor(body.pos.y / this.cellSize);

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const key = `${x + i},${y + j}`;
                if (this.grid.has(key)) {
                    neighbors.push(...this.grid.get(key));
                }
            }
        }
        return neighbors;
    }
}

class PhysicsWorld {
    constructor() {
        this.bodies = [];
        this.gravity = new Vec2(0, 0.5);
        this.spatialHash = new SpatialHash(100);
    }

    add(body) { this.bodies.push(body); }

    step(dt) {
        // 1. Update positions
        this.bodies.forEach(b => b.update(dt, this.gravity));

        // 2. Spatial Partitioning
        this.spatialHash.clear();
        this.bodies.forEach(b => this.spatialHash.insert(b));

        // 3. Resolve Collisions
        for (let i = 0; i < this.bodies.length; i++) {
            const b1 = this.bodies[i];
            const potentials = this.spatialHash.getNearby(b1);

            potentials.forEach(b2 => {
                if (b1 === b2) return;
                const manifold = Collision.check(b1, b2);
                if (manifold) this.resolve(manifold);
            });
        }
    }

    resolve(m) {
        // Separate overlapping bodies
        const totalInvMass = m.b1.invMass + m.b2.invMass;
        if (totalInvMass === 0) return;

        const separation = m.axis.mul(m.overlap / totalInvMass);
        m.b1.pos = m.b1.pos.add(separation.mul(m.b1.invMass));
        m.b2.pos = m.b2.pos.sub(separation.mul(m.b2.invMass));
    }
}

window.PhysicsWorld = PhysicsWorld;
window.RigidBody = RigidBody;