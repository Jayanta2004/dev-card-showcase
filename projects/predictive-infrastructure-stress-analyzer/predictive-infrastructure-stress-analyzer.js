// predictive-infrastructure-stress-analyzer.js

class PredictiveStressAnalyzer {
    constructor() {
        this.isMonitoring = false;
        this.monitoringInterval = null;
        this.metricsHistory = {
            cpu: [],
            memory: [],
            network: [],
            disk: [],
            responseTime: [],
            errorRate: []
        };
        this.predictionHorizon = 1; // hours
        this.predictionModel = 'arima';
        this.anomalyAlgorithm = 'isolation-forest';
        this.sensitivity = 0.7;
        this.alerts = [];
        this.anomalies = [];
        this.scalingHistory = [];
        this.configuration = this.getDefaultConfiguration();
        this.charts = {};
        this.lastUpdate = new Date();

        this.init();
    }

    init() {
        this.loadConfiguration();
        this.setupEventListeners();
        this.initializeCharts();
        this.generateHistoricalData();
        this.updateUI();
        this.showNotification('Analyzer initialized', 'info');
    }

    loadConfiguration() {
        const saved = localStorage.getItem('stressAnalyzerConfig');
        if (saved) {
            this.configuration = { ...this.configuration, ...JSON.parse(saved) };
        }
    }

    saveConfiguration() {
        localStorage.setItem('stressAnalyzerConfig', JSON.stringify(this.configuration));
    }

    getDefaultConfiguration() {
        return {
            seasonalPeriod: 24,
            trainingWindow: 7,
            confidenceInterval: 0.95,
            cpuThreshold: 80,
            memoryThreshold: 85,
            responseTimeThreshold: 1000,
            scaleUpThreshold: 70,
            scaleDownThreshold: 30,
            cooldownPeriod: 300
        };
    }

    setupEventListeners() {
        // Configuration modal
        document.getElementById('predictionHorizon').addEventListener('change', (e) => {
            this.predictionHorizon = parseInt(e.target.value);
            this.updatePrediction();
        });

        document.getElementById('predictionModel').addEventListener('change', (e) => {
            this.predictionModel = e.target.value;
            this.updatePrediction();
        });

        document.getElementById('anomalyAlgorithm').addEventListener('change', (e) => {
            this.anomalyAlgorithm = e.target.value;
            this.updateAnomalyDetection();
        });

        document.getElementById('sensitivity').addEventListener('input', (e) => {
            this.sensitivity = parseFloat(e.target.value);
            document.getElementById('sensitivityValue').textContent = this.sensitivity.toFixed(2);
            this.updateAnomalyDetection();
        });

        // Configuration modal inputs
        document.getElementById('confidenceInterval').addEventListener('input', (e) => {
            this.configuration.confidenceInterval = parseFloat(e.target.value);
            document.getElementById('confidenceValue').textContent = (this.configuration.confidenceInterval * 100).toFixed(0) + '%';
        });
    }

