// nasal-breathing-compliance-tracker.js

let breathingSessions = JSON.parse(localStorage.getItem('nasalBreathingSessions')) || [];
let chart = null;

const sessionTypes = {
    workout: { name: 'Workout/Exercise', icon: '🏋️' },
    sleep: { name: 'Sleep', icon: '😴' },
    daily: { name: 'Daily Activities', icon: '🚶' },
    practice: { name: 'Breathing Practice', icon: '🧘' }
};

document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today
    document.getElementById('sessionDate').valueAsDate = new Date();

    // Initialize time input listeners for compliance preview
    document.getElementById('totalTime').addEventListener('input', updateCompliancePreview);
    document.getElementById('nasalTime').addEventListener('input', updateCompliancePreview);

    // Initialize chart period change handler
    document.getElementById('chartPeriod').addEventListener('change', renderChart);

    // Load and display data
    updateDisplay();
    renderChart();
});

function updateCompliancePreview() {
    const totalTime = parseFloat(document.getElementById('totalTime').value) || 0;
    const nasalTime = parseFloat(document.getElementById('nasalTime').value) || 0;

    let compliance = 0;
    if (totalTime > 0) {
        compliance = Math.min((nasalTime / totalTime) * 100, 100);
    }

    document.getElementById('previewCompliance').textContent = compliance.toFixed(1) + '%';
}

function logSession() {
    const date = document.getElementById('sessionDate').value;
    const sessionType = document.getElementById('sessionType').value;
    const totalTime = parseFloat(document.getElementById('totalTime').value);
    const nasalTime = parseFloat(document.getElementById('nasalTime').value);
    const notes = document.getElementById('sessionNotes').value.trim();

    if (!date) {
        alert('Please select a date for the session.');
        return;
    }

    if (!totalTime || totalTime <= 0) {
        alert('Please enter a valid total session time.');
        return;
    }

    if (nasalTime < 0 || nasalTime > totalTime) {
        alert('Nasal breathing time cannot be negative or greater than total time.');
        return;
    }

    const compliance = (nasalTime / totalTime) * 100;

    const session = {
        id: Date.now(),
        date: date,
        sessionType: sessionType,
        totalTime: totalTime,
        nasalTime: nasalTime,
        compliance: compliance,
        notes: notes,
        timestamp: new Date().toISOString()
    };

    breathingSessions.push(session);
    breathingSessions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Save to localStorage
    localStorage.setItem('nasalBreathingSessions', JSON.stringify(breathingSessions));

    // Clear form
    document.getElementById('sessionNotes').value = '';

    // Update display
    updateDisplay();
    renderChart();

    // Show success message
    alert('Session logged successfully!');
}

function updateDisplay() {
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = breathingSessions.filter(s => s.date === today);

    // Update today's status
    if (todaySessions.length > 0) {
        const totalTime = todaySessions.reduce((sum, s) => sum + s.totalTime, 0);
        const nasalTime = todaySessions.reduce((sum, s) => sum + s.nasalTime, 0);
        const avgCompliance = todaySessions.reduce((sum, s) => sum + s.compliance, 0) / todaySessions.length;

        document.getElementById('todayCompliance').textContent = avgCompliance.toFixed(1) + '%';
        document.getElementById('todaySessions').textContent = todaySessions.length;
        document.getElementById('todayTime').textContent = totalTime + ' min';
        document.getElementById('todayNasalTime').textContent = nasalTime + ' min';
    } else {
        document.getElementById('todayCompliance').textContent = '0%';
        document.getElementById('todaySessions').textContent = '0';
        document.getElementById('todayTime').textContent = '0 min';
        document.getElementById('todayNasalTime').textContent = '0 min';
    }

    // Update overall stats
    if (breathingSessions.length > 0) {
        const overallCompliance = breathingSessions.reduce((sum, s) => sum + s.compliance, 0) / breathingSessions.length;
        const totalTime = breathingSessions.reduce((sum, s) => sum + s.totalTime, 0);
        const avgSessionTime = totalTime / breathingSessions.length;
        const currentStreak = calculateStreak();

        document.getElementById('overallCompliance').textContent = overallCompliance.toFixed(1) + '%';
        document.getElementById('totalSessions').textContent = breathingSessions.length;
        document.getElementById('avgSessionTime').textContent = avgSessionTime.toFixed(1) + ' min';
        document.getElementById('streakDays').textContent = currentStreak + ' days';
    } else {
        document.getElementById('overallCompliance').textContent = '0%';
        document.getElementById('totalSessions').textContent = '0';
        document.getElementById('avgSessionTime').textContent = '0 min';
        document.getElementById('streakDays').textContent = '0 days';
    }

    // Update history
    renderHistory();
}

