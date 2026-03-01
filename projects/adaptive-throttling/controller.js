/**
 * Adaptive Interaction Throttling Controller
 * Dynamically adjusts request limits based on contextual usage behavior
 * Implements behavioral heuristics for fair rate limiting
 */

class AdaptiveThrottlingController {
    constructor() {
        this.users = this.initializeUsers();
        this.rulesets = this.initializeRulesets();
        this.events = [];
        this.metrics = {
            activeUsers: 0,
            throttledCount: 0,
            fairnessScore: 95,
            attacksDetected: 0
        };
        this.baselineLimit = 100;
        this.behaviorPatterns = {
            normal: { minReqs: 20, maxReqs: 120, burstThreshold: 150 },
            burst: { minReqs: 121, maxReqs: 250, duration: 300000 },
            attack: { minReqs: 251, threshold: 0.3 }
        };
        this.updateInterval = null;
        this.init();
    }

    /**
     * Initialize the controller
     */
    init() {
        this.setupEventListeners();
        this.startMetricsUpdates();
        this.simulateInitialLoad();
    }

    /**
     * Initialize sample users with different behavior patterns
     */
    initializeUsers() {
        const users = [];
        const patterns = ['normal', 'power_user', 'burst', 'suspicious'];

        for (let i = 1; i <= 12; i++) {
            const pattern = patterns[(i - 1) % patterns.length];
            users.push({
                id: `user_${i}`,
                name: `User ${i}`,
                email: `user${i}@example.com`,
                pattern: pattern,
                requests: this.generateUserRequests(pattern),
                burstDetected: false,
                anomalyScore: 0,
                limitAdjustment: 1.0,
                lastAdjustedTime: Date.now(),
                isThrottled: false,
                blockStatus: 'active',
                joinDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                trustScore: this.generateTrustScore(pattern)
            });
        }

        return users;
    }

    /**
     * Generate requests based on user pattern
     */
    generateUserRequests(pattern) {
        const baseReqs = 10;
        let requests = [];

        switch (pattern) {
            case 'normal':
                for (let i = 0; i < 60; i++) {
                    requests.push({
                        timestamp: Date.now() - (60 - i) * 1000,
                        method: ['GET', 'POST', 'PUT'][Math.floor(Math.random() * 3)],
                        endpoint: ['/api/data', '/api/users', '/api/config'][Math.floor(Math.random() * 3)],
                        latency: 200 + Math.random() * 300,
                        status: 200
                    });
                }
                break;

            case 'power_user':
                for (let i = 0; i < 100; i++) {
                    requests.push({
                        timestamp: Date.now() - (100 - i) * 500,
                        method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
                        endpoint: ['/api/data', '/api/users', '/api/config', '/api/analytics'][Math.floor(Math.random() * 4)],
                        latency: 150 + Math.random() * 400,
                        status: 200
                    });
                }
                break;

            case 'burst':
                // Initial normal requests
                for (let i = 0; i < 20; i++) {
                    requests.push({
                        timestamp: Date.now() - 120 * 1000 + i * 2000,
                        method: 'GET',
                        endpoint: '/api/data',
                        latency: 200 + Math.random() * 300,
                        status: 200
                    });
                }
                // Sudden burst
                for (let i = 0; i < 80; i++) {
                    requests.push({
                        timestamp: Date.now() - (80 - i) * 250,
                        method: ['GET', 'POST'][Math.floor(Math.random() * 2)],
                        endpoint: '/api/data',
                        latency: 300 + Math.random() * 200,
                        status: 429 // Too many requests
                    });
                }
                break;

            case 'suspicious':
                for (let i = 0; i < 150; i++) {
                    requests.push({
                        timestamp: Date.now() - (150 - i) * 200,
                        method: 'POST',
                        endpoint: '/api/users',
                        latency: 100 + Math.random() * 100,
                        status: i > 100 ? 403 : 429,
                        attackIndicator: true
                    });
                }
                break;
        }

        return requests;
    }

    /**
     * Generate trust score based on pattern
     */
    generateTrustScore(pattern) {
        const scores = {
            normal: 95,
            power_user: 85,
            burst: 60,
            suspicious: 20
        };
        return scores[pattern] || 80;
    }

