/**
 * Real-Time Semantic Integrity Checker
 * Validation engine ensuring semantic consistency across conversational outputs
 */

class SemanticIntegrityChecker {
    constructor() {
        this.memory = [];
        this.conflicts = [];
        this.validationHistory = [];
        this.metrics = {
            validationsRun: 0,
            conflictsDetected: 0,
            integrityScore: 100,
            contradictionRate: 0,
            semanticDrift: 0,
            falsePositives: 0,
            accuracyRate: 100
        };
        this.isValidating = false;
        this.lastCheckTime = null;
        this.updateInterval = null;
        this.conflictThreshold = 0.7;
        this.memoryLimit = 100;
        this.init();
    }

    /**
     * Initialize the checker
     */
    init() {
        this.setupEventListeners();
        this.loadSampleMemory();
        this.startMetricsUpdates();
    }

    /**
     * Load sample memory statements for demonstration
     */
    loadSampleMemory() {
        const sampleStatements = [
            {
                id: 'stmt_1',
                text: 'The system is designed to be highly reliable and fault-tolerant.',
                timestamp: new Date(Date.now() - 3600000),
                confidence: 0.95,
                entities: ['system', 'reliability', 'fault-tolerance'],
                sentiment: 'positive'
            },
            {
                id: 'stmt_2',
                text: 'All user data is encrypted and stored securely.',
                timestamp: new Date(Date.now() - 3000000),
                confidence: 0.92,
                entities: ['user data', 'encryption', 'security'],
                sentiment: 'positive'
            },
            {
                id: 'stmt_3',
                text: 'The application supports multiple authentication methods.',
                timestamp: new Date(Date.now() - 2400000),
                confidence: 0.88,
                entities: ['application', 'authentication', 'methods'],
                sentiment: 'neutral'
            },
            {
                id: 'stmt_4',
                text: 'Response times are typically under 200 milliseconds.',
                timestamp: new Date(Date.now() - 1800000),
                confidence: 0.90,
                entities: ['response times', 'performance'],
                sentiment: 'positive'
            },
            {
                id: 'stmt_5',
                text: 'The service is available 99.9% of the time.',
                timestamp: new Date(Date.now() - 1200000),
                confidence: 0.85,
                entities: ['service', 'availability', 'uptime'],
                sentiment: 'positive'
            }
        ];

        this.memory = sampleStatements;
        this.updateMetrics();
    }

