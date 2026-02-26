/**
 * Predictive Service Degradation Forecaster
 * Anticipates gradual service degradation before complete failure
 * Monitors performance indicators and predicts instability
 */

class PredictiveDegradationForecaster {
    constructor() {
        this.services = this.initializeServices();
        this.alerts = [];
        this.metrics = {
            servicesCount: 0,
            alertsCount: 0,
            failuresPredicted: 0,
            preventedFailures: 0
        };
        this.baselineMetrics = {
            latency: 200,
            errorRate: 0.01,
            throughput: 100,
            memoryUsage: 0.6,
            cpuUsage: 0.4
        };
        this.degradationThresholds = {
            latency: { warning: 1.5, critical: 2.5 },
            errorRate: { warning: 0.05, critical: 0.15 },
            memoryUsage: { warning: 0.8, critical: 0.95 },
            cpuUsage: { warning: 0.7, critical: 0.9 }
        };
        this.predictionWindow = 3600000; // 1 hour in milliseconds
        this.monitoringInterval = null;
        this.isMonitoring = false;
        this.init();
    }

    /**
     * Initialize the forecaster
     */
    init() {
        this.setupEventListeners();
        this.simulateInitialData();
    }

    /**
     * Initialize sample services with different health states
     */
    initializeServices() {
        const services = [];
        const serviceTypes = ['api', 'database', 'cache', 'queue', 'auth', 'storage', 'compute'];
        const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'];

        for (let i = 1; i <= 8; i++) {
            const type = serviceTypes[(i - 1) % serviceTypes.length];
            const region = regions[(i - 1) % regions.length];
            const healthState = this.generateInitialHealth(type);

            services.push({
                id: `service_${i}`,
                name: `${type.charAt(0).toUpperCase() + type.slice(1)} Service ${i}`,
                type: type,
                region: region,
                endpoint: `https://${type}-${i}.${region}.example.com`,
                status: healthState.status,
                healthScore: healthState.healthScore,
                metrics: this.generateServiceMetrics(healthState.status),
                history: this.generateHistoricalData(healthState.status),
                predictions: this.generatePredictions(healthState.status),
                lastUpdated: new Date(),
                alerts: [],
                mitigationActions: []
            });
        }

        return services;
    }

    /**
     * Generate initial health state for a service
     */
    generateInitialHealth(type) {
        const healthStates = ['healthy', 'degrading', 'critical', 'failed'];
        const weights = type === 'database' ? [0.3, 0.4, 0.2, 0.1] :
                      type === 'cache' ? [0.5, 0.3, 0.15, 0.05] :
                      [0.6, 0.25, 0.1, 0.05];

        const random = Math.random();
        let cumulative = 0;
        let status = 'healthy';

        for (let i = 0; i < healthStates.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                status = healthStates[i];
                break;
            }
        }

        const healthScores = {
            healthy: 95 + Math.random() * 5,
            degrading: 60 + Math.random() * 20,
            critical: 20 + Math.random() * 30,
            failed: Math.random() * 20
        };

