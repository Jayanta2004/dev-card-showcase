// Motivation Cycle Analyzer JavaScript
// Tracks daily motivation levels to identify cyclical patterns and improve goal consistency

class MotivationCycleAnalyzer {
    constructor() {
        // Initialize motivation data from localStorage
        this.motivationData = this.loadData();
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
        this.updateCycleVisualization();
    }

    /**
     * Set up all event listeners for user interactions
     */
    setupEventListeners() {
        // Form submission for logging motivation
        document.getElementById('motivationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logMotivation();
        });

        // Real-time updates for sliders
        document.getElementById('motivationLevel').addEventListener('input', () => {
            this.updateMotivationDisplay();
        });

        document.getElementById('energyLevel').addEventListener('input', () => {
            this.updateEnergyDisplay();
        });

        document.getElementById('focusLevel').addEventListener('input', () => {
            this.updateFocusDisplay();
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
     * Load motivation data from localStorage
     */
    loadData() {
        const data = localStorage.getItem('motivationData');
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save motivation data to localStorage
     */
    saveData() {
        localStorage.setItem('motivationData', JSON.stringify(this.motivationData));
    }

    /**
     * Log a new motivation entry
     */
    logMotivation() {
        const logDate = document.getElementById('logDate').value;
        const motivationLevel = parseInt(document.getElementById('motivationLevel').value);
        const energyLevel = parseInt(document.getElementById('energyLevel').value);
        const focusLevel = parseInt(document.getElementById('focusLevel').value);
        const notes = document.getElementById('notes').value.trim();

        if (!logDate) {
            this.showNotification('Please select a date.', 'error');
            return;
        }

        // Check if entry already exists for this date
        const existingEntry = this.motivationData.find(entry => entry.date === logDate);
        if (existingEntry) {
            if (!confirm('An entry already exists for this date. Do you want to update it?')) {
                return;
            }
            // Update existing entry
            existingEntry.motivationLevel = motivationLevel;
            existingEntry.energyLevel = energyLevel;
            existingEntry.focusLevel = focusLevel;
            existingEntry.notes = notes;
            existingEntry.timestamp = new Date().toISOString();
        } else {
            // Create new entry
            const entry = {
                id: Date.now(),
                date: logDate,
                motivationLevel: motivationLevel,
                energyLevel: energyLevel,
                focusLevel: focusLevel,
                notes: notes,
                timestamp: new Date().toISOString()
            };
            this.motivationData.push(entry);
        }

        this.saveData();

        // Reset form
        document.getElementById('motivationForm').reset();
        this.setDefaultDate();
        this.updateMotivationDisplay();
        this.updateEnergyDisplay();
        this.updateFocusDisplay();

        // Update all components
        this.updateDashboard();
        this.renderChart();
        this.renderHistory();
        this.renderInsights();
        this.updateCycleVisualization();

        this.showNotification('Motivation logged successfully!', 'success');
    }

    /**
     * Set default date to today
     */
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('logDate').value = today;
    }

    /**
     * Update motivation level display
     */
    updateMotivationDisplay() {
        const level = document.getElementById('motivationLevel').value;
        document.getElementById('motivationValue').textContent = level;
        document.getElementById('motivationText').textContent = this.getMotivationText(level);
    }

    /**
     * Update energy level display
     */
    updateEnergyDisplay() {
        const level = document.getElementById('energyLevel').value;
        document.getElementById('energyValue').textContent = level;
    }

    /**
     * Update focus level display
     */
    updateFocusDisplay() {
        const level = document.getElementById('focusLevel').value;
        document.getElementById('focusValue').textContent = level;
    }

    /**
     * Get motivation text description
     */
    getMotivationText(level) {
        if (level <= 2) return 'Very Low';
        if (level <= 4) return 'Low';
        if (level <= 6) return 'Moderate';
        if (level <= 8) return 'High';
        return 'Very High';
    }

    /**
     * Update the dashboard with current status
     */
    updateDashboard() {
        if (this.motivationData.length === 0) {
            this.setDefaultDate();
            return;
        }

        // Sort data by date (newest first)
        const sortedData = [...this.motivationData].sort((a, b) => new Date(b.date) - new Date(a.date));
        const today = new Date().toISOString().split('T')[0];
        const todayEntry = sortedData.find(entry => entry.date === today);

        // Current motivation (today's entry or latest)
        const currentEntry = todayEntry || sortedData[0];
        document.getElementById('currentMotivation').textContent = currentEntry.motivationLevel;

        // 7-day average
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentEntries = sortedData.filter(entry => new Date(entry.date) >= sevenDaysAgo);

        if (recentEntries.length > 0) {
            const average = recentEntries.reduce((sum, entry) => sum + entry.motivationLevel, 0) / recentEntries.length;
            document.getElementById('weeklyAverage').textContent = average.toFixed(1);
        } else {
            document.getElementById('weeklyAverage').textContent = 'N/A';
        }

        // Cycle phase
        const cyclePhase = this.detectCyclePhase(currentEntry.motivationLevel);
        document.getElementById('cyclePhase').textContent = cyclePhase.phase;
        document.getElementById('cycleTrend').textContent = cyclePhase.trend;

        // Logging streak
        const streak = this.calculateStreak();
        document.getElementById('streakCount').textContent = streak;
    }

    /**
     * Detect current cycle phase based on motivation level
     */
    detectCyclePhase(level) {
        if (level <= 3) {
            return { phase: 'Low', trend: 'Needs Boost' };
        } else if (level <= 6) {
            return { phase: 'Building', trend: 'Steady Progress' };
        } else if (level <= 8) {
            return { phase: 'Peak', trend: 'High Productivity' };
        } else {
            return { phase: 'Flow', trend: 'Maintain Momentum' };
        }
    }

    /**
     * Calculate current logging streak
     */
    calculateStreak() {
        if (this.motivationData.length === 0) return 0;

        const sortedData = [...this.motivationData].sort((a, b) => new Date(b.date) - new Date(a.date));
        let streak = 0;
        let currentDate = new Date();

        for (const entry of sortedData) {
            const entryDate = new Date(entry.date);
            const daysDiff = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));

            if (daysDiff === streak) {
                streak++;
                currentDate = entryDate;
            } else if (daysDiff > streak) {
                break;
            }
        }

        return streak;
    }

