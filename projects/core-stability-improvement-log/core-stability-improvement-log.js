// core-stability-improvement-log.js

let coreEntries = JSON.parse(localStorage.getItem('coreStabilityEntries')) || [];

function logSession() {
    const date = document.getElementById('sessionDate').value;
    const exerciseType = document.getElementById('exerciseType').value;
    const exerciseVariation = document.getElementById('exerciseVariation').value;
    const sets = parseInt(document.getElementById('sets').value);
    const reps = parseInt(document.getElementById('reps').value) || 0;
    const holdTime = parseInt(document.getElementById('holdTime').value) || 0;
    const restTime = parseInt(document.getElementById('restTime').value);
    const difficultyLevel = parseInt(document.getElementById('difficultyLevel').value);
    const stabilityRating = parseInt(document.getElementById('stabilityRating').value);
    const muscleFatigue = parseInt(document.getElementById('muscleFatigue').value);
    const notes = document.getElementById('coreNotes').value.trim();

    if (!date || !exerciseType || !sets || !difficultyLevel || !stabilityRating) {
        alert('Please fill in all required fields.');
        return;
    }

    // Check if entry already exists for this date and exercise
    const existingEntry = coreEntries.find(entry =>
        entry.date === date && entry.exerciseType === exerciseType
    );
    if (existingEntry) {
        if (!confirm('An entry already exists for this date and exercise. Do you want to update it?')) {
            return;
        }
        // Remove existing entry
        coreEntries = coreEntries.filter(entry =>
            !(entry.date === date && entry.exerciseType === exerciseType)
        );
    }

    // Calculate total volume (work performed)
    const totalVolume = sets * (reps > 0 ? reps : 1) * (holdTime > 0 ? holdTime : 1);

    // Calculate stability score (combination of control, difficulty, and consistency)
    const stabilityScore = (stabilityRating * 0.5 + difficultyLevel * 0.3 + (11 - muscleFatigue) * 0.2);

    // Calculate training intensity (difficulty adjusted for volume and rest)
    const trainingIntensity = (difficultyLevel * totalVolume) / (restTime + 30);

    const entry = {
        id: Date.now(),
        date,
        exerciseType,
        exerciseVariation,
        sets,
        reps,
        holdTime,
        restTime,
        totalVolume,
        difficultyLevel,
        stabilityRating,
        stabilityScore: parseFloat(stabilityScore.toFixed(1)),
        muscleFatigue,
        trainingIntensity: parseFloat(trainingIntensity.toFixed(2)),
        notes
    };

    coreEntries.push(entry);

    // Sort by date
    coreEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Keep only last 50 entries
    if (coreEntries.length > 50) {
        coreEntries = coreEntries.slice(-50);
    }

    localStorage.setItem('coreStabilityEntries', JSON.stringify(coreEntries));

    // Clear form
    document.getElementById('sessionDate').value = '';
    document.getElementById('exerciseType').value = '';
    document.getElementById('exerciseVariation').value = 'standard';
    document.getElementById('sets').value = '3';
    document.getElementById('reps').value = '';
    document.getElementById('holdTime').value = '';
    document.getElementById('restTime').value = '60';
    document.getElementById('difficultyLevel').value = '';
    document.getElementById('stabilityRating').value = '';
    document.getElementById('muscleFatigue').value = 6;
    document.getElementById('fatigueValue').textContent = '6';
    document.getElementById('coreNotes').value = '';

    updateStats();
    updateChart();
    updateInsights();
    updateSessionList();
}

function getStabilityStatus(stabilityScore) {
    if (stabilityScore >= 8) return { status: 'Excellent', class: 'stability-excellent' };
    if (stabilityScore >= 6) return { status: 'Good', class: 'stability-good' };
    if (stabilityScore >= 4) return { status: 'Fair', class: 'stability-fair' };
    return { status: 'Poor', class: 'stability-poor' };
}

