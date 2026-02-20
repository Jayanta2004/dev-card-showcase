// foot-strike-pattern-analyzer.js

let strikeSessions = JSON.parse(localStorage.getItem('footStrikeSessions')) || [];

// Optimal running metrics
const OPTIMAL_CADENCE = { min: 170, max: 190 }; // steps per minute
const OPTIMAL_CONTACT_TIME = { min: 200, max: 280 }; // milliseconds
const OPTIMAL_FLIGHT_TIME = { min: 80, max: 120 }; // milliseconds

// Injury risk thresholds
const INJURY_RISK_THRESHOLDS = {
    heelStrike: { low: 30, moderate: 50, high: 70 }, // percentage
    consistency: { low: 70, moderate: 85, high: 95 } // percentage
};

function logStrikeSession() {
    const date = document.getElementById('sessionDate').value;
    const distance = parseFloat(document.getElementById('distance').value);
    const duration = parseInt(document.getElementById('duration').value);
    const pace = parseFloat(document.getElementById('pace').value) || (duration / distance);
    const effort = parseInt(document.getElementById('effort').value);
    const surface = document.getElementById('surface').value;
    const notes = document.getElementById('strikeNotes').value.trim();

    if (!date || !distance || !duration) {
        alert('Please fill in all required fields.');
        return;
    }

    // Get strike pattern data
    const strikeEntries = document.querySelectorAll('.strike-entry');
    const strikePatterns = [];

    for (let entry of strikeEntries) {
        const heelStrike = parseInt(entry.querySelector('.heel-percentage').value) || 0;
        const midfootStrike = parseInt(entry.querySelector('.midfoot-percentage').value) || 0;
        const forefootStrike = parseInt(entry.querySelector('.forefoot-percentage').value) || 0;
        const cadence = parseInt(entry.querySelector('.cadence-input').value) || 0;
        const contactTime = parseInt(entry.querySelector('.contact-time-input').value) || 0;
        const flightTime = parseInt(entry.querySelector('.flight-time-input').value) || 0;

        const totalPercentage = heelStrike + midfootStrike + forefootStrike;
        if (totalPercentage !== 100) {
            alert('Strike pattern percentages must add up to 100%.');
            return;
        }

        strikePatterns.push({
            heelStrike,
            midfootStrike,
            forefootStrike,
            cadence,
            contactTime,
            flightTime
        });
    }

    if (strikePatterns.length === 0) {
        alert('Please add at least one strike pattern analysis.');
        return;
    }

    // Check if session already exists for this date
    const existingSession = strikeSessions.find(session => session.date === date);
    if (existingSession) {
        if (!confirm('A session already exists for this date. Do you want to update it?')) {
            return;
        }
        // Remove existing session
        strikeSessions = strikeSessions.filter(session => session.date !== date);
    }

    // Calculate session metrics
    const sessionMetrics = calculateSessionMetrics(strikePatterns, distance, duration, surface);

    const session = {
        id: Date.now(),
        date,
        distance,
        duration,
        pace: parseFloat(pace.toFixed(2)),
        effort,
        surface,
        strikePatterns,
        metrics: sessionMetrics,
        notes
    };

    strikeSessions.push(session);

    // Sort by date (most recent first)
    strikeSessions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Keep only last 50 sessions
    if (strikeSessions.length > 50) {
        strikeSessions = strikeSessions.slice(0, 50);
    }

    localStorage.setItem('footStrikeSessions', JSON.stringify(strikeSessions));

    // Clear form
    document.getElementById('sessionDate').value = '';
    document.getElementById('distance').value = '';
    document.getElementById('duration').value = '';
    document.getElementById('pace').value = '';
    document.getElementById('effort').value = 5;
    document.getElementById('effortValue').textContent = '5';
    document.getElementById('surface').value = 'road';
    document.getElementById('strikeNotes').value = '';

    // Reset strike patterns to one empty entry
    document.getElementById('strikePatternsList').innerHTML = `
        <div class="strike-entry">
            <div class="strike-header">
                <span class="strike-label">Strike Pattern Distribution</span>
                <button type="button" class="remove-strike-btn" style="display: none;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="strike-details">
                <div class="percentage-input">
                    <label>Heel Strike (%)</label>
                    <input type="number" class="heel-percentage" min="0" max="100" value="0">
                </div>
                <div class="percentage-input">
                    <label>Midfoot Strike (%)</label>
                    <input type="number" class="midfoot-percentage" min="0" max="100" value="0">
                </div>
                <div class="percentage-input">
                    <label>Forefoot Strike (%)</label>
                    <input type="number" class="forefoot-percentage" min="0" max="100" value="0">
                </div>
            </div>
            <div class="strike-metrics">
                <div class="metric-input">
                    <label>Cadence (steps/min)</label>
                    <input type="number" class="cadence-input" min="150" max="200" placeholder="180">
                </div>
                <div class="metric-input">
                    <label>Ground Contact Time (ms)</label>
                    <input type="number" class="contact-time-input" min="150" max="350" placeholder="250">
                </div>
                <div class="metric-input">
                    <label>Flight Time (ms)</label>
                    <input type="number" class="flight-time-input" min="50" max="150" placeholder="100">
                </div>
            </div>
        </div>
    `;

    updateStats();
    updateRiskAlert();
    updateChart();
    updateInsights();
    updateStrikeHistory();
}

