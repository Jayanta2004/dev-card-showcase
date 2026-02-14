// Messaging Module
// Handles cross-window communication using postMessage API

class WindowMessenger {
    constructor(role) {
        this.role = role;
        this.targetWindow = null;
        this.messageQueue = [];
        this.messageHandlers = new Map();
        this.connectionCallbacks = new Set();
        this.isConnected = false;
        this.heartbeatInterval = null;
        this.heartbeatTimeout = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;

        this.setupMessageListener();
        this.startHeartbeat();
    }

    setupMessageListener() {
        window.addEventListener('message', (event) => {
            if (event.source === window) return;

            try {
                const message = event.data;

                if (!message.type || !message.source) {
                    return;
                }

                if (message.type === 'parasitecontrol:ping') {
                    this.handlePing(event.source);
                    return;
                }

                if (message.type === 'parasitecontrol:pong') {
                    this.handlePong();
                    return;
                }

                if (message.type === 'parasitecontrol:handshake') {
                    this.handleHandshake(event.source);
                    return;
                }

                if (message.type === 'parasitecontrol:ack') {
                    this.handleAcknowledgment(message);
                    return;
                }

                this.handleMessage(message, event.source);

            } catch (error) {
                console.error('Message handling error:', error);
            }
        });
    }

    handlePing(source) {
        if (!this.targetWindow || this.targetWindow.closed) {
            this.targetWindow = source;
            this.setConnected(true);
        }

        this.send('parasitecontrol:pong', {});
    }

    handlePong() {
        this.resetHeartbeatTimeout();

        if (!this.isConnected) {
            this.setConnected(true);
            this.flushMessageQueue();
        }
    }

    handleHandshake(source) {
        this.targetWindow = source;
        this.setConnected(true);
        this.send('parasitecontrol:handshake', { role: this.role });
    }

    handleAcknowledgment(message) {
        console.log('Message acknowledged:', message.messageId);
    }

    handleMessage(message, source) {
        if (!this.targetWindow) {
            this.targetWindow = source;
        }

        const handlers = this.messageHandlers.get(message.type);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(message.payload, message);
                } catch (error) {
                    console.error('Handler error:', error);
                }
            });
        }

        this.sendAcknowledgment(message.id);
    }

    send(type, payload, options = {}) {
        const message = {
            id: this.generateMessageId(),
            type,
            payload,
            source: this.role,
            timestamp: Date.now(),
            ...options
        };

        if (!this.isConnected || !this.targetWindow || this.targetWindow.closed) {
            if (options.queue !== false) {
                this.messageQueue.push(message);
            }
            return false;
        }

        try {
            this.targetWindow.postMessage(message, '*');
            return true;
        } catch (error) {
            console.error('Send error:', error);
            this.setConnected(false);

            if (options.queue !== false) {
                this.messageQueue.push(message);
            }

            return false;
        }
    }

    sendAcknowledgment(messageId) {
        this.send('parasitecontrol:ack', { messageId }, { queue: false });
    }

    on(type, handler) {
        if (!this.messageHandlers.has(type)) {
            this.messageHandlers.set(type, new Set());
        }

        this.messageHandlers.get(type).add(handler);

        return () => {
            const handlers = this.messageHandlers.get(type);
            if (handlers) {
                handlers.delete(handler);
            }
        };
    }

    off(type, handler) {
        const handlers = this.messageHandlers.get(type);
        if (handlers) {
            handlers.delete(handler);
        }
    }

    onConnectionChange(callback) {
        this.connectionCallbacks.add(callback);
        return () => this.connectionCallbacks.delete(callback);
    }

    setConnected(connected) {
        if (this.isConnected !== connected) {
            this.isConnected = connected;
            this.reconnectAttempts = connected ? 0 : this.reconnectAttempts;

            this.connectionCallbacks.forEach(callback => {
                try {
                    callback(connected);
                } catch (error) {
                    console.error('Connection callback error:', error);
                }
            });
        }
    }

    startHeartbeat() {
        this.stopHeartbeat();

        this.heartbeatInterval = setInterval(() => {
            if (this.role === 'control' && this.targetWindow && !this.targetWindow.closed) {
                this.send('parasitecontrol:ping', {}, { queue: false });
                this.startHeartbeatTimeout();
            }
        }, 2000);
    }

    startHeartbeatTimeout() {
        this.resetHeartbeatTimeout();

        this.heartbeatTimeout = setTimeout(() => {
            this.setConnected(false);
            this.attemptReconnect();
        }, 5000);
    }

    resetHeartbeatTimeout() {
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }

        this.resetHeartbeatTimeout();
    }

    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.warn('Max reconnect attempts reached');
            return;
        }

        this.reconnectAttempts++;
        console.log(`Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    }

    flushMessageQueue() {
        const queue = [...this.messageQueue];
        this.messageQueue = [];

        queue.forEach(message => {
            this.send(message.type, message.payload, { queue: false });
        });
    }

    openWindow(url, name, features) {
        try {
            this.targetWindow = window.open(url, name, features);

            if (this.targetWindow) {
                setTimeout(() => {
                    this.send('parasitecontrol:handshake', { role: this.role });
                }, 500);

                return this.targetWindow;
            }
        } catch (error) {
            console.error('Failed to open window:', error);
        }

        return null;
    }

    generateMessageId() {
        return `${this.role}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    destroy() {
        this.stopHeartbeat();
        this.messageHandlers.clear();
        this.connectionCallbacks.clear();
        this.messageQueue = [];
        this.targetWindow = null;
    }
}

if (typeof window !== 'undefined') {
    window.WindowMessenger = WindowMessenger;
}
