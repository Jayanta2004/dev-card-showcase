/**
 * Predictive Session Expiration Optimizer
 * Dynamic timeout management balancing security & usability
 * Analyzes user interaction patterns and risk signals
 */

class PredictiveSessionExpirationOptimizer {
    constructor() {
        this.sessions = this.initializeSessions();
        this.analytics = {
            totalSessions: 0,
            activeSessions: 0,
            expiredSessions: 0,
            extendedSessions: 0,
            shortenedSessions: 0,
            avgSessionDuration: 0,
            securityScore: 85,
            optimizationImpact: 12
        };
        this.optimizationSettings = {
            activityWindow: 30, // minutes
            riskSensitivity: 1.0,
            baseTimeout: 60, // minutes
            maxExtension: 240, // minutes
            minTimeout: 15 // minutes
        };
        this.riskFactors = this.initializeRiskFactors();
        this.optimizationInterval = null;
        this.isOptimizing = false;
        this.selectedSession = null;
        this.init();
    }

    /**
     * Initialize the optimizer
     */
    init() {
        this.setupEventListeners();
        this.simulateInitialData();
        this.updateAnalytics();
        this.render();
    }

    /**
     * Initialize sample sessions with different states
     */
    initializeSessions() {
        const sessions = [];
        const users = [
            'alice.smith', 'bob.johnson', 'carol.williams', 'david.brown', 'emma.davis',
            'frank.miller', 'grace.wilson', 'henry.moore', 'iris.taylor', 'jack.anderson'
        ];
        const devices = ['desktop', 'mobile', 'tablet'];
        const locations = ['New York', 'London', 'Tokyo', 'Sydney', 'Berlin'];

        for (let i = 1; i <= 12; i++) {
            const user = users[(i - 1) % users.length];
            const device = devices[(i - 1) % devices.length];
            const location = locations[(i - 1) % locations.length];
            const sessionState = this.generateSessionState();

            const session = {
                id: `session_${i}`,
                userId: user,
                device: device,
                location: location,
                ipAddress: this.generateIPAddress(),
                startTime: new Date(Date.now() - Math.random() * 3600000), // Within last hour
                lastActivity: new Date(Date.now() - Math.random() * 1800000), // Within last 30 min
                originalTimeout: this.optimizationSettings.baseTimeout,
                currentTimeout: this.optimizationSettings.baseTimeout,
                status: sessionState.status,
                riskLevel: sessionState.riskLevel,
                activityScore: sessionState.activityScore,
                riskScore: sessionState.riskScore,
                activities: this.generateActivityHistory(),
                optimizations: [],
                alerts: []
            };

            // Apply initial optimization
            this.optimizeSessionTimeout(session);
            sessions.push(session);
        }

        return sessions;
    }

    /**
     * Generate realistic session state
     */
    generateSessionState() {
        const states = ['active', 'extended', 'shortened', 'expired'];
        const riskLevels = ['low', 'medium', 'high', 'critical'];

        // Weighted distribution
        const stateWeights = [0.6, 0.2, 0.1, 0.1];
        const riskWeights = [0.5, 0.3, 0.15, 0.05];

        const stateRandom = Math.random();
        const riskRandom = Math.random();

        let status = 'active';
        let cumulative = 0;
        for (let i = 0; i < states.length; i++) {
            cumulative += stateWeights[i];
            if (stateRandom <= cumulative) {
                status = states[i];
                break;
            }
        }

        let riskLevel = 'low';
        cumulative = 0;
        for (let i = 0; i < riskLevels.length; i++) {
            cumulative += riskWeights[i];
            if (riskRandom <= cumulative) {
                riskLevel = riskLevels[i];
                break;
            }
        }

        const activityScore = Math.random() * 100;
        const riskScore = this.calculateRiskScore(riskLevel, activityScore);

        return {
            status,
            riskLevel,
            activityScore,
            riskScore
        };
    }

    /**
     * Generate IP address
     */
    generateIPAddress() {
        return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
    }

