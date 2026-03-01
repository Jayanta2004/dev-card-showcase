// Load Balancing Advisor - JavaScript Implementation

class LoadBalancingAdvisor {
    constructor() {
        this.nodes = [];
        this.requests = [];
        this.metrics = {
            totalLoad: 2450,
            avgResponseTime: 145,
            activeNodes: 6,
            optimizationScore: 87,
            throughput: 1837,
            latency: 145,
            errorRate: 1.2
        };
        this.strategy = 'round-robin';
        this.autoOptimize = true;
        this.trafficIntensity = 5;
        this.trafficPattern = 'steady';
        this.maxLoadThreshold = 80;
        this.scalingSensitivity = 1.0;
        this.healthCheckInterval = 30;
        this.isSimulating = false;
        this.currentNodeIndex = 0;
        this.recommendations = [];

        this.initializeElements();
        this.bindEvents();
        this.initializeNodes();
        this.initializeCharts();
        this.startMonitoring();
        this.updateUI();
        this.generateRecommendations();
    }

    initializeElements() {
        // Metric elements
        this.totalLoadEl = document.getElementById('totalLoad');
        this.avgResponseTimeEl = document.getElementById('avgResponseTime');
        this.activeNodesEl = document.getElementById('activeNodes');
        this.optimizationScoreEl = document.getElementById('optimizationScore');
        this.loadTrendEl = document.getElementById('loadTrend');
        this.responseTrendEl = document.getElementById('responseTrend');
        this.nodesTrendEl = document.getElementById('nodesTrend');
        this.optimizationTrendEl = document.getElementById('optimizationTrend');

        // Panel elements
        this.nodesGrid = document.getElementById('nodesGrid');
        this.distributionViewSelect = document.getElementById('distributionView');
        this.trafficVisualization = document.getElementById('trafficVisualization');
        this.totalRequestsEl = document.getElementById('totalRequests');
        this.successfulRequestsEl = document.getElementById('successfulRequests');
        this.failedRequestsEl = document.getElementById('failedRequests');
        this.autoOptimizeToggle = document.getElementById('autoOptimize');
        this.timeRangeSelect = document.getElementById('timeRange');
        this.throughputFill = document.getElementById('throughputFill');
        this.latencyFill = document.getElementById('latencyFill');
        this.errorFill = document.getElementById('errorFill');
        this.throughputValueEl = document.getElementById('throughputValue');
        this.latencyValueEl = document.getElementById('latencyValue');
        this.errorValueEl = document.getElementById('errorValue');
        this.recommendationsList = document.getElementById('recommendationsList');

        // Control elements
        this.trafficIntensityInput = document.getElementById('trafficIntensity');
        this.trafficIntensityValueEl = document.getElementById('trafficIntensityValue');
        this.trafficPatternSelect = document.getElementById('trafficPattern');
        this.startSimulationBtn = document.getElementById('startSimulation');
        this.stopSimulationBtn = document.getElementById('stopSimulation');
        this.resetSimulationBtn = document.getElementById('resetSimulation');
        this.maxLoadThresholdInput = document.getElementById('maxLoadThreshold');
        this.scalingSensitivityInput = document.getElementById('scalingSensitivity');
        this.scalingSensitivityValueEl = document.getElementById('scalingSensitivityValue');
        this.healthCheckIntervalInput = document.getElementById('healthCheckInterval');

        // Other elements
        this.alertsPanel = document.getElementById('alertsPanel');
        this.nodeModal = document.getElementById('nodeModal');
        this.nodeDetails = document.getElementById('nodeDetails');
        this.addNodeBtn = document.getElementById('addNode');
        this.removeNodeBtn = document.getElementById('removeNode');
        this.simulateTrafficBtn = document.getElementById('simulateTraffic');
        this.clearTrafficBtn = document.getElementById('clearTraffic');
        this.applyRecommendationsBtn = document.getElementById('applyRecommendations');
    }

