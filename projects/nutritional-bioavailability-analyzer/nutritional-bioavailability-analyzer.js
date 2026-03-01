// nutritional-bioavailability-analyzer.js

let mealAnalyses = JSON.parse(localStorage.getItem('mealAnalyses')) || [];
let currentMeal = null;
let selectedFoods = [];

// Food database with bioavailability data
const foodDatabase = [
    // Vegetables
    { name: "Spinach", category: "vegetable", nutrients: { iron: 0.3, calcium: 0.25, vitaminC: 0.8, folate: 0.9 } },
    { name: "Broccoli", category: "vegetable", nutrients: { vitaminC: 0.9, folate: 0.8, vitaminK: 0.9, calcium: 0.3 } },
    { name: "Sweet Potato", category: "vegetable", nutrients: { vitaminA: 0.9, vitaminC: 0.8, manganese: 0.7 } },
    { name: "Kale", category: "vegetable", nutrients: { vitaminK: 0.9, vitaminA: 0.8, vitaminC: 0.7, calcium: 0.4 } },
    { name: "Tomatoes", category: "vegetable", nutrients: { vitaminC: 0.8, lycopene: 0.9, potassium: 0.6 } },
    { name: "Carrots", category: "vegetable", nutrients: { vitaminA: 0.9, vitaminK: 0.7, potassium: 0.5 } },

    // Fruits
    { name: "Oranges", category: "fruit", nutrients: { vitaminC: 0.9, folate: 0.7, potassium: 0.6 } },
    { name: "Strawberries", category: "fruit", nutrients: { vitaminC: 0.9, manganese: 0.8, folate: 0.6 } },
    { name: "Blueberries", category: "fruit", nutrients: { antioxidants: 0.9, vitaminC: 0.7, manganese: 0.8 } },
    { name: "Bananas", category: "fruit", nutrients: { potassium: 0.9, vitaminB6: 0.8, vitaminC: 0.5 } },
    { name: "Apples", category: "fruit", nutrients: { fiber: 0.8, vitaminC: 0.6, quercetin: 0.7 } },

    // Proteins
    { name: "Salmon", category: "protein", nutrients: { omega3: 0.9, vitaminD: 0.8, vitaminB12: 0.9, protein: 0.9 } },
    { name: "Chicken", category: "protein", nutrients: { protein: 0.9, niacin: 0.8, selenium: 0.7, phosphorus: 0.8 } },
    { name: "Eggs", category: "protein", nutrients: { protein: 0.9, vitaminD: 0.8, vitaminB12: 0.9, choline: 0.9 } },
    { name: "Tofu", category: "protein", nutrients: { protein: 0.8, calcium: 0.6, iron: 0.5, isoflavones: 0.7 } },
    { name: "Lentils", category: "protein", nutrients: { protein: 0.8, fiber: 0.9, folate: 0.8, iron: 0.6 } },

    // Grains
    { name: "Quinoa", category: "grain", nutrients: { protein: 0.8, fiber: 0.9, magnesium: 0.7, iron: 0.6 } },
    { name: "Brown Rice", category: "grain", nutrients: { manganese: 0.8, selenium: 0.7, magnesium: 0.6 } },
    { name: "Oats", category: "grain", nutrients: { fiber: 0.9, manganese: 0.7, phosphorus: 0.8, magnesium: 0.6 } },

    // Dairy
    { name: "Greek Yogurt", category: "dairy", nutrients: { protein: 0.9, calcium: 0.8, probiotics: 0.8, vitaminB12: 0.7 } },
    { name: "Cheddar Cheese", category: "dairy", nutrients: { calcium: 0.9, protein: 0.8, vitaminA: 0.7, phosphorus: 0.8 } }
];

// Bioavailability modifiers based on preparation methods
const preparationModifiers = {
    raw: { vitaminC: 1.0, folate: 0.9, vitaminK: 0.9 },
    steamed: { vitaminC: 0.8, folate: 0.8, vitaminK: 0.8, minerals: 0.9 },
    boiled: { vitaminC: 0.5, folate: 0.6, minerals: 0.8, waterSoluble: 0.7 },
    baked: { vitaminA: 1.1, minerals: 0.9, vitaminC: 0.7 },
    grilled: { protein: 1.0, minerals: 0.9, vitaminC: 0.6 },
    fried: { fatSoluble: 1.2, vitaminC: 0.4, minerals: 0.8 },
    fermented: { probiotics: 1.5, vitaminC: 0.7, folate: 0.8 },
    sprouted: { protein: 1.1, folate: 1.2, minerals: 1.1, vitaminC: 0.9 }
};

