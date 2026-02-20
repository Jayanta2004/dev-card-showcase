// screen-induced-fatigue-analyzer.js

let sessionEntries = JSON.parse(localStorage.getItem('screenFatigueEntries')) || [];

function updateFatigueValue() {
    const value = document.getElementById('fatigueLevel').value;
    document.getElementById('currentFatigueValue').textContent = value;
}

function logSession() {
    const date = document.getElementById('sessionDate').value;
    const screenTime = parseFloat(document.getElementById('screenTime').value);
    const fatigueLevel = parseInt(document.getElementById('fatigueLevel').value);

    if (!date || isNaN(screenTime) || screenTime < 0 || screenTime > 24) {
        alert('Please enter a valid date and screen time (0-24 hours).');
        return;
    }

    // Check if entry already exists for this date
    const existingEntry = sessionEntries.find(entry => entry.date === date);
    if (existingEntry) {
        if (!confirm('An entry already exists for this date. Do you want to update it?')) {
            return;
        }
        // Remove existing entry
        sessionEntries = sessionEntries.filter(entry => entry.date !== date);
    }

    // Collect symptoms
    const symptoms = [];
    const symptomIds = ['eyeStrain', 'headache', 'dryEyes', 'neckPain', 'blurredVision', 'insomnia'];
    symptomIds.forEach(id => {
        if (document.getElementById(id).checked) {
            symptoms.push(id);
        }
    });

    const activities = document.getElementById('activities').value.trim();

    const entry = {
        id: Date.now(),
        date,
        screenTime,
        fatigueLevel,
        symptoms,
        activities
    };

    sessionEntries.push(entry);

    // Sort by date
    sessionEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Keep only last 100 entries
    if (sessionEntries.length > 100) {
        sessionEntries = sessionEntries.slice(-100);
    }

    localStorage.setItem('screenFatigueEntries', JSON.stringify(sessionEntries));

    // Clear form
    document.getElementById('sessionDate').value = '';
    document.getElementById('screenTime').value = '';
    document.getElementById('fatigueLevel').value = 5;
    symptomIds.forEach(id => document.getElementById(id).checked = false);
    document.getElementById('activities').value = '';
    updateFatigueValue();

    updateStats();
    updateChart();
    updateRecommendations();
    updateSessionList();
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
    const totalSessions = sessionEntries.length;

    if (totalSessions === 0) {
        document.getElementById('avgScreenTime').textContent = '0.0h';
        document.getElementById('correlation').textContent = '0.00';
        document.getElementById('topSymptom').textContent = 'None';
        return;
    }

    // Calculate average screen time for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEntries = sessionEntries.filter(entry => new Date(entry.date) >= sevenDaysAgo);
    const avgScreenTime = recentEntries.length > 0
        ? (recentEntries.reduce((sum, entry) => sum + entry.screenTime, 0) / recentEntries.length).toFixed(1)
        : '0.0';

    // Calculate correlation between screen time and fatigue
    const screenTimes = sessionEntries.map(entry => entry.screenTime);
    const fatigueLevels = sessionEntries.map(entry => entry.fatigueLevel);
    const correlation = calculateCorrelation(screenTimes, fatigueLevels);

    // Find most common symptom
    const symptomCounts = {};
    sessionEntries.forEach(entry => {
        entry.symptoms.forEach(symptom => {
            symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        });
    });

    let topSymptom = 'None';
    let maxCount = 0;
    for (const [symptom, count] of Object.entries(symptomCounts)) {
        if (count > maxCount) {
            maxCount = count;
            topSymptom = formatSymptomName(symptom);
        }
    }

    document.getElementById('avgScreenTime').textContent = `${avgScreenTime}h`;
    document.getElementById('correlation').textContent = correlation;
    document.getElementById('topSymptom').textContent = topSymptom;
}

function formatSymptomName(symptomId) {
    const names = {
        eyeStrain: 'Eye Strain',
        headache: 'Headache',
        dryEyes: 'Dry Eyes',
        neckPain: 'Neck Pain',
        blurredVision: 'Blurred Vision',
        insomnia: 'Insomnia'
    };
    return names[symptomId] || symptomId;
}

function updateChart() {
    const ctx = document.getElementById('fatigueChart').getContext('2d');

    // Prepare data for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const chartEntries = sessionEntries.filter(entry => new Date(entry.date) >= thirtyDaysAgo);

    const labels = chartEntries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString();
    });

    const screenTimes = chartEntries.map(entry => entry.screenTime);
    const fatigueLevels = chartEntries.map(entry => entry.fatigueLevel);

    // Recommended screen time limit (8 hours)
    const recommendedLimit = new Array(screenTimes.length).fill(8);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Screen Time (hours)',
                data: screenTimes,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Fatigue Level',
                data: fatigueLevels,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                yAxisID: 'y1',
                tension: 0.4
            }, {
                label: 'Recommended Limit (8h)',
                data: recommendedLimit,
                borderColor: '#28a745',
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
                        text: 'Screen Time (hours)'
                    },
                    min: 0,
                    max: 12
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Fatigue Level (1-10)'
                    },
                    min: 1,
                    max: 10,
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

