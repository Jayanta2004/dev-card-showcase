/**
 * @file physics.js
 * @description The core engine of CollisionSynth. Handles the simulation loop,
 * collision resolution, and temporal mapping.
 */

class PhysicsWorld {
    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        this.balls = [];
        this.walls = [];

        this.params = {
            gravity: 0.5,
            friction: 0.99,
            speed: 1.0,
            paused: false
        };

        this.lastTime = 0;
        this.accumulatedTime = 0;
        this.fixedDeltaTime = 1 / 60; // 60fps fixed step

        // Interaction state
        this.hoveredWall = null;
        this.draggingWall = null;
        this.dragEndpoint = null; // 'p1' or 'p2'

        // Events
        this.onCollision = null; // Callback for audio trigger
    }

    addBall(x, y, radius) {
        const ball = new Ball(x, y, radius);
        this.balls.push(ball);
        return ball;
    }

    addWall(x1, y1, x2, y2) {
        const wall = new Wall(x1, y1, x2, y2);
        this.walls.push(wall);
        return wall;
    }

    clear() {
        this.balls = [];
        this.walls = [];
    }

    update(timestamp) {
        if (this.params.paused) return;

        if (!this.lastTime) this.lastTime = timestamp;
        let elapsed = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // Apply speed multiplier
        elapsed *= this.params.speed;

        // Cap elapsed to prevent huge jumps
        if (elapsed > 0.1) elapsed = 0.1;

        this.accumulatedTime += elapsed;

        while (this.accumulatedTime >= this.fixedDeltaTime) {
            this.fixedUpdate(this.fixedDeltaTime);
            this.accumulatedTime -= this.fixedDeltaTime;
        }

        this.render();
    }

    fixedUpdate(dt) {
        // Update Balls
        for (let i = 0; i < this.balls.length; i++) {
            const ball = this.balls[i];
            ball.update(dt, this.params.gravity, this.params.friction);
            this.checkCollisions(ball);

            // Ball-to-Ball collisions
            for (let j = i + 1; j < this.balls.length; j++) {
                this.checkBallCollision(ball, this.balls[j]);
            }
        }

        // Update Walls (visual hit states)
        for (const wall of this.walls) {
            wall.update();
        }
    }

    /**
     * Handles collision detection and resolution between two dynamic balls.
     * Uses elastic collision formula for velocity exchange.
     * @param {Ball} b1 
     * @param {Ball} b2 
     */
    checkBallCollision(b1, b2) {
        const dist = b1.pos.dist(b2.pos);
        const minDist = b1.radius + b2.radius;

        if (dist < minDist) {
            // Collision Detected
            const normal = Utils.Vec2.sub(b1.pos, b2.pos).normalize();

            // 1. Resolve Overlap
            const overlap = minDist - dist;
            const separation = Utils.Vec2.mul(normal, overlap / 2);
            b1.pos.add(separation);
            b2.pos.sub(separation);

            // 2. Resolve Velocity (Simplified elastic collision)
            const relativeVelocity = Utils.Vec2.sub(b1.vel, b2.vel);
            const velocityAlongNormal = relativeVelocity.dot(normal);

            // Do not resolve if velocities are already separating
            if (velocityAlongNormal > 0) return;

            // Restitution (elasticity)
            const e = Math.min(b1.elasticity, b2.elasticity);

            // Impulse scalar
            let j = -(1 + e) * velocityAlongNormal;
            j /= (1 / b1.mass + 1 / b2.mass);

            // Apply impulse
            const impulse = Utils.Vec2.mul(normal, j);
            b1.vel.add(Utils.Vec2.div(impulse, b1.mass));
            b2.vel.sub(Utils.Vec2.div(impulse, b2.mass));

            // Trigger audio on ball-ball hits too? 
            // We'll limit this to prevent sonic chaos
            if (this.onCollision && velocityAlongNormal < -2) {
                this.onCollision(b1, null, normal);
            }
        }
    }

    checkCollisions(ball) {
        // Wall collisions
        for (const wall of this.walls) {
            const closest = Utils.closestPointOnLine(ball.pos, wall.p1, wall.p2);
            const dist = ball.pos.dist(closest);

            if (dist < ball.radius) {
                // Collision detected!

                // 1. Calculate Normal
                const normal = Utils.Vec2.sub(ball.pos, closest).normalize();

                // If the normal is zero (exact center hit, very rare), use a default
                if (normal.magSq() === 0) normal.set(0, -1);

                // 2. Resolve Overlap (anti-tunneling)
                const overlap = ball.radius - dist;
                ball.pos.add(Utils.Vec2.mul(normal, overlap));

                // 3. Reflect Velocity
                // v' = v - 2 * (v dot n) * n * elasticity
                const dot = ball.vel.dot(normal);
                if (dot < 0) { // Only reflect if moving towards wall
                    const reflection = Utils.Vec2.mul(normal, 2 * dot * ball.elasticity);
                    ball.vel.sub(reflection);

                    // Add some tangential friction to velocity
                    ball.vel.mul(0.98);

                    // 4. Trigger Events
                    wall.triggerHit();
                    if (this.onCollision) {
                        this.onCollision(ball, wall, normal);
                    }
                }
            }
        }

        // Screen boundaries (fallback)
        if (ball.pos.x - ball.radius < 0) {
            ball.pos.x = ball.radius;
            ball.vel.x *= -ball.elasticity;
        } else if (ball.pos.x + ball.radius > this.width) {
            ball.pos.x = this.width - ball.radius;
            ball.vel.x *= -ball.elasticity;
        }

        if (ball.pos.y - ball.radius < 0) {
            ball.pos.y = ball.radius;
            ball.vel.y *= -ball.elasticity;
        } else if (ball.pos.y + ball.radius > this.height) {
            ball.pos.y = this.height - ball.radius;
            ball.vel.y *= -ball.elasticity;
        }
    }

    handleInteraction(mousePos, isDown, isRightClick) {
        if (isDown) {
            if (!this.draggingWall) {
                // Try to grab a wall endpoint or create/delete?
                for (const wall of this.walls) {
                    if (mousePos.dist(wall.p1) < 15) {
                        this.draggingWall = wall;
                        this.dragEndpoint = 'p1';
                        break;
                    } else if (mousePos.dist(wall.p2) < 15) {
                        this.draggingWall = wall;
                        this.dragEndpoint = 'p2';
                        break;
                    }
                }
            } else {
                // Perform dragging
                this.draggingWall[this.dragEndpoint].set(mousePos.x, mousePos.y);
            }
        } else {
            this.draggingWall = null;
            this.dragEndpoint = null;

            // Handle hovering
            this.hoveredWall = null;
            for (const wall of this.walls) {
                wall.isHovered = false;
                if (mousePos.dist(wall.p1) < 15 || mousePos.dist(wall.p2) < 15) {
                    wall.isHovered = true;
                    this.hoveredWall = wall;
                }
            }
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw decorative grid
        this.drawUIOverlay();

        // Draw Walls
        for (const wall of this.walls) {
            wall.draw(this.ctx);
        }

        // Draw Balls
        for (const ball of this.balls) {
            ball.draw(this.ctx);
        }
    }

    drawUIOverlay() {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.lineWidth = 1;
        const spacing = 50;

        for (let x = 0; x < this.width; x += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.height; y += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
    }
}