// Nutrient interaction modifiers
const nutrientInteractions = {
    vitaminC: { iron: 2.0, calcium: 0.8 }, // Vitamin C enhances iron absorption, may inhibit calcium
    calcium: { iron: 0.5, zinc: 0.6, magnesium: 0.7 }, // Calcium can inhibit iron and zinc absorption
    zinc: { copper: 0.7, iron: 0.8 }, // Zinc can compete with copper and iron
    iron: { vitaminC: 2.0, calcium: 0.5, tea: 0.3 }, // Enhanced by vitamin C, inhibited by calcium and tea
    folate: { vitaminB12: 0.9, zinc: 0.8 } // Interactions with B12 and zinc
};

function searchFoods() {
    const query = document.getElementById('foodSearch').value.toLowerCase().trim();
    if (!query) return;

    const results = foodDatabase.filter(food =>
        food.name.toLowerCase().includes(query) ||
        food.category.toLowerCase().includes(query)
    );

    displayFoodResults(results);
}

function displayFoodResults(foods) {
    const resultsDiv = document.getElementById('foodResults');
    resultsDiv.innerHTML = '';

    if (foods.length === 0) {
        resultsDiv.innerHTML = '<p>No foods found matching your search.</p>';
        return;
    }

    foods.forEach(food => {
        const foodItem = document.createElement('div');
        foodItem.className = 'food-item';
        foodItem.innerHTML = `
            <div>
                <strong>${food.name}</strong>
                <span style="color: #6c757d; font-size: 12px;">(${food.category})</span>
            </div>
            <button class="add-food-btn" onclick="addFood('${food.name}')">Add</button>
        `;
        resultsDiv.appendChild(foodItem);
    });
}

function addFood(foodName) {
    const food = foodDatabase.find(f => f.name === foodName);
    if (!food || selectedFoods.some(f => f.name === foodName)) return;

    selectedFoods.push(food);
    updateSelectedFoodsDisplay();
}

function removeFood(foodName) {
    selectedFoods = selectedFoods.filter(f => f.name !== foodName);
    updateSelectedFoodsDisplay();
}

function updateSelectedFoodsDisplay() {
    const selectedDiv = document.getElementById('selectedFoods');
    selectedDiv.innerHTML = '';

    selectedFoods.forEach(food => {
        const foodTag = document.createElement('span');
        foodTag.className = 'selected-food';
        foodTag.innerHTML = `${food.name} <span class="remove-food" onclick="removeFood('${food.name}')">×</span>`;
        selectedDiv.appendChild(foodTag);
    });
}

function analyzeMeal() {
    if (selectedFoods.length === 0) {
        alert('Please add at least one food to analyze.');
        return;
    }

    const mealName = document.getElementById('mealName').value.trim() || 'Unnamed Meal';
    const mealDate = document.getElementById('mealDate').value || new Date().toISOString().split('T')[0];

    // Get selected preparation methods
    const prepCheckboxes = document.querySelectorAll('.prep-options input:checked');
    const preparations = Array.from(prepCheckboxes).map(cb => cb.value);

    // Analyze bioavailability
    const analysis = calculateBioavailability(selectedFoods, preparations);

    // Display results
    displayResults(analysis);

    // Enable save button
    document.querySelector('.save-btn').disabled = false;

    // Store current meal data
    currentMeal = {
        name: mealName,
        date: mealDate,
        foods: selectedFoods,
        preparations: preparations,
        analysis: analysis,
        analyzedAt: new Date().toISOString()
    };
}

