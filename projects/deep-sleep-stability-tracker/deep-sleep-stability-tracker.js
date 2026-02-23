// deep-sleep-stability-tracker.js

let sleepEntries = JSON.parse(localStorage.getItem('sleepStabilityEntries')) || [];

function logSleepSession() {
    const date = document.getElementById('sleepDate').value;
    const totalSleepHours = parseFloat(document.getElementById('totalSleepHours').value);
    const deepSleepPercentage = parseInt(document.getElementById('deepSleepPercentage').value);
    const sleepQuality = parseInt(document.getElementById('sleepQuality').value);

    // Get environment factors
    const environmentCheckboxes = document.querySelectorAll('input[name="environmentFactors"]:checked');
    const environmentFactors = Array.from(environmentCheckboxes).map(cb => cb.value);

    // Get pre-sleep factors
    const preSleepCheckboxes = document.querySelectorAll('input[name="preSleepFactors"]:checked');
    const preSleepFactors = Array.from(preSleepCheckboxes).map(cb => cb.value);

    const notes = document.getElementById('sleepNotes').value.trim();

    if (!date || !totalSleepHours || !deepSleepPercentage) {
        alert('Please fill in all required fields.');
        return;
    }

    // Check if entry already exists for this date
    const existingEntry = sleepEntries.find(entry => entry.date === date);
    if (existingEntry) {
        if (!confirm('An entry already exists for this date. Do you want to update it?')) {
            return;
        }
        // Remove existing entry
        sleepEntries = sleepEntries.filter(entry => entry.date !== date);
    }

    // Calculate deep sleep stability score
    const stabilityScore = calculateStabilityScore({
        totalSleepHours,
        deepSleepPercentage,
        sleepQuality,
        environmentFactors,
        preSleepFactors
    });

    // Determine stability level
    const stabilityLevel = getStabilityLevel(stabilityScore);

    const entry = {
        id: Date.now(),
        date,
        totalSleepHours,
        deepSleepPercentage,
        sleepQuality,
        environmentFactors,
        preSleepFactors,
        stabilityScore: parseFloat(stabilityScore.toFixed(1)),
        stabilityLevel,
        notes
    };

    sleepEntries.push(entry);

    // Sort by date
    sleepEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Keep only last 50 entries
    if (sleepEntries.length > 50) {
        sleepEntries = sleepEntries.slice(-50);
    }

    localStorage.setItem('sleepStabilityEntries', JSON.stringify(sleepEntries));

    // Clear form
    document.getElementById('sleepDate').value = '';
    document.getElementById('totalSleepHours').value = '';
    document.getElementById('deepSleepPercentage').value = '';
    document.getElementById('sleepQuality').value = 7;

    // Clear checkboxes
    environmentCheckboxes.forEach(cb => cb.checked = false);
    preSleepCheckboxes.forEach(cb => cb.checked = false);

    document.getElementById('sleepNotes').value = '';

    updateStats();
    updateAlert();
    updateChart();
    updateInsights();
    updateSleepHistory();
}