    initializeCharts() {
        // Prediction chart
        const predictionCtx = document.getElementById('predictionChart').getContext('2d');
        this.charts.prediction = new Chart(predictionCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Historical CPU Usage',
                    data: [],
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4,
                    fill: false
                }, {
                    label: 'Predicted Usage',
                    data: [],
                    borderColor: '#FF9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: false
                }, {
                    label: 'Upper Bound',
                    data: [],
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderDash: [2, 2],
                    fill: false,
                    pointRadius: 0
                }, {
                    label: 'Lower Bound',
                    data: [],
                    borderColor: '#F44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    borderDash: [2, 2],
                    fill: false,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'hour',
                            displayFormats: {
                                hour: 'HH:mm'
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        });

        // Anomaly chart
        const anomalyCtx = document.getElementById('anomalyChart').getContext('2d');
        this.charts.anomaly = new Chart(anomalyCtx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Normal Data',
                    data: [],
                    backgroundColor: '#4CAF50',
                    pointRadius: 3
                }, {
                    label: 'Anomalies',
                    data: [],
                    backgroundColor: '#F44336',
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'hour'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    generateHistoricalData() {
        const now = new Date();
        const hours = 24;

        for (let i = hours; i >= 0; i--) {
            const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);

            // Generate realistic CPU usage with daily patterns
            const baseLoad = 30 + Math.sin((timestamp.getHours() / 24) * 2 * Math.PI) * 20;
            const noise = (Math.random() - 0.5) * 10;
            const cpuUsage = Math.max(0, Math.min(100, baseLoad + noise));

            this.metricsHistory.cpu.push({
                timestamp,
                value: cpuUsage
            });

            // Generate other metrics
            this.metricsHistory.memory.push({
                timestamp,
                value: Math.max(0, Math.min(100, 50 + Math.sin((timestamp.getHours() / 24) * 2 * Math.PI) * 15 + (Math.random() - 0.5) * 5))
            });

            this.metricsHistory.network.push({
                timestamp,
                value: Math.max(0, Math.min(100, 20 + Math.sin((timestamp.getHours() / 24) * 2 * Math.PI) * 10 + (Math.random() - 0.5) * 8))
            });

            this.metricsHistory.disk.push({
                timestamp,
                value: Math.max(0, Math.min(100, 35 + (Math.random() - 0.5) * 5))
            });

            this.metricsHistory.responseTime.push({
                timestamp,
                value: Math.max(50, 200 + Math.sin((timestamp.getHours() / 24) * 2 * Math.PI) * 100 + (Math.random() - 0.5) * 50)
            });

            this.metricsHistory.errorRate.push({
                timestamp,
                value: Math.max(0, 0.01 + (Math.random() - 0.5) * 0.005)
            });
        }
    }

    startMonitoring() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.showNotification('Real-time monitoring started', 'success');

        this.monitoringInterval = setInterval(() => {
            this.updateMetrics();
            this.updatePrediction();
            this.updateAnomalyDetection();
            this.checkThresholds();
            this.updateUI();
        }, 5000); // Update every 5 seconds

        document.querySelector('.settings-panel button:last-child').innerHTML = '<i class="fas fa-stop"></i> Stop Monitoring';
        document.querySelector('.settings-panel button:last-child').onclick = () => this.stopMonitoring();
    }

    stopMonitoring() {
        if (!this.isMonitoring) return;

        this.isMonitoring = false;
        clearInterval(this.monitoringInterval);
        this.showNotification('Monitoring stopped', 'info');

        document.querySelector('.settings-panel button:last-child').innerHTML = '<i class="fas fa-play"></i> Start Monitoring';
        document.querySelector('.settings-panel button:last-child').onclick = () => this.startMonitoring();
    }

    updateMetrics() {
        const now = new Date();

        // Simulate real-time metric updates
        const cpuUsage = this.simulateMetric('cpu');
        const memoryUsage = this.simulateMetric('memory');
        const networkUsage = this.simulateMetric('network');
        const diskUsage = this.simulateMetric('disk');
        const responseTime = this.simulateMetric('responseTime');
        const errorRate = this.simulateMetric('errorRate');

        // Update current values
        this.updateMetricDisplay('cpuUsage', cpuUsage, 'cpuBar');
        this.updateMetricDisplay('memoryUsage', memoryUsage, 'memoryBar');
        this.updateMetricDisplay('networkUsage', networkUsage, 'networkBar');
        this.updateMetricDisplay('diskUsage', diskUsage, 'diskBar');
        this.updateMetricDisplay('responseTime', responseTime);
        this.updateMetricDisplay('errorRate', errorRate);

        // Add to history
        this.addToHistory('cpu', cpuUsage);
        this.addToHistory('memory', memoryUsage);
        this.addToHistory('network', networkUsage);
        this.addToHistory('disk', diskUsage);
        this.addToHistory('responseTime', responseTime);
        this.addToHistory('errorRate', errorRate);

        this.lastUpdate = now;
    }

    simulateMetric(type) {
        const baseValues = {
            cpu: 45,
            memory: 62,
            network: 28,
            disk: 34,
            responseTime: 245,
            errorRate: 0.02
        };

        const variations = {
            cpu: 15,
            memory: 10,
            network: 12,
            disk: 5,
            responseTime: 50,
            errorRate: 0.01
        };

        const base = baseValues[type];
        const variation = variations[type];
        const timeFactor = Math.sin((new Date().getHours() / 24) * 2 * Math.PI);
        const noise = (Math.random() - 0.5) * variation;

        if (type === 'errorRate') {
            return Math.max(0, base + timeFactor * variation * 0.1 + noise * 0.1);
        }

        return Math.max(0, Math.min(100, base + timeFactor * variation + noise));
    }

