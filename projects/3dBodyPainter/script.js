// ─── PALETTE ────────────────────────────────────────────────────────────────
const PALETTE = [
    '#FF4766', '#FF8C42', '#FFD166', '#E8FF47', '#06D6A0',
    '#47D4FF', '#4466FF', '#9B5DE5', '#F15BB5', '#FFFFFF',
    '#CCCCCC', '#888888', '#444444', '#1A1A2E', '#000000',
    '#8B4513', '#D2691E', '#F4A460', '#FFDEAD', '#FFF8DC',
];

// ─── STATE ───────────────────────────────────────────────────────────────────
const state = {
    activeColor: '#E8FF47',
    brushMode: 'paint',
    opacity: 1.0,
    selectedPart: null,
    history: [],
    paintCount: 0,
    undoCount: 0,
    usedColors: new Set(),
};

// ─── BUILD PALETTE ───────────────────────────────────────────────────────────
const paletteGrid = document.getElementById('paletteGrid');
PALETTE.forEach(c => {
    const sw = document.createElement('div');
    sw.className = 'swatch' + (c === state.activeColor ? ' active' : '');
    sw.style.background = c;
    sw.addEventListener('click', () => {
        setColor(c);
        paletteGrid.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
    });
    paletteGrid.appendChild(sw);
});

// ─── COLOR PICKER ────────────────────────────────────────────────────────────
const picker = document.getElementById('colorPicker');
const hexLabel = document.getElementById('colorHex');
picker.addEventListener('input', () => {
    setColor(picker.value);
    paletteGrid.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
});
function setColor(c) {
    state.activeColor = c;
    picker.value = c.length === 4 ? c : c.substring(0, 7);
    hexLabel.textContent = c.toUpperCase();
}

// ─── OPACITY ─────────────────────────────────────────────────────────────────
document.getElementById('opacitySlider').addEventListener('input', e => {
    state.opacity = e.target.value / 100;
    document.getElementById('opacityVal').textContent = e.target.value + '%';
});

// ─── BRUSH MODES ─────────────────────────────────────────────────────────────
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.brushMode = btn.dataset.mode;
    });
});

// ─── THREE.JS SETUP ──────────────────────────────────────────────────────────
const container = document.getElementById('canvas-container');
const canvas = document.getElementById('threeCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x0d0d14);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.set(0, 1.2, 4.5);
camera.lookAt(0, 1, 0);

// Resize
function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(3, 6, 4);
dirLight.castShadow = true;
scene.add(dirLight);
const fillLight = new THREE.DirectionalLight(0x8899ff, 0.3);
fillLight.position.set(-4, 2, -2);
scene.add(fillLight);
const rimLight = new THREE.DirectionalLight(0xff8844, 0.2);
rimLight.position.set(0, 4, -5);
scene.add(rimLight);

// Grid/floor
const gridHelper = new THREE.GridHelper(8, 20, 0x1a1a2e, 0x1a1a2e);
gridHelper.position.y = -0.01;
scene.add(gridHelper);

// ─── BUILD HUMAN BODY ────────────────────────────────────────────────────────
const bodyParts = {};
const partsGroup = new THREE.Group();

function makeMat(color = 0xe0c9b0) {
    return new THREE.MeshStandardMaterial({
        color, roughness: 0.6, metalness: 0.05,
        transparent: true, opacity: 1.0,
    });
}

function addPart(name, geo, mat, pos, rot = [0, 0, 0]) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.partName = name;
    bodyParts[name] = mesh;
    partsGroup.add(mesh);
    return mesh;
}

const skinColor = 0xddb899;
const shirtColor = 0x334466;
const pantsColor = 0x223344;
const shoeColor = 0x221111;

// Head
addPart('Head', new THREE.SphereGeometry(0.22, 16, 16), makeMat(skinColor), [0, 2.62, 0]);

// Neck
addPart('Neck', new THREE.CylinderGeometry(0.07, 0.09, 0.18, 12), makeMat(skinColor), [0, 2.37, 0]);