function calculateSessionMetrics(strikePatterns, distance, duration, surface) {
    // Average across all strike pattern entries
    const avgHeelStrike = strikePatterns.reduce((sum, p) => sum + p.heelStrike, 0) / strikePatterns.length;
    const avgMidfootStrike = strikePatterns.reduce((sum, p) => sum + p.midfootStrike, 0) / strikePatterns.length;
    const avgForefootStrike = strikePatterns.reduce((sum, p) => sum + p.forefootStrike, 0) / strikePatterns.length;
    const avgCadence = strikePatterns.reduce((sum, p) => sum + p.cadence, 0) / strikePatterns.length;
    const avgContactTime = strikePatterns.reduce((sum, p) => sum + p.contactTime, 0) / strikePatterns.length;
    const avgFlightTime = strikePatterns.reduce((sum, p) => sum + p.flightTime, 0) / strikePatterns.length;

    // Determine primary strike pattern
    let primaryStrike = 'midfoot';
    if (avgHeelStrike > avgForefootStrike && avgHeelStrike > avgMidfootStrike) primaryStrike = 'heel';
    else if (avgForefootStrike > avgHeelStrike && avgForefootStrike > avgMidfootStrike) primaryStrike = 'forefoot';

    // Calculate consistency (lower variation = higher consistency)
    const heelVariation = calculateVariation(strikePatterns.map(p => p.heelStrike));
    const consistency = Math.max(0, 100 - (heelVariation * 2)); // Convert variation to consistency score

    // Calculate injury risk
    const injuryRisk = calculateInjuryRisk(avgHeelStrike, consistency, avgCadence, surface);

    // Calculate pace and speed
    const speed = distance / (duration / 60); // km/h

    return {
        avgHeelStrike: parseFloat(avgHeelStrike.toFixed(1)),
        avgMidfootStrike: parseFloat(avgMidfootStrike.toFixed(1)),
        avgForefootStrike: parseFloat(avgForefootStrike.toFixed(1)),
        avgCadence: parseFloat(avgCadence.toFixed(1)),
        avgContactTime: parseFloat(avgContactTime.toFixed(1)),
        avgFlightTime: parseFloat(avgFlightTime.toFixed(1)),
        primaryStrike,
        consistency: parseFloat(consistency.toFixed(1)),
        injuryRisk,
        speed: parseFloat(speed.toFixed(2))
    };
}

function calculateVariation(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, sq) => sum + sq, 0) / values.length;
    return Math.sqrt(variance);
}

function calculateInjuryRisk(heelStrike, consistency, cadence, surface) {
    let riskScore = 0;

    // Heel strike risk
    if (heelStrike > INJURY_RISK_THRESHOLDS.heelStrike.high) riskScore += 30;
    else if (heelStrike > INJURY_RISK_THRESHOLDS.heelStrike.moderate) riskScore += 15;
    else if (heelStrike > INJURY_RISK_THRESHOLDS.heelStrike.low) riskScore += 5;

    // Consistency risk (inconsistent patterns increase injury risk)
    if (consistency < INJURY_RISK_THRESHOLDS.consistency.low) riskScore += 20;
    else if (consistency < INJURY_RISK_THRESHOLDS.consistency.moderate) riskScore += 10;

    // Cadence risk
    if (cadence < OPTIMAL_CADENCE.min || cadence > OPTIMAL_CADENCE.max) riskScore += 10;

    // Surface modifier
    if (surface === 'trail' || surface === 'track') riskScore += 5;

    // Determine risk level
    if (riskScore >= 40) return { level: 'high', score: riskScore };
    if (riskScore >= 20) return { level: 'moderate', score: riskScore };
    return { level: 'low', score: riskScore };
}

