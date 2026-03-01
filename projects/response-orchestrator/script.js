// Response Orchestrator #5956 - JavaScript
class ResponseOrchestrator {
    constructor() {
        this.alerts = [];
        this.playbooks = [];
        this.actions = [];
        this.auditTrail = [];
        this.isRunning = false;
        this.simulationInterval = null;

        this.initializeElements();
        this.bindEvents();
        this.initializeData();
        this.startRealTimeUpdates();
    }

    initializeElements() {
        // Control buttons
        this.runSimulationBtn = document.getElementById('runSimulation');
        this.resetSystemBtn = document.getElementById('resetSystem');
        this.emergencyStopBtn = document.getElementById('emergencyStop');

        // Panels
        this.alertPipeline = document.querySelector('.alert-pipeline .panel-content');
        this.responsePlaybooks = document.querySelector('.response-playbooks .panel-content');
        this.automatedActions = document.querySelector('.automated-actions .panel-content');
        this.auditTrailPanel = document.querySelector('.audit-trail .panel-content');
        this.responseMetrics = document.querySelector('.response-metrics .panel-content');

        // System status
        this.systemStatus = document.querySelector('.status-value');
    }

    bindEvents() {
        this.runSimulationBtn.addEventListener('click', () => this.toggleSimulation());
        this.resetSystemBtn.addEventListener('click', () => this.resetSystem());
        this.emergencyStopBtn.addEventListener('click', () => this.emergencyStop());
    }

    initializeData() {
        // Initialize with sample data
        this.alerts = [
            {
                id: 1,
                type: 'Security Breach',
                source: 'Firewall',
                severity: 'critical',
                time: new Date(Date.now() - 60000),
                status: 'Processing'
            },
            {
                id: 2,
                type: 'DDoS Attack',
                source: 'Load Balancer',
                severity: 'high',
                time: new Date(Date.now() - 180000),
                status: 'Contained'
            },
            {
                id: 3,
                type: 'Unauthorized Access',
                source: 'API Gateway',
                severity: 'medium',
                time: new Date(Date.now() - 300000),
                status: 'Investigating'
            }
        ];

        this.playbooks = [
            {
                id: 1,
                name: 'Security Breach Response',
                trigger: 'Critical Alert',
                active: true,
                steps: [
                    { number: 1, action: 'Isolate affected systems', status: 'completed' },
                    { number: 2, action: 'Revoke compromised credentials', status: 'active' },
                    { number: 3, action: 'Deploy forensic analysis', status: 'pending' }
                ]
            },
            {
                id: 2,
                name: 'DDoS Mitigation',
                trigger: 'Traffic Anomaly',
                active: false,
                steps: [
                    { number: 1, action: 'Enable rate limiting', status: 'completed' },
                    { number: 2, action: 'Scale infrastructure', status: 'completed' },
                    { number: 3, action: 'Block malicious IPs', status: 'completed' }
                ]
            }
        ];

        this.actions = [
            {
                id: 1,
                type: 'Access Revocation',
                target: 'user@domain.com',
                progress: 75,
                status: 'executing'
            },
            {
                id: 2,
                type: 'Traffic Isolation',
                target: '192.168.1.0/24',
                progress: 100,
                status: 'completed'
            },
            {
                id: 3,
                type: 'Credential Rotation',
                target: 'api-service-key',
                progress: 0,
                status: 'pending'
            }
        ];

        this.auditTrail = [
            {
                timestamp: '14:32:15',
                action: 'Access Revocation',
                details: 'Revoked credentials for user@domain.com',
                status: 'Success'
            },
            {
                timestamp: '14:30:42',
                action: 'Traffic Isolation',
                details: 'Isolated subnet 192.168.1.0/24',
                status: 'Success'
            },
            {
                timestamp: '14:28:19',
                action: 'Alert Correlation',
                details: 'Correlated 3 related security events',
                status: 'Success'
            },
            {
                timestamp: '14:25:33',
                action: 'Playbook Execution',
                details: 'Started DDoS mitigation playbook',
                status: 'In Progress'
            }
        ];

        this.updateUI();
    }

    toggleSimulation() {
        if (this.isRunning) {
            this.stopSimulation();
        } else {
            this.startSimulation();
        }
    }

    startSimulation() {
        this.isRunning = true;
        this.runSimulationBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Simulation';
        this.runSimulationBtn.classList.add('active');
        this.systemStatus.textContent = 'Simulating';
        this.systemStatus.classList.add('active');

        this.simulationInterval = setInterval(() => {
            this.generateRandomEvents();
            this.updateActionProgress();
            this.updateMetrics();
        }, 3000);
    }

    stopSimulation() {
        this.isRunning = false;
        this.runSimulationBtn.innerHTML = '<i class="fas fa-play"></i> Run Simulation';
        this.runSimulationBtn.classList.remove('active');
        this.systemStatus.textContent = 'Operational';
        this.systemStatus.classList.remove('active');

        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
    }

