// cognitive-load-sleep-analyzer.js

let entries = JSON.parse(localStorage.getItem('cognitiveLoadSleepEntries')) || [];
let sleepGoal = parseFloat(localStorage.getItem('sleepGoal')) || 8.0;
let chartInstance = null;

document.addEventListener('DOMContentLoaded', function() {
    const sleepGoalInput = document.getElementById('sleepGoal');
    if (sleepGoalInput) {
        sleepGoalInput.value = sleepGoal;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('logDate');
    if (dateInput) {
        dateInput.value = today;
    }

    updateLoadValue();
    updateQualityValue();
    updateStats(); 
    updateChart();
    updateEntriesList();
    updateSleepDebtCalculator();
    
    initializeCharacterCounters();
});

function updateLoadValue() {
    const value = document.getElementById('cognitiveLoad').value;
    document.getElementById('currentLoadValue').textContent = value;
}

function updateQualityValue() {
    const value = document.getElementById('sleepQuality').value;
    document.getElementById('currentQualityValue').textContent = value;
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
    } else {
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
    
    // Update weekly summary
    updateWeeklySummary();
}

function updateWeeklySummary() {
    // Get entries from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEntries = entries.filter(entry => new Date(entry.date) >= sevenDaysAgo);
    
    // Get summary elements
    const bestSleepDayEl = document.getElementById('bestSleepDay');
    const bestSleepDetailsEl = document.getElementById('bestSleepDetails');
    const bestSleepDateEl = document.getElementById('bestSleepDate');
    
    const highestLoadDayEl = document.getElementById('highestLoadDay');
    const highestLoadDetailsEl = document.getElementById('highestLoadDetails');
    const highestLoadDateEl = document.getElementById('highestLoadDate');
    
    const mostProductiveDayEl = document.getElementById('mostProductiveDay');
    const mostProductiveDetailsEl = document.getElementById('mostProductiveDetails');
    const mostProductiveDateEl = document.getElementById('mostProductiveDate');
    
    if (recentEntries.length === 0) {
        // No data in last 7 days
        if (bestSleepDayEl) {
            bestSleepDayEl.textContent = 'No Data';
            bestSleepDetailsEl.innerHTML = '<i class="fas fa-info-circle"></i><span>Log entries to see insights</span>';
            bestSleepDateEl.innerHTML = '<i class="far fa-calendar-alt"></i><span>Last 7 days</span>';
        }
        
        if (highestLoadDayEl) {
            highestLoadDayEl.textContent = 'No Data';
            highestLoadDetailsEl.innerHTML = '<i class="fas fa-info-circle"></i><span>Log entries to see insights</span>';
            highestLoadDateEl.innerHTML = '<i class="far fa-calendar-alt"></i><span>Last 7 days</span>';
        }
        
        if (mostProductiveDayEl) {
            mostProductiveDayEl.textContent = 'No Data';
            mostProductiveDetailsEl.innerHTML = '<i class="fas fa-info-circle"></i><span>Log entries to see insights</span>';
            mostProductiveDateEl.innerHTML = '<i class="far fa-calendar-alt"></i><span>Last 7 days</span>';
        }
        return;
    }
    
    // 1. Best Sleep Day (highest sleep quality)
    const bestSleepEntry = recentEntries.reduce((best, current) => {
        return (current.sleepQuality > best.sleepQuality) ? current : best;
    }, recentEntries[0]);
    
    const bestSleepDate = new Date(bestSleepEntry.date);
    bestSleepDayEl.textContent = bestSleepDate.toLocaleDateString('en-US', { weekday: 'long' });
    bestSleepDetailsEl.innerHTML = `
        <i class="fas fa-star"></i>
        <span>Quality: ${bestSleepEntry.sleepQuality}/10 (${bestSleepEntry.sleepHours}h)</span>
    `;
    bestSleepDateEl.innerHTML = `
        <i class="far fa-calendar-alt"></i>
        <span>${bestSleepDate.toLocaleDateString()}</span>
    `;
    
    // 2. Highest Cognitive Load Day
    const highestLoadEntry = recentEntries.reduce((highest, current) => {
        return (current.cognitiveLoad > highest.cognitiveLoad) ? current : highest;
    }, recentEntries[0]);
    
    const highestLoadDate = new Date(highestLoadEntry.date);
    highestLoadDayEl.textContent = highestLoadDate.toLocaleDateString('en-US', { weekday: 'long' });
    highestLoadDetailsEl.innerHTML = `
        <i class="fas fa-tachometer-alt"></i>
        <span>Load: ${highestLoadEntry.cognitiveLoad}/10 (${highestLoadEntry.workHours}h)</span>
    `;
    highestLoadDateEl.innerHTML = `
        <i class="far fa-calendar-alt"></i>
        <span>${highestLoadDate.toLocaleDateString()}</span>
    `;
    
    const productiveEntries = recentEntries.map(entry => ({
        ...entry,
        productivityScore: (entry.workHours * (entry.sleepQuality / 10)) // Work hours weighted by sleep quality
    }));
    
    const mostProductiveEntry = productiveEntries.reduce((best, current) => {
        return (current.productivityScore > best.productivityScore) ? current : best;
    }, productiveEntries[0]);
    
    const productiveDate = new Date(mostProductiveEntry.date);
    mostProductiveDayEl.textContent = productiveDate.toLocaleDateString('en-US', { weekday: 'long' });
    mostProductiveDetailsEl.innerHTML = `
        <i class="fas fa-clock"></i>
        <span>Work: ${mostProductiveEntry.workHours}h (Quality: ${mostProductiveEntry.sleepQuality}/10)</span>
    `;
    mostProductiveDateEl.innerHTML = `
        <i class="far fa-calendar-alt"></i>
        <span>${productiveDate.toLocaleDateString()}</span>
    `;
    
    addInsightBadges(recentEntries);
}

function addInsightBadges(recentEntries) {
    const summaryCards = document.querySelectorAll('.summary-card');
    
    summaryCards.forEach(card => {
        const existingBadge = card.querySelector('.insight-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
    });
    
    if (recentEntries.length < 3) return;
    
    const avgSleepQuality = recentEntries.reduce((sum, e) => sum + e.sleepQuality, 0) / recentEntries.length;
    const avgCognitiveLoad = recentEntries.reduce((sum, e) => sum + e.cognitiveLoad, 0) / recentEntries.length;
    const avgWorkHours = recentEntries.reduce((sum, e) => sum + e.workHours, 0) / recentEntries.length;
    
    if (avgSleepQuality < 5 && summaryCards[0]) {
        const bestSleepCard = summaryCards[0];
        const badge = document.createElement('div');
        badge.className = 'insight-badge';
        badge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Sleep quality needs improvement';
        bestSleepCard.appendChild(badge);
    }
   
    if (avgCognitiveLoad > 7 && summaryCards[1]) {
        const highestLoadCard = summaryCards[1];
        const badge = document.createElement('div');
        badge.className = 'insight-badge';
        badge.innerHTML = '<i class="fas fa-exclamation-circle"></i> High cognitive load this week';
        highestLoadCard.appendChild(badge);
    }
    
    if (avgWorkHours > 8 && avgSleepQuality < 6 && summaryCards[2]) {
        const productiveCard = summaryCards[2];
        const badge = document.createElement('div');
        badge.className = 'insight-badge';
        badge.innerHTML = '<i class="fas fa-lightbulb"></i> Consider work-life balance';
        productiveCard.appendChild(badge);
    }
}

function updateChart() {
    const ctx = document.getElementById('correlationChart').getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy();
    }

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

    chartInstance = new Chart(ctx, {
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
    if (!entriesList) return;
    
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
        updateSleepDebtCalculator();
    }
}

// Add character counter functionality
function initializeCharacterCounters() {
    const workNotes = document.getElementById('workNotes');
    const sleepNotes = document.getElementById('sleepNotes');
    const workCounter = document.getElementById('workNotesCounter');
    const sleepCounter = document.getElementById('sleepNotesCounter');
    
    const MAX_CHARS = 500;
    
    function updateCounter(textarea, counterElement) {
        if (!textarea || !counterElement) return;
        
        const currentLength = textarea.value.length;
        counterElement.textContent = `${currentLength}/${MAX_CHARS} characters`;
        
        counterElement.classList.remove('warning', 'danger');
        
        if (currentLength >= MAX_CHARS) {
            counterElement.classList.add('danger');
        } else if (currentLength >= MAX_CHARS * 0.8) { 
            counterElement.classList.add('warning');
        }
    }
    
    if (workNotes && workCounter) {
        workNotes.addEventListener('input', function() {
            updateCounter(this, workCounter);
        });
        updateCounter(workNotes, workCounter);
    }
    
    if (sleepNotes && sleepCounter) {
        sleepNotes.addEventListener('input', function() {
            updateCounter(this, sleepCounter);
        });
        updateCounter(sleepNotes, sleepCounter);
    }
}

function logEntry() {
    const date = document.getElementById('logDate').value;
    const workHours = parseFloat(document.getElementById('workHours').value);
    const cognitiveLoad = parseInt(document.getElementById('cognitiveLoad').value);
    const sleepHours = parseFloat(document.getElementById('sleepHours').value);
    const sleepQuality = parseInt(document.getElementById('sleepQuality').value);
    const workNotes = document.getElementById('workNotes').value.trim();
    const sleepNotes = document.getElementById('sleepNotes').value.trim();
    
    const MAX_CHARS = 500;
    if (workNotes.length > MAX_CHARS || sleepNotes.length > MAX_CHARS) {
        alert(`Notes cannot exceed ${MAX_CHARS} characters. Please shorten your notes.`);
        return;
    }

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

    const existingEntry = entries.find(entry => entry.date === date);
    if (existingEntry) {
        if (!confirm('An entry already exists for this date. Do you want to update it?')) {
            return;
        }
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

    entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (entries.length > 100) {
        entries = entries.slice(-100);
    }

    localStorage.setItem('cognitiveLoadSleepEntries', JSON.stringify(entries));

    resetForm();

    updateStats(); 
    updateChart();
    updateEntriesList();
    updateSleepDebtCalculator();
}

function resetForm() {
    document.getElementById('logDate').value = '';
    document.getElementById('workHours').value = '';
    document.getElementById('cognitiveLoad').value = 5;
    document.getElementById('sleepHours').value = '';
    document.getElementById('sleepQuality').value = 7;
    document.getElementById('workNotes').value = '';
    document.getElementById('sleepNotes').value = '';
    
    updateLoadValue();
    updateQualityValue();
    
    const workCounter = document.getElementById('workNotesCounter');
    const sleepCounter = document.getElementById('sleepNotesCounter');
    if (workCounter) workCounter.textContent = '0/500 characters';
    if (sleepCounter) sleepCounter.textContent = '0/500 characters';
    
    const resetBtn = document.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.style.backgroundColor = '#28a745';
        setTimeout(() => {
            resetBtn.style.backgroundColor = '#6c757d';
        }, 200);
    }
}

function updateSleepGoal() {
    const goalInput = document.getElementById('sleepGoal');
    const newGoal = parseFloat(goalInput.value);
    
    if (isNaN(newGoal) || newGoal < 4 || newGoal > 12) {
        alert('Please enter a valid sleep goal between 4 and 12 hours.');
        goalInput.value = sleepGoal;
        return;
    }
    
    sleepGoal = newGoal;
    localStorage.setItem('sleepGoal', sleepGoal);
    
    goalInput.style.borderColor = '#28a745';
    setTimeout(() => {
        goalInput.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }, 500);
    
    updateSleepDebtCalculator();
}

function calculateSleepDebt() {
    if (entries.length === 0) {
        return {
            totalDebt: 0,
            weeklyDebt: 0,
            avgSleep: 0,
            dailyDebts: []
        };
    }
    
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let totalDebt = 0;
    const dailyDebts = [];
    
    sortedEntries.forEach(entry => {
        const debt = entry.sleepHours - sleepGoal;
        totalDebt += debt;
        dailyDebts.push({
            date: entry.date,
            debt: debt,
            sleepHours: entry.sleepHours
        });
    });
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEntries = sortedEntries.filter(entry => new Date(entry.date) >= sevenDaysAgo);
    
    const weeklyDebt = recentEntries.reduce((sum, entry) => sum + (entry.sleepHours - sleepGoal), 0);
    
    const avgSleep = entries.reduce((sum, entry) => sum + entry.sleepHours, 0) / entries.length;
    
    return {
        totalDebt: totalDebt,
        weeklyDebt: weeklyDebt,
        avgSleep: avgSleep,
        dailyDebts: dailyDebts.slice(-14) 
    };
}

function updateSleepDebtCalculator() {
    const debtData = calculateSleepDebt();
    
    const totalDebtEl = document.getElementById('totalSleepDebt');
    const avgSleepEl = document.getElementById('avgSleepHours');
    const avgVsGoalEl = document.getElementById('avgVsGoal');
    const weeklyDebtEl = document.getElementById('weeklySleepDebt');
    
    if (totalDebtEl) {
        const totalDebtFormatted = debtData.totalDebt.toFixed(1);
        totalDebtEl.textContent = `${totalDebtFormatted}h`;
        totalDebtEl.style.color = debtData.totalDebt < 0 ? '#dc3545' : '#28a745';
    }
    
    if (avgSleepEl) {
        avgSleepEl.textContent = `${debtData.avgSleep.toFixed(1)}h`;
    }
    
    if (avgVsGoalEl) {
        const diff = (debtData.avgSleep - sleepGoal).toFixed(1);
        avgVsGoalEl.textContent = `vs ${sleepGoal.toFixed(1)}h goal (${diff > 0 ? '+' : ''}${diff}h)`;
        avgVsGoalEl.style.color = diff < 0 ? '#dc3545' : '#28a745';
    }
    
    if (weeklyDebtEl) {
        weeklyDebtEl.textContent = `${debtData.weeklyDebt.toFixed(1)}h`;
        weeklyDebtEl.style.color = debtData.weeklyDebt < 0 ? '#dc3545' : '#28a745';
    }
    
    updateDebtAlertLevel(debtData);
    
    updateDebtHistory(debtData.dailyDebts);
}

function updateDebtAlertLevel(debtData) {
    const alertLevelEl = document.getElementById('debtAlertLevel');
    const progressFillEl = document.getElementById('debtProgressFill');
    const warningMessageEl = document.getElementById('debtWarningMessage');
    
    if (!alertLevelEl || !progressFillEl || !warningMessageEl) return;
    
    const totalDebt = debtData.totalDebt;
    const maxDebtThreshold = 14; 
    const debtPercentage = Math.min(Math.abs(Math.min(totalDebt, 0)) / maxDebtThreshold * 100, 100);
    
    progressFillEl.style.width = `${debtPercentage}%`;
    
    let alertLevel = 'Healthy';
    let alertClass = '';
    let message = '';
    
    if (totalDebt < -10) {
        alertLevel = 'Severe';
        alertClass = 'danger';
        message = '⚠️ Critical: You have accumulated severe sleep debt. Consider taking time to rest and recover.';
    } else if (totalDebt < -5) {
        alertLevel = 'High';
        alertClass = 'danger';
        message = '⚠️ Warning: Your sleep debt is building up. Try to get extra rest when possible.';
    } else if (totalDebt < -2) {
        alertLevel = 'Moderate';
        alertClass = 'warning';
        message = '⚡ Moderate sleep debt detected. Aim for a few early nights to catch up.';
    } else if (totalDebt < 0) {
        alertLevel = 'Low';
        alertClass = 'warning';
        message = '💤 Mild sleep debt. Pay attention to your sleep schedule.';
    } else {
        alertLevel = 'Healthy';
        alertClass = '';
        message = '✅ Great job! You\'re meeting or exceeding your sleep goal.';
    }
    
    alertLevelEl.textContent = alertLevel;
    alertLevelEl.className = alertClass;
    
    warningMessageEl.textContent = message;
    warningMessageEl.className = `debt-warning-message ${alertClass}`;
    
    if (totalDebt < -10) {
        progressFillEl.style.background = 'linear-gradient(90deg, #dc3545, #ff6b6b)';
    } else if (totalDebt < -5) {
        progressFillEl.style.background = 'linear-gradient(90deg, #ffc107, #dc3545)';
    } else if (totalDebt < 0) {
        progressFillEl.style.background = 'linear-gradient(90deg, #28a745, #ffc107)';
    } else {
        progressFillEl.style.background = 'linear-gradient(90deg, #28a745, #20c997)';
    }
}

function updateDebtHistory(dailyDebts) {
    const debtHistoryEl = document.getElementById('debtHistory');
    if (!debtHistoryEl) return;
    
    if (dailyDebts.length === 0) {
        debtHistoryEl.innerHTML = '<div class="debt-history-item">No sleep data available</div>';
        return;
    }
    
    const recentDebts = dailyDebts.slice(-7).reverse();
    
    debtHistoryEl.innerHTML = recentDebts.map(day => {
        const date = new Date(day.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const debtValue = day.debt.toFixed(1);
        const debtClass = day.debt < 0 ? 'debt-history-deficit' : 'debt-history-surplus';
        const debtSymbol = day.debt < 0 ? '' : '+';
        
        return `
            <div class="debt-history-item">
                <span class="debt-history-date">${formattedDate}</span>
                <span class="debt-history-value ${debtClass}">
                    ${debtSymbol}${debtValue}h (${day.sleepHours.toFixed(1)}h)
                </span>
            </div>
        `;
    }).join('');
}

window.updateLoadValue = updateLoadValue;
window.updateQualityValue = updateQualityValue;
window.logEntry = logEntry;
window.deleteEntry = deleteEntry;
window.resetForm = resetForm;
window.updateSleepGoal = updateSleepGoal;