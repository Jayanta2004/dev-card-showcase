/**
 * Dependency Health Auditor
 * 
 * Monitors the operational health of third-party and internal service dependencies
 * through periodic health probes, response-time benchmarking, and anomaly scoring.
 */

class DependencyHealthAuditor {
    constructor() {
        this.dependencies = [];
        this.probeInterval = 30000; // 30 seconds
        this.isRunning = false;
        this.probeTimer = null;
        this.healthHistory = [];
        this.anomalies = [];
        this.metrics = {
            totalProbes: 0,
            failedProbes: 0,
            responseTimes: [],
            anomalyScores: []
        };

        // Load default dependencies
        this.loadDefaultDependencies();
        this.initializeCharts();
    }

    /**
     * Load default dependencies to monitor
     */
    loadDefaultDependencies() {
        this.dependencies = [
            { 
                id: 'api-gateway',
                name: 'API Gateway',
                type: 'service',
                endpoint: 'https://api.example.com/health',
                timeout: 5000,
                expectedResponseTime: 200,
                status: 'unknown',
                lastProbeTime: null,
                responseTime: null,
                consecutiveFailures: 0,
                healthScore: 100,
                anomalyScore: 0,
                uptime: 100
            },
            { 
                id: 'db-primary',
                name: 'Primary Database',
                type: 'database',
                endpoint: 'db.internal:5432',
                timeout: 3000,
                expectedResponseTime: 150,
                status: 'unknown',
                lastProbeTime: null,
                responseTime: null,
                consecutiveFailures: 0,
                healthScore: 100,
                anomalyScore: 0,
                uptime: 100
            },
            { 
                id: 'cache-redis',
                name: 'Redis Cache',
                type: 'cache',
                endpoint: 'cache.internal:6379',
                timeout: 2000,
                expectedResponseTime: 50,
                status: 'unknown',
                lastProbeTime: null,
                responseTime: null,
                consecutiveFailures: 0,
                healthScore: 100,
                anomalyScore: 0,
                uptime: 100
            },
            { 
                id: 'auth-service',
                name: 'Authentication Service',
                type: 'service',
                endpoint: 'https://auth.example.com/health',
                timeout: 4000,
                expectedResponseTime: 300,
                status: 'unknown',
                lastProbeTime: null,
                responseTime: null,
                consecutiveFailures: 0,
                healthScore: 100,
                anomalyScore: 0,
                uptime: 100
            },
            { 
                id: 'messaging-queue',
                name: 'Message Queue',
                type: 'infrastructure',
                endpoint: 'queue.internal:5672',
                timeout: 3000,
                expectedResponseTime: 100,
                status: 'unknown',
                lastProbeTime: null,
                responseTime: null,
                consecutiveFailures: 0,
                healthScore: 100,
                anomalyScore: 0,
                uptime: 100
            },
            { 
                id: 'search-engine',
                name: 'Search Engine',
                type: 'service',
                endpoint: 'https://search.example.com/health',
                timeout: 5000,
                expectedResponseTime: 400,
                status: 'unknown',
                lastProbeTime: null,
                responseTime: null,
                consecutiveFailures: 0,
                healthScore: 100,
                anomalyScore: 0,
                uptime: 100
            }
        ];
    }

    /**
     * Start the health audit process
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        document.getElementById('startAudit').disabled = true;
        document.getElementById('stopAudit').disabled = false;

        // Initial probe immediately
        this.runProbes();

        // Schedule periodic probes
        this.probeTimer = setInterval(() => this.runProbes(), this.probeInterval);
        
        console.log('🟢 Dependency Health Auditor started');
    }

    /**
     * Stop the health audit process
     */
    stop() {
        if (!this.isRunning) return;

        this.isRunning = false;
        clearInterval(this.probeTimer);
        
        document.getElementById('startAudit').disabled = false;
        document.getElementById('stopAudit').disabled = true;
        
        console.log('🔴 Dependency Health Auditor stopped');
    }

    /**
     * Clear all collected data
     */
    clearData() {
        this.healthHistory = [];
        this.anomalies = [];
        this.metrics = {
            totalProbes: 0,
            failedProbes: 0,
            responseTimes: [],
            anomalyScores: []
        };

        this.dependencies.forEach(dep => {
            dep.consecutiveFailures = 0;
            dep.responseTime = null;
            dep.lastProbeTime = null;
        });

        this.updateUI();
        console.log('🧹 Data cleared');
    }

