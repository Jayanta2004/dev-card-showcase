// ==========================================
// 1. RAW VECTOR MATHEMATICS LIBRARY
// ==========================================
class Vector2 {
    constructor(x, y) { this.x = x; this.y = y; }
    add(v) { return new Vector2(this.x + v.x, this.y + v.y); }
    sub(v) { return new Vector2(this.x - v.x, this.y - v.y); }
    mult(n) { return new Vector2(this.x * n, this.y * n); }
    mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    normalize() {
        let m = this.mag();
        return m === 0 ? new Vector2(0, 0) : new Vector2(this.x / m, this.y / m);
    }
    dot(v) { return this.x * v.x + this.y * v.y; }
    copy() { return new Vector2(this.x, this.y); }
}

// ==========================================
// 2. PHYSICS ENTITIES
// ==========================================
class Ball {
    constructor(x, y) {
        this.pos = new Vector2(x, y);
        this.startPos = new Vector2(x, y);
        this.vel = new Vector2(0, 0);
        this.radius = 8;
        this.friction = 0.98; // Base grass friction
        this.isMoving = false;
    }

    update() {
        if (this.vel.mag() < 0.1) {
            this.vel = new Vector2(0, 0);
            this.isMoving = false;
        } else {
            this.isMoving = true;
            this.vel = this.vel.mult(this.friction);
            this.pos = this.pos.add(this.vel);
        }
    }

    draw(ctx) {
        // Shadow
        ctx.beginPath(); ctx.arc(this.pos.x + 2, this.pos.y + 2, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
        // Ball
        ctx.beginPath(); ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff'; ctx.fill();
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1; ctx.stroke();
    }
}

class Wall {
    constructor(x1, y1, x2, y2) {
        this.p1 = new Vector2(x1, y1);
        this.p2 = new Vector2(x2, y2);
        
        // Calculate the surface normal vector for bounce reflections
        let line = this.p2.sub(this.p1);
        this.normal = new Vector2(-line.y, line.x).normalize();
    }

    draw(ctx) {
        ctx.beginPath(); ctx.moveTo(this.p1.x, this.p1.y); ctx.lineTo(this.p2.x, this.p2.y);
        ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.stroke();
        
        // Inner highlight for depth
        ctx.beginPath(); ctx.moveTo(this.p1.x, this.p1.y); ctx.lineTo(this.p2.x, this.p2.y);
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 4; ctx.stroke();
    }
}

class Hole {
    constructor(x, y, par) {
        this.pos = new Vector2(x, y);
        this.radius = 12;
        this.par = par;
    }
    draw(ctx) {
        ctx.beginPath(); ctx.arc(this.pos.x, this.pos.y, this.radius + 2, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e'; ctx.fill(); // Lip
        ctx.beginPath(); ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a'; ctx.fill(); // Dark hole
    }
}

// ==========================================
// 3. COLLISION ENGINE & GAME CONTROLLER
// ==========================================
class MiniGolfEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        this.ball = new Ball(0, 0);
        this.walls = [];
        this.hole = null;
        
        this.strokes = 0;
        this.currentLevel = 1;
        this.state = 'AIMING'; // AIMING, MOVING, WON
        
        // Drag controls
        this.isDragging = false;
        this.dragStart = new Vector2(0, 0);
        this.dragCurrent = new Vector2(0, 0);

