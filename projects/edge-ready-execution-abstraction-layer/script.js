// Edge-Ready Execution Abstraction Layer - JavaScript

class EdgeExecutionAbstractionLayer {
    constructor() {
        this.devices = [];
        this.workflows = [];
        this.executions = [];
        this.metrics = {
            totalExecutions: 0,
            activeDevices: 0,
            avgLatency: 0,
            successRate: 0,
            systemThroughput: 0,
            resourceUsage: 0
        };

        this.executionMode = 'edge-first';
        this.loadBalancing = 'round-robin';
        this.faultTolerance = true;
        this.autoOptimization = true;

        this.charts = {};
        this.intervals = {};

        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.initializeCharts();
        this.startSimulation();
        this.updateUI();
    }

    // Device Management
    addDevice(deviceData) {
        const device = {
            id: Date.now().toString(),
            name: deviceData.name,
            type: deviceData.type,
            location: deviceData.location,
            capabilities: deviceData.capabilities || [],
            latency: parseInt(deviceData.latency) || 50,
            bandwidth: parseInt(deviceData.bandwidth) || 100,
            status: 'online',
            lastSeen: Date.now(),
            metrics: {
                cpu: Math.random() * 100,
                memory: Math.random() * 100,
                network: Math.random() * 100,
                executions: 0
            },
            history: []
        };

        this.devices.push(device);
        this.saveToStorage();
        this.updateUI();
        return device;
    }

    removeDevice(deviceId) {
        this.devices = this.devices.filter(d => d.id !== deviceId);
        this.saveToStorage();
        this.updateUI();
    }

    updateDeviceMetrics() {
        this.devices.forEach(device => {
            // Simulate metric updates
            device.metrics.cpu = Math.max(0, Math.min(100, device.metrics.cpu + (Math.random() - 0.5) * 20));
            device.metrics.memory = Math.max(0, Math.min(100, device.metrics.memory + (Math.random() - 0.5) * 15));
            device.metrics.network = Math.max(0, Math.min(100, device.metrics.network + (Math.random() - 0.5) * 25));

            device.history.push({
                timestamp: Date.now(),
                cpu: device.metrics.cpu,
                memory: device.metrics.memory,
                network: device.metrics.network
            });

            // Keep only last 100 entries
            if (device.history.length > 100) {
                device.history.shift();
            }
        });
    }

    // Workflow Management
    createWorkflow(workflowData) {
        const workflow = {
            id: Date.now().toString(),
            name: workflowData.name,
            type: workflowData.type,
            strategy: workflowData.executionStrategy,
            maxLatency: parseInt(workflowData.maxLatency) || 1000,
            priority: workflowData.priority || 'medium',
            enableFailover: workflowData.enableFailover || false,
            status: 'idle',
            executions: 0,
            successRate: 100,
            avgExecutionTime: 0,
            lastExecuted: null,
            steps: this.generateWorkflowSteps(workflowData.type)
        };

        this.workflows.push(workflow);
        this.saveToStorage();
        this.updateUI();
        return workflow;
    }

    generateWorkflowSteps(type) {
        const stepTemplates = {
            'data-processing': [
                { name: 'Data Ingestion', type: 'input', duration: 100, resource: 'network' },
                { name: 'Data Validation', type: 'processing', duration: 200, resource: 'cpu' },
                { name: 'Data Transformation', type: 'processing', duration: 300, resource: 'cpu' },
                { name: 'Data Storage', type: 'output', duration: 150, resource: 'storage' }
            ],
            'ai-inference': [
                { name: 'Model Loading', type: 'input', duration: 500, resource: 'memory' },
                { name: 'Data Preprocessing', type: 'processing', duration: 200, resource: 'cpu' },
                { name: 'Inference', type: 'processing', duration: 800, resource: 'gpu' },
                { name: 'Result Processing', type: 'processing', duration: 100, resource: 'cpu' }
            ],
            'real-time-analytics': [
                { name: 'Stream Ingestion', type: 'input', duration: 50, resource: 'network' },
                { name: 'Real-time Processing', type: 'processing', duration: 100, resource: 'cpu' },
                { name: 'Analytics', type: 'processing', duration: 200, resource: 'cpu' },
                { name: 'Alert Generation', type: 'output', duration: 50, resource: 'network' }
            ],
            'iot-processing': [
                { name: 'Sensor Data Collection', type: 'input', duration: 20, resource: 'network' },
                { name: 'Data Filtering', type: 'processing', duration: 50, resource: 'cpu' },
                { name: 'Edge Analytics', type: 'processing', duration: 100, resource: 'cpu' },
                { name: 'Data Transmission', type: 'output', duration: 30, resource: 'network' }
            ],
            'edge-computing': [
                { name: 'Edge Data Ingestion', type: 'input', duration: 25, resource: 'network' },
                { name: 'Local Processing', type: 'processing', duration: 150, resource: 'cpu' },
                { name: 'Decision Making', type: 'processing', duration: 75, resource: 'cpu' },
                { name: 'Action Execution', type: 'output', duration: 50, resource: 'network' }
            ]
        };

        return stepTemplates[type] || stepTemplates['data-processing'];
    }

