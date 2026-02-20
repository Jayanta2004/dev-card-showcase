// endurance-efficiency-ratio.js

let enduranceEntries = JSON.parse(localStorage.getItem('enduranceEfficiencyEntries')) || [];

function logSession() {
    const date = document.getElementById('sessionDate').value;
    const activityType = document.getElementById('activityType').value;
    const sessionDuration = parseInt(document.getElementById('sessionDuration').value);
    const distance = parseFloat(document.getElementById('distance').value);
    const distanceUnit = document.getElementById('distanceUnit').value;
    const avgHeartRate = document.getElementById('avgHeartRate').value ? parseInt(document.getElementById('avgHeartRate').value) : null;
    const maxHeartRate = document.getElementById('maxHeartRate').value ? parseInt(document.getElementById('maxHeartRate').value) : null;
    const perceivedEffort = parseInt(document.getElementById('perceivedEffort').value);
    const energyLevel = parseInt(document.getElementById('energyLevel').value);
    const trainingIntensity = document.getElementById('trainingIntensity').value;
    const notes = document.getElementById('enduranceNotes').value.trim();

    if (!date || !activityType || !sessionDuration || !distance || !perceivedEffort || !energyLevel || !trainingIntensity) {
        alert('Please fill in all required fields.');
        return;
    }

    // Convert distance to kilometers for consistency
    const distanceKm = distanceUnit === 'miles' ? distance * 1.60934 : distance;

    // Check if entry already exists for this date and activity
    const existingEntry = enduranceEntries.find(entry =>
        entry.date === date && entry.activityType === activityType
    );
    if (existingEntry) {
        if (!confirm('An entry already exists for this date and activity. Do you want to update it?')) {
            return;
        }
        // Remove existing entry
        enduranceEntries = enduranceEntries.filter(entry =>
            !(entry.date === date && entry.activityType === activityType)
        );
    }

    // Calculate efficiency ratio (distance per unit effort per hour)
    // Higher ratio = better efficiency
    const efficiencyRatio = (distanceKm / sessionDuration) / perceivedEffort * 60; // normalized per hour

    // Calculate speed (km/h)
    const speedKmh = (distanceKm / sessionDuration) * 60;

    // Calculate training load (effort × duration)
    const trainingLoad = perceivedEffort * (sessionDuration / 60); // effort-hours

    // Calculate heart rate efficiency if available
    const hrEfficiency = avgHeartRate ? speedKmh / avgHeartRate * 100 : null; // speed per bpm

    const entry = {
        id: Date.now(),
        date,
        activityType,
        sessionDuration,
        distance: distanceKm,
        originalDistance: distance,
        distanceUnit,
        avgHeartRate,
        maxHeartRate,
        perceivedEffort,
        energyLevel,
        trainingIntensity,
        efficiencyRatio: parseFloat(efficiencyRatio.toFixed(3)),
        speedKmh: parseFloat(speedKmh.toFixed(2)),
        trainingLoad: parseFloat(trainingLoad.toFixed(1)),
        hrEfficiency,
        notes
    };

    enduranceEntries.push(entry);

    // Sort by date
    enduranceEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Keep only last 50 entries
    if (enduranceEntries.length > 50) {
        enduranceEntries = enduranceEntries.slice(-50);
    }

    localStorage.setItem('enduranceEfficiencyEntries', JSON.stringify(enduranceEntries));

    // Clear form
    document.getElementById('sessionDate').value = '';
    document.getElementById('activityType').value = '';
    document.getElementById('sessionDuration').value = '';
    document.getElementById('distance').value = '';
    document.getElementById('distanceUnit').value = 'km';
    document.getElementById('avgHeartRate').value = '';
    document.getElementById('maxHeartRate').value = '';
    document.getElementById('perceivedEffort').value = '';
    document.getElementById('energyLevel').value = '';
    document.getElementById('trainingIntensity').value = '';
    document.getElementById('enduranceNotes').value = '';

    updateStats();
    updateChart();
    updateInsights();
    updateSessionList();
}

