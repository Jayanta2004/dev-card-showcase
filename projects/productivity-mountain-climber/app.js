// Productivity Mountain Climber - Daily Goal Tracker
const canvas = document.getElementById('mountain-canvas');
const ctx = canvas.getContext('2d');
let climbHistory = JSON.parse(localStorage.getItem('climbHistory') || '[]');
let today = new Date().toLocaleDateString();
let climber = {
    y: 340,
    streak: 0,
    goal: ''
};

function saveClimbHistory() {
    localStorage.setItem('climbHistory', JSON.stringify(climbHistory));
}

function drawMountain() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Mountain
    ctx.beginPath();
    ctx.moveTo(100, 380);
    ctx.lineTo(400, 60);
    ctx.lineTo(700, 380);
    ctx.closePath();
    ctx.fillStyle = '#bdbdbd';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(400, 60);
    ctx.lineTo(500, 200);
    ctx.lineTo(600, 120);
    ctx.lineTo(700, 380);
    ctx.closePath();
    ctx.fillStyle = '#fffde4';
    ctx.globalAlpha = 0.5;
    ctx.fill();
    ctx.globalAlpha = 1;
    // Rewards (flags)
    for (let i = 1; i <= 5; i++) {
        if (climber.streak >= i * 3) {
            drawFlag(400 - i * 30, 60 + i * 50, i);
        }
    }
    // Climber
    let y = 340 - climber.streak * 30;
    y = Math.max(60, Math.min(340, y));
    ctx.save();
    ctx.translate(400, y);
    // Body
    ctx.beginPath();
    ctx.arc(0, -18, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#1976d2';
    ctx.fill();
    ctx.fillRect(-7, -6, 14, 28);
    // Arms
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.lineTo(-20, 18);
    ctx.moveTo(7, 0);
    ctx.lineTo(20, 18);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#1976d2';
    ctx.stroke();
    // Legs
    ctx.beginPath();
    ctx.moveTo(-4, 22);
    ctx.lineTo(-10, 38);
    ctx.moveTo(4, 22);
    ctx.lineTo(10, 38);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#8d6e63';
    ctx.stroke();
    ctx.restore();
    // Goal text
    ctx.font = 'bold 18px Segoe UI';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText(climber.goal ? `Today's Goal: ${climber.goal}` : '', 400, 390);
}

function drawFlag(x, y, i) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 30);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#388e3c';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y - 30);
    ctx.lineTo(x + 24, y - 22);
    ctx.lineTo(x, y - 14);
    ctx.closePath();
    ctx.fillStyle = ['#ffb74d','#4fc3f7','#e57373','#81c784','#ba68c8'][i%5];
    ctx.fill();
    ctx.restore();
}

function updateClimbStatus() {
    const status = document.getElementById('climb-status');
    if (climber.streak >= 15) status.textContent = '🏆 You reached the summit!';
    else if (climber.streak >= 9) status.textContent = 'Almost there! Keep going!';
    else if (climber.streak >= 5) status.textContent = 'Great progress!';
    else if (climber.streak > 0) status.textContent = 'Keep climbing!';
    else status.textContent = 'Start your climb by setting a goal!';
}

function renderHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = '';
    climbHistory.slice().reverse().forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.date}: ${entry.goal} (${entry.result})`;
        list.appendChild(li);
    });
}

document.getElementById('goal-form').onsubmit = function(e) {
    e.preventDefault();
    const goal = document.getElementById('goal-input').value.trim();
    if (!goal) return;
    climber.goal = goal;
    // Only one check-in per day
    if (climbHistory.length && climbHistory[climbHistory.length-1].date === today) {
        climbHistory[climbHistory.length-1].goal = goal;
    } else {
        climbHistory.push({ date: today, goal, result: 'pending' });
    }
    saveClimbHistory();
    drawMountain();
    updateClimbStatus();
    renderHistory();
    document.getElementById('goal-input').value = '';
};

// Mark goal as done or missed
canvas.addEventListener('dblclick', function() {
    if (!climber.goal) return;
    if (climbHistory.length && climbHistory[climbHistory.length-1].date === today) {
        if (climbHistory[climbHistory.length-1].result === 'done') return;
        climbHistory[climbHistory.length-1].result = 'done';
        climber.streak++;
    } else {
        climbHistory.push({ date: today, goal: climber.goal, result: 'done' });
        climber.streak++;
    }
    saveClimbHistory();
    drawMountain();
    updateClimbStatus();
    renderHistory();
});

// On page load, check for missed days
function updateStreak() {
    let lastDate = null;
    climber.streak = 0;
    for (let i = 0; i < climbHistory.length; i++) {
        if (climbHistory[i].result === 'done') {
            if (lastDate) {
                let prev = new Date(lastDate);
                let curr = new Date(climbHistory[i].date);
                let diff = (curr - prev) / (1000*60*60*24);
                if (diff > 1) climber.streak = 1;
                else climber.streak++;
            } else {
                climber.streak = 1;
            }
            lastDate = climbHistory[i].date;
        }
    }
    if (climbHistory.length && climbHistory[climbHistory.length-1].date !== today) {
        climber.streak = Math.max(0, climber.streak - 1);
    }
}

updateStreak();
drawMountain();
updateClimbStatus();
renderHistory();
