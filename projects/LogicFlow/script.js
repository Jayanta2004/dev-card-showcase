/**
 * LOGICFLOW ENGINE v2.0 - VISUAL SCRIPTING RUNTIME (ENHANCED)
 * Complete rewrite with fixes and new features
 * @author saiusesgithub
 */

// ========================================
// 1. UTILITIES & HELPERS
// ========================================

const Utils = {
    uuid: () => 'node-' + Math.random().toString(36).substr(2, 9),
    clamp: (val, min, max) => Math.min(Math.max(val, min), max),
    dist: (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)),

    serializeGraph: (nodes, wires) => {
        return JSON.stringify({
            version: '2.0',
            nodes: nodes.map(n => ({
                id: n.id,
                type: n.type,
                x: n.x,
                y: n.y,
                data: n.data
            })),
            wires: wires.map(w => ({
                from: { nodeId: w.outputPort.node.id, portId: w.outputPort.id },
                to: { nodeId: w.inputPort.node.id, portId: w.inputPort.id }
            }))
        }, null, 2);
    },

    downloadJSON: (data, filename) => {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
};

// ========================================
// 2. GRAPH ENGINE (CANVAS MANAGEMENT)
// ========================================

class GraphEngine {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.world = document.getElementById('world');
        this.grid = document.getElementById('grid-bg');
        this.zoomDisplay = document.getElementById('zoom-level');

        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this.isPanning = false;
        this.startX = 0;
        this.startY = 0;

        this.bindEvents();
        this.updateTransform();
    }

    bindEvents() {
        this.container.addEventListener('mousedown', (e) => {
            if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
                e.preventDefault();
                this.isPanning = true;
                this.startX = e.clientX - this.panX;
                this.startY = e.clientY - this.panY;
                this.container.style.cursor = 'grabbing';
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isPanning) {
                e.preventDefault();
                this.panX = e.clientX - this.startX;
                this.panY = e.clientY - this.startY;
                this.updateTransform();
            }
        });

        window.addEventListener('mouseup', () => {
            this.isPanning = false;
            this.container.style.cursor = 'grab';
        });

        this.container.addEventListener('wheel', (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const delta = -Math.sign(e.deltaY) * 0.1;
                this.scale = Utils.clamp(this.scale + delta, 0.2, 3);
                this.updateTransform();
            }
        });

        document.getElementById('zoom-in').onclick = () => {
            this.scale = Utils.clamp(this.scale + 0.1, 0.2, 3);
            this.updateTransform();
        };
        document.getElementById('zoom-out').onclick = () => {
            this.scale = Utils.clamp(this.scale - 0.1, 0.2, 3);
            this.updateTransform();
        };
        document.getElementById('btn-center').onclick = () => {
            this.scale = 1;
            this.panX = 0;
            this.panY = 0;
            this.updateTransform();
        };
    }

    updateTransform() {
        this.world.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
        this.grid.style.backgroundPosition = `${this.panX}px ${this.panY}px`;
        const gridSize = 20 * this.scale;
        const majorGrid = 100 * this.scale;
        this.grid.style.backgroundSize = `${gridSize}px ${gridSize}px, ${gridSize}px ${gridSize}px, ${majorGrid}px ${majorGrid}px, ${majorGrid}px ${majorGrid}px`;
        this.zoomDisplay.innerText = Math.round(this.scale * 100) + '%';

        if (window.app && window.app.wireManager) {
            requestAnimationFrame(() => window.app.wireManager.updateAll());
        }
    }

    screenToWorld(x, y) {
        const rect = this.container.getBoundingClientRect();
        return {
            x: (x - rect.left - this.panX) / this.scale,
            y: (y - rect.top - this.panY) / this.scale
        };
    }
}

// ========================================
// 3. NODE SYSTEM
// ========================================

const PortType = {
    EXEC: 'exec',
    BOOL: 'bool',
    NUMBER: 'number',
    STRING: 'string',
    ANY: 'any'
};

class Port {
    constructor(node, id, name, type, direction) {
        this.node = node;
        this.id = id;
        this.name = name;
        this.type = type;
        this.direction = direction;
        this.element = null;
        this.connections = [];
        this.value = null;
    }

    getCenter() {
        if (!this.element) return { x: 0, y: 0 };

        // FIXED: Proper coordinate transformation
        const rect = this.element.getBoundingClientRect();
        const containerRect = window.app.graph.container.getBoundingClientRect();

        // Calculate center in screen space
        const screenX = rect.left + rect.width / 2;
        const screenY = rect.top + rect.height / 2;

        // Convert to world space
        return window.app.graph.screenToWorld(screenX, screenY);
    }
}

