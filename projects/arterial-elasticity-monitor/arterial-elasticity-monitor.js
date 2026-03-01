// arterial-elasticity-monitor.js

let measurements = JSON.parse(localStorage.getItem('arterialMeasurements')) || [];
let currentMeasurement = null;

function calculateElasticity() {
    const systolicBP = parseFloat(document.getElementById('systolicBP').value);
    const diastolicBP = parseFloat(document.getElementById('diastolicBP').value);
    const pwv = parseFloat(document.getElementById('pulseWaveVelocity').value) || null;
    const age = parseInt(document.getElementById('age').value);

    if (!systolicBP || !diastolicBP || !age) {
        alert('Please enter systolic BP, diastolic BP, and age.');
        return;
    }

    if (systolicBP < diastolicBP) {
        alert('Systolic BP must be higher than diastolic BP.');
        return;
    }

    // Calculate elasticity score based on blood pressure and age
    // Higher scores indicate better elasticity (more flexible arteries)
    const meanBP = (systolicBP + diastolicBP) / 2;
    const pulsePressure = systolicBP - diastolicBP;

    // Base score from blood pressure (inverse relationship with stiffness)
    let bpScore = Math.max(0, 100 - (pulsePressure * 2));

    // Age adjustment (arteries naturally stiffen with age)
    const agePenalty = Math.min(30, age / 3);
    bpScore -= agePenalty;

    // PWV adjustment if provided (lower PWV = better elasticity)
    let pwvScore = 0;
    if (pwv) {
        if (pwv < 8) pwvScore = 20;
        else if (pwv < 10) pwvScore = 10;
        else pwvScore = 0;
    }

    const elasticityScore = Math.round(Math.max(0, Math.min(100, bpScore + pwvScore)));

    // Calculate arterial stiffness index
    const stiffnessIndex = pulsePressure / (meanBP - diastolicBP) || 0;

    // Determine category
    let category;
    if (elasticityScore >= 80) category = 'Excellent';
    else if (elasticityScore >= 60) category = 'Good';
    else if (elasticityScore >= 40) category = 'Moderate';
    else if (elasticityScore >= 20) category = 'Poor';
    else category = 'Very Poor';

    // Update results
    document.getElementById('elasticityScore').textContent = elasticityScore;
    document.getElementById('elasticityCategory').textContent = category;
    document.getElementById('pwvResult').textContent = pwv ? pwv.toFixed(1) : '--';
    document.getElementById('stiffnessIndex').textContent = stiffnessIndex.toFixed(2);

    // Store current measurement
    currentMeasurement = {
        id: Date.now(),
        date: new Date().toISOString(),
        systolicBP,
        diastolicBP,
        pulseWaveVelocity: pwv,
        age,
        elasticityScore,
        stiffnessIndex,
        category,
        notes: document.getElementById('notes').value.trim()
    };

    document.getElementById('saveMeasurementBtn').disabled = false;
}

function saveMeasurement() {
    if (!currentMeasurement) return;

    measurements.push(currentMeasurement);
    localStorage.setItem('arterialMeasurements', JSON.stringify(measurements));

    updateStats();
    updateChart();
    updateHistory();

    // Reset form
    document.getElementById('systolicBP').value = '';
    document.getElementById('diastolicBP').value = '';
    document.getElementById('pulseWaveVelocity').value = '';
    document.getElementById('age').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('saveMeasurementBtn').disabled = true;

    // Reset results
    document.getElementById('elasticityScore').textContent = '0';
    document.getElementById('elasticityCategory').textContent = 'Not Calculated';
    document.getElementById('pwvResult').textContent = '--';
    document.getElementById('stiffnessIndex').textContent = '0';

    currentMeasurement = null;
    alert('Measurement saved successfully!');
}

function updateStats() {
    if (measurements.length === 0) return;

    const avgElasticity = measurements.reduce((sum, m) => sum + m.elasticityScore, 0) / measurements.length;
    const bestScore = Math.max(...measurements.map(m => m.elasticityScore));

    document.getElementById('avgElasticity').textContent = Math.round(avgElasticity);
    document.getElementById('bestScore').textContent = bestScore;
    document.getElementById('totalMeasurements').textContent = measurements.length;
}

function updateChart() {
    const ctx = document.getElementById('elasticityChart').getContext('2d');

    const labels = measurements.map(m => new Date(m.date).toLocaleDateString());
    const scores = measurements.map(m => m.elasticityScore);
    const systolicBP = measurements.map(m => m.systolicBP);
    const diastolicBP = measurements.map(m => m.diastolicBP);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Elasticity Score',
                data: scores,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y'
            }, {
                label: 'Systolic BP',
                data: systolicBP,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                yAxisID: 'y1'
            }, {
                label: 'Diastolic BP',
                data: diastolicBP,
                borderColor: '#4ecdc4',
                backgroundColor: 'rgba(78, 205, 196, 0.1)',
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Elasticity Score'
                    },
                    min: 0,
                    max: 100
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Blood Pressure (mmHg)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

function updateHistory() {
    const historyDiv = document.getElementById('measurementsHistory');
    historyDiv.innerHTML = '';

    const recentMeasurements = measurements.slice(-5).reverse();

    recentMeasurements.forEach(measurement => {
        const measurementDiv = document.createElement('div');
        measurementDiv.className = 'measurement-item';
        measurementDiv.innerHTML = `
            <h4>${new Date(measurement.date).toLocaleString()}</h4>
            <p><strong>BP:</strong> ${measurement.systolicBP}/${measurement.diastolicBP} mmHg</p>
            <p><strong>PWV:</strong> ${measurement.pulseWaveVelocity ? measurement.pulseWaveVelocity + ' m/s' : 'Not measured'}</p>
            <p><strong>Elasticity Score:</strong> ${measurement.elasticityScore} (${measurement.category})</p>
            <p><strong>Stiffness Index:</strong> ${measurement.stiffnessIndex.toFixed(2)}</p>
            ${measurement.notes ? `<p><strong>Notes:</strong> ${measurement.notes}</p>` : ''}
        `;
        historyDiv.appendChild(measurementDiv);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    updateChart();
    updateHistory();
});