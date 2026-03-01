# Intelligent Resource Elasticity Manager

A comprehensive web-based tool for managing intelligent resource elasticity and auto-scaling in cloud environments. This application simulates and demonstrates advanced resource management techniques with real-time monitoring, automated scaling policies, and interactive visualization.

## Features

- **Real-time Resource Monitoring**: Live tracking of CPU, memory, network, and storage metrics
- **Intelligent Auto-scaling**: Configurable scaling policies based on multiple metrics
- **Resource Management**: Add, configure, and monitor various resource types
- **Load Simulation**: Built-in load testing with configurable parameters
- **Interactive Dashboards**: Real-time charts and visualizations
- **Alert System**: Comprehensive alerting for resource thresholds and scaling events
- **Policy Engine**: Flexible scaling policies with cooldown periods and adjustment types
- **Data Persistence**: Local storage for configuration and historical data

## Resource Types

- **Compute Instance**: Virtual machines and containers
- **Storage Volume**: Block storage and file systems
- **Database**: Relational and NoSQL databases
- **Cache Cluster**: In-memory caching solutions
- **Load Balancer**: Traffic distribution systems

## Scaling Policies

### Policy Types
- **CPU-Based Scaling**: Scale based on CPU utilization thresholds
- **Memory-Based Scaling**: Scale based on memory usage thresholds
- **Request-Based Scaling**: Scale based on request rates
- **Schedule-Based Scaling**: Time-based scaling schedules
- **Custom Metric**: User-defined metric-based scaling

### Adjustment Types
- **Percentage**: Scale by percentage of current capacity
- **Absolute**: Scale by fixed number of instances

## How to Use

1. **Setup Resources**: Add resources using the "Add Resource" button with appropriate thresholds
2. **Configure Policies**: Create scaling policies with desired thresholds and adjustment rules
3. **Monitor Dashboard**: View real-time metrics and scaling events
4. **Run Simulations**: Test your scaling policies with the load simulation tool
5. **Review Alerts**: Monitor system health through the alerting system

## Dashboard Overview

### Metrics Cards
- **CPU Utilization**: Average CPU usage across all resources
- **Memory Usage**: Average memory consumption
- **Network I/O**: Total network throughput
- **Storage I/O**: Total storage operations per second

### Resource Allocation Chart
- Pie chart showing distribution of instances across resources
- Color-coded by resource type

### Scaling Events Timeline
- Real-time log of scaling actions
- Includes timestamps, resource names, and scaling reasons

## Resource Configuration

### Basic Settings
- **Resource Name**: Unique identifier for the resource
- **Resource Type**: Category of resource (compute, storage, etc.)
- **Instance Limits**: Minimum and maximum number of instances

### Scaling Thresholds
- **CPU Threshold**: CPU utilization percentage for scaling triggers
- **Memory Threshold**: Memory usage percentage for scaling triggers

## Policy Configuration

### Threshold Settings
- **Scale Up Threshold**: Metric value that triggers scaling out
- **Scale Down Threshold**: Metric value that triggers scaling in

### Timing Controls
- **Cooldown Period**: Minimum time between scaling actions (in seconds)

### Adjustment Parameters
- **Adjustment Type**: Percentage or absolute scaling
- **Adjustment Value**: Amount to scale (percentage or instance count)

## Load Simulation

### Configuration Options
- **Concurrent Users**: Number of simulated users
- **Request Rate**: Requests per second
- **Test Duration**: Length of simulation in minutes

### Simulation Features
- **Dynamic Load**: Variable load patterns to test scaling
- **Real-time Metrics**: Live monitoring during simulation
- **Automatic Scaling**: Policies trigger based on simulated load

## Monitoring & Alerts

### Alert Types
- **Critical**: System-threatening conditions
- **Warning**: Potential issues requiring attention
- **Info**: Informational messages and scaling events

### Alert Sources
- **Resource Thresholds**: Metric breaches
- **Scaling Actions**: Successful/failed scaling operations
- **System Events**: Configuration changes and system status

## Data Visualization

### Chart Types
- **Line Charts**: Time-series metric data
- **Pie Charts**: Resource allocation distribution
- **Status Indicators**: Real-time health status

### Time Ranges
- **Last Minute**: High-frequency recent data
- **Last 5 Minutes**: Short-term trends
- **Last 15 Minutes**: Medium-term analysis
- **Last Hour**: Long-term overview

## Keyboard Shortcuts

- `Ctrl+R`: Refresh dashboard
- `Ctrl+N`: Add new resource
- `Ctrl+P`: Create new policy
- `Space`: Start/stop simulation
- `Escape`: Close modals

## Best Practices

### Resource Configuration
1. Set appropriate minimum instances for baseline capacity
2. Configure maximum instances based on budget constraints
3. Set CPU/memory thresholds with buffer for normal fluctuations

### Policy Design
1. Use cooldown periods to prevent scaling thrashing
2. Start with conservative thresholds and adjust based on monitoring
3. Combine multiple policies for comprehensive coverage

### Monitoring Strategy
1. Regularly review scaling events and alert history
2. Monitor resource utilization patterns over time
3. Adjust policies based on actual workload characteristics

## API Reference

### Resource Object
```javascript
{
    id: "unique_id",
    name: "Resource Name",
    type: "compute|storage|database|cache|load-balancer",
    minInstances: 1,
    maxInstances: 10,
    currentInstances: 3,
    cpuThreshold: 70,
    memoryThreshold: 80,
    metrics: {
        cpu: 45,
        memory: 60,
        network: 150,
        storage: 75
    },
    status: "healthy|warning|error"
}
```

### Policy Object
```javascript
{
    id: "unique_id",
    name: "Policy Name",
    type: "cpu-based|memory-based|request-based|schedule-based|custom",
    scaleUpThreshold: 70,
    scaleDownThreshold: 30,
    cooldownPeriod: 300,
    adjustmentType: "percent|absolute",
    adjustmentValue: 20,
    lastScaling: null,
    enabled: true
}
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Technologies Used

- **HTML5**: Semantic markup and canvas elements
- **CSS3**: Modern styling with animations and responsive design
- **JavaScript ES6+**: Classes, async/await, and modern APIs
- **Canvas API**: Real-time charting and visualization
- **Local Storage**: Data persistence

## Performance Considerations

- Metrics updates every 2 seconds for real-time monitoring
- Chart data limited to last 50 data points
- Automatic cleanup of old alerts and events
- Efficient canvas rendering for smooth animations

## Troubleshooting

### Common Issues
1. **Scaling Not Triggering**: Check threshold values and cooldown periods
2. **High CPU Usage**: Reduce monitoring frequency or optimize chart rendering
3. **Data Not Persisting**: Check browser local storage permissions

### Debug Information
- Open browser console for detailed logging
- Check local storage for saved configuration
- Review alert history for system events

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Update documentation as needed
5. Submit a pull request

## Future Enhancements

- Cloud provider integrations (AWS, Azure, GCP)
- Advanced scaling algorithms (predictive scaling)
- Multi-region resource management
- Cost optimization recommendations
- Historical data export and analysis
- Custom metric definitions
- Alert notification integrations
- Resource dependency mapping

## License

This project is part of the dev-card-showcase and follows the same license terms.

## Contact

For questions or feedback, please visit the main dev-card-showcase repository.