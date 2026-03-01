// detox-recovery-phase-tracker.js

let detoxEntries = JSON.parse(localStorage.getItem('detoxRecoveryEntries')) || [];
let chart = null;

const phases = {
    preparation: { name: 'Preparation Phase', description: 'Preparing your body for detox with gentle dietary changes' },
    active: { name: 'Active Detox Phase', description: 'Body actively eliminating toxins' },
    recovery: { name: 'Recovery Phase', description: 'Symptoms subside, energy returns' },
    maintenance: { name: 'Maintenance Phase', description: 'Maintain healthy habits' }
};

document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today
    document.getElementById('logDate').valueAsDate = new Date();

    // Initialize symptom value displays
    initializeSymptomSliders();

    // Load and display data
    updateDisplay();
    renderChart();
});

function initializeSymptomSliders() {
    const symptoms = ['fatigue', 'headache', 'nausea', 'skinChanges', 'mood', 'energy'];

    symptoms.forEach(symptom => {
        const slider = document.getElementById(symptom);
        const valueDisplay = document.getElementById(symptom + 'Value');

        slider.addEventListener('input', function() {
            valueDisplay.textContent = this.value;
        });

        // Set initial value
        valueDisplay.textContent = slider.value;
    });
}

function logEntry() {
    const date = document.getElementById('logDate').value;
    const phase = document.getElementById('currentPhaseSelect').value;
    const notes = document.getElementById('notes').value.trim();

    if (!date) {
        alert('Please select a date for the entry.');
        return;
    }

    // Check if entry already exists for this date
    const existingEntry = detoxEntries.find(entry => entry.date === date);
    if (existingEntry) {
        if (!confirm('An entry already exists for this date. Do you want to update it?')) {
            return;
        }
        // Remove existing entry
        detoxEntries = detoxEntries.filter(entry => entry.date !== date);
    }

    const symptoms = {
        fatigue: parseInt(document.getElementById('fatigue').value),
        headache: parseInt(document.getElementById('headache').value),
        nausea: parseInt(document.getElementById('nausea').value),
        skinChanges: parseInt(document.getElementById('skinChanges').value),
        mood: parseInt(document.getElementById('mood').value),
        energy: parseInt(document.getElementById('energy').value)
    };

    const entry = {
        id: Date.now(),
        date: date,
        phase: phase,
        symptoms: symptoms,
        notes: notes,
        timestamp: new Date().toISOString()
    };

    detoxEntries.push(entry);
    detoxEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Save to localStorage
    localStorage.setItem('detoxRecoveryEntries', JSON.stringify(detoxEntries));

    // Clear form
    document.getElementById('notes').value = '';

    // Update display
    updateDisplay();
    renderChart();

    // Show success message
    alert('Entry logged successfully!');
}

function updateDisplay() {
    // Update current phase display
    if (detoxEntries.length > 0) {
        const latestEntry = detoxEntries[detoxEntries.length - 1];
        const phaseInfo = phases[latestEntry.phase];

        document.getElementById('currentPhase').innerHTML = `
            <div class="phase-name">${phaseInfo.name}</div>
            <div class="phase-description">${phaseInfo.description}</div>
        `;

        // Update stats
        document.getElementById('daysTracked').textContent = detoxEntries.length;
        document.getElementById('currentPhaseStat').textContent = phaseInfo.name.split(' ')[0];

        // Calculate average symptom intensity
        const avgSymptoms = calculateAverageSymptoms();
        document.getElementById('avgSymptoms').textContent = avgSymptoms.toFixed(1);

        // Calculate improvement (reduction in symptoms over time)
        const improvement = calculateImprovement();
        document.getElementById('improvement').textContent = improvement >= 0 ? `+${improvement.toFixed(1)}%` : `${improvement.toFixed(1)}%`;
    } else {
        // Default state
        document.getElementById('currentPhase').innerHTML = `
            <div class="phase-name">Preparation Phase</div>
            <div class="phase-description">Preparing your body for detox with gentle dietary changes</div>
        `;

        document.getElementById('daysTracked').textContent = '0';
        document.getElementById('currentPhaseStat').textContent = 'Preparation';
        document.getElementById('avgSymptoms').textContent = '0';
        document.getElementById('improvement').textContent = '0%';
    }
}

function calculateAverageSymptoms() {
    if (detoxEntries.length === 0) return 0;

    let totalSymptoms = 0;
    let count = 0;

    detoxEntries.forEach(entry => {
        const symptomValues = Object.values(entry.symptoms);
        totalSymptoms += symptomValues.reduce((sum, val) => sum + val, 0);
        count += symptomValues.length;
    });

    return totalSymptoms / count;
}

function calculateImprovement() {
    if (detoxEntries.length < 2) return 0;

    const firstWeek = detoxEntries.slice(0, Math.min(7, detoxEntries.length));
    const lastWeek = detoxEntries.slice(-Math.min(7, detoxEntries.length));

    const firstAvg = firstWeek.reduce((sum, entry) => {
        return sum + Object.values(entry.symptoms).reduce((s, v) => s + v, 0) / Object.values(entry.symptoms).length;
    }, 0) / firstWeek.length;

    const lastAvg = lastWeek.reduce((sum, entry) => {
        return sum + Object.values(entry.symptoms).reduce((s, v) => s + v, 0) / Object.values(entry.symptoms).length;
    }, 0) / lastWeek.length;

    if (firstAvg === 0) return 0;
    return ((firstAvg - lastAvg) / firstAvg) * 100;
}

function renderChart() {
    const ctx = document.getElementById('symptomsChart').getContext('2d');

    if (chart) {
        chart.destroy();
    }

    if (detoxEntries.length === 0) {
        return;
    }

    const labels = detoxEntries.map(entry => new Date(entry.date).toLocaleDateString());
    const datasets = [
        {
            label: 'Fatigue',
            data: detoxEntries.map(entry => entry.symptoms.fatigue),
            borderColor: '#ff6b6b',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            tension: 0.4
        },
        {
            label: 'Headache',
            data: detoxEntries.map(entry => entry.symptoms.headache),
            borderColor: '#4ecdc4',
            backgroundColor: 'rgba(78, 205, 196, 0.1)',
            tension: 0.4
        },
        {
            label: 'Nausea',
            data: detoxEntries.map(entry => entry.symptoms.nausea),
            borderColor: '#45b7d1',
            backgroundColor: 'rgba(69, 183, 209, 0.1)',
            tension: 0.4
        },
        {
            label: 'Skin Changes',
            data: detoxEntries.map(entry => entry.symptoms.skinChanges),
            borderColor: '#f9ca24',
            backgroundColor: 'rgba(249, 202, 36, 0.1)',
            tension: 0.4
        },
        {
            label: 'Mood Changes',
            data: detoxEntries.map(entry => entry.symptoms.mood),
            borderColor: '#f0932b',
            backgroundColor: 'rgba(240, 147, 43, 0.1)',
            tension: 0.4
        },
        {
            label: 'Energy Level',
            data: detoxEntries.map(entry => entry.symptoms.energy),
            borderColor: '#eb4d4b',
            backgroundColor: 'rgba(235, 77, 75, 0.1)',
            tension: 0.4
        }
    ];

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
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
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y}/10`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        color: '#fff',
                        callback: function(value) {
                            return value + '/10';
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

// Export data functionality
function exportData() {
    const dataStr = JSON.stringify(detoxEntries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = 'detox-recovery-data.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Make export function available globally if needed
window.exportData = exportData;