// Focus Drift Analyzer JavaScript

let focusSessions = JSON.parse(localStorage.getItem('focusSessions')) || [];
let currentSession = null;
let timerInterval = null;
let startTime = null;
let drifts = [];

// Focus tips
const FOCUS_TIPS = [
    {
        title: 'Minimize Distractions',
        text: 'Put your phone in another room and use website blockers during focus sessions.'
    },
    {
        title: 'Set Clear Goals',
        text: 'Define what you want to accomplish before starting a session.'
    },
    {
        title: 'Find Your Peak Hours',
        text: 'Track when you\'re most focused and schedule important work during those times.'
    },
    {
        title: 'Practice Mindfulness',
        text: 'When you notice your mind wandering, gently bring your attention back without judgment.'
    },
    {
        title: 'Take Breaks',
        text: 'Short breaks can actually improve focus by preventing mental fatigue.'
    },
    {
        title: 'Optimize Environment',
        text: 'Create a dedicated workspace that minimizes interruptions and promotes concentration.'
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
    // Event listeners
    document.getElementById('startBtn').addEventListener('click', startSession);
    document.getElementById('driftBtn').addEventListener('click', showDriftForm);
    document.getElementById('pauseBtn').addEventListener('click', pauseSession);
    document.getElementById('stopBtn').addEventListener('click', stopSession);
    document.getElementById('driftForm').addEventListener('submit', logDrift);

    // History controls
    document.getElementById('viewWeek').addEventListener('click', () => filterHistory('week'));
    document.getElementById('viewMonth').addEventListener('click', () => filterHistory('month'));
    document.getElementById('viewAll').addEventListener('click', () => filterHistory('all'));
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
            drifts: [],
            paused: false,
            totalPaused: 0
        };
        drifts = [];
        startTime = Date.now();
    } else if (currentSession.paused) {
        // Resume session
        currentSession.paused = false;
        currentSession.totalPaused += Date.now() - currentSession.pauseStart;
        startTime = Date.now() - (currentSession.elapsedBeforePause || 0);
    }

    document.getElementById('startBtn').disabled = true;
    document.getElementById('driftBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('stopBtn').disabled = false;

    timerInterval = setInterval(updateTimer, 1000);
}

function pauseSession() {
    if (currentSession && !currentSession.paused) {
        currentSession.paused = true;
        currentSession.pauseStart = Date.now();
        currentSession.elapsedBeforePause = Date.now() - startTime - (currentSession.totalPaused || 0);

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

        // Calculate focus score (lower drifts = higher score)
        const focusScore = calculateFocusScore(durationMinutes, drifts.length);

        const session = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            duration: durationMinutes,
            drifts: drifts.length,
            focusScore: focusScore,
            driftDetails: drifts,
            timestamp: new Date().toISOString()
        };

        focusSessions.push(session);
        localStorage.setItem('focusSessions', JSON.stringify(focusSessions));

        // Reset
        currentSession = null;
        startTime = null;
        drifts = [];

        document.getElementById('timerDisplay').textContent = '00:00:00';
        document.getElementById('currentSessionTime').textContent = '00:00:00';
        document.getElementById('driftCount').textContent = '0';
        document.getElementById('focusScore').textContent = '--';

        document.getElementById('startBtn').disabled = false;
        document.getElementById('driftBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('stopBtn').disabled = true;

        updateDisplay();

        // Show success message
        alert(`Session completed! Duration: ${durationMinutes} minutes, Drifts: ${drifts.length}, Focus Score: ${focusScore}/100`);
    }
}

function calculateFocusScore(duration, driftCount) {
    // Base score starts at 100
    let score = 100;

    // Penalize for drifts (more drifts = lower score)
    const driftPenalty = driftCount * 5;
    score -= driftPenalty;

    // Bonus for longer sessions (up to 20 points for sessions over 60 minutes)
    const durationBonus = Math.min(duration / 3, 20);
    score += durationBonus;

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
}

function updateTimer() {
    if (startTime && !currentSession.paused) {
        const elapsed = Date.now() - startTime - (currentSession.totalPaused || 0);
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);

        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        document.getElementById('timerDisplay').textContent = timeString;
        document.getElementById('currentSessionTime').textContent = timeString;
    }
}

function showDriftForm() {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    document.getElementById('driftTime').value = timeString;

    // Scroll to drift form
    document.getElementById('driftForm').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('driftType').focus();
}

function logDrift(e) {
    e.preventDefault();

    const drift = {
        time: document.getElementById('driftTime').value,
        type: document.getElementById('driftType').value,
        notes: document.getElementById('driftNotes').value,
        timestamp: Date.now()
    };

    drifts.push(drift);
    currentSession.drifts.push(drift);

    document.getElementById('driftCount').textContent = drifts.length;

    // Update focus score in real-time
    const elapsed = Date.now() - startTime - (currentSession.totalPaused || 0);
    const durationMinutes = Math.round(elapsed / 60000);
    const focusScore = calculateFocusScore(durationMinutes, drifts.length);
    document.getElementById('focusScore').textContent = focusScore;

    // Reset form
    document.getElementById('driftForm').reset();

    // Show confirmation
    alert('Drift logged! Keep focusing.');
}

function updateDisplay() {
    updateMetrics();
    updateHistory();
    updateChart();
    updateInsights();
}

function updateMetrics() {
    const totalSessions = focusSessions.length;
    document.getElementById('totalSessions').textContent = totalSessions;

    if (totalSessions > 0) {
        const totalDrifts = focusSessions.reduce((sum, s) => sum + s.drifts, 0);
        const avgDrifts = (totalDrifts / totalSessions).toFixed(1);
        document.getElementById('avgDrifts').textContent = avgDrifts;

        const avgFocusScore = (focusSessions.reduce((sum, s) => sum + s.focusScore, 0) / totalSessions).toFixed(1);
        document.getElementById('avgFocusScore').textContent = avgFocusScore;

        const totalTime = focusSessions.reduce((sum, s) => sum + s.duration, 0);
        const totalHours = Math.round(totalTime / 60);
        document.getElementById('totalFocusTime').textContent = `${totalHours} hrs`;
    }
}

