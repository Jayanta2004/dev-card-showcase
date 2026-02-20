// circadian-consistency-score.js

let sleepLogs = JSON.parse(localStorage.getItem('circadianSleepLogs')) || [];

// Calculate time difference in minutes
function timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

// Convert minutes to time string
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Calculate consistency score based on schedule regularity
function calculateConsistencyScore(logs) {
    if (logs.length < 2) return 0;

    let totalVariance = 0;
    let count = 0;

    // Calculate variance in bedtimes and wake times
    for (let i = 1; i < logs.length; i++) {
        const prev = logs[i - 1];
        const curr = logs[i];

        const prevBedtime = timeToMinutes(prev.bedtime);
        const currBedtime = timeToMinutes(curr.bedtime);
        const prevWakeTime = timeToMinutes(prev.waketime);
        const currWakeTime = timeToMinutes(curr.waketime);

        // Handle overnight wake times (next day)
        let wakeVariance = Math.abs(currWakeTime - prevWakeTime);
        if (wakeVariance > 12 * 60) { // More than 12 hours difference
            wakeVariance = Math.abs(wakeVariance - 24 * 60);
        }

        const bedVariance = Math.abs(currBedtime - prevBedtime);
        totalVariance += bedVariance + wakeVariance;
        count += 2;
    }

    const avgVariance = totalVariance / count;
    // Convert variance to score (lower variance = higher score)
    const score = Math.max(0, Math.min(100, 100 - (avgVariance / 60) * 10)); // 60 min variance = 10 point penalty

    return Math.round(score);
}

// Calculate average time from time strings
function calculateAverageTime(times) {
    if (times.length === 0) return '--:--';

    const minutes = times.map(timeToMinutes);
    const avgMinutes = minutes.reduce((sum, min) => sum + min, 0) / minutes.length;

    // Handle circular time (midnight crossover)
    return minutesToTime(Math.round(avgMinutes));
}

// Calculate average sleep duration
function calculateAverageDuration(logs) {
    if (logs.length === 0) return '0h 0m';

    const durations = logs.map(log => {
        let bedMinutes = timeToMinutes(log.bedtime);
        let wakeMinutes = timeToMinutes(log.waketime);

        // Handle overnight sleep
        if (wakeMinutes < bedMinutes) {
            wakeMinutes += 24 * 60; // Add 24 hours
        }

        return wakeMinutes - bedMinutes;
    });

    const avgMinutes = durations.reduce((sum, dur) => sum + dur, 0) / durations.length;
    const hours = Math.floor(avgMinutes / 60);
    const minutes = Math.round(avgMinutes % 60);

    return `${hours}h ${minutes}m`;
}

function logSleep() {
    const bedtime = document.getElementById('bedtime').value;
    const waketime = document.getElementById('waketime').value;
    const sleepQuality = parseInt(document.getElementById('sleepQuality').value) || 7;
    const energyLevel = parseInt(document.getElementById('energyLevel').value) || 8;
    const notes = document.getElementById('notes').value.trim();

    if (!bedtime || !waketime) {
        alert('Please enter both bedtime and wake time.');
        return;
    }

    const sleepLog = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        bedtime: bedtime,
        waketime: waketime,
        sleepQuality: sleepQuality,
        energyLevel: energyLevel,
        notes: notes
    };

    sleepLogs.push(sleepLog);
    saveSleepLogs();

    // Clear form
    document.getElementById('bedtime').value = '';
    document.getElementById('waketime').value = '';
    document.getElementById('sleepQuality').value = '';
    document.getElementById('energyLevel').value = '';
    document.getElementById('notes').value = '';

    updateStats();
    updateCharts();
    updateInsights();
    displayHistory();
}

function saveSleepLogs() {
    localStorage.setItem('circadianSleepLogs', JSON.stringify(sleepLogs));
}

function updateStats() {
    if (sleepLogs.length === 0) {
        document.getElementById('consistencyScore').textContent = '0%';
        document.getElementById('avgBedtime').textContent = '--:--';
        document.getElementById('avgWakeTime').textContent = '--:--';
        document.getElementById('avgSleepDuration').textContent = '0h 0m';
        document.getElementById('sleepQualityAvg').textContent = '0/10';
        document.getElementById('energyAvg').textContent = '0/10';
        return;
    }

    // Consistency score
    const consistencyScore = calculateConsistencyScore(sleepLogs);
    document.getElementById('consistencyScore').textContent = `${consistencyScore}%`;

    // Average times
    const bedtimes = sleepLogs.map(log => log.bedtime);
    const waketimes = sleepLogs.map(log => log.waketime);

    document.getElementById('avgBedtime').textContent = calculateAverageTime(bedtimes);
    document.getElementById('avgWakeTime').textContent = calculateAverageTime(waketimes);
    document.getElementById('avgSleepDuration').textContent = calculateAverageDuration(sleepLogs);

    // Average ratings
    const avgQuality = sleepLogs.reduce((sum, log) => sum + log.sleepQuality, 0) / sleepLogs.length;
    const avgEnergy = sleepLogs.reduce((sum, log) => sum + log.energyLevel, 0) / sleepLogs.length;

    document.getElementById('sleepQualityAvg').textContent = `${avgQuality.toFixed(1)}/10`;
    document.getElementById('energyAvg').textContent = `${avgEnergy.toFixed(1)}/10`;
}

