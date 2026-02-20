// anti-inflammatory-habit-index.js

let habitEntries = JSON.parse(localStorage.getItem('antiInflammatoryHabits')) || [];

function logHabits() {
    const date = document.getElementById('logDate').value;
    const vegetableServings = parseInt(document.getElementById('vegetableServings').value);
    const fruitServings = parseInt(document.getElementById('fruitServings').value);
    const processedFoodFreq = parseInt(document.getElementById('processedFoodFreq').value);
    const omegaBalance = parseInt(document.getElementById('omegaBalance').value);
    const exerciseMinutes = parseInt(document.getElementById('exerciseMinutes').value);
    const exerciseIntensity = parseInt(document.getElementById('exerciseIntensity').value);
    const sleepHours = parseFloat(document.getElementById('sleepHours').value);
    const sleepQuality = parseInt(document.getElementById('sleepQuality').value);
    const stressLevel = parseInt(document.getElementById('stressLevel').value);
    const mindfulnessMinutes = parseInt(document.getElementById('mindfulnessMinutes').value);
    const alcoholConsumption = parseInt(document.getElementById('alcoholConsumption').value);
    const smokingStatus = document.getElementById('smokingStatus').value;
    const notes = document.getElementById('habitNotes').value.trim();

    if (!date) {
        alert('Please select a date.');
        return;
    }

    // Check if entry already exists for this date
    const existingEntry = habitEntries.find(entry => entry.date === date);
    if (existingEntry) {
        if (!confirm('An entry already exists for this date. Do you want to update it?')) {
            return;
        }
        // Remove existing entry
        habitEntries = habitEntries.filter(entry => entry.date !== date);
    }

    // Calculate anti-inflammatory score
    const nutritionScore = calculateNutritionScore(vegetableServings, fruitServings, processedFoodFreq, omegaBalance);
    const exerciseScore = calculateExerciseScore(exerciseMinutes, exerciseIntensity);
    const sleepScore = calculateSleepScore(sleepHours, sleepQuality);
    const stressScore = calculateStressScore(stressLevel, mindfulnessMinutes);
    const lifestyleScore = calculateLifestyleScore(alcoholConsumption, smokingStatus);

    const totalScore = Math.round((nutritionScore + exerciseScore + sleepScore + stressScore + lifestyleScore) / 5);

    const entry = {
        id: Date.now(),
        date,
        nutrition: {
            vegetableServings,
            fruitServings,
            processedFoodFreq,
            omegaBalance,
            score: nutritionScore
        },
        exercise: {
            minutes: exerciseMinutes,
            intensity: exerciseIntensity,
            score: exerciseScore
        },
        sleep: {
            hours: sleepHours,
            quality: sleepQuality,
            score: sleepScore
        },
        stress: {
            level: stressLevel,
            mindfulnessMinutes,
            score: stressScore
        },
        lifestyle: {
            alcoholConsumption,
            smokingStatus,
            score: lifestyleScore
        },
        totalScore,
        notes
    };

    habitEntries.push(entry);

    // Sort by date
    habitEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Keep only last 50 entries
    if (habitEntries.length > 50) {
        habitEntries = habitEntries.slice(-50);
    }

    localStorage.setItem('antiInflammatoryHabits', JSON.stringify(habitEntries));

    // Clear form (reset to defaults)
    document.getElementById('logDate').value = '';
    document.getElementById('vegetableServings').value = 3;
    document.getElementById('fruitServings').value = 2;
    document.getElementById('processedFoodFreq').value = 2;
    document.getElementById('processedValue').textContent = '2';
    document.getElementById('omegaBalance').value = 3;
    document.getElementById('omegaValue').textContent = '3';
    document.getElementById('exerciseMinutes').value = 30;
    document.getElementById('exerciseIntensity').value = 3;
    document.getElementById('intensityValue').textContent = '3';
    document.getElementById('sleepHours').value = 8;
    document.getElementById('sleepQuality').value = 4;
    document.getElementById('sleepValue').textContent = '4';
    document.getElementById('stressLevel').value = 3;
    document.getElementById('stressValue').textContent = '3';
    document.getElementById('mindfulnessMinutes').value = 10;
    document.getElementById('alcoholConsumption').value = 0;
    document.getElementById('smokingStatus').value = 'never';
    document.getElementById('habitNotes').value = '';

    updateStats();
    updateChart();
    updateInsights();
    updateHabitList();
}