class Node {
    constructor(type, x, y) {
        this.id = Utils.uuid();
        this.type = type;
        this.x = x;
        this.y = y;
        this.inputs = [];
        this.outputs = [];
        this.element = null;
        this.data = {};
        this.define();
    }

    define() {
        this.title = 'Base Node';
        this.category = 'logic';
    }

    addInput(id, name, type) {
        const port = new Port(this, id, name, type, 'in');
        this.inputs.push(port);
        return port;
    }

    addOutput(id, name, type) {
        const port = new Port(this, id, name, type, 'out');
        this.outputs.push(port);
        return port;
    }

    getPort(id) {
        return [...this.inputs, ...this.outputs].find(p => p.id === id);
    }

    getAllPorts() {
        return [...this.inputs, ...this.outputs];
    }
}

// ========================================
// 4. NODE FACTORY (ENHANCED WITH NEW NODES)
// ========================================

class NodeFactory {
    static create(type, x, y) {
        const node = new Node(type, x, y);

        switch (type) {
            // === EVENTS ===
            case 'EventStart':
                node.title = 'Event Begin';
                node.category = 'event';
                node.addOutput('exec_out', '', PortType.EXEC);
                break;

            case 'EventTick':
                node.title = 'Event Tick';
                node.category = 'event';
                node.addOutput('exec_out', '', PortType.EXEC);
                node.addOutput('delta', 'Delta', PortType.NUMBER);
                break;

            // === LOGIC ===
            case 'LogicIf':
                node.title = 'Branch';
                node.category = 'logic';
                node.addInput('exec_in', '', PortType.EXEC);
                node.addInput('condition', 'Condition', PortType.BOOL);
                node.addOutput('true', 'True', PortType.EXEC);
                node.addOutput('false', 'False', PortType.EXEC);
                break;

            case 'LogicCompare':
                node.title = 'Equals (==)';
                node.category = 'logic';
                node.addInput('a', 'A', PortType.ANY);
                node.addInput('b', 'B', PortType.ANY);
                node.addOutput('res', 'Result', PortType.BOOL);
                break;

            case 'LogicAnd':
                node.title = 'AND Gate';
                node.category = 'logic';
                node.addInput('a', 'A', PortType.BOOL);
                node.addInput('b', 'B', PortType.BOOL);
                node.addOutput('res', 'Result', PortType.BOOL);
                break;

            case 'LogicOr':
                node.title = 'OR Gate';
                node.category = 'logic';
                node.addInput('a', 'A', PortType.BOOL);
                node.addInput('b', 'B', PortType.BOOL);
                node.addOutput('res', 'Result', PortType.BOOL);
                break;

            case 'LogicNot':
                node.title = 'NOT Gate';
                node.category = 'logic';
                node.addInput('val', 'Value', PortType.BOOL);
                node.addOutput('res', 'Result', PortType.BOOL);
                break;

            case 'LogicGreater':
                node.title = 'Greater (>)';
                node.category = 'logic';
                node.addInput('a', 'A', PortType.NUMBER);
                node.addInput('b', 'B', PortType.NUMBER);
                node.addOutput('res', 'Result', PortType.BOOL);
                break;

            // === MATH ===
            case 'MathAdd':
                node.title = 'Add (+)';
                node.category = 'math';
                node.addInput('a', 'A', PortType.NUMBER);
                node.addInput('b', 'B', PortType.NUMBER);
                node.addOutput('res', 'Result', PortType.NUMBER);
                break;

            case 'MathSub':
                node.title = 'Subtract (-)';
                node.category = 'math';
                node.addInput('a', 'A', PortType.NUMBER);
                node.addInput('b', 'B', PortType.NUMBER);
                node.addOutput('res', 'Result', PortType.NUMBER);
                break;

            case 'MathMult':
                node.title = 'Multiply (*)';
                node.category = 'math';
                node.addInput('a', 'A', PortType.NUMBER);
                node.addInput('b', 'B', PortType.NUMBER);
                node.addOutput('res', 'Result', PortType.NUMBER);
                break;

            case 'MathDiv':
                node.title = 'Divide (/)';
                node.category = 'math';
                node.addInput('a', 'A', PortType.NUMBER);
                node.addInput('b', 'B', PortType.NUMBER);
                node.addOutput('res', 'Result', PortType.NUMBER);
                break;

            case 'MathPow':
                node.title = 'Power (^)';
                node.category = 'math';
                node.addInput('base', 'Base', PortType.NUMBER);
                node.addInput('exp', 'Exp', PortType.NUMBER);
                node.addOutput('res', 'Result', PortType.NUMBER);
                break;

            case 'MathSin':
                node.title = 'Sine';
                node.category = 'math';
                node.addInput('val', 'Radians', PortType.NUMBER);
                node.addOutput('res', 'Result', PortType.NUMBER);
                break;

            case 'MathCos':
                node.title = 'Cosine';
                node.category = 'math';
                node.addInput('val', 'Radians', PortType.NUMBER);
                node.addOutput('res', 'Result', PortType.NUMBER);
                break;

            case 'MathRandom':
                node.title = 'Random Float';
                node.category = 'math';
                node.addOutput('val', 'Value', PortType.NUMBER);
                break;

            case 'MathClamp':
                node.title = 'Clamp';
                node.category = 'math';
                node.addInput('val', 'Value', PortType.NUMBER);
                node.addInput('min', 'Min', PortType.NUMBER);
                node.addInput('max', 'Max', PortType.NUMBER);
                node.addOutput('res', 'Result', PortType.NUMBER);
                break;

            // === DATA / IO ===
            case 'PrintLog':
                node.title = 'Print String';
                node.category = 'data';
                node.addInput('exec_in', '', PortType.EXEC);
                node.addInput('msg', 'Message', PortType.STRING);
                node.addOutput('exec_out', '', PortType.EXEC);
                break;

            case 'VarString':
                node.title = 'String Literal';
                node.category = 'data';
                node.addOutput('val', 'Value', PortType.STRING);
                node.data.value = "Hello World";
                break;

            case 'VarNumber':
                node.title = 'Number Literal';
                node.category = 'data';
                node.addOutput('val', 'Value', PortType.NUMBER);
                node.data.value = 0;
                break;

            case 'VarBool':
                node.title = 'Boolean';
                node.category = 'data';
                node.addOutput('val', 'Value', PortType.BOOL);
                node.data.value = true;
                break;

            case 'StringConcat':
                node.title = 'Concat';
                node.category = 'data';
                node.addInput('a', 'A', PortType.STRING);
                node.addInput('b', 'B', PortType.STRING);
                node.addOutput('res', 'Result', PortType.STRING);
                break;

            case 'ToString':
                node.title = 'To String';
                node.category = 'data';
                node.addInput('val', 'Value', PortType.ANY);
                node.addOutput('str', 'String', PortType.STRING);
                break;

            case 'ToNumber':
                node.title = 'To Number';
                node.category = 'data';
                node.addInput('val', 'Value', PortType.ANY);
                node.addOutput('num', 'Number', PortType.NUMBER);
                break;

            // === FLOW CONTROL ===
            case 'FlowDelay':
                node.title = 'Delay';
                node.category = 'flow';
                node.addInput('exec_in', '', PortType.EXEC);
                node.addInput('duration', 'Duration (ms)', PortType.NUMBER);
                node.addOutput('exec_out', '', PortType.EXEC);
                node.data.duration = 1000;
                break;

            case 'FlowSequence':
                node.title = 'Sequence';
                node.category = 'flow';
                node.addInput('exec_in', '', PortType.EXEC);
                node.addOutput('then1', 'Then 1', PortType.EXEC);
                node.addOutput('then2', 'Then 2', PortType.EXEC);
                node.addOutput('then3', 'Then 3', PortType.EXEC);
                break;

            case 'FlowForLoop':
                node.title = 'For Loop';
                node.category = 'flow';
                node.addInput('exec_in', '', PortType.EXEC);
                node.addInput('count', 'Count', PortType.NUMBER);
                node.addOutput('loop_body', 'Loop Body', PortType.EXEC);
                node.addOutput('index', 'Index', PortType.NUMBER);
                node.addOutput('completed', 'Completed', PortType.EXEC);
                break;
        }

        return node;
    }
}

