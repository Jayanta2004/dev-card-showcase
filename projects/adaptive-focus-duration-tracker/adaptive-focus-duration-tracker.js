// adaptive-focus-duration-tracker.js

let sessions = JSON.parse(localStorage.getItem('adaptiveFocusSessions')) || [];
let currentSession = null;
let timerInterval = null;
let startTime = null;
let distractions = [];
let breaks = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeTracker();
    updateRecommendedDuration();
});

function initializeTracker() {
    displaySessions();
    updateStats();
    createChart();
}

function updateRecommendedDuration() {
    const recommended = calculateRecommendedDuration();
    document.getElementById('recommendedTime').textContent = formatTime(recommended * 60); // Convert to seconds for display
}

function calculateRecommendedDuration() {
    if (sessions.length === 0) return 25; // Default 25 minutes

    // Simple adaptive algorithm based on recent performance
    const recentSessions = sessions.slice(0, 10); // Last 10 sessions
    const completedSessions = recentSessions.filter(s => s.completed);

    if (completedSessions.length === 0) return 15; // Start shorter if no completions

    const avgDuration = completedSessions.reduce((sum, s) => sum + s.duration, 0) / completedSessions.length;
    const successRate = completedSessions.length / recentSessions.length;

    // Factors
    const energyLevel = parseInt(document.getElementById('energyLevel').value);
    const sleepHours = parseFloat(document.getElementById('sleepHours').value);
    const caffeineLevel = getCaffeineMultiplier(document.getElementById('caffeineIntake').value);

    // Base duration from historical data
    let recommended = avgDuration / 60; // Convert to minutes

    // Adjust based on success rate
    if (successRate > 0.8) {
        recommended *= 1.2; // Increase if high success rate
    } else if (successRate < 0.5) {
        recommended *= 0.8; // Decrease if low success rate
    }

    // Adjust based on current factors
    const factorMultiplier = (energyLevel / 7) * (sleepHours / 8) * caffeineLevel;
    recommended *= factorMultiplier;

    // Keep within reasonable bounds
    recommended = Math.max(5, Math.min(90, recommended));

    return Math.round(recommended);
}

function getCaffeineMultiplier(level) {
    const multipliers = {
        'none': 0.9,
        'low': 1.0,
        'moderate': 1.1,
        'high': 1.2
    };
    return multipliers[level] || 1.0;
}

function updateEnergyValue() {
    const value = document.getElementById('energyLevel').value;
    document.getElementById('energyValue').textContent = value;
    updateRecommendedDuration();
}

function startSession() {
    if (currentSession) return;

    const recommendedDuration = calculateRecommendedDuration() * 60; // Convert to seconds

    startTime = new Date();
    currentSession = {
        id: Date.now(),
        startTime: startTime.toISOString(),
        recommendedDuration: recommendedDuration,
        distractions: [],
        breaks: [],
        endTime: null,
        duration: 0,
        completed: false
    };
    distractions = [];
    breaks = [];

    document.getElementById('startBtn').disabled = true;
    document.getElementById('distractionBtn').disabled = false;
    document.getElementById('breakBtn').disabled = false;
    document.getElementById('endBtn').disabled = false;
    document.getElementById('distractionCount').textContent = '0';
    document.getElementById('breakCount').textContent = '0';

    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if (!startTime) return;

    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    document.getElementById('timerDisplay').textContent =
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    document.getElementById('currentDuration').textContent =
        `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`;

    // Check if session should end based on recommended duration
    if (elapsed >= currentSession.recommendedDuration) {
        // Auto-complete if within 10% of recommended time
        const completionThreshold = currentSession.recommendedDuration * 0.1;
        if (Math.abs(elapsed - currentSession.recommendedDuration) <= completionThreshold) {
            endSession(true);
        }
    }
}

function logDistraction() {
    if (!currentSession) return;

    const reason = prompt('What distracted you?');
    if (reason) {
        const distraction = {
            time: new Date().toISOString(),
            reason: reason
        };
        distractions.push(distraction);
        currentSession.distractions.push(distraction);
        document.getElementById('distractionCount').textContent = distractions.length;
    }
}

function takeBreak() {
    if (!currentSession) return;

    const breakDuration = prompt('How long is this break? (minutes)', '5');
    if (breakDuration && !isNaN(breakDuration)) {
        const breakInfo = {
            time: new Date().toISOString(),
            duration: parseInt(breakDuration)
        };
        breaks.push(breakInfo);
        currentSession.breaks.push(breakInfo);
        document.getElementById('breakCount').textContent = breaks.length;
    }
}

