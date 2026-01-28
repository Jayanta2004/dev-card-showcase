const ConnectionManager = {
    tempWire: null,

    startConnection(gateId, portIndex, isOutput, x, y) {
        State.selectedPort = { gateId, portIndex, isOutput, x, y };
        this.createTempWire(x, y);
    },

    createTempWire(x, y) {
        this.removeTempWire();
        const wire = document.createElement('div');
        wire.className = 'temp-wire';
        wire.style.left = x + 'px';
        wire.style.top = y + 'px';
        wire.style.width = '0px';
        document.getElementById('wiresLayer').appendChild(wire);
        this.tempWire = wire;
    },

    updateTempWire(x, y) {
        if (!this.tempWire || !State.selectedPort) return;
        
        const dx = x - State.selectedPort.x;
        const dy = y - State.selectedPort.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        this.tempWire.style.width = length + 'px';
        this.tempWire.style.transform = `rotate(${angle}deg)`;
    },

    removeTempWire() {
        if (this.tempWire) {
            this.tempWire.remove();
            this.tempWire = null;
        }
    },

    completeConnection(gateId, portIndex, isOutput) {
        if (!State.selectedPort) return false;

        const start = State.selectedPort;
        if (start.gateId === gateId) {
            this.cancelConnection();
            return false;
        }

        if (start.isOutput === isOutput) {
            this.cancelConnection();
            return false;
        }

        let fromGateId, fromPortIndex, toGateId, toPortIndex;
        
        if (start.isOutput) {
            fromGateId = start.gateId;
            fromPortIndex = start.portIndex;
            toGateId = gateId;
            toPortIndex = portIndex;
        } else {
            fromGateId = gateId;
            fromPortIndex = portIndex;
            toGateId = start.gateId;
            toPortIndex = start.portIndex;
        }

        const connection = State.createConnection(fromGateId, fromPortIndex, toGateId, toPortIndex);
        this.cancelConnection();
        
        if (connection) {
            GateLogic.propagate();
            return true;
        }
        return false;
    },

    cancelConnection() {
        State.selectedPort = null;
        this.removeTempWire();
    },

    getWirePath(connection) {
        const fromGate = State.gates.get(connection.fromGateId);
        const toGate = State.gates.get(connection.toGateId);
        if (!fromGate || !toGate) return null;

        const fromX = fromGate.x + 88;
        const fromY = fromGate.y + 40 + (connection.fromPortIndex * 24);
        const toX = toGate.x - 8;
        const toY = toGate.y + 40 + (connection.toPortIndex * 24);

        const midX = (fromX + toX) / 2;

        return {
            segments: [
                { type: 'horizontal', x: fromX, y: fromY, width: midX - fromX },
                { type: 'vertical', x: midX, y: Math.min(fromY, toY), height: Math.abs(toY - fromY) },
                { type: 'horizontal', x: midX, y: toY, width: toX - midX }
            ],
            bounds: {
                x: Math.min(fromX, toX),
                y: Math.min(fromY, toY),
                width: Math.abs(toX - fromX),
                height: Math.abs(toY - fromY)
            }
        };
    },

    isWireActive(connection) {
        const fromGate = State.gates.get(connection.fromGateId);
        if (!fromGate) return false;
        const output = fromGate.outputs[connection.fromPortIndex];
        return output?.value === true;
    }
};
