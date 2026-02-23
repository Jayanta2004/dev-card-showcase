// Secure Federated Identity Connector - JavaScript Implementation
// Author: AI Assistant
// Date: 2026
// Description: Comprehensive federated identity management system

// Global variables and state management
let identityProviders = [];
let federationTrusts = [];
let securityPolicies = [];
let authenticationLogs = [];
let threatAlerts = [];
let tokenStore = new Map();
let sessionStore = new Map();
let settings = {};
let charts = {};
let currentUser = null;
let isOnline = true;

// Default settings
const defaultSettings = {
    autoRotateTokens: true,
    mfaEnabled: true,
    sessionTimeout: 30,
    threatDetection: true,
    ipWhitelist: false,
    maxFailedAttempts: 5,
    defaultTrustLevel: 'medium',
    federationTimeout: 30,
    autoApproveProviders: false,
    loggingEnabled: true,
    encryptionEnabled: true
};

// Identity Provider Classes
class IdentityProvider {
    constructor(config) {
        this.id = this.generateId();
        this.name = config.name;
        this.type = config.type;
        this.clientId = config.clientId;
        this.clientSecret = this.encryptSecret(config.clientSecret);
        this.authorizationUrl = config.authorizationUrl;
        this.tokenUrl = config.tokenUrl;
        this.userInfoUrl = config.userInfoUrl;
        this.enabled = config.enabled || false;
        this.createdAt = new Date();
        this.lastUsed = null;
        this.successCount = 0;
        this.failureCount = 0;
        this.metadata = {};
    }

    generateId() {
        return 'idp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    encryptSecret(secret) {
        // Simple encryption for demo - in production use proper encryption
        return CryptoJS.AES.encrypt(secret, 'federation-key').toString();
    }

    decryptSecret() {
        try {
            const bytes = CryptoJS.AES.decrypt(this.clientSecret, 'federation-key');
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (e) {
            return null;
        }
    }

    async authenticate(code, redirectUri) {
        try {
            const tokenResponse = await this.exchangeCodeForToken(code, redirectUri);
            const userInfo = await this.getUserInfo(tokenResponse.access_token);

            this.successCount++;
            this.lastUsed = new Date();

            logActivity(`Successful authentication via ${this.name}`, 'success');
            return { token: tokenResponse, user: userInfo };
        } catch (error) {
            this.failureCount++;
            logActivity(`Failed authentication via ${this.name}: ${error.message}`, 'error');
            throw error;
        }
    }

    async exchangeCodeForToken(code, redirectUri) {
        const response = await fetch(this.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.decryptSecret())
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri
            })
        });

        if (!response.ok) {
            throw new Error(`Token exchange failed: ${response.statusText}`);
        }

        return await response.json();
    }

    async getUserInfo(accessToken) {
        const response = await fetch(this.userInfoUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`User info fetch failed: ${response.statusText}`);
        }

        return await response.json();
    }

    getStatus() {
        return this.enabled ? 'enabled' : 'disabled';
    }

    getSuccessRate() {
        const total = this.successCount + this.failureCount;
        return total > 0 ? (this.successCount / total * 100).toFixed(1) : 0;
    }
}

class FederationTrust {
    constructor(config) {
        this.id = this.generateId();
        this.name = config.name;
        this.protocol = config.protocol;
        this.trustLevel = config.trustLevel;
        this.providerIds = config.providerIds || [];
        this.policies = config.policies || [];
        this.createdAt = new Date();
        this.expiresAt = config.expiresAt;
        this.active = true;
        this.metadata = {};
    }

    generateId() {
        return 'fed_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    isExpired() {
        return this.expiresAt && new Date() > new Date(this.expiresAt);
    }

    getTrustColor() {
        switch (this.trustLevel) {
            case 'high': return 'success';
            case 'medium': return 'warning';
            case 'low': return 'danger';
            default: return 'info';
        }
    }
}

