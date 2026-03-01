// Distributed Event Orchestration Hub - JavaScript Implementation

class DistributedEventOrchestrationHub {
    constructor() {
        this.services = [];
        this.events = [];
        this.eventQueue = [];
        this.processedEvents = [];
        this.eventBus = new EventBus();
        this.isRunning = false;
        this.eventCounter = 0;
        this.orchestrationMode = 'sequential';

        this.metrics = {
            throughput: 0,
            avgLatency: 0,
            errorRate: 0,
            successRate: 100
        };

        this.initializeElements();
        this.bindEvents();
        this.initializeCanvas();
        this.createServices();
        this.updateUI();
    }

    initializeElements() {
        // Control elements
        this.serviceCountInput = document.getElementById('serviceCount');
        this.serviceCountValue = document.getElementById('serviceCountValue');
        this.eventRateSelect = document.getElementById('eventRate');
        this.orchestrationModeSelect = document.getElementById('orchestrationMode');
        this.startBtn = document.getElementById('startOrchestration');
        this.stopBtn = document.getElementById('stopOrchestration');
        this.resetBtn = document.getElementById('resetSystem');
        this.injectEventBtn = document.getElementById('injectEvent');
        this.eventTypeSelect = document.getElementById('eventType');
        this.eventDataInput = document.getElementById('eventData');

        // Service elements
        this.servicesGrid = document.getElementById('servicesGrid');
        this.busStatus = document.getElementById('busStatus');
        this.totalEventsEl = document.getElementById('totalEvents');
        this.pendingEventsEl = document.getElementById('pendingEvents');
        this.processedEventsEl = document.getElementById('processedEvents');

        // Flow elements
        this.showDependenciesBtn = document.getElementById('showDependencies');
        this.showTimelineBtn = document.getElementById('showTimeline');
        this.showErrorsBtn = document.getElementById('showErrors');
        this.flowCanvas = document.getElementById('flowCanvas');

        // Monitoring elements
        this.throughputEl = document.getElementById('throughput');
        this.avgLatencyEl = document.getElementById('avgLatency');
        this.errorRateEl = document.getElementById('errorRate');
        this.successRateEl = document.getElementById('successRate');
        this.eventLogs = document.getElementById('eventLogs');

        // Modal elements
        this.dependencyModal = document.getElementById('dependencyModal');
        this.closeDependencyModal = document.getElementById('closeDependencyModal');
        this.dependencyGraph = document.getElementById('dependencyGraph');
    }

    bindEvents() {
        this.serviceCountInput.addEventListener('input', (e) => {
            this.serviceCountValue.textContent = e.target.value;
            this.createServices();
            this.updateUI();
        });

        this.orchestrationModeSelect.addEventListener('change', (e) => {
            this.orchestrationMode = e.target.value;
            this.addLogEntry('system', `Orchestration mode changed to ${this.orchestrationMode}`);
        });

        this.startBtn.addEventListener('click', () => this.startOrchestration());
        this.stopBtn.addEventListener('click', () => this.stopOrchestration());
        this.resetBtn.addEventListener('click', () => this.resetSystem());
        this.injectEventBtn.addEventListener('click', () => this.injectCustomEvent());

        this.showDependenciesBtn.addEventListener('click', () => this.showDependencyGraph());
        this.showTimelineBtn.addEventListener('click', () => this.showTimelineView());
        this.showErrorsBtn.addEventListener('click', () => this.showErrorsView());

        this.closeDependencyModal.addEventListener('click', () => this.hideDependencyModal());
        this.dependencyModal.addEventListener('click', (e) => {
            if (e.target === this.dependencyModal) this.hideDependencyModal();
        });
    }

    initializeCanvas() {
        this.canvas = this.flowCanvas;
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.drawFlow();
    }

