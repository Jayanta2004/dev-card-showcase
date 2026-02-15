// Vitamin K Intake Tracker JavaScript
// This module tracks Vitamin K consumption through food logging and provides insights for bone health

class VitaminKTracker {
    constructor() {
        // Initialize intake data from localStorage
        this.intakeData = this.loadData();
        // Chart instance for Chart.js
        this.chart = null;
        // Vitamin K food database
        this.vitaminKDatabase = {
            kale: { name: 'Kale (1 cup cooked)', amount: 1062.1 },
            spinach: { name: 'Spinach (1 cup cooked)', amount: 888.5 },
            broccoli: { name: 'Broccoli (1 cup cooked)', amount: 220.0 },
            brussels_sprouts: { name: 'Brussels Sprouts (1 cup cooked)', amount: 218.6 },
            parsley: { name: 'Parsley (1/4 cup fresh)', amount: 246.0 },
            green_beans: { name: 'Green Beans (1 cup cooked)', amount: 79.0 },
            asparagus: { name: 'Asparagus (1 cup cooked)', amount: 91.7 },
            lettuce: { name: 'Lettuce (1 cup raw)', amount: 62.5 },
            cabbage: { name: 'Cabbage (1 cup cooked)', amount: 163.0 },
            prunes: { name: 'Prunes (5 medium)', amount: 51.6 },
            kiwi: { name: 'Kiwi (1 medium)', amount: 40.3 },
            avocado: { name: 'Avocado (1/2 medium)', amount: 42.0 },
            blueberries: { name: 'Blueberries (1 cup)', amount: 28.6 },
            pomegranate: { name: 'Pomegranate (1/2 medium)', amount: 23.0 }
        };
        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application by setting up event listeners and rendering all components
     */
    init() {
        this.setupEventListeners();
        this.updateDashboard();
        this.renderChart();
        this.renderHistory();
        this.renderInsights();
        this.setupFoodSelector();
    }

    /**
     * Set up all event listeners for user interactions
     */
    setupEventListeners() {
        // Form submission for logging food intake
        document.getElementById('vitaminKForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logFoodIntake();
        });

        // Food selection change to show/hide custom amount
        document.getElementById('foodName').addEventListener('change', () => {
            this.toggleCustomAmount();
        });

        // Chart time range controls
        document.getElementById('timeRange').addEventListener('change', () => {
            this.renderChart();
        });

        document.getElementById('refreshChart').addEventListener('click', () => {
            this.renderChart();
        });

        // History view controls
        document.getElementById('viewRecent').addEventListener('click', () => {
            this.toggleHistoryView('recent');
        });

        document.getElementById('viewAll').addEventListener('click', () => {
            this.toggleHistoryView('all');
        });
    }

    /**
     * Set up food selector with dynamic serving unit updates
     */
    setupFoodSelector() {
        const foodSelect = document.getElementById('foodName');
        const servingUnit = document.getElementById('servingUnit');

        foodSelect.addEventListener('change', () => {
            const selectedFood = foodSelect.value;
            if (selectedFood && selectedFood !== 'custom') {
                servingUnit.textContent = 'serving(s)';
            } else {
                servingUnit.textContent = 'mcg';
            }
        });
    }

    /**
     * Toggle custom amount input visibility
     */
    toggleCustomAmount() {
        const foodSelect = document.getElementById('foodName');
        const customGroup = document.getElementById('customAmountGroup');
        const servingSize = document.getElementById('servingSize');
        const servingUnit = document.getElementById('servingUnit');

        if (foodSelect.value === 'custom') {
            customGroup.style.display = 'block';
            servingSize.value = 1;
            servingUnit.textContent = 'mcg';
        } else {
            customGroup.style.display = 'none';
            servingSize.value = 1;
            servingUnit.textContent = 'serving(s)';
        }
    }

    /**
     * Log a new food intake entry
     * Calculates Vitamin K amount and validates input
     */
    logFoodIntake() {
        // Collect form data
        const formData = {
            id: Date.now(),
            date: document.getElementById('foodDate').value,
            foodName: document.getElementById('foodName').value,
            servingSize: parseFloat(document.getElementById('servingSize').value),
            mealType: document.getElementById('mealType').value
        };

        // Calculate Vitamin K amount
        let vitaminKAmount = 0;
        if (formData.foodName === 'custom') {
            vitaminKAmount = parseFloat(document.getElementById('customVitaminK').value) || 0;
            formData.foodDisplayName = 'Custom Food';
        } else {
            const foodData = this.vitaminKDatabase[formData.foodName];
            if (foodData) {
                vitaminKAmount = foodData.amount * formData.servingSize;
                formData.foodDisplayName = foodData.name;
            }
        }

        // Validate amount
        if (vitaminKAmount <= 0) {
            alert('Please enter a valid Vitamin K amount.');
            return;
        }

        // Add calculated fields
        formData.vitaminKAmount = vitaminKAmount;
        formData.timestamp = new Date().toISOString();

        // Save to data array
        this.intakeData.push(formData);
        this.saveData();

        // Reset form
        document.getElementById('vitaminKForm').reset();
        this.toggleCustomAmount();

        // Update UI
        this.updateDashboard();
        this.renderChart();
        this.renderHistory();
        this.renderInsights();

        // Show success message
        this.showNotification('Food logged successfully!', 'success');
    }

