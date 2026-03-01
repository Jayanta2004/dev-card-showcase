// Intelligent Cache Eviction Controller - JavaScript Implementation

class CacheEntry {
    constructor(key, value, size = 1) {
        this.key = key;
        this.value = value;
        this.size = size; // Size in KB
        this.accessCount = 0;
        this.lastAccessTime = Date.now();
        this.creationTime = Date.now();
        this.relevanceScore = 50; // 0-100, calculated based on access patterns
        this.temperature = 'cold'; // hot, warm, cold
        this.predictedNextAccess = null;
    }

    access() {
        this.accessCount++;
        this.lastAccessTime = Date.now();
        this.updateTemperature();
        this.updateRelevance();
    }

    updateTemperature() {
        const now = Date.now();
        const timeSinceLastAccess = now - this.lastAccessTime;

        if (timeSinceLastAccess < 5000) { // Accessed within 5 seconds
            this.temperature = 'hot';
        } else if (timeSinceLastAccess < 30000) { // Accessed within 30 seconds
            this.temperature = 'warm';
        } else {
            this.temperature = 'cold';
        }
    }

    updateRelevance() {
        // Calculate relevance based on access frequency and recency
        const accessFrequency = this.accessCount / Math.max(1, (Date.now() - this.creationTime) / 1000);
        const recencyScore = Math.max(0, 100 - (Date.now() - this.lastAccessTime) / 1000);

        this.relevanceScore = Math.min(100, (accessFrequency * 20) + (recencyScore * 0.8));
    }

    getAge() {
        return Date.now() - this.creationTime;
    }

    getTimeSinceLastAccess() {
        return Date.now() - this.lastAccessTime;
    }
}

class IntelligentCache {
    constructor(maxSizeMB = 100) {
        this.maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to bytes
        this.currentSizeBytes = 0;
        this.entries = new Map();
        this.evictionStrategy = 'intelligent';
        this.accessHistory = [];
        this.evictionHistory = [];
        this.hitCount = 0;
        this.missCount = 0;
        this.totalAccessTime = 0;
        this.accessCount = 0;
    }

    setEvictionStrategy(strategy) {
        this.evictionStrategy = strategy;
    }

    put(key, value, sizeKB = 1) {
        const sizeBytes = sizeKB * 1024;
        const existingEntry = this.entries.get(key);

        if (existingEntry) {
            // Update existing entry
            this.currentSizeBytes -= existingEntry.size * 1024;
            existingEntry.value = value;
            existingEntry.size = sizeKB;
            existingEntry.access();
        } else {
            // Create new entry
            const entry = new CacheEntry(key, value, sizeKB);
            this.entries.set(key, entry);
        }

        this.currentSizeBytes += sizeBytes;

        // Check if we need to evict
        while (this.currentSizeBytes > this.maxSizeBytes) {
            this.evict();
        }

        this.updateAccessPatterns();
    }

    get(key) {
        const startTime = performance.now();
        const entry = this.entries.get(key);

        if (entry) {
            entry.access();
            this.hitCount++;
            this.logDecision('hit', `Cache hit for key: ${key}`);
        } else {
            this.missCount++;
            this.logDecision('miss', `Cache miss for key: ${key}`);
        }

        const accessTime = performance.now() - startTime;
        this.totalAccessTime += accessTime;
        this.accessCount++;

        this.updateAccessPatterns();
        return entry ? entry.value : null;
    }

    evict() {
        if (this.entries.size === 0) return;

        let entryToEvict = null;
        let evictReason = '';

        switch (this.evictionStrategy) {
            case 'lru':
                entryToEvict = this.findLRUEntry();
                evictReason = 'Least Recently Used';
                break;
            case 'lfu':
                entryToEvict = this.findLFUEntry();
                evictReason = 'Least Frequently Used';
                break;
            case 'fifo':
                entryToEvict = this.findFIFOEntry();
                evictReason = 'First In, First Out';
                break;
            case 'random':
                entryToEvict = this.findRandomEntry();
                evictReason = 'Random Selection';
                break;
            case 'intelligent':
            default:
                entryToEvict = this.findIntelligentEntry();
                evictReason = 'Intelligent Analysis';
                break;
        }

        if (entryToEvict) {
            this.entries.delete(entryToEvict.key);
            this.currentSizeBytes -= entryToEvict.size * 1024;
            this.evictionHistory.push({
                key: entryToEvict.key,
                reason: evictReason,
                timestamp: Date.now(),
                accessCount: entryToEvict.accessCount,
                relevanceScore: entryToEvict.relevanceScore
            });
            this.logDecision('eviction', `Evicted ${entryToEvict.key} (${evictReason})`);
        }
    }

