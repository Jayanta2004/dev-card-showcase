// High-Availability Redundancy Mesh JavaScript

// Mock data for nodes
const nodes = [
    { id: 1, name: 'Node-01', status: 'healthy', cpu: 45, memory: 62, latency: 12, uptime: '15d 4h', location: 'us-east-1' },
    { id: 2, name: 'Node-02', status: 'healthy', cpu: 38, memory: 55, latency: 15, uptime: '12d 8h', location: 'us-west-2' },
    { id: 3, name: 'Node-03', status: 'warning', cpu: 78, memory: 84, latency: 28, uptime: '8d 12h', location: 'eu-central-1' },
    { id: 4, name: 'Node-04', status: 'healthy', cpu: 52, memory: 48, latency: 18, uptime: '22d 2h', location: 'ap-southeast-1' },
    { id: 5, name: 'Node-05', status: 'critical', cpu: 92, memory: 95, latency: 45, uptime: '3d 6h', location: 'us-east-1' },
    { id: 6, name: 'Node-06', status: 'healthy', cpu: 41, memory: 58, latency: 14, uptime: '18d 9h', location: 'eu-west-1' },
    { id: 7, name: 'Node-07', status: 'offline', cpu: 0, memory: 0, latency: 999, uptime: '0d 0h', location: 'ap-northeast-1' },
    { id: 8, name: 'Node-08', status: 'healthy', cpu: 35, memory: 42, latency: 11, uptime: '25d 14h', location: 'us-west-2' },
    { id: 9, name: 'Node-09', status: 'warning', cpu: 85, memory: 76, latency: 32, uptime: '5d 18h', location: 'eu-central-1' },
    { id: 10, name: 'Node-10', status: 'healthy', cpu: 48, memory: 51, latency: 16, uptime: '20d 7h', location: 'ap-southeast-1' },
    { id: 11, name: 'Node-11', status: 'healthy', cpu: 39, memory: 47, latency: 13, uptime: '16d 11h', location: 'us-east-1' },
    { id: 12, name: 'Node-12', status: 'healthy', cpu: 43, memory: 53, latency: 17, uptime: '14d 3h', location: 'eu-west-1' }
];

// Mock data for failover events
let failoverEvents = [
    { timestamp: '2026-02-26 08:45:23', type: 'failover', severity: 'warning', title: 'Automatic Failover Initiated', description: 'Node-05 failed, traffic redirected to Node-02', details: 'CPU overload detected, failover completed in 2.3s' },
    { timestamp: '2026-02-26 08:42:15', type: 'recovery', severity: 'info', title: 'Node Recovery Successful', description: 'Node-07 back online after maintenance', details: 'All health checks passed, load balancing restored' },
    { timestamp: '2026-02-26 08:38:45', type: 'degradation', severity: 'warning', title: 'Performance Degradation', description: 'Node-03 showing high latency', details: 'Response time increased by 40%, monitoring closely' },
    { timestamp: '2026-02-26 08:35:12', type: 'maintenance', severity: 'info', title: 'Scheduled Maintenance', description: 'Node-09 entering maintenance mode', details: 'Load redistributed to backup nodes' },
    { timestamp: '2026-02-26 08:30:45', type: 'failover', severity: 'critical', title: 'Emergency Failover', description: 'Node-05 critical failure, emergency protocols activated', details: 'Multiple backup nodes engaged, service continuity ensured' },
    { timestamp: '2026-02-26 08:25:33', type: 'recovery', severity: 'info', title: 'System Recovery Complete', description: 'All nodes operational after network hiccup', details: 'Redundancy checks passed, normal operations resumed' }
];

// Performance data for charts
let responseTimeData = [45, 42, 48, 51, 55, 49, 46, 43, 50, 47];
let throughputData = [1250, 1320, 1180, 1410, 1280, 1350, 1220, 1380, 1290, 1360];

// DOM elements
const nodeGrid = document.getElementById('node-grid');
const eventsTimeline = document.getElementById('events-timeline');
const activeNodesEl = document.getElementById('active-nodes');
const systemHealthEl = document.getElementById('system-health');
const activeAlertsEl = document.getElementById('active-alerts');
const lastFailoverEl = document.getElementById('last-failover');

