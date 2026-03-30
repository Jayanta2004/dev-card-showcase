// Compliance Traceability Ledger - JavaScript Implementation
class ComplianceLedger {
    constructor() {
        this.requirements = JSON.parse(localStorage.getItem('compliance-requirements')) || [];
        this.assessments = JSON.parse(localStorage.getItem('compliance-assessments')) || [];
        this.ledgerEntries = JSON.parse(localStorage.getItem('compliance-ledger')) || [];
        this.reports = JSON.parse(localStorage.getItem('compliance-reports')) || [];
        this.settings = JSON.parse(localStorage.getItem('compliance-settings')) || this.getDefaultSettings();

        this.currentTab = 'dashboard';
        this.charts = {};

        this.init();
    }

    getDefaultSettings() {
        return {
            frameworks: ['gdpr'],
            notifications: {
                email: true,
                reminders: true,
                alerts: false
            },
            riskThresholds: {
                high: 85,
                medium: 60
            }
        };
    }

    init() {
        this.bindEvents();
        this.loadTab('dashboard');
        this.updateDashboard();
        this.initializeCharts();
        this.loadSettings();
    }

    bindEvents() {
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Modal controls
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => this.closeModal());
        });

        // Requirements
        document.getElementById('addRequirement').addEventListener('click', () => this.openRequirementModal());
        document.getElementById('saveRequirement').addEventListener('click', () => this.saveRequirement());
        document.getElementById('importRequirements').addEventListener('click', () => this.importRequirements());
        document.getElementById('exportRequirements').addEventListener('click', () => this.exportRequirements());
        document.getElementById('requirementsSearch').addEventListener('input', () => this.filterRequirements());
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterRequirements());
        document.getElementById('statusFilter').addEventListener('change', () => this.filterRequirements());

        // Assessments
        document.getElementById('scheduleAssessment').addEventListener('click', () => this.openAssessmentModal());
        document.getElementById('runAssessment').addEventListener('click', () => this.runAssessment());
        document.getElementById('saveAssessment').addEventListener('click', () => this.saveAssessment());
        document.getElementById('assessmentTypeFilter').addEventListener('change', () => this.filterAssessments());
        document.getElementById('assessmentStatusFilter').addEventListener('change', () => this.filterAssessments());

        // Ledger
        document.getElementById('addLedgerEntry').addEventListener('click', () => this.openLedgerModal());
        document.getElementById('saveLedgerEntry').addEventListener('click', () => this.saveLedgerEntry());
        document.getElementById('filterLedger').addEventListener('click', () => this.filterLedger());
        document.getElementById('ledgerStartDate').addEventListener('change', () => this.filterLedger());
        document.getElementById('ledgerEndDate').addEventListener('change', () => this.filterLedger());
        document.getElementById('ledgerCategoryFilter').addEventListener('change', () => this.filterLedger());

        // Reports
        document.getElementById('generateReport').addEventListener('click', () => this.generateReport());
        document.getElementById('scheduleReport').addEventListener('click', () => this.scheduleReport());

        // Settings
        document.getElementById('exportData').addEventListener('click', () => this.exportData());
        document.getElementById('importData').addEventListener('click', () => this.importData());
        document.getElementById('clearData').addEventListener('click', () => this.confirmClearData());
        document.getElementById('confirmYes').addEventListener('click', () => this.clearData());

        // Settings controls
        document.getElementById('highRiskThreshold').addEventListener('input', (e) => {
            document.getElementById('highRiskValue').textContent = e.target.value + '%';
            this.settings.riskThresholds.high = parseInt(e.target.value);
            this.saveSettings();
        });

        document.getElementById('mediumRiskThreshold').addEventListener('input', (e) => {
            document.getElementById('mediumRiskValue').textContent = e.target.value + '%';
            this.settings.riskThresholds.medium = parseInt(e.target.value);
            this.saveSettings();
        });

        // Notification settings
        document.getElementById('emailNotifications').addEventListener('change', (e) => {
            this.settings.notifications.email = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('reminderNotifications').addEventListener('change', (e) => {
            this.settings.notifications.reminders = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('alertNotifications').addEventListener('change', (e) => {
            this.settings.notifications.alerts = e.target.checked;
            this.saveSettings();
        });

        // Framework settings
        document.querySelectorAll('.frameworks-list input').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateFrameworks());
        });

        // Click outside modal to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
    }

    switchTab(tab) {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}-tab`).classList.add('active');

        this.currentTab = tab;
        this.loadTab(tab);
    }

    loadTab(tab) {
        switch(tab) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'requirements':
                this.loadRequirements();
                break;
            case 'assessments':
                this.loadAssessments();
                break;
            case 'ledger':
                this.loadLedger();
                break;
            case 'reports':
                this.loadReports();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    updateDashboard() {
        // Update metrics
        const totalReqs = this.requirements.length;
        const compliantReqs = this.requirements.filter(r => r.status === 'compliant').length;
        const complianceScore = totalReqs > 0 ? Math.round((compliantReqs / totalReqs) * 100) : 0;
        const activeAssessments = this.assessments.filter(a => a.status === 'in-progress' || a.status === 'scheduled').length;
        const criticalIssues = this.requirements.filter(r => r.priority === 'critical' && r.status !== 'compliant').length;

        document.getElementById('totalRequirements').textContent = totalReqs;
        document.getElementById('complianceScore').textContent = complianceScore + '%';
        document.getElementById('activeAssessments').textContent = activeAssessments;
        document.getElementById('criticalIssues').textContent = criticalIssues;

        // Update score ring
        const circumference = 157;
        const offset = circumference - (complianceScore / 100) * circumference;
        document.getElementById('scoreRing').style.strokeDashoffset = offset;

        // Update trends (simplified)
        this.updateTrends();

        // Update charts
        this.updateCharts();

        // Update activity feed
        this.updateActivityFeed();
    }

    updateTrends() {
        // Simplified trend calculation
        const trends = {
            requirements: { value: '+5%', class: 'positive' },
            assessments: { value: '+2', class: 'positive' },
            issues: { value: '-1', class: 'positive' }
        };

        Object.keys(trends).forEach(key => {
            const element = document.getElementById(key + 'Trend');
            element.textContent = trends[key].value;
            element.className = 'metric-trend ' + trends[key].class;
        });
    }

    initializeCharts() {
        // Compliance Status Chart
        const ctx1 = document.getElementById('complianceChart').getContext('2d');
        this.charts.compliance = new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: ['Compliant', 'Non-Compliant', 'In Progress', 'Not Started'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        '#10b981',
                        '#ef4444',
                        '#f59e0b',
                        '#64748b'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Requirements by Category Chart
        const ctx2 = document.getElementById('requirementsChart').getContext('2d');
        this.charts.requirements = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Requirements',
                    data: [],
                    backgroundColor: '#2563eb'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateCharts() {
        // Compliance status chart
        const statusCounts = {
            compliant: this.requirements.filter(r => r.status === 'compliant').length,
            'non-compliant': this.requirements.filter(r => r.status === 'non-compliant').length,
            'in-progress': this.requirements.filter(r => r.status === 'in-progress').length,
            'not-started': this.requirements.filter(r => r.status === 'not-started').length
        };

        this.charts.compliance.data.datasets[0].data = Object.values(statusCounts);
        this.charts.compliance.update();

        // Requirements by category chart
        const categoryCounts = {};
        this.requirements.forEach(req => {
            categoryCounts[req.category] = (categoryCounts[req.category] || 0) + 1;
        });

        this.charts.requirements.data.labels = Object.keys(categoryCounts);
        this.charts.requirements.data.datasets[0].data = Object.values(categoryCounts);
        this.charts.requirements.update();
    }

    updateActivityFeed() {
        const feed = document.getElementById('activityFeed');
        feed.innerHTML = '';

        // Get recent activities (simplified)
        const activities = [
            {
                type: 'success',
                title: 'Requirement Updated',
                description: 'GDPR Data Protection requirement marked as compliant',
                time: '2 hours ago',
                icon: 'fas fa-check-circle'
            },
            {
                type: 'warning',
                title: 'Assessment Due',
                description: 'Quarterly security assessment is due in 3 days',
                time: '1 day ago',
                icon: 'fas fa-clock'
            },
            {
                type: 'info',
                title: 'New Requirement Added',
                description: 'ISO 27001 Access Control requirement added',
                time: '3 days ago',
                icon: 'fas fa-plus-circle'
            }
        ];

        activities.forEach(activity => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <div class="activity-icon ${activity.type}">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.description}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            `;
            feed.appendChild(item);
        });
    }

    // Requirements Management
    openRequirementModal(requirement = null) {
        const modal = document.getElementById('requirementModal');
        const form = document.getElementById('requirementForm');
        const title = document.getElementById('requirementModalTitle');

        if (requirement) {
            title.textContent = 'Edit Requirement';
            this.populateRequirementForm(requirement);
        } else {
            title.textContent = 'Add Requirement';
            form.reset();
        }

        modal.classList.add('show');
    }

    populateRequirementForm(requirement) {
        document.getElementById('reqTitle').value = requirement.title;
        document.getElementById('reqCategory').value = requirement.category;
        document.getElementById('reqDescription').value = requirement.description;
        document.getElementById('reqPriority').value = requirement.priority;
        document.getElementById('reqDueDate').value = requirement.dueDate ? requirement.dueDate.split('T')[0] : '';
        document.getElementById('reqEvidence').value = requirement.evidence || '';
        document.getElementById('reqStatus').value = requirement.status;
    }

    saveRequirement() {
        const formData = new FormData(document.getElementById('requirementForm'));
        const requirement = {
            id: Date.now(),
            title: document.getElementById('reqTitle').value,
            category: document.getElementById('reqCategory').value,
            description: document.getElementById('reqDescription').value,
            priority: document.getElementById('reqPriority').value,
            dueDate: document.getElementById('reqDueDate').value,
            evidence: document.getElementById('reqEvidence').value,
            status: document.getElementById('reqStatus').value,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Validation
        if (!requirement.title || !requirement.category || !requirement.description) {
            alert('Please fill in all required fields.');
            return;
        }

        this.requirements.push(requirement);
        this.saveRequirements();
        this.loadRequirements();
        this.updateDashboard();
        this.closeModal();

        this.addActivity('success', 'Requirement Added', `New requirement "${requirement.title}" has been added.`);
    }

    loadRequirements() {
        const grid = document.getElementById('requirementsGrid');
        const noData = document.getElementById('noRequirements');

        if (this.requirements.length === 0) {
            grid.innerHTML = '';
            noData.style.display = 'block';
            return;
        }

        noData.style.display = 'none';
        grid.innerHTML = '';

        this.requirements.forEach(requirement => {
            const card = this.createRequirementCard(requirement);
            grid.appendChild(card);
        });
    }

    createRequirementCard(requirement) {
        const card = document.createElement('div');
        card.className = 'requirement-card';
        card.onclick = () => this.openRequirementModal(requirement);

        const statusClass = 'status-' + requirement.status.replace('-', '-');
        const priorityColor = this.getPriorityColor(requirement.priority);

        card.innerHTML = `
            <div class="requirement-header">
                <div>
                    <div class="requirement-title">${requirement.title}</div>
                    <div class="requirement-category">${requirement.category.toUpperCase()}</div>
                </div>
                <span class="status-badge ${statusClass}">${requirement.status.replace('-', ' ')}</span>
            </div>
            <div class="requirement-meta">
                <span style="color: ${priorityColor}">● ${requirement.priority} priority</span>
                ${requirement.dueDate ? ` • Due: ${new Date(requirement.dueDate).toLocaleDateString()}` : ''}
            </div>
            <div class="requirement-description">${requirement.description}</div>
        `;

        return card;
    }

    getPriorityColor(priority) {
        const colors = {
            low: '#64748b',
            medium: '#f59e0b',
            high: '#ef4444',
            critical: '#dc2626'
        };
        return colors[priority] || colors.medium;
    }

    filterRequirements() {
        const searchTerm = document.getElementById('requirementsSearch').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;

        const filtered = this.requirements.filter(req => {
            const matchesSearch = req.title.toLowerCase().includes(searchTerm) ||
                                req.description.toLowerCase().includes(searchTerm);
            const matchesCategory = categoryFilter === 'all' || req.category === categoryFilter;
            const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

            return matchesSearch && matchesCategory && matchesStatus;
        });

        this.displayFilteredRequirements(filtered);
    }

    displayFilteredRequirements(requirements) {
        const grid = document.getElementById('requirementsGrid');
        const noData = document.getElementById('noRequirements');

        if (requirements.length === 0) {
            grid.innerHTML = '';
            noData.style.display = 'block';
            return;
        }

        noData.style.display = 'none';
        grid.innerHTML = '';

        requirements.forEach(requirement => {
            const card = this.createRequirementCard(requirement);
            grid.appendChild(card);
        });
    }

    // Assessments Management
    openAssessmentModal(assessment = null) {
        const modal = document.getElementById('assessmentModal');
        const form = document.getElementById('assessmentForm');

        if (assessment) {
            this.populateAssessmentForm(assessment);
        } else {
            form.reset();
        }

        modal.classList.add('show');
    }

    populateAssessmentForm(assessment) {
        document.getElementById('assessmentTitle').value = assessment.title;
        document.getElementById('assessmentType').value = assessment.type;
        document.getElementById('assessmentDate').value = assessment.scheduledDate;
        document.getElementById('assessmentScope').value = assessment.scope;
        document.getElementById('assessmentAssignee').value = assessment.assignee;
    }

    saveAssessment() {
        const assessment = {
            id: Date.now(),
            title: document.getElementById('assessmentTitle').value,
            type: document.getElementById('assessmentType').value,
            scheduledDate: document.getElementById('assessmentDate').value,
            scope: document.getElementById('assessmentScope').value,
            assignee: document.getElementById('assessmentAssignee').value,
            status: 'scheduled',
            createdAt: new Date().toISOString()
        };

        if (!assessment.title || !assessment.scheduledDate) {
            alert('Please fill in all required fields.');
            return;
        }

        this.assessments.push(assessment);
        this.saveAssessments();
        this.loadAssessments();
        this.updateDashboard();
        this.closeModal();

        this.addActivity('info', 'Assessment Scheduled', `Assessment "${assessment.title}" has been scheduled.`);
    }

    runAssessment() {
        // Simplified assessment execution
        const assessment = {
            id: Date.now(),
            title: 'Automated Compliance Assessment',
            type: 'automated',
            status: 'in-progress',
            createdAt: new Date().toISOString()
        };

        this.assessments.push(assessment);
        this.saveAssessments();
        this.loadAssessments();

        // Simulate assessment completion
        setTimeout(() => {
            assessment.status = 'completed';
            assessment.completedAt = new Date().toISOString();
            this.saveAssessments();
            this.loadAssessments();
            this.updateDashboard();
            this.addActivity('success', 'Assessment Completed', 'Automated compliance assessment has been completed.');
        }, 3000);
    }

    loadAssessments() {
        const grid = document.getElementById('assessmentsGrid');
        const noData = document.getElementById('noAssessments');

        if (this.assessments.length === 0) {
            grid.innerHTML = '';
            noData.style.display = 'block';
            return;
        }

        noData.style.display = 'none';
        grid.innerHTML = '';

        this.assessments.forEach(assessment => {
            const card = this.createAssessmentCard(assessment);
            grid.appendChild(card);
        });
    }

    createAssessmentCard(assessment) {
        const card = document.createElement('div');
        card.className = 'assessment-card';

        const statusClass = 'status-' + assessment.status.replace('-', '-');

        card.innerHTML = `
            <div class="assessment-header">
                <div>
                    <div class="assessment-title">${assessment.title}</div>
                    <div class="assessment-type">${assessment.type} assessment</div>
                </div>
                <span class="status-badge ${statusClass}">${assessment.status.replace('-', ' ')}</span>
            </div>
            <div class="assessment-meta">
                ${assessment.scheduledDate ? `Scheduled: ${new Date(assessment.scheduledDate).toLocaleDateString()}` : ''}
                ${assessment.assignee ? ` • Assignee: ${assessment.assignee}` : ''}
            </div>
            <div class="assessment-description">${assessment.scope || 'No scope defined'}</div>
        `;

        return card;
    }

    filterAssessments() {
        const typeFilter = document.getElementById('assessmentTypeFilter').value;
        const statusFilter = document.getElementById('assessmentStatusFilter').value;

        const filtered = this.assessments.filter(assessment => {
            const matchesType = typeFilter === 'all' || assessment.type === typeFilter;
            const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;

            return matchesType && matchesStatus;
        });

        this.displayFilteredAssessments(filtered);
    }

    displayFilteredAssessments(assessments) {
        const grid = document.getElementById('assessmentsGrid');
        const noData = document.getElementById('noAssessments');

        if (assessments.length === 0) {
            grid.innerHTML = '';
            noData.style.display = 'block';
            return;
        }

        noData.style.display = 'none';
        grid.innerHTML = '';

        assessments.forEach(assessment => {
            const card = this.createAssessmentCard(assessment);
            grid.appendChild(card);
        });
    }

    // Ledger Management
    openLedgerModal(entry = null) {
        const modal = document.getElementById('ledgerModal');
        const form = document.getElementById('ledgerForm');

        if (entry) {
            this.populateLedgerForm(entry);
        } else {
            form.reset();
            document.getElementById('ledgerDate').value = new Date().toISOString().slice(0, 16);
        }

        modal.classList.add('show');
    }

    populateLedgerForm(entry) {
        document.getElementById('ledgerDate').value = entry.date;
        document.getElementById('ledgerCategory').value = entry.category;
        document.getElementById('ledgerDescription').value = entry.description;
        document.getElementById('ledgerStatus').value = entry.status;
        document.getElementById('ledgerPriority').value = entry.priority;
        document.getElementById('ledgerEvidence').value = entry.evidence;
    }

    saveLedgerEntry() {
        const entry = {
            id: Date.now(),
            date: document.getElementById('ledgerDate').value,
            category: document.getElementById('ledgerCategory').value,
            description: document.getElementById('ledgerDescription').value,
            status: document.getElementById('ledgerStatus').value,
            priority: document.getElementById('ledgerPriority').value,
            evidence: document.getElementById('ledgerEvidence').value,
            createdAt: new Date().toISOString()
        };

        if (!entry.date || !entry.category || !entry.description) {
            alert('Please fill in all required fields.');
            return;
        }

        this.ledgerEntries.push(entry);
        this.saveLedgerEntries();
        this.loadLedger();
        this.closeModal();

        this.addActivity('info', 'Ledger Entry Added', `New ${entry.category} entry has been added to the ledger.`);
    }

    loadLedger() {
        const body = document.getElementById('ledgerBody');
        const noData = document.getElementById('noLedgerEntries');

        if (this.ledgerEntries.length === 0) {
            body.innerHTML = '';
            noData.style.display = 'block';
            return;
        }

        noData.style.display = 'none';
        body.innerHTML = '';

        // Sort by date descending
        const sortedEntries = [...this.ledgerEntries].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedEntries.forEach(entry => {
            const row = this.createLedgerRow(entry);
            body.appendChild(row);
        });
    }

    createLedgerRow(entry) {
        const row = document.createElement('div');
        row.className = 'ledger-row';

        const statusClass = 'status-' + entry.status.replace('-', '-');

        row.innerHTML = `
            <div data-label="Date">${new Date(entry.date).toLocaleDateString()}</div>
            <div data-label="Category">${entry.category}</div>
            <div data-label="Description">${entry.description}</div>
            <div data-label="Status"><span class="status-badge ${statusClass}">${entry.status}</span></div>
            <div data-label="Evidence">${entry.evidence || 'N/A'}</div>
            <div data-label="Actions" class="ledger-actions">
                <button class="btn-edit" onclick="ledger.editLedgerEntry(${entry.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="ledger.deleteLedgerEntry(${entry.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        return row;
    }

    editLedgerEntry(id) {
        const entry = this.ledgerEntries.find(e => e.id === id);
        if (entry) {
            this.openLedgerModal(entry);
        }
    }

    deleteLedgerEntry(id) {
        if (confirm('Are you sure you want to delete this ledger entry?')) {
            this.ledgerEntries = this.ledgerEntries.filter(e => e.id !== id);
            this.saveLedgerEntries();
            this.loadLedger();
            this.addActivity('warning', 'Ledger Entry Deleted', 'A ledger entry has been removed.');
        }
    }

    filterLedger() {
        const startDate = document.getElementById('ledgerStartDate').value;
        const endDate = document.getElementById('ledgerEndDate').value;
        const categoryFilter = document.getElementById('ledgerCategoryFilter').value;

        const filtered = this.ledgerEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            const matchesStartDate = !startDate || entryDate >= new Date(startDate);
            const matchesEndDate = !endDate || entryDate <= new Date(endDate + 'T23:59:59');
            const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter;

            return matchesStartDate && matchesEndDate && matchesCategory;
        });

        this.displayFilteredLedger(filtered);
    }

    displayFilteredLedger(entries) {
        const body = document.getElementById('ledgerBody');
        const noData = document.getElementById('noLedgerEntries');

        if (entries.length === 0) {
            body.innerHTML = '';
            noData.style.display = 'block';
            return;
        }

        noData.style.display = 'none';
        body.innerHTML = '';

        const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedEntries.forEach(entry => {
            const row = this.createLedgerRow(entry);
            body.appendChild(row);
        });
    }

    // Reports Management
    generateReport() {
        const template = document.getElementById('reportTemplate').value;
        const format = document.getElementById('reportFormat').value;

        const report = {
            id: Date.now(),
            title: this.getReportTitle(template),
            template: template,
            format: format,
            generatedAt: new Date().toISOString(),
            data: this.generateReportData(template)
        };

        this.reports.push(report);
        this.saveReports();
        this.loadReports();

        // Download or display report based on format
        if (format === 'json') {
            this.downloadJSON(report, `${report.title.replace(/\s+/g, '_')}.json`);
        } else if (format === 'csv') {
            this.downloadCSV(report, `${report.title.replace(/\s+/g, '_')}.csv`);
        } else {
            this.displayHTMLReport(report);
        }

        this.addActivity('success', 'Report Generated', `Report "${report.title}" has been generated.`);
    }

    getReportTitle(template) {
        const titles = {
            'compliance-overview': 'Compliance Overview Report',
            'gap-analysis': 'Gap Analysis Report',
            'audit-trail': 'Audit Trail Report',
            'risk-assessment': 'Risk Assessment Report',
            'progress-report': 'Progress Report'
        };
        return titles[template] || 'Custom Report';
    }

    generateReportData(template) {
        switch(template) {
            case 'compliance-overview':
                return {
                    totalRequirements: this.requirements.length,
                    compliantRequirements: this.requirements.filter(r => r.status === 'compliant').length,
                    complianceScore: this.calculateComplianceScore(),
                    requirementsByCategory: this.getRequirementsByCategory(),
                    recentAssessments: this.assessments.slice(-5)
                };
            case 'gap-analysis':
                return {
                    nonCompliantRequirements: this.requirements.filter(r => r.status !== 'compliant'),
                    overdueRequirements: this.requirements.filter(r => r.dueDate && new Date(r.dueDate) < new Date()),
                    highPriorityGaps: this.requirements.filter(r => r.priority === 'high' || r.priority === 'critical')
                };
            case 'audit-trail':
                return {
                    ledgerEntries: this.ledgerEntries,
                    recentActivities: this.getRecentActivities()
                };
            default:
                return {};
        }
    }

    calculateComplianceScore() {
        if (this.requirements.length === 0) return 0;
        const compliant = this.requirements.filter(r => r.status === 'compliant').length;
        return Math.round((compliant / this.requirements.length) * 100);
    }

    getRequirementsByCategory() {
        const categories = {};
        this.requirements.forEach(req => {
            categories[req.category] = (categories[req.category] || 0) + 1;
        });
        return categories;
    }

    getRecentActivities() {
        // Simplified activity log
        return this.ledgerEntries.slice(-10);
    }

    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    downloadCSV(data, filename) {
        // Simplified CSV generation
        let csv = 'Title,Template,Generated At\n';
        csv += `${data.title},${data.template},${data.generatedAt}\n`;

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    displayHTMLReport(report) {
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
            <html>
            <head>
                <title>${report.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #2563eb; }
                    .metric { background: #f8fafc; padding: 10px; margin: 10px 0; border-radius: 5px; }
                </style>
            </head>
            <body>
                <h1>${report.title}</h1>
                <p>Generated on: ${new Date(report.generatedAt).toLocaleString()}</p>
                <div class="metric">
                    <strong>Compliance Score:</strong> ${report.data.complianceScore || 'N/A'}%
                </div>
                <div class="metric">
                    <strong>Total Requirements:</strong> ${report.data.totalRequirements || 0}
                </div>
                <pre>${JSON.stringify(report.data, null, 2)}</pre>
            </body>
            </html>
        `);
    }

    loadReports() {
        const grid = document.getElementById('reportsGrid');
        const noData = document.getElementById('noReports');

        if (this.reports.length === 0) {
            grid.innerHTML = '';
            noData.style.display = 'block';
            return;
        }

        noData.style.display = 'none';
        grid.innerHTML = '';

        this.reports.forEach(report => {
            const card = this.createReportCard(report);
            grid.appendChild(card);
        });
    }

    createReportCard(report) {
        const card = document.createElement('div');
        card.className = 'report-card';

        card.innerHTML = `
            <div class="report-header">
                <div>
                    <div class="report-title">${report.title}</div>
                    <div class="report-type">${report.template} • ${report.format.toUpperCase()}</div>
                </div>
            </div>
            <div class="report-meta">
                Generated: ${new Date(report.generatedAt).toLocaleDateString()}
            </div>
            <div class="report-description">Automated compliance report with detailed analysis and metrics.</div>
        `;

        return card;
    }

    scheduleReport() {
        alert('Report scheduling feature would integrate with a task scheduler in a full implementation.');
    }

    // Settings Management
    loadSettings() {
        // Load notification settings
        document.getElementById('emailNotifications').checked = this.settings.notifications.email;
        document.getElementById('reminderNotifications').checked = this.settings.notifications.reminders;
        document.getElementById('alertNotifications').checked = this.settings.notifications.alerts;

        // Load risk thresholds
        document.getElementById('highRiskThreshold').value = this.settings.riskThresholds.high;
        document.getElementById('mediumRiskThreshold').value = this.settings.riskThresholds.medium;
        document.getElementById('highRiskValue').textContent = this.settings.riskThresholds.high + '%';
        document.getElementById('mediumRiskValue').textContent = this.settings.riskThresholds.medium + '%';

        // Load frameworks
        document.querySelectorAll('.frameworks-list input').forEach(checkbox => {
            checkbox.checked = this.settings.frameworks.includes(checkbox.value);
        });
    }

    updateFrameworks() {
        this.settings.frameworks = [];
        document.querySelectorAll('.frameworks-list input:checked').forEach(checkbox => {
            this.settings.frameworks.push(checkbox.value);
        });
        this.saveSettings();
    }

    saveSettings() {
        localStorage.setItem('compliance-settings', JSON.stringify(this.settings));
    }

    // Data Management
    exportData() {
        const data = {
            requirements: this.requirements,
            assessments: this.assessments,
            ledgerEntries: this.ledgerEntries,
            reports: this.reports,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };

        this.downloadJSON(data, 'compliance-ledger-backup.json');
        this.addActivity('info', 'Data Exported', 'All compliance data has been exported.');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        if (confirm('This will replace all existing data. Continue?')) {
                            this.requirements = data.requirements || [];
                            this.assessments = data.assessments || [];
                            this.ledgerEntries = data.ledgerEntries || [];
                            this.reports = data.reports || [];
                            this.settings = data.settings || this.getDefaultSettings();

                            this.saveAllData();
                            this.loadTab(this.currentTab);
                            this.updateDashboard();
                            this.addActivity('success', 'Data Imported', 'Compliance data has been successfully imported.');
                        }
                    } catch (error) {
                        alert('Invalid file format. Please select a valid backup file.');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    confirmClearData() {
        document.getElementById('confirmMessage').textContent = 'Are you sure you want to clear all compliance data? This action cannot be undone.';
        document.getElementById('confirmModal').classList.add('show');
    }

    clearData() {
        this.requirements = [];
        this.assessments = [];
        this.ledgerEntries = [];
        this.reports = [];
        this.settings = this.getDefaultSettings();

        this.saveAllData();
        this.loadTab(this.currentTab);
        this.updateDashboard();
        this.closeModal();

        this.addActivity('danger', 'Data Cleared', 'All compliance data has been cleared.');
    }

    // Utility Methods
    saveAllData() {
        this.saveRequirements();
        this.saveAssessments();
        this.saveLedgerEntries();
        this.saveReports();
        this.saveSettings();
    }

    saveRequirements() {
        localStorage.setItem('compliance-requirements', JSON.stringify(this.requirements));
    }

    saveAssessments() {
        localStorage.setItem('compliance-assessments', JSON.stringify(this.assessments));
    }

    saveLedgerEntries() {
        localStorage.setItem('compliance-ledger', JSON.stringify(this.ledgerEntries));
    }

    saveReports() {
        localStorage.setItem('compliance-reports', JSON.stringify(this.reports));
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    addActivity(type, title, description) {
        // In a real implementation, this would save to a persistent activity log
        console.log(`Activity: ${type} - ${title} - ${description}`);
    }

    // Import/Export for requirements
    importRequirements() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.csv';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        let importedReqs = [];
                        if (file.name.endsWith('.json')) {
                            importedReqs = JSON.parse(event.target.result);
                        } else if (file.name.endsWith('.csv')) {
                            // Simplified CSV parsing
                            const csv = event.target.result;
                            const lines = csv.split('\n');
                            const headers = lines[0].split(',');
                            for (let i = 1; i < lines.length; i++) {
                                const values = lines[i].split(',');
                                if (values.length >= 3) {
                                    importedReqs.push({
                                        id: Date.now() + i,
                                        title: values[0],
                                        category: values[1],
                                        description: values[2],
                                        status: 'not-started',
                                        createdAt: new Date().toISOString()
                                    });
                                }
                            }
                        }

                        this.requirements.push(...importedReqs);
                        this.saveRequirements();
                        this.loadRequirements();
                        this.updateDashboard();
                        this.addActivity('success', 'Requirements Imported', `${importedReqs.length} requirements have been imported.`);
                    } catch (error) {
                        alert('Error importing requirements. Please check the file format.');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    exportRequirements() {
        const data = this.requirements.map(req => ({
            Title: req.title,
            Category: req.category,
            Description: req.description,
            Priority: req.priority,
            Status: req.status,
            DueDate: req.dueDate,
            Evidence: req.evidence
        }));

        let csv = Object.keys(data[0] || {}).join(',') + '\n';
        data.forEach(row => {
            csv += Object.values(row).map(val => `"${val || ''}"`).join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'compliance-requirements.csv';
        a.click();
        URL.revokeObjectURL(url);

        this.addActivity('info', 'Requirements Exported', 'Requirements have been exported to CSV.');
    }
}

// Initialize the application
const ledger = new ComplianceLedger();