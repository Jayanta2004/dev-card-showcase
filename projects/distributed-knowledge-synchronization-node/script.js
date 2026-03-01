// Distributed Knowledge Synchronization Node Script

// Mock data for demonstration
const mockData = {
    metrics: {
        totalNodes: 24,
        activeSyncs: 18,
        conflictsResolved: 156,
        avgSyncTime: 2.3,
        dataTransferred: 2.8,
        uptime: 99.7
    },
    nodes: [
        { id: 'node-001', name: 'Primary Hub', status: 'synced', lastSync: '2 min ago', dataSize: '1.2 GB', connections: 8, latency: 45 },
        { id: 'node-002', name: 'Regional DC-1', status: 'syncing', lastSync: '1 min ago', dataSize: '890 MB', connections: 6, latency: 67 },
        { id: 'node-003', name: 'Regional DC-2', status: 'synced', lastSync: '5 min ago', dataSize: '1.5 GB', connections: 7, latency: 52 },
        { id: 'node-004', name: 'Edge Node A', status: 'conflict', lastSync: '10 min ago', dataSize: '234 MB', connections: 3, latency: 89 },
        { id: 'node-005', name: 'Edge Node B', status: 'offline', lastSync: '1 hour ago', dataSize: '156 MB', connections: 0, latency: 0 },
        { id: 'node-006', name: 'Backup Hub', status: 'synced', lastSync: '3 min ago', dataSize: '2.1 GB', connections: 12, latency: 38 }
    ],
    syncOperations: [
        { id: 'sync-001', type: 'Full Sync', source: 'node-001', target: 'node-002', status: 'completed', progress: 100, startTime: '14:30:15', duration: '2.3s', dataSize: '890 MB' },
        { id: 'sync-002', type: 'Incremental', source: 'node-003', target: 'node-004', status: 'in_progress', progress: 67, startTime: '14:32:45', duration: '1.8s', dataSize: '234 MB' },
        { id: 'sync-003', type: 'Conflict Resolution', source: 'node-001', target: 'node-005', status: 'failed', progress: 0, startTime: '14:28:12', duration: '0.0s', dataSize: '0 MB' },
        { id: 'sync-004', type: 'Full Sync', source: 'node-006', target: 'node-001', status: 'queued', progress: 0, startTime: '14:35:00', duration: '0.0s', dataSize: '2.1 GB' },
        { id: 'sync-005', type: 'Incremental', source: 'node-002', target: 'node-003', status: 'completed', progress: 100, startTime: '14:29:33', duration: '1.5s', dataSize: '456 MB' }
    ],
    conflicts: [
        {
            id: 'conflict-001',
            title: 'Version Conflict in User Preferences',
            severity: 'high',
            description: 'Conflicting changes detected in user preference settings between node-001 and node-004.',
            timestamp: '14:25:30',
            affectedNodes: ['node-001', 'node-004'],
            dataType: 'Configuration',
            resolution: 'pending',
            versions: {
                node001: '{"theme": "dark", "language": "en", "notifications": true}',
                node004: '{"theme": "light", "language": "en", "notifications": false}'
            }
        },
        {
            id: 'conflict-002',
            title: 'Data Inconsistency in Transaction Log',
            severity: 'medium',
            description: 'Transaction log entries differ between backup nodes.',
            timestamp: '14:20:15',
            affectedNodes: ['node-006', 'node-002'],
            dataType: 'Transaction Data',
            resolution: 'auto_resolved',
            versions: {
                node006: 'tx-12345: committed, tx-12346: pending',
                node002: 'tx-12345: committed, tx-12346: committed'
            }
        }
    ]
};

// Global variables
let syncFlowChart;
let performanceCharts = {};
let currentFilter = 'all';
let currentSort = { column: 'startTime', direction: 'desc' };

// Initialize the dashboard
function initDashboard() {
    updateMetrics();
    renderNodes();
    renderSyncOperations();
    initSyncVisualization();
    renderConflicts();
    initPerformanceCharts();
    setupEventListeners();
    startRealTimeUpdates();
}

// Update metrics display
function updateMetrics() {
    const metrics = mockData.metrics;

    // Update metric values with animation
    animateValue('total-nodes', metrics.totalNodes);
    animateValue('active-syncs', metrics.activeSyncs);
    animateValue('conflicts-resolved', metrics.conflictsResolved);
    animateValue('avg-sync-time', metrics.avgSyncTime.toFixed(1));
    animateValue('data-transferred', metrics.dataTransferred.toFixed(1));
    animateValue('uptime', metrics.uptime.toFixed(1));

    // Update trends (mock data)
    updateTrends();
}