    findLRUEntry() {
        let lruEntry = null;
        let oldestAccess = Date.now();

        for (const entry of this.entries.values()) {
            if (entry.lastAccessTime < oldestAccess) {
                oldestAccess = entry.lastAccessTime;
                lruEntry = entry;
            }
        }

        return lruEntry;
    }

    findLFUEntry() {
        let lfuEntry = null;
        let lowestAccessCount = Infinity;

        for (const entry of this.entries.values()) {
            if (entry.accessCount < lowestAccessCount) {
                lowestAccessCount = entry.accessCount;
                lfuEntry = entry;
            }
        }

        return lfuEntry;
    }

    findFIFOEntry() {
        let fifoEntry = null;
        let oldestCreation = Date.now();

        for (const entry of this.entries.values()) {
            if (entry.creationTime < oldestCreation) {
                oldestCreation = entry.creationTime;
                fifoEntry = entry;
            }
        }

        return fifoEntry;
    }

    findRandomEntry() {
        const entries = Array.from(this.entries.values());
        return entries[Math.floor(Math.random() * entries.length)];
    }

    findIntelligentEntry() {
        let worstEntry = null;
        let worstScore = Infinity;

        for (const entry of this.entries.values()) {
            // Calculate intelligent score based on multiple factors
            const ageScore = entry.getAge() / 1000; // Age in seconds
            const accessScore = 100 - entry.accessCount; // Lower access count is worse
            const recencyScore = entry.getTimeSinceLastAccess() / 1000; // Time since last access
            const relevanceScore = 100 - entry.relevanceScore; // Lower relevance is worse

            // Weighted score (adjust weights based on strategy)
            const intelligentScore = (ageScore * 0.3) + (accessScore * 0.3) +
                                   (recencyScore * 0.2) + (relevanceScore * 0.2);

            if (intelligentScore < worstScore) {
                worstScore = intelligentScore;
                worstEntry = entry;
            }
        }

        return worstEntry;
    }

    updateAccessPatterns() {
        // Keep track of recent access patterns for analysis
        this.accessHistory.push({
            timestamp: Date.now(),
            hitRatio: this.getHitRatio(),
            size: this.entries.size,
            totalSize: this.currentSizeBytes
        });

        // Keep only last 1000 entries
        if (this.accessHistory.length > 1000) {
            this.accessHistory.shift();
        }
    }

    logDecision(type, message) {
        // This will be handled by the UI controller
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    getHitRatio() {
        const total = this.hitCount + this.missCount;
        return total > 0 ? (this.hitCount / total) * 100 : 0;
    }

    getAverageAccessTime() {
        return this.accessCount > 0 ? this.totalAccessTime / this.accessCount : 0;
    }

    getMemoryUsage() {
        return {
            used: this.currentSizeBytes,
            total: this.maxSizeBytes,
            percentage: (this.currentSizeBytes / this.maxSizeBytes) * 100
        };
    }

    getStats() {
        return {
            hitRatio: this.getHitRatio(),
            averageAccessTime: this.getAverageAccessTime(),
            memoryUsage: this.getMemoryUsage(),
            entryCount: this.entries.size,
            evictionCount: this.evictionHistory.length,
            totalAccesses: this.hitCount + this.missCount
        };
    }

    clear() {
        this.entries.clear();
        this.currentSizeBytes = 0;
        this.hitCount = 0;
        this.missCount = 0;
        this.totalAccessTime = 0;
        this.accessCount = 0;
        this.accessHistory = [];
        this.evictionHistory = [];
    }
}

class AccessPatternGenerator {
    constructor() {
        this.pattern = 'random';
        this.keys = [];
        this.accessSequence = [];
        this.currentIndex = 0;
    }