    /**
     * Initialize throttling rulesets
     */
    initializeRulesets() {
        return [
            {
                id: 'rule_1',
                name: 'Baseline Rate Limit',
                type: 'BASELINE',
                limit: 100,
                window: 60,
                description: 'Default rate limit for all users',
                priority: 1
            },
            {
                id: 'rule_2',
                name: 'Burst Detection',
                type: 'BURST',
                threshold: 150,
                window: 300,
                description: 'Detect and adapt to legitimate usage spikes',
                priority: 2
            },
            {
                id: 'rule_3',
                name: 'Anomaly Detection',
                type: 'ANOMALY',
                threshold: 0.7,
                window: 600,
                description: 'Identify suspicious patterns and potential attacks',
                priority: 3
            },
            {
                id: 'rule_4',
                name: 'Fairness Enforcement',
                type: 'FAIRNESS',
                minShare: 0.5,
                maxShare: 2.0,
                description: 'Ensure fair resource distribution across users',
                priority: 4
            }
        ];
    }

    /**
     * Calculate similarity between request patterns
     */
    calculatePatternSimilarity(userRequests, referencePattern) {
        if (userRequests.length === 0) return 0;

        const recentRequests = userRequests.slice(-60); // Last 60 seconds
        const frequency = recentRequests.length / 60;
        const methodDistribution = {};
        const endpointDistribution = {};

        recentRequests.forEach(req => {
            methodDistribution[req.method] = (methodDistribution[req.method] || 0) + 1;
            endpointDistribution[req.endpoint] = (endpointDistribution[req.endpoint] || 0) + 1;
        });

        let similarity = 0;
        if (referencePattern.minReqs && frequency >= referencePattern.minReqs / 60) similarity += 25;
        if (referencePattern.maxReqs && frequency <= referencePattern.maxReqs / 60) similarity += 25;

        // Check consistency of methods
        const methodVariety = Object.keys(methodDistribution).length;
        similarity += Math.min(20, methodVariety * 5);

        // Check endpoint variety
        const endpointVariety = Object.keys(endpointDistribution).length;
        similarity += Math.min(30, endpointVariety * 10);

        return Math.min(100, similarity);
    }

    /**
     * Detect user behavior pattern
     */
    detectBehavior(user) {
        const recentRequests = user.requests.slice(-120); // Last 2 minutes
        const frequency = recentRequests.length / 120;
        const recentSecond = recentRequests.slice(-60);
        const currentFrequency = recentSecond.length;

        // Check for normal pattern
        const normalSim = this.calculatePatternSimilarity(recentRequests, this.behaviorPatterns.normal);

        // Check for power user pattern (high frequency but consistent)
        const consistentHigh = currentFrequency > 80 && normalSim > 60;

        // Check for burst (spike detection)
        const avgFrequency = recentRequests.length / (recentRequests[recentRequests.length - 1]?.timestamp || 1 - recentRequests[0]?.timestamp || 1);
        const burstDetected = currentFrequency > this.behaviorPatterns.normal.burstThreshold && 
                             currentFrequency > frequency * 2.5;

        // Check for attack pattern
        const failureRate = recentRequests.filter(r => r.status >= 400).length / Math.max(1, recentRequests.length);
        const attackScore = failureRate;

        let detectedPattern = 'normal';
        if (attackScore > this.behaviorPatterns.attack.threshold) {
            detectedPattern = 'attack';
        } else if (burstDetected) {
            detectedPattern = 'burst';
        } else if (consistentHigh) {
            detectedPattern = 'power_user';
        }

        return {
            pattern: detectedPattern,
            frequency: frequency,
            currentFrequency: currentFrequency,
            burstDetected: burstDetected,
            attackScore: attackScore,
            failureRate: failureRate
        };
    }