function calculateNutritionScore(vegetables, fruits, processed, omega) {
    // Score out of 100 for nutrition category
    const vegetableScore = Math.min(vegetables * 10, 50); // Max 50 points for 5+ servings
    const fruitScore = Math.min(fruits * 8, 30); // Max 30 points for 4+ servings
    const processedScore = (6 - processed) * 10; // Lower processed food = higher score
    const omegaScore = omega * 10; // Max 50 points for highest omega balance

    return Math.round((vegetableScore + fruitScore + processedScore + omegaScore) / 2);
}

function calculateExerciseScore(minutes, intensity) {
    // Score out of 100 for exercise category
    const durationScore = Math.min(minutes * 2, 60); // Max 60 points for 30+ minutes
    const intensityScore = intensity * 10; // Max 50 points for highest intensity

    return Math.round(durationScore + intensityScore);
}

function calculateSleepScore(hours, quality) {
    // Score out of 100 for sleep category
    const durationScore = hours >= 7 && hours <= 9 ? 60 : Math.max(0, 60 - Math.abs(8 - hours) * 10);
    const qualityScore = quality * 10; // Max 40 points for best quality

    return Math.round(durationScore + qualityScore);
}

function calculateStressScore(level, mindfulness) {
    // Score out of 100 for stress category
    const stressScore = (6 - level) * 12; // Lower stress = higher score
    const mindfulnessScore = Math.min(mindfulness * 2, 40); // Max 40 points for 20+ minutes

    return Math.round(stressScore + mindfulnessScore);
}

function calculateLifestyleScore(alcohol, smoking) {
    // Score out of 100 for lifestyle category
    let score = 100;

    // Alcohol deduction
    score -= alcohol * 10; // -10 points per drink

    // Smoking deduction
    switch(smoking) {
        case 'regular': score -= 40; break;
        case 'occasional': score -= 20; break;
        case 'former': score -= 10; break;
        case 'never': score -= 0; break;
    }

    return Math.max(0, score);
}

function getScoreStatus(score) {
    if (score >= 80) return { status: 'Excellent', class: 'score-excellent' };
    if (score >= 65) return { status: 'Good', class: 'score-good' };
    if (score >= 50) return { status: 'Fair', class: 'score-fair' };
    return { status: 'Poor', class: 'score-poor' };
}

function getRiskLevel(score) {
    if (score >= 75) return { level: 'Low', class: 'risk-low' };
    if (score >= 60) return { level: 'Moderate', class: 'risk-moderate' };
    if (score >= 45) return { level: 'High', class: 'risk-high' };
    return { level: 'Critical', class: 'risk-critical' };
}

function updateStats() {
    const totalDays = habitEntries.length;

    if (totalDays === 0) {
        document.getElementById('currentScore').textContent = '0/100';
        document.getElementById('riskLevel').textContent = 'Unknown';
        document.getElementById('riskLevel').className = 'stat-value';
        document.getElementById('scoreImprovement').textContent = '0%';
        document.getElementById('totalDays').textContent = '0';
        return;
    }

    // Current score (latest entry)
    const latestEntry = habitEntries[habitEntries.length - 1];
    const currentScore = latestEntry.totalScore;

    // Risk level
    const risk = getRiskLevel(currentScore);
    const riskElement = document.getElementById('riskLevel');
    riskElement.textContent = risk.level;
    riskElement.className = `stat-value ${risk.class}`;

    // Score improvement (from first to last entry)
    const firstEntry = habitEntries[0];
    const improvement = firstEntry.totalScore > 0 ?
        ((currentScore - firstEntry.totalScore) / firstEntry.totalScore * 100) : 0;

    document.getElementById('currentScore').textContent = `${currentScore}/100`;
    document.getElementById('scoreImprovement').textContent = `${improvement >= 0 ? '+' : ''}${improvement.toFixed(1)}%`;
    document.getElementById('totalDays').textContent = totalDays;
}