function calculateBioavailability(foods, preparations) {
    const nutrientScores = {};
    const recommendations = [];

    // Combine all nutrients from selected foods
    foods.forEach(food => {
        Object.entries(food.nutrients).forEach(([nutrient, baseBioavailability]) => {
            if (!nutrientScores[nutrient]) {
                nutrientScores[nutrient] = { base: 0, final: 0, modifiers: [] };
            }
            nutrientScores[nutrient].base += baseBioavailability;
        });
    });

    // Apply preparation modifiers
    preparations.forEach(prep => {
        const modifiers = preparationModifiers[prep];
        if (modifiers) {
            Object.entries(modifiers).forEach(([nutrient, modifier]) => {
                if (nutrientScores[nutrient]) {
                    nutrientScores[nutrient].final = (nutrientScores[nutrient].final || nutrientScores[nutrient].base) * modifier;
                    nutrientScores[nutrient].modifiers.push(`${prep}: ${modifier > 1 ? '+' : ''}${(modifier - 1) * 100}%`);
                }
            });
        }
    });

    // Apply nutrient interactions
    Object.entries(nutrientScores).forEach(([nutrient, data]) => {
        const interactions = nutrientInteractions[nutrient];
        if (interactions) {
            Object.entries(interactions).forEach(([otherNutrient, modifier]) => {
                if (nutrientScores[otherNutrient]) {
                    nutrientScores[otherNutrient].final = (nutrientScores[otherNutrient].final || nutrientScores[otherNutrient].base) * modifier;
                    nutrientScores[otherNutrient].modifiers.push(`${nutrient} interaction: ${modifier > 1 ? '+' : ''}${(modifier - 1) * 100}%`);
                }
            });
        }
    });

    // Calculate final scores and generate recommendations
    Object.entries(nutrientScores).forEach(([nutrient, data]) => {
        if (!data.final) {
            data.final = data.base;
        }

        // Generate recommendations based on low bioavailability
        if (data.final < 0.6) {
            recommendations.push({
                type: 'improvement',
                title: `Enhance ${nutrient} bioavailability`,
                description: getNutrientRecommendation(nutrient, preparations, foods)
            });
        }
    });

    // Add synergistic combination recommendations
    if (hasIron(foods) && !hasVitaminC(foods)) {
        recommendations.push({
            type: 'combination',
            title: 'Add vitamin C for better iron absorption',
            description: 'Pair iron-rich foods with vitamin C sources like citrus fruits, bell peppers, or strawberries.'
        });
    }

    if (hasCalcium(foods) && hasIron(foods)) {
        recommendations.push({
            type: 'timing',
            title: 'Separate calcium and iron intake',
            description: 'Consume calcium-rich foods at different times than iron-rich foods to avoid absorption interference.'
        });
    }

    // Calculate overall score
    const overallScore = Object.values(nutrientScores).reduce((sum, data) => sum + data.final, 0) / Object.keys(nutrientScores).length * 100;

    return {
        overallScore: Math.round(overallScore),
        nutrientScores: nutrientScores,
        recommendations: recommendations
    };
}

function getNutrientRecommendation(nutrient, preparations, foods) {
    const recommendations = {
        iron: 'Add vitamin C-rich foods, avoid calcium-rich foods at the same time, consider cooking in cast iron.',
        calcium: 'Ensure adequate vitamin D and magnesium for optimal absorption.',
        vitaminC: 'Eat raw or lightly cooked fruits and vegetables.',
        folate: 'Steam rather than boil folate-rich foods.',
        vitaminA: 'Include healthy fats for better absorption of fat-soluble vitamins.',
        zinc: 'Avoid high calcium intake at the same time.',
        vitaminB12: 'Ensure adequate stomach acid for absorption.'
    };

    return recommendations[nutrient] || `Optimize preparation methods and food combinations for better ${nutrient} absorption.`;
}

function hasIron(foods) {
    return foods.some(food => food.nutrients.iron);
}

function hasVitaminC(foods) {
    return foods.some(food => food.nutrients.vitaminC);
}

function hasCalcium(foods) {
    return foods.some(food => food.nutrients.calcium);
}

function displayResults(analysis) {
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'block';

    // Update overall score
    document.getElementById('overallScore').textContent = analysis.overallScore;

    // Update score circle color based on score
    const scoreCircle = document.querySelector('.score-circle');
    let color = '#dc3545'; // red
    if (analysis.overallScore >= 80) color = '#28a745'; // green
    else if (analysis.overallScore >= 60) color = '#ffc107'; // yellow
    scoreCircle.style.background = `conic-gradient(${color} 0% ${analysis.overallScore}%, #e9ecef ${analysis.overallScore}% 100%)`;

    // Display nutrient breakdown
    const nutrientResults = document.getElementById('nutrientResults');
    nutrientResults.innerHTML = '';

    Object.entries(analysis.nutrientScores).forEach(([nutrient, data]) => {
        const nutrientItem = document.createElement('div');
        nutrientItem.className = 'nutrient-item';
        nutrientItem.innerHTML = `
            <span class="nutrient-name">${nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}</span>
            <span class="nutrient-score">${Math.round(data.final * 100)}%</span>
        `;
        nutrientResults.appendChild(nutrientItem);
    });

    // Display recommendations
    const recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = '';

    analysis.recommendations.forEach(rec => {
        const recItem = document.createElement('div');
        recItem.className = 'recommendation-item';
        recItem.innerHTML = `
            <h4>${rec.title}</h4>
            <p>${rec.description}</p>
        `;
        recommendationsList.appendChild(recItem);
    });
}

