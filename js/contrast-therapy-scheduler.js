// Contrast Therapy Scheduler JavaScript

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
let sessionConfig = {
    hotDuration: 180,
    coldDuration: 60,
    cycles: 3,
    transitionTime: 10
};
let currentSession = null;
let isRunning = false;
let isPaused = false;

const phases = ['hot', 'transition', 'cold', 'transition'];

function initTimer() {
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');

    startBtn.addEventListener('click', startSession);
    pauseBtn.addEventListener('click', pauseSession);
    stopBtn.addEventListener('click', stopSession);
}

function startSession() {
    if (isRunning && !isPaused) return;

    if (!currentSession) {
        // Start new session
        currentSession = {
            startTime: new Date(),
            phases: [],
            currentPhase: 0,
            currentCycle: 1,
            totalCycles: sessionConfig.cycles,
            phaseStartTime: new Date(),
            pausedTime: 0
        };
    }

    isRunning = true;
    isPaused = false;

    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('stopBtn').disabled = false;

    updatePhaseDisplay();
    timerInterval = setInterval(updateTimer, 100);
}

function pauseSession() {
    if (!isRunning) return;

    isPaused = true;
    clearInterval(timerInterval);

    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('startBtn').innerHTML = '<i data-lucide="play"></i> Resume';
    lucide.createIcons();
}

function stopSession() {
    if (!isRunning && !currentSession) return;

    isRunning = false;
    isPaused = false;
    clearInterval(timerInterval);

    if (currentSession) {
        currentSession.endTime = new Date();
        saveSession(currentSession);
        loadSessions();
        updateDashboard();
    }

    currentSession = null;

    resetTimerDisplay();
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('startBtn').innerHTML = '<i data-lucide="play"></i> Start Session';
    lucide.createIcons();
}

function updateTimer() {
    if (!currentSession || isPaused) return;

    const now = new Date();
    const phaseElapsed = Math.floor((now - currentSession.phaseStartTime - currentSession.pausedTime) / 1000);
    const currentPhaseType = getCurrentPhaseType();
    const phaseDuration = getPhaseDuration(currentPhaseType);

    if (phaseElapsed >= phaseDuration) {
        // Phase complete
        currentSession.phases.push({
            type: currentPhaseType,
            duration: phaseDuration,
            startTime: currentSession.phaseStartTime
        });

        // Move to next phase
        currentSession.currentPhase++;
        currentSession.phaseStartTime = new Date();
        currentSession.pausedTime = 0;

        // Check if cycle complete
        if (currentSession.currentPhase >= phases.length) {
            currentSession.currentPhase = 0;
            currentSession.currentCycle++;
        }

        // Check if session complete
        if (currentSession.currentCycle > currentSession.totalCycles) {
            stopSession();
            return;
        }

        updatePhaseDisplay();
    }

    const remaining = phaseDuration - phaseElapsed;
    document.getElementById('timerDisplay').textContent = formatTime(remaining);

    // Update progress bar
    const progress = (phaseElapsed / phaseDuration) * 100;
    updateProgressBar(progress);
}

function getCurrentPhaseType() {
    return phases[currentSession.currentPhase % phases.length];
}

function getPhaseDuration(phaseType) {
    switch (phaseType) {
        case 'hot': return sessionConfig.hotDuration;
        case 'cold': return sessionConfig.coldDuration;
        case 'transition': return sessionConfig.transitionTime;
        default: return 0;
    }
}

function updatePhaseDisplay() {
    if (!currentSession) return;

    const phaseType = getCurrentPhaseType();
    const timerCircle = document.querySelector('.timer-circle');
    const phaseIndicator = document.getElementById('phaseIndicator');
    const currentPhaseEl = document.getElementById('currentPhase');
    const currentCycleEl = document.getElementById('currentCycle');

    timerCircle.className = 'timer-circle ' + phaseType + '-phase';

    phaseIndicator.textContent = phaseType.charAt(0).toUpperCase() + phaseType.slice(1);
    currentPhaseEl.textContent = phaseType.charAt(0).toUpperCase() + phaseType.slice(1);
    currentCycleEl.textContent = `${currentSession.currentCycle}/${currentSession.totalCycles}`;
}

function updateProgressBar(progress) {
    let progressBar = document.querySelector('.progress-bar');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.innerHTML = '<div class="progress-fill"></div>';
        document.querySelector('.timer-display').appendChild(progressBar);
    }
    progressBar.querySelector('.progress-fill').style.width = progress + '%';
}

