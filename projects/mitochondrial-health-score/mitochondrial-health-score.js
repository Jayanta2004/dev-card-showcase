// mitochondrial-health-score.js

let assessments = JSON.parse(localStorage.getItem('mitochondrialAssessments')) || [];

document.addEventListener('DOMContentLoaded', function() {
    // Update range input displays
    const ranges = ['exerciseLevel', 'sleepQuality', 'dietQuality', 'stressLevel', 'energyLevel'];
    ranges.forEach(id => {
        const element = document.getElementById(id);
        const valueElement = document.getElementById(id.replace('Level', 'Value').replace('Quality', 'Value').replace('stressLevel', 'stressValue').replace('energyLevel', 'energyValue'));
        element.addEventListener('input', function() {
            valueElement.textContent = this.value;
        });
    });

    updateStats();
    updateChart();
    updateHistory();
});

function calculateScore() {
    // Get form values
    const exercise = parseFloat(document.getElementById('exerciseLevel').value);
    const sleep = parseInt(document.getElementById('sleepQuality').value);
    const diet = parseInt(document.getElementById('dietQuality').value);
    const stress = parseInt(document.getElementById('stressLevel').value);
    const energy = parseInt(document.getElementById('energyLevel').value);

    // Check supplements
    const supplements = {
        coq10: document.getElementById('coq10').checked,
        alphaLipoic: document.getElementById('alphaLipoic').checked,
        acetylCarnitine: document.getElementById('acetylCarnitine').checked,
        nad: document.getElementById('nad').checked
    };

    const supplementCount = Object.values(supplements).filter(Boolean).length;

    // Calculate weighted score
    // Exercise: 0-20 hours, optimal 7-10 hours moderate/high intensity
    let exerciseScore = Math.min(exercise * 5, 50); // Max 50 points

    // Sleep: 1-10, higher better
    const sleepScore = (sleep / 10) * 15; // Max 15 points

    // Diet: 1-10, higher better
    const dietScore = (diet / 10) * 15; // Max 15 points

    // Stress: 1-10, lower better (invert)
    const stressScore = ((11 - stress) / 10) * 10; // Max 10 points

    // Energy: 1-10, higher better
    const energyScore = (energy / 10) * 5; // Max 5 points

    // Supplements: 0-4, each gives 2.5 points
    const supplementScore = supplementCount * 2.5; // Max 10 points

    const totalScore = Math.round(exerciseScore + sleepScore + dietScore + stressScore + energyScore + supplementScore);

    // Display score
    displayScore(totalScore);

    // Generate recommendations
    generateRecommendations(exercise, sleep, diet, stress, energy, supplements);

    // Save assessment
    const assessment = {
        id: Date.now(),
        date: new Date().toISOString(),
        score: totalScore,
        factors: {
            exercise,
            sleep,
            diet,
            stress,
            energy,
            supplements
        }
    };

    assessments.push(assessment);
    localStorage.setItem('mitochondrialAssessments', JSON.stringify(assessments));

    updateStats();
    updateChart();
    updateHistory();
}

function displayScore(score) {
    const circle = document.getElementById('scoreCircle');
    const number = document.getElementById('scoreNumber');
    const interpretation = document.getElementById('scoreInterpretation');

    number.textContent = score;

    // Update circle color based on score
    let color, percentage;
    if (score >= 80) {
        color = '#28a745'; // Green
        percentage = 100;
    } else if (score >= 60) {
        color = '#ffc107'; // Yellow
        percentage = 75;
    } else {
        color = '#dc3545'; // Red
        percentage = 50;
    }

    circle.style.background = `conic-gradient(${color} ${percentage * 3.6}deg, #ddd 0deg)`;

    // Interpretation
    let interpretationText, level;
    if (score >= 80) {
        interpretationText = "Excellent mitochondrial health! Your cellular energy production is optimal.";
        level = "excellent";
    } else if (score >= 60) {
        interpretationText = "Good mitochondrial health. Some areas could be improved for better energy production.";
        level = "good";
    } else {
        interpretationText = "Mitochondrial health needs attention. Focus on lifestyle factors to improve cellular energy.";
        level = "needs-improvement";
    }

    interpretation.innerHTML = `
        <h3>${level.charAt(0).toUpperCase() + level.slice(1)} Health</h3>
        <p>${interpretationText}</p>
        <p><strong>Score Range:</strong> ${score >= 80 ? '80-100' : score >= 60 ? '60-79' : '0-59'}</p>
    `;
}

