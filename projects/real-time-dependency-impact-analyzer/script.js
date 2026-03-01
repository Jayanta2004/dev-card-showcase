// Real-Time Dependency Impact Analyzer - Interactive JavaScript Implementation

class DependencyImpactAnalyzer {
    constructor() {
        this.services = this.initializeServices();
        this.dependencies = this.initializeDependencies();
        this.simulationState = null;
        this.charts = {};
        this.intervals = {};
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.initializeCanvas();
        this.initializeCharts();
        this.startRealTimeMonitoring();
        this.updateDashboard();
        this.renderDependencyGraph();
    }

    initializeServices() {
        return {
            'api-gateway': {
                id: 'api-gateway',
                name: 'API Gateway',
                status: 'healthy',
                type: 'gateway',
                position: { x: 300, y: 50 },
                dependencies: ['auth-service', 'user-db', 'cache-layer']
            },
            'auth-service': {
                id: 'auth-service',
                name: 'Authentication Service',
                status: 'healthy',
                type: 'service',
                position: { x: 150, y: 150 },
                dependencies: ['user-db']
            },
            'user-db': {
                id: 'user-db',
                name: 'User Database',
                status: 'healthy',
                type: 'database',
                position: { x: 450, y: 150 },
                dependencies: []
            },
            'payment-gateway': {
                id: 'payment-gateway',
                name: 'Payment Gateway',
                status: 'healthy',
                type: 'external',
                position: { x: 100, y: 250 },
                dependencies: []
            },
            'notification-service': {
                id: 'notification-service',
                name: 'Notification Service',
                status: 'healthy',
                type: 'service',
                position: { x: 300, y: 250 },
                dependencies: ['user-db']
            },
            'cache-layer': {
                id: 'cache-layer',
                name: 'Cache Layer',
                status: 'healthy',
                type: 'infrastructure',
                position: { x: 500, y: 250 },
                dependencies: []
            }
        };
    }

    initializeDependencies() {
        return [
            { from: 'api-gateway', to: 'auth-service', type: 'api' },
            { from: 'api-gateway', to: 'user-db', type: 'database' },
            { from: 'api-gateway', to: 'cache-layer', type: 'cache' },
            { from: 'auth-service', to: 'user-db', type: 'database' },
            { from: 'notification-service', to: 'user-db', type: 'database' }
        ];
    }