function calculateStabilityScore(data) {
    let score = 0;

    // Base score from deep sleep percentage (optimal is 20-25%)
    if (data.deepSleepPercentage >= 20 && data.deepSleepPercentage <= 25) {
        score += 30; // Optimal range
    } else if (data.deepSleepPercentage >= 15 && data.deepSleepPercentage <= 30) {
        score += 20; // Good range
    } else if (data.deepSleepPercentage >= 10 && data.deepSleepPercentage <= 35) {
        score += 10; // Acceptable range
    } else {
        score += 5; // Poor range
    }

    // Sleep quality factor
    score += data.sleepQuality * 2; // 1-10 scale, max 20 points

    // Total sleep hours factor (optimal is 7-9 hours)
    if (data.totalSleepHours >= 7 && data.totalSleepHours <= 9) {
        score += 20; // Optimal range
    } else if (data.totalSleepHours >= 6 && data.totalSleepHours <= 10) {
        score += 15; // Good range
    } else if (data.totalSleepHours >= 5 && data.totalSleepHours <= 11) {
        score += 10; // Acceptable range
    } else {
        score += 5; // Poor range
    }

    // Environment factors (each good factor adds points)
    const goodEnvironmentFactors = ['coolRoom', 'darkRoom', 'quietRoom', 'comfortableBed'];
    const environmentScore = goodEnvironmentFactors.filter(factor =>
        data.environmentFactors.includes(factor)
    ).length * 5; // Max 20 points
    score += environmentScore;

    // Pre-sleep factors (each bad factor subtracts points)
    const badPreSleepFactors = ['caffeine', 'lateExercise', 'stress', 'alcohol', 'heavyMeal', 'screenTime'];
    const preSleepPenalty = badPreSleepFactors.filter(factor =>
        data.preSleepFactors.includes(factor)
    ).length * 3; // Max 18 points penalty
    score -= preSleepPenalty;

    // Calculate consistency bonus if we have previous entries
    if (sleepEntries.length >= 3) {
        const recentEntries = sleepEntries.slice(-5);
        const avgDeepSleep = recentEntries.reduce((sum, entry) => sum + entry.deepSleepPercentage, 0) / recentEntries.length;
        const variance = recentEntries.reduce((sum, entry) =>
            sum + Math.pow(entry.deepSleepPercentage - avgDeepSleep, 2), 0) / recentEntries.length;
        const stdDev = Math.sqrt(variance);

        // Lower standard deviation = more consistent = higher bonus
        if (stdDev <= 2) score += 15; // Very consistent
        else if (stdDev <= 5) score += 10; // Moderately consistent
        else if (stdDev <= 8) score += 5; // Somewhat consistent
        // No bonus for highly variable sleep
    }

    // Cap at 100 and ensure minimum 0
    return Math.max(0, Math.min(100, score));
}

function getStabilityLevel(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 35) return 'Poor';
    return 'Critical';
}

function updateStats() {
    const totalEntries = sleepEntries.length;

    if (totalEntries === 0) {
        document.getElementById('avgDeepSleep').textContent = '0%';
        document.getElementById('stabilityScore').textContent = '0/100';
        document.getElementById('avgSleepQuality').textContent = '0/10';
        document.getElementById('totalEntries').textContent = '0';
        return;
    }

    // Calculate averages
    const avgDeepSleep = sleepEntries.reduce((sum, entry) => sum + entry.deepSleepPercentage, 0) / totalEntries;
    const avgStability = sleepEntries.reduce((sum, entry) => sum + entry.stabilityScore, 0) / totalEntries;
    const avgQuality = sleepEntries.reduce((sum, entry) => sum + entry.sleepQuality, 0) / totalEntries;

    // Update display
    document.getElementById('avgDeepSleep').textContent = `${avgDeepSleep.toFixed(1)}%`;
    document.getElementById('stabilityScore').textContent = `${avgStability.toFixed(1)}/100`;
    document.getElementById('avgSleepQuality').textContent = `${avgQuality.toFixed(1)}/10`;
    document.getElementById('totalEntries').textContent = totalEntries;
}