    createServices() {
        const serviceCount = parseInt(this.serviceCountInput.value);
        this.services = [];

        const serviceTypes = [
            { name: 'User Service', icon: 'fas fa-user', color: '#2563eb' },
            { name: 'Order Service', icon: 'fas fa-shopping-cart', color: '#10b981' },
            { name: 'Payment Service', icon: 'fas fa-credit-card', color: '#f59e0b' },
            { name: 'Inventory Service', icon: 'fas fa-boxes', color: '#ef4444' },
            { name: 'Notification Service', icon: 'fas fa-bell', color: '#8b5cf6' },
            { name: 'Analytics Service', icon: 'fas fa-chart-bar', color: '#06b6d4' },
            { name: 'Audit Service', icon: 'fas fa-shield-alt', color: '#84cc16' },
            { name: 'Cache Service', icon: 'fas fa-database', color: '#f97316' }
        ];

        for (let i = 0; i < serviceCount; i++) {
            const serviceType = serviceTypes[i % serviceTypes.length];
            const service = {
                id: i + 1,
                name: serviceType.name,
                icon: serviceType.icon,
                color: serviceType.color,
                status: 'idle',
                queue: [],
                processed: 0,
                errors: 0,
                dependencies: this.generateDependencies(i, serviceCount),
                position: this.calculateServicePosition(i, serviceCount)
            };
            this.services.push(service);
        }

        this.renderServices();
    }

    generateDependencies(serviceIndex, totalServices) {
        const dependencies = [];
        const dependencyCount = Math.min(Math.floor(Math.random() * 3) + 1, serviceIndex);

        for (let i = 0; i < dependencyCount; i++) {
            const depIndex = Math.floor(Math.random() * serviceIndex);
            if (!dependencies.includes(depIndex + 1)) {
                dependencies.push(depIndex + 1);
            }
        }

        return dependencies;
    }

    calculateServicePosition(index, total) {
        const centerX = this.canvas.width / (2 * window.devicePixelRatio);
        const centerY = this.canvas.height / (2 * window.devicePixelRatio);
        const radius = Math.min(centerX, centerY) * 0.7;
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2;

        return {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
        };
    }

    renderServices() {
        this.servicesGrid.innerHTML = '';

        this.services.forEach(service => {
            const serviceCard = document.createElement('div');
            serviceCard.className = `service-node ${service.status}`;
            serviceCard.innerHTML = `
                <div class="service-icon">
                    <i class="${service.icon}"></i>
                </div>
                <div class="service-name">${service.name}</div>
                <div class="service-status">${service.status.toUpperCase()}</div>
                <div class="service-queue">Queue: ${service.queue.length}</div>
            `;
            this.servicesGrid.appendChild(serviceCard);
        });
    }

    startOrchestration() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.resetBtn.disabled = true;

