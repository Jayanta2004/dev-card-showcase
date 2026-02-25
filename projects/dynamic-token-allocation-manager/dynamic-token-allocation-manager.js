// Dynamic Token Allocation Manager - JavaScript Implementation
// Author: AI Assistant
// Date: 2026
// Description: Advanced token allocation system with multiple strategies and real-time analytics

// Global variables
let totalTokens = 1000;
let allocatedTokens = 0;
let availableTokens = 1000;
let agents = [];
let allocationHistory = [];
let simulationRunning = false;
let charts = {};
let settings = {
    autoAllocation: true,
    notifications: true,
    logging: true,
    minAllocation: 5,
    maxAllocation: 50,
    rebalanceInterval: 30,
    learningRate: 0.01,
    explorationRate: 0.1,
    discountFactor: 0.9
};

// Token Allocation Strategies
class AllocationStrategy {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }

    allocate(totalTokens, numAgents) {
        // Base implementation - override in subclasses
        return new Array(numAgents).fill(totalTokens / numAgents);
    }
}

class EqualDistributionStrategy extends AllocationStrategy {
    constructor() {
        super("Equal Distribution", "Distributes tokens equally among all agents");
    }

    allocate(totalTokens, numAgents) {
        const equalShare = totalTokens / numAgents;
        return new Array(numAgents).fill(equalShare);
    }
}

class PriorityBasedStrategy extends AllocationStrategy {
    constructor() {
        super("Priority-Based", "Allocates tokens based on agent priority scores");
    }

    allocate(totalTokens, numAgents) {
        // Simulate priority scores (in real implementation, these would come from agent data)
        const priorities = Array.from({length: numAgents}, () => Math.random());
        const totalPriority = priorities.reduce((sum, p) => sum + p, 0);
        return priorities.map(p => (p / totalPriority) * totalTokens);
    }
}

class DemandDrivenStrategy extends AllocationStrategy {
    constructor() {
        super("Demand-Driven", "Allocates tokens based on current demand patterns");
    }

    allocate(totalTokens, numAgents) {
        // Simulate demand patterns
        const demands = Array.from({length: numAgents}, () => Math.random() * 2);
        const totalDemand = demands.reduce((sum, d) => sum + d, 0);
        return demands.map(d => (d / totalDemand) * totalTokens);
    }
}

class AdaptiveLearningStrategy extends AllocationStrategy {
    constructor() {
        super("Adaptive Learning", "Uses reinforcement learning to optimize allocation");
        this.qTable = {};
        this.learningRate = settings.learningRate;
        this.discountFactor = settings.discountFactor;
        this.explorationRate = settings.explorationRate;
    }

    allocate(totalTokens, numAgents) {
        // Simplified Q-learning implementation
        const state = this.getState(numAgents);
        const action = this.chooseAction(state, numAgents);
        const allocation = this.actionToAllocation(action, totalTokens, numAgents);

        // Learn from previous experience (simplified)
        if (allocationHistory.length > 0) {
            const reward = this.calculateReward(allocation);
            this.updateQTable(state, action, reward, this.getState(numAgents));
        }

        return allocation;
    }

    getState(numAgents) {
        return `agents_${numAgents}`;
    }

    chooseAction(state, numAgents) {
        if (Math.random() < this.explorationRate) {
            // Explore: random action
            return Math.floor(Math.random() * numAgents);
        } else {
            // Exploit: best known action
            const actions = Object.keys(this.qTable).filter(key => key.startsWith(state + '_'));
            if (actions.length === 0) return Math.floor(Math.random() * numAgents);
            return actions.reduce((best, action) =>
                this.qTable[action] > this.qTable[best] ? action : best
            ).split('_')[1];
        }
    }

    actionToAllocation(action, totalTokens, numAgents) {
        // Action represents which agent gets priority
        const priorityAgent = parseInt(action);
        const allocations = new Array(numAgents).fill(totalTokens * 0.1); // Base allocation
        allocations[priorityAgent] = totalTokens * 0.5; // Priority allocation

        // Distribute remaining tokens
        const remaining = totalTokens - allocations.reduce((sum, a) => sum + a, 0);
        const nonPriorityAgents = numAgents - 1;
        if (nonPriorityAgents > 0) {
            const share = remaining / nonPriorityAgents;
            allocations.forEach((alloc, index) => {
                if (index !== priorityAgent) allocations[index] += share;
            });
        }

        return allocations;
    }

