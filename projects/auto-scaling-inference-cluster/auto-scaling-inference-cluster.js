// Auto-Scaling Inference Cluster - JavaScript Implementation
// Author: AI Assistant
// Date: 2026
// Description: Comprehensive ML inference cluster management system

// Global variables and state management
let clusterNodes = [];
let scalingPolicies = [];
let scalingEvents = [];
let modelRegistry = [];
let monitoringData = [];
let securityAlerts = [];
let activityLog = [];
let settings = {};
let charts = {};
let currentUser = null;
let isOnline = true;
let autoScalingEnabled = true;
let clusterMetrics = {
    totalRequests: 0,
    activeRequests: 0,
    avgLatency: 0,
    errorRate: 0,
    cpuUsage: 0,
    memoryUsage: 0
};

// Default settings
const defaultSettings = {
    clusterName: 'Production Inference Cluster',
    region: 'us-east-1',
    instanceType: 'c5.large',
    minNodes: 4,
    maxNodes: 64,
    scaleUpThreshold: 80,
    scaleDownThreshold: 30,
    cooldownPeriod: 5,
    enableMonitoring: true,
    enableAlerts: true,
    alertEmail: 'admin@company.com',
    logRetention: 30,
    enableEncryption: true,
    enableAudit: true,
    sessionTimeout: 60,
    maxConcurrentRequests: 1000
};

// Node Classes
class ClusterNode {
    constructor(config) {
        this.id = this.generateId();
        this.name = config.name;
        this.instanceType = config.instanceType;
        this.availabilityZone = config.availabilityZone;
        this.status = 'provisioning';
        this.cpuUsage = 0;
        this.memoryUsage = 0;
        this.networkIn = 0;
        this.networkOut = 0;
        this.requestCount = 0;
        this.errorCount = 0;
        this.uptime = 0;
        this.models = [];
        this.createdAt = new Date();
        this.lastHealthCheck = new Date();
        this.autoScaling = config.autoScaling || true;
    }

    generateId() {
        return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    updateMetrics() {
        // Simulate realistic metrics
        this.cpuUsage = Math.max(0, Math.min(100, this.cpuUsage + (Math.random() - 0.5) * 20));
        this.memoryUsage = Math.max(0, Math.min(100, this.memoryUsage + (Math.random() - 0.5) * 15));
        this.networkIn = Math.max(0, this.networkIn + Math.random() * 100);
        this.networkOut = Math.max(0, this.networkOut + Math.random() * 100);
        this.requestCount += Math.floor(Math.random() * 10);
        this.errorCount += Math.random() < 0.05 ? 1 : 0;
        this.uptime += 1;
        this.lastHealthCheck = new Date();

        // Update status based on metrics
        if (this.cpuUsage > 95 || this.memoryUsage > 95) {
            this.status = 'overloaded';
        } else if (this.cpuUsage > 80 || this.memoryUsage > 80) {
            this.status = 'busy';
        } else if (this.cpuUsage < 10 && this.memoryUsage < 10) {
            this.status = 'idle';
        } else {
            this.status = 'healthy';
        }
    }

    getStatusColor() {
        switch (this.status) {
            case 'healthy': return 'success';
            case 'busy': return 'warning';
            case 'idle': return 'info';
            case 'overloaded': return 'error';
            case 'provisioning': return 'info';
            case 'terminating': return 'warning';
            default: return 'secondary';
        }
    }

    getHealthScore() {
        const cpuScore = Math.max(0, 100 - this.cpuUsage);
        const memoryScore = Math.max(0, 100 - this.memoryUsage);
        const errorScore = Math.max(0, 100 - (this.errorCount / Math.max(1, this.requestCount)) * 100);
        return Math.round((cpuScore + memoryScore + errorScore) / 3);
    }
}

class ScalingPolicy {
    constructor(config) {
        this.id = this.generateId();
        this.name = config.name;
        this.metric = config.metric;
        this.operator = config.operator;
        this.threshold = config.threshold;
        this.action = config.action;
        this.cooldown = config.cooldown || 300;
        this.enabled = config.enabled || true;
        this.lastTriggered = null;
        this.triggerCount = 0;
        this.createdAt = new Date();
    }

    generateId() {
        return 'policy_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    shouldTrigger(currentValue) {
        if (!this.enabled) return false;

        // Check cooldown
        if (this.lastTriggered) {
            const timeSinceLastTrigger = (new Date() - this.lastTriggered) / 1000;
            if (timeSinceLastTrigger < this.cooldown) return false;
        }

        // Evaluate condition
        switch (this.operator) {
            case 'gt': return currentValue > this.threshold;
            case 'lt': return currentValue < this.threshold;
            case 'gte': return currentValue >= this.threshold;
            case 'lte': return currentValue <= this.threshold;
            default: return false;
        }
    }

    trigger() {
        this.lastTriggered = new Date();
        this.triggerCount++;
        logActivity(`Scaling policy triggered: ${this.name}`, 'warning');
    }
}

class MLModel {
    constructor(config) {
        this.id = this.generateId();
        this.name = config.name;
        this.version = config.version || '1.0.0';
        this.framework = config.framework;
        this.size = config.size || 0;
        this.accuracy = config.accuracy || 0;
        this.latency = config.latency || 0;
        this.throughput = config.throughput || 0;
        this.description = config.description || '';
        this.tags = config.tags || [];
        this.uploadedAt = new Date();
        this.lastUsed = null;
        this.usageCount = 0;
        this.status = 'ready';
    }

    generateId() {
        return 'model_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    use() {
        this.lastUsed = new Date();
        this.usageCount++;
    }

