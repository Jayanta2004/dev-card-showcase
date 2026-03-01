// distributed-identity-continuity-framework.js

class IdentityContinuityFramework {
    constructor() {
        this.isMonitoring = false;
        this.monitoringInterval = null;
        this.regions = this.initializeRegions();
        this.tokens = [];
        this.users = [];
        this.securityEvents = [];
        this.syncHistory = [];
        this.configuration = this.getDefaultConfiguration();
        this.charts = {};
        this.lastUpdate = new Date();

        this.init();
    }

    init() {
        this.loadConfiguration();
        this.setupEventListeners();
        this.initializeCharts();
        this.generateMockData();
        this.updateUI();
        this.showNotification('Identity Continuity Framework initialized', 'info');
    }

    initializeRegions() {
        return [
            { id: 'us-east-1', name: 'US East 1', status: 'synced', latency: 12, activeTokens: 5432 },
            { id: 'eu-west-1', name: 'EU West 1', status: 'synced', latency: 45, activeTokens: 3211 },
            { id: 'ap-southeast-1', name: 'Asia Pacific', status: 'syncing', latency: 78, activeTokens: 2876 },
            { id: 'us-west-2', name: 'US West 2', status: 'synced', latency: 23, activeTokens: 1987 },
            { id: 'eu-central-1', name: 'EU Central 1', status: 'error', latency: 156, activeTokens: 1456 }
        ];
    }

    loadConfiguration() {
        const saved = localStorage.getItem('identityFrameworkConfig');
        if (saved) {
            this.configuration = { ...this.configuration, ...JSON.parse(saved) };
        }
    }

    saveConfiguration() {
        localStorage.setItem('identityFrameworkConfig', JSON.stringify(this.configuration));
    }

    getDefaultConfiguration() {
        return {
            syncInterval: 300,
            maxLatency: 100,
            tokenExpiration: 24,
            encryptionLevel: 'AES256',
            keyRotation: 30,
            primaryRegion: 'us-east-1',
            failoverEnabled: true
        };
    }

    setupEventListeners() {
        // Configuration modal inputs
        document.getElementById('syncInterval').addEventListener('change', (e) => {
            this.configuration.syncInterval = parseInt(e.target.value);
        });

        document.getElementById('maxLatency').addEventListener('change', (e) => {
            this.configuration.maxLatency = parseInt(e.target.value);
        });

        document.getElementById('tokenExpiration').addEventListener('change', (e) => {
            this.configuration.tokenExpiration = parseInt(e.target.value);
        });

        document.getElementById('encryptionLevel').addEventListener('change', (e) => {
            this.configuration.encryptionLevel = e.target.value;
        });

        document.getElementById('keyRotation').addEventListener('change', (e) => {
            this.configuration.keyRotation = parseInt(e.target.value);
        });

        document.getElementById('primaryRegion').addEventListener('change', (e) => {
            this.configuration.primaryRegion = e.target.value;
        });

        document.getElementById('failoverEnabled').addEventListener('change', (e) => {
            this.configuration.failoverEnabled = e.target.checked;
        });
    }

