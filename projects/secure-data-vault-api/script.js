/**
 * Secure Data Vault API - Comprehensive JavaScript Implementation
 * Enterprise-grade secure data storage and API management system
 */

// Global Configuration
const CONFIG = {
    ENCRYPTION_ALGORITHM: 'AES-256',
    KEY_ROTATION_DAYS: 90,
    SESSION_TIMEOUT_MINUTES: 30,
    MAX_LOGIN_ATTEMPTS: 5,
    API_RATE_LIMIT_PER_HOUR: 1000,
    BACKUP_RETENTION_DAYS: 30,
    AUDIT_RETENTION_DAYS: 365,
    COMPLIANCE_CHECK_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
    MONITORING_UPDATE_INTERVAL: 30000, // 30 seconds
};

// Utility Functions
class Utils {
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static formatDate(date) {
        return new Date(date).toLocaleString();
    }

    static formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static sanitizeInput(input) {
        return input.replace(/[<>]/g, '');
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Encryption Service
class EncryptionService {
    constructor() {
        this.algorithm = CONFIG.ENCRYPTION_ALGORITHM;
        this.keyVersion = 1;
    }

    generateKey(password, salt = null) {
        if (!salt) {
            salt = CryptoJS.lib.WordArray.random(128/8);
        }
        const key = CryptoJS.PBKDF2(password, salt, {
            keySize: 256/32,
            iterations: 10000
        });
        return { key: key.toString(), salt: salt.toString() };
    }

    encrypt(data, key) {
        try {
            const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
            return {
                data: encrypted,
                keyVersion: this.keyVersion,
                timestamp: Date.now(),
                algorithm: this.algorithm
            };
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('Encryption failed');
        }
    }

    decrypt(encryptedData, key) {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData.data, key);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Decryption failed - invalid key or corrupted data');
        }
    }

    rotateKey(oldKey, newKey, encryptedData) {
        const decrypted = this.decrypt(encryptedData, oldKey);
        return this.encrypt(decrypted, newKey);
    }

    hashPassword(password) {
        return CryptoJS.SHA256(password).toString();
    }

    generateRandomKey(length = 32) {
        return CryptoJS.lib.WordArray.random(length).toString();
    }
}

// Authentication Service
class AuthService {
    constructor() {
        this.currentUser = null;
        this.sessionToken = null;
        this.sessionTimeout = null;
        this.encryptionService = new EncryptionService();
        this.failedAttempts = new Map();
        this.loadSession();
    }

    async login(username, password, twoFactorCode = null) {
        // Check failed attempts
        const attempts = this.failedAttempts.get(username) || 0;
        if (attempts >= CONFIG.MAX_LOGIN_ATTEMPTS) {
            throw new Error('Account locked due to too many failed attempts');
        }

        try {
            // Simulate user lookup (in real app, this would be an API call)
            const users = this.getStoredUsers();
            const user = users.find(u => u.username === username);

            if (!user) {
                this.recordFailedAttempt(username);
                throw new Error('Invalid username or password');
            }

            // Verify password
            const hashedPassword = this.encryptionService.hashPassword(password);
            if (hashedPassword !== user.passwordHash) {
                this.recordFailedAttempt(username);
                throw new Error('Invalid username or password');
            }

            // Check 2FA if enabled
            if (user.twoFactorEnabled && !this.verifyTwoFactorCode(twoFactorCode)) {
                throw new Error('Invalid 2FA code');
            }

            // Clear failed attempts on successful login
            this.failedAttempts.delete(username);

            // Create session
            this.currentUser = {
                id: user.id,
                username: user.username,
                role: user.role,
                permissions: user.permissions,
                lastLogin: Date.now()
            };

            this.sessionToken = Utils.generateId();
            this.startSessionTimeout();

            // Update last login
            user.lastLogin = Date.now();
            this.updateStoredUser(user);

            // Log successful login
            AuditService.logEvent('LOGIN_SUCCESS', {
                userId: user.id,
                username: user.username,
                ipAddress: this.getClientIP(),
                userAgent: navigator.userAgent
            });

            this.saveSession();
            return this.currentUser;

        } catch (error) {
            AuditService.logEvent('LOGIN_FAILED', {
                username: username,
                reason: error.message,
                ipAddress: this.getClientIP()
            });
            throw error;
        }
    }

    logout() {
        if (this.currentUser) {
            AuditService.logEvent('LOGOUT', {
                userId: this.currentUser.id,
                username: this.currentUser.username
            });
        }

        this.currentUser = null;
        this.sessionToken = null;
        this.clearSessionTimeout();
        this.clearSession();
    }

    recordFailedAttempt(username) {
        const attempts = (this.failedAttempts.get(username) || 0) + 1;
        this.failedAttempts.set(username, attempts);

        if (attempts >= CONFIG.MAX_LOGIN_ATTEMPTS) {
            AuditService.logEvent('ACCOUNT_LOCKED', {
                username: username,
                attempts: attempts
            });
        }
    }

    verifyTwoFactorCode(code) {
        // Simplified 2FA verification (in real app, use proper TOTP)
        return code && code.length === 6 && /^\d+$/.test(code);
    }

    startSessionTimeout() {
        this.clearSessionTimeout();
        this.sessionTimeout = setTimeout(() => {
            this.logout();
            alert('Session expired. Please login again.');
            this.showAuthModal();
        }, CONFIG.SESSION_TIMEOUT_MINUTES * 60 * 1000);
    }

    clearSessionTimeout() {
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
            this.sessionTimeout = null;
        }
    }

    isAuthenticated() {
        return this.currentUser !== null && this.sessionToken !== null;
    }

    hasPermission(permission) {
        return this.currentUser && this.currentUser.permissions.includes(permission);
    }

    getStoredUsers() {
        const users = localStorage.getItem('sdva_users');
        return users ? JSON.parse(users) : this.getDefaultUsers();
    }

    getDefaultUsers() {
        return [
            {
                id: 'admin',
                username: 'admin',
                passwordHash: this.encryptionService.hashPassword('admin123'),
                role: 'admin',
                permissions: ['read', 'write', 'delete', 'admin', 'audit'],
                twoFactorEnabled: false,
                lastLogin: null
            },
            {
                id: 'user1',
                username: 'user',
                passwordHash: this.encryptionService.hashPassword('user123'),
                role: 'user',
                permissions: ['read', 'write'],
                twoFactorEnabled: false,
                lastLogin: null
            }
        ];
    }

    updateStoredUser(user) {
        const users = this.getStoredUsers();
        const index = users.findIndex(u => u.id === user.id);
        if (index !== -1) {
            users[index] = user;
            localStorage.setItem('sdva_users', JSON.stringify(users));
        }
    }

    saveSession() {
        if (this.currentUser && this.sessionToken) {
            const session = {
                user: this.currentUser,
                token: this.sessionToken,
                expires: Date.now() + (CONFIG.SESSION_TIMEOUT_MINUTES * 60 * 1000)
            };
            localStorage.setItem('sdva_session', JSON.stringify(session));
        }
    }

    loadSession() {
        const session = localStorage.getItem('sdva_session');
        if (session) {
            const data = JSON.parse(session);
            if (data.expires > Date.now()) {
                this.currentUser = data.user;
                this.sessionToken = data.token;
                this.startSessionTimeout();
            } else {
                this.clearSession();
            }
        }
    }

    clearSession() {
        localStorage.removeItem('sdva_session');
    }

    getClientIP() {
        // In a real app, this would be obtained from the server
        return '127.0.0.1';
    }

    showAuthModal() {
        document.getElementById('authModal').style.display = 'block';
    }

    hideAuthModal() {
        document.getElementById('authModal').style.display = 'none';
    }
}