    updateMetricDisplay(elementId, value, barId = null) {
        const element = document.getElementById(elementId);
        const formattedValue = elementId.includes('errorRate') ?
            (value * 100).toFixed(2) + '%' :
            elementId.includes('responseTime') ?
                Math.round(value) + 'ms' :
                Math.round(value) + '%';

        element.textContent = formattedValue;

        if (barId) {
            const bar = document.getElementById(barId);
            bar.style.width = Math.min(100, value) + '%';
        }

        // Update trend indicators
        this.updateTrendIndicators();
    }

    updateTrendIndicators() {
        // Simple trend calculation based on recent values
        const updateTrend = (type, elementId) => {
            const history = this.metricsHistory[type];
            if (history.length < 2) return;

            const recent = history.slice(-2);
            const trend = recent[1].value - recent[0].value;
            const trendElement = document.getElementById(elementId);

            if (Math.abs(trend) < 0.1) {
                trendElement.innerHTML = '<i class="fas fa-minus"></i> Stable';
                trendElement.style.color = '#666';
            } else if (trend > 0) {
                trendElement.innerHTML = `<i class="fas fa-arrow-up"></i> +${trend.toFixed(1)}`;
                trendElement.style.color = type === 'errorRate' ? '#F44336' : '#4CAF50';
            } else {
                trendElement.innerHTML = `<i class="fas fa-arrow-down"></i> ${trend.toFixed(1)}`;
                trendElement.style.color = type === 'errorRate' ? '#4CAF50' : '#F44336';
            }
        };

        updateTrend('responseTime', 'responseTrend');
        updateTrend('errorRate', 'errorTrend');
    }

    addToHistory(type, value) {
        const entry = {
            timestamp: new Date(),
            value: value
        };

        this.metricsHistory[type].push(entry);

        // Keep only last 1000 entries
        if (this.metricsHistory[type].length > 1000) {
            this.metricsHistory[type].shift();
        }
    }

    updatePrediction() {
        const historicalData = this.metricsHistory.cpu.slice(-this.configuration.trainingWindow * 24);
        const predictions = this.generatePredictions(historicalData, this.predictionHorizon);

        this.updatePredictionChart(predictions);
        this.updatePredictionInsights(predictions);
    }

    generatePredictions(historicalData, hours) {
        const predictions = [];
        const lastValue = historicalData[historicalData.length - 1].value;

        for (let i = 1; i <= hours * 4; i++) { // 15-minute intervals
            const timestamp = new Date(historicalData[historicalData.length - 1].timestamp.getTime() + i * 15 * 60 * 1000);

            let predictedValue;
            let upperBound;
            let lowerBound;

            switch (this.predictionModel) {
                case 'arima':
                    predictedValue = this.arimaPrediction(historicalData, i);
                    break;
                case 'prophet':
                    predictedValue = this.prophetPrediction(historicalData, i);
                    break;
                case 'lstm':
                    predictedValue = this.lstmPrediction(historicalData, i);
                    break;
                case 'ensemble':
                    predictedValue = this.ensemblePrediction(historicalData, i);
                    break;
                default:
                    predictedValue = lastValue;
            }

            // Add confidence intervals
            const confidenceRange = (1 - this.configuration.confidenceInterval) * 10;
            upperBound = Math.min(100, predictedValue + confidenceRange);
            lowerBound = Math.max(0, predictedValue - confidenceRange);

            predictions.push({
                timestamp,
                value: Math.max(0, Math.min(100, predictedValue)),
                upperBound,
                lowerBound
            });
        }

        return predictions;
    }

    arimaPrediction(historicalData, steps) {
        // Simplified ARIMA-like prediction
        const recent = historicalData.slice(-10);
        const trend = this.calculateTrend(recent);
        const seasonal = this.calculateSeasonal(historicalData);
        const lastValue = recent[recent.length - 1].value;

        return lastValue + trend * steps + seasonal * Math.sin((steps / 4) * 2 * Math.PI);
    }

