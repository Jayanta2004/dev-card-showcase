/**
 * Intelligent Data Lifecycle Orchestrator
 * Manages automated data retention, archival, and deletion policies
 */

class DataLifecycleOrchestrator {
    constructor() {
        this.policies = [];
        this.storageTiers = {
            hot: { name: 'Hot', cost: 0.023, performance: 'High', retention: '7-30 days' },
            warm: { name: 'Warm', cost: 0.0125, performance: 'Medium', retention: '30-90 days' },
            cold: { name: 'Cold', cost: 0.004, performance: 'Low', retention: '90-365 days' },
            archive: { name: 'Archive', cost: 0.0012, performance: 'Very Low', retention: '1+ years' }
        };
        this.migrationQueue = [];
        this.complianceViolations = [];
        this.costMetrics = {
            totalStorage: 0,
            totalCost: 0,
            monthlySavings: 0,
            optimizationPotential: 0
        };

        this.charts = {};
        this.updateInterval = null;
        this.isRunning = false;

        this.initialize();
    }

    initialize() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.initializeCharts();
        this.updateDashboard();
        this.startRealTimeUpdates();
    }

    loadFromStorage() {
        const savedPolicies = localStorage.getItem('lifecycle-policies');
        if (savedPolicies) {
            this.policies = JSON.parse(savedPolicies);
        } else {
            this.createDefaultPolicies();
        }

        const savedQueue = localStorage.getItem('migration-queue');
        if (savedQueue) {
            this.migrationQueue = JSON.parse(savedQueue);
        }

        const savedViolations = localStorage.getItem('compliance-violations');
        if (savedViolations) {
            this.complianceViolations = JSON.parse(savedViolations);
        }
    }

    saveToStorage() {
        localStorage.setItem('lifecycle-policies', JSON.stringify(this.policies));
        localStorage.setItem('migration-queue', JSON.stringify(this.migrationQueue));
        localStorage.setItem('compliance-violations', JSON.stringify(this.complianceViolations));
    }

    createDefaultPolicies() {
        this.policies = [
            {
                id: 'policy-1',
                name: 'User Data Retention',
                description: 'Automatic lifecycle management for user-generated content',
                rules: [
                    { condition: 'age', operator: '>', value: 30, unit: 'days', action: 'move_to_warm' },
                    { condition: 'age', operator: '>', value: 90, unit: 'days', action: 'move_to_cold' },
                    { condition: 'age', operator: '>', value: 365, unit: 'days', action: 'archive' },
                    { condition: 'age', operator: '>', value: 2555, unit: 'days', action: 'delete' }
                ],
                actions: ['move_to_warm', 'move_to_cold', 'archive', 'delete'],
                active: true,
                created: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                appliedCount: 0,
                dataVolume: 0
            },
            {
                id: 'policy-2',
                name: 'Log Files Management',
                description: 'Automated cleanup of application and system logs',
                rules: [
                    { condition: 'age', operator: '>', value: 7, unit: 'days', action: 'move_to_warm' },
                    { condition: 'age', operator: '>', value: 30, unit: 'days', action: 'compress' },
                    { condition: 'age', operator: '>', value: 90, unit: 'days', action: 'delete' }
                ],
                actions: ['move_to_warm', 'compress', 'delete'],
                active: true,
                created: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                appliedCount: 0,
                dataVolume: 0
            },
            {
                id: 'policy-3',
                name: 'Compliance Data',
                description: 'GDPR and SOX compliance data retention',
                rules: [
                    { condition: 'age', operator: '>', value: 2555, unit: 'days', action: 'archive' },
                    { condition: 'compliance', operator: 'equals', value: 'gdpr', action: 'encrypt' },
                    { condition: 'compliance', operator: 'equals', value: 'sox', action: 'audit' }
                ],
                actions: ['archive', 'encrypt', 'audit'],
                active: true,
                created: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                appliedCount: 0,
                dataVolume: 0
            }
        ];
    }

    setupEventListeners() {
        // Policy management
        document.getElementById('create-policy-btn')?.addEventListener('click', () => this.openPolicyModal());
        document.getElementById('add-rule-btn')?.addEventListener('click', () => this.addRuleToBuilder());
        document.getElementById('save-policy-btn')?.addEventListener('click', () => this.savePolicy());
        document.getElementById('cancel-policy-btn')?.addEventListener('click', () => this.closePolicyModal());

        // Theme toggle
        document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggleTheme());

        // Settings
        document.getElementById('settings-btn')?.addEventListener('click', () => this.openSettings());

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
        // Storage tiers chart
        const tierCtx = document.getElementById('tier-chart')?.getContext('2d');
        if (tierCtx) {
            this.charts.tierChart = new Chart(tierCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Hot', 'Warm', 'Cold', 'Archive'],
                    datasets: [{
                        data: [35, 25, 20, 20],
                        backgroundColor: [
                            '#1976D2',
                            '#FF9800',
                            '#2196F3',
                            '#424242'
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: ${context.parsed}%`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Policy performance chart
        const policyCtx = document.getElementById('policy-performance-chart')?.getContext('2d');
        if (policyCtx) {
            this.charts.policyChart = new Chart(policyCtx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(24),
                    datasets: [{
                        label: 'Policy Executions',
                        data: this.generateRandomData(24, 10, 50),
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

        // Data classification chart
        const classificationCtx = document.getElementById('classification-chart')?.getContext('2d');
        if (classificationCtx) {
            this.charts.classificationChart = new Chart(classificationCtx, {
                type: 'radar',
                data: {
                    labels: ['Personal Data', 'Financial Data', 'Health Data', 'Business Data', 'Public Data', 'Internal Data'],
                    datasets: [{
                        label: 'Data Volume by Type',
                        data: [85, 65, 45, 90, 70, 80],
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

        // Retention compliance chart
        const retentionCtx = document.getElementById('retention-compliance-chart')?.getContext('2d');
        if (retentionCtx) {
            this.charts.retentionChart = new Chart(retentionCtx, {
                type: 'bar',
                data: {
                    labels: ['GDPR', 'SOX', 'HIPAA', 'CCPA', 'PCI DSS'],
                    datasets: [{
                        label: 'Compliance Score',
                        data: [95, 88, 92, 87, 90],
                        backgroundColor: [
                            'rgba(76, 175, 80, 0.8)',
                            'rgba(76, 175, 80, 0.8)',
                            'rgba(76, 175, 80, 0.8)',
                            'rgba(255, 152, 0, 0.8)',
                            'rgba(76, 175, 80, 0.8)'
                        ],
                        borderColor: [
                            '#4CAF50',
                            '#4CAF50',
                            '#4CAF50',
                            '#FF9800',
                            '#4CAF50'
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

        // Cost breakdown chart
        const costCtx = document.getElementById('cost-breakdown-chart')?.getContext('2d');
        if (costCtx) {
            this.charts.costChart = new Chart(costCtx, {
                type: 'pie',
                data: {
                    labels: ['Hot Storage', 'Warm Storage', 'Cold Storage', 'Archive Storage', 'Data Transfer', 'Operations'],
                    datasets: [{
                        data: [45, 25, 15, 8, 5, 2],
                        backgroundColor: [
                            '#1976D2',
                            '#FF9800',
                            '#2196F3',
                            '#424242',
                            '#4CAF50',
                            '#9C27B0'
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        }
                    }
                }
            });
        }
    }

    updateDashboard() {
        this.updateMetrics();
        this.updateStorageTiers();
        this.updatePolicies();
        this.updateClassification();
        this.updateMigrationQueue();
        this.updateCompliance();
        this.updateCostAnalysis();
        this.updateCharts();
    }

    updateMetrics() {
        // Update metrics cards
        const metrics = this.calculateMetrics();

        document.getElementById('total-data-metric').textContent = this.formatBytes(metrics.totalData);
        document.getElementById('active-policies-metric').textContent = metrics.activePolicies;
        document.getElementById('migration-queue-metric').textContent = metrics.queueItems;
        document.getElementById('compliance-score-metric').textContent = `${metrics.complianceScore}%`;

        // Update metric changes
        this.updateMetricChange('total-data-change', metrics.dataChange);
        this.updateMetricChange('active-policies-change', metrics.policiesChange);
        this.updateMetricChange('migration-queue-change', metrics.queueChange);
        this.updateMetricChange('compliance-score-change', metrics.complianceChange);
    }

    calculateMetrics() {
        const totalData = this.policies.reduce((sum, policy) => sum + policy.dataVolume, 0);
        const activePolicies = this.policies.filter(p => p.active).length;
        const queueItems = this.migrationQueue.length;
        const complianceScore = this.calculateComplianceScore();

        return {
            totalData,
            activePolicies,
            queueItems,
            complianceScore,
            dataChange: 12.5,
            policiesChange: 0,
            queueChange: -8.3,
            complianceChange: 2.1
        };
    }

    calculateComplianceScore() {
        if (this.complianceViolations.length === 0) return 100;
        const totalChecks = 100; // Simulated total compliance checks
        const violations = this.complianceViolations.length;
        return Math.max(0, Math.round((totalChecks - violations) / totalChecks * 100));
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

    updateStorageTiers() {
        const tierDetails = document.getElementById('tier-details');
        if (!tierDetails) return;

        tierDetails.innerHTML = '';

        Object.entries(this.storageTiers).forEach(([tier, config]) => {
            const card = document.createElement('div');
            card.className = `tier-detail-card ${tier}`;

            card.innerHTML = `
                <h4>${config.name} Storage</h4>
                <div class="tier-metric">Cost: $${config.cost}/GB/month</div>
                <div class="tier-metric">Performance: ${config.performance}</div>
                <div class="tier-metric">Retention: ${config.retention}</div>
                <div class="tier-metric">Data Volume: ${this.formatBytes(Math.random() * 1000000000)}</div>
            `;

            tierDetails.appendChild(card);
        });
    }

    updatePolicies() {
        const policiesGrid = document.getElementById('policies-grid');
        if (!policiesGrid) return;

        policiesGrid.innerHTML = '';

        this.policies.forEach(policy => {
            const card = document.createElement('div');
            card.className = `policy-card ${policy.active ? 'active' : 'inactive'}`;

            card.innerHTML = `
                <h4>${policy.name}</h4>
                <div class="policy-meta">${policy.description}</div>
                <div class="policy-meta">Rules: ${policy.rules.length}</div>
                <div class="policy-stats">
                    <span>Applied: ${policy.appliedCount}</span>
                    <span>Volume: ${this.formatBytes(policy.dataVolume)}</span>
                </div>
                <div class="policy-controls">
                    <button class="btn-secondary" onclick="orchestrator.editPolicy('${policy.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-${policy.active ? 'warning' : 'success'}" onclick="orchestrator.togglePolicy('${policy.id}')">
                        <i class="fas fa-${policy.active ? 'pause' : 'play'}"></i> ${policy.active ? 'Pause' : 'Resume'}
                    </button>
                </div>
            `;

            policiesGrid.appendChild(card);
        });
    }

    updateClassification() {
        const rulesList = document.getElementById('classification-rules-list');
        if (!rulesList) return;

        rulesList.innerHTML = '';

        const rules = [
            { type: 'hot', title: 'Frequently Accessed Data', details: 'Accessed within last 7 days' },
            { type: 'warm', title: 'Regularly Accessed Data', details: 'Accessed within last 30 days' },
            { type: 'cold', title: 'Occasionally Accessed Data', details: 'Accessed within last 90 days' },
            { type: 'cold', title: 'Archive Data', details: 'Accessed within last year' }
        ];

        rules.forEach(rule => {
            const item = document.createElement('div');
            item.className = 'rule-item';

            item.innerHTML = `
                <div class="rule-icon ${rule.type}">
                    <i class="fas fa-${rule.type === 'hot' ? 'fire' : rule.type === 'warm' ? 'sun' : 'snowflake'}"></i>
                </div>
                <div class="rule-content">
                    <div class="rule-title">${rule.title}</div>
                    <div class="rule-details">${rule.details}</div>
                </div>
            `;

            rulesList.appendChild(item);
        });
    }

    updateMigrationQueue() {
        const queueTable = document.getElementById('migration-queue-table');
        if (!queueTable) return;

        const tbody = queueTable.querySelector('tbody');
        tbody.innerHTML = '';

        // Update progress bars
        this.updateMigrationProgress();

        // Add sample queue items
        const sampleItems = [
            { id: 'mig-001', name: 'User logs Q1 2023', source: 'Hot', target: 'Warm', size: '2.5 GB', priority: 'high', status: 'queued', progress: 0 },
            { id: 'mig-002', name: 'Analytics data Feb', source: 'Hot', target: 'Cold', size: '15.8 GB', priority: 'medium', status: 'migrating', progress: 65 },
            { id: 'mig-003', name: 'Backup files 2022', source: 'Warm', target: 'Archive', size: '500 GB', priority: 'low', status: 'completed', progress: 100 },
            { id: 'mig-004', name: 'Temp files', source: 'Hot', target: 'Delete', size: '1.2 GB', priority: 'high', status: 'failed', progress: 0 }
        ];

        sampleItems.forEach(item => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td><span class="priority-badge ${item.priority}">${item.priority}</span></td>
                <td>${item.source} → ${item.target}</td>
                <td>${item.size}</td>
                <td><span class="status-badge ${item.status}">${item.status}</span></td>
                <td>${item.progress}%</td>
            `;

            tbody.appendChild(row);
        });
    }

    updateMigrationProgress() {
        const progressItems = [
            { label: 'Hot to Warm', current: 45, total: 100 },
            { label: 'Warm to Cold', current: 78, total: 150 },
            { label: 'Cold to Archive', current: 23, total: 50 },
            { label: 'Archive Cleanup', current: 12, total: 25 }
        ];

        progressItems.forEach((item, index) => {
            const progressBar = document.getElementById(`progress-${index + 1}`);
            const progressFill = progressBar?.querySelector('.progress-fill');
            const progressLabel = document.getElementById(`progress-label-${index + 1}`);

            if (progressFill && progressLabel) {
                const percentage = Math.round((item.current / item.total) * 100);
                progressFill.style.width = `${percentage}%`;
                progressLabel.innerHTML = `${item.label}: ${item.current}/${item.total} GB (${percentage}%)`;
            }
        });
    }

    updateCompliance() {
        const violationsList = document.getElementById('compliance-violations-list');
        if (!violationsList) return;

        violationsList.innerHTML = '';

        const violations = [
            { severity: 'warning', title: 'GDPR Retention Period Exceeded', details: 'User data older than 2 years not properly archived' },
            { severity: 'info', title: 'SOX Audit Trail Incomplete', details: 'Missing audit logs for financial data modifications' },
            { severity: 'warning', title: 'Data Encryption Not Applied', details: 'Sensitive data in warm storage not encrypted' }
        ];

        violations.forEach(violation => {
            const item = document.createElement('div');
            item.className = 'violation-item';

            item.innerHTML = `
                <div class="violation-severity ${violation.severity}">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="violation-content">
                    <div class="violation-title">${violation.title}</div>
                    <div class="violation-details">${violation.details}</div>
                </div>
            `;

            violationsList.appendChild(item);
        });
    }

    updateCostAnalysis() {
        const costMetrics = this.calculateCostMetrics();

        document.getElementById('total-cost-value').textContent = `$${costMetrics.totalCost.toLocaleString()}`;
        document.getElementById('monthly-savings-value').textContent = `$${costMetrics.monthlySavings.toLocaleString()}`;
        document.getElementById('optimization-potential-value').textContent = `${costMetrics.optimizationPotential}%`;

        // Update cost trends
        this.updateCostTrend('total-cost-trend', -5.2);
        this.updateCostTrend('monthly-savings-trend', 12.8);
        this.updateCostTrend('optimization-potential-trend', 8.5);
    }

    calculateCostMetrics() {
        return {
            totalCost: 15420,
            monthlySavings: 2840,
            optimizationPotential: 23
        };
    }

    updateCostTrend(elementId, trend) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.innerHTML = '';
        const icon = document.createElement('i');
        const span = document.createElement('span');

        if (trend > 0) {
            icon.className = 'fas fa-arrow-up';
            span.textContent = `+${trend}%`;
            element.className = 'cost-trend';
        } else {
            icon.className = 'fas fa-arrow-down';
            span.textContent = `${trend}%`;
            element.className = 'cost-trend negative';
        }

        element.appendChild(icon);
        element.appendChild(span);
    }

    updateCharts() {
        if (this.charts.tierChart) {
            this.charts.tierChart.data.datasets[0].data = [
                Math.random() * 40 + 30,
                Math.random() * 30 + 20,
                Math.random() * 25 + 15,
                Math.random() * 20 + 10
            ];
            this.charts.tierChart.update();
        }

        if (this.charts.policyChart) {
            this.charts.policyChart.data.datasets[0].data = this.generateRandomData(24, 10, 50);
            this.charts.policyChart.update();
        }

        if (this.charts.classificationChart) {
            this.charts.classificationChart.data.datasets[0].data = [
                Math.random() * 20 + 80,
                Math.random() * 20 + 60,
                Math.random() * 20 + 40,
                Math.random() * 20 + 85,
                Math.random() * 20 + 65,
                Math.random() * 20 + 75
            ];
            this.charts.classificationChart.update();
        }

        if (this.charts.retentionChart) {
            this.charts.retentionChart.data.datasets[0].data = [
                Math.random() * 10 + 85,
                Math.random() * 10 + 80,
                Math.random() * 10 + 85,
                Math.random() * 10 + 80,
                Math.random() * 10 + 85
            ];
            this.charts.retentionChart.update();
        }

        if (this.charts.costChart) {
            this.charts.costChart.data.datasets[0].data = [
                Math.random() * 10 + 40,
                Math.random() * 10 + 20,
                Math.random() * 10 + 10,
                Math.random() * 5 + 5,
                Math.random() * 5 + 3,
                Math.random() * 3 + 1
            ];
            this.charts.costChart.update();
        }
    }

    // Policy Management
    openPolicyModal(policyId = null) {
        const modal = document.getElementById('policy-modal');
        const form = document.getElementById('policy-form');

        if (policyId) {
            const policy = this.policies.find(p => p.id === policyId);
            if (policy) {
                this.populatePolicyForm(policy);
            }
        } else {
            this.resetPolicyForm();
        }

        modal.style.display = 'block';
    }

    closePolicyModal() {
        const modal = document.getElementById('policy-modal');
        modal.style.display = 'none';
        this.resetPolicyForm();
    }

    populatePolicyForm(policy) {
        document.getElementById('policy-name').value = policy.name;
        document.getElementById('policy-description').value = policy.description;
        document.getElementById('policy-active').checked = policy.active;

        // Populate rules
        const rulesBuilder = document.getElementById('rules-builder');
        rulesBuilder.innerHTML = '';

        policy.rules.forEach(rule => {
            this.addRuleToBuilder(rule);
        });

        // Populate actions
        const actions = ['move_to_warm', 'move_to_cold', 'archive', 'delete', 'compress', 'encrypt', 'audit'];
        actions.forEach(action => {
            const checkbox = document.getElementById(`action-${action}`);
            if (checkbox) {
                checkbox.checked = policy.actions.includes(action);
            }
        });
    }

    resetPolicyForm() {
        document.getElementById('policy-form').reset();
        document.getElementById('rules-builder').innerHTML = '';
    }

    addRuleToBuilder(rule = null) {
        const rulesBuilder = document.getElementById('rules-builder');
        const ruleItem = document.createElement('div');
        ruleItem.className = 'rule-builder-item';

        ruleItem.innerHTML = `
            <select class="rule-condition">
                <option value="age">Age</option>
                <option value="size">Size</option>
                <option value="access">Last Access</option>
                <option value="compliance">Compliance</option>
            </select>
            <select class="rule-operator">
                <option value=">">Greater than</option>
                <option value="<">Less than</option>
                <option value="=">Equals</option>
                <option value="!=">Not equals</option>
            </select>
            <input type="number" class="rule-value" placeholder="Value" min="0">
            <select class="rule-unit">
                <option value="days">Days</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
                <option value="GB">GB</option>
                <option value="TB">TB</option>
            </select>
            <select class="rule-action">
                <option value="move_to_warm">Move to Warm</option>
                <option value="move_to_cold">Move to Cold</option>
                <option value="archive">Archive</option>
                <option value="delete">Delete</option>
                <option value="compress">Compress</option>
            </select>
            <button class="rule-remove-btn" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        if (rule) {
            ruleItem.querySelector('.rule-condition').value = rule.condition;
            ruleItem.querySelector('.rule-operator').value = rule.operator;
            ruleItem.querySelector('.rule-value').value = rule.value;
            ruleItem.querySelector('.rule-unit').value = rule.unit;
            ruleItem.querySelector('.rule-action').value = rule.action;
        }

        rulesBuilder.appendChild(ruleItem);
    }

    savePolicy() {
        const name = document.getElementById('policy-name').value;
        const description = document.getElementById('policy-description').value;
        const active = document.getElementById('policy-active').checked;

        if (!name.trim()) {
            this.showNotification('Policy name is required', 'error');
            return;
        }

        // Collect rules
        const rules = [];
        document.querySelectorAll('.rule-builder-item').forEach(item => {
            const condition = item.querySelector('.rule-condition').value;
            const operator = item.querySelector('.rule-operator').value;
            const value = parseFloat(item.querySelector('.rule-value').value);
            const unit = item.querySelector('.rule-unit').value;
            const action = item.querySelector('.rule-action').value;

            if (!isNaN(value)) {
                rules.push({ condition, operator, value, unit, action });
            }
        });

        // Collect actions
        const actions = [];
        document.querySelectorAll('.action-item input[type="checkbox"]:checked').forEach(checkbox => {
            actions.push(checkbox.value);
        });

        const policy = {
            id: 'policy-' + Date.now(),
            name,
            description,
            rules,
            actions,
            active,
            created: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            appliedCount: 0,
            dataVolume: 0
        };

        this.policies.push(policy);
        this.saveToStorage();
        this.updatePolicies();
        this.closePolicyModal();
        this.showNotification('Policy created successfully', 'success');
    }

    editPolicy(policyId) {
        this.openPolicyModal(policyId);
    }

    togglePolicy(policyId) {
        const policy = this.policies.find(p => p.id === policyId);
        if (policy) {
            policy.active = !policy.active;
            policy.lastModified = new Date().toISOString();
            this.saveToStorage();
            this.updatePolicies();
            this.showNotification(`Policy ${policy.active ? 'resumed' : 'paused'}`, 'info');
        }
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

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

    openSettings() {
        // Implement settings modal
        this.showNotification('Settings panel coming soon', 'info');
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

    startRealTimeUpdates() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.updateInterval = setInterval(() => {
            this.updateDashboard();
        }, 30000); // Update every 30 seconds
    }

    stopRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.isRunning = false;
    }
}

// Initialize the orchestrator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.orchestrator = new DataLifecycleOrchestrator();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.orchestrator) {
        window.orchestrator.stopRealTimeUpdates();
    }
});