    calculateReward(allocation) {
        // Reward based on allocation efficiency (simplified)
        const variance = this.calculateVariance(allocation);
        return 1 / (1 + variance); // Lower variance = higher reward
    }

    calculateVariance(allocation) {
        const mean = allocation.reduce((sum, a) => sum + a, 0) / allocation.length;
        return allocation.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / allocation.length;
    }

    updateQTable(state, action, reward, nextState) {
        const key = `${state}_${action}`;
        const nextMaxQ = Math.max(...Object.values(this.qTable).filter((_, k) => k.startsWith(nextState + '_')) || [0]);
        this.qTable[key] = (1 - this.learningRate) * (this.qTable[key] || 0) +
                          this.learningRate * (reward + this.discountFactor * nextMaxQ);
    }
}

class ReinforcementLearningStrategy extends AllocationStrategy {
    constructor() {
        super("Reinforcement Learning", "Advanced RL-based allocation optimization");
        this.policyNetwork = null;
        this.valueNetwork = null;
        // In a real implementation, these would be TensorFlow.js models
    }

    allocate(totalTokens, numAgents) {
        // Placeholder for advanced RL implementation
        // For demo purposes, use adaptive learning
        const adaptive = new AdaptiveLearningStrategy();
        return adaptive.allocate(totalTokens, numAgents);
    }
}

// Initialize strategies
const strategies = {
    equal: new EqualDistributionStrategy(),
    priority: new PriorityBasedStrategy(),
    demand: new DemandDrivenStrategy(),
    adaptive: new AdaptiveLearningStrategy(),
    reinforcement: new ReinforcementLearningStrategy()
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    initializeAgents();
    updateDashboard();
    initializeCharts();
    loadSettings();
});

// Initialize application components
function initializeApp() {
    console.log('Initializing Dynamic Token Allocation Manager...');
    updateConnectionStatus(true);
}

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

    // Allocation controls
    document.getElementById('applyAllocationBtn').addEventListener('click', applyAllocation);
    document.getElementById('runSimulationBtn').addEventListener('click', runSimulation);
    document.getElementById('resetSimulationBtn').addEventListener('click', resetSimulation);

    // Analytics
    document.getElementById('refreshAnalyticsBtn').addEventListener('click', refreshAnalytics);

    // Settings
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('resetSettingsBtn').addEventListener('click', resetSettings);
    document.getElementById('exportSettingsBtn').addEventListener('click', exportSettings);

    // Modal
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('alertOkBtn').addEventListener('click', closeModal);

    // Window events
    window.addEventListener('beforeunload', saveState);
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

// Initialize agents
function initializeAgents() {
    const numAgents = parseInt(document.getElementById('numAgentsInput').value);
    agents = [];
    for (let i = 0; i < numAgents; i++) {
        agents.push({
            id: i + 1,
            name: `Agent ${i + 1}`,
            allocatedTokens: 0,
            performance: Math.random() * 100,
            priority: Math.random(),
            demand: Math.random() * 2
        });
    }
    updateAgentDisplay();
}

// Update agent display
function updateAgentDisplay() {
    const table = document.getElementById('allocationTable');
    table.innerHTML = '';

    agents.forEach(agent => {
        const row = document.createElement('div');
        row.className = 'allocation-row';

        const percentage = totalTokens > 0 ? (agent.allocatedTokens / totalTokens * 100).toFixed(1) : 0;

        row.innerHTML = `
            <span class="agent-name">${agent.name}</span>
            <div class="allocation-bar">
                <div class="allocation-fill" style="width: ${Math.min(percentage, 100)}%"></div>
            </div>
            <span class="agent-allocation">${agent.allocatedTokens.toFixed(0)} (${percentage}%)</span>
        `;

        table.appendChild(row);
    });
}