    prophetPrediction(historicalData, steps) {
        // Simplified Prophet-like prediction with trend and seasonality
        const trend = this.calculateTrend(historicalData.slice(-24));
        const seasonal = this.calculateSeasonal(historicalData);
        const lastValue = historicalData[historicalData.length - 1].value;

        return lastValue + trend * steps + seasonal;
    }

    lstmPrediction(historicalData, steps) {
        // Simplified LSTM-like prediction using exponential smoothing
        const alpha = 0.3;
        let prediction = historicalData[historicalData.length - 1].value;

        for (let i = 0; i < steps; i++) {
            const nextValue = prediction + (Math.random() - 0.5) * 2;
            prediction = alpha * nextValue + (1 - alpha) * prediction;
        }

        return prediction;
    }

    ensemblePrediction(historicalData, steps) {
        const arima = this.arimaPrediction(historicalData, steps);
        const prophet = this.prophetPrediction(historicalData, steps);
        const lstm = this.lstmPrediction(historicalData, steps);

        return (arima + prophet + lstm) / 3;
    }

    calculateTrend(data) {
        if (data.length < 2) return 0;

        const first = data[0].value;
        const last = data[data.length - 1].value;
        const periods = data.length - 1;

        return (last - first) / periods;
    }

    calculateSeasonal(data) {
        if (data.length < 24) return 0;

        const recent = data.slice(-24);
        const hourlyAvg = [];

        for (let hour = 0; hour < 24; hour++) {
            const hourData = recent.filter(d => d.timestamp.getHours() === hour);
            if (hourData.length > 0) {
                hourlyAvg[hour] = hourData.reduce((sum, d) => sum + d.value, 0) / hourData.length;
            }
        }

        const currentHour = new Date().getHours();
        const avgCurrentHour = hourlyAvg[currentHour] || recent[recent.length - 1].value;
        const overallAvg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length;

        return avgCurrentHour - overallAvg;
    }

    updatePredictionChart(predictions) {
        const historical = this.metricsHistory.cpu.slice(-24);
        const labels = [...historical.map(d => d.timestamp), ...predictions.map(p => p.timestamp)];
        const historicalData = historical.map(d => d.value);
        const predictedData = predictions.map(p => p.value);
        const upperBoundData = predictions.map(p => p.upperBound);
        const lowerBoundData = predictions.map(p => p.lowerBound);

        this.charts.prediction.data.labels = labels;
        this.charts.prediction.data.datasets[0].data = historicalData;
        this.charts.prediction.data.datasets[1].data = [...new Array(historicalData.length).fill(null), ...predictedData];
        this.charts.prediction.data.datasets[2].data = [...new Array(historicalData.length).fill(null), ...upperBoundData];
        this.charts.prediction.data.datasets[3].data = [...new Array(historicalData.length).fill(null), ...lowerBoundData];

        this.charts.prediction.update();
    }

    updatePredictionInsights(predictions) {
        if (predictions.length === 0) return;

        const maxPrediction = Math.max(...predictions.map(p => p.value));
        const avgPrediction = predictions.reduce((sum, p) => sum + p.value, 0) / predictions.length;

        // Update peak prediction
        document.getElementById('predictedPeak').textContent = Math.round(maxPrediction) + '%';
        document.getElementById('peakTime').textContent = predictions.find(p => p.value === maxPrediction)?.timestamp.toLocaleTimeString() || 'N/A';

        // Update confidence and risk
        const confidence = Math.round(this.configuration.confidenceInterval * 100);
        document.getElementById('confidenceLevel').textContent = confidence + '%';

        let riskLevel = 'Low';
        if (maxPrediction > 90) riskLevel = 'Critical';
        else if (maxPrediction > 75) riskLevel = 'High';
        else if (maxPrediction > 60) riskLevel = 'Medium';

        document.getElementById('riskAssessment').textContent = riskLevel;

        // Update recommendation
        let recommendation = 'Monitor';
        if (maxPrediction > this.configuration.scaleUpThreshold) {
            recommendation = 'Scale Up';
        } else if (avgPrediction < this.configuration.scaleDownThreshold) {
            recommendation = 'Scale Down';
        }

        document.getElementById('recommendedAction').textContent = recommendation;
    }