    setPattern(pattern) {
        this.pattern = pattern;
        this.generateSequence();
    }

    generateKeys(count = 1000) {
        this.keys = [];
        for (let i = 0; i < count; i++) {
            this.keys.push(`key_${i.toString().padStart(4, '0')}`);
        }
        this.generateSequence();
    }

    generateSequence() {
        this.accessSequence = [];
        const count = 10000; // Generate 10k access operations

        switch (this.pattern) {
            case 'random':
                this.generateRandomSequence(count);
                break;
            case 'temporal':
                this.generateTemporalSequence(count);
                break;
            case 'spatial':
                this.generateSpatialSequence(count);
                break;
            case 'zipfian':
                this.generateZipfianSequence(count);
                break;
            case 'sequential':
                this.generateSequentialSequence(count);
                break;
        }
    }

    generateRandomSequence(count) {
        for (let i = 0; i < count; i++) {
            this.accessSequence.push(this.keys[Math.floor(Math.random() * this.keys.length)]);
        }
    }

    generateTemporalSequence(count) {
        // Temporal locality: recently accessed items are more likely to be accessed again
        const recentKeys = [];
        const maxRecent = 10;

        for (let i = 0; i < count; i++) {
            let key;
            if (recentKeys.length > 0 && Math.random() < 0.7) {
                // 70% chance to access a recent key
                key = recentKeys[Math.floor(Math.random() * recentKeys.length)];
            } else {
                // 30% chance to access a new random key
                key = this.keys[Math.floor(Math.random() * this.keys.length)];
                recentKeys.unshift(key);
                if (recentKeys.length > maxRecent) {
                    recentKeys.pop();
                }
            }
            this.accessSequence.push(key);
        }
    }

    generateSpatialSequence(count) {
        // Spatial locality: access nearby keys
        for (let i = 0; i < count; i++) {
            const baseIndex = Math.floor(Math.random() * this.keys.length);
            const offset = Math.floor(Math.random() * 20) - 10; // ±10 keys
            const index = Math.max(0, Math.min(this.keys.length - 1, baseIndex + offset));
            this.accessSequence.push(this.keys[index]);
        }
    }

    generateZipfianSequence(count) {
        // Zipfian distribution: some keys are much more popular than others
        for (let i = 0; i < count; i++) {
            const rand = Math.random();
            let index = 0;
            let cumulative = 0;

            // Zipfian distribution: P(i) ∝ 1/i
            for (let j = 1; j <= this.keys.length; j++) {
                cumulative += 1 / j;
            }

            let threshold = 0;
            for (let j = 1; j <= this.keys.length; j++) {
                threshold += (1 / j) / cumulative;
                if (rand <= threshold) {
                    index = j - 1;
                    break;
                }
            }

            this.accessSequence.push(this.keys[index]);
        }
    }

    generateSequentialSequence(count) {
        for (let i = 0; i < count; i++) {
            this.accessSequence.push(this.keys[i % this.keys.length]);
        }
    }

    getNextAccess() {
        if (this.currentIndex >= this.accessSequence.length) {
            this.currentIndex = 0;
        }
        return this.accessSequence[this.currentIndex++];
    }

    reset() {
        this.currentIndex = 0;
    }
}

class CacheController {
    constructor() {
        this.cache = new IntelligentCache(100);
        this.accessGenerator = new AccessPatternGenerator();
        this.isRunning = false;
        this.simulationSpeed = 100; // ms between operations
        this.maxOperations = 1000;
        this.currentOperation = 0;

        // Performance tracking
        this.previousStats = null;
        this.chartData = [];
        this.maxChartPoints = 50;

        this.initializeElements();
        this.bindEvents();
        this.initializeChart();
        this.updateUI();
    }

