// Semantic Relationship Mapping Console Script

// Global variables
let nodes = [];
let relations = [];
let selectedNodes = [];
let selectedRelations = [];
let canvas, ctx;
let offsetX = 0, offsetY = 0;
let scale = 1;
let isDragging = false;
let dragNode = null;
let lastMouseX, lastMouseY;
let settings = {
    layout: 'force',
    nodeSize: 20,
    relationWidth: 2,
    showLabels: true,
    autoLayout: true
};

// DOM elements
const graphBtn = document.getElementById('graphBtn');
const listBtn = document.getElementById('listBtn');
const settingsBtn = document.getElementById('settingsBtn');
const analyticsBtn = document.getElementById('analyticsBtn');
const helpBtn = document.getElementById('helpBtn');
const addNodeBtn = document.getElementById('addNodeBtn');
const addRelationBtn = document.getElementById('addRelationBtn');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const fitBtn = document.getElementById('fitBtn');
const centerBtn = document.getElementById('centerBtn');
const settingsForm = document.getElementById('settingsForm');
const nodeModal = document.getElementById('nodeModal');
const relationModal = document.getElementById('relationModal');
const nodeForm = document.getElementById('nodeForm');
const relationForm = document.getElementById('relationForm');
const sections = document.querySelectorAll('section');

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupCanvas();
    setupEventListeners();
    loadSettings();
    updateDisplay();
    log('Console initialized');
}

// Canvas setup
function setupCanvas() {
    canvas = document.getElementById('graphCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    draw();
}

// Event listeners
function setupEventListeners() {
    // Navigation
    graphBtn.addEventListener('click', () => showSection('graph'));
    listBtn.addEventListener('click', () => showSection('list'));
    settingsBtn.addEventListener('click', () => showSection('settings'));
    analyticsBtn.addEventListener('click', () => showSection('analytics'));
    helpBtn.addEventListener('click', () => showSection('help'));

    // Controls
    addNodeBtn.addEventListener('click', () => nodeModal.style.display = 'block');
    addRelationBtn.addEventListener('click', addRelation);
    clearBtn.addEventListener('click', clearAll);
    exportBtn.addEventListener('click', exportData);

    // Graph controls
    zoomInBtn.addEventListener('click', () => zoom(1.2));
    zoomOutBtn.addEventListener('click', () => zoom(0.8));
    fitBtn.addEventListener('click', fitToScreen);
    centerBtn.addEventListener('click', centerGraph);

    // Forms
    settingsForm.addEventListener('submit', saveSettings);
    nodeForm.addEventListener('submit', handleAddNode);
    relationForm.addEventListener('submit', handleAddRelation);

    // Modals
    document.querySelectorAll('.close').forEach(close => {
        close.addEventListener('click', () => {
            nodeModal.style.display = 'none';
            relationModal.style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === nodeModal) nodeModal.style.display = 'none';
        if (e.target === relationModal) relationModal.style.display = 'none';
    });

    // Canvas events
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyDown);

    // Settings sliders
    document.getElementById('nodeSize').addEventListener('input', updateSliderValue);
    document.getElementById('relationWidth').addEventListener('input', updateSliderValue);
}

// Navigation
function showSection(sectionId) {
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`#${sectionId}Btn`).classList.add('active');
}

// Node and relation management
function addNode(label, type, description) {
    const node = {
        id: Date.now(),
        label,
        type,
        description,
        x: Math.random() * (canvas.width - 100) + 50,
        y: Math.random() * (canvas.height - 100) + 50,
        vx: 0,
        vy: 0,
        selected: false
    };
    nodes.push(node);
    updateDisplay();
    log(`Added node: ${label}`);
    return node;
}

function addRelation(sourceId, targetId, type, weight) {
    if (sourceId === targetId) {
        alert('Cannot create relation to self');
        return;
    }
    
    const existing = relations.find(r => 
        (r.source === sourceId && r.target === targetId) ||
        (r.source === targetId && r.target === sourceId)
    );
    
    if (existing) {
        alert('Relation already exists');
        return;
    }
    
    const relation = {
        id: Date.now(),
        source: sourceId,
        target: targetId,
        type,
        weight: parseFloat(weight),
        selected: false
    };
    relations.push(relation);
    updateDisplay();
    log(`Added relation: ${type} between ${getNodeLabel(sourceId)} and ${getNodeLabel(targetId)}`);
}

function removeNode(nodeId) {
    nodes = nodes.filter(n => n.id !== nodeId);
    relations = relations.filter(r => r.source !== nodeId && r.target !== nodeId);
    updateDisplay();
    log(`Removed node: ${getNodeLabel(nodeId)}`);
}

function removeRelation(relationId) {
    relations = relations.filter(r => r.id !== relationId);
    updateDisplay();
    log('Removed relation');
}