    getPerformanceScore() {
        // Simple performance score based on accuracy and latency
        const accuracyScore = this.accuracy;
        const latencyScore = Math.max(0, 100 - (this.latency / 10)); // Lower latency is better
        return Math.round((accuracyScore + latencyScore) / 2);
    }
}

// Utility functions
function generateId(prefix = 'id') {
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

function formatPercentage(value) {
    return Math.round(value * 100) / 100 + '%';
}

function logActivity(message, type = 'info', details = {}) {
    const logEntry = {
        id: generateId('log'),
        timestamp: new Date(),
        message,
        type,
        details,
        userId: currentUser?.id || 'system'
    };

    activityLog.unshift(logEntry);
    if (activityLog.length > 1000) {
        activityLog = activityLog.slice(0, 1000);
    }

    updateActivityDisplay();
    updateCharts();

    // Check for security issues
    if (type === 'error' || type === 'warning') {
        checkSecurityAlerts(logEntry);
    }
}

function checkSecurityAlerts(logEntry) {
    // Simple security monitoring
    const recentErrors = activityLog.slice(0, 10).filter(log => log.type === 'error').length;

    if (recentErrors >= 3) {
        const alert = {
            id: generateId('alert'),
            level: recentErrors >= 5 ? 'critical' : 'warning',
            message: `High error rate detected: ${recentErrors} errors in last 10 activities`,
            timestamp: new Date(),
            source: 'activity_monitor'
        };

        securityAlerts.unshift(alert);
        if (securityAlerts.length > 50) {
            securityAlerts = securityAlerts.slice(0, 50);
        }

        updateAlertsDisplay();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSettings();
    initializeCluster();
    initializePolicies();
    initializeModels();
    initializeCharts();
    startMonitoring();
    updateDashboard();
});

// Setup all event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            switchSection(targetId);
        });
    });

    // Dashboard
    document.getElementById('refreshDashboardBtn').addEventListener('click', refreshDashboard);

    // Cluster management
    document.getElementById('addNodeBtn').addEventListener('click', () => showModal('addNodeModal'));
    document.getElementById('optimizeClusterBtn').addEventListener('click', optimizeCluster);
    document.getElementById('confirmAddNodeBtn').addEventListener('click', addNode);
    document.getElementById('cancelAddNodeBtn').addEventListener('click', () => hideModal('addNodeModal'));

    // Scaling
    document.getElementById('createPolicyBtn').addEventListener('click', createScalingPolicy);
    document.getElementById('testScalingBtn').addEventListener('click', testScaling);
    document.getElementById('saveScalingConfigBtn').addEventListener('click', saveScalingConfig);

    // Models
    document.getElementById('uploadModelBtn').addEventListener('click', () => showModal('uploadModelModal'));
    document.getElementById('createVersionBtn').addEventListener('click', createModelVersion);
    document.getElementById('confirmUploadBtn').addEventListener('click', uploadModel);
    document.getElementById('cancelUploadBtn').addEventListener('click', () => hideModal('uploadModelModal'));

    // Monitoring
    document.getElementById('exportMetricsBtn').addEventListener('click', exportMetrics);
    document.getElementById('setAlertsBtn').addEventListener('click', setAlerts);

    // Security
    document.getElementById('runSecurityScanBtn').addEventListener('click', runSecurityScan);
    document.getElementById('viewAuditLogBtn').addEventListener('click', viewAuditLog);

    // Settings
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('resetSettingsBtn').addEventListener('click', resetSettings);

    // Emergency stop
    document.getElementById('emergencyStopBtn').addEventListener('click', emergencyStop);

    // Modal close
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            hideModal(modal.id);
        });
    });

    // Policy toggles
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('policy-toggle')) {
            togglePolicy(e.target);
        }
    });

    // Window events
    window.addEventListener('beforeunload', saveState);
    window.addEventListener('online', () => updateConnectionStatus(true));
    window.addEventListener('offline', () => updateConnectionStatus(false));
}

// Initialize application components
function initializeApp() {
    console.log('Initializing Auto-Scaling Inference Cluster...');
    updateConnectionStatus(navigator.onLine);

    // Load saved state
    loadState();

    // Initialize with sample data if empty
    if (clusterNodes.length === 0) {
        createSampleData();
    }
}