function updateStats() {
    const totalSessions = strikeSessions.length;

    if (totalSessions === 0) {
        document.getElementById('primaryStrike').textContent = 'Unknown';
        document.getElementById('avgCadence').textContent = '0 spm';
        document.getElementById('injuryRisk').textContent = 'Unknown';
        document.getElementById('injuryRisk').className = 'stat-value';
        document.getElementById('sessionsLogged').textContent = '0';
        return;
    }

    // Calculate primary strike pattern across all sessions
    const allHeelStrikes = strikeSessions.map(s => s.metrics.avgHeelStrike);
    const allForefootStrikes = strikeSessions.map(s => s.metrics.avgForefootStrike);
    const allMidfootStrikes = strikeSessions.map(s => s.metrics.avgMidfootStrike);

    const avgHeel = allHeelStrikes.reduce((sum, val) => sum + val, 0) / allHeelStrikes.length;
    const avgForefoot = allForefootStrikes.reduce((sum, val) => sum + val, 0) / allForefootStrikes.length;
    const avgMidfoot = allMidfootStrikes.reduce((sum, val) => sum + val, 0) / allMidfootStrikes.length;

    let primaryStrike = 'Midfoot';
    if (avgHeel > avgForefoot && avgHeel > avgMidfoot) primaryStrike = 'Heel';
    else if (avgForefoot > avgHeel && avgForefoot > avgMidfoot) primaryStrike = 'Forefoot';

    // Average cadence
    const avgCadence = strikeSessions.map(s => s.metrics.avgCadence).reduce((sum, val) => sum + val, 0) / totalSessions;

    // Current injury risk (latest session)
    const latestSession = strikeSessions[0];
    const injuryRisk = latestSession.metrics.injuryRisk;

    // Update display
    document.getElementById('primaryStrike').textContent = primaryStrike;
    document.getElementById('avgCadence').textContent = `${avgCadence.toFixed(0)} spm`;
    document.getElementById('injuryRisk').textContent = injuryRisk.level.charAt(0).toUpperCase() + injuryRisk.level.slice(1);
    document.getElementById('injuryRisk').className = `stat-value risk-${injuryRisk.level}`;
    document.getElementById('sessionsLogged').textContent = totalSessions;
}

function updateRiskAlert() {
    const alertDiv = document.getElementById('riskAlert');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');

    if (strikeSessions.length === 0) {
        alertDiv.style.display = 'none';
        return;
    }

    const latestSession = strikeSessions[0];
    const injuryRisk = latestSession.metrics.injuryRisk;

    if (injuryRisk.level === 'high') {
        alertDiv.style.display = 'flex';
        alertDiv.className = 'risk-alert high';
        alertTitle.textContent = 'High Injury Risk Detected';
        alertMessage.textContent = `Your foot strike patterns show significant injury risk factors. Consider consulting a running coach or physical therapist to assess your running form and make necessary adjustments.`;
    } else if (injuryRisk.level === 'moderate') {
        alertDiv.style.display = 'flex';
        alertDiv.className = 'risk-alert moderate';
        alertTitle.textContent = 'Moderate Injury Risk';
        alertMessage.textContent = `Your running form has some risk factors that could lead to injury. Focus on improving your foot strike consistency and cadence to reduce injury potential.`;
    } else {
        alertDiv.style.display = 'none';
    }
}

