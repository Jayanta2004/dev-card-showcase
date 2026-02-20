// Creative Output Tracker JavaScript

let creativeSessions = JSON.parse(localStorage.getItem('creativeSessions')) || [];
let currentSession = null;
let timerInterval = null;
let startTime = null;
let pausedTime = 0;

// Output score descriptions
const OUTPUT_SCORES = {
    1: 'Minimal',
    2: 'Low',
    3: 'Below Average',
    4: 'Average',
    5: 'Moderate',
    6: 'Good',
    7: 'Strong',
    8: 'Very Good',
    9: 'Excellent',
    10: 'Outstanding'
};

// Creative tips
const CREATIVE_TIPS = [
    {
        title: 'Morning Sessions',
        text: 'Many creatives find early morning hours most productive when the mind is fresh.'
    },
    {
        title: 'Pomodoro Technique',
        text: 'Work for 25 minutes, then take a 5-minute break to maintain focus.'
    },
    {
        title: 'Environment Matters',
        text: 'Create a dedicated workspace that inspires creativity and minimizes distractions.'
    },
    {
        title: 'Track Patterns',
        text: 'Monitor when you produce your best work and schedule important tasks accordingly.'
    },
    {
        title: 'Quality over Quantity',
        text: 'Focus on meaningful output rather than just hours worked.'
    },
    {
        title: 'Rest and Recovery',
        text: 'Creative work requires mental energy - ensure adequate sleep and breaks.'
    }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadNavbar();
    updateDisplay();
    renderTips();
});

function initializeApp() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sessionDate').value = today;

    // Event listeners
    document.getElementById('startBtn').addEventListener('click', startSession);
    document.getElementById('pauseBtn').addEventListener('click', pauseSession);
    document.getElementById('stopBtn').addEventListener('click', stopSession);
    document.getElementById('sessionForm').addEventListener('submit', logSession);
    document.getElementById('outputScore').addEventListener('input', updateScoreDisplay);

    // History controls
    document.getElementById('viewWeek').addEventListener('click', () => filterHistory('week'));
    document.getElementById('viewMonth').addEventListener('click', () => filterHistory('month'));
    document.getElementById('viewAll').addEventListener('click', () => filterHistory('all'));

    // Initialize score display
    updateScoreDisplay();
}

function loadNavbar() {
    fetch('../navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
            // Re-initialize Lucide icons for navbar
            lucide.createIcons();
        })
        .catch(error => console.error('Error loading navbar:', error));
}

function startSession() {
    if (!currentSession) {
        currentSession = {
            startTime: Date.now(),
            paused: false,
            totalPaused: 0
        };
        startTime = Date.now();
        pausedTime = 0;
    } else if (currentSession.paused) {
        // Resume session
        currentSession.paused = false;
        currentSession.totalPaused += Date.now() - currentSession.pauseStart;
        startTime = Date.now() - (currentSession.elapsedBeforePause || 0);
    }

    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('stopBtn').disabled = false;

    timerInterval = setInterval(updateTimer, 1000);
}

function pauseSession() {
    if (currentSession && !currentSession.paused) {
        currentSession.paused = true;
        currentSession.pauseStart = Date.now();
        currentSession.elapsedBeforePause = Date.now() - startTime - pausedTime;

        clearInterval(timerInterval);
        timerInterval = null;

        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
    }
}

function stopSession() {
    if (currentSession) {
        clearInterval(timerInterval);
        timerInterval = null;

        const endTime = Date.now();
        const totalTime = endTime - currentSession.startTime - currentSession.totalPaused;
        const durationMinutes = Math.round(totalTime / 60000);

        // Auto-fill the form
        document.getElementById('sessionDuration').value = durationMinutes;

        // Reset timer
        currentSession = null;
        startTime = null;
        pausedTime = 0;

        document.getElementById('timerDisplay').textContent = '00:00:00';
        document.getElementById('currentSessionTime').textContent = '00:00:00';

        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('stopBtn').disabled = true;

        // Show success message
        alert('Session stopped! Please fill in the output score and details to log it.');
    }
}

