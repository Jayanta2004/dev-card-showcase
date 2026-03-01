// Predictive Data Integrity Sentinel - Interactive JavaScript Implementation

class PredictiveDataIntegritySentinel {
    constructor() {
        this.isMonitoring = false;
        this.monitoringInterval = 5000;
        this.sensitivity = 5;
        this.dataSource = 'database';

        this.integrityScore = 98.5;
        this.anomalyCount = 0;
        this.predictionAccuracy = 94.2;
        this.uptime = 0;

        this.dataPoints = [];
        this.anomalies = [];
        this.predictions = [];
        this.alerts = [];

        this.charts = {};
        this.intervals = {};

        this.initializeElements();
        this.bindEvents();
        this.initializeCharts();
        this.updateDisplay();
    }

    initializeElements() {
        // Configuration elements
        this.dataSourceSelect = document.getElementById('dataSource');
        this.monitoringIntervalSelect = document.getElementById('monitoringInterval');
        this.sensitivitySlider = document.getElementById('sensitivity');
        this.sensitivityValue = document.getElementById('sensitivityValue');
        this.startMonitoringBtn = document.getElementById('startMonitoring');
        this.stopMonitoringBtn = document.getElementById('stopMonitoring');

        // Health elements
        this.integrityScoreEl = document.getElementById('integrityScore');
        this.integrityFillEl = document.getElementById('integrityFill');
        this.anomalyCountEl = document.getElementById('anomalyCount');
        this.anomalyStatusEl = document.getElementById('anomalyStatus');
        this.predictionAccuracyEl = document.getElementById('predictionAccuracy');
        this.predictionFillEl = document.getElementById('predictionFill');
        this.uptimeValueEl = document.getElementById('uptimeValue');
        this.uptimeStatusEl = document.getElementById('uptimeStatus');

        // Metrics elements
        this.dataVolumeEl = document.getElementById('dataVolume');
        this.recordsProcessedEl = document.getElementById('recordsProcessed');
        this.corruptionRateEl = document.getElementById('corruptionRate');
        this.falsePositivesEl = document.getElementById('falsePositives');

        // Alerts elements
        this.alertsContainer = document.getElementById('alertsContainer');
        this.clearAlertsBtn = document.getElementById('clearAlerts');
        this.exportAlertsBtn = document.getElementById('exportAlerts');

        // Analysis elements
        this.patternGrid = document.getElementById('patternGrid');
        this.correlationMatrix = document.getElementById('correlationMatrix');

        // History elements
        this.timeRangeSelect = document.getElementById('timeRange');
        this.refreshHistoryBtn = document.getElementById('refreshHistory');
        this.totalAnomaliesEl = document.getElementById('totalAnomalies');
        this.avgIntegrityEl = document.getElementById('avgIntegrity');
        this.detectionRateEl = document.getElementById('detectionRate');
        this.responseTimeEl = document.getElementById('responseTime');
    }

