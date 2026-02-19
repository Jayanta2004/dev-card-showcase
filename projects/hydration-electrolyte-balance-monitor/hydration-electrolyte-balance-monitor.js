// hydration-electrolyte-balance-monitor.js

let hydrationEntries = JSON.parse(localStorage.getItem('hydrationElectrolyteEntries')) || [];

function logEntry() {
    const date = document.getElementById('logDate').value;
    const waterIntake = parseFloat(document.getElementById('waterIntake').value) || 0;
    const activityLevel = document.getElementById('activityLevel').value;
    const sodiumIntake = parseFloat(document.getElementById('sodiumIntake').value) || 0;
    const potassiumIntake = parseFloat(document.getElementById('potassiumIntake').value) || 0;
    const magnesiumIntake = parseFloat(document.getElementById('magnesiumIntake').value) || 0;
    const calciumIntake = parseFloat(document.getElementById('calciumIntake').value) || 0;
    const notes = document.getElementById('notes').value.trim();

    if (!date || waterIntake <= 0 || !activityLevel) {
        alert('Please fill in all required fields.');
        return;
    }

    // Check if entry already exists for this date
    const existingEntry = hydrationEntries.find(entry => entry.date === date);
    if (existingEntry) {
        if (!confirm('An entry already exists for this date. Do you want to update it?')) {
            return;
        }
        // Remove existing entry
        hydrationEntries = hydrationEntries.filter(entry => entry.date !== date);
    }

    // Calculate balance score
    const balanceScore = calculateBalanceScore({
        waterIntake,
        sodiumIntake,
        potassiumIntake,
        magnesiumIntake,
        calciumIntake,
        activityLevel
    });

    const entry = {
        id: Date.now(),
        date,
        waterIntake,
        activityLevel,
        sodiumIntake,
        potassiumIntake,
        magnesiumIntake,
        calciumIntake,
        balanceScore: parseFloat(balanceScore.toFixed(2)),
        notes
    };

    hydrationEntries.push(entry);

    // Sort by date
    hydrationEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Keep only last 50 entries
    if (hydrationEntries.length > 50) {
        hydrationEntries = hydrationEntries.slice(-50);
    }

    localStorage.setItem('hydrationElectrolyteEntries', JSON.stringify(hydrationEntries));

    // Clear form
    document.getElementById('logDate').value = '';
    document.getElementById('waterIntake').value = '';
    document.getElementById('activityLevel').value = '';
    document.getElementById('sodiumIntake').value = '';
    document.getElementById('potassiumIntake').value = '';
    document.getElementById('magnesiumIntake').value = '';
    document.getElementById('calciumIntake').value = '';
    document.getElementById('notes').value = '';

    updateStats();
    updateChart();
    updateInsights();
    updateEntryList();
}

function calculateBalanceScore(data) {
    const { waterIntake, sodiumIntake, potassiumIntake, magnesiumIntake, calciumIntake, activityLevel } = data;

    // Base water requirements by activity level (ml)
    const baseWater = {
        sedentary: 2000,
        light: 2500,
        moderate: 3000,
        intense: 3500,
        extreme: 4000
    };

    const requiredWater = baseWater[activityLevel] || 2500;

    // Electrolyte balance ratios (optimal ranges)
    const sodiumRatio = sodiumIntake / waterIntake; // mg/ml, optimal ~0.2-0.3
    const potassiumRatio = potassiumIntake / waterIntake; // mg/ml, optimal ~0.15-0.25
    const magnesiumRatio = magnesiumIntake / waterIntake; // mg/ml, optimal ~0.04-0.06
    const calciumRatio = calciumIntake / waterIntake; // mg/ml, optimal ~0.08-0.12

    // Water adequacy score (0-1)
    const waterScore = Math.min(waterIntake / requiredWater, 1);

    // Electrolyte balance score (0-1)
    const electrolyteScore = calculateElectrolyteScore({
        sodiumRatio,
        potassiumRatio,
        magnesiumRatio,
        calciumRatio
    });

    // Overall balance score (0-10)
    return (waterScore * 0.4 + electrolyteScore * 0.6) * 10;
}

