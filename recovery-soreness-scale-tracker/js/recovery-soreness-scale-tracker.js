class RecoverySorenessScaleTracker {
    constructor() {
        this.ratings = this.loadRatings();
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDefaultDateTime();
        this.updateRatingSlider();
        this.updateTodayRatings();
        this.updateAnalysis();
        this.updateTrends();
        this.updateMuscleAnalysis();
        this.updateHistory();
        this.updateInsights();
    }

    setupEventListeners() {
        const sorenessForm = document.getElementById('soreness-form');
        sorenessForm.addEventListener('submit', (e) => this.handleSorenessSubmit(e));

        const ratingSlider = document.getElementById('soreness-rating');
        ratingSlider.addEventListener('input', () => this.updateRatingSlider());

        const trendPeriodSelect = document.getElementById('trend-period');
        trendPeriodSelect.addEventListener('change', () => this.updateTrends());
    }

    setDefaultDateTime() {
        const now = new Date();
        const dateInput = document.getElementById('log-date');
        const timeInput = document.getElementById('log-time');

        dateInput.value = now.toISOString().split('T')[0];
        timeInput.value = now.toTimeString().slice(0, 5);
    }

    updateRatingSlider() {
        const slider = document.getElementById('soreness-rating');
        const display = document.getElementById('rating-value');
        display.textContent = slider.value;
    }

    handleSorenessSubmit(e) {
        e.preventDefault();

        const ratingData = this.getRatingData();
        this.ratings.push(ratingData);
        this.saveRatings();

        this.resetForm();
        this.updateTodayRatings();
        this.updateAnalysis();
        this.updateTrends();
        this.updateMuscleAnalysis();
        this.updateHistory();
        this.updateInsights();

        this.showSuccessMessage('Soreness rating logged successfully!');
    }

    getRatingData() {
        const muscleGroups = Array.from(document.querySelectorAll('input[name="muscle-group"]:checked'))
            .map(checkbox => checkbox.value);

        return {
            id: Date.now(),
            date: document.getElementById('log-date').value,
            time: document.getElementById('log-time').value,
            muscleGroups: muscleGroups,
            rating: parseInt(document.getElementById('soreness-rating').value),
            activity: document.getElementById('activity-type').value,
            notes: document.getElementById('soreness-notes').value,
            timestamp: new Date().toISOString()
        };
    }

    resetForm() {
        document.getElementById('soreness-form').reset();
        this.setDefaultDateTime();
        this.updateRatingSlider();

        // Uncheck all muscle group checkboxes
        document.querySelectorAll('input[name="muscle-group"]').forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    updateTodayRatings() {
        const today = new Date().toISOString().split('T')[0];
        const todayRatings = this.ratings.filter(rating => rating.date === today);

        const container = document.getElementById('today-ratings');

        if (todayRatings.length === 0) {
            container.innerHTML = '<p class="no-data">No soreness ratings logged today. Start tracking your recovery!</p>';
            return;
        }

        // Sort by time (most recent first)
        todayRatings.sort((a, b) => b.time.localeCompare(a.time));

        container.innerHTML = todayRatings.map(rating => this.createRatingHTML(rating)).join('');
    }

    createRatingHTML(rating) {
        const muscleTags = rating.muscleGroups.map(group =>
            `<span class="muscle-tag">${this.formatMuscleGroup(group)}</span>`
        ).join('');

        return `
            <div class="rating-item" data-id="${rating.id}">
                <div class="rating-time">${rating.time}</div>
                <div class="rating-details">
                    <div class="rating-muscle-groups">${muscleTags}</div>
                    <div class="rating-score soreness-${rating.rating}">${rating.rating}/10</div>
                    <div class="rating-activity">${this.formatActivity(rating.activity)}</div>
                </div>
                <div class="rating-actions">
                    <button class="delete-btn" onclick="tracker.deleteRating(${rating.id})">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    }

    deleteRating(ratingId) {
        this.ratings = this.ratings.filter(rating => rating.id !== ratingId);
        this.saveRatings();
        this.updateTodayRatings();
        this.updateAnalysis();
        this.updateTrends();
        this.updateMuscleAnalysis();
        this.updateHistory();
        this.updateInsights();
        this.showSuccessMessage('Rating deleted successfully!');
    }

    updateAnalysis() {
        const today = new Date().toISOString().split('T')[0];
        const todayRatings = this.ratings.filter(rating => rating.date === today);

        if (todayRatings.length === 0) {
            document.getElementById('avg-soreness').textContent = '0.0';
            document.getElementById('muscle-groups-count').textContent = '0';
            document.getElementById('recovery-status').textContent = 'No data';
            document.getElementById('days-since-peak').textContent = '0';
            return;
        }

        // Calculate average soreness
        const avgSoreness = todayRatings.reduce((sum, rating) => sum + rating.rating, 0) / todayRatings.length;

        // Count unique muscle groups
        const allMuscleGroups = todayRatings.flatMap(rating => rating.muscleGroups);
        const uniqueMuscleGroups = new Set(allMuscleGroups).size;

        // Determine recovery status
        const recoveryStatus = this.getRecoveryStatus(avgSoreness);

        // Calculate days since peak soreness
        const daysSincePeak = this.getDaysSincePeakSoreness();

        document.getElementById('avg-soreness').textContent = avgSoreness.toFixed(1);
        document.getElementById('muscle-groups-count').textContent = uniqueMuscleGroups;
        document.getElementById('recovery-status').textContent = recoveryStatus;
        document.getElementById('days-since-peak').textContent = daysSincePeak;
    }

    getRecoveryStatus(avgSoreness) {
        if (avgSoreness <= 2) return 'Excellent';
        if (avgSoreness <= 4) return 'Good';
        if (avgSoreness <= 6) return 'Fair';
        if (avgSoreness <= 8) return 'Poor';
        return 'Needs Recovery';
    }

    getDaysSincePeakSoreness() {
        if (this.ratings.length === 0) return 0;

        // Find the most recent peak soreness rating (8+)
        const peakRatings = this.ratings
            .filter(rating => rating.rating >= 8)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (peakRatings.length === 0) return 0;

        const lastPeakDate = new Date(peakRatings[0].date);
        const today = new Date();
        const diffTime = Math.abs(today - lastPeakDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    updateTrends() {
        const period = parseInt(document.getElementById('trend-period').value);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - period);

        // Get ratings within the period
        const periodRatings = this.ratings.filter(rating => {
            const ratingDate = new Date(rating.date);
            return ratingDate >= startDate && ratingDate <= endDate;
        });

        if (periodRatings.length === 0) {
            this.clearTrendsChart();
            return;
        }

        // Group by date and calculate daily averages
        const dailyStats = {};
        periodRatings.forEach(rating => {
            if (!dailyStats[rating.date]) {
                dailyStats[rating.date] = {
                    ratings: [],
                    sum: 0,
                    count: 0,
                    maxRating: 0
                };
            }

            dailyStats[rating.date].ratings.push(rating);
            dailyStats[rating.date].sum += rating.rating;
            dailyStats[rating.date].count++;
            dailyStats[rating.date].maxRating = Math.max(dailyStats[rating.date].maxRating, rating.rating);
        });

        // Prepare data for chart
        const dates = Object.keys(dailyStats).sort();
        const avgRatings = dates.map(date => dailyStats[date].sum / dailyStats[date].count);
        const maxRatings = dates.map(date => dailyStats[date].maxRating);

        this.updateTrendsChart(dates, avgRatings, maxRatings);
    }

    updateTrendsChart(dates, avgRatings, maxRatings) {
        const ctx = document.getElementById('soreness-chart').getContext('2d');

        if (this.charts.trends) {
            this.charts.trends.destroy();
        }

        this.charts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates.map(date => this.formatDate(date)),
                datasets: [{
                    label: 'Average Soreness',
                    data: avgRatings,
                    borderColor: 'rgba(229, 57, 53, 1)',
                    backgroundColor: 'rgba(229, 57, 53, 0.1)',
                    tension: 0.4,
                    fill: false
                }, {
                    label: 'Peak Soreness',
                    data: maxRatings,
                    borderColor: 'rgba(255, 112, 67, 1)',
                    backgroundColor: 'rgba(255, 112, 67, 0.1)',
                    tension: 0.4,
                    fill: false,
                    pointStyle: 'triangle',
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Soreness Trends Over Time',
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
                        title: {
                            display: true,
                            text: 'Soreness Rating (1-10)'
                        },
                        min: 0,
                        max: 10,
                        ticks: {
                            stepSize: 1
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

    clearTrendsChart() {
        const ctx = document.getElementById('soreness-chart').getContext('2d');

        if (this.charts.trends) {
            this.charts.trends.destroy();
        }

        // Show empty chart
        this.charts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'No data available for selected period',
                        font: {
                            size: 14
                        }
                    }
                }
            }
        });
    }

    updateMuscleAnalysis() {
        if (this.ratings.length === 0) {
            this.clearMuscleChart();
            return;
        }

        // Count occurrences of each muscle group
        const muscleCounts = {};
        this.ratings.forEach(rating => {
            rating.muscleGroups.forEach(group => {
                muscleCounts[group] = (muscleCounts[group] || 0) + 1;
            });
        });

        const labels = Object.keys(muscleCounts).map(group => this.formatMuscleGroup(group));
        const data = Object.values(muscleCounts);

        this.updateMuscleChart(labels, data);
    }

    updateMuscleChart(labels, data) {
        const ctx = document.getElementById('muscle-chart').getContext('2d');

        if (this.charts.muscle) {
            this.charts.muscle.destroy();
        }

        this.charts.muscle = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#e53935', '#ff7043', '#ff8a65', '#ffab91',
                        '#ffccbc', '#fce4ec', '#f8bbd9', '#e1bee7'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Muscle Groups Affected',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    clearMuscleChart() {
        const ctx = document.getElementById('muscle-chart').getContext('2d');

        if (this.charts.muscle) {
            this.charts.muscle.destroy();
        }

        // Show empty chart
        this.charts.muscle = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['No data'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#e0e0e0']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'No muscle group data available',
                        font: {
                            size: 14
                        }
                    }
                }
            }
        });
    }

    updateHistory() {
        const container = document.getElementById('history-list');

        if (this.ratings.length === 0) {
            container.innerHTML = '<p class="no-data">No soreness ratings yet. Start logging to see your history.</p>';
            return;
        }

        // Group by date and take last 7 days
        const dateGroups = {};
        this.ratings.forEach(rating => {
            if (!dateGroups[rating.date]) {
                dateGroups[rating.date] = [];
            }
            dateGroups[rating.date].push(rating);
        });

        const dates = Object.keys(dateGroups).sort().reverse().slice(0, 7);

        container.innerHTML = dates.map(date => this.createHistoryItemHTML(date, dateGroups[date])).join('');
    }

    createHistoryItemHTML(date, ratings) {
        const avgRating = ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length;
        const maxRating = Math.max(...ratings.map(r => r.rating));
        const uniqueMuscles = new Set(ratings.flatMap(r => r.muscleGroups)).size;

        const ratingsHTML = ratings
            .sort((a, b) => b.time.localeCompare(a.time))
            .map(rating => `
                <div class="history-rating">
                    <div class="history-rating-time">${rating.time}</div>
                    <div class="history-rating-muscles">
                        ${rating.muscleGroups.map(group => `<span class="muscle-tag">${this.formatMuscleGroup(group)}</span>`).join('')}
                    </div>
                    <div class="history-rating-score soreness-${rating.rating}">${rating.rating}</div>
                </div>
            `).join('');

        return `
            <div class="history-item">
                <div class="history-header">
                    <div class="history-date">${this.formatDate(date)}</div>
                </div>
                <div class="history-stats">
                    <div class="stat-item"><span>Average:</span> <span>${avgRating.toFixed(1)}</span></div>
                    <div class="stat-item"><span>Peak:</span> <span>${maxRating}</span></div>
                    <div class="stat-item"><span>Ratings:</span> <span>${ratings.length}</span></div>
                    <div class="stat-item"><span>Muscle Groups:</span> <span>${uniqueMuscles}</span></div>
                </div>
                <div class="history-ratings">${ratingsHTML}</div>
            </div>
        `;
    }

    updateInsights() {
        const insightsContainer = document.getElementById('insights-content');

        if (this.ratings.length < 7) {
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

        // Analyze training frequency
        const trainingFrequency = this.analyzeTrainingFrequency();
        if (trainingFrequency) {
            insights.push(trainingFrequency);
        }

        // Check for overtraining signs
        const overtraining = this.analyzeOvertrainingRisk();
        if (overtraining) {
            insights.push(overtraining);
        }

        // Recovery progress analysis
        const recovery = this.analyzeRecoveryProgress();
        if (recovery) {
            insights.push(recovery);
        }

        // Muscle group imbalance
        const imbalance = this.analyzeMuscleImbalance();
        if (imbalance) {
            insights.push(imbalance);
        }

        return insights;
    }

    analyzeTrainingFrequency() {
        const recentRatings = this.getRecentRatings(14); // Last 14 days
        if (recentRatings.length < 7) return null;

        const highSorenessDays = recentRatings.filter(r => r.rating >= 7).length;
        const totalDays = recentRatings.length;

        const highSorenessRatio = highSorenessDays / totalDays;

        if (highSorenessRatio > 0.5) {
            return {
                title: '⚠️ High Soreness Frequency',
                description: `You've experienced high soreness (${Math.round(highSorenessRatio * 100)}% of days) in the past 2 weeks. Consider reducing training intensity or increasing recovery time.`
            };
        } else if (highSorenessRatio < 0.1) {
            return {
                title: '✅ Good Recovery Pattern',
                description: 'Your soreness levels indicate good recovery between training sessions. You\'re maintaining an optimal training frequency.'
            };
        }

        return null;
    }

    analyzeOvertrainingRisk() {
        const recentRatings = this.getRecentRatings(7); // Last 7 days
        if (recentRatings.length < 5) return null;

        const avgSoreness = recentRatings.reduce((sum, r) => sum + r.rating, 0) / recentRatings.length;
        const maxSoreness = Math.max(...recentRatings.map(r => r.rating));

        if (avgSoreness >= 6 && maxSoreness >= 9) {
            return {
                title: '🚨 Overtraining Risk',
                description: 'Your recent soreness levels are consistently high. This may indicate overtraining. Consider taking a deload week or consulting a trainer.'
            };
        }

        return null;
    }

    analyzeRecoveryProgress() {
        const recentRatings = this.getRecentRatings(10); // Last 10 days
        if (recentRatings.length < 5) return null;

        // Check if soreness is trending downward
        const firstHalf = recentRatings.slice(0, Math.floor(recentRatings.length / 2));
        const secondHalf = recentRatings.slice(Math.floor(recentRatings.length / 2));

        const firstAvg = firstHalf.reduce((sum, r) => sum + r.rating, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, r) => sum + r.rating, 0) / secondHalf.length;

        const improvement = firstAvg - secondAvg;

        if (improvement > 1) {
            return {
                title: '📈 Improving Recovery',
                description: `Your average soreness has decreased by ${improvement.toFixed(1)} points recently. Your recovery strategies are working well!`
            };
        }

        return null;
    }

    analyzeMuscleImbalance() {
        const recentRatings = this.getRecentRatings(30); // Last 30 days
        if (recentRatings.length < 10) return null;

        const muscleCounts = {};
        recentRatings.forEach(rating => {
            rating.muscleGroups.forEach(group => {
                muscleCounts[group] = (muscleCounts[group] || 0) + rating.rating;
            });
        });

        const sortedMuscles = Object.entries(muscleCounts)
            .sort(([,a], [,b]) => b - a);

        if (sortedMuscles.length >= 2) {
            const topMuscle = sortedMuscles[0];
            const secondMuscle = sortedMuscles[1];

            const ratio = topMuscle[1] / secondMuscle[1];

            if (ratio > 3) {
                return {
                    title: '⚖️ Muscle Group Imbalance',
                    description: `${this.formatMuscleGroup(topMuscle[0])} is experiencing significantly more soreness than other muscle groups. Consider balancing your training program.`
                };
            }
        }

        return null;
    }

    getRecentRatings(days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return this.ratings.filter(rating => new Date(rating.date) >= cutoffDate);
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

    formatMuscleGroup(group) {
        const groups = {
            'chest': 'Chest',
            'back': 'Back',
            'shoulders': 'Shoulders',
            'arms': 'Arms',
            'core': 'Core',
            'legs': 'Legs',
            'glutes': 'Glutes',
            'calves': 'Calves'
        };
        return groups[group] || group;
    }

    formatActivity(activity) {
        const activities = {
            'weight-training': 'Weight Training',
            'cardio': 'Cardio',
            'running': 'Running',
            'cycling': 'Cycling',
            'swimming': 'Swimming',
            'yoga': 'Yoga/Pilates',
            'sports': 'Sports',
            'other': 'Other'
        };
        return activities[activity] || activity;
    }

    // Data persistence methods
    loadRatings() {
        const stored = localStorage.getItem('recovery-soreness-ratings');
        return stored ? JSON.parse(stored) : [];
    }

    saveRatings() {
        localStorage.setItem('recovery-soreness-ratings', JSON.stringify(this.ratings));
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
            messageEl.style.backgroundColor = '#e53935';
        } else {
            messageEl.style.backgroundColor = '#f44336';
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

// Initialize the tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.tracker = new RecoverySorenessScaleTracker();
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