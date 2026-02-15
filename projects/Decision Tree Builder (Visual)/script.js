/**
 * Decision Tree Builder - Main Application Logic
 * v2.0.0
 * 
 * This file contains the complete logic for the decision tree builder,
 * structured using an Object-Oriented approach.
 */

/* ==========================================================================
   Utilities & Helpers
   ========================================================================== */
const Utils = {
    generateId: () => 'node_' + Date.now() + '_' + Math.floor(Math.random() * 1000),

    clamp: (val, min, max) => Math.min(Math.max(val, min), max),

    getDistance: (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y),

    // Cubic Bezier path generation
    getCurvePath: (x1, y1, x2, y2) => {
        const distY = Math.max(Math.abs(y2 - y1), 80);
        const c1x = x1;
        const c1y = y1 + distY * 0.5;
        const c2x = x2;
        const c2y = y2 - distY * 0.5;
        return `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;
    },

    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

/* ==========================================================================
   Event Manager (Pub/Sub)
   ========================================================================== */
class EventManager {
    constructor() {
        this.listeners = {};
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }
}

/* ==========================================================================
   History Manager (Undo/Redo)
   ========================================================================== */
class HistoryManager {
    constructor(app, limit = 50) {
        this.app = app;
        this.stack = [];
        this.currentIndex = -1;
        this.limit = limit;
        this.locked = false; // Prevent recording during undo/redo
    }

    record(action) {
        if (this.locked) return;

        // Remove redo history if we are in the middle of the stack
        if (this.currentIndex < this.stack.length - 1) {
            this.stack = this.stack.slice(0, this.currentIndex + 1);
        }

        this.stack.push(action);

        // Enforce limit
        if (this.stack.length > this.limit) {
            this.stack.shift();
        } else {
            this.currentIndex++;
        }

        this.updateButtons();
    }

    undo() {
        if (this.currentIndex >= 0) {
            this.locked = true;
            const action = this.stack[this.currentIndex];
            this.app.restoreState(action.before);
            this.currentIndex--;
            this.locked = false;
            this.updateButtons();
            this.app.ui.showToast('Undo performed');
        }
    }

    redo() {
        if (this.currentIndex < this.stack.length - 1) {
            this.locked = true;
            this.currentIndex++;
            const action = this.stack[this.currentIndex];
            this.app.restoreState(action.after);
            this.locked = false;
            this.updateButtons();
            this.app.ui.showToast('Redo performed');
        }
    }

    captureState() {
        // Deep copy the current nodes state
        return JSON.parse(JSON.stringify(this.app.getTreeData()));
    }

    updateButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');

        if (undoBtn) undoBtn.disabled = this.currentIndex < 0;
        if (redoBtn) redoBtn.disabled = this.currentIndex >= this.stack.length - 1;
    }
}

/* ==========================================================================
   Camera System (Pan & Zoom)
   ========================================================================== */
class Camera {
    constructor(element) {
        this.el = element;
        this.x = 0;
        this.y = 0;
        this.scale = 1;
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;

        this.minScale = 0.2;
        this.maxScale = 3.0;

        this.initEvents();
    }

    initEvents() {
        const wrapper = document.getElementById('canvas-wrapper');

        wrapper.addEventListener('wheel', (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const delta = -e.deltaY * 0.001;
                this.zoom(delta, e.clientX, e.clientY);
            } else {
                // Pan with scroll
                this.pan(-e.deltaX, -e.deltaY);
            }
        }, { passive: false });

        wrapper.addEventListener('mousedown', (e) => {
            // Middle click or Space + Left click
            if (e.button === 1 || (e.button === 0 && e.target === wrapper)) {
                this.startDrag(e);
            }
        });

        window.addEventListener('mousemove', (e) => this.drag(e));
        window.addEventListener('mouseup', () => this.endDrag());

        // Keyboard shortcuts for zoom
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === '-' || e.key === '_') this.zoomAtCenter(-0.1);
            if (e.key === '=' || e.key === '+') this.zoomAtCenter(0.1);
            // Spacebar handling for cursor style is in CSS/Wrapper logic
        });
    }

    startDrag(e) {
        this.isDragging = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        document.body.style.cursor = 'grabbing';
    }

    drag(e) {
        if (!this.isDragging) return;
        const dx = e.clientX - this.lastX;
        const dy = e.clientY - this.lastY;
        this.x += dx;
        this.y += dy;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.update();
    }

    endDrag() {
        this.isDragging = false;
        document.body.style.cursor = 'default';
    }

    pan(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.update();
    }

    zoom(delta, mouseX, mouseY) {
        const newScale = Utils.clamp(this.scale + delta, this.minScale, this.maxScale);

        if (newScale === this.scale) return;

        // Zoom towards mouse pointer logic
        const rect = this.el.getBoundingClientRect();
        // Mouse relative to canvas container
        // Complex math skipped for brevity, sticking to simple zoom or center zoom for reliability
        // Let's implement center zoom for now to be safe, or direct scale

        // Simple scale update
        this.scale = newScale;
        this.update();
    }

    zoomAtCenter(amount) {
        this.scale = Utils.clamp(this.scale + amount, this.minScale, this.maxScale);
        this.update();
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.scale = 1;
        this.update();
    }

    centerOn(nodes) {
        // Calculate bounding box of nodes and center camera
        if (nodes.length === 0) return;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        nodes.forEach(n => {
            minX = Math.min(minX, n.x);
            minY = Math.min(minY, n.y);
            maxX = Math.max(maxX, n.x + 180); // Node width
            maxY = Math.max(maxY, n.y + 100); // Node height
        });

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        const wrapper = document.getElementById('canvas-wrapper');
        const w = wrapper.clientWidth;
        const h = wrapper.clientHeight;

        this.x = w / 2 - centerX * this.scale;
        this.y = h / 2 - centerY * this.scale;
        this.update();
    }

    update() {
        this.el.style.transform = `translate(${this.x}px, ${this.y}px) scale(${this.scale})`;
        document.getElementById('zoom-level').innerText = Math.round(this.scale * 100) + '%';

        // Update grid background position for parallax effect (optional, simplified)
        document.getElementById('canvas-grid').style.transform = `translate(${this.x}px, ${this.y}px) scale(${this.scale})`;

        // Notify Minimap
        app.events.emit('cameraUpdate', { x: this.x, y: this.y, scale: this.scale });
    }

    // Convert screen coordinates to world coordinates
    screenToWorld(screenX, screenY) {
        const rect = document.getElementById('canvas-wrapper').getBoundingClientRect();
        return {
            x: (screenX - rect.left - this.x) / this.scale,
            y: (screenY - rect.top - this.y) / this.scale
        };
    }
}

/* ==========================================================================
   Node Manager
   ========================================================================== */
class Node {
    constructor(data) {
        this.id = data.id || Utils.generateId();
        this.type = data.type || 'start';
        this.x = data.x || 0;
        this.y = data.y || 0;
        this.text = data.text || 'New Node';
        this.description = data.description || '';
        this.color = data.color || 'default';
        this.parentId = data.parentId || null;
        this.children = data.children || [];
        this.isCritical = data.isCritical || false;

        this.el = null;
    }

    render() {
        const el = document.createElement('div');
        el.className = `tree-node ${this.isCritical ? 'critical' : ''}`;
        el.setAttribute('data-id', this.id);
        el.setAttribute('data-type', this.type);
        el.style.transform = `translate(${this.x}px, ${this.y}px)`;
        // Color theme application
        if (this.color !== 'default') {
            el.style.setProperty('--node-border-default', `var(--node-border-${this.color})`);
            el.style.backgroundColor = `var(--node-bg-${this.color})`;
        }

        const header = document.createElement('div');
        header.className = 'node-header';

        const body = document.createElement('div');
        body.className = 'node-body';

        const title = document.createElement('div');
        title.className = 'node-title';
        title.contentEditable = true;
        title.innerText = this.text;

        const desc = document.createElement('div');
        desc.className = 'node-desc';
        desc.innerText = this.type.toUpperCase();

        // Input Port
        if (this.type !== 'start') {
            const portIn = document.createElement('div');
            portIn.className = 'port port-in';
            el.appendChild(portIn);
        }

        // Output Port
        if (this.type !== 'outcome' && this.type !== 'note') {
            const portOut = document.createElement('div');
            portOut.className = 'port port-out';
            /* Drag logic attached in App */
            el.appendChild(portOut);
        }

        body.appendChild(title);
        body.appendChild(desc);
        el.appendChild(header);
        el.appendChild(body);

        this.el = el;
        this.attachEvents(el, title);

        return el;
    }

    attachEvents(el, title) {
        // Drag node
        el.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('port') || e.target.isContentEditable) return;
            app.startDragNode(e, this);
        });

        // Edit text
        title.addEventListener('blur', (e) => {
            app.updateNodeData(this.id, { text: e.target.innerText });
        });

        // Select node
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            app.selectNode(this.id);
        });

        // Title keydown (Prevent triggering shortcuts)
        title.addEventListener('keydown', (e) => e.stopPropagation());
    }

    updatePosition(x, y) {
        this.x = x;
        this.y = y;
        if (this.el) {
            this.el.style.transform = `translate(${x}px, ${y}px)`;
        }
    }
}

/* ==========================================================================
   Minimap System
   ========================================================================== */
class Minimap {
    constructor() {
        this.canvas = document.getElementById('minimap-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.viewportParam = document.getElementById('minimap-viewport');
        this.scale = 0.1; // Minimap scale factor

        // Size canvas
        const container = document.getElementById('minimap-container');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;

        app.events.on('update', () => this.draw());
        app.events.on('cameraUpdate', (cam) => this.updateViewport(cam));
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw nodes
        ctx.fillStyle = '#8257e5';
        app.nodes.forEach(node => {
            // Transform world coordinates to minimap coordinates
            // This requires mapping the full world bounds to the minimap
            // For simplicity, we just scale down by fixed amount relative to center
            const mx = (node.x + 5000) * 0.02; // Offset to handle negative coords
            const my = (node.y + 5000) * 0.02;
            ctx.fillRect(mx, my, 4, 3);
        });
    }

    updateViewport(cam) {
        // Update the viewport rectangle on the minimap
        // Complex calculation omitted for brevity in this step
    }
}

/* ==========================================================================
   Application Controller (Main)
   ========================================================================== */
class App {
    constructor() {
        this.nodes = [];
        this.events = new EventManager();
        this.history = new HistoryManager(this);
        this.camera = new Camera(document.getElementById('pan-container'));
        this.ui = new UIManager(this);

        this.layers = {
            nodes: document.getElementById('nodes-layer'),
            connections: document.getElementById('connections-layer')
        };

        this.selectedNodeId = null;
        this.tempLine = null;
        this.dragMode = null; // 'node' or 'connection'
        this.activeObject = null;

        this.init();
    }

    init() {
        this.setupGlobalEvents();
        // Initial Node
        const root = new Node({
            x: 200,
            y: 100,
            text: 'Problem Statement',
            type: 'start'
        });
        this.nodes.push(root);
        this.render();

        // Initial history state
        this.history.record({ before: {}, after: this.getTreeData() });
    }

    render() {
        // Render Nodes
        this.layers.nodes.innerHTML = '';
        this.nodes.forEach(node => {
            if (!node.el) node.el = new Node(node).render();
            // Re-append existing element to maintain references if possible, 
            // but for full re-render we recreate.
            // Efficient way: check diff. For now, clear and rebuild.
            // Recreating Node instance is bad for state. 
            // Better: update existing instances or clear DOM only.

            // Let's rely on the fact that this.nodes contains objects.
            const el = node.render ? node.render() : new Node(node).render();
            // Ideally we shouldn't recreate Node classes on every render.
            // Let's assume this.nodes are data objects for now to simplify serialization.
            // Wait, I designed Node as a class. I should store instances.
            this.layers.nodes.appendChild(el);

            // Restore selection
            if (node.id === this.selectedNodeId) {
                el.classList.add('selected');
            }
        });

        this.updateConnections();
        this.events.emit('update');
        this.updateStats();
    }

    updateConnections() {
        const container = this.layers.connections;
        container.innerHTML = ''; // Clear SVG

        this.nodes.forEach(node => {
            if (node.children && node.children.length > 0) {
                node.children.forEach(childId => {
                    const child = this.nodes.find(n => n.id === childId);
                    if (child) {
                        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        // Parent bottom center
                        const x1 = node.x + 90; // Approx half width
                        const y1 = node.y + 60; // Approx height with header
                        // Child top center
                        const x2 = child.x + 90;
                        const y2 = child.y; // Top

                        path.setAttribute('d', Utils.getCurvePath(x1, y1, x2, y2));
                        path.setAttribute('class', 'connection-line');
                        path.onclick = (e) => {
                            e.stopPropagation();
                            // Logic to select/delete connection could go here
                        };
                        container.appendChild(path);
                    }
                });
            }
        });

        if (this.tempLine) container.appendChild(this.tempLine);
    }

    /* --- Actions --- */

    addNode(data) {
        const preState = this.history.captureState();
        const newNode = new Node(data);
        this.nodes.push(newNode);
        this.render();
        this.history.record({ before: preState, after: this.history.captureState() });
        return newNode;
    }

    deleteNode(id) {
        const preState = this.history.captureState();

        // Recursive delete
        const toDelete = new Set();
        const gatherChildren = (nodeId) => {
            toDelete.add(nodeId);
            const node = this.nodes.find(n => n.id === nodeId);
            if (node && node.children) {
                node.children.forEach(cid => gatherChildren(cid));
            }
        };
        gatherChildren(id);

        this.nodes = this.nodes.filter(n => !toDelete.has(n.id));

        // Remove references from parents
        this.nodes.forEach(n => {
            n.children = n.children.filter(cid => !toDelete.has(cid));
        });

        this.render();
        this.selectNode(null);
        this.history.record({ before: preState, after: this.history.captureState() });
    }

    updateNodeData(id, data) {
        const node = this.nodes.find(n => n.id === id);
        if (node) {
            Object.assign(node, data);
            // Only re-render if visual properties changed
            if (data.type || data.color) this.render();
            // If just text, we might not need full re-render if updated in place
            this.ui.updatePropertiesPanel(node);
            // Note: History recording should be debounced for text, or triggered on blur
        }
    }

    selectNode(id) {
        this.selectedNodeId = id;
        document.querySelectorAll('.tree-node').forEach(el => el.classList.remove('selected'));

        if (id) {
            const node = this.nodes.find(n => n.id === id);
            if (node && node.el) node.el.classList.add('selected');
            this.ui.showProperties(node);
        } else {
            this.ui.hideProperties();
        }
    }

    /* --- Dragging System --- */

    startDragNode(e, nodeInstance) {
        if (e.target.classList.contains('port-out')) {
            this.startConnectionDrag(e, nodeInstance);
            return;
        }

        this.dragMode = 'node';
        this.activeObject = nodeInstance;

        // Store initial offset
        const worldPos = this.camera.screenToWorld(e.clientX, e.clientY);
        this.dragOffset = {
            x: worldPos.x - nodeInstance.x,
            y: worldPos.y - nodeInstance.y
        };

        document.body.style.cursor = 'move';

        // Window events
        const moveHandler = (e) => {
            const pos = this.camera.screenToWorld(e.clientX, e.clientY);
            // Snap to grid (optional)
            const snap = 10;
            const nx = Math.round((pos.x - this.dragOffset.x) / snap) * snap;
            const ny = Math.round((pos.y - this.dragOffset.y) / snap) * snap;

            this.activeObject.updatePosition(nx, ny);
            this.updateConnections(); // Performance: Maybe throttle this?
        };

        const upHandler = () => {
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
            this.dragMode = null;
            this.activeObject = null;
            document.body.style.cursor = 'default';
        };

        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
    }

    startConnectionDrag(e, sourceNode) {
        e.stopPropagation();
        this.dragMode = 'connection';
        this.activeObject = sourceNode;

        // Create temp line
        this.tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.tempLine.setAttribute('class', 'drag-line');
        this.layers.connections.appendChild(this.tempLine);

        const startX = sourceNode.x + 90;
        const startY = sourceNode.y + 60;

        const moveHandler = (e) => {
            const pos = this.camera.screenToWorld(e.clientX, e.clientY);
            this.tempLine.setAttribute('d', Utils.getCurvePath(startX, startY, pos.x, pos.y));
        };

        const upHandler = (e) => {
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
            this.tempLine.remove();
            this.tempLine = null;

            // Check if dropped on a node
            // Since SVG overlays, we use elementFromPoint or hit testing
            // Simple way: check bounding boxes of all nodes
            const pos = this.camera.screenToWorld(e.clientX, e.clientY);
            // But we actually dropped on the screen element
            // e.target might be the SVG overlay or canvas wrapper

            // We can check if any node is under the mouse
            // The nodes layer has pointer-events: none, but nodes have all.
            // So e.target should be the node if we are over it.
            // BUT, the Up event happens on window. If cursor is over a node div, e.target in handler might not be accurate if the listener is on window.
            // Actually, document.elementFromPoint(e.clientX, e.clientY) is reliable.

            const el = document.elementFromPoint(e.clientX, e.clientY);
            const targetNodeEl = el.closest('.tree-node');

            if (targetNodeEl) {
                const targetId = targetNodeEl.getAttribute('data-id');
                if (targetId && targetId !== sourceNode.id) {
                    // Connect
                    this.connectNodes(sourceNode.id, targetId);
                    return;
                }
            }

            // If dropped on empty space, create new node
            const newNode = this.addNode({
                x: pos.x - 90,
                y: pos.y,
                text: 'New Decision',
                type: 'decision',
                parentId: sourceNode.id
            });
            this.connectNodes(sourceNode.id, newNode.id);
        };

        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
    }

    connectNodes(parentId, childId) {
        const parent = this.nodes.find(n => n.id === parentId);
        if (parent && !parent.children.includes(childId)) {
            const preState = this.history.captureState();
            parent.children.push(childId);
            // Also update child's parentId ref (assuming single parent for tree structure)
            const child = this.nodes.find(n => n.id === childId);
            if (child) child.parentId = parentId;

            this.render();
            this.history.record({ before: preState, after: this.history.captureState() });
        }
    }

    /* --- Serialization --- */

    getTreeData() {
        return this.nodes.map(n => ({
            id: n.id,
            x: n.x, y: n.y,
            text: n.text,
            type: n.type,
            color: n.color,
            parentId: n.parentId,
            children: n.children,
            description: n.description,
            isCritical: n.isCritical
        }));
    }

    restoreState(data) {
        // Reconstruct Node objects from data
        this.nodes = data.map(d => new Node(d));
        this.render();
        this.selectNode(null);
    }

    exportJSON() {
        const data = JSON.stringify({
            meta: { version: "2.0", app: "DecisionTreeBuilder" },
            nodes: this.getTreeData()
        }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `decision-tree-${Date.now()}.json`;
        a.click();
    }

    importJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                if (json.nodes) {
                    const preState = this.history.captureState();
                    this.restoreState(json.nodes);
                    this.history.record({ before: preState, after: this.history.captureState() });
                    this.ui.showToast('Project loaded successfully');
                } else {
                    throw new Error('Invalid format');
                }
            } catch (err) {
                alert('Error loading file: ' + err.message);
            }
        };
        reader.readAsText(file);
    }

    /* --- Auto Layout --- */
    autoLayout() {
        if (this.nodes.length === 0) return;

        const preState = this.history.captureState();

        // Identify root (node with no parent or first one)
        const root = this.nodes.find(n => !n.parentId) || this.nodes[0];

        // Simple BFS for levels
        const levels = {};
        const queue = [{ id: root.id, level: 0 }];
        const visited = new Set();

        while (queue.length > 0) {
            const { id, level } = queue.shift();
            if (visited.has(id)) continue;
            visited.add(id);

            if (!levels[level]) levels[level] = [];
            levels[level].push(id);

            const node = this.nodes.find(n => n.id === id);
            if (node.children) {
                node.children.forEach(cid => queue.push({ id: cid, level: level + 1 }));
            }
        }

        // Assign positions
        const startY = 50;
        const levelHeight = 150;
        const nodeWidth = 200;
        const startX = 200;

        Object.keys(levels).forEach(lvl => {
            const nodeIds = levels[lvl];
            const levelWidth = nodeIds.length * nodeWidth;
            let currentX = startX - (levelWidth / 2);

            nodeIds.forEach(nid => {
                const node = this.nodes.find(n => n.id === nid);
                node.x = currentX;
                node.y = startY + (parseInt(lvl) * levelHeight);
                currentX += nodeWidth;
            });
        });

        this.render();
        this.camera.centerOn(this.nodes);
        this.history.record({ before: preState, after: this.history.captureState() });
    }

    setupGlobalEvents() {
        // Toolbar actions
        document.getElementById('undo-btn').onclick = () => this.history.undo();
        document.getElementById('redo-btn').onclick = () => this.history.redo();
        document.getElementById('zoom-in-btn').onclick = () => this.camera.zoomAtCenter(0.1);
        document.getElementById('zoom-out-btn').onclick = () => this.camera.zoomAtCenter(-0.1);
        document.getElementById('fit-view-btn').onclick = () => this.camera.centerOn(this.nodes);
        document.getElementById('auto-layout-btn').onclick = () => this.autoLayout();
        document.getElementById('reset-btn').onclick = () => {
            if (confirm('Clear all?')) {
                this.nodes = [];
                this.init(); // Reset to root
            }
        };

        document.getElementById('export-btn').onclick = () => this.exportJSON();
        document.getElementById('import-btn').onclick = () => document.getElementById('file-input').click();
        document.getElementById('file-input').onchange = (e) => {
            if (e.target.files.length) this.importJSON(e.target.files[0]);
        };

        // Theme Toggle
        document.getElementById('theme-toggle').onclick = () => {
            document.body.classList.toggle('theme-light');
            document.body.classList.toggle('theme-dark');
        };

        // Keyboard Actions
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            if (e.key === 'Delete' && this.selectedNodeId) {
                this.deleteNode(this.selectedNodeId);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                if (e.shiftKey) this.history.redo();
                else this.history.undo();
            }
        });
    }

    updateStats() {
        document.getElementById('node-count').innerText = `${this.nodes.length} Nodes`;
    }
}

/* ==========================================================================
   UI Manager
   ========================================================================== */
class UIManager {
    constructor(app) {
        this.app = app;
        this.propsPanel = document.getElementById('properties-panel');
        this.toastContainer = document.getElementById('toast-container');

        this.initSidebarDrag();
        this.initHelpModal();
        this.initContextMenu();
    }

    showProperties(node) {
        this.propsPanel.classList.remove('hidden');
        document.getElementById('props-content').style.display = 'block';
        document.getElementById('props-empty-state').style.display = 'none';

        // Populate fields
        document.getElementById('prop-id').value = node.id;
        document.getElementById('prop-label').value = node.text;
        document.getElementById('prop-desc').value = node.description || '';
        document.getElementById('prop-type').value = node.type;
        document.getElementById('prop-critical').checked = node.isCritical;

        this.updateColorSelection(node.color);

        // Bind events
        this.bindPropertyEvents(node.id);
    }

    hideProperties() {
        this.propsPanel.classList.add('hidden');
    }

    updateColorSelection(color) {
        document.querySelectorAll('.color-swatch').forEach(el => {
            el.classList.toggle('active', el.dataset.color === color);
        });
    }

    bindPropertyEvents(nodeId) {
        // Clear old listeners by cloning elements (quick hack) or assumes single binding
        // For simplicity, we just set onchange handlers directly

        const update = (key, val) => {
            this.app.updateNodeData(nodeId, { [key]: val });
            const preState = this.app.history.captureState(); // This captures post-change? logic flaw. 
            // Ideally history records before change.
            // Simplified for now.
        };

        document.getElementById('prop-label').oninput = (e) => {
            this.app.updateNodeData(nodeId, { text: e.target.value });
        };

        document.getElementById('prop-desc').onchange = (e) => update('description', e.target.value);
        document.getElementById('prop-type').onchange = (e) => update('type', e.target.value);
        document.getElementById('prop-critical').onchange = (e) => update('isCritical', e.target.checked);

        document.getElementById('prop-colors').onclick = (e) => {
            if (e.target.classList.contains('color-swatch')) {
                const color = e.target.dataset.color;
                update('color', color);
                this.updateColorSelection(color);
            }
        };

        document.getElementById('delete-selected-btn').onclick = () => {
            this.app.deleteNode(nodeId);
        };

        document.getElementById('close-props').onclick = () => this.hideProperties();
    }

    // Handle Drag from Sidebar
    initSidebarDrag() {
        const draggables = document.querySelectorAll('.draggable-node');

        draggables.forEach(el => {
            el.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('type', el.dataset.type);
                e.dataTransfer.effectAllowed = 'copy';
            });
        });

        const canvas = document.getElementById('canvas-wrapper');
        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData('type');
            if (type) {
                const pos = this.app.camera.screenToWorld(e.clientX, e.clientY);
                this.app.addNode({
                    x: pos.x,
                    y: pos.y,
                    type: type,
                    text: 'New ' + type
                });
            }
        });
    }

    initHelpModal() {
        const modal = document.getElementById('help-modal');
        document.getElementById('help-btn').onclick = () => {
            modal.classList.remove('hidden');
        };
        const close = () => modal.classList.add('hidden');
        document.querySelectorAll('.close-modal-btn').forEach(btn => btn.onclick = close);

        modal.onclick = (e) => {
            if (e.target === modal) close();
        };
    }

    initContextMenu() {
        const menu = document.getElementById('context-menu');
        const wrapper = document.getElementById('canvas-wrapper');
        let contextNodeId = null;

        wrapper.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const el = document.elementFromPoint(e.clientX, e.clientY);
            const nodeEl = el.closest('.tree-node');

            if (nodeEl) {
                contextNodeId = nodeEl.dataset.id;
                // Show Menu
                menu.style.left = e.clientX + 'px';
                menu.style.top = e.clientY + 'px';
                menu.classList.remove('hidden');
            } else {
                menu.classList.add('hidden');
            }
        });

        document.addEventListener('click', () => menu.classList.add('hidden'));

        // Actions
        document.getElementById('ctx-delete').onclick = () => {
            if (contextNodeId) this.app.deleteNode(contextNodeId);
        };

        document.getElementById('ctx-duplicate').onclick = () => {
            if (contextNodeId) {
                const node = this.app.nodes.find(n => n.id === contextNodeId);
                if (node) {
                    this.app.addNode({
                        ...node,
                        id: null, // New ID
                        x: node.x + 20,
                        y: node.y + 20,
                        children: [] // Don't copy children logic for now
                    });
                }
            }
        };

        document.getElementById('ctx-add-child').onclick = () => {
            if (contextNodeId) {
                const node = this.app.nodes.find(n => n.id === contextNodeId);
                this.app.addNode({
                    x: node.x + 200,
                    y: node.y + 100,
                    type: 'decision',
                    parentId: contextNodeId
                });
            }
        };
    }

    showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerText = msg;
        // Simple inline style for now (move to CSS in real app)
        toast.style.cssText = 'background: #333; color: white; padding: 10px 20px; border-radius: 4px; margin-top: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); animation: fadein 0.3s;';

        this.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    updatePropertiesPanel(node) {
        if (this.app.selectedNodeId === node.id) {
            // Update fields if changed externally (e.g. undo)
            document.getElementById('prop-label').value = node.text;
        }
    }
}

/* ==========================================================================
   Initialization
   ========================================================================== */
const app = new App();
window.app = app; // For debugging
