// hormonal-rhythm-consistency-monitor.js

let hormonalEntries = JSON.parse(localStorage.getItem('hormonalEntries')) || [];

// Reference ranges for hormonal markers (approximate, age/gender dependent)
const HORMONE_RANGES = {
    cortisol: {
        morning: { min: 10, max: 20 },
        evening: { min: 2, max: 5 },
        unit: 'ng/mL'
    },
    testosterone: {
        male: { min: 270, max: 1070 },
        female: { min: 15, max: 70 },
        unit: 'ng/dL'
    },
    estrogen: {
        female: { min: 30, max: 400 }, // Varies by cycle phase
        unit: 'pg/mL'
    },
    progesterone: {
        female: { min: 0.1, max: 25 }, // Varies by cycle phase
        unit: 'ng/mL'
    },
    melatonin: {
        night: { min: 10, max: 100 },
        day: { min: 0, max: 10 },
        unit: 'pg/mL'
    },
    dhea: {
        adult: { min: 80, max: 560 }, // Age-dependent
        unit: 'µg/dL'
    },
    thyroid: {
        normal: { min: 0.27, max: 4.2 },
        unit: 'µIU/mL'
    },
    insulin: {
        fasting: { min: 2.6, max: 24.9 },
        unit: 'µIU/mL'
    }
};

function logHormonalEntry() {
    const dateTime = document.getElementById('entryDate').value;
    const notes = document.getElementById('hormonalNotes').value.trim();

    if (!dateTime) {
        alert('Please select a date and time.');
        return;
    }

    // Get hormone values
    const hormones = {};
    const hormoneInputs = ['cortisol', 'testosterone', 'estrogen', 'progesterone', 'melatonin', 'dhea', 'thyroid', 'insulin'];

    let hasData = false;
    hormoneInputs.forEach(hormone => {
        const value = parseFloat(document.getElementById(hormone).value);
        if (!isNaN(value) && value > 0) {
            hormones[hormone] = value;
            hasData = true;
        }
    });

    if (!hasData) {
        alert('Please enter at least one hormonal marker value.');
        return;
    }

    // Check if entry already exists for this date/time
    const entryTime = new Date(dateTime).getTime();
    const existingEntry = hormonalEntries.find(entry =>
        Math.abs(new Date(entry.dateTime).getTime() - entryTime) < 60000 // Within 1 minute
    );

    if (existingEntry) {
        if (!confirm('An entry already exists for this date/time. Do you want to update it?')) {
            return;
        }
        // Remove existing entry
        hormonalEntries = hormonalEntries.filter(entry => entry.id !== existingEntry.id);
    }

    // Calculate entry metrics
    const entryMetrics = calculateEntryMetrics(hormones, dateTime);

    const entry = {
        id: Date.now(),
        dateTime,
        hormones,
        metrics: entryMetrics,
        notes
    };

    hormonalEntries.push(entry);

    // Sort by date/time (most recent first)
    hormonalEntries.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

    // Keep only last 100 entries
    if (hormonalEntries.length > 100) {
        hormonalEntries = hormonalEntries.slice(0, 100);
    }

    localStorage.setItem('hormonalEntries', JSON.stringify(hormonalEntries));

    // Clear form
    document.getElementById('entryDate').value = '';
    hormoneInputs.forEach(hormone => {
        document.getElementById(hormone).value = '';
    });
    document.getElementById('hormonalNotes').value = '';

    updateStats();
    updateAlert();
    updateChart();
    updateInsights();
    updateEntryHistory();
}

