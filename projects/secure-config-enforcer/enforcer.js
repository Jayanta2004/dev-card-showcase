/**
 * Secure Configuration Baseline Enforcer
 * 
 * Enforces standardized configuration baselines across environments
 * and validates active configurations against approved templates.
 */

class ConfigurationBaselineEnforcer {
    constructor() {
        this.environments = [];
        this.baselines = {};
        this.violations = [];
        this.policies = [];
        this.auditLog = [];
        this.complianceScore = 0;
        this.selectedViolation = null;

        this.initializeDefaults();
    }

    /**
     * Initialize with default environments and baselines
     */
    initializeDefaults() {
        // Default baselines
        this.baselines = {
            'production': {
                version: '1.0.0',
                updated: new Date(),
                rules: {
                    'encryption.enabled': { required: true, value: true, severity: 'critical' },
                    'tls.version': { required: true, value: '1.3', severity: 'critical' },
                    'auth.mfa': { required: true, value: true, severity: 'critical' },
                    'logging.enabled': { required: true, value: true, severity: 'high' },
                    'audit.enabled': { required: true, value: true, severity: 'high' },
                    'cors.enabled': { required: true, value: false, severity: 'high' },
                    'debug.mode': { required: true, value: false, severity: 'critical' },
                    'database.ssl': { required: true, value: true, severity: 'high' },
                    'api.rateLimit': { required: true, value: 1000, severity: 'medium' },
                    'timeout.request': { required: true, value: 30, severity: 'medium' }
                }
            },
            'staging': {
                version: '1.0.0',
                updated: new Date(),
                rules: {
                    'encryption.enabled': { required: true, value: true, severity: 'high' },
                    'tls.version': { required: true, value: '1.2', severity: 'high' },
                    'auth.mfa': { required: false, value: false, severity: 'medium' },
                    'logging.enabled': { required: true, value: true, severity: 'high' },
                    'audit.enabled': { required: true, value: true, severity: 'medium' },
                    'cors.enabled': { required: true, value: true, severity: 'low' },
                    'debug.mode': { required: false, value: false, severity: 'high' },
                    'database.ssl': { required: true, value: true, severity: 'high' },
                    'api.rateLimit': { required: true, value: 5000, severity: 'low' },
                    'timeout.request': { required: true, value: 60, severity: 'low' }
                }
            },
            'development': {
                version: '1.0.0',
                updated: new Date(),
                rules: {
                    'encryption.enabled': { required: false, value: false, severity: 'low' },
                    'debug.mode': { required: false, value: true, severity: 'low' },
                    'logging.enabled': { required: true, value: true, severity: 'medium' },
                    'cors.enabled': { required: true, value: true, severity: 'low' },
                    'api.rateLimit': { required: false, value: 10000, severity: 'low' }
                }
            }
        };

        // Default policies
        this.policies = [
            {
                id: 'encryption',
                icon: '🔐',
                name: 'Encryption Policy',
                description: 'All data at rest and in transit must be encrypted',
                rules: ['encryption.enabled', 'tls.version', 'database.ssl']
            },
            {
                id: 'authentication',
                icon: '👤',
                name: 'Authentication Policy',
                description: 'Strong authentication mechanisms required',
                rules: ['auth.mfa', 'tls.version']
            },
            {
                id: 'logging',
                icon: '📝',
                name: 'Logging & Audit Policy',
                description: 'Comprehensive logging and audit trail required',
                rules: ['logging.enabled', 'audit.enabled']
            },
            {
                id: 'security',
                icon: '🛡️',
                name: 'Security Policy',
                description: 'Security hardening requirements',
                rules: ['debug.mode', 'cors.enabled', 'api.rateLimit']
            }
        ];

        // Default environments
        this.environments = [
            {
                id: 'prod-1',
                name: 'Production - US East',
                type: 'production',
                status: 'compliant',
                lastValidation: new Date(),
                violations: 0,
                config: {
                    'encryption.enabled': true,
                    'tls.version': '1.3',
                    'auth.mfa': true,
                    'logging.enabled': true,
                    'audit.enabled': true,
                    'debug.mode': false,
                    'database.ssl': true,
                    'api.rateLimit': 1000,
                    'timeout.request': 30
                }
            },
            {
                id: 'prod-2',
                name: 'Production - US West',
                type: 'production',
                status: 'non-compliant',
                lastValidation: new Date(),
                violations: 2,
                config: {
                    'encryption.enabled': true,
                    'tls.version': '1.2',
                    'auth.mfa': true,
                    'logging.enabled': true,
                    'audit.enabled': false,
                    'debug.mode': false,
                    'database.ssl': true,
                    'api.rateLimit': 1000,
                    'timeout.request': 30
                }
            },
            {
                id: 'staging-1',
                name: 'Staging - Primary',
                type: 'staging',
                status: 'compliant',
                lastValidation: new Date(),
                violations: 0,
                config: {
                    'encryption.enabled': true,
                    'tls.version': '1.2',
                    'auth.mfa': false,
                    'logging.enabled': true,
                    'audit.enabled': true,
                    'cors.enabled': true,
                    'debug.mode': false,
                    'database.ssl': true,
                    'api.rateLimit': 5000,
                    'timeout.request': 60
                }
            },
            {
                id: 'dev-1',
                name: 'Development - Local',
                type: 'development',
                status: 'non-compliant',
                lastValidation: new Date(),
                violations: 1,
                config: {
                    'encryption.enabled': false,
                    'debug.mode': true,
                    'logging.enabled': true,
                    'cors.enabled': true,
                    'api.rateLimit': 10000,
                    'tls.version': '1.2'
                }
            }
        ];
    }

