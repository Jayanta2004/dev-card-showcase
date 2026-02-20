const State = {
    gates: new Map(),
    connections: new Map(),
    nextGateId: 1,
    nextConnectionId: 1,
    selectedPort: null,
    draggedGate: null,
    dragOffset: { x: 0, y: 0 },

    createGate(type, x, y) {
        const id = `gate-${this.nextGateId++}`;
        const gate = {
            id,
            type,
            x,
            y,
            inputs: [],
            outputs: [],
            value: type === 'INPUT' ? false : null
        };

        const config = GateLogic.getGateConfig(type);
        for (let i = 0; i < config.inputCount; i++) {
            gate.inputs.push({ id: `${id}-in-${i}`, value: null, connections: [] });
        }
        for (let i = 0; i < config.outputCount; i++) {
            gate.outputs.push({ id: `${id}-out-${i}`, value: null, connections: [] });
        }

        this.gates.set(id, gate);
        this.saveState();
        return gate;
    },

    deleteGate(gateId) {
        const gate = this.gates.get(gateId);
        if (!gate) return;

        const connectionsToDelete = [];
        this.connections.forEach((conn, connId) => {
            if (conn.fromGateId === gateId || conn.toGateId === gateId) {
                connectionsToDelete.push(connId);
            }
        });

        connectionsToDelete.forEach(connId => this.deleteConnection(connId));
        this.gates.delete(gateId);
        this.saveState();
    },

    createConnection(fromGateId, fromPortIndex, toGateId, toPortIndex) {
        const fromGate = this.gates.get(fromGateId);
        const toGate = this.gates.get(toGateId);
        if (!fromGate || !toGate) return null;

        const existing = Array.from(this.connections.values()).find(
            conn => conn.toGateId === toGateId && conn.toPortIndex === toPortIndex
        );
        if (existing) {
            this.deleteConnection(existing.id);
        }

        const id = `conn-${this.nextConnectionId++}`;
        const connection = {
            id,
            fromGateId,
            fromPortIndex,
            toGateId,
            toPortIndex
        };

        this.connections.set(id, connection);
        fromGate.outputs[fromPortIndex].connections.push(id);
        toGate.inputs[toPortIndex].connections.push(id);

        this.saveState();
        return connection;
    },

    deleteConnection(connectionId) {
        const conn = this.connections.get(connectionId);
        if (!conn) return;

        const fromGate = this.gates.get(conn.fromGateId);
        const toGate = this.gates.get(conn.toGateId);

        if (fromGate) {
            const port = fromGate.outputs[conn.fromPortIndex];
            port.connections = port.connections.filter(id => id !== connectionId);
        }

        if (toGate) {
            const port = toGate.inputs[conn.toPortIndex];
            port.connections = port.connections.filter(id => id !== connectionId);
        }

        this.connections.delete(connectionId);
        this.saveState();
    },

    updateGatePosition(gateId, x, y) {
        const gate = this.gates.get(gateId);
        if (gate) {
            gate.x = x;
            gate.y = y;
            this.saveState();
        }
    },

    toggleInput(gateId) {
        const gate = this.gates.get(gateId);
        if (gate && gate.type === 'INPUT') {
            gate.value = !gate.value;
            this.saveState();
            return true;
        }
        return false;
    },

    reset() {
        this.gates.forEach(gate => {
            if (gate.type === 'INPUT') {
                gate.value = false;
            }
        });
        this.saveState();
    },

    clear() {
        this.gates.clear();
        this.connections.clear();
        this.nextGateId = 1;
        this.nextConnectionId = 1;
        this.selectedPort = null;
        this.saveState();
    },

    saveState() {
        try {
            const data = {
                gates: Array.from(this.gates.entries()),
                connections: Array.from(this.connections.entries()),
                nextGateId: this.nextGateId,
                nextConnectionId: this.nextConnectionId
            };
            localStorage.setItem('logicCircuitState', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save state:', e);
        }
    },

    loadState() {
        try {
            const saved = localStorage.getItem('logicCircuitState');
            if (saved) {
                const data = JSON.parse(saved);
                this.gates = new Map(data.gates);
                this.connections = new Map(data.connections);
                this.nextGateId = data.nextGateId || 1;
                this.nextConnectionId = data.nextConnectionId || 1;
                return true;
            }
        } catch (e) {
            console.error('Failed to load state:', e);
        }
        return false;
    }
};
