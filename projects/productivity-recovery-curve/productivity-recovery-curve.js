// productivity-recovery-curve.js

let productivityEntries = JSON.parse(localStorage.getItem('productivityRecoveryEntries')) || [];

function logSession() {
    const date = document.getElementById('sessionDate').value;
    const workDuration = parseFloat(document.getElementById('workDuration').value);
    const breakDuration = parseInt(document.getElementById('breakDuration').value);
    const preBreakProductivity = parseInt(document.getElementById('preBreakProductivity').value);
    const postBreakProductivity = parseInt(document.getElementById('postBreakProductivity').value);
    const fatigueLevel = parseInt(document.getElementById('fatigueLevel').value);
    const notes = document.getElementById('sessionNotes').value.trim();

    if (!date || !workDuration || !breakDuration || !preBreakProductivity || !postBreakProductivity) {
        alert('Please fill in all required fields.');
        return;
    }

    // Check if entry already exists for this date
    const existingEntry = productivityEntries.find(entry => entry.date === date);
    if (existingEntry) {
        if (!confirm('An entry already exists for this date. Do you want to update it?')) {
            return;
        }
        // Remove existing entry
        productivityEntries = productivityEntries.filter(entry => entry.date !== date);
    }

    // Calculate recovery rate (percentage of pre-break productivity regained)
    const recoveryRate = (postBreakProductivity / preBreakProductivity) * 100;

    // Calculate recovery efficiency (recovery rate adjusted for break duration)
    const recoveryEfficiency = recoveryRate / Math.sqrt(breakDuration);

    const entry = {
        id: Date.now(),
        date,
        workDuration,
        breakDuration,
        preBreakProductivity,
        postBreakProductivity,
        recoveryRate: parseFloat(recoveryRate.toFixed(1)),
        recoveryEfficiency: parseFloat(recoveryEfficiency.toFixed(2)),
        fatigueLevel,
        notes
    };

    productivityEntries.push(entry);

    // Sort by date
    productivityEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Keep only last 50 entries
    if (productivityEntries.length > 50) {
        productivityEntries = productivityEntries.slice(-50);
    }

    localStorage.setItem('productivityRecoveryEntries', JSON.stringify(productivityEntries));

    // Clear form
    document.getElementById('sessionDate').value = '';
    document.getElementById('workDuration').value = '';
    document.getElementById('breakDuration').value = '';
    document.getElementById('preBreakProductivity').value = '';
    document.getElementById('postBreakProductivity').value = '';
    document.getElementById('fatigueLevel').value = 5;
    document.getElementById('fatigueValue').textContent = '5';
    document.getElementById('sessionNotes').value = '';

    updateStats();
    updateChart();
    updateInsights();
    updateSessionList();
}

function getRecoveryStatus(recoveryRate) {
    if (recoveryRate >= 100) return { status: 'Excellent', class: 'recovery-excellent' };
    if (recoveryRate >= 80) return { status: 'Good', class: 'recovery-good' };
    if (recoveryRate >= 60) return { status: 'Fair', class: 'recovery-fair' };
    return { status: 'Poor', class: 'recovery-poor' };
}