    updateAnomalyDetection() {
        const data = this.metricsHistory.cpu.slice(-100);
        const anomalies = this.detectAnomalies(data);

        this.updateAnomalyChart(data, anomalies);
        this.updateAnomalyList(anomalies);
        this.updateAnomalyScore(anomalies);
    }

    detectAnomalies(data) {
        const anomalies = [];

        switch (this.anomalyAlgorithm) {
            case 'isolation-forest':
                return this.isolationForestAnomaly(data);
            case 'one-class-svm':
                return this.oneClassSVMAnomaly(data);
            case 'autoencoder':
                return this.autoencoderAnomaly(data);
            case 'prophet':
                return this.prophetAnomaly(data);
            default:
                return anomalies;
        }
    }

    isolationForestAnomaly(data) {
        // Simplified isolation forest simulation
        const anomalies = [];
        const mean = data.reduce((sum, d) => sum + d.value, 0) / data.length;
        const std = Math.sqrt(data.reduce((sum, d) => sum + Math.pow(d.value - mean, 2), 0) / data.length);

        data.forEach((point, index) => {
            const zScore = Math.abs((point.value - mean) / std);
            if (zScore > 2.5 * this.sensitivity) {
                anomalies.push({
                    index,
                    timestamp: point.timestamp,
                    value: point.value,
                    score: zScore,
                    severity: zScore > 3 ? 'critical' : 'warning'
                });
            }
        });

        return anomalies;
    }

    oneClassSVMAnomaly(data) {
        // Simplified one-class SVM simulation
        return this.isolationForestAnomaly(data); // Using same logic for demo
    }

    autoencoderAnomaly(data) {
        // Simplified autoencoder simulation
        const anomalies = [];
        data.forEach((point, index) => {
            if (index > 0) {
                const reconstructionError = Math.abs(point.value - data[index - 1].value);
                if (reconstructionError > 10 * this.sensitivity) {
                    anomalies.push({
                        index,
                        timestamp: point.timestamp,
                        value: point.value,
                        score: reconstructionError,
                        severity: reconstructionError > 15 ? 'critical' : 'warning'
                    });
                }
            }
        });
        return anomalies;
    }

    prophetAnomaly(data) {
        // Simplified Prophet anomaly detection
        const predictions = this.generatePredictions(data.slice(0, -10), 10);
        const anomalies = [];

        predictions.forEach((pred, index) => {
            const actualIndex = data.length - 10 + index;
            if (actualIndex < data.length) {
                const actual = data[actualIndex].value;
                const error = Math.abs(actual - pred.value);
                if (error > 5 * this.sensitivity) {
                    anomalies.push({
                        index: actualIndex,
                        timestamp: data[actualIndex].timestamp,
                        value: actual,
                        score: error,
                        severity: error > 10 ? 'critical' : 'warning'
                    });
                }
            }
        });

        return anomalies;
    }

    updateAnomalyChart(data, anomalies) {
        const normalData = data.filter((_, index) => !anomalies.some(a => a.index === index));
        const anomalyData = anomalies.map(a => data[a.index]);

        this.charts.anomaly.data.datasets[0].data = normalData.map(d => ({
            x: d.timestamp,
            y: d.value
        }));

        this.charts.anomaly.data.datasets[1].data = anomalyData.map(d => ({
            x: d.timestamp,
            y: d.value
        }));

        this.charts.anomaly.update();
    }

    updateAnomalyList(anomalies) {
        const container = document.getElementById('anomalyList');

        if (anomalies.length === 0) {
            container.innerHTML = '<div class="no-anomalies">No anomalies detected in the last 24 hours</div>';
            return;
        }

        container.innerHTML = anomalies.slice(-5).map(anomaly => `
            <div class="anomaly-item ${anomaly.severity}">
                <strong>Anomaly Detected</strong> at ${anomaly.timestamp.toLocaleString()}
                <br>Value: ${anomaly.value.toFixed(1)}%, Score: ${anomaly.score.toFixed(2)}
            </div>
        `).join('');
    }

