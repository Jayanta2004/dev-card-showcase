// Threat Response Orchestrator - Interactive JavaScript

class ThreatResponseOrchestrator {
    constructor() {
        this.threats = [];
        this.incidents = [];
        this.playbooks = {
            'sql-injection': {
                name: 'SQL Injection Response',
                steps: ['Detection', 'Alert', 'Block', 'Log', 'Notify']
            },
            'ddos': {
                name: 'DDoS Mitigation',
                steps: ['Detection', 'Scale', 'Filter', 'Monitor', 'Recovery']
            },
            'data-breach': {
                name: 'Data Breach Response',
                steps: ['Detection', 'Contain', 'Assess', 'Notify', 'Recover']
            },
            'malware': {
                name: 'Malware Containment',
                steps: ['Detection', 'Isolate', 'Scan', 'Remove', 'Monitor']
            }
        };
        this.currentPlaybook = 'sql-injection';
        this.metrics = {
            threatsBlocked: 247,
            responseTime: 1.2,
            uptime: 99.97,
            falsePositives: 3
        };
        this.chart = null;
        this.threatInterval = null;
        this.metricInterval = null;

        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeChart();
        this.startSimulations();
        this.updateMetrics();
    }

    bindEvents() {
        // Threat detection controls
        document.getElementById('scanNetwork').addEventListener('click', () => this.scanNetwork());
        document.getElementById('updateSignatures').addEventListener('click', () => this.updateSignatures());

        // Orchestration controls
        document.getElementById('playbookSelect').addEventListener('change', (e) => this.changePlaybook(e.target.value));
        document.getElementById('executePlaybook').addEventListener('click', () => this.executePlaybook());
        document.getElementById('manualOverride').addEventListener('click', () => this.manualOverride());

        // Intelligence controls
        document.getElementById('syncIntelligence').addEventListener('click', () => this.syncIntelligence());
        document.getElementById('analyzeTrends').addEventListener('click', () => this.analyzeTrends());

        // Manual controls
        document.getElementById('emergencyShutdown').addEventListener('click', () => this.emergencyShutdown());
        document.getElementById('quarantineSystem').addEventListener('click', () => this.quarantineSystem());
        document.getElementById('isolateNetwork').addEventListener('click', () => this.isolateNetwork());
        document.getElementById('restoreBackup').addEventListener('click', () => this.restoreBackup());
    }