// Torso
addPart('Torso', new THREE.BoxGeometry(0.6, 0.75, 0.28, 2, 2, 2), makeMat(shirtColor), [0, 1.87, 0]);

// Hips
addPart('Hips', new THREE.BoxGeometry(0.52, 0.28, 0.26), makeMat(pantsColor), [0, 1.47, 0]);

// Upper arms
addPart('Left Arm (Upper)', new THREE.CylinderGeometry(0.075, 0.065, 0.36, 12), makeMat(shirtColor), [-0.38, 1.93, 0], [0, 0, 0.25]);
addPart('Right Arm (Upper)', new THREE.CylinderGeometry(0.075, 0.065, 0.36, 12), makeMat(shirtColor), [0.38, 1.93, 0], [0, 0, -0.25]);

// Lower arms
addPart('Left Arm (Lower)', new THREE.CylinderGeometry(0.06, 0.05, 0.34, 12), makeMat(skinColor), [-0.44, 1.56, 0], [0, 0, 0.18]);
addPart('Right Arm (Lower)', new THREE.CylinderGeometry(0.06, 0.05, 0.34, 12), makeMat(skinColor), [0.44, 1.56, 0], [0, 0, -0.18]);

// Hands
addPart('Left Hand', new THREE.SphereGeometry(0.06, 10, 10), makeMat(skinColor), [-0.49, 1.35, 0]);
addPart('Right Hand', new THREE.SphereGeometry(0.06, 10, 10), makeMat(skinColor), [0.49, 1.35, 0]);

// Upper legs
addPart('Left Leg (Upper)', new THREE.CylinderGeometry(0.1, 0.085, 0.46, 12), makeMat(pantsColor), [-0.14, 1.09, 0]);
addPart('Right Leg (Upper)', new THREE.CylinderGeometry(0.1, 0.085, 0.46, 12), makeMat(pantsColor), [0.14, 1.09, 0]);

// Lower legs
addPart('Left Leg (Lower)', new THREE.CylinderGeometry(0.075, 0.065, 0.44, 12), makeMat(pantsColor), [-0.14, 0.62, 0]);
addPart('Right Leg (Lower)', new THREE.CylinderGeometry(0.075, 0.065, 0.44, 12), makeMat(pantsColor), [0.14, 0.62, 0]);

// Feet
addPart('Left Foot', new THREE.BoxGeometry(0.12, 0.09, 0.22), makeMat(shoeColor), [-0.14, 0.365, 0.05]);
addPart('Right Foot', new THREE.BoxGeometry(0.12, 0.09, 0.22), makeMat(shoeColor), [0.14, 0.365, 0.05]);

scene.add(partsGroup);

// ─── PARTS LIST UI ───────────────────────────────────────────────────────────
const partNames = Object.keys(bodyParts);
document.getElementById('partCount').textContent = partNames.length;
const partsList = document.getElementById('partsList');

partNames.forEach(name => {
    const item = document.createElement('div');
    item.className = 'part-item';
    item.dataset.part = name;
    const dot = document.createElement('div');
    dot.className = 'part-dot';
    dot.style.background = '#' + bodyParts[name].material.color.getHexString();
    item.appendChild(dot);
    const label = document.createElement('span');
    label.textContent = name;
    item.appendChild(label);
    item.addEventListener('click', () => paintPart(name));
    partsList.appendChild(item);
});

// ─── PAINT LOGIC ─────────────────────────────────────────────────────────────
const DEFAULT_COLORS = {};
partNames.forEach(n => DEFAULT_COLORS[n] = bodyParts[n].material.color.getHex());

function paintPart(name, color = null) {
    const part = bodyParts[name];
    if (!part) return;
    const c = color || state.activeColor;

    if (state.brushMode === 'erase') {
        paintMesh(part, '#' + DEFAULT_COLORS[name].toString(16).padStart(6, '0'), 1.0, name, true);
        return;
    }
    if (state.brushMode === 'fill') {
        partNames.forEach(n => paintMesh(bodyParts[n], c, state.opacity, n));
        addHistory('Fill All', c);
        return;
    }
    paintMesh(part, c, state.opacity, name);
}

