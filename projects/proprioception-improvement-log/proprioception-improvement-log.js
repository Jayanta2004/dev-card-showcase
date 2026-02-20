// proprioception-improvement-log.js

let drillLogs = JSON.parse(localStorage.getItem('proprioceptionDrills')) || [];

// Initialize range sliders
document.getElementById('difficulty').addEventListener('input', function() {
    document.getElementById('difficultyValue').textContent = this.value;
});

document.getElementById('stability').addEventListener('input', function() {
    document.getElementById('stabilityValue').textContent = this.value;
});

function logDrill() {
    const drillType = document.getElementById('drillType').value;
    const duration = parseInt(document.getElementById('duration').value);
    const difficulty = parseInt(document.getElementById('difficulty').value);
    const stability = parseInt(document.getElementById('stability').value);
    const surface = document.getElementById('surface').value;
    const notes = document.getElementById('notes').value.trim();

    if (!duration || duration <= 0) {
        alert('Please enter a valid duration');
        return;
    }

    const drill = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        drillType: drillType,
        duration: duration,
        difficulty: difficulty,
        stability: stability,
        surface: surface,
        notes: notes
    };

    drillLogs.push(drill);
    saveDrills();

    // Clear form
    document.getElementById('duration').value = '';
    document.getElementById('difficulty').value = 5;
    document.getElementById('difficultyValue').textContent = '5';
    document.getElementById('stability').value = 7;
    document.getElementById('stabilityValue').textContent = '7';
    document.getElementById('notes').value = '';

    updateStats();
    updateCharts();
    updateInsights();
    displayHistory();
}

function saveDrills() {
    localStorage.setItem('proprioceptionDrills', JSON.stringify(drillLogs));
}

function updateStats() {
    if (drillLogs.length === 0) {
        document.getElementById('totalDrills').textContent = '0';
        document.getElementById('avgStability').textContent = '0';
        document.getElementById('improvementRate').textContent = '0%';
        document.getElementById('weeklyDrills').textContent = '0';
        return;
    }

    // Total drills
    document.getElementById('totalDrills').textContent = drillLogs.length;

    // Average stability
    const avgStability = drillLogs.reduce((sum, drill) => sum + drill.stability, 0) / drillLogs.length;
    document.getElementById('avgStability').textContent = avgStability.toFixed(1);

    // Improvement rate (comparing first 10 vs last 10 drills)
    let improvementRate = 0;
    if (drillLogs.length >= 20) {
        const firstTen = drillLogs.slice(0, 10);
        const lastTen = drillLogs.slice(-10);
        const firstAvg = firstTen.reduce((sum, drill) => sum + drill.stability, 0) / 10;
        const lastAvg = lastTen.reduce((sum, drill) => sum + drill.stability, 0) / 10;
        improvementRate = ((lastAvg - firstAvg) / firstAvg) * 100;
    }
    document.getElementById('improvementRate').textContent = `${improvementRate.toFixed(1)}%`;

    // Weekly drills
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyDrills = drillLogs.filter(drill =>
        new Date(drill.timestamp) >= oneWeekAgo
    ).length;
    document.getElementById('weeklyDrills').textContent = weeklyDrills;
}

function updateCharts() {
    updateStabilityChart();
    updateDrillBreakdownChart();
}