    /**
     * Calculate anomaly score for a user
     */
    calculateAnomalyScore(user) {
        const behavior = this.detectBehavior(user);
        const recentRequests = user.requests.slice(-60);
        
        let anomalyScore = 0;

        // High failure rate
        const failureRate = recentRequests.filter(r => r.status >= 400).length / Math.max(1, recentRequests.length);
        anomalyScore += failureRate * 40;

        // Unusual request patterns
        const methodSet = new Set(recentRequests.map(r => r.method)).size;
        if (methodSet > 3) anomalyScore += 15;

        // High latency variability
        const latencies = recentRequests.map(r => r.latency);
        const avgLatency = latencies.reduce((a, b) => a + b, 0) / Math.max(1, latencies.length);
        const latencyStdDev = Math.sqrt(latencies.reduce((sum, lat) => sum + Math.pow(lat - avgLatency, 2), 0) / Math.max(1, latencies.length));
        if (latencyStdDev > avgLatency * 0.5) anomalyScore += 20;

        // Attack indicators
        if (behavior.attackScore > 0.3) anomalyScore += 25;

        return Math.min(100, anomalyScore);
    }

    /**
     * Calculate fairness score across all users
     */
    calculateFairnessScore() {
        if (this.users.length === 0) return 100;

        const activeUsers = this.users.filter(u => u.blockStatus === 'active');
        const limits = activeUsers.map(u => this.calculateUserLimit(u));
        
        const avgLimit = limits.reduce((a, b) => a + b, 0) / limits.length;
        const variance = limits.reduce((sum, limit) => sum + Math.pow(limit - avgLimit, 2), 0) / limits.length;
        const stdDev = Math.sqrt(variance);
        const coefficient = stdDev / avgLimit;

        // Fairness: lower std dev = higher fairness
        return Math.max(0, 100 - (coefficient * 50));
    }

    /**
     * Calculate dynamic limit for a user
     */
    calculateUserLimit(user) {
        let limit = this.baselineLimit;
        const behavior = this.detectBehavior(user);

        switch (behavior.pattern) {
            case 'normal':
                limit = this.baselineLimit;
                break;
            case 'power_user':
                limit = this.baselineLimit * 1.5; // 50% boost
                break;
            case 'burst':
                limit = this.baselineLimit * 0.7; // Reduce during burst
                break;
            case 'attack':
                limit = this.baselineLimit * 0.3; // Severe reduction
                break;
        }

        // Apply trust-based adjustment
        const trustMultiplier = user.trustScore / 100;
        limit *= trustMultiplier;

        // Fairness adjustment if overall fairness is low
        const fairness = this.calculateFairnessScore();
        if (fairness < 70) {
            const fairnessBoost = 1 + ((100 - fairness) / 200);
            limit *= fairnessBoost;
        }

        return Math.round(limit);
    }

    /**
     * Update user throttling status
     */
    updateUserThrottling(user) {
        const behavior = this.detectBehavior(user);
        const limit = this.calculateUserLimit(user);

        user.anomalyScore = this.calculateAnomalyScore(user);
        user.burstDetected = behavior.burstDetected;
        user.limitAdjustment = limit / this.baselineLimit;

        // Check if throttled
        user.isThrottled = behavior.currentFrequency > limit;

        // Log events
        if (behavior.burstDetected && !user.burstDetected) {
            this.logEvent('BURST', `Burst detected for ${user.name}`, 'burst', user.id);
        }

        if (behavior.attackScore > 0.3) {
            this.logEvent('ATTACK', `Attack pattern detected for ${user.name}`, 'attack', user.id);
            this.metrics.attacksDetected++;
        }

        if (user.isThrottled) {
            this.logEvent('THROTTLE', `Throttling applied to ${user.name}`, 'throttle', user.id);
        }

        // Adaptation event
        if (behavior.pattern !== user.pattern) {
            this.logEvent('ADAPTATION', `Behavior adapted from ${user.pattern} to ${behavior.pattern}`, 'adaptation', user.id);
            user.pattern = behavior.pattern;
        }
    }

    /**
     * Log event to event log
     */
    logEvent(type, message, category, userId) {
        this.events.unshift({
            id: `event_${Date.now()}`,
            type: type,
            message: message,
            category: category,
            userId: userId,
            timestamp: new Date(),
            timestampMs: Date.now()
        });

        // Keep only recent 200 events
        if (this.events.length > 200) {
            this.events = this.events.slice(0, 200);
        }
    }

