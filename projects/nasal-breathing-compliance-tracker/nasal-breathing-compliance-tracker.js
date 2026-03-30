// nasal-breathing-compliance-tracker.js

let sessions = JSON.parse(localStorage.getItem('nasalBreathingSessions')) || [];
let currentSession = null;
let timerInterval = null;
let startTime = null;
let mouthBreathingIncidents = 0;
let currentSessionType = 'workout';

function setSessionType(type) {
    currentSessionType = type;
    document.querySelectorAll('.session-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
}

function startSession() {
    if (currentSession) return;

    startTime = new Date();
    mouthBreathingIncidents = 0;
    currentSession = {
        id: Date.now(),
        type: currentSessionType,
        startTime: startTime.toISOString(),
        mouthBreathingIncidents: 0,
        endTime: null,
        duration: 0,
        notes: '',
        compliance: 100
    };

    document.getElementById('startBtn').disabled = true;
    document.getElementById('mouthBreathBtn').disabled = false;
    document.getElementById('endBtn').disabled = false;
    document.getElementById('mouthBreathCount').textContent = '0';
    document.getElementById('currentCompliance').textContent = '100%';

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
}

function logMouthBreathing() {
    if (!currentSession) return;

    mouthBreathingIncidents++;
    currentSession.mouthBreathingIncidents = mouthBreathingIncidents;

    // Calculate compliance (assuming 1 incident per 5 minutes reduces compliance)
    const elapsedMinutes = Math.floor((new Date() - startTime) / 60000);
    const expectedIncidents = Math.max(0, elapsedMinutes / 5); // Allow 1 incident per 5 minutes
    const compliance = Math.max(0, Math.min(100, 100 - (mouthBreathingIncidents - expectedIncidents) * 10));

    currentSession.compliance = Math.round(compliance);

    document.getElementById('mouthBreathCount').textContent = mouthBreathingIncidents;
    document.getElementById('currentCompliance').textContent = `${currentSession.compliance}%`;
}

function endSession() {
    if (!currentSession) return;

    clearInterval(timerInterval);
    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 1000); // duration in seconds

    currentSession.endTime = endTime.toISOString();
    currentSession.duration = duration;

    // Final compliance calculation
    const elapsedMinutes = duration / 60;
    const expectedIncidents = Math.max(0, elapsedMinutes / 5);
    const compliance = Math.max(0, Math.min(100, 100 - (mouthBreathingIncidents - expectedIncidents) * 10));
    currentSession.compliance = Math.round(compliance);

    sessions.push(currentSession);
    saveSessions();

    // Reset UI
    document.getElementById('startBtn').disabled = false;
    document.getElementById('mouthBreathBtn').disabled = true;
    document.getElementById('endBtn').disabled = true;
    document.getElementById('timerDisplay').textContent = '00:00:00';
    document.getElementById('currentDuration').textContent = '0:00';
    document.getElementById('mouthBreathCount').textContent = '0';
    document.getElementById('currentCompliance').textContent = '100%';

    currentSession = null;
    mouthBreathingIncidents = 0;

    updateStats();
    updateChart();
    displayHistory();
}

function logManualSession() {
    const type = document.getElementById('sessionType').value;
    const duration = parseInt(document.getElementById('sessionDuration').value);
    const incidents = parseInt(document.getElementById('mouthBreathIncidents').value) || 0;
    const notes = document.getElementById('notes').value;

    if (!duration || duration <= 0) {
        alert('Please enter a valid duration');
        return;
    }

    // Calculate compliance
    const expectedIncidents = Math.max(0, duration / 5); // 1 per 5 minutes
    const compliance = Math.max(0, Math.min(100, 100 - (incidents - expectedIncidents) * 10));

    const session = {
        id: Date.now(),
        type: type,
        startTime: new Date(Date.now() - duration * 60000).toISOString(),
        endTime: new Date().toISOString(),
        mouthBreathingIncidents: incidents,
        duration: duration * 60, // convert to seconds
        notes: notes,
        compliance: Math.round(compliance),
        manual: true
    };

    sessions.push(session);
    saveSessions();

    // Clear form
    document.getElementById('sessionDuration').value = '';
    document.getElementById('mouthBreathIncidents').value = '';
    document.getElementById('notes').value = '';

    updateStats();
    updateChart();
    displayHistory();
}