function clearAll() {
    if (confirm('Are you sure you want to clear all nodes and relations?')) {
        nodes = [];
        relations = [];
        updateDisplay();
        log('Cleared all data');
    }
}

// Form handlers
function handleAddNode(e) {
    e.preventDefault();
    const label = document.getElementById('nodeLabel').value;
    const type = document.getElementById('nodeType').value;
    const description = document.getElementById('nodeDescription').value;
    
    addNode(label, type, description);
    nodeForm.reset();
    nodeModal.style.display = 'none';
}

function handleAddRelation(e) {
    e.preventDefault();
    if (selectedNodes.length !== 2) {
        alert('Please select exactly 2 nodes');
        return;
    }
    
    const sourceId = selectedNodes[0];
    const targetId = selectedNodes[1];
    const type = document.getElementById('relationType').value;
    const weight = document.getElementById('relationWeight').value;
    
    addRelation(sourceId, targetId, type, weight);
    relationForm.reset();
    relationModal.style.display = 'none';
    selectedNodes = [];
}

// Settings
function saveSettings(e) {
    e.preventDefault();
    settings.layout = document.getElementById('layout').value;
    settings.nodeSize = parseInt(document.getElementById('nodeSize').value);
    settings.relationWidth = parseInt(document.getElementById('relationWidth').value);
    settings.showLabels = document.getElementById('showLabels').checked;
    settings.autoLayout = document.getElementById('autoLayout').checked;
    
    localStorage.setItem('mappingSettings', JSON.stringify(settings));
    updateDisplay();
    log('Settings saved');
    showSection('graph');
}

function loadSettings() {
    const saved = localStorage.getItem('mappingSettings');
    if (saved) {
        settings = { ...settings, ...JSON.parse(saved) };
        updateSettingsForm();
    }
}

function updateSettingsForm() {
    document.getElementById('layout').value = settings.layout;
    document.getElementById('nodeSize').value = settings.nodeSize;
    document.getElementById('relationWidth').value = settings.relationWidth;
    document.getElementById('showLabels').checked = settings.showLabels;
    document.getElementById('autoLayout').checked = settings.autoLayout;
    updateSliderValue();
}

function updateSliderValue() {
    document.getElementById('nodeSizeValue').textContent = document.getElementById('nodeSize').value;
    document.getElementById('relationWidthValue').textContent = document.getElementById('relationWidth').value;
}

// Canvas interaction
function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offsetX) / scale;
    const y = (e.clientY - rect.top - offsetY) / scale;
    
    // Check if clicking on node
    for (let node of nodes) {
        const dx = x - node.x;
        const dy = y - node.y;
        if (dx * dx + dy * dy < settings.nodeSize * settings.nodeSize) {
            dragNode = node;
            isDragging = true;
            node.selected = !node.selected;
            if (node.selected) {
                selectedNodes.push(node.id);
            } else {
                selectedNodes = selectedNodes.filter(id => id !== node.id);
            }
            updateNodeInfo(node);
            draw();
            return;
        }
    }
    
    // Start panning
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
}

function handleMouseMove(e) {
    if (!isDragging) return;
    
    if (dragNode) {
        const rect = canvas.getBoundingClientRect();
        dragNode.x = (e.clientX - rect.left - offsetX) / scale;
        dragNode.y = (e.clientY - rect.top - offsetY) / scale;
        draw();
    } else {
        // Panning
        offsetX += e.clientX - lastMouseX;
        offsetY += e.clientY - lastMouseY;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        draw();
    }
}

function handleMouseUp() {
    isDragging = false;
    dragNode = null;
}

function handleWheel(e) {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    zoom(zoomFactor, e.clientX, e.clientY);
}

function zoom(factor, centerX, centerY) {
    const rect = canvas.getBoundingClientRect();
    centerX = centerX || rect.left + rect.width / 2;
    centerY = centerY || rect.top + rect.height / 2;
    
    const mouseX = (centerX - rect.left - offsetX) / scale;
    const mouseY = (centerY - rect.top - offsetY) / scale;
    
    scale *= factor;
    scale = Math.max(0.1, Math.min(5, scale));
    
    offsetX = centerX - rect.left - mouseX * scale;
    offsetY = centerY - rect.top - mouseY * scale;
    
    draw();
}

function fitToScreen() {
    if (nodes.length === 0) return;
    
    const minX = Math.min(...nodes.map(n => n.x));
    const maxX = Math.max(...nodes.map(n => n.x));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxY = Math.max(...nodes.map(n => n.y));
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const size = Math.max(maxX - minX, maxY - minY) + 100;
    
    scale = Math.min(canvas.width / size, canvas.height / size);
    offsetX = canvas.width / 2 - centerX * scale;
    offsetY = canvas.height / 2 - centerY * scale;
    
    draw();
}