// ========================================
// 5. WIRE MANAGER (FIXED RENDERING)
// ========================================

class WireManager {
    constructor() {
        this.svg = document.getElementById('connections-svg');
        this.dragSvg = document.getElementById('drag-svg');
        this.dragWire = document.getElementById('drag-wire');
        this.wires = [];
        this.dragging = false;
        this.dragSourcePort = null;

        this.resizeSVG();
        window.addEventListener('resize', () => this.resizeSVG());
    }

    resizeSVG() {
        // Ensure SVG covers entire canvas
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', '100%');
        this.svg.style.position = 'absolute';
        this.svg.style.top = '0';
        this.svg.style.left = '0';
        this.svg.style.pointerEvents = 'none';

        this.dragSvg.setAttribute('width', '100%');
        this.dragSvg.setAttribute('height', '100%');
        this.dragSvg.style.position = 'absolute';
        this.dragSvg.style.top = '0';
        this.dragSvg.style.left = '0';
        this.dragSvg.style.pointerEvents = 'none';

        // Wire paths should capture events
        this.svg.querySelectorAll('.wire').forEach(wire => {
            wire.style.pointerEvents = 'stroke';
        });
    }

    createWire(outputPort, inputPort) {
        // Type validation
        if (outputPort.type !== inputPort.type &&
            outputPort.type !== PortType.ANY &&
            inputPort.type !== PortType.ANY &&
            outputPort.type !== PortType.EXEC) {
            console.warn('Type mismatch:', outputPort.type, inputPort.type);
        }

        // Check duplicates
        const exists = this.wires.find(w =>
            w.outputPort === outputPort && w.inputPort === inputPort
        );
        if (exists) return;

        // FIXED: Remove existing input connections (inputs can only have one connection)
        if (inputPort.connections.length > 0) {
            const toRemove = [...inputPort.connections];
            toRemove.forEach(w => this.removeWire(w));
        }

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.classList.add('wire');
        path.classList.add(outputPort.type);
        path.style.pointerEvents = 'stroke';

        if (outputPort.type === PortType.EXEC) {
            path.setAttribute('marker-end', 'url(#arrow-flow)');
        }

        path.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.removeWire(wire);
        });

        const wire = {
            id: Utils.uuid(),
            outputPort: outputPort,
            inputPort: inputPort,
            element: path
        };

        outputPort.connections.push(wire);
        inputPort.connections.push(wire);

        this.svg.appendChild(path);
        this.wires.push(wire);
        this.updateWire(wire);

        return wire;
    }

    removeWire(wire) {
        if (!wire) return;

        if (wire.element && wire.element.parentNode) {
            wire.element.parentNode.removeChild(wire.element);
        }

        if (wire.outputPort) {
            wire.outputPort.connections = wire.outputPort.connections.filter(w => w !== wire);
        }
        if (wire.inputPort) {
            wire.inputPort.connections = wire.inputPort.connections.filter(w => w !== wire);
        }

        this.wires = this.wires.filter(w => w !== wire);
    }

    updateWire(wire) {
        if (!wire || !wire.element) return;
        const p1 = wire.outputPort.getCenter();
        const p2 = wire.inputPort.getCenter();
        this.drawPath(wire.element, p1, p2);
    }

    updateAll() {
        this.wires.forEach(w => this.updateWire(w));
    }

    startDrag(port) {
        this.dragging = true;
        this.dragSourcePort = port;
        this.dragWire.style.display = 'block';
        const p = port.getCenter();
        this.drawPath(this.dragWire, p, p);
    }

    updateDrag(mouseX, mouseY) {
        if (!this.dragging) return;
        const p1 = this.dragSourcePort.getCenter();
        const p2 = window.app.graph.screenToWorld(mouseX, mouseY);

        if (this.dragSourcePort.direction === 'in') {
            this.drawPath(this.dragWire, p2, p1);
        } else {
            this.drawPath(this.dragWire, p1, p2);
        }
    }

    endDrag(targetPort) {
        this.dragging = false;
        this.dragWire.style.display = 'none';

        if (targetPort && targetPort !== this.dragSourcePort) {
            if (this.dragSourcePort.direction !== targetPort.direction) {
                const output = this.dragSourcePort.direction === 'out' ? this.dragSourcePort : targetPort;
                const input = this.dragSourcePort.direction === 'in' ? this.dragSourcePort : targetPort;
                this.createWire(output, input);
            }
        }
        this.dragSourcePort = null;
    }

    drawPath(pathEl, p1, p2) {
        const dist = Math.abs(p2.x - p1.x);
        let cp1, cp2;

        if (p2.x >= p1.x) {
            cp1 = { x: p1.x + dist * 0.5, y: p1.y };
            cp2 = { x: p2.x - dist * 0.5, y: p2.y };
        } else {
            const bulge = Math.max(dist, 120);
            cp1 = { x: p1.x + bulge, y: p1.y };
            cp2 = { x: p2.x - bulge, y: p2.y };
        }

        const d = `M ${p1.x} ${p1.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${p2.x} ${p2.y}`;
        pathEl.setAttribute('d', d);
    }
}


