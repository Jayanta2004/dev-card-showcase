/**
 * Autonomous Workflow Bottleneck Detector
 * AI-powered system for identifying performance bottlenecks in automated workflows
 */

class WorkflowBottleneckDetector {
    constructor() {
        this.workflows = new Map();
        this.bottlenecks = new Map();
        this.alerts = [];
        this.metrics = {
            activeWorkflows: 0,
            currentBottlenecks: 0,
            avgResponseTime: 0,
            throughput: 0,
            totalAlerts: 0
        };

        this.ai = {
            anomalyDetector: new AnomalyDetector(),
            patternAnalyzer: new PatternAnalyzer(),
            predictiveModel: new PredictiveModel()
        };

        this.charts = {};
        this.intervals = {};
        this.currentTab = 'dashboard';

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCharts();
        this.startMonitoring();
        this.loadMockData();
        this.updateTimeDisplay();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Dashboard controls
        document.getElementById('timeRangeSelect').addEventListener('change', () => {
            this.updateDashboardCharts();
        });

        document.getElementById('refreshBottlenecks').addEventListener('click', () => {
            this.refreshBottlenecks();
        });

        // Workflow management
        document.getElementById('addWorkflowButton').addEventListener('click', () => {
            this.showWorkflowModal();
        });

        document.getElementById('createFirstWorkflow').addEventListener('click', () => {
            this.showWorkflowModal();
        });

        document.getElementById('saveWorkflow').addEventListener('click', () => {
            this.saveWorkflow();
        });

        document.getElementById('cancelWorkflow').addEventListener('click', () => {
            this.hideWorkflowModal();
        });

        document.getElementById('closeWorkflowModal').addEventListener('click', () => {
            this.hideWorkflowModal();
        });

        // Bottlenecks controls
        document.getElementById('exportBottlenecks').addEventListener('click', () => {
            this.exportBottlenecks();
        });

        // Analytics controls
        document.getElementById('analyticsTimeRange').addEventListener('change', () => {
            this.updateAnalytics();
        });

        document.getElementById('analyticsMetric').addEventListener('change', () => {
            this.updateAnalytics();
        });

        document.getElementById('refreshInsights').addEventListener('click', () => {
            this.generateInsights();
        });

        // Alerts controls
        document.getElementById('clearAllAlerts').addEventListener('click', () => {
            this.clearAllAlerts();
        });

        // Modal close on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        // Search and filters
        document.getElementById('workflowSearch').addEventListener('input', () => {
            this.filterWorkflows();
        });

        document.getElementById('workflowStatusFilter').addEventListener('change', () => {
            this.filterWorkflows();
        });

        document.getElementById('bottleneckSeverityFilter').addEventListener('change', () => {
            this.filterBottlenecks();
        });

        document.getElementById('bottleneckTypeFilter').addEventListener('change', () => {
            this.filterBottlenecks();
        });

        document.getElementById('alertsFilter').addEventListener('change', () => {
            this.filterAlerts();
        });

        document.getElementById('alertsTimeFilter').addEventListener('change', () => {
            this.filterAlerts();
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

        // Update specific tab content
        switch (tabName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'workflows':
                this.updateWorkflowsView();
                break;
            case 'bottlenecks':
                this.updateBottlenecksView();
                break;
            case 'analytics':
                this.updateAnalytics();
                break;
            case 'alerts':
                this.updateAlertsView();
                break;
        }
    }

    initializeCharts() {
        // Performance Chart
        const performanceCtx = document.getElementById('performanceChart').getContext('2d');
        this.charts.performance = new Chart(performanceCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Response Time (ms)',
                    data: [],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Throughput (req/sec)',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Response Time (ms)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Throughput (req/sec)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });

        // Bottleneck Chart
        const bottleneckCtx = document.getElementById('bottleneckChart').getContext('2d');
        this.charts.bottleneck = new Chart(bottleneckCtx, {
            type: 'doughnut',
            data: {
                labels: ['Critical', 'High', 'Medium', 'Low'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        '#dc2626',
                        '#ef4444',
                        '#f59e0b',
                        '#10b981'
                    ],
                    borderWidth: 2,
                    borderColor: '#1e293b'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });

        // Analytics Chart
        const analyticsCtx = document.getElementById('analyticsChart').getContext('2d');
        this.charts.analytics = new Chart(analyticsCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Performance Metric',
                    data: [],
                    backgroundColor: '#f59e0b',
                    borderColor: '#d97706',
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
        });

        // Bottleneck Detail Chart
        const detailCtx = document.getElementById('bottleneckDetailChart').getContext('2d');
        this.charts.bottleneckDetail = new Chart(detailCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Latency Trend',
                    data: [],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Latency (ms)'
                        }
                    }
                }
            }
        });
    }

    startMonitoring() {
        // Update dashboard every 5 seconds
        this.intervals.dashboard = setInterval(() => {
            this.updateDashboard();
        }, 5000);

        // Update time display every second
        this.intervals.time = setInterval(() => {
            this.updateTimeDisplay();
        }, 1000);

        // Simulate real-time data updates
        this.intervals.realtime = setInterval(() => {
            this.simulateRealtimeData();
        }, 2000);
    }

    updateTimeDisplay() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('currentTime').textContent = timeString;
    }

    loadMockData() {
        // Create sample workflows
        const sampleWorkflows = [
            {
                id: 'wf-001',
                name: 'User Authentication Flow',
                description: 'Handles user login and session management',
                type: 'api_integration',
                status: 'active',
                stages: ['validation', 'authentication', 'session_creation'],
                expectedLatency: 500,
                monitoringEnabled: true,
                created: new Date(Date.now() - 86400000)
            },
            {
                id: 'wf-002',
                name: 'Data Processing Pipeline',
                description: 'Processes incoming data streams and stores results',
                type: 'data_processing',
                status: 'active',
                stages: ['ingestion', 'processing', 'storage', 'indexing'],
                expectedLatency: 2000,
                monitoringEnabled: true,
                created: new Date(Date.now() - 43200000)
            },
            {
                id: 'wf-003',
                name: 'Order Fulfillment System',
                description: 'Manages order processing from placement to delivery',
                type: 'batch_processing',
                status: 'active',
                stages: ['order_validation', 'payment_processing', 'inventory_check', 'shipping'],
                expectedLatency: 1500,
                monitoringEnabled: true,
                created: new Date(Date.now() - 21600000)
            }
        ];

        sampleWorkflows.forEach(workflow => {
            this.workflows.set(workflow.id, workflow);
        });

        // Generate initial metrics
        this.generateMockMetrics();
        this.detectBottlenecks();
        this.updateDashboard();
    }

    generateMockMetrics() {
        // Generate realistic performance data
        const timeRange = document.getElementById('timeRangeSelect').value;
        const hours = this.getHoursFromRange(timeRange);
        const dataPoints = hours * 12; // 5-minute intervals

        const labels = [];
        const responseTimes = [];
        const throughputs = [];

        for (let i = dataPoints; i >= 0; i--) {
            const timestamp = new Date(Date.now() - (i * 5 * 60 * 1000));
            labels.push(timestamp.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            }));

            // Generate realistic response times with some variation
            const baseLatency = 800 + Math.random() * 400;
            const anomaly = Math.random() < 0.1 ? 2000 + Math.random() * 1000 : 0;
            responseTimes.push(Math.round(baseLatency + anomaly));

            // Generate throughput data
            throughputs.push(Math.round(50 + Math.random() * 30));
        }

        this.charts.performance.data.labels = labels;
        this.charts.performance.data.datasets[0].data = responseTimes;
        this.charts.performance.data.datasets[1].data = throughputs;
        this.charts.performance.update();

        // Update metrics
        this.metrics.activeWorkflows = this.workflows.size;
        this.metrics.avgResponseTime = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
        this.metrics.throughput = Math.round(throughputs[throughputs.length - 1]);
    }

    detectBottlenecks() {
        this.bottlenecks.clear();

        this.workflows.forEach(workflow => {
            if (!workflow.monitoringEnabled) return;

            // Simulate stage-level monitoring
            workflow.stages.forEach((stage, index) => {
                const stageLatency = workflow.expectedLatency * (0.5 + Math.random() * 1.5);
                const deviation = ((stageLatency - workflow.expectedLatency) / workflow.expectedLatency) * 100;

                if (deviation > 50) { // Significant bottleneck threshold
                    const bottleneck = {
                        id: `${workflow.id}-${stage}`,
                        workflowId: workflow.id,
                        workflowName: workflow.name,
                        stage: stage,
                        type: this.getBottleneckType(deviation),
                        severity: this.getSeverity(deviation),
                        currentLatency: Math.round(stageLatency),
                        expectedLatency: workflow.expectedLatency,
                        deviation: Math.round(deviation),
                        impact: this.calculateImpact(deviation),
                        duration: Math.round(Math.random() * 3600000), // Up to 1 hour
                        detected: new Date(),
                        status: 'active'
                    };

                    this.bottlenecks.set(bottleneck.id, bottleneck);
                }
            });
        });

        this.metrics.currentBottlenecks = this.bottlenecks.size;
        this.updateBottleneckChart();
    }

    getBottleneckType(deviation) {
        if (deviation > 200) return 'latency';
        if (deviation > 150) return 'throughput';
        if (deviation > 100) return 'error_rate';
        return 'resource';
    }

    getSeverity(deviation) {
        if (deviation > 200) return 'critical';
        if (deviation > 150) return 'high';
        if (deviation > 100) return 'medium';
        return 'low';
    }

    calculateImpact(deviation) {
        if (deviation > 200) return 'High - System performance severely impacted';
        if (deviation > 150) return 'Medium - Performance degradation noticeable';
        if (deviation > 100) return 'Low - Minor performance impact';
        return 'Minimal - Within acceptable range';
    }

    updateDashboard() {
        // Update metrics
        document.getElementById('activeWorkflows').textContent = this.metrics.activeWorkflows;
        document.getElementById('currentBottlenecks').textContent = this.metrics.currentBottlenecks;
        document.getElementById('avgResponseTime').textContent = `${this.metrics.avgResponseTime}ms`;
        document.getElementById('throughput').textContent = `${this.metrics.throughput}/sec`;

        // Update trends (mock data)
        this.updateTrends();

        // Update top bottlenecks
        this.updateTopBottlenecks();

        // Update recent alerts
        this.updateRecentAlerts();
    }

    updateTrends() {
        const elements = ['activeWorkflowsTrend', 'bottlenecksTrend', 'responseTimeTrend', 'throughputTrend'];
        elements.forEach(elementId => {
            const element = document.getElementById(elementId);
            const trend = document.querySelector(`#${elementId} .trend-value`);
            const change = (Math.random() - 0.5) * 20; // -10% to +10%

            trend.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
            trend.className = `trend-value ${change >= 0 ? 'positive' : 'negative'}`;
        });
    }

    updateTopBottlenecks() {
        const container = document.getElementById('topBottlenecks');
        container.innerHTML = '';

        if (this.bottlenecks.size === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <p>No bottlenecks detected</p>
                    <small>Monitoring active workflows...</small>
                </div>
            `;
            return;
        }

        const topBottlenecks = Array.from(this.bottlenecks.values())
            .sort((a, b) => b.deviation - a.deviation)
            .slice(0, 5);

        topBottlenecks.forEach(bottleneck => {
            const item = document.createElement('div');
            item.className = 'bottleneck-item';
            item.innerHTML = `
                <div class="bottleneck-info">
                    <div class="bottleneck-title">${bottleneck.workflowName} - ${bottleneck.stage}</div>
                    <div class="bottleneck-details">
                        <span class="severity-badge severity-${bottleneck.severity}">${bottleneck.severity}</span>
                        <span>${bottleneck.currentLatency}ms (${bottleneck.deviation > 0 ? '+' : ''}${bottleneck.deviation}%)</span>
                    </div>
                </div>
                <div class="bottleneck-actions">
                    <button class="secondary-button" onclick="detector.showBottleneckDetails('${bottleneck.id}')">Analyze</button>
                </div>
            `;
            container.appendChild(item);
        });
    }

    updateRecentAlerts() {
        const container = document.getElementById('recentAlerts');
        container.innerHTML = '';

        if (this.alerts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔔</div>
                    <p>No recent alerts</p>
                    <small>All systems operating normally</small>
                </div>
            `;
            return;
        }

        const recentAlerts = this.alerts.slice(-5).reverse();
        recentAlerts.forEach(alert => {
            const item = document.createElement('div');
            item.className = 'alert-item';
            item.innerHTML = `
                <div class="alert-icon">${this.getAlertIcon(alert.severity)}</div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-time">${this.formatTimeAgo(alert.timestamp)}</div>
                </div>
            `;
            container.appendChild(item);
        });
    }

    getAlertIcon(severity) {
        switch (severity) {
            case 'critical': return '🚨';
            case 'high': return '⚠️';
            case 'medium': return 'ℹ️';
            default: return '📢';
        }
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return timestamp.toLocaleDateString();
    }

    updateBottleneckChart() {
        const severityCounts = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
        };

        this.bottlenecks.forEach(bottleneck => {
            severityCounts[bottleneck.severity]++;
        });

        this.charts.bottleneck.data.datasets[0].data = [
            severityCounts.critical,
            severityCounts.high,
            severityCounts.medium,
            severityCounts.low
        ];
        this.charts.bottleneck.update();
    }

    updateDashboardCharts() {
        this.generateMockMetrics();
    }

    updateWorkflowsView() {
        const container = document.getElementById('workflowsGrid');
        container.innerHTML = '';

        if (this.workflows.size === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔄</div>
                    <p>No workflows configured</p>
                    <button class="primary-button" id="createFirstWorkflow">Create First Workflow</button>
                </div>
            `;
            return;
        }

        this.workflows.forEach(workflow => {
            const card = document.createElement('div');
            card.className = 'workflow-card';
            card.innerHTML = `
                <div class="workflow-header">
                    <h3>${workflow.name}</h3>
                    <span class="status-badge ${workflow.status}">${workflow.status}</span>
                </div>
                <div class="workflow-content">
                    <p>${workflow.description}</p>
                    <div class="workflow-metrics">
                        <div class="metric">
                            <span class="label">Stages:</span>
                            <span class="value">${workflow.stages.length}</span>
                        </div>
                        <div class="metric">
                            <span class="label">Expected:</span>
                            <span class="value">${workflow.expectedLatency}ms</span>
                        </div>
                    </div>
                </div>
                <div class="workflow-actions">
                    <button class="secondary-button" onclick="detector.viewWorkflow('${workflow.id}')">View</button>
                    <button class="secondary-button" onclick="detector.editWorkflow('${workflow.id}')">Edit</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    updateBottlenecksView() {
        const tbody = document.getElementById('bottlenecksTableBody');
        tbody.innerHTML = '';

        if (this.bottlenecks.size === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-row">
                        <div class="empty-state">
                            <div class="empty-icon">🔍</div>
                            <p>No bottlenecks detected</p>
                            <small>System is performing optimally</small>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        this.bottlenecks.forEach(bottleneck => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${bottleneck.workflowName}</td>
                <td>${bottleneck.stage}</td>
                <td><span class="status-badge ${bottleneck.type}">${bottleneck.type}</span></td>
                <td><span class="severity-badge severity-${bottleneck.severity}">${bottleneck.severity}</span></td>
                <td>${bottleneck.impact}</td>
                <td>${this.formatDuration(bottleneck.duration)}</td>
                <td>
                    <button class="secondary-button" onclick="detector.showBottleneckDetails('${bottleneck.id}')">Analyze</button>
                    <button class="secondary-button" onclick="detector.resolveBottleneck('${bottleneck.id}')">Resolve</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    updateAnalytics() {
        // Update analytics chart with mock data
        const timeRange = document.getElementById('analyticsTimeRange').value;
        const metric = document.getElementById('analyticsMetric').value;

        const dataPoints = this.getHoursFromRange(timeRange) * 12;
        const labels = [];
        const data = [];

        for (let i = dataPoints; i >= 0; i--) {
            const timestamp = new Date(Date.now() - (i * 5 * 60 * 1000));
            labels.push(timestamp.toLocaleDateString());

            let value;
            switch (metric) {
                case 'latency':
                    value = 800 + Math.random() * 400;
                    break;
                case 'throughput':
                    value = 50 + Math.random() * 30;
                    break;
                case 'error_rate':
                    value = Math.random() * 5;
                    break;
                case 'resource_usage':
                    value = 60 + Math.random() * 30;
                    break;
            }
            data.push(Math.round(value));
        }

        this.charts.analytics.data.labels = labels;
        this.charts.analytics.data.datasets[0].data = data;
        this.charts.analytics.data.datasets[0].label = metric.replace('_', ' ').toUpperCase();
        this.charts.analytics.update();

        // Update metrics
        this.updateAnalyticsMetrics();
        this.generateInsights();
    }

    updateAnalyticsMetrics() {
        document.getElementById('peakPerformance').textContent = `${Math.round(85 + Math.random() * 10)}%`;
        document.getElementById('efficiencyScore').textContent = `${Math.round(75 + Math.random() * 15)}%`;
        document.getElementById('bottleneckFrequency').textContent = Math.round(Math.random() * 10);
        document.getElementById('recoveryTime').textContent = `${Math.round(100 + Math.random() * 200)}ms`;
    }

    generateInsights() {
        const insights = [
            {
                icon: '🧠',
                title: 'AI Pattern Recognition Active',
                content: 'Machine learning models are analyzing workflow patterns to predict potential bottlenecks before they occur.'
            },
            {
                icon: '📈',
                title: 'Performance Optimization Identified',
                content: 'Analysis shows 15% improvement potential in data processing pipeline through resource reallocation.'
            },
            {
                icon: '⚡',
                title: 'Real-time Monitoring Enhanced',
                content: 'Automated threshold adjustments have reduced false positive alerts by 40%.'
            },
            {
                icon: '🔄',
                title: 'Workflow Efficiency Improved',
                content: 'Parallel processing optimization could reduce total execution time by 25%.'
            }
        ];

        const container = document.getElementById('insightsList');
        container.innerHTML = '';

        insights.forEach(insight => {
            const item = document.createElement('div');
            item.className = 'insight-item';
            item.innerHTML = `
                <div class="insight-icon">${insight.icon}</div>
                <div class="insight-content">
                    <h4>${insight.title}</h4>
                    <p>${insight.content}</p>
                </div>
            `;
            container.appendChild(item);
        });
    }

    updateAlertsView() {
        const container = document.getElementById('alertsTimeline');
        container.innerHTML = '';

        if (this.alerts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔔</div>
                    <p>No alerts in selected time range</p>
                    <small>All systems operating normally</small>
                </div>
            `;
            return;
        }

        this.alerts.forEach(alert => {
            const item = document.createElement('div');
            item.className = `alert-timeline-item ${alert.severity}`;
            item.innerHTML = `
                <div class="alert-header">
                    <div class="alert-icon">${this.getAlertIcon(alert.severity)}</div>
                    <div class="alert-meta">
                        <span class="alert-severity">${alert.severity.toUpperCase()}</span>
                        <span class="alert-time">${this.formatTimeAgo(alert.timestamp)}</span>
                    </div>
                </div>
                <div class="alert-content">
                    <h4>${alert.title}</h4>
                    <p>${alert.message}</p>
                    <div class="alert-details">
                        <span>Workflow: ${alert.workflowName}</span>
                        <span>Stage: ${alert.stage}</span>
                    </div>
                </div>
            `;
            container.appendChild(item);
        });
    }

    simulateRealtimeData() {
        // Simulate occasional bottleneck detection
        if (Math.random() < 0.1) { // 10% chance every 2 seconds
            this.detectBottlenecks();
        }

        // Simulate occasional alerts
        if (Math.random() < 0.05) { // 5% chance
            this.generateAlert();
        }
    }

    generateAlert() {
        const severities = ['low', 'medium', 'high', 'critical'];
        const severity = severities[Math.floor(Math.random() * severities.length)];
        const workflows = Array.from(this.workflows.values());
        const workflow = workflows[Math.floor(Math.random() * workflows.length)];

        const alert = {
            id: `alert-${Date.now()}`,
            title: `Performance Alert: ${workflow.name}`,
            message: `Significant latency increase detected in ${workflow.stages[Math.floor(Math.random() * workflow.stages.length)]} stage`,
            severity: severity,
            workflowName: workflow.name,
            stage: workflow.stages[Math.floor(Math.random() * workflow.stages.length)],
            timestamp: new Date()
        };

        this.alerts.push(alert);
        this.metrics.totalAlerts++;
    }

    showWorkflowModal(workflowId = null) {
        const modal = document.getElementById('workflowModal');
        const form = document.getElementById('workflowForm');
        const title = document.getElementById('workflowModalTitle');

        if (workflowId) {
            const workflow = this.workflows.get(workflowId);
            title.textContent = 'Edit Workflow';
            form.workflowName.value = workflow.name;
            form.workflowDescription.value = workflow.description;
            form.workflowType.value = workflow.type;
            form.expectedLatency.value = workflow.expectedLatency;
            form.monitoringEnabled.checked = workflow.monitoringEnabled;
        } else {
            title.textContent = 'Add Workflow';
            form.reset();
        }

        modal.style.display = 'block';
    }

    hideWorkflowModal() {
        document.getElementById('workflowModal').style.display = 'none';
    }

    saveWorkflow() {
        const form = document.getElementById('workflowForm');

        const workflow = {
            id: `wf-${Date.now()}`,
            name: form.workflowName.value,
            description: form.workflowDescription.value,
            type: form.workflowType.value,
            status: 'active',
            stages: this.getDefaultStages(form.workflowType.value),
            expectedLatency: parseInt(form.expectedLatency.value),
            monitoringEnabled: form.monitoringEnabled.checked,
            created: new Date()
        };

        this.workflows.set(workflow.id, workflow);
        this.hideWorkflowModal();
        this.updateWorkflowsView();
        this.updateDashboard();
    }

    getDefaultStages(type) {
        switch (type) {
            case 'data_processing':
                return ['ingestion', 'validation', 'processing', 'storage'];
            case 'api_integration':
                return ['request', 'authentication', 'processing', 'response'];
            case 'batch_processing':
                return ['queue', 'processing', 'validation', 'output'];
            case 'real_time':
                return ['input', 'processing', 'output'];
            default:
                return ['start', 'process', 'end'];
        }
    }

    showBottleneckDetails(bottleneckId) {
        const bottleneck = this.bottlenecks.get(bottleneckId);
        if (!bottleneck) return;

        const modal = document.getElementById('bottleneckModal');
        document.getElementById('bottleneckLatency').textContent = `${bottleneck.currentLatency}ms`;
        document.getElementById('bottleneckExpected').textContent = `${bottleneck.expectedLatency}ms`;
        document.getElementById('bottleneckDeviation').textContent = `${bottleneck.deviation > 0 ? '+' : ''}${bottleneck.deviation}%`;

        // Generate mock trend data
        const trendData = [];
        const trendLabels = [];
        for (let i = 20; i >= 0; i--) {
            const timestamp = new Date(Date.now() - (i * 5 * 60 * 1000));
            trendLabels.push(timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
            trendData.push(bottleneck.expectedLatency + (Math.random() - 0.5) * bottleneck.expectedLatency * 0.5);
        }

        this.charts.bottleneckDetail.data.labels = trendLabels;
        this.charts.bottleneckDetail.data.datasets[0].data = trendData;
        this.charts.bottleneckDetail.update();

        // Generate AI recommendations
        const recommendations = this.generateRecommendations(bottleneck);
        document.getElementById('bottleneckRecommendations').innerHTML = recommendations;

        modal.style.display = 'block';
    }

    generateRecommendations(bottleneck) {
        const recommendations = [
            'Consider increasing resource allocation for this stage',
            'Implement caching to reduce processing time',
            'Review and optimize database queries',
            'Consider horizontal scaling for better throughput',
            'Monitor memory usage and implement garbage collection optimization'
        ];

        return recommendations.map(rec => `<div class="recommendation">• ${rec}</div>`).join('');
    }

    hideModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    getHoursFromRange(range) {
        switch (range) {
            case '1h': return 1;
            case '6h': return 6;
            case '24h': return 24;
            case '7d': return 168;
            default: return 24;
        }
    }

    filterWorkflows() {
        // Implementation for workflow filtering
        this.updateWorkflowsView();
    }

    filterBottlenecks() {
        // Implementation for bottleneck filtering
        this.updateBottlenecksView();
    }

    filterAlerts() {
        // Implementation for alert filtering
        this.updateAlertsView();
    }

    refreshBottlenecks() {
        this.detectBottlenecks();
        this.updateDashboard();
    }

    exportBottlenecks() {
        // Mock export functionality
        alert('Bottleneck report exported successfully!');
    }

    clearAllAlerts() {
        this.alerts = [];
        this.updateAlertsView();
    }

    resolveBottleneck(bottleneckId) {
        this.bottlenecks.delete(bottleneckId);
        this.updateBottlenecksView();
        this.updateDashboard();
    }
}

// AI Components
class AnomalyDetector {
    detectAnomaly(data, threshold = 2) {
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const stdDev = Math.sqrt(data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length);
        const latest = data[data.length - 1];
        const zScore = Math.abs((latest - mean) / stdDev);
        return zScore > threshold;
    }
}

class PatternAnalyzer {
    analyzePatterns(data) {
        // Simple pattern analysis
        const trends = {
            increasing: this.isIncreasing(data),
            seasonal: this.hasSeasonalPattern(data),
            cyclic: this.hasCyclicPattern(data)
        };
        return trends;
    }

    isIncreasing(data) {
        const recent = data.slice(-10);
        const older = data.slice(-20, -10);
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        return recentAvg > olderAvg * 1.1;
    }

    hasSeasonalPattern(data) {
        // Simplified seasonal detection
        return Math.random() > 0.7;
    }

    hasCyclicPattern(data) {
        // Simplified cyclic detection
        return Math.random() > 0.8;
    }
}

class PredictiveModel {
    predictNext(data) {
        // Simple linear regression for prediction
        const n = data.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = data.reduce((a, b) => a + b, 0);
        const sumXY = data.reduce((sum, y, x) => sum + x * y, 0);
        const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return slope * n + intercept;
    }
}

// Initialize the detector when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.detector = new WorkflowBottleneckDetector();
});