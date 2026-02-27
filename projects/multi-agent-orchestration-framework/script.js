/**
 * Multi-Agent Orchestration Framework
 * Enterprise-grade multi-agent system with advanced orchestration capabilities
 * Version 1.0.0
 */

class MultiAgentOrchestrationFramework {
    constructor() {
        this.agents = new Map();
        this.workflows = new Map();
        this.tasks = new Map();
        this.messages = [];
        this.metrics = new Map();
        this.settings = this.loadSettings();
        this.communicationHub = new CommunicationHub();
        this.workflowEngine = new WorkflowEngine();
        this.taskScheduler = new TaskScheduler();
        this.monitoringSystem = new MonitoringSystem();
        this.analyticsEngine = new AnalyticsEngine();
        this.currentUser = null;
        this.systemStatus = 'initializing';

        this.initialize();
    }

    initialize() {
        this.bindEvents();
        this.initializeCharts();
        this.loadData();
        this.startSystem();
        this.updateUI();
        this.startPeriodicUpdates();
        this.logSystemEvent('system', 'startup', 'Multi-Agent Orchestration Framework initialized');
        console.log('Multi-Agent Orchestration Framework initialized');
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.navigateToSection(e.target.dataset.section));
        });

        // Quick actions
        document.getElementById('createAgentBtn').addEventListener('click', () => this.showAgentModal());
        document.getElementById('createWorkflowBtn').addEventListener('click', () => this.showWorkflowModal());
        document.getElementById('deploySystemBtn').addEventListener('click', () => this.deploySystem());

        // Agent management
        document.getElementById('agentSearch').addEventListener('input', () => this.filterAgents());
        document.getElementById('agentTypeFilter').addEventListener('change', () => this.filterAgents());
        document.getElementById('agentStatusFilter').addEventListener('change', () => this.filterAgents());

        // Workflow management
        document.getElementById('workflowSearch').addEventListener('input', () => this.filterWorkflows());
        document.getElementById('workflowStatusFilter').addEventListener('change', () => this.filterWorkflows());
        document.getElementById('importWorkflowBtn').addEventListener('click', () => this.importWorkflow());
        document.getElementById('exportWorkflowsBtn').addEventListener('click', () => this.exportWorkflows());

        // Workflow canvas
        document.getElementById('addTaskNodeBtn').addEventListener('click', () => this.addWorkflowNode('task'));
        document.getElementById('addDecisionNodeBtn').addEventListener('click', () => this.addWorkflowNode('decision'));
        document.getElementById('addAgentNodeBtn').addEventListener('click', () => this.addWorkflowNode('agent'));
        document.getElementById('clearCanvasBtn').addEventListener('click', () => this.clearWorkflowCanvas());
        document.getElementById('saveWorkflowBtn').addEventListener('click', () => this.saveWorkflow());

        // Task management
        document.getElementById('taskSearch').addEventListener('input', () => this.filterTasks());
        document.getElementById('taskStatusFilter').addEventListener('change', () => this.filterTasks());
        document.getElementById('taskPriorityFilter').addEventListener('change', () => this.filterTasks());
        document.getElementById('createTaskBtn').addEventListener('click', () => this.showTaskModal());
        document.getElementById('bulkTaskActionBtn').addEventListener('click', () => this.showBulkTaskActions());

        // Communication
        document.getElementById('messageTypeFilter').addEventListener('change', () => this.filterMessages());
        document.getElementById('clearMessagesBtn').addEventListener('click', () => this.clearMessages());
        document.getElementById('exportMessagesBtn').addEventListener('click', () => this.exportMessages());

        // Monitoring
        document.getElementById('timeRange').addEventListener('change', () => this.updateMonitoringCharts());
        document.getElementById('refreshMonitoringBtn').addEventListener('click', () => this.refreshMonitoring());

        // Analytics
        document.getElementById('analyticsTimeRange').addEventListener('change', () => this.updateAnalyticsCharts());
        document.getElementById('generateReportBtn').addEventListener('click', () => this.generateAnalyticsReport());
        document.getElementById('exportAnalyticsBtn').addEventListener('click', () => this.exportAnalytics());

        // Settings
        document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());
        document.getElementById('resetSettingsBtn').addEventListener('click', () => this.resetSettings());
        document.getElementById('exportSettingsBtn').addEventListener('click', () => this.exportSettings());
        document.getElementById('importSettingsBtn').addEventListener('click', () => this.importSettings());

        // Authentication
        document.getElementById('loginBtn').addEventListener('click', () => this.showLogin());

        // Modal controls
        document.querySelectorAll('.modal-close').forEach(close => {
            close.addEventListener('click', () => this.closeModal());
        });

        document.getElementById('saveAgentBtn').addEventListener('click', () => this.saveAgent());
        document.getElementById('cancelAgentBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('saveWorkflowBtn').addEventListener('click', () => this.saveWorkflowFromModal());
        document.getElementById('cancelWorkflowBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('saveTaskBtn').addEventListener('click', () => this.saveTask());
        document.getElementById('cancelTaskBtn').addEventListener('click', () => this.closeModal());

        // File input
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileUpload(e));
    }

    initializeCharts() {
        // Workflow Performance Chart
        const workflowCtx = document.getElementById('workflowPerformanceChart').getContext('2d');
        this.charts = {
            workflowPerformance: new Chart(workflowCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Workflow Execution Time',
                        data: [],
                        borderColor: 'rgba(30, 64, 175, 1)',
                        backgroundColor: 'rgba(30, 64, 175, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }),

            // Message Throughput Chart
            messageThroughput: new Chart(document.getElementById('messageThroughputChart').getContext('2d'), {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Messages per Minute',
                        data: [],
                        borderColor: 'rgba(5, 150, 105, 1)',
                        backgroundColor: 'rgba(5, 150, 105, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }),

            // Communication Patterns Chart
            communicationPatterns: new Chart(document.getElementById('communicationPatternsChart').getContext('2d'), {
                type: 'radar',
                data: {
                    labels: ['Task Coordination', 'Status Updates', 'Error Reporting', 'Resource Sharing', 'Load Balancing'],
                    datasets: [{
                        label: 'Communication Frequency',
                        data: [],
                        backgroundColor: 'rgba(245, 158, 11, 0.2)',
                        borderColor: 'rgba(245, 158, 11, 1)',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }),

            // Agent Performance Chart
            agentPerformance: new Chart(document.getElementById('agentPerformanceChart').getContext('2d'), {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Tasks Completed',
                        data: [],
                        backgroundColor: 'rgba(30, 64, 175, 0.8)',
                        borderColor: 'rgba(30, 64, 175, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }),

            // Task Completion Chart
            taskCompletion: new Chart(document.getElementById('taskCompletionChart').getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'Running', 'Pending', 'Failed'],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            'rgba(5, 150, 105, 0.8)',
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(220, 38, 38, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }),

            // Error Rate Chart
            errorRate: new Chart(document.getElementById('errorRateChart').getContext('2d'), {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Error Rate (%)',
                        data: [],
                        borderColor: 'rgba(220, 38, 38, 1)',
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
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
            }),

            // Resource Usage Chart
            resourceUsage: new Chart(document.getElementById('resourceUsageChart').getContext('2d'), {
                type: 'radar',
                data: {
                    labels: ['CPU', 'Memory', 'Network', 'Storage', 'GPU'],
                    datasets: [{
                        label: 'Resource Usage (%)',
                        data: [],
                        backgroundColor: 'rgba(139, 69, 19, 0.2)',
                        borderColor: 'rgba(139, 69, 19, 1)',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }),

            // Workflow Efficiency Chart
            workflowEfficiency: new Chart(document.getElementById('workflowEfficiencyChart').getContext('2d'), {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Efficiency Score',
                        data: [],
                        backgroundColor: 'rgba(75, 85, 99, 0.8)',
                        borderColor: 'rgba(75, 85, 99, 1)',
                        borderWidth: 1
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
            }),

            // Agent Productivity Chart
            agentProductivity: new Chart(document.getElementById('agentProductivityChart').getContext('2d'), {
                type: 'horizontalBar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Productivity Score',
                        data: [],
                        backgroundColor: 'rgba(30, 64, 175, 0.8)',
                        borderColor: 'rgba(30, 64, 175, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            }),

            // Workflow Success Chart
            workflowSuccess: new Chart(document.getElementById('workflowSuccessChart').getContext('2d'), {
                type: 'pie',
                data: {
                    labels: ['Successful', 'Failed', 'Partial Success'],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            'rgba(5, 150, 105, 0.8)',
                            'rgba(220, 38, 38, 0.8)',
                            'rgba(245, 158, 11, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }),

            // Task Distribution Chart
            taskDistribution: new Chart(document.getElementById('taskDistributionChart').getContext('2d'), {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Tasks by Type',
                        data: [],
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }),

            // Communication Efficiency Chart
            communicationEfficiency: new Chart(document.getElementById('communicationEfficiencyChart').getContext('2d'), {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Communication Efficiency',
                        data: [],
                        borderColor: 'rgba(5, 150, 105, 1)',
                        backgroundColor: 'rgba(5, 150, 105, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }),

            // Performance Trends Chart
            performanceTrends: new Chart(document.getElementById('performanceTrendsChart').getContext('2d'), {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'System Performance',
                        data: [],
                        borderColor: 'rgba(139, 69, 19, 1)',
                        backgroundColor: 'rgba(139, 69, 19, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            })
        };
    }

    loadData() {
        // Load sample data
        this.loadSampleData();
        this.loadSavedData();
    }

    loadSampleData() {
        // Sample capabilities
        this.capabilities = [
            { id: 'data_processing', name: 'Data Processing', category: 'computation' },
            { id: 'machine_learning', name: 'Machine Learning', category: 'ai' },
            { id: 'communication', name: 'Communication', category: 'networking' },
            { id: 'monitoring', name: 'Monitoring', category: 'system' },
            { id: 'coordination', name: 'Coordination', category: 'management' },
            { id: 'analysis', name: 'Analysis', category: 'computation' },
            { id: 'optimization', name: 'Optimization', category: 'ai' },
            { id: 'scheduling', name: 'Scheduling', category: 'management' }
        ];

        // Sample agents
        this.agents.set('agent_001', {
            id: 'agent_001',
            name: 'Data Processor Alpha',
            type: 'worker',
            capabilities: ['data_processing', 'analysis'],
            status: 'active',
            workload: 65,
            tasksCompleted: 1247,
            efficiency: 89,
            lastActive: new Date(),
            config: { maxConcurrency: 5, priority: 'medium' }
        });

        this.agents.set('agent_002', {
            id: 'agent_002',
            name: 'ML Specialist Beta',
            type: 'specialist',
            capabilities: ['machine_learning', 'optimization'],
            status: 'active',
            workload: 78,
            tasksCompleted: 892,
            efficiency: 94,
            lastActive: new Date(),
            config: { maxConcurrency: 3, priority: 'high' }
        });

        this.agents.set('agent_003', {
            id: 'agent_003',
            name: 'Coordinator Gamma',
            type: 'coordinator',
            capabilities: ['coordination', 'scheduling', 'monitoring'],
            status: 'active',
            workload: 45,
            tasksCompleted: 2156,
            efficiency: 96,
            lastActive: new Date(),
            config: { maxConcurrency: 10, priority: 'critical' }
        });

        // Sample workflows
        this.workflows.set('workflow_001', {
            id: 'workflow_001',
            name: 'Data Analysis Pipeline',
            description: 'Complete data processing and analysis workflow',
            type: 'sequential',
            status: 'running',
            priority: 'high',
            nodes: [
                { id: 'node_001', type: 'task', name: 'Data Ingestion', agentId: 'agent_001' },
                { id: 'node_002', type: 'task', name: 'Data Cleaning', agentId: 'agent_001' },
                { id: 'node_003', type: 'decision', name: 'Quality Check', conditions: [] },
                { id: 'node_004', type: 'task', name: 'ML Analysis', agentId: 'agent_002' },
                { id: 'node_005', type: 'task', name: 'Report Generation', agentId: 'agent_001' }
            ],
            connections: [
                { from: 'node_001', to: 'node_002' },
                { from: 'node_002', to: 'node_003' },
                { from: 'node_003', to: 'node_004', condition: 'quality_ok' },
                { from: 'node_004', to: 'node_005' }
            ],
            created: new Date(),
            started: new Date(),
            progress: 60
        });

        // Sample tasks
        this.tasks.set('task_001', {
            id: 'task_001',
            name: 'Process Customer Data',
            description: 'Clean and validate customer data from CSV files',
            type: 'data_processing',
            status: 'running',
            priority: 'high',
            assignedAgent: 'agent_001',
            workflowId: 'workflow_001',
            parameters: { inputFile: 'customers.csv', outputFormat: 'json' },
            created: new Date(),
            started: new Date(),
            deadline: new Date(Date.now() + 3600000),
            progress: 75,
            dependencies: []
        });

        this.tasks.set('task_002', {
            id: 'task_002',
            name: 'Train Recommendation Model',
            description: 'Train ML model for product recommendations',
            type: 'machine_learning',
            status: 'pending',
            priority: 'medium',
            assignedAgent: 'agent_002',
            workflowId: 'workflow_001',
            parameters: { algorithm: 'collaborative_filtering', dataset: 'user_behavior.csv' },
            created: new Date(),
            deadline: new Date(Date.now() + 7200000),
            progress: 0,
            dependencies: ['task_001']
        });
    }

    loadSavedData() {
        const savedData = localStorage.getItem('orchestrationData');
        if (savedData) {
            const data = JSON.parse(savedData);
            // Load saved data while preserving sample data structure
            this.messages = data.messages || [];
            this.metrics = new Map(data.metrics || []);
            this.currentUser = data.currentUser || null;
        }
    }

    saveData() {
        const dataToSave = {
            agents: Array.from(this.agents.entries()),
            workflows: Array.from(this.workflows.entries()),
            tasks: Array.from(this.tasks.entries()),
            messages: this.messages.slice(-1000), // Keep last 1000 messages
            metrics: Array.from(this.metrics.entries()),
            currentUser: this.currentUser,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('orchestrationData', JSON.stringify(dataToSave));
    }

    loadSettings() {
        const defaultSettings = {
            maxAgents: 100,
            maxWorkflows: 50,
            maxTasks: 1000,
            taskTimeout: 60,
            messageQueueSize: 1000,
            communicationProtocol: 'websocket',
            enableEncryption: true,
            monitoringInterval: 30,
            alertThreshold: 80,
            enableDetailedLogging: true,
            loadBalancingStrategy: 'round-robin',
            faultToleranceLevel: 'medium',
            enableAutoScaling: false,
            policyCacheSize: 100,
            sessionTimeout: 3600
        };

        const saved = localStorage.getItem('orchestrationSettings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    startSystem() {
        this.systemStatus = 'running';
        this.communicationHub.start();
        this.workflowEngine.start();
        this.taskScheduler.start();
        this.monitoringSystem.start();
        this.analyticsEngine.start();

        // Start periodic health checks
        setInterval(() => this.performHealthCheck(), 30000);
    }

    performHealthCheck() {
        // Check agent health
        this.agents.forEach((agent, agentId) => {
            const timeSinceActive = Date.now() - new Date(agent.lastActive).getTime();
            if (timeSinceActive > 300000) { // 5 minutes
                agent.status = 'idle';
                this.logSystemEvent('agent', 'health_check', `Agent ${agent.name} marked as idle`);
            }
        });

        // Check workflow health
        this.workflows.forEach((workflow, workflowId) => {
            if (workflow.status === 'running') {
                const runningTime = Date.now() - new Date(workflow.started).getTime();
                if (runningTime > 3600000) { // 1 hour
                    workflow.status = 'stalled';
                    this.logSystemEvent('workflow', 'health_check', `Workflow ${workflow.name} marked as stalled`);
                }
            }
        });

        this.updateUI();
    }

    updateUI() {
        this.updateDashboard();
        this.updateNavigation();
        this.updateCurrentUserDisplay();
        this.refreshAllViews();
        this.updateCharts();
        this.updateSystemStatus();
    }

    updateDashboard() {
        // Update stats
        document.getElementById('totalAgents').textContent = this.agents.size;
        document.getElementById('runningWorkflows').textContent = Array.from(this.workflows.values()).filter(w => w.status === 'running').length;
        document.getElementById('pendingTasks').textContent = Array.from(this.tasks.values()).filter(t => t.status === 'pending').length;

        // Calculate system load
        const totalWorkload = Array.from(this.agents.values()).reduce((sum, agent) => sum + agent.workload, 0);
        const avgLoad = this.agents.size > 0 ? Math.round(totalWorkload / this.agents.size) : 0;
        document.getElementById('systemLoad').textContent = `${avgLoad}%`;

        // Update agent status list
        this.updateAgentStatusList();

        // Update network visualization
        this.updateNetworkVisualization();

        // Update recent activity
        this.updateRecentActivity();

        // Update health metrics
        this.updateHealthMetrics();
    }

    updateAgentStatusList() {
        const statusList = document.getElementById('agentStatusList');
        statusList.innerHTML = '';

        Array.from(this.agents.values()).slice(0, 5).forEach(agent => {
            const statusItem = document.createElement('div');
            statusItem.className = `agent-status-item ${agent.status}`;

            statusItem.innerHTML = `
                <div class="agent-status-name">${agent.name}</div>
                <div class="agent-status-type">${agent.type}</div>
                <div class="agent-status-indicator ${agent.status}"></div>
            `;

            statusList.appendChild(statusItem);
        });
    }

    updateNetworkVisualization() {
        const visualization = document.getElementById('networkVisualization');
        visualization.innerHTML = '';

        // Create agent nodes
        Array.from(this.agents.values()).forEach((agent, index) => {
            const node = document.createElement('div');
            node.className = 'network-node';
            node.style.left = `${20 + (index * 15) % 60}%`;
            node.style.top = `${20 + (index * 20) % 50}%`;
            node.textContent = agent.name.split(' ')[0][0] + agent.name.split(' ')[1][0];
            node.title = agent.name;
            visualization.appendChild(node);
        });

        // Create connections (simplified)
        const agents = Array.from(this.agents.values());
        for (let i = 0; i < Math.min(agents.length - 1, 3); i++) {
            const connection = document.createElement('div');
            connection.className = 'network-connection';
            connection.style.left = `${25 + (i * 15)}%`;
            connection.style.top = `${30 + (i * 15)}%`;
            connection.style.width = '50px';
            connection.style.transform = `rotate(${30 + i * 20}deg)`;
            visualization.appendChild(connection);
        }
    }

    updateRecentActivity() {
        const activityFeed = document.getElementById('recentActivity');
        activityFeed.innerHTML = '';

        // Get recent messages and events
        const recentItems = this.messages.slice(-5).reverse();

        recentItems.forEach(message => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';

            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-${this.getMessageIcon(message.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-message">${message.content}</div>
                    <div class="activity-time">${new Date(message.timestamp).toLocaleTimeString()}</div>
                </div>
            `;

            activityFeed.appendChild(activityItem);
        });
    }

    getMessageIcon(type) {
        const icons = {
            'task': 'tasks',
            'status': 'info-circle',
            'error': 'exclamation-triangle',
            'coordination': 'network-wired',
            'system': 'cog'
        };
        return icons[type] || 'comment';
    }

    updateHealthMetrics() {
        // Simulate health metrics
        const cpuUsage = Math.floor(Math.random() * 30) + 40;
        const memoryUsage = Math.floor(Math.random() * 25) + 50;
        const networkUsage = Math.floor(Math.random() * 20) + 30;

        document.getElementById('cpuUsage').style.width = `${cpuUsage}%`;
        document.getElementById('cpuUsageValue').textContent = `${cpuUsage}%`;

        document.getElementById('memoryUsage').style.width = `${memoryUsage}%`;
        document.getElementById('memoryUsageValue').textContent = `${memoryUsage}%`;

        document.getElementById('networkUsage').style.width = `${networkUsage}%`;
        document.getElementById('networkUsageValue').textContent = `${networkUsage}%`;
    }

    updateNavigation() {
        // Update navigation based on system status
    }

    updateCurrentUserDisplay() {
        const currentUserElement = document.getElementById('currentUser');
        const loginBtn = document.getElementById('loginBtn');

        if (this.currentUser) {
            currentUserElement.textContent = this.currentUser;
            loginBtn.style.display = 'none';
        } else {
            currentUserElement.textContent = 'Not logged in';
            loginBtn.style.display = 'inline-block';
        }
    }

    updateSystemStatus() {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.status-text');

        statusIndicator.classList.remove('active', 'inactive');
        statusIndicator.classList.add(this.systemStatus === 'running' ? 'active' : 'inactive');
        statusText.textContent = `System ${this.systemStatus}`;
    }

    refreshAllViews() {
        this.refreshAgentsView();
        this.refreshWorkflowsView();
        this.refreshTasksView();
        this.refreshCommunicationView();
        this.refreshMonitoringView();
        this.refreshAnalyticsView();
    }

    refreshAgentsView() {
        this.displayAgents();
    }

    refreshWorkflowsView() {
        this.displayWorkflows();
    }

    refreshTasksView() {
        this.displayTasks();
    }

    refreshCommunicationView() {
        this.displayMessages();
    }

    refreshMonitoringView() {
        this.updateMonitoringCharts();
    }

    refreshAnalyticsView() {
        this.updateAnalyticsCharts();
    }

    updateCharts() {
        this.updateWorkflowPerformanceChart();
        this.updateMessageThroughputChart();
        this.updateCommunicationPatternsChart();
        this.updateMonitoringCharts();
        this.updateAnalyticsCharts();
    }

    updateWorkflowPerformanceChart() {
        // Simulate workflow performance data
        const labels = [];
        const data = [];

        for (let i = 9; i >= 0; i--) {
            const time = new Date(Date.now() - i * 60000);
            labels.push(time.toLocaleTimeString());
            data.push(Math.floor(Math.random() * 50) + 100);
        }

        this.charts.workflowPerformance.data.labels = labels;
        this.charts.workflowPerformance.data.datasets[0].data = data;
        this.charts.workflowPerformance.update();
    }

    updateMessageThroughputChart() {
        // Simulate message throughput data
        const labels = [];
        const data = [];

        for (let i = 9; i >= 0; i--) {
            const time = new Date(Date.now() - i * 60000);
            labels.push(time.toLocaleTimeString());
            data.push(Math.floor(Math.random() * 20) + 5);
        }

        this.charts.messageThroughput.data.labels = labels;
        this.charts.messageThroughput.data.datasets[0].data = data;
        this.charts.messageThroughput.update();
    }

    updateCommunicationPatternsChart() {
        // Simulate communication patterns
        const data = [
            Math.floor(Math.random() * 50) + 20,
            Math.floor(Math.random() * 40) + 15,
            Math.floor(Math.random() * 30) + 10,
            Math.floor(Math.random() * 35) + 15,
            Math.floor(Math.random() * 25) + 10
        ];

        this.charts.communicationPatterns.data.datasets[0].data = data;
        this.charts.communicationPatterns.update();
    }

    updateMonitoringCharts() {
        // Update agent performance
        const agentLabels = Array.from(this.agents.values()).map(a => a.name);
        const agentData = Array.from(this.agents.values()).map(a => a.tasksCompleted);

        this.charts.agentPerformance.data.labels = agentLabels;
        this.charts.agentPerformance.data.datasets[0].data = agentData;
        this.charts.agentPerformance.update();

        // Update task completion
        const taskStats = this.getTaskStatistics();
        this.charts.taskCompletion.data.datasets[0].data = [
            taskStats.completed,
            taskStats.running,
            taskStats.pending,
            taskStats.failed
        ];
        this.charts.taskCompletion.update();

        // Update error rate
        const errorData = this.getErrorRateData();
        this.charts.errorRate.data.labels = errorData.labels;
        this.charts.errorRate.data.datasets[0].data = errorData.data;
        this.charts.errorRate.update();

        // Update resource usage
        const resourceData = [
            Math.floor(Math.random() * 30) + 40,
            Math.floor(Math.random() * 25) + 50,
            Math.floor(Math.random() * 20) + 30,
            Math.floor(Math.random() * 15) + 60,
            Math.floor(Math.random() * 10) + 20
        ];
        this.charts.resourceUsage.data.datasets[0].data = resourceData;
        this.charts.resourceUsage.update();

        // Update workflow efficiency
        const workflowLabels = Array.from(this.workflows.values()).map(w => w.name);
        const workflowData = Array.from(this.workflows.values()).map(w => Math.floor(Math.random() * 30) + 70);

        this.charts.workflowEfficiency.data.labels = workflowLabels;
        this.charts.workflowEfficiency.data.datasets[0].data = workflowData;
        this.charts.workflowEfficiency.update();
    }

    updateAnalyticsCharts() {
        // Update agent productivity
        const agentLabels = Array.from(this.agents.values()).map(a => a.name);
        const agentData = Array.from(this.agents.values()).map(a => a.efficiency);

        this.charts.agentProductivity.data.labels = agentLabels;
        this.charts.agentProductivity.data.datasets[0].data = agentData;
        this.charts.agentProductivity.update();

        // Update workflow success
        const workflowStats = this.getWorkflowStatistics();
        this.charts.workflowSuccess.data.datasets[0].data = [
            workflowStats.successful,
            workflowStats.failed,
            workflowStats.partial
        ];
        this.charts.workflowSuccess.update();

        // Update task distribution
        const taskTypeStats = this.getTaskTypeStatistics();
        this.charts.taskDistribution.data.labels = Object.keys(taskTypeStats);
        this.charts.taskDistribution.data.datasets[0].data = Object.values(taskTypeStats);
        this.charts.taskDistribution.update();

        // Update communication efficiency
        const commData = this.getCommunicationEfficiencyData();
        this.charts.communicationEfficiency.data.labels = commData.labels;
        this.charts.communicationEfficiency.data.datasets[0].data = commData.data;
        this.charts.communicationEfficiency.update();

        // Update performance trends
        const perfData = this.getPerformanceTrendsData();
        this.charts.performanceTrends.data.labels = perfData.labels;
        this.charts.performanceTrends.data.datasets[0].data = perfData.data;
        this.charts.performanceTrends.update();

        // Update insights
        this.updateKeyInsights();
    }

    getTaskStatistics() {
        const tasks = Array.from(this.tasks.values());
        return {
            completed: tasks.filter(t => t.status === 'completed').length,
            running: tasks.filter(t => t.status === 'running').length,
            pending: tasks.filter(t => t.status === 'pending').length,
            failed: tasks.filter(t => t.status === 'failed').length
        };
    }

    getErrorRateData() {
        const labels = [];
        const data = [];

        for (let i = 9; i >= 0; i--) {
            const time = new Date(Date.now() - i * 60000);
            labels.push(time.toLocaleTimeString());
            data.push(Math.floor(Math.random() * 5));
        }

        return { labels, data };
    }

    getWorkflowStatistics() {
        const workflows = Array.from(this.workflows.values());
        return {
            successful: workflows.filter(w => w.status === 'completed').length,
            failed: workflows.filter(w => w.status === 'failed').length,
            partial: workflows.filter(w => w.status === 'partial_success').length
        };
    }

    getTaskTypeStatistics() {
        const tasks = Array.from(this.tasks.values());
        const stats = {};

        tasks.forEach(task => {
            stats[task.type] = (stats[task.type] || 0) + 1;
        });

        return stats;
    }

    getCommunicationEfficiencyData() {
        const labels = [];
        const data = [];

        for (let i = 9; i >= 0; i--) {
            const time = new Date(Date.now() - i * 60000);
            labels.push(time.toLocaleTimeString());
            data.push(Math.floor(Math.random() * 20) + 80);
        }

        return { labels, data };
    }

    getPerformanceTrendsData() {
        const labels = [];
        const data = [];

        for (let i = 9; i >= 0; i--) {
            const time = new Date(Date.now() - i * 60000);
            labels.push(time.toLocaleTimeString());
            data.push(Math.floor(Math.random() * 10) + 85);
        }

        return { labels, data };
    }

    updateKeyInsights() {
        const insightsList = document.getElementById('keyInsights');
        insightsList.innerHTML = '';

        const insights = [
            {
                title: 'Agent Efficiency',
                description: 'Average agent efficiency has improved by 12% this week',
                metric: '87%'
            },
            {
                title: 'Task Completion Rate',
                description: '95% of tasks are completed within deadline',
                metric: '95%'
            },
            {
                title: 'Communication Overhead',
                description: 'Inter-agent communication has reduced by 8%',
                metric: '23%'
            },
            {
                title: 'System Reliability',
                description: 'Uptime maintained at 99.9% for the past month',
                metric: '99.9%'
            }
        ];

        insights.forEach(insight => {
            const insightElement = document.createElement('div');
            insightElement.className = 'insight-item';

            insightElement.innerHTML = `
                <div class="insight-title">${insight.title}</div>
                <div class="insight-description">${insight.description}</div>
                <div class="insight-metric">${insight.metric}</div>
            `;

            insightsList.appendChild(insightElement);
        });
    }

    // Agent Management
    showAgentModal(agentId = null) {
        const modal = document.getElementById('agentModal');
        const title = document.getElementById('agentModalTitle');
        const form = document.getElementById('agentForm');

        if (agentId) {
            const agent = this.agents.get(agentId);
            if (agent) {
                title.textContent = 'Edit Agent';
                document.getElementById('agentName').value = agent.name;
                document.getElementById('agentType').value = agent.type;
                document.getElementById('agentDescription').value = agent.description || '';
                this.populateCapabilitiesCheckboxes(agent.capabilities);
            }
        } else {
            title.textContent = 'Create Agent';
            form.reset();
            this.populateCapabilitiesCheckboxes();
        }

        modal.style.display = 'block';
    }

    populateCapabilitiesCheckboxes(selectedCapabilities = []) {
        const capabilitiesSelection = document.getElementById('agentCapabilities');
        capabilitiesSelection.innerHTML = '';

        this.capabilities.forEach(capability => {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="checkbox" value="${capability.id}" ${selectedCapabilities.includes(capability.id) ? 'checked' : ''}>
                ${capability.name}
            `;
            capabilitiesSelection.appendChild(label);
        });
    }

    saveAgent() {
        const name = document.getElementById('agentName').value;
        const type = document.getElementById('agentType').value;
        const description = document.getElementById('agentDescription').value;
        const selectedCapabilities = Array.from(document.querySelectorAll('#agentCapabilities input:checked')).map(cb => cb.value);

        if (!name) {
            alert('Please enter an agent name');
            return;
        }

        const agentData = {
            name,
            type,
            description,
            capabilities: selectedCapabilities,
            status: 'active',
            workload: 0,
            tasksCompleted: 0,
            efficiency: 100,
            lastActive: new Date(),
            config: { maxConcurrency: 5, priority: 'medium' }
        };

        const existingAgentId = Array.from(this.agents.values()).find(a => a.name === name)?.id;
        if (existingAgentId) {
            // Update existing agent
            agentData.id = existingAgentId;
            agentData.tasksCompleted = this.agents.get(existingAgentId).tasksCompleted;
            this.agents.set(existingAgentId, agentData);
            this.logSystemEvent('agent', 'update', `Updated agent: ${name}`);
        } else {
            // Create new agent
            agentData.id = 'agent_' + Date.now();
            this.agents.set(agentData.id, agentData);
            this.logSystemEvent('agent', 'create', `Created agent: ${name}`);
        }

        this.closeModal();
        this.updateUI();
        this.saveData();
    }

    displayAgents() {
        const agentsGrid = document.getElementById('agentsGrid');
        agentsGrid.innerHTML = '';

        this.agents.forEach(agent => {
            const agentCard = document.createElement('div');
            agentCard.className = 'agent-card';

            agentCard.innerHTML = `
                <div class="agent-header">
                    <div class="agent-name">${agent.name}</div>
                    <div class="agent-type">${agent.type}</div>
                </div>
                <div class="agent-description">${agent.description || 'No description'}</div>
                <div class="agent-stats">
                    <div class="agent-stat">
                        <div class="agent-stat-value">${agent.workload}%</div>
                        <div class="agent-stat-label">Load</div>
                    </div>
                    <div class="agent-stat">
                        <div class="agent-stat-value">${agent.tasksCompleted}</div>
                        <div class="agent-stat-label">Tasks</div>
                    </div>
                    <div class="agent-stat">
                        <div class="agent-stat-value">${agent.efficiency}%</div>
                        <div class="agent-stat-label">Efficiency</div>
                    </div>
                </div>
            `;

            agentCard.onclick = () => this.showAgentDetails(agent.id);
            agentsGrid.appendChild(agentCard);
        });
    }

    showAgentDetails(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) return;

        const panel = document.getElementById('agentDetailsPanel');
        const title = document.getElementById('agentDetailsTitle');
        const content = document.getElementById('agentDetailsContent');

        title.textContent = agent.name;
        content.innerHTML = `
            <div class="agent-details">
                <div class="detail-section">
                    <h4>Basic Information</h4>
                    <p><strong>Type:</strong> ${agent.type}</p>
                    <p><strong>Status:</strong> ${agent.status}</p>
                    <p><strong>Last Active:</strong> ${new Date(agent.lastActive).toLocaleString()}</p>
                </div>
                <div class="detail-section">
                    <h4>Capabilities</h4>
                    <div class="capabilities-list">
                        ${agent.capabilities.map(capId => {
                            const cap = this.capabilities.find(c => c.id === capId);
                            return cap ? `<span class="capability-tag">${cap.name}</span>` : '';
                        }).join('')}
                    </div>
                </div>
                <div class="detail-section">
                    <h4>Performance Metrics</h4>
                    <p><strong>Tasks Completed:</strong> ${agent.tasksCompleted}</p>
                    <p><strong>Current Workload:</strong> ${agent.workload}%</p>
                    <p><strong>Efficiency:</strong> ${agent.efficiency}%</p>
                </div>
                <div class="detail-section">
                    <h4>Configuration</h4>
                    <pre>${JSON.stringify(agent.config, null, 2)}</pre>
                </div>
            </div>
        `;

        panel.classList.add('open');
    }

    closeAgentDetails() {
        document.getElementById('agentDetailsPanel').classList.remove('open');
    }

    // Workflow Management
    showWorkflowModal(workflowId = null) {
        const modal = document.getElementById('workflowModal');
        const title = document.getElementById('workflowModalTitle');

        if (workflowId) {
            const workflow = this.workflows.get(workflowId);
            if (workflow) {
                title.textContent = 'Edit Workflow';
                document.getElementById('workflowName').value = workflow.name;
                document.getElementById('workflowDescription').value = workflow.description;
                document.getElementById('workflowType').value = workflow.type;
                document.getElementById('workflowPriority').value = workflow.priority;
                document.getElementById('workflowTimeout').value = workflow.timeout || 60;
            }
        } else {
            title.textContent = 'Create Workflow';
            document.getElementById('workflowForm').reset();
        }

        modal.style.display = 'block';
    }

    saveWorkflowFromModal() {
        const name = document.getElementById('workflowName').value;
        const description = document.getElementById('workflowDescription').value;
        const type = document.getElementById('workflowType').value;
        const priority = document.getElementById('workflowPriority').value;
        const timeout = parseInt(document.getElementById('workflowTimeout').value);

        if (!name) {
            alert('Please enter a workflow name');
            return;
        }

        const workflowData = {
            name,
            description,
            type,
            priority,
            timeout,
            status: 'created',
            nodes: [],
            connections: [],
            created: new Date(),
            progress: 0
        };

        const existingWorkflowId = Array.from(this.workflows.values()).find(w => w.name === name)?.id;
        if (existingWorkflowId) {
            // Update existing workflow
            workflowData.id = existingWorkflowId;
            workflowData.nodes = this.workflows.get(existingWorkflowId).nodes;
            workflowData.connections = this.workflows.get(existingWorkflowId).connections;
            this.workflows.set(existingWorkflowId, workflowData);
            this.logSystemEvent('workflow', 'update', `Updated workflow: ${name}`);
        } else {
            // Create new workflow
            workflowData.id = 'workflow_' + Date.now();
            this.workflows.set(workflowData.id, workflowData);
            this.logSystemEvent('workflow', 'create', `Created workflow: ${name}`);
        }

        this.closeModal();
        this.updateUI();
        this.saveData();
    }

    displayWorkflows() {
        const workflowsList = document.getElementById('workflowsList');
        workflowsList.innerHTML = '';

        this.workflows.forEach(workflow => {
            const workflowItem = document.createElement('div');
            workflowItem.className = 'workflow-item';
            workflowItem.onclick = () => this.selectWorkflow(workflow.id);

            workflowItem.innerHTML = `
                <div class="workflow-name">${workflow.name}</div>
                <div class="workflow-meta">
                    Type: ${workflow.type} | Priority: ${workflow.priority} | Status: ${workflow.status}
                </div>
            `;

            workflowsList.appendChild(workflowItem);
        });
    }

    selectWorkflow(workflowId) {
        // Remove previous selection
        document.querySelectorAll('.workflow-item').forEach(item => item.classList.remove('active'));

        // Select current workflow
        const selectedItem = document.querySelector(`[onclick="orchestrator.selectWorkflow('${workflowId}')"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }

        // Load workflow in canvas
        this.loadWorkflowInCanvas(workflowId);
    }

    loadWorkflowInCanvas(workflowId) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) return;

        const canvas = document.getElementById('canvasContent');
        canvas.innerHTML = '';

        // Render workflow nodes
        workflow.nodes.forEach(node => {
            this.renderWorkflowNode(node, workflowId);
        });

        // Render connections
        workflow.connections.forEach(connection => {
            this.renderWorkflowConnection(connection);
        });
    }

    renderWorkflowNode(node, workflowId) {
        const canvas = document.getElementById('canvasContent');
        const nodeElement = document.createElement('div');
        nodeElement.className = `workflow-node ${node.type}`;
        nodeElement.style.left = `${100 + (node.id.charCodeAt(4) * 10) % 400}px`;
        nodeElement.style.top = `${100 + (node.id.charCodeAt(5) * 15) % 200}px`;

        nodeElement.innerHTML = `
            <div class="node-header">${node.name}</div>
            <div class="node-type">${node.type}</div>
        `;

        nodeElement.onclick = () => this.editWorkflowNode(node.id, workflowId);
        canvas.appendChild(nodeElement);
    }

    renderWorkflowConnection(connection) {
        // Simplified connection rendering
        const canvas = document.getElementById('canvasContent');
        const connectionElement = document.createElement('div');
        connectionElement.className = 'workflow-connection';
        connectionElement.style.left = '200px';
        connectionElement.style.top = '150px';
        connectionElement.style.width = '100px';
        connectionElement.style.transform = 'rotate(45deg)';
        canvas.appendChild(connectionElement);
    }

    addWorkflowNode(type) {
        const nodeId = 'node_' + Date.now();
        const node = {
            id: nodeId,
            type,
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${nodeId.split('_')[1]}`,
            agentId: type === 'agent' ? '' : null
        };

        // Add to current workflow (simplified - assumes first workflow)
        const workflowId = Array.from(this.workflows.keys())[0];
        if (workflowId) {
            const workflow = this.workflows.get(workflowId);
            workflow.nodes.push(node);
            this.loadWorkflowInCanvas(workflowId);
        }
    }

    clearWorkflowCanvas() {
        document.getElementById('canvasContent').innerHTML = '';
    }

    saveWorkflow() {
        // Save current workflow (simplified)
        this.saveData();
        alert('Workflow saved successfully');
    }

    // Task Management
    showTaskModal(taskId = null) {
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('taskModalTitle');

        if (taskId) {
            const task = this.tasks.get(taskId);
            if (task) {
                title.textContent = 'Edit Task';
                document.getElementById('taskName').value = task.name;
                document.getElementById('taskDescription').value = task.description;
                document.getElementById('taskType').value = task.type;
                document.getElementById('taskPriority').value = task.priority;
                document.getElementById('assignedAgent').value = task.assignedAgent || '';
                document.getElementById('taskParameters').value = JSON.stringify(task.parameters, null, 2);
                document.getElementById('taskDeadline').value = task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '';
            }
        } else {
            title.textContent = 'Create Task';
            document.getElementById('taskForm').reset();
            this.populateAgentDropdown();
        }

        modal.style.display = 'block';
    }

    populateAgentDropdown() {
        const agentSelect = document.getElementById('assignedAgent');
        agentSelect.innerHTML = '<option value="">Auto-assign</option>';

        this.agents.forEach((agent, agentId) => {
            const option = document.createElement('option');
            option.value = agentId;
            option.textContent = agent.name;
            agentSelect.appendChild(option);
        });
    }

    saveTask() {
        const name = document.getElementById('taskName').value;
        const description = document.getElementById('taskDescription').value;
        const type = document.getElementById('taskType').value;
        const priority = document.getElementById('taskPriority').value;
        const assignedAgent = document.getElementById('assignedAgent').value;
        const parametersText = document.getElementById('taskParameters').value;
        const deadline = document.getElementById('taskDeadline').value;

        if (!name) {
            alert('Please enter a task name');
            return;
        }

        let parameters = {};
        try {
            parameters = parametersText ? JSON.parse(parametersText) : {};
        } catch (e) {
            alert('Invalid JSON in parameters');
            return;
        }

        const taskData = {
            name,
            description,
            type,
            priority,
            assignedAgent: assignedAgent || null,
            parameters,
            status: 'pending',
            created: new Date(),
            progress: 0,
            dependencies: []
        };

        if (deadline) {
            taskData.deadline = new Date(deadline);
        }

        const existingTaskId = Array.from(this.tasks.values()).find(t => t.name === name)?.id;
        if (existingTaskId) {
            // Update existing task
            taskData.id = existingTaskId;
            this.tasks.set(existingTaskId, { ...this.tasks.get(existingTaskId), ...taskData });
            this.logSystemEvent('task', 'update', `Updated task: ${name}`);
        } else {
            // Create new task
            taskData.id = 'task_' + Date.now();
            this.tasks.set(taskData.id, taskData);
            this.logSystemEvent('task', 'create', `Created task: ${name}`);
        }

        this.closeModal();
        this.updateUI();
        this.saveData();
    }

    displayTasks() {
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = '';

        this.tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.onclick = () => this.showTaskDetails(task.id);

            const priorityClass = `task-priority ${task.priority}`;
            const statusClass = `task-status ${task.status}`;

            taskItem.innerHTML = `
                <div class="${priorityClass}"></div>
                <div class="task-content">
                    <div class="task-name">${task.name}</div>
                    <div class="task-meta">
                        Type: ${task.type} | Priority: ${task.priority} | Agent: ${task.assignedAgent ? this.agents.get(task.assignedAgent)?.name : 'Unassigned'}
                    </div>
                </div>
                <div class="${statusClass}">${task.status}</div>
            `;

            tasksList.appendChild(taskItem);
        });
    }

    showTaskDetails(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) return;

        const panel = document.getElementById('taskDetailsPanel');
        const title = document.getElementById('taskDetailsTitle');
        const content = document.getElementById('taskDetailsContent');

        title.textContent = task.name;
        content.innerHTML = `
            <div class="task-details">
                <div class="detail-section">
                    <h4>Basic Information</h4>
                    <p><strong>Description:</strong> ${task.description}</p>
                    <p><strong>Type:</strong> ${task.type}</p>
                    <p><strong>Priority:</strong> ${task.priority}</p>
                    <p><strong>Status:</strong> ${task.status}</p>
                </div>
                <div class="detail-section">
                    <h4>Assignment</h4>
                    <p><strong>Assigned Agent:</strong> ${task.assignedAgent ? this.agents.get(task.assignedAgent)?.name : 'Unassigned'}</p>
                    <p><strong>Created:</strong> ${new Date(task.created).toLocaleString()}</p>
                    <p><strong>Deadline:</strong> ${task.deadline ? new Date(task.deadline).toLocaleString() : 'No deadline'}</p>
                </div>
                <div class="detail-section">
                    <h4>Parameters</h4>
                    <pre>${JSON.stringify(task.parameters, null, 2)}</pre>
                </div>
                <div class="detail-section">
                    <h4>Progress</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${task.progress}%"></div>
                    </div>
                    <p>${task.progress}% complete</p>
                </div>
            </div>
        `;

        panel.classList.add('open');
    }

    closeTaskDetails() {
        document.getElementById('taskDetailsPanel').classList.remove('open');
    }

    // Communication
    displayMessages() {
        const messageLog = document.getElementById('messageLog');
        messageLog.innerHTML = '';

        this.messages.slice(-50).reverse().forEach(message => {
            const messageItem = document.createElement('div');
            messageItem.className = 'message-item';

            messageItem.innerHTML = `
                <div class="message-icon">
                    <i class="fas fa-${this.getMessageIcon(message.type)}"></i>
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <div class="message-sender">${message.sender}</div>
                        <div class="message-timestamp">${new Date(message.timestamp).toLocaleString()}</div>
                    </div>
                    <div class="message-text">${message.content}</div>
                </div>
            `;

            messageLog.appendChild(messageItem);
        });
    }

    // Utility Methods
    navigateToSection(section) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));

        // Add active class to selected nav link and section
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        document.getElementById(`${section}Section`).classList.add('active');
    }

    filterAgents() {
        const searchTerm = document.getElementById('agentSearch').value.toLowerCase();
        const typeFilter = document.getElementById('agentTypeFilter').value;
        const statusFilter = document.getElementById('agentStatusFilter').value;

        // Implementation for filtering agents
        this.displayAgents();
    }

    filterWorkflows() {
        const searchTerm = document.getElementById('workflowSearch').value.toLowerCase();
        const statusFilter = document.getElementById('workflowStatusFilter').value;

        // Implementation for filtering workflows
        this.displayWorkflows();
    }

    filterTasks() {
        const searchTerm = document.getElementById('taskSearch').value.toLowerCase();
        const statusFilter = document.getElementById('taskStatusFilter').value;
        const priorityFilter = document.getElementById('taskPriorityFilter').value;

        // Implementation for filtering tasks
        this.displayTasks();
    }

    filterMessages() {
        const typeFilter = document.getElementById('messageTypeFilter').value;

        // Implementation for filtering messages
        this.displayMessages();
    }

    showLogin() {
        const username = prompt('Enter username:');
        if (username) {
            this.currentUser = username;
            this.logSystemEvent('authentication', 'login', `User logged in: ${username}`);
            this.updateUI();
            this.saveData();
            alert(`Welcome, ${username}!`);
        }
    }

    deploySystem() {
        alert('System deployment initiated. This would deploy all agents and workflows to production.');
        this.logSystemEvent('system', 'deploy', 'System deployment initiated');
    }

    logSystemEvent(component, event, details) {
        const message = {
            id: 'msg_' + Date.now(),
            timestamp: new Date().toISOString(),
            sender: component,
            type: event,
            content: details
        };

        this.messages.push(message);

        // Keep only last 1000 messages
        if (this.messages.length > 1000) {
            this.messages = this.messages.slice(-1000);
        }

        // Update UI if communication section is active
        if (document.getElementById('communicationSection').classList.contains('active')) {
            this.displayMessages();
        }
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    }

    startPeriodicUpdates() {
        // Update UI every 5 seconds
        setInterval(() => {
            this.updateUI();
        }, 5000);

        // Save data every 30 seconds
        setInterval(() => {
            this.saveData();
        }, 30000);
    }

    // Placeholder methods for additional features
    importWorkflow() {
        alert('Workflow import feature - Coming soon!');
    }

    exportWorkflows() {
        alert('Workflow export feature - Coming soon!');
    }

    showBulkTaskActions() {
        alert('Bulk task actions feature - Coming soon!');
    }

    clearMessages() {
        this.messages = [];
        this.displayMessages();
        this.logSystemEvent('system', 'clear_messages', 'Message log cleared');
    }

    exportMessages() {
        const data = JSON.stringify(this.messages, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `messages-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    refreshMonitoring() {
        this.updateMonitoringCharts();
    }

    generateAnalyticsReport() {
        alert('Analytics report generation - Coming soon!');
    }

    exportAnalytics() {
        alert('Analytics export feature - Coming soon!');
    }

    saveSettings() {
        // Save settings implementation
        this.settings.maxAgents = parseInt(document.getElementById('maxAgents').value);
        this.settings.maxWorkflows = parseInt(document.getElementById('maxWorkflows').value);
        this.settings.maxTasks = parseInt(document.getElementById('maxTasks').value);
        this.settings.taskTimeout = parseInt(document.getElementById('taskTimeout').value);
        this.settings.messageQueueSize = parseInt(document.getElementById('messageQueueSize').value);
        this.settings.communicationProtocol = document.getElementById('communicationProtocol').value;
        this.settings.enableEncryption = document.getElementById('enableEncryption').checked;
        this.settings.monitoringInterval = parseInt(document.getElementById('monitoringInterval').value);
        this.settings.alertThreshold = parseInt(document.getElementById('alertThreshold').value);
        this.settings.enableDetailedLogging = document.getElementById('enableDetailedLogging').checked;
        this.settings.loadBalancingStrategy = document.getElementById('loadBalancingStrategy').value;
        this.settings.faultToleranceLevel = document.getElementById('faultToleranceLevel').value;
        this.settings.enableAutoScaling = document.getElementById('enableAutoScaling').checked;

        localStorage.setItem('orchestrationSettings', JSON.stringify(this.settings));
        this.closeModal();
        this.logSystemEvent('settings', 'update', 'System settings updated');
    }

    resetSettings() {
        localStorage.removeItem('orchestrationSettings');
        this.settings = this.loadSettings();
        this.applySettingsToUI();
        this.closeModal();
        this.logSystemEvent('settings', 'reset', 'Settings reset to defaults');
    }

    applySettingsToUI() {
        document.getElementById('maxAgents').value = this.settings.maxAgents;
        document.getElementById('maxWorkflows').value = this.settings.maxWorkflows;
        document.getElementById('maxTasks').value = this.settings.maxTasks;
        document.getElementById('taskTimeout').value = this.settings.taskTimeout;
        document.getElementById('messageQueueSize').value = this.settings.messageQueueSize;
        document.getElementById('communicationProtocol').value = this.settings.communicationProtocol;
        document.getElementById('enableEncryption').checked = this.settings.enableEncryption;
        document.getElementById('monitoringInterval').value = this.settings.monitoringInterval;
        document.getElementById('alertThreshold').value = this.settings.alertThreshold;
        document.getElementById('enableDetailedLogging').checked = this.settings.enableDetailedLogging;
        document.getElementById('loadBalancingStrategy').value = this.settings.loadBalancingStrategy;
        document.getElementById('faultToleranceLevel').value = this.settings.faultToleranceLevel;
        document.getElementById('enableAutoScaling').checked = this.settings.enableAutoScaling;
    }

    exportSettings() {
        const data = JSON.stringify(this.settings, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orchestration-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importSettings() {
        document.getElementById('fileInput').click();
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (confirm('This will replace current settings. Continue?')) {
                    this.settings = { ...this.settings, ...data };
                    this.applySettingsToUI();
                    this.saveSettings();
                    alert('Settings imported successfully');
                    this.logSystemEvent('settings', 'import', 'Settings imported from file');
                }
            } catch (error) {
                alert('Error importing settings: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    // Advanced Orchestration Algorithms
    distributeTaskLoad() {
        // Implement load balancing algorithm
        const availableAgents = Array.from(this.agents.values()).filter(a => a.status === 'active');
        const pendingTasks = Array.from(this.tasks.values()).filter(t => t.status === 'pending');

        pendingTasks.forEach(task => {
            const suitableAgents = availableAgents.filter(agent =>
                agent.capabilities.includes(task.type) &&
                agent.workload < 80
            );

            if (suitableAgents.length > 0) {
                // Use load balancing strategy
                let selectedAgent;
                switch (this.settings.loadBalancingStrategy) {
                    case 'least-loaded':
                        selectedAgent = suitableAgents.reduce((min, agent) =>
                            agent.workload < min.workload ? agent : min
                        );
                        break;
                    case 'weighted':
                        selectedAgent = suitableAgents.reduce((best, agent) =>
                            (agent.efficiency / (agent.workload + 1)) > (best.efficiency / (best.workload + 1)) ? agent : best
                        );
                        break;
                    case 'random':
                        selectedAgent = suitableAgents[Math.floor(Math.random() * suitableAgents.length)];
                        break;
                    default: // round-robin
                        selectedAgent = suitableAgents[0];
                }

                task.assignedAgent = selectedAgent.id;
                task.status = 'assigned';
                selectedAgent.workload += 10; // Simulate workload increase
            }
        });
    }

    handleFaultTolerance() {
        // Implement fault tolerance mechanisms
        this.agents.forEach((agent, agentId) => {
            const timeSinceActive = Date.now() - new Date(agent.lastActive).getTime();

            if (timeSinceActive > 300000) { // 5 minutes
                agent.status = 'error';

                // Find replacement agent for failed agent's tasks
                const failedTasks = Array.from(this.tasks.values()).filter(t =>
                    t.assignedAgent === agentId && t.status === 'running'
                );

                failedTasks.forEach(task => {
                    const replacementAgent = this.findReplacementAgent(agent, task);
                    if (replacementAgent) {
                        task.assignedAgent = replacementAgent.id;
                        task.status = 'reassigned';
                        this.logSystemEvent('fault_tolerance', 'reassign', `Task ${task.name} reassigned from ${agent.name} to ${replacementAgent.name}`);
                    } else {
                        task.status = 'failed';
                        this.logSystemEvent('fault_tolerance', 'fail', `Task ${task.name} failed - no replacement agent available`);
                    }
                });
            }
        });
    }

    findReplacementAgent(failedAgent, task) {
        return Array.from(this.agents.values()).find(agent =>
            agent.id !== failedAgent.id &&
            agent.status === 'active' &&
            agent.capabilities.includes(task.type) &&
            agent.workload < 90
        );
    }

    optimizeResourceAllocation() {
        // Implement resource optimization algorithms
        const agents = Array.from(this.agents.values());

        // Calculate optimal workload distribution
        const totalCapacity = agents.reduce((sum, agent) => sum + (100 - agent.workload), 0);
        const totalDemand = Array.from(this.tasks.values())
            .filter(t => t.status === 'pending')
            .reduce((sum, task) => sum + this.getTaskComplexity(task), 0);

        if (totalDemand > totalCapacity) {
            // Scale up if auto-scaling is enabled
            if (this.settings.enableAutoScaling) {
                this.scaleUpAgents(Math.ceil((totalDemand - totalCapacity) / 50));
            }
        }

        // Rebalance workloads
        this.rebalanceWorkloads();
    }

    getTaskComplexity(task) {
        const complexityMap = {
            'computation': 20,
            'data_processing': 15,
            'machine_learning': 30,
            'communication': 10,
            'monitoring': 5,
            'coordination': 25
        };
        return complexityMap[task.type] || 10;
    }

    scaleUpAgents(count) {
        for (let i = 0; i < count; i++) {
            const agentId = 'agent_' + Date.now() + '_' + i;
            const agent = {
                id: agentId,
                name: `Scaled Agent ${i + 1}`,
                type: 'worker',
                capabilities: ['computation', 'data_processing'],
                status: 'active',
                workload: 0,
                tasksCompleted: 0,
                efficiency: 85,
                lastActive: new Date(),
                config: { maxConcurrency: 3, priority: 'medium' }
            };

            this.agents.set(agentId, agent);
            this.logSystemEvent('auto_scaling', 'scale_up', `Scaled up agent: ${agent.name}`);
        }
    }

    rebalanceWorkloads() {
        const agents = Array.from(this.agents.values()).filter(a => a.status === 'active');
        const avgWorkload = agents.reduce((sum, agent) => sum + agent.workload, 0) / agents.length;

        agents.forEach(agent => {
            if (agent.workload > avgWorkload + 20) {
                // Agent is overloaded, try to redistribute tasks
                const tasks = Array.from(this.tasks.values()).filter(t =>
                    t.assignedAgent === agent.id && t.status === 'running'
                );

                tasks.slice(0, Math.floor(tasks.length / 2)).forEach(task => {
                    const targetAgent = agents.find(a =>
                        a.id !== agent.id && a.workload < avgWorkload - 10
                    );

                    if (targetAgent) {
                        task.assignedAgent = targetAgent.id;
                        agent.workload -= 10;
                        targetAgent.workload += 10;
                        this.logSystemEvent('load_balancing', 'rebalance', `Task ${task.name} moved from ${agent.name} to ${targetAgent.name}`);
                    }
                });
            }
        });
    }
}

// Core System Components
class CommunicationHub {
    constructor() {
        this.connections = new Map();
        this.messageQueue = [];
        this.isRunning = false;
    }

    start() {
        this.isRunning = true;
        console.log('Communication Hub started');
    }

    stop() {
        this.isRunning = false;
        console.log('Communication Hub stopped');
    }

    sendMessage(sender, receiver, type, content) {
        const message = {
            id: 'msg_' + Date.now(),
            sender,
            receiver,
            type,
            content,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };

        this.messageQueue.push(message);
        return message;
    }

    broadcastMessage(sender, type, content) {
        const message = {
            id: 'msg_' + Date.now(),
            sender,
            type,
            content,
            timestamp: new Date().toISOString(),
            status: 'broadcast'
        };

        this.messageQueue.push(message);
        return message;
    }
}

class WorkflowEngine {
    constructor() {
        this.activeWorkflows = new Map();
        this.workflowQueue = [];
        this.isRunning = false;
    }

    start() {
        this.isRunning = true;
        console.log('Workflow Engine started');
    }

    stop() {
        this.isRunning = false;
        console.log('Workflow Engine stopped');
    }

    executeWorkflow(workflow) {
        if (!this.isRunning) return;

        workflow.status = 'running';
        workflow.started = new Date();
        this.activeWorkflows.set(workflow.id, workflow);

        // Execute workflow logic here
        this.processWorkflowNodes(workflow);
    }

    processWorkflowNodes(workflow) {
        // Simplified workflow execution
        workflow.nodes.forEach(node => {
            if (node.type === 'task') {
                // Execute task
                setTimeout(() => {
                    node.status = 'completed';
                    workflow.progress = Math.min(100, workflow.progress + (100 / workflow.nodes.length));
                }, Math.random() * 5000);
            }
        });
    }
}

class TaskScheduler {
    constructor() {
        this.taskQueue = [];
        this.isRunning = false;
    }

    start() {
        this.isRunning = true;
        console.log('Task Scheduler started');
    }

    stop() {
        this.isRunning = false;
        console.log('Task Scheduler stopped');
    }

    scheduleTask(task) {
        if (!this.isRunning) return;

        this.taskQueue.push(task);
        task.status = 'scheduled';

        // Process task queue
        this.processTaskQueue();
    }

    processTaskQueue() {
        if (this.taskQueue.length === 0) return;

        const task = this.taskQueue.shift();
        task.status = 'running';
        task.started = new Date();

        // Simulate task execution
        setTimeout(() => {
            task.status = 'completed';
            task.progress = 100;
            task.completed = new Date();
        }, Math.random() * 10000 + 2000);
    }
}

class MonitoringSystem {
    constructor() {
        this.metrics = new Map();
        this.alerts = [];
        this.isRunning = false;
    }

    start() {
        this.isRunning = true;
        console.log('Monitoring System started');
    }

    stop() {
        this.isRunning = false;
        console.log('Monitoring System stopped');
    }

    recordMetric(name, value, timestamp = new Date()) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }

        const metricData = this.metrics.get(name);
        metricData.push({ value, timestamp });

        // Keep only last 1000 data points
        if (metricData.length > 1000) {
            metricData.shift();
        }
    }

    checkThresholds() {
        // Implement threshold checking logic
        this.metrics.forEach((data, metricName) => {
            if (data.length > 0) {
                const latestValue = data[data.length - 1].value;
                const threshold = this.getThresholdForMetric(metricName);

                if (latestValue > threshold) {
                    this.createAlert(metricName, latestValue, threshold);
                }
            }
        });
    }

    getThresholdForMetric(metricName) {
        const thresholds = {
            'cpu_usage': 80,
            'memory_usage': 85,
            'error_rate': 5,
            'response_time': 2000
        };
        return thresholds[metricName] || 100;
    }

    createAlert(metric, value, threshold) {
        const alert = {
            id: 'alert_' + Date.now(),
            type: 'threshold',
            metric,
            value,
            threshold,
            timestamp: new Date().toISOString(),
            status: 'active'
        };

        this.alerts.push(alert);
    }
}

class AnalyticsEngine {
    constructor() {
        this.analytics = new Map();
        this.isRunning = false;
    }

    start() {
        this.isRunning = true;
        console.log('Analytics Engine started');
    }

    stop() {
        this.isRunning = false;
        console.log('Analytics Engine stopped');
    }

    analyzePerformance(data) {
        // Implement performance analysis algorithms
        const analysis = {
            averageResponseTime: this.calculateAverage(data.responseTimes),
            throughput: data.requestsPerMinute,
            errorRate: (data.errors / data.totalRequests) * 100,
            efficiency: this.calculateEfficiency(data),
            trends: this.analyzeTrends(data)
        };

        return analysis;
    }

    calculateAverage(values) {
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    calculateEfficiency(data) {
        // Complex efficiency calculation
        const utilization = data.cpuUsage * 0.3 + data.memoryUsage * 0.3 + data.networkUsage * 0.4;
        const performance = 100 - data.errorRate;
        return (utilization + performance) / 2;
    }

    analyzeTrends(data) {
        // Implement trend analysis
        return {
            direction: 'improving',
            confidence: 0.85,
            prediction: 'continued improvement expected'
        };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.orchestrator = new MultiAgentOrchestrationFramework();
});