// ========================================
// 6. UI CONTROLLER (ENHANCED)
// ========================================

class UIController {
    constructor() {
        this.nodesContainer = document.getElementById('nodes-container');
        this.inspector = document.getElementById('inspector-content');
        this.console = document.getElementById('console-log');
        this.nodes = [];
        this.selection = null;
        this.multiSelection = [];
        this.dragNode = null;
        this.dragOffset = { x: 0, y: 0 };
    }

    addNode(type, x, y) {
        const node = NodeFactory.create(type, x, y);
        this.nodes.push(node);
        this.renderNode(node);
        return node;
    }

    renderNode(node) {
        const el = document.createElement('div');
        el.className = `node ${node.category}`;
        el.style.left = `${node.x}px`;
        el.style.top = `${node.y}px`;
        el.dataset.id = node.id;

        const header = document.createElement('div');
        header.className = 'node-header';
        header.innerHTML = `<i class="ri-settings-2-line"></i> ${node.title}`;
        el.appendChild(header);

        const body = document.createElement('div');
        body.className = 'node-body';

        const leftCol = document.createElement('div');
        leftCol.className = 'ports-col ports-left';
        node.inputs.forEach(p => leftCol.appendChild(this.renderPort(p)));
        body.appendChild(leftCol);

        const rightCol = document.createElement('div');
        rightCol.className = 'ports-col ports-right';
        node.outputs.forEach(p => rightCol.appendChild(this.renderPort(p)));
        body.appendChild(rightCol);

        el.appendChild(body);

        // Node drag
        header.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.selectNode(node);
            this.startDragNode(node, e);
        });

        // Context menu
        el.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, node);
        });

        this.nodesContainer.appendChild(el);
        node.element = el;
    }

    renderPort(port) {
        const el = document.createElement('div');
        el.className = `port ${port.type}`;
        el.title = port.type;

        const socket = document.createElement('div');
        socket.className = 'socket';

        if (port.direction === 'in') {
            el.appendChild(socket);
            if (port.name) {
                const span = document.createElement('span');
                span.innerText = port.name;
                el.appendChild(span);
            }
        } else {
            if (port.name) {
                const span = document.createElement('span');
                span.innerText = port.name;
                el.appendChild(span);
            }
            el.appendChild(socket);
        }

        socket.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            window.app.wireManager.startDrag(port);
        });

        socket.addEventListener('mouseup', (e) => {
            e.stopPropagation();
            window.app.wireManager.endDrag(port);
        });

        socket.addEventListener('mouseenter', () => {
            socket.classList.add('hover');
        });

        socket.addEventListener('mouseleave', () => {
            socket.classList.remove('hover');
        });

        port.element = socket;
        return el;
    }

    selectNode(node) {
        if (this.selection) {
            this.selection.element.classList.remove('selected');
        }
        this.selection = node;
        node.element.classList.add('selected');
        this.renderInspector(node);
    }

    startDragNode(node, e) {
        this.dragNode = node;
        const scale = window.app.graph.scale;
        this.dragOffset = {
            x: e.clientX / scale - node.x,
            y: e.clientY / scale - node.y
        };

        const moveHandler = (ev) => {
            const s = window.app.graph.scale;
            node.x = ev.clientX / s - this.dragOffset.x;
            node.y = ev.clientY / s - this.dragOffset.y;

            // Snap to grid
            node.x = Math.round(node.x / 20) * 20;
            node.y = Math.round(node.y / 20) * 20;

            node.element.style.left = `${node.x}px`;
            node.element.style.top = `${node.y}px`;

            // FIXED: Update wires in real-time
            window.app.wireManager.updateAll();
        };

        const upHandler = () => {
            window.removeEventListener('mousemove', moveHandler);
            window.removeEventListener('mouseup', upHandler);
            this.dragNode = null;
        };

        window.addEventListener('mousemove', moveHandler);
        window.addEventListener('mouseup', upHandler);
    }

    renderInspector(node) {
        this.inspector.innerHTML = '';

        const title = document.createElement('h3');
        title.innerText = node.title;
        title.style.marginBottom = '10px';
        this.inspector.appendChild(title);

        // Editable Values
        if (node.data && node.data.hasOwnProperty('value')) {
            const row = document.createElement('div');
            row.className = 'prop-row';
            row.innerHTML = `<label class="prop-label">Value</label>`;

            let input;
            if (node.type === 'VarBool') {
                input = document.createElement('select');
                input.className = 'prop-input';
                input.innerHTML = '<option value="true">True</option><option value="false">False</option>';
                input.value = node.data.value.toString();
                input.addEventListener('change', (e) => {
                    node.data.value = e.target.value === 'true';
                });
            } else {
                input = document.createElement('input');
                input.className = 'prop-input';
                input.value = node.data.value;
                input.addEventListener('input', (e) => {
                    node.data.value = node.type === 'VarNumber' ? parseFloat(e.target.value) || 0 : e.target.value;
                });
            }

            row.appendChild(input);
            this.inspector.appendChild(row);
        }

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-danger';
        deleteBtn.innerHTML = '<i class="ri-delete-bin-line"></i> Delete Node';
        deleteBtn.style.marginTop = '20px';
        deleteBtn.style.width = '100%';
        deleteBtn.addEventListener('click', () => {
            this.deleteNode(node);
        });
        this.inspector.appendChild(deleteBtn);

        const idInfo = document.createElement('div');
        idInfo.className = 'prop-row';
        idInfo.style.marginTop = '10px';
        idInfo.innerHTML = `<label class="prop-label">ID</label><input class="prop-input" disabled value="${node.id}">`;
        this.inspector.appendChild(idInfo);
    }

    deleteNode(node) {
        // Remove all connected wires
        const allPorts = node.getAllPorts();
        allPorts.forEach(port => {
            const wires = [...port.connections];
            wires.forEach(wire => window.app.wireManager.removeWire(wire));
        });

        // Remove from DOM
        if (node.element && node.element.parentNode) {
            node.element.parentNode.removeChild(node.element);
        }

        // Remove from list
        this.nodes = this.nodes.filter(n => n !== node);

        // Clear selection
        if (this.selection === node) {
            this.selection = null;
            this.inspector.innerHTML = '<div class="empty-state">Select a node to edit</div>';
        }
    }

    showContextMenu(e, node) {
        const menu = document.getElementById('context-menu');
        menu.classList.remove('hidden');
        menu.style.left = e.clientX + 'px';
        menu.style.top = e.clientY + 'px';

        const closeMenu = () => {
            menu.classList.add('hidden');
            document.removeEventListener('click', closeMenu);
        };

        setTimeout(() => document.addEventListener('click', closeMenu), 10);

        menu.onclick = (ev) => {
            const action = ev.target.dataset.action;
            if (action === 'delete') {
                this.deleteNode(node);
            } else if (action === 'duplicate') {
                this.duplicateNode(node);
            } else if (action === 'disconnect') {
                node.getAllPorts().forEach(port => {
                    const wires = [...port.connections];
                    wires.forEach(wire => window.app.wireManager.removeWire(wire));
                });
            }
            closeMenu();
        };
    }

    duplicateNode(node) {
        const newNode = this.addNode(node.type, node.x + 50, node.y + 50);
        if (node.data) {
            newNode.data = JSON.parse(JSON.stringify(node.data));
        }
        this.renderInspector(newNode);
    }

    log(msg, type = 'info') {
        const div = document.createElement('div');
        div.className = `log-entry ${type}`;
        const timestamp = new Date().toLocaleTimeString();
        div.innerHTML = `<span class="log-time">[${timestamp}]</span> ${msg}`;
        this.console.appendChild(div);
        this.console.scrollTop = this.console.scrollHeight;
    }
}

