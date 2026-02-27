// stimulus-recovery-window-tracker.js

let stimuli = JSON.parse(localStorage.getItem('stimulusRecoveryData')) || [];
let recoveryChart = null;

function logStimulus() {
    const date = document.getElementById('stimulusDate').value;
    const stimulusType = document.getElementById('stimulusType').value;
    const intensity = parseInt(document.getElementById('stimulusIntensity').value);
    const duration = parseInt(document.getElementById('stimulusDuration').value);
    const expectedRecovery = document.getElementById('expectedRecovery').value;
    const description = document.getElementById('stimulusDescription').value.trim();
    const recoveryNotes = document.getElementById('recoveryNotes').value.trim();

    // Get baseline metrics
    const baselineMetrics = {
        energy: parseInt(document.getElementById('baselineEnergy').value),
        mood: parseInt(document.getElementById('baselineMood').value),
        focus: parseInt(document.getElementById('baselineFocus').value),
        stress: parseInt(document.getElementById('baselineStress').value)
    };

    if (!date || !stimulusType || !intensity || !duration || !expectedRecovery || !description || !recoveryNotes) {
        alert('Please fill in all required fields.');
        return;
    }

    const stimulus = {
        id: Date.now(),
        date,
        stimulusType,
        intensity,
        duration,
        expectedRecovery,
        description,
        recoveryNotes,
        baselineMetrics,
        status: 'active',
        recoveryStart: new Date().toISOString(),
        recoveryCheckpoints: [],
        createdAt: new Date().toISOString()
    };

    stimuli.push(stimulus);

    // Sort by date
    stimuli.sort((a, b) => new Date(b.date) - new Date(a.date));

    localStorage.setItem('stimulusRecoveryData', JSON.stringify(stimuli));

    // Clear form
    document.getElementById('stimulusDate').value = '';
    document.getElementById('stimulusType').value = '';
    document.getElementById('stimulusIntensity').value = '';
    document.getElementById('stimulusDuration').value = '';
    document.getElementById('expectedRecovery').value = '';
    document.getElementById('stimulusDescription').value = '';
    document.getElementById('recoveryNotes').value = '';
    Object.keys(baselineMetrics).forEach(key => {
        document.getElementById(`baseline${key.charAt(0).toUpperCase() + key.slice(1)}`).value = '';
    });

    updateDisplay();
    showAlert();
}

function updateRecoveryMetrics(stimulusId, metrics) {
    const stimulus = stimuli.find(s => s.id === stimulusId);
    if (!stimulus) return;

    const checkpoint = {
        timestamp: new Date().toISOString(),
        metrics,
        timeElapsed: Math.floor((new Date() - new Date(stimulus.recoveryStart)) / (1000 * 60)) // minutes
    };

    stimulus.recoveryCheckpoints.push(checkpoint);

    // Check if recovery is complete
    const avgRecovery = (metrics.energy + metrics.mood + metrics.focus + (11 - metrics.stress)) / 4;
    if (avgRecovery >= 8) {
        stimulus.status = 'completed';
        stimulus.actualRecoveryTime = checkpoint.timeElapsed;
    }

    localStorage.setItem('stimulusRecoveryData', JSON.stringify(stimuli));
    updateDisplay();
}

function completeRecovery(stimulusId) {
    const stimulus = stimuli.find(s => s.id === stimulusId);
    if (!stimulus) return;

    stimulus.status = 'completed';
    stimulus.actualRecoveryTime = Math.floor((new Date() - new Date(stimulus.recoveryStart)) / (1000 * 60));

    localStorage.setItem('stimulusRecoveryData', JSON.stringify(stimuli));
    updateDisplay();
}

function updateDisplay() {
    updateActiveRecoveryList();
    updateStats();
    updateChart();
    updateInsights();
    updateStimuliList();
}