    updateAnomalyScore(anomalies) {
        const recentAnomalies = anomalies.filter(a =>
            new Date() - a.timestamp < 24 * 60 * 60 * 1000
        );

        const avgScore = recentAnomalies.length > 0 ?
            recentAnomalies.reduce((sum, a) => sum + a.score, 0) / recentAnomalies.length : 0;

        document.getElementById('anomalyScore').textContent = avgScore.toFixed(2);

        let status = 'Normal';
        if (avgScore > 2) status = 'Warning';
        if (avgScore > 3) status = 'Critical';

        document.getElementById('anomalyStatus').textContent = status;
        document.getElementById('anomalyStatus').className = `anomaly-status ${status.toLowerCase()}`;
    }

    checkThresholds() {
        const cpuUsage = parseFloat(document.getElementById('cpuUsage').textContent);
        const memoryUsage = parseFloat(document.getElementById('memoryUsage').textContent);
        const responseTime = parseFloat(document.getElementById('responseTime').textContent);

        if (cpuUsage > this.configuration.cpuThreshold) {
            this.createAlert('CPU usage exceeded threshold', `CPU at ${cpuUsage}%`, 'warning');
        }

        if (memoryUsage > this.configuration.memoryThreshold) {
            this.createAlert('Memory usage exceeded threshold', `Memory at ${memoryUsage}%`, 'warning');
        }

        if (responseTime > this.configuration.responseTimeThreshold) {
            this.createAlert('Response time exceeded threshold', `Response time at ${responseTime}ms`, 'error');
        }

        this.updateStressLevel();
    }

    updateStressLevel() {
        const cpu = parseFloat(document.getElementById('cpuUsage').textContent);
        const memory = parseFloat(document.getElementById('memoryUsage').textContent);
        const network = parseFloat(document.getElementById('networkUsage').textContent);
        const disk = parseFloat(document.getElementById('diskUsage').textContent);

        const avgUsage = (cpu + memory + network + disk) / 4;

        let stressLevel = 'Low';
        let stressValue = avgUsage;

        if (avgUsage > 80) {
            stressLevel = 'Critical';
        } else if (avgUsage > 60) {
            stressLevel = 'High';
        } else if (avgUsage > 40) {
            stressLevel = 'Medium';
        }

        document.getElementById('currentStress').textContent = stressLevel;
        document.getElementById('stressValue').textContent = Math.round(stressValue) + '%';
        document.getElementById('currentStress').className = `stress-indicator ${stressLevel.toLowerCase()}`;
    }

    createAlert(title, message, type = 'info') {
        const alert = {
            id: Date.now(),
            title,
            message,
            type,
            timestamp: new Date()
        };

        this.alerts.unshift(alert);

        // Keep only last 50 alerts
        if (this.alerts.length > 50) {
            this.alerts.pop();
        }

        this.updateAlertsDisplay();
        this.showNotification(`${title}: ${message}`, type);
    }

