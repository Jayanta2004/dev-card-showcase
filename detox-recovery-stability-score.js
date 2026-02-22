// detox-recovery-stability-score.js

let assessments = JSON.parse(localStorage.getItem('detoxAssessments')) || [];

document.addEventListener('DOMContentLoaded', function() {
    initializeSliders();
    loadAssessments();
    updateStats();
    updateChart();
    updateHistory();
    updateCurrentScore();
});

function initializeSliders() {
    const sliders = ['energyLevel', 'mood', 'cravings', 'sleepQuality', 'physicalSymptoms'];
    sliders.forEach(slider => {
        const element = document.getElementById(slider);
        const valueElement = document.getElementById(slider.replace('Level', 'Value').replace('Quality', 'Value').replace('Symptoms', 'Value'));
        
        element.addEventListener('input', function() {
            valueElement.textContent = this.value;
        });
    });
}

document.getElementById('assessmentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const assessment = {
        id: Date.now(),
        date: new Date().toISOString(),
        energyLevel: parseInt(document.getElementById('energyLevel').value),
        mood: parseInt(document.getElementById('mood').value),
        cravings: parseInt(document.getElementById('cravings').value),
        sleepQuality: parseInt(document.getElementById('sleepQuality').value),
        physicalSymptoms: parseInt(document.getElementById('physicalSymptoms').value),
        notes: document.getElementById('notes').value.trim(),
        stabilityScore: calculateStabilityScore()
    };
    
    assessments.push(assessment);
    
    // Keep only last 50 assessments
    if (assessments.length > 50) {
        assessments = assessments.slice(-50);
    }
    
    localStorage.setItem('detoxAssessments', JSON.stringify(assessments));
    
    // Reset form
    document.getElementById('assessmentForm').reset();
    initializeSliders();
    
    updateStats();
    updateChart();
    updateHistory();
    updateCurrentScore();
    
    alert('Assessment logged successfully!');
});

function calculateStabilityScore() {
    const energy = parseInt(document.getElementById('energyLevel').value);
    const mood = parseInt(document.getElementById('mood').value);
    const cravings = parseInt(document.getElementById('cravings').value);
    const sleep = parseInt(document.getElementById('sleepQuality').value);
    const symptoms = parseInt(document.getElementById('physicalSymptoms').value);
    
    // Invert cravings and symptoms (lower is better)
    const invertedCravings = 11 - cravings;
    const invertedSymptoms = 11 - symptoms;
    
    // Calculate weighted average (energy and mood weighted higher)
    const score = Math.round((energy * 0.25 + mood * 0.25 + invertedCravings * 0.2 + sleep * 0.15 + invertedSymptoms * 0.15) * 10);
    
    return Math.min(100, Math.max(0, score));
}

function updateCurrentScore() {
    if (assessments.length === 0) {
        document.getElementById('stabilityScore').textContent = '0';
        document.getElementById('scoreInterpretation').textContent = 'No assessments logged yet';
        return;
    }
    
    const latest = assessments[assessments.length - 1];
    document.getElementById('stabilityScore').textContent = latest.stabilityScore;
    
    let interpretation = '';
    if (latest.stabilityScore >= 80) {
        interpretation = 'Excellent stability - Recovery progressing well!';
        document.getElementById('stabilityScore').style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
    } else if (latest.stabilityScore >= 60) {
        interpretation = 'Good stability - Keep up the good work!';
        document.getElementById('stabilityScore').style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
    } else if (latest.stabilityScore >= 40) {
        interpretation = 'Moderate stability - Focus on self-care and support';
        document.getElementById('stabilityScore').style.background = 'linear-gradient(135deg, #FF5722, #D84315)';
    } else {
        interpretation = 'Low stability - Consider professional support';
        document.getElementById('stabilityScore').style.background = 'linear-gradient(135deg, #F44336, #C62828)';
    }
    
    document.getElementById('scoreInterpretation').textContent = interpretation;
}

function updateStats() {
    if (assessments.length === 0) {
        document.getElementById('avgStability').textContent = '0';
        document.getElementById('bestScore').textContent = '0';
        document.getElementById('totalAssessments').textContent = '0';
        document.getElementById('recoveryDays').textContent = '0';
        return;
    }
    
    const scores = assessments.map(a => a.stabilityScore);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const best = Math.max(...scores);
    
    // Calculate recovery days (consecutive days with assessments)
    const dates = assessments.map(a => new Date(a.date).toDateString());
    const uniqueDates = [...new Set(dates)];
    const recoveryDays = uniqueDates.length;
    
    document.getElementById('avgStability').textContent = avg;
    document.getElementById('bestScore').textContent = best;
    document.getElementById('totalAssessments').textContent = assessments.length;
    document.getElementById('recoveryDays').textContent = recoveryDays;
}

function updateChart() {
    const ctx = document.getElementById('stabilityChart').getContext('2d');
    
    // Sort assessments by date
    const sortedAssessments = assessments.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const labels = sortedAssessments.map(a => new Date(a.date).toLocaleDateString());
    const data = sortedAssessments.map(a => a.stabilityScore);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Stability Score',
                data: data,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Detox Recovery Stability Over Time'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Stability Score'
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
    const history = document.getElementById('assessmentsHistory');
    history.innerHTML = '';
    
    // Show last 10 assessments
    const recentAssessments = assessments.slice(-10).reverse();
    
    recentAssessments.forEach(assessment => {
        const item = document.createElement('div');
        item.className = 'session-entry';
        
        const date = new Date(assessment.date).toLocaleString();
        
        item.innerHTML = `
            <h4>${date}</h4>
            <p><strong>Stability Score:</strong> <span class="duration">${assessment.stabilityScore}/100</span></p>
            <p><strong>Energy:</strong> ${assessment.energyLevel}/10 | <strong>Mood:</strong> ${assessment.mood}/10 | <strong>Cravings:</strong> ${assessment.cravings}/10</p>
            <p><strong>Sleep:</strong> ${assessment.sleepQuality}/10 | <strong>Symptoms:</strong> ${assessment.physicalSymptoms}/10</p>
            ${assessment.notes ? '<p><strong>Notes:</strong> ' + assessment.notes + '</p>' : ''}
        `;
        
        history.appendChild(item);
    });
}

function loadAssessments() {
    // Assessments are loaded from localStorage at the top
}