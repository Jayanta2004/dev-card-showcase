// Virtual Plant Buddy - Daily Check-in, Mood, Productivity, Growth
const canvas = document.getElementById('plant-canvas');
const ctx = canvas.getContext('2d');
let growth = 1; // 1-5
let mood = 'happy';
let productivity = 'medium';
let history = [];

function drawPlant() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Pot
    ctx.fillStyle = '#bcaaa4';
    ctx.fillRect(120, 340, 80, 40);
    ctx.beginPath();
    ctx.ellipse(160, 340, 40, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#8d6e63';
    ctx.fill();
    // Stem
    ctx.beginPath();
    ctx.moveTo(160, 340);
    ctx.bezierCurveTo(160, 320, 160, 220 - growth * 20, 160, 160 - growth * 10);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#388e3c';
    ctx.stroke();
    // Leaves
    for (let i = 0; i < growth; i++) {
        ctx.save();
        ctx.translate(160, 260 - i * 22);
        ctx.rotate(-0.5 + i * 0.2);
        ctx.beginPath();
        ctx.ellipse(0, 0, 28, 12, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#66bb6a';
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.translate(160, 260 - i * 22);
        ctx.rotate(0.5 - i * 0.2);
        ctx.beginPath();
        ctx.ellipse(0, 0, 28, 12, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#81c784';
        ctx.fill();
        ctx.restore();
    }
    // Face
    ctx.save();
    ctx.translate(160, 160 - growth * 10);
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#fffde4';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#388e3c';
    ctx.stroke();
    // Eyes
    ctx.beginPath();
    ctx.arc(-7, -4, 2.5, 0, Math.PI * 2);
    ctx.arc(7, -4, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();
    // Mouth (mood)
    ctx.beginPath();
    if (mood === 'happy') {
        ctx.arc(0, 4, 7, 0, Math.PI, false);
    } else if (mood === 'neutral') {
        ctx.moveTo(-6, 8);
        ctx.lineTo(6, 8);
    } else {
        ctx.arc(0, 13, 7, Math.PI, 0, true);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#333';
    ctx.stroke();
    ctx.restore();
}

function updateStatus() {
    const status = document.getElementById('plant-status');
    let msg = '';
    if (growth >= 5) msg = 'Your plant is thriving! 🌱🌼';
    else if (growth >= 3) msg = 'Your plant is growing well!';
    else if (growth === 2) msg = 'Your plant is sprouting!';
    else msg = 'Your plant needs care.';
    if (mood === 'sad' || productivity === 'low') msg += ' (Needs more positivity!)';
    status.textContent = msg;
}

function renderHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = '';
    history.slice().reverse().forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.date}: Mood - ${entry.mood}, Productivity - ${entry.productivity}`;
        list.appendChild(li);
    });
}

document.getElementById('checkin-form').onsubmit = function(e) {
    e.preventDefault();
    mood = document.getElementById('mood-select').value;
    productivity = document.getElementById('productivity-select').value;
    // Growth logic
    if (mood === 'happy' && productivity === 'high') {
        if (growth < 5) growth++;
    } else if (mood === 'sad' || productivity === 'low') {
        if (growth > 1) growth--;
    }
    history.push({
        date: new Date().toLocaleDateString(),
        mood,
        productivity
    });
    drawPlant();
    updateStatus();
    renderHistory();
};

drawPlant();
updateStatus();
renderHistory();
