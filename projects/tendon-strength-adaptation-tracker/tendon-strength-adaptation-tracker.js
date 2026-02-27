// tendon-strength-adaptation-tracker.js

let tendonEntries = JSON.parse(localStorage.getItem('tendonAdaptationEntries')) || [];

function logSession() {
    const date = document.getElementById('sessionDate').value;
    const exerciseType = document.getElementById('exerciseType').value;
    const tendonArea = document.getElementById('tendonArea').value;
    const loadWeight = parseFloat(document.getElementById('loadWeight').value);
    const setsReps = document.getElementById('setsReps').value.trim();
    const sessionDuration = parseInt(document.getElementById('sessionDuration').value);
    const restBetweenSets = parseInt(document.getElementById('restBetweenSets').value);
    const sorenessLevel = parseInt(document.getElementById('sorenessLevel').value);
    const recoveryQuality = parseInt(document.getElementById('recoveryQuality').value);
    const notes = document.getElementById('sessionNotes').value.trim();

    if (!date || !exerciseType || !tendonArea || !loadWeight || !setsReps || !sessionDuration || !restBetweenSets) {
        alert('Please fill in all required fields.');
        return;
    }

    // Parse sets and reps (e.g., "3×8" or "4×5,3×8")
    const totalVolume = calculateTotalVolume(setsReps, loadWeight);

    // Check if entry already exists for this date and tendon area
    const existingEntry = tendonEntries.find(entry =>
        entry.date === date && entry.tendonArea === tendonArea
    );
    if (existingEntry) {
        if (!confirm('An entry already exists for this date and tendon area. Do you want to update it?')) {
            return;
        }
        // Remove existing entry
        tendonEntries = tendonEntries.filter(entry =>
            !(entry.date === date && entry.tendonArea === tendonArea)
        );
    }

    // Calculate load capacity (weight × total reps)
    const loadCapacity = loadWeight * totalVolume.reps;

    // Calculate training stress score (combination of load, volume, and intensity)
    const trainingStress = calculateTrainingStress(loadWeight, totalVolume, sessionDuration, restBetweenSets);

    const entry = {
        id: Date.now(),
        date,
        exerciseType,
        tendonArea,
        loadWeight,
        setsReps,
        totalSets: totalVolume.sets,
        totalReps: totalVolume.reps,
        loadCapacity,
        sessionDuration,
        restBetweenSets,
        trainingStress,
        sorenessLevel,
        recoveryQuality,
        notes
    };

    tendonEntries.push(entry);

    // Sort by date
    tendonEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Keep only last 50 entries
    if (tendonEntries.length > 50) {
        tendonEntries = tendonEntries.slice(-50);
    }

    localStorage.setItem('tendonAdaptationEntries', JSON.stringify(tendonEntries));

    // Clear form
    document.getElementById('sessionDate').value = '';
    document.getElementById('exerciseType').value = '';
    document.getElementById('tendonArea').value = '';
    document.getElementById('loadWeight').value = '';
    document.getElementById('setsReps').value = '';
    document.getElementById('sessionDuration').value = '';
    document.getElementById('restBetweenSets').value = '';
    document.getElementById('sorenessLevel').value = 3;
    document.getElementById('sorenessValue').textContent = '3';
    document.getElementById('recoveryQuality').value = 7;
    document.getElementById('recoveryValue').textContent = '7';
    document.getElementById('sessionNotes').value = '';

    updateStats();
    updateChart();
    updateInsights();
    updateSessionList();
}

function calculateTotalVolume(setsRepsString, weight) {
    // Parse sets×reps format (e.g., "3×8", "4×5,3×8")
    const sets = setsRepsString.split(',');
    let totalSets = 0;
    let totalReps = 0;

    sets.forEach(set => {
        const match = set.trim().match(/(\d+)×(\d+)/);
        if (match) {
            const setCount = parseInt(match[1]);
            const repCount = parseInt(match[2]);
            totalSets += setCount;
            totalReps += (setCount * repCount);
        }
    });

    return { sets: totalSets, reps: totalReps };
}

function calculateTrainingStress(weight, volume, duration, restTime) {
    // Training stress combines load, volume, and density (rest time)
    const loadFactor = weight * volume.reps;
    const volumeFactor = volume.sets * volume.reps;
    const densityFactor = duration / (restTime + 30); // Shorter rest = higher density

    return (loadFactor * volumeFactor * densityFactor) / 10000; // Normalized score
}

function getLoadProgress(currentLoad, previousLoad) {
    if (!previousLoad || previousLoad === 0) return 'stable';

    const changePercent = ((currentLoad - previousLoad) / previousLoad) * 100;

    if (changePercent > 5) return 'increasing';
    if (changePercent < -5) return 'decreasing';
    return 'stable';
}

