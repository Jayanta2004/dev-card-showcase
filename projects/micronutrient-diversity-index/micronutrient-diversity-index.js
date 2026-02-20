// micronutrient-diversity-index.js

let foodIntakes = JSON.parse(localStorage.getItem('micronutrientFoodIntakes')) || [];

// Micronutrient categories and their primary food sources
const nutrientCategories = {
    'Vitamin A': ['vegetables', 'fruits'],
    'Vitamin C': ['vegetables', 'fruits'],
    'Vitamin D': ['dairy', 'oils-fats'],
    'Vitamin E': ['nuts-seeds', 'oils-fats'],
    'Vitamin K': ['vegetables', 'nuts-seeds'],
    'Vitamin B1': ['grains', 'proteins', 'legumes'],
    'Vitamin B2': ['dairy', 'grains', 'proteins'],
    'Vitamin B3': ['proteins', 'grains', 'legumes'],
    'Vitamin B6': ['proteins', 'vegetables', 'grains'],
    'Vitamin B12': ['proteins', 'dairy'],
    'Folate': ['vegetables', 'legumes', 'fruits'],
    'Calcium': ['dairy', 'vegetables', 'nuts-seeds'],
    'Iron': ['proteins', 'legumes', 'grains', 'vegetables'],
    'Magnesium': ['nuts-seeds', 'vegetables', 'grains', 'legumes'],
    'Zinc': ['proteins', 'grains', 'legumes', 'dairy'],
    'Iodine': ['proteins', 'dairy'],
    'Selenium': ['proteins', 'grains', 'nuts-seeds']
};

function logFoodIntake() {
    const mealType = document.getElementById('mealType').value;
    const foodCategory = document.getElementById('foodCategory').value;
    const specificFoods = document.getElementById('specificFoods').value.trim();
    const portion = document.getElementById('portion').value;

    if (!specificFoods) {
        alert('Please enter at least one specific food item');
        return;
    }

    const intake = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        mealType: mealType,
        foodCategory: foodCategory,
        specificFoods: specificFoods.split(',').map(food => food.trim()),
        portion: portion
    };

    foodIntakes.push(intake);
    saveIntakes();

    // Clear form
    document.getElementById('specificFoods').value = '';

    updateStats();
    updateCharts();
    updateInsights();
    displayHistory();
}

function saveIntakes() {
    localStorage.setItem('micronutrientFoodIntakes', JSON.stringify(foodIntakes));
}

function updateStats() {
    if (foodIntakes.length === 0) {
        document.getElementById('diversityIndex').textContent = '0';
        document.getElementById('categoriesConsumed').textContent = '0/10';
        document.getElementById('todayScore').textContent = '0';
        document.getElementById('weeklyAverage').textContent = '0';
        return;
    }

    // Calculate diversity index (0-100 scale based on nutrient coverage)
    const nutrientCoverage = calculateNutrientCoverage();
    const diversityIndex = Math.round((Object.values(nutrientCoverage).filter(covered => covered).length / Object.keys(nutrientCoverage).length) * 100);
    document.getElementById('diversityIndex').textContent = diversityIndex;

    // Categories consumed this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyIntakes = foodIntakes.filter(intake => new Date(intake.timestamp) >= oneWeekAgo);
    const uniqueCategories = new Set(weeklyIntakes.map(intake => intake.foodCategory));
    document.getElementById('categoriesConsumed').textContent = `${uniqueCategories.size}/10`;

    // Today's score
    const today = new Date().toDateString();
    const todayIntakes = foodIntakes.filter(intake => new Date(intake.timestamp).toDateString() === today);
    const todayCategories = new Set(todayIntakes.map(intake => intake.foodCategory));
    const todayScore = Math.round((todayCategories.size / 10) * 100);
    document.getElementById('todayScore').textContent = todayScore;

    // Weekly average
    const weeklyScores = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayIntakes = foodIntakes.filter(intake => new Date(intake.timestamp).toDateString() === date.toDateString());
        const dayCategories = new Set(dayIntakes.map(intake => intake.foodCategory));
        weeklyScores.push((dayCategories.size / 10) * 100);
    }
    const weeklyAverage = weeklyScores.reduce((a, b) => a + b, 0) / weeklyScores.length;
    document.getElementById('weeklyAverage').textContent = Math.round(weeklyAverage);
}

