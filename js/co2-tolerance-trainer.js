// CO₂ Tolerance Trainer JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initApp();
});

function initApp() {
    // Load navbar
    loadNavbar();

    // Initialize components
    initTimer();
    initForm();
    initCharts();
    initHistory();
    initInsights();

    // Load existing data
    loadSessions();
    updateDashboard();
}

function loadNavbar() {
    fetch('../navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
            // Re-initialize Lucide icons for navbar
            lucide.createIcons();
        });
}

// Timer functionality
let timerInterval;
let startTime;
let isRunning = false;

function initTimer() {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const timerDisplay = document.getElementById('timerDisplay');

    startBtn.addEventListener('click', startTimer);
    stopBtn.addEventListener('click', stopTimer);

    function startTimer() {
        if (isRunning) return;

        isRunning = true;
        startTime = Date.now();
        startBtn.disabled = true;
        stopBtn.disabled = false;

        timerInterval = setInterval(updateTimer, 100);
    }

    function stopTimer() {
        if (!isRunning) return;

        isRunning = false;
        clearInterval(timerInterval);
        const duration = Math.floor((Date.now() - startTime) / 1000);

        startBtn.disabled = false;
        stopBtn.disabled = true;

        // Auto-fill the form with the duration
        document.getElementById('holdDuration').value = duration;
        document.getElementById('sessionDate').valueAsDate = new Date();

        // Update current session display
        document.getElementById('currentSession').textContent = formatTime(duration);
    }

    function updateTimer() {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        timerDisplay.textContent = formatTime(elapsed);

        // Update progress circle (visual feedback)
        const progress = (elapsed % 60) / 60 * 360;
        document.querySelector('.timer-circle').style.setProperty('--progress', `${progress}deg`);
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Form handling
function initForm() {
    const form = document.getElementById('sessionForm');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const session = {
            id: Date.now(),
            date: document.getElementById('sessionDate').value,
            duration: parseInt(document.getElementById('holdDuration').value),
            type: document.getElementById('sessionType').value,
            preparation: document.getElementById('preparation').value,
            comfortLevel: parseInt(document.getElementById('comfortLevel').value),
            notes: document.getElementById('notes').value,
            timestamp: new Date().toISOString()
        };

        saveSession(session);
        form.reset();
        document.getElementById('sessionDate').valueAsDate = new Date();

        // Reset timer display
        document.getElementById('timerDisplay').textContent = '00:00';
        document.getElementById('currentSession').textContent = '--';

        // Update UI
        loadSessions();
        updateDashboard();
    });
}

// Data management
function saveSession(session) {
    const sessions = getSessions();
    sessions.push(session);
    localStorage.setItem('co2Sessions', JSON.stringify(sessions));
}

function getSessions() {
    const sessions = localStorage.getItem('co2Sessions');
    return sessions ? JSON.parse(sessions) : [];
}

function loadSessions() {
    const sessions = getSessions();
    updateHistory(sessions);
    updateInsights(sessions);
}

// Dashboard updates
function updateDashboard() {
    const sessions = getSessions();

    if (sessions.length === 0) return;

    // Calculate metrics
    const durations = sessions.map(s => s.duration);
    const avgHold = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    const bestHold = Math.max(...durations);

    document.getElementById('avgHold').textContent = formatTime(avgHold);
    document.getElementById('bestHold').textContent = formatTime(bestHold);
    document.getElementById('totalSessions').textContent = sessions.length;

    // Update personal best in timer section
    document.getElementById('personalBest').textContent = formatTime(bestHold);

    // Calculate improvement (compare first 5 vs last 5 sessions)
    if (sessions.length >= 10) {
        const firstFive = sessions.slice(0, 5).map(s => s.duration);
        const lastFive = sessions.slice(-5).map(s => s.duration);
        const firstAvg = firstFive.reduce((a, b) => a + b, 0) / 5;
        const lastAvg = lastFive.reduce((a, b) => a + b, 0) / 5;
        const improvement = Math.round(((lastAvg - firstAvg) / firstAvg) * 100);
        document.getElementById('improvement').textContent = `${improvement > 0 ? '+' : ''}${improvement}%`;
    }
}