        this.addLogEntry('system', 'Orchestration started - Event processing initiated');
        this.startEventGeneration();
        this.startEventProcessing();
    }

    stopOrchestration() {
        this.isRunning = false;
        clearInterval(this.eventGenerationInterval);
        clearInterval(this.eventProcessingInterval);

        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.resetBtn.disabled = false;

        this.addLogEntry('system', 'Orchestration stopped - Event processing halted');
    }

    resetSystem() {
        this.stopOrchestration();

        this.events = [];
        this.eventQueue = [];
        this.processedEvents = [];
        this.eventCounter = 0;

        this.services.forEach(service => {
            service.status = 'idle';
            service.queue = [];
            service.processed = 0;
            service.errors = 0;
        });

        this.metrics = {
            throughput: 0,
            avgLatency: 0,
            errorRate: 0,
            successRate: 100
        };

        this.renderServices();
        this.updateUI();
        this.drawFlow();
        this.clearLogs();
        this.addLogEntry('system', 'System reset - All services and events cleared');
    }

    startEventGeneration() {
        const rates = {
            slow: 1000,
            medium: 500,
            fast: 200,
            burst: () => Math.random() > 0.7 ? 100 : 2000
        };

        const generateEvent = () => {
            if (!this.isRunning) return;

            const event = this.generateRandomEvent();
            this.eventBus.publish(event);
            this.addLogEntry('event', `Event ${event.id} generated: ${event.type} - ${event.data}`);

            const rate = this.eventRateSelect.value;
            const delay = typeof rates[rate] === 'function' ? rates[rate]() : rates[rate];
            this.eventGenerationInterval = setTimeout(generateEvent, delay);
        };

        generateEvent();
    }

    startEventProcessing() {
        this.eventProcessingInterval = setInterval(() => {
            if (!this.isRunning) return;

            this.processEvents();
            this.updateMetrics();
            this.updateUI();
        }, 100);
    }

    generateRandomEvent() {
        this.eventCounter++;
        const eventTypes = ['user_action', 'data_update', 'system_alert', 'payment', 'notification'];
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

        const eventData = {
            user_action: ['User logged in', 'User updated profile', 'User made purchase', 'User logged out'],
            data_update: ['Record created', 'Record updated', 'Record deleted', 'Bulk import completed'],
            system_alert: ['High CPU usage', 'Memory warning', 'Disk space low', 'Network latency'],
            payment: ['Payment processed', 'Refund issued', 'Payment failed', 'Subscription renewed'],
            notification: ['Email sent', 'SMS delivered', 'Push notification sent', 'Alert triggered']
        };

        const data = eventData[eventType][Math.floor(Math.random() * eventData[eventType].length)];

        return {
            id: this.eventCounter,
            type: eventType,
            data: data,
            timestamp: Date.now(),
            priority: Math.floor(Math.random() * 5) + 1,
            dependencies: this.generateEventDependencies()
        };
    }

    generateEventDependencies() {
        // Some events depend on previous events
        if (this.events.length > 0 && Math.random() > 0.7) {
            const recentEvents = this.events.slice(-3);
            return recentEvents
                .filter(() => Math.random() > 0.5)
                .map(event => event.id);
        }
        return [];
    }

    injectCustomEvent() {
        const eventType = this.eventTypeSelect.value;
        const eventData = this.eventDataInput.value.trim() || 'Custom event data';

        if (!eventData) return;

        this.eventCounter++;
        const event = {
            id: this.eventCounter,
            type: eventType,
            data: eventData,
            timestamp: Date.now(),
            priority: 5, // High priority for injected events
            dependencies: [],
            injected: true
        };

        this.eventBus.publish(event);
        this.addLogEntry('event', `Custom event ${event.id} injected: ${event.type} - ${event.data}`);
        this.eventDataInput.value = '';
    }

    processEvents() {
        // Process events based on orchestration mode
        switch (this.orchestrationMode) {
            case 'sequential':
                this.processSequential();
                break;
            case 'parallel':
                this.processParallel();
                break;
            case 'dependency':
                this.processWithDependencies();
                break;
            case 'priority':
                this.processByPriority();
                break;
        }
    }

    processSequential() {
        if (this.eventBus.queue.length === 0) return;

        const event = this.eventBus.queue.shift();
        this.processEvent(event);
    }

    processParallel() {
        const maxConcurrent = Math.min(3, this.services.length);
        let processed = 0;

        while (processed < maxConcurrent && this.eventBus.queue.length > 0) {
            const event = this.eventBus.queue.shift();
            this.processEvent(event);
            processed++;
        }
    }

    processWithDependencies() {
        // Process events respecting dependencies
        const readyEvents = this.eventBus.queue.filter(event => {
            return event.dependencies.every(depId =>
                this.processedEvents.some(pe => pe.event.id === depId)
            );
        });

        readyEvents.slice(0, 3).forEach(event => {
            const index = this.eventBus.queue.indexOf(event);
            if (index > -1) {
                this.eventBus.queue.splice(index, 1);
                this.processEvent(event);
            }
        });
    }

    processByPriority() {
        if (this.eventBus.queue.length === 0) return;

        // Sort by priority (highest first) and process top event
        this.eventBus.queue.sort((a, b) => b.priority - a.priority);
        const event = this.eventBus.queue.shift();
        this.processEvent(event);
    }

    processEvent(event) {
        // Find appropriate service for event type
        const service = this.findServiceForEvent(event);
        if (!service) return;

        service.status = 'processing';
        service.queue.push(event);

        // Simulate processing time
        const processingTime = 500 + Math.random() * 1500;

        setTimeout(() => {
            const success = Math.random() > 0.1; // 90% success rate

            if (success) {
                service.processed++;
                this.processedEvents.push({
                    event: event,
                    service: service.id,
                    processedAt: Date.now(),
                    latency: Date.now() - event.timestamp
                });
                this.addLogEntry('success', `Event ${event.id} processed by ${service.name}`);
            } else {
                service.errors++;
                this.addLogEntry('error', `Event ${event.id} failed in ${service.name}`);
            }

            service.status = 'idle';
            service.queue.shift();
            this.renderServices();
            this.drawFlow();
        }, processingTime);
    }

    findServiceForEvent(event) {
        // Map event types to services
        const serviceMapping = {
            user_action: ['User Service'],
            data_update: ['Order Service', 'Inventory Service'],
            system_alert: ['Analytics Service', 'Audit Service'],
            payment: ['Payment Service'],
            notification: ['Notification Service']
        };

        const possibleServices = serviceMapping[event.type] || [];
        const availableServices = this.services.filter(s =>
            possibleServices.includes(s.name) && s.status === 'idle'
        );

        return availableServices.length > 0
            ? availableServices[Math.floor(Math.random() * availableServices.length)]
            : this.services.find(s => s.status === 'idle');
    }

    updateMetrics() {
        const now = Date.now();
        const recentEvents = this.processedEvents.filter(pe => now - pe.processedAt < 60000); // Last minute

        this.metrics.throughput = recentEvents.length / 60; // events per second
        this.metrics.avgLatency = recentEvents.length > 0
            ? recentEvents.reduce((sum, pe) => sum + pe.latency, 0) / recentEvents.length
            : 0;

        const totalProcessed = this.processedEvents.length;
        const totalErrors = this.services.reduce((sum, s) => sum + s.errors, 0);
        this.metrics.errorRate = totalProcessed > 0 ? (totalErrors / totalProcessed) * 100 : 0;
        this.metrics.successRate = 100 - this.metrics.errorRate;
    }

    updateUI() {
        // Update bus status
        this.totalEventsEl.textContent = `${this.eventCounter} Events`;
        this.pendingEventsEl.textContent = `${this.eventBus.queue.length} Pending`;
        this.processedEventsEl.textContent = `${this.processedEvents.length} Processed`;

        // Update metrics
        this.throughputEl.textContent = this.metrics.throughput.toFixed(1);
        this.avgLatencyEl.textContent = Math.round(this.metrics.avgLatency);
        this.errorRateEl.textContent = this.metrics.errorRate.toFixed(1);
        this.successRateEl.textContent = this.metrics.successRate.toFixed(1);
    }

    drawFlow() {
        this.ctx.clearRect(0, 0, this.canvas.width / window.devicePixelRatio, this.canvas.height / window.devicePixelRatio);

        // Draw service nodes
        this.services.forEach(service => {
            this.drawServiceNode(service);
        });

        // Draw event flows
        this.drawEventFlows();
    }

    drawServiceNode(service) {
        const { x, y } = service.position;
        const radius = 30;

        // Draw node circle
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = service.status === 'processing' ? service.color : '#e2e8f0';
        this.ctx.fill();
        this.ctx.strokeStyle = service.color;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Draw service icon (simplified)
        this.ctx.fillStyle = service.status === 'processing' ? '#ffffff' : service.color;
        this.ctx.font = '16px FontAwesome';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('●', x, y + 6);

        // Draw service name
        this.ctx.fillStyle = '#1e293b';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(service.name.split(' ')[0], x, y + 50);
    }

    drawEventFlows() {
        // Draw connections between services
        this.services.forEach(service => {
            service.dependencies.forEach(depId => {
                const depService = this.services.find(s => s.id === depId);
                if (depService) {
                    this.drawConnection(service, depService);
                }
            });
        });

        // Draw active event flows
        this.services.forEach(service => {
            if (service.queue.length > 0) {
                const event = service.queue[0];
                const targetService = this.services.find(s => s.id === service.id);
                if (targetService) {
                    this.drawActiveFlow(event, targetService);
                }
            }
        });
    }

    drawConnection(from, to) {
        this.ctx.beginPath();
        this.ctx.moveTo(from.position.x, from.position.y);
        this.ctx.lineTo(to.position.x, to.position.y);
        this.ctx.strokeStyle = '#cbd5e1';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    drawActiveFlow(event, service) {
        const centerX = this.canvas.width / (2 * window.devicePixelRatio);
        const centerY = this.canvas.height / (2 * window.devicePixelRatio);

        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(service.position.x, service.position.y);
        this.ctx.strokeStyle = this.getEventColor(event.type);
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }

    getEventColor(type) {
        const colors = {
            user_action: '#2563eb',
            data_update: '#10b981',
            system_alert: '#f59e0b',
            payment: '#ef4444',
            notification: '#8b5cf6'
        };
        return colors[type] || '#64748b';
    }

    addLogEntry(type, message) {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;

        const icon = {
            system: 'fas fa-cog',
            event: 'fas fa-bolt',
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-triangle'
        }[type] || 'fas fa-info-circle';

        logEntry.innerHTML = `
            <i class="${icon}"></i>
            <span>${new Date().toLocaleTimeString()}: ${message}</span>
        `;

        this.eventLogs.appendChild(logEntry);
        this.eventLogs.scrollTop = this.eventLogs.scrollHeight;

        // Keep only last 50 entries
        while (this.eventLogs.children.length > 50) {
            this.eventLogs.removeChild(this.eventLogs.firstChild);
        }
    }

    clearLogs() {
        this.eventLogs.innerHTML = '<div class="log-entry system"><i class="fas fa-cog"></i><span>System initialized - Ready for orchestration</span></div>';
    }

    showDependencyGraph() {
        this.dependencyModal.classList.add('active');
        this.renderDependencyGraph();
    }

    hideDependencyModal() {
        this.dependencyModal.classList.remove('active');
    }

    renderDependencyGraph() {
        this.dependencyGraph.innerHTML = '';

        const graphContainer = document.createElement('div');
        graphContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            padding: 20px;
        `;

        this.services.forEach(service => {
            const serviceCard = document.createElement('div');
            serviceCard.style.cssText = `
                background: ${service.color}20;
                border: 2px solid ${service.color};
                border-radius: 8px;
                padding: 15px;
                text-align: center;
            `;

            serviceCard.innerHTML = `
                <div style="font-size: 1.5rem; margin-bottom: 10px;">
                    <i class="${service.icon}" style="color: ${service.color};"></i>
                </div>
                <div style="font-weight: 600; margin-bottom: 10px;">${service.name}</div>
                <div style="font-size: 0.9rem; color: #64748b;">
                    Depends on: ${service.dependencies.length > 0
                        ? service.dependencies.map(id => `S${id}`).join(', ')
                        : 'None'}
                </div>
            `;

            graphContainer.appendChild(serviceCard);
        });

        this.dependencyGraph.appendChild(graphContainer);
    }

    showTimelineView() {
        // Switch to timeline view
        this.showDependenciesBtn.classList.remove('active');
        this.showTimelineBtn.classList.add('active');
        this.showErrorsBtn.classList.remove('active');
        // Implementation for timeline view would go here
    }

    showErrorsView() {
        // Switch to errors view
        this.showDependenciesBtn.classList.remove('active');
        this.showTimelineBtn.classList.remove('active');
        this.showErrorsBtn.classList.add('active');
        // Implementation for errors view would go here
    }
}

// Event Bus Implementation
class EventBus {
    constructor() {
        this.queue = [];
        this.subscribers = {};
    }

    publish(event) {
        this.queue.push(event);
        this.notifySubscribers(event);
    }

    subscribe(eventType, callback) {
        if (!this.subscribers[eventType]) {
            this.subscribers[eventType] = [];
        }
        this.subscribers[eventType].push(callback);
    }

    notifySubscribers(event) {
        const subscribers = this.subscribers[event.type] || [];
        subscribers.forEach(callback => callback(event));
    }
}

// Initialize the orchestration hub when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DistributedEventOrchestrationHub();
});