function updateTimer() {
    if (startTime && !currentSession.paused) {
        const elapsed = Date.now() - startTime - pausedTime;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);

        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        document.getElementById('timerDisplay').textContent = timeString;
        document.getElementById('currentSessionTime').textContent = timeString;
    }
}

function updateScoreDisplay() {
    const score = document.getElementById('outputScore').value;
    document.getElementById('scoreValue').textContent = score;
    document.getElementById('scoreText').textContent = OUTPUT_SCORES[score];
}

function logSession(e) {
    e.preventDefault();

    const session = {
        id: Date.now(),
        date: document.getElementById('sessionDate').value,
        duration: parseInt(document.getElementById('sessionDuration').value),
        score: parseInt(document.getElementById('outputScore').value),
        type: document.getElementById('creativeType').value,
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString()
    };

    creativeSessions.push(session);
    localStorage.setItem('creativeSessions', JSON.stringify(creativeSessions));

    // Reset form
    document.getElementById('sessionForm').reset();
    document.getElementById('sessionDate').value = new Date().toISOString().split('T')[0];
    updateScoreDisplay();

    updateDisplay();

    // Show success message
    alert('Session logged successfully!');
}

function updateDisplay() {
    updateMetrics();
    updateHistory();
    updateChart();
    updateInsights();
}

function updateMetrics() {
    const totalSessions = creativeSessions.length;
    document.getElementById('totalSessions').textContent = totalSessions;

    if (totalSessions > 0) {
        const totalDuration = creativeSessions.reduce((sum, s) => sum + s.duration, 0);
        const avgDuration = Math.round(totalDuration / totalSessions);
        const avgScore = (creativeSessions.reduce((sum, s) => sum + s.score, 0) / totalSessions).toFixed(1);
        const totalHours = Math.round(totalDuration / 60);

        document.getElementById('avgDuration').textContent = `${avgDuration} min`;
        document.getElementById('avgScore').textContent = avgScore;
        document.getElementById('totalTime').textContent = `${totalHours} hrs`;
    }

    // Update today's total
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = creativeSessions.filter(s => s.date === today);
    const todayTotal = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    const todayHours = Math.floor(todayTotal / 60);
    const todayMinutes = todayTotal % 60;
    document.getElementById('totalTodayTime').textContent = `${todayHours.toString().padStart(2, '0')}:${todayMinutes.toString().padStart(2, '0')}:00`;
}

function filterHistory(period) {
    // Update button states
    document.querySelectorAll('.history-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${period.charAt(0).toUpperCase() + period.slice(1)}`).classList.add('active');

    updateHistory(period);
}

function updateHistory(period = 'week') {
    const now = new Date();
    let filteredSessions = creativeSessions;

    if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredSessions = creativeSessions.filter(s => new Date(s.date) >= weekAgo);
    } else if (period === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filteredSessions = creativeSessions.filter(s => new Date(s.date) >= monthAgo);
    }

    // Sort by date descending
    filteredSessions.sort((a, b) => new Date(b.date) - new Date(a.date));

    const historyList = document.getElementById('sessionHistory');
    historyList.innerHTML = '';

    if (filteredSessions.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No sessions found for this period.</p>';
        return;
    }

    filteredSessions.forEach(session => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const date = new Date(session.date).toLocaleDateString();
        const scoreText = OUTPUT_SCORES[session.score];

        item.innerHTML = `
            <div class="history-item-content">
                <div class="history-item-header">
                    <span class="history-date">${date}</span>
                    <span class="history-duration">${session.duration} min</span>
                </div>
                <div class="history-details">
                    <span>Type: ${session.type}</span> |
                    <span>Score: <strong class="history-score">${session.score}/10 (${scoreText})</strong></span>
                    ${session.notes ? `<br><em>${session.notes}</em>` : ''}
                </div>
            </div>
            <div class="history-actions">
                <button class="btn-small btn-secondary" onclick="deleteSession(${session.id})">Delete</button>
            </div>
        `;

        historyList.appendChild(item);
    });
}

