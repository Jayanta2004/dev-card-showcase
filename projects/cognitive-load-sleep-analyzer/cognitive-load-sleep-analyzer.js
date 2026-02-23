// cognitive-load-sleep-analyzer.js

let entries = JSON.parse(localStorage.getItem('cognitiveLoadSleepEntries')) || [];

function updateLoadValue() {
    const value = document.getElementById('cognitiveLoad').value;
    document.getElementById('currentLoadValue').textContent = value;
}

function updateQualityValue() {
    const value = document.getElementById('sleepQuality').value;
    document.getElementById('currentQualityValue').textContent = value;
}

function logEntry() {
    const date = document.getElementById('logDate').value;
    const workHours = parseFloat(document.getElementById('workHours').value);
    const cognitiveLoad = parseInt(document.getElementById('cognitiveLoad').value);
    const sleepHours = parseFloat(document.getElementById('sleepHours').value);
    const sleepQuality = parseInt(document.getElementById('sleepQuality').value);
    const workNotes = document.getElementById('workNotes').value.trim();
    const sleepNotes = document.getElementById('sleepNotes').value.trim();

    if (!date) {
        alert('Please select a date.');
        return;
    }

    if (isNaN(workHours) || workHours < 0 || workHours > 24) {
        alert('Please enter valid work hours (0-24).');
        return;
    }

    if (isNaN(sleepHours) || sleepHours < 0 || sleepHours > 24) {
        alert('Please enter valid sleep hours (0-24).');
        return;
    }

    // Check if entry already exists for this date
    const existingEntry = entries.find(entry => entry.date === date);
    if (existingEntry) {
        if (!confirm('An entry already exists for this date. Do you want to update it?')) {
            return;
        }
        // Remove existing entry
        entries = entries.filter(entry => entry.date !== date);
    }

    const entry = {
        id: Date.now(),
        date,
        workHours,
        cognitiveLoad,
        sleepHours,
        sleepQuality,
        workNotes,
        sleepNotes
    };

    entries.push(entry);

    // Sort by date
    entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Keep only last 100 entries
    if (entries.length > 100) {
        entries = entries.slice(-100);
    }

    localStorage.setItem('cognitiveLoadSleepEntries', JSON.stringify(entries));

    // Clear form
    document.getElementById('logDate').value = '';
    document.getElementById('workHours').value = '';
    document.getElementById('cognitiveLoad').value = 5;
    document.getElementById('sleepHours').value = '';
    document.getElementById('sleepQuality').value = 7;
    document.getElementById('workNotes').value = '';
    document.getElementById('sleepNotes').value = '';
    updateLoadValue();
    updateQualityValue();

    updateStats();
    updateChart();
    updateEntriesList();
}

function calculateCorrelation(x, y) {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : (numerator / denominator).toFixed(2);
}

function updateStats() {
    // Calculate stats for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEntries = entries.filter(entry => new Date(entry.date) >= sevenDaysAgo);

    if (recentEntries.length < 2) {
        document.getElementById('correlation').textContent = 'N/A';
        document.getElementById('avgWorkHours').textContent = '0.0h';
        document.getElementById('avgSleepQuality').textContent = '0.0';
        return;
    }

    // Calculate correlation between cognitive load and sleep quality
    const workLoads = recentEntries.map(entry => entry.cognitiveLoad);
    const sleepQualities = recentEntries.map(entry => entry.sleepQuality);
    const correlation = calculateCorrelation(workLoads, sleepQualities);

    // Calculate averages
    const avgWorkHours = (recentEntries.reduce((sum, entry) => sum + entry.workHours, 0) / recentEntries.length).toFixed(1);
    const avgSleepQuality = (recentEntries.reduce((sum, entry) => sum + entry.sleepQuality, 0) / recentEntries.length).toFixed(1);

    document.getElementById('correlation').textContent = correlation;
    document.getElementById('avgWorkHours').textContent = `${avgWorkHours}h`;
    document.getElementById('avgSleepQuality').textContent = avgSleepQuality;
}

function updateChart() {
    const ctx = document.getElementById('correlationChart').getContext('2d');

    // Prepare data for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const chartEntries = entries.filter(entry => new Date(entry.date) >= thirtyDaysAgo);

    if (chartEntries.length === 0) return;

    const labels = chartEntries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString();
    });

    const workLoadData = chartEntries.map(entry => entry.cognitiveLoad);
    const sleepQualityData = chartEntries.map(entry => entry.sleepQuality);
    const workHoursData = chartEntries.map(entry => entry.workHours);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cognitive Load',
                data: workLoadData,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Sleep Quality',
                data: sleepQualityData,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Work Hours',
                data: workHoursData,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Load/Quality (1-10)'
                    },
                    min: 1,
                    max: 10
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Work Hours'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

function updateEntriesList() {
    const entriesList = document.getElementById('entriesList');
    entriesList.innerHTML = '';

    // Show last 7 entries
    const recentEntries = entries.slice(-7).reverse();

    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry-item';

        const workLoadClass = entry.cognitiveLoad >= 8 ? 'work-high' :
                            entry.cognitiveLoad >= 5 ? 'work-medium' : 'work-low';
        const sleepQualityClass = entry.sleepQuality >= 8 ? 'sleep-high' :
                                entry.sleepQuality >= 5 ? 'sleep-medium' : 'sleep-low';

        entryDiv.innerHTML = `
            <div class="entry-date">${new Date(entry.date).toLocaleDateString()}</div>

            <div class="work-data">
                <h4>Work</h4>
                <div class="work-metric">
                    <span class="metric-label">Hours:</span>
                    <span class="metric-value">${entry.workHours}h</span>
                </div>
                <div class="work-metric">
                    <span class="metric-label">Load:</span>
                    <span class="metric-value ${workLoadClass}">${entry.cognitiveLoad}/10</span>
                </div>
            </div>

            <div class="sleep-data">
                <h4>Sleep</h4>
                <div class="sleep-metric">
                    <span class="metric-label">Hours:</span>
                    <span class="metric-value">${entry.sleepHours}h</span>
                </div>
                <div class="sleep-metric">
                    <span class="metric-label">Quality:</span>
                    <span class="metric-value ${sleepQualityClass}">${entry.sleepQuality}/10</span>
                </div>
            </div>

            ${(entry.workNotes || entry.sleepNotes) ? `
            <div class="entry-notes">
                ${entry.workNotes ? `<div><strong>Work Notes:</strong> ${entry.workNotes}</div>` : ''}
                ${entry.sleepNotes ? `<div><strong>Sleep Notes:</strong> ${entry.sleepNotes}</div>` : ''}
            </div>
            ` : ''}

            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;

        entriesList.appendChild(entryDiv);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        entries = entries.filter(entry => entry.id !== id);
        localStorage.setItem('cognitiveLoadSleepEntries', JSON.stringify(entries));
        updateStats();
        updateChart();
        updateEntriesList();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('logDate').value = today;

    updateLoadValue();
    updateQualityValue();
    updateStats();
    updateChart();
    updateEntriesList();
});