class SecurityPolicy {
    constructor(config) {
        this.id = this.generateId();
        this.name = config.name;
        this.description = config.description;
        this.enabled = config.enabled || false;
        this.rules = config.rules || [];
        this.createdAt = new Date();
        this.lastTriggered = null;
        this.violationCount = 0;
    }

    generateId() {
        return 'pol_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    checkViolation(context) {
        // Implement policy checking logic
        for (const rule of this.rules) {
            if (this.evaluateRule(rule, context)) {
                this.violationCount++;
                this.lastTriggered = new Date();
                return true;
            }
        }
        return false;
    }

    evaluateRule(rule, context) {
        // Simple rule evaluation - in production use proper rule engine
        switch (rule.type) {
            case 'ip_check':
                return !settings.ipWhitelist || rule.allowedIPs.includes(context.ip);
            case 'time_check':
                const now = new Date().getHours();
                return now >= rule.startHour && now <= rule.endHour;
            case 'attempts_check':
                return context.failedAttempts >= rule.maxAttempts;
            default:
                return false;
        }
    }
}

// Utility functions
function generateToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

function hashString(str) {
    return CryptoJS.SHA256(str).toString();
}

function logActivity(message, type = 'info', details = {}) {
    const logEntry = {
        id: 'log_' + Date.now(),
        timestamp: new Date(),
        message,
        type,
        details,
        userId: currentUser?.id || 'system'
    };

    authenticationLogs.unshift(logEntry);
    if (authenticationLogs.length > 1000) {
        authenticationLogs = authenticationLogs.slice(0, 1000);
    }

    updateActivityLog();
    updateCharts();

    // Check for security threats
    if (type === 'error' || type === 'warning') {
        checkForThreats(logEntry);
    }
}

function checkForThreats(logEntry) {
    // Simple threat detection logic
    const recentLogs = authenticationLogs.slice(0, 10);
    const failedAttempts = recentLogs.filter(log => log.type === 'error').length;

    if (failedAttempts >= 3) {
        const threat = {
            id: 'threat_' + Date.now(),
            level: failedAttempts >= 5 ? 'high' : 'medium',
            message: `Multiple failed authentication attempts detected (${failedAttempts} in last 10 minutes)`,
            timestamp: new Date(),
            source: 'threat_detection'
        };

        threatAlerts.unshift(threat);
        if (threatAlerts.length > 50) {
            threatAlerts = threatAlerts.slice(0, 50);
        }

        updateThreatAlerts();
        logActivity('Security threat detected: ' + threat.message, 'warning');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSettings();
    initializeProviders();
    initializeFederation();
    initializeSecurity();
    initializeCharts();
    updateDashboard();
    updateActivityLog();
});

// Setup all event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            switchSection(targetId);
        });
    });

    // Provider management
    document.getElementById('addProviderBtn').addEventListener('click', showProviderModal);
    document.getElementById('saveProviderBtn').addEventListener('click', saveProvider);
    document.getElementById('cancelProviderBtn').addEventListener('click', hideProviderModal);
    document.getElementById('providerSearch').addEventListener('input', filterProviders);

    // Federation
    document.getElementById('createFederationBtn').addEventListener('click', createFederation);

    // Security
    document.getElementById('rotateTokensBtn').addEventListener('click', rotateTokens);
    document.getElementById('revokeTokensBtn').addEventListener('click', revokeCompromisedTokens);

    // Analytics
    document.getElementById('refreshAnalyticsBtn').addEventListener('click', refreshAnalytics);

    // Settings
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('resetSettingsBtn').addEventListener('click', resetSettings);
    document.getElementById('exportSettingsBtn').addEventListener('click', exportSettings);

    // Modal
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', hideModals);
    });
    document.getElementById('alertOkBtn').addEventListener('click', hideModals);

    // Policy toggles
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('policy-toggle')) {
            togglePolicy(e.target);
        }
    });

    // Window events
    window.addEventListener('beforeunload', saveState);
    window.addEventListener('online', () => updateConnectionStatus(true));
    window.addEventListener('offline', () => updateConnectionStatus(false));
}