function updateCharts() {
    updateScheduleChart();
    updateConsistencyChart();
}

function updateScheduleChart() {
    const sortedLogs = sleepLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const labels = sortedLogs.map(log => new Date(log.timestamp));
    const bedtimes = sortedLogs.map(log => {
        const minutes = timeToMinutes(log.bedtime);
        return minutes < 12 * 60 ? minutes + 24 * 60 : minutes; // Convert to 24+ hours for display
    });
    const waketimes = sortedLogs.map(log => timeToMinutes(log.waketime));

    const ctx = document.getElementById('scheduleChart').getContext('2d');
    if (window.scheduleChart) {
        window.scheduleChart.destroy();
    }

    window.scheduleChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Bedtime',
                data: bedtimes,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.1,
                pointRadius: 4,
                pointHoverRadius: 6
            }, {
                label: 'Wake Time',
                data: waketimes,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.1,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM dd'
                        }
                    }
                },
                y: {
                    ticks: {
                        callback: function(value) {
                            const hours = Math.floor(value / 60);
                            const minutes = value % 60;
                            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                        }
                    },
                    min: 0,
                    max: 24 * 60
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const hours = Math.floor(context.parsed.y / 60);
                            const minutes = context.parsed.y % 60;
                            return `${context.dataset.label}: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                        }
                    }
                }
            }
        }
    });
}

function updateConsistencyChart() {
    const sortedLogs = sleepLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const labels = sortedLogs.map(log => new Date(log.timestamp));
    const consistencyScores = [];

    // Calculate rolling consistency scores
    for (let i = 0; i < sortedLogs.length; i++) {
        const recentLogs = sortedLogs.slice(Math.max(0, i - 6), i + 1); // Last 7 days
        consistencyScores.push(calculateConsistencyScore(recentLogs));
    }

    const ctx = document.getElementById('consistencyChart').getContext('2d');
    if (window.consistencyChart) {
        window.consistencyChart.destroy();
    }

    window.consistencyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Consistency Score %',
                data: consistencyScores,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.1,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM dd'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.parsed.y}% consistency`
                    }
                }
            }
        }
    });
}