function updateActiveRecoveryList() {
    const listDiv = document.getElementById('activeRecoveryList');
    const activeStimuli = stimuli.filter(s => s.status === 'active');

    listDiv.innerHTML = '';

    if (activeStimuli.length === 0) {
        listDiv.innerHTML = '<p>No active recovery windows. Log a stimulus to start tracking recovery.</p>';
        return;
    }

    activeStimuli.forEach(stimulus => {
        const timeElapsed = Math.floor((new Date() - new Date(stimulus.recoveryStart)) / (1000 * 60));
        const expectedMinutes = getExpectedMinutes(stimulus.expectedRecovery);
        const progressPercent = Math.min((timeElapsed / expectedMinutes) * 100, 100);

        const itemDiv = document.createElement('div');
        itemDiv.className = 'active-recovery-item';

        itemDiv.innerHTML = `
            <div class="active-recovery-header">
                <div>
                    <h3 class="active-recovery-title">${stimulus.description}</h3>
                    <div class="active-recovery-time">Started ${formatTimeAgo(stimulus.recoveryStart)}</div>
                </div>
            </div>
            <div class="recovery-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div class="progress-text">${timeElapsed}min / ${expectedMinutes}min expected</div>
            </div>
            <div class="recovery-metrics">
                <div class="recovery-metric">
                    <div class="metric-label">Intensity</div>
                    <div class="metric-value">${stimulus.intensity}/10</div>
                </div>
                <div class="recovery-metric">
                    <div class="metric-label">Type</div>
                    <div class="metric-value">${stimulus.stimulusType.replace('-', ' ')}</div>
                </div>
                <div class="recovery-metric">
                    <div class="metric-label">Checkpoints</div>
                    <div class="metric-value">${stimulus.recoveryCheckpoints.length}</div>
                </div>
            </div>
            <div class="recovery-actions">
                <button class="btn-secondary" onclick="addRecoveryCheckpoint(${stimulus.id})">
                    <i class="fas fa-plus"></i> Add Checkpoint
                </button>
                <button class="btn-success" onclick="completeRecovery(${stimulus.id})">
                    <i class="fas fa-check"></i> Mark Complete
                </button>
            </div>
        `;

        listDiv.appendChild(itemDiv);
    });
}

function addRecoveryCheckpoint(stimulusId) {
    const metrics = {
        energy: parseInt(prompt('Current Energy Level (1-10):')),
        mood: parseInt(prompt('Current Mood (1-10):')),
        focus: parseInt(prompt('Current Focus (1-10):')),
        stress: parseInt(prompt('Current Stress Level (1-10):'))
    };

    if (Object.values(metrics).some(v => isNaN(v) || v < 1 || v > 10)) {
        alert('Please enter valid values (1-10) for all metrics.');
        return;
    }

    updateRecoveryMetrics(stimulusId, metrics);
}

function updateStats() {
    const totalStimuli = stimuli.length;
    document.getElementById('totalStimuli').textContent = totalStimuli;

    if (totalStimuli === 0) {
        document.getElementById('avgRecoveryTime').textContent = '0h';
        document.getElementById('recoveryEfficiency').textContent = '0%';
        document.getElementById('mostChallenging').textContent = 'None';
        return;
    }

    // Calculate average recovery time for completed stimuli
    const completedStimuli = stimuli.filter(s => s.status === 'completed' && s.actualRecoveryTime);
    const avgRecoveryTime = completedStimuli.length > 0 ?
        completedStimuli.reduce((sum, s) => sum + s.actualRecoveryTime, 0) / completedStimuli.length : 0;
    document.getElementById('avgRecoveryTime').textContent = formatDuration(avgRecoveryTime);

    // Calculate recovery efficiency
    const efficientRecoveries = completedStimuli.filter(s => {
        const expectedMinutes = getExpectedMinutes(s.expectedRecovery);
        return s.actualRecoveryTime <= expectedMinutes;
    });
    const efficiency = completedStimuli.length > 0 ? (efficientRecoveries.length / completedStimuli.length) * 100 : 0;
    document.getElementById('recoveryEfficiency').textContent = Math.round(efficiency) + '%';

    // Find most challenging stimulus type
    const typeCounts = {};
    stimuli.forEach(stimulus => {
        typeCounts[stimulus.stimulusType] = (typeCounts[stimulus.stimulusType] || 0) + stimulus.intensity;
    });

    const mostChallenging = Object.entries(typeCounts).sort(([,a], [,b]) => b - a)[0];
    document.getElementById('mostChallenging').textContent = mostChallenging ?
        mostChallenging[0].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'None';
}

