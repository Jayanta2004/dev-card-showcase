// Ground Contact Time Logger JavaScript
// This module tracks ground contact time during running sessions to measure and improve running efficiency

class GroundContactTimeLogger {
    constructor() {
        // Initialize session data from localStorage
        this.sessionData = this.loadData();
        // Chart instance for Chart.js
        this.chart = null;
        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application by setting up event listeners and rendering all components
     */
    init() {
        this.loadNavbar();
        this.setupEventListeners();
        this.updateDashboard();
        this.renderChart();
        this.renderHistory();
        this.renderInsights();
        this.renderBenchmarks();
        this.setDefaultDateTime();
    }

    /**
     * Load the navbar HTML
     */
    loadNavbar() {
        fetch('../navbar.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('navbar-container').innerHTML = data;
                // Re-initialize Lucide icons for navbar
                if (window.lucide) {
                    lucide.createIcons();
                }
            })
            .catch(error => console.error('Error loading navbar:', error));
    }

    /**
     * Set up all event listeners for user interactions
     */
    setupEventListeners() {
        // Form submission for logging sessions
        document.getElementById('contactTimeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logSession();
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
     * Set default date and time to current values
     */
    setDefaultDateTime() {
        const now = new Date();
        document.getElementById('sessionDate').valueAsDate = now;
        document.getElementById('sessionTime').value = now.toTimeString().slice(0, 5);
    }

    /**
     * Log a new running session from the form data
     * Validates input and calculates efficiency metrics
     */
    logSession() {
        // Collect form data
        const formData = {
            id: Date.now(),
            sessionDate: document.getElementById('sessionDate').value,
            sessionTime: document.getElementById('sessionTime').value,
            contactTime: parseInt(document.getElementById('contactTime').value),
            distance: parseFloat(document.getElementById('sessionDistance').value),
            duration: parseInt(document.getElementById('sessionDuration').value),
            surface: document.getElementById('runningSurface').value,
            notes: document.getElementById('sessionNotes').value,
            timestamp: new Date().toISOString()
        };

        // Validate contact time range
        if (formData.contactTime < 150 || formData.contactTime > 350) {
            alert('Ground contact time should typically be between 150-350ms. Please verify your measurement.');
        }

        // Save the session and update UI
        this.sessionData.push(formData);
        this.saveData();
        this.resetForm();
        this.updateDashboard();
        this.renderChart();
        this.renderHistory();
        this.renderInsights();

        // Show success message
        this.showNotification('Running session logged successfully!', 'success');
    }

    /**
     * Reset the form to default values
     */
    resetForm() {
        document.getElementById('contactTimeForm').reset();
        this.setDefaultDateTime();
    }

    /**
     * Update the efficiency dashboard with current metrics
     */
    updateDashboard() {
        const data = this.sessionData;

        if (data.length === 0) {
            this.updateMetrics('--', '--', '0', '--');
            this.updateEfficiencyLevel(0, 'No data available');
            return;
        }

        // Calculate metrics
        const contactTimes = data.map(d => d.contactTime);
        const avgContactTime = Math.round(contactTimes.reduce((a, b) => a + b, 0) / contactTimes.length);
        const bestContactTime = Math.min(...contactTimes);
        const totalSessions = data.length;

        // Calculate efficiency score (lower contact time = higher efficiency)
        const efficiencyScore = this.calculateEfficiencyScore(contactTimes);

        this.updateMetrics(
            `${avgContactTime}ms`,
            `${bestContactTime}ms`,
            totalSessions.toString(),
            efficiencyScore.toString()
        );

        this.updateEfficiencyLevel(efficiencyScore / 100, this.getEfficiencyLabel(efficiencyScore));
    }

    /**
     * Calculate efficiency score based on contact times
     * Lower contact time = higher score
     */
    calculateEfficiencyScore(contactTimes) {
        if (contactTimes.length === 0) return 0;

        const avgContactTime = contactTimes.reduce((a, b) => a + b, 0) / contactTimes.length;

        // Score ranges based on contact time:
        // < 200ms: 90-100 (Elite)
        // 200-220ms: 70-89 (Advanced)
        // 220-250ms: 50-69 (Good)
        // 250-280ms: 30-49 (Fair)
        // > 280ms: 10-29 (Needs improvement)

        let score;
        if (avgContactTime < 200) score = 95;
        else if (avgContactTime < 220) score = 80;
        else if (avgContactTime < 250) score = 65;
        else if (avgContactTime < 280) score = 45;
        else score = 25;

        // Adjust based on consistency (lower variance = higher score)
        const variance = this.calculateVariance(contactTimes);
        const consistencyBonus = Math.max(0, 10 - (variance / 10));

        return Math.min(100, Math.round(score + consistencyBonus));
    }

    /**
     * Calculate variance of an array of values
     */
    calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    }

    /**
     * Update the metrics display
     */
    updateMetrics(avgContactTime, bestContactTime, totalSessions, efficiencyScore) {
        document.getElementById('avgContactTime').textContent = avgContactTime;
        document.getElementById('bestContactTime').textContent = bestContactTime;
        document.getElementById('totalSessions').textContent = totalSessions;
        document.getElementById('efficiencyScore').textContent = efficiencyScore;
    }

    /**
     * Update the efficiency level indicator
     */
    updateEfficiencyLevel(percentage, label) {
        const fill = document.getElementById('efficiencyFill');
        const labelEl = document.getElementById('efficiencyLabel');

        fill.style.width = `${percentage * 100}%`;
        labelEl.textContent = label;
    }

    /**
     * Get efficiency label based on score
     */
    getEfficiencyLabel(score) {
        if (score >= 90) return 'Elite';
        if (score >= 70) return 'Advanced';
        if (score >= 50) return 'Good';
        if (score >= 30) return 'Fair';
        return 'Needs Improvement';
    }

    /**
     * Render the contact time trend chart
     */
    renderChart() {
        const ctx = document.getElementById('contactTimeChart');
        if (!ctx) return;

        const timeRange = document.getElementById('timeRange').value;
        const filteredData = this.filterDataByTimeRange(timeRange);

        // Sort data by date
        filteredData.sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));