function updateRecommendations() {
    const recommendationsDiv = document.getElementById('recommendations');

    if (sessionEntries.length < 3) {
        recommendationsDiv.innerHTML = '<p>Log at least 3 sessions to get personalized recommendations for reducing screen-induced fatigue.</p>';
        return;
    }

    // Analyze patterns
    const avgScreenTime = sessionEntries.reduce((sum, entry) => sum + entry.screenTime, 0) / sessionEntries.length;
    const avgFatigue = sessionEntries.reduce((sum, entry) => sum + entry.fatigueLevel, 0) / sessionEntries.length;
    const correlation = parseFloat(calculateCorrelation(
        sessionEntries.map(e => e.screenTime),
        sessionEntries.map(e => e.fatigueLevel)
    ));

    // Count symptoms
    const symptomCounts = {};
    sessionEntries.forEach(entry => {
        entry.symptoms.forEach(symptom => {
            symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        });
    });

    let recommendations = '<p>Based on your screen usage patterns:</p><ul>';

    if (avgScreenTime > 8) {
        recommendations += '<li>Consider reducing screen time below 8 hours daily to prevent fatigue accumulation.</li>';
    }

    if (correlation > 0.5) {
        recommendations += '<li>Strong correlation between screen time and fatigue - try the 20-20-20 rule (every 20 minutes, look 20 feet away for 20 seconds).</li>';
    }

    if (avgFatigue > 7) {
        recommendations += '<li>High fatigue levels detected - ensure adequate sleep and consider blue light filters.</li>';
    }

    // Symptom-specific recommendations
    if (symptomCounts.eyeStrain > sessionEntries.length * 0.5) {
        recommendations += '<li>Frequent eye strain - use proper lighting and take regular eye breaks.</li>';
    }

    if (symptomCounts.headache > sessionEntries.length * 0.3) {
        recommendations += '<li>Headache pattern detected - check your screen position and font size.</li>';
    }

    if (symptomCounts.neckPain > sessionEntries.length * 0.4) {
        recommendations += '<li>Neck pain common - adjust monitor height so eyes are level with top of screen.</li>';
    }

    if (symptomCounts.dryEyes > sessionEntries.length * 0.3) {
        recommendations += '<li>Dry eyes frequently reported - use artificial tears and follow the 20-20-20 rule.</li>';
    }

    recommendations += '<li>Consider short walks or stretching every 1-2 hours during screen sessions.</li>';
    recommendations += '</ul>';

    recommendationsDiv.innerHTML = recommendations;
}

function updateSessionList() {
    const sessionList = document.getElementById('sessionList');
    sessionList.innerHTML = '';

    // Show last 10 entries
    const recentEntries = sessionEntries.slice(-10).reverse();

    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'session-entry';

        const fatigueClass = entry.fatigueLevel <= 3 ? 'fatigue-low' :
                           entry.fatigueLevel <= 7 ? 'fatigue-medium' : 'fatigue-high';

        const symptomText = entry.symptoms.length > 0
            ? 'Symptoms: ' + entry.symptoms.map(formatSymptomName).join(', ')
            : 'No symptoms reported';

        entryDiv.innerHTML = `
            <div class="date">${new Date(entry.date).toLocaleDateString()}</div>
            <div class="metrics">
                <div class="metric">
                    <div class="label">Screen Time</div>
                    <div class="value">${entry.screenTime}h</div>
                </div>
                <div class="metric">
                    <div class="label">Fatigue</div>
                    <div class="value ${fatigueClass}">${entry.fatigueLevel}/10</div>
                </div>
            </div>
            <div class="symptoms">${symptomText}</div>
            ${entry.activities ? `<div class="activities">Activities: ${entry.activities}</div>` : ''}
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;

        sessionList.appendChild(entryDiv);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this session?')) {
        sessionEntries = sessionEntries.filter(entry => entry.id !== id);
        localStorage.setItem('screenFatigueEntries', JSON.stringify(sessionEntries));
        updateStats();
        updateChart();
        updateRecommendations();
        updateSessionList();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sessionDate').value = today;

    updateFatigueValue();
    updateStats();
    updateChart();
    updateRecommendations();
    updateSessionList();
});