// Charts
function initCharts() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    window.progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Hold Duration (seconds)',
                data: [],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Duration (seconds)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateChart(sessions) {
    // Sort sessions by date
    sessions.sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sessions.map(s => new Date(s.date).toLocaleDateString());
    const data = sessions.map(s => s.duration);

    window.progressChart.data.labels = labels;
    window.progressChart.data.datasets[0].data = data;
    window.progressChart.update();
}

// History
function initHistory() {
    document.getElementById('viewWeek').addEventListener('click', () => filterHistory('week'));
    document.getElementById('viewMonth').addEventListener('click', () => filterHistory('month'));
    document.getElementById('viewAll').addEventListener('click', () => filterHistory('all'));
}

function filterHistory(period) {
    // Update active button
    document.querySelectorAll('.history-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${period.charAt(0).toUpperCase() + period.slice(1)}`).classList.add('active');

    const sessions = getSessions();
    let filteredSessions = sessions;

    if (period === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredSessions = sessions.filter(s => new Date(s.date) >= weekAgo);
    } else if (period === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filteredSessions = sessions.filter(s => new Date(s.date) >= monthAgo);
    }

    updateHistory(filteredSessions);
}

function updateHistory(sessions) {
    const historyList = document.getElementById('sessionHistory');

    if (sessions.length === 0) {
        historyList.innerHTML = '<p>No sessions recorded yet.</p>';
        return;
    }

    // Sort by date descending
    sessions.sort((a, b) => new Date(b.date) - new Date(a.date));

    historyList.innerHTML = sessions.map(session => `
        <div class="history-item">
            <div class="history-item-header">
                <span class="history-date">${new Date(session.date).toLocaleDateString()}</span>
                <span class="history-duration">${formatTime(session.duration)}</span>
            </div>
            <div class="history-details">
                Type: ${session.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} |
                Comfort: ${session.comfortLevel}/10
                ${session.notes ? `<br>Notes: ${session.notes}` : ''}
            </div>
        </div>
    `).join('');
}

// Insights
function initInsights() {
    // Insights are updated when sessions are loaded
}

function updateInsights(sessions) {
    if (sessions.length === 0) return;

    // CO₂ Tolerance Level
    const avgDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
    let toleranceLevel = 'Beginner';
    if (avgDuration > 120) toleranceLevel = 'Advanced';
    else if (avgDuration > 60) toleranceLevel = 'Intermediate';

    document.getElementById('toleranceLevel').innerHTML = `
        <p>Your average hold time of ${formatTime(Math.round(avgDuration))} indicates a <strong>${toleranceLevel}</strong> level of CO₂ tolerance.</p>
    `;

    // Progress Trends
    const recentSessions = sessions.slice(-10);
    const trend = recentSessions.length > 1 ?
        (recentSessions[recentSessions.length - 1].duration - recentSessions[0].duration) / recentSessions[0].duration * 100 : 0;

    document.getElementById('progressTrends').innerHTML = `
        <p>${trend > 0 ? 'Improving' : trend < 0 ? 'Declining' : 'Stable'} trend in recent sessions (${trend > 0 ? '+' : ''}${trend.toFixed(1)}% change).</p>
    `;

    // Training Recommendations
    let recommendation = 'Continue regular practice with gradual increases in hold time.';
    if (avgDuration < 30) recommendation = 'Focus on building basic breath hold capacity with daily short sessions.';
    else if (avgDuration > 90) recommendation = 'Consider advanced techniques like dynamic apnea or CO₂ tables.';

    document.getElementById('trainingRecommendations').innerHTML = `<p>${recommendation}</p>`;

    // Tips
    const tips = [
        'Always warm up with deep breathing before holds',
        'Practice in a safe environment with someone nearby',
        'Stay relaxed during holds - tension reduces capacity',
        'Track your progress regularly to stay motivated',
        'Combine with physical training for better results'
    ];

    document.getElementById('tips').innerHTML = `
        <h4>Training Tips</h4>
        <ul>
            ${tips.map(tip => `<li>${tip}</li>`).join('')}
        </ul>
    `;

    // Update chart
    updateChart(sessions);
}