    bindEvents() {
        this.autoOptimizeToggle.addEventListener('change', (e) => {
            this.autoOptimize = e.target.checked;
        });

        document.querySelectorAll('input[name="strategy"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.strategy = e.target.value;
                this.addAlert('info', 'Strategy Changed', `Load balancing strategy changed to ${this.strategy}`);
            });
        });

        this.trafficIntensityInput.addEventListener('input', (e) => {
            this.trafficIntensity = parseInt(e.target.value);
            this.trafficIntensityValueEl.textContent = this.trafficIntensity;
        });

        this.trafficPatternSelect.addEventListener('change', (e) => {
            this.trafficPattern = e.target.value;
        });

        this.startSimulationBtn.addEventListener('click', () => this.startSimulation());
        this.stopSimulationBtn.addEventListener('click', () => this.stopSimulation());
        this.resetSimulationBtn.addEventListener('click', () => this.resetSimulation());

        this.maxLoadThresholdInput.addEventListener('change', (e) => {
            this.maxLoadThreshold = parseInt(e.target.value);
        });

        this.scalingSensitivityInput.addEventListener('input', (e) => {
            this.scalingSensitivity = parseFloat(e.target.value);
            this.scalingSensitivityValueEl.textContent = this.scalingSensitivity.toFixed(1);
        });

        this.healthCheckIntervalInput.addEventListener('change', (e) => {
            this.healthCheckInterval = parseInt(e.target.value);
        });

        this.addNodeBtn.addEventListener('click', () => this.addNode());
        this.removeNodeBtn.addEventListener('click', () => this.removeNode());
        this.simulateTrafficBtn.addEventListener('click', () => this.simulateTrafficBurst());
        this.clearTrafficBtn.addEventListener('click', () => this.clearTraffic());
        this.applyRecommendationsBtn.addEventListener('click', () => this.applyRecommendations());

        this.distributionViewSelect.addEventListener('change', () => this.updateDistributionChart());
        this.timeRangeSelect.addEventListener('change', () => this.updatePerformanceChart());
    }

    initializeNodes() {
        // Initialize with 8 nodes, 6 active
        for (let i = 1; i <= 8; i++) {
            const node = {
                id: `node-${i}`,
                name: `Node ${i}`,
                load: Math.floor(Math.random() * 60) + 20, // 20-80% load
                capacity: 100,
                status: i <= 6 ? 'healthy' : 'offline',
                responseTime: Math.floor(Math.random() * 100) + 50, // 50-150ms
                uptime: Math.random() * 100,
                weight: 1,
                requests: 0,
                errors: 0
            };
            this.nodes.push(node);
        }

        this.renderNodes();
        this.updateTrafficVisualization();
    }

    initializeCharts() {
        this.updateDistributionChart();
        this.updatePerformanceChart();
    }

    startMonitoring() {
        // Update metrics every 2 seconds
        this.metricsInterval = setInterval(() => {
            this.updateMetrics();
            this.checkNodeHealth();
            if (this.autoOptimize) {
                this.optimizeLoadBalancing();
            }
            this.updateUI();
        }, 2000);

        // Health check every 30 seconds
        this.healthCheckInterval = setInterval(() => {
            this.performHealthChecks();
        }, this.healthCheckInterval * 1000);
    }

    updateMetrics() {
        // Simulate realistic metric changes
        const baseLoad = 2450 + (Math.random() - 0.5) * 500;
        this.metrics.totalLoad = Math.max(0, Math.round(baseLoad));

        // Update response time based on load
        const loadFactor = this.metrics.totalLoad / 3000;
        this.metrics.avgResponseTime = Math.max(50, Math.round(145 + (loadFactor * 100) + (Math.random() - 0.5) * 20));

        // Update active nodes
        this.metrics.activeNodes = this.nodes.filter(n => n.status === 'healthy').length;

        // Calculate optimization score based on load distribution
        this.metrics.optimizationScore = this.calculateOptimizationScore();

        // Update performance metrics
        this.metrics.throughput = Math.round(this.metrics.totalLoad * 0.75);
        this.metrics.latency = this.metrics.avgResponseTime;
        this.metrics.errorRate = Math.max(0, Math.min(5, 1.2 + (Math.random() - 0.5) * 1));

        // Update node loads
        this.nodes.forEach(node => {
            if (node.status === 'healthy') {
                // Simulate load changes based on traffic
                const loadChange = (Math.random() - 0.5) * 10;
                node.load = Math.max(0, Math.min(100, node.load + loadChange));
                node.requests += Math.floor(Math.random() * 5);
            }
        });
    }

    calculateOptimizationScore() {
        const activeNodes = this.nodes.filter(n => n.status === 'healthy');
        if (activeNodes.length === 0) return 0;

        const loads = activeNodes.map(n => n.load);
        const avgLoad = loads.reduce((sum, load) => sum + load, 0) / loads.length;
        const variance = loads.reduce((sum, load) => sum + Math.pow(load - avgLoad, 2), 0) / loads.length;
        const stdDev = Math.sqrt(variance);

        // Lower standard deviation = better optimization
        const score = Math.max(0, Math.min(100, 100 - (stdDev * 2)));
        return Math.round(score);
    }

    checkNodeHealth() {
        this.nodes.forEach(node => {
            if (node.status === 'healthy') {
                // Simulate random health issues
                if (Math.random() > 0.98) {
                    node.status = 'warning';
                    this.addAlert('warning', 'Node Health Warning', `${node.name} is experiencing high load`);
                } else if (Math.random() > 0.995) {
                    node.status = 'critical';
                    this.addAlert('danger', 'Node Critical', `${node.name} is unresponsive`);
                }
            } else if (node.status === 'warning' && Math.random() > 0.9) {
                node.status = 'healthy';
            } else if (node.status === 'critical' && Math.random() > 0.95) {
                node.status = 'healthy';
            }
        });
    }

    performHealthChecks() {
        this.nodes.forEach(node => {
            if (node.status !== 'offline') {
                // Simulate health check
                const healthScore = Math.random();
                if (healthScore > 0.9) {
                    node.uptime = Math.min(100, node.uptime + 1);
                } else if (healthScore < 0.1) {
                    node.uptime = Math.max(0, node.uptime - 5);
                }
            }
        });
    }

    optimizeLoadBalancing() {
        const activeNodes = this.nodes.filter(n => n.status === 'healthy');
        if (activeNodes.length === 0) return;

        // Adjust weights based on current load
        activeNodes.forEach(node => {
            const targetLoad = 100 / activeNodes.length;
            const loadDiff = targetLoad - node.load;

            // Adjust weight based on load difference
            node.weight = Math.max(0.1, Math.min(2.0, node.weight + (loadDiff * 0.01 * this.scalingSensitivity)));
        });

        // Normalize weights
        const totalWeight = activeNodes.reduce((sum, node) => sum + node.weight, 0);
        activeNodes.forEach(node => {
            node.weight = node.weight / totalWeight;
        });
    }

    startSimulation() {
        if (this.isSimulating) return;

        this.isSimulating = true;
        this.startSimulationBtn.disabled = true;
        this.stopSimulationBtn.disabled = false;

        this.simulationInterval = setInterval(() => {
            this.generateTraffic();
        }, 1000);

        this.addAlert('info', 'Simulation Started', 'Traffic simulation is now active');
    }

    stopSimulation() {
        this.isSimulating = false;
        clearInterval(this.simulationInterval);
        this.startSimulationBtn.disabled = false;
        this.stopSimulationBtn.disabled = true;

        this.addAlert('info', 'Simulation Stopped', 'Traffic simulation has been stopped');
    }

    resetSimulation() {
        this.requests = [];
        this.nodes.forEach(node => {
            node.requests = 0;
            node.errors = 0;
            node.load = Math.floor(Math.random() * 40) + 10;
        });

        this.updateTrafficVisualization();
        this.addAlert('info', 'Simulation Reset', 'All metrics and traffic data have been reset');
    }

    generateTraffic() {
        if (!this.isSimulating) return;

        // Generate traffic based on intensity and pattern
        let requestCount = this.trafficIntensity;

        if (this.trafficPattern === 'bursty') {
            requestCount *= (Math.random() > 0.8) ? 3 : 0.5;
        } else if (this.trafficPattern === 'spiky') {
            requestCount *= (Math.random() > 0.9) ? 5 : 0.2;
        } else if (this.trafficPattern === 'seasonal') {
            const time = Date.now() / 1000;
            requestCount *= 1 + Math.sin(time * 0.1) * 0.5;
        }

        requestCount = Math.round(requestCount);

        for (let i = 0; i < requestCount; i++) {
            this.routeRequest();
        }
    }

    routeRequest() {
        const activeNodes = this.nodes.filter(n => n.status === 'healthy');
        if (activeNodes.length === 0) return;

        let selectedNode;

        switch (this.strategy) {
            case 'round-robin':
                selectedNode = activeNodes[this.currentNodeIndex % activeNodes.length];
                this.currentNodeIndex++;
                break;

            case 'least-loaded':
                selectedNode = activeNodes.reduce((min, node) =>
                    node.load < min.load ? node : min
                );
                break;

            case 'weighted':
                const totalWeight = activeNodes.reduce((sum, node) => sum + node.weight, 0);
                let random = Math.random() * totalWeight;
                for (const node of activeNodes) {
                    random -= node.weight;
                    if (random <= 0) {
                        selectedNode = node;
                        break;
                    }
                }
                break;

            case 'adaptive':
                // Use AI-like decision making based on multiple factors
                selectedNode = this.adaptiveRouting(activeNodes);
                break;

            default:
                selectedNode = activeNodes[0];
        }

        // Process the request
        this.processRequest(selectedNode);
    }

    adaptiveRouting(activeNodes) {
        // Simple adaptive algorithm considering load, response time, and recent errors
        const scores = activeNodes.map(node => {
            const loadScore = (100 - node.load) / 100;
            const responseScore = Math.max(0, (200 - node.responseTime) / 200);
            const errorScore = Math.max(0, (10 - node.errors) / 10);
            const uptimeScore = node.uptime / 100;

            return {
                node: node,
                score: (loadScore * 0.4) + (responseScore * 0.3) + (errorScore * 0.2) + (uptimeScore * 0.1)
            };
        });

        scores.sort((a, b) => b.score - a.score);
        return scores[0].node;
    }

    processRequest(node) {
        const request = {
            id: Date.now() + Math.random(),
            nodeId: node.id,
            timestamp: new Date(),
            responseTime: node.responseTime + (Math.random() - 0.5) * 20,
            success: Math.random() > 0.05 // 95% success rate
        };

        this.requests.push(request);

        // Update node metrics
        node.requests++;
        if (!request.success) {
            node.errors++;
        }

        // Update node load
        node.load = Math.min(100, node.load + 0.1);

        // Keep only last 1000 requests
        if (this.requests.length > 1000) {
            this.requests = this.requests.slice(-1000);
        }
    }

    simulateTrafficBurst() {
        // Generate a burst of traffic
        const burstSize = Math.floor(Math.random() * 50) + 20;
        for (let i = 0; i < burstSize; i++) {
            setTimeout(() => this.routeRequest(), Math.random() * 1000);
        }

        this.addAlert('warning', 'Traffic Burst', `Simulated traffic burst of ${burstSize} requests`);
    }

    clearTraffic() {
        this.requests = [];
        this.updateTrafficVisualization();
        this.addAlert('info', 'Traffic Cleared', 'All traffic data has been cleared');
    }

    addNode() {
        const nodeCount = this.nodes.length + 1;
        const node = {
            id: `node-${nodeCount}`,
            name: `Node ${nodeCount}`,
            load: 0,
            capacity: 100,
            status: 'healthy',
            responseTime: Math.floor(Math.random() * 50) + 50,
            uptime: 100,
            weight: 1,
            requests: 0,
            errors: 0
        };

        this.nodes.push(node);
        this.renderNodes();
        this.updateDistributionChart();
        this.addAlert('success', 'Node Added', `${node.name} has been added to the cluster`);
    }

    removeNode() {
        const activeNodes = this.nodes.filter(n => n.status === 'healthy');
        if (activeNodes.length <= 1) {
            this.addAlert('danger', 'Cannot Remove Node', 'At least one active node must remain');
            return;
        }

        // Find the least loaded node to remove
        const nodeToRemove = activeNodes.reduce((min, node) =>
            node.load < min.load ? node : min
        );

        nodeToRemove.status = 'offline';
        this.renderNodes();
        this.updateDistributionChart();
        this.addAlert('warning', 'Node Removed', `${nodeToRemove.name} has been taken offline`);
    }

    renderNodes() {
        this.nodesGrid.innerHTML = '';

        this.nodes.forEach(node => {
            const nodeCard = document.createElement('div');
            nodeCard.className = `node-card ${node.status}`;
            nodeCard.onclick = () => this.showNodeDetails(node);

            const statusClass = node.status === 'healthy' ? 'success' :
                              node.status === 'warning' ? 'warning' :
                              node.status === 'critical' ? 'danger' : 'secondary';

            nodeCard.innerHTML = `
                <div class="node-name">${node.name}</div>
                <div class="node-load">${Math.round(node.load)}%</div>
                <div class="node-capacity">${node.capacity}% capacity</div>
                <div class="node-bar">
                    <div class="node-fill" style="width: ${node.load}%"></div>
                </div>
                <div class="node-metrics">
                    <span>${node.requests} req</span>
                    <span>${node.errors} err</span>
                </div>
            `;

            this.nodesGrid.appendChild(nodeCard);
        });
    }

    updateTrafficVisualization() {
        const recentRequests = this.requests.slice(-20);
        const activeNodes = this.nodes.filter(n => n.status === 'healthy');

        this.trafficVisualization.innerHTML = `
            <div class="traffic-flow">
                ${activeNodes.map((node, index) => `
                    <div class="traffic-node">${node.name.split(' ')[1]}</div>
                    ${index < activeNodes.length - 1 ? '<div class="traffic-connection"></div>' : ''}
                `).join('')}
            </div>
        `;

        // Add animated packets
        recentRequests.forEach((request, index) => {
            setTimeout(() => {
                const packet = document.createElement('div');
                packet.className = 'traffic-packet';
                packet.style.left = '0';

                const connection = this.trafficVisualization.querySelector('.traffic-connection');
                if (connection) {
                    connection.appendChild(packet);

                    setTimeout(() => {
                        if (packet.parentNode) {
                            packet.remove();
                        }
                    }, 2000);
                }
            }, index * 100);
        });
    }

    updateDistributionChart() {
        const canvas = document.getElementById('distributionChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        const activeNodes = this.nodes.filter(n => n.status === 'healthy');
        if (activeNodes.length === 0) return;

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;

        // Draw pie chart
        let startAngle = 0;
        const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#f97316', '#84cc16'];

        activeNodes.forEach((node, index) => {
            const sliceAngle = (node.load / 100) * 2 * Math.PI;
            const endAngle = startAngle + sliceAngle;

            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw label
            const labelAngle = startAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 30);

            ctx.fillStyle = '#1e293b';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${node.name}: ${Math.round(node.load)}%`, labelX, labelY);

            startAngle = endAngle;
        });

        this.updateDistributionLegend(activeNodes, colors);
    }

    updateDistributionLegend(nodes, colors) {
        const legend = document.getElementById('distributionLegend');
        legend.innerHTML = nodes.map((node, index) => `
            <div class="legend-item">
                <div class="legend-color" style="background: ${colors[index % colors.length]}"></div>
                <span>${node.name} (${Math.round(node.load)}%)</span>
            </div>
        `).join('');
    }

    updatePerformanceChart() {
        const canvas = document.getElementById('performanceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw simple line chart (simplified)
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const dataPoints = 20;
        const stepX = width / dataPoints;

        for (let i = 0; i < dataPoints; i++) {
            const x = i * stepX;
            const y = height - (Math.random() * height * 0.6 + height * 0.2);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();
    }

    generateRecommendations() {
        this.recommendations = [];

        const activeNodes = this.nodes.filter(n => n.status === 'healthy');
        const avgLoad = activeNodes.reduce((sum, node) => sum + node.load, 0) / activeNodes.length;

        if (avgLoad > 80) {
            this.recommendations.push({
                title: 'Add More Nodes',
                description: 'Average load is above 80%. Consider adding more nodes to distribute traffic.',
                impact: 'high'
            });
        }

        if (this.metrics.errorRate > 2) {
            this.recommendations.push({
                title: 'Investigate Error Sources',
                description: 'Error rate is above 2%. Check node health and application logs.',
                impact: 'high'
            });
        }

        if (this.calculateOptimizationScore() < 70) {
            this.recommendations.push({
                title: 'Optimize Load Distribution',
                description: 'Load distribution is uneven. Consider switching to adaptive routing.',
                impact: 'medium'
            });
        }

        if (activeNodes.length < 3) {
            this.recommendations.push({
                title: 'Increase Redundancy',
                description: 'Running with fewer than 3 nodes reduces fault tolerance.',
                impact: 'medium'
            });
        }

        this.renderRecommendations();
    }

    renderRecommendations() {
        this.recommendationsList.innerHTML = '';

        this.recommendations.forEach(rec => {
            const recItem = document.createElement('div');
            recItem.className = 'recommendation-item';

            recItem.innerHTML = `
                <div class="recommendation-content">
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                </div>
                <div class="recommendation-impact ${rec.impact}">${rec.impact.toUpperCase()}</div>
            `;

            this.recommendationsList.appendChild(recItem);
        });
    }

    applyRecommendations() {
        // Apply high-impact recommendations automatically
        const highImpact = this.recommendations.filter(r => r.impact === 'high');

        highImpact.forEach(rec => {
            if (rec.title === 'Add More Nodes') {
                this.addNode();
            } else if (rec.title === 'Investigate Error Sources') {
                this.addAlert('info', 'Investigation Started', 'Automated error investigation initiated');
            }
        });

        if (highImpact.length > 0) {
            this.addAlert('success', 'Recommendations Applied', `${highImpact.length} high-impact recommendations have been applied`);
        }
    }

    showNodeDetails(node) {
        this.nodeDetails.innerHTML = `
            <h4>${node.name} Details</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div>
                    <h5>Status Information</h5>
                    <p><strong>Status:</strong> <span class="${node.status}">${node.status.toUpperCase()}</span></p>
                    <p><strong>Load:</strong> ${Math.round(node.load)}%</p>
                    <p><strong>Capacity:</strong> ${node.capacity}%</p>
                    <p><strong>Weight:</strong> ${node.weight.toFixed(2)}</p>
                    <p><strong>Uptime:</strong> ${node.uptime.toFixed(1)}%</p>
                </div>
                <div>
                    <h5>Performance Metrics</h5>
                    <p><strong>Requests:</strong> ${node.requests}</p>
                    <p><strong>Errors:</strong> ${node.errors}</p>
                    <p><strong>Response Time:</strong> ${node.responseTime.toFixed(1)}ms</p>
                    <p><strong>Error Rate:</strong> ${node.requests > 0 ? ((node.errors / node.requests) * 100).toFixed(1) : 0}%</p>
                </div>
            </div>
            <div style="margin-top: 20px;">
                <h5>Recent Activity</h5>
                <p>Last health check: ${new Date().toLocaleTimeString()}</p>
                <p>Load trend: ${Math.random() > 0.5 ? 'Increasing' : 'Decreasing'}</p>
            </div>
        `;

        this.nodeModal.classList.add('active');
    }

    updateUI() {
        // Update overview metrics
        this.totalLoadEl.textContent = this.metrics.totalLoad.toLocaleString();
        this.avgResponseTimeEl.textContent = this.metrics.avgResponseTime;
        this.activeNodesEl.textContent = this.metrics.activeNodes;
        this.optimizationScoreEl.textContent = this.metrics.optimizationScore;

        // Update trends (simulate)
        this.updateTrends();

        // Update performance indicators
        const throughputPercent = Math.min(100, (this.metrics.throughput / 2500) * 100);
        const latencyPercent = Math.max(0, 100 - (this.metrics.latency - 100));
        const errorPercent = Math.min(100, this.metrics.errorRate * 10);

        this.throughputFill.style.width = `${throughputPercent}%`;
        this.latencyFill.style.width = `${latencyPercent}%`;
        this.errorFill.style.width = `${errorPercent}%`;

        this.throughputValueEl.textContent = `${this.metrics.throughput.toLocaleString()} req/min`;
        this.latencyValueEl.textContent = `${this.metrics.latency}ms avg`;
        this.errorValueEl.textContent = `${this.metrics.errorRate}%`;

        // Update traffic stats
        const totalRequests = this.requests.length;
        const successfulRequests = this.requests.filter(r => r.success).length;
        const failedRequests = totalRequests - successfulRequests;

        this.totalRequestsEl.textContent = totalRequests;
        this.successfulRequestsEl.textContent = successfulRequests;
        this.failedRequestsEl.textContent = failedRequests;

        // Update nodes and charts
        this.renderNodes();
        this.updateTrafficVisualization();
        this.updateDistributionChart();
        this.updatePerformanceChart();

        // Update recommendations
        this.generateRecommendations();
    }

    updateTrends() {
        // Simulate trend changes
        const trends = ['positive', 'negative', 'neutral'];
        const loadTrend = trends[Math.floor(Math.random() * trends.length)];
        const responseTrend = trends[Math.floor(Math.random() * trends.length)];
        const nodesTrend = 'stable';
        const optimizationTrend = trends[Math.floor(Math.random() * trends.length)];

        this.loadTrendEl.className = `metric-trend ${loadTrend}`;
        this.responseTrendEl.className = `metric-trend ${responseTrend}`;
        this.nodesTrendEl.className = `metric-trend neutral`;
        this.optimizationTrendEl.className = `metric-trend ${optimizationTrend}`;

        const loadChange = Math.abs(Math.random() * 15).toFixed(0);
        const responseChange = Math.abs(Math.random() * 10).toFixed(0);
        const optimizationChange = Math.abs(Math.random() * 5).toFixed(0);

        this.loadTrendEl.innerHTML = `<i class="fas fa-arrow-${loadTrend === 'positive' ? 'up' : loadTrend === 'negative' ? 'down' : 'right'}"></i> ${loadChange}%`;
        this.responseTrendEl.innerHTML = `<i class="fas fa-arrow-${responseTrend === 'positive' ? 'up' : responseTrend === 'negative' ? 'down' : 'right'}"></i> ${responseChange}ms`;
        this.nodesTrendEl.innerHTML = `<i class="fas fa-equals"></i> stable`;
        this.optimizationTrendEl.innerHTML = `<i class="fas fa-arrow-${optimizationTrend === 'positive' ? 'up' : optimizationTrend === 'negative' ? 'down' : 'right'}"></i> ${optimizationChange}`;
    }

    addAlert(type, title, message) {
        const alert = document.createElement('div');
        alert.className = `alert ${type}`;

        alert.innerHTML = `
            <div class="alert-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="alert-content">
                <div class="alert-title">${title}</div>
                <div class="alert-message">${message}</div>
            </div>
            <button class="alert-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add close functionality
        alert.querySelector('.alert-close').onclick = () => {
            alert.remove();
        };

        this.alertsPanel.appendChild(alert);

        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 8000);
    }
}

// Initialize the load balancing advisor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.loadBalancingAdvisor = new LoadBalancingAdvisor();
});