// Gratitude Sky Lanterns - Visual Gratitude Diary
const canvas = document.getElementById('sky-canvas');
const ctx = canvas.getContext('2d');
let gratitudeHistory = JSON.parse(localStorage.getItem('gratitudeHistory') || '[]');
let today = new Date().toLocaleDateString();

function saveGratitudeHistory() {
    localStorage.setItem('gratitudeHistory', JSON.stringify(gratitudeHistory));
}

function drawSky() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Night sky background
    ctx.fillStyle = '#232946';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Lanterns
    let streak = getStreak();
    gratitudeHistory.forEach((entry, i) => {
        let x = 80 + (i % 10) * 70;
        let y = 320 - (i * 28) % 280;
        drawLantern(x, y, i, streak);
    });
    // Sky brightness and color
    if (streak >= 7) {
        ctx.save();
        ctx.globalAlpha = 0.18 + 0.04 * Math.min(streak, 20);
        ctx.fillStyle = '#ffe066';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }
}

function drawLantern(x, y, i, streak) {
    ctx.save();
    // Glow
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.globalAlpha = 0.18 + 0.04 * Math.min(streak, 20);
    ctx.fillStyle = ['#ffe066','#eebbc3','#b8c1ec','#f38181','#fce38a'][i%5];
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 24;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    // Lantern body
    ctx.beginPath();
    ctx.ellipse(x, y, 18, 28, 0, 0, Math.PI * 2);
    ctx.fillStyle = ['#ffe066','#eebbc3','#b8c1ec','#f38181','#fce38a'][i%5];
    ctx.fill();
    // Top
    ctx.beginPath();
    ctx.ellipse(x, y-18, 14, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
    // String
    ctx.beginPath();
    ctx.moveTo(x, y+28);
    ctx.lineTo(x, y+38);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fffde4';
    ctx.stroke();
    ctx.restore();
}

function getStreak() {
    let streak = 0;
    let lastDate = null;
    for (let i = gratitudeHistory.length - 1; i >= 0; i--) {
        let entryDate = new Date(gratitudeHistory[i].date);
        if (!lastDate) {
            streak = 1;
            lastDate = entryDate;
        } else {
            let diff = (lastDate - entryDate) / (1000*60*60*24);
            if (diff === 1) {
                streak++;
                lastDate = entryDate;
            } else {
                break;
            }
        }
    }
    return streak;
}

function renderGratitudeHistory() {
    const list = document.getElementById('gratitude-history-list');
    list.innerHTML = '';
    gratitudeHistory.slice().reverse().forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.date}: ${entry.note}`;
        list.appendChild(li);
    });
}

document.getElementById('gratitude-form').onsubmit = function(e) {
    e.preventDefault();
    const note = document.getElementById('gratitude-input').value.trim();
    if (!note) return;
    // Only one entry per day
    if (gratitudeHistory.length && gratitudeHistory[gratitudeHistory.length-1].date === today) {
        gratitudeHistory[gratitudeHistory.length-1].note = note;
    } else {
        gratitudeHistory.push({ date: today, note });
    }
    saveGratitudeHistory();
    drawSky();
    renderGratitudeHistory();
    document.getElementById('gratitude-input').value = '';
};

drawSky();
renderGratitudeHistory();