    /**
     * Run health probes for all dependencies
     */
    async runProbes() {
        const probeTime = new Date();
        const probeResults = [];

        for (const dependency of this.dependencies) {
            try {
                const result = await this.probeService(dependency);
                probeResults.push({ dependency, result });
            } catch (error) {
                probeResults.push({ dependency, result: { success: false, error: error.message } });
            }
        }

        // Process results
        this.processProbeResults(probeResults, probeTime);
        
        // Check for anomalies
        this.detectAnomalies();
        
        // Update UI
        this.updateUI();
    }

    /**
     * Probe a single service endpoint
     */
    async probeService(dependency) {
        const startTime = performance.now();
        
        try {
            // Simulate network probe with realistic delays and occasional failures
            await this.simulateProbe(dependency);
            
            const endTime = performance.now();
            const responseTime = endTime - startTime;

            return {
                success: true,
                responseTime: responseTime,
                statusCode: 200,
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                timestamp: new Date()
            };
        }
    }

    /**
     * Simulate a network probe (in production, this would make real HTTP/TCP requests)
     */
    async simulateProbe(dependency) {
        // Simulate network latency
        const baseLatency = Math.random() * 100 + 50;
        const variance = Math.random() * 50 - 25;
        const randomness = Math.random();

        // Simulate occasional failures (5% failure rate)
        if (randomness < 0.05) {
            throw new Error('Connection timeout');
        }

        // Simulate slow responses
        if (randomness < 0.15) {
            return new Promise(resolve => 
                setTimeout(resolve, baseLatency + variance + 300)
            );
        }

        // Normal response
        return new Promise(resolve => 
            setTimeout(resolve, baseLatency + variance)
        );
    }

    /**
     * Process probe results and update dependency status
     */
    processProbeResults(results, probeTime) {
        results.forEach(({ dependency, result }) => {
            this.metrics.totalProbes++;

            if (result.success) {
                dependency.status = 'healthy';
                dependency.responseTime = result.responseTime;
                dependency.lastProbeTime = probeTime;
                dependency.consecutiveFailures = 0;

                // Track response time
                this.metrics.responseTimes.push(result.responseTime);
                
                // Calculate health score
                this.updateHealthScore(dependency);
            } else {
                this.metrics.failedProbes++;
                dependency.consecutiveFailures++;
                dependency.lastProbeTime = probeTime;

                // Determine status based on consecutive failures
                if (dependency.consecutiveFailures >= 3) {
                    dependency.status = 'critical';
                    dependency.healthScore = Math.max(0, dependency.healthScore - 25);
                } else {
                    dependency.status = 'warning';
                    dependency.healthScore = Math.max(0, dependency.healthScore - 10);
                }
            }
        });

        // Store historical data
        this.recordHealthHistory();
    }

    /**
     * Update health score for a dependency
     */
    updateHealthScore(dependency) {
        let score = 100;

        // Deduct points for slow response times
        if (dependency.responseTime > dependency.expectedResponseTime * 2) {
            score -= 15;
        } else if (dependency.responseTime > dependency.expectedResponseTime * 1.5) {
            score -= 8;
        }

        // Recover score gradually when healthy
        if (dependency.consecutiveFailures === 0 && dependency.healthScore < 100) {
            score = Math.min(100, dependency.healthScore + 5);
        }

        dependency.healthScore = Math.max(0, Math.floor(score));
        
        // Calculate uptime
        const successRate = (this.metrics.totalProbes - this.metrics.failedProbes) / this.metrics.totalProbes;
        dependency.uptime = Math.round(successRate * 100);
    }

