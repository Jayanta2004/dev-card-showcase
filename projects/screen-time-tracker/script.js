// Screen Time Tracker JavaScript
class ScreenTimeTracker {
    constructor() {
        this.activities = this.loadActivities();
        this.dailyLimit = 8; // hours - can be customized
        this.charts = {};
        this.wellnessTips = [
            "🌅 Start your day with natural light to regulate your circadian rhythm.",
            "📵 Keep phones out of the bedroom to improve sleep quality.",
            "🏃‍♂️ Replace screen time with physical activities you enjoy.",
            "📚 Set specific times for checking social media instead of constant scrolling.",
            "🎵 Listen to podcasts or audiobooks during commutes instead of screens.",
            "👥 Schedule regular face-to-face interactions with friends and family.",
            "🧘 Practice mindfulness and meditation to reduce the urge to check devices.",
            "📝 Keep a journal to track how you feel after reducing screen time.",
            "🎨 Pick up a creative hobby that doesn't involve screens.",
            "🚶 Take regular walks in nature to recharge and disconnect."
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDefaultDate();
        this.updateUI();
        this.updateCharts();
        this.rotateWellnessTips();
    }

    setupEventListeners() {
        // Screen time form submission
        document.getElementById('screenTimeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addActivity();
        });
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    addActivity() {
        const appName = document.getElementById('appName').value.trim();
        const category = document.getElementById('category').value;
        const hours = parseFloat(document.getElementById('hours').value) || 0;
        const minutes = parseInt(document.getElementById('minutes').value) || 0;
        const date = document.getElementById('date').value;

        if (!appName || !category || !date) {
            alert('Please fill in all required fields.');
            return;
        }

        const totalMinutes = (hours * 60) + minutes;
        if (totalMinutes <= 0) {
            alert('Please enter a valid time duration.');
            return;
        }

        const activity = {
            id: Date.now(),
            appName: appName,
            category: category,
            hours: hours,
            minutes: minutes,
            totalMinutes: totalMinutes,
            date: date,
            timestamp: new Date().toISOString()
        };

        this.activities.push(activity);
        this.saveActivities();
        this.updateUI();
        this.updateCharts();

        // Reset form
        document.getElementById('screenTimeForm').reset();
        this.setDefaultDate();

        alert('Activity logged successfully!');
    }

    updateUI() {
        this.updateTodaySummary();
        this.updateStatistics();
        this.displayRecentActivities();
        this.updateCategoryBreakdown();
    }

    updateTodaySummary() {
        const today = new Date().toISOString().split('T')[0];
        const todayActivities = this.activities.filter(a => a.date === today);

        const totalMinutes = todayActivities.reduce((sum, a) => sum + a.totalMinutes, 0);
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        const uniqueApps = new Set(todayActivities.map(a => a.appName)).size;

        // Format total time
        let totalTimeStr = '--';
        if (totalMinutes > 0) {
            if (totalHours > 0) {
                totalTimeStr = `${totalHours}h ${remainingMinutes}m`;
            } else {
                totalTimeStr = `${remainingMinutes}m`;
            }
        }

        // Daily limit status
        const limitHours = this.dailyLimit;
        const limitMinutes = limitHours * 60;
        let limitStatus = '--';
        let limitClass = '';

        if (totalMinutes > 0) {
            if (totalMinutes <= limitMinutes * 0.8) {
                limitStatus = 'Good';
                limitClass = 'limit-good';
            } else if (totalMinutes <= limitMinutes) {
                limitStatus = 'Near Limit';
                limitClass = 'limit-warning';
            } else {
                limitStatus = 'Exceeded';
                limitClass = 'limit-exceeded';
            }
        }

        document.getElementById('todayTotal').textContent = totalTimeStr;
        document.getElementById('todayLimit').innerHTML = `<span class="${limitClass}">${limitStatus}</span>`;
        document.getElementById('todayApps').textContent = uniqueApps || '--';
    }

    updateStatistics() {
        if (this.activities.length === 0) {
            document.getElementById('avgDaily').textContent = '--';
            document.getElementById('mostUsed').textContent = '--';
            document.getElementById('limitDays').textContent = '--';
            document.getElementById('weeklyTrend').textContent = '--';
            return;
        }

        // Calculate average daily usage
        const dateGroups = this.groupByDate();
        const avgDailyMinutes = Object.values(dateGroups).reduce((sum, activities) => {
            return sum + activities.reduce((daySum, a) => daySum + a.totalMinutes, 0);
        }, 0) / Object.keys(dateGroups).length;

        const avgHours = Math.floor(avgDailyMinutes / 60);
        const avgMins = Math.round(avgDailyMinutes % 60);
        const avgStr = avgHours > 0 ? `${avgHours}h ${avgMins}m` : `${avgMins}m`;

        // Find most used app
        const appUsage = {};
        this.activities.forEach(a => {
            appUsage[a.appName] = (appUsage[a.appName] || 0) + a.totalMinutes;
        });
        const mostUsedApp = Object.entries(appUsage).sort(([,a], [,b]) => b - a)[0]?.[0] || '--';

        // Calculate days under limit
        const limitMinutes = this.dailyLimit * 60;
        const daysUnderLimit = Object.values(dateGroups).filter(activities => {
            const dayTotal = activities.reduce((sum, a) => sum + a.totalMinutes, 0);
            return dayTotal <= limitMinutes;
        }).length;

        // Weekly trend (compare last 7 days to previous 7 days)
        const weeklyTrend = this.calculateWeeklyTrend();

        document.getElementById('avgDaily').textContent = avgStr;
        document.getElementById('mostUsed').textContent = mostUsedApp;
        document.getElementById('limitDays').textContent = `${daysUnderLimit}/${Object.keys(dateGroups).length}`;
        document.getElementById('weeklyTrend').innerHTML = weeklyTrend;
    }

    calculateWeeklyTrend() {
        const now = new Date();
        const lastWeekStart = new Date(now);
        lastWeekStart.setDate(now.getDate() - 7);
        const prevWeekStart = new Date(lastWeekStart);
        prevWeekStart.setDate(lastWeekStart.getDate() - 7);

        const lastWeekActivities = this.activities.filter(a => {
            const date = new Date(a.date);
            return date >= lastWeekStart && date <= now;
        });

        const prevWeekActivities = this.activities.filter(a => {
            const date = new Date(a.date);
            return date >= prevWeekStart && date < lastWeekStart;
        });

        const lastWeekTotal = lastWeekActivities.reduce((sum, a) => sum + a.totalMinutes, 0);
        const prevWeekTotal = prevWeekActivities.reduce((sum, a) => sum + a.totalMinutes, 0);

        if (prevWeekTotal === 0) return '<span style="color: var(--success)">📈 Improving</span>';

        const change = ((lastWeekTotal - prevWeekTotal) / prevWeekTotal) * 100;
        if (change < -10) {
            return '<span style="color: var(--success)">📈 Improving</span>';
        } else if (change > 10) {
            return '<span style="color: var(--warning)">📉 Increasing</span>';
        } else {
            return '<span style="color: var(--secondary)">➡️ Stable</span>';
        }
    }

    groupByDate() {
        return this.activities.reduce((groups, activity) => {
            if (!groups[activity.date]) {
                groups[activity.date] = [];
            }
            groups[activity.date].push(activity);
            return groups;
        }, {});
    }

    updateCharts() {
        this.updateDailyChart();
        this.updateAppChart();
    }

    updateDailyChart() {
        const ctx = document.getElementById('dailyChart').getContext('2d');

        if (this.charts.dailyChart) {
            this.charts.dailyChart.destroy();
        }

        // Get last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }

        const dailyTotals = last7Days.map(date => {
            const dayActivities = this.activities.filter(a => a.date === date);
            return dayActivities.reduce((sum, a) => sum + a.totalMinutes, 0) / 60; // Convert to hours
        });

        const labels = last7Days.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
        });