function calculateEntryMetrics(hormones, dateTime) {
    const entryTime = new Date(dateTime);
    const hour = entryTime.getHours();

    // Determine time of day
    let timeOfDay = 'day';
    if (hour >= 22 || hour <= 6) timeOfDay = 'night';
    else if (hour >= 6 && hour <= 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour <= 18) timeOfDay = 'afternoon';
    else timeOfDay = 'evening';

    // Calculate balance scores for each hormone
    const balanceScores = {};
    Object.keys(hormones).forEach(hormone => {
        const value = hormones[hormone];
        const ranges = HORMONE_RANGES[hormone];

        if (ranges) {
            let range;
            if (hormone === 'cortisol') {
                range = timeOfDay === 'morning' ? ranges.morning : ranges.evening;
            } else if (hormone === 'melatonin') {
                range = timeOfDay === 'night' ? ranges.night : ranges.day;
            } else if (hormone === 'testosterone') {
                range = ranges.male; // Default to male, could be made configurable
            } else if (['estrogen', 'progesterone'].includes(hormone)) {
                range = ranges.female;
            } else {
                range = ranges.normal || ranges.adult || ranges.fasting;
            }

            if (range) {
                if (value >= range.min && value <= range.max) {
                    balanceScores[hormone] = 'normal';
                } else if (value < range.min * 0.8 || value > range.max * 1.2) {
                    balanceScores[hormone] = 'concerning';
                } else {
                    balanceScores[hormone] = 'borderline';
                }
            }
        }
    });

    // Calculate overall balance score
    const balanceValues = Object.values(balanceScores);
    let overallBalance = 'normal';
    if (balanceValues.includes('concerning')) {
        overallBalance = 'concerning';
    } else if (balanceValues.includes('borderline')) {
        overallBalance = 'borderline';
    }

    // Calculate cortisol awakening response if morning cortisol available
    let cortisolAwakening = null;
    if (hormones.cortisol && timeOfDay === 'morning') {
        // This would typically compare to evening cortisol, but we'll calculate based on range
        const cortisolRange = HORMONE_RANGES.cortisol.morning;
        cortisolAwakening = ((hormones.cortisol - cortisolRange.min) / (cortisolRange.max - cortisolRange.min)) * 100;
    }

    return {
        timeOfDay,
        balanceScores,
        overallBalance,
        cortisolAwakening: cortisolAwakening ? parseFloat(cortisolAwakening.toFixed(1)) : null
    };
}

function updateStats() {
    const totalEntries = hormonalEntries.length;

    if (totalEntries === 0) {
        document.getElementById('rhythmScore').textContent = '0%';
        document.getElementById('balanceStatus').textContent = 'Unknown';
        document.getElementById('balanceStatus').className = 'stat-value';
        document.getElementById('melatoninPeak').textContent = 'Unknown';
        document.getElementById('totalEntries').textContent = '0';
        return;
    }

    // Calculate rhythm consistency score
    const rhythmScore = calculateRhythmConsistency();

    // Calculate overall balance status
    const recentEntries = hormonalEntries.slice(0, 10);
    const balanceStatuses = recentEntries.map(entry => entry.metrics.overallBalance);
    let overallStatus = 'normal';
    if (balanceStatuses.includes('concerning')) {
        overallStatus = 'concerning';
    } else if (balanceStatuses.includes('borderline')) {
        overallStatus = 'borderline';
    }

    // Find melatonin peak time
    const melatoninEntries = hormonalEntries.filter(entry => entry.hormones.melatonin);
    let melatoninPeak = 'Unknown';
    if (melatoninEntries.length > 0) {
        const peakEntry = melatoninEntries.reduce((max, entry) =>
            entry.hormones.melatonin > max.hormones.melatonin ? entry : max
        );
        const peakTime = new Date(peakEntry.dateTime);
        melatoninPeak = peakTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Update display
    document.getElementById('rhythmScore').textContent = `${rhythmScore}%`;
    document.getElementById('balanceStatus').textContent = overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1);
    document.getElementById('balanceStatus').className = `stat-value balance-${overallStatus}`;
    document.getElementById('melatoninPeak').textContent = melatoninPeak;
    document.getElementById('totalEntries').textContent = totalEntries;
}