function updateChart() {
    const ctx = document.getElementById('inflammationChart').getContext('2d');

    // Prepare data for last 20 entries
    const chartEntries = habitEntries.slice(-20);

    const labels = chartEntries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString();
    });

    const scores = chartEntries.map(entry => entry.totalScore);
    const nutritionScores = chartEntries.map(entry => entry.nutrition.score);
    const exerciseScores = chartEntries.map(entry => entry.exercise.score);
    const sleepScores = chartEntries.map(entry => entry.sleep.score);

    // Reference lines
    const excellentLine = new Array(scores.length).fill(80);
    const goodLine = new Array(scores.length).fill(65);
    const fairLine = new Array(scores.length).fill(50);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Anti-Inflammatory Score',
                data: scores,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Nutrition Score',
                data: nutritionScores,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Exercise Score',
                data: exerciseScores,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Sleep Score',
                data: sleepScores,
                borderColor: '#6f42c1',
                backgroundColor: 'rgba(111, 66, 193, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Excellent (≥80)',
                data: excellentLine,
                borderColor: '#28a745',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Good (≥65)',
                data: goodLine,
                borderColor: '#17a2b8',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Fair (≥50)',
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
                        text: 'Total Score'
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
                        text: 'Category Scores'
                    },
                    min: 0,
                    max: 100,
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

    if (habitEntries.length < 7) {
        insightsDiv.innerHTML = '<p>Log at least 7 days of habits to receive personalized insights about your anti-inflammatory lifestyle and recommendations for reducing chronic inflammation.</p>';
        return;
    }

    // Analyze patterns from last 7 days
    const recentEntries = habitEntries.slice(-7);

    // Calculate averages
    const avgScore = recentEntries.reduce((sum, entry) => sum + entry.totalScore, 0) / recentEntries.length;
    const avgNutrition = recentEntries.reduce((sum, entry) => sum + entry.nutrition.score, 0) / recentEntries.length;
    const avgExercise = recentEntries.reduce((sum, entry) => sum + entry.exercise.score, 0) / recentEntries.length;
    const avgSleep = recentEntries.reduce((sum, entry) => sum + entry.sleep.score, 0) / recentEntries.length;
    const avgStress = recentEntries.reduce((sum, entry) => sum + entry.stress.score, 0) / recentEntries.length;
    const avgLifestyle = recentEntries.reduce((sum, entry) => sum + entry.lifestyle.score, 0) / recentEntries.length;

    // Find weakest categories
    const categories = [
        { name: 'Nutrition', score: avgNutrition },
        { name: 'Exercise', score: avgExercise },
        { name: 'Sleep', score: avgSleep },
        { name: 'Stress Management', score: avgStress },
        { name: 'Lifestyle', score: avgLifestyle }
    ];

    categories.sort((a, b) => a.score - b.score);
    const weakestCategory = categories[0];

    let insights = '<p>Based on your recent anti-inflammatory habits:</p><ul>';

    if (avgScore >= 75) {
        insights += '<li><strong>Excellent anti-inflammatory habits!</strong> Your lifestyle choices are strongly supporting reduced inflammation and better health. Continue these patterns.</li>';
    } else if (avgScore >= 60) {
        insights += '<li><strong>Good progress on inflammation control.</strong> Your habits are moderately effective. Focus on the weakest areas to further reduce inflammation risk.</li>';
    } else {
        insights += '<li><strong>Room for improvement in inflammation control.</strong> Consider making changes to reduce chronic inflammation and improve overall health markers.</li>';
    }

    insights += `<li><strong>Focus area: ${weakestCategory.name}.</strong> This category has the most potential for improvement (current average: ${weakestCategory.score.toFixed(0)}/100).</li>`;

    // Specific recommendations based on weakest category
    if (weakestCategory.name === 'Nutrition') {
        insights += '<li><strong>Nutrition recommendations:</strong> Increase vegetable and fruit intake, reduce processed foods, and incorporate more omega-3 rich foods like fatty fish, walnuts, and flaxseeds.</li>';
    } else if (weakestCategory.name === 'Exercise') {
        insights += '<li><strong>Exercise recommendations:</strong> Aim for 30+ minutes of moderate-intensity exercise daily. Include both cardio and strength training for optimal anti-inflammatory benefits.</li>';
    } else if (weakestCategory.name === 'Sleep') {
        insights += '<li><strong>Sleep recommendations:</strong> Target 7-9 hours of quality sleep nightly. Maintain consistent sleep/wake times and create a relaxing bedtime routine.</li>';
    } else if (weakestCategory.name === 'Stress Management') {
        insights += '<li><strong>Stress management recommendations:</strong> Practice daily mindfulness or meditation (10-20 minutes), engage in stress-reducing activities, and consider stress-reduction techniques.</li>';
    } else if (weakestCategory.name === 'Lifestyle') {
        insights += '<li><strong>Lifestyle recommendations:</strong> Minimize alcohol consumption and avoid smoking to significantly reduce inflammation and improve overall health.</li>';
    }

    insights += '<li><strong>Key anti-inflammatory foods to prioritize:</strong> Fatty fish, leafy greens, berries, nuts, olive oil, and turmeric. Avoid or minimize sugar, refined carbs, and trans fats.</li>';
    insights += '</ul>';

    insightsDiv.innerHTML = insights;
}