function saveSessions() {
    localStorage.setItem('nasalBreathingSessions', JSON.stringify(sessions));
}

function updateStats() {
    if (sessions.length === 0) {
        document.getElementById('overallCompliance').textContent = '0%';
        document.getElementById('workoutCompliance').textContent = '0%';
        document.getElementById('sleepCompliance').textContent = '0%';
        document.getElementById('totalSessions').textContent = '0';
        return;
    }

    const overallCompliance = sessions.reduce((sum, s) => sum + s.compliance, 0) / sessions.length;
    const workoutSessions = sessions.filter(s => s.type === 'workout');
    const sleepSessions = sessions.filter(s => s.type === 'sleep');

    const workoutCompliance = workoutSessions.length > 0 ?
        workoutSessions.reduce((sum, s) => sum + s.compliance, 0) / workoutSessions.length : 0;
    const sleepCompliance = sleepSessions.length > 0 ?
        sleepSessions.reduce((sum, s) => sum + s.compliance, 0) / sleepSessions.length : 0;

    document.getElementById('overallCompliance').textContent = `${Math.round(overallCompliance)}%`;
    document.getElementById('workoutCompliance').textContent = `${Math.round(workoutCompliance)}%`;
    document.getElementById('sleepCompliance').textContent = `${Math.round(sleepCompliance)}%`;
    document.getElementById('totalSessions').textContent = sessions.length;
}

function updateChart() {
    const ctx = document.getElementById('complianceChart').getContext('2d');

    // Sort sessions by date
    const sortedSessions = sessions.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    const labels = sortedSessions.map(s => new Date(s.startTime).toLocaleDateString());
    const complianceData = sortedSessions.map(s => s.compliance);

    if (window.complianceChart) {
        window.complianceChart.destroy();
    }

    window.complianceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Compliance %',
                data: complianceData,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function displayHistory(filter = 'all') {
    const historyDiv = document.getElementById('sessionHistory');
    let filteredSessions = sessions;

    if (filter !== 'all') {
        filteredSessions = sessions.filter(s => s.type === filter);
    }

    // Sort by most recent first
    filteredSessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    historyDiv.innerHTML = '';

    if (filteredSessions.length === 0) {
        historyDiv.innerHTML = '<p style="text-align: center; color: #666;">No sessions found</p>';
        return;
    }

    filteredSessions.forEach(session => {
        const entry = document.createElement('div');
        entry.className = 'session-entry';

        const date = new Date(session.startTime).toLocaleDateString();
        const time = new Date(session.startTime).toLocaleTimeString();
        const duration = Math.floor(session.duration / 60);
        const complianceClass = session.compliance >= 80 ? '' : 'low';

        entry.innerHTML = `
            <button class="delete-btn" onclick="deleteSession(${session.id})">×</button>
            <h4>${session.type.charAt(0).toUpperCase() + session.type.slice(1)} - ${date} ${time}</h4>
            <p><strong>Duration:</strong> ${duration} minutes</p>
            <p><strong>Mouth Breathing Incidents:</strong> ${session.mouthBreathingIncidents}</p>
            <p><strong>Compliance:</strong> <span class="compliance-score ${complianceClass}">${session.compliance}%</span></p>
            ${session.notes ? `<p><strong>Notes:</strong> ${session.notes}</p>` : ''}
            ${session.manual ? '<p><em>Manual entry</em></p>' : ''}
        `;

        historyDiv.appendChild(entry);
    });
}

function filterHistory(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    displayHistory(filter);
}

function deleteSession(id) {
    if (confirm('Are you sure you want to delete this session?')) {
        sessions = sessions.filter(s => s.id !== id);
        saveSessions();
        updateStats();
        updateChart();
        displayHistory();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    updateChart();
    displayHistory();
});