function updateChart() {
    const ctx = document.getElementById('recoveryChart').getContext('2d');
    const chartView = document.getElementById('chartView').value;
    const timeRange = document.getElementById('timeRange').value;

    // Filter stimuli by time range
    const filteredStimuli = filterStimuliByTime(stimuli, timeRange);

    if (recoveryChart) {
        recoveryChart.destroy();
    }

    let chartData, chartOptions;

    switch (chartView) {
        case 'recovery-time':
            chartData = getRecoveryTimeData(filteredStimuli);
            chartOptions = getBarChartOptions('Recovery Time by Stimulus Type', 'Minutes');
            break;
        case 'recovery-trend':
            chartData = getRecoveryTrendData(filteredStimuli);
            chartOptions = getLineChartOptions('Recovery Time Trend', 'Minutes');
            break;
        case 'stimulus-frequency':
            chartData = getStimulusFrequencyData(filteredStimuli);
            chartOptions = getBarChartOptions('Stimulus Frequency', 'Count');
            break;
        case 'recovery-efficiency':
            chartData = getRecoveryEfficiencyData(filteredStimuli);
            chartOptions = getBarChartOptions('Recovery Efficiency by Type', 'Percentage');
            break;
    }

    recoveryChart = new Chart(ctx, {
        type: chartData.type,
        data: chartData.data,
        options: chartOptions
    });
}

function getRecoveryTimeData(stimuli) {
    const completedStimuli = stimuli.filter(s => s.status === 'completed' && s.actualRecoveryTime);
    const typeGroups = {};

    completedStimuli.forEach(stimulus => {
        if (!typeGroups[stimulus.stimulusType]) {
            typeGroups[stimulus.stimulusType] = [];
        }
        typeGroups[stimulus.stimulusType].push(stimulus.actualRecoveryTime);
    });

    const labels = Object.keys(typeGroups).map(type =>
        type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
    const data = Object.values(typeGroups).map(times =>
        times.reduce((sum, time) => sum + time, 0) / times.length
    );

    return {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Average Recovery Time',
                data,
                backgroundColor: 'rgba(56, 189, 248, 0.8)',
                borderColor: '#38bdf8',
                borderWidth: 1
            }]
        }
    };
}

function getRecoveryTrendData(stimuli) {
    const completedStimuli = stimuli.filter(s => s.status === 'completed' && s.actualRecoveryTime)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
        type: 'line',
        data: {
            labels: completedStimuli.map(s => new Date(s.date).toLocaleDateString()),
            datasets: [{
                label: 'Recovery Time',
                data: completedStimuli.map(s => s.actualRecoveryTime),
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                tension: 0.4,
                fill: true
            }]
        }
    };
}

function getStimulusFrequencyData(stimuli) {
    const typeCounts = {};
    stimuli.forEach(stimulus => {
        typeCounts[stimulus.stimulusType] = (typeCounts[stimulus.stimulusType] || 0) + 1;
    });

    const labels = Object.keys(typeCounts).map(type =>
        type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
    );

    return {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Frequency',
                data: Object.values(typeCounts),
                backgroundColor: 'rgba(139, 92, 246, 0.8)',
                borderColor: '#8b5cf6',
                borderWidth: 1
            }]
        }
    };
}

function getRecoveryEfficiencyData(stimuli) {
    const completedStimuli = stimuli.filter(s => s.status === 'completed' && s.actualRecoveryTime);
    const typeEfficiency = {};

    completedStimuli.forEach(stimulus => {
        if (!typeEfficiency[stimulus.stimulusType]) {
            typeEfficiency[stimulus.stimulusType] = { total: 0, efficient: 0 };
        }
        typeEfficiency[stimulus.stimulusType].total++;
        const expectedMinutes = getExpectedMinutes(stimulus.expectedRecovery);
        if (stimulus.actualRecoveryTime <= expectedMinutes) {
            typeEfficiency[stimulus.stimulusType].efficient++;
        }
    });

    const labels = Object.keys(typeEfficiency).map(type =>
        type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
    const data = Object.values(typeEfficiency).map(eff =>
        eff.total > 0 ? (eff.efficient / eff.total) * 100 : 0
    );

    return {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Efficiency %',
                data,
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: '#10b981',
                borderWidth: 1
            }]
        }
    };
}

function getLineChartOptions(title, yLabel) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: title,
                color: '#ffffff'
            },
            legend: {
                labels: {
                    color: '#94a3b8'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#94a3b8'
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)'
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#94a3b8'
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)'
                },
                title: {
                    display: true,
                    text: yLabel,
                    color: '#94a3b8'
                }
            }
        }
    };
}

