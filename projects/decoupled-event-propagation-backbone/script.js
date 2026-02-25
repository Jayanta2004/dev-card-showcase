// Decoupled Event Propagation Backbone Script

// Global variables
let components = [];
let events = [];
let eventQueue = [];
let subscriptions = [];
let canvas, ctx;
let offsetX = 0, offsetY = 0;
let scale = 1;
let isRunning = false;
let selectedComponent = null;
let eventCounter = 0;
let metrics = {
    totalEvents: 0,
    activeComponents: 0,
    eventThroughput: 0,
    avgLatency: 0,
    queueSize: 0,
    errorRate: 0
};
let config = {
    propagationMode: 'async',
    maxQueueSize: 1000,
    eventTimeout: 5000,
    retryAttempts: 3,
    enableLogging: true,
    enableMetrics: true
};

// DOM elements
const architectureBtn = document.getElementById('architectureBtn');
const eventsBtn = document.getElementById('eventsBtn');
const monitoringBtn = document.getElementById('monitoringBtn');
const configBtn = document.getElementById('configBtn');
const helpBtn = document.getElementById('helpBtn');
const addComponentBtn = document.getElementById('addComponentBtn');
const addEventBtn = document.getElementById('addEventBtn');
const clearBtn = document.getElementById('clearBtn');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const fitBtn = document.getElementById('fitBtn');
const resetBtn = document.getElementById('resetBtn');
const configForm = document.getElementById('configForm');
const eventForm = document.getElementById('eventForm');
const componentForm = document.getElementById('componentForm');
const clearLogBtn = document.getElementById('clearLogBtn');
const resetConfigBtn = document.getElementById('resetConfigBtn');
const componentModal = document.getElementById('componentModal');
const sections = document.querySelectorAll('section');

// Event Bus Class
class EventBus {
    constructor() {
        this.subscribers = {};
        this.middlewares = [];
    }

    subscribe(eventType, callback, componentId) {
        if (!this.subscribers[eventType]) {
            this.subscribers[eventType] = [];
        }
        this.subscribers[eventType].push({ callback, componentId });
        log(`Component ${componentId} subscribed to ${eventType}`);
    }

    unsubscribe(eventType, componentId) {
        if (this.subscribers[eventType]) {
            this.subscribers[eventType] = this.subscribers[eventType].filter(
                sub => sub.componentId !== componentId
            );
        }
    }

    async publish(event) {
        event.id = ++eventCounter;
        event.timestamp = Date.now();
        events.push(event);
        updateMetrics();

        if (config.enableLogging) {
            logEvent(event);
        }

        if (config.propagationMode === 'sync') {
            this.processEventSync(event);
        } else if (config.propagationMode === 'async') {
            eventQueue.push(event);
            this.processQueue();
        } else if (config.propagationMode === 'batched') {
            this.batchEvent(event);
        }
    }

    processEventSync(event) {
        const subscribers = this.subscribers[event.type] || [];
        subscribers.forEach(sub => {
            try {
                sub.callback(event);
                log(`Event ${event.id} processed by ${sub.componentId}`);
            } catch (error) {
                log(`Error processing event ${event.id} by ${sub.componentId}: ${error.message}`, 'error');
            }
        });
    }

    async processQueue() {
        if (eventQueue.length === 0) return;

        const event = eventQueue.shift();
        metrics.queueSize = eventQueue.length;

        const subscribers = this.subscribers[event.type] || [];
        const promises = subscribers.map(async (sub) => {
            try {
                await this.processWithTimeout(sub.callback, event, config.eventTimeout);
                log(`Event ${event.id} processed by ${sub.componentId}`);
            } catch (error) {
                log(`Error processing event ${event.id} by ${sub.componentId}: ${error.message}`, 'error');
            }
        });

        await Promise.all(promises);
        updateDisplay();
    }

    async processWithTimeout(callback, event, timeout) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Event processing timeout'));
            }, timeout);

            callback(event).then(() => {
                clearTimeout(timer);
                resolve();
            }).catch(reject);
        });
    }

    batchEvent(event) {
        // Simplified batching - in real implementation, would collect events and process in batches
        this.processEventSync(event);
    }

    addMiddleware(middleware) {
        this.middlewares.push(middleware);
    }
}

const eventBus = new EventBus();

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupCanvas();
    setupEventListeners();
    loadConfig();
    updateDisplay();
    log('Event Propagation Backbone initialized');
}

