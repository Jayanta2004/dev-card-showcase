// ==================== Learning Sprint Planner ==================== //

class LearningSprintPlanner {
    constructor() {
        this.goals = JSON.parse(localStorage.getItem('learning_goals')) || [];
        this.topics = JSON.parse(localStorage.getItem('learning_topics')) || [];
        this.sessions = JSON.parse(localStorage.getItem('learning_sessions')) || [];
        this.quizzes = JSON.parse(localStorage.getItem('learning_quizzes')) || [];
        
        this.currentSession = null;
        this.timerInterval = null;
        this.timerRunning = false;
        this.totalMinutes = 0;
        
        this.initializeApp();
        this.attachEventListeners();
        this.updateDashboard();
    }

    initializeApp() {
        const today = new Date().toISOString().split('T')[0];
        if (localStorage.getItem('lastLearningVisit') !== today) {
            localStorage.setItem('lastLearningVisit', today);
            this.checkStreak();
        }
        this.updateDateDisplay();
    }

    checkStreak() {
        const streakData = JSON.parse(localStorage.getItem('learning_streak')) || {};
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        // Check if studied yesterday or today
        const studiedYesterday = this.sessions.some(s => s.date === yesterdayStr);
        const studiedToday = this.sessions.some(s => s.date === todayStr);
        
        if (studiedYesterday) {
            streakData.count = (streakData.count || 0) + 1;
        } else if (!studiedToday) {
            streakData.count = 0;
        }
        
        streakData.lastDate = todayStr;
        localStorage.setItem('learning_streak', JSON.stringify(streakData));
        this.updateStreakDisplay();
    }

    updateStreakDisplay() {
        const streak = JSON.parse(localStorage.getItem('learning_streak')) || {};
        const badge = document.getElementById('currentStreak');
        const count = streak.count || 0;
        badge.innerHTML = `<i class="fas fa-fire"></i> ${count} day streak`;
        
        // Update total hours
        const totalHours = this.sessions.reduce((sum, s) => sum + (s.duration / 60), 0).toFixed(1);
        document.getElementById('totalHours').innerHTML = `<i class="fas fa-clock"></i> ${totalHours} hours studied`;
    }

    updateDateDisplay() {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = today.toLocaleDateString('en-US', options);
        document.getElementById('dashDate').textContent = dateStr;
    }