function createSampleData() {
    // Sample cluster nodes
    for (let i = 1; i <= 8; i++) {
        const node = new ClusterNode({
            name: `inference-node-${i.toString().padStart(2, '0')}`,
            instanceType: 'c5.large',
            availabilityZone: `us-east-1${String.fromCharCode(97 + ((i - 1) % 3))}`,
            autoScaling: true
        });

        // Simulate some usage
        node.cpuUsage = Math.random() * 80;
        node.memoryUsage = Math.random() * 70;
        node.requestCount = Math.floor(Math.random() * 1000);
        node.status = Math.random() > 0.1 ? 'healthy' : 'busy';

        clusterNodes.push(node);
    }

    // Sample scaling policies
    const scaleUpPolicy = new ScalingPolicy({
        name: 'Scale Up on High CPU',
        metric: 'cpu_usage',
        operator: 'gt',
        threshold: 80,
        action: 'scale_up',
        cooldown: 300
    });

    const scaleDownPolicy = new ScalingPolicy({
        name: 'Scale Down on Low CPU',
        metric: 'cpu_usage',
        operator: 'lt',
        threshold: 30,
        action: 'scale_down',
        cooldown: 600
    });

    scalingPolicies.push(scaleUpPolicy, scaleDownPolicy);

    // Sample models
    const models = [
        {
            name: 'Sentiment Analysis v2.1',
            version: '2.1.0',
            framework: 'tensorflow',
            size: 250000000,
            accuracy: 94.2,
            latency: 45,
            throughput: 220,
            description: 'Advanced sentiment analysis model for text classification',
            tags: ['nlp', 'classification', 'sentiment']
        },
        {
            name: 'Image Classification ResNet',
            version: '1.3.0',
            framework: 'pytorch',
            size: 98000000,
            accuracy: 87.5,
            latency: 120,
            throughput: 85,
            description: 'ResNet-based image classification for 1000 classes',
            tags: ['vision', 'classification', 'resnet']
        },
        {
            name: 'Fraud Detection Model',
            version: '3.0.1',
            framework: 'scikit-learn',
            size: 5000000,
            accuracy: 96.8,
            latency: 15,
            throughput: 500,
            description: 'Machine learning model for fraud detection in transactions',
            tags: ['fraud', 'classification', 'finance']
        }
    ];

    models.forEach(modelConfig => {
        const model = new MLModel(modelConfig);
        modelRegistry.push(model);
    });

    // Sample activity logs
    for (let i = 0; i < 15; i++) {
        const types = ['info', 'success', 'warning', 'error'];
        const messages = [
            'Node inference-node-01 started successfully',
            'Model sentiment-analysis-v2.1 loaded on 3 nodes',
            'Auto-scaling triggered: added 2 nodes',
            'High latency detected on node inference-node-05',
            'Security scan completed successfully',
            'Model performance optimization completed',
            'Failed to provision node inference-node-09',
            'Load balancer rebalanced traffic'
        ];

        logActivity(messages[Math.floor(Math.random() * messages.length)],
                   types[Math.floor(Math.random() * types.length)]);
    }
}

// Switch between sections
function switchSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    document.getElementById(sectionId).classList.add('active');
    document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
}

// Dashboard functions
function updateDashboard() {
    // Calculate cluster metrics
    updateClusterMetrics();

    // Update metric displays
    document.getElementById('activeNodesValue').textContent = clusterNodes.filter(n => n.status !== 'terminating').length;
    document.getElementById('requestsPerSecValue').textContent = formatNumber(clusterMetrics.totalRequests);
    document.getElementById('avgLatencyValue').textContent = `${clusterMetrics.avgLatency}ms`;
    document.getElementById('successRateValue').textContent = formatPercentage(100 - clusterMetrics.errorRate);
    document.getElementById('cpuUsageValue').textContent = formatPercentage(clusterMetrics.cpuUsage);
    document.getElementById('memoryUsageValue').textContent = formatBytes(clusterMetrics.memoryUsage * 1024 * 1024); // Convert to bytes

    // Update change indicators (simulated)
    updateMetricChanges();

    // Update charts
    updateCharts();
}

function updateClusterMetrics() {
    const activeNodes = clusterNodes.filter(n => n.status !== 'terminating');

    if (activeNodes.length === 0) return;

    clusterMetrics.totalRequests = activeNodes.reduce((sum, node) => sum + node.requestCount, 0);
    clusterMetrics.activeRequests = Math.floor(clusterMetrics.totalRequests * 0.1); // Estimate active requests
    clusterMetrics.avgLatency = Math.round(activeNodes.reduce((sum, node) => sum + (Math.random() * 200), 0) / activeNodes.length);
    clusterMetrics.errorRate = activeNodes.reduce((sum, node) => sum + (node.errorCount / Math.max(1, node.requestCount)), 0) / activeNodes.length * 100;
    clusterMetrics.cpuUsage = activeNodes.reduce((sum, node) => sum + node.cpuUsage, 0) / activeNodes.length;
    clusterMetrics.memoryUsage = activeNodes.reduce((sum, node) => sum + node.memoryUsage, 0) / activeNodes.length;
}

function updateMetricChanges() {
    const changes = [
        'activeNodesChange', 'requestsPerSecChange', 'avgLatencyChange',
        'successRateChange', 'cpuUsageChange', 'memoryUsageChange'
    ];

    changes.forEach(changeId => {
        const element = document.getElementById(changeId);
        const change = (Math.random() - 0.5) * 20;
        const isPositive = change >= 0;
        element.textContent = `${isPositive ? '+' : ''}${change.toFixed(1)}%`;
        element.className = `metric-change ${isPositive ? 'positive' : 'negative'}`;
    });
}

function refreshDashboard() {
    updateDashboard();
    logActivity('Dashboard refreshed manually', 'info');
    showAlert('Dashboard refreshed successfully!');
}

// Cluster management
function updateClusterDisplay() {
    const nodeGrid = document.getElementById('nodeGrid');
    nodeGrid.innerHTML = '';

    clusterNodes.forEach(node => {
        const nodeCard = document.createElement('div');
        nodeCard.className = `node-card ${node.status}`;

        nodeCard.innerHTML = `
            <div class="node-header">
                <div class="node-name">${node.name}</div>
                <div class="node-status ${node.getStatusColor()}">
                    <i class="fas fa-circle"></i>
                    ${node.status}
                </div>
            </div>

            <div class="node-metrics">
                <div class="node-metric">
                    <div class="node-metric-label">CPU</div>
                    <div class="node-metric-value">${formatPercentage(node.cpuUsage)}</div>
                </div>
                <div class="node-metric">
                    <div class="node-metric-label">Memory</div>
                    <div class="node-metric-value">${formatPercentage(node.memoryUsage)}</div>
                </div>
                <div class="node-metric">
                    <div class="node-metric-label">Requests</div>
                    <div class="node-metric-value">${formatNumber(node.requestCount)}</div>
                </div>
                <div class="node-metric">
                    <div class="node-metric-label">Health</div>
                    <div class="node-metric-value">${node.getHealthScore()}%</div>
                </div>
            </div>

            <div class="node-actions">
                <button class="btn btn-secondary" onclick="viewNodeDetails('${node.id}')">
                    <i class="fas fa-eye"></i> Details
                </button>
                <button class="btn btn-warning" onclick="rebootNode('${node.id}')">
                    <i class="fas fa-redo"></i> Reboot
                </button>
                <button class="btn btn-danger" onclick="terminateNode('${node.id}')">
                    <i class="fas fa-trash"></i> Terminate
                </button>
            </div>
        `;

        nodeGrid.appendChild(nodeCard);
    });

    // Update cluster stats
    updateClusterStats();
}

