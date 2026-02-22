// hormonal-adaptation-tracking-panel.js

let assessments = JSON.parse(localStorage.getItem('hormonalAssessments')) || [];

document.addEventListener('DOMContentLoaded', function() {
    initializeSliders();
    loadAssessments();
    updateStats();
    updateChart();
    updateHistory();
    updateCurrentScore();
});

function initializeSliders() {
    const sliders = [
        'cortisolLevel', 'testosteroneLevel', 'estrogenLevel', 'thyroidFunction', 
        'insulinSensitivity', 'growthHormone', 'energyLevels', 'moodStability', 
        'sleepQuality', 'recoveryRate', 'stressResponse', 'libido'
    ];
    
    sliders.forEach(slider => {
        const element = document.getElementById(slider);
        const valueElement = document.getElementById(slider.replace('Level', 'Value').replace('Function', 'Value').replace('Sensitivity', 'Value').replace('Hormone', 'Value').replace('Levels', 'Value').replace('Stability', 'Value').replace('Quality', 'Value').replace('Rate', 'Value').replace('Response', 'Value'));
        
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
        // Hormonal markers
        cortisolLevel: parseInt(document.getElementById('cortisolLevel').value),
        testosteroneLevel: parseInt(document.getElementById('testosteroneLevel').value),
        estrogenLevel: parseInt(document.getElementById('estrogenLevel').value),
        thyroidFunction: parseInt(document.getElementById('thyroidFunction').value),
        insulinSensitivity: parseInt(document.getElementById('insulinSensitivity').value),
        growthHormone: parseInt(document.getElementById('growthHormone').value),
        // Symptom indicators
        energyLevels: parseInt(document.getElementById('energyLevels').value),
        moodStability: parseInt(document.getElementById('moodStability').value),
        sleepQuality: parseInt(document.getElementById('sleepQuality').value),
        recoveryRate: parseInt(document.getElementById('recoveryRate').value),
        stressResponse: parseInt(document.getElementById('stressResponse').value),
        libido: parseInt(document.getElementById('libido').value),
        notes: document.getElementById('notes').value.trim(),
        adaptationIndex: calculateAdaptationIndex()
    };
    
    assessments.push(assessment);
    
    // Keep only last 50 assessments
    if (assessments.length > 50) {
        assessments = assessments.slice(-50);
    }
    
    localStorage.setItem('hormonalAssessments', JSON.stringify(assessments));
    
    // Reset form
    document.getElementById('assessmentForm').reset();
    initializeSliders();
    
    updateStats();
    updateChart();
    updateHistory();
    updateCurrentScore();
    
    alert('Assessment logged successfully!');
});

function calculateAdaptationIndex() {
    // Hormonal markers (weighted)
    const cortisol = parseInt(document.getElementById('cortisolLevel').value);
    const testosterone = parseInt(document.getElementById('testosteroneLevel').value);
    const estrogen = parseInt(document.getElementById('estrogenLevel').value);
    const thyroid = parseInt(document.getElementById('thyroidFunction').value);
    const insulin = parseInt(document.getElementById('insulinSensitivity').value);
    const growth = parseInt(document.getElementById('growthHormone').value);
    
    // Symptom indicators (weighted)
    const energy = parseInt(document.getElementById('energyLevels').value);
    const mood = parseInt(document.getElementById('moodStability').value);
    const sleep = parseInt(document.getElementById('sleepQuality').value);
    const recovery = parseInt(document.getElementById('recoveryRate').value);
    const stress = parseInt(document.getElementById('stressResponse').value);
    const libido = parseInt(document.getElementById('libido').value);
    
    // Invert negative indicators (lower cortisol and stress are better)
    const invertedCortisol = 11 - cortisol;
    const invertedStress = 11 - stress;
    
    // Calculate weighted scores
    const hormonalScore = (
        invertedCortisol * 0.15 +  // Cortisol (15%)
        testosterone * 0.15 +      // Testosterone (15%)
        estrogen * 0.15 +          // Estrogen balance (15%)
        thyroid * 0.15 +           // Thyroid (15%)
        insulin * 0.15 +           // Insulin sensitivity (15%)
        growth * 0.25              // Growth hormone (25%)
    );
    
    const symptomScore = (
        energy * 0.15 +           // Energy (15%)
        mood * 0.15 +             // Mood (15%)
        sleep * 0.15 +            // Sleep (15%)
        recovery * 0.20 +         // Recovery (20%)
        invertedStress * 0.15 +   // Stress response (15%)
        libido * 0.20             // Libido (20%)
    );
    
    // Overall adaptation index (average of hormonal and symptom scores)
    const adaptationIndex = Math.round((hormonalScore + symptomScore) / 2);
    
    return Math.min(100, Math.max(0, adaptationIndex));
}

