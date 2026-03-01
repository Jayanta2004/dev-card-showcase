/**
 * Adaptive Interaction Complexity Balancer
 * Dynamically adjusts response depth based on user expertise inference
 */

class AdaptiveInteractionComplexityBalancer {
    constructor() {
        this.expertiseLevels = {
            BEGINNER: 'beginner',
            INTERMEDIATE: 'intermediate',
            ADVANCED: 'advanced'
        };

        this.signalCategories = {
            QUERY_COMPLEXITY: 'query_complexity',
            RESPONSE_TIME: 'response_time',
            INTERACTION_FREQUENCY: 'interaction_frequency',
            ERROR_RATE: 'error_rate',
            CONTEXT_RETENTION: 'context_retention',
            TERMINOLOGY_USAGE: 'terminology_usage'
        };

        this.complexityMetrics = {
            DEPTH: 'depth',
            DETAIL: 'detail',
            TECHNICALITY: 'technicality',
            INTERACTIVITY: 'interactivity'
        };

        this.users = new Map();
        this.signals = new Map();
        this.adaptationHistory = [];
        this.charts = {};

        this.config = {
            updateInterval: 5000,
            signalDecayRate: 0.95,
            expertiseThresholds: {
                beginner: { min: 0, max: 0.4 },
                intermediate: { min: 0.4, max: 0.7 },
                advanced: { min: 0.7, max: 1.0 }
            },
            adaptationWeights: {
                query_complexity: 0.3,
                response_time: 0.2,
                interaction_frequency: 0.2,
                error_rate: 0.15,
                context_retention: 0.1,
                terminology_usage: 0.05
            }
        };

        this.loadConfig();
        this.initializeUI();
        this.initializeCharts();
        this.startMonitoring();
    }

    loadConfig() {
        const saved = localStorage.getItem('aicb_config');
        if (saved) {
            this.config = { ...this.config, ...JSON.parse(saved) };
        }
    }

    saveConfig() {
        localStorage.setItem('aicb_config', JSON.stringify(this.config));
    }

    initializeUI() {
        this.bindEvents();
        this.updateExpertiseOverview();
        this.updateSignalCategories();
        this.updateComplexityMetrics();
        this.updateUserProfiles();
        this.updatePerformanceMetrics();
    }