function deleteSession(id) {
    if (confirm('Are you sure you want to delete this session?')) {
        creativeSessions = creativeSessions.filter(s => s.id !== id);
        localStorage.setItem('creativeSessions', JSON.stringify(creativeSessions));
        updateDisplay();
    }
}

function updateChart() {
    const canvas = document.getElementById('productivityChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, width, height);

    if (creativeSessions.length < 2) {
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Log more sessions to see trends', width / 2, height / 2);
        return;
    }

    // Simple line chart for duration over time
    const sessions = creativeSessions.slice(-20); // Last 20 sessions
    const maxDuration = Math.max(...sessions.map(s => s.duration));
    const minDate = new Date(Math.min(...sessions.map(s => new Date(s.date))));
    const maxDate = new Date(Math.max(...sessions.map(s => new Date(s.date))));

    ctx.strokeStyle = 'var(--primary-color)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    sessions.forEach((session, index) => {
        const x = (index / (sessions.length - 1)) * (width - 40) + 20;
        const y = height - 20 - (session.duration / maxDuration) * (height - 40);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        // Draw point
        ctx.fillStyle = 'var(--primary-color)';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
    });

    ctx.stroke();

    // Add labels
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Recent Sessions', width / 2, height - 5);
}

function updateInsights() {
    // Peak creativity time
    const hourCounts = {};
    creativeSessions.forEach(session => {
        const hour = new Date(session.timestamp).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHour = Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b, null);
    const peakElement = document.getElementById('peakCreativity');
    if (peakHour) {
        const hour12 = peakHour > 12 ? peakHour - 12 : peakHour;
        const ampm = peakHour >= 12 ? 'PM' : 'AM';
        peakElement.innerHTML = `<p>You tend to be most creative around ${hour12}:00 ${ampm}.</p>`;
    }

    // Output trends
    const recentSessions = creativeSessions.slice(-10);
    const avgRecent = recentSessions.length > 0 ? recentSessions.reduce((sum, s) => sum + s.score, 0) / recentSessions.length : 0;
    const avgAll = creativeSessions.length > 0 ? creativeSessions.reduce((sum, s) => sum + s.score, 0) / creativeSessions.length : 0;

    const trendElement = document.getElementById('outputTrends');
    if (recentSessions.length >= 5) {
        const trend = avgRecent > avgAll ? 'improving' : avgRecent < avgAll ? 'declining' : 'stable';
        trendElement.innerHTML = `<p>Your recent output quality is ${trend} compared to your overall average.</p>`;
    }

    // Break patterns (simplified)
    const breakElement = document.getElementById('breakPatterns');
    if (creativeSessions.length > 5) {
        const avgDuration = creativeSessions.reduce((sum, s) => sum + s.duration, 0) / creativeSessions.length;
        breakElement.innerHTML = `<p>Consider taking breaks every ${Math.round(avgDuration / 2)} minutes to maintain focus.</p>`;
    }
}

function renderTips() {
    const tipsContainer = document.getElementById('tips');
    tipsContainer.innerHTML = '';

    CREATIVE_TIPS.forEach(tip => {
        const tipElement = document.createElement('div');
        tipElement.className = 'tip-item';
        tipElement.innerHTML = `
            <div class="tip-icon">
                <i data-lucide="lightbulb"></i>
            </div>
            <div class="tip-content">
                <h4>${tip.title}</h4>
                <p>${tip.text}</p>
            </div>
        `;
        tipsContainer.appendChild(tipElement);
    });

    // Re-initialize icons
    lucide.createIcons();
}