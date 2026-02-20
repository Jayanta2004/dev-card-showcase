// Emotional Trigger Duration Tracker JavaScript
// This module tracks the duration of emotional triggers to measure and improve emotional regulation

class EmotionalTriggerTracker {
    constructor() {
        // Initialize trigger data from localStorage
        this.triggerData = this.loadData();
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
        this.updateIntensityDisplay();
    }

    /**
     * Set up all event listeners for user interactions
     */
    setupEventListeners() {
        // Form submission for logging trigger events
        document.getElementById('triggerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logTriggerEvent();
        });

        // Intensity level slider updates display in real-time
        document.getElementById('intensityLevel').addEventListener('input', () => {
            this.updateIntensityDisplay();
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
     * Update the intensity level display based on slider value
     * Maps numerical values to descriptive labels
     */
    updateIntensityDisplay() {
        const intensityLevel = document.getElementById('intensityLevel').value;
        const intensityValue = document.getElementById('intensityValue');
        const intensityText = document.getElementById('intensityText');

        intensityValue.textContent = intensityLevel;

        // Map intensity levels to descriptive labels
        const intensityLabels = {
            1: 'Very Mild',
            2: 'Mild',
            3: 'Low',
            4: 'Moderate',
            5: 'Moderate',
            6: 'Strong',
            7: 'High',
            8: 'Intense',
            9: 'Overwhelming',
            10: 'Extreme'
        };

        intensityText.textContent = intensityLabels[intensityLevel] || 'Moderate';
    }

    /**
     * Log a new trigger event from the form data
     * Calculates trigger duration and validates input
     */
    logTriggerEvent() {
        // Collect form data
        const formData = {
            id: Date.now(),
            triggerDate: document.getElementById('triggerDate').value,
            triggerStartTime: document.getElementById('triggerStartTime').value,
            triggerEndTime: document.getElementById('triggerEndTime').value,
            triggerType: document.getElementById('triggerType').value,
            intensityLevel: parseInt(document.getElementById('intensityLevel').value),
            triggerDescription: document.getElementById('triggerDescription').value,
            copingStrategies: document.getElementById('copingStrategies').value
        };

        // Validate that end time is after start time
        const startDateTime = new Date(`${formData.triggerDate}T${formData.triggerStartTime}`);
        const endDateTime = new Date(formData.triggerEndTime);

        if (endDateTime <= startDateTime) {
            alert('End time must be after start time.');
            return;
        }

        // Calculate duration in minutes
        const durationMs = endDateTime - startDateTime;
        const durationMinutes = Math.round(durationMs / (1000 * 60));

        // Add calculated fields
        formData.duration = durationMinutes;
        formData.startDateTime = startDateTime.toISOString();
        formData.endDateTime = endDateTime.toISOString();

        // Save to data array
        this.triggerData.push(formData);
        this.saveData();

        // Reset form
        document.getElementById('triggerForm').reset();
        this.updateIntensityDisplay();

        // Update UI
        this.updateDashboard();
        this.renderChart();
        this.renderHistory();
        this.renderInsights();
        this.renderBenchmarks();

        // Show success message
        this.showNotification('Trigger logged successfully!', 'success');
    }

    /**
     * Update the dashboard with current metrics
     */
    updateDashboard() {
        if (this.triggerData.length === 0) {
            this.resetDashboard();
            return;
        }

        // Calculate metrics
        const durations = this.triggerData.map(t => t.duration);
        const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
        const longestTrigger = Math.max(...durations);
        const totalTriggers = this.triggerData.length;

        // Calculate regulation score (lower average duration = better regulation)
        // Score ranges from 0-100, where 100 is best (shorter durations)
        let regulationScore;
        if (avgDuration <= 30) regulationScore = 100; // Excellent
        else if (avgDuration <= 60) regulationScore = 85; // Very Good
        else if (avgDuration <= 120) regulationScore = 70; // Good
        else if (avgDuration <= 240) regulationScore = 55; // Fair
        else if (avgDuration <= 480) regulationScore = 40; // Poor
        else regulationScore = 25; // Very Poor

        // Update DOM
        document.getElementById('avgDuration').textContent = this.formatDuration(avgDuration);
        document.getElementById('longestTrigger').textContent = this.formatDuration(longestTrigger);
        document.getElementById('totalTriggers').textContent = totalTriggers;
        document.getElementById('regulationScore').textContent = regulationScore;

        // Update regulation indicator
        this.updateRegulationIndicator(regulationScore);
    }

    /**
     * Reset dashboard to default values
     */
    resetDashboard() {
        document.getElementById('avgDuration').textContent = '--';
        document.getElementById('longestTrigger').textContent = '--';
        document.getElementById('totalTriggers').textContent = '0';
        document.getElementById('regulationScore').textContent = '--';
        this.updateRegulationIndicator(0);
    }

    /**
     * Update the regulation level indicator
     */
    updateRegulationIndicator(score) {
        const fill = document.getElementById('regulationFill');
        const label = document.getElementById('regulationLabel');

        fill.style.setProperty('--fill-width', `${score}%`);
        fill.style.width = `${score}%`;

        if (score >= 80) label.textContent = 'Excellent Regulation';
        else if (score >= 60) label.textContent = 'Good Regulation';
        else if (score >= 40) label.textContent = 'Fair Regulation';
        else if (score >= 20) label.textContent = 'Poor Regulation';
        else label.textContent = 'Needs Improvement';
    }

    /**
     * Render the duration trends chart
     */
    renderChart() {
        const ctx = document.getElementById('durationChart').getContext('2d');
        const timeRange = document.getElementById('timeRange').value;

        // Filter data based on time range
        const filteredData = this.filterDataByTimeRange(timeRange);

        // Group by date and calculate average duration
        const dateGroups = {};
        filteredData.forEach(trigger => {
            const date = new Date(trigger.startDateTime).toLocaleDateString();
            if (!dateGroups[date]) dateGroups[date] = [];
            dateGroups[date].push(trigger.duration);
        });

        const labels = Object.keys(dateGroups).sort();
        const data = labels.map(date => {
            const durations = dateGroups[date];
            return durations.reduce((a, b) => a + b, 0) / durations.length;
        });

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
                    label: 'Average Trigger Duration (minutes)',
                    data: data,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
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
                            text: 'Duration (minutes)'
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
     * Render the trigger history
     */
    renderHistory(view = 'recent') {
        const historyList = document.getElementById('triggerHistory');
        let dataToShow = this.triggerData;

        if (view === 'recent') {
            dataToShow = this.triggerData.slice(-10).reverse();
        } else {
            dataToShow = this.triggerData.slice().reverse();
        }

        historyList.innerHTML = '';

        if (dataToShow.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No triggers logged yet.</p>';
            return;
        }

        dataToShow.forEach(trigger => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';

            const triggerTypeLabel = this.capitalizeFirst(trigger.triggerType);
            const startTime = new Date(trigger.startDateTime).toLocaleString();
            const intensityLabel = this.getIntensityLabel(trigger.intensityLevel);

            historyItem.innerHTML = `
                <div class="history-item-header">
                    <div class="history-item-title">${triggerTypeLabel} Trigger</div>
                    <div class="history-item-duration">${this.formatDuration(trigger.duration)}</div>
                </div>
                <div class="history-item-details">
                    <p><strong>Description:</strong> ${trigger.triggerDescription}</p>
                    <p><strong>Intensity:</strong> ${intensityLabel} (${trigger.intensityLevel}/10)</p>
                    ${trigger.copingStrategies ? `<p><strong>Coping:</strong> ${trigger.copingStrategies}</p>` : ''}
                </div>
                <div class="history-item-meta">
                    <span>Started: ${startTime}</span>
                    <span>ID: ${trigger.id}</span>
                </div>
            `;

            historyList.appendChild(historyItem);
        });
    }

    /**
     * Render emotional regulation insights
     */
    renderInsights() {
        if (this.triggerData.length === 0) return;

        // Duration patterns
        const durations = this.triggerData.map(t => t.duration);
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        const durationPatterns = document.getElementById('durationPatterns');

        let patternText = `Your average trigger duration is ${this.formatDuration(Math.round(avgDuration))}. `;

        if (avgDuration < 60) {
            patternText += 'You generally process emotions quickly, which is a sign of good emotional regulation.';
        } else if (avgDuration < 180) {
            patternText += 'Your triggers tend to last a moderate amount of time. Consider exploring additional coping strategies.';
        } else {
            patternText += 'Your triggers persist for extended periods. This may indicate areas where emotional regulation could be improved.';
        }

        durationPatterns.innerHTML = `<p>${patternText}</p>`;

        // Common triggers
        const triggerCounts = {};
        this.triggerData.forEach(trigger => {
            triggerCounts[trigger.triggerType] = (triggerCounts[trigger.triggerType] || 0) + 1;
        });

        const mostCommon = Object.entries(triggerCounts)
            .sort(([,a], [,b]) => b - a)[0];

        const commonTriggers = document.getElementById('commonTriggers');
        if (mostCommon) {
            commonTriggers.innerHTML = `<p>Your most common emotional trigger is <strong>${this.capitalizeFirst(mostCommon[0])}</strong> (${mostCommon[1]} occurrences). Understanding what triggers this emotion can help you prepare coping strategies.</p>`;
        }

        // Regulation progress (compare recent vs older data)
        const midPoint = Math.floor(this.triggerData.length / 2);
        const recentData = this.triggerData.slice(midPoint);
        const olderData = this.triggerData.slice(0, midPoint);

        const recentAvg = recentData.length > 0 ?
            recentData.reduce((sum, t) => sum + t.duration, 0) / recentData.length : 0;
        const olderAvg = olderData.length > 0 ?
            olderData.reduce((sum, t) => sum + t.duration, 0) / olderData.length : 0;

        const regulationProgress = document.getElementById('regulationProgress');
        if (recentData.length > 0 && olderData.length > 0) {
            const improvement = olderAvg - recentAvg;
            if (improvement > 10) {
                regulationProgress.innerHTML = `<p>Great progress! Your average trigger duration has decreased by ${this.formatDuration(Math.round(improvement))} compared to earlier entries.</p>`;
            } else if (improvement < -10) {
                regulationProgress.innerHTML = `<p>Your trigger durations have increased by ${this.formatDuration(Math.round(Math.abs(improvement)))}. Consider reviewing your coping strategies.</p>`;
            } else {
                regulationProgress.innerHTML = `<p>Your emotional regulation patterns are relatively stable. Continue monitoring to identify trends.</p>`;
            }
        } else {
            regulationProgress.innerHTML = `<p>Continue logging triggers to track your emotional regulation progress over time.</p>`;
        }

        // Render tips
        this.renderTips();
    }

    /**
     * Render personalized tips based on data
     */
    renderTips() {
        const tipsList = document.getElementById('tips');
        tipsList.innerHTML = '';

        if (this.triggerData.length < 3) {
            this.addTip('Keep logging your emotional triggers to get personalized insights and track your progress.', '📝');
            return;
        }

        const avgDuration = this.triggerData.reduce((sum, t) => sum + t.duration, 0) / this.triggerData.length;

        if (avgDuration > 120) {
            this.addTip('Consider practicing deep breathing exercises when you notice emotional triggers starting.', '🫁');
            this.addTip('Try the 5-4-3-2-1 grounding technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.', '🌱');
        }

        if (avgDuration < 30) {
            this.addTip('You\'re doing well at processing emotions quickly! Consider sharing your coping strategies with others.', '⭐');
        }

        // Check for patterns in trigger types
        const triggerCounts = {};
        this.triggerData.forEach(trigger => {
            triggerCounts[trigger.triggerType] = (triggerCounts[trigger.triggerType] || 0) + 1;
        });

        const mostCommon = Object.entries(triggerCounts)
            .sort(([,a], [,b]) => b - a)[0];

        if (mostCommon && mostCommon[1] >= 3) {
            this.addTip(`Since ${this.capitalizeFirst(mostCommon[0])} is a common trigger for you, consider developing specific coping strategies for this emotion.`, '🎯');
        }

        this.addTip('Remember: It\'s normal for emotions to fluctuate. The goal is awareness and healthy processing, not elimination.', '💝');
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
     * Render regulation benchmarks
     */
    renderBenchmarks() {
        const benchmarksGrid = document.getElementById('benchmarks');
        benchmarksGrid.innerHTML = '';

        const benchmarks = [
            {
                title: 'Quick Processor',
                value: '< 30 min',
                description: 'Excellent emotional regulation. You process triggers rapidly and return to baseline quickly.'
            },
            {
                title: 'Balanced Responder',
                value: '30-60 min',
                description: 'Good emotional regulation. You experience triggers but recover within a reasonable timeframe.'
            },
            {
                title: 'Moderate Duration',
                value: '1-2 hours',
                description: 'Fair emotional regulation. Triggers affect you for extended periods but eventually subside.'
            },
            {
                title: 'Extended Impact',
                value: '2-4 hours',
                description: 'Developing regulation. Triggers have significant duration - consider additional coping strategies.'
            },
            {
                title: 'Prolonged Effect',
                value: '4-8 hours',
                description: 'Regulation needs attention. Triggers persist for very long periods - professional support may help.'
            },
            {
                title: 'Chronic Impact',
                value: '> 8 hours',
                description: 'Significant regulation challenges. Triggers affect you for entire days - seek comprehensive support.'
            }
        ];

        benchmarks.forEach(benchmark => {
            const benchmarkItem = document.createElement('div');
            benchmarkItem.className = 'benchmark-item';
            benchmarkItem.innerHTML = `
                <h3>${benchmark.title}</h3>
                <div class="benchmark-value">${benchmark.value}</div>
                <div class="benchmark-description">${benchmark.description}</div>
            `;
            benchmarksGrid.appendChild(benchmarkItem);
        });
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
        if (range === 'all') return this.triggerData;

        const days = parseInt(range);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return this.triggerData.filter(trigger => {
            const triggerDate = new Date(trigger.startDateTime);
            return triggerDate >= cutoffDate;
        });
    }

    /**
     * Format duration in minutes to readable string
     */
    formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes}m`;
        } else if (minutes < 1440) { // 24 hours
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        } else {
            const days = Math.floor(minutes / 1440);
            const hours = Math.floor((minutes % 1440) / 60);
            return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
        }
    }

    /**
     * Get intensity label from level
     */
    getIntensityLabel(level) {
        const labels = {
            1: 'Very Mild', 2: 'Mild', 3: 'Low', 4: 'Moderate', 5: 'Moderate',
            6: 'Strong', 7: 'High', 8: 'Intense', 9: 'Overwhelming', 10: 'Extreme'
        };
        return labels[level] || 'Moderate';
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
        const data = localStorage.getItem('emotionalTriggerData');
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save data to localStorage
     */
    saveData() {
        localStorage.setItem('emotionalTriggerData', JSON.stringify(this.triggerData));
    }
}

// Initialize the tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EmotionalTriggerTracker();
});