// ========================================
// 7. EXECUTION ENGINE (ENHANCED)
// ========================================

class ExecutionEngine {
    constructor(app) {
        this.app = app;
        this.isRunning = false;
        this.executionQueue = [];
        this.loopIterations = {};
    }

    run() {
        this.app.ui.log("▶ Build Started...", 'system');

        const entryNodes = this.app.ui.nodes.filter(n => n.category === 'event');

        if (entryNodes.length === 0) {
            this.app.ui.log("⚠ No Event nodes found.", 'error');
            return;
        }

        this.isRunning = true;
        entryNodes.forEach(node => this.executeNode(node));
    }

    async executeNode(node) {
        if (!this.isRunning) return;

        // Visual pulse
        node.element.style.boxShadow = "0 0 10px var(--accent)";
        setTimeout(() => node.element.style.boxShadow = "", 200);

        try {
            await this.processNodeLogic(node);

            const execOuts = node.outputs.filter(p => p.type === PortType.EXEC);

            for (let port of execOuts) {
                if (node.type === 'LogicIf') {
                    continue; // Branch handles flow internally
                }

                for (let wire of port.connections) {
                    const nextNode = wire.inputPort.node;
                    await this.executeNode(nextNode);
                }
            }

        } catch (err) {
            this.app.ui.log(`❌ Runtime Error: ${err.message}`, 'error');
            console.error(err);
            this.isRunning = false;
        }
    }

