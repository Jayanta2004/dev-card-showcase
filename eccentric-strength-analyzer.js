// eccentric-strength-analyzer.js

let eccentricData = JSON.parse(localStorage.getItem('eccentricStrengthData')) || [];

function logEccentricSet() {
    const exercise = document.getElementById('exercise').value.trim();
    const weight = parseFloat(document.getElementById('weight').value);
    const loweringTime = parseFloat(document.getElementById('loweringTime').value);
    const fatigueRating = parseInt(document.getElementById('fatigueRating').value);

    if (!exercise || isNaN(weight) || weight <= 0 || isNaN(loweringTime) || loweringTime <= 0 || isNaN(fatigueRating) || fatigueRating < 1 || fatigueRating > 10) {
        alert('Please fill in all fields with valid values.');
        return;
    }

    // Calculate eccentric strength score
    // Score = (weight * lowering time) / fatigue rating
    // Higher score = better eccentric strength (longer controlled lowering with less fatigue)
    const eccentricScore = (weight * loweringTime) / fatigueRating;

    const entry = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        exercise,
        weight,
        loweringTime,
        fatigueRating,
        eccentricScore: eccentricScore.toFixed(2)
    };

    eccentricData.push(entry);

    // Keep only last 50 entries
    if (eccentricData.length > 50) {
        eccentricData = eccentricData.slice(-50);
    }

    localStorage.setItem('eccentricStrengthData', JSON.stringify(eccentricData));

    // Clear form
    document.getElementById('exercise').value = '';
    document.getElementById('weight').value = '';
    document.getElementById('loweringTime').value = '';
    document.getElementById('fatigueRating').value = 5;

    updateStats();
    updateChart();
    updateHistory();
}

function updateStats() {
    if (eccentricData.length === 0) {
        document.getElementById('avgLoweringTime').textContent = '0.0s';
        document.getElementById('bestScore').textContent = '0';
        document.getElementById('totalSets').textContent = '0';
        return;
    }

    const loweringTimes = eccentricData.map(e => e.loweringTime);
    const scores = eccentricData.map(e => parseFloat(e.eccentricScore));

    const avgLowering = loweringTimes.reduce((a, b) => a + b, 0) / loweringTimes.length;
    const bestScore = Math.max(...scores);

    document.getElementById('avgLoweringTime').textContent = `${avgLowering.toFixed(1)}s`;
    document.getElementById('bestScore').textContent = bestScore.toFixed(0);
    document.getElementById('totalSets').textContent = eccentricData.length;
}

function updateChart() {
    const ctx = document.getElementById('eccentricChart').getContext('2d');

    // Sort by date
    const sortedData = eccentricData.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sortedData.map(e => e.date);
    const scores = sortedData.map(e => parseFloat(e.eccentricScore));

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Eccentric Strength Score',
                data: scores,
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
                    text: 'Eccentric Strength Progress'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Eccentric Score'
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
    const history = document.getElementById('setsHistory');
    history.innerHTML = '';

    // Show last 10 entries
    const recentEntries = eccentricData.slice(-10).reverse();

    recentEntries.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'set-entry';

        item.innerHTML = `
            <h4>${entry.exercise} - ${entry.date}</h4>
            <p><strong>Weight:</strong> ${entry.weight} lbs</p>
            <p><strong>Lowering Time:</strong> ${entry.loweringTime}s</p>
            <p><strong>Fatigue Rating:</strong> ${entry.fatigueRating}/10</p>
            <p class="eccentric-score"><strong>Eccentric Score:</strong> ${entry.eccentricScore}</p>
        `;

        history.appendChild(item);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    updateChart();
    updateHistory();
});