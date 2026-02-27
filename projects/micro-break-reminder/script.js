// Micro-Break Reminder System JavaScript

class MicroBreakReminder {
    constructor() {
        this.intervalMinutes = 30;
        this.breakDurationSeconds = 60;
        this.isRunning = false;
        this.countdownInterval = null;
        this.breakTimerInterval = null;
        this.nextBreakTime = null;
        this.currentBreakStart = null;

        // Statistics
        this.stats = {
            totalBreaks: 0,
            breaksToday: 0,
            todayDate: new Date().toDateString(),
            breakDurations: [],
            currentStreak: 0,
            longestStreak: 0,
            lastBreakDate: null
        };

        this.stretchSuggestions = [
            "Stand up and stretch your arms overhead",
            "Roll your shoulders and neck gently",
            "Look away from the screen for 20 seconds",
            "Take 5 deep breaths",
            "Walk around for a minute",
            "Blink your eyes rapidly for 10 seconds",
            "Stretch your wrists and fingers",
            "Stand on your toes and reach up",
            "Do a quick shoulder shrug",
            "Close your eyes and relax your face muscles"
        ];

        this.init();
        this.loadStats();
        this.updateUI();
    }

    init() {
        // Get DOM elements
        this.intervalInput = document.getElementById('interval-input');
        this.breakDurationInput = document.getElementById('break-duration-input');
        this.startBtn = document.getElementById('start-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.resetStatsBtn = document.getElementById('reset-stats-btn');
        this.statusText = document.getElementById('status-text');
        this.countdownText = document.getElementById('countdown-text');
        this.breaksTaken = document.getElementById('breaks-taken');
        this.breakPopup = document.getElementById('break-popup');
        this.breakMessage = document.getElementById('break-message');
        this.suggestionsList = document.getElementById('suggestions-list');
        this.breakTimerDisplay = document.getElementById('break-timer-display');
        this.skipBreakBtn = document.getElementById('skip-break-btn');
        this.completeBreakBtn = document.getElementById('complete-break-btn');

        // Bind events
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.resetStatsBtn.addEventListener('click', () => this.resetStats());
        this.skipBreakBtn.addEventListener('click', () => this.skipBreak());
        this.completeBreakBtn.addEventListener('click', () => this.completeBreak());

        // Input change handlers
        this.intervalInput.addEventListener('change', () => {
            this.intervalMinutes = parseInt(this.intervalInput.value);
        });
        this.breakDurationInput.addEventListener('change', () => {
            this.breakDurationSeconds = parseInt(this.breakDurationInput.value);
        });

        // Request notification permission
        if ('Notification' in window) {
            Notification.requestPermission();
        }
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.intervalMinutes = parseInt(this.intervalInput.value);
        this.breakDurationSeconds = parseInt(this.breakDurationInput.value);

        this.nextBreakTime = new Date(Date.now() + this.intervalMinutes * 60 * 1000);

        this.updateUI();
        this.startCountdown();

        // Show notification if permitted
        this.showNotification('Micro-Break Reminder Started', `Next break in ${this.intervalMinutes} minutes`);
    }

    stop() {
        this.isRunning = false;
        this.nextBreakTime = null;

        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }

        this.hideBreakPopup();
        this.updateUI();
    }

