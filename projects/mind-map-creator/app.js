// Mind Map Creator
const canvas = document.getElementById('mindmap-canvas');
const ctx = canvas.getContext('2d');
let nodes = [];
let edges = [];
let draggingNode = null;
let offset = {x:0, y:0};
let connectMode = false;
let connectFrom = null;
let branchColor = '#4f8cff';

function drawMindMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw edges
    edges.forEach(e => {
        const from = nodes.find(n => n.id === e.from);
        const to = nodes.find(n => n.id === e.to);
        if (from && to) {
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.strokeStyle = e.color || branchColor;
            ctx.lineWidth = 4;
            ctx.stroke();
        }
    });
    // Draw nodes
    nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 32, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#4f8cff';
        ctx.lineWidth = 3;
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 16px Segoe UI';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y + 6);
    });
}

function addNode(label) {
    const id = Date.now() + Math.random();
    nodes.push({ id, label, x: 100 + Math.random() * 700, y: 100 + Math.random() * 400 });
    drawMindMap();
}

document.getElementById('add-node-btn').onclick = function() {
    const label = document.getElementById('node-label').value.trim();
    if (!label) return;
    addNode(label);
    document.getElementById('node-label').value = '';
};

document.getElementById('connect-mode-btn').onclick = function() {
    connectMode = !connectMode;
    this.textContent = connectMode ? 'Exit Connect' : 'Connect Mode';
    connectFrom = null;
};

canvas.onmousedown = function(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let found = false;
    nodes.forEach(n => {
        if (Math.hypot(n.x - mx, n.y - my) < 32) {
            if (connectMode) {
                if (!connectFrom) {
                    connectFrom = n.id;
                } else {
                    if (connectFrom !== n.id) {
                        edges.push({ from: connectFrom, to: n.id, color: branchColor });
                        connectFrom = null;
                        drawMindMap();
                    }
                }
            } else {
                draggingNode = n;
                offset.x = mx - n.x;
                offset.y = my - n.y;
            }
            found = true;
        }
    });
    if (!found) {
        draggingNode = null;
        connectFrom = null;
    }
};

canvas.onmousemove = function(e) {
    if (draggingNode) {
        const rect = canvas.getBoundingClientRect();
        draggingNode.x = e.clientX - rect.left - offset.x;
        draggingNode.y = e.clientY - rect.top - offset.y;
        drawMindMap();
    }
};

canvas.onmouseup = function() {
    draggingNode = null;
};

document.getElementById('style-branch-btn').onclick = function() {
    branchColor = prompt('Enter branch color (CSS value):', branchColor) || branchColor;
    drawMindMap();
};

document.getElementById('export-png-btn').onclick = function() {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'mindmap.png';
    link.click();
};

document.getElementById('export-svg-btn').onclick = function() {
    let svg = `<svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">`;
    edges.forEach(e => {
        const from = nodes.find(n => n.id === e.from);
        const to = nodes.find(n => n.id === e.to);
        if (from && to) {
            svg += `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${e.color || branchColor}" stroke-width="4"/>`;
        }
    });
    nodes.forEach(n => {
        svg += `<circle cx="${n.x}" cy="${n.y}" r="32" fill="#fff" stroke="#4f8cff" stroke-width="3"/>`;
        svg += `<text x="${n.x}" y="${n.y + 6}" font-family="Segoe UI" font-size="16" fill="#333" text-anchor="middle">${n.label}</text>`;
    });
    svg += '</svg>';
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mindmap.svg';
    link.click();
};

document.getElementById('export-json-btn').onclick = function() {
    const json = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mindmap.json';
    link.click();
};

// Collaborative mode (basic, local)
document.getElementById('collab-btn').onclick = function() {
    if (confirm('Enable collaborative mode? (Local only, auto-save to localStorage)')) {
        localStorage.setItem('mindmapNodes', JSON.stringify(nodes));
        localStorage.setItem('mindmapEdges', JSON.stringify(edges));
        alert('Mind map saved to localStorage. Share this device to collaborate.');
    }
};

// Load from localStorage if available
if (localStorage.getItem('mindmapNodes')) {
    nodes = JSON.parse(localStorage.getItem('mindmapNodes'));
    edges = JSON.parse(localStorage.getItem('mindmapEdges'));
}
drawMindMap();