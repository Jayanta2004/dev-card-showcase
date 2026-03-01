/**
 * Shadow-Thief Engine
 * Implements 2D Raycasting for Visibility Polygons and Dynamic Lighting.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const RAY_COUNT = 0; // We cast to vertices, not fixed angle steps
const LIGHT_RADIUS = 300;
const GUARD_SPEED = 2;
const PLAYER_SPEED = 3;

// --- State ---
let width, height;
let player = { x: 50, y: 50, radius: 8 };
let walls = [];
let guards = []; // Light sources
let gem = { x: 0, y: 0, taken: false };
let exit = { x: 0, y: 0 };
let keys = {};
let gameState = 'start'; // start, playing, caught, win

// --- Vector Helper ---
class Vec2 {
    constructor(x, y) { this.x = x; this.y = y; }
    add(v) { return new Vec2(this.x + v.x, this.y + v.y); }
    sub(v) { return new Vec2(this.x - v.x, this.y - v.y); }
    mult(n) { return new Vec2(this.x * n, this.y * n); }
    mag() { return Math.sqrt(this.x*this.x + this.y*this.y); }
}

// --- Entities ---

class Wall {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        // Vertices for raycasting
        this.points = [
            {x: x, y: y},
            {x: x+w, y: y},
            {x: x+w, y: y+h},
            {x: x, y: y+h}
        ];
        // Segments for intersection
        this.segments = [
            {a: this.points[0], b: this.points[1]},
            {a: this.points[1], b: this.points[2]},
            {a: this.points[2], b: this.points[3]},
            {a: this.points[3], b: this.points[0]}
        ];
    }
    
    draw() {
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = '#555';
        ctx.strokeRect(this.x, this.y, this.w, this.h);
    }
}

class Guard {
    constructor(path) {
        this.path = path; // Array of points
        this.targetIdx = 0;
        this.pos = new Vec2(path[0].x, path[0].y);
        this.poly = []; // Visibility polygon
    }

    update() {
        const target = this.path[this.targetIdx];
        const dir = new Vec2(target.x - this.pos.x, target.y - this.pos.y);
        const dist = dir.mag();

        if (dist < GUARD_SPEED) {
            this.targetIdx = (this.targetIdx + 1) % this.path.length;
        } else {
            const move = dir.mult(1/dist).mult(GUARD_SPEED);
            this.pos = this.pos.add(move);
        }
    }
}

// --- Raycasting Core ---

function getIntersection(ray, segment) {
    const r_px = ray.a.x; const r_py = ray.a.y;
    const r_dx = ray.b.x - ray.a.x; const r_dy = ray.b.y - ray.a.y;
    const s_px = segment.a.x; const s_py = segment.a.y;
    const s_dx = segment.b.x - segment.a.x; const s_dy = segment.b.y - segment.a.y;

    const r_mag = Math.sqrt(r_dx*r_dx + r_dy*r_dy);
    const s_mag = Math.sqrt(s_dx*s_dx + s_dy*s_dy);

    if (r_dx/r_mag == s_dx/s_mag && r_dy/r_mag == s_dy/s_mag) return null; // Parallel

    const T2 = (r_dx*(s_py-r_py) + r_dy*(r_px-s_px))/(s_dx*r_dy - s_dy*r_dx);
    const T1 = (s_px+s_dx*T2-r_px)/r_dx;

    if (T1 < 0) return null; // Behind ray
    if (T2 < 0 || T2 > 1) return null; // Off segment

    return {
        x: r_px + r_dx*T1,
        y: r_py + r_dy*T1,
        param: T1
    };
}

function calculateVisibility(source, radius) {
    let points = [];
    // 1. Collect all unique angles to wall vertices
    // Add offsets (+/- 0.0001) to hit walls AND cast past them
    let angles = [];
    
    // Add bounding box corners
    const borderPoints = [
        {x:0, y:0}, {x:width, y:0}, {x:width, y:height}, {x:0, y:height}
    ];
    
    // Collect points from all walls + borders
    let allSegments = [
        {a:{x:0,y:0}, b:{x:width,y:0}},
        {a:{x:width,y:0}, b:{x:width,y:height}},
        {a:{x:width,y:height}, b:{x:0,y:height}},
        {a:{x:0,y:height}, b:{x:0,y:0}}
    ];
    walls.forEach(w => allSegments.push(...w.segments));

    walls.forEach(w => {
        w.points.forEach(p => {
            const angle = Math.atan2(p.y - source.y, p.x - source.x);
            angles.push(angle - 0.0001, angle, angle + 0.0001);
        });
    });
    borderPoints.forEach(p => {
        const angle = Math.atan2(p.y - source.y, p.x - source.x);
        angles.push(angle);
    });

    // 2. Sort angles
    angles.sort((a, b) => a - b);

    // 3. Cast Rays
    let polygon = [];
    angles.forEach(angle => {
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        
        // Ray goes far
        const ray = {
            a: source,
            b: {x: source.x + dx*1000, y: source.y + dy*1000}
        };

        let closestIntersect = null;
        let minParam = Infinity;

        allSegments.forEach(seg => {
            const intersect = getIntersection(ray, seg);
            if (intersect && intersect.param < minParam) {
                minParam = intersect.param;
                closestIntersect = intersect;
            }
        });

        if (closestIntersect) {
            polygon.push(closestIntersect);
        }
    });

    return polygon;
}

// --- Game Logic ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInputs();
    
    document.getElementById('btn-start').addEventListener('click', startGame);
    document.getElementById('btn-restart').addEventListener('click', startGame);
    document.getElementById('btn-next').addEventListener('click', startGame);

    loadLevel();
    loop();
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    loadLevel(); // Re-center things
}

function loadLevel() {
    // Hardcoded Level 1
    player.x = 50; player.y = 50;
    gem = { x: width - 50, y: height - 50, taken: false };
    exit = { x: 50, y: 50 };
    
    walls = [
        new Wall(150, 100, 20, 200),
        new Wall(300, 300, 200, 20),
        new Wall(500, 100, 20, 150),
        new Wall(100, 400, 150, 20)
    ];

    guards = [
        new Guard([{x: 250, y: 150}, {x: 450, y: 150}]),
        new Guard([{x: 400, y: 400}, {x: 400, y: 500}, {x: 600, y: 500}])
    ];
}

function startGame() {
    gameState = 'playing';
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('alert-badge').classList.add('hidden');
    loadLevel();
}

function setupInputs() {
    window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
}

function updatePlayer() {
    let dx = 0, dy = 0;
    if (keys['w']) dy = -PLAYER_SPEED;
    if (keys['s']) dy = PLAYER_SPEED;
    if (keys['a']) dx = -PLAYER_SPEED;
    if (keys['d']) dx = PLAYER_SPEED;

    // Simple Collision Check
    const nextX = player.x + dx;
    const nextY = player.y + dy;
    
    let collides = false;
    walls.forEach(w => {
        if (nextX > w.x - player.radius && nextX < w.x + w.w + player.radius &&
            nextY > w.y - player.radius && nextY < w.y + w.h + player.radius) {
            collides = true;
        }
    });
    
    // Bounds
    if (nextX < 0 || nextX > width || nextY < 0 || nextY > height) collides = true;

    if (!collides) {
        player.x = nextX;
        player.y = nextY;
    }

    // Logic
    const dGem = Math.sqrt((player.x - gem.x)**2 + (player.y - gem.y)**2);
    if (dGem < 20 && !gem.taken) {
        gem.taken = true;
        document.getElementById('obj-text').innerText = "Objective: Escape!";
        document.getElementById('obj-text').style.color = '#2ecc71';
    }

    if (gem.taken) {
        const dExit = Math.sqrt((player.x - exit.x)**2 + (player.y - exit.y)**2);
        if (dExit < 20) {
            gameState = 'win';
            document.getElementById('win-screen').classList.remove('hidden');
        }
    }
}

function checkDetection() {
    // Check if player is inside any guard's visibility polygon
    // Point in Polygon algorithm (Ray casting method)
    let detected = false;

    guards.forEach(g => {
        if (isPointInPoly(player, g.poly)) {
            // Also check distance (flashlight range)
            const d = Math.sqrt((player.x - g.pos.x)**2 + (player.y - g.pos.y)**2);
            if (d < LIGHT_RADIUS) detected = true;
        }
    });

    if (detected) {
        gameState = 'caught';
        document.getElementById('game-over-screen').classList.remove('hidden');
        document.getElementById('alert-badge').classList.remove('hidden');
    }
}

function isPointInPoly(pt, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i].x, yi = poly[i].y;
        const xj = poly[j].x, yj = poly[j].y;
        const intersect = ((yi > pt.y) != (yj > pt.y)) &&
            (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// --- Main Loop ---

function loop() {
    if (gameState === 'playing') {
        updatePlayer();
        guards.forEach(g => g.update());
        
        // Raycasting for all guards 
        guards.forEach(g => {
            g.poly = calculateVisibility(g.pos, LIGHT_RADIUS);
        });

        checkDetection();
    }

    // Render
    
    // 1. Draw Darkness Layer (Full Screen)
    // We will draw the lights using "destination-out" or clipping
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Lights (Cut out darkness)
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out'; // Erase darkness
    
    guards.forEach(g => {
        if (!g.poly.length) return;
        
        ctx.beginPath();
        ctx.moveTo(g.poly[0].x, g.poly[0].y);
        for(let i=1; i<g.poly.length; i++) ctx.lineTo(g.poly[i].x, g.poly[i].y);
        ctx.closePath();
        
        // Radial gradient for soft light edge
        const grad = ctx.createRadialGradient(g.pos.x, g.pos.y, 50, g.pos.x, g.pos.y, LIGHT_RADIUS);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = 'rgba(255,255,255,1)'; // Solid cut for logic
        ctx.fill();
    });
    ctx.restore();

    // 3. Draw Light visual (White/Yellow overlay)
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    guards.forEach(g => {
        if (!g.poly.length) return;
        ctx.beginPath();
        ctx.moveTo(g.poly[0].x, g.poly[0].y);
        for(let i=1; i<g.poly.length; i++) ctx.lineTo(g.poly[i].x, g.poly[i].y);
        ctx.closePath();
        
        ctx.fillStyle = 'rgba(255, 255, 200, 0.1)';
        ctx.fill();
        
        // Draw Guard Body
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(g.pos.x, g.pos.y, 10, 0, Math.PI*2);
        ctx.fill();
    });
    ctx.restore();

    // 4. Draw Walls (On top of everything)
    walls.forEach(w => w.draw());

    // 5. Draw Gem & Exit
    if (!gem.taken) {
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(gem.x, gem.y, 6, 0, Math.PI*2);
        ctx.fill();
        // Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#f1c40f';
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    if (gem.taken) {
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(exit.x - 15, exit.y - 15, 30, 30);
        ctx.fillStyle = '#000';
        ctx.fillText("EXIT", exit.x-12, exit.y+4);
    }

    // 6. Draw Player
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI*2);
    ctx.fill();

    requestAnimationFrame(loop);
}

// Start
init();