function updateChart() {
    const ctx = document.getElementById('strikeChart').getContext('2d');

    // Prepare data for last 15 sessions
    const chartSessions = strikeSessions.slice(0, 15).reverse();

    const labels = chartSessions.map(session => {
        const date = new Date(session.date);
        return date.toLocaleDateString();
    });

    const heelStrikes = chartSessions.map(session => session.metrics.avgHeelStrike);
    const cadences = chartSessions.map(session => session.metrics.avgCadence);
    const consistencies = chartSessions.map(session => session.metrics.consistency);
    const contactTimes = chartSessions.map(session => session.metrics.avgContactTime);

    // Reference lines
    const optimalCadenceMin = new Array(cadences.length).fill(OPTIMAL_CADENCE.min);
    const optimalCadenceMax = new Array(cadences.length).fill(OPTIMAL_CADENCE.max);
    const goodConsistency = new Array(consistencies.length).fill(85);
    const lowHeelStrike = new Array(heelStrikes.length).fill(30);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Heel Strike %',
                data: heelStrikes,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Cadence (spm)',
                data: cadences,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Strike Consistency %',
                data: consistencies,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                yAxisID: 'y2',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Contact Time (ms)',
                data: contactTimes,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                yAxisID: 'y3',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Optimal Cadence Min',
                data: optimalCadenceMin,
                borderColor: '#17a2b8',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y1'
            }, {
                label: 'Optimal Cadence Max',
                data: optimalCadenceMax,
                borderColor: '#17a2b8',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y1'
            }, {
                label: 'Good Consistency (85%+)',
                data: goodConsistency,
                borderColor: '#28a745',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y2'
            }, {
                label: 'Low Injury Risk Heel Strike',
                data: lowHeelStrike,
                borderColor: '#dc3545',
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
                        text: 'Heel Strike %'
                    },
                    min: 0,
                    max: 100
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Cadence (spm)'
                    },
                    min: 150,
                    max: 200,
                    grid: {
                        drawOnChartArea: false,
                    }
                },
                y2: {
                    type: 'linear',
                    display: false,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Consistency %'
                    },
                    min: 0,
                    max: 100,
                    grid: {
                        drawOnChartArea: false,
                    }
                },
                y3: {
                    type: 'linear',
                    display: false,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Contact Time (ms)'
                    },
                    min: 150,
                    max: 350,
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

    if (strikeSessions.length < 3) {
        insightsDiv.innerHTML = '<p>Log at least 3 running sessions with foot strike analysis to receive personalized running form insights and injury prevention recommendations.</p>';
        return;
    }

    // Analyze patterns
    const recentSessions = strikeSessions.slice(0, 10);
    const avgHeelStrike = recentSessions.reduce((sum, s) => sum + s.metrics.avgHeelStrike, 0) / recentSessions.length;
    const avgCadence = recentSessions.reduce((sum, s) => sum + s.metrics.avgCadence, 0) / recentSessions.length;
    const avgConsistency = recentSessions.reduce((sum, s) => sum + s.metrics.consistency, 0) / recentSessions.length;

    // Analyze trends
    const heelTrend = recentSessions.length >= 2 ?
        recentSessions[0].metrics.avgHeelStrike - recentSessions[recentSessions.length - 1].metrics.avgHeelStrike : 0;
    const cadenceTrend = recentSessions.length >= 2 ?
        recentSessions[0].metrics.avgCadence - recentSessions[recentSessions.length - 1].metrics.avgCadence : 0;

    // Generate insights
    let insights = '<p>Based on your foot strike pattern analysis:</p><ul>';

    if (avgHeelStrike > 50) {
        insights += '<li><strong>Heavy heel striking detected.</strong> Your heel strike percentage is high, which increases impact forces and injury risk. Focus on midfoot or forefoot striking to reduce loading on your joints.</li>';
    } else if (avgHeelStrike < 20) {
        insights += '<li><strong>Forefoot striking dominant.</strong> You primarily strike with your forefoot, which can be efficient but may increase calf strain. Ensure proper form to avoid Achilles tendon issues.</li>';
    } else {
        insights += '<li><strong>Midfoot striking pattern.</strong> Your strike pattern is in a good range for injury prevention. Continue maintaining this form for optimal running efficiency.</li>';
    }

    if (avgCadence < OPTIMAL_CADENCE.min) {
        insights += `<li><strong>Cadence too low.</strong> Your average cadence (${avgCadence.toFixed(0)} spm) is below optimal range. Try to increase to 170-190 spm to reduce ground contact time and injury risk.</li>`;
    } else if (avgCadence > OPTIMAL_CADENCE.max) {
        insights += `<li><strong>Cadence may be too high.</strong> Your cadence (${avgCadence.toFixed(0)} spm) is above optimal range. While high cadence can be good, ensure it feels natural and doesn't cause fatigue.</li>`;
    } else {
        insights += '<li><strong>Cadence in optimal range.</strong> Your running cadence is within the ideal 170-190 spm range, which helps minimize injury risk and improve efficiency.</li>';
    }

    if (avgConsistency < 80) {
        insights += '<li><strong>Inconsistent strike patterns.</strong> Your foot strike varies significantly between sessions. Work on developing consistent running form to reduce injury risk and improve efficiency.</li>';
    } else {
        insights += '<li><strong>Consistent strike patterns.</strong> Your running form shows good consistency across sessions. This consistency helps prevent injuries and supports performance improvements.</li>';
    }

    if (heelTrend > 5) {
        insights += '<li><strong>Heel strike increasing.</strong> Your heel strike percentage has been rising. Monitor this trend as it may increase injury risk if it continues.</li>';
    } else if (heelTrend < -5) {
        insights += '<li><strong>Heel strike decreasing.</strong> Your heel strike percentage is improving. Continue with the changes that led to this positive trend.</li>';
    }

    if (cadenceTrend > 3) {
        insights += '<li><strong>Cadence improving.</strong> Your running cadence has been increasing, which is generally positive for injury prevention and efficiency.</li>';
    } else if (cadenceTrend < -3) {
        insights += '<li><strong>Cadence declining.</strong> Your cadence has been decreasing. Focus on maintaining higher cadence to support proper running form.</li>';
    }

    insights += '<li><strong>Training recommendations:</strong> Incorporate drills like high knees, butt kicks, and A-skips to improve cadence and foot strike consistency. Consider video analysis of your running form.</li>';
    insights += '<li><strong>Injury prevention:</strong> Gradually transition between strike patterns if needed. Sudden changes can cause injuries. Listen to your body and reduce volume if you feel pain.</li>';
    insights += '<li><strong>Performance optimization:</strong> Focus on midfoot striking with cadence around 180 spm for optimal efficiency. Strength training for calves, ankles, and hips supports better running form.</li>';

    insights += '</ul>';

    insightsDiv.innerHTML = insights;
}

