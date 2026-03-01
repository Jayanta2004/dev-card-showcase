document.addEventListener('DOMContentLoaded', () => {
    const workspace = document.getElementById('workspace');
    const wireLayer = document.getElementById('wire-layer');
    const tempWirePath = document.getElementById('temp-wire');
    
    let gates = [];
    let wires = [];
    let gateIdCounter = 0;
    
   
    let draggedTemplate = null;
    let draggingGate = null;
    let offset = { x: 0, y: 0 };
    
    
    let connectingFrom = null; 

    document.querySelectorAll('.gate-template').forEach(template => {
        template.addEventListener('dragstart', (e) => {
            draggedTemplate = e.target.dataset.type;
        });
    });

    workspace.addEventListener('dragover', (e) => e.preventDefault());
    workspace.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedTemplate) {
            const rect = workspace.getBoundingClientRect();
            createGate(draggedTemplate, e.clientX - rect.left, e.clientY - rect.top);
            draggedTemplate = null;
        }
    });

    // --- 2. GATE CREATION & LOGIC ---
    function createGate(type, x, y) {
        const gateId = `gate-${gateIdCounter++}`;
        const gateObj = {
            id: gateId,
            type: type,
            inputs: type === 'INPUT' ? [] : (type === 'NOT' ? [null] : [null, null]),
            outputValue: false,
            element: null
        };

        const el = document.createElement('div');
        el.className = 'gate';
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.innerText = type;
        el.id = gateId;

        // Add Input Nodes
        gateObj.inputs.forEach((_, index) => {
            const node = document.createElement('div');
            node.className = 'node input';
            node.dataset.gate = gateId;
            node.dataset.index = index;
            // Adjust spacing if multiple inputs
            if (gateObj.inputs.length > 1) {
                node.style.top = index === 0 ? '30%' : '70%';
            }
            node.addEventListener('mouseup', (e) => finishWire(e, gateId, index));
            el.appendChild(node);
        });

        // Add Output Node
        if (type !== 'OUTPUT') {
            const node = document.createElement('div');
            node.className = 'node output';
            node.dataset.gate = gateId;
            node.addEventListener('mousedown', (e) => startWire(e, gateId));
            el.appendChild(node);
        }

        // Toggle INPUT gates on click
        if (type === 'INPUT') {
            el.style.cursor = 'pointer';
            el.addEventListener('dblclick', () => {
                gateObj.outputValue = !gateObj.outputValue;
                el.style.backgroundColor = gateObj.outputValue ? '#4caf50' : '#d32f2f';
                updateSimulation();
            });
        }

        // Make draggable on workspace
        el.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('node')) return; // Don't drag if clicking a node
            draggingGate = el;
            offset.x = e.clientX - el.offsetLeft;
            offset.y = e.clientY - el.offsetTop;
        });

        gateObj.element = el;
        workspace.appendChild(el);
        gates.push(gateObj);
        updateSimulation();
    }

    // --- 3. WORKSPACE MOVEMENT & WIRE DRAWING ---
    workspace.addEventListener('mousemove', (e) => {
        const rect = workspace.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Moving a gate
        if (draggingGate) {
            draggingGate.style.left = `${e.clientX - offset.x}px`;
            draggingGate.style.top = `${e.clientY - offset.y}px`;
            drawWires();
        }

        // Drawing a wire
        if (connectingFrom) {
            const startX = connectingFrom.rect.left - rect.left + 6;
            const startY = connectingFrom.rect.top - rect.top + 6;
            // Draw a nice bezier curve
            const d = `M ${startX} ${startY} C ${startX + 50} ${startY}, ${mouseX - 50} ${mouseY}, ${mouseX} ${mouseY}`;
            tempWirePath.setAttribute('d', d);
        }
    });

    workspace.addEventListener('mouseup', () => {
        draggingGate = null;
        if (connectingFrom) {
            connectingFrom = null;
            tempWirePath.style.display = 'none';
        }
    });

    // --- 4. WIRING LOGIC ---
    function startWire(e, gateId) {
        e.stopPropagation();
        const rect = e.target.getBoundingClientRect();
        connectingFrom = { gateId, rect };
        tempWirePath.style.display = 'block';
    }

    function finishWire(e, targetGateId, inputIndex) {
        e.stopPropagation();
        if (!connectingFrom) return;
        if (connectingFrom.gateId === targetGateId) return; // Prevent self-loop

        // Check if input is already connected, remove old wire if so
        wires = wires.filter(w => !(w.toGate === targetGateId && w.toInput === inputIndex));

        wires.push({
            fromGate: connectingFrom.gateId,
            toGate: targetGateId,
            toInput: inputIndex
        });

        connectingFrom = null;
        tempWirePath.style.display = 'none';
        updateSimulation();
        drawWires();
    }

    function drawWires() {
        wireLayer.innerHTML = ''; // Clear SVG
        const workspaceRect = workspace.getBoundingClientRect();

        wires.forEach(wire => {
            const fromGateObj = gates.find(g => g.id === wire.fromGate);
            const toGateObj = gates.find(g => g.id === wire.toGate);
            
            const fromNode = fromGateObj.element.querySelector('.node.output');
            const toNode = toGateObj.element.querySelectorAll('.node.input')[wire.toInput];

            const fromRect = fromNode.getBoundingClientRect();
            const toRect = toNode.getBoundingClientRect();

            const startX = fromRect.left - workspaceRect.left + 6;
            const startY = fromRect.top - workspaceRect.top + 6;
            const endX = toRect.left - workspaceRect.left + 6;
            const endY = toRect.top - workspaceRect.top + 6;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const d = `M ${startX} ${startY} C ${startX + 50} ${startY}, ${endX - 50} ${endY}, ${endX} ${endY}`;
            
            path.setAttribute('d', d);
            path.setAttribute('class', `wire ${fromGateObj.outputValue ? 'active' : ''}`);
            wireLayer.appendChild(path);
        });
    }

    // --- 5. LOGIC SIMULATION ENGINE ---
    function updateSimulation() {
        // Reset all inputs first
        gates.forEach(g => { if(g.type !== 'INPUT') g.inputs.fill(false); });

        // Propagate signals through wires
        wires.forEach(wire => {
            const fromGate = gates.find(g => g.id === wire.fromGate);
            const toGate = gates.find(g => g.id === wire.toGate);
            toGate.inputs[wire.toInput] = fromGate.outputValue;
        });

        // Evaluate Gates
        let changed = false;
        gates.forEach(gate => {
            let newVal = false;
            switch(gate.type) {
                case 'AND': newVal = gate.inputs[0] && gate.inputs[1]; break;
                case 'OR': newVal = gate.inputs[0] || gate.inputs[1]; break;
                case 'NOT': newVal = !gate.inputs[0]; break;
                case 'INPUT': newVal = gate.outputValue; break; // Inputs retain their own state
            }

            if (gate.type === 'OUTPUT') {
                gate.element.style.backgroundColor = gate.inputs[0] ? '#ffeb3b' : '#333';
                gate.element.style.color = gate.inputs[0] ? '#000' : '#fff';
            } else if (gate.outputValue !== newVal) {
                gate.outputValue = newVal;
                changed = true;
            }
        });

        drawWires();
        
        
        if (changed) updateSimulation(); 
    }

    // Clear Workspace
    document.getElementById('clear-btn').addEventListener('click', () => {
        gates.forEach(g => g.element.remove());
        gates = [];
        wires = [];
        wireLayer.innerHTML = '';
        gateIdCounter = 0;
    });

    
    const guideModal = document.getElementById('guide-modal');
    const guideBtn = document.getElementById('guide-btn');
    const closeBtn = document.querySelector('.close-btn');

    // Open modal
    guideBtn.addEventListener('click', () => {
        guideModal.style.display = 'block';
    });

    // Close modal via X button
    closeBtn.addEventListener('click', () => {
        guideModal.style.display = 'none';
    });

    // Close modal by clicking anywhere outside of it
    window.addEventListener('click', (e) => {
        if (e.target === guideModal) {
            guideModal.style.display = 'none';
        }
    });
});