    /**
     * Detect anomalies in dependency behavior
     */
    detectAnomalies() {
        this.anomalies = [];

        for (const dependency of this.dependencies) {
            const anomalyScore = this.calculateAnomalyScore(dependency);
            dependency.anomalyScore = anomalyScore;
            this.metrics.anomalyScores.push(anomalyScore);

            // Check for specific anomaly conditions
            if (dependency.status === 'critical') {
                this.addAnomaly({
                    type: 'SERVICE_UNAVAILABLE',
                    dependency: dependency.name,
                    severity: 'critical',
                    message: `Service is unavailable (${dependency.consecutiveFailures} consecutive failures)`,
                    timestamp: new Date(),
                    detailsCount: dependency.consecutiveFailures
                });
            }

            if (dependency.responseTime && dependency.responseTime > dependency.expectedResponseTime * 2.5) {
                this.addAnomaly({
                    type: 'RESPONSE_TIME_SPIKE',
                    dependency: dependency.name,
                    severity: 'warning',
                    message: `Response time spike detected: ${Math.round(dependency.responseTime)}ms (expected ${dependency.expectedResponseTime}ms)`,
                    timestamp: new Date(),
                    detailsCount: Math.round(dependency.responseTime - dependency.expectedResponseTime)
                });
            }

            if (dependency.healthScore < 50) {
                this.addAnomaly({
                    type: 'HEALTH_DEGRADATION',
                    dependency: dependency.name,
                    severity: dependency.healthScore < 30 ? 'critical' : 'warning',
                    message: `Health score degraded to ${dependency.healthScore}%`,
                    timestamp: new Date(),
                    detailsCount: dependency.healthScore
                });
            }
        }

        // Remove duplicate anomalies
        this.anomalies = this.anomalies.filter((anomaly, index, self) =>
            index === self.findIndex(a => 
                a.type === anomaly.type && 
                a.dependency === anomaly.dependency &&
                (new Date().getTime() - new Date(a.timestamp).getTime()) < 60000
            )
        );

        // Keep only recent anomalies (last 10)
        this.anomalies = this.anomalies.slice(-10);
    }

    /**
     * Calculate anomaly score for a dependency (0-100)
     */
    calculateAnomalyScore(dependency) {
        let score = 0;

        // Factor 1: Failure rate
        if (this.metrics.totalProbes > 0) {
            const failureRate = this.metrics.failedProbes / this.metrics.totalProbes;
            score += failureRate * 40;
        }

        // Factor 2: Response time deviation
        if (dependency.responseTime) {
            const deviation = (dependency.responseTime - dependency.expectedResponseTime) / dependency.expectedResponseTime;
            score += Math.min(30, Math.max(0, deviation * 20));
        }

        // Factor 3: Health score
        const healthCondition = (100 - dependency.healthScore) / 100;
        score += healthCondition * 30;

        return Math.min(100, Math.round(score));
    }

    /**
     * Add an anomaly record
     */
    addAnomaly(anomaly) {
        // Avoid duplicates
        const exists = this.anomalies.some(a => 
            a.type === anomaly.type && 
            a.dependency === anomaly.dependency
        );

        if (!exists) {
            this.anomalies.unshift(anomaly);
        }
    }

    /**
     * Record health history for timeline
     */
    recordHealthHistory() {
        const healthSnapshot = {
            timestamp: new Date(),
            average: this.getAverageHealthScore(),
            critical: this.dependencies.filter(d => d.status === 'critical').length,
            warning: this.dependencies.filter(d => d.status === 'warning').length,
            healthy: this.dependencies.filter(d => d.status === 'healthy').length
        };

        this.healthHistory.push(healthSnapshot);

        // Keep only last 100 records
        if (this.healthHistory.length > 100) {
            this.healthHistory.shift();
        }
    }

    /**
     * Get average health score across all dependencies
     */
    getAverageHealthScore() {
        if (this.dependencies.length === 0) return 0;
        const sum = this.dependencies.reduce((acc, dep) => acc + dep.healthScore, 0);
        return Math.round(sum / this.dependencies.length);
    }

    /**
     * Update the UI with current data
     */
    updateUI() {
        this.updateSummaryCards();
        this.updateDependenciesList();
        this.updateAnomaliesList();
        this.updateMetrics();
        this.updateCharts();
        this.updateFooter();
    }

    /**
     * Update summary cards
     */
    updateSummaryCards() {
        const healthyCount = this.dependencies.filter(d => d.status === 'healthy').length;
        const warningCount = this.dependencies.filter(d => d.status === 'warning').length;
        const criticalCount = this.dependencies.filter(d => d.status === 'critical').length;

        document.getElementById('totalDeps').textContent = this.dependencies.length;
        document.getElementById('healthyCount').textContent = healthyCount;
        document.getElementById('warningCount').textContent = warningCount;
        document.getElementById('criticalCount').textContent = criticalCount;
    }

