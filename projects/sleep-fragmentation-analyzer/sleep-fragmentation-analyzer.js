// sleep-fragmentation-analyzer.js

let sleepSessions = JSON.parse(localStorage.getItem('sleepSessions')) || [];
let currentSession = null;

// Update quality value display
document.getElementById('sleepQuality').addEventListener('input', function() {
    document.getElementById('qualityValue').textContent = this.value;
});

function analyzeSleep() {
    const bedTime = document.getElementById('bedTime').value;
    const wakeTime = document.getElementById('wakeTime').value;
    const totalSleepTime = parseFloat(document.getElementById('totalSleepTime').value);
    const awakenings = parseInt(document.getElementById('awakenings').value) || 0;
    const timeAwake = parseInt(document.getElementById('timeAwake').value) || 0;
    const sleepQuality = parseInt(document.getElementById('sleepQuality').value);

    if (!bedTime || !wakeTime || !totalSleepTime) {
        alert('Please enter bed time, wake time, and total sleep time.');
        return;
    }

    // Calculate time in bed (TIB) in hours
    const bedTimeDate = new Date(`2000-01-01T${bedTime}`);
    const wakeTimeDate = new Date(`2000-01-01T${wakeTime}`);

    // Handle overnight sleep
    let tibHours;
    if (wakeTimeDate < bedTimeDate) {
        // Wake time is next day
        tibHours = (24 - bedTimeDate.getHours() - bedTimeDate.getMinutes()/60) + (wakeTimeDate.getHours() + wakeTimeDate.getMinutes()/60);
    } else {
        tibHours = (wakeTimeDate - bedTimeDate) / (1000 * 60 * 60);
    }

    // Calculate Sleep Efficiency = (Total Sleep Time / Time in Bed) × 100
    const sleepEfficiency = Math.round((totalSleepTime / tibHours) * 100);

    // Calculate Fragmentation Index = (Number of Awakenings / Total Sleep Time) × 60
    // This gives awakenings per hour
    const fragmentationIndex = awakenings > 0 ? Math.round((awakenings / totalSleepTime) * 60 * 10) / 10 : 0;

    // Wake After Sleep Onset (WASO) is the time awake during the sleep period
    const waso = timeAwake;

    // Determine efficiency category
    let efficiencyCategory;
    if (sleepEfficiency >= 85) efficiencyCategory = 'Excellent';
    else if (sleepEfficiency >= 75) efficiencyCategory = 'Good';
    else if (sleepEfficiency >= 65) efficiencyCategory = 'Fair';
    else efficiencyCategory = 'Poor';

    // Update results
    document.getElementById('sleepEfficiency').textContent = `${sleepEfficiency}%`;
    document.getElementById('efficiencyCategory').textContent = efficiencyCategory;
    document.getElementById('fragmentationIndex').textContent = fragmentationIndex;
    document.getElementById('wasoResult').textContent = `${waso} min`;

    // Store current session
    currentSession = {
        id: Date.now(),
        date: new Date().toISOString(),
        bedTime,
        wakeTime,
        tibHours: Math.round(tibHours * 10) / 10,
        totalSleepTime,
        awakenings,
        timeAwake,
        sleepQuality,
        sleepEfficiency,
        fragmentationIndex,
        waso,
        efficiencyCategory,
        notes: document.getElementById('sleepNotes').value.trim()
    };

    document.getElementById('saveSessionBtn').disabled = false;
}

function saveSleepSession() {
    if (!currentSession) return;

    sleepSessions.push(currentSession);
    localStorage.setItem('sleepSessions', JSON.stringify(sleepSessions));

    updateStats();
    updateChart();
    updateHistory();

    // Reset form
    document.getElementById('bedTime').value = '';
    document.getElementById('wakeTime').value = '';
    document.getElementById('totalSleepTime').value = '';
    document.getElementById('awakenings').value = '';
    document.getElementById('timeAwake').value = '';
    document.getElementById('sleepQuality').value = '7';
    document.getElementById('qualityValue').textContent = '7';
    document.getElementById('sleepNotes').value = '';
    document.getElementById('saveSessionBtn').disabled = true;

    // Reset results
    document.getElementById('sleepEfficiency').textContent = '0%';
    document.getElementById('efficiencyCategory').textContent = 'Not Analyzed';
    document.getElementById('fragmentationIndex').textContent = '0';
    document.getElementById('wasoResult').textContent = '0 min';

    currentSession = null;
    alert('Sleep session saved successfully!');
}

function updateStats() {
    if (sleepSessions.length === 0) return;

    const avgEfficiency = sleepSessions.reduce((sum, s) => sum + s.sleepEfficiency, 0) / sleepSessions.length;
    const avgFragmentation = sleepSessions.reduce((sum, s) => sum + s.fragmentationIndex, 0) / sleepSessions.length;

    document.getElementById('avgEfficiency').textContent = `${Math.round(avgEfficiency)}%`;
    document.getElementById('avgFragmentation').textContent = Math.round(avgFragmentation * 10) / 10;
    document.getElementById('totalSessions').textContent = sleepSessions.length;
}

function updateChart() {
    const ctx = document.getElementById('sleepChart').getContext('2d');

    const labels = sleepSessions.map(s => new Date(s.date).toLocaleDateString());
    const efficiency = sleepSessions.map(s => s.sleepEfficiency);
    const fragmentation = sleepSessions.map(s => s.fragmentationIndex);
    const quality = sleepSessions.map(s => s.sleepQuality);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sleep Efficiency (%)',
                data: efficiency,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y'
            }, {
                label: 'Fragmentation Index',
                data: fragmentation,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                yAxisID: 'y1'
            }, {
                label: 'Sleep Quality (1-10)',
                data: quality,
                borderColor: '#4ecdc4',
                backgroundColor: 'rgba(78, 205, 196, 0.1)',
                yAxisID: 'y2'
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
                        text: 'Sleep Efficiency (%)'
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
                        text: 'Fragmentation (events/hour)'
                    },
                    min: 0,
                    grid: {
                        drawOnChartArea: false,
                    },
                },
                y2: {
                    type: 'linear',
                    display: false, // Hide this axis but keep data
                    min: 1,
                    max: 10
                }
            }
        }
    });
}

function updateHistory() {
    const historyDiv = document.getElementById('sleepHistory');
    historyDiv.innerHTML = '';

    const recentSessions = sleepSessions.slice(-5).reverse();

    recentSessions.forEach(session => {
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'sleep-item';
        sessionDiv.innerHTML = `
            <h4>${new Date(session.date).toLocaleString()}</h4>
            <p><strong>Bed/Wake:</strong> ${session.bedTime} - ${session.wakeTime}</p>
            <p><strong>Total Sleep:</strong> ${session.totalSleepTime}h | <strong>Time in Bed:</strong> ${session.tibHours}h</p>
            <p><strong>Efficiency:</strong> ${session.sleepEfficiency}% (${session.efficiencyCategory})</p>
            <p><strong>Fragmentation:</strong> ${session.fragmentationIndex} events/hour | <strong>WASO:</strong> ${session.waso} min</p>
            <p><strong>Quality:</strong> ${session.sleepQuality}/10 | <strong>Awakenings:</strong> ${session.awakenings}</p>
            ${session.notes ? `<p><strong>Notes:</strong> ${session.notes}</p>` : ''}
        `;
        historyDiv.appendChild(sessionDiv);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    updateChart();
    updateHistory();
});