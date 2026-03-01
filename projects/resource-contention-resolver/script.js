// Resource Contention Resolver - Interactive JavaScript Implementation

class ResourceContentionResolver {
    constructor() {
        this.workloads = this.generateSampleWorkloads();
        this.systemResources = {
            cpu: { current: 45, threshold: 80, max: 100 },
            memory: { current: 67, threshold: 85, max: 100 },
            disk: { current: 23, threshold: 70, max: 100 },
            network: { current: 34, threshold: 75, max: 100 }
        };
        this.resolutionStrategies = {
            strategy: 'redistribution',
            aggression: 5,
            autoResolution: true
        };
        this.contentionHistory = [];
        this.resolutionLog = [];
        this.analyticsData = [];
        this.charts = {};
        this.intervals = {};
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.initializeCharts();
        this.updateDisplay();
        this.startRealTimeMonitoring();
    }

    generateSampleWorkloads() {
        const workloadTypes = ['web', 'database', 'api', 'batch', 'analytics', 'streaming'];
        const names = [
            'Web Server A', 'Database Primary', 'API Gateway', 'Batch Processor',
            'Analytics Engine', 'Stream Processor', 'Cache Service', 'Load Balancer'
        ];

        return names.map((name, index) => ({
            id: index + 1,
            name: name,
            type: workloadTypes[Math.floor(Math.random() * workloadTypes.length)],
            priority: Math.floor(Math.random() * 5) + 1,
            resources: {
                cpu: Math.floor(Math.random() * 30) + 10,
                memory: Math.floor(Math.random() * 40) + 20,
                disk: Math.floor(Math.random() * 20) + 5,
                network: Math.floor(Math.random() * 25) + 5
            },
            status: 'running',
            contentionLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
            lastActivity: new Date(Date.now() - Math.random() * 300000), // Within last 5 minutes
            allocatedResources: {
                cpu: 0,
                memory: 0,
                disk: 0,
                network: 0
            }
        }));
    }

