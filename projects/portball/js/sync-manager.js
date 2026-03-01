class SyncManager {
    constructor(windowId) {
        this.windowId = windowId;
        this.storageKey = 'portalball_sync';
        this.heartbeatKey = 'portalball_heartbeat';
        this.stateCallbacks = [];
        this.connectionCallbacks = [];
        this.transferCallbacks = [];
        this.lastHeartbeat = Date.now();
        this.heartbeatInterval = null;
        this.heartbeatCheckInterval = null;
        this.connectionTimeout = 2000;
        this.isConnected = false;
        this.otherWindowId = null;
    }

    initialize() {
        this.setupStorageListener();
        this.sendHeartbeat();
        this.startHeartbeat();
        this.checkConnection();
    }

    setupStorageListener() {
        window.addEventListener('storage', (event) => {
            if (event.key === this.storageKey) {
                this.handleStateUpdate(event.newValue);
            } else if (event.key === this.heartbeatKey) {
                this.handleHeartbeat(event.newValue);
            }
        });
    }

    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            this.sendHeartbeat();
        }, 500);

        this.heartbeatCheckInterval = setInterval(() => {
            this.checkConnection();
        }, 1000);
    }

    sendHeartbeat() {
        const heartbeat = {
            windowId: this.windowId,
            timestamp: Date.now()
        };
        localStorage.setItem(this.heartbeatKey, JSON.stringify(heartbeat));
    }

    handleHeartbeat(data) {
        if (!data) return;

        try {
            const heartbeat = JSON.parse(data);
            if (heartbeat.windowId !== this.windowId) {
                this.lastHeartbeat = heartbeat.timestamp;
                this.otherWindowId = heartbeat.windowId;

                if (!this.isConnected) {
                    this.isConnected = true;
                    this.notifyConnectionCallbacks(true);
                }
            }
        } catch (error) {
            console.error('Error parsing heartbeat:', error);
        }
    }

    checkConnection() {
        const timeSinceLastHeartbeat = Date.now() - this.lastHeartbeat;
        const wasConnected = this.isConnected;

        this.isConnected = timeSinceLastHeartbeat < this.connectionTimeout;

        if (wasConnected !== this.isConnected) {
            this.notifyConnectionCallbacks(this.isConnected);
        }
    }

    broadcastState(state) {
        const syncData = {
            windowId: this.windowId,
            timestamp: Date.now(),
            state: state
        };

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(syncData));
        } catch (error) {
            console.error('Error broadcasting state:', error);
        }
    }

    handleStateUpdate(data) {
        if (!data) return;

        try {
            const syncData = JSON.parse(data);

            if (syncData.windowId !== this.windowId) {
                this.notifyStateCallbacks(syncData.state);
            }
        } catch (error) {
            console.error('Error handling state update:', error);
        }
    }

    broadcastTransfer(transferData) {
        const data = {
            windowId: this.windowId,
            timestamp: Date.now(),
            type: 'transfer',
            transfer: transferData
        };

        this.broadcastState(data);
    }

    onStateUpdate(callback) {
        this.stateCallbacks.push(callback);
    }

    onConnection(callback) {
        this.connectionCallbacks.push(callback);
    }

    onTransfer(callback) {
        this.transferCallbacks.push(callback);
    }

    notifyStateCallbacks(state) {
        if (state.type === 'transfer') {
            this.notifyTransferCallbacks(state.transfer);
        } else {
            this.stateCallbacks.forEach(callback => {
                callback(state);
            });
        }
    }

    notifyConnectionCallbacks(connected) {
        this.connectionCallbacks.forEach(callback => {
            callback(connected);
        });
    }

    notifyTransferCallbacks(transferData) {
        this.transferCallbacks.forEach(callback => {
            callback(transferData);
        });
    }

    getConnectionState() {
        return {
            isConnected: this.isConnected,
            otherWindowId: this.otherWindowId,
            lastHeartbeat: this.lastHeartbeat
        };
    }

    clearSyncData() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.error('Error clearing sync data:', error);
        }
    }

    destroy() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        if (this.heartbeatCheckInterval) {
            clearInterval(this.heartbeatCheckInterval);
        }
        this.clearSyncData();
        this.stateCallbacks = [];
        this.connectionCallbacks = [];
        this.transferCallbacks = [];
    }
}

if (typeof window !== 'undefined') {
    window.SyncManager = SyncManager;
}