    executeWorkflow(workflowId) {
        const workflow = this.workflows.find(w => w.id === workflowId);
        if (!workflow) return;

        workflow.status = 'running';
        const execution = {
            id: Date.now().toString(),
            workflowId: workflowId,
            startTime: Date.now(),
            endTime: null,
            status: 'running',
            steps: [],
            deviceId: this.selectExecutionDevice(workflow),
            latency: 0,
            success: true
        };

        this.executions.unshift(execution);
        this.executeWorkflowSteps(execution, workflow);
        this.updateUI();
    }

    selectExecutionDevice(workflow) {
        const availableDevices = this.devices.filter(d => d.status === 'online');

        switch (this.executionMode) {
            case 'edge-only':
                return availableDevices.find(d => d.type === 'edge-server' || d.type === 'edge-gateway')?.id ||
                       availableDevices[0]?.id;

            case 'cloud-only':
                return 'cloud-node';

            case 'edge-first':
                const edgeDevice = availableDevices.find(d => d.type === 'edge-server' || d.type === 'edge-gateway');
                return edgeDevice?.id || 'cloud-node';

            case 'cloud-first':
                return 'cloud-node';

            case 'adaptive':
                // Adaptive selection based on load and capabilities
                const suitableDevices = availableDevices.filter(d =>
                    d.capabilities.includes(this.getRequiredCapability(workflow.type))
                );

                if (suitableDevices.length > 0) {
                    // Select device with lowest load
                    return suitableDevices.reduce((min, device) =>
                        device.metrics.cpu < min.metrics.cpu ? device : min
                    ).id;
                }

                return 'cloud-node';

            default:
                return availableDevices[0]?.id || 'cloud-node';
        }
    }

    getRequiredCapability(workflowType) {
        const capabilityMap = {
            'ai-inference': 'ai',
            'data-processing': 'compute',
            'real-time-analytics': 'compute',
            'iot-processing': 'network',
            'edge-computing': 'compute'
        };
        return capabilityMap[workflowType] || 'compute';
    }

    async executeWorkflowSteps(execution, workflow) {
        let totalLatency = 0;

        for (let i = 0; i < workflow.steps.length; i++) {
            const step = workflow.steps[i];
            const stepStart = Date.now();

            // Simulate step execution with random delay
            const delay = step.duration + (Math.random() - 0.5) * step.duration * 0.2;
            await this.delay(delay);

            const stepEnd = Date.now();
            const stepLatency = stepEnd - stepStart;
            totalLatency += stepLatency;

            execution.steps.push({
                name: step.name,
                startTime: stepStart,
                endTime: stepEnd,
                latency: stepLatency,
                success: Math.random() > 0.05 // 95% success rate
            });

            // Update device metrics if executed on edge device
            if (execution.deviceId !== 'cloud-node') {
                const device = this.devices.find(d => d.id === execution.deviceId);
                if (device) {
                    device.metrics.executions++;
                    device.metrics.cpu = Math.min(100, device.metrics.cpu + step.duration / 10);
                }
            }
        }

        execution.endTime = Date.now();
        execution.latency = totalLatency;
        execution.status = 'completed';

        workflow.status = 'idle';
        workflow.executions++;
        workflow.lastExecuted = Date.now();
        workflow.avgExecutionTime = (workflow.avgExecutionTime * (workflow.executions - 1) + totalLatency) / workflow.executions;

        this.metrics.totalExecutions++;
        this.updateMetrics();
        this.saveToStorage();
        this.updateUI();
    }

