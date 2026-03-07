// Distributed Model Performance Tracker - Interactive JavaScript Implementation

class DistributedModelPerformanceTracker {
    constructor() {
        this.nodes = this.generateSampleNodes();
        this.models = this.generateSampleModels();
        this.alerts = this.generateSampleAlerts();
        this.analyticsData = this.generateAnalyticsData();
        this.driftData = this.generateDriftData();

        this.charts = {};
        this.intervals = {};
        this.currentFilters = {
            modelType: 'all',
            region: 'all'
        };

        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.initializeCharts();
        this.updateDisplay();
        this.startRealTimeUpdates();
    }

    generateSampleNodes() {
        const regions = ['us-east', 'us-west', 'eu-central', 'asia-pacific'];
        const modelTypes = ['classification', 'regression', 'nlp', 'vision'];
        const nodeNames = [
            'ml-node-001', 'ml-node-002', 'ml-node-003', 'ml-node-004',
            'ml-node-005', 'ml-node-006', 'ml-node-007', 'ml-node-008',
            'ml-node-009', 'ml-node-010', 'ml-node-011', 'ml-node-012'
        ];

        return nodeNames.map((name, index) => ({
            id: index + 1,
            name: name,
            region: regions[Math.floor(Math.random() * regions.length)],
            modelType: modelTypes[Math.floor(Math.random() * modelTypes.length)],
            status: this.getRandomStatus(),
            metrics: {
                accuracy: this.getRandomAccuracy(),
                latency: this.getRandomLatency(),
                throughput: this.getRandomThroughput(),
                memoryUsage: this.getRandomMemoryUsage(),
                cpuUsage: this.getRandomCpuUsage()
            },
            lastUpdate: new Date(),
            alerts: Math.floor(Math.random() * 3)
        }));
    }

