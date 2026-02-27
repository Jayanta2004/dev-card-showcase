// power-output-trend-analyzer.js

let powerEntries = JSON.parse(localStorage.getItem('powerOutputEntries')) || [];
let chart = null;

const exerciseTypes = {
    vertical_jump: { name: 'Vertical Jump', unit: 'inches', metric: 'jumpHeight' },
    broad_jump: { name: 'Broad Jump', unit: 'inches', metric: 'jumpHeight' },
    box_jump: { name: 'Box Jump', unit: 'inches', metric: 'jumpHeight' },
    squat_jump: { name: 'Squat Jump', unit: 'inches', metric: 'jumpHeight' },
    bar_velocity: { name: 'Bar Velocity (Squat)', unit: 'm/s', metric: 'barVelocity' },
    bar_velocity_bench: { name: 'Bar Velocity (Bench)', unit: 'm/s', metric: 'barVelocity' },
    bar_velocity_deadlift: { name: 'Bar Velocity (Deadlift)', unit: 'm/s', metric: 'barVelocity' },
    medicine_ball_throw: { name: 'Medicine Ball Throw', unit: 'feet', metric: 'throwDistance' }
};

document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today
    document.getElementById('logDate').valueAsDate = new Date();

    // Initialize exercise type change handler
    document.getElementById('exerciseType').addEventListener('change', updateMetricInputs);

    // Initialize chart metric change handler
    document.getElementById('chartMetric').addEventListener('change', renderChart);

    // Load and display data
    updateDisplay();
    renderChart();
});

function updateMetricInputs() {
    const exerciseType = document.getElementById('exerciseType').value;
    const exerciseInfo = exerciseTypes[exerciseType];

    // Hide all metric inputs
    document.getElementById('jumpHeightGroup').style.display = 'none';
    document.getElementById('barVelocityGroup').style.display = 'none';
    document.getElementById('throwDistanceGroup').style.display = 'none';

    // Show relevant input
    if (exerciseInfo.metric === 'jumpHeight') {
        document.getElementById('jumpHeightGroup').style.display = 'block';
        document.querySelector('#jumpHeightGroup label').textContent = `${exerciseInfo.name} (${exerciseInfo.unit}):`;
    } else if (exerciseInfo.metric === 'barVelocity') {
        document.getElementById('barVelocityGroup').style.display = 'block';
        document.querySelector('#barVelocityGroup label').textContent = `${exerciseInfo.name} (${exerciseInfo.unit}):`;
    } else if (exerciseInfo.metric === 'throwDistance') {
        document.getElementById('throwDistanceGroup').style.display = 'block';
        document.querySelector('#throwDistanceGroup label').textContent = `${exerciseInfo.name} (${exerciseInfo.unit}):`;
    }
}

function logEntry() {
    const date = document.getElementById('logDate').value;
    const exerciseType = document.getElementById('exerciseType').value;
    const weight = parseFloat(document.getElementById('weight').value) || null;
    const notes = document.getElementById('notes').value.trim();

    if (!date) {
        alert('Please select a date for the entry.');
        return;
    }

    const exerciseInfo = exerciseTypes[exerciseType];
    let metricValue = null;

    if (exerciseInfo.metric === 'jumpHeight') {
        metricValue = parseFloat(document.getElementById('jumpHeight').value);
        if (!metricValue || metricValue <= 0) {
            alert('Please enter a valid jump height.');
            return;
        }
    } else if (exerciseInfo.metric === 'barVelocity') {
        metricValue = parseFloat(document.getElementById('barVelocity').value);
        if (!metricValue || metricValue <= 0) {
            alert('Please enter a valid bar velocity.');
            return;
        }
    } else if (exerciseInfo.metric === 'throwDistance') {
        metricValue = parseFloat(document.getElementById('throwDistance').value);
        if (!metricValue || metricValue <= 0) {
            alert('Please enter a valid throw distance.');
            return;
        }
    }

    const entry = {
        id: Date.now(),
        date: date,
        exerciseType: exerciseType,
        metric: exerciseInfo.metric,
        value: metricValue,
        unit: exerciseInfo.unit,
        weight: weight,
        notes: notes,
        timestamp: new Date().toISOString(),
        calculatedPower: weight && exerciseInfo.metric === 'jumpHeight' ? calculatePowerFromJump(weight, metricValue) : null
    };

    powerEntries.push(entry);
    powerEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Save to localStorage
    localStorage.setItem('powerOutputEntries', JSON.stringify(powerEntries));

    // Clear form
    document.getElementById('notes').value = '';

    // Update display
    updateDisplay();
    renderChart();

    // Show success message
    alert('Entry logged successfully!');
}

function calculatePowerFromJump(weightLbs, heightInches) {
    // Convert to metric
    const weightKg = weightLbs * 0.453592;
    const heightM = heightInches * 0.0254;

    // Power = Force × Velocity
    // Force = mass × gravity
    // Velocity = sqrt(2 × gravity × height)
    const gravity = 9.81;
    const velocity = Math.sqrt(2 * gravity * heightM);
    const power = weightKg * gravity * velocity;

    return Math.round(power);
}