// Initialize application components
function initializeApp() {
    console.log('Initializing Secure Federated Identity Connector...');
    updateConnectionStatus(navigator.onLine);

    // Load saved state
    loadState();

    // Initialize with sample data if empty
    if (identityProviders.length === 0) {
        createSampleData();
    }
}

function createSampleData() {
    // Sample identity providers
    const googleProvider = new IdentityProvider({
        name: 'Google OAuth',
        type: 'oauth',
        clientId: 'google-client-id',
        clientSecret: 'google-client-secret',
        authorizationUrl: 'https://accounts.google.com/oauth/authorize',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
        enabled: true
    });

    const githubProvider = new IdentityProvider({
        name: 'GitHub OAuth',
        type: 'oauth',
        clientId: 'github-client-id',
        clientSecret: 'github-client-secret',
        authorizationUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userInfoUrl: 'https://api.github.com/user',
        enabled: true
    });

    identityProviders.push(googleProvider, githubProvider);

    // Sample federation trust
    const enterpriseFederation = new FederationTrust({
        name: 'Enterprise SSO Federation',
        protocol: 'saml',
        trustLevel: 'high',
        providerIds: [googleProvider.id, githubProvider.id],
        policies: ['mfa_required', 'ip_restriction'],
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    });

    federationTrusts.push(enterpriseFederation);

    // Sample security policies
    const mfaPolicy = new SecurityPolicy({
        name: 'Multi-Factor Authentication',
        description: 'Require MFA for all authentication attempts',
        enabled: true,
        rules: [{ type: 'mfa_required', condition: 'always' }]
    });

    const ipPolicy = new SecurityPolicy({
        name: 'IP Whitelisting',
        description: 'Restrict access to whitelisted IP addresses',
        enabled: false,
        rules: [{ type: 'ip_check', allowedIPs: ['192.168.1.0/24'] }]
    });

    securityPolicies.push(mfaPolicy, ipPolicy);

    // Sample activity logs
    for (let i = 0; i < 10; i++) {
        logActivity(`User authentication ${i + 1}`, i % 3 === 0 ? 'error' : 'success');
    }
}

// Switch between sections
function switchSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    document.getElementById(sectionId).classList.add('active');
    document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
}

// Dashboard functions
function updateDashboard() {
    // Update metrics
    const totalUsers = 2847;
    const federatedLogins = 15632;
    const securityScore = 98.7;
    const failedAttempts = 23;

    document.getElementById('activeUsersValue').textContent = totalUsers.toLocaleString();
    document.getElementById('federatedLoginsValue').textContent = federatedLogins.toLocaleString();
    document.getElementById('securityScoreValue').textContent = `${securityScore}%`;
    document.getElementById('failedAttemptsValue').textContent = failedAttempts;

    // Update change indicators (simulated)
    updateMetricChanges();

    // Update charts
    updateCharts();
}

function updateMetricChanges() {
    const changes = ['activeUsersChange', 'federatedLoginsChange', 'securityScoreChange', 'failedAttemptsChange'];
    changes.forEach(changeId => {
        const element = document.getElementById(changeId);
        const change = (Math.random() - 0.5) * 20;
        const isPositive = change >= 0;
        element.textContent = `${isPositive ? '+' : ''}${change.toFixed(1)}%`;
        element.className = `metric-change ${isPositive ? 'positive' : 'negative'}`;
    });
}