function updateCurrentScore() {
    if (assessments.length === 0) {
        document.getElementById('adaptationIndex').textContent = '0';
        document.getElementById('scoreInterpretation').textContent = 'No assessments logged yet';
        return;
    }
    
    const latest = assessments[assessments.length - 1];
    document.getElementById('adaptationIndex').textContent = latest.adaptationIndex;
    
    let interpretation = '';
    if (latest.adaptationIndex >= 80) {
        interpretation = 'Excellent hormonal adaptation - Optimal balance achieved!';
        document.getElementById('adaptationIndex').style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
    } else if (latest.adaptationIndex >= 60) {
        interpretation = 'Good adaptation - Hormones responding well to demands';
        document.getElementById('adaptationIndex').style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
    } else if (latest.adaptationIndex >= 40) {
        interpretation = 'Moderate adaptation - Some hormonal stress detected';
        document.getElementById('adaptationIndex').style.background = 'linear-gradient(135deg, #FF5722, #D84315)';
    } else {
        interpretation = 'Low adaptation - Consider recovery protocols and testing';
        document.getElementById('adaptationIndex').style.background = 'linear-gradient(135deg, #F44336, #C62828)';
    }
    
    document.getElementById('scoreInterpretation').textContent = interpretation;
}

function updateStats() {
    if (assessments.length === 0) {
        document.getElementById('avgIndex').textContent = '0';
        document.getElementById('bestScore').textContent = '0';
        document.getElementById('totalAssessments').textContent = '0';
        document.getElementById('adaptationTrend').textContent = '0%';
        return;
    }
    
    const scores = assessments.map(a => a.adaptationIndex);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const best = Math.max(...scores);
    
    // Calculate adaptation trend (comparing first 10% to last 10%)
    let trend = 0;
    if (assessments.length >= 10) {
        const firstTenPercent = Math.ceil(assessments.length * 0.1);
        const lastTenPercent = Math.ceil(assessments.length * 0.1);
        
        const earlyScores = assessments.slice(0, firstTenPercent).map(a => a.adaptationIndex);
        const recentScores = assessments.slice(-lastTenPercent).map(a => a.adaptationIndex);
        
        const earlyAvg = earlyScores.reduce((a, b) => a + b, 0) / earlyScores.length;
        const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
        
        if (earlyAvg > 0) {
            trend = Math.round(((recentAvg - earlyAvg) / earlyAvg) * 100);
        }
    }
    
    document.getElementById('avgIndex').textContent = avg;
    document.getElementById('bestScore').textContent = best;
    document.getElementById('totalAssessments').textContent = assessments.length;
    document.getElementById('adaptationTrend').textContent = trend > 0 ? `+${trend}%` : `${trend}%`;
}

function updateChart() {
    const ctx = document.getElementById('hormonalChart').getContext('2d');
    
    // Sort assessments by date
    const sortedAssessments = assessments.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const labels = sortedAssessments.map(a => new Date(a.date).toLocaleDateString());
    const data = sortedAssessments.map(a => a.adaptationIndex);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Hormonal Adaptation Index',
                data: data,
                borderColor: '#9C27B0',
                backgroundColor: 'rgba(156, 39, 176, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Hormonal Adaptation Over Time'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Adaptation Index'
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
            <p><strong>Adaptation Index:</strong> <span class="duration">${assessment.adaptationIndex}/100</span></p>
            <div class="hormone-values">
                <span class="hormone-value">Cortisol: ${assessment.cortisolLevel}/10</span>
                <span class="hormone-value">Testosterone: ${assessment.testosteroneLevel}/10</span>
                <span class="hormone-value">Estrogen: ${assessment.estrogenLevel}/10</span>
                <span class="hormone-value">Thyroid: ${assessment.thyroidFunction}/10</span>
                <span class="hormone-value">Insulin: ${assessment.insulinSensitivity}/10</span>
                <span class="hormone-value">Growth: ${assessment.growthHormone}/10</span>
            </div>
            <div class="symptom-values">
                <span class="symptom-value">Energy: ${assessment.energyLevels}/10</span>
                <span class="symptom-value">Mood: ${assessment.moodStability}/10</span>
                <span class="symptom-value">Sleep: ${assessment.sleepQuality}/10</span>
                <span class="symptom-value">Recovery: ${assessment.recoveryRate}/10</span>
                <span class="symptom-value">Stress: ${assessment.stressResponse}/10</span>
                <span class="symptom-value">Libido: ${assessment.libido}/10</span>
            </div>
            ${assessment.notes ? '<p><strong>Notes:</strong> ' + assessment.notes + '</p>' : ''}
        `;
        
        history.appendChild(item);
    });
}

function loadAssessments() {
    // Assessments are loaded from localStorage at the top
}