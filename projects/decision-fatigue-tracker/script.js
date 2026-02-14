// Decision Fatigue Tracker JavaScript

class DecisionFatigueTracker {
    constructor() {
        this.decisions = [];
        this.settings = {
            dailyLimit: 50
        };
        this.currentDate = new Date().toDateString();

        this.init();
        this.loadData();
        this.updateUI();
        this.renderCharts();
    }

    init() {
        // Get DOM elements
        this.decisionForm = document.getElementById('decision-form');
        this.decisionType = document.getElementById('decision-type');
        this.decisionComplexity = document.getElementById('decision-complexity');
        this.decisionDescription = document.getElementById('decision-description');
        this.decisionsList = document.getElementById('decisions-list');
        this.todayCount = document.getElementById('today-count');
        this.fatigueScore = document.getElementById('fatigue-score');
        this.fatigueFill = document.getElementById('fatigue-fill');
        this.fatigueLevel = document.getElementById('fatigue-level');
        this.weeklyAvg = document.getElementById('weekly-avg');
        this.weeklyTrend = document.getElementById('weekly-trend');
        this.dailyLimitInput = document.getElementById('daily-limit');
        this.resetDataBtn = document.getElementById('reset-data-btn');
        this.insightsList = document.getElementById('insights-list');

        // Bind events
        this.decisionForm.addEventListener('submit', (e) => this.logDecision(e));
        this.dailyLimitInput.addEventListener('change', () => this.updateSettings());
        this.resetDataBtn.addEventListener('click', () => this.resetData());

        // Check for new day
        this.checkNewDay();
    }

    logDecision(e) {
        e.preventDefault();

        const type = this.decisionType.value;
        const complexity = parseInt(this.decisionComplexity.value);
        const description = this.decisionDescription.value.trim();

        if (!type || !complexity) return;

        const decision = {
            id: Date.now(),
            date: new Date().toISOString(),
            type: type,
            complexity: complexity,
            description: description,
            timestamp: new Date()
        };

        this.decisions.push(decision);
        this.saveData();
        this.updateUI();
        this.renderCharts();

        // Reset form
        this.decisionForm.reset();

        // Show success feedback
        this.showNotification('Decision logged successfully!');
    }

    updateUI() {
        const todayDecisions = this.getTodayDecisions();
        const fatigueScore = this.calculateFatigueScore(todayDecisions);
        const weeklyData = this.getWeeklyData();

        // Update counters
        this.todayCount.textContent = todayDecisions.length;
        this.fatigueScore.textContent = `${fatigueScore}%`;
        this.fatigueFill.style.width = `${Math.min(fatigueScore, 100)}%`;

        // Update fatigue level
        this.updateFatigueLevel(fatigueScore);

        // Update weekly stats
        this.updateWeeklyStats(weeklyData);

        // Update decisions list
        this.renderDecisionsList(todayDecisions);

        // Update insights
        this.updateInsights(todayDecisions, weeklyData);
    }

    calculateFatigueScore(todayDecisions) {
        if (todayDecisions.length === 0) return 0;

        // Base score from decision count
        const countScore = (todayDecisions.length / this.settings.dailyLimit) * 60;

        // Complexity score (weighted average)
        const avgComplexity = todayDecisions.reduce((sum, d) => sum + d.complexity, 0) / todayDecisions.length;
        const complexityScore = (avgComplexity / 4) * 40;

        // Time factor (decisions per hour affect fatigue)
        const hoursActive = this.getHoursActive(todayDecisions);
        const timeScore = hoursActive > 0 ? (todayDecisions.length / hoursActive) * 10 : 0;

        return Math.min(Math.round(countScore + complexityScore + timeScore), 100);
    }

    updateFatigueLevel(score) {
        const container = this.fatigueFill.parentElement;
        container.className = 'fatigue-bar';

        if (score < 25) {
            this.fatigueLevel.textContent = 'Low Fatigue';
            this.fatigueLevel.className = 'fatigue-level fatigue-low';
            container.classList.add('fatigue-low');
        } else if (score < 50) {
            this.fatigueLevel.textContent = 'Moderate Fatigue';
            this.fatigueLevel.className = 'fatigue-level fatigue-moderate';
            container.classList.add('fatigue-moderate');
        } else if (score < 75) {
            this.fatigueLevel.textContent = 'High Fatigue';
            this.fatigueLevel.className = 'fatigue-level fatigue-high';
            container.classList.add('fatigue-high');
        } else {
            this.fatigueLevel.textContent = 'Critical Fatigue - Take a Break!';
            this.fatigueLevel.className = 'fatigue-level fatigue-critical';
            container.classList.add('fatigue-critical');
        }
    }

    getTodayDecisions() {
        const today = new Date().toDateString();
        return this.decisions.filter(d => new Date(d.date).toDateString() === today);
    }

    getHoursActive(decisions) {
        if (decisions.length === 0) return 0;

        const timestamps = decisions.map(d => new Date(d.timestamp));
        const earliest = Math.min(...timestamps);
        const latest = Math.max(...timestamps);

        return (latest - earliest) / (1000 * 60 * 60); // hours
    }

