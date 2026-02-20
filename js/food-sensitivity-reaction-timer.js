// Food Sensitivity Reaction Timer JavaScript
// This module tracks food intake and reaction timing to identify sensitivities

class FoodSensitivityTracker {
    constructor() {
        // Initialize data from localStorage
        this.meals = this.loadMeals();
        this.reactions = this.loadReactions();
        // Chart instance for Chart.js
        this.chart = null;
        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application by setting up event listeners and rendering all components
     */
    init() {
        this.setupEventListeners();
        this.updateDashboard();
        this.renderAnalysis();
        this.renderChart();
        this.renderMealHistory();
        this.renderReactionHistory();
        this.renderSuspectedTriggers();
        this.updateSeveritySlider();
    }

    /**
     * Set up all event listeners for user interactions
     */
    setupEventListeners() {
        // Meal logging form
        document.getElementById('mealForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logMeal();
        });

        // Reaction logging form
        document.getElementById('reactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logReaction();
        });

        // Severity slider updates
        document.getElementById('reactionSeverity').addEventListener('input', () => {
            this.updateSeveritySlider();
        });

        // Analysis controls
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.renderAnalysis();
        });

        // History view controls
        document.getElementById('viewRecentMeals').addEventListener('click', () => {
            this.toggleMealHistoryView('recent');
        });

        document.getElementById('viewAllMeals').addEventListener('click', () => {
            this.toggleMealHistoryView('all');
        });

        document.getElementById('viewRecentReactions').addEventListener('click', () => {
            this.toggleReactionHistoryView('recent');
        });

        document.getElementById('viewAllReactions').addEventListener('click', () => {
            this.toggleReactionHistoryView('all');
        });
    }

    /**
     * Update severity slider display
     */
    updateSeveritySlider() {
        const value = document.getElementById('reactionSeverity').value;
        document.getElementById('severityValue').textContent = value;
        document.getElementById('severityText').textContent = this.getSeverityLabel(value);
    }

    /**
     * Get severity level label based on rating
     */
    getSeverityLabel(rating) {
        const labels = {
            1: 'Mild', 2: 'Mild', 3: 'Mild',
            4: 'Moderate', 5: 'Moderate', 6: 'Moderate',
            7: 'Severe', 8: 'Severe', 9: 'Severe', 10: 'Critical'
        };
        return labels[rating] || 'Moderate';
    }

    /**
     * Log a new meal
     */
    logMeal() {
        const formData = {
            id: Date.now(),
            dateTime: document.getElementById('mealDateTime').value,
            description: document.getElementById('mealDescription').value,
            categories: Array.from(document.querySelectorAll('input[name="categories"]:checked'))
                .map(checkbox => checkbox.value),
            portion: document.getElementById('mealPortion').value,
            notes: document.getElementById('mealNotes').value,
            timestamp: new Date().toISOString()
        };

        this.meals.push(formData);
        this.saveMeals();

        // Reset form
        document.getElementById('mealForm').reset();
        // Uncheck all category checkboxes
        document.querySelectorAll('input[name="categories"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Update UI
        this.updateDashboard();
        this.renderMealHistory();
        this.renderSuspectedTriggers();

        // Show success message
        this.showNotification('Meal logged successfully!', 'success');
    }

    /**
     * Log a new reaction
     */
    logReaction() {
        const formData = {
            id: Date.now(),
            dateTime: document.getElementById('reactionDateTime').value,
            symptoms: Array.from(document.querySelectorAll('input[name="symptoms"]:checked'))
                .map(checkbox => checkbox.value),
            severity: parseInt(document.getElementById('reactionSeverity').value),
            notes: document.getElementById('reactionNotes').value,
            timestamp: new Date().toISOString()
        };

        this.reactions.push(formData);
        this.saveReactions();

        // Reset form
        document.getElementById('reactionForm').reset();
        // Uncheck all symptom checkboxes
        document.querySelectorAll('input[name="symptoms"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateSeveritySlider();

        // Update UI
        this.updateDashboard();
        this.renderAnalysis();
        this.renderChart();
        this.renderReactionHistory();
        this.renderSuspectedTriggers();

        // Show success message
        this.showNotification('Reaction logged successfully!', 'success');
    }

    /**
     * Load meals from localStorage
     */
    loadMeals() {
        const data = localStorage.getItem('foodSensitivityMeals');
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save meals to localStorage
     */
    saveMeals() {
        localStorage.setItem('foodSensitivityMeals', JSON.stringify(this.meals));
    }

    /**
     * Load reactions from localStorage
     */
    loadReactions() {
        const data = localStorage.getItem('foodSensitivityReactions');
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save reactions to localStorage
     */
    saveReactions() {
        localStorage.setItem('foodSensitivityReactions', JSON.stringify(this.reactions));
    }

    /**
     * Update the dashboard with current metrics
     */
    updateDashboard() {
        const totalMeals = this.meals.length;
        const totalReactions = this.reactions.length;

        // Calculate average reaction time
        const reactionTimes = this.calculateReactionTimes();
        const avgReactionTime = reactionTimes.length > 0
            ? reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length
            : 0;

        // Calculate suspected triggers
        const suspectedTriggers = this.identifySuspectedTriggers();

        // Update metrics display
        document.getElementById('totalMeals').textContent = totalMeals;
        document.getElementById('totalReactions').textContent = totalReactions;
        document.getElementById('avgReactionTime').textContent = avgReactionTime > 0
            ? this.formatReactionTime(avgReactionTime)
            : '--';
        document.getElementById('suspectedTriggers').textContent = suspectedTriggers.length;
    }

    /**
     * Calculate reaction times for all reactions
     */
    calculateReactionTimes() {
        const reactionTimes = [];

        this.reactions.forEach(reaction => {
            const reactionTime = new Date(reaction.dateTime);
            let closestMealTime = null;
            let minTimeDiff = Infinity;

            // Find the closest meal before the reaction
            this.meals.forEach(meal => {
                const mealTime = new Date(meal.dateTime);
                const timeDiff = reactionTime - mealTime;

                // Only consider meals within 72 hours before reaction
                if (timeDiff > 0 && timeDiff < (72 * 60 * 60 * 1000) && timeDiff < minTimeDiff) {
                    minTimeDiff = timeDiff;
                    closestMealTime = mealTime;
                }
            });

            if (closestMealTime) {
                reactionTimes.push(minTimeDiff);
            }
        });

        return reactionTimes;
    }

    /**
     * Format reaction time in human-readable format
     */
    formatReactionTime(milliseconds) {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    /**
     * Identify suspected food triggers based on reaction frequency
     */
    identifySuspectedTriggers() {
        const triggerCounts = {};
        const triggerReactions = {};

        this.reactions.forEach(reaction => {
            const reactionTime = new Date(reaction.dateTime);

            // Find meals within 72 hours before reaction
            this.meals.forEach(meal => {
                const mealTime = new Date(meal.dateTime);
                const timeDiff = reactionTime - mealTime;

                if (timeDiff > 0 && timeDiff < (72 * 60 * 60 * 1000)) {
                    // Count reactions for each food category
                    meal.categories.forEach(category => {
                        if (!triggerCounts[category]) {
                            triggerCounts[category] = 0;
                            triggerReactions[category] = 0;
                        }
                        triggerReactions[category]++;
                    });

                    // Also check individual foods mentioned in description
                    const foods = this.extractFoodsFromDescription(meal.description);
                    foods.forEach(food => {
                        if (!triggerCounts[food]) {
                            triggerCounts[food] = 0;
                            triggerReactions[food] = 0;
                        }
                        triggerReactions[food]++;
                    });
                }
            });
        });

        // Calculate percentages and filter significant triggers
        const totalReactions = this.reactions.length;
        const suspectedTriggers = [];

        Object.keys(triggerReactions).forEach(trigger => {
            const percentage = (triggerReactions[trigger] / totalReactions) * 100;
            if (percentage >= 20 && triggerReactions[trigger] >= 2) { // At least 20% and 2 reactions
                suspectedTriggers.push({
                    food: trigger,
                    count: triggerReactions[trigger],
                    percentage: percentage
                });
            }
        });

        return suspectedTriggers.sort((a, b) => b.percentage - a.percentage);
    }

    /**
     * Extract food items from meal description
     */
    extractFoodsFromDescription(description) {
        // Simple extraction - could be enhanced with NLP
        const commonFoods = ['chicken', 'beef', 'fish', 'salad', 'pasta', 'rice', 'bread', 'cheese',
                           'milk', 'eggs', 'nuts', 'peanuts', 'wheat', 'gluten', 'dairy', 'soy'];
        const words = description.toLowerCase().split(/\s+/);
        return words.filter(word => commonFoods.some(food => word.includes(food)));
    }

    /**
     * Render reaction timing analysis
     */
    renderAnalysis() {
        const timeRange = document.getElementById('analysisTimeRange').value;
        const container = document.getElementById('analysisResults');

        if (this.reactions.length === 0) {
            container.innerHTML = `
                <div class="analysis-placeholder">
                    <i data-lucide="bar-chart-3"></i>
                    <p>Log some reactions to see timing analysis</p>
                </div>
            `;
            return;
        }

        // Filter reactions by time range
        const filteredReactions = this.filterReactionsByTimeRange(timeRange);
        const reactionTimes = this.calculateReactionTimesForReactions(filteredReactions);

        if (reactionTimes.length === 0) {
            container.innerHTML = `
                <div class="analysis-placeholder">
                    <i data-lucide="clock"></i>
                    <p>No reactions found in the selected time range</p>
                </div>
            `;
            return;
        }

        // Analyze timing patterns
        const timingPatterns = this.analyzeTimingPatterns(reactionTimes);

        container.innerHTML = `
            <div class="analysis-summary">
                <div class="analysis-stat">
                    <div class="stat-value">${filteredReactions.length}</div>
                    <div class="stat-label">Reactions Analyzed</div>
                </div>
                <div class="analysis-stat">
                    <div class="stat-value">${this.formatReactionTime(timingPatterns.average)}</div>
                    <div class="stat-label">Average Reaction Time</div>
                </div>
                <div class="analysis-stat">
                    <div class="stat-value">${timingPatterns.commonWindow}</div>
                    <div class="stat-label">Most Common Window</div>
                </div>
            </div>
            <div class="timing-breakdown">
                <h3>Reaction Time Distribution</h3>
                <div class="timing-windows">
                    ${timingPatterns.windows.map(window => `
                        <div class="timing-window">
                            <div class="window-label">${window.label}</div>
                            <div class="window-bar">
                                <div class="window-fill" style="width: ${window.percentage}%"></div>
                            </div>
                            <div class="window-count">${window.count} reactions</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Re-initialize Lucide icons
        lucide.createIcons();
    }

    /**
     * Filter reactions by time range
     */
    filterReactionsByTimeRange(range) {
        if (range === 'all') {
            return this.reactions;
        }

        const hours = parseInt(range);
        const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));

        return this.reactions.filter(reaction => {
            const reactionTime = new Date(reaction.dateTime);
            return reactionTime >= cutoffTime;
        });
    }

    /**
     * Calculate reaction times for specific reactions
     */
    calculateReactionTimesForReactions(reactions) {
        const reactionTimes = [];

        reactions.forEach(reaction => {
            const reactionTime = new Date(reaction.dateTime);
            let closestMealTime = null;
            let minTimeDiff = Infinity;

            this.meals.forEach(meal => {
                const mealTime = new Date(meal.dateTime);
                const timeDiff = reactionTime - mealTime;

                if (timeDiff > 0 && timeDiff < (72 * 60 * 60 * 1000) && timeDiff < minTimeDiff) {
                    minTimeDiff = timeDiff;
                    closestMealTime = mealTime;
                }
            });

            if (closestMealTime) {
                reactionTimes.push(minTimeDiff);
            }
        });

        return reactionTimes;
    }

    /**
     * Analyze timing patterns in reaction times
     */
    analyzeTimingPatterns(reactionTimes) {
        const windows = [
            { label: '< 30 min', min: 0, max: 30 * 60 * 1000, count: 0 },
            { label: '30 min - 2 hrs', min: 30 * 60 * 1000, max: 2 * 60 * 60 * 1000, count: 0 },
            { label: '2 - 8 hrs', min: 2 * 60 * 60 * 1000, max: 8 * 60 * 60 * 1000, count: 0 },
            { label: '8 - 24 hrs', min: 8 * 60 * 60 * 1000, max: 24 * 60 * 60 * 1000, count: 0 },
            { label: '24 - 72 hrs', min: 24 * 60 * 60 * 1000, max: 72 * 60 * 60 * 1000, count: 0 }
        ];

        let total = 0;
        let sum = 0;
        let mostCommonWindow = '';

        reactionTimes.forEach(time => {
            sum += time;
            total++;

            windows.forEach(window => {
                if (time >= window.min && time < window.max) {
                    window.count++;
                }
            });
        });

        const average = total > 0 ? sum / total : 0;

        // Find most common window
        let maxCount = 0;
        windows.forEach(window => {
            if (window.count > maxCount) {
                maxCount = window.count;
                mostCommonWindow = window.label;
            }
            window.percentage = total > 0 ? (window.count / total) * 100 : 0;
        });

        return {
            average: average,
            commonWindow: mostCommonWindow,
            windows: windows
        };
    }

    /**
     * Render the correlation chart
     */
    renderChart() {
        const ctx = document.getElementById('correlationChart').getContext('2d');

        if (this.reactions.length === 0) {
            if (this.chart) {
                this.chart.destroy();
            }
            return;
        }

        // Prepare data for scatter plot
        const scatterData = [];
        const labels = [];

        this.reactions.forEach((reaction, index) => {
            const reactionTime = new Date(reaction.dateTime);

            // Find closest meal
            let closestMeal = null;
            let minTimeDiff = Infinity;

            this.meals.forEach(meal => {
                const mealTime = new Date(meal.dateTime);
                const timeDiff = reactionTime - mealTime;

                if (timeDiff > 0 && timeDiff < (72 * 60 * 60 * 1000) && timeDiff < minTimeDiff) {
                    minTimeDiff = timeDiff;
                    closestMeal = meal;
                }
            });

            if (closestMeal) {
                const hoursDiff = minTimeDiff / (1000 * 60 * 60);
                scatterData.push({
                    x: hoursDiff,
                    y: reaction.severity,
                    meal: closestMeal.description,
                    symptoms: reaction.symptoms
                });
                labels.push(`Reaction ${index + 1}`);
            }
        });

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        // Create new chart
        this.chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Reaction Timing vs Severity',
                    data: scatterData,
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const point = context.raw;
                                return [
                                    `Time after meal: ${point.x.toFixed(1)} hours`,
                                    `Severity: ${point.y}/10`,
                                    `Meal: ${point.meal}`,
                                    `Symptoms: ${point.symptoms.join(', ')}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Hours After Meal'
                        },
                        min: 0,
                        max: 72
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Reaction Severity (1-10)'
                        },
                        min: 1,
                        max: 10
                    }
                }
            }
        });
    }

    /**
     * Render meal history
     */
    renderMealHistory(view = 'recent') {
        const container = document.getElementById('mealHistory');
        let meals = [...this.meals];

        // Sort by date (most recent first)
        meals.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

        // Filter for recent view (last 10 entries)
        if (view === 'recent') {
            meals = meals.slice(0, 10);
        }

        // Clear existing content
        container.innerHTML = '';

        if (meals.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No meals logged yet.</p>';
            return;
        }

        // Render meal items
        meals.forEach(meal => {
            const mealItem = document.createElement('div');
            mealItem.className = 'history-item';

            const mealDateTime = new Date(meal.dateTime).toLocaleString();

            mealItem.innerHTML = `
                <div class="history-item-header">
                    <div class="history-item-title">Meal</div>
                    <div class="history-item-date">${mealDateTime}</div>
                </div>
                <div class="history-item-content">
                    <p><strong>${meal.description}</strong></p>
                    <p>Portion: ${this.capitalizeFirst(meal.portion)}</p>
                    ${meal.notes ? `<p>Notes: ${meal.notes}</p>` : ''}
                </div>
                ${meal.categories.length > 0 ? `<div class="history-item-tags">
                    ${meal.categories.map(category => `<span class="tag">${this.getCategoryLabel(category)}</span>`).join('')}
                </div>` : '<div class="history-item-tags">No categories specified</div>'}
            `;

            container.appendChild(mealItem);
        });
    }

    /**
     * Render reaction history
     */
    renderReactionHistory(view = 'recent') {
        const container = document.getElementById('reactionHistory');
        let reactions = [...this.reactions];

        // Sort by date (most recent first)
        reactions.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

        // Filter for recent view (last 10 entries)
        if (view === 'recent') {
            reactions = reactions.slice(0, 10);
        }

        // Clear existing content
        container.innerHTML = '';

        if (reactions.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No reactions logged yet.</p>';
            return;
        }

        // Render reaction items
        reactions.forEach(reaction => {
            const reactionItem = document.createElement('div');
            reactionItem.className = 'history-item';

            const reactionDateTime = new Date(reaction.dateTime).toLocaleString();

            reactionItem.innerHTML = `
                <div class="history-item-header">
                    <div class="history-item-title">Reaction</div>
                    <div class="history-item-date">${reactionDateTime}</div>
                </div>
                <div class="history-item-content">
                    <p><strong>Severity: ${reaction.severity}/10 (${this.getSeverityLabel(reaction.severity)})</strong></p>
                    <p>Notes: ${reaction.notes}</p>
                </div>
                ${reaction.symptoms.length > 0 ? `<div class="history-item-tags">
                    ${reaction.symptoms.map(symptom => `<span class="tag secondary">${this.getSymptomLabel(symptom)}</span>`).join('')}
                </div>` : '<div class="history-item-tags">No symptoms specified</div>'}
            `;

            container.appendChild(reactionItem);
        });
    }

    /**
     * Get human-readable category label
     */
    getCategoryLabel(category) {
        const labels = {
            'dairy': 'Dairy',
            'gluten': 'Gluten',
            'nuts': 'Nuts',
            'eggs': 'Eggs',
            'soy': 'Soy',
            'shellfish': 'Shellfish',
            'nightshades': 'Nightshades',
            'other': 'Other'
        };
        return labels[category] || category;
    }

    /**
     * Get human-readable symptom label
     */
    getSymptomLabel(symptom) {
        const labels = {
            'headache': 'Headache',
            'nausea': 'Nausea',
            'bloating': 'Bloating',
            'diarrhea': 'Diarrhea',
            'rash': 'Skin Rash',
            'fatigue': 'Fatigue',
            'joint-pain': 'Joint Pain',
            'other': 'Other'
        };
        return labels[symptom] || symptom;
    }

    /**
     * Capitalize first letter of string
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Toggle meal history view
     */
    toggleMealHistoryView(view) {
        document.getElementById('viewRecentMeals').classList.toggle('active', view === 'recent');
        document.getElementById('viewAllMeals').classList.toggle('active', view === 'all');
        this.renderMealHistory(view);
    }

    /**
     * Toggle reaction history view
     */
    toggleReactionHistoryView(view) {
        document.getElementById('viewRecentReactions').classList.toggle('active', view === 'recent');
        document.getElementById('viewAllReactions').classList.toggle('active', view === 'all');
        this.renderReactionHistory(view);
    }

    /**
     * Render suspected triggers
     */
    renderSuspectedTriggers() {
        const container = document.getElementById('suspectedTriggers');
        const suspectedTriggers = this.identifySuspectedTriggers();

        if (suspectedTriggers.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No suspected triggers identified yet. Continue logging meals and reactions.</p>';
            return;
        }

        container.innerHTML = suspectedTriggers.map(trigger => `
            <div class="trigger-item">
                <div class="trigger-food">${this.capitalizeFirst(trigger.food)}</div>
                <div class="trigger-stats">
                    <div class="trigger-count">${trigger.count}</div>
                    <div class="trigger-percentage">${trigger.percentage.toFixed(1)}% of reactions</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Show notification message
     */
    showNotification(message, type = 'info') {
        // Simple notification - you could enhance this with a proper notification system
        alert(message);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FoodSensitivityTracker();
});