function calculateElectrolyteScore(ratios) {
    const { sodiumRatio, potassiumRatio, magnesiumRatio, calciumRatio } = ratios;

    // Optimal ranges for ratios
    const optimalRanges = {
        sodium: { min: 0.15, max: 0.35 },
        potassium: { min: 0.12, max: 0.25 },
        magnesium: { min: 0.03, max: 0.07 },
        calcium: { min: 0.06, max: 0.15 }
    };

    const scores = [
        calculateRatioScore(sodiumRatio, optimalRanges.sodium),
        calculateRatioScore(potassiumRatio, optimalRanges.potassium),
        calculateRatioScore(magnesiumRatio, optimalRanges.magnesium),
        calculateRatioScore(calciumRatio, optimalRanges.calcium)
    ];

    // Average of electrolyte scores
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

function calculateRatioScore(actual, optimal) {
    if (actual === 0) return 0; // No intake = 0 score

    const { min, max } = optimal;
    const center = (min + max) / 2;

    if (actual >= min && actual <= max) {
        // Within optimal range - score based on distance from center
        const distance = Math.abs(actual - center);
        const range = max - min;
        return 1 - (distance / (range / 2));
    } else {
        // Outside optimal range - penalty based on distance
        const distance = actual < min ? min - actual : actual - max;
        const penalty = Math.min(distance / min, 1); // Cap penalty
        return Math.max(0, 1 - penalty);
    }
}

function getBalanceStatus(score) {
    if (score >= 8) return { status: 'Optimal', class: 'balance-optimal' };
    if (score >= 6) return { status: 'Good', class: 'balance-good' };
    if (score >= 4) return { status: 'Caution', class: 'balance-caution' };
    return { status: 'Critical', class: 'balance-critical' };
}

function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = hydrationEntries.find(entry => entry.date === today);

    if (todayEntry) {
        document.getElementById('currentWater').textContent = `${todayEntry.waterIntake}ml`;
        document.getElementById('electrolyteBalance').textContent = todayEntry.balanceScore.toFixed(1);
        document.getElementById('sodiumLevel').textContent = `${todayEntry.sodiumIntake}mg`;
        document.getElementById('potassiumLevel').textContent = `${todayEntry.potassiumIntake}mg`;
    } else {
        document.getElementById('currentWater').textContent = '0ml';
        document.getElementById('electrolyteBalance').textContent = '0.0';
        document.getElementById('sodiumLevel').textContent = '0mg';
        document.getElementById('potassiumLevel').textContent = '0mg';
    }
}