    getNodeInputValue(node, inputName) {
        const port = node.inputs.find(p => p.name === inputName || p.id === inputName);
        if (!port) return null;

        if (port.connections.length > 0) {
            const wire = port.connections[0];
            const sourceNode = wire.outputPort.node;
            return this.evaluateNodeData(sourceNode, wire.outputPort.id);
        }

        return null;
    }

    evaluateNodeData(node, outputId) {
        switch (node.type) {
            case 'VarString': return node.data.value;
            case 'VarNumber': return parseFloat(node.data.value) || 0;
            case 'VarBool': return node.data.value;

            case 'MathAdd':
                return (this.getNodeInputValue(node, 'a') || 0) + (this.getNodeInputValue(node, 'b') || 0);
            case 'MathSub':
                return (this.getNodeInputValue(node, 'a') || 0) - (this.getNodeInputValue(node, 'b') || 0);
            case 'MathMult':
                return (this.getNodeInputValue(node, 'a') || 0) * (this.getNodeInputValue(node, 'b') || 0);
            case 'MathDiv':
                const divisor = this.getNodeInputValue(node, 'b') || 1;
                return (this.getNodeInputValue(node, 'a') || 0) / divisor;
            case 'MathPow':
                return Math.pow(this.getNodeInputValue(node, 'base') || 0, this.getNodeInputValue(node, 'exp') || 2);
            case 'MathSin':
                return Math.sin(this.getNodeInputValue(node, 'val') || 0);
            case 'MathCos':
                return Math.cos(this.getNodeInputValue(node, 'val') || 0);
            case 'MathClamp':
                const val = this.getNodeInputValue(node, 'val') || 0;
                const min = this.getNodeInputValue(node, 'min') || 0;
                const max = this.getNodeInputValue(node, 'max') || 1;
                return Utils.clamp(val, min, max);
            case 'MathRandom':
                return Math.random();

            case 'LogicCompare':
                return this.getNodeInputValue(node, 'a') == this.getNodeInputValue(node, 'b');
            case 'LogicAnd':
                return this.getNodeInputValue(node, 'a') && this.getNodeInputValue(node, 'b');
            case 'LogicOr':
                return this.getNodeInputValue(node, 'a') || this.getNodeInputValue(node, 'b');
            case 'LogicNot':
                return !this.getNodeInputValue(node, 'val');
            case 'LogicGreater':
                return (this.getNodeInputValue(node, 'a') || 0) > (this.getNodeInputValue(node, 'b') || 0);

            case 'StringConcat':
                return (this.getNodeInputValue(node, 'a') || '') + (this.getNodeInputValue(node, 'b') || '');
            case 'ToString':
                return String(this.getNodeInputValue(node, 'val'));
            case 'ToNumber':
                return parseFloat(this.getNodeInputValue(node, 'val')) || 0;
        }
        return null;
    }

