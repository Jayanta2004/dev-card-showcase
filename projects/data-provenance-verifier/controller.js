/**
 * Data Provenance Verifier
 * Traces and validates data artifact origins throughout processing pipelines
 */

class DataProvenanceVerifier {
    constructor() {
        this.sources = this.initializeSources();
        this.artifacts = [];
        this.auditTrail = [];
        this.verificationQueue = [];
        this.alerts = [];
        this.metadata = new Map();
        this.lineageGraph = new Map();
        this.isMonitoring = false;
        this.monitoringInterval = null;

        // Metrics
        this.metrics = {
            totalSources: 0,
            verifiedArtifacts: 0,
            integrityAlerts: 0,
            auditScore: 100
        };

        // Verification settings
        this.verificationSettings = {
            integrity: true,
            authenticity: true,
            completeness: true,
            timeliness: true
        };

        this.init();
    }

    /**
     * Initialize the verifier
     */
    init() {
        this.setupEventListeners();
        this.simulateInitialData();
        this.startMonitoring();
    }

    /**
     * Initialize sample data sources
     */
    initializeSources() {
        const sources = [];
        const sourceTypes = ['database', 'api', 'file', 'stream', 'sensor'];
        const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'];

        for (let i = 1; i <= 6; i++) {
            const type = sourceTypes[(i - 1) % sourceTypes.length];
            const region = regions[(i - 1) % regions.length];
            const status = this.generateSourceStatus();

            const source = {
                id: `source_${i}`,
                name: `${type.charAt(0).toUpperCase() + type.slice(1)} Source ${i}`,
                type: type,
                region: region,
                endpoint: this.generateEndpoint(type, i, region),
                status: status,
                owner: `team-${Math.floor(Math.random() * 3) + 1}`,
                sensitivity: ['public', 'internal', 'confidential'][Math.floor(Math.random() * 3)],
                encrypted: Math.random() > 0.5,
                authenticated: Math.random() > 0.3,
                lastVerified: new Date(Date.now() - Math.random() * 86400000),
                verificationCount: Math.floor(Math.random() * 50) + 1,
                trustScore: this.calculateTrustScore(status),
                metadata: this.generateSourceMetadata(type),
                createdAt: new Date(Date.now() - Math.random() * 2592000000), // Up to 30 days ago
                updatedAt: new Date()
            };

            sources.push(source);
        }

        return sources;
    }

    /**
     * Generate source status
     */
    generateSourceStatus() {
        const statuses = ['verified', 'pending', 'failed', 'compromised'];
        const weights = [0.7, 0.2, 0.08, 0.02]; // Most sources are verified

        const random = Math.random();
        let cumulative = 0;

        for (let i = 0; i < statuses.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return statuses[i];
            }
        }

