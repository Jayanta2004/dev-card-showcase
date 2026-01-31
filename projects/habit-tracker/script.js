// Habit Tracker JavaScript
class HabitTracker {
    constructor() {
        this.habits = this.loadHabits();
        this.completions = this.loadCompletions();
        this.chart = null;
        this.motivationMessages = [
            "🌟 Every expert was once a beginner. Keep going!",
            "💪 Small daily improvements lead to stunning results.",
            "🎯 Consistency beats perfection every time.",
            "🚀 You're building habits that will change your life.",
            "⭐ One day at a time, one habit at a time.",
            "🔥 Your future self will thank you for this.",
            "🌈 Progress is progress, no matter how small.",
            "⚡ Momentum is building. Stay consistent!",
            "🎉 You're stronger than you think. Keep pushing!",
            "💎 Diamonds are formed under pressure. So are habits."
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUI();
        this.updateChart();
        this.generateMotivation();
    }

    setupEventListeners() {
        // Habit form submission
        document.getElementById('habitForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createHabit();
        });

        // Frequency change handler
        document.getElementById('habitFrequency').addEventListener('change', (e) => {
            const customDaysGroup = document.getElementById('customDaysGroup');
            customDaysGroup.style.display = e.target.value === 'custom' ? 'block' : 'none';
        });
    }

    createHabit() {
        const name = document.getElementById('habitName').value.trim();
        const category = document.getElementById('habitCategory').value;
        const frequency = document.getElementById('habitFrequency').value;
        const target = parseInt(document.getElementById('habitTarget').value) || null;

        if (!name || !category || !frequency) {
            alert('Please fill in all required fields.');
            return;
        }

        let customDays = [];
        if (frequency === 'custom') {
            customDays = Array.from(document.querySelectorAll('#customDaysGroup input:checked'))
                .map(cb => cb.value);
            if (customDays.length === 0) {
                alert('Please select at least one day for custom schedule.');
                return;
            }
        }

        const habit = {
            id: Date.now(),
            name: name,
            category: category,
            frequency: frequency,
            customDays: customDays,
            target: target,
            createdAt: new Date().toISOString(),
            streak: 0,
            longestStreak: 0,
            totalCompletions: 0
        };

        this.habits.push(habit);
        this.saveHabits();
        this.updateUI();

        // Reset form
        document.getElementById('habitForm').reset();
        document.getElementById('customDaysGroup').style.display = 'none';

        alert('Habit created successfully! Start building your streak today.');
    }

    toggleHabitCompletion(habitId, date = null) {
        const targetDate = date || new Date().toDateString();
        const completionKey = `${habitId}_${targetDate}`;

        if (this.completions[completionKey]) {
            // Mark as incomplete
            delete this.completions[completionKey];
            this.updateHabitStats(habitId);
        } else {
            // Mark as complete
            this.completions[completionKey] = {
                habitId: habitId,
                date: targetDate,
                completedAt: new Date().toISOString()
            };
            this.updateHabitStats(habitId);
        }

        this.saveCompletions();
        this.updateUI();
        this.updateChart();
        this.generateMotivation();
    }

    updateHabitStats(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        // Calculate current streak
        let currentStreak = 0;
        let longestStreak = habit.longestStreak || 0;
        let totalCompletions = 0;

        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateStr = checkDate.toDateString();

            if (this.isHabitDue(habit, checkDate) && this.completions[`${habitId}_${dateStr}`]) {
                currentStreak++;
                totalCompletions++;
            } else if (i === 0) {
                // Today is not completed, streak is 0
                currentStreak = 0;
            } else {
                // Gap in streak
                break;
            }
        }

