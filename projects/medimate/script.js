        (function() {
            // ========== STATE ==========
            const STORAGE_KEY = 'meditatemate_sessions';
            
            // Timer variables
            let timerInterval = null;
            let timerRunning = false;
            let timerPaused = false;
            let minutes = 5;
            let seconds = 0;
            
            // Sessions array
            let sessions = [];
            
            // DOM elements
            const timerDisplay = document.getElementById('timerDisplay');
            const startPauseBtn = document.getElementById('startPauseBtn');
            const resetBtn = document.getElementById('resetBtn');
            const presetBtns = document.querySelectorAll('.preset-btn');
            const sessionInput = document.getElementById('sessionInput');
            const durationSelect = document.getElementById('durationSelect');
            const logSessionBtn = document.getElementById('logSessionBtn');
            const totalSessionsSpan = document.getElementById('totalSessions');
            const totalMinutesSpan = document.getElementById('totalMinutes');
            const avgMinsSpan = document.getElementById('avgMins');
            const streakDisplay = document.getElementById('streakDisplay');
            const historyList = document.getElementById('historyList');
            const clearHistoryBtn = document.getElementById('clearHistoryBtn');

            // ========== TIMER FUNCTIONS ==========
            function formatTime(mins, secs) {
                return `${mins}:${secs.toString().padStart(2, '0')}`;
            }

            function updateTimerDisplay() {
                timerDisplay.textContent = formatTime(minutes, seconds);
            }

            function setActivePreset(min) {
                presetBtns.forEach(btn => {
                    const btnMin = parseInt(btn.dataset.minutes, 10);
                    if (btnMin === min) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }

            function setTimer(newMinutes) {
                if (!timerRunning && !timerPaused) {
                    minutes = newMinutes;
                    seconds = 0;
                    updateTimerDisplay();
                    setActivePreset(newMinutes);
                }
            }

            // Preset click handlers
            presetBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const mins = parseInt(btn.dataset.minutes, 10);
                    setTimer(mins);
                });
            });

            function startTimer() {
                if (timerRunning) return;
                timerRunning = true;
                timerPaused = false;
                startPauseBtn.textContent = '⏸ Pause';
                
                timerInterval = setInterval(() => {
                    if (seconds === 0) {
                        if (minutes === 0) {
                            // Timer finished
                            clearInterval(timerInterval);
                            timerRunning = false;
                            timerPaused = false;
                            startPauseBtn.textContent = '▶ Start';
                            
                            // Gentle notification
                            const audio = new Audio('data:audio/wav;base64,UklGRlwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoAAACAgICAf39/f3+AgI CAgICAf39/f3+AgI CAgICAf39/f3+AgI CAgICAf39/f3+AgI CAgICAf39/f3+AgI CAgICAf39/f3+AgI CAgI=');
                            audio.play().catch(e => {});
                            
                            alert('🧘 Your meditation is complete. Great job!');
                            
                            // Pre-fill log with current time
                            durationSelect.value = String(parseInt(durationSelect.value, 10) || 5);
                            return;
                        } else {
                            minutes--;
                            seconds = 59;
                        }
                    } else {
                        seconds--;
                    }
                    updateTimerDisplay();
                }, 1000);
            }

            function pauseTimer() {
                if (!timerRunning) return;
                clearInterval(timerInterval);
                timerRunning = false;
                timerPaused = true;
                startPauseBtn.textContent = '▶ Resume';
            }

            function resetTimer() {
                if (timerInterval) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                }
                timerRunning = false;
                timerPaused = false;
                
                // Get active preset or default to 5
                const activePreset = document.querySelector('.preset-btn.active');
                minutes = activePreset ? parseInt(activePreset.dataset.minutes, 10) : 5;
                seconds = 0;
                updateTimerDisplay();
                startPauseBtn.textContent = '▶ Start';
            }

            startPauseBtn.addEventListener('click', () => {
                if (timerRunning) {
                    pauseTimer();
                } else {
                    startTimer();
                }
            });

            resetBtn.addEventListener('click', resetTimer);

            // ========== SESSION STORAGE ==========
            function loadSessions() {
                try {
                    const stored = localStorage.getItem(STORAGE_KEY);
                    if (stored) {
                        sessions = JSON.parse(stored);
                        if (!Array.isArray(sessions)) sessions = [];
                    } else {
                        // Sample data
                        const today = new Date().toISOString().split('T')[0];
                        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                        const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];
                        sessions = [
                            { id: '1', type: 'Mindfulness', minutes: 10, date: today, displayDate: 'Today' },
                            { id: '2', type: 'Loving-kindness', minutes: 15, date: yesterday, displayDate: 'Yesterday' },
                            { id: '3', type: 'Body scan', minutes: 8, date: twoDaysAgo, displayDate: '2 days ago' }
                        ];
                    }
                } catch (e) {
                    sessions = [];
                }
                sessions.sort((a, b) => (a.date < b.date ? 1 : -1));
            }

            function saveSessions() {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
            }

            // ========== STATS & RENDER ==========
            function calculateStreak() {
                if (sessions.length === 0) return 0;
                
                const today = new Date().toISOString().split('T')[0];
                const uniqueDates = [...new Set(sessions.map(s => s.date))].sort().reverse();
                
                let streak = 0;
                let checkDate = new Date(today);
                
                while (true) {
                    const dateStr = checkDate.toISOString().split('T')[0];
                    if (uniqueDates.includes(dateStr)) {
                        streak++;
                        checkDate.setDate(checkDate.getDate() - 1);
                    } else {
                        break;
                    }
                }
                return streak;
            }

            function getAverageDailyMinutes() {
                if (sessions.length === 0) return 0;
                
                // Get unique days in last 30 days
                const today = new Date();
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 30);
                
                const recentSessions = sessions.filter(s => new Date(s.date) >= thirtyDaysAgo);
                if (recentSessions.length === 0) return 0;
                
                const totalMins = recentSessions.reduce((acc, s) => acc + s.minutes, 0);
                return Math.round(totalMins / 30); // avg per day over 30 days
            }

            function updateStats() {
                const total = sessions.length;
                const totalMins = sessions.reduce((acc, s) => acc + s.minutes, 0);
                const streak = calculateStreak();
                const avgDaily = getAverageDailyMinutes();
                
                totalSessionsSpan.textContent = total;
                totalMinutesSpan.textContent = totalMins;
                avgMinsSpan.textContent = avgDaily;
                streakDisplay.textContent = `🔥 ${streak} day streak`;
            }

            function renderHistory() {
                if (sessions.length === 0) {
                    historyList.innerHTML = '<div class="empty-history">🌱 no sessions yet · begin your practice</div>';
                    return;
                }
                
                let html = '';
                sessions.slice(0, 8).forEach(s => {
                    const displayDate = s.displayDate || s.date;
                    const type = s.type || 'meditation';
                    html += `
                        <div class="history-item">
                            <span class="item-icon">🧘</span>
                            <div class="item-content">
                                <div class="item-title">${escapeHtml(type)}</div>
                                <div class="item-meta">📅 ${displayDate}</div>
                            </div>
                            <div class="item-minutes">${s.minutes} min</div>
                        </div>
                    `;
                });
                historyList.innerHTML = html;
            }

            function escapeHtml(unsafe) {
                if (!unsafe) return '';
                return unsafe.replace(/[&<>"]/g, m => {
                    if (m === '&') return '&amp;';
                    if (m === '<') return '&lt;';
                    if (m === '>') return '&gt;';
                    return '&quot;';
                });
            }

            // ========== LOG SESSION ==========
            function logSession() {
                const type = sessionInput.value.trim() || 'mindfulness';
                const mins = parseInt(durationSelect.value, 10);
                
                const today = new Date();
                const dateISO = today.toISOString().split('T')[0];
                const displayDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                const newSession = {
                    id: Date.now() + '-' + Math.random().toString(36).substring(2, 8),
                    type: type,
                    minutes: mins,
                    date: dateISO,
                    displayDate: displayDate
                };
                
                sessions.push(newSession);
                sessions.sort((a, b) => (a.date < b.date ? 1 : -1));
                saveSessions();
                
                // Clear input
                sessionInput.value = '';
                
                // Update stats and history
                updateStats();
                renderHistory();
            }

            // ========== CLEAR HISTORY ==========
            function clearHistory() {
                if (sessions.length === 0) return;
                if (confirm('Delete all meditation history? This cannot be undone.')) {
                    sessions = [];
                    saveSessions();
                    updateStats();
                    renderHistory();
                }
            }

            // ========== INIT ==========
            function init() {
                loadSessions();
                updateStats();
                renderHistory();
                
                // Set timer to 5 minutes (active preset)
                minutes = 5;
                seconds = 0;
                updateTimerDisplay();
                
                // Event listeners
                logSessionBtn.addEventListener('click', logSession);
                clearHistoryBtn.addEventListener('click', clearHistory);
                
                // Storage sync
                window.addEventListener('storage', (e) => {
                    if (e.key === STORAGE_KEY) {
                        loadSessions();
                        updateStats();
                        renderHistory();
                    }
                });
                
                // Update duration select when timer preset changes (optional)
                presetBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const mins = btn.dataset.minutes;
                        durationSelect.value = mins;
                    });
                });
            }

            init();
        })();