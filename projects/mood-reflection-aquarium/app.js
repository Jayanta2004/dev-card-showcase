// Mood Reflection Aquarium - Visual Mood Diary
const canvas = document.getElementById('aquarium-canvas');
const ctx = canvas.getContext('2d');
let moodHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]');
let today = new Date().toLocaleDateString();

function saveMoodHistory() {
    localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
}

function drawAquarium() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Water
    ctx.fillStyle = '#b3e5fc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw plants (neutral)
    let plantCount = moodHistory.filter(m => m.mood === 'neutral').length;
    for (let i = 0; i < plantCount; i++) {
        let x = 60 + (i % 10) * 70;
        let h = 60 + Math.random() * 40;
        ctx.beginPath();
        ctx.moveTo(x, canvas.height);
        ctx.bezierCurveTo(x - 10, canvas.height - h/2, x + 10, canvas.height - h/2, x, canvas.height - h);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#388e3c';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, canvas.height - h, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#81c784';
        ctx.fill();
    }
    // Draw fish (happy)
    let fishCount = moodHistory.filter(m => m.mood === 'happy').length;
    for (let i = 0; i < fishCount; i++) {
        let x = 80 + (i % 10) * 70;
        let y = 80 + ((i * 37) % 180);
        drawFish(x, y, i);
    }
    // Draw clouds/algae (sad)
    let sadCount = moodHistory.filter(m => m.mood === 'sad').length;
    for (let i = 0; i < sadCount; i++) {
        let x = 100 + (i % 8) * 90;
        let y = 30 + ((i * 41) % 60);
        drawCloudOrAlgae(x, y);
    }
}

function drawFish(x, y, i) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1.1 + (i % 3) * 0.2, 1);
    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = ['#ffb74d','#4fc3f7','#e57373','#81c784','#ba68c8'][i%5];
    ctx.fill();
    // Tail
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(-32, -10);
    ctx.lineTo(-32, 10);
    ctx.closePath();
    ctx.fillStyle = '#fffde4';
    ctx.fill();
    // Eye
    ctx.beginPath();
    ctx.arc(10, -3, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();
    ctx.restore();
}

function drawCloudOrAlgae(x, y) {
    ctx.save();
    ctx.globalAlpha = 0.7;
    // Cloud
    ctx.beginPath();
    ctx.arc(x, y, 18, Math.PI * 0.7, Math.PI * 2.3);
    ctx.arc(x + 16, y, 14, Math.PI * 0.7, Math.PI * 2.3);
    ctx.arc(x - 16, y, 12, Math.PI * 0.7, Math.PI * 2.3);
    ctx.fillStyle = '#bdbdbd';
    ctx.fill();
    // Algae
    ctx.beginPath();
    ctx.moveTo(x, y + 18);
    ctx.bezierCurveTo(x - 8, y + 30, x + 8, y + 30, x, y + 18);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#388e3c';
    ctx.stroke();
    ctx.restore();
}

function renderMoodHistory() {
    const list = document.getElementById('mood-history-list');
    list.innerHTML = '';
    moodHistory.slice().reverse().forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.date}: ${entry.mood}`;
        list.appendChild(li);
    });
}

document.getElementById('mood-form').onsubmit = function(e) {
    e.preventDefault();
    const mood = document.getElementById('mood-select').value;
    // Only one entry per day
    if (moodHistory.length && moodHistory[moodHistory.length-1].date === today) {
        moodHistory[moodHistory.length-1].mood = mood;
    } else {
        moodHistory.push({ date: today, mood });
    }
    saveMoodHistory();
    drawAquarium();
    renderMoodHistory();
};

drawAquarium();
renderMoodHistory();
