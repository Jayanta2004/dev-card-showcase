// Folic Acid Level Monitor JavaScript
// Tracks folate lab results and deficiency risks for prenatal and general health

class FolicAcidMonitor {
    constructor() {
        // Initialize folic acid data from localStorage
        this.folicData = this.loadData();
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
        this.updateDeficiencyIndicator();
    }

    /**
     * Set up all event listeners for user interactions
     */
    setupEventListeners() {
        // Form submission for logging lab results
        document.getElementById('folicForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logLabResult();
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
     * Load folic acid data from localStorage
     */
    loadData() {
        const data = localStorage.getItem('folicAcidData');
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save folic acid data to localStorage
     */
    saveData() {
        localStorage.setItem('folicAcidData', JSON.stringify(this.folicData));
    }

    /**
     * Log a new lab result
     */
    logLabResult() {
        const testDate = document.getElementById('testDate').value;
        const folicLevel = parseFloat(document.getElementById('folicLevel').value);
        const testType = document.getElementById('testType').value;
        const notes = document.getElementById('notes').value.trim();

        if (!testDate || !folicLevel || !testType) {
            this.showNotification('Please fill in all required fields.', 'error');
            return;
        }

        const result = {
            id: Date.now(),
            date: testDate,
            level: folicLevel,
            testType: testType,
            notes: notes,
            timestamp: new Date().toISOString()
        };

        this.folicData.push(result);
        this.saveData();

        // Reset form
        document.getElementById('folicForm').reset();
        this.setDefaultDate();

        // Update all components
        this.updateDashboard();
        this.renderChart();
        this.renderHistory();
        this.renderInsights();
        this.updateDeficiencyIndicator();

        this.showNotification('Lab result logged successfully!', 'success');
    }

    /**
     * Set default date to today
     */
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('testDate').value = today;
    }

    /**
     * Update the dashboard with current status
     */
    updateDashboard() {
        if (this.folicData.length === 0) {
            this.setDefaultDate();
            return;
        }

        // Sort data by date (newest first)
        const sortedData = [...this.folicData].sort((a, b) => new Date(b.date) - new Date(a.date));
        const latest = sortedData[0];

        // Current level
        document.getElementById('currentLevel').textContent = `${latest.level.toFixed(1)}`;

        // Days since last test
        const daysSince = Math.floor((new Date() - new Date(latest.date)) / (1000 * 60 * 60 * 24));
        document.getElementById('daysSinceTest').textContent = daysSince;

        // 30-day trend
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentTests = sortedData.filter(test => new Date(test.date) >= thirtyDaysAgo);

        if (recentTests.length >= 2) {
            const oldest = recentTests[recentTests.length - 1];
            const newest = recentTests[0];
            const trend = newest.level - oldest.level;
            const trendText = trend >= 0 ? `+${trend.toFixed(1)}` : trend.toFixed(1);
            document.getElementById('levelTrend').textContent = trendText;
        } else {
            document.getElementById('levelTrend').textContent = 'N/A';
        }

        // Deficiency status
        this.updateDeficiencyStatus(latest.level);
    }

    /**
     * Update deficiency status display
     */
    updateDeficiencyStatus(level) {
        const statusElement = document.getElementById('deficiencyStatus');
        const levelElement = document.getElementById('deficiencyLevel');
        const iconElement = document.getElementById('deficiencyIcon');

        let status, levelText, iconClass;

        if (level < 2.0) {
            status = 'Deficient';
            levelText = 'Critical';
            iconClass = 'deficient';
        } else if (level < 4.0) {
            status = 'Borderline';
            levelText = 'High Risk';
            iconClass = 'borderline';
        } else if (level < 6.0) {
            status = 'Low Normal';
            levelText = 'Monitor';
            iconClass = 'low-normal';
        } else if (level <= 20.0) {
            status = 'Optimal';
            levelText = 'Good';
            iconClass = 'optimal';
        } else {
            status = 'High';
            levelText = 'Very High';
            iconClass = 'high';
        }

        statusElement.textContent = status;
        levelElement.textContent = levelText;
        iconElement.className = `status-icon ${iconClass}`;
    }

    /**
     * Update deficiency risk indicator
     */
    updateDeficiencyIndicator() {
        if (this.folicData.length === 0) return;

        const sortedData = [...this.folicData].sort((a, b) => new Date(b.date) - new Date(a.date));
        const latest = sortedData[0];
        const percentage = Math.min((latest.level / 25) * 100, 100); // Max at 25 ng/mL for visualization

        const riskFill = document.getElementById('riskFill');
        riskFill.style.setProperty('--risk-percentage', `${percentage}%`);
        riskFill.style.width = `${percentage}%`;
    }

    /**
     * Render the trend chart
     */
    renderChart() {
        const ctx = document.getElementById('folicChart');
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

        const data = filteredData.map(item => item.level);

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Folic Acid Level (ng/mL)',
                    data: data,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
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
                                return `Level: ${context.parsed.y.toFixed(1)} ng/mL`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 0,
                        max: 25,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + ' ng/mL';
                            }
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
    getFilteredData(months) {
        if (months === 'all') return this.folicData;

        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - months);

        return this.folicData.filter(item => new Date(item.date) >= cutoffDate);
    }

    /**
     * Render the history view
     */
    renderHistory() {
        const historyList = document.getElementById('historyList');
        const searchTerm = document.getElementById('historySearch').value.toLowerCase();
        const sortBy = document.getElementById('historySort').value;

        if (this.folicData.length === 0) {
            historyList.innerHTML = '<p class="no-data">No lab results logged yet. Add your first result above.</p>';
            return;
        }

        let filteredData = [...this.folicData];

        // Apply search filter
        if (searchTerm) {
            filteredData = filteredData.filter(item =>
                item.notes.toLowerCase().includes(searchTerm) ||
                item.testType.toLowerCase().includes(searchTerm)
            );
        }

        // Apply sorting
        filteredData.sort((a, b) => {
            switch (sortBy) {
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'level-asc':
                    return a.level - b.level;
                case 'level-desc':
                    return b.level - a.level;
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
        const deficiencyClass = this.getDeficiencyClass(item.level);

        return `
            <div class="history-item">
                <div class="history-item-header">
                    <div class="history-item-date">${date}</div>
                    <div class="history-item-level ${deficiencyClass}">${item.level.toFixed(1)} ng/mL</div>
                </div>
                <div class="history-item-details">
                    <div>Test Type: ${this.capitalizeFirst(item.testType)}</div>
                    <div>Status: ${this.getDeficiencyStatus(item.level)}</div>
                </div>
                ${item.notes ? `<div class="history-item-notes">${item.notes}</div>` : ''}
            </div>
        `;
    }

    /**
     * Get deficiency class for styling
     */
    getDeficiencyClass(level) {
        if (level < 2.0) return 'deficient';
        if (level < 4.0) return 'borderline';
        if (level < 6.0) return 'low-normal';
        if (level <= 20.0) return 'optimal';
        return 'high';
    }

    /**
     * Get deficiency status text
     */
    getDeficiencyStatus(level) {
        if (level < 2.0) return 'Deficient';
        if (level < 4.0) return 'Borderline';
        if (level < 6.0) return 'Low Normal';
        if (level <= 20.0) return 'Optimal';
        return 'High';
    }

    /**
     * Render insights and recommendations
     */
    renderInsights() {
        const insightsContainer = document.getElementById('insightsContainer');

        if (this.folicData.length === 0) {
            insightsContainer.innerHTML = '<p class="no-data">Add lab results to see personalized insights.</p>';
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
        const sortedData = [...this.folicData].sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sortedData.length === 0) return insights;

        const latest = sortedData[0];
        const previous = sortedData[1];

        // Current status insight
        const statusInsight = this.getStatusInsight(latest.level);
        if (statusInsight) insights.push(statusInsight);

        // Trend insight
        if (previous) {
            const trend = latest.level - previous.level;
            if (Math.abs(trend) > 1.0) {
                insights.push({
                    icon: trend > 0 ? 'trending-up' : 'trending-down',
                    title: trend > 0 ? 'Levels Improving' : 'Levels Declining',
                    text: `Your folic acid levels ${trend > 0 ? 'increased' : 'decreased'} by ${Math.abs(trend).toFixed(1)} ng/mL since your last test.`
                });
            }
        }

        // Testing frequency insight
        const daysSinceLast = Math.floor((new Date() - new Date(latest.date)) / (1000 * 60 * 60 * 24));
        if (daysSinceLast > 90) {
            insights.push({
                icon: 'calendar',
                title: 'Consider Retesting',
                text: `It's been ${daysSinceLast} days since your last test. Consider retesting if you're planning pregnancy or experiencing symptoms.`
            });
        }

        // Prenatal planning insight
        if (latest.level < 6.0) {
            insights.push({
                icon: 'baby',
                title: 'Prenatal Planning',
                text: 'For optimal prenatal health, aim for folic acid levels above 6.0 ng/mL before conception. Consider supplementation.'
            });
        }

        // Supplementation insight
        if (latest.level < 4.0) {
            insights.push({
                icon: 'pill',
                title: 'Supplementation Recommended',
                text: 'Your levels are below optimal. Consider folic acid supplementation (400-800 mcg daily) and consult your healthcare provider.'
            });
        }

        return insights.slice(0, 4); // Limit to 4 insights
    }

    /**
     * Get status insight based on current level
     */
    getStatusInsight(level) {
        if (level < 2.0) {
            return {
                icon: 'alert-triangle',
                title: 'Critical Deficiency',
                text: 'Your folic acid levels are critically low. Consult your healthcare provider immediately for supplementation and further evaluation.'
            };
        } else if (level < 4.0) {
            return {
                icon: 'alert-circle',
                title: 'Borderline Levels',
                text: 'Your levels are borderline. Consider increasing folate-rich foods and possibly supplementation.'
            };
        } else if (level < 6.0) {
            return {
                icon: 'info',
                title: 'Low Normal Range',
                text: 'Your levels are in the low normal range. Monitor closely, especially if planning pregnancy.'
            };
        } else if (level <= 20.0) {
            return {
                icon: 'check-circle',
                title: 'Optimal Levels',
                text: 'Your folic acid levels are in the optimal range. Continue maintaining a folate-rich diet.'
            };
        } else {
            return {
                icon: 'star',
                title: 'Excellent Levels',
                text: 'Your folic acid levels are excellent! You have good folate status.'
            };
        }
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
    new FolicAcidMonitor();
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
<parameter name="filePath">c:\Users\Gupta\Downloads\dev-card-showcase\js\folic-acid-level-monitor.js