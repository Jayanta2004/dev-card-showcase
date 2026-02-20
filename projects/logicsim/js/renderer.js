const Renderer = {
    gatesLayer: null,
    wiresLayer: null,

    init() {
        this.gatesLayer = document.getElementById('gatesLayer');
        this.wiresLayer = document.getElementById('wiresLayer');
    },

    renderAll() {
        this.renderGates();
        this.renderWires();
        this.updateStats();
    },

    renderGates() {
        this.gatesLayer.innerHTML = '';
        State.gates.forEach(gate => this.renderGate(gate));
    },

    renderGate(gate) {
        const existing = document.getElementById(gate.id);
        if (existing) {
            this.updateGateElement(existing, gate);
            return;
        }

        const gateEl = document.createElement('div');
        gateEl.className = `gate gate-${gate.type}`;
        gateEl.id = gate.id;
        gateEl.style.left = gate.x + 'px';
        gateEl.style.top = gate.y + 'px';

        if (gate.type === 'INPUT' || gate.type === 'OUTPUT') {
            if (gate.value) {
                gateEl.classList.add('active');
            }
        }

        const body = document.createElement('div');
        body.className = 'gate-body';

        const label = document.createElement('div');
        label.className = 'gate-label';
        label.textContent = gate.type;
        body.appendChild(label);

        if (gate.inputs.length > 0) {
            const inputPorts = document.createElement('div');
            inputPorts.className = 'gate-ports inputs';
            gate.inputs.forEach((input, idx) => {
                const port = this.createPort(gate.id, idx, false, input.value);
                inputPorts.appendChild(port);
            });
            body.appendChild(inputPorts);
        }

        if (gate.outputs.length > 0) {
            const outputPorts = document.createElement('div');
            outputPorts.className = 'gate-ports outputs';
            gate.outputs.forEach((output, idx) => {
                const port = this.createPort(gate.id, idx, true, output.value);
                outputPorts.appendChild(port);
            });
            body.appendChild(outputPorts);
        }

        gateEl.appendChild(body);

        const deleteIndicator = document.createElement('div');
        deleteIndicator.className = 'delete-indicator';
        deleteIndicator.textContent = '×';
        gateEl.appendChild(deleteIndicator);

        this.gatesLayer.appendChild(gateEl);
    },

    updateGateElement(element, gate) {
        element.style.left = gate.x + 'px';
        element.style.top = gate.y + 'px';

        if (gate.type === 'INPUT' || gate.type === 'OUTPUT') {
            element.classList.toggle('active', gate.value === true);
        }

        const inputPorts = element.querySelectorAll('.gate-ports.inputs .port');
        inputPorts.forEach((portEl, idx) => {
            if (gate.inputs[idx]) {
                portEl.classList.toggle('active', gate.inputs[idx].value === true);
            }
        });

        const outputPorts = element.querySelectorAll('.gate-ports.outputs .port');
        outputPorts.forEach((portEl, idx) => {
            if (gate.outputs[idx]) {
                portEl.classList.toggle('active', gate.outputs[idx].value === true);
            }
        });
    },

    createPort(gateId, portIndex, isOutput, value) {
        const port = document.createElement('div');
        port.className = 'port';
        port.dataset.gateId = gateId;
        port.dataset.portIndex = portIndex;
        port.dataset.isOutput = isOutput;

        if (value === true) {
            port.classList.add('active');
        }

        return port;
    },

    renderWires() {
        this.wiresLayer.innerHTML = '';
        State.connections.forEach(conn => this.renderWire(conn));
    },

    renderWire(connection) {
        const path = ConnectionManager.getWirePath(connection);
        if (!path) return;

        const wireContainer = document.createElement('div');
        wireContainer.className = 'wire';
        wireContainer.id = connection.id;
        wireContainer.dataset.connectionId = connection.id;

        if (ConnectionManager.isWireActive(connection)) {
            wireContainer.classList.add('active');
        }

        path.segments.forEach(segment => {
            const segmentEl = document.createElement('div');
            segmentEl.className = `wire-segment ${segment.type}`;
            segmentEl.style.left = segment.x + 'px';
            segmentEl.style.top = segment.y + 'px';

            if (segment.type === 'horizontal') {
                segmentEl.style.width = Math.abs(segment.width) + 'px';
            } else {
                segmentEl.style.height = Math.abs(segment.height) + 'px';
            }

            wireContainer.appendChild(segmentEl);
        });

        const deleteZone = document.createElement('div');
        deleteZone.className = 'wire-delete-zone';
        deleteZone.style.left = path.bounds.x + 'px';
        deleteZone.style.top = path.bounds.y + 'px';
        deleteZone.style.width = path.bounds.width + 'px';
        deleteZone.style.height = path.bounds.height + 'px';
        wireContainer.appendChild(deleteZone);

        this.wiresLayer.appendChild(wireContainer);
    },

    updateStats() {
        document.getElementById('gateCount').textContent = State.gates.size;
        document.getElementById('connectionCount').textContent = State.connections.size;
    },

    highlightPort(element) {
        element.classList.add('connecting');
    },

    unhighlightPort(element) {
        element.classList.remove('connecting');
    }
};
