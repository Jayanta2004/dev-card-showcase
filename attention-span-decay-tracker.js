// attention-span-decay-tracker.js

let sessions = JSON.parse(localStorage.getItem('attentionSessions')) || [];
let currentSession = null;
let timerInterval = null;
let startTime = null;
let distractions = [];

function startSession() {
    if (currentSession) return;

    startTime = new Date();
    currentSession = {
        id: Date.now(),
        startTime: startTime.toISOString(),
        distractions: [],
        endTime: null,
        duration: 0
    };
    distractions = [];

    document.getElementById('startBtn').disabled = true;
    document.getElementById('distractionBtn').disabled = false;
    document.getElementById('endBtn').disabled = false;
    document.getElementById('distractionCount').textContent = '0';

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

function logDistraction() {
    if (!currentSession) return;

    const reason = prompt('What distracted you?');
    if (reason) {
        const distraction = {
            time: new Date().toISOString(),
            reason: reason
        };
        distractions.push(distraction);
        currentSession.distractions = distractions;
        document.getElementById('distractionCount').textContent = distractions.length;
    }
}

function logDistractionManual() {
    const reason = document.getElementById('distractionReason').value.trim();
    if (!reason) {
        alert('Please enter a reason for the distraction.');
        return;
    }

    if (!currentSession) {
        alert('Please start a focus session first.');
        return;
    }

    const distraction = {
        time: new Date().toISOString(),
        reason: reason
    };
    distractions.push(distraction);
    currentSession.distractions = distractions;
    document.getElementById('distractionCount').textContent = distractions.length;

    document.getElementById('distractionReason').value = '';
}

function endSession() {
    if (!currentSession) return;

    clearInterval(timerInterval);
    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 1000 / 60); // minutes

    currentSession.endTime = endTime.toISOString();
    currentSession.duration = duration;
    currentSession.distractions = distractions;

    sessions.push(currentSession);

    // Keep only last 50 sessions
    if (sessions.length > 50) {
        sessions = sessions.slice(-50);
    }

    localStorage.setItem('attentionSessions', JSON.stringify(sessions));

    // Reset UI
    document.getElementById('startBtn').disabled = false;
    document.getElementById('distractionBtn').disabled = true;
    document.getElementById('endBtn').disabled = true;
    document.getElementById('timerDisplay').textContent = '00:00:00';
    document.getElementById('currentDuration').textContent = '0:00';
    document.getElementById('distractionCount').textContent = '0';

    currentSession = null;
    startTime = null;
    distractions = [];

    updateStats();
    updateChart();
    updateHistory();
}

function updateStats() {
    if (sessions.length === 0) {
        document.getElementById('avgAttention').textContent = '0 min';
        document.getElementById('longestSession').textContent = '0 min';
        document.getElementById('totalSessions').textContent = '0';
        return;
    }

    const durations = sessions.map(s => s.duration);
    const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    const longest = Math.max(...durations);

    document.getElementById('avgAttention').textContent = `${avg} min`;
    document.getElementById('longestSession').textContent = `${longest} min`;
    document.getElementById('totalSessions').textContent = sessions.length;
}

function updateChart() {
    const ctx = document.getElementById('attentionChart').getContext('2d');

    // Sort sessions by date
    const sortedSessions = sessions.slice().sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    const labels = sortedSessions.map(s => new Date(s.startTime).toLocaleDateString());
    const data = sortedSessions.map(s => s.duration);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Attention Span (minutes)',
                data: data,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Attention Span Decay Over Time'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Duration (minutes)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}

function updateHistory() {
    const history = document.getElementById('sessionsHistory');
    history.innerHTML = '';

    // Show last 10 sessions
    const recentSessions = sessions.slice(-10).reverse();

    recentSessions.forEach(session => {
        const item = document.createElement('div');
        item.className = 'session-entry';

        const startDate = new Date(session.startTime).toLocaleString();
        const endDate = session.endTime ? new Date(session.endTime).toLocaleString() : 'Ongoing';

        item.innerHTML = `
            <h4>${startDate}</h4>
            <p><strong>Duration:</strong> <span class="duration">${session.duration} minutes</span></p>
            <p><strong>Distractions:</strong> <span class="distractions">${session.distractions.length}</span></p>
            ${session.distractions.length > 0 ? '<p><strong>Reasons:</strong> ' + session.distractions.map(d => d.reason).join(', ') + '</p>' : ''}
        `;

        history.appendChild(item);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    updateChart();
    updateHistory();
});