function calculateStreak() {
    if (breathingSessions.length === 0) return 0;

    const dates = [...new Set(breathingSessions.map(s => s.date))].sort();
    let streak = 0;
    let currentStreak = 0;
    let lastDate = null;

    for (const date of dates) {
        const currentDate = new Date(date);
        if (lastDate) {
            const diffTime = currentDate - lastDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
        } else {
            currentStreak = 1;
        }

        streak = Math.max(streak, currentStreak);
        lastDate = currentDate;
    }

    return streak;
}

function renderHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    if (breathingSessions.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">No sessions logged yet. Start tracking your nasal breathing!</p>';
        return;
    }

    breathingSessions.slice().reverse().slice(0, 10).forEach(session => { // Show last 10 sessions
        const item = document.createElement('div');
        item.className = 'history-item';

        const date = new Date(session.date).toLocaleDateString();
        const sessionTypeInfo = sessionTypes[session.sessionType];

        item.innerHTML = `
            <div class="session-info">
                <div class="session-type">${sessionTypeInfo.icon} ${sessionTypeInfo.name}</div>
                <div class="session-details">${date} • ${session.totalTime} min total • ${session.nasalTime} min nasal</div>
                <div class="session-compliance">${session.compliance.toFixed(1)}% compliance</div>
                ${session.notes ? `<div class="session-notes">${session.notes}</div>` : ''}
            </div>
            <button class="delete-btn" onclick="deleteSession(${session.id})">Delete</button>
        `;

        historyList.appendChild(item);
    });
}

function deleteSession(id) {
    if (confirm('Are you sure you want to delete this session?')) {
        breathingSessions = breathingSessions.filter(s => s.id !== id);
        localStorage.setItem('nasalBreathingSessions', JSON.stringify(breathingSessions));
        updateDisplay();
        renderChart();
    }
}

function renderChart() {
    const ctx = document.getElementById('complianceChart').getContext('2d');
    const period = parseInt(document.getElementById('chartPeriod').value);

    if (chart) {
        chart.destroy();
    }

    if (breathingSessions.length === 0) {
        return;
    }

    // Filter sessions by selected period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - period);

    const filteredSessions = breathingSessions.filter(s => new Date(s.date) >= cutoffDate);

    if (filteredSessions.length === 0) {
        return;
    }

    // Group by date and calculate daily average compliance
    const dailyData = {};
    filteredSessions.forEach(session => {
        if (!dailyData[session.date]) {
            dailyData[session.date] = { compliances: [], totalTime: 0, nasalTime: 0 };
        }
        dailyData[session.date].compliances.push(session.compliance);
        dailyData[session.date].totalTime += session.totalTime;
        dailyData[session.date].nasalTime += session.nasalTime;
    });

    const labels = [];
    const data = [];

    Object.keys(dailyData).sort().forEach(date => {
        const dayData = dailyData[date];
        const avgCompliance = dayData.compliances.reduce((sum, c) => sum + c, 0) / dayData.compliances.length;

        labels.push(new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        data.push(avgCompliance.toFixed(1));
    });

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Compliance (%)',
                data: data,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#4fd1ff',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
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
                    labels: {
                        color: '#fff'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Compliance: ${context.parsed.y}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#fff',
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#fff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Export data functionality
function exportData() {
    const dataStr = JSON.stringify(breathingSessions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = 'nasal-breathing-data.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Make export function available globally if needed
window.exportData = exportData;