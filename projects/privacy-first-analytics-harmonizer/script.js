// Privacy-First Analytics Harmonizer - JavaScript

class PrivacyAnalyticsHarmonizer {
    constructor() {
        this.consentTemplates = [];
        this.consentRequests = [];
        this.dataSources = [];
        this.dataFlows = [];
        this.auditLog = [];
        this.privacyEvents = [];
        this.analyticsReports = [];
        this.complianceStatus = {
            gdpr: 'compliant',
            ccpa: 'compliant',
            pipeda: 'warning'
        };

        // Mock data for demonstration
        this.userData = [];
        this.consentData = [];
        this.analyticsData = [];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
        this.initializeMockData();
        this.startMonitoring();
        this.updateUI();
        this.initializeCharts();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.sidebar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Privacy mode toggle
        document.getElementById('privacy-mode-toggle').addEventListener('click', () => {
            this.togglePrivacyMode();
        });

        // Modals
        document.getElementById('create-consent-template').addEventListener('click', () => {
            this.showModal('consent-template-modal');
        });

        document.getElementById('add-data-source').addEventListener('click', () => {
            this.showModal('data-source-modal');
        });

        document.getElementById('audit-log-btn').addEventListener('click', () => {
            this.showAuditLog();
        });

        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideAllModals();
            });
        });

        // Forms
        document.getElementById('save-consent-template').addEventListener('click', () => {
            this.saveConsentTemplate();
        });

        document.getElementById('save-data-source').addEventListener('click', () => {
            this.saveDataSource();
        });

        // Other controls
        document.getElementById('refresh-dashboard').addEventListener('click', () => {
            this.refreshDashboard();
        });

        document.getElementById('anonymize-data-btn').addEventListener('click', () => {
            this.anonymizeData();
        });

        document.getElementById('export-privacy-report').addEventListener('click', () => {
            this.exportPrivacyReport();
        });

        document.getElementById('run-compliance-check').addEventListener('click', () => {
            this.runComplianceCheck();
        });

        document.getElementById('generate-report').addEventListener('click', () => {
            this.generateAnalyticsReport();
        });

        document.getElementById('save-privacy-settings').addEventListener('click', () => {
            this.savePrivacySettings();
        });

        document.getElementById('reset-privacy-settings').addEventListener('click', () => {
            this.resetPrivacySettings();
        });

        // Flow controls
        document.getElementById('flow-speed').addEventListener('input', (e) => {
            document.getElementById('flow-speed-value').textContent = e.target.value + 'x';
        });

        // Audit log filters
        document.getElementById('filter-audit-log').addEventListener('click', () => {
            this.filterAuditLog();
        });
    }

    switchView(viewName) {
        // Update active button
        document.querySelectorAll('.sidebar-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        // Show selected view
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewName}-view`).classList.add('active');

        // Update view-specific content
        if (viewName === 'consent') {
            this.renderConsentTemplates();
            this.renderConsentRequests();
        } else if (viewName === 'data-flow') {
            this.renderDataFlow();
        } else if (viewName === 'analytics') {
            this.renderAnalytics();
        } else if (viewName === 'compliance') {
            this.renderComplianceStatus();
        }
    }

    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);

        const themeBtn = document.getElementById('theme-toggle');
        themeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';

        localStorage.setItem('theme', newTheme);
    }

    togglePrivacyMode() {
        const btn = document.getElementById('privacy-mode-toggle');
        const isActive = btn.classList.contains('privacy-active');

        if (isActive) {
            btn.classList.remove('privacy-active');
            this.logAuditEvent('privacy_mode', 'Privacy mode deactivated', 'system');
        } else {
            btn.classList.add('privacy-active');
            this.logAuditEvent('privacy_mode', 'Privacy mode activated', 'system');
        }
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    saveConsentTemplate() {
        const form = document.getElementById('consent-template-form');
        const template = {
            id: Date.now().toString(),
            name: document.getElementById('template-name').value,
            description: document.getElementById('template-description').value,
            purpose: document.getElementById('consent-purpose').value,
            retentionPeriod: parseInt(document.getElementById('retention-period').value),
            requireExplicitConsent: document.getElementById('require-explicit-consent').checked,
            activeConsents: 0,
            created: new Date().toISOString()
        };

        this.consentTemplates.push(template);
        this.saveData();
        this.renderConsentTemplates();
        this.hideAllModals();
        form.reset();

        this.logAuditEvent('consent_template_created', `Created template: ${template.name}`, 'admin');
        this.addPrivacyEvent('consent', `New consent template created: ${template.name}`, 'Template creation');
    }

    saveDataSource() {
        const form = document.getElementById('data-source-form');
        const dataCategories = Array.from(document.querySelectorAll('input[name="data-categories"]:checked'))
            .map(cb => cb.value);

        const source = {
            id: Date.now().toString(),
            name: document.getElementById('source-name').value,
            type: document.getElementById('source-type').value,
            dataCategories: dataCategories,
            isAnonymized: document.getElementById('source-anonymized').checked,
            dataPoints: Math.floor(Math.random() * 10000),
            lastUpdated: new Date().toISOString()
        };

        this.dataSources.push(source);
        this.saveData();
        this.updateDataFlow();
        this.hideAllModals();
        form.reset();

        this.logAuditEvent('data_source_added', `Added data source: ${source.name}`, 'admin');
    }

    renderConsentTemplates() {
        const container = document.getElementById('consent-templates');
        container.innerHTML = '';

        this.consentTemplates.forEach(template => {
            const card = document.createElement('div');
            card.className = 'consent-template';

            card.innerHTML = `
                <div class="template-header">
                    <div>
                        <div class="template-title">${template.name}</div>
                        <div class="template-purpose">${template.purpose}</div>
                    </div>
                </div>
                <div class="template-description">${template.description}</div>
                <div class="template-stats">
                    <div>Active: ${template.activeConsents}</div>
                    <div>Retention: ${template.retentionPeriod} days</div>
                </div>
            `;

            container.appendChild(card);
        });
    }

    renderConsentRequests() {
        const container = document.getElementById('consent-requests-list');
        container.innerHTML = '';

        this.consentRequests.slice(-10).reverse().forEach(request => {
            const item = document.createElement('div');
            item.className = 'consent-request';

            item.innerHTML = `
                <div class="request-info">
                    <h4>${request.userId}</h4>
                    <div class="request-details">${request.purpose} - ${request.status}</div>
                </div>
                <div class="request-actions">
                    ${request.status === 'pending' ?
                        `<button class="btn-primary" onclick="harmonizer.approveConsent('${request.id}')">Approve</button>
                         <button class="btn-secondary" onclick="harmonizer.rejectConsent('${request.id}')">Reject</button>` :
                        `<span class="${request.status}">${request.status}</span>`
                    }
                </div>
            `;

            container.appendChild(item);
        });
    }

    approveConsent(requestId) {
        const request = this.consentRequests.find(r => r.id === requestId);
        if (request) {
            request.status = 'approved';
            this.logAuditEvent('consent_approved', `Approved consent for user: ${request.userId}`, 'admin');
            this.addPrivacyEvent('consent', `Consent approved for ${request.userId}`, 'Consent management');
            this.renderConsentRequests();
            this.updateUI();
        }
    }

    rejectConsent(requestId) {
        const request = this.consentRequests.find(r => r.id === requestId);
        if (request) {
            request.status = 'rejected';
            this.logAuditEvent('consent_rejected', `Rejected consent for user: ${request.userId}`, 'admin');
            this.renderConsentRequests();
        }
    }

    renderDataFlow() {
        const canvas = document.getElementById('data-flow-canvas');
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw data sources
        this.dataSources.forEach((source, index) => {
            const x = 100;
            const y = 100 + index * 120;

            // Draw source node
            ctx.fillStyle = source.isAnonymized ? '#10b981' : '#f59e0b';
            ctx.fillRect(x - 40, y - 20, 80, 40);

            ctx.fillStyle = 'white';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(source.name, x, y + 5);

            // Draw data categories
            source.dataCategories.forEach((category, catIndex) => {
                const catX = x + 100;
                const catY = y - 10 + catIndex * 20;

                ctx.fillStyle = '#e2e8f0';
                ctx.fillRect(catX, catY, 60, 16);

                ctx.fillStyle = '#1e293b';
                ctx.font = '10px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(category, catX + 30, catY + 12);
            });

            // Draw anonymization step if needed
            if (!source.isAnonymized) {
                const anonX = x + 200;
                const anonY = y;

                ctx.fillStyle = '#8b5cf6';
                ctx.fillRect(anonX - 30, anonY - 15, 60, 30);

                ctx.fillStyle = 'white';
                ctx.font = '10px Inter';
                ctx.fillText('Anonymize', anonX, anonY + 5);

                // Draw connection line
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x + 40, y);
                ctx.lineTo(anonX - 30, anonY);
                ctx.stroke();
            }
        });
    }

    renderAnalytics() {
        // Update behavior patterns chart
        this.drawBehaviorPatterns();

        // Update insights
        const insightsContainer = document.getElementById('pattern-insights');
        insightsContainer.innerHTML = `
            <div class="insight-item">
                <span>Peak Usage Time:</span>
                <span>2:00 PM - 4:00 PM</span>
            </div>
            <div class="insight-item">
                <span>Most Popular Feature:</span>
                <span>Dashboard Analytics</span>
            </div>
            <div class="insight-item">
                <span>User Retention:</span>
                <span>87%</span>
            </div>
            <div class="insight-item">
                <span>Avg Session Duration:</span>
                <span>12.5 minutes</span>
            </div>
        `;

        // Update impact metrics
        document.getElementById('risk-level').textContent = 'Low';
        document.getElementById('risk-level').className = 'risk-low';
        document.getElementById('data-sensitivity').textContent = 'Medium';
        document.getElementById('compliance-score').textContent = '95/100';

        // Render reports
        this.renderReports();
    }

    drawBehaviorPatterns() {
        const canvas = document.getElementById('behavior-patterns');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Draw sample behavior patterns
        const patterns = [
            { label: 'Page Views', value: 85, color: '#2563eb' },
            { label: 'Interactions', value: 72, color: '#10b981' },
            { label: 'Conversions', value: 45, color: '#f59e0b' },
            { label: 'Retention', value: 87, color: '#ef4444' }
        ];

        const barWidth = 60;
        const spacing = 80;
        const startX = 40;

        patterns.forEach((pattern, index) => {
            const x = startX + index * spacing;
            const barHeight = (pattern.value / 100) * (height - 60);

            // Draw bar
            ctx.fillStyle = pattern.color;
            ctx.fillRect(x, height - barHeight - 30, barWidth, barHeight);

            // Draw label
            ctx.fillStyle = '#1e293b';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(pattern.label, x + barWidth / 2, height - 10);

            // Draw value
            ctx.fillText(pattern.value + '%', x + barWidth / 2, height - barHeight - 35);
        });
    }

    renderReports() {
        const container = document.getElementById('reports-list');
        container.innerHTML = '';

        this.analyticsReports.forEach(report => {
            const item = document.createElement('div');
            item.className = 'report-item';

            item.innerHTML = `
                <div>
                    <div class="report-title">${report.title}</div>
                    <div class="report-date">${this.formatDate(report.created)}</div>
                </div>
                <button class="btn-secondary" onclick="harmonizer.downloadReport('${report.id}')">Download</button>
            `;

            container.appendChild(item);
        });
    }

    renderComplianceStatus() {
        // Update framework statuses
        Object.keys(this.complianceStatus).forEach(framework => {
            const statusElement = document.getElementById(`${framework}-status`);
            const indicator = statusElement.previousElementSibling;

            indicator.className = `status-indicator ${this.complianceStatus[framework]}`;
            statusElement.textContent = this.complianceStatus[framework].charAt(0).toUpperCase() + this.complianceStatus[framework].slice(1);
        });

        // Render violations
        this.renderViolations();
    }

    renderViolations() {
        const container = document.getElementById('violations-list');
        container.innerHTML = '';

        // Sample violations
        const violations = [
            {
                severity: 'warning',
                title: 'Data Retention Exceeded',
                description: 'Some user data exceeds the configured retention period',
                time: '2024-02-25 14:30:15'
            },
            {
                severity: 'critical',
                title: 'Consent Not Obtained',
                description: 'Data processing occurred without valid consent',
                time: '2024-02-25 12:15:22'
            }
        ];

        violations.forEach(violation => {
            const item = document.createElement('div');
            item.className = 'violation-item';

            item.innerHTML = `
                <div class="violation-severity ${violation.severity}"></div>
                <div class="violation-content">
                    <h4>${violation.title}</h4>
                    <div class="violation-description">${violation.description}</div>
                    <div class="violation-time">${violation.time}</div>
                </div>
            `;

            container.appendChild(item);
        });
    }

    showAuditLog() {
        this.renderAuditLog();
        this.showModal('audit-log-modal');
    }

    renderAuditLog() {
        const container = document.getElementById('audit-entries');
        container.innerHTML = '';

        this.auditLog.slice(-50).reverse().forEach(entry => {
            const item = document.createElement('div');
            item.className = 'audit-entry';

            item.innerHTML = `
                <div class="audit-timestamp">${this.formatDateTime(entry.timestamp)}</div>
                <div class="audit-event">${entry.event}</div>
                <div class="audit-details">${entry.details}</div>
                <div class="audit-user">${entry.user}</div>
            `;

            container.appendChild(item);
        });
    }

    filterAuditLog() {
        const typeFilter = document.getElementById('audit-filter-type').value;
        const startDate = document.getElementById('audit-start-date').value;
        const endDate = document.getElementById('audit-end-date').value;

        let filtered = this.auditLog;

        if (typeFilter !== 'all') {
            filtered = filtered.filter(entry => entry.event.includes(typeFilter));
        }

        if (startDate) {
            filtered = filtered.filter(entry => entry.timestamp >= startDate);
        }

        if (endDate) {
            filtered = filtered.filter(entry => entry.timestamp <= endDate + 'T23:59:59');
        }

        // Render filtered results
        const container = document.getElementById('audit-entries');
        container.innerHTML = '';

        filtered.slice(-50).reverse().forEach(entry => {
            const item = document.createElement('div');
            item.className = 'audit-entry';

            item.innerHTML = `
                <div class="audit-timestamp">${this.formatDateTime(entry.timestamp)}</div>
                <div class="audit-event">${entry.event}</div>
                <div class="audit-details">${entry.details}</div>
                <div class="audit-user">${entry.user}</div>
            `;

            container.appendChild(item);
        });
    }

    initializeCharts() {
        this.drawConsentChart();
        this.drawAnonymizationChart();
    }

    drawConsentChart() {
        const canvas = document.getElementById('consent-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Sample consent data
        const data = [65, 72, 78, 82, 85, 87, 89];
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        this.drawLineChart(ctx, data, labels, '#10b981');
    }

    drawAnonymizationChart() {
        const canvas = document.getElementById('anonymization-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Sample anonymization data
        const data = [45, 52, 58, 65, 71, 76, 80];
        const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'];

        this.drawLineChart(ctx, data, labels, '#8b5cf6');
    }

    drawLineChart(ctx, data, labels, color) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const padding = 40;

        const maxValue = Math.max(...data);
        const minValue = Math.min(...data);
        const range = maxValue - minValue || 1;

        // Draw line
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();

        data.forEach((value, index) => {
            const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw points
        ctx.fillStyle = color;
        data.forEach((value, index) => {
            const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Draw labels
        ctx.fillStyle = '#64748b';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';

        labels.forEach((label, index) => {
            const x = padding + (index / (labels.length - 1)) * (width - 2 * padding);
            ctx.fillText(label, x, height - 10);
        });
    }

    addPrivacyEvent(type, title, description) {
        const event = {
            id: Date.now().toString(),
            type: type,
            title: title,
            description: description,
            timestamp: new Date().toISOString()
        };

        this.privacyEvents.unshift(event);

        // Keep only last 20 events
        if (this.privacyEvents.length > 20) {
            this.privacyEvents = this.privacyEvents.slice(0, 20);
        }

        this.renderPrivacyEvents();
    }

    renderPrivacyEvents() {
        const container = document.getElementById('privacy-events-list');
        container.innerHTML = '';

        this.privacyEvents.forEach(event => {
            const item = document.createElement('div');
            item.className = 'privacy-event';

            item.innerHTML = `
                <div class="event-icon ${event.type}">${this.getEventIcon(event.type)}</div>
                <div class="event-content">
                    <div class="event-title">${event.title}</div>
                    <div class="event-description">${event.description}</div>
                </div>
                <div class="event-time">${this.formatTime(event.timestamp)}</div>
            `;

            container.appendChild(item);
        });
    }

    getEventIcon(type) {
        const icons = {
            consent: '📝',
            violation: '⚠️',
            anonymization: '🔄',
            compliance: '✅'
        };
        return icons[type] || '📋';
    }

    updateUI() {
        // Update sidebar metrics
        const activeConsents = this.consentRequests.filter(r => r.status === 'approved').length;
        const totalUsers = Math.floor(Math.random() * 1000) + 500; // Mock data
        const dataProcessed = this.dataSources.reduce((sum, source) => sum + source.dataPoints, 0);

        document.getElementById('consent-rate').textContent = Math.round((activeConsents / Math.max(totalUsers, 1)) * 100) + '%';
        document.getElementById('data-processed').textContent = dataProcessed.toLocaleString();
        document.getElementById('privacy-score').textContent = '95/100';

        // Update dashboard metrics
        document.getElementById('total-users').textContent = totalUsers.toLocaleString();
        document.getElementById('active-consents').textContent = activeConsents.toLocaleString();
        document.getElementById('data-points').textContent = dataProcessed.toLocaleString();

        // Update compliance percentage
        const complianceScore = 95; // Mock score
        document.getElementById('compliance-percentage').textContent = complianceScore + '%';

        // Update status dots
        document.getElementById('compliance-percentage').style.background = `conic-gradient(#10b981 0% ${complianceScore}%, #e2e8f0 ${complianceScore}% 100%)`;
    }

    startMonitoring() {
        setInterval(() => {
            this.updateMetrics();
            this.checkCompliance();
        }, 5000); // Update every 5 seconds
    }

    updateMetrics() {
        // Simulate metric updates
        this.dataSources.forEach(source => {
            source.dataPoints += Math.floor(Math.random() * 100);
        });

        this.updateUI();
    }

    checkCompliance() {
        // Simulate compliance checks
        const violations = Math.random() > 0.8; // 20% chance of violation

        if (violations) {
            this.addPrivacyEvent('violation', 'Compliance Check Failed', 'Potential data retention violation detected');
            this.logAuditEvent('compliance_violation', 'Data retention policy violation detected', 'system');
        }
    }

    anonymizeData() {
        // Simulate data anonymization
        this.dataSources.forEach(source => {
            if (!source.isAnonymized) {
                source.isAnonymized = true;
                this.logAuditEvent('data_anonymized', `Anonymized data from source: ${source.name}`, 'system');
            }
        });

        this.addPrivacyEvent('anonymization', 'Data Anonymization Complete', 'All data sources have been anonymized');
        this.updateDataFlow();
    }

    exportPrivacyReport() {
        const report = {
            timestamp: new Date().toISOString(),
            compliance: this.complianceStatus,
            dataSources: this.dataSources.length,
            activeConsents: this.consentRequests.filter(r => r.status === 'approved').length,
            violations: 2, // Mock data
            recommendations: [
                'Review data retention policies',
                'Implement additional anonymization measures',
                'Update consent templates'
            ]
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `privacy-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        this.logAuditEvent('report_exported', 'Privacy report exported', 'admin');
    }

    runComplianceCheck() {
        // Simulate compliance check
        this.addPrivacyEvent('compliance', 'Compliance Check Completed', 'All frameworks are compliant');

        // Update compliance status
        this.complianceStatus.pipeda = 'compliant';
        this.renderComplianceStatus();

        this.logAuditEvent('compliance_check', 'Manual compliance check completed', 'admin');
    }

    generateAnalyticsReport() {
        const report = {
            id: Date.now().toString(),
            title: `Analytics Report - ${new Date().toLocaleDateString()}`,
            created: new Date().toISOString(),
            data: {
                totalUsers: 1250,
                activeUsers: 890,
                pageViews: 15420,
                conversions: 234,
                privacyScore: 95
            }
        };

        this.analyticsReports.unshift(report);

        // Keep only last 10 reports
        if (this.analyticsReports.length > 10) {
            this.analyticsReports = this.analyticsReports.slice(0, 10);
        }

        this.renderReports();
        this.logAuditEvent('report_generated', `Analytics report generated: ${report.title}`, 'admin');
    }

    downloadReport(reportId) {
        const report = this.analyticsReports.find(r => r.id === reportId);
        if (report) {
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${report.title.replace(/\s+/g, '_')}.json`;
            a.click();
        }
    }

    savePrivacySettings() {
        // Collect settings from form
        const settings = {
            collectBehavioralData: document.getElementById('collect-behavioral-data').checked,
            collectDemographicData: document.getElementById('collect-demographic-data').checked,
            collectDeviceData: document.getElementById('collect-device-data').checked,
            retentionPeriod: document.getElementById('retention-period').value,
            autoDeleteExpired: document.getElementById('auto-delete-expired').checked,
            anonymizationLevel: document.getElementById('anonymization-level').value,
            enableDifferentialPrivacy: document.getElementById('enable-differential-privacy').checked,
            enableDataPortability: document.getElementById('enable-data-portability').checked,
            enableRightToErasure: document.getElementById('enable-right-to-erasure').checked,
            enableConsentWithdrawal: document.getElementById('enable-consent-withdrawal').checked
        };

        localStorage.setItem('privacySettings', JSON.stringify(settings));
        this.logAuditEvent('settings_updated', 'Privacy settings updated', 'admin');
        this.addPrivacyEvent('compliance', 'Privacy Settings Updated', 'Privacy configuration has been saved');
    }

    resetPrivacySettings() {
        if (confirm('Are you sure you want to reset all privacy settings to defaults?')) {
            localStorage.removeItem('privacySettings');
            // Reset form to defaults
            document.getElementById('collect-behavioral-data').checked = true;
            document.getElementById('collect-demographic-data').checked = false;
            document.getElementById('collect-device-data').checked = true;
            document.getElementById('retention-period').value = '90';
            document.getElementById('auto-delete-expired').checked = true;
            document.getElementById('anonymization-level').value = 'standard';
            document.getElementById('enable-differential-privacy').checked = false;
            document.getElementById('enable-data-portability').checked = true;
            document.getElementById('enable-right-to-erasure').checked = true;
            document.getElementById('enable-consent-withdrawal').checked = true;

            this.logAuditEvent('settings_reset', 'Privacy settings reset to defaults', 'admin');
        }
    }

    logAuditEvent(event, details, user) {
        const auditEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            event: event,
            details: details,
            user: user
        };

        this.auditLog.push(auditEntry);

        // Keep only last 1000 audit entries
        if (this.auditLog.length > 1000) {
            this.auditLog = this.auditLog.slice(-1000);
        }
    }

    updateDataFlow() {
        this.renderDataFlow();
    }

    refreshDashboard() {
        this.updateUI();
        this.initializeCharts();
        this.renderPrivacyEvents();
    }

    initializeMockData() {
        // Initialize with sample data
        this.consentTemplates = [
            {
                id: '1',
                name: 'Analytics Consent',
                description: 'Allow collection of usage analytics',
                purpose: 'analytics',
                retentionPeriod: 90,
                requireExplicitConsent: true,
                activeConsents: 45,
                created: '2024-01-15T10:00:00Z'
            },
            {
                id: '2',
                name: 'Marketing Consent',
                description: 'Receive personalized marketing communications',
                purpose: 'marketing',
                retentionPeriod: 365,
                requireExplicitConsent: true,
                activeConsents: 23,
                created: '2024-01-20T14:30:00Z'
            }
        ];

        this.consentRequests = [
            {
                id: '1',
                userId: 'user_123',
                purpose: 'analytics',
                status: 'pending',
                requested: '2024-02-25T10:00:00Z'
            },
            {
                id: '2',
                userId: 'user_456',
                purpose: 'marketing',
                status: 'approved',
                requested: '2024-02-24T15:30:00Z'
            }
        ];

        this.dataSources = [
            {
                id: '1',
                name: 'Website Analytics',
                type: 'website',
                dataCategories: ['behavioral', 'technical'],
                isAnonymized: true,
                dataPoints: 15420,
                lastUpdated: '2024-02-25T12:00:00Z'
            },
            {
                id: '2',
                name: 'Mobile App Data',
                type: 'mobile-app',
                dataCategories: ['behavioral', 'location'],
                isAnonymized: false,
                dataPoints: 8750,
                lastUpdated: '2024-02-25T11:30:00Z'
            }
        ];

        // Initialize privacy events
        this.addPrivacyEvent('consent', 'System Initialized', 'Privacy analytics system started');
        this.addPrivacyEvent('compliance', 'GDPR Compliance Verified', 'All GDPR requirements met');
    }

    loadData() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        document.getElementById('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙';

        const privacySettings = localStorage.getItem('privacySettings');
        if (privacySettings) {
            const settings = JSON.parse(privacySettings);
            // Apply saved settings to form
            Object.keys(settings).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = settings[key];
                    } else {
                        element.value = settings[key];
                    }
                }
            });
        }
    }

    saveData() {
        const data = {
            consentTemplates: this.consentTemplates,
            consentRequests: this.consentRequests,
            dataSources: this.dataSources,
            auditLog: this.auditLog,
            privacyEvents: this.privacyEvents,
            analyticsReports: this.analyticsReports
        };
        localStorage.setItem('privacyAnalyticsData', JSON.stringify(data));
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.harmonizer = new PrivacyAnalyticsHarmonizer();
});