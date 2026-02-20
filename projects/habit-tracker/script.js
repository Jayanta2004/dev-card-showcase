// ===== Habit Tracker - Complete JavaScript Logic =====

// Global state
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let completions = JSON.parse(localStorage.getItem('completions')) || {};
let currentTab = 'dashboard';
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = new Date().toDateString();
let editingHabitId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadHabits();
    renderDashboard();
    renderCalendar();
    updateAllStats();
    showTab('dashboard');
});

// ===== Tab Management =====
function showTab(tabName) {
    currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Refresh content
    switch(tabName) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'habits':
            renderHabits();
            break;
        case 'calendar':
            renderCalendar();
            break;
        case 'statistics':
            renderStatistics();
            break;
        case 'badges':
            renderBadges();
            break;
    }
}

// ===== Habit Management =====
function openHabitModal(habitId = null) {
    const modal = document.getElementById('habitModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('habitForm');
    
    form.reset();
    editingHabitId = habitId;
    
    if (habitId) {
        title.textContent = 'Edit Habit';
        const habit = habits.find(h => h.id === habitId);
        if (habit) {
            document.getElementById('habitName').value = habit.name;
            document.getElementById('habitCategory').value = habit.category;
            document.getElementById('habitFrequency').value = habit.frequency;
            document.getElementById('habitGoal').value = habit.goal;
            document.getElementById('habitDescription').value = habit.description;
            document.getElementById('habitReminder').checked = habit.reminder;
        }
    } else {
        title.textContent = 'Add New Habit';
    }
    
    modal.classList.add('active');
}

function closeHabitModal() {
    document.getElementById('habitModal').classList.remove('active');
    editingHabitId = null;
}

function saveHabit() {
    const name = document.getElementById('habitName').value;
    const category = document.getElementById('habitCategory').value;
    const frequency = document.getElementById('habitFrequency').value;
    const goal = document.getElementById('habitGoal').value;
    const description = document.getElementById('habitDescription').value;
    const reminder = document.getElementById('habitReminder').checked;
    
    if (!name) {
        showToast('Please enter a habit name');
        return;
    }
    
    if (editingHabitId) {
        // Edit existing habit
        const habit = habits.find(h => h.id === editingHabitId);
        if (habit) {
            habit.name = name;
            habit.category = category;
            habit.frequency = frequency;
            habit.goal = goal;
            habit.description = description;
            habit.reminder = reminder;
        }
        showToast('Habit updated successfully!');
    } else {
        // Add new habit
        const newHabit = {
            id: Date.now(),
            name,
            category,
            frequency,
            goal,
            description,
            reminder,
            createdAt: new Date().toISOString()
        };
        habits.push(newHabit);
        showToast('Habit added successfully!');
    }
    
    saveToLocalStorage();
    closeHabitModal();
    renderHabits();
    renderDashboard();
}

function deleteHabit(habitId) {
    if (confirm('Are you sure you want to delete this habit?')) {
        habits = habits.filter(h => h.id !== habitId);
        // Remove completions for this habit
        Object.keys(completions).forEach(date => {
            if (completions[date][habitId]) {
                delete completions[date][habitId];
            }
        });
        saveToLocalStorage();
        renderHabits();
        renderDashboard();
        showToast('Habit deleted');
    }
}

// ===== Check-in Management =====
function toggleHabitCompletion(habitId, date = null) {
    const checkDate = date || new Date().toDateString();
    
    if (!completions[checkDate]) {
        completions[checkDate] = {};
    }
    
    if (completions[checkDate][habitId]) {
        delete completions[checkDate][habitId];
    } else {
        completions[checkDate][habitId] = {
            timestamp: new Date().toISOString()
        };
    }
    
    saveToLocalStorage();
    renderDashboard();
    renderHabits();
    renderCalendar();
    renderStatistics();
    renderBadges();
    showToast('Progress updated!');
}

function isHabitCompleted(habitId, date) {
    const checkDate = new Date(date).toDateString();
    return completions[checkDate] && completions[checkDate][habitId];
}

// ===== Streak Calculation =====
function calculateStreak(habitId) {
    const today = new Date();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Calculate current streak (backwards from today)
    for (let i = 0; i <= 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toDateString();
        
        if (isHabitCompleted(habitId, dateStr)) {
            tempStreak++;
            if (i === 0 || currentStreak > 0) {
                currentStreak = tempStreak;
            }
        } else if (i === 0) {
            break; // Today not completed, no current streak
        } else {
            break; // Streak broken
        }
    }
    
    // Calculate longest streak
    tempStreak = 0;
    for (let i = 0; i <= 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toDateString();
        
        if (isHabitCompleted(habitId, dateStr)) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 0;
        }
    }
    
    return { current: currentStreak, longest: longestStreak };
}