function resetTimerDisplay() {
    document.getElementById('timerDisplay').textContent = '00:00';
    document.getElementById('phaseIndicator').textContent = 'Ready';
    document.getElementById('currentPhase').textContent = 'None';
    document.getElementById('currentCycle').textContent = '0/0';
    document.querySelector('.timer-circle').className = 'timer-circle';

    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.remove();
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

        sessionConfig = {
            hotDuration: parseInt(document.getElementById('hotDuration').value),
            coldDuration: parseInt(document.getElementById('coldDuration').value),
            cycles: parseInt(document.getElementById('cycles').value),
            transitionTime: parseInt(document.getElementById('transitionTime').value)
        };

        // Update timer display with first phase duration
        document.getElementById('timerDisplay').textContent = formatTime(sessionConfig.hotDuration);
        document.getElementById('currentCycle').textContent = `0/${sessionConfig.cycles}`;
    });
}

// Data management
function saveSession(session) {
    const sessions = getSessions();
    sessions.push(session);
    localStorage.setItem('ctsSessions', JSON.stringify(sessions));
}

function getSessions() {
    const sessions = localStorage.getItem('ctsSessions');
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

    const totalSessions = sessions.length;
    const totalTime = sessions.reduce((sum, s) => sum + (new Date(s.endTime) - new Date(s.startTime)) / 1000 / 60, 0);
    const avgSession = totalTime / totalSessions;

    // Calculate streak (consecutive days with sessions)
    const dates = sessions.map(s => new Date(s.startTime).toDateString());
    const uniqueDates = [...new Set(dates)].sort();
    let streak = 0;
    const today = new Date().toDateString();

    for (let i = uniqueDates.length - 1; i >= 0; i--) {
        const date = new Date(uniqueDates[i]);
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - (uniqueDates.length - 1 - i));

        if (date.toDateString() === expectedDate.toDateString()) {
            streak++;
        } else {
            break;
        }
    }

    document.getElementById('totalSessions').textContent = totalSessions;
    document.getElementById('totalTime').textContent = Math.round(totalTime) + 'm';
    document.getElementById('avgSession').textContent = Math.round(avgSession) + 'm';
    document.getElementById('streak').textContent = streak;
}

// Charts
function initCharts() {
    // Simple chart showing sessions over time
    // For now, just placeholder
}

function updateChart(sessions) {
    // Implement chart update if needed
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
        filteredSessions = sessions.filter(s => new Date(s.startTime) >= weekAgo);
    } else if (period === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filteredSessions = sessions.filter(s => new Date(s.startTime) >= monthAgo);
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
    sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    historyList.innerHTML = sessions.map(session => {
        const duration = Math.round((new Date(session.endTime) - new Date(session.startTime)) / 1000 / 60);
        const hotPhases = session.phases.filter(p => p.type === 'hot').length;
        const coldPhases = session.phases.filter(p => p.type === 'cold').length;

        return `
            <div class="history-item">
                <div class="history-item-header">
                    <span class="history-date">${new Date(session.startTime).toLocaleDateString()}</span>
                    <span class="history-duration">${duration} min</span>
                </div>
                <div class="history-details">
                    Cycles: ${session.totalCycles} | Hot: ${hotPhases} | Cold: ${coldPhases}
                </div>
            </div>
        `;
    }).join('');
}

// Insights
function initInsights() {
    // Insights are updated when sessions are loaded
}

function updateInsights(sessions) {
    if (sessions.length === 0) return;

    // Consistency Check
    const recentSessions = sessions.slice(-7); // Last 7 sessions
    const consistency = recentSessions.length >= 5 ? 'Good' : recentSessions.length >= 3 ? 'Fair' : 'Needs Improvement';

    document.getElementById('consistencyCheck').innerHTML = `
        <p>Your recent consistency is <strong>${consistency}</strong>. Aim for 4-5 sessions per week for optimal results.</p>
    `;

    // Optimal Timing
    const hours = sessions.map(s => new Date(s.startTime).getHours());
    const avgHour = hours.reduce((a, b) => a + b, 0) / hours.length;
    const timeOfDay = avgHour < 12 ? 'morning' : avgHour < 18 ? 'afternoon' : 'evening';

    document.getElementById('optimalTiming').innerHTML = `
        <p>You tend to do therapy in the <strong>${timeOfDay}</strong>. Consider maintaining this timing for better routine establishment.</p>
    `;

    // Health Benefits
    const totalCycles = sessions.reduce((sum, s) => sum + s.totalCycles, 0);
    const benefits = totalCycles > 20 ? 'Significant' : totalCycles > 10 ? 'Moderate' : 'Building';

    document.getElementById('healthBenefits').innerHTML = `
        <p>Based on your ${totalCycles} completed cycles, you're experiencing <strong>${benefits}</strong> health benefits from contrast therapy.</p>
    `;

    // Tips
    const tips = [
        'Stay hydrated before, during, and after sessions',
        'Breathe deeply and stay relaxed during cold phases',
        'Gradually increase duration as you adapt',
        'Combine with proper nutrition for best results',
        'Track how you feel to optimize timing'
    ];

    document.getElementById('tips').innerHTML = `
        <h4>Recovery Tips</h4>
        <ul>
            ${tips.map(tip => `<li>${tip}</li>`).join('')}
        </ul>
    `;
}