function calculateNutrientCoverage() {
    const coverage = {};
    const recentIntakes = foodIntakes.filter(intake => {
        const intakeDate = new Date(intake.timestamp);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return intakeDate >= weekAgo;
    });

    Object.keys(nutrientCategories).forEach(nutrient => {
        coverage[nutrient] = nutrientCategories[nutrient].some(category =>
            recentIntakes.some(intake => intake.foodCategory === category)
        );
    });

    return coverage;
}

function updateCharts() {
    updateNutrientHeatmap();
    updateDiversityTrendChart();
}

function updateNutrientHeatmap() {
    const nutrientCoverage = calculateNutrientCoverage();

    const nutrients = Object.keys(nutrientCoverage);
    const coverageValues = nutrients.map(nutrient => nutrientCoverage[nutrient] ? 1 : 0);

    const ctx = document.getElementById('nutrientHeatmap').getContext('2d');
    if (window.nutrientHeatmap) {
        window.nutrientHeatmap.destroy();
    }

    window.nutrientHeatmap = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: nutrients,
            datasets: [{
                label: 'Coverage (7 days)',
                data: coverageValues,
                backgroundColor: coverageValues.map(value =>
                    value ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)'
                ),
                borderColor: coverageValues.map(value =>
                    value ? '#4CAF50' : '#f44336'
                ),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    ticks: {
                        callback: function(value) {
                            return value === 1 ? 'Covered' : 'Missing';
                        }
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => context.parsed.y === 1 ? 'Nutrient covered' : 'Nutrient missing'
                    }
                }
            }
        }
    });
}