// Animate value changes
function animateValue(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const currentValue = parseFloat(element.textContent) || 0;
    const difference = targetValue - currentValue;
    const duration = 1000; // 1 second
    const steps = 60;
    const stepValue = difference / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
        currentStep++;
        const newValue = currentValue + (stepValue * currentStep);
        element.textContent = typeof targetValue === 'string' ? newValue.toFixed(1) : Math.round(newValue);

        if (currentStep >= steps) {
            clearInterval(timer);
            element.textContent = targetValue;
        }
    }, duration / steps);
}

// Update trend indicators
function updateTrends() {
    const trends = document.querySelectorAll('.metric-trend');
    trends.forEach(trend => {
        const isPositive = Math.random() > 0.3; // Mock positive/negative trends
        trend.className = 'metric-trend ' + (isPositive ? 'positive' : 'negative');
        trend.textContent = (isPositive ? '↗' : '↘') + ' ' + (Math.random() * 5 + 1).toFixed(1) + '%';
    });
}

// Render node status cards
function renderNodes() {
    const nodeGrid = document.getElementById('node-grid');
    nodeGrid.innerHTML = '';

    mockData.nodes.forEach(node => {
        const nodeCard = document.createElement('div');
        nodeCard.className = 'node-card';
        nodeCard.innerHTML = `
            <div class="node-header">
                <div class="node-name">${node.name}</div>
                <div class="node-status-badge ${node.status}">${node.status}</div>
            </div>
            <div class="node-metrics">
                <div class="metric-item">
                    <div class="value">${node.dataSize}</div>
                    <div class="label">Data Size</div>
                </div>
                <div class="metric-item">
                    <div class="value">${node.connections}</div>
                    <div class="label">Connections</div>
                </div>
                <div class="metric-item">
                    <div class="value">${node.latency}ms</div>
                    <div class="label">Latency</div>
                </div>
                <div class="metric-item">
                    <div class="value">${node.lastSync}</div>
                    <div class="label">Last Sync</div>
                </div>
            </div>
        `;
        nodeGrid.appendChild(nodeCard);
    });
}

