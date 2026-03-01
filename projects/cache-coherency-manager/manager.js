/**
 * Distributed Cache Coherency Manager
 * 
 * Maintains cache consistency across distributed nodes using event-driven
 * invalidation protocols with version-based validation.
 */

class DistributedCacheCoherencyManager {
    constructor() {
        this.coordinationEnabled = false;
        this.coordinationInterval = null;
        this.startTime = null;
        this.nodes = [];
        this.cacheEntries = [];
        this.invalidationEvents = [];
        this.protocols = [];
        this.coherencyHistory = [];
        this.selectedNode = null;
        this.selectedEntry = null;

        this.config = {
            syncInterval: 5000,
            invalidationDelay: 100,
            versionThreshold: 100,
            maxEventLog: 100,
            maxHistorySize: 24
        };

        this.initializeDefaults();
    }

    /**
     * Initialize defaults
     */
    initializeDefaults() {
        // Initialize distributed nodes
        this.nodes = [
            {
                id: 'node-1',
                name: 'Primary Node',
                region: 'us-east-1',
                status: 'healthy',
                version: 100,
                cachedEntries: 45,
                hitRate: 0.92,
                latency: 5,
                lastSync: null,
                inSyncEntries: 45
            },
            {
                id: 'node-2',
                name: 'Replica Node 1',
                region: 'us-west-2',
                status: 'healthy',
                version: 100,
                cachedEntries: 45,
                hitRate: 0.88,
                latency: 25,
                lastSync: null,
                inSyncEntries: 45
            },
            {
                id: 'node-3',
                name: 'Replica Node 2',
                region: 'eu-west-1',
                status: 'healthy',
                version: 100,
                cachedEntries: 45,
                hitRate: 0.85,
                latency: 80,
                lastSync: null,
                inSyncEntries: 45
            },
            {
                id: 'node-4',
                name: 'Edge Cache',
                region: 'ap-southeast-1',
                status: 'healthy',
                version: 100,
                cachedEntries: 30,
                hitRate: 0.78,
                latency: 120,
                lastSync: null,
                inSyncEntries: 30
            }
        ];

        // Initialize cache entries with version tracking
        const keys = [
            'user:1001', 'user:1002', 'user:1003', 'product:5001', 'product:5002',
            'order:8001', 'order:8002', 'config:db-url', 'config:api-key', 'session:s1',
            'inventory:warehouse-1', 'price:USD-100', 'rating:p5001', 'user:1004',
            'user:1005', 'product:5003', 'product:5004', 'order:8003', 'session:s2',
            'session:s3'
        ];

        this.cacheEntries = keys.map((key, idx) => ({
            id: key,
            key: key,
            version: 100 + Math.floor(Math.random() * 10),
            size: 128 + Math.floor(Math.random() * 512),
            createdAt: new Date(Date.now() - Math.random() * 3600000),
            lastModified: new Date(Date.now() - Math.random() * 1800000),
            nodeVersions: {
                'node-1': 100 + Math.floor(Math.random() * 5),
                'node-2': 100 + Math.floor(Math.random() * 5),
                'node-3': 100 + Math.floor(Math.random() * 5),
                'node-4': 100 + Math.floor(Math.random() * 5)
            },
            status: 'coherent',
            accessCount: Math.floor(Math.random() * 1000)
        }));

        // Initialize coherency protocols
        this.protocols = [
            {
                id: 'msi',
                name: 'MSI (Modified-Shared-Invalid)',
                description: 'Simple 3-state protocol',
                invalidations: 0,
                effectiveness: 0.82,
                used: false
            },
            {
                id: 'mesi',
                name: 'MESI (Modified-Exclusive-Shared-Invalid)',
                description: 'Improved 4-state with exclusive state',
                invalidations: 0,
                effectiveness: 0.88,
                used: false
            },
            {
                id: 'moesi',
                name: 'MOESI (Modified-Owned-Exclusive-Shared-Invalid)',
                description: 'Advanced 5-state protocol',
                invalidations: 0,
                effectiveness: 0.94,
                used: true
            },
            {
                id: 'dragon',
                name: 'Dragon (Write-Update)',
                description: 'Broadcast-based update protocol',
                invalidations: 0,
                effectiveness: 0.86,
                used: false
            }
        ];

        // Initialize coherency history
        for (let i = 0; i < 24; i++) {
            this.coherencyHistory.push({
                timestamp: new Date(Date.now() - (23 - i) * 3600000),
                score: 100,
                invalidations: 0,
                syncedNodes: 4
            });
        }
    }