    /**
     * Extract semantic features from text
     */
    extractSemanticFeatures(text) {
        const features = {
            entities: [],
            sentiment: 'neutral',
            confidence: 0.8,
            keywords: [],
            negationWords: [],
            contradictionIndicators: []
        };

        // Extract entities and keywords
        const entityPatterns = {
            'system': /\b(system|platform|application|service)\b/gi,
            'security': /\b(security|encryption|authentication|access|privacy)\b/gi,
            'performance': /\b(performance|speed|fast|slow|latency|response)\b/gi,
            'reliability': /\b(reliable|availability|uptime|fault|error)\b/gi,
            'user': /\b(user|customer|client|account)\b/gi
        };

        Object.keys(entityPatterns).forEach(entity => {
            if (entityPatterns[entity].test(text)) {
                features.entities.push(entity);
            }
        });

        // Extract keywords
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        features.keywords = words.filter(word =>
            word.length > 3 &&
            !['that', 'this', 'with', 'from', 'they', 'have', 'been', 'will', 'when', 'what', 'where', 'which', 'their', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other'].includes(word)
        );

        // Detect negation
        const negationPatterns = /\b(not|never|no|none|without|cannot|cant|wont|dont|isnt|arent|wasnt|werent|hasnt|havent|hadnt)\b/gi;
        features.negationWords = text.match(negationPatterns) || [];

        // Detect contradiction indicators
        const contradictionPatterns = /\b(but|however|although|despite|contrary|opposite|unlike|versus|vs|instead|rather|yet)\b/gi;
        features.contradictionIndicators = text.match(contradictionPatterns) || [];

        // Determine sentiment
        const positiveWords = /\b(good|great|excellent|amazing|wonderful|fantastic|perfect|best|reliable|secure|fast|efficient|available)\b/gi;
        const negativeWords = /\b(bad|terrible|awful|horrible|worst|unreliable|insecure|slow|broken|failed|error|crash|down)\b/gi;

        const positiveCount = (text.match(positiveWords) || []).length;
        const negativeCount = (text.match(negativeWords) || []).length;

        if (positiveCount > negativeCount) {
            features.sentiment = 'positive';
        } else if (negativeCount > positiveCount) {
            features.sentiment = 'negative';
        }

        // Adjust confidence based on clarity
        if (features.entities.length > 0) features.confidence += 0.1;
        if (features.keywords.length > 5) features.confidence += 0.05;
        if (features.negationWords.length > 0) features.confidence -= 0.1;
        if (features.contradictionIndicators.length > 0) features.confidence -= 0.05;

        features.confidence = Math.max(0.1, Math.min(1.0, features.confidence));

        return features;
    }

    /**
     * Calculate semantic similarity between two statements
     */
    calculateSemanticSimilarity(stmt1, stmt2) {
        const features1 = this.extractSemanticFeatures(stmt1.text);
        const features2 = this.extractSemanticFeatures(stmt2.text);

        let similarity = 0;

        // Entity overlap (30%)
        const entityOverlap = this.calculateOverlap(features1.entities, features2.entities);
        similarity += entityOverlap * 0.3;

        // Keyword overlap (25%)
        const keywordOverlap = this.calculateOverlap(features1.keywords, features2.keywords);
        similarity += keywordOverlap * 0.25;

        // Sentiment consistency (20%)
        const sentimentMatch = features1.sentiment === features2.sentiment ? 1 : 0;
        similarity += sentimentMatch * 0.2;

        // Negation consistency (15%)
        const negationMatch = features1.negationWords.length === features2.negationWords.length ? 1 : 0;
        similarity += negationMatch * 0.15;

        // Time proximity (10%) - more recent statements are more relevant
        const timeDiff = Math.abs(stmt1.timestamp - stmt2.timestamp);
        const timeRelevance = Math.max(0, 1 - (timeDiff / (24 * 60 * 60 * 1000))); // 24 hours
        similarity += timeRelevance * 0.1;

        return Math.min(1.0, similarity);
    }

    /**
     * Calculate overlap between two arrays
     */
    calculateOverlap(arr1, arr2) {
        if (arr1.length === 0 && arr2.length === 0) return 1.0;
        if (arr1.length === 0 || arr2.length === 0) return 0.0;

        const set1 = new Set(arr1);
        const set2 = new Set(arr2);
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);

        return intersection.size / union.size;
    }

    /**
     * Detect contradictions between statements
     */
    detectContradictions(newStatement, memoryStatements) {
        const contradictions = [];

        memoryStatements.forEach(existingStmt => {
            const similarity = this.calculateSemanticSimilarity(newStatement, existingStmt);

            // Only check for contradictions if statements are semantically related
            if (similarity > 0.3) {
                const contradictionScore = this.calculateContradictionScore(newStatement, existingStmt);

                if (contradictionScore > this.conflictThreshold) {
                    contradictions.push({
                        id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        statement1: newStatement,
                        statement2: existingStmt,
                        similarity: similarity,
                        contradictionScore: contradictionScore,
                        severity: this.calculateSeverity(contradictionScore),
                        timestamp: new Date(),
                        resolved: false,
                        type: 'semantic_contradiction'
                    });
                }
            }
        });

        return contradictions;
    }

    /**
     * Calculate contradiction score between two statements
     */
    calculateContradictionScore(stmt1, stmt2) {
        const features1 = this.extractSemanticFeatures(stmt1.text);
        const features2 = this.extractSemanticFeatures(stmt2.text);

        let contradictionScore = 0;

        // Direct negation detection
        const text1 = stmt1.text.toLowerCase();
        const text2 = stmt2.text.toLowerCase();

        // Check for explicit contradictions
        const contradictionPairs = [
            ['reliable', 'unreliable'],
            ['secure', 'insecure'],
            ['fast', 'slow'],
            ['available', 'unavailable'],
            ['working', 'broken'],
            ['enabled', 'disabled'],
            ['true', 'false'],
            ['yes', 'no']
        ];

        contradictionPairs.forEach(([word1, word2]) => {
            if ((text1.includes(word1) && text2.includes(word2)) ||
                (text1.includes(word2) && text2.includes(word1))) {
                contradictionScore += 0.4;
            }
        });

        // Sentiment contradiction with high entity overlap
        const entityOverlap = this.calculateOverlap(features1.entities, features2.entities);
        if (entityOverlap > 0.5 && features1.sentiment !== features2.sentiment) {
            contradictionScore += 0.3;
        }

        // Negation + similar meaning = contradiction
        if (features1.negationWords.length > 0 && features2.negationWords.length === 0) {
            const keywordOverlap = this.calculateOverlap(features1.keywords, features2.keywords);
            if (keywordOverlap > 0.6) {
                contradictionScore += 0.3;
            }
        }

        // Contradiction indicators + opposing statements
        if (features1.contradictionIndicators.length > 0 || features2.contradictionIndicators.length > 0) {
            contradictionScore += 0.2;
        }

        return Math.min(1.0, contradictionScore);
    }