function getEfficiencyRating(efficiencyRatio) {
    if (efficiencyRatio >= 2.0) return { rating: 'Excellent', class: 'efficiency-excellent' };
    if (efficiencyRatio >= 1.5) return { rating: 'Good', class: 'efficiency-good' };
    if (efficiencyRatio >= 1.0) return { rating: 'Fair', class: 'efficiency-fair' };
    return { rating: 'Poor', class: 'efficiency-poor' };
}

function getTrendDirection(current, previous) {
    if (!previous || previous === 0) return 'stable';

    const changePercent = ((current - previous) / Math.abs(previous)) * 100;

    if (changePercent > 5) return 'improving';
    if (changePercent < -5) return 'declining';
    return 'stable';
}

function updateStats() {
    const totalSessions = enduranceEntries.length;

    if (totalSessions === 0) {
        document.getElementById('currentEfficiencyRatio').textContent = '0.000';
        document.getElementById('efficiencyTrend').textContent = '0%';
        document.getElementById('efficiencyTrend').className = 'stat-value';
        document.getElementById('bestActivity').textContent = 'None';
        document.getElementById('totalSessions').textContent = '0';
        return;
    }

    // Current efficiency ratio (latest entry)
    const latestEntry = enduranceEntries[enduranceEntries.length - 1];
    const currentEfficiencyRatio = latestEntry.efficiencyRatio;

    // Efficiency trend (percentage change from first entry)
    const firstEntry = enduranceEntries[0];
    const trendPercent = firstEntry.efficiencyRatio > 0 ?
        ((currentEfficiencyRatio - firstEntry.efficiencyRatio) / firstEntry.efficiencyRatio * 100) : 0;

    const trendDirection = getTrendDirection(currentEfficiencyRatio, firstEntry.efficiencyRatio);
    const trendElement = document.getElementById('efficiencyTrend');
    trendElement.textContent = `${trendPercent >= 0 ? '+' : ''}${trendPercent.toFixed(1)}%`;
    trendElement.className = `stat-value trend-${trendDirection}`;

    // Find best activity by average efficiency
    const activityStats = {};
    enduranceEntries.forEach(entry => {
        if (!activityStats[entry.activityType]) {
            activityStats[entry.activityType] = { total: 0, count: 0 };
        }
        activityStats[entry.activityType].total += entry.efficiencyRatio;
        activityStats[entry.activityType].count++;
    });

    let bestActivity = 'None';
    let maxAvgEfficiency = 0;
    Object.keys(activityStats).forEach(activity => {
        const avgEfficiency = activityStats[activity].total / activityStats[activity].count;
        if (avgEfficiency > maxAvgEfficiency) {
            maxAvgEfficiency = avgEfficiency;
            bestActivity = activity.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    });

    document.getElementById('currentEfficiencyRatio').textContent = currentEfficiencyRatio.toFixed(3);
    document.getElementById('bestActivity').textContent = bestActivity;
    document.getElementById('totalSessions').textContent = totalSessions;
}

function updateChart() {
    const ctx = document.getElementById('efficiencyChart').getContext('2d');

    // Prepare data for last 20 entries
    const chartEntries = enduranceEntries.slice(-20);

    const labels = chartEntries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString();
    });

    const efficiencyRatios = chartEntries.map(entry => entry.efficiencyRatio);
    const speeds = chartEntries.map(entry => entry.speedKmh);
    const efforts = chartEntries.map(entry => entry.perceivedEffort);
    const trainingLoads = chartEntries.map(entry => entry.trainingLoad);

    // Reference lines
    const goodEfficiency = new Array(efficiencyRatios.length).fill(1.5);
    const excellentEfficiency = new Array(efficiencyRatios.length).fill(2.0);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Efficiency Ratio',
                data: efficiencyRatios,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Speed (km/h)',
                data: speeds,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Perceived Effort',
                data: efforts,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                yAxisID: 'y2',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Training Load',
                data: trainingLoads,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                yAxisID: 'y3',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Good Efficiency (1.5+)',
                data: goodEfficiency,
                borderColor: '#17a2b8',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Excellent Efficiency (2.0+)',
                data: excellentEfficiency,
                borderColor: '#28a745',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Efficiency Ratio'
                    },
                    min: 0,
                    max: 3
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Speed (km/h)'
                    },
                    min: 0,
                    max: 20,
                    grid: {
                        drawOnChartArea: false,
                    }
                },
                y2: {
                    type: 'linear',
                    display: false, // Hidden by default
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Perceived Effort (1-10)'
                    },
                    min: 1,
                    max: 10,
                    grid: {
                        drawOnChartArea: false,
                    }
                },
                y3: {
                    type: 'linear',
                    display: false, // Hidden by default
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Training Load'
                    },
                    min: 0,
                    grid: {
                        drawOnChartArea: false,
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

function updateInsights() {
    const insightsDiv = document.getElementById('insights');

    if (enduranceEntries.length < 5) {
        insightsDiv.innerHTML = '<p>Log at least 5 endurance sessions to receive personalized insights about your efficiency patterns and training optimization strategies.</p>';
        return;
    }

    // Analyze patterns
    const recentEntries = enduranceEntries.slice(-10);
    const avgEfficiency = recentEntries.reduce((sum, entry) => sum + entry.efficiencyRatio, 0) / recentEntries.length;
    const avgSpeed = recentEntries.reduce((sum, entry) => sum + entry.speedKmh, 0) / recentEntries.length;
    const avgEffort = recentEntries.reduce((sum, entry) => sum + entry.perceivedEffort, 0) / recentEntries.length;

    // Analyze activity performance
    const activityPerformance = {};
    enduranceEntries.forEach(entry => {
        if (!activityPerformance[entry.activityType]) {
            activityPerformance[entry.activityType] = { efficiencies: [], speeds: [] };
        }
        activityPerformance[entry.activityType].efficiencies.push(entry.efficiencyRatio);
        activityPerformance[entry.activityType].speeds.push(entry.speedKmh);
    });

    let strongestActivity = '';
    let strongestAvgEfficiency = 0;
    Object.keys(activityPerformance).forEach(activity => {
        const avgEff = activityPerformance[activity].efficiencies.reduce((a, b) => a + b) / activityPerformance[activity].efficiencies.length;
        if (avgEff > strongestAvgEfficiency) {
            strongestAvgEfficiency = avgEff;
            strongestActivity = activity;
        }
    });

    // Analyze intensity vs efficiency
    const intensityEfficiency = {};
    enduranceEntries.forEach(entry => {
        if (!intensityEfficiency[entry.trainingIntensity]) {
            intensityEfficiency[entry.trainingIntensity] = [];
        }
        intensityEfficiency[entry.trainingIntensity].push(entry.efficiencyRatio);
    });

    let optimalIntensity = '';
    let optimalAvgEfficiency = 0;
    Object.keys(intensityEfficiency).forEach(intensity => {
        const avgEff = intensityEfficiency[intensity].reduce((a, b) => a + b) / intensityEfficiency[intensity].length;
        if (avgEff > optimalAvgEfficiency) {
            optimalAvgEfficiency = avgEff;
            optimalIntensity = intensity.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    });

    // Analyze effort consistency
    const effortVariance = recentEntries.reduce((sum, entry) => sum + Math.pow(entry.perceivedEffort - avgEffort, 2), 0) / recentEntries.length;
    const effortConsistency = Math.sqrt(effortVariance);

    let insights = '<p>Based on your endurance training patterns:</p><ul>';

    if (avgEfficiency >= 2.0) {
        insights += '<li><strong>Excellent efficiency!</strong> Your endurance capacity is highly developed. Focus on maintaining this level with quality sessions.</li>';
    } else if (avgEfficiency >= 1.5) {
        insights += '<li><strong>Good efficiency levels.</strong> You\'re performing well. Continue building aerobic base with consistent training.</li>';
    } else if (avgEfficiency >= 1.0) {
        insights += '<li><strong>Fair efficiency.</strong> There\'s room for improvement. Focus on technique, consistency, and progressive overload.</li>';
    } else {
        insights += '<li><strong>Efficiency needs attention.</strong> Consider building aerobic fitness with longer, easier sessions before increasing intensity.</li>';
    }

    if (strongestActivity) {
        const activityName = strongestActivity.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        insights += `<li><strong>Strongest activity:</strong> ${activityName} shows your highest efficiency (${strongestAvgEfficiency.toFixed(3)} average ratio).</li>`;
    }

    if (optimalIntensity) {
        insights += `<li><strong>Optimal intensity:</strong> ${optimalIntensity} training yields the best efficiency results.</li>`;
    }

    if (effortConsistency < 1.5) {
        insights += '<li><strong>Consistent effort levels.</strong> Your perceived effort ratings are stable, indicating good training consistency.</li>';
    } else {
        insights += '<li><strong>Variable effort perception.</strong> Consider standardizing your effort assessment or focusing on more consistent pacing.</li>';
    }

    // Speed analysis
    const speedTrend = recentEntries.length >= 3 ?
        getTrendDirection(recentEntries[recentEntries.length - 1].speedKmh, recentEntries[0].speedKmh) : 'stable';

    if (speedTrend === 'improving') {
        insights += '<li><strong>Speed improvement detected.</strong> Your pace is increasing, which is a positive sign of efficiency gains.</li>';
    } else if (speedTrend === 'declining') {
        insights += '<li><strong>Speed decline noted.</strong> Monitor for fatigue or overtraining. Consider incorporating recovery sessions.</li>';
    }

    insights += '<li><strong>Training recommendations:</strong> Include a mix of intensities, prioritize consistency over high effort sessions, and track heart rate when possible for better efficiency monitoring.</li>';
    insights += '</ul>';

    insightsDiv.innerHTML = insights;
}

function updateSessionList() {
    const sessionList = document.getElementById('sessionList');
    sessionList.innerHTML = '';

    // Show last 10 entries
    const recentEntries = enduranceEntries.slice(-10).reverse();

    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'session-entry';

        const efficiencyRating = getEfficiencyRating(entry.efficiencyRatio);

        entryDiv.innerHTML = `
            <div class="session-header">
                <div class="session-date">${new Date(entry.date).toLocaleDateString()}</div>
                <div class="efficiency-rating ${efficiencyRating.class}">${efficiencyRating.rating} (${entry.efficiencyRatio.toFixed(3)})</div>
            </div>
            <div class="session-details">
                <div class="detail-item">
                    <div class="detail-label">Activity</div>
                    <div class="detail-value">${entry.activityType.replace('-', ' ')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Duration</div>
                    <div class="detail-value">${entry.sessionDuration} min</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Distance</div>
                    <div class="detail-value">${entry.originalDistance.toFixed(1)} ${entry.distanceUnit}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Speed</div>
                    <div class="detail-value">${entry.speedKmh.toFixed(1)} km/h</div>
                </div>
            </div>
            <div class="session-metrics">
                <div class="metric-item">
                    <div class="metric-label">Effort</div>
                    <div class="metric-value">${entry.perceivedEffort}/10</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Energy</div>
                    <div class="metric-value">${entry.energyLevel}/10</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Intensity</div>
                    <div class="metric-value">${entry.trainingIntensity.replace('-', ' ')}</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Load</div>
                    <div class="metric-value">${entry.trainingLoad.toFixed(1)}</div>
                </div>
            </div>
            ${entry.avgHeartRate ? `<div class="metric-item" style="margin-top: 0.5rem; grid-column: span 2;"><div class="metric-label">Heart Rate</div><div class="metric-value">${entry.avgHeartRate}${entry.maxHeartRate ? `-${entry.maxHeartRate}` : ''} bpm</div></div>` : ''}
            ${entry.notes ? `<div class="session-notes">${entry.notes}</div>` : ''}
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;

        sessionList.appendChild(entryDiv);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this endurance session?')) {
        enduranceEntries = enduranceEntries.filter(entry => entry.id !== id);
        localStorage.setItem('enduranceEfficiencyEntries', JSON.stringify(enduranceEntries));
        updateStats();
        updateChart();
        updateInsights();
        updateSessionList();
    }
}

// Form submission
document.getElementById('enduranceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    logSession();
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sessionDate').value = today;

    updateStats();
    updateChart();
    updateInsights();
    updateSessionList();
});