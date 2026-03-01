// aerobic-base-builder-tracker.js

let aerobicSessions = JSON.parse(localStorage.getItem('aerobicSessions')) || [];

// Initialize perceived effort slider display
document.getElementById('perceivedEffort').addEventListener('input', function() {
    document.getElementById('effortValue').textContent = this.value;
});

function logAerobicSession() {
    const activityType = document.getElementById('activityType').value;
    const duration = parseInt(document.getElementById('sessionDuration').value);
    const avgHeartRate = parseInt(document.getElementById('avgHeartRate').value) || null;
    const perceivedEffort = parseInt(document.getElementById('perceivedEffort').value);
    const notes = document.getElementById('sessionNotes').value.trim();

    if (!duration || duration <= 0) {
        alert('Please enter a valid duration');
        return;
    }

    // Estimate max HR and check if in Zone 2 (60-70% of max HR)
    // Using common formula: max HR = 220 - age, but we'll use a general approach
    let isZone2 = false;
    if (avgHeartRate) {
        // Assuming max HR around 190 for calculation, but this is just for indication
        const estimatedMaxHR = 190;
        const zone2Min = estimatedMaxHR * 0.6;
        const zone2Max = estimatedMaxHR * 0.7;
        isZone2 = avgHeartRate >= zone2Min && avgHeartRate <= zone2Max;
    } else {
        // If no HR data, assume Zone 2 if perceived effort is 5-7
        isZone2 = perceivedEffort >= 5 && perceivedEffort <= 7;
    }

    const session = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        activityType: activityType,
        duration: duration,
        avgHeartRate: avgHeartRate,
        perceivedEffort: perceivedEffort,
        isZone2: isZone2,
        notes: notes
    };

    aerobicSessions.push(session);
    saveSessions();

    // Clear form
    document.getElementById('sessionDuration').value = '';
    document.getElementById('avgHeartRate').value = '';
    document.getElementById('perceivedEffort').value = 6;
    document.getElementById('effortValue').textContent = '6';
    document.getElementById('sessionNotes').value = '';

    updateStats();
    updateProgress();
    updateChart();
    updateInsights();
    displayHistory();
}

function saveSessions() {
    localStorage.setItem('aerobicSessions', JSON.stringify(aerobicSessions));
}

function updateStats() {
    if (aerobicSessions.length === 0) {
        document.getElementById('totalSessions').textContent = '0';
        document.getElementById('weeklyVolume').textContent = '0 min';
        document.getElementById('monthlyVolume').textContent = '0 min';
        document.getElementById('avgSessionLength').textContent = '0 min';
        return;
    }

    // Total sessions
    document.getElementById('totalSessions').textContent = aerobicSessions.length;

    // Weekly volume (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklySessions = aerobicSessions.filter(s => new Date(s.timestamp) >= weekAgo);
    const weeklyVolume = weeklySessions.reduce((sum, s) => sum + s.duration, 0);
    document.getElementById('weeklyVolume').textContent = `${weeklyVolume} min`;

    // Monthly volume (last 30 days)
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthlySessions = aerobicSessions.filter(s => new Date(s.timestamp) >= monthAgo);
    const monthlyVolume = monthlySessions.reduce((sum, s) => sum + s.duration, 0);
    document.getElementById('monthlyVolume').textContent = `${monthlyVolume} min`;

    // Average session length
    const avgLength = aerobicSessions.reduce((sum, s) => sum + s.duration, 0) / aerobicSessions.length;
    document.getElementById('avgSessionLength').textContent = `${Math.round(avgLength)} min`;
}

function updateProgress() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklySessions = aerobicSessions.filter(s => new Date(s.timestamp) >= weekAgo);
    const weeklyVolume = weeklySessions.reduce((sum, s) => sum + s.duration, 0);

    const targetMinutes = 150; // Recommended weekly aerobic volume
    const progressPercent = Math.min((weeklyVolume / targetMinutes) * 100, 100);

    document.getElementById('weeklyProgressFill').style.width = `${progressPercent}%`;
    document.getElementById('weeklyProgressText').textContent = `${weeklyVolume} / ${targetMinutes} minutes`;
}

function updateChart() {
    const timeRange = parseInt(document.getElementById('chartTimeRange').value);

    // Group sessions by week
    const weeklyData = {};
    const endDate = new Date();

    for (let i = 0; i < timeRange; i++) {
        const weekStart = new Date(endDate);
        weekStart.setDate(endDate.getDate() - (i * 7) - 6); // Start of week
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // End of week

        const weekKey = weekStart.toISOString().split('T')[0];
        const weekSessions = aerobicSessions.filter(s => {
            const sessionDate = new Date(s.timestamp);
            return sessionDate >= weekStart && sessionDate <= weekEnd;
        });

        const totalMinutes = weekSessions.reduce((sum, s) => sum + s.duration, 0);
        const zone2Minutes = weekSessions.filter(s => s.isZone2).reduce((sum, s) => sum + s.duration, 0);

        weeklyData[weekKey] = {
            total: totalMinutes,
            zone2: zone2Minutes,
            weekLabel: `Week of ${weekStart.toLocaleDateString()}`
        };
    }

    // Sort by date
    const sortedWeeks = Object.keys(weeklyData).sort();

    const labels = sortedWeeks.map(key => weeklyData[key].weekLabel);
    const totalData = sortedWeeks.map(key => weeklyData[key].total);
    const zone2Data = sortedWeeks.map(key => weeklyData[key].zone2);

    const ctx = document.getElementById('volumeChart').getContext('2d');
    if (window.volumeChart) {
        window.volumeChart.destroy();
    }

    window.volumeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Aerobic Minutes',
                data: totalData,
                backgroundColor: 'rgba(76, 175, 80, 0.6)',
                borderColor: '#4CAF50',
                borderWidth: 1
            }, {
                label: 'Zone 2 Minutes',
                data: zone2Data,
                backgroundColor: 'rgba(33, 150, 243, 0.6)',
                borderColor: '#2196F3',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Minutes'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.parsed.y} minutes`
                    }
                }
            }
        }
    });
}

