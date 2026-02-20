// Focus Pomodoro Garden - Pomodoro Timer & Virtual Garden
const canvas = document.getElementById('garden-canvas');
const ctx = canvas.getContext('2d');
let sessionHistory = JSON.parse(localStorage.getItem('sessionHistory') || '[]');
let timer = 25 * 60;
let interval = null;
let streak = getStreak();

function saveSessionHistory() {
    localStorage.setItem('sessionHistory', JSON.stringify(sessionHistory));
}

function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

document.getElementById('timer-display').textContent = formatTime(timer);

document.getElementById('start-btn').onclick = function() {
    if (interval) return;
    interval = setInterval(() => {
        timer--;
        document.getElementById('timer-display').textContent = formatTime(timer);
        if (timer <= 0) {
            clearInterval(interval);
            interval = null;
            completeSession();
            timer = 25 * 60;
            document.getElementById('timer-display').textContent = formatTime(timer);
        }
    }, 1000);
};

document.getElementById('reset-btn').onclick = function() {
    clearInterval(interval);
    interval = null;
    timer = 25 * 60;
    document.getElementById('timer-display').textContent = formatTime(timer);
};

function completeSession() {
    const today = new Date().toLocaleDateString();
    if (sessionHistory.length && sessionHistory[sessionHistory.length-1].date === today) {
        sessionHistory[sessionHistory.length-1].count++;
    } else {
        sessionHistory.push({ date: today, count: 1 });
    }
    saveSessionHistory();
    streak = getStreak();
    drawGarden();
    renderSessionHistory();
}

function getStreak() {
    let streak = 0;
    let lastDate = null;
    for (let i = sessionHistory.length - 1; i >= 0; i--) {
        let entryDate = new Date(sessionHistory[i].date);
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

function drawGarden() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let flowers = 0;
    sessionHistory.forEach((entry, i) => {
        for (let j = 0; j < entry.count; j++) {
            let x = 80 + ((flowers + j) % 10) * 70;
            let y = 320 - ((flowers + j) * 28) % 280;
            let rare = streak >= 7 && (flowers + j) % 7 === 0;
            drawFlower(x, y, rare, (flowers + j));
        }
        flowers += entry.count;
    });
    // Decorations for streaks
    if (streak >= 7) {
        ctx.save();
        ctx.globalAlpha = 0.18 + 0.04 * Math.min(streak, 20);
        ctx.fillStyle = '#fce38a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }
}

function drawFlower(x, y, rare, i) {
    ctx.save();
    // Stem
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 30);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#81c784';
    ctx.stroke();
    // Petals
    for (let a = 0; a < 8; a++) {
        ctx.beginPath();
        ctx.ellipse(x + Math.cos(a * Math.PI/4) * 16, y + Math.sin(a * Math.PI/4) * 16, 10, 18, a * Math.PI/4, 0, Math.PI * 2);
        ctx.fillStyle = rare ? ['#f38181','#fce38a','#b8c1ec','#eebbc3','#81c784'][i%5] : '#f38181';
        ctx.globalAlpha = rare ? 1 : 0.8;
        ctx.fill();
    }
    // Center
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = rare ? '#fce38a' : '#fff';
    ctx.globalAlpha = 1;
    ctx.fill();
    // Wilted (if missed session)
    if (sessionHistory.length && streak < 3 && i % 5 === 0) {
        ctx.beginPath();
        ctx.arc(x, y + 18, 10, 0, Math.PI, true);
        ctx.strokeStyle = '#bdbdbd';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    ctx.restore();
}

function renderSessionHistory() {
    const list = document.getElementById('session-history-list');
    list.innerHTML = '';
    sessionHistory.slice().reverse().forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.date}: ${entry.count} session${entry.count > 1 ? 's' : ''}`;
        list.appendChild(li);
    });
}

drawGarden();
renderSessionHistory();