// Provider management
function showProviderModal(provider = null) {
    const modal = document.getElementById('providerModal');
    const form = document.getElementById('providerForm');

    if (provider) {
        document.getElementById('providerModalTitle').textContent = 'Edit Identity Provider';
        document.getElementById('providerName').value = provider.name;
        document.getElementById('providerType').value = provider.type;
        document.getElementById('clientId').value = provider.clientId;
        document.getElementById('clientSecret').value = provider.decryptSecret() || '';
        document.getElementById('authorizationUrl').value = provider.authorizationUrl;
        document.getElementById('tokenUrl').value = provider.tokenUrl;
        document.getElementById('userInfoUrl').value = provider.userInfoUrl;
        document.getElementById('enabledProvider').checked = provider.enabled;
        form.dataset.providerId = provider.id;
    } else {
        document.getElementById('providerModalTitle').textContent = 'Add Identity Provider';
        form.reset();
        delete form.dataset.providerId;
    }

    modal.style.display = 'block';
}

function hideProviderModal() {
    document.getElementById('providerModal').style.display = 'none';
}

function saveProvider() {
    const form = document.getElementById('providerForm');
    const formData = new FormData(form);

    const providerData = {
        name: formData.get('providerName'),
        type: formData.get('providerType'),
        clientId: formData.get('clientId'),
        clientSecret: formData.get('clientSecret'),
        authorizationUrl: formData.get('authorizationUrl'),
        tokenUrl: formData.get('tokenUrl'),
        userInfoUrl: formData.get('userInfoUrl'),
        enabled: form.elements['enabledProvider'].checked
    };

    if (form.dataset.providerId) {
        // Update existing provider
        const provider = identityProviders.find(p => p.id === form.dataset.providerId);
        if (provider) {
            Object.assign(provider, providerData);
            logActivity(`Updated identity provider: ${provider.name}`, 'info');
        }
    } else {
        // Create new provider
        const provider = new IdentityProvider(providerData);
        identityProviders.push(provider);
        logActivity(`Added new identity provider: ${provider.name}`, 'info');
    }

    updateProvidersDisplay();
    hideProviderModal();
    showAlert('Identity provider saved successfully!');
}