    initializeElements() {
        // Configuration elements
        this.cacheSizeInput = document.getElementById('cacheSize');
        this.cacheSizeValue = document.getElementById('cacheSizeValue');
        this.evictionStrategySelect = document.getElementById('evictionStrategy');
        this.accessPatternSelect = document.getElementById('accessPattern');
        this.dataRelevanceInput = document.getElementById('dataRelevance');
        this.dataRelevanceValue = document.getElementById('dataRelevanceValue');

        // Control elements
        this.startSimulationBtn = document.getElementById('startSimulation');
        this.pauseSimulationBtn = document.getElementById('pauseSimulation');
        this.resetCacheBtn = document.getElementById('resetCache');
        this.clearStatsBtn = document.getElementById('clearStats');

        // Metrics elements
        this.hitRatioEl = document.getElementById('hitRatio');
        this.avgAccessTimeEl = document.getElementById('avgAccessTime');
        this.memoryUsageEl = document.getElementById('memoryUsage');
        this.memoryProgress = document.getElementById('memoryProgress');
        this.evictionCountEl = document.getElementById('evictionCount');

        // Trend elements
        this.hitRatioTrendEl = document.getElementById('hitRatioTrend');
        this.accessTimeTrendEl = document.getElementById('accessTimeTrend');
        this.evictionTrendEl = document.getElementById('evictionTrend');

        // Cache visualization
        this.cacheEntriesEl = document.getElementById('cacheEntries');

        // Analysis elements
        this.accessPatternChart = document.getElementById('accessPatternChart');
        this.mostAccessedKeyEl = document.getElementById('mostAccessedKey');
        this.leastAccessedKeyEl = document.getElementById('leastAccessedKey');
        this.cacheEfficiencyEl = document.getElementById('cacheEfficiency');
        this.predictedAccessEl = document.getElementById('predictedAccess');

        // Decision log
        this.decisionLogEl = document.getElementById('decisionLog');

        // Insights
        this.strategyEffectivenessEl = document.getElementById('strategyEffectiveness');
        this.optimizationRecommendationsEl = document.getElementById('optimizationRecommendations');
        this.dataDistributionEl = document.getElementById('dataDistribution');
    }

    bindEvents() {
        // Configuration events
        this.cacheSizeInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.cacheSizeValue.textContent = `${value} MB`;
            this.cache.maxSizeBytes = value * 1024 * 1024;
        });

        this.evictionStrategySelect.addEventListener('change', (e) => {
            this.cache.setEvictionStrategy(e.target.value);
            this.addDecisionLog('system', `Eviction strategy changed to ${e.target.value.toUpperCase()}`);
        });

        this.accessPatternSelect.addEventListener('change', (e) => {
            this.accessGenerator.setPattern(e.target.value);
            this.addDecisionLog('system', `Access pattern changed to ${e.target.value}`);
        });

        this.dataRelevanceInput.addEventListener('input', (e) => {
            this.dataRelevanceValue.textContent = `${e.target.value}%`;
        });