// Canvas setup
function setupCanvas() {
    canvas = document.getElementById('architectureCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    draw();
}

// Event listeners
function setupEventListeners() {
    // Navigation
    architectureBtn.addEventListener('click', () => showSection('architecture'));
    eventsBtn.addEventListener('click', () => showSection('events'));
    monitoringBtn.addEventListener('click', () => showSection('monitoring'));
    configBtn.addEventListener('click', () => showSection('config'));
    helpBtn.addEventListener('click', () => showSection('help'));

    // Controls
    addComponentBtn.addEventListener('click', () => componentModal.style.display = 'block');
    addEventBtn.addEventListener('click', () => showSection('events'));
    clearBtn.addEventListener('click', clearAll);
    playBtn.addEventListener('click', startSimulation);
    pauseBtn.addEventListener('click', pauseSimulation);

    // Canvas controls
    zoomInBtn.addEventListener('click', () => zoom(1.2));
    zoomOutBtn.addEventListener('click', () => zoom(0.8));
    fitBtn.addEventListener('click', fitToScreen);
    resetBtn.addEventListener('click', resetView);

    // Forms
    configForm.addEventListener('submit', saveConfig);
    eventForm.addEventListener('submit', publishEvent);
    componentForm.addEventListener('submit', addComponent);

    // Other
    clearLogBtn.addEventListener('click', clearEventLog);
    resetConfigBtn.addEventListener('click', resetConfig);

    // Modals
    document.querySelectorAll('.close').forEach(close => {
        close.addEventListener('click', () => {
            componentModal.style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === componentModal) componentModal.style.display = 'none';
    });

    // Canvas events
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);
}

// Navigation
function showSection(sectionId) {
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`#${sectionId}Btn`).classList.add('active');
}

// Component management
function addComponent(e) {
    e.preventDefault();
    const name = document.getElementById('componentName').value;
    const type = document.getElementById('componentType').value;
    const description = document.getElementById('componentDescription').value;
    
    const component = {
        id: Date.now(),
        name,
        type,
        description,
        x: Math.random() * (canvas.width - 100) + 50,
        y: Math.random() * (canvas.height - 100) + 50,
        subscriptions: [],
        publishedEvents: [],
        status: 'idle',
        selected: false
    };
    
    components.push(component);
    
    // Auto-subscribe based on type
    if (type === 'subscriber' || type === 'processor') {
        eventBus.subscribe('user_action', (event) => handleComponentEvent(component, event), component.id);
        eventBus.subscribe('data_update', (event) => handleComponentEvent(component, event), component.id);
        component.subscriptions.push('user_action', 'data_update');
    }
    
    updateDisplay();
    log(`Added component: ${name} (${type})`);
    componentForm.reset();
    componentModal.style.display = 'none';
}

function handleComponentEvent(component, event) {
    component.status = 'processing';
    updateDisplay();
    
    // Simulate processing time
    setTimeout(() => {
        component.status = 'idle';
        component.publishedEvents.push(event.id);
        updateDisplay();
        
        // Some components might publish response events
        if (component.type === 'processor' && Math.random() > 0.7) {
            const responseEvent = {
                type: 'data_update',
                data: `Processed: ${event.data}`,
                source: component.id
            };
            eventBus.publish(responseEvent);
        }
    }, Math.random() * 1000 + 500);
}

function removeComponent(componentId) {
    components = components.filter(c => c.id !== componentId);
    eventBus.subscribers = {}; // Simplified cleanup
    updateDisplay();
    log(`Removed component: ${componentId}`);
}

// Event management
function publishEvent(e) {
    e.preventDefault();
    const type = document.getElementById('eventType').value;
    const data = document.getElementById('eventData').value;
    
    const event = {
        type,
        data,
        source: 'user'
    };
    
    eventBus.publish(event);
    eventForm.reset();
    log(`Published event: ${type} - ${data}`);
}

// Simulation
function startSimulation() {
    if (isRunning) return;
    isRunning = true;
    playBtn.disabled = true;
    pauseBtn.disabled = false;
    log('Simulation started');
    simulationLoop();
}

function pauseSimulation() {
    isRunning = false;
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    log('Simulation paused');
}

function simulationLoop() {
    if (!isRunning) return;
    
    // Generate random events
    if (Math.random() < 0.3) {
        const eventTypes = ['user_action', 'data_update', 'system_event', 'notification'];
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const event = {
            type: randomType,
            data: `Auto-generated ${randomType}`,
            source: 'simulation'
        };
        eventBus.publish(event);
    }
    
    setTimeout(simulationLoop, 2000);
}

// Configuration
function saveConfig(e) {
    e.preventDefault();
    config.propagationMode = document.getElementById('propagationMode').value;
    config.maxQueueSize = parseInt(document.getElementById('maxQueueSize').value);
    config.eventTimeout = parseInt(document.getElementById('eventTimeout').value);
    config.retryAttempts = parseInt(document.getElementById('retryAttempts').value);
    config.enableLogging = document.getElementById('enableLogging').checked;
    config.enableMetrics = document.getElementById('enableMetrics').checked;
    
    localStorage.setItem('eventConfig', JSON.stringify(config));
    log('Configuration saved');
    showSection('architecture');
}

