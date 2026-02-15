// Personal Health Resilience Score JavaScript
// Calculates overall health resilience based on stress, sleep, recovery, and nutrition

class PersonalHealthResilienceTracker {
    constructor() {
        // Initialize health data from localStorage
        this.healthData = this.loadData();
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
        this.setDefaultDate();
    }

    /**
     * Set up all event listeners for user interactions
     */
    setupEventListeners() {
        // Form submission for logging health metrics
        document.getElementById('resilienceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logHealthMetrics();
        });

        // Range input value updates
        document.getElementById('stressLevel').addEventListener('input', (e) => {
            document.getElementById('stressValue').textContent = e.target.value;
        });

        document.getElementById('sleepQuality').addEventListener('input', (e) => {
            document.getElementById('sleepQualityValue').textContent = e.target.value;
        });

        document.getElementById('recoveryScore').addEventListener('input', (e) => {
            document.getElementById('recoveryValue').textContent = e.target.value;
        });

        document.getElementById('exerciseConsistency').addEventListener('input', (e) => {
            document.getElementById('exerciseValue').textContent = e.target.value;
        });

        document.getElementById('nutritionQuality').addEventListener('input', (e) => {
            document.getElementById('nutritionValue').textContent = e.target.value;
        });

        // Chart controls
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
     * Load health data from localStorage
     */
    loadData() {
        const data = localStorage.getItem('healthResilienceData');
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save health data to localStorage
     */
    saveData() {
        localStorage.setItem('healthResilienceData', JSON.stringify(this.healthData));
    }

    /**
     * Set default date to today
     */
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('logDate').value = today;
    }

    /**
     * Log health metrics and calculate resilience score
     */
    logHealthMetrics() {
        const logDate = document.getElementById('logDate').value;
        const stressLevel = parseInt(document.getElementById('stressLevel').value);
        const sleepHours = parseFloat(document.getElementById('sleepHours').value);
        const sleepQuality = parseInt(document.getElementById('sleepQuality').value);
        const recoveryScore = parseInt(document.getElementById('recoveryScore').value);
        const exerciseConsistency = parseInt(document.getElementById('exerciseConsistency').value);
        const nutritionQuality = parseInt(document.getElementById('nutritionQuality').value);
        const notes = document.getElementById('notes').value.trim();

        if (!logDate || !sleepHours) {
            this.showNotification('Please fill in all required fields.', 'error');
            return;
        }

        // Calculate individual factor scores (0-100)
        const stressFactor = this.calculateStressFactor(stressLevel);
        const sleepFactor = this.calculateSleepFactor(sleepHours, sleepQuality);
        const recoveryFactor = (recoveryScore / 10) * 100;
        const exerciseFactor = (exerciseConsistency / 10) * 100;
        const nutritionFactor = (nutritionQuality / 10) * 100;

        // Calculate weighted resilience score
        const resilienceScore = this.calculateResilienceScore({
            stress: stressFactor,
            sleep: sleepFactor,
            recovery: recoveryFactor,
            exercise: exerciseFactor,
            nutrition: nutritionFactor
        });

        const healthEntry = {
            id: Date.now(),
            date: logDate,
            stressLevel: stressLevel,
            sleepHours: sleepHours,
            sleepQuality: sleepQuality,
            recoveryScore: recoveryScore,
            exerciseConsistency: exerciseConsistency,
            nutritionQuality: nutritionQuality,
            // Factor scores
            stressFactor: stressFactor,
            sleepFactor: sleepFactor,
            recoveryFactor: recoveryFactor,
            exerciseFactor: exerciseFactor,
            nutritionFactor: nutritionFactor,
            // Overall score
            resilienceScore: resilienceScore,
            resilienceLevel: this.getResilienceLevel(resilienceScore),
            notes: notes,
            timestamp: new Date().toISOString()
        };

        this.healthData.push(healthEntry);
        this.saveData();

        // Reset form
        document.getElementById('resilienceForm').reset();
        this.setDefaultDate();

        // Update all components
        this.updateDashboard();
        this.renderChart();
        this.renderHistory();
        this.renderInsights();

        this.showNotification('Health metrics logged successfully!', 'success');
    }

