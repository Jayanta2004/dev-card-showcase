// stabilizer-muscle-activation-index.js

let sessions = JSON.parse(localStorage.getItem('stabilizerSessions')) || [];
let activationChart = null;

document.addEventListener('DOMContentLoaded', function() {
    loadSessions();
    updateStats();
    setupFilter();
    initChart();

    document.getElementById('activationForm').addEventListener('submit', addSession);
    document.getElementById('clearFilter').addEventListener('click', clearFilter);
});

function updateActivationValue() {
    document.getElementById('activationValue').textContent = document.getElementById('activationLevel').value;
}

function addSession(e) {
    e.preventDefault();

    const session = {
        id: Date.now(),
        date: document.getElementById('sessionDate').value,
        exercise: document.getElementById('exercise').value.trim(),
        muscleGroup: document.getElementById('muscleGroup').value,
        activationLevel: parseInt(document.getElementById('activationLevel').value),
        duration: parseInt(document.getElementById('duration').value),
        sets: parseInt(document.getElementById('sets').value) || 1,
        reps: parseInt(document.getElementById('reps').value) || 0,
        notes: document.getElementById('notes').value.trim()
    };

    sessions.push(session);
    saveSessions();
    loadSessions();
    updateStats();
    updateChart();
    document.getElementById('activationForm').reset();
    document.getElementById('activationLevel').value = 5;
    updateActivationValue();
    document.getElementById('sessionDate').valueAsDate = new Date();
}

function loadSessions(filter = '') {
    const sessionsList = document.getElementById('sessionsList');
    sessionsList.innerHTML = '';

    const filteredSessions = sessions
        .filter(session => !filter || session.muscleGroup === filter)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filteredSessions.length === 0) {
        sessionsList.innerHTML = '<p>No sessions found.</p>';
        return;
    }

    filteredSessions.forEach(session => {
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'session-item';
        sessionDiv.innerHTML = `
            <div class="session-header">
                <span class="session-date">${formatDate(session.date)}</span>
                <span class="activation-badge ${getActivationClass(session.activationLevel)}">${session.activationLevel}/10</span>
            </div>
            <div class="session-details">
                <div class="session-detail"><strong>Exercise:</strong> ${session.exercise}</div>
                <div class="session-detail"><strong>Muscle Group:</strong> ${getMuscleGroupName(session.muscleGroup)}</div>
                <div class="session-detail"><strong>Duration:</strong> ${session.duration}s</div>
                <div class="session-detail"><strong>Sets x Reps:</strong> ${session.sets} x ${session.reps || 'N/A'}</div>
            </div>
            ${session.notes ? `<div class="session-notes"><strong>Notes:</strong> ${session.notes}</div>` : ''}
            <div class="session-actions">
                <button class="edit-btn" onclick="editSession(${session.id})">Edit</button>
                <button class="delete-btn" onclick="deleteSession(${session.id})">Delete</button>
            </div>
        `;
        sessionsList.appendChild(sessionDiv);
    });
}

function editSession(id) {
    const session = sessions.find(s => s.id === id);
    if (!session) return;

    document.getElementById('sessionDate').value = session.date;
    document.getElementById('exercise').value = session.exercise;
    document.getElementById('muscleGroup').value = session.muscleGroup;
    document.getElementById('activationLevel').value = session.activationLevel;
    updateActivationValue();
    document.getElementById('duration').value = session.duration;
    document.getElementById('sets').value = session.sets;
    document.getElementById('reps').value = session.reps;
    document.getElementById('notes').value = session.notes;

    deleteSession(id);
}

function deleteSession(id) {
    if (confirm('Are you sure you want to delete this session?')) {
        sessions = sessions.filter(s => s.id !== id);
        saveSessions();
        loadSessions();
        updateStats();
        updateChart();
    }
}

function setupFilter() {
    document.getElementById('filterMuscle').addEventListener('change', function() {
        loadSessions(this.value);
    });
}

function clearFilter() {
    document.getElementById('filterMuscle').value = '';
    loadSessions();
}

function updateStats() {
    const totalSessions = sessions.length;
    const avgActivation = sessions.length > 0 ? (sessions.reduce((sum, s) => sum + s.activationLevel, 0) / sessions.length).toFixed(1) : 0;

    // Most trained group
    const groupCount = {};
    sessions.forEach(session => {
        groupCount[session.muscleGroup] = (groupCount[session.muscleGroup] || 0) + 1;
    });
    const topGroup = Object.entries(groupCount).sort(([,a], [,b]) => b - a)[0];
    const topMuscleGroup = topGroup ? getMuscleGroupName(topGroup[0]) : 'None';

    // Recent progress (last 7 days vs previous 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentSessions = sessions.filter(s => new Date(s.date) >= sevenDaysAgo);
    const previousSessions = sessions.filter(s => new Date(s.date) >= fourteenDaysAgo && new Date(s.date) < sevenDaysAgo);

    const recentAvg = recentSessions.length > 0 ? recentSessions.reduce((sum, s) => sum + s.activationLevel, 0) / recentSessions.length : 0;
    const previousAvg = previousSessions.length > 0 ? previousSessions.reduce((sum, s) => sum + s.activationLevel, 0) / previousSessions.length : 0;

    let progress = 'No data';
    if (recentAvg > 0 && previousAvg > 0) {
        const change = ((recentAvg - previousAvg) / previousAvg * 100).toFixed(1);
        progress = `${change > 0 ? '+' : ''}${change}%`;
    }

    document.getElementById('totalSessions').textContent = totalSessions;
    document.getElementById('avgActivation').textContent = avgActivation;
    document.getElementById('topMuscleGroup').textContent = topMuscleGroup;
    document.getElementById('recentProgress').textContent = progress;
}

function initChart() {
    const ctx = document.getElementById('activationChart').getContext('2d');
    activationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Activation Level',
                data: [],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10
                }
            }
        }
    });
    updateChart();
}

function updateChart() {
    const sortedSessions = sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = sortedSessions.map(s => formatDate(s.date));
    const data = sortedSessions.map(s => s.activationLevel);

    activationChart.data.labels = labels;
    activationChart.data.datasets[0].data = data;
    activationChart.update();
}

function saveSessions() {
    localStorage.setItem('stabilizerSessions', JSON.stringify(sessions));
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getMuscleGroupName(group) {
    const names = {
        'core': 'Core',
        'glutes': 'Glutes',
        'shoulder': 'Shoulder',
        'hip': 'Hip',
        'ankle': 'Ankle',
        'knee': 'Knee',
        'spine': 'Spine',
        'other': 'Other'
    };
    return names[group] || group;
}

function getActivationClass(level) {
    if (level <= 3) return 'low';
    if (level <= 7) return 'medium';
    return 'high';
}