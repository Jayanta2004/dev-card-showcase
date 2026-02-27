// Focus Session Quality Analyzer JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initializeCharts();
    updateDisplay();

    // Event listeners
    document.getElementById('startBtn').addEventListener('click', startTimer);
    document.getElementById('pauseBtn').addEventListener('click', pauseTimer);
    document.getElementById('resetBtn').addEventListener('click', resetTimer);
    document.getElementById('sessionDuration').addEventListener('change', updateTimerDisplay);
    document.getElementById('qualityRating').addEventListener('input', updateRatingValue);
    document.getElementById('saveRatingBtn').addEventListener('click', saveSessionRating);
    document.getElementById('viewWeek').addEventListener('click', () => switchChartView('week'));
    document.getElementById('viewMonth').addEventListener('click', () => switchChartView('month'));
});

let timerInterval;
let timeLeft;
let isRunning = false;
let isPaused = false;
let sessionStartTime;
let sessionDuration;

function updateTimerDisplay() {
    const duration = parseInt(document.getElementById('sessionDuration').value);
    document.getElementById('minutes').textContent = duration.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = ':00';
    updateProgressCircle(1); // Full circle
}

function startTimer() {
    if (isRunning && !isPaused) return;

    const duration = parseInt(document.getElementById('sessionDuration').value) * 60; // Convert to seconds
    sessionDuration = duration;

    if (!isRunning) {
        timeLeft = duration;
        sessionStartTime = new Date();
    }

    isRunning = true;
    isPaused = false;

    document.getElementById('startBtn').textContent = 'Resume Session';
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('resetBtn').disabled = false;

    document.querySelector('.timer-container').classList.add('timer-active');
    document.querySelector('.timer-container').classList.remove('timer-paused');

    timerInterval = setInterval(updateTimer, 1000);
}

function pauseTimer() {
    isPaused = true;
    clearInterval(timerInterval);

    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;

    document.querySelector('.timer-container').classList.remove('timer-active');
    document.querySelector('.timer-container').classList.add('timer-paused');
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    isPaused = false;

    updateTimerDisplay();

    document.getElementById('startBtn').textContent = 'Start Focus Session';
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('resetBtn').disabled = true;

    document.querySelector('.timer-container').classList.remove('timer-active', 'timer-paused');
}

function updateTimer() {
    timeLeft--;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = ':' + seconds.toString().padStart(2, '0');

    const progress = timeLeft / sessionDuration;
    updateProgressCircle(progress);

    if (timeLeft <= 0) {
        completeSession();
    }
}

function updateProgressCircle(progress) {
    const circle = document.getElementById('progressCircle');
    const circumference = 565.48; // 2 * π * 90
    const offset = circumference * (1 - progress);
    circle.style.strokeDashoffset = offset;
}

function completeSession() {
    clearInterval(timerInterval);
    isRunning = false;

    document.querySelector('.timer-container').classList.remove('timer-active');
    document.querySelector('.timer-container').classList.add('timer-completed');

    // Show rating form
    document.getElementById('ratingContainer').style.display = 'none';
    document.getElementById('qualityForm').style.display = 'block';

    showNotification('Focus session completed! Please rate your session quality.', 'success');
}

function updateRatingValue() {
    const rating = document.getElementById('qualityRating').value;
    document.getElementById('ratingValue').textContent = rating;
}

function saveSessionRating() {
    const qualityRating = parseInt(document.getElementById('qualityRating').value);
    const distractionCount = parseInt(document.getElementById('distractionCount').value) || 0;
    const notes = document.getElementById('sessionNotes').value.trim();

    const sessionData = {
        date: new Date().toISOString(),
        duration: sessionDuration / 60, // Convert back to minutes
        qualityRating: qualityRating,
        distractionCount: distractionCount,
        notes: notes,
        efficiency: calculateEfficiency(qualityRating, distractionCount, sessionDuration / 60)
    };

    saveSession(sessionData);
    updateDisplay();

    // Reset UI
    document.getElementById('qualityForm').style.display = 'none';
    document.getElementById('ratingContainer').style.display = 'block';
    document.getElementById('qualityRating').value = 7;
    document.getElementById('ratingValue').textContent = '7';
    document.getElementById('distractionCount').value = 0;
    document.getElementById('sessionNotes').value = '';

    resetTimer();

    showNotification('Session saved successfully!', 'success');
}

function calculateEfficiency(quality, distractions, duration) {
    // Simple efficiency calculation: quality rating minus penalty for distractions
    const distractionPenalty = distractions * 0.5; // 0.5 points per distraction
    const baseEfficiency = (quality / 10) * 100; // Convert to percentage
    const finalEfficiency = Math.max(0, baseEfficiency - distractionPenalty);
    return Math.round(finalEfficiency);
}

function saveSession(session) {
    const data = getData();
    data.sessions.push(session);
    localStorage.setItem('focusSessionData', JSON.stringify(data));
}

function getData() {
    const data = localStorage.getItem('focusSessionData');
    return data ? JSON.parse(data) : { sessions: [] };
}

