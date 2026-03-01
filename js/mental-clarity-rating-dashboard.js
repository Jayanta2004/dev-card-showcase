// Mental Clarity Rating Dashboard JavaScript
// This module tracks subjective mental clarity levels throughout the day

class MentalClarityDashboard {
    constructor() {
        // Initialize clarity data from localStorage
        this.clarityData = this.loadData();
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
        this.updateSliders();
    }

    /**
     * Set up all event listeners for user interactions
     */
    setupEventListeners() {
        // Form submission for logging clarity ratings
        document.getElementById('clarityForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logClarityRating();
        });

        // Slider updates for real-time display
        ['morningRating', 'afternoonRating', 'eveningRating'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.updateSliders();
            });
        });

        // Chart controls
        document.getElementById('curveTimeRange').addEventListener('change', () => {
            this.renderChart();
        });

        document.getElementById('refreshCurve').addEventListener('click', () => {
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
     * Update all slider displays based on current values
     */
    updateSliders() {
        this.updateSliderDisplay('morningRating', 'morningValue', 'morningText');
        this.updateSliderDisplay('afternoonRating', 'afternoonValue', 'afternoonText');
        this.updateSliderDisplay('eveningRating', 'eveningValue', 'eveningText');
    }

    /**
     * Update a single slider display
     */
    updateSliderDisplay(sliderId, valueId, textId) {
        const value = document.getElementById(sliderId).value;
        document.getElementById(valueId).textContent = value;
        document.getElementById(textId).textContent = this.getClarityLabel(value);
    }

    /**
     * Get clarity level label based on rating
     */
    getClarityLabel(rating) {
        const labels = {
            1: 'Very Foggy', 2: 'Foggy', 3: 'Unclear', 4: 'Unclear',
            5: 'Moderate', 6: 'Moderate', 7: 'Clear', 8: 'Clear',
            9: 'Very Clear', 10: 'Crystal Clear'
        };
        return labels[rating] || 'Moderate';
    }

    /**
     * Log a new clarity rating for the day
     */
    logClarityRating() {
        // Collect form data
        const factors = Array.from(document.querySelectorAll('input[name="factors"]:checked'))
            .map(checkbox => checkbox.value);

        const formData = {
            id: Date.now(),
            ratingDate: document.getElementById('ratingDate').value,
            morningRating: parseInt(document.getElementById('morningRating').value),
            afternoonRating: parseInt(document.getElementById('afternoonRating').value),
            eveningRating: parseInt(document.getElementById('eveningRating').value),
            factors: factors,
            notes: document.getElementById('notes').value,
            timestamp: new Date().toISOString()
        };

        // Check if rating for this date already exists
        const existingIndex = this.clarityData.findIndex(item =>
            item.ratingDate === formData.ratingDate
        );

        if (existingIndex >= 0) {
            // Update existing entry
            this.clarityData[existingIndex] = formData;
        } else {
            // Add new entry
            this.clarityData.push(formData);
        }

        this.saveData();

        // Reset form
        document.getElementById('clarityForm').reset();
        // Uncheck all factor checkboxes
        document.querySelectorAll('input[name="factors"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateSliders();

        // Update UI
        this.updateDashboard();
        this.renderChart();
        this.renderHistory();
        this.renderInsights();
        this.renderBenchmarks();

        // Show success message
        this.showNotification('Clarity ratings saved successfully!', 'success');
    }

    /**
     * Load clarity data from localStorage
     */
    loadData() {
        const data = localStorage.getItem('mentalClarityData');
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save clarity data to localStorage
     */
    saveData() {
        localStorage.setItem('mentalClarityData', JSON.stringify(this.clarityData));
    }

    /**
     * Update the dashboard with current metrics
     */
    updateDashboard() {
        const data = this.clarityData;

        if (data.length === 0) {
            // Reset all metrics
            document.getElementById('avgClarity').textContent = '--';
            document.getElementById('peakTime').textContent = '--';
            document.getElementById('totalDays').textContent = '0';
            document.getElementById('consistencyScore').textContent = '--';
            document.getElementById('clarityFill').style.width = '0%';
            document.getElementById('clarityLabel').textContent = 'No data available';
            return;
        }

        // Calculate metrics
        const avgClarity = data.reduce((sum, item) =>
            sum + (item.morningRating + item.afternoonRating + item.eveningRating) / 3, 0) / data.length;

        // Find peak clarity time
        const timeAverages = {
            morning: data.reduce((sum, item) => sum + item.morningRating, 0) / data.length,
            afternoon: data.reduce((sum, item) => sum + item.afternoonRating, 0) / data.length,
            evening: data.reduce((sum, item) => sum + item.eveningRating, 0) / data.length
        };

        const peakTime = Object.keys(timeAverages).reduce((a, b) =>
            timeAverages[a] > timeAverages[b] ? a : b);

        const totalDays = data.length;

        // Calculate consistency score (lower variance = higher consistency)
        const dailyAvgs = data.map(item => (item.morningRating + item.afternoonRating + item.eveningRating) / 3);
        const mean = dailyAvgs.reduce((sum, val) => sum + val, 0) / dailyAvgs.length;
        const variance = dailyAvgs.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dailyAvgs.length;
        const consistencyScore = Math.max(0, Math.min(100, 100 - (variance * 10)));

        // Update metrics display
        document.getElementById('avgClarity').textContent = avgClarity.toFixed(1);
        document.getElementById('peakTime').textContent = this.capitalizeFirst(peakTime);
        document.getElementById('totalDays').textContent = totalDays;
        document.getElementById('consistencyScore').textContent = Math.round(consistencyScore);

        // Update clarity indicator
        document.getElementById('clarityFill').style.width = `${avgClarity * 10}%`;
        document.getElementById('clarityLabel').textContent = this.getOverallClarityLabel(avgClarity);
    }

    /**
     * Capitalize first letter of string
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Get overall clarity label based on average rating
     */
    getOverallClarityLabel(avgRating) {
        if (avgRating >= 8) return 'Excellent Mental Clarity';
        if (avgRating >= 6) return 'Good Mental Clarity';
        if (avgRating >= 4) return 'Moderate Mental Clarity';
        if (avgRating >= 2) return 'Poor Mental Clarity';
        return 'Very Poor Mental Clarity';
    }

    /**
     * Render the daily clarity curve chart
     */
    renderChart() {
        const ctx = document.getElementById('clarityCurveChart').getContext('2d');
        const timeRange = document.getElementById('curveTimeRange').value;

        // Filter data based on time range
        const filteredData = this.filterDataByTimeRange(timeRange);

        if (filteredData.length === 0) {
            if (this.chart) {
                this.chart.destroy();
            }
            return;
        }

        // Sort data by date
        filteredData.sort((a, b) => new Date(a.ratingDate) - new Date(b.ratingDate));

        // Prepare chart data
        const chartData = {
            labels: filteredData.map(item => {
                const date = new Date(item.ratingDate);
                return date.toLocaleDateString();
            }),
            datasets: [{
                label: 'Morning Clarity',
                data: filteredData.map(item => item.morningRating),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 4
            }, {
                label: 'Afternoon Clarity',
                data: filteredData.map(item => item.afternoonRating),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 4
            }, {
                label: 'Evening Clarity',
                data: filteredData.map(item => item.eveningRating),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 4
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
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${context.parsed.y}/10`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Clarity Rating (1-10)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
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
            return this.clarityData;
        }

        const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

        return this.clarityData.filter(item => {
            const ratingDate = new Date(item.ratingDate);
            return ratingDate >= cutoffDate;
        });
    }

    /**
     * Render the clarity history
     */
    renderHistory(view = 'recent') {
        const historyContainer = document.getElementById('clarityHistory');
        let data = this.clarityData;

        // Sort by date (most recent first)
        data.sort((a, b) => new Date(b.ratingDate) - new Date(a.ratingDate));

        // Filter for recent view (last 10 entries)
        if (view === 'recent') {
            data = data.slice(0, 10);
        }

        // Clear existing content
        historyContainer.innerHTML = '';

        if (data.length === 0) {
            historyContainer.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No clarity ratings logged yet.</p>';
            return;
        }

        // Render history items
        data.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';

            const ratingDate = new Date(item.ratingDate).toLocaleDateString();

            historyItem.innerHTML = `
                <div class="history-item-header">
                    <div class="history-item-title">Daily Clarity Ratings</div>
                    <div class="history-item-date">${ratingDate}</div>
                </div>
                <div class="history-item-ratings">
                    <div class="rating-item">
                        <div class="rating-time">Morning</div>
                        <div class="rating-value">${item.morningRating}</div>
                        <div class="rating-text">${this.getClarityLabel(item.morningRating)}</div>
                    </div>
                    <div class="rating-item">
                        <div class="rating-time">Afternoon</div>
                        <div class="rating-value">${item.afternoonRating}</div>
                        <div class="rating-text">${this.getClarityLabel(item.afternoonRating)}</div>
                    </div>
                    <div class="rating-item">
                        <div class="rating-time">Evening</div>
                        <div class="rating-value">${item.eveningRating}</div>
                        <div class="rating-text">${this.getClarityLabel(item.eveningRating)}</div>
                    </div>
                </div>
                ${item.factors.length > 0 ? `<div class="history-item-factors">
                    ${item.factors.map(factor => `<span class="factor-tag">${this.getFactorLabel(factor)}</span>`).join('')}
                </div>` : '<div class="history-item-factors">No factors noted</div>'}
                ${item.notes ? `<div class="history-item-notes">${item.notes}</div>` : ''}
            `;

            historyContainer.appendChild(historyItem);
        });
    }

    /**
     * Get human-readable factor label
     */
    getFactorLabel(factor) {
        const labels = {
            'sleep': 'Sleep Quality',
            'stress': 'Stress Level',
            'exercise': 'Exercise',
            'nutrition': 'Nutrition',
            'caffeine': 'Caffeine',
            'medication': 'Medication',
            'environment': 'Environment',
            'workload': 'Workload'
        };
        return labels[factor] || factor;
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
     * Render mental clarity insights
     */
    renderInsights() {
        this.renderDailyPatterns();
        this.renderFactorCorrelations();
        this.renderImprovementAreas();
        this.renderTips();
    }

    /**
     * Render daily patterns insight
     */
    renderDailyPatterns() {
        const container = document.getElementById('dailyPatterns');
        const data = this.clarityData;

        if (data.length < 3) {
            container.innerHTML = '<p>Log more daily ratings to see patterns.</p>';
            return;
        }

        // Calculate average ratings by time of day
        const timeAverages = {
            morning: data.reduce((sum, item) => sum + item.morningRating, 0) / data.length,
            afternoon: data.reduce((sum, item) => sum + item.afternoonRating, 0) / data.length,
            evening: data.reduce((sum, item) => sum + item.eveningRating, 0) / data.length
        };

        const peakTime = Object.keys(timeAverages).reduce((a, b) =>
            timeAverages[a] > timeAverages[b] ? a : b);

        const lowestTime = Object.keys(timeAverages).reduce((a, b) =>
            timeAverages[a] < timeAverages[b] ? a : b);

        container.innerHTML = `<p>Your mental clarity peaks in the ${peakTime} (${timeAverages[peakTime].toFixed(1)}/10 avg) and is lowest in the ${lowestTime} (${timeAverages[lowestTime].toFixed(1)}/10 avg).</p>`;
    }

    /**
     * Render factor correlations insight
     */
    renderFactorCorrelations() {
        const container = document.getElementById('factorCorrelations');
        const data = this.clarityData;

        if (data.length < 5) {
            container.innerHTML = '<p>More data needed to analyze factor correlations.</p>';
            return;
        }

        // Count factor frequencies
        const factorCounts = {};
        data.forEach(item => {
            item.factors.forEach(factor => {
                factorCounts[factor] = (factorCounts[factor] || 0) + 1;
            });
        });

        // Find most common factor
        const mostCommonFactor = Object.keys(factorCounts).reduce((a, b) =>
            factorCounts[a] > factorCounts[b] ? a : b, '');

        if (mostCommonFactor) {
            const label = this.getFactorLabel(mostCommonFactor);
            container.innerHTML = `<p>${label} is your most frequently noted influencing factor (${factorCounts[mostCommonFactor]} times).</p>`;
        } else {
            container.innerHTML = '<p>No factors have been consistently noted yet.</p>';
        }
    }

    /**
     * Render improvement areas insight
     */
    renderImprovementAreas() {
        const container = document.getElementById('improvementAreas');
        const data = this.clarityData;

        if (data.length < 5) {
            container.innerHTML = '<p>More data needed for improvement suggestions.</p>';
            return;
        }

        const avgClarity = data.reduce((sum, item) =>
            sum + (item.morningRating + item.afternoonRating + item.eveningRating) / 3, 0) / data.length;

        let suggestion = '';

        if (avgClarity < 5) {
            suggestion = 'Consider lifestyle changes like improving sleep quality, reducing stress, or incorporating regular exercise.';
        } else if (avgClarity < 7) {
            suggestion = 'Try maintaining consistent daily routines and monitoring your caffeine intake.';
        } else {
            suggestion = 'Your mental clarity is generally good! Continue your current habits and monitor for any changes.';
        }

        container.innerHTML = `<p>${suggestion}</p>`;
    }

    /**
     * Render tips list
     */
    renderTips() {
        const container = document.getElementById('tips');
        const tips = [
            {
                title: 'Consistent Sleep Schedule',
                content: 'Maintain regular sleep and wake times to stabilize circadian rhythms and mental clarity.'
            },
            {
                title: 'Hydration Tracking',
                content: 'Dehydration can significantly impact cognitive function. Track your water intake.'
            },
            {
                title: 'Mindfulness Breaks',
                content: 'Short mindfulness or meditation sessions can help reset mental clarity throughout the day.'
            },
            {
                title: 'Nutrition Timing',
                content: 'Time your meals and snacks to maintain steady blood sugar levels for consistent mental performance.'
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
     * Render mental clarity benchmarks
     */
    renderBenchmarks() {
        const container = document.getElementById('benchmarks');
        const data = this.clarityData;

        if (data.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">Complete more daily ratings to see benchmarks.</p>';
            return;
        }

        const avgClarity = data.reduce((sum, item) =>
            sum + (item.morningRating + item.afternoonRating + item.eveningRating) / 3, 0) / data.length;

        const consistencyScore = this.calculateConsistencyScore();

        const benchmarks = [
            {
                title: 'Mental Clarity Level',
                description: 'Your average daily mental clarity rating',
                range: this.getBenchmarkRange(avgClarity, 'clarity'),
                icon: 'brain',
                level: this.getBenchmarkLevel(avgClarity, 'clarity')
            },
            {
                title: 'Daily Consistency',
                description: 'How consistent your mental clarity is from day to day',
                range: this.getBenchmarkRange(consistencyScore, 'consistency'),
                icon: 'trending-up',
                level: this.getBenchmarkLevel(consistencyScore, 'consistency')
            },
            {
                title: 'Tracking Habit',
                description: 'How regularly you monitor your mental clarity',
                range: this.getBenchmarkRange(data.length, 'tracking'),
                icon: 'calendar',
                level: this.getBenchmarkLevel(data.length, 'tracking')
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
     * Calculate consistency score
     */
    calculateConsistencyScore() {
        if (this.clarityData.length < 2) return 0;

        const dailyAvgs = this.clarityData.map(item =>
            (item.morningRating + item.afternoonRating + item.eveningRating) / 3);
        const mean = dailyAvgs.reduce((sum, val) => sum + val, 0) / dailyAvgs.length;
        const variance = dailyAvgs.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dailyAvgs.length;

        return Math.max(0, Math.min(100, 100 - (variance * 10)));
    }

    /**
     * Get benchmark range text
     */
    getBenchmarkRange(value, type) {
        switch (type) {
            case 'clarity':
                if (value >= 8) return 'Excellent (8-10)';
                if (value >= 6) return 'Good (6-8)';
                if (value >= 4) return 'Fair (4-6)';
                return 'Needs Improvement (< 4)';
            case 'consistency':
                if (value >= 80) return 'Very Consistent (> 80)';
                if (value >= 60) return 'Consistent (60-80)';
                if (value >= 40) return 'Moderate (40-60)';
                return 'Inconsistent (< 40)';
            case 'tracking':
                if (value >= 30) return 'Excellent (> 30 days)';
                if (value >= 15) return 'Good (15-30 days)';
                if (value >= 7) return 'Fair (7-15 days)';
                return 'Building Habit (< 7 days)';
            default:
                return 'Unknown';
        }
    }

    /**
     * Get benchmark level class
     */
    getBenchmarkLevel(value, type) {
        switch (type) {
            case 'clarity':
                return value >= 7 ? 'excellent' : value >= 5 ? 'good' : 'needs-improvement';
            case 'consistency':
                return value >= 70 ? 'excellent' : value >= 50 ? 'good' : 'needs-improvement';
            case 'tracking':
                return value >= 20 ? 'excellent' : value >= 10 ? 'good' : 'needs-improvement';
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
    new MentalClarityDashboard();
});