    /**
     * Initialize UI
     */
    initialize() {
        this.updateUI();
    }

    /**
     * Toggle coordination
     */
    toggleCoordination() {
        this.coordinationEnabled = !this.coordinationEnabled;

        if (this.coordinationEnabled) {
            this.startTime = new Date();
            this.startCoordination();
            alert('✓ Cache Coordination Started');
        } else {
            this.stopCoordination();
            alert('✓ Cache Coordination Stopped');
        }

        this.updateUI();
    }

    /**
     * Start coordination
     */
    startCoordination() {
        this.coordinationInterval = setInterval(() => {
            this.synchronizeCache();
        }, this.config.syncInterval);

        this.logEvent('sync', 'Coordination started');
    }

    /**
     * Stop coordination
     */
    stopCoordination() {
        if (this.coordinationInterval) {
            clearInterval(this.coordinationInterval);
            this.coordinationInterval = null;
        }

        this.logEvent('sync', 'Coordination stopped');
    }

    /**
     * Synchronize cache across nodes
     */
    synchronizeCache() {
        this.nodes.forEach(node => {
            node.lastSync = new Date();
            
            // Simulate occasional version mismatches
            if (Math.random() < 0.1) {
                const entry = this.cacheEntries[Math.floor(Math.random() * this.cacheEntries.length)];
                const versionDiff = Math.floor(Math.random() * 5);
                node.version += versionDiff;
                entry.nodeVersions[node.id] = Math.max(entry.nodeVersions[node.id], node.version - 2);
                entry.status = 'inconsistent';
                
                this.broadcastInvalidation(entry, node);
            }
        });

        this.checkCoherency();
        this.updateUI();
    }

    /**
     * Broadcast invalidation event
     */
    broadcastInvalidation(entry, originNode) {
        const event = {
            id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'broadcast',
            entryId: entry.id,
            originNode: originNode.id,
            newVersion: entry.version + 1,
            timestamp: new Date(),
            affectedNodes: this.nodes.filter(n => n.id !== originNode.id).map(n => n.id),
            protocol: this.protocols.find(p => p.used).name
        };

        this.invalidationEvents.push(event);
        this.logEvent('broadcast', `Invalidation broadcast for ${entry.key}`);

        // Simulate invalidation propagation
        setTimeout(() => {
            this.applyInvalidation(entry, event);
        }, this.config.invalidationDelay);
    }

    /**
     * Apply invalidation across nodes
     */
    applyInvalidation(entry, event) {
        event.affectedNodes.forEach(nodeId => {
            const node = this.nodes.find(n => n.id === nodeId);
            if (node) {
                node.version = Math.max(node.version, event.newVersion);
                entry.nodeVersions[nodeId] = event.newVersion;
            }
        });

        entry.version = event.newVersion;
        entry.status = 'coherent';
        
        this.logEvent('validation', `Invalidation applied for ${entry.key}`);
        this.checkCoherency();
    }

    /**
     * Check overall cache coherency
     */
    checkCoherency() {
        const coherentEntries = this.cacheEntries.filter(e => e.status === 'coherent').length;
        const coherencyScore = Math.round((coherentEntries / this.cacheEntries.length) * 100);

        this.coherencyHistory.push({
            timestamp: new Date(),
            score: coherencyScore,
            invalidations: this.invalidationEvents.filter(e => 
                e.timestamp > new Date(Date.now() - 60000)
            ).length,
            syncedNodes: this.nodes.filter(n => n.status === 'healthy').length
        });

        if (this.coherencyHistory.length > this.config.maxHistorySize) {
            this.coherencyHistory.shift();
        }
    }

