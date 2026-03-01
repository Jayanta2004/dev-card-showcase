// Federated Insight Aggregation Network - JavaScript

class FederatedInsightAggregationNetwork {
    constructor() {
        this.networkChart = null;
        this.correlationChart = null;
        this.healthChart = null;
        this.insightsStream = [];
        this.dataSources = [];
        this.isStreamPaused = false;
        this.correlationThreshold = 0.7;

        this.init();
    }

    init() {
        this.initializeCharts();
        this.initializeDataSources();
        this.setupEventListeners();
        this.startRealTimeUpdates();
        this.initializeInsightsStream();
    }

    initializeCharts() {
        // Network Overview Chart
        const networkCtx = document.getElementById('networkChart').getContext('2d');
        this.networkChart = new Chart(networkCtx, {
            type: 'doughnut',
            data: {
                labels: ['Active Nodes', 'Inactive Nodes', 'Maintenance'],
                datasets: [{
                    data: [24, 3, 2],
                    backgroundColor: [
                        '#10b981',
                        '#ef4444',
                        '#f59e0b'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#cbd5e1',
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });

        // Correlation Matrix Chart
        const correlationCtx = document.getElementById('correlationChart').getContext('2d');
        this.correlationChart = new Chart(correlationCtx, {
            type: 'matrix',
            data: this.generateCorrelationData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `Correlation: ${context.parsed.v.toFixed(2)}`
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#cbd5e1',
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        ticks: {
                            color: '#cbd5e1',
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        });

        // Health Chart
        const healthCtx = document.getElementById('healthChart').getContext('2d');
        this.healthChart = new Chart(healthCtx, {
            type: 'line',
            data: {
                labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                datasets: [{
                    label: 'System Health',
                    data: this.generateHealthData(),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#cbd5e1'
                        },
                        grid: {
                            color: '#334155'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#cbd5e1'
                        },
                        grid: {
                            color: '#334155'
                        }
                    }
                }
            }
        });
    }

    generateCorrelationData() {
        const sources = ['API-1', 'DB-1', 'Sensor-1', 'Log-1', 'Social-1', 'Market-1'];
        const data = [];

        sources.forEach((source, i) => {
            sources.forEach((target, j) => {
                const correlation = i === j ? 1 : Math.random() * 0.8 + 0.2;
                data.push({
                    x: source,
                    y: target,
                    v: correlation
                });
            });
        });

        return {
            datasets: [{
                label: 'Correlation Matrix',
                data: data,
                backgroundColor: (context) => {
                    const value = context.parsed.v;
                    if (value >= 0.8) return '#ef4444';
                    if (value >= 0.5) return '#f59e0b';
                    if (value >= 0.2) return '#3b82f6';
                    return '#64748b';
                },
                borderWidth: 1,
                borderColor: '#334155',
                width: 30,
                height: 30
            }]
        };
    }

    generateHealthData() {
        return Array.from({length: 24}, () => Math.random() * 20 + 80);
    }

    initializeDataSources() {
        this.dataSources = [
            {
                id: 1,
                name: 'Weather API',
                type: 'api',
                url: 'https://api.weather.com/v1',
                status: 'active',
                lastUpdate: new Date(),
                updateFrequency: '5min'
            },
            {
                id: 2,
                name: 'User Database',
                type: 'database',
                url: 'postgresql://localhost:5432/users',
                status: 'active',
                lastUpdate: new Date(),
                updateFrequency: '1min'
            },
            {
                id: 3,
                name: 'IoT Sensors',
                type: 'sensor',
                url: 'mqtt://sensors.local:1883',
                status: 'active',
                lastUpdate: new Date(),
                updateFrequency: 'realtime'
            },
            {
                id: 4,
                name: 'System Logs',
                type: 'log',
                url: '/var/log/system.log',
                status: 'warning',
                lastUpdate: new Date(),
                updateFrequency: '1min'
            },
            {
                id: 5,
                name: 'Social Media Feed',
                type: 'social',
                url: 'https://api.twitter.com/v2',
                status: 'active',
                lastUpdate: new Date(),
                updateFrequency: '15min'
            }
        ];

        this.renderDataSources();
    }

    renderDataSources() {
        const container = document.getElementById('sourcesList');
        container.innerHTML = '';

        this.dataSources.forEach(source => {
            const sourceElement = this.createSourceElement(source);
            container.appendChild(sourceElement);
        });
    }

    createSourceElement(source) {
        const element = document.createElement('div');
        element.className = 'source-item';

        const statusClass = source.status === 'active' ? 'success' :
                           source.status === 'warning' ? 'warning' : 'error';

        element.innerHTML = `
            <div class="source-info">
                <div class="source-icon">
                    <i data-lucide="${this.getSourceIcon(source.type)}"></i>
                </div>
                <div class="source-details">
                    <h4>${source.name}</h4>
                    <p>${source.type.toUpperCase()} • ${source.updateFrequency}</p>
                </div>
            </div>
            <div class="source-status">
                <span class="status-badge ${statusClass}">${source.status}</span>
            </div>
        `;

        return element;
    }

    getSourceIcon(type) {
        const icons = {
            api: 'globe',
            database: 'database',
            sensor: 'radio',
            log: 'file-text',
            social: 'users',
            market: 'trending-up'
        };
        return icons[type] || 'circle';
    }

    setupEventListeners() {
        // Network refresh
        document.getElementById('refreshNetwork').addEventListener('click', () => {
            this.refreshNetworkData();
        });

        // Add source button
        document.getElementById('addSource').addEventListener('click', () => {
            this.openSourceModal();
        });

        // Correlation threshold slider
        document.getElementById('correlationThreshold').addEventListener('input', (e) => {
            this.correlationThreshold = parseFloat(e.target.value);
            document.getElementById('correlationValue').textContent = this.correlationThreshold.toFixed(1);
            this.updateCorrelations();
        });

        // Aggregation mode change
        document.getElementById('aggregationMode').addEventListener('change', (e) => {
            this.updateAggregationMode(e.target.value);
        });

        // Stream controls
        document.getElementById('clearStream').addEventListener('click', () => {
            this.clearInsightsStream();
        });

        document.getElementById('pauseStream').addEventListener('click', (e) => {
            this.toggleStreamPause(e.target);
        });

        // Run diagnostics
        document.getElementById('runDiagnostics').addEventListener('click', () => {
            this.runDiagnostics();
        });

        // FAB button
        document.getElementById('fabButton').addEventListener('click', () => {
            this.toggleFabMenu();
        });

        // FAB menu items
        document.querySelectorAll('.fab-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleFabAction(e.currentTarget.dataset.action);
            });
        });

        // Modal
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('sourceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewSource();
        });

        // Click outside modal to close
        document.getElementById('sourceModal').addEventListener('click', (e) => {
            if (e.target.id === 'sourceModal') {
                this.closeModal();
            }
        });
    }

