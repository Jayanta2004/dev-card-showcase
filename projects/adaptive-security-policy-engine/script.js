// Adaptive Security Policy Engine - JavaScript Implementation

class AdaptiveSecurityEngine {
    constructor() {
        this.threats = [];
        this.policies = [];
        this.metrics = {
            securityScore: 85,
            activeThreats: 3,
            blockedAttacks: 1247,
            falsePositives: 23,
            responseTime: 1.2,
            coverage: 99.7,
            aiConfidence: 92
        };
        this.riskLevels = {
            high: 2,
            medium: 8,
            low: 15
        };
        this.behaviorScores = {
            auth: 'normal',
            network: 'normal',
            data: 'elevated'
        };
        this.autoMode = true;
        this.sensitivityLevel = 'medium';
        this.responseMode = 'active';
        this.learningRate = 0.7;
        this.alerts = [];

        this.initializeElements();
        this.bindEvents();
        this.initializeData();
        this.startMonitoring();
        this.updateUI();
    }

    initializeElements() {
        // Status elements
        this.securityScoreEl = document.getElementById('securityScore');
        this.scoreFill = document.getElementById('scoreFill');
        this.scoreTrendEl = document.getElementById('scoreTrend');
        this.activeThreatsEl = document.getElementById('activeThreats');
        this.threatLevelEl = document.getElementById('threatLevel');
        this.activePoliciesEl = document.getElementById('activePolicies');
        this.aiConfidenceEl = document.getElementById('aiConfidence');

        // Panel elements
        this.threatFeed = document.getElementById('threatFeed');
        this.riskTimeframeSelect = document.getElementById('riskTimeframe');
        this.highRiskCountEl = document.getElementById('highRiskCount');
        this.mediumRiskCountEl = document.getElementById('mediumRiskCount');
        this.lowRiskCountEl = document.getElementById('lowRiskCount');
        this.policyList = document.getElementById('policyList');
        this.authScoreEl = document.getElementById('authScore');
        this.networkScoreEl = document.getElementById('networkScore');
        this.dataScoreEl = document.getElementById('dataScore');
        this.actionLog = document.getElementById('actionLog');
        this.responseTimeEl = document.getElementById('responseTime');
        this.blockedAttacksEl = document.getElementById('blockedAttacks');
        this.falsePositivesEl = document.getElementById('falsePositives');
        this.coverageEl = document.getElementById('coverage');

        // Control elements
        this.autoModeToggle = document.getElementById('autoMode');
        this.sensitivityLevelSelect = document.getElementById('sensitivityLevel');
        this.responseModeSelect = document.getElementById('responseMode');
        this.learningRateInput = document.getElementById('learningRate');
        this.learningRateValueEl = document.getElementById('learningRateValue');
        this.simulateThreatBtn = document.getElementById('simulateThreat');
        this.emergencyLockdownBtn = document.getElementById('emergencyLockdown');
        this.resetPoliciesBtn = document.getElementById('resetPolicies');

        // Modal elements
        this.policyModal = document.getElementById('policyModal');
        this.threatModal = document.getElementById('threatModal');
        this.createPolicyBtn = document.getElementById('createPolicy');
        this.closePolicyModal = document.getElementById('closePolicyModal');
        this.policyForm = document.getElementById('policyForm');
        this.closeThreatModal = document.getElementById('closeThreatModal');
        this.threatDetails = document.getElementById('threatDetails');

        // Other elements
        this.alertSystem = document.getElementById('alertSystem');
        this.refreshThreatsBtn = document.getElementById('refreshThreats');
        this.analyzeBehaviorBtn = document.getElementById('analyzeBehavior');
        this.exportMetricsBtn = document.getElementById('exportMetrics');
    }

