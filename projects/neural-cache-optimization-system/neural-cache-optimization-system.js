// neural-cache-optimization-system.js

class Cache {
    constructor(size, strategy) {
        this.size = size;
        this.strategy = strategy;
        this.cache = new Map();
        this.accessCount = 0;
        this.hits = 0;
        this.misses = 0;
        this.neuralScores = new Map(); // For neural strategy
        this.learningRate = 0.1;
    }

    access(item) {
        this.accessCount++;
        let isHit = false;

        if (this.cache.has(item)) {
            isHit = true;
            this.hits++;
            this.updateAccess(item, true);
        } else {
            this.misses++;
            this.updateAccess(item, false);
            if (this.cache.size >= this.size) {
                this.evict();
            }
            this.cache.set(item, Date.now());
        }

        return isHit;
    }

    updateAccess(item, isHit) {
        if (this.strategy === 'neural') {
            let score = this.neuralScores.get(item) || 0.5;
            if (isHit) {
                score += this.learningRate * (1 - score); // Reward
            } else {
                score -= this.learningRate * score; // Penalty
            }
            score = Math.max(0, Math.min(1, score));
            this.neuralScores.set(item, score);
        } else if (this.strategy === 'lfu') {
            const count = (this.cache.get(item) || 0) + 1;
            this.cache.set(item, count);
        } else if (this.strategy === 'lru') {
            this.cache.set(item, Date.now());
        }
    }

    evict() {
        let toEvict;
        if (this.strategy === 'lru') {
            toEvict = Array.from(this.cache.entries()).reduce((oldest, current) =>
                current[1] < oldest[1] ? current : oldest
            )[0];
        } else if (this.strategy === 'lfu') {
            toEvict = Array.from(this.cache.entries()).reduce((least, current) =>
                current[1] < least[1] ? current : least
            )[0];
        } else if (this.strategy === 'neural') {
            toEvict = Array.from(this.cache.keys()).reduce((worst, current) => {
                const worstScore = this.neuralScores.get(worst) || 0;
                const currentScore = this.neuralScores.get(current) || 0;
                return currentScore < worstScore ? current : worst;
            });
        }
        this.cache.delete(toEvict);
    }

    getContents() {
        return Array.from(this.cache.keys());
    }

    getHitRate() {
        return this.accessCount > 0 ? (this.hits / this.accessCount) * 100 : 0;
    }

    getUtilization() {
        return (this.cache.size / this.size) * 100;
    }

    getLearningProgress() {
        if (this.strategy !== 'neural') return 0;
        const scores = Array.from(this.neuralScores.values());
        if (scores.length === 0) return 0;
        const avgScore = scores.reduce((a, b) => a + b) / scores.length;
        return avgScore * 100;
    }
}

let cache = null;
let simulationRunning = false;
let simulationInterval = null;
let accessHistory = [];
let hitRateHistory = [];
let accessPatternData = {};

let hitRateChart, accessPatternChart;

const logs = document.getElementById('logs');

function initCharts() {
    const hitRateCtx = document.getElementById('hitRateChart').getContext('2d');
    hitRateChart = new Chart(hitRateCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Hit Rate (%)',
                data: [],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    const accessCtx = document.getElementById('accessPatternChart').getContext('2d');
    accessPatternChart = new Chart(accessCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Access Frequency',
                data: [],
                backgroundColor: '#2196F3',
                borderColor: '#1976D2',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function initCache() {
    const size = parseInt(document.getElementById('cacheSize').value);
    const strategy = document.getElementById('strategySelect').value;
    cache = new Cache(size, strategy);
    updateCacheVisualization();
}

function updateCacheVisualization(lastItem = null, isHit = false) {
    const visualization = document.getElementById('cacheVisualization');
    visualization.innerHTML = '';

    for (let i = 0; i < cache.size; i++) {
        const slot = document.createElement('div');
        slot.className = 'cache-slot';

        const contents = cache.getContents();
        if (i < contents.length) {
            const item = contents[i];
            slot.textContent = item;
            if (cache.strategy === 'neural') {
                slot.classList.add('neural');
            }
            if (lastItem === item) {
                slot.classList.add(isHit ? 'hit' : 'miss');
            }
        } else {
            slot.textContent = 'Empty';
            slot.classList.add('empty');
        }

        visualization.appendChild(slot);
    }
}

function updateMetrics() {
    document.getElementById('hitRate').textContent = cache.getHitRate().toFixed(1) + '%';
    document.getElementById('hits').textContent = cache.hits;
    document.getElementById('misses').textContent = cache.misses;
    document.getElementById('totalAccesses').textContent = cache.accessCount;
    document.getElementById('utilization').textContent = cache.getUtilization().toFixed(1) + '%';
    document.getElementById('learningProgress').textContent = cache.getLearningProgress().toFixed(1) + '%';
}

function updateCharts() {
    hitRateHistory.push(cache.getHitRate());
    hitRateChart.data.labels = hitRateHistory.map((_, i) => i + 1);
    hitRateChart.data.datasets[0].data = hitRateHistory;
    hitRateChart.update();

    // Update access pattern chart
    const labels = Object.keys(accessPatternData);
    const data = Object.values(accessPatternData);
    accessPatternChart.data.labels = labels;
    accessPatternChart.data.datasets[0].data = data;
    accessPatternChart.update();
}

function log(message) {
    const p = document.createElement('p');
    p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logs.appendChild(p);
    logs.scrollTop = logs.scrollHeight;
}

function generateAccessItem() {
    // Generate access patterns with some locality
    const items = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
    let item;

    // 70% chance to access recently used items (temporal locality)
    if (accessHistory.length > 0 && Math.random() < 0.7) {
        const recentItems = accessHistory.slice(-5);
        item = recentItems[Math.floor(Math.random() * recentItems.length)];
    } else {
        item = items[Math.floor(Math.random() * items.length)];
    }

    accessPatternData[item] = (accessPatternData[item] || 0) + 1;
    return item;
}

function performAccess() {
    const item = generateAccessItem();
    accessHistory.push(item);
    document.getElementById('currentAccess').textContent = item;

    const isHit = cache.access(item);
    document.getElementById('lastOperation').textContent = isHit ? 'HIT' : 'MISS';

    updateCacheVisualization(item, isHit);
    updateMetrics();
    updateCharts();

    log(`${isHit ? 'HIT' : 'MISS'}: Accessed item ${item}`);
}

function startSimulation() {
    if (simulationRunning) return;
    initCache();
    simulationRunning = true;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    document.getElementById('cacheSize').disabled = true;
    document.getElementById('strategySelect').disabled = true;

    const speed = parseInt(document.getElementById('speedSelect').value);
    simulationInterval = setInterval(performAccess, speed);
    log('Cache simulation started');
}

function stopSimulation() {
    simulationRunning = false;
    clearInterval(simulationInterval);
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('cacheSize').disabled = false;
    document.getElementById('strategySelect').disabled = false;
    log('Cache simulation stopped');
}

function resetSimulation() {
    stopSimulation();
    accessHistory = [];
    hitRateHistory = [];
    accessPatternData = {};
    document.getElementById('currentAccess').textContent = 'None';
    document.getElementById('lastOperation').textContent = 'None';
    logs.innerHTML = '<p>Cache operations will be logged here...</p>';
    initCache();
    updateMetrics();
    updateCharts();
    log('Cache simulation reset');
}

// Initialize
initCharts();
initCache();