/**
 * Real-Time Bias Audit Console
 * Advanced bias detection and monitoring system
 * Version 1.0.0
 */

class RealTimeBiasAuditConsole {
    constructor() {
        this.isRunning = false;
        this.dataPointsProcessed = 0;
        this.activeAlerts = 0;
        this.auditFrequency = 1000;
        this.biasThreshold = 0.1;
        this.sampleSize = 1000;
        this.lastUpdateTime = new Date();
        this.alerts = [];
        this.auditHistory = [];
        this.biasMetrics = {
            overall: 0,
            demographicParity: 0,
            equalOpportunity: 0,
            disparateImpact: 0
        };
        this.charts = {};
        this.settings = this.loadSettings();
        this.initialize();
    }

    initialize() {
        this.bindEvents();
        this.initializeCharts();
        this.loadSavedData();
        this.updateUI();
        this.startPeriodicUpdates();
        console.log('Real-Time Bias Audit Console initialized');
    }

    bindEvents() {
        // Main controls
        document.getElementById('startAuditBtn').addEventListener('click', () => this.startAudit());
        document.getElementById('stopAuditBtn').addEventListener('click', () => this.stopAudit());
        document.getElementById('loadDataBtn').addEventListener('click', () => this.loadTestData());
        document.getElementById('exportReportBtn').addEventListener('click', () => this.exportReport());
        document.getElementById('clearConsoleBtn').addEventListener('click', () => this.clearConsole());

        // Data source controls
        document.getElementById('connectDataSourceBtn').addEventListener('click', () => this.connectDataSource());
        document.getElementById('disconnectDataSourceBtn').addEventListener('click', () => this.disconnectDataSource());

        // Stream controls
        document.getElementById('pauseStreamBtn').addEventListener('click', () => this.pauseStream());
        document.getElementById('resumeStreamBtn').addEventListener('click', () => this.resumeStream());
        document.getElementById('resetStreamBtn').addEventListener('click', () => this.resetStream());

        // Alert controls
        document.getElementById('acknowledgeAllBtn').addEventListener('click', () => this.acknowledgeAllAlerts());
        document.getElementById('clearAlertsBtn').addEventListener('click', () => this.clearAlerts());

        // Report controls
        document.getElementById('generateReportBtn').addEventListener('click', () => this.generateReport());

        // Trend controls
        document.getElementById('updateTrendsBtn').addEventListener('click', () => this.updateTrends());

        // Settings controls
        document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());
        document.getElementById('resetSettingsBtn').addEventListener('click', () => this.resetSettingsToDefaults());

        // Modal controls
        document.querySelectorAll('.modal-close').forEach(close => {
            close.addEventListener('click', () => this.closeModal());
        });