function updateChart() {
    const ctx = document.getElementById('hydrationChart').getContext('2d');

    // Prepare data for last 14 entries
    const chartEntries = hydrationEntries.slice(-14);

    const labels = chartEntries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString();
    });

    const waterData = chartEntries.map(entry => entry.waterIntake);
    const balanceData = chartEntries.map(entry => entry.balanceScore);
    const sodiumData = chartEntries.map(entry => entry.sodiumIntake);
    const potassiumData = chartEntries.map(entry => entry.potassiumIntake);

    // Reference lines
    const optimalBalanceLine = new Array(balanceData.length).fill(8);
    const adequateWaterLine = new Array(waterData.length).fill(2500); // Base adequate water

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Water Intake (ml)',
                data: waterData,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Balance Score',
                data: balanceData,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                yAxisID: 'y1',
                tension: 0.4
            }, {
                label: 'Sodium (mg)',
                data: sodiumData,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                yAxisID: 'y2',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Potassium (mg)',
                data: potassiumData,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                yAxisID: 'y2',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Optimal Balance (8+)',
                data: optimalBalanceLine,
                borderColor: '#28a745',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y1'
            }, {
                label: 'Adequate Water (2500ml)',
                data: adequateWaterLine,
                borderColor: '#17a2b8',
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
                        text: 'Water Intake (ml)'
                    },
                    min: 0
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Balance Score'
                    },
                    min: 0,
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
                        text: 'Electrolytes (mg)'
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

    if (hydrationEntries.length < 3) {
        insightsDiv.innerHTML = '<p>Log at least 3 days of hydration and electrolyte data to receive personalized balance insights and recommendations.</p>';
        return;
    }

    // Analyze patterns
    const recentEntries = hydrationEntries.slice(-7); // Last 7 days
    const avgBalance = recentEntries.reduce((sum, entry) => sum + entry.balanceScore, 0) / recentEntries.length;
    const avgWater = recentEntries.reduce((sum, entry) => sum + entry.waterIntake, 0) / recentEntries.length;
    const lowBalanceDays = recentEntries.filter(entry => entry.balanceScore < 6).length;

    let insights = '<p>Based on your recent hydration patterns:</p><ul>';

    const balanceStatus = getBalanceStatus(avgBalance);
    insights += `<li><strong>${balanceStatus.status} balance status.</strong> Your average balance score is ${avgBalance.toFixed(1)}/10.`;

    if (avgBalance < 6) {
        insights += ' Consider increasing water intake and balancing electrolyte consumption.';
    } else if (avgBalance >= 8) {
        insights += ' Great job maintaining optimal hydration balance!';
    }
    insights += '</li>';

    if (avgWater < 2000) {
        insights += '<li><strong>Low water intake detected.</strong> Aim for at least 2000-3000ml daily depending on your activity level. Dehydration can impair physical and cognitive performance.</li>';
    }

    if (lowBalanceDays > 3) {
        insights += '<li><strong>Frequent imbalance.</strong> More than half your recent entries show suboptimal electrolyte balance. Focus on consistent electrolyte intake, especially during intense activity.</li>';
    }

    // Activity-specific recommendations
    const activityLevels = recentEntries.map(entry => entry.activityLevel);
    const mostCommonActivity = activityLevels.reduce((a, b, i, arr) =>
        arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
    );

    if (mostCommonActivity === 'intense' || mostCommonActivity === 'extreme') {
        insights += '<li><strong>High activity level.</strong> With intense exercise, you may need additional electrolytes. Consider sports drinks or electrolyte supplements during long sessions.</li>';
    }

    insights += '<li><strong>Daily recommendations:</strong> Monitor urine color (pale yellow = good hydration), weigh yourself daily, and adjust intake based on sweat loss and environmental conditions.</li>';
    insights += '</ul>';

    insightsDiv.innerHTML = insights;
}

function updateEntryList() {
    const entryList = document.getElementById('entryList');
    entryList.innerHTML = '';

    // Show last 10 entries
    const recentEntries = hydrationEntries.slice(-10).reverse();

    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry-item';

        const balanceStatus = getBalanceStatus(entry.balanceScore);

        entryDiv.innerHTML = `
            <div class="entry-details">
                <div class="entry-date">${new Date(entry.date).toLocaleDateString()}</div>
                <div class="entry-detail">Water: ${entry.waterIntake}ml</div>
                <div class="entry-detail">Activity: ${entry.activityLevel}</div>
                <div class="entry-detail">Balance: <span class="${balanceStatus.class}">${entry.balanceScore.toFixed(1)}</span></div>
                <div class="entry-detail">Na: ${entry.sodiumIntake}mg</div>
                <div class="entry-detail">K: ${entry.potassiumIntake}mg</div>
                ${entry.notes ? `<div class="entry-notes">${entry.notes}</div>` : ''}
            </div>
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;

        entryList.appendChild(entryDiv);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this hydration entry?')) {
        hydrationEntries = hydrationEntries.filter(entry => entry.id !== id);
        localStorage.setItem('hydrationElectrolyteEntries', JSON.stringify(hydrationEntries));
        updateStats();
        updateChart();
        updateInsights();
        updateEntryList();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('logDate').value = today;

    // Form submission
    document.getElementById('hydrationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        logEntry();
    });

    updateStats();
    updateChart();
    updateInsights();
    updateEntryList();
});