function loadConfig() {
    const saved = localStorage.getItem('eventConfig');
    if (saved) {
        config = { ...config, ...JSON.parse(saved) };
        updateConfigForm();
    }
}

function updateConfigForm() {
    document.getElementById('propagationMode').value = config.propagationMode;
    document.getElementById('maxQueueSize').value = config.maxQueueSize;
    document.getElementById('eventTimeout').value = config.eventTimeout;
    document.getElementById('retryAttempts').value = config.retryAttempts;
    document.getElementById('enableLogging').checked = config.enableLogging;
    document.getElementById('enableMetrics').checked = config.enableMetrics;
}

function resetConfig() {
    config = {
        propagationMode: 'async',
        maxQueueSize: 1000,
        eventTimeout: 5000,
        retryAttempts: 3,
        enableLogging: true,
        enableMetrics: true
    };
    updateConfigForm();
    log('Configuration reset to defaults');
}

// Canvas interaction
function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offsetX) / scale;
    const y = (e.clientY - rect.top - offsetY) / scale;
    
    // Check if clicking on component
    for (let component of components) {
        const dx = x - component.x;
        const dy = y - component.y;
        if (dx * dx + dy * dy < 400) { // 20px radius squared
            selectedComponent = component;
            component.selected = true;
            updateComponentInfo(component);
            draw();
            return;
        }
    }
    
    selectedComponent = null;
    updateComponentInfo(null);
    draw();
}

function handleMouseMove(e) {
    // Could implement dragging here
}

function handleMouseUp() {
    // Handle component selection/deselection
}

function handleWheel(e) {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    zoom(zoomFactor, e.clientX, e.clientY);
}

function zoom(factor, centerX, centerY) {
    const rect = canvas.getBoundingClientRect();
    centerX = centerX || rect.left + rect.width / 2;
    centerY = centerY || rect.top + rect.height / 2;
    
    const mouseX = (centerX - rect.left - offsetX) / scale;
    const mouseY = (centerY - rect.top - offsetY) / scale;
    
    scale *= factor;
    scale = Math.max(0.1, Math.min(5, scale));
    
    offsetX = centerX - rect.left - mouseX * scale;
    offsetY = centerY - rect.top - mouseY * scale;
    
    draw();
}

function fitToScreen() {
    if (components.length === 0) return;
    
    const minX = Math.min(...components.map(c => c.x));
    const maxX = Math.max(...components.map(c => c.x));
    const minY = Math.min(...components.map(c => c.y));
    const maxY = Math.max(...components.map(c => c.y));
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const size = Math.max(maxX - minX, maxY - minY) + 100;
    
    scale = Math.min(canvas.width / size, canvas.height / size);
    offsetX = canvas.width / 2 - centerX * scale;
    offsetY = canvas.height / 2 - centerY * scale;
    
    draw();
}

function resetView() {
    offsetX = 0;
    offsetY = 0;
    scale = 1;
    draw();
}

// Drawing
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    
    // Draw connections
    drawConnections();
    
    // Draw components
    components.forEach(component => drawComponent(component));
    
    ctx.restore();
}