    /**
     * Toggle throttling system on/off
     */
    toggleThrottling() {
        const button = document.querySelector('[onclick*="toggleThrottling"]');
        const isEnabled = button?.textContent.includes('Enable');

        if (isEnabled) {
            this.startMetricsUpdates();
            this.showNotification('Throttling system enabled');
        } else {
            if (this.updateInterval) clearInterval(this.updateInterval);
            this.showNotification('Throttling system disabled');
        }

        this.render();
    }

    /**
     * Simulate load increases
     */
    simulateLoad() {
        const multiplier = 1.5;

        this.users.forEach(user => {
            const additionalRequests = Math.floor(user.requests.length * (multiplier - 1));
            for (let i = 0; i < additionalRequests; i++) {
                user.requests.push({
                    timestamp: Date.now() - Math.random() * 5000,
                    method: ['GET', 'POST', 'PUT'][Math.floor(Math.random() * 3)],
                    endpoint: ['/api/data', '/api/users', '/api/config'][Math.floor(Math.random() * 3)],
                    latency: 200 + Math.random() * 400,
                    status: Math.random() > 0.8 ? 429 : 200
                });
            }
            this.updateUserThrottling(user);
        });

        this.showNotification('Load simulation applied (1.5x multiplier)');
        this.render();
    }

    /**
     * Generate compliance report
     */
    generateReport() {
        const report = {
            timestamp: new Date().toLocaleString(),
            totalUsers: this.users.length,
            activeUsers: this.users.filter(u => u.blockStatus === 'active').length,
            throttledUsers: this.users.filter(u => u.isThrottled).length,
            fairnessScore: this.metrics.fairnessScore,
            averageTrustScore: (this.users.reduce((sum, u) => sum + u.trustScore, 0) / this.users.length).toFixed(2),
            attacksDetected: this.metrics.attacksDetected,
            totalRequests: this.users.reduce((sum, u) => sum + u.requests.length, 0),
            totalEvents: this.events.length
        };

        const csv = `Adaptive Throttling Control Report\n${report.timestamp}\n\n` +
                   `Total Users,${report.totalUsers}\n` +
                   `Active Users,${report.activeUsers}\n` +
                   `Throttled Users,${report.throttledUsers}\n` +
                   `Fairness Score,${report.fairnessScore.toFixed(2)}%\n` +
                   `Average Trust Score,${report.averageTrustScore}\n` +
                   `Attacks Detected,${report.attacksDetected}\n` +
                   `Total Requests,${report.totalRequests}\n` +
                   `Total Events,${report.totalEvents}`;

        this.downloadFile(csv, 'throttling-report.csv');
        this.showNotification('Report generated and downloaded');
    }

