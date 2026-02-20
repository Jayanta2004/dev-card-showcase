// Habit Tracker Analytics Dashboard

class HabitTracker {
    constructor() {
        this.habits = JSON.parse(localStorage.getItem('habits')) || [];
        this.currentEditingId = null;
        this.weeklyChart = null;
        this.monthlyChart = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderHabits();
        this.updateAnalytics();
        this.renderCharts();
        this.checkReminders();
        setInterval(() => this.checkReminders(), 60000); // Check every minute
    }

    setupEventListeners() {
        // Modal controls
        document.getElementById('addHabitBtn').addEventListener('click', () => this.openModal());
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('closeDetailModal').addEventListener('click', () => this.closeDetailModal());
        
        // Form submission
        document.getElementById('habitForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveHabit();
        });

        // Category filtering
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterByCategory(e.target.dataset.category);
            });
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());

        // Close modal on outside click
        document.getElementById('habitModal').addEventListener('click', (e) => {
            if (e.target.id === 'habitModal') this.closeModal();
        });
        document.getElementById('habitDetailModal').addEventListener('click', (e) => {
            if (e.target.id === 'habitDetailModal') this.closeDetailModal();
        });
    }

    openModal(habitId = null) {
        const modal = document.getElementById('habitModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('habitForm');
        
        if (habitId) {
            const habit = this.habits.find(h => h.id === habitId);
            modalTitle.textContent = 'Edit Habit';
            document.getElementById('habitName').value = habit.name;
            document.getElementById('habitCategory').value = habit.category;
            document.getElementById('habitGoal').value = habit.goal;
            document.getElementById('habitReminder').value = habit.reminder || '';
            document.getElementById('habitColor').value = habit.color;
            this.currentEditingId = habitId;
        } else {
            modalTitle.textContent = 'Add New Habit';
            form.reset();
            this.currentEditingId = null;
        }
        
        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('habitModal').classList.remove('active');
        document.getElementById('habitForm').reset();
        this.currentEditingId = null;
    }

    saveHabit() {
        const name = document.getElementById('habitName').value;
        const category = document.getElementById('habitCategory').value;
        const goal = parseInt(document.getElementById('habitGoal').value);
        const reminder = document.getElementById('habitReminder').value;
        const color = document.getElementById('habitColor').value;

        if (this.currentEditingId) {
            // Edit existing habit
            const habit = this.habits.find(h => h.id === this.currentEditingId);
            habit.name = name;
            habit.category = category;
            habit.goal = goal;
            habit.reminder = reminder;
            habit.color = color;
            this.showToast('Habit updated successfully!');
        } else {
            // Create new habit
            const habit = {
                id: Date.now(),
                name,
                category,
                goal,
                reminder,
                color,
                createdAt: new Date().toISOString(),
                completions: [],
                currentStreak: 0,
                longestStreak: 0
            };
            this.habits.push(habit);
            this.showToast('Habit created successfully!');
        }

        this.saveToLocalStorage();
        this.renderHabits();
        this.updateAnalytics();
        this.renderCharts();
        this.closeModal();
    }

    deleteHabit(id) {
        if (confirm('Are you sure you want to delete this habit?')) {
            this.habits = this.habits.filter(h => h.id !== id);
            this.saveToLocalStorage();
            this.renderHabits();
            this.updateAnalytics();
            this.renderCharts();
            this.showToast('Habit deleted successfully!');
        }
    }

    toggleCompletion(habitId, date) {
        const habit = this.habits.find(h => h.id === habitId);
        const dateStr = date || new Date().toISOString().split('T')[0];
        
        const index = habit.completions.indexOf(dateStr);
        if (index > -1) {
            habit.completions.splice(index, 1);
        } else {
            habit.completions.push(dateStr);
        }
        
        this.updateStreak(habit);
        this.saveToLocalStorage();
        this.renderHabits();
        this.updateAnalytics();
        this.renderCharts();
    }

    updateStreak(habit) {
        const sortedCompletions = habit.completions.sort().reverse();
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Calculate current streak
        for (let i = 0; i <= 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];
            
            if (sortedCompletions.includes(dateStr)) {
                currentStreak++;
            } else if (i > 0) {
                break;
            }
        }
        
        // Calculate longest streak
        if (sortedCompletions.length > 0) {
            tempStreak = 1;
            longestStreak = 1;
            
            for (let i = 1; i < sortedCompletions.length; i++) {
                const prevDate = new Date(sortedCompletions[i - 1]);
                const currDate = new Date(sortedCompletions[i]);
                const dayDiff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
                
                if (dayDiff === 1) {
                    tempStreak++;
                    longestStreak = Math.max(longestStreak, tempStreak);
                } else {
                    tempStreak = 1;
                }
            }
        }
        
        habit.currentStreak = currentStreak;
        habit.longestStreak = longestStreak;
    }

    renderHabits(filter = 'all') {
        const grid = document.getElementById('habitsGrid');
        const filteredHabits = filter === 'all' 
            ? this.habits 
            : this.habits.filter(h => h.category === filter);

        if (filteredHabits.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No habits yet</h3>
                    <p>Create your first habit to get started!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filteredHabits.map(habit => {
            const weekCompletion = this.getWeekCompletion(habit);
            const weekProgress = (weekCompletion / habit.goal) * 100;
            const lastSevenDays = this.getLastSevenDays();
            
            return `
                <div class="habit-card" style="border-color: ${habit.color}30">
                    <div class="habit-header">
                        <div class="habit-info">
                            <h3>${habit.name}</h3>
                            <span class="habit-category" style="background: ${habit.color}30; color: ${habit.color}">
                                ${habit.category}
                            </span>
                        </div>
                        <div class="habit-actions">
                            <button class="icon-btn" onclick="tracker.openModal(${habit.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="icon-btn" onclick="tracker.deleteHabit(${habit.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="habit-streak">
                        <i class="fas fa-fire"></i>
                        <span>${habit.currentStreak} day streak</span>
                    </div>
                    <div class="habit-progress">
                        <div class="progress-info">
                            <span>This Week: ${weekCompletion}/${habit.goal} days</span>
                            <span>${Math.round(weekProgress)}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${Math.min(weekProgress, 100)}%; background: linear-gradient(90deg, ${habit.color}, ${habit.color}dd)"></div>
                        </div>
                    </div>
                    <div class="habit-days">
                        ${lastSevenDays.map(day => {
                            const isCompleted = habit.completions.includes(day.date);
                            const isToday = day.isToday;
                            return `
                                <div class="day-badge ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}" 
                                     onclick="tracker.toggleCompletion(${habit.id}, '${day.date}')"
                                     title="${day.label}">
                                    ${day.day}
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <button class="btn btn-secondary" style="margin-top: 16px; width: 100%;" onclick="tracker.showHabitDetail(${habit.id})">
                        <i class="fas fa-chart-bar"></i> View Details
                    </button>
                </div>
            `;
        }).join('');
    }

    getLastSevenDays() {
        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            days.push({
                date: date.toISOString().split('T')[0],
                day: dayNames[date.getDay()],
                label: date.toDateString(),
                isToday: i === 0
            });
        }
        return days;
    }

    getWeekCompletion(habit) {
        const lastSeven = this.getLastSevenDays();
        return lastSeven.filter(day => habit.completions.includes(day.date)).length;
    }

    filterByCategory(category) {
        this.renderHabits(category);
    }

    updateAnalytics() {
        // Longest Streak
        const longestStreak = this.habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);
        document.getElementById('longestStreak').textContent = longestStreak;

        // Total Habits
        document.getElementById('totalHabits').textContent = this.habits.length;

        // Completion Rate
        if (this.habits.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            const completedToday = this.habits.filter(h => h.completions.includes(today)).length;
            const rate = Math.round((completedToday / this.habits.length) * 100);
            document.getElementById('completionRate').textContent = rate + '%';
        } else {
            document.getElementById('completionRate').textContent = '0%';
        }

        // Active Streaks
        const activeStreaks = this.habits.filter(h => h.currentStreak > 0).length;
        document.getElementById('activeStreak').textContent = activeStreaks;
    }

    renderCharts() {
        this.renderWeeklyChart();
        this.renderMonthlyChart();
    }

    renderWeeklyChart() {
        const canvas = document.getElementById('weeklyCanvas');
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = 300;
        
        const lastSeven = this.getLastSevenDays();
        const data = lastSeven.map(day => {
            return this.habits.filter(h => h.completions.includes(day.date)).length;
        });
        
        this.drawBarChart(ctx, canvas, lastSeven.map(d => d.day), data, '#6366f1');
    }

    renderMonthlyChart() {
        const canvas = document.getElementById('monthlyCanvas');
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = canvas.offsetWidth;
        canvas.height = 300;
        
        const last30Days = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            last30Days.push(date.toISOString().split('T')[0]);
        }
        
        const data = last30Days.map(date => {
            return this.habits.filter(h => h.completions.includes(date)).length;
        });
        
        const labels = last30Days.map((_, i) => i % 5 === 0 ? (i + 1).toString() : '');
        
        this.drawLineChart(ctx, canvas, labels, data, '#8b5cf6');
    }

    drawBarChart(ctx, canvas, labels, data, color) {
        const padding = 40;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;
        const maxValue = Math.max(...data, 1);
        const barWidth = chartWidth / data.length;
        
        // Draw axes
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        
        // Draw bars
        data.forEach((value, index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const x = padding + index * barWidth + barWidth * 0.2;
            const y = canvas.height - padding - barHeight;
            const width = barWidth * 0.6;
            
            // Gradient
            const gradient = ctx.createLinearGradient(0, y, 0, canvas.height - padding);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, color + '80');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, width, barHeight);
            
            // Label
            ctx.fillStyle = '#94a3b8';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(labels[index], x + width / 2, canvas.height - padding + 20);
            
            // Value
            if (value > 0) {
                ctx.fillStyle = '#f1f5f9';
                ctx.fillText(value, x + width / 2, y - 5);
            }
        });
    }

    drawLineChart(ctx, canvas, labels, data, color) {
        const padding = 40;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;
        const maxValue = Math.max(...data, 1);
        const pointSpacing = chartWidth / (data.length - 1);
        
        // Draw axes
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        
        // Draw line
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        data.forEach((value, index) => {
            const x = padding + index * pointSpacing;
            const y = canvas.height - padding - (value / maxValue) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw points and labels
        data.forEach((value, index) => {
            const x = padding + index * pointSpacing;
            const y = canvas.height - padding - (value / maxValue) * chartHeight;
            
            // Point
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Label
            if (labels[index]) {
                ctx.fillStyle = '#94a3b8';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(labels[index], x, canvas.height - padding + 20);
            }
        });
    }

    showHabitDetail(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        document.getElementById('detailHabitName').textContent = habit.name;
        document.getElementById('detailStreak').textContent = habit.currentStreak;
        document.getElementById('detailTotal').textContent = habit.completions.length;
        document.getElementById('detailBest').textContent = habit.longestStreak;
        
        this.renderDetailCalendar(habit);
        document.getElementById('habitDetailModal').classList.add('active');
    }

    renderDetailCalendar(habit) {
        const calendar = document.getElementById('detailCalendar');
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        let html = `
            <div class="calendar-header">
                <h3>${firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
            </div>
            <div class="calendar-grid">
        `;
        
        // Day headers
        dayNames.forEach(day => {
            html += `<div class="calendar-day header">${day}</div>`;
        });
        
        // Empty cells before first day
        for (let i = 0; i < startingDayOfWeek; i++) {
            html += `<div class="calendar-day"></div>`;
        }
        
        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dateStr = date.toISOString().split('T')[0];
            const isCompleted = habit.completions.includes(dateStr);
            const isToday = date.toDateString() === today.toDateString();
            
            html += `<div class="calendar-day ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}">${day}</div>`;
        }
        
        html += '</div>';
        calendar.innerHTML = html;
    }

    closeDetailModal() {
        document.getElementById('habitDetailModal').classList.remove('active');
    }

    checkReminders() {
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        
        this.habits.forEach(habit => {
            if (habit.reminder === currentTime) {
                this.showReminderNotification(habit);
            }
        });
    }

    showReminderNotification(habit) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Habit Reminder', {
                body: `Time for: ${habit.name}`,
                icon: '🔔'
            });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
        
        this.showToast(`Reminder: ${habit.name}`);
    }

    exportData() {
        const exportData = {
            habits: this.habits,
            exportDate: new Date().toISOString(),
            analytics: {
                longestStreak: this.habits.reduce((max, h) => Math.max(max, h.longestStreak), 0),
                totalHabits: this.habits.length,
                activeStreaks: this.habits.filter(h => h.currentStreak > 0).length
            }
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `habit-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Data exported successfully!');
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    saveToLocalStorage() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }
}

// Initialize the tracker
const tracker = new HabitTracker();

// Request notification permission on load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}