// Apply allocation
function applyAllocation() {
    const strategy = document.getElementById('strategySelect').value;
    const newTotalTokens = parseInt(document.getElementById('totalTokensInput').value);
    const numAgents = parseInt(document.getElementById('numAgentsInput').value);

    if (newTotalTokens !== totalTokens || numAgents !== agents.length) {
        totalTokens = newTotalTokens;
        initializeAgents();
    }

    const allocations = strategies[strategy].allocate(totalTokens, numAgents);

    allocatedTokens = 0;
    agents.forEach((agent, index) => {
        agent.allocatedTokens = allocations[index];
        allocatedTokens += allocations[index];
    });

    availableTokens = totalTokens - allocatedTokens;

    updateAgentDisplay();
    updateDashboard();
    updateCharts();
    logActivity(`Applied ${strategies[strategy].name} allocation strategy`);

    // Animate allocation bars
    setTimeout(() => {
        document.querySelectorAll('.allocation-fill').forEach((bar, index) => {
            const percentage = totalTokens > 0 ? (agents[index].allocatedTokens / totalTokens * 100) : 0;
            bar.style.width = `${Math.min(percentage, 100)}%`;
        });
    }, 100);
}

// Update dashboard metrics
function updateDashboard() {
    document.getElementById('totalTokensValue').textContent = totalTokens.toLocaleString();
    document.getElementById('allocatedTokensValue').textContent = allocatedTokens.toFixed(0);
    document.getElementById('availableTokensValue').textContent = availableTokens.toFixed(0);
    document.getElementById('totalTokens').textContent = `Total: ${totalTokens.toLocaleString()}`;

    const efficiency = totalTokens > 0 ? (allocatedTokens / totalTokens * 100).toFixed(1) : 0;
    document.getElementById('efficiencyScore').textContent = `${efficiency}%`;

    // Update change indicators (simulated)
    updateChangeIndicators();
}

// Update change indicators
function updateChangeIndicators() {
    const changes = ['totalTokensChange', 'allocatedTokensChange', 'availableTokensChange', 'efficiencyChange'];
    changes.forEach(changeId => {
        const element = document.getElementById(changeId);
        const change = (Math.random() - 0.5) * 10; // Simulated change
        element.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
        element.className = `metric-change ${change >= 0 ? 'positive' : 'negative'}`;
    });
}

