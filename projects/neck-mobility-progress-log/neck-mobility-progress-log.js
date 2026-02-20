// neck-mobility-progress-log.js

let measurements = JSON.parse(localStorage.getItem('neckMeasurements')) || [];
let chart = null;

function logMeasurement() {
    const flexion = parseFloat(document.getElementById('flexion').value);
    const extension = parseFloat(document.getElementById('extension').value);
    const leftLateral = parseFloat(document.getElementById('leftLateral').value);
    const rightLateral = parseFloat(document.getElementById('rightLateral').value);
    const leftRotation = parseFloat(document.getElementById('leftRotation').value);
    const rightRotation = parseFloat(document.getElementById('rightRotation').value);

    if (isNaN(flexion) || isNaN(extension) || isNaN(leftLateral) || isNaN(rightLateral) || isNaN(leftRotation) || isNaN(rightRotation)) {
        alert('Please enter valid numbers for all measurements.');
        return;
    }

    const measurement = {
        id: Date.now(),
        date: new Date().toISOString(),
        flexion: flexion,
        extension: extension,
        leftLateral: leftLateral,
        rightLateral: rightLateral,
        leftRotation: leftRotation,
        rightRotation: rightRotation
    };

    measurements.push(measurement);
    localStorage.setItem('neckMeasurements', JSON.stringify(measurements));

    // Clear form
    document.getElementById('flexion').value = '';
    document.getElementById('extension').value = '';
    document.getElementById('leftLateral').value = '';
    document.getElementById('rightLateral').value = '';
    document.getElementById('leftRotation').value = '';
    document.getElementById('rightRotation').value = '';

    updateStats();
    updateChart();
    displayHistory();
}

function updateStats() {
    if (measurements.length === 0) return;

    const avgFlexion = measurements.reduce((sum, m) => sum + m.flexion, 0) / measurements.length;
    const avgExtension = measurements.reduce((sum, m) => sum + m.extension, 0) / measurements.length;
    const avgLateral = measurements.reduce((sum, m) => (sum + m.leftLateral + m.rightLateral) / 2, 0) / measurements.length;
    const avgRotation = measurements.reduce((sum, m) => (sum + m.leftRotation + m.rightRotation) / 2, 0) / measurements.length;

    document.getElementById('avgFlexion').textContent = `${avgFlexion.toFixed(1)}°`;
    document.getElementById('avgExtension').textContent = `${avgExtension.toFixed(1)}°`;
    document.getElementById('avgLateral').textContent = `${avgLateral.toFixed(1)}°`;
    document.getElementById('avgRotation').textContent = `${avgRotation.toFixed(1)}°`;
}

function updateChart() {
    const ctx = document.getElementById('mobilityChart').getContext('2d');

    if (chart) {
        chart.destroy();
    }

    const labels = measurements.map(m => new Date(m.date).toLocaleDateString());
    const flexionData = measurements.map(m => m.flexion);
    const extensionData = measurements.map(m => m.extension);
    const lateralData = measurements.map(m => (m.leftLateral + m.rightLateral) / 2);
    const rotationData = measurements.map(m => (m.leftRotation + m.rightRotation) / 2);

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Flexion (°)',
                    data: flexionData,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.1
                },
                {
                    label: 'Extension (°)',
                    data: extensionData,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.1
                },
                {
                    label: 'Lateral Flexion (°)',
                    data: lateralData,
                    borderColor: '#FF9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    tension: 0.1
                },
                {
                    label: 'Rotation (°)',
                    data: rotationData,
                    borderColor: '#E91E63',
                    backgroundColor: 'rgba(233, 30, 99, 0.1)',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Neck Mobility Progress Over Time'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Degrees'
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

function displayHistory() {
    const historyDiv = document.getElementById('measurementsHistory');
    if (measurements.length === 0) {
        historyDiv.innerHTML = '<p>No measurements logged yet.</p>';
        return;
    }

    // Show last 10 measurements
    const recentMeasurements = measurements.slice(-10).reverse();

    let historyHTML = '';
    recentMeasurements.forEach(m => {
        const date = new Date(m.date).toLocaleDateString();
        historyHTML += `
            <div class="measurement-item">
                <h4>${date}</h4>
                <div class="measurements">
                    <div class="measurement">Flexion: ${m.flexion}°</div>
                    <div class="measurement">Extension: ${m.extension}°</div>
                    <div class="measurement">Left Lateral: ${m.leftLateral}°</div>
                    <div class="measurement">Right Lateral: ${m.rightLateral}°</div>
                    <div class="measurement">Left Rotation: ${m.leftRotation}°</div>
                    <div class="measurement">Right Rotation: ${m.rightRotation}°</div>
                </div>
            </div>
        `;
    });

    historyDiv.innerHTML = historyHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    updateChart();
    displayHistory();
});