    /**
     * Update the dashboard with current metrics
     */
    updateDashboard() {
        if (this.intakeData.length === 0) {
            this.resetDashboard();
            return;
        }

        // Calculate today's intake
        const today = new Date().toISOString().split('T')[0];
        const todayIntake = this.intakeData
            .filter(entry => entry.date === today)
            .reduce((sum, entry) => sum + entry.vitaminKAmount, 0);

        // Calculate 7-day average
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentData = this.intakeData.filter(entry =>
            new Date(entry.date) >= sevenDaysAgo
        );
        const weeklyAverage = recentData.length > 0 ?
            recentData.reduce((sum, entry) => sum + entry.vitaminKAmount, 0) / 7 : 0;

        const totalLogged = this.intakeData.length;

        // Calculate intake score (0-100 based on RDA achievement)
        const dailyTarget = 105; // Average RDA
        const intakeScore = Math.min(Math.round((weeklyAverage / dailyTarget) * 100), 100);

        // Update DOM
        document.getElementById('dailyIntake').textContent = `${Math.round(todayIntake)} mcg`;
        document.getElementById('weeklyAverage').textContent = `${Math.round(weeklyAverage)} mcg`;
        document.getElementById('totalLogged').textContent = totalLogged;
        document.getElementById('intakeScore').textContent = intakeScore;

        // Update progress bar
        this.updateProgressBar(todayIntake);
    }

    /**
     * Reset dashboard to default values
     */
    resetDashboard() {
        document.getElementById('dailyIntake').textContent = '--';
        document.getElementById('weeklyAverage').textContent = '--';
        document.getElementById('totalLogged').textContent = '0';
        document.getElementById('intakeScore').textContent = '--';
        this.updateProgressBar(0);
    }

    /**
     * Update the daily progress bar
     */
    updateProgressBar(currentAmount) {
        const fill = document.getElementById('dailyProgressFill');
        const currentLabel = document.getElementById('currentProgress');

        const percentage = Math.min((currentAmount / 120) * 100, 100);
        fill.style.setProperty('--fill-width', `${percentage}%`);
        fill.style.width = `${percentage}%`;

        currentLabel.textContent = `${Math.round(currentAmount)} mcg`;
    }

    /**
     * Render the intake trends chart
     */
    renderChart() {
        const ctx = document.getElementById('intakeChart').getContext('2d');
        const timeRange = document.getElementById('timeRange').value;

        // Filter data based on time range
        const filteredData = this.filterDataByTimeRange(timeRange);

        // Group by date and calculate total intake
        const dateGroups = {};
        filteredData.forEach(entry => {
            const date = entry.date;
            if (!dateGroups[date]) dateGroups[date] = 0;
            dateGroups[date] += entry.vitaminKAmount;
        });

        const labels = Object.keys(dateGroups).sort();
        const data = labels.map(date => dateGroups[date]);

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        // Create new chart
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Vitamin K Intake (mcg)',
                    data: data,
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Vitamin K (mcg)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    /**
     * Render the food history
     */
    renderHistory(view = 'recent') {
        const historyList = document.getElementById('foodHistory');
        let dataToShow = this.intakeData;

        if (view === 'recent') {
            dataToShow = this.intakeData.slice(-10).reverse();
        } else {
            dataToShow = this.intakeData.slice().reverse();
        }

        historyList.innerHTML = '';

        if (dataToShow.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No foods logged yet.</p>';
            return;
        }

        dataToShow.forEach(entry => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';

            const mealTypeLabel = this.capitalizeFirst(entry.mealType);
            const date = new Date(entry.date).toLocaleDateString();

            historyItem.innerHTML = `
                <div class="history-item-header">
                    <div class="history-item-title">${entry.foodDisplayName || entry.foodName}</div>
                    <div class="history-item-amount">${Math.round(entry.vitaminKAmount)} mcg</div>
                </div>
                <div class="history-item-details">
                    <p><strong>Serving:</strong> ${entry.servingSize} ${entry.foodName === 'custom' ? 'mcg' : 'serving(s)'}</p>
                    <p><strong>Meal:</strong> ${mealTypeLabel}</p>
                </div>
                <div class="history-item-meta">
                    <span>${date}</span>
                    <span>ID: ${entry.id}</span>
                </div>
            `;

            historyList.appendChild(historyItem);
        });
    }

