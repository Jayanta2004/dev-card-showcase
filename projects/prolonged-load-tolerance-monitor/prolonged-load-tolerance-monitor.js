// prolonged-load-tolerance-monitor.js

let assessments = JSON.parse(localStorage.getItem('loadToleranceAssessments')) || [];

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
        'enduranceCapacity', 'fatigueAccumulation', 'recoveryRate', 'performanceStability', 
        'loadAdaptation', 'overtrainingRisk', 'intensity'
    ];
    
    sliders.forEach(slider => {
        const element = document.getElementById(slider);
        const valueElement = document.getElementById(slider.replace('Capacity', 'Value').replace('Accumulation', 'Value').replace('Rate', 'Value').replace('Stability', 'Value').replace('Adaptation', 'Value').replace('Risk', 'Value'));
        
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
        // Load tolerance metrics
        enduranceCapacity: parseInt(document.getElementById('enduranceCapacity').value),
        fatigueAccumulation: parseInt(document.getElementById('fatigueAccumulation').value),
        recoveryRate: parseInt(document.getElementById('recoveryRate').value),
        performanceStability: parseInt(document.getElementById('performanceStability').value),
        loadAdaptation: parseInt(document.getElementById('loadAdaptation').value),
        overtrainingRisk: parseInt(document.getElementById('overtrainingRisk').value),
        // Activity details
        activityType: document.getElementById('activityType').value,
        duration: parseInt(document.getElementById('duration').value) || 0,
        intensity: parseInt(document.getElementById('intensity').value),
        notes: document.getElementById('notes').value.trim(),
        toleranceIndex: calculateToleranceIndex()
    };
    
    assessments.push(assessment);
    
    // Keep only last 50 assessments
    if (assessments.length > 50) {
        assessments = assessments.slice(-50);
    }
    
    localStorage.setItem('loadToleranceAssessments', JSON.stringify(assessments));
    
    // Reset form
    document.getElementById('assessmentForm').reset();
    initializeSliders();
    
    updateStats();
    updateChart();
    updateHistory();
    updateCurrentScore();
    
    alert('Assessment logged successfully!');
});

function calculateToleranceIndex() {
    // Load tolerance metrics
    const endurance = parseInt(document.getElementById('enduranceCapacity').value);
    const fatigue = parseInt(document.getElementById('fatigueAccumulation').value);
    const recovery = parseInt(document.getElementById('recoveryRate').value);
    const stability = parseInt(document.getElementById('performanceStability').value);
    const adaptation = parseInt(document.getElementById('loadAdaptation').value);
    const overtraining = parseInt(document.getElementById('overtrainingRisk').value);
    
    // Invert negative indicators (lower fatigue and overtraining risk are better)
    const invertedFatigue = 11 - fatigue;
    const invertedOvertraining = 11 - overtraining;
    
    // Calculate weighted scores
    const toleranceScore = (
        endurance * 0.20 +        // Endurance (20%)
        invertedFatigue * 0.20 +  // Fatigue (20%)
        recovery * 0.15 +         // Recovery (15%)
        stability * 0.15 +        // Stability (15%)
        adaptation * 0.15 +       // Adaptation (15%)
        invertedOvertraining * 0.15 // Overtraining risk (15%)
    );
    
    return Math.min(100, Math.max(0, Math.round(toleranceScore)));
}

function updateCurrentScore() {
    if (assessments.length === 0) {
        document.getElementById('toleranceIndex').textContent = '0';
        document.getElementById('scoreInterpretation').textContent = 'No assessments logged yet';
        return;
    }
    
    const latest = assessments[assessments.length - 1];
    document.getElementById('toleranceIndex').textContent = latest.toleranceIndex;
    
    let interpretation = '';
    if (latest.toleranceIndex >= 80) {
        interpretation = 'Excellent load tolerance - High endurance capacity!';
        document.getElementById('toleranceIndex').style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
    } else if (latest.toleranceIndex >= 60) {
        interpretation = 'Good load tolerance - Performing well under load';
        document.getElementById('toleranceIndex').style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
    } else if (latest.toleranceIndex >= 40) {
        interpretation = 'Moderate load tolerance - Monitor fatigue levels';
        document.getElementById('toleranceIndex').style.background = 'linear-gradient(135deg, #FF5722, #D84315)';
    } else {
        interpretation = 'Low load tolerance - Consider recovery protocols';
        document.getElementById('toleranceIndex').style.background = 'linear-gradient(135deg, #F44336, #C62828)';
    }
    
    document.getElementById('scoreInterpretation').textContent = interpretation;
}