function updateProvidersDisplay() {
    const grid = document.getElementById('providersGrid');
    grid.innerHTML = '';

    identityProviders.forEach(provider => {
        const card = document.createElement('div');
        card.className = `provider-card ${provider.enabled ? 'enabled' : 'disabled'}`;

        card.innerHTML = `
            <div class="provider-header">
                <div>
                    <h3 class="provider-name">${provider.name}</h3>
                    <span class="provider-type">${provider.type.toUpperCase()}</span>
                </div>
                <div class="provider-status status-${provider.getStatus()}">
                    <i class="fas fa-circle"></i>
                    ${provider.getStatus()}
                </div>
            </div>

            <div class="provider-details">
                <div class="provider-detail">
                    <span class="provider-detail-label">Client ID:</span>
                    <span class="provider-detail-value">${provider.clientId}</span>
                </div>
                <div class="provider-detail">
                    <span class="provider-detail-label">Success Rate:</span>
                    <span class="provider-detail-value">${provider.getSuccessRate()}%</span>
                </div>
                <div class="provider-detail">
                    <span class="provider-detail-label">Last Used:</span>
                    <span class="provider-detail-value">${provider.lastUsed ? provider.lastUsed.toLocaleDateString() : 'Never'}</span>
                </div>
            </div>

            <div class="provider-actions">
                <button class="btn btn-secondary" onclick="editProvider('${provider.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn ${provider.enabled ? 'btn-warning' : 'btn-success'}" onclick="toggleProvider('${provider.id}')">
                    <i class="fas ${provider.enabled ? 'fa-pause' : 'fa-play'}"></i>
                    ${provider.enabled ? 'Disable' : 'Enable'}
                </button>
                <button class="btn btn-danger" onclick="deleteProvider('${provider.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;

        grid.appendChild(card);
    });
}

function editProvider(providerId) {
    const provider = identityProviders.find(p => p.id === providerId);
    if (provider) {
        showProviderModal(provider);
    }
}

function toggleProvider(providerId) {
    const provider = identityProviders.find(p => p.id === providerId);
    if (provider) {
        provider.enabled = !provider.enabled;
        updateProvidersDisplay();
        logActivity(`${provider.enabled ? 'Enabled' : 'Disabled'} provider: ${provider.name}`, 'info');
    }
}

function deleteProvider(providerId) {
    const index = identityProviders.findIndex(p => p.id === providerId);
    if (index !== -1) {
        const provider = identityProviders[index];
        identityProviders.splice(index, 1);
        updateProvidersDisplay();
        logActivity(`Deleted provider: ${provider.name}`, 'warning');
    }
}

function filterProviders() {
    const searchTerm = document.getElementById('providerSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.provider-card');

    cards.forEach(card => {
        const name = card.querySelector('.provider-name').textContent.toLowerCase();
        const type = card.querySelector('.provider-type').textContent.toLowerCase();

        if (name.includes(searchTerm) || type.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Federation management
function createFederation() {
    const protocol = document.getElementById('federationProtocol').value;
    const trustLevel = document.getElementById('trustLevel').value;
    const name = `Federation Trust - ${protocol.toUpperCase()} (${trustLevel})`;

    const federation = new FederationTrust({
        name,
        protocol,
        trustLevel,
        providerIds: identityProviders.filter(p => p.enabled).map(p => p.id),
        policies: [],
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    });

    federationTrusts.push(federation);
    updateFederationDisplay();
    logActivity(`Created new federation trust: ${federation.name}`, 'info');
    showAlert('Federation trust created successfully!');
}

function updateFederationDisplay() {
    const table = document.getElementById('federationTable');
    table.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.className = 'federation-header';
    header.innerHTML = `
        <div>Name</div>
        <div>Protocol</div>
        <div>Trust Level</div>
        <div>Status</div>
        <div>Actions</div>
    `;
    table.appendChild(header);

    // Rows
    federationTrusts.forEach(federation => {
        const row = document.createElement('div');
        row.className = 'federation-row';

        row.innerHTML = `
            <div class="federation-name">${federation.name}</div>
            <div class="federation-protocol">${federation.protocol.toUpperCase()}</div>
            <div class="federation-trust trust-${federation.trustLevel}">${federation.trustLevel}</div>
            <div class="federation-status">
                <span class="status-${federation.active && !federation.isExpired() ? 'enabled' : 'disabled'}">
                    ${federation.active && !federation.isExpired() ? 'Active' : 'Inactive'}
                </span>
            </div>
            <div class="federation-actions">
                <button class="btn btn-secondary" onclick="editFederation('${federation.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteFederation('${federation.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        table.appendChild(row);
    });
}

function editFederation(federationId) {
    // Implementation for editing federation
    showAlert('Federation editing not implemented in demo');
}

function deleteFederation(federationId) {
    const index = federationTrusts.findIndex(f => f.id === federationId);
    if (index !== -1) {
        const federation = federationTrusts[index];
        federationTrusts.splice(index, 1);
        updateFederationDisplay();
        logActivity(`Deleted federation: ${federation.name}`, 'warning');
    }
}

// Security functions
function rotateTokens() {
    // Rotate all active tokens
    const activeTokens = Array.from(tokenStore.values()).filter(token => !token.expired);
    activeTokens.forEach(token => {
        token.expired = true;
        tokenStore.set(token.id, token);
    });

    // Generate new tokens for active sessions
    sessionStore.forEach((session, sessionId) => {
        const newToken = generateToken();
        tokenStore.set(newToken, {
            id: newToken,
            sessionId,
            createdAt: new Date(),
            expired: false,
            expiresAt: new Date(Date.now() + settings.sessionTimeout * 60 * 1000)
        });
        session.token = newToken;
    });

    updateTokenStats();
    logActivity('Rotated all active tokens', 'warning');
    showAlert('All tokens have been rotated successfully!');
}

