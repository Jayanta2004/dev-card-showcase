# Distributed Cache Coherency Manager

An event-driven cache coordination layer that maintains consistency across distributed nodes using version-based validation and intelligent invalidation protocols. Solves data inconsistency problems in multi-node horizontally scaled architectures.

![Status: Active](https://img.shields.io/badge/status-active-brightgreen)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

## 🎯 Features

### Cache Coherency Protocols

**4 Implemented Protocols:**

1. **MSI (Modified-Shared-Invalid)**
   - Simple 3-state protocol
   - Effectiveness: 82%
   - Baseline protocol

2. **MESI (Modified-Exclusive-Shared-Invalid)**
   - Improved 4-state with exclusive state
   - Effectiveness: 88%
   - Reduces redundant write-throughs

3. **MOESI (Modified-Owned-Exclusive-Shared-Invalid)**
   - Advanced 5-state protocol
   - Effectiveness: 94%
   - Default active protocol
   - Owned state for efficient writes

4. **Dragon (Write-Update)**
   - Broadcast-based update protocol
   - Effectiveness: 86%
   - Update-on-write approach

### Event-Driven Invalidation

**Invalidation Events:**
- Write operations trigger broadcasts
- Version-based conflict detection
- Automatic propagation delays
- Cross-node synchronization
- Event priority handling

**Event Types:**
- **Write Events**: Direct cache modifications
- **Broadcast Events**: Invalidation notifications
- **Sync Events**: Node synchronization
- **Validation Events**: Version verification

### Version-Based Validation

**Version Tracking:**
- Global version counter per entry
- Per-node version tracking
- Version mismatch detection
- Automatic version reconciliation
- Stale data identification

**Coherency States:**
- **Coherent**: All nodes synchronized
- **Inconsistent**: Version mismatch detected
- **Syncing**: In-flight synchronization

### Distributed Node Management

**4 Pre-Configured Nodes:**
1. Primary Node (us-east-1): 45 entries, 92% hit rate
2. Replica Node 1 (us-west-2): 45 entries, 88% hit rate
3. Replica Node 2 (eu-west-1): 45 entries, 85% hit rate
4. Edge Cache (ap-southeast-1): 30 entries, 78% hit rate

**Node Metrics:**
- Current version
- Cached entries count
- Hit rate tracking
- Latency measurement
- Synchronization status
- Health indicators

## 🚀 Getting Started

### Basic Usage

```html
<script src="manager.js"></script>
<script>
    // Initialize the manager
    const manager = new DistributedCacheCoherencyManager();
    manager.initialize();
    
    // Start cache coordination
    manager.toggleCoordination();
    
    // Simulate write operation
    manager.simulateWrite();
    
    // Check coherency
    const score = manager.calculateCoherencyScore();
</script>
```

## 📊 Dashboard Features

### Dashboard Tab
- Real-time coordination status
- Network health overview
- 24-hour coherency trend
- Recent invalidation events
- Uptime tracking

### Nodes Tab
- All distributed nodes
- Individual node metrics
- Version information
- Hit rate statistics
- Latency monitoring
- Sync status indicators

### Cache Entries Tab
- Complete cache inventory
- Version filtering (latest/stale)
- Status filtering (coherent/inconsistent)
- Entry details modal
- Access count tracking

### Protocols Tab
- Protocol information cards
- Effectiveness metrics
- Invalidation counts
- Active protocol indicator
- Version information

### Events Tab
- Complete event log
- Type filtering
- Real-time updates
- Chronological ordering
- Event details

## 🔬 Coherency Algorithm

### Synchronization Process

1. **Periodic Sync Interval**: Every 5 seconds
2. **Version Check**: Compare node versions
3. **Mismatch Detection**: Identify divergences
4. **Invalidation Broadcast**: Send to affected nodes
5. **Propagation Delay**: 100ms default latency
6. **State Application**: Update all replicas
7. **Coherency Verification**: Validate consistency

### Version-Based Validation Formula

**Local Version Check:**
```
For each cache entry:
  latest_version = max(all_node_versions)
  if node_version < latest_version:
    mark as stale
    trigger invalidation
```

**Coherency Score:**
```
coherency_score = (coherent_entries / total_entries) × 100%
```

**Invalidation Propagation:**
```
affected_nodes = all_nodes - origin_node
for each affected_node:
  update(node_version, new_version)
  update(entry_version, new_version)
```

### Stale Detection

- Entries with version < global maximum
- Cross-node version comparison
- Automatic inconsistency flagging
- Timestamp-based ordering

## 📈 Key Metrics

### Cache Performance
- Coherency Score: 0-100%
- Cache Hit Rate: Per-node percentage
- Entry Count: Total cached items
- Invalidation Rate: Events per minute

### Node Health
- Healthy Node Count: Active replicas
- Average Latency: Network delay
- Synchronization Status: In-sync count
- Version Alignment: Matching nodes

### Event Tracking
- Total Invalidations: Broadcast count
- Write Operations: Modification count
- Sync Events: Synchronization count
- Validation Rate: Checks performed

## 🔧 Configuration

### Default Settings
- `syncInterval`: 5000ms (5 seconds)
- `invalidationDelay`: 100ms propagation delay
- `versionThreshold`: 100 base version
- `maxEventLog`: 100 entries
- `maxHistorySize`: 24 hours

### Protocol Selection

Set active protocol via configuration:
```json
{
  "activeProtocol": "moesi",
  "enableBroadcast": true,
  "invalidationDelay": 100
}
```

## 🎨 Design Features

**Color Scheme:**
- Primary: Cyan (#06b6d4) - Cache coordination theme
- Secondary: Dark cyan (#0891b2)
- Success: Green (#10b981) - Coherent state
- Danger: Red (#dc2626) - Inconsistent state

**Responsive Design:**
- Mobile-optimized dashboard
- Touch-friendly controls
- Adaptive grid layouts
- Modal detail views

## 💡 Use Cases

1. **Distributed Database Caches**: Multi-region MongoDB cache layers
2. **CDN Content Distribution**: Geographic edge cache coordination
3. **Microservices Communication**: Cross-service object caching
4. **Load-Balanced Clusters**: Session cache consistency
5. **Real-Time Collaboration**: Shared document caching
6. **Financial Systems**: Account balance cache sync
7. **E-Commerce Inventory**: Stock level cache coherency
8. **Social Media**: User profile cache distribution
9. **Search Engines**: Index fragment caching
10. **Analytics Platforms**: Metric aggregation caching

## 🔌 Integration Points

- Cache Client Libraries (Redis, Memcached)
- Message Queues (RabbitMQ, Kafka)
- Service Mesh (Istio, Consul)
- Monitoring Systems (Prometheus, Datadog)
- Load Balancers (HAProxy, nginx)
- Database Replication Systems

## 📊 Performance Characteristics

**Invalidation Latency:**
- Low latency network: <10ms propagation
- High latency network: 50-200ms propagation
- Configurable per-deployment

**Cache Hit Rates:**
- Primary node: 92% average
- Replica nodes: 85-88% average
- Edge cache: 78% average

**Memory Efficiency:**
- 128-640 bytes per entry
- 20 sample entries: ~7KB storage
- 4 nodes tracking: Minimal overhead

## 🧪 Built-in Test Data

- 20 pre-configured cache entries
- 4 distributed nodes
- 24 hours of coherency history
- 4 coherency protocol implementations
- Realistic latency profiles

## 🤝 Contributing

Part of dev-card-showcase. Contributions welcome!

## 📄 License

MIT License - See LICENSE file for details

## 🔗 Related Features

- Autonomous Compliance Deviation Tracker
- Secure Configuration Baseline Enforcer
- Contextual Intent Drift Analyzer
- Cold-Start Mitigation Layer

---

**Last Updated**: February 2026  
**Version**: 1.0.0  
**Status**: Production Ready
