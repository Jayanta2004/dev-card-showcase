// mental-clarity-index.js

function calculateClarity() {
    const sleep = parseInt(document.getElementById('sleep').value);
    const hydration = parseInt(document.getElementById('hydration').value);
    const stress = parseInt(document.getElementById('stress').value);

    // Validate inputs
    if (sleep < 1 || sleep > 10 || hydration < 1 || hydration > 10 || stress < 1 || stress > 10) {
        alert('Please enter values between 1 and 10 for all fields.');
        return;
    }

    // Weighted algorithm: Sleep 40%, Hydration 30%, Stress 30% (inverted)
    const clarityScore = (sleep * 0.4) + (hydration * 0.3) + ((11 - stress) * 0.3);

    // Display score
    const scoreDisplay = document.getElementById('scoreDisplay');
    const scoreNumber = document.getElementById('scoreNumber');
    const scoreLabel = document.getElementById('scoreLabel');

    scoreNumber.textContent = clarityScore.toFixed(1);

    let label = '';
    if (clarityScore >= 8) {
        label = 'Excellent Clarity';
        scoreDisplay.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
    } else if (clarityScore >= 6) {
        label = 'Good Clarity';
        scoreDisplay.style.background = 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)';
    } else if (clarityScore >= 4) {
        label = 'Moderate Clarity';
        scoreDisplay.style.background = 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)';
    } else {
        label = 'Low Clarity';
        scoreDisplay.style.background = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
    }

    scoreLabel.textContent = label;
    scoreDisplay.style.display = 'block';

    // Predict productivity peaks
    predictPeaks(clarityScore);
}

function predictPeaks(score) {
    const ctx = document.getElementById('peaksChart').getContext('2d');

    // Simulate productivity peaks based on score
    // Higher score means more consistent peaks
    const baseProductivity = score / 10;
    const hours = Array.from({length: 24}, (_, i) => i);
    const productivity = hours.map(hour => {
        // Morning peak around 9-11, afternoon around 14-16
        let peak = 0;
        if (hour >= 9 && hour <= 11) peak = 0.8;
        else if (hour >= 14 && hour <= 16) peak = 0.7;
        else peak = 0.3;

        // Adjust based on clarity score
        return Math.min(1, peak * baseProductivity + 0.2);
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours.map(h => `${h}:00`),
            datasets: [{
                label: 'Productivity Level',
                data: productivity,
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
                    text: 'Predicted Productivity Peaks Throughout the Day'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    title: {
                        display: true,
                        text: 'Productivity'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Hour of Day'
                    }
                }
            }
        }
    });
}

// Load saved data on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load from localStorage if available
    const savedData = localStorage.getItem('mentalClarityData');
    if (savedData) {
        const data = JSON.parse(savedData);
        document.getElementById('sleep').value = data.sleep || 7;
        document.getElementById('hydration').value = data.hydration || 8;
        document.getElementById('stress').value = data.stress || 3;
    }
});

// Save data when inputs change
document.addEventListener('input', function(e) {
    if (['sleep', 'hydration', 'stress'].includes(e.target.id)) {
        const data = {
            sleep: document.getElementById('sleep').value,
            hydration: document.getElementById('hydration').value,
            stress: document.getElementById('stress').value
        };
        localStorage.setItem('mentalClarityData', JSON.stringify(data));
    }
});