    startCountdown() {
        this.countdownInterval = setInterval(() => {
            if (!this.isRunning) return;

            const now = new Date();
            const timeLeft = this.nextBreakTime - now;

            if (timeLeft <= 0) {
                this.showBreakPopup();
                return;
            }

            const minutes = Math.floor(timeLeft / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            this.countdownText.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    showBreakPopup() {
        this.currentBreakStart = new Date();
        this.breakPopup.classList.remove('hidden');

        // Random stretch suggestions
        const randomSuggestions = this.getRandomSuggestions(3);
        this.suggestionsList.innerHTML = randomSuggestions.map(suggestion =>
            `<li>${suggestion}</li>`
        ).join('');

        // Start break timer
        let timeLeft = this.breakDurationSeconds;
        this.breakTimerDisplay.textContent = this.formatTime(timeLeft);

        this.breakTimerInterval = setInterval(() => {
            timeLeft--;
            this.breakTimerDisplay.textContent = this.formatTime(timeLeft);

            if (timeLeft <= 0) {
                this.autoCompleteBreak();
            }
        }, 1000);

        // Show notification
        this.showNotification('Time for a Break!', 'Take a moment to stretch and relax');
    }

    hideBreakPopup() {
        this.breakPopup.classList.add('hidden');
        if (this.breakTimerInterval) {
            clearInterval(this.breakTimerInterval);
            this.breakTimerInterval = null;
        }
    }

    skipBreak() {
        this.hideBreakPopup();
        this.scheduleNextBreak();
    }

    completeBreak() {
        const breakDuration = Math.floor((new Date() - this.currentBreakStart) / 1000);
        this.recordBreak(breakDuration);
        this.hideBreakPopup();
        this.scheduleNextBreak();
    }

    autoCompleteBreak() {
        const breakDuration = this.breakDurationSeconds;
        this.recordBreak(breakDuration);
        this.hideBreakPopup();
        this.scheduleNextBreak();
    }

    scheduleNextBreak() {
        if (this.isRunning) {
            this.nextBreakTime = new Date(Date.now() + this.intervalMinutes * 60 * 1000);
            this.startCountdown();
        }
    }

    recordBreak(duration) {
        this.stats.totalBreaks++;
        this.stats.breakDurations.push(duration);

        // Check if it's a new day
        const today = new Date().toDateString();
        if (this.stats.todayDate !== today) {
            this.stats.todayDate = today;
            this.stats.breaksToday = 0;
        }
        this.stats.breaksToday++;

        // Update streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (this.stats.lastBreakDate === yesterdayStr) {
            this.stats.currentStreak++;
        } else if (this.stats.lastBreakDate !== today) {
            this.stats.currentStreak = 1;
        }

        this.stats.longestStreak = Math.max(this.stats.longestStreak, this.stats.currentStreak);
        this.stats.lastBreakDate = today;

        this.saveStats();
        this.updateUI();
    }

    getRandomSuggestions(count) {
        const shuffled = [...this.stretchSuggestions].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    showNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/favicon.ico' });
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    updateUI() {
        this.startBtn.disabled = this.isRunning;
        this.stopBtn.disabled = !this.isRunning;

        this.statusText.textContent = this.isRunning ? 'Running' : 'Stopped';
        this.countdownText.textContent = this.isRunning ? 'Calculating...' : '--:--';
        this.breaksTaken.textContent = this.stats.breaksToday;

        // Update analytics
        document.getElementById('total-breaks').textContent = this.stats.totalBreaks;
        document.getElementById('avg-break-duration').textContent =
            this.stats.breakDurations.length > 0
                ? `${Math.round(this.stats.breakDurations.reduce((a, b) => a + b, 0) / this.stats.breakDurations.length)}s`
                : '0s';
        document.getElementById('longest-streak').textContent = `${this.stats.longestStreak} days`;
        document.getElementById('current-streak').textContent = `${this.stats.currentStreak} days`;
    }

    resetStats() {
        if (confirm('Are you sure you want to reset all statistics?')) {
            this.stats = {
                totalBreaks: 0,
                breaksToday: 0,
                todayDate: new Date().toDateString(),
                breakDurations: [],
                currentStreak: 0,
                longestStreak: 0,
                lastBreakDate: null
            };
            this.saveStats();
            this.updateUI();
        }
    }

    saveStats() {
        localStorage.setItem('microBreakStats', JSON.stringify(this.stats));
    }

    loadStats() {
        const saved = localStorage.getItem('microBreakStats');
        if (saved) {
            this.stats = { ...this.stats, ...JSON.parse(saved) };
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MicroBreakReminder();
});