function updateAlert() {
    const alertDiv = document.getElementById('sleepAlert');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');

    if (sleepEntries.length === 0) {
        alertDiv.classList.add('hidden');
        return;
    }

    const latestEntry = sleepEntries[sleepEntries.length - 1];
    const recentEntries = sleepEntries.slice(-3); // Last 3 days
    const avgRecentStability = recentEntries.reduce((sum, entry) => sum + entry.stabilityScore, 0) / recentEntries.length;

    if (latestEntry.stabilityLevel === 'Critical' || avgRecentStability < 35) {
        alertDiv.classList.remove('hidden');
        alertTitle.textContent = 'Critical Sleep Stability Issues';
        alertMessage.textContent = 'Your deep sleep stability is critically low. This can severely impact recovery, cognitive function, and overall health. Immediate intervention is required to optimize your sleep environment and routine.';
    } else if (latestEntry.stabilityLevel === 'Poor' || avgRecentStability < 50) {
        alertDiv.classList.remove('hidden');
        alertTitle.textContent = 'Poor Sleep Stability Detected';
        alertMessage.textContent = 'Your deep sleep patterns are unstable. Focus on creating a consistent sleep schedule, optimizing your sleep environment, and avoiding stimulants before bedtime.';
    } else if (latestEntry.deepSleepPercentage < 15 || latestEntry.totalSleepHours < 6) {
        alertDiv.classList.remove('hidden');
        alertTitle.textContent = 'Sleep Quality Concerns';
        alertMessage.textContent = 'Your recent sleep metrics indicate potential issues with deep sleep duration or total sleep time. Consider adjusting your bedtime routine and sleep environment.';
    } else {
        alertDiv.classList.add('hidden');
    }
}

