// Postural Symmetry Analyzer JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadNavbar();
    loadFooter();
    loadData();
    initializeChart();
    updateStatus();

    const form = document.getElementById('symmetryForm');
    form.addEventListener('submit', handleFormSubmit);
});

function handleFormSubmit(e) {
    e.preventDefault();

    const data = {
        date: new Date().toISOString(),
        leftShoulder: parseFloat(document.getElementById('leftShoulder').value),
        rightShoulder: parseFloat(document.getElementById('rightShoulder').value),
        leftHip: parseFloat(document.getElementById('leftHip').value),
        rightHip: parseFloat(document.getElementById('rightHip').value),
        notes: document.getElementById('notes').value.trim()
    };

    saveMeasurement(data);
    updateDisplay();
    form.reset();

    // Show success message
    showNotification('Measurement saved successfully!', 'success');
}

function saveMeasurement(data) {
    const measurements = getMeasurements();
    measurements.push(data);
    localStorage.setItem('posturalSymmetryData', JSON.stringify(measurements));
}

function getMeasurements() {
    const data = localStorage.getItem('posturalSymmetryData');
    return data ? JSON.parse(data) : [];
}

function updateDisplay() {
    updateStatus();
    updateSuggestions();
    updateChart();
    updateHistoryTable();
}

function updateStatus() {
    const measurements = getMeasurements();
    if (measurements.length === 0) return;

    const latest = measurements[measurements.length - 1];

    const shoulderDiff = Math.abs(latest.leftShoulder - latest.rightShoulder);
    const hipDiff = Math.abs(latest.leftHip - latest.rightHip);

    document.getElementById('shoulderAsymmetry').textContent = shoulderDiff.toFixed(1) + ' cm';
    document.getElementById('hipAsymmetry').textContent = hipDiff.toFixed(1) + ' cm';

    updateStatusClass('shoulderStatus', shoulderDiff);
    updateStatusClass('hipStatus', hipDiff);
}

function updateStatusClass(elementId, diff) {
    const element = document.getElementById(elementId);
    element.className = 'status';

    if (diff < 0.5) {
        element.classList.add('excellent');
        element.textContent = 'Excellent';
    } else if (diff < 1.0) {
        element.classList.add('good');
        element.textContent = 'Good';
    } else {
        element.classList.add('needs-attention');
        element.textContent = 'Needs Attention';
    }
}

function updateSuggestions() {
    const measurements = getMeasurements();
    if (measurements.length === 0) return;

    const latest = measurements[measurements.length - 1];
    const shoulderDiff = Math.abs(latest.leftShoulder - latest.rightShoulder);
    const hipDiff = Math.abs(latest.leftHip - latest.rightHip);

    const suggestions = [];

    if (shoulderDiff > 1.0) {
        const higherSide = latest.leftShoulder > latest.rightShoulder ? 'left' : 'right';
        suggestions.push({
            title: 'Shoulder Asymmetry Correction',
            text: `Your ${higherSide} shoulder is higher. Try shoulder rolls and stretches focusing on the ${higherSide} side. Consider consulting a physical therapist for posture correction exercises.`
        });
    }

    if (hipDiff > 1.0) {
        const higherSide = latest.leftHip > latest.rightHip ? 'left' : 'right';
        suggestions.push({
            title: 'Hip Asymmetry Correction',
            text: `Your ${higherSide} hip is higher. Practice hip flexor stretches on the ${higherSide} side and strengthen the opposite side. Walking with proper posture may help.`
        });
    }

    if (suggestions.length === 0) {
        suggestions.push({
            title: 'Great Posture!',
            text: 'Your measurements show excellent symmetry. Continue maintaining good posture habits and regular stretching to prevent imbalances.'
        });
    }

    // Add general suggestions
    suggestions.push({
        title: 'General Recommendations',
        text: 'Regular stretching, core strengthening exercises, and being mindful of your posture throughout the day can help maintain symmetry. Consider activities like yoga or Pilates.'
    });

    displaySuggestions(suggestions);
}

function displaySuggestions(suggestions) {
    const container = document.getElementById('suggestions');
    container.innerHTML = '';

    suggestions.forEach(suggestion => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `
            <h4>${suggestion.title}</h4>
            <p>${suggestion.text}</p>
        `;
        container.appendChild(div);
    });
}

function initializeChart() {
    const ctx = document.getElementById('symmetryChart').getContext('2d');
    window.symmetryChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Shoulder Asymmetry (cm)',
                data: [],
                borderColor: '#4299e1',
                backgroundColor: 'rgba(66, 153, 225, 0.1)',
                tension: 0.4
            }, {
                label: 'Hip Asymmetry (cm)',
                data: [],
                borderColor: '#48bb78',
                backgroundColor: 'rgba(72, 187, 120, 0.1)',
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
                        text: 'Asymmetry (cm)'
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
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

function updateChart() {
    const measurements = getMeasurements();
    if (measurements.length === 0) return;

    const labels = measurements.map(m => new Date(m.date).toLocaleDateString());
    const shoulderData = measurements.map(m => Math.abs(m.leftShoulder - m.rightShoulder));
    const hipData = measurements.map(m => Math.abs(m.leftHip - m.rightHip));

    window.symmetryChart.data.labels = labels;
    window.symmetryChart.data.datasets[0].data = shoulderData;
    window.symmetryChart.data.datasets[1].data = hipData;
    window.symmetryChart.update();
}

function updateHistoryTable() {
    const measurements = getMeasurements();
    const tbody = document.getElementById('historyBody');

    if (measurements.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9">No measurements logged yet.</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    measurements.slice().reverse().forEach((measurement, index) => {
        const row = document.createElement('tr');
        const date = new Date(measurement.date).toLocaleDateString();
        const shoulderDiff = Math.abs(measurement.leftShoulder - measurement.rightShoulder);
        const hipDiff = Math.abs(measurement.leftHip - measurement.rightHip);

        row.innerHTML = `
            <td>${date}</td>
            <td>${measurement.leftShoulder}</td>
            <td>${measurement.rightShoulder}</td>
            <td>${shoulderDiff.toFixed(1)}</td>
            <td>${measurement.leftHip}</td>
            <td>${measurement.rightHip}</td>
            <td>${hipDiff.toFixed(1)}</td>
            <td>${measurement.notes || '-'}</td>
            <td><button class="btn-delete" onclick="deleteMeasurement(${measurements.length - 1 - index})">Delete</button></td>
        `;

        tbody.appendChild(row);
    });
}

function deleteMeasurement(index) {
    const measurements = getMeasurements();
    measurements.splice(index, 1);
    localStorage.setItem('posturalSymmetryData', JSON.stringify(measurements));
    updateDisplay();
    showNotification('Measurement deleted.', 'info');
}

function loadData() {
    updateDisplay();
}

function showNotification(message, type) {
    // Simple notification - you could enhance this
    alert(message);
}

// Load navbar and footer (assuming these functions exist in the global scripts)
function loadNavbar() {
    fetch('../navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
            lucide.createIcons();
        });
}

function loadFooter() {
    fetch('../footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
            lucide.createIcons();
        });
}