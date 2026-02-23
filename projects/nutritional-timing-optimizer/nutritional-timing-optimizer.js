// nutritional-timing-optimizer.js

let nutritionEntries = JSON.parse(localStorage.getItem('nutritionTimingEntries')) || [];

function logMeal() {
    const date = document.getElementById('mealDate').value;
    const time = document.getElementById('mealTime').value;
    const mealType = document.getElementById('mealType').value;
    const proteinGrams = parseFloat(document.getElementById('proteinGrams').value);
    const carbsGrams = parseFloat(document.getElementById('carbsGrams').value);
    const fatGrams = parseFloat(document.getElementById('fatGrams').value);
    const calories = parseInt(document.getElementById('calories').value);
    const mealPurpose = document.getElementById('mealPurpose').value;
    const energyLevel = parseInt(document.getElementById('energyLevel').value);
    const notes = document.getElementById('mealNotes').value.trim();

    if (!date || !time || !mealType || !mealPurpose) {
        alert('Please fill in all required fields.');
        return;
    }

    // Check if entry already exists for this date and time
    const existingEntry = nutritionEntries.find(entry =>
        entry.date === date && entry.time === time
    );
    if (existingEntry) {
        if (!confirm('An entry already exists for this date and time. Do you want to update it?')) {
            return;
        }
        // Remove existing entry
        nutritionEntries = nutritionEntries.filter(entry =>
            !(entry.date === date && entry.time === time)
        );
    }

    // Calculate timing score based on optimal nutrient windows
    const timingScore = calculateTimingScore(time, mealType, proteinGrams, carbsGrams, mealPurpose);

    // Calculate macronutrient ratios
    const totalMacros = proteinGrams + carbsGrams + fatGrams;
    const proteinPercent = totalMacros > 0 ? (proteinGrams / totalMacros) * 100 : 0;
    const carbsPercent = totalMacros > 0 ? (carbsGrams / totalMacros) * 100 : 0;
    const fatPercent = totalMacros > 0 ? (fatGrams / totalMacros) * 100 : 0;

    const entry = {
        id: Date.now(),
        date,
        time,
        mealType,
        proteinGrams,
        carbsGrams,
        fatGrams,
        calories,
        mealPurpose,
        energyLevel,
        timingScore: parseFloat(timingScore.toFixed(1)),
        proteinPercent: parseFloat(proteinPercent.toFixed(1)),
        carbsPercent: parseFloat(carbsPercent.toFixed(1)),
        fatPercent: parseFloat(fatPercent.toFixed(1)),
        notes
    };

    nutritionEntries.push(entry);

    // Sort by date and time
    nutritionEntries.sort((a, b) => {
        const dateCompare = new Date(a.date) - new Date(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
    });

    // Keep only last 50 entries
    if (nutritionEntries.length > 50) {
        nutritionEntries = nutritionEntries.slice(-50);
    }

    localStorage.setItem('nutritionTimingEntries', JSON.stringify(nutritionEntries));

    // Clear form
    document.getElementById('mealDate').value = '';
    document.getElementById('mealTime').value = '';
    document.getElementById('mealType').value = '';
    document.getElementById('proteinGrams').value = '';
    document.getElementById('carbsGrams').value = '';
    document.getElementById('fatGrams').value = '';
    document.getElementById('calories').value = '';
    document.getElementById('mealPurpose').value = '';
    document.getElementById('energyLevel').value = 7;
    document.getElementById('energyValue').textContent = '7';
    document.getElementById('mealNotes').value = '';

    updateStats();
    updateChart();
    updateInsights();
    updateMealList();
}

function calculateTimingScore(time, mealType, proteinGrams, carbsGrams, purpose) {
    const hour = parseInt(time.split(':')[0]);
    let score = 50; // Base score

    // Optimal timing windows for different nutrients and purposes
    switch (purpose) {
        case 'energy':
            // Higher carbs in morning/afternoon for energy
            if (hour >= 6 && hour <= 14) score += 20;
            else if (hour >= 15 && hour <= 18) score += 10;
            else score -= 10;
            if (carbsGrams > proteinGrams) score += 15;
            break;

        case 'recovery':
            // Post-workout: higher carbs and protein
            if (hour >= 17 && hour <= 21) score += 20;
            else if (hour >= 14 && hour <= 16) score += 10;
            if (proteinGrams >= 20 && carbsGrams >= 30) score += 15;
            break;

        case 'performance':
            // Pre-workout: balanced macros 2-3 hours before
            if (hour >= 14 && hour <= 18) score += 20;
            else if (hour >= 11 && hour <= 13) score += 10;
            if (proteinGrams >= 15 && carbsGrams >= 40) score += 15;
            break;

        case 'fat-loss':
            // Higher protein, moderate carbs, earlier in day
            if (hour >= 6 && hour <= 16) score += 15;
            if (proteinGrams >= 25 && carbsGrams <= 50) score += 15;
            break;

        case 'muscle-gain':
            // Frequent protein feedings throughout day
            if (proteinGrams >= 20) score += 20;
            if (hour >= 6 && hour <= 22) score += 10;
            break;

        case 'maintenance':
            // Flexible timing, balanced macros
            score += 10;
            if (proteinGrams >= 15 && carbsGrams >= 20) score += 10;
            break;
    }

    // Meal type alignment
    switch (mealType) {
        case 'breakfast':
            if (hour >= 6 && hour <= 10) score += 10;
            else score -= 5;
            break;
        case 'lunch':
            if (hour >= 11 && hour <= 15) score += 10;
            else score -= 5;
            break;
        case 'dinner':
            if (hour >= 17 && hour <= 21) score += 10;
            else score -= 5;
            break;
    }

    // Cap score between 0-100
    return Math.max(0, Math.min(100, score));
}

function getTimingStatus(score) {
    if (score >= 80) return { status: 'Excellent', class: 'timing-excellent' };
    if (score >= 65) return { status: 'Good', class: 'timing-good' };
    if (score >= 45) return { status: 'Fair', class: 'timing-fair' };
    return { status: 'Poor', class: 'timing-poor' };
}

function updateStats() {
    const totalMeals = nutritionEntries.length;

    if (totalMeals === 0) {
        document.getElementById('timingScore').textContent = '0/100';
        document.getElementById('proteinDistribution').textContent = 'Unknown';
        document.getElementById('carbTiming').textContent = 'Unknown';
        document.getElementById('totalMeals').textContent = '0';
        return;
    }

    // Average timing score
    const avgTimingScore = nutritionEntries.reduce((sum, entry) => sum + entry.timingScore, 0) / totalMeals;

    // Protein distribution analysis (how even protein is spread throughout the day)
    const proteinDistribution = analyzeProteinDistribution();

    // Carb timing analysis
    const carbTiming = analyzeCarbTiming();

    document.getElementById('timingScore').textContent = `${avgTimingScore.toFixed(1)}/100`;
    document.getElementById('proteinDistribution').textContent = proteinDistribution;
    document.getElementById('carbTiming').textContent = carbTiming;
    document.getElementById('totalMeals').textContent = totalMeals;
}

function analyzeProteinDistribution() {
    if (nutritionEntries.length < 3) return 'Insufficient data';

    // Group by time periods
    const morningProtein = nutritionEntries
        .filter(entry => parseInt(entry.time.split(':')[0]) < 12)
        .reduce((sum, entry) => sum + entry.proteinGrams, 0);

    const afternoonProtein = nutritionEntries
        .filter(entry => {
            const hour = parseInt(entry.time.split(':')[0]);
            return hour >= 12 && hour < 18;
        })
        .reduce((sum, entry) => sum + entry.proteinGrams, 0);

    const eveningProtein = nutritionEntries
        .filter(entry => parseInt(entry.time.split(':')[0]) >= 18)
        .reduce((sum, entry) => sum + entry.proteinGrams, 0);

    const totalProtein = morningProtein + afternoonProtein + eveningProtein;
    if (totalProtein === 0) return 'No protein logged';

    // Calculate evenness (lower coefficient of variation is better)
    const periods = [morningProtein, afternoonProtein, eveningProtein].filter(p => p > 0);
    if (periods.length < 2) return 'Limited data';

    const mean = periods.reduce((sum, p) => sum + p, 0) / periods.length;
    const variance = periods.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / periods.length;
    const cv = Math.sqrt(variance) / mean;

    if (cv < 0.3) return 'Very Even';
    if (cv < 0.5) return 'Even';
    if (cv < 0.7) return 'Uneven';
    return 'Very Uneven';
}

function analyzeCarbTiming() {
    if (nutritionEntries.length < 3) return 'Insufficient data';

    // Check if carbs are concentrated in morning/afternoon (optimal for energy)
    const morningCarbs = nutritionEntries
        .filter(entry => parseInt(entry.time.split(':')[0]) < 12)
        .reduce((sum, entry) => sum + entry.carbsGrams, 0);

    const afternoonCarbs = nutritionEntries
        .filter(entry => {
            const hour = parseInt(entry.time.split(':')[0]);
            return hour >= 12 && hour < 18;
        })
        .reduce((sum, entry) => sum + entry.carbsGrams, 0);

    const eveningCarbs = nutritionEntries
        .filter(entry => parseInt(entry.time.split(':')[0]) >= 18)
        .reduce((sum, entry) => sum + entry.carbsGrams, 0);

    const totalCarbs = morningCarbs + afternoonCarbs + eveningCarbs;
    if (totalCarbs === 0) return 'No carbs logged';

    const morningAfternoonPercent = ((morningCarbs + afternoonCarbs) / totalCarbs) * 100;

    if (morningAfternoonPercent >= 70) return 'Optimal';
    if (morningAfternoonPercent >= 50) return 'Good';
    if (morningAfternoonPercent >= 30) return 'Fair';
    return 'Poor';
}

function updateChart() {
    const ctx = document.getElementById('nutritionChart').getContext('2d');

    // Prepare data for last 20 entries
    const chartEntries = nutritionEntries.slice(-20);

    const labels = chartEntries.map(entry => {
        const date = new Date(entry.date);
        const time = entry.time;
        return `${date.toLocaleDateString()} ${time}`;
    });

    const timingScores = chartEntries.map(entry => entry.timingScore);
    const proteinGrams = chartEntries.map(entry => entry.proteinGrams);
    const carbsGrams = chartEntries.map(entry => entry.carbsGrams);
    const energyLevels = chartEntries.map(entry => entry.energyLevel);

    // Reference lines
    const excellentTiming = new Array(timingScores.length).fill(80);
    const goodTiming = new Array(timingScores.length).fill(65);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Timing Score',
                data: timingScores,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Protein (g)',
                data: proteinGrams,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Carbs (g)',
                data: carbsGrams,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Energy Level',
                data: energyLevels,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                yAxisID: 'y2',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Excellent Timing (80+)',
                data: excellentTiming,
                borderColor: '#28a745',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Good Timing (65+)',
                data: goodTiming,
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
                        text: 'Timing Score'
                    },
                    min: 0,
                    max: 100
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Macronutrients (g)'
                    },
                    min: 0,
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
                        text: 'Energy Level (1-10)'
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