// ===== Dashboard Rendering =====
function renderDashboard() {
    const totalHabits = habits.length;
    const activeHabits = habits.filter(h => {
        const streak = calculateStreak(h.id);
        return streak.current > 0;
    }).length;
    
    let longestStreak = 0;
    habits.forEach(habit => {
        const streak = calculateStreak(habit.id);
        longestStreak = Math.max(longestStreak, streak.longest);
    });
    
    const completionRate = calculateOverallCompletionRate();
    
    document.getElementById('totalHabits').textContent = totalHabits;
    document.getElementById('activeHabits').textContent = activeHabits;
    document.getElementById('longestStreak').textContent = longestStreak;
    document.getElementById('completionRate').textContent = completionRate + '%';
    
    renderTodayHabits();
    renderRecentBadges();
}

function renderTodayHabits() {
    const container = document.getElementById('todayHabitsList');
    const today = new Date().toDateString();
    
    if (habits.length === 0) {
        container.innerHTML = '<div class="empty-state">No habits yet. Click "Add New Habit" to get started!</div>';
        return;
    }
    
    container.innerHTML = habits.map(habit => {
        const completed = isHabitCompleted(habit.id, today);
        const streak = calculateStreak(habit.id);
        
        return `
            <div class="today-habit-item ${completed ? 'completed' : ''}">
                <div class="habit-info">
                    <div class="habit-name">${habit.name}</div>
                    <div class="habit-meta">
                        <span>📁 ${habit.category}</span>
                        <span class="streak-badge">🔥 ${streak.current} day streak</span>
                    </div>
                </div>
                <button class="check-btn ${completed ? 'checked' : ''}" 
                        onclick="toggleHabitCompletion(${habit.id})">
                    ${completed ? '✓' : ''}
                </button>
            </div>
        `;
    }).join('');
}