function revokeCompromisedTokens() {
    // Revoke tokens that have been flagged as compromised
    let revokedCount = 0;
    tokenStore.forEach((token, tokenId) => {
        if (token.compromised) {
            token.expired = true;
            revokedCount++;
        }
    });

    updateTokenStats();
    logActivity(`Revoked ${revokedCount} compromised tokens`, 'warning');
    showAlert(`Revoked ${revokedCount} compromised tokens!`);
}

function updateTokenStats() {
    const activeTokens = Array.from(tokenStore.values()).filter(token => !token.expired).length;
    const expiredTokens = Array.from(tokenStore.values()).filter(token => token.expired).length;
    const totalTokens = tokenStore.size;

    const statsContainer = document.getElementById('tokenStats');
    statsContainer.innerHTML = `
        <div class="token-stat">
            <div class="token-stat-value">${activeTokens}</div>
            <div class="token-stat-label">Active Tokens</div>
        </div>
        <div class="token-stat">
            <div class="token-stat-value">${expiredTokens}</div>
            <div class="token-stat-label">Expired Tokens</div>
        </div>
        <div class="token-stat">
            <div class="token-stat-value">${totalTokens}</div>
            <div class="token-stat-label">Total Tokens</div>
        </div>
    `;
}

function updateSecurityPolicies() {
    const policiesContainer = document.getElementById('policyList');
    policiesContainer.innerHTML = '';

    securityPolicies.forEach(policy => {
        const policyItem = document.createElement('div');
        policyItem.className = `policy-item ${policy.enabled ? 'enabled' : 'disabled'}`;

        policyItem.innerHTML = `
            <div class="policy-name">${policy.name}</div>
            <div class="policy-description">${policy.description}</div>
            <div class="policy-toggle ${policy.enabled ? 'active' : ''}" data-policy-id="${policy.id}">
                <div class="toggle-slider"></div>
            </div>
        `;

        policiesContainer.appendChild(policyItem);
    });
}

function togglePolicy(toggleElement) {
    const policyId = toggleElement.dataset.policyId;
    const policy = securityPolicies.find(p => p.id === policyId);

    if (policy) {
        policy.enabled = !policy.enabled;
        toggleElement.classList.toggle('active');
        logActivity(`${policy.enabled ? 'Enabled' : 'Disabled'} security policy: ${policy.name}`, 'info');
    }
}

function updateThreatAlerts() {
    const alertsContainer = document.getElementById('threatAlerts');
    alertsContainer.innerHTML = '';

    threatAlerts.slice(0, 5).forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = `threat-alert ${alert.level}`;

        alertElement.innerHTML = `
            <div class="threat-message">${alert.message}</div>
            <div class="threat-time">${alert.timestamp.toLocaleString()}</div>
        `;

        alertsContainer.appendChild(alertElement);
    });
}

// Analytics functions
function refreshAnalytics() {
    updateCharts();
    logActivity('Analytics refreshed', 'info');
    showAlert('Analytics refreshed successfully!');
}

