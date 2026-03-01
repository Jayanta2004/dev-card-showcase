// Conversation Flow Optimizer - Interactive JavaScript Implementation

class ConversationFlowOptimizer {
    constructor() {
        this.conversationNodes = this.generateSampleFlow();
        this.conversationHistory = this.generateSampleHistory();
        this.optimizationWeights = {
            efficiency: 0.40,
            clarity: 0.35,
            engagement: 0.25
        };
        this.complexityThreshold = 5;
        this.currentSimulation = [];
        this.flowView = 'tree';
        this.showLabels = true;
        this.zoom = 1;
        this.panOffset = { x: 0, y: 0 };
        this.selectedNode = null;
        this.charts = {};
        this.intervals = {};
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.initializeCharts();
        this.updateDisplay();
        this.startRealTimeUpdates();
        this.drawFlow();
    }

    generateSampleFlow() {
        return [
            {
                id: 1,
                type: 'message',
                content: 'Hello! How can I help you today?',
                label: 'Greeting',
                position: { x: 400, y: 50 },
                connections: [2, 3, 4]
            },
            {
                id: 2,
                type: 'question',
                content: 'Are you looking for product information?',
                label: 'Product Inquiry',
                position: { x: 200, y: 150 },
                connections: [5, 6]
            },
            {
                id: 3,
                type: 'question',
                content: 'Do you need technical support?',
                label: 'Support Request',
                position: { x: 400, y: 150 },
                connections: [7, 8]
            },
            {
                id: 4,
                type: 'question',
                content: 'Would you like to speak with a representative?',
                label: 'Human Transfer',
                position: { x: 600, y: 150 },
                connections: [9]
            },
            {
                id: 5,
                type: 'message',
                content: 'Great! Let me show you our product catalog.',
                label: 'Product Info',
                position: { x: 100, y: 250 },
                connections: []
            },
            {
                id: 6,
                type: 'message',
                content: 'I can help you find what you need. What are you looking for?',
                label: 'Follow-up',
                position: { x: 300, y: 250 },
                connections: []
            },
            {
                id: 7,
                type: 'action',
                content: 'Transferring to technical support...',
                label: 'Tech Support',
                position: { x: 350, y: 250 },
                connections: []
            },
            {
                id: 8,
                type: 'message',
                content: 'Let me check our knowledge base for your issue.',
                label: 'KB Search',
                position: { x: 450, y: 250 },
                connections: []
            },
            {
                id: 9,
                type: 'action',
                content: 'Connecting you with a representative now.',
                label: 'Transfer Complete',
                position: { x: 600, y: 250 },
                connections: []
            }
        ];
    }

    generateSampleHistory() {
        const conversations = [];
        for (let i = 0; i < 50; i++) {
            conversations.push({
                id: i + 1,
                path: this.generateRandomPath(),
                duration: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
                success: Math.random() > 0.2, // 80% success rate
                turns: Math.floor(Math.random() * 8) + 2, // 2-10 turns
                timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
            });
        }
        return conversations;
    }

    generateRandomPath() {
        const paths = [
            [1, 2, 5],
            [1, 2, 6],
            [1, 3, 7],
            [1, 3, 8],
            [1, 4, 9],
            [1, 2, 6, 3, 8], // More complex path
            [1, 3, 7, 2, 5]  // Complex path
        ];
        return paths[Math.floor(Math.random() * paths.length)];
    }

