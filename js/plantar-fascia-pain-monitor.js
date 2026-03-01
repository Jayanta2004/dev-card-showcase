// Plantar Fascia Pain Monitor JavaScript
// This module tracks plantar fascia pain patterns to identify triggers and improve foot health

class PlantarFasciaPainMonitor {
    constructor() {
        // Initialize pain data from localStorage
        this.painData = this.loadData();
        // Chart instances for Chart.js
        this.painChart = null;
        this.stepsCorrelationChart = null;
        this.footwearCorrelationChart = null;
        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application by setting up event listeners and rendering all components
     */
    init() {
        this.setupEventListeners();
        this.updateDashboard();
        this.renderCharts();
        this.renderHistory();
        this.renderInsights();
        this.renderBenchmarks();
        this.updatePainDisplays();
    }

    /**
     * Set up all event listeners for user interactions
     */
    setupEventListeners() {
        // Form submission for logging pain
        document.getElementById('painForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logPainEntry();
        });

        // Pain level sliders update display in real-time
        document.getElementById('heelPain').addEventListener('input', () => {
            this.updatePainDisplays();
        });

        document.getElementById('archPain').addEventListener('input', () => {
            this.updatePainDisplays();
        });

        // Chart time range controls
        document.getElementById('timeRange').addEventListener('change', () => {
            this.renderCharts();
        });

        document.getElementById('refreshChart').addEventListener('click', () => {
            this.renderCharts();
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
     * Update the pain level displays based on slider values
     * Maps numerical values to descriptive labels
     */
    updatePainDisplays() {
        // Update heel pain display
        const heelPain = document.getElementById('heelPain').value;
        const heelValue = document.getElementById('heelPainValue');
        const heelText = document.getElementById('heelPainText');

        heelValue.textContent = heelPain;
        heelText.textContent = this.getPainLabel(heelPain);

        // Update arch pain display
        const archPain = document.getElementById('archPain').value;
        const archValue = document.getElementById('archPainValue');
        const archText = document.getElementById('archPainText');

        archValue.textContent = archPain;
        archText.textContent = this.getPainLabel(archPain);
    }

    /**
     * Get descriptive label for pain level
     */
    getPainLabel(level) {
        const labels = {
            0: 'No pain',
            1: 'Minimal',
            2: 'Mild',
            3: 'Moderate',
            4: 'Moderate',
            5: 'Severe',
            6: 'Severe',
            7: 'Intense',
            8: 'Extreme',
            9: 'Unbearable',
            10: 'Worst possible'
        };
        return labels[level] || 'Moderate';
    }

    /**
     * Log a new pain entry from the form data
     */
    logPainEntry() {
        // Collect form data
        const formData = {
            id: Date.now(),
            date: document.getElementById('logDate').value,
            heelPain: parseInt(document.getElementById('heelPain').value),
            archPain: parseInt(document.getElementById('archPain').value),
            stepCount: parseInt(document.getElementById('stepCount').value),
            footwear: document.getElementById('footwear').value,
            activity: document.getElementById('activity').value,
            notes: document.getElementById('painNotes').value,
            timestamp: new Date().toISOString()
        };

        // Validate step count
        if (formData.stepCount < 0) {
            alert('Step count cannot be negative.');
            return;
        }

        // Save the entry and update UI
        this.painData.push(formData);
        this.saveData();
        this.resetForm();
        this.updateDashboard();
        this.renderCharts();
        this.renderHistory();
        this.renderInsights();

        // Show success message
        this.showNotification('Pain entry logged successfully!', 'success');
    }

    /**
     * Reset the form to default values
     */
    resetForm() {
        document.getElementById('painForm').reset();
        // Set default date to today
        document.getElementById('logDate').valueAsDate = new Date();
        this.updatePainDisplays();
    }

    /**
     * Update dashboard metrics
     */
    updateDashboard() {
        const data = this.painData;

        if (data.length === 0) {
            this.updateMetrics('--', '--', '0', '--');
            this.updatePainStatus(0, 'No data available');
            return;
        }

        // Calculate metrics
        const heelPains = data.map(d => d.heelPain);
        const archPains = data.map(d => d.archPain);
        const avgHeelPain = (heelPains.reduce((a, b) => a + b, 0) / heelPains.length).toFixed(1);
        const avgArchPain = (archPains.reduce((a, b) => a + b, 0) / archPains.length).toFixed(1);
        const totalDays = data.length;
        const painFreeDays = data.filter(d => d.heelPain === 0 && d.archPain === 0).length;

        this.updateMetrics(avgHeelPain, avgArchPain, totalDays, painFreeDays);

        // Update pain status
        const latest = data[data.length - 1];
        const currentPain = Math.max(latest.heelPain, latest.archPain);
        const status = this.getPainStatus(currentPain);
        this.updatePainStatus(currentPain, status);
    }

    /**
     * Update metrics display
     */
    updateMetrics(avgHeel, avgArch, totalDays, painFree) {
        document.getElementById('avgHeelPain').textContent = avgHeel;
        document.getElementById('avgArchPain').textContent = avgArch;
        document.getElementById('totalDays').textContent = totalDays;
        document.getElementById('painFreeDays').textContent = painFree;
    }

    /**
     * Update pain status indicator
     */
    updatePainStatus(level, status) {
        const fill = document.getElementById('painFill');
        const label = document.getElementById('painLabel');

        fill.style.width = `${(level / 10) * 100}%`;
        label.textContent = status;
    }

    /**
     * Get pain status description
     */
    getPainStatus(level) {
        if (level === 0) return 'Pain-free';
        if (level <= 3) return 'Mild discomfort';
        if (level <= 6) return 'Moderate pain';
        if (level <= 8) return 'Severe pain';
        return 'Extreme pain';
    }

    /**
     * Render all charts
     */
    renderCharts() {
        this.renderPainChart();
        this.renderStepsCorrelationChart();
        this.renderFootwearCorrelationChart();
    }

    /**
     * Render pain trends chart
     */
    renderPainChart() {
        const ctx = document.getElementById('painChart').getContext('2d');
        const timeRange = document.getElementById('timeRange').value;
        const filteredData = this.filterDataByTimeRange(timeRange);

        // Sort data by date
        filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));

        const labels = filteredData.map(d => new Date(d.date).toLocaleDateString());
        const heelData = filteredData.map(d => d.heelPain);
        const archData = filteredData.map(d => d.archPain);

        if (this.painChart) {
            this.painChart.destroy();
        }

        this.painChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Heel Pain',
                    data: heelData,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Arch Pain',
                    data: archData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Pain Trends Over Time'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Pain Level (0-10)'
                        }
                    }
                }
            }
        });
    }

    /**
     * Render steps vs pain correlation chart
     */
    renderStepsCorrelationChart() {
        const ctx = document.getElementById('stepsCorrelationChart').getContext('2d');

        const data = this.painData.map(d => ({
            x: d.stepCount,
            y: Math.max(d.heelPain, d.archPain)
        }));

        if (this.stepsCorrelationChart) {
            this.stepsCorrelationChart.destroy();
        }

        this.stepsCorrelationChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Steps vs Max Pain',
                    data: data,
                    backgroundColor: 'rgba(5, 150, 105, 0.6)',
                    borderColor: '#059669'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Step Count vs Pain Level'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Step Count'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Max Pain Level'
                        }
                    }
                }
            }
        });
    }

    /**
     * Render footwear correlation chart
     */
    renderFootwearCorrelationChart() {
        const ctx = document.getElementById('footwearCorrelationChart').getContext('2d');

        const footwearStats = {};
        this.painData.forEach(d => {
            const maxPain = Math.max(d.heelPain, d.archPain);
            if (!footwearStats[d.footwear]) {
                footwearStats[d.footwear] = { total: 0, count: 0 };
            }
            footwearStats[d.footwear].total += maxPain;
            footwearStats[d.footwear].count += 1;
        });

        const labels = Object.keys(footwearStats);
        const avgPains = labels.map(f => (footwearStats[f].total / footwearStats[f].count).toFixed(1));

        if (this.footwearCorrelationChart) {
            this.footwearCorrelationChart.destroy();
        }

        this.footwearCorrelationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
                datasets: [{
                    label: 'Average Pain Level',
                    data: avgPains,
                    backgroundColor: 'rgba(5, 150, 105, 0.6)',
                    borderColor: '#059669',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Pain by Footwear Type'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Average Pain Level'
                        }
                    }
                }
            }
        });
    }

    /**
     * Filter data by time range
     */
    filterDataByTimeRange(range) {
        const now = new Date();
        const days = {
            '7': 7,
            '30': 30,
            '90': 90,
            'all': Infinity
        };

        const cutoff = new Date(now.getTime() - (days[range] * 24 * 60 * 60 * 1000));

        return this.painData.filter(d => new Date(d.date) >= cutoff);
    }

    /**
     * Render pain history
     */
    renderHistory(view = 'recent') {
        const container = document.getElementById('painHistory');
        const data = view === 'recent' ? this.painData.slice(-10) : this.painData;

        container.innerHTML = '';

        if (data.length === 0) {
            container.innerHTML = '<div class="history-item">No pain entries yet</div>';
            return;
        }

        data.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(entry => {
            const item = document.createElement('div');
            item.className = 'history-item';

            item.innerHTML = `
                <div class="history-date">${new Date(entry.date).toLocaleDateString()}</div>
                <div class="history-details">
                    <div class="history-pain">
                        <span class="history-heel">Heel: ${entry.heelPain}</span>
                        <span class="history-arch">Arch: ${entry.archPain}</span>
                    </div>
                    <div class="history-steps">${entry.stepCount} steps</div>
                    <div class="history-footwear">${entry.footwear.charAt(0).toUpperCase() + entry.footwear.slice(1)}</div>
                </div>
            `;

            container.appendChild(item);
        });
    }

    /**
     * Toggle history view
     */
    toggleHistoryView(view) {
        document.getElementById('viewRecent').classList.toggle('active', view === 'recent');
        document.getElementById('viewAll').classList.toggle('active', view === 'all');
        this.renderHistory(view);
    }

    /**
     * Render insights
     */
    renderInsights() {
        this.renderPainPatterns();
        this.renderFootwearImpact();
        this.renderActivityRecommendations();
        this.renderTips();
    }

    /**
     * Render pain patterns insight
     */
    renderPainPatterns() {
        const container = document.getElementById('painPatterns');

        if (this.painData.length < 3) {
            container.innerHTML = '<p>Log more entries to see pain patterns.</p>';
            return;
        }

        const recent = this.painData.slice(-7);
        const avgPain = recent.reduce((sum, d) => sum + Math.max(d.heelPain, d.archPain), 0) / recent.length;

        let trend = 'stable';
        if (recent.length >= 2) {
            const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
            const secondHalf = recent.slice(Math.floor(recent.length / 2));
            const firstAvg = firstHalf.reduce((sum, d) => sum + Math.max(d.heelPain, d.archPain), 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((sum, d) => sum + Math.max(d.heelPain, d.archPain), 0) / secondHalf.length;

            if (secondAvg > firstAvg + 0.5) trend = 'increasing';
            else if (secondAvg < firstAvg - 0.5) trend = 'decreasing';
        }

        container.innerHTML = `
            <p>Your average pain level over the last 7 days is ${avgPain.toFixed(1)}.
            Pain levels are ${trend}.</p>
        `;
    }

    /**
     * Render footwear impact insight
     */
    renderFootwearImpact() {
        const container = document.getElementById('footwearImpact');

        const footwearStats = {};
        this.painData.forEach(d => {
            if (!footwearStats[d.footwear]) footwearStats[d.footwear] = [];
            footwearStats[d.footwear].push(Math.max(d.heelPain, d.archPain));
        });

        const best = Object.entries(footwearStats)
            .map(([type, pains]) => ({ type, avg: pains.reduce((a, b) => a + b, 0) / pains.length }))
            .sort((a, b) => a.avg - b.avg)[0];

        if (best) {
            container.innerHTML = `<p>${best.type.charAt(0).toUpperCase() + best.type.slice(1)} shows the lowest average pain (${best.avg.toFixed(1)}).</p>`;
        } else {
            container.innerHTML = '<p>Log more entries to see footwear impact.</p>';
        }
    }

    /**
     * Render activity recommendations
     */
    renderActivityRecommendations() {
        const container = document.getElementById('activityRecommendations');

        const activityStats = {};
        this.painData.forEach(d => {
            if (!activityStats[d.activity]) activityStats[d.activity] = [];
            activityStats[d.activity].push(Math.max(d.heelPain, d.archPain));
        });

        const highPainActivities = Object.entries(activityStats)
            .filter(([_, pains]) => pains.reduce((a, b) => a + b, 0) / pains.length > 5)
            .map(([type, _]) => type);

        if (highPainActivities.length > 0) {
            container.innerHTML = `<p>Consider reducing ${highPainActivities.join(', ')} activities that correlate with higher pain levels.</p>`;
        } else {
            container.innerHTML = '<p>Your activities show manageable pain levels. Continue monitoring.</p>';
        }
    }

    /**
     * Render tips
     */
    renderTips() {
        const container = document.getElementById('tips');
        const tips = [
            'Wear supportive shoes with good arch support',
            'Gradually increase activity levels to avoid overuse',
            'Consider stretching exercises for calves and plantar fascia',
            'Ice your feet after activities that cause pain',
            'Maintain a healthy weight to reduce foot stress'
        ];

        container.innerHTML = tips.map(tip => `<div class="tip-item">${tip}</div>`).join('');
    }

    /**
     * Render benchmarks
     */
    renderBenchmarks() {
        const container = document.getElementById('benchmarks');

        const benchmarks = [
            { label: 'Pain-free days this week', value: this.getPainFreeDaysThisWeek(), target: 5, unit: 'days' },
            { label: 'Average daily pain', value: this.getAverageDailyPain(), target: 3, unit: 'level', lowerBetter: true },
            { label: 'Consistent low-pain footwear', value: this.getConsistentFootwear(), target: 1, unit: 'type' }
        ];

        container.innerHTML = benchmarks.map(benchmark => {
            let status = 'not-achieved';
            let statusText = 'Not Achieved';

            if (benchmark.lowerBetter) {
                if (benchmark.value <= benchmark.target) status = 'achieved', statusText = 'Achieved';
                else if (benchmark.value <= benchmark.target * 1.5) status = 'progress', statusText = 'In Progress';
            } else {
                if (benchmark.value >= benchmark.target) status = 'achieved', statusText = 'Achieved';
                else if (benchmark.value >= benchmark.target * 0.7) status = 'progress', statusText = 'In Progress';
            }

            return `
                <div class="benchmark-item">
                    <div>
                        <div class="benchmark-label">${benchmark.label}</div>
                        <div class="benchmark-value">${benchmark.value} ${benchmark.unit}</div>
                    </div>
                    <div class="benchmark-status ${status}">${statusText}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Get pain-free days this week
     */
    getPainFreeDaysThisWeek() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        return this.painData.filter(d => new Date(d.date) >= weekAgo && d.heelPain === 0 && d.archPain === 0).length;
    }

    /**
     * Get average daily pain
     */
    getAverageDailyPain() {
        if (this.painData.length === 0) return 0;
        const totalPain = this.painData.reduce((sum, d) => sum + Math.max(d.heelPain, d.archPain), 0);
        return (totalPain / this.painData.length).toFixed(1);
    }

    /**
     * Get most consistent low-pain footwear
     */
    getConsistentFootwear() {
        const footwearStats = {};
        this.painData.forEach(d => {
            if (!footwearStats[d.footwear]) footwearStats[d.footwear] = { pains: [], count: 0 };
            footwearStats[d.footwear].pains.push(Math.max(d.heelPain, d.archPain));
            footwearStats[d.footwear].count += 1;
        });

        const lowPainFootwear = Object.entries(footwearStats)
            .filter(([_, stats]) => stats.count >= 3)
            .map(([type, stats]) => ({
                type,
                avgPain: stats.pains.reduce((a, b) => a + b, 0) / stats.pains.length
            }))
            .filter(f => f.avgPain <= 3)
            .sort((a, b) => a.avgPain - b.avgPain);

        return lowPainFootwear.length;
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Simple alert for now - could be enhanced with toast notifications
        alert(message);
    }

    /**
     * Load pain data from localStorage
     * @returns {Array} Pain data array
     */
    loadData() {
        const data = localStorage.getItem('plantarFasciaPainData');
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save pain data to localStorage
     */
    saveData() {
        localStorage.setItem('plantarFasciaPainData', JSON.stringify(this.painData));
    }
}

// Initialize the monitor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PlantarFasciaPainMonitor();
});