// Intelligent Data Anomaly Detector - JavaScript Implementation

class IntelligentDataAnomalyDetector {
    constructor() {
        this.dataPoints = [];
        this.anomalies = [];
        this.isStreaming = false;
        this.streamInterval = null;
        this.chart = null;
        this.currentAlgorithm = 'zscore';
        this.sensitivity = 1.5;
        this.windowSize = 30;
        this.autoAdapt = true;
        this.realTimeAlerts = true;

        this.initializeElements();
        this.bindEvents();
        this.initializeChart();
        this.updateUI();
    }

    initializeElements() {
        // Control elements
        this.dataTypeSelect = document.getElementById('dataType');
        this.dataPointsSlider = document.getElementById('dataPoints');
        this.dataPointsValue = document.getElementById('dataPointsValue');
        this.streamRateSlider = document.getElementById('streamRate');
        this.streamRateValue = document.getElementById('streamRateValue');
        this.generateDataBtn = document.getElementById('generateData');
        this.stopDataBtn = document.getElementById('stopData');
        this.injectAnomalyBtn = document.getElementById('injectAnomaly');

        // Detection parameters
        this.sensitivitySlider = document.getElementById('sensitivity');
        this.sensitivityValue = document.getElementById('sensitivityValue');
        this.windowSizeSlider = document.getElementById('windowSize');
        this.windowSizeValue = document.getElementById('windowSizeValue');
        this.algorithmSelect = document.getElementById('algorithm');
        this.autoAdaptCheckbox = document.getElementById('autoAdapt');
        this.realTimeAlertsCheckbox = document.getElementById('realTimeAlerts');

        // Stats elements
        this.totalPointsEl = document.getElementById('totalPoints');
        this.anomalyCountEl = document.getElementById('anomalyCount');
        this.anomalyRateEl = document.getElementById('anomalyRate');
        this.detectionTimeEl = document.getElementById('detectionTime');

        // Results elements
        this.anomalyList = document.getElementById('anomalyList');
        this.alertList = document.getElementById('alertList');
        this.clearResultsBtn = document.getElementById('clearResults');
    }

    bindEvents() {
        // Data generation controls
        this.dataPointsSlider.addEventListener('input', (e) => {
            this.dataPointsValue.textContent = e.target.value;
        });

        this.streamRateSlider.addEventListener('input', (e) => {
            this.streamRateValue.textContent = e.target.value;
            if (this.isStreaming) {
                this.restartStream();
            }
        });

        this.generateDataBtn.addEventListener('click', () => this.startDataStream());
        this.stopDataBtn.addEventListener('click', () => this.stopDataStream());
        this.injectAnomalyBtn.addEventListener('click', () => this.injectAnomaly());

        // Detection parameters
        this.sensitivitySlider.addEventListener('input', (e) => {
            this.sensitivityValue.textContent = e.target.value;
            this.sensitivity = parseFloat(e.target.value);
        });

        this.windowSizeSlider.addEventListener('input', (e) => {
            this.windowSizeValue.textContent = e.target.value;
            this.windowSize = parseInt(e.target.value);
        });

        this.algorithmSelect.addEventListener('change', (e) => {
            this.currentAlgorithm = e.target.value;
        });

        this.autoAdaptCheckbox.addEventListener('change', (e) => {
            this.autoAdapt = e.target.checked;
        });

        this.realTimeAlertsCheckbox.addEventListener('change', (e) => {
            this.realTimeAlerts = e.target.checked;
        });

        // Results
        this.clearResultsBtn.addEventListener('click', () => this.clearResults());
    }

