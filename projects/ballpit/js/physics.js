/**
 * physics.js
 * The heart of the BallPit simulation. 
 * This engine handles Verlet integration, collision detection, and response.
 * It is optimized using a Spatial Grid to handle hundreds of active entities.
 */

/**
 * Ball Class
 * Represents a dynamic circle in the simulation.
 */
class Ball {
    /**
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     * @param {number} radius - Radius of the ball
     * @param {string} color - Hex color string
     */
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.oldX = x - (Math.random() - 0.5) * 5;
        this.oldY = y - (Math.random() - 0.5) * 5;
        this.radius = radius;
        this.color = color;
        this.rgb = Utils.hexToRgb(color);

        // Mass is proportional to the area for realistic collisions
        this.mass = Math.PI * radius * radius;
        this.invMass = 1 / this.mass;

        this.originalColor = color;
        this.isGrabbed = false;

        // Internal state for advanced effects
        this.lastCollisionTime = 0;
        this.energy = 0;
    }

    /**
     * Steps the ball forward in time using Verlet Integration.
     * @param {number} dt - Delta time multiplier
     * @param {number} gravity - Gravity force
     * @param {number} friction - Velocity decay
     */
    updatePhysics(dt, gravity, friction) {
        if (this.isGrabbed) return;

        // Velocity is derived from the difference between current and old position
        const vx = (this.x - this.oldX) * friction;
        const vy = (this.y - this.oldY) * friction;

        this.oldX = this.x;
        this.oldY = this.y;

        this.x += vx;
        this.y += vy + gravity * dt * dt;

        // Update energy state for visual heatmap
        this.energy = (vx * vx + vy * vy) * this.mass * 0.01;

        // Apply Gravity Well (Magnetic Attraction)
        if (STATE.gravityWellActive) {
            const dx = STATE.mouseX - this.x;
            const dy = STATE.mouseY - this.y;
            const dSq = dx * dx + dy * dy;
            const range = CONFIG.GRAVITY_WELL_RADIUS;

            if (dSq < range * range) {
                const dist = Math.sqrt(dSq) || 0.001;
                const normalizedForce = (1 - dist / range);
                const strength = normalizedForce * normalizedForce * CONFIG.GRAVITY_WELL_FORCE;

                this.x += (dx / dist) * strength;
                this.y += (dy / dist) * strength;
            }
        }
    }

    /**
     * Ensures the ball stays within the screen boundaries.
     */
    constrain() {
        const bounce = CONFIG.BOUNCE;
        const friction = CONFIG.FRICTION;

        // Implicit velocity
        const vx = (this.x - this.oldX) * friction;
        const vy = (this.y - this.oldY) * friction;

        // Horizontal Bounds
        if (this.x < this.radius) {
            this.x = this.radius;
            // Reflect the velocity by moving the 'old' point
            this.oldX = this.x + vx * bounce;
        } else if (this.x > STATE.screenW - this.radius) {
            this.x = STATE.screenW - this.radius;
            this.oldX = this.x + vx * bounce;
        }

        // Vertical Bounds
        if (this.y < this.radius) {
            this.y = this.radius;
            this.oldY = this.y + vy * bounce;
        } else if (this.y > STATE.screenH - this.radius) {
            this.y = STATE.screenH - this.radius;
            this.oldY = this.y + vy * bounce;

            // Apply slight floor friction when on the ground
            this.oldX += (this.x - this.oldX) * 0.05;
        }
    }
}

/**
 * Obstacle Class
 * Static circular bumpers that dynamic objects bounce off of.
 */
class Obstacle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    draw(ctx) {
        // Aesthetic dashed circle for obstacles
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        // Gradient for depth
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.stroke();
        ctx.restore();
    }
}

/**
 * PhysicsEngine Class
 * Manages all balls, obstacles, and the collision resolution loop.
 */
class PhysicsEngine {
    constructor() {
        this.balls = [];
        this.obstacles = [];
        this.grid = new SpatialGrid(window.innerWidth, window.innerHeight, CONFIG.MAX_RADIUS * 2.5);
    }

    /**
     * Initializes the simulation with a specific number of balls.
     */
    init(count) {
        this.balls = [];
        this.obstacles = [];

        // Create initial walls/obstacles for fun
        const centerX = STATE.screenW / 2;
        const centerY = STATE.screenH / 2;
        this.obstacles.push(new Obstacle(centerX - 200, centerY, 80));
        this.obstacles.push(new Obstacle(centerX + 200, centerY, 80));

        for (let i = 0; i < count; i++) {
            this.spawnBall();
        }
    }

    /**
     * Spawns a single ball with random properties within viewport.
     */
    spawnBall() {
        const radius = Utils.random(CONFIG.MIN_RADIUS, CONFIG.MAX_RADIUS);
        const x = Utils.random(radius, STATE.screenW - radius);
        const y = Utils.random(radius, STATE.screenH - radius);
        const color = Utils.randomChoice(CONFIG.PALETTE);
        this.balls.push(new Ball(x, y, radius, color));
    }

