// Distributed Model Sharding - Main Application Logic
class DistributedModelSharding {
    constructor() {
        this.currentTab = 'sharding';
        this.modelConfig = {
            type: 'transformer',
            size: 175, // Billion parameters
            hiddenSize: 4096,
            numLayers: 96,
            numHeads: 128
        };
        this.shardingConfig = {
            strategy: 'tensor-parallel',
            numDevices: 8,
            tensorParallelSize: 8,
            pipelineParallelSize: 4,
            dataParallelSize: 2
        };
        this.hardwareConfig = {
            deviceMemory: 80, // GB
            interConnectBW: 600, // GB/s
            intraConnectBW: 900 // GB/s
        };
        this.simulationConfig = {
            batchSize: 32,
            seqLength: 2048,
            networkBandwidth: 100,
            gradientAccumulation: true
        };
        this.isSimulating = false;
        this.simulationData = [];
        this.charts = {};
        this.networkVisualization = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCharts();
        this.loadSavedState();
        this.renderInitialState();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Sharding controls
        document.getElementById('modelType').addEventListener('change', (e) => {
            this.modelConfig.type = e.target.value;
            this.updateModelConfig();
        });

        document.getElementById('shardingStrategy').addEventListener('change', (e) => {
            this.shardingConfig.strategy = e.target.value;
            this.updateShardingStrategy();
        });

        document.getElementById('numDevices').addEventListener('input', (e) => {
            this.shardingConfig.numDevices = parseInt(e.target.value);
            document.getElementById('numDevicesValue').textContent = e.target.value;
            this.updateDeviceGrid();
        });

        document.getElementById('modelSize').addEventListener('input', (e) => {
            this.modelConfig.size = parseInt(e.target.value);
            document.getElementById('modelSizeValue').textContent = `${e.target.value}B`;
            this.updateModelVisualization();
        });

        document.getElementById('applySharding').addEventListener('click', () => {
            this.applySharding();
        });

        // Simulation controls
        document.getElementById('runSimulation').addEventListener('click', () => {
            this.runSimulation();
        });

        document.getElementById('stopSimulation').addEventListener('click', () => {
            this.stopSimulation();
        });

        // Timeline controls
        document.getElementById('playTimeline').addEventListener('click', () => {
            this.playTimeline();
        });

        document.getElementById('pauseTimeline').addEventListener('click', () => {
            this.pauseTimeline();
        });

        document.getElementById('timelineProgress').addEventListener('input', (e) => {
            this.seekTimeline(parseFloat(e.target.value));
        });

        // Analysis controls
        document.getElementById('runAnalysis').addEventListener('click', () => {
            this.runAnalysis();
        });

        document.getElementById('exportAnalysis').addEventListener('click', () => {
            this.showExportModal();
        });

        // Optimization controls
        document.getElementById('runOptimization').addEventListener('click', () => {
            this.runOptimization();
        });

        document.getElementById('resetOptimization').addEventListener('click', () => {
            this.resetOptimization();
        });

        // Modal controls
        document.getElementById('fab').addEventListener('click', () => {
            this.showConfigModal();
        });

        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => {
                this.hideModals();
            });
        });

        document.getElementById('saveConfig').addEventListener('click', () => {
            this.saveConfig();
        });

        document.getElementById('resetConfig').addEventListener('click', () => {
            this.resetConfig();
        });

        document.getElementById('performExport').addEventListener('click', () => {
            this.performExport();
        });

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModals();
                }
            });
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;

        // Update visualizations based on tab
        if (tabName === 'sharding') {
            this.updateShardingVisualization();
        } else if (tabName === 'simulation') {
            this.updateSimulationCharts();
        } else if (tabName === 'analysis') {
            this.updateAnalysisCharts();
        } else if (tabName === 'optimization') {
            this.updateOptimizationResults();
        }
    }

    updateModelConfig() {
        const modelType = this.modelConfig.type;
        const defaults = {
            transformer: { hiddenSize: 4096, numLayers: 96, numHeads: 128 },
            cnn: { hiddenSize: 2048, numLayers: 50, numHeads: 32 },
            rnn: { hiddenSize: 1024, numLayers: 6, numHeads: 16 },
            mlp: { hiddenSize: 4096, numLayers: 20, numHeads: 64 },
            custom: { hiddenSize: 4096, numLayers: 96, numHeads: 128 }
        };

        Object.assign(this.modelConfig, defaults[modelType]);
        this.updateModelVisualization();
        this.updateShardingParams();
    }

    updateShardingStrategy() {
        const strategy = this.shardingConfig.strategy;
        const strategyConfigs = {
            'tensor-parallel': { tensorParallelSize: 8, pipelineParallelSize: 1, dataParallelSize: 1 },
            'pipeline-parallel': { tensorParallelSize: 1, pipelineParallelSize: 8, dataParallelSize: 1 },
            'zero-dp': { tensorParallelSize: 1, pipelineParallelSize: 1, dataParallelSize: 8 },
            'megatron-lm': { tensorParallelSize: 8, pipelineParallelSize: 4, dataParallelSize: 2 },
            'deepSpeed': { tensorParallelSize: 4, pipelineParallelSize: 2, dataParallelSize: 4 },
            'fairscale': { tensorParallelSize: 2, pipelineParallelSize: 4, dataParallelSize: 4 }
        };

        Object.assign(this.shardingConfig, strategyConfigs[strategy]);
        this.updateShardingVisualization();
    }

    updateDeviceGrid() {
        const deviceGrid = document.getElementById('deviceGrid');
        deviceGrid.innerHTML = '';

        for (let i = 0; i < this.shardingConfig.numDevices; i++) {
            const deviceNode = document.createElement('div');
            deviceNode.className = 'device-node';
            deviceNode.textContent = `GPU ${i + 1}`;
            deviceNode.addEventListener('click', () => this.showDeviceDetails(i));
            deviceGrid.appendChild(deviceNode);
        }
    }

    updateModelVisualization() {
        const canvas = document.getElementById('modelDiagram');
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Draw model architecture
        this.drawModelArchitecture(ctx, canvas.width, canvas.height);
    }

    drawModelArchitecture(ctx, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const layers = this.modelConfig.numLayers;
        const layerSpacing = Math.min(40, (height - 100) / layers);

        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';

        // Draw layers
        for (let i = 0; i < layers; i++) {
            const y = 50 + i * layerSpacing;
            const radius = Math.min(20, layerSpacing / 3);

            // Draw layer circle
            ctx.beginPath();
            ctx.arc(centerX, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = i === 0 ? '#10b981' : i === layers - 1 ? '#ef4444' : '#2563eb';
            ctx.fill();
            ctx.stroke();

            // Draw layer label
            ctx.fillStyle = 'white';
            ctx.fillText(`L${i + 1}`, centerX, y + 4);

            // Draw connections
            if (i > 0) {
                ctx.beginPath();
                ctx.moveTo(centerX, y - layerSpacing + radius);
                ctx.lineTo(centerX, y - radius);
                ctx.strokeStyle = '#64748b';
                ctx.stroke();
            }
        }

        // Draw model info
        ctx.fillStyle = '#1e293b';
        ctx.font = '14px Inter';
        ctx.fillText(`${this.modelConfig.type.toUpperCase()} - ${this.modelConfig.size}B params`, centerX, height - 20);
    }

    updateShardingVisualization() {
        this.updateModelVisualization();
        this.updateDeviceGrid();
        this.updateShardingDiagram();
        this.updateShardingParams();
    }

    updateShardingDiagram() {
        const container = document.getElementById('shardingDiagram');

        // Clear existing visualization
        container.innerHTML = '';

        // Create SVG for sharding visualization
        const svg = d3.select('#shardingDiagram')
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', '0 0 400 300');

        this.drawShardingDiagram(svg);
    }

    drawShardingDiagram(svg) {
        const width = 400;
        const height = 300;
        const numDevices = this.shardingConfig.numDevices;

        // Clear existing content
        svg.selectAll('*').remove();

        // Create device nodes
        const devices = [];
        for (let i = 0; i < numDevices; i++) {
            const angle = (i / numDevices) * 2 * Math.PI - Math.PI / 2;
            const radius = 80;
            devices.push({
                id: i,
                x: width / 2 + Math.cos(angle) * radius,
                y: height / 2 + Math.sin(angle) * radius,
                type: 'gpu'
            });
        }

        // Draw connections based on sharding strategy
        this.drawShardingConnections(svg, devices);

        // Draw device nodes
        const nodeGroups = svg.selectAll('.device')
            .data(devices)
            .enter()
            .append('g')
            .attr('class', 'device')
            .attr('transform', d => `translate(${d.x}, ${d.y})`);

        nodeGroups.append('circle')
            .attr('r', 20)
            .attr('fill', '#2563eb')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2);

        nodeGroups.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('fill', 'white')
            .attr('font-size', '10px')
            .text(d => `GPU${d.id + 1}`);
    }

    drawShardingConnections(svg, devices) {
        const connections = this.calculateShardingConnections(devices);

        svg.selectAll('.connection')
            .data(connections)
            .enter()
            .append('line')
            .attr('class', 'connection')
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y)
            .attr('stroke', d => d.type === 'tensor' ? '#10b981' : d.type === 'pipeline' ? '#f59e0b' : '#64748b')
            .attr('stroke-width', d => d.type === 'tensor' ? 3 : 2)
            .attr('stroke-dasharray', d => d.type === 'pipeline' ? '5,5' : 'none');
    }

    calculateShardingConnections(devices) {
        const connections = [];
        const strategy = this.shardingConfig.strategy;

        if (strategy === 'tensor-parallel') {
            // All-to-all connections for tensor parallelism
            for (let i = 0; i < devices.length; i++) {
                for (let j = i + 1; j < devices.length; j++) {
                    connections.push({
                        source: devices[i],
                        target: devices[j],
                        type: 'tensor'
                    });
                }
            }
        } else if (strategy === 'pipeline-parallel') {
            // Linear pipeline connections
            for (let i = 0; i < devices.length - 1; i++) {
                connections.push({
                    source: devices[i],
                    target: devices[i + 1],
                    type: 'pipeline'
                });
            }
        } else if (strategy === 'zero-dp') {
            // Data parallel connections
            for (let i = 0; i < devices.length; i++) {
                for (let j = i + 1; j < devices.length; j++) {
                    connections.push({
                        source: devices[i],
                        target: devices[j],
                        type: 'data'
                    });
                }
            }
        }

        return connections;
    }

    updateShardingParams() {
        const paramsList = document.getElementById('shardingParams');
        paramsList.innerHTML = '';

        const params = [
            { label: 'Strategy', value: this.shardingConfig.strategy.replace('-', ' ').toUpperCase() },
            { label: 'Devices', value: this.shardingConfig.numDevices },
            { label: 'Tensor Parallel', value: this.shardingConfig.tensorParallelSize },
            { label: 'Pipeline Parallel', value: this.shardingConfig.pipelineParallelSize },
            { label: 'Data Parallel', value: this.shardingConfig.dataParallelSize },
            { label: 'Model Size', value: `${this.modelConfig.size}B parameters` },
            { label: 'Memory per Device', value: `${this.calculateMemoryPerDevice().toFixed(1)} GB` },
            { label: 'Communication Overhead', value: `${this.calculateCommOverhead().toFixed(1)} GB/s` }
        ];

        params.forEach(param => {
            const paramItem = document.createElement('div');
            paramItem.className = 'param-item';
            paramItem.innerHTML = `
                <span class="param-label">${param.label}</span>
                <span class="param-value">${param.value}</span>
            `;
            paramsList.appendChild(paramItem);
        });

        this.updateMemoryChart();
        this.updateCommunicationChart();
    }

    calculateMemoryPerDevice() {
        const totalParams = this.modelConfig.size * 1e9; // Convert to actual number
        const bytesPerParam = 4; // 4 bytes for float32
        const totalMemoryBytes = totalParams * bytesPerParam;
        const totalMemoryGB = totalMemoryBytes / (1024 ** 3);

        // Account for sharding
        const effectiveDevices = this.shardingConfig.numDevices /
            (this.shardingConfig.tensorParallelSize * this.shardingConfig.pipelineParallelSize);

        return totalMemoryGB / effectiveDevices;
    }

    calculateCommOverhead() {
        const strategy = this.shardingConfig.strategy;
        const numDevices = this.shardingConfig.numDevices;

        let overhead = 0;
        if (strategy === 'tensor-parallel') {
            // AllReduce communication
            overhead = (numDevices - 1) / numDevices * this.hardwareConfig.interConnectBW;
        } else if (strategy === 'pipeline-parallel') {
            // Pipeline bubble overhead
            overhead = this.hardwareConfig.intraConnectBW * 0.1;
        } else if (strategy === 'zero-dp') {
            // Parameter synchronization
            overhead = numDevices * this.hardwareConfig.interConnectBW * 0.05;
        }

        return overhead;
    }

    initializeCharts() {
        // Memory distribution chart
        const memoryCtx = document.getElementById('memoryChart').getContext('2d');
        this.charts.memory = new Chart(memoryCtx, {
            type: 'doughnut',
            data: {
                labels: ['Model Parameters', 'Activations', 'Gradients', 'Optimizer State'],
                datasets: [{
                    data: [40, 30, 20, 10],
                    backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Communication chart
        const commCtx = document.getElementById('communicationChart').getContext('2d');
        this.charts.communication = new Chart(commCtx, {
            type: 'bar',
            data: {
                labels: ['AllReduce', 'AllGather', 'ReduceScatter', 'Broadcast'],
                datasets: [{
                    label: 'Bandwidth (GB/s)',
                    data: [50, 30, 40, 20],
                    backgroundColor: '#2563eb'
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

        // Throughput chart
        const throughputCtx = document.getElementById('throughputChart').getContext('2d');
        this.charts.throughput = new Chart(throughputCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Throughput (samples/s)',
                    data: [],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
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

        // Initialize other charts similarly...
        this.initializeSimulationCharts();
        this.initializeAnalysisCharts();
        this.initializeOptimizationCharts();
    }

    initializeSimulationCharts() {
        // Memory usage chart
        const memoryUsageCtx = document.getElementById('memoryUsageChart').getContext('2d');
        this.charts.memoryUsage = new Chart(memoryUsageCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Memory Usage (GB)',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
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

        // Communication time chart
        const commTimeCtx = document.getElementById('commTimeChart').getContext('2d');
        this.charts.commTime = new Chart(commTimeCtx, {
            type: 'bar',
            data: {
                labels: ['Forward', 'Backward', 'AllReduce', 'Sync'],
                datasets: [{
                    label: 'Time (ms)',
                    data: [10, 15, 5, 3],
                    backgroundColor: '#f59e0b'
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

        // Load balance chart
        const loadBalanceCtx = document.getElementById('loadBalanceChart').getContext('2d');
        this.charts.loadBalance = new Chart(loadBalanceCtx, {
            type: 'radar',
            data: {
                labels: Array.from({length: this.shardingConfig.numDevices}, (_, i) => `GPU ${i + 1}`),
                datasets: [{
                    label: 'Load Balance',
                    data: Array.from({length: this.shardingConfig.numDevices}, () => Math.random() * 100),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true
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
    }

    initializeAnalysisCharts() {
        // Scalability chart
        const scalabilityCtx = document.getElementById('scalabilityChart').getContext('2d');
        this.charts.scalability = new Chart(scalabilityCtx, {
            type: 'line',
            data: {
                labels: [1, 2, 4, 8, 16, 32, 64],
                datasets: [
                    {
                        label: 'Linear Scaling',
                        data: [1, 2, 4, 8, 16, 32, 64],
                        borderColor: '#64748b',
                        borderDash: [5, 5]
                    },
                    {
                        label: 'Actual Scaling',
                        data: [1, 1.8, 3.2, 5.8, 9.2, 14.1, 18.5],
                        borderColor: '#2563eb'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Number of Devices'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Throughput Multiplier'
                        },
                        beginAtZero: true
                    }
                }
            }
        });

        // Efficiency chart
        const efficiencyCtx = document.getElementById('efficiencyChart').getContext('2d');
        this.charts.efficiency = new Chart(efficiencyCtx, {
            type: 'bar',
            data: {
                labels: ['Tensor Parallel', 'Pipeline Parallel', 'ZeRO-DP', 'Megatron-LM'],
                datasets: [{
                    label: 'Efficiency (%)',
                    data: [85, 75, 90, 88],
                    backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444']
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

    initializeOptimizationCharts() {
        // Trade-off chart
        const tradeoffCtx = document.getElementById('tradeoffChart').getContext('2d');
        this.charts.tradeoff = new Chart(tradeoffCtx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Configurations',
                    data: [
                        { x: 10, y: 85 }, { x: 15, y: 80 }, { x: 20, y: 75 },
                        { x: 25, y: 70 }, { x: 30, y: 65 }, { x: 35, y: 60 }
                    ],
                    backgroundColor: '#2563eb'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Memory Usage (GB)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Throughput (samples/s)'
                        }
                    }
                }
            }
        });
    }

    updateMemoryChart() {
        const memoryPerDevice = this.calculateMemoryPerDevice();
        const activationMemory = memoryPerDevice * 0.3;
        const gradientMemory = memoryPerDevice * 0.2;
        const optimizerMemory = memoryPerDevice * 0.1;

        this.charts.memory.data.datasets[0].data = [
            memoryPerDevice,
            activationMemory,
            gradientMemory,
            optimizerMemory
        ];
        this.charts.memory.update();
    }

    updateCommunicationChart() {
        const commOverhead = this.calculateCommOverhead();
        this.charts.communication.data.datasets[0].data = [
            commOverhead * 0.4,
            commOverhead * 0.3,
            commOverhead * 0.2,
            commOverhead * 0.1
        ];
        this.charts.communication.update();
    }

    applySharding() {
        // Show loading state
        const button = document.getElementById('applySharding');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Applying...';
        button.disabled = true;

        // Simulate sharding application
        setTimeout(() => {
            this.updateShardingVisualization();
            this.showSuccessMessage('Sharding configuration applied successfully!');

            button.innerHTML = originalText;
            button.disabled = false;
        }, 2000);
    }

    runSimulation() {
        if (this.isSimulating) return;

        this.isSimulating = true;
        this.simulationData = [];

        const runButton = document.getElementById('runSimulation');
        const stopButton = document.getElementById('stopSimulation');

        runButton.disabled = true;
        runButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
        stopButton.disabled = false;

        this.simulationStep = 0;
        this.simulationInterval = setInterval(() => {
            this.simulationStep++;
            this.updateSimulationStep();

            if (this.simulationStep >= 100) {
                this.stopSimulation();
            }
        }, 100);
    }

    stopSimulation() {
        this.isSimulating = false;
        clearInterval(this.simulationInterval);

        const runButton = document.getElementById('runSimulation');
        const stopButton = document.getElementById('stopSimulation');

        runButton.disabled = false;
        runButton.innerHTML = '<i class="fas fa-rocket"></i> Run Simulation';
        stopButton.disabled = true;

        this.updateSimulationCharts();
        this.updateBottleneckAnalysis();
    }

    updateSimulationStep() {
        const step = this.simulationStep;
        const throughput = this.calculateThroughput(step);
        const memoryUsage = this.calculateMemoryUsage(step);
        const commTime = this.calculateCommTime(step);
        const loadBalance = this.calculateLoadBalance(step);

        this.simulationData.push({
            step,
            throughput,
            memoryUsage,
            commTime,
            loadBalance
        });

        // Update metric displays
        document.getElementById('throughputValue').textContent = throughput.toFixed(1);
        document.getElementById('memoryValue').textContent = memoryUsage.toFixed(1);
        document.getElementById('commTimeValue').textContent = commTime.toFixed(1);
        document.getElementById('loadBalanceValue').textContent = loadBalance.toFixed(1);

        // Update timeline
        document.getElementById('timelineProgress').value = step;
        document.getElementById('timelineTime').textContent = `00:${step.toString().padStart(2, '0')}`;

        // Update charts in real-time
        this.updateSimulationCharts();
    }

    calculateThroughput(step) {
        const baseThroughput = 10;
        const scalingFactor = Math.min(1, step / 50);
        const noise = (Math.random() - 0.5) * 2;
        return baseThroughput * scalingFactor + noise;
    }

    calculateMemoryUsage(step) {
        const baseMemory = 60;
        const growth = step * 0.2;
        const noise = (Math.random() - 0.5) * 5;
        return Math.min(80, baseMemory + growth + noise);
    }

    calculateCommTime(step) {
        const baseTime = 20;
        const scaling = step / 100;
        const noise = (Math.random() - 0.5) * 5;
        return Math.max(5, baseTime - scaling * 10 + noise);
    }

    calculateLoadBalance(step) {
        const baseBalance = 85;
        const improvement = step / 100 * 10;
        const noise = (Math.random() - 0.5) * 5;
        return Math.min(95, baseBalance + improvement + noise);
    }

    updateSimulationCharts() {
        if (this.simulationData.length === 0) return;

        const labels = this.simulationData.map(d => d.step);
        const throughputData = this.simulationData.map(d => d.throughput);
        const memoryData = this.simulationData.map(d => d.memoryUsage);

        this.charts.throughput.data.labels = labels;
        this.charts.throughput.data.datasets[0].data = throughputData;
        this.charts.throughput.update();

        this.charts.memoryUsage.data.labels = labels;
        this.charts.memoryUsage.data.datasets[0].data = memoryData;
        this.charts.memoryUsage.update();

        // Update load balance chart
        const loadBalanceData = Array.from({length: this.shardingConfig.numDevices},
            () => Math.random() * 20 + 80);
        this.charts.loadBalance.data.datasets[0].data = loadBalanceData;
        this.charts.loadBalance.update();
    }

    updateBottleneckAnalysis() {
        const bottleneckList = document.getElementById('bottleneckList');
        bottleneckList.innerHTML = '';

        const bottlenecks = [
            {
                severity: 'high',
                title: 'Memory Fragmentation',
                description: 'High memory fragmentation detected on GPU 3, causing 15% performance degradation.'
            },
            {
                severity: 'medium',
                title: 'Communication Latency',
                description: 'Inter-node communication latency is 2.3ms higher than expected.'
            },
            {
                severity: 'low',
                title: 'Load Imbalance',
                description: 'Minor load imbalance between pipeline stages, affecting 5% of throughput.'
            }
        ];

        bottlenecks.forEach(bottleneck => {
            const item = document.createElement('div');
            item.className = 'bottleneck-item';
            item.innerHTML = `
                <div class="bottleneck-severity ${bottleneck.severity}"></div>
                <div class="bottleneck-content">
                    <div class="bottleneck-title">${bottleneck.title}</div>
                    <div class="bottleneck-description">${bottleneck.description}</div>
                </div>
            `;
            bottleneckList.appendChild(item);
        });
    }

    runAnalysis() {
        // Show loading state
        const button = document.getElementById('runAnalysis');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        button.disabled = true;

        setTimeout(() => {
            this.updateAnalysisCharts();
            this.updateInsightsPanel();
            this.updateComparisonTable();

            button.innerHTML = originalText;
            button.disabled = false;

            this.showSuccessMessage('Analysis completed successfully!');
        }, 3000);
    }

    updateAnalysisCharts() {
        // Update scalability chart with current configuration
        const numDevices = this.shardingConfig.numDevices;
        const efficiency = this.calculateEfficiency();

        this.charts.scalability.data.datasets[1].data = this.generateScalabilityData(numDevices);
        this.charts.scalability.update();

        // Update efficiency chart
        this.charts.efficiency.data.datasets[0].data = [
            this.calculateStrategyEfficiency('tensor-parallel'),
            this.calculateStrategyEfficiency('pipeline-parallel'),
            this.calculateStrategyEfficiency('zero-dp'),
            this.calculateStrategyEfficiency('megatron-lm')
        ];
        this.charts.efficiency.update();
    }

    generateScalabilityData(numDevices) {
        const data = [];
        for (let i = 1; i <= 7; i++) {
            const devices = Math.pow(2, i - 1);
            if (devices <= numDevices) {
                const efficiency = 0.9 - (devices / 64) * 0.2; // Decreasing efficiency with scale
                data.push(devices * efficiency);
            } else {
                data.push(null);
            }
        }
        return data;
    }

    calculateStrategyEfficiency(strategy) {
        const baseEfficiency = 80;
        const strategyMultipliers = {
            'tensor-parallel': 1.1,
            'pipeline-parallel': 0.9,
            'zero-dp': 1.2,
            'megatron-lm': 1.15
        };
        return Math.min(95, baseEfficiency * strategyMultipliers[strategy]);
    }

    calculateEfficiency() {
        return this.calculateStrategyEfficiency(this.shardingConfig.strategy);
    }

    updateInsightsPanel() {
        const insightsPanel = document.getElementById('insightsPanel');
        insightsPanel.innerHTML = '';

        const insights = [
            {
                title: 'Optimal Configuration Found',
                description: `Current setup achieves ${this.calculateEfficiency().toFixed(1)}% efficiency with ${this.shardingConfig.numDevices} devices.`
            },
            {
                title: 'Memory Bottleneck Identified',
                description: 'Consider increasing device memory or using ZeRO-DP for better memory utilization.'
            },
            {
                title: 'Communication Optimization',
                description: 'Pipeline parallelism shows 10% better communication efficiency than tensor parallelism.'
            },
            {
                title: 'Scalability Analysis',
                description: `Configuration scales to ${this.shardingConfig.numDevices * 2} devices with minimal efficiency loss.`
            }
        ];

        insights.forEach(insight => {
            const item = document.createElement('div');
            item.className = 'insight-item';
            item.innerHTML = `
                <div class="insight-title">${insight.title}</div>
                <div class="insight-description">${insight.description}</div>
            `;
            insightsPanel.appendChild(item);
        });
    }

    updateComparisonTable() {
        const tableBody = document.getElementById('comparisonBody');
        tableBody.innerHTML = '';

        const strategies = ['tensor-parallel', 'pipeline-parallel', 'zero-dp', 'megatron-lm'];

        strategies.forEach(strategy => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${strategy.replace('-', ' ').toUpperCase()}</td>
                <td>${(this.calculateStrategyThroughput(strategy)).toFixed(1)}</td>
                <td>${(this.calculateStrategyMemory(strategy)).toFixed(1)}GB</td>
                <td>${(this.calculateStrategyComm(strategy)).toFixed(1)}ms</td>
                <td>${(this.calculateStrategyEfficiency(strategy)).toFixed(1)}%</td>
            `;
            tableBody.appendChild(row);
        });
    }

    calculateStrategyThroughput(strategy) {
        const baseThroughput = 15;
        const multipliers = {
            'tensor-parallel': 1.2,
            'pipeline-parallel': 0.9,
            'zero-dp': 1.1,
            'megatron-lm': 1.3
        };
        return baseThroughput * multipliers[strategy];
    }

    calculateStrategyMemory(strategy) {
        const baseMemory = 65;
        const multipliers = {
            'tensor-parallel': 0.8,
            'pipeline-parallel': 1.1,
            'zero-dp': 0.6,
            'megatron-lm': 0.7
        };
        return baseMemory * multipliers[strategy];
    }

    calculateStrategyComm(strategy) {
        const baseComm = 12;
        const multipliers = {
            'tensor-parallel': 1.5,
            'pipeline-parallel': 0.8,
            'zero-dp': 1.2,
            'megatron-lm': 1.0
        };
        return baseComm * multipliers[strategy];
    }

    runOptimization() {
        // Show loading state
        const button = document.getElementById('runOptimization');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Optimizing...';
        button.disabled = true;

        setTimeout(() => {
            this.performOptimization();
            this.updateOptimizationResults();

            button.innerHTML = originalText;
            button.disabled = false;

            this.showSuccessMessage('Optimization completed! Recommended configuration applied.');
        }, 4000);
    }

    performOptimization() {
        // Simulate optimization algorithm
        const goal = document.getElementById('optimizationGoal').value;

        if (goal === 'throughput') {
            this.shardingConfig.strategy = 'megatron-lm';
            this.shardingConfig.numDevices = Math.min(64, this.shardingConfig.numDevices * 2);
        } else if (goal === 'memory') {
            this.shardingConfig.strategy = 'zero-dp';
            this.shardingConfig.numDevices = Math.max(4, this.shardingConfig.numDevices / 2);
        } else if (goal === 'communication') {
            this.shardingConfig.strategy = 'pipeline-parallel';
        }

        this.updateShardingVisualization();
    }

    updateOptimizationResults() {
        const configPanel = document.getElementById('recommendedConfig');
        configPanel.innerHTML = '';

        const configs = [
            { label: 'Strategy', value: this.shardingConfig.strategy.replace('-', ' ').toUpperCase() },
            { label: 'Devices', value: this.shardingConfig.numDevices },
            { label: 'Tensor Parallel', value: this.shardingConfig.tensorParallelSize },
            { label: 'Pipeline Parallel', value: this.shardingConfig.pipelineParallelSize },
            { label: 'Data Parallel', value: this.shardingConfig.dataParallelSize },
            { label: 'Expected Throughput', value: `${this.calculateThroughput(100).toFixed(1)} samples/s` },
            { label: 'Memory Usage', value: `${this.calculateMemoryPerDevice().toFixed(1)} GB/device` },
            { label: 'Efficiency', value: `${this.calculateEfficiency().toFixed(1)}%` }
        ];

        configs.forEach(config => {
            const item = document.createElement('div');
            item.className = 'config-item';
            item.innerHTML = `
                <span class="config-label">${config.label}</span>
                <span class="config-value">${config.value}</span>
            `;
            configPanel.appendChild(item);
        });

        this.updateTradeoffChart();
    }

    updateTradeoffChart() {
        // Generate tradeoff data
        const tradeoffData = [];
        for (let i = 0; i < 20; i++) {
            const memory = 40 + Math.random() * 40;
            const throughput = 100 - memory * 0.5 + Math.random() * 20;
            tradeoffData.push({ x: memory, y: throughput });
        }

        this.charts.tradeoff.data.datasets[0].data = tradeoffData;
        this.charts.tradeoff.update();
    }

    resetOptimization() {
        // Reset to default configuration
        this.shardingConfig = {
            strategy: 'tensor-parallel',
            numDevices: 8,
            tensorParallelSize: 8,
            pipelineParallelSize: 1,
            dataParallelSize: 1
        };

        this.updateShardingVisualization();
        this.showSuccessMessage('Configuration reset to defaults.');
    }

    showConfigModal() {
        const modal = document.getElementById('configModal');
        modal.classList.add('show');

        // Populate form with current values
        document.getElementById('hiddenSize').value = this.modelConfig.hiddenSize;
        document.getElementById('numLayers').value = this.modelConfig.numLayers;
        document.getElementById('numHeads').value = this.modelConfig.numHeads;
        document.getElementById('tensorParallelSize').value = this.shardingConfig.tensorParallelSize;
        document.getElementById('pipelineParallelSize').value = this.shardingConfig.pipelineParallelSize;
        document.getElementById('dataParallelSize').value = this.shardingConfig.dataParallelSize;
        document.getElementById('deviceMemory').value = this.hardwareConfig.deviceMemory;
        document.getElementById('interConnectBW').value = this.hardwareConfig.interConnectBW;
        document.getElementById('intraConnectBW').value = this.hardwareConfig.intraConnectBW;
    }

    saveConfig() {
        // Update configuration from form
        this.modelConfig.hiddenSize = parseInt(document.getElementById('hiddenSize').value);
        this.modelConfig.numLayers = parseInt(document.getElementById('numLayers').value);
        this.modelConfig.numHeads = parseInt(document.getElementById('numHeads').value);
        this.shardingConfig.tensorParallelSize = parseInt(document.getElementById('tensorParallelSize').value);
        this.shardingConfig.pipelineParallelSize = parseInt(document.getElementById('pipelineParallelSize').value);
        this.shardingConfig.dataParallelSize = parseInt(document.getElementById('dataParallelSize').value);
        this.hardwareConfig.deviceMemory = parseFloat(document.getElementById('deviceMemory').value);
        this.hardwareConfig.interConnectBW = parseFloat(document.getElementById('interConnectBW').value);
        this.hardwareConfig.intraConnectBW = parseFloat(document.getElementById('intraConnectBW').value);

        this.updateShardingVisualization();
        this.hideModals();
        this.saveToLocalStorage();
        this.showSuccessMessage('Configuration saved successfully!');
    }

    resetConfig() {
        // Reset to defaults
        this.modelConfig = {
            type: 'transformer',
            size: 175,
            hiddenSize: 4096,
            numLayers: 96,
            numHeads: 128
        };
        this.shardingConfig = {
            strategy: 'tensor-parallel',
            numDevices: 8,
            tensorParallelSize: 8,
            pipelineParallelSize: 4,
            dataParallelSize: 2
        };
        this.hardwareConfig = {
            deviceMemory: 80,
            interConnectBW: 600,
            intraConnectBW: 900
        };

        this.updateShardingVisualization();
        this.hideModals();
        this.showSuccessMessage('Configuration reset to defaults.');
    }

    showExportModal() {
        document.getElementById('exportModal').classList.add('show');
    }

    performExport() {
        const format = document.getElementById('exportFormat').value;
        const includeConfig = document.getElementById('exportConfig').checked;
        const includeMetrics = document.getElementById('exportMetrics').checked;
        const includeCharts = document.getElementById('exportCharts').checked;
        const includeAnalysis = document.getElementById('exportAnalysis').checked;

        const exportData = {};

        if (includeConfig) {
            exportData.configuration = {
                model: this.modelConfig,
                sharding: this.shardingConfig,
                hardware: this.hardwareConfig
            };
        }

        if (includeMetrics) {
            exportData.metrics = {
                throughput: this.calculateThroughput(100),
                memoryUsage: this.calculateMemoryPerDevice(),
                efficiency: this.calculateEfficiency(),
                commOverhead: this.calculateCommOverhead()
            };
        }

        if (includeAnalysis) {
            exportData.analysis = {
                scalability: this.generateScalabilityData(this.shardingConfig.numDevices),
                bottlenecks: this.getBottleneckData(),
                recommendations: this.getRecommendations()
            };
        }

        if (format === 'json') {
            this.downloadFile(JSON.stringify(exportData, null, 2), 'sharding-analysis.json', 'application/json');
        } else if (format === 'csv') {
            const csv = this.convertToCSV(exportData);
            this.downloadFile(csv, 'sharding-analysis.csv', 'text/csv');
        }

        this.hideModals();
        this.showSuccessMessage('Export completed successfully!');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    convertToCSV(data) {
        // Simple CSV conversion for demonstration
        let csv = 'Key,Value\n';
        const flatten = (obj, prefix = '') => {
            for (const key in obj) {
                const value = obj[key];
                const newKey = prefix ? `${prefix}.${key}` : key;
                if (typeof value === 'object' && value !== null) {
                    flatten(value, newKey);
                } else {
                    csv += `${newKey},${value}\n`;
                }
            }
        };
        flatten(data);
        return csv;
    }

    getBottleneckData() {
        return [
            { type: 'memory', severity: 'high', description: 'Memory fragmentation on GPU 3' },
            { type: 'communication', severity: 'medium', description: 'High latency between nodes' },
            { type: 'load', severity: 'low', description: 'Minor load imbalance' }
        ];
    }

    getRecommendations() {
        return [
            'Consider using ZeRO-DP for better memory efficiency',
            'Optimize tensor parallel size based on model architecture',
            'Monitor communication patterns for bottleneck identification'
        ];
    }

    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    showDeviceDetails(deviceId) {
        // Show device details modal or tooltip
        const device = {
            id: deviceId,
            memory: this.calculateMemoryPerDevice(),
            utilization: Math.random() * 100,
            temperature: 60 + Math.random() * 20
        };

        this.showSuccessMessage(`Device ${deviceId + 1}: ${device.memory.toFixed(1)}GB memory, ${device.utilization.toFixed(1)}% utilization`);
    }

    playTimeline() {
        // Implement timeline playback
        this.showSuccessMessage('Timeline playback started');
    }

    pauseTimeline() {
        // Implement timeline pause
        this.showSuccessMessage('Timeline playback paused');
    }

    seekTimeline(progress) {
        // Implement timeline seeking
        const time = (progress / 100 * 100).toFixed(0);
        document.getElementById('timelineTime').textContent = `00:${time.padStart(2, '0')}`;
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Remove existing messages
        document.querySelectorAll('.message').forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    saveToLocalStorage() {
        const state = {
            modelConfig: this.modelConfig,
            shardingConfig: this.shardingConfig,
            hardwareConfig: this.hardwareConfig,
            simulationConfig: this.simulationConfig
        };
        localStorage.setItem('distributedModelSharding', JSON.stringify(state));
    }

    loadSavedState() {
        const saved = localStorage.getItem('distributedModelSharding');
        if (saved) {
            const state = JSON.parse(saved);
            Object.assign(this.modelConfig, state.modelConfig);
            Object.assign(this.shardingConfig, state.shardingConfig);
            Object.assign(this.hardwareConfig, state.hardwareConfig);
            Object.assign(this.simulationConfig, state.simulationConfig);
        }
    }

    renderInitialState() {
        this.updateModelVisualization();
        this.updateDeviceGrid();
        this.updateShardingVisualization();
        this.updateShardingParams();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DistributedModelSharding();
});