// Modal elements
const nodeModal = document.getElementById('node-modal');
const nodeModalTitle = document.getElementById('node-modal-title');
const nodeDetailsContent = document.getElementById('node-details-content');

// Canvas elements
const topologyCanvas = document.getElementById('topology-canvas');
const topologyCtx = topologyCanvas.getContext('2d');

// Charts
let responseTimeChart, throughputChart;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    renderNodes();
    renderEvents();
    updateMetrics();
    initializeTopology();
    initializeCharts();
    startRealTimeUpdates();
});

// Initialize event listeners
function initializeEventListeners() {
    // Event filters
    document.getElementById('event-severity-filter').addEventListener('change', filterEvents);
    document.getElementById('event-type-filter').addEventListener('change', filterEvents);
    document.getElementById('clear-event-filters').addEventListener('click', clearEventFilters);

    // Modal
    document.querySelector('.close').addEventListener('click', closeNodeModal);

    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target === nodeModal) {
            closeNodeModal();
        }
    });
}

// Render node cards
function renderNodes() {
    nodeGrid.innerHTML = '';

    nodes.forEach(node => {
        const card = document.createElement('div');
        card.className = 'node-card';
        card.onclick = () => showNodeDetails(node.id);

        card.innerHTML = `
            <div class="node-header">
                <div class="node-name">${node.name}</div>
                <div class="node-status-badge ${node.status}">${node.status}</div>
            </div>
            <div class="node-metrics">
                <div class="metric-item">
                    <div class="value">${node.cpu}%</div>
                    <div class="label">CPU</div>
                </div>
                <div class="metric-item">
                    <div class="value">${node.memory}%</div>
                    <div class="label">Memory</div>
                </div>
                <div class="metric-item">
                    <div class="value">${node.latency}ms</div>
                    <div class="label">Latency</div>
                </div>
                <div class="metric-item">
                    <div class="value">${node.uptime}</div>
                    <div class="label">Uptime</div>
                </div>
            </div>
        `;

        nodeGrid.appendChild(card);
    });
}

// Render failover events
function renderEvents(filteredEvents = failoverEvents) {
    eventsTimeline.innerHTML = '';

    filteredEvents.forEach(event => {
        const eventEntry = document.createElement('div');
        eventEntry.className = 'event-entry';

        eventEntry.innerHTML = `
            <div class="event-info">
                <div class="event-timestamp">${event.timestamp}</div>
                <div class="event-title">${event.title}</div>
                <div class="event-description">${event.description}</div>
                <div class="event-details">${event.details}</div>
            </div>
            <div class="event-severity ${event.severity}">${event.severity}</div>
        `;

        eventsTimeline.appendChild(eventEntry);
    });
}

// Update dashboard metrics
function updateMetrics() {
    const activeNodes = nodes.filter(n => n.status !== 'offline').length;
    const avgHealth = nodes.reduce((sum, node) => {
        if (node.status === 'offline') return sum;
        let health = 100;
        if (node.cpu > 80) health -= 20;
        if (node.memory > 80) health -= 20;
        if (node.latency > 30) health -= 15;
        return sum + Math.max(0, health);
    }, 0) / activeNodes;

    const alerts = nodes.filter(n => n.status === 'critical' || n.status === 'warning').length;

    activeNodesEl.textContent = activeNodes;
    systemHealthEl.textContent = `${avgHealth.toFixed(1)}%`;
    activeAlertsEl.textContent = alerts;
    lastFailoverEl.textContent = '2 min ago';
}

// Initialize network topology visualization
function initializeTopology() {
    drawTopology();
}

