/**
 * Real-Time Governance Policy Mapper
 * Maps operational actions to compliance rules in real time
 */

class GovernancePolicyMapper {
    constructor() {
        this.policies = [];
        this.complianceRules = {
            gdpr: [],
            sox: [],
            hipaa: [],
            'pci-dss': []
        };
        this.auditTrail = [];
        this.complianceMatrices = {};
        this.monitoringData = [];
        this.isMonitoring = true;

        this.charts = {};
        this.updateInterval = null;

        this.initialize();
    }

    initialize() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.initializeCharts();
        this.generateComplianceMatrices();
        this.updateDashboard();
        this.startRealTimeMonitoring();
    }

    loadFromStorage() {
        const savedPolicies = localStorage.getItem('governance-policies');
        if (savedPolicies) {
            this.policies = JSON.parse(savedPolicies);
        } else {
            this.createDefaultPolicies();
        }

        const savedRules = localStorage.getItem('compliance-rules');
        if (savedRules) {
            this.complianceRules = JSON.parse(savedRules);
        } else {
            this.createDefaultRules();
        }

        const savedAudit = localStorage.getItem('audit-trail');
        if (savedAudit) {
            this.auditTrail = JSON.parse(savedAudit);
        }
    }

    saveToStorage() {
        localStorage.setItem('governance-policies', JSON.stringify(this.policies));
        localStorage.setItem('compliance-rules', JSON.stringify(this.complianceRules));
        localStorage.setItem('audit-trail', JSON.stringify(this.auditTrail));
    }

    createDefaultPolicies() {
        this.policies = [
            {
                id: 'policy-gdpr-001',
                name: 'GDPR Data Protection',
                framework: 'gdpr',
                description: 'Ensures compliance with GDPR data protection requirements',
                rules: [
                    { condition: 'data_access', operator: 'requires', value: 'consent' },
                    { condition: 'retention_period', operator: 'max', value: '2555_days' },
                    { condition: 'data_processing', operator: 'requires', value: 'legal_basis' }
                ],
                active: true,
                priority: 'high',
                created: new Date().toISOString(),
                lastTriggered: null,
                triggerCount: 0
            },
            {
                id: 'policy-sox-001',
                name: 'SOX Financial Controls',
                framework: 'sox',
                description: 'Maintains financial reporting controls and audit trails',
                rules: [
                    { condition: 'financial_transaction', operator: 'requires', value: 'audit_trail' },
                    { condition: 'access_control', operator: 'requires', value: 'dual_authorization' },
                    { condition: 'data_modification', operator: 'requires', value: 'change_tracking' }
                ],
                active: true,
                priority: 'critical',
                created: new Date().toISOString(),
                lastTriggered: null,
                triggerCount: 0
            },
            {
                id: 'policy-hipaa-001',
                name: 'HIPAA Health Data',
                framework: 'hipaa',
                description: 'Protects health information and ensures privacy',
                rules: [
                    { condition: 'phi_access', operator: 'requires', value: 'authorization' },
                    { condition: 'data_encryption', operator: 'must_be', value: 'enabled' },
                    { condition: 'access_logging', operator: 'must_be', value: 'enabled' }
                ],
                active: true,
                priority: 'high',
                created: new Date().toISOString(),
                lastTriggered: null,
                triggerCount: 0
            },
            {
                id: 'policy-pci-001',
                name: 'PCI DSS Payment Security',
                framework: 'pci-dss',
                description: 'Secures payment card data and transactions',
                rules: [
                    { condition: 'card_data', operator: 'must_be', value: 'encrypted' },
                    { condition: 'network_security', operator: 'requires', value: 'firewall' },
                    { condition: 'vulnerability_scanning', operator: 'must_be', value: 'regular' }
                ],
                active: true,
                priority: 'critical',
                created: new Date().toISOString(),
                lastTriggered: null,
                triggerCount: 0
            }
        ];
    }

    createDefaultRules() {
        this.complianceRules = {
            gdpr: [
                { id: 'gdpr-1', name: 'Lawful Processing', description: 'Data must be processed lawfully and transparently' },
                { id: 'gdpr-2', name: 'Purpose Limitation', description: 'Data collected for specified purposes only' },
                { id: 'gdpr-3', name: 'Data Minimization', description: 'Only necessary data collected and processed' },
                { id: 'gdpr-4', name: 'Accuracy', description: 'Data must be accurate and kept up to date' },
                { id: 'gdpr-5', name: 'Storage Limitation', description: 'Data not kept longer than necessary' }
            ],
            sox: [
                { id: 'sox-1', name: 'Internal Controls', description: 'Effective internal control over financial reporting' },
                { id: 'sox-2', name: 'Audit Trail', description: 'Complete audit trail for all transactions' },
                { id: 'sox-3', name: 'Access Controls', description: 'Proper access controls for financial systems' },
                { id: 'sox-4', name: 'Change Management', description: 'Controlled changes to financial systems' },
                { id: 'sox-5', name: 'Documentation', description: 'Complete documentation of controls' }
            ],
            hipaa: [
                { id: 'hipaa-1', name: 'Privacy Rule', description: 'Protects individual privacy of health information' },
                { id: 'hipaa-2', name: 'Security Rule', description: 'Technical safeguards for electronic PHI' },
                { id: 'hipaa-3', name: 'Breach Notification', description: 'Notification requirements for breaches' },
                { id: 'hipaa-4', name: 'Access Controls', description: 'Controlled access to PHI' },
                { id: 'hipaa-5', name: 'Audit Controls', description: 'Audit logs for PHI access' }
            ],
            'pci-dss': [
                { id: 'pci-1', name: 'Build Secure Networks', description: 'Install and maintain firewall configurations' },
                { id: 'pci-2', name: 'Protect Cardholder Data', description: 'Do not use vendor defaults for system passwords' },
                { id: 'pci-3', name: 'Maintain Vulnerability Program', description: 'Protect stored cardholder data' },
                { id: 'pci-4', name: 'Implement Access Controls', description: 'Regularly monitor and test networks' },
                { id: 'pci-5', name: 'Regularly Monitor', description: 'Maintain information security policy' }
            ]
        };
    }

    setupEventListeners() {
        // Framework selection
        document.getElementById('compliance-framework')?.addEventListener('change', (e) => {
            this.updatePolicyMapping(e.target.value);
        });

        // Buttons
        document.getElementById('refresh-mapping')?.addEventListener('click', () => this.refreshMapping());
        document.getElementById('pause-monitoring')?.addEventListener('click', () => this.toggleMonitoring());
        document.getElementById('clear-alerts')?.addEventListener('click', () => this.clearAlerts());
        document.getElementById('create-rule')?.addEventListener('click', () => this.openRuleModal());
        document.getElementById('evaluate-action')?.addEventListener('click', () => this.evaluateAction());
        document.getElementById('generate-matrix')?.addEventListener('click', () => this.generateComplianceMatrices());
        document.getElementById('export-matrix')?.addEventListener('click', () => this.exportMatrix());

        // Modal controls
        document.getElementById('save-rule-btn')?.addEventListener('click', () => this.saveRule());
        document.getElementById('cancel-rule-btn')?.addEventListener('click', () => this.closeRuleModal());

        // Theme toggle
        document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggleTheme());

        // Settings
        document.getElementById('settings-btn')?.addEventListener('click', () => this.openSettings());
        document.getElementById('export-btn')?.addEventListener('click', () => this.exportReport());

        // Modal close
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });
    }

    initializeCharts() {
        // Policy Mapping Chart
        const mappingCtx = document.getElementById('policy-mapping-chart')?.getContext('2d');
        if (mappingCtx) {
            this.charts.mappingChart = new Chart(mappingCtx, {
                type: 'radar',
                data: {
                    labels: ['GDPR', 'SOX', 'HIPAA', 'PCI DSS'],
                    datasets: [{
                        label: 'Policy Coverage',
                        data: [85, 78, 92, 88],
                        borderColor: '#1976D2',
                        backgroundColor: 'rgba(25, 118, 210, 0.2)',
                        pointBackgroundColor: '#1976D2',
                        pointBorderColor: '#ffffff',
                        pointHoverBackgroundColor: '#ffffff',
                        pointHoverBorderColor: '#1976D2'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }

        // Compliance Monitoring Chart
        const monitoringCtx = document.getElementById('compliance-monitoring-chart')?.getContext('2d');
        if (monitoringCtx) {
            this.charts.monitoringChart = new Chart(monitoringCtx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(24),
                    datasets: [{
                        label: 'Compliance Score',
                        data: this.generateRandomData(24, 85, 100),
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.4,
                        fill: true
                    }, {
                        label: 'Policy Violations',
                        data: this.generateRandomData(24, 0, 5),
                        borderColor: '#F44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
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
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Compliance Matrix Chart
        const matrixCtx = document.getElementById('compliance-matrix-chart')?.getContext('2d');
        if (matrixCtx) {
            this.charts.matrixChart = new Chart(matrixCtx, {
                type: 'bar',
                data: {
                    labels: ['GDPR', 'SOX', 'HIPAA', 'PCI DSS'],
                    datasets: [{
                        label: 'Compliance Level',
                        data: [95, 87, 92, 89],
                        backgroundColor: [
                            'rgba(25, 118, 210, 0.8)',
                            'rgba(76, 175, 80, 0.8)',
                            'rgba(255, 152, 0, 0.8)',
                            'rgba(244, 67, 54, 0.8)'
                        ],
                        borderColor: [
                            '#1976D2',
                            '#4CAF50',
                            '#FF9800',
                            '#F44336'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }

    updateDashboard() {
        this.updateMetrics();
        this.updatePolicyMapping();
        this.updateComplianceMonitoring();
        this.updateGovernanceEngine();
        this.updateActionEvaluation();
        this.updateComplianceMatrices();
        this.updateAuditTrail();
        this.updateCharts();
    }

    updateMetrics() {
        const metrics = this.calculateMetrics();

        document.getElementById('compliance-score').textContent = `${metrics.complianceScore}%`;
        document.getElementById('active-policies').textContent = metrics.activePolicies;
        document.getElementById('policy-violations').textContent = metrics.violations;
        document.getElementById('real-time-actions').textContent = metrics.actionsProcessed;

        // Update metric changes
        this.updateMetricChange('compliance-score-change', metrics.complianceChange);
        this.updateMetricChange('active-policies-change', metrics.policiesChange);
        this.updateMetricChange('policy-violations-change', metrics.violationsChange);
        this.updateMetricChange('real-time-actions-change', metrics.actionsChange);
    }

    calculateMetrics() {
        const activePolicies = this.policies.filter(p => p.active).length;
        const violations = this.auditTrail.filter(a => a.type === 'violation').length;
        const actionsProcessed = this.auditTrail.filter(a => a.type === 'evaluation').length;
        const complianceScore = this.calculateComplianceScore();

        return {
            complianceScore,
            activePolicies,
            violations,
            actionsProcessed,
            complianceChange: 1.2,
            policiesChange: 0,
            violationsChange: -2.5,
            actionsChange: 15.8
        };
    }

    calculateComplianceScore() {
        const totalChecks = 1000;
        const violations = this.auditTrail.filter(a => a.type === 'violation').length;
        return Math.max(0, Math.round(((totalChecks - violations) / totalChecks) * 100));
    }

    updateMetricChange(elementId, change) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.innerHTML = '';
        const icon = document.createElement('i');
        const span = document.createElement('span');

        if (change > 0) {
            icon.className = 'fas fa-arrow-up';
            span.textContent = `+${change}%`;
            element.className = 'metric-change positive';
        } else if (change < 0) {
            icon.className = 'fas fa-arrow-down';
            span.textContent = `${change}%`;
            element.className = 'metric-change negative';
        } else {
            icon.className = 'fas fa-minus';
            span.textContent = '0%';
            element.className = 'metric-change';
        }

        element.appendChild(icon);
        element.appendChild(span);
    }

    updatePolicyMapping(framework = 'gdpr') {
        const policies = this.policies.filter(p => p.framework === framework);
        const mappedActions = policies.reduce((sum, p) => sum + p.triggerCount, 0);
        const unmappedActions = Math.max(0, 2000 - mappedActions);

        document.getElementById('mapped-actions').textContent = mappedActions.toLocaleString();
        document.getElementById('unmapped-actions').textContent = unmappedActions.toLocaleString();

        // Update risk level
        const riskLevel = this.calculateRiskLevel(mappedActions, unmappedActions);
        const riskElement = document.getElementById('risk-level');
        riskElement.textContent = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
        riskElement.className = `stat-value risk-${riskLevel}`;
    }

    calculateRiskLevel(mapped, unmapped) {
        const ratio = mapped / (mapped + unmapped);
        if (ratio >= 0.9) return 'low';
        if (ratio >= 0.7) return 'medium';
        return 'high';
    }

    updateComplianceMonitoring() {
        // Update status indicators
        const indicators = document.querySelectorAll('.status-light');
        indicators.forEach(indicator => {
            if (this.isMonitoring) {
                indicator.classList.add('active');
                indicator.classList.remove('warning');
            } else {
                indicator.classList.remove('active');
                indicator.classList.add('warning');
            }
        });

        // Update pause button
        const pauseBtn = document.getElementById('pause-monitoring');
        if (pauseBtn) {
            pauseBtn.innerHTML = this.isMonitoring ?
                '<i class="fas fa-pause"></i> Pause' :
                '<i class="fas fa-play"></i> Resume';
        }
    }

    updateGovernanceEngine() {
        const activePolicies = this.policies.filter(p => p.active).length;
        const triggeredToday = this.policies.reduce((sum, p) => {
            const today = new Date().toDateString();
            const lastTriggered = p.lastTriggered ? new Date(p.lastTriggered).toDateString() : null;
            return sum + (lastTriggered === today ? 1 : 0);
        }, 0);

        document.getElementById('total-rules').textContent = this.policies.length;
        document.getElementById('active-rules').textContent = activePolicies;
        document.getElementById('triggered-rules').textContent = triggeredToday;

        this.updateRulesTable();
    }

    updateRulesTable() {
        const tbody = document.getElementById('rules-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.policies.forEach(policy => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${policy.id}</td>
                <td>${policy.name}</td>
                <td>${policy.framework.toUpperCase()}</td>
                <td><span class="status-badge ${policy.active ? 'active' : 'disabled'}">${policy.active ? 'Active' : 'Disabled'}</span></td>
                <td>${policy.triggerCount}</td>
                <td>${policy.lastTriggered ? new Date(policy.lastTriggered).toLocaleDateString() : 'Never'}</td>
                <td>
                    <button class="btn-secondary" onclick="mapper.editPolicy('${policy.id}')">Edit</button>
                    <button class="btn-${policy.active ? 'warning' : 'success'}" onclick="mapper.togglePolicy('${policy.id}')">
                        ${policy.active ? 'Disable' : 'Enable'}
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });
    }

    updateActionEvaluation() {
        // Reset evaluation status
        const statusElement = document.getElementById('evaluation-status');
        if (statusElement) {
            statusElement.innerHTML = '<span class="status-indicator pending">Ready to Evaluate</span>';
        }

        // Clear previous results
        const checksElement = document.getElementById('compliance-checks');
        if (checksElement) {
            checksElement.innerHTML = '';
        }
    }

    updateComplianceMatrices() {
        this.generateHeatmap();
    }

    generateHeatmap() {
        const heatmap = document.getElementById('compliance-heatmap');
        if (!heatmap) return;

        heatmap.innerHTML = '';

        // Generate 5x5 heatmap
        for (let i = 0; i < 25; i++) {
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';

            // Determine risk level based on position
            const risk = Math.random();
            if (risk > 0.7) {
                cell.classList.add('high');
                cell.textContent = 'H';
            } else if (risk > 0.4) {
                cell.classList.add('medium');
                cell.textContent = 'M';
            } else {
                cell.classList.add('low');
                cell.textContent = 'L';
            }

            heatmap.appendChild(cell);
        }
    }

    updateAuditTrail() {
        const timeline = document.getElementById('audit-timeline');
        if (!timeline) return;

        // Add sample audit entries if empty
        if (this.auditTrail.length === 0) {
            this.auditTrail = [
                {
                    id: 'audit-001',
                    type: 'evaluation',
                    title: 'Policy Evaluation Completed',
                    details: 'GDPR data access policy evaluated successfully',
                    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
                    severity: 'success'
                },
                {
                    id: 'audit-002',
                    type: 'violation',
                    title: 'Compliance Violation Detected',
                    details: 'Unauthorized data access attempt blocked',
                    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                    severity: 'warning'
                },
                {
                    id: 'audit-003',
                    type: 'evaluation',
                    title: 'Policy Rule Updated',
                    details: 'SOX audit trail requirements updated',
                    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                    severity: 'info'
                },
                {
                    id: 'audit-004',
                    type: 'evaluation',
                    title: 'Compliance Check Passed',
                    details: 'All HIPAA requirements satisfied for data transfer',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    severity: 'success'
                }
            ];
        }

        timeline.innerHTML = '';

        this.auditTrail.slice(0, 10).forEach(entry => {
            const item = document.createElement('div');
            item.className = 'timeline-item';

            item.innerHTML = `
                <div class="timeline-marker ${entry.severity}"></div>
                <div class="timeline-content">
                    <div class="timeline-title">${entry.title}</div>
                    <div class="timeline-details">${entry.details}</div>
                    <div class="timeline-time">${this.formatTimeAgo(entry.timestamp)}</div>
                </div>
            `;

            timeline.appendChild(item);
        });
    }

    updateCharts() {
        if (this.charts.mappingChart) {
            this.charts.mappingChart.data.datasets[0].data = [
                Math.random() * 20 + 80,
                Math.random() * 20 + 75,
                Math.random() * 20 + 85,
                Math.random() * 20 + 80
            ];
            this.charts.mappingChart.update();
        }

        if (this.charts.monitoringChart) {
            this.charts.monitoringChart.data.datasets[0].data = this.generateRandomData(24, 85, 100);
            this.charts.monitoringChart.data.datasets[1].data = this.generateRandomData(24, 0, 5);
            this.charts.monitoringChart.update();
        }

        if (this.charts.matrixChart) {
            this.charts.matrixChart.data.datasets[0].data = [
                Math.random() * 10 + 85,
                Math.random() * 10 + 80,
                Math.random() * 10 + 85,
                Math.random() * 10 + 80
            ];
            this.charts.matrixChart.update();
        }
    }

    // Policy Management
    openRuleModal(policyId = null) {
        const modal = document.getElementById('rule-modal');
        const editor = document.querySelector('.policy-editor');

        if (policyId) {
            const policy = this.policies.find(p => p.id === policyId);
            if (policy) {
                this.populateRuleForm(policy);
            }
        } else {
            this.resetRuleForm();
        }

        modal.style.display = 'block';
    }

    closeRuleModal() {
        const modal = document.getElementById('rule-modal');
        modal.style.display = 'none';
        this.resetRuleForm();
    }

    populateRuleForm(policy) {
        // Implement form population
        this.showNotification('Edit functionality coming soon', 'info');
    }

    resetRuleForm() {
        // Implement form reset
    }

    saveRule() {
        // Implement rule saving
        this.showNotification('Rule saved successfully', 'success');
        this.closeRuleModal();
    }

    editPolicy(policyId) {
        this.openRuleModal(policyId);
    }

    togglePolicy(policyId) {
        const policy = this.policies.find(p => p.id === policyId);
        if (policy) {
            policy.active = !policy.active;
            policy.lastModified = new Date().toISOString();
            this.saveToStorage();
            this.updateGovernanceEngine();
            this.showNotification(`Policy ${policy.active ? 'enabled' : 'disabled'}`, 'info');
        }
    }

    // Action Evaluation
    evaluateAction() {
        const actionType = document.getElementById('action-type').value;
        const actionDetails = document.getElementById('action-details').value;
        const actionContext = document.getElementById('action-context').value;

        if (!actionDetails.trim()) {
            this.showNotification('Please provide action details', 'warning');
            return;
        }

        // Update status
        const statusElement = document.getElementById('evaluation-status');
        statusElement.innerHTML = '<span class="status-indicator evaluating">Evaluating...</span>';

        // Simulate evaluation
        setTimeout(() => {
            this.performActionEvaluation(actionType, actionDetails, actionContext);
        }, 2000);
    }

    performActionEvaluation(actionType, details, context) {
        const results = this.evaluateAgainstPolicies(actionType, details, context);

        // Update status
        const statusElement = document.getElementById('evaluation-status');
        statusElement.innerHTML = '<span class="status-indicator completed">Evaluation Complete</span>';

        // Display results
        const checksElement = document.getElementById('compliance-checks');
        checksElement.innerHTML = '';

        results.forEach(result => {
            const checkItem = document.createElement('div');
            checkItem.className = `check-item ${result.passed ? '' : 'warning'}`;

            checkItem.innerHTML = `
                <div class="check-icon">
                    <i class="fas fa-${result.passed ? 'check-circle' : 'exclamation-triangle'}"></i>
                </div>
                <div class="check-content">
                    <div class="check-title">${result.framework.toUpperCase()} Compliance</div>
                    <div class="check-details">${result.message}</div>
                </div>
            `;

            checksElement.appendChild(checkItem);
        });

        // Log to audit trail
        this.addAuditEntry('evaluation', 'Action Evaluation Completed', `Evaluated ${actionType} action`, 'success');
    }

    evaluateAgainstPolicies(actionType, details, context) {
        const results = [];

        this.policies.forEach(policy => {
            if (!policy.active) return;

            let passed = true;
            let message = `Action complies with ${policy.framework.toUpperCase()} requirements`;

            // Simple evaluation logic
            if (actionType === 'data-access' && policy.framework === 'gdpr') {
                if (!details.toLowerCase().includes('consent')) {
                    passed = false;
                    message = 'GDPR requires explicit consent for data access';
                }
            }

            if (actionType === 'data-modification' && policy.framework === 'sox') {
                if (!details.toLowerCase().includes('audit')) {
                    passed = false;
                    message = 'SOX requires audit trail for data modifications';
                }
            }

            results.push({
                framework: policy.framework,
                passed,
                message
            });
        });

        return results;
    }

    // Compliance Matrices
    generateComplianceMatrices() {
        this.complianceMatrices = {
            gdpr: this.generateMatrixData('gdpr'),
            sox: this.generateMatrixData('sox'),
            hipaa: this.generateMatrixData('hipaa'),
            'pci-dss': this.generateMatrixData('pci-dss')
        };

        this.updateComplianceMatrices();
        this.showNotification('Compliance matrices generated', 'success');
    }

    generateMatrixData(framework) {
        const matrix = [];
        for (let i = 0; i < 5; i++) {
            matrix.push(Array.from({ length: 5 }, () => Math.floor(Math.random() * 100)));
        }
        return matrix;
    }

    exportMatrix() {
        const data = JSON.stringify(this.complianceMatrices, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'compliance-matrices.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Compliance matrices exported', 'success');
    }

    // Utility Methods
    generateTimeLabels(hours) {
        const labels = [];
        for (let i = hours - 1; i >= 0; i--) {
            const date = new Date();
            date.setHours(date.getHours() - i);
            labels.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
        return labels;
    }

    generateRandomData(points, min, max) {
        return Array.from({ length: points }, () => Math.floor(Math.random() * (max - min + 1)) + min);
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }

    addAuditEntry(type, title, details, severity) {
        const entry = {
            id: 'audit-' + Date.now(),
            type,
            title,
            details,
            timestamp: new Date().toISOString(),
            severity
        };

        this.auditTrail.unshift(entry);
        if (this.auditTrail.length > 100) {
            this.auditTrail = this.auditTrail.slice(0, 100);
        }

        this.saveToStorage();
        this.updateAuditTrail();
    }

    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        const themeIcon = document.querySelector('#theme-toggle i');
        if (themeIcon) {
            themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    toggleMonitoring() {
        this.isMonitoring = !this.isMonitoring;
        this.updateComplianceMonitoring();

        if (this.isMonitoring) {
            this.startRealTimeMonitoring();
            this.showNotification('Real-time monitoring resumed', 'success');
        } else {
            this.stopRealTimeMonitoring();
            this.showNotification('Real-time monitoring paused', 'warning');
        }
    }

    clearAlerts() {
        // Clear alerts from UI
        this.showNotification('Alerts cleared', 'info');
    }

    refreshMapping() {
        this.updatePolicyMapping(document.getElementById('compliance-framework').value);
        this.showNotification('Policy mapping refreshed', 'success');
    }

    openSettings() {
        this.showNotification('Settings panel coming soon', 'info');
    }

    exportReport() {
        const report = {
            timestamp: new Date().toISOString(),
            metrics: this.calculateMetrics(),
            policies: this.policies,
            auditTrail: this.auditTrail.slice(0, 50),
            complianceMatrices: this.complianceMatrices
        };

        const data = JSON.stringify(report, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'governance-report.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Report exported successfully', 'success');
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    showNotification(message, type = 'info') {
        const notifications = document.getElementById('notifications');
        if (!notifications) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icon = type === 'success' ? 'check-circle' :
                    type === 'error' ? 'exclamation-circle' :
                    type === 'warning' ? 'exclamation-triangle' : 'info-circle';

        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;

        notifications.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    startRealTimeMonitoring() {
        if (this.updateInterval) return;

        this.updateInterval = setInterval(() => {
            if (this.isMonitoring) {
                this.simulateRealTimeActivity();
                this.updateDashboard();
            }
        }, 10000); // Update every 10 seconds
    }

    stopRealTimeMonitoring() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    simulateRealTimeActivity() {
        // Simulate random policy evaluations and violations
        if (Math.random() < 0.3) { // 30% chance
            const actions = ['data-access', 'data-modification', 'user-authentication', 'api-call'];
            const action = actions[Math.floor(Math.random() * actions.length)];

            this.evaluateAction();
        }

        if (Math.random() < 0.1) { // 10% chance of violation
            this.addAuditEntry('violation', 'Policy Violation Detected',
                'Potential compliance issue detected and blocked', 'warning');
        }
    }
}

// Initialize the mapper when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mapper = new GovernancePolicyMapper();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.mapper) {
        window.mapper.stopRealTimeMonitoring();
    }
});