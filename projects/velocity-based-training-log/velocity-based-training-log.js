// velocity-based-training-log.js

let trainingSessions = JSON.parse(localStorage.getItem('velocityTrainingSessions')) || [];

// Exercise velocity ranges (m/s) for optimal performance
const VELOCITY_RANGES = {
    squat: { fast: 0.75, moderate: 0.50, slow: 0.30 },
    deadlift: { fast: 0.70, moderate: 0.45, slow: 0.25 },
    bench: { fast: 0.80, moderate: 0.55, slow: 0.35 },
    overhead: { fast: 0.65, moderate: 0.40, slow: 0.20 },
    row: { fast: 0.85, moderate: 0.60, slow: 0.40 },
    pullup: { fast: 0.90, moderate: 0.65, slow: 0.45 },
    clean: { fast: 0.75, moderate: 0.50, slow: 0.30 },
    snatch: { fast: 0.80, moderate: 0.55, slow: 0.35 }
};

function logTrainingSession() {
    const date = document.getElementById('sessionDate').value;
    const exercise = document.getElementById('exerciseSelect').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const notes = document.getElementById('sessionNotes').value.trim();

    if (!date || !exercise || !weight) {
        alert('Please fill in all required fields.');
        return;
    }

    // Get sets data
    const setElements = document.querySelectorAll('.set-entry');
    const sets = [];

    for (let setElement of setElements) {
        const velocity = parseFloat(setElement.querySelector('.velocity-input-field').value);
        const reps = parseInt(setElement.querySelector('.reps-input-field').value);

        if (velocity && reps) {
            sets.push({ velocity, reps });
        }
    }

    if (sets.length === 0) {
        alert('Please add at least one set with velocity data.');
        return;
    }

    // Check if session already exists for this date and exercise
    const existingSession = trainingSessions.find(session =>
        session.date === date && session.exercise === exercise
    );

    if (existingSession) {
        if (!confirm('A session for this exercise already exists on this date. Do you want to update it?')) {
            return;
        }
        // Remove existing session
        trainingSessions = trainingSessions.filter(session =>
            !(session.date === date && session.exercise === exercise)
        );
    }

    // Calculate session metrics
    const sessionMetrics = calculateSessionMetrics(sets, exercise, weight);

    const session = {
        id: Date.now(),
        date,
        exercise,
        weight,
        sets,
        metrics: sessionMetrics,
        notes
    };

    trainingSessions.push(session);

    // Sort by date (most recent first)
    trainingSessions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Keep only last 100 sessions
    if (trainingSessions.length > 100) {
        trainingSessions = trainingSessions.slice(0, 100);
    }

    localStorage.setItem('velocityTrainingSessions', JSON.stringify(trainingSessions));

    // Clear form
    document.getElementById('sessionDate').value = '';
    document.getElementById('exerciseSelect').value = '';
    document.getElementById('weight').value = '';
    document.getElementById('sessionNotes').value = '';

    // Reset sets to one empty set
    document.getElementById('setsList').innerHTML = `
        <div class="set-entry">
            <div class="set-number">Set 1</div>
            <div class="velocity-input">
                <label>Velocity (m/s)</label>
                <input type="number" class="velocity-input-field" step="0.01" min="0" max="3" placeholder="0.00">
            </div>
            <div class="reps-input">
                <label>Reps</label>
                <input type="number" class="reps-input-field" min="1" max="20" value="1">
            </div>
            <button type="button" class="remove-set-btn" style="display: none;">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    updateStats();
    updateReadinessAlert();
    updateChart();
    updateInsights();
    updateSessionHistory();
}

function calculateSessionMetrics(sets, exercise, weight) {
    const velocities = sets.map(set => set.velocity);
    const avgVelocity = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
    const maxVelocity = Math.max(...velocities);
    const minVelocity = Math.min(...velocities);

    // Calculate velocity loss (percentage drop from first to last set)
    const velocityLoss = sets.length > 1 ?
        ((sets[0].velocity - sets[sets.length - 1].velocity) / sets[0].velocity) * 100 : 0;

    // Calculate velocity zone (fast, moderate, slow)
    const ranges = VELOCITY_RANGES[exercise];
    let velocityZone = 'moderate';
    if (avgVelocity >= ranges.fast) velocityZone = 'fast';
    else if (avgVelocity <= ranges.slow) velocityZone = 'slow';

    // Calculate optimal load recommendation
    const optimalLoad = calculateOptimalLoad(exercise, avgVelocity, weight);

    return {
        avgVelocity: parseFloat(avgVelocity.toFixed(3)),
        maxVelocity: parseFloat(maxVelocity.toFixed(3)),
        minVelocity: parseFloat(minVelocity.toFixed(3)),
        velocityLoss: parseFloat(velocityLoss.toFixed(1)),
        velocityZone,
        optimalLoad: parseFloat(optimalLoad.toFixed(1)),
        totalReps: sets.reduce((sum, set) => sum + set.reps, 0)
    };
}

function calculateOptimalLoad(exercise, avgVelocity, currentWeight) {
    const ranges = VELOCITY_RANGES[exercise];

    if (avgVelocity >= ranges.fast) {
        // Too light, can increase weight
        return currentWeight * 1.05; // 5% increase
    } else if (avgVelocity <= ranges.slow) {
        // Too heavy, should decrease weight
        return currentWeight * 0.95; // 5% decrease
    } else {
        // Optimal range, maintain or slight increase
        return currentWeight * 1.025; // 2.5% increase
    }
}

function getVelocityIndicator(velocity, exercise) {
    const ranges = VELOCITY_RANGES[exercise];

    if (velocity >= ranges.fast) return { class: 'velocity-fast', text: 'Fast' };
    if (velocity <= ranges.slow) return { class: 'velocity-slow', text: 'Slow' };
    return { class: 'velocity-moderate', text: 'Moderate' };
}

function updateStats() {
    const totalSessions = trainingSessions.length;

    if (totalSessions === 0) {
        document.getElementById('avgVelocity').textContent = '0.0 m/s';
        document.getElementById('optimalLoad').textContent = '0 kg';
        document.getElementById('readinessStatus').textContent = 'Unknown';
        document.getElementById('readinessStatus').className = 'stat-value';
        document.getElementById('totalSessions').textContent = '0';
        return;
    }

    // Calculate average velocity across all sessions
    const allVelocities = trainingSessions.flatMap(session =>
        session.sets.map(set => set.velocity)
    );
    const avgVelocity = allVelocities.reduce((sum, v) => sum + v, 0) / allVelocities.length;

    // Get most recent session's optimal load
    const recentSession = trainingSessions[0];
    const optimalLoad = recentSession.metrics.optimalLoad;

    // Calculate readiness status
    const readiness = calculateReadinessStatus();

    // Update display
    document.getElementById('avgVelocity').textContent = `${avgVelocity.toFixed(2)} m/s`;
    document.getElementById('optimalLoad').textContent = `${optimalLoad} kg`;
    document.getElementById('readinessStatus').textContent = readiness.status;
    document.getElementById('readinessStatus').className = `stat-value readiness-${readiness.class}`;
    document.getElementById('totalSessions').textContent = totalSessions;
}

function calculateReadinessStatus() {
    if (trainingSessions.length < 3) return { status: 'Unknown', class: '' };

    // Get last 3 sessions
    const recentSessions = trainingSessions.slice(0, 3);
    const avgVelocities = recentSessions.map(session => session.metrics.avgVelocity);
    const currentAvg = avgVelocities[0];
    const previousAvg = avgVelocities.slice(1).reduce((sum, v) => sum + v, 0) / (avgVelocities.length - 1);

    const velocityChange = ((currentAvg - previousAvg) / previousAvg) * 100;

    if (velocityChange > 5) return { status: 'Excellent', class: 'good' };
    if (velocityChange > -5) return { status: 'Good', class: 'good' };
    if (velocityChange > -15) return { status: 'Caution', class: 'caution' };
    return { status: 'Poor', class: 'poor' };
}

function updateReadinessAlert() {
    const alertDiv = document.getElementById('readinessAlert');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');

    if (trainingSessions.length < 3) {
        alertDiv.style.display = 'none';
        return;
    }

    const readiness = calculateReadinessStatus();
    const recentSession = trainingSessions[0];

    if (readiness.class === 'poor') {
        alertDiv.style.display = 'flex';
        alertTitle.textContent = 'Training Readiness Alert: High Fatigue Detected';
        alertMessage.textContent = `Your recent velocity (${recentSession.metrics.avgVelocity.toFixed(2)} m/s) is significantly below your baseline. Consider reducing training volume, ensuring adequate recovery, or consulting a coach about your training program.`;
    } else if (readiness.class === 'caution') {
        alertDiv.style.display = 'flex';
        alertTitle.textContent = 'Training Readiness Alert: Moderate Fatigue';
        alertMessage.textContent = `Your velocity is slightly below recent averages. Monitor your recovery closely and consider a deload week if fatigue persists.`;
    } else if (readiness.status === 'Excellent') {
        alertDiv.style.display = 'flex';
        alertTitle.textContent = 'Excellent Readiness: Prime for Progression';
        alertMessage.textContent = `Your velocity is strong! This is an ideal time to test new personal records or increase training intensity.`;
    } else {
        alertDiv.style.display = 'none';
    }
}

function updateChart() {
    const ctx = document.getElementById('velocityChart').getContext('2d');

    // Prepare data for last 20 sessions
    const chartSessions = trainingSessions.slice(0, 20).reverse();

    const labels = chartSessions.map(session => {
        const date = new Date(session.date);
        return date.toLocaleDateString();
    });

    const avgVelocities = chartSessions.map(session => session.metrics.avgVelocity);
    const velocityLosses = chartSessions.map(session => session.metrics.velocityLoss);
    const weights = chartSessions.map(session => session.weight);

    // Reference lines
    const exercise = chartSessions.length > 0 ? chartSessions[0].exercise : 'squat';
    const ranges = VELOCITY_RANGES[exercise];
    const fastLine = new Array(avgVelocities.length).fill(ranges.fast);
    const moderateLine = new Array(avgVelocities.length).fill((ranges.fast + ranges.slow) / 2);
    const slowLine = new Array(avgVelocities.length).fill(ranges.slow);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Velocity (m/s)',
                data: avgVelocities,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Velocity Loss (%)',
                data: velocityLosses,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Training Weight (kg)',
                data: weights,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                yAxisID: 'y2',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Fast Velocity Zone',
                data: fastLine,
                borderColor: '#28a745',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Optimal Velocity Zone',
                data: moderateLine,
                borderColor: '#ffc107',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Slow Velocity Zone',
                data: slowLine,
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
                        text: 'Velocity (m/s)'
                    },
                    min: 0,
                    max: 1.2
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Velocity Loss (%)'
                    },
                    min: 0,
                    max: 50,
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
                        text: 'Weight (kg)'
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

    if (trainingSessions.length < 3) {
        insightsDiv.innerHTML = '<p>Log at least 3 training sessions to receive personalized velocity-based training insights and recommendations.</p>';
        return;
    }

    // Analyze training patterns
    const recentSessions = trainingSessions.slice(0, 10);
    const exerciseCounts = {};
    recentSessions.forEach(session => {
        exerciseCounts[session.exercise] = (exerciseCounts[session.exercise] || 0) + 1;
    });

    const mostTrainedExercise = Object.entries(exerciseCounts)
        .sort(([,a], [,b]) => b - a)[0][0];

    // Calculate velocity trends
    const exerciseSessions = recentSessions.filter(s => s.exercise === mostTrainedExercise);
    const velocityTrend = exerciseSessions.length >= 2 ?
        exerciseSessions[0].metrics.avgVelocity - exerciseSessions[1].metrics.avgVelocity : 0;

    // Calculate average velocity loss
    const avgVelocityLoss = recentSessions.reduce((sum, s) => sum + s.metrics.velocityLoss, 0) / recentSessions.length;

    // Generate insights
    let insights = '<p>Based on your velocity-based training data:</p><ul>';

    if (velocityTrend > 0.05) {
        insights += '<li><strong>Velocity improving!</strong> Your recent sessions show increasing bar speeds, indicating good adaptation and readiness for progression.</li>';
    } else if (velocityTrend < -0.05) {
        insights += '<li><strong>Velocity declining.</strong> Your bar speeds are decreasing, which may indicate fatigue accumulation or the need for recovery.</li>';
    } else {
        insights += '<li><strong>Velocity stable.</strong> Your bar speeds are consistent, suggesting good training control and appropriate loading.</li>';
    }

    if (avgVelocityLoss > 20) {
        insights += '<li><strong>High velocity loss detected.</strong> You\'re experiencing significant fatigue within sessions. Consider reducing set volume or increasing rest periods.</li>';
    } else if (avgVelocityLoss < 10) {
        insights += '<li><strong>Low velocity loss.</strong> Your sessions show minimal fatigue accumulation. You may be able to handle increased volume or intensity.</li>';
    }

    const readiness = calculateReadinessStatus();
    if (readiness.class === 'good') {
        insights += '<li><strong>Good readiness status.</strong> Your velocity patterns indicate you\'re well-recovered and ready for quality training.</li>';
    } else if (readiness.class === 'caution') {
        insights += '<li><strong>Monitor recovery closely.</strong> Your velocity is trending downward. Ensure adequate sleep, nutrition, and consider a deload phase.</li>';
    }

    insights += `<li><strong>Primary exercise:</strong> ${mostTrainedExercise.charAt(0).toUpperCase() + mostTrainedExercise.slice(1)} (${exerciseCounts[mostTrainedExercise]} recent sessions). Focus on consistent velocity monitoring for this movement.`;
    insights += '<li><strong>Training recommendations:</strong> Aim for velocities in the moderate-fast range (green zone) for most sets. Use slow velocities as indicators to reduce load or increase recovery.</li>';
    insights += '<li><strong>Progress tracking:</strong> Velocity-based training is most effective when combined with progressive overload. Use your optimal load recommendations to guide weight increases.</li>';

    insights += '</ul>';

    insightsDiv.innerHTML = insights;
}

function updateSessionHistory() {
    const historyDiv = document.getElementById('sessionHistory');
    historyDiv.innerHTML = '';

    if (trainingSessions.length === 0) {
        historyDiv.innerHTML = '<p class="no-data">No training sessions logged yet. Start by logging your first session above.</p>';
        return;
    }

    // Show last 10 sessions
    const recentSessions = trainingSessions.slice(0, 10);

    recentSessions.forEach(session => {
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'session-entry';

        const exerciseName = session.exercise.charAt(0).toUpperCase() + session.exercise.slice(1);
        const setsBreakdown = session.sets.map((set, index) => {
            const indicator = getVelocityIndicator(set.velocity, session.exercise);
            return `
                <div class="set-item">
                    <span class="set-info">Set ${index + 1}: ${set.reps} reps @ ${set.velocity.toFixed(2)} m/s</span>
                    <span class="velocity-indicator velocity-${indicator.class}">${indicator.text}</span>
                </div>
            `;
        }).join('');

        sessionDiv.innerHTML = `
            <div class="session-header">
                <div class="session-date">${new Date(session.date).toLocaleDateString()}</div>
                <div class="session-exercise">${exerciseName} - ${session.weight}kg</div>
            </div>
            <div class="session-metrics">
                <div class="metric-item">
                    <div class="metric-label">Avg Velocity</div>
                    <div class="metric-value">${session.metrics.avgVelocity} m/s</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Velocity Loss</div>
                    <div class="metric-value">${session.metrics.velocityLoss}%</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Zone</div>
                    <div class="metric-value">${session.metrics.velocityZone}</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Optimal Load</div>
                    <div class="metric-value">${session.metrics.optimalLoad}kg</div>
                </div>
            </div>
            <div class="sets-breakdown">
                ${setsBreakdown}
            </div>
            ${session.notes ? `<div class="session-notes">${session.notes}</div>` : ''}
            <button class="delete-btn" onclick="deleteSession(${session.id})">Delete Session</button>
        `;

        historyDiv.appendChild(sessionDiv);
    });
}

function deleteSession(id) {
    if (confirm('Are you sure you want to delete this training session?')) {
        trainingSessions = trainingSessions.filter(session => session.id !== id);
        localStorage.setItem('velocityTrainingSessions', JSON.stringify(trainingSessions));
        updateStats();
        updateReadinessAlert();
        updateChart();
        updateInsights();
        updateSessionHistory();
    }
}

function addSet() {
    const setsList = document.getElementById('setsList');
    const setCount = setsList.children.length + 1;

    const setEntry = document.createElement('div');
    setEntry.className = 'set-entry';
    setEntry.innerHTML = `
        <div class="set-number">Set ${setCount}</div>
        <div class="velocity-input">
            <label>Velocity (m/s)</label>
            <input type="number" class="velocity-input-field" step="0.01" min="0" max="3" placeholder="0.00">
        </div>
        <div class="reps-input">
            <label>Reps</label>
            <input type="number" class="reps-input-field" min="1" max="20" value="1">
        </div>
        <button type="button" class="remove-set-btn" onclick="removeSet(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;

    setsList.appendChild(setEntry);

    // Show remove button for first set now that we have multiple sets
    if (setCount === 2) {
        setsList.children[0].querySelector('.remove-set-btn').style.display = 'block';
    }
}

function removeSet(button) {
    const setEntry = button.parentElement;
    const setsList = document.getElementById('setsList');

    setEntry.remove();

    // Renumber remaining sets
    const remainingSets = setsList.children;
    for (let i = 0; i < remainingSets.length; i++) {
        remainingSets[i].querySelector('.set-number').textContent = `Set ${i + 1}`;
    }

    // Hide remove button if only one set remains
    if (remainingSets.length === 1) {
        remainingSets[0].querySelector('.remove-set-btn').style.display = 'none';
    }
}

// Event listeners
document.getElementById('trainingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    logTrainingSession();
});

document.getElementById('addSetBtn').addEventListener('click', addSet);

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sessionDate').value = today;

    updateStats();
    updateReadinessAlert();
    updateChart();
    updateInsights();
    updateSessionHistory();
});