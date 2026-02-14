// Emotional Recovery Time Tracker JavaScript
// This module tracks emotional recovery times from stressful events to measure and improve emotional resilience

class EmotionalRecoveryTracker {
    constructor() {
        // Initialize recovery data from localStorage
        this.recoveryData = this.loadData();
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
        this.renderBenchmarks();
        this.updateStressDisplay();
    }

    /**
     * Set up all event listeners for user interactions
     */
    setupEventListeners() {
        // Form submission for logging recovery events
        document.getElementById('recoveryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logRecoveryEvent();
        });

        // Stress level slider updates display in real-time
        document.getElementById('stressLevel').addEventListener('input', () => {
            this.updateStressDisplay();
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
     * Update the stress level display based on slider value
     * Maps numerical values to descriptive labels
     */
    updateStressDisplay() {
        const stressLevel = document.getElementById('stressLevel').value;
        const stressValue = document.getElementById('stressValue');
        const stressText = document.getElementById('stressText');

        stressValue.textContent = stressLevel;

        // Map stress levels to descriptive labels
        const stressLabels = {
            1: 'Minimal',
            2: 'Low',
            3: 'Mild',
            4: 'Moderate',
            5: 'Moderate',
            6: 'High',
            7: 'High',
            8: 'Severe',
            9: 'Extreme',
            10: 'Critical'
        };

        stressText.textContent = stressLabels[stressLevel] || 'Moderate';
    }

    /**
     * Log a new recovery event from the form data
     * Calculates recovery duration and validates input
     */
    logRecoveryEvent() {
        // Collect form data
        const formData = {
            id: Date.now(),
            eventDate: document.getElementById('eventDate').value,
            eventTime: document.getElementById('eventTime').value,
            recoveryTime: document.getElementById('recoveryTime').value,
            stressLevel: parseInt(document.getElementById('stressLevel').value),
            eventType: document.getElementById('eventType').value,
            eventDescription: document.getElementById('eventDescription').value,
            recoveryNotes: document.getElementById('recoveryNotes').value,
            timestamp: new Date().toISOString()
        };

        // Calculate recovery duration in minutes
        const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`);
        const recoveryDateTime = new Date(formData.recoveryTime);
        const recoveryDuration = Math.round((recoveryDateTime - eventDateTime) / (1000 * 60)); // minutes

        // Validate that recovery time is after event time
        if (recoveryDuration <= 0) {
            alert('Recovery time must be after the event time.');
            return;
        }

        formData.recoveryDuration = recoveryDuration;

        // Save the event and update UI
        this.recoveryData.push(formData);
        this.saveData();
        this.resetForm();
        this.updateDashboard();
        this.renderChart();
        this.renderHistory();
        this.renderInsights();

        // Show success message
        this.showNotification('Recovery event logged successfully!', 'success');
    }

    resetForm() {
        document.getElementById('recoveryForm').reset();
        // Set default date to today
        document.getElementById('eventDate').valueAsDate = new Date();
        this.updateStressDisplay();
    }

    updateDashboard() {
        const data = this.recoveryData;

        if (data.length === 0) {
            this.updateMetrics('--', '--', '0', '--');
            this.updateResilienceLevel(0, 'No data available');
            return;
        }

        // Calculate metrics
        const durations = data.map(d => d.recoveryDuration);
        const avgRecovery = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
        const fastestRecovery = Math.min(...durations);
        const totalEvents = data.length;

        // Calculate resilience score (lower recovery time = higher resilience)
        const resilienceScore = this.calculateResilienceScore(durations);

        this.updateMetrics(
            this.formatDuration(avgRecovery),
            this.formatDuration(fastestRecovery),
            totalEvents.toString(),
            resilienceScore.toString()
        );

        this.updateResilienceLevel(resilienceScore / 100, this.getResilienceLabel(resilienceScore));
    }

    calculateResilienceScore(durations) {
        if (durations.length === 0) return 0;

        // Base score on average recovery time
        // Lower recovery time = higher score
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

        // Score ranges:
        // < 30 min: 90-100 (Excellent)
        // 30-60 min: 70-89 (Good)
        // 60-120 min: 50-69 (Fair)
        // 120-240 min: 30-49 (Poor)
        // > 240 min: 10-29 (Needs improvement)

        let score;
        if (avgDuration < 30) score = 95;
        else if (avgDuration < 60) score = 80;
        else if (avgDuration < 120) score = 65;
        else if (avgDuration < 240) score = 45;
        else score = 25;

        // Adjust based on consistency (lower variance = higher score)
        const variance = this.calculateVariance(durations);
        const consistencyBonus = Math.max(0, 10 - (variance / 100));

        return Math.min(100, Math.round(score + consistencyBonus));
    }

    calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    }

    getResilienceLabel(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 70) return 'Good';
        if (score >= 50) return 'Fair';
        if (score >= 30) return 'Poor';
        return 'Needs Improvement';
    }

    /**
     * Update the metrics display elements
     * @param {string} avgRecovery - Formatted average recovery time
     * @param {string} fastestRecovery - Formatted fastest recovery time
     * @param {string} totalEvents - Total number of events
     * @param {string} resilienceScore - Resilience score
     */
    updateMetrics(avgRecovery, fastestRecovery, totalEvents, resilienceScore) {
        document.getElementById('avgRecoveryTime').textContent = avgRecovery;
        document.getElementById('fastestRecovery').textContent = fastestRecovery;
        document.getElementById('totalEvents').textContent = totalEvents;
        document.getElementById('resilienceScore').textContent = resilienceScore;
    }

    /**
     * Update the visual resilience level indicator
     * @param {number} percentage - Resilience percentage (0-1)
     * @param {string} label - Descriptive label for resilience level
     */
    updateResilienceLevel(percentage, label) {
        const fill = document.getElementById('resilienceFill');
        const labelEl = document.getElementById('resilienceLabel');

        fill.style.width = `${percentage * 100}%`;
        labelEl.textContent = label;
    }

    /**
     * Render the recovery trends chart using Chart.js
     * Shows recovery time and stress levels over time
     */
    renderChart() {
        const timeRange = document.getElementById('timeRange').value;
        const filteredData = this.filterDataByTimeRange(timeRange);

        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.destroy();
        }

        const ctx = document.getElementById('recoveryChart').getContext('2d');

        // Prepare data for chart
        const chartData = this.prepareChartData(filteredData);

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Recovery Time (minutes)',
                    data: chartData.durations,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Stress Level',
                    data: chartData.stressLevels,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    yAxisID: 'y1',
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
                            text: 'Recovery Time (minutes)'
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        max: 10,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Stress Level'
                        },
                        grid: {
                            drawOnChartArea: false,
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.datasetIndex === 0) {
                                    return `Recovery Time: ${context.parsed.y} minutes`;
                                } else {
                                    return `Stress Level: ${context.parsed.y}/10`;
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Filter recovery data by time range
     * @param {string} range - Time range ('7', '30', '90', or 'all')
     * @returns {Array} Filtered recovery data
     */
    filterDataByTimeRange(range) {
        const now = new Date();
        const cutoff = new Date();

        switch (range) {
            case '7':
                cutoff.setDate(now.getDate() - 7);
                break;
            case '30':
                cutoff.setDate(now.getDate() - 30);
                break;
            case '90':
                cutoff.setDate(now.getDate() - 90);
                break;
            default:
                return this.recoveryData; // 'all'
        }

        return this.recoveryData.filter(item => {
            const eventDate = new Date(item.eventDate);
            return eventDate >= cutoff;
        });
    }

    /**
     * Prepare data for chart visualization
     * @param {Array} data - Filtered recovery data
     * @returns {Object} Chart data with labels, durations, and stress levels
     */
    prepareChartData(data) {
        // Sort by date
        const sortedData = data.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

        return {
            labels: sortedData.map(item => this.formatDate(new Date(item.eventDate))),
            durations: sortedData.map(item => item.recoveryDuration),
            stressLevels: sortedData.map(item => item.stressLevel)
        };
    }

    /**
     * Render the recovery event history
     * @param {string} view - View type ('recent' or 'all')
     */
    renderHistory(view = 'recent') {
        const historyList = document.getElementById('eventHistory');
        let data = this.recoveryData;

        if (view === 'recent') {
            data = data.slice(-10); // Show last 10 events
        }

        data.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));

        if (data.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="calendar"></i>
                    <p>No recovery events logged yet.</p>
                </div>
            `;
            return;
        }

        historyList.innerHTML = data.map(item => `
            <div class="history-item">
                <div class="history-item-header">
                    <div class="history-item-date">${this.formatDate(new Date(item.eventDate))}</div>
                    <div class="history-item-duration">${this.formatDuration(item.recoveryDuration)}</div>
                </div>
                <div class="history-item-details">
                    <div><strong>Type:</strong> ${this.capitalizeFirst(item.eventType)}</div>
                    <div><strong>Stress:</strong> ${item.stressLevel}/10</div>
                </div>
                <div class="history-item-description">
                    <strong>Event:</strong> ${item.eventDescription}
                    ${item.recoveryNotes ? `<br><strong>Recovery:</strong> ${item.recoveryNotes}` : ''}
                </div>
            </div>
        `).join('');

        // Re-render icons
        lucide.createIcons();
    }

    /**
     * Toggle between recent and all history views
     * @param {string} view - View type ('recent' or 'all')
     */
    toggleHistoryView(view) {
        document.getElementById('viewRecent').classList.toggle('active', view === 'recent');
        document.getElementById('viewAll').classList.toggle('active', view === 'all');
        this.renderHistory(view);
    }

    /**
     * Render emotional intelligence insights based on recovery data
     */
    renderInsights() {
        const data = this.recoveryData;

        if (data.length === 0) {
            this.renderEmptyInsights();
            return;
        }

        // Recovery patterns analysis
        const avgByType = this.calculateAverageByType(data);
        const patterns = Object.entries(avgByType)
            .sort(([,a], [,b]) => a - b)
            .map(([type, avg]) => `${this.capitalizeFirst(type)}: ${this.formatDuration(avg)}`)
            .join(', ');

        document.getElementById('recoveryPatterns').innerHTML = `
            <p>Your fastest recovery is typically from ${Object.entries(avgByType).reduce((a, b) => avgByType[a[0]] < avgByType[b[0]] ? a : b)[0]} events (${this.formatDuration(Math.min(...Object.values(avgByType)))}), while ${Object.entries(avgByType).reduce((a, b) => avgByType[a[0]] > avgByType[b[0]] ? a : b)[0]} events take longer (${this.formatDuration(Math.max(...Object.values(avgByType)))}).</p>
        `;

        // Stress triggers analysis
        const stressByType = this.calculateAverageStressByType(data);
        const triggers = Object.entries(stressByType)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([type, avg]) => `${this.capitalizeFirst(type)} (${avg.toFixed(1)}/10)`)
            .join(', ');

        document.getElementById('stressTriggers').innerHTML = `
            <p>Your most stressful events are typically: ${triggers}.</p>
        `;

        // Improvement areas suggestions
        const improvements = this.generateImprovementTips(data);
        document.getElementById('improvementAreas').innerHTML = `
            <p>${improvements}</p>
        `;

        // Tips
        this.renderTips(data);
    }