    initializeChart() {
        const ctx = document.getElementById('dataChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Data Stream',
                    data: [],
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    tension: 0.1
                }, {
                    label: 'Anomalies',
                    data: [],
                    borderColor: 'rgba(239, 68, 68, 1)',
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderWidth: 0,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    showLine: false
                }, {
                    label: 'Upper Threshold',
                    data: [],
                    borderColor: 'rgba(245, 158, 11, 0.8)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }, {
                    label: 'Lower Threshold',
                    data: [],
                    borderColor: 'rgba(245, 158, 11, 0.8)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Value'
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

    updateUI() {
        this.updateStats();
    }

    startDataStream() {
        if (this.isStreaming) return;

        this.isStreaming = true;
        this.generateDataBtn.disabled = true;
        this.stopDataBtn.disabled = false;

        const maxPoints = parseInt(this.dataPointsSlider.value);
        let pointCount = 0;

        this.streamInterval = setInterval(() => {
            if (pointCount >= maxPoints) {
                this.stopDataStream();
                return;
            }

            const dataPoint = this.generateDataPoint();
            this.addDataPoint(dataPoint);
            pointCount++;

            this.updateChart();
            this.updateStats();
        }, parseInt(this.streamRateSlider.value));
    }

    stopDataStream() {
        this.isStreaming = false;
        clearInterval(this.streamInterval);
        this.generateDataBtn.disabled = false;
        this.stopDataBtn.disabled = true;
    }

    restartStream() {
        if (this.isStreaming) {
            this.stopDataStream();
            this.startDataStream();
        }
    }

    generateDataPoint() {
        const dataType = this.dataTypeSelect.value;
        const time = Date.now();
        let value;

        switch (dataType) {
            case 'normal':
                value = this.generateNormalDistribution();
                break;
            case 'seasonal':
                value = this.generateSeasonalPattern();
                break;
            case 'trending':
                value = this.generateTrendingData();
                break;
            case 'volatile':
                value = this.generateVolatileData();
                break;
            case 'mixed':
                value = this.generateMixedPattern();
                break;
            default:
                value = this.generateNormalDistribution();
        }

        return {
            time: time,
            value: value,
            index: this.dataPoints.length
        };
    }

    generateNormalDistribution() {
        // Box-Muller transform for normal distribution
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return 50 + 10 * z0; // Mean = 50, StdDev = 10
    }

    generateSeasonalPattern() {
        const baseValue = 50;
        const amplitude = 15;
        const frequency = 0.1;
        const noise = (Math.random() - 0.5) * 5;

        return baseValue + amplitude * Math.sin(this.dataPoints.length * frequency) + noise;
    }

    generateTrendingData() {
        const baseValue = 30;
        const trend = 0.2;
        const noise = (Math.random() - 0.5) * 8;

        return baseValue + trend * this.dataPoints.length + noise;
    }

    generateVolatileData() {
        const baseValue = 50;
        const volatility = 25;
        return baseValue + (Math.random() - 0.5) * volatility;
    }

    generateMixedPattern() {
        const patterns = ['normal', 'seasonal', 'trending', 'volatile'];
        const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];

        switch (randomPattern) {
            case 'normal': return this.generateNormalDistribution();
            case 'seasonal': return this.generateSeasonalPattern();
            case 'trending': return this.generateTrendingData();
            case 'volatile': return this.generateVolatileData();
        }
    }

    addDataPoint(dataPoint) {
        this.dataPoints.push(dataPoint);

        // Keep only recent data points for performance
        if (this.dataPoints.length > 1000) {
            this.dataPoints.shift();
        }

        // Check for anomalies
        this.detectAnomalies();
    }

    async detectAnomalies() {
        if (this.dataPoints.length < this.windowSize) return;

        const startTime = performance.now();
        const recentData = this.dataPoints.slice(-this.windowSize);
        const values = recentData.map(p => p.value);
        const currentPoint = this.dataPoints[this.dataPoints.length - 1];

        let isAnomaly = false;
        let anomalyType = '';

        switch (this.currentAlgorithm) {
            case 'zscore':
                isAnomaly = this.detectZScoreAnomaly(values, currentPoint.value);
                anomalyType = 'Z-Score Deviation';
                break;
            case 'iqr':
                isAnomaly = this.detectIQRAnomaly(values, currentPoint.value);
                anomalyType = 'IQR Outlier';
                break;
            case 'isolation':
                isAnomaly = this.detectIsolationForestAnomaly(values, currentPoint.value);
                anomalyType = 'Isolation Forest';
                break;
            case 'mahalanobis':
                isAnomaly = this.detectMahalanobisAnomaly(values, currentPoint.value);
                anomalyType = 'Mahalanobis Distance';
                break;
            case 'combined':
                isAnomaly = this.detectCombinedAnomaly(values, currentPoint.value);
                anomalyType = 'Combined Detection';
                break;
        }

        const detectionTime = performance.now() - startTime;

        if (isAnomaly) {
            const anomaly = {
                index: currentPoint.index,
                value: currentPoint.value,
                time: currentPoint.time,
                type: anomalyType,
                algorithm: this.currentAlgorithm,
                detectionTime: detectionTime
            };

            this.anomalies.push(anomaly);
            this.addAnomalyToResults(anomaly);

            if (this.realTimeAlerts) {
                this.addAlert(anomaly);
            }
        }

        // Update detection time average
        this.updateDetectionTime(detectionTime);
    }

    detectZScoreAnomaly(values, currentValue) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
        const zScore = Math.abs((currentValue - mean) / stdDev);

        return zScore > this.sensitivity;
    }

    detectIQRAnomaly(values, currentValue) {
        const sorted = [...values].sort((a, b) => a - b);
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - (this.sensitivity * iqr);
        const upperBound = q3 + (this.sensitivity * iqr);

        return currentValue < lowerBound || currentValue > upperBound;
    }

    detectIsolationForestAnomaly(values, currentValue) {
        // Simplified isolation forest simulation
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const median = [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
        const mad = values.reduce((a, b) => a + Math.abs(b - median), 0) / values.length;

        const score = Math.abs(currentValue - median) / (mad + 0.0001);
        return score > this.sensitivity;
    }

    detectMahalanobisAnomaly(values, currentValue) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        const mahalanobisDistance = Math.pow(currentValue - mean, 2) / (variance + 0.0001);

        return mahalanobisDistance > this.sensitivity;
    }

