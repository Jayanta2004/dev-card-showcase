// Data Retention Compliance Auditor - JavaScript Implementation

class DataRetentionAuditor {
    constructor() {
        this.policies = [
            {
                id: 1,
                name: 'Financial Records',
                retentionPeriod: { value: 7, unit: 'years' },
                dataTypes: ['Transactions', 'Invoices', 'Tax Documents'],
                disposalMethod: 'Secure Deletion',
                regulatoryBasis: 'SOX, GDPR',
                active: true
            },
            {
                id: 2,
                name: 'User Data',
                retentionPeriod: { value: 3, unit: 'years' },
                dataTypes: ['Personal Info', 'Preferences', 'Activity Logs'],
                disposalMethod: 'Anonymization',
                regulatoryBasis: 'GDPR, CCPA',
                active: true
            }
        ];

        this.records = [];
        this.auditResults = null;
        this.currentPolicyId = 3;

        this.initializeElements();
        this.bindEvents();
        this.loadSampleData();
        this.updateDashboard();
        this.renderPolicies();
        this.renderRecords();
    }

    initializeElements() {
        // Policy management
        this.addPolicyBtn = document.getElementById('addPolicyBtn');
        this.runAuditBtn = document.getElementById('runAuditBtn');
        this.generateReportBtn = document.getElementById('generateReportBtn');
        this.policiesContainer = document.getElementById('policiesContainer');

        // Audit dashboard
        this.compliantCount = document.getElementById('compliantCount');
        this.compliantPercentage = document.getElementById('compliantPercentage');
        this.nonCompliantCount = document.getElementById('nonCompliantCount');
        this.nonCompliantPercentage = document.getElementById('nonCompliantPercentage');
        this.pendingCount = document.getElementById('pendingCount');
        this.pendingPercentage = document.getElementById('pendingPercentage');
        this.nextAuditDate = document.getElementById('nextAuditDate');
        this.auditResults = document.getElementById('auditResults');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.violationsAlert = document.getElementById('violationsAlert');
        this.alertContent = document.getElementById('alertContent');

        // Records management
        this.addRecordBtn = document.getElementById('addRecordBtn');
        this.recordTypeFilter = document.getElementById('recordTypeFilter');
        this.complianceFilter = document.getElementById('complianceFilter');
        this.recordsTableBody = document.getElementById('recordsTableBody');

        // Modals
        this.policyModal = document.getElementById('policyModal');
        this.recordModal = document.getElementById('recordModal');
        this.policyForm = document.getElementById('policyForm');
        this.recordForm = document.getElementById('recordForm');

        // Modal controls
        this.closeModal = document.getElementById('closeModal');
        this.closeRecordModal = document.getElementById('closeRecordModal');
        this.cancelPolicy = document.getElementById('cancelPolicy');
        this.cancelRecord = document.getElementById('cancelRecord');
        this.remediateBtn = document.getElementById('remediateBtn');
        this.dismissAlertBtn = document.getElementById('dismissAlertBtn');
    }