    getWeeklyData() {
        const weekData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();

            const dayDecisions = this.decisions.filter(d =>
                new Date(d.date).toDateString() === dateStr
            );

            weekData.push({
                date: dateStr,
                count: dayDecisions.length,
                fatigue: this.calculateFatigueScore(dayDecisions)
            });
        }
        return weekData;
    }

    updateWeeklyStats(weeklyData) {
        const validData = weeklyData.filter(d => d.count > 0);
        if (validData.length === 0) {
            this.weeklyAvg.textContent = '0';
            this.weeklyTrend.textContent = 'No data yet';
            return;
        }

        const avg = Math.round(validData.reduce((sum, d) => sum + d.count, 0) / validData.length);
        this.weeklyAvg.textContent = avg;

        // Calculate trend
        const recent = validData.slice(-3);
        const older = validData.slice(-6, -3);

        if (recent.length >= 2 && older.length >= 2) {
            const recentAvg = recent.reduce((sum, d) => sum + d.count, 0) / recent.length;
            const olderAvg = older.reduce((sum, d) => sum + d.count, 0) / older.length;

            if (recentAvg > olderAvg * 1.1) {
                this.weeklyTrend.textContent = '↗️ Increasing';
                this.weeklyTrend.style.color = '#dc3545';
            } else if (recentAvg < olderAvg * 0.9) {
                this.weeklyTrend.textContent = '↘️ Decreasing';
                this.weeklyTrend.style.color = '#28a745';
            } else {
                this.weeklyTrend.textContent = '→ Stable';
                this.weeklyTrend.style.color = '#6c757d';
            }
        } else {
            this.weeklyTrend.textContent = 'Building data...';
            this.weeklyTrend.style.color = '#6c757d';
        }
    }

    renderDecisionsList(todayDecisions) {
        if (todayDecisions.length === 0) {
            this.decisionsList.innerHTML = '<p class="no-decisions">No decisions logged today. Start by logging your first decision above!</p>';
            return;
        }

        const sortedDecisions = todayDecisions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        this.decisionsList.innerHTML = sortedDecisions.map(decision => `
            <div class="decision-item">
                <div class="decision-info">
                    <div class="decision-type">${this.formatDecisionType(decision.type)}</div>
                    ${decision.description ? `<div class="decision-description">${decision.description}</div>` : ''}
                    <div class="decision-time">${this.formatTime(decision.timestamp)}</div>
                </div>
                <div class="decision-complexity complexity-${decision.complexity}">
                    ${this.formatComplexity(decision.complexity)}
                </div>
            </div>
        `).join('');
    }

    renderCharts() {
        this.renderTypesChart();
        this.renderFatigueChart();
    }

    renderTypesChart() {
        const todayDecisions = this.getTodayDecisions();
        const typeCounts = {};

        todayDecisions.forEach(decision => {
            typeCounts[decision.type] = (typeCounts[decision.type] || 0) + 1;
        });

        // Simple text-based chart for now (could be enhanced with Chart.js)
        const ctx = document.getElementById('types-chart');
        if (!ctx) return;

        const canvas = ctx;
        const ctx2d = canvas.getContext('2d');

        // Clear canvas
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);

        if (Object.keys(typeCounts).length === 0) {
            ctx2d.fillStyle = '#666';
            ctx2d.font = '16px Arial';
            ctx2d.textAlign = 'center';
            ctx2d.fillText('No data yet', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Simple bar chart
        const types = Object.keys(typeCounts);
        const maxCount = Math.max(...Object.values(typeCounts));
        const barWidth = canvas.width / types.length * 0.8;
        const barSpacing = canvas.width / types.length * 0.2;

        types.forEach((type, index) => {
            const count = typeCounts[type];
            const barHeight = (count / maxCount) * (canvas.height - 60);
            const x = index * (barWidth + barSpacing) + barSpacing / 2;
            const y = canvas.height - barHeight - 30;

            // Bar
            ctx2d.fillStyle = this.getTypeColor(type);
            ctx2d.fillRect(x, y, barWidth, barHeight);

            // Label
            ctx2d.fillStyle = '#333';
            ctx2d.font = '12px Arial';
            ctx2d.textAlign = 'center';
            ctx2d.fillText(this.formatDecisionType(type), x + barWidth / 2, canvas.height - 10);

            // Value
            ctx2d.fillText(count.toString(), x + barWidth / 2, y - 5);
        });
    }

    renderFatigueChart() {
        const weeklyData = this.getWeeklyData();
        const ctx = document.getElementById('fatigue-chart');
        if (!ctx) return;

        const canvas = ctx;
        const ctx2d = canvas.getContext('2d');

        // Clear canvas
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);

        if (weeklyData.every(d => d.fatigue === 0)) {
            ctx2d.fillStyle = '#666';
            ctx2d.font = '16px Arial';
            ctx2d.textAlign = 'center';
            ctx2d.fillText('No data yet', canvas.width / 2, canvas.height / 2);
            return;
        }

        const points = weeklyData.map((d, i) => ({
            x: (i / 6) * canvas.width,
            y: canvas.height - (d.fatigue / 100) * (canvas.height - 40) - 20,
            fatigue: d.fatigue,
            date: d.date
        }));

        // Draw line
        ctx2d.strokeStyle = '#007bff';
        ctx2d.lineWidth = 3;
        ctx2d.beginPath();

        points.forEach((point, i) => {
            if (i === 0) {
                ctx2d.moveTo(point.x, point.y);
            } else {
                ctx2d.lineTo(point.x, point.y);
            }
        });

        ctx2d.stroke();

        // Draw points
        points.forEach(point => {
            ctx2d.fillStyle = point.fatigue > 75 ? '#dc3545' : point.fatigue > 50 ? '#ffc107' : '#28a745';
            ctx2d.beginPath();
            ctx2d.arc(point.x, point.y, 4, 0, 2 * Math.PI);
            ctx2d.fill();
        });
    }

    updateInsights(todayDecisions, weeklyData) {
        const insights = [];

        if (todayDecisions.length === 0) {
            this.insightsList.innerHTML = '<p>Log some decisions to see personalized insights!</p>';
            return;
        }

        const fatigueScore = this.calculateFatigueScore(todayDecisions);

        if (fatigueScore > 75) {
            insights.push('🚨 Your fatigue level is critically high. Consider taking a break or delegating decisions.');
        } else if (fatigueScore > 50) {
            insights.push('⚠️ You\'re experiencing high fatigue. Try to limit complex decisions for the rest of the day.');
        }

        const avgComplexity = todayDecisions.reduce((sum, d) => sum + d.complexity, 0) / todayDecisions.length;
        if (avgComplexity > 3) {
            insights.push('🧠 You\'re making mostly high-complexity decisions. Consider spacing them out.');
        }

        const workDecisions = todayDecisions.filter(d => d.type === 'work').length;
        if (workDecisions > todayDecisions.length * 0.7) {
            insights.push('💼 Most of your decisions are work-related. Don\'t forget personal decisions too!');
        }

        const recentTrend = this.getRecentTrend(weeklyData);
        if (recentTrend === 'increasing') {
            insights.push('📈 Your decision load has been increasing. Monitor for burnout.');
        } else if (recentTrend === 'decreasing') {
            insights.push('📉 Good job reducing your decision load. Keep up the balance!');
        }

        if (insights.length === 0) {
            insights.push('✅ Your decision patterns look healthy. Keep monitoring!');
        }

        this.insightsList.innerHTML = insights.map(insight => `<p>${insight}</p>`).join('');
    }

    getRecentTrend(weeklyData) {
        const recent = weeklyData.slice(-3).filter(d => d.count > 0);
        const older = weeklyData.slice(-6, -3).filter(d => d.count > 0);

        if (recent.length < 2 || older.length < 2) return 'unknown';

        const recentAvg = recent.reduce((sum, d) => sum + d.count, 0) / recent.length;
        const olderAvg = older.reduce((sum, d) => sum + d.count, 0) / older.length;

        if (recentAvg > olderAvg * 1.1) return 'increasing';
        if (recentAvg < olderAvg * 0.9) return 'decreasing';
        return 'stable';
    }

    updateSettings() {
        this.settings.dailyLimit = parseInt(this.dailyLimitInput.value);
        this.saveData();
        this.updateUI();
    }

    resetData() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            this.decisions = [];
            this.saveData();
            this.updateUI();
            this.renderCharts();
        }
    }

    checkNewDay() {
        const lastDate = localStorage.getItem('decisionFatigueLastDate');
        if (lastDate && lastDate !== this.currentDate) {
            // New day - could add day reset logic here
        }
        localStorage.setItem('decisionFatigueLastDate', this.currentDate);
    }

    saveData() {
        localStorage.setItem('decisionFatigueDecisions', JSON.stringify(this.decisions));
        localStorage.setItem('decisionFatigueSettings', JSON.stringify(this.settings));
    }

    loadData() {
        const savedDecisions = localStorage.getItem('decisionFatigueDecisions');
        const savedSettings = localStorage.getItem('decisionFatigueSettings');

        if (savedDecisions) {
            this.decisions = JSON.parse(savedDecisions).map(d => ({
                ...d,
                timestamp: new Date(d.timestamp)
            }));
        }

        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            this.dailyLimitInput.value = this.settings.dailyLimit;
        }
    }

    // Helper methods
    formatDecisionType(type) {
        const types = {
            work: '💼 Work',
            personal: '🏠 Personal',
            financial: '💰 Financial',
            health: '🏥 Health',
            relationships: '❤️ Relationships',
            other: '📝 Other'
        };
        return types[type] || type;
    }

    formatComplexity(level) {
        const levels = {
            1: 'Low',
            2: 'Medium',
            3: 'High',
            4: 'Very High'
        };
        return levels[level] || level;
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    getTypeColor(type) {
        const colors = {
            work: '#007bff',
            personal: '#28a745',
            financial: '#ffc107',
            health: '#dc3545',
            relationships: '#6f42c1',
            other: '#6c757d'
        };
        return colors[type] || '#6c757d';
    }

    showNotification(message) {
        // Simple notification - could be enhanced
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DecisionFatigueTracker();
});