function updateStats() {
    const totalSessions = productivityEntries.length;

    if (totalSessions === 0) {
        document.getElementById('currentRecoveryRate').textContent = '0%';
        document.getElementById('avgProductivity').textContent = '0.0';
        document.getElementById('optimalBreak').textContent = '0 min';
        document.getElementById('totalSessions').textContent = '0';
        return;
    }

    // Current recovery rate (latest entry)
    const latestEntry = productivityEntries[productivityEntries.length - 1];
    const currentRecoveryRate = latestEntry.recoveryRate;

    // Average productivity
    const allProductivities = productivityEntries.flatMap(entry => [
        entry.preBreakProductivity,
        entry.postBreakProductivity
    ]);
    const avgProductivity = allProductivities.reduce((sum, prod) => sum + prod, 0) / allProductivities.length;

    // Find optimal break duration (break duration that correlates with highest average recovery rate)
    const breakGroups = {};
    productivityEntries.forEach(entry => {
        const breakRange = Math.floor(entry.breakDuration / 15) * 15; // Group by 15-minute intervals
        if (!breakGroups[breakRange]) {
            breakGroups[breakRange] = [];
        }
        breakGroups[breakRange].push(entry.recoveryRate);
    });

    let optimalBreak = 0;
    let maxAvgRecovery = 0;
    Object.keys(breakGroups).forEach(breakRange => {
        const avgRecovery = breakGroups[breakRange].reduce((sum, rate) => sum + rate, 0) / breakGroups[breakRange].length;
        if (avgRecovery > maxAvgRecovery) {
            maxAvgRecovery = avgRecovery;
            optimalBreak = parseInt(breakRange);
        }
    });

    document.getElementById('currentRecoveryRate').textContent = `${currentRecoveryRate}%`;
    document.getElementById('avgProductivity').textContent = avgProductivity.toFixed(1);
    document.getElementById('optimalBreak').textContent = `${optimalBreak} min`;
    document.getElementById('totalSessions').textContent = totalSessions;
}

function updateChart() {
    const ctx = document.getElementById('recoveryChart').getContext('2d');

    // Prepare data for last 20 entries
    const chartEntries = productivityEntries.slice(-20);

    const labels = chartEntries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString();
    });

    const recoveryRates = chartEntries.map(entry => entry.recoveryRate);
    const preProductivity = chartEntries.map(entry => entry.preBreakProductivity);
    const postProductivity = chartEntries.map(entry => entry.postBreakProductivity);
    const breakDurations = chartEntries.map(entry => entry.breakDuration);

    // Reference lines
    const excellentLine = new Array(recoveryRates.length).fill(100);
    const goodLine = new Array(recoveryRates.length).fill(80);
    const fairLine = new Array(recoveryRates.length).fill(60);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Recovery Rate (%)',
                data: recoveryRates,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Pre-Break Productivity',
                data: preProductivity,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Post-Break Productivity',
                data: postProductivity,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Break Duration (min)',
                data: breakDurations,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                yAxisID: 'y2',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Excellent (≥100%)',
                data: excellentLine,
                borderColor: '#28a745',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Good (≥80%)',
                data: goodLine,
                borderColor: '#17a2b8',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Fair (≥60%)',
                data: fairLine,
                borderColor: '#ffc107',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
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
                        text: 'Recovery Rate (%)'
                    },
                    min: 0,
                    max: 150
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Productivity Level (1-10)'
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
                        text: 'Break Duration (min)'
                    },
                    min: 0,
                    max: 120,
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

    if (productivityEntries.length < 5) {
        insightsDiv.innerHTML = '<p>Log at least 5 productivity sessions to receive personalized insights about your recovery patterns and optimal work-rest cycles.</p>';
        return;
    }

    // Analyze patterns
    const avgRecoveryRate = productivityEntries.reduce((sum, entry) => sum + entry.recoveryRate, 0) / productivityEntries.length;
    const avgBreakDuration = productivityEntries.reduce((sum, entry) => sum + entry.breakDuration, 0) / productivityEntries.length;
    const avgFatigue = productivityEntries.reduce((sum, entry) => sum + entry.fatigueLevel, 0) / productivityEntries.length;

    // Find most effective break durations
    const breakEffectiveness = {};
    productivityEntries.forEach(entry => {
        const breakRange = Math.floor(entry.breakDuration / 10) * 10;
        if (!breakEffectiveness[breakRange]) {
            breakEffectiveness[breakRange] = { total: 0, count: 0 };
        }
        breakEffectiveness[breakRange].total += entry.recoveryRate;
        breakEffectiveness[breakRange].count++;
    });

    let bestBreakDuration = 0;
    let bestAvgRecovery = 0;
    Object.keys(breakEffectiveness).forEach(duration => {
        const avgRecovery = breakEffectiveness[duration].total / breakEffectiveness[duration].count;
        if (avgRecovery > bestAvgRecovery) {
            bestAvgRecovery = avgRecovery;
            bestBreakDuration = parseInt(duration);
        }
    });

    // Analyze fatigue impact
    const highFatigueEntries = productivityEntries.filter(entry => entry.fatigueLevel >= 7);
    const lowFatigueEntries = productivityEntries.filter(entry => entry.fatigueLevel <= 4);
    const highFatigueAvgRecovery = highFatigueEntries.length > 0 ?
        highFatigueEntries.reduce((sum, entry) => sum + entry.recoveryRate, 0) / highFatigueEntries.length : 0;
    const lowFatigueAvgRecovery = lowFatigueEntries.length > 0 ?
        lowFatigueEntries.reduce((sum, entry) => sum + entry.recoveryRate, 0) / lowFatigueEntries.length : 0;

    let insights = '<p>Based on your productivity recovery patterns:</p><ul>';

    if (avgRecoveryRate >= 90) {
        insights += '<li><strong>Excellent recovery ability!</strong> Your breaks are highly effective at restoring productivity. Continue with your current break strategies.</li>';
    } else if (avgRecoveryRate >= 70) {
        insights += '<li><strong>Good recovery patterns.</strong> Your breaks are generally effective, but there may be room for optimization based on break duration and activities.</li>';
    } else {
        insights += '<li><strong>Recovery optimization needed.</strong> Your current break strategies may not be fully effective. Consider experimenting with different break durations or activities.</li>';
    }

    if (bestBreakDuration > 0) {
        insights += `<li><strong>Optimal break duration:</strong> ${bestBreakDuration}-${bestBreakDuration + 9} minute breaks show the highest recovery rates (${bestAvgRecovery.toFixed(1)}% average).</li>`;
    }

    if (highFatigueAvgRecovery < lowFatigueAvgRecovery - 10) {
        insights += '<li><strong>Fatigue impact detected.</strong> High fatigue levels significantly reduce your recovery effectiveness. Consider taking proactive breaks before reaching high fatigue levels.</li>';
    }

    if (avgBreakDuration < 15) {
        insights += '<li><strong>Break duration consideration.</strong> Your average breaks are quite short. Longer breaks (15-30 minutes) may provide better recovery for sustained productivity.</li>';
    }

    insights += '<li><strong>Optimization tips:</strong> Try walking breaks, deep breathing exercises, or short meditation sessions. Track which activities give you the best recovery rates.</li>';
    insights += '</ul>';

    insightsDiv.innerHTML = insights;
}