function updateInsights() {
    const insightsDiv = document.getElementById('insights');

    if (nutritionEntries.length < 5) {
        insightsDiv.innerHTML = '<p>Log at least 5 meals to receive personalized insights about your nutritional timing patterns and optimization recommendations.</p>';
        return;
    }

    // Analyze patterns
    const recentEntries = nutritionEntries.slice(-10);
    const avgTimingScore = recentEntries.reduce((sum, entry) => sum + entry.timingScore, 0) / recentEntries.length;
    const avgEnergyLevel = recentEntries.reduce((sum, entry) => sum + entry.energyLevel, 0) / recentEntries.length;

    // Analyze meal frequency and timing
    const mealTimes = recentEntries.map(entry => parseInt(entry.time.split(':')[0]));
    const avgMealFrequency = recentEntries.length / Math.max(1, (Math.max(...mealTimes) - Math.min(...mealTimes)) / 24);

    // Analyze macronutrient balance
    const avgProteinPercent = recentEntries.reduce((sum, entry) => sum + entry.proteinPercent, 0) / recentEntries.length;
    const avgCarbsPercent = recentEntries.reduce((sum, entry) => sum + entry.carbsPercent, 0) / recentEntries.length;
    const avgFatPercent = recentEntries.reduce((sum, entry) => sum + entry.fatPercent, 0) / recentEntries.length;

    // Find most common meal purpose
    const purposeCount = {};
    recentEntries.forEach(entry => {
        purposeCount[entry.mealPurpose] = (purposeCount[entry.mealPurpose] || 0) + 1;
    });
    const primaryPurpose = Object.keys(purposeCount).reduce((a, b) =>
        purposeCount[a] > purposeCount[b] ? a : b
    );

    let insights = '<p>Based on your nutritional timing patterns:</p><ul>';

    if (avgTimingScore >= 75) {
        insights += '<li><strong>Excellent timing!</strong> Your meal timing aligns well with optimal nutrient windows. Continue with your current schedule.</li>';
    } else if (avgTimingScore >= 60) {
        insights += '<li><strong>Good timing patterns.</strong> Your meal timing is generally effective, but there may be opportunities for minor adjustments.</li>';
    } else {
        insights += '<li><strong>Timing optimization needed.</strong> Consider adjusting meal times to better align with your energy needs and nutrient utilization windows.</li>';
    }

    if (avgMealFrequency < 3) {
        insights += '<li><strong>Consider more frequent meals.</strong> Eating every 3-4 hours may help maintain steady energy levels and optimize nutrient utilization.</li>';
    } else if (avgMealFrequency > 6) {
        insights += '<li><strong>Meal frequency is high.</strong> While frequent eating can be beneficial, ensure you\'re getting adequate nutrients in each meal.</li>';
    }

    if (avgProteinPercent < 20) {
        insights += '<li><strong>Protein intake may be low.</strong> Aim for 20-30% of calories from protein, distributed evenly throughout the day for optimal muscle maintenance.</li>';
    } else if (avgProteinPercent > 40) {
        insights += '<li><strong>High protein focus.</strong> Your protein intake is substantial. Ensure you\'re also getting adequate carbohydrates for energy.</li>';
    }

    if (primaryPurpose === 'fat-loss' && avgCarbsPercent > 50) {
        insights += '<li><strong>Carb timing for fat loss.</strong> For fat loss goals, consider shifting more carbs to earlier in the day and reducing evening carb intake.</li>';
    }

    if (avgEnergyLevel < 6) {
        insights += '<li><strong>Energy levels could be improved.</strong> Low energy may indicate suboptimal meal timing or macronutrient distribution. Consider eating more frequently or adjusting carb timing.</li>';
    }

    insights += '<li><strong>Optimization tips:</strong> Align larger carb meals with high-energy needs (morning/workouts), distribute protein evenly, and time last meal 2-3 hours before bed for better sleep quality.</li>';
    insights += '</ul>';

    insightsDiv.innerHTML = insights;
}