    /**
     * Calculate severity level for conflicts
     */
    calculateSeverity(contradictionScore) {
        if (contradictionScore >= 0.9) return 'critical';
        if (contradictionScore >= 0.7) return 'high';
        if (contradictionScore >= 0.5) return 'medium';
        return 'low';
    }

    /**
     * Validate text for semantic integrity
     */
    validateText(text) {
        if (!text || text.trim().length === 0) {
            this.showValidationResult('error', 'Please enter text to validate');
            return;
        }

        this.metrics.validationsRun++;
        const startTime = Date.now();

        // Create statement object
        const newStatement = {
            id: `validation_${Date.now()}`,
            text: text.trim(),
            timestamp: new Date(),
            confidence: 0.8,
            source: 'validation'
        };

        // Extract features
        const features = this.extractSemanticFeatures(text);
        newStatement.entities = features.entities;
        newStatement.sentiment = features.sentiment;
        newStatement.confidence = features.confidence;

        // Check for contradictions
        const contradictions = this.detectContradictions(newStatement, this.memory);

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // Log validation
        this.validationHistory.push({
            id: newStatement.id,
            text: text,
            timestamp: new Date(),
            contradictionsFound: contradictions.length,
            responseTime: responseTime,
            features: features
        });

        // Update metrics
        this.conflicts.push(...contradictions);
        this.metrics.conflictsDetected += contradictions.length;
        this.updateIntegrityScore();

        // Show result
        if (contradictions.length === 0) {
            this.showValidationResult('success', '✓ Semantic integrity validated - no contradictions detected', {
                entities: features.entities,
                sentiment: features.sentiment,
                confidence: features.confidence.toFixed(2)
            });
        } else {
            const severity = contradictions[0].severity;
            this.showValidationResult('warning', `⚠️ ${contradictions.length} potential contradiction(s) detected`, {
                severity: severity,
                confidence: contradictions[0].contradictionScore.toFixed(2),
                entities: features.entities
            });
        }

        this.lastCheckTime = new Date();
        this.updateMetrics();
        this.render();
    }

    /**
     * Show validation result
     */
    showValidationResult(type, message, details = {}) {
        const resultDiv = document.getElementById('validationResult');
        if (!resultDiv) return;

        resultDiv.className = `validation-result ${type}`;
        resultDiv.innerHTML = `
            <div style="margin-bottom: 15px; font-weight: 600;">${message}</div>
            ${details.entities ? `<div><strong>Entities:</strong> ${details.entities.join(', ') || 'None detected'}</div>` : ''}
            ${details.sentiment ? `<div><strong>Sentiment:</strong> ${details.sentiment}</div>` : ''}
            ${details.confidence ? `<div><strong>Confidence:</strong> ${details.confidence}</div>` : ''}
            ${details.severity ? `<div><strong>Severity:</strong> ${details.severity.toUpperCase()}</div>` : ''}
        `;
    }

    /**
     * Add text to memory
     */
    addToMemory() {
        const input = document.getElementById('inputText');
        if (!input || !input.value.trim()) {
            this.showNotification('Please enter text to add to memory');
            return;
        }

        const text = input.value.trim();
        const features = this.extractSemanticFeatures(text);

        const statement = {
            id: `memory_${Date.now()}`,
            text: text,
            timestamp: new Date(),
            confidence: features.confidence,
            entities: features.entities,
            sentiment: features.sentiment,
            source: 'manual'
        };

        this.memory.push(statement);

        // Maintain memory limit
        if (this.memory.length > this.memoryLimit) {
            this.memory = this.memory.slice(-this.memoryLimit);
        }

        input.value = '';
        this.showNotification('Statement added to memory');
        this.updateMetrics();
        this.render();
    }