function updateChart() {
    const ctx = document.getElementById('sleepChart').getContext('2d');

    // Prepare data for last 20 entries
    const chartEntries = sleepEntries.slice(-20);

    const labels = chartEntries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString();
    });

    const deepSleepPercentages = chartEntries.map(entry => entry.deepSleepPercentage);
    const stabilityScores = chartEntries.map(entry => entry.stabilityScore);
    const sleepQualities = chartEntries.map(entry => entry.sleepQuality);
    const totalSleepHours = chartEntries.map(entry => entry.totalSleepHours);

    // Reference lines
    const optimalDeepSleep = new Array(deepSleepPercentages.length).fill(22.5);
    const minDeepSleep = new Array(deepSleepPercentages.length).fill(15);
    const optimalSleepHours = new Array(totalSleepHours.length).fill(8);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Deep Sleep %',
                data: deepSleepPercentages,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Stability Score',
                data: stabilityScores,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Sleep Quality',
                data: sleepQualities,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Total Sleep Hours',
                data: totalSleepHours,
                borderColor: '#6f42c1',
                backgroundColor: 'rgba(111, 66, 193, 0.1)',
                yAxisID: 'y2',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Optimal Deep Sleep (22.5%)',
                data: optimalDeepSleep,
                borderColor: '#28a745',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Minimum Deep Sleep (15%)',
                data: minDeepSleep,
                borderColor: '#ffc107',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Optimal Sleep Hours (8h)',
                data: optimalSleepHours,
                borderColor: '#17a2b8',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y2'
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
                        text: 'Deep Sleep Percentage'
                    },
                    min: 0,
                    max: 40
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Stability/Quality Score'
                    },
                    min: 0,
                    max: 100,
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
                        text: 'Sleep Hours'
                    },
                    min: 0,
                    max: 12,
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

    if (sleepEntries.length < 5) {
        insightsDiv.innerHTML = '<p>Log at least 5 sleep sessions to receive personalized insights about your deep sleep patterns and optimization strategies.</p>';
        return;
    }

    // Analyze patterns
    const recentEntries = sleepEntries.slice(-10);
    const avgDeepSleep = recentEntries.reduce((sum, entry) => sum + entry.deepSleepPercentage, 0) / recentEntries.length;
    const avgStability = recentEntries.reduce((sum, entry) => sum + entry.stabilityScore, 0) / recentEntries.length;
    const avgSleepHours = recentEntries.reduce((sum, entry) => sum + entry.totalSleepHours, 0) / recentEntries.length;

    // Find most common pre-sleep factors
    const preSleepFactorCounts = {};
    recentEntries.forEach(entry => {
        entry.preSleepFactors.forEach(factor => {
            preSleepFactorCounts[factor] = (preSleepFactorCounts[factor] || 0) + 1;
        });
    });

    const topPreSleepFactors = Object.entries(preSleepFactorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([factor]) => factor);

    // Analyze environment factors
    const environmentFactorCounts = {};
    recentEntries.forEach(entry => {
        entry.environmentFactors.forEach(factor => {
            environmentFactorCounts[factor] = (environmentFactorCounts[factor] || 0) + 1;
        });
    });

    const missingEnvironmentFactors = ['coolRoom', 'darkRoom', 'quietRoom', 'comfortableBed']
        .filter(factor => !environmentFactorCounts[factor] || environmentFactorCounts[factor] < recentEntries.length * 0.7);

    // Analyze trends
    const stabilityTrend = recentEntries.length >= 2 ?
        recentEntries[recentEntries.length - 1].stabilityScore - recentEntries[0].stabilityScore : 0;

    let insights = '<p>Based on your deep sleep stability patterns:</p><ul>';

    if (avgStability >= 80) {
        insights += '<li><strong>Excellent sleep stability!</strong> Your deep sleep patterns are highly consistent and optimal. Continue with your current sleep practices.</li>';
    } else if (avgStability >= 65) {
        insights += '<li><strong>Good sleep stability.</strong> Your deep sleep patterns are generally consistent. Minor adjustments could further optimize your sleep quality.</li>';
    } else if (avgStability >= 50) {
        insights += '<li><strong>Fair sleep stability.</strong> Your deep sleep patterns show room for improvement. Focus on consistency and sleep environment optimization.</li>';
    } else if (avgStability >= 35) {
        insights += '<li><strong>Poor sleep stability.</strong> Your deep sleep patterns are inconsistent. Significant changes to your sleep routine and environment are needed.</li>';
    } else {
        insights += '<li><strong>Critical sleep stability issues.</strong> Your deep sleep patterns indicate serious sleep health concerns. Professional consultation may be necessary.</li>';
    }

    if (avgDeepSleep < 15) {
        insights += `<li><strong>Low deep sleep percentage.</strong> Your average deep sleep (${avgDeepSleep.toFixed(1)}%) is below optimal levels. Deep sleep is crucial for physical recovery and cognitive function.</li>`;
    } else if (avgDeepSleep > 25) {
        insights += `<li><strong>High deep sleep percentage.</strong> Your deep sleep (${avgDeepSleep.toFixed(1)}%) is above typical ranges. This might indicate sleep deprivation or other underlying factors.</li>`;
    }

    if (avgSleepHours < 7) {
        insights += `<li><strong>Insufficient sleep duration.</strong> Your average sleep time (${avgSleepHours.toFixed(1)}h) is below recommended levels. Aim for 7-9 hours of total sleep.</li>`;
    }

    if (stabilityTrend > 10) {
        insights += '<li><strong>Improving sleep stability.</strong> Your recent changes are positively impacting your deep sleep patterns. Continue with these improvements.</li>';
    } else if (stabilityTrend < -10) {
        insights += '<li><strong>Declining sleep stability.</strong> Your sleep quality has been decreasing recently. Identify and address factors that may be disrupting your sleep.</li>';
    }

    if (topPreSleepFactors.length > 0) {
        const factorNames = topPreSleepFactors.map(factor => {
            const nameMap = {
                'caffeine': 'Caffeine consumption',
                'lateExercise': 'Late evening exercise',
                'stress': 'Pre-bedtime stress',
                'alcohol': 'Alcohol consumption',
                'heavyMeal': 'Heavy meals before bed',
                'screenTime': 'Screen time before bed'
            };
            return nameMap[factor] || factor;
        });
        insights += `<li><strong>Common sleep disruptors:</strong> ${factorNames.join(', ')}. Consider reducing or eliminating these factors to improve deep sleep stability.</li>`;
    }

    if (missingEnvironmentFactors.length > 0) {
        const factorNames = missingEnvironmentFactors.map(factor => {
            const nameMap = {
                'coolRoom': 'cool room temperature (60-67°F)',
                'darkRoom': 'dark room environment',
                'quietRoom': 'quiet sleep environment',
                'comfortableBed': 'comfortable bed and bedding'
            };
            return nameMap[factor] || factor;
        });
        insights += `<li><strong>Sleep environment improvements:</strong> Consider optimizing ${factorNames.join(', ')} to enhance deep sleep quality.</li>`;
    }

    insights += '<li><strong>Deep sleep optimization tips:</strong> Maintain consistent sleep/wake times, create a cool, dark, quiet sleep environment, avoid caffeine after 2 PM, establish a relaxing pre-bed routine, and ensure adequate physical activity during the day.</li>';
    insights += '</ul>';

    insightsDiv.innerHTML = insights;
}