    setupEventListeners() {
        // Weight sliders
        ['efficiency', 'clarity', 'engagement'].forEach(param => {
            const slider = document.getElementById(`${param}-weight`);
            const value = document.getElementById(`${param}-value`);

            slider.addEventListener('input', (e) => {
                const newValue = parseInt(e.target.value);
                value.textContent = `${newValue}%`;
                this.optimizationWeights[param] = newValue / 100;
                this.updateWeightsDisplay();
                this.recalculateOptimization();
            });
        });

        // Complexity threshold
        document.getElementById('complexity-threshold').addEventListener('input', (e) => {
            this.complexityThreshold = parseInt(e.target.value);
            document.getElementById('complexity-value').textContent = e.target.value;
            this.recalculateOptimization();
        });

        // Control buttons
        document.getElementById('run-optimization').addEventListener('click', () => {
            this.runOptimization();
        });

        document.getElementById('auto-optimize').addEventListener('click', () => {
            this.autoOptimize();
        });

        document.getElementById('reset-controls').addEventListener('click', () => {
            this.resetControls();
        });

        document.getElementById('refresh-overview').addEventListener('click', () => {
            this.refreshOverview();
        });

        // Flow controls
        document.getElementById('flow-view').addEventListener('change', (e) => {
            this.flowView = e.target.value;
            this.drawFlow();
        });

        document.getElementById('reset-flow').addEventListener('click', () => {
            this.resetFlowView();
        });

        document.getElementById('zoom-in').addEventListener('click', () => {
            this.zoom = Math.min(2, this.zoom + 0.2);
            this.drawFlow();
        });

        document.getElementById('zoom-out').addEventListener('click', () => {
            this.zoom = Math.max(0.5, this.zoom - 0.2);
            this.drawFlow();
        });

        document.getElementById('fit-view').addEventListener('click', () => {
            this.fitView();
        });

        document.getElementById('toggle-labels').addEventListener('click', () => {
            this.showLabels = !this.showLabels;
            this.drawFlow();
        });

        // Analysis period
        document.getElementById('analysis-period').addEventListener('change', (e) => {
            this.updatePatternAnalysis(e.target.value);
        });

        // Simulator controls
        document.getElementById('start-simulation').addEventListener('click', () => {
            this.startSimulation();
        });

        document.getElementById('reset-simulation').addEventListener('click', () => {
            this.resetSimulation();
        });

        document.getElementById('send-message').addEventListener('click', () => {
            this.sendUserMessage();
        });

        document.getElementById('user-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendUserMessage();
            }
        });

        // Simulation options
        document.getElementById('auto-respond').addEventListener('change', (e) => {
            this.autoRespond = e.target.checked;
        });

        document.getElementById('show-suggestions').addEventListener('change', (e) => {
            this.showSuggestions = e.target.checked;
        });

        // Suggestions
        document.getElementById('apply-suggestions').addEventListener('click', () => {
            this.applySuggestions();
        });

        // Editor
        document.getElementById('add-node').addEventListener('click', () => {
            this.showAddNodeModal();
        });

        document.getElementById('save-flow').addEventListener('click', () => {
            this.saveFlow();
        });

        // Node palette
        document.querySelectorAll('.palette-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectNodeType(item.dataset.type);
            });
        });

        // Add node modal
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideAddNodeModal();
        });

        document.getElementById('cancel-add').addEventListener('click', () => {
            this.hideAddNodeModal();
        });

        document.getElementById('add-node-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNode();
        });

        // Canvas interaction
        const canvas = document.getElementById('flow-canvas');
        canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        canvas.addEventListener('mouseup', () => this.handleMouseUp());
        canvas.addEventListener('wheel', (e) => this.handleWheel(e));
    }

    initializeCharts() {
        this.initializeEfficiencyChart();
        this.initializeEngagementChart();
    }

    initializeEfficiencyChart() {
        const canvas = document.getElementById('efficiency-chart');
        const ctx = canvas.getContext('2d');
        this.charts.efficiency = { canvas, ctx };

        this.drawEfficiencyChart();
    }

    initializeEngagementChart() {
        const canvas = document.getElementById('engagement-chart');
        const ctx = canvas.getContext('2d');
        this.charts.engagement = { canvas, ctx };

        this.drawEngagementChart();
    }

    drawEfficiencyChart() {
        const { ctx, canvas } = this.charts.efficiency;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Generate efficiency data
        const dataPoints = 7;
        const data = [];
        for (let i = 0; i < dataPoints; i++) {
            data.push({
                x: (width / (dataPoints - 1)) * i,
                y: height - (Math.random() * 0.4 + 0.4) * height // Random values between 40-80%
            });
        }

        // Draw line
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(data[0].x, data[0].y);

        data.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();

        // Draw points
        ctx.fillStyle = '#10b981';
        data.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawEngagementChart() {
        const { ctx, canvas } = this.charts.engagement;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Generate engagement data
        const dataPoints = 7;
        const data = [];
        for (let i = 0; i < dataPoints; i++) {
            data.push({
                x: (width / (dataPoints - 1)) * i,
                y: height - (Math.random() * 0.3 + 0.5) * height // Random values between 50-80%
            });
        }

        // Draw line
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(data[0].x, data[0].y);

        data.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();

        // Draw points
        ctx.fillStyle = '#f59e0b';
        data.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawFlow() {
        const canvas = document.getElementById('flow-canvas');
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Apply zoom and pan
        ctx.save();
        ctx.translate(this.panOffset.x, this.panOffset.y);
        ctx.scale(this.zoom, this.zoom);

        // Draw connections first
        this.drawConnections(ctx);

        // Draw nodes
        this.conversationNodes.forEach(node => {
            this.drawNode(ctx, node);
        });

        ctx.restore();
    }

    drawConnections(ctx) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;

        this.conversationNodes.forEach(node => {
            node.connections.forEach(targetId => {
                const targetNode = this.conversationNodes.find(n => n.id === targetId);
                if (targetNode) {
                    ctx.beginPath();
                    ctx.moveTo(node.position.x + 50, node.position.y + 25);
                    ctx.lineTo(targetNode.position.x + 50, targetNode.position.y + 25);
                    ctx.stroke();

                    // Draw arrow
                    const angle = Math.atan2(
                        targetNode.position.y - node.position.y,
                        targetNode.position.x - node.position.x
                    );
                    const arrowLength = 10;
                    ctx.beginPath();
                    ctx.moveTo(targetNode.position.x + 50, targetNode.position.y + 25);
                    ctx.lineTo(
                        targetNode.position.x + 50 - arrowLength * Math.cos(angle - Math.PI / 6),
                        targetNode.position.y + 25 - arrowLength * Math.sin(angle - Math.PI / 6)
                    );
                    ctx.moveTo(targetNode.position.x + 50, targetNode.position.y + 25);
                    ctx.lineTo(
                        targetNode.position.x + 50 - arrowLength * Math.cos(angle + Math.PI / 6),
                        targetNode.position.y + 25 - arrowLength * Math.sin(angle + Math.PI / 6)
                    );
                    ctx.stroke();
                }
            });
        });
    }

    drawNode(ctx, node) {
        const { x, y } = node.position;
        const width = 100;
        const height = 50;

        // Node background
        const colors = {
            message: '#6366f1',
            question: '#06b6d4',
            condition: '#f59e0b',
            action: '#10b981'
        };

        ctx.fillStyle = colors[node.type] || '#64748b';
        ctx.fillRect(x, y, width, height);

        // Node border
        ctx.strokeStyle = this.selectedNode === node.id ? '#ffffff' : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = this.selectedNode === node.id ? 3 : 1;
        ctx.strokeRect(x, y, width, height);

        // Node content
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';

        if (this.showLabels && node.label) {
            ctx.fillText(node.label, x + width / 2, y + 20);
        } else {
            const shortContent = node.content.length > 15 ?
                node.content.substring(0, 15) + '...' : node.content;
            ctx.fillText(shortContent, x + width / 2, y + 20);
        }

        // Node type icon
        const icons = {
            message: '💬',
            question: '❓',
            condition: '🔀',
            action: '⚡'
        };

        ctx.font = '12px Arial';
        ctx.fillText(icons[node.type] || '📝', x + 15, y + 15);
    }

    updateDisplay() {
        this.updateOverviewStats();
        this.updatePatternAnalysis('24h');
        this.updateSuggestions();
        this.updateAnalytics();
    }

    updateOverviewStats() {
        const totalConversations = this.conversationHistory.length;
        const avgTurns = this.conversationHistory.reduce((sum, conv) => sum + conv.turns, 0) / totalConversations;
        const optimizationScore = this.calculateOptimizationScore();
        const successRate = (this.conversationHistory.filter(conv => conv.success).length / totalConversations) * 100;

        document.getElementById('total-conversations').textContent = totalConversations;
        document.getElementById('avg-turns').textContent = avgTurns.toFixed(1);
        document.getElementById('optimization-score').textContent = `${optimizationScore.toFixed(1)}%`;
        document.getElementById('success-rate').textContent = `${successRate.toFixed(1)}%`;

        // Update trends (simulated)
        this.updateTrends();
    }

    updateTrends() {
        const trends = ['conversations-trend', 'turns-trend', 'score-trend', 'success-trend'];
        trends.forEach(trendId => {
            const trend = Math.random() > 0.5 ? 'up' : 'down';
            const percent = Math.floor(Math.random() * 20) + 1;
            const element = document.getElementById(trendId);
            element.innerHTML = `<i class="fas fa-arrow-${trend}"></i> ${percent}%`;
            element.className = `stat-trend ${trend === 'up' ? 'positive' : 'negative'}`;
        });
    }

    calculateOptimizationScore() {
        // Calculate based on various factors
        const efficiency = this.calculateEfficiency();
        const clarity = this.calculateClarity();
        const engagement = this.calculateEngagement();

        return (
            this.optimizationWeights.efficiency * efficiency +
            this.optimizationWeights.clarity * clarity +
            this.optimizationWeights.engagement * engagement
        ) * 100;
    }

    calculateEfficiency() {
        const avgTurns = this.conversationHistory.reduce((sum, conv) => sum + conv.turns, 0) / this.conversationHistory.length;
        // Lower turns = higher efficiency (ideal is 3-5 turns)
        return Math.max(0, 1 - Math.abs(avgTurns - 4) / 4);
    }

    calculateClarity() {
        // Simulate clarity based on dead ends and loops
        const deadEnds = this.conversationNodes.filter(node => node.connections.length === 0).length;
        const totalNodes = this.conversationNodes.length;
        return 1 - (deadEnds / totalNodes);
    }

    calculateEngagement() {
        const successRate = this.conversationHistory.filter(conv => conv.success).length / this.conversationHistory.length;
        return successRate;
    }

    updatePatternAnalysis(period) {
        // Filter conversations by period
        const now = new Date();
        const periodHours = period === '1h' ? 1 : period === '24h' ? 24 : period === '7d' ? 168 : 720;
        const filteredConversations = this.conversationHistory.filter(conv => {
            const hoursDiff = (now - conv.timestamp) / (1000 * 60 * 60);
            return hoursDiff <= periodHours;
        });

        // Calculate patterns
        const pathCounts = {};
        filteredConversations.forEach(conv => {
            const pathKey = conv.path.join('-');
            pathCounts[pathKey] = (pathCounts[pathKey] || 0) + 1;
        });

        const sortedPaths = Object.entries(pathCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        // Update metrics
        document.getElementById('common-paths').textContent = sortedPaths.length;
        document.getElementById('dead-ends').textContent = this.conversationNodes.filter(node => node.connections.length === 0).length;

        const loops = this.conversationHistory.filter(conv => conv.path.length > conv.path.filter((id, index) => conv.path.indexOf(id) === index).length).length;
        document.getElementById('loop-frequency').textContent = `${((loops / filteredConversations.length) * 100).toFixed(1)}%`;

        const branchEfficiency = this.calculateBranchEfficiency();
        document.getElementById('branch-efficiency').textContent = `${branchEfficiency.toFixed(1)}%`;

        // Update top patterns
        this.updateTopPatterns(sortedPaths);
    }

    calculateBranchEfficiency() {
        const totalConnections = this.conversationNodes.reduce((sum, node) => sum + node.connections.length, 0);
        const totalNodes = this.conversationNodes.length;
        return Math.min(100, (totalConnections / totalNodes) * 25); // Ideal: 3-4 connections per node
    }

    updateTopPatterns(sortedPaths) {
        const container = document.getElementById('top-patterns');
        container.innerHTML = '';

        sortedPaths.forEach(([pathKey, count]) => {
            const path = pathKey.split('-').map(id => {
                const node = this.conversationNodes.find(n => n.id === parseInt(id));
                return node ? node.label || node.type : id;
            }).join(' → ');

            const item = document.createElement('div');
            item.className = 'pattern-item';
            item.innerHTML = `
                <div class="pattern-path">${path}</div>
                <div class="pattern-frequency">${count} times</div>
            `;
            container.appendChild(item);
        });
    }

    updateSuggestions() {
        const suggestions = this.generateSuggestions();
        const container = document.getElementById('suggestions-list');
        container.innerHTML = '';

        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `
                <div class="suggestion-header">
                    <div class="suggestion-title">${suggestion.title}</div>
                    <div class="suggestion-impact ${suggestion.impact}">${suggestion.impact}</div>
                </div>
                <div class="suggestion-description">${suggestion.description}</div>
                <div class="suggestion-actions">
                    <button class="btn-secondary btn-small" onclick="this.applySuggestion('${suggestion.id}')">Apply</button>
                </div>
            `;
            container.appendChild(item);
        });
    }

    generateSuggestions() {
        const suggestions = [];

        // Check for dead ends
        const deadEnds = this.conversationNodes.filter(node => node.connections.length === 0);
        if (deadEnds.length > 0) {
            suggestions.push({
                id: 'reduce-dead-ends',
                title: 'Reduce Dead End Nodes',
                description: `Found ${deadEnds.length} nodes with no outgoing connections. Consider adding follow-up options.`,
                impact: 'high'
            });
        }

        // Check for complex paths
        const complexPaths = this.conversationHistory.filter(conv => conv.turns > this.complexityThreshold);
        if (complexPaths.length > this.conversationHistory.length * 0.2) {
            suggestions.push({
                id: 'simplify-paths',
                title: 'Simplify Complex Conversation Paths',
                description: `${complexPaths.length} conversations exceeded ${this.complexityThreshold} turns. Consider streamlining the flow.`,
                impact: 'medium'
            });
        }

        // Check for low success rate paths
        const lowSuccessPaths = this.conversationHistory.filter(conv => !conv.success && conv.turns > 3);
        if (lowSuccessPaths.length > 0) {
            suggestions.push({
                id: 'improve-success-rates',
                title: 'Improve Success Rates for Long Conversations',
                description: `${lowSuccessPaths.length} long conversations failed. Review and optimize these paths.`,
                impact: 'high'
            });
        }

        // Check for underutilized branches
        const connectionCounts = {};
        this.conversationHistory.forEach(conv => {
            conv.path.forEach(nodeId => {
                connectionCounts[nodeId] = (connectionCounts[nodeId] || 0) + 1;
            });
        });

        const underutilized = Object.entries(connectionCounts)
            .filter(([, count]) => count < this.conversationHistory.length * 0.1)
            .map(([nodeId]) => parseInt(nodeId));

        if (underutilized.length > 0) {
            suggestions.push({
                id: 'optimize-branches',
                title: 'Optimize Underutilized Conversation Branches',
                description: `${underutilized.length} nodes are rarely used. Consider promoting or removing them.`,
                impact: 'medium'
            });
        }

        return suggestions;
    }

    updateAnalytics() {
        // Update response time (simulated)
        const responseTime = (Math.random() * 0.5 + 0.8).toFixed(1); // 0.8-1.3 seconds
        document.getElementById('response-time').textContent = `${responseTime}s`;

        // Update user satisfaction (simulated)
        const satisfaction = Math.floor(Math.random() * 20) + 80; // 80-100%
        document.getElementById('user-satisfaction').textContent = `${satisfaction}%`;

        // Update completion rate (simulated)
        const completion = Math.floor(Math.random() * 15) + 80; // 80-95%
        document.getElementById('completion-rate').textContent = `${completion}%`;

        this.drawEfficiencyChart();
        this.drawEngagementChart();
    }

    updateWeightsDisplay() {
        ['efficiency', 'clarity', 'engagement'].forEach(param => {
            const value = this.optimizationWeights[param] * 100;
            document.getElementById(`${param}-value`).textContent = `${value.toFixed(0)}%`;
        });
    }

    recalculateOptimization() {
        this.updateOverviewStats();
        this.updateSuggestions();
    }

    runOptimization() {
        const btn = document.getElementById('run-optimization');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Optimizing...';
        btn.disabled = true;

        setTimeout(() => {
            // Simulate optimization process
            this.optimizeFlow();
            this.recalculateOptimization();
            btn.innerHTML = originalText;
            btn.disabled = false;
            this.showNotification('Optimization completed successfully!', 'success');
        }, 3000);
    }

    optimizeFlow() {
        // Simple optimization: remove redundant connections and add missing ones
        this.conversationNodes.forEach(node => {
            if (node.connections.length === 0 && node.type !== 'action') {
                // Add a default connection to a generic response
                const genericNode = this.conversationNodes.find(n => n.type === 'message' && n.label === 'Follow-up');
                if (genericNode) {
                    node.connections.push(genericNode.id);
                }
            }
        });

        this.drawFlow();
    }

    autoOptimize() {
        // Auto-adjust weights based on current performance
        const efficiency = this.calculateEfficiency();
        const clarity = this.calculateClarity();
        const engagement = this.calculateEngagement();

        // Boost the lowest performing metric
        const metrics = { efficiency, clarity, engagement };
        const lowestMetric = Object.keys(metrics).reduce((a, b) =>
            metrics[a] < metrics[b] ? a : b
        );

        this.optimizationWeights[lowestMetric] = Math.min(0.5, this.optimizationWeights[lowestMetric] + 0.1);

        // Balance other weights
        const totalWeight = Object.values(this.optimizationWeights).reduce((sum, w) => sum + w, 0);
        Object.keys(this.optimizationWeights).forEach(key => {
            this.optimizationWeights[key] = this.optimizationWeights[key] / totalWeight;
        });

        this.updateWeightsDisplay();
        this.recalculateOptimization();
        this.showNotification('Auto-optimization completed!', 'success');
    }

    resetControls() {
        if (confirm('Reset all optimization controls to default values?')) {
            this.optimizationWeights = {
                efficiency: 0.40,
                clarity: 0.35,
                engagement: 0.25
            };
            this.complexityThreshold = 5;

            this.updateWeightsDisplay();
            document.getElementById('complexity-threshold').value = 5;
            document.getElementById('complexity-value').textContent = '5';

            this.recalculateOptimization();
            this.showNotification('Controls reset to defaults!', 'info');
        }
    }

    refreshOverview() {
        const btn = document.getElementById('refresh-overview');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        btn.disabled = true;

        setTimeout(() => {
            this.updateOverviewStats();
            this.updateAnalytics();
            btn.innerHTML = originalText;
            btn.disabled = false;
            this.showNotification('Overview refreshed!', 'success');
        }, 1500);
    }

    resetFlowView() {
        this.zoom = 1;
        this.panOffset = { x: 0, y: 0 };
        this.selectedNode = null;
        this.drawFlow();
    }

    fitView() {
        const canvas = document.getElementById('flow-canvas');
        const padding = 50;

        if (this.conversationNodes.length === 0) return;

        const minX = Math.min(...this.conversationNodes.map(n => n.position.x));
        const maxX = Math.max(...this.conversationNodes.map(n => n.position.x + 100));
        const minY = Math.min(...this.conversationNodes.map(n => n.position.y));
        const maxY = Math.max(...this.conversationNodes.map(n => n.position.y + 50));

        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;

        const scaleX = (canvas.width - padding * 2) / contentWidth;
        const scaleY = (canvas.height - padding * 2) / contentHeight;
        this.zoom = Math.min(scaleX, scaleY, 1);

        this.panOffset.x = padding - minX * this.zoom;
        this.panOffset.y = padding - minY * this.zoom;

        this.drawFlow();
    }

    startSimulation() {
        this.currentSimulation = [];
        this.resetSimulationDisplay();
        this.addBotMessage('Hello! How can I help you today?');
        this.enableUserInput();
        this.showNotification('Conversation simulation started!', 'info');
    }

    resetSimulation() {
        this.currentSimulation = [];
        this.resetSimulationDisplay();
        this.disableUserInput();
        this.showNotification('Simulation reset!', 'info');
    }

    resetSimulationDisplay() {
        document.getElementById('conversation-display').innerHTML = '';
    }

    addBotMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        messageDiv.textContent = message;
        document.getElementById('conversation-display').appendChild(messageDiv);
        this.scrollToBottom();
    }

    addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.textContent = message;
        document.getElementById('conversation-display').appendChild(messageDiv);
        this.scrollToBottom();
    }

    addSuggestionMessage(suggestion) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message suggestion';
        messageDiv.textContent = `💡 ${suggestion}`;
        document.getElementById('conversation-display').appendChild(messageDiv);
        this.scrollToBottom();
    }

    scrollToBottom() {
        const display = document.getElementById('conversation-display');
        display.scrollTop = display.scrollHeight;
    }

    enableUserInput() {
        document.getElementById('user-input').disabled = false;
        document.getElementById('send-message').disabled = false;
    }

    disableUserInput() {
        document.getElementById('user-input').disabled = true;
        document.getElementById('send-message').disabled = true;
    }

    sendUserMessage() {
        const input = document.getElementById('user-input');
        const message = input.value.trim();

        if (!message) return;

        this.addUserMessage(message);
        input.value = '';

        // Simulate bot response
        setTimeout(() => {
            this.generateBotResponse(message);
        }, 1000);
    }

    generateBotResponse(userMessage) {
        // Simple response generation based on keywords
        const responses = {
            'product': 'Let me show you our product catalog.',
            'support': 'I can help you with technical support.',
            'help': 'I\'m here to assist you with any questions.',
            'price': 'Let me check our pricing information.',
            'contact': 'Would you like to speak with a representative?'
        };

        let response = 'I understand. Let me help you with that.';
        const lowerMessage = userMessage.toLowerCase();

        for (const [keyword, reply] of Object.entries(responses)) {
            if (lowerMessage.includes(keyword)) {
                response = reply;
                break;
            }
        }

        this.addBotMessage(response);

        // Add suggestions if enabled
        if (document.getElementById('show-suggestions').checked) {
            setTimeout(() => {
                this.addSuggestionMessage('Try asking about our products or services');
            }, 500);
        }
    }

    applySuggestions() {
        // Apply all high-impact suggestions
        const highImpactSuggestions = this.generateSuggestions().filter(s => s.impact === 'high');
        highImpactSuggestions.forEach(suggestion => {
            this.applySuggestion(suggestion.id);
        });
        this.showNotification('High-impact suggestions applied!', 'success');
    }

    applySuggestion(suggestionId) {
        // Apply individual suggestion
        switch (suggestionId) {
            case 'reduce-dead-ends':
                this.optimizeFlow();
                break;
            case 'simplify-paths':
                this.complexityThreshold = Math.max(3, this.complexityThreshold - 1);
                document.getElementById('complexity-threshold').value = this.complexityThreshold;
                document.getElementById('complexity-value').textContent = this.complexityThreshold;
                break;
            // Add more suggestion implementations as needed
        }
        this.recalculateOptimization();
    }

    showAddNodeModal() {
        document.getElementById('add-node-modal').classList.add('show');
    }

    hideAddNodeModal() {
        document.getElementById('add-node-modal').classList.remove('show');
        document.getElementById('add-node-form').reset();
    }

    selectNodeType(type) {
        document.getElementById('node-type').value = type;
        this.showAddNodeModal();
    }

    addNode() {
        const formData = new FormData(document.getElementById('add-node-form'));
        const newNode = {
            id: Math.max(...this.conversationNodes.map(n => n.id)) + 1,
            type: formData.get('node-type'),
            content: formData.get('node-content'),
            label: formData.get('node-label') || '',
            position: {
                x: Math.random() * 400 + 200,
                y: Math.random() * 200 + 100
            },
            connections: []
        };

        this.conversationNodes.push(newNode);
        this.hideAddNodeModal();
        this.drawFlow();
        this.showNotification('Node added successfully!', 'success');
    }

    saveFlow() {
        // Simulate saving the flow
        const flowData = {
            nodes: this.conversationNodes,
            timestamp: new Date().toISOString()
        };

        console.log('Flow saved:', flowData);
        this.showNotification('Flow saved successfully!', 'success');
    }

    handleMouseDown(e) {
        const rect = e.target.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.panOffset.x) / this.zoom;
        const y = (e.clientY - rect.top - this.panOffset.y) / this.zoom;

        // Check if clicking on a node
        const clickedNode = this.conversationNodes.find(node => {
            return x >= node.position.x && x <= node.position.x + 100 &&
                   y >= node.position.y && y <= node.position.y + 50;
        });

        if (clickedNode) {
            this.selectedNode = clickedNode.id;
            this.isDragging = true;
            this.dragOffset = {
                x: x - clickedNode.position.x,
                y: y - clickedNode.position.y
            };
            this.drawFlow();
            this.showNodeProperties(clickedNode);
        } else {
            this.selectedNode = null;
            this.isPanning = true;
            this.lastMousePos = { x: e.clientX, y: e.clientY };
            this.drawFlow();
        }
    }

    handleMouseMove(e) {
        if (this.isDragging && this.selectedNode) {
            const rect = e.target.getBoundingClientRect();
            const x = (e.clientX - rect.left - this.panOffset.x) / this.zoom;
            const y = (e.clientY - rect.top - this.panOffset.y) / this.zoom;

            const node = this.conversationNodes.find(n => n.id === this.selectedNode);
            if (node) {
                node.position.x = x - this.dragOffset.x;
                node.position.y = y - this.dragOffset.y;
                this.drawFlow();
            }
        } else if (this.isPanning) {
            const deltaX = e.clientX - this.lastMousePos.x;
            const deltaY = e.clientY - this.lastMousePos.y;

            this.panOffset.x += deltaX;
            this.panOffset.y += deltaY;

            this.lastMousePos = { x: e.clientX, y: e.clientY };
            this.drawFlow();
        }
    }

    handleMouseUp() {
        this.isDragging = false;
        this.isPanning = false;
    }

    handleWheel(e) {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom = Math.max(0.1, Math.min(3, this.zoom * zoomFactor));
        this.drawFlow();
    }

    showNodeProperties(node) {
        const container = document.getElementById('properties-panel');
        container.innerHTML = `
            <h4>Properties</h4>
            <div class="properties-content">
                <div class="property-group">
                    <label>Type:</label>
                    <span>${node.type}</span>
                </div>
                <div class="property-group">
                    <label>Label:</label>
                    <span>${node.label || 'None'}</span>
                </div>
                <div class="property-group">
                    <label>Content:</label>
                    <span>${node.content}</span>
                </div>
                <div class="property-group">
                    <label>Connections:</label>
                    <span>${node.connections.length}</span>
                </div>
                <div class="property-group">
                    <label>Position:</label>
                    <span>(${Math.round(node.position.x)}, ${Math.round(node.position.y)})</span>
                </div>
            </div>
        `;
    }

    startRealTimeUpdates() {
        // Update last update time
        this.intervals.updateTime = setInterval(() => {
            document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
        }, 60000);

        // Simulate real-time conversation activity
        this.intervals.conversationActivity = setInterval(() => {
            // Randomly add new conversation data
            if (Math.random() > 0.8) {
                const newConversation = {
                    id: this.conversationHistory.length + 1,
                    path: this.generateRandomPath(),
                    duration: Math.floor(Math.random() * 300) + 30,
                    success: Math.random() > 0.2,
                    turns: Math.floor(Math.random() * 8) + 2,
                    timestamp: new Date()
                };

                this.conversationHistory.push(newConversation);
                this.updateOverviewStats();
            }
        }, 10000); // Update every 10 seconds
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

// Initialize the optimizer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.conversationOptimizer = new ConversationFlowOptimizer();
});