function calculateRhythmConsistency() {
    if (hormonalEntries.length < 7) return 0;

    // Analyze cortisol and melatonin patterns for rhythm consistency
    const cortisolEntries = hormonalEntries.filter(entry => entry.hormones.cortisol);
    const melatoninEntries = hormonalEntries.filter(entry => entry.hormones.melatonin);

    let consistencyScore = 0;
    let factors = 0;

    // Cortisol rhythm consistency (morning high, evening low)
    if (cortisolEntries.length >= 4) {
        const morningCortisol = cortisolEntries
            .filter(entry => entry.metrics.timeOfDay === 'morning')
            .map(entry => entry.hormones.cortisol);
        const eveningCortisol = cortisolEntries
            .filter(entry => entry.metrics.timeOfDay === 'evening')
            .map(entry => entry.hormones.cortisol);

        if (morningCortisol.length > 0 && eveningCortisol.length > 0) {
            const avgMorning = morningCortisol.reduce((a, b) => a + b) / morningCortisol.length;
            const avgEvening = eveningCortisol.reduce((a, b) => a + b) / eveningCortisol.length;

            // Morning should be higher than evening
            const cortisolRatio = avgEvening / avgMorning;
            const cortisolConsistency = Math.max(0, Math.min(100, (0.3 - cortisolRatio) / 0.3 * 100));
            consistencyScore += cortisolConsistency;
            factors++;
        }
    }

    // Melatonin rhythm consistency (high at night, low during day)
    if (melatoninEntries.length >= 4) {
        const nightMelatonin = melatoninEntries
            .filter(entry => entry.metrics.timeOfDay === 'night')
            .map(entry => entry.hormones.melatonin);
        const dayMelatonin = melatoninEntries
            .filter(entry => ['morning', 'afternoon', 'evening'].includes(entry.metrics.timeOfDay))
            .map(entry => entry.hormones.melatonin);

        if (nightMelatonin.length > 0 && dayMelatonin.length > 0) {
            const avgNight = nightMelatonin.reduce((a, b) => a + b) / nightMelatonin.length;
            const avgDay = dayMelatonin.reduce((a, b) => a + b) / dayMelatonin.length;

            // Night should be much higher than day
            const melatoninRatio = avgDay / avgNight;
            const melatoninConsistency = Math.max(0, Math.min(100, (0.2 - melatoninRatio) / 0.2 * 100));
            consistencyScore += melatoninConsistency;
            factors++;
        }
    }

    // Timing consistency (regular measurement times)
    const allTimes = hormonalEntries.map(entry => {
        const time = new Date(entry.dateTime);
        return time.getHours() * 60 + time.getMinutes(); // Minutes since midnight
    });

    if (allTimes.length >= 7) {
        // Calculate standard deviation of measurement times
        const avgTime = allTimes.reduce((a, b) => a + b) / allTimes.length;
        const timeVariance = allTimes.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / allTimes.length;
        const timeStdDev = Math.sqrt(timeVariance);

        // Lower standard deviation = more consistent timing
        const timingConsistency = Math.max(0, Math.min(100, (120 - timeStdDev) / 120 * 100));
        consistencyScore += timingConsistency;
        factors++;
    }

    return factors > 0 ? Math.round(consistencyScore / factors) : 0;
}

function updateAlert() {
    const alertDiv = document.getElementById('hormonalAlert');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');

    if (hormonalEntries.length < 3) {
        alertDiv.style.display = 'none';
        return;
    }

    const recentEntries = hormonalEntries.slice(0, 7);
    const rhythmScore = calculateRhythmConsistency();
    const balanceIssues = recentEntries.filter(entry => entry.metrics.overallBalance === 'concerning');

    if (rhythmScore < 40) {
        alertDiv.style.display = 'flex';
        alertTitle.textContent = 'Hormonal Rhythm Disruption Detected';
        alertMessage.textContent = `Your hormonal rhythm consistency is low (${rhythmScore}%). This may indicate circadian rhythm disruption, stress, or sleep issues. Consider improving sleep hygiene, reducing blue light exposure, and maintaining consistent meal/sleep times.`;
    } else if (balanceIssues.length >= 3) {
        alertDiv.style.display = 'flex';
        alertTitle.textContent = 'Hormonal Imbalance Detected';
        alertMessage.textContent = 'Multiple recent hormonal markers are outside normal ranges. Consider consulting with a healthcare provider for comprehensive hormonal testing and potential treatment options.';
    } else if (rhythmScore < 60) {
        alertDiv.style.display = 'flex';
        alertTitle.textContent = 'Hormonal Rhythm Needs Attention';
        alertMessage.textContent = `Your hormonal rhythm consistency could be improved (${rhythmScore}%). Focus on maintaining consistent sleep/wake times and reducing stress to optimize hormonal health.`;
    } else {
        alertDiv.style.display = 'none';
    }
}