    /**
     * Calculate stress factor (inverse relationship - lower stress = higher score)
     */
    calculateStressFactor(stressLevel) {
        // Stress level 1-10, where 1 is low stress, 10 is high stress
        // Convert to 0-100 where low stress = high score
        return ((11 - stressLevel) / 10) * 100;
    }

    /**
     * Calculate sleep factor based on hours and quality
     */
    calculateSleepFactor(hours, quality) {
        // Optimal sleep: 7-9 hours
        let durationScore;
        if (hours >= 7 && hours <= 9) {
            durationScore = 100;
        } else if (hours >= 6 && hours <= 10) {
            durationScore = 80;
        } else if (hours >= 5 && hours <= 11) {
            durationScore = 60;
        } else {
            durationScore = 40;
        }

        // Quality score (1-10 converted to 0-100)
        const qualityScore = (quality / 10) * 100;

        // Weighted average: 60% duration, 40% quality
        return (durationScore * 0.6) + (qualityScore * 0.4);
    }

    /**
     * Calculate overall resilience score using weighted factors
     */
    calculateResilienceScore(factors) {
        // Weights: Stress 25%, Sleep 25%, Recovery 20%, Exercise 15%, Nutrition 15%
        const weights = {
            stress: 0.25,
            sleep: 0.25,
            recovery: 0.20,
            exercise: 0.15,
            nutrition: 0.15
        };

        return Math.round(
            (factors.stress * weights.stress) +
            (factors.sleep * weights.sleep) +
            (factors.recovery * weights.recovery) +
            (factors.exercise * weights.exercise) +
            (factors.nutrition * weights.nutrition)
        );
    }

    /**
     * Get resilience level based on score
     */
    getResilienceLevel(score) {
        if (score >= 85) return 'elite';
        if (score >= 70) return 'strong';
        if (score >= 50) return 'moderate';
        return 'low';
    }

    /**
     * Update the dashboard with current metrics
     */
    updateDashboard() {
        if (this.healthData.length === 0) return;

        // Sort data by date (newest first)
        const sortedData = [...this.healthData].sort((a, b) => new Date(b.date) - new Date(a.date));
        const latest = sortedData[0];

        // Current resilience score
        document.getElementById('currentResilienceScore').textContent = latest.resilienceScore;

        // Resilience trend
        if (sortedData.length >= 2) {
            const previous = sortedData[1];
            const trend = latest.resilienceScore - previous.resilienceScore;
            const trendElement = document.getElementById('resilienceTrend');
            if (trend > 0) {
                trendElement.textContent = `↗ +${trend}`;
                trendElement.style.color = 'var(--success-color)';
            } else if (trend < 0) {
                trendElement.textContent = `↘ ${trend}`;
                trendElement.style.color = 'var(--error-color)';
            } else {
                trendElement.textContent = '→ 0';
                trendElement.style.color = 'var(--text-secondary)';
            }
        }

        // 7-day average
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentData = sortedData.filter(item => new Date(item.date) >= sevenDaysAgo);
        if (recentData.length > 0) {
            const avgScore = Math.round(recentData.reduce((sum, item) => sum + item.resilienceScore, 0) / recentData.length);
            document.getElementById('avgResilienceScore').textContent = avgScore;
        }

        // Resilience level
        document.getElementById('resilienceLevel').textContent = this.capitalizeFirst(latest.resilienceLevel);

        // Total entries
        document.getElementById('totalEntries').textContent = this.healthData.length;

        // Update factor breakdown
        this.updateFactorBreakdown(latest);
    }

    /**
     * Update factor breakdown visualization
     */
    updateFactorBreakdown(latest) {
        const factors = [
            { id: 'stress', score: latest.stressFactor },
            { id: 'sleep', score: latest.sleepFactor },
            { id: 'recovery', score: latest.recoveryFactor },
            { id: 'exercise', score: latest.exerciseFactor },
            { id: 'nutrition', score: latest.nutritionFactor }
        ];

        factors.forEach(factor => {
            const fillElement = document.getElementById(`${factor.id}FactorFill`);
            const scoreElement = document.getElementById(`${factor.id}FactorScore`);

            fillElement.style.setProperty('--factor-percentage', `${factor.score}%`);
            scoreElement.textContent = Math.round(factor.score);
        });
    }

