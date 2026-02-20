// Digital Detox Analytics JavaScript

class DigitalDetoxAnalytics {
    constructor() {
        this.sessions = [];
        this.goals = {
            daily: 0,
            streak: 0
        };
        this.currentView = 'week';

        this.init();
        this.loadData();
        this.updateUI();
        this.renderCharts();
    }

    init() {
        // Get DOM elements
        this.detoxForm = document.getElementById('detox-form');
        this.activityType = document.getElementById('activity-type');
        this.duration = document.getElementById('duration');
        this.moodBefore = document.getElementById('mood-before');
        this.moodAfter = document.getElementById('mood-after');
        this.moodBeforeValue = document.getElementById('mood-before-value');
        this.moodAfterValue = document.getElementById('mood-after-value');
        this.notes = document.getElementById('notes');
        this.sessionsList = document.getElementById('sessions-list');
        this.insightsContainer = document.getElementById('insights-container');

        // Status elements
        this.todayTotal = document.getElementById('today-total');
        this.todayGoal = document.getElementById('today-goal');
        this.weeklyAvg = document.getElementById('weekly-avg');
        this.weeklyTrend = document.getElementById('weekly-trend');
        this.currentStreak = document.getElementById('current-streak');
        this.streakGoal = document.getElementById('streak-goal');
        this.moodImprovement = document.getElementById('mood-improvement');
        this.moodTrend = document.getElementById('mood-trend');

        // Goals elements
        this.dailyGoal = document.getElementById('daily-goal');
        this.setDailyGoal = document.getElementById('set-daily-goal');
        this.dailyGoalDisplay = document.getElementById('daily-goal-display');
        this.streakGoalInput = document.getElementById('streak-goal');
        this.setStreakGoal = document.getElementById('set-streak-goal');
        this.streakGoalDisplay = document.getElementById('streak-goal-display');

        // Chart controls
        this.viewWeek = document.getElementById('view-week');
        this.viewMonth = document.getElementById('view-month');

        // Bind events
        this.detoxForm.addEventListener('submit', (e) => this.logSession(e));
        this.moodBefore.addEventListener('input', () => {
            this.moodBeforeValue.textContent = this.moodBefore.value;
        });
        this.moodAfter.addEventListener('input', () => {
            this.moodAfterValue.textContent = this.moodAfter.value;
        });

        this.setDailyGoal.addEventListener('click', () => this.setGoal('daily'));
        this.setStreakGoal.addEventListener('click', () => this.setGoal('streak'));
        this.viewWeek.addEventListener('click', () => this.changeView('week'));
        this.viewMonth.addEventListener('click', () => this.changeView('month'));

        // Initialize mood values
        this.moodBeforeValue.textContent = this.moodBefore.value;
        this.moodAfterValue.textContent = this.moodAfter.value;

        // Get device checkboxes
        this.deviceCheckboxes = document.querySelectorAll('.checkbox-item input');
    }