    bindEvents() {
        this.startMonitoringBtn.addEventListener('click', () => this.startMonitoring());
        this.stopMonitoringBtn.addEventListener('click', () => this.stopMonitoring());

        this.sensitivitySlider.addEventListener('input', (e) => {
            this.sensitivity = parseInt(e.target.value);
            this.sensitivityValue.textContent = this.sensitivity;
        });

        this.dataSourceSelect.addEventListener('change', (e) => {
            this.dataSource = e.target.value;
        });

        this.monitoringIntervalSelect.addEventListener('change', (e) => {
            this.monitoringInterval = parseInt(e.target.value);
            if (this.isMonitoring) {
                this.restartMonitoring();
            }
        });

        this.clearAlertsBtn.addEventListener('click', () => this.clearAlerts());
        this.exportAlertsBtn.addEventListener('click', () => this.exportAlerts());

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target));
        });

        this.timeRangeSelect.addEventListener('change', (e) => this.updateHistory());
        this.refreshHistoryBtn.addEventListener('click', () => this.updateHistory());
    }

    initializeCharts() {
        this.initializeIntegrityChart();
        this.initializeAnomalyChart();
        this.initializePredictionChart();
        this.initializeHistoryChart();
    }

    initializeIntegrityChart() {
        const canvas = document.getElementById('integrityChart');
        const ctx = canvas.getContext('2d');
        this.charts.integrity = { canvas, ctx };

        this.drawIntegrityChart();
    }

    initializeAnomalyChart() {
        const canvas = document.getElementById('anomalyChart');
        const ctx = canvas.getContext('2d');
        this.charts.anomaly = { canvas, ctx };

        this.drawAnomalyChart();
    }

    initializePredictionChart() {
        const canvas = document.getElementById('predictionChart');
        const ctx = canvas.getContext('2d');
        this.charts.prediction = { canvas, ctx };

        this.drawPredictionChart();
    }

    initializeHistoryChart() {
        const canvas = document.getElementById('historyChart');
        const ctx = canvas.getContext('2d');
        this.charts.history = { canvas, ctx };

        this.drawHistoryChart();
    }

    drawIntegrityChart() {
        const { ctx, canvas } = this.charts.integrity;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Generate sample data points
        const dataPoints = 20;
        const data = [];
        for (let i = 0; i < dataPoints; i++) {
            const baseValue = 95 + Math.random() * 5; // 95-100%
            const variation = (Math.random() - 0.5) * 2; // Small variations
            data.push({
                x: (width / (dataPoints - 1)) * i,
                y: height - ((baseValue + variation) / 100) * height
            });
        }

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 5; i++) {
            const y = (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw line
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(data[0].x, data[0].y);

        data.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();

        // Draw points
        ctx.fillStyle = '#10b981';
        data.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawAnomalyChart() {
        const { ctx, canvas } = this.charts.anomaly;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Generate anomaly detection data
        const dataPoints = 20;
        const data = [];
        const anomalies = [];

        for (let i = 0; i < dataPoints; i++) {
            const normalValue = Math.random() * 20 + 40; // 40-60 range
            let value = normalValue;

            // Occasionally create anomalies
            if (Math.random() > 0.85) {
                value = Math.random() > 0.5 ? normalValue * 2 : normalValue * 0.3;
                anomalies.push(i);
            }

            data.push({
                x: (width / (dataPoints - 1)) * i,
                y: height - (value / 100) * height,
                isAnomaly: anomalies.includes(i)
            });
        }

        // Draw normal line
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();

        // Draw anomaly points
        ctx.fillStyle = '#ef4444';
        data.forEach(point => {
            if (point.isAnomaly) {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Draw threshold lines
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.setLineDash([5, 5]);

        const upperThreshold = height - (75 / 100) * height;
        const lowerThreshold = height - (25 / 100) * height;

        ctx.beginPath();
        ctx.moveTo(0, upperThreshold);
        ctx.lineTo(width, upperThreshold);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, lowerThreshold);
        ctx.lineTo(width, lowerThreshold);
        ctx.stroke();

        ctx.setLineDash([]);
    }

    drawPredictionChart() {
        const { ctx, canvas } = this.charts.prediction;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Generate prediction data
        const dataPoints = 10;
        const actualData = [];
        const predictedData = [];

        for (let i = 0; i < dataPoints; i++) {
            const actual = 90 + Math.random() * 10; // 90-100%
            actualData.push({
                x: (width / dataPoints) * i + (width / dataPoints) / 2,
                y: height - (actual / 100) * height
            });

            // Prediction with some error
            const prediction = actual + (Math.random() - 0.5) * 5;
            predictedData.push({
                x: (width / dataPoints) * i + (width / dataPoints) / 2,
                y: height - (prediction / 100) * height
            });
        }

        // Draw actual data
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        actualData.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();

        // Draw predicted data
        ctx.strokeStyle = '#f59e0b';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        predictedData.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw points
        ctx.fillStyle = '#10b981';
        actualData.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.fillStyle = '#f59e0b';
        predictedData.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawHistoryChart() {
        const { ctx, canvas } = this.charts.history;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Generate historical data
        const timeRange = this.timeRangeSelect.value;
        const dataPoints = timeRange === '1h' ? 60 : timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
        const data = [];

        for (let i = 0; i < dataPoints; i++) {
            const integrity = 95 + Math.random() * 5; // 95-100%
            data.push({
                x: (width / (dataPoints - 1)) * i,
                y: height - (integrity / 100) * height,
                value: integrity
            });
        }

        // Draw area under curve
        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.beginPath();
        ctx.moveTo(data[0].x, height);
        data.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.lineTo(data[data.length - 1].x, height);
        ctx.closePath();
        ctx.fill();

        // Draw line
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        data.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();
    }

    startMonitoring() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.uptime = 0;
        this.startTime = Date.now();

        this.startMonitoringBtn.disabled = true;
        this.stopMonitoringBtn.disabled = false;
        this.uptimeStatusEl.textContent = 'Monitoring active';

        this.startMonitoringBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Monitoring...';

        // Start monitoring intervals
        this.intervals.monitoring = setInterval(() => {
            this.performMonitoringCycle();
        }, this.monitoringInterval);

        this.intervals.uptime = setInterval(() => {
            this.updateUptime();
        }, 1000);

        this.showNotification('Data integrity monitoring started', 'success');
    }

    stopMonitoring() {
        if (!this.isMonitoring) return;

        this.isMonitoring = false;

        this.startMonitoringBtn.disabled = false;
        this.stopMonitoringBtn.disabled = true;
        this.uptimeStatusEl.textContent = 'Not monitoring';

        this.startMonitoringBtn.innerHTML = '<i class="fas fa-play"></i> Start Monitoring';

        // Clear intervals
        Object.values(this.intervals).forEach(interval => clearInterval(interval));
        this.intervals = {};

        this.showNotification('Data integrity monitoring stopped', 'info');
    }

    restartMonitoring() {
        if (this.isMonitoring) {
            this.stopMonitoring();
            setTimeout(() => this.startMonitoring(), 100);
        }
    }

    performMonitoringCycle() {
        // Simulate data monitoring
        this.simulateDataCollection();
        this.performAnomalyDetection();
        this.updatePredictions();
        this.updateMetrics();
        this.updateDisplay();

        // Randomly trigger anomalies for demonstration
        if (Math.random() > 0.8) {
            this.generateAnomaly();
        }
    }

    simulateDataCollection() {
        // Simulate collecting data from the selected source
        const dataSize = Math.floor(Math.random() * 100) + 50; // 50-150 MB
        const records = Math.floor(Math.random() * 10000) + 5000; // 5k-15k records

        this.dataPoints.push({
            timestamp: new Date(),
            dataVolume: dataSize,
            recordsProcessed: records,
            integrity: this.integrityScore,
            source: this.dataSource
        });

        // Keep only last 100 data points
        if (this.dataPoints.length > 100) {
            this.dataPoints.shift();
        }
    }

    performAnomalyDetection() {
        if (this.dataPoints.length < 5) return;

        const recentData = this.dataPoints.slice(-5);
        const avgIntegrity = recentData.reduce((sum, d) => sum + d.integrity, 0) / recentData.length;
        const currentIntegrity = recentData[recentData.length - 1].integrity;

        // Simple anomaly detection based on deviation from average
        const threshold = this.sensitivity * 2; // 10-50% threshold
        const deviation = Math.abs(currentIntegrity - avgIntegrity);

        if (deviation > threshold) {
            this.detectAnomaly({
                type: currentIntegrity < avgIntegrity ? 'integrity_drop' : 'integrity_spike',
                severity: deviation > threshold * 2 ? 'critical' : 'warning',
                value: currentIntegrity,
                expected: avgIntegrity,
                timestamp: new Date()
            });
        }
    }

    detectAnomaly(anomaly) {
        this.anomalies.push(anomaly);
        this.anomalyCount++;

        // Create alert
        const alert = {
            id: Date.now(),
            type: anomaly.type,
            severity: anomaly.severity,
            title: this.getAnomalyTitle(anomaly),
            description: this.getAnomalyDescription(anomaly),
            timestamp: anomaly.timestamp,
            value: anomaly.value,
            expected: anomaly.expected
        };

        this.alerts.unshift(alert);
        this.updateAlertsDisplay();

        // Update integrity score
        if (anomaly.severity === 'critical') {
            this.integrityScore = Math.max(0, this.integrityScore - 2);
        } else {
            this.integrityScore = Math.max(0, this.integrityScore - 0.5);
        }
    }

    getAnomalyTitle(anomaly) {
        switch (anomaly.type) {
            case 'integrity_drop':
                return 'Data Integrity Drop Detected';
            case 'integrity_spike':
                return 'Unusual Integrity Spike';
            case 'corruption':
                return 'Data Corruption Detected';
            case 'volume_anomaly':
                return 'Data Volume Anomaly';
            default:
                return 'Anomaly Detected';
        }
    }

    getAnomalyDescription(anomaly) {
        const severity = anomaly.severity === 'critical' ? 'Critical' : 'Warning';
        return `${severity}: Detected ${anomaly.type.replace('_', ' ')} at ${anomaly.value.toFixed(2)}% (expected ~${anomaly.expected.toFixed(2)}%)`;
    }

    generateAnomaly() {
        const anomalyTypes = ['integrity_drop', 'corruption', 'volume_anomaly'];
        const type = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];

        this.detectAnomaly({
            type: type,
            severity: Math.random() > 0.7 ? 'critical' : 'warning',
            value: Math.random() * 50 + 25,
            expected: Math.random() * 20 + 80,
            timestamp: new Date()
        });
    }

    updatePredictions() {
        if (this.dataPoints.length < 10) return;

        // Simple linear regression for prediction
        const recentData = this.dataPoints.slice(-10);
        const predictions = this.performLinearRegression(recentData);

        this.predictions = predictions;
        this.predictionAccuracy = Math.max(80, Math.min(98, 90 + (Math.random() - 0.5) * 10));
    }

    performLinearRegression(data) {
        // Simplified linear regression implementation
        const n = data.length;
        const sumX = data.reduce((sum, d, i) => sum + i, 0);
        const sumY = data.reduce((sum, d) => sum + d.integrity, 0);
        const sumXY = data.reduce((sum, d, i) => sum + i * d.integrity, 0);
        const sumXX = data.reduce((sum, d, i) => sum + i * i, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Generate predictions for next 5 points
        const predictions = [];
        for (let i = 0; i < 5; i++) {
            const x = n + i;
            const predictedValue = slope * x + intercept;
            predictions.push({
                timestamp: new Date(Date.now() + i * this.monitoringInterval),
                predictedIntegrity: Math.max(0, Math.min(100, predictedValue)),
                confidence: Math.max(0.5, Math.min(0.95, 0.8 + (Math.random() - 0.5) * 0.2))
            });
        }

        return predictions;
    }

    updateMetrics() {
        if (this.dataPoints.length === 0) return;

        const recentData = this.dataPoints.slice(-10);
        const totalVolume = recentData.reduce((sum, d) => sum + d.dataVolume, 0);
        const totalRecords = recentData.reduce((sum, d) => sum + d.recordsProcessed, 0);

        this.dataVolumeEl.textContent = `${(totalVolume / recentData.length).toFixed(1)} MB`;
        this.recordsProcessedEl.textContent = totalRecords.toLocaleString();

        // Calculate corruption rate (simulated)
        const corruptionRate = Math.max(0, Math.min(1, (100 - this.integrityScore) / 100));
        this.corruptionRateEl.textContent = `${(corruptionRate * 100).toFixed(3)}%`;

        // False positives (simulated)
        this.falsePositivesEl.textContent = Math.floor(Math.random() * 5);
    }

    updateDisplay() {
        // Update health metrics
        this.integrityScoreEl.textContent = `${this.integrityScore.toFixed(1)}%`;
        this.integrityFillEl.style.width = `${this.integrityScore}%`;

        this.anomalyCountEl.textContent = this.anomalyCount;
        this.anomalyStatusEl.textContent = this.anomalyCount > 0 ?
            `${this.anomalyCount} anomal${this.anomalyCount === 1 ? 'y' : 'ies'} detected` :
            'No anomalies detected';

        this.predictionAccuracyEl.textContent = `${this.predictionAccuracy.toFixed(1)}%`;
        this.predictionFillEl.style.width = `${this.predictionAccuracy}%`;

        // Update charts
        this.drawIntegrityChart();
        this.drawAnomalyChart();
        this.drawPredictionChart();

        // Update analysis
        this.updatePatternAnalysis();
        this.updateCorrelationAnalysis();
        this.updatePredictionResults();
    }

    updateUptime() {
        if (!this.isMonitoring) return;

        this.uptime = Math.floor((Date.now() - this.startTime) / 1000);
        const hours = Math.floor(this.uptime / 3600);
        const minutes = Math.floor((this.uptime % 3600) / 60);
        const seconds = this.uptime % 60;

        this.uptimeValueEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateAlertsDisplay() {
        this.alertsContainer.innerHTML = '';

        if (this.alerts.length === 0) {
            this.alertsContainer.innerHTML = `
                <div class="no-alerts">
                    <i class="fas fa-check-circle"></i>
                    <p>No anomalies detected. System is operating normally.</p>
                </div>
            `;
            return;
        }

        this.alerts.slice(0, 10).forEach(alert => {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert-item ${alert.severity}`;
            alertDiv.innerHTML = `
                <div class="alert-icon">
                    <i class="fas fa-exclamation-${alert.severity === 'critical' ? 'triangle' : 'circle'}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-description">${alert.description}</div>
                    <div class="alert-meta">${alert.timestamp.toLocaleString()}</div>
                </div>
            `;
            this.alertsContainer.appendChild(alertDiv);
        });
    }

    clearAlerts() {
        if (confirm('Clear all alerts? This action cannot be undone.')) {
            this.alerts = [];
            this.anomalyCount = 0;
            this.updateAlertsDisplay();
            this.updateDisplay();
            this.showNotification('All alerts cleared', 'info');
        }
    }

    exportAlerts() {
        if (this.alerts.length === 0) {
            this.showNotification('No alerts to export', 'warning');
            return;
        }

        const csvContent = [
            ['Timestamp', 'Type', 'Severity', 'Title', 'Description', 'Value', 'Expected'],
            ...this.alerts.map(alert => [
                alert.timestamp.toISOString(),
                alert.type,
                alert.severity,
                alert.title,
                alert.description,
                alert.value,
                alert.expected
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data-integrity-alerts-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Alerts exported successfully', 'success');
    }

    switchTab(targetBtn) {
        const tabName = targetBtn.dataset.tab;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        targetBtn.classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }

    updatePatternAnalysis() {
        this.patternGrid.innerHTML = '';

        const patterns = [
            { title: 'Integrity Trend', value: 'Stable', description: 'Data integrity maintaining consistent levels' },
            { title: 'Anomaly Frequency', value: `${this.anomalyCount}/hr`, description: 'Rate of detected anomalies per hour' },
            { title: 'Data Volume Pattern', value: 'Normal', description: 'Data volume within expected ranges' },
            { title: 'Prediction Confidence', value: 'High', description: 'Predictive models showing high accuracy' },
            { title: 'Response Time', value: '< 100ms', description: 'Average anomaly detection response time' },
            { title: 'False Positive Rate', value: '2.1%', description: 'Percentage of false anomaly detections' }
        ];

        patterns.forEach(pattern => {
            const patternDiv = document.createElement('div');
            patternDiv.className = 'pattern-card';
            patternDiv.innerHTML = `
                <div class="pattern-title">
                    <i class="fas fa-chart-line"></i>
                    ${pattern.title}
                </div>
                <div class="pattern-value">${pattern.value}</div>
                <div class="pattern-description">${pattern.description}</div>
            `;
            this.patternGrid.appendChild(patternDiv);
        });
    }

    updateCorrelationAnalysis() {
        this.correlationMatrix.innerHTML = '';

        const correlations = [
            { label: 'Integrity vs Volume', value: 0.85 },
            { label: 'Integrity vs Time', value: 0.72 },
            { label: 'Volume vs Anomalies', value: -0.43 },
            { label: 'Time vs Anomalies', value: 0.28 },
            { label: 'Integrity vs Anomalies', value: -0.67 },
            { label: 'Volume vs Time', value: 0.91 }
        ];

        correlations.forEach(corr => {
            const corrDiv = document.createElement('div');
            corrDiv.className = 'correlation-item';
            corrDiv.innerHTML = `
                <div class="correlation-value">${corr.value.toFixed(2)}</div>
                <div class="correlation-label">${corr.label}</div>
            `;
            this.correlationMatrix.appendChild(corrDiv);
        });
    }

    updatePredictionResults() {
        if (this.predictions.length === 0) return;

        const nextHour = this.predictions[0];
        const dayTrend = this.predictions.slice(0, 4).reduce((sum, p) => sum + p.predictedIntegrity, 0) / 4;

        document.getElementById('hourPrediction').innerHTML = `
            <span class="confidence-value">${nextHour.predictedIntegrity > 90 ? 'High Confidence' : nextHour.predictedIntegrity > 80 ? 'Medium Confidence' : 'Low Confidence'}</span>
            <span class="confidence-score">${(nextHour.confidence * 100).toFixed(0)}%</span>
        `;

        document.getElementById('dayPrediction').innerHTML = `
            <span class="confidence-value">${dayTrend > 90 ? 'Stable' : dayTrend > 85 ? 'Moderate' : 'Unstable'}</span>
            <span class="confidence-score">${(dayTrend).toFixed(1)}%</span>
        `;

        const riskLevel = this.anomalyCount > 5 ? 'High Risk' : this.anomalyCount > 2 ? 'Medium Risk' : 'Low Risk';
        const riskScore = Math.max(80, 100 - this.anomalyCount * 5);

        document.getElementById('riskPrediction').innerHTML = `
            <span class="confidence-value">${riskLevel}</span>
            <span class="confidence-score">${riskScore}%</span>
        `;
    }

    updateHistory() {
        this.drawHistoryChart();

        // Update statistics
        const timeRange = this.timeRangeSelect.value;
        const multiplier = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;

        this.totalAnomaliesEl.textContent = Math.floor(this.anomalyCount * (multiplier / 24));
        this.avgIntegrityEl.textContent = `${this.integrityScore.toFixed(1)}%`;
        this.detectionRateEl.textContent = '99.8%';
        this.responseTimeEl.textContent = `${Math.floor(Math.random() * 50) + 10}ms`;
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    destroy() {
        this.stopMonitoring();
        Object.values(this.intervals).forEach(interval => clearInterval(interval));
    }
}

// Initialize the predictive data integrity sentinel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dataIntegritySentinel = new PredictiveDataIntegritySentinel();
});