function updateInsights() {
    if (sleepLogs.length < 3) {
        document.getElementById('scheduleStability').textContent = 'Need at least 3 sleep logs for stability analysis';
        document.getElementById('qualityTrend').textContent = 'Need more data for quality trends';
        document.getElementById('energyCorrelation').textContent = 'Need more data for energy correlation';
        document.getElementById('weeklyPattern').textContent = 'Need more data for weekly patterns';
        return;
    }

    // Schedule stability
    const consistencyScore = calculateConsistencyScore(sleepLogs);
    let stabilityText = '';
    if (consistencyScore >= 80) {
        stabilityText = 'Excellent schedule stability - your circadian rhythm is well-regulated';
    } else if (consistencyScore >= 60) {
        stabilityText = 'Good schedule stability - minor variations detected';
    } else if (consistencyScore >= 40) {
        stabilityText = 'Moderate schedule stability - consider more consistent timing';
    } else {
        stabilityText = 'Poor schedule stability - significant variations may affect health';
    }
    document.getElementById('scheduleStability').textContent = stabilityText;

    // Sleep quality trend
    const recentQuality = sleepLogs.slice(-7).reduce((sum, log) => sum + log.sleepQuality, 0) / Math.min(7, sleepLogs.length);
    const olderQuality = sleepLogs.slice(-14, -7);
    let qualityTrend = 'Stable sleep quality';
    if (olderQuality.length > 0) {
        const olderAvg = olderQuality.reduce((sum, log) => sum + log.sleepQuality, 0) / olderQuality.length;
        const change = recentQuality - olderAvg;
        if (change > 0.5) {
            qualityTrend = 'Improving sleep quality (+' + change.toFixed(1) + ' points)';
        } else if (change < -0.5) {
            qualityTrend = 'Declining sleep quality (' + change.toFixed(1) + ' points)';
        }
    }
    document.getElementById('qualityTrend').textContent = qualityTrend;

    // Energy correlation
    const correlation = calculateCorrelation(
        sleepLogs.map(log => log.sleepQuality),
        sleepLogs.map(log => log.energyLevel)
    );
    let correlationText = '';
    if (correlation > 0.7) {
        correlationText = 'Strong positive correlation between sleep quality and morning energy';
    } else if (correlation > 0.4) {
        correlationText = 'Moderate correlation between sleep quality and morning energy';
    } else if (correlation > 0.1) {
        correlationText = 'Weak correlation between sleep quality and morning energy';
    } else {
        correlationText = 'No clear correlation between sleep quality and morning energy';
    }
    document.getElementById('energyCorrelation').textContent = correlationText;

    // Weekly pattern
    const dayOfWeek = sleepLogs.map(log => new Date(log.timestamp).getDay());
    const avgByDay = {};
    for (let i = 0; i < sleepLogs.length; i++) {
        const day = dayOfWeek[i];
        if (!avgByDay[day]) avgByDay[day] = [];
        avgByDay[day].push(sleepLogs[i].sleepQuality);
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let bestDay = '';
    let bestAvg = 0;
    let worstDay = '';
    let worstAvg = 10;

    Object.keys(avgByDay).forEach(day => {
        const avg = avgByDay[day].reduce((sum, q) => sum + q, 0) / avgByDay[day].length;
        if (avg > bestAvg) {
            bestAvg = avg;
            bestDay = dayNames[day];
        }
        if (avg < worstAvg) {
            worstAvg = avg;
            worstDay = dayNames[day];
        }
    });

    const patternText = bestDay !== worstDay ?
        `Best sleep on ${bestDay} (${bestAvg.toFixed(1)}/10), worst on ${worstDay} (${worstAvg.toFixed(1)}/10)` :
        `Consistent sleep quality across all days (${bestAvg.toFixed(1)}/10)`;
    document.getElementById('weeklyPattern').textContent = patternText;
}

// Calculate Pearson correlation coefficient
function calculateCorrelation(x, y) {
    const n = x.length;
    if (n < 2) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
}

function displayHistory(filter = 'all') {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

    let filteredLogs = sleepLogs;

    if (filter === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filteredLogs = sleepLogs.filter(log => new Date(log.timestamp) >= oneWeekAgo);
    } else if (filter === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        filteredLogs = sleepLogs.filter(log => new Date(log.timestamp) >= oneMonthAgo);
    }

    // Sort by most recent first
    filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const historyDiv = document.getElementById('sleepHistory');
    historyDiv.innerHTML = '';

    if (filteredLogs.length === 0) {
        historyDiv.innerHTML = '<p style="text-align: center; color: #666;">No sleep logs found</p>';
        return;
    }

    filteredLogs.forEach(log => {
        const entry = document.createElement('div');
        entry.className = 'sleep-entry';

        const date = new Date(log.timestamp).toLocaleDateString();
        const bedMinutes = timeToMinutes(log.bedtime);
        const wakeMinutes = timeToMinutes(log.waketime);
        let duration = wakeMinutes - bedMinutes;
        if (duration < 0) duration += 24 * 60; // Handle overnight
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;

        // Calculate consistency for this entry (compared to previous)
        const logIndex = sleepLogs.findIndex(l => l.id === log.id);
        const prevLog = logIndex > 0 ? sleepLogs[logIndex - 1] : null;
        let consistencyClass = 'poor';
        if (prevLog) {
            const bedDiff = Math.abs(timeToMinutes(log.bedtime) - timeToMinutes(prevLog.bedtime));
            const wakeDiff = Math.abs(timeToMinutes(log.waketime) - timeToMinutes(prevLog.waketime));
            const avgDiff = (bedDiff + wakeDiff) / 2;
            if (avgDiff < 30) consistencyClass = 'excellent'; // Within 30 minutes
            else if (avgDiff < 60) consistencyClass = 'good'; // Within 1 hour
            else if (avgDiff < 120) consistencyClass = 'fair'; // Within 2 hours
        }

        entry.innerHTML = `
            <h4>
                ${date}
                <span class="consistency-badge ${consistencyClass}">${consistencyClass.charAt(0).toUpperCase() + consistencyClass.slice(1)} consistency</span>
                <button class="delete-btn" onclick="deleteSleepLog(${log.id})">×</button>
            </h4>
            <div class="sleep-details">
                <div class="detail-item">Bedtime: ${log.bedtime}</div>
                <div class="detail-item">Wake Time: ${log.waketime}</div>
                <div class="detail-item">Duration: ${hours}h ${minutes}m</div>
                <div class="detail-item">Quality: ${log.sleepQuality}/10</div>
                <div class="detail-item">Energy: ${log.energyLevel}/10</div>
            </div>
            ${log.notes ? `<p><strong>Notes:</strong> ${log.notes}</p>` : ''}
        `;

        historyDiv.appendChild(entry);
    });
}

function filterHistory(filter) {
    displayHistory(filter);
}

function deleteSleepLog(id) {
    if (confirm('Are you sure you want to delete this sleep log?')) {
        sleepLogs = sleepLogs.filter(log => log.id !== id);
        saveSleepLogs();
        updateStats();
        updateCharts();
        updateInsights();
        displayHistory();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    updateCharts();
    updateInsights();
    displayHistory();
});