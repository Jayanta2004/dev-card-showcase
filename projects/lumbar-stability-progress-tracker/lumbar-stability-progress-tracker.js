// lumbar-stability-progress-tracker.js

let assessments = JSON.parse(localStorage.getItem('lumbarAssessments')) || [];
let currentAssessment = null;
let selectedExercise = 'plank';

function selectExercise(exercise) {
    selectedExercise = exercise;

    // Update button states
    document.querySelectorAll('.exercise-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update form based on exercise type
    updateFormForExercise(exercise);
}

function updateFormForExercise(exercise) {
    const durationInput = document.getElementById('duration');
    const repsInput = document.getElementById('reps');

    switch(exercise) {
        case 'plank':
        case 'bridge':
            durationInput.placeholder = '30';
            repsInput.style.display = 'none';
            repsInput.previousElementSibling.style.display = 'none';
            break;
        case 'birdDog':
        case 'deadBug':
        case 'superman':
            durationInput.placeholder = 'N/A';
            durationInput.style.display = 'none';
            durationInput.previousElementSibling.style.display = 'none';
            repsInput.style.display = 'block';
            repsInput.previousElementSibling.style.display = 'block';
            repsInput.placeholder = '10';
            break;
    }
}

// Update difficulty and pain value displays
document.getElementById('difficulty').addEventListener('input', function() {
    document.getElementById('difficultyValue').textContent = this.value;
});

document.getElementById('pain').addEventListener('input', function() {
    document.getElementById('painValue').textContent = this.value;
});

function calculateStabilityScore() {
    const duration = parseFloat(document.getElementById('duration').value) || 0;
    const reps = parseFloat(document.getElementById('reps').value) || 0;
    const difficulty = parseInt(document.getElementById('difficulty').value);
    const pain = parseInt(document.getElementById('pain').value);

    if ((selectedExercise === 'plank' || selectedExercise === 'bridge') && duration <= 0) {
        alert('Please enter a valid duration for this exercise.');
        return;
    }

    if ((selectedExercise === 'birdDog' || selectedExercise === 'deadBug' || selectedExercise === 'superman') && reps <= 0) {
        alert('Please enter a valid number of repetitions for this exercise.');
        return;
    }

    // Calculate base score based on exercise type and performance
    let baseScore = 0;
    let performance = 0;

    switch(selectedExercise) {
        case 'plank':
            performance = Math.min(duration / 60, 1) * 100; // Max score at 60 seconds
            baseScore = performance;
            break;
        case 'bridge':
            performance = Math.min(duration / 45, 1) * 100; // Max score at 45 seconds
            baseScore = performance;
            break;
        case 'birdDog':
            performance = Math.min(reps / 15, 1) * 100; // Max score at 15 reps per side
            baseScore = performance;
            break;
        case 'deadBug':
            performance = Math.min(reps / 12, 1) * 100; // Max score at 12 reps per side
            baseScore = performance;
            break;
        case 'superman':
            performance = Math.min(reps / 20, 1) * 100; // Max score at 20 reps
            baseScore = performance;
            break;
    }

    // Adjust for difficulty and pain
    const difficultyPenalty = (difficulty - 5) * 2; // Penalty for higher difficulty
    const painPenalty = pain * 5; // Significant penalty for pain

    let stabilityScore = Math.max(0, Math.min(100, baseScore - difficultyPenalty - painPenalty));

    // Determine category
    let category;
    if (stabilityScore >= 80) category = 'Excellent';
    else if (stabilityScore >= 60) category = 'Good';
    else if (stabilityScore >= 40) category = 'Fair';
    else if (stabilityScore >= 20) category = 'Poor';
    else category = 'Very Poor';

    // Calculate progress rating compared to previous assessments
    let progressRating = '--';
    if (assessments.length > 0) {
        const recentScores = assessments.slice(-3).map(a => a.stabilityScore);
        const avgRecent = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
        const progress = ((stabilityScore - avgRecent) / avgRecent) * 100;
        progressRating = progress > 0 ? `+${progress.toFixed(1)}%` : `${progress.toFixed(1)}%`;
    }

    // Determine risk level
    let riskLevel = 'Low';
    if (pain >= 7 || stabilityScore < 30) riskLevel = 'High';
    else if (pain >= 4 || stabilityScore < 50) riskLevel = 'Moderate';

    // Update results
    document.getElementById('stabilityScore').textContent = Math.round(stabilityScore);
    document.getElementById('stabilityCategory').textContent = category;
    document.getElementById('progressRating').textContent = progressRating;
    document.getElementById('riskLevel').textContent = riskLevel;

    // Store current assessment
    currentAssessment = {
        id: Date.now(),
        date: new Date().toISOString(),
        exercise: selectedExercise,
        duration: duration,
        reps: reps,
        difficulty: difficulty,
        pain: pain,
        stabilityScore: stabilityScore,
        category: category,
        progressRating: progressRating,
        riskLevel: riskLevel,
        notes: document.getElementById('notes').value.trim()
    };

    document.getElementById('saveAssessmentBtn').disabled = false;
}

function saveAssessment() {
    if (!currentAssessment) return;

    assessments.push(currentAssessment);
    localStorage.setItem('lumbarAssessments', JSON.stringify(assessments));

    updateStats();
    updateChart();
    updateHistory();

    // Reset form
    document.getElementById('duration').value = '';
    document.getElementById('reps').value = '';
    document.getElementById('difficulty').value = '5';
    document.getElementById('pain').value = '0';
    document.getElementById('difficultyValue').textContent = '5';
    document.getElementById('painValue').textContent = '0';
    document.getElementById('notes').value = '';
    document.getElementById('saveAssessmentBtn').disabled = true;

    // Reset results
    document.getElementById('stabilityScore').textContent = '0';
    document.getElementById('stabilityCategory').textContent = 'Not Assessed';
    document.getElementById('progressRating').textContent = '--';
    document.getElementById('riskLevel').textContent = 'Low';

    currentAssessment = null;
    alert('Assessment saved successfully!');
}

function updateStats() {
    if (assessments.length === 0) return;

    const avgStability = assessments.reduce((sum, a) => sum + a.stabilityScore, 0) / assessments.length;
    const bestScore = Math.max(...assessments.map(a => a.stabilityScore));

    document.getElementById('avgStability').textContent = Math.round(avgStability);
    document.getElementById('bestScore').textContent = bestScore;
    document.getElementById('totalAssessments').textContent = assessments.length;
}

function updateChart() {
    const ctx = document.getElementById('stabilityChart').getContext('2d');

    const labels = assessments.map(a => new Date(a.date).toLocaleDateString());
    const scores = assessments.map(a => a.stabilityScore);
    const painLevels = assessments.map(a => a.pain);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Stability Score',
                data: scores,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y'
            }, {
                label: 'Pain Level',
                data: painLevels,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Stability Score'
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
                        text: 'Pain Level (0-10)'
                    },
                    min: 0,
                    max: 10,
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

function updateHistory() {
    const historyDiv = document.getElementById('assessmentsHistory');
    historyDiv.innerHTML = '';

    const recentAssessments = assessments.slice(-5).reverse();

    recentAssessments.forEach(assessment => {
        const assessmentDiv = document.createElement('div');
        assessmentDiv.className = 'assessment-item';
        assessmentDiv.innerHTML = `
            <h4>${new Date(assessment.date).toLocaleString()}</h4>
            <p><strong>Exercise:</strong> ${assessment.exercise.charAt(0).toUpperCase() + assessment.exercise.slice(1)}</p>
            <p><strong>Performance:</strong> ${assessment.duration > 0 ? assessment.duration + 's' : assessment.reps + ' reps'}</p>
            <p><strong>Stability Score:</strong> ${assessment.stabilityScore} (${assessment.category})</p>
            <p><strong>Progress:</strong> ${assessment.progressRating} | <strong>Risk:</strong> ${assessment.riskLevel}</p>
            <p><strong>Difficulty:</strong> ${assessment.difficulty}/10 | <strong>Pain:</strong> ${assessment.pain}/10</p>
            ${assessment.notes ? `<p><strong>Notes:</strong> ${assessment.notes}</p>` : ''}
        `;
        historyDiv.appendChild(assessmentDiv);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateFormForExercise(selectedExercise);
    updateStats();
    updateChart();
    updateHistory();
});