    refreshNetworkData() {
        // Simulate network refresh
        const activeNodes = Math.floor(Math.random() * 5) + 20;
        const inactiveNodes = Math.floor(Math.random() * 3) + 1;
        const maintenanceNodes = Math.floor(Math.random() * 2) + 1;

        document.getElementById('activeNodes').textContent = activeNodes;
        document.getElementById('dataSources').textContent = Math.floor(Math.random() * 5) + 15;
        document.getElementById('insightsGenerated').textContent = (parseInt(document.getElementById('insightsGenerated').textContent.replace(',', '')) + Math.floor(Math.random() * 50)).toLocaleString();
        document.getElementById('networkLatency').textContent = `${Math.floor(Math.random() * 20) + 30}ms`;

        this.networkChart.data.datasets[0].data = [activeNodes, inactiveNodes, maintenanceNodes];
        this.networkChart.update();

        this.showNotification('Network data refreshed successfully', 'success');
    }

    openSourceModal() {
        document.getElementById('sourceModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('sourceModal').classList.remove('active');
        document.getElementById('sourceForm').reset();
    }

    addNewSource() {
        const formData = new FormData(document.getElementById('sourceForm'));
        const newSource = {
            id: Date.now(),
            name: formData.get('sourceName'),
            type: formData.get('sourceType'),
            url: formData.get('sourceUrl'),
            status: 'active',
            lastUpdate: new Date(),
            updateFrequency: formData.get('updateFrequency')
        };

        this.dataSources.push(newSource);
        this.renderDataSources();
        this.closeModal();
        this.showNotification(`Data source "${newSource.name}" added successfully`, 'success');
    }

    updateCorrelations() {
        // Update correlation chart based on threshold
        this.correlationChart.update();
        this.showNotification('Correlations updated', 'info');
    }

    updateAggregationMode(mode) {
        // Update aggregation mode
        this.showNotification(`Aggregation mode changed to ${mode}`, 'info');
    }

    initializeInsightsStream() {
        // Initialize with some sample insights
        const sampleInsights = [
            {
                id: 1,
                title: 'Anomaly Detected',
                content: 'Unusual traffic pattern detected from API endpoint /users',
                priority: 'high',
                timestamp: new Date(Date.now() - 300000)
            },
            {
                id: 2,
                title: 'Correlation Found',
                content: 'Strong correlation between user activity and system load (0.85)',
                priority: 'medium',
                timestamp: new Date(Date.now() - 600000)
            },
            {
                id: 3,
                title: 'Data Source Offline',
                content: 'Weather API endpoint temporarily unavailable',
                priority: 'critical',
                timestamp: new Date(Date.now() - 900000)
            }
        ];

        this.insightsStream = sampleInsights;
        this.renderInsightsStream();
    }

    renderInsightsStream() {
        const container = document.getElementById('insightsStream');
        container.innerHTML = '';

        this.insightsStream.slice(-20).forEach(insight => {
            const insightElement = this.createInsightElement(insight);
            container.appendChild(insightElement);
        });

        container.scrollTop = container.scrollHeight;
    }

    createInsightElement(insight) {
        const element = document.createElement('div');
        element.className = `stream-item ${insight.priority}`;

        const timeAgo = this.getTimeAgo(insight.timestamp);

        element.innerHTML = `
            <i data-lucide="${this.getInsightIcon(insight.priority)}" class="stream-icon"></i>
            <div class="stream-content">
                <div class="stream-title">${insight.title}</div>
                <div class="stream-text">${insight.content}</div>
                <div class="stream-time">${timeAgo}</div>
            </div>
        `;

        return element;
    }

    getInsightIcon(priority) {
        const icons = {
            critical: 'alert-triangle',
            high: 'alert-circle',
            medium: 'info',
            low: 'check-circle'
        };
        return icons[priority] || 'info';
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    }

    clearInsightsStream() {
        this.insightsStream = [];
        this.renderInsightsStream();
        this.showNotification('Insights stream cleared', 'info');
    }

    toggleStreamPause(button) {
        this.isStreamPaused = !this.isStreamPaused;
        button.innerHTML = this.isStreamPaused ?
            '<i data-lucide="play" class="btn-icon"></i>Pause' :
            '<i data-lucide="pause" class="btn-icon"></i>Pause';
        this.showNotification(`Stream ${this.isStreamPaused ? 'paused' : 'resumed'}`, 'info');
    }

    runDiagnostics() {
        // Simulate diagnostics
        this.showNotification('Running system diagnostics...', 'info');

        setTimeout(() => {
            const healthScore = Math.floor(Math.random() * 10) + 90;
            this.showNotification(`Diagnostics complete. System health: ${healthScore}%`, 'success');
        }, 2000);
    }

    toggleFabMenu() {
        const menu = document.getElementById('fabMenu');
        menu.classList.toggle('active');
    }

    handleFabAction(action) {
        switch (action) {
            case 'export-data':
                this.exportData();
                break;
            case 'generate-report':
                this.generateReport();
                break;
            case 'network-config':
                this.showNetworkConfig();
                break;
        }
        this.toggleFabMenu();
    }

    exportData() {
        const data = {
            networkStats: {
                activeNodes: document.getElementById('activeNodes').textContent,
                dataSources: document.getElementById('dataSources').textContent,
                insightsGenerated: document.getElementById('insightsGenerated').textContent,
                networkLatency: document.getElementById('networkLatency').textContent
            },
            dataSources: this.dataSources,
            insights: this.insightsStream,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `federated-insights-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Data exported successfully', 'success');
    }

    generateReport() {
        this.showNotification('Generating comprehensive report...', 'info');

        setTimeout(() => {
            this.showNotification('Report generated and downloaded', 'success');
        }, 1500);
    }

    showNetworkConfig() {
        this.showNotification('Network configuration panel opened', 'info');
    }

    startRealTimeUpdates() {
        // Update network stats every 30 seconds
        setInterval(() => {
            if (!this.isStreamPaused) {
                this.updateNetworkStats();
                this.addRandomInsight();
            }
        }, 30000);

        // Update health metrics every 60 seconds
        setInterval(() => {
            this.updateHealthMetrics();
        }, 60000);
    }

    updateNetworkStats() {
        const latency = Math.floor(Math.random() * 20) + 30;
        document.getElementById('networkLatency').textContent = `${latency}ms`;
    }

    updateHealthMetrics() {
        const uptime = (99.7 + (Math.random() - 0.5) * 0.2).toFixed(1);
        const integrity = (98.4 + (Math.random() - 0.5) * 0.4).toFixed(1);
        const response = Math.floor(Math.random() * 10) + 40;
        const throughput = Math.floor(Math.random() * 200) + 2200;

        document.getElementById('uptimeMetric').textContent = `${uptime}%`;
        document.getElementById('integrityMetric').textContent = `${integrity}%`;
        document.getElementById('responseMetric').textContent = `${response}ms`;
        document.getElementById('throughputMetric').textContent = `${throughput}`;

        // Update progress bars
        document.querySelector('.uptime-fill').style.width = `${uptime}%`;
        document.querySelector('.integrity-fill').style.width = `${integrity}%`;
        document.querySelector('.response-fill').style.width = `${Math.min(response * 2.5, 100)}%`;
        document.querySelector('.throughput-fill').style.width = `${Math.min(throughput / 25, 100)}%`;
    }

    addRandomInsight() {
        const insights = [
            {
                title: 'Performance Spike',
                content: 'System performance increased by 15% in the last 5 minutes',
                priority: 'low'
            },
            {
                title: 'New Correlation',
                content: 'Discovered correlation between user engagement and data processing speed',
                priority: 'medium'
            },
            {
                title: 'Resource Alert',
                content: 'Memory usage approaching 85% threshold on node-7',
                priority: 'high'
            },
            {
                title: 'Data Quality Issue',
                content: 'Inconsistent data format detected in social media feed',
                priority: 'medium'
            },
            {
                title: 'Network Congestion',
                content: 'High latency detected between data centers',
                priority: 'critical'
            }
        ];

        const randomInsight = insights[Math.floor(Math.random() * insights.length)];
        const insight = {
            id: Date.now(),
            ...randomInsight,
            timestamp: new Date()
        };

        this.insightsStream.push(insight);
        this.renderInsightsStream();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i data-lucide="${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info'
        };
        return icons[type] || 'info';
    }
}

// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // Initialize the application
    new FederatedInsightAggregationNetwork();
});

// Add notification styles dynamically
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    color: var(--text-primary);
    font-size: 0.875rem;
    z-index: 3000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
}

.notification.show {
    transform: translateX(0);
}

.notification-success {
    border-left: 4px solid var(--success-color);
}

.notification-error {
    border-left: 4px solid var(--error-color);
}

.notification-warning {
    border-left: 4px solid var(--warning-color);
}

.notification-info {
    border-left: 4px solid var(--primary-color);
}

.notification i {
    width: 1.25rem;
    height: 1.25rem;
}

.notification-success i { color: var(--success-color); }
.notification-error i { color: var(--error-color); }
.notification-warning i { color: var(--warning-color); }
.notification-info i { color: var(--primary-color); }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);