        this.charts.dailyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Screen Time (hours)',
                    data: dailyTotals,
                    backgroundColor: dailyTotals.map(hours => {
                        const limit = this.dailyLimit;
                        if (hours > limit) return 'rgba(255, 71, 87, 0.8)';
                        if (hours > limit * 0.8) return 'rgba(255, 167, 38, 0.8)';
                        return 'rgba(76, 175, 80, 0.8)';
                    }),
                    borderColor: dailyTotals.map(hours => {
                        const limit = this.dailyLimit;
                        if (hours > limit) return '#FF4757';
                        if (hours > limit * 0.8) return '#FFA726';
                        return '#4CAF50';
                    }),
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#fff',
                            font: {
                                size: 14
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: Math.max(this.dailyLimit + 2, Math.max(...dailyTotals) + 1),
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff',
                            callback: function(value) {
                                return value + 'h';
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    }
                }
            }
        });
    }

    updateAppChart() {
        const ctx = document.getElementById('appChart').getContext('2d');

        if (this.charts.appChart) {
            this.charts.appChart.destroy();
        }

        // Get app usage for last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }

        const recentActivities = this.activities.filter(a => last7Days.includes(a.date));
        const appUsage = {};

        recentActivities.forEach(activity => {
            appUsage[activity.appName] = (appUsage[activity.appName] || 0) + activity.totalMinutes;
        });

        const topApps = Object.entries(appUsage)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8);

        const colors = [
            '#FF6B6B', '#4ECDC4', '#FFE66D', '#9C27B0',
            '#FFA726', '#4CAF50', '#2196F3', '#FF9800'
        ];

        this.charts.appChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: topApps.map(([app]) => app),
                datasets: [{
                    data: topApps.map(([, minutes]) => minutes),
                    backgroundColor: colors.slice(0, topApps.length),
                    borderColor: colors.slice(0, topApps.length),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#fff',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const minutes = context.parsed;
                                const hours = Math.floor(minutes / 60);
                                const mins = minutes % 60;
                                const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                                return `${context.label}: ${timeStr}`;
                            }
                        }
                    }
                }
            }
        });
    }

    updateCategoryBreakdown() {
        const categoryBreakdown = document.getElementById('categoryBreakdown');

        // Get data for last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }

        const recentActivities = this.activities.filter(a => last7Days.includes(a.date));
        const categoryTotals = {};

        recentActivities.forEach(activity => {
            categoryTotals[activity.category] = (categoryTotals[activity.category] || 0) + activity.totalMinutes;
        });

        const totalMinutes = Object.values(categoryTotals).reduce((sum, mins) => sum + mins, 0);

        const categoryNames = {
            'social': 'Social Media',
            'entertainment': 'Entertainment',
            'work': 'Work',
            'gaming': 'Gaming',
            'education': 'Education',
            'other': 'Other'
        };

        const breakdownHTML = Object.entries(categoryTotals).map(([category, minutes]) => {
            const percentage = totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0;
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

            return `
                <div class="category-item">
                    <div class="category-name">${categoryNames[category] || category}</div>
                    <div class="category-time">${timeStr}</div>
                    <div class="category-percentage">${percentage}%</div>
                </div>
            `;
        }).join('');

        categoryBreakdown.innerHTML = breakdownHTML || '<p style="text-align: center; color: rgba(255,255,255,0.7);">No recent activity to display</p>';
    }

    displayRecentActivities() {
        const recentActivities = document.getElementById('recentActivities');

        if (this.activities.length === 0) {
            recentActivities.innerHTML = '<p class="no-data">No activities logged yet. Start tracking your screen time!</p>';
            return;
        }

        // Show last 10 activities
        const recent = this.activities.slice(-10).reverse();

        recentActivities.innerHTML = recent.map(activity => {
            const date = new Date(activity.date);
            const formattedDate = date.toLocaleDateString();
            const hours = Math.floor(activity.totalMinutes / 60);
            const minutes = activity.totalMinutes % 60;
            const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

            return `
                <div class="activity-item">
                    <div class="activity-info">
                        <div class="activity-app">${activity.appName}</div>
                        <span class="activity-category category-${activity.category}">${activity.category}</span>
                        <div class="activity-time">${timeStr}</div>
                    </div>
                    <div class="activity-meta">
                        <div>${formattedDate}</div>
                        <button class="delete-btn" onclick="screenTracker.deleteActivity(${activity.id})">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    deleteActivity(activityId) {
        if (confirm('Are you sure you want to delete this activity?')) {
            this.activities = this.activities.filter(a => a.id !== activityId);
            this.saveActivities();
            this.updateUI();
            this.updateCharts();
        }
    }

    rotateWellnessTips() {
        const tipsContainer = document.getElementById('wellnessTips');
        const shuffledTips = this.wellnessTips.sort(() => 0.5 - Math.random()).slice(0, 3);

        const tipsHTML = shuffledTips.map(tip => {
            const emoji = tip.split(' ')[0];
            const content = tip.substring(tip.indexOf(' ') + 1);
            const title = content.split('.')[0];
            const description = content.substring(content.indexOf('.') + 1).trim();

            return `
                <div class="tip-card">
                    <div class="tip-icon">${emoji}</div>
                    <div class="tip-content">
                        <h4>${title}</h4>
                        <p>${description}</p>
                    </div>
                </div>
            `;
        }).join('');

        tipsContainer.innerHTML = tipsHTML;
    }

    saveActivities() {
        localStorage.setItem('screenTimeActivities', JSON.stringify(this.activities));
    }

    loadActivities() {
        const saved = localStorage.getItem('screenTimeActivities');
        return saved ? JSON.parse(saved) : [];
    }

    // Export data functionality
    exportData() {
        const dataStr = JSON.stringify(this.activities, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `screen-time-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Initialize the app
const screenTracker = new ScreenTimeTracker();