// strain-vs-recovery-balance-dashboard.js

let balanceEntries = JSON.parse(localStorage.getItem('strainRecoveryBalance')) || [];
let balanceChart = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    displayBalanceEntries();
    updateStats();
    createChart();
}

function logDailyBalance() {
    const workHours = parseFloat(document.getElementById('workHours').value) || 0;
    const exerciseIntensity = parseInt(document.getElementById('exerciseIntensity').value) || 5;
    const stressLevel = parseInt(document.getElementById('stressLevel').value) || 5;
    const sleepHours = parseFloat(document.getElementById('sleepHours').value) || 0;
    const meditationMinutes = parseInt(document.getElementById('meditationMinutes').value) || 0;
    const relaxationScore = parseInt(document.getElementById('relaxationScore').value) || 5;
    const notes = document.getElementById('notes').value.trim();

    // Calculate scores
    const strainScore = calculateStrainScore(workHours, exerciseIntensity, stressLevel);
    const recoveryScore = calculateRecoveryScore(sleepHours, meditationMinutes, relaxationScore);
    const balanceScore = recoveryScore - strainScore;

    const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        strain: {
            workHours: workHours,
            exerciseIntensity: exerciseIntensity,
            stressLevel: stressLevel,
            score: strainScore
        },
        recovery: {
            sleepHours: sleepHours,
            meditationMinutes: meditationMinutes,
            relaxationScore: relaxationScore,
            score: recoveryScore
        },
        balanceScore: balanceScore,
        notes: notes
    };

    balanceEntries.unshift(entry); // Add to beginning
    saveBalanceEntries();
    displayBalanceEntries();
    updateStats();
    updateChart();

    // Clear form
    document.getElementById('workHours').value = '';
    document.getElementById('exerciseIntensity').value = '5';
    document.getElementById('stressLevel').value = '5';
    document.getElementById('sleepHours').value = '';
    document.getElementById('meditationMinutes').value = '';
    document.getElementById('relaxationScore').value = '5';
    document.getElementById('notes').value = '';

    showNotification('Daily balance logged successfully!', 'success');
}

function calculateStrainScore(workHours, exerciseIntensity, stressLevel) {
    // Normalize to 0-10 scale
    const workScore = Math.min(workHours / 2.4, 10); // 12 hours = 5, 24 hours = 10
    const exerciseScore = exerciseIntensity / 2; // 1-10 becomes 0.5-5
    const stressScore = stressLevel / 2; // 1-10 becomes 0.5-5

    return Math.round((workScore + exerciseScore + stressScore) / 3 * 10) / 10;
}

function calculateRecoveryScore(sleepHours, meditationMinutes, relaxationScore) {
    // Normalize to 0-10 scale
    const sleepScore = Math.min(sleepHours / 1.2, 10); // 8 hours = 6.67, 12 hours = 10
    const meditationScore = Math.min(meditationMinutes / 60, 10); // 60 min = 1, 600 min = 10
    const relaxationScoreNorm = relaxationScore / 2; // 1-10 becomes 0.5-5

    return Math.round((sleepScore + meditationScore + relaxationScoreNorm) / 3 * 10) / 10;
}

function saveBalanceEntries() {
    localStorage.setItem('strainRecoveryBalance', JSON.stringify(balanceEntries));
}

