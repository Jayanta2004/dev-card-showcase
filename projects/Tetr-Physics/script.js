/**
 * Tetr-Physics Engine
 * A custom vanilla JS Rigid Body physics engine implementing SAT collision detection.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const GRAVITY = 0.25;
const FRICTION = 0.98; // Air resistance
const GROUND_FRICTION = 0.7;
const RESTITUTION = 0.2; // Bounciness (Low for stacking)
const ROTATION_SPEED = 0.08;
const MOVE_SPEED = 5;

// --- State ---
let width, height;
let bodies = [];
let activeBlock = null;
let cameraY = 0;
let score = 0;
let isGameOver = false;
let gameLoopId;

// Shapes (Tetrominos)
const SHAPES = [
    { color: '#FF0D72', w: 40, h: 40 }, // I-ish (Square for stability test)
    { color: '#0DC2FF', w: 80, h: 20 }, // I
    { color: '#0DFF72', w: 60, h: 40 }, // S
    { color: '#F538FF', w: 40, h: 60 }, // L
    { color: '#FF8E0D', w: 50, h: 50 }, // O
];

// --- Vector Math Helpers ---
class Vec2 {
    constructor(x, y) { this.x = x; this.y = y; }
    add(v) { return new Vec2(this.x + v.x, this.y + v.y); }
    sub(v) { return new Vec2(this.x - v.x, this.y - v.y); }
    dot(v) { return this.x * v.x + this.y * v.y; }
    mult(s) { return new Vec2(this.x * s, this.y * s); }
    mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    normalize() { const m = this.mag(); return m === 0 ? new Vec2(0,0) : this.mult(1/m); }
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vec2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    }
}

// --- Rigid Body Class ---
class Body {
    constructor(x, y, w, h, color, isStatic = false) {
        this.pos = new Vec2(x, y);
        this.vel = new Vec2(0, 0);
        this.w = w;
        this.h = h;
        this.angle = 0;
        this.angVel = 0;
        this.color = color;
        this.isStatic = isStatic;
        this.mass = isStatic ? Infinity : (w * h) * 0.001;
        this.invMass = isStatic ? 0 : 1 / this.mass;
        this.restitution = RESTITUTION;
        this.isActive = false; // Is player controlling it?
    }

    // Get 4 corners based on angle
    getVertices() {
        const halfW = this.w / 2;
        const halfH = this.h / 2;
        // Relative corners
        const corners = [
            new Vec2(-halfW, -halfH),
            new Vec2(halfW, -halfH),
            new Vec2(halfW, halfH),
            new Vec2(-halfW, halfH)
        ];
        // Rotate and translate
        return corners.map(v => v.rotate(this.angle).add(this.pos));
    }

    update() {
        if (this.isStatic) return;

        // Gravity
        if (!this.isActive) {
            this.vel.y += GRAVITY;
        }

        // Apply Velocity
        this.pos = this.pos.add(this.vel);
        this.angle += this.angVel;

        // Damping
        this.vel = this.vel.mult(FRICTION);
        this.angVel *= 0.95; // Angular friction

        // Floor / Walls collision (Simple boundary check)
        // Note: Full physics uses SAT for block-block, but we need world bounds
        // Simple floor check for game over logic
        if (this.pos.y > height + 100) {
            // Check Game Over logic externally
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y - cameraY);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        
        // Inner detail
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.w / 2, -this.h / 2, this.w, this.h);
        
        ctx.restore();
    }
}

// --- Collision Detection (Separating Axis Theorem) ---

function checkCollision(b1, b2) {
    const v1 = b1.getVertices();
    const v2 = b2.getVertices();
    const vertices = [v1, v2];

    let minOverlap = Infinity;
    let smallestAxis = null;

    // Test axes of both bodies
    // Axis = normal of the edge
    const bodiesList = [v1, v2];
    
    for (let i = 0; i < 2; i++) {
        const verts = bodiesList[i];
        for (let j = 0; j < verts.length; j++) {
            const p1 = verts[j];
            const p2 = verts[(j + 1) % verts.length];
            
            // Edge vector
            const edge = p2.sub(p1);
            // Normal (Axis)
            const axis = new Vec2(-edge.y, edge.x).normalize();

            // Project both bodies onto axis
            const proj1 = project(v1, axis);
            const proj2 = project(v2, axis);

            // Check overlap
            if (!overlap(proj1, proj2)) {
                return null; // Separating axis found, no collision
            } else {
                // Get overlap magnitude
                const o = Math.min(proj1.max, proj2.max) - Math.max(proj1.min, proj2.min);
                if (o < minOverlap) {
                    minOverlap = o;
                    smallestAxis = axis;
                }
            }
        }
    }

    // Ensure correction pushes b1 away from b2
    const centerDir = b1.pos.sub(b2.pos);
    if (centerDir.dot(smallestAxis) < 0) {
        smallestAxis = smallestAxis.mult(-1);
    }

    return {
        normal: smallestAxis,
        depth: minOverlap
    };
}

function project(vertices, axis) {
    let min = Infinity;
    let max = -Infinity;
    for (let v of vertices) {
        const proj = v.dot(axis);
        if (proj < min) min = proj;
        if (proj > max) max = proj;
    }
    return { min, max };
}

function overlap(p1, p2) {
    return !(p1.max < p2.min || p2.max < p1.min);
}

function resolveCollision(b1, b2, manifold) {
    // Relative velocity
    const rv = b1.vel.sub(b2.vel);
    
    // Velocity along normal
    const velAlongNormal = rv.dot(manifold.normal);

    // If moving away, don't resolve
    if (velAlongNormal > 0) return;

    // Restitution (Bounce)
    const e = Math.min(b1.restitution, b2.restitution);

    // Impulse scalar
    let j = -(1 + e) * velAlongNormal;
    j /= (b1.invMass + b2.invMass);

    // Impulse vector
    const impulse = manifold.normal.mult(j);

    // Apply Velocity Change
    if (!b1.isStatic && !b1.isActive) b1.vel = b1.vel.add(impulse.mult(b1.invMass));
    if (!b2.isStatic && !b2.isActive) b2.vel = b2.vel.sub(impulse.mult(b2.invMass));

    // Positional Correction (prevent sinking)
    const percent = 0.6; // Penetration percentage to correct
    const slop = 0.05; // Threshold
    const correctionMag = Math.max(manifold.depth - slop, 0) / (b1.invMass + b2.invMass) * percent;
    const correction = manifold.normal.mult(correctionMag);

    if (!b1.isStatic && !b1.isActive) b1.pos = b1.pos.add(correction.mult(b1.invMass));
    if (!b2.isStatic && !b2.isActive) b2.pos = b2.pos.sub(correction.mult(b2.invMass));
    
    // Simple Friction
    const tangent = rv.sub(manifold.normal.mult(velAlongNormal)).normalize();
    const jt = -rv.dot(tangent) / (b1.invMass + b2.invMass);
    const mu = 0.3; // Friction coeff
    const frictionImpulse = tangent.mult(jt * mu);
    
    if (!b1.isStatic && !b1.isActive) b1.vel = b1.vel.add(frictionImpulse.mult(b1.invMass));
    if (!b2.isStatic && !b2.isActive) b2.vel = b2.vel.sub(frictionImpulse.mult(b2.invMass));
}

// --- Game Logic ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    document.getElementById('btn-start').addEventListener('click', startGame);
    document.getElementById('btn-restart').addEventListener('click', startGame);
    
    window.addEventListener('keydown', handleInput);
    
    // Initial floor
    resetGame();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    if (!isGameOver) resetGame();
}

function resetGame() {
    bodies = [];
    isGameOver = false;
    cameraY = 0;
    score = 0;
    
    // Create Floor
    const floor = new Body(width/2, height + 40, width + 200, 100, '#333', true);
    bodies.push(floor);
}

function startGame() {
    resetGame();
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    
    spawnBlock();
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    loop();
}

function spawnBlock() {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    activeBlock = new Body(width/2, 100 - cameraY, shape.w, shape.h, shape.color);
    activeBlock.isActive = true;
    bodies.push(activeBlock);
}

function handleInput(e) {
    if (!activeBlock || isGameOver) return;
    
    if (e.code === 'ArrowLeft') activeBlock.pos.x -= 10;
    if (e.code === 'ArrowRight') activeBlock.pos.x += 10;
    if (e.code === 'KeyQ') activeBlock.angle -= ROTATION_SPEED * 4;
    if (e.code === 'KeyE') activeBlock.angle += ROTATION_SPEED * 4;
    if (e.code === 'Space') {
        activeBlock.isActive = false;
        activeBlock.vel.y = 5; // Initial push
        activeBlock = null;
        setTimeout(spawnBlock, 1000); // Cooldown
    }
}

function updateCamera() {
    // Find highest block
    let highestY = height;
    bodies.forEach(b => {
        if (!b.isStatic && b.pos.y < highestY) highestY = b.pos.y;
    });

    const targetY = Math.min(0, highestY - height / 2);
    // Smooth Lerp
    cameraY += (targetY - cameraY) * 0.05;
    
    // Update Score (Inverted Y)
    const currentHeight = Math.floor((height - highestY) / 10);
    if (currentHeight > score) score = currentHeight;
    document.getElementById('score-val').innerText = score + 'm';
}

function checkGameOver() {
    // If a block falls way below screen
    let fallen = bodies.find(b => b.pos.y > height + 200 + cameraY && !b.isStatic);
    if (fallen) {
        isGameOver = true;
        document.getElementById('game-over-screen').classList.remove('hidden');
        document.getElementById('final-score').innerText = score + 'm';
    }
}

function loop() {
    if (isGameOver) return;

    ctx.clearRect(0, 0, width, height);

    // Physics Step (Sub-stepping for stability)
    for (let step = 0; step < 4; step++) {
        bodies.forEach(b => b.update());

        // Collisions
        for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
                const b1 = bodies[i];
                const b2 = bodies[j];
                // Don't collide two static objects (if we had multiple)
                if (b1.isStatic && b2.isStatic) continue;

                // Optimization: AABB Check first
                if (Math.abs(b1.pos.x - b2.pos.x) > (b1.w + b2.w) || 
                    Math.abs(b1.pos.y - b2.pos.y) > (b1.h + b2.h)) continue;

                const manifold = checkCollision(b1, b2);
                if (manifold) {
                    resolveCollision(b1, b2, manifold);
                }
            }
        }
    }

    // Render
    bodies.forEach(b => b.draw(ctx));

    updateCamera();
    checkGameOver();

    gameLoopId = requestAnimationFrame(loop);
}

// Init
init();