    logSession(e) {
        e.preventDefault();

        const activity = this.activityType.value;
        const duration = parseInt(this.duration.value);
        const moodBefore = parseInt(this.moodBefore.value);
        const moodAfter = parseInt(this.moodAfter.value);
        const devices = Array.from(this.deviceCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        const notes = this.notes.value.trim();

        if (!activity || !duration || duration <= 0) {
            this.showInsight('Please enter a valid activity and duration', 'warning');
            return;
        }

        const session = {
            id: Date.now(),
            activity: activity,
            duration: duration,
            moodBefore: moodBefore,
            moodAfter: moodAfter,
            devices: devices,
            notes: notes,
            timestamp: new Date(),
            date: new Date().toISOString()
        };

        this.sessions.push(session);
        this.saveData();
        this.updateUI();
        this.renderCharts();

        // Reset form
        this.detoxForm.reset();
        this.moodBeforeValue.textContent = '5';
        this.moodAfterValue.textContent = '5';

        // Show success feedback
        this.showInsight('Detox session logged successfully! Keep up the great work.', 'achievement');

        // Check for achievements
        this.checkAchievements(session);
    }

    updateUI() {
        const todaySessions = this.getTodaySessions();
        const weeklyData = this.getWeeklyData();

        // Update status cards
        this.updateStatusCards(todaySessions, weeklyData);

        // Update goals display
        this.updateGoalsDisplay();

        // Update sessions list
        this.renderSessionsList(todaySessions.slice(0, 10));

        // Update insights
        this.updateInsights(todaySessions, weeklyData);
    }

    updateStatusCards(todaySessions, weeklyData) {
        // Today's total
        const todayTotal = todaySessions.reduce((sum, s) => sum + s.duration, 0);
        this.todayTotal.textContent = this.formatDuration(todayTotal);

        if (this.goals.daily > 0) {
            const progress = (todayTotal / this.goals.daily) * 100;
            this.todayGoal.textContent = `${progress.toFixed(0)}% of ${this.formatDuration(this.goals.daily)} goal`;
            this.todayGoal.style.color = progress >= 100 ? '#4caf50' : progress >= 50 ? '#ff9800' : '#666';
        } else {
            this.todayGoal.textContent = 'Set a daily goal';
        }

        // Weekly average
        const weeklyTotal = weeklyData.reduce((sum, d) => sum + d.totalDuration, 0);
        const weeklyAvg = Math.round(weeklyTotal / 7);
        this.weeklyAvg.textContent = this.formatDuration(weeklyAvg);

        // Weekly trend
        this.updateWeeklyTrend(weeklyData);

        // Current streak
        const streak = this.calculateStreak();
        this.currentStreak.textContent = `${streak} days`;

        if (this.goals.streak > 0) {
            const progress = (streak / this.goals.streak) * 100;
            this.streakGoal.textContent = `${progress.toFixed(0)}% of ${this.goals.streak} day goal`;
            this.streakGoal.style.color = progress >= 100 ? '#4caf50' : progress >= 50 ? '#ff9800' : '#666';
        } else {
            this.streakGoal.textContent = 'Set a streak goal';
        }

        // Mood improvement
        this.updateMoodAnalysis(todaySessions);
    }

    updateWeeklyTrend(weeklyData) {
        if (weeklyData.length < 7) {
            this.weeklyTrend.textContent = 'Building data...';
            this.weeklyTrend.style.color = '#666';
            return;
        }

        const recent = weeklyData.slice(-3);
        const older = weeklyData.slice(-6, -3);

        if (recent.length > 0 && older.length > 0) {
            const recentAvg = recent.reduce((sum, d) => sum + d.totalDuration, 0) / recent.length;
            const olderAvg = older.reduce((sum, d) => sum + d.totalDuration, 0) / older.length;

            if (recentAvg > olderAvg * 1.2) {
                this.weeklyTrend.textContent = '↗️ Improving';
                this.weeklyTrend.style.color = '#4caf50';
            } else if (recentAvg < olderAvg * 0.8) {
                this.weeklyTrend.textContent = '↘️ Declining';
                this.weeklyTrend.style.color = '#f44336';
            } else {
                this.weeklyTrend.textContent = '→ Stable';
                this.weeklyTrend.style.color = '#ff9800';
            }
        }
    }

    updateMoodAnalysis(todaySessions) {
        if (todaySessions.length === 0) {
            this.moodImprovement.textContent = 'No sessions today';
            this.moodTrend.textContent = '--';
            return;
        }

        const avgBefore = todaySessions.reduce((sum, s) => sum + s.moodBefore, 0) / todaySessions.length;
        const avgAfter = todaySessions.reduce((sum, s) => sum + s.moodAfter, 0) / todaySessions.length;
        const improvement = avgAfter - avgBefore;

        this.moodImprovement.textContent = improvement > 0 ?
            `+${improvement.toFixed(1)} points` :
            improvement < 0 ?
            `${improvement.toFixed(1)} points` :
            'No change';

        this.moodImprovement.style.color = improvement > 0.5 ? '#4caf50' :
                                          improvement < -0.5 ? '#f44336' : '#ff9800';

        this.moodTrend.textContent = improvement > 0.5 ? 'Mood boosted!' :
                                    improvement < -0.5 ? 'Mood declined' : 'Mood stable';
    }

    setGoal(type) {
        if (type === 'daily') {
            const goal = parseInt(this.dailyGoal.value);
            if (goal && goal > 0) {
                this.goals.daily = goal;
                this.dailyGoalDisplay.textContent = `${this.formatDuration(goal)} per day`;
                this.saveGoals();
                this.updateUI();
                this.showInsight(`Daily goal set to ${this.formatDuration(goal)}!`, 'achievement');
            }
        } else if (type === 'streak') {
            const goal = parseInt(this.streakGoalInput.value);
            if (goal && goal > 0) {
                this.goals.streak = goal;
                this.streakGoalDisplay.textContent = `${goal} consecutive days`;
                this.saveGoals();
                this.updateUI();
                this.showInsight(`Streak goal set to ${goal} days!`, 'achievement');
            }
        }
    }

    updateGoalsDisplay() {
        if (this.goals.daily > 0) {
            this.dailyGoalDisplay.textContent = `${this.formatDuration(this.goals.daily)} per day`;
        }
        if (this.goals.streak > 0) {
            this.streakGoalDisplay.textContent = `${this.goals.streak} consecutive days`;
        }
    }

    renderSessionsList(sessions) {
        if (sessions.length === 0) {
            this.sessionsList.innerHTML = '<p class="no-sessions">No detox sessions logged yet. Start your digital wellness journey by logging your first session above!</p>';
            return;
        }

        const sortedSessions = sessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        this.sessionsList.innerHTML = sortedSessions.map(session => `
            <div class="session-item">
                <div class="session-main">
                    <div class="session-activity">${this.formatActivity(session.activity)}</div>
                    <div class="session-details">
                        <div class="session-time">${this.formatDateTime(session.timestamp)}</div>
                        <div class="session-duration">${this.formatDuration(session.duration)}</div>
                        ${session.devices.length > 0 ? `<div class="session-devices">Device-free: ${session.devices.join(', ')}</div>` : ''}
                        <div class="session-mood">
                            Mood: ${session.moodBefore} → ${session.moodAfter}
                            <span class="mood-change ${this.getMoodChangeClass(session.moodAfter - session.moodBefore)}">
                                (${session.moodAfter > session.moodBefore ? '+' : ''}${(session.moodAfter - session.moodBefore).toFixed(1)})
                            </span>
                        </div>
                        ${session.notes ? `<div class="session-notes">"${session.notes}"</div>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderCharts() {
        this.renderWeeklyChart();
        this.renderActivityChart();
        this.renderMoodChart();
    }

    renderWeeklyChart() {
        const canvas = document.getElementById('weekly-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const data = this.currentView === 'week' ? this.getWeeklyData() : this.getMonthlyData();

        if (data.every(d => d.totalDuration === 0)) {
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No data yet', canvas.width / 2, canvas.height / 2);
            return;
        }

        const maxDuration = Math.max(...data.map(d => d.totalDuration));
        const barWidth = canvas.width / data.length * 0.8;
        const barSpacing = canvas.width / data.length * 0.2;

        data.forEach((day, index) => {
            const barHeight = (day.totalDuration / Math.max(maxDuration, 60)) * (canvas.height - 60);
            const x = index * (barWidth + barSpacing) + barSpacing / 2;
            const y = canvas.height - barHeight - 30;

            // Bar
            ctx.fillStyle = day.totalDuration > 0 ? '#4caf50' : '#e8f5e8';
            ctx.fillRect(x, y, barWidth, barHeight);

            // Goal line
            if (this.goals.daily > 0) {
                const goalY = canvas.height - (this.goals.daily / Math.max(maxDuration, 60)) * (canvas.height - 60) - 30;
                ctx.strokeStyle = '#ff9800';
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(0, goalY);
                ctx.lineTo(canvas.width, goalY);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Value
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.formatDuration(day.totalDuration), x + barWidth / 2, y - 5);

            // Day label
            const label = this.currentView === 'week' ?
                new Date(day.date).toLocaleDateString('en', { weekday: 'short' }) :
                `${new Date(day.date).getDate()}`;
            ctx.fillText(label, x + barWidth / 2, canvas.height - 10);
        });
    }

    renderActivityChart() {
        const canvas = document.getElementById('activity-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const activityData = this.getActivityBreakdown();
        if (activityData.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No activity data yet', canvas.width / 2, canvas.height / 2);
            return;
        }

        const total = activityData.reduce((sum, a) => sum + a.duration, 0);
        const colors = ['#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

        let startAngle = 0;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 40;

        activityData.forEach((activity, index) => {
            const angle = (activity.duration / total) * 2 * Math.PI;

            // Slice
            ctx.fillStyle = colors[index % colors.length];
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
            ctx.closePath();
            ctx.fill();

            // Label
            const labelAngle = startAngle + angle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 20);

            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${activity.name}: ${Math.round((activity.duration / total) * 100)}%`, labelX, labelY);

            startAngle += angle;
        });
    }

    renderMoodChart() {
        const canvas = document.getElementById('mood-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const moodData = this.getMoodCorrelationData();
        if (moodData.length < 2) {
            ctx.fillStyle = '#666';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Need more sessions for mood analysis', canvas.width / 2, canvas.height / 2);
            return;
        }

        const padding = 40;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;

        // Draw axes
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();

        // Plot points
        moodData.forEach((point, index) => {
            const x = padding + (index / (moodData.length - 1)) * chartWidth;
            const y = canvas.height - padding - (point.improvement / 10) * chartHeight;

            ctx.fillStyle = point.improvement > 0 ? '#4caf50' : point.improvement < 0 ? '#f44336' : '#ff9800';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Labels
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Mood Improvement Over Time', canvas.width / 2, 20);
    }

    changeView(view) {
        this.currentView = view;

        // Update button states
        [this.viewWeek, this.viewMonth].forEach(btn => btn.classList.remove('active'));
        document.getElementById(`view-${view}`).classList.add('active');

        this.renderCharts();
    }

    checkAchievements(session) {
        const achievements = [];

        // First session
        if (this.sessions.length === 1) {
            achievements.push('🎉 First detox session logged! Welcome to your digital wellness journey.');
        }

        // Long session
        if (session.duration >= 120) {
            achievements.push('⏰ Two-hour detox milestone! Excellent commitment to digital wellness.');
        }

        // Mood boost
        if (session.moodAfter > session.moodBefore + 1) {
            achievements.push('😊 Significant mood improvement! Detox sessions are benefiting your wellbeing.');
        }

        // Daily goal met
        const todayTotal = this.getTodaySessions().reduce((sum, s) => sum + s.duration, 0);
        if (this.goals.daily > 0 && todayTotal >= this.goals.daily) {
            achievements.push('🎯 Daily detox goal achieved! Great job staying committed.');
        }

        // Streak milestones
        const streak = this.calculateStreak();
        if (streak === 7) {
            achievements.push('🔥 One week detox streak! You\'re building healthy habits.');
        } else if (streak === 30) {
            achievements.push('🏆 One month milestone! Your digital wellness journey is inspiring.');
        }

        achievements.forEach(achievement => this.showInsight(achievement, 'achievement'));
    }

    updateInsights(todaySessions, weeklyData) {
        // Clear existing insights except the tip
        const existingInsights = this.insightsContainer.querySelectorAll('.insight-card:not(.tip)');
        existingInsights.forEach(card => card.remove());

        // Add current insights
        this.generateInsights(todaySessions, weeklyData);
    }

    generateInsights(todaySessions, weeklyData) {
        const insights = [];

        if (this.sessions.length === 0) return;

        // Daily progress
        const todayTotal = todaySessions.reduce((sum, s) => sum + s.duration, 0);
        if (this.goals.daily > 0) {
            const progress = (todayTotal / this.goals.daily) * 100;
            if (progress < 50) {
                insights.push({
                    type: 'tip',
                    title: 'Daily Goal Progress',
                    message: `You're ${progress.toFixed(0)}% toward your daily goal. Try adding another session to get closer to your target.`
                });
            }
        }

        // Weekly trend
        const weeklyTotal = weeklyData.reduce((sum, d) => sum + d.totalDuration, 0);
        const weeklyAvg = weeklyTotal / 7;
        if (weeklyAvg < 30) {
            insights.push({
                type: 'tip',
                title: 'Increase Frequency',
                message: 'Consider adding more detox sessions throughout the week. Even 15-30 minute sessions can make a big difference.'
            });
        }

        // Activity variety
        const activities = [...new Set(this.sessions.map(s => s.activity))];
        if (activities.length < 3) {
            insights.push({
                type: 'tip',
                title: 'Try New Activities',
                message: 'Experiment with different offline activities like reading, exercise, or meditation to keep your detox sessions engaging.'
            });
        }

        // Mood correlation
        const avgMoodChange = this.sessions.reduce((sum, s) => sum + (s.moodAfter - s.moodBefore), 0) / this.sessions.length;
        if (avgMoodChange > 1) {
            insights.push({
                type: 'achievement',
                title: 'Positive Mood Impact',
                message: 'Your detox sessions are consistently improving your mood. Keep up the excellent work!'
            });
        }

        // Device restrictions
        const deviceSessions = this.sessions.filter(s => s.devices.length > 0).length;
        const deviceRatio = deviceSessions / this.sessions.length;
        if (deviceRatio < 0.5) {
            insights.push({
                type: 'tip',
                title: 'Device Restrictions',
                message: 'Try being more strict about device restrictions during your detox sessions for better results.'
            });
        }

        insights.forEach(insight => this.showInsight(insight.message, insight.type, insight.title));
    }

    showInsight(message, type = 'tip', title = '') {
        const insightCard = document.createElement('div');
        insightCard.className = `insight-card ${type}`;

        const icon = type === 'achievement' ? '🏆' : type === 'warning' ? '⚠️' : '💡';
        const defaultTitle = type === 'achievement' ? 'Achievement Unlocked' : type === 'warning' ? 'Suggestion' : 'Tip';

        insightCard.innerHTML = `
            <div class="insight-icon">${icon}</div>
            <div class="insight-content">
                <h4>${title || defaultTitle}</h4>
                <p>${message}</p>
            </div>
        `;

        // Insert after the tip card
        const tipCard = this.insightsContainer.querySelector('.tip');
        if (tipCard) {
            tipCard.after(insightCard);
        } else {
            this.insightsContainer.appendChild(insightCard);
        }
    }

    // Helper methods
    getTodaySessions() {
        const today = new Date().toDateString();
        return this.sessions.filter(s => new Date(s.timestamp).toDateString() === today);
    }

    getWeeklyData() {
        const data = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();

            const daySessions = this.sessions.filter(s =>
                new Date(s.timestamp).toDateString() === dateStr
            );

            data.push({
                date: dateStr,
                totalDuration: daySessions.reduce((sum, s) => sum + s.duration, 0),
                sessions: daySessions.length
            });
        }

        return data;
    }

    getMonthlyData() {
        const data = [];

        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();

            const daySessions = this.sessions.filter(s =>
                new Date(s.timestamp).toDateString() === dateStr
            );

            data.push({
                date: dateStr,
                totalDuration: daySessions.reduce((sum, s) => sum + s.duration, 0),
                sessions: daySessions.length
            });
        }

        return data;
    }

    getActivityBreakdown() {
        const activities = {};

        this.sessions.forEach(session => {
            if (!activities[session.activity]) {
                activities[session.activity] = 0;
            }
            activities[session.activity] += session.duration;
        });

        return Object.entries(activities)
            .map(([activity, duration]) => ({
                name: this.formatActivity(activity),
                duration: duration
            }))
            .sort((a, b) => b.duration - a.duration);
    }

    getMoodCorrelationData() {
        return this.sessions.map(session => ({
            improvement: session.moodAfter - session.moodBefore,
            timestamp: session.timestamp
        })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    calculateStreak() {
        if (this.sessions.length === 0) return 0;

        const sortedSessions = this.sessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        let streak = 0;
        let currentDate = new Date();

        // Check if there's a session today or yesterday
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

        const hasRecentSession = sortedSessions.some(s =>
            new Date(s.timestamp).toDateString() === today ||
            new Date(s.timestamp).toDateString() === yesterday
        );

        if (!hasRecentSession) return 0;

        // Count consecutive days
        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(currentDate);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toDateString();

            const hasSession = sortedSessions.some(s =>
                new Date(s.timestamp).toDateString() === dateStr
            );

            if (hasSession) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    formatActivity(activity) {
        const activities = {
            'reading': '📖 Reading',
            'exercise': '🏃 Exercise',
            'meditation': '🧘 Meditation',
            'social': '👥 Social Interaction',
            'hobby': '🎨 Hobby',
            'nature': '🌳 Nature',
            'sleep': '😴 Sleep',
            'other': '📝 Other'
        };
        return activities[activity] || activity;
    }

    formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes}m`;
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
    }

    formatDateTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    getMoodChangeClass(change) {
        if (change > 0.5) return 'mood-positive';
        if (change < -0.5) return 'mood-negative';
        return 'mood-neutral';
    }

    saveData() {
        localStorage.setItem('digitalDetoxSessions', JSON.stringify(this.sessions));
    }

    saveGoals() {
        localStorage.setItem('digitalDetoxGoals', JSON.stringify(this.goals));
    }

    loadData() {
        const savedSessions = localStorage.getItem('digitalDetoxSessions');
        if (savedSessions) {
            this.sessions = JSON.parse(savedSessions).map(s => ({
                ...s,
                timestamp: new Date(s.timestamp)
            }));
        }

        const savedGoals = localStorage.getItem('digitalDetoxGoals');
        if (savedGoals) {
            this.goals = JSON.parse(savedGoals);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DigitalDetoxAnalytics();
});