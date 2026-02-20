// cellular-energy-support-log.js

let energyEntries = JSON.parse(localStorage.getItem('cellularEnergyLog')) || [];
let energyChart = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeLog();
});

function initializeLog() {
    displayEnergyEntries();
    updateStats();
    createChart();
}

function updateEnergyValue() {
    const value = document.getElementById('energyLevel').value;
    document.getElementById('energyValue').textContent = value;
}

function logEnergyEntry() {
    const energyLevel = parseInt(document.getElementById('energyLevel').value);
    const morningEnergy = parseInt(document.getElementById('morningEnergy').value) || 0;
    const afternoonEnergy = parseInt(document.getElementById('afternoonEnergy').value) || 0;
    const eveningEnergy = parseInt(document.getElementById('eveningEnergy').value) || 0;

    // Get checked supplements
    const supplementCheckboxes = document.querySelectorAll('.supplements-grid input[type="checkbox"]:checked');
    const supplements = Array.from(supplementCheckboxes).map(cb => cb.value);

    // Get factors
    const proteinIntake = parseFloat(document.getElementById('proteinIntake').value) || 0;
    const carbIntake = parseFloat(document.getElementById('carbIntake').value) || 0;
    const fatIntake = parseFloat(document.getElementById('fatIntake').value) || 0;
    const waterIntake = parseFloat(document.getElementById('waterIntake').value) || 0;
    const exerciseMinutes = parseInt(document.getElementById('exerciseMinutes').value) || 0;
    const sleepHours = parseFloat(document.getElementById('sleepHours').value) || 0;

    const notes = document.getElementById('notes').value.trim();

    const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        energyLevels: {
            overall: energyLevel,
            morning: morningEnergy,
            afternoon: afternoonEnergy,
            evening: eveningEnergy
        },
        supplements: supplements,
        factors: {
            protein: proteinIntake,
            carbs: carbIntake,
            fat: fatIntake,
            water: waterIntake,
            exercise: exerciseMinutes,
            sleep: sleepHours
        },
        notes: notes
    };

    energyEntries.unshift(entry); // Add to beginning
    saveEnergyEntries();
    displayEnergyEntries();
    updateStats();
    updateChart();

    // Clear form
    document.getElementById('energyLevel').value = '7';
    document.getElementById('energyValue').textContent = '7';
    document.getElementById('morningEnergy').value = '7';
    document.getElementById('afternoonEnergy').value = '7';
    document.getElementById('eveningEnergy').value = '7';
    document.querySelectorAll('.supplements-grid input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('proteinIntake').value = '';
    document.getElementById('carbIntake').value = '';
    document.getElementById('fatIntake').value = '';
    document.getElementById('waterIntake').value = '';
    document.getElementById('exerciseMinutes').value = '';
    document.getElementById('sleepHours').value = '';
    document.getElementById('notes').value = '';

    showNotification('Energy entry logged successfully!', 'success');
}

function saveEnergyEntries() {
    localStorage.setItem('cellularEnergyLog', JSON.stringify(energyEntries));
}

function displayEnergyEntries() {
    const historyDiv = document.getElementById('energyHistory');
    historyDiv.innerHTML = '';

    if (energyEntries.length === 0) {
        historyDiv.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No energy entries logged yet. Start by logging your first entry above!</p>';
        return;
    }

    energyEntries.slice(0, 20).forEach(entry => { // Show last 20 entries
        const entryDiv = document.createElement('div');
        entryDiv.className = 'energy-item';

        const date = new Date(entry.date);
        const dateString = date.toLocaleDateString();

        entryDiv.innerHTML = `
            <h4>${dateString}</h4>
            <div class="energy-levels">
                <div class="energy-level">
                    <div class="value">${entry.energyLevels.overall}</div>
                    <div class="label">Overall</div>
                </div>
                <div class="energy-level">
                    <div class="value">${entry.energyLevels.morning}</div>
                    <div class="label">Morning</div>
                </div>
                <div class="energy-level">
                    <div class="value">${entry.energyLevels.afternoon}</div>
                    <div class="label">Afternoon</div>
                </div>
                <div class="energy-level">
                    <div class="value">${entry.energyLevels.evening}</div>
                    <div class="label">Evening</div>
                </div>
            </div>
            ${entry.supplements.length > 0 ? `<div class="energy-supplements">Supplements: ${entry.supplements.map(s => `<span class="supplement-tag">${s.replace('-', ' ')}</span>`).join('')}</div>` : ''}
            <div class="energy-factors">
                <div class="factor-item">Protein: ${entry.factors.protein}g</div>
                <div class="factor-item">Carbs: ${entry.factors.carbs}g</div>
                <div class="factor-item">Fat: ${entry.factors.fat}g</div>
                <div class="factor-item">Water: ${entry.factors.water}L</div>
                <div class="factor-item">Exercise: ${entry.factors.exercise}min</div>
                <div class="factor-item">Sleep: ${entry.factors.sleep}h</div>
            </div>
            ${entry.notes ? `<div class="energy-notes">"${entry.notes}"</div>` : ''}
        `;

        historyDiv.appendChild(entryDiv);
    });
}