function paintMesh(mesh, colorStr, opacity, name, isErase = false) {
    const prevColor = '#' + mesh.material.color.getHexString();
    const prevOpacity = mesh.material.opacity;
    state.history.push({ mesh, name, prevColor, prevOpacity });

    mesh.material.color.set(colorStr);
    mesh.material.opacity = opacity;
    mesh.material.transparent = opacity < 1;
    mesh.material.needsUpdate = true;

    // Update parts list dot
    const dotEl = partsList.querySelector(`[data-part="${name}"] .part-dot`);
    if (dotEl) dotEl.style.background = colorStr;

    if (!isErase) {
        state.paintCount++;
        state.usedColors.add(colorStr.toUpperCase());
        document.getElementById('paintCount').textContent = state.paintCount;
        document.getElementById('colorCount').textContent = state.usedColors.size;
        addHistory(name, colorStr);
    }

    // Highlight effect
    flashPart(mesh);
}

function flashPart(mesh) {
    const orig = mesh.material.emissive.clone();
    mesh.material.emissive.set(0xffffff);
    mesh.material.emissiveIntensity = 0.3;
    setTimeout(() => { mesh.material.emissive.copy(orig); mesh.material.emissiveIntensity = 0; }, 200);
}

// ─── HISTORY UI ──────────────────────────────────────────────────────────────
function addHistory(name, color) {
    const list = document.getElementById('historyList');
    const item = document.createElement('div');
    item.className = 'history-item';
    const dot = document.createElement('div');
    dot.className = 'h-dot';
    dot.style.background = color;
    item.appendChild(dot);
    const txt = document.createElement('span');
    txt.textContent = name;
    item.appendChild(txt);
    list.insertBefore(item, list.firstChild);
    while (list.children.length > 20) list.removeChild(list.lastChild);
}

// ─── UNDO ─────────────────────────────────────────────────────────────────────
document.getElementById('undoBtn').addEventListener('click', () => {
    if (!state.history.length) return;
    const { mesh, name, prevColor, prevOpacity } = state.history.pop();
    mesh.material.color.set(prevColor);
    mesh.material.opacity = prevOpacity;
    mesh.material.transparent = prevOpacity < 1;
    const dotEl = partsList.querySelector(`[data-part="${name}"] .part-dot`);
    if (dotEl) dotEl.style.background = prevColor;
    state.undoCount++;
    document.getElementById('undoCount').textContent = state.undoCount;
    const list = document.getElementById('historyList');
    if (list.firstChild) list.removeChild(list.firstChild);
});

// ─── RANDOMIZE ───────────────────────────────────────────────────────────────
document.getElementById('randomBtn').addEventListener('click', () => {
    partNames.forEach(name => {
        const rc = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        paintMesh(bodyParts[name], rc, 1.0, name);
    });
    addHistory('Randomize', '#888');
});

// ─── CLEAR ────────────────────────────────────────────────────────────────────
document.getElementById('clearBtn').addEventListener('click', () => {
    partNames.forEach(name => {
        const dc = '#' + DEFAULT_COLORS[name].toString(16).padStart(6, '0');
        bodyParts[name].material.color.set(dc);
        bodyParts[name].material.opacity = 1.0;
        bodyParts[name].material.transparent = false;
        const dotEl = partsList.querySelector(`[data-part="${name}"] .part-dot`);
        if (dotEl) dotEl.style.background = dc;
    });
    state.history = [];
    document.getElementById('historyList').innerHTML = '';
});

// ─── RESET POSE ───────────────────────────────────────────────────────────────
document.getElementById('resetPoseBtn').addEventListener('click', () => {
    partsGroup.rotation.set(0, 0, 0);
    camera.position.set(0, 1.2, 4.5);
    camera.lookAt(0, 1, 0);
});