function centerGraph() {
    offsetX = 0;
    offsetY = 0;
    scale = 1;
    draw();
}

// Drawing
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    
    // Draw relations
    relations.forEach(relation => drawRelation(relation));
    
    // Draw nodes
    nodes.forEach(node => drawNode(node));
    
    ctx.restore();
}

function drawNode(node) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, settings.nodeSize, 0, 2 * Math.PI);
    
    // Node color based on type
    const colors = {
        concept: '#667eea',
        entity: '#764ba2',
        attribute: '#f093fb',
        event: '#f5576c'
    };
    
    ctx.fillStyle = node.selected ? '#ff6b6b' : colors[node.type] || '#667eea';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Label
    if (settings.showLabels) {
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + settings.nodeSize + 15);
    }
}

function drawRelation(relation) {
    const source = nodes.find(n => n.id === relation.source);
    const target = nodes.find(n => n.id === relation.target);
    
    if (!source || !target) return;
    
    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(target.x, target.y);
    ctx.strokeStyle = relation.selected ? '#ff6b6b' : '#999';
    ctx.lineWidth = settings.relationWidth;
    ctx.stroke();
    
    // Arrow head
    const angle = Math.atan2(target.y - source.y, target.x - source.x);
    const arrowLength = 10;
    ctx.beginPath();
    ctx.moveTo(target.x, target.y);
    ctx.lineTo(
        target.x - arrowLength * Math.cos(angle - Math.PI / 6),
        target.y - arrowLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(target.x, target.y);
    ctx.lineTo(
        target.x - arrowLength * Math.cos(angle + Math.PI / 6),
        target.y - arrowLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
    
    // Label
    if (settings.showLabels) {
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(relation.type, midX, midY - 5);
    }
}

// Layout algorithms
function applyLayout() {
    if (!settings.autoLayout) return;
    
    switch (settings.layout) {
        case 'force':
            forceDirectedLayout();
            break;
        case 'circular':
            circularLayout();
            break;
        case 'hierarchical':
            hierarchicalLayout();
            break;
        case 'random':
            randomLayout();
            break;
    }
    
    draw();
}

function forceDirectedLayout() {
    // Simple force-directed layout
    const repulsion = 1000;
    const attraction = 0.01;
    
    nodes.forEach(node => {
        node.vx = 0;
        node.vy = 0;
    });
    
    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = repulsion / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            
            nodes[i].vx -= fx;
            nodes[i].vy -= fy;
            nodes[j].vx += fx;
            nodes[j].vy += fy;
        }
    }
    
    // Attraction
    relations.forEach(relation => {
        const source = nodes.find(n => n.id === relation.source);
        const target = nodes.find(n => n.id === relation.target);
        
        if (source && target) {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = attraction * dist;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            
            source.vx += fx;
            source.vy += fy;
            target.vx -= fx;
            target.vy -= fy;
        }
    });
    
    // Apply velocity
    nodes.forEach(node => {
        node.x += node.vx * 0.1;
        node.y += node.vy * 0.1;
    });
}

// Other layout functions (simplified)
function circularLayout() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 3;
    
    nodes.forEach((node, i) => {
        const angle = (i / nodes.length) * 2 * Math.PI;
        node.x = centerX + radius * Math.cos(angle);
        node.y = centerY + radius * Math.sin(angle);
    });
}

function hierarchicalLayout() {
    // Simplified hierarchical layout
    const levels = {};
    nodes.forEach(node => {
        const level = getNodeLevel(node);
        if (!levels[level]) levels[level] = [];
        levels[level].push(node);
    });
    
    const levelHeight = canvas.height / (Object.keys(levels).length + 1);
    Object.keys(levels).forEach((level, i) => {
        const y = (i + 1) * levelHeight;
        const levelWidth = canvas.width / (levels[level].length + 1);
        levels[level].forEach((node, j) => {
            node.x = (j + 1) * levelWidth;
            node.y = y;
        });
    });
}

function randomLayout() {
    nodes.forEach(node => {
        node.x = Math.random() * (canvas.width - 100) + 50;
        node.y = Math.random() * (canvas.height - 100) + 50;
    });
}

function getNodeLevel(node) {
    // Simple level calculation based on incoming relations
    return relations.filter(r => r.target === node.id).length;
}

// Analytics
function updateAnalytics() {
    document.getElementById('totalNodes').textContent = nodes.length;
    document.getElementById('totalRelations').textContent = relations.length;
    
    const degrees = nodes.map(node => 
        relations.filter(r => r.source === node.id || r.target === node.id).length
    );
    const avgDegree = degrees.length > 0 ? degrees.reduce((a, b) => a + b) / degrees.length : 0;
    document.getElementById('avgDegree').textContent = avgDegree.toFixed(2);
    
    // Simplified calculations for other metrics
    document.getElementById('components').textContent = calculateComponents();
    document.getElementById('diameter').textContent = calculateDiameter();
    document.getElementById('clustering').textContent = calculateClustering();
}