// Charts initialization and updates
function initializeCharts() {
    // Authentication Trends Chart
    const authCtx = document.getElementById('authTrendsChart').getContext('2d');
    charts.authTrends = new Chart(authCtx, {
        type: 'line',
        data: {
            labels: generateTimeLabels(24),
            datasets: [{
                label: 'Successful Authentications',
                data: generateRandomData(24, 50, 200),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true
            }, {
                label: 'Failed Authentications',
                data: generateRandomData(24, 0, 20),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Provider Distribution Chart
    const providerCtx = document.getElementById('providerChart').getContext('2d');
    charts.provider = new Chart(providerCtx, {
        type: 'doughnut',
        data: {
            labels: identityProviders.map(p => p.name),
            datasets: [{
                data: identityProviders.map(p => p.successCount),
                backgroundColor: [
                    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Success Rate Chart
    const successCtx = document.getElementById('successRateChart').getContext('2d');
    charts.successRate = new Chart(successCtx, {
        type: 'line',
        data: {
            labels: generateTimeLabels(30),
            datasets: [{
                label: 'Success Rate (%)',
                data: generateRandomData(30, 85, 100),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 80,
                    max: 100
                }
            }
        }
    });

    // Login Methods Chart
    const loginCtx = document.getElementById('loginMethodsChart').getContext('2d');
    charts.loginMethods = new Chart(loginCtx, {
        type: 'bar',
        data: {
            labels: ['OAuth 2.0', 'SAML', 'OpenID Connect', 'LDAP', 'Social Login'],
            datasets: [{
                label: 'Login Count',
                data: [1200, 800, 600, 300, 150],
                backgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Geographic Distribution Chart
    const geoCtx = document.getElementById('geoChart').getContext('2d');
    charts.geo = new Chart(geoCtx, {
        type: 'bar',
        data: {
            labels: ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania'],
            datasets: [{
                label: 'Users',
                data: [800, 600, 400, 200, 100, 50],
                backgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function updateCharts() {
    if (charts.provider) {
        charts.provider.data.labels = identityProviders.map(p => p.name);
        charts.provider.data.datasets[0].data = identityProviders.map(p => p.successCount || 1);
        charts.provider.update();
    }

    // Update other charts with new data
    if (charts.authTrends) {
        charts.authTrends.data.datasets[0].data = generateRandomData(24, 50, 200);
        charts.authTrends.data.datasets[1].data = generateRandomData(24, 0, 20);
        charts.authTrends.update();
    }

    if (charts.successRate) {
        charts.successRate.data.datasets[0].data = generateRandomData(30, 85, 100);
        charts.successRate.update();
    }
}

function generateTimeLabels(hours) {
    const labels = [];
    for (let i = hours - 1; i >= 0; i--) {
        const date = new Date();
        date.setHours(date.getHours() - i);
        labels.push(date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
    }
    return labels;
}

function generateRandomData(count, min = 0, max = 100) {
    return Array.from({length: count}, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

// Activity log
function updateActivityLog() {
    const logContainer = document.getElementById('activityList');
    logContainer.innerHTML = '';

    authenticationLogs.slice(0, 10).forEach(log => {
        const item = document.createElement('div');
        item.className = `activity-item ${log.type}`;

        item.innerHTML = `
            <i class="fas ${getActivityIcon(log.type)}"></i>
            <div class="activity-content">
                <div class="activity-message">${log.message}</div>
                <div class="activity-time">${log.timestamp.toLocaleString()}</div>
            </div>
        `;

        logContainer.appendChild(item);
    });
}

function getActivityIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Settings management
function saveSettings() {
    settings = {
        autoRotateTokens: document.getElementById('autoRotateToggle').checked,
        mfaEnabled: document.getElementById('mfaToggle').checked,
        sessionTimeout: parseInt(document.getElementById('sessionTimeoutInput').value),
        threatDetection: document.getElementById('threatDetectionToggle').checked,
        ipWhitelist: document.getElementById('ipWhitelistToggle').checked,
        maxFailedAttempts: parseInt(document.getElementById('maxFailedAttemptsInput').value),
        defaultTrustLevel: document.getElementById('defaultTrustLevel').value,
        federationTimeout: parseInt(document.getElementById('federationTimeoutInput').value),
        autoApproveProviders: document.getElementById('autoApproveToggle').checked
    };

    localStorage.setItem('federationSettings', JSON.stringify(settings));
    logActivity('Settings saved', 'info');
    showAlert('Settings saved successfully!');
}

function resetSettings() {
    settings = { ...defaultSettings };
    loadSettingsToUI();
    logActivity('Settings reset to defaults', 'warning');
    showAlert('Settings reset to defaults!');
}

function loadSettings() {
    const stored = localStorage.getItem('federationSettings');
    if (stored) {
        settings = { ...defaultSettings, ...JSON.parse(stored) };
    } else {
        settings = { ...defaultSettings };
    }
    loadSettingsToUI();
}

function loadSettingsToUI() {
    document.getElementById('autoRotateToggle').checked = settings.autoRotateTokens;
    document.getElementById('mfaToggle').checked = settings.mfaEnabled;
    document.getElementById('sessionTimeoutInput').value = settings.sessionTimeout;
    document.getElementById('threatDetectionToggle').checked = settings.threatDetection;
    document.getElementById('ipWhitelistToggle').checked = settings.ipWhitelist;
    document.getElementById('maxFailedAttemptsInput').value = settings.maxFailedAttempts;
    document.getElementById('defaultTrustLevel').value = settings.defaultTrustLevel;
    document.getElementById('federationTimeoutInput').value = settings.federationTimeout;
    document.getElementById('autoApproveToggle').checked = settings.autoApproveProviders;
}

function exportSettings() {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'federation-settings.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Modal functions
function showAlert(message, title = 'Alert') {
    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMessage').textContent = message;
    document.getElementById('alertModal').style.display = 'block';
}

function hideModals() {
    document.getElementById('providerModal').style.display = 'none';
    document.getElementById('alertModal').style.display = 'none';
}

// Connection status
function updateConnectionStatus(online) {
    isOnline = online;
    const statusElement = document.getElementById('connectionStatusText');
    const statusIndicator = document.getElementById('connectionStatus');

    if (online) {
        statusElement.textContent = 'Secure Connection';
        statusIndicator.className = 'status-online';
    } else {
        statusElement.textContent = 'Offline';
        statusIndicator.className = 'status-offline';
    }
}

// State management
function saveState() {
    const state = {
        identityProviders,
        federationTrusts,
        securityPolicies,
        authenticationLogs,
        threatAlerts,
        settings,
        tokenStore: Array.from(tokenStore.entries()),
        sessionStore: Array.from(sessionStore.entries())
    };
    localStorage.setItem('federationState', JSON.stringify(state));
}

function loadState() {
    const stored = localStorage.getItem('federationState');
    if (stored) {
        const state = JSON.parse(stored);
        identityProviders = state.identityProviders || [];
        federationTrusts = state.federationTrusts || [];
        securityPolicies = state.securityPolicies || [];
        authenticationLogs = state.authenticationLogs || [];
        threatAlerts = state.threatAlerts || [];
        settings = state.settings || {};
        tokenStore = new Map(state.tokenStore || []);
        sessionStore = new Map(state.sessionStore || []);
    }
}

// Initialize all components
function initializeProviders() {
    updateProvidersDisplay();
}

function initializeFederation() {
    updateFederationDisplay();
}

function initializeSecurity() {
    updateTokenStats();
    updateSecurityPolicies();
    updateThreatAlerts();
}

// Auto-rotate tokens if enabled
setInterval(() => {
    if (settings.autoRotateTokens) {
        rotateTokens();
    }
}, 24 * 60 * 60 * 1000); // Daily rotation

// Clean up expired tokens
setInterval(() => {
    const now = new Date();
    tokenStore.forEach((token, tokenId) => {
        if (token.expiresAt && new Date(token.expiresAt) < now) {
            token.expired = true;
        }
    });
}, 60 * 1000); // Every minute

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    logActivity('Application error occurred', 'error');
    showAlert('An error occurred. Please refresh the page.', 'Error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    logActivity('Unhandled promise rejection', 'error');
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveSettings();
    }
    if (e.key === 'Escape') {
        hideModals();
    }
});

// Export for debugging
window.FederationManager = {
    identityProviders,
    federationTrusts,
    securityPolicies,
    settings,
    logActivity,
    rotateTokens,
    updateDashboard
};

console.log('Secure Federated Identity Connector loaded successfully!');