/**
 * Temporal Trend Analysis Engine
 * Advanced time series analysis and forecasting system
 * Version 1.0.0
 */

class TemporalTrendAnalysisEngine {
    constructor() {
        this.isRunning = false;
        this.dataPoints = [];
        this.timeSeries = [];
        this.analysisResults = {};
        this.charts = {};
        this.settings = this.loadSettings();
        this.updateFrequency = 5000;
        this.maxDataPoints = 50000;
        this.lastUpdateTime = new Date();
        this.initialize();
    }

    initialize() {
        this.bindEvents();
        this.initializeCharts();
        this.loadSavedData();
        this.updateUI();
        this.startPeriodicUpdates();
        console.log('Temporal Trend Analysis Engine initialized');
    }

    bindEvents() {
        // Main controls
        document.getElementById('startAnalysisBtn').addEventListener('click', () => this.startAnalysis());
        document.getElementById('stopAnalysisBtn').addEventListener('click', () => this.stopAnalysis());
        document.getElementById('loadSampleDataBtn').addEventListener('click', () => this.loadSampleData());
        document.getElementById('exportResultsBtn').addEventListener('click', () => this.exportResults());
        document.getElementById('clearAnalysisBtn').addEventListener('click', () => this.clearAnalysis());

        // Data controls
        document.getElementById('loadDataBtn').addEventListener('click', () => this.loadData());
        document.getElementById('validateDataBtn').addEventListener('click', () => this.validateData());

        // Chart controls
        document.getElementById('zoomInBtn').addEventListener('click', () => this.zoomChart(1.2));
        document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoomChart(0.8));
        document.getElementById('resetZoomBtn').addEventListener('click', () => this.resetZoom());

        // Forecast controls
        document.getElementById('generateForecastBtn').addEventListener('click', () => this.generateForecast());
        document.getElementById('compareModelsBtn').addEventListener('click', () => this.compareModels());

        // Anomaly controls
        document.getElementById('anomalyThreshold').addEventListener('input', (e) => {
            document.getElementById('anomalyThresholdValue').textContent = parseFloat(e.target.value).toFixed(1);
        });

        // Modal controls
        document.querySelectorAll('.modal-close').forEach(close => {
            close.addEventListener('click', () => this.closeModal());
        });

