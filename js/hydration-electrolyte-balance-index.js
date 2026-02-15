// Hydration-Electrolyte Balance Index JavaScript
// Tracks hydration and electrolyte balance with integrated scoring for athletic performance

class HydrationElectrolyteBalanceIndex {
    constructor() {
        // Initialize balance data from localStorage
        this.balanceData = this.loadData();
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
        this.renderChart();
        this.renderHistory();
        this.renderInsights();
        this.updateComponentVisuals();
    }

    /**
     * Set up all event listeners for user interactions
     */
    setupEventListeners() {
        // Form submission for logging balance data
        document.getElementById('balanceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logBalanceData();
        });

        // Chart time range controls
        document.getElementById('chartTimeRange').addEventListener('change', () => {
            this.renderChart();
        });

        document.getElementById('refreshChart').addEventListener('click', () => {
            this.renderChart();
        });

        // History controls
        document.getElementById('historySearch').addEventListener('input', () => {
            this.renderHistory();
        });

        document.getElementById('historySort').addEventListener('change', () => {
            this.renderHistory();
        });
    }

    /**
     * Load balance data from localStorage
     */
    loadData() {
        const data = localStorage.getItem('hydrationElectrolyteData');
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save balance data to localStorage
     */
    saveData() {
        localStorage.setItem('hydrationElectrolyteData', JSON.stringify(this.balanceData));
    }

    /**
     * Log a new balance data entry
     */
    logBalanceData() {
        const logDate = document.getElementById('logDate').value;
        const waterIntake = parseFloat(document.getElementById('waterIntake').value) || 0;
        const sodiumLevel = parseFloat(document.getElementById('sodiumLevel').value) || 0;
        const potassiumLevel = parseFloat(document.getElementById('potassiumLevel').value) || 0;
        const magnesiumLevel = parseFloat(document.getElementById('magnesiumLevel').value) || 0;
        const activityLevel = document.getElementById('activityLevel').value;
        const environment = document.getElementById('environment').value;
        const notes = document.getElementById('notes').value.trim();

        if (!logDate || !activityLevel || !environment) {
            this.showNotification('Please fill in all required fields.', 'error');
            return;
        }

        // Check if entry already exists for this date
        const existingEntry = this.balanceData.find(entry => entry.date === logDate);
        if (existingEntry) {
            if (!confirm('An entry already exists for this date. Do you want to update it?')) {
                return;
            }
            // Update existing entry
            existingEntry.waterIntake = waterIntake;
            existingEntry.sodiumLevel = sodiumLevel;
            existingEntry.potassiumLevel = potassiumLevel;
            existingEntry.magnesiumLevel = magnesiumLevel;
            existingEntry.activityLevel = activityLevel;
            existingEntry.environment = environment;
            existingEntry.notes = notes;
            existingEntry.timestamp = new Date().toISOString();
        } else {
            // Create new entry
            const entry = {
                id: Date.now(),
                date: logDate,
                waterIntake: waterIntake,
                sodiumLevel: sodiumLevel,
                potassiumLevel: potassiumLevel,
                magnesiumLevel: magnesiumLevel,
                activityLevel: activityLevel,
                environment: environment,
                notes: notes,
                timestamp: new Date().toISOString()
            };
            this.balanceData.push(entry);
        }

        this.saveData();

        // Reset form
        document.getElementById('balanceForm').reset();
        this.setDefaultDate();

        // Update all components
        this.updateDashboard();
        this.renderChart();
        this.renderHistory();
        this.renderInsights();
        this.updateComponentVisuals();

        this.showNotification('Balance data logged successfully!', 'success');
    }

    /**
     * Set default date to today
     */
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('logDate').value = today;
    }

    /**
     * Calculate balance index based on hydration and electrolyte levels
     */
    calculateBalanceIndex(entry) {
        // Hydration score (0-100)
        const hydrationScore = this.calculateHydrationScore(entry);

        // Electrolyte score (0-100)
        const electrolyteScore = this.calculateElectrolyteScore(entry);

        // Activity adjustment factor
        const activityFactor = this.getActivityFactor(entry.activityLevel);

        // Environment adjustment factor
        const environmentFactor = this.getEnvironmentFactor(entry.environment);

        // Combined balance index (weighted average)
        const balanceIndex = Math.round(
            (hydrationScore * 0.4) +
            (electrolyteScore * 0.4) +
            (activityFactor * 0.1) +
            (environmentFactor * 0.1)
        );

        return {
            total: Math.min(100, Math.max(0, balanceIndex)),
            hydration: hydrationScore,
            electrolyte: electrolyteScore,
            activity: activityFactor,
            environment: environmentFactor
        };
    }

    /**
     * Calculate hydration score based on water intake and factors
     */
    calculateHydrationScore(entry) {
        const baseWaterNeeds = this.getBaseWaterNeeds(entry.activityLevel, entry.environment);
        const hydrationRatio = entry.waterIntake / baseWaterNeeds;

        if (hydrationRatio < 0.5) return 20; // Severely dehydrated
        if (hydrationRatio < 0.7) return 40; // Dehydrated
        if (hydrationRatio < 0.9) return 60; // Mildly dehydrated
        if (hydrationRatio <= 1.2) return 80; // Well hydrated
        if (hydrationRatio <= 1.5) return 90; // Well hydrated with buffer
        return 70; // Over-hydrated (slightly penalized)
    }

    /**
     * Calculate electrolyte score based on sodium, potassium, and magnesium levels
     */
    calculateElectrolyteScore(entry) {
        const sodiumScore = this.scoreElectrolyte(entry.sodiumLevel, 2300, 3400, 1500, 5000);
        const potassiumScore = this.scoreElectrolyte(entry.potassiumLevel, 2600, 3400, 2000, 4000);
        const magnesiumScore = this.scoreElectrolyte(entry.magnesiumLevel, 310, 420, 200, 600);

        // Weighted average (sodium is most critical for hydration)
        return Math.round((sodiumScore * 0.4) + (potassiumScore * 0.35) + (magnesiumScore * 0.25));
    }

    /**
     * Score individual electrolyte level
     */
    scoreElectrolyte(level, minOptimal, maxOptimal, minAcceptable, maxAcceptable) {
        if (level >= minOptimal && level <= maxOptimal) return 100;
        if (level >= minAcceptable && level <= maxAcceptable) return 80;
        if (level < minAcceptable) return Math.max(20, (level / minAcceptable) * 60);
        return Math.max(20, ((maxAcceptable - level) / (maxAcceptable - maxOptimal)) * 60 + 40);
    }

    /**
     * Get base water needs based on activity and environment
     */
    getBaseWaterNeeds(activityLevel, environment) {
        let baseNeeds = 2500; // Base for sedentary

        // Activity multiplier
        const activityMultipliers = {
            'sedentary': 1.0,
            'light': 1.2,
            'moderate': 1.4,
            'active': 1.6,
            'intense': 1.8
        };

        // Environment multiplier
        const environmentMultipliers = {
            'cool': 1.0,
            'moderate': 1.1,
            'warm': 1.3,
            'hot': 1.5,
            'altitude': 1.4
        };

        baseNeeds *= activityMultipliers[activityLevel] || 1.0;
        baseNeeds *= environmentMultipliers[environment] || 1.0;

        return baseNeeds;
    }

    /**
     * Get activity factor for balance calculation
     */
    getActivityFactor(activityLevel) {
        const factors = {
            'sedentary': 70,
            'light': 75,
            'moderate': 80,
            'active': 85,
            'intense': 90
        };
        return factors[activityLevel] || 70;
    }

    /**
     * Get environment factor for balance calculation
     */
    getEnvironmentFactor(environment) {
        const factors = {
            'cool': 80,
            'moderate': 85,
            'warm': 75,
            'hot': 70,
            'altitude': 75
        };
        return factors[environment] || 80;
    }

    /**
     * Update the dashboard with current status
     */
    updateDashboard() {
        if (this.balanceData.length === 0) {
            this.setDefaultDate();
            return;
        }

        // Sort data by date (newest first)
        const sortedData = [...this.balanceData].sort((a, b) => new Date(b.date) - new Date(a.date));
        const latest = sortedData[0];
        const balanceIndex = this.calculateBalanceIndex(latest);

        // Balance index display
        document.getElementById('balanceIndex').textContent = balanceIndex.total;
        document.getElementById('balanceStatus').textContent = this.getBalanceStatus(balanceIndex.total);

        // Individual scores
        document.getElementById('hydrationScore').textContent = balanceIndex.hydration;
        document.getElementById('electrolyteScore').textContent = balanceIndex.electrolyte;
        document.getElementById('activityScore').textContent = balanceIndex.activity;
    }

    /**
     * Get balance status text
     */
    getBalanceStatus(score) {
        if (score >= 90) return 'Optimal';
        if (score >= 80) return 'Good';
        if (score >= 70) return 'Moderate';
        if (score >= 60) return 'Low';
        return 'Critical';
    }

    /**
     * Update component visuals
     */
    updateComponentVisuals() {
        if (this.balanceData.length === 0) return;

        const sortedData = [...this.balanceData].sort((a, b) => new Date(b.date) - new Date(a.date));
        const latest = sortedData[0];

        // Hydration component
        const hydrationPercent = Math.min(100, (latest.waterIntake / 3500) * 100);
        this.updateComponent('hydration', hydrationPercent, `${latest.waterIntake} ml`, this.getHydrationStatus(latest.waterIntake));

        // Electrolyte components
        this.updateComponent('sodium', this.getElectrolytePercentage(latest.sodiumLevel, 2300, 3400), `${latest.sodiumLevel} mg`, this.getElectrolyteStatus(latest.sodiumLevel, 2300, 3400));
        this.updateComponent('potassium', this.getElectrolytePercentage(latest.potassiumLevel, 2600, 3400), `${latest.potassiumLevel} mg`, this.getElectrolyteStatus(latest.potassiumLevel, 2600, 3400));
        this.updateComponent('magnesium', this.getElectrolytePercentage(latest.magnesiumLevel, 310, 420), `${latest.magnesiumLevel} mg`, this.getElectrolyteStatus(latest.magnesiumLevel, 310, 420));
    }

    /**
     * Update individual component display
     */
    updateComponent(component, percentage, value, label) {
        const fillElement = document.getElementById(`${component}Fill`);
        const valueElement = document.getElementById(`${component}Level`);
        const labelElement = document.getElementById(`${component}Label`);

        fillElement.style.setProperty('--component-percentage', `${percentage}%`);
        fillElement.style.width = `${percentage}%`;
        valueElement.textContent = value;
        labelElement.textContent = label;
    }

    /**
     * Get electrolyte percentage for visualization
     */
    getElectrolytePercentage(level, min, max) {
        const range = max - min;
        const position = level - min;
        return Math.min(100, Math.max(0, (position / range) * 100));
    }

    /**
     * Get hydration status
     */
    getHydrationStatus(intake) {
        if (intake < 1500) return 'Severely Low';
        if (intake < 2000) return 'Low';
        if (intake < 2500) return 'Moderate';
        if (intake <= 3500) return 'Good';
        return 'High';
    }

    /**
     * Get electrolyte status
     */
    getElectrolyteStatus(level, min, max) {
        if (level < min * 0.7) return 'Critically Low';
        if (level < min) return 'Low';
        if (level <= max) return 'Optimal';
        if (level <= max * 1.3) return 'High';
        return 'Excessive';
    }

    /**
     * Render the trend chart
     */
    renderChart() {
        const ctx = document.getElementById('balanceChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        const timeRange = parseInt(document.getElementById('chartTimeRange').value);
        const filteredData = this.getFilteredData(timeRange);

        if (filteredData.length === 0) {
            ctx.style.display = 'none';
            return;
        }

        ctx.style.display = 'block';

        // Sort by date
        filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));

        const labels = filteredData.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString();
        });

        const balanceIndices = filteredData.map(item => this.calculateBalanceIndex(item).total);
        const waterIntake = filteredData.map(item => item.waterIntake);
        const sodiumLevels = filteredData.map(item => item.sodiumLevel);

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Balance Index',
                    data: balanceIndices,
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#06b6d4',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    yAxisID: 'y'
                }, {
                    label: 'Water Intake (ml)',
                    data: waterIntake,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y1'
                }, {
                    label: 'Sodium (mg)',
                    data: sodiumLevels,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#f59e0b',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y1'
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
                            label: function(context) {
                                if (context.datasetIndex === 0) {
                                    return `Balance Index: ${context.parsed.y}`;
                                } else if (context.datasetIndex === 1) {
                                    return `Water Intake: ${context.parsed.y} ml`;
                                } else {
                                    return `Sodium: ${context.parsed.y} mg`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        min: 0,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value;
                            }
                        },
                        title: {
                            display: true,
                            text: 'Balance Index'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        title: {
                            display: true,
                            text: 'Intake/Levels'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                elements: {
                    point: {
                        hoverBorderWidth: 3
                    }
                }
            }
        });
    }

    /**
     * Get filtered data based on time range
     */
    getFilteredData(days) {
        if (days === 'all') return this.balanceData;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return this.balanceData.filter(item => new Date(item.date) >= cutoffDate);
    }

    /**
     * Render the history view
     */
    renderHistory() {
        const historyList = document.getElementById('historyList');
        const searchTerm = document.getElementById('historySearch').value.toLowerCase();
        const sortBy = document.getElementById('historySort').value;

        if (this.balanceData.length === 0) {
            historyList.innerHTML = '<p class="no-data">No balance data logged yet. Start tracking your hydration and electrolyte levels above.</p>';
            return;
        }

        let filteredData = [...this.balanceData];

        // Apply search filter
        if (searchTerm) {
            filteredData = filteredData.filter(item =>
                item.notes.toLowerCase().includes(searchTerm) ||
                item.activityLevel.toLowerCase().includes(searchTerm) ||
                item.environment.toLowerCase().includes(searchTerm)
            );
        }

        // Apply sorting
        filteredData.sort((a, b) => {
            switch (sortBy) {
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'index-asc':
                    return this.calculateBalanceIndex(a).total - this.calculateBalanceIndex(b).total;
                case 'index-desc':
                    return this.calculateBalanceIndex(b).total - this.calculateBalanceIndex(a).total;
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });

        historyList.innerHTML = filteredData.map(item => this.createHistoryItem(item)).join('');
    }

    /**
     * Create HTML for a history item
     */
    createHistoryItem(item) {
        const date = new Date(item.date).toLocaleDateString();
        const balanceIndex = this.calculateBalanceIndex(item);
        const indexClass = this.getBalanceClass(balanceIndex.total);

        return `
            <div class="history-item">
                <div class="history-item-header">
                    <div class="history-item-date">${date}</div>
                    <div class="history-item-index ${indexClass}">${balanceIndex.total}</div>
                </div>
                <div class="history-item-details">
                    <div>Water: ${item.waterIntake} ml</div>
                    <div>Na: ${item.sodiumLevel} mg</div>
                    <div>K: ${item.potassiumLevel} mg</div>
                </div>
                <div class="history-item-details">
                    <div>Activity: ${this.capitalizeFirst(item.activityLevel)}</div>
                    <div>Environment: ${this.capitalizeFirst(item.environment)}</div>
                    <div>Status: ${this.getBalanceStatus(balanceIndex.total)}</div>
                </div>
                ${item.notes ? `<div class="history-item-notes">${item.notes}</div>` : ''}
            </div>
        `;
    }

    /**
     * Get balance class for styling
     */
    getBalanceClass(score) {
        if (score >= 90) return 'optimal-balance';
        if (score >= 80) return 'good-balance';
        if (score >= 70) return 'moderate-balance';
        if (score >= 60) return 'low-balance';
        return 'critical-balance';
    }

    /**
     * Render insights and recommendations
     */
    renderInsights() {
        const insightsContainer = document.getElementById('insightsContainer');

        if (this.balanceData.length === 0) {
            insightsContainer.innerHTML = '<p class="no-data">Add balance data to see personalized insights.</p>';
            return;
        }

        const insights = this.generateInsights();
        insightsContainer.innerHTML = insights.map(insight => this.createInsightCard(insight)).join('');
    }

    /**
     * Generate insights based on data
     */
    generateInsights() {
        const insights = [];
        const sortedData = [...this.balanceData].sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sortedData.length === 0) return insights;

        const latest = sortedData[0];
        const balanceIndex = this.calculateBalanceIndex(latest);

        // Current balance insight
        const balanceInsight = this.getBalanceInsight(balanceIndex.total);
        if (balanceInsight) insights.push(balanceInsight);

        // Hydration trend insight
        if (sortedData.length >= 7) {
            const weekData = sortedData.slice(0, 7);
            const avgWater = weekData.reduce((sum, entry) => sum + entry.waterIntake, 0) / weekData.length;

            if (avgWater < 2000) {
                insights.push({
                    icon: 'alert-triangle',
                    title: 'Low Hydration Average',
                    text: `Your average water intake over the past week is ${avgWater.toFixed(0)} ml. Consider increasing to at least 2500-3000 ml daily.`
                });
            }
        }

        // Electrolyte balance insight
        if (latest.sodiumLevel < 2300 && latest.sodiumLevel > 0) {
            insights.push({
                icon: 'info',
                title: 'Sodium Intake May Be Low',
                text: 'Your sodium levels are below optimal range. Consider including more sodium-rich foods or electrolyte supplements, especially during intense activity.'
            });
        }

        // Activity-environment mismatch insight
        if ((latest.activityLevel === 'intense' || latest.activityLevel === 'active') &&
            (latest.environment === 'hot' || latest.environment === 'altitude')) {
            insights.push({
                icon: 'thermometer',
                title: 'High-Risk Conditions',
                text: 'Intense activity in hot or high-altitude environments increases hydration and electrolyte needs. Monitor closely and consider additional supplementation.'
            });
        }

        // Consistency insight
        const recentEntries = sortedData.slice(0, 7);
        const consistencyScore = this.calculateConsistency(recentEntries);
        if (consistencyScore < 70) {
            insights.push({
                icon: 'calendar',
                title: 'Inconsistent Tracking',
                text: 'Your tracking has been inconsistent. Regular monitoring helps maintain optimal hydration and electrolyte balance.'
            });
        }

        // Recovery insight
        if (balanceIndex.total < 60) {
            insights.push({
                icon: 'refresh-cw',
                title: 'Focus on Recovery',
                text: 'Your balance index is critically low. Prioritize rehydration and electrolyte replenishment. Consider rest or reduced activity intensity.'
            });
        }

        return insights.slice(0, 4); // Limit to 4 insights
    }

    /**
     * Get balance insight based on current index
     */
    getBalanceInsight(score) {
        if (score >= 90) {
            return {
                icon: 'star',
                title: 'Excellent Balance',
                text: 'Your hydration and electrolyte balance is optimal! Continue your current routine and monitor for any changes during intense activity.'
            };
        } else if (score >= 80) {
            return {
                icon: 'check-circle',
                title: 'Good Balance',
                text: 'Your balance is in a good range. Maintain your current hydration and electrolyte intake patterns.'
            };
        } else if (score >= 70) {
            return {
                icon: 'alert-circle',
                title: 'Moderate Balance',
                text: 'Your balance needs attention. Consider increasing water intake or adjusting electrolyte supplementation.'
            };
        } else if (score >= 60) {
            return {
                icon: 'alert-triangle',
                title: 'Low Balance',
                text: 'Your hydration and electrolyte levels are low. Increase fluid intake and consider electrolyte-rich foods or supplements.'
            };
        } else {
            return {
                icon: 'alert-triangle',
                title: 'Critical Balance',
                text: 'Your balance index is critically low. Immediate action needed: rehydrate and replenish electrolytes. Consider medical attention if symptoms persist.'
            };
        }
    }

    /**
     * Calculate consistency score based on regular logging
     */
    calculateConsistency(data) {
        if (data.length < 7) return 50;

        let consistentDays = 0;
        const dates = data.map(entry => new Date(entry.date).toDateString());

        for (let i = 0; i < 7; i++) {
            const checkDate = new Date();
            checkDate.setDate(checkDate.getDate() - i);
            if (dates.includes(checkDate.toDateString())) {
                consistentDays++;
            }
        }

        return (consistentDays / 7) * 100;
    }

    /**
     * Create HTML for an insight card
     */
    createInsightCard(insight) {
        return `
            <div class="insight-card">
                <div class="insight-icon">
                    <i data-lucide="${insight.icon}"></i>
                </div>
                <div class="insight-content">
                    <div class="insight-title">${insight.title}</div>
                    <div class="insight-text">${insight.text}</div>
                </div>
            </div>
        `;
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '1000',
            animation: 'slideIn 0.3s ease'
        });

        // Set background color based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#06b6d4'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Add to page
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    /**
     * Utility function to capitalize first letter
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HydrationElectrolyteBalanceIndex();
});

// Add notification animations to CSS dynamically
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
    .no-data {
        text-align: center;
        color: var(--text-secondary);
        font-style: italic;
        padding: 2rem;
    }
`;
document.head.appendChild(style);</content>
<parameter name="filePath">c:\Users\Gupta\Downloads\dev-card-showcase\js\hydration-electrolyte-balance-index.js