    initializeCharts() {
        // Connectivity Chart
        const connectivityCtx = document.getElementById('connectivityChart').getContext('2d');
        this.charts.connectivity = new Chart(connectivityCtx, {
            type: 'radar',
            data: {
                labels: this.regions.map(r => r.name),
                datasets: [{
                    label: 'Connectivity Strength',
                    data: [],
                    backgroundColor: 'rgba(25, 118, 210, 0.2)',
                    borderColor: '#1976D2',
                    borderWidth: 2,
                    pointBackgroundColor: '#1976D2'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

        // Sync Timeline Chart
        const syncCtx = document.getElementById('syncTimelineChart').getContext('2d');
        this.charts.syncTimeline = new Chart(syncCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Sync Operations',
                    data: [],
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true
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

        // Token Distribution Chart
        const tokenCtx = document.getElementById('tokenDistributionChart').getContext('2d');
        this.charts.tokenDistribution = new Chart(tokenCtx, {
            type: 'doughnut',
            data: {
                labels: this.regions.map(r => r.name),
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#1976D2',
                        '#4CAF50',
                        '#FF9800',
                        '#9C27B0',
                        '#F44336'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // Transitions Chart
        const transitionsCtx = document.getElementById('transitionsChart').getContext('2d');
        this.charts.transitions = new Chart(transitionsCtx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Seamless Transitions',
                    data: [],
                    backgroundColor: '#4CAF50'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    generateMockData() {
        // Generate mock users
        for (let i = 1; i <= 100; i++) {
            this.users.push({
                id: `user_${i.toString().padStart(3, '0')}`,
                currentRegion: this.regions[Math.floor(Math.random() * this.regions.length)].id,
                sessionStart: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
                lastTransition: new Date(Date.now() - Math.random() * 60 * 60 * 1000),
                continuityScore: Math.floor(Math.random() * 40) + 60,
                status: Math.random() > 0.9 ? 'error' : Math.random() > 0.8 ? 'transitioning' : 'active'
            });
        }

        // Generate mock tokens
        for (let i = 1; i <= 15432; i++) {
            this.tokens.push({
                id: `token_${i.toString().padStart(5, '0')}`,
                userId: this.users[Math.floor(Math.random() * this.users.length)].id,
                region: this.regions[Math.floor(Math.random() * this.regions.length)].id,
                created: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
                expires: new Date(Date.now() + (Math.random() * 24 - 12) * 60 * 60 * 1000),
                status: Math.random() > 0.95 ? 'expired' : Math.random() > 0.98 ? 'revoked' : 'active'
            });
        }

        // Generate mock security events
        const eventTypes = ['token_created', 'token_revoked', 'sync_completed', 'encryption_key_rotated', 'region_failover'];
        for (let i = 1; i <= 20; i++) {
            this.securityEvents.push({
                id: i,
                type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
                timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
                region: this.regions[Math.floor(Math.random() * this.regions.length)].id,
                details: 'Event details here',
                severity: Math.random() > 0.8 ? 'error' : Math.random() > 0.6 ? 'warning' : 'success'
            });
        }

        // Generate sync history
        for (let i = 0; i < 24; i++) {
            this.syncHistory.push({
                timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
                operations: Math.floor(Math.random() * 50) + 10
            });
        }
    }

    startMonitoring() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.showNotification('Real-time monitoring started', 'success');

        this.monitoringInterval = setInterval(() => {
            this.updateMetrics();
            this.updateRegions();
            this.updateSecurityEvents();
            this.updateUI();
        }, 5000); // Update every 5 seconds

        document.querySelector('.settings-panel button').innerHTML = '<i class="fas fa-stop"></i> Stop Monitoring';
        document.querySelector('.settings-panel button').onclick = () => this.stopMonitoring();
    }

    stopMonitoring() {
        if (!this.isMonitoring) return;

        this.isMonitoring = false;
        clearInterval(this.monitoringInterval);
        this.showNotification('Monitoring stopped', 'info');

        document.querySelector('.settings-panel button').innerHTML = '<i class="fas fa-play"></i> Start Monitoring';
        document.querySelector('.settings-panel button').onclick = () => this.startMonitoring();
    }

    updateMetrics() {
        // Update global metrics
        const activeUsers = this.users.filter(u => u.status === 'active').length;
        const totalTokens = this.tokens.filter(t => t.status === 'active').length;
        const expiredTokens = this.tokens.filter(t => t.status === 'expired').length;
        const revokedTokens = this.tokens.filter(t => t.status === 'revoked').length;

        document.getElementById('activeSessions').textContent = activeUsers.toLocaleString();
        document.getElementById('tokenIntegrity').textContent = '99.97%';
        document.getElementById('activeTokens').textContent = totalTokens.toLocaleString();
        document.getElementById('expiredTokens').textContent = expiredTokens.toLocaleString();
        document.getElementById('revokedTokens').textContent = revokedTokens.toLocaleString();

        // Update sync latency
        const avgLatency = this.regions.reduce((sum, r) => sum + r.latency, 0) / this.regions.length;
        document.getElementById('syncLatency').textContent = Math.round(avgLatency) + 'ms';

        // Update token age
        const activeTokensList = this.tokens.filter(t => t.status === 'active');
        if (activeTokensList.length > 0) {
            const avgAge = activeTokensList.reduce((sum, t) => {
                return sum + (Date.now() - t.created.getTime());
            }, 0) / activeTokensList.length;
            const avgAgeHours = Math.round(avgAge / (1000 * 60 * 60));
            document.getElementById('avgTokenAge').textContent = avgAgeHours + 'h';
        }

        // Update continuity metrics
        const seamlessTransitions = this.users.filter(u => u.continuityScore >= 95).length;
        const transitionRate = (seamlessTransitions / this.users.length) * 100;
        document.getElementById('seamlessTransitions').textContent = transitionRate.toFixed(1) + '%';

        const avgTransitionTime = 1.2 + (Math.random() - 0.5) * 0.4;
        document.getElementById('avgTransitionTime').textContent = avgTransitionTime.toFixed(1) + 's';

        this.lastUpdate = new Date();
    }

    updateRegions() {
        // Simulate region status changes
        this.regions.forEach(region => {
            // Randomly change latency
            region.latency = Math.max(10, region.latency + (Math.random() - 0.5) * 20);

            // Update active tokens count
            region.activeTokens = Math.floor(region.activeTokens * (0.95 + Math.random() * 0.1));

            // Occasionally change status
            if (Math.random() < 0.05) {
                const statuses = ['synced', 'syncing', 'error'];
                region.status = statuses[Math.floor(Math.random() * statuses.length)];
            }
        });

        this.updateRegionGrid();
        this.updateConnectivityChart();
        this.updateTokenDistributionChart();
    }

    updateRegionGrid() {
        const grid = document.getElementById('regionGrid');
        grid.innerHTML = this.regions.map(region => `
            <div class="region-card ${region.status}">
                <h4>${region.name}</h4>
                <div class="region-status">
                    <span class="status-dot ${region.status}"></span>
                    ${region.status.charAt(0).toUpperCase() + region.status.slice(1)}
                </div>
                <div class="region-metric">Latency: ${Math.round(region.latency)}ms</div>
                <div class="region-metric">Active Tokens: ${region.activeTokens.toLocaleString()}</div>
            </div>
        `).join('');
    }

    updateConnectivityChart() {
        const connectivityData = this.regions.map(region => {
            // Calculate connectivity strength based on latency and status
            let strength = 100;
            if (region.status === 'error') strength = 20;
            else if (region.status === 'syncing') strength = 60;
            else strength = Math.max(40, 100 - region.latency / 2);

            return strength;
        });

        this.charts.connectivity.data.datasets[0].data = connectivityData;
        this.charts.connectivity.update();
    }

    updateTokenDistributionChart() {
        this.charts.tokenDistribution.data.datasets[0].data = this.regions.map(r => r.activeTokens);
        this.charts.tokenDistribution.update();
    }

    updateSecurityEvents() {
        // Add new random events occasionally
        if (Math.random() < 0.3) {
            const eventTypes = ['token_created', 'token_revoked', 'sync_completed', 'encryption_key_rotated'];
            const newEvent = {
                id: this.securityEvents.length + 1,
                type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
                timestamp: new Date(),
                region: this.regions[Math.floor(Math.random() * this.regions.length)].id,
                details: 'Automated security event',
                severity: Math.random() > 0.8 ? 'error' : Math.random() > 0.6 ? 'warning' : 'success'
            };
            this.securityEvents.unshift(newEvent);
            this.securityEvents = this.securityEvents.slice(0, 50); // Keep last 50
        }

        this.updateSecurityEventsList();
        this.updateEncryptionStatus();
    }

    updateSecurityEventsList() {
        const container = document.getElementById('securityEvents');
        container.innerHTML = this.securityEvents.slice(0, 10).map(event => `
            <div class="event-item">
                <div class="event-icon ${event.severity}">
                    <i class="fas fa-${this.getEventIcon(event.type)}"></i>
                </div>
                <div class="event-content">
                    <div class="event-title">${this.formatEventType(event.type)}</div>
                    <div class="event-details">${event.region} • ${this.getTimeAgo(event.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    getEventIcon(type) {
        switch (type) {
            case 'token_created': return 'plus-circle';
            case 'token_revoked': return 'minus-circle';
            case 'sync_completed': return 'check-circle';
            case 'encryption_key_rotated': return 'key';
            case 'region_failover': return 'exchange-alt';
            default: return 'info-circle';
        }
    }

    formatEventType(type) {
        return type.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    updateEncryptionStatus() {
        const grid = document.getElementById('encryptionGrid');
        grid.innerHTML = this.regions.map(region => `
            <div class="encryption-channel ${this.getEncryptionStatus(region)}">
                <h4>${region.name}</h4>
                <div class="encryption-status-text">${this.configuration.encryptionLevel}</div>
            </div>
        `).join('');
    }

    getEncryptionStatus(region) {
        if (region.status === 'error') return 'insecure';
        if (region.latency > this.configuration.maxLatency) return 'warning';
        return 'secure';
    }

    updateSyncTimeline() {
        // Add new sync data point
        this.syncHistory.push({
            timestamp: new Date(),
            operations: Math.floor(Math.random() * 50) + 10
        });
        this.syncHistory = this.syncHistory.slice(-24); // Keep last 24 hours

        const labels = this.syncHistory.map(h => h.timestamp.toLocaleTimeString());
        const data = this.syncHistory.map(h => h.operations);

        this.charts.syncTimeline.data.labels = labels;
        this.charts.syncTimeline.data.datasets[0].data = data;
        this.charts.syncTimeline.update();
    }

    updateUserContinuity() {
        // Update user sessions table
        const table = document.getElementById('userSessionsTable');
        const filteredUsers = this.users.slice(0, 20); // Show first 20 users

        table.innerHTML = filteredUsers.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${this.regions.find(r => r.id === user.currentRegion)?.name || user.currentRegion}</td>
                <td>${user.sessionStart.toLocaleString()}</td>
                <td>${user.lastTransition.toLocaleString()}</td>
                <td>${user.continuityScore}%</td>
                <td><span class="session-status ${user.status}">${user.status}</span></td>
            </tr>
        `).join('');

        // Update transitions chart
        const weeklyData = [87, 92, 89, 94, 91, 88, 93];
        this.charts.transitions.data.datasets[0].data = weeklyData;
        this.charts.transitions.update();
    }

    triggerManualSync() {
        this.showNotification('Manual synchronization initiated', 'info');

        // Simulate sync process
        setTimeout(() => {
            this.regions.forEach(region => {
                if (region.status !== 'error') {
                    region.status = 'syncing';
                }
            });
            this.updateRegionGrid();

            setTimeout(() => {
                this.regions.forEach(region => {
                    if (region.status === 'syncing') {
                        region.status = 'synced';
                    }
                });
                this.updateRegionGrid();
                this.showNotification('Synchronization completed successfully', 'success');
            }, 3000);
        }, 1000);
    }

    toggleAutoSync() {
        // This would toggle automatic synchronization
        const btn = document.getElementById('autoSyncBtn');
        const isOn = btn.innerHTML.includes('ON');

        if (isOn) {
            btn.innerHTML = '<i class="fas fa-toggle-off"></i> Auto Sync: OFF';
            this.showNotification('Automatic synchronization disabled', 'warning');
        } else {
            btn.innerHTML = '<i class="fas fa-toggle-on"></i> Auto Sync: ON';
            this.showNotification('Automatic synchronization enabled', 'success');
        }
    }

    generateNewToken() {
        const newToken = {
            id: `token_${(this.tokens.length + 1).toString().padStart(5, '0')}`,
            userId: this.users[Math.floor(Math.random() * this.users.length)].id,
            region: this.regions[Math.floor(Math.random() * this.regions.length)].id,
            created: new Date(),
            expires: new Date(Date.now() + this.configuration.tokenExpiration * 60 * 60 * 1000),
            status: 'active'
        };

        this.tokens.push(newToken);
        this.showNotification(`New token generated: ${newToken.id}`, 'success');
        this.updateMetrics();
    }

    revokeExpiredTokens() {
        const expiredTokens = this.tokens.filter(t =>
            t.status === 'active' && t.expires < new Date()
        );

        expiredTokens.forEach(token => {
            token.status = 'expired';
        });

        if (expiredTokens.length > 0) {
            this.showNotification(`${expiredTokens.length} expired tokens cleaned up`, 'info');
            this.updateMetrics();
        } else {
            this.showNotification('No expired tokens to clean up', 'info');
        }
    }

    searchUsers() {
        const query = document.getElementById('userSearch').value.toLowerCase();
        // This would filter the users table - simplified for demo
        this.showNotification(`Searching for users: ${query}`, 'info');
    }

    filterContinuity() {
        const filter = document.getElementById('continuityFilter').value;
        // This would filter the continuity view - simplified for demo
        this.showNotification(`Applied filter: ${filter}`, 'info');
    }

    openConfiguration() {
        document.getElementById('configurationModal').style.display = 'flex';
        this.loadConfigurationIntoModal();
    }

    loadConfigurationIntoModal() {
        Object.keys(this.configuration).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.configuration[key];
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
                if (element.type === 'checkbox') {
                    this.configuration[key] = element.checked;
                } else if (element.type === 'number') {
                    this.configuration[key] = parseInt(element.value);
                } else {
                    this.configuration[key] = element.value;
                }
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
            regions: this.regions,
            tokens: this.tokens,
            users: this.users,
            securityEvents: this.securityEvents,
            syncHistory: this.syncHistory
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `identity-continuity-framework-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Data exported successfully', 'success');
    }

    updateUI() {
        this.updateGlobalSyncStatus();
        this.updateSyncTimeline();
        this.updateUserContinuity();
    }

    updateGlobalSyncStatus() {
        const syncedRegions = this.regions.filter(r => r.status === 'synced').length;
        const totalRegions = this.regions.length;
        const syncPercentage = (syncedRegions / totalRegions) * 100;

        let status = 'Synchronized';
        let statusClass = 'healthy';

        if (syncPercentage < 80) {
            status = 'Partial Sync';
            statusClass = 'warning';
        } else if (syncPercentage < 50) {
            status = 'Sync Issues';
            statusClass = 'error';
        }

        document.getElementById('globalSyncStatus').textContent = status;
        document.getElementById('globalSyncStatus').parentElement.querySelector('.status-indicator').className = `status-indicator ${statusClass}`;
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
let framework;

function openConfiguration() {
    if (framework) framework.openConfiguration();
}

function saveConfiguration() {
    if (framework) framework.saveConfigurationFromModal();
}

function resetToDefaults() {
    if (framework) framework.resetToDefaults();
}

function closeConfiguration() {
    if (framework) framework.closeConfiguration();
}

function updateViewMode() {
    // This would update the connectivity chart view mode
    if (framework) framework.showNotification('View mode updated', 'info');
}

function updateSecurityView() {
    // This would update the security events timeframe
    if (framework) framework.showNotification('Security view updated', 'info');
}

function triggerManualSync() {
    if (framework) framework.triggerManualSync();
}

function toggleAutoSync() {
    if (framework) framework.toggleAutoSync();
}

function generateNewToken() {
    if (framework) framework.generateNewToken();
}

function revokeExpiredTokens() {
    if (framework) framework.revokeExpiredTokens();
}

function searchUsers() {
    if (framework) framework.searchUsers();
}

function filterContinuity() {
    if (framework) framework.filterContinuity();
}

function exportData() {
    if (framework) framework.exportData();
}

function toggleRealTime() {
    if (framework) {
        if (framework.isMonitoring) {
            framework.stopMonitoring();
        } else {
            framework.startMonitoring();
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    framework = new IdentityContinuityFramework();
});