    async processNodeLogic(node) {
        switch (node.type) {
            case 'PrintLog':
                const msg = this.getNodeInputValue(node, 'msg');
                this.app.ui.log(msg, 'exec');
                break;

            case 'LogicIf':
                const condition = this.getNodeInputValue(node, 'condition');
                const portName = condition ? 'true' : 'false';
                const outPort = node.outputs.find(p => p.name.toLowerCase() === portName);
                if (outPort && outPort.connections.length > 0) {
                    for (let wire of outPort.connections) {
                        const nextNode = wire.inputPort.node;
                        await this.executeNode(nextNode);
                    }
                }
                break;

            case 'FlowDelay':
                const duration = this.getNodeInputValue(node, 'duration') || node.data.duration || 1000;
                await new Promise(resolve => setTimeout(resolve, duration));
                break;

            case 'FlowSequence':
                // Execute all outputs in sequence
                for (let i = 1; i <= 3; i++) {
                    const port = node.outputs.find(p => p.name === `Then ${i}`);
                    if (port && port.connections.length > 0) {
                        for (let wire of port.connections) {
                            await this.executeNode(wire.inputPort.node);
                        }
                    }
                }
                break;

            case 'FlowForLoop':
                const count = Math.floor(this.getNodeInputValue(node, 'count') || 10);
                const loopPort = node.outputs.find(p => p.name === 'Loop Body');
                const indexPort = node.outputs.find(p => p.name === 'Index');

                for (let i = 0; i < count; i++) {
                    // Store current index
                    this.loopIterations[node.id] = i;

                    if (loopPort && loopPort.connections.length > 0) {
                        for (let wire of loopPort.connections) {
                            await this.executeNode(wire.inputPort.node);
                        }
                    }
                }

                // Execute completed port
                const completedPort = node.outputs.find(p => p.name === 'Completed');
                if (completedPort && completedPort.connections.length > 0) {
                    for (let wire of completedPort.connections) {
                        await this.executeNode(wire.inputPort.node);
                    }
                }
                break;
        }
    }
}