function updateChart() {
    const ctx = document.getElementById('hormonalChart').getContext('2d');

    // Prepare data for last 20 entries
    const chartEntries = hormonalEntries.slice(0, 20).reverse();

    const labels = chartEntries.map(entry => {
        const date = new Date(entry.dateTime);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    // Prepare datasets for each hormone
    const datasets = [];
    const hormones = ['cortisol', 'testosterone', 'estrogen', 'progesterone', 'melatonin', 'dhea', 'thyroid', 'insulin'];
    const colors = ['#4fd1ff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#17a2b8', '#fd7e14', '#e83e8c'];

    hormones.forEach((hormone, index) => {
        const data = chartEntries.map(entry => entry.hormones[hormone] || null);
        if (data.some(value => value !== null)) {
            datasets.push({
                label: hormone.charAt(0).toUpperCase() + hormone.slice(1),
                data: data,
                borderColor: colors[index],
                backgroundColor: colors[index] + '20',
                yAxisID: 'y',
                tension: 0.4,
                hidden: index > 2 // Hide all but first 3 by default
            });
        }
    });

    // Add reference ranges as background zones for cortisol and melatonin
    const cortisolMorning = new Array(chartEntries.length).fill(HORMONE_RANGES.cortisol.morning.max);
    const cortisolEvening = new Array(chartEntries.length).fill(HORMONE_RANGES.cortisol.evening.max);
    const melatoninNight = new Array(chartEntries.length).fill(HORMONE_RANGES.melatonin.night.max);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
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
                        text: 'Hormone Levels'
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

    if (hormonalEntries.length < 5) {
        insightsDiv.innerHTML = '<p>Log at least 5 hormonal entries to receive personalized insights about your hormonal health and rhythm patterns.</p>';
        return;
    }

    // Analyze hormonal patterns
    const recentEntries = hormonalEntries.slice(0, 14); // Last 2 weeks
    const rhythmScore = calculateRhythmConsistency();

    // Analyze hormone trends
    const hormoneTrends = {};
    const hormones = ['cortisol', 'testosterone', 'estrogen', 'progesterone', 'melatonin', 'dhea', 'thyroid', 'insulin'];

    hormones.forEach(hormone => {
        const hormoneEntries = recentEntries.filter(entry => entry.hormones[hormone]);
        if (hormoneEntries.length >= 3) {
            const values = hormoneEntries.map(entry => entry.hormones[hormone]);
            const trend = values.length > 1 ? values[values.length - 1] - values[0] : 0;
            hormoneTrends[hormone] = trend;
        }
    });

    // Generate insights
    let insights = '<p>Based on your hormonal data analysis:</p><ul>';

    if (rhythmScore >= 80) {
        insights += '<li><strong>Excellent hormonal rhythm consistency!</strong> Your circadian rhythm is well-synchronized, which supports optimal hormonal health and metabolic function.</li>';
    } else if (rhythmScore >= 60) {
        insights += '<li><strong>Good hormonal rhythm.</strong> Your hormonal patterns show reasonable consistency. Continue maintaining regular sleep and meal times.</li>';
    } else if (rhythmScore >= 40) {
        insights += '<li><strong>Hormonal rhythm needs improvement.</strong> Consider focusing on sleep hygiene, consistent meal timing, and stress reduction to improve rhythm consistency.</li>';
    } else {
        insights += '<li><strong>Hormonal rhythm disruption detected.</strong> Your circadian rhythm appears disrupted. Prioritize consistent sleep/wake times, reduce artificial light exposure, and consider professional consultation.</li>';
    }

    // Hormone-specific insights
    if (hormoneTrends.cortisol !== undefined) {
        if (Math.abs(hormoneTrends.cortisol) > 5) {
            insights += '<li><strong>Cortisol levels changing.</strong> Significant cortisol trend detected. Monitor stress levels and ensure adequate recovery time.</li>';
        }
    }

    if (hormoneTrends.melatonin !== undefined) {
        if (hormoneTrends.melatonin < -10) {
            insights += '<li><strong>Melatonin declining.</strong> Evening melatonin levels are decreasing. Improve sleep hygiene and reduce blue light exposure before bed.</li>';
        }
    }

    if (hormoneTrends.testosterone !== undefined) {
        if (hormoneTrends.testosterone < -50) {
            insights += '<li><strong>Testosterone trending down.</strong> Consider optimizing sleep, exercise, and nutrition to support testosterone production.</li>';
        }
    }

    // Balance insights
    const balanceIssues = recentEntries.filter(entry =>
        Object.values(entry.metrics.balanceScores).includes('concerning')
    );

    if (balanceIssues.length > recentEntries.length * 0.3) {
        insights += '<li><strong>Multiple hormonal imbalances detected.</strong> Several hormonal markers are outside optimal ranges. Consider comprehensive hormonal testing with a healthcare provider.</li>';
    }

    // Timing insights
    const morningEntries = recentEntries.filter(entry => entry.metrics.timeOfDay === 'morning').length;
    const eveningEntries = recentEntries.filter(entry => entry.metrics.timeOfDay === 'evening').length;
    const nightEntries = recentEntries.filter(entry => entry.metrics.timeOfDay === 'night').length;

    if (morningEntries < eveningEntries * 0.5) {
        insights += '<li><strong>Morning cortisol monitoring recommended.</strong> You have fewer morning measurements. Morning cortisol is important for assessing stress response.</li>';
    }

    if (nightEntries < morningEntries * 0.3) {
        insights += '<li><strong>Nighttime melatonin tracking.</strong> Consider measuring melatonin levels at night to assess sleep quality and circadian rhythm.</li>';
    }

    insights += '<li><strong>Optimal timing:</strong> Measure cortisol in morning (6-9 AM) and evening (8-11 PM), melatonin at night (10 PM-2 AM), other hormones at consistent times.</li>';
    insights += '<li><strong>Lifestyle factors:</strong> Sleep quality, stress management, exercise timing, and diet all influence hormonal rhythms. Track these alongside hormone levels.</li>';

    insights += '</ul>';

    insightsDiv.innerHTML = insights;
}

function updateEntryHistory() {
    const historyDiv = document.getElementById('entryHistory');
    historyDiv.innerHTML = '';

    if (hormonalEntries.length === 0) {
        historyDiv.innerHTML = '<p class="no-data">No hormonal entries logged yet. Start by logging your first hormonal markers above.</p>';
        return;
    }

    // Show last 10 entries
    const recentEntries = hormonalEntries.slice(0, 10);

    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry-item';

        const entryDate = new Date(entry.dateTime);
        const hormonesList = Object.entries(entry.hormones)
            .map(([hormone, value]) => {
                const unit = HORMONE_RANGES[hormone]?.unit || '';
                const balanceClass = entry.metrics.balanceScores[hormone] || 'normal';
                return `
                    <div class="hormone-value">
                        <span class="hormone-name">${hormone.charAt(0).toUpperCase() + hormone.slice(1)}</span>
                        <span class="hormone-level balance-${balanceClass}">${value} ${unit}</span>
                    </div>
                `;
            })
            .join('');

        entryDiv.innerHTML = `
            <div class="entry-header">
                <div class="entry-date">${entryDate.toLocaleDateString()}</div>
                <div class="entry-time">${entryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${entry.metrics.timeOfDay})</div>
            </div>
            <div class="hormone-values">
                ${hormonesList}
            </div>
            ${entry.notes ? `<div class="entry-notes">${entry.notes}</div>` : ''}
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete Entry</button>
        `;

        historyDiv.appendChild(entryDiv);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this hormonal entry?')) {
        hormonalEntries = hormonalEntries.filter(entry => entry.id !== id);
        localStorage.setItem('hormonalEntries', JSON.stringify(hormonalEntries));
        updateStats();
        updateAlert();
        updateChart();
        updateInsights();
        updateEntryHistory();
    }
}

// Event listeners
document.getElementById('hormonalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    logHormonalEntry();
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set current date/time as default
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('entryDate').value = now.toISOString().slice(0, 16);

    updateStats();
    updateAlert();
    updateChart();
    updateInsights();
    updateEntryHistory();
});