        const labels = filteredData.map(d => this.formatDate(d.sessionDate));
        const contactTimes = filteredData.map(d => d.contactTime);

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ground Contact Time (ms)',
                    data: contactTimes,
                    borderColor: '#059669',
                    backgroundColor: 'rgba(5, 150, 105, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#059669',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
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
                                return `Contact Time: ${context.parsed.y}ms`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 150,
                        max: 350,
                        title: {
                            display: true,
                            text: 'Contact Time (ms)'
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
        let cutoffDate;

        switch (range) {
            case '7':
                cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30':
                cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90':
                cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            default:
                return this.sessionData; // 'all'
        }

        return this.sessionData.filter(session => new Date(session.sessionDate) >= cutoffDate);
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    /**
     * Render the session history
     */
    renderHistory(view = 'recent') {
        const historyEl = document.getElementById('sessionHistory');
        if (!historyEl) return;

        let data = this.sessionData;

        if (view === 'recent') {
            data = data.slice(-10); // Show last 10 sessions
        }

        // Sort by date descending
        data.sort((a, b) => new Date(b.sessionDate + 'T' + b.sessionTime) - new Date(a.sessionDate + 'T' + a.sessionTime));

        historyEl.innerHTML = '';

        if (data.length === 0) {
            historyEl.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No sessions logged yet.</p>';
            return;
        }

        data.forEach(session => {
            const item = document.createElement('div');
            item.className = 'history-item';

            item.innerHTML = `
                <div class="history-item-header">
                    <div class="history-item-date">${this.formatFullDate(session.sessionDate)} at ${session.sessionTime}</div>
                    <div class="history-item-contact-time">${session.contactTime}ms</div>
                </div>
                <div class="history-item-details">
                    <div>Distance: ${session.distance}km</div>
                    <div>Duration: ${session.duration}min</div>
                    <div>Surface: ${this.capitalizeFirst(session.surface)}</div>
                    <div>Pace: ${(session.duration / session.distance).toFixed(2)} min/km</div>
                </div>
                ${session.notes ? `<div class="history-item-notes">${session.notes}</div>` : ''}
            `;

            historyEl.appendChild(item);
        });
    }

    /**
     * Toggle between recent and all history views
     */
    toggleHistoryView(view) {
        // Update button states
        document.getElementById('viewRecent').classList.toggle('active', view === 'recent');
        document.getElementById('viewAll').classList.toggle('active', view === 'all');

        this.renderHistory(view);
    }

    /**
     * Format full date for history display
     */
    formatFullDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    /**
     * Capitalize first letter of a string
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Render performance insights
     */
    renderInsights() {
        this.renderFormImprovements();
        this.renderSurfaceImpact();
        this.renderTrainingRecommendations();
        this.renderTips();
    }

    /**
     * Render form improvement insights
     */
    renderFormImprovements() {
        const el = document.getElementById('formImprovements');
        if (!el || this.sessionData.length < 2) {
            el.innerHTML = '<p>Log multiple sessions to see form improvement analysis.</p>';
            return;
        }

        const recent = this.sessionData.slice(-5);
        const avgRecent = recent.reduce((sum, s) => sum + s.contactTime, 0) / recent.length;
        const avgAll = this.sessionData.reduce((sum, s) => sum + s.contactTime, 0) / this.sessionData.length;

        const improvement = avgAll - avgRecent;
        const trend = improvement > 5 ? 'improving' : improvement < -5 ? 'declining' : 'stable';

        el.innerHTML = `
            <p>Your recent sessions show ${trend} form.
            ${trend === 'improving' ? `Average contact time improved by ${improvement.toFixed(1)}ms.` :
              trend === 'declining' ? `Average contact time increased by ${Math.abs(improvement).toFixed(1)}ms.` :
              'Contact time has remained relatively stable.'}</p>
        `;
    }

    /**
     * Render surface impact analysis
     */
    renderSurfaceImpact() {
        const el = document.getElementById('surfaceImpact');
        if (!el) return;

        const surfaceGroups = {};
        this.sessionData.forEach(session => {
            if (!surfaceGroups[session.surface]) {
                surfaceGroups[session.surface] = [];
            }
            surfaceGroups[session.surface].push(session.contactTime);
        });

        if (Object.keys(surfaceGroups).length < 2) {
            el.innerHTML = '<p>Log sessions on different surfaces to see impact analysis.</p>';
            return;
        }

        const surfaceAvgs = Object.entries(surfaceGroups).map(([surface, times]) => ({
            surface: this.capitalizeFirst(surface),
            avg: times.reduce((a, b) => a + b, 0) / times.length
        })).sort((a, b) => a.avg - b.avg);

        el.innerHTML = `
            <p>Best performance on ${surfaceAvgs[0].surface} (${surfaceAvgs[0].avg.toFixed(1)}ms avg).
            ${surfaceAvgs.length > 1 ? `Worst on ${surfaceAvgs[surfaceAvgs.length - 1].surface} (${surfaceAvgs[surfaceAvgs.length - 1].avg.toFixed(1)}ms avg).` : ''}</p>
        `;
    }

    /**
     * Render training recommendations
     */
    renderTrainingRecommendations() {
        const el = document.getElementById('trainingRecommendations');
        if (!el || this.sessionData.length < 3) {
            el.innerHTML = '<p>Log more sessions to receive personalized training recommendations.</p>';
            return;
        }

        const avgContactTime = this.sessionData.reduce((sum, s) => sum + s.contactTime, 0) / this.sessionData.length;
        let recommendation = '';

        if (avgContactTime < 220) {
            recommendation = 'Focus on maintaining your excellent form. Incorporate plyometric exercises to further improve power.';
        } else if (avgContactTime < 250) {
            recommendation = 'Work on reducing contact time through faster cadence drills and strength training.';
        } else if (avgContactTime < 280) {
            recommendation = 'Practice running drills to improve foot strike efficiency and reduce contact time.';
        } else {
            recommendation = 'Start with basic running form drills and gradually work on increasing cadence to reduce contact time.';
        }

        el.innerHTML = `<p>${recommendation}</p>`;
    }

    /**
     * Render helpful tips
     */
    renderTips() {
        const el = document.getElementById('tips');
        if (!el) return;

        const tips = [
            'Aim for a cadence of 180 steps per minute to optimize contact time.',
            'Focus on midfoot striking to reduce impact and improve efficiency.',
            'Strengthen your calves and ankles for better propulsion.',
            'Practice running drills like high knees and butt kicks regularly.',
            'Consider getting a professional gait analysis for personalized improvements.'
        ];

        el.innerHTML = `
            <h4>💡 Training Tips</h4>
            <ul>
                ${tips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
        `;
    }

    /**
     * Render efficiency benchmarks
     */
    renderBenchmarks() {
        const el = document.getElementById('benchmarks');
        if (!el) return;

        const benchmarks = [
            {
                level: 'Elite',
                range: '< 200ms',
                description: 'World-class runners with exceptional efficiency and power.'
            },
            {
                level: 'Advanced',
                range: '200-220ms',
                description: 'Competitive runners with very good form and efficiency.'
            },
            {
                level: 'Good',
                range: '220-250ms',
                description: 'Recreational runners with solid form and room for improvement.'
            },
            {
                level: 'Fair',
                range: '250-280ms',
                description: 'Runners with moderate efficiency that could benefit from form work.'
            },
            {
                level: 'Needs Improvement',
                range: '> 280ms',
                description: 'Runners who should focus on basic form drills and cadence training.'
            }
        ];

        el.innerHTML = benchmarks.map(benchmark => `
            <div class="benchmark-item">
                <h3>${benchmark.level}</h3>
                <div class="benchmark-range">${benchmark.range}</div>
                <div class="benchmark-description">${benchmark.description}</div>
            </div>
        `).join('');
    }

    /**
     * Load data from localStorage
     */
    loadData() {
        try {
            const data = localStorage.getItem('groundContactTimeSessions');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error loading data:', e);
            return [];
        }
    }

    /**
     * Save data to localStorage
     */
    saveData() {
        try {
            localStorage.setItem('groundContactTimeSessions', JSON.stringify(this.sessionData));
        } catch (e) {
            console.error('Error saving data:', e);
        }
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        // Simple alert for now - could be enhanced with a proper notification system
        alert(message);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GroundContactTimeLogger();
});