    /**
     * Core update loop for physics.
     * Divided into multiple sub-steps for stability.
     */
    update(dt) {
        const subSteps = CONFIG.SUBSTEPS;
        const subDt = dt / subSteps;

        STATE.stats.collisions = 0;

        for (let s = 0; s < subSteps; s++) {
            // 1. Update positions and constraints
            for (let i = 0; i < this.balls.length; i++) {
                const ball = this.balls[i];
                ball.updatePhysics(subDt, STATE.currentGravity, STATE.currentFriction);
                ball.constrain();
            }

            // 2. Prepare Spatial Partitioning
            this.grid.clear();
            for (let i = 0; i < this.balls.length; i++) {
                this.grid.insert(this.balls[i]);
            }

            // 3. Resolve Ball-to-Ball Collisions
            for (let i = 0; i < this.balls.length; i++) {
                const b1 = this.balls[i];
                const nearby = this.grid.getNearby(b1);

                for (let j = 0; j < nearby.length; j++) {
                    const b2 = nearby[j];
                    if (b1 === b2) continue;
                    this.resolveCollision(b1, b2);
                }

                // 4. Resolve Ball-to-Obstacle Collisions
                for (let k = 0; k < this.obstacles.length; k++) {
                    this.resolveBallObstacle(b1, this.obstacles[k]);
                }
            }
        }

        // Particle system update happens here or in main
        Particles.update();
    }

    /**
     * Standard Elastic Collision resolution for two dynamic spheres.
     */
    resolveCollision(b1, b2) {
        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const distSq = dx * dx + dy * dy;
        const minDist = b1.radius + b2.radius;

        if (distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq) || 0.0001;
            const overlap = (minDist - dist) * 0.5;

            // Calculated Unit Normal
            const nx = dx / dist;
            const ny = dy / dist;

            // Mass Ratios
            const totalMass = b1.mass + b2.mass;
            const ratio1 = b2.mass / totalMass;
            const ratio2 = b1.mass / totalMass;

            // Update Positions (Separation)
            if (!b1.isGrabbed) {
                b1.x -= nx * overlap * ratio1;
                b1.y -= ny * overlap * ratio1;
            }
            if (!b2.isGrabbed) {
                b2.x += nx * overlap * ratio2;
                b2.y += ny * overlap * ratio2;
            }

            STATE.stats.collisions++;

            // Velocity Reflection & Effects
            const v1x = b1.x - b1.oldX;
            const v1y = b1.y - b1.oldY;
            const v2x = b2.x - b2.oldX;
            const v2y = b2.y - b2.oldY;

            // Relative Velocity along normal
            const relVx = v1x - v2x;
            const relVy = v1y - v2y;
            const dotProduct = relVx * nx + relVy * ny;

            // Only reflect if moving towards each other
            if (dotProduct > 0) {
                const impulse = (2 * dotProduct) / (b1.invMass + b2.invMass);
                const damp = CONFIG.COLLISION_BOUNCE;

                if (!b1.isGrabbed) {
                    b1.oldX += nx * impulse * b1.invMass * damp;
                    b1.oldY += ny * impulse * b1.invMass * damp;
                }
                if (!b2.isGrabbed) {
                    b2.oldX -= nx * impulse * b2.invMass * damp;
                    b2.oldY -= ny * impulse * b2.invMass * damp;
                }
            }

            // Visual and Audio feedback for hard hits
            const speed = Math.sqrt(relVx * relVx + relVy * relVy);
            if (speed > 2 && Math.random() > 0.85) {
                const midX = b1.x + nx * b1.radius;
                const midY = b1.y + ny * b1.radius;
                Particles.emit(midX, midY, b1.color, Math.floor(speed * 2));
                AudioEngine.playCollision(speed);
            }
        }
    }

    /**
     * Resolves collision between a dynamic ball and a static obstacle.
     */
    resolveBallObstacle(ball, obs) {
        const dx = obs.x - ball.x;
        const dy = obs.y - ball.y;
        const distSq = dx * dx + dy * dy;
        const minDist = ball.radius + obs.radius;

        if (distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq);
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;

            if (!ball.isGrabbed) {
                ball.x -= nx * overlap;
                ball.y -= ny * overlap;

                // Static bounce logic
                const vx = ball.x - ball.oldX;
                const vy = ball.y - ball.oldY;
                const dot = vx * nx + vy * ny;

                if (dot > 0) {
                    ball.oldX += nx * dot * 1.8;
                    ball.oldY += ny * dot * 1.8;
                }
            }
            STATE.stats.collisions++;
        }
    }
}

const Physics = new PhysicsEngine();

/**
 * ARCHITECTURAL NOTES:
 * The Spatial Grid used here (Grid-based spatial partitioning) is key to 
 * performance. Without it, 500 balls would require (500*500)/2 = 125,000 
 * collision checks per SUB-STEP. With 8 sub-steps, that is 1 million checks 
 * per frame. Spatial partitioning reduces this to roughly linear time 
 * by checking only local neighborhoods.
 */