function updateClusterStats() {
    const totalNodes = clusterNodes.length;
    const activeNodes = clusterNodes.filter(n => ['healthy', 'busy', 'idle'].includes(n.status)).length;
    const idleNodes = clusterNodes.filter(n => n.status === 'idle').length;
    const failedNodes = clusterNodes.filter(n => ['overloaded', 'error'].includes(n.status)).length;

    document.getElementById('totalNodes').textContent = totalNodes;
    document.getElementById('activeNodesStat').textContent = activeNodes;
    document.getElementById('idleNodes').textContent = idleNodes;
    document.getElementById('failedNodes').textContent = failedNodes;
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function addNode() {
    const form = document.getElementById('addNodeForm');
    const formData = new FormData(form);

    const nodeConfig = {
        name: formData.get('nodeName'),
        instanceType: formData.get('nodeType'),
        availabilityZone: formData.get('nodeZone'),
        autoScaling: document.getElementById('autoScaling').checked
    };

    const node = new ClusterNode(nodeConfig);
    clusterNodes.push(node);

    updateClusterDisplay();
    hideModal('addNodeModal');
    form.reset();

    logActivity(`New node added: ${node.name}`, 'success');
    showAlert('Node added successfully!');
}

function viewNodeDetails(nodeId) {
    const node = clusterNodes.find(n => n.id === nodeId);
    if (node) {
        // In a real implementation, this would show a detailed modal
        showAlert(`Node Details: ${node.name}\nStatus: ${node.status}\nCPU: ${formatPercentage(node.cpuUsage)}\nMemory: ${formatPercentage(node.memoryUsage)}\nUptime: ${node.uptime} minutes`);
    }
}

function rebootNode(nodeId) {
    const node = clusterNodes.find(n => n.id === nodeId);
    if (node) {
        node.status = 'rebooting';
        updateClusterDisplay();
        logActivity(`Rebooting node: ${node.name}`, 'warning');

        // Simulate reboot completion
        setTimeout(() => {
            node.status = 'healthy';
            node.cpuUsage = 10;
            node.memoryUsage = 15;
            updateClusterDisplay();
            logActivity(`Node rebooted successfully: ${node.name}`, 'success');
        }, 30000);
    }
}

function terminateNode(nodeId) {
    const node = clusterNodes.find(n => n.id === nodeId);
    if (node) {
        node.status = 'terminating';
        updateClusterDisplay();
        logActivity(`Terminating node: ${node.name}`, 'warning');

        // Simulate termination
        setTimeout(() => {
            const index = clusterNodes.findIndex(n => n.id === nodeId);
            if (index !== -1) {
                clusterNodes.splice(index, 1);
                updateClusterDisplay();
                logActivity(`Node terminated: ${node.name}`, 'info');
            }
        }, 10000);
    }
}

function optimizeCluster() {
    logActivity('Starting cluster optimization...', 'info');

    // Simple optimization: terminate idle nodes, balance load
    const idleNodes = clusterNodes.filter(n => n.status === 'idle');
    const overloadedNodes = clusterNodes.filter(n => n.status === 'overloaded');

    if (idleNodes.length > 2) {
        // Terminate excess idle nodes
        const nodesToTerminate = idleNodes.slice(2);
        nodesToTerminate.forEach(node => {
            terminateNode(node.id);
        });
        logActivity(`Terminated ${nodesToTerminate.length} idle nodes for optimization`, 'info');
    }

    if (overloadedNodes.length > 0) {
        // Add nodes for overloaded ones
        for (let i = 0; i < Math.min(overloadedNodes.length, 3); i++) {
            const newNode = new ClusterNode({
                name: `optimized-node-${Date.now()}`,
                instanceType: 'c5.large',
                availabilityZone: 'us-east-1a',
                autoScaling: true
            });
            clusterNodes.push(newNode);
        }
        updateClusterDisplay();
        logActivity(`Added ${Math.min(overloadedNodes.length, 3)} nodes to handle overload`, 'success');
    }

    showAlert('Cluster optimization completed!');
}

// Auto-scaling functions
function updateScalingPolicies() {
    const policiesContainer = document.getElementById('scalingPolicies');
    policiesContainer.innerHTML = '';

    scalingPolicies.forEach(policy => {
        const policyCard = document.createElement('div');
        policyCard.className = 'policy-card';

        policyCard.innerHTML = `
            <div class="policy-header">
                <div class="policy-name">${policy.name}</div>
                <div class="policy-status ${policy.enabled ? 'active' : 'inactive'}">
                    ${policy.enabled ? 'Active' : 'Inactive'}
                </div>
            </div>

            <div class="policy-details">
                <div class="policy-detail">
                    <span class="policy-detail-label">Metric:</span>
                    <span class="policy-detail-value">${policy.metric}</span>
                </div>
                <div class="policy-detail">
                    <span class="policy-detail-label">Condition:</span>
                    <span class="policy-detail-value">${policy.operator} ${policy.threshold}</span>
                </div>
                <div class="policy-detail">
                    <span class="policy-detail-label">Action:</span>
                    <span class="policy-detail-value">${policy.action}</span>
                </div>
                <div class="policy-detail">
                    <span class="policy-detail-label">Cooldown:</span>
                    <span class="policy-detail-value">${policy.cooldown}s</span>
                </div>
            </div>

            <div class="policy-actions">
                <button class="btn btn-secondary" onclick="editPolicy('${policy.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn ${policy.enabled ? 'btn-warning' : 'btn-success'}" onclick="togglePolicyStatus('${policy.id}')">
                    <i class="fas ${policy.enabled ? 'fa-pause' : 'fa-play'}"></i>
                    ${policy.enabled ? 'Disable' : 'Enable'}
                </button>
                <button class="btn btn-danger" onclick="deletePolicy('${policy.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;

        policiesContainer.appendChild(policyCard);
    });
}

function createScalingPolicy() {
    // Simple policy creation - in real implementation would show modal
    const policy = new ScalingPolicy({
        name: 'Custom Policy',
        metric: 'cpu_usage',
        operator: 'gt',
        threshold: 75,
        action: 'scale_up',
        cooldown: 300
    });

    scalingPolicies.push(policy);
    updateScalingPolicies();
    logActivity(`Created scaling policy: ${policy.name}`, 'success');
    showAlert('Scaling policy created!');
}

function togglePolicyStatus(policyId) {
    const policy = scalingPolicies.find(p => p.id === policyId);
    if (policy) {
        policy.enabled = !policy.enabled;
        updateScalingPolicies();
        logActivity(`${policy.enabled ? 'Enabled' : 'Disabled'} policy: ${policy.name}`, 'info');
    }
}

function deletePolicy(policyId) {
    const index = scalingPolicies.findIndex(p => p.id === policyId);
    if (index !== -1) {
        const policy = scalingPolicies[index];
        scalingPolicies.splice(index, 1);
        updateScalingPolicies();
        logActivity(`Deleted policy: ${policy.name}`, 'warning');
    }
}

function testScaling() {
    logActivity('Testing auto-scaling functionality...', 'info');

    // Simulate scaling event
    const scaleUpEvent = {
        id: generateId('event'),
        type: 'scale_up',
        nodes: 2,
        reason: 'High CPU usage detected',
        timestamp: new Date()
    };

    scalingEvents.unshift(scaleUpEvent);
    updateScalingEvents();

    // Add test nodes
    for (let i = 0; i < 2; i++) {
        const node = new ClusterNode({
            name: `test-node-${Date.now() + i}`,
            instanceType: 'c5.large',
            availabilityZone: 'us-east-1a',
            autoScaling: true
        });
        clusterNodes.push(node);
    }

    updateClusterDisplay();
    logActivity('Auto-scaling test completed: added 2 nodes', 'success');
    showAlert('Auto-scaling test completed!');
}

function updateScalingEvents() {
    const eventsContainer = document.getElementById('scalingEvents');
    eventsContainer.innerHTML = '';

    scalingEvents.slice(0, 10).forEach(event => {
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';

        eventItem.innerHTML = `
            <div class="event-icon scale-${event.type}">
                <i class="fas ${event.type === 'scale_up' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
            </div>
            <div class="event-content">
                <div class="event-message">${event.type === 'scale_up' ? 'Scaled up' : 'Scaled down'} by ${event.nodes} nodes</div>
                <div class="event-time">${event.timestamp.toLocaleString()}</div>
            </div>
        `;

        eventsContainer.appendChild(eventItem);
    });
}

function saveScalingConfig() {
    settings.minNodes = parseInt(document.getElementById('minNodes').value);
    settings.maxNodes = parseInt(document.getElementById('maxNodes').value);
    settings.scaleUpThreshold = parseInt(document.getElementById('scaleUpThreshold').value);
    settings.scaleDownThreshold = parseInt(document.getElementById('scaleDownThreshold').value);
    settings.cooldownPeriod = parseInt(document.getElementById('cooldownPeriod').value);

    localStorage.setItem('clusterSettings', JSON.stringify(settings));
    logActivity('Scaling configuration saved', 'info');
    showAlert('Scaling configuration saved!');
}

// Model registry functions
function updateModelDisplay() {
    const modelGrid = document.getElementById('modelGrid');
    modelGrid.innerHTML = '';

    modelRegistry.forEach(model => {
        const modelCard = document.createElement('div');
        modelCard.className = 'model-card';
        modelCard.onclick = () => showModelDetails(model.id);

        modelCard.innerHTML = `
            <div class="model-header">
                <div class="model-name">${model.name}</div>
                <div class="model-version">${model.version}</div>
            </div>

            <div class="model-info">
                <div class="model-framework">${model.framework}</div>
                <div class="model-description">${model.description}</div>
            </div>

            <div class="model-stats">
                <div class="model-stat">
                    <div class="model-stat-label">Accuracy</div>
                    <div class="model-stat-value">${formatPercentage(model.accuracy)}</div>
                </div>
                <div class="model-stat">
                    <div class="model-stat-label">Latency</div>
                    <div class="model-stat-value">${model.latency}ms</div>
                </div>
                <div class="model-stat">
                    <div class="model-stat-label">Throughput</div>
                    <div class="model-stat-value">${model.throughput} req/sec</div>
                </div>
                <div class="model-stat">
                    <div class="model-stat-label">Size</div>
                    <div class="model-stat-value">${formatBytes(model.size)}</div>
                </div>
            </div>
        `;

        modelGrid.appendChild(modelCard);
    });
}

function showModelDetails(modelId) {
    const model = modelRegistry.find(m => m.id === modelId);
    if (!model) return;

    document.getElementById('modelName').textContent = model.name;
    document.getElementById('modelVersion').textContent = model.version;
    document.getElementById('modelSize').textContent = formatBytes(model.size);
    document.getElementById('modelFramework').textContent = model.framework;
    document.getElementById('modelDescription').textContent = model.description;
    document.getElementById('modelAccuracy').textContent = formatPercentage(model.accuracy);
    document.getElementById('modelLatency').textContent = `${model.latency}ms`;
    document.getElementById('modelThroughput').textContent = `${model.throughput} req/sec`;

    document.getElementById('modelDetails').style.display = 'block';
    document.getElementById('modelDetails').scrollIntoView({ behavior: 'smooth' });
}

function uploadModel() {
    const form = document.getElementById('uploadModelForm');
    const formData = new FormData(form);

    const modelConfig = {
        name: formData.get('uploadModelName'),
        framework: formData.get('modelFramework'),
        description: formData.get('modelDescription'),
        tags: formData.get('modelTags').split(',').map(tag => tag.trim()),
        size: Math.floor(Math.random() * 1000000000), // Simulate file size
        accuracy: Math.random() * 20 + 80, // Random accuracy 80-100%
        latency: Math.floor(Math.random() * 200) + 10, // Random latency 10-210ms
        throughput: Math.floor(Math.random() * 500) + 50 // Random throughput 50-550 req/sec
    };

    const model = new MLModel(modelConfig);
    modelRegistry.push(model);

    updateModelDisplay();
    hideModal('uploadModelModal');
    form.reset();

    logActivity(`Model uploaded: ${model.name}`, 'success');
    showAlert('Model uploaded successfully!');
}

function createModelVersion() {
    // Simple version creation - in real implementation would show modal
    if (modelRegistry.length > 0) {
        const baseModel = modelRegistry[0];
        const newVersion = new MLModel({
            name: baseModel.name,
            version: incrementVersion(baseModel.version),
            framework: baseModel.framework,
            description: `Version ${incrementVersion(baseModel.version)} of ${baseModel.name}`,
            tags: baseModel.tags,
            size: baseModel.size,
            accuracy: Math.min(100, baseModel.accuracy + (Math.random() - 0.5) * 5),
            latency: Math.max(1, baseModel.latency + (Math.random() - 0.5) * 20),
            throughput: Math.max(1, baseModel.throughput + (Math.random() - 0.5) * 50)
        });

        modelRegistry.unshift(newVersion);
        updateModelDisplay();
        logActivity(`New version created: ${newVersion.name} v${newVersion.version}`, 'success');
        showAlert('New model version created!');
    }
}

function incrementVersion(version) {
    const parts = version.split('.');
    parts[2] = (parseInt(parts[2]) + 1).toString();
    return parts.join('.');
}

// Monitoring functions
function updateAlertsDisplay() {
    const alertsContainer = document.getElementById('alertsList');
    alertsContainer.innerHTML = '';

    securityAlerts.slice(0, 5).forEach(alert => {
        const alertItem = document.createElement('div');
        alertItem.className = `alert-item ${alert.level}`;

        alertItem.innerHTML = `
            <div class="alert-icon">
                <i class="fas ${alert.level === 'critical' ? 'fa-exclamation-triangle' : 'fa-exclamation-circle'}"></i>
            </div>
            <div class="alert-content">
                <div class="alert-message">${alert.message}</div>
                <div class="alert-time">${alert.timestamp.toLocaleString()}</div>
            </div>
        `;

        alertsContainer.appendChild(alertItem);
    });
}

function exportMetrics() {
    const metrics = {
        cluster: clusterMetrics,
        nodes: clusterNodes.map(node => ({
            name: node.name,
            status: node.status,
            cpuUsage: node.cpuUsage,
            memoryUsage: node.memoryUsage,
            requestCount: node.requestCount
        })),
        models: modelRegistry.map(model => ({
            name: model.name,
            version: model.version,
            usageCount: model.usageCount,
            performanceScore: model.getPerformanceScore()
        })),
        timestamp: new Date()
    };

    const dataStr = JSON.stringify(metrics, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cluster-metrics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    logActivity('Metrics exported', 'info');
    showAlert('Metrics exported successfully!');
}

function setAlerts() {
    // In real implementation, this would show alert configuration modal
    showAlert('Alert configuration feature coming soon!');
}

// Security functions
function runSecurityScan() {
    logActivity('Running security scan...', 'info');

    // Simulate security scan
    setTimeout(() => {
        const vulnerabilities = Math.floor(Math.random() * 3);
        if (vulnerabilities === 0) {
            logActivity('Security scan completed: No vulnerabilities found', 'success');
            showAlert('Security scan completed successfully - No issues found!');
        } else {
            logActivity(`Security scan completed: ${vulnerabilities} vulnerabilities found`, 'warning');
            showAlert(`Security scan completed - ${vulnerabilities} issues require attention.`);
        }
    }, 5000);
}

function viewAuditLog() {
    // In real implementation, this would show audit log modal
    showAlert('Audit log viewer feature coming soon!');
}

// Settings management
function saveSettings() {
    settings.clusterName = document.getElementById('clusterName').value;
    settings.region = document.getElementById('region').value;
    settings.instanceType = document.getElementById('instanceType').value;
    settings.enableMonitoring = document.getElementById('enableMonitoring').checked;
    settings.enableAlerts = document.getElementById('enableAlerts').checked;
    settings.alertEmail = document.getElementById('alertEmail').value;
    settings.logRetention = parseInt(document.getElementById('logRetention').value);
    settings.enableEncryption = document.getElementById('enableEncryption').checked;
    settings.enableAudit = document.getElementById('enableAudit').checked;
    settings.sessionTimeout = parseInt(document.getElementById('sessionTimeout').value);
    settings.maxConcurrentRequests = parseInt(document.getElementById('maxConcurrentRequests').value);

    localStorage.setItem('clusterSettings', JSON.stringify(settings));
    logActivity('Settings saved', 'info');
    showAlert('Settings saved successfully!');
}

function resetSettings() {
    settings = { ...defaultSettings };
    loadSettingsToUI();
    logActivity('Settings reset to defaults', 'warning');
    showAlert('Settings reset to defaults!');
}

function loadSettings() {
    const stored = localStorage.getItem('clusterSettings');
    if (stored) {
        settings = { ...defaultSettings, ...JSON.parse(stored) };
    } else {
        settings = { ...defaultSettings };
    }
    loadSettingsToUI();
}

function loadSettingsToUI() {
    document.getElementById('clusterName').value = settings.clusterName;
    document.getElementById('region').value = settings.region;
    document.getElementById('instanceType').value = settings.instanceType;
    document.getElementById('enableMonitoring').checked = settings.enableMonitoring;
    document.getElementById('enableAlerts').checked = settings.enableAlerts;
    document.getElementById('alertEmail').value = settings.alertEmail;
    document.getElementById('logRetention').value = settings.logRetention;
    document.getElementById('enableEncryption').checked = settings.enableEncryption;
    document.getElementById('enableAudit').checked = settings.enableAudit;
    document.getElementById('sessionTimeout').value = settings.sessionTimeout;
    document.getElementById('maxConcurrentRequests').value = settings.maxConcurrentRequests;

    // Load scaling config
    document.getElementById('minNodes').value = settings.minNodes;
    document.getElementById('maxNodes').value = settings.maxNodes;
    document.getElementById('scaleUpThreshold').value = settings.scaleUpThreshold;
    document.getElementById('scaleDownThreshold').value = settings.scaleDownThreshold;
    document.getElementById('cooldownPeriod').value = settings.cooldownPeriod;
}

// Charts initialization and updates
function initializeCharts() {
    // Throughput Chart
    const throughputCtx = document.getElementById('throughputChart').getContext('2d');
    charts.throughput = new Chart(throughputCtx, {
        type: 'line',
        data: {
            labels: generateTimeLabels(24),
            datasets: [{
                label: 'Requests/sec',
                data: generateRandomData(24, 100, 500),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });

    // Resource Chart
    const resourceCtx = document.getElementById('resourceChart').getContext('2d');
    charts.resource = new Chart(resourceCtx, {
        type: 'doughnut',
        data: {
            labels: ['CPU Usage', 'Memory Usage', 'Available'],
            datasets: [{
                data: [65, 45, 30],
                backgroundColor: ['#ef4444', '#f59e0b', '#10b981']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Performance Chart
    const performanceCtx = document.getElementById('performanceChart').getContext('2d');
    charts.performance = new Chart(performanceCtx, {
        type: 'line',
        data: {
            labels: generateTimeLabels(30),
            datasets: [{
                label: 'Avg Latency (ms)',
                data: generateRandomData(30, 50, 150),
                borderColor: '#7c3aed',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                yAxisID: 'y'
            }, {
                label: 'Error Rate (%)',
                data: generateRandomData(30, 0, 5),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { type: 'linear', display: true, position: 'left' },
                y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
            }
        }
    });

    // Error Chart
    const errorCtx = document.getElementById('errorChart').getContext('2d');
    charts.error = new Chart(errorCtx, {
        type: 'bar',
        data: {
            labels: modelRegistry.map(m => m.name.substring(0, 15) + '...'),
            datasets: [{
                label: 'Error Rate (%)',
                data: modelRegistry.map(() => Math.random() * 3),
                backgroundColor: '#ef4444'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });

    // Distribution Chart
    const distributionCtx = document.getElementById('distributionChart').getContext('2d');
    charts.distribution = new Chart(distributionCtx, {
        type: 'pie',
        data: {
            labels: ['Model A', 'Model B', 'Model C', 'Model D'],
            datasets: [{
                data: [35, 25, 20, 20],
                backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function updateCharts() {
    if (charts.throughput) {
        charts.throughput.data.datasets[0].data = generateRandomData(24, 100, 500);
        charts.throughput.update();
    }

    if (charts.resource) {
        const avgCpu = clusterNodes.reduce((sum, node) => sum + node.cpuUsage, 0) / clusterNodes.length;
        const avgMemory = clusterNodes.reduce((sum, node) => sum + node.memoryUsage, 0) / clusterNodes.length;
        const available = 100 - Math.max(avgCpu, avgMemory);
        charts.resource.data.datasets[0].data = [avgCpu, avgMemory, available];
        charts.resource.update();
    }

    if (charts.error) {
        charts.error.data.labels = modelRegistry.map(m => m.name.substring(0, 15) + '...');
        charts.error.data.datasets[0].data = modelRegistry.map(() => Math.random() * 3);
        charts.error.update();
    }
}

function generateTimeLabels(hours) {
    const labels = [];
    for (let i = hours - 1; i >= 0; i--) {
        const date = new Date();
        date.setHours(date.getHours() - i);
        labels.push(date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
    }
    return labels;
}

function generateRandomData(count, min = 0, max = 100) {
    return Array.from({length: count}, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

// Activity log
function updateActivityDisplay() {
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = '';

    activityLog.slice(0, 10).forEach(log => {
        const item = document.createElement('div');
        item.className = `activity-item ${log.type}`;

        item.innerHTML = `
            <i class="fas ${getActivityIcon(log.type)}"></i>
            <div class="activity-content">
                <div class="activity-message">${log.message}</div>
                <div class="activity-time">${log.timestamp.toLocaleString()}</div>
            </div>
        `;

        activityList.appendChild(item);
    });
}

function getActivityIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Monitoring and auto-scaling
function startMonitoring() {
    // Update node metrics every 5 seconds
    setInterval(() => {
        clusterNodes.forEach(node => {
            if (node.status !== 'terminating') {
                node.updateMetrics();
            }
        });
        updateClusterDisplay();
        updateDashboard();
    }, 5000);

    // Check scaling policies every 30 seconds
    setInterval(() => {
        if (autoScalingEnabled) {
            checkScalingPolicies();
        }
    }, 30000);

    // Update charts every minute
    setInterval(() => {
        updateCharts();
    }, 60000);
}

function checkScalingPolicies() {
    const avgCpu = clusterNodes.reduce((sum, node) => sum + node.cpuUsage, 0) / clusterNodes.length;
    const avgMemory = clusterNodes.reduce((sum, node) => sum + node.memoryUsage, 0) / clusterNodes.length;

    scalingPolicies.forEach(policy => {
        let currentValue;
        switch (policy.metric) {
            case 'cpu_usage': currentValue = avgCpu; break;
            case 'memory_usage': currentValue = avgMemory; break;
            default: return;
        }

        if (policy.shouldTrigger(currentValue)) {
            executeScalingAction(policy);
            policy.trigger();
        }
    });
}

function executeScalingAction(policy) {
    if (policy.action === 'scale_up') {
        const newNode = new ClusterNode({
            name: `auto-scale-${Date.now()}`,
            instanceType: settings.instanceType,
            availabilityZone: 'us-east-1a',
            autoScaling: true
        });
        clusterNodes.push(newNode);
        updateClusterDisplay();

        const event = {
            id: generateId('event'),
            type: 'scale_up',
            nodes: 1,
            reason: `Policy triggered: ${policy.name}`,
            timestamp: new Date()
        };
        scalingEvents.unshift(event);
        updateScalingEvents();

        logActivity(`Auto-scaled up: Added node ${newNode.name}`, 'success');
    } else if (policy.action === 'scale_down') {
        const idleNodes = clusterNodes.filter(n => n.status === 'idle' && n.autoScaling);
        if (idleNodes.length > 0) {
            const nodeToRemove = idleNodes[0];
            terminateNode(nodeToRemove.id);

            const event = {
                id: generateId('event'),
                type: 'scale_down',
                nodes: 1,
                reason: `Policy triggered: ${policy.name}`,
                timestamp: new Date()
            };
            scalingEvents.unshift(event);
            updateScalingEvents();

            logActivity(`Auto-scaled down: Removed node ${nodeToRemove.name}`, 'info');
        }
    }
}

// Emergency stop
function emergencyStop() {
    if (confirm('Are you sure you want to emergency stop all operations? This will terminate all running tasks.')) {
        autoScalingEnabled = false;
        logActivity('EMERGENCY STOP activated - All operations halted', 'error');

        // Stop all nodes
        clusterNodes.forEach(node => {
            if (node.status !== 'terminating') {
                node.status = 'stopped';
            }
        });
        updateClusterDisplay();

        showAlert('Emergency stop activated! All operations halted.');
    }
}

// Modal and alert functions
function showAlert(message, title = 'Alert') {
    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMessage').textContent = message;
    document.getElementById('alertModal').classList.add('show');
}

// Connection status
function updateConnectionStatus(online) {
    isOnline = online;
    const statusElement = document.getElementById('connectionStatusText');
    const statusIndicator = document.getElementById('connectionStatus');

    if (online) {
        statusElement.textContent = 'Cluster Online';
        statusIndicator.className = 'status-online';
    } else {
        statusElement.textContent = 'Offline';
        statusIndicator.className = 'status-offline';
    }
}

// State management
function saveState() {
    const state = {
        clusterNodes,
        scalingPolicies,
        scalingEvents,
        modelRegistry,
        activityLog,
        securityAlerts,
        settings
    };
    localStorage.setItem('clusterState', JSON.stringify(state));
}

function loadState() {
    const stored = localStorage.getItem('clusterState');
    if (stored) {
        const state = JSON.parse(stored);
        clusterNodes = state.clusterNodes || [];
        scalingPolicies = state.scalingPolicies || [];
        scalingEvents = state.scalingEvents || [];
        modelRegistry = state.modelRegistry || [];
        activityLog = state.activityLog || [];
        securityAlerts = state.securityAlerts || [];
        settings = state.settings || {};
    }
}

// Initialize all components
function initializeCluster() {
    updateClusterDisplay();
}

function initializePolicies() {
    updateScalingPolicies();
    updateScalingEvents();
}

function initializeModels() {
    updateModelDisplay();
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    logActivity('Application error occurred', 'error');
    showAlert('An error occurred. Please refresh the page.', 'Error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    logActivity('Unhandled promise rejection', 'error');
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveSettings();
    }
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.show').forEach(modal => {
            modal.classList.remove('show');
        });
    }
});

// Export for debugging
window.ClusterManager = {
    clusterNodes,
    scalingPolicies,
    modelRegistry,
    settings,
    logActivity,
    emergencyStop,
    updateDashboard
};

console.log('Auto-Scaling Inference Cluster loaded successfully!');