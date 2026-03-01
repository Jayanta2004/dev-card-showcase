// Context-Aware Resource Scaling Engine - JavaScript Implementation

class ContextAwareResourceScalingEngine {
    constructor() {
        this.isRunning = false;
        this.simulationTime = 0;
        this.workloadHistory = [];
        this.scalingHistory = [];
        this.contextInsights = [];

        this.baseResources = {
            cpu: { current: 2, max: 8, allocated: 2 },
            memory: { current: 4, max: 16, allocated: 4 },
            storage: { current: 500, max: 2000, allocated: 500 },
            network: { current: 100, max: 1000, allocated: 100 }
        };

        this.metrics = {
            activeUsers: 0,
            requestRate: 0,
            responseTime: 0,
            errorRate: 0
        };

        this.performanceScore = 95;
        this.costEfficiency = 0;

        this.initializeElements();
        this.bindEvents();
        this.initializeCharts();
        this.updateUI();
    }

    initializeElements() {
        // Control elements
        this.workloadTypeSelect = document.getElementById('workloadType');
        this.intensityInput = document.getElementById('intensity');
        this.intensityValue = document.getElementById('intensityValue');
        this.durationInput = document.getElementById('duration');
        this.startBtn = document.getElementById('startSimulation');
        this.stopBtn = document.getElementById('stopSimulation');
        this.resetBtn = document.getElementById('resetSimulation');
        this.scalingModeRadios = document.querySelectorAll('input[name="scalingMode"]');

        // Metrics elements
        this.activeUsersEl = document.getElementById('activeUsers');
        this.requestRateEl = document.getElementById('requestRate');
        this.responseTimeEl = document.getElementById('responseTime');
        this.errorRateEl = document.getElementById('errorRate');
        this.usersTrendEl = document.getElementById('usersTrend');

        // Resource elements
        this.cpuBar = document.getElementById('cpuBar');
        this.memoryBar = document.getElementById('memoryBar');
        this.storageBar = document.getElementById('storageBar');
        this.networkBar = document.getElementById('networkBar');
        this.cpuValue = document.getElementById('cpuValue');
        this.memoryValue = document.getElementById('memoryValue');
        this.storageValue = document.getElementById('storageValue');
        this.networkValue = document.getElementById('networkValue');

        // Performance elements
        this.performanceScoreEl = document.getElementById('performanceScore');
        this.performanceTrendEl = document.getElementById('performanceTrend');
        this.costEfficiencyEl = document.getElementById('costEfficiency');
        this.costSavingsEl = document.getElementById('costSavings');
        this.scalingLog = document.getElementById('scalingLog');
        this.contextInsightsEl = document.getElementById('contextInsights');

        // Charts
        this.workloadChartCanvas = document.getElementById('workloadChart');
        this.utilizationChartCanvas = document.getElementById('utilizationChart');
    }

    bindEvents() {
        this.intensityInput.addEventListener('input', (e) => {
            this.intensityValue.textContent = e.target.value;
        });

        this.startBtn.addEventListener('click', () => this.startSimulation());
        this.stopBtn.addEventListener('click', () => this.stopSimulation());
        this.resetBtn.addEventListener('click', () => this.resetSimulation());
    }

