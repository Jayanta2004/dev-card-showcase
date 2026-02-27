// muscular-firing-coordination-tracker.js

let sessions = JSON.parse(localStorage.getItem('muscularCoordinationSessions')) || [];
let coordinationChart = null;

function recordSession() {
    const exerciseName = document.getElementById('exerciseName').value.trim();
    const sessionDate = document.getElementById('sessionDate').value;
    const reps = parseInt(document.getElementById('reps').value);
    const coordinationRating = parseInt(document.getElementById('coordinationRating').value);
    const asymmetry = parseInt(document.getElementById('asymmetry').value);
    const notes = document.getElementById('sessionNotes').value.trim();

    // Get selected muscles and their firing order
    const muscleCheckboxes = document.querySelectorAll('.muscle-checkbox input[type="checkbox"]:checked');
    const muscles = [];

    muscleCheckboxes.forEach(checkbox => {
        const muscleName = checkbox.value;
        const orderInput = checkbox.parentElement.querySelector('.order-input');
        const order = parseInt(orderInput.value) || 999; // Default high order if not specified

        muscles.push({
            name: muscleName,
            order: order
        });
    });

    if (!exerciseName || !sessionDate || !reps || !coordinationRating || !asymmetry || muscles.length === 0) {
        alert('Please fill in all required fields and select at least one muscle group.');
        return;
    }

    // Sort muscles by firing order
    muscles.sort((a, b) => a.order - b.order);

    const session = {
        id: Date.now(),
        exerciseName,
        sessionDate,
        reps,
        coordinationRating,
        asymmetry,
        muscles,
        notes,
        createdAt: new Date().toISOString()
    };

    sessions.push(session);

    // Sort by date
    sessions.sort((a, b) => new Date(b.sessionDate) - new Date(a.sessionDate));

    localStorage.setItem('muscularCoordinationSessions', JSON.stringify(sessions));

    // Clear form
    document.getElementById('exerciseName').value = '';
    document.getElementById('sessionDate').value = '';
    document.getElementById('reps').value = '';
    document.getElementById('coordinationRating').value = '';
    document.getElementById('asymmetry').value = '';
    document.getElementById('sessionNotes').value = '';

    // Clear muscle selections
    document.querySelectorAll('.muscle-checkbox input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('.order-input').forEach(input => input.value = '');

    updateStats();
    updateAlert();
    updateChart();
    updateInsights();
    updateFilters();
    updateSessionList();
}

function calculateMetrics() {
    if (sessions.length === 0) {
        return {
            avgCoordination: 0,
            symmetryScore: 100,
            totalSessions: 0,
            uniqueExercises: 0
        };
    }

    const totalCoordination = sessions.reduce((sum, session) => sum + session.coordinationRating, 0);
    const avgCoordination = (totalCoordination / sessions.length).toFixed(1);

    // Symmetry score: lower asymmetry = higher symmetry score
    const totalAsymmetry = sessions.reduce((sum, session) => sum + session.asymmetry, 0);
    const avgAsymmetry = totalAsymmetry / sessions.length;
    const symmetryScore = Math.max(0, Math.min(100, 100 - (avgAsymmetry - 1) * 11.11)); // Convert 1-10 scale to 0-100

    const uniqueExercises = new Set(sessions.map(session => session.exerciseName)).size;

    return {
        avgCoordination: parseFloat(avgCoordination),
        symmetryScore: Math.round(symmetryScore),
        totalSessions: sessions.length,
        uniqueExercises
    };
}

function updateStats() {
    const metrics = calculateMetrics();

    document.getElementById('avgCoordination').textContent = metrics.avgCoordination;
    document.getElementById('symmetryScore').textContent = metrics.symmetryScore + '%';
    document.getElementById('totalSessions').textContent = metrics.totalSessions;
    document.getElementById('uniqueExercises').textContent = metrics.uniqueExercises;
}

function updateAlert() {
    const alertDiv = document.getElementById('coordinationAlert');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');

    if (sessions.length < 3) {
        alertDiv.classList.add('hidden');
        return;
    }

    const recentSessions = sessions.slice(0, 5); // Last 5 sessions
    const avgAsymmetry = recentSessions.reduce((sum, session) => sum + session.asymmetry, 0) / recentSessions.length;
    const avgCoordination = recentSessions.reduce((sum, session) => sum + session.coordinationRating, 0) / recentSessions.length;

    if (avgAsymmetry > 7) {
        alertTitle.textContent = 'High Movement Asymmetry';
        alertMessage.textContent = `Recent sessions show significant left/right imbalances (avg asymmetry: ${avgAsymmetry.toFixed(1)}/10). Consider consulting a trainer for form correction.`;
        alertDiv.classList.remove('hidden', 'warning');
        alertDiv.classList.add('critical');
    } else if (avgCoordination < 6) {
        alertTitle.textContent = 'Coordination Needs Improvement';
        alertMessage.textContent = `Your coordination ratings are below average (avg: ${avgCoordination.toFixed(1)}/10). Focus on controlled movements and proper form.`;
        alertDiv.classList.remove('hidden', 'critical');
        alertDiv.classList.add('warning');
    } else {
        alertDiv.classList.add('hidden');
    }
}

function updateChart() {
    const ctx = document.getElementById('coordinationChart').getContext('2d');
    const chartMetric = document.getElementById('chartMetric').value;
    const chartPeriod = document.getElementById('chartPeriod').value;

    if (coordinationChart) {
        coordinationChart.destroy();
    }

    // Filter sessions by period
    let filteredSessions = sessions;
    if (chartPeriod !== 'all') {
        const days = chartPeriod === '30days' ? 30 : 7;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        filteredSessions = sessions.filter(session => new Date(session.sessionDate) >= cutoffDate);
    }

    // Sort by date
    filteredSessions.sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));

    const labels = filteredSessions.map(session => new Date(session.sessionDate).toLocaleDateString());
    const data = filteredSessions.map(session => {
        switch(chartMetric) {
            case 'coordination': return session.coordinationRating;
            case 'asymmetry': return session.asymmetry;
            case 'muscleCount': return session.muscles.length;
            default: return session.coordinationRating;
        }
    });

    const metricLabel = chartMetric === 'coordination' ? 'Coordination Rating' :
                       chartMetric === 'asymmetry' ? 'Asymmetry Level' :
                       'Muscles Involved';

    coordinationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: metricLabel,
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: chartMetric === 'muscleCount' ? 10 : 10,
                    title: {
                        display: true,
                        text: chartMetric === 'coordination' ? 'Rating (1-10)' :
                              chartMetric === 'asymmetry' ? 'Asymmetry (1-10)' :
                              'Muscle Count'
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

function updateInsights() {
    const insightsDiv = document.getElementById('insights');

    if (sessions.length === 0) {
        insightsDiv.innerHTML = '<p>Record exercise sessions to receive personalized insights about your muscular coordination patterns and improvement suggestions.</p>';
        return;
    }

    const insights = [];

    // Analyze coordination trends
    const recentSessions = sessions.slice(0, Math.min(10, sessions.length));
    const coordinationTrend = recentSessions.map(s => s.coordinationRating);
    const avgCoordination = coordinationTrend.reduce((sum, rating) => sum + rating, 0) / coordinationTrend.length;

    if (coordinationTrend.length >= 3) {
        const firstHalf = coordinationTrend.slice(0, Math.floor(coordinationTrend.length / 2));
        const secondHalf = coordinationTrend.slice(Math.floor(coordinationTrend.length / 2));

        const firstAvg = firstHalf.reduce((sum, rating) => sum + rating, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, rating) => sum + rating, 0) / secondHalf.length;

        if (secondAvg > firstAvg + 0.5) {
            insights.push(`<div class="insight-item"><i class="fas fa-chart-line"></i> <strong>Improving Coordination:</strong> Your coordination ratings have improved by ${(secondAvg - firstAvg).toFixed(1)} points recently. Keep up the good work!</div>`);
        } else if (firstAvg > secondAvg + 0.5) {
            insights.push(`<div class="insight-item"><i class="fas fa-exclamation-triangle"></i> <strong>Coordination Decline:</strong> Your recent coordination ratings are lower than before. Consider reviewing your form or reducing training intensity.</div>`);
        }
    }

    // Analyze muscle involvement patterns
    const muscleFrequency = {};
    sessions.forEach(session => {
        session.muscles.forEach(muscle => {
            muscleFrequency[muscle.name] = (muscleFrequency[muscle.name] || 0) + 1;
        });
    });

    const mostUsedMuscle = Object.keys(muscleFrequency).reduce((a, b) =>
        muscleFrequency[a] > muscleFrequency[b] ? a : b, '');

    if (mostUsedMuscle) {
        const usage = muscleFrequency[mostUsedMuscle];
        const totalSessions = sessions.length;
        const usagePercentage = (usage / totalSessions) * 100;

        if (usagePercentage > 80) {
            insights.push(`<div class="insight-item"><i class="fas fa-balance-scale"></i> <strong>Muscle Imbalance:</strong> ${mostUsedMuscle.charAt(0).toUpperCase() + mostUsedMuscle.slice(1)} is involved in ${usagePercentage.toFixed(0)}% of your exercises. Consider adding more variety to balance muscle development.</div>`);
        }
    }

    // Analyze asymmetry patterns
    const highAsymmetrySessions = sessions.filter(session => session.asymmetry > 7);
    if (highAsymmetrySessions.length > sessions.length * 0.3) {
        insights.push(`<div class="insight-item"><i class="fas fa-exclamation-circle"></i> <strong>Asymmetry Alert:</strong> ${highAsymmetrySessions.length} of your recent sessions show high movement asymmetry. Focus on unilateral exercises and form correction.</div>`);
    }

    // Analyze exercise-specific patterns
    const exerciseGroups = {};
    sessions.forEach(session => {
        if (!exerciseGroups[session.exerciseName]) {
            exerciseGroups[session.exerciseName] = [];
        }
        exerciseGroups[session.exerciseName].push(session);
    });

    Object.keys(exerciseGroups).forEach(exercise => {
        const exerciseSessions = exerciseGroups[exercise];
        if (exerciseSessions.length >= 3) {
            const avgCoordination = exerciseSessions.reduce((sum, s) => sum + s.coordinationRating, 0) / exerciseSessions.length;
            if (avgCoordination < 6) {
                insights.push(`<div class="insight-item"><i class="fas fa-dumbbell"></i> <strong>${exercise} Focus:</strong> Your coordination for ${exercise} is below average. Consider breaking down the movement or reducing weight.</div>`);
            }
        }
    });

    if (insights.length === 0) {
        insights.push('<div class="insight-item"><i class="fas fa-thumbs-up"></i> <strong>Good Coordination:</strong> Your muscular coordination patterns look well-balanced. Continue with your current training approach.</div>');
    }

    insightsDiv.innerHTML = insights.join('');
}

