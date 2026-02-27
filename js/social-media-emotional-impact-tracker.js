// Social Media Emotional Impact Tracker JavaScript
// This module tracks emotional state changes from social media usage

class SocialMediaTracker {
    constructor() {
        // Initialize sessions data from localStorage
        this.sessions = this.loadSessions();
        // Chart instances for Chart.js
        this.moodChangeChart = null;
        this.platformImpactChart = null;
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
        this.renderSessionHistory();
        this.renderInsights();
        this.updateMoodSliders();
    }

    /**
     * Set up all event listeners for user interactions
     */
    setupEventListeners() {
        // Session logging form
        document.getElementById('sessionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logSession();
        });

        // Mood slider updates
        document.getElementById('moodBefore').addEventListener('input', () => {
            this.updateMoodSliders();
        });

        document.getElementById('moodAfter').addEventListener('input', () => {
            this.updateMoodSliders();
        });

        // History view controls
        document.getElementById('viewRecentSessions').addEventListener('click', () => {
            this.toggleSessionHistoryView('recent');
        });

        document.getElementById('viewAllSessions').addEventListener('click', () => {
            this.toggleSessionHistoryView('all');
        });
    }

    /**
     * Update mood slider displays and change indicator
     */
    updateMoodSliders() {
        const beforeValue = document.getElementById('moodBefore').value;
        const afterValue = document.getElementById('moodAfter').value;

        // Update displays
        document.getElementById('moodBeforeValue').textContent = beforeValue;
        document.getElementById('moodBeforeLabel').textContent = this.getMoodLabel(beforeValue);

        document.getElementById('moodAfterValue').textContent = afterValue;
        document.getElementById('moodAfterLabel').textContent = this.getMoodLabel(afterValue);

        // Update change indicator
        this.updateMoodChangeIndicator(beforeValue, afterValue);
    }

    /**
     * Get mood level label based on rating
     */
    getMoodLabel(rating) {
        const labels = {
            1: 'Very Negative', 2: 'Negative', 3: 'Somewhat Negative',
            4: 'Slightly Negative', 5: 'Neutral', 6: 'Slightly Positive',
            7: 'Somewhat Positive', 8: 'Positive', 9: 'Very Positive', 10: 'Extremely Positive'
        };
        return labels[rating] || 'Neutral';
    }

    /**
     * Update the mood change indicator
     */
    updateMoodChangeIndicator(before, after) {
        const change = after - before;
        const indicator = document.getElementById('moodChangeIndicator');
        const text = document.getElementById('moodChangeText');

        indicator.className = 'change-indicator';

        if (change > 0) {
            indicator.classList.add('positive');
            text.textContent = `+${change} Improved`;
        } else if (change < 0) {
            indicator.classList.add('negative');
            text.textContent = `${change} Declined`;
        } else {
            indicator.classList.add('neutral');
            text.textContent = 'No Change';
        }

        // Update icon
        const icon = indicator.querySelector('i');
        if (change > 0) {
            icon.setAttribute('data-lucide', 'trending-up');
        } else if (change < 0) {
            icon.setAttribute('data-lucide', 'trending-down');
        } else {
            icon.setAttribute('data-lucide', 'minus');
        }

        // Re-initialize Lucide icons
        lucide.createIcons();
    }

    /**
     * Log a new social media session
     */
    logSession() {
        const formData = {
            id: Date.now(),
            platform: document.getElementById('platform').value,
            sessionStart: document.getElementById('sessionStart').value,
            sessionEnd: document.getElementById('sessionEnd').value,
            purposes: Array.from(document.querySelectorAll('input[name="purposes"]:checked'))
                .map(checkbox => checkbox.value),
            moodBefore: parseInt(document.getElementById('moodBefore').value),
            moodAfter: parseInt(document.getElementById('moodAfter').value),
            moodChange: parseInt(document.getElementById('moodAfter').value) - parseInt(document.getElementById('moodBefore').value),
            notes: document.getElementById('sessionNotes').value,
            timestamp: new Date().toISOString()
        };

        // Calculate session duration
        const startTime = new Date(formData.sessionStart);
        const endTime = new Date(formData.sessionEnd);
        formData.duration = (endTime - startTime) / (1000 * 60); // Duration in minutes

        this.sessions.push(formData);
        this.saveSessions();

        // Reset form
        document.getElementById('sessionForm').reset();
        // Uncheck all purpose checkboxes
        document.querySelectorAll('input[name="purposes"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateMoodSliders();

        // Update UI
        this.updateDashboard();
        this.renderCharts();
        this.renderSessionHistory();
        this.renderInsights();

        // Show success message
        this.showNotification('Session logged successfully!', 'success');
    }

    /**
     * Load sessions from localStorage
     */
    loadSessions() {
        const data = localStorage.getItem('socialMediaSessions');
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save sessions to localStorage
     */
    saveSessions() {
        localStorage.setItem('socialMediaSessions', JSON.stringify(this.sessions));
    }

    /**
     * Update the dashboard with current metrics
     */
    updateDashboard() {
        const sessions = this.sessions;

        if (sessions.length === 0) {
            // Reset all metrics
            document.getElementById('avgMoodChange').textContent = '--';
            document.getElementById('moodChangeDesc').textContent = 'No data available';
            document.getElementById('totalSessions').textContent = '0';
            document.getElementById('mostImpactful').textContent = '--';
            document.getElementById('emotionalHealth').textContent = '--';
            return;
        }

        // Calculate average mood change
        const avgMoodChange = sessions.reduce((sum, session) => sum + session.moodChange, 0) / sessions.length;

        // Find most impactful platform (largest negative mood change)
        const platformImpact = {};
        sessions.forEach(session => {
            if (!platformImpact[session.platform]) {
                platformImpact[session.platform] = { totalChange: 0, count: 0 };
            }
            platformImpact[session.platform].totalChange += session.moodChange;
            platformImpact[session.platform].count++;
        });

        let mostImpactful = '--';
        let worstAvgChange = 0;
        Object.keys(platformImpact).forEach(platform => {
            const avgChange = platformImpact[platform].totalChange / platformImpact[platform].count;
            if (avgChange < worstAvgChange) {
                worstAvgChange = avgChange;
                mostImpactful = this.capitalizeFirst(platform);
            }
        });

        // Calculate emotional health score (0-100, higher is better)
        const positiveSessions = sessions.filter(s => s.moodChange > 0).length;
        const emotionalHealthScore = Math.round((positiveSessions / sessions.length) * 100);

        // Update metrics display
        document.getElementById('avgMoodChange').textContent = avgMoodChange >= 0 ? `+${avgMoodChange.toFixed(1)}` : avgMoodChange.toFixed(1);
        document.getElementById('moodChangeDesc').textContent = avgMoodChange >= 0 ? 'Average improvement' : 'Average decline';
        document.getElementById('totalSessions').textContent = sessions.length;
        document.getElementById('mostImpactful').textContent = mostImpactful;
        document.getElementById('emotionalHealth').textContent = emotionalHealthScore;
    }

    /**
     * Render both charts
     */
    renderCharts() {
        this.renderMoodChangeChart();
        this.renderPlatformImpactChart();
    }

    /**
     * Render mood change over time chart
     */
    renderMoodChangeChart() {
        const ctx = document.getElementById('moodChangeChart').getContext('2d');
        const sessions = this.sessions;

        if (sessions.length === 0) {
            if (this.moodChangeChart) {
                this.moodChangeChart.destroy();
            }
            return;
        }

        // Sort sessions by date
        const sortedSessions = [...sessions].sort((a, b) => new Date(a.sessionStart) - new Date(b.sessionStart));

        // Prepare data for line chart
        const chartData = {
            labels: sortedSessions.map(session => {
                const date = new Date(session.sessionStart);
                return date.toLocaleDateString();
            }),
            datasets: [{
                label: 'Mood Change (After - Before)',
                data: sortedSessions.map(session => session.moodChange),
                borderColor: 'rgba(99, 102, 241, 1)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: (context) => {
                    const value = context.parsed.y;
                    if (value > 0) return 'rgba(16, 185, 129, 1)';
                    if (value < 0) return 'rgba(239, 68, 68, 1)';
                    return 'rgba(245, 158, 11, 1)';
                }
            }]
        };

        // Destroy existing chart
        if (this.moodChangeChart) {
            this.moodChangeChart.destroy();
        }

        // Create new chart
        this.moodChangeChart = new Chart(ctx, {
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
                                const session = sortedSessions[context.dataIndex];
                                return [
                                    `Mood Change: ${context.parsed.y}`,
                                    `Platform: ${this.capitalizeFirst(session.platform)}`,
                                    `Duration: ${Math.round(session.duration)} min`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Mood Change (-5 to +5)'
                        },
                        min: -5,
                        max: 5
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
     * Render platform impact comparison chart
     */
    renderPlatformImpactChart() {
        const ctx = document.getElementById('platformImpactChart').getContext('2d');
        const sessions = this.sessions;

        if (sessions.length === 0) {
            if (this.platformImpactChart) {
                this.platformImpactChart.destroy();
            }
            return;
        }

        // Calculate average mood change by platform
        const platformData = {};
        sessions.forEach(session => {
            if (!platformData[session.platform]) {
                platformData[session.platform] = { totalChange: 0, count: 0 };
            }
            platformData[session.platform].totalChange += session.moodChange;
            platformData[session.platform].count++;
        });

        const platforms = Object.keys(platformData);
        const avgChanges = platforms.map(platform => platformData[platform].totalChange / platformData[platform].count);

        // Prepare data for bar chart
        const chartData = {
            labels: platforms.map(p => this.capitalizeFirst(p)),
            datasets: [{
                label: 'Average Mood Change',
                data: avgChanges,
                backgroundColor: avgChanges.map(change => {
                    if (change > 0) return 'rgba(16, 185, 129, 0.8)';
                    if (change < 0) return 'rgba(239, 68, 68, 0.8)';
                    return 'rgba(245, 158, 11, 0.8)';
                }),
                borderColor: avgChanges.map(change => {
                    if (change > 0) return 'rgba(16, 185, 129, 1)';
                    if (change < 0) return 'rgba(239, 68, 68, 1)';
                    return 'rgba(245, 158, 11, 1)';
                }),
                borderWidth: 1
            }]
        };

        // Destroy existing chart
        if (this.platformImpactChart) {
            this.platformImpactChart.destroy();
        }

        // Create new chart
        this.platformImpactChart = new Chart(ctx, {
            type: 'bar',
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
                                const platform = platforms[context.dataIndex];
                                const data = platformData[platform];
                                return [
                                    `Average Change: ${context.parsed.y.toFixed(1)}`,
                                    `Sessions: ${data.count}`,
                                    `Total Change: ${data.totalChange.toFixed(1)}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Average Mood Change'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Platform'
                        }
                    }
                }
            }
        });
    }

    /**
     * Render session history
     */
    renderSessionHistory(view = 'recent') {
        const container = document.getElementById('sessionHistory');
        let sessions = [...this.sessions];

        // Sort by date (most recent first)
        sessions.sort((a, b) => new Date(b.sessionStart) - new Date(a.sessionStart));

        // Filter for recent view (last 10 entries)
        if (view === 'recent') {
            sessions = sessions.slice(0, 10);
        }

        // Clear existing content
        container.innerHTML = '';

        if (sessions.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No sessions logged yet.</p>';
            return;
        }

        // Render session items
        sessions.forEach(session => {
            const sessionItem = document.createElement('div');
            sessionItem.className = 'history-item';

            const sessionDate = new Date(session.sessionStart).toLocaleString();

            sessionItem.innerHTML = `
                <div class="history-item-header">
                    <div class="history-item-title">${this.capitalizeFirst(session.platform)}</div>
                    <div class="history-item-date">${sessionDate}</div>
                </div>
                <div class="history-item-mood">
                    <div class="mood-before">
                        <div class="mood-label">Before</div>
                        <div class="mood-rating">${session.moodBefore}</div>
                    </div>
                    <div class="mood-change ${this.getMoodChangeClass(session.moodChange)}">
                        <i data-lucide="${this.getMoodChangeIcon(session.moodChange)}"></i>
                        <span>${session.moodChange > 0 ? '+' : ''}${session.moodChange}</span>
                    </div>
                    <div class="mood-after">
                        <div class="mood-label">After</div>
                        <div class="mood-rating">${session.moodAfter}</div>
                    </div>
                </div>
                <div class="history-item-content">
                    <p><strong>Duration:</strong> ${Math.round(session.duration)} minutes</p>
                    ${session.notes ? `<p><strong>Notes:</strong> ${session.notes}</p>` : ''}
                </div>
                ${session.purposes.length > 0 ? `<div class="history-item-tags">
                    ${session.purposes.map(purpose => `<span class="tag secondary">${this.getPurposeLabel(purpose)}</span>`).join('')}
                </div>` : '<div class="history-item-tags">No purposes specified</div>'}
            `;

            container.appendChild(sessionItem);
        });

        // Re-initialize Lucide icons
        lucide.createIcons();
    }

    /**
     * Get mood change class for styling
     */
    getMoodChangeClass(change) {
        if (change > 0) return 'positive';
        if (change < 0) return 'negative';
        return 'neutral';
    }

    /**
     * Get mood change icon
     */
    getMoodChangeIcon(change) {
        if (change > 0) return 'trending-up';
        if (change < 0) return 'trending-down';
        return 'minus';
    }

    /**
     * Get human-readable purpose label
     */
    getPurposeLabel(purpose) {
        const labels = {
            'entertainment': 'Entertainment',
            'socializing': 'Socializing',
            'news': 'News/Info',
            'work': 'Work',
            'shopping': 'Shopping',
            'boredom': 'Boredom',
            'comparison': 'Comparison',
            'other': 'Other'
        };
        return labels[purpose] || purpose;
    }

    /**
     * Capitalize first letter of string
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Toggle session history view
     */
    toggleSessionHistoryView(view) {
        document.getElementById('viewRecentSessions').classList.toggle('active', view === 'recent');
        document.getElementById('viewAllSessions').classList.toggle('active', view === 'all');
        this.renderSessionHistory(view);
    }

    /**
     * Render insights and recommendations
     */
    renderInsights() {
        this.renderMoodImpactSummary();
        this.renderPlatformRecommendations();
        this.renderUsagePatterns();
    }

    /**
     * Render mood impact summary
     */
    renderMoodImpactSummary() {
        const container = document.getElementById('moodImpactSummary');
        const sessions = this.sessions;

        if (sessions.length < 3) {
            container.innerHTML = '<p>Log more sessions to see mood impact patterns.</p>';
            return;
        }

        const positiveSessions = sessions.filter(s => s.moodChange > 0).length;
        const negativeSessions = sessions.filter(s => s.moodChange < 0).length;
        const neutralSessions = sessions.filter(s => s.moodChange === 0).length;

        const positivePercent = Math.round((positiveSessions / sessions.length) * 100);
        const negativePercent = Math.round((negativeSessions / sessions.length) * 100);

        let summary = '';

        if (positivePercent > 60) {
            summary = `Great! ${positivePercent}% of your sessions result in improved mood. Social media seems to have a positive impact on your emotional state.`;
        } else if (negativePercent > 40) {
            summary = `Caution: ${negativePercent}% of your sessions lead to decreased mood. Consider reviewing your social media habits and content consumption.`;
        } else {
            summary = `Your social media usage has mixed effects on mood. ${positivePercent}% positive, ${negativePercent}% negative. Focus on platforms and content that boost your mood.`;
        }

        container.innerHTML = `<p>${summary}</p>`;
    }

    /**
     * Render platform recommendations
     */
    renderPlatformRecommendations() {
        const container = document.getElementById('platformRecommendations');
        const sessions = this.sessions;

        if (sessions.length < 5) {
            container.innerHTML = '<p>More data needed for personalized recommendations.</p>';
            return;
        }

        // Calculate platform impact
        const platformImpact = {};
        sessions.forEach(session => {
            if (!platformImpact[session.platform]) {
                platformImpact[session.platform] = { totalChange: 0, count: 0 };
            }
            platformImpact[session.platform].totalChange += session.moodChange;
            platformImpact[session.platform].count++;
        });

        // Find best and worst platforms
        let bestPlatform = null;
        let worstPlatform = null;
        let bestAvg = -10;
        let worstAvg = 10;

        Object.keys(platformImpact).forEach(platform => {
            const avgChange = platformImpact[platform].totalChange / platformImpact[platform].count;
            if (avgChange > bestAvg) {
                bestAvg = avgChange;
                bestPlatform = platform;
            }
            if (avgChange < worstAvg) {
                worstAvg = avgChange;
                worstPlatform = platform;
            }
        });

        let recommendation = '';

        if (bestPlatform && worstPlatform && bestPlatform !== worstPlatform) {
            recommendation = `Consider spending more time on ${this.capitalizeFirst(bestPlatform)} (avg mood change: ${bestAvg.toFixed(1)}) and less time on ${this.capitalizeFirst(worstPlatform)} (avg mood change: ${worstAvg.toFixed(1)}).`;
        } else if (bestPlatform) {
            recommendation = `${this.capitalizeFirst(bestPlatform)} seems to have the most positive impact on your mood.`;
        } else {
            recommendation = 'Keep monitoring different platforms to identify which ones work best for you.';
        }

        container.innerHTML = `<p>${recommendation}</p>`;
    }

    /**
     * Render usage patterns insights
     */
    renderUsagePatterns() {
        const container = document.getElementById('usagePatterns');
        const sessions = this.sessions;

        if (sessions.length < 5) {
            container.innerHTML = '<p>Track more sessions to identify usage patterns.</p>';
            return;
        }

        // Analyze session duration
        const avgDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;

        // Analyze purposes
        const purposeCounts = {};
        sessions.forEach(session => {
            session.purposes.forEach(purpose => {
                purposeCounts[purpose] = (purposeCounts[purpose] || 0) + 1;
            });
        });

        const mostCommonPurpose = Object.keys(purposeCounts).reduce((a, b) =>
            purposeCounts[a] > purposeCounts[b] ? a : b, '');

        let patterns = `Your average session lasts ${Math.round(avgDuration)} minutes. `;

        if (mostCommonPurpose) {
            const purposeLabel = this.getPurposeLabel(mostCommonPurpose);
            patterns += `You most commonly use social media for ${purposeLabel.toLowerCase()}.`;
        }

        // Check for long sessions with negative impact
        const longNegativeSessions = sessions.filter(s => s.duration > 30 && s.moodChange < 0).length;
        if (longNegativeSessions > sessions.length * 0.3) {
            patterns += ' Consider shorter sessions, as longer ones often lead to mood decline.';
        }

        container.innerHTML = `<p>${patterns}</p>`;
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
    new SocialMediaTracker();
});