        this.setupEvents();
        this.loadLevel(this.currentLevel);
        this.loop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEvents() {
        window.addEventListener('resize', () => this.resize());
        
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.state !== 'AIMING' || this.ball.isMoving) return;
            this.isDragging = true;
            this.dragStart = new Vector2(e.clientX, e.clientY);
            this.dragCurrent = new Vector2(e.clientX, e.clientY);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) this.dragCurrent = new Vector2(e.clientX, e.clientY);
        });

        this.canvas.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.shoot();
            }
        });
    }

    shoot() {
        let dragVector = this.dragStart.sub(this.dragCurrent);
        if (dragVector.mag() > 5) {
            // Cap maximum power
            if (dragVector.mag() > 200) dragVector = dragVector.normalize().mult(200);
            
            this.ball.vel = dragVector.mult(0.12); // Power multiplier
            this.strokes++;
            document.getElementById('stroke-display').innerText = this.strokes;
            this.state = 'MOVING';
        }
    }

    // Mathematical Line-Segment to Circle Collision
    closestPointOnLine(p1, p2, ballPos) {
        let line = p2.sub(p1);
        let lenSq = line.dot(line);
        if (lenSq === 0) return p1;

        let t = Math.max(0, Math.min(1, ballPos.sub(p1).dot(line) / lenSq));
        return p1.add(line.mult(t));
    }

    handleCollisions() {
        // Screen bounds (Out of bounds)
        if (this.ball.pos.x < 0 || this.ball.pos.x > this.canvas.width || 
            this.ball.pos.y < 0 || this.ball.pos.y > this.canvas.height) {
            this.resetHole(); return;
        }

        // Check Wall Collisions
        for (let wall of this.walls) {
            let closestPoint = this.closestPointOnLine(wall.p1, wall.p2, this.ball.pos);
            let distVec = this.ball.pos.sub(closestPoint);
            let distSq = distVec.dot(distVec);

            if (distSq < (this.ball.radius + 5) * (this.ball.radius + 5)) {
                let dist = Math.sqrt(distSq);
                let overlap = (this.ball.radius + 5) - dist;
                let collisionNormal = dist === 0 ? wall.normal : distVec.normalize();

                // Move ball out of wall
                this.ball.pos = this.ball.pos.add(collisionNormal.mult(overlap));

                // Vector Reflection Formula: v_new = v - 2(v * n)n
                let dotProduct = this.ball.vel.dot(collisionNormal);
                let bounce = collisionNormal.mult(2 * dotProduct);
                this.ball.vel = this.ball.vel.sub(bounce).mult(0.8); // 0.8 is restitution (bounciness)
            }
        }

        // Check Hole Gravity & Win Condition
        let distToHole = this.ball.pos.sub(this.hole.pos).mag();
        if (distToHole < this.hole.radius) {
            // If moving too fast, it lips out!
            if (this.ball.vel.mag() < 5) {
                this.ball.vel = new Vector2(0,0);
                this.ball.pos = this.hole.pos.copy(); // Snap to center
                this.winHole();
            } else {
                // Deflect slightly if hit too hard
                this.ball.vel = this.ball.vel.mult(0.9); 
            }
        }
    }

    winHole() {
        if (this.state === 'WON') return;
        this.state = 'WON';
        
        let msg = "Good job!";
        let diff = this.strokes - this.hole.par;
        if (this.strokes === 1) msg = "HOLE IN ONE!!!";
        else if (diff <= -2) msg = "Eagle!";
        else if (diff === -1) msg = "Birdie!";
        else if (diff === 0) msg = "Par.";
        else if (diff === 1) msg = "Bogey.";

        document.getElementById('win-strokes').innerText = this.strokes;
        document.getElementById('win-message').innerText = msg;
        setTimeout(() => document.getElementById('win-modal').classList.remove('hidden'), 500);
    }