    setupEventListeners() {
        // Graph view controls
        document.querySelectorAll('.graph-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.graph-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateGraphView(e.target.dataset.view);
            });
        });

        // Assessment tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateAssessmentTab(e.target.dataset.tab);
            });
        });

        // Monitor filters
        document.querySelectorAll('.monitor-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.monitor-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterServiceMonitor(e.target.dataset.filter);
            });
        });

        // Simulation controls
        document.getElementById('run-simulation').addEventListener('click', () => {
            this.runSimulation();
        });

        document.getElementById('failure-duration').addEventListener('input', (e) => {
            document.getElementById('duration-value').textContent = `${e.target.value} min`;
        });

        // Control buttons
        document.getElementById('analyze-system').addEventListener('click', () => {
            this.analyzeSystem();
        });

        document.getElementById('export-report').addEventListener('click', () => {
            this.exportReport();
        });

        document.getElementById('reset-simulation').addEventListener('click', () => {
            this.resetSimulation();
        });

        document.getElementById('generate-mitigations').addEventListener('click', () => {
            this.generateMitigations();
        });
    }

    initializeCanvas() {
        const canvas = document.getElementById('dependency-canvas');
        const ctx = canvas.getContext('2d');
        this.charts.graph = { canvas, ctx };

        // Make canvas responsive
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const canvas = this.charts.graph.canvas;
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = 400;
        this.renderDependencyGraph();
    }

    initializeCharts() {
        this.initializeImpactChart();
    }

    initializeImpactChart() {
        const canvas = document.getElementById('impact-chart');
        const ctx = canvas.getContext('2d');
        this.charts.impact = { canvas, ctx };
    }

    renderDependencyGraph() {
        const { ctx, canvas } = this.charts.graph;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw connections first
        this.dependencies.forEach(dep => {
            const fromService = this.services[dep.from];
            const toService = this.services[dep.to];

            if (fromService && toService) {
                this.drawConnection(ctx, fromService.position, toService.position, dep.type);
            }
        });

        // Draw service nodes
        Object.values(this.services).forEach(service => {
            this.drawServiceNode(ctx, service);
        });
    }

    drawConnection(ctx, from, to, type) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate control points for curved line
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const offset = Math.min(distance * 0.2, 50);

        const cp1x = from.x + offset;
        const cp1y = from.y;
        const cp2x = to.x - offset;
        const cp2y = to.y;

        ctx.strokeStyle = this.getConnectionColor(type);
        ctx.lineWidth = 2;
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, to.x, to.y);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(dy, dx);
        const arrowLength = 10;
        const arrowAngle = Math.PI / 6;

        ctx.beginPath();
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(
            to.x - arrowLength * Math.cos(angle - arrowAngle),
            to.y - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(
            to.x - arrowLength * Math.cos(angle + arrowAngle),
            to.y - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.stroke();
    }

    drawServiceNode(ctx, service) {
        const { x, y } = service.position;
        const radius = 25;

        // Draw shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Draw node
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.getServiceColor(service);
        ctx.fill();

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw border
        ctx.strokeStyle = this.getServiceBorderColor(service);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw icon
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px FontAwesome';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.getServiceIcon(service.type), x, y);

        // Draw label
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(service.name.split(' ')[0], x, y + radius + 15);
    }

    getConnectionColor(type) {
        const colors = {
            'api': '#6366f1',
            'database': '#10b981',
            'cache': '#f59e0b',
            'external': '#ef4444'
        };
        return colors[type] || '#a1a1aa';
    }

    getServiceColor(service) {
        const statusColors = {
            'healthy': '#10b981',
            'degraded': '#f59e0b',
            'failed': '#ef4444'
        };
        return statusColors[service.status] || '#6b7280';
    }

    getServiceBorderColor(service) {
        const statusColors = {
            'healthy': '#059669',
            'degraded': '#d97706',
            'failed': '#dc2626'
        };
        return statusColors[service.status] || '#4b5563';
    }

    getServiceIcon(type) {
        const icons = {
            'gateway': '\uf542', // fa-door-open
            'service': '\uf085', // fa-cogs
            'database': '\uf1c0', // fa-database
            'external': '\uf0ac', // fa-globe
            'infrastructure': '\uf233' // fa-server
        };
        return icons[type] || '\uf128'; // fa-question
    }

    updateGraphView(view) {
        // Different view modes can be implemented here
        this.renderDependencyGraph();
    }

    updateAssessmentTab(tab) {
        // Update assessment metrics based on selected tab
        const metrics = {
            'services': { affected: 0, depth: 0, downtime: '0 min', recovery: '0 min' },
            'users': { affected: 0, depth: 0, downtime: '0 min', recovery: '0 min' },
            'revenue': { affected: 0, depth: 0, downtime: '0 min', recovery: '0 min' }
        };

        if (this.simulationState) {
            const data = metrics[tab];
            document.getElementById('affected-services').textContent = data.affected;
            document.getElementById('cascade-depth').textContent = data.depth;
            document.getElementById('estimated-downtime').textContent = data.downtime;
            document.getElementById('recovery-time').textContent = data.recovery;
        }
    }

    filterServiceMonitor(filter) {
        this.updateServiceMonitor(filter);
    }

    runSimulation() {
        const failureService = document.getElementById('failure-service').value;
        const failureDuration = parseInt(document.getElementById('failure-duration').value);
        const failureType = document.getElementById('failure-type').value;

        if (!failureService) {
            this.showNotification('Please select a service to fail', 'error');
            return;
        }

        // Reset previous simulation
        this.resetSimulation();

        // Start simulation
        this.simulationState = {
            failedService: failureService,
            duration: failureDuration,
            type: failureType,
            startTime: Date.now(),
            affectedServices: this.calculateImpact(failureService)
        };

        // Update service status
        this.services[failureService].status = failureType === 'complete' ? 'failed' : 'degraded';

        // Update affected services
        this.simulationState.affectedServices.forEach(serviceId => {
            if (serviceId !== failureService) {
                this.services[serviceId].status = 'degraded';
            }
        });

        this.updateSimulationResults();
        this.renderDependencyGraph();
        this.updateServiceMonitor();
        this.showNotification('Simulation started successfully', 'success');
    }

    calculateImpact(failedServiceId) {
        const affected = new Set();
        const visited = new Set();

        const traverse = (serviceId, depth = 0) => {
            if (visited.has(serviceId) || depth > 5) return;
            visited.add(serviceId);

            // Find services that depend on this service
            Object.keys(this.services).forEach(serviceKey => {
                const service = this.services[serviceKey];
                if (service.dependencies.includes(serviceId)) {
                    affected.add(serviceKey);
                    traverse(serviceKey, depth + 1);
                }
            });
        };

        traverse(failedServiceId);
        return Array.from(affected);
    }

    updateSimulationResults() {
        const resultsDiv = document.getElementById('simulation-results');
        const state = this.simulationState;

        if (!state) {
            resultsDiv.innerHTML = `
                <div class="result-placeholder">
                    <i class="fas fa-chart-line"></i>
                    <p>Select a service and run simulation to see impact analysis</p>
                </div>
            `;
            return;
        }

        const impactLevel = state.affectedServices.length > 3 ? 'Critical' :
                           state.affectedServices.length > 1 ? 'High' : 'Medium';

        resultsDiv.innerHTML = `
            <div class="simulation-summary">
                <div class="impact-header">
                    <h4>Impact Analysis: ${this.services[state.failedService].name}</h4>
                    <span class="impact-level ${impactLevel.toLowerCase()}">${impactLevel} Impact</span>
                </div>
                <div class="impact-details">
                    <div class="impact-stat">
                        <span class="stat-label">Primary Failure:</span>
                        <span class="stat-value">${this.services[state.failedService].name}</span>
                    </div>
                    <div class="impact-stat">
                        <span class="stat-label">Affected Services:</span>
                        <span class="stat-value">${state.affectedServices.length}</span>
                    </div>
                    <div class="impact-stat">
                        <span class="stat-label">Cascade Depth:</span>
                        <span class="stat-value">${this.calculateCascadeDepth(state.failedService)}</span>
                    </div>
                    <div class="impact-stat">
                        <span class="stat-label">Estimated Recovery:</span>
                        <span class="stat-value">${state.duration * 2} minutes</span>
                    </div>
                </div>
                <div class="affected-services-list">
                    <h5>Affected Services:</h5>
                    <ul>
                        ${state.affectedServices.map(id =>
                            `<li>${this.services[id].name}</li>`
                        ).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    calculateCascadeDepth(failedServiceId) {
        let maxDepth = 0;
        const visited = new Set();

        const traverse = (serviceId, depth = 0) => {
            if (visited.has(serviceId)) return;
            visited.add(serviceId);
            maxDepth = Math.max(maxDepth, depth);

            Object.keys(this.services).forEach(serviceKey => {
                const service = this.services[serviceKey];
                if (service.dependencies.includes(serviceId)) {
                    traverse(serviceKey, depth + 1);
                }
            });
        };

        traverse(failedServiceId);
        return maxDepth;
    }

    updateServiceMonitor(filter = 'all') {
        const serviceList = document.getElementById('service-list');
        const services = Object.values(this.services);

        const filteredServices = services.filter(service => {
            if (filter === 'all') return true;
            if (filter === 'critical') return service.type === 'gateway' || service.type === 'database';
            if (filter === 'warning') return service.status === 'degraded';
            return true;
        });

        serviceList.innerHTML = filteredServices.map(service => `
            <div class="service-item">
                <div class="service-info">
                    <div class="service-name">${service.name}</div>
                    <div class="service-status ${service.status}">${service.status}</div>
                </div>
                <div class="service-metrics">
                    <span>CPU: ${Math.floor(Math.random() * 30) + 20}%</span>
                    <span>Mem: ${Math.floor(Math.random() * 40) + 30}%</span>
                    <span>Resp: ${Math.floor(Math.random() * 50) + 100}ms</span>
                </div>
            </div>
        `).join('');
    }

    generateMitigations() {
        if (!this.simulationState) {
            this.showNotification('Run a simulation first to generate mitigations', 'warning');
            return;
        }

        const strategies = this.generateMitigationStrategies();
        const container = document.getElementById('strategies-container');

        container.innerHTML = strategies.map(strategy => `
            <div class="strategy-item priority-${strategy.priority}">
                <div class="strategy-header">
                    <span class="strategy-name">${strategy.name}</span>
                    <span class="strategy-priority">${strategy.priority.charAt(0).toUpperCase() + strategy.priority.slice(1)} Priority</span>
                </div>
                <div class="strategy-description">${strategy.description}</div>
                <div class="strategy-impact">
                    <span>Estimated Time: ${strategy.time}</span>
                    <span>Success Rate: ${strategy.successRate}</span>
                </div>
            </div>
        `).join('');

        this.showNotification('Mitigation strategies generated', 'success');
    }

    generateMitigationStrategies() {
        const failedService = this.services[this.simulationState.failedService];
        const strategies = [];

        if (failedService.type === 'database') {
            strategies.push({
                name: 'Database Failover',
                priority: 'high',
                description: 'Switch to read replica and promote to primary',
                time: '2-5 min',
                successRate: '95%'
            });
        }

        if (failedService.type === 'service') {
            strategies.push({
                name: 'Circuit Breaker Activation',
                priority: 'high',
                description: 'Isolate failing service to prevent cascade failures',
                time: '30 sec',
                successRate: '100%'
            });
        }

        strategies.push({
            name: 'Load Balancer Rerouting',
            priority: 'medium',
            description: 'Redirect traffic to healthy service instances',
            time: '1-2 min',
            successRate: '90%'
        });

        strategies.push({
            name: 'Cache Warming',
            priority: 'low',
            description: 'Pre-populate cache with frequently accessed data',
            time: '5-10 min',
            successRate: '85%'
        });

        return strategies;
    }

    analyzeSystem() {
        // Simulate system analysis
        this.showNotification('System analysis completed', 'success');
        this.updateDashboard();
    }

    exportReport() {
        const report = {
            timestamp: new Date().toISOString(),
            systemHealth: this.calculateSystemHealth(),
            services: Object.values(this.services),
            dependencies: this.dependencies,
            simulationState: this.simulationState
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dependency-impact-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Report exported successfully', 'success');
    }

    resetSimulation() {
        // Reset all service statuses
        Object.values(this.services).forEach(service => {
            service.status = 'healthy';
        });

        this.simulationState = null;
        this.updateSimulationResults();
        this.renderDependencyGraph();
        this.updateServiceMonitor();
        this.updateDashboard();
    }

    calculateSystemHealth() {
        const services = Object.values(this.services);
        const healthy = services.filter(s => s.status === 'healthy').length;
        return Math.round((healthy / services.length) * 100);
    }

    updateDashboard() {
        // Update system metrics
        const totalServices = Object.keys(this.services).length;
        const activeDeps = this.dependencies.length;
        const criticalPaths = this.calculateCriticalPaths();
        const healthScore = this.calculateSystemHealth();

        document.getElementById('total-services').textContent = totalServices;
        document.getElementById('active-dependencies').textContent = activeDeps;
        document.getElementById('critical-paths').textContent = criticalPaths;
        document.getElementById('health-score').textContent = `${healthScore}%`;

        // Update system status
        const statusIndicator = document.querySelector('.system-status .status-indicator');
        const statusText = document.querySelector('.system-status .status-text');

        if (healthScore >= 90) {
            statusIndicator.className = 'status-indicator healthy';
            statusText.textContent = 'All Systems Operational';
        } else if (healthScore >= 70) {
            statusIndicator.className = 'status-indicator degraded';
            statusText.textContent = 'Degraded Performance';
        } else {
            statusIndicator.className = 'status-indicator failed';
            statusText.textContent = 'Critical Issues Detected';
        }
    }

    calculateCriticalPaths() {
        // Simple critical path calculation
        return Math.floor(Object.keys(this.services).length / 3);
    }

    startRealTimeMonitoring() {
        // Update monitoring status every 5 seconds
        this.intervals.monitoring = setInterval(() => {
            const lastUpdate = document.querySelector('.last-update');
            if (lastUpdate) {
                lastUpdate.textContent = `Updated ${Math.floor(Math.random() * 10) + 1} sec ago`;
            }

            // Simulate minor status changes
            if (Math.random() < 0.1) { // 10% chance
                const serviceKeys = Object.keys(this.services);
                const randomService = serviceKeys[Math.floor(Math.random() * serviceKeys.length)];
                if (this.services[randomService].status === 'healthy') {
                    this.services[randomService].status = 'degraded';
                    setTimeout(() => {
                        this.services[randomService].status = 'healthy';
                        this.updateServiceMonitor();
                        this.renderDependencyGraph();
                    }, 10000); // Back to healthy after 10 seconds
                }
                this.updateServiceMonitor();
                this.renderDependencyGraph();
            }
        }, 5000);
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    destroy() {
        // Clean up intervals
        Object.values(this.intervals).forEach(interval => clearInterval(interval));
    }
}

// Initialize the analyzer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dependencyAnalyzer = new DependencyImpactAnalyzer();
});

// Add notification styles dynamically
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
}

.notification.show {
    transform: translateX(0);
}

.notification.success {
    background: #10b981;
}

.notification.error {
    background: #ef4444;
}

.notification.warning {
    background: #f59e0b;
}

.notification.info {
    background: #06b6d4;
}
`;

// Inject notification styles
const style = document.createElement('style');
style.textContent = notificationStyles;
document.head.appendChild(style);