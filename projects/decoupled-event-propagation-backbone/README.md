# Decoupled Event Propagation Backbone

A web-based demonstration of a decoupled event propagation system for managing event-driven architectures with loosely coupled components.

## Features

- **Event Bus Architecture**: Centralized event management with publish/subscribe pattern
- **Component Visualization**: Interactive canvas showing component relationships and event flow
- **Multiple Propagation Modes**: Synchronous, asynchronous, and batched event processing
- **Real-time Monitoring**: Live metrics dashboard with throughput, latency, and error tracking
- **Event Logging**: Detailed event history with filtering and search
- **Configurable Settings**: Customizable timeouts, queue sizes, and retry mechanisms
- **Simulation Mode**: Automated event generation for testing and demonstration

## How to Use

1. Open `index.html` in a web browser
2. Add components using the "Add Component" button (publishers, subscribers, processors, storage)
3. Publish events manually or start the simulation
4. Watch events propagate through the system in the Architecture view
5. Monitor performance metrics in the Monitoring section
6. Adjust configuration settings as needed

## Architecture Components

- **Publisher**: Components that generate and publish events
- **Subscriber**: Components that listen for and react to events
- **Processor**: Components that both subscribe to and publish events
- **Storage**: Components that persist event data

## Event Types

- **user_action**: User interface interactions
- **data_update**: Data changes or updates
- **system_event**: Internal system notifications
- **error**: Error conditions and exceptions
- **notification**: General notifications

## Propagation Modes

- **Synchronous**: Events processed immediately by all subscribers
- **Asynchronous**: Events queued and processed in background threads
- **Batched**: Multiple events grouped and processed together for efficiency

## Configuration Options

- **Max Queue Size**: Maximum number of events in the processing queue
- **Event Timeout**: Maximum time allowed for event processing
- **Retry Attempts**: Number of retry attempts for failed event processing
- **Logging**: Enable/disable event logging
- **Metrics**: Enable/disable performance metrics collection

## Monitoring Metrics

- **Total Events**: Total number of events processed
- **Active Components**: Number of components currently processing events
- **Event Throughput**: Events processed per minute
- **Average Latency**: Average processing time per event
- **Queue Size**: Current number of events waiting to be processed
- **Error Rate**: Percentage of events that resulted in errors

## Keyboard Shortcuts

- `Ctrl+N`: Add new component
- `Ctrl+E`: Publish event
- `Space`: Start/stop simulation
- `Delete`: Remove selected component

## Best Practices

1. **Component Design**: Keep components focused on single responsibilities
2. **Event Naming**: Use descriptive, consistent event names
3. **Error Handling**: Implement proper error handling in event callbacks
4. **Performance Monitoring**: Regularly monitor system performance metrics
5. **Scalability**: Design components to handle increased event volumes

## API Reference

### EventBus Class

```javascript
const eventBus = new EventBus();

// Subscribe to events
eventBus.subscribe('eventType', callback, componentId);

// Publish events
await eventBus.publish({ type: 'eventType', data: 'payload' });

// Unsubscribe
eventBus.unsubscribe('eventType', componentId);
```

### Component Structure

```javascript
{
    id: 'unique_id',
    name: 'Component Name',
    type: 'publisher|subscriber|processor|storage',
    subscriptions: ['eventType1', 'eventType2'],
    status: 'idle|processing'
}
```

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Technologies Used

- HTML5 Canvas for component visualization
- CSS3 for styling and animations
- JavaScript (ES6+) with async/await for event processing
- No external dependencies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the dev-card-showcase and follows the same license terms.

## Future Enhancements

- Event filtering and routing rules
- Component clustering and grouping
- Historical event replay
- Distributed event bus simulation
- Performance profiling tools
- Export/import of system configurations
- Real-time collaboration features

## Contact

For questions or feedback, please visit the main dev-card-showcase repository.