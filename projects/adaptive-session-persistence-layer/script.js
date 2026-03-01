// Adaptive Session Persistence Layer - Interactive JavaScript Implementation

class AdaptiveSessionPersistenceLayer {
    constructor() {
        this.sessionItems = this.generateSampleData();
        this.persistenceWeights = {
            recency: 0.35,
            usage: 0.30,
            importance: 0.25,
            size: 0.10
        };
        this.persistenceThreshold = 0.60;
        this.maxStorage = 100; // MB
        this.analyticsHistory = [];
        this.decisionLog = [];
        this.charts = {};
        this.intervals = {};
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.initializeCharts();
        this.updateDisplay();
        this.startRealTimeUpdates();
    }

    generateSampleData() {
        const keys = [
            'user_preferences', 'shopping_cart', 'form_data', 'search_history',
            'navigation_state', 'theme_settings', 'language_preference',
            'recent_actions', 'cached_content', 'session_metadata'
        ];

        const categories = ['user-data', 'application-state', 'cache', 'temporary', 'preferences'];

        return keys.map((key, index) => ({
            id: index + 1,
            key: key,
            value: this.generateSampleValue(key),
            category: categories[Math.floor(Math.random() * categories.length)],
            importance: Math.floor(Math.random() * 10) + 1,
            size: Math.floor(Math.random() * 50) + 1, // KB
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random within last week
            lastAccessed: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random within last day
            accessCount: Math.floor(Math.random() * 100) + 1,
            persistenceScore: 0,
            shouldPersist: false,
            expiryTime: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000) // Random expiry
        }));
    }

    generateSampleValue(key) {
        const samples = {
            'user_preferences': '{"theme": "dark", "notifications": true, "language": "en"}',
            'shopping_cart': '[{"id": 1, "name": "Product A", "quantity": 2}, {"id": 2, "name": "Product B", "quantity": 1}]',
            'form_data': '{"name": "John Doe", "email": "john@example.com", "address": "123 Main St"}',
            'search_history': '["react components", "javascript tutorials", "css animations"]',
            'navigation_state': '{"currentPage": "/dashboard", "breadcrumbs": ["/", "/dashboard"]}',
            'theme_settings': '{"primaryColor": "#6366f1", "fontSize": "medium", "compactMode": false}',
            'language_preference': '"en-US"',
            'recent_actions': '[{"action": "login", "timestamp": "2024-01-15T10:30:00Z"}, {"action": "view_profile", "timestamp": "2024-01-15T10:35:00Z"}]',
            'cached_content': '{"articles": ["article1", "article2"], "images": ["img1.jpg", "img2.jpg"]}',
            'session_metadata': '{"sessionId": "abc123", "userAgent": "Chrome/120.0", "ipAddress": "192.168.1.1"}'
        };

        return samples[key] || '{"sample": "data"}';
    }

    setupEventListeners() {
        // Weight sliders
        ['recency', 'usage', 'importance', 'size'].forEach(param => {
            const slider = document.getElementById(`${param}-weight`);
            const value = document.getElementById(`${param}-value`);

            slider.addEventListener('input', (e) => {
                const newValue = parseInt(e.target.value);
                value.textContent = `${newValue}%`;
                this.persistenceWeights[param] = newValue / 100;
                this.updateWeightsDisplay();
                this.recalculatePersistence();
            });
        });

        // Threshold slider
        document.getElementById('persistence-threshold').addEventListener('input', (e) => {
            this.persistenceThreshold = parseInt(e.target.value) / 100;
            document.getElementById('threshold-value').textContent = `${parseInt(e.target.value)}%`;
            this.recalculatePersistence();
        });

        // Max storage input
        document.getElementById('max-storage').addEventListener('input', (e) => {
            this.maxStorage = parseInt(e.target.value);
            this.updateStorageDisplay();
        });

        // Control buttons
        document.getElementById('apply-settings').addEventListener('click', () => {
            this.applySettings();
        });

        document.getElementById('reset-settings').addEventListener('click', () => {
            this.resetSettings();
        });

        document.getElementById('optimize-settings').addEventListener('click', () => {
            this.optimizeSettings();
        });

        document.getElementById('refresh-overview').addEventListener('click', () => {
            this.refreshOverview();
        });

        // Sort selector
        document.getElementById('sort-by').addEventListener('change', (e) => {
            this.sortItems(e.target.value);
        });

        // Time range selector
        document.getElementById('time-range').addEventListener('change', (e) => {
            this.updateAnalytics(e.target.value);
        });

        // Add item modal
        document.getElementById('add-item').addEventListener('click', () => {
            this.showAddItemModal();
        });

        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideAddItemModal();
        });

        document.getElementById('cancel-add').addEventListener('click', () => {
            this.hideAddItemModal();
        });

        document.getElementById('add-item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addSessionItem();
        });

        // Decision engine
        document.getElementById('run-analysis').addEventListener('click', () => {
            this.runDecisionAnalysis();
        });

        // Storage actions
        document.getElementById('cleanup-storage').addEventListener('click', () => {
            this.cleanupExpiredData();
        });

        document.getElementById('export-data').addEventListener('click', () => {
            this.exportSessionData();
        });

        // Insights
        document.getElementById('refresh-insights').addEventListener('click', () => {
            this.refreshInsights();
        });

        // Item interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.session-item')) {
                const item = e.target.closest('.session-item');
                const itemId = parseInt(item.dataset.id);
                this.simulateItemAccess(itemId);
            }
        });
    }

    initializeCharts() {
        this.initializePersistenceTrendChart();
        this.initializeStorageUsageChart();
    }

    initializePersistenceTrendChart() {
        const canvas = document.getElementById('persistence-trend');
        const ctx = canvas.getContext('2d');
        this.charts.persistence = { canvas, ctx };

        this.drawPersistenceTrendChart();
    }

    initializeStorageUsageChart() {
        const canvas = document.getElementById('storage-usage');
        const ctx = canvas.getContext('2d');
        this.charts.storage = { canvas, ctx };

        this.drawStorageUsageChart();
    }

    drawPersistenceTrendChart() {
        const { ctx, canvas } = this.charts.persistence;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Generate trend data
        const dataPoints = 24;
        const data = [];
        for (let i = 0; i < dataPoints; i++) {
            data.push({
                x: (width / (dataPoints - 1)) * i,
                y: height - (Math.random() * 0.4 + 0.3) * height // Random values between 30-70%
            });
        }

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 5; i++) {
            const y = (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw line
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(data[0].x, data[0].y);

        data.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();

        // Draw points
        ctx.fillStyle = '#6366f1';
        data.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawStorageUsageChart() {
        const { ctx, canvas } = this.charts.storage;
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;

        ctx.clearRect(0, 0, width, height);

        // Calculate storage usage
        const persistedData = this.sessionItems
            .filter(item => item.shouldPersist)
            .reduce((sum, item) => sum + item.size, 0) / 1024; // Convert to MB

        const tempData = this.sessionItems
            .filter(item => !item.shouldPersist)
            .reduce((sum, item) => sum + item.size, 0) / 1024;

        const metadata = 2; // Fixed metadata size
        const total = persistedData + tempData + metadata;
        const usagePercent = Math.min((total / this.maxStorage) * 100, 100);

        // Draw background circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 8;
        ctx.stroke();

        // Draw usage arc
        const usageAngle = (usagePercent / 100) * 2 * Math.PI - Math.PI / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, usageAngle);
        ctx.strokeStyle = usagePercent > 80 ? '#ef4444' : usagePercent > 60 ? '#f59e0b' : '#10b981';
        ctx.lineWidth = 8;
        ctx.stroke();

        // Draw center text
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`${usagePercent.toFixed(1)}%`, centerX, centerY - 5);

        ctx.font = '12px Inter';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('Used', centerX, centerY + 15);
    }

    calculatePersistenceScore(item) {
        const now = new Date();

        // Recency score (newer items get higher scores)
        const hoursSinceCreation = (now - item.createdAt) / (1000 * 60 * 60);
        const recencyScore = Math.max(0, 1 - (hoursSinceCreation / (7 * 24))); // Decay over 7 days

        // Usage score (more frequently accessed items get higher scores)
        const usageScore = Math.min(1, item.accessCount / 50);

        // Importance score (user-defined importance)
        const importanceScore = item.importance / 10;

        // Size score (smaller items get higher scores to encourage persistence)
        const sizeScore = Math.max(0, 1 - (item.size / 100)); // Penalize large items

        // Calculate weighted score
        const totalScore = (
            this.persistenceWeights.recency * recencyScore +
            this.persistenceWeights.usage * usageScore +
            this.persistenceWeights.importance * importanceScore +
            this.persistenceWeights.size * sizeScore
        );

        return totalScore;
    }

    recalculatePersistence() {
        this.sessionItems.forEach(item => {
            item.persistenceScore = this.calculatePersistenceScore(item);
            item.shouldPersist = item.persistenceScore >= this.persistenceThreshold;
        });

        this.updateDisplay();
        this.updateAnalytics('24h');
        this.logDecision('Recalculated persistence scores for all items');
    }

    updateDisplay() {
        this.updateOverviewStats();
        this.updateItemsList();
        this.updateStorageDisplay();
        this.updateInsights();
        this.drawStorageUsageChart();
    }

    updateOverviewStats() {
        const totalItems = this.sessionItems.length;
        const persistedItems = this.sessionItems.filter(item => item.shouldPersist).length;
        const totalSize = this.sessionItems.reduce((sum, item) => sum + item.size, 0) / 1024; // MB
        const avgScore = this.sessionItems.reduce((sum, item) => sum + item.persistenceScore, 0) / totalItems;
        const storageSaved = ((totalSize - (this.sessionItems.filter(item => item.shouldPersist).reduce((sum, item) => sum + item.size, 0) / 1024)) / totalSize) * 100;

        document.getElementById('total-sessions').textContent = totalItems;
        document.getElementById('persisted-items').textContent = persistedItems;
        document.getElementById('avg-score').textContent = (avgScore * 100).toFixed(1);
        document.getElementById('storage-saved').textContent = `${storageSaved.toFixed(1)}%`;

        // Update trends (simulated)
        this.updateTrends();
    }

    updateTrends() {
        const trends = ['sessions-trend', 'persisted-trend', 'score-trend', 'storage-trend'];
        trends.forEach(trendId => {
            const trend = Math.random() > 0.5 ? 'up' : 'down';
            const percent = Math.floor(Math.random() * 20) + 1;
            const element = document.getElementById(trendId);
            element.innerHTML = `<i class="fas fa-arrow-${trend}"></i> ${percent}%`;
            element.className = `stat-trend ${trend === 'up' ? 'positive' : 'negative'}`;
        });
    }

    updateItemsList() {
        const container = document.getElementById('items-container');
        container.innerHTML = '';

        // Sort items based on current sort setting
        const sortBy = document.getElementById('sort-by').value;
        const sortedItems = [...this.sessionItems].sort((a, b) => {
            switch (sortBy) {
                case 'score':
                    return b.persistenceScore - a.persistenceScore;
                case 'recency':
                    return b.lastAccessed - a.lastAccessed;
                case 'usage':
                    return b.accessCount - a.accessCount;
                case 'size':
                    return b.size - a.size;
                default:
                    return 0;
            }
        });

        sortedItems.forEach(item => {
            const itemElement = this.createItemElement(item);
            container.appendChild(itemElement);
        });
    }

    createItemElement(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = `session-item ${item.shouldPersist ? 'persisted' : 'temporary'}`;
        itemDiv.dataset.id = item.id;

        const isExpired = new Date() > item.expiryTime;
        if (isExpired) itemDiv.classList.add('expired');

        itemDiv.innerHTML = `
            <div class="item-header">
                <div class="item-key">${item.key}</div>
                <div class="item-meta">
                    <span class="item-score">${(item.persistenceScore * 100).toFixed(1)}%</span>
                    <span class="item-category">${item.category}</span>
                    ${isExpired ? '<span class="expired-badge">Expired</span>' : ''}
                </div>
            </div>
            <div class="item-content">${this.truncateValue(item.value)}</div>
            <div class="item-stats">
                <span>Size: ${item.size} KB</span>
                <span>Access: ${item.accessCount}x</span>
                <span>Created: ${item.createdAt.toLocaleDateString()}</span>
            </div>
        `;

        return itemDiv;
    }

    truncateValue(value) {
        if (value.length > 100) {
            return value.substring(0, 100) + '...';
        }
        return value;
    }

    updateStorageDisplay() {
        const persistedData = this.sessionItems
            .filter(item => item.shouldPersist)
            .reduce((sum, item) => sum + item.size, 0) / 1024;

        const tempCache = this.sessionItems
            .filter(item => !item.shouldPersist)
            .reduce((sum, item) => sum + item.size, 0) / 1024;

        const metadata = 2; // Fixed metadata size
        const total = persistedData + tempCache + metadata;
        const usagePercent = (total / this.maxStorage) * 100;

        document.getElementById('storage-used').textContent = `${total.toFixed(1)} MB`;
        document.getElementById('storage-total').textContent = `${this.maxStorage} MB`;
        document.getElementById('storage-fill').style.width = `${Math.min(usagePercent, 100)}%`;

        document.getElementById('persisted-data').textContent = `${persistedData.toFixed(1)} MB`;
        document.getElementById('temp-cache').textContent = `${tempCache.toFixed(1)} MB`;
        document.getElementById('metadata').textContent = `${metadata} MB`;
    }

    updateAnalytics(timeRange) {
        // Simulate analytics data
        const persistenceRate = (this.sessionItems.filter(item => item.shouldPersist).length / this.sessionItems.length) * 100;
        const avgSessionDuration = Math.floor(Math.random() * 60) + 15; // 15-75 minutes
        const dataRetention = Math.floor(Math.random() * 20) + 80; // 80-100%

        document.getElementById('persistence-rate').textContent = `${persistenceRate.toFixed(1)}%`;
        document.getElementById('avg-session-duration').textContent = `${avgSessionDuration}m ${Math.floor(Math.random() * 60)}s`;
        document.getElementById('data-retention').textContent = `${dataRetention}%`;

        this.drawPersistenceTrendChart();
    }

    updateInsights() {
        // Peak usage hours
        document.getElementById('peak-hours').textContent = '9:00 AM - 11:00 AM, 2:00 PM - 4:00 PM';

        // Most valuable data
        const valuableItems = this.sessionItems
            .sort((a, b) => b.persistenceScore - a.persistenceScore)
            .slice(0, 3)
            .map(item => item.key)
            .join(', ');

        document.getElementById('valuable-data').textContent = valuableItems;

        // Cleanup potential
        const expiredItems = this.sessionItems.filter(item => new Date() > item.expiryTime);
        const expiredSize = expiredItems.reduce((sum, item) => sum + item.size, 0) / 1024;

        document.getElementById('cleanup-potential').textContent = `${expiredSize.toFixed(1)} MB of expired session data`;

        // Optimization score
        const efficiency = this.calculateEfficiency();
        document.getElementById('optimization-score').textContent = `${efficiency.toFixed(1)}% efficiency improvement`;
    }

    calculateEfficiency() {
        const persistedItems = this.sessionItems.filter(item => item.shouldPersist);
        const totalValue = persistedItems.reduce((sum, item) => sum + item.persistenceScore, 0);
        const storageUsed = persistedItems.reduce((sum, item) => sum + item.size, 0) / 1024;
        const efficiency = (totalValue / Math.max(storageUsed, 1)) * 100;

        return Math.min(efficiency, 100);
    }

    updateWeightsDisplay() {
        ['recency', 'usage', 'importance', 'size'].forEach(param => {
            const value = this.persistenceWeights[param] * 100;
            document.getElementById(`${param}-value`).textContent = `${value.toFixed(0)}%`;
        });
    }

    sortItems(criteria) {
        this.updateItemsList();
    }

    applySettings() {
        this.recalculatePersistence();
        this.showNotification('Settings applied successfully!', 'success');
    }

    resetSettings() {
        if (confirm('Reset all settings to default values?')) {
            this.persistenceWeights = {
                recency: 0.35,
                usage: 0.30,
                importance: 0.25,
                size: 0.10
            };
            this.persistenceThreshold = 0.60;
            this.maxStorage = 100;

            this.updateWeightsDisplay();
            document.getElementById('persistence-threshold').value = 60;
            document.getElementById('threshold-value').textContent = '60%';
            document.getElementById('max-storage').value = 100;

            this.recalculatePersistence();
            this.showNotification('Settings reset to defaults!', 'info');
        }
    }

    optimizeSettings() {
        // Auto-optimize weights based on current data patterns
        const highValueItems = this.sessionItems.filter(item => item.importance > 7);
        const frequentlyUsedItems = this.sessionItems.filter(item => item.accessCount > 20);

        if (highValueItems.length > frequentlyUsedItems.length) {
            // Prioritize importance and recency
            this.persistenceWeights.importance = Math.min(0.4, this.persistenceWeights.importance + 0.05);
            this.persistenceWeights.recency = Math.min(0.4, this.persistenceWeights.recency + 0.05);
            this.persistenceWeights.usage -= 0.05;
            this.persistenceWeights.size -= 0.05;
        } else {
            // Prioritize usage and recency
            this.persistenceWeights.usage = Math.min(0.4, this.persistenceWeights.usage + 0.05);
            this.persistenceWeights.recency = Math.min(0.4, this.persistenceWeights.recency + 0.05);
            this.persistenceWeights.importance -= 0.025;
            this.persistenceWeights.size -= 0.025;
        }

        this.updateWeightsDisplay();
        this.recalculatePersistence();
        this.showNotification('Settings optimized based on usage patterns!', 'success');
    }

    refreshOverview() {
        const btn = document.getElementById('refresh-overview');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        btn.disabled = true;

        setTimeout(() => {
            this.updateOverviewStats();
            this.updateStorageDisplay();
            btn.innerHTML = originalText;
            btn.disabled = false;
            this.showNotification('Overview refreshed!', 'success');
        }, 1500);
    }

    showAddItemModal() {
        document.getElementById('add-item-modal').classList.add('show');
    }

    hideAddItemModal() {
        document.getElementById('add-item-modal').classList.remove('show');
        document.getElementById('add-item-form').reset();
    }

    addSessionItem() {
        const formData = new FormData(document.getElementById('add-item-form'));
        const newItem = {
            id: this.sessionItems.length + 1,
            key: formData.get('item-key'),
            value: formData.get('item-value'),
            category: formData.get('item-category'),
            importance: parseInt(formData.get('item-importance')),
            size: Math.floor(formData.get('item-value').length / 10) + 1, // Estimate size
            createdAt: new Date(),
            lastAccessed: new Date(),
            accessCount: 0,
            persistenceScore: 0,
            shouldPersist: false,
            expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        };

        this.sessionItems.push(newItem);
        this.hideAddItemModal();
        this.recalculatePersistence();
        this.logDecision(`Added new session item: ${newItem.key}`);
        this.showNotification('Session item added successfully!', 'success');
    }

    simulateItemAccess(itemId) {
        const item = this.sessionItems.find(item => item.id === itemId);
        if (item) {
            item.lastAccessed = new Date();
            item.accessCount++;
            this.recalculatePersistence();
        }
    }

    runDecisionAnalysis() {
        const btn = document.getElementById('run-analysis');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        btn.disabled = true;

        setTimeout(() => {
            // Simulate decision analysis
            const decisions = [
                { action: 'persist', reason: 'High importance and frequent usage' },
                { action: 'discard', reason: 'Low relevance and large size' },
                { action: 'optimize', reason: 'Compress large temporary data' }
            ];

            decisions.forEach(decision => {
                this.logDecision(`${decision.action.toUpperCase()}: ${decision.reason}`);
            });

            btn.innerHTML = originalText;
            btn.disabled = false;
            this.showNotification('Decision analysis completed!', 'success');
        }, 2000);
    }

    logDecision(message) {
        const entry = {
            timestamp: new Date(),
            message: message,
            type: message.includes('persist') ? 'persist' :
                  message.includes('discard') ? 'discard' : 'optimize'
        };

        this.decisionLog.unshift(entry);
        this.decisionLog = this.decisionLog.slice(0, 50); // Keep last 50 entries

        this.updateDecisionLog();
    }

    updateDecisionLog() {
        const container = document.getElementById('decision-log');
        container.innerHTML = '';

        this.decisionLog.slice(0, 10).forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = `decision-entry ${entry.type}`;
            entryDiv.innerHTML = `
                <div class="decision-timestamp">${entry.timestamp.toLocaleTimeString()}</div>
                <div class="decision-action">${entry.message}</div>
            `;
            container.appendChild(entryDiv);
        });
    }

    cleanupExpiredData() {
        const expiredItems = this.sessionItems.filter(item => new Date() > item.expiryTime);
        const cleanedSize = expiredItems.reduce((sum, item) => sum + item.size, 0) / 1024;

        this.sessionItems = this.sessionItems.filter(item => new Date() <= item.expiryTime);
        this.updateDisplay();

        this.logDecision(`Cleaned up ${expiredItems.length} expired items (${cleanedSize.toFixed(1)} MB)`);
        this.showNotification(`Cleaned up ${expiredItems.length} expired items!`, 'success');
    }

    exportSessionData() {
        const data = {
            timestamp: new Date().toISOString(),
            settings: {
                weights: this.persistenceWeights,
                threshold: this.persistenceThreshold,
                maxStorage: this.maxStorage
            },
            items: this.sessionItems.map(item => ({
                ...item,
                persistenceScore: item.persistenceScore,
                shouldPersist: item.shouldPersist
            })),
            analytics: {
                totalItems: this.sessionItems.length,
                persistedItems: this.sessionItems.filter(item => item.shouldPersist).length,
                efficiency: this.calculateEfficiency()
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session-persistence-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Session data exported successfully!', 'success');
    }

    refreshInsights() {
        const btn = document.getElementById('refresh-insights');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';

        setTimeout(() => {
            this.updateInsights();
            btn.innerHTML = originalText;
            this.showNotification('Insights refreshed!', 'success');
        }, 1500);
    }

    startRealTimeUpdates() {
        // Update last update time
        this.intervals.updateTime = setInterval(() => {
            document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
        }, 60000);

        // Simulate real-time item access
        this.intervals.itemAccess = setInterval(() => {
            // Randomly simulate access to some items
            const randomItems = this.sessionItems
                .sort(() => Math.random() - 0.5)
                .slice(0, Math.floor(Math.random() * 3) + 1);

            randomItems.forEach(item => {
                if (Math.random() > 0.7) {
                    item.accessCount++;
                    item.lastAccessed = new Date();
                }
            });

            if (randomItems.length > 0) {
                this.recalculatePersistence();
            }
        }, 15000); // Update every 15 seconds

        // Simulate expiry checks
        this.intervals.expiryCheck = setInterval(() => {
            const now = new Date();
            const expiredCount = this.sessionItems.filter(item => now > item.expiryTime).length;

            if (expiredCount > 0) {
                this.updateDisplay(); // Refresh to show expired items
            }
        }, 30000); // Check every 30 seconds
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    destroy() {
        Object.values(this.intervals).forEach(interval => clearInterval(interval));
    }
}

// Initialize the persistence layer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.persistenceLayer = new AdaptiveSessionPersistenceLayer();
});