    setupEventListeners() {
        // System refresh
        document.getElementById('refresh-system').addEventListener('click', () => {
            this.refreshSystemOverview();
        });

        // Add workload modal
        document.getElementById('add-workload').addEventListener('click', () => {
            this.showAddWorkloadModal();
        });

        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideAddWorkloadModal();
        });

        document.getElementById('cancel-add').addEventListener('click', () => {
            this.hideAddWorkloadModal();
        });

        document.getElementById('add-workload-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addWorkload();
        });

        // Allocation view selector
        document.getElementById('allocation-view').addEventListener('change', (e) => {
            this.updateAllocationChart(e.target.value);
        });

        // Resolution controls
        document.getElementById('resolution-strategy').addEventListener('change', (e) => {
            this.resolutionStrategies.strategy = e.target.value;
        });

        document.getElementById('aggression-level').addEventListener('input', (e) => {
            this.resolutionStrategies.aggression = parseInt(e.target.value);
            document.getElementById('aggression-value').textContent = e.target.value;
        });

        document.getElementById('auto-resolution').addEventListener('change', (e) => {
            this.resolutionStrategies.autoResolution = e.target.checked;
        });

        document.getElementById('run-resolution').addEventListener('click', () => {
            this.runResolution();
        });

        // Time range selector
        document.getElementById('time-range').addEventListener('change', (e) => {
            this.updateAnalytics(e.target.value);
        });

        // Policy sliders
        ['cpu', 'memory', 'disk', 'network'].forEach(resource => {
            const slider = document.getElementById(`${resource}-threshold-slider`);
            const value = document.getElementById(`${resource}-threshold`);

            slider.addEventListener('input', (e) => {
                const newValue = parseInt(e.target.value);
                value.textContent = `${newValue}%`;
                this.systemResources[resource].threshold = newValue;
            });
        });

        document.getElementById('save-policies').addEventListener('click', () => {
            this.savePolicies();
        });

        // Diagnostics
        document.getElementById('run-diagnostics').addEventListener('click', () => {
            this.runDiagnostics();
        });

        // History
        document.getElementById('clear-history').addEventListener('click', () => {
            this.clearHistory();
        });

        // Workload interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.workload-item')) {
                const item = e.target.closest('.workload-item');
                const workloadId = parseInt(item.dataset.id);
                this.showWorkloadDetails(workloadId);
            }
        });
    }

    initializeCharts() {
        this.initializeAllocationChart();
        this.initializePerformanceChart();
    }

    initializeAllocationChart() {
        const canvas = document.getElementById('allocation-chart');
        const ctx = canvas.getContext('2d');
        this.charts.allocation = { canvas, ctx };

        this.updateAllocationChart('cpu');
    }

    initializePerformanceChart() {
        const canvas = document.getElementById('performance-chart');
        const ctx = canvas.getContext('2d');
        this.charts.performance = { canvas, ctx };

        this.drawPerformanceChart();
    }

    updateAllocationChart(resourceType) {
        const { ctx, canvas } = this.charts.allocation;
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;

        ctx.clearRect(0, 0, width, height);

        // Calculate allocation data
        const totalAllocation = this.workloads.reduce((sum, workload) => sum + workload.resources[resourceType], 0);
        const allocations = this.workloads.map(workload => ({
            name: workload.name,
            value: workload.resources[resourceType],
            percentage: (workload.resources[resourceType] / totalAllocation) * 100
        })).sort((a, b) => b.value - a.value);

        // Draw pie chart
        let startAngle = -Math.PI / 2;
        const colors = [
            '#6366f1', '#06b6d4', '#f59e0b', '#10b981',
            '#ef4444', '#8b5cf6', '#f97316', '#06d6a0'
        ];

        allocations.forEach((allocation, index) => {
            const sliceAngle = (allocation.percentage / 100) * 2 * Math.PI;
            const endAngle = startAngle + sliceAngle;

            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();

            startAngle = endAngle;
        });

        // Update legend
        this.updateAllocationLegend(allocations, colors);
    }

    updateAllocationLegend(allocations, colors) {
        const legend = document.getElementById('allocation-legend');
        legend.innerHTML = '';

        allocations.slice(0, 6).forEach((allocation, index) => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `
                <div class="legend-color" style="background: ${colors[index % colors.length]}"></div>
                <span class="legend-label">${allocation.name}</span>
                <span class="legend-value">${allocation.percentage.toFixed(1)}%</span>
            `;
            legend.appendChild(legendItem);
        });
    }

    drawPerformanceChart() {
        const { ctx, canvas } = this.charts.performance;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Generate performance data
        const dataPoints = 20;
        const data = [];
        for (let i = 0; i < dataPoints; i++) {
            data.push({
                x: (width / (dataPoints - 1)) * i,
                y: height - (Math.random() * 0.6 + 0.2) * height // Random values between 20-80%
            });
        }

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
        ctx.moveTo(data[0].x, data[0].y);

        data.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();

        // Draw points
        ctx.fillStyle = '#6366f1';
        data.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    updateDisplay() {
        this.updateSystemMetrics();
        this.updateWorkloadsList();
        this.updateContentionStatus();
        this.updateHealthStatus();
        this.updateHistory();
        this.updateAnalytics('1h');
    }

    updateSystemMetrics() {
        Object.keys(this.systemResources).forEach(resource => {
            const data = this.systemResources[resource];
            const usageElement = document.getElementById(`${resource}-usage`);
            const fillElement = document.getElementById(`${resource}-fill`);

            usageElement.textContent = `${data.current}%`;
            fillElement.style.width = `${data.current}%`;

            // Update color based on threshold
            if (data.current >= data.threshold) {
                fillElement.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
            } else if (data.current >= data.threshold * 0.8) {
                fillElement.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
            } else {
                fillElement.style.background = this.getResourceColor(resource);
            }
        });
    }

    getResourceColor(resource) {
        const colors = {
            cpu: 'linear-gradient(90deg, #6366f1, #4f46e5)',
            memory: 'linear-gradient(90deg, #06b6d4, #0891b2)',
            disk: 'linear-gradient(90deg, #f59e0b, #d97706)',
            network: 'linear-gradient(90deg, #10b981, #059669)'
        };
        return colors[resource];
    }

    updateWorkloadsList() {
        const container = document.getElementById('workloads-container');
        container.innerHTML = '';

        this.workloads.forEach(workload => {
            const workloadElement = this.createWorkloadElement(workload);
            container.appendChild(workloadElement);
        });
    }

    createWorkloadElement(workload) {
        const workloadDiv = document.createElement('div');
        workloadDiv.className = `workload-item ${workload.contentionLevel === 'high' ? 'contending' : ''}`;
        workloadDiv.dataset.id = workload.id;

        workloadDiv.innerHTML = `
            <div class="workload-header">
                <div class="workload-name">${workload.name}</div>
                <div class="workload-meta">
                    <span class="workload-type">${workload.type}</span>
                    <span class="workload-priority">P${workload.priority}</span>
                </div>
            </div>
            <div class="workload-resources">
                <div class="resource-item">
                    <span class="resource-label">CPU:</span>
                    <span class="resource-value">${workload.resources.cpu}%</span>
                </div>
                <div class="resource-item">
                    <span class="resource-label">Memory:</span>
                    <span class="resource-value">${workload.resources.memory}%</span>
                </div>
                <div class="resource-item">
                    <span class="resource-label">Disk:</span>
                    <span class="resource-value">${workload.resources.disk}%</span>
                </div>
                <div class="resource-item">
                    <span class="resource-label">Network:</span>
                    <span class="resource-value">${workload.resources.network}%</span>
                </div>
            </div>
        `;

        return workloadDiv;
    }

    updateContentionStatus() {
        const highContention = this.workloads.filter(w => w.contentionLevel === 'high').length;
        const totalContention = this.workloads.filter(w => w.contentionLevel !== 'low').length;

        let status = 'No active contention detected';
        let statusClass = 'good';

        if (highContention > 0) {
            status = `${highContention} workload(s) experiencing high contention`;
            statusClass = 'warning';
        } else if (totalContention > 0) {
            status = `${totalContention} workload(s) with moderate contention`;
            statusClass = 'low';
        }

        const alertCard = document.getElementById('contention-alert');
        alertCard.className = `alert-card ${statusClass}`;
        document.getElementById('contention-status').textContent = status;
    }

    updateHealthStatus() {
        const overallHealth = this.calculateOverallHealth();
        const contentionRisk = this.calculateContentionRisk();
        const resourceEfficiency = this.calculateResourceEfficiency();
        const workloadBalance = this.calculateWorkloadBalance();

        document.getElementById('overall-health').className = `health-status ${overallHealth.class}`;
        document.getElementById('overall-health').innerHTML = `<i class="fas fa-${overallHealth.icon}"></i> ${overallHealth.text}`;

        document.getElementById('contention-risk').className = `health-status ${contentionRisk.class}`;
        document.getElementById('contention-risk').innerHTML = `<i class="fas fa-${contentionRisk.icon}"></i> ${contentionRisk.text}`;

        document.getElementById('resource-efficiency').className = `health-status ${resourceEfficiency.class}`;
        document.getElementById('resource-efficiency').innerHTML = `<i class="fas fa-${resourceEfficiency.icon}"></i> ${resourceEfficiency.text}`;

        document.getElementById('workload-balance').className = `health-status ${workloadBalance.class}`;
        document.getElementById('workload-balance').innerHTML = `<i class="fas fa-${workloadBalance.icon}"></i> ${workloadBalance.text}`;

        this.updateHealthRecommendations();
    }

    calculateOverallHealth() {
        const avgUtilization = Object.values(this.systemResources).reduce((sum, r) => sum + r.current, 0) / 4;
        const highContention = this.workloads.filter(w => w.contentionLevel === 'high').length;

        if (avgUtilization > 90 || highContention > 2) {
            return { text: 'Critical', class: 'critical', icon: 'exclamation-triangle' };
        } else if (avgUtilization > 75 || highContention > 0) {
            return { text: 'Warning', class: 'warning', icon: 'exclamation-circle' };
        } else if (avgUtilization > 50) {
            return { text: 'Good', class: 'good', icon: 'check-circle' };
        } else {
            return { text: 'Excellent', class: 'excellent', icon: 'star' };
        }
    }

    calculateContentionRisk() {
        const highContention = this.workloads.filter(w => w.contentionLevel === 'high').length;
        const mediumContention = this.workloads.filter(w => w.contentionLevel === 'medium').length;

        if (highContention > 0) {
            return { text: 'High', class: 'critical', icon: 'exclamation-triangle' };
        } else if (mediumContention > 2) {
            return { text: 'Medium', class: 'warning', icon: 'exclamation-circle' };
        } else {
            return { text: 'Low', class: 'good', icon: 'shield-alt' };
        }
    }

    calculateResourceEfficiency() {
        const totalAllocated = Object.values(this.systemResources).reduce((sum, r) => sum + r.current, 0);
        const totalCapacity = Object.values(this.systemResources).reduce((sum, r) => sum + r.max, 0);
        const efficiency = (totalAllocated / totalCapacity) * 100;

        if (efficiency > 85) {
            return { text: 'Excellent', class: 'excellent', icon: 'star' };
        } else if (efficiency > 70) {
            return { text: 'Good', class: 'good', icon: 'check-circle' };
        } else {
            return { text: 'Poor', class: 'warning', icon: 'minus-circle' };
        }
    }

    calculateWorkloadBalance() {
        const resourceUsage = this.workloads.map(w => w.resources);
        const avgCpu = resourceUsage.reduce((sum, r) => sum + r.cpu, 0) / resourceUsage.length;
        const variance = resourceUsage.reduce((sum, r) => sum + Math.pow(r.cpu - avgCpu, 2), 0) / resourceUsage.length;
        const stdDev = Math.sqrt(variance);

        if (stdDev < 5) {
            return { text: 'Balanced', class: 'good', icon: 'balance-scale' };
        } else if (stdDev < 10) {
            return { text: 'Moderate', class: 'warning', icon: 'balance-scale-left' };
        } else {
            return { text: 'Unbalanced', class: 'critical', icon: 'balance-scale-right' };
        }
    }

    updateHealthRecommendations() {
        const recommendations = [];

        const highContention = this.workloads.filter(w => w.contentionLevel === 'high');
        if (highContention.length > 0) {
            recommendations.push(`${highContention.length} workloads experiencing high contention - consider redistribution`);
        }

        const overUtilized = Object.entries(this.systemResources).filter(([_, r]) => r.current >= r.threshold);
        if (overUtilized.length > 0) {
            recommendations.push(`${overUtilized.length} resources over threshold - automatic throttling recommended`);
        }

        const unbalanced = this.calculateWorkloadBalance();
        if (unbalanced.text === 'Unbalanced') {
            recommendations.push('Workload distribution is unbalanced - consider resource migration');
        }

        const container = document.getElementById('health-recommendations');
        container.innerHTML = '';

        if (recommendations.length === 0) {
            container.innerHTML = `
                <div class="recommendation">
                    <i class="fas fa-lightbulb"></i>
                    <span>System operating optimally with balanced resource distribution</span>
                </div>
            `;
        } else {
            recommendations.forEach(rec => {
                const recDiv = document.createElement('div');
                recDiv.className = 'recommendation';
                recDiv.innerHTML = `
                    <i class="fas fa-lightbulb"></i>
                    <span>${rec}</span>
                `;
                container.appendChild(recDiv);
            });
        }
    }

    updateHistory() {
        const container = document.getElementById('history-timeline');
        container.innerHTML = '';

        this.contentionHistory.slice(0, 10).forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.className = `history-item ${event.type}`;
            eventDiv.innerHTML = `
                <div class="history-content">
                    <div class="history-timestamp">${event.timestamp.toLocaleTimeString()}</div>
                    <div class="history-title">${event.title}</div>
                    <div class="history-description">${event.description}</div>
                </div>
            `;
            container.appendChild(eventDiv);
        });
    }

    updateAnalytics(timeRange) {
        // Simulate analytics data
        const contentionEvents = Math.floor(Math.random() * 10) + 1;
        const resolutionSuccess = Math.floor(Math.random() * 20) + 80; // 80-100%
        const avgResponseTime = Math.floor(Math.random() * 100) + 50; // 50-150ms

        document.getElementById('contention-events').textContent = contentionEvents;
        document.getElementById('resolution-success').textContent = `${resolutionSuccess}%`;
        document.getElementById('avg-response-time').textContent = `${avgResponseTime}ms`;

        this.drawPerformanceChart();
    }

    detectContention() {
        const contentions = [];

        // Check resource thresholds
        Object.entries(this.systemResources).forEach(([resource, data]) => {
            if (data.current >= data.threshold) {
                contentions.push({
                    type: 'resource',
                    resource: resource,
                    current: data.current,
                    threshold: data.threshold,
                    severity: data.current >= data.threshold * 1.2 ? 'critical' : 'high'
                });
            }
        });

        // Check workload contention
        this.workloads.forEach(workload => {
            if (workload.contentionLevel === 'high') {
                contentions.push({
                    type: 'workload',
                    workload: workload.name,
                    resource: Object.keys(workload.resources).find(r => workload.resources[r] > 50),
                    severity: 'high'
                });
            }
        });

        return contentions;
    }

    runResolution() {
        const contentions = this.detectContention();

        if (contentions.length === 0) {
            this.showNotification('No contention detected - system is balanced', 'info');
            return;
        }

        const btn = document.getElementById('run-resolution');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resolving...';
        btn.disabled = true;

        setTimeout(() => {
            contentions.forEach(contention => {
                this.applyResolutionStrategy(contention);
            });

            this.logResolutionAction(`Applied ${this.resolutionStrategies.strategy} strategy to ${contentions.length} contention(s)`);
            this.updateDisplay();

            btn.innerHTML = originalText;
            btn.disabled = false;
            this.showNotification(`Resolution applied to ${contentions.length} contention(s)`, 'success');
        }, 2000);
    }

    applyResolutionStrategy(contention) {
        const strategy = this.resolutionStrategies.strategy;
        const aggression = this.resolutionStrategies.aggression;

        switch (strategy) {
            case 'redistribution':
                this.redistributeResources(contention, aggression);
                break;
            case 'throttling':
                this.applyThrottling(contention, aggression);
                break;
            case 'prioritization':
                this.applyPrioritization(contention, aggression);
                break;
            case 'migration':
                this.applyMigration(contention, aggression);
                break;
        }
    }

    redistributeResources(contention, aggression) {
        if (contention.type === 'resource') {
            // Reduce usage on over-utilized resource
            const reduction = Math.min(contention.current * (aggression / 100), 20);
            this.systemResources[contention.resource].current -= reduction;

            this.logResolutionAction(`Redistributed ${reduction.toFixed(1)}% from ${contention.resource} resource`);
        }
    }

    applyThrottling(contention, aggression) {
        const affectedWorkloads = this.workloads.filter(w => w.contentionLevel === 'high');
        affectedWorkloads.forEach(workload => {
            const throttleAmount = aggression * 5; // 5-50% throttling
            Object.keys(workload.resources).forEach(resource => {
                workload.resources[resource] = Math.max(0, workload.resources[resource] - throttleAmount);
            });
            workload.status = 'throttled';
        });

        this.logResolutionAction(`Applied ${aggression * 5}% throttling to ${affectedWorkloads.length} workloads`);
    }

    applyPrioritization(contention, aggression) {
        // Sort workloads by priority and adjust resource allocation
        this.workloads.sort((a, b) => a.priority - b.priority); // Lower number = higher priority

        const highPriorityWorkloads = this.workloads.slice(0, Math.ceil(this.workloads.length * (aggression / 20)));
        highPriorityWorkloads.forEach(workload => {
            Object.keys(workload.resources).forEach(resource => {
                workload.resources[resource] = Math.min(100, workload.resources[resource] * 1.1);
            });
        });

        this.logResolutionAction(`Prioritized ${highPriorityWorkloads.length} high-priority workloads`);
    }

    applyMigration(contention, aggression) {
        const overloadedWorkloads = this.workloads.filter(w => w.contentionLevel === 'high');
        const migrationCandidates = overloadedWorkloads.slice(0, Math.ceil(aggression / 2));

        migrationCandidates.forEach(workload => {
            // Simulate migration by reducing resource usage
            Object.keys(workload.resources).forEach(resource => {
                workload.resources[resource] *= 0.7; // 30% reduction
            });
            workload.status = 'migrated';
        });

        this.logResolutionAction(`Migrated ${migrationCandidates.length} workloads to reduce contention`);
    }

    logResolutionAction(message) {
        const entry = {
            timestamp: new Date(),
            message: message,
            type: 'resolve'
        };

        this.resolutionLog.unshift(entry);
        this.resolutionLog = this.resolutionLog.slice(0, 20); // Keep last 20 entries

        this.updateResolutionLog();

        // Also add to history
        this.contentionHistory.unshift({
            timestamp: new Date(),
            title: 'Resolution Applied',
            description: message,
            type: 'resolve'
        });
        this.contentionHistory = this.contentionHistory.slice(0, 50);
    }

    updateResolutionLog() {
        const container = document.getElementById('resolution-log');
        container.innerHTML = '';

        this.resolutionLog.slice(0, 8).forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'resolution-entry resolve';
            entryDiv.innerHTML = `
                <div class="resolution-timestamp">${entry.timestamp.toLocaleTimeString()}</div>
                <div class="resolution-action">${entry.message}</div>
            `;
            container.appendChild(entryDiv);
        });
    }

    showAddWorkloadModal() {
        document.getElementById('add-workload-modal').classList.add('show');
    }

    hideAddWorkloadModal() {
        document.getElementById('add-workload-modal').classList.remove('show');
        document.getElementById('add-workload-form').reset();
    }

    addWorkload() {
        const formData = new FormData(document.getElementById('add-workload-form'));
        const newWorkload = {
            id: this.workloads.length + 1,
            name: formData.get('workload-name'),
            type: formData.get('workload-type'),
            priority: parseInt(formData.get('workload-priority')),
            resources: {
                cpu: parseInt(formData.get('cpu-requirement')),
                memory: parseInt(formData.get('memory-requirement')),
                disk: parseInt(formData.get('disk-requirement')),
                network: parseInt(formData.get('network-requirement'))
            },
            status: 'running',
            contentionLevel: 'low',
            lastActivity: new Date(),
            allocatedResources: {
                cpu: 0,
                memory: 0,
                disk: 0,
                network: 0
            }
        };

        this.workloads.push(newWorkload);
        this.hideAddWorkloadModal();
        this.updateDisplay();
        this.logResolutionAction(`Added new workload: ${newWorkload.name}`);
        this.showNotification('Workload added successfully!', 'success');
    }

    showWorkloadDetails(workloadId) {
        const workload = this.workloads.find(w => w.id === workloadId);
        if (workload) {
            // Could implement a detailed view modal here
            console.log('Workload details:', workload);
        }
    }

    savePolicies() {
        // In a real implementation, this would save to a backend
        this.showNotification('Resource policies saved successfully!', 'success');
    }

    runDiagnostics() {
        const btn = document.getElementById('run-diagnostics');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
        btn.disabled = true;

        setTimeout(() => {
            // Simulate diagnostics
            const issues = Math.floor(Math.random() * 3);
            const recommendations = issues > 0 ?
                `${issues} potential issues detected - review resource allocation` :
                'System diagnostics completed - no issues found';

            this.showNotification(recommendations, issues > 0 ? 'warning' : 'success');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 3000);
    }

    clearHistory() {
        if (confirm('Clear all contention history?')) {
            this.contentionHistory = [];
            this.resolutionLog = [];
            this.updateHistory();
            this.updateResolutionLog();
            this.showNotification('History cleared!', 'info');
        }
    }

    refreshSystemOverview() {
        const btn = document.getElementById('refresh-system');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        btn.disabled = true;

        setTimeout(() => {
            this.updateDisplay();
            btn.innerHTML = originalText;
            btn.disabled = false;
            this.showNotification('System overview refreshed!', 'success');
        }, 1500);
    }

    startRealTimeMonitoring() {
        // Update system metrics
        this.intervals.systemMetrics = setInterval(() => {
            Object.keys(this.systemResources).forEach(resource => {
                // Simulate realistic resource usage changes
                const change = (Math.random() - 0.5) * 10; // -5 to +5
                this.systemResources[resource].current = Math.max(0, Math.min(100,
                    this.systemResources[resource].current + change));
            });

            this.updateSystemMetrics();
            this.checkAutoResolution();
        }, 5000); // Update every 5 seconds

        // Update workload activity
        this.intervals.workloadActivity = setInterval(() => {
            this.workloads.forEach(workload => {
                workload.lastActivity = new Date();

                // Randomly change contention levels
                if (Math.random() > 0.8) {
                    const levels = ['low', 'medium', 'high'];
                    workload.contentionLevel = levels[Math.floor(Math.random() * levels.length)];
                }
            });

            this.updateContentionStatus();
            this.updateWorkloadsList();
        }, 8000); // Update every 8 seconds

        // Update last resolution time
        this.intervals.updateTime = setInterval(() => {
            document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
        }, 60000);

        // Simulate contention events
        this.intervals.contentionEvents = setInterval(() => {
            if (Math.random() > 0.7) { // 30% chance every 15 seconds
                const eventTypes = ['contention', 'resolve', 'throttle'];
                const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];

                const event = {
                    timestamp: new Date(),
                    title: type === 'contention' ? 'Contention Detected' :
                           type === 'resolve' ? 'Resolution Applied' : 'Throttling Activated',
                    description: type === 'contention' ?
                        'Resource contention detected on CPU and Memory' :
                        type === 'resolve' ?
                        'Automatic resolution applied to balance resources' :
                        'Workload throttling activated to reduce resource usage',
                    type: type
                };

                this.contentionHistory.unshift(event);
                this.contentionHistory = this.contentionHistory.slice(0, 50);
                this.updateHistory();
            }
        }, 15000);
    }

    checkAutoResolution() {
        if (this.resolutionStrategies.autoResolution) {
            const contentions = this.detectContention();
            if (contentions.length > 0) {
                // Auto-apply resolution for high-severity contentions
                const highSeverity = contentions.filter(c => c.severity === 'critical' || c.severity === 'high');
                if (highSeverity.length > 0) {
                    highSeverity.forEach(contention => {
                        this.applyResolutionStrategy(contention);
                    });
                    this.logResolutionAction(`Auto-resolved ${highSeverity.length} high-severity contention(s)`);
                    this.updateDisplay();
                }
            }
        }
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

// Initialize the resource contention resolver when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.contentionResolver = new ResourceContentionResolver();
});