    /**
     * Render empty state for insights when no data is available
     */
    renderEmptyInsights() {
        document.getElementById('recoveryPatterns').innerHTML = '<p>Log some recovery events to see patterns.</p>';
        document.getElementById('stressTriggers').innerHTML = '<p>Track events to identify stress triggers.</p>';
        document.getElementById('improvementAreas').innerHTML = '<p>Build resilience through consistent tracking.</p>';
        document.getElementById('tips').innerHTML = '';
    }

    /**
     * Calculate average recovery time by event type
     * @param {Array} data - Recovery data array
     * @returns {Object} Average recovery time by event type
     */
    calculateAverageByType(data) {
        const typeGroups = {};
        data.forEach(item => {
            if (!typeGroups[item.eventType]) {
                typeGroups[item.eventType] = [];
            }
            typeGroups[item.eventType].push(item.recoveryDuration);
        });

        const averages = {};
        Object.keys(typeGroups).forEach(type => {
            averages[type] = typeGroups[type].reduce((a, b) => a + b, 0) / typeGroups[type].length;
        });

        return averages;
    }

    /**
     * Calculate average stress level by event type
     * @param {Array} data - Recovery data array
     * @returns {Object} Average stress level by event type
     */
    calculateAverageStressByType(data) {
        const typeGroups = {};
        data.forEach(item => {
            if (!typeGroups[item.eventType]) {
                typeGroups[item.eventType] = [];
            }
            typeGroups[item.eventType].push(item.stressLevel);
        });

        const averages = {};
        Object.keys(typeGroups).forEach(type => {
            averages[type] = typeGroups[type].reduce((a, b) => a + b, 0) / typeGroups[type].length;
        });

        return averages;
    }