function updateStrikeHistory() {
    const historyDiv = document.getElementById('strikeHistory');
    historyDiv.innerHTML = '';

    if (strikeSessions.length === 0) {
        historyDiv.innerHTML = '<p class="no-data">No foot strike analyses logged yet. Start by logging your first running session above.</p>';
        return;
    }

    // Show last 10 sessions
    const recentSessions = strikeSessions.slice(0, 10);

    recentSessions.forEach(session => {
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'strike-entry';

        const riskLevel = session.metrics.injuryRisk.level;
        const patternBreakdown = `
            <div class="pattern-item">
                <span class="pattern-type">Heel Strike</span>
                <span class="pattern-percentage">${session.metrics.avgHeelStrike}%</span>
            </div>
            <div class="pattern-item">
                <span class="pattern-type">Midfoot Strike</span>
                <span class="pattern-percentage">${session.metrics.avgMidfootStrike}%</span>
            </div>
            <div class="pattern-item">
                <span class="pattern-type">Forefoot Strike</span>
                <span class="pattern-percentage">${session.metrics.avgForefootStrike}%</span>
            </div>
        `;

        sessionDiv.innerHTML = `
            <div class="strike-header">
                <div class="strike-date">${new Date(session.date).toLocaleDateString()}</div>
                <div class="risk-indicator risk-${riskLevel}">
                    ${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
                </div>
            </div>
            <div class="strike-metrics-summary">
                <div class="metric-summary">
                    <div class="metric-name">Cadence</div>
                    <div class="metric-value">${session.metrics.avgCadence} spm</div>
                </div>
                <div class="metric-summary">
                    <div class="metric-name">Contact Time</div>
                    <div class="metric-value">${session.metrics.avgContactTime}ms</div>
                </div>
                <div class="metric-summary">
                    <div class="metric-name">Consistency</div>
                    <div class="metric-value">${session.metrics.consistency}%</div>
                </div>
                <div class="metric-summary">
                    <div class="metric-name">Primary Strike</div>
                    <div class="metric-value">${session.metrics.primaryStrike}</div>
                </div>
            </div>
            <div class="strike-pattern-breakdown">
                ${patternBreakdown}
            </div>
            <div class="strike-session-info">
                <div class="session-metric">
                    <div class="session-label">Distance</div>
                    <div class="session-value">${session.distance}km</div>
                </div>
                <div class="session-metric">
                    <div class="session-label">Duration</div>
                    <div class="session-value">${session.duration}min</div>
                </div>
                <div class="session-metric">
                    <div class="session-label">Pace</div>
                    <div class="session-value">${session.pace}'/km</div>
                </div>
                <div class="session-metric">
                    <div class="session-label">Effort</div>
                    <div class="session-value">${session.effort}/10</div>
                </div>
                <div class="session-metric">
                    <div class="session-label">Surface</div>
                    <div class="session-value">${session.surface}</div>
                </div>
                <div class="session-metric">
                    <div class="session-label">Speed</div>
                    <div class="session-value">${session.metrics.speed}km/h</div>
                </div>
            </div>
            ${session.notes ? `<div class="strike-notes">${session.notes}</div>` : ''}
            <button class="delete-btn" onclick="deleteStrikeSession(${session.id})">Delete Session</button>
        `;

        historyDiv.appendChild(sessionDiv);
    });
}