    resetSystem() {
        this.stopSimulation();
        this.initializeData();
        this.addAuditEntry('System Reset', 'All systems reset to initial state', 'Success');
    }

    emergencyStop() {
        this.stopSimulation();
        this.systemStatus.textContent = 'Emergency Stop';
        this.systemStatus.classList.remove('active');
        this.systemStatus.classList.add('stopped');

        // Stop all active actions
        this.actions.forEach(action => {
            if (action.status === 'executing') {
                action.status = 'stopped';
                action.progress = 0;
            }
        });

        this.addAuditEntry('Emergency Stop', 'All automated actions halted', 'Success');
        this.updateUI();
    }

    generateRandomEvents() {
        const eventTypes = [
            { type: 'SQL Injection', source: 'Database', severity: 'critical' },
            { type: 'Brute Force', source: 'Authentication', severity: 'high' },
            { type: 'XSS Attempt', source: 'Web App', severity: 'medium' },
            { type: 'Data Exfiltration', source: 'Network', severity: 'high' },
            { type: 'Privilege Escalation', source: 'System', severity: 'critical' }
        ];

        if (Math.random() < 0.3) { // 30% chance of new alert
            const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            const alert = {
                id: Date.now(),
                type: event.type,
                source: event.source,
                severity: event.severity,
                time: new Date(),
                status: 'Processing'
            };

            this.alerts.unshift(alert);
            if (this.alerts.length > 5) {
                this.alerts = this.alerts.slice(0, 5);
            }

            this.addAuditEntry('Alert Generated', `${event.type} detected from ${event.source}`, 'Success');
            this.triggerResponse(alert);
        }
    }

    triggerResponse(alert) {
        // Find appropriate playbook
        const playbook = this.playbooks.find(p => {
            if (alert.severity === 'critical' && p.trigger === 'Critical Alert') return true;
            if (alert.severity === 'high' && p.trigger === 'Traffic Anomaly') return true;
            return false;
        });

        if (playbook) {
            playbook.active = true;
            this.addAuditEntry('Playbook Triggered', `${playbook.name} activated for ${alert.type}`, 'Success');
        }

        // Create automated action
        const actionTypes = ['Access Revocation', 'Traffic Isolation', 'Credential Rotation'];
        const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
        const targets = ['user@domain.com', '192.168.1.0/24', 'api-service-key', 'admin@corp.com'];

        const action = {
            id: Date.now(),
            type: actionType,
            target: targets[Math.floor(Math.random() * targets.length)],
            progress: 0,
            status: 'executing'
        };

        this.actions.unshift(action);
        if (this.actions.length > 3) {
            this.actions = this.actions.slice(0, 3);
        }
    }

    updateActionProgress() {
        this.actions.forEach(action => {
            if (action.status === 'executing' && action.progress < 100) {
                action.progress += Math.random() * 20;
                if (action.progress >= 100) {
                    action.progress = 100;
                    action.status = 'completed';
                    this.addAuditEntry('Action Completed', `${action.type} for ${action.target} finished`, 'Success');
                }
            }
        });
    }

    updateMetrics() {
        // Simulate metric updates
        const metrics = document.querySelectorAll('.metric-value');
        metrics.forEach(metric => {
            if (metric.textContent.includes('s')) {
                // Response time
                const current = parseFloat(metric.textContent);
                const change = (Math.random() - 0.5) * 0.4;
                const newValue = Math.max(1.5, Math.min(3.5, current + change));
                metric.textContent = newValue.toFixed(1) + 's';
            } else if (metric.textContent.includes('%')) {
                // Success rate
                const current = parseFloat(metric.textContent);
                const change = (Math.random() - 0.5) * 2;
                const newValue = Math.max(95, Math.min(100, current + change));
                metric.textContent = newValue.toFixed(1) + '%';
            } else if (metric.textContent.includes('min')) {
                // MTTR
                const current = parseInt(metric.textContent);
                const change = Math.floor((Math.random() - 0.5) * 4);
                const newValue = Math.max(10, Math.min(25, current + change));
                metric.textContent = newValue + 'min';
            }
        });
    }

    addAuditEntry(action, details, status) {
        const now = new Date();
        const timestamp = now.toTimeString().split(' ')[0];

        const entry = {
            timestamp,
            action,
            details,
            status
        };

        this.auditTrail.unshift(entry);
        if (this.auditTrail.length > 5) {
            this.auditTrail = this.auditTrail.slice(0, 5);
        }
    }

    updateUI() {
        this.updateAlerts();
        this.updatePlaybooks();
        this.updateActions();
        this.updateAuditTrail();
        this.updateInfrastructureStatus();
    }

