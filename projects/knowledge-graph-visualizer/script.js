/**
 * Knowledge Graph Visualizer
 * Advanced graph visualization and analysis tool
 * Version 1.0.0
 */

class KnowledgeGraphVisualizer {
    constructor() {
        this.nodes = [];
        this.edges = [];
        this.selectedNodes = new Set();
        this.selectedEdges = new Set();
        this.nodeIdCounter = 1;
        this.edgeIdCounter = 1;
        this.history = [];
        this.historyIndex = -1;
        this.settings = {
            animationSpeed: 500,
            nodeSpacing: 100,
            edgeThickness: 2,
            showGrid: false,
            snapToGrid: false,
            autoSave: true
        };
        this.layout = {
            type: 'force',
            attraction: -50,
            repulsion: 200
        };
        this.collaboration = {
            active: false,
            users: 1,
            sessionId: null
        };

        this.svg = null;
        this.simulation = null;
        this.zoom = null;
        this.minimap = null;
        this.drag = null;

        this.initialize();
    }

    initialize() {
        this.loadSettings();
        this.setupSVG();
        this.setupEventListeners();
        this.setupContextMenu();
        this.setupModals();
        this.initializeLayouts();
        this.initializeAnalysis();
        this.loadFromStorage();
        this.updateUI();
        this.saveHistory();
    }