        // Control events
        this.startSimulationBtn.addEventListener('click', () => this.startSimulation());
        this.pauseSimulationBtn.addEventListener('click', () => this.pauseSimulation());
        this.resetCacheBtn.addEventListener('click', () => this.resetCache());
        this.clearStatsBtn.addEventListener('click', () => this.clearStats());
    }

    initializeChart() {
        const ctx = this.accessPatternChart.getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Hit Ratio (%)',
                    data: [],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Cache Size',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Hit Ratio (%)'
                        },
                        min: 0,
                        max: 100
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Cache Entries'
                        },
                        min: 0,
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }

    startSimulation() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.startSimulationBtn.disabled = true;
        this.pauseSimulationBtn.disabled = false;

        this.accessGenerator.generateKeys(500); // Generate 500 keys
        this.currentOperation = 0;

        this.addDecisionLog('system', 'Simulation started');
        this.simulationInterval = setInterval(() => {
            this.performOperation();
        }, this.simulationSpeed);
    }

    pauseSimulation() {
        this.isRunning = false;
        clearInterval(this.simulationInterval);
        this.startSimulationBtn.disabled = false;
        this.pauseSimulationBtn.disabled = true;
        this.addDecisionLog('system', 'Simulation paused');
    }

    performOperation() {
        if (!this.isRunning || this.currentOperation >= this.maxOperations) {
            this.pauseSimulation();
            this.addDecisionLog('system', 'Simulation completed');
            return;
        }

        const key = this.accessGenerator.getNextAccess();
        const shouldPut = Math.random() < 0.3; // 30% put operations, 70% get operations

        if (shouldPut) {
            // PUT operation
            const value = `value_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const sizeKB = Math.floor(Math.random() * 10) + 1; // 1-10 KB
            this.cache.put(key, value, sizeKB);
            this.addDecisionLog('system', `PUT ${key} (${sizeKB}KB)`);
        } else {
            // GET operation
            const result = this.cache.get(key);
            // Log is handled by cache.get()
        }

        this.currentOperation++;
        this.updateUI();
        this.updateChart();
    }

    resetCache() {
        this.cache.clear();
        this.accessGenerator.reset();
        this.currentOperation = 0;
        this.chartData = [];
        this.previousStats = null;
        this.updateChart();
        this.updateUI();
        this.addDecisionLog('system', 'Cache reset');
    }

    clearStats() {
        this.resetCache();
        this.addDecisionLog('system', 'Statistics cleared');
    }

    updateUI() {
        const stats = this.cache.getStats();

        // Update metrics
        this.hitRatioEl.textContent = `${stats.hitRatio.toFixed(2)}%`;
        this.avgAccessTimeEl.textContent = `${stats.averageAccessTime.toFixed(2)}ms`;
        this.memoryUsageEl.textContent = `${(stats.memoryUsage.used / (1024*1024)).toFixed(1)}/${(stats.memoryUsage.total / (1024*1024)).toFixed(1)} MB`;
        this.memoryProgress.style.width = `${stats.memoryUsage.percentage}%`;
        this.evictionCountEl.textContent = stats.evictionCount;

        // Update trends
        this.updateTrends(stats);

        // Update cache visualization
        this.updateCacheVisualization();

        // Update analysis
        this.updateAnalysis();

        // Update insights
        this.updateInsights(stats);
    }

    updateTrends(currentStats) {
        if (!this.previousStats) {
            this.previousStats = currentStats;
            return;
        }

        // Hit ratio trend
        const hitRatioChange = currentStats.hitRatio - this.previousStats.hitRatio;
        this.updateTrendElement(this.hitRatioTrendEl, hitRatioChange, '%');

        // Access time trend
        const accessTimeChange = currentStats.averageAccessTime - this.previousStats.averageAccessTime;
        this.updateTrendElement(this.accessTimeTrendEl, accessTimeChange, 'ms');

        // Eviction trend
        const evictionChange = currentStats.evictionCount - this.previousStats.evictionCount;
        this.updateTrendElement(this.evictionTrendEl, evictionChange, '');

        this.previousStats = currentStats;
    }

    updateTrendElement(element, change, unit) {
        const absChange = Math.abs(change);
        let trendClass = 'neutral';
        let icon = 'minus';
        let sign = '';

        if (change > 0.1) {
            trendClass = 'negative';
            icon = 'arrow-up';
            sign = '+';
        } else if (change < -0.1) {
            trendClass = 'positive';
            icon = 'arrow-down';
            sign = '';
        }

        element.className = `metric-trend ${trendClass}`;
        element.innerHTML = `<i class="fas fa-${icon}"></i> ${sign}${absChange.toFixed(1)}${unit}`;
    }

    updateCacheVisualization() {
        this.cacheEntriesEl.innerHTML = '';

        const entries = Array.from(this.cache.entries.values())
            .sort((a, b) => b.relevanceScore - a.relevanceScore);

        entries.forEach(entry => {
            const entryEl = document.createElement('div');
            entryEl.className = `cache-entry ${entry.temperature}`;

            const relevanceClass = entry.relevanceScore > 70 ? 'high' :
                                 entry.relevanceScore > 40 ? 'medium' : 'low';

            entryEl.innerHTML = `
                <div class="cache-key">${entry.key}</div>
                <div class="cache-value">${entry.value.substring(0, 30)}...</div>
                <div class="cache-access-count">${entry.accessCount}</div>
                <div class="cache-last-access">${Math.floor(entry.getTimeSinceLastAccess() / 1000)}s ago</div>
                <div class="cache-relevance">
                    <span class="relevance-score relevance-${relevanceClass}">${entry.relevanceScore.toFixed(0)}</span>
                </div>
                <div class="cache-size">${entry.size}KB</div>
            `;

            this.cacheEntriesEl.appendChild(entryEl);
        });
    }

    updateAnalysis() {
        const entries = Array.from(this.cache.entries.values());

        if (entries.length === 0) {
            this.mostAccessedKeyEl.textContent = 'None';
            this.leastAccessedKeyEl.textContent = 'None';
            this.cacheEfficiencyEl.textContent = '0%';
            this.predictedAccessEl.textContent = 'N/A';
            return;
        }

        // Most and least accessed keys
        const sortedByAccess = entries.sort((a, b) => b.accessCount - a.accessCount);
        this.mostAccessedKeyEl.textContent = sortedByAccess[0].key;
        this.leastAccessedKeyEl.textContent = sortedByAccess[sortedByAccess.length - 1].key;

        // Cache efficiency (based on hit ratio and memory utilization)
        const stats = this.cache.getStats();
        const efficiency = (stats.hitRatio * 0.7) + ((stats.memoryUsage.percentage / 100) * 0.3);
        this.cacheEfficiencyEl.textContent = `${efficiency.toFixed(1)}%`;

        // Simple prediction (most recently accessed key)
        const sortedByRecency = entries.sort((a, b) => b.lastAccessTime - a.lastAccessTime);
        this.predictedAccessEl.textContent = sortedByRecency[0].key;
    }

    updateInsights(stats) {
        // Strategy effectiveness
        const hitRatio = stats.hitRatio;
        let effectiveness = 'Poor performance';
        if (hitRatio > 80) effectiveness = 'Excellent performance - optimal caching';
        else if (hitRatio > 60) effectiveness = 'Good performance - effective caching';
        else if (hitRatio > 40) effectiveness = 'Fair performance - room for improvement';
        else effectiveness = 'Poor performance - consider different strategy';
        this.strategyEffectivenessEl.textContent = effectiveness;

        // Optimization recommendations
        let recommendations = 'Monitor performance trends';
        if (stats.hitRatio < 50) {
            recommendations = 'Consider increasing cache size or changing eviction strategy';
        } else if (stats.evictionCount > stats.entryCount * 0.5) {
            recommendations = 'High eviction rate - consider larger cache or different access patterns';
        } else if (stats.averageAccessTime > 10) {
            recommendations = 'Slow access times - review data structure or consider optimization';
        }
        this.optimizationRecommendationsEl.textContent = recommendations;

        // Data distribution analysis
        const entries = Array.from(this.cache.entries.values());
        const hotEntries = entries.filter(e => e.temperature === 'hot').length;
        const warmEntries = entries.filter(e => e.temperature === 'warm').length;
        const coldEntries = entries.filter(e => e.temperature === 'cold').length;

        this.dataDistributionEl.textContent =
            `Hot: ${hotEntries}, Warm: ${warmEntries}, Cold: ${coldEntries} entries`;
    }

    updateChart() {
        const stats = this.cache.getStats();

        this.chartData.push({
            time: new Date().toLocaleTimeString(),
            hitRatio: stats.hitRatio,
            cacheSize: stats.entryCount
        });

        if (this.chartData.length > this.maxChartPoints) {
            this.chartData.shift();
        }

        this.chart.data.labels = this.chartData.map(d => d.time);
        this.chart.data.datasets[0].data = this.chartData.map(d => d.hitRatio);
        this.chart.data.datasets[1].data = this.chartData.map(d => d.cacheSize);
        this.chart.update('none');
    }

    addDecisionLog(type, message) {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;

        const icon = {
            system: 'fas fa-cog',
            hit: 'fas fa-check-circle',
            miss: 'fas fa-times-circle',
            eviction: 'fas fa-trash',
            intelligent: 'fas fa-brain'
        }[type] || 'fas fa-info-circle';

        logEntry.innerHTML = `
            <i class="${icon}"></i>
            <span>${new Date().toLocaleTimeString()}: ${message}</span>
        `;

        this.decisionLogEl.appendChild(logEntry);
        this.decisionLogEl.scrollTop = this.decisionLogEl.scrollHeight;

        // Keep only last 50 entries
        while (this.decisionLogEl.children.length > 50) {
            this.decisionLogEl.removeChild(this.decisionLogEl.firstChild);
        }
    }
}

// Initialize the cache controller when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.controller = new CacheController();
});