// Telomere Health Tracker JavaScript

let telomereMeasurements = JSON.parse(localStorage.getItem('telomereMeasurements')) || [];

// Telomere length reference ranges by age group
const TELOMERE_RANGES = [
    {
        ageGroup: '20-29 years',
        minAge: 20,
        maxAge: 29,
        excellent: { min: 9.0, max: 12.0 },
        good: { min: 7.5, max: 9.0 },
        average: { min: 6.0, max: 7.5 },
        poor: { min: 4.5, max: 6.0 },
        critical: { min: 0, max: 4.5 }
    },
    {
        ageGroup: '30-39 years',
        minAge: 30,
        maxAge: 39,
        excellent: { min: 8.5, max: 11.0 },
        good: { min: 7.0, max: 8.5 },
        average: { min: 5.5, max: 7.0 },
        poor: { min: 4.0, max: 5.5 },
        critical: { min: 0, max: 4.0 }
    },
    {
        ageGroup: '40-49 years',
        minAge: 40,
        maxAge: 49,
        excellent: { min: 8.0, max: 10.0 },
        good: { min: 6.5, max: 8.0 },
        average: { min: 5.0, max: 6.5 },
        poor: { min: 3.5, max: 5.0 },
        critical: { min: 0, max: 3.5 }
    },
    {
        ageGroup: '50-59 years',
        minAge: 50,
        maxAge: 59,
        excellent: { min: 7.5, max: 9.0 },
        good: { min: 6.0, max: 7.5 },
        average: { min: 4.5, max: 6.0 },
        poor: { min: 3.0, max: 4.5 },
        critical: { min: 0, max: 3.0 }
    },
    {
        ageGroup: '60+ years',
        minAge: 60,
        maxAge: 120,
        excellent: { min: 7.0, max: 8.5 },
        good: { min: 5.5, max: 7.0 },
        average: { min: 4.0, max: 5.5 },
        poor: { min: 2.5, max: 4.0 },
        critical: { min: 0, max: 2.5 }
    }
];

// Longevity tips
const LONGEVITY_TIPS = [
    {
        title: 'Lifestyle Optimization',
        text: 'Focus on quality sleep (7-9 hours), stress management, and regular exercise to support telomere maintenance.'
    },
    {
        title: 'Nutrition for Longevity',
        text: 'Consume antioxidant-rich foods, maintain healthy omega-3 intake, and consider telomere-supporting nutrients like vitamin D and magnesium.'
    },
    {
        title: 'Stress Management',
        text: 'Chronic stress accelerates telomere shortening. Practice meditation, yoga, or other relaxation techniques regularly.'
    },
    {
        title: 'Regular Monitoring',
        text: 'Track your telomere length every 6-12 months to monitor the effectiveness of your anti-aging interventions.'
    },
    {
        title: 'Avoid Toxins',
        text: 'Minimize exposure to environmental toxins, processed foods, and smoking, all of which can damage telomeres.'
    },
    {
        title: 'Genetic Factors',
        text: 'While lifestyle plays a major role, genetic factors also influence telomere length. Focus on what you can control.'
    }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadNavbar();
    updateDisplay();
    renderTips();
    renderRanges();
});

function initializeApp() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('testDate').value = today;

    // Event listeners
    document.getElementById('measurementForm').addEventListener('submit', logMeasurement);

    // History controls
    document.getElementById('viewYear').addEventListener('click', () => filterHistory('year'));
    document.getElementById('viewAll').addEventListener('click', () => filterHistory('all'));
}

function logMeasurement(e) {
    e.preventDefault();

    const testDate = document.getElementById('testDate').value;
    const telomereLength = parseFloat(document.getElementById('telomereLength').value);
    const age = parseFloat(document.getElementById('age').value);
    const labName = document.getElementById('labName').value.trim();
    const notes = document.getElementById('notes').value.trim();

    if (!testDate || !telomereLength || !age) {
        alert('Please fill in all required fields.');
        return;
    }

    // Check if entry already exists for this date
    const existingIndex = telomereMeasurements.findIndex(m => m.date === testDate);
    if (existingIndex !== -1) {
        if (!confirm('A measurement already exists for this date. Update it?')) {
            return;
        }
        telomereMeasurements.splice(existingIndex, 1);
    }

    const measurement = {
        id: Date.now(),
        date: testDate,
        telomereLength: telomereLength,
        age: age,
        labName: labName,
        notes: notes,
        timestamp: new Date().toISOString()
    };

    telomereMeasurements.push(measurement);
    localStorage.setItem('telomereMeasurements', JSON.stringify(telomereMeasurements));

    // Reset form
    document.getElementById('measurementForm').reset();
    document.getElementById('testDate').value = new Date().toISOString().split('T')[0];

    updateDisplay();
    showNotification('Telomere measurement logged successfully!', 'success');
}

function updateDisplay() {
    updateMetrics();
    updateChart();
    updateHistory();
    updateInsights();
}