    /**
     * Generate activity history
     */
    generateActivityHistory() {
        const activities = [];
        const activityTypes = ['page_view', 'click', 'scroll', 'form_submit', 'api_call', 'file_download'];
        const hours = 2;

        for (let i = 0; i < Math.floor(Math.random() * 20) + 5; i++) {
            activities.push({
                timestamp: new Date(Date.now() - Math.random() * hours * 60 * 60 * 1000),
                type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
                duration: Math.random() * 300, // 0-5 minutes
                intensity: Math.random() // 0-1
            });
        }

        return activities.sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Initialize risk factors
     */
    initializeRiskFactors() {
        return {
            locationChange: { weight: 0.3, threshold: 0.7 },
            deviceChange: { weight: 0.25, threshold: 0.6 },
            unusualTiming: { weight: 0.2, threshold: 0.8 },
            lowActivity: { weight: 0.15, threshold: 0.4 },
            suspiciousIP: { weight: 0.1, threshold: 0.9 }
        };
    }

    /**
     * Calculate risk score based on factors
     */
    calculateRiskScore(riskLevel, activityScore) {
        const baseScores = {
            low: 20,
            medium: 50,
            high: 75,
            critical: 90
        };

        let score = baseScores[riskLevel] || 20;

        // Adjust based on activity score
        if (activityScore < 30) score += 15;
        else if (activityScore > 70) score -= 10;

        // Add some randomness
        score += (Math.random() - 0.5) * 10;

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Analyze user activity patterns
     */
    analyzeActivityPatterns(session) {
        const activities = session.activities;
        if (activities.length < 3) return { frequency: 0, intensity: 0, pattern: 'unknown' };

        const recentActivities = activities.filter(a =>
            Date.now() - a.timestamp.getTime() < this.optimizationSettings.activityWindow * 60 * 1000
        );

        const frequency = recentActivities.length / (this.optimizationSettings.activityWindow / 60); // per hour
        const avgIntensity = recentActivities.reduce((sum, a) => sum + a.intensity, 0) / recentActivities.length;

        // Determine pattern
        let pattern = 'normal';
        if (frequency > 10) pattern = 'high';
        else if (frequency < 2) pattern = 'low';
        else if (this.isUnusualTiming(recentActivities)) pattern = 'unusual';

        return {
            frequency,
            intensity: avgIntensity,
            pattern
        };
    }

    /**
     * Check for unusual timing patterns
     */
    isUnusualTiming(activities) {
        if (activities.length < 5) return false;

        const hours = activities.map(a => a.timestamp.getHours());
        const avgHour = hours.reduce((a, b) => a + b, 0) / hours.length;
        const variance = hours.reduce((sum, h) => sum + Math.pow(h - avgHour, 2), 0) / hours.length;

        // High variance indicates unusual timing
        return variance > 25;
    }

    /**
     * Assess session risk
     */
    assessSessionRisk(session) {
        let riskScore = 0;
        const activity = this.analyzeActivityPatterns(session);

        // Activity-based risk
        if (activity.pattern === 'low') riskScore += 25;
        if (activity.intensity < 0.3) riskScore += 15;

        // Time-based risk
        const sessionAge = (Date.now() - session.startTime.getTime()) / (1000 * 60); // minutes
        if (sessionAge > session.originalTimeout * 1.5) riskScore += 20;

        // Location/device consistency
        if (this.hasLocationChange(session)) riskScore += this.riskFactors.locationChange.weight * 100;
        if (this.hasDeviceChange(session)) riskScore += this.riskFactors.deviceChange.weight * 100;

        // IP reputation (simulated)
        if (this.isSuspiciousIP(session.ipAddress)) riskScore += this.riskFactors.suspiciousIP.weight * 100;

        return Math.min(100, riskScore);
    }

    /**
     * Check for location changes (simplified)
     */
    hasLocationChange(session) {
        // In a real system, this would check against user's known locations
        return Math.random() > 0.8; // 20% chance for demo
    }

    /**
     * Check for device changes
     */
    hasDeviceChange(session) {
        // In a real system, this would check device fingerprint consistency
        return Math.random() > 0.9; // 10% chance for demo
    }

    /**
     * Check for suspicious IP
     */
    isSuspiciousIP(ip) {
        // In a real system, this would check against threat intelligence
        const octets = ip.split('.').map(Number);
        return octets.some(octet => octet > 240); // Simplified check
    }

    /**
     * Optimize session timeout based on analysis
     */
    optimizeSessionTimeout(session) {
        const activity = this.analyzeActivityPatterns(session);
        const riskScore = this.assessSessionRisk(session);
        const currentTime = Date.now();
        const sessionAge = (currentTime - session.startTime.getTime()) / (1000 * 60);

        let newTimeout = this.optimizationSettings.baseTimeout;
        let reason = 'baseline';

        // Activity-based adjustment
        if (activity.frequency > 5) {
            // High activity - extend timeout
            newTimeout = Math.min(this.optimizationSettings.maxExtension,
                this.optimizationSettings.baseTimeout * 1.5);
            reason = 'high_activity';
        } else if (activity.frequency < 1) {
            // Low activity - shorten timeout
            newTimeout = Math.max(this.optimizationSettings.minTimeout,
                this.optimizationSettings.baseTimeout * 0.5);
            reason = 'low_activity';
        }

        // Risk-based adjustment
        if (riskScore > 70) {
            newTimeout = Math.max(this.optimizationSettings.minTimeout, newTimeout * 0.7);
            reason = 'high_risk';
        } else if (riskScore < 30) {
            newTimeout = Math.min(this.optimizationSettings.maxExtension, newTimeout * 1.3);
            reason = 'low_risk';
        }

        // Apply sensitivity factor
        const adjustment = (newTimeout - this.optimizationSettings.baseTimeout) * this.optimizationSettings.riskSensitivity;
        newTimeout = this.optimizationSettings.baseTimeout + adjustment;

        // Ensure bounds
        newTimeout = Math.max(this.optimizationSettings.minTimeout,
            Math.min(this.optimizationSettings.maxExtension, newTimeout));

        // Record optimization
        const optimization = {
            timestamp: new Date(),
            previousTimeout: session.currentTimeout,
            newTimeout: Math.round(newTimeout),
            reason: reason,
            activityScore: activity.intensity,
            riskScore: riskScore
        };

        session.optimizations.push(optimization);
        session.currentTimeout = optimization.newTimeout;

        // Update session status
        this.updateSessionStatus(session);

        return optimization;
    }

    /**
     * Update session status based on current state
     */
    updateSessionStatus(session) {
        const currentTime = Date.now();
        const timeSinceActivity = (currentTime - session.lastActivity.getTime()) / (1000 * 60);
        const timeToExpiry = session.currentTimeout - ((currentTime - session.startTime.getTime()) / (1000 * 60));

        if (timeToExpiry <= 0) {
            session.status = 'expired';
        } else if (session.currentTimeout > session.originalTimeout) {
            session.status = 'extended';
        } else if (session.currentTimeout < session.originalTimeout) {
            session.status = 'shortened';
        } else {
            session.status = 'active';
        }

        // Update risk level based on current risk score
        session.riskScore = this.assessSessionRisk(session);
        session.riskLevel = this.getRiskLevel(session.riskScore);
    }

    /**
     * Get risk level from score
     */
    getRiskLevel(score) {
        if (score >= 80) return 'critical';
        if (score >= 60) return 'high';
        if (score >= 40) return 'medium';
        return 'low';
    }

    /**
     * Toggle optimization on/off
     */
    toggleOptimization() {
        if (this.isOptimizing) {
            if (this.optimizationInterval) {
                clearInterval(this.optimizationInterval);
            }
            this.isOptimizing = false;
            this.showNotification('Optimization stopped');
        } else {
            this.startOptimization();
            this.isOptimizing = true;
            this.showNotification('Optimization started');
        }
        this.render();
    }

    /**
     * Start continuous optimization
     */
    startOptimization() {
        this.optimizationInterval = setInterval(() => {
            this.sessions.forEach(session => {
                if (session.status !== 'expired') {
                    this.optimizeSessionTimeout(session);
                }
            });
            this.updateAnalytics();
            this.render();
        }, 10000); // Optimize every 10 seconds
    }

    /**
     * Update optimization settings
     */
    updateOptimizationSettings() {
        this.optimizationSettings.activityWindow = parseInt(document.getElementById('activityWindow').value);
        this.optimizationSettings.riskSensitivity = parseFloat(document.getElementById('riskSensitivity').value);
        this.optimizationSettings.baseTimeout = parseInt(document.getElementById('baseTimeout').value);

        document.getElementById('activityWindowValue').textContent = this.optimizationSettings.activityWindow;
        document.getElementById('riskSensitivityValue').textContent = this.optimizationSettings.riskSensitivity.toFixed(1);
        document.getElementById('baseTimeoutValue').textContent = this.optimizationSettings.baseTimeout;

        // Re-optimize all active sessions with new settings
        this.sessions.forEach(session => {
            if (session.status !== 'expired') {
                this.optimizeSessionTimeout(session);
            }
        });

        this.updateAnalytics();
        this.render();
    }

    /**
     * Simulate session activity
     */
    simulateActivity() {
        const activeSessions = this.sessions.filter(s => s.status !== 'expired');

        activeSessions.forEach(session => {
            // Random chance of activity
            if (Math.random() < 0.3) { // 30% chance
                const activity = {
                    timestamp: new Date(),
                    type: ['page_view', 'click', 'scroll', 'api_call'][Math.floor(Math.random() * 4)],
                    duration: Math.random() * 60,
                    intensity: Math.random()
                };

                session.activities.push(activity);
                session.lastActivity = new Date();

                // Keep activity history manageable
                if (session.activities.length > 50) {
                    session.activities = session.activities.slice(-50);
                }
            }
        });

        this.showNotification('Activity simulation completed');
        this.render();
    }

    /**
     * Extend session manually
     */
    extendSession() {
        if (this.selectedSession) {
            const extension = Math.min(60, this.selectedSession.currentTimeout * 0.5); // Extend by up to 50% or 60 min
            this.selectedSession.currentTimeout += extension;

            const optimization = {
                timestamp: new Date(),
                previousTimeout: this.selectedSession.currentTimeout - extension,
                newTimeout: this.selectedSession.currentTimeout,
                reason: 'manual_extension',
                activityScore: 0,
                riskScore: this.selectedSession.riskScore
            };

            this.selectedSession.optimizations.push(optimization);
            this.selectedSession.status = 'extended';

            this.showNotification(`Session extended by ${extension} minutes`);
            this.closeModal();
            this.render();
        }
    }

    /**
     * Shorten session manually
     */
    shortenSession() {
        if (this.selectedSession) {
            const reduction = Math.min(30, this.selectedSession.currentTimeout * 0.3); // Reduce by up to 30% or 30 min
            this.selectedSession.currentTimeout = Math.max(5, this.selectedSession.currentTimeout - reduction);

            const optimization = {
                timestamp: new Date(),
                previousTimeout: this.selectedSession.currentTimeout + reduction,
                newTimeout: this.selectedSession.currentTimeout,
                reason: 'manual_shortening',
                activityScore: 0,
                riskScore: this.selectedSession.riskScore
            };

            this.selectedSession.optimizations.push(optimization);
            this.selectedSession.status = 'shortened';

            this.showNotification(`Session shortened by ${reduction} minutes`);
            this.closeModal();
            this.render();
        }
    }

    /**
     * Terminate session
     */
    terminateSession() {
        if (this.selectedSession) {
            this.selectedSession.status = 'expired';
            this.selectedSession.currentTimeout = 0;

            const optimization = {
                timestamp: new Date(),
                previousTimeout: this.selectedSession.currentTimeout,
                newTimeout: 0,
                reason: 'manual_termination',
                activityScore: 0,
                riskScore: this.selectedSession.riskScore
            };

            this.selectedSession.optimizations.push(optimization);

            this.showNotification('Session terminated');
            this.closeModal();
            this.render();
        }
    }

    /**
     * Show session details modal
     */
    showSessionDetails(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        this.selectedSession = session;

        const modal = document.getElementById('sessionModal');
        const content = modal.querySelector('.modal-content');

        const activity = this.analyzeActivityPatterns(session);
        const timeToExpiry = session.currentTimeout - ((Date.now() - session.startTime.getTime()) / (1000 * 60));

        content.innerHTML = `
            <span class="modal-close" onclick="window.controller.closeModal()">&times;</span>
            <h2 id="sessionModalTitle">Session Details: ${session.userId}</h2>
            <div id="sessionModalContent">
                <div class="session-details">
                    <div class="detail-row">
                        <span class="label">User ID</span>
                        <span class="value">${session.userId}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Device</span>
                        <span class="value">${session.device}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Location</span>
                        <span class="value">${session.location}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">IP Address</span>
                        <span class="value">${session.ipAddress}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Status</span>
                        <span class="value">${session.status.toUpperCase()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Risk Level</span>
                        <span class="value ${session.riskLevel}">${session.riskLevel.toUpperCase()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Current Timeout</span>
                        <span class="value">${Math.round(session.currentTimeout)} min</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Time to Expiry</span>
                        <span class="value">${timeToExpiry > 0 ? Math.round(timeToExpiry) + ' min' : 'Expired'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Activity Score</span>
                        <span class="value">${activity.intensity.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Risk Score</span>
                        <span class="value">${session.riskScore}/100</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Total Activities</span>
                        <span class="value">${session.activities.length}</span>
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="window.controller.extendSession()">Extend Session</button>
                <button class="btn btn-warning" onclick="window.controller.shortenSession()">Shorten Session</button>
                <button class="btn btn-danger" onclick="window.controller.terminateSession()">Terminate Session</button>
                <button class="btn btn-secondary" onclick="window.controller.closeModal()">Close</button>
            </div>
        `;

        modal.classList.add('show');
    }

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('sessionModal');
        if (modal) {
            modal.classList.remove('show');
        }
        this.selectedSession = null;
    }

    /**
     * Filter sessions
     */
    filterSessions() {
        const statusFilter = document.getElementById('sessionStatusFilter').value;
        const riskFilter = document.getElementById('riskLevelFilter').value;
        const searchTerm = document.getElementById('sessionSearch').value.toLowerCase();

        let filtered = this.sessions;

        if (statusFilter !== 'all') {
            filtered = filtered.filter(s => s.status === statusFilter);
        }

        if (riskFilter !== 'all') {
            filtered = filtered.filter(s => s.riskLevel === riskFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(s =>
                s.userId.toLowerCase().includes(searchTerm) ||
                s.device.toLowerCase().includes(searchTerm) ||
                s.location.toLowerCase().includes(searchTerm)
            );
        }

        this.renderSessions(filtered);
    }

    /**
     * Generate comprehensive report
     */
    generateReport() {
        const report = {
            timestamp: new Date().toLocaleString(),
            summary: {
                totalSessions: this.sessions.length,
                activeSessions: this.sessions.filter(s => s.status === 'active').length,
                extendedSessions: this.sessions.filter(s => s.status === 'extended').length,
                shortenedSessions: this.sessions.filter(s => s.status === 'shortened').length,
                expiredSessions: this.sessions.filter(s => s.status === 'expired').length,
                avgSessionDuration: this.analytics.avgSessionDuration,
                securityScore: this.analytics.securityScore,
                optimizationImpact: this.analytics.optimizationImpact
            },
            riskDistribution: this.getRiskDistribution(),
            optimizationStats: this.getOptimizationStats(),
            recommendations: this.generateRecommendations()
        };

        const csv = `Session Optimization Report\n${report.timestamp}\n\n` +
                   `Summary\n` +
                   `Total Sessions,${report.summary.totalSessions}\n` +
                   `Active Sessions,${report.summary.activeSessions}\n` +
                   `Extended Sessions,${report.summary.extendedSessions}\n` +
                   `Shortened Sessions,${report.summary.shortenedSessions}\n` +
                   `Expired Sessions,${report.summary.expiredSessions}\n` +
                   `Avg Session Duration,${report.summary.avgSessionDuration} min\n` +
                   `Security Score,${report.summary.securityScore}%\n` +
                   `Optimization Impact,${report.summary.optimizationImpact}%\n\n` +
                   `Risk Distribution\n` +
                   report.riskDistribution.map(r => `${r.level},${r.count}`).join('\n') + '\n\n' +
                   `Optimization Statistics\n` +
                   report.optimizationStats.map(o => `${o.metric},${o.value}`).join('\n');

        this.downloadFile(csv, 'session-optimization-report.csv');
        this.showNotification('Report generated and downloaded');
    }

    /**
     * Export session data
     */
    exportData() {
        const data = this.sessions.map(session => ({
            id: session.id,
            userId: session.userId,
            device: session.device,
            location: session.location,
            status: session.status,
            riskLevel: session.riskLevel,
            currentTimeout: session.currentTimeout,
            riskScore: session.riskScore,
            activityCount: session.activities.length,
            optimizationCount: session.optimizations.length
        }));

        const csv = 'ID,User,Device,Location,Status,Risk Level,Timeout (min),Risk Score,Activities,Optimizations\n' +
                   data.map(row => Object.values(row).join(',')).join('\n');

        this.downloadFile(csv, 'session-data-export.csv');
        this.showNotification('Data exported successfully');
    }

    /**
     * Get risk distribution
     */
    getRiskDistribution() {
        const distribution = { low: 0, medium: 0, high: 0, critical: 0 };
        this.sessions.forEach(session => {
            distribution[session.riskLevel]++;
        });

        return Object.entries(distribution).map(([level, count]) => ({ level, count }));
    }

    /**
     * Get optimization statistics
     */
    getOptimizationStats() {
        const totalExtensions = this.sessions.reduce((sum, s) => sum + s.optimizations.filter(o => o.reason === 'high_activity' || o.reason === 'low_risk').length, 0);
        const totalShortenings = this.sessions.reduce((sum, s) => sum + s.optimizations.filter(o => o.reason === 'low_activity' || o.reason === 'high_risk').length, 0);
        const avgExtension = totalExtensions > 0 ? this.sessions.reduce((sum, s) => {
            const extensions = s.optimizations.filter(o => o.newTimeout > o.previousTimeout);
            return sum + extensions.reduce((extSum, o) => extSum + (o.newTimeout - o.previousTimeout), 0) / extensions.length;
        }, 0) / this.sessions.filter(s => s.optimizations.some(o => o.newTimeout > o.previousTimeout)).length : 0;

        return [
            { metric: 'Total Extensions', value: totalExtensions },
            { metric: 'Total Shortenings', value: totalShortenings },
            { metric: 'Average Extension', value: `${avgExtension.toFixed(1)} min` },
            { metric: 'Optimization Rate', value: `${((totalExtensions + totalShortenings) / this.sessions.length * 100).toFixed(1)}%` }
        ];
    }

    /**
     * Generate recommendations
     */
    generateRecommendations() {
        const recommendations = [];

        const highRiskCount = this.sessions.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length;
        if (highRiskCount > 0) {
            recommendations.push(`${highRiskCount} sessions have high risk - consider shortening timeouts`);
        }

        const lowActivityCount = this.sessions.filter(s => {
            const activity = this.analyzeActivityPatterns(s);
            return activity.frequency < 1;
        }).length;

        if (lowActivityCount > 0) {
            recommendations.push(`${lowActivityCount} sessions show low activity - timeouts can be shortened`);
        }

        const extendedCount = this.sessions.filter(s => s.status === 'extended').length;
        if (extendedCount > this.sessions.length * 0.3) {
            recommendations.push('Many sessions are extended - review base timeout settings');
        }

        return recommendations;
    }

    /**
     * Handle tab changes
     */
    onTabChange(tabName) {
        // Tab content is handled by CSS, but we can add specific logic here
        if (tabName === 'analytics') {
            this.updateAnalytics();
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Session card clicks
        document.addEventListener('click', (e) => {
            const sessionCard = e.target.closest('.session-card');
            if (sessionCard) {
                const sessionId = sessionCard.getAttribute('data-session-id');
                if (sessionId) this.showSessionDetails(sessionId);
            }
        });
    }

    /**
     * Update analytics data
     */
    updateAnalytics() {
        const active = this.sessions.filter(s => s.status === 'active').length;
        const extended = this.sessions.filter(s => s.status === 'extended').length;
        const shortened = this.sessions.filter(s => s.status === 'shortened').length;
        const expired = this.sessions.filter(s => s.status === 'expired').length;

        this.analytics.activeSessions = active;
        this.analytics.extendedSessions = extended;
        this.analytics.shortenedSessions = shortened;
        this.analytics.expiredSessions = expired;
        this.analytics.totalSessions = this.sessions.length;

        // Calculate average session duration
        const activeSessions = this.sessions.filter(s => s.status !== 'expired');
        if (activeSessions.length > 0) {
            this.analytics.avgSessionDuration = Math.round(
                activeSessions.reduce((sum, s) => {
                    return sum + (Date.now() - s.startTime.getTime()) / (1000 * 60);
                }, 0) / activeSessions.length
            );
        }

        // Calculate security score (lower risk = higher score)
        const avgRisk = this.sessions.reduce((sum, s) => sum + s.riskScore, 0) / this.sessions.length;
        this.analytics.securityScore = Math.max(0, Math.min(100, Math.round(100 - avgRisk)));

        // Calculate optimization impact
        const optimizedSessions = extended + shortened;
        this.analytics.optimizationImpact = Math.round((optimizedSessions / this.sessions.length) * 100);
    }

    /**
     * Simulate initial data
     */
    simulateInitialData() {
        this.sessions.forEach(session => this.updateSessionStatus(session));
        this.updateAnalytics();
    }

    /**
     * Render all UI sections
     */
    render() {
        this.renderDashboard();
        this.renderSessions();
        this.updateFooter();
    }

    /**
     * Render dashboard
     */
    renderDashboard() {
        // Update overview cards
        document.getElementById('activeSessions').textContent = this.analytics.activeSessions;
        document.getElementById('extendedSessions').textContent = this.analytics.extendedSessions;
        document.getElementById('shortenedSessions').textContent = this.analytics.shortenedSessions;
        document.getElementById('atRiskSessions').textContent = this.sessions.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length;

        document.getElementById('avgSessionDuration').textContent = `${this.analytics.avgSessionDuration}m`;
        document.getElementById('securityScore').textContent = `${this.analytics.securityScore}%`;
        document.getElementById('optimizationImpact').textContent = `+${this.analytics.optimizationImpact}%`;

        // Update progress bars
        const activePercent = (this.analytics.activeSessions / this.analytics.totalSessions) * 100;
        const durationPercent = Math.min(100, (this.analytics.avgSessionDuration / 120) * 100); // Assuming 120 min max
        const securityPercent = this.analytics.securityScore;
        const impactPercent = this.analytics.optimizationImpact;

        document.getElementById('activeSessionsBar').style.width = `${activePercent}%`;
        document.getElementById('sessionDurationBar').style.width = `${durationPercent}%`;
        document.getElementById('securityScoreBar').style.width = `${securityPercent}%`;
        document.getElementById('optimizationImpactBar').style.width = `${impactPercent}%`;

        // Update UX and security enhancement metrics
        const uxImprovement = Math.round(this.analytics.optimizationImpact * 0.7);
        const securityEnhancement = Math.round(this.analytics.optimizationImpact * 0.3);
        document.getElementById('uxImprovement').textContent = uxImprovement;
        document.getElementById('securityEnhancement').textContent = securityEnhancement;

        // Render charts
        this.renderActivityChart();
        this.renderTimeoutChart();
        this.renderRecentActivity();
        this.renderRecommendations();
    }

    /**
     * Render sessions section
     */
    renderSessions(filtered = null) {
        const sessions = filtered || this.sessions;
        const container = document.getElementById('sessionsGrid');

        if (!container) return;

        const html = sessions.map(session => `
            <div class="session-card ${session.status}" data-session-id="${session.id}">
                <div class="session-header">
                    <div class="session-user">${session.userId}</div>
                    <div class="session-status ${session.status}">${session.status.toUpperCase()}</div>
                </div>
                <div class="session-metrics">
                    <div class="session-metric">
                        <span class="label">Device</span>
                        <span class="value">${session.device}</span>
                    </div>
                    <div class="session-metric">
                        <span class="label">Location</span>
                        <span class="value">${session.location}</span>
                    </div>
                    <div class="session-metric">
                        <span class="label">Timeout</span>
                        <span class="value">${Math.round(session.currentTimeout)}m</span>
                    </div>
                    <div class="session-metric">
                        <span class="label">Activities</span>
                        <span class="value">${session.activities.length}</span>
                    </div>
                </div>
                <div class="session-risk">
                    <span class="risk-level ${session.riskLevel}">${session.riskLevel.toUpperCase()}</span>
                    <span>Risk Score: ${session.riskScore}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = html || '<div class="placeholder">No sessions found</div>';
    }

    /**
     * Render activity chart
     */
    renderActivityChart() {
        const canvas = document.getElementById('activityChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.clientWidth || 800;
        const height = canvas.clientHeight || 300;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Get activity data for last 24 hours
        const hours = 24;
        const data = [];

        for (let i = hours - 1; i >= 0; i--) {
            const time = new Date(Date.now() - i * 60 * 60 * 1000);
            const activeCount = this.sessions.filter(s => {
                const lastActivity = s.lastActivity.getTime();
                return (Date.now() - lastActivity) / (1000 * 60 * 60) <= (24 - i);
            }).length;

            data.push(activeCount);
        }

        const maxValue = Math.max(...data, 1);
        const padding = 40;

        // Draw line
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 3;
        ctx.beginPath();

        data.forEach((value, i) => {
            const x = padding + (i * (width - 2 * padding) / (data.length - 1));
            const y = height - padding - (value / maxValue * (height - 2 * padding));

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.stroke();
    }

    /**
     * Render timeout distribution chart
     */
    renderTimeoutChart() {
        const canvas = document.getElementById('timeoutChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.clientWidth || 800;
        const height = canvas.clientHeight || 300;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        const timeouts = this.sessions.map(s => s.currentTimeout);
        const ranges = [15, 30, 60, 120, 240];
        const distribution = ranges.map((max, i) => {
            const min = i === 0 ? 0 : ranges[i - 1];
            return timeouts.filter(t => t > min && t <= max).length;
        });

        const maxValue = Math.max(...distribution);
        const barWidth = (width - 80) / distribution.length;
        const padding = 40;

        distribution.forEach((value, i) => {
            const x = padding + i * barWidth;
            const barHeight = (value / maxValue) * (height - 2 * padding);
            const y = height - padding - barHeight;

            ctx.fillStyle = ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'][i];
            ctx.fillRect(x + 5, y, barWidth - 10, barHeight);
        });
    }

    /**
     * Render recent activity
     */
    renderRecentActivity() {
        const container = document.getElementById('recentActivity');
        if (!container) return;

        const recentOptimizations = [];
        this.sessions.forEach(session => {
            session.optimizations.slice(-2).forEach(opt => {
                recentOptimizations.push({
                    session: session.userId,
                    action: opt.reason.replace('_', ' '),
                    timestamp: opt.timestamp,
                    timeout: opt.newTimeout
                });
            });
        });

        recentOptimizations.sort((a, b) => b.timestamp - a.timestamp);
        const recent = recentOptimizations.slice(0, 5);

        const html = recent.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">⏰</div>
                <div class="activity-content">
                    <div class="activity-title">${activity.session} - ${activity.action}</div>
                    <div class="activity-description">Timeout set to ${activity.timeout} minutes</div>
                    <div class="activity-time">${activity.timestamp.toLocaleTimeString()}</div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html || '<div class="placeholder">No recent activity</div>';
    }

    /**
     * Render recommendations
     */
    renderRecommendations() {
        const container = document.getElementById('recommendationsList');
        if (!container) return;

        const recommendations = this.generateRecommendations();

        const html = recommendations.map(rec => `
            <div class="recommendation-item">
                <div class="recommendation-icon">💡</div>
                <div class="recommendation-content">
                    <div class="recommendation-title">Optimization Suggestion</div>
                    <div class="recommendation-description">${rec}</div>
                    <div class="recommendation-time">${new Date().toLocaleTimeString()}</div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html || '<div class="placeholder">No recommendations available</div>';
    }

    /**
     * Update footer
     */
    updateFooter() {
        document.getElementById('systemStatus').textContent = this.isOptimizing ? 'Optimizing' : 'Idle';
        document.getElementById('systemStatusText').textContent = this.isOptimizing ? 'Active' : 'Paused';
        document.getElementById('systemStatus').className = `status-dot ${this.isOptimizing ? 'active' : ''}`;
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
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                ${message}
            </div>
        `;

        const container = document.getElementById('notificationContainer');
        if (container) {
            container.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    if (container.contains(notification)) {
                        container.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.controller = new PredictiveSessionExpirationOptimizer();
});