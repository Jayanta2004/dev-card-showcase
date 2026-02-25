// Micro-Break Optimization Tracker JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeTimer();
    initializeRatingSystem();
    loadData();
    initializeCharts();
    updateDisplay();

    // Event listeners
    document.getElementById('startTimer').addEventListener('click', startTimer);
    document.getElementById('pauseTimer').addEventListener('click', pauseTimer);
    document.getElementById('resetTimer').addEventListener('click', resetTimer);
    document.getElementById('submitRating').addEventListener('click', submitRating);

    document.getElementById('viewDaily').addEventListener('click', () => switchChartView('daily'));
    document.getElementById('viewWeekly').addEventListener('click', () => switchChartView('weekly'));
    document.getElementById('viewMonthly').addEventListener('click', () => switchChartView('monthly'));

    // Auto-save form values
    document.getElementById('breakDuration').addEventListener('change', saveSettings);
    document.getElementById('workDuration').addEventListener('change', saveSettings);
});

let timerInterval = null;
let timerRunning = false;
let timerPaused = false;
let startTime = null;
let pausedTime = 0;
let currentBreakDuration = 5 * 60; // 5 minutes in seconds
let correlationChart = null;
let currentChartView = 'daily';

// Timer Functions
function initializeTimer() {
    loadSettings();
    updateTimerDisplay();
}

function loadSettings() {
    const settings = localStorage.getItem('breakTimerSettings');
    if (settings) {
        const { breakDuration, workDuration } = JSON.parse(settings);
        document.getElementById('breakDuration').value = breakDuration || 5;
        document.getElementById('workDuration').value = workDuration || 25;
        currentBreakDuration = (breakDuration || 5) * 60;
    }
}

function saveSettings() {
    const breakDuration = parseInt(document.getElementById('breakDuration').value);
    const workDuration = parseInt(document.getElementById('workDuration').value);
    localStorage.setItem('breakTimerSettings', JSON.stringify({ breakDuration, workDuration }));
    currentBreakDuration = breakDuration * 60;
    updateTimerDisplay();
}

function startTimer() {
    if (timerRunning && !timerPaused) return;

    const breakDuration = parseInt(document.getElementById('breakDuration').value) * 60;

    if (timerPaused) {
        // Resume from paused state
        startTime = Date.now() - pausedTime;
        timerPaused = false;
    } else {
        // Start new timer
        startTime = Date.now();
        pausedTime = 0;
        currentBreakDuration = breakDuration;
    }

    timerRunning = true;
    updateTimerButtons();
    updateTimerStatus('Break in progress...');

    timerInterval = setInterval(updateTimer, 100);
}

function pauseTimer() {
    if (!timerRunning) return;

    timerPaused = true;
    pausedTime = Date.now() - startTime;
    clearInterval(timerInterval);
    updateTimerButtons();
    updateTimerStatus('Break paused');
}

function resetTimer() {
    timerRunning = false;
    timerPaused = false;
    clearInterval(timerInterval);
    startTime = null;
    pausedTime = 0;
    updateTimerDisplay();
    updateTimerButtons();
    updateTimerStatus('Ready to start');
}

function updateTimer() {
    if (!timerRunning || timerPaused) return;

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, currentBreakDuration - elapsed);

    updateTimerDisplay(remaining);

    if (remaining === 0) {
        completeBreak();
    }
}

function updateTimerDisplay(remaining = currentBreakDuration) {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    document.getElementById('timerTime').textContent = timeString;

    // Update circular progress
    const progress = ((currentBreakDuration - remaining) / currentBreakDuration) * 100;
    document.getElementById('timerProgress').style.background = `conic-gradient(var(--accent-color, #3b82f6) 0% ${progress}%, #e2e8f0 ${progress}% 100%)`;
}

function updateTimerButtons() {
    const startBtn = document.getElementById('startTimer');
    const pauseBtn = document.getElementById('pauseTimer');
    const resetBtn = document.getElementById('resetTimer');

    if (timerRunning && !timerPaused) {
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        resetBtn.disabled = false;
        startBtn.textContent = 'Running...';
        pauseBtn.textContent = 'Pause';
    } else if (timerPaused) {
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        resetBtn.disabled = false;
        startBtn.textContent = 'Resume';
        pauseBtn.textContent = 'Paused';
    } else {
        startBtn.disabled = false;
        pauseBtn.disabled = false;
        resetBtn.disabled = false;
        startBtn.textContent = 'Start Break';
        pauseBtn.textContent = 'Pause';
    }
}

function updateTimerStatus(status) {
    document.getElementById('timerStatus').textContent = status;
}