    /**
     * Initialize UI and run initial validation
     */
    initialize() {
        this.renderEnvironments();
        this.renderBaselines();
        this.renderPolicies();
        this.validateAll();
    }

    /**
     * Validate all environments against baselines
     */
    validateAll() {
        this.violations = [];
        
        this.environments.forEach(env => {
            const baseline = this.baselines[env.type];
            if (!baseline) return;

            Object.entries(baseline.rules).forEach(([rule, ruleConfig]) => {
                const actualValue = env.config[rule];
                
                if (actualValue === undefined && ruleConfig.required) {
                    this.violations.push({
                        id: `${env.id}-${rule}-missing`,
                        environmentId: env.id,
                        environmentName: env.name,
                        rule,
                        type: 'missing',
                        severity: ruleConfig.severity,
                        expected: ruleConfig.value,
                        actual: 'NOT SET',
                        timestamp: new Date()
                    });
                } else if (actualValue !== ruleConfig.value && ruleConfig.required) {
                    this.violations.push({
                        id: `${env.id}-${rule}-mismatch`,
                        environmentId: env.id,
                        environmentName: env.name,
                        rule,
                        type: 'mismatch',
                        severity: ruleConfig.severity,
                        expected: ruleConfig.value,
                        actual: actualValue,
                        timestamp: new Date()
                    });
                }
            });
        });

        // Update environment status
        this.environments.forEach(env => {
            const envViolations = this.violations.filter(v => v.environmentId === env.id);
            env.violations = envViolations.length;
            
            const critical = envViolations.some(v => v.severity === 'critical');
            const high = envViolations.some(v => v.severity === 'high');
            
            if (critical) {
                env.status = 'critical';
            } else if (high || envViolations.length > 0) {
                env.status = 'non-compliant';
            } else {
                env.status = 'compliant';
            }
            
            env.lastValidation = new Date();
        });

        this.calculateComplianceScore();
        this.logAuditEvent('validation', `Validated all ${this.environments.length} environments`);
        this.updateUI();
    }

    /**
     * Calculate overall compliance score
     */
    calculateComplianceScore() {
        if (this.environments.length === 0) {
            this.complianceScore = 100;
            return;
        }

        const totalRules = this.environments.reduce((sum, env) => {
            const baseline = this.baselines[env.type];
            return sum + (baseline ? Object.keys(baseline.rules).length : 0);
        }, 0);

        const passedRules = totalRules - this.violations.length;
        this.complianceScore = totalRules > 0 ? Math.round((passedRules / totalRules) * 100) : 100;
    }