function updateMealList() {
    const mealList = document.getElementById('mealList');
    mealList.innerHTML = '';

    // Show last 10 entries
    const recentEntries = nutritionEntries.slice(-10).reverse();

    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'meal-entry';

        const timingStatus = getTimingStatus(entry.timingScore);

        entryDiv.innerHTML = `
            <div class="meal-header">
                <div class="meal-date-time">${new Date(entry.date).toLocaleDateString()} ${entry.time}</div>
                <div class="timing-score ${timingStatus.class}">${timingStatus.status} (${entry.timingScore})</div>
            </div>
            <div class="meal-details">
                <div class="detail-item">
                    <div class="detail-label">Meal Type</div>
                    <div class="detail-value">${entry.mealType.replace('-', ' ')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Purpose</div>
                    <div class="detail-value">${entry.mealPurpose.replace('-', ' ')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Calories</div>
                    <div class="detail-value">${entry.calories}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Energy</div>
                    <div class="detail-value">${entry.energyLevel}/10</div>
                </div>
            </div>
            <div class="macronutrients">
                <div class="macro-item">
                    <div class="macro-label">Protein</div>
                    <div class="macro-value">${entry.proteinGrams}g</div>
                </div>
                <div class="macro-item">
                    <div class="macro-label">Carbs</div>
                    <div class="macro-value">${entry.carbsGrams}g</div>
                </div>
                <div class="macro-item">
                    <div class="macro-label">Fat</div>
                    <div class="macro-value">${entry.fatGrams}g</div>
                </div>
                <div class="macro-item">
                    <div class="macro-label">P/C/F</div>
                    <div class="macro-value">${entry.proteinPercent}/${entry.carbsPercent}/${entry.fatPercent}</div>
                </div>
            </div>
            ${entry.notes ? `<div class="meal-notes">${entry.notes}</div>` : ''}
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;

        mealList.appendChild(entryDiv);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this meal entry?')) {
        nutritionEntries = nutritionEntries.filter(entry => entry.id !== id);
        localStorage.setItem('nutritionTimingEntries', JSON.stringify(nutritionEntries));
        updateStats();
        updateChart();
        updateInsights();
        updateMealList();
    }
}

// Update energy value display
document.getElementById('energyLevel').addEventListener('input', function() {
    document.getElementById('energyValue').textContent = this.value;
});

// Form submission
document.getElementById('nutritionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    logMeal();
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('mealDate').value = today;

    updateStats();
    updateChart();
    updateInsights();
    updateMealList();
});