function getBarChartOptions(title, yLabel) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: title,
                color: '#ffffff'
            },
            legend: {
                labels: {
                    color: '#94a3b8'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#94a3b8'
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)'
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#94a3b8'
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)'
                },
                title: {
                    display: true,
                    text: yLabel,
                    color: '#94a3b8'
                }
            }
        }
    };
}

function updateInsights() {
    const insightsDiv = document.getElementById('insights');

    if (stimuli.length < 5) {
        insightsDiv.innerHTML = '<p>Log several stimulus events and track their recovery to receive personalized insights about your recovery patterns and optimization strategies.</p>';
        return;
    }

    let insights = '<div class="insights-list">';

    // Recovery time analysis
    const completedStimuli = stimuli.filter(s => s.status === 'completed' && s.actualRecoveryTime);
    if (completedStimuli.length >= 3) {
        const avgRecovery = completedStimuli.reduce((sum, s) => sum + s.actualRecoveryTime, 0) / completedStimuli.length;
        const longRecoveries = completedStimuli.filter(s => s.actualRecoveryTime > avgRecovery * 1.5);

        if (longRecoveries.length > 0) {
            insights += '<div class="insight-item">';
            insights += '<h4><i class="fas fa-clock"></i> Extended Recovery Patterns</h4>';
            insights += '<p>You tend to have longer recovery times after: ' +
                [...new Set(longRecoveries.map(s => s.stimulusType))].map(type =>
                    type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                ).join(', ') +
                '. Consider adjusting your recovery strategies for these stimuli.</p>';
            insights += '</div>';
        }
    }

    // Stimulus intensity correlation
    const intensityCorrelation = {};
    stimuli.forEach(stimulus => {
        if (stimulus.status === 'completed' && stimulus.actualRecoveryTime) {
            if (!intensityCorrelation[stimulus.stimulusType]) {
                intensityCorrelation[stimulus.stimulusType] = [];
            }
            intensityCorrelation[stimulus.stimulusType].push({
                intensity: stimulus.intensity,
                recoveryTime: stimulus.actualRecoveryTime
            });
        }
    });

    const highIntensityImpacts = Object.entries(intensityCorrelation)
        .filter(([, data]) => data.length >= 2)
        .map(([type, data]) => {
            const correlation = data.reduce((sum, d) => sum + (d.intensity * d.recoveryTime), 0) /
                              data.reduce((sum, d) => sum + (d.intensity * d.intensity), 0);
            return [type, correlation];
        })
        .filter(([, corr]) => corr > 0.7)
        .sort(([,a], [,b]) => b - a);

    if (highIntensityImpacts.length > 0) {
        insights += '<div class="insight-item">';
        insights += '<h4><i class="fas fa-chart-line"></i> Intensity-Recovery Correlation</h4>';
        insights += '<p>Higher intensity levels strongly predict longer recovery times for: ' +
            highIntensityImpacts.map(([type]) => type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ') +
            '. Consider intensity management strategies.</p>';
        insights += '</div>';
    }

    // Recovery strategy effectiveness
    const strategyEffectiveness = {};
    stimuli.filter(s => s.status === 'completed').forEach(stimulus => {
        const strategy = stimulus.recoveryNotes.toLowerCase();
        if (!strategyEffectiveness[strategy]) {
            strategyEffectiveness[strategy] = { total: 0, efficient: 0 };
        }
        strategyEffectiveness[strategy].total++;
        const expectedMinutes = getExpectedMinutes(stimulus.expectedRecovery);
        if (stimulus.actualRecoveryTime <= expectedMinutes) {
            strategyEffectiveness[strategy].efficient++;
        }
    });

    const effectiveStrategies = Object.entries(strategyEffectiveness)
        .filter(([, data]) => data.total >= 2)
        .map(([strategy, data]) => [strategy, (data.efficient / data.total) * 100])
        .filter(([, efficiency]) => efficiency >= 70)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);

    if (effectiveStrategies.length > 0) {
        insights += '<div class="insight-item positive">';
        insights += '<h4><i class="fas fa-star"></i> Effective Recovery Strategies</h4>';
        insights += '<p>Your most effective recovery approaches: ' +
            effectiveStrategies.map(([strategy]) => strategy.substring(0, 30) + (strategy.length > 30 ? '...' : '')).join(', ') +
            '. Continue using these strategies.</p>';
        insights += '</div>';
    }

    // Overdue recoveries
    const overdueStimuli = stimuli.filter(s => {
        if (s.status !== 'active') return false;
        const timeElapsed = (new Date() - new Date(s.recoveryStart)) / (1000 * 60);
        const expectedMinutes = getExpectedMinutes(s.expectedRecovery);
        return timeElapsed > expectedMinutes * 1.5;
    });

    if (overdueStimuli.length > 0) {
        insights += '<div class="insight-item warning">';
        insights += '<h4><i class="fas fa-exclamation-triangle"></i> Recovery Monitoring Needed</h4>';
        insights += '<p>You have ' + overdueStimuli.length + ' stimulus event(s) that are taking longer than expected to recover from. Consider additional recovery interventions or professional consultation.</p>';
        insights += '</div>';
    }

    insights += '</div>';
    insightsDiv.innerHTML = insights;
}