// Render sync operations table
function renderSyncOperations() {
    const tableBody = document.getElementById('operations-table-body');
    tableBody.innerHTML = '';

    // Filter operations
    let filteredOperations = mockData.syncOperations;
    if (currentFilter !== 'all') {
        filteredOperations = mockData.syncOperations.filter(op => op.status === currentFilter);
    }

    // Sort operations
    filteredOperations.sort((a, b) => {
        let aVal = a[currentSort.column];
        let bVal = b[currentSort.column];

        if (currentSort.column === 'progress') {
            aVal = parseInt(aVal);
            bVal = parseInt(bVal);
        }

        if (currentSort.direction === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });

    filteredOperations.forEach(operation => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${operation.id}</td>
            <td>${operation.type}</td>
            <td>${operation.source} → ${operation.target}</td>
            <td><span class="status-badge ${getStatusClass(operation.status)}">${operation.status.replace('_', ' ')}</span></td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${operation.progress}%"></div>
                </div>
                ${operation.progress}%
            </td>
            <td>${operation.startTime}</td>
            <td>${operation.duration}</td>
            <td>${operation.dataSize}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Get status class for badges
function getStatusClass(status) {
    const statusMap = {
        'completed': 'success',
        'in_progress': 'info',
        'failed': 'error',
        'queued': 'warning'
    };
    return statusMap[status] || 'info';
}

// Initialize sync flow visualization
function initSyncVisualization() {
    const canvas = document.getElementById('sync-flow-canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 800;
    canvas.height = 400;

    // Draw sync flow diagram
    drawSyncFlow(ctx);
}

// Draw sync flow diagram
function drawSyncFlow(ctx) {
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = 120;

    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw central hub
    drawNode(ctx, centerX, centerY, 'Primary Hub', '#4CAF50', true);

    // Draw connected nodes
    const nodeCount = 6;
    for (let i = 0; i < nodeCount; i++) {
        const angle = (i * 2 * Math.PI) / nodeCount;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        const node = mockData.nodes[i] || mockData.nodes[0];
        const color = getNodeColor(node.status);

        drawNode(ctx, x, y, node.name.split(' ')[0], color, false);
        drawConnection(ctx, centerX, centerY, x, y, node.status);
    }
}

// Draw a node in the visualization
function drawNode(ctx, x, y, label, color, isCentral = false) {
    const radius = isCentral ? 25 : 20;

    // Draw circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw label
    ctx.fillStyle = '#fff';
    ctx.font = isCentral ? 'bold 12px Arial' : '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y + 4);
}

// Draw connection between nodes
function drawConnection(ctx, x1, y1, x2, y2, status) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = getConnectionColor(status);
    ctx.lineWidth = 3;
    ctx.stroke();

    // Add arrow head
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowLength = 10;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - arrowLength * Math.cos(angle - Math.PI/6), y2 - arrowLength * Math.sin(angle - Math.PI/6));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - arrowLength * Math.cos(angle + Math.PI/6), y2 - arrowLength * Math.sin(angle + Math.PI/6));
    ctx.stroke();
}

// Get node color based on status
function getNodeColor(status) {
    const colorMap = {
        'synced': '#4CAF50',
        'syncing': '#2196F3',
        'conflict': '#F44336',
        'offline': '#666'
    };
    return colorMap[status] || '#666';
}

// Get connection color based on status
function getConnectionColor(status) {
    const colorMap = {
        'synced': '#4CAF50',
        'syncing': '#2196F3',
        'conflict': '#F44336',
        'offline': '#666'
    };
    return colorMap[status] || '#666';
}

// Render conflicts list
function renderConflicts() {
    const conflictsList = document.getElementById('conflicts-list');
    conflictsList.innerHTML = '';

    mockData.conflicts.forEach(conflict => {
        const conflictItem = document.createElement('div');
        conflictItem.className = 'conflict-item';
        conflictItem.onclick = () => showConflictDetails(conflict);

        conflictItem.innerHTML = `
            <div class="conflict-header">
                <div class="conflict-title">${conflict.title}</div>
                <div class="conflict-severity ${conflict.severity}">${conflict.severity}</div>
            </div>
            <div class="conflict-description">${conflict.description}</div>
            <div class="conflict-meta">
                ${conflict.timestamp} • ${conflict.affectedNodes.join(', ')} • ${conflict.dataType}
            </div>
        `;

        conflictsList.appendChild(conflictItem);
    });
}

// Show conflict details modal
function showConflictDetails(conflict) {
    const modal = document.getElementById('conflict-modal');
    const details = document.getElementById('conflict-details');

    details.innerHTML = `
        <div class="conflict-section">
            <h4>Conflict Details</h4>
            <p><strong>Title:</strong> ${conflict.title}</p>
            <p><strong>Severity:</strong> <span class="conflict-severity ${conflict.severity}">${conflict.severity}</span></p>
            <p><strong>Description:</strong> ${conflict.description}</p>
            <p><strong>Timestamp:</strong> ${conflict.timestamp}</p>
            <p><strong>Affected Nodes:</strong> ${conflict.affectedNodes.join(', ')}</p>
            <p><strong>Data Type:</strong> ${conflict.dataType}</p>
        </div>

        <div class="conflict-section">
            <h4>Version Comparison</h4>
            <div class="version-comparison">
                <div class="version-panel">
                    <h5>${conflict.affectedNodes[0]}</h5>
                    <div class="version-content">${conflict.versions.node001 || conflict.versions[conflict.affectedNodes[0].toLowerCase().replace('-', '')]}</div>
                </div>
                <div class="version-panel">
                    <h5>${conflict.affectedNodes[1]}</h5>
                    <div class="version-content">${conflict.versions.node004 || conflict.versions[conflict.affectedNodes[1].toLowerCase().replace('-', '')]}</div>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

// Initialize performance charts
function initPerformanceCharts() {
    // Sync Performance Chart
    const syncCtx = document.getElementById('sync-performance-chart').getContext('2d');
    performanceCharts.sync = new Chart(syncCtx, {
        type: 'line',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
            datasets: [{
                label: 'Sync Operations',
                data: [12, 19, 15, 25, 22, 18],
                borderColor: '#9C27B0',
                backgroundColor: 'rgba(156, 39, 176, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#b0b0b0'
                    },
                    grid: {
                        color: '#333333'
                    }
                },
                y: {
                    ticks: {
                        color: '#b0b0b0'
                    },
                    grid: {
                        color: '#333333'
                    }
                }
            }
        }
    });

    // Data Transfer Chart
    const transferCtx = document.getElementById('data-transfer-chart').getContext('2d');
    performanceCharts.transfer = new Chart(transferCtx, {
        type: 'bar',
        data: {
            labels: ['Node 1', 'Node 2', 'Node 3', 'Node 4', 'Node 5', 'Node 6'],
            datasets: [{
                label: 'Data Transferred (GB)',
                data: [1.2, 0.8, 1.5, 0.3, 0.2, 2.1],
                backgroundColor: '#673AB7',
                borderColor: '#673AB7',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#b0b0b0'
                    },
                    grid: {
                        color: '#333333'
                    }
                },
                y: {
                    ticks: {
                        color: '#b0b0b0'
                    },
                    grid: {
                        color: '#333333'
                    }
                }
            }
        }
    });

    // Latency Chart
    const latencyCtx = document.getElementById('latency-chart').getContext('2d');
    performanceCharts.latency = new Chart(latencyCtx, {
        type: 'doughnut',
        data: {
            labels: ['< 50ms', '50-100ms', '100-200ms', '> 200ms'],
            datasets: [{
                data: [45, 30, 15, 10],
                backgroundColor: [
                    '#4CAF50',
                    '#FF9800',
                    '#FF5722',
                    '#F44336'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentFilter = e.target.dataset.filter;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderSyncOperations();
        });
    });

    // Table sorting
    document.querySelectorAll('.operations-table th[data-sort]').forEach(header => {
        header.addEventListener('click', (e) => {
            const column = e.target.dataset.sort;
            if (currentSort.column === column) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.column = column;
                currentSort.direction = 'desc';
            }
            renderSyncOperations();
        });
    });

    // Modal close
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('conflict-modal').style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        const modal = document.getElementById('conflict-modal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Action buttons
    document.getElementById('resolve-conflict').addEventListener('click', () => {
        alert('Conflict resolution initiated. This would trigger the actual resolution process.');
        document.getElementById('conflict-modal').style.display = 'none';
    });

    document.getElementById('merge-conflict').addEventListener('click', () => {
        alert('Manual merge initiated. This would open a merge interface.');
    });
}

// Start real-time updates
function startRealTimeUpdates() {
    setInterval(() => {
        // Update metrics with slight variations
        mockData.metrics.activeSyncs = Math.max(0, mockData.metrics.activeSyncs + (Math.random() > 0.5 ? 1 : -1));
        mockData.metrics.conflictsResolved += Math.random() > 0.8 ? 1 : 0;
        mockData.metrics.dataTransferred += Math.random() * 0.1;

        updateMetrics();

        // Update node statuses occasionally
        if (Math.random() > 0.7) {
            const randomNode = mockData.nodes[Math.floor(Math.random() * mockData.nodes.length)];
            const statuses = ['synced', 'syncing', 'conflict', 'offline'];
            randomNode.status = statuses[Math.floor(Math.random() * statuses.length)];
            renderNodes();
            initSyncVisualization(); // Redraw visualization
        }

        // Update sync operations
        if (Math.random() > 0.8) {
            const randomOp = mockData.syncOperations[Math.floor(Math.random() * mockData.syncOperations.length)];
            if (randomOp.status === 'in_progress') {
                randomOp.progress = Math.min(100, randomOp.progress + Math.random() * 10);
                if (randomOp.progress >= 100) {
                    randomOp.status = 'completed';
                    randomOp.duration = (Math.random() * 3 + 1).toFixed(1) + 's';
                }
            }
            renderSyncOperations();
        }

        // Update charts with new data
        updateCharts();
    }, 3000); // Update every 3 seconds
}

// Update charts with new data
function updateCharts() {
    // Update sync performance chart
    const syncData = performanceCharts.sync.data.datasets[0].data;
    syncData.shift();
    syncData.push(Math.floor(Math.random() * 30 + 10));
    performanceCharts.sync.update();

    // Update data transfer chart
    const transferData = performanceCharts.transfer.data.datasets[0].data;
    transferData[Math.floor(Math.random() * transferData.length)] += Math.random() * 0.5;
    performanceCharts.transfer.update();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);