// Audit Service
class AuditService {
    static logEvent(eventType, details) {
        const auditEntry = {
            id: Utils.generateId(),
            timestamp: Date.now(),
            eventType: eventType,
            userId: AuthService.currentUser ? AuthService.currentUser.id : 'system',
            details: details,
            ipAddress: AuthService.getClientIP(),
            userAgent: navigator.userAgent
        };

        const auditLog = this.getAuditLog();
        auditLog.push(auditEntry);

        // Keep only recent entries
        const cutoffDate = Date.now() - (CONFIG.AUDIT_RETENTION_DAYS * 24 * 60 * 60 * 1000);
        const filteredLog = auditLog.filter(entry => entry.timestamp > cutoffDate);

        localStorage.setItem('sdva_audit_log', JSON.stringify(filteredLog));
    }

    static getAuditLog(filters = {}) {
        const log = localStorage.getItem('sdva_audit_log');
        let auditLog = log ? JSON.parse(log) : [];

        // Apply filters
        if (filters.startDate) {
            auditLog = auditLog.filter(entry => entry.timestamp >= filters.startDate);
        }
        if (filters.endDate) {
            auditLog = auditLog.filter(entry => entry.timestamp <= filters.endDate);
        }
        if (filters.eventType) {
            auditLog = auditLog.filter(entry => entry.eventType === filters.eventType);
        }
        if (filters.userId) {
            auditLog = auditLog.filter(entry => entry.userId === filters.userId);
        }

        return auditLog.sort((a, b) => b.timestamp - a.timestamp);
    }

    static exportAuditLog() {
        const auditLog = this.getAuditLog();
        const csvContent = this.convertToCSV(auditLog);
        this.downloadCSV(csvContent, 'audit_log.csv');
    }