function updateMetrics() {
    if (telomereMeasurements.length === 0) {
        document.getElementById('currentLength').textContent = '0kb';
        document.getElementById('biologicalAge').textContent = '--';
        document.getElementById('totalTests').textContent = '0';
        document.getElementById('agingRate').textContent = '--%/year';
        return;
    }

    // Get latest measurement
    const sortedMeasurements = [...telomereMeasurements].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = sortedMeasurements[0];

    document.getElementById('currentLength').textContent = `${latest.telomereLength.toFixed(2)}kb`;
    document.getElementById('totalTests').textContent = telomereMeasurements.length;

    // Calculate biological age estimate (rough approximation)
    const biologicalAge = estimateBiologicalAge(latest.telomereLength, latest.age);
    document.getElementById('biologicalAge').textContent = biologicalAge ? `${biologicalAge} years` : '--';

    // Calculate aging rate if we have multiple measurements
    if (telomereMeasurements.length >= 2) {
        const agingRate = calculateAgingRate();
        document.getElementById('agingRate').textContent = agingRate ? `${agingRate.toFixed(1)}%/year` : '--%/year';
    } else {
        document.getElementById('agingRate').textContent = '--%/year';
    }
}

function estimateBiologicalAge(telomereLength, chronologicalAge) {
    // Simple estimation based on telomere length relative to age group averages
    const ageGroup = TELOMERE_RANGES.find(range => chronologicalAge >= range.minAge && chronologicalAge <= range.maxAge);
    if (!ageGroup) return null;

    const averageLength = (ageGroup.average.min + ageGroup.average.max) / 2;

    // Rough estimation: shorter telomeres suggest older biological age
    if (telomereLength >= ageGroup.excellent.min) {
        return Math.max(chronologicalAge - 5, chronologicalAge * 0.8);
    } else if (telomereLength >= ageGroup.good.min) {
        return chronologicalAge - 2;
    } else if (telomereLength >= ageGroup.average.min) {
        return chronologicalAge;
    } else if (telomereLength >= ageGroup.poor.min) {
        return chronologicalAge + 3;
    } else {
        return chronologicalAge + 7;
    }
}

function calculateAgingRate() {
    if (telomereMeasurements.length < 2) return null;

    const sorted = [...telomereMeasurements].sort((a, b) => new Date(a.date) - new Date(b.date));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const timeDiffYears = (new Date(last.date) - new Date(first.date)) / (365.25 * 24 * 60 * 60 * 1000);
    if (timeDiffYears < 0.5) return null; // Need at least 6 months

    const lengthChange = last.telomereLength - first.telomereLength;
    const annualChange = lengthChange / timeDiffYears;
    const agingRate = (annualChange / first.telomereLength) * 100;

    return agingRate;
}

