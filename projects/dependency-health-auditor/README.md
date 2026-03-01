# Dependency Health Auditor

A comprehensive monitoring subsystem that continuously evaluates the operational health of third-party and internal service dependencies through periodic health probes, response-time benchmarking, and anomaly scoring.

![Status: Active](https://img.shields.io/badge/status-active-brightgreen)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

## 🎯 Features

### Core Functionality
- **Periodic Health Probes**: Automatic health checks at configurable intervals
- **Response-Time Benchmarking**: Track and analyze service response times
- **Anomaly Detection**: Real-time identification of unusual patterns
- **Health Scoring**: Comprehensive scoring system for each dependency
- **Uptime Tracking**: Monitor service availability and reliability

### Dashboard
- **Real-time Monitoring**: Live health status of all dependencies
- **Summary Cards**: Quick overview of system health
- **Dependency List**: Detailed view of each service with metrics
- **Anomaly Alerts**: Track detected anomalies and issues
- **Performance Metrics**: Visualize response times and health trends

### Visualizations
- **Health Timeline**: Historical view of system health
- **Response Time Distribution**: Histogram of response times
- **Health Score Chart**: Pie chart showing dependency status breakdown

## 🚀 Getting Started

### Basic Usage

```html
<script src="auditor.js"></script>
<script>
    // Initialize the auditor
    const auditor = new DependencyHealthAuditor();
    
    // Start monitoring
    auditor.start();
    
    // Stop monitoring
    auditor.stop();
    
    // Clear collected data
    auditor.clearData();
</script>
```

### HTML Integration

Include all necessary files:
```html
<link rel="stylesheet" href="styles.css">
<script src="auditor.js"></script>
```

The interface provides:
- Dashboard with system metrics
- Dependency status list
- Anomaly detection panel
- Performance metrics visualization

## 📊 Dependency Configuration

Default dependencies are automatically loaded:

- **API Gateway** - HTTP service endpoint
- **Primary Database** - Database server
- **Redis Cache** - In-memory cache
- **Authentication Service** - Auth endpoint
- **Message Queue** - Event streaming system
- **Search Engine** - Full-text search service

Each dependency includes:
- Endpoint configuration
- Timeout settings
- Expected response times
- Health scoring metrics

## 🔍 How It Works

### Health Probe Process

1. **Periodic Execution**: Probes run at 30-second intervals
2. **Connection Attempt**: Service endpoint is probed
3. **Response Analysis**: Response time and status are recorded
4. **Score Calculation**: Health score updated based on performance
5. **Anomaly Detection**: Patterns analyzed for anomalies

### Health Scoring

Scores range from 0-100:
- **100**: Optimal performance
- **70-99**: Normal operation
- **40-69**: Degraded performance
- **0-39**: Critical issues

Factors affecting score:
- Response time variance
- Failure rate
- Consecutive failures
- Recovery pattern

### Anomaly Detection

Detected anomalies include:
- **SERVICE_UNAVAILABLE**: Service not responding
- **RESPONSE_TIME_SPIKE**: Unusually slow responses
- **HEALTH_DEGRADATION**: Declining health scores

## 📈 Metrics Tracked

### Per-Dependency Metrics
- Response time (average, min, max)
- Health score (0-100)
- Anomaly score (0-100)
- Uptime percentage
- Consecutive failures
- Last probe timestamp

### System-Wide Metrics
- Total probes executed
- Failed probes count
- System uptime percentage
- Global anomaly score
- Average response time

## 🛠️ Advanced Configuration

### Customizing Dependencies

```javascript
const auditor = new DependencyHealthAuditor();

// Add custom dependency
auditor.dependencies.push({
    id: 'payment-gateway',
    name: 'Payment Gateway',
    type: 'service',
    endpoint: 'https://payments.example.com/health',
    timeout: 5000,
    expectedResponseTime: 250,
    status: 'unknown',
    healthScore: 100
});
```

### Adjusting Probe Interval

```javascript
const auditor = new DependencyHealthAuditor();
auditor.probeInterval = 15000; // 15 seconds
auditor.start();
```

## 📱 UI Components

### Summary Cards
Four key metrics at a glance:
- Total Dependencies
- Healthy Services
- Warning Status
- Critical Issues

### Dependency View
Detailed information for each service:
- Name and type
- Current status
- Response time
- Health score
- Uptime percentage

### Anomaly Alerts
Real-time anomaly notifications:
- Type of anomaly
- Affected service
- Severity level
- Detailed message

### Charts
Visual representations:
- Line chart for health timeline
- Histogram for response times
- Pie chart for status distribution

## 🔌 Integration Points

### UI Update System
- Auto-refresh dashboard
- Real-time status updates
- Metric calculations

### Data Storage
- In-memory history (last 100 records)
- Recent anomalies (last 10)
- Response time samples

### Extensibility
- Event system ready
- Webhook integration points
- Custom metric support

## 📊 Data Management

### History Retention
- Health snapshots: 100 records
- Anomalies: 10 recent items
- Response times: Full sample set

### Clearing Data
```javascript
auditor.clearData(); // Reset all metrics
```

## 🎨 Customization

### Styling
CSS variables for easy theming:
```css
:root {
    --color-primary: #6366f1;
    --color-success: #10b981;
    --color-warning: #f59e0b;
    --color-danger: #ef4444;
}
```

### Responsive Design
- Mobile-optimized interface
- Adaptive grid layouts
- Touch-friendly controls

## 🚨 Status Indicators

- **✅ Healthy**: Service operating normally
- **⚠️ Warning**: Performance issues detected
- **🚨 Critical**: Service unavailable or failing
- **❓ Unknown**: Not yet probed

## 📈 Use Cases

1. **System Reliability**: Monitor critical service dependencies
2. **SLA Compliance**: Track uptime and performance metrics
3. **Incident Detection**: Early warning for service issues
4. **Performance Analysis**: Identify bottlenecks and trends
5. **Capacity Planning**: Understand service load patterns

## 🔐 Security Considerations

- Probes use simulated endpoints (no real network calls in demo)
- For production: implement authenticated endpoints
- Sensitive data: excluded from logs
- Error messages: sanitized for display

## 🧪 Testing

The auditor includes:
- Simulated probe responses
- Realistic network delays
- Occasional failure scenarios
- Performance calculations

## 📝 API Reference

### Methods

#### `start()`
Begin the audit process with periodic probes.

#### `stop()`
Halt the audit and clear the probe timer.

#### `clearData()`
Reset all collected metrics and history.

#### `runProbes()`
Execute a single round of probes for all dependencies.

#### `detectAnomalies()`
Analyze current data for anomalies.

#### `getAverageHealthScore()`
Get system-wide average health score.

## 🤝 Contributing

This component is part of the dev-card-showcase project. Contributions welcome!

## 📄 License

MIT License - See LICENSE file for details

## 🔗 Related Features

- Error Monitoring Dashboard
- Performance Analytics
- Service Discovery
- Load Balancing
- Incident Management

---

**Last Updated**: February 2026
**Version**: 1.0.0
**Status**: Production Ready