function getRiskLevel(entries) {
    if (entries.length < 3) return { level: 'Unknown', class: '' };

    const recentEntries = entries.slice(-5); // Last 5 sessions
    const avgSoreness = recentEntries.reduce((sum, entry) => sum + entry.sorenessLevel, 0) / recentEntries.length;
    const avgRecovery = recentEntries.reduce((sum, entry) => sum + entry.recoveryQuality, 0) / recentEntries.length;

    // Check for rapid load increases
    let rapidIncreaseCount = 0;
    for (let i = 1; i < recentEntries.length; i++) {
        const currentLoad = recentEntries[i].loadCapacity;
        const previousLoad = recentEntries[i-1].loadCapacity;
        if (currentLoad > previousLoad * 1.1) { // >10% increase
            rapidIncreaseCount++;
        }
    }

    if (avgSoreness >= 7 && avgRecovery <= 4) return { level: 'Critical', class: 'risk-critical' };
    if (rapidIncreaseCount >= 2 || avgSoreness >= 6) return { level: 'High', class: 'risk-high' };
    if (avgRecovery <= 5 || rapidIncreaseCount >= 1) return { level: 'Moderate', class: 'risk-moderate' };
    return { level: 'Low', class: 'risk-low' };
}

function updateStats() {
    const totalSessions = tendonEntries.length;

    if (totalSessions === 0) {
        document.getElementById('currentLoadCapacity').textContent = '0 kg';
        document.getElementById('adaptationProgress').textContent = '0%';
        document.getElementById('riskLevel').textContent = 'Unknown';
        document.getElementById('riskLevel').className = 'stat-value';
        document.getElementById('totalSessions').textContent = '0';
        return;
    }

    // Current load capacity (latest entry)
    const latestEntry = tendonEntries[tendonEntries.length - 1];
    const currentLoadCapacity = latestEntry.loadCapacity;

    // Adaptation progress (percentage increase from first to last entry)
    const firstEntry = tendonEntries[0];
    const adaptationProgress = firstEntry.loadCapacity > 0 ?
        ((currentLoadCapacity - firstEntry.loadCapacity) / firstEntry.loadCapacity * 100) : 0;

    // Risk level
    const risk = getRiskLevel(tendonEntries);
    const riskElement = document.getElementById('riskLevel');
    riskElement.textContent = risk.level;
    riskElement.className = `stat-value ${risk.class}`;

    document.getElementById('currentLoadCapacity').textContent = `${currentLoadCapacity.toFixed(0)} kg`;
    document.getElementById('adaptationProgress').textContent = `${adaptationProgress.toFixed(1)}%`;
    document.getElementById('totalSessions').textContent = totalSessions;
}

