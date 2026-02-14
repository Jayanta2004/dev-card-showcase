let sessions = JSON.parse(localStorage.getItem('meditationSessions')) || [];
let chart = null;

function logSession() {
    const duration = parseInt(document.getElementById('duration').value);
    const calmScore = parseInt(document.getElementById('calmScore').value);
    const notes = document.getElementById('notes').value;

    if (!duration || !calmScore) {
        alert('Please enter both duration and calm score');
        return;
    }

    const session = {
        date: new Date().toISOString().split('T')[0],
        duration: duration,
        calmScore: calmScore,
        notes: notes,
        timestamp: new Date().toISOString()
    };

    sessions.unshift(session);
    localStorage.setItem('meditationSessions', JSON.stringify(sessions));

    updateStats();
    updateChart();
    updateSessionsList();
    clearForm();

    // Show success message
    showNotification('Session logged successfully! 🧘');
}

function updateStats() {
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const avgCalmScore = totalSessions > 0 ? (sessions.reduce((sum, s) => sum + s.calmScore, 0) / totalSessions).toFixed(1) : 0;

    // Calculate streak
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = today;

    while (true) {
        const daySessions = sessions.filter(s => s.date === checkDate);
        if (daySessions.length > 0) {
            streak++;
            const prevDate = new Date(checkDate);
            prevDate.setDate(prevDate.getDate() - 1);
            checkDate = prevDate.toISOString().split('T')[0];
        } else {
            break;
        }
    }

    document.getElementById('totalSessions').textContent = totalSessions;
    document.getElementById('totalMinutes').textContent = totalMinutes;
    document.getElementById('avgCalmScore').textContent = avgCalmScore;
    document.getElementById('currentStreak').textContent = streak;
    document.getElementById('streakDisplay').textContent = `${streak} day${streak !== 1 ? 's' : ''}`;
}

function updateChart() {
    const ctx = document.getElementById('calmChart').getContext('2d');

    // Get last 14 sessions for chart
    const recentSessions = sessions.slice(0, 14).reverse();

    const labels = recentSessions.map(s => new Date(s.date).toLocaleDateString());
    const data = recentSessions.map(s => s.calmScore);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Calm Score',
                data: data,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        stepSize: 1
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

function updateSessionsList() {
    const container = document.getElementById('sessionsList');
    container.innerHTML = '';

    sessions.slice(0, 10).forEach((session, index) => {
        const sessionCard = document.createElement('div');
        sessionCard.className = 'session-card';

        const date = new Date(session.date).toLocaleDateString();
        const time = new Date(session.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        sessionCard.innerHTML = `
            <h3>${date} at ${time}</h3>
            <p><strong>Duration:</strong> ${session.duration} minutes</p>
            <p><strong>Calm Score:</strong> ${session.calmScore}/10</p>
            ${session.notes ? `<p><strong>Notes:</strong> ${session.notes}</p>` : ''}
            <button class="delete-btn" onclick="deleteSession(${index})">Delete</button>
        `;

        container.appendChild(sessionCard);
    });
}

function deleteSession(index) {
    if (confirm('Are you sure you want to delete this session?')) {
        sessions.splice(index, 1);
        localStorage.setItem('meditationSessions', JSON.stringify(sessions));
        updateStats();
        updateChart();
        updateSessionsList();
    }
}

function clearForm() {
    document.getElementById('duration').value = '';
    document.getElementById('calmScore').value = '';
    document.getElementById('notes').value = '';
}

function showNotification(message) {
    // Simple notification - could be enhanced with a proper notification system
    alert(message);
}

// Initialize
updateStats();
updateChart();
updateSessionsList();