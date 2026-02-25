// Grip Strength Progress Monitor JavaScript

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set default date to today
    document.getElementById('measurementDate').valueAsDate = new Date();

    // Load existing data
    loadGripData();
    loadGoals();
    updateStats();
    updateChart();

    // Set up event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Add any additional event listeners if needed
}

// Log a grip strength measurement
function logGripMeasurement() {
    const date = document.getElementById('measurementDate').value;
    const gripType = document.getElementById('gripType').value;
    const leftStrength = parseFloat(document.getElementById('leftStrength').value);
    const leftReps = parseInt(document.getElementById('leftReps').value);
    const rightStrength = parseFloat(document.getElementById('rightStrength').value);
    const rightReps = parseInt(document.getElementById('rightReps').value);
    const notes = document.getElementById('notes').value.trim();

    // Validation
    if (!date) {
        alert('Please select a date.');
        return;
    }

    if (isNaN(leftStrength) && isNaN(rightStrength)) {
        alert('Please enter at least one strength measurement.');
        return;
    }

    // Create measurement entry
    const measurement = {
        id: Date.now(),
        date: date,
        gripType: gripType,
        leftStrength: isNaN(leftStrength) ? null : leftStrength,
        leftReps: leftReps,
        rightStrength: isNaN(rightStrength) ? null : rightStrength,
        rightReps: rightReps,
        notes: notes,
        timestamp: new Date().toISOString()
    };

    // Save to localStorage
    saveMeasurement(measurement);

    // Clear form
    clearForm();

    // Update display
    loadGripData();
    updateStats();
    updateChart();

    alert('Grip strength measurement logged successfully!');
}

function saveMeasurement(measurement) {
    const measurements = getMeasurements();
    measurements.push(measurement);
    localStorage.setItem('gripStrengthMeasurements', JSON.stringify(measurements));
}

function getMeasurements() {
    const measurements = localStorage.getItem('gripStrengthMeasurements');
    return measurements ? JSON.parse(measurements) : [];
}

function loadGripData() {
    const measurements = getMeasurements();
    const historyDiv = document.getElementById('gripHistory');

    // Sort by date (newest first)
    measurements.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Display recent measurements (last 10)
    const recentMeasurements = measurements.slice(0, 10);

    historyDiv.innerHTML = '';

    if (recentMeasurements.length === 0) {
        historyDiv.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7);">No measurements logged yet.</p>';
        return;
    }

    recentMeasurements.forEach(measurement => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'history-entry';

        const date = new Date(measurement.date).toLocaleDateString();
        const gripTypeLabel = getGripTypeLabel(measurement.gripType);

        entryDiv.innerHTML = `
            <h4>${date} - ${gripTypeLabel}</h4>
            <p><strong>Left Hand:</strong> ${measurement.leftStrength ? `${measurement.leftStrength} (${measurement.leftReps} reps)` : 'Not measured'}</p>
            <p><strong>Right Hand:</strong> ${measurement.rightStrength ? `${measurement.rightStrength} (${measurement.rightReps} reps)` : 'Not measured'}</p>
            ${measurement.notes ? `<p><strong>Notes:</strong> ${measurement.notes}</p>` : ''}
            <button class="delete-btn" onclick="deleteMeasurement(${measurement.id})">Delete</button>
        `;

        historyDiv.appendChild(entryDiv);
    });
}

function getGripTypeLabel(gripType) {
    const labels = {
        'palmar': 'Palmar Grip',
        'lateral': 'Lateral Grip',
        'tip': 'Tip Pinch',
        'tweezer': 'Tweezer Grip'
    };
    return labels[gripType] || gripType;
}

function deleteMeasurement(id) {
    if (confirm('Are you sure you want to delete this measurement?')) {
        const measurements = getMeasurements();
        const filteredMeasurements = measurements.filter(m => m.id !== id);
        localStorage.setItem('gripStrengthMeasurements', JSON.stringify(filteredMeasurements));

        loadGripData();
        updateStats();
        updateChart();
    }
}