// ===== My Habits Tab =====
function renderHabits() {
    const container = document.getElementById('habitsContainer');
    const categoryFilter = document.getElementById('categoryFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const searchTerm = document.getElementById('searchHabits').value.toLowerCase();
    
    let filtered = habits.filter(habit => {
        const matchesCategory = categoryFilter === 'all' || habit.category === categoryFilter;
        const matchesSearch = habit.name.toLowerCase().includes(searchTerm) || 
                            habit.description.toLowerCase().includes(searchTerm);
        
        let matchesStatus = true;
        if (statusFilter === 'active') {
            const streak = calculateStreak(habit.id);
            matchesStatus = streak.current > 0;
        } else if (statusFilter === 'inactive') {
            const streak = calculateStreak(habit.id);
            matchesStatus = streak.current === 0;
        }
        
        return matchesCategory && matchesSearch && matchesStatus;
    });
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">No habits found</div>';
        return;
    }
    
    container.innerHTML = filtered.map(habit => {
        const streak = calculateStreak(habit.id);
        const completionRate = calculateHabitCompletionRate(habit.id);
        const today = new Date().toDateString();
        const completed = isHabitCompleted(habit.id, today);
        
        return `
            <div class="habit-card">
                <div class="habit-card-header">
                    <span class="habit-card-category">${habit.category}</span>
                    <div class="habit-card-actions">
                        <button class="habit-action-btn" onclick="openHabitModal(${habit.id})">✏️</button>
                        <button class="habit-action-btn" onclick="deleteHabit(${habit.id})">🗑️</button>
                    </div>
                </div>
                <h3 class="habit-card-title">${habit.name}</h3>
                <p class="habit-card-goal">${habit.goal}</p>
                <div class="habit-card-stats">
                    <div class="habit-stat">
                        <span class="stat-value">${streak.current}</span>
                        <span class="stat-label">Current Streak</span>
                    </div>
                    <div class="habit-stat">
                        <span class="stat-value">${streak.longest}</span>
                        <span class="stat-label">Best Streak</span>
                    </div>
                    <div class="habit-stat">
                        <span class="stat-value">${completionRate}%</span>
                        <span class="stat-label">Success Rate</span>
                    </div>
                </div>
                <div class="habit-card-footer">
                    <button class="habit-check-btn ${completed ? 'completed' : ''}" 
                            onclick="toggleHabitCompletion(${habit.id})">
                        ${completed ? '✓ Completed Today' : 'Check In for Today'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ===== Calendar Rendering =====
function renderCalendar() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    document.getElementById('calendarMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    const calendarGrid = document.getElementById('calendarGrid');
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    
    let html = '';
    
    // Day headers
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        html += `<div class="calendar-day-header">${day}</div>`;
    });
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        html += `<div class="calendar-day other-month">${day}</div>`;
    }
    
    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateStr = date.toDateString();
        const isToday = dateStr === today.toDateString();
        const isSelected = dateStr === selectedDate;
        
        const dayStatus = getDayCompletionStatus(dateStr);
        let statusIcon = '';
        if (dayStatus === 'all') statusIcon = '✓';
        else if (dayStatus === 'partial') statusIcon = '○';
        else if (dayStatus === 'none' && date < today) statusIcon = '✗';
        
        html += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" 
                 onclick="selectDay('${dateStr}')">
                <div class="day-number">${day}</div>
                ${statusIcon ? `<div class="day-status">${statusIcon}</div>` : ''}
            </div>
        `;
    }
    
    // Next month days
    const remainingCells = 42 - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingCells; day++) {
        html += `<div class="calendar-day other-month">${day}</div>`;
    }
    
    calendarGrid.innerHTML = html;
    renderDayDetails();
}

function getDayCompletionStatus(dateStr) {
    if (habits.length === 0) return 'none';
    
    let completed = 0;
    habits.forEach(habit => {
        if (isHabitCompleted(habit.id, dateStr)) {
            completed++;
        }
    });
    
    if (completed === 0) return 'none';
    if (completed === habits.length) return 'all';
    return 'partial';
}

function selectDay(dateStr) {
    selectedDate = dateStr;
    renderCalendar();
}

function previousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