function updateDisplay() {
    // Update stats
    if (powerEntries.length > 0) {
        // Best jump height
        const jumpEntries = powerEntries.filter(e => e.metric === 'jumpHeight');
        const bestJump = jumpEntries.length > 0 ? Math.max(...jumpEntries.map(e => e.value)) : 0;
        document.getElementById('bestJump').textContent = `${bestJump}"`;

        // Average bar velocity
        const velocityEntries = powerEntries.filter(e => e.metric === 'barVelocity');
        const avgVelocity = velocityEntries.length > 0 ?
            (velocityEntries.reduce((sum, e) => sum + e.value, 0) / velocityEntries.length).toFixed(2) : 0;
        document.getElementById('avgVelocity').textContent = `${avgVelocity} m/s`;

        // Power improvement
        const improvement = calculateImprovement();
        document.getElementById('powerImprovement').textContent = `${improvement >= 0 ? '+' : ''}${improvement.toFixed(1)}%`;

        document.getElementById('entriesLogged').textContent = powerEntries.length;
    } else {
        document.getElementById('bestJump').textContent = '0"';
        document.getElementById('avgVelocity').textContent = '0 m/s';
        document.getElementById('powerImprovement').textContent = '0%';
        document.getElementById('entriesLogged').textContent = '0';
    }

    // Update history
    renderHistory();
}

function calculateImprovement() {
    if (powerEntries.length < 2) return 0;

    // Group by exercise type and calculate improvement for each
    const improvements = [];

    Object.keys(exerciseTypes).forEach(exercise => {
        const entries = powerEntries.filter(e => e.exerciseType === exercise);
        if (entries.length >= 2) {
            const first = entries[0].value;
            const last = entries[entries.length - 1].value;
            if (first > 0) {
                improvements.push(((last - first) / first) * 100);
            }
        }
    });

    return improvements.length > 0 ? improvements.reduce((a, b) => a + b, 0) / improvements.length : 0;
}

function renderHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    if (powerEntries.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">No entries logged yet. Start tracking your power output!</p>';
        return;
    }

    powerEntries.slice().reverse().slice(0, 10).forEach(entry => { // Show last 10 entries
        const item = document.createElement('div');
        item.className = 'history-item';

        const date = new Date(entry.date).toLocaleDateString();
        const exerciseName = exerciseTypes[entry.exerciseType].name;

        item.innerHTML = `
            <div>
                <div class="history-exercise">${exerciseName}</div>
                <div class="history-metric">${entry.value} ${entry.unit}</div>
                <div class="history-date">${date}</div>
                ${entry.notes ? `<div class="history-notes">${entry.notes}</div>` : ''}
            </div>
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;

        historyList.appendChild(item);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        powerEntries = powerEntries.filter(e => e.id !== id);
        localStorage.setItem('powerOutputEntries', JSON.stringify(powerEntries));
        updateDisplay();
        renderChart();
    }
}

function renderChart() {
    const ctx = document.getElementById('powerChart').getContext('2d');
    const selectedMetric = document.getElementById('chartMetric').value;

    if (chart) {
        chart.destroy();
    }

    if (powerEntries.length === 0) {
        return;
    }

    let filteredEntries = [];
    let yAxisLabel = '';
    let title = '';

    switch (selectedMetric) {
        case 'jumpHeight':
            filteredEntries = powerEntries.filter(e => e.metric === 'jumpHeight');
            yAxisLabel = 'Jump Height (inches)';
            title = 'Jump Height Progress';
            break;
        case 'barVelocity':
            filteredEntries = powerEntries.filter(e => e.metric === 'barVelocity');
            yAxisLabel = 'Bar Velocity (m/s)';
            title = 'Bar Velocity Progress';
            break;
        case 'throwDistance':
            filteredEntries = powerEntries.filter(e => e.metric === 'throwDistance');
            yAxisLabel = 'Throw Distance (feet)';
            title = 'Throw Distance Progress';
            break;
        case 'power':
            filteredEntries = powerEntries.filter(e => e.calculatedPower);
            yAxisLabel = 'Power (watts)';
            title = 'Calculated Power Output';
            break;
    }

    if (filteredEntries.length === 0) {
        return;
    }

    const labels = filteredEntries.map(entry => new Date(entry.date).toLocaleDateString());
    const data = filteredEntries.map(entry =>
        selectedMetric === 'power' ? entry.calculatedPower : entry.value
    );

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#4fd1ff',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#fff'
                    }
                },
                title: {
                    display: true,
                    text: title,
                    color: '#fff',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y}${selectedMetric === 'power' ? ' W' : ''}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: '#fff',
                        callback: function(value) {
                            return value + (selectedMetric === 'power' ? ' W' : '');
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#fff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

function calculatePower() {
    const weight = parseFloat(document.getElementById('calcWeight').value);
    const height = parseFloat(document.getElementById('calcHeight').value);

    if (!weight || !height || weight <= 0 || height <= 0) {
        alert('Please enter valid weight and jump height.');
        return;
    }

    const power = calculatePowerFromJump(weight, height);
    const rating = getPowerRating(power);

    document.getElementById('powerOutput').textContent = power;
    document.getElementById('powerRating').textContent = `Rating: ${rating}`;
    document.getElementById('calcResult').style.display = 'block';
}

function getPowerRating(power) {
    if (power >= 4000) return 'Elite';
    if (power >= 3500) return 'Advanced';
    if (power >= 3000) return 'Intermediate';
    if (power >= 2500) return 'Beginner';
    return 'Novice';
}

// Export data functionality
function exportData() {
    const dataStr = JSON.stringify(powerEntries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = 'power-output-data.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Make export function available globally if needed
window.exportData = exportData;