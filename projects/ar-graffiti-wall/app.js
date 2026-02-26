// AR Graffiti Wall Core Logic
// Modular, extensible, and scalable

// --- Wall Data Model ---
class Wall {
    constructor(id, lat, lng, title, isPublic = true) {
        this.id = id;
        this.lat = lat;
        this.lng = lng;
        this.title = title;
        this.isPublic = isPublic;
        this.layers = [];
        this.upvotes = 0;
        this.comments = [];
        this.collaborators = [];
    }
}

// --- Wall Store ---
class WallStore {
    constructor() {
        this.walls = [];
        this.currentWall = null;
    }
    addWall(wall) {
        this.walls.push(wall);
    }
    getPublicWalls() {
        return this.walls.filter(w => w.isPublic);
    }
    getPrivateWalls() {
        return this.walls.filter(w => !w.isPublic);
    }
    getWallById(id) {
        return this.walls.find(w => w.id === id);
    }
    setCurrentWall(id) {
        this.currentWall = this.getWallById(id);
    }
}

const wallStore = new WallStore();

// --- Map Mock (for demo) ---
function renderMap() {
    const map = document.getElementById('map');
    map.innerHTML = '';
    wallStore.getPublicWalls().forEach(wall => {
        const marker = document.createElement('div');
        marker.className = 'map-marker';
        marker.style.position = 'absolute';
        marker.style.left = (wall.lng % 100) + '%';
        marker.style.top = (wall.lat % 100) + '%';
        marker.style.width = '24px';
        marker.style.height = '24px';
        marker.style.background = '#2e8b57';
        marker.style.borderRadius = '50%';
        marker.style.cursor = 'pointer';
        marker.title = wall.title;
        marker.onclick = () => openWall(wall.id);
        map.appendChild(marker);
    });
}

// --- Wall UI ---
function openWall(id) {
    wallStore.setCurrentWall(id);
    document.getElementById('wall-section').classList.remove('hidden');
    renderWallInfo();
    renderLayers();
    renderTools();
    renderSocial();
    renderCanvas();
}

function renderWallInfo() {
    const wall = wallStore.currentWall;
    const info = document.getElementById('wall-info');
    info.innerHTML = `<h2>${wall.title}</h2>
        <div>${wall.isPublic ? 'Public' : 'Private'} Wall</div>
        <div>Upvotes: ${wall.upvotes}</div>`;
}

// --- Layered Drawing Tools ---
class Layer {
    constructor(name) {
        this.name = name;
        this.strokes = [];
        this.visible = true;
    }
}

function renderLayers() {
    const wall = wallStore.currentWall;
    const layersDiv = document.getElementById('layers');
    layersDiv.innerHTML = '<h3>Layers</h3>';
    wall.layers.forEach((layer, idx) => {
        const item = document.createElement('div');
        item.className = 'layer-item';
        item.innerHTML = `<span>${layer.name}</span>
            <button onclick="toggleLayer(${idx})">${layer.visible ? 'Hide' : 'Show'}</button>`;
        layersDiv.appendChild(item);
    });
    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add Layer';
    addBtn.onclick = addLayer;
    layersDiv.appendChild(addBtn);
}

function addLayer() {
    const name = prompt('Layer name?');
    if (!name) return;
    wallStore.currentWall.layers.push(new Layer(name));
    renderLayers();
    renderCanvas();
}

function toggleLayer(idx) {
    const layer = wallStore.currentWall.layers[idx];
    layer.visible = !layer.visible;
    renderLayers();
    renderCanvas();
}

// --- Drawing Tools ---
let drawing = false;
let currentLayer = 0;
let brushColor = '#fff';
let brushSize = 6;

function renderTools() {
    const toolsDiv = document.getElementById('tools');
    toolsDiv.innerHTML = `<h3>Tools</h3>
        <label>Brush Color <input type="color" id="brush-color" value="${brushColor}"></label>
        <label>Brush Size <input type="range" id="brush-size" min="2" max="32" value="${brushSize}"></label>
        <button id="eraser-btn">Eraser</button>
        <button id="undo-btn">Undo</button>
        <button id="redo-btn">Redo</button>`;
    document.getElementById('brush-color').oninput = e => brushColor = e.target.value;
    document.getElementById('brush-size').oninput = e => brushSize = +e.target.value;
    document.getElementById('eraser-btn').onclick = () => brushColor = '#181a20';
    // Undo/redo logic can be expanded
}

function renderCanvas() {
    const canvas = document.getElementById('graffiti-canvas');
    const wall = wallStore.currentWall;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    wall.layers.forEach(layer => {
        if (!layer.visible) return;
        layer.strokes.forEach(stroke => {
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.size;
            ctx.beginPath();
            stroke.points.forEach((pt, i) => {
                if (i === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
            ctx.stroke();
        });
    });
}

function setupCanvasEvents() {
    const canvas = document.getElementById('graffiti-canvas');
    canvas.onmousedown = e => {
        drawing = true;
        const wall = wallStore.currentWall;
        const layer = wall.layers[currentLayer];
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        layer.strokes.push({ color: brushColor, size: brushSize, points: [{ x, y }] });
        renderCanvas();
    };
    canvas.onmousemove = e => {
        if (!drawing) return;
        const wall = wallStore.currentWall;
        const layer = wall.layers[currentLayer];
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const stroke = layer.strokes[layer.strokes.length - 1];
        stroke.points.push({ x, y });
        renderCanvas();
    };
    canvas.onmouseup = () => drawing = false;
    canvas.onmouseleave = () => drawing = false;
}

// --- Social Features ---
function renderSocial() {
    const wall = wallStore.currentWall;
    const socialDiv = document.getElementById('social');
    socialDiv.innerHTML = `<h3>Social</h3>
        <button id="upvote-btn">Upvote (${wall.upvotes})</button>
        <button id="collab-btn">Collab Mode</button>
        <div id="comments"></div>
        <form id="comment-form">
            <input type="text" id="comment-input" placeholder="Add a comment..." required />
            <button type="submit">Comment</button>
        </form>`;
    document.getElementById('upvote-btn').onclick = () => {
        wall.upvotes++;
        renderWallInfo();
        renderSocial();
    };
    document.getElementById('collab-btn').onclick = () => {
        alert('Collab mode coming soon!');
    };
    renderComments();
    document.getElementById('comment-form').onsubmit = e => {
        e.preventDefault();
        const val = document.getElementById('comment-input').value;
        wall.comments.push(val);
        renderSocial();
    };
}

function renderComments() {
    const wall = wallStore.currentWall;
    const commentsDiv = document.getElementById('comments');
    commentsDiv.innerHTML = wall.comments.map(c => `<div class="comment">${c}</div>`).join('');
}

// --- Wall Creation ---
function setupWallCreation() {
    document.getElementById('create-wall-btn').onclick = () => {
        const title = prompt('Wall title?');
        if (!title) return;
        const lat = Math.random() * 90;
        const lng = Math.random() * 180;
        const isPublic = confirm('Make wall public?');
        const wall = new Wall(Date.now(), lat, lng, title, isPublic);
        wall.layers.push(new Layer('Base'));
        wallStore.addWall(wall);
        renderMap();
    };
    document.getElementById('public-walls-btn').onclick = () => {
        document.getElementById('wall-section').classList.add('hidden');
        renderMap();
    };
    document.getElementById('private-walls-btn').onclick = () => {
        document.getElementById('wall-section').classList.add('hidden');
        renderMap();
    };
}

// --- Init ---
function init() {
    setupWallCreation();
    renderMap();
    setupCanvasEvents();
}

window.onload = init;
