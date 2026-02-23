// neuromuscular-coordination-index.js

let assessments = JSON.parse(localStorage.getItem('coordinationAssessments')) || [];

document.addEventListener('DOMContentLoaded', function() {
    initializeSliders();
    loadAssessments();
    updateStats();
    updateChart();
    updateHistory();
    updateCurrentScore();
});

function initializeSliders() {
    const sliders = ['balance', 'reactionTime', 'precision', 'coordination', 'fatigue'];
    sliders.forEach(slider => {
        const element = document.getElementById(slider);
        const valueElement = document.getElementById(slider.replace('Time', '').replace('Control', '').replace('Movement', '').replace('Overall', '').replace('Coordination', '') + 'Value');
        
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
        balance: parseInt(document.getElementById('balance').value),
        reactionTime: parseInt(document.getElementById('reactionTime').value),
        precision: parseInt(document.getElementById('precision').value),
        coordination: parseInt(document.getElementById('coordination').value),
        fatigue: parseInt(document.getElementById('fatigue').value),
        exerciseType: document.getElementById('exerciseType').value,
        notes: document.getElementById('notes').value.trim(),
        coordinationIndex: calculateCoordinationIndex()
    };
    
    assessments.push(assessment);
    
    // Keep only last 50 assessments
    if (assessments.length > 50) {
        assessments = assessments.slice(-50);
    }
    
    localStorage.setItem('coordinationAssessments', JSON.stringify(assessments));
    
    // Reset form
    document.getElementById('assessmentForm').reset();
    initializeSliders();
    
    updateStats();
    updateChart();
    updateHistory();
    updateCurrentScore();
    
    alert('Assessment logged successfully!');
});

function calculateCoordinationIndex() {
    const balance = parseInt(document.getElementById('balance').value);
    const reaction = parseInt(document.getElementById('reactionTime').value);
    const precision = parseInt(document.getElementById('precision').value);
    const coordination = parseInt(document.getElementById('coordination').value);
    const fatigue = parseInt(document.getElementById('fatigue').value);
    
    // Invert reaction time and fatigue (lower is better)
    const invertedReaction = 11 - reaction;
    const invertedFatigue = 11 - fatigue;
    
    // Calculate weighted average
    const score = Math.round((balance * 0.2 + invertedReaction * 0.2 + precision * 0.2 + coordination * 0.25 + invertedFatigue * 0.15) * 10);
    
    return Math.min(100, Math.max(0, score));
}

function updateCurrentScore() {
    if (assessments.length === 0) {
        document.getElementById('coordinationIndex').textContent = '0';
        document.getElementById('scoreInterpretation').textContent = 'No assessments logged yet';
        return;
    }
    
    const latest = assessments[assessments.length - 1];
    document.getElementById('coordinationIndex').textContent = latest.coordinationIndex;
    
    let interpretation = '';
    if (latest.coordinationIndex >= 80) {
        interpretation = 'Excellent coordination - Keep up the great work!';
        document.getElementById('coordinationIndex').style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
    } else if (latest.coordinationIndex >= 60) {
        interpretation = 'Good coordination - Room for improvement with practice';
        document.getElementById('coordinationIndex').style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
    } else if (latest.coordinationIndex >= 40) {
        interpretation = 'Moderate coordination - Focus on targeted exercises';
        document.getElementById('coordinationIndex').style.background = 'linear-gradient(135deg, #FF5722, #D84315)';
    } else {
        interpretation = 'Low coordination - Consider professional assessment';
        document.getElementById('coordinationIndex').style.background = 'linear-gradient(135deg, #F44336, #C62828)';
    }
    
    document.getElementById('scoreInterpretation').textContent = interpretation;
}

function updateStats() {
    if (assessments.length === 0) {
        document.getElementById('avgIndex').textContent = '0';
        document.getElementById('bestScore').textContent = '0';
        document.getElementById('totalAssessments').textContent = '0';
        document.getElementById('improvementRate').textContent = '0%';
        return;
    }
    
    const scores = assessments.map(a => a.coordinationIndex);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const best = Math.max(...scores);
    
    // Calculate improvement rate (comparing first 10% to last 10%)
    let improvementRate = 0;
    if (assessments.length >= 10) {
        const firstTenPercent = Math.ceil(assessments.length * 0.1);
        const lastTenPercent = Math.ceil(assessments.length * 0.1);
        
        const earlyScores = assessments.slice(0, firstTenPercent).map(a => a.coordinationIndex);
        const recentScores = assessments.slice(-lastTenPercent).map(a => a.coordinationIndex);
        
        const earlyAvg = earlyScores.reduce((a, b) => a + b, 0) / earlyScores.length;
        const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
        
        if (earlyAvg > 0) {
            improvementRate = Math.round(((recentAvg - earlyAvg) / earlyAvg) * 100);
        }
    }
    
    document.getElementById('avgIndex').textContent = avg;
    document.getElementById('bestScore').textContent = best;
    document.getElementById('totalAssessments').textContent = assessments.length;
    document.getElementById('improvementRate').textContent = improvementRate > 0 ? `+${improvementRate}%` : `${improvementRate}%`;
}

function updateChart() {
    const ctx = document.getElementById('coordinationChart').getContext('2d');
    
    // Sort assessments by date
    const sortedAssessments = assessments.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const labels = sortedAssessments.map(a => new Date(a.date).toLocaleDateString());
    const data = sortedAssessments.map(a => a.coordinationIndex);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Coordination Index',
                data: data,
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Neuromuscular Coordination Over Time'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Coordination Index'
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
        const exerciseNames = {
            'balance-test': 'Balance Test',
            'reaction-test': 'Reaction Time Test',
            'precision-test': 'Precision Movement Test',
            'coordination-drill': 'Coordination Drill',
            'agility-test': 'Agility Test',
            'other': 'Other Exercise'
        };
        
        item.innerHTML = `
            <h4>${date}</h4>
            <p><strong>Coordination Index:</strong> <span class="duration">${assessment.coordinationIndex}/100</span></p>
            <p><strong>Exercise:</strong> ${exerciseNames[assessment.exerciseType] || assessment.exerciseType}</p>
            <p><strong>Balance:</strong> ${assessment.balance}/10 | <strong>Reaction:</strong> ${assessment.reactionTime}/10 | <strong>Precision:</strong> ${assessment.precision}/10</p>
            <p><strong>Coordination:</strong> ${assessment.coordination}/10 | <strong>Fatigue:</strong> ${assessment.fatigue}/10</p>
            ${assessment.notes ? '<p><strong>Notes:</strong> ' + assessment.notes + '</p>' : ''}
        `;
        
        history.appendChild(item);
    });
}

function loadAssessments() {
    // Assessments are loaded from localStorage at the top
}