    /**
     * Update dependencies list view
     */
    updateDependenciesList() {
        const container = document.getElementById('dependenciesList');
        
        if (this.dependencies.length === 0) {
            container.innerHTML = '<div class="placeholder">No dependencies configured.</div>';
            return;
        }

        container.innerHTML = this.dependencies.map(dep => `
            <div class="dependency-item ${dep.status}">
                <div class="dependency-header">
                    <div class="dependency-name">
                        ${this.getStatusIcon(dep.status)}
                        <span>${dep.name}</span>
                    </div>
                    <div class="dependency-details">
                        <div class="detail-item">
                            <span class="detail-label">Endpoint</span>
                            <span class="detail-value">${dep.endpoint}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Response Time</span>
                            <span class="detail-value">${dep.responseTime ? Math.round(dep.responseTime) + 'ms' : '--'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Health Score</span>
                            <span class="detail-value">${dep.healthScore}%</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Uptime</span>
                            <span class="detail-value">${dep.uptime}%</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Anomaly Score</span>
                            <span class="detail-value">${dep.anomalyScore}</span>
                        </div>
                    </div>
                </div>
                <div class="dependency-actions">
                    <button class="action-btn">Details</button>
                    <button class="action-btn">Probe</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update anomalies list view
     */
    updateAnomaliesList() {
        const container = document.getElementById('anomaliesList');

        if (this.anomalies.length === 0) {
            container.innerHTML = '<div class="placeholder">No anomalies detected.</div>';
            return;
        }

        container.innerHTML = this.anomalies.map(anomaly => `
            <div class="anomaly-item">
                <div class="anomaly-header">
                    <div class="anomaly-title">
                        <strong>${anomaly.type}</strong> - ${anomaly.dependency}
                    </div>
                    <span class="anomaly-severity">${anomaly.severity}</span>
                </div>
                <div class="anomaly-details">
                    <p><strong>Message:</strong> ${anomaly.message}</p>
                    <p><strong>Detected:</strong> ${anomaly.timestamp.toLocaleTimeString()}</p>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update metrics display
     */
    updateMetrics() {
        const avgResponseTime = this.metrics.responseTimes.length > 0
            ? Math.round(this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length)
            : 0;

        const systemUptime = this.metrics.totalProbes > 0
            ? Math.round(((this.metrics.totalProbes - this.metrics.failedProbes) / this.metrics.totalProbes) * 100)
            : 100;

        const globalAnomaly = this.metrics.anomalyScores.length > 0
            ? Math.round(this.metrics.anomalyScores.reduce((a, b) => a + b, 0) / this.metrics.anomalyScores.length)
            : 0;

        document.getElementById('avgResponseTime').textContent = avgResponseTime;
        document.getElementById('systemUptime').textContent = systemUptime;
        document.getElementById('globalAnomaly').textContent = globalAnomaly;
        document.getElementById('failedProbes').textContent = this.metrics.failedProbes;
    }

    /**
     * Update footer timestamp
     */
    updateFooter() {
        const now = new Date();
        document.getElementById('lastUpdate').textContent = now.toLocaleTimeString();
        document.getElementById('probeInterval').textContent = (this.probeInterval / 1000);
    }

    /**
     * Initialize charts
     */
    initializeCharts() {
        // Check if canvas exists and set up contexts
        this.healthChartCtx = document.getElementById('healthChart')?.getContext('2d');
        this.responseTimeChartCtx = document.getElementById('responseTimeChart')?.getContext('2d');
        this.healthScoreChartCtx = document.getElementById('healthScoreChart')?.getContext('2d');
    }

    /**
     * Update charts with current data
     */
    updateCharts() {
        if (!this.healthChartCtx) return;

        // Health Timeline Chart
        this.drawHealthTimeline();

        // Response Time Distribution Chart
        this.drawResponseTimeChart();

        // Health Score Chart
        this.drawHealthScoreChart();
    }

    /**
     * Draw health timeline chart
     */
    drawHealthTimeline() {
        const ctx = this.healthChartCtx;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const padding = 40;
        const width = ctx.canvas.width - 2 * padding;
        const height = ctx.canvas.height - 2 * padding;

        const data = this.healthHistory.slice(-20);
        if (data.length === 0) return;

        const maxValue = 100;
        const pointSpacing = width / (data.length - 1 || 1);

        // Draw background grid
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
        ctx.beginPath();
        for (let i = 0; i <= 4; i++) {
            const y = padding + (height / 4) * i;
            ctx.moveTo(padding, y);
            ctx.lineTo(ctx.canvas.width - padding, y);
        }
        ctx.stroke();

        // Draw health line
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        data.forEach((point, index) => {
            const x = padding + index * pointSpacing;
            const y = padding + height - (point.average / maxValue) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw points
        ctx.fillStyle = '#10b981';
        data.forEach((point, index) => {
            const x = padding + index * pointSpacing;
            const y = padding + height - (point.average / maxValue) * height;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        // Y-axis labels
        for (let i = 0; i <= 4; i++) {
            const value = (4 - i) * 25;
            const y = padding + (height / 4) * i;
            ctx.fillText(value + '%', padding - 20, y + 4);
        }

        // X-axis labels
        if (data.length > 0) {
            const firstTime = data[0].timestamp;
            const lastTime = data[data.length - 1].timestamp;
            ctx.textAlign = 'left';
            ctx.fillText(firstTime.toLocaleTimeString(), padding, ctx.canvas.height - 10);
            ctx.textAlign = 'right';
            ctx.fillText(lastTime.toLocaleTimeString(), ctx.canvas.width - padding, ctx.canvas.height - 10);
        }
    }

    /**
     * Draw response time distribution chart
     */
    drawResponseTimeChart() {
        const ctx = this.responseTimeChartCtx;
        if (!ctx) return;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const data = this.metrics.responseTimes;
        if (data.length === 0) {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px Arial';
            ctx.fillText('No data available', ctx.canvas.width / 2 - 50, ctx.canvas.height / 2);
            return;
        }

        // Create histogram
        const bins = 10;
        const min = Math.min(...data);
        const max = Math.max(...data);
        const binSize = (max - min) / bins || 1;

        const histogram = Array(bins).fill(0);
        data.forEach(value => {
            const binIndex = Math.min(bins - 1, Math.floor((value - min) / binSize));
            histogram[binIndex]++;
        });

        // Draw bars
        const padding = 40;
        const width = ctx.canvas.width - 2 * padding;
        const height = ctx.canvas.height - 2 * padding;
        const barWidth = width / bins;
        const maxCount = Math.max(...histogram);

        ctx.fillStyle = '#6366f1';
        histogram.forEach((count, index) => {
            const x = padding + index * barWidth;
            const barHeight = (count / maxCount) * height;
            const y = ctx.canvas.height - padding - barHeight;

            ctx.fillRect(x, y, barWidth - 2, barHeight);
        });

        // Draw axes
        ctx.strokeStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(padding, ctx.canvas.height - padding);
        ctx.lineTo(ctx.canvas.width - padding, ctx.canvas.height - padding);
        ctx.stroke();
    }

    /**
     * Draw health score chart
     */
    drawHealthScoreChart() {
        const ctx = this.healthScoreChartCtx;
        if (!ctx) return;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const data = this.dependencies;
        if (data.length === 0) return;

        // Draw pie chart
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;
        const radius = Math.min(ctx.canvas.width, ctx.canvas.height) / 3;

        const colors = {
            'healthy': '#10b981',
            'warning': '#f59e0b',
            'critical': '#ef4444',
            'unknown': '#94a3b8'
        };

        const counts = {};
        Object.keys(colors).forEach(key => {
            counts[key] = data.filter(d => d.status === key).length;
        });

        let currentAngle = 0;
        Object.entries(counts).forEach(([status, count]) => {
            if (count === 0) return;

            const sliceAngle = (count / data.length) * Math.PI * 2;
            
            // Draw slice
            ctx.fillStyle = colors[status];
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.lineTo(centerX, centerY);
            ctx.fill();

            currentAngle += sliceAngle;
        });

        // Draw legend
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        
        let legendY = 20;
        Object.entries(colors).forEach(([status, color]) => {
            const count = counts[status];
            if (count === 0) return;

            ctx.fillStyle = color;
            ctx.fillRect(10, legendY, 12, 12);

            ctx.fillStyle = '#e2e8f0';
            ctx.fillText(`${status}: ${count}`, 30, legendY + 10);

            legendY += 20;
        });
    }

    /**
     * Get status icon
     */
    getStatusIcon(status) {
        const icons = {
            'healthy': '✅',
            'warning': '⚠️',
            'critical': '🚨',
            'unknown': '❓'
        };
        return `<span class="dependency-status-badge status-${status}">${icons[status]}</span>`;
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DependencyHealthAuditor;
}