    /**
     * Handle tab changes
     */
    onTabChange(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });

        const tabElement = document.getElementById(tabName);
        if (tabElement) {
            tabElement.classList.add('active');
        }

        const button = document.querySelector(`[data-tab="${tabName}"]`);
        if (button) {
            button.classList.add('active');
        }

        if (tabName === 'patterns') {
            this.renderBehaviorChart();
        } else if (tabName === 'dashboard') {
            this.renderRequestChart();
        }
    }

    /**
     * Filter users by status
     */
    filterUsers(status) {
        const filtered = status === 'all' ? 
            this.users : 
            this.users.filter(u => {
                if (status === 'throttled') return u.isThrottled;
                if (status === 'normal') return !u.isThrottled && u.blockStatus === 'active';
                if (status === 'suspicious') return u.anomalyScore > 50;
                return true;
            });

        return filtered;
    }

    /**
     * Filter events by type
     */
    filterEvents(type) {
        if (type === 'all') return this.events;
        return this.events.filter(e => e.category === type);
    }

    /**
     * Adjust user limit
     */
    adjustUserLimit(userId, percentage) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.limitAdjustment = percentage / 100;
            user.lastAdjustedTime = Date.now();
            this.updateUserThrottling(user);
            this.showNotification(`Limit adjusted for ${user.name}`);
            this.render();
        }
    }

    /**
     * Block or unblock user
     */
    blockUser(userId, block) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.blockStatus = block ? 'blocked' : 'active';
            const action = block ? 'blocked' : 'unblocked';
            this.logEvent('BLOCK', `User ${user.name} ${action}`, 'security', userId);
            this.showNotification(`User ${action}`);
            this.render();
        }
    }

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('userModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    /**
     * Show user details in modal
     */
    showUserDetails(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const modal = document.getElementById('userModal');
        const content = modal.querySelector('.modal-content');

        const behavior = this.detectBehavior(user);
        const limit = this.calculateUserLimit(user);

        content.innerHTML = `
            <span class="modal-close" onclick="window.controller.closeModal()">&times;</span>
            <h2>${user.name}</h2>
            <div class="user-details">
                <div class="detail-row">
                    <span class="label">Email</span>
                    <span class="value">${user.email}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Status</span>
                    <span class="value">${user.blockStatus === 'active' ? '✓ Active' : '✗ Blocked'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Behavior Pattern</span>
                    <span class="value">${behavior.pattern.toUpperCase()}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Trust Score</span>
                    <span class="value">${user.trustScore}%</span>
                </div>
                <div class="detail-row">
                    <span class="label">Anomaly Score</span>
                    <span class="value">${user.anomalyScore.toFixed(1)}/100</span>
                </div>
                <div class="detail-row">
                    <span class="label">Current Frequency</span>
                    <span class="value">${behavior.currentFrequency} req/min</span>
                </div>
                <div class="detail-row">
                    <span class="label">Assigned Limit</span>
                    <span class="value">${limit} req/min</span>
                </div>
                <div class="detail-row">
                    <span class="label">Throttled</span>
                    <span class="value">${user.isThrottled ? '🔴 Yes' : '🟢 No'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Total Requests</span>
                    <span class="value">${user.requests.length}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Joined</span>
                    <span class="value">${user.joinDate.toLocaleDateString()}</span>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="window.controller.adjustUserLimit('${user.id}', 150)">Increase Limit (150%)</button>
                <button class="btn btn-secondary" onclick="window.controller.adjustUserLimit('${user.id}', 100)">Reset Limit (100%)</button>
                <button class="btn btn-warning" onclick="window.controller.blockUser('${user.id}', ${user.blockStatus === 'active'})">${user.blockStatus === 'active' ? 'Block User' : 'Unblock User'}</button>
            </div>
        `;

        modal.classList.add('show');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                if (tabName) this.onTabChange(tabName);
            });
        });

        // User filter
        const userFilterSelect = document.getElementById('userFilter');
        if (userFilterSelect) {
            userFilterSelect.addEventListener('change', (e) => {
                this.renderUsers(e.target.value);
            });
        }

        // User sort
        const userSortSelect = document.getElementById('userSort');
        if (userSortSelect) {
            userSortSelect.addEventListener('change', (e) => {
                this.renderUsers(document.getElementById('userFilter')?.value || 'all', e.target.value);
            });
        }

        // Event filter
        const eventFilterSelect = document.getElementById('eventFilter');
        if (eventFilterSelect) {
            eventFilterSelect.addEventListener('change', (e) => {
                this.renderEvents(e.target.value);
            });
        }

        // Event search
        const eventSearch = document.getElementById('eventSearch');
        if (eventSearch) {
            eventSearch.addEventListener('input', (e) => {
                this.renderEvents(document.getElementById('eventFilter')?.value || 'all', e.target.value);
            });
        }

        // Modal close
        const modal = document.getElementById('userModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // User card click
        document.addEventListener('click', (e) => {
            const userCard = e.target.closest('.user-card');
            if (userCard) {
                const userId = userCard.getAttribute('data-user-id');
                if (userId) this.showUserDetails(userId);
            }
        });
    }

    /**
     * Render users section
     */
    renderUsers(status = 'all', sortBy = 'anomaly') {
        const filtered = this.filterUsers(status);

        // Sort
        if (sortBy === 'anomaly') {
            filtered.sort((a, b) => b.anomalyScore - a.anomalyScore);
        } else if (sortBy === 'frequency') {
            filtered.sort((a, b) => {
                const freqA = (this.detectBehavior(a)?.currentFrequency || 0);
                const freqB = (this.detectBehavior(b)?.currentFrequency || 0);
                return freqB - freqA;
            });
        } else if (sortBy === 'trust') {
            filtered.sort((a, b) => b.trustScore - a.trustScore);
        }

        const gridHtml = filtered.map(user => {
            const behavior = this.detectBehavior(user);
            const limit = this.calculateUserLimit(user);
            return `
                <div class="user-card" data-user-id="${user.id}">
                    <div class="user-header">
                        <div class="user-name">${user.name}</div>
                        <div class="user-status ${user.isThrottled ? 'throttled' : user.blockStatus === 'blocked' ? 'throttled' : 'normal'}">
                            ${user.blockStatus === 'blocked' ? '🔒 Blocked' : user.isThrottled ? '⛔ Throttled' : '✅ Normal'}
                        </div>
                    </div>
                    <div class="user-body">
                        <div class="user-metric">
                            <span class="label">Pattern</span>
                            <span class="value">${behavior.pattern}</span>
                        </div>
                        <div class="user-metric">
                            <span class="label">Frequency</span>
                            <span class="value">${behavior.currentFrequency} req/min</span>
                        </div>
                        <div class="user-metric">
                            <span class="label">Limit</span>
                            <span class="value">${limit} req/min</span>
                        </div>
                        <div class="user-metric">
                            <span class="label">Anomaly Score</span>
                            <span class="value">${user.anomalyScore.toFixed(1)}/100</span>
                        </div>
                        <div class="user-metric">
                            <span class="label">Trust</span>
                            <span class="value">${user.trustScore}%</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const container = document.getElementById('users');
        if (container) {
            container.innerHTML = `
                <h2 class="section-title">User Sessions</h2>
                <div class="filter-controls">
                    <select id="userFilter" class="filter-select">
                        <option value="all">All Users</option>
                        <option value="throttled">Throttled</option>
                        <option value="normal">Normal</option>
                        <option value="suspicious">Suspicious</option>
                    </select>
                    <select id="userSort" class="filter-select">
                        <option value="anomaly">Sort by Anomaly Score</option>
                        <option value="frequency">Sort by Frequency</option>
                        <option value="trust">Sort by Trust</option>
                    </select>
                </div>
                <div class="users-grid">
                    ${gridHtml || '<p class="placeholder">No users found</p>'}
                </div>
            `;
            this.setupEventListeners();
        }
    }

    /**
     * Render events section
     */
    renderEvents(type = 'all', search = '') {
        let filtered = this.filterEvents(type);

        if (search) {
            filtered = filtered.filter(e => 
                e.message.toLowerCase().includes(search.toLowerCase()) ||
                e.type.toLowerCase().includes(search.toLowerCase())
            );
        }

        const eventHtml = filtered.map(event => `
            <div class="event-item ${event.category}">
                <div class="event-header">
                    <span class="event-type">${event.type}</span>
                    <span class="event-time">${event.timestamp.toLocaleTimeString()}</span>
                </div>
                <div class="event-message">${event.message}</div>
            </div>
        `).join('');

        const container = document.getElementById('events');
        if (container) {
            container.innerHTML = `
                <h2 class="section-title">Event Log</h2>
                <div class="event-filters">
                    <input type="text" id="eventSearch" class="search-input" placeholder="Search events...">
                    <select id="eventFilter" class="filter-select">
                        <option value="all">All Events</option>
                        <option value="throttle">Throttling</option>
                        <option value="burst">Burst Detection</option>
                        <option value="attack">Attacks</option>
                        <option value="adaptation">Adaptation</option>
                    </select>
                </div>
                <div class="event-list">
                    ${eventHtml || '<p class="placeholder">No events logged</p>'}
                </div>
            `;
            this.setupEventListeners();
        }
    }

    /**
     * Render behavior patterns
     */
    renderBehaviors() {
        const container = document.getElementById('patterns');
        if (container) {
            const patterns = {};
            this.users.forEach(u => {
                const behavior = this.detectBehavior(u);
                if (!patterns[behavior.pattern]) {
                    patterns[behavior.pattern] = { count: 0, users: [] };
                }
                patterns[behavior.pattern].count++;
                patterns[behavior.pattern].users.push(u.name);
            });

            const analysisHtml = Object.entries(patterns).map(([pattern, data]) => `
                <div class="analysis-card">
                    <h4>🔍 ${pattern.toUpperCase()}</h4>
                    <p><strong>Count:</strong> ${data.count} users</p>
                    <p><strong>Examples:</strong> ${data.users.slice(0, 3).join(', ')}</p>
                </div>
            `).join('');

            container.innerHTML = `
                <h2 class="section-title">Behavior Patterns</h2>
                <div style="height: 300px; margin-bottom: 20px;">
                    <canvas id="patternChart"></canvas>
                </div>
                <div class="pattern-analysis">
                    ${analysisHtml}
                </div>
            `;
            this.renderBehaviorChart();
        }
    }

    /**
     * Render request rate chart
     */
    renderRequestChart() {
        const canvas = document.getElementById('requestChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.clientWidth || 800;
        const height = canvas.clientHeight || 300;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Get hourly request data
        const now = Date.now();
        const hours = [];
        const reqCounts = [];

        for (let i = 23; i >= 0; i--) {
            const hourTime = now - (i * 60 * 60 * 1000);
            const count = this.users.reduce((sum, u) => {
                return sum + u.requests.filter(r => r.timestamp > hourTime - 60*60*1000 && r.timestamp <= hourTime).length;
            }, 0);
            hours.push(i + 'h');
            reqCounts.push(count);
        }

        const maxReq = Math.max(...reqCounts, 1);
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

        // Draw grid and data
        ctx.strokeStyle = '#1e293b';
        ctx.fillStyle = '#06b6d4';
        const barWidth = graphWidth / reqCounts.length;

        reqCounts.forEach((count, i) => {
            const x = padding + i * barWidth;
            const barHeight = (count / maxReq) * graphHeight;
            const y = height - padding - barHeight;

            // Draw bar
            ctx.fillRect(x + 2, y, barWidth - 4, barHeight);

            // Draw grid line
            if (i % 3 === 0) {
                ctx.beginPath();
                ctx.moveTo(x, padding);
                ctx.lineTo(x, height - padding);
                ctx.stroke();
            }
        });

        // Draw labels
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        hours.forEach((hour, i) => {
            if (i % 3 === 0) {
                const x = padding + i * (graphWidth / reqCounts.length) + barWidth / 2;
                ctx.fillText(hour, x, height - padding + 20);
            }
        });
    }

    /**
     * Render behavior distribution chart
     */
    renderBehaviorChart() {
        const canvas = document.getElementById('patternChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.clientWidth || 800;
        const height = canvas.clientHeight || 300;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Count behaviors
        const behaviors = { normal: 0, power_user: 0, burst: 0, suspicious: 0 };
        this.users.forEach(u => {
            const behavior = this.detectBehavior(u);
            behaviors[behavior.pattern]++;
        });

        const total = Object.values(behaviors).reduce((a, b) => a + b, 1);
        const colors = {
            normal: '#10b981',
            power_user: '#3b82f6',
            burst: '#f97316',
            suspicious: '#ef4444'
        };

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;
        let currentAngle = 0;

        Object.entries(behaviors).forEach(([pattern, count]) => {
            const sliceAngle = (count / total) * Math.PI * 2;
            ctx.fillStyle = colors[pattern];
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.lineTo(centerX, centerY);
            ctx.fill();

            // Draw label
            ctx.fillStyle = '#e2e8f0';
            ctx.font = 'bold 14px sans-serif';
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
            ctx.textAlign = 'center';
            ctx.fillText(`${pattern} (${count})`, labelX, labelY);

            currentAngle += sliceAngle;
        });
    }

    /**
     * Start metrics updates
     */
    startMetricsUpdates() {
        if (this.updateInterval) clearInterval(this.updateInterval);

        this.updateInterval = setInterval(() => {
            this.users.forEach(user => this.updateUserThrottling(user));
            
            this.metrics.activeUsers = this.users.filter(u => u.blockStatus === 'active').length;
            this.metrics.throttledCount = this.users.filter(u => u.isThrottled).length;
            this.metrics.fairnessScore = this.calculateFairnessScore();
            
            this.render();
        }, 2000);
    }

    /**
     * Simulate initial load
     */
    simulateInitialLoad() {
        this.users.forEach(user => this.updateUserThrottling(user));
        this.metrics.activeUsers = this.users.length;
        this.metrics.fairnessScore = this.calculateFairnessScore();
        this.render();
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
            background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
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
     * Render all UI sections
     */
    render() {
        this.renderDashboard();
        this.renderUsers();
        this.renderBehaviors();
        this.renderEvents();
    }

    /**
     * Render dashboard
     */
    renderDashboard() {
        document.getElementById('activeUsers').textContent = this.metrics.activeUsers;
        document.getElementById('throttledCount').textContent = this.metrics.throttledCount;
        document.getElementById('fairnessScore').textContent = this.metrics.fairnessScore.toFixed(1);
        document.getElementById('attacksBlocked').textContent = this.metrics.attacksDetected;

        const dashboard = document.getElementById('dashboard');
        if (dashboard) {
            const avgLatency = this.users.length > 0 ? 
                Math.round(this.users.reduce((sum, u) => {
                    const latencies = u.requests.map(r => r.latency);
                    return sum + (latencies.length > 0 ? latencies.reduce((a, b) => a + b) / latencies.length : 0);
                }, 0) / this.users.length) : 0;

            const totalRequests = this.users.reduce((sum, u) => sum + u.requests.length, 0);

            dashboard.innerHTML = `
                <h2 class="section-title">Dashboard</h2>
                <div class="monitoring-grid">
                    <div class="monitor-panel">
                        <h3>System Health</h3>
                        <div class="health-indicators">
                            <div class="health-item">
                                <span class="label">Status</span>
                                <span class="badge">🟢 Active</span>
                            </div>
                            <div class="health-item">
                                <span class="label">Avg Latency</span>
                                <span class="value">${avgLatency}ms</span>
                            </div>
                            <div class="health-item">
                                <span class="label">Requests/sec</span>
                                <span class="value">${(totalRequests / 60).toFixed(1)}</span>
                            </div>
                            <div class="health-item">
                                <span class="label">CPU Usage</span>
                                <span class="value">${(45 + Math.random() * 30).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                    <div class="monitor-panel">
                        <h3>Behavioral Metrics</h3>
                        <div class="behavior-metrics">
                            <div class="metric">
                                <span class="label">Burst Patterns</span>
                                <span class="value">${this.users.filter(u => u.burstDetected).length}</span>
                            </div>
                            <div class="metric">
                                <span class="label">Avg Anomaly Score</span>
                                <span class="value">${(this.users.reduce((sum, u) => sum + u.anomalyScore, 0) / this.users.length).toFixed(1)}</span>
                            </div>
                            <div class="metric">
                                <span class="label">False Positives</span>
                                <span class="value">${Math.floor(this.metrics.fairnessScore > 80 ? 0.5 : 2.3)}</span>
                            </div>
                            <div class="metric">
                                <span class="label">Adaptation Rate</span>
                                <span class="value">${(this.events.filter(e => e.category === 'adaptation').length / Math.max(1, this.events.length) * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="chart-container">
                    <h3>Request Rate (24h)</h3>
                    <canvas id="requestChart" class="chart-canvas"></canvas>
                </div>
                <div class="recent-activity">
                    <h3>Recent Events</h3>
                    <div class="activity-list">
                        ${this.events.slice(0, 5).map(event => `
                            <div class="activity-item ${event.category}">
                                <div class="activity-header">
                                    <span class="activity-title">${event.type}</span>
                                    <span class="activity-time">${event.timestamp.toLocaleTimeString()}</span>
                                </div>
                                <div class="activity-description">${event.message}</div>
                            </div>
                        `).join('') || '<p class="placeholder">No recent events</p>'}
                    </div>
                </div>
            `;

            this.renderRequestChart();
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.controller = new AdaptiveThrottlingController();
});