function updateSleepHistory() {
    const historyList = document.getElementById('sleepHistory');
    historyList.innerHTML = '';

    // Show last 10 entries
    const recentEntries = sleepEntries.slice(-10).reverse();

    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'sleep-entry';

        const environmentText = entry.environmentFactors.length > 0 ?
            entry.environmentFactors.map(factor => {
                const nameMap = {
                    'coolRoom': 'Cool Room',
                    'darkRoom': 'Dark Room',
                    'quietRoom': 'Quiet Room',
                    'comfortableBed': 'Comfortable Bed'
                };
                return nameMap[factor] || factor;
            }).join(', ') : 'None specified';

        const preSleepText = entry.preSleepFactors.length > 0 ?
            entry.preSleepFactors.map(factor => {
                const nameMap = {
                    'caffeine': 'Caffeine',
                    'lateExercise': 'Late Exercise',
                    'stress': 'Stress',
                    'alcohol': 'Alcohol',
                    'heavyMeal': 'Heavy Meal',
                    'screenTime': 'Screen Time'
                };
                return nameMap[factor] || factor;
            }).join(', ') : 'None reported';

        entryDiv.innerHTML = `
            <div class="entry-header">
                <div class="entry-date">${new Date(entry.date).toLocaleDateString()}</div>
                <div class="stability-indicator ${entry.stabilityLevel.toLowerCase()}">${entry.stabilityLevel}</div>
            </div>
            <div class="entry-metrics">
                <div class="metric-item">
                    <div class="metric-label">Deep Sleep</div>
                    <div class="metric-value">${entry.deepSleepPercentage}%</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Total Sleep</div>
                    <div class="metric-value">${entry.totalSleepHours}h</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Quality</div>
                    <div class="metric-value">${entry.sleepQuality}/10</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Stability</div>
                    <div class="metric-value">${entry.stabilityScore}/100</div>
                </div>
            </div>
            <div class="entry-factors">
                <strong>Environment:</strong> ${environmentText}<br>
                <strong>Pre-sleep factors:</strong> ${preSleepText}
            </div>
            ${entry.notes ? `<div class="entry-notes">${entry.notes}</div>` : ''}
            <button class="delete-btn" onclick="deleteSleepEntry(${entry.id})">Delete</button>
        `;

        historyList.appendChild(entryDiv);
    });
}

function deleteSleepEntry(id) {
    if (confirm('Are you sure you want to delete this sleep entry?')) {
        sleepEntries = sleepEntries.filter(entry => entry.id !== id);
        localStorage.setItem('sleepStabilityEntries', JSON.stringify(sleepEntries));
        updateStats();
        updateAlert();
        updateChart();
        updateInsights();
        updateSleepHistory();
    }
}

// Update quality value display
document.getElementById('sleepQuality').addEventListener('input', function() {
    document.getElementById('qualityValue').textContent = this.value;
});

// Form submission
document.getElementById('sleepForm').addEventListener('submit', function(e) {
    e.preventDefault();
    logSleepSession();
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sleepDate').value = today;

    updateStats();
    updateAlert();
    updateChart();
    updateInsights();
    updateSleepHistory();
});