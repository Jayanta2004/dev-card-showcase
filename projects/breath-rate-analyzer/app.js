document.addEventListener('DOMContentLoaded', function() {
    const breathForm = document.getElementById('breathForm');
    const sessionsTable = document.getElementById('sessionsTable');
    const avgRestRateEl = document.getElementById('avgRestRate');
    const lowestRateEl = document.getElementById('lowestRate');
    const totalSessionsEl = document.getElementById('totalSessions');
    const healthScoreEl = document.getElementById('healthScore');
    const breathChartCanvas = document.getElementById('breathChart');

    let sessions = JSON.parse(localStorage.getItem('breathRateSessions')) || [];
    let chart;

    // Set default date to today
    document.getElementById('date').valueAsDate = new Date();

    function saveSessions() {
        localStorage.setItem('breathRateSessions', JSON.stringify(sessions));
    }

    function calculateStats() {
        if (sessions.length === 0) {
            avgRestRateEl.textContent = '-- bpm';
            lowestRateEl.textContent = '-- bpm';
            totalSessionsEl.textContent = '--';
            healthScoreEl.textContent = '--';
            return;
        }

        const restSessions = sessions.filter(s => s.activity === 'rest');
        const avgRestRate = restSessions.length > 0
            ? Math.round(restSessions.reduce((sum, s) => sum + s.breathRate, 0) / restSessions.length)
            : '--';

        const lowestRate = Math.min(...sessions.map(s => s.breathRate));
        const totalSessions = sessions.length;

        // Calculate health score (0-100) based on rest rate consistency and normal ranges
        let healthScore = 0;
        if (restSessions.length > 0) {
            const restRates = restSessions.map(s => s.breathRate);
            const avgRest = restRates.reduce((a, b) => a + b) / restRates.length;
            const variance = restRates.reduce((sum, rate) => sum + Math.pow(rate - avgRest, 2), 0) / restRates.length;
            const stdDev = Math.sqrt(variance);

            // Score based on average rest rate (ideal 12-16)
            let rateScore = 0;
            if (avgRest >= 12 && avgRest <= 16) rateScore = 100;
            else if (avgRest >= 10 && avgRest <= 20) rateScore = 80;
            else if (avgRest >= 8 && avgRest <= 25) rateScore = 60;
            else rateScore = 40;

            // Score based on consistency (lower std dev is better)
            const consistencyScore = Math.max(0, 100 - (stdDev * 10));

            healthScore = Math.round((rateScore + consistencyScore) / 2);
        }

        avgRestRateEl.textContent = avgRestRate === '--' ? '-- bpm' : `${avgRestRate} bpm`;
        lowestRateEl.textContent = `${lowestRate} bpm`;
        totalSessionsEl.textContent = totalSessions;
        healthScoreEl.textContent = healthScore > 0 ? `${healthScore}/100` : '--';
    }

    function getBreathRateClass(breathRate, activity) {
        if (activity === 'rest') {
            if (breathRate >= 12 && breathRate <= 20) return 'normal-range';
            if (breathRate >= 21 && breathRate <= 25) return 'elevated';
            return 'high';
        } else {
            // During activity, higher rates are normal
            if (breathRate <= 30) return 'normal-range';
            if (breathRate <= 40) return 'elevated';
            return 'high';
        }
    }

    function getActivityBadge(activity) {
        const badges = {
            rest: 'activity-rest',
            light: 'activity-light',
            moderate: 'activity-moderate',
            intense: 'activity-intense',
            stress: 'activity-stress'
        };
        return `<span class="activity-badge ${badges[activity]}">${activity.charAt(0).toUpperCase() + activity.slice(1)}</span>`;
    }

    function renderSessionsTable() {
        if (sessions.length === 0) {
            sessionsTable.innerHTML = '<p>No breathing sessions logged yet. Start monitoring your respiratory health!</p>';
            return;
        }

        // Sort sessions by date (newest first)
        sessions.sort((a, b) => new Date(b.date) - new Date(a.date));

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Activity</th>
                    <th>Duration (min)</th>
                    <th>Rate (bpm)</th>
                    <th>Notes</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${sessions.map((session, index) => `
                    <tr class="${getBreathRateClass(session.breathRate, session.activity)}">
                        <td>${new Date(session.date).toLocaleDateString()}</td>
                        <td>${getActivityBadge(session.activity)}</td>
                        <td>${session.duration}</td>
                        <td>${session.breathRate}</td>
                        <td>${session.notes || '-'}</td>
                        <td><button class="delete-btn" data-index="${index}">Delete</button></td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        sessionsTable.innerHTML = '';
        sessionsTable.appendChild(table);

        // Add delete event listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                if (confirm('Are you sure you want to delete this session?')) {
                    sessions.splice(index, 1);
                    saveSessions();
                    renderSessionsTable();
                    calculateStats();
                    updateChart();
                }
            });
        });
    }

    function updateChart() {
        if (sessions.length === 0) {
            if (chart) chart.destroy();
            return;
        }

        // Sort sessions by date for chart
        const sortedSessions = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));

        const labels = sortedSessions.map(session => new Date(session.date).toLocaleDateString());
        const rates = sortedSessions.map(session => session.breathRate);

        if (chart) chart.destroy();

        chart = new Chart(breathChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Breath Rate (breaths/min)',
                    data: rates,
                    borderColor: '#4fd1ff',
                    backgroundColor: 'rgba(79, 209, 255, 0.1)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 5,
                        max: 50,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                elements: {
                    point: {
                        backgroundColor: '#4fd1ff'
                    }
                }
            }
        });
    }

    breathForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const date = document.getElementById('date').value;
        const activity = document.getElementById('activity').value;
        const duration = parseFloat(document.getElementById('duration').value);
        const breathRate = parseInt(document.getElementById('breathRate').value);
        const notes = document.getElementById('notes').value.trim();

        const newSession = {
            date,
            activity,
            duration,
            breathRate,
            notes: notes || null
        };

        sessions.push(newSession);
        saveSessions();

        // Reset form
        breathForm.reset();
        document.getElementById('date').valueAsDate = new Date();

        // Update UI
        calculateStats();
        renderSessionsTable();
        updateChart();
    });

    // Initial render
    calculateStats();
    renderSessionsTable();
    updateChart();
});