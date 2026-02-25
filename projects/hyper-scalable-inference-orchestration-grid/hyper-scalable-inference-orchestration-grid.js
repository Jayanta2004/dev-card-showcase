document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const modelConfigTextarea = document.getElementById('model-config');
    const inferenceLoadSelect = document.getElementById('inference-load');
    const scalingStrategySelect = document.getElementById('scaling-strategy');
    const startOrchestrationBtn = document.getElementById('start-orchestration');
    const stopOrchestrationBtn = document.getElementById('stop-orchestration');
    const playAnimationBtn = document.getElementById('play-animation');
    const pauseAnimationBtn = document.getElementById('pause-animation');
    const resetViewBtn = document.getElementById('reset-view');
    const speedControl = document.getElementById('speed-control');
    const speedValue = document.getElementById('speed-value');

    // Metrics Elements
    const activeModelsEl = document.getElementById('active-models');
    const totalRequestsEl = document.getElementById('total-requests');
    const avgLatencyEl = document.getElementById('avg-latency');
    const throughputEl = document.getElementById('throughput');
    const resourceUtilizationEl = document.getElementById('resource-utilization');
    const errorRateEl = document.getElementById('error-rate');

    // Canvas Elements
    const inferenceGridCanvas = document.getElementById('inference-grid');
    const loadChartCanvas = document.getElementById('load-chart');
    const gridCtx = inferenceGridCanvas.getContext('2d');
    const loadCtx = loadChartCanvas.getContext('2d');

    // Other Elements
    const orchestrationLog = document.getElementById('orchestration-log');
    const performanceResults = document.getElementById('performance-results');

    // State Management
    let orchestrationState = {
        isRunning: false,
        models: [],
        requests: [],
        nodes: [],
        animationFrame: null,
        startTime: null,
        metrics: {
            totalRequests: 0,
            completedRequests: 0,
            failedRequests: 0,
            totalLatency: 0,
            activeModels: 0,
            resourceUtilization: 0
        }
    };

    let animationState = {
        isPlaying: false,
        speed: 1,
        time: 0
    };

    // Event Listeners
    startOrchestrationBtn.addEventListener('click', startOrchestration);
    stopOrchestrationBtn.addEventListener('click', stopOrchestration);
    playAnimationBtn.addEventListener('click', () => toggleAnimation(true));
    pauseAnimationBtn.addEventListener('click', () => toggleAnimation(false));
    resetViewBtn.addEventListener('click', resetVisualization);
    speedControl.addEventListener('input', updateSpeed);

    // Initialize default configuration
    initializeDefaultConfig();

    function initializeDefaultConfig() {
        const defaultConfig = {
            models: [
                {
                    id: "bert-base",
                    type: "text-classification",
                    instances: 3,
                    maxConcurrency: 10,
                    avgLatency: 150,
                    resourceCost: 2
                },
                {
                    id: "gpt-2",
                    type: "text-generation",
                    instances: 2,
                    maxConcurrency: 5,
                    avgLatency: 300,
                    resourceCost: 4
                },
                {
                    id: "resnet-50",
                    type: "image-classification",
                    instances: 4,
                    maxConcurrency: 8,
                    avgLatency: 200,
                    resourceCost: 3
                }
            ],
            nodes: [
                { id: "node-1", capacity: 100, currentLoad: 0, models: [] },
                { id: "node-2", capacity: 100, currentLoad: 0, models: [] },
                { id: "node-3", capacity: 100, currentLoad: 0, models: [] },
                { id: "node-4", capacity: 100, currentLoad: 0, models: [] }
            ]
        };

        modelConfigTextarea.value = JSON.stringify(defaultConfig, null, 2);
        loadConfiguration(defaultConfig);
    }

    function loadConfiguration(config) {
        orchestrationState.models = config.models || [];
        orchestrationState.nodes = config.nodes || [];
        initializeGrid();
        updateVisualization();
    }

    function initializeGrid() {
        // Initialize nodes in a grid layout
        const gridSize = Math.ceil(Math.sqrt(orchestrationState.nodes.length));
        const nodeSpacing = 120;
        const startX = 100;
        const startY = 100;

        orchestrationState.nodes.forEach((node, index) => {
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;
            node.x = startX + col * nodeSpacing;
            node.y = startY + row * nodeSpacing;
            node.radius = 25;
        });
    }

    function startOrchestration() {
        if (orchestrationState.isRunning) return;

        try {
            const config = JSON.parse(modelConfigTextarea.value);
            loadConfiguration(config);

            orchestrationState.isRunning = true;
            orchestrationState.startTime = Date.now();
            orchestrationState.metrics = {
                totalRequests: 0,
                completedRequests: 0,
                failedRequests: 0,
                totalLatency: 0,
                activeModels: 0,
                resourceUtilization: 0
            };

            startOrchestrationBtn.disabled = true;
            stopOrchestrationBtn.disabled = false;

            logMessage('Orchestration started', 'success');
            generateRequests();
            updateMetrics();

        } catch (error) {
            logMessage(`Configuration error: ${error.message}`, 'error');
        }
    }

    function stopOrchestration() {
        orchestrationState.isRunning = false;
        startOrchestrationBtn.disabled = false;
        stopOrchestrationBtn.disabled = true;
        logMessage('Orchestration stopped', 'warning');

        if (orchestrationState.animationFrame) {
            cancelAnimationFrame(orchestrationState.animationFrame);
        }

        displayPerformanceResults();
    }

    function generateRequests() {
        if (!orchestrationState.isRunning) return;

        const loadPattern = inferenceLoadSelect.value;
        let requestCount = 0;

        switch (loadPattern) {
            case 'uniform':
                requestCount = Math.floor(Math.random() * 5) + 1;
                break;
            case 'bursty':
                requestCount = Math.random() < 0.3 ? Math.floor(Math.random() * 15) + 5 : Math.floor(Math.random() * 3) + 1;
                break;
            case 'seasonal':
                const time = Date.now() / 1000;
                const seasonalFactor = Math.sin(time * 0.1) * 0.5 + 0.5;
                requestCount = Math.floor(seasonalFactor * 10) + 1;
                break;
            case 'spike':
                requestCount = Math.random() < 0.1 ? Math.floor(Math.random() * 20) + 10 : Math.floor(Math.random() * 2) + 1;
                break;
        }

        for (let i = 0; i < requestCount; i++) {
            const request = {
                id: `req-${Date.now()}-${i}`,
                modelType: orchestrationState.models[Math.floor(Math.random() * orchestrationState.models.length)].type,
                arrivalTime: Date.now(),
                status: 'queued',
                assignedNode: null,
                latency: 0
            };

            orchestrationState.requests.push(request);
            orchestrationState.metrics.totalRequests++;
        }

        // Process requests
        processRequests();

        // Schedule next batch
        setTimeout(generateRequests, 1000);
    }

    function processRequests() {
        const scalingStrategy = scalingStrategySelect.value;
        const availableRequests = orchestrationState.requests.filter(r => r.status === 'queued');

        availableRequests.forEach(request => {
            const assignedNode = findOptimalNode(request, scalingStrategy);
            if (assignedNode) {
                request.status = 'processing';
                request.assignedNode = assignedNode.id;
                assignedNode.currentLoad += 10; // Simulate load increase

                // Simulate processing time
                const processingTime = Math.random() * 500 + 100;
                setTimeout(() => {
                    if (orchestrationState.isRunning) {
                        request.status = 'completed';
                        request.latency = Date.now() - request.arrivalTime;
                        orchestrationState.metrics.completedRequests++;
                        orchestrationState.metrics.totalLatency += request.latency;
                        assignedNode.currentLoad = Math.max(0, assignedNode.currentLoad - 10);
                        updateMetrics();
                    }
                }, processingTime);
            } else {
                // No available node, mark as failed after timeout
                setTimeout(() => {
                    if (request.status === 'queued') {
                        request.status = 'failed';
                        orchestrationState.metrics.failedRequests++;
                        updateMetrics();
                    }
                }, 5000);
            }
        });
    }

    function findOptimalNode(request, strategy) {
        let bestNode = null;
        let bestScore = -1;

        orchestrationState.nodes.forEach(node => {
            if (node.currentLoad >= node.capacity) return;

            let score = 0;
            switch (strategy) {
                case 'horizontal':
                    score = node.capacity - node.currentLoad;
                    break;
                case 'vertical':
                    score = node.capacity - node.currentLoad;
                    // Prefer nodes with matching models
                    if (node.models.includes(request.modelType)) score *= 1.5;
                    break;
                case 'hybrid':
                    score = (node.capacity - node.currentLoad) * 0.7 + (node.models.length * 10) * 0.3;
                    break;
                case 'predictive':
                    // Simple predictive scoring based on current load trends
                    const loadTrend = Math.random() * 0.5 + 0.5; // Simulate trend
                    score = (node.capacity - node.currentLoad) * loadTrend;
                    break;
            }

            if (score > bestScore) {
                bestScore = score;
                bestNode = node;
            }
        });

        return bestNode;
    }

    function updateMetrics() {
        const metrics = orchestrationState.metrics;
        const elapsed = orchestrationState.startTime ? (Date.now() - orchestrationState.startTime) / 1000 : 1;

        activeModelsEl.textContent = orchestrationState.models.length;
        totalRequestsEl.textContent = metrics.totalRequests;
        avgLatencyEl.textContent = metrics.completedRequests > 0 ?
            Math.round(metrics.totalLatency / metrics.completedRequests) + 'ms' : '0ms';
        throughputEl.textContent = Math.round(metrics.completedRequests / elapsed) + ' req/s';

        const totalCapacity = orchestrationState.nodes.reduce((sum, node) => sum + node.capacity, 0);
        const totalLoad = orchestrationState.nodes.reduce((sum, node) => sum + node.currentLoad, 0);
        resourceUtilizationEl.textContent = Math.round((totalLoad / totalCapacity) * 100) + '%';

        const errorRate = metrics.totalRequests > 0 ? (metrics.failedRequests / metrics.totalRequests) * 100 : 0;
        errorRateEl.textContent = errorRate.toFixed(1) + '%';

        updateLoadChart();
    }

    function updateLoadChart() {
        const ctx = loadCtx;
        ctx.clearRect(0, 0, loadChartCanvas.width, loadChartCanvas.height);

        const nodeCount = orchestrationState.nodes.length;
        const barWidth = loadChartCanvas.width / nodeCount - 10;
        const maxHeight = loadChartCanvas.height - 40;

        orchestrationState.nodes.forEach((node, index) => {
            const x = index * (barWidth + 10) + 5;
            const height = (node.currentLoad / node.capacity) * maxHeight;
            const y = loadChartCanvas.height - height - 20;

            // Bar
            ctx.fillStyle = node.currentLoad > node.capacity * 0.8 ? '#e74c3c' :
                           node.currentLoad > node.capacity * 0.6 ? '#f39c12' : '#27ae60';
            ctx.fillRect(x, y, barWidth, height);

            // Label
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(node.id, x + barWidth / 2, loadChartCanvas.height - 5);
            ctx.fillText(node.currentLoad + '%', x + barWidth / 2, y - 5);
        });
    }

    function updateVisualization() {
        if (!orchestrationState.isRunning) return;

        gridCtx.clearRect(0, 0, inferenceGridCanvas.width, inferenceGridCanvas.height);

        // Draw nodes
        orchestrationState.nodes.forEach(node => {
            const loadRatio = node.currentLoad / node.capacity;
            const color = loadRatio > 0.8 ? '#e74c3c' :
                         loadRatio > 0.6 ? '#f39c12' : '#27ae60';

            // Node circle
            gridCtx.beginPath();
            gridCtx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
            gridCtx.fillStyle = color;
            gridCtx.fill();
            gridCtx.strokeStyle = '#fff';
            gridCtx.lineWidth = 2;
            gridCtx.stroke();

            // Node label
            gridCtx.fillStyle = '#fff';
            gridCtx.font = '12px Arial';
            gridCtx.textAlign = 'center';
            gridCtx.fillText(node.id, node.x, node.y + 4);

            // Load indicator
            gridCtx.fillStyle = '#fff';
            gridCtx.font = '10px Arial';
            gridCtx.fillText(`${node.currentLoad}%`, node.x, node.y - node.radius - 5);
        });

        // Draw active requests as flowing particles
        const activeRequests = orchestrationState.requests.filter(r => r.status === 'processing');
        activeRequests.forEach(request => {
            const node = orchestrationState.nodes.find(n => n.id === request.assignedNode);
            if (node) {
                const angle = Math.random() * 2 * Math.PI;
                const distance = Math.random() * node.radius * 0.8;
                const x = node.x + Math.cos(angle) * distance;
                const y = node.y + Math.sin(angle) * distance;

                gridCtx.beginPath();
                gridCtx.arc(x, y, 3, 0, 2 * Math.PI);
                gridCtx.fillStyle = '#3498db';
                gridCtx.fill();
            }
        });

        if (animationState.isPlaying) {
            orchestrationState.animationFrame = requestAnimationFrame(updateVisualization);
        }
    }

    function toggleAnimation(play) {
        animationState.isPlaying = play;
        playAnimationBtn.disabled = play;
        pauseAnimationBtn.disabled = !play;

        if (play) {
            updateVisualization();
        } else if (orchestrationState.animationFrame) {
            cancelAnimationFrame(orchestrationState.animationFrame);
        }
    }

    function resetVisualization() {
        animationState.time = 0;
        gridCtx.clearRect(0, 0, inferenceGridCanvas.width, inferenceGridCanvas.height);
        updateVisualization();
    }

    function updateSpeed() {
        animationState.speed = parseFloat(speedControl.value);
        speedValue.textContent = animationState.speed + 'x';
    }

    function logMessage(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = `[${timestamp}] ${message}`;
        orchestrationLog.appendChild(logEntry);
        orchestrationLog.scrollTop = orchestrationLog.scrollHeight;
    }

    function displayPerformanceResults() {
        const metrics = orchestrationState.metrics;
        const elapsed = (Date.now() - orchestrationState.startTime) / 1000;

        performanceResults.innerHTML = `
            <div class="performance-metric">
                <span class="performance-label">Total Runtime:</span>
                <span class="performance-value">${elapsed.toFixed(1)}s</span>
            </div>
            <div class="performance-metric">
                <span class="performance-label">Requests Processed:</span>
                <span class="performance-value">${metrics.completedRequests}/${metrics.totalRequests}</span>
            </div>
            <div class="performance-metric">
                <span class="performance-label">Success Rate:</span>
                <span class="performance-value">${((metrics.completedRequests / metrics.totalRequests) * 100).toFixed(1)}%</span>
            </div>
            <div class="performance-metric">
                <span class="performance-label">Average Latency:</span>
                <span class="performance-value">${avgLatencyEl.textContent}</span>
            </div>
            <div class="performance-metric">
                <span class="performance-label">Peak Throughput:</span>
                <span class="performance-value">${throughputEl.textContent}</span>
            </div>
            <div class="performance-metric">
                <span class="performance-label">Scaling Strategy:</span>
                <span class="performance-value">${scalingStrategySelect.value.replace('-', ' ').toUpperCase()}</span>
            </div>
        `;
    }

    // Configuration change handler
    modelConfigTextarea.addEventListener('input', function() {
        try {
            const config = JSON.parse(this.value);
            loadConfiguration(config);
        } catch (e) {
            // Invalid JSON, ignore
        }
    });

    // Initialize
    updateLoadChart();
    logMessage('Hyper-Scalable Inference Orchestration Grid initialized', 'success');
});