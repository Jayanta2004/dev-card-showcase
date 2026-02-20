// metabolic-flexibility-score.js

function calculateFlexibility() {
    const fasting = parseFloat(document.getElementById('fasting').value);
    const intensity = parseInt(document.getElementById('intensity').value);

    // Validate inputs
    if (fasting < 0 || fasting > 72 || intensity < 1 || intensity > 10) {
        alert('Please enter valid values: Fasting 0-72 hours, Intensity 1-10.');
        return;
    }

    // Algorithm: Weighted score based on fasting duration and exercise intensity
    // Fasting contributes more at higher durations, intensity shows metabolic switching ability
    let score = 0;
    if (fasting >= 16) {
        score += 50; // Prolonged fasting indicates good fat adaptation
    } else if (fasting >= 12) {
        score += 40;
    } else if (fasting >= 8) {
        score += 30;
    } else if (fasting >= 4) {
        score += 20;
    } else {
        score += 10;
    }

    score += intensity * 5; // Intensity shows carb utilization and recovery

    // Cap at 100
    score = Math.min(100, score);

    // Display score
    const scoreDisplay = document.getElementById('scoreDisplay');
    const scoreNumber = document.getElementById('scoreNumber');
    const scoreLabel = document.getElementById('scoreLabel');
    const insights = document.getElementById('insights');

    scoreNumber.textContent = score.toFixed(0);

    let label = '';
    let insightText = '';
    if (score >= 80) {
        label = 'Excellent Metabolic Flexibility';
        scoreDisplay.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
        insightText = 'You demonstrate strong ability to switch between energy sources. Continue with varied nutrition and training.';
    } else if (score >= 60) {
        label = 'Good Metabolic Flexibility';
        scoreDisplay.style.background = 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)';
        insightText = 'Good adaptability. Consider incorporating more fasting periods or HIIT to improve further.';
    } else if (score >= 40) {
        label = 'Moderate Metabolic Flexibility';
        scoreDisplay.style.background = 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)';
        insightText = 'Moderate flexibility. Focus on building fat adaptation through longer fasts and mixed-intensity workouts.';
    } else {
        label = 'Low Metabolic Flexibility';
        scoreDisplay.style.background = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
        insightText = 'Limited adaptability. Start with shorter fasts and gradually increase exercise intensity variety.';
    }

    scoreLabel.textContent = label;
    insights.textContent = insightText;
    scoreDisplay.style.display = 'block';

    // Update analytics chart
    updateChart(fasting, intensity, score);
}

function updateChart(fasting, intensity, score) {
    const ctx = document.getElementById('flexibilityChart').getContext('2d');

    // Simple bar chart showing components
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Fasting Contribution', 'Intensity Contribution', 'Total Score'],
            datasets: [{
                label: 'Score Components',
                data: [
                    Math.min(50, fasting >= 16 ? 50 : fasting >= 12 ? 40 : fasting >= 8 ? 30 : fasting >= 4 ? 20 : 10),
                    intensity * 5,
                    score
                ],
                backgroundColor: ['#FF6384', '#36A2EB', '#4CAF50'],
                borderColor: ['#FF6384', '#36A2EB', '#4CAF50'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Metabolic Flexibility Score Breakdown'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Score'
                    }
                }
            }
        }
    });
}

// Load saved data on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedData = localStorage.getItem('metabolicFlexibilityData');
    if (savedData) {
        const data = JSON.parse(savedData);
        document.getElementById('fasting').value = data.fasting || 12;
        document.getElementById('intensity').value = data.intensity || 7;
    }
});

// Save data when inputs change
document.addEventListener('input', function(e) {
    if (['fasting', 'intensity'].includes(e.target.id)) {
        const data = {
            fasting: document.getElementById('fasting').value,
            intensity: document.getElementById('intensity').value
        };
        localStorage.setItem('metabolicFlexibilityData', JSON.stringify(data));
    }
});