    updateAlertsDisplay() {
        const container = document.getElementById('alertsContainer');
        container.innerHTML = this.alerts.slice(0, 10).map(alert => `
            <div class="alert-item ${alert.type}">
                <i class="fas fa-${this.getAlertIcon(alert.type)}"></i>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-time">${this.getTimeAgo(alert.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    getAlertIcon(type) {
        switch (type) {
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minutes ago`;
        if (hours < 24) return `${hours} hours ago`;
        return timestamp.toLocaleDateString();
    }

    updateScalingRecommendations() {
        const cpuUsage = parseFloat(document.getElementById('cpuUsage').textContent);
        const memoryUsage = parseFloat(document.getElementById('memoryUsage').textContent);

        // CPU scaling
        let cpuPriority = 'Low';
        let cpuRecommendation = 'CPU usage is stable. No scaling required.';

        if (cpuUsage > this.configuration.scaleUpThreshold) {
            cpuPriority = 'High';
            cpuRecommendation = `Consider increasing CPU allocation by ${Math.round((cpuUsage - this.configuration.scaleUpThreshold) / 10) * 10}% based on current load.`;
        }

        document.getElementById('cpuPriority').textContent = cpuPriority;
        document.getElementById('cpuRecommendation').textContent = cpuRecommendation;

        // Memory scaling
        let memoryPriority = 'Low';
        let memoryRecommendation = 'Memory usage is stable. No scaling required.';

        if (memoryUsage > this.configuration.scaleUpThreshold) {
            memoryPriority = 'Medium';
            memoryRecommendation = `Memory usage is high. Consider increasing memory allocation.`;
        }

        document.getElementById('memoryPriority').textContent = memoryPriority;
        document.getElementById('memoryRecommendation').textContent = memoryRecommendation;
    }

    applyScaling(resource) {
        const action = `Scaling ${resource} up by 20%`;
        this.scalingHistory.unshift({
            time: new Date().toLocaleTimeString(),
            action,
            result: 'Success'
        });

        if (this.scalingHistory.length > 10) {
            this.scalingHistory.pop();
        }

        this.updateScalingHistory();
        this.createAlert('Auto-scaling', action, 'info');
        this.showNotification(`Scaling applied: ${action}`, 'success');
    }

    dismissRecommendation(resource) {
        this.showNotification(`${resource} scaling recommendation dismissed`, 'info');
    }

    updateScalingHistory() {
        const log = document.getElementById('scalingLog');
        log.innerHTML = this.scalingHistory.map(entry => `
            <div class="log-entry">
                <span class="log-time">${entry.time}</span>
                <span class="log-action">${entry.action}</span>
                <span class="log-result ${entry.result.toLowerCase()}">${entry.result}</span>
            </div>
        `).join('');
    }

    openConfiguration() {
        document.getElementById('configurationModal').style.display = 'flex';
        this.loadConfigurationIntoModal();
    }

    loadConfigurationIntoModal() {
        Object.keys(this.configuration).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'range') {
                    element.value = this.configuration[key];
                    const valueElement = document.getElementById(key.replace('Interval', 'Value'));
                    if (valueElement) {
                        valueElement.textContent = key.includes('Interval') ?
                            (this.configuration[key] * 100).toFixed(0) + '%' :
                            this.configuration[key];
                    }
                } else {
                    element.value = this.configuration[key];
                }
            }
        });
    }

    saveConfigurationFromModal() {
        Object.keys(this.configuration).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                this.configuration[key] = element.type === 'number' ?
                    parseFloat(element.value) : parseInt(element.value);
            }
        });

        this.saveConfiguration();
        document.getElementById('configurationModal').style.display = 'none';
        this.showNotification('Configuration saved', 'success');
    }

    resetToDefaults() {
        this.configuration = this.getDefaultConfiguration();
        this.loadConfigurationIntoModal();
        this.showNotification('Configuration reset to defaults', 'info');
    }

    closeConfiguration() {
        document.getElementById('configurationModal').style.display = 'none';
    }

    exportData() {
        const data = {
            metadata: {
                exportTime: new Date().toISOString(),
                version: '1.0',
                configuration: this.configuration
            },
            metrics: this.metricsHistory,
            predictions: this.generatePredictions(this.metricsHistory.cpu.slice(-24), 24),
            anomalies: this.anomalies,
            alerts: this.alerts,
            scalingHistory: this.scalingHistory
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `infrastructure-stress-analysis-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Data exported successfully', 'success');
    }

    updateUI() {
        this.updateStressLevel();
        this.updateScalingRecommendations();
        this.updateScalingHistory();
        this.updateAlertsDisplay();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            ${message}
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }
}

// Global functions
let analyzer;

function openConfiguration() {
    if (analyzer) analyzer.openConfiguration();
}

function saveConfiguration() {
    if (analyzer) analyzer.saveConfigurationFromModal();
}

function resetToDefaults() {
    if (analyzer) analyzer.resetToDefaults();
}

function closeConfiguration() {
    if (analyzer) analyzer.closeConfiguration();
}

function updatePrediction() {
    if (analyzer) analyzer.updatePrediction();
}

function exportData() {
    if (analyzer) analyzer.exportData();
}

function toggleRealTime() {
    if (analyzer) {
        if (analyzer.isMonitoring) {
            analyzer.stopMonitoring();
        } else {
            analyzer.startMonitoring();
        }
    }
}

function applyScaling(resource) {
    if (analyzer) analyzer.applyScaling(resource);
}

function dismissRecommendation(resource) {
    if (analyzer) analyzer.dismissRecommendation(resource);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    analyzer = new PredictiveStressAnalyzer();
});