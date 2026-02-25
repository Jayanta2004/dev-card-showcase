// Intelligent Resource Elasticity Manager - JavaScript

class ResourceElasticityManager {
    constructor() {
        this.resources = [];
        this.policies = [];
        this.metrics = {
            cpu: [],
            memory: [],
            network: [],
            storage: []
        };
        this.alerts = [];
        this.scalingEvents = [];
        this.isSimulating = false;
        this.simulationInterval = null;
        this.monitoringInterval = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
        this.startMonitoring();
        this.updateUI();
        this.initializeCharts();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.sidebar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Modals
        document.getElementById('add-resource-modal-btn').addEventListener('click', () => {
            this.showModal('add-resource-modal');
        });

        document.getElementById('add-policy-modal-btn').addEventListener('click', () => {
            this.showModal('add-policy-modal');
        });

        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideAllModals();
            });
        });

        // Forms
        document.getElementById('save-resource').addEventListener('click', () => {
            this.saveResource();
        });

        document.getElementById('save-policy').addEventListener('click', () => {
            this.savePolicy();
        });

        // Simulation controls
        document.getElementById('start-load-test').addEventListener('click', () => {
            this.startSimulation();
        });

        document.getElementById('stop-load-test').addEventListener('click', () => {
            this.stopSimulation();
        });

        document.getElementById('reset-simulation').addEventListener('click', () => {
            this.resetSimulation();
        });

        // Other controls
        document.getElementById('refresh-dashboard').addEventListener('click', () => {
            this.refreshDashboard();
        });

        document.getElementById('reset-system-btn').addEventListener('click', () => {
            this.resetSystem();
        });

        // Range inputs
        document.getElementById('concurrent-users').addEventListener('input', (e) => {
            document.getElementById('concurrent-users-value').textContent = e.target.value;
        });

        document.getElementById('request-rate').addEventListener('input', (e) => {
            document.getElementById('request-rate-value').textContent = e.target.value;
        });

        document.getElementById('test-duration').addEventListener('input', (e) => {
            document.getElementById('test-duration-value').textContent = e.target.value;
        });
    }

    switchView(viewName) {
        // Update active button
        document.querySelectorAll('.sidebar-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        // Show selected view
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewName}-view`).classList.add('active');

        // Update view-specific content
        if (viewName === 'resources') {
            this.renderResources();
        } else if (viewName === 'scaling') {
            this.renderPolicies();
        } else if (viewName === 'monitoring') {
            this.renderAlerts();
        }
    }

    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);

        const themeBtn = document.getElementById('theme-toggle');
        themeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';

        localStorage.setItem('theme', newTheme);
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    saveResource() {
        const form = document.getElementById('resource-form');
        const resource = {
            id: Date.now().toString(),
            name: document.getElementById('resource-name').value,
            type: document.getElementById('resource-type').value,
            minInstances: parseInt(document.getElementById('min-instances').value),
            maxInstances: parseInt(document.getElementById('max-instances').value),
            currentInstances: parseInt(document.getElementById('min-instances').value),
            cpuThreshold: parseInt(document.getElementById('cpu-threshold').value),
            memoryThreshold: parseInt(document.getElementById('memory-threshold').value),
            metrics: {
                cpu: 0,
                memory: 0,
                network: 0,
                storage: 0
            },
            status: 'healthy',
            created: new Date().toISOString()
        };

        this.resources.push(resource);
        this.saveData();
        this.updateUI();
        this.hideAllModals();
        form.reset();
    }

    savePolicy() {
        const form = document.getElementById('policy-form');
        const policy = {
            id: Date.now().toString(),
            name: document.getElementById('policy-name').value,
            type: document.getElementById('policy-type').value,
            scaleUpThreshold: parseInt(document.getElementById('scale-up-threshold').value),
            scaleDownThreshold: parseInt(document.getElementById('scale-down-threshold').value),
            cooldownPeriod: parseInt(document.getElementById('cooldown-period').value),
            adjustmentType: document.getElementById('adjustment-type').value,
            adjustmentValue: parseInt(document.getElementById('adjustment-value').value),
            lastScaling: null,
            enabled: true,
            created: new Date().toISOString()
        };

        this.policies.push(policy);
        this.saveData();
        this.renderPolicies();
        this.hideAllModals();
        form.reset();
    }

    renderResources() {
        const container = document.getElementById('resources-grid');
        container.innerHTML = '';

        this.resources.forEach(resource => {
            const card = document.createElement('div');
            card.className = 'resource-card';
            card.onclick = () => this.showResourceDetails(resource);

            card.innerHTML = `
                <div class="resource-header">
                    <div>
                        <div class="resource-title">${resource.name}</div>
                        <div class="resource-type">${resource.type}</div>
                    </div>
                    <div class="resource-status-indicator ${resource.status}"></div>
                </div>
                <div class="resource-metrics">
                    <div class="resource-metric">
                        <div class="resource-metric-label">CPU</div>
                        <div class="resource-metric-value">${resource.metrics.cpu}%</div>
                    </div>
                    <div class="resource-metric">
                        <div class="resource-metric-label">Memory</div>
                        <div class="resource-metric-value">${resource.metrics.memory}%</div>
                    </div>
                    <div class="resource-metric">
                        <div class="resource-metric-label">Instances</div>
                        <div class="resource-metric-value">${resource.currentInstances}</div>
                    </div>
                    <div class="resource-metric">
                        <div class="resource-metric-label">Network</div>
                        <div class="resource-metric-value">${resource.metrics.network} MB/s</div>
                    </div>
                </div>
                <div class="resource-status">
                    <span>Status: ${resource.status}</span>
                    <span>${resource.currentInstances}/${resource.maxInstances} instances</span>
                </div>
            `;

            container.appendChild(card);
        });
    }

    renderPolicies() {
        const container = document.getElementById('policies-container');
        container.innerHTML = '';

        this.policies.forEach(policy => {
            const card = document.createElement('div');
            card.className = 'policy-card';

            card.innerHTML = `
                <div class="policy-header">
                    <div>
                        <div class="policy-title">${policy.name}</div>
                        <div class="policy-type">${policy.type}</div>
                    </div>
                    <div class="policy-status">
                        <span class="${policy.enabled ? 'enabled' : 'disabled'}">
                            ${policy.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>
                </div>
                <div class="policy-details">
                    <div class="policy-detail">
                        <div class="policy-detail-label">Scale Up Threshold</div>
                        <div class="policy-detail-value">${policy.scaleUpThreshold}%</div>
                    </div>
                    <div class="policy-detail">
                        <div class="policy-detail-label">Scale Down Threshold</div>
                        <div class="policy-detail-value">${policy.scaleDownThreshold}%</div>
                    </div>
                    <div class="policy-detail">
                        <div class="policy-detail-label">Cooldown</div>
                        <div class="policy-detail-value">${policy.cooldownPeriod}s</div>
                    </div>
                    <div class="policy-detail">
                        <div class="policy-detail-label">Adjustment</div>
                        <div class="policy-detail-value">${policy.adjustmentValue}${policy.adjustmentType === 'percent' ? '%' : ''}</div>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    }

    renderAlerts() {
        const container = document.getElementById('alerts-list');
        container.innerHTML = '';

        this.alerts.slice(-20).reverse().forEach(alert => {
            const item = document.createElement('div');
            item.className = 'alert-item';

            item.innerHTML = `
                <div class="alert-severity ${alert.severity}"></div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-description">${alert.description}</div>
                </div>
                <div class="alert-time">${this.formatTime(alert.timestamp)}</div>
            `;

            container.appendChild(item);
        });
    }

    showResourceDetails(resource) {
        document.getElementById('resource-details-title').textContent = `${resource.name} Details`;

        // Populate metrics
        const metricsContainer = document.getElementById('resource-metrics');
        metricsContainer.innerHTML = `
            <div>CPU Usage: ${resource.metrics.cpu}%</div>
            <div>Memory Usage: ${resource.metrics.memory}%</div>
            <div>Network I/O: ${resource.metrics.network} MB/s</div>
            <div>Storage I/O: ${resource.metrics.storage} MB/s</div>
            <div>Active Instances: ${resource.currentInstances}</div>
        `;

        // Populate history
        const historyContainer = document.getElementById('resource-history');
        const resourceEvents = this.scalingEvents.filter(e => e.resourceId === resource.id);
        historyContainer.innerHTML = resourceEvents.slice(-10).reverse().map(event =>
            `<div>${this.formatTime(event.timestamp)}: ${event.action} (${event.reason})</div>`
        ).join('');

        // Populate config
        const configContainer = document.getElementById('resource-config');
        configContainer.innerHTML = `
            <div>Type: ${resource.type}</div>
            <div>Min Instances: ${resource.minInstances}</div>
            <div>Max Instances: ${resource.maxInstances}</div>
            <div>CPU Threshold: ${resource.cpuThreshold}%</div>
            <div>Memory Threshold: ${resource.memoryThreshold}%</div>
        `;

        this.showModal('resource-details-modal');
    }

    startMonitoring() {
        this.monitoringInterval = setInterval(() => {
            this.updateMetrics();
            this.checkScalingPolicies();
            this.updateCharts();
            this.updateUI();
        }, 2000); // Update every 2 seconds
    }

    updateMetrics() {
        // Simulate metric updates
        this.resources.forEach(resource => {
            // Add some randomness to simulate real usage
            const baseLoad = this.isSimulating ? Math.random() * 0.8 + 0.2 : Math.random() * 0.4;
            const variation = (Math.random() - 0.5) * 0.2;

            resource.metrics.cpu = Math.max(0, Math.min(100, Math.round((baseLoad + variation) * 100)));
            resource.metrics.memory = Math.max(0, Math.min(100, Math.round((baseLoad + variation * 0.8) * 100)));
            resource.metrics.network = Math.max(0, Math.min(1000, Math.round((baseLoad + variation) * 500)));
            resource.metrics.storage = Math.max(0, Math.min(1000, Math.round((baseLoad + variation * 0.6) * 300)));

            // Update status based on thresholds
            if (resource.metrics.cpu > resource.cpuThreshold || resource.metrics.memory > resource.memoryThreshold) {
                resource.status = 'warning';
            } else if (resource.metrics.cpu > 90 || resource.metrics.memory > 90) {
                resource.status = 'error';
            } else {
                resource.status = 'healthy';
            }
        });

        // Update global metrics
        this.updateGlobalMetrics();
    }

    updateGlobalMetrics() {
        if (this.resources.length === 0) return;

        const avgCpu = Math.round(this.resources.reduce((sum, r) => sum + r.metrics.cpu, 0) / this.resources.length);
        const avgMemory = Math.round(this.resources.reduce((sum, r) => sum + r.metrics.memory, 0) / this.resources.length);
        const totalNetwork = this.resources.reduce((sum, r) => sum + r.metrics.network, 0);
        const totalStorage = this.resources.reduce((sum, r) => sum + r.metrics.storage, 0);

        // Update metric displays
        document.getElementById('cpu-utilization').textContent = `${avgCpu}%`;
        document.getElementById('memory-usage').textContent = `${avgMemory}%`;
        document.getElementById('network-io').textContent = `${totalNetwork.toFixed(1)} MB/s`;
        document.getElementById('storage-io').textContent = `${totalStorage.toFixed(1)} MB/s`;

        // Store metrics for charts
        const timestamp = Date.now();
        this.metrics.cpu.push({ time: timestamp, value: avgCpu });
        this.metrics.memory.push({ time: timestamp, value: avgMemory });
        this.metrics.network.push({ time: timestamp, value: totalNetwork });
        this.metrics.storage.push({ time: timestamp, value: totalStorage });

        // Keep only last 50 data points
        Object.keys(this.metrics).forEach(key => {
            if (this.metrics[key].length > 50) {
                this.metrics[key] = this.metrics[key].slice(-50);
            }
        });
    }

    checkScalingPolicies() {
        this.policies.forEach(policy => {
            if (!policy.enabled) return;

            // Check cooldown period
            if (policy.lastScaling && Date.now() - policy.lastScaling < policy.cooldownPeriod * 1000) {
                return;
            }

            this.resources.forEach(resource => {
                let shouldScale = false;
                let scaleDirection = '';
                let reason = '';

                switch (policy.type) {
                    case 'cpu-based':
                        if (resource.metrics.cpu > policy.scaleUpThreshold) {
                            shouldScale = true;
                            scaleDirection = 'up';
                            reason = `CPU usage ${resource.metrics.cpu}% > ${policy.scaleUpThreshold}%`;
                        } else if (resource.metrics.cpu < policy.scaleDownThreshold && resource.currentInstances > resource.minInstances) {
                            shouldScale = true;
                            scaleDirection = 'down';
                            reason = `CPU usage ${resource.metrics.cpu}% < ${policy.scaleDownThreshold}%`;
                        }
                        break;

                    case 'memory-based':
                        if (resource.metrics.memory > policy.scaleUpThreshold) {
                            shouldScale = true;
                            scaleDirection = 'up';
                            reason = `Memory usage ${resource.metrics.memory}% > ${policy.scaleUpThreshold}%`;
                        } else if (resource.metrics.memory < policy.scaleDownThreshold && resource.currentInstances > resource.minInstances) {
                            shouldScale = true;
                            scaleDirection = 'down';
                            reason = `Memory usage ${resource.metrics.memory}% < ${policy.scaleDownThreshold}%`;
                        }
                        break;
                }

                if (shouldScale) {
                    this.performScaling(resource, scaleDirection, policy.adjustmentType, policy.adjustmentValue, reason);
                    policy.lastScaling = Date.now();
                }
            });
        });
    }

    performScaling(resource, direction, adjustmentType, adjustmentValue, reason) {
        const oldInstances = resource.currentInstances;
        let newInstances = oldInstances;

        if (direction === 'up') {
            if (adjustmentType === 'percent') {
                newInstances = Math.min(resource.maxInstances, Math.ceil(oldInstances * (1 + adjustmentValue / 100)));
            } else {
                newInstances = Math.min(resource.maxInstances, oldInstances + adjustmentValue);
            }
        } else {
            if (adjustmentType === 'percent') {
                newInstances = Math.max(resource.minInstances, Math.floor(oldInstances * (1 - adjustmentValue / 100)));
            } else {
                newInstances = Math.max(resource.minInstances, oldInstances - adjustmentValue);
            }
        }

        if (newInstances !== oldInstances) {
            resource.currentInstances = newInstances;

            // Log scaling event
            const event = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                resourceId: resource.id,
                resourceName: resource.name,
                action: direction === 'up' ? 'Scale Up' : 'Scale Down',
                oldInstances: oldInstances,
                newInstances: newInstances,
                reason: reason,
                policy: 'Auto-scaling'
            };

            this.scalingEvents.push(event);

            // Add to dashboard events
            this.addDashboardEvent(event);

            // Create alert
            this.addAlert(
                direction === 'up' ? 'warning' : 'info',
                `Resource Scaled ${direction === 'up' ? 'Up' : 'Down'}`,
                `${resource.name}: ${oldInstances} → ${newInstances} instances (${reason})`
            );
        }
    }

    addDashboardEvent(event) {
        const eventsList = document.querySelector('.events-list');
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';

        eventItem.innerHTML = `
            <span class="event-time">${this.formatTime(event.timestamp)}</span>
            <span class="event-type ${event.action.toLowerCase().replace(' ', '-')}">${event.action}</span>
            <span class="event-resource">${event.resourceName}</span>
            <span class="event-details">${event.oldInstances} → ${event.newInstances} instances</span>
        `;

        eventsList.insertBefore(eventItem, eventsList.firstChild);

        // Keep only last 10 events in UI
        while (eventsList.children.length > 10) {
            eventsList.removeChild(eventsList.lastChild);
        }
    }

    addAlert(severity, title, description) {
        const alert = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            severity: severity,
            title: title,
            description: description
        };

        this.alerts.push(alert);
        this.renderAlerts();
    }

    startSimulation() {
        if (this.isSimulating) return;

        this.isSimulating = true;
        document.getElementById('start-load-test').disabled = true;
        document.getElementById('stop-load-test').disabled = false;

        const duration = parseInt(document.getElementById('test-duration').value) * 60 * 1000; // Convert to milliseconds
        const endTime = Date.now() + duration;

        this.simulationInterval = setInterval(() => {
            if (Date.now() >= endTime) {
                this.stopSimulation();
                return;
            }

            // Simulate load spikes
            this.simulateLoadSpike();
        }, 5000); // Load changes every 5 seconds

        this.addAlert('info', 'Load Test Started', `Simulation running for ${document.getElementById('test-duration').value} minutes`);
    }

    stopSimulation() {
        this.isSimulating = false;
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }

        document.getElementById('start-load-test').disabled = false;
        document.getElementById('stop-load-test').disabled = true;

        this.addAlert('info', 'Load Test Stopped', 'Simulation has been stopped');
    }

    resetSimulation() {
        this.stopSimulation();
        this.metrics = {
            cpu: [],
            memory: [],
            network: [],
            storage: []
        };
        this.alerts = [];
        this.scalingEvents = [];
        this.updateUI();
        this.initializeCharts();

        this.addAlert('info', 'Simulation Reset', 'All metrics and events have been cleared');
    }

    simulateLoadSpike() {
        const spikeIntensity = Math.random();
        const concurrentUsers = parseInt(document.getElementById('concurrent-users').value);
        const requestRate = parseInt(document.getElementById('request-rate').value);

        // Simulate increased load based on configuration
        const loadMultiplier = 1 + (spikeIntensity * 0.5) + (concurrentUsers / 1000) + (requestRate / 1000);

        this.resources.forEach(resource => {
            resource.metrics.cpu = Math.min(100, Math.round(resource.metrics.cpu * loadMultiplier));
            resource.metrics.memory = Math.min(100, Math.round(resource.metrics.memory * loadMultiplier));
            resource.metrics.network = Math.min(1000, Math.round(resource.metrics.network * loadMultiplier));
            resource.metrics.storage = Math.min(1000, Math.round(resource.metrics.storage * loadMultiplier));
        });
    }

    initializeCharts() {
        this.drawChart('cpu-chart', this.metrics.cpu, '#2563eb');
        this.drawChart('memory-chart', this.metrics.memory, '#10b981');
        this.drawChart('network-chart', this.metrics.network, '#f59e0b');
        this.drawChart('storage-chart', this.metrics.storage, '#ef4444');
    }

    updateCharts() {
        this.drawChart('cpu-chart', this.metrics.cpu, '#2563eb');
        this.drawChart('memory-chart', this.metrics.memory, '#10b981');
        this.drawChart('network-chart', this.metrics.network, '#f59e0b');
        this.drawChart('storage-chart', this.metrics.storage, '#ef4444');

        // Update resource allocation chart
        this.drawResourceAllocationChart();
    }

    drawChart(canvasId, data, color) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        if (data.length < 2) return;

        // Draw line
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        const maxValue = Math.max(...data.map(d => d.value));
        const minValue = Math.min(...data.map(d => d.value));
        const range = maxValue - minValue || 1;

        data.forEach((point, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((point.value - minValue) / range) * height;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Fill area under line
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = color + '20';
        ctx.fill();
    }

    drawResourceAllocationChart() {
        const canvas = document.getElementById('resource-allocation-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        if (this.resources.length === 0) return;

        const totalInstances = this.resources.reduce((sum, r) => sum + r.currentInstances, 0);
        let startAngle = 0;

        this.resources.forEach((resource, index) => {
            const sliceAngle = (resource.currentInstances / totalInstances) * 2 * Math.PI;

            ctx.beginPath();
            ctx.moveTo(width / 2, height / 2);
            ctx.arc(width / 2, height / 2, Math.min(width, height) / 3, startAngle, startAngle + sliceAngle);
            ctx.closePath();

            const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();

            startAngle += sliceAngle;
        });
    }

    updateUI() {
        // Update system status
        const healthyResources = this.resources.filter(r => r.status === 'healthy').length;
        const totalResources = this.resources.length;
        const systemStatus = totalResources === 0 ? 'initializing' :
                           healthyResources === totalResources ? 'healthy' :
                           healthyResources > totalResources / 2 ? 'warning' : 'error';

        const statusDot = document.getElementById('system-status');
        statusDot.className = `status-dot ${systemStatus}`;

        const statusText = document.getElementById('system-status-text');
        statusText.textContent = systemStatus.charAt(0).toUpperCase() + systemStatus.slice(1);

        // Update summary
        document.getElementById('active-resources').textContent = totalResources;
        const totalCapacity = totalResources > 0 ?
            Math.round(this.resources.reduce((sum, r) => sum + r.metrics.cpu, 0) / totalResources) : 0;
        document.getElementById('total-capacity').textContent = `${totalCapacity}%`;
    }

    refreshDashboard() {
        this.updateMetrics();
        this.updateCharts();
        this.updateUI();
    }

    resetSystem() {
        if (confirm('Are you sure you want to reset the entire system? This will remove all resources, policies, and data.')) {
            this.resources = [];
            this.policies = [];
            this.metrics = {
                cpu: [],
                memory: [],
                network: [],
                storage: []
            };
            this.alerts = [];
            this.scalingEvents = [];
            this.saveData();
            this.updateUI();
            this.initializeCharts();
            this.switchView('dashboard');
        }
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    loadData() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        document.getElementById('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙';

        const savedData = localStorage.getItem('resourceElasticityData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.resources = data.resources || [];
            this.policies = data.policies || [];
            this.alerts = data.alerts || [];
            this.scalingEvents = data.scalingEvents || [];
        }
    }

    saveData() {
        const data = {
            resources: this.resources,
            policies: this.policies,
            alerts: this.alerts,
            scalingEvents: this.scalingEvents
        };
        localStorage.setItem('resourceElasticityData', JSON.stringify(data));
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ResourceElasticityManager();
});