    attachEventListeners() {
        // Tab Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.closest('.nav-tab')));
        });

        // Goals
        document.getElementById('addGoalBtn').addEventListener('click', () => this.openModal('goalModal'));
        document.getElementById('closeGoalModal').addEventListener('click', () => this.closeModal('goalModal'));
        document.getElementById('cancelGoalBtn').addEventListener('click', () => this.closeModal('goalModal'));
        document.getElementById('goalForm').addEventListener('submit', (e) => this.saveGoal(e));

        // Topics
        document.getElementById('addTopicBtn').addEventListener('click', () => this.openModal('topicModal'));
        document.getElementById('closeTopicModal').addEventListener('click', () => this.closeModal('topicModal'));
        document.getElementById('cancelTopicBtn').addEventListener('click', () => this.closeModal('topicModal'));
        document.getElementById('topicForm').addEventListener('submit', (e) => this.saveTopic(e));

        // Quiz
        document.getElementById('addQuizBtn').addEventListener('click', () => this.openModal('quizModal'));
        document.getElementById('closeQuizModal').addEventListener('click', () => this.closeModal('quizModal'));
        document.getElementById('cancelQuizBtn').addEventListener('click', () => this.closeModal('quizModal'));
        document.getElementById('quizForm').addEventListener('submit', (e) => this.saveQuiz(e));

        // Sessions
        document.getElementById('startSessionBtn').addEventListener('click', () => this.startSession());
        document.getElementById('pauseResumeBtn').addEventListener('click', () => this.toggleTimer());
        document.getElementById('stopSessionBtn').addEventListener('click', () => this.stopSession());
        document.getElementById('sessionFilter').addEventListener('change', (e) => this.renderSessions(e.target.value));

        // Progress
        document.getElementById('progressPeriod').addEventListener('change', (e) => this.updateProgress(e.target.value));

        // Modal Background Close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    switchTab(tabElement) {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        tabElement.classList.add('active');
        const tabName = tabElement.getAttribute('data-tab');
        document.getElementById(`${tabName}-section`).classList.add('active');

        if (tabName === 'progress') {
            this.updateProgress('month');
        } else if (tabName === 'quiz') {
            this.updateQuizAnalytics();
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');

        if (modalId === 'topicModal') {
            const select = document.getElementById('topicGoal');
            select.innerHTML = '<option value="">None</option>';
            this.goals.forEach(goal => {
                const option = document.createElement('option');
                option.value = goal.id;
                option.textContent = goal.title;
                select.appendChild(option);
            });
        } else if (modalId === 'quizModal') {
            const select = document.getElementById('quizTopic');
            select.innerHTML = '<option value="">Select topic...</option>';
            this.topics.forEach(topic => {
                const option = document.createElement('option');
                option.value = topic.id;
                option.textContent = topic.name;
                select.appendChild(option);
            });
        } else if (modalId === 'goalModal') {
            document.getElementById('goalDeadline').valueAsDate = new Date();
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        
        if (modalId === 'goalModal') {
            document.getElementById('goalForm').reset();
        } else if (modalId === 'topicModal') {
            document.getElementById('topicForm').reset();
        } else if (modalId === 'quizModal') {
            document.getElementById('quizForm').reset();
            document.getElementById('quizDate').valueAsDate = new Date();
        }
    }

    saveGoal(e) {
        e.preventDefault();

        const goal = {
            id: Date.now(),
            title: document.getElementById('goalTitle').value,
            description: document.getElementById('goalDescription').value,
            targetHours: parseInt(document.getElementById('goalTarget').value),
            deadline: document.getElementById('goalDeadline').value,
            category: document.getElementById('goalCategory').value,
            hoursCompleted: 0,
            status: 'active',
            createdDate: new Date().toISOString()
        };

        this.goals.unshift(goal);
        localStorage.setItem('learning_goals', JSON.stringify(this.goals));

        this.showToast('Goal created successfully!');
        this.closeModal('goalModal');
        this.updateDashboard();
        this.renderGoals();
    }

    saveTopic(e) {
        e.preventDefault();

        const topic = {
            id: Date.now(),
            name: document.getElementById('topicName').value,
            description: document.getElementById('topicDescription').value,
            difficulty: document.getElementById('topicDifficulty').value,
            targetHours: parseInt(document.getElementById('topicTarget').value),
            goalId: document.getElementById('topicGoal').value || null,
            hoursSpent: 0,
            status: 'studying',
            createdDate: new Date().toISOString()
        };

        this.topics.unshift(topic);
        localStorage.setItem('learning_topics', JSON.stringify(this.topics));

        this.showToast('Topic added successfully!');
        this.closeModal('topicModal');
        this.updateDashboard();
        this.renderTopics();
        this.updateSessionTopicSelect();
    }

    saveQuiz(e) {
        e.preventDefault();

        const quiz = {
            id: Date.now(),
            topicId: document.getElementById('quizTopic').value,
            topicName: document.querySelector('#quizTopic option:checked').text,
            score: parseInt(document.getElementById('quizScore').value),
            date: document.getElementById('quizDate').value,
            correct: parseInt(document.getElementById('quizCorrect').value),
            total: parseInt(document.getElementById('quizTotal').value),
            notes: document.getElementById('quizNotes').value,
            timestamp: new Date().toISOString()
        };

        this.quizzes.unshift(quiz);
        localStorage.setItem('learning_quizzes', JSON.stringify(this.quizzes));

        this.showToast('Quiz recorded successfully!');
        this.closeModal('quizModal');
        this.updateQuizAnalytics();
    }

    startSession() {
        const topicId = document.getElementById('sessionTopicSelect').value;
        const duration = parseInt(document.getElementById('sessionDuration').value);

        if (!topicId) {
            this.showToast('Please select a topic');
            return;
        }

        const topic = this.topics.find(t => t.id == topicId);
        
        this.currentSession = {
            id: Date.now(),
            topicId: topicId,
            topicName: topic.name,
            duration: duration * 60, // Convert to seconds
            startTime: new Date(),
            elapsedSeconds: 0,
            date: new Date().toISOString().split('T')[0],
            completed: false
        };

        this.totalMinutes = duration;
        document.getElementById('studyTimer').style.display = 'block';
        this.startTimer();
    }

    startTimer() {
        this.timerRunning = true;
        document.getElementById('pauseResumeBtn').innerHTML = '<i class="fas fa-pause"></i> Pause';

        this.timerInterval = setInterval(() => {
            this.currentSession.elapsedSeconds++;
            this.updateTimerDisplay();

            // Check if time is up
            if (this.currentSession.elapsedSeconds >= this.currentSession.duration) {
                this.completeSession();
            }
        }, 1000);
    }

    toggleTimer() {
        if (this.timerRunning) {
            clearInterval(this.timerInterval);
            this.timerRunning = false;
            document.getElementById('pauseResumeBtn').innerHTML = '<i class="fas fa-play"></i> Resume';
        } else {
            this.startTimer();
        }
    }

    updateTimerDisplay() {
        const remainingSeconds = this.currentSession.duration - this.currentSession.elapsedSeconds;
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;

        document.getElementById('timerMinutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('timerSeconds').textContent = String(seconds).padStart(2, '0');

        // Update progress circle
        const progress = (this.currentSession.elapsedSeconds / this.currentSession.duration) * 100;
        const circumference = 2 * Math.PI * 90;
        const offset = circumference - (progress / 100) * circumference;
        document.getElementById('timerProgress').style.strokeDashoffset = offset;
    }

    completeSession() {
        this.currentSession.completed = true;
        this.stopSession();
        this.showToast(`Great! Session completed. ${this.totalMinutes} minutes studied on ${this.currentSession.topicName}`);
    }

    stopSession() {
        clearInterval(this.timerInterval);
        this.timerRunning = false;

        if (this.currentSession && this.currentSession.elapsedSeconds > 0) {
            // Save session
            const minutesStudied = Math.round(this.currentSession.elapsedSeconds / 60 * 10) / 10;
            
            const session = {
                id: this.currentSession.id,
                topicId: this.currentSession.topicId,
                topicName: this.currentSession.topicName,
                duration: minutesStudied,
                date: this.currentSession.date,
                completedPercent: Math.round((this.currentSession.elapsedSeconds / this.currentSession.duration) * 100),
                timestamp: new Date().toISOString()
            };

            this.sessions.unshift(session);

            // Update topic hours
            const topic = this.topics.find(t => t.id == this.currentSession.topicId);
            if (topic) {
                topic.hoursSpent += minutesStudied / 60;
                if (topic.hoursSpent >= topic.targetHours) {
                    topic.status = 'completed';
                }
            }

            // Update goal hours
            if (topic && topic.goalId) {
                const goal = this.goals.find(g => g.id == topic.goalId);
                if (goal) {
                    goal.hoursCompleted += minutesStudied / 60;
                    if (goal.hoursCompleted >= goal.targetHours) {
                        goal.status = 'completed';
                    }
                }
            }

            localStorage.setItem('learning_sessions', JSON.stringify(this.sessions));
            localStorage.setItem('learning_topics', JSON.stringify(this.topics));
            localStorage.setItem('learning_goals', JSON.stringify(this.goals));

            this.checkStreak();
        }

        document.getElementById('studyTimer').style.display = 'none';
        this.currentSession = null;
        this.updateDashboard();
        this.renderSessions('all');
    }

    updateDashboard() {
        const today = new Date().toISOString().split('T')[0];
        
        // Active goals
        const activeGoals = this.goals.filter(g => g.status === 'active').length;
        document.getElementById('activeGoals').textContent = activeGoals;

        // Today's study time
        const todaySessions = this.sessions.filter(s => s.date === today);
        const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
        const todayHours = (todayMinutes / 60).toFixed(1);
        document.getElementById('todayStudyTime').textContent = todayHours + 'h';

        // Completed topics
        const completedTopics = this.topics.filter(t => t.status === 'completed').length;
        document.getElementById('completedTopics').textContent = completedTopics;

        // Average quiz score
        if (this.quizzes.length > 0) {
            const avgScore = (this.quizzes.reduce((sum, q) => sum + q.score, 0) / this.quizzes.length).toFixed(0);
            document.getElementById('avgQuizScore').textContent = avgScore + '%';
        }

        this.updateStreakDisplay();
        this.renderGoals();
        this.renderTopics();
        this.renderSessions('all');
        this.renderWeeklyChart();
        this.updateSessionTopicSelect();
    }

    updateSessionTopicSelect() {
        const select = document.getElementById('sessionTopicSelect');
        select.innerHTML = '<option value="">Select a topic...</option>';
        
        this.topics.filter(t => t.status !== 'completed').forEach(topic => {
            const option = document.createElement('option');
            option.value = topic.id;
            option.textContent = `${topic.name} (${topic.difficulty})`;
            select.appendChild(option);
        });
    }

    renderGoals() {
        const container = document.getElementById('goalsList');
        
        if (this.goals.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-bullseye"></i><p>No study goals yet. Create one to get started!</p></div>';
            return;
        }

        container.innerHTML = this.goals.map(goal => {
            const progress = Math.min((goal.hoursCompleted / goal.targetHours) * 100, 100);
            const daysLeft = this.getDaysUntil(goal.deadline);

            return `
                <div class="goal-item">
                    <div class="goal-header">
                        <div>
                            <div class="goal-title">${goal.title}</div>
                            <div class="goal-category">${goal.category}</div>
                        </div>
                        <button class="delete-btn" onclick="app.deleteGoal(${goal.id})">Delete</button>
                    </div>
                    <div class="goal-meta">
                        <span><i class="fas fa-clock"></i> ${goal.hoursCompleted.toFixed(1)}/${goal.targetHours}h</span>
                        <span><i class="fas fa-calendar"></i> ${daysLeft} days left</span>
                    </div>
                    ${goal.description ? `<div style="margin: 12px 0; font-size: 13px; color: var(--text-secondary);">${goal.description}</div>` : ''}
                    <div class="goal-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">
                            <span>${Math.round(progress)}% Complete</span>
                            <span>${goal.status}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderTopics() {
        const container = document.getElementById('topicsList');
        
        if (this.topics.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-book"></i><p>No topics added yet. Start by adding topics to study.</p></div>';
            return;
        }

        container.innerHTML = this.topics.map(topic => {
            const progress = Math.min((topic.hoursSpent / topic.targetHours) * 100, 100);

            return `
                <div class="topic-card">
                    <div class="topic-header">
                        <div class="topic-name">${topic.name}</div>
                        <span class="topic-difficulty difficulty-${topic.difficulty}">${topic.difficulty.charAt(0).toUpperCase() + topic.difficulty.slice(1)}</span>
                    </div>
                    ${topic.description ? `<div class="topic-description">${topic.description}</div>` : ''}
                    <div class="topic-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    <div class="topic-footer">
                        <span>${topic.hoursSpent.toFixed(1)}/${topic.targetHours}h</span>
                        <button class="delete-btn" onclick="app.deleteTopic(${topic.id})">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderSessions(filter = 'all') {
        const container = document.getElementById('sessionsList');
        let filtered = this.sessions;

        if (filter === 'today') {
            const today = new Date().toISOString().split('T')[0];
            filtered = this.sessions.filter(s => s.date === today);
        } else if (filter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filtered = this.sessions.filter(s => new Date(s.date) >= weekAgo);
        } else if (filter === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filtered = this.sessions.filter(s => new Date(s.date) >= monthAgo);
        }

        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-timer"></i><p>No study sessions yet. Start a session to see it here!</p></div>';
            return;
        }

        container.innerHTML = filtered.map(session => `
            <div class="session-item">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                    <div>
                        <div style="font-weight: 600; font-size: 16px; color: var(--text-primary);">${session.topicName}</div>
                        <div style="font-size: 13px; color: var(--text-tertiary);">${new Date(session.date).toLocaleDateString()}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 20px; font-weight: 600; color: var(--primary-color);">${session.duration}min</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">${session.completedPercent}% completed</div>
                    </div>
                </div>
                <button class="delete-btn" onclick="app.deleteSession(${session.id})">Delete</button>
            </div>
        `).join('');
    }

    renderWeeklyChart() {
        const canvas = document.getElementById('weeklyChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = 200;

        // Get last 7 days
        const days = [];
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }

        const data = days.map(day => {
            const sessions = this.sessions.filter(s => s.date === day);
            return sessions.reduce((sum, s) => sum + s.duration, 0) / 60; // Convert to hours
        });

        this.drawBarChart(ctx, data, dayLabels, 'Study Hours');
    }

    updateProgress(period) {
        let startDate = new Date();
        
        if (period === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
        } else if (period === 'quarter') {
            startDate.setMonth(startDate.getMonth() - 3);
        } else if (period === 'year') {
            startDate.setFullYear(startDate.getFullYear() - 1);
        }

        const filteredSessions = this.sessions.filter(s => new Date(s.date) >= startDate);
        
        // Update stats
        const totalHours = (filteredSessions.reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(1);
        const avgSessionTime = filteredSessions.length > 0 
            ? Math.round(filteredSessions.reduce((sum, s) => sum + s.duration, 0) / filteredSessions.length)
            : 0;
        const masteredTopics = this.topics.filter(t => t.status === 'completed').length;
        const streak = JSON.parse(localStorage.getItem('learning_streak'))?.count || 0;

        document.getElementById('totalStudyHours').textContent = totalHours;
        document.getElementById('avgSessionTime').textContent = avgSessionTime + ' min';
        document.getElementById('masteredTopics').textContent = masteredTopics;
        document.getElementById('currentStreakStat').textContent = streak + ' days';

        this.renderHeatmap();
        this.renderProgressCharts(filteredSessions);
    }

    renderHeatmap() {
        const container = document.getElementById('heatmap');
        container.innerHTML = '';

        // Last 53 weeks
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (53 * 7));

        for (let i = 0; i < 53 * 7; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            const sessionCount = this.sessions.filter(s => s.date === dateStr).length;
            let level = 0;
            if (sessionCount >= 4) level = 4;
            else if (sessionCount >= 3) level = 3;
            else if (sessionCount >= 2) level = 2;
            else if (sessionCount >= 1) level = 1;

            const cell = document.createElement('div');
            cell.className = `heatmap-cell level-${level}`;
            cell.title = `${dateStr}: ${sessionCount} session${sessionCount !== 1 ? 's' : ''}`;
            container.appendChild(cell);
        }
    }

    renderProgressCharts(sessions) {
        // Topic chart
        const topicData = {};
        sessions.forEach(session => {
            if (!topicData[session.topicName]) topicData[session.topicName] = 0;
            topicData[session.topicName] += session.duration / 60;
        });

        const topicNames = Object.keys(topicData);
        const topicHours = Object.values(topicData);

        const canvas1 = document.getElementById('topicChart');
        const ctx1 = canvas1.getContext('2d');
        canvas1.width = canvas1.offsetWidth;
        canvas1.height = 300;

        this.drawPieChart(ctx1, topicHours.slice(0, 5), topicNames.slice(0, 5));

        // Daily study duration
        const days = [];
        const dailyHours = [];
        
        for (let i = 13; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayHours = sessions
                .filter(s => s.date === dateStr)
                .reduce((sum, s) => sum + s.duration / 60, 0);
            
            days.push(dateStr.slice(5));
            dailyHours.push(dayHours);
        }

        const canvas2 = document.getElementById('dailyChart');
        const ctx2 = canvas2.getContext('2d');
        canvas2.width = canvas2.offsetWidth;
        canvas2.height = 300;

        this.drawLineChart(ctx2, dailyHours, days);
    }

    updateQuizAnalytics() {
        const container = document.getElementById('quizList');
        
        if (this.quizzes.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-question-circle"></i><p>No quiz results recorded yet. Start recording quizzes to track your progress!</p></div>';
        } else {
            container.innerHTML = this.quizzes.map(quiz => `
                <div class="quiz-item">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                        <div>
                            <div style="font-weight: 600; font-size: 16px; color: var(--text-primary);">${quiz.topicName}</div>
                            <div style="font-size: 13px; color: var(--text-tertiary);">${new Date(quiz.date).toLocaleDateString()}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 24px; font-weight: 600; color: var(--primary-color);">${quiz.score}%</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">${quiz.correct}/${quiz.total}</div>
                        </div>
                    </div>
                    ${quiz.notes ? `<div style="margin: 12px 0; padding: 12px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; font-size: 13px; color: var(--text-secondary);">${quiz.notes}</div>` : ''}
                    <button class="delete-btn" onclick="app.deleteQuiz(${quiz.id})">Delete</button>
                </div>
            `).join('');
        }

        // Update stats
        document.getElementById('totalQuizzes').textContent = this.quizzes.length;

        if (this.quizzes.length > 0) {
            const avgScore = (this.quizzes.reduce((sum, q) => sum + q.score, 0) / this.quizzes.length).toFixed(0);
            const bestScore = Math.max(...this.quizzes.map(q => q.score));
            const firstScore = this.quizzes[this.quizzes.length - 1].score;
            const improvement = bestScore - firstScore;

            document.getElementById('avgScore').textContent = avgScore + '%';
            document.getElementById('bestScore').textContent = bestScore + '%';
            document.getElementById('scoreImprovement').textContent = (improvement >= 0 ? '+' : '') + improvement + '%';

            this.renderQuizCharts();
        }
    }

    renderQuizCharts() {
        // Score distribution
        const canvas1 = document.getElementById('scoreChart');
        const ctx1 = canvas1.getContext('2d');
        canvas1.width = canvas1.offsetWidth;
        canvas1.height = 300;

        const scores = this.quizzes.map(q => q.score);
        const ranges = ['0-40', '40-60', '60-80', '80-100'];
        const distribution = [
            scores.filter(s => s < 40).length,
            scores.filter(s => s >= 40 && s < 60).length,
            scores.filter(s => s >= 60 && s < 80).length,
            scores.filter(s => s >= 80).length
        ];

        this.drawBarChart(ctx1, distribution, ranges, 'Quizzes');

        // Performance trend
        const canvas2 = document.getElementById('performanceChart');
        const ctx2 = canvas2.getContext('2d');
        canvas2.width = canvas2.offsetWidth;
        canvas2.height = 300;

        const sortedQuizzes = [...this.quizzes].reverse();
        const quizScores = sortedQuizzes.slice(0, 15).map(q => q.score);
        const quizLabels = sortedQuizzes.slice(0, 15).map((q, i) => `Q${i + 1}`);

        this.drawLineChart(ctx2, quizScores, quizLabels);
    }

    drawBarChart(ctx, data, labels, yAxisLabel) {
        const padding = 40;
        const width = ctx.canvas.width - padding * 2;
        const height = ctx.canvas.height - padding * 2;
        const maxValue = Math.max(...data, 10);
        const barWidth = width / data.length * 0.8;

        // Clear
        ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Grid
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(ctx.canvas.width - padding, y);
            ctx.stroke();
        }

        // Bars
        data.forEach((value, index) => {
            const barHeight = (value / maxValue) * height;
            const x = padding + (width / data.length) * index + (width / data.length - barWidth) / 2;
            const y = padding + height - barHeight;

            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(x, y, barWidth, barHeight);

            // Value text
            ctx.fillStyle = 'rgba(203, 213, 225, 0.9)';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(value.toFixed(1), x + barWidth / 2, y - 5);

            // Label
            ctx.fillStyle = 'rgba(203, 213, 225, 0.7)';
            ctx.font = '12px Arial';
            ctx.fillText(labels[index], x + barWidth / 2, ctx.canvas.height - 15);
        });
    }

    drawLineChart(ctx, data, labels) {
        const padding = 40;
        const width = ctx.canvas.width - padding * 2;
        const height = ctx.canvas.height - padding * 2;
        const maxValue = Math.max(...data, 10);

        // Clear
        ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Grid
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(ctx.canvas.width - padding, y);
            ctx.stroke();
        }

        // Line
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();

        let firstPoint = true;
        data.forEach((value, index) => {
            const x = padding + (width / (data.length - 1 || 1)) * index;
            const y = padding + height - (value / maxValue) * height;

            if (firstPoint) {
                ctx.moveTo(x, y);
                firstPoint = false;
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Points
        ctx.fillStyle = '#3b82f6';
        data.forEach((value, index) => {
            const x = padding + (width / (data.length - 1 || 1)) * index;
            const y = padding + height - (value / maxValue) * height;

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Labels
        ctx.fillStyle = 'rgba(203, 213, 225, 0.7)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        labels.forEach((label, index) => {
            const x = padding + (width / (labels.length - 1 || 1)) * index;
            ctx.fillText(label, x, ctx.canvas.height - 15);
        });
    }

    drawPieChart(ctx, data, labels) {
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 40;

        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        const total = data.reduce((sum, val) => sum + val, 0);

        let currentAngle = -Math.PI / 2;

        data.forEach((value, index) => {
            const sliceAngle = (value / total) * 2 * Math.PI;

            // Draw slice
            ctx.fillStyle = colors[index % colors.length];
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();

            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(Math.round((value / total) * 100) + '%', labelX, labelY);

            currentAngle += sliceAngle;
        });
    }

    deleteGoal(id) {
        if (confirm('Delete this goal?')) {
            this.goals = this.goals.filter(g => g.id !== id);
            localStorage.setItem('learning_goals', JSON.stringify(this.goals));
            this.updateDashboard();
            this.showToast('Goal deleted');
        }
    }

    deleteTopic(id) {
        if (confirm('Delete this topic?')) {
            this.topics = this.topics.filter(t => t.id !== id);
            localStorage.setItem('learning_topics', JSON.stringify(this.topics));
            this.updateDashboard();
            this.showToast('Topic deleted');
        }
    }

    deleteSession(id) {
        if (confirm('Delete this session?')) {
            this.sessions = this.sessions.filter(s => s.id !== id);
            localStorage.setItem('learning_sessions', JSON.stringify(this.sessions));
            this.renderSessions('all');
            this.showToast('Session deleted');
        }
    }

    deleteQuiz(id) {
        if (confirm('Delete this quiz?')) {
            this.quizzes = this.quizzes.filter(q => q.id !== id);
            localStorage.setItem('learning_quizzes', JSON.stringify(this.quizzes));
            this.updateQuizAnalytics();
            this.showToast('Quiz deleted');
        }
    }

    getDaysUntil(dateStr) {
        const today = new Date();
        const deadline = new Date(dateStr);
        const diffTime = Math.abs(deadline - today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        document.getElementById('toastMessage').textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize App
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new LearningSprintPlanner();
});