    initializeCharts() {
        // Workload chart
        this.workloadChart = new Chart(this.workloadChartCanvas, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Active Users',
                    data: [],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Request Rate',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Active Users'
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Requests/sec'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });

        // Utilization chart
        this.utilizationChart = new Chart(this.utilizationChartCanvas, {
            type: 'doughnut',
            data: {
                labels: ['CPU', 'Memory', 'Storage', 'Network'],
                datasets: [{
                    data: [25, 25, 25, 25],
                    backgroundColor: [
                        '#2563eb',
                        '#10b981',
                        '#f59e0b',
                        '#8b5cf6'
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
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    startSimulation() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.simulationTime = 0;
        this.workloadHistory = [];
        this.scalingHistory = [];
        this.contextInsights = [];

        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.resetBtn.disabled = true;

        this.addScalingLog('Simulation started - Monitoring workload patterns...');
        this.addContextInsight('Initializing resource allocation based on baseline metrics');

        this.simulationInterval = setInterval(() => {
            this.simulationTime++;
            this.updateWorkload();
            this.analyzeAndScale();
            this.updateUI();

            // Check if simulation duration is reached
            if (this.simulationTime >= parseInt(this.durationInput.value)) {
                this.stopSimulation();
            }
        }, 1000);
    }

    stopSimulation() {
        this.isRunning = false;
        clearInterval(this.simulationInterval);

        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.resetBtn.disabled = false;

        this.addScalingLog('Simulation completed - Analyzing results...');
        this.addContextInsight('Simulation ended - Resources stabilized');
    }

    resetSimulation() {
        this.stopSimulation();
        this.simulationTime = 0;
        this.workloadHistory = [];
        this.scalingHistory = [];
        this.contextInsights = [];

        // Reset resources to baseline
        this.baseResources.cpu.allocated = 2;
        this.baseResources.memory.allocated = 4;
        this.baseResources.storage.allocated = 500;
        this.baseResources.network.allocated = 100;

        this.metrics = {
            activeUsers: 0,
            requestRate: 0,
            responseTime: 0,
            errorRate: 0
        };

        this.performanceScore = 95;
        this.costEfficiency = 0;

        this.updateCharts();
        this.updateUI();
        this.addScalingLog('System reset - Ready for new simulation');
        this.clearContextInsights();
        this.addContextInsight('System reset to baseline configuration');
    }

    updateWorkload() {
        const workloadType = this.workloadTypeSelect.value;
        const intensity = parseInt(this.intensityInput.value);
        const time = this.simulationTime;

        let activeUsers, requestRate;

        switch (workloadType) {
            case 'steady':
                activeUsers = 50 + (intensity * 10) + Math.sin(time * 0.1) * 20;
                requestRate = 100 + (intensity * 20) + Math.sin(time * 0.1) * 30;
                break;

            case 'bursty':
                const burstCycle = Math.sin(time * 0.3);
                activeUsers = 30 + (intensity * 15) + (burstCycle > 0.7 ? 200 : 0);
                requestRate = 60 + (intensity * 25) + (burstCycle > 0.7 ? 400 : 0);
                break;

            case 'seasonal':
                activeUsers = 40 + (intensity * 12) + Math.sin(time * 0.05) * 100 + Math.sin(time * 0.2) * 30;
                requestRate = 80 + (intensity * 20) + Math.sin(time * 0.05) * 150 + Math.sin(time * 0.2) * 50;
                break;

            case 'spiky':
                activeUsers = 25 + (intensity * 8) + (Math.random() > 0.9 ? 300 : 0);
                requestRate = 50 + (intensity * 15) + (Math.random() > 0.9 ? 600 : 0);
                break;

            case 'gradual':
                const growth = Math.min(time * 2, 200);
                activeUsers = 20 + growth + (intensity * 5);
                requestRate = 40 + growth * 1.5 + (intensity * 10);
                break;
        }

        // Ensure positive values
        activeUsers = Math.max(0, Math.round(activeUsers));
        requestRate = Math.max(0, Math.round(requestRate));

        // Calculate derived metrics
        this.metrics.activeUsers = activeUsers;
        this.metrics.requestRate = requestRate;
        this.metrics.responseTime = Math.max(50, 200 - (this.baseResources.cpu.allocated * 10) + (requestRate / 20));
        this.metrics.errorRate = Math.max(0, Math.min(5, (requestRate / this.baseResources.cpu.allocated / 10) - 1));

        // Store in history
        this.workloadHistory.push({
            time: this.simulationTime,
            activeUsers: activeUsers,
            requestRate: requestRate,
            responseTime: this.metrics.responseTime,
            errorRate: this.metrics.errorRate
        });

        // Keep only last 60 data points for chart
        if (this.workloadHistory.length > 60) {
            this.workloadHistory.shift();
        }
    }

    analyzeAndScale() {
        const scalingMode = document.querySelector('input[name="scalingMode"]:checked').value;
        const currentLoad = this.metrics.requestRate / 100; // Normalized load (0-10 scale)

        let scalingDecision = null;

        switch (scalingMode) {
            case 'reactive':
                scalingDecision = this.reactiveScaling(currentLoad);
                break;
            case 'predictive':
                scalingDecision = this.predictiveScaling(currentLoad);
                break;
            case 'context-aware':
                scalingDecision = this.contextAwareScaling(currentLoad);
                break;
        }

        if (scalingDecision) {
            this.applyScalingDecision(scalingDecision);
        }

        this.updatePerformanceScore();
        this.calculateCostEfficiency();
    }

    reactiveScaling(currentLoad) {
        // Simple threshold-based scaling
        const thresholds = {
            scaleUp: 0.7,
            scaleDown: 0.3
        };

        if (currentLoad > thresholds.scaleUp) {
            return { action: 'scale_up', reason: 'Load exceeded threshold' };
        } else if (currentLoad < thresholds.scaleDown && this.simulationTime > 10) {
            return { action: 'scale_down', reason: 'Load below threshold' };
        }

        return null;
    }

    predictiveScaling(currentLoad) {
        // Analyze recent trends
        if (this.workloadHistory.length < 5) return null;

        const recent = this.workloadHistory.slice(-5);
        const trend = this.calculateTrend(recent.map(h => h.requestRate));

        if (trend > 0.1 && currentLoad > 0.5) {
            return { action: 'scale_up', reason: 'Predicting load increase' };
        } else if (trend < -0.1 && currentLoad < 0.4 && this.simulationTime > 15) {
            return { action: 'scale_down', reason: 'Predicting load decrease' };
        }

        return null;
    }

    contextAwareScaling(currentLoad) {
        // Advanced analysis considering multiple factors
        const context = this.analyzeContext();

        if (context.riskLevel === 'high' && currentLoad > 0.6) {
            return { action: 'scale_up', reason: 'High risk context detected' };
        } else if (context.efficiency > 0.8 && currentLoad < 0.3 && this.simulationTime > 20) {
            return { action: 'scale_down', reason: 'Optimal efficiency achieved' };
        } else if (context.pattern === 'bursty' && currentLoad > 0.5) {
            return { action: 'scale_up', reason: 'Bursty pattern requires proactive scaling' };
        }

        return null;
    }

    analyzeContext() {
        const recent = this.workloadHistory.slice(-10);
        if (recent.length < 5) return { riskLevel: 'low', efficiency: 0.5, pattern: 'unknown' };

        const variability = this.calculateVariability(recent.map(h => h.requestRate));
        const avgResponseTime = recent.reduce((sum, h) => sum + h.responseTime, 0) / recent.length;
        const avgErrorRate = recent.reduce((sum, h) => sum + h.errorRate, 0) / recent.length;

        let riskLevel = 'low';
        if (variability > 0.3 || avgResponseTime > 300 || avgErrorRate > 2) {
            riskLevel = 'high';
        } else if (variability > 0.15 || avgResponseTime > 200) {
            riskLevel = 'medium';
        }

        const efficiency = Math.max(0, 1 - (avgResponseTime / 500) - (avgErrorRate / 10));

        const pattern = this.detectPattern(recent);

        return { riskLevel, efficiency, pattern };
    }

    calculateTrend(values) {
        if (values.length < 2) return 0;
        const n = values.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = values.reduce((sum, val, idx) => sum + (val * idx), 0);
        const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        return slope / values[0]; // Normalized trend
    }

    calculateVariability(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance) / mean; // Coefficient of variation
    }

    detectPattern(recent) {
        const values = recent.map(h => h.requestRate);
        const variability = this.calculateVariability(values);

        if (variability > 0.4) return 'bursty';
        if (this.calculateTrend(values) > 0.05) return 'increasing';
        if (this.calculateTrend(values) < -0.05) return 'decreasing';
        return 'steady';
    }

    applyScalingDecision(decision) {
        const scaleFactor = decision.action === 'scale_up' ? 1.5 : 0.7;

        // Scale CPU
        this.baseResources.cpu.allocated = Math.max(1, Math.min(
            this.baseResources.cpu.max,
            Math.round(this.baseResources.cpu.allocated * scaleFactor)
        ));

        // Scale Memory proportionally
        this.baseResources.memory.allocated = Math.max(2, Math.min(
            this.baseResources.memory.max,
            Math.round(this.baseResources.memory.allocated * scaleFactor)
        ));

        // Scale Storage and Network based on CPU
        this.baseResources.storage.allocated = Math.max(200, Math.min(
            this.baseResources.storage.max,
            Math.round(this.baseResources.storage.allocated * scaleFactor)
        ));

        this.baseResources.network.allocated = Math.max(50, Math.min(
            this.baseResources.network.max,
            Math.round(this.baseResources.network.allocated * scaleFactor)
        ));

        this.addScalingLog(`${decision.action.replace('_', ' ').toUpperCase()}: ${decision.reason}`);
        this.scalingHistory.push({
            time: this.simulationTime,
            action: decision.action,
            reason: decision.reason,
            resources: { ...this.baseResources }
        });
    }

    updatePerformanceScore() {
        const responseTimeScore = Math.max(0, 100 - (this.metrics.responseTime - 50) / 2);
        const errorRateScore = Math.max(0, 100 - this.metrics.errorRate * 10);
        const utilizationScore = this.calculateUtilizationEfficiency();

        this.performanceScore = Math.round((responseTimeScore + errorRateScore + utilizationScore) / 3);
        this.performanceScore = Math.max(0, Math.min(100, this.performanceScore));
    }

    calculateUtilizationEfficiency() {
        const cpuUtil = this.baseResources.cpu.allocated / this.baseResources.cpu.max;
        const memUtil = this.baseResources.memory.allocated / this.baseResources.memory.max;
        const loadRatio = this.metrics.requestRate / (this.baseResources.cpu.allocated * 50);

        // Optimal utilization is around 70-80%
        const optimalUtil = 0.75;
        const efficiency = 1 - Math.abs((cpuUtil + memUtil) / 2 - optimalUtil) - Math.abs(loadRatio - optimalUtil);

        return Math.max(0, efficiency * 100);
    }

    calculateCostEfficiency() {
        // Simplified cost calculation
        const cpuCost = this.baseResources.cpu.allocated * 0.10;
        const memCost = this.baseResources.memory.allocated * 0.05;
        const storageCost = (this.baseResources.storage.allocated / 1000) * 0.02;
        const networkCost = (this.baseResources.network.allocated / 100) * 0.01;

        this.costEfficiency = cpuCost + memCost + storageCost + networkCost;

        // Calculate savings vs static allocation (assuming static = max resources)
        const staticCost = (this.baseResources.cpu.max * 0.10) +
                          (this.baseResources.memory.max * 0.05) +
                          (this.baseResources.storage.max / 1000 * 0.02) +
                          (this.baseResources.network.max / 100 * 0.01);

        const savings = staticCost - this.costEfficiency;
        return savings;
    }

    updateUI() {
        // Update metrics
        this.activeUsersEl.textContent = this.metrics.activeUsers.toLocaleString();
        this.requestRateEl.textContent = this.metrics.requestRate;
        this.responseTimeEl.textContent = Math.round(this.metrics.responseTime);
        this.errorRateEl.textContent = this.metrics.errorRate.toFixed(1);

        // Update trends
        this.updateTrends();

        // Update resource bars
        this.updateResourceBars();

        // Update performance
        this.updatePerformanceDisplay();

        // Update charts
        this.updateCharts();

        // Update context insights
        this.updateContextInsights();
    }

    updateTrends() {
        if (this.workloadHistory.length < 2) return;

        const current = this.workloadHistory[this.workloadHistory.length - 1];
        const previous = this.workloadHistory[this.workloadHistory.length - 2];

        const userChange = ((current.activeUsers - previous.activeUsers) / previous.activeUsers) * 100;

        this.usersTrendEl.className = userChange >= 0 ? 'metric-trend positive' : 'metric-trend negative';
        this.usersTrendEl.innerHTML = `
            <i class="fas fa-arrow-${userChange >= 0 ? 'up' : 'down'}"></i>
            ${Math.abs(userChange).toFixed(1)}%
        `;
    }

    updateResourceBars() {
        const cpuPercent = (this.baseResources.cpu.allocated / this.baseResources.cpu.max) * 100;
        const memPercent = (this.baseResources.memory.allocated / this.baseResources.memory.max) * 100;
        const storagePercent = (this.baseResources.storage.allocated / this.baseResources.storage.max) * 100;
        const networkPercent = (this.baseResources.network.allocated / this.baseResources.network.max) * 100;

        this.cpuBar.style.width = `${cpuPercent}%`;
        this.memoryBar.style.width = `${memPercent}%`;
        this.storageBar.style.width = `${storagePercent}%`;
        this.networkBar.style.width = `${networkPercent}%`;

        this.cpuValue.textContent = `${this.baseResources.cpu.allocated} / ${this.baseResources.cpu.max} cores`;
        this.memoryValue.textContent = `${this.baseResources.memory.allocated} / ${this.baseResources.memory.max} GB`;
        this.storageValue.textContent = `${this.baseResources.storage.allocated} / ${this.baseResources.storage.max} IOPS`;
        this.networkValue.textContent = `${this.baseResources.network.allocated} / ${this.baseResources.network.max} Mbps`;

        // Add high usage class for visual feedback
        [this.cpuBar, this.memoryBar, this.storageBar, this.networkBar].forEach((bar, index) => {
            const percents = [cpuPercent, memPercent, storagePercent, networkPercent];
            bar.classList.toggle('high-usage', percents[index] > 80);
        });
    }

    updatePerformanceDisplay() {
        // Update performance score circle
        const scorePercent = this.performanceScore;
        this.performanceScoreEl.style.background = `conic-gradient(#10b981 0% ${scorePercent}%, #e2e8f0 ${scorePercent}% 100%)`;

        // Update cost efficiency
        this.costEfficiencyEl.textContent = `$${this.costEfficiency.toFixed(2)}`;

        const savings = this.calculateCostEfficiency();
        this.costSavingsEl.innerHTML = `
            <i class="fas fa-dollar-sign"></i>
            $${savings.toFixed(2)} saved vs static allocation
        `;
    }

    updateCharts() {
        // Update workload chart
        const labels = this.workloadHistory.map(h => h.time);
        const usersData = this.workloadHistory.map(h => h.activeUsers);
        const requestsData = this.workloadHistory.map(h => h.requestRate);

        this.workloadChart.data.labels = labels;
        this.workloadChart.data.datasets[0].data = usersData;
        this.workloadChart.data.datasets[1].data = requestsData;
        this.workloadChart.update();

        // Update utilization chart
        const cpuUtil = (this.baseResources.cpu.allocated / this.baseResources.cpu.max) * 100;
        const memUtil = (this.baseResources.memory.allocated / this.baseResources.memory.max) * 100;
        const storageUtil = (this.baseResources.storage.allocated / this.baseResources.storage.max) * 100;
        const networkUtil = (this.baseResources.network.allocated / this.baseResources.network.max) * 100;

        this.utilizationChart.data.datasets[0].data = [cpuUtil, memUtil, storageUtil, networkUtil];
        this.utilizationChart.update();
    }

    updateContextInsights() {
        if (this.workloadHistory.length === 0) return;

        const context = this.analyzeContext();
        const currentLoad = this.metrics.requestRate / 100;

        let insights = [];

        if (context.riskLevel === 'high') {
            insights.push('High risk detected - Consider scaling up resources');
        }

        if (context.efficiency > 0.8) {
            insights.push('High efficiency achieved - Resources well-utilized');
        }

        if (context.pattern === 'bursty') {
            insights.push('Bursty workload pattern detected - Proactive scaling recommended');
        }

        if (currentLoad > 0.8) {
            insights.push('High load detected - Monitor resource utilization closely');
        }

        if (this.metrics.errorRate > 2) {
            insights.push('Elevated error rate - Check resource allocation');
        }

        // Keep only recent insights
        this.contextInsights = insights.slice(-3);
        this.renderContextInsights();
    }

    renderContextInsights() {
        this.contextInsightsEl.innerHTML = this.contextInsights.map(insight => `
            <div class="insight-item">
                <i class="fas fa-info-circle"></i>
                <span>${insight}</span>
            </div>
        `).join('');
    }

    clearContextInsights() {
        this.contextInsights = [];
        this.renderContextInsights();
    }

    addScalingLog(message) {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = `[${this.simulationTime}s] ${message}`;

        if (message.includes('scale_up')) {
            logEntry.classList.add('scaling-up');
        } else if (message.includes('scale_down')) {
            logEntry.classList.add('scaling-down');
        }

        this.scalingLog.appendChild(logEntry);
        this.scalingLog.scrollTop = this.scalingLog.scrollHeight;
    }

    addContextInsight(insight) {
        this.contextInsights.push(insight);
        if (this.contextInsights.length > 5) {
            this.contextInsights.shift();
        }
        this.renderContextInsights();
    }
}

// Initialize Chart.js library if not already loaded
if (typeof Chart === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => {
        // Initialize the scaling engine after Chart.js loads
        document.addEventListener('DOMContentLoaded', () => {
            new ContextAwareResourceScalingEngine();
        });
    };
    document.head.appendChild(script);
} else {
    // Chart.js already loaded
    document.addEventListener('DOMContentLoaded', () => {
        new ContextAwareResourceScalingEngine();
    });
}