        // Tab controls
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target));
        });

        // File input
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileUpload(e));

        // Settings controls
        document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());
        document.getElementById('resetSettingsBtn').addEventListener('click', () => this.resetSettingsToDefaults());
    }

    initializeCharts() {
        // Time Series Chart
        const timeseriesCtx = document.getElementById('timeseriesChart').getContext('2d');
        this.charts.timeseries = new Chart(timeseriesCtx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Time Series Data',
                    data: [],
                    borderColor: 'rgba(37, 99, 235, 1)',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute'
                        }
                    },
                    y: {
                        beginAtZero: false
                    }
                },
                plugins: {
                    zoom: {
                        zoom: {
                            wheel: {
                                enabled: true
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'xy'
                        },
                        pan: {
                            enabled: true,
                            mode: 'xy'
                        }
                    }
                }
            }
        });

        // Trend Components Chart
        const trendComponentsCtx = document.getElementById('trendComponentsChart').getContext('2d');
        this.charts.trendComponents = new Chart(trendComponentsCtx, {
            type: 'line',
            data: {
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time'
                    }
                }
            }
        });

        // Trend Strength Chart
        const trendStrengthCtx = document.getElementById('trendStrengthChart').getContext('2d');
        this.charts.trendStrength = new Chart(trendStrengthCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Trend Strength',
                    data: [],
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1
                    }
                }
            }
        });

        // Forecast Chart
        const forecastCtx = document.getElementById('forecastChart').getContext('2d');
        this.charts.forecast = new Chart(forecastCtx, {
            type: 'line',
            data: {
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time'
                    }
                }
            }
        });

        // Anomaly Chart
        const anomalyCtx = document.getElementById('anomalyChart').getContext('2d');
        this.charts.anomaly = new Chart(anomalyCtx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Normal Data',
                    data: [],
                    backgroundColor: 'rgba(37, 99, 235, 0.6)',
                    pointRadius: 3
                }, {
                    label: 'Anomalies',
                    data: [],
                    backgroundColor: 'rgba(245, 158, 11, 1)',
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time'
                    }
                }
            }
        });

        // Seasonal Decomposition Chart
        const seasonalDecompCtx = document.getElementById('seasonalDecompChart').getContext('2d');
        this.charts.seasonalDecomp = new Chart(seasonalDecompCtx, {
            type: 'line',
            data: {
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time'
                    }
                }
            }
        });

        // Periodogram Chart
        const periodogramCtx = document.getElementById('periodogramChart').getContext('2d');
        this.charts.periodogram = new Chart(periodogramCtx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Periodogram',
                    data: [],
                    borderColor: 'rgba(6, 182, 212, 1)',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Frequency'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Power'
                        }
                    }
                }
            }
        });

        // Correlation Chart
        const correlationCtx = document.getElementById('correlationChart').getContext('2d');
        this.charts.correlation = new Chart(correlationCtx, {
            type: 'heatmap',
            data: {
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            }
        });
    }

    startAnalysis() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.updateStatusIndicator('running', 'Running');
        document.getElementById('startAnalysisBtn').disabled = true;
        document.getElementById('stopAnalysisBtn').disabled = false;

        this.analysisInterval = setInterval(() => {
            this.performAnalysisCycle();
        }, this.updateFrequency);

        this.logToConsole('Analysis started - Real-time temporal analysis active');
        console.log('Temporal trend analysis started');
    }

    stopAnalysis() {
        if (!this.isRunning) return;

        this.isRunning = false;
        this.updateStatusIndicator('stopped', 'Stopped');
        document.getElementById('startAnalysisBtn').disabled = false;
        document.getElementById('stopAnalysisBtn').disabled = true;

        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
            this.analysisInterval = null;
        }

        this.logToConsole('Analysis stopped');
        console.log('Temporal trend analysis stopped');
    }

    performAnalysisCycle() {
        try {
            if (this.timeSeries.length === 0) return;

            // Update analysis results
            this.updateAnalysisResults();

            // Update charts
            this.updateCharts();

            // Update UI
            this.updateUI();
            this.lastUpdateTime = new Date();

        } catch (error) {
            console.error('Analysis cycle error:', error);
            this.logToConsole(`Error during analysis cycle: ${error.message}`, 'error');
        }
    }

    loadSampleData() {
        const sampleSize = 1000;
        const data = [];
        const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

        // Generate sample time series with trend, seasonality, and noise
        for (let i = 0; i < sampleSize; i++) {
            const timestamp = new Date(startTime.getTime() + i * 60000); // 1 minute intervals
            const trend = 0.001 * i; // Linear trend
            const seasonal = 5 * Math.sin(2 * Math.PI * i / 1440) + 2 * Math.sin(2 * Math.PI * i / 144); // Daily and 6-hour cycles
            const noise = (Math.random() - 0.5) * 2; // Random noise
            const value = 100 + trend + seasonal + noise;

            data.push({
                timestamp: timestamp,
                value: value,
                id: i + 1
            });
        }

        this.timeSeries = data;
        this.dataPoints = data.length;
        this.processTimeSeries();
        this.updateUI();
        this.logToConsole(`Loaded ${sampleSize} sample data points`);
    }

    processTimeSeries() {
        if (this.timeSeries.length === 0) return;

        // Sort by timestamp
        this.timeSeries.sort((a, b) => a.timestamp - b.timestamp);

        // Calculate basic statistics
        const values = this.timeSeries.map(d => d.value);
        this.analysisResults.basicStats = {
            mean: _.mean(values),
            stdDev: _.std(values),
            min: _.min(values),
            max: _.max(values),
            count: values.length
        };

        // Perform trend analysis
        this.performTrendAnalysis();

        // Perform seasonal decomposition
        this.performSeasonalDecomposition();

        // Detect anomalies
        this.detectAnomalies();

        // Update analysis results display
        this.updateAnalysisResultsDisplay();
    }

    performTrendAnalysis() {
        const values = this.timeSeries.map(d => d.value);
        const n = values.length;

        // Moving Average
        const windowSize = Math.min(50, Math.floor(n / 10));
        const movingAverage = this.calculateMovingAverage(values, windowSize);

        // Linear Regression
        const linearTrend = this.calculateLinearRegression(this.timeSeries);

        // Exponential Smoothing
        const exponentialSmooth = this.calculateExponentialSmoothing(values, 0.3);

        // Determine overall trend
        const recentValues = values.slice(-100);
        const trendSlope = this.calculateSlope(recentValues);
        const trendStrength = Math.min(Math.abs(trendSlope) * 1000, 1); // Normalize to 0-1

        let trendDirection = 'neutral';
        if (trendSlope > 0.01) trendDirection = 'up';
        else if (trendSlope < -0.01) trendDirection = 'down';

        this.analysisResults.trend = {
            direction: trendDirection,
            strength: trendStrength,
            slope: trendSlope,
            movingAverage: movingAverage,
            linearTrend: linearTrend,
            exponentialSmooth: exponentialSmooth
        };
    }

    calculateMovingAverage(values, windowSize) {
        const result = [];
        for (let i = 0; i < values.length; i++) {
            const start = Math.max(0, i - windowSize + 1);
            const window = values.slice(start, i + 1);
            result.push(_.mean(window));
        }
        return result;
    }

    calculateLinearRegression(data) {
        const n = data.length;
        const x = data.map((d, i) => i);
        const y = data.map(d => d.value);

        const sumX = _.sum(x);
        const sumY = _.sum(y);
        const sumXY = _.sum(x.map((xi, i) => xi * y[i]));
        const sumXX = _.sum(x.map(xi => xi * xi));

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return x.map(xi => slope * xi + intercept);
    }

    calculateExponentialSmoothing(values, alpha) {
        const result = [values[0]];
        for (let i = 1; i < values.length; i++) {
            result.push(alpha * values[i] + (1 - alpha) * result[i - 1]);
        }
        return result;
    }

    calculateSlope(values) {
        const n = values.length;
        const x = values.map((v, i) => i);
        const sumX = _.sum(x);
        const sumY = _.sum(values);
        const sumXY = _.sum(x.map((xi, i) => xi * values[i]));
        const sumXX = _.sum(x.map(xi => xi * xi));

        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }

    performSeasonalDecomposition() {
        const values = this.timeSeries.map(d => d.value);
        const seasonalPeriod = 1440; // Assume daily seasonality for minute data

        // Simple seasonal decomposition
        const trend = this.calculateMovingAverage(values, seasonalPeriod);
        const detrended = values.map((v, i) => v - (trend[i] || v));

        // Extract seasonal component
        const seasonal = [];
        for (let i = 0; i < seasonalPeriod; i++) {
            const indices = [];
            for (let j = i; j < detrended.length; j += seasonalPeriod) {
                indices.push(detrended[j]);
            }
            seasonal.push(_.mean(indices) || 0);
        }

        // Calculate seasonal strength
        const seasonalVariance = _.variance(seasonal);
        const residualVariance = _.variance(detrended.map((v, i) => v - seasonal[i % seasonalPeriod]));
        const totalVariance = _.variance(values);
        const seasonalStrength = totalVariance > 0 ? seasonalVariance / totalVariance : 0;

        this.analysisResults.seasonal = {
            trend: trend,
            seasonal: seasonal,
            residual: detrended.map((v, i) => v - seasonal[i % seasonalPeriod]),
            strength: seasonalStrength,
            period: seasonalPeriod
        };
    }

    detectAnomalies() {
        const values = this.timeSeries.map(d => d.value);
        const threshold = parseFloat(document.getElementById('anomalyThreshold').value);
        const method = document.getElementById('anomalyMethod').value;

        let anomalies = [];

        switch (method) {
            case 'zscore':
                anomalies = this.detectAnomaliesZScore(values, threshold);
                break;
            case 'iqr':
                anomalies = this.detectAnomaliesIQR(values, threshold);
                break;
            case 'isolation':
                anomalies = this.detectAnomaliesIsolationForest(values, threshold);
                break;
            default:
                anomalies = this.detectAnomaliesZScore(values, threshold);
        }

        this.analysisResults.anomalies = {
            indices: anomalies,
            count: anomalies.length,
            method: method,
            threshold: threshold,
            detectionRate: anomalies.length / values.length
        };
    }

    detectAnomaliesZScore(values, threshold) {
        const mean = _.mean(values);
        const std = _.std(values);
        const anomalies = [];

        values.forEach((value, index) => {
            const zScore = Math.abs((value - mean) / std);
            if (zScore > threshold) {
                anomalies.push(index);
            }
        });

        return anomalies;
    }

    detectAnomaliesIQR(values, multiplier) {
        const sorted = [...values].sort((a, b) => a - b);
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - multiplier * iqr;
        const upperBound = q3 + multiplier * iqr;
        const anomalies = [];

        values.forEach((value, index) => {
            if (value < lowerBound || value > upperBound) {
                anomalies.push(index);
            }
        });

        return anomalies;
    }

    detectAnomaliesIsolationForest(values, contamination) {
        // Simplified isolation forest implementation
        const anomalies = [];
        const scores = this.calculateIsolationForestScores(values);

        values.forEach((value, index) => {
            if (scores[index] > contamination) {
                anomalies.push(index);
            }
        });

        return anomalies;
    }

    calculateIsolationForestScores(values) {
        // Simplified scoring based on deviation from median
        const median = _.median(values);
        const mad = _.median(values.map(v => Math.abs(v - median))); // Median absolute deviation

        return values.map(value => Math.abs(value - median) / (mad || 1));
    }

    generateForecast() {
        if (this.timeSeries.length < 50) {
            this.logToConsole('Insufficient data for forecasting', 'warning');
            return;
        }

        const model = document.getElementById('forecastModel').value;
        const horizon = parseInt(document.getElementById('forecastHorizon').value);
        const values = this.timeSeries.map(d => d.value);

        let forecast = [];
        let modelName = '';

        switch (model) {
            case 'arima':
                forecast = this.generateARIMAForecast(values, horizon);
                modelName = 'ARIMA';
                break;
            case 'exponential':
                forecast = this.generateExponentialForecast(values, horizon);
                modelName = 'Exponential Smoothing';
                break;
            case 'linear':
                forecast = this.generateLinearForecast(values, horizon);
                modelName = 'Linear Regression';
                break;
            case 'polynomial':
                forecast = this.generatePolynomialForecast(values, horizon);
                modelName = 'Polynomial';
                break;
            default:
                forecast = this.generateExponentialForecast(values, horizon);
                modelName = 'Exponential Smoothing';
        }

        // Calculate forecast accuracy metrics
        const accuracy = this.calculateForecastAccuracy(values, forecast);

        this.analysisResults.forecast = {
            values: forecast,
            horizon: horizon,
            model: modelName,
            accuracy: accuracy,
            timestamps: this.generateForecastTimestamps(horizon)
        };

        this.updateForecastChart();
        this.updateForecastMetrics();
        this.logToConsole(`Generated ${horizon}-step forecast using ${modelName}`);
    }

    generateARIMAForecast(values, horizon) {
        // Simplified ARIMA implementation (AR(1))
        const phi = 0.7; // Autoregressive parameter
        const forecast = [];
        let currentValue = values[values.length - 1];

        for (let i = 0; i < horizon; i++) {
            currentValue = phi * currentValue + (1 - phi) * _.mean(values.slice(-10));
            forecast.push(currentValue);
        }

        return forecast;
    }

    generateExponentialForecast(values, horizon) {
        const alpha = 0.3;
        let smoothed = values[0];

        for (let i = 1; i < values.length; i++) {
            smoothed = alpha * values[i] + (1 - alpha) * smoothed;
        }

        const forecast = [];
        for (let i = 0; i < horizon; i++) {
            forecast.push(smoothed);
        }

        return forecast;
    }

    generateLinearForecast(values, horizon) {
        const n = values.length;
        const x = values.map((v, i) => i);
        const sumX = _.sum(x);
        const sumY = _.sum(values);
        const sumXY = _.sum(x.map((xi, i) => xi * values[i]));
        const sumXX = _.sum(x.map(xi => xi * xi));

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const forecast = [];
        for (let i = 0; i < horizon; i++) {
            forecast.push(slope * (n + i) + intercept);
        }

        return forecast;
    }

    generatePolynomialForecast(values, horizon) {
        // Simple quadratic trend
        const n = values.length;
        const x = values.map((v, i) => i);
        const y = values;

        // Fit quadratic: y = a*x^2 + b*x + c
        const X = x.map(xi => [xi * xi, xi, 1]);
        const XT = _.zip(...X);
        const XTX = XT.map(row => row.map((val, i) => _.sum(row.map((r, j) => r * X[j][i]))));
        const XTY = XT.map(row => _.sum(row.map((r, i) => r * y[i])));

        // Simplified solution (this is a rough approximation)
        const a = 0.0001; // Small quadratic coefficient
        const b = (y[n-1] - y[0]) / n; // Linear slope
        const c = _.mean(y); // Average

        const forecast = [];
        for (let i = 0; i < horizon; i++) {
            const xi = n + i;
            forecast.push(a * xi * xi + b * xi + c);
        }

        return forecast;
    }

    calculateForecastAccuracy(actual, forecast) {
        if (actual.length === 0 || forecast.length === 0) return 0;

        const n = Math.min(actual.length, forecast.length);
        const errors = [];

        for (let i = 0; i < n; i++) {
            errors.push(Math.abs(actual[i] - forecast[i]));
        }

        const mae = _.mean(errors);
        const meanActual = _.mean(actual);

        return meanActual > 0 ? 1 - (mae / meanActual) : 0;
    }

    generateForecastTimestamps(horizon) {
        const timestamps = [];
        const lastTimestamp = this.timeSeries[this.timeSeries.length - 1].timestamp;

        for (let i = 1; i <= horizon; i++) {
            timestamps.push(new Date(lastTimestamp.getTime() + i * 60000)); // 1 minute intervals
        }

        return timestamps;
    }

    compareModels() {
        if (this.timeSeries.length < 50) {
            this.logToConsole('Insufficient data for model comparison', 'warning');
            return;
        }

        const values = this.timeSeries.map(d => d.value);
        const horizon = 10; // Short horizon for comparison
        const models = ['arima', 'exponential', 'linear', 'polynomial'];

        const results = models.map(model => {
            let forecast = [];
            switch (model) {
                case 'arima':
                    forecast = this.generateARIMAForecast(values, horizon);
                    break;
                case 'exponential':
                    forecast = this.generateExponentialForecast(values, horizon);
                    break;
                case 'linear':
                    forecast = this.generateLinearForecast(values, horizon);
                    break;
                case 'polynomial':
                    forecast = this.generatePolynomialForecast(values, horizon);
                    break;
            }

            const accuracy = this.calculateForecastAccuracy(values.slice(-horizon), forecast);
            return { model, accuracy };
        });

        results.sort((a, b) => b.accuracy - a.accuracy);

        let comparisonText = 'Model Comparison Results:\n\n';
        results.forEach((result, index) => {
            comparisonText += `${index + 1}. ${result.model}: ${(result.accuracy * 100).toFixed(2)}% accuracy\n`;
        });

        this.logToConsole(comparisonText);
    }

    updateCharts() {
        // Update time series chart
        const chartData = this.timeSeries.map(d => ({
            x: d.timestamp,
            y: d.value
        }));

        this.charts.timeseries.data.datasets[0].data = chartData;
        this.charts.timeseries.update();

        // Update trend components chart
        if (this.analysisResults.trend) {
            const datasets = [{
                label: 'Original Data',
                data: this.timeSeries.map((d, i) => ({ x: d.timestamp, y: d.value })),
                borderColor: 'rgba(37, 99, 235, 1)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.4
            }];

            if (this.analysisResults.trend.movingAverage) {
                datasets.push({
                    label: 'Moving Average',
                    data: this.timeSeries.map((d, i) => ({
                        x: d.timestamp,
                        y: this.analysisResults.trend.movingAverage[i]
                    })),
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderDash: [5, 5],
                    tension: 0.4
                });
            }

            this.charts.trendComponents.data.datasets = datasets;
            this.charts.trendComponents.update();
        }

        // Update seasonal decomposition chart
        if (this.analysisResults.seasonal) {
            const datasets = [{
                label: 'Original',
                data: this.timeSeries.map(d => ({ x: d.timestamp, y: d.value })),
                borderColor: 'rgba(37, 99, 235, 1)',
                tension: 0.4
            }, {
                label: 'Trend',
                data: this.timeSeries.map((d, i) => ({
                    x: d.timestamp,
                    y: this.analysisResults.seasonal.trend[i] || d.value
                })),
                borderColor: 'rgba(239, 68, 68, 1)',
                tension: 0.4
            }, {
                label: 'Seasonal',
                data: this.timeSeries.map((d, i) => ({
                    x: d.timestamp,
                    y: this.analysisResults.seasonal.seasonal[i % this.analysisResults.seasonal.period]
                })),
                borderColor: 'rgba(245, 158, 11, 1)',
                tension: 0.4
            }];

            this.charts.seasonalDecomp.data.datasets = datasets;
            this.charts.seasonalDecomp.update();
        }

        // Update anomaly chart
        if (this.analysisResults.anomalies) {
            const normalData = [];
            const anomalyData = [];

            this.timeSeries.forEach((d, i) => {
                const point = { x: d.timestamp, y: d.value };
                if (this.analysisResults.anomalies.indices.includes(i)) {
                    anomalyData.push(point);
                } else {
                    normalData.push(point);
                }
            });

            this.charts.anomaly.data.datasets[0].data = normalData;
            this.charts.anomaly.data.datasets[1].data = anomalyData;
            this.charts.anomaly.update();
        }

        // Update forecast chart
        if (this.analysisResults.forecast) {
            const historicalData = this.timeSeries.map(d => ({ x: d.timestamp, y: d.value }));
            const forecastData = this.analysisResults.forecast.timestamps.map((timestamp, i) => ({
                x: timestamp,
                y: this.analysisResults.forecast.values[i]
            }));

            this.charts.forecast.data.datasets = [{
                label: 'Historical Data',
                data: historicalData,
                borderColor: 'rgba(37, 99, 235, 1)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.4
            }, {
                label: 'Forecast',
                data: forecastData,
                borderColor: 'rgba(239, 68, 68, 1)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderDash: [5, 5],
                tension: 0.4
            }];

            this.charts.forecast.update();
        }
    }

    updateUI() {
        // Update metrics display
        document.getElementById('dataPointsCount').textContent = this.dataPoints.toLocaleString();
        document.getElementById('timeSeriesCount').textContent = this.timeSeries.length;
        document.getElementById('lastUpdateTime').textContent = this.lastUpdateTime.toLocaleTimeString();

        // Update trend overview
        if (this.analysisResults.trend) {
            const trendElement = document.getElementById('overallTrend');
            trendElement.textContent = this.analysisResults.trend.direction.charAt(0).toUpperCase() +
                                     this.analysisResults.trend.direction.slice(1);
            trendElement.className = `trend-display ${this.analysisResults.trend.direction}`;

            document.getElementById('overallTrendStrength').textContent =
                this.analysisResults.trend.strength.toFixed(3);
        }

        if (this.analysisResults.seasonal) {
            document.getElementById('seasonalityStrength').textContent =
                this.analysisResults.seasonal.strength.toFixed(3);
            document.getElementById('seasonalityBar').style.width =
                `${Math.min(this.analysisResults.seasonal.strength * 100, 100)}%`;
        }

        if (this.analysisResults.forecast) {
            document.getElementById('forecastAccuracy').textContent =
                `${(this.analysisResults.forecast.accuracy * 100).toFixed(2)}%`;
            document.getElementById('accuracyBar').style.width =
                `${Math.min(this.analysisResults.forecast.accuracy * 100, 100)}%`;
        }

        if (this.analysisResults.anomalies) {
            document.getElementById('anomalyCount').textContent = this.analysisResults.anomalies.count;

            let anomalyLevel = 'Low';
            const rate = this.analysisResults.anomalies.detectionRate;
            if (rate > 0.1) anomalyLevel = 'High';
            else if (rate > 0.05) anomalyLevel = 'Medium';

            document.getElementById('anomalyLevel').textContent = anomalyLevel;
        }

        // Update chart stats
        if (this.analysisResults.basicStats) {
            document.getElementById('meanValue').textContent = this.analysisResults.basicStats.mean.toFixed(2);
            document.getElementById('stdDevValue').textContent = this.analysisResults.basicStats.stdDev.toFixed(2);
            document.getElementById('minValue').textContent = this.analysisResults.basicStats.min.toFixed(2);
            document.getElementById('maxValue').textContent = this.analysisResults.basicStats.max.toFixed(2);
        }
    }

    updateAnalysisResultsDisplay() {
        // Update statistical summary
        const statSummary = document.getElementById('statisticalSummary');
        if (this.analysisResults.basicStats) {
            statSummary.innerHTML = `
                <div class="result-item">
                    <strong>Count:</strong> ${this.analysisResults.basicStats.count}
                </div>
                <div class="result-item">
                    <strong>Mean:</strong> ${this.analysisResults.basicStats.mean.toFixed(4)}
                </div>
                <div class="result-item">
                    <strong>Std Dev:</strong> ${this.analysisResults.basicStats.stdDev.toFixed(4)}
                </div>
                <div class="result-item">
                    <strong>Min/Max:</strong> ${this.analysisResults.basicStats.min.toFixed(2)} / ${this.analysisResults.basicStats.max.toFixed(2)}
                </div>
            `;
        }

        // Update model performance
        const modelPerformance = document.getElementById('modelPerformance');
        if (this.analysisResults.trend && this.analysisResults.seasonal) {
            modelPerformance.innerHTML = `
                <div class="result-item">
                    <strong>Trend Strength:</strong> ${(this.analysisResults.trend.strength * 100).toFixed(1)}%
                </div>
                <div class="result-item">
                    <strong>Seasonal Strength:</strong> ${(this.analysisResults.seasonal.strength * 100).toFixed(1)}%
                </div>
                <div class="result-item">
                    <strong>Trend Direction:</strong> ${this.analysisResults.trend.direction}
                </div>
                <div class="result-item">
                    <strong>Seasonal Period:</strong> ${this.analysisResults.seasonal.period} points
                </div>
            `;
        }

        // Update key insights
        const keyInsights = document.getElementById('keyInsights');
        const insights = this.generateKeyInsights();
        keyInsights.innerHTML = insights.map(insight =>
            `<div class="insight-item">${insight}</div>`
        ).join('');

        // Update recommendations
        this.updateRecommendations();
    }

    generateKeyInsights() {
        const insights = [];

        if (this.analysisResults.trend) {
            const strength = this.analysisResults.trend.strength;
            if (strength > 0.7) {
                insights.push('Strong trend detected - consider long-term forecasting models');
            } else if (strength < 0.3) {
                insights.push('Weak trend detected - focus on seasonal and residual components');
            }

            if (this.analysisResults.trend.direction === 'up') {
                insights.push('Upward trend indicates potential growth or increasing demand');
            } else if (this.analysisResults.trend.direction === 'down') {
                insights.push('Downward trend suggests declining patterns or reduced activity');
            }
        }

        if (this.analysisResults.seasonal) {
            const strength = this.analysisResults.seasonal.strength;
            if (strength > 0.6) {
                insights.push('Strong seasonal patterns detected - implement seasonal adjustment');
            }
        }

        if (this.analysisResults.anomalies) {
            const count = this.analysisResults.anomalies.count;
            const rate = this.analysisResults.anomalies.detectionRate;
            if (rate > 0.1) {
                insights.push('High anomaly rate detected - investigate data quality or system issues');
            } else if (count > 0) {
                insights.push(`${count} anomalies detected - monitor for unusual patterns`);
            }
        }

        if (this.analysisResults.forecast) {
            const accuracy = this.analysisResults.forecast.accuracy;
            if (accuracy > 0.8) {
                insights.push('High forecast accuracy - reliable predictions available');
            } else if (accuracy < 0.6) {
                insights.push('Low forecast accuracy - consider alternative models or more data');
            }
        }

        return insights.length > 0 ? insights : ['Analyzing data patterns...'];
    }

    updateRecommendations() {
        const recommendations = document.getElementById('recommendationsList');
        const recs = [];

        if (this.analysisResults.trend && this.analysisResults.trend.strength > 0.8) {
            recs.push({
                priority: 'High',
                text: 'Strong trend detected - implement trend-following strategies'
            });
        }

        if (this.analysisResults.seasonal && this.analysisResults.seasonal.strength > 0.7) {
            recs.push({
                priority: 'High',
                text: 'Strong seasonality detected - use seasonal adjustment for better predictions'
            });
        }

        if (this.analysisResults.anomalies && this.analysisResults.anomalies.detectionRate > 0.05) {
            recs.push({
                priority: 'Medium',
                text: 'Anomalies detected - investigate root causes and implement monitoring'
            });
        }

        if (this.timeSeries.length < 100) {
            recs.push({
                priority: 'Low',
                text: 'Limited data available - collect more observations for better analysis'
            });
        }

        recommendations.innerHTML = recs.map(rec =>
            `<div class="recommendation-item">
                <div class="recommendation-priority">${rec.priority} Priority:</div>
                <div class="recommendation-text">${rec.text}</div>
            </div>`
        ).join('');
    }

    updateForecastChart() {
        if (!this.analysisResults.forecast) return;

        const historicalData = this.timeSeries.map(d => ({ x: d.timestamp, y: d.value }));
        const forecastData = this.analysisResults.forecast.timestamps.map((timestamp, i) => ({
            x: timestamp,
            y: this.analysisResults.forecast.values[i]
        }));

        this.charts.forecast.data.datasets = [{
            label: 'Historical Data',
            data: historicalData,
            borderColor: 'rgba(37, 99, 235, 1)',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            tension: 0.4
        }, {
            label: 'Forecast',
            data: forecastData,
            borderColor: 'rgba(239, 68, 68, 1)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderDash: [5, 5],
            tension: 0.4
        }];

        this.charts.forecast.update();
    }

    updateForecastMetrics() {
        const metrics = document.getElementById('forecastMetrics');
        if (!this.analysisResults.forecast) return;

        metrics.innerHTML = `
            <div class="metric-item">
                <strong>Model:</strong> ${this.analysisResults.forecast.model}
            </div>
            <div class="metric-item">
                <strong>Horizon:</strong> ${this.analysisResults.forecast.horizon} steps
            </div>
            <div class="metric-item">
                <strong>Accuracy:</strong> ${(this.analysisResults.forecast.accuracy * 100).toFixed(2)}%
            </div>
            <div class="metric-item">
                <strong>Confidence:</strong> ${this.calculateForecastConfidence()}%
            </div>
        `;
    }

    calculateForecastConfidence() {
        // Simplified confidence calculation
        if (!this.analysisResults.forecast) return 0;

        const accuracy = this.analysisResults.forecast.accuracy;
        const dataSize = this.timeSeries.length;

        // Higher confidence with more data and better accuracy
        const confidence = Math.min(accuracy * 100 + Math.log10(dataSize) * 10, 95);
        return Math.max(confidence, 50);
    }

    logToConsole(message, type = 'info') {
        const consoleElement = document.getElementById('dataStreamContainer');
        if (!consoleElement) return;

        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        logEntry.textContent = `[${timestamp}] ${message}`;

        consoleElement.appendChild(logEntry);
        consoleElement.scrollTop = consoleElement.scrollHeight;

        // Keep only last 100 log entries
        while (consoleElement.children.length > 100) {
            consoleElement.removeChild(consoleElement.firstChild);
        }
    }

    clearAnalysis() {
        this.timeSeries = [];
        this.dataPoints = 0;
        this.analysisResults = {};
        this.updateUI();
        this.updateCharts();
        this.logToConsole('Analysis cleared');
    }

    loadData() {
        document.getElementById('fileInput').click();
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.parseDataFile(e.target.result, file.name);
            } catch (error) {
                this.logToConsole(`Error loading file: ${error.message}`, 'error');
            }
        };
        reader.readAsText(file);
    }

    parseDataFile(content, filename) {
        const extension = filename.split('.').pop().toLowerCase();
        let data = [];

        try {
            if (extension === 'json') {
                data = JSON.parse(content);
            } else if (extension === 'csv') {
                data = this.parseCSV(content);
            } else {
                throw new Error('Unsupported file format');
            }

            this.processUploadedData(data);
        } catch (error) {
            this.logToConsole(`Error parsing ${extension.toUpperCase()} file: ${error.message}`, 'error');
        }
    }

    parseCSV(content) {
        const lines = content.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());

        const timeColumn = document.getElementById('timeColumn').value || 'timestamp';
        const valueColumn = document.getElementById('valueColumn').value || 'value';

        const timeIndex = headers.indexOf(timeColumn);
        const valueIndex = headers.indexOf(valueColumn);

        if (timeIndex === -1 || valueIndex === -1) {
            throw new Error(`Required columns '${timeColumn}' or '${valueColumn}' not found`);
        }

        return lines.slice(1).map((line, index) => {
            const values = line.split(',').map(v => v.trim());
            return {
                timestamp: new Date(values[timeIndex]),
                value: parseFloat(values[valueIndex]),
                id: index + 1
            };
        }).filter(d => !isNaN(d.value) && !isNaN(d.timestamp.getTime()));
    }

    processUploadedData(data) {
        this.timeSeries = data;
        this.dataPoints = data.length;
        this.processTimeSeries();
        this.updateUI();
        this.logToConsole(`Loaded ${data.length} data points from file`);
    }

    validateData() {
        if (this.timeSeries.length === 0) {
            this.logToConsole('No data to validate', 'warning');
            return;
        }

        const issues = [];

        // Check for missing values
        const missingValues = this.timeSeries.filter(d => isNaN(d.value)).length;
        if (missingValues > 0) {
            issues.push(`${missingValues} missing values detected`);
        }

        // Check for invalid timestamps
        const invalidTimestamps = this.timeSeries.filter(d => isNaN(d.timestamp.getTime())).length;
        if (invalidTimestamps > 0) {
            issues.push(`${invalidTimestamps} invalid timestamps detected`);
        }

        // Check for duplicates
        const uniqueTimestamps = new Set(this.timeSeries.map(d => d.timestamp.getTime()));
        const duplicates = this.timeSeries.length - uniqueTimestamps.size;
        if (duplicates > 0) {
            issues.push(`${duplicates} duplicate timestamps detected`);
        }

        // Check data range
        const values = this.timeSeries.map(d => d.value);
        const min = _.min(values);
        const max = _.max(values);
        if (max - min === 0) {
            issues.push('No variation in data values');
        }

        if (issues.length === 0) {
            this.logToConsole('Data validation passed - no issues found');
        } else {
            issues.forEach(issue => this.logToConsole(`Validation issue: ${issue}`, 'warning'));
        }
    }

    exportResults() {
        const results = {
            timestamp: new Date().toISOString(),
            summary: {
                dataPoints: this.dataPoints,
                timeSeriesCount: this.timeSeries.length,
                analysisResults: this.analysisResults
            },
            data: this.timeSeries.slice(0, 1000), // Export first 1000 points
            settings: this.settings
        };

        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `temporal-analysis-results-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.logToConsole('Analysis results exported');
    }

    switchTab(target) {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

        // Add active class to clicked tab
        target.classList.add('active');

        // Show corresponding pane
        const tabId = target.dataset.tab;
        document.getElementById(tabId + 'Tab').classList.add('active');
    }

    zoomChart(factor) {
        Object.values(this.charts).forEach(chart => {
            if (chart.options.plugins && chart.options.plugins.zoom) {
                chart.zoom(factor);
            }
        });
    }

    resetZoom() {
        Object.values(this.charts).forEach(chart => {
            if (chart.resetZoom) {
                chart.resetZoom();
            }
        });
    }

    loadSettings() {
        const defaultSettings = {
            updateFrequency: 5000,
            maxDataPoints: 50000,
            enableCaching: true,
            chartTheme: 'light',
            showGridlines: true,
            enableAnimations: true,
            exportFormat: 'json',
            includeMetadata: true
        };

        const saved = localStorage.getItem('temporalAnalysisSettings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    saveSettings() {
        this.settings = {
            updateFrequency: parseInt(document.getElementById('updateFrequency').value),
            maxDataPoints: parseInt(document.getElementById('maxDataPoints').value),
            enableCaching: document.getElementById('enableCaching').checked,
            chartTheme: document.getElementById('chartTheme').value,
            showGridlines: document.getElementById('showGridlines').checked,
            enableAnimations: document.getElementById('enableAnimations').checked,
            exportFormat: document.getElementById('exportFormat').value,
            includeMetadata: document.getElementById('includeMetadata').checked
        };

        localStorage.setItem('temporalAnalysisSettings', JSON.stringify(this.settings));
        this.closeModal();
        this.logToConsole('Settings saved');
    }

    resetSettingsToDefaults() {
        localStorage.removeItem('temporalAnalysisSettings');
        this.settings = this.loadSettings();
        this.applySettingsToUI();
        this.closeModal();
        this.logToConsole('Settings reset to defaults');
    }

    applySettingsToUI() {
        document.getElementById('updateFrequency').value = this.settings.updateFrequency;
        document.getElementById('maxDataPoints').value = this.settings.maxDataPoints;
        document.getElementById('enableCaching').checked = this.settings.enableCaching;
        document.getElementById('chartTheme').value = this.settings.chartTheme;
        document.getElementById('showGridlines').checked = this.settings.showGridlines;
        document.getElementById('enableAnimations').checked = this.settings.enableAnimations;
        document.getElementById('exportFormat').value = this.settings.exportFormat;
        document.getElementById('includeMetadata').checked = this.settings.includeMetadata;
    }

    loadSavedData() {
        const savedData = localStorage.getItem('temporalAnalysisData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.timeSeries = (data.timeSeries || []).map(d => ({
                ...d,
                timestamp: new Date(d.timestamp)
            }));
            this.dataPoints = data.dataPoints || 0;
        }
    }

    saveData() {
        const dataToSave = {
            timeSeries: this.timeSeries.slice(-this.maxDataPoints).map(d => ({
                ...d,
                timestamp: d.timestamp.toISOString()
            })),
            dataPoints: this.dataPoints,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('temporalAnalysisData', JSON.stringify(dataToSave));
    }

    startPeriodicUpdates() {
        // Save data every 30 seconds
        setInterval(() => {
            this.saveData();
        }, 30000);

        // Update recommendations every minute
        setInterval(() => {
            this.updateRecommendations();
        }, 60000);
    }

    updateStatusIndicator(status, text) {
        const indicator = document.getElementById('analysisStatus');
        const dot = indicator.querySelector('.status-dot');
        const textSpan = indicator.querySelector('.status-text');

        dot.className = `status-dot ${status}`;
        textSpan.textContent = text;
    }

    closeModal() {
        document.getElementById('dataPreviewModal').style.display = 'none';
        document.getElementById('settingsModal').style.display = 'none';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.temporalAnalysisEngine = new TemporalTrendAnalysisEngine();
});