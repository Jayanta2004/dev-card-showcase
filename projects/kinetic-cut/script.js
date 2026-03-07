// ==========================================
// 1. ENGINE SETUP & MATH UTILS
// ==========================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const GRAVITY = 0.5;
const FRICTION = 0.99;

function linesIntersect(a, b, c, d) {
    let det = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
    if (det === 0) return false;
    let lambda = ((d.y - c.y) * (d.x - a.x) + (c.x - d.x) * (d.y - a.y)) / det;
    let gamma = ((a.y - b.y) * (d.x - a.x) + (b.x - a.x) * (d.y - a.y)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
}

// ==========================================
// 2. PHYSICS ENTITIES
// ==========================================
class Point {
    constructor(x, y, isPinned = false) {
        this.x = x; this.y = y;
        this.oldX = x; this.oldY = y;
        this.isPinned = isPinned; this.isBall = false; this.radius = 3;
    }
    update() {
        if (this.isPinned) return;
        let vx = (this.x - this.oldX) * FRICTION;
        let vy = (this.y - this.oldY) * FRICTION;
        this.oldX = this.x; this.oldY = this.y;
        this.x += vx; this.y += vy + GRAVITY;
    }
}

class Stick {
    constructor(p1, p2) {
        this.p1 = p1; this.p2 = p2;
        this.length = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        this.isSevered = false;
    }
    update() {
        if (this.isSevered) return;
        let dx = this.p2.x - this.p1.x; let dy = this.p2.y - this.p1.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        let diff = this.length - dist;
        let percent = (diff / dist) / 2;
        let offsetX = dx * percent; let offsetY = dy * percent;

        if (!this.p1.isPinned) { this.p1.x -= offsetX; this.p1.y -= offsetY; }
        if (!this.p2.isPinned) { this.p2.x += offsetX; this.p2.y += offsetY; }
    }
    draw(ctx) {
        if (this.isSevered) return;
        ctx.beginPath(); ctx.moveTo(this.p1.x, this.p1.y); ctx.lineTo(this.p2.x, this.p2.y);
        ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 3; ctx.stroke();
    }
}

class Particle {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.vx = (Math.random() - 0.5) * 10; this.vy = (Math.random() - 0.5) * 10;
        this.life = 1.0;
    }
    update() { this.x += this.vx; this.y += this.vy; this.life -= 0.02; }
    draw(ctx) {
        ctx.fillStyle = `rgba(56, 189, 248, ${this.life})`;
        ctx.beginPath(); ctx.arc(this.x, this.y, 4, 0, Math.PI * 2); ctx.fill();
    }
}

// ==========================================
// 3. GAME CONTROLLER
// ==========================================
class GameEngine {
    constructor() {
        this.points = []; this.sticks = []; this.particles = [];
        this.ball = null; this.target = { x: 0, y: 0, radius: 45 };
        this.mouse = { x: 0, y: 0, isDown: false, trail: [] };
        
        this.currentLevel = 1; 
        this.totalScore = 0;
        this.state = 'PLAYING';
        
        this.setupEvents();
        this.loadLevel(this.currentLevel);
        this.loop();
    }

