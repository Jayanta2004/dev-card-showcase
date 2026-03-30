// API Rate Governance Controller JavaScript
class APIRateController {
    constructor() {
        this.config = {
            requestsPerSecond: 10,
            requestsPerMinute: 100,
            requestsPerHour: 1000,
            burstLimit: 50,
            cooldownPeriod: 1000,
            backoffStrategy: 'exponential',
            retryAttempts: 3,
            timeout: 5000
        };

        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            rateLimited: 0,
            avgResponseTime: 0,
            currentRPS: 0
        };

        this.requestQueue = [];
        this.activeRequests = 0;
        this.isRunning = false;
        this.startTime = null;
        this.requestHistory = [];
        this.responseTimes = [];
        this.rateHistory = [];
        this.logs = [];

        this.charts = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeCharts();
        this.loadConfig();
        this.updateUI();
    }

    bindEvents() {
        document.getElementById('applyConfig').addEventListener('click', () => this.applyConfiguration());
        document.getElementById('startSimulation').addEventListener('click', () => this.startSimulation());
        document.getElementById('stopSimulation').addEventListener('click', () => this.stopSimulation());
        document.getElementById('resetStats').addEventListener('click', () => this.resetStatistics());
        document.getElementById('openConfigModal').addEventListener('click', () => this.openConfigModal());
        document.querySelector('.close').addEventListener('click', () => this.closeConfigModal());
        document.getElementById('saveAdvancedConfig').addEventListener('click', () => this.saveAdvancedConfig());

        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('configModal')) {
                this.closeConfigModal();
            }
        });
    }

    initializeCharts() {
        const rateCtx = document.getElementById('rateChart').getContext('2d');
        this.charts.rateChart = new Chart(rateCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Requests per Second',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
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
                        title: {
                            display: true,
                            text: 'Requests/Second'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time'
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

        const responseTimeCtx = document.getElementById('responseTimeChart').getContext('2d');
        this.charts.responseTimeChart = new Chart(responseTimeCtx, {
            type: 'bar',
            data: {
                labels: ['0-100ms', '100-500ms', '500-1000ms', '1000-2000ms', '2000ms+'],
                datasets: [{
                    label: 'Response Time Distribution',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: [
                        '#27ae60',
                        '#f39c12',
                        '#e67e22',
                        '#e74c3c',
                        '#c0392b'
                    ]
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
                            text: 'Number of Requests'
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

    applyConfiguration() {
        this.config.requestsPerSecond = parseInt(document.getElementById('requestsPerSecond').value);
        this.config.requestsPerMinute = parseInt(document.getElementById('requestsPerMinute').value);
        this.config.requestsPerHour = parseInt(document.getElementById('requestsPerHour').value);
        this.config.burstLimit = parseInt(document.getElementById('burstLimit').value);
        this.config.cooldownPeriod = parseInt(document.getElementById('cooldownPeriod').value);

        this.saveConfig();
        this.showNotification('Configuration applied successfully!', 'success');
    }

    openConfigModal() {
        document.getElementById('configModal').style.display = 'block';
        document.getElementById('backoffStrategy').value = this.config.backoffStrategy;
        document.getElementById('retryAttempts').value = this.config.retryAttempts;
        document.getElementById('timeout').value = this.config.timeout;
    }

    closeConfigModal() {
        document.getElementById('configModal').style.display = 'none';
    }

    saveAdvancedConfig() {
        this.config.backoffStrategy = document.getElementById('backoffStrategy').value;
        this.config.retryAttempts = parseInt(document.getElementById('retryAttempts').value);
        this.config.timeout = parseInt(document.getElementById('timeout').value);

        this.saveConfig();
        this.closeConfigModal();
        this.showNotification('Advanced configuration saved!', 'success');
    }

    saveConfig() {
        localStorage.setItem('apiRateControllerConfig', JSON.stringify(this.config));
    }

    loadConfig() {
        const saved = localStorage.getItem('apiRateControllerConfig');
        if (saved) {
            this.config = { ...this.config, ...JSON.parse(saved) };
        }
        this.updateConfigUI();
    }

    updateConfigUI() {
        document.getElementById('requestsPerSecond').value = this.config.requestsPerSecond;
        document.getElementById('requestsPerMinute').value = this.config.requestsPerMinute;
        document.getElementById('requestsPerHour').value = this.config.requestsPerHour;
        document.getElementById('burstLimit').value = this.config.burstLimit;
        document.getElementById('cooldownPeriod').value = this.config.cooldownPeriod;
    }

    startSimulation() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.startTime = Date.now();
        this.requestQueue = [];
        this.activeRequests = 0;

        const totalRequests = parseInt(document.getElementById('totalRequests').value);
        const concurrentRequests = parseInt(document.getElementById('concurrentRequests').value);
        const endpoint = document.getElementById('apiEndpoint').value;
        const method = document.getElementById('requestMethod').value;

        // Generate request queue
        for (let i = 0; i < totalRequests; i++) {
            this.requestQueue.push({
                id: i + 1,
                endpoint,
                method,
                data: method !== 'GET' ? { title: `Request ${i + 1}`, body: 'Test data', userId: 1 } : null
            });
        }

        this.processRequestQueue(concurrentRequests);
        this.startMonitoring();
        this.showNotification('Simulation started!', 'success');
    }

    stopSimulation() {
        this.isRunning = false;
        this.showNotification('Simulation stopped!', 'warning');
    }

    resetStatistics() {
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            rateLimited: 0,
            avgResponseTime: 0,
            currentRPS: 0
        };

        this.requestHistory = [];
        this.responseTimes = [];
        this.rateHistory = [];
        this.logs = [];

        this.updateCharts();
        this.updateUI();
        this.updateLogs();
        this.showNotification('Statistics reset!', 'success');
    }

    async processRequestQueue(maxConcurrent) {
        while (this.isRunning && (this.requestQueue.length > 0 || this.activeRequests > 0)) {
            if (this.activeRequests < maxConcurrent && this.requestQueue.length > 0) {
                const request = this.requestQueue.shift();
                this.activeRequests++;
                this.makeRequest(request).finally(() => {
                    this.activeRequests--;
                });
            }

            // Rate limiting logic
            if (this.shouldThrottle()) {
                await this.sleep(this.config.cooldownPeriod);
            } else {
                await this.sleep(10); // Small delay to prevent overwhelming
            }
        }

        if (this.isRunning) {
            this.isRunning = false;
            this.showNotification('Simulation completed!', 'success');
        }
    }

    shouldThrottle() {
        const now = Date.now();
        const recentRequests = this.requestHistory.filter(time => now - time < 1000).length;
        return recentRequests >= this.config.requestsPerSecond;
    }

    async makeRequest(request) {
        const startTime = Date.now();
        let attempts = 0;
        let success = false;
        let responseTime = 0;
        let status = 0;

        while (attempts <= this.config.retryAttempts && !success) {
            try {
                const response = await this.sendHttpRequest(request, attempts);
                responseTime = Date.now() - startTime;
                status = response.status;
                success = response.ok;

                if (success) {
                    this.stats.successfulRequests++;
                } else if (status === 429) {
                    this.stats.rateLimited++;
                    if (attempts < this.config.retryAttempts) {
                        await this.sleep(this.getBackoffDelay(attempts));
                        attempts++;
                        continue;
                    }
                } else {
                    this.stats.failedRequests++;
                }

                break;
            } catch (error) {
                responseTime = Date.now() - startTime;
                this.stats.failedRequests++;
                if (attempts < this.config.retryAttempts) {
                    await this.sleep(this.getBackoffDelay(attempts));
                    attempts++;
                } else {
                    break;
                }
            }
        }

        this.stats.totalRequests++;
        this.requestHistory.push(Date.now());
        this.responseTimes.push(responseTime);

        // Update response time distribution
        this.updateResponseTimeDistribution(responseTime);

        // Log the request
        this.logRequest(request, status, responseTime, status === 429);

        // Update UI
        this.updateUI();
        this.updateCharts();
    }

    async sendHttpRequest(request, attempt) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        try {
            const options = {
                method: request.method,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            if (request.data) {
                options.body = JSON.stringify(request.data);
            }

            const response = await fetch(request.endpoint, options);
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    getBackoffDelay(attempt) {
        switch (this.config.backoffStrategy) {
            case 'linear':
                return (attempt + 1) * 1000;
            case 'exponential':
                return Math.pow(2, attempt) * 1000;
            case 'fibonacci':
                return this.fibonacci(attempt + 1) * 1000;
            default:
                return 1000;
        }
    }

    fibonacci(n) {
        if (n <= 1) return n;
        return this.fibonacci(n - 1) + this.fibonacci(n - 2);
    }

    updateResponseTimeDistribution(responseTime) {
        let index;
        if (responseTime < 100) index = 0;
        else if (responseTime < 500) index = 1;
        else if (responseTime < 1000) index = 2;
        else if (responseTime < 2000) index = 3;
        else index = 4;

        this.charts.responseTimeChart.data.datasets[0].data[index]++;
        this.charts.responseTimeChart.update();
    }

    logRequest(request, status, responseTime, rateLimited) {
        const log = {
            timestamp: new Date().toLocaleTimeString(),
            method: request.method,
            endpoint: request.endpoint,
            status: status,
            responseTime: responseTime,
            rateLimited: rateLimited
        };

        this.logs.unshift(log);
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(0, 1000);
        }

        this.updateLogs();
    }

    updateLogs() {
        const tbody = document.getElementById('logsBody');
        tbody.innerHTML = '';

        this.logs.slice(0, 100).forEach(log => {
            const row = tbody.insertRow();
            row.insertCell().textContent = log.timestamp;
            row.insertCell().textContent = log.method;
            row.insertCell().textContent = log.endpoint;
            const statusCell = row.insertCell();
            statusCell.textContent = log.status;
            statusCell.className = log.status >= 200 && log.status < 300 ? 'status-success' :
                                 log.status >= 400 ? 'status-error' : 'status-rate-limited';
            row.insertCell().textContent = `${log.responseTime}ms`;
            row.insertCell().textContent = log.rateLimited ? 'Yes' : 'No';
        });
    }

    updateUI() {
        document.getElementById('totalRequestsStat').textContent = this.stats.totalRequests;
        document.getElementById('successfulRequestsStat').textContent = this.stats.successfulRequests;
        document.getElementById('failedRequestsStat').textContent = this.stats.failedRequests;
        document.getElementById('rateLimitedStat').textContent = this.stats.rateLimited;

        const avgResponseTime = this.responseTimes.length > 0 ?
            Math.round(this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length) : 0;
        document.getElementById('avgResponseTimeStat').textContent = `${avgResponseTime}ms`;

        const currentRPS = this.calculateCurrentRPS();
        document.getElementById('currentRPSStat').textContent = currentRPS;
    }

    calculateCurrentRPS() {
        const now = Date.now();
        const recentRequests = this.requestHistory.filter(time => now - time < 1000).length;
        return recentRequests;
    }

    updateCharts() {
        // Update rate chart
        const now = new Date().toLocaleTimeString();
        this.charts.rateChart.data.labels.push(now);
        this.charts.rateChart.data.datasets[0].data.push(this.calculateCurrentRPS());

        if (this.charts.rateChart.data.labels.length > 50) {
            this.charts.rateChart.data.labels.shift();
            this.charts.rateChart.data.datasets[0].data.shift();
        }

        this.charts.rateChart.update();
    }

    startMonitoring() {
        this.monitoringInterval = setInterval(() => {
            if (this.isRunning) {
                this.updateCharts();
                this.updateUI();
            } else {
                clearInterval(this.monitoringInterval);
            }
        }, 1000);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Utility functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function formatTime(ms) {
    if (ms < 1000) {
        return ms + 'ms';
    } else if (ms < 60000) {
        return (ms / 1000).toFixed(1) + 's';
    } else {
        return (ms / 60000).toFixed(1) + 'm';
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.apiController = new APIRateController();
});

// Export for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIRateController;
}