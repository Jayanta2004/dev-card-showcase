// Sleep Quality Star Map - Visual Sleep Diary
const canvas = document.getElementById('star-canvas');
const ctx = canvas.getContext('2d');
let sleepHistory = JSON.parse(localStorage.getItem('sleepHistory') || '[]');
let today = new Date().toLocaleDateString();

function saveSleepHistory() {
    localStorage.setItem('sleepHistory', JSON.stringify(sleepHistory));
}

function drawStarMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Sky background
    ctx.fillStyle = '#232946';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw stars and constellations
    let goodNights = sleepHistory.filter(s => s.quality === 'good');
    let avgNights = sleepHistory.filter(s => s.quality === 'average');
    let poorNights = sleepHistory.filter(s => s.quality === 'poor');
    // Good sleep: bright stars and constellations
    goodNights.forEach((entry, i) => {
        let x = 80 + (i % 10) * 70;
        let y = 60 + ((i * 37) % 180);
        drawStar(x, y, 3 + (i % 3), '#fffde4', 1);
        if (i % 5 === 0 && i > 0) drawConstellation(x, y, i);
    });
    // Average: dimmer stars
    avgNights.forEach((entry, i) => {
        let x = 60 + (i % 12) * 60;
        let y = 200 + ((i * 41) % 100);
        drawStar(x, y, 2, '#b8c1ec', 0.7);
    });
    // Poor: clouds or very dim stars
    poorNights.forEach((entry, i) => {
        let x = 100 + (i % 8) * 90;
        let y = 40 + ((i * 41) % 60);
        drawCloud(x, y);
        drawStar(x + 20, y + 20, 1, '#b8c1ec', 0.3);
    });
}

function drawStar(x, y, r, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12 * alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
}

function drawConstellation(x, y, i) {
    ctx.save();
    ctx.strokeStyle = '#fffde4';
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let j = 1; j <= 3; j++) {
        ctx.lineTo(x + j * 18, y - j * 12);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
}

function drawCloud(x, y) {
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(x, y, 18, Math.PI * 0.7, Math.PI * 2.3);
    ctx.arc(x + 16, y, 14, Math.PI * 0.7, Math.PI * 2.3);
    ctx.arc(x - 16, y, 12, Math.PI * 0.7, Math.PI * 2.3);
    ctx.fillStyle = '#b8c1ec';
    ctx.fill();
    ctx.restore();
}

function renderSleepHistory() {
    const list = document.getElementById('sleep-history-list');
    list.innerHTML = '';
    sleepHistory.slice().reverse().forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.date}: ${entry.quality}`;
        list.appendChild(li);
    });
}

document.getElementById('sleep-form').onsubmit = function(e) {
    e.preventDefault();
    const quality = document.getElementById('sleep-select').value;
    // Only one entry per day
    if (sleepHistory.length && sleepHistory[sleepHistory.length-1].date === today) {
        sleepHistory[sleepHistory.length-1].quality = quality;
    } else {
        sleepHistory.push({ date: today, quality });
    }
    saveSleepHistory();
    drawStarMap();
    renderSleepHistory();
};

drawStarMap();
renderSleepHistory();