function clearForm() {
    document.getElementById('measurementDate').valueAsDate = new Date();
    document.getElementById('gripType').value = 'palmar';
    document.getElementById('leftStrength').value = '';
    document.getElementById('leftReps').value = '1';
    document.getElementById('rightStrength').value = '';
    document.getElementById('rightReps').value = '1';
    document.getElementById('notes').value = '';
}

function setGoals() {
    const leftGoal = parseFloat(document.getElementById('leftGoal').value);
    const rightGoal = parseFloat(document.getElementById('rightGoal').value);

    if (isNaN(leftGoal) && isNaN(rightGoal)) {
        alert('Please enter at least one goal.');
        return;
    }

    const goals = {
        left: isNaN(leftGoal) ? null : leftGoal,
        right: isNaN(rightGoal) ? null : rightGoal
    };

    localStorage.setItem('gripStrengthGoals', JSON.stringify(goals));
    loadGoals();

    // Clear goal inputs
    document.getElementById('leftGoal').value = '';
    document.getElementById('rightGoal').value = '';

    alert('Goals set successfully!');
}

function loadGoals() {
    const goals = localStorage.getItem('gripStrengthGoals');
    const parsedGoals = goals ? JSON.parse(goals) : { left: null, right: null };

    document.getElementById('currentLeftGoal').textContent = parsedGoals.left ? `${parsedGoals.left}` : 'Not set';
    document.getElementById('currentRightGoal').textContent = parsedGoals.right ? `${parsedGoals.right}` : 'Not set';
}

function updateStats() {
    const measurements = getMeasurements();

    if (measurements.length === 0) {
        document.getElementById('leftBest').textContent = '0';
        document.getElementById('rightBest').textContent = '0';
        document.getElementById('recentAvg').textContent = '0';
        document.getElementById('totalMeasurements').textContent = '0';
        return;
    }

    // Calculate bests
    const leftMeasurements = measurements.filter(m => m.leftStrength !== null);
    const rightMeasurements = measurements.filter(m => m.rightStrength !== null);

    const leftBest = leftMeasurements.length > 0 ? Math.max(...leftMeasurements.map(m => m.leftStrength)) : 0;
    const rightBest = rightMeasurements.length > 0 ? Math.max(...rightMeasurements.map(m => m.rightStrength)) : 0;

    // Calculate recent average (last 5 measurements)
    const recentMeasurements = measurements.slice(0, 5);
    const recentLeft = recentMeasurements.filter(m => m.leftStrength !== null).map(m => m.leftStrength);
    const recentRight = recentMeasurements.filter(m => m.rightStrength !== null).map(m => m.rightStrength);
    const allRecent = [...recentLeft, ...recentRight];
    const recentAvg = allRecent.length > 0 ? (allRecent.reduce((a, b) => a + b, 0) / allRecent.length).toFixed(1) : 0;

    document.getElementById('leftBest').textContent = leftBest.toFixed(1);
    document.getElementById('rightBest').textContent = rightBest.toFixed(1);
    document.getElementById('recentAvg').textContent = recentAvg;
    document.getElementById('totalMeasurements').textContent = measurements.length;
}

function updateChart() {
    const gripType = document.getElementById('chartGripType').value;
    const measurements = getMeasurements();

    // Filter measurements by grip type
    const filteredMeasurements = measurements.filter(m => m.gripType === gripType);

    // Sort by date
    filteredMeasurements.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Prepare data for Chart.js
    const labels = filteredMeasurements.map(m => new Date(m.date).toLocaleDateString());
    const leftData = filteredMeasurements.map(m => m.leftStrength || null);
    const rightData = filteredMeasurements.map(m => m.rightStrength || null);

    const ctx = document.getElementById('gripChart').getContext('2d');

    // Destroy existing chart if it exists
    if (window.gripChart) {
        window.gripChart.destroy();
    }

    window.gripChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Left Hand',
                    data: leftData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1,
                    fill: false
                },
                {
                    label: 'Right Hand',
                    data: rightData,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.1,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Strength (kg/lbs)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `${getGripTypeLabel(gripType)} Progress`
                }
            }
        }
    });
}