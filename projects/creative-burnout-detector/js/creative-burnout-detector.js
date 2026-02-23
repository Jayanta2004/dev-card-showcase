class CreativeBurnoutDetector {
    constructor() {
        this.entries = this.loadEntries();
        this.chart = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupRatingInputs();
        this.setDefaultDate();
        this.updateAnalysis();
        this.updateOverview();
        this.updateRecommendations();
        this.updateHistory();
        this.updateInsights();
    }

    setupEventListeners() {
        const form = document.getElementById('output-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    setupRatingInputs() {
        const ratingInputs = ['creative-energy', 'work-satisfaction', 'creative-block-level'];
        ratingInputs.forEach(id => {
            const input = document.getElementById(id);
            const value = input.nextElementSibling;

            input.addEventListener('input', () => {
                value.textContent = input.value;
            });
        });
    }

    setDefaultDate() {
        const dateInput = document.getElementById('log-date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    handleSubmit(e) {
        e.preventDefault();

        const entryData = this.getEntryData();
        if (!this.validateEntryData(entryData)) return;

        this.saveEntry(entryData);
        this.resetForm();
        this.updateAnalysis();
        this.updateOverview();
        this.updateRecommendations();
        this.updateHistory();
        this.updateInsights();

        this.showSuccessMessage('Creative output logged successfully!');
    }

    getEntryData() {
        return {
            id: Date.now(),
            date: document.getElementById('log-date').value,
            projectsCompleted: parseInt(document.getElementById('projects-completed').value),
            hoursCreativeWork: parseFloat(document.getElementById('hours-creative-work').value),
            ideasGenerated: parseInt(document.getElementById('ideas-generated').value),
            creativeEnergy: parseInt(document.getElementById('creative-energy').value),
            workSatisfaction: parseInt(document.getElementById('work-satisfaction').value),
            creativeBlockLevel: parseInt(document.getElementById('creative-block-level').value),
            notes: document.getElementById('notes').value,
            outputScore: 0
        };
    }

    validateEntryData(data) {
        if (!data.date) {
            this.showErrorMessage('Please select a date.');
            return false;
        }

        // Check if entry already exists for this date
        const existingEntry = this.entries.find(entry => entry.date === data.date);
        if (existingEntry) {
            this.showErrorMessage('An entry already exists for this date. Please edit the existing entry or choose a different date.');
            return false;
        }

        return true;
    }

    calculateOutputScore(entry) {
        // Weighted scoring algorithm for creative output
        const projectsWeight = 0.25;
        const hoursWeight = 0.20;
        const ideasWeight = 0.20;
        const energyWeight = 0.20;
        const satisfactionWeight = 0.15;

        // Normalize values to 0-1 scale
        const projectsScore = Math.min(entry.projectsCompleted / 10, 1); // Cap at 10 projects
        const hoursScore = Math.min(entry.hoursCreativeWork / 8, 1); // Cap at 8 hours
        const ideasScore = Math.min(entry.ideasGenerated / 20, 1); // Cap at 20 ideas
        const energyScore = entry.creativeEnergy / 10;
        const satisfactionScore = entry.workSatisfaction / 10;

        return Math.round((
            projectsScore * projectsWeight +
            hoursScore * hoursWeight +
            ideasScore * ideasWeight +
            energyScore * energyWeight +
            satisfactionScore * satisfactionWeight
        ) * 100);
    }

    calculateBurnoutRisk() {
        if (this.entries.length === 0) return 'unknown';

        const recentEntries = this.entries.slice(-7); // Last 7 days
        if (recentEntries.length < 3) return 'insufficient-data';

        // Calculate average scores
        const avgOutputScore = recentEntries.reduce((sum, entry) => sum + entry.outputScore, 0) / recentEntries.length;
        const avgEnergy = recentEntries.reduce((sum, entry) => sum + entry.creativeEnergy, 0) / recentEntries.length;
        const avgSatisfaction = recentEntries.reduce((sum, entry) => sum + entry.workSatisfaction, 0) / recentEntries.length;
        const avgBlockLevel = recentEntries.reduce((sum, entry) => sum + entry.creativeBlockLevel, 0) / recentEntries.length;

        // Trend analysis (compare first half vs second half of recent entries)
        const midPoint = Math.floor(recentEntries.length / 2);
        const firstHalf = recentEntries.slice(0, midPoint);
        const secondHalf = recentEntries.slice(midPoint);

        const firstHalfAvg = firstHalf.reduce((sum, entry) => sum + entry.outputScore, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, entry) => sum + entry.outputScore, 0) / secondHalf.length;
        const outputTrend = secondHalfAvg - firstHalfAvg;

        // Risk factors
        const lowOutputRisk = avgOutputScore < 40 ? 1 : avgOutputScore < 60 ? 0.5 : 0;
        const lowEnergyRisk = avgEnergy < 4 ? 1 : avgEnergy < 6 ? 0.5 : 0;
        const lowSatisfactionRisk = avgSatisfaction < 4 ? 1 : avgSatisfaction < 6 ? 0.5 : 0;
        const highBlockRisk = avgBlockLevel > 6 ? 1 : avgBlockLevel > 4 ? 0.5 : 0;
        const decliningTrendRisk = outputTrend < -10 ? 1 : outputTrend < -5 ? 0.5 : 0;

        // Weighted risk score
        const riskScore = (
            lowOutputRisk * 0.25 +
            lowEnergyRisk * 0.25 +
            lowSatisfactionRisk * 0.20 +
            highBlockRisk * 0.20 +
            decliningTrendRisk * 0.10
        );

        if (riskScore < 0.2) return 'low';
        if (riskScore < 0.4) return 'medium';
        if (riskScore < 0.7) return 'high';
        return 'critical';
    }

    saveEntry(entry) {
        entry.outputScore = this.calculateOutputScore(entry);
        this.entries.push(entry);
        this.saveEntries();
    }

    loadEntries() {
        const stored = localStorage.getItem('creative-burnout-entries');
        return stored ? JSON.parse(stored) : [];
    }

    saveEntries() {
        localStorage.setItem('creative-burnout-entries', JSON.stringify(this.entries));
    }

    resetForm() {
        document.getElementById('output-form').reset();
        this.setDefaultDate();
        this.setupRatingInputs(); // Reset rating displays
    }

    updateAnalysis() {
        const riskLevel = this.calculateBurnoutRisk();
        const latestEntry = this.entries.length > 0 ? this.entries[this.entries.length - 1] : null;

        // Update risk level
        const riskElement = document.getElementById('burnout-risk');
        riskElement.className = `risk-indicator risk-${riskLevel}`;
        riskElement.textContent = this.formatRiskLevel(riskLevel);

        // Update current output score
        document.getElementById('current-output-score').textContent = latestEntry ? `${latestEntry.outputScore}/100` : '0/100';

        // Update 7-day average
        const weeklyAvg = this.calculateWeeklyAverage();
        document.getElementById('weekly-average').textContent = weeklyAvg.toFixed(1);

        // Update trend direction
        const trend = this.analyzeTrend();
        document.getElementById('trend-direction').textContent = trend;

        // Update alerts
        this.updateAlerts(riskLevel);

        // Update chart
        this.updateChart();
    }

    calculateWeeklyAverage() {
        if (this.entries.length === 0) return 0;
        const recentEntries = this.entries.slice(-7);
        if (recentEntries.length === 0) return 0;
        return recentEntries.reduce((sum, entry) => sum + entry.outputScore, 0) / recentEntries.length;
    }

    analyzeTrend() {
        if (this.entries.length < 3) return '📊 Analyzing...';

        const recentEntries = this.entries.slice(-7);
        if (recentEntries.length < 3) return '📊 Analyzing...';

        const firstHalf = recentEntries.slice(0, Math.floor(recentEntries.length / 2));
        const secondHalf = recentEntries.slice(Math.floor(recentEntries.length / 2));

        const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.outputScore, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.outputScore, 0) / secondHalf.length;

        const change = secondAvg - firstAvg;

        if (change > 5) return '📈 Improving';
        if (change < -5) return '📉 Declining';
        return '📊 Stable';
    }

    updateAlerts(riskLevel) {
        const alertsContainer = document.getElementById('alerts-list');
        const alerts = this.generateAlerts(riskLevel);

        if (alerts.length === 0) {
            alertsContainer.innerHTML = '<p class="no-alerts">No active alerts. Keep logging to monitor your creative health!</p>';
            return;
        }

        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.severity}">
                <h4>${alert.icon} ${alert.title}</h4>
                <p>${alert.message}</p>
            </div>
        `).join('');
    }

    generateAlerts(riskLevel) {
        const alerts = [];

        if (riskLevel === 'insufficient-data') {
            alerts.push({
                icon: '📊',
                title: 'Building Data',
                message: 'Continue logging for a few more days to get accurate burnout risk analysis.',
                severity: ''
            });
            return alerts;
        }

        switch (riskLevel) {
            case 'high':
                alerts.push({
                    icon: '🚨',
                    title: 'High Burnout Risk',
                    message: 'Your creative output and energy levels indicate high burnout risk. Consider taking immediate action to prevent creative exhaustion.',
                    severity: 'critical'
                });
                break;
            case 'medium':
                alerts.push({
                    icon: '⚠️',
                    title: 'Medium Burnout Risk',
                    message: 'Signs of creative fatigue detected. Monitor your energy levels and consider implementing recovery strategies.',
                    severity: ''
                });
                break;
        }

        // Additional alerts based on specific metrics
        const latestEntry = this.entries[this.entries.length - 1];
        if (latestEntry) {
            if (latestEntry.creativeEnergy <= 3) {
                alerts.push({
                    icon: '🔋',
                    title: 'Low Creative Energy',
                    message: 'Your creative energy is very low. Take a break and engage in rejuvenating activities.',
                    severity: ''
                });
            }

            if (latestEntry.creativeBlockLevel >= 7) {
                alerts.push({
                    icon: '🧱',
                    title: 'Creative Block Alert',
                    message: 'High creative block levels detected. Try changing your environment or taking a different approach to your work.',
                    severity: ''
                });
            }

            if (latestEntry.outputScore < 30) {
                alerts.push({
                    icon: '📉',
                    title: 'Low Output Day',
                    message: 'Today\'s creative output is below average. This might indicate fatigue or other factors affecting productivity.',
                    severity: ''
                });
            }
        }

        return alerts;
    }

    updateChart() {
        const ctx = document.getElementById('burnout-chart').getContext('2d');

        if (this.chart) {
            this.chart.destroy();
        }

        if (this.entries.length === 0) return;

        // Sort entries by date
        const sortedEntries = this.entries.sort((a, b) => new Date(a.date) - new Date(b.date));

        const labels = sortedEntries.map(entry => this.formatDate(entry.date));
        const outputScores = sortedEntries.map(entry => entry.outputScore);
        const energyLevels = sortedEntries.map(entry => entry.creativeEnergy);
        const blockLevels = sortedEntries.map(entry => entry.creativeBlockLevel);

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Output Score',
                    data: outputScores,
                    borderColor: 'rgba(156, 39, 176, 1)',
                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                }, {
                    label: 'Creative Energy',
                    data: energyLevels,
                    borderColor: 'rgba(76, 175, 80, 1)',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }, {
                    label: 'Creative Block',
                    data: blockLevels,
                    borderColor: 'rgba(244, 67, 54, 1)',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Creative Output & Energy Trends',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Output Score (%)'
                        },
                        max: 100
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Energy/Block Level (1-10)'
                        },
                        max: 10,
                        grid: {
                            drawOnChartArea: false,
                        }
                    }
                }
            }
        });
    }

    updateOverview() {
        if (this.entries.length === 0) {
            document.getElementById('days-tracked').textContent = '0';
            document.getElementById('total-projects').textContent = '0';
            document.getElementById('avg-daily-hours').textContent = '0.0h';
            document.getElementById('peak-day').textContent = 'N/A';
            return;
        }

        // Days tracked
        document.getElementById('days-tracked').textContent = this.entries.length;

        // Total projects
        const totalProjects = this.entries.reduce((sum, entry) => sum + entry.projectsCompleted, 0);
        document.getElementById('total-projects').textContent = totalProjects;

        // Average daily hours
        const avgHours = this.entries.reduce((sum, entry) => sum + entry.hoursCreativeWork, 0) / this.entries.length;
        document.getElementById('avg-daily-hours').textContent = `${avgHours.toFixed(1)}h`;

        // Peak performance day
        const peakEntry = this.entries.reduce((peak, entry) =>
            entry.outputScore > peak.outputScore ? entry : peak
        );
        document.getElementById('peak-day').textContent = peakEntry ? this.formatDate(peakEntry.date) : 'N/A';
    }

    updateRecommendations() {
        const recommendationsContainer = document.getElementById('recommendations-content');
        const riskLevel = this.calculateBurnoutRisk();

        if (this.entries.length === 0) {
            return; // Keep default recommendation
        }

        const recommendations = this.generateRecommendations(riskLevel);
        const recommendationsHTML = recommendations.map(rec => `
            <div class="recommendation-card">
                <h3>${rec.title}</h3>
                <p>${rec.description}</p>
            </div>
        `).join('');

        recommendationsContainer.innerHTML = recommendationsHTML;
    }

    generateRecommendations(riskLevel) {
        const recommendations = [];

        switch (riskLevel) {
            case 'critical':
                recommendations.push({
                    title: '🚨 Emergency Creative Recovery',
                    description: 'Stop all creative work immediately. Take at least 3-5 days off. Engage in non-creative activities that bring joy and relaxation.'
                });
                recommendations.push({
                    title: '🏥 Professional Help',
                    description: 'Consider consulting a creative coach or therapist. Burnout can have long-term effects on your creative abilities.'
                });
                break;

            case 'high':
                recommendations.push({
                    title: '⚡ Immediate Recovery Actions',
                    description: 'Reduce creative work by 50-70%. Focus only on high-priority projects. Implement daily breaks and weekends off.'
                });
                recommendations.push({
                    title: '🎯 Quality Over Quantity',
                    description: 'Shift focus from output volume to quality. Set strict time limits and celebrate small wins.'
                });
                break;

            case 'medium':
                recommendations.push({
                    title: '⚖️ Balance Restoration',
                    description: 'Implement work-life boundaries. Take regular breaks during creative sessions. Ensure adequate sleep and nutrition.'
                });
                recommendations.push({
                    title: '🔄 Process Optimization',
                    description: 'Review your creative process. Identify bottlenecks and find ways to make work more enjoyable.'
                });
                break;

            case 'low':
                recommendations.push({
                    title: '✅ Maintain Healthy Habits',
                    description: 'Continue your current practices. Monitor for early signs of fatigue and address them promptly.'
                });
                break;
        }

        // Additional recommendations based on specific metrics
        const latestEntry = this.entries[this.entries.length - 1];
        if (latestEntry) {
            if (latestEntry.creativeBlockLevel > 6) {
                recommendations.push({
                    title: '🧱 Breaking Creative Blocks',
                    description: 'Try changing your environment, collaborating with others, or working on different types of projects to overcome blocks.'
                });
            }

            if (latestEntry.creativeEnergy < 5) {
                recommendations.push({
                    title: '🔋 Energy Replenishment',
                    description: 'Focus on activities that replenish your creative energy: nature walks, hobbies, exercise, or spending time with loved ones.'
                });
            }

            if (latestEntry.hoursCreativeWork > 8) {
                recommendations.push({
                    title: '⏰ Time Management',
                    description: 'Your work hours are high. Consider breaking work into focused sessions with breaks, or reducing overall workload.'
                });
            }
        }

        return recommendations;
    }

    updateHistory() {
        const container = document.getElementById('history-list');

        if (this.entries.length === 0) {
            container.innerHTML = '<p class="no-data">No entries yet. Start logging your creative output to see your history.</p>';
            return;
        }

        // Sort by date (newest first) and take last 10
        const recentEntries = this.entries
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        container.innerHTML = recentEntries.map(entry => this.createEntryHTML(entry)).join('');
    }

    createEntryHTML(entry) {
        const metricsHTML = `
            <div class="metric-item"><span>Projects:</span> <span>${entry.projectsCompleted}</span></div>
            <div class="metric-item"><span>Hours:</span> <span>${entry.hoursCreativeWork}h</span></div>
            <div class="metric-item"><span>Ideas:</span> <span>${entry.ideasGenerated}</span></div>
            <div class="metric-item"><span>Energy:</span> <span>${entry.creativeEnergy}/10</span></div>
            <div class="metric-item"><span>Block:</span> <span>${entry.creativeBlockLevel}/10</span></div>
        `;

        return `
            <div class="history-item">
                <div class="history-header">
                    <div class="history-date">${this.formatDate(entry.date)}</div>
                    <div class="history-score">${entry.outputScore}%</div>
                </div>
                <div class="output-metrics">${metricsHTML}</div>
                ${entry.notes ? `<div class="history-notes">${entry.notes}</div>` : ''}
            </div>
        `;
    }

    updateInsights() {
        const insightsContainer = document.getElementById('insights-content');

        if (this.entries.length < 3) {
            return; // Keep default insights
        }

        const insights = this.generateInsights();
        if (insights.length > 0) {
            const insightsHTML = insights.map(insight => `
                <div class="insight-card">
                    <h3>${insight.title}</h3>
                    <p>${insight.description}</p>
                </div>
            `).join('');

            insightsContainer.innerHTML += insightsHTML;
        }
    }

    generateInsights() {
        const insights = [];

        if (this.entries.length < 3) return insights;

        // Productivity patterns
        const productivityPattern = this.analyzeProductivityPattern();
        if (productivityPattern) {
            insights.push(productivityPattern);
        }

        // Energy patterns
        const energyPattern = this.analyzeEnergyPattern();
        if (energyPattern) {
            insights.push(energyPattern);
        }

        // Work-life balance
        const workLifeBalance = this.analyzeWorkLifeBalance();
        if (workLifeBalance) {
            insights.push(workLifeBalance);
        }

        return insights;
    }

    analyzeProductivityPattern() {
        const workdays = this.entries.filter(entry => entry.hoursCreativeWork > 0);
        if (workdays.length < 5) return null;

        const avgProjects = workdays.reduce((sum, entry) => sum + entry.projectsCompleted, 0) / workdays.length;
        const highProductivityDays = workdays.filter(entry => entry.projectsCompleted > avgProjects * 1.5).length;

        if (highProductivityDays / workdays.length > 0.3) {
            return {
                title: '🚀 High Productivity Pattern',
                description: 'You have several days with significantly higher output than average. Analyze what made those days successful and try to replicate those conditions.'
            };
        }

        return null;
    }

    analyzeEnergyPattern() {
        const entries = this.entries.slice(-14); // Last 2 weeks
        if (entries.length < 7) return null;

        const morningEnergy = entries.filter(entry => entry.creativeEnergy >= 7).length;
        const lowEnergy = entries.filter(entry => entry.creativeEnergy <= 4).length;

        if (morningEnergy / entries.length > 0.6) {
            return {
                title: '🌅 Morning Creative Peak',
                description: 'Your data shows you\'re most creative in the mornings. Consider scheduling important creative work earlier in the day.'
            };
        }

        if (lowEnergy / entries.length > 0.4) {
            return {
                title: '🔋 Energy Conservation Needed',
                description: 'Frequent low energy days suggest you may need better recovery strategies. Focus on sleep, nutrition, and stress management.'
            };
        }

        return null;
    }

    analyzeWorkLifeBalance() {
        const recentEntries = this.entries.slice(-7);
        if (recentEntries.length < 5) return null;

        const avgHours = recentEntries.reduce((sum, entry) => sum + entry.hoursCreativeWork, 0) / recentEntries.length;
        const highHourDays = recentEntries.filter(entry => entry.hoursCreativeWork > 8).length;

        if (avgHours > 8) {
            return {
                title: '⚖️ Work-Life Balance Alert',
                description: `Your average creative work hours (${avgHours.toFixed(1)}h/day) exceed recommended limits. Consider setting boundaries to prevent burnout.`
            };
        }

        if (highHourDays > recentEntries.length * 0.5) {
            return {
                title: '⏰ Overworking Pattern',
                description: 'More than half your recent days involve long work hours. This pattern increases burnout risk. Try implementing work limits.'
            };
        }

        return null;
    }

    // Utility methods
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    formatRiskLevel(risk) {
        const levels = {
            'low': 'Low Risk',
            'medium': 'Medium Risk',
            'high': 'High Risk',
            'critical': 'Critical Risk',
            'insufficient-data': 'Analyzing...',
            'unknown': 'Unknown'
        };
        return levels[risk] || 'Unknown';
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Create a temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        if (type === 'success') {
            messageEl.style.backgroundColor = 'var(--creative-primary)';
        } else {
            messageEl.style.backgroundColor = 'var(--error-color)';
        }

        document.body.appendChild(messageEl);

        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(messageEl);
            }, 300);
        }, 3000);
    }
}

// Initialize the detector when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CreativeBurnoutDetector();
});

// Add CSS animations for messages
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
`;
document.head.appendChild(style);