    generateSampleModels() {
        const modelNames = [
            'ImageClassifier-v2.1', 'SentimentAnalyzer-v1.8', 'PricePredictor-v3.2',
            'FraudDetector-v2.5', 'RecommendationEngine-v1.9', 'TextSummarizer-v2.0'
        ];

        return modelNames.map((name, index) => ({
            id: index + 1,
            name: name,
            version: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}`,
            type: name.includes('Image') ? 'vision' :
                  name.includes('Sentiment') || name.includes('Text') ? 'nlp' :
                  name.includes('Price') || name.includes('Fraud') ? 'classification' : 'regression',
            accuracy: this.getRandomAccuracy(),
            deploymentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            status: 'active'
        }));
    }

    generateSampleAlerts() {
        const alertTypes = [
            { type: 'critical', title: 'High Latency Detected', message: 'Response time exceeded 500ms threshold' },
            { type: 'warning', title: 'Accuracy Drift', message: 'Model accuracy dropped by 3.2% in last hour' },
            { type: 'warning', title: 'Resource Usage Spike', message: 'CPU usage above 85% for extended period' },
            { type: 'info', title: 'Model Update Available', message: 'New model version v2.3 ready for deployment' },
            { type: 'critical', title: 'Node Offline', message: 'ml-node-005 is not responding to health checks' },
            { type: 'warning', title: 'Memory Leak Detected', message: 'Memory usage steadily increasing over time' }
        ];

        return alertTypes.map((alert, index) => ({
            id: index + 1,
            ...alert,
            nodeId: Math.floor(Math.random() * 12) + 1,
            timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
            acknowledged: Math.random() > 0.7
        }));
    }

    generateAnalyticsData() {
        const dataPoints = 24; // 24 hours
        const data = {
            accuracy: [],
            latency: [],
            throughput: [],
            timestamps: []
        };

        for (let i = 0; i < dataPoints; i++) {
            const timestamp = new Date(Date.now() - (dataPoints - i) * 60 * 60 * 1000);
            data.timestamps.push(timestamp);
            data.accuracy.push({
                value: 92 + Math.random() * 6, // 92-98%
                timestamp: timestamp
            });
            data.latency.push({
                value: 100 + Math.random() * 100, // 100-200ms
                timestamp: timestamp
            });
            data.throughput.push({
                value: 500 + Math.random() * 500, // 500-1000 req/sec
                timestamp: timestamp
            });
        }

        return data;
    }

    generateDriftData() {
        const dataPoints = 100;
        return Array.from({ length: dataPoints }, (_, i) => ({
            x: i,
            dataDrift: Math.random() * 0.5,
            conceptDrift: Math.random() * 0.8,
            bias: Math.random() * 0.3
        }));
    }

    getRandomStatus() {
        const statuses = ['healthy', 'warning', 'critical'];
        const weights = [0.7, 0.2, 0.1]; // 70% healthy, 20% warning, 10% critical

        const random = Math.random();
        if (random < weights[0]) return statuses[0];
        if (random < weights[0] + weights[1]) return statuses[1];
        return statuses[2];
    }

    getRandomAccuracy() {
        return 85 + Math.random() * 12; // 85-97%
    }

    getRandomLatency() {
        return 50 + Math.random() * 200; // 50-250ms
    }

    getRandomThroughput() {
        return 200 + Math.random() * 800; // 200-1000 req/sec
    }

    getRandomMemoryUsage() {
        return 40 + Math.random() * 50; // 40-90%
    }

    getRandomCpuUsage() {
        return 30 + Math.random() * 60; // 30-90%
    }

    setupEventListeners() {
        // Filters
        document.getElementById('modelFilter').addEventListener('change', (e) => {
            this.currentFilters.modelType = e.target.value;
            this.updateNodeDisplay();
        });

        document.getElementById('regionFilter').addEventListener('change', (e) => {
            this.currentFilters.region = e.target.value;
            this.updateNodeDisplay();
        });

        // Refresh button
        document.getElementById('refreshData').addEventListener('click', () => {
            this.refreshData();
        });

        // Drift analysis
        document.getElementById('runDriftAnalysis').addEventListener('click', () => {
            this.runDriftAnalysis();
        });

        document.getElementById('retrainModels').addEventListener('click', () => {
            this.retrainModels();
        });

        // Alert filters
        document.querySelectorAll('.alert-filter').forEach(button => {
            button.addEventListener('click', (e) => {
                this.filterAlerts(e.target.dataset.severity);
            });
        });

        document.getElementById('clearAlerts').addEventListener('click', () => {
            this.clearAlerts();
        });

        // Management actions
        document.getElementById('deployModel').addEventListener('click', () => {
            this.deployModel();
        });

        document.getElementById('rollbackModel').addEventListener('click', () => {
            this.rollbackModel();
        });

        document.getElementById('scaleNodes').addEventListener('click', () => {
            this.scaleNodes();
        });

        document.getElementById('maintenanceMode').addEventListener('click', () => {
            this.toggleMaintenanceMode();
        });

        // Node interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.node-card')) {
                const nodeId = parseInt(e.target.closest('.node-card').dataset.id);
                this.showNodeDetails(nodeId);
            }
        });

        // Modal
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('nodeModal').addEventListener('click', (e) => {
            if (e.target.id === 'nodeModal') {
                this.hideModal();
            }
        });
    }

    initializeCharts() {
        this.initializeAccuracyChart();
        this.initializeLatencyChart();
        this.initializeDriftChart();
        this.initializeThroughputChart();
        this.initializeDriftVisualization();
    }

    initializeAccuracyChart() {
        const canvas = document.getElementById('accuracyChart');
        const ctx = canvas.getContext('2d');
        this.charts.accuracy = { canvas, ctx };

        this.drawAccuracyChart();
    }

    initializeLatencyChart() {
        const canvas = document.getElementById('latencyChart');
        const ctx = canvas.getContext('2d');
        this.charts.latency = { canvas, ctx };

        this.drawLatencyChart();
    }

    initializeDriftChart() {
        const canvas = document.getElementById('driftChart');
        const ctx = canvas.getContext('2d');
        this.charts.drift = { canvas, ctx };

        this.drawDriftChart();
    }

    initializeThroughputChart() {
        const canvas = document.getElementById('throughputChart');
        const ctx = canvas.getContext('2d');
        this.charts.throughput = { canvas, ctx };

        this.drawThroughputChart();
    }

    initializeDriftVisualization() {
        const canvas = document.getElementById('driftVisualization');
        const ctx = canvas.getContext('2d');
        this.charts.driftVisualization = { canvas, ctx };

        this.drawDriftVisualization();
    }

    drawAccuracyChart() {
        const { ctx, canvas } = this.charts.accuracy;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        const data = this.analyticsData.accuracy;
        const maxValue = Math.max(...data.map(d => d.value));
        const minValue = Math.min(...data.map(d => d.value));

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 5; i++) {
            const y = (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw line
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = (width / (data.length - 1)) * index;
            const y = height - ((point.value - minValue) / (maxValue - minValue)) * height * 0.8 - height * 0.1;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw points
        ctx.fillStyle = '#6366f1';
        data.forEach((point, index) => {
            const x = (width / (data.length - 1)) * index;
            const y = height - ((point.value - minValue) / (maxValue - minValue)) * height * 0.8 - height * 0.1;

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawLatencyChart() {
        const { ctx, canvas } = this.charts.latency;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        const data = this.analyticsData.latency;
        const maxValue = Math.max(...data.map(d => d.value));
        const minValue = Math.min(...data.map(d => d.value));

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 5; i++) {
            const y = (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw line
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = (width / (data.length - 1)) * index;
            const y = height - ((point.value - minValue) / (maxValue - minValue)) * height * 0.8 - height * 0.1;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw points
        ctx.fillStyle = '#06b6d4';
        data.forEach((point, index) => {
            const x = (width / (data.length - 1)) * index;
            const y = height - ((point.value - minValue) / (maxValue - minValue)) * height * 0.8 - height * 0.1;

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawDriftChart() {
        const { ctx, canvas } = this.charts.drift;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Simulate drift data
        const dataPoints = 20;
        const driftData = Array.from({ length: dataPoints }, (_, i) => ({
            x: (width / (dataPoints - 1)) * i,
            y: height - (Math.random() * 0.6 + 0.2) * height
        }));

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 5; i++) {
            const y = (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw line
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(driftData[0].x, driftData[0].y);

        driftData.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();

        // Draw points
        ctx.fillStyle = '#f59e0b';
        driftData.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawThroughputChart() {
        const { ctx, canvas } = this.charts.throughput;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        const data = this.analyticsData.throughput;
        const maxValue = Math.max(...data.map(d => d.value));
        const minValue = Math.min(...data.map(d => d.value));

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 5; i++) {
            const y = (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw line
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = (width / (data.length - 1)) * index;
            const y = height - ((point.value - minValue) / (maxValue - minValue)) * height * 0.8 - height * 0.1;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw points
        ctx.fillStyle = '#10b981';
        data.forEach((point, index) => {
            const x = (width / (data.length - 1)) * index;
            const y = height - ((point.value - minValue) / (maxValue - minValue)) * height * 0.8 - height * 0.1;

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawDriftVisualization() {
        const { ctx, canvas } = this.charts.driftVisualization;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        const data = this.driftData;
        const stepX = width / data.length;

        // Draw data drift line
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = index * stepX;
            const y = height - point.dataDrift * height;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw concept drift line
        ctx.strokeStyle = '#f59e0b';
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = index * stepX;
            const y = height - point.conceptDrift * height;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw bias line
        ctx.strokeStyle = '#3b82f6';
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = index * stepX;
            const y = height - point.bias * height;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
    }

    updateDisplay() {
        this.updateOverviewMetrics();
        this.updateNodeDisplay();
        this.updateAlertsDisplay();
        this.updateModelList();
        this.updateDriftIndicators();
        this.updateHealthIndicators();
    }

    updateOverviewMetrics() {
        const activeNodes = this.nodes.filter(n => n.status !== 'offline').length;
        const avgAccuracy = this.nodes.reduce((sum, n) => sum + n.metrics.accuracy, 0) / this.nodes.length;
        const avgLatency = this.nodes.reduce((sum, n) => sum + n.metrics.latency, 0) / this.nodes.length;
        const activeAlerts = this.alerts.filter(a => !a.acknowledged).length;

        document.getElementById('activeNodes').textContent = activeNodes;
        document.getElementById('avgAccuracy').textContent = `${avgAccuracy.toFixed(1)}%`;
        document.getElementById('avgLatency').textContent = `${avgLatency.toFixed(0)}ms`;
        document.getElementById('activeAlerts').textContent = activeAlerts;
    }

    updateNodeDisplay() {
        const container = document.getElementById('nodesGrid');
        container.innerHTML = '';

        const filteredNodes = this.nodes.filter(node => {
            const modelMatch = this.currentFilters.modelType === 'all' || node.modelType === this.currentFilters.modelType;
            const regionMatch = this.currentFilters.region === 'all' || node.region === this.currentFilters.region;
            return modelMatch && regionMatch;
        });

        filteredNodes.forEach(node => {
            const nodeElement = this.createNodeCard(node);
            container.appendChild(nodeElement);
        });
    }

    createNodeCard(node) {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = `node-card ${node.status === 'critical' ? 'critical' : ''}`;
        nodeDiv.dataset.id = node.id;

        nodeDiv.innerHTML = `
            <div class="node-header">
                <div class="node-name">${node.name}</div>
                <div class="node-status ${node.status}">${node.status}</div>
            </div>
            <div class="node-metrics">
                <div class="metric-item">
                    <span class="metric-label">Accuracy:</span>
                    <span class="metric-value">${node.metrics.accuracy.toFixed(1)}%</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Latency:</span>
                    <span class="metric-value">${node.metrics.latency.toFixed(0)}ms</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Throughput:</span>
                    <span class="metric-value">${node.metrics.throughput.toFixed(0)}/s</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">CPU:</span>
                    <span class="metric-value">${node.metrics.cpuUsage.toFixed(0)}%</span>
                </div>
            </div>
        `;

        return nodeDiv;
    }

    updateAlertsDisplay(severity = 'all') {
        const container = document.getElementById('alertsContainer');
        container.innerHTML = '';

        const filteredAlerts = severity === 'all' ?
            this.alerts :
            this.alerts.filter(alert => alert.type === severity);

        filteredAlerts.slice(0, 10).forEach(alert => {
            const alertElement = this.createAlertItem(alert);
            container.appendChild(alertElement);
        });
    }

    createAlertItem(alert) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert-item ${alert.acknowledged ? 'acknowledged' : ''}`;

        const iconClass = alert.type === 'critical' ? 'exclamation-triangle' :
                         alert.type === 'warning' ? 'exclamation-circle' : 'info-circle';

        alertDiv.innerHTML = `
            <div class="alert-icon ${alert.type}">
                <i class="fas fa-${iconClass}"></i>
            </div>
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-message">${alert.message}</div>
                <div class="alert-meta">
                    <span>Node ${alert.nodeId} • ${alert.timestamp.toLocaleString()}</span>
                    <div class="alert-actions">
                        ${!alert.acknowledged ? '<button class="alert-action acknowledge">Acknowledge</button>' : ''}
                        <button class="alert-action dismiss">Dismiss</button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners for alert actions
        const acknowledgeBtn = alertDiv.querySelector('.acknowledge');
        const dismissBtn = alertDiv.querySelector('.dismiss');

        if (acknowledgeBtn) {
            acknowledgeBtn.addEventListener('click', () => {
                alert.acknowledged = true;
                this.updateAlertsDisplay();
                this.updateOverviewMetrics();
            });
        }

        dismissBtn.addEventListener('click', () => {
            this.alerts = this.alerts.filter(a => a.id !== alert.id);
            this.updateAlertsDisplay();
            this.updateOverviewMetrics();
        });

        return alertDiv;
    }

    updateModelList() {
        const container = document.getElementById('modelList');
        container.innerHTML = '';

        this.models.forEach(model => {
            const modelElement = this.createModelItem(model);
            container.appendChild(modelElement);
        });
    }

    createModelItem(model) {
        const modelDiv = document.createElement('div');
        modelDiv.className = 'model-item';

        modelDiv.innerHTML = `
            <div class="model-name">${model.name}</div>
            <div class="model-version">${model.version}</div>
        `;

        return modelDiv;
    }

    updateDriftIndicators() {
        const dataDrift = this.driftData.reduce((sum, d) => sum + d.dataDrift, 0) / this.driftData.length;
        const conceptDrift = this.driftData.reduce((sum, d) => sum + d.conceptDrift, 0) / this.driftData.length;
        const bias = this.driftData.reduce((sum, d) => sum + d.bias, 0) / this.driftData.length;

        document.getElementById('dataDriftScore').textContent = dataDrift.toFixed(2);
        document.getElementById('conceptDriftScore').textContent = conceptDrift.toFixed(2);
        document.getElementById('biasScore').textContent = bias.toFixed(2);

        // Update indicator bars
        document.getElementById('dataDriftIndicator').style.setProperty('--drift-width', `${dataDrift * 200}%`);
        document.getElementById('conceptDriftIndicator').style.setProperty('--drift-width', `${conceptDrift * 200}%`);
        document.getElementById('biasIndicator').style.setProperty('--drift-width', `${bias * 200}%`);
    }

    updateHealthIndicators() {
        const overallHealth = this.calculateOverallHealth();
        const resourceUsage = this.calculateResourceUsage();

        document.getElementById('overallHealth').style.width = `${overallHealth}%`;
        document.getElementById('resourceUsage').style.width = `${resourceUsage}%`;
    }

    calculateOverallHealth() {
        const healthyNodes = this.nodes.filter(n => n.status === 'healthy').length;
        return (healthyNodes / this.nodes.length) * 100;
    }

    calculateResourceUsage() {
        const avgCpu = this.nodes.reduce((sum, n) => sum + n.metrics.cpuUsage, 0) / this.nodes.length;
        const avgMemory = this.nodes.reduce((sum, n) => sum + n.metrics.memoryUsage, 0) / this.nodes.length;
        return (avgCpu + avgMemory) / 2;
    }

    filterAlerts(severity) {
        // Update active filter button
        document.querySelectorAll('.alert-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-severity="${severity}"]`).classList.add('active');

        this.updateAlertsDisplay(severity);
    }

    showNodeDetails(nodeId) {
        const node = this.nodes.find(n => n.id === nodeId);
        if (!node) return;

        const modal = document.getElementById('nodeModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        modalTitle.textContent = `Node Details: ${node.name}`;
        modalBody.innerHTML = `
            <div class="node-details">
                <div class="detail-section">
                    <h4>Basic Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value status-${node.status}">${node.status}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Region:</span>
                            <span class="detail-value">${node.region}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Model Type:</span>
                            <span class="detail-value">${node.modelType}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Last Update:</span>
                            <span class="detail-value">${node.lastUpdate.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>Performance Metrics</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Accuracy:</span>
                            <span class="detail-value">${node.metrics.accuracy.toFixed(2)}%</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Latency:</span>
                            <span class="detail-value">${node.metrics.latency.toFixed(0)}ms</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Throughput:</span>
                            <span class="detail-value">${node.metrics.throughput.toFixed(0)} req/sec</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">CPU Usage:</span>
                            <span class="detail-value">${node.metrics.cpuUsage.toFixed(1)}%</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Memory Usage:</span>
                            <span class="detail-value">${node.metrics.memoryUsage.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>Recent Alerts</h4>
                    <div class="alerts-list">
                        ${this.alerts.filter(a => a.nodeId === nodeId).slice(0, 3).map(alert => `
                            <div class="mini-alert ${alert.type}">
                                <i class="fas fa-${alert.type === 'critical' ? 'exclamation-triangle' : alert.type === 'warning' ? 'exclamation-circle' : 'info-circle'}"></i>
                                <span>${alert.title}</span>
                            </div>
                        `).join('') || '<p>No recent alerts</p>'}
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('show');
    }

    hideModal() {
        document.getElementById('nodeModal').classList.remove('show');
    }

    refreshData() {
        const btn = document.getElementById('refreshData');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        btn.disabled = true;

        setTimeout(() => {
            // Simulate data refresh
            this.nodes.forEach(node => {
                node.metrics.accuracy = this.getRandomAccuracy();
                node.metrics.latency = this.getRandomLatency();
                node.metrics.throughput = this.getRandomThroughput();
                node.metrics.memoryUsage = this.getRandomMemoryUsage();
                node.metrics.cpuUsage = this.getRandomCpuUsage();
                node.lastUpdate = new Date();
            });

            this.updateDisplay();
            this.drawAccuracyChart();
            this.drawLatencyChart();
            this.drawThroughputChart();

            btn.innerHTML = originalText;
            btn.disabled = false;
            this.showNotification('Data refreshed successfully!', 'success');
        }, 2000);
    }

    runDriftAnalysis() {
        const btn = document.getElementById('runDriftAnalysis');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        btn.disabled = true;

        setTimeout(() => {
            // Simulate drift analysis
            this.driftData = this.generateDriftData();
            this.updateDriftIndicators();
            this.drawDriftVisualization();

            btn.innerHTML = originalText;
            btn.disabled = false;
            this.showNotification('Drift analysis completed!', 'success');
        }, 3000);
    }

    retrainModels() {
        this.showNotification('Model retraining initiated. This may take several minutes...', 'info');
    }

    clearAlerts() {
        if (confirm('Clear all alerts? This action cannot be undone.')) {
            this.alerts = [];
            this.updateAlertsDisplay();
            this.updateOverviewMetrics();
            this.showNotification('All alerts cleared!', 'success');
        }
    }

    deployModel() {
        this.showNotification('New model version deployment initiated...', 'info');
    }

    rollbackModel() {
        this.showNotification('Rolling back to previous model version...', 'warning');
    }

    scaleNodes() {
        this.showNotification('Node scaling operation initiated...', 'info');
    }

    toggleMaintenanceMode() {
        this.showNotification('Maintenance mode toggled!', 'info');
    }

    startRealTimeUpdates() {
        // Update metrics every 5 seconds
        this.intervals.metrics = setInterval(() => {
            this.nodes.forEach(node => {
                // Small random changes to simulate real-time updates
                node.metrics.accuracy += (Math.random() - 0.5) * 2;
                node.metrics.accuracy = Math.max(80, Math.min(100, node.metrics.accuracy));

                node.metrics.latency += (Math.random() - 0.5) * 20;
                node.metrics.latency = Math.max(20, Math.min(500, node.metrics.latency));

                node.metrics.throughput += (Math.random() - 0.5) * 50;
                node.metrics.throughput = Math.max(100, Math.min(1500, node.metrics.throughput));

                node.lastUpdate = new Date();
            });

            this.updateOverviewMetrics();
            this.updateNodeDisplay();
        }, 5000);

        // Update charts every 10 seconds
        this.intervals.charts = setInterval(() => {
            this.drawAccuracyChart();
            this.drawLatencyChart();
            this.drawThroughputChart();
        }, 10000);

        // Generate random alerts occasionally
        this.intervals.alerts = setInterval(() => {
            if (Math.random() > 0.8) { // 20% chance every 15 seconds
                const newAlert = {
                    id: this.alerts.length + 1,
                    type: Math.random() > 0.7 ? 'critical' : Math.random() > 0.5 ? 'warning' : 'info',
                    title: 'Performance Alert',
                    message: 'Unusual metric detected on node ' + Math.floor(Math.random() * 12 + 1),
                    nodeId: Math.floor(Math.random() * 12) + 1,
                    timestamp: new Date(),
                    acknowledged: false
                };

                this.alerts.unshift(newAlert);
                this.alerts = this.alerts.slice(0, 20); // Keep only last 20 alerts

                this.updateAlertsDisplay();
                this.updateOverviewMetrics();
            }
        }, 15000);
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    destroy() {
        Object.values(this.intervals).forEach(interval => clearInterval(interval));
    }
}

// Initialize the distributed model performance tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.performanceTracker = new DistributedModelPerformanceTracker();
});