function completeBreak() {
    resetTimer();
    updateTimerStatus('Break complete! Rate your session.');

    // Show rating prompt
    document.getElementById('ratingPrompt').style.display = 'block';
    document.getElementById('ratingComplete').style.display = 'none';
    document.getElementById('submitRating').disabled = false;

    // Play notification sound (if supported)
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Break Complete!', {
            body: 'Time to rate your break session.',
            icon: '../assets/favicon/favicon.ico'
        });
    }
}

// Rating System
function initializeRatingSystem() {
    // Productivity stars
    const stars = document.querySelectorAll('#productivityStars .star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            setProductivityRating(rating);
        });
    });

    // Fatigue buttons
    const fatigueBtns = document.querySelectorAll('.fatigue-btn');
    fatigueBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            setFatigueLevel(this.dataset.fatigue);
        });
    });
}

let currentProductivityRating = 0;
let currentFatigueLevel = null;

function setProductivityRating(rating) {
    currentProductivityRating = rating;
    const stars = document.querySelectorAll('#productivityStars .star');

    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });

    checkRatingComplete();
}

function setFatigueLevel(level) {
    currentFatigueLevel = level;
    const buttons = document.querySelectorAll('.fatigue-btn');

    buttons.forEach(btn => {
        if (btn.dataset.fatigue === level) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    checkRatingComplete();
}

function checkRatingComplete() {
    const submitBtn = document.getElementById('submitRating');
    submitBtn.disabled = !(currentProductivityRating > 0 && currentFatigueLevel);
}

function submitRating() {
    const breakDuration = parseInt(document.getElementById('breakDuration').value);
    const notes = document.getElementById('breakNotes').value.trim();

    const sessionData = {
        timestamp: new Date().toISOString(),
        breakDuration: breakDuration,
        productivityRating: currentProductivityRating,
        fatigueLevel: currentFatigueLevel,
        notes: notes,
        date: new Date().toDateString()
    };

    saveSession(sessionData);

    // Reset rating system
    resetRatingSystem();

    // Show completion message
    document.getElementById('ratingPrompt').style.display = 'none';
    document.getElementById('ratingComplete').style.display = 'block';

    // Update displays
    updateDisplay();
    updateChart();

    setTimeout(() => {
        document.getElementById('ratingComplete').style.display = 'none';
        updateTimerStatus('Ready for next break');
    }, 3000);

    showNotification('Break session saved successfully!', 'success');
}

function resetRatingSystem() {
    currentProductivityRating = 0;
    currentFatigueLevel = null;

    // Reset stars
    document.querySelectorAll('#productivityStars .star').forEach(star => {
        star.classList.remove('active');
    });

    // Reset fatigue buttons
    document.querySelectorAll('.fatigue-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Reset notes
    document.getElementById('breakNotes').value = '';

    // Disable submit button
    document.getElementById('submitRating').disabled = true;
}

// Data Management
function saveSession(sessionData) {
    const sessions = getStoredSessions();
    sessions.push(sessionData);
    localStorage.setItem('breakOptimizationSessions', JSON.stringify(sessions));
}

function getStoredSessions() {
    const stored = localStorage.getItem('breakOptimizationSessions');
    return stored ? JSON.parse(stored) : [];
}

// Analytics and Display
function updateDisplay() {
    const sessions = getStoredSessions();
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(s => s.date === today);

    // Update analytics
    document.getElementById('todayBreaks').textContent = todaySessions.length;

    if (todaySessions.length > 0) {
        const avgProductivity = todaySessions.reduce((sum, s) => sum + s.productivityRating, 0) / todaySessions.length;
        document.getElementById('avgProductivity').textContent = avgProductivity.toFixed(1) + '/5';

        const totalBreakTime = todaySessions.reduce((sum, s) => sum + s.breakDuration, 0);
        document.getElementById('totalBreakTime').textContent = totalBreakTime + 'm';

        // Calculate fatigue trend
        const recentSessions = todaySessions.slice(-5);
        if (recentSessions.length >= 2) {
            const fatigueLevels = { 'low': 1, 'moderate': 2, 'high': 3 };
            const fatigueScores = recentSessions.map(s => fatigueLevels[s.fatigueLevel]);
            const trend = fatigueScores[fatigueScores.length - 1] - fatigueScores[0];

            if (trend > 0) {
                document.getElementById('fatigueTrend').textContent = 'Increasing';
                document.getElementById('fatigueTrend').style.color = '#e53e3e';
            } else if (trend < 0) {
                document.getElementById('fatigueTrend').textContent = 'Decreasing';
                document.getElementById('fatigueTrend').style.color = '#38a169';
            } else {
                document.getElementById('fatigueTrend').textContent = 'Stable';
                document.getElementById('fatigueTrend').style.color = '#718096';
            }
        }
    }

    // Update recommendations
    updateRecommendations(sessions);

    // Update history table
    updateHistoryTable(sessions);
}

function updateRecommendations(sessions) {
    if (sessions.length < 3) {
        document.getElementById('optimalBreakDuration').textContent = 'Need more data for recommendations';
        document.getElementById('breakFrequency').textContent = 'Continue tracking breaks';
        document.getElementById('breakTypeSuggestions').textContent = 'More sessions needed for insights';
        return;
    }

    // Analyze optimal break duration
    const durationGroups = {};
    sessions.forEach(session => {
        if (!durationGroups[session.breakDuration]) {
            durationGroups[session.breakDuration] = [];
        }
        durationGroups[session.breakDuration].push(session.productivityRating);
    });

    let bestDuration = 5;
    let bestAvg = 0;

    Object.keys(durationGroups).forEach(duration => {
        const avg = durationGroups[duration].reduce((a, b) => a + b, 0) / durationGroups[duration].length;
        if (avg > bestAvg) {
            bestAvg = avg;
            bestDuration = parseInt(duration);
        }
    });

    document.getElementById('optimalBreakDuration').textContent = `${bestDuration} minutes (avg rating: ${bestAvg.toFixed(1)}/5)`;

    // Break frequency recommendation
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(s => s.date === today);
    const recommendedFrequency = todaySessions.length < 4 ? 'Consider taking more breaks' : 'Good break frequency maintained';

    document.getElementById('breakFrequency').textContent = recommendedFrequency;

    // Break type suggestions based on fatigue
    const recentFatigue = sessions.slice(-5).map(s => s.fatigueLevel);
    const highFatigueCount = recentFatigue.filter(f => f === 'high').length;

    let suggestion = 'Mix of active and passive breaks recommended';
    if (highFatigueCount >= 3) {
        suggestion = 'Try more active breaks (walking, stretching)';
    } else if (recentFatigue.every(f => f === 'low')) {
        suggestion = 'Great fatigue management! Continue current approach';
    }

    document.getElementById('breakTypeSuggestions').textContent = suggestion;
}

// Chart Functions
function initializeCharts() {
    const ctx = document.getElementById('correlationChart').getContext('2d');
    correlationChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Productivity vs Fatigue',
                data: [],
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const fatigue = context.parsed.x;
                            const productivity = context.parsed.y;
                            return `Fatigue: ${fatigue}, Productivity: ${productivity}/5`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Fatigue Level (1=Low, 2=Moderate, 3=High)'
                    },
                    min: 0.5,
                    max: 3.5,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            switch(value) {
                                case 1: return 'Low';
                                case 2: return 'Moderate';
                                case 3: return 'High';
                                default: return '';
                            }
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Productivity Rating'
                    },
                    min: 0,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    updateChart();
}

function updateChart() {
    if (!correlationChart) return;

    const sessions = getStoredSessions();
    let filteredSessions = sessions;

    // Filter based on current view
    const now = new Date();
    if (currentChartView === 'daily') {
        const today = now.toDateString();
        filteredSessions = sessions.filter(s => s.date === today);
    } else if (currentChartView === 'weekly') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredSessions = sessions.filter(s => new Date(s.timestamp) >= weekAgo);
    } else if (currentChartView === 'monthly') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredSessions = sessions.filter(s => new Date(s.timestamp) >= monthAgo);
    }

    const fatigueLevels = { 'low': 1, 'moderate': 2, 'high': 3 };
    const chartData = filteredSessions.map(session => ({
        x: fatigueLevels[session.fatigueLevel],
        y: session.productivityRating
    }));

    correlationChart.data.datasets[0].data = chartData;
    correlationChart.update();
}

function switchChartView(view) {
    currentChartView = view;

    // Update button states
    document.getElementById('viewDaily').classList.toggle('active', view === 'daily');
    document.getElementById('viewWeekly').classList.toggle('active', view === 'weekly');
    document.getElementById('viewMonthly').classList.toggle('active', view === 'monthly');

    updateChart();
}

function updateHistoryTable(sessions) {
    const tbody = document.getElementById('historyBody');

    if (sessions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No break sessions logged yet.</td></tr>';
        return;
    }

    tbody.innerHTML = sessions.slice(-10).reverse().map(session => {
        const time = new Date(session.timestamp).toLocaleTimeString();
        const fatigueDisplay = session.fatigueLevel.charAt(0).toUpperCase() + session.fatigueLevel.slice(1);
        return `
            <tr>
                <td>${time}</td>
                <td>${session.breakDuration}m</td>
                <td>${session.productivityRating}/5</td>
                <td>${fatigueDisplay}</td>
                <td>${session.notes || '-'}</td>
            </tr>
        `;
    }).join('');
}

function loadData() {
    // Load any existing data on page load
    updateDisplay();
}

function showNotification(message, type = 'info') {
    // Simple notification - you could enhance this with a proper notification system
    alert(message);
}

// Request notification permission on first load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}