function endSession(autoComplete = false) {
    if (!currentSession) return;

    clearInterval(timerInterval);
    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 1000); // Duration in seconds

    currentSession.endTime = endTime.toISOString();
    currentSession.duration = duration;
    currentSession.completed = autoComplete || (duration >= currentSession.recommendedDuration * 0.8); // Consider completed if 80% of recommended time

    sessions.unshift(currentSession);
    saveSessions();
    displaySessions();
    updateStats();
    updateChart();
    updateRecommendedDuration();

    // Reset UI
    document.getElementById('startBtn').disabled = false;
    document.getElementById('distractionBtn').disabled = true;
    document.getElementById('breakBtn').disabled = true;
    document.getElementById('endBtn').disabled = true;
    document.getElementById('timerDisplay').textContent = '00:00:00';
    document.getElementById('currentDuration').textContent = '0:00';

    currentSession = null;
    startTime = null;

    const status = currentSession.completed ? 'completed' : 'ended early';
    showNotification(`Focus session ${status}!`, 'success');
}

function saveSessions() {
    localStorage.setItem('adaptiveFocusSessions', JSON.stringify(sessions));
}

function displaySessions() {
    const historyDiv = document.getElementById('sessionsHistory');
    historyDiv.innerHTML = '';

    if (sessions.length === 0) {
        historyDiv.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No focus sessions logged yet. Start your first session above!</p>';
        return;
    }

    sessions.slice(0, 20).forEach(session => {
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'session-item';

        const date = new Date(session.startTime);
        const duration = Math.floor(session.duration / 60);
        const successClass = session.completed ? 'completed' : 'interrupted';
        const successText = session.completed ? 'Completed' : 'Interrupted';

        sessionDiv.innerHTML = `
            <h4>${date.toLocaleDateString()}</h4>
            <div class="session-meta">
                <span class="session-duration">${duration} min</span>
                <span class="session-success ${successClass}">${successText}</span>
            </div>
            <div class="session-details">
                <div>Distractions: ${session.distractions.length}</div>
                <div>Breaks: ${session.breaks.length}</div>
                <div>Recommended: ${Math.floor(session.recommendedDuration / 60)} min</div>
            </div>
        `;

        historyDiv.appendChild(sessionDiv);
    });
}

function updateStats() {
    if (sessions.length === 0) {
        document.getElementById('avgSession').textContent = '0 min';
        document.getElementById('longestSession').textContent = '0 min';
        document.getElementById('successRate').textContent = '0%';
        document.getElementById('totalSessions').textContent = '0';
        return;
    }

    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const avgDuration = Math.floor(totalDuration / sessions.length / 60);
    document.getElementById('avgSession').textContent = `${avgDuration} min`;

    const longestDuration = Math.max(...sessions.map(s => s.duration));
    document.getElementById('longestSession').textContent = `${Math.floor(longestDuration / 60)} min`;

    const completedSessions = sessions.filter(s => s.completed).length;
    const successRate = Math.round((completedSessions / sessions.length) * 100);
    document.getElementById('successRate').textContent = `${successRate}%`;

    document.getElementById('totalSessions').textContent = sessions.length;
}

function createChart() {
    const ctx = document.getElementById('focusChart').getContext('2d');

    // Prepare data for chart (last 20 sessions)
    const recentSessions = sessions.slice(0, 20).reverse();
    const labels = recentSessions.map((s, i) => `Session ${recentSessions.length - i}`);
    const durations = recentSessions.map(s => Math.floor(s.duration / 60)); // Convert to minutes
    const recommended = recentSessions.map(s => Math.floor(s.recommendedDuration / 60));
    const completed = recentSessions.map(s => s.completed ? 1 : 0);

    const focusChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Actual Duration (min)',
                data: durations,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }, {
                label: 'Recommended Duration (min)',
                data: recommended,
                borderColor: '#FF9800',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 5
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

function updateChart() {
    // Chart updates automatically when data changes
    // This function can be expanded if needed
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Update recommended duration when factors change
document.getElementById('energyLevel').addEventListener('input', updateRecommendedDuration);
document.getElementById('sleepHours').addEventListener('input', updateRecommendedDuration);
document.getElementById('caffeineIntake').addEventListener('change', updateRecommendedDuration);