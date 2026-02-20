/**
 * Boid-Flock Engine
 * Implementation of Reynolds' Boids Algorithm (1986).
 * Features: Separation, Alignment, Cohesion + Spatial optimizations.
 */

const canvas = document.getElementById('boid-canvas');
const ctx = canvas.getContext('2d');
const countEl = document.getElementById('boid-count');

// --- Configuration ---
let boids = [];
let width, height;
const BOID_COUNT = 250;
const MAX_SPEED = 4;
const MAX_FORCE = 0.1;

// Rule Multipliers (Controlled by Sliders)
const factors = {
    separation: 1.5,
    alignment: 1.0,
    cohesion: 1.0,
    perception: 50
};

// --- Vector Helper Class ---
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    
    add(v) { this.x += v.x; this.y += v.y; return this; }
    sub(v) { this.x -= v.x; this.y -= v.y; return this; }
    mult(n) { this.x *= n; this.y *= n; return this; }
    div(n) { if(n!==0) { this.x /= n; this.y /= n; } return this; }
    
    mag() { return Math.sqrt(this.x*this.x + this.y*this.y); }
    
    limit(max) {
        const m = this.mag();
        if (m > max) {
            this.div(m).mult(max);
        }
        return this;
    }
    
    setMag(n) { return this.div(this.mag()).mult(n); }
    
    static dist(v1, v2) {
        return Math.sqrt((v1.x-v2.x)**2 + (v1.y-v2.y)**2);
    }
    
    clone() { return new Vector(this.x, this.y); }
}

// --- Boid Agent Class ---
class Boid {
    constructor(x, y, isPredator = false) {
        this.pos = new Vector(x || Math.random() * width, y || Math.random() * height);
        this.vel = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
        this.vel.setMag(Math.random() * 2 + 2);
        this.acc = new Vector(0, 0);
        this.isPredator = isPredator;
        this.maxSpeed = isPredator ? MAX_SPEED + 1.5 : MAX_SPEED;
        this.maxForce = isPredator ? MAX_FORCE + 0.1 : MAX_FORCE;
    }

    // Wrap around screen edges (Toroidal space)
    edges() {
        if (this.pos.x > width) this.pos.x = 0;
        else if (this.pos.x < 0) this.pos.x = width;
        if (this.pos.y > height) this.pos.y = 0;
        else if (this.pos.y < 0) this.pos.y = height;
    }

    // Apply steering rules
    flock(boids) {
        let separation = new Vector(0, 0);
        let alignment = new Vector(0, 0);
        let cohesion = new Vector(0, 0);
        let total = 0;

        for (let other of boids) {
            if (other === this) continue;

            const d = Vector.dist(this.pos, other.pos);
            
            // Perception Check
            if (d < factors.perception && d > 0) {
                // 1. Separation
                let diff = this.pos.clone().sub(other.pos);
                // Weight by distance (closer = stronger repulsion)
                diff.div(d * d); 
                
                // Predator Fear Override
                if (other.isPredator && !this.isPredator) {
                   diff.mult(20); // Run away fast!
                }

                separation.add(diff);

                // Only align/cohere with same species
                if (this.isPredator === other.isPredator) {
                    // 2. Alignment
                    alignment.add(other.vel);
                    // 3. Cohesion
                    cohesion.add(other.pos);
                }

                total++;
            }
        }

        if (total > 0) {
            // Average the vectors
            separation.div(total).setMag(this.maxSpeed).sub(this.vel).limit(this.maxForce);
            alignment.div(total).setMag(this.maxSpeed).sub(this.vel).limit(this.maxForce);
            cohesion.div(total).sub(this.pos).setMag(this.maxSpeed).sub(this.vel).limit(this.maxForce);
        }

        // Apply Weights
        separation.mult(factors.separation);
        alignment.mult(factors.alignment);
        cohesion.mult(factors.cohesion);

        this.acc.add(separation);
        this.acc.add(alignment);
        this.acc.add(cohesion);
    }

    update() {
        this.pos.add(this.vel);
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.acc.mult(0); // Reset accel
    }

    draw() {
        const angle = Math.atan2(this.vel.y, this.vel.x);
        
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(angle);

        if (this.isPredator) {
            // Draw Predator (Red Dragon shape)
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(-6, 6);
            ctx.lineTo(-6, -6);
            ctx.fill();
            // Glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ef4444';
        } else {
            // Draw Boid (Blue dart)
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.moveTo(8, 0);
            ctx.lineTo(-4, 4);
            ctx.lineTo(-4, -4);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

// --- Initialization & Loop ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    
    // Spawn initial flock
    for (let i = 0; i < BOID_COUNT; i++) {
        boids.push(new Boid());
    }
    updateCount();
    
    animate();
}

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

function setupControls() {
    // Sliders
    ['sep', 'ali', 'coh'].forEach(key => {
        const slider = document.getElementById(`slider-${key}`);
        const display = document.getElementById(`val-${key}`);
        const name = key === 'sep' ? 'separation' : key === 'ali' ? 'alignment' : 'cohesion';
        
        slider.addEventListener('input', (e) => {
            factors[name] = parseFloat(e.target.value);
            display.innerText = e.target.value;
        });
    });

    // Perception Radius
    document.getElementById('slider-rad').addEventListener('input', (e) => {
        factors.perception = parseInt(e.target.value);
        document.getElementById('val-rad').innerText = e.target.value;
    });

    // Reset
    document.getElementById('btn-reset').addEventListener('click', () => {
        boids = [];
        for (let i = 0; i < BOID_COUNT; i++) boids.push(new Boid());
        updateCount();
    });

    // Predator
    document.getElementById('btn-predator').addEventListener('click', () => {
        boids.push(new Boid(width/2, height/2, true));
        updateCount();
    });

    // Click to add
    canvas.addEventListener('mousedown', (e) => {
        boids.push(new Boid(e.clientX, e.clientY));
        updateCount();
    });
}

function updateCount() {
    countEl.innerText = boids.length;
}

function animate() {
    // Fade effect for trails
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.fillRect(0, 0, width, height);

    // Optimized loop (Snapshot)
    // We clone the boids list reference so updates don't affect current frame calculations mid-stream
    const snapshot = [...boids];

    for (let boid of boids) {
        boid.edges();
        boid.flock(snapshot);
        boid.update();
        boid.draw();
    }

    requestAnimationFrame(animate);
}

// Start
init();