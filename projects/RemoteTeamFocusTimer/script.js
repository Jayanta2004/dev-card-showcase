// Remote Team Focus Timer & Daily Standup Board

class TeamFocusApp {
    constructor() {
        this.userName = localStorage.getItem('userName') || 'Team Member';
        this.timerSettings = JSON.parse(localStorage.getItem('timerSettings')) || {
            focus: 25,
            shortBreak: 5,
            longBreak: 15,
            autoStartBreaks: false,
            soundEnabled: true
        };
        
        this.timerState = {
            mode: 'focus',
            timeLeft: this.timerSettings.focus * 60,
            totalTime: this.timerSettings.focus * 60,
            isRunning: false,
            interval: null
        };

        this.pomodorosToday = parseInt(localStorage.getItem('pomodorosToday')) || 0;
        this.lastPomodoroDate = localStorage.getItem('lastPomodoroDate') || this.getTodayDate();
        
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.standupUpdates = JSON.parse(localStorage.getItem('standupUpdates')) || [];
        this.teamMembers = JSON.parse(localStorage.getItem('teamMembers')) || [];
        this.meetingNotes = JSON.parse(localStorage.getItem('meetingNotes')) || [];
        this.focusSessions = JSON.parse(localStorage.getItem('focusSessions')) || [];
        
        this.currentEditingId = null;
        this.currentTab = 'timer';
        this.currentStandupDate = new Date();
        
        this.init();
    }

    init() {
        this.checkPomodoroDate();
        this.updateUserName();
        this.setupEventListeners();
        this.updateTimerDisplay();
        this.updatePomodoroCounter();
        this.renderTeamSessions();
        this.renderTasks();
        this.renderStandupBoard();
        this.renderTeamMembers();
        this.renderMeetingNotes();
        this.updateReports();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // User Profile
        document.getElementById('editUserBtn').addEventListener('click', () => this.openUserModal());
        document.getElementById('closeUserModal').addEventListener('click', () => this.closeUserModal());
        document.getElementById('cancelUserBtn').addEventListener('click', () => this.closeUserModal());
        document.getElementById('userForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUserName();
        });