    setupSVG() {
        const container = d3.select('#graphContainer');
        const width = container.node().getBoundingClientRect().width;
        const height = container.node().getBoundingClientRect().height;

        this.svg = container.append('svg')
            .attr('id', 'graphSvg')
            .attr('width', width)
            .attr('height', height);

        // Add zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.svg.select('g').attr('transform', event.transform);
                this.updateMinimap();
            });

        this.svg.call(this.zoom);

        // Add main group
        this.svg.append('g').attr('class', 'main-group');

        // Add grid
        this.addGrid();

        // Add arrow marker
        this.svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 20)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#7f8c8d');

        // Setup minimap
        this.setupMinimap();

        // Setup drag behavior
        this.drag = d3.drag()
            .on('start', (event, d) => this.dragStarted(event, d))
            .on('drag', (event, d) => this.dragged(event, d))
            .on('end', (event, d) => this.dragEnded(event, d));
    }

    addGrid() {
        const gridGroup = this.svg.select('g').append('g').attr('class', 'grid');

        const x = d3.scaleLinear().range([0, 2000]);
        const y = d3.scaleLinear().range([0, 2000]);

        gridGroup.append('g')
            .attr('class', 'grid-lines-x')
            .selectAll('line')
            .data(d3.range(0, 2000, 50))
            .enter().append('line')
            .attr('x1', d => d)
            .attr('y1', 0)
            .attr('x2', d => d)
            .attr('y2', 2000)
            .attr('stroke', '#e9ecef')
            .attr('stroke-width', 1);

        gridGroup.append('g')
            .attr('class', 'grid-lines-y')
            .selectAll('line')
            .data(d3.range(0, 2000, 50))
            .enter().append('line')
            .attr('x1', 0)
            .attr('y1', d => d)
            .attr('x2', 2000)
            .attr('y2', d => d)
            .attr('stroke', '#e9ecef')
            .attr('stroke-width', 1);

        this.updateGridVisibility();
    }

    updateGridVisibility() {
        this.svg.select('.grid').style('display', this.settings.showGrid ? 'block' : 'none');
    }

    setupMinimap() {
        const minimapSvg = d3.select('#minimapSvg');
        const width = 150;
        const height = 100;

        minimapSvg.attr('viewBox', `0 0 ${width} ${height}`);

        this.minimap = minimapSvg.append('g');
        this.minimap.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', '#fafafa')
            .attr('stroke', '#ddd');
    }

    updateMinimap() {
        if (!this.minimap) return;

        const bounds = this.svg.node().getBoundingClientRect();
        const transform = d3.zoomTransform(this.svg.node());

        // Update minimap view rectangle
        this.minimap.selectAll('.view-rect').remove();
        this.minimap.append('rect')
            .attr('class', 'view-rect')
            .attr('x', -transform.x / transform.k)
            .attr('y', -transform.y / transform.k)
            .attr('width', bounds.width / transform.k)
            .attr('height', bounds.height / transform.k)
            .attr('fill', 'none')
            .attr('stroke', '#667eea')
            .attr('stroke-width', 2);

        // Update node positions in minimap
        this.minimap.selectAll('.minimap-node').remove();
        this.minimap.selectAll('.minimap-node')
            .data(this.nodes)
            .enter().append('circle')
            .attr('class', 'minimap-node')
            .attr('cx', d => d.x / 10)
            .attr('cy', d => d.y / 10)
            .attr('r', 2)
            .attr('fill', d => this.getNodeColor(d.type));
    }

    setupEventListeners() {
        // Main controls
        document.getElementById('newGraphBtn').addEventListener('click', () => this.newGraph());
        document.getElementById('loadGraphBtn').addEventListener('click', () => this.loadGraph());
        document.getElementById('saveGraphBtn').addEventListener('click', () => this.saveGraph());
        document.getElementById('exportGraphBtn').addEventListener('click', () => this.exportGraph());
        document.getElementById('importGraphBtn').addEventListener('click', () => this.importGraph());
        document.getElementById('clearGraphBtn').addEventListener('click', () => this.clearGraph());

        // Node controls
        document.getElementById('addNodeBtn').addEventListener('click', () => this.showNodeModal());
        document.getElementById('updateNodeBtn').addEventListener('click', () => this.updateNodeProperties());

        // Edge controls
        document.getElementById('addEdgeBtn').addEventListener('click', () => this.showEdgeModal());
        document.getElementById('updateEdgeBtn').addEventListener('click', () => this.updateEdgeProperties());
        document.getElementById('deleteSelectedBtn').addEventListener('click', () => this.deleteSelected());

        // Search and filter
        document.getElementById('searchBtn').addEventListener('click', () => this.searchNodes());
        document.getElementById('applyFilterBtn').addEventListener('click', () => this.applyFilter());

        // Layout controls
        document.getElementById('forceLayoutBtn').addEventListener('click', () => this.setLayout('force'));
        document.getElementById('circularLayoutBtn').addEventListener('click', () => this.setLayout('circular'));
        document.getElementById('hierarchicalLayoutBtn').addEventListener('click', () => this.setLayout('hierarchical'));
        document.getElementById('radialLayoutBtn').addEventListener('click', () => this.setLayout('radial'));

        // View controls
        document.getElementById('zoomInBtn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoomOut());
        document.getElementById('fitToScreenBtn').addEventListener('click', () => this.fitToScreen());
        document.getElementById('resetViewBtn').addEventListener('click', () => this.resetView());
        document.getElementById('toggleLabelsBtn').addEventListener('click', () => this.toggleLabels());
        document.getElementById('toggleEdgesBtn').addEventListener('click', () => this.toggleEdges());
        document.getElementById('showStatsBtn').addEventListener('click', () => this.showStats());

        // Settings
        this.setupSettingsListeners();

        // History
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearHistory());

        // Collaboration
        document.getElementById('shareGraphBtn').addEventListener('click', () => this.shareGraph());
        document.getElementById('collaborateBtn').addEventListener('click', () => this.startCollaboration());
        document.getElementById('exportSessionBtn').addEventListener('click', () => this.exportSession());

        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Analysis
        document.getElementById('calculateCentralityBtn').addEventListener('click', () => this.calculateCentrality());
        document.getElementById('detectCommunitiesBtn').addEventListener('click', () => this.detectCommunities());
        document.getElementById('findPathBtn').addEventListener('click', () => this.findPath());

        // File input
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileImport(e));
    }

    setupSettingsListeners() {
        const settings = ['animationSpeed', 'nodeSpacing', 'edgeThickness'];
        settings.forEach(setting => {
            const element = document.getElementById(setting);
            const display = document.getElementById(`${setting}Value`);
            if (element && display) {
                element.addEventListener('input', (e) => {
                    this.settings[setting] = parseInt(e.target.value);
                    display.textContent = e.target.value + (setting === 'animationSpeed' ? 'ms' : 'px');
                    this.saveSettings();
                    this.updateVisualization();
                });
            }
        });

        // Checkboxes
        ['showGrid', 'snapToGrid', 'autoSave'].forEach(setting => {
            const element = document.getElementById(setting);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.settings[setting] = e.target.checked;
                    this.saveSettings();
                    if (setting === 'showGrid') this.updateGridVisibility();
                });
            }
        });
    }

    setupContextMenu() {
        const contextMenu = document.getElementById('contextMenu');

        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('#graphContainer')) {
                e.preventDefault();
                contextMenu.style.display = 'block';
                contextMenu.style.left = e.pageX + 'px';
                contextMenu.style.top = e.pageY + 'px';
            }
        });

        document.addEventListener('click', () => {
            contextMenu.style.display = 'none';
        });

        document.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                this.handleContextMenuAction(action);
            });
        });
    }

    setupModals() {
        // Node modal
        document.getElementById('saveNodeBtn').addEventListener('click', () => this.saveNode());
        document.getElementById('cancelNodeBtn').addEventListener('click', () => this.hideNodeModal());

        // Edge modal
        document.getElementById('saveEdgeBtn').addEventListener('click', () => this.saveEdge());
        document.getElementById('cancelEdgeBtn').addEventListener('click', () => this.hideEdgeModal());

        // Close modals
        document.querySelectorAll('.modal-close').forEach(close => {
            close.addEventListener('click', () => this.hideAllModals());
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideAllModals();
            });
        });
    }

    // Node and Edge Management
    addNode(x, y, type = 'concept', label = '', description = '') {
        const node = {
            id: this.nodeIdCounter++,
            x: x || Math.random() * 800 + 100,
            y: y || Math.random() * 600 + 100,
            type: type,
            label: label || `Node ${this.nodeIdCounter - 1}`,
            description: description,
            size: 20,
            color: this.getNodeColor(type),
            shape: 'circle',
            properties: {}
        };

        this.nodes.push(node);
        this.saveHistory();
        this.updateVisualization();
        this.updateUI();
        return node;
    }

    addEdge(sourceId, targetId, type = 'related-to', label = '', weight = 1) {
        const source = this.nodes.find(n => n.id === sourceId);
        const target = this.nodes.find(n => n.id === targetId);

        if (!source || !target) return null;

        const edge = {
            id: this.edgeIdCounter++,
            source: source,
            target: target,
            type: type,
            label: label,
            weight: weight,
            color: '#7f8c8d',
            style: 'solid'
        };

        this.edges.push(edge);
        this.saveHistory();
        this.updateVisualization();
        this.updateUI();
        return edge;
    }

    deleteNode(nodeId) {
        this.nodes = this.nodes.filter(n => n.id !== nodeId);
        this.edges = this.edges.filter(e => e.source.id !== nodeId && e.target.id !== nodeId);
        this.selectedNodes.delete(nodeId);
        this.saveHistory();
        this.updateVisualization();
        this.updateUI();
    }

    deleteEdge(edgeId) {
        this.edges = this.edges.filter(e => e.id !== edgeId);
        this.selectedEdges.delete(edgeId);
        this.saveHistory();
        this.updateVisualization();
        this.updateUI();
    }

    deleteSelected() {
        this.selectedNodes.forEach(nodeId => this.deleteNode(nodeId));
        this.selectedEdges.forEach(edgeId => this.deleteEdge(edgeId));
        this.selectedNodes.clear();
        this.selectedEdges.clear();
    }

    updateNodeProperties() {
        const selectedNode = this.getSelectedNode();
        if (!selectedNode) return;

        selectedNode.label = document.getElementById('nodeLabel').value;
        selectedNode.description = document.getElementById('nodeDescription').value;
        selectedNode.color = document.getElementById('nodeColor').value;
        selectedNode.size = parseInt(document.getElementById('nodeSize').value);
        selectedNode.shape = document.getElementById('nodeShape').value;

        this.saveHistory();
        this.updateVisualization();
    }

    updateEdgeProperties() {
        const selectedEdge = this.getSelectedEdge();
        if (!selectedEdge) return;

        selectedEdge.label = document.getElementById('edgeLabel').value;
        selectedEdge.weight = parseInt(document.getElementById('edgeWeight').value);
        selectedEdge.color = document.getElementById('edgeColor').value;
        selectedEdge.style = document.getElementById('edgeStyle').value;

        this.saveHistory();
        this.updateVisualization();
    }

    getNodeColor(type) {
        const colors = {
            concept: '#3498db',
            entity: '#e74c3c',
            attribute: '#2ecc71',
            relation: '#f39c12',
            event: '#9b59b6'
        };
        return colors[type] || '#95a5a6';
    }

    // Visualization
    updateVisualization() {
        this.updateNodes();
        this.updateEdges();
        this.updateSimulation();
        this.updateMinimap();
        this.updateStats();
    }

    updateNodes() {
        const nodeGroup = this.svg.select('g').selectAll('.node')
            .data(this.nodes, d => d.id);

        // Enter
        const nodeEnter = nodeGroup.enter().append('g')
            .attr('class', 'node')
            .attr('id', d => `node-${d.id}`)
            .call(this.drag);

        // Add shapes based on node type
        nodeEnter.each((d, i, nodes) => {
            const node = d3.select(nodes[i]);
            this.addNodeShape(node, d);
        });

        // Add labels
        nodeEnter.append('text')
            .attr('class', 'node-label')
            .attr('text-anchor', 'middle')
            .attr('dy', d => d.size + 15)
            .text(d => d.label);

        // Update
        nodeGroup.merge(nodeEnter)
            .classed('selected', d => this.selectedNodes.has(d.id))
            .select('.node-shape')
            .attr('fill', d => d.color)
            .attr('r', d => d.size)
            .attr('width', d => d.size * 2)
            .attr('height', d => d.size * 2)
            .attr('x', d => -d.size)
            .attr('y', d => -d.size);

        nodeGroup.merge(nodeEnter)
            .select('.node-label')
            .text(d => d.label);

        // Exit
        nodeGroup.exit().remove();

        // Add click handlers
        this.svg.selectAll('.node')
            .on('click', (event, d) => this.selectNode(d.id, event))
            .on('dblclick', (event, d) => this.editNode(d));
    }

    addNodeShape(node, d) {
        if (d.shape === 'circle') {
            node.append('circle')
                .attr('class', 'node-shape')
                .attr('r', d.size)
                .attr('fill', d.color);
        } else if (d.shape === 'square') {
            node.append('rect')
                .attr('class', 'node-shape')
                .attr('width', d.size * 2)
                .attr('height', d.size * 2)
                .attr('x', -d.size)
                .attr('y', -d.size)
                .attr('fill', d.color);
        } else if (d.shape === 'triangle') {
            const size = d.size;
            const points = `${-size},${size} ${size},${size} 0,${-size}`;
            node.append('polygon')
                .attr('class', 'node-shape')
                .attr('points', points)
                .attr('fill', d.color);
        } else if (d.shape === 'diamond') {
            const size = d.size;
            const points = `0,${-size} ${size},0 0,${size} ${-size},0`;
            node.append('polygon')
                .attr('class', 'node-shape')
                .attr('points', points)
                .attr('fill', d.color);
        } else if (d.shape === 'star') {
            // Simple star shape
            const size = d.size;
            const points = this.generateStarPoints(0, 0, 5, size, size * 0.5);
            node.append('polygon')
                .attr('class', 'node-shape')
                .attr('points', points)
                .attr('fill', d.color);
        }
    }

    generateStarPoints(cx, cy, spikes, outerRadius, innerRadius) {
        let points = '';
        const step = Math.PI / spikes;

        for (let i = 0; i < 2 * spikes; i++) {
            const angle = i * step;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            points += `${x},${y} `;
        }

        return points.trim();
    }

    updateEdges() {
        const edgeGroup = this.svg.select('g').selectAll('.edge')
            .data(this.edges, d => d.id);

        // Enter
        const edgeEnter = edgeGroup.enter().append('g')
            .attr('class', 'edge')
            .attr('id', d => `edge-${d.id}`);

        edgeEnter.append('line')
            .attr('class', 'edge-line')
            .attr('marker-end', 'url(#arrowhead)');

        edgeEnter.append('text')
            .attr('class', 'edge-label')
            .attr('text-anchor', 'middle')
            .attr('dy', -5)
            .text(d => d.label);

        // Update
        edgeGroup.merge(edgeEnter)
            .classed('selected', d => this.selectedEdges.has(d.id))
            .select('.edge-line')
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y)
            .attr('stroke', d => d.color)
            .attr('stroke-width', d => d.weight * this.settings.edgeThickness)
            .attr('stroke-dasharray', d => d.style === 'dashed' ? '5,5' : d.style === 'dotted' ? '2,2' : 'none');

        edgeGroup.merge(edgeEnter)
            .select('.edge-label')
            .attr('x', d => (d.source.x + d.target.x) / 2)
            .attr('y', d => (d.source.y + d.target.y) / 2)
            .text(d => d.label);

        // Exit
        edgeGroup.exit().remove();

        // Add click handlers
        this.svg.selectAll('.edge')
            .on('click', (event, d) => this.selectEdge(d.id, event))
            .on('dblclick', (event, d) => this.editEdge(d));
    }

    updateSimulation() {
        if (this.simulation) {
            this.simulation.stop();
        }

        if (this.layout.type === 'force') {
            this.simulation = d3.forceSimulation(this.nodes)
                .force('link', d3.forceLink(this.edges).id(d => d.id).distance(this.settings.nodeSpacing))
                .force('charge', d3.forceManyBody().strength(this.layout.repulsion))
                .force('center', d3.forceCenter(400, 300))
                .force('x', d3.forceX().strength(this.layout.attraction / 1000))
                .force('y', d3.forceY().strength(this.layout.attraction / 1000))
                .on('tick', () => this.ticked());
        } else {
            this.applyLayout();
        }
    }

    ticked() {
        this.svg.selectAll('.node')
            .attr('transform', d => `translate(${d.x},${d.y})`);

        this.svg.selectAll('.edge-line')
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        this.svg.selectAll('.edge-label')
            .attr('x', d => (d.source.x + d.target.x) / 2)
            .attr('y', d => (d.source.y + d.target.y) / 2);

        this.updateMinimap();
    }

    // Layout Algorithms
    initializeLayouts() {
        // Layout algorithms will be implemented here
    }

    setLayout(type) {
        this.layout.type = type;
        this.applyLayout();
        this.showNotification(`Switched to ${type} layout`, 'info');
    }

    applyLayout() {
        switch (this.layout.type) {
            case 'circular':
                this.applyCircularLayout();
                break;
            case 'hierarchical':
                this.applyHierarchicalLayout();
                break;
            case 'radial':
                this.applyRadialLayout();
                break;
            default:
                this.updateSimulation();
        }
    }

    applyCircularLayout() {
        const centerX = 400;
        const centerY = 300;
        const radius = Math.min(300, this.nodes.length * 20);

        this.nodes.forEach((node, i) => {
            const angle = (i / this.nodes.length) * 2 * Math.PI;
            node.x = centerX + radius * Math.cos(angle);
            node.y = centerY + radius * Math.sin(angle);
        });

        this.ticked();
    }

    applyHierarchicalLayout() {
        // Simple hierarchical layout
        const levels = {};
        this.nodes.forEach(node => {
            const level = this.calculateNodeLevel(node);
            if (!levels[level]) levels[level] = [];
            levels[level].push(node);
        });

        const levelKeys = Object.keys(levels).sort((a, b) => parseInt(a) - parseInt(b));
        const levelHeight = 100;

        levelKeys.forEach((level, levelIndex) => {
            const nodesInLevel = levels[level];
            const levelWidth = 800;
            const nodeSpacing = levelWidth / (nodesInLevel.length + 1);

            nodesInLevel.forEach((node, nodeIndex) => {
                node.x = (nodeIndex + 1) * nodeSpacing;
                node.y = levelIndex * levelHeight + 100;
            });
        });

        this.ticked();
    }

    calculateNodeLevel(node) {
        // Simple level calculation based on incoming edges
        const incomingEdges = this.edges.filter(e => e.target.id === node.id);
        return incomingEdges.length;
    }

    applyRadialLayout() {
        const centerX = 400;
        const centerY = 300;
        const maxRadius = 300;

        // Calculate node depths using BFS
        const depths = this.calculateNodeDepths();
        const maxDepth = Math.max(...Object.values(depths));

        this.nodes.forEach(node => {
            const depth = depths[node.id] || 0;
            const radius = (depth / maxDepth) * maxRadius;
            const angle = (this.nodes.indexOf(node) / this.nodes.length) * 2 * Math.PI;

            node.x = centerX + radius * Math.cos(angle);
            node.y = centerY + radius * Math.sin(angle);
        });

        this.ticked();
    }

    calculateNodeDepths() {
        const depths = {};
        const visited = new Set();

        // Start from nodes with no incoming edges
        const startNodes = this.nodes.filter(node =>
            !this.edges.some(edge => edge.target.id === node.id)
        );

        startNodes.forEach(node => {
            depths[node.id] = 0;
            this.bfsDepth(node, depths, visited);
        });

        return depths;
    }

    bfsDepth(node, depths, visited) {
        if (visited.has(node.id)) return;
        visited.add(node.id);

        const outgoingEdges = this.edges.filter(e => e.source.id === node.id);
        outgoingEdges.forEach(edge => {
            const targetDepth = depths[node.id] + 1;
            if (!depths[edge.target.id] || targetDepth < depths[edge.target.id]) {
                depths[edge.target.id] = targetDepth;
                this.bfsDepth(edge.target, depths, visited);
            }
        });
    }

    // Selection and Interaction
    selectNode(nodeId, event) {
        if (event.ctrlKey) {
            if (this.selectedNodes.has(nodeId)) {
                this.selectedNodes.delete(nodeId);
            } else {
                this.selectedNodes.add(nodeId);
            }
        } else {
            this.selectedNodes.clear();
            this.selectedNodes.add(nodeId);
        }

        this.selectedEdges.clear();
        this.updateNodePropertiesPanel();
        this.updateVisualization();
    }

    selectEdge(edgeId, event) {
        if (event.ctrlKey) {
            if (this.selectedEdges.has(edgeId)) {
                this.selectedEdges.delete(edgeId);
            } else {
                this.selectedEdges.add(edgeId);
            }
        } else {
            this.selectedEdges.clear();
            this.selectedEdges.add(edgeId);
        }

        this.selectedNodes.clear();
        this.updateEdgePropertiesPanel();
        this.updateVisualization();
    }

    getSelectedNode() {
        const selectedIds = Array.from(this.selectedNodes);
        return selectedIds.length === 1 ? this.nodes.find(n => n.id === selectedIds[0]) : null;
    }

    getSelectedEdge() {
        const selectedIds = Array.from(this.selectedEdges);
        return selectedIds.length === 1 ? this.edges.find(e => e.id === selectedIds[0]) : null;
    }

    updateNodePropertiesPanel() {
        const selectedNode = this.getSelectedNode();
        if (selectedNode) {
            document.getElementById('nodeLabel').value = selectedNode.label;
            document.getElementById('nodeDescription').value = selectedNode.description || '';
            document.getElementById('nodeColor').value = selectedNode.color;
            document.getElementById('nodeSize').value = selectedNode.size;
            document.getElementById('nodeShape').value = selectedNode.shape;
            document.getElementById('nodeSizeValue').textContent = selectedNode.size;
        }
    }

    updateEdgePropertiesPanel() {
        const selectedEdge = this.getSelectedEdge();
        if (selectedEdge) {
            document.getElementById('edgeLabel').value = selectedEdge.label || '';
            document.getElementById('edgeWeight').value = selectedEdge.weight;
            document.getElementById('edgeColor').value = selectedEdge.color;
            document.getElementById('edgeStyle').value = selectedEdge.style;
            document.getElementById('edgeWeightValue').textContent = selectedEdge.weight;
        }
    }

    // Drag behavior
    dragStarted(event, d) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    dragged(event, d) {
        if (this.settings.snapToGrid) {
            d.fx = Math.round(event.x / 50) * 50;
            d.fy = Math.round(event.y / 50) * 50;
        } else {
            d.fx = event.x;
            d.fy = event.y;
        }
    }

    dragEnded(event, d) {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        this.saveHistory();
    }

    // Zoom and View Controls
    zoomIn() {
        this.svg.transition().duration(this.settings.animationSpeed)
            .call(this.zoom.scaleBy, 1.5);
    }

    zoomOut() {
        this.svg.transition().duration(this.settings.animationSpeed)
            .call(this.zoom.scaleBy, 0.75);
    }

    fitToScreen() {
        const bounds = this.svg.node().getBoundingClientRect();
        const fullWidth = bounds.width;
        const fullHeight = bounds.height;

        const scale = 0.9 / Math.max(
            (d3.max(this.nodes, d => d.x) - d3.min(this.nodes, d => d.x) || 1) / fullWidth,
            (d3.max(this.nodes, d => d.y) - d3.min(this.nodes, d => d.y) || 1) / fullHeight
        );

        const translate = [
            fullWidth / 2 - scale * (d3.mean(this.nodes, d => d.x) || fullWidth / 2),
            fullHeight / 2 - scale * (d3.mean(this.nodes, d => d.y) || fullHeight / 2)
        ];

        this.svg.transition().duration(this.settings.animationSpeed)
            .call(this.zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
    }

    resetView() {
        this.svg.transition().duration(this.settings.animationSpeed)
            .call(this.zoom.transform, d3.zoomIdentity);
    }

    toggleLabels() {
        const labels = this.svg.selectAll('.node-label, .edge-label');
        const currentDisplay = labels.style('display');
        labels.style('display', currentDisplay === 'none' ? 'block' : 'none');
    }

    toggleEdges() {
        const edges = this.svg.selectAll('.edge');
        const currentDisplay = edges.style('display');
        edges.style('display', currentDisplay === 'none' ? 'block' : 'none');
    }

    showStats() {
        this.updateStats();
        this.switchTab('overview');
    }

    // Search and Filter
    searchNodes() {
        const query = document.getElementById('searchInput').value.toLowerCase();
        if (!query) return;

        const matchingNodes = this.nodes.filter(node =>
            node.label.toLowerCase().includes(query) ||
            (node.description && node.description.toLowerCase().includes(query))
        );

        this.selectedNodes.clear();
        matchingNodes.forEach(node => this.selectedNodes.add(node.id));

        this.updateVisualization();
        this.showNotification(`Found ${matchingNodes.length} matching nodes`, 'info');
    }

    applyFilter() {
        const filters = {
            concepts: document.getElementById('filterConcepts').checked,
            entities: document.getElementById('filterEntities').checked,
            attributes: document.getElementById('filterAttributes').checked,
            relations: document.getElementById('filterRelations').checked,
            events: document.getElementById('filterEvents').checked
        };

        const activeFilters = Object.keys(filters).filter(key => filters[key]);

        if (activeFilters.length === 0) {
            this.svg.selectAll('.node').style('opacity', 1);
            return;
        }

        this.svg.selectAll('.node')
            .style('opacity', d => activeFilters.includes(d.type) ? 1 : 0.2);
    }

    // Modal Management
    showNodeModal(node = null) {
        const modal = document.getElementById('nodeModal');
        const form = document.getElementById('nodeForm');

        if (node) {
            document.getElementById('modalNodeLabel').value = node.label;
            document.getElementById('modalNodeType').value = node.type;
            document.getElementById('modalNodeDescription').value = node.description || '';
            document.getElementById('modalNodeX').value = node.x;
            document.getElementById('modalNodeY').value = node.y;
        } else {
            form.reset();
        }

        modal.style.display = 'block';
        this.editingNode = node;
    }

    hideNodeModal() {
        document.getElementById('nodeModal').style.display = 'none';
        this.editingNode = null;
    }

    saveNode() {
        const formData = new FormData(document.getElementById('nodeForm'));
        const nodeData = Object.fromEntries(formData);

        if (this.editingNode) {
            // Update existing node
            Object.assign(this.editingNode, {
                label: nodeData.modalNodeLabel,
                type: nodeData.modalNodeType,
                description: nodeData.modalNodeDescription,
                x: parseFloat(nodeData.modalNodeX),
                y: parseFloat(nodeData.modalNodeY)
            });
        } else {
            // Create new node
            this.addNode(
                parseFloat(nodeData.modalNodeX) || undefined,
                parseFloat(nodeData.modalNodeY) || undefined,
                nodeData.modalNodeType,
                nodeData.modalNodeLabel,
                nodeData.modalNodeDescription
            );
        }

        this.hideNodeModal();
        this.updateVisualization();
        this.saveHistory();
    }

    showEdgeModal(edge = null) {
        const modal = document.getElementById('edgeModal');
        const form = document.getElementById('edgeForm');

        // Populate node selects
        const sourceSelect = document.getElementById('modalEdgeSource');
        const targetSelect = document.getElementById('modalEdgeTarget');

        sourceSelect.innerHTML = '';
        targetSelect.innerHTML = '';

        this.nodes.forEach(node => {
            const option = document.createElement('option');
            option.value = node.id;
            option.textContent = node.label;
            sourceSelect.appendChild(option.cloneNode(true));
            targetSelect.appendChild(option);
        });

        if (edge) {
            document.getElementById('modalEdgeSource').value = edge.source.id;
            document.getElementById('modalEdgeTarget').value = edge.target.id;
            document.getElementById('modalEdgeLabel').value = edge.label || '';
            document.getElementById('modalEdgeType').value = edge.type;
            document.getElementById('modalEdgeWeight').value = edge.weight;
        } else {
            form.reset();
        }

        modal.style.display = 'block';
        this.editingEdge = edge;
    }

    hideEdgeModal() {
        document.getElementById('edgeModal').style.display = 'none';
        this.editingEdge = null;
    }

    saveEdge() {
        const formData = new FormData(document.getElementById('edgeForm'));
        const edgeData = Object.fromEntries(formData);

        const sourceId = parseInt(edgeData.modalEdgeSource);
        const targetId = parseInt(edgeData.modalEdgeTarget);

        if (this.editingEdge) {
            // Update existing edge
            Object.assign(this.editingEdge, {
                source: this.nodes.find(n => n.id === sourceId),
                target: this.nodes.find(n => n.id === targetId),
                label: edgeData.modalEdgeLabel,
                type: edgeData.modalEdgeType,
                weight: parseInt(edgeData.modalEdgeWeight)
            });
        } else {
            // Create new edge
            this.addEdge(
                sourceId,
                targetId,
                edgeData.modalEdgeType,
                edgeData.modalEdgeLabel,
                parseInt(edgeData.modalEdgeWeight)
            );
        }

        this.hideEdgeModal();
        this.updateVisualization();
        this.saveHistory();
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        this.editingNode = null;
        this.editingEdge = null;
    }

    editNode(node) {
        this.showNodeModal(node);
    }

    editEdge(edge) {
        this.showEdgeModal(edge);
    }

    handleContextMenuAction(action) {
        switch (action) {
            case 'add-node':
                const rect = this.svg.node().getBoundingClientRect();
                const coords = d3.pointer(d3.event, this.svg.node());
                this.addNode(coords[0], coords[1]);
                break;
            case 'add-edge':
                this.showEdgeModal();
                break;
            case 'delete':
                this.deleteSelected();
                break;
            case 'duplicate':
                this.duplicateSelected();
                break;
            case 'properties':
                if (this.selectedNodes.size === 1) {
                    this.editNode(this.getSelectedNode());
                } else if (this.selectedEdges.size === 1) {
                    this.editEdge(this.getSelectedEdge());
                }
                break;
        }
    }

    duplicateSelected() {
        const newNodes = [];
        const nodeIdMap = new Map();

        this.selectedNodes.forEach(nodeId => {
            const originalNode = this.nodes.find(n => n.id === nodeId);
            if (originalNode) {
                const newNode = this.addNode(
                    originalNode.x + 50,
                    originalNode.y + 50,
                    originalNode.type,
                    originalNode.label + ' (Copy)',
                    originalNode.description
                );
                nodeIdMap.set(nodeId, newNode.id);
                newNodes.push(newNode);
            }
        });

        // Duplicate edges between selected nodes
        this.edges.forEach(edge => {
            if (this.selectedNodes.has(edge.source.id) && this.selectedNodes.has(edge.target.id)) {
                const newSourceId = nodeIdMap.get(edge.source.id);
                const newTargetId = nodeIdMap.get(edge.target.id);
                if (newSourceId && newTargetId) {
                    this.addEdge(newSourceId, newTargetId, edge.type, edge.label, edge.weight);
                }
            }
        });

        this.selectedNodes.clear();
        newNodes.forEach(node => this.selectedNodes.add(node.id));
        this.updateVisualization();
    }

    // Graph Operations
    newGraph() {
        if (this.nodes.length > 0 && !confirm('Are you sure you want to create a new graph? All current data will be lost.')) {
            return;
        }

        this.nodes = [];
        this.edges = [];
        this.selectedNodes.clear();
        this.selectedEdges.clear();
        this.nodeIdCounter = 1;
        this.edgeIdCounter = 1;
        this.clearHistory();
        this.updateVisualization();
        this.updateUI();
        this.showNotification('New graph created', 'success');
    }

    clearGraph() {
        if (!confirm('Are you sure you want to clear the graph?')) return;

        this.nodes = [];
        this.edges = [];
        this.selectedNodes.clear();
        this.selectedEdges.clear();
        this.nodeIdCounter = 1;
        this.edgeIdCounter = 1;
        this.saveHistory();
        this.updateVisualization();
        this.updateUI();
        this.showNotification('Graph cleared', 'info');
    }

    saveGraph() {
        const graphData = {
            nodes: this.nodes,
            edges: this.edges.map(e => ({
                ...e,
                source: e.source.id,
                target: e.target.id
            })),
            metadata: {
                version: '1.0',
                timestamp: new Date().toISOString(),
                nodeCount: this.nodes.length,
                edgeCount: this.edges.length
            }
        };

        const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `knowledge-graph-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (this.settings.autoSave) {
            this.saveToStorage();
        }

        this.showNotification('Graph saved successfully', 'success');
    }

    loadGraph() {
        document.getElementById('fileInput').click();
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const graphData = JSON.parse(e.target.result);

                if (graphData.nodes && graphData.edges) {
                    this.nodes = graphData.nodes;
                    this.edges = graphData.edges.map(e => ({
                        ...e,
                        source: this.nodes.find(n => n.id === e.source),
                        target: this.nodes.find(n => n.id === e.target)
                    }));

                    // Update counters
                    this.nodeIdCounter = Math.max(...this.nodes.map(n => n.id), 0) + 1;
                    this.edgeIdCounter = Math.max(...this.edges.map(e => e.id), 0) + 1;

                    this.selectedNodes.clear();
                    this.selectedEdges.clear();
                    this.saveHistory();
                    this.updateVisualization();
                    this.updateUI();
                    this.showNotification('Graph loaded successfully', 'success');
                } else {
                    throw new Error('Invalid graph file format');
                }
            } catch (error) {
                console.error('Error loading graph:', error);
                this.showNotification('Error loading graph file', 'error');
            }
        };
        reader.readAsText(file);
    }

    exportGraph() {
        const formats = ['json', 'csv', 'graphml'];
        const format = prompt(`Choose export format (${formats.join(', ')}):`, 'json');

        if (!formats.includes(format)) {
            this.showNotification('Invalid export format', 'error');
            return;
        }

        switch (format) {
            case 'json':
                this.exportAsJSON();
                break;
            case 'csv':
                this.exportAsCSV();
                break;
            case 'graphml':
                this.exportAsGraphML();
                break;
        }
    }

    exportAsJSON() {
        this.saveGraph(); // Reuse the save functionality
    }

    exportAsCSV() {
        let csv = 'Node ID,Label,Type,X,Y,Description\n';
        this.nodes.forEach(node => {
            csv += `${node.id},"${node.label}","${node.type}",${node.x},${node.y},"${node.description || ''}"\n`;
        });

        csv += '\nEdge ID,Source ID,Target ID,Label,Type,Weight\n';
        this.edges.forEach(edge => {
            csv += `${edge.id},${edge.source.id},${edge.target.id},"${edge.label}","${edge.type}",${edge.weight}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `knowledge-graph-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Graph exported as CSV', 'success');
    }

    exportAsGraphML() {
        let graphml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        graphml += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns">\n';
        graphml += '<graph id="G" edgedefault="directed">\n';

        // Add nodes
        this.nodes.forEach(node => {
            graphml += `<node id="n${node.id}">\n`;
            graphml += `<data key="label">${node.label}</data>\n`;
            graphml += `<data key="type">${node.type}</data>\n`;
            graphml += `<data key="x">${node.x}</data>\n`;
            graphml += `<data key="y">${node.y}</data>\n`;
            if (node.description) {
                graphml += `<data key="description">${node.description}</data>\n`;
            }
            graphml += '</node>\n';
        });

        // Add edges
        this.edges.forEach(edge => {
            graphml += `<edge id="e${edge.id}" source="n${edge.source.id}" target="n${edge.target.id}">\n`;
            if (edge.label) {
                graphml += `<data key="label">${edge.label}</data>\n`;
            }
            graphml += `<data key="type">${edge.type}</data>\n`;
            graphml += `<data key="weight">${edge.weight}</data>\n`;
            graphml += '</edge>\n';
        });

        graphml += '</graph>\n</graphml>';

        const blob = new Blob([graphml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `knowledge-graph-${new Date().toISOString().split('T')[0]}.graphml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Graph exported as GraphML', 'success');
    }

    importGraph() {
        this.loadGraph(); // Reuse the load functionality
    }

    // Analysis Methods
    initializeAnalysis() {
        this.initializeCharts();
    }

    initializeCharts() {
        // Initialize Chart.js charts for analysis
        this.charts = {};
    }

    updateStats() {
        document.getElementById('nodeCount').textContent = this.nodes.length;
        document.getElementById('edgeCount').textContent = this.edges.length;
        document.getElementById('graphDensity').textContent = this.calculateDensity().toFixed(3);
        document.getElementById('connectedComponents').textContent = this.calculateConnectedComponents();
    }

    calculateDensity() {
        const n = this.nodes.length;
        if (n < 2) return 0;
        const maxEdges = n * (n - 1) / 2; // For undirected graph
        return this.edges.length / maxEdges;
    }

    calculateConnectedComponents() {
        const visited = new Set();
        let components = 0;

        this.nodes.forEach(node => {
            if (!visited.has(node.id)) {
                this.dfs(node.id, visited);
                components++;
            }
        });

        return components;
    }

    dfs(nodeId, visited) {
        visited.add(nodeId);
        this.edges.forEach(edge => {
            if (edge.source.id === nodeId && !visited.has(edge.target.id)) {
                this.dfs(edge.target.id, visited);
            }
            if (edge.target.id === nodeId && !visited.has(edge.source.id)) {
                this.dfs(edge.source.id, visited);
            }
        });
    }

    calculateCentrality() {
        const algorithm = document.getElementById('centralityAlgorithm').value;
        let centralityScores = {};

        switch (algorithm) {
            case 'degree':
                centralityScores = this.calculateDegreeCentrality();
                break;
            case 'betweenness':
                centralityScores = this.calculateBetweennessCentrality();
                break;
            case 'closeness':
                centralityScores = this.calculateClosenessCentrality();
                break;
            case 'eigenvector':
                centralityScores = this.calculateEigenvectorCentrality();
                break;
        }

        this.displayCentralityResults(centralityScores);
        this.showNotification(`Calculated ${algorithm} centrality`, 'success');
    }

    calculateDegreeCentrality() {
        const centrality = {};
        this.nodes.forEach(node => {
            centrality[node.id] = this.edges.filter(e =>
                e.source.id === node.id || e.target.id === node.id
            ).length;
        });
        return centrality;
    }

    calculateBetweennessCentrality() {
        // Simplified betweenness centrality calculation
        const centrality = {};
        this.nodes.forEach(node => centrality[node.id] = 0);

        this.nodes.forEach(source => {
            const distances = this.dijkstra(source.id);
            this.nodes.forEach(target => {
                if (source.id !== target.id && distances[target.id] < Infinity) {
                    // Count shortest paths through each node
                    // This is a simplified version
                    this.nodes.forEach(intermediate => {
                        if (intermediate.id !== source.id && intermediate.id !== target.id) {
                            centrality[intermediate.id] += 0.1; // Simplified increment
                        }
                    });
                }
            });
        });

        return centrality;
    }

    calculateClosenessCentrality() {
        const centrality = {};
        this.nodes.forEach(node => {
            const distances = this.dijkstra(node.id);
            const reachableNodes = Object.values(distances).filter(d => d < Infinity);
            const totalDistance = reachableNodes.reduce((sum, d) => sum + d, 0);
            centrality[node.id] = reachableNodes.length > 0 ? reachableNodes.length / totalDistance : 0;
        });
        return centrality;
    }

    calculateEigenvectorCentrality() {
        // Simplified eigenvector centrality using power iteration
        const centrality = {};
        const maxIterations = 100;
        const tolerance = 1e-6;

        // Initialize
        this.nodes.forEach(node => centrality[node.id] = 1);

        for (let iter = 0; iter < maxIterations; iter++) {
            const newCentrality = {};

            this.nodes.forEach(node => {
                let sum = 0;
                this.edges.forEach(edge => {
                    if (edge.target.id === node.id) {
                        sum += centrality[edge.source.id];
                    }
                    if (edge.source.id === node.id) {
                        sum += centrality[edge.target.id];
                    }
                });
                newCentrality[node.id] = sum;
            });

            // Normalize
            const norm = Math.sqrt(Object.values(newCentrality).reduce((sum, val) => sum + val * val, 0));
            if (norm > 0) {
                Object.keys(newCentrality).forEach(id => newCentrality[id] /= norm);
            }

            // Check convergence
            let converged = true;
            this.nodes.forEach(node => {
                if (Math.abs(newCentrality[node.id] - centrality[node.id]) > tolerance) {
                    converged = false;
                }
            });

            Object.assign(centrality, newCentrality);
            if (converged) break;
        }

        return centrality;
    }

    dijkstra(startId) {
        const distances = {};
        const visited = new Set();
        const queue = new PriorityQueue();

        this.nodes.forEach(node => {
            distances[node.id] = node.id === startId ? 0 : Infinity;
        });

        queue.enqueue(startId, 0);

        while (!queue.isEmpty()) {
            const currentId = queue.dequeue();
            if (visited.has(currentId)) continue;
            visited.add(currentId);

            this.edges.forEach(edge => {
                let neighborId;
                let weight = edge.weight;

                if (edge.source.id === currentId) {
                    neighborId = edge.target.id;
                } else if (edge.target.id === currentId) {
                    neighborId = edge.source.id;
                } else {
                    return;
                }

                if (!visited.has(neighborId)) {
                    const newDistance = distances[currentId] + weight;
                    if (newDistance < distances[neighborId]) {
                        distances[neighborId] = newDistance;
                        queue.enqueue(neighborId, newDistance);
                    }
                }
            });
        }

        return distances;
    }

    displayCentralityResults(scores) {
        const list = document.getElementById('centralityList');
        list.innerHTML = '';

        const sortedNodes = Object.entries(scores)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        sortedNodes.forEach(([nodeId, score]) => {
            const node = this.nodes.find(n => n.id === parseInt(nodeId));
            const item = document.createElement('div');
            item.className = 'centrality-item';
            item.innerHTML = `
                <span class="node-label">${node.label}</span>
                <span class="score">${score.toFixed(3)}</span>
            `;
            list.appendChild(item);
        });
    }

    detectCommunities() {
        const algorithm = document.getElementById('communityAlgorithm').value;
        let communities = {};

        switch (algorithm) {
            case 'louvain':
                communities = this.louvainMethod();
                break;
            case 'girvan-newman':
                communities = this.girvanNewmanMethod();
                break;
            case 'label-propagation':
                communities = this.labelPropagationMethod();
                break;
        }

        this.displayCommunityResults(communities);
        this.showNotification(`Detected communities using ${algorithm}`, 'success');
    }

    louvainMethod() {
        // Simplified Louvain method implementation
        const communities = {};
        let communityId = 0;

        // Start with each node in its own community
        this.nodes.forEach(node => {
            communities[node.id] = communityId++;
        });

        // Simplified optimization (in real implementation, this would be more complex)
        for (let pass = 0; pass < 10; pass++) {
            let changed = false;
            this.nodes.forEach(node => {
                const neighbors = this.getNeighbors(node.id);
                const neighborCommunities = [...new Set(neighbors.map(n => communities[n]))];

                let bestCommunity = communities[node.id];
                let bestModularity = this.calculateModularity(communities);

                neighborCommunities.forEach(comm => {
                    const testCommunities = { ...communities };
                    testCommunities[node.id] = comm;
                    const modularity = this.calculateModularity(testCommunities);
                    if (modularity > bestModularity) {
                        bestModularity = modularity;
                        bestCommunity = comm;
                        changed = true;
                    }
                });

                communities[node.id] = bestCommunity;
            });
            if (!changed) break;
        }

        return communities;
    }

    girvanNewmanMethod() {
        // Simplified Girvan-Newman method
        const communities = {};
        let edges = [...this.edges];

        // Remove edges with highest betweenness
        while (edges.length > 0 && this.calculateConnectedComponents() === 1) {
            const betweenness = this.calculateEdgeBetweenness(edges);
            const maxBetweenness = Math.max(...Object.values(betweenness));
            const edgesToRemove = Object.keys(betweenness)
                .filter(edgeId => betweenness[edgeId] === maxBetweenness);

            edgesToRemove.forEach(edgeId => {
                const index = edges.findIndex(e => e.id === parseInt(edgeId));
                if (index !== -1) edges.splice(index, 1);
            });
        }

        // Assign communities based on connected components
        const visited = new Set();
        let communityId = 0;

        this.nodes.forEach(node => {
            if (!visited.has(node.id)) {
                const component = this.getConnectedComponent(node.id, edges);
                component.forEach(nodeId => {
                    communities[nodeId] = communityId;
                    visited.add(nodeId);
                });
                communityId++;
            }
        });

        return communities;
    }

    labelPropagationMethod() {
        // Simplified label propagation
        const communities = {};

        // Initialize with unique labels
        this.nodes.forEach((node, index) => {
            communities[node.id] = index;
        });

        for (let iteration = 0; iteration < 20; iteration++) {
            const newCommunities = { ...communities };
            let changed = false;

            this.nodes.forEach(node => {
                const neighbors = this.getNeighbors(node.id);
                if (neighbors.length === 0) return;

                const neighborLabels = neighbors.map(n => communities[n]);
                const labelCounts = {};
                neighborLabels.forEach(label => {
                    labelCounts[label] = (labelCounts[label] || 0) + 1;
                });

                const maxCount = Math.max(...Object.values(labelCounts));
                const candidateLabels = Object.keys(labelCounts)
                    .filter(label => labelCounts[label] === maxCount);

                const newLabel = candidateLabels[Math.floor(Math.random() * candidateLabels.length)];
                if (newLabel !== communities[node.id]) {
                    newCommunities[node.id] = parseInt(newLabel);
                    changed = true;
                }
            });

            Object.assign(communities, newCommunities);
            if (!changed) break;
        }

        return communities;
    }

    getNeighbors(nodeId) {
        const neighbors = [];
        this.edges.forEach(edge => {
            if (edge.source.id === nodeId) neighbors.push(edge.target.id);
            if (edge.target.id === nodeId) neighbors.push(edge.source.id);
        });
        return [...new Set(neighbors)];
    }

    calculateModularity(communities) {
        // Simplified modularity calculation
        let modularity = 0;
        const m = this.edges.length;
        const degrees = {};

        this.nodes.forEach(node => {
            degrees[node.id] = this.edges.filter(e =>
                e.source.id === node.id || e.target.id === node.id
            ).length;
        });

        const communityEdges = {};
        this.edges.forEach(edge => {
            const comm1 = communities[edge.source.id];
            const comm2 = communities[edge.target.id];
            const key = Math.min(comm1, comm2) + '-' + Math.max(comm1, comm2);
            communityEdges[key] = (communityEdges[key] || 0) + 1;
        });

        Object.values(communityEdges).forEach(edgesInCommunity => {
            const expectedEdges = (edgesInCommunity * edgesInCommunity) / (2 * m);
            modularity += edgesInCommunity / (2 * m) - expectedEdges / (2 * m);
        });

        return modularity;
    }

    calculateEdgeBetweenness(edges) {
        const betweenness = {};
        edges.forEach(edge => betweenness[edge.id] = 0);

        this.nodes.forEach(source => {
            const distances = this.dijkstra(source.id);
            const paths = this.getAllShortestPaths(source.id, distances);

            this.nodes.forEach(target => {
                if (source.id !== target.id && distances[target.id] < Infinity) {
                    const pathCount = paths[target.id] || 1;
                    // Distribute betweenness among edges in paths
                    // This is simplified - real implementation would track edge usage
                    edges.forEach(edge => {
                        if ((edge.source.id === source.id && edge.target.id === target.id) ||
                            (edge.target.id === source.id && edge.source.id === target.id)) {
                            betweenness[edge.id] += 1 / pathCount;
                        }
                    });
                }
            });
        });

        return betweenness;
    }

    getAllShortestPaths(startId, distances) {
        // Simplified path counting
        const paths = {};
        this.nodes.forEach(node => {
            paths[node.id] = 1; // Simplified
        });
        return paths;
    }

    getConnectedComponent(startId, edges) {
        const visited = new Set();
        const component = [];

        const dfs = (nodeId) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);
            component.push(nodeId);

            edges.forEach(edge => {
                if (edge.source.id === nodeId && !visited.has(edge.target.id)) {
                    dfs(edge.target.id);
                }
                if (edge.target.id === nodeId && !visited.has(edge.source.id)) {
                    dfs(edge.source.id);
                }
            });
        };

        dfs(startId);
        return component;
    }

    displayCommunityResults(communities) {
        const list = document.getElementById('communityList');
        list.innerHTML = '';

        const communityGroups = {};
        Object.entries(communities).forEach(([nodeId, communityId]) => {
            if (!communityGroups[communityId]) communityGroups[communityId] = [];
            communityGroups[communityId].push(parseInt(nodeId));
        });

        Object.entries(communityGroups).forEach(([communityId, nodeIds]) => {
            const item = document.createElement('div');
            item.className = 'community-item';
            const nodeLabels = nodeIds.map(id => this.nodes.find(n => n.id === id).label);
            item.innerHTML = `
                <h4>Community ${communityId}</h4>
                <p>${nodeLabels.join(', ')}</p>
            `;
            list.appendChild(item);
        });
    }

    findPath() {
        const sourceId = parseInt(document.getElementById('sourceNode').value);
        const targetId = parseInt(document.getElementById('targetNode').value);
        const algorithm = document.getElementById('pathAlgorithm').value;

        if (!sourceId || !targetId) {
            this.showNotification('Please select source and target nodes', 'warning');
            return;
        }

        let path = [];
        switch (algorithm) {
            case 'dijkstra':
                path = this.findShortestPath(sourceId, targetId);
                break;
            case 'bellman-ford':
                path = this.bellmanFord(sourceId, targetId);
                break;
            case 'floyd-warshall':
                path = this.floydWarshall(sourceId, targetId);
                break;
        }

        this.displayPathResults(path);
        this.showNotification(`Found path using ${algorithm}`, 'success');
    }

    findShortestPath(sourceId, targetId) {
        const distances = this.dijkstra(sourceId);
        if (distances[targetId] === Infinity) return [];

        // Reconstruct path (simplified)
        const path = [targetId];
        let current = targetId;

        while (current !== sourceId) {
            let found = false;
            for (const edge of this.edges) {
                let neighbor;
                if (edge.source.id === current) neighbor = edge.target.id;
                else if (edge.target.id === current) neighbor = edge.source.id;
                else continue;

                if (distances[neighbor] + edge.weight === distances[current]) {
                    path.unshift(neighbor);
                    current = neighbor;
                    found = true;
                    break;
                }
            }
            if (!found) break;
        }

        return path;
    }

    bellmanFord(sourceId, targetId) {
        // Simplified Bellman-Ford implementation
        const distances = {};
        const predecessors = {};

        this.nodes.forEach(node => {
            distances[node.id] = node.id === sourceId ? 0 : Infinity;
            predecessors[node.id] = null;
        });

        for (let i = 0; i < this.nodes.length - 1; i++) {
            this.edges.forEach(edge => {
                const u = edge.source.id;
                const v = edge.target.id;
                const w = edge.weight;

                if (distances[u] + w < distances[v]) {
                    distances[v] = distances[u] + w;
                    predecessors[v] = u;
                }
                // For undirected graph, also check reverse
                if (distances[v] + w < distances[u]) {
                    distances[u] = distances[v] + w;
                    predecessors[u] = v;
                }
            });
        }

        // Reconstruct path
        const path = [];
        let current = targetId;
        while (current !== null) {
            path.unshift(current);
            current = predecessors[current];
            if (path.length > this.nodes.length) break; // Prevent infinite loop
        }

        return path[0] === sourceId ? path : [];
    }

    floydWarshall(sourceId, targetId) {
        // Simplified Floyd-Warshall for single path
        const dist = {};
        const next = {};

        this.nodes.forEach(a => {
            this.nodes.forEach(b => {
                dist[`${a.id}-${b.id}`] = a.id === b.id ? 0 : Infinity;
                next[`${a.id}-${b.id}`] = null;
            });
        });

        this.edges.forEach(edge => {
            dist[`${edge.source.id}-${edge.target.id}`] = edge.weight;
            next[`${edge.source.id}-${edge.target.id}`] = edge.target.id;
            // For undirected graph
            dist[`${edge.target.id}-${edge.source.id}`] = edge.weight;
            next[`${edge.target.id}-${edge.source.id}`] = edge.source.id;
        });

        this.nodes.forEach(k => {
            this.nodes.forEach(i => {
                this.nodes.forEach(j => {
                    const ik = dist[`${i.id}-${k.id}`];
                    const kj = dist[`${k.id}-${j.id}`];
                    const ij = dist[`${i.id}-${j.id}`];
                    if (ik + kj < ij) {
                        dist[`${i.id}-${j.id}`] = ik + kj;
                        next[`${i.id}-${j.id}`] = next[`${i.id}-${k.id}`];
                    }
                });
            });
        });

        // Reconstruct path
        const path = [];
        let current = sourceId;
        while (current !== targetId) {
            if (current === null) return [];
            path.push(current);
            current = next[`${current}-${targetId}`];
        }
        path.push(targetId);

        return path;
    }

    displayPathResults(path) {
        const visualization = document.getElementById('pathVisualization');
        const details = document.getElementById('pathDetails');

        if (path.length === 0) {
            visualization.innerHTML = '<p>No path found</p>';
            details.innerHTML = '';
            return;
        }

        // Highlight path in visualization
        this.svg.selectAll('.edge').classed('path-edge', false);
        for (let i = 0; i < path.length - 1; i++) {
            const sourceId = path[i];
            const targetId = path[i + 1];
            const edge = this.edges.find(e =>
                (e.source.id === sourceId && e.target.id === targetId) ||
                (e.source.id === targetId && e.target.id === sourceId)
            );
            if (edge) {
                this.svg.select(`#edge-${edge.id}`).classed('path-edge', true);
            }
        }

        // Show path details
        const pathNodes = path.map(id => this.nodes.find(n => n.id === id));
        details.innerHTML = `
            <h4>Path Details</h4>
            <p><strong>Length:</strong> ${path.length - 1} edges</p>
            <p><strong>Nodes:</strong> ${pathNodes.map(n => n.label).join(' → ')}</p>
        `;
    }

    // History Management
    saveHistory() {
        const state = {
            nodes: JSON.parse(JSON.stringify(this.nodes)),
            edges: this.edges.map(e => ({
                ...e,
                source: e.source.id,
                target: e.target.id
            })),
            timestamp: new Date().toISOString()
        };

        // Remove future history if we're not at the end
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(state);
        this.historyIndex = this.history.length - 1;

        // Limit history size
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }

        this.updateHistoryUI();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.loadHistoryState(this.history[this.historyIndex]);
            this.showNotification('Undid last action', 'info');
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.loadHistoryState(this.history[this.historyIndex]);
            this.showNotification('Redid last action', 'info');
        }
    }

    loadHistoryState(state) {
        this.nodes = state.nodes;
        this.edges = state.edges.map(e => ({
            ...e,
            source: this.nodes.find(n => n.id === e.source),
            target: this.nodes.find(n => n.id === e.target)
        }));

        this.selectedNodes.clear();
        this.selectedEdges.clear();
        this.updateVisualization();
        this.updateUI();
    }

    clearHistory() {
        this.history = [];
        this.historyIndex = -1;
        this.saveHistory();
        this.updateHistoryUI();
        this.showNotification('History cleared', 'info');
    }

    updateHistoryUI() {
        const list = document.getElementById('historyList');
        list.innerHTML = '';

        this.history.slice(-10).forEach((state, index) => {
            const item = document.createElement('div');
            item.className = 'history-item';
            const actualIndex = this.history.length - 10 + index;
            const isCurrent = actualIndex === this.historyIndex;
            item.innerHTML = `
                <span class="timestamp">${new Date(state.timestamp).toLocaleTimeString()}</span>
                <span class="state">${state.nodes.length} nodes, ${state.edges.length} edges</span>
                ${isCurrent ? '<span class="current">Current</span>' : ''}
            `;
            list.appendChild(item);
        });
    }

    // Collaboration Features
    shareGraph() {
        const shareId = this.generateShareId();
        const shareData = {
            id: shareId,
            graph: {
                nodes: this.nodes,
                edges: this.edges.map(e => ({
                    ...e,
                    source: e.source.id,
                    target: e.target.id
                }))
            },
            timestamp: new Date().toISOString()
        };

        // Store in localStorage for demo (in real app, this would be server-side)
        localStorage.setItem(`shared-graph-${shareId}`, JSON.stringify(shareData));

        // Show share dialog
        const shareUrl = `${window.location.origin}${window.location.pathname}?share=${shareId}`;
        prompt('Share this URL:', shareUrl);

        this.showNotification('Graph shared successfully', 'success');
    }

    startCollaboration() {
        if (this.collaboration.active) {
            this.stopCollaboration();
            return;
        }

        this.collaboration.active = true;
        this.collaboration.sessionId = this.generateShareId();
        this.collaboration.users = 1;

        // Start polling for updates (in real app, this would use WebSockets)
        this.collaborationInterval = setInterval(() => {
            this.checkForUpdates();
        }, 2000);

        document.getElementById('collaborateBtn').textContent = 'Stop Collaboration';
        document.getElementById('collaborationLog').textContent += '[System] Collaboration started\n';
        this.updateCollaborationUI();
        this.showNotification('Collaboration started', 'success');
    }

    stopCollaboration() {
        this.collaboration.active = false;
        clearInterval(this.collaborationInterval);
        document.getElementById('collaborateBtn').textContent = 'Start Collaboration';
        document.getElementById('collaborationLog').textContent += '[System] Collaboration stopped\n';
        this.updateCollaborationUI();
        this.showNotification('Collaboration stopped', 'info');
    }

    checkForUpdates() {
        // In a real implementation, this would check for updates from other users
        // For demo purposes, we'll just update the user count occasionally
        if (Math.random() < 0.1) {
            this.collaboration.users = Math.max(1, this.collaboration.users + (Math.random() > 0.5 ? 1 : -1));
            this.updateCollaborationUI();
        }
    }

    updateCollaborationUI() {
        document.getElementById('activeUsers').textContent = `Active Users: ${this.collaboration.users}`;
    }

    exportSession() {
        const sessionData = {
            graph: {
                nodes: this.nodes,
                edges: this.edges.map(e => ({
                    ...e,
                    source: e.source.id,
                    target: e.target.id
                }))
            },
            collaboration: this.collaboration,
            history: this.history,
            settings: this.settings,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `knowledge-graph-session-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Session exported successfully', 'success');
    }

    generateShareId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // Storage Management
    saveToStorage() {
        try {
            const data = {
                nodes: this.nodes,
                edges: this.edges.map(e => ({
                    ...e,
                    source: e.source.id,
                    target: e.target.id
                })),
                settings: this.settings,
                history: this.history,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem('knowledgeGraphData', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    loadFromStorage() {
        try {
            const data = JSON.parse(localStorage.getItem('knowledgeGraphData'));
            if (data) {
                this.nodes = data.nodes || [];
                this.edges = (data.edges || []).map(e => ({
                    ...e,
                    source: this.nodes.find(n => n.id === e.source),
                    target: this.nodes.find(n => n.id === e.target)
                }));
                this.settings = { ...this.settings, ...data.settings };
                this.history = data.history || [];
                this.historyIndex = this.history.length - 1;

                // Update counters
                this.nodeIdCounter = Math.max(...this.nodes.map(n => n.id), 0) + 1;
                this.edgeIdCounter = Math.max(...this.edges.map(e => e.id), 0) + 1;
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
    }

    saveSettings() {
        localStorage.setItem('knowledgeGraphSettings', JSON.stringify(this.settings));
    }

    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('knowledgeGraphSettings'));
            if (settings) {
                this.settings = { ...this.settings, ...settings };
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    // UI Updates
    updateUI() {
        this.updateStats();
        this.updateNodeSelects();
        this.updateSettingsUI();
        this.updateHistoryUI();
    }

    updateNodeSelects() {
        const sourceSelect = document.getElementById('sourceNode');
        const targetSelect = document.getElementById('targetNode');
        const modalSourceSelect = document.getElementById('modalEdgeSource');
        const modalTargetSelect = document.getElementById('modalEdgeTarget');

        [sourceSelect, targetSelect, modalSourceSelect, modalTargetSelect].forEach(select => {
            if (select) {
                select.innerHTML = '';
                this.nodes.forEach(node => {
                    const option = document.createElement('option');
                    option.value = node.id;
                    option.textContent = node.label;
                    select.appendChild(option);
                });
            }
        });
    }

    updateSettingsUI() {
        Object.keys(this.settings).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.settings[key];
                } else {
                    element.value = this.settings[key];
                }
                // Update display values
                const display = document.getElementById(`${key}Value`);
                if (display) {
                    display.textContent = key === 'animationSpeed' ? `${this.settings[key]}ms` :
                                        key === 'nodeSpacing' ? `${this.settings[key]}px` :
                                        key === 'edgeThickness' ? `${this.settings[key]}px` :
                                        this.settings[key];
                }
            }
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }

    // Utility Methods
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Priority Queue for Dijkstra's algorithm
    PriorityQueue() {
        this.items = [];

        this.enqueue = function(element, priority) {
            const queueElement = { element, priority };
            let added = false;

            for (let i = 0; i < this.items.length; i++) {
                if (queueElement.priority < this.items[i].priority) {
                    this.items.splice(i, 0, queueElement);
                    added = true;
                    break;
                }
            }

            if (!added) {
                this.items.push(queueElement);
            }
        };

        this.dequeue = function() {
            return this.items.shift().element;
        };

        this.isEmpty = function() {
            return this.items.length === 0;
        };
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.knowledgeGraphVisualizer = new KnowledgeGraphVisualizer();
});

// Handle URL parameters for shared graphs
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share');

    if (shareId) {
        const sharedData = localStorage.getItem(`shared-graph-${shareId}`);
        if (sharedData) {
            try {
                const data = JSON.parse(sharedData);
                // Load shared graph
                window.knowledgeGraphVisualizer.nodes = data.graph.nodes;
                window.knowledgeGraphVisualizer.edges = data.graph.edges.map(e => ({
                    ...e,
                    source: data.graph.nodes.find(n => n.id === e.source),
                    target: data.graph.nodes.find(n => n.id === e.target)
                }));
                window.knowledgeGraphVisualizer.updateVisualization();
                window.knowledgeGraphVisualizer.updateUI();
                window.knowledgeGraphVisualizer.showNotification('Shared graph loaded', 'success');
            } catch (error) {
                console.error('Error loading shared graph:', error);
                window.knowledgeGraphVisualizer.showNotification('Error loading shared graph', 'error');
            }
        }
    }
});