    setupEvents() {
        window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; this.resetLevel(); });
        canvas.addEventListener('mousedown', e => { this.mouse.isDown = true; this.mouse.trail = []; });
        canvas.addEventListener('mouseup', () => { this.mouse.isDown = false; this.mouse.trail = []; });
        canvas.addEventListener('mousemove', e => {
            this.mouse.x = e.clientX; this.mouse.y = e.clientY;
            if (this.mouse.isDown && this.state === 'PLAYING') {
                this.mouse.trail.push({ x: this.mouse.x, y: this.mouse.y });
                if (this.mouse.trail.length > 10) this.mouse.trail.shift();
                this.checkSlices();
            }
        });
    }

    checkSlices() {
        if (this.mouse.trail.length < 2) return;
        let p1 = this.mouse.trail[this.mouse.trail.length - 2];
        let p2 = this.mouse.trail[this.mouse.trail.length - 1];

        this.sticks.forEach(stick => {
            if (!stick.isSevered && linesIntersect(p1, p2, stick.p1, stick.p2)) {
                stick.isSevered = true; 
            }
        });
    }

    createRope(startX, startY, endX, endY, segments, hasBall = true, attachTo = null) {
        let prevPoint = new Point(startX, startY, true);
        this.points.push(prevPoint);
        let finalPoint = null;

        for (let i = 1; i <= segments; i++) {
            let x = startX + ((endX - startX) / segments) * i;
            let y = startY + ((endY - startY) / segments) * i;
            let p;

            if (i === segments && attachTo) {
                p = attachTo; 
            } else {
                p = new Point(x, y);
                this.points.push(p);
            }

            if (i === segments && hasBall && !attachTo) {
                p.isBall = true; p.radius = 20; this.ball = p;
            }

            this.sticks.push(new Stick(prevPoint, p));
            prevPoint = p;
            if (i === segments) finalPoint = p;
        }
        return finalPoint;
    }

    // --- LEVEL DESIGNS ---
    loadLevel(levelNum) {
        this.points = []; this.sticks = []; this.particles = []; this.state = 'PLAYING';
        this.currentLevel = levelNum;
        document.getElementById('level-display').innerText = `Level ${levelNum}`;
        document.getElementById('win-modal').classList.add('hidden');
        document.getElementById('lose-modal').classList.add('hidden');
        this.renderGrid();
        
        let cx = canvas.width / 2; let cy = canvas.height / 2;
        let top = 100; let bot = canvas.height - 100;
        let ballPoint;
        
        switch(levelNum) {
            case 1: // Straight drop
                this.createRope(cx, top, cx, cy, 15);
                this.target = { x: cx, y: bot, radius: 45 };
                break;
            case 2: // The Pendulum Swing (FIXED)
                ballPoint = this.createRope(cx - 150, top, cx, cy, 15, true);
                this.createRope(cx + 150, top, cx, cy, 15, false, ballPoint);
                this.target = { x: cx - 200, y: bot - 50, radius: 50 }; 
                break;
            case 3: // V-Shape 
                ballPoint = this.createRope(cx - 150, top, cx, cy, 15, true);
                this.createRope(cx + 150, top, cx, cy, 15, false, ballPoint);
                this.target = { x: cx, y: bot, radius: 45 };
                break;
            case 4: // Asymmetrical V-Shape
                ballPoint = this.createRope(cx - 200, top, cx - 100, cy, 10, true);
                this.createRope(cx + 100, top, cx - 100, cy, 20, false, ballPoint);
                this.target = { x: cx + 200, y: bot, radius: 40 };
                break;
            case 5: // 3-Point Web
                ballPoint = this.createRope(cx - 150, top, cx, cy, 15, true);
                this.createRope(cx + 150, top, cx, cy, 15, false, ballPoint);
                this.createRope(cx, top, cx, cy, 10, false, ballPoint);
                this.target = { x: cx + 150, y: bot, radius: 40 };
                break;
            case 6: // Extreme Swing
                this.createRope(cx - 300, top + 100, cx, cy + 100, 25);
                this.target = { x: cx + 300, y: bot, radius: 40 };
                break;
            case 7: // High suspension
                ballPoint = this.createRope(cx - 100, top, cx, top + 100, 8, true);
                this.createRope(cx + 100, top, cx, top + 100, 8, false, ballPoint);
                this.target = { x: cx, y: bot, radius: 35 };
                break;
            case 8: // Spider drop
                ballPoint = this.createRope(cx - 150, top + 100, cx, cy, 12, true);
                this.createRope(cx + 150, top + 100, cx, cy, 12, false, ballPoint);
                this.createRope(cx, top, cx, cy, 12, false, ballPoint);
                this.createRope(cx - 250, top, cx, cy, 15, false, ballPoint);
                this.target = { x: cx - 200, y: bot, radius: 40 };
                break;
            case 9: // The Slingshot
                ballPoint = this.createRope(cx + 300, top, cx + 150, cy, 10, true);
                this.createRope(cx + 400, top + 100, cx + 150, cy, 5, false, ballPoint);
                this.target = { x: cx - 200, y: bot, radius: 40 };
                break;
            case 10: // The Gauntlet
                ballPoint = this.createRope(cx - 200, top, cx, top + 200, 15, true);
                this.createRope(cx + 200, top, cx, top + 200, 15, false, ballPoint);
                this.createRope(cx - 300, top + 200, cx, top + 200, 20, false, ballPoint);
                this.createRope(cx + 300, top + 200, cx, top + 200, 20, false, ballPoint);
                this.target = { x: cx, y: bot, radius: 30 }; 
                break;
            default:
                this.currentLevel = 1;
                this.loadLevel(1);
        }
    }

    renderGrid() {
        const grid = document.getElementById('level-grid');
        grid.innerHTML = '';
        for (let i = 1; i <= 10; i++) {
            // All levels are now unlocked. Active level highlights blue.
            let statusClass = i === this.currentLevel ? 'active' : 'completed';
            
            grid.innerHTML += `<button class="grid-btn ${statusClass}" onclick="game.loadLevel(${i})">${i}</button>`;
        }
        document.getElementById('score-display').innerText = this.totalScore;
    }

    resetLevel() { this.loadLevel(this.currentLevel); }
    nextLevel() { this.loadLevel(this.currentLevel + 1); }
    toggleGuide() { document.getElementById('guide-modal').classList.toggle('hidden'); }
    closeLoseModal() { document.getElementById('lose-modal').classList.add('hidden'); }

    checkWin() {
        if (!this.ball || this.state !== 'PLAYING') return;
        
        // LOSE CONDITION: Triggers the new modal
        if (this.ball.y > canvas.height + 50 || this.ball.x < 0 || this.ball.x > canvas.width) {
            this.state = 'LOST'; 
            setTimeout(() => {
                document.getElementById('lose-modal').classList.remove('hidden');
            }, 500);
        }

        // WIN CONDITION
        let dx = this.ball.x - this.target.x;
        let dy = this.ball.y - this.target.y;
        if (Math.sqrt(dx*dx + dy*dy) < this.target.radius) {
            this.state = 'WON';
            this.totalScore += 100;
            
            for(let i=0; i<30; i++) this.particles.push(new Particle(this.ball.x, this.ball.y));
            this.ball = null; 
            setTimeout(() => {
                document.getElementById('win-modal').classList.remove('hidden');
                this.renderGrid(); 
            }, 800);
        }
    }

    loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (this.state === 'PLAYING') {
            this.points.forEach(p => p.update());
            for (let i = 0; i < 5; i++) this.sticks.forEach(s => s.update());
            this.checkWin();
        }

        ctx.beginPath(); ctx.arc(this.target.x, this.target.y, this.target.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34, 197, 94, 0.2)'; ctx.fill();
        ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 3; ctx.setLineDash([10, 5]); ctx.stroke(); ctx.setLineDash([]);

        this.sticks.forEach(s => s.draw(ctx));
        this.points.forEach(p => {
            if (p.isBall) {
                ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
                ctx.fillStyle = '#38bdf8'; ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 20; ctx.fill(); ctx.shadowBlur = 0;
            } else if (p.isPinned) {
                ctx.fillStyle = '#ef4444'; ctx.fillRect(p.x - 5, p.y - 5, 10, 10);
            }
        });

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(); this.particles[i].draw(ctx);
            if (this.particles[i].life <= 0) this.particles.splice(i, 1);
        }

        if (this.mouse.isDown && this.mouse.trail.length > 0) {
            ctx.beginPath(); ctx.moveTo(this.mouse.trail[0].x, this.mouse.trail[0].y);
            for (let i=1; i<this.mouse.trail.length; i++) ctx.lineTo(this.mouse.trail[i].x, this.mouse.trail[i].y);
            ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke();
        }

        requestAnimationFrame(() => this.loop());
    }
}

const game = new GameEngine();