function updateStimuliList() {
    const listDiv = document.getElementById('stimuliList');
    const filterStimulus = document.getElementById('filterStimulus').value;
    const filterStatus = document.getElementById('filterStatus').value;
    const sortBy = document.getElementById('sortBy').value;

    let filteredStimuli = stimuli;

    if (filterStimulus !== 'all') {
        filteredStimuli = filteredStimuli.filter(s => s.stimulusType === filterStimulus);
    }

    if (filterStatus !== 'all') {
        filteredStimuli = filteredStimuli.filter(s => s.status === filterStatus);
    }

    // Sort stimuli
    filteredStimuli.sort((a, b) => {
        switch (sortBy) {
            case 'date':
                return new Date(b.date) - new Date(a.date);
            case 'recovery-time':
                const aTime = a.actualRecoveryTime || 999999;
                const bTime = b.actualRecoveryTime || 999999;
                return aTime - bTime;
            case 'intensity':
                return b.intensity - a.intensity;
            default:
                return new Date(b.date) - new Date(a.date);
        }
    });

    listDiv.innerHTML = '';

    if (filteredStimuli.length === 0) {
        listDiv.innerHTML = '<p>No stimuli match the current filters.</p>';
        return;
    }

    filteredStimuli.forEach(stimulus => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'stimuli-item';

        const statusClass = stimulus.status.toLowerCase();
        const timeElapsed = stimulus.status === 'active' ?
            Math.floor((new Date() - new Date(stimulus.recoveryStart)) / (1000 * 60)) : stimulus.actualRecoveryTime || 0;

        itemDiv.innerHTML = `
            <div class="stimuli-header">
                <div>
                    <h3 class="stimuli-title">${stimulus.description}</h3>
                    <div class="stimuli-meta">
                        ${new Date(stimulus.date).toLocaleDateString()} •
                        <span class="stimuli-type">${stimulus.stimulusType.replace('-', ' ')}</span>
                        <span class="stimuli-status ${statusClass}">${stimulus.status}</span>
                    </div>
                </div>
            </div>
            <div class="stimuli-metrics">
                <div class="stimuli-metric">
                    <div class="stimuli-metric-label">Intensity</div>
                    <div class="stimuli-metric-value">${stimulus.intensity}/10</div>
                </div>
                <div class="stimuli-metric">
                    <div class="stimuli-metric-label">Duration</div>
                    <div class="stimuli-metric-value">${stimulus.duration}min</div>
                </div>
                <div class="stimuli-metric">
                    <div class="stimuli-metric-label">Recovery Time</div>
                    <div class="stimuli-metric-value">${stimulus.actualRecoveryTime ? formatDuration(stimulus.actualRecoveryTime) : (stimulus.status === 'active' ? formatDuration(timeElapsed) : 'N/A')}</div>
                </div>
                <div class="stimuli-metric">
                    <div class="stimuli-metric-label">Checkpoints</div>
                    <div class="stimuli-metric-value">${stimulus.recoveryCheckpoints.length}</div>
                </div>
            </div>
            <div class="stimuli-content">
                <div class="stimuli-description">
                    <strong>Description:</strong> ${stimulus.description}
                </div>
                <div class="stimuli-recovery">
                    <strong>Recovery Strategy:</strong> ${stimulus.recoveryNotes}
                </div>
            </div>
            <div class="stimuli-actions">
                <button class="btn-secondary" onclick="viewStimulusDetails(${stimulus.id})">
                    <i class="fas fa-eye"></i> Details
                </button>
                <button class="btn-danger" onclick="deleteStimulus(${stimulus.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;

        listDiv.appendChild(itemDiv);
    });
}

function deleteStimulus(id) {
    if (confirm('Are you sure you want to delete this stimulus record?')) {
        stimuli = stimuli.filter(s => s.id !== id);
        localStorage.setItem('stimulusRecoveryData', JSON.stringify(stimuli));
        updateDisplay();
    }
}

function viewStimulusDetails(id) {
    const stimulus = stimuli.find(s => s.id === id);
    if (!stimulus) return;

    let details = `Stimulus: ${stimulus.description}\n`;
    details += `Type: ${stimulus.stimulusType.replace('-', ' ')}\n`;
    details += `Intensity: ${stimulus.intensity}/10\n`;
    details += `Duration: ${stimulus.duration} minutes\n`;
    details += `Expected Recovery: ${stimulus.expectedRecovery}\n`;
    details += `Status: ${stimulus.status}\n`;

    if (stimulus.actualRecoveryTime) {
        details += `Actual Recovery Time: ${formatDuration(stimulus.actualRecoveryTime)}\n`;
    }

    if (stimulus.recoveryCheckpoints.length > 0) {
        details += `\nRecovery Checkpoints:\n`;
        stimulus.recoveryCheckpoints.forEach((cp, index) => {
            details += `${index + 1}. ${formatTimeAgo(cp.timestamp)} - Energy: ${cp.metrics.energy}, Mood: ${cp.metrics.mood}, Focus: ${cp.metrics.focus}, Stress: ${cp.metrics.stress}\n`;
        });
    }

    alert(details);
}

function showAlert() {
    const alertDiv = document.getElementById('recoveryAlert');
    const activeStimuli = stimuli.filter(s => s.status === 'active');

    if (activeStimuli.length > 0) {
        const overdueCount = activeStimuli.filter(s => {
            const timeElapsed = (new Date() - new Date(s.recoveryStart)) / (1000 * 60);
            const expectedMinutes = getExpectedMinutes(s.expectedRecovery);
            return timeElapsed > expectedMinutes * 1.2;
        }).length;

        if (overdueCount > 0) {
            document.getElementById('alertTitle').textContent = 'Extended Recovery Period';
            document.getElementById('alertMessage').textContent = `You have ${overdueCount} stimulus event(s) that are taking longer than expected to recover from. Consider additional recovery interventions.`;
            alertDiv.classList.remove('hidden');
        } else {
            document.getElementById('alertTitle').textContent = 'Recovery Monitoring Active';
            document.getElementById('alertMessage').textContent = `You have ${activeStimuli.length} active recovery window(s). Continue monitoring your recovery metrics.`;
            alertDiv.classList.remove('hidden');
        }
    } else {
        alertDiv.classList.add('hidden');
    }
}

function filterStimuliByTime(stimuli, timeRange) {
    const now = new Date();
    let cutoffDate;

    switch (timeRange) {
        case '7':
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30':
            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case '90':
            cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        default:
            return stimuli;
    }

    return stimuli.filter(stimulus => new Date(stimulus.date) >= cutoffDate);
}

function getExpectedMinutes(expectedRecovery) {
    const timeMap = {
        '15min': 15,
        '30min': 30,
        '1hour': 60,
        '2hours': 120,
        '4hours': 240,
        '8hours': 480,
        '12hours': 720,
        '24hours': 1440,
        '48hours': 2880,
        '72hours': 4320,
        '1week': 10080
    };
    return timeMap[expectedRecovery] || 60;
}

function formatDuration(minutes) {
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    return `${Math.floor(minutes / 1440)}d ${Math.floor((minutes % 1440) / 60)}h`;
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return `${Math.floor(diffMinutes / 1440)} days ago`;
}

// Event listeners
document.getElementById('stimulusForm').addEventListener('submit', function(e) {
    e.preventDefault();
    logStimulus();
});

document.getElementById('chartView').addEventListener('change', updateChart);
document.getElementById('timeRange').addEventListener('change', updateChart);
document.getElementById('filterStimulus').addEventListener('change', updateStimuliList);
document.getElementById('filterStatus').addEventListener('change', updateStimuliList);
document.getElementById('sortBy').addEventListener('change', updateStimuliList);

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateDisplay();
});