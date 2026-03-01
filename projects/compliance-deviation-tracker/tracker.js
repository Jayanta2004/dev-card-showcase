/**
 * Autonomous Compliance Deviation Tracker
 * 
 * Continuously scans operational workflows for deviations from compliance standards.
 * Compares real-time operational data against regulatory rule sets and generates alerts.
 */

class ComplianceDeviationTracker {
    constructor() {
        this.monitoring = false;
        this.monitoringInterval = null;
        this.workflows = [];
        this.frameworks = [];
        this.deviations = [];
        this.auditLog = [];
        this.selectedDeviation = null;
        this.selectedWorkflow = null;
        this.complianceHistory = [];

        this.config = {
            scanInterval: 30000, // 30 seconds
            maxAuditLogSize: 100,
            maxHistorySize: 24 // 24 hours
        };

        this.initializeDefaults();
    }

    /**
     * Initialize default frameworks and workflows
     */
    initializeDefaults() {
        // Initialize regulatory frameworks
        this.frameworks = [
            {
                id: 'gdpr',
                name: 'GDPR',
                fullName: 'General Data Protection Regulation',
                description: 'EU data protection and privacy regulation',
                rules: [
                    { id: 'gdpr-1', name: 'Data Encryption at Rest', severity: 'critical' },
                    { id: 'gdpr-2', name: 'Data Encryption in Transit', severity: 'critical' },
                    { id: 'gdpr-3', name: 'Data Access Controls', severity: 'high' },
                    { id: 'gdpr-4', name: 'Right to Erasure', severity: 'high' },
                    { id: 'gdpr-5', name: 'Consent Management', severity: 'medium' },
                    { id: 'gdpr-6', name: 'Data Portability', severity: 'medium' },
                    { id: 'gdpr-7', name: 'Privacy by Design', severity: 'high' },
                    { id: 'gdpr-8', name: 'Data Breach Notification', severity: 'critical' }
                ],
                enabled: true
            },
            {
                id: 'hipaa',
                name: 'HIPAA',
                fullName: 'Health Insurance Portability and Accountability Act',
                description: 'Healthcare data privacy and security standards',
                rules: [
                    { id: 'hipaa-1', name: 'PHI Encryption', severity: 'critical' },
                    { id: 'hipaa-2', name: 'Access Audit Logs', severity: 'critical' },
                    { id: 'hipaa-3', name: 'Minimum Necessary Rule', severity: 'high' },
                    { id: 'hipaa-4', name: 'Business Associate Agreements', severity: 'high' },
                    { id: 'hipaa-5', name: 'Breach Notification Rule', severity: 'critical' },
                    { id: 'hipaa-6', name: 'Patient Rights', severity: 'medium' }
                ],
                enabled: true
            },
            {
                id: 'sox',
                name: 'SOX',
                fullName: 'Sarbanes-Oxley Act',
                description: 'Financial reporting and auditing standards',
                rules: [
                    { id: 'sox-1', name: 'Financial Data Integrity', severity: 'critical' },
                    { id: 'sox-2', name: 'Access Controls', severity: 'critical' },
                    { id: 'sox-3', name: 'Audit Trail', severity: 'high' },
                    { id: 'sox-4', name: 'Change Management', severity: 'high' },
                    { id: 'sox-5', name: 'Segregation of Duties', severity: 'medium' }
                ],
                enabled: true
            },
            {
                id: 'pci-dss',
                name: 'PCI-DSS',
                fullName: 'Payment Card Industry Data Security Standard',
                description: 'Credit card data protection standards',
                rules: [
                    { id: 'pci-1', name: 'Cardholder Data Encryption', severity: 'critical' },
                    { id: 'pci-2', name: 'Network Segmentation', severity: 'critical' },
                    { id: 'pci-3', name: 'Vulnerability Management', severity: 'high' },
                    { id: 'pci-4', name: 'Access Controls', severity: 'high' },
                    { id: 'pci-5', name: 'Security Testing', severity: 'medium' },
                    { id: 'pci-6', name: 'Information Security Policy', severity: 'medium' }
                ],
                enabled: true
            }
        ];

        // Initialize workflows
        this.workflows = [
            {
                id: 'user-authentication',
                name: 'User Authentication',
                category: 'Security',
                frameworks: ['gdpr', 'hipaa'],
                status: 'compliant',
                lastScan: null,
                deviationCount: 0,
                complianceScore: 100,
                rules: 12
            },
            {
                id: 'data-storage',
                name: 'Data Storage',
                category: 'Data Management',
                frameworks: ['gdpr', 'hipaa', 'pci-dss'],
                status: 'compliant',
                lastScan: null,
                deviationCount: 0,
                complianceScore: 100,
                rules: 15
            },
            {
                id: 'payment-processing',
                name: 'Payment Processing',
                category: 'Financial',
                frameworks: ['pci-dss', 'sox'],
                status: 'compliant',
                lastScan: null,
                deviationCount: 0,
                complianceScore: 100,
                rules: 10
            },
            {
                id: 'financial-reporting',
                name: 'Financial Reporting',
                category: 'Financial',
                frameworks: ['sox'],
                status: 'compliant',
                lastScan: null,
                deviationCount: 0,
                complianceScore: 100,
                rules: 8
            },
            {
                id: 'user-data-export',
                name: 'User Data Export',
                category: 'Data Management',
                frameworks: ['gdpr'],
                status: 'compliant',
                lastScan: null,
                deviationCount: 0,
                complianceScore: 100,
                rules: 6
            },
            {
                id: 'audit-logging',
                name: 'Audit Logging',
                category: 'Monitoring',
                frameworks: ['gdpr', 'hipaa', 'sox'],
                status: 'compliant',
                lastScan: null,
                deviationCount: 0,
                complianceScore: 100,
                rules: 9
            }
        ];

        // Initialize compliance history (24 hours)
        const now = new Date();
        for (let i = 23; i >= 0; i--) {
            this.complianceHistory.push({
                timestamp: new Date(now - i * 3600000),
                score: 100,
                deviations: 0
            });
        }
    }