    /**
     * Simulate write operation
     */
    simulateWrite() {
        if (!this.coordinationEnabled) {
            alert('⚠️ Enable coordination first');
            return;
        }

        const entry = this.cacheEntries[Math.floor(Math.random() * this.cacheEntries.length)];
        const primaryNode = this.nodes[0];

        entry.version++;
        entry.lastModified = new Date();
        primaryNode.version++;
        entry.nodeVersions[primaryNode.id] = entry.version;

        const event = {
            id: `write-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'write',
            entryId: entry.id,
            originNode: primaryNode.id,
            newVersion: entry.version,
            timestamp: new Date(),
            affectedNodes: this.nodes.slice(1).map(n => n.id),
            protocol: this.protocols.find(p => p.used).name
        };

        this.invalidationEvents.push(event);
        this.logEvent('write', `Write to ${entry.key} (v${entry.version})`);

        // Propagate invalidation
        this.broadcastInvalidation(entry, primaryNode);
        this.updateUI();
    }

    /**
     * Log event
     */
    logEvent(type, message) {
        this.invalidationEvents.push({
            type: type,
            message: message,
            timestamp: new Date()
        });

        if (this.invalidationEvents.length > this.config.maxEventLog) {
            this.invalidationEvents.shift();
        }
    }

    /**
     * Generate report
     */
    generateReport() {
        const coherencyScore = this.calculateCoherencyScore();
        const totalInvalidations = this.invalidationEvents.filter(e => e.type === 'broadcast').length;
        const healthyNodes = this.nodes.filter(n => n.status === 'healthy').length;
        const avgHitRate = this.nodes.reduce((sum, n) => sum + n.hitRate, 0) / this.nodes.length;

        const report = `
Distributed Cache Coherency Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: ${this.coordinationEnabled ? 'Active ✓' : 'Inactive'}

Coherency Metrics:
  • Overall Coherency Score: ${coherencyScore.toFixed(1)}%
  • Coherent Entries: ${this.cacheEntries.filter(e => e.status === 'coherent').length}/${this.cacheEntries.length}
  • Total Invalidations: ${totalInvalidations}
  • Average Hit Rate: ${(avgHitRate * 100).toFixed(1)}%

Node Status:
  • Healthy Nodes: ${healthyNodes}/${this.nodes.length}
  • Total Cached Entries: ${this.cacheEntries.length}
  • Average Entry Size: ${Math.round(this.cacheEntries.reduce((sum, e) => sum + e.size, 0) / this.cacheEntries.length)} bytes
  
Node Details:
${this.nodes.map(n => `  • ${n.name}: v${n.version} (${n.inSyncEntries}/${n.cachedEntries} sync, ${(n.hitRate * 100).toFixed(0)}% hit rate)`).join('\n')}

Active Protocol: ${this.protocols.find(p => p.used)?.name}

Recent Invalidations:
${this.invalidationEvents.filter(e => e.type === 'broadcast').slice(-5).map(e => 
  `  • ${e.timestamp.toLocaleTimeString()}: ${e.affectedNodes.length} nodes affected`
).join('\n')}
`;

        alert(report);
    }

    /**
     * Calculate coherency score
     */
    calculateCoherencyScore() {
        if (this.cacheEntries.length === 0) return 100;
        return (this.cacheEntries.filter(e => e.status === 'coherent').length / this.cacheEntries.length) * 100;
    }

    /**
     * Show node details
     */
    showNodeDetails(nodeId) {
        const node = this.nodes.find(n => n.id === nodeId);
        if (!node) return;

        this.selectedNode = node;

        const detailsHtml = `
            <div class="detail-row">
                <span class="label">Region:</span>
                <span class="value">${node.region}</span>
            </div>
            <div class="detail-row">
                <span class="label">Status:</span>
                <span class="value">${node.status.toUpperCase()}</span>
            </div>
            <div class="detail-row">
                <span class="label">Version:</span>
                <span class="value">v${node.version}</span>
            </div>
            <div class="detail-row">
                <span class="label">Cached Entries:</span>
                <span class="value">${node.inSyncEntries}/${node.cachedEntries}</span>
            </div>
            <div class="detail-row">
                <span class="label">Hit Rate:</span>
                <span class="value">${(node.hitRate * 100).toFixed(1)}%</span>
            </div>
            <div class="detail-row">
                <span class="label">Latency:</span>
                <span class="value">${node.latency}ms</span>
            </div>
            <div class="detail-row">
                <span class="label">Last Sync:</span>
                <span class="value">${node.lastSync ? node.lastSync.toLocaleTimeString() : 'Never'}</span>
            </div>
        `;

        document.getElementById('nodeTitle').textContent = node.name;
        document.getElementById('nodeDetails').innerHTML = detailsHtml;
        document.getElementById('nodeModal').classList.add('show');
    }

    /**
     * Sync node
     */
    syncNode() {
        if (this.selectedNode) {
            this.selectedNode.lastSync = new Date();
            this.selectedNode.inSyncEntries = this.selectedNode.cachedEntries;
            this.logEvent('sync', `Node ${this.selectedNode.name} synchronized`);
            this.closeModal();
            this.updateUI();
        }
    }

    /**
     * Show entry details
     */
    showEntryDetails(entryId) {
        const entry = this.cacheEntries.find(e => e.id === entryId);
        if (!entry) return;

        this.selectedEntry = entry;

        const versionList = Object.entries(entry.nodeVersions)
            .map(([nodeId, version]) => {
                const node = this.nodes.find(n => n.id === nodeId);
                return `<div class="detail-row"><span class="label">${node?.name}:</span><span class="value">v${version}</span></div>`;
            })
            .join('');

        const detailsHtml = `
            <div class="detail-row">
                <span class="label">Key:</span>
                <span class="value">${entry.key}</span>
            </div>
            <div class="detail-row">
                <span class="label">Current Version:</span>
                <span class="value">v${entry.version}</span>
            </div>
            <div class="detail-row">
                <span class="label">Size:</span>
                <span class="value">${entry.size} bytes</span>
            </div>
            <div class="detail-row">
                <span class="label">Status:</span>
                <span class="value">${entry.status.toUpperCase()}</span>
            </div>
            <div class="detail-row">
                <span class="label">Access Count:</span>
                <span class="value">${entry.accessCount}</span>
            </div>
            <div class="detail-row">
                <span class="label">Created:</span>
                <span class="value">${entry.createdAt.toLocaleString()}</span>
            </div>
            <div class="detail-row">
                <span class="label">Last Modified:</span>
                <span class="value">${entry.lastModified.toLocaleString()}</span>
            </div>
            <h4 style="margin-top: 15px; color: var(--color-text);">Node Versions:</h4>
            ${versionList}
        `;

        document.getElementById('entryTitle').textContent = `Cache Entry: ${entry.key}`;
        document.getElementById('entryDetails').innerHTML = detailsHtml;
        document.getElementById('entryModal').classList.add('show');
    }

    /**
     * Invalidate entry
     */
    invalidateEntry() {
        if (this.selectedEntry) {
            const originNode = this.nodes[0];
            this.broadcastInvalidation(this.selectedEntry, originNode);
            this.closeModal();
            this.updateUI();
        }
    }

    /**
     * Close modal
     */
    closeModal() {
        document.getElementById('nodeModal').classList.remove('show');
        document.getElementById('entryModal').classList.remove('show');
        this.selectedNode = null;
        this.selectedEntry = null;
    }

    /**
     * Apply filters
     */
    applyFilters() {
        const versionFilter = document.getElementById('versionFilter')?.value || 'all';
        const statusFilter = document.getElementById('statusFilter')?.value || 'all';

        let filtered = this.cacheEntries;

        if (versionFilter === 'latest') {
            const maxVersion = Math.max(...this.cacheEntries.map(e => e.version));
            filtered = filtered.filter(e => e.version === maxVersion);
        } else if (versionFilter === 'stale') {
            const maxVersion = Math.max(...this.cacheEntries.map(e => e.version));
            filtered = filtered.filter(e => e.version < maxVersion);
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(e => e.status === statusFilter);
        }

        this.renderEntriesList(filtered);
    }

    /**
     * Filter events
     */
    filterEvents() {
        const typeFilter = document.getElementById('eventTypeFilter')?.value || 'all';

        let filtered = this.invalidationEvents;

        if (typeFilter !== 'all') {
            filtered = filtered.filter(e => e.type === typeFilter);
        }

        this.renderEventLog(filtered.sort((a, b) => b.timestamp - a.timestamp));
    }

    /**
     * Render nodes grid
     */
    renderNodes() {
        const container = document.getElementById('nodesGrid');

        container.innerHTML = this.nodes.map(node => `
            <div class="node-card" onclick="window.manager.showNodeDetails('${node.id}')">
                <div class="node-header">
                    <div class="node-name">${node.name}</div>
                    <div class="node-status ${node.status}">${node.status === 'healthy' ? '🟢 Healthy' : '🔴 Unhealthy'}</div>
                </div>
                <div class="node-body">
                    <div class="node-metric">
                        <span class="label">Version:</span>
                        <span class="value">v${node.version}</span>
                    </div>
                    <div class="node-metric">
                        <span class="label">Entries:</span>
                        <span class="value">${node.inSyncEntries}/${node.cachedEntries}</span>
                    </div>
                    <div class="node-metric">
                        <span class="label">Hit Rate:</span>
                        <span class="value">${(node.hitRate * 100).toFixed(1)}%</span>
                    </div>
                    <div class="node-metric">
                        <span class="label">Latency:</span>
                        <span class="value">${node.latency}ms</span>
                    </div>
                    <div class="node-metric">
                        <span class="label">Region:</span>
                        <span class="value">${node.region}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render entries list
     */
    renderEntriesList(entries = this.cacheEntries) {
        const container = document.getElementById('entriesList');

        if (entries.length === 0) {
            container.innerHTML = '<div class="placeholder">No cache entries</div>';
            return;
        }

        container.innerHTML = entries.map(entry => `
            <div class="entry-card ${entry.status}" onclick="window.manager.showEntryDetails('${entry.id}')">
                <div class="entry-header">
                    <span class="entry-key">${entry.key}</span>
                    <span class="entry-badge ${entry.status}">${entry.status.toUpperCase()}</span>
                </div>
                <div class="entry-info">
                    <div class="entry-meta">
                        <span class="label">Version:</span>
                        <span class="value">v${entry.version}</span>
                    </div>
                    <div class="entry-meta">
                        <span class="label">Size:</span>
                        <span class="value">${entry.size} bytes</span>
                    </div>
                    <div class="entry-meta">
                        <span class="label">Accesses:</span>
                        <span class="value">${entry.accessCount}</span>
                    </div>
                    <div class="entry-meta">
                        <span class="label">Modified:</span>
                        <span class="value">${this.getTimeAgo(entry.lastModified)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render protocols
     */
    renderProtocols() {
        const container = document.getElementById('protocolsGrid');

        container.innerHTML = this.protocols.map(protocol => `
            <div class="protocol-card">
                <div class="protocol-name">${protocol.name}</div>
                <p class="protocol-description">${protocol.description}</p>
                <div class="protocol-stats">
                    <div class="protocol-stat">
                        <div class="value">${protocol.invalidations}</div>
                        <div class="label">Invalidations</div>
                    </div>
                    <div class="protocol-stat">
                        <div class="value">${(protocol.effectiveness * 100).toFixed(0)}%</div>
                        <div class="label">Effectiveness</div>
                    </div>
                    <div class="protocol-stat">
                        <div class="value">${protocol.used ? 'Active' : 'Inactive'}</div>
                        <div class="label">Status</div>
                    </div>
                    <div class="protocol-stat">
                        <div class="value">v1.0</div>
                        <div class="label">Version</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render recent events
     */
    renderRecentEvents() {
        const container = document.getElementById('recentEvents');

        const recent = this.invalidationEvents
            .filter(e => e.type === 'broadcast' || e.type === 'write')
            .slice(-5)
            .reverse();

        if (recent.length === 0) {
            container.innerHTML = '<div class="placeholder">No events yet</div>';
            return;
        }

        container.innerHTML = recent.map(event => `
            <div class="event-item">
                <div class="event-header">
                    <span class="event-title">${event.message || event.entryId}</span>
                    <span class="event-time">${this.getTimeAgo(event.timestamp)}</span>
                </div>
                <div class="event-description">v${event.newVersion} • ${event.affectedNodes?.length || '0'} nodes</div>
            </div>
        `).join('');
    }

    /**
     * Render event log
     */
    renderEventLog(events = this.invalidationEvents) {
        const container = document.getElementById('eventLog');

        if (events.length === 0) {
            container.innerHTML = '<div class="placeholder">No events recorded</div>';
            return;
        }

        container.innerHTML = events.map(event => `
            <div class="timeline-item ${event.type}">
                <div class="timeline-header">
                    <span class="timeline-type">${event.type}</span>
                    <span class="timeline-time">${event.timestamp.toLocaleString()}</span>
                </div>
                <div class="timeline-message">${event.message || `${event.entryId} (v${event.newVersion})`}</div>
            </div>
        `).join('');
    }

    /**
     * Render network health
     */
    renderNetworkHealth() {
        const container = document.getElementById('networkHealth');

        container.innerHTML = this.nodes.map(node => `
            <div class="health-item">
                <span class="health-name">${node.name}</span>
                <span class="health-value">${node.latency}ms • ${node.status}</span>
            </div>
        `).join('');
    }

    /**
     * Render coherency chart
     */
    renderCoherencyChart() {
        const canvas = document.getElementById('coherencyChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        canvas.width = width;
        canvas.height = height;

        const padding = 50;
        const graphWidth = width - padding * 2;
        const graphHeight = height - padding * 2;
        const maxScore = 100;

        const dataPoints = this.coherencyHistory.length;
        const pointSpacing = dataPoints > 1 ? graphWidth / (dataPoints - 1) : graphWidth / 2;

        // Draw axes
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Draw coherency line
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.beginPath();

        this.coherencyHistory.forEach((point, index) => {
            const x = padding + (index * pointSpacing);
            const y = height - padding - (point.score / maxScore) * graphHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Coherency Score (%)', width / 2, height - 10);
    }

    /**
     * Get time ago
     */
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    /**
     * Update UI
     */
    updateUI() {
        const coherencyScore = this.calculateCoherencyScore();
        const healthyNodes = this.nodes.filter(n => n.status === 'healthy').length;
        const totalEvents = this.invalidationEvents.filter(e => e.type === 'broadcast' || e.type === 'write').length;

        // Update overview cards
        document.getElementById('coherencyScore').textContent = coherencyScore.toFixed(1) + '%';
        document.getElementById('activeNodes').textContent = healthyNodes;
        document.getElementById('totalEntries').textContent = this.cacheEntries.length;
        document.getElementById('invalidationCount').textContent = totalEvents;

        // Update status indicator
        const statusDot = document.getElementById('statusDot');
        if (statusDot) {
            statusDot.className = 'status-dot' + (this.coordinationEnabled ? ' active' : '');
        }

        document.getElementById('coordinationStatus').textContent = this.coordinationEnabled ? 'Active' : 'Stopped';

        if (this.coordinationEnabled && this.startTime) {
            const uptime = new Date() - this.startTime;
            const hours = Math.floor(uptime / 3600000);
            const minutes = Math.floor((uptime % 3600000) / 60000);
            const seconds = Math.floor((uptime % 60000) / 1000);
            document.getElementById('uptime').textContent = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        document.getElementById('nodeCount').textContent = this.nodes.length;

        const avgHitRate = this.nodes.reduce((sum, n) => sum + n.hitRate, 0) / this.nodes.length;
        document.getElementById('hitRate').textContent = (avgHitRate * 100).toFixed(1) + '%';

        const lastEvent = this.invalidationEvents[this.invalidationEvents.length - 1];
        document.getElementById('lastEvent').textContent = lastEvent ? this.getTimeAgo(lastEvent.timestamp) : '--';

        // Update footer
        document.getElementById('systemStatus').textContent = this.coordinationEnabled ? 'Active' : 'Idle';
        document.getElementById('footerNodes').textContent = healthyNodes;
        document.getElementById('footerCoherency').textContent = coherencyScore.toFixed(1) + '%';
        document.getElementById('footerEvents').textContent = totalEvents;

        // Update button text
        const startBtn = document.getElementById('startCoordination');
        if (startBtn) {
            startBtn.textContent = this.coordinationEnabled ? 'Stop Coordination' : 'Start Coordination';
        }

        // Render sections
        this.renderNetworkHealth();
        this.renderNodes();
        this.renderEntriesList();
        this.renderProtocols();
        this.renderRecentEvents();
        this.renderEventLog();
        this.renderCoherencyChart();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DistributedCacheCoherencyManager;
}
