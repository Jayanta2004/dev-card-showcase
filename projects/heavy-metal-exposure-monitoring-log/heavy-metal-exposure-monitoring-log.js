// heavy-metal-exposure-monitoring-log.js

let exposureLogs = JSON.parse(localStorage.getItem('heavyMetalExposures')) || [];

// Risk level colors and thresholds
const riskLevels = {
    low: { color: '#28a745', label: 'Low Risk' },
    moderate: { color: '#ffc107', label: 'Moderate Risk' },
    high: { color: '#dc3545', label: 'High Risk' },
    unknown: { color: '#6c757d', label: 'Unknown Risk' }
};

function logExposure() {
    const date = document.getElementById('exposureDate').value;
    const metalType = document.getElementById('metalType').value;
    const source = document.getElementById('exposureSource').value.trim();
    const level = document.getElementById('exposureLevel').value;
    const duration = document.getElementById('duration').value.trim();
    const symptoms = document.getElementById('symptoms').value.trim();
    const mitigation = document.getElementById('mitigation').value.trim();

    if (!date || !metalType || !source) {
        alert('Please fill in the required fields: Date, Metal Type, and Source.');
        return;
    }

    const exposure = {
        id: Date.now(),
        date: date,
        metalType: metalType,
        source: source,
        level: level,
        duration: duration,
        symptoms: symptoms,
        mitigation: mitigation,
        loggedAt: new Date().toISOString()
    };

    exposureLogs.push(exposure);

    // Keep only last 100 logs
    if (exposureLogs.length > 100) {
        exposureLogs = exposureLogs.slice(-100);
    }

    localStorage.setItem('heavyMetalExposures', JSON.stringify(exposureLogs));

    // Reset form
    document.getElementById('exposureDate').value = '';
    document.getElementById('metalType').value = '';
    document.getElementById('exposureSource').value = '';
    document.getElementById('exposureLevel').value = 'low';
    document.getElementById('duration').value = '';
    document.getElementById('symptoms').value = '';
    document.getElementById('mitigation').value = '';

    updateStats();
    updateChart();
    updateHistory();
}

function updateStats() {
    if (exposureLogs.length === 0) {
        document.getElementById('totalIncidents').textContent = '0';
        document.getElementById('highRiskCount').textContent = '0';
        document.getElementById('commonMetal').textContent = '-';
        document.getElementById('daysSinceLast').textContent = '0';
        return;
    }

    const totalIncidents = exposureLogs.length;
    const highRiskCount = exposureLogs.filter(log => log.level === 'high').length;

    // Find most common metal
    const metalCounts = {};
    exposureLogs.forEach(log => {
        metalCounts[log.metalType] = (metalCounts[log.metalType] || 0) + 1;
    });
    const commonMetal = Object.keys(metalCounts).reduce((a, b) =>
        metalCounts[a] > metalCounts[b] ? a : b, '-');

    // Calculate days since last exposure
    const lastExposure = new Date(Math.max(...exposureLogs.map(log => new Date(log.date))));
    const today = new Date();
    const daysSinceLast = Math.floor((today - lastExposure) / (1000 * 60 * 60 * 24));

    document.getElementById('totalIncidents').textContent = totalIncidents;
    document.getElementById('highRiskCount').textContent = highRiskCount;
    document.getElementById('commonMetal').textContent = commonMetal.charAt(0).toUpperCase() + commonMetal.slice(1);
    document.getElementById('daysSinceLast').textContent = daysSinceLast;
}

function updateChart() {
    const ctx = document.getElementById('exposureChart').getContext('2d');

    // Sort logs by date
    const sortedLogs = exposureLogs.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sortedLogs.map(log => new Date(log.date).toLocaleDateString());

    // Count exposures by metal type over time
    const metalData = {};
    const riskData = { low: [], moderate: [], high: [], unknown: [] };

    sortedLogs.forEach(log => {
        if (!metalData[log.metalType]) {
            metalData[log.metalType] = [];
        }
        metalData[log.metalType].push(1);
    });

    // Prepare datasets
    const datasets = [];
    const colors = ['#4fd1ff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];

    let colorIndex = 0;
    for (const metal in metalData) {
        datasets.push({
            label: metal.charAt(0).toUpperCase() + metal.slice(1),
            data: metalData[metal],
            borderColor: colors[colorIndex % colors.length],
            backgroundColor: colors[colorIndex % colors.length] + '20',
            fill: false,
            tension: 0.4
        });
        colorIndex++;
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Heavy Metal Exposure Timeline'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Exposures'
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
    const history = document.getElementById('exposureHistory');
    history.innerHTML = '';

    // Show last 10 logs
    const recentLogs = exposureLogs.slice(-10).reverse();

    recentLogs.forEach(log => {
        const item = document.createElement('div');
        item.className = 'exposure-entry';

        const exposureDate = new Date(log.date).toLocaleDateString();
        const riskClass = log.level;
        const riskInfo = riskLevels[log.level] || riskLevels.unknown;

        item.innerHTML = `
            <h4>${exposureDate} - <span class="metal-type">${log.metalType.charAt(0).toUpperCase() + log.metalType.slice(1)}</span></h4>
            <p><strong>Source:</strong> ${log.source}</p>
            <p><strong>Risk Level:</strong> <span class="risk-level ${riskClass}">${riskInfo.label}</span></p>
            ${log.duration ? `<p><strong>Duration:</strong> ${log.duration}</p>` : ''}
            ${log.symptoms ? `<p><strong>Symptoms:</strong> ${log.symptoms}</p>` : ''}
            ${log.mitigation ? `<p><strong>Mitigation:</strong> ${log.mitigation}</p>` : ''}
        `;

        history.appendChild(item);
    });
}

// Set default date to today
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('exposureDate').value = today;

    updateStats();
    updateChart();
    updateHistory();
});