    /**
     * Run quick test cases
     */
    runTest(type) {
        const testCases = {
            consistent: "The system maintains high availability and reliable performance.",
            contradictory: "The system is completely unreliable and frequently crashes.",
            ambiguous: "The system might work sometimes under certain conditions.",
            neutral: "The system processes user requests according to configured rules."
        };

        const text = testCases[type];
        document.getElementById('inputText').value = text;
        this.validateText(text);
    }

    /**
     * Clear memory
     */
    clearMemory() {
        if (confirm('Are you sure you want to clear all memory statements?')) {
            this.memory = [];
            this.conflicts = [];
            this.validationHistory = [];
            this.metrics.validationsRun = 0;
            this.metrics.conflictsDetected = 0;
            this.metrics.integrityScore = 100;
            this.showNotification('Memory cleared');
            this.updateMetrics();
            this.render();
        }
    }

    /**
     * Toggle validation engine
     */
    toggleValidation() {
        this.isValidating = !this.isValidating;
        const button = document.getElementById('startValidation');

        if (this.isValidating) {
            this.startMetricsUpdates();
            button.textContent = 'Stop Validation';
            this.showNotification('Validation engine started');
        } else {
            if (this.updateInterval) clearInterval(this.updateInterval);
            button.textContent = 'Start Validation';
            this.showNotification('Validation engine stopped');
        }

        this.render();
    }

    /**
     * Generate integrity report
     */
    generateReport() {
        const reportType = document.getElementById('reportType')?.value || 'summary';
        const reportContent = document.getElementById('reportContent');

        if (!reportContent) return;

        let reportHtml = '';

        switch (reportType) {
            case 'summary':
                reportHtml = this.generateSummaryReport();
                break;
            case 'detailed':
                reportHtml = this.generateDetailedReport();
                break;
            case 'trends':
                reportHtml = this.generateTrendsReport();
                break;
            case 'conflicts':
                reportHtml = this.generateConflictsReport();
                break;
        }

        reportContent.innerHTML = reportHtml;
        this.showNotification('Report generated');
    }

    /**
     * Generate summary report
     */
    generateSummaryReport() {
        const totalValidations = this.metrics.validationsRun;
        const totalConflicts = this.metrics.conflictsDetected;
        const integrityScore = this.metrics.integrityScore;
        const contradictionRate = totalValidations > 0 ? (totalConflicts / totalValidations * 100) : 0;

        return `
            <div class="report-section">
                <h4>📊 Integrity Summary Report</h4>
                <div class="report-metric">
                    <span class="label">Report Generated</span>
                    <span class="value">${new Date().toLocaleString()}</span>
                </div>
                <div class="report-metric">
                    <span class="label">Total Validations</span>
                    <span class="value">${totalValidations}</span>
                </div>
                <div class="report-metric">
                    <span class="label">Conflicts Detected</span>
                    <span class="value">${totalConflicts}</span>
                </div>
                <div class="report-metric">
                    <span class="label">Integrity Score</span>
                    <span class="value">${integrityScore.toFixed(1)}%</span>
                </div>
                <div class="report-metric">
                    <span class="label">Contradiction Rate</span>
                    <span class="value">${contradictionRate.toFixed(1)}%</span>
                </div>
                <div class="report-metric">
                    <span class="label">Memory Statements</span>
                    <span class="value">${this.memory.length}</span>
                </div>
            </div>
        `;
    }

