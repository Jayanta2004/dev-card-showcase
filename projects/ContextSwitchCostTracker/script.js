// DOM Elements - Tracker
const taskInput = document.getElementById('task-input');
const taskCategory = document.getElementById('task-category');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const stopBtn = document.getElementById('stop-btn');
const sessionControls = document.getElementById('session-controls');

const sessionTimeDisplay = document.getElementById('session-time');
const switchCountDisplay = document.getElementById('switch-count');
const focusTaxDisplay = document.getElementById('focus-tax');
const focusQualityDisplay = document.getElementById('focus-quality');
const activeTaskDisplay = document.getElementById('active-task-display');
const currentTaskName = document.getElementById('current-task-name');
const logList = document.getElementById('log-list');

// DOM Elements - Header Stats
const streakCountDisplay = document.getElementById('streak-count');
const productivityScoreDisplay = document.getElementById('productivity-score');

// DOM Elements - Risk Estimator
const riskForm = document.getElementById('risk-form');
const riskResult = document.getElementById('risk-result');
const riskCircle = document.getElementById('risk-circle');
const riskScoreDisplay = document.getElementById('risk-score');
const riskLevelDisplay = document.getElementById('risk-level');
const riskSuggestionDisplay = document.getElementById('risk-suggestion');

// DOM Elements - History
const historyList = document.getElementById('history-list');
const totalFocusTimeDisplay = document.getElementById('total-focus-time');
const totalSwitchesDisplay = document.getElementById('total-switches');
const totalSessionsDisplay = document.getElementById('total-sessions');
const avgQualityDisplay = document.getElementById('avg-quality');
const exportBtn = document.getElementById('export-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const filterTabs = document.querySelectorAll('.tab-btn');

// DOM Elements - Analytics
const categoryBreakdownEl = document.getElementById('category-breakdown');
const bestTimesEl = document.getElementById('best-times');

/**
 * LocalStorage Manager
 */
class StorageManager {
    static KEYS = {
        SESSIONS: 'focusguard_sessions',
        STREAK: 'focusguard_streak',
        LAST_DATE: 'focusguard_last_date'
    };

    static saveSession(session) {
        const sessions = this.getSessions();
        sessions.push(session);
        localStorage.setItem(this.KEYS.SESSIONS, JSON.stringify(sessions));
    }

    static getSessions() {
        const data = localStorage.getItem(this.KEYS.SESSIONS);
        return data ? JSON.parse(data) : [];
    }

    static clearSessions() {
        localStorage.removeItem(this.KEYS.SESSIONS);
    }

    static getStreak() {
        return parseInt(localStorage.getItem(this.KEYS.STREAK) || '0');
    }

    static setStreak(streak) {
        localStorage.setItem(this.KEYS.STREAK, streak.toString());
    }

    static getLastDate() {
        return localStorage.getItem(this.KEYS.LAST_DATE);
    }

    static setLastDate(date) {
        localStorage.setItem(this.KEYS.LAST_DATE, date);
    }
}

/**
 * Context Switch Cost Tracker
 */
class ContextTracker {
    constructor() {
        this.isActive = false;
        this.isPaused = false;
        this.startTime = null;
        this.pausedTime = 0;
        this.currentTask = null;
        this.currentCategory = 'other';
        this.switches = 0;
        this.focusTaxMinutes = 0;
        this.timerInterval = null;
        this.recoveryTimePerSwitch = 15;

        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    start(taskName, category) {
        if (!taskName) return alert('Please enter a task name!');

        this.isActive = true;
        this.isPaused = false;
        this.startTime = Date.now();
        this.pausedTime = 0;
        this.currentTask = taskName;
        this.currentCategory = category;
        this.switches = 0;
        this.focusTaxMinutes = 0;

        // Update UI
        currentTaskName.textContent = taskName;
        activeTaskDisplay.classList.remove('hidden');
        sessionControls.classList.remove('hidden');
        startBtn.disabled = true;
        taskInput.disabled = true;
        taskCategory.disabled = true;
        logList.innerHTML = '';
        
        this.updateStats();
        this.startTimer();

        this.logEvent('Session started', 'success');
    }

    pause() {
        if (!this.isActive || this.isPaused) return;
        
        this.isPaused = true;
        this.pausedTime = Date.now();
        clearInterval(this.timerInterval);
        
        pauseBtn.classList.add('hidden');
        resumeBtn.classList.remove('hidden');
        
        this.logEvent('Session paused', 'warning');
    }

    resume() {
        if (!this.isActive || !this.isPaused) return;
        
        const pauseDuration = Date.now() - this.pausedTime;
        this.startTime += pauseDuration;
        this.isPaused = false;
        
        resumeBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
        
        this.startTimer();
        this.logEvent('Session resumed', 'success');
    }

    stop() {
        if (!this.isActive) return;

        const duration = this.getElapsedTime();
        const focusQuality = this.calculateFocusQuality();
        
        // Save session to history
        const session = {
            id: Date.now(),
            task: this.currentTask,
            category: this.currentCategory,
            startTime: new Date(this.startTime).toISOString(),
            duration: duration,
            switches: this.switches,
            focusTax: this.focusTaxMinutes,
            quality: focusQuality,
            timestamp: Date.now()
        };
        
        StorageManager.saveSession(session);
        
        // Update streak
        this.updateStreak();
        
        // Reset state
        this.isActive = false;
        this.isPaused = false;
        clearInterval(this.timerInterval);
        
        // Reset UI
        startBtn.disabled = false;
        taskInput.disabled = false;
        taskCategory.disabled = false;
        taskInput.value = '';
        sessionControls.classList.add('hidden');
        activeTaskDisplay.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
        resumeBtn.classList.add('hidden');
        
        // Refresh displays
        historyManager.render();
        analyticsManager.render();
        this.updateHeaderStats();
        
        this.logEvent(`Session completed! Quality: ${focusQuality}%`, 'success');
        
        // Show completion message
        alert(`✅ Session Complete!\n\nTask: ${this.currentTask}\nDuration: ${this.formatTime(duration)}\nSwitches: ${this.switches}\nFocus Quality: ${focusQuality}%`);
    }

    handleVisibilityChange() {
        if (!this.isActive || this.isPaused) return;

        if (document.hidden) {
            this.switches++;
            this.focusTaxMinutes += this.recoveryTimePerSwitch;
            this.logEvent('Focus lost - tab switched', 'danger');
            this.updateStats();
        }
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (!this.isPaused) {
                this.updateTimer();
            }
        }, 1000);
    }

    updateTimer() {
        const elapsed = this.getElapsedTime();
        sessionTimeDisplay.textContent = this.formatTime(elapsed);
    }

    updateStats() {
        switchCountDisplay.textContent = this.switches;
        focusTaxDisplay.textContent = `${this.focusTaxMinutes}m`;
        
        const quality = this.calculateFocusQuality();
        focusQualityDisplay.textContent = `${quality}%`;
        
        // Color code quality
        const qualityEl = focusQualityDisplay.parentElement;
        qualityEl.classList.remove('warning', 'danger', 'success');
        if (quality >= 80) qualityEl.classList.add('success');
        else if (quality >= 50) qualityEl.classList.add('warning');
        else qualityEl.classList.add('danger');
    }

    calculateFocusQuality() {
        if (!this.isActive) return 100;
        
        const elapsed = this.getElapsedTime() / 1000 / 60; // minutes
        if (elapsed < 1) return 100;
        
        const switchRate = this.switches / (elapsed / 60); // switches per hour
        const quality = Math.max(0, Math.min(100, 100 - (switchRate * 10)));
        
        return Math.round(quality);
    }

    getElapsedTime() {
        if (!this.startTime) return 0;
        if (this.isPaused) return this.pausedTime - this.startTime;
        return Date.now() - this.startTime;
    }

    logEvent(message, type = 'info') {
        const li = document.createElement('li');
        li.className = `log-item log-${type}`;
        
        let icon = 'ri-information-line';
        if (type === 'danger') icon = 'ri-eye-off-line';
        else if (type === 'success') icon = 'ri-check-line';
        else if (type === 'warning') icon = 'ri-pause-line';
        
        li.innerHTML = `
            <span><i class="${icon}"></i> ${message}</span>
            <span class="text-muted">${new Date().toLocaleTimeString()}</span>
        `;
        logList.prepend(li);
    }

    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const pad = (num) => num.toString().padStart(2, '0');
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastDate = StorageManager.getLastDate();
        let streak = StorageManager.getStreak();

        if (lastDate === today) {
            // Already logged today, keep streak
        } else {
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            if (lastDate === yesterday) {
                streak++;
            } else {
                streak = 1;
            }
        }

        StorageManager.setStreak(streak);
        StorageManager.setLastDate(today);
        this.updateHeaderStats();
    }

    updateHeaderStats() {
        const streak = StorageManager.getStreak();
        streakCountDisplay.textContent = `${streak} ${streak === 1 ? 'day' : 'days'}`;

        const sessions = StorageManager.getSessions();
        if (sessions.length === 0) {
            productivityScoreDisplay.textContent = '--';
            return;
        }

        // Calculate productivity score (average quality)
        const avgQuality = sessions.reduce((sum, s) => sum + s.quality, 0) / sessions.length;
        productivityScoreDisplay.textContent = `${Math.round(avgQuality)}/100`;
    }
}