// ─── SCREENSHOT ──────────────────────────────────────────────────────────────
document.getElementById('screenshotBtn').addEventListener('click', () => {
    renderer.render(scene, camera);
    const link = document.createElement('a');
    link.download = 'bodypaint-3d.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// ─── LIGHTING CONTROLS ───────────────────────────────────────────────────────
document.getElementById('lightSlider').addEventListener('input', e => {
    dirLight.intensity = e.target.value / 100;
    document.getElementById('lightVal').textContent = e.target.value + '%';
});
document.getElementById('ambientSlider').addEventListener('input', e => {
    ambientLight.intensity = e.target.value / 100;
    document.getElementById('ambientVal').textContent = e.target.value + '%';
});

// ─── RAYCASTING / CLICK TO PAINT ─────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const hoverTag = document.getElementById('hoverTag');

function getMouseNDC(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

canvas.addEventListener('click', e => {
    if (isDragging) return;
    getMouseNDC(e);
    raycaster.setFromCamera(mouse, camera);
    const meshes = Object.values(bodyParts);
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length) {
        const name = hits[0].object.userData.partName;
        paintPart(name);
        // Highlight list item
        partsList.querySelectorAll('.part-item').forEach(el => el.classList.remove('selected'));
        const el = partsList.querySelector(`[data-part="${name}"]`);
        if (el) { el.classList.add('selected'); el.scrollIntoView({ block: 'nearest' }); }
        state.selectedPart = name;
    }
});

canvas.addEventListener('mousemove', e => {
    getMouseNDC(e);
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(Object.values(bodyParts));
    if (hits.length) {
        const name = hits[0].object.userData.partName;
        hoverTag.style.display = 'block';
        hoverTag.style.left = (e.clientX - container.getBoundingClientRect().left + 14) + 'px';
        hoverTag.style.top = (e.clientY - container.getBoundingClientRect().top - 8) + 'px';
        hoverTag.textContent = name;
        canvas.style.cursor = 'crosshair';
    } else {
        hoverTag.style.display = 'none';
        canvas.style.cursor = isDragging ? 'grabbing' : 'grab';
    }
});

// ─── ORBIT CONTROLS (manual) ─────────────────────────────────────────────────
let isDragging = false, lastX = 0, lastY = 0, rotX = 0, rotY = 0, zoom = 4.5;

canvas.addEventListener('mousedown', e => { if (e.button === 0) { isDragging = true; lastX = e.clientX; lastY = e.clientY; } });
window.addEventListener('mouseup', () => { isDragging = false; });
window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    rotY += dx * 0.008;
    rotX += dy * 0.008;
    rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotX));
});

canvas.addEventListener('wheel', e => {
    zoom += e.deltaY * 0.005;
    zoom = Math.max(1.5, Math.min(10, zoom));
    e.preventDefault();
}, { passive: false });

// Touch support
let lastTouchX = 0, lastTouchY = 0;
canvas.addEventListener('touchstart', e => { lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY; }, { passive: true });
canvas.addEventListener('touchmove', e => {
    const dx = e.touches[0].clientX - lastTouchX, dy = e.touches[0].clientY - lastTouchY;
    lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY;
    rotY += dx * 0.008; rotX += dy * 0.008;
    rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotX));
}, { passive: true });

// ─── ANIMATE ─────────────────────────────────────────────────────────────────
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Subtle idle sway when not dragging
    if (!isDragging) {
        partsGroup.rotation.y += (Math.sin(t * 0.3) * 0.003);
    }

    // Apply orbit
    const phi = rotX;
    const theta = rotY;
    camera.position.x = zoom * Math.sin(theta) * Math.cos(phi);
    camera.position.y = 1.2 + zoom * Math.sin(phi);
    camera.position.z = zoom * Math.cos(theta) * Math.cos(phi);
    camera.lookAt(0, 1.2, 0);

    renderer.render(scene, camera);
}
animate();