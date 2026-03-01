// Pace Consistency Tracker JavaScript
// Measures pace stability during runs to evaluate pacing strategy efficiency

class PaceConsistencyTracker {
    constructor() {
        // Initialize pace data from localStorage
        this.paceData = this.loadData();
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
        this.updateVarianceVisualization();
        this.setDefaultDate();
    }

    /**
     * Set up all event listeners for user interactions
     */
    setupEventListeners() {
        // Form submission for logging runs
        document.getElementById('paceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logRun();
        });

        // Dynamic split distance changes
        document.getElementById('splitDistance').addEventListener('change', () => {
            this.updateSplitsSection();
        });

        // Add split button
        document.getElementById('addSplit').addEventListener('click', () => {
            this.addSplitInput();
        });

        // Chart time range and metric controls
        document.getElementById('chartTimeRange').addEventListener('change', () => {
            this.renderChart();
        });

        document.getElementById('chartMetric').addEventListener('change', () => {
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
     * Load pace data from localStorage
     */
    loadData() {
        const data = localStorage.getItem('paceData');
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save pace data to localStorage
     */
    saveData() {
        localStorage.setItem('paceData', JSON.stringify(this.paceData));
    }

    /**
     * Set default date to today
     */
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('runDate').value = today;
    }

    /**
     * Update splits section based on selected split distance
     */
    updateSplitsSection() {
        const splitDistance = parseFloat(document.getElementById('splitDistance').value);
        const totalDistance = parseFloat(document.getElementById('totalDistance').value);

        if (!splitDistance || !totalDistance) return;

        const numSplits = Math.ceil(totalDistance / splitDistance);
        this.generateSplitInputs(numSplits, splitDistance);
    }

    /**
     * Generate split input fields
     */
    generateSplitInputs(numSplits, splitDistance) {
        const container = document.getElementById('splitsContainer');
        container.innerHTML = '';

        for (let i = 0; i < numSplits; i++) {
            const splitNumber = i + 1;
            const distance = Math.min(splitDistance, parseFloat(document.getElementById('totalDistance').value) - (i * splitDistance));

            const splitDiv = document.createElement('div');
            splitDiv.className = 'split-input';
            splitDiv.innerHTML = `
                <div class="split-label">Split ${splitNumber} (${distance.toFixed(2)} km)</div>
                <input type="time" step="1" placeholder="MM:SS" required>
                <button type="button" class="remove-split" onclick="this.parentElement.remove()" ${numSplits <= 1 ? 'disabled' : ''}>
                    <i data-lucide="x"></i>
                </button>
            `;
            container.appendChild(splitDiv);
        }

        // Re-initialize Lucide icons for new elements
        lucide.createIcons();
    }

    /**
     * Add a new split input
     */
    addSplitInput() {
        const container = document.getElementById('splitsContainer');
        const splitInputs = container.querySelectorAll('.split-input');
        const lastSplit = splitInputs[splitInputs.length - 1];

        if (!lastSplit) return;

        const splitNumber = splitInputs.length + 1;
        const splitDiv = document.createElement('div');
        splitDiv.className = 'split-input';
        splitDiv.innerHTML = `
            <div class="split-label">Split ${splitNumber} (Additional)</div>
            <input type="time" step="1" placeholder="MM:SS" required>
            <button type="button" class="remove-split" onclick="this.parentElement.remove()">
                <i data-lucide="x"></i>
            </button>
        `;
        container.appendChild(splitDiv);

        // Re-initialize Lucide icons
        lucide.createIcons();
    }

    /**
     * Log a new run with splits
     */
    logRun() {
        const runDate = document.getElementById('runDate').value;
        const runType = document.getElementById('runType').value;
        const totalDistance = parseFloat(document.getElementById('totalDistance').value);
        const splitDistance = parseFloat(document.getElementById('splitDistance').value);
        const notes = document.getElementById('notes').value.trim();

        if (!runDate || !runType || !totalDistance || !splitDistance) {
            this.showNotification('Please fill in all required fields.', 'error');
            return;
        }

        // Collect split times
        const splitInputs = document.querySelectorAll('#splitsContainer input[type="time"]');
        const splits = [];

        for (let i = 0; i < splitInputs.length; i++) {
            const timeValue = splitInputs[i].value;
            if (!timeValue) {
                this.showNotification('Please fill in all split times.', 'error');
                return;
            }

            const [minutes, seconds] = timeValue.split(':').map(Number);
            const totalSeconds = minutes * 60 + seconds;
            const distance = Math.min(splitDistance, totalDistance - (i * splitDistance));

            splits.push({
                splitNumber: i + 1,
                distance: distance,
                time: totalSeconds,
                pace: totalSeconds / (distance / 60) // pace in seconds per km
            });
        }

        // Calculate overall metrics
        const totalTime = splits.reduce((sum, split) => sum + split.time, 0);
        const avgPace = totalTime / (totalDistance / 60); // seconds per km
        const paceVariance = this.calculatePaceVariance(splits);
        const consistencyScore = this.calculateConsistencyScore(paceVariance);

        const run = {
            id: Date.now(),
            date: runDate,
            runType: runType,
            totalDistance: totalDistance,
            totalTime: totalTime,
            avgPace: avgPace,
            paceVariance: paceVariance,
            consistencyScore: consistencyScore,
            splits: splits,
            notes: notes,
            timestamp: new Date().toISOString()
        };

        this.paceData.push(run);
        this.saveData();

        // Reset form
        document.getElementById('paceForm').reset();
        this.setDefaultDate();

        // Update all components
        this.updateDashboard();
        this.renderChart();
        this.renderHistory();
        this.renderInsights();
        this.updateVarianceVisualization();

        this.showNotification('Run logged successfully!', 'success');
    }

    /**
     * Calculate pace variance (standard deviation of paces)
     */
    calculatePaceVariance(splits) {
        if (splits.length < 2) return 0;

        const paces = splits.map(split => split.pace);
        const mean = paces.reduce((sum, pace) => sum + pace, 0) / paces.length;
        const variance = paces.reduce((sum, pace) => sum + Math.pow(pace - mean, 2), 0) / paces.length;

        return Math.sqrt(variance);
    }

    /**
     * Calculate consistency score (0-100, higher is better)
     */
    calculateConsistencyScore(variance) {
        // Lower variance = higher consistency score
        // Score decreases as variance increases
        const maxVariance = 120; // 2 minutes variance = very poor consistency
        const score = Math.max(0, Math.min(100, 100 - (variance / maxVariance) * 100));
        return Math.round(score);
    }

    /**
     * Update the dashboard with current metrics
     */
    updateDashboard() {
        if (this.paceData.length === 0) return;

        // Sort data by date (newest first)
        const sortedData = [...this.paceData].sort((a, b) => new Date(b.date) - new Date(a.date));
        const latest = sortedData[0];

        // Average pace
        document.getElementById('avgPace').textContent = this.formatPace(latest.avgPace);

        // Pace variance
        document.getElementById('paceVariance').textContent = `${Math.round(latest.paceVariance)}s`;

        // Consistency score
        const score = latest.consistencyScore;
        document.getElementById('consistencyScore').textContent = score;

        // Best split pace
        const bestSplit = latest.splits.reduce((best, split) =>
            split.pace < best.pace ? split : best
        );
        document.getElementById('bestSplit').textContent = this.formatPace(bestSplit.pace);
    }

    /**
     * Update variance visualization
     */
    updateVarianceVisualization() {
        if (this.paceData.length === 0) return;

        const sortedData = [...this.paceData].sort((a, b) => new Date(b.date) - new Date(a.date));
        const latest = sortedData[0];
        const variance = latest.paceVariance;

        // Calculate percentage (0-100, where 0% = excellent, 100% = poor)
        let percentage;
        if (variance < 10) percentage = 20; // Excellent
        else if (variance < 20) percentage = 40; // Good
        else if (variance < 40) percentage = 60; // Moderate
        else percentage = 80; // Poor

        const varianceFill = document.getElementById('varianceFill');
        varianceFill.style.setProperty('--variance-percentage', `${percentage}%`);
        varianceFill.style.width = `${percentage}%`;
    }

    /**
     * Render the trend chart
     */
    renderChart() {
        const ctx = document.getElementById('paceChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        const timeRange = document.getElementById('chartTimeRange').value;
        const metric = document.getElementById('chartMetric').value;
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

        let data, label, color;
        switch (metric) {
            case 'pace':
                data = filteredData.map(item => item.avgPace / 60); // Convert to min/km
                label = 'Average Pace (min/km)';
                color = '#06b6d4';
                break;
            case 'variance':
                data = filteredData.map(item => item.paceVariance);
                label = 'Pace Variance (seconds)';
                color = '#f59e0b';
                break;
            case 'consistency':
                data = filteredData.map(item => item.consistencyScore);
                label = 'Consistency Score';
                color = '#10b981';
                break;
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: color,
                    backgroundColor: color.replace(')', ', 0.1)').replace('#', 'rgba('),
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: color,
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
                                if (metric === 'pace') {
                                    return `Pace: ${context.parsed.y.toFixed(2)} min/km`;
                                } else if (metric === 'variance') {
                                    return `Variance: ${Math.round(context.parsed.y)} seconds`;
                                } else {
                                    return `Score: ${Math.round(context.parsed.y)}/100`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: metric === 'consistency',
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                if (metric === 'pace') {
                                    return value.toFixed(2) + ' min/km';
                                } else if (metric === 'variance') {
                                    return Math.round(value) + 's';
                                } else {
                                    return Math.round(value);
                                }
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
    getFilteredData(timeRange) {
        if (timeRange === 'all') return this.paceData;

        const numRuns = parseInt(timeRange);
        const sortedData = [...this.paceData].sort((a, b) => new Date(b.date) - new Date(a.date));

        return sortedData.slice(0, numRuns);
    }

    /**
     * Render the history view
     */
    renderHistory() {
        const historyList = document.getElementById('historyList');
        const searchTerm = document.getElementById('historySearch').value.toLowerCase();
        const sortBy = document.getElementById('historySort').value;

        if (this.paceData.length === 0) {
            historyList.innerHTML = '<p class="no-data">No runs logged yet. Start tracking your pace consistency above.</p>';
            return;
        }

        let filteredData = [...this.paceData];

        // Apply search filter
        if (searchTerm) {
            filteredData = filteredData.filter(item =>
                item.notes.toLowerCase().includes(searchTerm) ||
                item.runType.toLowerCase().includes(searchTerm)
            );
        }

        // Apply sorting
        filteredData.sort((a, b) => {
            switch (sortBy) {
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'pace-asc':
                    return a.avgPace - b.avgPace;
                case 'pace-desc':
                    return b.avgPace - a.avgPace;
                case 'consistency-desc':
                    return b.consistencyScore - a.consistencyScore;
                case 'consistency-asc':
                    return a.consistencyScore - b.consistencyScore;
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
        const consistencyClass = this.getConsistencyClass(item.consistencyScore);

        return `
            <div class="history-item">
                <div class="history-item-header">
                    <div class="history-item-date">${date} - ${this.capitalizeFirst(item.runType)}</div>
                    <div class="history-item-pace ${consistencyClass}">${this.formatPace(item.avgPace)}</div>
                </div>
                <div class="history-item-details">
                    <div>Distance: ${item.totalDistance.toFixed(1)} km</div>
                    <div>Variance: ${Math.round(item.paceVariance)}s</div>
                    <div>Consistency: ${item.consistencyScore}/100</div>
                </div>
                <div class="history-item-splits">
                    <div class="splits-summary">
                        ${item.splits.slice(0, 5).map(split => `
                            <span class="split-summary">
                                ${split.splitNumber}: ${this.formatPace(split.pace)}
                            </span>
                        `).join('')}
                        ${item.splits.length > 5 ? `<span class="split-summary">+${item.splits.length - 5} more</span>` : ''}
                    </div>
                </div>
                ${item.notes ? `<div class="history-item-notes">${item.notes}</div>` : ''}
            </div>
        `;
    }

    /**
     * Get consistency class for styling
     */
    getConsistencyClass(score) {
        if (score >= 80) return 'excellent-consistency';
        if (score >= 60) return 'good-consistency';
        if (score >= 40) return 'moderate-consistency';
        return 'poor-consistency';
    }

    /**
     * Render insights and recommendations
     */
    renderInsights() {
        const insightsContainer = document.getElementById('insightsContainer');

        if (this.paceData.length === 0) {
            insightsContainer.innerHTML = '<p class="no-data">Add run data to see personalized pacing insights.</p>';
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
        const sortedData = [...this.paceData].sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sortedData.length === 0) return insights;

        const latest = sortedData[0];
        const previous = sortedData[1];

        // Current consistency insight
        const consistencyInsight = this.getConsistencyInsight(latest.consistencyScore);
        if (consistencyInsight) insights.push(consistencyInsight);

        // Trend insight
        if (previous && sortedData.length >= 3) {
            const recentRuns = sortedData.slice(0, 3);
            const avgConsistency = recentRuns.reduce((sum, run) => sum + run.consistencyScore, 0) / recentRuns.length;
            const prevRuns = sortedData.slice(3, 6);
            const prevAvgConsistency = prevRuns.length > 0 ?
                prevRuns.reduce((sum, run) => sum + run.consistencyScore, 0) / prevRuns.length : 0;

            if (prevAvgConsistency > 0) {
                const trend = avgConsistency - prevAvgConsistency;
                if (Math.abs(trend) > 10) {
                    insights.push({
                        icon: trend > 0 ? 'trending-up' : 'trending-down',
                        title: trend > 0 ? 'Consistency Improving' : 'Consistency Declining',
                        text: `Your average consistency score ${trend > 0 ? 'increased' : 'decreased'} by ${Math.abs(trend).toFixed(0)} points compared to previous runs.`
                    });
                }
            }
        }

        // Pace variance insight
        if (latest.paceVariance > 60) {
            insights.push({
                icon: 'alert-triangle',
                title: 'High Pace Variation',
                text: 'Your pace varies significantly between splits. Consider tempo runs to improve pace control and efficiency.'
            });
        } else if (latest.paceVariance < 15) {
            insights.push({
                icon: 'check-circle',
                title: 'Excellent Pace Control',
                text: 'Your pace consistency is excellent! This indicates strong running efficiency and control.'
            });
        }

        // Run type specific insights
        if (latest.runType === 'race' && latest.consistencyScore < 70) {
            insights.push({
                icon: 'target',
                title: 'Race Pacing Opportunity',
                text: 'Race performance could improve with better pace consistency. Practice maintaining even effort throughout runs.'
            });
        }

        // Training recommendation
        if (sortedData.length >= 5) {
            const avgVariance = sortedData.slice(0, 5).reduce((sum, run) => sum + run.paceVariance, 0) / 5;
            if (avgVariance > 30) {
                insights.push({
                    icon: 'activity',
                    title: 'Recommended Training',
                    text: 'Incorporate more tempo runs and interval training to improve pace consistency and running efficiency.'
                });
            }
        }

        return insights.slice(0, 4); // Limit to 4 insights
    }

    /**
     * Get consistency insight based on score
     */
    getConsistencyInsight(score) {
        if (score >= 80) {
            return {
                icon: 'star',
                title: 'Elite Pace Control',
                text: 'Your pace consistency is exceptional! You have excellent running efficiency and control.'
            };
        } else if (score >= 60) {
            return {
                icon: 'check-circle',
                title: 'Good Consistency',
                text: 'Your pace control is solid. Continue practicing to maintain this level of consistency.'
            };
        } else if (score >= 40) {
            return {
                icon: 'alert-circle',
                title: 'Room for Improvement',
                text: 'Your pace varies noticeably. Focus on tempo runs to improve consistency and efficiency.'
            };
        } else {
            return {
                icon: 'alert-triangle',
                title: 'Significant Variation',
                text: 'Your pace consistency needs work. Consider structured training to develop better pace control.'
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
     * Format pace from seconds per km to min:sec per km
     */
    formatPace(secondsPerKm) {
        const minutes = Math.floor(secondsPerKm / 60);
        const seconds = Math.round(secondsPerKm % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
    new PaceConsistencyTracker();
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
<parameter name="filePath">c:\Users\Gupta\Downloads\dev-card-showcase\js\pace-consistency-tracker.js