/**
 * History Manager
 */
class HistoryManager {
    constructor() {
        this.currentFilter = 'all';
    }

    render(filter = 'all') {
        this.currentFilter = filter;
        const sessions = this.getFilteredSessions();
        
        // Update stats
        this.updateStats(sessions);
        
        // Render list
        if (sessions.length === 0) {
            historyList.innerHTML = '<p class="empty-state"><i class="ri-inbox-line"></i> No sessions found.</p>';
            return;
        }

        historyList.innerHTML = sessions.reverse().map(session => `
            <div class="history-item">
                <div class="history-item-header">
                    <div>
                        <strong>${session.task}</strong>
                        <span class="category-badge">${this.getCategoryEmoji(session.category)} ${session.category}</span>
                    </div>
                    <span class="text-muted">${this.formatDate(session.startTime)}</span>
                </div>
                <div class="history-item-stats">
                    <span><i class="ri-time-line"></i> ${this.formatDuration(session.duration)}</span>
                    <span><i class="ri-refresh-line"></i> ${session.switches} switches</span>
                    <span><i class="ri-star-fill"></i> ${session.quality}% quality</span>
                    <span class="text-muted"><i class="ri-alert-line"></i> ${session.focusTax}m tax</span>
                </div>
            </div>
        `).join('');
    }