// ========================================
// 8. APP BOOTSTRAP (ENHANCED)
// ========================================

class App {
    constructor() {
        this.graph = new GraphEngine();
        this.wireManager = new WireManager();
        this.ui = new UIController();
        this.engine = new ExecutionEngine(this);

        this.init();
    }

    init() {
        this.setupLibraryDrag();
        this.setupToolbar();
        this.setupKeyboardShortcuts();

        // Global mouse move for wire dragging
        window.addEventListener('mousemove', (e) => {
            this.wireManager.updateDrag(e.clientX, e.clientY);
        });

        // Demo graph
        this.createDemo();
    }

    setupLibraryDrag() {
        const items = document.querySelectorAll('.node-preview');
        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('type', item.dataset.type);
            });
        });

        const dropZone = document.getElementById('canvas-container');
        dropZone.addEventListener('dragover', (e) => e.preventDefault());

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData('type');
            if (!type) return;
            const pos = this.graph.screenToWorld(e.clientX, e.clientY);
            const node = this.ui.addNode(type, pos.x, pos.y);
            this.ui.selectNode(node);
        });
    }

    setupToolbar() {
        document.getElementById('btn-run').onclick = () => this.engine.run();

        document.getElementById('btn-clear-console').onclick = () => {
            this.ui.console.innerHTML = '<div class="log-entry system">Console cleared.</div>';
        };

        document.getElementById('btn-clear').onclick = () => {
            if (confirm('Clear all nodes?')) {
                this.ui.nodesContainer.innerHTML = '';
                this.wireManager.svg.innerHTML = '<defs><marker id="arrow-flow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#ffffff" /></marker></defs>';
                this.ui.nodes = [];
                this.wireManager.wires = [];
                this.ui.log('Canvas cleared.', 'system');
            }
        };

        document.getElementById('btn-export').onclick = () => {
            const json = Utils.serializeGraph(this.ui.nodes, this.wireManager.wires);
            Utils.downloadJSON(json, 'logicflow_graph.json');
            this.ui.log('Graph exported!', 'system');
        };
    }

    setupKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            // Delete selected node
            if (e.key === 'Delete' && this.ui.selection) {
                this.ui.deleteNode(this.ui.selection);
            }

            // Duplicate
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                if (this.ui.selection) {
                    this.ui.duplicateNode(this.ui.selection);
                }
            }

            // Run
            if (e.key === 'F5') {
                e.preventDefault();
                this.engine.run();
            }
        });
    }

    createDemo() {
        const start = this.ui.addNode('EventStart', 100, 100);
        const str = this.ui.addNode('VarString', 100, 250);
        const print = this.ui.addNode('PrintLog', 400, 100);

        str.data.value = "🚀 LogicFlow v2.0 Ready!";

        setTimeout(() => {
            this.wireManager.createWire(start.getPort('exec_out'), print.getPort('exec_in'));
            this.wireManager.createWire(str.outputs[0], print.getPort('msg'));
            this.ui.log('Welcome to LogicFlow! Drag nodes from the library to start.', 'system');
        }, 100);
    }
}

// ========================================
// 9. START APPLICATION
// ========================================

window.onload = () => {
    window.app = new App();
};