function updateFilters() {
    const filterExercise = document.getElementById('filterExercise');
    const sequenceExercise = document.getElementById('sequenceExercise');

    // Get unique exercises
    const exercises = [...new Set(sessions.map(session => session.exerciseName))].sort();

    // Update filter dropdown
    filterExercise.innerHTML = '<option value="all">All Exercises</option>';
    exercises.forEach(exercise => {
        filterExercise.innerHTML += `<option value="${exercise}">${exercise}</option>`;
    });

    // Update sequence dropdown
    sequenceExercise.innerHTML = '<option value="">Select Exercise</option>';
    exercises.forEach(exercise => {
        sequenceExercise.innerHTML += `<option value="${exercise}">${exercise}</option>`;
    });
}

function updateSessionList() {
    const sessionListDiv = document.getElementById('sessionList');
    const filterExercise = document.getElementById('filterExercise').value;
    const sortBy = document.getElementById('sortBy').value;

    let filteredSessions = sessions;

    if (filterExercise !== 'all') {
        filteredSessions = sessions.filter(session => session.exerciseName === filterExercise);
    }

    // Sort sessions
    filteredSessions.sort((a, b) => {
        switch(sortBy) {
            case 'date':
                return new Date(b.sessionDate) - new Date(a.sessionDate);
            case 'coordination':
                return b.coordinationRating - a.coordinationRating;
            case 'asymmetry':
                return b.asymmetry - a.asymmetry;
            default:
                return 0;
        }
    });

    if (filteredSessions.length === 0) {
        sessionListDiv.innerHTML = '<p class="no-sessions">No sessions found matching the current filters.</p>';
        return;
    }

    sessionListDiv.innerHTML = filteredSessions.map(session => `
        <div class="session-item">
            <div class="session-header">
                <div>
                    <h4 class="session-title">${session.exerciseName}</h4>
                    <p class="session-date">${new Date(session.sessionDate).toLocaleDateString()} • ${session.reps} reps</p>
                </div>
            </div>
            <div class="session-metrics">
                <div class="metric-item">
                    <div class="metric-label">Coordination</div>
                    <div class="metric-value">${session.coordinationRating}/10</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Asymmetry</div>
                    <div class="metric-value">${session.asymmetry}/10</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Muscles</div>
                    <div class="metric-value">${session.muscles.length}</div>
                </div>
            </div>
            <div class="session-muscles">
                <h5>Muscle Firing Sequence:</h5>
                <div class="muscle-tags">
                    ${session.muscles.map(muscle => `<span class="muscle-tag">${muscle.order}. ${muscle.name.charAt(0).toUpperCase() + muscle.name.slice(1)}</span>`).join('')}
                </div>
            </div>
            ${session.notes ? `<p class="session-notes">${session.notes}</p>` : ''}
            <div class="session-actions">
                <button class="btn-secondary" onclick="editSession(${session.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-danger" onclick="deleteSession(${session.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function showFiringSequence() {
    const sequenceExercise = document.getElementById('sequenceExercise').value;
    const sequenceDiv = document.getElementById('sequenceVisualization');

    if (!sequenceExercise) {
        sequenceDiv.innerHTML = '<p>Please select an exercise to visualize the firing sequence.</p>';
        return;
    }

    const exerciseSessions = sessions.filter(session => session.exerciseName === sequenceExercise);
    if (exerciseSessions.length === 0) {
        sequenceDiv.innerHTML = '<p>No sessions found for this exercise.</p>';
        return;
    }

    // Analyze common firing patterns
    const musclePatterns = {};
    exerciseSessions.forEach(session => {
        session.muscles.forEach(muscle => {
            if (!musclePatterns[muscle.name]) {
                musclePatterns[muscle.name] = [];
            }
            musclePatterns[muscle.name].push(muscle.order);
        });
    });

    // Calculate average firing order for each muscle
    const avgPatterns = {};
    Object.keys(musclePatterns).forEach(muscle => {
        const orders = musclePatterns[muscle];
        const avgOrder = orders.reduce((sum, order) => sum + order, 0) / orders.length;
        avgPatterns[muscle] = avgOrder;
    });

    // Sort by average firing order
    const sortedMuscles = Object.keys(avgPatterns).sort((a, b) => avgPatterns[a] - avgPatterns[b]);

    sequenceDiv.innerHTML = `
        <h4>${sequenceExercise} - Average Muscle Firing Sequence</h4>
        <div class="sequence-timeline">
            ${sortedMuscles.map((muscle, index) => `
                <div class="sequence-step">
                    <div class="step-number">${index + 1}</div>
                    <div class="step-muscle">${muscle.charAt(0).toUpperCase() + muscle.slice(1)}</div>
                    <div class="step-timing">Avg order: ${avgPatterns[muscle].toFixed(1)}</div>
                </div>
            `).join('')}
        </div>
        <p class="sequence-note">Based on ${exerciseSessions.length} session${exerciseSessions.length > 1 ? 's' : ''}</p>
    `;
}

function deleteSession(sessionId) {
    if (confirm('Are you sure you want to delete this session?')) {
        sessions = sessions.filter(session => session.id !== sessionId);
        localStorage.setItem('muscularCoordinationSessions', JSON.stringify(sessions));
        updateStats();
        updateAlert();
        updateChart();
        updateInsights();
        updateFilters();
        updateSessionList();
    }
}

function editSession(sessionId) {
    // For simplicity, we'll just prompt for basic edits
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const newCoordination = prompt('Edit coordination rating (1-10):', session.coordinationRating);
    if (newCoordination && !isNaN(newCoordination) && newCoordination >= 1 && newCoordination <= 10) {
        session.coordinationRating = parseInt(newCoordination);
        localStorage.setItem('muscularCoordinationSessions', JSON.stringify(sessions));
        updateStats();
        updateChart();
        updateSessionList();
    }
}

// Event listeners
document.getElementById('exerciseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    recordSession();
});

document.getElementById('chartMetric').addEventListener('change', updateChart);
document.getElementById('chartPeriod').addEventListener('change', updateChart);
document.getElementById('filterExercise').addEventListener('change', updateSessionList);
document.getElementById('sortBy').addEventListener('change', updateSessionList);
document.getElementById('showSequenceBtn').addEventListener('click', showFiringSequence);

// Set default date to today
document.getElementById('sessionDate').valueAsDate = new Date();

// Initialize
updateStats();
updateAlert();
updateChart();
updateInsights();
updateFilters();
updateSessionList();