    getFilteredSessions() {
        const all = StorageManager.getSessions();
        const now = Date.now();
        
        switch(this.currentFilter) {
            case 'today':
                const todayStart = new Date().setHours(0, 0, 0, 0);
                return all.filter(s => s.timestamp >= todayStart);
            case 'week':
                const weekStart = now - (7 * 24 * 60 * 60 * 1000);
                return all.filter(s => s.timestamp >= weekStart);
            default:
                return all;
        }
    }

    updateStats(sessions) {
        if (sessions.length === 0) {
            totalFocusTimeDisplay.textContent = '0h 0m';
            totalSwitchesDisplay.textContent = '0';
            totalSessionsDisplay.textContent = '0';
            avgQualityDisplay.textContent = '--%';
            return;
        }

        const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
        const totalSwitches = sessions.reduce((sum, s) => sum + s.switches, 0);
        const avgQuality = sessions.reduce((sum, s) => sum + s.quality, 0) / sessions.length;

        totalFocusTimeDisplay.textContent = this.formatDuration(totalTime);
        totalSwitchesDisplay.textContent = totalSwitches.toString();
        totalSessionsDisplay.textContent = sessions.length.toString();
        avgQualityDisplay.textContent = `${Math.round(avgQuality)}%`;
    }

    getCategoryEmoji(category) {
        const emojis = {
            coding: '💻',
            design: '🎨',
            writing: '✍️',
            meeting: '👥',
            learning: '📚',
            other: '🔧'
        };
        return emojis[category] || emojis.other;
    }