    /**
     * Generate personalized improvement tips based on recovery data
     * @param {Array} data - Recovery data array
     * @returns {string} Improvement suggestions
     */
    generateImprovementTips(data) {
        const avgDuration = data.reduce((sum, item) => sum + item.recoveryDuration, 0) / data.length;
        const avgStress = data.reduce((sum, item) => sum + item.stressLevel, 0) / data.length;

        let tips = [];

        if (avgDuration > 120) {
            tips.push('Consider developing quicker recovery strategies like deep breathing or mindfulness.');
        }

        if (avgStress > 7) {
            tips.push('High stress levels suggest focusing on stress prevention techniques.');
        }

        if (data.length < 5) {
            tips.push('Continue logging events to identify patterns and improve resilience.');
        }

        return tips.length > 0 ? tips.join(' ') : 'Keep tracking to maintain your emotional resilience!';
    }

    /**
     * Render personalized tips based on recovery patterns
     * @param {Array} data - Recovery data array
     */
    renderTips(data) {
        const tips = [
            {
                icon: 'clock',
                text: 'Track recovery times immediately after events for accurate data.'
            },
            {
                icon: 'target',
                text: 'Set goals to reduce average recovery time by 10% each month.'
            },
            {
                icon: 'brain',
                text: 'Practice mindfulness techniques to improve emotional regulation.'
            },
            {
                icon: 'trending-down',
                text: 'Monitor stress patterns to identify and avoid triggers.'
            }
        ];

        document.getElementById('tips').innerHTML = tips.map(tip => `
            <div class="tip-item">
                <i data-lucide="${tip.icon}"></i>
                <p>${tip.text}</p>
            </div>
        `).join('');

        lucide.createIcons();
    }