    /**
     * Initialize UI
     */
    initialize() {
        this.updateUI();
        this.logAudit('configuration', 'System initialized');
    }

    /**
     * Toggle monitoring on/off
     */
    toggleMonitoring() {
        this.monitoring = !this.monitoring;

        if (this.monitoring) {
            this.startMonitoring();
            this.logAudit('scan', 'Monitoring started');
        } else {
            this.stopMonitoring();
            this.logAudit('scan', 'Monitoring stopped');
        }

        this.updateUI();
    }

    /**
     * Start continuous monitoring
     */
    startMonitoring() {
        // Initial scan
        this.scanAll();

        // Schedule periodic scans
        this.monitoringInterval = setInterval(() => {
            this.scanAll();
        }, this.config.scanInterval);
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }

    /**
     * Scan all workflows
     */
    scanAll() {
        this.logAudit('scan', `Scanning ${this.workflows.length} workflows`);

        this.workflows.forEach(workflow => {
            this.scanWorkflow(workflow.id);
        });

        this.updateComplianceHistory();
        this.updateUI();
    }

    /**
     * Scan a specific workflow
     */
    scanWorkflow(workflowId = null) {
        const workflow = workflowId 
            ? this.workflows.find(w => w.id === workflowId)
            : this.selectedWorkflow;

        if (!workflow) return;

        workflow.lastScan = new Date();

        // Simulate compliance check with random deviations
        const deviationProbability = 0.15; // 15% chance of finding deviation
        const foundDeviations = [];

        workflow.frameworks.forEach(frameworkId => {
            const framework = this.frameworks.find(f => f.id === frameworkId);
            if (!framework || !framework.enabled) return;

            framework.rules.forEach(rule => {
                if (Math.random() < deviationProbability) {
                    const deviation = {
                        id: `dev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        workflowId: workflow.id,
                        workflowName: workflow.name,
                        frameworkId: framework.id,
                        frameworkName: framework.name,
                        ruleId: rule.id,
                        ruleName: rule.name,
                        severity: rule.severity,
                        status: 'open',
                        detectedAt: new Date(),
                        acknowledgedAt: null,
                        resolvedAt: null,
                        description: this.generateDeviationDescription(workflow, rule),
                        recommendation: this.generateRecommendation(rule)
                    };

                    foundDeviations.push(deviation);
                    this.deviations.push(deviation);
                    this.logAudit('deviation', `Deviation found: ${rule.name} in ${workflow.name}`);
                }
            });
        });

        // Update workflow status
        workflow.deviationCount = this.deviations.filter(d => 
            d.workflowId === workflow.id && d.status === 'open'
        ).length;

        workflow.complianceScore = this.calculateWorkflowScore(workflow);
        workflow.status = workflow.deviationCount === 0 ? 'compliant' : 'non-compliant';

        if (foundDeviations.length > 0) {
            this.logAudit('scan', `Found ${foundDeviations.length} deviation(s) in ${workflow.name}`);
        }

        this.updateUI();
    }

    /**
     * Generate deviation description
     */
    generateDeviationDescription(workflow, rule) {
        const descriptions = [
            `${workflow.name} workflow does not meet ${rule.name} requirements`,
            `Non-compliance detected: ${rule.name} violation in ${workflow.name}`,
            `${rule.name} control is missing or improperly configured`,
            `${workflow.name} lacks proper implementation of ${rule.name}`,
            `Regulatory requirement ${rule.name} not satisfied in ${workflow.name}`
        ];

        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }

    /**
     * Generate recommendation
     */
    generateRecommendation(rule) {
        const recommendations = {
            'critical': 'Immediate action required. Implement compensating controls and escalate to compliance team.',
            'high': 'Address within 48 hours. Review and update security policies.',
            'medium': 'Schedule remediation within next sprint cycle.',
            'low': 'Add to backlog for future improvement.'
        };

        return recommendations[rule.severity] || 'Review and address as appropriate.';
    }

    /**
     * Calculate workflow compliance score
     */
    calculateWorkflowScore(workflow) {
        const openDeviations = this.deviations.filter(d => 
            d.workflowId === workflow.id && d.status === 'open'
        );

        if (openDeviations.length === 0) return 100;

        const severityWeights = {
            critical: 25,
            high: 15,
            medium: 10,
            low: 5
        };

        const totalDeduction = openDeviations.reduce((sum, dev) => {
            return sum + (severityWeights[dev.severity] || 5);
        }, 0);

        return Math.max(0, 100 - totalDeduction);
    }

    /**
     * Calculate overall compliance score
     */
    calculateOverallScore() {
        if (this.workflows.length === 0) return 100;

        const totalScore = this.workflows.reduce((sum, w) => sum + w.complianceScore, 0);
        return Math.round(totalScore / this.workflows.length);
    }

    /**
     * Update compliance history
     */
    updateComplianceHistory() {
        const score = this.calculateOverallScore();
        const openDeviations = this.deviations.filter(d => d.status === 'open').length;

        this.complianceHistory.push({
            timestamp: new Date(),
            score: score,
            deviations: openDeviations
        });

        // Keep only last 24 hours
        if (this.complianceHistory.length > this.config.maxHistorySize) {
            this.complianceHistory.shift();
        }
    }

    /**
     * Acknowledge deviation
     */
    acknowledgeDeviation() {
        if (!this.selectedDeviation) return;

        this.selectedDeviation.status = 'acknowledged';
        this.selectedDeviation.acknowledgedAt = new Date();

        this.logAudit('deviation', `Deviation acknowledged: ${this.selectedDeviation.ruleName}`);
        this.closeModal();
        this.updateUI();
    }

    /**
     * Resolve deviation
     */
    resolveDeviation() {
        if (!this.selectedDeviation) return;

        this.selectedDeviation.status = 'resolved';
        this.selectedDeviation.resolvedAt = new Date();

        // Update workflow stats
        const workflow = this.workflows.find(w => w.id === this.selectedDeviation.workflowId);
        if (workflow) {
            workflow.deviationCount = this.deviations.filter(d => 
                d.workflowId === workflow.id && d.status === 'open'
            ).length;
            workflow.complianceScore = this.calculateWorkflowScore(workflow);
            workflow.status = workflow.deviationCount === 0 ? 'compliant' : 'non-compliant';
        }

        this.logAudit('resolution', `Deviation resolved: ${this.selectedDeviation.ruleName}`);
        this.updateComplianceHistory();
        this.closeModal();
        this.updateUI();
    }

    /**
     * Show deviation details
     */
    showDeviationDetails(deviationId) {
        const deviation = this.deviations.find(d => d.id === deviationId);
        if (!deviation) return;

        this.selectedDeviation = deviation;

        const detailsHtml = `
            <div class="detail-row">
                <span class="label">Workflow:</span>
                <span class="value">${deviation.workflowName}</span>
            </div>
            <div class="detail-row">
                <span class="label">Framework:</span>
                <span class="value">${deviation.frameworkName}</span>
            </div>
            <div class="detail-row">
                <span class="label">Rule:</span>
                <span class="value">${deviation.ruleName}</span>
            </div>
            <div class="detail-row">
                <span class="label">Severity:</span>
                <span class="value">${deviation.severity.toUpperCase()}</span>
            </div>
            <div class="detail-row">
                <span class="label">Status:</span>
                <span class="value">${deviation.status.toUpperCase()}</span>
            </div>
            <div class="detail-row">
                <span class="label">Detected:</span>
                <span class="value">${deviation.detectedAt.toLocaleString()}</span>
            </div>
            ${deviation.acknowledgedAt ? `
            <div class="detail-row">
                <span class="label">Acknowledged:</span>
                <span class="value">${deviation.acknowledgedAt.toLocaleString()}</span>
            </div>
            ` : ''}
            ${deviation.resolvedAt ? `
            <div class="detail-row">
                <span class="label">Resolved:</span>
                <span class="value">${deviation.resolvedAt.toLocaleString()}</span>
            </div>
            ` : ''}
            <div class="detail-row">
                <span class="label">Description:</span>
                <span class="value">${deviation.description}</span>
            </div>
            <div class="detail-row">
                <span class="label">Recommendation:</span>
                <span class="value">${deviation.recommendation}</span>
            </div>
        `;

        document.getElementById('deviationTitle').textContent = `Deviation: ${deviation.ruleName}`;
        document.getElementById('deviationDetails').innerHTML = detailsHtml;
        document.getElementById('deviationModal').classList.add('show');
    }

    /**
     * Show workflow details
     */
    showWorkflowDetails(workflowId) {
        const workflow = this.workflows.find(w => w.id === workflowId);
        if (!workflow) return;

        this.selectedWorkflow = workflow;

        const frameworks = workflow.frameworks
            .map(id => this.frameworks.find(f => f.id === id)?.name)
            .join(', ');

        const detailsHtml = `
            <div class="detail-row">
                <span class="label">Name:</span>
                <span class="value">${workflow.name}</span>
            </div>
            <div class="detail-row">
                <span class="label">Category:</span>
                <span class="value">${workflow.category}</span>
            </div>
            <div class="detail-row">
                <span class="label">Frameworks:</span>
                <span class="value">${frameworks}</span>
            </div>
            <div class="detail-row">
                <span class="label">Status:</span>
                <span class="value">${workflow.status.toUpperCase()}</span>
            </div>
            <div class="detail-row">
                <span class="label">Compliance Score:</span>
                <span class="value">${workflow.complianceScore}%</span>
            </div>
            <div class="detail-row">
                <span class="label">Open Deviations:</span>
                <span class="value">${workflow.deviationCount}</span>
            </div>
            <div class="detail-row">
                <span class="label">Total Rules:</span>
                <span class="value">${workflow.rules}</span>
            </div>
            <div class="detail-row">
                <span class="label">Last Scan:</span>
                <span class="value">${workflow.lastScan ? workflow.lastScan.toLocaleString() : 'Never'}</span>
            </div>
        `;

        document.getElementById('workflowTitle').textContent = workflow.name;
        document.getElementById('workflowDetails').innerHTML = detailsHtml;
        document.getElementById('workflowModal').classList.add('show');
    }

    /**
     * Close modal
     */
    closeModal() {
        document.getElementById('deviationModal').classList.remove('show');
        document.getElementById('workflowModal').classList.remove('show');
        this.selectedDeviation = null;
        this.selectedWorkflow = null;
    }

    /**
     * Apply filters to deviations list
     */
    applyFilters() {
        const severity = document.getElementById('severityFilter')?.value || 'all';
        const framework = document.getElementById('frameworkFilter')?.value || 'all';
        const status = document.getElementById('statusFilter')?.value || 'all';

        let filtered = this.deviations;

        if (severity !== 'all') {
            filtered = filtered.filter(d => d.severity === severity);
        }

        if (framework !== 'all') {
            filtered = filtered.filter(d => d.frameworkId === framework);
        }

        if (status !== 'all') {
            filtered = filtered.filter(d => d.status === status);
        }

        this.renderDeviationsList(filtered);
    }

    /**
     * Filter audit log
     */
    filterAuditLog() {
        const search = document.getElementById('auditSearch')?.value.toLowerCase() || '';
        const type = document.getElementById('auditTypeFilter')?.value || 'all';

        let filtered = this.auditLog;

        if (type !== 'all') {
            filtered = filtered.filter(a => a.type === type);
        }

        if (search) {
            filtered = filtered.filter(a => 
                a.message.toLowerCase().includes(search)
            );
        }

        this.renderAuditLog(filtered);
    }

    /**
     * Export report
     */
    exportReport() {
        const overallScore = this.calculateOverallScore();
        const openDeviations = this.deviations.filter(d => d.status === 'open');
        const criticalCount = openDeviations.filter(d => d.severity === 'critical').length;

        const report = `
Compliance Deviation Tracker Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated: ${new Date().toLocaleString()}

Overall Status:
  • Compliance Score: ${overallScore}%
  • Total Workflows: ${this.workflows.length}
  • Compliant Workflows: ${this.workflows.filter(w => w.status === 'compliant').length}
  • Total Deviations: ${openDeviations.length}
  • Critical Issues: ${criticalCount}

Active Frameworks:
${this.frameworks.filter(f => f.enabled).map(f => `  • ${f.name} (${f.fullName})`).join('\n')}

Workflow Summary:
${this.workflows.map(w => `  • ${w.name}: ${w.complianceScore}% (${w.deviationCount} deviations)`).join('\n')}

Critical Deviations:
${openDeviations.filter(d => d.severity === 'critical').map(d => 
    `  • ${d.workflowName}: ${d.ruleName}`
).join('\n') || '  None'}

Recommendations:
${criticalCount > 0 ? '  • Address critical deviations immediately' : ''}
${openDeviations.length > 5 ? '  • Schedule remediation sprint for open issues' : ''}
${overallScore < 90 ? '  • Review and update compliance procedures' : ''}
${overallScore >= 95 ? '  • Maintain current compliance posture' : ''}
`;

        alert(report);
        this.logAudit('configuration', 'Compliance report generated');
    }

    /**
     * Log audit event
     */
    logAudit(type, message) {
        this.auditLog.push({
            type: type,
            message: message,
            timestamp: new Date()
        });

        // Keep log size manageable
        if (this.auditLog.length > this.config.maxAuditLogSize) {
            this.auditLog.shift();
        }
    }

    /**
     * Handle tab change
     */
    onTabChange(tabName) {
        if (tabName === 'deviations') {
            this.applyFilters();
        } else if (tabName === 'audit') {
            this.filterAuditLog();
        }
    }

    /**
     * Render deviations list
     */
    renderDeviationsList(deviations = this.deviations) {
        const container = document.getElementById('deviationsList');

        if (deviations.length === 0) {
            container.innerHTML = '<div class="placeholder">No deviations found</div>';
            return;
        }

        container.innerHTML = deviations.map(deviation => `
            <div class="deviation-card ${deviation.severity}" onclick="window.tracker.showDeviationDetails('${deviation.id}')">
                <div class="deviation-header">
                    <span class="deviation-title">${deviation.ruleName}</span>
                    <span class="deviation-badge ${deviation.severity}">${deviation.severity}</span>
                </div>
                <div class="deviation-info">
                    <div class="deviation-meta">
                        <span class="label">Workflow:</span>
                        <span class="value">${deviation.workflowName}</span>
                    </div>
                    <div class="deviation-meta">
                        <span class="label">Framework:</span>
                        <span class="value">${deviation.frameworkName}</span>
                    </div>
                    <div class="deviation-meta">
                        <span class="label">Status:</span>
                        <span class="value">${deviation.status.toUpperCase()}</span>
                    </div>
                    <div class="deviation-meta">
                        <span class="label">Detected:</span>
                        <span class="value">${deviation.detectedAt.toLocaleTimeString()}</span>
                    </div>
                </div>
                <div class="deviation-description">${deviation.description}</div>
            </div>
        `).join('');
    }

    /**
     * Render workflows grid
     */
    renderWorkflows() {
        const container = document.getElementById('workflowsGrid');

        container.innerHTML = this.workflows.map(workflow => `
            <div class="workflow-card" onclick="window.tracker.showWorkflowDetails('${workflow.id}')">
                <div class="workflow-header">
                    <div class="workflow-name">${workflow.name}</div>
                    <div class="workflow-status ${workflow.status}">${workflow.status.toUpperCase()}</div>
                </div>
                <div class="workflow-body">
                    <div class="workflow-metric">
                        <span class="label">Category:</span>
                        <span class="value">${workflow.category}</span>
                    </div>
                    <div class="workflow-metric">
                        <span class="label">Compliance:</span>
                        <span class="value">${workflow.complianceScore}%</span>
                    </div>
                    <div class="workflow-metric">
                        <span class="label">Deviations:</span>
                        <span class="value">${workflow.deviationCount}</span>
                    </div>
                    <div class="workflow-metric">
                        <span class="label">Last Scan:</span>
                        <span class="value">${workflow.lastScan ? workflow.lastScan.toLocaleTimeString() : 'Never'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render frameworks grid
     */
    renderFrameworks() {
        const container = document.getElementById('frameworksGrid');

        container.innerHTML = this.frameworks.map(framework => {
            const workflowCount = this.workflows.filter(w => w.frameworks.includes(framework.id)).length;
            const deviationCount = this.deviations.filter(d => 
                d.frameworkId === framework.id && d.status === 'open'
            ).length;

            return `
                <div class="framework-card">
                    <h4>${framework.name}</h4>
                    <p class="framework-description">${framework.description}</p>
                    <div class="framework-stats">
                        <div class="framework-stat">
                            <div class="value">${framework.rules.length}</div>
                            <div class="label">Rules</div>
                        </div>
                        <div class="framework-stat">
                            <div class="value">${workflowCount}</div>
                            <div class="label">Workflows</div>
                        </div>
                        <div class="framework-stat">
                            <div class="value">${deviationCount}</div>
                            <div class="label">Deviations</div>
                        </div>
                        <div class="framework-stat">
                            <div class="value">${framework.enabled ? 'Active' : 'Disabled'}</div>
                            <div class="label">Status</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Render framework coverage
     */
    renderFrameworkCoverage() {
        const container = document.getElementById('frameworkCoverage');

        const enabled = this.frameworks.filter(f => f.enabled);

        container.innerHTML = enabled.map(framework => `
            <div class="framework-item">
                <span class="framework-name">${framework.name}</span>
                <span class="framework-rules">${framework.rules.length} rules</span>
            </div>
        `).join('');
    }

    /**
     * Render recent deviations
     */
    renderRecentDeviations() {
        const container = document.getElementById('recentDeviations');

        const recent = this.deviations
            .filter(d => d.status === 'open')
            .sort((a, b) => b.detectedAt - a.detectedAt)
            .slice(0, 5);

        if (recent.length === 0) {
            container.innerHTML = '<div class="placeholder">No recent deviations</div>';
            return;
        }

        container.innerHTML = recent.map(deviation => `
            <div class="activity-item ${deviation.severity}" onclick="window.tracker.showDeviationDetails('${deviation.id}')">
                <div class="activity-header">
                    <span class="activity-title">${deviation.ruleName}</span>
                    <span class="activity-time">${this.getTimeAgo(deviation.detectedAt)}</span>
                </div>
                <div class="activity-description">${deviation.workflowName} - ${deviation.frameworkName}</div>
            </div>
        `).join('');
    }

    /**
     * Render audit log
     */
    renderAuditLog(logs = this.auditLog) {
        const container = document.getElementById('auditList');

        if (logs.length === 0) {
            container.innerHTML = '<div class="placeholder">No audit entries</div>';
            return;
        }

        const sorted = [...logs].sort((a, b) => b.timestamp - a.timestamp);

        container.innerHTML = sorted.map(log => `
            <div class="audit-item ${log.type}">
                <div class="audit-header">
                    <span class="audit-type">${log.type}</span>
                    <span class="audit-time">${log.timestamp.toLocaleString()}</span>
                </div>
                <div class="audit-message">${log.message}</div>
            </div>
        `).join('');
    }

    /**
     * Render compliance chart
     */
    renderComplianceChart() {
        const canvas = document.getElementById('complianceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        canvas.width = width;
        canvas.height = height;

        const padding = 50;
        const graphWidth = width - padding * 2;
        const graphHeight = height - padding * 2;

        const maxScore = 100;
        const dataPoints = this.complianceHistory.length;
        const pointSpacing = dataPoints > 1 ? graphWidth / (dataPoints - 1) : graphWidth / 2;

        // Draw axes
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Draw compliance line
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 3;
        ctx.beginPath();

        this.complianceHistory.forEach((point, index) => {
            const x = padding + (index * pointSpacing);
            const y = height - padding - (point.score / maxScore) * graphHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw threshold line at 90%
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        const thresholdY = height - padding - (90 / maxScore) * graphHeight;
        ctx.beginPath();
        ctx.moveTo(padding, thresholdY);
        ctx.lineTo(width - padding, thresholdY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Labels
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Compliance Score (%)', width / 2, height - 10);
    }

    /**
     * Get time ago string
     */
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    /**
     * Update UI
     */
    updateUI() {
        const overallScore = this.calculateOverallScore();
        const compliantWorkflows = this.workflows.filter(w => w.status === 'compliant').length;
        const openDeviations = this.deviations.filter(d => d.status === 'open');
        const criticalCount = openDeviations.filter(d => d.severity === 'critical').length;

        // Update overview cards
        document.getElementById('compliantCount').textContent = compliantWorkflows;
        document.getElementById('deviationCount').textContent = openDeviations.length;
        document.getElementById('complianceScore').textContent = overallScore + '%';
        document.getElementById('criticalCount').textContent = criticalCount;

        // Update monitoring status
        const statusDot = document.getElementById('statusDot');
        if (statusDot) {
            statusDot.className = 'status-dot' + (this.monitoring ? ' active' : '');
        }

        document.getElementById('monitoringStatus').textContent = this.monitoring ? 'Active' : 'Stopped';
        
        const lastScan = this.workflows.reduce((latest, w) => {
            return w.lastScan && (!latest || w.lastScan > latest) ? w.lastScan : latest;
        }, null);
        
        document.getElementById('lastScan').textContent = lastScan ? lastScan.toLocaleTimeString() : 'Never';
        document.getElementById('monitoredWorkflows').textContent = this.workflows.length;

        const totalRules = this.frameworks
            .filter(f => f.enabled)
            .reduce((sum, f) => sum + f.rules.length, 0);
        document.getElementById('activeRules').textContent = totalRules;

        // Update footer
        document.getElementById('systemStatus').textContent = this.monitoring ? 'Active' : 'Idle';
        document.getElementById('activeFrameworks').textContent = this.frameworks.filter(f => f.enabled).length;
        document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();

        // Update button text
        const startBtn = document.getElementById('startMonitoring');
        if (startBtn) {
            startBtn.textContent = this.monitoring ? 'Stop Monitoring' : 'Start Monitoring';
        }

        // Render sections
        this.renderFrameworkCoverage();
        this.renderRecentDeviations();
        this.renderWorkflows();
        this.renderFrameworks();
        this.renderComplianceChart();
        this.renderAuditLog();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComplianceDeviationTracker;
}