function calculateComponents() {
    // Simplified connected components count
    let visited = new Set();
    let components = 0;
    
    nodes.forEach(node => {
        if (!visited.has(node.id)) {
            dfs(node.id, visited);
            components++;
        }
    });
    
    return components;
}

function dfs(nodeId, visited) {
    visited.add(nodeId);
    relations.forEach(relation => {
        if (relation.source === nodeId && !visited.has(relation.target)) {
            dfs(relation.target, visited);
        }
        if (relation.target === nodeId && !visited.has(relation.source)) {
            dfs(relation.source, visited);
        }
    });
}

function calculateDiameter() {
    // Simplified diameter calculation
    if (nodes.length < 2) return 0;
    return Math.floor(Math.random() * 5) + 1; // Placeholder
}

function calculateClustering() {
    // Simplified clustering coefficient
    return (Math.random() * 0.5).toFixed(2);
}

// List view
function updateListView() {
    const nodesList = document.getElementById('nodesList');
    const relationsList = document.getElementById('relationsList');
    
    nodesList.innerHTML = '';
    relationsList.innerHTML = '';
    
    nodes.forEach(node => {
        const li = document.createElement('li');
        li.textContent = `${node.label} (${node.type})`;
        li.addEventListener('click', () => selectNode(node.id));
        nodesList.appendChild(li);
    });
    
    relations.forEach(relation => {
        const sourceLabel = getNodeLabel(relation.source);
        const targetLabel = getNodeLabel(relation.target);
        const li = document.createElement('li');
        li.textContent = `${sourceLabel} --${relation.type}--> ${targetLabel}`;
        li.addEventListener('click', () => selectRelation(relation.id));
        relationsList.appendChild(li);
    });
}

function selectNode(nodeId) {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
        node.selected = !node.selected;
        updateNodeInfo(node);
        updateListView();
        draw();
    }
}

function selectRelation(relationId) {
    const relation = relations.find(r => r.id === relationId);
    if (relation) {
        relation.selected = !relation.selected;
        updateListView();
        draw();
    }
}

function updateNodeInfo(node) {
    const info = document.getElementById('nodeDetails');
    if (node) {
        info.innerHTML = `
            <strong>${node.label}</strong><br>
            Type: ${node.type}<br>
            ${node.description ? `Description: ${node.description}` : ''}
        `;
    } else {
        info.textContent = 'Click on a node to see details';
    }
}

// Utility functions
function getNodeLabel(nodeId) {
    const node = nodes.find(n => n.id === nodeId);
    return node ? node.label : 'Unknown';
}

function updateDisplay() {
    draw();
    updateListView();
    updateAnalytics();
    updateNodeSelects();
}

function updateNodeSelects() {
    const sourceSelect = document.getElementById('sourceNode');
    const targetSelect = document.getElementById('targetNode');
    
    sourceSelect.innerHTML = '';
    targetSelect.innerHTML = '';
    
    nodes.forEach(node => {
        const option1 = document.createElement('option');
        option1.value = node.id;
        option1.textContent = node.label;
        sourceSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = node.id;
        option2.textContent = node.label;
        targetSelect.appendChild(option2);
    });
}

function handleKeyDown(e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'n':
                e.preventDefault();
                nodeModal.style.display = 'block';
                break;
            case 'r':
                e.preventDefault();
                addRelation();
                break;
            case 'z':
                e.preventDefault();
                // Undo functionality could be added
                break;
        }
    }
    
    if (e.key === 'Delete') {
        selectedNodes.forEach(id => removeNode(id));
        selectedRelations.forEach(id => removeRelation(id));
        selectedNodes = [];
        selectedRelations = [];
        updateDisplay();
    }
}

function exportData() {
    const data = {
        nodes,
        relations,
        settings,
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'semantic-map.json';
    a.click();
    URL.revokeObjectURL(url);
    log('Data exported');
}

function log(message) {
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
}

// Animation loop for layout
function animate() {
    applyLayout();
    requestAnimationFrame(animate);
}

animate();

// Initialize with sample data
function initializeSampleData() {
    const concepts = ['AI', 'Machine Learning', 'Deep Learning', 'Neural Networks', 'Data Science'];
    concepts.forEach(label => addNode(label, 'concept', `Concept of ${label}`));
    
    addRelation(nodes[0].id, nodes[1].id, 'related-to', 1);
    addRelation(nodes[1].id, nodes[2].id, 'is-a', 1);
    addRelation(nodes[2].id, nodes[3].id, 'part-of', 1);
    addRelation(nodes[0].id, nodes[4].id, 'related-to', 1);
    
    fitToScreen();
}

initializeSampleData();