    updateAlerts() {
        const alertStream = this.alertPipeline.querySelector('.alert-stream');
        alertStream.innerHTML = '';

        this.alerts.forEach(alert => {
            const alertElement = document.createElement('div');
            alertElement.className = `alert-item ${alert.severity}`;

            const timeAgo = this.getTimeAgo(alert.time);

            alertElement.innerHTML = `
                <div class="alert-header">
                    <span class="alert-type">${alert.type}</span>
                    <span class="alert-time">${timeAgo}</span>
                </div>
                <div class="alert-details">
                    <span class="alert-source">${alert.source}</span>
                    <span class="alert-confidence">${Math.floor(Math.random() * 20) + 80}%</span>
                </div>
                <div class="alert-status">${alert.status}</div>
            `;

            alertStream.appendChild(alertElement);
        });
    }

    updatePlaybooks() {
        const playbookList = this.responsePlaybooks.querySelector('.playbook-list');
        playbookList.innerHTML = '';

        this.playbooks.forEach(playbook => {
            const playbookElement = document.createElement('div');
            playbookElement.className = `playbook-item ${playbook.active ? 'active' : ''}`;

            const stepsHtml = playbook.steps.map(step => `
                <div class="step ${step.status}">
                    <span class="step-number">${step.number}</span>
                    <span class="step-action">${step.action}</span>
                </div>
            `).join('');

            playbookElement.innerHTML = `
                <div class="playbook-header">
                    <span class="playbook-name">${playbook.name}</span>
                    <span class="playbook-trigger">${playbook.trigger}</span>
                </div>
                <div class="playbook-steps">
                    ${stepsHtml}
                </div>
            `;

            playbookList.appendChild(playbookElement);
        });
    }

    updateActions() {
        const actionQueue = this.automatedActions.querySelector('.action-queue');
        actionQueue.innerHTML = '';

        this.actions.forEach(action => {
            const actionElement = document.createElement('div');
            actionElement.className = `action-item ${action.status}`;

            actionElement.innerHTML = `
                <div class="action-header">
                    <span class="action-type">${action.type}</span>
                    <span class="action-target">${action.target}</span>
                </div>
                <div class="action-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${action.progress}%"></div>
                    </div>
                    <span class="progress-text">${action.status === 'completed' ? 'Completed' : action.status === 'executing' ? Math.round(action.progress) + '%' : 'Queued'}</span>
                </div>
            `;

            actionQueue.appendChild(actionElement);
        });
    }

    updateAuditTrail() {
        const auditLog = this.auditTrailPanel.querySelector('.audit-log');
        auditLog.innerHTML = '';

        this.auditTrail.forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.className = 'audit-entry';

            entryElement.innerHTML = `
                <div class="audit-timestamp">${entry.timestamp}</div>
                <div class="audit-action">${entry.action}</div>
                <div class="audit-details">${entry.details}</div>
                <div class="audit-status">${entry.status}</div>
            `;

            auditLog.appendChild(entryElement);
        });
    }

    updateInfrastructureStatus() {
        const layers = document.querySelectorAll('.layer-item');
        layers.forEach(layer => {
            const statusElement = layer.querySelector('.layer-status');
            const metricsElement = layer.querySelector('.layer-metrics');

            // Randomly update some statuses
            if (Math.random() < 0.1) {
                const statuses = ['healthy', 'warning', 'critical'];
                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                statusElement.className = `layer-status ${randomStatus}`;
                statusElement.textContent = randomStatus.charAt(0).toUpperCase() + randomStatus.slice(1);
            }

            // Update metrics
            if (layer.classList.contains('network')) {
                const traffic = (Math.random() * 2 + 1).toFixed(1);
                metricsElement.innerHTML = `<span>Traffic: ${traffic} Gbps</span><span>Latency: ${Math.floor(Math.random() * 20) + 5}ms</span>`;
            } else if (layer.classList.contains('application')) {
                const cpu = Math.floor(Math.random() * 30 + 60);
                const memory = Math.floor(Math.random() * 20 + 70);
                metricsElement.innerHTML = `<span>CPU: ${cpu}%</span><span>Memory: ${memory}%</span>`;
            } else if (layer.classList.contains('database')) {
                const connections = Math.floor(Math.random() * 100 + 200);
                const queryTime = Math.floor(Math.random() * 20 + 30);
                metricsElement.innerHTML = `<span>Connections: ${connections}</span><span>Query Time: ${queryTime}ms</span>`;
            } else if (layer.classList.contains('security')) {
                const threats = Math.floor(Math.random() * 20);
                const blocks = Math.floor(Math.random() * 500 + 1000);
                metricsElement.innerHTML = `<span>Threats: ${threats} active</span><span>Blocks: ${blocks}</span>`;
            }
        });
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        return `${Math.floor(diffInSeconds / 3600)}h ago`;
    }

    startRealTimeUpdates() {
        // Update timestamps every minute
        setInterval(() => {
            if (!this.isRunning) {
                this.updateAlerts();
            }
        }, 60000);

        // Periodic infrastructure status updates
        setInterval(() => {
            this.updateInfrastructureStatus();
        }, 10000);
    }
}

// Initialize the Response Orchestrator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ResponseOrchestrator();
});