const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const streakEl = document.getElementById('streak');
const multiplierEl = document.getElementById('multiplier');
const startBtn = document.getElementById('start-btn');

let score = 0;
let streak = 0;
let multiplier = 1;
let notes = [];
let gameRunning = false;
let lastNoteTime = 0;
let noteSpeed = 2;
let targetY = canvas.height - 50;

class Note {
    constructor() {
        this.x = Math.random() * (canvas.width - 20) + 10;
        this.y = -20;
        this.radius = 10;
        this.hit = false;
    }

    update() {
        this.y += noteSpeed;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.hit ? '#0f0' : '#f00';
        ctx.fill();
        ctx.stroke();
    }

    isAtTarget() {
        return Math.abs(this.y - targetY) < 20;
    }

    checkHit() {
        if (this.isAtTarget() && !this.hit) {
            this.hit = true;
            streak++;
            score += multiplier;
            updateUI();
            playSound(true);
            return true;
        }
        return false;
    }
}

function updateUI() {
    scoreEl.textContent = `Score: ${score}`;
    streakEl.textContent = `Streak: ${streak}`;
    multiplier = Math.floor(streak / 5) + 1;
    multiplierEl.textContent = `Multiplier: ${multiplier}x`;
}

function playSound(hit) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.setValueAtTime(hit ? 800 : 200, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.1);
}

function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw target line
    ctx.beginPath();
    ctx.moveTo(0, targetY);
    ctx.lineTo(canvas.width, targetY);
    ctx.strokeStyle = '#00f';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Update and draw notes
    notes.forEach((note, index) => {
        note.update();
        note.draw();

        if (note.y > canvas.height + 20) {
            notes.splice(index, 1);
            if (!note.hit) {
                streak = 0;
                updateUI();
                playSound(false);
            }
        }
    });

    // Generate new notes
    if (Date.now() - lastNoteTime > 1000 + Math.random() * 1000) {
        notes.push(new Note());
        lastNoteTime = Date.now();
    }

    requestAnimationFrame(gameLoop);
}

function tap() {
    if (!gameRunning) return;

    let hit = false;
    notes.forEach(note => {
        if (note.checkHit()) {
            hit = true;
        }
    });

    if (!hit) {
        streak = 0;
        updateUI();
        playSound(false);
    }
}

startBtn.addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        score = 0;
        streak = 0;
        multiplier = 1;
        notes = [];
        updateUI();
        gameLoop();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        tap();
    }
});

canvas.addEventListener('click', tap);