    detectCombinedAnomaly(values, currentValue) {
        const zScoreAnomaly = this.detectZScoreAnomaly(values, currentValue);
        const iqrAnomaly = this.detectIQRAnomaly(values, currentValue);
        const isolationAnomaly = this.detectIsolationForestAnomaly(values, currentValue);

        // Require at least 2 out of 3 algorithms to agree
        const anomalyCount = [zScoreAnomaly, iqrAnomaly, isolationAnomaly].filter(Boolean).length;
        return anomalyCount >= 2;
    }

    addAnomalyToResults(anomaly) {
        const anomalyItem = document.createElement('div');
        anomalyItem.className = 'anomaly-item';

        const timeString = new Date(anomaly.time).toLocaleTimeString();

        anomalyItem.innerHTML = `
            <div class="anomaly-header">
                <span class="anomaly-type">${anomaly.type}</span>
                <span class="anomaly-time">${timeString}</span>
            </div>
            <div class="anomaly-details">
                Value: <span class="anomaly-value">${anomaly.value.toFixed(2)}</span> |
                Algorithm: ${anomaly.algorithm} |
                Detection: ${anomaly.detectionTime.toFixed(1)}ms
            </div>
        `;

        this.anomalyList.insertBefore(anomalyItem, this.anomalyList.firstChild);

        // Remove "no results" message if it exists
        const noResults = this.anomalyList.querySelector('.no-results');
        if (noResults) {
            noResults.remove();
        }
    }

    addAlert(anomaly) {
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item';

        const timeString = new Date(anomaly.time).toLocaleTimeString();

        alertItem.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <strong>Anomaly detected:</strong> ${anomaly.value.toFixed(2)} at ${timeString}
        `;

        this.alertList.insertBefore(alertItem, this.alertList.firstChild);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (alertItem.parentNode) {
                alertItem.remove();
            }
        }, 10000);
    }

    injectAnomaly() {
        if (!this.isStreaming || this.dataPoints.length === 0) {
            alert('Please start the data stream first.');
            return;
        }

        const lastValue = this.dataPoints[this.dataPoints.length - 1].value;
        const anomalyValue = lastValue * (2 + Math.random()); // Create a significant deviation

        const anomalyPoint = {
            time: Date.now(),
            value: anomalyValue,
            index: this.dataPoints.length,
            injected: true
        };

        this.addDataPoint(anomalyPoint);
        this.updateChart();
        this.updateStats();
    }

    updateChart() {
        const maxPoints = 200; // Show last 200 points
        const recentData = this.dataPoints.slice(-maxPoints);

        const labels = recentData.map((_, i) => i.toString());
        const values = recentData.map(p => p.value);

        // Update main data line
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = values;

        // Update anomalies
        const anomalyPoints = recentData.map((point, i) => {
            const anomaly = this.anomalies.find(a => a.index === point.index);
            return anomaly ? point.value : null;
        });
        this.chart.data.datasets[1].data = anomalyPoints;

        // Update thresholds (simplified)
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
        const upperThreshold = new Array(values.length).fill(mean + this.sensitivity * stdDev);
        const lowerThreshold = new Array(values.length).fill(mean - this.sensitivity * stdDev);

        this.chart.data.datasets[2].data = upperThreshold;
        this.chart.data.datasets[3].data = lowerThreshold;

        this.chart.update('none'); // No animation for performance
    }

    updateStats() {
        this.totalPointsEl.textContent = this.dataPoints.length;
        this.anomalyCountEl.textContent = this.anomalies.length;

        const anomalyRate = this.dataPoints.length > 0 ?
            (this.anomalies.length / this.dataPoints.length * 100).toFixed(1) : 0;
        this.anomalyRateEl.textContent = `${anomalyRate}%`;
    }

    updateDetectionTime(detectionTime) {
        const currentAvg = parseFloat(this.detectionTimeEl.textContent.replace('ms', '')) || 0;
        const newAvg = (currentAvg + detectionTime) / 2;
        this.detectionTimeEl.textContent = `${newAvg.toFixed(1)}ms`;
    }

    clearResults() {
        this.anomalies = [];
        this.anomalyList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-info-circle"></i>
                <p>No anomalies detected yet. Start the data stream to begin monitoring.</p>
            </div>
        `;
        this.alertList.innerHTML = '';
        this.updateStats();
        this.updateChart();
    }
}

// Initialize Chart.js if not already loaded
if (typeof Chart === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => {
        // Initialize the detector after Chart.js loads
        document.addEventListener('DOMContentLoaded', () => {
            new IntelligentDataAnomalyDetector();
        });
    };
    document.head.appendChild(script);
} else {
    // Chart.js already loaded
    document.addEventListener('DOMContentLoaded', () => {
        new IntelligentDataAnomalyDetector();
    });
}