function updateChart() {
    const ctx = document.getElementById('tendonChart').getContext('2d');

    // Prepare data for last 20 entries
    const chartEntries = tendonEntries.slice(-20);

    const labels = chartEntries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString();
    });

    const loadCapacity = chartEntries.map(entry => entry.loadCapacity);
    const sorenessLevels = chartEntries.map(entry => entry.sorenessLevel);
    const recoveryQuality = chartEntries.map(entry => entry.recoveryQuality);
    const trainingStress = chartEntries.map(entry => entry.trainingStress);

    // Reference lines
    const moderateSoreness = new Array(sorenessLevels.length).fill(6);
    const goodRecovery = new Array(recoveryQuality.length).fill(7);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Load Capacity (kg)',
                data: loadCapacity,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Soreness Level',
                data: sorenessLevels,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Recovery Quality',
                data: recoveryQuality,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Training Stress',
                data: trainingStress,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                yAxisID: 'y2',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Moderate Soreness (6+)',
                data: moderateSoreness,
                borderColor: '#fd7e14',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y1'
            }, {
                label: 'Good Recovery (7+)',
                data: goodRecovery,
                borderColor: '#28a745',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y1'
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
                        text: 'Load Capacity (kg)'
                    },
                    min: 0
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Soreness/Recovery (1-10)'
                    },
                    min: 1,
                    max: 10,
                    grid: {
                        drawOnChartArea: false,
                    }
                },
                y2: {
                    type: 'linear',
                    display: false, // Hidden by default
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Training Stress'
                    },
                    min: 0,
                    grid: {
                        drawOnChartArea: false,
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

function updateInsights() {
    const insightsDiv = document.getElementById('insights');

    if (tendonEntries.length < 5) {
        insightsDiv.innerHTML = '<p>Log at least 5 training sessions to receive personalized insights about your tendon adaptation patterns and injury prevention strategies.</p>';
        return;
    }

    // Analyze patterns
    const recentEntries = tendonEntries.slice(-10);
    const avgLoadCapacity = recentEntries.reduce((sum, entry) => sum + entry.loadCapacity, 0) / recentEntries.length;
    const avgSoreness = recentEntries.reduce((sum, entry) => sum + entry.sorenessLevel, 0) / recentEntries.length;
    const avgRecovery = recentEntries.reduce((sum, entry) => sum + entry.recoveryQuality, 0) / recentEntries.length;

    // Check load progression pattern
    let loadIncreasingCount = 0;
    let loadStableCount = 0;
    for (let i = 1; i < recentEntries.length; i++) {
        const progress = getLoadProgress(recentEntries[i].loadCapacity, recentEntries[i-1].loadCapacity);
        if (progress === 'increasing') loadIncreasingCount++;
        else if (progress === 'stable') loadStableCount++;
    }

    // Analyze by tendon area
    const areaStats = {};
    tendonEntries.forEach(entry => {
        if (!areaStats[entry.tendonArea]) {
            areaStats[entry.tendonArea] = { sessions: 0, totalLoad: 0, avgSoreness: 0 };
        }
        areaStats[entry.tendonArea].sessions++;
        areaStats[entry.tendonArea].totalLoad += entry.loadCapacity;
        areaStats[entry.tendonArea].avgSoreness += entry.sorenessLevel;
    });

    Object.keys(areaStats).forEach(area => {
        areaStats[area].avgLoad = areaStats[area].totalLoad / areaStats[area].sessions;
        areaStats[area].avgSoreness = areaStats[area].avgSoreness / areaStats[area].sessions;
    });

    let insights = '<p>Based on your tendon training patterns:</p><ul>';

    if (avgSoreness > 6) {
        insights += '<li><strong>High soreness levels detected.</strong> Consider reducing training volume or increasing recovery time between sessions to prevent overuse injuries.</li>';
    } else if (avgSoreness < 4) {
        insights += '<li><strong>Low soreness levels.</strong> Your tendons are adapting well. You may be able to increase training intensity gradually.</li>';
    }

    if (avgRecovery < 6) {
        insights += '<li><strong>Recovery quality needs attention.</strong> Focus on nutrition, sleep, and active recovery strategies to improve tendon repair and adaptation.</li>';
    }

    if (loadIncreasingCount > loadStableCount * 2) {
        insights += '<li><strong>Rapid load progression.</strong> Your training loads are increasing quickly. Ensure adequate recovery weeks and monitor for signs of tendon stress.</li>';
    } else if (loadStableCount > loadIncreasingCount * 2) {
        insights += '<li><strong>Stable loading pattern.</strong> Consider gradually increasing intensity to promote continued adaptation, but avoid sudden jumps.</li>';
    }

    // Most worked tendon area
    const mostWorkedArea = Object.keys(areaStats).reduce((a, b) =>
        areaStats[a].sessions > areaStats[b].sessions ? a : b
    );

    if (mostWorkedArea) {
        const areaName = mostWorkedArea.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        insights += `<li><strong>Primary focus area:</strong> ${areaName} tendons. Monitor this area closely for adaptation and potential overuse.</li>`;
    }

    insights += '<li><strong>Training recommendations:</strong> Use progressive overload (5-10% increases), include mobility work, ensure 48+ hours recovery between sessions targeting the same tendons, and consider eccentric loading for tendon strengthening.</li>';
    insights += '</ul>';

    insightsDiv.innerHTML = insights;
}

function updateSessionList() {
    const sessionList = document.getElementById('sessionList');
    sessionList.innerHTML = '';

    // Show last 10 entries
    const recentEntries = tendonEntries.slice(-10).reverse();

    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'session-entry';

        const loadProgress = getLoadProgress(
            entry.loadCapacity,
            tendonEntries[tendonEntries.findIndex(e => e.id === entry.id) - 1]?.loadCapacity
        );

        entryDiv.innerHTML = `
            <div class="session-header">
                <div class="session-date">${new Date(entry.date).toLocaleDateString()}</div>
                <div class="load-progress load-${loadProgress}">${loadProgress.charAt(0).toUpperCase() + loadProgress.slice(1)}</div>
            </div>
            <div class="session-details">
                <div class="detail-item">
                    <div class="detail-label">Exercise</div>
                    <div class="detail-value">${entry.exerciseType.replace('-', ' ')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Tendon Area</div>
                    <div class="detail-value">${entry.tendonArea.replace('-', ' ')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Load</div>
                    <div class="detail-value">${entry.loadWeight}kg</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Volume</div>
                    <div class="detail-value">${entry.setsReps}</div>
                </div>
            </div>
            <div class="session-metrics">
                <div class="metric-item">
                    <div class="metric-label">Load Capacity</div>
                    <div class="metric-value">${entry.loadCapacity.toFixed(0)}kg</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Soreness</div>
                    <div class="metric-value">${entry.sorenessLevel}/10</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Recovery</div>
                    <div class="metric-value">${entry.recoveryQuality}/10</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Duration</div>
                    <div class="metric-value">${entry.sessionDuration}min</div>
                </div>
            </div>
            ${entry.notes ? `<div class="session-notes">${entry.notes}</div>` : ''}
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;

        sessionList.appendChild(entryDiv);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this training session?')) {
        tendonEntries = tendonEntries.filter(entry => entry.id !== id);
        localStorage.setItem('tendonAdaptationEntries', JSON.stringify(tendonEntries));
        updateStats();
        updateChart();
        updateInsights();
        updateSessionList();
    }
}

// Update range value displays
document.getElementById('sorenessLevel').addEventListener('input', function() {
    document.getElementById('sorenessValue').textContent = this.value;
});

document.getElementById('recoveryQuality').addEventListener('input', function() {
    document.getElementById('recoveryValue').textContent = this.value;
});

// Form submission
document.getElementById('tendonForm').addEventListener('submit', function(e) {
    e.preventDefault();
    logSession();
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sessionDate').value = today;

    updateStats();
    updateChart();
    updateInsights();
    updateSessionList();
});