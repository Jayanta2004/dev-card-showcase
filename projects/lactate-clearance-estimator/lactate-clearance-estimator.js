// lactate-clearance-estimator.js

let estimations = JSON.parse(localStorage.getItem('lactateEstimations')) || [];
let clearanceChart = null;

function calculateClearance() {
    const intensity = document.getElementById('intensityLevel').value;
    const duration = parseInt(document.getElementById('sessionDuration').value);
    const fitness = document.getElementById('fitnessLevel').value;

    if (!duration || duration < 1) {
        alert('Please enter a valid session duration.');
        return;
    }

    // Base clearance multipliers (minutes of clearance per minute of exercise)
    const intensityMultipliers = {
        'low': 0.3,
        'moderate': 0.6,
        'high': 1.0,
        'very-high': 1.5
    };

    // Fitness level adjustments
    const fitnessAdjustments = {
        'beginner': 1.2,
        'intermediate': 1.0,
        'advanced': 0.8
    };

    const baseClearance = duration * intensityMultipliers[intensity];
    const adjustedClearance = Math.round(baseClearance * fitnessAdjustments[fitness]);

    // Display results
    document.getElementById('clearanceTime').textContent = `${adjustedClearance} minutes`;
    document.getElementById('clearanceDescription').textContent = 
        `Based on ${intensity} intensity, ${duration} minute session, and ${fitness} fitness level.`;

    // Generate recovery phases
    displayRecoveryPhases(adjustedClearance);

    // Save to history
    const estimation = {
        id: Date.now(),
        intensity: intensity,
        duration: duration,
        fitness: fitness,
        clearanceTime: adjustedClearance,
        date: new Date().toISOString()
    };

    estimations.unshift(estimation);
    if (estimations.length > 10) estimations = estimations.slice(0, 10); // Keep last 10

    localStorage.setItem('lactateEstimations', JSON.stringify(estimations));
    displayHistory();
}

function displayRecoveryPhases(totalMinutes) {
    const phases = [
        { time: '0-15 min', description: 'Immediate post-exercise: High lactate levels, heavy breathing' },
        { time: '15-30 min', description: 'Fast clearance phase: Lactate levels dropping rapidly' },
        { time: '30-60 min', description: 'Continued clearance: Recovery progressing' },
        { time: '60+ min', description: 'Full recovery: Lactate back to baseline' }
    ];

    let phaseHTML = '';
    phases.forEach(phase => {
        const phaseEnd = parseInt(phase.time.split('-')[1]);
        if (totalMinutes >= phaseEnd || phase.time.includes('+')) {
            phaseHTML += `
                <div class="phase">
                    <div class="phase-time">${phase.time}</div>
                    <div class="phase-description">${phase.description}</div>
                </div>
            `;
        }
    });

    document.getElementById('recoveryPhases').innerHTML = phaseHTML;

    // Create clearance curve chart
    createClearanceChart(totalMinutes);
}

function createClearanceChart(totalMinutes) {
    const ctx = document.getElementById('clearanceChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (clearanceChart) {
        clearanceChart.destroy();
    }

    // Generate data points for lactate clearance curve
    const labels = [];
    const data = [];
    const maxTime = Math.max(totalMinutes + 30, 120); // Show at least 2 hours or totalMinutes + 30min
    
    for (let t = 0; t <= maxTime; t += 5) {
        labels.push(`${t}min`);
        
        // Simplified lactate clearance model: exponential decay
        // Assuming peak lactate ~10-15 mmol/L, baseline ~1 mmol/L
        const peakLactate = 12; // mmol/L
        const baseline = 1; // mmol/L
        const clearanceRate = 0.05; // per minute
        
        let lactateLevel;
        if (t <= totalMinutes) {
            // During exercise, lactate accumulates
            lactateLevel = baseline + (peakLactate - baseline) * (t / totalMinutes);
        } else {
            // Post-exercise clearance
            const timeSinceEnd = t - totalMinutes;
            lactateLevel = peakLactate * Math.exp(-clearanceRate * timeSinceEnd);
            lactateLevel = Math.max(lactateLevel, baseline);
        }
        
        data.push(lactateLevel.toFixed(1));
    }

    clearanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Lactate Level (mmol/L)',
                data: data,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Lactate Concentration (mmol/L)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time (minutes)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Lactate: ${context.parsed.y} mmol/L`;
                        }
                    }
                }
            }
        }
    });
}

function displayHistory() {
    const historyDiv = document.getElementById('estimationHistory');
    if (estimations.length === 0) {
        historyDiv.innerHTML = '<p>No estimations yet.</p>';
        return;
    }

    let historyHTML = '';
    estimations.forEach(est => {
        const date = new Date(est.date).toLocaleDateString();
        historyHTML += `
            <div class="estimation-item">
                <h4>${date}</h4>
                <p><strong>Intensity:</strong> ${est.intensity}</p>
                <p><strong>Duration:</strong> ${est.duration} min</p>
                <p><strong>Fitness:</strong> ${est.fitness}</p>
                <p><strong>Clearance:</strong> ${est.clearanceTime} min</p>
            </div>
        `;
    });

    historyDiv.innerHTML = historyHTML;
}

// Load history on page load
document.addEventListener('DOMContentLoaded', displayHistory);