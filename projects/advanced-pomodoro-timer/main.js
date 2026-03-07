// ── STATE ──
const DEFAULT_SETTINGS = {
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    notifications: true,
    soundEnabled: true
};

class PomodoroApp {
    constructor() {
        this.settings = this.loadSettings();
        this.tasks = this.loadTasks();
        this.sessions = this.loadSessions();
        this.currentTaskId = '';
        this.sessionType = 'work';
        this.sessionCount = parseInt(localStorage.getItem('pomo_sessionCount')) || 0;
        this.todayCount = this.getTodayCount();
        this.timeLeft = this.settings.workDuration * 60;
        this.totalTime = this.timeLeft;
        this.isRunning = false;
        this.interval = null;
        this.editingId = null;
        this.taskFilter = 'all';
        this.audioCtx = null;

        this.initAudio();
        this.bindDOM();
        this.bindEvents();
        this.applyModeClass();
        this.renderAll();
    }

    // ── PERSISTENCE ──
    loadSettings() {
        try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem('pomo_settings') || '{}') }; }
        catch { return { ...DEFAULT_SETTINGS }; }
    }
    saveSettings() { localStorage.setItem('pomo_settings', JSON.stringify(this.settings)); }

    loadTasks() {
        try { return JSON.parse(localStorage.getItem('pomo_tasks') || '[]'); }
        catch { return []; }
    }
    saveTasks() { localStorage.setItem('pomo_tasks', JSON.stringify(this.tasks)); }

    loadSessions() {
        try { return JSON.parse(localStorage.getItem('pomo_sessions') || '[]'); }
        catch { return []; }
    }
    saveSessions() { localStorage.setItem('pomo_sessions', JSON.stringify(this.sessions)); }

    getTodayCount() {
        const today = new Date().toDateString();
        return this.sessions.filter(s => new Date(s.date).toDateString() === today && s.type === 'work').length;
    }

    // ── AUDIO ──
    initAudio() {
        try { this.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch { }
    }

    playSound(type) {
        if (!this.settings.soundEnabled || !this.audioCtx) return;
        try {
            this.audioCtx.resume();
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.connect(gain); gain.connect(this.audioCtx.destination);
            if (type === 'start') {
                osc.frequency.value = 520; osc.type = 'sine';
                gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);
                osc.start(); osc.stop(this.audioCtx.currentTime + 0.3);
            } else if (type === 'done') {
                [440, 554, 659].forEach((f, i) => {
                    const o = this.audioCtx.createOscillator();
                    const g = this.audioCtx.createGain();
                    o.connect(g); g.connect(this.audioCtx.destination);
                    o.frequency.value = f; o.type = 'sine';
                    const t = this.audioCtx.currentTime + i * 0.15;
                    g.gain.setValueAtTime(0, t);
                    g.gain.linearRampToValueAtTime(0.2, t + 0.05);
                    g.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
                    o.start(t); o.stop(t + 0.4);
                });
            } else if (type === 'tick') {
                osc.frequency.value = 800; osc.type = 'square';
                gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.06);
                osc.start(); osc.stop(this.audioCtx.currentTime + 0.06);
            }
        } catch { }
    }

    // ── DOM REFS ──
    bindDOM() {
        this.$timer = document.getElementById('timerDisplay');
        this.$modeLabel = document.getElementById('modeLabel');
        this.$ring = document.getElementById('ringProgress');
        this.$sessionDots = document.getElementById('sessionDots');
        this.$toggleBtn = document.getElementById('toggleBtn');
        this.$resetBtn = document.getElementById('resetBtn');
        this.$skipBtn = document.getElementById('skipBtn');
        this.$taskSelect = document.getElementById('taskSelect');
        this.$taskList = document.getElementById('taskList');
        this.$tasksCount = document.getElementById('tasksCount');
        this.$streakCount = document.getElementById('streakCount');
        this.$streakFill = document.getElementById('streakFill');
        this.$modeTabs = document.querySelectorAll('.mode-tab');
        this.$addForm = document.getElementById('addTaskForm');
        this.$tfBtns = document.querySelectorAll('.tf-btn');
        this.$settingsBtn = document.getElementById('settingsBtn');
        this.$settingsPanel = document.getElementById('settingsPanel');
        this.$closeSettings = document.getElementById('closeSettings');
        this.$panelOverlay = document.getElementById('panelOverlay');
        this.$settingsForm = document.getElementById('settingsForm');
        this.$dashBtn = document.getElementById('dashboardBtn');
        this.$dashBackdrop = document.getElementById('dashboardBackdrop');
        this.$closeDash = document.getElementById('closeDashboard');
        this.$toastStack = document.getElementById('toastStack');
    }

    // ── EVENTS ──
    bindEvents() {
        // Timer controls
        this.$toggleBtn.addEventListener('click', () => this.toggleTimer());
        this.$resetBtn.addEventListener('click', () => this.resetTimer());
        this.$skipBtn.addEventListener('click', () => this.skipSession());

        // Mode tabs
        this.$modeTabs.forEach(btn => btn.addEventListener('click', () => {
            if (this.isRunning) return;
            this.switchMode(btn.dataset.type);
        }));

        // Task select
        this.$taskSelect.addEventListener('change', e => {
            this.currentTaskId = e.target.value;
            this.renderTaskList();
        });

        // Add task form
        this.$addForm.addEventListener('submit', e => {
            e.preventDefault();
            const fd = new FormData(e.target);
            this.addTask(fd.get('name'), fd.get('description'));
            e.target.reset();
        });

        // Task filter
        this.$tfBtns.forEach(btn => btn.addEventListener('click', () => {
            this.$tfBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.taskFilter = btn.dataset.filter;
            this.renderTaskList();
        }));

        // Settings panel
        this.$settingsBtn.addEventListener('click', () => this.openSettings());
        this.$closeSettings.addEventListener('click', () => this.closeSettings());
        this.$panelOverlay.addEventListener('click', () => this.closeSettings());

        // Settings form
        this.$settingsForm.addEventListener('submit', e => {
            e.preventDefault();
            this.saveSettingsForm();
        });

        // Number input +/- buttons
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const field = btn.dataset.field;
                const delta = parseInt(btn.dataset.delta);
                const input = this.$settingsForm.querySelector(`[name="${field}"]`);
                if (input) {
                    const val = parseInt(input.value) + delta;
                    input.value = Math.max(parseInt(input.min), Math.min(parseInt(input.max), val));
                }
            });
        });

        // Dashboard
        this.$dashBtn.addEventListener('click', () => this.openDashboard());
        this.$closeDash.addEventListener('click', () => this.closeDashboard());
        this.$dashBackdrop.addEventListener('click', e => {
            if (e.target === this.$dashBackdrop) this.closeDashboard();
        });

        // Page leave warning
        window.addEventListener('beforeunload', e => {
            if (this.isRunning) { e.preventDefault(); e.returnValue = ''; }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', e => {
            if (e.target.matches('input, textarea, select')) return;
            if (e.code === 'Space') { e.preventDefault(); this.toggleTimer(); }
            if (e.code === 'KeyR') this.resetTimer();
            if (e.code === 'KeyS') this.skipSession();
        });
    }

    // ── TIMER ──
    toggleTimer() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }

    start() {
        if (this.audioCtx) this.audioCtx.resume();
        this.isRunning = true;
        this.updateToggleBtn();
        this.playSound('start');

        this.interval = setInterval(() => {
            this.timeLeft--;
            if (this.timeLeft % 60 === 0 && this.settings.soundEnabled) this.playSound('tick');
            this.updateTimerDisplay();
            this.updateRing();
            if (this.timeLeft <= 0) this.complete();
        }, 1000);
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.interval);
        this.interval = null;
        this.updateToggleBtn();
        this.toast('Paused', 'info');
    }

    resetTimer() {
        this.isRunning = false;
        clearInterval(this.interval);
        this.interval = null;
        this.timeLeft = this.getDuration(this.sessionType);
        this.totalTime = this.timeLeft;
        this.updateTimerDisplay();
        this.updateRing();
        this.updateToggleBtn();
    }

    skipSession() {
        this.isRunning = false;
        clearInterval(this.interval);
        this.interval = null;
        this.advanceSession(false);
    }

    complete() {
        clearInterval(this.interval);
        this.interval = null;
        this.isRunning = false;
        this.playSound('done');

        if (this.sessionType === 'work') {
            this.sessionCount++;
            this.todayCount++;
            localStorage.setItem('pomo_sessionCount', this.sessionCount);

            // Save session
            const task = this.tasks.find(t => t.id === this.currentTaskId);
            this.sessions.unshift({
                id: Date.now().toString(),
                taskId: this.currentTaskId,
                taskName: task ? task.name : 'No task',
                duration: this.settings.workDuration,
                date: new Date().toISOString(),
                type: 'work'
            });
            if (this.sessions.length > 50) this.sessions = this.sessions.slice(0, 50);
            this.saveSessions();

            // Update task pomodoros
            if (task) {
                task.pomodoros = (task.pomodoros || 0) + 1;
                task.totalMinutes = (task.totalMinutes || 0) + this.settings.workDuration;
                task.lastUsed = new Date().toISOString();
                this.saveTasks();
            }

            this.toast('Focus session complete! 🎉', 'success');
            this.notify('Focus session complete! Time for a break.');
            this.renderTaskList();
            this.renderTaskSelect();
            this.updateStreak();
        } else {
            this.toast('Break over! Ready to focus? 💪', 'info');
            this.notify('Break over! Time to focus.');
        }

        this.advanceSession(true);
    }

    advanceSession(auto) {
        if (this.sessionType === 'work') {
            const isLong = this.sessionCount % this.settings.longBreakInterval === 0;
            this.switchMode(isLong ? 'long-break' : 'short-break');
            if (auto && this.settings.autoStartBreaks) setTimeout(() => this.start(), 1500);
        } else {
            this.switchMode('work');
            if (auto && this.settings.autoStartPomodoros) setTimeout(() => this.start(), 1500);
        }
        this.updateToggleBtn();
    }

    switchMode(type) {
        this.sessionType = type;
        this.timeLeft = this.getDuration(type);
        this.totalTime = this.timeLeft;
        this.applyModeClass();
        this.updateModeTabs();
        this.updateModeLabel();
        this.updateTimerDisplay();
        this.updateRing();
        this.updateToggleBtn();
    }

    getDuration(type) {
        if (type === 'work') return this.settings.workDuration * 60;
        if (type === 'short-break') return this.settings.breakDuration * 60;
        if (type === 'long-break') return this.settings.longBreakDuration * 60;
        return this.settings.workDuration * 60;
    }

    // ── UI UPDATES ──
    applyModeClass() {
        document.body.className = `mode-${this.sessionType}`;
    }

    updateToggleBtn() {
        const play = this.$toggleBtn.querySelector('.icon-play');
        const pause = this.$toggleBtn.querySelector('.icon-pause');
        play.style.display = this.isRunning ? 'none' : '';
        pause.style.display = this.isRunning ? '' : 'none';
    }

    updateTimerDisplay() {
        const m = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
        const s = (this.timeLeft % 60).toString().padStart(2, '0');
        this.$timer.textContent = `${m}:${s}`;
    }

    updateRing() {
        const circumference = 2 * Math.PI * 108; // r=108
        const progress = this.totalTime > 0 ? this.timeLeft / this.totalTime : 1;
        const offset = circumference * (1 - progress);
        this.$ring.style.strokeDashoffset = offset;
    }

    updateModeLabel() {
        const labels = { work: 'Focus Time', 'short-break': 'Short Break', 'long-break': 'Long Break' };
        this.$modeLabel.textContent = labels[this.sessionType] || 'Focus Time';
    }

    updateModeTabs() {
        this.$modeTabs.forEach(btn => btn.classList.toggle('active', btn.dataset.type === this.sessionType));
    }

    updateSessionDots() {
        const interval = this.settings.longBreakInterval;
        const filled = this.sessionCount % interval;
        this.$sessionDots.innerHTML = Array.from({ length: interval }, (_, i) =>
            `<div class="s-dot${i < filled ? ' filled' : ''}"></div>`
        ).join('');
    }

    updateStreak() {
        const max = 12;
        const pct = Math.min((this.todayCount / max) * 100, 100);
        this.$streakFill.style.width = pct + '%';
        this.$streakCount.textContent = `${this.todayCount} session${this.todayCount !== 1 ? 's' : ''}`;
    }

    // ── TASKS ──
    addTask(name, desc) {
        if (!name.trim()) return;
        const task = {
            id: Date.now().toString(),
            name: name.trim(),
            description: desc.trim(),
            done: false,
            pomodoros: 0,
            totalMinutes: 0,
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString()
        };
        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTaskList();
        this.renderTaskSelect();
        this.toast('Task added', 'success');
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        if (this.currentTaskId === id) this.currentTaskId = '';
        this.saveTasks();
        this.renderTaskList();
        this.renderTaskSelect();
    }

    toggleDone(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) { task.done = !task.done; this.saveTasks(); this.renderTaskList(); }
    }

    startEditing(id) {
        this.editingId = id;
        this.renderTaskList();
    }

    saveEdit(id, name, desc) {
        const task = this.tasks.find(t => t.id === id);
        if (task && name.trim()) {
            task.name = name.trim();
            task.description = desc.trim();
            task.lastUsed = new Date().toISOString();
            this.saveTasks();
        }
        this.editingId = null;
        this.renderTaskList();
        this.renderTaskSelect();
    }

    setActiveTask(id) {
        this.currentTaskId = id;
        this.$taskSelect.value = id;
        this.renderTaskList();
        this.toast('Task set as active', 'info');
    }

    getFilteredTasks() {
        if (this.taskFilter === 'active') return this.tasks.filter(t => !t.done);
        if (this.taskFilter === 'done') return this.tasks.filter(t => t.done);
        return this.tasks;
    }

    // ── RENDER ──
    renderAll() {
        this.updateTimerDisplay();
        this.updateRing();
        this.updateModeLabel();
        this.updateModeTabs();
        this.updateSessionDots();
        this.updateStreak();
        this.renderTaskSelect();
        this.renderTaskList();
        this.syncSettingsForm();
    }

    renderTaskSelect() {
        const current = this.currentTaskId;
        this.$taskSelect.innerHTML = '<option value="">— Select a task —</option>' +
            this.tasks.filter(t => !t.done).map(t =>
                `<option value="${t.id}" ${t.id === current ? 'selected' : ''}>${this.esc(t.name)} (${t.pomodoros} 🍅)</option>`
            ).join('');
    }

    renderTaskList() {
        const filtered = this.getFilteredTasks();
        this.$tasksCount.textContent = this.tasks.length;

        if (filtered.length === 0) {
            this.$taskList.innerHTML = `
                <div class="empty-tasks">
                    <span class="empty-tasks-icon">📋</span>
                    ${this.taskFilter === 'all' ? 'No tasks yet. Add one above!' :
                    this.taskFilter === 'done' ? 'No completed tasks yet.' : 'No active tasks.'}
                </div>`;
            return;
        }

        this.$taskList.innerHTML = filtered.map(task => {
            if (this.editingId === task.id) return this.renderEditForm(task);
            return this.renderTaskItem(task);
        }).join('');

        // Bind task events
        this.$taskList.querySelectorAll('[data-action]').forEach(el => {
            el.addEventListener('click', e => {
                e.stopPropagation();
                const action = el.dataset.action;
                const id = el.closest('[data-task-id]').dataset.taskId;
                if (action === 'delete') this.deleteTask(id);
                if (action === 'edit') this.startEditing(id);
                if (action === 'toggle') this.toggleDone(id);
                if (action === 'setactive') this.setActiveTask(id);
            });
        });

        this.$taskList.querySelectorAll('.edit-save').forEach(btn => {
            btn.addEventListener('click', () => {
                const wrap = btn.closest('[data-task-id]');
                const id = wrap.dataset.taskId;
                const name = wrap.querySelector('.edit-name').value;
                const desc = wrap.querySelector('.edit-desc').value;
                this.saveEdit(id, name, desc);
            });
        });

        this.$taskList.querySelectorAll('.edit-cancel').forEach(btn => {
            btn.addEventListener('click', () => { this.editingId = null; this.renderTaskList(); });
        });
    }

    renderTaskItem(task) {
        const isActive = task.id === this.currentTaskId;
        const checked = task.done ? 'checked' : '';
        return `
        <div class="task-item${task.done ? ' done-task' : ''}${isActive ? ' is-active' : ''}" data-task-id="${task.id}">
            <div class="task-top">
                <div class="task-check${task.done ? ' checked' : ''}" data-action="toggle" title="Toggle done"></div>
                <div class="task-info">
                    <div class="task-name">${this.esc(task.name)}</div>
                    ${task.description ? `<div class="task-desc">${this.esc(task.description)}</div>` : ''}
                </div>
                <div class="task-actions-row">
                    ${!task.done ? `<button class="task-act-btn set-active" data-action="setactive" title="Set active">
                        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                    </button>` : ''}
                    <button class="task-act-btn" data-action="edit" title="Edit">
                        <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    </button>
                    <button class="task-act-btn danger" data-action="delete" title="Delete">
                        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    </button>
                </div>
            </div>
            <div class="task-meta">
                <span class="task-pomodoro-count">🍅 ${task.pomodoros}</span>
                <span>${task.totalMinutes}m logged</span>
                ${isActive ? '<span style="color:var(--green)">● Active</span>' : ''}
            </div>
        </div>`;
    }

    renderEditForm(task) {
        return `
        <div class="task-item" data-task-id="${task.id}">
            <div class="task-edit-form">
                <input class="task-input edit-name" value="${this.esc(task.name)}" placeholder="Task name" autocomplete="off">
                <input class="task-input edit-desc" value="${this.esc(task.description || '')}" placeholder="Note (optional)" autocomplete="off">
                <div class="edit-actions">
                    <button class="edit-cancel">Cancel</button>
                    <button class="edit-save">Save</button>
                </div>
            </div>
        </div>`;
    }

    // ── SETTINGS ──
    openSettings() {
        this.syncSettingsForm();
        this.$settingsPanel.classList.add('open');
        this.$panelOverlay.classList.add('show');
    }

    closeSettings() {
        this.$settingsPanel.classList.remove('open');
        this.$panelOverlay.classList.remove('show');
    }

    syncSettingsForm() {
        const f = this.$settingsForm;
        Object.keys(this.settings).forEach(key => {
            const el = f.querySelector(`[name="${key}"]`);
            if (!el) return;
            if (el.type === 'checkbox') el.checked = this.settings[key];
            else el.value = this.settings[key];
        });
    }

    saveSettingsForm() {
        const f = this.$settingsForm;
        const prev = { ...this.settings };
        this.settings = {
            workDuration: parseInt(f.querySelector('[name="workDuration"]').value),
            breakDuration: parseInt(f.querySelector('[name="breakDuration"]').value),
            longBreakDuration: parseInt(f.querySelector('[name="longBreakDuration"]').value),
            longBreakInterval: parseInt(f.querySelector('[name="longBreakInterval"]').value),
            autoStartBreaks: f.querySelector('[name="autoStartBreaks"]').checked,
            autoStartPomodoros: f.querySelector('[name="autoStartPomodoros"]').checked,
            notifications: f.querySelector('[name="notifications"]').checked,
            soundEnabled: f.querySelector('[name="soundEnabled"]').checked,
        };
        this.saveSettings();

        if (!this.isRunning) {
            this.timeLeft = this.getDuration(this.sessionType);
            this.totalTime = this.timeLeft;
            this.updateTimerDisplay();
            this.updateRing();
        }

        this.updateSessionDots();
        this.closeSettings();
        this.toast('Settings saved ✓', 'success');
    }

    // ── DASHBOARD ──
    openDashboard() {
        this.renderDashboard();
        this.$dashBackdrop.classList.add('open');
    }

    closeDashboard() {
        this.$dashBackdrop.classList.remove('open');
    }

    renderDashboard() {
        const totalPomodoros = this.tasks.reduce((s, t) => s + (t.pomodoros || 0), 0);
        const totalMinutes = this.tasks.reduce((s, t) => s + (t.totalMinutes || 0), 0);

        document.getElementById('dashStats').innerHTML = `
            <div class="dash-stat"><div class="dash-stat-val">${this.todayCount}</div><div class="dash-stat-lbl">Today</div></div>
            <div class="dash-stat"><div class="dash-stat-val">${totalPomodoros}</div><div class="dash-stat-lbl">Total 🍅</div></div>
            <div class="dash-stat"><div class="dash-stat-val">${this.tasks.length}</div><div class="dash-stat-lbl">Tasks</div></div>
            <div class="dash-stat"><div class="dash-stat-val">${Math.round(totalMinutes / 60 * 10) / 10}h</div><div class="dash-stat-lbl">Focused</div></div>
        `;

        // Heatmap last 7 days
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const heatData = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (6 - i));
            const ds = d.toDateString();
            const count = this.sessions.filter(s => new Date(s.date).toDateString() === ds && s.type === 'work').length;
            return { label: days[d.getDay()], count };
        });
        document.getElementById('heatmapWrap').innerHTML = heatData.map(d => {
            const level = d.count === 0 ? 0 : d.count <= 1 ? 1 : d.count <= 3 ? 2 : d.count <= 5 ? 3 : 4;
            return `<div class="heatmap-day">
                <div class="heatmap-cell heat-${level}" title="${d.count} sessions"></div>
                <div class="heatmap-label">${d.label}</div>
            </div>`;
        }).join('');

        // Task performance
        const sorted = [...this.tasks].sort((a, b) => (b.pomodoros || 0) - (a.pomodoros || 0)).slice(0, 5);
        document.getElementById('perfList').innerHTML = sorted.length
            ? sorted.map(t => `
                <div class="perf-item">
                    <div>
                        <div class="perf-name">${this.esc(t.name)}</div>
                        <div class="perf-stats">${t.pomodoros} 🍅 · ${t.totalMinutes}m · ${t.done ? '✓ Done' : 'Active'}</div>
                    </div>
                </div>`).join('')
            : '<div class="dash-empty">No task data yet.</div>';

        // Recent sessions
        const recent = this.sessions.slice(0, 8);
        document.getElementById('sessionsList').innerHTML = recent.length
            ? recent.map(s => {
                const d = new Date(s.date);
                const fmt = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                return `<div class="session-item">
                    <div>
                        <div class="session-task">${this.esc(s.taskName)}</div>
                        <div class="session-meta">${s.duration}min · ${fmt}</div>
                    </div>
                </div>`;
            }).join('')
            : '<div class="dash-empty">No sessions yet. Start your first focus session!</div>';
    }

    // ── NOTIFICATIONS ──
    notify(msg) {
        if (!this.settings.notifications) return;
        if (!('Notification' in window)) return;
        if (Notification.permission === 'granted') {
            new Notification('Focus Timer', { body: msg });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(p => {
                if (p === 'granted') new Notification('Focus Timer', { body: msg });
            });
        }
    }

    // ── TOAST ──
    toast(msg, type = 'default') {
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.textContent = msg;
        this.$toastStack.appendChild(el);
        setTimeout(() => {
            el.classList.add('exit');
            setTimeout(() => el.remove(), 300);
        }, 2800);
    }

    // ── UTIL ──
    esc(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
    }
}

document.addEventListener('DOMContentLoaded', () => new PomodoroApp());