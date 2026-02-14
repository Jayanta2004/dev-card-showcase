/**
 * Morse-Code-Defender Engine
 * Handles single-button input timing and enemy sequence matching.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Morse Dictionary ---
const MORSE_CODE = {
    'A': '.-',    'B': '-...',  'C': '-.-.',  'D': '-..',
    'E': '.',     'F': '..-.',  'G': '--.',   'H': '....',
    'I': '..',    'J': '.---',  'K': '-.-',   'L': '.-..',
    'M': '--',    'N': '-.',    'O': '---',   'P': '.--.',
    'Q': '--.-',  'R': '.-.',   'S': '...',   'T': '-',
    'U': '..-',   'V': '...-',  'W': '.--',   'X': '-..-',
    'Y': '-.--',  'Z': '--..'
};

// --- Config ---
const DOT_DURATION = 250; // Max ms for a dot
const SPAWN_RATE = 2000;
let width, height;

// --- State ---
let isPlaying = false;
let score = 0;
let enemies = [];
let projectiles = [];
let particles = [];
let lastSpawn = 0;
let wave = 1;

// Input State
let keyDownTime = 0;
let isKeyPressed = false;
let activeTarget = null; // Enemy currently being matched

// UI Elements
const signalLight = document.getElementById('signal-light');
const signalText = document.getElementById('signal-text');
const scoreVal = document.getElementById('score-val');

// --- Entities ---

class Player {
    constructor() {
        this.x = width / 2;
        this.y = height - 50;
        this.angle = 0;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Turret Base
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(0, 10, 30, Math.PI, 0);
        ctx.fill();

        // Cannon
        if (activeTarget) {
            // Point at target
            const dx = activeTarget.x - this.x;
            const dy = activeTarget.y - this.y;
            this.angle = Math.atan2(dy, dx) + Math.PI/2;
        }
        
        ctx.rotate(this.angle);
        ctx.fillStyle = '#00ff41';
        ctx.fillRect(-5, -40, 10, 40);
        
        ctx.restore();
    }
}

class Enemy {
    constructor(char) {
        this.char = char;
        this.sequence = MORSE_CODE[char].split(''); // Array of '.' and '-'
        this.completed = []; // Array of completed parts
        this.x = Math.random() * (width - 100) + 50;
        this.y = -50;
        this.speed = 0.5 + (wave * 0.1);
        this.radius = 20;
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        // Draw Enemy Body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = this === activeTarget ? '#ff3333' : '#fff';
        ctx.shadowBlur = this === activeTarget ? 15 : 0;
        ctx.shadowColor = '#ff3333';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw Letter
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.char, this.x, this.y);

        // Draw Morse Sequence above
        const seqWidth = (this.sequence.length + this.completed.length) * 10;
        let startX = this.x - (seqWidth / 4); 
        const startY = this.y - 30;

        // Draw Completed (Green)
        this.completed.forEach((sym, i) => {
            ctx.fillStyle = '#00ff41';
            const symbolStr = sym === '.' ? '●' : '▬';
            ctx.font = '16px monospace';
            ctx.fillText(symbolStr, startX + (i * 15), startY);
        });

        // Draw Remaining (White/Grey)
        const offset = this.completed.length;
        this.sequence.forEach((sym, i) => {
            ctx.fillStyle = this === activeTarget ? '#fff' : '#888';
            const symbolStr = sym === '.' ? '●' : '▬';
            ctx.font = '16px monospace';
            ctx.fillText(symbolStr, startX + ((i + offset) * 15), startY);
        });
        
        // Target indicator line
        if (this === activeTarget) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)';
            ctx.lineWidth = 1;
            ctx.moveTo(width/2, height - 50);
            ctx.lineTo(this.x, this.y);
            ctx.stroke();
        }
    }
}

class Projectile {
    constructor(target) {
        this.x = width / 2;
        this.y = height - 50;
        this.target = target;
        this.speed = 15;
        this.active = true;
    }

    update() {
        if (!this.target) { this.active = false; return; }
        
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < this.speed) {
            this.x = this.target.x;
            this.y = this.target.y;
            this.active = false;
            createExplosion(this.x, this.y);
        } else {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI*2);
        ctx.fillStyle = '#00ff41';
        ctx.fill();
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 5;
        this.vy = (Math.random() - 0.5) * 5;
        this.life = 1.0;
        this.color = '#ff3333';
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.05;
    }
    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 2, 2);
        ctx.globalAlpha = 1.0;
    }
}

// --- Init & Controls ---

const player = new Player();

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();
    generateCheatSheet();
    
    document.getElementById('btn-start').addEventListener('click', startGame);
    document.getElementById('btn-restart').addEventListener('click', startGame);
    
    requestAnimationFrame(loop);
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    player.x = width / 2;
    player.y = height - 50;
}

function generateCheatSheet() {
    const sheet = document.getElementById('cheat-sheet');
    for (const [char, code] of Object.entries(MORSE_CODE)) {
        const row = document.createElement('div');
        row.className = 'sheet-row';
        row.innerHTML = `<span>${char}</span> <span>${code}</span>`;
        sheet.appendChild(row);
    }
}

function setupInput() {
    const handleDown = (e) => {
        if (!isPlaying || isKeyPressed) return;
        if (e.type === 'keydown' && e.code !== 'Space') return; // Only spacebar or touch
        
        isKeyPressed = true;
        keyDownTime = performance.now();
        signalLight.classList.add('active');
        signalText.innerText = "READING...";
    };

    const handleUp = (e) => {
        if (!isPlaying || !isKeyPressed) return;
        if (e.type === 'keyup' && e.code !== 'Space') return;

        isKeyPressed = false;
        signalLight.classList.remove('active');
        
        const duration = performance.now() - keyDownTime;
        const symbol = duration < DOT_DURATION ? '.' : '-';
        
        signalText.innerText = symbol === '.' ? "DOT (●)" : "DASH (▬)";
        
        processInput(symbol);
    };

    // Keyboard
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    
    // Touch/Mouse (for mobile support)
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchstart', (e) => { e.preventDefault(); handleDown(e); }, {passive: false});
    window.addEventListener('touchend', (e) => { e.preventDefault(); handleUp(e); }, {passive: false});
}

function processInput(symbol) {
    // If no target, find closest enemy that starts with this symbol
    if (!activeTarget) {
        // Sort enemies by Y (closest to bottom)
        const sorted = [...enemies].sort((a, b) => b.y - a.y);
        
        for (let e of sorted) {
            if (e.sequence.length > 0 && e.sequence[0] === symbol) {
                activeTarget = e;
                break;
            }
        }
    }

    if (activeTarget) {
        if (activeTarget.sequence[0] === symbol) {
            // Correct input 
            activeTarget.sequence.shift(); // Remove from queue
            activeTarget.completed.push(symbol); // Add to done
            
            // Visual feedback shot (just cosmetic beam)
            createBeam(activeTarget);

            if (activeTarget.sequence.length === 0) {
                // Destroyed
                destroyEnemy(activeTarget);
                activeTarget = null;
            }
        } else {
            // Incorrect input -> Reset target lock or penalize?
            // For now, simple visual feedback "ERROR"
            signalText.innerText = "ERR";
            signalText.style.color = 'red';
            setTimeout(() => signalText.style.color = '#00ff41', 200);
        }
    }
}

function createBeam(target) {
    // Instant line
    ctx.strokeStyle = '#00ff41';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
}

function destroyEnemy(enemy) {
    projectiles.push(new Projectile(enemy));
    score += 100 * wave;
    scoreVal.innerText = score;
    
    // Wave logic
    if (score > wave * 1000) wave++;
}

function createExplosion(x, y) {
    for(let i=0; i<8; i++) particles.push(new Particle(x, y));
}

function startGame() {
    isPlaying = true;
    score = 0;
    wave = 1;
    enemies = [];
    projectiles = [];
    particles = [];
    activeTarget = null;
    
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    scoreVal.innerText = "0";
}

function spawnEnemy() {
    const keys = Object.keys(MORSE_CODE);
    const char = keys[Math.floor(Math.random() * keys.length)];
    enemies.push(new Enemy(char));
}

function gameOver() {
    isPlaying = false;
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = score;
}

// --- Main Loop ---

function loop(timestamp) {
    ctx.clearRect(0, 0, width, height);

    if (isPlaying) {
        // Spawn
        if (timestamp - lastSpawn > Math.max(800, SPAWN_RATE - (wave * 100))) {
            spawnEnemy();
            lastSpawn = timestamp;
        }

        player.draw();

        // Update Projectiles
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const p = projectiles[i];
            p.update();
            p.draw();
            if (!p.active) {
                // Find enemy in list and remove
                const idx = enemies.indexOf(p.target);
                if (idx > -1) enemies.splice(idx, 1);
                projectiles.splice(i, 1);
            }
        }

        // Update Enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            e.update();
            e.draw();

            if (e.y > height - 50) {
                gameOver();
            }
        }

        // Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].life <= 0) particles.splice(i, 1);
        }
    }

    requestAnimationFrame(loop);
}

// Init
init();