    formatDate(isoString) {
        const date = new Date(isoString);
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (date.toDateString() === today) {
            return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (date.toDateString() === yesterday) {
            return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString() + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }

    formatDuration(ms) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    }

    exportData() {
        const sessions = StorageManager.getSessions();
        const csv = this.convertToCSV(sessions);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `focusguard-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    convertToCSV(sessions) {
        const headers = ['Date', 'Task', 'Category', 'Duration (min)', 'Switches', 'Focus Tax (min)', 'Quality (%)'];
        const rows = sessions.map(s => [
            new Date(s.startTime).toLocaleString(),
            s.task,
            s.category,
            Math.round(s.duration / 60000),
            s.switches,
            s.focusTax,
            s.quality
        ]);
        
        return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    clearAll() {
        if (confirm('Are you sure you want to delete all session history? This cannot be undone.')) {
            StorageManager.clearSessions();
            this.render();
            analyticsManager.render();
            tracker.updateHeaderStats();
        }
    }
}

/**
 * Analytics Manager
 */
class AnalyticsManager {
    render() {
        const sessions = StorageManager.getSessions();
        
        if (sessions.length === 0) {
            categoryBreakdownEl.innerHTML = '<p class="text-muted">Track sessions to see breakdown</p>';
            bestTimesEl.innerHTML = '<p class="text-muted">Complete more sessions to analyze</p>';
            return;
        }

        this.renderCategoryBreakdown(sessions);
        this.renderBestTimes(sessions);
    }

    renderCategoryBreakdown(sessions) {
        const breakdown = {};
        sessions.forEach(s => {
            breakdown[s.category] = (breakdown[s.category] || 0) + 1;
        });

        const total = sessions.length;
        const html = Object.entries(breakdown)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, count]) => {
                const percentage = Math.round((count / total) * 100);
                return `
                    <div class="category-bar">
                        <div class="category-label">
                            <span>${historyManager.getCategoryEmoji(cat)} ${cat}</span>
                            <span>${count} sessions</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%"></div>
                        </div>
                        <span class="percentage">${percentage}%</span>
                    </div>
                `;
            }).join('');

        categoryBreakdownEl.innerHTML = html;
    }

    renderBestTimes(sessions) {
        // Group by hour of day
        const hourly = {};
        sessions.forEach(s => {
            const hour = new Date(s.startTime).getHours();
            if (!hourly[hour]) hourly[hour] = { count: 0, totalQuality: 0 };
            hourly[hour].count++;
            hourly[hour].totalQuality += s.quality;
        });

        // Find best times (highest average quality)
        const bestHours = Object.entries(hourly)
            .map(([hour, data]) => ({
                hour: parseInt(hour),
                avgQuality: data.totalQuality / data.count,
                count: data.count
            }))
            .sort((a, b) => b.avgQuality - a.avgQuality)
            .slice(0, 3);

        if (bestHours.length === 0) {
            bestTimesEl.innerHTML = '<p class="text-muted">Complete more sessions to analyze</p>';
            return;
        }

        const html = bestHours.map((item, index) => `
            <div class="best-time-item">
                <div class="rank">#${index + 1}</div>
                <div>
                    <strong>${this.formatHour(item.hour)}</strong>
                    <small>${Math.round(item.avgQuality)}% avg quality · ${item.count} sessions</small>
                </div>
            </div>
        `).join('');

        bestTimesEl.innerHTML = html;
    }

    formatHour(hour) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:00 ${period}`;
    }
}

/**
 * Deadline Risk Estimator
 */
class RiskEstimator {
    calculate(taskSize, pastDelays, buffer) {
        if (taskSize <= 0) return 0;

        const effectiveWork = taskSize + pastDelays;
        const totalTimeAvailable = taskSize + buffer;

        // Factor in context switch history
        const sessions = StorageManager.getSessions();
        let switchPenalty = 0;
        
        if (sessions.length > 0) {
            const avgSwitchRate = sessions.reduce((sum, s) => {
                const hours = s.duration / 3600000;
                return sum + (s.switches / Math.max(hours, 0.1));
            }, 0) / sessions.length;
            
            // If you historically switch a lot, add risk
            switchPenalty = Math.min(avgSwitchRate * 2, 20);
        }

        let riskScore = ((effectiveWork / totalTimeAvailable) * 100) + switchPenalty;
        return Math.min(Math.round(riskScore), 100);
    }

    getRiskLevel(score) {
        if (score < 50) return { 
            level: 'Low Risk ✅', 
            color: '#10b981', 
            suggestion: 'You have plenty of buffer. Keep steady and maintain focus!' 
        };
        if (score < 80) return { 
            level: 'Medium Risk ⚠️', 
            color: '#f59e0b', 
            suggestion: 'Tight schedule. Avoid scope creep and minimize distractions.' 
        };
        return { 
            level: 'High Risk 🚨', 
            color: '#ef4444', 
            suggestion: 'Danger zone! Consider cutting scope, getting help, or moving the deadline.' 
        };
    }

    updateUI(taskSize, pastDelays, buffer) {
        const score = this.calculate(taskSize, pastDelays, buffer);
        const { level, color, suggestion } = this.getRiskLevel(score);

        riskResult.classList.remove('hidden');
        riskScoreDisplay.textContent = `${score}%`;
        riskLevelDisplay.textContent = level;
        riskLevelDisplay.style.color = color;
        riskSuggestionDisplay.textContent = suggestion;

        riskCircle.style.background = `conic-gradient(${color} ${score}%, rgba(255,255,255,0.1) ${score}%)`;
    }
}

// Initialize
const tracker = new ContextTracker();
const historyManager = new HistoryManager();
const analyticsManager = new AnalyticsManager();
const estimator = new RiskEstimator();

// Event Listeners - Tracker
startBtn.addEventListener('click', () => {
    tracker.start(taskInput.value.trim(), taskCategory.value);
});

pauseBtn.addEventListener('click', () => tracker.pause());
resumeBtn.addEventListener('click', () => tracker.resume());
stopBtn.addEventListener('click', () => tracker.stop());

// Event Listeners - Risk Form
riskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskSize = parseFloat(document.getElementById('task-size').value) || 0;
    const pastDelays = parseFloat(document.getElementById('past-delays').value) || 0;
    const buffer = parseFloat(document.getElementById('buffer-time').value) || 0;
    estimator.updateUI(taskSize, pastDelays, buffer);
});

// Event Listeners - History
exportBtn.addEventListener('click', () => historyManager.exportData());
clearHistoryBtn.addEventListener('click', () => historyManager.clearAll());

filterTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        filterTabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        historyManager.render(e.target.dataset.filter);
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        if (!tracker.isActive) {
            startBtn.click();
        } else if (!tracker.isPaused) {
            stopBtn.click();
        }
    }
});

// Initialize displays
tracker.updateHeaderStats();
historyManager.render();
analyticsManager.render();