    /**
     * Update cycle visualization
     */
    updateCycleVisualization() {
        if (this.motivationData.length === 0) return;

        const sortedData = [...this.motivationData].sort((a, b) => new Date(b.date) - new Date(a.date));
        const latest = sortedData[0];
        const percentage = (latest.motivationLevel / 10) * 100;

        const cycleFill = document.getElementById('cycleFill');
        cycleFill.style.setProperty('--cycle-percentage', `${percentage}%`);
        cycleFill.style.width = `${percentage}%`;
    }

    /**
     * Render the trend chart
     */
    renderChart() {
        const ctx = document.getElementById('motivationChart');
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

        const motivationData = filteredData.map(item => item.motivationLevel);
        const energyData = filteredData.map(item => item.energyLevel);
        const focusData = filteredData.map(item => item.focusLevel);

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Motivation Level',
                    data: motivationData,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    yAxisID: 'y'
                }, {
                    label: 'Energy Level',
                    data: energyData,
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#06b6d4',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y'
                }, {
                    label: 'Focus Level',
                    data: focusData,
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
                    yAxisID: 'y'
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
                                return `${context.dataset.label}: ${context.parsed.y}/10`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '/10';
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
    getFilteredData(days) {
        if (days === 'all') return this.motivationData;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return this.motivationData.filter(item => new Date(item.date) >= cutoffDate);
    }

    /**
     * Render the history view
     */
    renderHistory() {
        const historyList = document.getElementById('historyList');
        const searchTerm = document.getElementById('historySearch').value.toLowerCase();
        const sortBy = document.getElementById('historySort').value;

        if (this.motivationData.length === 0) {
            historyList.innerHTML = '<p class="no-data">No motivation entries logged yet. Start tracking your daily motivation above.</p>';
            return;
        }

        let filteredData = [...this.motivationData];

        // Apply search filter
        if (searchTerm) {
            filteredData = filteredData.filter(item =>
                item.notes.toLowerCase().includes(searchTerm)
            );
        }

        // Apply sorting
        filteredData.sort((a, b) => {
            switch (sortBy) {
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'motivation-asc':
                    return a.motivationLevel - b.motivationLevel;
                case 'motivation-desc':
                    return b.motivationLevel - a.motivationLevel;
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
        const motivationClass = this.getMotivationClass(item.motivationLevel);

        return `
            <div class="history-item">
                <div class="history-item-header">
                    <div class="history-item-date">${date}</div>
                    <div class="history-item-motivation ${motivationClass}">${item.motivationLevel}/10</div>
                </div>
                <div class="history-item-details">
                    <div>Energy: ${item.energyLevel}/10</div>
                    <div>Focus: ${item.focusLevel}/10</div>
                    <div>Phase: ${this.detectCyclePhase(item.motivationLevel).phase}</div>
                </div>
                ${item.notes ? `<div class="history-item-notes">${item.notes}</div>` : ''}
            </div>
        `;
    }

    /**
     * Get motivation class for styling
     */
    getMotivationClass(level) {
        if (level <= 3) return 'low-motivation';
        if (level <= 6) return 'building-motivation';
        if (level <= 8) return 'peak-motivation';
        return 'declining-motivation';
    }

    /**
     * Render insights and recommendations
     */
    renderInsights() {
        const insightsContainer = document.getElementById('insightsContainer');

        if (this.motivationData.length === 0) {
            insightsContainer.innerHTML = '<p class="no-data">Add motivation entries to see personalized insights.</p>';
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
        const sortedData = [...this.motivationData].sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sortedData.length === 0) return insights;

        const latest = sortedData[0];
        const previous = sortedData[1];

        // Current motivation insight
        const motivationInsight = this.getMotivationInsight(latest.motivationLevel);
        if (motivationInsight) insights.push(motivationInsight);

        // Trend insight
        if (previous && sortedData.length >= 7) {
            const weekData = sortedData.slice(0, 7);
            const weekAverage = weekData.reduce((sum, entry) => sum + entry.motivationLevel, 0) / weekData.length;
            const previousWeek = sortedData.slice(7, 14);
            const previousAverage = previousWeek.length > 0 ?
                previousWeek.reduce((sum, entry) => sum + entry.motivationLevel, 0) / previousWeek.length : 0;

            if (previousAverage > 0) {
                const trend = weekAverage - previousAverage;
                if (Math.abs(trend) > 1) {
                    insights.push({
                        icon: trend > 0 ? 'trending-up' : 'trending-down',
                        title: trend > 0 ? 'Motivation Improving' : 'Motivation Declining',
                        text: `Your average motivation ${trend > 0 ? 'increased' : 'decreased'} by ${Math.abs(trend).toFixed(1)} points compared to last week.`
                    });
                }
            }
        }

        // Streak insight
        const streak = this.calculateStreak();
        if (streak >= 7) {
            insights.push({
                icon: 'flame',
                title: 'Consistency Champion!',
                text: `You've maintained a ${streak}-day logging streak. Consistent tracking helps identify motivation patterns.`
            });
        } else if (streak === 0 && sortedData.length > 0) {
            insights.push({
                icon: 'calendar',
                title: 'Resume Tracking',
                text: 'Consider logging your motivation daily to identify patterns and improve consistency.'
            });
        }

        // Energy-Focus correlation
        if (sortedData.length >= 5) {
            const recent = sortedData.slice(0, 5);
            const avgMotivation = recent.reduce((sum, entry) => sum + entry.motivationLevel, 0) / recent.length;
            const avgEnergy = recent.reduce((sum, entry) => sum + entry.energyLevel, 0) / recent.length;
            const avgFocus = recent.reduce((sum, entry) => sum + entry.focusLevel, 0) / recent.length;

            if (avgEnergy > avgMotivation + 1) {
                insights.push({
                    icon: 'zap',
                    title: 'High Energy, Moderate Motivation',
                    text: 'You have good energy levels but motivation could be higher. Try breaking goals into smaller, manageable tasks.'
                });
            } else if (avgFocus > avgMotivation + 1) {
                insights.push({
                    icon: 'target',
                    title: 'Focused but Not Motivated',
                    text: 'You have strong focus but lower motivation. Consider finding more meaningful reasons for your goals.'
                });
            }
        }

        // Cycle pattern insight
        if (sortedData.length >= 14) {
            const pattern = this.detectWeeklyPattern(sortedData.slice(0, 14));
            if (pattern) {
                insights.push({
                    icon: 'repeat',
                    title: 'Weekly Pattern Detected',
                    text: pattern
                });
            }
        }

        return insights.slice(0, 4); // Limit to 4 insights
    }

    /**
     * Get motivation insight based on current level
     */
    getMotivationInsight(level) {
        if (level <= 2) {
            return {
                icon: 'alert-triangle',
                title: 'Very Low Motivation',
                text: 'Consider taking a break, practicing self-care, or breaking goals into smaller steps. Sometimes rest is the best motivation booster.'
            };
        } else if (level <= 4) {
            return {
                icon: 'battery-low',
                title: 'Low Motivation Phase',
                text: 'This might be a natural dip. Try starting with small, easy tasks to build momentum. Remember why you started.'
            };
        } else if (level <= 6) {
            return {
                icon: 'battery-medium',
                title: 'Moderate Motivation',
                text: 'You\'re in a good place to make progress. Focus on maintaining consistency and celebrating small wins.'
            };
        } else if (level <= 8) {
            return {
                icon: 'battery-high',
                title: 'High Motivation',
                text: 'Great! You\'re in a productive phase. Channel this energy into important goals while it lasts.'
            };
        } else {
            return {
                icon: 'battery-full',
                title: 'Peak Motivation',
                text: 'Excellent! You\'re highly motivated. Use this time to tackle challenging tasks and make significant progress.'
            };
        }
    }

    /**
     * Detect weekly patterns in motivation
     */
    detectWeeklyPattern(data) {
        // Simple pattern detection - check if motivation tends to be higher/lower on certain days
        const dayAverages = {};
        data.forEach(entry => {
            const day = new Date(entry.date).getDay();
            if (!dayAverages[day]) dayAverages[day] = [];
            dayAverages[day].push(entry.motivationLevel);
        });

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let highestDay = null;
        let lowestDay = null;
        let highestAvg = 0;
        let lowestAvg = 10;

        Object.keys(dayAverages).forEach(day => {
            const avg = dayAverages[day].reduce((sum, val) => sum + val, 0) / dayAverages[day].length;
            if (avg > highestAvg) {
                highestAvg = avg;
                highestDay = parseInt(day);
            }
            if (avg < lowestAvg) {
                lowestAvg = avg;
                lowestDay = parseInt(day);
            }
        });

        if (highestDay !== null && lowestDay !== null && highestAvg - lowestAvg > 1) {
            return `Your motivation tends to be highest on ${dayNames[highestDay]}s (${highestAvg.toFixed(1)}/10) and lowest on ${dayNames[lowestDay]}s (${lowestAvg.toFixed(1)}/10).`;
        }

        return null;
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
    new MotivationCycleAnalyzer();
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
<parameter name="filePath">c:\Users\Gupta\Downloads\dev-card-showcase\js\motivation-cycle-analyzer.js