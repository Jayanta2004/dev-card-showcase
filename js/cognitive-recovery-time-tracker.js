// Cognitive Recovery Time Tracker JavaScript
// This module tracks cognitive recovery times from intensive work sessions to measure and improve mental capacity

class CognitiveRecoveryTracker {
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
        this.updateLoadDisplay();
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

        // Cognitive load slider updates display in real-time
        document.getElementById('cognitiveLoad').addEventListener('input', () => {
            this.updateLoadDisplay();
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
     * Update the cognitive load display based on slider value
     * Maps numerical values to descriptive labels
     */
    updateLoadDisplay() {
        const cognitiveLoad = document.getElementById('cognitiveLoad').value;
        const loadValue = document.getElementById('loadValue');
        const loadText = document.getElementById('loadText');

        loadValue.textContent = cognitiveLoad;

        // Map cognitive load levels to descriptive labels
        const loadLabels = {
            1: 'Light',
            2: 'Light',
            3: 'Moderate',
            4: 'Moderate',
            5: 'Moderate',
            6: 'Heavy',
            7: 'Heavy',
            8: 'Intense',
            9: 'Intense',
            10: 'Extreme'
        };

        loadText.textContent = loadLabels[cognitiveLoad] || 'Moderate';
    }

    /**
     * Log a new recovery event from the form data
     * Calculates recovery duration and validates input
     */
    logRecoveryEvent() {
        // Collect form data
        const formData = {
            id: Date.now(),
            sessionDate: document.getElementById('sessionDate').value,
            sessionStart: document.getElementById('sessionStart').value,
            sessionEnd: document.getElementById('sessionEnd').value,
            recoveryTime: document.getElementById('recoveryTime').value,
            cognitiveLoad: parseInt(document.getElementById('cognitiveLoad').value),
            workType: document.getElementById('workType').value,
            sessionDescription: document.getElementById('sessionDescription').value,
            recoveryNotes: document.getElementById('recoveryNotes').value
        };

        // Validate session times
        const sessionStart = new Date(`${formData.sessionDate}T${formData.sessionStart}`);
        const sessionEnd = new Date(`${formData.sessionDate}T${formData.sessionEnd}`);
        const recoveryTime = new Date(formData.recoveryTime);

        if (sessionEnd <= sessionStart) {
            alert('Session end time must be after start time.');
            return;
        }

        if (recoveryTime <= sessionEnd) {
            alert('Recovery time must be after session end time.');
            return;
        }

        // Calculate session duration and recovery time
        const sessionDuration = (sessionEnd - sessionStart) / (1000 * 60); // minutes
        const recoveryDuration = (recoveryTime - sessionEnd) / (1000 * 60); // minutes

        // Create recovery event object
        const recoveryEvent = {
            ...formData,
            sessionDuration,
            recoveryDuration,
            timestamp: new Date().toISOString()
        };

        // Add to data array
        this.recoveryData.push(recoveryEvent);
        this.saveData();

        // Reset form
        document.getElementById('recoveryForm').reset();
        this.updateLoadDisplay();

        // Update UI
        this.updateDashboard();
        this.renderChart();
        this.renderHistory();
        this.renderInsights();
        this.renderBenchmarks();

        // Show success message
        this.showNotification('Work session logged successfully!', 'success');
    }

    /**
     * Load recovery data from localStorage
     */
    loadData() {
        const data = localStorage.getItem('cognitiveRecoveryData');
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save recovery data to localStorage
     */
    saveData() {
        localStorage.setItem('cognitiveRecoveryData', JSON.stringify(this.recoveryData));
    }

    /**
     * Update the dashboard with current metrics
     */
    updateDashboard() {
        const data = this.recoveryData;

        if (data.length === 0) {
            // Reset all metrics
            document.getElementById('avgRecoveryTime').textContent = '--';
            document.getElementById('fastestRecovery').textContent = '--';
            document.getElementById('totalSessions').textContent = '0';
            document.getElementById('capacityScore').textContent = '--';
            document.getElementById('capacityFill').style.width = '0%';
            document.getElementById('capacityLabel').textContent = 'No data available';
            return;
        }

        // Calculate metrics
        const avgRecovery = data.reduce((sum, item) => sum + item.recoveryDuration, 0) / data.length;
        const fastestRecovery = Math.min(...data.map(item => item.recoveryDuration));
        const totalSessions = data.length;

        // Calculate capacity score (inverse of average recovery time, normalized)
        const capacityScore = Math.max(0, Math.min(100, 100 - (avgRecovery / 60) * 10));

        // Update metrics display
        document.getElementById('avgRecoveryTime').textContent = this.formatDuration(avgRecovery);
        document.getElementById('fastestRecovery').textContent = this.formatDuration(fastestRecovery);
        document.getElementById('totalSessions').textContent = totalSessions;
        document.getElementById('capacityScore').textContent = Math.round(capacityScore);

        // Update capacity indicator
        document.getElementById('capacityFill').style.width = `${capacityScore}%`;
        document.getElementById('capacityLabel').textContent = this.getCapacityLabel(capacityScore);
    }

    /**
     * Format duration in minutes to readable string
     */
    formatDuration(minutes) {
        if (minutes < 60) {
            return `${Math.round(minutes)}m`;
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = Math.round(minutes % 60);
            return `${hours}h ${mins}m`;
        }
    }

    /**
     * Get capacity label based on score
     */
    getCapacityLabel(score) {
        if (score >= 80) return 'Excellent Capacity';
        if (score >= 60) return 'Good Capacity';
        if (score >= 40) return 'Moderate Capacity';
        if (score >= 20) return 'Low Capacity';
        return 'Needs Improvement';
    }

    /**
     * Render the recovery trends chart
     */
    renderChart() {
        const ctx = document.getElementById('recoveryChart').getContext('2d');
        const timeRange = document.getElementById('timeRange').value;

        // Filter data based on time range
        const filteredData = this.filterDataByTimeRange(timeRange);

        // Prepare chart data
        const chartData = {
            labels: filteredData.map(item => {
                const date = new Date(item.sessionDate);
                return date.toLocaleDateString();
            }),
            datasets: [{
                label: 'Recovery Time (minutes)',
                data: filteredData.map(item => item.recoveryDuration),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        };

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        // Create new chart
        this.chart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `Recovery: ${this.formatDuration(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Recovery Time (minutes)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Session Date'
                        }
                    }
                }
            }
        });
    }

    /**
     * Filter data based on selected time range
     */
    filterDataByTimeRange(range) {
        const now = new Date();
        const days = parseInt(range);

        if (range === 'all') {
            return this.recoveryData;
        }

        const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

        return this.recoveryData.filter(item => {
            const sessionDate = new Date(item.sessionDate);
            return sessionDate >= cutoffDate;
        });
    }

    /**
     * Render the session history
     */
    renderHistory(view = 'recent') {
        const historyContainer = document.getElementById('sessionHistory');
        let data = this.recoveryData;

        // Sort by date (most recent first)
        data.sort((a, b) => new Date(b.sessionDate) - new Date(a.sessionDate));

        // Filter for recent view (last 10 sessions)
        if (view === 'recent') {
            data = data.slice(0, 10);
        }

        // Clear existing content
        historyContainer.innerHTML = '';

        if (data.length === 0) {
            historyContainer.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No sessions logged yet.</p>';
            return;
        }

        // Render history items
        data.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';

            const sessionDate = new Date(item.sessionDate).toLocaleDateString();
            const workTypeLabel = this.getWorkTypeLabel(item.workType);

            historyItem.innerHTML = `
                <div class="history-item-header">
                    <div class="history-item-title">${workTypeLabel}: ${item.sessionDescription}</div>
                    <div class="history-item-date">${sessionDate}</div>
                </div>
                <div class="history-item-details">
                    <div>Session: ${this.formatDuration(item.sessionDuration)}</div>
                    <div>Recovery: ${this.formatDuration(item.recoveryDuration)}</div>
                    <div>Load: ${item.cognitiveLoad}/10</div>
                    <div>Type: ${workTypeLabel}</div>
                </div>
                ${item.recoveryNotes ? `<div class="history-item-notes">${item.recoveryNotes}</div>` : ''}
            `;

            historyContainer.appendChild(historyItem);
        });
    }

    /**
     * Get human-readable work type label
     */
    getWorkTypeLabel(workType) {
        const labels = {
            'programming': 'Programming',
            'writing': 'Writing',
            'research': 'Research',
            'problem-solving': 'Problem Solving',
            'learning': 'Learning',
            'meetings': 'Meetings',
            'other': 'Other'
        };
        return labels[workType] || workType;
    }

    /**
     * Toggle history view between recent and all
     */
    toggleHistoryView(view) {
        // Update button states
        document.getElementById('viewRecent').classList.toggle('active', view === 'recent');
        document.getElementById('viewAll').classList.toggle('active', view === 'all');

        // Render history
        this.renderHistory(view);
    }

    /**
     * Render cognitive insights
     */
    renderInsights() {
        this.renderRecoveryPatterns();
        this.renderWorkTypeImpact();
        this.renderOptimizationTips();
        this.renderTips();
    }

    /**
     * Render recovery patterns insight
     */
    renderRecoveryPatterns() {
        const container = document.getElementById('recoveryPatterns');
        const data = this.recoveryData;

        if (data.length < 3) {
            container.innerHTML = '<p>Log more sessions to see recovery patterns.</p>';
            return;
        }

        // Analyze recovery patterns
        const avgRecovery = data.reduce((sum, item) => sum + item.recoveryDuration, 0) / data.length;
        const highLoadSessions = data.filter(item => item.cognitiveLoad >= 7);
        const avgHighLoadRecovery = highLoadSessions.length > 0
            ? highLoadSessions.reduce((sum, item) => sum + item.recoveryDuration, 0) / highLoadSessions.length
            : 0;

        let insight = `<p>Your average recovery time is ${this.formatDuration(avgRecovery)}. `;

        if (highLoadSessions.length > 0) {
            insight += `High cognitive load sessions (${highLoadSessions.length}) require ${this.formatDuration(avgHighLoadRecovery)} on average.`;
        }

        insight += '</p>';
        container.innerHTML = insight;
    }

    /**
     * Render work type impact insight
     */
    renderWorkTypeImpact() {
        const container = document.getElementById('workTypeImpact');
        const data = this.recoveryData;

        if (data.length < 5) {
            container.innerHTML = '<p>Log more sessions to analyze work type impact.</p>';
            return;
        }

        // Group by work type
        const workTypeStats = {};
        data.forEach(item => {
            if (!workTypeStats[item.workType]) {
                workTypeStats[item.workType] = { count: 0, totalRecovery: 0 };
            }
            workTypeStats[item.workType].count++;
            workTypeStats[item.workType].totalRecovery += item.recoveryDuration;
        });

        // Find work type with longest recovery
        let maxRecoveryType = null;
        let maxAvgRecovery = 0;

        Object.keys(workTypeStats).forEach(type => {
            const avgRecovery = workTypeStats[type].totalRecovery / workTypeStats[type].count;
            if (avgRecovery > maxAvgRecovery) {
                maxAvgRecovery = avgRecovery;
                maxRecoveryType = type;
            }
        });

        if (maxRecoveryType) {
            const label = this.getWorkTypeLabel(maxRecoveryType);
            container.innerHTML = `<p>${label} sessions require the longest recovery time (${this.formatDuration(maxAvgRecovery)} on average).</p>`;
        } else {
            container.innerHTML = '<p>Work type analysis not available yet.</p>';
        }
    }

    /**
     * Render optimization tips insight
     */
    renderOptimizationTips() {
        const container = document.getElementById('optimizationTips');
        const data = this.recoveryData;

        if (data.length < 5) {
            container.innerHTML = '<p>More data needed for optimization suggestions.</p>';
            return;
        }

        const avgRecovery = data.reduce((sum, item) => sum + item.recoveryDuration, 0) / data.length;
        let tip = '';

        if (avgRecovery > 120) { // More than 2 hours
            tip = 'Consider breaking intense work sessions into shorter intervals with breaks.';
        } else if (avgRecovery > 60) { // More than 1 hour
            tip = 'Try incorporating short mindfulness exercises between work sessions.';
        } else {
            tip = 'Your recovery times are excellent! Keep up the good work-life balance.';
        }

        container.innerHTML = `<p>${tip}</p>`;
    }

    /**
     * Render tips list
     */
    renderTips() {
        const container = document.getElementById('tips');
        const tips = [
            {
                title: 'Active Recovery',
                content: 'Light physical activity or walking can accelerate mental recovery.'
            },
            {
                title: 'Sleep Priority',
                content: 'Never sacrifice sleep for work. Quality rest is essential for cognitive recovery.'
            },
            {
                title: 'Nature Exposure',
                content: 'Time in nature has been shown to reduce mental fatigue and improve focus.'
            },
            {
                title: 'Hydration Matters',
                content: 'Dehydration can significantly impair cognitive function and prolong recovery.'
            }
        ];

        container.innerHTML = tips.map(tip => `
            <div class="tip-item">
                <i data-lucide="lightbulb"></i>
                <div class="tip-content">
                    <h4>${tip.title}</h4>
                    <p>${tip.content}</p>
                </div>
            </div>
        `).join('');

        // Re-initialize Lucide icons
        lucide.createIcons();
    }

    /**
     * Render cognitive benchmarks
     */
    renderBenchmarks() {
        const container = document.getElementById('benchmarks');
        const data = this.recoveryData;

        if (data.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">Complete more sessions to see benchmarks.</p>';
            return;
        }

        const avgRecovery = data.reduce((sum, item) => sum + item.recoveryDuration, 0) / data.length;
        const benchmarks = [
            {
                title: 'Recovery Speed',
                description: 'How quickly you recover from cognitive work',
                range: this.getBenchmarkRange(avgRecovery, 'recovery'),
                icon: 'zap',
                level: this.getBenchmarkLevel(avgRecovery, 'recovery')
            },
            {
                title: 'Work Capacity',
                description: 'Your ability to handle intensive cognitive tasks',
                range: this.getBenchmarkRange(data.length, 'capacity'),
                icon: 'brain',
                level: this.getBenchmarkLevel(data.length, 'capacity')
            },
            {
                title: 'Load Management',
                description: 'How well you manage cognitive load levels',
                range: this.getBenchmarkRange(this.getAvgLoad(), 'load'),
                icon: 'trending-up',
                level: this.getBenchmarkLevel(this.getAvgLoad(), 'load')
            }
        ];

        container.innerHTML = benchmarks.map(benchmark => `
            <div class="benchmark-item">
                <div class="benchmark-header">
                    <div class="benchmark-icon ${benchmark.level}">
                        <i data-lucide="${benchmark.icon}"></i>
                    </div>
                    <div class="benchmark-title">${benchmark.title}</div>
                </div>
                <div class="benchmark-description">${benchmark.description}</div>
                <div class="benchmark-range">${benchmark.range}</div>
            </div>
        `).join('');

        // Re-initialize Lucide icons
        lucide.createIcons();
    }

    /**
     * Get average cognitive load
     */
    getAvgLoad() {
        if (this.recoveryData.length === 0) return 0;
        return this.recoveryData.reduce((sum, item) => sum + item.cognitiveLoad, 0) / this.recoveryData.length;
    }

    /**
     * Get benchmark range text
     */
    getBenchmarkRange(value, type) {
        switch (type) {
            case 'recovery':
                if (value < 30) return 'Excellent (< 30 min)';
                if (value < 60) return 'Good (30-60 min)';
                if (value < 120) return 'Fair (1-2 hours)';
                return 'Needs Improvement (> 2 hours)';
            case 'capacity':
                if (value > 20) return 'High (> 20 sessions)';
                if (value > 10) return 'Moderate (10-20 sessions)';
                return 'Building (1-10 sessions)';
            case 'load':
                if (value < 4) return 'Conservative (< 4/10)';
                if (value < 7) return 'Balanced (4-7/10)';
                return 'Intensive (7-10/10)';
            default:
                return 'Unknown';
        }
    }

    /**
     * Get benchmark level class
     */
    getBenchmarkLevel(value, type) {
        switch (type) {
            case 'recovery':
                return value < 60 ? 'excellent' : value < 120 ? 'good' : 'needs-improvement';
            case 'capacity':
                return value > 15 ? 'excellent' : value > 5 ? 'good' : 'needs-improvement';
            case 'load':
                return value < 5 ? 'excellent' : value < 8 ? 'good' : 'needs-improvement';
            default:
                return 'needs-improvement';
        }
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
    new CognitiveRecoveryTracker();
});