function updateChart() {
    const ctx = document.getElementById('telomereChart').getContext('2d');

    // Sort measurements by date
    const sortedMeasurements = [...telomereMeasurements].sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sortedMeasurements.map(m => new Date(m.date).toLocaleDateString());
    const lengths = sortedMeasurements.map(m => m.telomereLength);

    if (window.telomereChart) {
        window.telomereChart.destroy();
    }

    window.telomereChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Telomere Length',
                data: lengths,
                borderColor: 'rgba(79, 209, 255, 1)',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const measurement = sortedMeasurements[context.dataIndex];
                            return [
                                `Length: ${context.parsed.y}kb`,
                                `Age: ${measurement.age} years`,
                                `Lab: ${measurement.labName || 'N/A'}`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Telomere Length (kb)'
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

function updateHistory(filter = 'all') {
    const historyContainer = document.getElementById('measurementHistory');
    let filteredMeasurements = [...telomereMeasurements];

    const now = new Date();
    if (filter === 'year') {
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        filteredMeasurements = telomereMeasurements.filter(m => new Date(m.date) >= yearAgo);
    }

    // Sort by date descending
    filteredMeasurements.sort((a, b) => new Date(b.date) - new Date(a.date));

    historyContainer.innerHTML = '';

    if (filteredMeasurements.length === 0) {
        historyContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No telomere measurements found for this period.</p>';
        return;
    }

    filteredMeasurements.forEach(measurement => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';

        const status = getTelomereStatus(measurement.telomereLength, measurement.age);

        historyItem.innerHTML = `
            <div class="history-date">${new Date(measurement.date).toLocaleDateString()}</div>
            <div class="history-details">
                <div class="history-length ${status ? status.class : ''}">${measurement.telomereLength.toFixed(2)}kb</div>
                <div class="history-age">Age: ${measurement.age} years</div>
                ${measurement.labName ? `<div class="history-notes">Lab: ${measurement.labName}</div>` : ''}
                ${measurement.notes ? `<div class="history-notes">${measurement.notes}</div>` : ''}
            </div>
        `;

        historyContainer.appendChild(historyItem);
    });
}

function filterHistory(period) {
    // Update active button
    document.querySelectorAll('.history-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${period.charAt(0).toUpperCase() + period.slice(1)}`).classList.add('active');

    updateHistory(period);
}

function getTelomereStatus(length, age) {
    const ageGroup = TELOMERE_RANGES.find(range => age >= range.minAge && age <= range.maxAge);
    if (!ageGroup) return null;

    if (length >= ageGroup.excellent.min) return { status: 'Excellent', class: 'status-excellent' };
    if (length >= ageGroup.good.min) return { status: 'Good', class: 'status-good' };
    if (length >= ageGroup.average.min) return { status: 'Average', class: 'status-average' };
    if (length >= ageGroup.poor.min) return { status: 'Poor', class: 'status-poor' };
    return { status: 'Critical', class: 'status-critical' };
}

function updateInsights() {
    updateHealthStatus();
    updateAgingTrajectory();
    updateInterventionEffectiveness();
}

function updateHealthStatus() {
    const statusContainer = document.getElementById('healthStatus');

    if (telomereMeasurements.length === 0) {
        statusContainer.innerHTML = '<p>Log your first telomere measurement to see your health status.</p>';
        return;
    }

    const sortedMeasurements = [...telomereMeasurements].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = sortedMeasurements[0];
    const status = getTelomereStatus(latest.telomereLength, latest.age);

    if (status) {
        statusContainer.innerHTML = `
            <p><strong class="${status.class}">${status.status}</strong> telomere length for your age group.</p>
            <p>Current length: ${latest.telomereLength.toFixed(2)}kb at age ${latest.age}.</p>
        `;
    }
}

function updateAgingTrajectory() {
    const trajectoryContainer = document.getElementById('agingTrajectory');

    if (telomereMeasurements.length < 2) {
        trajectoryContainer.innerHTML = '<p>Log multiple measurements over time to see your aging trajectory.</p>';
        return;
    }

    const agingRate = calculateAgingRate();
    if (agingRate === null) {
        trajectoryContainer.innerHTML = '<p>Need more time between measurements to calculate aging rate.</p>';
        return;
    }

    if (agingRate > -0.5) {
        trajectoryContainer.innerHTML = `<p>Telomeres are shortening at ${Math.abs(agingRate).toFixed(1)}% per year. Consider anti-aging interventions.</p>`;
    } else if (agingRate > -2) {
        trajectoryContainer.innerHTML = '<p>Telomere shortening is within normal range. Maintain healthy lifestyle habits.</p>';
    } else {
        trajectoryContainer.innerHTML = '<p>Excellent telomere maintenance! Your lifestyle interventions are effective.</p>';
    }
}

function updateInterventionEffectiveness() {
    const effectivenessContainer = document.getElementById('interventionEffectiveness');

    if (telomereMeasurements.length < 3) {
        effectivenessContainer.innerHTML = '<p>Log at least 3 measurements to assess intervention effectiveness.</p>';
        return;
    }

    const sorted = [...telomereMeasurements].sort((a, b) => new Date(a.date) - new Date(b.date));
    const recent = sorted.slice(-3); // Last 3 measurements

    const changes = [];
    for (let i = 1; i < recent.length; i++) {
        changes.push(recent[i].telomereLength - recent[i-1].telomereLength);
    }

    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;

    if (avgChange > 0.1) {
        effectivenessContainer.innerHTML = '<p>Positive trend detected! Your interventions are working to maintain telomere length.</p>';
    } else if (avgChange > -0.1) {
        effectivenessContainer.innerHTML = '<p>Telomere length is stable. Continue current interventions and monitor.</p>';
    } else {
        effectivenessContainer.innerHTML = '<p>Telomeres are shortening. Consider adjusting your anti-aging strategy.</p>';
    }
}

function renderTips() {
    const tipsContainer = document.getElementById('tips');

    LONGEVITY_TIPS.forEach(tip => {
        const tipElement = document.createElement('div');
        tipElement.className = 'tip-item';
        tipElement.innerHTML = `
            <h4>${tip.title}</h4>
            <p>${tip.text}</p>
        `;
        tipsContainer.appendChild(tipElement);
    });
}

function renderRanges() {
    const rangesContainer = document.getElementById('ranges');

    TELOMERE_RANGES.forEach(range => {
        const rangeElement = document.createElement('div');
        rangeElement.className = 'range-item';
        rangeElement.innerHTML = `
            <h3>${range.ageGroup}</h3>
            <div class="range">Excellent: ${range.excellent.min}-${range.excellent.max}kb</div>
            <div class="range">Good: ${range.good.min}-${range.good.max}kb</div>
            <div class="range">Average: ${range.average.min}-${range.average.max}kb</div>
            <div class="range">Poor: ${range.poor.min}-${range.poor.max}kb</div>
            <div class="range">Critical: 0-${range.critical.max}kb</div>
        `;
        rangesContainer.appendChild(rangeElement);
    });
}

function loadNavbar() {
    fetch('../navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
        })
        .catch(error => console.error('Error loading navbar:', error));
}

function showNotification(message, type = 'info') {
    // Simple notification - you could enhance this
    alert(message);
}