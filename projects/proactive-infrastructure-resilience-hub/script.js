// Proactive Infrastructure Resilience Hub

class ProactiveInfrastructureResilienceHub {
    constructor() {
        this.components = [];
        this.metrics = {
            health: 98,
            resilience: 85,
            capacity: 72,
            risk: 'Low'
        };
        this.alerts = [];
        this.charts = {};
        this.scanInterval = null;
        this.isScanning = false;

        this.init();
    }

    init() {
        this.initializeCharts();
        this.setupEventListeners();
        this.generateMockComponents();
        this.updateStatus('System Ready');
        this.startPeriodicUpdates();
    }

    setupEventListeners() {
        document.getElementById('scanBtn').addEventListener('click', () => this.scanInfrastructure());
        document.getElementById('simulateBtn').addEventListener('click', () => this.runSimulation());
        document.getElementById('generateReportBtn').addEventListener('click', () => this.generateReport());
        document.getElementById('runSimulationBtn').addEventListener('click', () => this.runFailureSimulation());
        document.getElementById('resetSimulationBtn').addEventListener('click', () => this.resetSimulation());

        // Scenario buttons
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectScenario(e.target));
        });
    }

    initializeCharts() {
        // Health Chart
        const healthCtx = document.getElementById('healthChart').getContext('2d');
        this.charts.health = new Chart(healthCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'System Health',
                    data: [],
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
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
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        // Resilience Chart
        const resilienceCtx = document.getElementById('resilienceChart').getContext('2d');
        this.charts.resilience = new Chart(resilienceCtx, {
            type: 'doughnut',
            data: {
                labels: ['Resilient', 'At Risk', 'Critical'],
                datasets: [{
                    data: [85, 10, 5],
                    backgroundColor: ['#4CAF50', '#ff9800', '#f44336'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e0e6ed'
                        }
                    }
                }
            }
        });

        // Capacity Chart
        const capacityCtx = document.getElementById('capacityChart').getContext('2d');
        this.charts.capacity = new Chart(capacityCtx, {
            type: 'bar',
            data: {
                labels: ['CPU', 'Memory', 'Storage', 'Network'],
                datasets: [{
                    label: 'Utilization %',
                    data: [68, 76, 45, 52],
                    backgroundColor: [
                        'rgba(0, 212, 255, 0.8)',
                        'rgba(255, 152, 0, 0.8)',
                        'rgba(76, 175, 80, 0.8)',
                        'rgba(244, 67, 54, 0.8)'
                    ],
                    borderRadius: 4
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
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        // Risk Chart
        const riskCtx = document.getElementById('riskChart').getContext('2d');
        this.charts.risk = new Chart(riskCtx, {
            type: 'radar',
            data: {
                labels: ['Security', 'Performance', 'Availability', 'Scalability', 'Compliance'],
                datasets: [{
                    label: 'Risk Level',
                    data: [20, 15, 10, 25, 5],
                    borderColor: '#ff9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.2)',
                    pointBackgroundColor: '#ff9800'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    generateMockComponents() {
        this.components = [
            { name: 'Web Server 1', type: 'server', status: 'healthy', metrics: { cpu: 45, memory: 62 } },
            { name: 'Web Server 2', type: 'server', status: 'warning', metrics: { cpu: 78, memory: 85 } },
            { name: 'Database Primary', type: 'database', status: 'healthy', metrics: { cpu: 52, memory: 71 } },
            { name: 'Load Balancer', type: 'network', status: 'healthy', metrics: { cpu: 23, memory: 34 } },
            { name: 'Cache Cluster', type: 'cache', status: 'healthy', metrics: { cpu: 31, memory: 45 } },
            { name: 'API Gateway', type: 'gateway', status: 'healthy', metrics: { cpu: 28, memory: 39 } },
            { name: 'Monitoring Service', type: 'monitoring', status: 'healthy', metrics: { cpu: 15, memory: 22 } },
            { name: 'Backup Service', type: 'backup', status: 'warning', metrics: { cpu: 67, memory: 73 } }
        ];

        this.renderComponents();
    }

    renderComponents() {
        const container = document.getElementById('componentsGrid');
        container.innerHTML = '';

        this.components.forEach(component => {
            const card = document.createElement('div');
            card.className = 'component-card';

            card.innerHTML = `
                <div class="component-header">
                    <span class="component-name">${component.name}</span>
                    <span class="component-status ${component.status}">${component.status}</span>
                </div>
                <div class="component-metrics">
                    CPU: ${component.metrics.cpu}% | Memory: ${component.metrics.memory}%
                </div>
            `;

            container.appendChild(card);
        });
    }

    scanInfrastructure() {
        if (this.isScanning) return;

        this.isScanning = true;
        this.updateStatus('Scanning infrastructure...', 'warning');

        document.getElementById('scanBtn').disabled = true;
        document.getElementById('scanBtn').innerHTML = '<i data-lucide="loader"></i> Scanning...';

        // Simulate scanning process
        let progress = 0;
        const scanInterval = setInterval(() => {
            progress += 10;
            this.updateStatus(`Scanning infrastructure... ${progress}%`, 'warning');

            if (progress >= 100) {
                clearInterval(scanInterval);
                this.isScanning = false;
                document.getElementById('scanBtn').disabled = false;
                document.getElementById('scanBtn').innerHTML = '<i data-lucide="search"></i> Scan Infrastructure';

                // Update some components randomly
                this.simulateComponentUpdates();
                this.updateMetrics();
                this.updateStatus('Scan complete', 'healthy');
            }
        }, 300);
    }

    simulateComponentUpdates() {
        // Randomly update component statuses and metrics
        this.components.forEach(component => {
            // 10% chance of status change
            if (Math.random() < 0.1) {
                const statuses = ['healthy', 'warning', 'error'];
                component.status = statuses[Math.floor(Math.random() * statuses.length)];
            }

            // Update metrics with some variation
            component.metrics.cpu = Math.max(0, Math.min(100, component.metrics.cpu + (Math.random() - 0.5) * 20));
            component.metrics.memory = Math.max(0, Math.min(100, component.metrics.memory + (Math.random() - 0.5) * 20));
        });

        this.renderComponents();
        this.checkForAlerts();
    }

    updateMetrics() {
        // Calculate overall health score
        const healthyComponents = this.components.filter(c => c.status === 'healthy').length;
        this.metrics.health = Math.round((healthyComponents / this.components.length) * 100);

        // Update resilience score based on redundancy and recovery capabilities
        this.metrics.resilience = Math.max(0, Math.min(100, this.metrics.resilience + (Math.random() - 0.5) * 10));

        // Update capacity based on component metrics
        const avgCpu = this.components.reduce((sum, c) => sum + c.metrics.cpu, 0) / this.components.length;
        const avgMemory = this.components.reduce((sum, c) => sum + c.metrics.memory, 0) / this.components.length;
        this.metrics.capacity = Math.round((avgCpu + avgMemory) / 2);

        // Update risk assessment
        const errorComponents = this.components.filter(c => c.status === 'error').length;
        const warningComponents = this.components.filter(c => c.status === 'warning').length;

        if (errorComponents > 0) {
            this.metrics.risk = 'Critical';
        } else if (warningComponents > 2) {
            this.metrics.risk = 'High';
        } else if (warningComponents > 0) {
            this.metrics.risk = 'Medium';
        } else {
            this.metrics.risk = 'Low';
        }

        this.updateMetricDisplays();
        this.updateCharts();
    }

    updateMetricDisplays() {
        document.getElementById('healthScore').textContent = `${this.metrics.health}%`;
        document.getElementById('resilienceScore').textContent = `${Math.round(this.metrics.resilience)}%`;
        document.getElementById('capacityScore').textContent = `${this.metrics.capacity}%`;
        document.getElementById('riskScore').textContent = this.metrics.risk;

        // Update score colors
        this.updateScoreColor('healthScore', this.metrics.health);
        this.updateScoreColor('resilienceScore', this.metrics.resilience);
        this.updateScoreColor('capacityScore', this.metrics.capacity);
        this.updateRiskColor();
    }

    updateScoreColor(elementId, value) {
        const element = document.getElementById(elementId);
        element.className = 'metric-score';

        if (value >= 80) {
            element.classList.add('healthy');
        } else if (value >= 60) {
            element.classList.add('warning');
        } else {
            element.classList.add('error');
        }
    }

    updateRiskColor() {
        const element = document.getElementById('riskScore');
        element.className = 'metric-score';

        switch (this.metrics.risk) {
            case 'Low':
                element.style.color = '#4CAF50';
                break;
            case 'Medium':
                element.style.color = '#ff9800';
                break;
            case 'High':
                element.style.color = '#f44336';
                break;
            case 'Critical':
                element.style.color = '#f44336';
                element.style.fontWeight = 'bold';
                break;
        }
    }

    updateCharts() {
        // Update health chart with new data point
        const now = new Date();
        const timeLabel = now.toLocaleTimeString();

        if (this.charts.health.data.labels.length > 10) {
            this.charts.health.data.labels.shift();
            this.charts.health.data.datasets[0].data.shift();
        }

        this.charts.health.data.labels.push(timeLabel);
        this.charts.health.data.datasets[0].data.push(this.metrics.health);
        this.charts.health.update();

        // Update capacity chart
        this.charts.capacity.data.datasets[0].data = [
            this.components.reduce((sum, c) => sum + c.metrics.cpu, 0) / this.components.length,
            this.components.reduce((sum, c) => sum + c.metrics.memory, 0) / this.components.length,
            45, // Storage (mock)
            52  // Network (mock)
        ];
        this.charts.capacity.update();
    }

    checkForAlerts() {
        this.alerts = [];

        // Check for high CPU usage
        this.components.forEach(component => {
            if (component.metrics.cpu > 80) {
                this.alerts.push({
                    type: 'warning',
                    title: `High CPU Usage: ${component.name}`,
                    message: `${component.name} is experiencing high CPU utilization (${Math.round(component.metrics.cpu)}%). Consider scaling or optimization.`,
                    actions: ['Scale Up', 'Investigate']
                });
            }

            if (component.metrics.memory > 85) {
                this.alerts.push({
                    type: 'warning',
                    title: `High Memory Usage: ${component.name}`,
                    message: `${component.name} is experiencing high memory consumption (${Math.round(component.metrics.memory)}%). Consider scaling or memory optimization.`,
                    actions: ['Scale Up', 'Investigate']
                });
            }

            if (component.status === 'error') {
                this.alerts.push({
                    type: 'error',
                    title: `Component Error: ${component.name}`,
                    message: `${component.name} is currently in an error state. Immediate attention required.`,
                    actions: ['Restart', 'Investigate', 'Failover']
                });
            }
        });

        this.renderAlerts();
    }

    renderAlerts() {
        const container = document.getElementById('alertsContainer');

        if (this.alerts.length === 0) {
            container.innerHTML = '<p style="color: #b0b7c3; text-align: center; padding: 20px;">No active alerts</p>';
            return;
        }

        container.innerHTML = '';

        this.alerts.forEach(alert => {
            const alertCard = document.createElement('div');
            alertCard.className = `alert-card ${alert.type}`;

            alertCard.innerHTML = `
                <div class="alert-icon">${alert.type === 'error' ? '🚨' : '⚠️'}</div>
                <div class="alert-content">
                    <h4>${alert.title}</h4>
                    <p>${alert.message}</p>
                    <div class="alert-actions">
                        ${alert.actions.map(action =>
                            `<button class="alert-action-btn">${action}</button>`
                        ).join('')}
                    </div>
                </div>
            `;

            container.appendChild(alertCard);
        });
    }

    runSimulation() {
        this.updateStatus('Running resilience simulation...', 'warning');

        setTimeout(() => {
            // Simulate some component failures and recoveries
            const originalStatuses = this.components.map(c => c.status);

            // Temporarily set some components to error
            this.components[1].status = 'error'; // Web Server 2
            this.components[3].status = 'error'; // Load Balancer

            this.renderComponents();
            this.updateMetrics();
            this.checkForAlerts();

            setTimeout(() => {
                // Recover components
                this.components[1].status = originalStatuses[1];
                this.components[3].status = originalStatuses[3];

                this.renderComponents();
                this.updateMetrics();
                this.checkForAlerts();
                this.updateStatus('Simulation complete', 'healthy');
            }, 3000);
        }, 2000);
    }

    selectScenario(button) {
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        this.selectedScenario = button.dataset.scenario;
    }

    runFailureSimulation() {
        if (!this.selectedScenario) {
            alert('Please select a failure scenario first');
            return;
        }

        const results = document.getElementById('simulationResults');
        results.innerHTML = '<p>Running failure simulation...</p>';

        setTimeout(() => {
            let simulationResult = '';

            switch (this.selectedScenario) {
                case 'server-failure':
                    simulationResult = `
                        <h4>Server Failure Simulation Results</h4>
                        <p><strong>Impact:</strong> 15% performance degradation</p>
                        <p><strong>Recovery Time:</strong> 2.3 minutes</p>
                        <p><strong>Resilience Score:</strong> 87/100</p>
                        <p><strong>Recommendation:</strong> Implement automatic failover to backup servers</p>
                    `;
                    break;
                case 'network-outage':
                    simulationResult = `
                        <h4>Network Outage Simulation Results</h4>
                        <p><strong>Impact:</strong> 30% service unavailability</p>
                        <p><strong>Recovery Time:</strong> 4.1 minutes</p>
                        <p><strong>Resilience Score:</strong> 72/100</p>
                        <p><strong>Recommendation:</strong> Deploy multi-region network redundancy</p>
                    `;
                    break;
                case 'high-load':
                    simulationResult = `
                        <h4>High Load Simulation Results</h4>
                        <p><strong>Impact:</strong> 8% response time increase</p>
                        <p><strong>Recovery Time:</strong> Auto-scaling activated</p>
                        <p><strong>Resilience Score:</strong> 94/100</p>
                        <p><strong>Recommendation:</strong> Current auto-scaling configuration is adequate</p>
                    `;
                    break;
                case 'data-corruption':
                    simulationResult = `
                        <h4>Data Corruption Simulation Results</h4>
                        <p><strong>Impact:</strong> 5% data loss potential</p>
                        <p><strong>Recovery Time:</strong> 45 minutes (backup restoration)</p>
                        <p><strong>Resilience Score:</strong> 78/100</p>
                        <p><strong>Recommendation:</strong> Implement real-time data replication and validation</p>
                    `;
                    break;
            }

            results.innerHTML = simulationResult;
        }, 2000);
    }

    resetSimulation() {
        document.getElementById('simulationResults').innerHTML = '<p>Run a simulation to test infrastructure resilience...</p>';
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        this.selectedScenario = null;
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            metrics: this.metrics,
            components: this.components,
            alerts: this.alerts,
            recommendations: [
                'Implement automated backup verification',
                'Increase monitoring granularity for critical components',
                'Consider implementing chaos engineering practices',
                'Review and update disaster recovery procedures'
            ]
        };

        const reportStr = JSON.stringify(report, null, 2);
        const blob = new Blob([reportStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `resilience-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        this.updateStatus('Report generated and downloaded', 'healthy');
    }

    updateStatus(message, type = 'healthy') {
        document.getElementById('statusText').textContent = message;

        const dot = document.getElementById('statusDot');
        dot.className = 'status-dot';

        if (type === 'warning') {
            dot.classList.add('warning');
        } else if (type === 'error') {
            dot.classList.add('error');
        }
    }

    startPeriodicUpdates() {
        // Update metrics every 30 seconds
        setInterval(() => {
            if (!this.isScanning) {
                this.simulateComponentUpdates();
                this.updateMetrics();
            }
        }, 30000);
    }
}

// Initialize the hub when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ProactiveInfrastructureResilienceHub();
    lucide.createIcons();
});