// Draw network topology
function drawTopology() {
    topologyCtx.clearRect(0, 0, topologyCanvas.width, topologyCanvas.height);

    const centerX = topologyCanvas.width / 2;
    const centerY = topologyCanvas.height / 2;
    const radius = 150;

    // Draw connections first
    nodes.forEach((node, index) => {
        if (node.status === 'offline') return;

        const angle = (index / nodes.length) * 2 * Math.PI;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        // Draw connection to center (load balancer)
        topologyCtx.beginPath();
        topologyCtx.moveTo(centerX, centerY);
        topologyCtx.lineTo(x, y);
        topologyCtx.strokeStyle = node.status === 'healthy' ? '#4CAF50' :
                                 node.status === 'warning' ? '#FF9800' : '#F44336';
        topologyCtx.lineWidth = 2;
        topologyCtx.stroke();
    });

    // Draw central load balancer
    topologyCtx.beginPath();
    topologyCtx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
    topologyCtx.fillStyle = '#2196F3';
    topologyCtx.fill();
    topologyCtx.strokeStyle = '#333';
    topologyCtx.lineWidth = 2;
    topologyCtx.stroke();

    topologyCtx.fillStyle = '#fff';
    topologyCtx.font = '10px Arial';
    topologyCtx.textAlign = 'center';
    topologyCtx.fillText('Load', centerX, centerY - 3);
    topologyCtx.fillText('Balancer', centerX, centerY + 8);

    // Draw nodes
    nodes.forEach((node, index) => {
        const angle = (index / nodes.length) * 2 * Math.PI;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        // Node color based on status
        let color;
        switch (node.status) {
            case 'healthy':
                color = '#4CAF50';
                break;
            case 'warning':
                color = '#FF9800';
                break;
            case 'critical':
                color = '#F44336';
                break;
            case 'offline':
                color = '#666';
                break;
            default:
                color = '#2196F3';
        }

        // Draw node
        topologyCtx.beginPath();
        topologyCtx.arc(x, y, 12, 0, 2 * Math.PI);
        topologyCtx.fillStyle = color;
        topologyCtx.fill();
        topologyCtx.strokeStyle = '#333';
        topologyCtx.lineWidth = 1;
        topologyCtx.stroke();

        // Draw node label
        topologyCtx.fillStyle = '#fff';
        topologyCtx.font = '8px Arial';
        topologyCtx.textAlign = 'center';
        topologyCtx.fillText(node.name.replace('Node-', ''), x, y + 2);
    });
}

// Initialize performance charts
function initializeCharts() {
    // Response Time Chart
    const responseTimeCtx = document.getElementById('response-time-chart').getContext('2d');
    responseTimeChart = new Chart(responseTimeCtx, {
        type: 'line',
        data: {
            labels: Array.from({length: 10}, (_, i) => `${i * 10}s ago`),
            datasets: [{
                label: 'Response Time (ms)',
                data: responseTimeData,
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#333'
                    },
                    ticks: {
                        color: '#fff'
                    }
                },
                x: {
                    grid: {
                        color: '#333'
                    },
                    ticks: {
                        color: '#fff'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#fff'
                    }
                }
            }
        }
    });

    // Throughput Chart
    const throughputCtx = document.getElementById('throughput-chart').getContext('2d');
    throughputChart = new Chart(throughputCtx, {
        type: 'bar',
        data: {
            labels: Array.from({length: 10}, (_, i) => `${i * 10}s ago`),
            datasets: [{
                label: 'Throughput (req/sec)',
                data: throughputData,
                backgroundColor: '#4CAF50',
                borderColor: '#388E3C',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#333'
                    },
                    ticks: {
                        color: '#fff'
                    }
                },
                x: {
                    grid: {
                        color: '#333'
                    },
                    ticks: {
                        color: '#fff'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#fff'
                    }
                }
            }
        }
    });
}

// Filter events
function filterEvents() {
    const severityFilter = document.getElementById('event-severity-filter').value;
    const typeFilter = document.getElementById('event-type-filter').value;

    let filtered = failoverEvents.filter(event => {
        const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter;
        const matchesType = typeFilter === 'all' || event.type === typeFilter;

        return matchesSeverity && matchesType;
    });

    renderEvents(filtered);
}

// Clear event filters
function clearEventFilters() {
    document.getElementById('event-severity-filter').value = 'all';
    document.getElementById('event-type-filter').value = 'all';
    renderEvents();
}