function updateDisplay() {
    updateStats();
    updateCharts();
    updateHistoryTable();
}

function updateStats() {
    const data = getData();
    const sessions = data.sessions;
    const today = new Date().toDateString();

    // Today's sessions
    const todaySessions = sessions.filter(s => new Date(s.date).toDateString() === today);
    const todayFocusTime = todaySessions.reduce((sum, s) => sum + s.duration, 0);

    document.getElementById('todaySessions').textContent = todaySessions.length;
    document.getElementById('todayFocusTime').textContent = todayFocusTime + ' min';

    // Average quality
    if (sessions.length > 0) {
        const avgQuality = sessions.reduce((sum, s) => sum + s.qualityRating, 0) / sessions.length;
        document.getElementById('avgQuality').textContent = avgQuality.toFixed(1) + '/10';
    }

    // Focus efficiency
    if (sessions.length > 0) {
        const avgEfficiency = sessions.reduce((sum, s) => sum + s.efficiency, 0) / sessions.length;
        document.getElementById('focusEfficiency').textContent = avgEfficiency.toFixed(0) + '%';
    }

    // Weekly average
    const last7Days = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return sessionDate >= weekAgo;
    });

    if (last7Days.length > 0) {
        const weeklyAvg = last7Days.reduce((sum, s) => sum + s.qualityRating, 0) / last7Days.length;
        document.getElementById('weeklyAverage').textContent = weeklyAvg.toFixed(1) + '/10';
    }

    // Best streak (consecutive days with sessions)
    let streak = 0;
    let currentStreak = 0;
    let lastDate = null;

    const sortedSessions = sessions.sort((a, b) => new Date(a.date) - new Date(b.date));

    for (const session of sortedSessions) {
        const sessionDate = new Date(session.date).toDateString();

        if (lastDate === null) {
            currentStreak = 1;
        } else {
            const diffTime = Math.abs(new Date(sessionDate) - new Date(lastDate));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentStreak++;
            } else {
                streak = Math.max(streak, currentStreak);
                currentStreak = 1;
            }
        }

        lastDate = sessionDate;
    }

    streak = Math.max(streak, currentStreak);
    document.getElementById('bestStreak').textContent = streak + ' days';
}

function initializeCharts() {
    const qualityCtx = document.getElementById('qualityChart').getContext('2d');
    const distractionCtx = document.getElementById('distractionChart').getContext('2d');

    window.qualityChart = new Chart(qualityCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Session Quality',
                data: [],
                borderColor: '#4299e1',
                backgroundColor: 'rgba(66, 153, 225, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Focus Efficiency (%)',
                data: [],
                borderColor: '#48bb78',
                backgroundColor: 'rgba(72, 187, 120, 0.1)',
                tension: 0.4,
                yAxisID: 'efficiency'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 1,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Quality Rating (1-10)'
                    }
                },
                efficiency: {
                    min: 0,
                    max: 100,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Efficiency (%)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Session'
                    }
                }
            }
        }
    });

    window.distractionChart = new Chart(distractionCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Distractions per Session',
                data: [],
                backgroundColor: '#ed8936',
                borderColor: '#dd6b20',
                borderWidth: 1
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
                        text: 'Number of Distractions'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Session'
                    }
                }
            }
        }
    });
}

function switchChartView(view) {
    document.getElementById('viewWeek').classList.toggle('active', view === 'week');
    document.getElementById('viewMonth').classList.toggle('active', view === 'month');
    updateCharts(view);
}

function updateCharts(view = 'week') {
    const data = getData();
    const sessions = data.sessions;
    const days = view === 'week' ? 7 : 30;

    const recent = sessions.slice(-days);
    const labels = recent.map((_, i) => `Session ${sessions.length - days + i + 1}`);
    const qualities = recent.map(s => s.qualityRating);
    const efficiencies = recent.map(s => s.efficiency);
    const distractions = recent.map(s => s.distractionCount);

    window.qualityChart.data.labels = labels;
    window.qualityChart.data.datasets[0].data = qualities;
    window.qualityChart.data.datasets[1].data = efficiencies;
    window.qualityChart.update();

    window.distractionChart.data.labels = labels;
    window.distractionChart.data.datasets[0].data = distractions;
    window.distractionChart.update();
}

function updateHistoryTable() {
    const data = getData();
    const sessions = data.sessions;
    const tbody = document.getElementById('historyBody');

    if (sessions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No sessions completed yet.</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    sessions.slice().reverse().forEach(session => {
        const row = document.createElement('tr');
        const date = new Date(session.date).toLocaleDateString();

        row.innerHTML = `
            <td>${date}</td>
            <td>${session.duration} min</td>
            <td>${session.qualityRating}/10</td>
            <td>${session.distractionCount}</td>
            <td>${session.efficiency}%</td>
            <td>${session.notes || '-'}</td>
        `;

        tbody.appendChild(row);
    });
}

function loadData() {
    updateTimerDisplay();
}

function showNotification(message, type) {
    alert(message);
}