function updateDiversityTrendChart() {
    // Calculate daily diversity scores for the last 7 days
    const dailyScores = [];
    const labels = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString());

        const dayIntakes = foodIntakes.filter(intake =>
            new Date(intake.timestamp).toDateString() === date.toDateString()
        );
        const dayCategories = new Set(dayIntakes.map(intake => intake.foodCategory));
        dailyScores.push((dayCategories.size / 10) * 100);
    }

    const ctx = document.getElementById('diversityTrendChart').getContext('2d');
    if (window.diversityTrendChart) {
        window.diversityTrendChart.destroy();
    }

    window.diversityTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Diversity Score',
                data: dailyScores,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.1,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.parsed.y.toFixed(1)}% diversity`
                    }
                }
            }
        }
    });
}

function updateInsights() {
    // Most consumed category
    const categoryCounts = {};
    foodIntakes.forEach(intake => {
        categoryCounts[intake.foodCategory] = (categoryCounts[intake.foodCategory] || 0) + 1;
    });

    let topCategory = 'No data available';
    let maxCount = 0;
    Object.keys(categoryCounts).forEach(category => {
        if (categoryCounts[category] > maxCount) {
            maxCount = categoryCounts[category];
            topCategory = `${formatCategory(category)} (${maxCount} times)`;
        }
    });
    document.getElementById('topCategory').textContent = topCategory;

    // Nutrient gaps
    const nutrientCoverage = calculateNutrientCoverage();
    const missingNutrients = Object.keys(nutrientCoverage).filter(nutrient => !nutrientCoverage[nutrient]);

    let gapsText = 'No significant gaps detected';
    if (missingNutrients.length > 0) {
        gapsText = `Consider adding: ${missingNutrients.slice(0, 3).join(', ')}`;
        if (missingNutrients.length > 3) {
            gapsText += ` (+${missingNutrients.length - 3} more)`;
        }
    }
    document.getElementById('nutrientGaps').textContent = gapsText;

    // Weekly progress
    if (foodIntakes.length >= 7) {
        const recentWeek = foodIntakes.slice(-7);
        const previousWeek = foodIntakes.slice(-14, -7);

        if (previousWeek.length > 0) {
            const recentAvg = recentWeek.reduce((sum, intake) => {
                const dayCategories = new Set(foodIntakes.filter(i =>
                    new Date(i.timestamp).toDateString() === new Date(intake.timestamp).toDateString()
                ).map(i => i.foodCategory));
                return sum + dayCategories.size;
            }, 0) / 7;

            const previousAvg = previousWeek.reduce((sum, intake) => {
                const dayCategories = new Set(foodIntakes.filter(i =>
                    new Date(i.timestamp).toDateString() === new Date(intake.timestamp).toDateString()
                ).map(i => i.foodCategory));
                return sum + dayCategories.size;
            }, 0) / 7;

            const progress = ((recentAvg - previousAvg) / previousAvg) * 100;
            document.getElementById('weeklyProgress').textContent =
                progress >= 0 ? `+${progress.toFixed(1)}% improvement` : `${progress.toFixed(1)}% decline`;
        } else {
            document.getElementById('weeklyProgress').textContent = 'Building trend data...';
        }
    } else {
        document.getElementById('weeklyProgress').textContent = 'Need more data for trends';
    }
}

function formatCategory(category) {
    const formats = {
        'vegetables': 'Vegetables',
        'fruits': 'Fruits',
        'grains': 'Grains/Cereals',
        'proteins': 'Proteins',
        'dairy': 'Dairy',
        'nuts-seeds': 'Nuts & Seeds',
        'legumes': 'Legumes',
        'oils-fats': 'Oils & Fats',
        'sweets': 'Sweets',
        'beverages': 'Beverages'
    };
    return formats[category] || category;
}

function displayHistory(filter = 'all') {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

    let filteredIntakes = foodIntakes;

    if (filter === 'today') {
        const today = new Date().toDateString();
        filteredIntakes = foodIntakes.filter(intake => new Date(intake.timestamp).toDateString() === today);
    } else if (filter === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filteredIntakes = foodIntakes.filter(intake => new Date(intake.timestamp) >= oneWeekAgo);
    }

    // Sort by most recent first
    filteredIntakes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const historyDiv = document.getElementById('foodHistory');
    historyDiv.innerHTML = '';

    if (filteredIntakes.length === 0) {
        historyDiv.innerHTML = '<p style="text-align: center; color: #666;">No food intake logged</p>';
        return;
    }

    filteredIntakes.forEach(intake => {
        const entry = document.createElement('div');
        entry.className = 'food-entry';

        const date = new Date(intake.timestamp).toLocaleDateString();
        const time = new Date(intake.timestamp).toLocaleTimeString();

        entry.innerHTML = `
            <h4>
                ${date} ${time} - ${intake.mealType.charAt(0).toUpperCase() + intake.mealType.slice(1)}
                <span class="category-badge">${formatCategory(intake.foodCategory)}</span>
                <button class="delete-btn" onclick="deleteIntake(${intake.id})">×</button>
            </h4>
            <p><strong>Foods:</strong> ${intake.specificFoods.join(', ')}</p>
            <div class="food-details">
                <div class="detail-item">Portion: ${intake.portion}</div>
            </div>
        `;

        historyDiv.appendChild(entry);
    });
}

function filterHistory(filter) {
    displayHistory(filter);
}

function deleteIntake(id) {
    if (confirm('Are you sure you want to delete this food intake entry?')) {
        foodIntakes = foodIntakes.filter(intake => intake.id !== id);
        saveIntakes();
        updateStats();
        updateCharts();
        updateInsights();
        displayHistory();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    updateCharts();
    updateInsights();
    displayHistory();
});