function renderDayDetails() {
    const container = document.getElementById('dayHabitsList');
    const date = new Date(selectedDate);
    
    document.getElementById('selectedDayTitle').textContent = 
        `Habits for ${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
    
    if (habits.length === 0) {
        container.innerHTML = '<div class="empty-state">No habits to display</div>';
        return;
    }
    
    container.innerHTML = habits.map(habit => {
        const completed = isHabitCompleted(habit.id, selectedDate);
        
        return `
            <div class="day-habit-item">
                <span class="day-habit-name">${habit.name}</span>
                <span class="day-habit-status">${completed ? '✓' : '✗'}</span>
            </div>
        `;
    }).join('');
}

// ===== Statistics =====
function renderStatistics() {
    renderWeeklyChart();
    renderCategoryChart();
    renderConsistencyScore();
    renderHabitPerformance();
}

function renderWeeklyChart() {
    const canvas = document.getElementById('weeklyChart');
    const ctx = canvas.getContext('2d');
    
    // Get last 7 days
    const labels = [];
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        
        const dateStr = date.toDateString();
        let completed = 0;
        habits.forEach(habit => {
            if (isHabitCompleted(habit.id, dateStr)) {
                completed++;
            }
        });
        data.push(completed);
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw chart
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    const barWidth = chartWidth / (data.length * 2);
    const maxValue = Math.max(...data, 1);
    
    // Draw bars
    data.forEach((value, index) => {
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding + index * (chartWidth / data.length) + barWidth / 2;
        const y = canvas.height - padding - barHeight;
        
        // Gradient
        const gradient = ctx.createLinearGradient(0, y, 0, canvas.height - padding);
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(1, '#8b5cf6');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Value on top
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value, x + barWidth / 2, y - 5);
        
        // Label at bottom
        ctx.fillText(labels[index], x + barWidth / 2, canvas.height - padding + 20);
    });
}

function renderCategoryChart() {
    const canvas = document.getElementById('categoryChart');
    const ctx = canvas.getContext('2d');
    
    // Count habits by category
    const categoryCounts = {};
    habits.forEach(habit => {
        categoryCounts[habit.category] = (categoryCounts[habit.category] || 0) + 1;
    });
    
    const categories = Object.keys(categoryCounts);
    const values = Object.values(categoryCounts);
    const total = values.reduce((a, b) => a + b, 0);
    
    if (total === 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw pie chart
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;
    
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#6366f1'];
    
    let currentAngle = -Math.PI / 2;
    
    values.forEach((value, index) => {
        const sliceAngle = (value / total) * Math.PI * 2;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        
        // Label
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(categories[index], labelX, labelY);
        ctx.font = '12px Arial';
        ctx.fillText(value, labelX, labelY + 15);
        
        currentAngle += sliceAngle;
    });
}

function renderConsistencyScore() {
    const score = calculateConsistencyScore();
    document.getElementById('consistencyScore').textContent = score + '%';
}

function calculateConsistencyScore() {
    if (habits.length === 0) return 0;
    
    const today = new Date();
    let totalChecks = 0;
    let possibleChecks = 0;
    
    // Check last 30 days
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toDateString();
        
        habits.forEach(habit => {
            possibleChecks++;
            if (isHabitCompleted(habit.id, dateStr)) {
                totalChecks++;
            }
        });
    }
    
    return possibleChecks > 0 ? Math.round((totalChecks / possibleChecks) * 100) : 0;
}

function renderHabitPerformance() {
    const container = document.getElementById('habitPerformance');
    
    if (habits.length === 0) {
        container.innerHTML = '<div class="empty-state">No habits to analyze</div>';
        return;
    }
    
    const performance = habits.map(habit => ({
        name: habit.name,
        rate: calculateHabitCompletionRate(habit.id)
    })).sort((a, b) => b.rate - a.rate);
    
    container.innerHTML = performance.map(item => `
        <div class="performance-item">
            <span class="performance-name">${item.name}</span>
            <div class="performance-bar">
                <div class="performance-fill" style="width: ${item.rate}%"></div>
            </div>
            <span class="performance-percent">${item.rate}%</span>
        </div>
    `).join('');
}

function calculateHabitCompletionRate(habitId) {
    const today = new Date();
    let completed = 0;
    let total = 30;
    
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toDateString();
        
        if (isHabitCompleted(habitId, dateStr)) {
            completed++;
        }
    }
    
    return Math.round((completed / total) * 100);
}

function calculateOverallCompletionRate() {
    if (habits.length === 0) return 0;
    
    const today = new Date();
    let completed = 0;
    let total = 0;
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toDateString();
        
        habits.forEach(habit => {
            total++;
            if (isHabitCompleted(habit.id, dateStr)) {
                completed++;
            }
        });
    }
    
    return total > 0 ? Math.round((completed / total) * 100) : 0;
}

// ===== Badges System =====
const badgeDefinitions = [
    { id: 'first-habit', icon: '🌱', name: 'First Steps', description: 'Create your first habit', check: () => habits.length >= 1 },
    { id: '5-habits', icon: '⭐', name: 'Habit Builder', description: 'Create 5 habits', check: () => habits.length >= 5 },
    { id: '7-day-streak', icon: '🔥', name: 'Week Warrior', description: 'Maintain a 7-day streak', check: () => habits.some(h => calculateStreak(h.id).current >= 7) },
    { id: '14-day-streak', icon: '💪', name: 'Fortnight Fighter', description: 'Maintain a 14-day streak', check: () => habits.some(h => calculateStreak(h.id).current >= 14) },
    { id: '30-day-streak', icon: '🏆', name: 'Monthly Master', description: 'Maintain a 30-day streak', check: () => habits.some(h => calculateStreak(h.id).current >= 30) },
    { id: '100-day-streak', icon: '👑', name: 'Century Champion', description: 'Maintain a 100-day streak', check: () => habits.some(h => calculateStreak(h.id).current >= 100) },
    { id: 'perfect-week', icon: '💯', name: 'Perfect Week', description: 'Complete all habits for 7 days', check: () => checkPerfectWeek() },
    { id: 'perfect-month', icon: '🌟', name: 'Flawless Month', description: 'Complete all habits for 30 days', check: () => checkPerfectMonth() },
    { id: 'early-bird', icon: '🌅', name: 'Early Bird', description: 'Check in before 7 AM', check: () => checkEarlyBird() },
    { id: 'consistency-king', icon: '👑', name: 'Consistency King', description: '80%+ consistency for 30 days', check: () => calculateConsistencyScore() >= 80 }
];

function checkPerfectWeek() {
    if (habits.length === 0) return false;
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toDateString();
        const allCompleted = habits.every(h => isHabitCompleted(h.id, dateStr));
        if (!allCompleted) return false;
    }
    return true;
}

function checkPerfectMonth() {
    if (habits.length === 0) return false;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toDateString();
        const allCompleted = habits.every(h => isHabitCompleted(h.id, dateStr));
        if (!allCompleted) return false;
    }
    return true;
}

function checkEarlyBird() {
    const today = new Date().toDateString();
    if (!completions[today]) return false;
    
    return Object.values(completions[today]).some(c => {
        const time = new Date(c.timestamp);
        return time.getHours() < 7;
    });
}

function renderBadges() {
    const container = document.getElementById('badgesGrid');
    
    const earnedBadges = badgeDefinitions.filter(badge => badge.check());
    
    container.innerHTML = badgeDefinitions.map(badge => {
        const earned = badge.check();
        const earnedDate = earned ? new Date().toLocaleDateString() : '';
        
        return `
            <div class="badge-item ${earned ? 'earned' : ''}">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-name">${badge.name}</div>
                <div class="badge-description">${badge.description}</div>
                ${earned ? `<div class="badge-date">Earned: ${earnedDate}</div>` : ''}
            </div>
        `;
    }).join('');
}

function renderRecentBadges() {
    const container = document.getElementById('recentBadges');
    const earnedBadges = badgeDefinitions.filter(badge => badge.check()).slice(0, 3);
    
    if (earnedBadges.length === 0) {
        container.innerHTML = '<div class="empty-state">No badges earned yet. Keep building those habits!</div>';
        return;
    }
    
    container.innerHTML = earnedBadges.map(badge => `
        <div class="badge-item earned">
            <div class="badge-icon">${badge.icon}</div>
            <div class="badge-name">${badge.name}</div>
        </div>
    `).join('');
}

// ===== Export Data =====
function exportData() {
    const dataStr = JSON.stringify({ habits, completions }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habit-tracker-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('Data exported successfully!');
}

// ===== Local Storage =====
function saveToLocalStorage() {
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('completions', JSON.stringify(completions));
}

function loadHabits() {
    const saved = localStorage.getItem('habits');
    if (saved) {
        habits = JSON.parse(saved);
    }
    
    const savedCompletions = localStorage.getItem('completions');
    if (savedCompletions) {
        completions = JSON.parse(savedCompletions);
    }
}

// ===== Helper Functions =====
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function updateAllStats() {
    renderDashboard();
    renderHabits();
    renderCalendar();
    renderStatistics();
    renderBadges();
}