function updateStats() {
    if (assessments.length === 0) {
        document.getElementById('avgIndex').textContent = '0';
        document.getElementById('bestScore').textContent = '0';
        document.getElementById('totalAssessments').textContent = '0';
        document.getElementById('toleranceTrend').textContent = '0%';
        return;
    }
    
    const scores = assessments.map(a => a.toleranceIndex);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const best = Math.max(...scores);
    
    // Calculate tolerance trend (comparing first 10% to last 10%)
    let trend = 0;
    if (assessments.length >= 10) {
        const firstTenPercent = Math.ceil(assessments.length * 0.1);
        const lastTenPercent = Math.ceil(assessments.length * 0.1);
        
        const earlyScores = assessments.slice(0, firstTenPercent).map(a => a.toleranceIndex);
        const recentScores = assessments.slice(-lastTenPercent).map(a => a.toleranceIndex);
        
        const earlyAvg = earlyScores.reduce((a, b) => a + b, 0) / earlyScores.length;
        const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
        
        if (earlyAvg > 0) {
            trend = Math.round(((recentAvg - earlyAvg) / earlyAvg) * 100);
        }
    }
    
    document.getElementById('avgIndex').textContent = avg;
    document.getElementById('bestScore').textContent = best;
    document.getElementById('totalAssessments').textContent = assessments.length;
    document.getElementById('toleranceTrend').textContent = trend > 0 ? `+${trend}%` : `${trend}%`;
}

function updateChart() {
    const ctx = document.getElementById('loadChart').getContext('2d');
    
    // Sort assessments by date
    const sortedAssessments = assessments.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const labels = sortedAssessments.map(a => new Date(a.date).toLocaleDateString());
    const data = sortedAssessments.map(a => a.toleranceIndex);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Load Tolerance Index',
                data: data,
                borderColor: '#FF6B35',
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Prolonged Load Tolerance Over Time'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Tolerance Index'
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
        const activityNames = {
            'cardio': 'Cardiovascular Exercise',
            'strength': 'Strength Training',
            'endurance': 'Endurance Training',
            'mental': 'Mental Work',
            'mixed': 'Mixed Activities',
            'other': 'Other Activity'
        };
        
        item.innerHTML = `
            <h4>${date}</h4>
            <p><strong>Tolerance Index:</strong> <span class="duration">${assessment.toleranceIndex}/100</span></p>
            <div class="load-values">
                <span class="load-value">Endurance: ${assessment.enduranceCapacity}/10</span>
                <span class="load-value">Fatigue: ${assessment.fatigueAccumulation}/10</span>
                <span class="load-value">Recovery: ${assessment.recoveryRate}/10</span>
                <span class="load-value">Stability: ${assessment.performanceStability}/10</span>
                <span class="load-value">Adaptation: ${assessment.loadAdaptation}/10</span>
                <span class="load-value">Overtraining: ${assessment.overtrainingRisk}/10</span>
            </div>
            <div class="activity-details">
                <strong>Activity:</strong> ${activityNames[assessment.activityType] || assessment.activityType} | 
                <strong>Duration:</strong> ${assessment.duration} min | 
                <strong>Intensity:</strong> ${assessment.intensity}/10
            </div>
            ${assessment.notes ? '<p><strong>Notes:</strong> ' + assessment.notes + '</p>' : ''}
        `;
        
        history.appendChild(item);
    });
}

function loadAssessments() {
    // Assessments are loaded from localStorage at the top
}