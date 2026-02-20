// Mood Tracker JavaScript
class MoodTracker {
    constructor() {
        this.moodData = this.loadMoodData();
        this.moodValues = {
            'ecstatic': 8,
            'happy': 7,
            'content': 6,
            'neutral': 5,
            'sad': 3,
            'anxious': 2,
            'angry': 2,
            'depressed': 1
        };
        this.moodLabels = {
            'ecstatic': '🤩 Ecstatic',
            'happy': '😊 Happy',
            'content': '🙂 Content',
            'neutral': '😐 Neutral',
            'sad': '😢 Sad',
            'anxious': '😰 Anxious',
            'angry': '😠 Angry',
            'depressed': '😔 Depressed'
        };
        this.chart = null;
        this.selectedMood = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateChart();
        this.updateStats();
        this.generateInsights();
        this.displayHistory();
        this.checkTodayMood();
    }

    setupEventListeners() {
        // Mood selection
        document.querySelectorAll('.mood-option').forEach(option => {
            option.addEventListener('click', () => {
                this.selectMood(option.dataset.mood);
            });
        });

        // Save mood button
        document.getElementById('saveMoodBtn').addEventListener('click', () => {
            this.saveMood();
        });
    }

    selectMood(mood) {
        // Remove previous selection
        document.querySelectorAll('.mood-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Add selection to clicked option
        const selectedOption = document.querySelector(`[data-mood="${mood}"]`);
        selectedOption.classList.add('selected');

        this.selectedMood = mood;
    }

    saveMood() {
        if (!this.selectedMood) {
            alert('Please select a mood first.');
            return;
        }

        const today = new Date().toDateString();
        const notes = document.getElementById('moodNotes').value.trim();

        // Check if mood already exists for today
        const existingIndex = this.moodData.findIndex(entry =>
            new Date(entry.date).toDateString() === today
        );

        const moodEntry = {
            date: new Date().toISOString(),
            mood: this.selectedMood,
            value: this.moodValues[this.selectedMood],
            notes: notes
        };

        if (existingIndex >= 0) {
            this.moodData[existingIndex] = moodEntry;
        } else {
            this.moodData.push(moodEntry);
        }

        this.saveMoodData();
        this.updateChart();
        this.updateStats();
        this.generateInsights();
        this.displayHistory();

        // Reset form
        this.selectedMood = null;
        document.querySelectorAll('.mood-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.getElementById('moodNotes').value = '';

        alert('Mood saved successfully! Keep tracking to see your patterns.');
    }

    checkTodayMood() {
        const today = new Date().toDateString();
        const todayEntry = this.moodData.find(entry =>
            new Date(entry.date).toDateString() === today
        );

        if (todayEntry) {
            this.selectMood(todayEntry.mood);
            document.getElementById('moodNotes').value = todayEntry.notes || '';
        }
    }

    updateChart() {
        const weeklyData = this.getWeeklyData();
        const ctx = document.getElementById('moodChart').getContext('2d');

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weeklyData.labels,
                datasets: [{
                    label: 'Mood Level',
                    data: weeklyData.values,
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#FF6B6B',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 1,
                        max: 8,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff',
                            callback: function(value) {
                                const moodMap = {
                                    1: 'Depressed', 2: 'Low', 3: 'Sad',
                                    4: 'Neutral', 5: 'Neutral', 6: 'Content',
                                    7: 'Happy', 8: 'Ecstatic'
                                };
                                return moodMap[value] || value;
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

    getWeeklyData() {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const values = new Array(7).fill(null);

        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));

        this.moodData.forEach(entry => {
            const entryDate = new Date(entry.date);
            const dayDiff = Math.floor((entryDate - startOfWeek) / (1000 * 60 * 60 * 24));

            if (dayDiff >= 0 && dayDiff < 7) {
                values[dayDiff] = entry.value;
            }
        });

        return { labels: days, values: values };
    }

    updateStats() {
        const currentStreak = this.calculateCurrentStreak();
        const averageMood = this.calculateAverageMood();
        const bestDay = this.findBestDay();

        document.getElementById('currentStreak').textContent = `${currentStreak} days`;
        document.getElementById('averageMood').textContent = averageMood;
        document.getElementById('bestDay').textContent = bestDay;
    }

    calculateCurrentStreak() {
        if (this.moodData.length === 0) return 0;

        let streak = 0;
        const today = new Date();

        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);

            const entry = this.moodData.find(entry =>
                new Date(entry.date).toDateString() === checkDate.toDateString()
            );

            if (entry) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    calculateAverageMood() {
        if (this.moodData.length === 0) return 'No data';

        const last7Days = this.moodData.filter(entry => {
            const entryDate = new Date(entry.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return entryDate >= weekAgo;
        });

        if (last7Days.length === 0) return 'No recent data';

        const avg = last7Days.reduce((sum, entry) => sum + entry.value, 0) / last7Days.length;

        if (avg >= 7) return 'Happy';
        if (avg >= 5) return 'Content';
        if (avg >= 4) return 'Neutral';
        if (avg >= 2.5) return 'Low';
        return 'Needs attention';
    }

    findBestDay() {
        if (this.moodData.length === 0) return 'N/A';

        const bestEntry = this.moodData.reduce((best, current) =>
            current.value > best.value ? current : best
        );

        const bestDate = new Date(bestEntry.date);
        return bestDate.toLocaleDateString();
    }

    generateInsights() {
        const insights = [];
        const weeklyData = this.getWeeklyData();

        // Check for improving trend
        const recentValues = weeklyData.values.filter(v => v !== null);
        if (recentValues.length >= 3) {
            const trend = this.calculateTrend(recentValues);
            if (trend > 0.5) {
                insights.push({
                    title: '📈 Improving Trend',
                    text: 'Your mood has been trending upward this week. Keep up the positive momentum!'
                });
            } else if (trend < -0.5) {
                insights.push({
                    title: '📉 Declining Trend',
                    text: 'Your mood has been lower this week. Consider reaching out to friends or trying some relaxation techniques.'
                });
            }
        }

        // Check for consistency
        const consistency = this.calculateConsistency(weeklyData.values);
        if (consistency > 0.8) {
            insights.push({
                title: '🎯 Consistent Tracking',
                text: 'You\'ve been tracking your mood consistently. This awareness is key to emotional well-being!'
            });
        }

        // Check for high/low periods
        const avgMood = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
        if (avgMood >= 6) {
            insights.push({
                title: '🌟 Positive Week',
                text: 'You\'ve been feeling great this week! Consider what\'s contributing to your positive mood.'
            });
        } else if (avgMood <= 3) {
            insights.push({
                title: '🤝 Support Recommended',
                text: 'Your mood has been low recently. Don\'t hesitate to talk to someone you trust or seek professional help if needed.'
            });
        }

        // Default insight if no specific patterns
        if (insights.length === 0) {
            insights.push({
                title: '🔄 Keep Tracking',
                text: 'Continue tracking your mood to identify patterns and improve your emotional awareness.'
            });
        }

        this.displayInsights(insights);
    }

    calculateTrend(values) {
        if (values.length < 2) return 0;

        let trend = 0;
        for (let i = 1; i < values.length; i++) {
            trend += values[i] - values[i-1];
        }
        return trend / (values.length - 1);
    }

    calculateConsistency(values) {
        const nonNullValues = values.filter(v => v !== null);
        return nonNullValues.length / values.length;
    }

    displayInsights(insights) {
        const container = document.getElementById('weeklyInsights');
        container.innerHTML = insights.map(insight => `
            <div class="insight-card">
                <div class="insight-title">${insight.title}</div>
                <div class="insight-text">${insight.text}</div>
            </div>
        `).join('');
    }

    displayHistory() {
        const container = document.getElementById('moodHistory');

        if (this.moodData.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7);">No mood entries yet. Start tracking today!</p>';
            return;
        }

        const sortedData = this.moodData.sort((a, b) => new Date(b.date) - new Date(a.date));

        container.innerHTML = sortedData.slice(0, 10).map(entry => {
            const date = new Date(entry.date);
            return `
                <div class="history-item">
                    <div class="history-date">${date.toLocaleDateString()}</div>
                    <div class="history-mood">
                        <div class="history-emoji">${this.moodLabels[entry.mood].split(' ')[0]}</div>
                        <div class="history-label">${this.moodLabels[entry.mood].split(' ').slice(1).join(' ')}</div>
                        ${entry.notes ? `<div class="history-notes">"${entry.notes}"</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    saveMoodData() {
        localStorage.setItem('moodTrackerData', JSON.stringify(this.moodData));
    }

    loadMoodData() {
        const saved = localStorage.getItem('moodTrackerData');
        return saved ? JSON.parse(saved) : [];
    }
}

// Initialize the app
const moodTracker = new MoodTracker();