    bindEvents() {
        this.autoModeToggle.addEventListener('change', (e) => {
            this.autoMode = e.target.checked;
            this.addActionLog('system', `Auto mode ${this.autoMode ? 'enabled' : 'disabled'}`);
        });

        this.sensitivityLevelSelect.addEventListener('change', (e) => {
            this.sensitivityLevel = e.target.value;
            this.addActionLog('system', `Sensitivity level changed to ${this.sensitivityLevel}`);
        });

        this.responseModeSelect.addEventListener('change', (e) => {
            this.responseMode = e.target.value;
            this.addActionLog('system', `Response mode changed to ${this.responseMode}`);
        });

        this.learningRateInput.addEventListener('input', (e) => {
            this.learningRate = parseFloat(e.target.value);
            this.learningRateValueEl.textContent = this.learningRate.toFixed(1);
        });

        this.simulateThreatBtn.addEventListener('click', () => this.simulateThreat());
        this.emergencyLockdownBtn.addEventListener('click', () => this.emergencyLockdown());
        this.resetPoliciesBtn.addEventListener('click', () => this.resetPolicies());

        this.createPolicyBtn.addEventListener('click', () => this.showPolicyModal());
        this.closePolicyModal.addEventListener('click', () => this.hidePolicyModal());
        this.policyForm.addEventListener('submit', (e) => this.createPolicy(e));

        this.closeThreatModal.addEventListener('click', () => this.hideThreatModal());
        this.refreshThreatsBtn.addEventListener('click', () => this.refreshThreats());
        this.analyzeBehaviorBtn.addEventListener('click', () => this.analyzeBehavior());
        this.exportMetricsBtn.addEventListener('click', () => this.exportMetrics());

        this.riskTimeframeSelect.addEventListener('change', () => this.updateRiskChart());
    }

    initializeData() {
        // Initialize threats
        this.threats = [
            {
                id: 'threat-001',
                title: 'SQL Injection Attempt',
                severity: 'high',
                source: '192.168.1.100',
                timestamp: new Date(Date.now() - 300000),
                status: 'blocked',
                description: 'Detected SQL injection attempt on login endpoint',
                riskScore: 85,
                category: 'Injection'
            },
            {
                id: 'threat-002',
                title: 'Brute Force Attack',
                severity: 'medium',
                source: '203.0.113.45',
                timestamp: new Date(Date.now() - 600000),
                status: 'mitigated',
                description: 'Multiple failed login attempts detected',
                riskScore: 65,
                category: 'Authentication'
            },
            {
                id: 'threat-003',
                title: 'Suspicious Data Access',
                severity: 'low',
                source: '10.0.0.50',
                timestamp: new Date(Date.now() - 900000),
                status: 'monitoring',
                description: 'Unusual data access pattern detected',
                riskScore: 35,
                category: 'Data Access'
            }
        ];

        // Initialize policies
        this.policies = [
            {
                id: 'policy-001',
                name: 'Access Control Policy',
                type: 'access',
                risk: 'medium',
                status: 'active',
                description: 'Controls user access to sensitive resources',
                lastAdjusted: new Date(Date.now() - 3600000)
            },
            {
                id: 'policy-002',
                name: 'Network Security Policy',
                type: 'network',
                risk: 'high',
                status: 'active',
                description: 'Monitors and controls network traffic',
                lastAdjusted: new Date(Date.now() - 1800000)
            },
            {
                id: 'policy-003',
                name: 'Data Protection Policy',
                type: 'data',
                risk: 'high',
                status: 'adjusting',
                description: 'Protects sensitive data from unauthorized access',
                lastAdjusted: new Date(Date.now() - 300000)
            },
            {
                id: 'policy-004',
                name: 'Behavior Analysis Policy',
                type: 'behavior',
                risk: 'medium',
                status: 'active',
                description: 'Analyzes user behavior for anomalies',
                lastAdjusted: new Date(Date.now() - 7200000)
            }
        ];

        this.renderThreats();
        this.renderPolicies();
        this.updateRiskChart();
    }

    startMonitoring() {
        // Update metrics every 3 seconds
        this.metricsInterval = setInterval(() => {
            this.updateMetrics();
            this.checkThreats();
            this.adjustPolicies();
            this.updateUI();
        }, 3000);

        // Simulate new threats every 15-30 seconds
        this.threatInterval = setInterval(() => {
            if (Math.random() > 0.7) {
                this.generateRandomThreat();
            }
        }, Math.random() * 15000 + 15000);
    }

    updateMetrics() {
        // Simulate realistic metric changes
        const baseScore = 85 + (Math.random() - 0.5) * 10;
        this.metrics.securityScore = Math.max(0, Math.min(100, Math.round(baseScore)));

        // Update threat counts
        this.metrics.activeThreats = this.threats.filter(t => t.status === 'active' || t.status === 'monitoring').length;

        // Update blocked attacks (increment occasionally)
        if (Math.random() > 0.8) {
            this.metrics.blockedAttacks += Math.floor(Math.random() * 5) + 1;
        }

        // Update response time
        this.metrics.responseTime = Math.max(0.5, 1.2 + (Math.random() - 0.5) * 0.5);

        // Update AI confidence
        this.metrics.aiConfidence = Math.max(80, Math.min(98, 92 + (Math.random() - 0.5) * 8));

        // Update risk levels
        this.updateRiskLevels();

        // Update behavior scores
        this.updateBehaviorScores();
    }