function saveMeal() {
    if (!currentMeal) return;

    mealAnalyses.push(currentMeal);

    // Keep only last 50 analyses
    if (mealAnalyses.length > 50) {
        mealAnalyses = mealAnalyses.slice(-50);
    }

    localStorage.setItem('mealAnalyses', JSON.stringify(mealAnalyses));

    // Reset form
    document.getElementById('mealName').value = '';
    document.getElementById('mealDate').value = '';
    selectedFoods = [];
    updateSelectedFoodsDisplay();

    document.querySelector('.save-btn').disabled = true;
    document.getElementById('resultsSection').style.display = 'none';

    updateStats();
    updateChart();
    updateHistory();
}

function updateStats() {
    if (mealAnalyses.length === 0) {
        document.getElementById('avgBioavailability').textContent = '0%';
        document.getElementById('totalMeals').textContent = '0';
        document.getElementById('topNutrient').textContent = '-';
        document.getElementById('improvementTrend').textContent = '0%';
        return;
    }

    const avgScore = mealAnalyses.reduce((sum, meal) => sum + meal.analysis.overallScore, 0) / mealAnalyses.length;

    // Find most improved nutrient across meals
    const nutrientTrends = {};
    mealAnalyses.forEach(meal => {
        Object.entries(meal.analysis.nutrientScores).forEach(([nutrient, data]) => {
            if (!nutrientTrends[nutrient]) nutrientTrends[nutrient] = [];
            nutrientTrends[nutrient].push(data.final);
        });
    });

    let topNutrient = '-';
    let bestImprovement = 0;
    Object.entries(nutrientTrends).forEach(([nutrient, scores]) => {
        if (scores.length >= 2) {
            const improvement = scores[scores.length - 1] - scores[0];
            if (improvement > bestImprovement) {
                bestImprovement = improvement;
                topNutrient = nutrient;
            }
        }
    });

    document.getElementById('avgBioavailability').textContent = `${Math.round(avgScore)}%`;
    document.getElementById('totalMeals').textContent = mealAnalyses.length;
    document.getElementById('topNutrient').textContent = topNutrient.charAt(0).toUpperCase() + topNutrient.slice(1);
    document.getElementById('improvementTrend').textContent = bestImprovement > 0 ? `+${Math.round(bestImprovement * 100)}%` : '0%';
}

function updateChart() {
    const ctx = document.getElementById('bioavailabilityChart').getContext('2d');

    // Sort analyses by date
    const sortedAnalyses = mealAnalyses.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sortedAnalyses.map(analysis => new Date(analysis.date).toLocaleDateString());
    const scores = sortedAnalyses.map(analysis => analysis.analysis.overallScore);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Overall Bioavailability Score',
                data: scores,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Bioavailability Trends Over Time'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Bioavailability Score (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}

function updateHistory() {
    const history = document.getElementById('mealHistory');
    history.innerHTML = '';

    // Show last 10 analyses
    const recentAnalyses = mealAnalyses.slice(-10).reverse();

    recentAnalyses.forEach(analysis => {
        const item = document.createElement('div');
        item.className = 'meal-entry';

        const mealDate = new Date(analysis.date).toLocaleDateString();
        const foods = analysis.foods.map(f => f.name).join(', ');

        item.innerHTML = `
            <h4>${analysis.name} - ${mealDate}</h4>
            <p><strong>Foods:</strong> ${foods}</p>
            <p><strong>Preparation:</strong> ${analysis.preparations.join(', ') || 'None specified'}</p>
            <p><strong>Score:</strong> <span class="score">${analysis.analysis.overallScore}%</span></p>
        `;

        history.appendChild(item);
    });
}

// Set default date to today
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('mealDate').value = today;

    updateStats();
    updateChart();
    updateHistory();
});