    /**
     * Render the trend chart
     */
    renderChart() {
        const ctx = document.getElementById('resilienceChart');
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
            case 'resilience':
                data = filteredData.map(item => item.resilienceScore);
                label = 'Resilience Score';
                color = '#10b981';
                break;
            case 'stress':
                data = filteredData.map(item => item.stressLevel);
                label = 'Stress Level';
                color = '#ef4444';
                break;
            case 'sleep':
                data = filteredData.map(item => item.sleepFactor);
                label = 'Sleep Factor';
                color = '#06b6d4';
                break;
            case 'recovery':
                data = filteredData.map(item => item.recoveryFactor);
                label = 'Recovery Factor';
                color = '#f59e0b';
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
                                if (metric === 'resilience') {
                                    return `Resilience: ${context.parsed.y}/100`;
                                } else if (metric === 'stress') {
                                    return `Stress Level: ${context.parsed.y}/10`;
                                } else {
                                    return `${label}: ${Math.round(context.parsed.y)}/100`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: metric === 'stress' ? 10 : 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                if (metric === 'stress') {
                                    return value;
                                } else {
                                    return value;
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
        if (timeRange === 'all') return this.healthData;

        const numDays = parseInt(timeRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - numDays);

        return this.healthData.filter(item => new Date(item.date) >= cutoffDate);
    }

    /**
     * Render the history view
     */
    renderHistory() {
        const historyList = document.getElementById('historyList');
        const searchTerm = document.getElementById('historySearch').value.toLowerCase();
        const sortBy = document.getElementById('historySort').value;

        if (this.healthData.length === 0) {
            historyList.innerHTML = '<p class="no-data">No health entries logged yet. Start tracking your resilience above.</p>';
            return;
        }

        let filteredData = [...this.healthData];

        // Apply search filter
        if (searchTerm) {
            filteredData = filteredData.filter(item =>
                item.notes.toLowerCase().includes(searchTerm) ||
                item.resilienceLevel.toLowerCase().includes(searchTerm)
            );
        }

        // Apply sorting
        filteredData.sort((a, b) => {
            switch (sortBy) {
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'resilience-desc':
                    return b.resilienceScore - a.resilienceScore;
                case 'resilience-asc':
                    return a.resilienceScore - b.resilienceScore;
                case 'stress-desc':
                    return b.stressLevel - a.stressLevel;
                case 'stress-asc':
                    return a.stressLevel - b.stressLevel;
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

        return `
            <div class="history-item">
                <div class="history-item-header">
                    <div class="history-item-date">${date}</div>
                    <div class="history-item-score ${item.resilienceLevel}">${item.resilienceScore}</div>
                </div>
                <div class="history-item-metrics">
                    <div class="metric-item">
                        <div class="metric-value">${item.stressLevel}</div>
                        <div class="metric-label">Stress</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${item.sleepHours}h</div>
                        <div class="metric-label">Sleep</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${item.recoveryScore}</div>
                        <div class="metric-label">Recovery</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${item.exerciseConsistency}</div>
                        <div class="metric-label">Exercise</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${item.nutritionQuality}</div>
                        <div class="metric-label">Nutrition</div>
                    </div>
                </div>
                ${item.notes ? `<div class="history-item-notes">${item.notes}</div>` : ''}
            </div>
        `;
    }

    /**
     * Render insights and recommendations
     */
    renderInsights() {
        const insightsContainer = document.getElementById('insightsContainer');

        if (this.healthData.length === 0) {
            insightsContainer.innerHTML = '<p class="no-data">Add health data to see personalized resilience insights.</p>';
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
        const sortedData = [...this.healthData].sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sortedData.length === 0) return insights;

        const latest = sortedData[0];
        const previous = sortedData[1];

        // Current resilience insight
        const resilienceInsight = this.getResilienceInsight(latest.resilienceScore);
        if (resilienceInsight) insights.push(resilienceInsight);

        // Trend insight
        if (previous && sortedData.length >= 3) {
            const recentRuns = sortedData.slice(0, 3);
            const avgResilience = recentRuns.reduce((sum, run) => sum + run.resilienceScore, 0) / recentRuns.length;
            const prevRuns = sortedData.slice(3, 6);
            const prevAvgResilience = prevRuns.length > 0 ?
                prevRuns.reduce((sum, run) => sum + run.resilienceScore, 0) / prevRuns.length : 0;

            if (prevAvgResilience > 0) {
                const trend = avgResilience - prevAvgResilience;
                if (Math.abs(trend) > 10) {
                    insights.push({
                        icon: trend > 0 ? 'trending-up' : 'trending-down',
                        title: trend > 0 ? 'Resilience Improving' : 'Resilience Declining',
                        text: `Your average resilience score ${trend > 0 ? 'increased' : 'decreased'} by ${Math.abs(trend).toFixed(0)} points compared to previous entries.`
                    });
                }
            }
        }

        // Factor-specific insights
        if (latest.stressFactor < 50) {
            insights.push({
                icon: 'alert-triangle',
                title: 'High Stress Impact',
                text: 'Your stress levels are significantly impacting your resilience. Consider stress management techniques or lifestyle adjustments.'
            });
        }

        if (latest.sleepFactor < 60) {
            insights.push({
                icon: 'moon',
                title: 'Sleep Optimization Needed',
                text: 'Your sleep quality or duration could be improved. Aim for 7-9 hours of quality sleep per night for better resilience.'
            });
        }

        if (latest.recoveryFactor < 60) {
            insights.push({
                icon: 'battery',
                title: 'Recovery Focus',
                text: 'Your recovery score indicates you may need more rest or recovery activities. Consider incorporating more restorative practices.'
            });
        }

        if (latest.exerciseFactor < 60) {
            insights.push({
                icon: 'activity',
                title: 'Exercise Consistency',
                text: 'Regular exercise is crucial for resilience. Try to maintain consistent physical activity for better health outcomes.'
            });
        }

        if (latest.nutritionFactor < 60) {
            insights.push({
                icon: 'apple',
                title: 'Nutrition Priority',
                text: 'Your nutrition quality could be improved. Focus on balanced meals with adequate nutrients for optimal resilience.'
            });
        }

        // Overall improvement suggestions
        if (sortedData.length >= 7) {
            const weeklyAvg = sortedData.slice(0, 7).reduce((sum, item) => sum + item.resilienceScore, 0) / 7;
            if (weeklyAvg < 60) {
                insights.push({
                    icon: 'target',
                    title: 'Holistic Health Approach',
                    text: 'Consider a comprehensive approach addressing multiple health factors simultaneously for better resilience improvement.'
                });
            }
        }

        return insights.slice(0, 4); // Limit to 4 insights
    }

    /**
     * Get resilience insight based on score
     */
    getResilienceInsight(score) {
        if (score >= 85) {
            return {
                icon: 'star',
                title: 'Elite Health Resilience',
                text: 'Your health resilience is exceptional! You demonstrate outstanding adaptive capacity across all measured factors.'
            };
        } else if (score >= 70) {
            return {
                icon: 'thumbs-up',
                title: 'Strong Resilience',
                text: 'Your resilience is solid with good balance across health factors. Continue maintaining these healthy habits.'
            };
        } else if (score >= 50) {
            return {
                icon: 'minus',
                title: 'Moderate Resilience',
                text: 'Your resilience is moderate. Focus on improving key areas to enhance your overall health adaptive capacity.'
            };
        } else {
            return {
                icon: 'alert-triangle',
                title: 'Low Resilience',
                text: 'Your current resilience score indicates areas needing attention. Prioritize health improvements for better well-being.'
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
    new PersonalHealthResilienceTracker();
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
document.head.appendChild(style);