    updateRiskLevels() {
        this.riskLevels.high = Math.floor(Math.random() * 5) + 1;
        this.riskLevels.medium = Math.floor(Math.random() * 10) + 5;
        this.riskLevels.low = Math.floor(Math.random() * 15) + 10;
    }

    updateBehaviorScores() {
        const scores = ['normal', 'elevated', 'critical'];
        const weights = [0.7, 0.25, 0.05]; // Normal is most likely

        this.behaviorScores.auth = this.weightedRandom(scores, weights);
        this.behaviorScores.network = this.weightedRandom(scores, weights);
        this.behaviorScores.data = this.weightedRandom(scores, weights);
    }

    weightedRandom(items, weights) {
        const cumulativeWeights = [];
        for (let i = 0; i < weights.length; i++) {
            cumulativeWeights[i] = weights[i] + (cumulativeWeights[i - 1] || 0);
        }

        const random = Math.random() * cumulativeWeights[cumulativeWeights.length - 1];
        for (let i = 0; i < cumulativeWeights.length; i++) {
            if (cumulativeWeights[i] > random) {
                return items[i];
            }
        }
    }

    checkThreats() {
        this.threats.forEach(threat => {
            if (threat.status === 'monitoring' && Math.random() > 0.8) {
                threat.status = Math.random() > 0.5 ? 'blocked' : 'active';
                if (threat.status === 'blocked') {
                    this.addActionLog('automatic', `Blocked threat: ${threat.title}`);
                    this.metrics.blockedAttacks++;
                }
            }
        });
    }

    adjustPolicies() {
        if (!this.autoMode) return;

        this.policies.forEach(policy => {
            // Randomly adjust policies based on threat levels
            if (Math.random() > 0.9) {
                policy.status = policy.status === 'active' ? 'adjusting' : 'active';
                if (policy.status === 'adjusting') {
                    this.addActionLog('automatic', `Adjusting policy: ${policy.name}`);
                }
                policy.lastAdjusted = new Date();
            }
        });
    }

    generateRandomThreat() {
        const threatTypes = [
            { title: 'DDoS Attack', severity: 'critical', category: 'Network' },
            { title: 'Malware Detection', severity: 'high', category: 'Malware' },
            { title: 'Unauthorized Access', severity: 'high', category: 'Access' },
            { title: 'Data Exfiltration', severity: 'critical', category: 'Data' },
            { title: 'Phishing Attempt', severity: 'medium', category: 'Social' },
            { title: 'Zero-day Exploit', severity: 'critical', category: 'Vulnerability' },
            { title: 'Insider Threat', severity: 'high', category: 'Internal' },
            { title: 'Ransomware Activity', severity: 'critical', category: 'Malware' }
        ];

        const threatType = threatTypes[Math.floor(Math.random() * threatTypes.length)];
        const threat = {
            id: `threat-${Date.now()}`,
            title: threatType.title,
            severity: threatType.severity,
            source: this.generateRandomIP(),
            timestamp: new Date(),
            status: 'active',
            description: `Detected ${threatType.title.toLowerCase()} from external source`,
            riskScore: this.calculateRiskScore(threatType.severity),
            category: threatType.category
        };

        this.threats.unshift(threat);
        this.renderThreats();

        // Create alert for high/critical threats
        if (threat.severity === 'high' || threat.severity === 'critical') {
            this.createAlert(threat.severity, `New ${threat.severity} threat detected: ${threat.title}`, threat.description);
        }

        this.addActionLog('automatic', `New threat detected: ${threat.title}`);
    }

    calculateRiskScore(severity) {
        const baseScores = {
            low: 20 + Math.random() * 20,
            medium: 40 + Math.random() * 30,
            high: 70 + Math.random() * 20,
            critical: 90 + Math.random() * 10
        };
        return Math.round(baseScores[severity]);
    }

    generateRandomIP() {
        return Array.from({length: 4}, () => Math.floor(Math.random() * 256)).join('.');
    }

    renderThreats() {
        this.threatFeed.innerHTML = '';

        this.threats.slice(0, 10).forEach(threat => {
            const threatItem = document.createElement('div');
            threatItem.className = `threat-item ${threat.severity}`;
            threatItem.onclick = () => this.showThreatDetails(threat);

            threatItem.innerHTML = `
                <div class="threat-info">
                    <h4>${threat.title}</h4>
                    <div class="threat-meta">
                        <span>${threat.source}</span>
                        <span>${this.formatTime(threat.timestamp)}</span>
                        <span class="threat-severity ${threat.severity}">${threat.severity.toUpperCase()}</span>
                    </div>
                </div>
                <div class="threat-status">${threat.status}</div>
            `;

            this.threatFeed.appendChild(threatItem);
        });
    }

