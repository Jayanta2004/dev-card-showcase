// gut-recovery-phase-log.js

let recoveryEntries = JSON.parse(localStorage.getItem('gutRecoveryLog')) || [];
let severityChart = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeLog();
    updateSeveritySlider();
});

function initializeLog() {
    displayRecoveryEntries();
    updateStats();
    createChart();
}

function updateSeveritySlider() {
    const slider = document.getElementById('symptomSeverity');
    const value = document.getElementById('severityValue');

    slider.addEventListener('input', function() {
        value.textContent = this.value;
    });
}

function logRecoveryEntry() {
    const phase = document.getElementById('recoveryPhase').value;
    const severity = parseInt(document.getElementById('symptomSeverity').value);
    const dietNotes = document.getElementById('dietNotes').value.trim();
    const recoveryNotes = document.getElementById('recoveryNotes').value.trim();

    // Get checked symptoms
    const symptomCheckboxes = document.querySelectorAll('.symptoms-grid input[type="checkbox"]:checked');
    const symptoms = Array.from(symptomCheckboxes).map(cb => cb.value);

    if (symptoms.length === 0 && !recoveryNotes) {
        alert('Please select at least one symptom or add recovery notes.');
        return;
    }

    const entry = {
        id: Date.now(),
        phase: phase,
        symptoms: symptoms,
        severity: severity,
        dietNotes: dietNotes,
        recoveryNotes: recoveryNotes,
        date: new Date().toISOString()
    };

    recoveryEntries.unshift(entry); // Add to beginning
    saveRecoveryEntries();
    displayRecoveryEntries();
    updateStats();
    updateChart();

    // Clear form
    document.querySelectorAll('.symptoms-grid input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('symptomSeverity').value = '5';
    document.getElementById('severityValue').textContent = '5';
    document.getElementById('dietNotes').value = '';
    document.getElementById('recoveryNotes').value = '';

    showNotification('Recovery entry logged successfully!', 'success');
}

function saveRecoveryEntries() {
    localStorage.setItem('gutRecoveryLog', JSON.stringify(recoveryEntries));
}

function displayRecoveryEntries() {
    const historyDiv = document.getElementById('recoveryHistory');
    historyDiv.innerHTML = '';

    if (recoveryEntries.length === 0) {
        historyDiv.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No recovery entries logged yet. Start by logging your first entry above!</p>';
        return;
    }

    recoveryEntries.slice(0, 20).forEach(entry => { // Show last 20 entries
        const entryDiv = document.createElement('div');
        entryDiv.className = 'recovery-item';

        const phaseDisplay = getPhaseDisplayName(entry.phase);

        entryDiv.innerHTML = `
            <h4>${phaseDisplay}</h4>
            <div class="recovery-phase">${entry.phase.replace('-', ' ')}</div>
            ${entry.symptoms.length > 0 ? `<div class="recovery-symptoms">Symptoms: ${entry.symptoms.map(s => `<span class="symptom-tag">${s.replace('-', ' ')}</span>`).join('')}</div>` : ''}
            <div class="recovery-severity">Severity: ${entry.severity}/10</div>
            ${entry.dietNotes ? `<p class="recovery-diet"><strong>Diet:</strong> ${entry.dietNotes}</p>` : ''}
            ${entry.recoveryNotes ? `<p class="recovery-notes"><strong>Notes:</strong> ${entry.recoveryNotes}</p>` : ''}
            <div class="recovery-date">${formatDate(entry.date)}</div>
        `;

        historyDiv.appendChild(entryDiv);
    });
}

function getPhaseDisplayName(phase) {
    const names = {
        'acute': 'Acute Phase',
        'early-recovery': 'Early Recovery',
        'mid-recovery': 'Mid Recovery',
        'late-recovery': 'Late Recovery',
        'maintenance': 'Maintenance Phase'
    };
    return names[phase] || phase;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function updateStats() {
    if (recoveryEntries.length === 0) {
        document.getElementById('currentPhase').textContent = 'Not Started';
        document.getElementById('daysInRecovery').textContent = '0';
        document.getElementById('avgSeverity').textContent = '0';
        document.getElementById('commonSymptom').textContent = 'None';
        return;
    }

    // Current phase (most recent entry)
    const currentPhase = getPhaseDisplayName(recoveryEntries[0].phase);
    document.getElementById('currentPhase').textContent = currentPhase;

    // Days in recovery (from first entry to now)
    const firstEntryDate = new Date(recoveryEntries[recoveryEntries.length - 1].date);
    const daysInRecovery = Math.floor((new Date() - firstEntryDate) / (1000 * 60 * 60 * 24)) + 1;
    document.getElementById('daysInRecovery').textContent = daysInRecovery;

    // Average severity
    const totalSeverity = recoveryEntries.reduce((sum, e) => sum + e.severity, 0);
    const avgSeverity = (totalSeverity / recoveryEntries.length).toFixed(1);
    document.getElementById('avgSeverity').textContent = avgSeverity;

    // Most common symptom
    const symptomCounts = {};
    recoveryEntries.forEach(entry => {
        entry.symptoms.forEach(symptom => {
            symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        });
    });

    let commonSymptom = 'None';
    let maxCount = 0;
    for (const [symptom, count] of Object.entries(symptomCounts)) {
        if (count > maxCount) {
            maxCount = count;
            commonSymptom = symptom.replace('-', ' ');
        }
    }
    document.getElementById('commonSymptom').textContent = commonSymptom;
}

function createChart() {
    const ctx = document.getElementById('severityChart').getContext('2d');

    // Prepare data for chart (last 30 entries)
    const recentEntries = recoveryEntries.slice(0, 30).reverse();
    const labels = recentEntries.map((e, i) => `Entry ${recentEntries.length - i}`);
    const severityData = recentEntries.map(e => e.severity);

    severityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Symptom Severity',
                data: severityData,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                borderWidth: 2,
                fill: true,
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
                    display: false
                }
            }
        }
    });
}

function updateChart() {
    if (!severityChart) return;

    const recentEntries = recoveryEntries.slice(0, 30).reverse();
    const labels = recentEntries.map((e, i) => `Entry ${recentEntries.length - i}`);
    const severityData = recentEntries.map(e => e.severity);

    severityChart.data.labels = labels;
    severityChart.data.datasets[0].data = severityData;
    severityChart.update();
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