// Initialize charts
function initializeCharts() {
    // Distribution Chart
    const distributionCtx = document.getElementById('distributionChart').getContext('2d');
    charts.distribution = new Chart(distributionCtx, {
        type: 'doughnut',
        data: {
            labels: agents.map(a => a.name),
            datasets: [{
                data: agents.map(a => a.allocatedTokens),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Allocation Chart
    const allocationCtx = document.getElementById('allocationChart').getContext('2d');
    charts.allocation = new Chart(allocationCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Allocated Tokens',
                data: [],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Usage Trends Chart
    const usageCtx = document.getElementById('usageTrendsChart').getContext('2d');
    charts.usage = new Chart(usageCtx, {
        type: 'line',
        data: {
            labels: generateTimeLabels(24),
            datasets: [{
                label: 'Token Usage',
                data: generateRandomData(24),
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                fill: true
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
        type: 'bar',
        data: {
            labels: agents.map(a => a.name),
            datasets: [{
                label: 'Performance Score',
                data: agents.map(a => a.performance),
                backgroundColor: '#ffc107'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    // Efficiency Chart
    const efficiencyCtx = document.getElementById('efficiencyChart').getContext('2d');
    charts.efficiency = new Chart(efficiencyCtx, {
        type: 'radar',
        data: {
            labels: ['Allocation', 'Utilization', 'Fairness', 'Stability', 'Adaptability'],
            datasets: [{
                label: 'Efficiency Metrics',
                data: [85, 78, 92, 88, 76],
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Update charts
function updateCharts() {
    if (charts.distribution) {
        charts.distribution.data.labels = agents.map(a => a.name);
        charts.distribution.data.datasets[0].data = agents.map(a => a.allocatedTokens);
        charts.distribution.update();
    }

    if (charts.allocation) {
        const now = new Date().toLocaleTimeString();
        charts.allocation.data.labels.push(now);
        charts.allocation.data.datasets[0].data.push(allocatedTokens);

        // Keep only last 20 data points
        if (charts.allocation.data.labels.length > 20) {
            charts.allocation.data.labels.shift();
            charts.allocation.data.datasets[0].data.shift();
        }
        charts.allocation.update();
    }

    if (charts.performance) {
        charts.performance.data.labels = agents.map(a => a.name);
        charts.performance.data.datasets[0].data = agents.map(a => a.performance);
        charts.performance.update();
    }
}

// Generate time labels
function generateTimeLabels(hours) {
    const labels = [];
    for (let i = hours - 1; i >= 0; i--) {
        const date = new Date();
        date.setHours(date.getHours() - i);
        labels.push(date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
    }
    return labels;
}

// Generate random data
function generateRandomData(count) {
    return Array.from({length: count}, () => Math.floor(Math.random() * 1000));
}

// Run simulation
function runSimulation() {
    if (simulationRunning) return;

    simulationRunning = true;
    const results = document.getElementById('simulationResults');
    results.textContent = 'Starting simulation...\n';

    let step = 0;
    const maxSteps = 10;

    const simulationInterval = setInterval(() => {
        step++;
        const strategy = document.getElementById('strategySelect').value;
        const allocations = strategies[strategy].allocate(totalTokens, agents.length);

        agents.forEach((agent, index) => {
            agent.allocatedTokens = allocations[index];
        });

        allocatedTokens = allocations.reduce((sum, a) => sum + a, 0);
        availableTokens = totalTokens - allocatedTokens;

        results.textContent += `Step ${step}: Allocated ${allocatedTokens.toFixed(0)} tokens\n`;

        updateAgentDisplay();
        updateDashboard();
        updateCharts();

        if (step >= maxSteps) {
            clearInterval(simulationInterval);
            simulationRunning = false;
            results.textContent += 'Simulation completed.\n';
        }
    }, 1000);
}

// Reset simulation
function resetSimulation() {
    if (simulationRunning) return;

    agents.forEach(agent => {
        agent.allocatedTokens = 0;
    });

    allocatedTokens = 0;
    availableTokens = totalTokens;

    updateAgentDisplay();
    updateDashboard();
    updateCharts();

    document.getElementById('simulationResults').textContent = 'Simulation reset.\n';
    logActivity('Simulation reset');
}

// Refresh analytics
function refreshAnalytics() {
    // Update usage trends with new data
    if (charts.usage) {
        charts.usage.data.datasets[0].data = generateRandomData(24);
        charts.usage.update();
    }

    // Update insights
    updateInsights();

    logActivity('Analytics refreshed');
}

// Update insights
function updateInsights() {
    const insights = [
        { type: 'positive', text: 'Token utilization increased by 15% this week' },
        { type: 'warning', text: 'Agent 3 showing lower performance - consider reallocation' },
        { type: 'info', text: 'Adaptive learning strategy performing 23% better than equal distribution' },
        { type: 'negative', text: 'High variance in token allocation detected' }
    ];

    const insightsList = document.getElementById('insightsList');
    insightsList.innerHTML = '';

    insights.forEach(insight => {
        const item = document.createElement('div');
        item.className = `insight-item ${insight.type}`;
        item.textContent = insight.text;
        insightsList.appendChild(item);
    });
}

// Settings management
function saveSettings() {
    settings.autoAllocation = document.getElementById('autoAllocationToggle').checked;
    settings.notifications = document.getElementById('notificationToggle').checked;
    settings.logging = document.getElementById('loggingToggle').checked;
    settings.minAllocation = parseInt(document.getElementById('minAllocationInput').value);
    settings.maxAllocation = parseInt(document.getElementById('maxAllocationInput').value);
    settings.rebalanceInterval = parseInt(document.getElementById('rebalanceIntervalInput').value);
    settings.learningRate = parseFloat(document.getElementById('learningRateInput').value);
    settings.explorationRate = parseFloat(document.getElementById('explorationRateInput').value);
    settings.discountFactor = parseFloat(document.getElementById('discountFactorInput').value);

    localStorage.setItem('tokenAllocationSettings', JSON.stringify(settings));
    showAlert('Settings saved successfully!');
}

function resetSettings() {
    settings = {
        autoAllocation: true,
        notifications: true,
        logging: true,
        minAllocation: 5,
        maxAllocation: 50,
        rebalanceInterval: 30,
        learningRate: 0.01,
        explorationRate: 0.1,
        discountFactor: 0.9
    };

    loadSettingsToUI();
    showAlert('Settings reset to defaults!');
}

function loadSettings() {
    const stored = localStorage.getItem('tokenAllocationSettings');
    if (stored) {
        settings = { ...settings, ...JSON.parse(stored) };
    }
    loadSettingsToUI();
}

function loadSettingsToUI() {
    document.getElementById('autoAllocationToggle').checked = settings.autoAllocation;
    document.getElementById('notificationToggle').checked = settings.notifications;
    document.getElementById('loggingToggle').checked = settings.logging;
    document.getElementById('minAllocationInput').value = settings.minAllocation;
    document.getElementById('maxAllocationInput').value = settings.maxAllocation;
    document.getElementById('rebalanceIntervalInput').value = settings.rebalanceInterval;
    document.getElementById('learningRateInput').value = settings.learningRate;
    document.getElementById('explorationRateInput').value = settings.explorationRate;
    document.getElementById('discountFactorInput').value = settings.discountFactor;
}

function exportSettings() {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'token-allocation-settings.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Activity logging
function logActivity(message) {
    const activity = {
        message,
        timestamp: new Date().toLocaleString(),
        tokens: allocatedTokens
    };

    allocationHistory.unshift(activity);
    if (allocationHistory.length > 50) {
        allocationHistory = allocationHistory.slice(0, 50);
    }

    updateActivityLog();
}

function updateActivityLog() {
    const log = document.getElementById('activityLog');
    log.innerHTML = '';

    allocationHistory.slice(0, 10).forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <span>${activity.message}</span>
            <span class="timestamp">${activity.timestamp}</span>
        `;
        log.appendChild(item);
    });
}

// Connection status
function updateConnectionStatus(online) {
    const status = document.getElementById('connectionStatus');
    if (online) {
        status.textContent = 'Online';
        status.className = 'status-online';
    } else {
        status.textContent = 'Offline';
        status.className = 'status-offline';
    }
}

// Modal functions
function showAlert(message, title = 'Alert') {
    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMessage').textContent = message;
    document.getElementById('alertModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('alertModal').style.display = 'none';
}

// Save state before unload
function saveState() {
    const state = {
        totalTokens,
        allocatedTokens,
        availableTokens,
        agents,
        allocationHistory,
        settings
    };
    localStorage.setItem('tokenAllocationState', JSON.stringify(state));
}

// Load state on init
function loadState() {
    const stored = localStorage.getItem('tokenAllocationState');
    if (stored) {
        const state = JSON.parse(stored);
        totalTokens = state.totalTokens;
        allocatedTokens = state.allocatedTokens;
        availableTokens = state.availableTokens;
        agents = state.agents;
        allocationHistory = state.allocationHistory;
        settings = { ...settings, ...state.settings };
    }
}

// Initialize insights on load
updateInsights();

// Auto-rebalance if enabled
setInterval(() => {
    if (settings.autoAllocation && !simulationRunning) {
        applyAllocation();
    }
}, settings.rebalanceInterval * 1000);

// Performance monitoring
let lastUpdate = Date.now();
setInterval(() => {
    const now = Date.now();
    const fps = 1000 / (now - lastUpdate);
    lastUpdate = now;

    if (fps < 30) {
        console.warn('Low performance detected:', fps.toFixed(1), 'FPS');
    }
}, 1000);

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showAlert('An error occurred. Please refresh the page.', 'Error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveSettings();
    }
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Export for debugging
window.TokenManager = {
    totalTokens,
    allocatedTokens,
    availableTokens,
    agents,
    strategies,
    settings,
    applyAllocation,
    runSimulation,
    updateDashboard
};

console.log('Dynamic Token Allocation Manager loaded successfully!');