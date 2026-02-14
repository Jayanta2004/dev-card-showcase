class RunningFormTracker {
    constructor() {
        this.sessions = this.loadSessions();
        this.formTrendChart = null;
        this.formDistanceChart = null;
        this.initializeEventListeners();
        this.updateDashboard();
        this.renderHistory();
        this.generateInsights();
        this.initializeCharts();
    }

    initializeEventListeners() {
        // Form submission
        document.getElementById('running-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logSession();
        });

        // Rating slider update
        document.getElementById('form-rating').addEventListener('input', (e) => {
            this.updateRatingDisplay(e.target.value);
        });

        // History controls
        document.getElementById('export-btn').addEventListener('click', () => this.exportData());
        document.getElementById('import-btn').addEventListener('click', () => this.importData());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearData());

        // Set default date to now
        document.getElementById('session-date').value = new Date().toISOString().slice(0, 16);
    }

    updateRatingDisplay(value) {
        const ratingValue = document.querySelector('.rating-value');
        ratingValue.textContent = value;

        // Update descriptor highlighting
        const descriptors = document.querySelectorAll('.descriptor');
        descriptors.forEach(desc => desc.classList.remove('active'));

        if (value <= 3) {
            document.querySelector('.descriptor.poor').classList.add('active');
        } else if (value <= 5) {
            document.querySelector('.descriptor.fair').classList.add('active');
        } else if (value <= 8) {
            document.querySelector('.descriptor.good').classList.add('active');
        } else {
            document.querySelector('.descriptor.excellent').classList.add('active');
        }
    }

    logSession() {
        const session = {
            id: Date.now(),
            date: document.getElementById('session-date').value,
            distance: parseFloat(document.getElementById('distance').value),
            duration: parseInt(document.getElementById('duration').value),
            formRating: parseInt(document.getElementById('form-rating').value),
            issues: Array.from(document.querySelectorAll('input[name="issues"]:checked')).map(cb => cb.value),
            injuryStatus: document.getElementById('injury-status').value,
            notes: document.getElementById('notes').value.trim()
        };

        this.sessions.unshift(session);
        this.saveSessions();
        this.updateDashboard();
        this.renderHistory();
        this.generateInsights();
        this.updateCharts();

        // Reset form
        document.getElementById('running-form').reset();
        document.getElementById('session-date').value = new Date().toISOString().slice(0, 16);
        this.updateRatingDisplay(7);

        // Show success message
        this.showNotification('Session logged successfully!', 'success');
    }

    updateDashboard() {
        const recentSessions = this.getRecentSessions(30);

        // Average form rating
        const avgRating = recentSessions.length > 0
            ? (recentSessions.reduce((sum, s) => sum + s.formRating, 0) / recentSessions.length).toFixed(1)
            : '--';
        document.getElementById('avg-form-rating').textContent = avgRating;

        // Form rating trend
        if (recentSessions.length >= 2) {
            const recent = recentSessions.slice(0, 5);
            const older = recentSessions.slice(5, 10);
            if (older.length > 0) {
                const recentAvg = recent.reduce((sum, s) => sum + s.formRating, 0) / recent.length;
                const olderAvg = older.reduce((sum, s) => sum + s.formRating, 0) / older.length;
                const trend = recentAvg - olderAvg;
                const trendElement = document.getElementById('form-rating-trend');
                if (Math.abs(trend) < 0.1) {
                    trendElement.textContent = '↔ Stable';
                    trendElement.className = 'metric-trend';
                } else if (trend > 0) {
                    trendElement.textContent = `↗ +${trend.toFixed(1)}`;
                    trendElement.className = 'metric-trend positive';
                } else {
                    trendElement.textContent = `↘ ${trend.toFixed(1)}`;
                    trendElement.className = 'metric-trend negative';
                }
            }
        }

        // Total distance
        const totalDistance = recentSessions.reduce((sum, s) => sum + s.distance, 0).toFixed(1);
        document.getElementById('total-distance').textContent = `${totalDistance} km`;

        // Form consistency (lower variation = higher consistency)
        if (recentSessions.length > 1) {
            const ratings = recentSessions.map(s => s.formRating);
            const mean = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
            const variance = ratings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / ratings.length;
            const stdDev = Math.sqrt(variance);
            const consistency = Math.max(0, 100 - (stdDev * 20)).toFixed(0);
            document.getElementById('form-consistency').textContent = `${consistency}%`;
        } else {
            document.getElementById('form-consistency').textContent = '--%';
        }

        // Injury correlation
        this.updateInjuryCorrelation();
    }

    updateInjuryCorrelation() {
        const sessions = this.sessions.slice(0, 20); // Last 20 sessions
        if (sessions.length < 5) {
            document.getElementById('injury-correlation').textContent = '--';
            return;
        }

        const injuredSessions = sessions.filter(s => s.injuryStatus !== 'none');
        const healthySessions = sessions.filter(s => s.injuryStatus === 'none');

        if (injuredSessions.length === 0 || healthySessions.length === 0) {
            document.getElementById('injury-correlation').textContent = 'No correlation';
            return;
        }

        const injuredAvgRating = injuredSessions.reduce((sum, s) => sum + s.formRating, 0) / injuredSessions.length;
        const healthyAvgRating = healthySessions.reduce((sum, s) => sum + s.formRating, 0) / healthySessions.length;

        const correlation = injuredAvgRating - healthyAvgRating;
        if (Math.abs(correlation) < 0.5) {
            document.getElementById('injury-correlation').textContent = 'No correlation';
        } else if (correlation < 0) {
            document.getElementById('injury-correlation').textContent = 'Poor form → Injuries';
        } else {
            document.getElementById('injury-correlation').textContent = 'Injuries → Poor form';
        }
    }

    initializeCharts() {
        this.updateCharts();
    }

    updateCharts() {
        const sessions = this.getRecentSessions(30);

        if (sessions.length === 0) return;

        // Form rating trend chart
        const ctx1 = document.getElementById('form-trend-chart').getContext('2d');
        if (this.formTrendChart) {
            this.formTrendChart.destroy();
        }

        this.formTrendChart = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: sessions.map(s => new Date(s.date).toLocaleDateString()).reverse(),
                datasets: [{
                    label: 'Form Rating',
                    data: sessions.map(s => s.formRating).reverse(),
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
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
                        ticks: {
                            stepSize: 1
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

        // Form vs Distance scatter chart
        const ctx2 = document.getElementById('form-distance-chart').getContext('2d');
        if (this.formDistanceChart) {
            this.formDistanceChart.destroy();
        }

        this.formDistanceChart = new Chart(ctx2, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Form Rating vs Distance',
                    data: sessions.map(s => ({ x: s.distance, y: s.formRating })),
                    backgroundColor: '#22c55e',
                    borderColor: '#16a34a',
                    borderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Distance (km)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Form Rating'
                        },
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    renderHistory() {
        const sessionsList = document.getElementById('sessions-list');
        sessionsList.innerHTML = '';

        if (this.sessions.length === 0) {
            sessionsList.innerHTML = '<p class="no-sessions">No sessions logged yet. Start by logging your first running session!</p>';
            return;
        }

        this.sessions.slice(0, 10).forEach(session => {
            const sessionElement = this.createSessionElement(session);
            sessionsList.appendChild(sessionElement);
        });
    }

    createSessionElement(session) {
        const div = document.createElement('div');
        div.className = 'session-item';

        const ratingClass = this.getRatingClass(session.formRating);
        const injuryIcon = this.getInjuryIcon(session.injuryStatus);

        div.innerHTML = `
            <div class="session-header">
                <div class="session-date">${new Date(session.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</div>
                <div class="session-rating">
                    <span class="rating-badge ${ratingClass}">${session.formRating}/10</span>
                    ${injuryIcon}
                </div>
            </div>
            <div class="session-details">
                <div class="session-detail">
                    <strong>${session.distance} km</strong>
                    <span>Distance</span>
                </div>
                <div class="session-detail">
                    <strong>${session.duration} min</strong>
                    <span>Duration</span>
                </div>
                <div class="session-detail">
                    <strong>${(session.distance / (session.duration / 60)).toFixed(1)} km/h</strong>
                    <span>Avg Pace</span>
                </div>
                <div class="session-detail">
                    <strong>${session.injuryStatus.replace('-', ' ')}</strong>
                    <span>Injury Status</span>
                </div>
            </div>
            ${session.issues.length > 0 ? `
                <div class="session-issues">
                    <div class="issues-list">
                        ${session.issues.map(issue => `<span class="issue-tag">${this.formatIssue(issue)}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            ${session.notes ? `<div class="session-notes"><em>"${session.notes}"</em></div>` : ''}
        `;

        return div;
    }

    getRatingClass(rating) {
        if (rating <= 3) return 'poor';
        if (rating <= 5) return 'fair';
        if (rating <= 8) return 'good';
        return 'excellent';
    }

    getInjuryIcon(status) {
        switch (status) {
            case 'minor': return '<i data-lucide="alert-triangle" class="injury-icon minor"></i>';
            case 'moderate': return '<i data-lucide="alert-circle" class="injury-icon moderate"></i>';
            case 'severe': return '<i data-lucide="x-circle" class="injury-icon severe"></i>';
            default: return '';
        }
    }

    formatIssue(issue) {
        const issueMap = {
            'heel-striking': 'Heel striking',
            'over-striding': 'Over-striding',
            'arm-swing': 'Poor arm swing',
            'posture': 'Slouched posture',
            'cadence': 'Inconsistent cadence',
            'breathing': 'Labored breathing'
        };
        return issueMap[issue] || issue;
    }

    generateInsights() {
        const insightsContainer = document.getElementById('insights-container');
        const sessions = this.sessions;

        if (sessions.length < 3) {
            return; // Keep loading message
        }

        const insights = [];

        // Form consistency insight
        const recentRatings = sessions.slice(0, 10).map(s => s.formRating);
        if (recentRatings.length >= 5) {
            const avgRating = recentRatings.reduce((sum, r) => sum + r, 0) / recentRatings.length;
            const consistency = this.calculateConsistency(recentRatings);

            if (consistency < 60) {
                insights.push({
                    type: 'warning',
                    title: 'Inconsistent Form Detected',
                    message: `Your form ratings vary significantly (${consistency}% consistency). Focus on maintaining consistent running mechanics to reduce injury risk.`
                });
            } else if (avgRating >= 8) {
                insights.push({
                    type: 'positive',
                    title: 'Excellent Form Consistency',
                    message: `Your average form rating of ${avgRating.toFixed(1)}/10 shows great consistency. Keep up the good work!`
                });
            }
        }

        // Injury correlation insight
        const injuredSessions = sessions.filter(s => s.injuryStatus !== 'none');
        if (injuredSessions.length > 0) {
            const injuredAvgRating = injuredSessions.reduce((sum, s) => sum + s.formRating, 0) / injuredSessions.length;
            const healthyAvgRating = sessions.filter(s => s.injuryStatus === 'none')
                .slice(0, injuredSessions.length)
                .reduce((sum, s) => sum + s.formRating, 0) / Math.max(1, injuredSessions.length);

            if (injuredAvgRating < healthyAvgRating - 1) {
                insights.push({
                    type: 'danger',
                    title: 'Form Quality & Injury Link',
                    message: `Your form rating drops to ${injuredAvgRating.toFixed(1)}/10 when injured. Focus on form improvement to aid recovery and prevent future injuries.`
                });
            }
        }

        // Common issues insight
        const allIssues = sessions.flatMap(s => s.issues);
        if (allIssues.length > 0) {
            const issueCounts = {};
            allIssues.forEach(issue => issueCounts[issue] = (issueCounts[issue] || 0) + 1);
            const mostCommon = Object.entries(issueCounts).sort(([,a], [,b]) => b - a)[0];

            if (mostCommon[1] >= 3) {
                insights.push({
                    type: 'warning',
                    title: 'Recurring Form Issue',
                    message: `"${this.formatIssue(mostCommon[0])}" appears in ${mostCommon[1]} of your recent sessions. Consider working with a running coach to address this issue.`
                });
            }
        }

        // Distance correlation insight
        if (sessions.length >= 5) {
            const longRuns = sessions.filter(s => s.distance >= 10);
            const shortRuns = sessions.filter(s => s.distance < 10);

            if (longRuns.length > 0 && shortRuns.length > 0) {
                const longAvgRating = longRuns.reduce((sum, s) => sum + s.formRating, 0) / longRuns.length;
                const shortAvgRating = shortRuns.reduce((sum, s) => sum + s.formRating, 0) / shortRuns.length;

                if (longAvgRating < shortAvgRating - 1) {
                    insights.push({
                        type: 'warning',
                        title: 'Long Run Form Decline',
                        message: `Your form rating drops during longer runs (${longAvgRating.toFixed(1)} vs ${shortAvgRating.toFixed(1)}). Build endurance gradually and focus on form maintenance.`
                    });
                }
            }
        }

        // Render insights
        insightsContainer.innerHTML = insights.length > 0
            ? insights.map(insight => `
                <div class="insight-card ${insight.type}">
                    <h4><i data-lucide="${this.getInsightIcon(insight.type)}"></i> ${insight.title}</h4>
                    <p>${insight.message}</p>
                </div>
            `).join('')
            : '<div class="insight-card loading"><p>Complete more sessions to generate personalized insights</p></div>';

        // Re-initialize Lucide icons
        lucide.createIcons();
    }

    calculateConsistency(ratings) {
        if (ratings.length < 2) return 100;
        const mean = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
        const variance = ratings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / ratings.length;
        const stdDev = Math.sqrt(variance);
        return Math.max(0, 100 - (stdDev * 20));
    }

    getInsightIcon(type) {
        switch (type) {
            case 'positive': return 'trending-up';
            case 'warning': return 'alert-triangle';
            case 'danger': return 'alert-circle';
            default: return 'info';
        }
    }

    getRecentSessions(days) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return this.sessions.filter(session => new Date(session.date) >= cutoff);
    }

    exportData() {
        const dataStr = JSON.stringify(this.sessions, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `running-form-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('Data exported successfully!', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedSessions = JSON.parse(e.target.result);
                        if (Array.isArray(importedSessions)) {
                            this.sessions = [...importedSessions, ...this.sessions];
                            this.saveSessions();
                            this.updateDashboard();
                            this.renderHistory();
                            this.generateInsights();
                            this.updateCharts();
                            this.showNotification('Data imported successfully!', 'success');
                        } else {
                            throw new Error('Invalid data format');
                        }
                    } catch (error) {
                        this.showNotification('Error importing data. Please check the file format.', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    clearData() {
        if (confirm('Are you sure you want to clear all running session data? This action cannot be undone.')) {
            this.sessions = [];
            this.saveSessions();
            this.updateDashboard();
            this.renderHistory();
            this.generateInsights();
            this.updateCharts();
            this.showNotification('All data cleared successfully!', 'success');
        }
    }

    loadSessions() {
        try {
            const data = localStorage.getItem('running-form-sessions');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading sessions:', error);
            return [];
        }
    }

    saveSessions() {
        try {
            localStorage.setItem('running-form-sessions', JSON.stringify(this.sessions));
        } catch (error) {
            console.error('Error saving sessions:', error);
            this.showNotification('Error saving data to local storage.', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Add to page
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize the tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new RunningFormTracker();
    lucide.createIcons();
});