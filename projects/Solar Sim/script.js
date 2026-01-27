/**
 * Solar-Sim Physics Engine
 * Implements N-Body Gravity simulation using simplified Newtonian physics.
 */

// --- Configuration ---
const G = 0.5; // Gravitational Constant (Tweaked for gameplay feeling)
const TRAIL_LENGTH = 50;

// --- DOM Elements ---
const canvas = document.getElementById('space-canvas');
const ctx = canvas.getContext('2d');
const massSlider = document.getElementById('mass-slider');
const countEl = document.getElementById('obj-count');

// --- State ---
let bodies = [];
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let dragCurrent = { x: 0, y: 0 };
let showTrails = true;

// --- Body Class ---
class Body {
    constructor(x, y, mass, vx, vy, color) {
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.vx = vx;
        this.vy = vy;
        this.radius = Math.sqrt(mass) * 2; // Size relative to mass
        this.color = color || getRandomColor();
        this.trail = [];
    }

    update() {
        // Physics update handled by main loop
        this.x += this.vx;
        this.y += this.vy;

        // Trail Logic
        if (showTrails) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > TRAIL_LENGTH) {
                this.trail.shift();
            }
        }
    }

    draw() {
        // Draw Trail
        if (showTrails && this.trail.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.4;
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let point of this.trail) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }

        // Draw Body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
    }
}

// --- Initialization ---
function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Default System (Sun + Earth-ish)
    resetSystem();

    // Mouse Events
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Controls
    document.getElementById('btn-clear').addEventListener('click', () => { bodies = []; updateCount(); });
    document.getElementById('btn-reset').addEventListener('click', resetSystem);
    document.getElementById('btn-trails').addEventListener('click', (e) => {
        showTrails = !showTrails;
        e.target.classList.toggle('active');
        if(!showTrails) bodies.forEach(b => b.trail = []);
    });

    loop();
}

function resetSystem() {
    bodies = [];
    // Central Star
    bodies.push(new Body(canvas.width/2, canvas.height/2, 200, 0, 0, '#ffd700'));
    // Planet 1
    bodies.push(new Body(canvas.width/2 + 200, canvas.height/2, 20, 0, 2.5, '#4cc9f0'));
    // Planet 2
    bodies.push(new Body(canvas.width/2 - 350, canvas.height/2, 40, 0, -1.8, '#ff6b6b'));
    updateCount();
}

// --- Physics Logic ---
function updatePhysics() {
    for (let i = 0; i < bodies.length; i++) {
        let b1 = bodies[i];
        
        for (let j = 0; j < bodies.length; j++) {
            if (i === j) continue;
            let b2 = bodies[j];

            // Distance Vector
            let dx = b2.x - b1.x;
            let dy = b2.y - b1.y;
            let distSq = dx*dx + dy*dy;
            let dist = Math.sqrt(distSq);

            // Collision Merge (Simplified)
            if (dist < b1.radius + b2.radius) {
                // If b1 is bigger, it eats b2
                if (b1.mass >= b2.mass) {
                    // Conserve Momentum
                    b1.vx = (b1.vx * b1.mass + b2.vx * b2.mass) / (b1.mass + b2.mass);
                    b1.vy = (b1.vy * b1.mass + b2.vy * b2.mass) / (b1.mass + b2.mass);
                    b1.mass += b2.mass;
                    b1.radius = Math.sqrt(b1.mass) * 2;
                    bodies.splice(j, 1);
                    j--; // Adjust index
                    updateCount();
                    continue;
                }
            }

            // Gravity Calculation (F = G * m1 * m2 / r^2)
            // Force strength
            let force = (G * b1.mass * b2.mass) / distSq;
            
            // Force components
            let fx = force * (dx / dist);
            let fy = force * (dy / dist);

            // Apply to velocity (F = ma -> a = F/m)
            b1.vx += fx / b1.mass;
            b1.vy += fy / b1.mass;
        }
        b1.update();
    }
}

// --- Interaction ---
function onMouseDown(e) {
    isDragging = true;
    dragStart = getPos(e);
    dragCurrent = dragStart;
}

function onMouseMove(e) {
    if (isDragging) {
        dragCurrent = getPos(e);
    }
}

function onMouseUp(e) {
    if (isDragging) {
        isDragging = false;
        
        // Calculate Launch Velocity
        // Velocity is opposite to drag direction
        const vx = (dragStart.x - dragCurrent.x) * 0.05;
        const vy = (dragStart.y - dragCurrent.y) * 0.05;
        const mass = parseInt(massSlider.value);

        bodies.push(new Body(dragStart.x, dragStart.y, mass, vx, vy));
        updateCount();
    }
}

// --- Rendering ---
function loop() {
    // Clear Canvas
    ctx.fillStyle = 'rgba(5, 7, 10, 0.2)'; // Trail fade effect for background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Physics Step
    updatePhysics();

    // Draw Bodies
    bodies.forEach(b => b.draw());

    // Draw Drag Line
    if (isDragging) {
        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(dragCurrent.x, dragCurrent.y);
        ctx.strokeStyle = '#fff';
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Preview Circle
        ctx.beginPath();
        ctx.arc(dragStart.x, dragStart.y, Math.sqrt(massSlider.value)*2, 0, Math.PI*2);
        ctx.strokeStyle = '#fff';
        ctx.stroke();
    }

    requestAnimationFrame(loop);
}

// --- Helpers ---
function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function getRandomColor() {
    const hues = [200, 280, 340, 40, 160]; // Space-y colors
    const hue = hues[Math.floor(Math.random() * hues.length)];
    return `hsl(${hue}, 80%, 60%)`;
}

function updateCount() {
    countEl.innerText = bodies.length;
}

// Start
init();