        // Tab controls
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target));
        });

        // Range input updates
        document.getElementById('auditFrequency').addEventListener('input', (e) => {
            document.getElementById('auditFrequencyValue').textContent = e.target.value;
            this.auditFrequency = parseInt(e.target.value);
        });

        document.getElementById('biasThreshold').addEventListener('input', (e) => {
            document.getElementById('biasThresholdValue').textContent = parseFloat(e.target.value).toFixed(2);
            this.biasThreshold = parseFloat(e.target.value);
        });

        document.getElementById('confidenceLevel').addEventListener('input', (e) => {
            document.getElementById('confidenceLevelValue').textContent = parseFloat(e.target.value).toFixed(2);
        });

        // File input
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileUpload(e));
    }

    initializeCharts() {
        // Bias Distribution Chart
        const biasDistributionCtx = document.getElementById('biasDistributionChart').getContext('2d');
        this.charts.biasDistribution = new Chart(biasDistributionCtx, {
            type: 'radar',
            data: {
                labels: ['Gender', 'Race', 'Age', 'Income', 'Geography', 'Culture'],
                datasets: [{
                    label: 'Bias Score',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(37, 99, 235, 0.2)',
                    borderColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(37, 99, 235, 1)',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 1
                    }
                }
            }
        });

        // Bias Over Time Chart
        const biasOverTimeCtx = document.getElementById('biasOverTimeChart').getContext('2d');
        this.charts.biasOverTime = new Chart(biasOverTimeCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Overall Bias',
                    data: [],
                    borderColor: 'rgba(239, 68, 68, 1)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
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

        // Attribute Correlation Chart
        const attributeCorrelationCtx = document.getElementById('attributeCorrelationChart').getContext('2d');
        this.charts.attributeCorrelation = new Chart(attributeCorrelationCtx, {
            type: 'heatmap',
            data: {
                labels: ['Gender', 'Race', 'Age', 'Income'],
                datasets: [{
                    label: 'Correlation',
                    data: [0.1, 0.3, 0.2, 0.4],
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            }
        });

        // Trend Chart
        const trendCtx = document.getElementById('trendChart').getContext('2d');
        this.charts.trend = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Bias Trend',
                    data: [],
                    borderColor: 'rgba(37, 99, 235, 1)',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4
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
    }

    startAudit() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.updateStatusIndicator('running', 'Running');
        document.getElementById('startAuditBtn').disabled = true;
        document.getElementById('stopAuditBtn').disabled = false;

        this.auditInterval = setInterval(() => {
            this.performAuditCycle();
        }, this.auditFrequency);

        this.logToConsole('Audit started - Real-time monitoring active');
        console.log('Real-time bias audit started');
    }

    stopAudit() {
        if (!this.isRunning) return;

        this.isRunning = false;
        this.updateStatusIndicator('stopped', 'Stopped');
        document.getElementById('startAuditBtn').disabled = false;
        document.getElementById('stopAuditBtn').disabled = true;

        if (this.auditInterval) {
            clearInterval(this.auditInterval);
            this.auditInterval = null;
        }

        this.logToConsole('Audit stopped');
        console.log('Real-time bias audit stopped');
    }

    performAuditCycle() {
        try {
            // Generate or process data
            const dataBatch = this.generateTestData();
            this.processDataBatch(dataBatch);

            // Update metrics
            this.calculateBiasMetrics();
            this.updateCharts();

            // Check for alerts
            this.checkForAlerts();

            // Update UI
            this.updateUI();
            this.lastUpdateTime = new Date();

        } catch (error) {
            console.error('Audit cycle error:', error);
            this.logToConsole(`Error during audit cycle: ${error.message}`, 'error');
        }
    }

    generateTestData() {
        const batchSize = Math.floor(Math.random() * 50) + 10;
        const data = [];

        for (let i = 0; i < batchSize; i++) {
            data.push({
                id: this.dataPointsProcessed + i + 1,
                timestamp: new Date(),
                gender: Math.random() > 0.5 ? 'male' : 'female',
                race: ['white', 'black', 'asian', 'hispanic', 'other'][Math.floor(Math.random() * 5)],
                age: Math.floor(Math.random() * 60) + 18,
                income: Math.floor(Math.random() * 100000) + 20000,
                outcome: Math.random() > 0.7, // 70% positive outcomes
                prediction: Math.random() > 0.6, // 60% predicted positive
                confidence: Math.random()
            });
        }

        return data;
    }

    processDataBatch(data) {
        this.dataPointsProcessed += data.length;

        // Add to audit history
        this.auditHistory.push(...data);

        // Keep only last 10000 records for performance
        if (this.auditHistory.length > 10000) {
            this.auditHistory = this.auditHistory.slice(-10000);
        }

        // Log to console
        this.logToConsole(`Processed ${data.length} data points. Total: ${this.dataPointsProcessed}`);
    }

    calculateBiasMetrics() {
        if (this.auditHistory.length < this.sampleSize) return;

        const sample = this.auditHistory.slice(-this.sampleSize);

        // Calculate various bias metrics
        this.biasMetrics.overall = this.calculateOverallBias(sample);
        this.biasMetrics.demographicParity = this.calculateDemographicParity(sample);
        this.biasMetrics.equalOpportunity = this.calculateEqualOpportunity(sample);
        this.biasMetrics.disparateImpact = this.calculateDisparateImpact(sample);

        // Update detailed metrics
        this.updateDetailedMetrics(sample);
    }

    calculateOverallBias(sample) {
        // Simple bias calculation based on prediction accuracy differences
        const groups = _.groupBy(sample, 'gender');
        const biasScores = [];

        for (const [group, data] of Object.entries(groups)) {
            const accuracy = data.filter(d => d.outcome === d.prediction).length / data.length;
            biasScores.push(Math.abs(0.5 - accuracy)); // Distance from random guessing
        }

        return _.mean(biasScores);
    }

    calculateDemographicParity(sample) {
        const groups = _.groupBy(sample, 'gender');
        const positiveRates = [];

        for (const [group, data] of Object.entries(groups)) {
            const positiveRate = data.filter(d => d.prediction).length / data.length;
            positiveRates.push(positiveRate);
        }

        return _.max(positiveRates) - _.min(positiveRates);
    }

    calculateEqualOpportunity(sample) {
        const groups = _.groupBy(sample, 'gender');
        const truePositiveRates = [];

        for (const [group, data] of Object.entries(groups)) {
            const actualPositives = data.filter(d => d.outcome);
            const truePositives = actualPositives.filter(d => d.prediction).length;
            const tpr = actualPositives.length > 0 ? truePositives / actualPositives.length : 0;
            truePositiveRates.push(tpr);
        }

        return _.max(truePositiveRates) - _.min(truePositiveRates);
    }

    calculateDisparateImpact(sample) {
        const groups = _.groupBy(sample, 'gender');
        const selectionRates = [];

        for (const [group, data] of Object.entries(groups)) {
            const selectionRate = data.filter(d => d.prediction).length / data.length;
            selectionRates.push(selectionRate);
        }

        const maxRate = _.max(selectionRates);
        const minRate = _.min(selectionRates);

        return minRate > 0 ? maxRate / minRate : 0;
    }

    updateDetailedMetrics(sample) {
        // Statistical Tests
        const statisticalTests = document.getElementById('statisticalTests');
        statisticalTests.innerHTML = `
            <div class="detail-item">
                <span class="detail-label">Chi-Square Test:</span>
                <span class="detail-value">${this.performChiSquareTest(sample).toFixed(4)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">T-Test:</span>
                <span class="detail-value">${this.performTTest(sample).toFixed(4)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">ANOVA:</span>
                <span class="detail-value">${this.performANOVA(sample).toFixed(4)}</span>
            </div>
        `;

        // ML Fairness Metrics
        const mlMetrics = document.getElementById('mlMetrics');
        mlMetrics.innerHTML = `
            <div class="detail-item">
                <span class="detail-label">Precision:</span>
                <span class="detail-value">${this.calculatePrecision(sample).toFixed(4)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Recall:</span>
                <span class="detail-value">${this.calculateRecall(sample).toFixed(4)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">F1-Score:</span>
                <span class="detail-value">${this.calculateF1Score(sample).toFixed(4)}</span>
            </div>
        `;

        // Fairness Metrics
        const fairnessMetrics = document.getElementById('fairnessMetrics');
        fairnessMetrics.innerHTML = `
            <div class="detail-item">
                <span class="detail-label">Predictive Parity:</span>
                <span class="detail-value">${this.calculatePredictiveParity(sample).toFixed(4)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Calibration:</span>
                <span class="detail-value">${this.calculateCalibration(sample).toFixed(4)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Balance:</span>
                <span class="detail-value">${this.calculateBalance(sample).toFixed(4)}</span>
            </div>
        `;
    }

    performChiSquareTest(sample) {
        // Simplified chi-square test for independence
        const contingencyTable = this.buildContingencyTable(sample);
        const expected = this.calculateExpectedValues(contingencyTable);
        let chiSquare = 0;

        for (let i = 0; i < contingencyTable.length; i++) {
            for (let j = 0; j < contingencyTable[i].length; j++) {
                const observed = contingencyTable[i][j];
                const exp = expected[i][j];
                if (exp > 0) {
                    chiSquare += Math.pow(observed - exp, 2) / exp;
                }
            }
        }

        return chiSquare;
    }

    performTTest(sample) {
        // Simplified t-test between two groups
        const groups = _.groupBy(sample, 'gender');
        const group1 = groups.male || [];
        const group2 = groups.female || [];

        if (group1.length === 0 || group2.length === 0) return 0;

        const mean1 = _.mean(group1.map(d => d.confidence));
        const mean2 = _.mean(group2.map(d => d.confidence));
        const var1 = _.variance(group1.map(d => d.confidence));
        const var2 = _.variance(group2.map(d => d.confidence));

        const n1 = group1.length;
        const n2 = group2.length;

        const t = Math.abs(mean1 - mean2) / Math.sqrt((var1 / n1) + (var2 / n2));
        return t;
    }

    performANOVA(sample) {
        // Simplified one-way ANOVA
        const groups = _.groupBy(sample, 'race');
        const groupMeans = Object.values(groups).map(g => _.mean(g.map(d => d.confidence)));
        const overallMean = _.mean(sample.map(d => d.confidence));

        const ssb = groupMeans.reduce((sum, mean) => sum + Math.pow(mean - overallMean, 2), 0);
        const ssw = Object.values(groups).reduce((sum, g) => {
            const groupMean = _.mean(g.map(d => d.confidence));
            return sum + g.reduce((gsum, d) => gsum + Math.pow(d.confidence - groupMean, 2), 0);
        }, 0);

        const dfb = Object.keys(groups).length - 1;
        const dfw = sample.length - Object.keys(groups).length;

        return dfb > 0 ? (ssb / dfb) / (ssw / dfw) : 0;
    }

    calculatePrecision(sample) {
        const truePositives = sample.filter(d => d.prediction && d.outcome).length;
        const falsePositives = sample.filter(d => d.prediction && !d.outcome).length;
        return (truePositives + falsePositives) > 0 ? truePositives / (truePositives + falsePositives) : 0;
    }

    calculateRecall(sample) {
        const truePositives = sample.filter(d => d.prediction && d.outcome).length;
        const falseNegatives = sample.filter(d => !d.prediction && d.outcome).length;
        return (truePositives + falseNegatives) > 0 ? truePositives / (truePositives + falseNegatives) : 0;
    }

    calculateF1Score(sample) {
        const precision = this.calculatePrecision(sample);
        const recall = this.calculateRecall(sample);
        return (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
    }

    calculatePredictiveParity(sample) {
        // Predictive parity measures if precision is equal across groups
        const groups = _.groupBy(sample, 'gender');
        const precisions = [];

        for (const [group, data] of Object.entries(groups)) {
            const tp = data.filter(d => d.prediction && d.outcome).length;
            const fp = data.filter(d => d.prediction && !d.outcome).length;
            const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
            precisions.push(precision);
        }

        return _.max(precisions) - _.min(precisions);
    }

    calculateCalibration(sample) {
        // Simplified calibration check
        const bins = _.groupBy(sample, d => Math.floor(d.confidence * 10) / 10);
        let totalCalibrationError = 0;
        let count = 0;

        for (const [bin, data] of Object.entries(bins)) {
            const avgConfidence = _.mean(data.map(d => d.confidence));
            const avgAccuracy = _.mean(data.map(d => d.prediction === d.outcome ? 1 : 0));
            totalCalibrationError += Math.abs(avgConfidence - avgAccuracy);
            count++;
        }

        return count > 0 ? totalCalibrationError / count : 0;
    }

    calculateBalance(sample) {
        // Check balance of positive outcomes across groups
        const groups = _.groupBy(sample, 'gender');
        const outcomeRates = [];

        for (const [group, data] of Object.entries(groups)) {
            const outcomeRate = _.mean(data.map(d => d.outcome ? 1 : 0));
            outcomeRates.push(outcomeRate);
        }

        return _.max(outcomeRates) - _.min(outcomeRates);
    }

    buildContingencyTable(sample) {
        // Build 2x2 contingency table for gender vs outcome
        const malePositive = sample.filter(d => d.gender === 'male' && d.outcome).length;
        const maleNegative = sample.filter(d => d.gender === 'male' && !d.outcome).length;
        const femalePositive = sample.filter(d => d.gender === 'female' && d.outcome).length;
        const femaleNegative = sample.filter(d => d.gender === 'female' && !d.outcome).length;

        return [
            [malePositive, maleNegative],
            [femalePositive, femaleNegative]
        ];
    }

    calculateExpectedValues(contingencyTable) {
        const rowTotals = contingencyTable.map(row => row.reduce((a, b) => a + b, 0));
        const colTotals = contingencyTable[0].map((_, i) => contingencyTable.reduce((sum, row) => sum + row[i], 0));
        const total = rowTotals.reduce((a, b) => a + b, 0);

        const expected = [];
        for (let i = 0; i < contingencyTable.length; i++) {
            expected[i] = [];
            for (let j = 0; j < contingencyTable[i].length; j++) {
                expected[i][j] = (rowTotals[i] * colTotals[j]) / total;
            }
        }

        return expected;
    }

    updateCharts() {
        // Update bias distribution chart
        const biasScores = [
            this.calculateBiasByAttribute(this.auditHistory.slice(-this.sampleSize), 'gender'),
            this.calculateBiasByAttribute(this.auditHistory.slice(-this.sampleSize), 'race'),
            this.calculateBiasByAttribute(this.auditHistory.slice(-this.sampleSize), 'age'),
            this.calculateBiasByAttribute(this.auditHistory.slice(-this.sampleSize), 'income'),
            0, // Geography placeholder
            0  // Culture placeholder
        ];

        this.charts.biasDistribution.data.datasets[0].data = biasScores;
        this.charts.biasDistribution.update();

        // Update bias over time chart
        const timeLabels = [];
        const biasValues = [];

        for (let i = 10; i >= 0; i--) {
            const startIndex = Math.max(0, this.auditHistory.length - (i + 1) * 100);
            const endIndex = Math.max(0, this.auditHistory.length - i * 100);
            const subset = this.auditHistory.slice(startIndex, endIndex);

            if (subset.length > 0) {
                timeLabels.push(`${i * 10}s ago`);
                biasValues.push(this.calculateOverallBias(subset));
            }
        }

        this.charts.biasOverTime.data.labels = timeLabels.reverse();
        this.charts.biasOverTime.data.datasets[0].data = biasValues.reverse();
        this.charts.biasOverTime.update();
    }

    calculateBiasByAttribute(sample, attribute) {
        if (sample.length === 0) return 0;

        const groups = _.groupBy(sample, attribute);
        const outcomeRates = Object.values(groups).map(g =>
            g.filter(d => d.outcome).length / g.length
        );

        return _.max(outcomeRates) - _.min(outcomeRates);
    }

    checkForAlerts() {
        const alerts = [];

        // Check overall bias threshold
        if (this.biasMetrics.overall > this.biasThreshold) {
            alerts.push({
                id: Date.now() + '_overall',
                type: 'critical',
                title: 'High Overall Bias Detected',
                message: `Overall bias score (${this.biasMetrics.overall.toFixed(3)}) exceeds threshold (${this.biasThreshold})`,
                timestamp: new Date(),
                acknowledged: false
            });
        }

        // Check demographic parity
        if (this.biasMetrics.demographicParity > this.biasThreshold) {
            alerts.push({
                id: Date.now() + '_demographic',
                type: 'high',
                title: 'Demographic Parity Violation',
                message: `Demographic parity difference (${this.biasMetrics.demographicParity.toFixed(3)}) exceeds threshold`,
                timestamp: new Date(),
                acknowledged: false
            });
        }

        // Check disparate impact
        if (this.biasMetrics.disparateImpact > 2.0) {
            alerts.push({
                id: Date.now() + '_disparate',
                type: 'high',
                title: 'Disparate Impact Detected',
                message: `Disparate impact ratio (${this.biasMetrics.disparateImpact.toFixed(2)}) indicates potential discrimination`,
                timestamp: new Date(),
                acknowledged: false
            });
        }

        // Add new alerts
        alerts.forEach(alert => {
            if (!this.alerts.find(a => a.id === alert.id)) {
                this.alerts.unshift(alert);
                this.activeAlerts++;
                this.logToConsole(`ALERT: ${alert.title}`, 'warning');
            }
        });

        // Keep only last 100 alerts
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(0, 100);
        }

        this.updateAlertsDisplay();
    }

    updateAlertsDisplay() {
        const alertsList = document.getElementById('alertsList');
        alertsList.innerHTML = '';

        this.alerts.slice(0, 20).forEach(alert => {
            const alertElement = document.createElement('div');
            alertElement.className = `alert-item ${alert.type}`;
            alertElement.innerHTML = `
                <div class="alert-title">${alert.title}</div>
                <div class="alert-message">${alert.message}</div>
                <div class="alert-time">${alert.timestamp.toLocaleTimeString()}</div>
            `;
            alertsList.appendChild(alertElement);
        });

        // Update alert counts
        const criticalCount = this.alerts.filter(a => a.type === 'critical' && !a.acknowledged).length;
        const highCount = this.alerts.filter(a => a.type === 'high' && !a.acknowledged).length;
        const mediumCount = this.alerts.filter(a => a.type === 'medium' && !a.acknowledged).length;
        const lowCount = this.alerts.filter(a => a.type === 'low' && !a.acknowledged).length;

        document.getElementById('criticalAlerts').textContent = criticalCount;
        document.getElementById('highAlerts').textContent = highCount;
        document.getElementById('mediumAlerts').textContent = mediumCount;
        document.getElementById('lowAlerts').textContent = lowCount;
    }

    updateUI() {
        // Update metrics display
        document.getElementById('dataPointsProcessed').textContent = this.dataPointsProcessed.toLocaleString();
        document.getElementById('activeAlerts').textContent = this.activeAlerts;
        document.getElementById('lastUpdateTime').textContent = this.lastUpdateTime.toLocaleTimeString();

        // Update bias scores
        document.getElementById('overallBiasScore').textContent = this.biasMetrics.overall.toFixed(3);
        document.getElementById('overallBiasBar').style.width = `${Math.min(this.biasMetrics.overall * 100, 100)}%`;

        document.getElementById('demographicParityScore').textContent = this.biasMetrics.demographicParity.toFixed(3);
        document.getElementById('demographicParityBar').style.width = `${Math.min(this.biasMetrics.demographicParity * 100, 100)}%`;

        document.getElementById('equalOpportunityScore').textContent = this.biasMetrics.equalOpportunity.toFixed(3);
        document.getElementById('equalOpportunityBar').style.width = `${Math.min(this.biasMetrics.equalOpportunity * 100, 100)}%`;

        document.getElementById('disparateImpactScore').textContent = this.biasMetrics.disparateImpact.toFixed(2);
        document.getElementById('disparateImpactBar').style.width = `${Math.min((this.biasMetrics.disparateImpact - 1) * 50, 100)}%`;

        // Update stream stats
        const recentData = this.auditHistory.slice(-100);
        const recordsPerSecond = recentData.length > 0 ?
            Math.round(recentData.length / ((Date.now() - recentData[0].timestamp) / 1000)) : 0;
        const errorRate = recentData.length > 0 ?
            (recentData.filter(d => !d.outcome && d.prediction).length / recentData.length * 100).toFixed(2) : '0.00';

        document.getElementById('recordsPerSecond').textContent = recordsPerSecond;
        document.getElementById('totalRecords').textContent = this.auditHistory.length.toLocaleString();
        document.getElementById('errorRate').textContent = `${errorRate}%`;
    }

    logToConsole(message, type = 'info') {
        const consoleElement = document.getElementById('dataStreamContainer');
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

    clearConsole() {
        document.getElementById('dataStreamContainer').innerHTML = '';
        this.logToConsole('Console cleared');
    }

    loadTestData() {
        const testData = this.generateTestData();
        this.processDataBatch(testData);
        this.calculateBiasMetrics();
        this.updateUI();
        this.logToConsole(`Loaded ${testData.length} test data points`);
    }

    connectDataSource() {
        const dataSource = document.getElementById('dataSourceSelect').value;
        this.logToConsole(`Connecting to data source: ${dataSource}`);

        // Simulate connection
        setTimeout(() => {
            this.logToConsole(`Connected to ${dataSource} data source`);
            document.getElementById('connectDataSourceBtn').disabled = true;
            document.getElementById('disconnectDataSourceBtn').disabled = false;
        }, 1000);
    }

    disconnectDataSource() {
        this.logToConsole('Disconnecting from data source');
        document.getElementById('connectDataSourceBtn').disabled = false;
        document.getElementById('disconnectDataSourceBtn').disabled = true;
    }

    pauseStream() {
        if (this.auditInterval) {
            clearInterval(this.auditInterval);
            this.auditInterval = null;
        }
        this.logToConsole('Data stream paused');
    }

    resumeStream() {
        if (!this.auditInterval && this.isRunning) {
            this.auditInterval = setInterval(() => {
                this.performAuditCycle();
            }, this.auditFrequency);
        }
        this.logToConsole('Data stream resumed');
    }

    resetStream() {
        this.auditHistory = [];
        this.dataPointsProcessed = 0;
        this.updateUI();
        this.logToConsole('Data stream reset');
    }

    acknowledgeAllAlerts() {
        this.alerts.forEach(alert => alert.acknowledged = true);
        this.activeAlerts = 0;
        this.updateAlertsDisplay();
        this.updateUI();
        this.logToConsole('All alerts acknowledged');
    }

    clearAlerts() {
        this.alerts = [];
        this.activeAlerts = 0;
        this.updateAlertsDisplay();
        this.updateUI();
        this.logToConsole('All alerts cleared');
    }

    generateReport() {
        const reportType = document.getElementById('reportType').value;
        const reportPeriod = document.getElementById('reportPeriod').value;

        let reportContent = `# Bias Audit Report\n\n`;
        reportContent += `Generated: ${new Date().toLocaleString()}\n\n`;

        reportContent += `## Summary\n`;
        reportContent += `- Total Data Points: ${this.dataPointsProcessed}\n`;
        reportContent += `- Active Alerts: ${this.activeAlerts}\n`;
        reportContent += `- Overall Bias Score: ${this.biasMetrics.overall.toFixed(3)}\n\n`;

        reportContent += `## Bias Metrics\n`;
        reportContent += `- Demographic Parity: ${this.biasMetrics.demographicParity.toFixed(3)}\n`;
        reportContent += `- Equal Opportunity: ${this.biasMetrics.equalOpportunity.toFixed(3)}\n`;
        reportContent += `- Disparate Impact: ${this.biasMetrics.disparateImpact.toFixed(2)}\n\n`;

        if (this.alerts.length > 0) {
            reportContent += `## Recent Alerts\n`;
            this.alerts.slice(0, 10).forEach(alert => {
                reportContent += `- **${alert.type.toUpperCase()}**: ${alert.title} (${alert.timestamp.toLocaleString()})\n`;
            });
        }

        document.getElementById('reportViewer').innerHTML = `<pre>${reportContent}</pre>`;
        this.logToConsole('Report generated');
    }

    updateTrends() {
        const metric = document.getElementById('trendMetric').value;
        const timeframe = document.getElementById('trendTimeframe').value;

        // Generate trend data based on selected metric and timeframe
        const trendData = this.generateTrendData(metric, timeframe);

        this.charts.trend.data.labels = trendData.labels;
        this.charts.trend.data.datasets[0].data = trendData.values;
        this.charts.trend.data.datasets[0].label = metric.replace('-', ' ').toUpperCase();
        this.charts.trend.update();

        // Update insights
        const insights = this.generateTrendInsights(trendData);
        document.getElementById('trendInsights').innerHTML = insights;

        this.logToConsole(`Trends updated for ${metric} over ${timeframe}`);
    }

    generateTrendData(metric, timeframe) {
        const periods = {
            '1h': 6,    // 6 data points for 1 hour (10 min intervals)
            '6h': 36,   // 36 data points for 6 hours
            '24h': 144, // 144 data points for 24 hours
            '7d': 1008, // 1008 data points for 7 days
            '30d': 4320 // 4320 data points for 30 days
        };

        const numPoints = periods[timeframe] || 24;
        const labels = [];
        const values = [];

        for (let i = numPoints - 1; i >= 0; i--) {
            const timestamp = new Date(Date.now() - i * (3600000 / (numPoints / 24))); // Distribute over timeframe
            labels.push(timestamp.toLocaleTimeString());

            // Generate realistic trend data
            let value;
            switch (metric) {
                case 'overall-bias':
                    value = Math.max(0, Math.min(1, 0.1 + Math.sin(i * 0.1) * 0.05 + Math.random() * 0.02));
                    break;
                case 'demographic-parity':
                    value = Math.max(0, Math.min(0.5, 0.05 + Math.cos(i * 0.15) * 0.03 + Math.random() * 0.01));
                    break;
                case 'equal-opportunity':
                    value = Math.max(0, Math.min(0.5, 0.03 + Math.sin(i * 0.2) * 0.02 + Math.random() * 0.01));
                    break;
                case 'disparate-impact':
                    value = Math.max(0.5, Math.min(2.0, 1.0 + Math.cos(i * 0.12) * 0.1 + Math.random() * 0.05));
                    break;
                default:
                    value = Math.random() * 0.2;
            }
            values.push(value);
        }

        return { labels, values };
    }

    generateTrendInsights(trendData) {
        const values = trendData.values;
        const avg = _.mean(values);
        const max = _.max(values);
        const min = _.min(values);
        const trend = values[values.length - 1] - values[0];
        const volatility = _.std(values);

        let insights = `<p><strong>Trend Analysis:</strong></p>`;
        insights += `<p>Average: ${avg.toFixed(3)}</p>`;
        insights += `<p>Range: ${min.toFixed(3)} - ${max.toFixed(3)}</p>`;
        insights += `<p>Overall Trend: ${trend > 0 ? 'Increasing' : trend < 0 ? 'Decreasing' : 'Stable'} (${trend.toFixed(3)})</p>`;
        insights += `<p>Volatility: ${volatility.toFixed(3)}</p>`;

        if (max > 0.1) {
            insights += `<p class="warning">⚠️ High bias levels detected in the period</p>`;
        }

        if (volatility > 0.05) {
            insights += `<p class="warning">⚠️ High variability suggests inconsistent bias patterns</p>`;
        }

        return insights;
    }

    exportReport() {
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                dataPointsProcessed: this.dataPointsProcessed,
                activeAlerts: this.activeAlerts,
                biasMetrics: this.biasMetrics
            },
            alerts: this.alerts.slice(0, 50),
            settings: this.settings
        };

        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bias-audit-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.logToConsole('Report exported');
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

    loadSettings() {
        const defaultSettings = {
            auditFrequency: 1000,
            biasThreshold: 0.1,
            sampleSize: 1000,
            autoAlerts: true,
            detailedLogging: true,
            emailAlerts: false,
            slackAlerts: false,
            alertCooldown: 5,
            algorithmType: 'hybrid',
            confidenceLevel: 0.95,
            batchSize: 100,
            dataAnonymization: false,
            realTimeProcessing: true
        };

        const saved = localStorage.getItem('biasAuditSettings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    saveSettings() {
        this.settings = {
            auditFrequency: parseInt(document.getElementById('auditFrequency').value),
            biasThreshold: parseFloat(document.getElementById('biasThreshold').value),
            sampleSize: parseInt(document.getElementById('sampleSize').value),
            autoAlerts: document.getElementById('autoAlerts').checked,
            detailedLogging: document.getElementById('detailedLogging').checked,
            emailAlerts: document.getElementById('emailAlerts').checked,
            slackAlerts: document.getElementById('slackAlerts').checked,
            alertCooldown: parseInt(document.getElementById('alertCooldown').value),
            algorithmType: document.getElementById('algorithmType').value,
            confidenceLevel: parseFloat(document.getElementById('confidenceLevel').value),
            batchSize: parseInt(document.getElementById('batchSize').value),
            dataAnonymization: document.getElementById('dataAnonymization').checked,
            realTimeProcessing: document.getElementById('realTimeProcessing').checked
        };

        localStorage.setItem('biasAuditSettings', JSON.stringify(this.settings));
        this.closeModal();
        this.logToConsole('Settings saved');
    }

    resetSettingsToDefaults() {
        localStorage.removeItem('biasAuditSettings');
        this.settings = this.loadSettings();
        this.applySettingsToUI();
        this.closeModal();
        this.logToConsole('Settings reset to defaults');
    }

    applySettingsToUI() {
        document.getElementById('auditFrequency').value = this.settings.auditFrequency;
        document.getElementById('auditFrequencyValue').textContent = this.settings.auditFrequency;
        document.getElementById('biasThreshold').value = this.settings.biasThreshold;
        document.getElementById('biasThresholdValue').textContent = this.settings.biasThreshold.toFixed(2);
        document.getElementById('sampleSize').value = this.settings.sampleSize;
        document.getElementById('autoAlerts').checked = this.settings.autoAlerts;
        document.getElementById('detailedLogging').checked = this.settings.detailedLogging;
        document.getElementById('emailAlerts').checked = this.settings.emailAlerts;
        document.getElementById('slackAlerts').checked = this.settings.slackAlerts;
        document.getElementById('alertCooldown').value = this.settings.alertCooldown;
        document.getElementById('algorithmType').value = this.settings.algorithmType;
        document.getElementById('confidenceLevel').value = this.settings.confidenceLevel;
        document.getElementById('confidenceLevelValue').textContent = this.settings.confidenceLevel.toFixed(2);
        document.getElementById('batchSize').value = this.settings.batchSize;
        document.getElementById('dataAnonymization').checked = this.settings.dataAnonymization;
        document.getElementById('realTimeProcessing').checked = this.settings.realTimeProcessing;
    }

    loadSavedData() {
        const savedData = localStorage.getItem('biasAuditData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.auditHistory = data.auditHistory || [];
            this.alerts = data.alerts || [];
            this.dataPointsProcessed = data.dataPointsProcessed || 0;
            this.activeAlerts = data.activeAlerts || 0;
        }
    }

    saveData() {
        const dataToSave = {
            auditHistory: this.auditHistory.slice(-5000), // Keep last 5000 records
            alerts: this.alerts.slice(0, 100), // Keep last 100 alerts
            dataPointsProcessed: this.dataPointsProcessed,
            activeAlerts: this.activeAlerts,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('biasAuditData', JSON.stringify(dataToSave));
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

    updateRecommendations() {
        const recommendations = document.getElementById('recommendationsList');
        const recs = [];

        if (this.biasMetrics.overall > 0.15) {
            recs.push({
                priority: 'High',
                text: 'Implement bias mitigation techniques such as reweighting or adversarial debiasing'
            });
        }

        if (this.biasMetrics.disparateImpact > 1.5) {
            recs.push({
                priority: 'High',
                text: 'Review model training data for representation imbalances across protected attributes'
            });
        }

        if (this.alerts.filter(a => !a.acknowledged).length > 5) {
            recs.push({
                priority: 'Medium',
                text: 'Establish regular bias monitoring schedule and alert response procedures'
            });
        }

        if (this.auditHistory.length < this.sampleSize) {
            recs.push({
                priority: 'Low',
                text: 'Collect more data to improve statistical reliability of bias measurements'
            });
        }

        recommendations.innerHTML = recs.map(rec =>
            `<div class="recommendation-item">
                <div class="recommendation-priority">${rec.priority} Priority:</div>
                <div class="recommendation-text">${rec.text}</div>
            </div>`
        ).join('');
    }

    updateStatusIndicator(status, text) {
        const indicator = document.getElementById('auditStatus');
        const dot = indicator.querySelector('.status-dot');
        const textSpan = indicator.querySelector('.status-text');

        dot.className = `status-dot ${status}`;
        textSpan.textContent = text;
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data)) {
                    this.processDataBatch(data);
                    this.calculateBiasMetrics();
                    this.updateUI();
                    this.logToConsole(`Loaded ${data.length} records from file`);
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (error) {
                this.logToConsole(`Error loading file: ${error.message}`, 'error');
            }
        };
        reader.readAsText(file);
    }

    closeModal() {
        document.getElementById('alertModal').style.display = 'none';
        document.getElementById('settingsModal').style.display = 'none';
    }

    showSettingsModal() {
        this.applySettingsToUI();
        document.getElementById('settingsModal').style.display = 'block';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.biasAuditConsole = new RealTimeBiasAuditConsole();
});