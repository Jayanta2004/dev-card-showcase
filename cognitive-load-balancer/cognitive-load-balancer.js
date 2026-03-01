// Cognitive Load Balancer - Main Application Logic
class CognitiveLoadBalancer {
    constructor() {
        this.currentTab = 'dashboard';
        this.tasks = [];
        this.monitoringData = [];
        this.fatigueLogs = [];
        this.isMonitoring = false;
        this.isFocusTimerRunning = false;
        this.focusTimerSeconds = 0;
        this.breakTimerSeconds = 1500; // 25 minutes
        this.monitoringInterval = null;
        this.focusTimerInterval = null;
        this.breakTimerInterval = null;
        this.charts = {};

        // Cognitive load thresholds
        this.loadThresholds = {
            low: 30,
            moderate: 60,
            high: 80
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCharts();
        this.loadSavedData();
        this.renderInitialState();
        this.startBreakTimer();
        this.updateDashboard();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Dashboard actions
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.showTaskModal();
        });

        document.getElementById('startFocusTimer').addEventListener('click', () => {
            this.startFocusTimer();
        });

        document.getElementById('pauseFocusTimer').addEventListener('click', () => {
            this.pauseFocusTimer();
        });

        document.getElementById('resetFocusTimer').addEventListener('click', () => {
            this.resetFocusTimer();
        });

        document.getElementById('startBreakBtn').addEventListener('click', () => {
            this.showBreakModal();
        });

        document.getElementById('logFatigueBtn').addEventListener('click', () => {
            this.showFatigueModal();
        });

        document.getElementById('generateReportBtn').addEventListener('click', () => {
            this.generateReport();
        });

        // Tasks tab
        document.getElementById('newTaskBtn').addEventListener('click', () => {
            this.showTaskModal();
        });

        document.getElementById('taskFilter').addEventListener('change', () => {
            this.filterTasks();
        });

        document.getElementById('priorityFilter').addEventListener('change', () => {
            this.filterTasks();
        });

        document.getElementById('taskSearch').addEventListener('input', () => {
            this.filterTasks();
        });

        // Monitoring tab
        document.getElementById('startMonitoringBtn').addEventListener('click', () => {
            this.startMonitoring();
        });

        document.getElementById('stopMonitoringBtn').addEventListener('click', () => {
            this.stopMonitoring();
        });

        document.getElementById('alertThreshold').addEventListener('input', (e) => {
            document.getElementById('alertThresholdValue').textContent = e.target.value;
        });

        // Analytics tab
        document.getElementById('runAnalyticsBtn').addEventListener('click', () => {
            this.runAnalytics();
        });

        document.getElementById('exportAnalyticsBtn').addEventListener('click', () => {
            this.exportAnalytics();
        });

        // Optimization tab
        document.getElementById('generatePlanBtn').addEventListener('click', () => {
            this.generateOptimizationPlan();
        });

        document.getElementById('applyOptimizationsBtn').addEventListener('click', () => {
            this.applyOptimizations();
        });