    /**
     * Render resilience benchmarks for comparison
     */
    renderBenchmarks() {
        const benchmarks = [
            {
                title: 'Excellent Resilience',
                description: 'Recovery within 30 minutes',
                range: '< 30 minutes'
            },
            {
                title: 'Good Resilience',
                description: 'Recovery within 1 hour',
                range: '30-60 minutes'
            },
            {
                title: 'Fair Resilience',
                description: 'Recovery within 2 hours',
                range: '60-120 minutes'
            },
            {
                title: 'Poor Resilience',
                description: 'Recovery takes 2-4 hours',
                range: '120-240 minutes'
            },
            {
                title: 'Needs Improvement',
                description: 'Recovery takes over 4 hours',
                range: '> 240 minutes'
            }
        ];

        document.getElementById('benchmarks').innerHTML = benchmarks.map(benchmark => `
            <div class="benchmark-item">
                <h4>${benchmark.title}</h4>
                <p>${benchmark.description}</p>
                <div class="benchmark-range">${benchmark.range}</div>
            </div>
        `).join('');
    }

    // Utility Methods

    /**
     * Format duration in minutes to a readable string
     * @param {number} minutes - Duration in minutes
     * @returns {string} Formatted duration string
     */
    formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }

    /**
     * Format date to a readable string
     * @param {Date} date - Date object to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    /**
     * Capitalize the first letter of a string
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Notification type ('success', 'error', 'info')
     */
    showNotification(message, type = 'info') {
        // Simple notification - could be enhanced with a proper notification system
        alert(message);
    }

    /**
     * Load recovery data from localStorage
     * @returns {Array} Recovery data array
     */
    loadData() {
        const data = localStorage.getItem('emotionalRecoveryData');
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save recovery data to localStorage
     */
    saveData() {
        localStorage.setItem('emotionalRecoveryData', JSON.stringify(this.recoveryData));
    }
}

// Initialize the tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EmotionalRecoveryTracker();
});