// --- 5 EASY LEVEL DESIGNS ---
    loadLevel(levelNum) {
        this.walls = [];
        this.strokes = 0;
        this.state = 'AIMING';
        document.getElementById('stroke-display').innerText = this.strokes;
        document.getElementById('level-display').innerText = `Hole ${levelNum}`;
        document.getElementById('win-modal').classList.add('hidden');
        
        let cx = this.canvas.width / 2;
        let cy = this.canvas.height / 2;

        if (levelNum === 1) {
            // Hole 1: The Classic Straightaway
            this.ball = new Ball(cx, cy + 200);
            this.hole = new Hole(cx, cy - 200, 2);
            this.buildBox(cx - 150, cy - 300, 300, 600); // Wide open box
        } 
        else if (levelNum === 2) {
            // Hole 2: The Easy Bank (Fixed!)
            this.ball = new Ball(cx, cy + 200);
            this.hole = new Hole(cx, cy - 200, 3);
            this.buildBox(cx - 250, cy - 300, 500, 600); // Very wide box
            
            // Just one center obstacle blocking the direct shot. Bounce around it!
            this.walls.push(new Wall(cx - 120, cy, cx + 120, cy)); 
        } 
        else if (levelNum === 3) {
            // Hole 3: The Wide Gap
            this.ball = new Ball(cx, cy + 250);
            this.hole = new Hole(cx, cy - 250, 3);
            this.buildBox(cx - 200, cy - 350, 400, 700);
            
            // Two walls on the sides, leaving a massive gap in the middle
            this.walls.push(new Wall(cx - 200, cy, cx - 80, cy));
            this.walls.push(new Wall(cx + 80, cy, cx + 200, cy));
        } 
        else if (levelNum === 4) {
            // Hole 4: The Funnel
            this.ball = new Ball(cx, cy + 250);
            this.hole = new Hole(cx, cy - 250, 2);
            this.buildBox(cx - 200, cy - 350, 400, 700);
            
            // Angled walls at the top that catch the ball and funnel it in
            this.walls.push(new Wall(cx - 200, cy - 100, cx - 80, cy - 250));
            this.walls.push(new Wall(cx + 200, cy - 100, cx + 80, cy - 250));
        } 
        else if (levelNum === 5) {
            // Hole 5: The Backboard
            this.ball = new Ball(cx + 100, cy + 250);
            this.hole = new Hole(cx - 100, cy - 200, 2);
            this.buildBox(cx - 250, cy - 350, 500, 700);
            
            // Big diagonal wall across the top right. Smash it here to bounce left!
            this.walls.push(new Wall(cx + 250, cy - 100, cx, cy - 350));
        }
        else {
            alert("Course Complete! Returning to Clubhouse.");
            this.loadLevel(1); return;
        }

        document.getElementById('par-display').innerText = `Par: ${this.hole.par}`;
    }

    buildBox(x, y, w, h) {
        this.walls.push(new Wall(x, y, x + w, y)); // Top
        this.walls.push(new Wall(x + w, y, x + w, y + h)); // Right
        this.walls.push(new Wall(x + w, y + h, x, y + h)); // Bottom
        this.walls.push(new Wall(x, y + h, x, y)); // Left
    }

    resetHole() {
        this.strokes = 0;
        this.loadLevel(this.currentLevel);
    }
    
    nextHole() {
        this.currentLevel++;
        this.loadLevel(this.currentLevel);
    }
    
    toggleGuide() { document.getElementById('guide-modal').classList.toggle('hidden'); }

    // --- RENDER LOOP ---
    loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Physics Updates
        if (this.state !== 'WON') {
            this.ball.update();
            this.handleCollisions();
            if (!this.ball.isMoving && this.state === 'MOVING') this.state = 'AIMING';
        }

        // Draw Environment
        this.hole.draw(this.ctx);
        this.walls.forEach(w => w.draw(this.ctx));
        this.ball.draw(this.ctx);

        // Draw Aiming Line
        if (this.isDragging && this.state === 'AIMING') {
            let dragVector = this.dragStart.sub(this.dragCurrent);
            if (dragVector.mag() > 200) dragVector = dragVector.normalize().mult(200);

            let aimEnd = this.ball.pos.add(dragVector);

            this.ctx.beginPath();
            this.ctx.moveTo(this.ball.pos.x, this.ball.pos.y);
            this.ctx.lineTo(aimEnd.x, aimEnd.y);
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(dragVector.mag() / 200, 1)})`;
            this.ctx.lineWidth = 4;
            this.ctx.setLineDash([10, 10]);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // Draw Target Reticle
            this.ctx.beginPath();
            this.ctx.arc(aimEnd.x, aimEnd.y, 5, 0, Math.PI * 2);
            this.ctx.fillStyle = '#fbbf24';
            this.ctx.fill();
        }

        requestAnimationFrame(() => this.loop());
    }
}

const game = new MiniGolfEngine();