function updateStats() {
    const totalSessions = coreEntries.length;

    if (totalSessions === 0) {
        document.getElementById('avgStability').textContent = '0.0';
        document.getElementById('strengthProgress').textContent = '0%';
        document.getElementById('topExercise').textContent = 'None';
        document.getElementById('totalSessions').textContent = '0';
        return;
    }

    // Average stability score
    const avgStability = coreEntries.reduce((sum, entry) => sum + entry.stabilityScore, 0) / totalSessions;

    // Strength progress (percentage increase from first to last entry)
    const firstEntry = coreEntries[0];
    const lastEntry = coreEntries[coreEntries.length - 1];
    const strengthProgress = firstEntry.stabilityScore > 0 ?
        ((lastEntry.stabilityScore - firstEntry.stabilityScore) / firstEntry.stabilityScore * 100) : 0;

    // Find most practiced exercise
    const exerciseStats = {};
    coreEntries.forEach(entry => {
        if (!exerciseStats[entry.exerciseType]) {
            exerciseStats[entry.exerciseType] = { sessions: 0, totalScore: 0 };
        }
        exerciseStats[entry.exerciseType].sessions++;
        exerciseStats[entry.exerciseType].totalScore += entry.stabilityScore;
    });

    let topExercise = 'None';
    let maxAvgScore = 0;
    Object.keys(exerciseStats).forEach(exercise => {
        const avgScore = exerciseStats[exercise].totalScore / exerciseStats[exercise].sessions;
        if (avgScore > maxAvgScore) {
            maxAvgScore = avgScore;
            topExercise = exercise.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    });

    document.getElementById('avgStability').textContent = avgStability.toFixed(1);
    document.getElementById('strengthProgress').textContent = `${strengthProgress.toFixed(1)}%`;
    document.getElementById('topExercise').textContent = topExercise;
    document.getElementById('totalSessions').textContent = totalSessions;
}

function updateChart() {
    const ctx = document.getElementById('coreChart').getContext('2d');

    // Prepare data for last 20 entries
    const chartEntries = coreEntries.slice(-20);

    const labels = chartEntries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString();
    });

    const stabilityScores = chartEntries.map(entry => entry.stabilityScore);
    const difficultyLevels = chartEntries.map(entry => entry.difficultyLevel);
    const totalVolumes = chartEntries.map(entry => entry.totalVolume);
    const muscleFatigue = chartEntries.map(entry => entry.muscleFatigue);

    // Reference lines
    const goodStability = new Array(stabilityScores.length).fill(6);
    const excellentStability = new Array(stabilityScores.length).fill(8);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Stability Score',
                data: stabilityScores,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Difficulty Level',
                data: difficultyLevels,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Total Volume',
                data: totalVolumes,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                yAxisID: 'y2',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Muscle Fatigue',
                data: muscleFatigue,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Good Stability (6+)',
                data: goodStability,
                borderColor: '#17a2b8',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Excellent Stability (8+)',
                data: excellentStability,
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
                        text: 'Stability Score (1-10)'
                    },
                    min: 1,
                    max: 10
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Difficulty/Fatigue (1-10)'
                    },
                    min: 1,
                    max: 10,
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
                        text: 'Total Volume'
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

    if (coreEntries.length < 5) {
        insightsDiv.innerHTML = '<p>Log at least 5 core stability sessions to receive personalized insights about your training progress and recommendations for optimal core development.</p>';
        return;
    }

    // Analyze patterns
    const recentEntries = coreEntries.slice(-10);
    const avgStability = recentEntries.reduce((sum, entry) => sum + entry.stabilityScore, 0) / recentEntries.length;
    const avgDifficulty = recentEntries.reduce((sum, entry) => sum + entry.difficultyLevel, 0) / recentEntries.length;
    const avgFatigue = recentEntries.reduce((sum, entry) => sum + entry.muscleFatigue, 0) / recentEntries.length;

    // Analyze exercise effectiveness
    const exerciseEffectiveness = {};
    coreEntries.forEach(entry => {
        if (!exerciseEffectiveness[entry.exerciseType]) {
            exerciseEffectiveness[entry.exerciseType] = { total: 0, count: 0 };
        }
        exerciseEffectiveness[entry.exerciseType].total += entry.stabilityScore;
        exerciseEffectiveness[entry.exerciseType].count++;
    });

    let bestExercise = '';
    let bestAvgStability = 0;
    Object.keys(exerciseEffectiveness).forEach(exercise => {
        const avgStability = exerciseEffectiveness[exercise].total / exerciseEffectiveness[exercise].count;
        if (avgStability > bestAvgStability) {
            bestAvgStability = avgStability;
            bestExercise = exercise;
        }
    });

    // Analyze volume progression
    const volumeProgression = [];
    for (let i = 1; i < recentEntries.length; i++) {
        const currentVolume = recentEntries[i].totalVolume;
        const previousVolume = recentEntries[i-1].totalVolume;
        volumeProgression.push(currentVolume > previousVolume ? 'increasing' : 'stable');
    }

    const increasingVolume = volumeProgression.filter(p => p === 'increasing').length;
    const volumeIncreaseRate = increasingVolume / volumeProgression.length;

    let insights = '<p>Based on your core stability training patterns:</p><ul>';

    if (avgStability >= 7) {
        insights += '<li><strong>Excellent core stability!</strong> Your balance and control are well-developed. Focus on maintaining this level while gradually increasing difficulty.</li>';
    } else if (avgStability >= 5) {
        insights += '<li><strong>Good progress in core stability.</strong> You\'re building solid foundational strength. Continue consistent training to reach higher stability levels.</li>';
    } else {
        insights += '<li><strong>Core stability needs attention.</strong> Focus on fundamental exercises with proper form. Consider starting with shorter hold times and fewer repetitions.</li>';
    }

    if (bestExercise) {
        const exerciseName = bestExercise.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        insights += `<li><strong>Most effective exercise:</strong> ${exerciseName} shows the highest stability scores (${bestAvgStability.toFixed(1)}/10 average). Prioritize this movement.</li>`;
    }

    if (avgFatigue >= 7) {
        insights += '<li><strong>High fatigue levels detected.</strong> Your core muscles may be overworked. Consider increasing rest times between sets or reducing training frequency.</li>';
    }

    if (volumeIncreaseRate > 0.6) {
        insights += '<li><strong>Rapid volume progression.</strong> You\'re increasing training volume quickly. Ensure adequate recovery to prevent injury and maintain form quality.</li>';
    } else if (volumeIncreaseRate < 0.3) {
        insights += '<li><strong>Stable training volume.</strong> Consider gradually increasing difficulty or volume to continue progressing. Try variations or longer hold times.</li>';
    }

    if (avgDifficulty < 5) {
        insights += '<li><strong>Training intensity consideration.</strong> Your exercises are relatively easy. Progress to more challenging variations like unstable surfaces or weighted movements.</li>';
    }

    insights += '<li><strong>Core training recommendations:</strong> Include a mix of isometric holds, dynamic movements, and anti-rotational exercises. Focus on quality over quantity, and ensure proper breathing throughout each movement.</li>';
    insights += '</ul>';

    insightsDiv.innerHTML = insights;
}