function updateStabilityChart() {
    const sortedDrills = drillLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const labels = sortedDrills.map(drill => new Date(drill.timestamp));
    const stabilityData = sortedDrills.map(drill => drill.stability);
    const difficultyData = sortedDrills.map(drill => drill.difficulty);

    const ctx = document.getElementById('stabilityChart').getContext('2d');
    if (window.stabilityChart) {
        window.stabilityChart.destroy();
    }

    window.stabilityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Stability Rating',
                data: stabilityData,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.1,
                pointRadius: 4,
                pointHoverRadius: 6
            }, {
                label: 'Difficulty Level',
                data: difficultyData,
                borderColor: '#FF9800',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                tension: 0.1,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM dd'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 10
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.parsed.y}`
                    }
                }
            }
        }
    });
}

function updateDrillBreakdownChart() {
    const drillTypeCounts = {};
    const drillTypeAvgStability = {};

    drillLogs.forEach(drill => {
        if (!drillTypeCounts[drill.drillType]) {
            drillTypeCounts[drill.drillType] = 0;
            drillTypeAvgStability[drill.drillType] = 0;
        }
        drillTypeCounts[drill.drillType]++;
        drillTypeAvgStability[drill.drillType] += drill.stability;
    });

    // Calculate averages
    Object.keys(drillTypeAvgStability).forEach(type => {
        drillTypeAvgStability[type] = drillTypeAvgStability[type] / drillTypeCounts[type];
    });

    const labels = Object.keys(drillTypeCounts);
    const data = labels.map(type => drillTypeAvgStability[type]);

    const ctx = document.getElementById('drillBreakdownChart').getContext('2d');
    if (window.drillBreakdownChart) {
        window.drillBreakdownChart.destroy();
    }

    window.drillBreakdownChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.map(formatDrillType),
            datasets: [{
                label: 'Average Stability Rating',
                data: data,
                backgroundColor: 'rgba(76, 175, 80, 0.6)',
                borderColor: '#4CAF50',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `Average Stability: ${context.parsed.y.toFixed(1)}`
                    }
                }
            }
        }
    });
}

function formatDrillType(type) {
    const formats = {
        'single-leg-stand': 'Single Leg Stand',
        'tandem-stand': 'Tandem Stand',
        'eyes-closed-balance': 'Eyes Closed Balance',
        'dynamic-balance': 'Dynamic Balance',
        'perturbation-training': 'Perturbation Training',
        'balance-board': 'Balance Board',
        'foam-pad': 'Foam Pad Exercises',
        'other': 'Other'
    };
    return formats[type] || type;
}

function updateInsights() {
    // Best performing drill
    const drillTypeAvgStability = {};
    const drillTypeCounts = {};

    drillLogs.forEach(drill => {
        if (!drillTypeAvgStability[drill.drillType]) {
            drillTypeAvgStability[drill.drillType] = 0;
            drillTypeCounts[drill.drillType] = 0;
        }
        drillTypeAvgStability[drill.drillType] += drill.stability;
        drillTypeCounts[drill.drillType]++;
    });

    let bestDrill = 'No data available';
    let bestAvg = 0;
    Object.keys(drillTypeAvgStability).forEach(type => {
        const avg = drillTypeAvgStability[type] / drillTypeCounts[type];
        if (avg > bestAvg) {
            bestAvg = avg;
            bestDrill = `${formatDrillType(type)} (${avg.toFixed(1)} avg stability)`;
        }
    });
    document.getElementById('bestDrill').textContent = bestDrill;

    // Weekly progress
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const thisWeekDrills = drillLogs.filter(drill => new Date(drill.timestamp) >= oneWeekAgo);
    const lastWeekDrills = drillLogs.filter(drill => {
        const date = new Date(drill.timestamp);
        return date >= twoWeeksAgo && date < oneWeekAgo;
    });

    let weeklyProgress = 'No data available';
    if (thisWeekDrills.length > 0 && lastWeekDrills.length > 0) {
        const thisWeekAvg = thisWeekDrills.reduce((sum, drill) => sum + drill.stability, 0) / thisWeekDrills.length;
        const lastWeekAvg = lastWeekDrills.reduce((sum, drill) => sum + drill.stability, 0) / lastWeekDrills.length;
        const progress = ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100;
        weeklyProgress = `${thisWeekDrills.length} drills, ${progress >= 0 ? '+' : ''}${progress.toFixed(1)}% stability change`;
    } else if (thisWeekDrills.length > 0) {
        weeklyProgress = `${thisWeekDrills.length} drills completed this week`;
    }
    document.getElementById('weeklyProgress').textContent = weeklyProgress;

    // Difficulty vs Stability correlation
    let difficultyInsight = 'No data available';
    if (drillLogs.length > 5) {
        const correlation = calculateCorrelation(
            drillLogs.map(d => d.difficulty),
            drillLogs.map(d => d.stability)
        );
        if (correlation > 0.3) {
            difficultyInsight = 'Higher difficulty correlates with better stability - good challenge!';
        } else if (correlation < -0.3) {
            difficultyInsight = 'Higher difficulty reduces stability - consider easier drills';
        } else {
            difficultyInsight = 'No strong correlation between difficulty and stability';
        }
    }
    document.getElementById('difficultyInsight').textContent = difficultyInsight;
}

function calculateCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
}

function displayHistory(filter = 'all') {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

    let filteredDrills = drillLogs;

    if (filter === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filteredDrills = drillLogs.filter(drill => new Date(drill.timestamp) >= oneWeekAgo);
    } else if (filter === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        filteredDrills = drillLogs.filter(drill => new Date(drill.timestamp) >= oneMonthAgo);
    }

    // Sort by most recent first
    filteredDrills.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const historyDiv = document.getElementById('drillHistory');
    historyDiv.innerHTML = '';

    if (filteredDrills.length === 0) {
        historyDiv.innerHTML = '<p style="text-align: center; color: #666;">No drills found</p>';
        return;
    }

    filteredDrills.forEach(drill => {
        const entry = document.createElement('div');
        entry.className = 'drill-entry';

        const date = new Date(drill.timestamp).toLocaleDateString();
        const time = new Date(drill.timestamp).toLocaleTimeString();
        const stabilityClass = drill.stability >= 8 ? 'excellent' :
                              drill.stability >= 6 ? 'good' :
                              drill.stability >= 4 ? 'fair' : 'poor';

        entry.innerHTML = `
            <h4>
                ${formatDrillType(drill.drillType)} - ${date} ${time}
                <span class="stability-badge ${stabilityClass}">Stability: ${drill.stability}/10</span>
                <button class="delete-btn" onclick="deleteDrill(${drill.id})">×</button>
            </h4>
            <div class="drill-details">
                <div class="detail-item">Duration: ${drill.duration}s</div>
                <div class="detail-item">Difficulty: ${drill.difficulty}/10</div>
                <div class="detail-item">Surface: ${drill.surface.replace('-', ' ')}</div>
            </div>
            ${drill.notes ? `<p><strong>Notes:</strong> ${drill.notes}</p>` : ''}
        `;

        historyDiv.appendChild(entry);
    });
}

function filterHistory(filter) {
    displayHistory(filter);
}

function deleteDrill(id) {
    if (confirm('Are you sure you want to delete this drill log?')) {
        drillLogs = drillLogs.filter(drill => drill.id !== id);
        saveDrills();
        updateStats();
        updateCharts();
        updateInsights();
        displayHistory();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    updateCharts();
    updateInsights();
    displayHistory();
});