        // Update longest streak if current is longer
        if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
        }

        habit.streak = currentStreak;
        habit.longestStreak = longestStreak;
        habit.totalCompletions = totalCompletions;
    }

    isHabitDue(habit, date) {
        const dayName = date.toLocaleLowerCase('en-US', { weekday: 'long' });

        switch (habit.frequency) {
            case 'daily':
                return true;
            case 'weekdays':
                return !['saturday', 'sunday'].includes(dayName);
            case 'weekends':
                return ['saturday', 'sunday'].includes(dayName);
            case 'custom':
                return habit.customDays.includes(dayName);
            default:
                return true;
        }
    }

    updateUI() {
        this.displayTodayHabits();
        this.displayAllHabits();
        this.updateStats();
    }

    displayTodayHabits() {
        const todayHabits = document.getElementById('todayHabits');
        const today = new Date();
        const todayStr = today.toDateString();

        const dueHabits = this.habits.filter(habit => this.isHabitDue(habit, today));

        if (dueHabits.length === 0) {
            todayHabits.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7);">No habits due today. Create your first habit above!</p>';
            return;
        }

        todayHabits.innerHTML = dueHabits.map(habit => {
            const isCompleted = !!this.completions[`${habit.id}_${todayStr}`];
            const categoryEmoji = this.getCategoryEmoji(habit.category);

            return `
                <div class="habit-item ${isCompleted ? 'completed' : ''}">
                    <div class="habit-info">
                        <div class="habit-name">${categoryEmoji} ${habit.name}</div>
                        <div class="habit-meta">
                            <span>Streak: ${habit.streak} days</span>
                            <span>Target: ${habit.target || 'N/A'}</span>
                        </div>
                    </div>
                    <input type="checkbox"
                           class="habit-checkbox"
                           ${isCompleted ? 'checked' : ''}
                           onchange="habitTracker.toggleHabitCompletion(${habit.id})">
                </div>
            `;
        }).join('');
    }

    displayAllHabits() {
        const allHabits = document.getElementById('allHabits');

        if (this.habits.length === 0) {
            allHabits.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7);">No habits created yet.</p>';
            return;
        }

        allHabits.innerHTML = this.habits.map(habit => {
            const categoryEmoji = this.getCategoryEmoji(habit.category);
            const completionRate = this.calculateCompletionRate(habit);

            return `
                <div class="habit-card">
                    <div class="habit-card-header">
                        <div class="habit-card-title">${categoryEmoji} ${habit.name}</div>
                        <div class="habit-card-category">${habit.category}</div>
                    </div>
                    <div class="habit-card-stats">
                        <div>Current Streak: ${habit.streak}</div>
                        <div>Longest Streak: ${habit.longestStreak}</div>
                        <div>Total: ${habit.totalCompletions}</div>
                        <div>Rate: ${completionRate}%</div>
                    </div>
                    <div class="habit-card-actions">
                        <button class="edit-btn" onclick="habitTracker.editHabit(${habit.id})">Edit</button>
                        <button class="delete-btn" onclick="habitTracker.deleteHabit(${habit.id})">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getCategoryEmoji(category) {
        const emojis = {
            'health': '🏥',
            'fitness': '💪',
            'learning': '📚',
            'productivity': '⚡',
            'mindfulness': '🧘',
            'social': '👥',
            'creativity': '🎨',
            'other': '📌'
        };
        return emojis[category] || '📌';
    }

    calculateCompletionRate(habit) {
        const createdDate = new Date(habit.createdAt);
        const today = new Date();
        const daysSinceCreation = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24)) + 1;

        if (daysSinceCreation === 0) return 0;

        return Math.round((habit.totalCompletions / daysSinceCreation) * 100);
    }

    updateStats() {
        const totalHabits = this.habits.length;
        const activeStreaks = this.habits.filter(h => h.streak > 0).length;
        const completionRates = this.habits.map(h => this.calculateCompletionRate(h));
        const avgCompletionRate = completionRates.length > 0 ?
            Math.round(completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length) : 0;
        const longestStreak = Math.max(...this.habits.map(h => h.longestStreak), 0);

        document.getElementById('totalHabits').textContent = totalHabits;
        document.getElementById('activeStreaks').textContent = activeStreaks;
        document.getElementById('completionRate').textContent = `${avgCompletionRate}%`;
        document.getElementById('longestStreak').textContent = longestStreak;
    }

    updateChart() {
        const weeklyData = this.getWeeklyProgress();
        const ctx = document.getElementById('progressChart').getContext('2d');

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: weeklyData.labels,
                datasets: [{
                    label: 'Habits Completed',
                    data: weeklyData.completed,
                    backgroundColor: 'rgba(255, 107, 107, 0.8)',
                    borderColor: '#FF6B6B',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }, {
                    label: 'Habits Due',
                    data: weeklyData.due,
                    backgroundColor: 'rgba(78, 205, 196, 0.3)',
                    borderColor: '#4ECDC4',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            ],
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
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff',
                            stepSize: 1
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

    getWeeklyProgress() {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const completed = new Array(7).fill(0);
        const due = new Array(7).fill(0);

        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));

        for (let i = 0; i < 7; i++) {
            const checkDate = new Date(startOfWeek);
            checkDate.setDate(startOfWeek.getDate() + i);
            const dateStr = checkDate.toDateString();

            this.habits.forEach(habit => {
                if (this.isHabitDue(habit, checkDate)) {
                    due[i]++;
                    if (this.completions[`${habit.id}_${dateStr}`]) {
                        completed[i]++;
                    }
                }
            });
        }

        return { labels: days, completed: completed, due: due };
    }

    generateMotivation() {
        const motivationCard = document.getElementById('motivationMessage');
        const randomMessage = this.motivationMessages[Math.floor(Math.random() * this.motivationMessages.length)];

        // Add streak-based motivation
        const longestStreak = Math.max(...this.habits.map(h => h.longestStreak), 0);
        let streakMessage = '';

        if (longestStreak >= 30) {
            streakMessage = " You're on fire with a 30+ day streak! 🔥";
        } else if (longestStreak >= 7) {
            streakMessage = " You're building momentum with your weekly streak! 💪";
        } else if (longestStreak >= 1) {
            streakMessage = " Every streak starts with a single day. Keep it up! 🌟";
        }

        motivationCard.innerHTML = `
            <h3>Keep Going!</h3>
            <p>${randomMessage}${streakMessage}</p>
        `;
    }

    editHabit(habitId) {
        // For now, just show an alert. Could be expanded to a full edit modal
        alert('Edit functionality coming soon! For now, delete and recreate the habit.');
    }

    deleteHabit(habitId) {
        if (confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
            this.habits = this.habits.filter(h => h.id !== habitId);

            // Remove all completions for this habit
            Object.keys(this.completions).forEach(key => {
                if (this.completions[key].habitId === habitId) {
                    delete this.completions[key];
                }
            });

            this.saveHabits();
            this.saveCompletions();
            this.updateUI();
            this.updateChart();
            this.generateMotivation();
        }
    }

    saveHabits() {
        localStorage.setItem('habitTrackerHabits', JSON.stringify(this.habits));
    }

    loadHabits() {
        const saved = localStorage.getItem('habitTrackerHabits');
        return saved ? JSON.parse(saved) : [];
    }

    saveCompletions() {
        localStorage.setItem('habitTrackerCompletions', JSON.stringify(this.completions));
    }

    loadCompletions() {
        const saved = localStorage.getItem('habitTrackerCompletions');
        return saved ? JSON.parse(saved) : {};
    }
}

// Initialize the app
const habitTracker = new HabitTracker();