function updateSessionList() {
    const sessionList = document.getElementById('sessionList');
    sessionList.innerHTML = '';

    // Show last 10 entries
    const recentEntries = coreEntries.slice(-10).reverse();

    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'session-entry';

        const stabilityStatus = getStabilityStatus(entry.stabilityScore);

        entryDiv.innerHTML = `
            <div class="session-header">
                <div class="session-date">${new Date(entry.date).toLocaleDateString()}</div>
                <div class="stability-rating ${stabilityStatus.class}">${stabilityStatus.status} (${entry.stabilityScore})</div>
            </div>
            <div class="session-details">
                <div class="detail-item">
                    <div class="detail-label">Exercise</div>
                    <div class="detail-value">${entry.exerciseType.replace('-', ' ')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Variation</div>
                    <div class="detail-value">${entry.exerciseVariation}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Sets × Reps</div>
                    <div class="detail-value">${entry.sets}×${entry.reps || entry.holdTime + 's'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Difficulty</div>
                    <div class="detail-value">${entry.difficultyLevel}/10</div>
                </div>
            </div>
            <div class="session-metrics">
                <div class="metric-item">
                    <div class="metric-label">Stability</div>
                    <div class="metric-value">${entry.stabilityRating}/10</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Fatigue</div>
                    <div class="metric-value">${entry.muscleFatigue}/10</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Volume</div>
                    <div class="metric-value">${entry.totalVolume}</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Score</div>
                    <div class="metric-value">${entry.stabilityScore}/10</div>
                </div>
            </div>
            ${entry.notes ? `<div class="session-notes">${entry.notes}</div>` : ''}
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;

        sessionList.appendChild(entryDiv);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this core stability session?')) {
        coreEntries = coreEntries.filter(entry => entry.id !== id);
        localStorage.setItem('coreStabilityEntries', JSON.stringify(coreEntries));
        updateStats();
        updateChart();
        updateInsights();
        updateSessionList();
    }
}

// Update fatigue value display
document.getElementById('muscleFatigue').addEventListener('input', function() {
    document.getElementById('fatigueValue').textContent = this.value;
});

// Form submission
document.getElementById('coreForm').addEventListener('submit', function(e) {
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