function updateStats() {
    if (energyEntries.length === 0) {
        document.getElementById('avgEnergy').textContent = '0';
        document.getElementById('energyVariability').textContent = '0';
        document.getElementById('topSupplement').textContent = 'None';
        document.getElementById('daysLogged').textContent = '0';
        return;
    }

    // Average energy
    const totalEnergy = energyEntries.reduce((sum, e) => sum + e.energyLevels.overall, 0);
    const avgEnergy = (totalEnergy / energyEntries.length).toFixed(1);
    document.getElementById('avgEnergy').textContent = avgEnergy;

    // Energy variability (standard deviation)
    const mean = totalEnergy / energyEntries.length;
    const variance = energyEntries.reduce((sum, e) => sum + Math.pow(e.energyLevels.overall - mean, 2), 0) / energyEntries.length;
    const variability = Math.sqrt(variance).toFixed(1);
    document.getElementById('energyVariability').textContent = variability;

    // Most taken supplement
    const supplementCounts = {};
    energyEntries.forEach(entry => {
        entry.supplements.forEach(supplement => {
            supplementCounts[supplement] = (supplementCounts[supplement] || 0) + 1;
        });
    });

    let topSupplement = 'None';
    let maxCount = 0;
    for (const [supplement, count] of Object.entries(supplementCounts)) {
        if (count > maxCount) {
            maxCount = count;
            topSupplement = supplement.replace('-', ' ');
        }
    }
    document.getElementById('topSupplement').textContent = topSupplement;

    document.getElementById('daysLogged').textContent = energyEntries.length;
}

function createChart() {
    const ctx = document.getElementById('energyChart').getContext('2d');

    // Prepare data for chart (last 30 entries)
    const recentEntries = energyEntries.slice(0, 30).reverse();
    const labels = recentEntries.map(e => {
        const date = new Date(e.date);
        return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
    });
    const overallEnergy = recentEntries.map(e => e.energyLevels.overall);
    const morningEnergy = recentEntries.map(e => e.energyLevels.morning);
    const afternoonEnergy = recentEntries.map(e => e.energyLevels.afternoon);
    const eveningEnergy = recentEntries.map(e => e.energyLevels.evening);

    energyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Overall Energy',
                data: overallEnergy,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                borderWidth: 3,
                fill: false,
                tension: 0.4
            }, {
                label: 'Morning Energy',
                data: morningEnergy,
                borderColor: '#FF9800',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }, {
                label: 'Afternoon Energy',
                data: afternoonEnergy,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }, {
                label: 'Evening Energy',
                data: eveningEnergy,
                borderColor: '#9C27B0',
                backgroundColor: 'rgba(156, 39, 176, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

function updateChart() {
    if (!energyChart) return;

    const recentEntries = energyEntries.slice(0, 30).reverse();
    const labels = recentEntries.map(e => {
        const date = new Date(e.date);
        return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
    });
    const overallEnergy = recentEntries.map(e => e.energyLevels.overall);
    const morningEnergy = recentEntries.map(e => e.energyLevels.morning);
    const afternoonEnergy = recentEntries.map(e => e.energyLevels.afternoon);
    const eveningEnergy = recentEntries.map(e => e.energyLevels.evening);

    energyChart.data.labels = labels;
    energyChart.data.datasets[0].data = overallEnergy;
    energyChart.data.datasets[1].data = morningEnergy;
    energyChart.data.datasets[2].data = afternoonEnergy;
    energyChart.data.datasets[3].data = eveningEnergy;
    energyChart.update();
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);