function drawComponent(component) {
    ctx.beginPath();
    ctx.arc(component.x, component.y, 20, 0, 2 * Math.PI);
    
    // Component color based on type and status
    let color = '#667eea';
    if (component.type === 'publisher') color = '#4CAF50';
    else if (component.type === 'subscriber') color = '#FF9800';
    else if (component.type === 'processor') color = '#9C27B0';
    else if (component.type === 'storage') color = '#607D8B';
    
    if (component.status === 'processing') color = '#FFC107';
    
    ctx.fillStyle = component.selected ? '#ff6b6b' : color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Label
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(component.name, component.x, component.y + 35);
    
    // Status indicator
    if (component.status === 'processing') {
        ctx.beginPath();
        ctx.arc(component.x + 15, component.y - 15, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFC107';
        ctx.fill();
    }
}

function drawConnections() {
    components.forEach(component => {
        component.subscriptions.forEach(eventType => {
            // Find components that publish this event type
            components.forEach(otherComponent => {
                if (otherComponent.id !== component.id && 
                    (otherComponent.type === 'publisher' || otherComponent.type === 'processor')) {
                    ctx.beginPath();
                    ctx.moveTo(component.x, component.y);
                    ctx.lineTo(otherComponent.x, otherComponent.y);
                    ctx.strokeStyle = '#ddd';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    
                    // Arrow head
                    const angle = Math.atan2(otherComponent.y - component.y, otherComponent.x - component.x);
                    const arrowLength = 10;
                    ctx.beginPath();
                    ctx.moveTo(otherComponent.x, otherComponent.y);
                    ctx.lineTo(
                        otherComponent.x - arrowLength * Math.cos(angle - Math.PI / 6),
                        otherComponent.y - arrowLength * Math.sin(angle - Math.PI / 6)
                    );
                    ctx.moveTo(otherComponent.x, otherComponent.y);
                    ctx.lineTo(
                        otherComponent.x - arrowLength * Math.cos(angle + Math.PI / 6),
                        otherComponent.y - arrowLength * Math.sin(angle + Math.PI / 6)
                    );
                    ctx.stroke();
                }
            });
        });
    });
}

// Monitoring
function updateMetrics() {
    metrics.totalEvents = events.length;
    metrics.activeComponents = components.filter(c => c.status === 'processing').length;
    metrics.queueSize = eventQueue.length;
    
    // Calculate throughput (events per second over last minute)
    const now = Date.now();
    const recentEvents = events.filter(e => now - e.timestamp < 60000);
    metrics.eventThroughput = recentEvents.length;
    
    // Calculate average latency (simplified)
    if (events.length > 0) {
        const latencies = events.map(e => Date.now() - e.timestamp);
        metrics.avgLatency = latencies.reduce((a, b) => a + b) / latencies.length;
    }
    
    // Error rate (simplified)
    const errorEvents = events.filter(e => e.type === 'error').length;
    metrics.errorRate = events.length > 0 ? (errorEvents / events.length * 100) : 0;
    
    updateMonitoringDisplay();
}

function updateMonitoringDisplay() {
    document.getElementById('totalEvents').textContent = metrics.totalEvents;
    document.getElementById('activeComponents').textContent = metrics.activeComponents;
    document.getElementById('eventThroughput').textContent = `${metrics.eventThroughput}/min`;
    document.getElementById('avgLatency').textContent = `${Math.round(metrics.avgLatency)}ms`;
    document.getElementById('queueSize').textContent = metrics.queueSize;
    document.getElementById('errorRate').textContent = `${metrics.errorRate.toFixed(1)}%`;
}

// Logging
function log(message) {
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
}

function logEvent(event) {
    const logEntry = document.createElement('div');
    logEntry.className = `event-entry ${event.type === 'error' ? 'error' : ''}`;
    logEntry.textContent = `[${new Date(event.timestamp).toLocaleTimeString()}] ${event.type}: ${event.data}`;
    document.getElementById('eventLog').appendChild(logEntry);
    document.getElementById('eventLog').scrollTop = document.getElementById('eventLog').scrollHeight;
}

function clearEventLog() {
    document.getElementById('eventLog').innerHTML = '';
    log('Event log cleared');
}

// Utility functions
function updateDisplay() {
    draw();
    updateMetrics();
    updateComponentInfo(selectedComponent);
}

function updateComponentInfo(component) {
    const info = document.getElementById('componentDetails');
    if (component) {
        info.innerHTML = `
            <strong>${component.name}</strong><br>
            Type: ${component.type}<br>
            Status: ${component.status}<br>
            Subscriptions: ${component.subscriptions.join(', ')}<br>
            Events Published: ${component.publishedEvents.length}
        `;
    } else {
        info.textContent = 'Click on a component to see details';
    }
}

function clearAll() {
    if (confirm('Are you sure you want to clear all components and events?')) {
        components = [];
        events = [];
        eventQueue = [];
        selectedComponent = null;
        metrics = {
            totalEvents: 0,
            activeComponents: 0,
            eventThroughput: 0,
            avgLatency: 0,
            queueSize: 0,
            errorRate: 0
        };
        updateDisplay();
        clearEventLog();
        log('All data cleared');
    }
}

// Initialize with sample data
function initializeSampleData() {
    const sampleComponents = [
        { name: 'User Interface', type: 'publisher' },
        { name: 'Data Processor', type: 'processor' },
        { name: 'Notification Service', type: 'subscriber' },
        { name: 'Database', type: 'storage' }
    ];
    
    sampleComponents.forEach(comp => {
        const component = {
            id: Date.now() + Math.random(),
            name: comp.name,
            type: comp.type,
            description: `Sample ${comp.type} component`,
            x: Math.random() * (canvas.width - 100) + 50,
            y: Math.random() * (canvas.height - 100) + 50,
            subscriptions: comp.type === 'subscriber' ? ['user_action', 'data_update'] : [],
            publishedEvents: [],
            status: 'idle',
            selected: false
        };
        components.push(component);
        
        if (comp.type === 'subscriber' || comp.type === 'processor') {
            eventBus.subscribe('user_action', (event) => handleComponentEvent(component, event), component.id);
            eventBus.subscribe('data_update', (event) => handleComponentEvent(component, event), component.id);
        }
    });
    
    fitToScreen();
    updateDisplay();
}

initializeSampleData();