// Show node details modal
function showNodeDetails(nodeId) {
    const node = nodes.find(n => n.id === nodeId);

    nodeModalTitle.textContent = `${node.name} Details`;
    nodeDetailsContent.innerHTML = `
        <div class="node-detail-section">
            <h4>System Information</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="label">Status</div>
                    <div class="value">${node.status}</div>
                </div>
                <div class="detail-item">
                    <div class="label">Location</div>
                    <div class="value">${node.location}</div>
                </div>
                <div class="detail-item">
                    <div class="label">Uptime</div>
                    <div class="value">${node.uptime}</div>
                </div>
            </div>
        </div>

        <div class="node-detail-section">
            <h4>Performance Metrics</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="label">CPU Usage</div>
                    <div class="value">${node.cpu}%</div>
                </div>
                <div class="detail-item">
                    <div class="label">Memory Usage</div>
                    <div class="value">${node.memory}%</div>
                </div>
                <div class="detail-item">
                    <div class="label">Latency</div>
                    <div class="value">${node.latency}ms</div>
                </div>
                <div class="detail-item">
                    <div class="label">Load Average</div>
                    <div class="value">${(node.cpu / 10).toFixed(1)}</div>
                </div>
            </div>
        </div>

        <div class="node-detail-section">
            <h4>Network Statistics</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="label">Active Connections</div>
                    <div class="value">${Math.floor(Math.random() * 1000) + 500}</div>
                </div>
                <div class="detail-item">
                    <div class="label">Data Transfer</div>
                    <div class="value">${(Math.random() * 10 + 5).toFixed(1)} GB</div>
                </div>
                <div class="detail-item">
                    <div class="label">Error Rate</div>
                    <div class="value">${(Math.random() * 0.1).toFixed(3)}%</div>
                </div>
            </div>
        </div>
    `;

    nodeModal.style.display = 'block';
}

// Close node modal
function closeNodeModal() {
    nodeModal.style.display = 'none';
}

// Start real-time updates
function startRealTimeUpdates() {
    setInterval(() => {
        // Simulate real-time data updates
        updateNodeData();
        updateMetrics();
        drawTopology();
        updateCharts();

        // Occasionally add new events
        if (Math.random() < 0.3) {
            addRandomEvent();
            renderEvents();
        }
    }, 3000);
}

// Simulate data updates
function updateNodeData() {
    nodes.forEach(node => {
        if (node.status === 'offline') return;

        // Small random fluctuations
        node.cpu += (Math.random() - 0.5) * 5;
        node.memory += (Math.random() - 0.5) * 3;
        node.latency += (Math.random() - 0.5) * 2;

        // Keep within bounds
        node.cpu = Math.max(0, Math.min(100, node.cpu));
        node.memory = Math.max(0, Math.min(100, node.memory));
        node.latency = Math.max(5, Math.min(100, node.latency));

        // Update status based on metrics
        if (node.cpu > 90 || node.memory > 90 || node.latency > 40) {
            node.status = 'critical';
        } else if (node.cpu > 75 || node.memory > 75 || node.latency > 25) {
            node.status = 'warning';
        } else {
            node.status = 'healthy';
        }
    });

    renderNodes();
}

// Update performance charts
function updateCharts() {
    // Update response time data
    responseTimeData.shift();
    responseTimeData.push(40 + Math.random() * 20);

    // Update throughput data
    throughputData.shift();
    throughputData.push(1200 + Math.random() * 200);

    responseTimeChart.update();
    throughputChart.update();
}

// Add random event
function addRandomEvent() {
    const eventTypes = [
        { type: 'failover', severity: 'warning', title: 'Automatic Failover', description: 'Traffic redirected due to node overload' },
        { type: 'recovery', severity: 'info', title: 'Node Recovery', description: 'Node back online after issue resolution' },
        { type: 'degradation', severity: 'warning', title: 'Performance Warning', description: 'Node showing elevated metrics' },
        { type: 'maintenance', severity: 'info', title: 'Maintenance Window', description: 'Scheduled maintenance in progress' }
    ];

    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);

    failoverEvents.unshift({
        timestamp: timestamp,
        ...randomEvent,
        details: 'System monitoring active, redundancy maintained'
    });

    // Keep only last 15 events
    if (failoverEvents.length > 15) {
        failoverEvents.pop();
    }
}

// Handle window resize for canvas
window.addEventListener('resize', function() {
    // Adjust canvas size if needed
    const container = topologyCanvas.parentElement;
    const maxWidth = Math.min(container.offsetWidth - 40, 800);
    topologyCanvas.width = maxWidth;
    topologyCanvas.height = 500;
    drawTopology();
});