    renderPolicies() {
        this.policyList.innerHTML = '';

        this.policies.forEach(policy => {
            const policyItem = document.createElement('div');
            policyItem.className = 'policy-item';

            policyItem.innerHTML = `
                <div class="policy-info">
                    <h4>${policy.name}</h4>
                    <div class="policy-meta">
                        <span>Type: ${policy.type}</span>
                        <span>Risk: ${policy.risk}</span>
                        <span>Last adjusted: ${this.formatTime(policy.lastAdjusted)}</span>
                    </div>
                </div>
                <div class="policy-status ${policy.status}">${policy.status}</div>
            `;

            this.policyList.appendChild(policyItem);
        });
    }

    updateRiskChart() {
        // Simple canvas-based chart
        const canvas = document.getElementById('riskChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, height);

        // Draw risk bars
        const barWidth = width / 6;
        const maxHeight = height - 40;

        const risks = [
            { label: 'High', value: this.riskLevels.high, color: '#ef4444' },
            { label: 'Med', value: this.riskLevels.medium, color: '#f59e0b' },
            { label: 'Low', value: this.riskLevels.low, color: '#10b981' }
        ];

        risks.forEach((risk, index) => {
            const x = index * barWidth * 2 + barWidth / 2;
            const barHeight = (risk.value / 20) * maxHeight; // Assuming max 20 for scale
            const y = height - barHeight - 20;

            // Draw bar
            ctx.fillStyle = risk.color;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw label
            ctx.fillStyle = '#64748b';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(risk.label, x + barWidth / 2, height - 5);
            ctx.fillText(risk.value.toString(), x + barWidth / 2, y - 5);
        });
    }

    updateUI() {
        // Update status overview
        this.securityScoreEl.textContent = this.metrics.securityScore;
        this.scoreFill.style.width = `${this.metrics.securityScore}%`;
        this.activeThreatsEl.textContent = this.metrics.activeThreats;
        this.activePoliciesEl.textContent = this.policies.filter(p => p.status === 'active').length;
        this.aiConfidenceEl.textContent = `${this.metrics.aiConfidence}%`;

        // Update threat level
        const threatLevel = this.metrics.activeThreats > 5 ? 'Critical' :
                           this.metrics.activeThreats > 2 ? 'High' : 'Medium';
        this.threatLevelEl.textContent = threatLevel;

        // Update risk counts
        this.highRiskCountEl.textContent = this.riskLevels.high;
        this.mediumRiskCountEl.textContent = this.riskLevels.medium;
        this.lowRiskCountEl.textContent = this.riskLevels.low;

        // Update behavior scores
        this.authScoreEl.textContent = this.behaviorScores.auth.charAt(0).toUpperCase() + this.behaviorScores.auth.slice(1);
        this.authScoreEl.className = `behavior-score ${this.behaviorScores.auth}`;

        this.networkScoreEl.textContent = this.behaviorScores.network.charAt(0).toUpperCase() + this.behaviorScores.network.slice(1);
        this.networkScoreEl.className = `behavior-score ${this.behaviorScores.network}`;

        this.dataScoreEl.textContent = this.behaviorScores.data.charAt(0).toUpperCase() + this.behaviorScores.data.slice(1);
        this.dataScoreEl.className = `behavior-score ${this.behaviorScores.data}`;

        // Update metrics
        this.responseTimeEl.textContent = `${this.metrics.responseTime.toFixed(1)}s`;
        this.blockedAttacksEl.textContent = this.metrics.blockedAttacks.toLocaleString();
        this.falsePositivesEl.textContent = this.metrics.falsePositives;
        this.coverageEl.textContent = `${this.metrics.coverage}%`;

        // Update score trend (simulate)
        const trend = Math.random() > 0.5 ? 'positive' : 'negative';
        const change = Math.abs(Math.random() * 3).toFixed(1);
        this.scoreTrendEl.innerHTML = `<i class="fas fa-arrow-${trend === 'positive' ? 'up' : 'down'}"></i> ${change}`;
        this.scoreTrendEl.className = `score-trend ${trend}`;
    }

    simulateThreat() {
        this.generateRandomThreat();
        this.addActionLog('manual', 'Threat simulation initiated');
    }

    emergencyLockdown() {
        // Activate emergency protocols
        this.policies.forEach(policy => {
            policy.status = 'active';
        });

        this.autoMode = false;
        this.autoModeToggle.checked = false;

        this.createAlert('critical', 'EMERGENCY LOCKDOWN ACTIVATED', 'All policies enforced, auto-mode disabled');
        this.addActionLog('emergency', 'Emergency lockdown activated');
        this.renderPolicies();
    }

    resetPolicies() {
        this.policies.forEach(policy => {
            policy.status = 'active';
            policy.lastAdjusted = new Date();
        });

        this.addActionLog('manual', 'All policies reset to default state');
        this.renderPolicies();
    }

    showPolicyModal() {
        this.policyModal.classList.add('active');
    }

    hidePolicyModal() {
        this.policyModal.classList.remove('active');
    }

    createPolicy(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const policy = {
            id: `policy-${Date.now()}`,
            name: formData.get('policyName'),
            type: formData.get('policyType'),
            risk: formData.get('policyRisk'),
            status: 'active',
            description: formData.get('policyDescription'),
            lastAdjusted: new Date()
        };

        this.policies.push(policy);
        this.renderPolicies();
        this.hidePolicyModal();
        e.target.reset();

        this.addActionLog('manual', `New policy created: ${policy.name}`);
    }

    showThreatDetails(threat) {
        this.threatDetails.innerHTML = `
            <h4>${threat.title}</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div>
                    <h5>Threat Information</h5>
                    <p><strong>Severity:</strong> <span class="threat-severity ${threat.severity}">${threat.severity.toUpperCase()}</span></p>
                    <p><strong>Source:</strong> ${threat.source}</p>
                    <p><strong>Category:</strong> ${threat.category}</p>
                    <p><strong>Risk Score:</strong> ${threat.riskScore}</p>
                    <p><strong>Status:</strong> ${threat.status}</p>
                </div>
                <div>
                    <h5>Timeline</h5>
                    <p><strong>Detected:</strong> ${this.formatTime(threat.timestamp)}</p>
                    <p><strong>Description:</strong> ${threat.description}</p>
                </div>
            </div>
            <div style="margin-top: 20px;">
                <h5>Recommended Actions</h5>
                <ul>
                    <li>Isolate affected systems</li>
                    <li>Review access logs</li>
                    <li>Update threat intelligence</li>
                    <li>Notify security team</li>
                </ul>
            </div>
        `;

        this.threatModal.classList.add('active');
    }

    hideThreatModal() {
        this.threatModal.classList.remove('active');
    }

    refreshThreats() {
        // Simulate refreshing threat data
        setTimeout(() => {
            this.renderThreats();
            this.addActionLog('manual', 'Threat intelligence refreshed');
        }, 1000);
    }

    analyzeBehavior() {
        // Simulate behavior analysis
        this.updateBehaviorScores();
        this.addActionLog('manual', 'Behavior analysis completed');
    }

    exportMetrics() {
        const data = {
            timestamp: new Date().toISOString(),
            metrics: this.metrics,
            threats: this.threats.length,
            policies: this.policies.length,
            riskLevels: this.riskLevels
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-metrics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.addActionLog('manual', 'Security metrics exported');
    }

    createAlert(type, title, message) {
        const alert = document.createElement('div');
        alert.className = `alert ${type}`;

        alert.innerHTML = `
            <div class="alert-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="alert-content">
                <div class="alert-title">${title}</div>
                <div class="alert-message">${message}</div>
            </div>
            <button class="alert-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add close functionality
        alert.querySelector('.alert-close').onclick = () => {
            alert.remove();
        };

        this.alertSystem.appendChild(alert);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 10000);
    }

    addActionLog(type, message) {
        const actionItem = document.createElement('div');
        actionItem.className = `action-item ${type}`;

        const icon = {
            system: 'fas fa-cog',
            manual: 'fas fa-user',
            automatic: 'fas fa-robot',
            emergency: 'fas fa-exclamation-triangle'
        }[type] || 'fas fa-info-circle';

        actionItem.innerHTML = `
            <i class="${icon}"></i>
            <div>
                <div class="action-timestamp">${this.formatTime(new Date())}</div>
                <div>${message}</div>
            </div>
        `;

        this.actionLog.insertBefore(actionItem, this.actionLog.firstChild);

        // Keep only last 20 actions
        while (this.actionLog.children.length > 20) {
            this.actionLog.removeChild(this.actionLog.lastChild);
        }
    }

    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
}

// Initialize the security engine when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.securityEngine = new AdaptiveSecurityEngine();
});