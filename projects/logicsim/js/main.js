document.addEventListener('DOMContentLoaded', () => {
    Renderer.init();
    State.loadState();
    Renderer.renderAll();
    GateLogic.propagate();
    Renderer.renderAll();

    const workspace = document.getElementById('workspace');
    const gatesLayer = document.getElementById('gatesLayer');

    document.querySelectorAll('.palette-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const gateType = e.target.dataset.gate;
            const rect = workspace.getBoundingClientRect();
            const x = rect.width / 2 - 40 + (Math.random() - 0.5) * 100;
            const y = rect.height / 2 - 40 + (Math.random() - 0.5) * 100;
            State.createGate(gateType, x, y);
            GateLogic.propagate();
            Renderer.renderAll();
        });
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        State.reset();
        GateLogic.propagate();
        Renderer.renderAll();
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
        if (confirm('Clear entire circuit?')) {
            State.clear();
            Renderer.renderAll();
        }
    });

    document.getElementById('exampleBtn').addEventListener('click', () => {
        State.clear();
        
        const input1 = State.createGate('INPUT', 100, 100);
        const input2 = State.createGate('INPUT', 100, 200);
        const andGate = State.createGate('AND', 300, 120);
        const notGate = State.createGate('NOT', 500, 150);
        const orGate = State.createGate('OR', 300, 280);
        const xorGate = State.createGate('XOR', 500, 280);
        const output1 = State.createGate('OUTPUT', 700, 150);
        const output2 = State.createGate('OUTPUT', 700, 280);
        
        State.createConnection(input1.id, 0, andGate.id, 0);
        State.createConnection(input2.id, 0, andGate.id, 1);
        State.createConnection(andGate.id, 0, notGate.id, 0);
        State.createConnection(notGate.id, 0, output1.id, 0);
        State.createConnection(input1.id, 0, orGate.id, 0);
        State.createConnection(input2.id, 0, orGate.id, 1);
        State.createConnection(orGate.id, 0, xorGate.id, 0);
        State.createConnection(andGate.id, 0, xorGate.id, 1);
        State.createConnection(xorGate.id, 0, output2.id, 0);
        
        input1.value = true;
        State.saveState();
        
        GateLogic.propagate();
        Renderer.renderAll();
    });

    gatesLayer.addEventListener('mousedown', (e) => {
        const gateEl = e.target.closest('.gate');
        const portEl = e.target.closest('.port');

        if (portEl) {
            e.stopPropagation();
            const gateId = portEl.dataset.gateId;
            const portIndex = parseInt(portEl.dataset.portIndex);
            const isOutput = portEl.dataset.isOutput === 'true';
            
            const gate = State.gates.get(gateId);
            if (!gate) return;

            const rect = portEl.getBoundingClientRect();
            const workspaceRect = workspace.getBoundingClientRect();
            const x = rect.left + rect.width / 2 - workspaceRect.left;
            const y = rect.top + rect.height / 2 - workspaceRect.top;

            ConnectionManager.startConnection(gateId, portIndex, isOutput, x, y);
            Renderer.highlightPort(portEl);
            return;
        }

        if (gateEl) {
            const gateId = gateEl.id;
            const gate = State.gates.get(gateId);
            if (!gate) return;

            const rect = gateEl.getBoundingClientRect();
            State.draggedGate = gateId;
            State.dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    });

    workspace.addEventListener('mousemove', (e) => {
        if (State.selectedPort) {
            const rect = workspace.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            ConnectionManager.updateTempWire(x, y);
        }

        if (State.draggedGate) {
            const rect = workspace.getBoundingClientRect();
            const x = e.clientX - rect.left - State.dragOffset.x;
            const y = e.clientY - rect.top - State.dragOffset.y;
            
            State.updateGatePosition(State.draggedGate, x, y);
            Renderer.renderAll();
        }
    });

    workspace.addEventListener('mouseup', (e) => {
        if (State.selectedPort) {
            const portEl = e.target.closest('.port');
            if (portEl) {
                const gateId = portEl.dataset.gateId;
                const portIndex = parseInt(portEl.dataset.portIndex);
                const isOutput = portEl.dataset.isOutput === 'true';
                
                if (ConnectionManager.completeConnection(gateId, portIndex, isOutput)) {
                    Renderer.renderAll();
                }
            } else {
                ConnectionManager.cancelConnection();
            }

            document.querySelectorAll('.port.connecting').forEach(p => {
                Renderer.unhighlightPort(p);
            });
        }

        State.draggedGate = null;
    });

    gatesLayer.addEventListener('click', (e) => {
        const gateEl = e.target.closest('.gate');
        if (gateEl) {
            const gateId = gateEl.id;
            const gate = State.gates.get(gateId);
            if (gate && gate.type === 'INPUT') {
                State.toggleInput(gateId);
                GateLogic.propagate();
                Renderer.renderAll();
            }
        }
    });

    gatesLayer.addEventListener('dblclick', (e) => {
        const gateEl = e.target.closest('.gate');
        if (gateEl) {
            const gateId = gateEl.id;
            State.deleteGate(gateId);
            GateLogic.propagate();
            Renderer.renderAll();
        }
    });

    const wiresLayer = document.getElementById('wiresLayer');
    wiresLayer.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const wireEl = e.target.closest('.wire');
        if (wireEl) {
            const connectionId = wireEl.dataset.connectionId;
            State.deleteConnection(connectionId);
            GateLogic.propagate();
            Renderer.renderAll();
        }
    });

    workspace.addEventListener('mouseleave', () => {
        if (State.selectedPort) {
            ConnectionManager.cancelConnection();
            document.querySelectorAll('.port.connecting').forEach(p => {
                Renderer.unhighlightPort(p);
            });
        }
        State.draggedGate = null;
    });

    window.addEventListener('beforeunload', () => {
        State.saveState();
    });

    setInterval(() => {
        State.connections.forEach(conn => {
            const wireEl = document.getElementById(conn.id);
            if (wireEl) {
                wireEl.classList.toggle('active', ConnectionManager.isWireActive(conn));
            }
        });
    }, 100);
});
