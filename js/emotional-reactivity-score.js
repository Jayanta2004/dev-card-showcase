// Emotional Reactivity Score JavaScript
// This module tracks emotional reactivity intensity and patterns to support self-regulation

class EmotionalReactivityTracker {
    constructor() {
        // Initialize reactivity data from localStorage
        this.reactivityData = this.loadData();
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
        // Form submission for logging reactions
        document.getElementById('reactivityForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logReaction();
        });

        // Intensity level slider updates display in real-time
        document.getElementById('reactionIntensity').addEventListener('input', () => {
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
        const intensityLevel = document.getElementById('reactionIntensity').value;
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
     * Log a new emotional reaction
     * Calculates reactivity metrics and validates input
     */
    logReaction() {
        // Collect form data
        const formData = {
            id: Date.now(),
            dateTime: document.getElementById('reactionDate').value,
            triggerType: document.getElementById('triggerType').value,
            reactionIntensity: parseInt(document.getElementById('reactionIntensity').value),
            reactionDuration: parseInt(document.getElementById('reactionDuration').value),
            emotionalState: document.getElementById('emotionalState').value,
            triggerDescription: document.getElementById('triggerDescription').value,
            copingResponse: document.getElementById('copingResponse').value
        };

        // Validate duration
        if (formData.reactionDuration <= 0) {
            alert('Please enter a valid reaction duration.');
            return;
        }

        // Add timestamp for sorting
        formData.timestamp = new Date(formData.dateTime).getTime();

        // Save to data array
        this.reactivityData.push(formData);
        this.saveData();

        // Reset form
        document.getElementById('reactivityForm').reset();
        this.updateIntensityDisplay();

        // Update UI
        this.updateDashboard();
        this.renderChart();
        this.renderHistory();
        this.renderInsights();
        this.renderBenchmarks();

        // Show success message
        this.showNotification('Reaction logged successfully!', 'success');
    }

    /**
     * Update the dashboard with current metrics
     */
    updateDashboard() {
        if (this.reactivityData.length === 0) {
            this.resetDashboard();
            return;
        }

        // Calculate metrics
        const intensities = this.reactivityData.map(r => r.reactionIntensity);
        const durations = this.reactivityData.map(r => r.reactionDuration);

        const avgIntensity = Math.round(intensities.reduce((a, b) => a + b, 0) / intensities.length);
        const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
        const totalReactions = this.reactivityData.length;

        // Calculate reactivity score (composite of intensity and duration)
        // Lower scores indicate better emotional regulation
        const reactivityScore = Math.round((avgIntensity * 0.6) + (avgDuration / 10 * 0.4));

        // Update DOM
        document.getElementById('avgIntensity').textContent = `${avgIntensity}/10`;
        document.getElementById('avgDuration').textContent = this.formatDuration(avgDuration);
        document.getElementById('totalReactions').textContent = totalReactions;
        document.getElementById('reactivityScore').textContent = reactivityScore;

        // Update reactivity indicator
        this.updateReactivityIndicator(reactivityScore);
    }

    /**
     * Reset dashboard to default values
     */
    resetDashboard() {
        document.getElementById('avgIntensity').textContent = '--';
        document.getElementById('avgDuration').textContent = '--';
        document.getElementById('totalReactions').textContent = '0';
        document.getElementById('reactivityScore').textContent = '--';
        this.updateReactivityIndicator(0);
    }

    /**
     * Update the reactivity level indicator
     */
    updateReactivityIndicator(score) {
        const fill = document.getElementById('reactivityFill');
        const label = document.getElementById('reactivityLabel');

        // Score ranges from 0-100, higher = more reactive
        const percentage = Math.min(score * 10, 100);
        fill.style.setProperty('--fill-width', `${percentage}%`);
        fill.style.width = `${percentage}%`;

        if (score <= 20) label.textContent = 'Low Reactivity';
        else if (score <= 40) label.textContent = 'Moderate Reactivity';
        else if (score <= 60) label.textContent = 'High Reactivity';
        else if (score <= 80) label.textContent = 'Very High Reactivity';
        else label.textContent = 'Extreme Reactivity';
    }

    /**
     * Render the reactivity stability trends chart
     */
    renderChart() {
        const ctx = document.getElementById('reactivityChart').getContext('2d');
        const timeRange = document.getElementById('timeRange').value;

        // Filter data based on time range
        const filteredData = this.filterDataByTimeRange(timeRange);

        // Group by date and calculate average intensity
        const dateGroups = {};
        filteredData.forEach(reaction => {
            const date = new Date(reaction.dateTime).toLocaleDateString();
            if (!dateGroups[date]) dateGroups[date] = [];
            dateGroups[date].push(reaction.reactionIntensity);
        });

        const labels = Object.keys(dateGroups).sort();
        const data = labels.map(date => {
            const intensities = dateGroups[date];
            return intensities.reduce((a, b) => a + b, 0) / intensities.length;
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
                    label: 'Average Reaction Intensity',
                    data: data,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
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
                        max: 10,
                        title: {
                            display: true,
                            text: 'Intensity (1-10)'
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
     * Render the reaction history
     */
    renderHistory(view = 'recent') {
        const historyList = document.getElementById('reactionHistory');
        let dataToShow = this.reactivityData;

        if (view === 'recent') {
            dataToShow = this.reactivityData.slice(-10).reverse();
        } else {
            dataToShow = this.reactivityData.slice().reverse();
        }

        historyList.innerHTML = '';

        if (dataToShow.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No reactions logged yet.</p>';
            return;
        }

        dataToShow.forEach(reaction => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';

            const triggerTypeLabel = this.capitalizeFirst(reaction.triggerType.replace('_', ' '));
            const emotionalStateLabel = this.capitalizeFirst(reaction.emotionalState);
            const dateTime = new Date(reaction.dateTime).toLocaleString();

            historyItem.innerHTML = `
                <div class="history-item-header">
                    <div class="history-item-title">${triggerTypeLabel} → ${emotionalStateLabel}</div>
                    <div class="history-item-intensity">${reaction.reactionIntensity}/10</div>
                </div>
                <div class="history-item-details">
                    <p><strong>Description:</strong> ${reaction.triggerDescription}</p>
                    <p><strong>Duration:</strong> ${this.formatDuration(reaction.reactionDuration)}</p>
                    ${reaction.copingResponse ? `<p><strong>Coping:</strong> ${reaction.copingResponse}</p>` : ''}
                </div>
                <div class="history-item-meta">
                    <span>${dateTime}</span>
                    <span>ID: ${reaction.id}</span>
                </div>
            `;

            historyList.appendChild(historyItem);
        });
    }

    /**
     * Render reactivity insights
     */
    renderInsights() {
        if (this.reactivityData.length === 0) return;

        // Pattern analysis
        const intensities = this.reactivityData.map(r => r.reactionIntensity);
        const avgIntensity = intensities.reduce((a, b) => a + b, 0) / intensities.length;
        const patternAnalysis = document.getElementById('patternAnalysis');

        let patternText = `Your average reaction intensity is ${avgIntensity.toFixed(1)}/10. `;

        if (avgIntensity < 4) {
            patternText += 'You generally respond with low to moderate intensity, indicating good emotional regulation.';
        } else if (avgIntensity < 7) {
            patternText += 'Your reactions are moderately intense. Consider exploring techniques to reduce reaction intensity.';
        } else {
            patternText += 'Your reactions tend to be quite intense. This may benefit from focused emotional regulation practices.';
        }

        patternAnalysis.innerHTML = `<p>${patternText}</p>`;

        // Trigger sensitivity
        const triggerCounts = {};
        this.reactivityData.forEach(reaction => {
            triggerCounts[reaction.triggerType] = (triggerCounts[reaction.triggerType] || 0) + 1;
        });

        const mostCommon = Object.entries(triggerCounts)
            .sort(([,a], [,b]) => b - a)[0];

        const triggerSensitivity = document.getElementById('triggerSensitivity');
        if (mostCommon) {
            const triggerLabel = this.capitalizeFirst(mostCommon[0].replace('_', ' '));
            triggerSensitivity.innerHTML = `<p>You are most sensitive to <strong>${triggerLabel}</strong> triggers (${mostCommon[1]} occurrences). Being aware of your trigger patterns can help you prepare coping strategies in advance.</p>`;
        }

        // Regulation progress (compare recent vs older data)
        const midPoint = Math.floor(this.reactivityData.length / 2);
        const recentData = this.reactivityData.slice(midPoint);
        const olderData = this.reactivityData.slice(0, midPoint);

        const recentAvg = recentData.length > 0 ?
            recentData.reduce((sum, r) => sum + r.reactionIntensity, 0) / recentData.length : 0;
        const olderAvg = olderData.length > 0 ?
            olderData.reduce((sum, r) => sum + r.reactionIntensity, 0) / olderData.length : 0;

        const regulationProgress = document.getElementById('regulationProgress');
        if (recentData.length > 0 && olderData.length > 0) {
            const improvement = olderAvg - recentAvg;
            if (improvement > 0.5) {
                regulationProgress.innerHTML = `<p>Great progress! Your average reaction intensity has decreased by ${(improvement).toFixed(1)} points compared to earlier entries.</p>`;
            } else if (improvement < -0.5) {
                regulationProgress.innerHTML = `<p>Your reaction intensities have increased by ${Math.abs(improvement).toFixed(1)} points. Consider reviewing your coping strategies.</p>`;
            } else {
                regulationProgress.innerHTML = `<p>Your emotional reactivity patterns are relatively stable. Continue monitoring to identify trends.</p>`;
            }
        } else {
            regulationProgress.innerHTML = `<p>Continue logging reactions to track your emotional regulation progress over time.</p>`;
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

        if (this.reactivityData.length < 3) {
            this.addTip('Keep logging your emotional reactions to get personalized insights and track your regulation progress.', '📝');
            return;
        }

        const avgIntensity = this.reactivityData.reduce((sum, r) => sum + r.reactionIntensity, 0) / this.reactivityData.length;
        const avgDuration = this.reactivityData.reduce((sum, r) => sum + r.reactionDuration, 0) / this.reactivityData.length;

        if (avgIntensity > 6) {
            this.addTip('Try the STOP technique: Stop, Take a breath, Observe your reaction, Proceed mindfully.', '🛑');
            this.addTip('Practice cognitive reframing: When a trigger occurs, pause and consider alternative interpretations.', '🔄');
        }

        if (avgDuration > 60) {
            this.addTip('Consider grounding techniques like the 5-4-3-2-1 method to help reactions pass more quickly.', '🌱');
        }

        // Check for patterns in emotional states
        const emotionCounts = {};
        this.reactivityData.forEach(reaction => {
            emotionCounts[reaction.emotionalState] = (emotionCounts[reaction.emotionalState] || 0) + 1;
        });

        const dominantEmotion = Object.entries(emotionCounts)
            .sort(([,a], [,b]) => b - a)[0];

        if (dominantEmotion && dominantEmotion[1] >= 3) {
            const emotionLabel = this.capitalizeFirst(dominantEmotion[0]);
            this.addTip(`Since ${emotionLabel} is a common reaction for you, consider learning specific techniques for managing this emotion.`, '🎯');
        }

        this.addTip('Remember: Emotional reactivity is normal. The goal is awareness and choosing how you respond.', '💝');
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
     * Render reactivity benchmarks
     */
    renderBenchmarks() {
        const benchmarksGrid = document.getElementById('benchmarks');
        benchmarksGrid.innerHTML = '';

        const benchmarks = [
            {
                title: 'Calm Responder',
                value: '1-3 Intensity',
                description: 'Low-intensity reactions indicate excellent emotional regulation and resilience.'
            },
            {
                title: 'Balanced Reactor',
                value: '4-6 Intensity',
                description: 'Moderate reactions are normal and healthy. Focus on response duration.'
            },
            {
                title: 'Intense Responder',
                value: '7-8 Intensity',
                description: 'High-intensity reactions may benefit from additional coping strategies.'
            },
            {
                title: 'Overwhelmed Reactor',
                value: '9-10 Intensity',
                description: 'Extreme reactions suggest need for professional support or intensive practice.'
            },
            {
                title: 'Quick Recovery',
                value: '< 30 min',
                description: 'Fast reaction recovery indicates good emotional processing ability.'
            },
            {
                title: 'Extended Processing',
                value: '30-120 min',
                description: 'Moderate recovery time is common. Consider techniques to shorten duration.'
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
        if (range === 'all') return this.reactivityData;

        const days = parseInt(range);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return this.reactivityData.filter(reaction => {
            const reactionDate = new Date(reaction.dateTime);
            return reactionDate >= cutoffDate;
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
        const data = localStorage.getItem('emotionalReactivityData');
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save data to localStorage
     */
    saveData() {
        localStorage.setItem('emotionalReactivityData', JSON.stringify(this.reactivityData));
    }
}

// Initialize the tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EmotionalReactivityTracker();
});