function deleteStrikeSession(id) {
    if (confirm('Are you sure you want to delete this strike analysis session?')) {
        strikeSessions = strikeSessions.filter(session => session.id !== id);
        localStorage.setItem('footStrikeSessions', JSON.stringify(strikeSessions));
        updateStats();
        updateRiskAlert();
        updateChart();
        updateInsights();
        updateStrikeHistory();
    }
}

function addStrikeEntry() {
    const strikePatternsList = document.getElementById('strikePatternsList');
    const entryCount = strikePatternsList.children.length + 1;

    const strikeEntry = document.createElement('div');
    strikeEntry.className = 'strike-entry';
    strikeEntry.innerHTML = `
        <div class="strike-header">
            <span class="strike-label">Strike Pattern Distribution ${entryCount}</span>
            <button type="button" class="remove-strike-btn" onclick="removeStrikeEntry(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="strike-details">
            <div class="percentage-input">
                <label>Heel Strike (%)</label>
                <input type="number" class="heel-percentage" min="0" max="100" value="0">
            </div>
            <div class="percentage-input">
                <label>Midfoot Strike (%)</label>
                <input type="number" class="midfoot-percentage" min="0" max="100" value="0">
            </div>
            <div class="percentage-input">
                <label>Forefoot Strike (%)</label>
                <input type="number" class="forefoot-percentage" min="0" max="100" value="0">
            </div>
        </div>
        <div class="strike-metrics">
            <div class="metric-input">
                <label>Cadence (steps/min)</label>
                <input type="number" class="cadence-input" min="150" max="200" placeholder="180">
            </div>
            <div class="metric-input">
                <label>Ground Contact Time (ms)</label>
                <input type="number" class="contact-time-input" min="150" max="350" placeholder="250">
            </div>
            <div class="metric-input">
                <label>Flight Time (ms)</label>
                <input type="number" class="flight-time-input" min="50" max="150" placeholder="100">
            </div>
        </div>
    `;

    strikePatternsList.appendChild(strikeEntry);

    // Show remove button for first entry now that we have multiple entries
    if (entryCount === 2) {
        strikePatternsList.children[0].querySelector('.remove-strike-btn').style.display = 'block';
    }
}

function removeStrikeEntry(button) {
    const strikeEntry = button.parentElement.parentElement;
    const strikePatternsList = document.getElementById('strikePatternsList');

    strikeEntry.remove();

    // Renumber remaining entries
    const remainingEntries = strikePatternsList.children;
    for (let i = 0; i < remainingEntries.length; i++) {
        const label = remainingEntries[i].querySelector('.strike-label');
        if (i === 0) {
            label.textContent = 'Strike Pattern Distribution';
        } else {
            label.textContent = `Strike Pattern Distribution ${i + 1}`;
        }
    }

    // Hide remove button if only one entry remains
    if (remainingEntries.length === 1) {
        remainingEntries[0].querySelector('.remove-strike-btn').style.display = 'none';
    }
}

// Update effort value display
document.getElementById('effort').addEventListener('input', function() {
    document.getElementById('effortValue').textContent = this.value;
});

// Form submission
document.getElementById('strikeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    logStrikeSession();
});

document.getElementById('addStrikeBtn').addEventListener('click', addStrikeEntry);

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sessionDate').value = today;

    updateStats();
    updateRiskAlert();
    updateChart();
    updateInsights();
    updateStrikeHistory();
});