    initializeChart() {
        const ctx = document.getElementById('threatChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                datasets: [{
                    label: 'Threats Detected',
                    data: [12, 19, 8, 15, 22, 18],
                    borderColor: '#e53e3e',
                    backgroundColor: 'rgba(229, 62, 62, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Threats Blocked',
                    data: [10, 17, 7, 13, 20, 16],
                    borderColor: '#38a169',
                    backgroundColor: 'rgba(56, 161, 105, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    startSimulations() {
        // Simulate new threats every 10-30 seconds
        this.threatInterval = setInterval(() => {
            if (Math.random() > 0.7) { // 30% chance of new threat
                this.generateThreat();
            }
        }, Math.random() * 20000 + 10000);

        // Update metrics every 5 seconds
        this.metricInterval = setInterval(() => {
            this.updateMetrics();
        }, 5000);
    }

    generateThreat() {
        const threatTypes = [
            'SQL Injection Attempt',
            'Brute Force Attack',
            'Suspicious File Upload',
            'XSS Attempt',
            'Port Scan',
            'Malware Detection',
            'DDoS Attack',
            'Data Exfiltration'
        ];

        const sources = [
            '192.168.1.100',
            '203.0.113.45',
            '10.0.0.50',
            '172.16.0.25',
            '198.51.100.10',
            '192.0.2.15'
        ];

        const severities = ['critical', 'high', 'medium', 'low'];

        const threat = {
            id: Date.now(),
            type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
            source: sources[Math.floor(Math.random() * sources.length)],
            severity: severities[Math.floor(Math.random() * severities.length)],
            confidence: Math.floor(Math.random() * 30) + 70, // 70-99%
            timestamp: new Date()
        };

        this.threats.unshift(threat);
        this.threats = this.threats.slice(0, 10); // Keep only last 10 threats

        this.updateThreatDisplay();
        this.checkAutoResponse(threat);
    }

    updateThreatDisplay() {
        const threatStream = document.querySelector('.threat-stream');
        threatStream.innerHTML = '';

        this.threats.forEach(threat => {
            const threatElement = document.createElement('div');
            threatElement.className = 'threat-item';
            threatElement.setAttribute('data-severity', threat.severity);

            threatElement.innerHTML = `
                <div class="threat-header">
                    <span class="threat-type">${threat.type}</span>
                    <span class="threat-time">${this.getTimeAgo(threat.timestamp)}</span>
                </div>
                <div class="threat-details">
                    <span class="threat-source">${threat.source}</span>
                    <span class="threat-confidence">${threat.confidence}%</span>
                </div>
            `;

            threatStream.appendChild(threatElement);
        });
    }

    checkAutoResponse(threat) {
        if (threat.severity === 'critical' || threat.confidence > 85) {
            this.createIncident(threat);
        }
    }

    createIncident(threat) {
        const incident = {
            id: `INC-2024-${String(this.incidents.length + 1).padStart(3, '0')}`,
            title: threat.type,
            priority: threat.severity === 'critical' ? 'critical' : threat.severity === 'high' ? 'high' : 'medium',
            status: 'Response in Progress',
            assigned: this.getRandomTeam(),
            progress: Math.floor(Math.random() * 30) + 20, // 20-50% initial progress
            timestamp: new Date()
        };

        this.incidents.unshift(incident);
        this.incidents = this.incidents.slice(0, 5); // Keep only last 5 incidents

        this.updateIncidentDisplay();
        this.updateStatusIndicators();
    }

    updateIncidentDisplay() {
        const incidentList = document.querySelector('.incident-list');
        incidentList.innerHTML = '';

        this.incidents.forEach(incident => {
            const incidentElement = document.createElement('div');
            incidentElement.className = 'incident-item active';
            incidentElement.setAttribute('data-incident-id', incident.id);

            incidentElement.innerHTML = `
                <div class="incident-header">
                    <span class="incident-title">${incident.title}</span>
                    <span class="incident-priority ${incident.priority}">${incident.priority}</span>
                </div>
                <div class="incident-details">
                    <div class="incident-status">${incident.status}</div>
                    <div class="incident-assigned">Assigned: ${incident.assigned}</div>
                    <div class="incident-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${incident.progress}%"></div>
                        </div>
                    </div>
                </div>
            `;

            incidentList.appendChild(incidentElement);
        });
    }

    updateStatusIndicators() {
        const activeIncidents = this.incidents.length;
        const incidentStatus = document.querySelector('.incident-response .status');
        incidentStatus.textContent = `${activeIncidents} Active`;
        incidentStatus.className = `status ${activeIncidents > 0 ? 'warning' : 'good'}`;
    }

    changePlaybook(playbookId) {
        this.currentPlaybook = playbookId;
        this.updateOrchestrationSteps();
    }

    updateOrchestrationSteps() {
        const steps = this.playbooks[this.currentPlaybook].steps;
        const stepElements = document.querySelectorAll('.step');

        stepElements.forEach((step, index) => {
            if (index < steps.length) {
                step.querySelector('.step-title').textContent = steps[index];
                step.classList.toggle('active', index < 3); // First 3 steps active by default
            }
        });
    }

    executePlaybook() {
        this.showNotification('Playbook execution started', 'success');
        this.animatePlaybookExecution();
    }

    animatePlaybookExecution() {
        const steps = document.querySelectorAll('.step');
        let currentStep = 0;

        const executeStep = () => {
            if (currentStep < steps.length) {
                steps[currentStep].classList.add('active');
                const progressBar = steps[currentStep].querySelector('.progress-fill') ||
                                  document.createElement('div');
                if (!steps[currentStep].querySelector('.progress-fill')) {
                    const progressContainer = document.createElement('div');
                    progressContainer.className = 'progress-bar';
                    progressBar.className = 'progress-fill';
                    progressContainer.appendChild(progressBar);
                    steps[currentStep].querySelector('.step-content').appendChild(progressContainer);
                }

                let progress = 0;
                const progressInterval = setInterval(() => {
                    progress += 5;
                    progressBar.style.width = `${progress}%`;

                    if (progress >= 100) {
                        clearInterval(progressInterval);
                        currentStep++;
                        setTimeout(executeStep, 500);
                    }
                }, 100);
            }
        };

        executeStep();
    }

    manualOverride() {
        this.showNotification('Manual override activated', 'warning');
        // Pause automated responses
        clearInterval(this.threatInterval);
        document.querySelector('.response-orchestration .status').textContent = 'Manual';
        document.querySelector('.response-orchestration .status').className = 'status standby';
    }

    updateMetrics() {
        // Simulate metric changes
        this.metrics.threatsBlocked += Math.floor(Math.random() * 5);
        this.metrics.responseTime = Math.max(0.8, this.metrics.responseTime + (Math.random() - 0.5) * 0.2);
        this.metrics.falsePositives += Math.random() > 0.8 ? 1 : 0;

        // Update display
        document.getElementById('threatsBlocked').textContent = this.metrics.threatsBlocked;
        document.getElementById('responseTime').textContent = this.metrics.responseTime.toFixed(1) + 's';
        document.getElementById('uptime').textContent = this.metrics.uptime + '%';
        document.getElementById('falsePositives').textContent = this.metrics.falsePositives;

        // Update chart
        if (this.chart) {
            const newData = this.chart.data.datasets[0].data;
            newData.shift();
            newData.push(Math.floor(Math.random() * 25) + 5);
            this.chart.update();
        }
    }

    scanNetwork() {
        this.showNotification('Network scan initiated', 'info');
        // Simulate scan progress
        setTimeout(() => {
            this.showNotification('Network scan completed - 3 threats detected', 'success');
        }, 3000);
    }

    updateSignatures() {
        this.showNotification('Updating threat signatures...', 'info');
        setTimeout(() => {
            this.showNotification('Threat signatures updated successfully', 'success');
        }, 2000);
    }

    syncIntelligence() {
        this.showNotification('Synchronizing threat intelligence...', 'info');
        setTimeout(() => {
            this.showNotification('Threat intelligence synchronized', 'success');
        }, 1500);
    }

    analyzeTrends() {
        this.showNotification('Analyzing threat trends...', 'info');
        setTimeout(() => {
            this.showNotification('Trend analysis complete - DDoS attacks increasing', 'warning');
        }, 2500);
    }

    emergencyShutdown() {
        if (confirm('Are you sure you want to initiate emergency shutdown? This will stop all services.')) {
            this.showNotification('Emergency shutdown initiated', 'danger');
            this.logAction('Emergency shutdown initiated');
        }
    }

    quarantineSystem() {
        this.showNotification('System quarantine activated', 'warning');
        this.logAction('System quarantined');
    }

    isolateNetwork() {
        this.showNotification('Network isolation activated', 'warning');
        this.logAction('Network isolated');
    }

    restoreBackup() {
        this.showNotification('Backup restoration started', 'info');
        setTimeout(() => {
            this.showNotification('Backup restoration completed', 'success');
        }, 5000);
    }

    logAction(action) {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `
            <span class="log-time">${new Date().toLocaleTimeString()}</span>
            <span class="log-action">${action}</span>
        `;

        const controlLog = document.querySelector('.control-log');
        controlLog.insertBefore(logEntry, controlLog.firstChild);

        // Keep only last 10 entries
        while (controlLog.children.length > 10) {
            controlLog.removeChild(controlLog.lastChild);
        }
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

    getTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return 'Just now';
        if (minutes === 1) return '1 min ago';
        if (minutes < 60) return `${minutes} min ago`;

        const hours = Math.floor(minutes / 60);
        if (hours === 1) return '1 hour ago';
        return `${hours} hours ago`;
    }

    getRandomTeam() {
        const teams = ['SOC Team', 'Network Team', 'Security Team', 'DevOps Team'];
        return teams[Math.floor(Math.random() * teams.length)];
    }
}

// Initialize the orchestrator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThreatResponseOrchestrator();
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
    font-weight: 600;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
}

.notification.show {
    transform: translateX(0);
}

.notification.success { background: #38a169; }
.notification.warning { background: #d69e2e; }
.notification.danger { background: #e53e3e; }
.notification.info { background: #3182ce; }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);