let sessions = JSON.parse(localStorage.getItem('yogaData')) || [];

const tips = [
    "Breathe deeply and focus on your breath during each pose.",
    "Listen to your body and don't push beyond your limits.",
    "Practice consistency over intensity for long-term benefits.",
    "Warm up before starting your yoga session.",
    "Stay hydrated and practice in a comfortable environment.",
    "Incorporate meditation to enhance your practice.",
    "Try different styles of yoga to find what suits you best.",
    "Use props like blocks or straps to modify poses as needed.",
    "Practice mindfulness and be present in each moment.",
    "Rest in child's pose whenever you need a break."
];

function logSession() {
    const poseName = document.getElementById('poseName').value.trim();
    const duration = parseInt(document.getElementById('duration').value);
    const flexibility = parseInt(document.getElementById('flexibility').value);
    const date = document.getElementById('sessionDate').value;

    if (!poseName || !duration || !flexibility || !date) {
        alert('Please fill in all fields');
        return;
    }

    if (flexibility < 1 || flexibility > 10) {
        alert('Flexibility rating must be between 1 and 10');
        return;
    }

    const session = { poseName, duration, flexibility, date };

    sessions.push(session);
    localStorage.setItem('yogaData', JSON.stringify(sessions));

    updateStats();
    updateHistory();
    drawChart();

    // Clear inputs
    document.getElementById('poseName').value = '';
    document.getElementById('duration').value = '';
    document.getElementById('flexibility').value = '';
    document.getElementById('sessionDate').value = '';
}

function updateStats() {
    const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    const avgDuration = sessions.length ? totalTime / sessions.length : 0;
    const avgFlexibility = sessions.length ? sessions.reduce((sum, session) => sum + session.flexibility, 0) / sessions.length : 0;

    document.getElementById('totalTime').textContent = totalTime;
    document.getElementById('avgDuration').textContent = avgDuration.toFixed(1);
    document.getElementById('avgFlexibility').textContent = avgFlexibility.toFixed(1);
    document.getElementById('sessionCount').textContent = sessions.length;
}

function drawChart() {
    const ctx = document.getElementById('flexibilityChart').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (sessions.length === 0) return;

    const recentSessions = sessions.slice(-10); // Last 10 sessions
    const flexibilities = recentSessions.map(session => session.flexibility);

    const chartWidth = 350;
    const chartHeight = 150;
    const padding = 20;

    // Draw axes
    ctx.strokeStyle = '#6b9b7b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, chartHeight + padding);
    ctx.lineTo(chartWidth + padding, chartHeight + padding);
    ctx.stroke();

    // Draw grid lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 10; i++) {
        const y = padding + (chartHeight / 10) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(chartWidth + padding, y);
        ctx.stroke();
        if (i % 2 === 0) {
            ctx.fillStyle = '#666';
            ctx.fillText(10 - i, 5, y + 3);
        }
    }

    // Draw line
    ctx.strokeStyle = '#6b9b7b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    flexibilities.forEach((flex, index) => {
        const x = padding + (chartWidth / (recentSessions.length - 1 || 1)) * index;
        const y = padding + chartHeight - (flex / 10) * chartHeight;
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();

    // Draw points
    ctx.fillStyle = '#a8e6cf';
    flexibilities.forEach((flex, index) => {
        const x = padding + (chartWidth / (recentSessions.length - 1 || 1)) * index;
        const y = padding + chartHeight - (flex / 10) * chartHeight;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });

    // Labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    recentSessions.forEach((session, index) => {
        if (index % 2 === 0) {
            const x = padding + (chartWidth / (recentSessions.length - 1 || 1)) * index;
            ctx.fillText(session.date.slice(-5), x - 10, chartHeight + padding + 15);
        }
    });
}

function updateHistory() {
    const historyEl = document.getElementById('sessionHistory');
    historyEl.innerHTML = '';

    sessions.slice(-5).reverse().forEach(session => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${session.date}: ${session.poseName} for ${session.duration}min</span>
            <span>Flexibility: ${session.flexibility}/10</span>
        `;
        historyEl.appendChild(li);
    });
}

function getNewTip() {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    document.getElementById('tip').textContent = randomTip;
}

// Initialize
updateStats();
updateHistory();
drawChart();
getNewTip();