        return 'verified';
    }

    /**
     * Generate endpoint based on type
     */
    generateEndpoint(type, id, region) {
        const endpoints = {
            database: `postgresql://db-${id}.${region}.internal:5432/data`,
            api: `https://api-${id}.${region}.example.com/v1`,
            file: `/data/sources/${region}/source-${id}`,
            stream: `kafka://stream-${id}.${region}.internal:9092/topic-data`,
            sensor: `mqtt://sensor-${id}.${region}.iot.example.com/data`
        };

        return endpoints[type] || endpoints.database;
    }

    /**
     * Calculate trust score based on status
     */
    calculateTrustScore(status) {
        const scores = {
            verified: 95 + Math.random() * 5,
            pending: 60 + Math.random() * 20,
            failed: 20 + Math.random() * 30,
            compromised: Math.random() * 20
        };

        return Math.round(scores[status]);
    }

    /**
     * Generate source metadata
     */
    generateSourceMetadata(type) {
        const baseMetadata = {
            schemaVersion: '1.0',
            dataFormat: 'json',
            encoding: 'utf-8',
            compression: 'none',
            recordCount: Math.floor(Math.random() * 1000000) + 1000,
            lastModified: new Date(Date.now() - Math.random() * 86400000),
            checksum: this.generateChecksum(),
            tags: []
        };

        // Type-specific metadata
        switch (type) {
            case 'database':
                baseMetadata.tableCount = Math.floor(Math.random() * 50) + 5;
                baseMetadata.indexCount = Math.floor(Math.random() * 20) + 2;
                break;
            case 'api':
                baseMetadata.endpoints = Math.floor(Math.random() * 20) + 5;
                baseMetadata.rateLimit = Math.floor(Math.random() * 1000) + 100;
                break;
            case 'file':
                baseMetadata.fileSize = Math.floor(Math.random() * 1000000000) + 1000000;
                baseMetadata.fileType = ['csv', 'json', 'xml', 'parquet'][Math.floor(Math.random() * 4)];
                break;
            case 'stream':
                baseMetadata.topicCount = Math.floor(Math.random() * 10) + 1;
                baseMetadata.messageRate = Math.floor(Math.random() * 10000) + 100;
                break;
            case 'sensor':
                baseMetadata.sensorType = ['temperature', 'pressure', 'humidity', 'motion'][Math.floor(Math.random() * 4)];
                baseMetadata.frequency = Math.floor(Math.random() * 100) + 10;
                break;
        }

        return baseMetadata;
    }

    /**
     * Generate checksum
     */
    generateChecksum() {
        return Array.from({length: 32}, () =>
            '0123456789abcdef'[Math.floor(Math.random() * 16)]
        ).join('');
    }

    /**
     * Create data artifact
     */
    createArtifact(name, type, sourceId, description = '') {
        const source = this.sources.find(s => s.id === sourceId);
        if (!source) return null;

        const artifact = {
            id: `artifact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: name,
            type: type,
            sourceId: sourceId,
            sourceName: source.name,
            description: description,
            status: 'processing',
            size: Math.floor(Math.random() * 10000000) + 100000,
            checksum: this.generateChecksum(),
            lineage: [sourceId],
            transformations: [],
            metadata: {
                createdAt: new Date(),
                createdBy: 'system',
                version: '1.0',
                tags: [],
                sensitivity: source.sensitivity,
                encrypted: source.encrypted
            },
            verificationResults: {},
            lastVerified: null,
            trustScore: 0
        };

        this.artifacts.push(artifact);
        this.lineageGraph.set(artifact.id, new Set([sourceId]));

        // Add to audit trail
        this.addAuditEntry('artifact_created', `Created artifact: ${name}`, {
            artifactId: artifact.id,
            sourceId: sourceId,
            type: type
        });

        return artifact;
    }

    /**
     * Add transformation to artifact lineage
     */
    addTransformation(artifactId, transformationType, parameters = {}) {
        const artifact = this.artifacts.find(a => a.id === artifactId);
        if (!artifact) return false;

        const transformation = {
            id: `transform_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: transformationType,
            timestamp: new Date(),
            parameters: parameters,
            checksum: this.generateChecksum(),
            verified: false
        };

        artifact.transformations.push(transformation);
        artifact.metadata.version = (parseFloat(artifact.metadata.version) + 0.1).toFixed(1);
        artifact.metadata.updatedAt = new Date();

        // Update lineage graph
        const lineageSet = this.lineageGraph.get(artifactId) || new Set();
        lineageSet.add(transformation.id);
        this.lineageGraph.set(artifactId, lineageSet);

        // Add to audit trail
        this.addAuditEntry('transformation_applied', `Applied ${transformationType} transformation to ${artifact.name}`, {
            artifactId: artifactId,
            transformationId: transformation.id,
            type: transformationType
        });

        return true;
    }

    /**
     * Verify data provenance
     */
    async verifyProvenance(artifactId, options = {}) {
        const artifact = this.artifacts.find(a => a.id === artifactId);
        if (!artifact) return { success: false, error: 'Artifact not found' };

        const results = {
            artifactId: artifactId,
            timestamp: new Date(),
            checks: {},
            overallResult: 'passed',
            issues: []
        };

        // Integrity check
        if (this.verificationSettings.integrity || options.integrity) {
            results.checks.integrity = await this.verifyIntegrity(artifact);
        }

        // Authenticity check
        if (this.verificationSettings.authenticity || options.authenticity) {
            results.checks.authenticity = await this.verifyAuthenticity(artifact);
        }

        // Completeness check
        if (this.verificationSettings.completeness || options.completeness) {
            results.checks.completeness = await this.verifyCompleteness(artifact);
        }

        // Timeliness check
        if (this.verificationSettings.timeliness || options.timeliness) {
            results.checks.timeliness = await this.verifyTimeliness(artifact);
        }

        // Determine overall result
        const failedChecks = Object.values(results.checks).filter(check => check.result === 'failed');
        if (failedChecks.length > 0) {
            results.overallResult = 'failed';
            results.issues = failedChecks.flatMap(check => check.issues || []);
        }

        // Update artifact
        artifact.verificationResults = results;
        artifact.lastVerified = new Date();
        artifact.status = results.overallResult === 'passed' ? 'verified' : 'failed';
        artifact.trustScore = this.calculateArtifactTrustScore(results);

        // Add to audit trail
        this.addAuditEntry('verification_completed',
            `Verification ${results.overallResult} for ${artifact.name}`,
            { artifactId: artifactId, result: results.overallResult, issues: results.issues.length }
        );

        return results;
    }

    /**
     * Verify data integrity
     */
    async verifyIntegrity(artifact) {
        // Simulate integrity verification
        await this.delay(500 + Math.random() * 1000);

        const issues = [];
        let result = 'passed';

        // Check checksum consistency
        if (Math.random() > 0.95) {
            issues.push('Checksum mismatch detected');
            result = 'failed';
        }

        // Check data structure
        if (Math.random() > 0.98) {
            issues.push('Data structure corruption detected');
            result = 'failed';
        }

        // Check transformation chain integrity
        for (const transform of artifact.transformations) {
            if (!transform.verified && Math.random() > 0.9) {
                issues.push(`Unverified transformation: ${transform.type}`);
                result = 'failed';
            }
        }

        return {
            result: result,
            issues: issues,
            confidence: result === 'passed' ? 0.95 : 0.3,
            details: {
                checksumVerified: true,
                structureValidated: true,
                transformationsChecked: artifact.transformations.length
            }
        };
    }

    /**
     * Verify data authenticity
     */
    async verifyAuthenticity(artifact) {
        await this.delay(300 + Math.random() * 700);

        const source = this.sources.find(s => s.id === artifact.sourceId);
        const issues = [];
        let result = 'passed';

        // Check source authenticity
        if (source.status === 'compromised') {
            issues.push('Source has been compromised');
            result = 'failed';
        }

        // Check digital signatures
        if (Math.random() > 0.97) {
            issues.push('Digital signature verification failed');
            result = 'failed';
        }

        // Check certificate validity
        if (Math.random() > 0.98) {
            issues.push('Certificate validation failed');
            result = 'failed';
        }

        // Check access logs
        if (Math.random() > 0.96) {
            issues.push('Unauthorized access detected in logs');
            result = 'failed';
        }

        return {
            result: result,
            issues: issues,
            confidence: result === 'passed' ? 0.92 : 0.2,
            details: {
                sourceVerified: source.status === 'verified',
                signaturesValid: true,
                certificatesValid: true,
                accessLogsChecked: true
            }
        };
    }

    /**
     * Verify data completeness
     */
    async verifyCompleteness(artifact) {
        await this.delay(400 + Math.random() * 800);

        const issues = [];
        let result = 'passed';

        // Check for missing records
        if (Math.random() > 0.94) {
            issues.push('Missing records detected');
            result = 'failed';
        }

        // Check data consistency
        if (Math.random() > 0.96) {
            issues.push('Data consistency violations found');
            result = 'failed';
        }

        // Check referential integrity
        if (Math.random() > 0.97) {
            issues.push('Referential integrity issues detected');
            result = 'failed';
        }

        // Check for null/invalid values
        if (Math.random() > 0.93) {
            issues.push('Invalid or null values detected');
            result = 'failed';
        }

        return {
            result: result,
            issues: issues,
            confidence: result === 'passed' ? 0.88 : 0.4,
            details: {
                recordsComplete: true,
                consistencyChecked: true,
                integrityValidated: true,
                nullValuesChecked: true
            }
        };
    }

    /**
     * Verify data timeliness
     */
    async verifyTimeliness(artifact) {
        await this.delay(200 + Math.random() * 500);

        const issues = [];
        let result = 'passed';

        const now = new Date();
        const created = new Date(artifact.metadata.createdAt);
        const age = now - created;

        // Check if data is too old
        if (age > 7 * 24 * 60 * 60 * 1000) { // 7 days
            issues.push('Data is older than acceptable threshold');
            result = 'failed';
        }

        // Check freshness requirements
        if (artifact.type === 'sensor' && age > 60 * 60 * 1000) { // 1 hour for sensors
            issues.push('Sensor data is stale');
            result = 'failed';
        }

        // Check update frequency
        const lastUpdate = new Date(artifact.metadata.updatedAt || artifact.metadata.createdAt);
        const timeSinceUpdate = now - lastUpdate;

        if (timeSinceUpdate > 24 * 60 * 60 * 1000) { // 24 hours
            issues.push('Data has not been updated recently');
            result = 'failed';
        }

        return {
            result: result,
            issues: issues,
            confidence: result === 'passed' ? 0.95 : 0.6,
            details: {
                age: Math.round(age / (24 * 60 * 60 * 1000)),
                lastUpdate: lastUpdate.toISOString(),
                freshnessRequirement: artifact.type === 'sensor' ? '1 hour' : '7 days'
            }
        };
    }

    /**
     * Calculate artifact trust score
     */
    calculateArtifactTrustScore(verificationResults) {
        let score = 100;

        // Deduct for failed checks
        const failedChecks = Object.values(verificationResults.checks)
            .filter(check => check.result === 'failed').length;

        score -= failedChecks * 20;

        // Deduct for issues
        score -= verificationResults.issues.length * 5;

        // Boost for successful verifications
        const passedChecks = Object.values(verificationResults.checks)
            .filter(check => check.result === 'passed').length;

        score += passedChecks * 2;

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Add entry to audit trail
     */
    addAuditEntry(action, description, details = {}) {
        const entry = {
            id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            action: action,
            description: description,
            details: details,
            user: 'system',
            ip: '127.0.0.1',
            sessionId: 'session_' + Date.now()
        };

        this.auditTrail.unshift(entry);

        // Keep audit trail manageable
        if (this.auditTrail.length > 1000) {
            this.auditTrail = this.auditTrail.slice(0, 1000);
        }

        return entry;
    }

    /**
     * Generate provenance report
     */
    generateProvenanceReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalSources: this.sources.length,
                totalArtifacts: this.artifacts.length,
                verifiedArtifacts: this.artifacts.filter(a => a.status === 'verified').length,
                failedVerifications: this.artifacts.filter(a => a.status === 'failed').length,
                totalTransformations: this.artifacts.reduce((sum, a) => sum + a.transformations.length, 0),
                auditEntries: this.auditTrail.length
            },
            sources: this.sources.map(s => ({
                id: s.id,
                name: s.name,
                type: s.type,
                status: s.status,
                trustScore: s.trustScore,
                lastVerified: s.lastVerified
            })),
            artifacts: this.artifacts.map(a => ({
                id: a.id,
                name: a.name,
                type: a.type,
                status: a.status,
                trustScore: a.trustScore,
                sourceId: a.sourceId,
                transformations: a.transformations.length,
                lastVerified: a.lastVerified
            })),
            recentAudit: this.auditTrail.slice(0, 50),
            lineageSummary: this.generateLineageSummary()
        };

        // Download as JSON
        this.downloadFile(JSON.stringify(report, null, 2), 'provenance-report.json');
        this.showNotification('Provenance report generated and downloaded');
    }

    /**
     * Generate lineage summary
     */
    generateLineageSummary() {
        const summary = {
            totalLineages: this.lineageGraph.size,
            averageDepth: 0,
            maxDepth: 0,
            orphanedArtifacts: 0
        };

        let totalDepth = 0;
        this.lineageGraph.forEach((lineage, artifactId) => {
            const depth = lineage.size;
            totalDepth += depth;
            summary.maxDepth = Math.max(summary.maxDepth, depth);

            if (depth === 0) {
                summary.orphanedArtifacts++;
            }
        });

        summary.averageDepth = summary.totalLineages > 0 ?
            (totalDepth / summary.totalLineages).toFixed(2) : 0;

        return summary;
    }

    /**
     * Trace artifact lineage
     */
    traceLineage(artifactId) {
        const artifact = this.artifacts.find(a => a.id === artifactId);
        if (!artifact) return null;

        const lineage = {
            artifact: {
                id: artifact.id,
                name: artifact.name,
                type: artifact.type
            },
            source: this.sources.find(s => s.id === artifact.sourceId),
            transformations: artifact.transformations,
            verificationHistory: artifact.verificationResults,
            dependencies: Array.from(this.lineageGraph.get(artifactId) || [])
        };

        return lineage;
    }

    /**
     * Quarantine compromised source
     */
    quarantineSource(sourceId) {
        const source = this.sources.find(s => s.id === sourceId);
        if (!source) return false;

        source.status = 'compromised';
        source.trustScore = 0;

        // Quarantine dependent artifacts
        const dependentArtifacts = this.artifacts.filter(a => a.sourceId === sourceId);
        dependentArtifacts.forEach(artifact => {
            artifact.status = 'quarantined';
            this.addAuditEntry('artifact_quarantined',
                `Artifact quarantined due to compromised source: ${artifact.name}`,
                { artifactId: artifact.id, sourceId: sourceId }
            );
        });

        this.addAuditEntry('source_quarantined',
            `Source quarantined: ${source.name}`,
            { sourceId: sourceId, dependentArtifacts: dependentArtifacts.length }
        );

        this.showNotification(`Source quarantined. ${dependentArtifacts.length} artifacts affected.`);
        return true;
    }

    /**
     * Start monitoring
     */
    startMonitoring() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.performMonitoringChecks();
        }, 10000); // Check every 10 seconds

        this.showNotification('Provenance monitoring started');
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (!this.isMonitoring) return;

        clearInterval(this.monitoringInterval);
        this.isMonitoring = false;
        this.showNotification('Provenance monitoring stopped');
    }

    /**
     * Perform monitoring checks
     */
    performMonitoringChecks() {
        // Check for new artifacts to verify
        this.checkVerificationQueue();

        // Monitor source health
        this.monitorSourceHealth();

        // Update metrics
        this.updateMetrics();

        // Render updates
        this.render();
    }

    /**
     * Check verification queue
     */
    checkVerificationQueue() {
        if (this.verificationQueue.length === 0) return;

        const item = this.verificationQueue.shift();
        this.verifyProvenance(item.artifactId, item.options)
            .then(result => {
                if (result.overallResult === 'failed') {
                    this.createAlert('verification_failed',
                        `Verification failed for ${this.artifacts.find(a => a.id === item.artifactId)?.name}`,
                        'high', result.issues);
                }
            })
            .catch(error => {
                console.error('Verification error:', error);
                this.createAlert('verification_error', 'Verification process encountered an error', 'medium', [error.message]);
            });
    }

    /**
     * Monitor source health
     */
    monitorSourceHealth() {
        this.sources.forEach(source => {
            // Simulate health checks
            if (Math.random() > 0.98) { // 2% chance of status change
                const oldStatus = source.status;
                const newStatus = this.generateSourceStatus();

                if (oldStatus !== newStatus) {
                    source.status = newStatus;
                    source.trustScore = this.calculateTrustScore(newStatus);
                    source.lastVerified = new Date();

                    this.addAuditEntry('source_status_changed',
                        `Source ${source.name} status changed: ${oldStatus} → ${newStatus}`,
                        { sourceId: source.id, oldStatus, newStatus }
                    );

                    if (newStatus === 'compromised') {
                        this.quarantineSource(source.id);
                    }
                }
            }
        });
    }

    /**
     * Create alert
     */
    createAlert(type, message, severity, details = []) {
        const alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: type,
            message: message,
            severity: severity,
            details: details,
            timestamp: new Date(),
            acknowledged: false
        };

        this.alerts.unshift(alert);

        // Keep alerts manageable
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(0, 100);
        }

        return alert;
    }

    /**
     * Update metrics
     */
    updateMetrics() {
        this.metrics.totalSources = this.sources.length;
        this.metrics.verifiedArtifacts = this.artifacts.filter(a => a.status === 'verified').length;
        this.metrics.integrityAlerts = this.alerts.filter(a => a.type.includes('integrity') || a.type.includes('verification')).length;

        // Calculate audit score based on verification coverage
        const totalArtifacts = this.artifacts.length;
        const verifiedArtifacts = this.metrics.verifiedArtifacts;
        this.metrics.auditScore = totalArtifacts > 0 ? Math.round((verifiedArtifacts / totalArtifacts) * 100) : 100;
    }

    /**
     * Simulate initial data
     */
    simulateInitialData() {
        // Create some initial artifacts
        const sourceIds = this.sources.map(s => s.id);
        const artifactTypes = ['dataset', 'model', 'report', 'dashboard', 'api_response'];

        for (let i = 0; i < 8; i++) {
            const sourceId = sourceIds[Math.floor(Math.random() * sourceIds.length)];
            const type = artifactTypes[Math.floor(Math.random() * artifactTypes.length)];
            const artifact = this.createArtifact(
                `${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`,
                type,
                sourceId,
                `Sample ${type} from ${this.sources.find(s => s.id === sourceId)?.name}`
            );

            if (artifact) {
                // Add some transformations
                const transformTypes = ['filter', 'aggregate', 'join', 'normalize', 'validate'];
                const transformCount = Math.floor(Math.random() * 3) + 1;

                for (let j = 0; j < transformCount; j++) {
                    const transformType = transformTypes[Math.floor(Math.random() * transformTypes.length)];
                    this.addTransformation(artifact.id, transformType, {
                        parameter1: `value${j + 1}`,
                        parameter2: Math.random() * 100
                    });
                }

                // Simulate verification
                setTimeout(() => {
                    this.verifyProvenance(artifact.id);
                }, Math.random() * 5000);
            }
        }

        this.updateMetrics();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Control buttons
        document.getElementById('startVerification')?.addEventListener('click', () => this.startVerification());
        document.getElementById('generateReport')?.addEventListener('click', () => this.generateProvenanceReport());
        document.getElementById('simulateData')?.addEventListener('click', () => this.simulateDataFlow());

        // Filter controls
        document.getElementById('sourceTypeFilter')?.addEventListener('change', () => this.filterSources());
        document.getElementById('sourceStatusFilter')?.addEventListener('change', () => this.filterSources());
        document.getElementById('sourceSearch')?.addEventListener('input', () => this.filterSources());

        document.getElementById('artifactTypeFilter')?.addEventListener('change', () => this.filterArtifacts());
        document.getElementById('artifactStatusFilter')?.addEventListener('change', () => this.filterArtifacts());
        document.getElementById('artifactSearch')?.addEventListener('input', () => this.filterArtifacts());

        // Verification controls
        document.getElementById('quickVerifyBtn')?.addEventListener('click', () => this.quickVerify());
        document.getElementById('deepVerifyBtn')?.addEventListener('click', () => this.deepVerify());
        document.getElementById('batchVerifyBtn')?.addEventListener('click', () => this.batchVerify());

        // Modal controls
        document.getElementById('addSourceBtn')?.addEventListener('click', () => this.showAddSourceModal());
        document.getElementById('uploadArtifactBtn')?.addEventListener('click', () => this.showUploadArtifactModal());

        // Audit controls
        document.getElementById('auditTimeRange')?.addEventListener('change', () => this.filterAuditTrail());
        document.getElementById('auditActionFilter')?.addEventListener('change', () => this.filterAuditTrail());
        document.getElementById('auditSearch')?.addEventListener('input', () => this.filterAuditTrail());

        // Footer controls
        document.getElementById('exportAuditBtn')?.addEventListener('click', () => this.exportAuditTrail());
        document.getElementById('systemHealthBtn')?.addEventListener('click', () => this.showSystemHealth());
    }

    /**
     * Switch tabs
     */
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        // Render specific tab content
        switch (tabName) {
            case 'sources':
                this.renderSources();
                break;
            case 'artifacts':
                this.renderArtifacts();
                break;
            case 'verification':
                this.renderVerificationResults();
                break;
            case 'audit':
                this.renderAuditTrail();
                break;
        }
    }

    /**
     * Render all UI components
     */
    render() {
        this.renderDashboard();
        this.renderSources();
        this.renderArtifacts();
        this.renderVerificationResults();
        this.renderAuditTrail();
        this.updateFooter();
    }

    /**
     * Render dashboard
     */
    renderDashboard() {
        // Update overview cards
        document.getElementById('totalSources').textContent = this.metrics.totalSources;
        document.getElementById('verifiedArtifacts').textContent = this.metrics.verifiedArtifacts;
        document.getElementById('integrityAlerts').textContent = this.metrics.integrityAlerts;
        document.getElementById('auditScore').textContent = `${this.metrics.auditScore}%`;

        // Update trends
        const sourcesTrend = this.sources.filter(s => s.lastVerified > new Date(Date.now() - 3600000)).length;
        document.getElementById('sourcesTrend').textContent = `+${sourcesTrend} this hour`;

        const verifiedTrend = this.artifacts.filter(a => a.lastVerified && a.lastVerified > new Date(Date.now() - 3600000)).length;
        document.getElementById('verifiedTrend').textContent = `${verifiedTrend} verified`;

        // Render data flow chart
        this.renderDataFlowChart();

        // Render recent activity
        this.renderRecentActivity();

        // Render integrity status
        this.renderIntegrityStatus();

        // Render verification queue
        this.renderVerificationQueue();
    }

    /**
     * Render data flow chart
     */
    renderDataFlowChart() {
        const canvas = document.getElementById('dataFlowChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.clientWidth || 800;
        const height = canvas.clientHeight || 300;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Draw simplified data flow
        const centerX = width / 2;
        const centerY = height / 2;

        // Draw sources
        ctx.fillStyle = '#2563eb';
        this.sources.slice(0, 6).forEach((source, i) => {
            const angle = (i / 6) * 2 * Math.PI;
            const x = centerX + Math.cos(angle) * 100;
            const y = centerY + Math.sin(angle) * 80;

            ctx.beginPath();
            ctx.arc(x, y, 20, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = '#e2e8f0';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(source.type, x, y + 30);
            ctx.fillStyle = '#2563eb';
        });

        // Draw artifacts in center
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.artifacts.length} Artifacts`, centerX, centerY + 45);
    }

    /**
     * Render recent activity
     */
    renderRecentActivity() {
        const container = document.getElementById('recentActivity');
        if (!container) return;

        const recent = this.auditTrail.slice(0, 5);
        const html = recent.map(entry => `
            <div class="activity-item">
                <div class="activity-icon">${this.getActivityIcon(entry.action)}</div>
                <div class="activity-content">
                    <div class="activity-title">${entry.action.replace('_', ' ').toUpperCase()}</div>
                    <div class="activity-description">${entry.description}</div>
                    <div class="activity-time">${entry.timestamp.toLocaleTimeString()}</div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html || '<div class="placeholder">No recent activity</div>';
    }

    /**
     * Get activity icon
     */
    getActivityIcon(action) {
        const icons = {
            'artifact_created': '📄',
            'transformation_applied': '🔄',
            'verification_completed': '✅',
            'source_status_changed': '⚠️',
            'artifact_quarantined': '🚫'
        };
        return icons[action] || '📋';
    }

    /**
     * Render integrity status
     */
    renderIntegrityStatus() {
        const container = document.getElementById('integrityStatus');
        if (!container) return;

        const verified = this.artifacts.filter(a => a.status === 'verified').length;
        const failed = this.artifacts.filter(a => a.status === 'failed').length;
        const processing = this.artifacts.filter(a => a.status === 'processing').length;

        const html = `
            <div class="status-item">
                <div class="status-label">Verified</div>
                <div class="status-value verified">${verified}</div>
            </div>
            <div class="status-item">
                <div class="status-label">Failed</div>
                <div class="status-value failed">${failed}</div>
            </div>
            <div class="status-item">
                <div class="status-label">Processing</div>
                <div class="status-value processing">${processing}</div>
            </div>
            <div class="status-item">
                <div class="status-label">Coverage</div>
                <div class="status-value">${this.metrics.auditScore}%</div>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Render verification queue
     */
    renderVerificationQueue() {
        const container = document.getElementById('verificationQueue');
        if (!container) return;

        const html = this.verificationQueue.slice(0, 5).map(item => `
            <div class="queue-item">
                <div class="queue-info">
                    <div class="queue-name">${this.artifacts.find(a => a.id === item.artifactId)?.name || 'Unknown'}</div>
                    <div class="queue-status">${item.options.mode || 'standard'} verification</div>
                </div>
                <div class="queue-priority priority-${item.priority || 'medium'}">${item.priority || 'medium'}</div>
            </div>
        `).join('');

        container.innerHTML = html || '<div class="placeholder">Queue is empty</div>';
    }

    /**
     * Render sources
     */
    renderSources(filtered = null) {
        const sources = filtered || this.sources;
        const container = document.getElementById('sourcesList');

        if (!container) return;

        const html = sources.map(source => `
            <div class="source-card ${source.status}" data-source-id="${source.id}">
                <div class="card-status status-${source.status}">${source.status.toUpperCase()}</div>
                <div class="card-title">${source.name}</div>
                <div class="card-meta">Type: ${source.type} | Region: ${source.region}</div>
                <div class="card-meta">Owner: ${source.owner} | Trust: ${source.trustScore}%</div>
                <div class="card-details">
                    <div class="detail-item">
                        <span class="detail-label">Endpoint</span>
                        <span class="detail-value">${source.endpoint}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Sensitivity</span>
                        <span class="detail-value">${source.sensitivity}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Last Verified</span>
                        <span class="detail-value">${source.lastVerified.toLocaleDateString()}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Verifications</span>
                        <span class="detail-value">${source.verificationCount}</span>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html || '<div class="placeholder">No sources found</div>';
    }

    /**
     * Render artifacts
     */
    renderArtifacts(filtered = null) {
        const artifacts = filtered || this.artifacts;
        const container = document.getElementById('artifactsList');

        if (!container) return;

        const html = artifacts.map(artifact => `
            <div class="artifact-card ${artifact.status}" data-artifact-id="${artifact.id}">
                <div class="card-status status-${artifact.status}">${artifact.status.toUpperCase()}</div>
                <div class="card-title">${artifact.name}</div>
                <div class="card-meta">Type: ${artifact.type} | Source: ${artifact.sourceName}</div>
                <div class="card-meta">Trust: ${artifact.trustScore}% | Size: ${(artifact.size / 1024).toFixed(0)} KB</div>
                <div class="card-details">
                    <div class="detail-item">
                        <span class="detail-label">Created</span>
                        <span class="detail-value">${artifact.metadata.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Transformations</span>
                        <span class="detail-value">${artifact.transformations.length}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Last Verified</span>
                        <span class="detail-value">${artifact.lastVerified ? artifact.lastVerified.toLocaleDateString() : 'Never'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Version</span>
                        <span class="detail-value">${artifact.metadata.version}</span>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html || '<div class="placeholder">No artifacts found</div>';
    }

    /**
     * Render verification results
     */
    renderVerificationResults() {
        const container = document.getElementById('verificationResults');
        if (!container) return;

        const recentResults = this.artifacts
            .filter(a => a.verificationResults)
            .sort((a, b) => new Date(b.verificationResults.timestamp) - new Date(a.verificationResults.timestamp))
            .slice(0, 10);

        const html = recentResults.map(artifact => {
            const result = artifact.verificationResults;
            return `
                <div class="result-item">
                    <div class="result-info">
                        <div class="result-name">${artifact.name}</div>
                        <div class="result-details">
                            ${result.overallResult.toUpperCase()} |
                            ${Object.keys(result.checks).length} checks |
                            ${result.issues.length} issues |
                            ${result.timestamp.toLocaleTimeString()}
                        </div>
                    </div>
                    <div class="result-status ${result.overallResult}">
                        ${result.overallResult.toUpperCase()}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html || '<div class="placeholder">No verification results</div>';

        // Update summary
        const summaryContainer = document.getElementById('verificationSummary');
        if (summaryContainer) {
            const total = recentResults.length;
            const passed = recentResults.filter(a => a.verificationResults.overallResult === 'passed').length;
            const failed = total - passed;

            summaryContainer.innerHTML = `
                <span class="summary-item">Total: ${total}</span>
                <span class="summary-item verified">Passed: ${passed}</span>
                <span class="summary-item failed">Failed: ${failed}</span>
            `;
        }
    }

    /**
     * Render audit trail
     */
    renderAuditTrail(filtered = null) {
        const entries = filtered || this.auditTrail.slice(0, 50);
        const container = document.getElementById('auditTrail');

        if (!container) return;

        const html = entries.map(entry => `
            <div class="audit-item">
                <div class="audit-icon">${this.getActivityIcon(entry.action)}</div>
                <div class="audit-content">
                    <div class="audit-action">${entry.action.replace('_', ' ').toUpperCase()}</div>
                    <div class="audit-description">${entry.description}</div>
                    <div class="audit-meta">
                        <span class="audit-timestamp">${entry.timestamp.toLocaleString()}</span>
                        <span>User: ${entry.user}</span>
                        <span>IP: ${entry.ip}</span>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html || '<div class="placeholder">No audit entries found</div>';
    }

    /**
     * Update footer
     */
    updateFooter() {
        document.getElementById('footerStatus').textContent = this.isMonitoring ? 'Monitoring Active' : 'Monitoring Stopped';
        document.getElementById('footerSources').textContent = `Sources: ${this.metrics.totalSources}`;
        document.getElementById('footerArtifacts').textContent = `Artifacts: ${this.artifacts.length}`;
        document.getElementById('footerAlerts').textContent = `Alerts: ${this.alerts.length}`;
    }

    /**
     * Filter sources
     */
    filterSources() {
        const typeFilter = document.getElementById('sourceTypeFilter')?.value || 'all';
        const statusFilter = document.getElementById('sourceStatusFilter')?.value || 'all';
        const searchTerm = document.getElementById('sourceSearch')?.value.toLowerCase() || '';

        let filtered = this.sources;

        if (typeFilter !== 'all') {
            filtered = filtered.filter(s => s.type === typeFilter);
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(s => s.status === statusFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(searchTerm) ||
                s.type.toLowerCase().includes(searchTerm) ||
                s.owner.toLowerCase().includes(searchTerm)
            );
        }

        this.renderSources(filtered);
    }

    /**
     * Filter artifacts
     */
    filterArtifacts() {
        const typeFilter = document.getElementById('artifactTypeFilter')?.value || 'all';
        const statusFilter = document.getElementById('artifactStatusFilter')?.value || 'all';
        const searchTerm = document.getElementById('artifactSearch')?.value.toLowerCase() || '';

        let filtered = this.artifacts;

        if (typeFilter !== 'all') {
            filtered = filtered.filter(a => a.type === typeFilter);
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(a => a.status === statusFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(a =>
                a.name.toLowerCase().includes(searchTerm) ||
                a.type.toLowerCase().includes(searchTerm) ||
                a.sourceName.toLowerCase().includes(searchTerm)
            );
        }

        this.renderArtifacts(filtered);
    }

    /**
     * Filter audit trail
     */
    filterAuditTrail() {
        const timeRange = document.getElementById('auditTimeRange')?.value || '24h';
        const actionFilter = document.getElementById('auditActionFilter')?.value || 'all';
        const searchTerm = document.getElementById('auditSearch')?.value.toLowerCase() || '';

        let filtered = this.auditTrail;

        // Time range filter
        const now = new Date();
        const timeLimit = {
            '1h': 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000
        }[timeRange];

        if (timeLimit) {
            filtered = filtered.filter(entry => (now - new Date(entry.timestamp)) <= timeLimit);
        }

        if (actionFilter !== 'all') {
            filtered = filtered.filter(entry => entry.action === actionFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(entry =>
                entry.description.toLowerCase().includes(searchTerm) ||
                entry.action.toLowerCase().includes(searchTerm)
            );
        }

        this.renderAuditTrail(filtered);
    }

    /**
     * Start verification process
     */
    startVerification() {
        if (this.verificationQueue.length === 0) {
            this.showNotification('No items in verification queue');
            return;
        }

        this.showNotification('Starting verification process...');
        this.checkVerificationQueue();
    }

    /**
     * Quick verify all artifacts
     */
    quickVerify() {
        const unverified = this.artifacts.filter(a => !a.lastVerified || a.status !== 'verified');
        unverified.forEach(artifact => {
            this.verificationQueue.push({
                artifactId: artifact.id,
                options: { mode: 'quick' },
                priority: 'low'
            });
        });

        this.showNotification(`Added ${unverified.length} artifacts to verification queue`);
    }

    /**
     * Deep verify critical artifacts
     */
    deepVerify() {
        const critical = this.artifacts.filter(a => a.metadata.sensitivity === 'confidential' || a.metadata.sensitivity === 'restricted');
        critical.forEach(artifact => {
            this.verificationQueue.push({
                artifactId: artifact.id,
                options: { mode: 'deep', integrity: true, authenticity: true, completeness: true, timeliness: true },
                priority: 'high'
            });
        });

        this.showNotification(`Added ${critical.length} critical artifacts to deep verification queue`);
    }

    /**
     * Batch verify all artifacts
     */
    batchVerify() {
        this.artifacts.forEach(artifact => {
            this.verificationQueue.push({
                artifactId: artifact.id,
                options: { mode: 'batch' },
                priority: 'medium'
            });
        });

        this.showNotification(`Added all ${this.artifacts.length} artifacts to batch verification queue`);
    }

    /**
     * Simulate data flow
     */
    simulateDataFlow() {
        // Create a new artifact from a random source
        const source = this.sources[Math.floor(Math.random() * this.sources.length)];
        const types = ['dataset', 'model', 'report', 'dashboard', 'api_response'];
        const type = types[Math.floor(Math.random() * types.length)];

        const artifact = this.createArtifact(
            `Simulated ${type} ${Date.now()}`,
            type,
            source.id,
            'Automatically generated test artifact'
        );

        if (artifact) {
            // Add some transformations
            const transforms = ['filter', 'aggregate', 'normalize'];
            transforms.forEach(transform => {
                this.addTransformation(artifact.id, transform, { simulated: true });
            });

            // Queue for verification
            this.verificationQueue.push({
                artifactId: artifact.id,
                options: { mode: 'simulation' },
                priority: 'low'
            });

            this.showNotification('Data flow simulation completed');
            this.render();
        }
    }

    /**
     * Show add source modal
     */
    showAddSourceModal() {
        const modal = document.getElementById('addSourceModal');
        modal.classList.add('show');

        // Populate source select for artifacts
        const sourceSelect = document.getElementById('artifactSource');
        if (sourceSelect) {
            sourceSelect.innerHTML = this.sources.map(source =>
                `<option value="${source.id}">${source.name}</option>`
            ).join('');
        }
    }

    /**
     * Show upload artifact modal
     */
    showUploadArtifactModal() {
        const modal = document.getElementById('uploadArtifactModal');
        modal.classList.add('show');
    }

    /**
     * Add new source
     */
    addSource() {
        const form = document.getElementById('addSourceForm');
        const formData = new FormData(form);

        const source = {
            id: `source_${Date.now()}`,
            name: formData.get('sourceName'),
            type: formData.get('sourceType'),
            endpoint: formData.get('sourceEndpoint'),
            owner: formData.get('sourceOwner'),
            sensitivity: formData.get('sourceSensitivity'),
            encrypted: formData.get('sourceEncrypted') === 'on',
            authenticated: formData.get('sourceAuthenticated') === 'on',
            region: 'us-east-1', // Default
            status: 'pending',
            lastVerified: new Date(),
            verificationCount: 0,
            trustScore: 50,
            metadata: this.generateSourceMetadata(formData.get('sourceType')),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.sources.push(source);
        this.addAuditEntry('source_created', `New data source added: ${source.name}`, { sourceId: source.id });

        this.closeModal();
        this.showNotification('Data source added successfully');
        this.render();
    }

    /**
     * Upload artifact
     */
    uploadArtifact() {
        const form = document.getElementById('uploadArtifactForm');
        const formData = new FormData(form);

        const sourceId = formData.get('artifactSource');
        const source = this.sources.find(s => s.id === sourceId);

        if (!source) {
            this.showNotification('Invalid source selected');
            return;
        }

        const artifact = this.createArtifact(
            formData.get('artifactName'),
            formData.get('artifactType'),
            sourceId,
            formData.get('artifactDescription')
        );

        if (artifact) {
            artifact.metadata.sensitive = formData.get('artifactSensitive') === 'on';

            // Simulate file upload
            const file = formData.get('artifactFile');
            if (file) {
                artifact.size = file.size;
                artifact.checksum = this.generateChecksum();
            }

            this.closeModal();
            this.showNotification('Artifact uploaded successfully');
            this.render();
        }
    }

    /**
     * Export audit trail
     */
    exportAuditTrail() {
        const csv = 'Timestamp,Action,Description,User,IP\n' +
            this.auditTrail.map(entry =>
                `"${entry.timestamp.toISOString()}","${entry.action}","${entry.description}","${entry.user}","${entry.ip}"`
            ).join('\n');

        this.downloadFile(csv, 'audit-trail.csv');
        this.showNotification('Audit trail exported');
    }

    /**
     * Show system health
     */
    showSystemHealth() {
        const health = {
            sources: this.sources.length,
            artifacts: this.artifacts.length,
            verifications: this.auditTrail.filter(e => e.action === 'verification_completed').length,
            alerts: this.alerts.length,
            monitoring: this.isMonitoring,
            uptime: '24h 30m', // Simulated
            memory: '256 MB',
            cpu: '15%'
        };

        alert(`System Health Report:
• Data Sources: ${health.sources}
• Artifacts: ${health.artifacts}
• Verifications: ${health.verifications}
• Active Alerts: ${health.alerts}
• Monitoring: ${health.monitoring ? 'Active' : 'Inactive'}
• Uptime: ${health.uptime}
• Memory Usage: ${health.memory}
• CPU Usage: ${health.cpu}`);
    }

    /**
     * Close modal
     */
    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    /**
     * Delay utility
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
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
    window.controller = new DataProvenanceVerifier();
});