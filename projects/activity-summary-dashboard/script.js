// Activity Summary Dashboard JavaScript
class ActivityDashboard {
    constructor() {
        this.activities = JSON.parse(localStorage.getItem('activityData')) || [];
        this.currentDate = new Date().toDateString();
        this.charts = {};

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTodayActivities();
        this.updateStats();
        this.createCharts();
        this.updateInsights();
        this.showWelcomeTips();
    }

    setupEventListeners() {
        // Activity form submission
        document.getElementById('activity-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logActivity();
        });

        // Export button
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportData();
        });

        // Activity type change for dynamic tips
        document.getElementById('activity-type').addEventListener('change', (e) => {
            this.showActivityTip(e.target.value);
        });
    }

    logActivity() {
        const formData = new FormData(document.getElementById('activity-form'));
        const activity = {
            id: Date.now(),
            type: formData.get('activity-type'),
            duration: parseInt(formData.get('duration')),
            intensity: parseInt(formData.get('intensity')),
            notes: formData.get('notes') || '',
            timestamp: new Date(),
            date: this.currentDate
        };

        this.activities.push(activity);
        this.saveData();
        this.loadTodayActivities();
        this.updateStats();
        this.updateCharts();
        this.updateInsights();
        this.showSuccessMessage('Activity logged successfully!');

        // Reset form
        document.getElementById('activity-form').reset();
        document.getElementById('intensity').value = '3'; // Reset to moderate
    }

    loadTodayActivities() {
        const todayActivities = this.activities.filter(activity =>
            activity.date === this.currentDate
        ).sort((a, b) => b.timestamp - a.timestamp);

        this.renderTimeline(todayActivities);
    }

    renderTimeline(activities) {
        const timeline = document.getElementById('activity-timeline');

        if (activities.length === 0) {
            timeline.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-plus"></i>
                    <p>No activities logged today</p>
                    <small>Start by logging your first activity above</small>
                </div>
            `;
            return;
        }

        timeline.innerHTML = activities.map(activity => `
            <div class="timeline-item">
                <div class="timeline-icon activity-${activity.type}">
                    <i class="fas ${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="timeline-content">
                    <h4>${this.formatActivityName(activity.type)}</h4>
                    <div class="timeline-meta">
                        ${activity.duration} minutes • ${this.getIntensityLabel(activity.intensity)} •
                        ${activity.timestamp.toLocaleTimeString()}
                    </div>
                    ${activity.notes ? `<div class="timeline-notes">${activity.notes}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const todayActivities = this.activities.filter(activity =>
            activity.date === this.currentDate
        );

        const totalMinutes = todayActivities.reduce((sum, activity) => sum + activity.duration, 0);
        const totalHours = (totalMinutes / 60).toFixed(1);
        const avgIntensity = todayActivities.length > 0
            ? (todayActivities.reduce((sum, activity) => sum + activity.intensity, 0) / todayActivities.length).toFixed(1)
            : 0;

        const wellnessScore = this.calculateWellnessScore(todayActivities);

        document.getElementById('total-time').textContent = totalHours;
        document.getElementById('activities-count').textContent = todayActivities.length;
        document.getElementById('avg-intensity').textContent = avgIntensity;
        document.getElementById('wellness-score').textContent = wellnessScore;
    }

    calculateWellnessScore(activities) {
        if (activities.length === 0) return 0;

        let score = 0;
        const categories = {
            physical: 0,
            mental: 0,
            social: 0,
            work: 0
        };

        // Categorize activities
        activities.forEach(activity => {
            const category = this.getActivityCategory(activity.type);
            categories[category] += activity.duration;
        });

        // Calculate balance score (0-100)
        const totalMinutes = Object.values(categories).reduce((a, b) => a + b, 0);
        const idealMinutes = totalMinutes / 4; // Equal distribution

        let balanceScore = 0;
        Object.values(categories).forEach(minutes => {
            const deviation = Math.abs(minutes - idealMinutes);
            balanceScore += Math.max(0, 100 - (deviation / idealMinutes) * 100);
        });
        balanceScore = balanceScore / 4;

        // Activity diversity bonus
        const uniqueActivities = new Set(activities.map(a => a.type)).size;
        const diversityBonus = Math.min(uniqueActivities * 10, 30);

        // Duration bonus
        const durationBonus = Math.min(totalMinutes / 10, 20);

        score = Math.round(balanceScore + diversityBonus + durationBonus);
        return Math.min(score, 100);
    }

    createCharts() {
        this.createTimeDistributionChart();
        this.createWeeklyOverviewChart();
    }

    createTimeDistributionChart() {
        const ctx = document.getElementById('timeChart').getContext('2d');
        const todayActivities = this.activities.filter(activity =>
            activity.date === this.currentDate
        );

        const categoryData = this.groupActivitiesByCategory(todayActivities);

        this.charts.timeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#4ecdc4',
                        '#ffbe76',
                        '#ff6b6b'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed} minutes`;
                            }
                        }
                    }
                }
            }
        });
    }

    createWeeklyOverviewChart() {
        const ctx = document.getElementById('weeklyChart').getContext('2d');
        const weeklyData = this.getWeeklyData();

        this.charts.weeklyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weeklyData.labels,
                datasets: [{
                    label: 'Total Activity Time (minutes)',
                    data: weeklyData.data,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
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
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
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

    updateCharts() {
        if (this.charts.timeChart) {
            const todayActivities = this.activities.filter(activity =>
                activity.date === this.currentDate
            );
            const categoryData = this.groupActivitiesByCategory(todayActivities);

            this.charts.timeChart.data.labels = Object.keys(categoryData);
            this.charts.timeChart.data.datasets[0].data = Object.values(categoryData);
            this.charts.timeChart.update();
        }

        if (this.charts.weeklyChart) {
            const weeklyData = this.getWeeklyData();
            this.charts.weeklyChart.data.labels = weeklyData.labels;
            this.charts.weeklyChart.data.datasets[0].data = weeklyData.data;
            this.charts.weeklyChart.update();
        }
    }

    groupActivitiesByCategory(activities) {
        const categories = {};

        activities.forEach(activity => {
            const category = this.getActivityCategory(activity.type);
            categories[category] = (categories[category] || 0) + activity.duration;
        });

        return categories;
    }

    getActivityCategory(type) {
        const categories = {
            physical: ['walking', 'running', 'cycling', 'swimming', 'yoga', 'weight-training', 'sports'],
            mental: ['meditation', 'reading', 'learning', 'creative-work'],
            social: ['socializing'],
            work: ['work', 'housework']
        };

        for (const [category, activities] of Object.entries(categories)) {
            if (activities.includes(type)) {
                return category;
            }
        }

        return 'other';
    }

    getWeeklyData() {
        const labels = [];
        const data = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toDateString();

            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

            const dayActivities = this.activities.filter(activity =>
                activity.date === dateString
            );
            const totalMinutes = dayActivities.reduce((sum, activity) => sum + activity.duration, 0);
            data.push(totalMinutes);
        }

        return { labels, data };
    }

    updateInsights() {
        const insights = this.calculateInsights();

        document.getElementById('most-active-day').textContent = insights.mostActiveDay;
        document.getElementById('favorite-activity').textContent = insights.favoriteActivity;
        document.getElementById('consistency-score').textContent = `${insights.consistencyScore}%`;
        document.getElementById('activity-diversity').textContent = `${insights.diversityScore}/10`;
    }

    calculateInsights() {
        // Most active day
        const dayTotals = {};
        this.activities.forEach(activity => {
            dayTotals[activity.date] = (dayTotals[activity.date] || 0) + activity.duration;
        });

        const mostActiveDay = Object.entries(dayTotals)
            .sort(([,a], [,b]) => b - a)[0];
        const mostActiveDayName = mostActiveDay
            ? new Date(mostActiveDay[0]).toLocaleDateString('en-US', { weekday: 'long' })
            : 'No data';

        // Favorite activity
        const activityCounts = {};
        this.activities.forEach(activity => {
            activityCounts[activity.type] = (activityCounts[activity.type] || 0) + 1;
        });

        const favoriteActivity = Object.entries(activityCounts)
            .sort(([,a], [,b]) => b - a)[0];
        const favoriteActivityName = favoriteActivity
            ? this.formatActivityName(favoriteActivity[0])
            : 'No data';

        // Consistency score (based on daily activity over last 7 days)
        const weeklyData = this.getWeeklyData();
        const activeDays = weeklyData.data.filter(minutes => minutes > 0).length;
        const consistencyScore = Math.round((activeDays / 7) * 100);

        // Diversity score (unique activities over last 7 days)
        const recentActivities = this.activities.filter(activity => {
            const activityDate = new Date(activity.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return activityDate >= weekAgo;
        });

        const uniqueActivities = new Set(recentActivities.map(a => a.type)).size;
        const diversityScore = Math.min(uniqueActivities, 10);

        return {
            mostActiveDay: mostActiveDayName,
            favoriteActivity: favoriteActivityName,
            consistencyScore,
            diversityScore
        };
    }

    showActivityTip(activityType) {
        const tips = {
            meditation: "Great choice! Meditation helps reduce stress and improve focus.",
            running: "Running is excellent cardio! Remember to warm up and stay hydrated.",
            yoga: "Yoga promotes flexibility and mental clarity. Focus on your breathing.",
            reading: "Reading expands your mind! Try different genres to keep it interesting.",
            socializing: "Social connections are vital for mental health. Quality time matters!",
            work: "Balance is important. Take regular breaks to maintain productivity."
        };

        const tip = tips[activityType];
        if (tip) {
            this.showSuccessMessage(tip);
        }
    }

    showWelcomeTips() {
        const tips = [
            "Start your day with a physical activity to boost your energy!",
            "Mix different types of activities for better overall wellness.",
            "Consistency is more important than intensity. Small daily activities add up!",
            "Don't forget to include mental and social activities in your routine."
        ];

        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        setTimeout(() => {
            this.showSuccessMessage(randomTip);
        }, 2000);
    }

    exportData() {
        const data = {
            activities: this.activities,
            exportDate: new Date().toISOString(),
            summary: {
                totalActivities: this.activities.length,
                dateRange: {
                    start: this.activities.length > 0 ? this.activities[this.activities.length - 1].date : null,
                    end: this.currentDate
                }
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity-summary-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showSuccessMessage('Data exported successfully!');
    }

    saveData() {
        localStorage.setItem('activityData', JSON.stringify(this.activities));
    }

    // Utility methods
    getActivityIcon(type) {
        const icons = {
            walking: 'fa-walking',
            running: 'fa-running',
            cycling: 'fa-bicycle',
            swimming: 'fa-swim',
            yoga: 'fa-om',
            'weight-training': 'fa-dumbbell',
            sports: 'fa-basketball-ball',
            meditation: 'fa-brain',
            reading: 'fa-book',
            learning: 'fa-graduation-cap',
            'creative-work': 'fa-palette',
            work: 'fa-briefcase',
            housework: 'fa-home',
            socializing: 'fa-users',
            relaxation: 'fa-couch'
        };
        return icons[type] || 'fa-circle';
    }

    formatActivityName(type) {
        return type.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    getIntensityLabel(intensity) {
        const labels = {
            1: 'Very Light',
            2: 'Light',
            3: 'Moderate',
            4: 'Vigorous',
            5: 'Very Vigorous'
        };
        return labels[intensity] || 'Unknown';
    }

    showSuccessMessage(message) {
        // Create a temporary success message
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4ecdc4;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
        `;
        messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(messageDiv);
            }, 300);
        }, 3000);
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ActivityDashboard();
});

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);