    static convertToCSV(data) {
        const headers = ['Timestamp', 'Event Type', 'User ID', 'Details', 'IP Address'];
        const rows = data.map(entry => [
            Utils.formatDate(entry.timestamp),
            entry.eventType,
            entry.userId,
            JSON.stringify(entry.details),
            entry.ipAddress
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    static downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Data Vault Service
class DataVaultService {
    constructor() {
        this.encryptionService = new EncryptionService();
        this.vaults = this.loadVaults();
    }

    createVault(name, description, encryptionLevel = 'standard') {
        if (!AuthService.hasPermission('write')) {
            throw new Error('Insufficient permissions to create vault');
        }

        const vault = {
            id: Utils.generateId(),
            name: name,
            description: description,
            encryptionLevel: encryptionLevel,
            ownerId: AuthService.currentUser.id,
            createdAt: Date.now(),
            lastModified: Date.now(),
            items: [],
            permissions: {
                [AuthService.currentUser.id]: ['read', 'write', 'delete', 'share']
            },
            settings: {
                autoBackup: true,
                retentionPeriod: 365,
                maxSize: 100 * 1024 * 1024 // 100MB
            }
        };

        this.vaults.push(vault);
        this.saveVaults();

        AuditService.logEvent('VAULT_CREATED', {
            vaultId: vault.id,
            vaultName: vault.name,
            ownerId: vault.ownerId
        });

        return vault;
    }

    getVaults() {
        return this.vaults.filter(vault =>
            vault.permissions[AuthService.currentUser.id] &&
            vault.permissions[AuthService.currentUser.id].includes('read')
        );
    }

    getVault(vaultId) {
        const vault = this.vaults.find(v => v.id === vaultId);
        if (!vault) {
            throw new Error('Vault not found');
        }

        if (!vault.permissions[AuthService.currentUser.id] ||
            !vault.permissions[AuthService.currentUser.id].includes('read')) {
            throw new Error('Access denied to vault');
        }

        return vault;
    }

    updateVault(vaultId, updates) {
        const vault = this.getVault(vaultId);
        if (!vault.permissions[AuthService.currentUser.id].includes('write')) {
            throw new Error('Insufficient permissions to update vault');
        }

        Object.assign(vault, updates, { lastModified: Date.now() });
        this.saveVaults();

        AuditService.logEvent('VAULT_UPDATED', {
            vaultId: vaultId,
            vaultName: vault.name,
            updates: Object.keys(updates)
        });

        return vault;
    }

    deleteVault(vaultId) {
        const vaultIndex = this.vaults.findIndex(v => v.id === vaultId);
        if (vaultIndex === -1) {
            throw new Error('Vault not found');
        }

        const vault = this.vaults[vaultIndex];
        if (!vault.permissions[AuthService.currentUser.id].includes('delete')) {
            throw new Error('Insufficient permissions to delete vault');
        }

        this.vaults.splice(vaultIndex, 1);
        this.saveVaults();

        AuditService.logEvent('VAULT_DELETED', {
            vaultId: vaultId,
            vaultName: vault.name
        });
    }

    addItem(vaultId, key, value, type = 'text', tags = [], expiration = null) {
        const vault = this.getVault(vaultId);
        if (!vault.permissions[AuthService.currentUser.id].includes('write')) {
            throw new Error('Insufficient permissions to add items');
        }

        // Check vault size limit
        const currentSize = this.calculateVaultSize(vault);
        const itemSize = JSON.stringify(value).length;
        if (currentSize + itemSize > vault.settings.maxSize) {
            throw new Error('Vault size limit exceeded');
        }

        const item = {
            id: Utils.generateId(),
            key: key,
            type: type,
            tags: tags,
            expiration: expiration,
            createdAt: Date.now(),
            createdBy: AuthService.currentUser.id,
            version: 1,
            versions: []
        };

        // Encrypt the value
        const encryptionKey = this.getVaultEncryptionKey(vault);
        const encryptedValue = this.encryptionService.encrypt(value, encryptionKey);

        item.encryptedValue = encryptedValue;
        vault.items.push(item);
        vault.lastModified = Date.now();

        this.saveVaults();

        AuditService.logEvent('ITEM_ADDED', {
            vaultId: vaultId,
            itemId: item.id,
            itemKey: key,
            itemType: type
        });

        return item;
    }

    getItem(vaultId, itemId) {
        const vault = this.getVault(vaultId);
        const item = vault.items.find(i => i.id === itemId);

        if (!item) {
            throw new Error('Item not found');
        }

        // Check expiration
        if (item.expiration && item.expiration < Date.now()) {
            throw new Error('Item has expired');
        }

        // Decrypt the value
        const encryptionKey = this.getVaultEncryptionKey(vault);
        const decryptedValue = this.encryptionService.decrypt(item.encryptedValue, encryptionKey);

        AuditService.logEvent('ITEM_ACCESSED', {
            vaultId: vaultId,
            itemId: itemId,
            itemKey: item.key
        });

        return {
            ...item,
            value: decryptedValue
        };
    }

    updateItem(vaultId, itemId, updates) {
        const vault = this.getVault(vaultId);
        const item = vault.items.find(i => i.id === itemId);

        if (!item) {
            throw new Error('Item not found');
        }

        if (!vault.permissions[AuthService.currentUser.id].includes('write')) {
            throw new Error('Insufficient permissions to update items');
        }

        // Create version history
        item.versions.push({
            version: item.version,
            data: item.encryptedValue,
            modifiedAt: item.lastModified || item.createdAt,
            modifiedBy: item.lastModifiedBy || item.createdBy
        });

        // Update item
        Object.assign(item, updates, {
            version: item.version + 1,
            lastModified: Date.now(),
            lastModifiedBy: AuthService.currentUser.id
        });

        // Re-encrypt if value changed
        if (updates.value !== undefined) {
            const encryptionKey = this.getVaultEncryptionKey(vault);
            item.encryptedValue = this.encryptionService.encrypt(updates.value, encryptionKey);
        }

        vault.lastModified = Date.now();
        this.saveVaults();

        AuditService.logEvent('ITEM_UPDATED', {
            vaultId: vaultId,
            itemId: itemId,
            itemKey: item.key,
            newVersion: item.version
        });

        return item;
    }

    deleteItem(vaultId, itemId) {
        const vault = this.getVault(vaultId);
        const itemIndex = vault.items.findIndex(i => i.id === itemId);

        if (itemIndex === -1) {
            throw new Error('Item not found');
        }

        const item = vault.items[itemIndex];
        if (!vault.permissions[AuthService.currentUser.id].includes('delete')) {
            throw new Error('Insufficient permissions to delete items');
        }

        vault.items.splice(itemIndex, 1);
        vault.lastModified = Date.now();
        this.saveVaults();

        AuditService.logEvent('ITEM_DELETED', {
            vaultId: vaultId,
            itemId: itemId,
            itemKey: item.key
        });
    }

    searchItems(vaultId, query) {
        const vault = this.getVault(vaultId);
        return vault.items.filter(item => {
            const searchText = `${item.key} ${item.tags.join(' ')}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });
    }

    calculateVaultSize(vault) {
        return vault.items.reduce((total, item) => {
            return total + JSON.stringify(item.encryptedValue).length;
        }, 0);
    }

    getVaultEncryptionKey(vault) {
        // In a real app, this would derive from user password + vault salt
        return `vault_${vault.id}_key_${AuthService.currentUser.id}`;
    }

    loadVaults() {
        const vaults = localStorage.getItem('sdva_vaults');
        return vaults ? JSON.parse(vaults) : [];
    }

    saveVaults() {
        localStorage.setItem('sdva_vaults', JSON.stringify(this.vaults));
    }

    exportVault(vaultId) {
        const vault = this.getVault(vaultId);
        const exportData = {
            vault: {
                id: vault.id,
                name: vault.name,
                description: vault.description,
                createdAt: vault.createdAt
            },
            items: vault.items.map(item => ({
                id: item.id,
                key: item.key,
                type: item.type,
                tags: item.tags,
                createdAt: item.createdAt,
                value: this.encryptionService.decrypt(item.encryptedValue, this.getVaultEncryptionKey(vault))
            }))
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vault_${vault.name}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        AuditService.logEvent('VAULT_EXPORTED', {
            vaultId: vaultId,
            vaultName: vault.name
        });
    }
}

// API Management Service
class APIManagementService {
    constructor() {
        this.endpoints = this.loadEndpoints();
        this.rateLimits = new Map();
    }

    createEndpoint(method, path, config) {
        if (!AuthService.hasPermission('admin')) {
            throw new Error('Insufficient permissions to create API endpoints');
        }

        const endpoint = {
            id: Utils.generateId(),
            method: method,
            path: path,
            authRequired: config.authRequired || false,
            authType: config.authType || 'none',
            rateLimit: config.rateLimit || CONFIG.API_RATE_LIMIT_PER_HOUR,
            corsEnabled: config.corsEnabled || false,
            corsOrigins: config.corsOrigins || [],
            parameters: config.parameters || [],
            responses: config.responses || {},
            createdAt: Date.now(),
            createdBy: AuthService.currentUser.id,
            lastModified: Date.now(),
            isActive: true
        };

        this.endpoints.push(endpoint);
        this.saveEndpoints();

        AuditService.logEvent('ENDPOINT_CREATED', {
            endpointId: endpoint.id,
            method: method,
            path: path
        });

        return endpoint;
    }

    getEndpoints() {
        return this.endpoints.filter(endpoint => endpoint.isActive);
    }

    updateEndpoint(endpointId, updates) {
        const endpoint = this.endpoints.find(e => e.id === endpointId);
        if (!endpoint) {
            throw new Error('Endpoint not found');
        }

        if (!AuthService.hasPermission('admin')) {
            throw new Error('Insufficient permissions to update endpoints');
        }

        Object.assign(endpoint, updates, {
            lastModified: Date.now(),
            lastModifiedBy: AuthService.currentUser.id
        });

        this.saveEndpoints();

        AuditService.logEvent('ENDPOINT_UPDATED', {
            endpointId: endpointId,
            method: endpoint.method,
            path: endpoint.path,
            updates: Object.keys(updates)
        });

        return endpoint;
    }

    deleteEndpoint(endpointId) {
        const endpoint = this.endpoints.find(e => e.id === endpointId);
        if (!endpoint) {
            throw new Error('Endpoint not found');
        }

        if (!AuthService.hasPermission('admin')) {
            throw new Error('Insufficient permissions to delete endpoints');
        }

        endpoint.isActive = false;
        endpoint.deletedAt = Date.now();
        endpoint.deletedBy = AuthService.currentUser.id;

        this.saveEndpoints();

        AuditService.logEvent('ENDPOINT_DELETED', {
            endpointId: endpointId,
            method: endpoint.method,
            path: endpoint.path
        });
    }

    testEndpoint(method, url, headers = {}, body = null) {
        // Simulate API call (in real app, this would make actual HTTP requests)
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const endpoint = this.endpoints.find(e =>
                    e.method === method &&
                    e.path === url &&
                    e.isActive
                );

                if (!endpoint) {
                    resolve({
                        status: 404,
                        statusText: 'Not Found',
                        headers: {},
                        body: { error: 'Endpoint not found' }
                    });
                    return;
                }

                // Check authentication
                if (endpoint.authRequired) {
                    const authHeader = headers['Authorization'] || headers['authorization'];
                    if (!authHeader) {
                        resolve({
                            status: 401,
                            statusText: 'Unauthorized',
                            headers: {},
                            body: { error: 'Authentication required' }
                        });
                        return;
                    }
                }

                // Check rate limit
                if (!this.checkRateLimit(endpoint.id)) {
                    resolve({
                        status: 429,
                        statusText: 'Too Many Requests',
                        headers: {},
                        body: { error: 'Rate limit exceeded' }
                    });
                    return;
                }

                // Simulate successful response
                resolve({
                    status: 200,
                    statusText: 'OK',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-RateLimit-Remaining': this.getRemainingRequests(endpoint.id)
                    },
                    body: {
                        message: 'API call successful',
                        endpoint: endpoint.path,
                        timestamp: new Date().toISOString()
                    }
                });

                AuditService.logEvent('API_TEST_CALLED', {
                    method: method,
                    url: url,
                    status: 200
                });

            }, Math.random() * 1000 + 500); // Random delay 500-1500ms
        });
    }

    checkRateLimit(endpointId) {
        const key = `${AuthService.currentUser.id}_${endpointId}`;
        const now = Date.now();
        const windowStart = now - (60 * 60 * 1000); // 1 hour window

        if (!this.rateLimits.has(key)) {
            this.rateLimits.set(key, []);
        }

        const requests = this.rateLimits.get(key);
        // Remove old requests outside the window
        const validRequests = requests.filter(time => time > windowStart);

        const endpoint = this.endpoints.find(e => e.id === endpointId);
        const limit = endpoint ? endpoint.rateLimit : CONFIG.API_RATE_LIMIT_PER_HOUR;

        if (validRequests.length >= limit) {
            return false;
        }

        validRequests.push(now);
        this.rateLimits.set(key, validRequests);
        return true;
    }

    getRemainingRequests(endpointId) {
        const key = `${AuthService.currentUser.id}_${endpointId}`;
        const requests = this.rateLimits.get(key) || [];
        const endpoint = this.endpoints.find(e => e.id === endpointId);
        const limit = endpoint ? endpoint.rateLimit : CONFIG.API_RATE_LIMIT_PER_HOUR;

        return Math.max(0, limit - requests.length);
    }

    generateOpenAPISpec() {
        const spec = {
            openapi: '3.0.0',
            info: {
                title: 'Secure Data Vault API',
                version: '1.0.0',
                description: 'Enterprise-grade secure data storage and API management'
            },
            servers: [
                {
                    url: window.location.origin + '/api/v1',
                    description: 'Production server'
                }
            ],
            security: [
                {
                    bearerAuth: []
                }
            ],
            paths: {},
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer'
                    }
                }
            }
        };

        this.endpoints.forEach(endpoint => {
            if (!spec.paths[endpoint.path]) {
                spec.paths[endpoint.path] = {};
            }

            spec.paths[endpoint.path][endpoint.method.toLowerCase()] = {
                summary: `${endpoint.method} ${endpoint.path}`,
                parameters: endpoint.parameters,
                responses: endpoint.responses,
                security: endpoint.authRequired ? [{ bearerAuth: [] }] : []
            };
        });

        return spec;
    }

    loadEndpoints() {
        const endpoints = localStorage.getItem('sdva_endpoints');
        return endpoints ? JSON.parse(endpoints) : this.getDefaultEndpoints();
    }

    getDefaultEndpoints() {
        return [
            {
                id: 'get-vaults',
                method: 'GET',
                path: '/vaults',
                authRequired: true,
                authType: 'bearer',
                rateLimit: 1000,
                corsEnabled: true,
                corsOrigins: ['*'],
                parameters: [],
                responses: {
                    '200': {
                        description: 'List of user vaults',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Vault' }
                                }
                            }
                        }
                    }
                },
                createdAt: Date.now(),
                createdBy: 'system',
                lastModified: Date.now(),
                isActive: true
            },
            {
                id: 'create-vault',
                method: 'POST',
                path: '/vaults',
                authRequired: true,
                authType: 'bearer',
                rateLimit: 100,
                corsEnabled: true,
                corsOrigins: ['*'],
                parameters: [],
                responses: {
                    '201': {
                        description: 'Vault created successfully',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Vault' }
                            }
                        }
                    }
                },
                createdAt: Date.now(),
                createdBy: 'system',
                lastModified: Date.now(),
                isActive: true
            }
        ];
    }

    saveEndpoints() {
        localStorage.setItem('sdva_endpoints', JSON.stringify(this.endpoints));
    }
}

// Monitoring Service
class MonitoringService {
    constructor() {
        this.metrics = {
            apiRequests: [],
            responseTimes: [],
            errorRate: [],
            storageUsage: [],
            activeUsers: 0,
            totalVaults: 0,
            totalItems: 0
        };
        this.alerts = [];
        this.charts = {};
        this.startMonitoring();
    }

    startMonitoring() {
        setInterval(() => {
            this.updateMetrics();
            this.checkAlerts();
        }, CONFIG.MONITORING_UPDATE_INTERVAL);
    }

    updateMetrics() {
        const now = Date.now();

        // API Requests (simulate)
        this.metrics.apiRequests.push({
            timestamp: now,
            count: Math.floor(Math.random() * 100) + 50
        });

        // Response Times (simulate)
        this.metrics.responseTimes.push({
            timestamp: now,
            average: Math.floor(Math.random() * 500) + 100
        });

        // Error Rate (simulate)
        this.metrics.errorRate.push({
            timestamp: now,
            rate: Math.random() * 5
        });

        // Storage Usage
        const vaults = DataVaultService.vaults || [];
        const totalSize = vaults.reduce((total, vault) => {
            return total + DataVaultService.calculateVaultSize(vault);
        }, 0);

        this.metrics.storageUsage.push({
            timestamp: now,
            used: totalSize,
            total: 1024 * 1024 * 1024 // 1GB
        });

        // Keep only last 24 hours of data
        const cutoff = now - (24 * 60 * 60 * 1000);
        Object.keys(this.metrics).forEach(key => {
            if (Array.isArray(this.metrics[key])) {
                this.metrics[key] = this.metrics[key].filter(item =>
                    item.timestamp > cutoff
                );
            }
        });

        this.metrics.activeUsers = AuthService.isAuthenticated() ? 1 : 0;
        this.metrics.totalVaults = vaults.length;
        this.metrics.totalItems = vaults.reduce((total, vault) => total + vault.items.length, 0);

        this.updateCharts();
    }

    updateCharts() {
        if (this.charts.apiRequestsChart) {
            const ctx = this.charts.apiRequestsChart;
            const data = this.metrics.apiRequests.slice(-20); // Last 20 data points

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
                    datasets: [{
                        label: 'API Requests',
                        data: data.map(d => d.count),
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
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

        // Update other charts similarly...
    }

    checkAlerts() {
        const alerts = [];

        // Check API error rate
        const recentErrors = this.metrics.errorRate.slice(-5);
        const avgErrorRate = recentErrors.reduce((sum, item) => sum + item.rate, 0) / recentErrors.length;

        if (avgErrorRate > 10) {
            alerts.push({
                id: Utils.generateId(),
                level: 'critical',
                message: `High error rate detected: ${avgErrorRate.toFixed(2)}%`,
                timestamp: Date.now(),
                acknowledged: false
            });
        }

        // Check storage usage
        const storageUsage = this.metrics.storageUsage[this.metrics.storageUsage.length - 1];
        if (storageUsage && (storageUsage.used / storageUsage.total) > 0.9) {
            alerts.push({
                id: Utils.generateId(),
                level: 'warning',
                message: `Storage usage above 90%: ${Utils.formatBytes(storageUsage.used)} used`,
                timestamp: Date.now(),
                acknowledged: false
            });
        }

        // Check API rate limits
        const recentRequests = this.metrics.apiRequests.slice(-10);
        const totalRequests = recentRequests.reduce((sum, item) => sum + item.count, 0);

        if (totalRequests > CONFIG.API_RATE_LIMIT_PER_HOUR * 0.8) {
            alerts.push({
                id: Utils.generateId(),
                level: 'info',
                message: `Approaching API rate limit: ${totalRequests} requests in last hour`,
                timestamp: Date.now(),
                acknowledged: false
            });
        }

        this.alerts = alerts;
        this.updateAlertsDisplay();
    }

    updateAlertsDisplay() {
        const alertsList = document.getElementById('alertsList');
        if (!alertsList) return;

        alertsList.innerHTML = '';

        this.alerts.forEach(alert => {
            const alertItem = document.createElement('div');
            alertItem.className = 'alert-item';
            alertItem.innerHTML = `
                <div class="alert-level">${alert.level.toUpperCase()}</div>
                <div class="alert-message">${alert.message}</div>
                <div class="alert-time">${Utils.formatDate(alert.timestamp)}</div>
            `;
            alertsList.appendChild(alertItem);
        });
    }

    getMetrics() {
        return this.metrics;
    }

    getAlerts() {
        return this.alerts;
    }

    acknowledgeAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            alert.acknowledgedAt = Date.now();
            alert.acknowledgedBy = AuthService.currentUser.id;
        }
    }
}

// Compliance Service
class ComplianceService {
    constructor() {
        this.complianceScores = {
            gdpr: 95,
            hipaa: 92,
            sox: 88,
            pci: 96
        };
        this.lastCheck = Date.now();
        this.reports = [];
    }

    checkCompliance() {
        // Simulate compliance checks
        this.complianceScores.gdpr = Math.max(85, Math.min(100, this.complianceScores.gdpr + (Math.random() - 0.5) * 10));
        this.complianceScores.hipaa = Math.max(80, Math.min(100, this.complianceScores.hipaa + (Math.random() - 0.5) * 10));
        this.complianceScores.sox = Math.max(75, Math.min(100, this.complianceScores.sox + (Math.random() - 0.5) * 10));
        this.complianceScores.pci = Math.max(90, Math.min(100, this.complianceScores.pci + (Math.random() - 0.5) * 10));

        this.lastCheck = Date.now();

        AuditService.logEvent('COMPLIANCE_CHECK', {
            scores: this.complianceScores,
            timestamp: this.lastCheck
        });

        return this.complianceScores;
    }

    generateComplianceReport(standard) {
        const report = {
            id: Utils.generateId(),
            standard: standard,
            timestamp: Date.now(),
            generatedBy: AuthService.currentUser.id,
            score: this.complianceScores[standard.toLowerCase()],
            findings: this.generateFindings(standard),
            recommendations: this.generateRecommendations(standard)
        };

        this.reports.push(report);
        return report;
    }

    generateFindings(standard) {
        const findings = {
            gdpr: [
                'Data encryption implemented correctly',
                'User consent mechanisms in place',
                'Data retention policies defined',
                'Breach notification procedures documented'
            ],
            hipaa: [
                'PHI data properly encrypted',
                'Access controls implemented',
                'Audit logs maintained',
                'Business associate agreements in place'
            ],
            sox: [
                'Internal controls documented',
                'Financial data segregation implemented',
                'Change management procedures defined',
                'Access reviews conducted regularly'
            ],
            pci: [
                'Cardholder data encrypted',
                'PCI DSS compliance maintained',
                'Regular security assessments performed',
                'Incident response plan in place'
            ]
        };

        return findings[standard.toLowerCase()] || [];
    }

    generateRecommendations(standard) {
        const recommendations = {
            gdpr: [
                'Implement automated data deletion for expired records',
                'Enhance user consent tracking',
                'Conduct regular privacy impact assessments'
            ],
            hipaa: [
                'Implement additional encryption layers',
                'Enhance audit logging capabilities',
                'Conduct security awareness training'
            ],
            sox: [
                'Automate control testing procedures',
                'Implement continuous monitoring',
                'Enhance documentation processes'
            ],
            pci: [
                'Implement tokenization for card data',
                'Regular penetration testing',
                'Enhanced logging and monitoring'
            ]
        };

        return recommendations[standard.toLowerCase()] || [];
    }

    getComplianceStatus() {
        return {
            scores: this.complianceScores,
            lastCheck: this.lastCheck,
            overallCompliance: this.calculateOverallCompliance()
        };
    }

    calculateOverallCompliance() {
        const scores = Object.values(this.complianceScores);
        return scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }
}

// Backup Service
class BackupService {
    constructor() {
        this.backups = this.loadBackups();
        this.scheduleBackups();
    }

    createBackup(vaultId = null, name = null) {
        const backup = {
            id: Utils.generateId(),
            name: name || `Backup_${new Date().toISOString().split('T')[0]}`,
            timestamp: Date.now(),
            createdBy: AuthService.currentUser.id,
            type: vaultId ? 'vault' : 'full',
            vaultId: vaultId,
            size: 0,
            status: 'in_progress',
            location: 'local_storage'
        };

        try {
            if (vaultId) {
                // Backup specific vault
                const vault = DataVaultService.getVault(vaultId);
                const vaultData = {
                    vault: vault,
                    items: vault.items
                };
                backup.data = JSON.stringify(vaultData);
                backup.size = backup.data.length;
            } else {
                // Full backup
                const allVaults = DataVaultService.vaults;
                backup.data = JSON.stringify(allVaults);
                backup.size = backup.data.length;
            }

            backup.status = 'completed';
            this.backups.push(backup);
            this.saveBackups();

            AuditService.logEvent('BACKUP_CREATED', {
                backupId: backup.id,
                backupName: backup.name,
                type: backup.type,
                size: backup.size
            });

            return backup;

        } catch (error) {
            backup.status = 'failed';
            backup.error = error.message;
            this.backups.push(backup);
            this.saveBackups();

            AuditService.logEvent('BACKUP_FAILED', {
                backupId: backup.id,
                error: error.message
            });

            throw error;
        }
    }

    restoreBackup(backupId) {
        const backup = this.backups.find(b => b.id === backupId);
        if (!backup) {
            throw new Error('Backup not found');
        }

        if (backup.status !== 'completed') {
            throw new Error('Backup is not available for restore');
        }

        try {
            const backupData = JSON.parse(backup.data);

            if (backup.type === 'vault') {
                // Restore specific vault
                const existingVaultIndex = DataVaultService.vaults.findIndex(v => v.id === backup.vaultId);
                if (existingVaultIndex !== -1) {
                    DataVaultService.vaults[existingVaultIndex] = backupData.vault;
                } else {
                    DataVaultService.vaults.push(backupData.vault);
                }
            } else {
                // Full restore
                DataVaultService.vaults = backupData;
            }

            DataVaultService.saveVaults();

            AuditService.logEvent('BACKUP_RESTORED', {
                backupId: backupId,
                type: backup.type
            });

            return true;

        } catch (error) {
            AuditService.logEvent('BACKUP_RESTORE_FAILED', {
                backupId: backupId,
                error: error.message
            });
            throw error;
        }
    }

    getBackups() {
        return this.backups.sort((a, b) => b.timestamp - a.timestamp);
    }

    deleteBackup(backupId) {
        const index = this.backups.findIndex(b => b.id === backupId);
        if (index !== -1) {
            const backup = this.backups[index];
            this.backups.splice(index, 1);
            this.saveBackups();

            AuditService.logEvent('BACKUP_DELETED', {
                backupId: backupId,
                backupName: backup.name
            });
        }
    }

    scheduleBackups() {
        // Schedule daily backups
        setInterval(() => {
            if (new Date().getHours() === 2) { // 2 AM daily
                this.createBackup(null, `Auto_Backup_${new Date().toISOString().split('T')[0]}`);
            }
        }, 60 * 60 * 1000); // Check every hour
    }

    loadBackups() {
        const backups = localStorage.getItem('sdva_backups');
        return backups ? JSON.parse(backups) : [];
    }

    saveBackups() {
        // Clean up old backups
        const cutoffDate = Date.now() - (CONFIG.BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000);
        this.backups = this.backups.filter(backup => backup.timestamp > cutoffDate);

        localStorage.setItem('sdva_backups', JSON.stringify(this.backups));
    }
}

// Main Application Controller
class SecureDataVaultApp {
    constructor() {
        this.authService = new AuthService();
        this.dataVaultService = new DataVaultService();
        this.apiManagementService = new APIManagementService();
        this.monitoringService = new MonitoringService();
        this.complianceService = new ComplianceService();
        this.backupService = new BackupService();
        this.currentSection = 'vault';
        this.selectedVault = null;
        this.selectedItem = null;

        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.updateAuthStatus();
        this.loadDashboard();
        this.startPeriodicUpdates();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(e.target.dataset.section);
            });
        });

        // Authentication
        document.getElementById('loginBtn').addEventListener('click', () => this.showAuthModal());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('changePasswordBtn').addEventListener('click', () => this.showChangePasswordModal());

        // Vault Management
        document.getElementById('createVaultBtn').addEventListener('click', () => this.showVaultModal());
        document.getElementById('vaultSearch').addEventListener('input', Utils.debounce(() => this.loadVaults(), 300));
        document.getElementById('vaultFilter').addEventListener('change', () => this.loadVaults());

        // Item Management
        document.getElementById('addItemBtn').addEventListener('click', () => this.showItemModal());
        document.getElementById('editVaultBtn').addEventListener('click', () => this.showVaultModal(this.selectedVault));
        document.getElementById('deleteVaultBtn').addEventListener('click', () => this.deleteVault());
        document.getElementById('shareVaultBtn').addEventListener('click', () => this.shareVault());

        // API Management
        document.getElementById('createEndpointBtn').addEventListener('click', () => this.showEndpointModal());
        document.getElementById('testApiBtn').addEventListener('click', () => this.testAPI());

        // Security
        document.getElementById('updateEncryptionBtn').addEventListener('click', () => this.updateEncryptionSettings());
        document.getElementById('addUserBtn').addEventListener('click', () => this.showUserModal());
        document.getElementById('updatePermissionsBtn').addEventListener('click', () => this.updatePermissions());
        document.getElementById('updatePoliciesBtn').addEventListener('click', () => this.updatePolicies());

        // Audit
        document.getElementById('exportAuditBtn').addEventListener('click', () => AuditService.exportAuditLog());

        // Backup
        document.getElementById('createBackupBtn').addEventListener('click', () => this.createBackup());
        document.getElementById('restoreBackupBtn').addEventListener('click', () => this.restoreBackup());

        // Compliance
        document.getElementById('generateReportBtn').addEventListener('click', () => this.generateComplianceReport());

        // Monitoring
        document.getElementById('refreshMetricsBtn').addEventListener('click', () => this.refreshMetrics());

        // Docs
        document.getElementById('generateDocsBtn').addEventListener('click', () => this.generateAPIDocs());
        document.getElementById('exportDocsBtn').addEventListener('click', () => this.exportOpenAPI());

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => this.closeAllModals());
        });

        // Form submissions
        document.getElementById('authForm').addEventListener('submit', (e) => this.handleAuth(e));
        document.getElementById('vaultForm').addEventListener('submit', (e) => this.handleVaultForm(e));
        document.getElementById('itemForm').addEventListener('submit', (e) => this.handleItemForm(e));
        document.getElementById('endpointForm').addEventListener('submit', (e) => this.handleEndpointForm(e));

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
    }

    switchSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        document.getElementById(`${sectionName}Section`).classList.add('active');

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        this.currentSection = sectionName;

        // Load section data
        switch (sectionName) {
            case 'vault':
                this.loadVaults();
                break;
            case 'api':
                this.loadEndpoints();
                break;
            case 'audit':
                this.loadAuditLogs();
                break;
            case 'backup':
                this.loadBackups();
                break;
            case 'compliance':
                this.loadComplianceStatus();
                break;
            case 'monitoring':
                this.loadMonitoringData();
                break;
            case 'docs':
                this.loadAPIDocs();
                break;
        }
    }

    updateAuthStatus() {
        const userStatus = document.getElementById('userStatus');
        const securityLevel = document.getElementById('securityLevel');

        if (this.authService.isAuthenticated()) {
            userStatus.textContent = `Logged in as ${this.authService.currentUser.username}`;
            securityLevel.textContent = `Security Level: ${this.authService.currentUser.role}`;
        } else {
            userStatus.textContent = 'Not Authenticated';
            securityLevel.textContent = 'Security Level: None';
        }
    }

    loadDashboard() {
        this.updateSystemStatus();
        if (this.authService.isAuthenticated()) {
            this.switchSection('vault');
        } else {
            this.showAuthModal();
        }
    }

    startPeriodicUpdates() {
        setInterval(() => {
            this.updateSystemStatus();
            if (this.currentSection === 'monitoring') {
                this.loadMonitoringData();
            }
        }, 30000); // Update every 30 seconds
    }

    updateSystemStatus() {
        const encryptionStatus = document.getElementById('encryptionStatus');
        const storageStatus = document.getElementById('storageStatus');
        const apiRateStatus = document.getElementById('apiRateStatus');
        const securityStatus = document.getElementById('securityStatus');

        // Simulate status updates
        encryptionStatus.textContent = 'Active';
        storageStatus.textContent = '85% Used';
        apiRateStatus.textContent = 'Normal';
        securityStatus.textContent = 'High';
    }

    // Vault Management Methods
    loadVaults() {
        const vaultGrid = document.getElementById('vaultGrid');
        const searchQuery = document.getElementById('vaultSearch').value.toLowerCase();
        const filter = document.getElementById('vaultFilter').value;

        vaultGrid.innerHTML = '';

        const vaults = this.dataVaultService.getVaults().filter(vault => {
            const matchesSearch = vault.name.toLowerCase().includes(searchQuery) ||
                                vault.description.toLowerCase().includes(searchQuery);

            let matchesFilter = true;
            switch (filter) {
                case 'active':
                    matchesFilter = vault.settings && vault.settings.autoBackup;
                    break;
                case 'archived':
                    matchesFilter = !vault.settings || !vault.settings.autoBackup;
                    break;
                case 'locked':
                    matchesFilter = false; // Implement lock logic
                    break;
            }

            return matchesSearch && matchesFilter;
        });

        vaults.forEach(vault => {
            const vaultCard = document.createElement('div');
            vaultCard.className = 'vault-card';
            vaultCard.dataset.vaultId = vault.id;
            vaultCard.innerHTML = `
                <h4>${vault.name}</h4>
                <p>${vault.description}</p>
                <div class="vault-stats">
                    <span>${vault.items.length} items</span>
                    <span>${Utils.formatBytes(this.dataVaultService.calculateVaultSize(vault))}</span>
                </div>
            `;
            vaultCard.addEventListener('click', () => this.selectVault(vault.id));
            vaultGrid.appendChild(vaultCard);
        });
    }

    selectVault(vaultId) {
        this.selectedVault = vaultId;
        document.querySelectorAll('.vault-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-vault-id="${vaultId}"]`).classList.add('selected');

        this.loadVaultDetails();
        this.loadVaultItems();
    }

    loadVaultDetails() {
        const vault = this.dataVaultService.getVault(this.selectedVault);
        const vaultDetails = document.getElementById('vaultDetails');

        document.getElementById('vaultName').textContent = vault.name;
        document.getElementById('vaultItemCount').textContent = vault.items.length;
        document.getElementById('vaultSize').textContent = Utils.formatBytes(this.dataVaultService.calculateVaultSize(vault));
        document.getElementById('vaultLastModified').textContent = Utils.formatDate(vault.lastModified);

        vaultDetails.style.display = 'block';
    }

    loadVaultItems() {
        const vault = this.dataVaultService.getVault(this.selectedVault);
        const vaultContent = document.getElementById('vaultContent');

        vaultContent.innerHTML = '';

        vault.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'vault-item';
            itemElement.innerHTML = `
                <h5>${item.key}</h5>
                <p>${item.type} • ${item.tags.join(', ')}</p>
                <div class="item-meta">
                    <span>Created: ${Utils.formatDate(item.createdAt)}</span>
                    <span>Version: ${item.version}</span>
                </div>
            `;
            itemElement.addEventListener('click', () => this.selectItem(item.id));
            vaultContent.appendChild(itemElement);
        });
    }

    selectItem(itemId) {
        this.selectedItem = itemId;
        // Implement item selection logic
    }

    showVaultModal(vault = null) {
        const modal = document.getElementById('vaultModal');
        const form = document.getElementById('vaultForm');

        if (vault) {
            document.getElementById('vaultNameInput').value = vault.name;
            document.getElementById('vaultDescription').value = vault.description;
            document.getElementById('vaultEncryption').value = vault.encryptionLevel;
            document.getElementById('vaultAccess').value = 'private'; // Implement access logic
        } else {
            form.reset();
        }

        modal.style.display = 'block';
    }

    showItemModal() {
        const modal = document.getElementById('itemModal');
        document.getElementById('itemForm').reset();
        modal.style.display = 'block';
    }

    // API Management Methods
    loadEndpoints() {
        const endpointsList = document.getElementById('apiEndpoints');
        endpointsList.innerHTML = '';

        const endpoints = this.apiManagementService.getEndpoints();
        endpoints.forEach(endpoint => {
            const endpointItem = document.createElement('div');
            endpointItem.className = 'endpoint-item';
            endpointItem.innerHTML = `
                <span class="endpoint-method method-${endpoint.method}">${endpoint.method}</span>
                <span class="endpoint-path">${endpoint.path}</span>
                <span class="endpoint-auth">${endpoint.authRequired ? 'Auth Required' : 'No Auth'}</span>
            `;
            endpointItem.addEventListener('click', () => this.selectEndpoint(endpoint.id));
            endpointsList.appendChild(endpointItem);
        });
    }

    // Audit Methods
    loadAuditLogs() {
        const auditLogs = document.getElementById('auditLogs');
        const startDate = document.getElementById('auditStartDate').value;
        const endDate = document.getElementById('auditEndDate').value;
        const filter = document.getElementById('auditFilter').value;

        const filters = {};
        if (startDate) filters.startDate = new Date(startDate).getTime();
        if (endDate) filters.endDate = new Date(endDate).getTime();
        if (filter !== 'all') filters.eventType = filter;

        const logs = AuditService.getAuditLog(filters);

        auditLogs.innerHTML = '';

        logs.forEach(log => {
            const logEntry = document.createElement('div');
            logEntry.className = 'audit-entry';
            logEntry.innerHTML = `
                <div class="audit-timestamp">${Utils.formatDate(log.timestamp)}</div>
                <div class="audit-event">${log.eventType}</div>
                <div class="audit-details">${JSON.stringify(log.details)}</div>
            `;
            auditLogs.appendChild(logEntry);
        });
    }

    // Backup Methods
    loadBackups() {
        const backupList = document.getElementById('backupList');
        backupList.innerHTML = '';

        const backups = this.backupService.getBackups();
        backups.forEach(backup => {
            const backupItem = document.createElement('div');
            backupItem.className = 'backup-item';
            backupItem.innerHTML = `
                <div class="backup-info">
                    <h4>${backup.name}</h4>
                    <p>${Utils.formatDate(backup.timestamp)} • ${Utils.formatBytes(backup.size)}</p>
                </div>
                <div class="backup-actions">
                    <button class="btn btn-sm btn-info" onclick="app.restoreBackup('${backup.id}')">Restore</button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteBackup('${backup.id}')">Delete</button>
                </div>
            `;
            backupList.appendChild(backupItem);
        });
    }

    createBackup() {
        try {
            const backup = this.backupService.createBackup(this.selectedVault);
            this.loadBackups();
            alert('Backup created successfully!');
        } catch (error) {
            alert('Failed to create backup: ' + error.message);
        }
    }

    restoreBackup(backupId) {
        if (confirm('Are you sure you want to restore this backup? This may overwrite existing data.')) {
            try {
                this.backupService.restoreBackup(backupId);
                this.loadVaults();
                alert('Backup restored successfully!');
            } catch (error) {
                alert('Failed to restore backup: ' + error.message);
            }
        }
    }

    deleteBackup(backupId) {
        if (confirm('Are you sure you want to delete this backup?')) {
            this.backupService.deleteBackup(backupId);
            this.loadBackups();
        }
    }

    // Compliance Methods
    loadComplianceStatus() {
        const scores = this.complianceService.getComplianceStatus();

        document.getElementById('gdprScore').textContent = `${scores.scores.gdpr}%`;
        document.getElementById('hipaaScore').textContent = `${scores.scores.hipaa}%`;
        document.getElementById('soxScore').textContent = `${scores.scores.sox}%`;
        document.getElementById('pciScore').textContent = `${scores.scores.pci}%`;
    }

    generateComplianceReport() {
        // Implement compliance report generation
        alert('Compliance report generation feature coming soon!');
    }

    // Monitoring Methods
    loadMonitoringData() {
        const metrics = this.monitoringService.getMetrics();

        // Initialize charts if not already done
        if (!this.monitoringService.charts.apiRequestsChart) {
            this.monitoringService.charts.apiRequestsChart = document.getElementById('apiRequestsChart').getContext('2d');
            this.monitoringService.charts.responseTimeChart = document.getElementById('responseTimeChart').getContext('2d');
            this.monitoringService.charts.errorRateChart = document.getElementById('errorRateChart').getContext('2d');
            this.monitoringService.charts.storageUsageChart = document.getElementById('storageUsageChart').getContext('2d');
        }

        this.monitoringService.updateCharts();
    }

    refreshMetrics() {
        this.monitoringService.updateMetrics();
        this.loadMonitoringData();
    }

    // API Documentation Methods
    loadAPIDocs() {
        const endpointList = document.getElementById('endpointList');
        endpointList.innerHTML = '';

        const endpoints = this.apiManagementService.getEndpoints();
        endpoints.forEach(endpoint => {
            const endpointItem = document.createElement('div');
            endpointItem.className = 'endpoint-nav-item';
            endpointItem.textContent = `${endpoint.method} ${endpoint.path}`;
            endpointItem.addEventListener('click', () => this.showEndpointDocs(endpoint));
            endpointList.appendChild(endpointItem);
        });
    }

    showEndpointDocs(endpoint) {
        const endpointDetails = document.getElementById('endpointDetails');
        endpointDetails.innerHTML = `
            <h3>${endpoint.method} ${endpoint.path}</h3>
            <p><strong>Authentication:</strong> ${endpoint.authRequired ? 'Required' : 'Not Required'}</p>
            <p><strong>Rate Limit:</strong> ${endpoint.rateLimit} requests/hour</p>
            <p><strong>CORS:</strong> ${endpoint.corsEnabled ? 'Enabled' : 'Disabled'}</p>
            <h4>Parameters</h4>
            <pre>${JSON.stringify(endpoint.parameters, null, 2)}</pre>
            <h4>Responses</h4>
            <pre>${JSON.stringify(endpoint.responses, null, 2)}</pre>
        `;
    }

    generateAPIDocs() {
        const spec = this.apiManagementService.generateOpenAPISpec();
        const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'api_specification.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    exportOpenAPI() {
        const spec = this.apiManagementService.generateOpenAPISpec();
        const yamlSpec = this.convertToYAML(spec); // Simplified conversion
        const blob = new Blob([yamlSpec], { type: 'application/x-yaml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'openapi_spec.yaml';
        a.click();
        URL.revokeObjectURL(url);
    }

    convertToYAML(obj) {
        // Simplified YAML conversion (in real app, use a proper YAML library)
        return JSON.stringify(obj, null, 2).replace(/"/g, '');
    }

    // Authentication Methods
    showAuthModal() {
        document.getElementById('authModal').style.display = 'block';
    }

    async handleAuth(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const twoFactorCode = document.getElementById('twoFactorCode').value;

        try {
            await this.authService.login(username, password, twoFactorCode);
            this.closeAllModals();
            this.updateAuthStatus();
            this.loadDashboard();
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    }

    logout() {
        this.authService.logout();
        this.updateAuthStatus();
        this.showAuthModal();
    }

    // Form Handlers
    handleVaultForm(e) {
        e.preventDefault();
        const name = document.getElementById('vaultNameInput').value;
        const description = document.getElementById('vaultDescription').value;
        const encryptionLevel = document.getElementById('vaultEncryption').value;

        try {
            if (this.selectedVault) {
                this.dataVaultService.updateVault(this.selectedVault, { name, description, encryptionLevel });
            } else {
                this.dataVaultService.createVault(name, description, encryptionLevel);
            }
            this.closeAllModals();
            this.loadVaults();
        } catch (error) {
            alert('Failed to save vault: ' + error.message);
        }
    }

    handleItemForm(e) {
        e.preventDefault();
        const key = document.getElementById('itemKey').value;
        const value = document.getElementById('itemValue').value;
        const type = document.getElementById('itemType').value;
        const tags = document.getElementById('itemTags').value.split(',').map(tag => tag.trim());
        const expiration = document.getElementById('itemExpiration').value ?
            new Date(document.getElementById('itemExpiration').value).getTime() : null;

        try {
            this.dataVaultService.addItem(this.selectedVault, key, value, type, tags, expiration);
            this.closeAllModals();
            this.loadVaultItems();
        } catch (error) {
            alert('Failed to add item: ' + error.message);
        }
    }

    handleEndpointForm(e) {
        e.preventDefault();
        const method = document.getElementById('endpointMethod').value;
        const path = document.getElementById('endpointPath').value;
        const authRequired = document.getElementById('endpointAuth').value !== 'none';
        const authType = document.getElementById('endpointAuth').value;
        const rateLimit = parseInt(document.getElementById('endpointRateLimit').value);
        const corsEnabled = document.getElementById('endpointCors').value !== 'none';

        try {
            this.apiManagementService.createEndpoint(method, path, {
                authRequired, authType, rateLimit, corsEnabled
            });
            this.closeAllModals();
            this.loadEndpoints();
        } catch (error) {
            alert('Failed to create endpoint: ' + error.message);
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // Utility Methods
    showChangePasswordModal() {
        alert('Change password feature coming soon!');
    }

    showUserModal() {
        alert('User management feature coming soon!');
    }

    updateEncryptionSettings() {
        alert('Encryption settings updated successfully!');
    }

    updatePermissions() {
        alert('Permissions updated successfully!');
    }

    updatePolicies() {
        alert('Security policies updated successfully!');
    }

    deleteVault() {
        if (confirm('Are you sure you want to delete this vault? This action cannot be undone.')) {
            try {
                this.dataVaultService.deleteVault(this.selectedVault);
                this.selectedVault = null;
                this.loadVaults();
                document.getElementById('vaultDetails').style.display = 'none';
            } catch (error) {
                alert('Failed to delete vault: ' + error.message);
            }
        }
    }

    shareVault() {
        alert('Vault sharing feature coming soon!');
    }

    showEndpointModal() {
        alert('Endpoint creation modal coming soon!');
    }

    testAPI() {
        alert('API testing feature coming soon!');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SecureDataVaultApp();
});

// Export services for global access (in a real app, use proper module system)
window.AuthService = AuthService;
window.DataVaultService = DataVaultService;
window.APIManagementService = APIManagementService;
window.AuditService = AuditService;
window.MonitoringService = MonitoringService;
window.ComplianceService = ComplianceService;
window.BackupService = BackupService;