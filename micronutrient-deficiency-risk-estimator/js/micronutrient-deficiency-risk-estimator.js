class MicronutrientDeficiencyRiskEstimator {
    constructor() {
        this.foodEntries = this.loadFoodEntries();
        this.nutrientDatabase = this.initializeNutrientDatabase();
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateTodayIntake();
        this.updateAnalysis();
        this.updateCriticalNutrients();
        this.updateHistory();
        this.updateInsights();
    }

    setupEventListeners() {
        const foodForm = document.getElementById('food-form');
        foodForm.addEventListener('submit', (e) => this.handleFoodSubmit(e));
    }

    handleFoodSubmit(e) {
        e.preventDefault();

        const foodData = this.getFoodData();
        this.foodEntries.push(foodData);
        this.saveFoodEntries();

        this.resetForm();
        this.updateTodayIntake();
        this.updateAnalysis();
        this.updateCriticalNutrients();
        this.updateHistory();
        this.updateInsights();

        this.showSuccessMessage('Food logged successfully!');
    }

    getFoodData() {
        return {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            name: document.getElementById('food-name').value.trim(),
            category: document.getElementById('food-category').value,
            servingSize: parseFloat(document.getElementById('serving-size').value),
            servingUnit: document.getElementById('serving-unit').value,
            mealType: document.getElementById('meal-type').value,
            timestamp: new Date().toISOString(),
            nutrients: this.getNutrientContent(
                document.getElementById('food-name').value.trim(),
                parseFloat(document.getElementById('serving-size').value),
                document.getElementById('serving-unit').value
            )
        };
    }

    resetForm() {
        document.getElementById('food-form').reset();
    }

    updateTodayIntake() {
        const today = new Date().toISOString().split('T')[0];
        const todayEntries = this.foodEntries.filter(entry => entry.date === today);

        const container = document.getElementById('today-intake');

        if (todayEntries.length === 0) {
            container.innerHTML = '<p class="no-data">No foods logged today. Start tracking your meals to get deficiency risk estimates.</p>';
            return;
        }

        // Group by meal type
        const meals = {};
        todayEntries.forEach(entry => {
            if (!meals[entry.mealType]) {
                meals[entry.mealType] = [];
            }
            meals[entry.mealType].push(entry);
        });

        container.innerHTML = Object.keys(meals).map(mealType => this.createMealSectionHTML(mealType, meals[mealType])).join('');
    }

    createMealSectionHTML(mealType, entries) {
        const capitalizedMeal = mealType.charAt(0).toUpperCase() + mealType.slice(1);
        const entriesHTML = entries.map(entry => this.createFoodItemHTML(entry)).join('');

        return `
            <div class="meal-section">
                <h3>${capitalizedMeal}</h3>
                <div class="meal-items">
                    ${entriesHTML}
                </div>
            </div>
        `;
    }

    createFoodItemHTML(entry) {
        return `
            <div class="food-item" data-id="${entry.id}">
                <div class="food-info">
                    <h4>${entry.name}</h4>
                    <div class="food-details">
                        <span class="food-category">${this.formatCategory(entry.category)}</span>
                        <span class="food-serving">${entry.servingSize} ${entry.servingUnit}</span>
                    </div>
                </div>
                <div class="food-actions">
                    <button class="delete-btn" onclick="estimator.deleteFoodEntry(${entry.id})">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    }

    deleteFoodEntry(entryId) {
        this.foodEntries = this.foodEntries.filter(entry => entry.id !== entryId);
        this.saveFoodEntries();
        this.updateTodayIntake();
        this.updateAnalysis();
        this.updateCriticalNutrients();
        this.updateHistory();
        this.updateInsights();
        this.showSuccessMessage('Food entry deleted successfully!');
    }

    updateAnalysis() {
        const today = new Date().toISOString().split('T')[0];
        const todayEntries = this.foodEntries.filter(entry => entry.date === today);

        // Calculate overall risk score
        const riskScore = this.calculateOverallRisk(todayEntries);
        document.getElementById('overall-risk').textContent = `${Math.round(riskScore)}%`;

        // Update risk indicator
        const riskIndicator = document.getElementById('risk-indicator');
        riskIndicator.style.setProperty('--risk-position', `${riskScore}%`);

        // Calculate nutrient diversity
        const diversityScore = this.calculateNutrientDiversity(todayEntries);
        document.getElementById('diversity-score').textContent = `${diversityScore}/15`;

        const diversityFill = document.getElementById('diversity-fill');
        diversityFill.style.width = `${(diversityScore / 15) * 100}%`;

        // Calculate tracking days
        const uniqueDays = new Set(this.foodEntries.map(entry => entry.date)).size;
        document.getElementById('tracking-days').textContent = uniqueDays;

        // Update nutrient chart
        this.updateNutrientChart(todayEntries);
    }

    calculateOverallRisk(entries) {
        if (entries.length === 0) return 100;

        const nutrientLevels = this.calculateDailyNutrientLevels(entries);
        const criticalNutrients = ['vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k',
                                 'vitamin_b6', 'vitamin_b12', 'folate', 'iron', 'calcium',
                                 'magnesium', 'zinc', 'copper', 'selenium'];

        let totalRisk = 0;
        criticalNutrients.forEach(nutrient => {
            const level = nutrientLevels[nutrient] || 0;
            const rda = this.getRDA(nutrient);
            const risk = Math.max(0, Math.min(100, ((rda - level) / rda) * 100));
            totalRisk += risk;
        });

        return totalRisk / criticalNutrients.length;
    }

    calculateNutrientDiversity(entries) {
        const nutrientsPresent = new Set();

        entries.forEach(entry => {
            if (entry.nutrients) {
                Object.keys(entry.nutrients).forEach(nutrient => {
                    if (entry.nutrients[nutrient] > 0) {
                        nutrientsPresent.add(nutrient);
                    }
                });
            }
        });

        // Count major nutrient categories
        const categories = {
            vitamins: ['vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k', 'vitamin_b6', 'vitamin_b12', 'folate'],
            minerals: ['iron', 'calcium', 'magnesium', 'zinc', 'copper', 'selenium'],
            other: ['fiber', 'omega_3', 'protein']
        };

        let diversityScore = 0;
        Object.values(categories).forEach(category => {
            const presentInCategory = category.filter(nutrient => nutrientsPresent.has(nutrient));
            diversityScore += Math.min(presentInCategory.length, 3); // Max 3 points per category
        });

        return Math.min(diversityScore, 15);
    }

    calculateDailyNutrientLevels(entries) {
        const levels = {};

        entries.forEach(entry => {
            if (entry.nutrients) {
                Object.keys(entry.nutrients).forEach(nutrient => {
                    levels[nutrient] = (levels[nutrient] || 0) + entry.nutrients[nutrient];
                });
            }
        });

        return levels;
    }

    updateNutrientChart(entries) {
        const ctx = document.getElementById('nutrient-chart').getContext('2d');

        if (this.charts.nutrient) {
            this.charts.nutrient.destroy();
        }

        const nutrientLevels = this.calculateDailyNutrientLevels(entries);
        const criticalNutrients = [
            { key: 'vitamin_c', name: 'Vitamin C', unit: 'mg' },
            { key: 'vitamin_d', name: 'Vitamin D', unit: 'IU' },
            { key: 'iron', name: 'Iron', unit: 'mg' },
            { key: 'calcium', name: 'Calcium', unit: 'mg' },
            { key: 'magnesium', name: 'Magnesium', unit: 'mg' },
            { key: 'zinc', name: 'Zinc', unit: 'mg' }
        ];

        const labels = criticalNutrients.map(n => n.name);
        const data = criticalNutrients.map(n => {
            const level = nutrientLevels[n.key] || 0;
            const rda = this.getRDA(n.key);
            return Math.min((level / rda) * 100, 150); // Cap at 150% for visualization
        });

        const backgroundColors = data.map(value => {
            if (value < 50) return 'rgba(244, 67, 54, 0.7)'; // Red for deficient
            if (value < 80) return 'rgba(255, 152, 0, 0.7)'; // Orange for low
            if (value < 120) return 'rgba(76, 175, 80, 0.7)'; // Green for adequate
            return 'rgba(46, 125, 50, 0.7)'; // Dark green for high
        });

        this.charts.nutrient = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '% of Daily Recommended Intake',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Key Nutrient Levels (% of RDA)',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 150,
                        title: {
                            display: true,
                            text: '% of Recommended Daily Allowance'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Nutrients'
                        }
                    }
                }
            }
        });
    }

    updateCriticalNutrients() {
        const today = new Date().toISOString().split('T')[0];
        const todayEntries = this.foodEntries.filter(entry => entry.date === today);
        const nutrientLevels = this.calculateDailyNutrientLevels(todayEntries);

        const criticalNutrients = [
            { key: 'vitamin_c', name: 'Vitamin C', unit: 'mg', rda: 90 },
            { key: 'vitamin_d', name: 'Vitamin D', unit: 'IU', rda: 600 },
            { key: 'iron', name: 'Iron', unit: 'mg', rda: 18 },
            { key: 'calcium', name: 'Calcium', unit: 'mg', rda: 1000 },
            { key: 'magnesium', name: 'Magnesium', unit: 'mg', rda: 400 },
            { key: 'zinc', name: 'Zinc', unit: 'mg', rda: 11 },
            { key: 'vitamin_a', name: 'Vitamin A', unit: 'IU', rda: 900 },
            { key: 'folate', name: 'Folate', unit: 'mcg', rda: 400 }
        ];

        const container = document.getElementById('critical-nutrients');

        if (todayEntries.length === 0) {
            container.innerHTML = '<p class="no-data">Log some foods to see your nutrient status.</p>';
            return;
        }

        container.innerHTML = criticalNutrients.map(nutrient => {
            const level = nutrientLevels[nutrient.key] || 0;
            const percentage = Math.round((level / nutrient.rda) * 100);
            const riskLevel = this.getRiskLevel(percentage);

            return `
                <div class="nutrient-item">
                    <div class="nutrient-info">
                        <h4>${nutrient.name}</h4>
                        <p>${level.toFixed(1)}${nutrient.unit} of ${nutrient.rda}${nutrient.unit} RDA</p>
                    </div>
                    <div class="nutrient-status">
                        <div class="nutrient-level">${percentage}%</div>
                        <div class="nutrient-risk risk-${riskLevel}">${this.formatRiskLevel(riskLevel)}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getRiskLevel(percentage) {
        if (percentage < 30) return 'critical';
        if (percentage < 50) return 'high';
        if (percentage < 80) return 'medium';
        return 'low';
    }

    formatRiskLevel(level) {
        const levels = {
            'low': 'Adequate',
            'medium': 'Low',
            'high': 'Deficient',
            'critical': 'Severely Deficient'
        };
        return levels[level] || level;
    }

    updateHistory() {
        const container = document.getElementById('history-list');

        if (this.foodEntries.length === 0) {
            container.innerHTML = '<p class="no-data">No food history yet. Start logging your meals.</p>';
            return;
        }

        // Group by date and take last 7 days
        const dateGroups = {};
        this.foodEntries.forEach(entry => {
            if (!dateGroups[entry.date]) {
                dateGroups[entry.date] = [];
            }
            dateGroups[entry.date].push(entry);
        });

        const dates = Object.keys(dateGroups).sort().reverse().slice(0, 7);

        container.innerHTML = dates.map(date => this.createHistoryItemHTML(date, dateGroups[date])).join('');
    }

    createHistoryItemHTML(date, entries) {
        const nutrientLevels = this.calculateDailyNutrientLevels(entries);
        const riskScore = this.calculateOverallRisk(entries);
        const diversityScore = this.calculateNutrientDiversity(entries);

        const foodNames = entries.map(entry => entry.name);

        return `
            <div class="history-item">
                <div class="history-header">
                    <div class="history-date">${this.formatDate(date)}</div>
                    <div class="history-risk">Risk: ${Math.round(riskScore)}%</div>
                </div>
                <div class="history-stats">
                    <div class="stat-item">
                        <span>Foods:</span>
                        <span>${entries.length}</span>
                    </div>
                    <div class="stat-item">
                        <span>Diversity:</span>
                        <span>${diversityScore}/15</span>
                    </div>
                    <div class="stat-item">
                        <span>Key Nutrients:</span>
                        <span>${this.countAdequateNutrients(nutrientLevels)}/8</span>
                    </div>
                </div>
                <div class="history-foods">
                    ${foodNames.slice(0, 6).map(name => `<div class="history-food">${name}</div>`).join('')}
                    ${foodNames.length > 6 ? `<div class="history-food">+${foodNames.length - 6} more</div>` : ''}
                </div>
            </div>
        `;
    }

    countAdequateNutrients(levels) {
        const criticalNutrients = ['vitamin_c', 'vitamin_d', 'iron', 'calcium', 'magnesium', 'zinc', 'vitamin_a', 'folate'];
        return criticalNutrients.filter(nutrient => {
            const level = levels[nutrient] || 0;
            const rda = this.getRDA(nutrient);
            return (level / rda) >= 0.8; // At least 80% of RDA
        }).length;
    }

    updateInsights() {
        const insightsContainer = document.getElementById('insights-content');

        if (this.foodEntries.length < 3) {
            // Keep default insights
            return;
        }

        const insights = this.generateInsights();
        if (insights.length > 0) {
            const insightsHTML = insights.map(insight => `
                <div class="insight-card">
                    <h3>${insight.title}</h3>
                    <p>${insight.description}</p>
                </div>
            `).join('');

            insightsContainer.innerHTML += insightsHTML;
        }
    }

    generateInsights() {
        const insights = [];

        // Analyze recent patterns
        const recentEntries = this.getRecentEntries(7);
        if (recentEntries.length >= 3) {
            const patternInsight = this.analyzeDietaryPatterns(recentEntries);
            if (patternInsight) insights.push(patternInsight);

            const deficiencyInsight = this.identifyCommonDeficiencies(recentEntries);
            if (deficiencyInsight) insights.push(deficiencyInsight);

            const improvementInsight = this.suggestImprovements(recentEntries);
            if (improvementInsight) insights.push(improvementInsight);
        }

        return insights;
    }

    getRecentEntries(days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return this.foodEntries.filter(entry => new Date(entry.date) >= cutoffDate);
    }

    analyzeDietaryPatterns(entries) {
        const categories = {};
        entries.forEach(entry => {
            categories[entry.category] = (categories[entry.category] || 0) + 1;
        });

        const totalEntries = entries.length;
        const vegetablePercentage = (categories['vegetables'] || 0) / totalEntries * 100;
        const proteinPercentage = (categories['proteins'] || 0) / totalEntries * 100;

        if (vegetablePercentage < 20) {
            return {
                title: '🥗 Increase Vegetable Intake',
                description: `Only ${Math.round(vegetablePercentage)}% of your meals include vegetables. Aim for vegetables in at least 50% of your meals for better nutrient diversity.`
            };
        }

        if (proteinPercentage > 60) {
            return {
                title: '⚖️ Balance Your Plate',
                description: `Protein makes up ${Math.round(proteinPercentage)}% of your diet. While important, consider adding more vegetables, fruits, and whole grains for micronutrient balance.`
            };
        }

        return null;
    }

    identifyCommonDeficiencies(entries) {
        const nutrientLevels = this.calculateDailyNutrientLevels(entries);
        const avgLevels = {};

        // Calculate average daily levels
        const uniqueDays = new Set(entries.map(e => e.date)).size;
        Object.keys(nutrientLevels).forEach(nutrient => {
            avgLevels[nutrient] = nutrientLevels[nutrient] / uniqueDays;
        });

        const deficiencies = [];
        const criticalNutrients = [
            { key: 'vitamin_d', name: 'Vitamin D' },
            { key: 'iron', name: 'Iron' },
            { key: 'calcium', name: 'Calcium' },
            { key: 'magnesium', name: 'Magnesium' }
        ];

        criticalNutrients.forEach(nutrient => {
            const level = avgLevels[nutrient.key] || 0;
            const rda = this.getRDA(nutrient.key);
            if ((level / rda) < 0.7) {
                deficiencies.push(nutrient.name);
            }
        });

        if (deficiencies.length > 0) {
            return {
                title: '⚠️ Potential Deficiencies Detected',
                description: `Your diet may be low in: ${deficiencies.join(', ')}. Consider adding fortified foods, supplements, or nutrient-rich sources after consulting a healthcare provider.`
            };
        }

        return null;
    }

    suggestImprovements(entries) {
        const categories = {};
        entries.forEach(entry => {
            categories[entry.category] = (categories[entry.category] || 0) + 1;
        });

        if (!categories['nuts-seeds'] || categories['nuts-seeds'] < entries.length * 0.1) {
            return {
                title: '🌰 Add Healthy Fats',
                description: 'Consider adding nuts, seeds, avocados, or olive oil to your meals. These provide essential fatty acids and help with nutrient absorption.'
            };
        }

        if (!categories['fruits'] || categories['fruits'] < entries.length * 0.15) {
            return {
                title: '🍎 Boost Fruit Intake',
                description: 'Fruits provide vitamins, fiber, and antioxidants. Aim to include at least one serving of fruit with each meal for better micronutrient coverage.'
            };
        }

        return null;
    }

    // Nutrient database and utility methods
    initializeNutrientDatabase() {
        return {
            // Vegetables
            'spinach': { vitamin_a: 9377, vitamin_c: 28.1, vitamin_k: 482.9, folate: 194, iron: 2.7, calcium: 99, magnesium: 79, zinc: 0.5 },
            'broccoli': { vitamin_a: 623, vitamin_c: 89.2, vitamin_k: 101.6, folate: 63, iron: 0.7, calcium: 47, magnesium: 21, zinc: 0.4 },
            'kale': { vitamin_a: 5000, vitamin_c: 93.4, vitamin_k: 817, folate: 62, iron: 1.5, calcium: 254, magnesium: 33, zinc: 0.4 },
            'carrots': { vitamin_a: 16706, vitamin_c: 5.9, vitamin_k: 13.2, folate: 19, iron: 0.3, calcium: 33, magnesium: 12, zinc: 0.2 },
            'sweet potato': { vitamin_a: 19218, vitamin_c: 2.4, vitamin_k: 1.8, folate: 6, iron: 0.6, calcium: 30, magnesium: 25, zinc: 0.3 },

            // Fruits
            'orange': { vitamin_a: 225, vitamin_c: 53.2, folate: 30, calcium: 40, magnesium: 10, zinc: 0.1 },
            'strawberries': { vitamin_a: 12, vitamin_c: 58.8, folate: 24, calcium: 16, magnesium: 13, zinc: 0.1 },
            'banana': { vitamin_a: 64, vitamin_c: 8.7, folate: 20, calcium: 5, magnesium: 27, zinc: 0.2 },
            'apple': { vitamin_a: 54, vitamin_c: 4.6, folate: 3, calcium: 6, magnesium: 5, zinc: 0.1 },

            // Proteins
            'salmon': { vitamin_a: 149, vitamin_d: 447, vitamin_b12: 3.2, iron: 0.8, calcium: 9, magnesium: 29, zinc: 0.6, omega_3: 2.3 },
            'chicken breast': { vitamin_b6: 0.6, vitamin_b12: 0.3, iron: 0.7, zinc: 1.0, protein: 31 },
            'eggs': { vitamin_a: 540, vitamin_d: 41, vitamin_b12: 0.6, vitamin_b6: 0.1, iron: 1.8, zinc: 1.3, protein: 6 },
            'tofu': { vitamin_b6: 0.1, iron: 2.7, calcium: 350, magnesium: 37, zinc: 0.8, protein: 8 },

            // Dairy
            'milk': { vitamin_a: 395, vitamin_d: 124, vitamin_b12: 1.1, calcium: 276, magnesium: 24, zinc: 0.4, protein: 8 },
            'yogurt': { vitamin_a: 218, vitamin_d: 0, vitamin_b12: 0.7, calcium: 243, magnesium: 19, zinc: 0.5, protein: 10 },
            'cheese': { vitamin_a: 174, vitamin_d: 7, vitamin_b12: 0.8, calcium: 721, magnesium: 20, zinc: 2.4, protein: 7 },

            // Grains
            'oats': { vitamin_b6: 0.1, folate: 56, iron: 4.7, magnesium: 144, zinc: 2.7, fiber: 4 },
            'brown rice': { vitamin_b6: 0.3, folate: 9, iron: 0.8, magnesium: 43, zinc: 1.2, fiber: 1.8 },
            'quinoa': { vitamin_b6: 0.2, folate: 184, iron: 4.6, magnesium: 197, zinc: 3.1, fiber: 2.6, protein: 4 },

            // Nuts & Seeds
            'almonds': { vitamin_a: 1, vitamin_e: 26.2, vitamin_b6: 0.1, folate: 44, iron: 3.7, calcium: 269, magnesium: 270, zinc: 3.1 },
            'walnuts': { vitamin_a: 20, vitamin_e: 0.7, vitamin_b6: 0.6, folate: 98, iron: 2.9, magnesium: 158, zinc: 3.1, omega_3: 2.5 },
            'chia seeds': { vitamin_a: 16, vitamin_b6: 0.6, folate: 58, calcium: 631, magnesium: 335, zinc: 4.6, omega_3: 4.9, fiber: 10 },

            // Default values for unknown foods
            'default': { vitamin_c: 10, vitamin_a: 100, iron: 0.5, calcium: 20, magnesium: 10, zinc: 0.3 }
        };
    }

    getNutrientContent(foodName, servingSize, servingUnit) {
        const foodKey = foodName.toLowerCase();
        const baseNutrients = this.nutrientDatabase[foodKey] || this.nutrientDatabase['default'];

        // Adjust for serving size (assuming database values are per 100g or typical serving)
        const multiplier = this.getServingMultiplier(servingSize, servingUnit);

        const adjustedNutrients = {};
        Object.keys(baseNutrients).forEach(nutrient => {
            adjustedNutrients[nutrient] = baseNutrients[nutrient] * multiplier;
        });

        return adjustedNutrients;
    }

    getServingMultiplier(servingSize, servingUnit) {
        // Convert to standard serving size (assuming database is per 100g or 1 cup)
        const conversions = {
            'cup': 1, // Assume database values are per cup
            'oz': 0.125, // 1 oz = 1/8 cup
            'g': 0.01, // 1g = 1/100 of 100g serving
            'tbsp': 0.0625, // 1 tbsp = 1/16 cup
            'tsp': 0.0208, // 1 tsp = 1/48 cup
            'piece': 1 // Assume piece = standard serving
        };

        return servingSize * (conversions[servingUnit] || 1);
    }

    getRDA(nutrient) {
        const rdas = {
            'vitamin_a': 900, // IU
            'vitamin_c': 90, // mg
            'vitamin_d': 600, // IU
            'vitamin_e': 15, // mg
            'vitamin_k': 120, // mcg
            'vitamin_b6': 1.7, // mg
            'vitamin_b12': 2.4, // mcg
            'folate': 400, // mcg
            'iron': 18, // mg (men), using higher value
            'calcium': 1000, // mg
            'magnesium': 400, // mg
            'zinc': 11, // mg
            'copper': 0.9, // mg
            'selenium': 55 // mcg
        };

        return rdas[nutrient] || 100; // Default RDA
    }

    // Utility methods
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    formatCategory(category) {
        return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    // Data persistence methods
    loadFoodEntries() {
        const stored = localStorage.getItem('micronutrient-food-entries');
        return stored ? JSON.parse(stored) : [];
    }

    saveFoodEntries() {
        localStorage.setItem('micronutrient-food-entries', JSON.stringify(this.foodEntries));
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Create a temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        if (type === 'success') {
            messageEl.style.backgroundColor = 'var(--nutrient-primary)';
        } else {
            messageEl.style.backgroundColor = 'var(--risk-critical)';
        }

        document.body.appendChild(messageEl);

        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(messageEl);
            }, 300);
        }, 3000);
    }
}

// Initialize the estimator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.estimator = new MicronutrientDeficiencyRiskEstimator();
});

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }

    .meal-section {
        margin-bottom: 2rem;
    }

    .meal-section h3 {
        color: var(--nutrient-dark);
        margin-bottom: 1rem;
        font-size: 1.2rem;
    }

    .meal-items {
        display: grid;
        gap: 0.5rem;
    }
`;
document.head.appendChild(style);