    /**
     * Render environments list
     */
    renderEnvironments() {
        const container = document.getElementById('environmentsList');
        
        if (this.environments.length === 0) {
            container.innerHTML = '<div class="placeholder">No environments configured</div>';
            return;
        }

        container.innerHTML = this.environments.map(env => `
            <div class="environment-card">
                <div class="environment-header">
                    <div>
                        <div class="environment-name">${env.name}</div>
                    </div>
                    <span class="compliance-badge badge-${env.status === 'compliant' ? 'compliant' : env.status === 'critical' ? 'critical' : 'non-compliant'}">
                        ${env.status}
                    </span>
                </div>
                <div class="environment-body">
                    <div class="env-detail">
                        <span class="env-detail-label">Type:</span>
                        <span class="env-detail-value">${env.type}</span>
                    </div>
                    <div class="env-detail">
                        <span class="env-detail-label">ID:</span>
                        <span class="env-detail-value">${env.id}</span>
                    </div>
                    <div class="env-detail">
                        <span class="env-detail-label">Violations:</span>
                        <span class="env-detail-value">${env.violations}</span>
                    </div>
                    <div class="env-detail">
                        <span class="env-detail-label">Last Validation:</span>
                        <span class="env-detail-value">${env.lastValidation.toLocaleTimeString()}</span>
                    </div>
                </div>
                <div class="env-actions">
                    <button class="env-btn" onclick="window.enforcer.validateEnvironment('${env.id}')">Validate</button>
                    <button class="env-btn" onclick="window.enforcer.showEnvironmentDetails('${env.id}')">Details</button>
                    <button class="env-btn" onclick="window.enforcer.remediateEnvironment('${env.id}')">Remediate</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render baselines
     */
    renderBaselines() {
        const container = document.getElementById('baselinesList');
        
        const baselinesArray = Object.entries(this.baselines);

        if (baselinesArray.length === 0) {
            container.innerHTML = '<div class="placeholder">No baselines defined</div>';
            return;
        }

        container.innerHTML = baselinesArray.map(([name, baseline]) => `
            <div class="baseline-card">
                <div class="baseline-header">
                    <div class="baseline-name">${name.charAt(0).toUpperCase() + name.slice(1)} Baseline</div>
                    <div class="baseline-version">v${baseline.version}</div>
                </div>
                <div class="baseline-details">
                    <div class="baseline-item">
                        <strong>Rules:</strong>
                        <span>${Object.keys(baseline.rules).length}</span>
                    </div>
                    <div class="baseline-item">
                        <strong>Updated:</strong>
                        <span>${baseline.updated.toLocaleDateString()}</span>
                    </div>
                    <div class="baseline-item">
                        <strong>Status:</strong>
                        <span>Active</span>
                    </div>
                </div>
                <div class="baseline-actions">
                    <button class="baseline-btn" onclick="window.enforcer.editBaseline('${name}')">Edit</button>
                    <button class="baseline-btn" onclick="window.enforcer.viewBaseline('${name}')">View</button>
                    <button class="baseline-btn" onclick="window.enforcer.duplicateBaseline('${name}')">Duplicate</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render policies
     */
    renderPolicies() {
        const container = document.getElementById('policiesGrid');
        
        if (this.policies.length === 0) {
            container.innerHTML = '<div class="placeholder">No policies configured</div>';
            return;
        }

        container.innerHTML = this.policies.map(policy => `
            <div class="policy-card">
                <div class="policy-icon">${policy.icon}</div>
                <div class="policy-name">${policy.name}</div>
                <div class="policy-description">${policy.description}</div>
                <div class="policy-actions">
                    <button class="policy-btn" onclick="window.enforcer.editPolicy('${policy.id}')">Edit</button>
                    <button class="policy-btn" onclick="window.enforcer.viewPolicy('${policy.id}')">View</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render violations list
     */
    renderViolations() {
        const container = document.getElementById('violationsList');
        
        if (this.violations.length === 0) {
            container.innerHTML = '<div class="placeholder">No violations detected</div>';
            return;
        }

        container.innerHTML = this.violations.map(violation => `
            <div class="violation-item ${violation.severity}" onclick="window.enforcer.showViolationDetails('${violation.id}')">
                <div class="violation-header">
                    <div class="violation-title">${violation.rule}</div>
                    <span class="severity-badge severity-${violation.severity}">${violation.severity}</span>
                </div>
                <div class="violation-details">
                    <strong>${violation.environmentName}</strong> | ${violation.type} | 
                    Expected: <code>${JSON.stringify(violation.expected)}</code> | 
                    Actual: <code>${JSON.stringify(violation.actual)}</code>
                </div>
            </div>
        `).join('');

        // Update environment filter
        const envFilter = document.getElementById('environmentFilter');
        const currentValue = envFilter.value;
        envFilter.innerHTML = `
            <option value="">All Environments</option>
            ${[...new Set(this.violations.map(v => v.environmentName))].map(name =>
                `<option value="${name}">${name}</option>`
            ).join('')}
        `;
        envFilter.value = currentValue;
    }

    /**
     * Render audit log
     */
    renderAuditLog() {
        const container = document.getElementById('auditList');
        
        if (this.auditLog.length === 0) {
            container.innerHTML = '<div class="placeholder">No audit events recorded</div>';
            return;
        }

        container.innerHTML = this.auditLog.map(event => `
            <div class="audit-item">
                <div class="audit-icon">${this.getAuditIcon(event.type)}</div>
                <div class="audit-content">
                    <div class="audit-action">${event.action}</div>
                    <div class="audit-details">${event.details}</div>
                </div>
                <div class="audit-time">${event.timestamp.toLocaleTimeString()}</div>
            </div>
        `).join('');
    }

    /**
     * Get audit event icon
     */
    getAuditIcon(type) {
        const icons = {
            'validation': '✓',
            'violation': '⚠️',
            'remediation': '🔧',
            'sync': '🔄',
            'policy': '📋'
        };
        return icons[type] || '📝';
    }

    /**
     * Log audit event
     */
    logAuditEvent(type, details, action = null) {
        this.auditLog.unshift({
            type,
            action: action || this.getActionName(type),
            details,
            timestamp: new Date()
        });

        // Keep only last 100 events
        if (this.auditLog.length > 100) {
            this.auditLog.pop();
        }
    }

    /**
     * Get action name from type
     */
    getActionName(type) {
        const names = {
            'validation': 'Configuration Validation',
            'violation': 'Violation Detected',
            'remediation': 'Auto-Remediation',
            'sync': 'Baseline Sync',
            'policy': 'Policy Update'
        };
        return names[type] || 'Event Logged';
    }

    /**
     * Validate single environment
     */
    validateEnvironment(envId) {
        const env = this.environments.find(e => e.id === envId);
        if (!env) return;

        const baseline = this.baselines[env.type];
        if (!baseline) return;

        const beforeViolations = this.violations.filter(v => v.environmentId === envId).length;
        
        // Re-validate this environment
        this.violations = this.violations.filter(v => v.environmentId !== envId);
        
        Object.entries(baseline.rules).forEach(([rule, ruleConfig]) => {
            const actualValue = env.config[rule];
            
            if (actualValue === undefined && ruleConfig.required) {
                this.violations.push({
                    id: `${env.id}-${rule}-missing`,
                    environmentId: env.id,
                    environmentName: env.name,
                    rule,
                    type: 'missing',
                    severity: ruleConfig.severity,
                    expected: ruleConfig.value,
                    actual: 'NOT SET',
                    timestamp: new Date()
                });
            } else if (actualValue !== ruleConfig.value && ruleConfig.required) {
                this.violations.push({
                    id: `${env.id}-${rule}-mismatch`,
                    environmentId: env.id,
                    environmentName: env.name,
                    rule,
                    type: 'mismatch',
                    severity: ruleConfig.severity,
                    expected: ruleConfig.value,
                    actual: actualValue,
                    timestamp: new Date()
                });
            }
        });

        const afterViolations = this.violations.filter(v => v.environmentId === envId).length;
        this.logAuditEvent('validation', `Validated environment ${env.name}: ${beforeViolations} → ${afterViolations} violations`);
        
        this.calculateComplianceScore();
        this.updateUI();
    }

    /**
     * Show violation details in modal
     */
    showViolationDetails(violationId) {
        const violation = this.violations.find(v => v.id === violationId);
        if (!violation) return;

        this.selectedViolation = violation;
        
        const detailsHtml = `
            <p><strong>Environment:</strong> ${violation.environmentName}</p>
            <p><strong>Rule:</strong> ${violation.rule}</p>
            <p><strong>Type:</strong> ${violation.type}</p>
            <p><strong>Severity:</strong> ${violation.severity}</p>
            <p><strong>Expected:</strong> <code>${JSON.stringify(violation.expected)}</code></p>
            <p><strong>Actual:</strong> <code>${JSON.stringify(violation.actual)}</code></p>
            <p><strong>Detected:</strong> ${violation.timestamp.toLocaleString()}</p>
        `;
        
        document.getElementById('violationTitle').textContent = `Violation: ${violation.rule}`;
        document.getElementById('violationDetails').innerHTML = detailsHtml;
        document.getElementById('violationModal').classList.add('show');
    }

    /**
     * Close modal
     */
    closeModal() {
        document.getElementById('violationModal').classList.remove('show');
        this.selectedViolation = null;
    }

    /**
     * Auto-remediate violation
     */
    remediateViolation() {
        if (!this.selectedViolation) return;

        const violation = this.selectedViolation;
        const env = this.environments.find(e => e.id === violation.environmentId);
        
        if (env) {
            env.config[violation.rule] = violation.expected;
            this.logAuditEvent('remediation', `Auto-remediated ${violation.rule} in ${env.name}`);
            this.validateAll();
            this.closeModal();
        }
    }

    /**
     * Remediate entire environment
     */
    remediateEnvironment(envId) {
        const env = this.environments.find(e => e.id === envId);
        if (!env) return;

        const baseline = this.baselines[env.type];
        if (!baseline) return;

        let remediatedCount = 0;

        Object.entries(baseline.rules).forEach(([rule, ruleConfig]) => {
            if (env.config[rule] !== ruleConfig.value) {
                env.config[rule] = ruleConfig.value;
                remediatedCount++;
            }
        });

        this.logAuditEvent('remediation', `Auto-remediated ${remediatedCount} configurations in ${env.name}`);
        this.validateAll();
    }

    /**
     * Filter violations
     */
    filterViolations() {
        const severity = document.getElementById('severityFilter').value;
        const environment = document.getElementById('environmentFilter').value;

        let filtered = this.violations;

        if (severity) {
            filtered = filtered.filter(v => v.severity === severity);
        }

        if (environment) {
            filtered = filtered.filter(v => v.environmentName === environment);
        }

        const container = document.getElementById('violationsList');
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="placeholder">No violations match filters</div>';
            return;
        }

        container.innerHTML = filtered.map(violation => `
            <div class="violation-item ${violation.severity}" onclick="window.enforcer.showViolationDetails('${violation.id}')">
                <div class="violation-header">
                    <div class="violation-title">${violation.rule}</div>
                    <span class="severity-badge severity-${violation.severity}">${violation.severity}</span>
                </div>
                <div class="violation-details">
                    <strong>${violation.environmentName}</strong> | ${violation.type}
                </div>
            </div>
        `).join('');
    }

    /**
     * Filter audit log
     */
    filterAuditLog() {
        const filter = document.getElementById('auditFilter').value;
        const container = document.getElementById('auditList');
        
        let filtered = this.auditLog;
        if (filter) {
            filtered = this.auditLog.filter(e => e.type === filter);
        }

        if (filtered.length === 0) {
            container.innerHTML = '<div class="placeholder">No matching audit events</div>';
            return;
        }

        container.innerHTML = filtered.map(event => `
            <div class="audit-item">
                <div class="audit-icon">${this.getAuditIcon(event.type)}</div>
                <div class="audit-content">
                    <div class="audit-action">${event.action}</div>
                    <div class="audit-details">${event.details}</div>
                </div>
                <div class="audit-time">${event.timestamp.toLocaleTimeString()}</div>
            </div>
        `).join('');
    }

    /**
     * Sync baselines across environments
     */
    syncBaselines() {
        const syncCount = this.environments.length;
        this.logAuditEvent('sync', `Synced baselines across ${syncCount} environments`);
        this.validateAll();
        alert(`✓ Synced ${syncCount} environments with baseline policies`);
    }

    /**
     * Generate compliance report
     */
    generateComplianceReport() {
        const report = {
            title: 'Configuration Compliance Report',
            generatedAt: new Date().toLocaleString(),
            summary: {
                totalEnvironments: this.environments.length,
                compliant: this.environments.filter(e => e.status === 'compliant').length,
                nonCompliant: this.environments.filter(e => e.status === 'non-compliant').length,
                critical: this.environments.filter(e => e.status === 'critical').length,
                complianceScore: this.complianceScore
            },
            violations: this.violations,
            environments: this.environments,
            policies: this.policies
        };

        console.log('📊 Compliance Report:', report);
        alert('✓ Compliance report generated! Check console for details.');
        this.logAuditEvent('policy', 'Compliance report generated');
    }

    /**
     * Show environment details
     */
    showEnvironmentDetails(envId) {
        const env = this.environments.find(e => e.id === envId);
        if (!env) return;

        alert(`Environment: ${env.name}\nType: ${env.type}\nStatus: ${env.status}\nViolations: ${env.violations}\n\nConfiguration:\n${JSON.stringify(env.config, null, 2)}`);
    }

    /**
     * Add baseline (placeholder)
     */
    addBaseline() {
        alert('✓ Add Baseline feature - create new configuration baseline');
        this.logAuditEvent('policy', 'New baseline initiated');
    }

    /**
     * View baseline details
     */
    viewBaseline(name) {
        const baseline = this.baselines[name];
        if (!baseline) return;

        alert(`Baseline: ${name}\nVersion: ${baseline.version}\nRules: ${Object.keys(baseline.rules).length}\n\n${JSON.stringify(baseline.rules, null, 2)}`);
    }

    /**
     * Edit baseline
     */
    editBaseline(name) {
        alert(`✓ Edit Baseline: ${name}`);
        this.logAuditEvent('policy', `Baseline ${name} edited`);
    }

    /**
     * Duplicate baseline
     */
    duplicateBaseline(name) {
        alert(`✓ Duplicated baseline from ${name}`);
        this.logAuditEvent('policy', `Baseline ${name} duplicated`);
    }

    /**
     * Import baseline
     */
    importBaseline() {
        alert('✓ Import Baseline - load from file or URL');
        this.logAuditEvent('sync', 'Baseline import initiated');
    }

    /**
     * Export baseline
     */
    exportBaseline() {
        alert('✓ Export Baseline - download as JSON');
        this.logAuditEvent('sync', 'Baseline export completed');
    }

    /**
     * Edit policy
     */
    editPolicy(id) {
        alert(`✓ Edit Policy: ${id}`);
        this.logAuditEvent('policy', `Policy ${id} edited`);
    }

    /**
     * View policy
     */
    viewPolicy(id) {
        const policy = this.policies.find(p => p.id === id);
        if (!policy) return;

        alert(`Policy: ${policy.name}\n\nDescription: ${policy.description}\n\nRules: ${policy.rules.join(', ')}`);
    }

    /**
     * Update UI
     */
    updateUI() {
        // Update status counts
        const compliant = this.environments.filter(e => e.status === 'compliant').length;
        const nonCompliant = this.environments.filter(e => e.status === 'non-compliant').length;
        const critical = this.environments.filter(e => e.status === 'critical').length;

        document.getElementById('compliantCount').textContent = compliant;
        document.getElementById('nonCompliantCount').textContent = nonCompliant + critical;
        document.getElementById('criticalCount').textContent = critical;
        document.getElementById('complianceScore').textContent = this.complianceScore + '%';

        // Update footer
        const now = new Date();
        document.getElementById('lastValidation').textContent = now.toLocaleTimeString();
        document.getElementById('baselineVersion').textContent = '1.0.0';
        document.getElementById('envCount').textContent = this.environments.length;

        // Render all sections
        this.renderEnvironments();
        this.renderViolations();
        this.renderAuditLog();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigurationBaselineEnforcer;
}