        // Modal events
        document.getElementById('fab').addEventListener('click', () => {
            this.showTaskModal();
        });

        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => {
                this.hideModals();
            });
        });

        document.getElementById('saveTaskBtn').addEventListener('click', () => {
            this.saveTask();
        });

        document.getElementById('cancelTaskBtn').addEventListener('click', () => {
            this.hideModals();
        });

        document.getElementById('saveFatigueBtn').addEventListener('click', () => {
            this.saveFatigueLog();
        });

        document.getElementById('startBreakBtn').addEventListener('click', () => {
            this.startBreak();
        });

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModals();
                }
            });
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;

        // Update content based on tab
        if (tabName === 'dashboard') {
            this.updateDashboard();
        } else if (tabName === 'tasks') {
            this.renderTasks();
        } else if (tabName === 'monitoring') {
            this.updateMonitoringDisplay();
        } else if (tabName === 'analytics') {
            this.updateAnalytics();
        } else if (tabName === 'optimization') {
            this.updateOptimizationResults();
        }
    }

    updateDashboard() {
        this.updateCurrentLoad();
        this.updateTaskCounts();
        this.updateFocusTimer();
        this.updateBreakTimer();
        this.updateCharts();
    }

    updateCurrentLoad() {
        const load = this.calculateCurrentLoad();
        const percentage = Math.min(100, Math.max(0, load));

        document.getElementById('currentLoadFill').style.width = `${percentage}%`;
        document.getElementById('currentLoadPercent').textContent = `${percentage.toFixed(0)}%`;

        const statusElement = document.getElementById('currentLoadStatus');
        statusElement.className = 'load-status';

        if (percentage < this.loadThresholds.low) {
            statusElement.textContent = 'Optimal';
            statusElement.classList.add('optimal');
        } else if (percentage < this.loadThresholds.moderate) {
            statusElement.textContent = 'Moderate';
            statusElement.classList.add('moderate');
        } else {
            statusElement.textContent = 'High';
            statusElement.classList.add('high');
        }
    }

    calculateCurrentLoad() {
        const activeTasks = this.tasks.filter(task => task.status === 'active');
        let totalLoad = 0;

        activeTasks.forEach(task => {
            const complexityMultiplier = { low: 1, medium: 1.5, high: 2 }[task.complexity] || 1;
            const priorityMultiplier = { low: 0.8, medium: 1, high: 1.2 }[task.priority] || 1;
            const timeMultiplier = Math.min(2, task.duration / 30); // Tasks over 30 min increase load

            totalLoad += complexityMultiplier * priorityMultiplier * timeMultiplier * 10;
        });

        // Add fatigue factor
        const recentFatigue = this.getRecentFatigueLevel();
        totalLoad *= (1 + recentFatigue * 0.2);

        return Math.min(100, totalLoad);
    }

    getRecentFatigueLevel() {
        const recentLogs = this.fatigueLogs.filter(log =>
            new Date() - new Date(log.timestamp) < 24 * 60 * 60 * 1000 // Last 24 hours
        );

        if (recentLogs.length === 0) return 0;

        const avgFatigue = recentLogs.reduce((sum, log) => sum + log.level, 0) / recentLogs.length;
        return avgFatigue / 5; // Normalize to 0-1 scale
    }

    updateTaskCounts() {
        const todayTasks = this.tasks.filter(task => {
            const taskDate = new Date(task.createdAt).toDateString();
            const today = new Date().toDateString();
            return taskDate === today;
        });

        const activeTasks = todayTasks.filter(task => task.status === 'active');
        const highPriority = activeTasks.filter(task => task.priority === 'high');
        const mediumPriority = activeTasks.filter(task => task.priority === 'medium');
        const lowPriority = activeTasks.filter(task => task.priority === 'low');

        document.getElementById('todayTasksCount').textContent = activeTasks.length;
        document.getElementById('highPriorityCount').textContent = highPriority.length;
        document.getElementById('mediumPriorityCount').textContent = mediumPriority.length;
        document.getElementById('lowPriorityCount').textContent = lowPriority.length;
    }

    updateFocusTimer() {
        const display = document.getElementById('focusTimerDisplay');
        const hours = Math.floor(this.focusTimerSeconds / 3600);
        const minutes = Math.floor((this.focusTimerSeconds % 3600) / 60);
        const seconds = this.focusTimerSeconds % 60;

        display.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    startFocusTimer() {
        if (this.isFocusTimerRunning) return;

        this.isFocusTimerRunning = true;
        document.getElementById('startFocusTimer').disabled = true;
        document.getElementById('pauseFocusTimer').disabled = false;

        this.focusTimerInterval = setInterval(() => {
            this.focusTimerSeconds++;
            this.updateFocusTimer();

            // Auto-pause for break every 25 minutes
            if (this.focusTimerSeconds % 1500 === 0 && this.focusTimerSeconds > 0) {
                this.showBreakReminder();
            }
        }, 1000);
    }

    pauseFocusTimer() {
        this.isFocusTimerRunning = false;
        clearInterval(this.focusTimerInterval);

        document.getElementById('startFocusTimer').disabled = false;
        document.getElementById('pauseFocusTimer').disabled = true;
    }

    resetFocusTimer() {
        this.pauseFocusTimer();
        this.focusTimerSeconds = 0;
        this.updateFocusTimer();
    }

    showBreakReminder() {
        this.showNotification('Time for a break! Take 5 minutes to rest your mind.', 'warning');
        this.pauseFocusTimer();
    }

    updateBreakTimer() {
        const remaining = Math.max(0, this.breakTimerSeconds);
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;

        document.getElementById('breakTimeRemaining').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        const progress = ((1500 - remaining) / 1500) * 100;
        document.getElementById('breakProgressFill').style.width = `${Math.min(100, progress)}%`;
    }

    startBreakTimer() {
        this.breakTimerInterval = setInterval(() => {
            if (this.breakTimerSeconds > 0) {
                this.breakTimerSeconds--;
                this.updateBreakTimer();
            } else {
                this.showNotification('Break time is up! Ready to focus again?', 'info');
                this.breakTimerSeconds = 1500; // Reset to 25 minutes
            }
        }, 1000);
    }

    updateCharts() {
        // Update load trend chart
        const recentData = this.monitoringData.slice(-24); // Last 24 data points
        const loadData = recentData.map(d => d.load || 0);

        if (this.charts.loadTrend) {
            this.charts.loadTrend.data.labels = loadData.map((_, i) => `${i + 1}h ago`);
            this.charts.loadTrend.data.datasets[0].data = loadData;
            this.charts.loadTrend.update();
        }

        // Update task completion chart
        const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
        const activeTasks = this.tasks.filter(task => task.status === 'active').length;

        if (this.charts.taskCompletion) {
            this.charts.taskCompletion.data.datasets[0].data = [completedTasks, activeTasks];
            this.charts.taskCompletion.update();
        }
    }

    showTaskModal(taskId = null) {
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('taskModalTitle');
        const form = document.getElementById('taskForm');

        if (taskId) {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                title.textContent = 'Edit Task';
                form.taskTitle.value = task.title;
                form.taskDescription.value = task.description;
                form.taskPriority.value = task.priority;
                form.taskComplexity.value = task.complexity;
                form.taskDuration.value = task.duration;
                if (task.deadline) {
                    form.taskDeadline.value = new Date(task.deadline).toISOString().slice(0, 16);
                }
                this.editingTaskId = taskId;
            }
        } else {
            title.textContent = 'Add New Task';
            form.reset();
            this.editingTaskId = null;
        }

        modal.classList.add('show');
    }

    saveTask() {
        const form = document.getElementById('taskForm');
        const taskData = {
            title: form.taskTitle.value,
            description: form.taskDescription.value,
            priority: form.taskPriority.value,
            complexity: form.taskComplexity.value,
            duration: parseInt(form.taskDuration.value),
            deadline: form.taskDeadline.value ? new Date(form.taskDeadline.value) : null,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (this.editingTaskId) {
            // Update existing task
            const taskIndex = this.tasks.findIndex(t => t.id === this.editingTaskId);
            if (taskIndex !== -1) {
                taskData.id = this.editingTaskId;
                taskData.createdAt = this.tasks[taskIndex].createdAt;
                this.tasks[taskIndex] = taskData;
            }
        } else {
            // Create new task
            taskData.id = Date.now().toString();
            this.tasks.push(taskData);
        }

        this.saveTasksToStorage();
        this.renderTasks();
        this.updateDashboard();
        this.hideModals();

        this.showNotification('Task saved successfully!', 'success');
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const filter = document.getElementById('taskFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;
        const searchTerm = document.getElementById('taskSearch').value.toLowerCase();

        let filteredTasks = this.tasks;

        // Apply filters
        if (filter === 'active') {
            filteredTasks = filteredTasks.filter(task => task.status === 'active');
        } else if (filter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.status === 'completed');
        } else if (filter === 'overdue') {
            filteredTasks = filteredTasks.filter(task => {
                return task.deadline && new Date(task.deadline) < new Date() && task.status === 'active';
            });
        }

        if (priorityFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
        }

        if (searchTerm) {
            filteredTasks = filteredTasks.filter(task =>
                task.title.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm)
            );
        }

        // Sort by priority and deadline
        filteredTasks.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;

            if (a.deadline && b.deadline) {
                return new Date(a.deadline) - new Date(b.deadline);
            }
            return 0;
        });

        tasksList.innerHTML = '';

        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            tasksList.appendChild(taskElement);
        });

        this.updateTaskStats();
    }

    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item';
        taskDiv.dataset.taskId = task.id;

        const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status === 'active';

        taskDiv.innerHTML = `
            <div class="task-priority ${task.priority}"></div>
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                <div class="task-description">${task.description}</div>
                <div class="task-meta">
                    <span>Priority: ${task.priority}</span>
                    <span>Complexity: ${task.complexity}</span>
                    <span>Duration: ${task.duration}min</span>
                    ${task.deadline ? `<span>Deadline: ${new Date(task.deadline).toLocaleDateString()}</span>` : ''}
                </div>
            </div>
            <div class="task-actions">
                ${task.status === 'active' ?
                    `<button class="btn-complete" onclick="app.completeTask('${task.id}')">
                        <i class="fas fa-check"></i>
                    </button>` : ''
                }
                <button class="btn-edit" onclick="app.showTaskModal('${task.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="app.deleteTask('${task.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="task-status ${task.status} ${isOverdue ? 'overdue' : ''}">
                ${isOverdue ? 'Overdue' : task.status}
            </div>
        `;

        return taskDiv;
    }

    completeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = 'completed';
            task.completedAt = new Date();
            this.saveTasksToStorage();
            this.renderTasks();
            this.updateDashboard();
            this.showNotification('Task completed!', 'success');
        }
    }

    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            this.tasks.splice(taskIndex, 1);
            this.saveTasksToStorage();
            this.renderTasks();
            this.updateDashboard();
            this.showNotification('Task deleted!', 'info');
        }
    }

    updateTaskStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
        const activeTasks = this.tasks.filter(task => task.status === 'active').length;
        const overdueTasks = this.tasks.filter(task => {
            return task.deadline && new Date(task.deadline) < new Date() && task.status === 'active';
        }).length;

        document.getElementById('totalTasksStat').textContent = totalTasks;
        document.getElementById('completedTasksStat').textContent = completedTasks;
        document.getElementById('activeTasksStat').textContent = activeTasks;
        document.getElementById('overdueTasksStat').textContent = overdueTasks;
    }

    filterTasks() {
        this.renderTasks();
    }

    startMonitoring() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        document.getElementById('startMonitoringBtn').disabled = true;
        document.getElementById('stopMonitoringBtn').disabled = false;

        this.monitoringInterval = setInterval(() => {
            this.collectMonitoringData();
            this.updateMonitoringDisplay();
            this.checkAlerts();
        }, 5000); // Collect data every 5 seconds

        this.showNotification('Monitoring started!', 'success');
    }

    stopMonitoring() {
        this.isMonitoring = false;
        clearInterval(this.monitoringInterval);

        document.getElementById('startMonitoringBtn').disabled = false;
        document.getElementById('stopMonitoringBtn').disabled = true;

        this.showNotification('Monitoring stopped!', 'info');
    }

    collectMonitoringData() {
        const dataPoint = {
            timestamp: new Date(),
            load: this.calculateCurrentLoad(),
            attention: this.simulateAttentionLevel(),
            fatigue: this.simulateFatigueLevel(),
            productivity: this.simulateProductivityScore()
        };

        this.monitoringData.push(dataPoint);

        // Keep only last 100 data points
        if (this.monitoringData.length > 100) {
            this.monitoringData.shift();
        }

        this.saveMonitoringDataToStorage();
    }

    simulateAttentionLevel() {
        // Simulate attention level based on time of day and recent activity
        const hour = new Date().getHours();
        let baseAttention = 80;

        // Lower attention during typical low-energy times
        if (hour >= 2 && hour <= 6) baseAttention -= 30;
        if (hour >= 14 && hour <= 16) baseAttention -= 20;

        // Add some randomness
        const variation = (Math.random() - 0.5) * 20;
        return Math.max(0, Math.min(100, baseAttention + variation));
    }

    simulateFatigueLevel() {
        const recentFatigue = this.getRecentFatigueLevel() * 100;
        const timeOfDay = new Date().getHours();

        // Higher fatigue in evening
        const timeFactor = timeOfDay > 18 ? 20 : 0;

        return Math.min(100, recentFatigue + timeFactor);
    }

    simulateProductivityScore() {
        const load = this.calculateCurrentLoad();
        const fatigue = this.simulateFatigueLevel();
        const attention = this.simulateAttentionLevel();

        // Productivity decreases with high load and fatigue, increases with attention
        let productivity = 100 - (load * 0.3) - (fatigue * 0.4) + (attention * 0.2);

        return Math.max(0, Math.min(100, productivity));
    }

    updateMonitoringDisplay() {
        if (this.monitoringData.length === 0) return;

        const latest = this.monitoringData[this.monitoringData.length - 1];

        // Update gauges
        this.updateGauge('loadGauge', latest.load);
        this.updateGauge('attentionGauge', latest.attention);
        this.updateGauge('fatigueGauge', latest.fatigue);
        this.updateGauge('productivityGauge', latest.productivity);

        // Update timeline chart
        this.updateMonitoringTimeline();
    }

    updateGauge(canvasId, value) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 40;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 8;
        ctx.stroke();

        // Progress arc
        const angle = (value / 100) * 2 * Math.PI - Math.PI / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, angle);
        ctx.strokeStyle = this.getGaugeColor(value);
        ctx.lineWidth = 8;
        ctx.stroke();

        // Update value text
        const valueElement = document.getElementById(canvasId.replace('Gauge', 'GaugeValue'));
        valueElement.textContent = `${value.toFixed(0)}%`;
    }

    getGaugeColor(value) {
        if (value < 30) return '#10b981'; // Green
        if (value < 70) return '#f59e0b'; // Yellow
        return '#ef4444'; // Red
    }

    updateMonitoringTimeline() {
        const recentData = this.monitoringData.slice(-20); // Last 20 data points

        if (!this.charts.monitoringTimeline) {
            const ctx = document.getElementById('monitoringTimeline').getContext('2d');
            this.charts.monitoringTimeline = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: recentData.map((_, i) => `${i * 5}s ago`),
                    datasets: [
                        {
                            label: 'Cognitive Load',
                            data: recentData.map(d => d.load),
                            borderColor: '#2563eb',
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            fill: false,
                            tension: 0.4
                        },
                        {
                            label: 'Attention',
                            data: recentData.map(d => d.attention),
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            fill: false,
                            tension: 0.4
                        },
                        {
                            label: 'Fatigue',
                            data: recentData.map(d => d.fatigue),
                            borderColor: '#f59e0b',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            fill: false,
                            tension: 0.4
                        },
                        {
                            label: 'Productivity',
                            data: recentData.map(d => d.productivity),
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            fill: false,
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    },
                    plugins: {
                        legend: {
                            display: false // Hide legend, we have custom one
                        }
                    }
                }
            });
        } else {
            this.charts.monitoringTimeline.data.labels = recentData.map((_, i) => `${i * 5}s ago`);
            this.charts.monitoringTimeline.data.datasets[0].data = recentData.map(d => d.load);
            this.charts.monitoringTimeline.data.datasets[1].data = recentData.map(d => d.attention);
            this.charts.monitoringTimeline.data.datasets[2].data = recentData.map(d => d.fatigue);
            this.charts.monitoringTimeline.data.datasets[3].data = recentData.map(d => d.productivity);
            this.charts.monitoringTimeline.update();
        }
    }

    checkAlerts() {
        const latest = this.monitoringData[this.monitoringData.length - 1];
        if (!latest) return;

        const alerts = [];
        const threshold = parseInt(document.getElementById('alertThreshold').value);

        if (latest.load > threshold) {
            alerts.push({
                type: 'high',
                title: 'High Cognitive Load',
                description: `Current load is ${latest.load.toFixed(0)}%. Consider taking a break or reducing task complexity.`
            });
        }

        if (latest.fatigue > 70) {
            alerts.push({
                type: 'medium',
                title: 'High Fatigue Level',
                description: `Fatigue level is ${latest.fatigue.toFixed(0)}%. You may need rest or lighter tasks.`
            });
        }

        if (latest.attention < 30) {
            alerts.push({
                type: 'medium',
                title: 'Low Attention',
                description: `Attention level is ${latest.attention.toFixed(0)}%. Consider a short break or focus exercise.`
            });
        }

        this.displayAlerts(alerts);
    }

    displayAlerts(alerts) {
        const alertsList = document.getElementById('alertsList');
        alertsList.innerHTML = '';

        if (alerts.length === 0) {
            alertsList.innerHTML = '<p style="text-align: center; color: #64748b; margin: 20px 0;">No alerts at this time.</p>';
            return;
        }

        alerts.forEach(alert => {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert-item';
            alertDiv.innerHTML = `
                <div class="alert-severity ${alert.type}"></div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-description">${alert.description}</div>
                </div>
            `;
            alertsList.appendChild(alertDiv);
        });
    }

    runAnalytics() {
        // Show loading state
        const button = document.getElementById('runAnalyticsBtn');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        button.disabled = true;

        setTimeout(() => {
            this.updateAnalytics();
            button.innerHTML = originalText;
            button.disabled = false;
            this.showNotification('Analytics completed!', 'success');
        }, 2000);
    }

    updateAnalytics() {
        const timeRange = document.getElementById('analyticsTimeRange').value;
        const filteredData = this.filterDataByTimeRange(timeRange);

        // Update performance chart
        this.updatePerformanceChart(filteredData);

        // Update pattern chart
        this.updatePatternChart(filteredData);

        // Update correlation chart
        this.updateCorrelationChart(filteredData);

        // Update insights
        this.updateAnalyticsInsights(filteredData);

        // Update metrics
        this.updateAnalyticsMetrics(filteredData);
    }

    filterDataByTimeRange(range) {
        const now = new Date();
        let startTime;

        switch (range) {
            case 'day':
                startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case 'week':
                startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'quarter':
                startTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
        }

        return this.monitoringData.filter(d => new Date(d.timestamp) >= startTime);
    }

    updatePerformanceChart(data) {
        if (!this.charts.performanceChart) {
            const ctx = document.getElementById('performanceChart').getContext('2d');
            this.charts.performanceChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
                    datasets: [{
                        label: 'Productivity Score',
                        data: data.map(d => d.productivity),
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        } else {
            this.charts.performanceChart.data.labels = data.map(d => new Date(d.timestamp).toLocaleTimeString());
            this.charts.performanceChart.data.datasets[0].data = data.map(d => d.productivity);
            this.charts.performanceChart.update();
        }
    }

    updatePatternChart(data) {
        // Create pattern analysis (simplified)
        const hourlyData = this.groupDataByHour(data);

        if (!this.charts.patternChart) {
            const ctx = document.getElementById('patternChart').getContext('2d');
            this.charts.patternChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: Object.keys(hourlyData),
                    datasets: [{
                        label: 'Average Load',
                        data: Object.values(hourlyData),
                        backgroundColor: '#10b981'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        } else {
            this.charts.patternChart.data.labels = Object.keys(hourlyData);
            this.charts.patternChart.data.datasets[0].data = Object.values(hourlyData);
            this.charts.patternChart.update();
        }
    }

    groupDataByHour(data) {
        const hourly = {};
        data.forEach(d => {
            const hour = new Date(d.timestamp).getHours();
            if (!hourly[hour]) hourly[hour] = [];
            hourly[hour].push(d.load);
        });

        const result = {};
        Object.keys(hourly).forEach(hour => {
            result[`${hour}:00`] = hourly[hour].reduce((a, b) => a + b, 0) / hourly[hour].length;
        });

        return result;
    }

    updateCorrelationChart(data) {
        // Simple correlation analysis
        const correlations = this.calculateCorrelations(data);

        if (!this.charts.correlationChart) {
            const ctx = document.getElementById('correlationChart').getContext('2d');
            this.charts.correlationChart = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: ['Load vs Fatigue', 'Attention vs Productivity', 'Fatigue vs Attention', 'Load vs Productivity'],
                    datasets: [{
                        label: 'Correlation Strength',
                        data: correlations,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 1
                        }
                    }
                }
            });
        } else {
            this.charts.correlationChart.data.datasets[0].data = correlations;
            this.charts.correlationChart.update();
        }
    }

    calculateCorrelations(data) {
        // Simplified correlation calculation
        return [0.7, 0.8, -0.6, -0.5]; // Mock data
    }

    updateAnalyticsInsights(data) {
        const insightsPanel = document.getElementById('insightsPanel');
        insightsPanel.innerHTML = '';

        const insights = [
            {
                title: 'Peak Performance Hours',
                description: 'Your productivity peaks between 10 AM - 2 PM. Schedule important tasks during this time.'
            },
            {
                title: 'Fatigue Patterns',
                description: 'Fatigue levels increase significantly after 6 PM. Consider lighter tasks or breaks.'
            },
            {
                title: 'Load Management',
                description: 'High cognitive load periods correlate with decreased productivity. Use breaks to maintain optimal performance.'
            },
            {
                title: 'Attention Trends',
                description: 'Attention levels are highest in the morning. Start with complex tasks early in the day.'
            }
        ];

        insights.forEach(insight => {
            const item = document.createElement('div');
            item.className = 'insight-item';
            item.innerHTML = `
                <div class="insight-title">${insight.title}</div>
                <div class="insight-description">${insight.description}</div>
            `;
            insightsPanel.appendChild(item);
        });
    }

    updateAnalyticsMetrics(data) {
        if (data.length === 0) return;

        const avgLoad = data.reduce((sum, d) => sum + d.load, 0) / data.length;
        const peakProductivity = Math.max(...data.map(d => d.productivity));
        const completedTasks = this.tasks.filter(t => t.status === 'completed' &&
            new Date(t.completedAt) >= new Date(data[0].timestamp)).length;
        const totalTasks = this.tasks.filter(t =>
            new Date(t.createdAt) >= new Date(data[0].timestamp)).length;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Mock break compliance (would need actual break tracking)
        const breakCompliance = 75;

        document.getElementById('avgLoadMetric').textContent = `${avgLoad.toFixed(1)}%`;
        document.getElementById('peakProductivityMetric').textContent = `${peakProductivity.toFixed(1)}%`;
        document.getElementById('completionRateMetric').textContent = `${completionRate.toFixed(1)}%`;
        document.getElementById('breakComplianceMetric').textContent = `${breakCompliance}%`;
    }

    exportAnalytics() {
        const timeRange = document.getElementById('analyticsTimeRange').value;
        const data = this.filterDataByTimeRange(timeRange);

        const exportData = {
            timeRange,
            metrics: {
                averageLoad: data.reduce((sum, d) => sum + d.load, 0) / data.length,
                peakProductivity: Math.max(...data.map(d => d.productivity)),
                dataPoints: data.length
            },
            insights: [
                'Schedule complex tasks during peak hours (10 AM - 2 PM)',
                'Take regular breaks to maintain cognitive performance',
                'Monitor fatigue levels and adjust task difficulty accordingly'
            ]
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cognitive-analytics-${timeRange}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Analytics exported successfully!', 'success');
    }

    generateOptimizationPlan() {
        // Show loading state
        const button = document.getElementById('generatePlanBtn');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        button.disabled = true;

        setTimeout(() => {
            this.updateOptimizationResults();
            button.innerHTML = originalText;
            button.disabled = false;
            this.showNotification('Optimization plan generated!', 'success');
        }, 3000);
    }

    updateOptimizationResults() {
        const goal = document.getElementById('optimizationGoal').value;
        const schedule = document.getElementById('workSchedule').value;

        // Generate schedule visualization
        this.updateScheduleVisualization(schedule);

        // Generate recommendations
        this.updateOptimizationRecommendations(goal, schedule);

        // Update expected improvements
        this.updateExpectedImprovements(goal);
    }

    updateScheduleVisualization(schedule) {
        const scheduleViz = document.getElementById('scheduleVisualization');
        scheduleViz.innerHTML = '';

        const scheduleData = this.generateScheduleData(schedule);

        scheduleData.forEach(block => {
            const blockDiv = document.createElement('div');
            blockDiv.className = 'schedule-block';
            blockDiv.style.cssText = `
                position: absolute;
                left: ${block.left}%;
                top: ${block.top}%;
                width: ${block.width}%;
                height: ${block.height}%;
                background: ${block.color};
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: white;
                font-weight: 500;
            `;
            blockDiv.textContent = block.label;
            scheduleViz.appendChild(blockDiv);
        });
    }

    generateScheduleData(schedule) {
        const blocks = [];

        if (schedule === 'standard') {
            blocks.push(
                { left: 10, top: 20, width: 30, height: 15, color: '#2563eb', label: 'Deep Work' },
                { left: 50, top: 20, width: 30, height: 15, color: '#10b981', label: 'Meetings' },
                { left: 10, top: 45, width: 20, height: 10, color: '#f59e0b', label: 'Break' },
                { left: 40, top: 45, width: 40, height: 10, color: '#2563eb', label: 'Focused Tasks' }
            );
        } else if (schedule === 'flexible') {
            blocks.push(
                { left: 15, top: 15, width: 25, height: 20, color: '#2563eb', label: 'Creative Work' },
                { left: 50, top: 15, width: 25, height: 20, color: '#10b981', label: 'Communication' },
                { left: 15, top: 45, width: 35, height: 15, color: '#f59e0b', label: 'Flexible Time' },
                { left: 60, top: 45, width: 20, height: 15, color: '#ef4444', label: 'Breaks' }
            );
        }

        return blocks;
    }

    updateOptimizationRecommendations(goal, schedule) {
        const recommendationsList = document.getElementById('recommendationsList');
        recommendationsList.innerHTML = '';

        const recommendations = this.generateRecommendations(goal, schedule);

        recommendations.forEach(rec => {
            const item = document.createElement('div');
            item.className = 'recommendation-item';
            item.innerHTML = `
                <div class="recommendation-title">${rec.title}</div>
                <div class="recommendation-description">${rec.description}</div>
            `;
            recommendationsList.appendChild(item);
        });
    }

    generateRecommendations(goal, schedule) {
        const recommendations = [];

        if (goal === 'productivity') {
            recommendations.push(
                {
                    title: 'Task Prioritization',
                    description: 'Focus on high-priority, high-complexity tasks during peak cognitive hours (10 AM - 2 PM).'
                },
                {
                    title: 'Break Optimization',
                    description: 'Implement the Pomodoro technique: 25 minutes focused work followed by 5-minute breaks.'
                },
                {
                    title: 'Load Balancing',
                    description: 'Limit concurrent tasks to 2-3 maximum to maintain optimal cognitive load.'
                }
            );
        } else if (goal === 'balance') {
            recommendations.push(
                {
                    title: 'Work-Life Boundaries',
                    description: 'Set clear work hours and avoid checking work-related items outside these hours.'
                },
                {
                    title: 'Recovery Time',
                    description: 'Ensure at least 8 hours of sleep and include regular exercise in your schedule.'
                },
                {
                    title: 'Stress Management',
                    description: 'Practice mindfulness or meditation for 10-15 minutes daily to reduce cognitive load.'
                }
            );
        }

        return recommendations;
    }

    updateExpectedImprovements(goal) {
        const improvements = {
            productivity: { productivity: '+25%', fatigue: '-15%', focus: '+30%', completion: '+35%' },
            balance: { productivity: '+10%', fatigue: '-25%', focus: '+15%', completion: '+20%' },
            health: { productivity: '+5%', fatigue: '-30%', focus: '+20%', completion: '+15%' },
            efficiency: { productivity: '+20%', fatigue: '-10%', focus: '+25%', completion: '+40%' }
        };

        const currentImprovements = improvements[goal] || improvements.productivity;

        document.getElementById('productivityIncrease').textContent = currentImprovements.productivity;
        document.getElementById('fatigueReduction').textContent = currentImprovements.fatigue;
        document.getElementById('focusImprovement').textContent = currentImprovements.focus;
        document.getElementById('completionImprovement').textContent = currentImprovements.completion;
    }

    applyOptimizations() {
        // Apply the recommended optimizations
        this.showNotification('Optimizations applied! Your cognitive load management has been updated.', 'success');
    }

    showFatigueModal() {
        document.getElementById('fatigueModal').classList.add('show');
    }

    saveFatigueLog() {
        const selectedLevel = document.querySelector('input[name="fatigueLevel"]:checked');
        const notes = document.getElementById('fatigueNotes').value;

        if (!selectedLevel) {
            this.showNotification('Please select a fatigue level.', 'error');
            return;
        }

        const fatigueLog = {
            id: Date.now().toString(),
            level: parseInt(selectedLevel.value),
            notes: notes,
            timestamp: new Date()
        };

        this.fatigueLogs.push(fatigueLog);
        this.saveFatigueLogsToStorage();

        this.hideModals();
        this.showNotification('Fatigue level logged successfully!', 'success');
    }

    showBreakModal() {
        document.getElementById('breakModal').classList.add('show');
    }

    startBreak() {
        const breakType = document.querySelector('input[name="breakType"]:checked').value;
        const breakDurations = { short: 300, medium: 900, long: 1800 }; // seconds

        const duration = breakDurations[breakType];
        this.breakTimerSeconds = duration;

        this.hideModals();
        this.showNotification(`Started ${breakType} break for ${duration / 60} minutes!`, 'info');
    }

    generateReport() {
        const report = {
            generatedAt: new Date(),
            summary: {
                totalTasks: this.tasks.length,
                completedTasks: this.tasks.filter(t => t.status === 'completed').length,
                activeTasks: this.tasks.filter(t => t.status === 'active').length,
                averageLoad: this.calculateCurrentLoad(),
                focusTime: this.focusTimerSeconds
            },
            recommendations: [
                'Consider taking a 15-minute break to reset cognitive load.',
                'Schedule complex tasks during peak performance hours.',
                'Maintain regular breaks to prevent fatigue accumulation.'
            ]
        };

        // Display report in a modal or new window
        this.showNotification('Report generated! Check the console for details.', 'info');
        console.log('Cognitive Load Report:', report);
    }

    initializeCharts() {
        // Load trend chart
        const loadTrendCtx = document.getElementById('loadTrendChart').getContext('2d');
        this.charts.loadTrend = new Chart(loadTrendCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Cognitive Load',
                    data: [],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

        // Task completion chart
        const taskCompletionCtx = document.getElementById('taskCompletionChart').getContext('2d');
        this.charts.taskCompletion = new Chart(taskCompletionCtx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Active'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ['#10b981', '#2563eb']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            ${message}
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    saveTasksToStorage() {
        localStorage.setItem('cognitiveLoadBalancer_tasks', JSON.stringify(this.tasks));
    }

    saveMonitoringDataToStorage() {
        localStorage.setItem('cognitiveLoadBalancer_monitoring', JSON.stringify(this.monitoringData));
    }

    saveFatigueLogsToStorage() {
        localStorage.setItem('cognitiveLoadBalancer_fatigue', JSON.stringify(this.fatigueLogs));
    }

    loadSavedData() {
        // Load tasks
        const savedTasks = localStorage.getItem('cognitiveLoadBalancer_tasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks).map(task => ({
                ...task,
                createdAt: new Date(task.createdAt),
                updatedAt: new Date(task.updatedAt),
                deadline: task.deadline ? new Date(task.deadline) : null,
                completedAt: task.completedAt ? new Date(task.completedAt) : null
            }));
        }

        // Load monitoring data
        const savedMonitoring = localStorage.getItem('cognitiveLoadBalancer_monitoring');
        if (savedMonitoring) {
            this.monitoringData = JSON.parse(savedMonitoring).map(data => ({
                ...data,
                timestamp: new Date(data.timestamp)
            }));
        }

        // Load fatigue logs
        const savedFatigue = localStorage.getItem('cognitiveLoadBalancer_fatigue');
        if (savedFatigue) {
            this.fatigueLogs = JSON.parse(savedFatigue).map(log => ({
                ...log,
                timestamp: new Date(log.timestamp)
            }));
        }
    }

    renderInitialState() {
        this.renderTasks();
        this.updateDashboard();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CognitiveLoadBalancer();
});