    // Execution Layer Abstraction
    setExecutionMode(mode) {
        this.executionMode = mode;
        this.saveToStorage();
    }

    setLoadBalancing(strategy) {
        this.loadBalancing = strategy;
        this.saveToStorage();
    }

    // Monitoring and Metrics
    updateMetrics() {
        const activeDevices = this.devices.filter(d => d.status === 'online').length;
        const recentExecutions = this.executions.slice(0, 100);

        this.metrics.activeDevices = activeDevices;
        this.metrics.avgLatency = recentExecutions.length > 0 ?
            recentExecutions.reduce((sum, e) => sum + e.latency, 0) / recentExecutions.length : 0;
        this.metrics.successRate = recentExecutions.length > 0 ?
            (recentExecutions.filter(e => e.success).length / recentExecutions.length) * 100 : 0;
        this.metrics.systemThroughput = this.calculateThroughput();
        this.metrics.resourceUsage = this.calculateResourceUsage();
    }

    calculateThroughput() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        const recentExecutions = this.executions.filter(e => e.endTime && e.endTime > oneMinuteAgo);
        return recentExecutions.length;
    }

    calculateResourceUsage() {
        if (this.devices.length === 0) return 0;
        const totalCpu = this.devices.reduce((sum, d) => sum + d.metrics.cpu, 0);
        return totalCpu / this.devices.length;
    }

    // Optimization
    runOptimization() {
        const recommendations = [];

        // Analyze device utilization
        const avgCpu = this.devices.reduce((sum, d) => sum + d.metrics.cpu, 0) / this.devices.length;
        if (avgCpu > 80) {
            recommendations.push({
                title: 'High CPU Utilization',
                description: 'Consider adding more edge devices or offloading to cloud',
                impact: 'Reduce latency by 20-30%'
            });
        }

        // Analyze execution patterns
        const edgeExecutions = this.executions.filter(e => e.deviceId !== 'cloud-node').length;
        const totalExecutions = this.executions.length;
        const edgeRatio = totalExecutions > 0 ? edgeExecutions / totalExecutions : 0;

        if (edgeRatio < 0.6) {
            recommendations.push({
                title: 'Low Edge Utilization',
                description: 'Optimize execution strategy to use more edge resources',
                impact: 'Improve response time by 15-25%'
            });
        }

        // Analyze latency patterns
        const highLatencyExecutions = this.executions.filter(e => e.latency > 1000).length;
        if (highLatencyExecutions > this.executions.length * 0.1) {
            recommendations.push({
                title: 'High Latency Detected',
                description: 'Consider edge-first execution or device optimization',
                impact: 'Reduce average latency by 30-40%'
            });
        }

        return recommendations;
    }

    applyOptimization(recommendation) {
        switch (recommendation.title) {
            case 'High CPU Utilization':
                this.setExecutionMode('cloud-first');
                break;
            case 'Low Edge Utilization':
                this.setExecutionMode('edge-first');
                break;
            case 'High Latency Detected':
                this.setExecutionMode('adaptive');
                break;
        }
        this.updateUI();
    }

    // UI Management
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.sidebar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Modals
        document.getElementById('add-device-modal-btn').addEventListener('click', () => {
            this.showModal('add-device-modal');
        });

        document.getElementById('create-workflow-modal-btn').addEventListener('click', () => {
            this.showModal('create-workflow-modal');
        });

        document.querySelectorAll('.modal-close').forEach(close => {
            close.addEventListener('click', () => {
                this.hideModal();
            });
        });

        // Forms
        document.getElementById('device-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleDeviceSubmit();
        });

        document.getElementById('workflow-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleWorkflowSubmit();
        });

        // Controls
        document.getElementById('execution-mode').addEventListener('change', (e) => {
            this.setExecutionMode(e.target.value);
        });

        document.getElementById('load-balancing').addEventListener('change', (e) => {
            this.setLoadBalancing(e.target.value);
        });

        document.getElementById('fault-tolerance').addEventListener('change', (e) => {
            this.faultTolerance = e.target.checked;
            this.saveToStorage();
        });

        document.getElementById('auto-optimization').addEventListener('change', (e) => {
            this.autoOptimization = e.target.checked;
            this.saveToStorage();
        });

        // Action buttons
        document.getElementById('add-device-btn').addEventListener('click', () => {
            this.showModal('add-device-modal');
        });

        document.getElementById('create-workflow-btn').addEventListener('click', () => {
            this.showModal('create-workflow-modal');
        });

        document.getElementById('run-optimization-btn').addEventListener('click', () => {
            this.runOptimizationAnalysis();
        });

        document.getElementById('reset-edge-system').addEventListener('click', () => {
            this.resetSystem();
        });

        // Region selector
        document.getElementById('edge-region').addEventListener('change', (e) => {
            this.updateRegionData(e.target.value);
        });
    }

    switchView(viewName) {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.querySelectorAll('.sidebar-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        document.getElementById(`${viewName}-view`).classList.add('active');
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
    }

    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('edge-theme', newTheme);

        const themeBtn = document.getElementById('theme-toggle');
        themeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }

    hideModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    handleDeviceSubmit() {
        const formData = new FormData(document.getElementById('device-form'));
        const capabilities = Array.from(document.querySelectorAll('#device-form input[type="checkbox"]:checked'))
            .map(cb => cb.value);

        const deviceData = {
            name: formData.get('device-name'),
            type: formData.get('device-type'),
            location: formData.get('device-location'),
            capabilities: capabilities,
            latency: formData.get('device-latency'),
            bandwidth: formData.get('device-bandwidth')
        };

        this.addDevice(deviceData);
        this.hideModal();
        document.getElementById('device-form').reset();
    }

    handleWorkflowSubmit() {
        const formData = new FormData(document.getElementById('workflow-form'));

        const workflowData = {
            name: formData.get('workflow-name'),
            type: formData.get('workflow-type'),
            executionStrategy: formData.get('execution-strategy'),
            maxLatency: formData.get('max-latency'),
            priority: formData.get('priority'),
            enableFailover: document.getElementById('enable-failover').checked
        };

        this.createWorkflow(workflowData);
        this.hideModal();
        document.getElementById('workflow-form').reset();
    }

    runOptimizationAnalysis() {
        const recommendations = this.runOptimization();
        this.displayOptimizationResults(recommendations);
        this.switchView('optimization');
    }

    displayOptimizationResults(recommendations) {
        const container = document.getElementById('optimization-recommendations');
        container.innerHTML = '';

        if (recommendations.length === 0) {
            container.innerHTML = '<p>No optimization recommendations at this time.</p>';
            return;
        }

        recommendations.forEach(rec => {
            const item = document.createElement('div');
            item.className = 'recommendation-item';
            item.innerHTML = `
                <div class="recommendation-title">${rec.title}</div>
                <div class="recommendation-description">${rec.description}</div>
                <div class="recommendation-impact">${rec.impact}</div>
                <button class="btn-primary" onclick="app.applyOptimization(${JSON.stringify(rec).replace(/"/g, '&quot;')})">Apply</button>
            `;
            container.appendChild(item);
        });
    }

    resetSystem() {
        if (confirm('Are you sure you want to reset the entire edge system? This will remove all devices, workflows, and execution history.')) {
            this.devices = [];
            this.workflows = [];
            this.executions = [];
            this.metrics = {
                totalExecutions: 0,
                activeDevices: 0,
                avgLatency: 0,
                successRate: 0,
                systemThroughput: 0,
                resourceUsage: 0
            };
            this.saveToStorage();
            this.updateUI();
        }
    }

    updateRegionData(region) {
        // Simulate region-specific data updates
        const regionMultipliers = {
            'us-east': { latency: 1, devices: 1 },
            'us-west': { latency: 1.2, devices: 0.8 },
            'eu-west': { latency: 1.5, devices: 0.9 },
            'asia-pacific': { latency: 2.0, devices: 0.7 },
            'global': { latency: 1.8, devices: 0.6 }
        };

        const multiplier = regionMultipliers[region] || regionMultipliers['us-east'];

        this.devices.forEach(device => {
            device.latency = Math.round(device.latency * multiplier.latency);
        });

        this.updateUI();
    }

    // Charts and Visualization
    initializeCharts() {
        this.initializeLatencyChart();
        this.initializeExecutionChart();
        this.initializeRealtimeMetricsChart();
        this.initializeResourceAllocationChart();
    }

    initializeLatencyChart() {
        const canvas = document.getElementById('latency-chart');
        const ctx = canvas.getContext('2d');
        this.charts.latency = { canvas, ctx };
    }

    initializeExecutionChart() {
        const canvas = document.getElementById('execution-chart');
        const ctx = canvas.getContext('2d');
        this.charts.execution = { canvas, ctx };
    }

    initializeRealtimeMetricsChart() {
        const canvas = document.getElementById('realtime-metrics-chart');
        const ctx = canvas.getContext('2d');
        this.charts.realtime = { canvas, ctx };
    }

    initializeResourceAllocationChart() {
        const canvas = document.getElementById('resource-allocation-chart');
        const ctx = canvas.getContext('2d');
        this.charts.resource = { canvas, ctx };
    }

    drawLatencyChart() {
        const { ctx, canvas } = this.charts.latency;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Draw background
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim();
        ctx.fillRect(0, 0, width, height);

        // Get recent executions
        const recentExecutions = this.executions.slice(0, 20).reverse();

        if (recentExecutions.length === 0) return;

        const maxLatency = Math.max(...recentExecutions.map(e => e.latency));
        const barWidth = width / recentExecutions.length;

        recentExecutions.forEach((execution, index) => {
            const barHeight = (execution.latency / maxLatency) * (height - 40);
            const x = index * barWidth;
            const y = height - barHeight - 20;

            ctx.fillStyle = execution.success ? '#10b981' : '#ef4444';
            ctx.fillRect(x + 2, y, barWidth - 4, barHeight);

            // Draw value
            if (barHeight > 20) {
                ctx.fillStyle = '#ffffff';
                ctx.font = '10px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(`${execution.latency}ms`, x + barWidth / 2, y + barHeight / 2 + 3);
            }
        });
    }

    drawExecutionChart() {
        const { ctx, canvas } = this.charts.execution;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Draw background
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim();
        ctx.fillRect(0, 0, width, height);

        // Simulate execution load over time
        const dataPoints = 30;
        const points = [];

        for (let i = 0; i < dataPoints; i++) {
            points.push({
                x: (i / (dataPoints - 1)) * width,
                y: height - 20 - (Math.sin(i * 0.5) * 0.5 + 0.5) * (height - 40) * (0.3 + Math.random() * 0.7)
            });
        }

        // Draw line
        ctx.strokeStyle = '#00d4aa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        ctx.stroke();

        // Fill area
        ctx.lineTo(width, height - 20);
        ctx.lineTo(0, height - 20);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 212, 170, 0.1)';
        ctx.fill();
    }

    drawRealtimeMetricsChart() {
        const { ctx, canvas } = this.charts.realtime;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Draw background
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim();
        ctx.fillRect(0, 0, width, height);

        // Draw grid
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 10; i++) {
            const y = (i / 10) * (height - 40) + 20;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw metrics lines
        const metrics = ['cpu', 'memory', 'network'];
        const colors = ['#ef4444', '#f59e0b', '#10b981'];

        metrics.forEach((metric, index) => {
            if (this.devices.length === 0) return;

            const avgValue = this.devices.reduce((sum, d) => sum + d.metrics[metric], 0) / this.devices.length;
            const y = height - 20 - (avgValue / 100) * (height - 40);

            ctx.strokeStyle = colors[index];
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(20, y);
            ctx.lineTo(width - 20, y);
            ctx.stroke();

            // Label
            ctx.fillStyle = colors[index];
            ctx.font = '12px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(`${metric.toUpperCase()}: ${avgValue.toFixed(1)}%`, 20, y - 5);
        });
    }

    drawResourceAllocationChart() {
        const { ctx, canvas } = this.charts.resource;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Draw background
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim();
        ctx.fillRect(0, 0, width, height);

        if (this.devices.length === 0) {
            ctx.fillStyle = '#64748b';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('No devices available', width / 2, height / 2);
            return;
        }

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;

        // Draw pie chart for resource allocation
        let startAngle = 0;
        const colors = ['#00d4aa', '#2563eb', '#f59e0b', '#ef4444', '#10b981'];

        this.devices.forEach((device, index) => {
            const sliceAngle = (2 * Math.PI) / this.devices.length;
            const endAngle = startAngle + sliceAngle;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();

            // Label
            const labelAngle = startAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 30);

            ctx.fillStyle = '#1e293b';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(device.name, labelX, labelY);

            startAngle = endAngle;
        });
    }

    // Simulation
    startSimulation() {
        // Update device metrics every 5 seconds
        this.intervals.metrics = setInterval(() => {
            this.updateDeviceMetrics();
            this.updateMetrics();
            this.updateUI();
        }, 5000);

        // Run random executions
        this.intervals.executions = setInterval(() => {
            if (this.workflows.length > 0 && Math.random() < 0.3) {
                const randomWorkflow = this.workflows[Math.floor(Math.random() * this.workflows.length)];
                this.executeWorkflow(randomWorkflow.id);
            }
        }, 10000);

        // Update charts
        this.intervals.charts = setInterval(() => {
            this.drawLatencyChart();
            this.drawExecutionChart();
            this.drawRealtimeMetricsChart();
            this.drawResourceAllocationChart();
        }, 2000);

        // Auto optimization
        this.intervals.optimization = setInterval(() => {
            if (this.autoOptimization) {
                const recommendations = this.runOptimization();
                if (recommendations.length > 0) {
                    this.applyOptimization(recommendations[0]);
                }
            }
        }, 30000);
    }

    stopSimulation() {
        Object.values(this.intervals).forEach(interval => {
            clearInterval(interval);
        });
    }

    // UI Updates
    updateUI() {
        this.updateSidebarMetrics();
        this.updateDashboard();
        this.updateDevicesView();
        this.updateWorkflowsView();
        this.updateMonitoringView();
        this.updateExecutionCanvas();
    }

    updateSidebarMetrics() {
        document.getElementById('active-devices').textContent = this.metrics.activeDevices;
        document.getElementById('total-executions').textContent = this.metrics.totalExecutions;
        document.getElementById('avg-latency').textContent = `${this.metrics.avgLatency.toFixed(0)}ms`;
    }

    updateDashboard() {
        document.getElementById('system-throughput').textContent = `${this.metrics.systemThroughput} req/s`;
        document.getElementById('success-rate').textContent = `${this.metrics.successRate.toFixed(1)}%`;
        document.getElementById('resource-usage').textContent = `${this.metrics.resourceUsage.toFixed(1)}%`;

        document.getElementById('edge-nodes').textContent = this.devices.filter(d => d.type.includes('edge')).length;
        document.getElementById('cloud-nodes').textContent = 1; // Simulated cloud node
        document.getElementById('hybrid-ratio').textContent = `${this.devices.length}:1`;

        this.updateExecutionsList();
    }

    updateExecutionsList() {
        const container = document.getElementById('executions-list');
        container.innerHTML = '';

        this.executions.slice(0, 10).forEach(execution => {
            const item = document.createElement('div');
            item.className = 'execution-item';

            const workflow = this.workflows.find(w => w.id === execution.workflowId);
            const device = this.devices.find(d => d.id === execution.deviceId) || { name: 'Cloud Node' };

            item.innerHTML = `
                <div class="execution-info">
                    <div class="execution-id">${execution.id.slice(-8)}</div>
                    <div class="execution-details">
                        ${workflow?.name || 'Unknown'} • ${device.name} • ${execution.latency}ms
                    </div>
                </div>
                <div class="execution-status status-${execution.status}">
                    ${execution.status}
                </div>
            `;

            container.appendChild(item);
        });
    }

    updateDevicesView() {
        const container = document.getElementById('devices-grid');
        container.innerHTML = '';

        this.devices.forEach(device => {
            const card = document.createElement('div');
            card.className = 'device-card';
            card.onclick = () => this.showDeviceDetails(device);

            card.innerHTML = `
                <div class="device-header">
                    <div class="device-name">${device.name}</div>
                    <div class="device-status status-${device.status}">${device.status}</div>
                </div>
                <div class="device-metrics">
                    <div class="device-metric">
                        <div class="metric-label">CPU</div>
                        <div class="metric-value">${device.metrics.cpu.toFixed(1)}%</div>
                    </div>
                    <div class="device-metric">
                        <div class="metric-label">Memory</div>
                        <div class="metric-value">${device.metrics.memory.toFixed(1)}%</div>
                    </div>
                    <div class="device-metric">
                        <div class="metric-label">Network</div>
                        <div class="metric-value">${device.metrics.network.toFixed(1)}%</div>
                    </div>
                    <div class="device-metric">
                        <div class="metric-label">Executions</div>
                        <div class="metric-value">${device.metrics.executions}</div>
                    </div>
                </div>
                <div class="device-capabilities">
                    ${device.capabilities.map(cap => `<span class="capability-tag">${cap}</span>`).join('')}
                </div>
            `;

            container.appendChild(card);
        });
    }

    updateWorkflowsView() {
        const container = document.getElementById('workflows-container');
        container.innerHTML = '';

        this.workflows.forEach(workflow => {
            const card = document.createElement('div');
            card.className = 'workflow-card';

            card.innerHTML = `
                <div class="workflow-header">
                    <div class="workflow-name">${workflow.name}</div>
                    <div class="workflow-type">${workflow.type.replace('-', ' ')}</div>
                </div>
                <div class="workflow-stats">
                    <div class="workflow-stat">
                        <div class="stat-label">Executions</div>
                        <div class="stat-value">${workflow.executions}</div>
                    </div>
                    <div class="workflow-stat">
                        <div class="stat-label">Avg Time</div>
                        <div class="stat-value">${workflow.avgExecutionTime.toFixed(0)}ms</div>
                    </div>
                    <div class="workflow-stat">
                        <div class="stat-label">Success Rate</div>
                        <div class="stat-value">${workflow.successRate}%</div>
                    </div>
                    <div class="workflow-stat">
                        <div class="stat-label">Status</div>
                        <div class="stat-value">${workflow.status}</div>
                    </div>
                </div>
                <div class="workflow-actions">
                    <button class="workflow-btn btn-run" onclick="app.executeWorkflow('${workflow.id}')">Run</button>
                    <button class="workflow-btn btn-edit" onclick="app.editWorkflow('${workflow.id}')">Edit</button>
                </div>
            `;

            container.appendChild(card);
        });
    }

    updateMonitoringView() {
        const container = document.getElementById('device-health-list');
        container.innerHTML = '';

        this.devices.forEach(device => {
            const health = this.getDeviceHealth(device);
            const item = document.createElement('div');
            item.className = 'health-item';

            item.innerHTML = `
                <div class="health-device">${device.name}</div>
                <div class="health-status health-${health.level}">${health.status}</div>
            `;

            container.appendChild(item);
        });
    }

    getDeviceHealth(device) {
        const avgLoad = (device.metrics.cpu + device.metrics.memory + device.metrics.network) / 3;

        if (avgLoad < 50) return { status: 'Healthy', level: 'healthy' };
        if (avgLoad < 80) return { status: 'Warning', level: 'warning' };
        return { status: 'Critical', level: 'critical' };
    }

    updateExecutionCanvas() {
        const canvas = document.getElementById('execution-canvas');
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Draw background
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim();
        ctx.fillRect(0, 0, width, height);

        // Draw devices
        const deviceSpacing = width / (this.devices.length + 1);
        this.devices.forEach((device, index) => {
            const x = deviceSpacing * (index + 1);
            const y = height / 2;

            // Draw device node
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, 2 * Math.PI);
            ctx.fillStyle = device.status === 'online' ? '#00d4aa' : '#ef4444';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw device label
            ctx.fillStyle = '#1e293b';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(device.name, x, y + 50);

            // Draw metrics
            ctx.fillText(`${device.metrics.cpu.toFixed(0)}% CPU`, x, y + 65);
        });

        // Draw cloud node
        ctx.beginPath();
        ctx.arc(width / 2, 80, 25, 0, 2 * Math.PI);
        ctx.fillStyle = '#2563eb';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#1e293b';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Cloud', width / 2, 110);

        // Draw execution flows
        this.drawExecutionFlows(ctx, width, height);
    }

    drawExecutionFlows(ctx, width, height) {
        const recentExecutions = this.executions.slice(0, 5);

        recentExecutions.forEach((execution, index) => {
            const device = this.devices.find(d => d.id === execution.deviceId);
            if (!device) return;

            const deviceIndex = this.devices.indexOf(device);
            const deviceSpacing = width / (this.devices.length + 1);
            const startX = deviceSpacing * (deviceIndex + 1);
            const startY = height / 2;

            // Draw flow to cloud or back
            ctx.strokeStyle = execution.success ? '#10b981' : '#ef4444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(startX, startY);

            // Curved line to cloud
            const cp1x = startX;
            const cp1y = startY - 50;
            const cp2x = width / 2;
            const cp2y = 80 + 30;

            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, width / 2, 80);
            ctx.stroke();

            // Draw arrow
            const angle = Math.atan2(80 - cp1y, width / 2 - cp1x);
            const arrowX = width / 2 - 25 * Math.cos(angle);
            const arrowY = 80 - 25 * Math.sin(angle);

            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(arrowX - 10 * Math.cos(angle - Math.PI / 6), arrowY + 10 * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(arrowX - 10 * Math.cos(angle + Math.PI / 6), arrowY + 10 * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fillStyle = execution.success ? '#10b981' : '#ef4444';
            ctx.fill();
        });
    }

    showDeviceDetails(device) {
        const modal = document.getElementById('device-details-modal');
        document.getElementById('device-details-title').textContent = device.name;

        // Populate metrics
        const metricsContainer = document.getElementById('device-metrics');
        metricsContainer.innerHTML = `
            <div class="metric-item">
                <span>Status:</span>
                <span class="status-${device.status}">${device.status}</span>
            </div>
            <div class="metric-item">
                <span>CPU Usage:</span>
                <span>${device.metrics.cpu.toFixed(1)}%</span>
            </div>
            <div class="metric-item">
                <span>Memory Usage:</span>
                <span>${device.metrics.memory.toFixed(1)}%</span>
            </div>
            <div class="metric-item">
                <span>Network Usage:</span>
                <span>${device.metrics.network.toFixed(1)}%</span>
            </div>
            <div class="metric-item">
                <span>Total Executions:</span>
                <span>${device.metrics.executions}</span>
            </div>
        `;

        // Populate history
        const historyContainer = document.getElementById('device-history');
        historyContainer.innerHTML = device.history.slice(-10).map(entry => `
            <div class="history-item">
                <span>${new Date(entry.timestamp).toLocaleTimeString()}</span>
                <span>CPU: ${entry.cpu.toFixed(1)}% | Mem: ${entry.memory.toFixed(1)}% | Net: ${entry.network.toFixed(1)}%</span>
            </div>
        `).join('');

        // Populate config
        const configContainer = document.getElementById('device-config');
        configContainer.innerHTML = `
            <div class="config-item">
                <span>Type:</span>
                <span>${device.type}</span>
            </div>
            <div class="config-item">
                <span>Location:</span>
                <span>${device.location}</span>
            </div>
            <div class="config-item">
                <span>Capabilities:</span>
                <span>${device.capabilities.join(', ')}</span>
            </div>
            <div class="config-item">
                <span>Network Latency:</span>
                <span>${device.latency}ms</span>
            </div>
            <div class="config-item">
                <span>Bandwidth:</span>
                <span>${device.bandwidth} Mbps</span>
            </div>
        `;

        this.showModal('device-details-modal');
    }

    // Storage
    saveToStorage() {
        const data = {
            devices: this.devices,
            workflows: this.workflows,
            executions: this.executions.slice(0, 100), // Keep only recent executions
            settings: {
                executionMode: this.executionMode,
                loadBalancing: this.loadBalancing,
                faultTolerance: this.faultTolerance,
                autoOptimization: this.autoOptimization
            }
        };

        localStorage.setItem('edge-execution-layer', JSON.stringify(data));
    }

    loadFromStorage() {
        const data = localStorage.getItem('edge-execution-layer');
        if (data) {
            const parsed = JSON.parse(data);
            this.devices = parsed.devices || [];
            this.workflows = parsed.workflows || [];
            this.executions = parsed.executions || [];

            const settings = parsed.settings || {};
            this.executionMode = settings.executionMode || 'edge-first';
            this.loadBalancing = settings.loadBalancing || 'round-robin';
            this.faultTolerance = settings.faultTolerance || true;
            this.autoOptimization = settings.autoOptimization || true;
        }

        // Load theme
        const theme = localStorage.getItem('edge-theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        document.getElementById('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙';

        // Set form values
        document.getElementById('execution-mode').value = this.executionMode;
        document.getElementById('load-balancing').value = this.loadBalancing;
        document.getElementById('fault-tolerance').checked = this.faultTolerance;
        document.getElementById('auto-optimization').checked = this.autoOptimization;
    }

    // Utility
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application
const app = new EdgeExecutionAbstractionLayer();