function updateSessionList() {
    const sessionList = document.getElementById('sessionList');
    sessionList.innerHTML = '';

    // Show last 10 entries
    const recentEntries = productivityEntries.slice(-10).reverse();

    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'session-entry';

        const recoveryStatus = getRecoveryStatus(entry.recoveryRate);

        entryDiv.innerHTML = `
            <div class="session-header">
                <div class="session-date">${new Date(entry.date).toLocaleDateString()}</div>
                <div class="recovery-rate ${recoveryStatus.class}">${recoveryStatus.status} (${entry.recoveryRate}%)</div>
            </div>
            <div class="session-details">
                <div class="detail-item">
                    <div class="detail-label">Work Duration</div>
                    <div class="detail-value">${entry.workDuration}h</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Break Duration</div>
                    <div class="detail-value">${entry.breakDuration}min</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Pre-Break</div>
                    <div class="detail-value">${entry.preBreakProductivity}/10</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Post-Break</div>
                    <div class="detail-value">${entry.postBreakProductivity}/10</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Fatigue</div>
                    <div class="detail-value">${entry.fatigueLevel}/10</div>
                </div>
            </div>
            ${entry.notes ? `<div class="session-notes">${entry.notes}</div>` : ''}
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;

        sessionList.appendChild(entryDiv);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this productivity session?')) {
        productivityEntries = productivityEntries.filter(entry => entry.id !== id);
        localStorage.setItem('productivityRecoveryEntries', JSON.stringify(productivityEntries));
        updateStats();
        updateChart();
        updateInsights();
        updateSessionList();
    }
}

// Update fatigue value display
document.getElementById('fatigueLevel').addEventListener('input', function() {
    document.getElementById('fatigueValue').textContent = this.value;
});

// Form submission
document.getElementById('productivityForm').addEventListener('submit', function(e) {
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