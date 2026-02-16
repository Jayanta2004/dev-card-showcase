// REM Cycle Quality Tracker JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initApp();
});

function initApp() {
    // Load navbar
    loadNavbar();

    // Initialize components
    initForm();
    initCharts();
    initHistory();
    initInsights();

    // Load existing data
    loadSleepData();
    updateDashboard();
}

function loadNavbar() {
    fetch('../navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
            // Re-initialize Lucide icons for navbar
            lucide.createIcons();
        });
}

// Form handling
function initForm() {
    const form = document.getElementById('sleepForm');

    // Set default date to today
    document.getElementById('logDate').valueAsDate = new Date();

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const sleepEntry = {
            id: Date.now(),
            date: document.getElementById('logDate').value,
            remQuality: parseInt(document.getElementById('remQuality').value),
            dreamRecall: document.getElementById('dreamRecall').value,
            dreamDetails: document.getElementById('dreamDetails').value.trim(),
            morningEnergy: parseInt(document.getElementById('morningEnergy').value),
            sleepDuration: parseFloat(document.getElementById('sleepDuration').value) || 0,
            sleepQuality: parseInt(document.getElementById('sleepQuality').value),
            notes: document.getElementById('notes').value.trim(),
            timestamp: new Date().toISOString()
        };

        saveSleepEntry(sleepEntry);
        form.reset();
        document.getElementById('logDate').valueAsDate = new Date();

        // Update UI
        loadSleepData();
        updateDashboard();
    });
}

// Data management
function saveSleepEntry(entry) {
    const entries = getSleepEntries();
    entries.push(entry);
    localStorage.setItem('remSleepEntries', JSON.stringify(entries));
}

function getSleepEntries() {
    const entries = localStorage.getItem('remSleepEntries');
    return entries ? JSON.parse(entries) : [];
}

function loadSleepData() {
    const entries = getSleepEntries();
    updateHistory(entries);
    updateInsights(entries);
}

// Dashboard updates
function updateDashboard() {
    const entries = getSleepEntries();

    if (entries.length === 0) return;

    // Calculate metrics
    const avgRemQuality = Math.round(entries.reduce((sum, e) => sum + e.remQuality, 0) / entries.length * 10) / 10;
    const dreamRecallCount = entries.filter(e => e.dreamRecall !== 'none').length;
    const dreamRecallRate = Math.round((dreamRecallCount / entries.length) * 100);

    // Calculate correlation between REM quality and morning energy
    const correlation = calculateCorrelation(
        entries.map(e => e.remQuality),
        entries.map(e => e.morningEnergy)
    );

    document.getElementById('avgRemQuality').textContent = avgRemQuality;
    document.getElementById('dreamRecallRate').textContent = dreamRecallRate + '%';
    document.getElementById('energyCorrelation').textContent = correlation > 0 ? '+' + correlation.toFixed(2) : correlation.toFixed(2);
    document.getElementById('totalEntries').textContent = entries.length;

    // Update chart
    updateChart(entries);
}

function calculateCorrelation(x, y) {
    const n = x.length;
    if (n < 2) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
}

// Charts
function initCharts() {
    const ctx = document.getElementById('qualityChart').getContext('2d');
    window.qualityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'REM Quality',
                data: [],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                yAxisID: 'y'
            }, {
                label: 'Morning Energy',
                data: [],
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                tension: 0.4,
                yAxisID: 'y'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Quality/Energy Level'
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
                    display: true
                }
            }
        }
    });
}

function updateChart(entries) {
    // Sort entries by date
    entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = entries.map(e => new Date(e.date).toLocaleDateString());
    const remData = entries.map(e => e.remQuality);
    const energyData = entries.map(e => e.morningEnergy);

    window.qualityChart.data.labels = labels;
    window.qualityChart.data.datasets[0].data = remData;
    window.qualityChart.data.datasets[1].data = energyData;
    window.qualityChart.update();
}

// History
function initHistory() {
    document.getElementById('viewWeek').addEventListener('click', () => filterHistory('week'));
    document.getElementById('viewMonth').addEventListener('click', () => filterHistory('month'));
    document.getElementById('viewAll').addEventListener('click', () => filterHistory('all'));
}

