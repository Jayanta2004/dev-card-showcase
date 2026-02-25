// Autonomous Dataset Validator #5069 - Advanced Data Validation Engine

class DatasetValidator {
    constructor() {
        this.dataset = null;
        this.originalData = null;
        this.validationResults = null;
        this.cleanedData = null;
        this.charts = {};

        this.initializeEventListeners();
        this.initializeCharts();
    }

    initializeEventListeners() {
        // File upload
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('drop', this.handleFileDrop.bind(this));
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Validation
        document.getElementById('validateBtn').addEventListener('click', this.runValidation.bind(this));

        // Analysis tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', this.switchTab.bind(this));
        });

        // Cleaning
        document.getElementById('cleanBtn').addEventListener('click', this.runCleaning.bind(this));

        // Export
        document.getElementById('exportCleanBtn').addEventListener('click', this.exportCleanData.bind(this));
        document.getElementById('exportReportBtn').addEventListener('click', this.exportReport.bind(this));
    }

    initializeCharts() {
        // Initialize Chart.js instances
        const chartConfigs = {
            overviewChart: {
                type: 'doughnut',
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' },
                        title: { display: true, text: 'Data Quality Overview' }
                    }
                }
            },
            correlationChart: {
                type: 'heatmap',
                options: {
                    responsive: true,
                    plugins: {
                        title: { display: true, text: 'Feature Correlations' }
                    }
                }
            },
            distributionChart: {
                type: 'bar',
                options: {
                    responsive: true,
                    plugins: {
                        title: { display: true, text: 'Data Distributions' }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            }
        };

        Object.keys(chartConfigs).forEach(chartId => {
            const ctx = document.getElementById(chartId);
            if (ctx) {
                this.charts[chartId] = new Chart(ctx, chartConfigs[chartId]);
            }
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleFileDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    async processFile(file) {
        try {
            const fileExtension = file.name.split('.').pop().toLowerCase();

            if (fileExtension === 'csv') {
                this.dataset = await this.parseCSV(file);
            } else if (fileExtension === 'json') {
                this.dataset = await this.parseJSON(file);
            } else {
                throw new Error('Unsupported file format. Please upload CSV or JSON files.');
            }

            this.originalData = JSON.parse(JSON.stringify(this.dataset));
            this.updateFileInfo(file);
            this.enableValidation();

        } catch (error) {
            this.showError('File processing error: ' + error.message);
        }
    }

    async parseCSV(file) {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        reject(new Error('CSV parsing error: ' + results.errors[0].message));
                    } else {
                        resolve(results.data);
                    }
                },
                error: (error) => reject(error)
            });
        });
    }

    async parseJSON(file) {
        const text = await file.text();
        const data = JSON.parse(text);

        if (Array.isArray(data)) {
            return data;
        } else if (typeof data === 'object') {
            // Handle single object or nested structure
            return Array.isArray(data.data) ? data.data : [data];
        } else {
            throw new Error('Invalid JSON format. Expected array or object with data array.');
        }
    }

    updateFileInfo(file) {
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const rowCount = document.getElementById('rowCount');
        const colCount = document.getElementById('colCount');

        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);
        rowCount.textContent = this.dataset.length;
        colCount.textContent = Object.keys(this.dataset[0] || {}).length;

        fileInfo.style.display = 'block';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    enableValidation() {
        document.getElementById('validateBtn').disabled = false;
        document.getElementById('cleanBtn').disabled = false;
        document.getElementById('exportCleanBtn').disabled = false;
        document.getElementById('exportReportBtn').disabled = false;
    }

    async runValidation() {
        if (!this.dataset) return;

        this.showLoading('Running validation...');

        try {
            this.validationResults = {
                dataTypeIssues: [],
                missingValues: [],
                duplicates: [],
                outliers: [],
                consistencyIssues: [],
                qualityScore: 0,
                completenessScore: 0
            };

            // Run selected validations
            const checks = {
                dataTypeCheck: () => this.validateDataTypes(),
                missingCheck: () => this.detectMissingValues(),
                duplicateCheck: () => this.detectDuplicates(),
                outlierCheck: () => this.detectOutliers(),
                consistencyCheck: () => this.checkConsistency()
            };

            for (const [checkId, checkFn] of Object.entries(checks)) {
                if (document.getElementById(checkId).checked) {
                    await checkFn();
                }
            }

            this.calculateQualityScores();
            this.displayValidationResults();

        } catch (error) {
            this.showError('Validation error: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    validateDataTypes() {
        const columns = Object.keys(this.dataset[0] || {});
        const sampleSize = Math.min(100, this.dataset.length);

        columns.forEach(col => {
            const values = this.dataset.slice(0, sampleSize).map(row => row[col]).filter(val => val != null);
            const inferredType = this.inferDataType(values);

            // Check for type inconsistencies
            let inconsistentCount = 0;
            this.dataset.forEach(row => {
                if (row[col] != null && typeof row[col] !== inferredType) {
                    inconsistentCount++;
                }
            });

            if (inconsistentCount > 0) {
                this.validationResults.dataTypeIssues.push({
                    column: col,
                    expectedType: inferredType,
                    inconsistentCount: inconsistentCount,
                    severity: 'warning'
                });
            }
        });
    }

    inferDataType(values) {
        if (values.length === 0) return 'unknown';

        const typeCounts = {};
        values.forEach(val => {
            const type = typeof val;
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        // Check for date strings
        const dateCount = values.filter(val =>
            typeof val === 'string' && !isNaN(Date.parse(val))
        ).length;

        if (dateCount > values.length * 0.5) return 'date';

        // Return most common type
        return Object.keys(typeCounts).reduce((a, b) =>
            typeCounts[a] > typeCounts[b] ? a : b
        );
    }

    detectMissingValues() {
        const columns = Object.keys(this.dataset[0] || {});
        const threshold = parseFloat(document.getElementById('missingThreshold').value) / 100;

        columns.forEach(col => {
            const missingCount = this.dataset.filter(row =>
                row[col] == null || row[col] === '' || row[col] === undefined
            ).length;

            const missingPercentage = missingCount / this.dataset.length;

            if (missingPercentage > threshold) {
                this.validationResults.missingValues.push({
                    column: col,
                    count: missingCount,
                    percentage: (missingPercentage * 100).toFixed(2),
                    severity: missingPercentage > 0.1 ? 'error' : 'warning'
                });
            }
        });
    }

    detectDuplicates() {
        const seen = new Set();
        let duplicateCount = 0;

        this.dataset.forEach((row, index) => {
            const rowStr = JSON.stringify(row);
            if (seen.has(rowStr)) {
                duplicateCount++;
            } else {
                seen.add(rowStr);
            }
        });

        if (duplicateCount > 0) {
            this.validationResults.duplicates.push({
                count: duplicateCount,
                percentage: ((duplicateCount / this.dataset.length) * 100).toFixed(2),
                severity: duplicateCount > this.dataset.length * 0.05 ? 'error' : 'warning'
            });
        }
    }

    detectOutliers() {
        const columns = Object.keys(this.dataset[0] || {});
        const method = document.getElementById('outlierMethod').value;

        columns.forEach(col => {
            const values = this.dataset.map(row => parseFloat(row[col])).filter(val => !isNaN(val));
            if (values.length < 10) return; // Need minimum sample size

            let outliers = [];

            if (method === 'iqr') {
                outliers = this.detectOutliersIQR(values);
            } else if (method === 'zscore') {
                outliers = this.detectOutliersZScore(values);
            }

            if (outliers.length > 0) {
                this.validationResults.outliers.push({
                    column: col,
                    count: outliers.length,
                    method: method,
                    severity: 'warning'
                });
            }
        });
    }

    detectOutliersIQR(values) {
        const sorted = values.sort((a, b) => a - b);
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;

        return values.filter(val => val < lowerBound || val > upperBound);
    }

    detectOutliersZScore(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);

        return values.filter(val => Math.abs((val - mean) / std) > 3);
    }

    checkConsistency() {
        const columns = Object.keys(this.dataset[0] || {});

        // Check for logical inconsistencies
        columns.forEach(col => {
            const values = this.dataset.map(row => row[col]);

            // Email format validation
            if (col.toLowerCase().includes('email')) {
                const invalidEmails = values.filter(val =>
                    val && typeof val === 'string' && !this.isValidEmail(val)
                );
                if (invalidEmails.length > 0) {
                    this.validationResults.consistencyIssues.push({
                        column: col,
                        type: 'invalid_email',
                        count: invalidEmails.length,
                        severity: 'error'
                    });
                }
            }

            // Phone format validation
            if (col.toLowerCase().includes('phone')) {
                const invalidPhones = values.filter(val =>
                    val && typeof val === 'string' && !this.isValidPhone(val)
                );
                if (invalidPhones.length > 0) {
                    this.validationResults.consistencyIssues.push({
                        column: col,
                        type: 'invalid_phone',
                        count: invalidPhones.length,
                        severity: 'warning'
                    });
                }
            }
        });
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        return phoneRegex.test(cleanPhone);
    }

    calculateQualityScores() {
        const totalIssues = this.validationResults.dataTypeIssues.length +
                          this.validationResults.missingValues.length +
                          this.validationResults.duplicates.length +
                          this.validationResults.outliers.length +
                          this.validationResults.consistencyIssues.length;

        // Calculate completeness score
        const totalCells = this.dataset.length * Object.keys(this.dataset[0] || {}).length;
        const missingCells = this.dataset.reduce((acc, row) => {
            return acc + Object.values(row).filter(val => val == null || val === '').length;
        }, 0);

        this.validationResults.completenessScore = Math.round(((totalCells - missingCells) / totalCells) * 100);

        // Calculate overall quality score (simplified)
        const baseScore = 100;
        const penaltyPerIssue = 5;
        this.validationResults.qualityScore = Math.max(0, baseScore - (totalIssues * penaltyPerIssue));
    }

    displayValidationResults() {
        const resultsDiv = document.getElementById('validationResults');
        const qualityScore = document.getElementById('qualityScore');
        const issueCount = document.getElementById('issueCount');
        const completenessScore = document.getElementById('completenessScore');
        const issuesList = document.getElementById('issuesList');

        qualityScore.textContent = this.validationResults.qualityScore + '%';
        qualityScore.className = 'result-value ' +
            (this.validationResults.qualityScore >= 80 ? 'quality-good' :
             this.validationResults.qualityScore >= 60 ? 'quality-warning' : 'quality-error');

        issueCount.textContent = this.getTotalIssues();
        completenessScore.textContent = this.validationResults.completenessScore + '%';

        // Display issues
        issuesList.innerHTML = '';
        this.displayIssues();

        resultsDiv.style.display = 'block';

        // Update overview chart
        this.updateOverviewChart();
    }

    getTotalIssues() {
        return this.validationResults.dataTypeIssues.length +
               this.validationResults.missingValues.length +
               this.validationResults.duplicates.length +
               this.validationResults.outliers.length +
               this.validationResults.consistencyIssues.length;
    }

    displayIssues() {
        const issuesList = document.getElementById('issuesList');
        const allIssues = [
            ...this.validationResults.dataTypeIssues.map(issue => ({ ...issue, category: 'Data Types' })),
            ...this.validationResults.missingValues.map(issue => ({ ...issue, category: 'Missing Values' })),
            ...this.validationResults.duplicates.map(issue => ({ ...issue, category: 'Duplicates' })),
            ...this.validationResults.outliers.map(issue => ({ ...issue, category: 'Outliers' })),
            ...this.validationResults.consistencyIssues.map(issue => ({ ...issue, category: 'Consistency' }))
        ];

        allIssues.forEach(issue => {
            const issueDiv = document.createElement('div');
            issueDiv.className = `issue-item ${issue.severity || 'warning'}`;

            let message = `[${issue.category}] `;
            if (issue.column) message += `Column "${issue.column}": `;

            if (issue.type === 'invalid_email') {
                message += `${issue.count} invalid email addresses`;
            } else if (issue.type === 'invalid_phone') {
                message += `${issue.count} invalid phone numbers`;
            } else if (issue.count !== undefined) {
                message += `${issue.count} issues found`;
            } else if (issue.percentage) {
                message += `${issue.percentage}% affected`;
            } else {
                message += 'Issue detected';
            }

            issueDiv.textContent = message;
            issuesList.appendChild(issueDiv);
        });
    }

    updateOverviewChart() {
        const ctx = document.getElementById('overviewChart');
        if (!this.charts.overviewChart) return;

        const data = {
            labels: ['Valid Data', 'Issues Found'],
            datasets: [{
                data: [
                    this.validationResults.qualityScore,
                    100 - this.validationResults.qualityScore
                ],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderWidth: 1
            }]
        };

        this.charts.overviewChart.data = data;
        this.charts.overviewChart.update();
    }

    switchTab(e) {
        const tabId = e.target.dataset.tab;
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');

        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));

        e.target.classList.add('active');
        document.getElementById(tabId + 'Tab').classList.add('active');

        // Update tab content
        if (tabId === 'statistics') {
            this.displayStatistics();
        } else if (tabId === 'correlations') {
            this.displayCorrelations();
        } else if (tabId === 'distributions') {
            this.displayDistributions();
        }
    }

    displayStatistics() {
        const statsGrid = document.getElementById('statisticsGrid');
        statsGrid.innerHTML = '';

        if (!this.dataset || this.dataset.length === 0) return;

        const columns = Object.keys(this.dataset[0]);

        columns.forEach(col => {
            const values = this.dataset.map(row => row[col]).filter(val => val != null);
            const stats = this.calculateColumnStats(values);

            const statCard = document.createElement('div');
            statCard.className = 'stat-card';
            statCard.innerHTML = `
                <h4>${col}</h4>
                <div class="stat-item"><span class="stat-label">Count:</span> <span class="stat-value">${stats.count}</span></div>
                <div class="stat-item"><span class="stat-label">Type:</span> <span class="stat-value">${stats.type}</span></div>
                ${stats.mean !== null ? `<div class="stat-item"><span class="stat-label">Mean:</span> <span class="stat-value">${stats.mean.toFixed(2)}</span></div>` : ''}
                ${stats.median !== null ? `<div class="stat-item"><span class="stat-label">Median:</span> <span class="stat-value">${stats.median.toFixed(2)}</span></div>` : ''}
                ${stats.min !== null ? `<div class="stat-item"><span class="stat-label">Min:</span> <span class="stat-value">${stats.min.toFixed(2)}</span></div>` : ''}
                ${stats.max !== null ? `<div class="stat-item"><span class="stat-label">Max:</span> <span class="stat-value">${stats.max.toFixed(2)}</span></div>` : ''}
                <div class="stat-item"><span class="stat-label">Unique:</span> <span class="stat-value">${stats.unique}</span></div>
            `;

            statsGrid.appendChild(statCard);
        });
    }

    calculateColumnStats(values) {
        const stats = {
            count: values.length,
            type: this.inferDataType(values),
            mean: null,
            median: null,
            min: null,
            max: null,
            unique: new Set(values).size
        };

        if (stats.type === 'number') {
            const nums = values.filter(v => typeof v === 'number');
            if (nums.length > 0) {
                stats.mean = nums.reduce((a, b) => a + b, 0) / nums.length;
                stats.median = this.calculateMedian(nums);
                stats.min = Math.min(...nums);
                stats.max = Math.max(...nums);
            }
        }

        return stats;
    }

    calculateMedian(values) {
        const sorted = values.sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }

    displayCorrelations() {
        if (!this.charts.correlationChart) return;

        // Simplified correlation matrix for numeric columns
        const numericColumns = Object.keys(this.dataset[0] || {}).filter(col => {
            return this.dataset.some(row => typeof row[col] === 'number');
        });

        if (numericColumns.length < 2) {
            document.getElementById('correlationChart').parentElement.innerHTML =
                '<p>Not enough numeric columns for correlation analysis</p>';
            return;
        }

        // Calculate correlation matrix
        const correlations = [];
        numericColumns.forEach((col1, i) => {
            correlations[i] = [];
            numericColumns.forEach((col2, j) => {
                correlations[i][j] = this.calculateCorrelation(col1, col2);
            });
        });

        // Create heatmap data
        const data = {
            labels: numericColumns,
            datasets: [{
                label: 'Correlation',
                data: correlations.flat(),
                backgroundColor: correlations.flat().map(val => {
                    const intensity = Math.abs(val);
                    const color = val > 0 ? [16, 185, 129] : [239, 68, 68]; // green for positive, red for negative
                    return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${intensity})`;
                }),
                borderWidth: 1
            }]
        };

        this.charts.correlationChart.data = data;
        this.charts.correlationChart.update();
    }

    calculateCorrelation(col1, col2) {
        const values1 = this.dataset.map(row => parseFloat(row[col1])).filter(v => !isNaN(v));
        const values2 = this.dataset.map(row => parseFloat(row[col2])).filter(v => !isNaN(v));

        const minLength = Math.min(values1.length, values2.length);
        const x = values1.slice(0, minLength);
        const y = values2.slice(0, minLength);

        if (x.length < 2) return 0;

        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        return denominator === 0 ? 0 : numerator / denominator;
    }

    displayDistributions() {
        if (!this.charts.distributionChart) return;

        const numericColumns = Object.keys(this.dataset[0] || {}).filter(col => {
            return this.dataset.some(row => typeof row[col] === 'number');
        });

        if (numericColumns.length === 0) {
            document.getElementById('distributionChart').parentElement.innerHTML =
                '<p>No numeric columns found for distribution analysis</p>';
            return;
        }

        // Create histogram data for first numeric column
        const column = numericColumns[0];
        const values = this.dataset.map(row => parseFloat(row[column])).filter(v => !isNaN(v));

        const histogram = this.createHistogram(values, 10);

        const data = {
            labels: histogram.labels,
            datasets: [{
                label: `Distribution of ${column}`,
                data: histogram.counts,
                backgroundColor: 'rgba(37, 99, 235, 0.8)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 1
            }]
        };

        this.charts.distributionChart.data = data;
        this.charts.distributionChart.update();
    }

    createHistogram(values, bins) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;
        const binWidth = range / bins;

        const counts = new Array(bins).fill(0);
        const labels = [];

        for (let i = 0; i < bins; i++) {
            const binStart = min + i * binWidth;
            const binEnd = min + (i + 1) * binWidth;
            labels.push(`${binStart.toFixed(1)}-${binEnd.toFixed(1)}`);

            values.forEach(val => {
                if (val >= binStart && val < binEnd) {
                    counts[i]++;
                }
            });
        }

        return { labels, counts };
    }

    async runCleaning() {
        if (!this.dataset) return;

        this.showLoading('Cleaning data...');

        try {
            this.cleanedData = JSON.parse(JSON.stringify(this.dataset));
            let rowsRemoved = 0;
            let valuesFilled = 0;

            // Apply selected cleaning operations
            if (document.getElementById('removeDuplicates').checked) {
                const result = this.removeDuplicates();
                rowsRemoved += result.removed;
                this.cleanedData = result.data;
            }

            if (document.getElementById('fillMissing').checked) {
                valuesFilled = this.fillMissingValues();
            }

            if (document.getElementById('removeOutliers').checked) {
                const result = this.removeOutliers();
                rowsRemoved += result.removed;
                this.cleanedData = result.data;
            }

            if (document.getElementById('normalizeData').checked) {
                this.normalizeData();
            }

            // Calculate quality improvement
            const oldQuality = this.validationResults ? this.validationResults.qualityScore : 50;
            const newValidation = this.runValidationOnData(this.cleanedData);
            const newQuality = newValidation.qualityScore;
            const improvement = Math.max(0, newQuality - oldQuality);

            this.displayCleaningResults(rowsRemoved, valuesFilled, improvement);

        } catch (error) {
            this.showError('Cleaning error: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    removeDuplicates() {
        const seen = new Set();
        const unique = [];
        let removed = 0;

        this.cleanedData.forEach(row => {
            const rowStr = JSON.stringify(row);
            if (!seen.has(rowStr)) {
                seen.add(rowStr);
                unique.push(row);
            } else {
                removed++;
            }
        });

        return { data: unique, removed };
    }

    fillMissingValues() {
        const columns = Object.keys(this.cleanedData[0] || {});
        let filled = 0;

        columns.forEach(col => {
            const values = this.cleanedData.map(row => row[col]).filter(val => val != null);
            if (values.length === 0) return;

            const type = this.inferDataType(values);

            if (type === 'number') {
                const mean = values.reduce((a, b) => a + b, 0) / values.length;
                this.cleanedData.forEach(row => {
                    if (row[col] == null) {
                        row[col] = mean;
                        filled++;
                    }
                });
            } else {
                // For categorical data, use mode
                const mode = this.calculateMode(values);
                this.cleanedData.forEach(row => {
                    if (row[col] == null) {
                        row[col] = mode;
                        filled++;
                    }
                });
            }
        });

        return filled;
    }

    calculateMode(values) {
        const counts = {};
        values.forEach(val => {
            counts[val] = (counts[val] || 0) + 1;
        });

        return Object.keys(counts).reduce((a, b) =>
            counts[a] > counts[b] ? a : b
        );
    }

    removeOutliers() {
        const columns = Object.keys(this.cleanedData[0] || {});
        const method = document.getElementById('outlierMethod').value;
        let removed = 0;

        columns.forEach(col => {
            const values = this.cleanedData.map(row => parseFloat(row[col])).filter(val => !isNaN(val));
            if (values.length < 10) return;

            let outliers;
            if (method === 'iqr') {
                outliers = this.detectOutliersIQR(values);
            } else {
                outliers = this.detectOutliersZScore(values);
            }

            if (outliers.length > 0) {
                const outlierSet = new Set(outliers);
                this.cleanedData = this.cleanedData.filter(row => {
                    const val = parseFloat(row[col]);
                    if (outlierSet.has(val)) {
                        removed++;
                        return false;
                    }
                    return true;
                });
            }
        });

        return { data: this.cleanedData, removed };
    }

    normalizeData() {
        const columns = Object.keys(this.cleanedData[0] || {});

        columns.forEach(col => {
            const values = this.cleanedData.map(row => parseFloat(row[col])).filter(val => !isNaN(val));
            if (values.length === 0) return;

            const min = Math.min(...values);
            const max = Math.max(...values);
            const range = max - min;

            if (range > 0) {
                this.cleanedData.forEach(row => {
                    const val = parseFloat(row[col]);
                    if (!isNaN(val)) {
                        row[col] = (val - min) / range; // Min-max normalization
                    }
                });
            }
        });
    }

    runValidationOnData(data) {
        // Simplified validation for cleaned data
        const totalCells = data.length * Object.keys(data[0] || {}).length;
        const missingCells = data.reduce((acc, row) => {
            return acc + Object.values(row).filter(val => val == null || val === '').length;
        }, 0);

        const completenessScore = Math.round(((totalCells - missingCells) / totalCells) * 100);
        const qualityScore = Math.min(100, completenessScore + 20); // Simplified scoring

        return { qualityScore, completenessScore };
    }

    displayCleaningResults(rowsRemoved, valuesFilled, improvement) {
        const resultsDiv = document.getElementById('cleaningResults');
        const rowsRemovedEl = document.getElementById('rowsRemoved');
        const valuesFilledEl = document.getElementById('valuesFilled');
        const qualityImprovementEl = document.getElementById('qualityImprovement');

        rowsRemovedEl.textContent = rowsRemoved;
        valuesFilledEl.textContent = valuesFilled;
        qualityImprovementEl.textContent = improvement + '%';

        resultsDiv.style.display = 'block';
    }

    exportCleanData() {
        if (!this.cleanedData) {
            this.showError('No cleaned data available. Please run cleaning first.');
            return;
        }

        const format = document.getElementById('exportFormat').value;
        let data;
        let filename;
        let mimeType;

        if (format === 'csv') {
            data = Papa.unparse(this.cleanedData);
            filename = 'cleaned_dataset.csv';
            mimeType = 'text/csv';
        } else if (format === 'json') {
            data = JSON.stringify(this.cleanedData, null, 2);
            filename = 'cleaned_dataset.json';
            mimeType = 'application/json';
        } else if (format === 'xlsx') {
            // For XLSX, we'd need a library like xlsx, but for now we'll export as CSV
            data = Papa.unparse(this.cleanedData);
            filename = 'cleaned_dataset.csv';
            mimeType = 'text/csv';
        }

        this.downloadFile(data, filename, mimeType);
    }

    exportReport() {
        if (!this.validationResults) {
            this.showError('No validation results available. Please run validation first.');
            return;
        }

        const report = {
            timestamp: new Date().toISOString(),
            dataset_info: {
                rows: this.dataset.length,
                columns: Object.keys(this.dataset[0] || {}).length,
                file_size: 'N/A'
            },
            validation_results: this.validationResults,
            cleaning_applied: this.cleanedData ? true : false,
            recommendations: this.generateRecommendations()
        };

        const data = JSON.stringify(report, null, 2);
        this.downloadFile(data, 'validation_report.json', 'application/json');
    }

    generateRecommendations() {
        const recommendations = [];

        if (this.validationResults.missingValues.length > 0) {
            recommendations.push('Consider filling missing values or removing columns with high missing rates');
        }

        if (this.validationResults.duplicates.length > 0) {
            recommendations.push('Remove duplicate records to ensure data integrity');
        }

        if (this.validationResults.outliers.length > 0) {
            recommendations.push('Review outlier values - they may indicate data quality issues or valid extreme values');
        }

        if (this.validationResults.consistencyIssues.length > 0) {
            recommendations.push('Fix data consistency issues (invalid emails, phones, etc.)');
        }

        if (recommendations.length === 0) {
            recommendations.push('Data quality looks good! Consider regular validation checks.');
        }

        return recommendations;
    }

    downloadFile(data, filename, mimeType) {
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    }

    showLoading(message) {
        // Create loading overlay
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        overlay.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
                <p>${message}</p>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;

        document.body.appendChild(overlay);
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.remove();
        }
    }

    showError(message) {
        // Create error notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            max-width: 400px;
        `;

        notification.innerHTML = `
            <strong>Error:</strong> ${message}
            <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: white; cursor: pointer;">×</button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DatasetValidator();
});