    /**
     * Generate detailed report
     */
    generateDetailedReport() {
        const recentValidations = this.validationHistory.slice(-10);
        const conflictSummary = this.summarizeConflicts();

        let html = `
            <div class="report-section">
                <h4>🔍 Detailed Analysis Report</h4>
                <div class="report-metric">
                    <span class="label">Analysis Period</span>
                    <span class="value">Last 10 validations</span>
                </div>
            </div>

            <div class="report-section">
                <h4>Recent Validations</h4>
        `;

        recentValidations.forEach(validation => {
            html += `
                <div class="report-metric">
                    <span class="label">${validation.timestamp.toLocaleTimeString()}</span>
                    <span class="value">${validation.contradictionsFound} conflicts (${validation.responseTime}ms)</span>
                </div>
            `;
        });

        html += `
            </div>

            <div class="report-section">
                <h4>Conflict Summary by Severity</h4>
                <div class="report-metric">
                    <span class="label">Critical</span>
                    <span class="value">${conflictSummary.critical}</span>
                </div>
                <div class="report-metric">
                    <span class="label">High</span>
                    <span class="value">${conflictSummary.high}</span>
                </div>
                <div class="report-metric">
                    <span class="label">Medium</span>
                    <span class="value">${conflictSummary.medium}</span>
                </div>
                <div class="report-metric">
                    <span class="label">Low</span>
                    <span class="value">${conflictSummary.low}</span>
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Generate trends report
     */
    generateTrendsReport() {
        const hourlyData = this.getHourlyTrends();

        return `
            <div class="report-section">
                <h4>📈 Integrity Trends Report</h4>
                <div class="report-metric">
                    <span class="label">Trend Period</span>
                    <span class="value">Last 24 hours</span>
                </div>
                <div class="report-metric">
                    <span class="label">Peak Conflict Hour</span>
                    <span class="value">${this.findPeakHour(hourlyData)}:00</span>
                </div>
                <div class="report-metric">
                    <span class="label">Average Conflicts/Hour</span>
                    <span class="value">${(hourlyData.reduce((a, b) => a + b, 0) / 24).toFixed(1)}</span>
                </div>
                <div class="report-metric">
                    <span class="label">Trend Direction</span>
                    <span class="value">${this.calculateTrendDirection(hourlyData)}</span>
                </div>
            </div>
        `;
    }

    /**
     * Generate conflicts report
     */
    generateConflictsReport() {
        const unresolvedConflicts = this.conflicts.filter(c => !c.resolved);

        let html = `
            <div class="report-section">
                <h4>⚠️ Conflicts Report</h4>
                <div class="report-metric">
                    <span class="label">Total Conflicts</span>
                    <span class="value">${this.conflicts.length}</span>
                </div>
                <div class="report-metric">
                    <span class="label">Unresolved</span>
                    <span class="value">${unresolvedConflicts.length}</span>
                </div>
                <div class="report-metric">
                    <span class="label">Resolution Rate</span>
                    <span class="value">${this.conflicts.length > 0 ? ((this.conflicts.length - unresolvedConflicts.length) / this.conflicts.length * 100).toFixed(1) : 100}%</span>
                </div>
            </div>

            <div class="report-section">
                <h4>Top Conflict Types</h4>
        `;

        const conflictTypes = {};
        this.conflicts.forEach(conflict => {
            conflictTypes[conflict.type] = (conflictTypes[conflict.type] || 0) + 1;
        });

        Object.entries(conflictTypes).forEach(([type, count]) => {
            html += `
                <div class="report-metric">
                    <span class="label">${type.replace('_', ' ')}</span>
                    <span class="value">${count}</span>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    /**
     * Download report as CSV
     */
    downloadReport() {
        const reportType = document.getElementById('reportType')?.value || 'summary';
        let csv = '';

        switch (reportType) {
            case 'summary':
                csv = `Integrity Summary Report\nGenerated,${new Date().toISOString()}\nTotal Validations,${this.metrics.validationsRun}\nConflicts Detected,${this.metrics.conflictsDetected}\nIntegrity Score,${this.metrics.integrityScore.toFixed(1)}%\nMemory Items,${this.memory.length}\n`;
                break;
            case 'conflicts':
                csv = 'Conflict ID,Severity,Contradiction Score,Timestamp,Resolved\n';
                this.conflicts.forEach(conflict => {
                    csv += `${conflict.id},${conflict.severity},${conflict.contradictionScore.toFixed(2)},${conflict.timestamp.toISOString()},${conflict.resolved}\n`;
                });
                break;
        }

        this.downloadFile(csv, `integrity-report-${reportType}.csv`);
        this.showNotification('Report downloaded');
    }

    /**
     * Get hourly trends data
     */
    getHourlyTrends() {
        const hourlyData = new Array(24).fill(0);
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        this.validationHistory.forEach(validation => {
            const hoursAgo = Math.floor((now - validation.timestamp) / oneHour);
            if (hoursAgo < 24) {
                hourlyData[23 - hoursAgo] += validation.contradictionsFound;
            }
        });

        return hourlyData;
    }

    /**
     * Find peak conflict hour
     */
    findPeakHour(hourlyData) {
        let maxConflicts = 0;
        let peakHour = 0;

        hourlyData.forEach((conflicts, hour) => {
            if (conflicts > maxConflicts) {
                maxConflicts = conflicts;
                peakHour = hour;
            }
        });

        return peakHour;
    }

    /**
     * Calculate trend direction
     */
    calculateTrendDirection(hourlyData) {
        const firstHalf = hourlyData.slice(0, 12).reduce((a, b) => a + b, 0);
        const secondHalf = hourlyData.slice(12).reduce((a, b) => a + b, 0);

        if (secondHalf > firstHalf * 1.2) return 'Increasing';
        if (firstHalf > secondHalf * 1.2) return 'Decreasing';
        return 'Stable';
    }

    /**
     * Summarize conflicts by severity
     */
    summarizeConflicts() {
        const summary = { critical: 0, high: 0, medium: 0, low: 0 };

        this.conflicts.forEach(conflict => {
            summary[conflict.severity]++;
        });

        return summary;
    }

    /**
     * Update integrity score
     */
    updateIntegrityScore() {
        const totalValidations = this.metrics.validationsRun;
        const totalConflicts = this.metrics.conflictsDetected;

        if (totalValidations === 0) {
            this.metrics.integrityScore = 100;
            return;
        }

        // Base score from contradiction rate
        const contradictionRate = totalConflicts / totalValidations;
        let score = 100 - (contradictionRate * 50);

        // Adjust for conflict severity
        const severityWeights = { critical: 20, high: 10, medium: 5, low: 2 };
        let severityPenalty = 0;

        this.conflicts.forEach(conflict => {
            severityPenalty += severityWeights[conflict.severity] || 0;
        });

        score -= Math.min(30, severityPenalty);

        // Adjust for memory consistency
        const memoryConsistency = this.calculateMemoryConsistency();
        score += (memoryConsistency - 0.5) * 20;

        this.metrics.integrityScore = Math.max(0, Math.min(100, score));
        this.metrics.contradictionRate = contradictionRate * 100;
    }

    /**
     * Calculate memory consistency
     */
    calculateMemoryConsistency() {
        if (this.memory.length < 2) return 1.0;

        let totalSimilarity = 0;
        let pairCount = 0;

        for (let i = 0; i < this.memory.length - 1; i++) {
            for (let j = i + 1; j < this.memory.length; j++) {
                totalSimilarity += this.calculateSemanticSimilarity(this.memory[i], this.memory[j]);
                pairCount++;
            }
        }

        return pairCount > 0 ? totalSimilarity / pairCount : 1.0;
    }

    /**
     * Handle tab changes
     */
    onTabChange(tabName) {
        if (tabName === 'memory') {
            this.renderMemory();
        } else if (tabName === 'conflicts') {
            this.renderConflicts();
        } else if (tabName === 'reports') {
            this.generateReport();
        }
    }

    /**
     * Filter conflicts
     */
    filterConflicts() {
        this.renderConflicts();
    }

    /**
     * Show conflict details in modal
     */
    showConflictDetails(conflictId) {
        const conflict = this.conflicts.find(c => c.id === conflictId);
        if (!conflict) return;

        const modal = document.getElementById('conflictModal');
        const content = modal.querySelector('.modal-content');

        content.innerHTML = `
            <span class="modal-close" onclick="window.checker.closeModal()">&times;</span>
            <h2>Conflict Details</h2>
            <div class="conflict-details">
                <div class="detail-row">
                    <span class="label">Conflict ID</span>
                    <span class="value">${conflict.id}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Severity</span>
                    <span class="value">${conflict.severity.toUpperCase()}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Contradiction Score</span>
                    <span class="value">${conflict.contradictionScore.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Semantic Similarity</span>
                    <span class="value">${conflict.similarity.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Detected</span>
                    <span class="value">${conflict.timestamp.toLocaleString()}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Status</span>
                    <span class="value">${conflict.resolved ? 'Resolved' : 'Unresolved'}</span>
                </div>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #334155;">
                    <strong>Statement 1:</strong> ${conflict.statement1.text}<br><br>
                    <strong>Statement 2:</strong> ${conflict.statement2.text}
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="window.checker.resolveConflict('${conflict.id}')">Mark as Resolved</button>
                <button class="btn btn-secondary" onclick="window.checker.ignoreConflict('${conflict.id}')">Ignore</button>
                <button class="btn btn-tertiary" onclick="window.checker.closeModal()">Close</button>
            </div>
        `;

        modal.classList.add('show');
    }

    /**
     * Resolve conflict
     */
    resolveConflict(conflictId) {
        const conflict = this.conflicts.find(c => c.id === conflictId);
        if (conflict) {
            conflict.resolved = true;
            this.updateIntegrityScore();
            this.showNotification('Conflict marked as resolved');
            this.closeModal();
            this.render();
        }
    }

    /**
     * Ignore conflict
     */
    ignoreConflict(conflictId) {
        const conflict = this.conflicts.find(c => c.id === conflictId);
        if (conflict) {
            conflict.resolved = true;
            this.showNotification('Conflict ignored');
            this.closeModal();
            this.render();
        }
    }

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('conflictModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Memory item click
        document.addEventListener('click', (e) => {
            const memoryItem = e.target.closest('.memory-item');
            if (memoryItem) {
                // Could add memory item details modal here
            }

            const conflictItem = e.target.closest('.conflict-item');
            if (conflictItem) {
                const conflictId = conflictItem.getAttribute('data-conflict-id');
                if (conflictId) this.showConflictDetails(conflictId);
            }
        });
    }

    /**
     * Start metrics updates
     */
    startMetricsUpdates() {
        if (this.updateInterval) clearInterval(this.updateInterval);

        this.updateInterval = setInterval(() => {
            this.updateMetrics();
            this.render();
        }, 2000);
    }

    /**
     * Update metrics
     */
    updateMetrics() {
        this.metrics.memoryItems = this.memory.length;
        this.updateIntegrityScore();

        // Update UI
        document.getElementById('validationsRun').textContent = this.metrics.validationsRun;
        document.getElementById('conflictsDetected').textContent = this.metrics.conflictsDetected;
        document.getElementById('integrityScore').textContent = this.metrics.integrityScore.toFixed(1);
        document.getElementById('memoryItems').textContent = this.metrics.memoryItems;

        document.getElementById('footerValidations').textContent = this.metrics.validationsRun;
        document.getElementById('footerConflicts').textContent = this.metrics.conflictsDetected;
        document.getElementById('footerIntegrity').textContent = this.metrics.integrityScore.toFixed(1);
    }

    /**
     * Render all UI sections
     */
    render() {
        this.renderDashboard();
        this.renderMemory();
        this.renderConflicts();
        this.renderRecentActivity();
    }

    /**
     * Render dashboard
     */
    renderDashboard() {
        // Update status
        const statusElement = document.getElementById('engineStatus');
        if (statusElement) {
            statusElement.textContent = this.isValidating ? 'Active' : 'Idle';
        }

        const lastCheckElement = document.getElementById('lastCheck');
        if (lastCheckElement && this.lastCheckTime) {
            lastCheckElement.textContent = this.lastCheckTime.toLocaleTimeString();
        }

        // Update semantic metrics
        document.getElementById('contradictionRate').textContent = this.metrics.contradictionRate.toFixed(1) + '%';
        document.getElementById('semanticDrift').textContent = '0%'; // Placeholder
        document.getElementById('falsePositives').textContent = this.metrics.falsePositives;
        document.getElementById('accuracyRate').textContent = this.metrics.accuracyRate.toFixed(1) + '%';

        // Render integrity chart
        this.renderIntegrityChart();
    }

    /**
     * Render integrity chart
     */
    renderIntegrityChart() {
        const canvas = document.getElementById('integrityChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.clientWidth || 800;
        const height = canvas.clientHeight || 300;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Generate sample integrity data for the last hour
        const dataPoints = [];
        const now = Date.now();

        for (let i = 59; i >= 0; i--) {
            const time = now - (59 - i) * 60 * 1000;
            const integrity = 95 + Math.random() * 10 - 5; // 90-100 range
            dataPoints.push({ time, integrity });
        }

        const padding = 40;
        const graphWidth = width - 2 * padding;
        const graphHeight = height - 2 * padding;

        // Draw axes
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Draw grid
        ctx.strokeStyle = '#1e293b';
        for (let i = 0; i <= 6; i++) {
            const y = padding + (i * graphHeight / 6);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Draw data line
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();

        dataPoints.forEach((point, i) => {
            const x = padding + (i / 59) * graphWidth;
            const y = height - padding - ((point.integrity - 85) / 20) * graphHeight;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw labels
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';

        for (let i = 0; i <= 6; i++) {
            const y = padding + (i * graphHeight / 6);
            const value = 100 - (i * 20 / 6);
            ctx.fillText(value.toFixed(0), padding - 25, y + 4);
        }
    }

    /**
     * Render memory list
     */
    renderMemory() {
        const container = document.getElementById('memoryList');
        if (!container) return;

        const memoryHtml = this.memory.map(statement => `
            <div class="memory-item">
                <div class="memory-header">
                    <div class="memory-timestamp">${statement.timestamp.toLocaleString()}</div>
                </div>
                <div class="memory-content">${statement.text}</div>
                <div class="memory-meta">
                    <span>Confidence: ${statement.confidence.toFixed(2)}</span>
                    <span>Entities: ${statement.entities.join(', ') || 'None'}</span>
                    <span>Sentiment: ${statement.sentiment}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = memoryHtml || '<div class="placeholder">No statements in memory</div>';

        // Update memory stats
        document.getElementById('totalStatements').textContent = this.memory.length;
        document.getElementById('memoryUsage').textContent = ((this.memory.length / this.memoryLimit) * 100).toFixed(1) + '%';
        document.getElementById('lastUpdated').textContent = this.memory.length > 0 ?
            this.memory[this.memory.length - 1].timestamp.toLocaleTimeString() : '--';
    }

    /**
     * Render conflicts list
     */
    renderConflicts() {
        const container = document.getElementById('conflictsList');
        if (!container) return;

        const filter = document.getElementById('conflictFilter')?.value || 'all';
        const sortBy = document.getElementById('conflictSort')?.value || 'severity';

        let filteredConflicts = this.conflicts;

        if (filter !== 'all') {
            filteredConflicts = filteredConflicts.filter(c => c.severity === filter);
        }

        // Sort
        filteredConflicts.sort((a, b) => {
            if (sortBy === 'severity') {
                const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                return severityOrder[b.severity] - severityOrder[a.severity];
            } else if (sortBy === 'time') {
                return b.timestamp - a.timestamp;
            } else if (sortBy === 'confidence') {
                return b.contradictionScore - a.contradictionScore;
            }
            return 0;
        });

        const conflictsHtml = filteredConflicts.map(conflict => `
            <div class="conflict-item ${conflict.severity}" data-conflict-id="${conflict.id}">
                <div class="conflict-header">
                    <div class="conflict-title">${conflict.statement1.text.substring(0, 50)}...</div>
                    <div class="conflict-severity">${conflict.severity.toUpperCase()}</div>
                </div>
                <div class="conflict-description">
                    Contradicts: "${conflict.statement2.text.substring(0, 50)}..."
                </div>
                <div class="conflict-details">
                    <div class="conflict-detail">
                        <span class="label">Score</span>
                        <span class="value">${conflict.contradictionScore.toFixed(2)}</span>
                    </div>
                    <div class="conflict-detail">
                        <span class="label">Similarity</span>
                        <span class="value">${conflict.similarity.toFixed(2)}</span>
                    </div>
                    <div class="conflict-detail">
                        <span class="label">Time</span>
                        <span class="value">${conflict.timestamp.toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = conflictsHtml || '<div class="placeholder">No conflicts detected</div>';
    }

    /**
     * Render recent activity
     */
    renderRecentActivity() {
        const container = document.getElementById('recentEvents');
        if (!container) return;

        const recentEvents = [
            ...this.validationHistory.slice(-3).map(v => ({
                type: 'Validation',
                message: `Validated statement (${v.contradictionsFound} conflicts found)`,
                category: v.contradictionsFound > 0 ? 'conflict' : 'validation',
                time: v.timestamp
            })),
            ...this.conflicts.slice(-2).map(c => ({
                type: 'Conflict',
                message: `Semantic contradiction detected (${c.severity})`,
                category: 'conflict',
                time: c.timestamp
            }))
        ].sort((a, b) => b.time - a.time).slice(0, 5);

        const activityHtml = recentEvents.map(event => `
            <div class="activity-item ${event.category}">
                <div class="activity-header">
                    <span class="activity-title">${event.type}</span>
                    <span class="activity-time">${event.time.toLocaleTimeString()}</span>
                </div>
                <div class="activity-description">${event.message}</div>
            </div>
        `).join('');

        container.innerHTML = activityHtml || '<div class="placeholder">No recent activity</div>';
    }

    /**
     * Download file
     */
    downloadFile(content, filename) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display('none');
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
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.checker = new SemanticIntegrityChecker();
});