function generateRecommendations(exercise, sleep, diet, stress, energy, supplements) {
    const recommendations = [];

    if (exercise < 5) {
        recommendations.push({
            text: "Increase exercise to at least 5 hours per week. Include both aerobic and resistance training to boost mitochondrial biogenesis.",
            priority: "high"
        });
    } else if (exercise > 15) {
        recommendations.push({
            text: "Consider balancing high exercise volume with adequate recovery to prevent mitochondrial stress.",
            priority: "medium"
        });
    }

    if (sleep < 7) {
        recommendations.push({
            text: "Improve sleep quality and duration. Aim for 7-9 hours of quality sleep nightly for optimal mitochondrial repair.",
            priority: "high"
        });
    }

    if (diet < 6) {
        recommendations.push({
            text: "Focus on anti-inflammatory, nutrient-dense foods. Include plenty of vegetables, healthy fats, and quality proteins.",
            priority: "high"
        });
    }

    if (stress > 6) {
        recommendations.push({
            text: "Implement stress reduction techniques like meditation, deep breathing, or regular breaks to reduce mitochondrial oxidative stress.",
            priority: "high"
        });
    }

    if (energy < 6) {
        recommendations.push({
            text: "Address low energy levels through better nutrition, exercise, and recovery practices.",
            priority: "medium"
        });
    }

    const supplementCount = Object.values(supplements).filter(Boolean).length;
    if (supplementCount < 2) {
        recommendations.push({
            text: "Consider mitochondrial-supporting supplements like CoQ10, Alpha-Lipoic Acid, or NAD+ precursors under professional guidance.",
            priority: "medium"
        });
    }

    // Always include general recommendations
    recommendations.push({
        text: "Stay hydrated and maintain consistent meal timing to support mitochondrial function.",
        priority: "low"
    });

    recommendations.push({
        text: "Include intermittent fasting or time-restricted eating to promote mitochondrial autophagy and renewal.",
        priority: "low"
    });

    displayRecommendations(recommendations);
}

function displayRecommendations(recommendations) {
    const container = document.getElementById('recommendations');
    container.innerHTML = '';

    recommendations.forEach(rec => {
        const item = document.createElement('div');
        item.className = `recommendation-item ${rec.priority}`;
        item.innerHTML = `<p>${rec.text}</p>`;
        container.appendChild(item);
    });
}

function updateStats() {
    if (assessments.length === 0) return;

    const scores = assessments.map(a => a.score);
    const avgScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    const bestScore = Math.max(...scores);

    document.getElementById('avgScore').textContent = avgScore;
    document.getElementById('bestScore').textContent = bestScore;
    document.getElementById('totalAssessments').textContent = assessments.length;
}

function updateChart() {
    const ctx = document.getElementById('healthChart').getContext('2d');

    if (assessments.length === 0) {
        // Show empty chart
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Mitochondrial Health Score',
                    data: [],
                    borderColor: '#4fd1ff',
                    backgroundColor: 'rgba(79, 209, 255, 0.1)'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
        return;
    }

    const labels = assessments.map(a => new Date(a.date).toLocaleDateString());
    const scores = assessments.map(a => a.score);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Mitochondrial Health Score',
                data: scores,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Health Score'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
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
            <p><strong>Score:</strong> ${assessment.score}/100</p>
            <p><strong>Exercise:</strong> ${assessment.factors.exercise}h/week | <strong>Sleep:</strong> ${assessment.factors.sleep}/10 | <strong>Diet:</strong> ${assessment.factors.diet}/10</p>
            <p><strong>Stress:</strong> ${assessment.factors.stress}/10 | <strong>Energy:</strong> ${assessment.factors.energy}/10</p>
        `;
        historyDiv.appendChild(assessmentDiv);
    });
}