    /**
     * Render Vitamin K insights
     */
    renderInsights() {
        if (this.intakeData.length === 0) return;

        // Intake patterns
        const dailyIntakes = {};
        this.intakeData.forEach(entry => {
            if (!dailyIntakes[entry.date]) dailyIntakes[entry.date] = 0;
            dailyIntakes[entry.date] += entry.vitaminKAmount;
        });

        const intakes = Object.values(dailyIntakes);
        const avgIntake = intakes.reduce((a, b) => a + b, 0) / intakes.length;
        const intakePatterns = document.getElementById('intakePatterns');

        let patternText = `Your average daily Vitamin K intake is ${Math.round(avgIntake)} mcg. `;

        if (avgIntake >= 90) {
            patternText += 'You\'re meeting or exceeding the recommended daily allowance!';
        } else if (avgIntake >= 60) {
            patternText += 'You\'re getting a moderate amount. Consider adding more leafy greens to reach optimal levels.';
        } else {
            patternText += 'Your intake is below recommended levels. Focus on incorporating Vitamin K-rich foods like kale, spinach, and broccoli.';
        }

        intakePatterns.innerHTML = `<p>${patternText}</p>`;

        // Food sources
        const foodCounts = {};
        this.intakeData.forEach(entry => {
            const foodKey = entry.foodName === 'custom' ? 'Custom Foods' : entry.foodDisplayName;
            foodCounts[foodKey] = (foodCounts[foodKey] || 0) + 1;
        });

        const topFood = Object.entries(foodCounts)
            .sort(([,a], [,b]) => b - a)[0];

        const foodSources = document.getElementById('foodSources');
        if (topFood) {
            foodSources.innerHTML = `<p>Your primary Vitamin K source is <strong>${topFood[0]}</strong> (${topFood[1]} times). Diversifying your sources can help ensure consistent intake.</p>`;
        }

        // Bone health status
        const boneHealthStatus = document.getElementById('boneHealthStatus');
        let statusText = '';

        if (avgIntake >= 90) {
            statusText = 'Excellent! Your Vitamin K intake supports optimal bone health and calcium metabolism.';
        } else if (avgIntake >= 60) {
            statusText = 'Good progress. Continue increasing intake to maximize bone health benefits.';
        } else {
            statusText = 'Consider increasing Vitamin K-rich foods to support bone density and cardiovascular health.';
        }

        boneHealthStatus.innerHTML = `<p>${statusText}</p>`;

        // Render tips
        this.renderTips();
    }

    /**
     * Render personalized tips based on data
     */
    renderTips() {
        const tipsList = document.getElementById('tips');
        tipsList.innerHTML = '';

        if (this.intakeData.length < 3) {
            this.addTip('Start logging your Vitamin K-rich foods to get personalized insights and track your bone health progress.', '🥬');
            return;
        }

        const avgIntake = this.intakeData.reduce((sum, entry) => sum + entry.vitaminKAmount, 0) / this.intakeData.length;

        if (avgIntake < 90) {
            this.addTip('Try adding kale or spinach to your meals - they\'re among the richest sources of Vitamin K!', '🥬');
            this.addTip('Consider having a green smoothie with kale, spinach, and kiwi for a Vitamin K boost.', '🥤');
        }

        if (avgIntake >= 90) {
            this.addTip('Great job maintaining healthy Vitamin K levels! Continue with your current eating habits.', '⭐');
        }

        // Check meal distribution
        const mealCounts = {};
        this.intakeData.forEach(entry => {
            mealCounts[entry.mealType] = (mealCounts[entry.mealType] || 0) + 1;
        });

        const mostCommonMeal = Object.entries(mealCounts)
            .sort(([,a], [,b]) => b - a)[0];

        if (mostCommonMeal && mostCommonMeal[1] > this.intakeData.length * 0.7) {
            this.addTip(`You mostly get Vitamin K from ${this.capitalizeFirst(mostCommonMeal[0])}. Try distributing intake across all meals for better absorption.`, '🍽️');
        }

        this.addTip('Vitamin K works synergistically with Vitamin D and calcium for bone health. Consider your overall nutrient intake.', '🦴');
    }

    /**
     * Add a tip to the tips list
     */
    addTip(text, icon) {
        const tipItem = document.createElement('div');
        tipItem.className = 'tip-item';
        tipItem.innerHTML = `
            <h4>${icon} Tip</h4>
            <p>${text}</p>
        `;
        document.getElementById('tips').appendChild(tipItem);
    }

    /**
     * Toggle between recent and all history views
     */
    toggleHistoryView(view) {
        // Update button states
        document.getElementById('viewRecent').classList.toggle('active', view === 'recent');
        document.getElementById('viewAll').classList.toggle('active', view === 'all');

        // Render history
        this.renderHistory(view);
    }

    /**
     * Filter data by time range
     */
    filterDataByTimeRange(range) {
        if (range === 'all') return this.intakeData;

        const days = parseInt(range);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return this.intakeData.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= cutoffDate;
        });
    }

    /**
     * Capitalize first letter of string
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Show notification message
     */
    showNotification(message, type = 'info') {
        // Simple alert for now - could be enhanced with toast notifications
        alert(message);
    }

    /**
     * Load data from localStorage
     */
    loadData() {
        const data = localStorage.getItem('vitaminKIntakeData');
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save data to localStorage
     */
    saveData() {
        localStorage.setItem('vitaminKIntakeData', JSON.stringify(this.intakeData));
    }
}

// Initialize the tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VitaminKTracker();
});