// fat-adaptation-progress-tracker.js

let progressLogs = JSON.parse(localStorage.getItem('fatAdaptationLogs')) || [];
let progressChart = null;

function logProgress() {
    const fasting = parseFloat(document.getElementById('fastingDuration').value);
    const energy = parseInt(document.getElementById('energyLevel').value);
    const notes = document.getElementById('notes').value.trim();

    if (isNaN(fasting) || fasting < 0) {
        alert('Please enter a valid fasting duration.');
        return;
    }

    const log = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        fastingDuration: fasting,
        energyLevel: energy,
        notes: notes
    };

    progressLogs.push(log);
    // Keep last 30 days
    if (progressLogs.length > 30) {
        progressLogs = progressLogs.slice(-30);
    }

    localStorage.setItem('fatAdaptationLogs', JSON.stringify(progressLogs));

    updateStats();
    updateChart();
    updateHistory();

    // Clear form
    document.getElementById('notes').value = '';
    alert('Progress logged successfully!');
}

function updateStats() {
    if (progressLogs.length === 0) {
        document.getElementById('avgFasting').textContent = '0h';
        document.getElementById('avgEnergy').textContent = '0/10';
        document.getElementById('daysTracked').textContent = '0';
        document.getElementById('adaptationScore').textContent = '0%';
        return;
    }

    const avgFasting = progressLogs.reduce((sum, log) => sum + log.fastingDuration, 0) / progressLogs.length;
    const avgEnergy = progressLogs.reduce((sum, log) => sum + log.energyLevel, 0) / progressLogs.length;

    // Adaptation score: 50% fasting (target 16h), 50% energy (target 8+)
    const fastingScore = Math.min(avgFasting / 16, 1) * 50;
    const energyScore = Math.min(avgEnergy / 8, 1) * 50;
    const adaptationScore = Math.round(fastingScore + energyScore);

    document.getElementById('avgFasting').textContent = `${avgFasting.toFixed(1)}h`;
    document.getElementById('avgEnergy').textContent = `${avgEnergy.toFixed(1)}/10`;
    document.getElementById('daysTracked').textContent = progressLogs.length;
    document.getElementById('adaptationScore').textContent = `${adaptationScore}%`;
}

function updateChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');

    if (progressChart) {
        progressChart.destroy();
    }

    const labels = progressLogs.map(log => log.date);
    const fastingData = progressLogs.map(log => log.fastingDuration);
    const energyData = progressLogs.map(log => log.energyLevel);

    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Fasting Duration (hours)',
                data: fastingData,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y',
            }, {
                label: 'Energy Level',
                data: energyData,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                yAxisID: 'y1',
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
                        text: 'Fasting Hours'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Energy Level'
                    },
                    min: 1,
                    max: 10
                }
            }
        }
    });
}

function updateHistory() {
    const historyDiv = document.getElementById('progressHistory');
    if (progressLogs.length === 0) {
        historyDiv.innerHTML = '<p>No logs yet.</p>';
        return;
    }

    let historyHTML = '';
    // Show last 7 entries
    const recentLogs = progressLogs.slice(-7);
    recentLogs.forEach(log => {
        historyHTML += `
            <div class="progress-item">
                <h4>${log.date}</h4>
                <p><strong>Fasting:</strong> ${log.fastingDuration}h</p>
                <p><strong>Energy:</strong> ${log.energyLevel}/10</p>
                ${log.notes ? `<p><strong>Notes:</strong> ${log.notes}</p>` : ''}
            </div>
        `;
    });

    historyDiv.innerHTML = historyHTML;
}

// Update energy value display
document.getElementById('energyLevel').addEventListener('input', function() {
    document.getElementById('energyValue').textContent = this.value;
});

// Load data on page load
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    updateChart();
    updateHistory();
});