        // Timer Controls
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchMode(e.target.closest('.mode-btn').dataset.mode);
            });
        });
        document.getElementById('startBtn').addEventListener('click', () => this.toggleTimer());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetTimer());
        
        // Timer Settings
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettingsModal());
        document.getElementById('closeSettingsModal').addEventListener('click', () => this.closeSettingsModal());
        document.getElementById('cancelSettingsBtn').addEventListener('click', () => this.closeSettingsModal());
        document.getElementById('settingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettings();
        });

        // Tasks
        document.getElementById('addTaskBtn').addEventListener('click', () => this.openTaskModal());
        document.getElementById('closeTaskModal').addEventListener('click', () => this.closeTaskModal());
        document.getElementById('cancelTaskBtn').addEventListener('click', () => this.closeTaskModal());
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        // Standup
        document.getElementById('addStandupBtn').addEventListener('click', () => this.openStandupModal());
        document.getElementById('closeStandupModal').addEventListener('click', () => this.closeStandupModal());
        document.getElementById('cancelStandupBtn').addEventListener('click', () => this.closeStandupModal());
        document.getElementById('standupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveStandup();
        });
        document.getElementById('prevDayBtn').addEventListener('click', () => this.changeStandupDate(-1));
        document.getElementById('nextDayBtn').addEventListener('click', () => this.changeStandupDate(1));

        // Team Members
        document.getElementById('addMemberBtn').addEventListener('click', () => this.openMemberModal());
        document.getElementById('closeMemberModal').addEventListener('click', () => this.closeMemberModal());
        document.getElementById('cancelMemberBtn').addEventListener('click', () => this.closeMemberModal());
        document.getElementById('memberForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMember();
        });

        // Meeting Notes
        document.getElementById('addNoteBtn').addEventListener('click', () => this.openNoteModal());
        document.getElementById('closeNoteModal').addEventListener('click', () => this.closeNoteModal());
        document.getElementById('cancelNoteBtn').addEventListener('click', () => this.closeNoteModal());
        document.getElementById('noteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNote();
        });

        // Reports
        document.getElementById('reportPeriod').addEventListener('change', () => this.updateReports());
        document.getElementById('exportReportBtn').addEventListener('click', () => this.exportReport());

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    switchTab(tab) {
        this.currentTab = tab;
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}-section`).classList.add('active');
    }

    // Timer Functions
    switchMode(mode) {
        if (this.timerState.isRunning) {
            this.stopTimer();
        }
        
        this.timerState.mode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        const durations = {
            focus: this.timerSettings.focus,
            short: this.timerSettings.shortBreak,
            long: this.timerSettings.longBreak
        };
        
        this.timerState.timeLeft = durations[mode] * 60;
        this.timerState.totalTime = durations[mode] * 60;
        this.updateTimerDisplay();
        
        const labels = {
            focus: 'Focus Time',
            short: 'Short Break',
            long: 'Long Break'
        };
        document.getElementById('timerLabel').textContent = labels[mode];
    }

    toggleTimer() {
        if (this.timerState.isRunning) {
            this.stopTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        this.timerState.isRunning = true;
        document.getElementById('startBtn').innerHTML = '<i class="fas fa-pause"></i> Pause';
        
        // Add to team sessions
        this.addTeamSession();
        
        this.timerState.interval = setInterval(() => {
            this.timerState.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timerState.timeLeft <= 0) {
                this.timerComplete();
            }
        }, 1000);
    }

    stopTimer() {
        this.timerState.isRunning = false;
        clearInterval(this.timerState.interval);
        document.getElementById('startBtn').innerHTML = '<i class="fas fa-play"></i> Start';
        this.removeTeamSession();
    }

    resetTimer() {
        this.stopTimer();
        const durations = {
            focus: this.timerSettings.focus,
            short: this.timerSettings.shortBreak,
            long: this.timerSettings.longBreak
        };
        this.timerState.timeLeft = durations[this.timerState.mode] * 60;
        this.timerState.totalTime = durations[this.timerState.mode] * 60;
        this.updateTimerDisplay();
    }

    timerComplete() {
        this.stopTimer();
        
        if (this.timerState.mode === 'focus') {
            this.pomodorosToday++;
            this.lastPomodoroDate = this.getTodayDate();
            localStorage.setItem('pomodorosToday', this.pomodorosToday);
            localStorage.setItem('lastPomodoroDate', this.lastPomodoroDate);
            this.updatePomodoroCounter();
            
            // Save session
            this.saveFocusSession();
        }
        
        if (this.timerSettings.soundEnabled) {
            this.playNotificationSound();
        }
        
        this.showToast('Timer completed!');
        
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Focus Timer', {
                body: this.timerState.mode === 'focus' ? 'Focus session complete! Take a break.' : 'Break time is over!',
                icon: '⏰'
            });
        }
        
        // Auto-start next session
        if (this.timerSettings.autoStartBreaks) {
            setTimeout(() => {
                if (this.timerState.mode === 'focus') {
                    this.switchMode(this.pomodorosToday % 4 === 0 ? 'long' : 'short');
                } else {
                    this.switchMode('focus');
                }
                this.startTimer();
            }, 3000);
        }
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timerState.timeLeft / 60);
        const seconds = this.timerState.timeLeft % 60;
        document.getElementById('timeDisplay').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update progress circle
        const progress = (this.timerState.timeLeft / this.timerState.totalTime);
        const circumference = 2 * Math.PI * 90;
        const offset = circumference * (1 - progress);
        document.getElementById('progressCircle').style.strokeDashoffset = offset;
        
        // Update page title
        document.title = `${minutes}:${seconds.toString().padStart(2, '0')} - Team Focus Timer`;
    }

    updatePomodoroCounter() {
        const container = document.getElementById('pomodoroTomatoes');
        container.innerHTML = '';
        for (let i = 0; i < this.pomodorosToday; i++) {
            const tomato = document.createElement('span');
            tomato.className = 'tomato';
            tomato.textContent = '🍅';
            container.appendChild(tomato);
        }
        document.getElementById('pomodoroCount').textContent = this.pomodorosToday;
    }

    checkPomodoroDate() {
        const today = this.getTodayDate();
        if (this.lastPomodoroDate !== today) {
            this.pomodorosToday = 0;
            this.lastPomodoroDate = today;
            localStorage.setItem('pomodorosToday', this.pomodorosToday);
            localStorage.setItem('lastPomodoroDate', this.lastPomodoroDate);
        }
    }

    saveFocusSession() {
        const session = {
            id: Date.now(),
            date: new Date().toISOString(),
            duration: this.timerSettings.focus,
            type: 'focus'
        };
        this.focusSessions.push(session);
        this.saveData();
        this.updateReports();
    }

    playNotificationSound() {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTUIGWi77eefTRAMUKfj8LZjHAY4ktfyy3ksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgc7y2Yk1CBlou+3nn00QDFCn4/C2YxwGOJLX8st5LAUkd8fw3ZBACh');
        audio.play().catch(() => {});
    }

    // Team Sessions
    addTeamSession() {
        const sessions = JSON.parse(sessionStorage.getItem('activeSessions')) || [];
        const session = {
            id: Date.now(),
            user: this.userName,
            mode: this.timerState.mode,
            startTime: Date.now(),
            duration: this.timerState.totalTime
        };
        sessions.push(session);
        sessionStorage.setItem('activeSessions', JSON.stringify(sessions));
        this.renderTeamSessions();
    }

    removeTeamSession() {
        const sessions = JSON.parse(sessionStorage.getItem('activeSessions')) || [];
        const filtered = sessions.filter(s => s.user !== this.userName);
        sessionStorage.setItem('activeSessions', JSON.stringify(filtered));
        this.renderTeamSessions();
    }

    renderTeamSessions() {
        const container = document.getElementById('teamSessions');
        const sessions = JSON.parse(sessionStorage.getItem('activeSessions')) || [];
        
        if (sessions.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No active sessions</p></div>';
            return;
        }

        container.innerHTML = sessions.map(session => {
            const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
            const remaining = Math.max(0, session.duration - elapsed);
            const progress = ((session.duration - remaining) / session.duration) * 100;
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            
            return `
                <div class="session-item">
                    <div class="session-header">
                        <span class="session-name">${session.user}</span>
                        <span class="session-time">${minutes}:${seconds.toString().padStart(2, '0')}</span>
                    </div>
                    <div class="session-progress">
                        <div class="session-progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // User Profile
    updateUserName() {
        document.getElementById('userName').textContent = this.userName;
    }

    openUserModal() {
        document.getElementById('userNameInput').value = this.userName;
        document.getElementById('userModal').classList.add('active');
    }

    closeUserModal() {
        document.getElementById('userModal').classList.remove('active');
    }

    saveUserName() {
        this.userName = document.getElementById('userNameInput').value;
        localStorage.setItem('userName', this.userName);
        this.updateUserName();
        this.closeUserModal();
        this.showToast('Profile updated!');
    }

    // Settings
    openSettingsModal() {
        document.getElementById('focusDuration').value = this.timerSettings.focus;
        document.getElementById('shortBreakDuration').value = this.timerSettings.shortBreak;
        document.getElementById('longBreakDuration').value = this.timerSettings.longBreak;
        document.getElementById('autoStartBreaks').checked = this.timerSettings.autoStartBreaks;
        document.getElementById('soundEnabled').checked = this.timerSettings.soundEnabled;
        document.getElementById('settingsModal').classList.add('active');
    }

    closeSettingsModal() {
        document.getElementById('settingsModal').classList.remove('active');
    }

    saveSettings() {
        this.timerSettings.focus = parseInt(document.getElementById('focusDuration').value);
        this.timerSettings.shortBreak = parseInt(document.getElementById('shortBreakDuration').value);
        this.timerSettings.longBreak = parseInt(document.getElementById('longBreakDuration').value);
        this.timerSettings.autoStartBreaks = document.getElementById('autoStartBreaks').checked;
        this.timerSettings.soundEnabled = document.getElementById('soundEnabled').checked;
        
        localStorage.setItem('timerSettings', JSON.stringify(this.timerSettings));
        this.resetTimer();
        this.closeSettingsModal();
        this.showToast('Settings saved!');
    }

    // Tasks Management
    openTaskModal(taskId = null) {
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('taskModalTitle');
        
        if (taskId) {
            const task = this.tasks.find(t => t.id === taskId);
            title.textContent = 'Edit Task';
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskEstimate').value = task.estimate;
            this.currentEditingId = taskId;
        } else {
            title.textContent = 'Add Task';
            document.getElementById('taskForm').reset();
            this.currentEditingId = null;
        }
        
        modal.classList.add('active');
    }

    closeTaskModal() {
        document.getElementById('taskModal').classList.remove('active');
        this.currentEditingId = null;
    }

    saveTask() {
        const task = {
            id: this.currentEditingId || Date.now(),
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            estimate: parseInt(document.getElementById('taskEstimate').value),
            status: this.currentEditingId ? 
                this.tasks.find(t => t.id === this.currentEditingId).status : 
                'pending',
            createdAt: this.currentEditingId ?
                this.tasks.find(t => t.id === this.currentEditingId).createdAt :
                new Date().toISOString(),
            completedAt: null
        };

        if (this.currentEditingId) {
            const index = this.tasks.findIndex(t => t.id === this.currentEditingId);
            this.tasks[index] = task;
            this.showToast('Task updated!');
        } else {
            this.tasks.push(task);
            this.showToast('Task added!');
        }

        this.saveData();
        this.renderTasks();
        this.closeTaskModal();
    }

    deleteTask(id) {
        if (confirm('Delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveData();
            this.renderTasks();
            this.showToast('Task deleted');
        }
    }

    changeTaskStatus(id, newStatus) {
        const task = this.tasks.find(t => t.id === id);
        task.status = newStatus;
        if (newStatus === 'completed') {
            task.completedAt = new Date().toISOString();
        }
        this.saveData();
        this.renderTasks();
        this.updateReports();
    }

    renderTasks() {
        const pending = this.tasks.filter(t => t.status === 'pending');
        const inProgress = this.tasks.filter(t => t.status === 'in-progress');
        const completed = this.tasks.filter(t => t.status === 'completed');

        document.getElementById('totalTasks').textContent = this.tasks.length;
        document.getElementById('completedTasks').textContent = completed.length;
        document.getElementById('inProgressTasks').textContent = inProgress.length;
        document.getElementById('pendingTasks').textContent = pending.length;

        this.renderTaskList('pendingList', pending);
        this.renderTaskList('inProgressList', inProgress);
        this.renderTaskList('completedList', completed);
    }

    renderTaskList(listId, tasks) {
        const list = document.getElementById(listId);
        
        if (tasks.length === 0) {
            list.innerHTML = '<div class="empty-state"><p>No tasks</p></div>';
            return;
        }

        list.innerHTML = tasks.map(task => `
            <div class="task-item priority-${task.priority}">
                <div class="task-header">
                    <div>
                        <div class="task-title">${task.title}</div>
                        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                    </div>
                    <div class="task-actions">
                        <button class="btn-icon" onclick="app.openTaskModal(${task.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="app.deleteTask(${task.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="task-meta">
                    <span><i class="fas fa-flag"></i> ${task.priority}</span>
                    <span><i class="fas fa-clock"></i> ${task.estimate} pomodoro${task.estimate !== 1 ? 's' : ''}</span>
                </div>
                <div style="margin-top: 12px;">
                    <select onchange="app.changeTaskStatus(${task.id}, this.value)" 
                            style="padding: 6px; border-radius: 6px; background: var(--dark-bg); color: var(--text-primary); border: 1px solid var(--border-color); cursor: pointer;">
                        <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </div>
            </div>
        `).join('');
    }

    // Standup Board
    changeStandupDate(days) {
        this.currentStandupDate.setDate(this.currentStandupDate.getDate() + days);
        this.renderStandupBoard();
    }

    openStandupModal() {
        document.getElementById('standupForm').reset();
        document.getElementById('standupModal').classList.add('active');
    }

    closeStandupModal() {
        document.getElementById('standupModal').classList.remove('active');
    }

    saveStandup() {
        const update = {
            id: Date.now(),
            user: this.userName,
            date: this.getTodayDate(),
            yesterday: document.getElementById('standupYesterday').value,
            today: document.getElementById('standupToday').value,
            blockers: document.getElementById('standupBlockers').value,
            timestamp: new Date().toISOString()
        };

        this.standupUpdates.push(update);
        this.saveData();
        this.renderStandupBoard();
        this.closeStandupModal();
        this.showToast('Standup update posted!');
    }

    renderStandupBoard() {
        const dateStr = this.currentStandupDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('standupDate').textContent = dateStr;

        const grid = document.getElementById('standupGrid');
        const targetDate = this.currentStandupDate.toISOString().split('T')[0];
        const updates = this.standupUpdates.filter(u => u.date === targetDate);

        if (updates.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <h3>No standup updates</h3>
                    <p>Be the first to post an update!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = updates.map(update => `
            <div class="standup-card">
                <div class="standup-card-header">
                    <div class="standup-user">
                        <div class="user-avatar">${update.user.charAt(0).toUpperCase()}</div>
                        <div>
                            <div style="font-weight: 600;">${update.user}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">
                                ${new Date(update.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                    <button class="btn-icon" onclick="app.deleteStandup(${update.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="standup-section">
                    <h4><i class="fas fa-check-circle"></i> Yesterday</h4>
                    <p>${update.yesterday}</p>
                </div>
                <div class="standup-section">
                    <h4><i class="fas fa-arrow-right"></i> Today</h4>
                    <p>${update.today}</p>
                </div>
                ${update.blockers ? `
                    <div class="standup-section">
                        <h4><i class="fas fa-exclamation-triangle"></i> Blockers</h4>
                        <p>${update.blockers}</p>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    deleteStandup(id) {
        if (confirm('Delete this standup update?')) {
            this.standupUpdates = this.standupUpdates.filter(u => u.id !== id);
            this.saveData();
            this.renderStandupBoard();
            this.showToast('Update deleted');
        }
    }

    // Team Members
    openMemberModal(memberId = null) {
        const modal = document.getElementById('memberModal');
        
        if (memberId) {
            const member = this.teamMembers.find(m => m.id === memberId);
            document.getElementById('memberName').value = member.name;
            document.getElementById('memberRole').value = member.role;
            document.getElementById('memberStatus').value = member.status;
            this.currentEditingId = memberId;
        } else {
            document.getElementById('memberForm').reset();
            this.currentEditingId = null;
        }
        
        modal.classList.add('active');
    }

    closeMemberModal() {
        document.getElementById('memberModal').classList.remove('active');
        this.currentEditingId = null;
    }

    saveMember() {
        const member = {
            id: this.currentEditingId || Date.now(),
            name: document.getElementById('memberName').value,
            role: document.getElementById('memberRole').value,
            status: document.getElementById('memberStatus').value
        };

        if (this.currentEditingId) {
            const index = this.teamMembers.findIndex(m => m.id === this.currentEditingId);
            this.teamMembers[index] = member;
            this.showToast('Member updated!');
        } else {
            this.teamMembers.push(member);
            this.showToast('Member added!');
        }

        this.saveData();
        this.renderTeamMembers();
        this.closeMemberModal();
    }

    deleteMember(id) {
        if (confirm('Remove this team member?')) {
            this.teamMembers = this.teamMembers.filter(m => m.id !== id);
            this.saveData();
            this.renderTeamMembers();
            this.showToast('Member removed');
        }
    }

    renderTeamMembers() {
        const grid = document.getElementById('teamGrid');

        if (this.teamMembers.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No team members</h3>
                    <p>Add team members to see their status</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.teamMembers.map(member => `
            <div class="team-card">
                <div class="team-avatar">${member.name.charAt(0).toUpperCase()}</div>
                <div class="team-name">${member.name}</div>
                <div class="team-role">${member.role}</div>
                <div class="team-status status-${member.status}">
                    ${this.getStatusLabel(member.status)}
                </div>
                <div style="display: flex; gap: 8px; justify-content: center; margin-top: 16px;">
                    <button class="btn-icon" onclick="app.openMemberModal(${member.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="app.deleteMember(${member.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    getStatusLabel(status) {
        const labels = {
            available: 'Available',
            focus: 'In Focus Mode',
            meeting: 'In Meeting',
            break: 'On Break',
            offline: 'Offline'
        };
        return labels[status] || status;
    }

    // Meeting Notes
    openNoteModal(noteId = null) {
        const modal = document.getElementById('noteModal');
        
        if (noteId) {
            const note = this.meetingNotes.find(n => n.id === noteId);
            document.getElementById('noteTitle').value = note.title;
            document.getElementById('noteDate').value = note.date;
            document.getElementById('noteContent').value = note.content;
            this.currentEditingId = noteId;
        } else {
            document.getElementById('noteForm').reset();
            document.getElementById('noteDate').value = this.getTodayDate();
            this.currentEditingId = null;
        }
        
        modal.classList.add('active');
    }

    closeNoteModal() {
        document.getElementById('noteModal').classList.remove('active');
        this.currentEditingId = null;
    }

    saveNote() {
        const note = {
            id: this.currentEditingId || Date.now(),
            title: document.getElementById('noteTitle').value,
            date: document.getElementById('noteDate').value,
            content: document.getElementById('noteContent').value,
            author: this.userName,
            createdAt: this.currentEditingId ?
                this.meetingNotes.find(n => n.id === this.currentEditingId).createdAt :
                new Date().toISOString()
        };

        if (this.currentEditingId) {
            const index = this.meetingNotes.findIndex(n => n.id === this.currentEditingId);
            this.meetingNotes[index] = note;
            this.showToast('Note updated!');
        } else {
            this.meetingNotes.push(note);
            this.showToast('Note saved!');
        }

        this.saveData();
        this.renderMeetingNotes();
        this.closeNoteModal();
    }

    deleteNote(id) {
        if (confirm('Delete this meeting note?')) {
            this.meetingNotes = this.meetingNotes.filter(n => n.id !== id);
            this.saveData();
            this.renderMeetingNotes();
            this.showToast('Note deleted');
        }
    }

    renderMeetingNotes() {
        const list = document.getElementById('notesList');

        if (this.meetingNotes.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-lines"></i>
                    <h3>No meeting notes</h3>
                    <p>Add notes from your team meetings</p>
                </div>
            `;
            return;
        }

        const sortedNotes = [...this.meetingNotes].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        list.innerHTML = sortedNotes.map(note => `
            <div class="note-card">
                <div class="note-header">
                    <div>
                        <div class="note-title">${note.title}</div>
                        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
                            ${note.author} • ${new Date(note.date).toLocaleDateString()}
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-icon" onclick="app.openNoteModal(${note.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="app.deleteNote(${note.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="note-content">${note.content}</div>
            </div>
        `).join('');
    }

    // Reports
    updateReports() {
        const period = document.getElementById('reportPeriod').value;
        const sessions = this.getFilteredSessions(period);
        
        const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        document.getElementById('totalFocusTime').textContent = `${hours}h ${minutes}m`;
        document.getElementById('totalPomodoros').textContent = sessions.length;
        
        const completedTasks = this.tasks.filter(t => {
            if (t.status !== 'completed') return false;
            const completedDate = new Date(t.completedAt);
            return this.isInPeriod(completedDate, period);
        });
        document.getElementById('tasksCompleted').textContent = completedTasks.length;
        
        const productivity = sessions.length > 0 ? Math.min(100, (sessions.length / 8) * 100) : 0;
        document.getElementById('productivity').textContent = Math.round(productivity) + '%';
        
        this.renderCharts(period);
    }

    getFilteredSessions(period) {
        return this.focusSessions.filter(s => {
            const date = new Date(s.date);
            return this.isInPeriod(date, period);
        });
    }

    isInPeriod(date, period) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (period === 'today') {
            return date >= today;
        } else if (period === 'week') {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return date >= weekAgo;
        } else if (period === 'month') {
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return date >= monthAgo;
        }
        return true;
    }

    renderCharts(period) {
        // Simple canvas-based charts
        this.renderFocusChart(period);
        this.renderTaskChart();
    }

    renderFocusChart(period) {
        const canvas = document.getElementById('focusChart');
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = 300;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const sessions = this.getFilteredSessions(period);
        const dailyData = this.groupSessionsByDay(sessions, period);
        
        this.drawBarChart(ctx, canvas, dailyData);
    }

    renderTaskChart() {
        const canvas = document.getElementById('taskChart');
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = 300;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const pending = this.tasks.filter(t => t.status === 'pending').length;
        const inProgress = this.tasks.filter(t => t.status === 'in-progress').length;
        const completed = this.tasks.filter(t => t.status === 'completed').length;
        
        this.drawPieChart(ctx, canvas, [
            { label: 'Pending', value: pending, color: '#06b6d4' },
            { label: 'In Progress', value: inProgress, color: '#f59e0b' },
            { label: 'Completed', value: completed, color: '#10b981' }
        ]);
    }

    groupSessionsByDay(sessions, period) {
        const days = period === 'today' ? 1 : period === 'week' ? 7 : 30;
        const data = {};
        
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - i));
            const key = date.toISOString().split('T')[0];
            data[key] = 0;
        }
        
        sessions.forEach(session => {
            const key = session.date.split('T')[0];
            if (key in data) {
                data[key] += session.duration;
            }
        });
        
        return data;
    }

    drawBarChart(ctx, canvas, data) {
        const padding = 40;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;
        const values = Object.values(data);
        const maxValue = Math.max(...values, 1);
        const barWidth = chartWidth / values.length;
        
        // Draw axes
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        
        // Draw bars
        values.forEach((value, index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const x = padding + index * barWidth + barWidth * 0.2;
            const y = canvas.height - padding - barHeight;
            const width = barWidth * 0.6;
            
            const gradient = ctx.createLinearGradient(0, y, 0, canvas.height - padding);
            gradient.addColorStop(0, '#6366f1');
            gradient.addColorStop(1, '#8b5cf6');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, width, barHeight);
            
            // Value label
            if (value > 0) {
                ctx.fillStyle = '#f1f5f9';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`${value}m`, x + width / 2, y - 5);
            }
        });
    }

    drawPieChart(ctx, canvas, data) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 40;
        const total = data.reduce((sum, item) => sum + item.value, 0);
        
        if (total === 0) {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No data', centerX, centerY);
            return;
        }
        
        let currentAngle = -Math.PI / 2;
        
        data.forEach(item => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            
            ctx.fillStyle = item.color;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();
            
            // Label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.value, labelX, labelY);
            
            currentAngle += sliceAngle;
        });
        
        // Legend
        let legendY = 20;
        data.forEach(item => {
            ctx.fillStyle = item.color;
            ctx.fillRect(20, legendY, 15, 15);
            
            ctx.fillStyle = '#f1f5f9';
            ctx.font = '13px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`${item.label}: ${item.value}`, 40, legendY + 12);
            
            legendY += 25;
        });
    }

    exportReport() {
        const period = document.getElementById('reportPeriod').value;
        const report = {
            period: period,
            generatedAt: new Date().toISOString(),
            user: this.userName,
            focusSessions: this.getFilteredSessions(period),
            tasks: this.tasks,
            standupUpdates: this.standupUpdates.filter(u => this.isInPeriod(new Date(u.timestamp), period))
        };
        
        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `focus-report-${period}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Report exported!');
    }

    // Utility Functions
    getTodayDate() {
        return new Date().toISOString().split('T')[0];
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

    saveData() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        localStorage.setItem('standupUpdates', JSON.stringify(this.standupUpdates));
        localStorage.setItem('teamMembers', JSON.stringify(this.teamMembers));
        localStorage.setItem('meetingNotes', JSON.stringify(this.meetingNotes));
        localStorage.setItem('focusSessions', JSON.stringify(this.focusSessions));
    }
}

// Initialize the app
const app = new TeamFocusApp();

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Update team sessions periodically
setInterval(() => {
    app.renderTeamSessions();
}, 5000);

// Add gradient definition for timer progress circle
const svg = document.querySelector('.timer-progress');
const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
gradient.setAttribute('id', 'gradient');
gradient.setAttribute('x1', '0%');
gradient.setAttribute('y1', '0%');
gradient.setAttribute('x2', '100%');
gradient.setAttribute('y2', '100%');

const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
stop1.setAttribute('offset', '0%');
stop1.setAttribute('stop-color', '#6366f1');

const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
stop2.setAttribute('offset', '100%');
stop2.setAttribute('stop-color', '#8b5cf6');

gradient.appendChild(stop1);
gradient.appendChild(stop2);
defs.appendChild(gradient);
svg.insertBefore(defs, svg.firstChild);