    bindEvents() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Settings
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettingsModal());
        }

        // Profile management
        const addUserBtn = document.getElementById('add-user-btn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => this.openAddUserModal());
        }

        // Signal controls
        const signalFilter = document.getElementById('signal-filter');
        if (signalFilter) {
            signalFilter.addEventListener('change', (e) => this.filterSignals(e.target.value));
        }

        // Complexity controls
        const complexityMode = document.getElementById('complexity-mode');
        if (complexityMode) {
            complexityMode.addEventListener('change', (e) => this.setComplexityMode(e.target.value));
        }

        // Modal close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        // User selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.user-row')) {
                const userId = e.target.closest('.user-row').dataset.userId;
                this.selectUser(userId);
            }
        });
    }

    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('aicb_theme', newTheme);
    }

    initializeCharts() {
        this.initializeExpertiseChart();
        this.initializeSignalTimelineChart();
        this.initializeComplexityChart();
        this.initializePerformanceChart();
    }

    initializeExpertiseChart() {
        const ctx = document.getElementById('expertise-chart');
        if (!ctx) return;

        this.charts.expertise = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Beginner', 'Intermediate', 'Advanced'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: [
                        'rgba(76, 175, 80, 0.8)',
                        'rgba(255, 152, 0, 0.8)',
                        'rgba(244, 67, 54, 0.8)'
                    ],
                    borderWidth: 2,
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${context.parsed} users (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    initializeSignalTimelineChart() {
        const ctx = document.getElementById('signal-timeline-chart');
        if (!ctx) return;

        this.charts.signals = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Query Complexity',
                        data: [],
                        borderColor: 'rgba(25, 118, 210, 1)',
                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Response Time',
                        data: [],
                        borderColor: 'rgba(76, 175, 80, 1)',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Error Rate',
                        data: [],
                        borderColor: 'rgba(244, 67, 54, 1)',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Signal Strength'
                        },
                        min: 0,
                        max: 1
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    }

    initializeComplexityChart() {
        const ctx = document.getElementById('complexity-chart');
        if (!ctx) return;

        this.charts.complexity = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Depth', 'Detail', 'Technicality', 'Interactivity'],
                datasets: [{
                    label: 'Current Complexity',
                    data: [0, 0, 0, 0],
                    borderColor: 'rgba(25, 118, 210, 1)',
                    backgroundColor: 'rgba(25, 118, 210, 0.2)',
                    pointBackgroundColor: 'rgba(25, 118, 210, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(25, 118, 210, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 1,
                        ticks: {
                            stepSize: 0.2
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    }

    initializePerformanceChart() {
        const ctx = document.getElementById('performance-chart');
        if (!ctx) return;

        this.charts.performance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Adaptation Accuracy', 'User Satisfaction', 'Response Efficiency', 'Learning Rate'],
                datasets: [{
                    label: 'Performance Metrics',
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(76, 175, 80, 0.8)',
                        'rgba(25, 118, 210, 0.8)',
                        'rgba(255, 152, 0, 0.8)',
                        'rgba(156, 39, 176, 0.8)'
                    ],
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: (value) => value + '%'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.parsed.y}%`
                        }
                    }
                }
            }
        });
    }

    startMonitoring() {
        this.monitoringInterval = setInterval(() => {
            this.updateSignals();
            this.updateExpertiseLevels();
            this.updateComplexityMetrics();
            this.updateCharts();
            this.updatePerformanceMetrics();
        }, this.config.updateInterval);
    }

    updateSignals() {
        // Simulate signal data collection
        const signals = {};
        Object.values(this.signalCategories).forEach(category => {
            signals[category] = Math.random();
        });

        this.signals.set(Date.now(), signals);
        this.decayOldSignals();
    }

    decayOldSignals() {
        const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
        for (const [timestamp, signals] of this.signals) {
            if (timestamp < cutoff) {
                this.signals.delete(timestamp);
            } else {
                // Apply decay to older signals
                const age = Date.now() - timestamp;
                const decayFactor = Math.pow(this.config.signalDecayRate, age / (60 * 60 * 1000)); // Decay per hour
                Object.keys(signals).forEach(key => {
                    signals[key] *= decayFactor;
                });
            }
        }
    }

    updateExpertiseLevels() {
        // Calculate expertise levels for all users
        for (const [userId, user] of this.users) {
            const expertise = this.calculateExpertise(user);
            user.expertise = expertise;
            user.expertiseLevel = this.getExpertiseLevel(expertise);
        }
    }

    calculateExpertise(user) {
        let totalScore = 0;
        let totalWeight = 0;

        Object.entries(this.config.adaptationWeights).forEach(([signal, weight]) => {
            const signalValue = this.getLatestSignalValue(signal, user.id);
            totalScore += signalValue * weight;
            totalWeight += weight;
        });

        return totalWeight > 0 ? totalScore / totalWeight : 0;
    }

    getLatestSignalValue(signalType, userId) {
        // Get the most recent signal value for a user
        const latestSignals = Array.from(this.signals.entries())
            .sort((a, b) => b[0] - a[0])[0];

        if (!latestSignals) return 0.5; // Default neutral value

        const signals = latestSignals[1];
        return signals[signalType] || 0.5;
    }

    getExpertiseLevel(expertise) {
        if (expertise <= this.config.expertiseThresholds.beginner.max) {
            return this.expertiseLevels.BEGINNER;
        } else if (expertise <= this.config.expertiseThresholds.intermediate.max) {
            return this.expertiseLevels.INTERMEDIATE;
        } else {
            return this.expertiseLevels.ADVANCED;
        }
    }

    updateComplexityMetrics() {
        // Calculate average complexity metrics across all users
        const users = Array.from(this.users.values());
        if (users.length === 0) return;

        const metrics = {
            depth: 0,
            detail: 0,
            technicality: 0,
            interactivity: 0
        };

        users.forEach(user => {
            const userMetrics = this.calculateComplexityForUser(user);
            Object.keys(metrics).forEach(key => {
                metrics[key] += userMetrics[key];
            });
        });

        Object.keys(metrics).forEach(key => {
            metrics[key] /= users.length;
        });

        this.currentComplexity = metrics;
    }

    calculateComplexityForUser(user) {
        const expertise = user.expertise || 0.5;

        // Adaptive complexity calculation based on expertise
        return {
            depth: Math.min(1, expertise * 1.2),
            detail: Math.min(1, expertise * 1.1),
            technicality: expertise,
            interactivity: Math.max(0.2, 1 - expertise * 0.8)
        };
    }

    updateCharts() {
        this.updateExpertiseChart();
        this.updateSignalTimelineChart();
        this.updateComplexityChart();
        this.updatePerformanceChart();
    }

    updateExpertiseChart() {
        if (!this.charts.expertise) return;

        const distribution = {
            beginner: 0,
            intermediate: 0,
            advanced: 0
        };

        for (const user of this.users.values()) {
            const level = user.expertiseLevel || this.expertiseLevels.BEGINNER;
            distribution[level]++;
        }

        this.charts.expertise.data.datasets[0].data = [
            distribution.beginner,
            distribution.intermediate,
            distribution.advanced
        ];

        this.charts.expertise.update();
    }

    updateSignalTimelineChart() {
        if (!this.charts.signals) return;

        const timestamps = Array.from(this.signals.keys()).sort();
        const labels = timestamps.map(t => new Date(t).toLocaleTimeString());

        // Get last 20 data points
        const recentTimestamps = timestamps.slice(-20);
        const recentLabels = recentTimestamps.map(t => new Date(t).toLocaleTimeString());

        this.charts.signals.data.labels = recentLabels;

        ['query_complexity', 'response_time', 'error_rate'].forEach((signal, index) => {
            const data = recentTimestamps.map(timestamp => {
                const signals = this.signals.get(timestamp);
                return signals ? signals[signal] : 0;
            });
            this.charts.signals.data.datasets[index].data = data;
        });

        this.charts.signals.update();
    }

    updateComplexityChart() {
        if (!this.charts.complexity || !this.currentComplexity) return;

        this.charts.complexity.data.datasets[0].data = [
            this.currentComplexity.depth,
            this.currentComplexity.detail,
            this.currentComplexity.technicality,
            this.currentComplexity.interactivity
        ];

        this.charts.complexity.update();
    }

    updatePerformanceChart() {
        if (!this.charts.performance) return;

        // Calculate performance metrics
        const accuracy = this.calculateAdaptationAccuracy();
        const satisfaction = this.calculateUserSatisfaction();
        const efficiency = this.calculateResponseEfficiency();
        const learning = this.calculateLearningRate();

        this.charts.performance.data.datasets[0].data = [
            accuracy * 100,
            satisfaction * 100,
            efficiency * 100,
            learning * 100
        ];

        this.charts.performance.update();
    }

    calculateAdaptationAccuracy() {
        // Simplified accuracy calculation
        const users = Array.from(this.users.values());
        if (users.length === 0) return 0.5;

        let totalAccuracy = 0;
        users.forEach(user => {
            const predicted = user.expertise || 0.5;
            const actual = this.getUserActualExpertise(user);
            totalAccuracy += 1 - Math.abs(predicted - actual);
        });

        return totalAccuracy / users.length;
    }

    calculateUserSatisfaction() {
        // Mock satisfaction based on complexity adaptation
        return Math.random() * 0.3 + 0.7; // 70-100%
    }

    calculateResponseEfficiency() {
        // Mock efficiency metric
        return Math.random() * 0.2 + 0.8; // 80-100%
    }

    calculateLearningRate() {
        // Mock learning rate
        return Math.random() * 0.4 + 0.6; // 60-100%
    }

    getUserActualExpertise(user) {
        // In a real implementation, this would come from user feedback or testing
        return Math.random();
    }

    updateExpertiseOverview() {
        const overview = document.getElementById('expertise-overview');
        if (!overview) return;

        const distribution = {
            beginner: 0,
            intermediate: 0,
            advanced: 0
        };

        let totalUsers = 0;
        let avgExpertise = 0;

        for (const user of this.users.values()) {
            const level = user.expertiseLevel || this.expertiseLevels.BEGINNER;
            distribution[level]++;
            totalUsers++;
            avgExpertise += user.expertise || 0;
        }

        avgExpertise = totalUsers > 0 ? avgExpertise / totalUsers : 0;

        overview.innerHTML = `
            <div class="expertise-card">
                <div class="expertise-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="expertise-info">
                    <h3>Total Users</h3>
                    <div class="expertise-value">${totalUsers}</div>
                </div>
            </div>
            <div class="expertise-card">
                <div class="expertise-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="expertise-info">
                    <h3>Avg Expertise</h3>
                    <div class="expertise-value">${(avgExpertise * 100).toFixed(1)}%</div>
                    <div class="expertise-indicator">
                        <div class="expertise-bar">
                            <div class="expertise-fill" style="width: ${avgExpertise * 100}%"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="expertise-card">
                <div class="expertise-icon">
                    <i class="fas fa-brain"></i>
                </div>
                <div class="expertise-info">
                    <h3>Advanced Users</h3>
                    <div class="expertise-value">${distribution.advanced}</div>
                </div>
            </div>
        `;
    }

    updateSignalCategories() {
        const signalGrid = document.getElementById('signal-categories');
        if (!signalGrid) return;

        const latestSignals = this.getLatestSignals();

        signalGrid.innerHTML = Object.entries(this.signalCategories).map(([key, category]) => {
            const value = latestSignals[category] || 0;
            const level = this.getSignalLevel(value);

            return `
                <div class="signal-card ${level}">
                    <h4>${this.formatSignalName(category)}</h4>
                    <div class="signal-strength">
                        <span>${(value * 100).toFixed(1)}%</span>
                        <div class="signal-bar">
                            <div class="signal-fill ${level}" style="width: ${value * 100}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getLatestSignals() {
        const latest = Array.from(this.signals.entries())
            .sort((a, b) => b[0] - a[0])[0];

        return latest ? latest[1] : {};
    }

    getSignalLevel(value) {
        if (value < 0.4) return 'beginner';
        if (value < 0.7) return 'intermediate';
        return 'advanced';
    }

    formatSignalName(category) {
        return category.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    updateComplexityMetrics() {
        const metricsContainer = document.getElementById('complexity-metrics');
        if (!metricsContainer || !this.currentComplexity) return;

        metricsContainer.innerHTML = Object.entries(this.currentComplexity).map(([key, value]) => {
            const level = this.getSignalLevel(value);

            return `
                <div class="metric-card">
                    <h4>${this.formatMetricName(key)}</h4>
                    <div class="metric-value">${(value * 100).toFixed(1)}%</div>
                    <div class="metric-bar">
                        <div class="metric-fill ${level}" style="width: ${value * 100}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    formatMetricName(metric) {
        return metric.charAt(0).toUpperCase() + metric.slice(1);
    }

    updateUserProfiles() {
        const userList = document.getElementById('user-list');
        if (!userList) return;

        const tbody = userList.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = Array.from(this.users.values()).map(user => `
            <tr class="user-row" data-user-id="${user.id}">
                <td>${user.name}</td>
                <td><span class="expertise-level ${user.expertiseLevel}">${this.formatExpertiseLevel(user.expertiseLevel)}</span></td>
                <td>${(user.expertise * 100).toFixed(1)}%</td>
                <td>${user.lastInteraction ? new Date(user.lastInteraction).toLocaleDateString() : 'Never'}</td>
                <td>
                    <div class="user-actions">
                        <button class="btn-small btn-primary" onclick="balancer.editUser('${user.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-small btn-warning" onclick="balancer.deleteUser('${user.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    formatExpertiseLevel(level) {
        return level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Unknown';
    }

    updatePerformanceMetrics() {
        const metrics = document.querySelectorAll('.perf-card .perf-value');
        if (metrics.length === 0) return;

        const accuracy = this.calculateAdaptationAccuracy();
        const satisfaction = this.calculateUserSatisfaction();
        const efficiency = this.calculateResponseEfficiency();
        const learning = this.calculateLearningRate();

        const values = [accuracy, satisfaction, efficiency, learning];

        metrics.forEach((metric, index) => {
            const value = values[index];
            metric.textContent = `${(value * 100).toFixed(1)}%`;

            const trend = metric.nextElementSibling;
            if (trend) {
                const isPositive = value > 0.7;
                trend.className = `perf-trend ${isPositive ? 'positive' : 'negative'}`;
                trend.innerHTML = `<i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i> ${isPositive ? 'Good' : 'Needs Improvement'}`;
            }
        });
    }

    selectUser(userId) {
        const user = this.users.get(userId);
        if (!user) return;

        const details = document.getElementById('profile-details');
        if (!details) return;

        details.innerHTML = `
            <div class="profile-content">
                <h3>${user.name}</h3>
                <div class="profile-metric">
                    <span class="profile-metric-label">Expertise Level:</span>
                    <span class="profile-metric-value">${this.formatExpertiseLevel(user.expertiseLevel)}</span>
                </div>
                <div class="profile-metric">
                    <span class="profile-metric-label">Expertise Score:</span>
                    <span class="profile-metric-value">${(user.expertise * 100).toFixed(1)}%</span>
                </div>
                <div class="profile-metric">
                    <span class="profile-metric-label">Last Interaction:</span>
                    <span class="profile-metric-value">${user.lastInteraction ? new Date(user.lastInteraction).toLocaleString() : 'Never'}</span>
                </div>
                <div class="profile-metric">
                    <span class="profile-metric-label">Interaction Count:</span>
                    <span class="profile-metric-value">${user.interactionCount || 0}</span>
                </div>
                <div class="profile-metric">
                    <span class="profile-metric-label">Preferred Complexity:</span>
                    <span class="profile-metric-value">${this.getPreferredComplexity(user)}</span>
                </div>
            </div>
        `;
    }

    getPreferredComplexity(user) {
        const expertise = user.expertise || 0.5;
        if (expertise < 0.4) return 'Simple';
        if (expertise < 0.7) return 'Moderate';
        return 'Advanced';
    }

    addUser(name) {
        const userId = Date.now().toString();
        const user = {
            id: userId,
            name: name,
            expertise: 0.5,
            expertiseLevel: this.expertiseLevels.BEGINNER,
            lastInteraction: null,
            interactionCount: 0
        };

        this.users.set(userId, user);
        this.saveUsers();
        this.updateUserProfiles();
        this.updateExpertiseOverview();
        this.showNotification('User added successfully', 'success');
    }

    editUser(userId) {
        const user = this.users.get(userId);
        if (!user) return;

        const newName = prompt('Enter new name:', user.name);
        if (newName && newName.trim()) {
            user.name = newName.trim();
            this.saveUsers();
            this.updateUserProfiles();
            this.showNotification('User updated successfully', 'success');
        }
    }

    deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            this.users.delete(userId);
            this.saveUsers();
            this.updateUserProfiles();
            this.updateExpertiseOverview();
            this.showNotification('User deleted successfully', 'success');
        }
    }

    saveUsers() {
        const usersData = Array.from(this.users.entries());
        localStorage.setItem('aicb_users', JSON.stringify(usersData));
    }

    loadUsers() {
        const saved = localStorage.getItem('aicb_users');
        if (saved) {
            const usersData = JSON.parse(saved);
            this.users = new Map(usersData);
        }
    }

    openSettingsModal() {
        const modal = document.getElementById('settings-modal');
        if (!modal) return;

        // Populate settings
        const updateInterval = document.getElementById('update-interval');
        const signalDecay = document.getElementById('signal-decay');

        if (updateInterval) updateInterval.value = this.config.updateInterval / 1000;
        if (signalDecay) signalDecay.value = this.config.signalDecayRate;

        modal.style.display = 'block';
    }

    openAddUserModal() {
        const modal = document.getElementById('add-user-modal');
        if (!modal) return;

        modal.style.display = 'block';
    }

    closeModal() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.style.display = 'none');
    }

    saveSettings() {
        const updateInterval = document.getElementById('update-interval');
        const signalDecay = document.getElementById('signal-decay');

        if (updateInterval) {
            this.config.updateInterval = parseInt(updateInterval.value) * 1000;
        }

        if (signalDecay) {
            this.config.signalDecayRate = parseFloat(signalDecay.value);
        }

        this.saveConfig();

        // Restart monitoring with new interval
        clearInterval(this.monitoringInterval);
        this.startMonitoring();

        this.closeModal();
        this.showNotification('Settings saved successfully', 'success');
    }

    saveNewUser() {
        const nameInput = document.getElementById('new-user-name');
        if (!nameInput) return;

        const name = nameInput.value.trim();
        if (name) {
            this.addUser(name);
            nameInput.value = '';
            this.closeModal();
        } else {
            this.showNotification('Please enter a valid name', 'error');
        }
    }

    showNotification(message, type = 'info') {
        const notifications = document.getElementById('notifications');
        if (!notifications) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        notifications.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    filterSignals(level) {
        const cards = document.querySelectorAll('.signal-card');
        cards.forEach(card => {
            if (level === 'all' || card.classList.contains(level)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    setComplexityMode(mode) {
        // Adjust complexity calculation based on mode
        this.complexityMode = mode;
        this.updateComplexityMetrics();
        this.showNotification(`Complexity mode set to ${mode}`, 'info');
    }

    exportData() {
        const data = {
            users: Array.from(this.users.entries()),
            signals: Array.from(this.signals.entries()),
            config: this.config,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `aicb-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
        this.showNotification('Data exported successfully', 'success');
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.users) this.users = new Map(data.users);
                if (data.signals) this.signals = new Map(data.signals);
                if (data.config) this.config = { ...this.config, ...data.config };

                this.saveConfig();
                this.saveUsers();
                this.initializeUI();
                this.showNotification('Data imported successfully', 'success');
            } catch (error) {
                this.showNotification('Error importing data', 'error');
            }
        };
        reader.readAsText(file);
    }

    destroy() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
    }
}

// Initialize the application
let balancer;

document.addEventListener('DOMContentLoaded', () => {
    balancer = new AdaptiveInteractionComplexityBalancer();

    // Load saved theme
    const savedTheme = localStorage.getItem('aicb_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Load saved users
    balancer.loadUsers();
    balancer.initializeUI();
});

// Global functions for HTML event handlers
function saveSettings() {
    balancer.saveSettings();
}

function saveNewUser() {
    balancer.saveNewUser();
}

function exportData() {
    balancer.exportData();
}

function importData(event) {
    const file = event.target.files[0];
    if (file) {
        balancer.importData(file);
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (balancer) {
        balancer.destroy();
    }
});