        return {
            status: status,
            healthScore: healthScores[status]
        };
    }

    /**
     * Generate current metrics for a service
     */
    generateServiceMetrics(status) {
        const baseMetrics = {
            latency: this.baselineMetrics.latency,
            errorRate: this.baselineMetrics.errorRate,
            throughput: this.baselineMetrics.throughput,
            memoryUsage: this.baselineMetrics.memoryUsage,
            cpuUsage: this.baselineMetrics.cpuUsage,
            responseTime: this.baselineMetrics.latency,
            uptime: 0.999
        };

        const multipliers = {
            healthy: { latency: 1, errorRate: 0.5, throughput: 1, memory: 0.8, cpu: 0.7 },
            degrading: { latency: 1.8, errorRate: 3, throughput: 0.8, memory: 0.9, cpu: 0.85 },
            critical: { latency: 3.5, errorRate: 8, throughput: 0.5, memory: 0.95, cpu: 0.95 },
            failed: { latency: 10, errorRate: 50, throughput: 0.1, memory: 0.99, cpu: 0.99 }
        };

        const mult = multipliers[status];
        return {
            latency: baseMetrics.latency * mult.latency + (Math.random() - 0.5) * 50,
            errorRate: (baseMetrics.errorRate * mult.errorRate) + (Math.random() - 0.5) * 0.01,
            throughput: baseMetrics.throughput * mult.throughput + (Math.random() - 0.5) * 20,
            memoryUsage: mult.memory + (Math.random() - 0.5) * 0.1,
            cpuUsage: mult.cpu + (Math.random() - 0.5) * 0.1,
            responseTime: baseMetrics.responseTime * mult.latency + (Math.random() - 0.5) * 30,
            uptime: status === 'failed' ? Math.random() * 0.5 : 0.99 + Math.random() * 0.01
        };
    }

    /**
     * Generate historical data for trend analysis
     */
    generateHistoricalData(status) {
        const history = [];
        const hours = 24;

        for (let i = hours; i >= 0; i--) {
            const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
            const ageMultiplier = 1 - (i / hours) * 0.3; // Services degrade over time

            const baseMetrics = this.baselineMetrics;
            const multipliers = {
                healthy: { latency: 1 * ageMultiplier, errorRate: 0.5, throughput: 1 },
                degrading: { latency: 1.8 * ageMultiplier, errorRate: 3 * ageMultiplier, throughput: 0.8 },
                critical: { latency: 3.5 * ageMultiplier, errorRate: 8 * ageMultiplier, throughput: 0.5 },
                failed: { latency: 10, errorRate: 50, throughput: 0.1 }
            };

            const mult = multipliers[status];
            history.push({
                timestamp: timestamp,
                latency: baseMetrics.latency * mult.latency + (Math.random() - 0.5) * 30,
                errorRate: Math.max(0, baseMetrics.errorRate * mult.errorRate + (Math.random() - 0.5) * 0.005),
                throughput: Math.max(0, baseMetrics.throughput * mult.throughput + (Math.random() - 0.5) * 15),
                memoryUsage: Math.min(1, 0.6 + (Math.random() - 0.5) * 0.2),
                cpuUsage: Math.min(1, 0.4 + (Math.random() - 0.5) * 0.2)
            });
        }

        return history;
    }

    /**
     * Generate degradation predictions
     */
    generatePredictions(status) {
        const predictions = {
            shortTerm: { risk: 'low', confidence: 0.9, timeToFailure: null },
            mediumTerm: { risk: 'low', confidence: 0.8, timeToFailure: null },
            longTerm: { risk: 'low', confidence: 0.7, timeToFailure: null }
        };

        const riskLevels = {
            healthy: { short: 'low', medium: 'low', long: 'medium' },
            degrading: { short: 'medium', medium: 'high', long: 'critical' },
            critical: { short: 'high', medium: 'critical', long: 'failed' },
            failed: { short: 'critical', medium: 'failed', long: 'failed' }
        };

        const risks = riskLevels[status];
        predictions.shortTerm.risk = risks.short;
        predictions.mediumTerm.risk = risks.medium;
        predictions.longTerm.risk = risks.long;

        // Calculate time to failure for degrading/critical services
        if (status === 'degrading' || status === 'critical') {
            const degradationRate = status === 'critical' ? 0.1 : 0.05;
            const timeToFailure = Math.random() * 24 * 60 * 60 * 1000; // 0-24 hours
            predictions.mediumTerm.timeToFailure = timeToFailure;
        }

        return predictions;
    }

    /**
     * Calculate degradation trend using linear regression
     */
    calculateTrend(data, key) {
        if (data.length < 2) return { slope: 0, intercept: 0, r2: 0 };

        const n = data.length;
        const sumX = data.reduce((sum, d, i) => sum + i, 0);
        const sumY = data.reduce((sum, d) => sum + d[key], 0);
        const sumXY = data.reduce((sum, d, i) => sum + i * d[key], 0);
        const sumXX = data.reduce((sum, d, i) => sum + i * i, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Calculate R-squared
        const yMean = sumY / n;
        const ssRes = data.reduce((sum, d, i) => {
            const predicted = slope * i + intercept;
            return sum + Math.pow(d[key] - predicted, 2);
        }, 0);
        const ssTot = data.reduce((sum, d) => sum + Math.pow(d[key] - yMean, 2), 0);
        const r2 = 1 - (ssRes / ssTot);

        return { slope, intercept, r2 };
    }

    /**
     * Calculate degradation acceleration (second derivative)
     */
    calculateAcceleration(history, key) {
        if (history.length < 3) return 0;

        const recent = history.slice(-10); // Last 10 data points
        const trends = [];

        // Calculate slopes for sliding windows
        for (let i = 0; i < recent.length - 2; i++) {
            const window = recent.slice(i, i + 3);
            const trend = this.calculateTrend(window, key);
            trends.push(trend.slope);
        }

        if (trends.length < 2) return 0;

        // Calculate acceleration as change in slope
        const recentSlope = trends[trends.length - 1];
        const previousSlope = trends[trends.length - 2];
        return recentSlope - previousSlope;
    }

    /**
     * Predict service failure based on trends
     */
    predictFailure(service) {
        const history = service.history;
        if (history.length < 10) return null;

        const recent = history.slice(-6); // Last 6 hours

        // Calculate trends for key metrics
        const latencyTrend = this.calculateTrend(recent, 'latency');
        const errorTrend = this.calculateTrend(recent, 'errorRate');
        const throughputTrend = this.calculateTrend(recent, 'throughput');

        // Calculate accelerations
        const latencyAccel = this.calculateAcceleration(history, 'latency');
        const errorAccel = this.calculateAcceleration(history, 'errorRate');

        // Risk scoring based on trends and accelerations
        let riskScore = 0;

        // Latency degradation
        if (latencyTrend.slope > 10) riskScore += 30; // Rapid latency increase
        if (latencyAccel > 5) riskScore += 20; // Accelerating latency degradation

        // Error rate increase
        if (errorTrend.slope > 0.001) riskScore += 25; // Rising error rate
        if (errorAccel > 0.0005) riskScore += 20; // Accelerating error increase

        // Throughput decline
        if (throughputTrend.slope < -5) riskScore += 20; // Declining throughput

        // Current health state
        const healthPenalty = {
            healthy: 0,
            degrading: 15,
            critical: 35,
            failed: 50
        };
        riskScore += healthPenalty[service.status];

        // Predict time to failure
        let timeToFailure = null;
        if (riskScore > 40) {
            // Estimate time based on current degradation rate
            const avgDegradationRate = (latencyTrend.slope + errorTrend.slope * 1000) / 2;
            if (avgDegradationRate > 0) {
                const thresholdDistance = Math.max(0, 100 - service.healthScore);
                timeToFailure = (thresholdDistance / avgDegradationRate) * 3600000; // Convert to milliseconds
            }
        }

        return {
            riskScore: Math.min(100, riskScore),
            timeToFailure: timeToFailure,
            confidence: Math.min(0.95, 0.5 + riskScore / 200),
            primaryFactors: this.identifyRiskFactors(service, latencyTrend, errorTrend, throughputTrend)
        };
    }

    /**
     * Identify primary risk factors
     */
    identifyRiskFactors(service, latencyTrend, errorTrend, throughputTrend) {
        const factors = [];

        if (latencyTrend.slope > 10) {
            factors.push('Latency degradation');
        }
        if (errorTrend.slope > 0.001) {
            factors.push('Error rate increase');
        }
        if (throughputTrend.slope < -5) {
            factors.push('Throughput decline');
        }
        if (service.metrics.memoryUsage > 0.8) {
            factors.push('High memory usage');
        }
        if (service.metrics.cpuUsage > 0.7) {
            factors.push('High CPU usage');
        }

        return factors;
    }

    /**
     * Generate alert for service degradation
     */
    generateAlert(service, alertType, severity, message) {
        const alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            serviceId: service.id,
            serviceName: service.name,
            type: alertType,
            severity: severity,
            message: message,
            timestamp: new Date(),
            acknowledged: false,
            resolved: false,
            recommendations: this.generateRecommendations(service, alertType)
        };

        this.alerts.unshift(alert);
        service.alerts.unshift(alert);

        // Keep only recent alerts
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(0, 100);
        }

        return alert;
    }

    /**
     * Generate recommendations for alerts
     */
    generateRecommendations(service, alertType) {
        const recommendations = {
            latency: [
                'Scale up compute resources',
                'Optimize database queries',
                'Implement response caching',
                'Review network configuration'
            ],
            errors: [
                'Check error logs for patterns',
                'Review recent code deployments',
                'Validate input data quality',
                'Monitor external dependencies'
            ],
            memory: [
                'Increase memory allocation',
                'Optimize memory usage patterns',
                'Implement memory leak detection',
                'Consider horizontal scaling'
            ],
            cpu: [
                'Scale compute resources',
                'Optimize CPU-intensive operations',
                'Review background processes',
                'Implement load balancing'
            ],
            throughput: [
                'Scale service instances',
                'Optimize request processing',
                'Implement request queuing',
                'Review rate limiting policies'
            ]
        };

        return recommendations[alertType] || ['Monitor service closely', 'Review system metrics'];
    }

    /**
     * Update service health and predictions
     */
    updateServiceHealth(service) {
        // Update current metrics
        service.metrics = this.generateServiceMetrics(service.status);
        service.lastUpdated = new Date();

        // Add to history
        service.history.push({
            timestamp: new Date(),
            latency: service.metrics.latency,
            errorRate: service.metrics.errorRate,
            throughput: service.metrics.throughput,
            memoryUsage: service.metrics.memoryUsage,
            cpuUsage: service.metrics.cpuUsage
        });

        // Keep history manageable
        if (service.history.length > 168) { // 7 days of hourly data
            service.history = service.history.slice(-168);
        }

        // Update predictions
        service.predictions = this.generatePredictions(service.status);

        // Check for alerts
        this.checkServiceAlerts(service);

        // Update health score
        service.healthScore = this.calculateHealthScore(service);
    }

    /**
     * Calculate overall health score for a service
     */
    calculateHealthScore(service) {
        const metrics = service.metrics;
        let score = 100;

        // Latency penalty
        const latencyRatio = metrics.latency / this.baselineMetrics.latency;
        if (latencyRatio > 1) {
            score -= Math.min(30, (latencyRatio - 1) * 10);
        }

        // Error rate penalty
        if (metrics.errorRate > this.baselineMetrics.errorRate) {
            score -= Math.min(25, metrics.errorRate * 1000);
        }

        // Throughput penalty
        const throughputRatio = metrics.throughput / this.baselineMetrics.throughput;
        if (throughputRatio < 1) {
            score -= Math.min(20, (1 - throughputRatio) * 20);
        }

        // Resource usage penalties
        if (metrics.memoryUsage > 0.8) {
            score -= Math.min(15, (metrics.memoryUsage - 0.8) * 75);
        }
        if (metrics.cpuUsage > 0.7) {
            score -= Math.min(10, (metrics.cpuUsage - 0.7) * 50);
        }

        return Math.max(0, Math.round(score));
    }

    /**
     * Check for service alerts
     */
    checkServiceAlerts(service) {
        const metrics = service.metrics;
        const thresholds = this.degradationThresholds;

        // Latency alerts
        if (metrics.latency > this.baselineMetrics.latency * thresholds.latency.critical) {
            this.generateAlert(service, 'latency', 'critical', `Critical latency spike: ${metrics.latency.toFixed(0)}ms`);
        } else if (metrics.latency > this.baselineMetrics.latency * thresholds.latency.warning) {
            this.generateAlert(service, 'latency', 'warning', `High latency detected: ${metrics.latency.toFixed(0)}ms`);
        }

        // Error rate alerts
        if (metrics.errorRate > thresholds.errorRate.critical) {
            this.generateAlert(service, 'errors', 'critical', `Critical error rate: ${(metrics.errorRate * 100).toFixed(2)}%`);
        } else if (metrics.errorRate > thresholds.errorRate.warning) {
            this.generateAlert(service, 'errors', 'warning', `Elevated error rate: ${(metrics.errorRate * 100).toFixed(2)}%`);
        }

        // Memory alerts
        if (metrics.memoryUsage > thresholds.memoryUsage.critical) {
            this.generateAlert(service, 'memory', 'critical', `Critical memory usage: ${(metrics.memoryUsage * 100).toFixed(1)}%`);
        } else if (metrics.memoryUsage > thresholds.memoryUsage.warning) {
            this.generateAlert(service, 'memory', 'warning', `High memory usage: ${(metrics.memoryUsage * 100).toFixed(1)}%`);
        }

        // CPU alerts
        if (metrics.cpuUsage > thresholds.cpuUsage.critical) {
            this.generateAlert(service, 'cpu', 'critical', `Critical CPU usage: ${(metrics.cpuUsage * 100).toFixed(1)}%`);
        } else if (metrics.cpuUsage > thresholds.cpuUsage.warning) {
            this.generateAlert(service, 'cpu', 'warning', `High CPU usage: ${(metrics.cpuUsage * 100).toFixed(1)}%`);
        }

        // Failure prediction alerts
        const prediction = this.predictFailure(service);
        if (prediction && prediction.riskScore > 60) {
            const timeStr = prediction.timeToFailure ?
                `Estimated ${Math.round(prediction.timeToFailure / 3600000)} hours to failure` : '';
            this.generateAlert(service, 'prediction', 'warning',
                `High failure risk detected (Score: ${prediction.riskScore}). ${timeStr}`);
        }
    }

    /**
     * Toggle monitoring on/off
     */
    toggleMonitoring() {
        if (this.isMonitoring) {
            if (this.monitoringInterval) {
                clearInterval(this.monitoringInterval);
            }
            this.isMonitoring = false;
            this.showNotification('Monitoring stopped');
        } else {
            this.startMonitoring();
            this.isMonitoring = true;
            this.showNotification('Monitoring started');
        }
        this.render();
    }

    /**
     * Start monitoring services
     */
    startMonitoring() {
        this.monitoringInterval = setInterval(() => {
            this.services.forEach(service => this.updateServiceHealth(service));
            this.updateMetrics();
            this.render();
        }, 5000); // Update every 5 seconds
    }

    /**
     * Simulate service degradation
     */
    simulateDegradation() {
        const degradingServices = this.services.filter(s => s.status !== 'failed');

        degradingServices.forEach(service => {
            // Simulate gradual degradation
            const degradationFactor = 0.05 + Math.random() * 0.1;

            service.metrics.latency *= (1 + degradationFactor);
            service.metrics.errorRate = Math.min(0.5, service.metrics.errorRate + degradationFactor * 0.01);
            service.metrics.throughput *= (1 - degradationFactor * 0.5);
            service.metrics.memoryUsage = Math.min(1, service.metrics.memoryUsage + degradationFactor * 0.1);
            service.metrics.cpuUsage = Math.min(1, service.metrics.cpuUsage + degradationFactor * 0.1);

            // Update status based on degradation
            if (service.metrics.errorRate > 0.15 || service.metrics.latency > 1000) {
                service.status = 'critical';
            } else if (service.metrics.errorRate > 0.05 || service.metrics.latency > 500) {
                service.status = 'degrading';
            }

            this.updateServiceHealth(service);
        });

        this.showNotification('Degradation simulation applied to services');
        this.render();
    }

    /**
     * Generate comprehensive report
     */
    generateReport() {
        const report = {
            timestamp: new Date().toLocaleString(),
            summary: {
                totalServices: this.services.length,
                healthyServices: this.services.filter(s => s.status === 'healthy').length,
                degradingServices: this.services.filter(s => s.status === 'degrading').length,
                criticalServices: this.services.filter(s => s.status === 'critical').length,
                failedServices: this.services.filter(s => s.status === 'failed').length,
                totalAlerts: this.alerts.length,
                unresolvedAlerts: this.alerts.filter(a => !a.resolved).length,
                averageHealthScore: Math.round(this.services.reduce((sum, s) => sum + s.healthScore, 0) / this.services.length)
            },
            topRiskFactors: this.getTopRiskFactors(),
            predictions: this.getPredictionSummary(),
            recommendations: this.generateGlobalRecommendations()
        };

        const csv = `Predictive Degradation Report\n${report.timestamp}\n\n` +
                   `Summary\n` +
                   `Total Services,${report.summary.totalServices}\n` +
                   `Healthy Services,${report.summary.healthyServices}\n` +
                   `Degrading Services,${report.summary.degradingServices}\n` +
                   `Critical Services,${report.summary.criticalServices}\n` +
                   `Failed Services,${report.summary.failedServices}\n` +
                   `Total Alerts,${report.summary.totalAlerts}\n` +
                   `Unresolved Alerts,${report.summary.unresolvedAlerts}\n` +
                   `Average Health Score,${report.summary.averageHealthScore}%\n\n` +
                   `Top Risk Factors\n` +
                   report.topRiskFactors.map(factor => `${factor.factor},${factor.count}`).join('\n') + '\n\n' +
                   `Predictions\n` +
                   report.predictions.map(pred => `${pred.timeframe},${pred.risk},${pred.services}`).join('\n');

        this.downloadFile(csv, 'degradation-report.csv');
        this.showNotification('Report generated and downloaded');
    }

    /**
     * Get top risk factors across all services
     */
    getTopRiskFactors() {
        const factors = {};
        this.services.forEach(service => {
            const prediction = this.predictFailure(service);
            if (prediction && prediction.primaryFactors) {
                prediction.primaryFactors.forEach(factor => {
                    factors[factor] = (factors[factor] || 0) + 1;
                });
            }
        });

        return Object.entries(factors)
            .map(([factor, count]) => ({ factor, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }

    /**
     * Get prediction summary
     */
    getPredictionSummary() {
        const predictions = {
            shortTerm: { low: 0, medium: 0, high: 0, critical: 0 },
            mediumTerm: { low: 0, medium: 0, high: 0, critical: 0 },
            longTerm: { low: 0, medium: 0, high: 0, critical: 0 }
        };

        this.services.forEach(service => {
            const pred = service.predictions;
            predictions.shortTerm[pred.shortTerm.risk]++;
            predictions.mediumTerm[pred.mediumTerm.risk]++;
            predictions.longTerm[pred.longTerm.risk]++;
        });

        return [
            { timeframe: 'Short-term (1-4h)', risk: 'High Risk', services: predictions.shortTerm.high + predictions.shortTerm.critical },
            { timeframe: 'Medium-term (4-24h)', risk: 'High Risk', services: predictions.mediumTerm.high + predictions.mediumTerm.critical },
            { timeframe: 'Long-term (24h+)', risk: 'High Risk', services: predictions.longTerm.high + predictions.longTerm.critical }
        ];
    }

    /**
     * Generate global recommendations
     */
    generateGlobalRecommendations() {
        const recommendations = [];

        const criticalCount = this.services.filter(s => s.status === 'critical').length;
        if (criticalCount > 0) {
            recommendations.push(`${criticalCount} services are in critical condition - immediate attention required`);
        }

        const highRiskPredictions = this.services.filter(s => {
            const pred = this.predictFailure(s);
            return pred && pred.riskScore > 70;
        }).length;

        if (highRiskPredictions > 0) {
            recommendations.push(`${highRiskPredictions} services have high failure risk - proactive scaling recommended`);
        }

        const avgHealth = this.services.reduce((sum, s) => sum + s.healthScore, 0) / this.services.length;
        if (avgHealth < 70) {
            recommendations.push('Overall system health is degraded - consider infrastructure scaling');
        }

        return recommendations;
    }

    /**
     * Handle tab changes
     */
    onTabChange(tabName) {
        if (tabName === 'predictions') {
            this.renderPredictions();
        } else if (tabName === 'trends') {
            this.renderTrends();
        }
    }

    /**
     * Filter services by status
     */
    filterServices(status = 'all') {
        const filtered = status === 'all' ? this.services : this.services.filter(s => s.status === status);
        this.renderServices(filtered);
    }

    /**
     * Filter alerts by criteria
     */
    filterAlerts(severity = 'all', type = 'all', search = '') {
        let filtered = this.alerts;

        if (severity !== 'all') {
            filtered = filtered.filter(a => a.severity === severity);
        }

        if (type !== 'all') {
            filtered = filtered.filter(a => a.type === type);
        }

        if (search) {
            filtered = filtered.filter(a =>
                a.message.toLowerCase().includes(search.toLowerCase()) ||
                a.serviceName.toLowerCase().includes(search.toLowerCase())
            );
        }

        this.renderAlerts(filtered);
    }

    /**
     * Show service details in modal
     */
    showServiceDetails(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;

        const modal = document.getElementById('serviceModal');
        const content = modal.querySelector('.modal-content');

        const prediction = this.predictFailure(service);
        const timeToFailure = prediction && prediction.timeToFailure ?
            `${Math.round(prediction.timeToFailure / 3600000)} hours` : 'N/A';

        content.innerHTML = `
            <span class="modal-close" onclick="window.controller.closeModal()">&times;</span>
            <h2>${service.name}</h2>
            <div class="service-details">
                <div class="detail-row">
                    <span class="label">Type</span>
                    <span class="value">${service.type}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Region</span>
                    <span class="value">${service.region}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Status</span>
                    <span class="value">${service.status.toUpperCase()}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Health Score</span>
                    <span class="value">${service.healthScore}%</span>
                </div>
                <div class="detail-row">
                    <span class="label">Current Latency</span>
                    <span class="value">${service.metrics.latency.toFixed(0)}ms</span>
                </div>
                <div class="detail-row">
                    <span class="label">Error Rate</span>
                    <span class="value">${(service.metrics.errorRate * 100).toFixed(2)}%</span>
                </div>
                <div class="detail-row">
                    <span class="label">Throughput</span>
                    <span class="value">${service.metrics.throughput.toFixed(0)} req/sec</span>
                </div>
                <div class="detail-row">
                    <span class="label">Risk Score</span>
                    <span class="value">${prediction ? prediction.riskScore : 0}/100</span>
                </div>
                <div class="detail-row">
                    <span class="label">Est. Time to Failure</span>
                    <span class="value">${timeToFailure}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Active Alerts</span>
                    <span class="value">${service.alerts.filter(a => !a.resolved).length}</span>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="window.controller.mitigateIssue('${service.id}')">Mitigate Issue</button>
                <button class="btn btn-warning" onclick="window.controller.scaleService('${service.id}')">Scale Service</button>
                <button class="btn btn-secondary" onclick="window.controller.closeModal()">Close</button>
            </div>
        `;

        modal.classList.add('show');
    }

    /**
     * Mitigate service issue
     */
    mitigateIssue(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (service) {
            // Simulate mitigation actions
            service.metrics.latency *= 0.8;
            service.metrics.errorRate *= 0.5;
            service.metrics.memoryUsage *= 0.9;
            service.metrics.cpuUsage *= 0.9;

            if (service.status === 'critical') service.status = 'degrading';
            else if (service.status === 'degrading') service.status = 'healthy';

            this.generateAlert(service, 'mitigation', 'info', `Mitigation actions applied to ${service.name}`);
            this.showNotification('Mitigation actions applied');
            this.closeModal();
            this.render();
        }
    }

    /**
     * Scale service
     */
    scaleService(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (service) {
            // Simulate scaling
            service.metrics.throughput *= 1.5;
            service.metrics.latency *= 0.7;
            service.metrics.cpuUsage *= 0.8;
            service.metrics.memoryUsage *= 0.8;

            service.status = 'healthy';
            this.generateAlert(service, 'scaling', 'info', `Service ${service.name} scaled successfully`);
            this.showNotification('Service scaled successfully');
            this.closeModal();
            this.render();
        }
    }

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('serviceModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Service card clicks
        document.addEventListener('click', (e) => {
            const serviceCard = e.target.closest('.service-card');
            if (serviceCard) {
                const serviceId = serviceCard.getAttribute('data-service-id');
                if (serviceId) this.showServiceDetails(serviceId);
            }
        });
    }

    /**
     * Update overall metrics
     */
    updateMetrics() {
        this.metrics.servicesCount = this.services.length;
        this.metrics.alertsCount = this.alerts.filter(a => !a.resolved).length;
        this.metrics.failuresPredicted = this.services.filter(s => {
            const pred = this.predictFailure(s);
            return pred && pred.riskScore > 70;
        }).length;
    }

    /**
     * Simulate initial data
     */
    simulateInitialData() {
        this.services.forEach(service => this.updateServiceHealth(service));
        this.updateMetrics();
    }

    /**
     * Render all UI sections
     */
    render() {
        this.renderDashboard();
        this.renderServices();
        this.renderAlerts();
        this.updateFooter();
    }

    /**
     * Render dashboard
     */
    renderDashboard() {
        // Update overview cards
        document.getElementById('servicesCount').textContent = this.metrics.servicesCount;
        document.getElementById('alertsCount').textContent = this.metrics.alertsCount;
        document.getElementById('failuresPredicted').textContent = this.metrics.failuresPredicted;
        document.getElementById('preventedFailures').textContent = Math.floor(this.metrics.failuresPredicted * 0.3);

        // Update health indicators
        const avgLatency = this.services.reduce((sum, s) => sum + s.metrics.latency, 0) / this.services.length;
        const avgErrorRate = this.services.reduce((sum, s) => sum + s.metrics.errorRate, 0) / this.services.length;
        const avgThroughput = this.services.reduce((sum, s) => sum + s.metrics.throughput, 0) / this.services.length;

        document.getElementById('overallStatus').textContent = this.getOverallStatus();
        document.getElementById('avgResponseTime').textContent = `${avgLatency.toFixed(0)}ms`;
        document.getElementById('errorRate').textContent = `${(avgErrorRate * 100).toFixed(2)}%`;
        document.getElementById('throughput').textContent = `${avgThroughput.toFixed(0)} req/sec`;

        // Update degradation metrics
        const latencyVariance = this.calculateSystemVariance('latency');
        const errorAccel = this.calculateSystemAcceleration('errorRate');
        const avgMemory = this.services.reduce((sum, s) => sum + s.metrics.memoryUsage, 0) / this.services.length;
        const avgCpu = this.services.reduce((sum, s) => sum + s.metrics.cpuUsage, 0) / this.services.length;

        document.getElementById('latencyVariance').textContent = latencyVariance > 50 ? 'High' : latencyVariance > 25 ? 'Medium' : 'Low';
        document.getElementById('errorAcceleration').textContent = errorAccel > 0.001 ? 'Accelerating' : 'Stable';
        document.getElementById('memoryPressure').textContent = avgMemory > 0.8 ? 'High' : avgMemory > 0.6 ? 'Medium' : 'Normal';
        document.getElementById('resourceSaturation').textContent = `${((avgMemory + avgCpu) / 2 * 100).toFixed(0)}%`;

        // Render health chart
        this.renderHealthChart();

        // Render recent events
        this.renderRecentEvents();
    }

    /**
     * Get overall system status
     */
    getOverallStatus() {
        const criticalCount = this.services.filter(s => s.status === 'critical' || s.status === 'failed').length;
        const degradingCount = this.services.filter(s => s.status === 'degrading').length;

        if (criticalCount > 0) return 'Critical';
        if (degradingCount > 2) return 'Degraded';
        if (degradingCount > 0) return 'Warning';
        return 'Healthy';
    }

    /**
     * Calculate system-wide variance for a metric
     */
    calculateSystemVariance(metric) {
        const values = this.services.map(s => s.metrics[metric]);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        return (stdDev / mean) * 100; // Coefficient of variation as percentage
    }

    /**
     * Calculate system-wide acceleration for a metric
     */
    calculateSystemAcceleration(metric) {
        const accelerations = this.services.map(s => this.calculateAcceleration(s.history, metric));
        return accelerations.reduce((a, b) => a + b, 0) / accelerations.length;
    }

    /**
     * Render services section
     */
    renderServices(filtered = null) {
        const services = filtered || this.services;
        const container = document.getElementById('servicesList');

        if (!container) return;

        const html = services.map(service => `
            <div class="service-card ${service.status}" data-service-id="${service.id}">
                <div class="service-header">
                    <div class="service-name">${service.name}</div>
                    <div class="service-status ${service.status}">${service.status.toUpperCase()}</div>
                </div>
                <div class="service-body">
                    <div class="service-metric">
                        <span class="label">Health Score</span>
                        <span class="value">${service.healthScore}%</span>
                    </div>
                    <div class="service-metric">
                        <span class="label">Latency</span>
                        <span class="value">${service.metrics.latency.toFixed(0)}ms</span>
                    </div>
                    <div class="service-metric">
                        <span class="label">Error Rate</span>
                        <span class="value">${(service.metrics.errorRate * 100).toFixed(2)}%</span>
                    </div>
                    <div class="service-metric">
                        <span class="label">Throughput</span>
                        <span class="value">${service.metrics.throughput.toFixed(0)} req/sec</span>
                    </div>
                    <div class="service-metric">
                        <span class="label">Risk Level</span>
                        <span class="value">${this.getRiskLevel(service)}</span>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html || '<div class="placeholder">No services found</div>';
    }

    /**
     * Get risk level for a service
     */
    getRiskLevel(service) {
        const prediction = this.predictFailure(service);
        if (!prediction) return 'Low';

        if (prediction.riskScore > 80) return 'Critical';
        if (prediction.riskScore > 60) return 'High';
        if (prediction.riskScore > 40) return 'Medium';
        return 'Low';
    }

    /**
     * Render predictions section
     */
    renderPredictions() {
        const shortTerm = this.services.filter(s => s.predictions.shortTerm.risk !== 'low').length;
        const mediumTerm = this.services.filter(s => s.predictions.mediumTerm.risk !== 'low').length;
        const longTerm = this.services.filter(s => s.predictions.longTerm.risk !== 'low').length;

        document.getElementById('shortTermPredictions').textContent = `${shortTerm} services at risk`;
        document.getElementById('mediumTermPredictions').textContent = `${mediumTerm} services at risk`;
        document.getElementById('longTermPredictions').textContent = `${longTerm} services at risk`;

        // Risk factors
        const factors = this.getTopRiskFactors();
        document.getElementById('riskFactors').textContent = factors.map(f => `${f.factor} (${f.count})`).join(', ');

        // Trend analysis
        const degrading = this.services.filter(s => s.status === 'degrading').length;
        const critical = this.services.filter(s => s.status === 'critical').length;
        document.getElementById('trendAnalysis').textContent =
            `${degrading} services degrading, ${critical} critical. System showing ${this.calculateSystemAcceleration('latency') > 0 ? 'accelerating' : 'stable'} degradation.`;

        // Recommendations
        const recommendations = this.generateGlobalRecommendations();
        document.getElementById('recommendedActions').textContent = recommendations.join('. ');

        this.renderPredictionChart();
    }

    /**
     * Render trends section
     */
    renderTrends() {
        const metricType = document.getElementById('metricType')?.value || 'latency';
        const timeRange = document.getElementById('timeRange')?.value || '24h';

        document.getElementById('trendChartTitle').textContent = `Performance Trends - ${metricType.toUpperCase()}`;

        // Statistical analysis
        const stats = this.calculateTrendStatistics(metricType, timeRange);
        document.getElementById('statisticalAnalysis').textContent =
            `Mean: ${stats.mean.toFixed(2)}, Std Dev: ${stats.stdDev.toFixed(2)}, Trend: ${stats.trend > 0 ? 'Increasing' : 'Decreasing'} (${stats.trend.toFixed(4)}/hour)`;

        // Pattern recognition
        const patterns = this.identifyPatterns(metricType, timeRange);
        document.getElementById('patternRecognition').textContent = patterns.join(', ');

        // Performance insights
        const insights = this.generateInsights(metricType, stats);
        document.getElementById('performanceInsights').textContent = insights.join('. ');

        this.renderTrendChart(metricType, timeRange);
    }

    /**
     * Render alerts section
     */
    renderAlerts(filtered = null) {
        const alerts = filtered || this.alerts.slice(0, 50); // Show recent 50
        const container = document.getElementById('alertList');

        if (!container) return;

        const html = alerts.map(alert => `
            <div class="alert-item ${alert.severity} ${alert.resolved ? 'resolved' : ''}">
                <div class="alert-header">
                    <span class="alert-type">${alert.type.toUpperCase()}</span>
                    <span class="alert-time">${alert.timestamp.toLocaleTimeString()}</span>
                </div>
                <div class="alert-message">${alert.message}</div>
            </div>
        `).join('');

        container.innerHTML = html || '<div class="placeholder">No alerts generated</div>';
    }

    /**
     * Render recent events in dashboard
     */
    renderRecentEvents() {
        const container = document.getElementById('recentEvents');
        if (!container) return;

        const recent = this.alerts.slice(0, 5);
        const html = recent.map(alert => `
            <div class="activity-item ${alert.type}">
                <div class="activity-header">
                    <span class="activity-title">${alert.type.toUpperCase()}</span>
                    <span class="activity-time">${alert.timestamp.toLocaleTimeString()}</span>
                </div>
                <div class="activity-description">${alert.message}</div>
            </div>
        `).join('');

        container.innerHTML = html || '<div class="placeholder">No recent events</div>';
    }

    /**
     * Update footer
     */
    updateFooter() {
        document.getElementById('footerStatus').textContent = this.getOverallStatus();
        document.getElementById('footerServices').textContent = this.metrics.servicesCount;
        document.getElementById('footerAlerts').textContent = this.metrics.alertsCount;
        document.getElementById('footerPredictions').textContent = this.metrics.failuresPredicted;
    }

    /**
     * Render health chart
     */
    renderHealthChart() {
        const canvas = document.getElementById('healthChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.clientWidth || 800;
        const height = canvas.clientHeight || 300;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Get health scores over time (last 24 hours)
        const healthData = [];
        for (let i = 23; i >= 0; i--) {
            const hour = new Date(Date.now() - i * 60 * 60 * 1000);
            const avgHealth = this.services.reduce((sum, s) => {
                const historical = s.history.filter(h => h.timestamp <= hour);
                return sum + (historical.length > 0 ? historical[historical.length - 1].latency : s.metrics.latency);
            }, 0) / this.services.length;

            healthData.push(avgHealth);
        }

        const maxHealth = Math.max(...healthData, 1000);
        const padding = 40;
        const graphWidth = width - 2 * padding;
        const graphHeight = height - 2 * padding;

        // Draw grid
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (i * graphHeight / 5);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Draw data
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 3;
        ctx.beginPath();

        healthData.forEach((health, i) => {
            const x = padding + (i * graphWidth / (healthData.length - 1));
            const y = height - padding - (health / maxHealth * graphHeight);

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.stroke();

        // Labels
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        for (let i = 0; i < healthData.length; i += 6) {
            const x = padding + (i * graphWidth / (healthData.length - 1));
            ctx.fillText(`${24 - i}h`, x, height - 10);
        }
    }

    /**
     * Render prediction chart
     */
    renderPredictionChart() {
        const canvas = document.getElementById('predictionChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.clientWidth || 800;
        const height = canvas.clientHeight || 300;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        const predictions = this.getPredictionSummary();
        const data = predictions.map(p => p.services);
        const maxValue = Math.max(...data, 1);

        const barWidth = (width - 80) / data.length;
        const padding = 40;

        data.forEach((value, i) => {
            const x = padding + i * barWidth;
            const barHeight = (value / maxValue) * (height - 2 * padding);
            const y = height - padding - barHeight;

            // Draw bar
            ctx.fillStyle = ['#10b981', '#f97316', '#ef4444'][i];
            ctx.fillRect(x + 5, y, barWidth - 10, barHeight);

            // Draw label
            ctx.fillStyle = '#e2e8f0';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(predictions[i].timeframe.split(' ')[0], x + barWidth / 2, height - 10);
            ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
        });
    }

    /**
     * Render trend chart
     */
    renderTrendChart(metricType = 'latency', timeRange = '24h') {
        const canvas = document.getElementById('trendChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.clientWidth || 800;
        const height = canvas.clientHeight || 300;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Get trend data
        const hours = timeRange === '1h' ? 1 : timeRange === '6h' ? 6 : 24;
        const data = [];

        for (let i = hours - 1; i >= 0; i--) {
            const time = new Date(Date.now() - i * 60 * 60 * 1000);
            const avgValue = this.services.reduce((sum, s) => {
                const historical = s.history.filter(h => {
                    const diff = Math.abs(h.timestamp - time);
                    return diff < 30 * 60 * 1000; // Within 30 minutes
                });
                const value = historical.length > 0 ? historical[0][metricType] : s.metrics[metricType];
                return sum + value;
            }, 0) / this.services.length;

            data.push(avgValue);
        }

        const maxValue = Math.max(...data);
        const minValue = Math.min(...data);
        const range = maxValue - minValue || 1;

        const padding = 40;
        const graphWidth = width - 2 * padding;
        const graphHeight = height - 2 * padding;

        // Draw data line
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((value, i) => {
            const x = padding + (i * graphWidth / (data.length - 1));
            const y = height - padding - ((value - minValue) / range * graphHeight);

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.stroke();
    }

    /**
     * Calculate trend statistics
     */
    calculateTrendStatistics(metricType, timeRange) {
        const hours = timeRange === '1h' ? 1 : timeRange === '6h' ? 6 : 24;
        const data = [];

        for (let i = 0; i < hours; i++) {
            const time = new Date(Date.now() - i * 60 * 60 * 1000);
            const avgValue = this.services.reduce((sum, s) => {
                const historical = s.history.filter(h => {
                    const diff = Math.abs(h.timestamp - time);
                    return diff < 30 * 60 * 1000;
                });
                return sum + (historical.length > 0 ? historical[0][metricType] : s.metrics[metricType]);
            }, 0) / this.services.length;

            data.push(avgValue);
        }

        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
        const stdDev = Math.sqrt(variance);

        const trend = this.calculateTrend(data.map((val, i) => ({ [metricType]: val })), metricType);

        return { mean, stdDev, trend: trend.slope };
    }

    /**
     * Identify patterns in data
     */
    identifyPatterns(metricType, timeRange) {
        const stats = this.calculateTrendStatistics(metricType, timeRange);
        const patterns = [];

        if (Math.abs(stats.trend) > 1) {
            patterns.push(stats.trend > 0 ? 'Increasing trend' : 'Decreasing trend');
        } else {
            patterns.push('Stable trend');
        }

        if (stats.stdDev / stats.mean > 0.2) {
            patterns.push('High variability');
        } else {
            patterns.push('Low variability');
        }

        return patterns;
    }

    /**
     * Generate performance insights
     */
    generateInsights(metricType, stats) {
        const insights = [];

        if (stats.trend > 0) {
            insights.push(`${metricType} is trending upward - monitor closely`);
        } else if (stats.trend < 0) {
            insights.push(`${metricType} is improving over time`);
        }

        if (stats.stdDev / stats.mean > 0.3) {
            insights.push(`High ${metricType} variability indicates instability`);
        }

        return insights;
    }

    /**
     * Download file
     */
    downloadFile(content, filename) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    /**
     * Show notification
     */
    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    /**
     * Initialize the controller
     */
    initialize() {
        this.render();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.controller = new PredictiveDegradationForecaster();
});