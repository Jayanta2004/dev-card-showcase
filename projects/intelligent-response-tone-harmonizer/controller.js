/**
 * Intelligent Response Tone Harmonizer
 * Controller for tone analysis, harmonization, and agent management
 */

class ToneHarmonizer {
    constructor() {
        this.agents = new Map();
        this.responses = [];
        this.harmonizationHistory = [];
        this.auditTrail = [];
        this.toneProfiles = new Map();
        this.isRunning = false;
        this.currentTab = 'dashboard';

        this.initialize();
        this.setupEventListeners();
        this.startSimulation();
    }

    initialize() {
        this.loadConfiguration();
        this.initializeAgents();
        this.initializeToneProfiles();
        this.updateDashboard();
        this.updateTimeDisplay();
    }

    loadConfiguration() {
        // Load configuration from config.json
        // This would normally be loaded via fetch, but for demo we'll use defaults
        this.config = {
            analysis: {
                enabled: true,
                realTime: true,
                sensitivity: 0.8
            },
            harmonization: {
                autoApply: false,
                targetTone: 'professional',
                preserveIntent: true
            },
            monitoring: {
                enabled: true,
                interval: 5000,
                alerts: true
            }
        };
    }

    initializeAgents() {
        // Initialize with sample agents
        const sampleAgents = [
            {
                id: 'agent_001',
                name: 'Customer Support Bot',
                type: 'chatbot',
                baseTone: 'friendly',
                status: 'active',
                responseCount: 1247,
                consistencyScore: 89.5,
                lastActivity: new Date(Date.now() - 300000)
            },
            {
                id: 'agent_002',
                name: 'Sales Assistant',
                type: 'assistant',
                baseTone: 'enthusiastic',
                status: 'active',
                responseCount: 892,
                consistencyScore: 94.2,
                lastActivity: new Date(Date.now() - 120000)
            },
            {
                id: 'agent_003',
                name: 'Technical Support',
                type: 'chatbot',
                baseTone: 'professional',
                status: 'active',
                responseCount: 654,
                consistencyScore: 96.8,
                lastActivity: new Date(Date.now() - 60000)
            },
            {
                id: 'agent_004',
                name: 'Content Moderator',
                type: 'moderator',
                baseTone: 'formal',
                status: 'idle',
                responseCount: 423,
                consistencyScore: 91.3,
                lastActivity: new Date(Date.now() - 1800000)
            }
        ];

        sampleAgents.forEach(agent => {
            this.agents.set(agent.id, agent);
        });
    }