function updateInsights() {
    if (aerobicSessions.length === 0) {
        document.getElementById('zoneCompliance').textContent = 'No data available';
        document.getElementById('consistencyScore').textContent = 'No data available';
        document.getElementById('bestWeek').textContent = 'No data available';
        return;
    }

    // Zone 2 compliance
    const zone2Sessions = aerobicSessions.filter(s => s.isZone2).length;
    const totalSessions = aerobicSessions.length;
    const zoneCompliance = (zone2Sessions / totalSessions) * 100;
    document.getElementById('zoneCompliance').textContent = `${zoneCompliance.toFixed(1)}% of sessions in Zone 2 (${zone2Sessions}/${totalSessions})`;

    // Consistency score (sessions per week over last 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const recentSessions = aerobicSessions.filter(s => new Date(s.timestamp) >= fourWeeksAgo);
    const consistencyScore = (recentSessions.length / 4) * 100; // Average sessions per week
    document.getElementById('consistencyScore').textContent = `${consistencyScore.toFixed(1)}% consistency (${recentSessions.length} sessions in 4 weeks)`;

    // Best week
    const weeklyVolumes = {};
    aerobicSessions.forEach(session => {
        const sessionDate = new Date(session.timestamp);
        const weekStart = new Date(sessionDate);
        weekStart.setDate(sessionDate.getDate() - sessionDate.getDay()); // Start of week (Sunday)
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weeklyVolumes[weekKey]) {
            weeklyVolumes[weekKey] = 0;
        }
        weeklyVolumes[weekKey] += session.duration;
    });

    let bestWeek = { volume: 0, date: null };
    for (const [week, volume] of Object.entries(weeklyVolumes)) {
        if (volume > bestWeek.volume) {
            bestWeek = { volume, date: week };
        }
    }

    if (bestWeek.date) {
        const bestWeekDate = new Date(bestWeek.date);
        document.getElementById('bestWeek').textContent = `${bestWeek.volume} minutes (week of ${bestWeekDate.toLocaleDateString()})`;
    } else {
        document.getElementById('bestWeek').textContent = 'No data available';
    }
}

function displayHistory(filter = 'all') {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

    let filteredSessions = aerobicSessions;

    if (filter === 'this-week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredSessions = aerobicSessions.filter(s => new Date(s.timestamp) >= weekAgo);
    } else if (filter === 'this-month') {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        filteredSessions = aerobicSessions.filter(s => new Date(s.timestamp) >= monthAgo);
    }

    // Sort by most recent first
    filteredSessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const historyDiv = document.getElementById('sessionHistory');
    historyDiv.innerHTML = '';

    if (filteredSessions.length === 0) {
        historyDiv.innerHTML = '<p style="text-align: center; color: #666;">No sessions found</p>';
        return;
    }

    filteredSessions.forEach(session => {
        const entry = document.createElement('div');
        entry.className = 'session-entry';

        const date = new Date(session.timestamp).toLocaleDateString();
        const time = new Date(session.timestamp).toLocaleTimeString();
        const activityType = session.activityType.charAt(0).toUpperCase() + session.activityType.slice(1);

        entry.innerHTML = `
            <h4>
                ${activityType} - ${date} ${time}
                <span class="activity-badge">${activityType}</span>
                <button class="delete-btn" onclick="deleteSession(${session.id})">×</button>
            </h4>
            <p><strong>Duration:</strong> ${session.duration} minutes</p>
            ${session.avgHeartRate ? `<p><strong>Avg Heart Rate:</strong> ${session.avgHeartRate} bpm</p>` : ''}
            <p><strong>Perceived Effort:</strong> ${session.perceivedEffort}/10</p>
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value">${session.isZone2 ? 'Zone 2' : 'Not Zone 2'}</div>
                    <small>Training Zone</small>
                </div>
                <div class="metric">
                    <div class="metric-value">${session.duration} min</div>
                    <small>Duration</small>
                </div>
                ${session.avgHeartRate ? `<div class="metric">
                    <div class="metric-value">${session.avgHeartRate} bpm</div>
                    <small>Avg HR</small>
                </div>` : ''}
            </div>
            ${session.notes ? `<p><strong>Notes:</strong> ${session.notes}</p>` : ''}
        `;

        historyDiv.appendChild(entry);
    });
}

function filterHistory(filter) {
    displayHistory(filter);
}

function deleteSession(id) {
    if (confirm('Are you sure you want to delete this aerobic session?')) {
        aerobicSessions = aerobicSessions.filter(session => session.id !== id);
        saveSessions();
        updateStats();
        updateProgress();
        updateChart();
        updateInsights();
        displayHistory();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    updateProgress();
    updateChart();
    updateInsights();
    displayHistory();
});