function filterHistory(period) {
    // Update button states
    document.querySelectorAll('.history-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${period.charAt(0).toUpperCase() + period.slice(1)}`).classList.add('active');

    updateHistory(period);
}

function updateHistory(period = 'week') {
    const now = new Date();
    let filteredSessions = focusSessions;

    if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredSessions = focusSessions.filter(s => new Date(s.date) >= weekAgo);
    } else if (period === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filteredSessions = focusSessions.filter(s => new Date(s.date) >= monthAgo);
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
        const focusScoreClass = session.focusScore >= 80 ? 'high' : session.focusScore >= 60 ? 'medium' : 'low';

        item.innerHTML = `
            <div class="history-item-content">
                <div class="history-item-header">
                    <span class="history-date">${date}</span>
                    <span class="history-duration">${session.duration} min</span>
                </div>
                <div class="history-details">
                    <span>Drifts: <strong class="history-drifts">${session.drifts}</strong></span> |
                    <span>Focus Score: <strong class="${focusScoreClass}">${session.focusScore}/100</strong></span>
                </div>
            </div>
            <div class="history-actions">
                <button class="btn-small btn-secondary" onclick="viewSessionDetails(${session.id})">Details</button>
                <button class="btn-small btn-secondary" onclick="deleteSession(${session.id})">Delete</button>
            </div>
        `;

        historyList.appendChild(item);
    });
}

function viewSessionDetails(sessionId) {
    const session = focusSessions.find(s => s.id === sessionId);
    if (!session) return;

    let details = `Session Details:\n\n`;
    details += `Date: ${session.date}\n`;
    details += `Duration: ${session.duration} minutes\n`;
    details += `Drifts: ${session.drifts}\n`;
    details += `Focus Score: ${session.focusScore}/100\n\n`;

    if (session.driftDetails && session.driftDetails.length > 0) {
        details += `Drift Details:\n`;
        session.driftDetails.forEach((drift, index) => {
            details += `${index + 1}. ${drift.time} - ${drift.type}`;
            if (drift.notes) details += ` (${drift.notes})`;
            details += '\n';
        });
    }

    alert(details);
}

function deleteSession(id) {
    if (confirm('Are you sure you want to delete this session?')) {
        focusSessions = focusSessions.filter(s => s.id !== id);
        localStorage.setItem('focusSessions', JSON.stringify(focusSessions));
        updateDisplay();
    }
}

function updateChart() {
    const canvas = document.getElementById('focusChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, width, height);

    if (focusSessions.length < 2) {
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Complete more sessions to see focus trends', width / 2, height / 2);
        return;
    }

    // Simple line chart for focus scores over time
    const sessions = focusSessions.slice(-20); // Last 20 sessions
    const maxScore = 100;
    const minScore = 0;

    ctx.strokeStyle = 'var(--primary-color)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    sessions.forEach((session, index) => {
        const x = (index / (sessions.length - 1)) * (width - 40) + 20;
        const y = height - 20 - (session.focusScore / maxScore) * (height - 40);

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
    // Peak focus times
    const hourCounts = {};
    focusSessions.forEach(session => {
        const hour = new Date(session.timestamp).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHour = Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b, null);
    const peakElement = document.getElementById('peakFocusTimes');
    if (peakHour) {
        const hour12 = peakHour > 12 ? peakHour - 12 : peakHour;
        const ampm = peakHour >= 12 ? 'PM' : 'AM';
        peakElement.innerHTML = `<p>You tend to have better focus sessions around ${hour12}:00 ${ampm}.</p>`;
    }

    // Common distractions
    const distractionCounts = {};
    focusSessions.forEach(session => {
        if (session.driftDetails) {
            session.driftDetails.forEach(drift => {
                distractionCounts[drift.type] = (distractionCounts[drift.type] || 0) + 1;
            });
        }
    });

    const mostCommon = Object.keys(distractionCounts).reduce((a, b) => distractionCounts[a] > distractionCounts[b] ? a : b, null);
    const commonElement = document.getElementById('commonDistractions');
    if (mostCommon) {
        commonElement.innerHTML = `<p>Your most common distraction is ${mostCommon.replace('-', ' ')}.</p>`;
    }

    // Focus improvement
    const recentSessions = focusSessions.slice(-5);
    const olderSessions = focusSessions.slice(-10, -5);

    const improvementElement = document.getElementById('focusImprovement');
    if (recentSessions.length >= 3 && olderSessions.length >= 3) {
        const recentAvg = recentSessions.reduce((sum, s) => sum + s.focusScore, 0) / recentSessions.length;
        const olderAvg = olderSessions.reduce((sum, s) => sum + s.focusScore, 0) / olderSessions.length;
        const improvement = recentAvg - olderAvg;

        if (improvement > 5) {
            improvementElement.innerHTML = `<p>Your focus is improving! Recent sessions show ${improvement.toFixed(1)} points higher scores.</p>`;
        } else if (improvement < -5) {
            improvementElement.innerHTML = `<p>Your focus scores have decreased recently. Consider reviewing your environment and habits.</p>`;
        } else {
            improvementElement.innerHTML = `<p>Your focus levels are stable. Keep up the good work!</p>`;
        }
    }
}

function renderTips() {
    const tipsContainer = document.getElementById('tips');
    tipsContainer.innerHTML = '';

    FOCUS_TIPS.forEach(tip => {
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