function filterHistory(period) {
    // Update active button
    document.querySelectorAll('.history-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${period.charAt(0).toUpperCase() + period.slice(1)}`).classList.add('active');

    const entries = getSleepEntries();
    let filteredEntries = entries;

    if (period === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredEntries = entries.filter(e => new Date(e.date) >= weekAgo);
    } else if (period === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filteredEntries = entries.filter(e => new Date(e.date) >= monthAgo);
    }

    updateHistory(filteredEntries);
}

function updateHistory(entries) {
    const historyList = document.getElementById('sleepHistory');

    if (entries.length === 0) {
        historyList.innerHTML = '<p>No sleep entries recorded yet.</p>';
        return;
    }

    // Sort by date descending
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));

    historyList.innerHTML = entries.map(entry => {
        const recallText = entry.dreamRecall.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `
            <div class="history-item">
                <div class="history-item-header">
                    <span class="history-date">${new Date(entry.date).toLocaleDateString()}</span>
                    <span class="history-quality">REM: ${entry.remQuality}/10</span>
                </div>
                <div class="history-details">
                    Dream Recall: ${recallText} | Energy: ${entry.morningEnergy}/10 | Sleep: ${entry.sleepDuration}h
                    ${entry.dreamDetails ? `<br>Dreams: ${entry.dreamDetails.substring(0, 100)}${entry.dreamDetails.length > 100 ? '...' : ''}` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Insights
function initInsights() {
    // Insights are updated when data is loaded
}

function updateInsights(entries) {
    if (entries.length === 0) return;

    // REM Quality Trends
    const recentEntries = entries.slice(-7); // Last 7 entries
    const avgRecent = recentEntries.reduce((sum, e) => sum + e.remQuality, 0) / recentEntries.length;
    const avgOverall = entries.reduce((sum, e) => sum + e.remQuality, 0) / entries.length;
    const trend = avgRecent > avgOverall ? 'improving' : avgRecent < avgOverall ? 'declining' : 'stable';

    document.getElementById('remTrends').innerHTML = `
        <p>Your recent REM quality is <strong>${trend}</strong> (avg: ${avgRecent.toFixed(1)} vs overall: ${avgOverall.toFixed(1)}).</p>
    `;

    // Dream Recall Patterns
    const recallCounts = {};
    entries.forEach(e => {
        recallCounts[e.dreamRecall] = (recallCounts[e.dreamRecall] || 0) + 1;
    });
    const mostCommon = Object.entries(recallCounts).sort((a, b) => b[1] - a[1])[0];
    const recallRate = (entries.filter(e => e.dreamRecall !== 'none').length / entries.length * 100).toFixed(1);

    document.getElementById('dreamPatterns').innerHTML = `
        <p>You most commonly experience <strong>${mostCommon[0].replace('-', ' ')}</strong> dream recall (${recallRate}% recall rate).</p>
    `;

    // Energy Correlations
    const correlation = calculateCorrelation(
        entries.map(e => e.remQuality),
        entries.map(e => e.morningEnergy)
    );
    const correlationStrength = Math.abs(correlation) > 0.7 ? 'strong' : Math.abs(correlation) > 0.3 ? 'moderate' : 'weak';

    document.getElementById('energyCorrelations').innerHTML = `
        <p>There is a <strong>${correlationStrength}</strong> ${correlation > 0 ? 'positive' : 'negative'} correlation (${correlation.toFixed(2)}) between REM quality and morning energy.</p>
    `;

    // Tips
    const tips = [
        'Keep a dream journal by your bed to improve recall',
        'Set an intention before sleep to remember your dreams',
        'Avoid alcohol before bed as it suppresses REM sleep',
        'Maintain consistent sleep and wake times',
        'Create a relaxing pre-sleep routine',
        'Limit screen time 1-2 hours before bed',
        'Try meditation or mindfulness for better sleep quality'
    ];

    document.getElementById('tips').innerHTML = `
        <h4>Sleep Improvement Tips</h4>
        <ul>
            ${tips.map(tip => `<li>${tip}</li>`).join('')}
        </ul>
    `;
}