function displayBalanceEntries() {
    const historyDiv = document.getElementById('balanceHistory');
    historyDiv.innerHTML = '';

    if (balanceEntries.length === 0) {
        historyDiv.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No balance entries logged yet. Start by logging your first entry above!</p>';
        return;
    }

    balanceEntries.slice(0, 20).forEach(entry => { // Show last 20 entries
        const entryDiv = document.createElement('div');
        entryDiv.className = 'balance-item';

        const balanceStatus = getBalanceStatus(entry.balanceScore);

        entryDiv.innerHTML = `
            <h4>${formatDate(entry.date)}</h4>
            <div class="balance-scores">
                <span class="score-strain">Strain: ${entry.strain.score.toFixed(1)}</span>
                <span class="score-recovery">Recovery: ${entry.recovery.score.toFixed(1)}</span>
                <span class="score-balance">${balanceStatus}: ${entry.balanceScore.toFixed(1)}</span>
            </div>
            <div class="balance-details">
                <div>
                    <strong>Work:</strong> ${entry.strain.workHours}h<br>
                    <strong>Exercise:</strong> ${entry.strain.exerciseIntensity}/10<br>
                    <strong>Stress:</strong> ${entry.strain.stressLevel}/10
                </div>
                <div>
                    <strong>Sleep:</strong> ${entry.recovery.sleepHours}h<br>
                    <strong>Meditation:</strong> ${entry.recovery.meditationMinutes}min<br>
                    <strong>Relaxation:</strong> ${entry.recovery.relaxationScore}/10
                </div>
            </div>
            ${entry.notes ? `<div class="balance-notes">"${entry.notes}"</div>` : ''}
        `;

        historyDiv.appendChild(entryDiv);
    });
}

function getBalanceStatus(score) {
    if (score > 2) return 'Over-recovered';
    if (score < -2) return 'Over-strained';
    return 'Balanced';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

function updateStats() {
    if (balanceEntries.length === 0) {
        document.getElementById('currentBalance').textContent = '0';
        document.getElementById('balanceIndicator').textContent = 'Neutral';
        document.getElementById('balanceIndicator').className = 'balance-indicator';
        document.getElementById('avgStrain').textContent = '0';
        document.getElementById('avgRecovery').textContent = '0';
        document.getElementById('daysLogged').textContent = '0';
        return;
    }

    // Current balance (most recent)
    const currentEntry = balanceEntries[0];
    const currentBalance = currentEntry.balanceScore.toFixed(1);
    const balanceStatus = getBalanceStatus(currentEntry.balanceScore);

    document.getElementById('currentBalance').textContent = currentBalance;
    document.getElementById('balanceIndicator').textContent = balanceStatus;
    document.getElementById('balanceIndicator').className = `balance-indicator ${balanceStatus.toLowerCase().replace(' ', '-')}`;

    // Average scores
    const totalStrain = balanceEntries.reduce((sum, e) => sum + e.strain.score, 0);
    const totalRecovery = balanceEntries.reduce((sum, e) => sum + e.recovery.score, 0);

    const avgStrain = (totalStrain / balanceEntries.length).toFixed(1);
    const avgRecovery = (totalRecovery / balanceEntries.length).toFixed(1);

    document.getElementById('avgStrain').textContent = avgStrain;
    document.getElementById('avgRecovery').textContent = avgRecovery;
    document.getElementById('daysLogged').textContent = balanceEntries.length;
}

function createChart() {
    const ctx = document.getElementById('balanceChart').getContext('2d');

    // Prepare data for chart (last 30 entries)
    const recentEntries = balanceEntries.slice(0, 30).reverse();
    const labels = recentEntries.map(e => formatDate(e.date));
    const strainData = recentEntries.map(e => e.strain.score);
    const recoveryData = recentEntries.map(e => e.recovery.score);
    const balanceData = recentEntries.map(e => e.balanceScore);

    balanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Strain Score',
                data: strainData,
                borderColor: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }, {
                label: 'Recovery Score',
                data: recoveryData,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }, {
                label: 'Balance Score',
                data: balanceData,
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                borderWidth: 3,
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
    if (!balanceChart) return;

    const recentEntries = balanceEntries.slice(0, 30).reverse();
    const labels = recentEntries.map(e => formatDate(e.date));
    const strainData = recentEntries.map(e => e.strain.score);
    const recoveryData = recentEntries.map(e => e.recovery.score);
    const balanceData = recentEntries.map(e => e.balanceScore);

    balanceChart.data.labels = labels;
    balanceChart.data.datasets[0].data = strainData;
    balanceChart.data.datasets[1].data = recoveryData;
    balanceChart.data.datasets[2].data = balanceData;
    balanceChart.update();
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