function updateHabitList() {
    const habitList = document.getElementById('habitList');
    habitList.innerHTML = '';

    // Show last 10 entries
    const recentEntries = habitEntries.slice(-10).reverse();

    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'habit-entry';

        const scoreStatus = getScoreStatus(entry.totalScore);

        entryDiv.innerHTML = `
            <div class="entry-header">
                <div class="entry-date">${new Date(entry.date).toLocaleDateString()}</div>
                <div class="score-display ${scoreStatus.class}">${scoreStatus.status} (${entry.totalScore})</div>
            </div>
            <div class="habit-breakdown">
                <div class="habit-category">
                    <div class="category-title"><i class="fas fa-utensils"></i> Nutrition</div>
                    <div class="category-items">
                        <div class="category-item">
                            <span class="category-label">Vegetables:</span>
                            <span class="category-value">${entry.nutrition.vegetableServings} servings</span>
                        </div>
                        <div class="category-item">
                            <span class="category-label">Fruits:</span>
                            <span class="category-value">${entry.nutrition.fruitServings} servings</span>
                        </div>
                        <div class="category-item">
                            <span class="category-label">Processed Foods:</span>
                            <span class="category-value">${entry.nutrition.processedFoodFreq}/5</span>
                        </div>
                        <div class="category-item">
                            <span class="category-label">Omega-3 Balance:</span>
                            <span class="category-value">${entry.nutrition.omegaBalance}/5</span>
                        </div>
                    </div>
                </div>
                <div class="habit-category">
                    <div class="category-title"><i class="fas fa-running"></i> Exercise</div>
                    <div class="category-items">
                        <div class="category-item">
                            <span class="category-label">Duration:</span>
                            <span class="category-value">${entry.exercise.minutes} min</span>
                        </div>
                        <div class="category-item">
                            <span class="category-label">Intensity:</span>
                            <span class="category-value">${entry.exercise.intensity}/5</span>
                        </div>
                    </div>
                </div>
                <div class="habit-category">
                    <div class="category-title"><i class="fas fa-moon"></i> Sleep</div>
                    <div class="category-items">
                        <div class="category-item">
                            <span class="category-label">Hours:</span>
                            <span class="category-value">${entry.sleep.hours}h</span>
                        </div>
                        <div class="category-item">
                            <span class="category-label">Quality:</span>
                            <span class="category-value">${entry.sleep.quality}/5</span>
                        </div>
                    </div>
                </div>
                <div class="habit-category">
                    <div class="category-title"><i class="fas fa-brain"></i> Stress</div>
                    <div class="category-items">
                        <div class="category-item">
                            <span class="category-label">Stress Level:</span>
                            <span class="category-value">${entry.stress.level}/5</span>
                        </div>
                        <div class="category-item">
                            <span class="category-label">Mindfulness:</span>
                            <span class="category-value">${entry.stress.mindfulnessMinutes} min</span>
                        </div>
                    </div>
                </div>
                <div class="habit-category">
                    <div class="category-title"><i class="fas fa-smoking-ban"></i> Lifestyle</div>
                    <div class="category-items">
                        <div class="category-item">
                            <span class="category-label">Alcohol:</span>
                            <span class="category-value">${entry.lifestyle.alcoholConsumption} drinks</span>
                        </div>
                        <div class="category-item">
                            <span class="category-label">Smoking:</span>
                            <span class="category-value">${entry.lifestyle.smokingStatus}</span>
                        </div>
                    </div>
                </div>
            </div>
            ${entry.notes ? `<div class="habit-notes">${entry.notes}</div>` : ''}
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;

        habitList.appendChild(entryDiv);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this habit entry?')) {
        habitEntries = habitEntries.filter(entry => entry.id !== id);
        localStorage.setItem('antiInflammatoryHabits', JSON.stringify(habitEntries));
        updateStats();
        updateChart();
        updateInsights();
        updateHabitList();
    }
}

// Update range value displays
document.getElementById('processedFoodFreq').addEventListener('input', function() {
    document.getElementById('processedValue').textContent = this.value;
});

document.getElementById('omegaBalance').addEventListener('input', function() {
    document.getElementById('omegaValue').textContent = this.value;
});

document.getElementById('exerciseIntensity').addEventListener('input', function() {
    document.getElementById('intensityValue').textContent = this.value;
});

document.getElementById('sleepQuality').addEventListener('input', function() {
    document.getElementById('sleepValue').textContent = this.value;
});

document.getElementById('stressLevel').addEventListener('input', function() {
    document.getElementById('stressValue').textContent = this.value;
});

// Form submission
document.getElementById('inflammationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    logHabits();
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('logDate').value = today;

    updateStats();
    updateChart();
    updateInsights();
    updateHabitList();
});