    initializeToneProfiles() {
        // Initialize tone profiles for analysis
        this.toneProfiles.set('professional', {
            formality: 0.9,
            emotionality: 0.2,
            engagement: 0.7,
            keywords: ['certainly', 'assist', 'please', 'thank you', 'regards']
        });

        this.toneProfiles.set('friendly', {
            formality: 0.4,
            emotionality: 0.8,
            engagement: 0.9,
            keywords: ['hey', 'great', 'awesome', 'happy to help', 'cheers']
        });

        this.toneProfiles.set('formal', {
            formality: 1.0,
            emotionality: 0.1,
            engagement: 0.5,
            keywords: ['dear', 'sir', 'madam', 'respectfully', 'sincerely']
        });

        this.toneProfiles.set('casual', {
            formality: 0.2,
            emotionality: 0.6,
            engagement: 0.8,
            keywords: ['hey', 'cool', 'sure', 'no problem', 'later']
        });

        this.toneProfiles.set('enthusiastic', {
            formality: 0.5,
            emotionality: 0.9,
            engagement: 1.0,
            keywords: ['amazing', 'fantastic', 'excited', 'wonderful', 'brilliant']
        });
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.closest('.tab-button').dataset.tab);
            });
        });

        // Dashboard controls
        document.getElementById('analyzeBtn')?.addEventListener('click', () => this.runToneAnalysis());
        document.getElementById('exportAnalysisBtn')?.addEventListener('click', () => this.exportAnalysis());

        // Harmonization controls
        document.getElementById('harmonizeBtn')?.addEventListener('click', () => this.runHarmonization());
        document.getElementById('addResponseBtn')?.addEventListener('click', () => this.addResponseInput());
        document.getElementById('applyHarmonizationBtn')?.addEventListener('click', () => this.applyHarmonization());
        document.getElementById('revertBtn')?.addEventListener('click', () => this.revertHarmonization());

        // Agent management controls
        document.getElementById('addAgentBtn')?.addEventListener('click', () => this.showAddAgentModal());
        document.getElementById('syncAgentsBtn')?.addEventListener('click', () => this.syncAgents());
        document.getElementById('saveAgentBtn')?.addEventListener('click', (e) => this.saveAgent(e));
        document.getElementById('cancelAgentBtn')?.addEventListener('click', () => this.hideAddAgentModal());

        // Audit controls
        document.getElementById('exportAuditBtn')?.addEventListener('click', () => this.exportAuditTrail());
        document.getElementById('auditFilter')?.addEventListener('change', () => this.filterAuditTrail());
        document.getElementById('auditDateFilter')?.addEventListener('change', () => this.filterAuditTrail());

        // Modal controls
        document.getElementById('closeAgentModal')?.addEventListener('click', () => this.hideAddAgentModal());
        document.getElementById('closeHarmonizationModal')?.addEventListener('click', () => this.hideHarmonizationModal());
        document.getElementById('closeResultsBtn')?.addEventListener('click', () => this.hideHarmonizationModal());
        document.getElementById('applyResultsBtn')?.addEventListener('click', () => this.applyHarmonizationResults());

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideAllModals();
            }
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;

        // Update content based on tab
        switch (tabName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'tone-analysis':
                this.updateToneAnalysis();
                break;
            case 'harmonization':
                this.updateHarmonization();
                break;
            case 'agents':
                this.updateAgentManagement();
                break;
            case 'audit':
                this.updateAuditTrail();
                break;
        }
    }

    updateDashboard() {
        // Update metrics
        const totalResponses = this.calculateTotalResponses();
        const toneConsistency = this.calculateToneConsistency();
        const activeAgents = this.getActiveAgentCount();
        const harmonizationEvents = this.harmonizationHistory.length;

        document.getElementById('totalResponses').textContent = totalResponses.toLocaleString();
        document.getElementById('toneConsistency').textContent = `${toneConsistency.toFixed(1)}%`;
        document.getElementById('activeAgents').textContent = activeAgents;
        document.getElementById('harmonizationEvents').textContent = harmonizationEvents.toLocaleString();

        // Update agent status grid
        this.updateAgentStatusGrid();

        // Update charts
        this.updateToneDistributionChart();
        this.updateAgentPatternsChart();

        // Update activity feed
        this.updateActivityFeed();
    }

    calculateTotalResponses() {
        return Array.from(this.agents.values()).reduce((sum, agent) => sum + agent.responseCount, 0);
    }

    calculateToneConsistency() {
        const agents = Array.from(this.agents.values());
        if (agents.length === 0) return 0;

        const averageConsistency = agents.reduce((sum, agent) => sum + agent.consistencyScore, 0) / agents.length;
        return averageConsistency;
    }

    getActiveAgentCount() {
        return Array.from(this.agents.values()).filter(agent => agent.status === 'active').length;
    }

    updateAgentStatusGrid() {
        const grid = document.getElementById('agentStatusGrid');
        if (!grid) return;

        grid.innerHTML = '';

        Array.from(this.agents.values()).slice(0, 12).forEach(agent => {
            const statusDot = document.createElement('div');
            statusDot.className = `agent-status-dot ${agent.status}`;
            statusDot.title = `${agent.name}: ${agent.status}`;
            grid.appendChild(statusDot);
        });
    }

    updateToneDistributionChart() {
        const canvas = document.getElementById('toneDistributionChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.generateToneDistributionData();

        // Simple bar chart implementation
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = canvas.width / data.length - 10;
        const maxValue = Math.max(...data.map(d => d.value));

        data.forEach((item, index) => {
            const x = index * (barWidth + 10) + 5;
            const height = (item.value / maxValue) * (canvas.height - 40);
            const y = canvas.height - height - 20;

            // Bar
            ctx.fillStyle = item.color;
            ctx.fillRect(x, y, barWidth, height);

            // Label
            ctx.fillStyle = '#f1f5f9';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, x + barWidth / 2, canvas.height - 5);
        });
    }

    generateToneDistributionData() {
        return [
            { label: 'Professional', value: 35, color: '#2563eb' },
            { label: 'Friendly', value: 28, color: '#3b82f6' },
            { label: 'Formal', value: 15, color: '#60a5fa' },
            { label: 'Casual', value: 12, color: '#93c5fd' },
            { label: 'Enthusiastic', value: 10, color: '#bfdbfe' }
        ];
    }

    updateAgentPatternsChart() {
        const canvas = document.getElementById('agentPatternsChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.generateAgentPatternsData();

        // Simple line chart implementation
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const maxValue = Math.max(...data.flatMap(d => d.values));
        const pointSpacing = canvas.width / (data[0].values.length - 1);

        data.forEach((series, seriesIndex) => {
            ctx.strokeStyle = series.color;
            ctx.lineWidth = 2;
            ctx.beginPath();

            series.values.forEach((value, index) => {
                const x = index * pointSpacing;
                const y = canvas.height - (value / maxValue) * (canvas.height - 40) - 20;

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();
        });
    }

    generateAgentPatternsData() {
        return [
            {
                name: 'Consistency Score',
                color: '#10b981',
                values: [85, 87, 89, 88, 91, 93, 94, 95, 94, 96]
            },
            {
                name: 'Response Volume',
                color: '#f59e0b',
                values: [120, 135, 142, 138, 156, 168, 172, 178, 175, 182]
            }
        ];
    }

    updateActivityFeed() {
        const feed = document.getElementById('activityFeed');
        if (!feed) return;

        feed.innerHTML = '';

        // Generate recent activities
        const activities = this.generateRecentActivities();

        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-message">${activity.message}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            `;
            feed.appendChild(activityItem);
        });
    }

    generateRecentActivities() {
        return [
            {
                icon: '🎭',
                message: 'Tone harmonization completed for Customer Support Bot',
                time: '2 minutes ago'
            },
            {
                icon: '🤖',
                message: 'New agent "Product Advisor" registered',
                time: '5 minutes ago'
            },
            {
                icon: '📊',
                message: 'Tone analysis detected inconsistency in 3 responses',
                time: '8 minutes ago'
            },
            {
                icon: '🔄',
                message: 'Agent synchronization completed',
                time: '12 minutes ago'
            },
            {
                icon: '⚠️',
                message: 'Tone drift detected in Sales Assistant',
                time: '15 minutes ago'
            }
        ];
    }

    updateToneAnalysis() {
        // Update tone metrics
        this.updateToneMetrics();

        // Update radar chart
        this.updateToneRadarChart();

        // Update inconsistency alerts
        this.updateInconsistencyAlerts();

        // Update response comparison
        this.updateResponseComparison();
    }

    updateToneMetrics() {
        const metrics = this.calculateToneMetrics();

        // Update metric bars
        Object.entries(metrics).forEach(([key, value]) => {
            const bar = document.querySelector(`[data-metric="${key}"] .bar-fill`);
            const valueSpan = document.querySelector(`[data-metric="${key}"] .bar-value`);

            if (bar) bar.style.width = `${value}%`;
            if (valueSpan) valueSpan.textContent = `${value}%`;
        });
    }

    calculateToneMetrics() {
        // Simulate tone metrics calculation
        return {
            formality: Math.floor(Math.random() * 30) + 70,
            emotionality: Math.floor(Math.random() * 40) + 30,
            professionalism: Math.floor(Math.random() * 20) + 80,
            engagement: Math.floor(Math.random() * 30) + 60
        };
    }

    updateToneRadarChart() {
        const canvas = document.getElementById('toneRadarChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const metrics = this.calculateToneMetrics();

        // Simple radar chart implementation
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 40;

        // Draw background circles
        for (let i = 1; i <= 5; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI);
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw axes
        const axes = ['Formality', 'Emotionality', 'Professionalism', 'Engagement'];
        axes.forEach((axis, index) => {
            const angle = (index * Math.PI * 2) / axes.length - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Label
            const labelX = centerX + Math.cos(angle) * (radius + 20);
            const labelY = centerY + Math.sin(angle) * (radius + 20);
            ctx.fillStyle = '#cbd5e1';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(axis, labelX, labelY);
        });

        // Draw data polygon
        const values = [metrics.formality / 100, metrics.emotionality / 100, metrics.professionalism / 100, metrics.engagement / 100];
        ctx.beginPath();
        values.forEach((value, index) => {
            const angle = (index * Math.PI * 2) / values.length - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius * value;
            const y = centerY + Math.sin(angle) * radius * value;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();
        ctx.fillStyle = 'rgba(37, 99, 235, 0.3)';
        ctx.fill();
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    updateInconsistencyAlerts() {
        const alerts = document.getElementById('inconsistencyAlerts');
        if (!alerts) return;

        alerts.innerHTML = '';

        const sampleAlerts = [
            {
                type: 'warning',
                message: 'Customer Support Bot: Tone shifted from friendly to formal in 12 responses',
                severity: 'medium'
            },
            {
                type: 'error',
                message: 'Sales Assistant: Inconsistent enthusiasm levels detected',
                severity: 'high'
            },
            {
                type: 'info',
                message: 'Technical Support: Professional tone maintained consistently',
                severity: 'low'
            }
        ];

        sampleAlerts.forEach(alert => {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${alert.severity}`;
            alertDiv.innerHTML = `
                <div class="alert-icon">${this.getAlertIcon(alert.type)}</div>
                <div class="alert-content">
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-time">Detected 5 minutes ago</div>
                </div>
            `;
            alerts.appendChild(alertDiv);
        });
    }

    getAlertIcon(type) {
        const icons = {
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    updateResponseComparison() {
        const comparison = document.getElementById('responseComparison');
        if (!comparison) return;

        comparison.innerHTML = '';

        const sampleComparisons = [
            {
                original: "Hey there! I'd be happy to help you with that issue. What seems to be the problem?",
                harmonized: "Hello! I'm pleased to assist you with this matter. Could you please describe the issue you're experiencing?",
                tone: "Professional",
                confidence: 92
            },
            {
                original: "That's awesome! We can definitely get that sorted for you right away.",
                harmonized: "That's excellent! We'll certainly resolve this matter immediately for you.",
                tone: "Formal",
                confidence: 88
            }
        ];

        sampleComparisons.forEach(comp => {
            const compDiv = document.createElement('div');
            compDiv.className = 'response-comparison-item';
            compDiv.innerHTML = `
                <div class="comparison-pair">
                    <div class="original-response">
                        <h4>Original</h4>
                        <p>${comp.original}</p>
                    </div>
                    <div class="harmonized-response">
                        <h4>Harmonized (${comp.tone})</h4>
                        <p>${comp.harmonized}</p>
                        <div class="confidence-score">Confidence: ${comp.confidence}%</div>
                    </div>
                </div>
            `;
            comparison.appendChild(compDiv);
        });
    }

    updateHarmonization() {
        // Update harmonization stats
        this.updateHarmonizationStats();

        // Initialize with sample responses if empty
        if (this.responses.length === 0) {
            this.initializeSampleResponses();
        }

        this.updateResponseInputs();
    }

    updateHarmonizationStats() {
        document.getElementById('processedCount').textContent = this.harmonizationHistory.length;
        document.getElementById('adjustmentsCount').textContent = this.calculateTotalAdjustments();
        document.getElementById('consistencyScore').textContent = `${this.calculateHarmonizationConsistency()}%`;
        document.getElementById('processingTime').textContent = `${Math.floor(Math.random() * 500) + 100}ms`;
    }

    calculateTotalAdjustments() {
        return this.harmonizationHistory.reduce((sum, item) => sum + (item.adjustments || 0), 0);
    }

    calculateHarmonizationConsistency() {
        return Math.floor(Math.random() * 20) + 80;
    }

    initializeSampleResponses() {
        this.responses = [
            {
                id: 'resp_001',
                agent: 'Customer Support Bot',
                original: "Hey! Thanks for reaching out. I'm super excited to help you with this!",
                harmonized: null,
                tone: 'enthusiastic',
                targetTone: 'professional'
            },
            {
                id: 'resp_002',
                agent: 'Sales Assistant',
                original: "This is absolutely fantastic! We can get you set up immediately.",
                harmonized: null,
                tone: 'enthusiastic',
                targetTone: 'professional'
            }
        ];
    }

    updateResponseInputs() {
        const inputs = document.getElementById('responseInputs');
        if (!inputs) return;

        inputs.innerHTML = '';

        this.responses.forEach(response => {
            const responseDiv = document.createElement('div');
            responseDiv.className = 'response-input-item';
            responseDiv.innerHTML = `
                <div class="response-header">
                    <span class="agent-name">${response.agent}</span>
                    <button class="remove-response" onclick="toneHarmonizer.removeResponse('${response.id}')">×</button>
                </div>
                <div class="response-content">
                    <div class="original-text">
                        <label>Original:</label>
                        <textarea readonly>${response.original}</textarea>
                    </div>
                    <div class="harmonized-text">
                        <label>Harmonized:</label>
                        <textarea readonly>${response.harmonized || 'Not harmonized yet'}</textarea>
                    </div>
                </div>
            `;
            inputs.appendChild(responseDiv);
        });
    }

    addResponseInput() {
        const newResponse = {
            id: `resp_${Date.now()}`,
            agent: 'New Agent',
            original: '',
            harmonized: null,
            tone: 'neutral',
            targetTone: document.getElementById('targetToneSelect').value
        };

        this.responses.push(newResponse);
        this.updateResponseInputs();
    }

    removeResponse(id) {
        this.responses = this.responses.filter(r => r.id !== id);
        this.updateResponseInputs();
    }

    runHarmonization() {
        const targetTone = document.getElementById('targetToneSelect').value;

        this.responses.forEach(response => {
            response.targetTone = targetTone;
            response.harmonized = this.harmonizeResponse(response.original, targetTone);
        });

        this.updateResponseInputs();
        this.updateHarmonizationStats();

        // Add to history
        this.harmonizationHistory.push({
            timestamp: new Date(),
            responsesProcessed: this.responses.length,
            targetTone: targetTone,
            adjustments: this.responses.filter(r => r.harmonized).length
        });

        this.showNotification('Harmonization completed successfully', 'success');
        this.logAuditEvent('harmonization', `Harmonized ${this.responses.length} responses to ${targetTone} tone`);
    }

    harmonizeResponse(text, targetTone) {
        // Simple harmonization logic (in a real implementation, this would use ML models)
        const toneMappings = {
            professional: {
                'Hey': 'Hello',
                'super excited': 'pleased',
                'awesome': 'excellent',
                'cool': 'satisfactory',
                'sure': 'certainly',
                '!': '.'
            },
            formal: {
                'Hey': 'Dear Sir or Madam',
                'thanks': 'thank you',
                'super': 'very',
                'awesome': 'excellent',
                'cool': 'acceptable'
            },
            friendly: {
                'Hello': 'Hey',
                'pleased': 'happy',
                'excellent': 'awesome',
                'certainly': 'sure',
                'thank you': 'thanks'
            }
        };

        let harmonized = text;
        const mappings = toneMappings[targetTone] || {};

        Object.entries(mappings).forEach(([from, to]) => {
            harmonized = harmonized.replace(new RegExp(from, 'gi'), to);
        });

        return harmonized;
    }

    applyHarmonization() {
        // In a real implementation, this would apply changes to the actual system
        this.showNotification('Harmonization applied to all agents', 'success');
        this.logAuditEvent('harmonization', 'Applied harmonization changes to production');
    }

    revertHarmonization() {
        this.responses.forEach(response => {
            response.harmonized = null;
        });

        this.updateResponseInputs();
        this.updateHarmonizationStats();
        this.showNotification('Harmonization reverted', 'info');
        this.logAuditEvent('harmonization', 'Reverted harmonization changes');
    }

    updateAgentManagement() {
        this.updateAgentCards();
        this.updateAgentPerformanceChart();
    }

    updateAgentCards() {
        const cards = document.getElementById('agentCards');
        if (!cards) return;

        cards.innerHTML = '';

        this.agents.forEach(agent => {
            const card = document.createElement('div');
            card.className = 'agent-card';
            card.onclick = () => this.selectAgent(agent.id);

            card.innerHTML = `
                <div class="agent-header">
                    <div class="agent-avatar">${agent.name.charAt(0)}</div>
                    <div class="agent-info">
                        <h4>${agent.name}</h4>
                        <span class="agent-type">${agent.type}</span>
                    </div>
                    <div class="agent-status ${agent.status}"></div>
                </div>
                <div class="agent-metrics">
                    <div class="metric">
                        <span class="metric-label">Responses</span>
                        <span class="metric-value">${agent.responseCount.toLocaleString()}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Consistency</span>
                        <span class="metric-value">${agent.consistencyScore}%</span>
                    </div>
                </div>
            `;

            cards.appendChild(card);
        });
    }

    selectAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) return;

        const panel = document.getElementById('agentInfoPanel');
        if (!panel) return;

        panel.innerHTML = `
            <div class="agent-details">
                <div class="agent-header-large">
                    <div class="agent-avatar-large">${agent.name.charAt(0)}</div>
                    <div class="agent-info-large">
                        <h3>${agent.name}</h3>
                        <p class="agent-description">${agent.type} agent with ${agent.baseTone} tone</p>
                        <div class="agent-status-large ${agent.status}">
                            <span class="status-dot"></span>
                            ${agent.status}
                        </div>
                    </div>
                </div>
                <div class="agent-stats">
                    <div class="stat-row">
                        <div class="stat-item">
                            <label>Total Responses</label>
                            <span>${agent.responseCount.toLocaleString()}</span>
                        </div>
                        <div class="stat-item">
                            <label>Consistency Score</label>
                            <span>${agent.consistencyScore}%</span>
                        </div>
                    </div>
                    <div class="stat-row">
                        <div class="stat-item">
                            <label>Last Activity</label>
                            <span>${this.formatTimeAgo(agent.lastActivity)}</span>
                        </div>
                        <div class="stat-item">
                            <label>Base Tone</label>
                            <span>${agent.baseTone}</span>
                        </div>
                    </div>
                </div>
                <div class="agent-actions">
                    <button class="btn-secondary" onclick="toneHarmonizer.editAgent('${agent.id}')">Edit</button>
                    <button class="btn-warning" onclick="toneHarmonizer.deactivateAgent('${agent.id}')">Deactivate</button>
                    <button class="btn-danger" onclick="toneHarmonizer.removeAgent('${agent.id}')">Remove</button>
                </div>
            </div>
        `;
    }

    updateAgentPerformanceChart() {
        const canvas = document.getElementById('agentPerformanceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.generateAgentPerformanceData();

        // Simple bar chart for agent performance
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width - 100) / data.length;
        const maxValue = 100;

        data.forEach((agent, index) => {
            const x = index * barWidth + 50;
            const height = (agent.consistency / maxValue) * (canvas.height - 60);
            const y = canvas.height - height - 30;

            // Bar
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(x, y, barWidth - 10, height);

            // Label
            ctx.fillStyle = '#f1f5f9';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(agent.name.split(' ')[0], x + (barWidth - 10) / 2, canvas.height - 10);

            // Value
            ctx.fillText(`${agent.consistency}%`, x + (barWidth - 10) / 2, y - 5);
        });
    }

    generateAgentPerformanceData() {
        return Array.from(this.agents.values()).map(agent => ({
            name: agent.name,
            consistency: agent.consistencyScore
        }));
    }

    updateAuditTrail() {
        this.updateAuditTimeline();
        this.updateAuditSummary();
    }

    updateAuditTimeline() {
        const timeline = document.getElementById('auditTimeline');
        if (!timeline) return;

        timeline.innerHTML = '';

        const events = this.getFilteredAuditEvents();

        events.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.className = 'audit-event';
            eventDiv.innerHTML = `
                <div class="event-icon">${this.getEventIcon(event.type)}</div>
                <div class="event-content">
                    <div class="event-message">${event.message}</div>
                    <div class="event-details">
                        <span class="event-time">${this.formatTimeAgo(event.timestamp)}</span>
                        <span class="event-type">${event.type}</span>
                    </div>
                </div>
            `;
            timeline.appendChild(eventDiv);
        });
    }

    getFilteredAuditEvents() {
        const filter = document.getElementById('auditFilter')?.value || 'all';
        const dateFilter = document.getElementById('auditDateFilter')?.value;

        let events = [...this.auditTrail];

        if (filter !== 'all') {
            events = events.filter(event => event.type === filter);
        }

        if (dateFilter) {
            const filterDate = new Date(dateFilter);
            events = events.filter(event => event.timestamp.toDateString() === filterDate.toDateString());
        }

        return events.slice(-50); // Show last 50 events
    }

    getEventIcon(type) {
        const icons = {
            harmonization: '🎵',
            analysis: '🔍',
            agent: '🤖',
            error: '❌',
            system: '⚙️'
        };
        return icons[type] || '📋';
    }

    updateAuditSummary() {
        const events = this.auditTrail;
        const totalEvents = events.length;
        const harmonizationEvents = events.filter(e => e.type === 'harmonization').length;
        const errorEvents = events.filter(e => e.type === 'error').length;
        const lastActivity = events.length > 0 ? events[events.length - 1].timestamp : null;

        document.getElementById('totalEvents').textContent = totalEvents;
        document.getElementById('harmonizationEventsCount').textContent = harmonizationEvents;
        document.getElementById('errorEventsCount').textContent = errorEvents;
        document.getElementById('lastActivity').textContent = lastActivity ? this.formatTimeAgo(lastActivity) : 'Never';
    }

    // Modal management
    showAddAgentModal() {
        document.getElementById('addAgentModal').style.display = 'block';
    }

    hideAddAgentModal() {
        document.getElementById('addAgentModal').style.display = 'none';
        document.getElementById('addAgentForm').reset();
    }

    showHarmonizationModal(results) {
        const modal = document.getElementById('harmonizationModal');
        const resultsDiv = document.getElementById('harmonizationResults');

        resultsDiv.innerHTML = results.map(result => `
            <div class="harmonization-result">
                <h4>${result.agent}</h4>
                <div class="result-comparison">
                    <div class="original">
                        <strong>Original:</strong> ${result.original}
                    </div>
                    <div class="harmonized">
                        <strong>Harmonized:</strong> ${result.harmonized}
                    </div>
                </div>
            </div>
        `).join('');

        modal.style.display = 'block';
    }

    hideHarmonizationModal() {
        document.getElementById('harmonizationModal').style.display = 'none';
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // Agent operations
    saveAgent(e) {
        e.preventDefault();

        const formData = new FormData(document.getElementById('addAgentForm'));
        const agent = {
            id: `agent_${Date.now()}`,
            name: formData.get('agentName'),
            type: formData.get('agentType'),
            baseTone: formData.get('baseTone'),
            description: formData.get('description'),
            status: 'active',
            responseCount: 0,
            consistencyScore: 95.0,
            lastActivity: new Date()
        };

        this.agents.set(agent.id, agent);
        this.updateAgentManagement();
        this.hideAddAgentModal();

        this.showNotification(`Agent "${agent.name}" added successfully`, 'success');
        this.logAuditEvent('agent', `Added new agent: ${agent.name}`);
    }

    // Utility functions
    formatTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days} days ago`;
        if (hours > 0) return `${hours} hours ago`;
        if (minutes > 0) return `${minutes} minutes ago`;
        return 'Just now';
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">${this.getNotificationIcon(type)}</div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
        `;

        container.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    logAuditEvent(type, message) {
        this.auditTrail.push({
            id: `audit_${Date.now()}`,
            type: type,
            message: message,
            timestamp: new Date(),
            user: 'System'
        });

        // Keep only last 1000 events
        if (this.auditTrail.length > 1000) {
            this.auditTrail = this.auditTrail.slice(-1000);
        }
    }

    updateTimeDisplay() {
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString();
        }
    }

    startSimulation() {
        // Update time every second
        setInterval(() => this.updateTimeDisplay(), 1000);

        // Simulate real-time updates
        setInterval(() => {
            if (this.currentTab === 'dashboard') {
                this.updateDashboard();
            }
        }, 5000);

        // Simulate agent activity
        setInterval(() => {
            this.simulateAgentActivity();
        }, 10000);

        // Generate sample audit events
        this.generateSampleAuditEvents();
    }

    simulateAgentActivity() {
        // Randomly update agent activity
        const agents = Array.from(this.agents.values());
        const randomAgent = agents[Math.floor(Math.random() * agents.length)];

        if (randomAgent) {
            randomAgent.lastActivity = new Date();
            randomAgent.responseCount += Math.floor(Math.random() * 5) + 1;
            randomAgent.consistencyScore = Math.max(80, Math.min(100, randomAgent.consistencyScore + (Math.random() - 0.5) * 2));
        }
    }

    generateSampleAuditEvents() {
        const sampleEvents = [
            { type: 'harmonization', message: 'Tone harmonization completed for Customer Support Bot' },
            { type: 'analysis', message: 'Tone analysis detected inconsistency in Sales Assistant responses' },
            { type: 'agent', message: 'New agent Technical Support registered' },
            { type: 'system', message: 'System health check completed successfully' },
            { type: 'harmonization', message: 'Applied professional tone harmonization to 15 responses' },
            { type: 'error', message: 'Failed to harmonize response due to API timeout' },
            { type: 'analysis', message: 'Completed tone analysis for all active agents' }
        ];

        sampleEvents.forEach((event, index) => {
            setTimeout(() => {
                this.logAuditEvent(event.type, event.message);
            }, index * 2000);
        });
    }

    // Export functions
    exportAnalysis() {
        const data = {
            timestamp: new Date(),
            metrics: this.calculateToneMetrics(),
            alerts: this.generateInconsistencyAlerts(),
            recommendations: this.generateRecommendations()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tone-analysis-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Analysis report exported successfully', 'success');
    }

    exportAuditTrail() {
        const events = this.getFilteredAuditEvents();
        const csv = [
            ['Timestamp', 'Type', 'Message', 'User'],
            ...events.map(event => [
                event.timestamp.toISOString(),
                event.type,
                event.message,
                event.user
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Audit trail exported successfully', 'success');
    }

    generateInconsistencyAlerts() {
        return [
            {
                severity: 'high',
                message: 'Significant tone variation detected in Customer Support Bot',
                affectedResponses: 23
            },
            {
                severity: 'medium',
                message: 'Minor inconsistency in Sales Assistant enthusiasm levels',
                affectedResponses: 8
            }
        ];
    }

    generateRecommendations() {
        return [
            'Implement automated tone harmonization for Customer Support Bot',
            'Review and standardize greeting patterns across all agents',
            'Consider training data refresh for improved tone consistency',
            'Monitor Sales Assistant responses for enthusiasm calibration'
        ];
    }

    runToneAnalysis() {
        // Simulate analysis running
        this.showNotification('Tone analysis in progress...', 'info');

        setTimeout(() => {
            this.updateToneAnalysis();
            this.showNotification('Tone analysis completed successfully', 'success');
            this.logAuditEvent('analysis', 'Completed comprehensive tone analysis');
        }, 2000);
    }

    syncAgents() {
        this.showNotification('Synchronizing agents...', 'info');

        setTimeout(() => {
            // Simulate sync
            this.agents.forEach(agent => {
                agent.lastActivity = new Date();
            });

            this.updateAgentManagement();
            this.showNotification('Agent synchronization completed', 'success');
            this.logAuditEvent('system', 'Completed agent synchronization');
        }, 3000);
    }
}

// Initialize the application
const toneHarmonizer = new ToneHarmonizer();

// Make functions globally available for onclick handlers
window.toneHarmonizer = toneHarmonizer;