    bindEvents() {
        this.addPolicyBtn.addEventListener('click', () => this.openPolicyModal());
        this.addRecordBtn.addEventListener('click', () => this.openRecordModal());
        this.runAuditBtn.addEventListener('click', () => this.runComplianceAudit());
        this.generateReportBtn.addEventListener('click', () => this.generateReport());

        // Modal events
        this.closeModal.addEventListener('click', () => this.closePolicyModal());
        this.closeRecordModal.addEventListener('click', () => this.closeRecordModal());
        this.cancelPolicy.addEventListener('click', () => this.closePolicyModal());
        this.cancelRecord.addEventListener('click', () => this.closeRecordModal());

        // Form submissions
        this.policyForm.addEventListener('submit', (e) => this.savePolicy(e));
        this.recordForm.addEventListener('submit', (e) => this.saveRecord(e));

        // Filters
        this.recordTypeFilter.addEventListener('change', () => this.renderRecords());
        this.complianceFilter.addEventListener('change', () => this.renderRecords());

        // Alert actions
        this.remediateBtn.addEventListener('click', () => this.startRemediation());
        this.dismissAlertBtn.addEventListener('click', () => this.dismissAlert());

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.policyModal) this.closePolicyModal();
            if (e.target === this.recordModal) this.closeRecordModal();
        });
    }

    loadSampleData() {
        // Generate sample records for demonstration
        const recordTypes = ['financial', 'user', 'logs', 'communication'];
        const descriptions = {
            financial: ['Q4 2023 Transactions', 'Invoice #INV-2024-001', 'Tax Documentation 2023', 'Payment Records', 'Financial Statements'],
            user: ['User Profile Data', 'Login History', 'Preference Settings', 'Activity Logs', 'Personal Information'],
            logs: ['System Access Logs', 'Error Logs', 'Audit Trail', 'Security Events', 'Performance Metrics'],
            communication: ['Email Records', 'Chat History', 'Support Tickets', 'Customer Communications', 'Internal Messages']
        };

        for (let i = 1; i <= 25; i++) {
            const type = recordTypes[Math.floor(Math.random() * recordTypes.length)];
            const descList = descriptions[type];
            const description = descList[Math.floor(Math.random() * descList.length)];

            // Random creation date within the last 5 years
            const createdDate = new Date();
            createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 1825)); // 0-5 years ago

            const record = {
                id: i,
                type: type,
                description: `${description} #${i}`,
                createdDate: createdDate,
                size: Math.round((Math.random() * 500 + 1) * 10) / 10, // 1-500 MB
                sensitivity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)]
            };

            this.records.push(record);
        }
    }

    // Policy Management
    openPolicyModal(policy = null) {
        this.policyModal.classList.add('show');

        if (policy) {
            document.getElementById('modalTitle').textContent = 'Edit Retention Policy';
            document.getElementById('policyName').value = policy.name;
            document.getElementById('retentionValue').value = policy.retentionPeriod.value;
            document.getElementById('retentionUnit').value = policy.retentionPeriod.unit;
            document.getElementById('dataTypes').value = policy.dataTypes.join(', ');
            document.getElementById('disposalMethod').value = policy.disposalMethod;
            document.getElementById('regulatoryBasis').value = policy.regulatoryBasis;
        } else {
            document.getElementById('modalTitle').textContent = 'Create Retention Policy';
            this.policyForm.reset();
        }
    }

    closePolicyModal() {
        this.policyModal.classList.remove('show');
        this.policyForm.reset();
    }

    savePolicy(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const policyData = {
            id: this.currentPolicyId++,
            name: document.getElementById('policyName').value,
            retentionPeriod: {
                value: parseInt(document.getElementById('retentionValue').value),
                unit: document.getElementById('retentionUnit').value
            },
            dataTypes: document.getElementById('dataTypes').value.split(',').map(s => s.trim()),
            disposalMethod: document.getElementById('disposalMethod').value,
            regulatoryBasis: document.getElementById('regulatoryBasis').value,
            active: true
        };

        this.policies.push(policyData);
        this.renderPolicies();
        this.closePolicyModal();
    }

    renderPolicies() {
        this.policiesContainer.innerHTML = '';

        this.policies.forEach(policy => {
            const policyCard = document.createElement('div');
            policyCard.className = 'policy-card';

            policyCard.innerHTML = `
                <div class="policy-header">
                    <h3>${policy.name}</h3>
                    <span class="policy-status ${policy.active ? 'active' : ''}">${policy.active ? 'Active' : 'Inactive'}</span>
                </div>
                <div class="policy-details">
                    <p><strong>Retention Period:</strong> ${policy.retentionPeriod.value} ${policy.retentionPeriod.unit}</p>
                    <p><strong>Data Types:</strong> ${policy.dataTypes.join(', ')}</p>
                    <p><strong>Disposal Method:</strong> ${policy.disposalMethod}</p>
                    ${policy.regulatoryBasis ? `<p><strong>Regulatory Basis:</strong> ${policy.regulatoryBasis}</p>` : ''}
                </div>
                <div class="policy-actions">
                    <button class="btn-edit" onclick="auditor.editPolicy(${policy.id})">Edit</button>
                    <button class="btn-delete" onclick="auditor.deletePolicy(${policy.id})">Delete</button>
                </div>
            `;

            this.policiesContainer.appendChild(policyCard);
        });
    }

    editPolicy(id) {
        const policy = this.policies.find(p => p.id === id);
        if (policy) {
            this.openPolicyModal(policy);
        }
    }

    deletePolicy(id) {
        if (confirm('Are you sure you want to delete this policy?')) {
            this.policies = this.policies.filter(p => p.id !== id);
            this.renderPolicies();
        }
    }

    // Record Management
    openRecordModal() {
        this.recordModal.classList.add('show');
        this.recordForm.reset();
    }

    closeRecordModal() {
        this.recordModal.classList.remove('show');
        this.recordForm.reset();
    }

    saveRecord(e) {
        e.preventDefault();

        const recordData = {
            id: this.records.length + 1,
            type: document.getElementById('recordType').value,
            description: document.getElementById('recordDescription').value,
            createdDate: new Date(),
            size: parseFloat(document.getElementById('recordSize').value),
            sensitivity: document.getElementById('recordSensitivity').value
        };

        this.records.push(recordData);
        this.renderRecords();
        this.closeRecordModal();
    }

    renderRecords() {
        const typeFilter = this.recordTypeFilter.value;
        const complianceFilter = this.complianceFilter.value;

        let filteredRecords = this.records;

        if (typeFilter !== 'all') {
            filteredRecords = filteredRecords.filter(r => r.type === typeFilter);
        }

        if (complianceFilter !== 'all') {
            filteredRecords = filteredRecords.filter(r => this.getComplianceStatus(r) === complianceFilter);
        }

        this.recordsTableBody.innerHTML = '';

        filteredRecords.forEach(record => {
            const complianceStatus = this.getComplianceStatus(record);
            const policy = this.getApplicablePolicy(record);
            const expiryDate = this.calculateExpiryDate(record, policy);
            const daysUntilExpiry = this.getDaysUntilExpiry(expiryDate);

            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${record.id}</td>
                <td>${record.type.charAt(0).toUpperCase() + record.type.slice(1)}</td>
                <td>${record.description}</td>
                <td>${record.createdDate.toLocaleDateString()}</td>
                <td>${policy ? `${policy.retentionPeriod.value} ${policy.retentionPeriod.unit}` : 'No Policy'}</td>
                <td>${expiryDate ? expiryDate.toLocaleDateString() : 'N/A'}</td>
                <td class="status-${complianceStatus.replace('-', '-')}">${complianceStatus.replace('-', ' ').toUpperCase()}</td>
                <td class="record-actions">
                    <button class="btn-action btn-view" onclick="auditor.viewRecord(${record.id})">View</button>
                    <button class="btn-action btn-delete-record" onclick="auditor.deleteRecord(${record.id})">Delete</button>
                </td>
            `;

            this.recordsTableBody.appendChild(row);
        });
    }

    getApplicablePolicy(record) {
        // Find policy that applies to this record type
        return this.policies.find(policy =>
            policy.active && policy.dataTypes.some(type =>
                record.description.toLowerCase().includes(type.toLowerCase()) ||
                record.type.toLowerCase().includes(type.toLowerCase())
            )
        );
    }

    calculateExpiryDate(record, policy) {
        if (!policy) return null;

        const expiryDate = new Date(record.createdDate);

        switch (policy.retentionPeriod.unit) {
            case 'days':
                expiryDate.setDate(expiryDate.getDate() + policy.retentionPeriod.value);
                break;
            case 'months':
                expiryDate.setMonth(expiryDate.getMonth() + policy.retentionPeriod.value);
                break;
            case 'years':
                expiryDate.setFullYear(expiryDate.getFullYear() + policy.retentionPeriod.value);
                break;
        }

        return expiryDate;
    }

    getDaysUntilExpiry(expiryDate) {
        if (!expiryDate) return Infinity;
        const today = new Date();
        const diffTime = expiryDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getComplianceStatus(record) {
        const policy = this.getApplicablePolicy(record);
        if (!policy) return 'pending';

        const expiryDate = this.calculateExpiryDate(record, policy);
        const daysUntilExpiry = this.getDaysUntilExpiry(expiryDate);

        if (daysUntilExpiry < 0) return 'non-compliant';
        if (daysUntilExpiry <= 30) return 'expiring';
        return 'compliant';
    }

    viewRecord(id) {
        const record = this.records.find(r => r.id === id);
        if (record) {
            alert(`Record Details:\n\nID: ${record.id}\nType: ${record.type}\nDescription: ${record.description}\nCreated: ${record.createdDate.toLocaleDateString()}\nSize: ${record.size} MB\nSensitivity: ${record.sensitivity}`);
        }
    }

    deleteRecord(id) {
        if (confirm('Are you sure you want to delete this record?')) {
            this.records = this.records.filter(r => r.id !== id);
            this.renderRecords();
            this.updateDashboard();
        }
    }

    // Compliance Audit
    runComplianceAudit() {
        const results = {
            total: this.records.length,
            compliant: 0,
            nonCompliant: 0,
            expiring: 0,
            pending: 0,
            violations: []
        };

        this.records.forEach(record => {
            const status = this.getComplianceStatus(record);
            results[status.replace('-', '')]++;

            if (status === 'non-compliant') {
                results.violations.push({
                    record: record,
                    reason: 'Retention period exceeded',
                    severity: 'high'
                });
            } else if (status === 'expiring') {
                results.violations.push({
                    record: record,
                    reason: 'Expires within 30 days',
                    severity: 'medium'
                });
            }
        });

        this.auditResults = results;
        this.displayAuditResults();
        this.updateDashboard();

        if (results.violations.length > 0) {
            this.showViolationsAlert(results.violations);
        }
    }

    displayAuditResults() {
        if (!this.auditResults) return;

        const results = this.auditResults;
        let html = '<div class="audit-summary">';

        html += `<p><strong>Total Records:</strong> ${results.total}</p>`;
        html += `<p><strong>Compliant:</strong> ${results.compliant} (${Math.round(results.compliant/results.total*100)}%)</p>`;
        html += `<p><strong>Non-Compliant:</strong> ${results.nonCompliant} (${Math.round(results.nonCompliant/results.total*100)}%)</p>`;
        html += `<p><strong>Expiring Soon:</strong> ${results.expiring} (${Math.round(results.expiring/results.total*100)}%)</p>`;
        html += `<p><strong>Pending Review:</strong> ${results.pending} (${Math.round(results.pending/results.total*100)}%)</p>`;

        html += '</div>';

        if (results.violations.length > 0) {
            html += '<h4>Violations Found:</h4><ul>';
            results.violations.forEach(violation => {
                html += `<li class="violation-item severity-${violation.severity}">`;
                html += `<strong>${violation.record.description}</strong> - ${violation.reason}`;
                html += '</li>';
            });
            html += '</ul>';
        } else {
            html += '<p class="no-violations">✅ No compliance violations found!</p>';
        }

        this.resultsContainer.innerHTML = html;
    }

    showViolationsAlert(violations) {
        const highSeverity = violations.filter(v => v.severity === 'high').length;
        const mediumSeverity = violations.filter(v => v.severity === 'medium').length;

        let alertHtml = `<p><strong>${violations.length} compliance issues detected:</strong></p>`;
        alertHtml += `<ul>`;
        alertHtml += `<li><strong>${highSeverity}</strong> high-severity violations (expired retention)</li>`;
        alertHtml += `<li><strong>${mediumSeverity}</strong> medium-severity violations (expiring soon)</li>`;
        alertHtml += `</ul>`;
        alertHtml += `<p>Immediate action recommended for high-severity violations.</p>`;

        this.alertContent.innerHTML = alertHtml;
        this.violationsAlert.style.display = 'block';
    }

    updateDashboard() {
        if (!this.auditResults) {
            // Show default values
            this.compliantCount.textContent = '0';
            this.compliantPercentage.textContent = '0%';
            this.nonCompliantCount.textContent = '0';
            this.nonCompliantPercentage.textContent = '0%';
            this.pendingCount.textContent = this.records.length;
            this.pendingPercentage.textContent = '100%';
            this.nextAuditDate.textContent = 'Not Scheduled';
            return;
        }

        const results = this.auditResults;
        const total = results.total;

        this.compliantCount.textContent = results.compliant;
        this.compliantPercentage.textContent = total > 0 ? Math.round(results.compliant/total*100) + '%' : '0%';

        this.nonCompliantCount.textContent = results.nonCompliant;
        this.nonCompliantPercentage.textContent = total > 0 ? Math.round(results.nonCompliant/total*100) + '%' : '0%';

        this.pendingCount.textContent = results.pending;
        this.pendingPercentage.textContent = total > 0 ? Math.round(results.pending/total*100) + '%' : '0%';

        // Schedule next audit (weekly)
        const nextAudit = new Date();
        nextAudit.setDate(nextAudit.getDate() + 7);
        this.nextAuditDate.textContent = nextAudit.toLocaleDateString();
    }

    generateReport() {
        if (!this.auditResults) {
            alert('Please run an audit first to generate a report.');
            return;
        }

        const report = {
            generatedAt: new Date().toISOString(),
            summary: this.auditResults,
            policies: this.policies,
            recommendations: this.generateRecommendations()
        };

        // In a real application, this would generate a PDF or detailed report
        const reportText = JSON.stringify(report, null, 2);
        const blob = new Blob([reportText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance-audit-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateRecommendations() {
        const recommendations = [];

        if (this.auditResults.nonCompliant > 0) {
            recommendations.push({
                priority: 'high',
                action: 'Immediate data disposal required',
                details: `${this.auditResults.nonCompliant} records exceed retention periods`
            });
        }

        if (this.auditResults.expiring > 0) {
            recommendations.push({
                priority: 'medium',
                action: 'Schedule data review',
                details: `${this.auditResults.expiring} records expire within 30 days`
            });
        }

        if (this.auditResults.pending > this.records.length * 0.1) {
            recommendations.push({
                priority: 'low',
                action: 'Review data classification',
                details: 'Significant number of records lack retention policies'
            });
        }

        return recommendations;
    }

    startRemediation() {
        alert('Remediation process started. In a real system, this would:\n\n1. Automatically delete expired records\n2. Flag records for manual review\n3. Generate disposal reports\n4. Update compliance logs\n\nThis demo shows the concept - actual implementation would require secure data handling procedures.');
        this.dismissAlert();
    }

    dismissAlert() {
        this.violationsAlert.style.display = 'none';
    }
}

// Initialize the auditor when the page loads
let auditor;
document.addEventListener('DOMContentLoaded', () => {
    auditor = new DataRetentionAuditor();
});