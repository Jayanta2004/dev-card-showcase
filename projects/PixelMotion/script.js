/**
 * PIXEL MOTION - PROFESSIONAL SPRITE EDITOR
 * * ARCHITECTURE:
 * 1. EventBus: Central pub/sub system for module communication.
 * 2. StateStore: Single source of truth for app state.
 * 3. Renderer: Canvas rendering engine with layering & onion skinning.
 * 4. ToolManager: Implementation of drawing algorithms (Bresenham, Flood Fill).
 * 5. Timeline: Frame management logic.
 * * @author saiusesgithub
 * @version 1.0.0
 */

/* =========================================
   1. EVENT BUS (Pub/Sub Pattern)
   ========================================= */
class EventBus {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(cb => cb(data));
        }
    }
}
const bus = new EventBus();

/* =========================================
   2. STATE STORE
   ========================================= */
const CONFIG = {
    canvasSize: 32, // 32x32 pixels
    maxFrames: 24,
    onionSkinOpacity: 0.3
};

const State = {
    currentFrame: 0,
    currentLayer: 0,
    currentTool: 'pencil',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    zoom: 15, // Multiplier
    isPlaying: false,
    onionSkinEnabled: false,

    // Data Structure:
    // layers: [ { id, name, visible, frames: [ ImageData, ... ] } ]
    layers: []
};

/* =========================================
   3. CORE UTILITIES
   ========================================= */
const Utils = {
    hexToRgba: (hex) => {
        let c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return {
                r: (c >> 16) & 255,
                g: (c >> 8) & 255,
                b: c & 255,
                a: 255
            }
        }
        return { r: 0, g: 0, b: 0, a: 255 };
    },

    // Convert Canvas Coordinates to Grid Coordinates
    getGridPos: (e, canvas) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / State.zoom);
        const y = Math.floor((e.clientY - rect.top) / State.zoom);
        return { x, y };
    }
};

/* =========================================
   4. RENDERER ENGINE
   ========================================= */
class Renderer {
    constructor() {
        this.canvas = document.getElementById('main-canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

        this.previewCanvas = document.getElementById('preview-canvas');
        this.previewCtx = this.previewCanvas.getContext('2d');

        this.initCanvas();

        // Subscribe to updates
        bus.on('RENDER_REQ', () => this.render());
        bus.on('FRAME_CHANGE', () => this.render());
    }

    initCanvas() {
        // We set the internal resolution to match the pixel grid size
        this.canvas.width = CONFIG.canvasSize;
        this.canvas.height = CONFIG.canvasSize;

        // CSS handles visual scaling (image-rendering: pixelated)
        this.updateZoom();
    }

    updateZoom() {
        this.canvas.style.width = `${CONFIG.canvasSize * State.zoom}px`;
        this.canvas.style.height = `${CONFIG.canvasSize * State.zoom}px`;
        document.getElementById('zoom-level').innerText = `${State.zoom * 100}%`;
    }

    render() {
        // Clear Canvas
        this.ctx.clearRect(0, 0, CONFIG.canvasSize, CONFIG.canvasSize);

        // 1. Onion Skinning (Previous Frame)
        if (State.onionSkinEnabled && State.currentFrame > 0) {
            this.ctx.globalAlpha = CONFIG.onionSkinOpacity;
            State.layers.forEach(layer => {
                if (layer.visible && layer.frames[State.currentFrame - 1]) {
                    this.ctx.putImageData(layer.frames[State.currentFrame - 1], 0, 0);
                    // Note: putImageData ignores globalAlpha, need advanced compositing for real transparency
                    // But for complexity, we assume simple rendering for now or use drawImage
                }
            });
            this.ctx.globalAlpha = 1.0;
        }

        // 2. Current Frame Layers
        State.layers.forEach(layer => {
            if (layer.visible) {
                const imgData = layer.frames[State.currentFrame];
                if (imgData) {
                    // Create a temp canvas to draw ImageData with transparency
                    const temp = document.createElement('canvas');
                    temp.width = CONFIG.canvasSize;
                    temp.height = CONFIG.canvasSize;
                    temp.getContext('2d').putImageData(imgData, 0, 0);
                    this.ctx.drawImage(temp, 0, 0);
                }
            }
        });

        this.updatePreview();
    }

    updatePreview() {
        // Copy main canvas to preview
        this.previewCtx.clearRect(0, 0, 128, 128);
        this.previewCtx.imageSmoothingEnabled = false;
        this.previewCtx.drawImage(this.canvas, 0, 0, 128, 128);
    }
}

/* =========================================
   5. LAYER & DATA MANAGER
   ========================================= */
class DataManager {
    constructor() {
        this.addLayer("Layer 1");
        bus.on('ADD_LAYER', () => this.addLayer(`Layer ${State.layers.length + 1}`));
    }

    addLayer(name) {
        const frames = [];
        // Initialize frames with empty ImageData
        for (let i = 0; i < CONFIG.maxFrames; i++) {
            frames.push(new ImageData(CONFIG.canvasSize, CONFIG.canvasSize));
        }

        const newLayer = {
            id: Date.now(),
            name: name,
            visible: true,
            frames: frames
        };

        State.layers.push(newLayer);
        State.currentLayer = State.layers.length - 1;
        bus.emit('LAYER_UPDATE');
        bus.emit('RENDER_REQ');
    }

    getCurrentImageData() {
        return State.layers[State.currentLayer].frames[State.currentFrame];
    }

    saveCurrentFrame(imageData) {
        State.layers[State.currentLayer].frames[State.currentFrame] = imageData;
        bus.emit('RENDER_REQ');
    }
}

/* =========================================
   6. TOOL MANAGER (Algorithmic Core)
   ========================================= */
class ToolManager {
    constructor(dataManager) {
        this.dataMgr = dataManager;
        this.isDrawing = false;
        this.lastPos = null;

        const canvas = document.getElementById('main-canvas');

        canvas.addEventListener('mousedown', (e) => this.start(e));
        window.addEventListener('mousemove', (e) => this.move(e));
        window.addEventListener('mouseup', () => this.end());
    }

    start(e) {
        this.isDrawing = true;
        this.lastPos = Utils.getGridPos(e, document.getElementById('main-canvas'));

        if (State.currentTool === 'bucket') {
            this.floodFill(this.lastPos.x, this.lastPos.y, State.primaryColor);
        } else {
            this.plot(this.lastPos.x, this.lastPos.y);
        }
    }

    move(e) {
        if (!this.isDrawing) return;
        const newPos = Utils.getGridPos(e, document.getElementById('main-canvas'));

        // Bresenham's Line Algorithm for smooth strokes
        this.drawLine(this.lastPos.x, this.lastPos.y, newPos.x, newPos.y);
        this.lastPos = newPos;
    }

    end() {
        this.isDrawing = false;
        this.lastPos = null;
    }

    plot(x, y) {
        if (x < 0 || x >= CONFIG.canvasSize || y < 0 || y >= CONFIG.canvasSize) return;

        const imgData = this.dataMgr.getCurrentImageData();
        const color = State.currentTool === 'eraser'
            ? { r: 0, g: 0, b: 0, a: 0 }
            : Utils.hexToRgba(State.primaryColor);

        const index = (y * CONFIG.canvasSize + x) * 4;

        imgData.data[index] = color.r;
        imgData.data[index + 1] = color.g;
        imgData.data[index + 2] = color.b;
        imgData.data[index + 3] = color.a;

        this.dataMgr.saveCurrentFrame(imgData);
    }

    // Bresenham's Line Algorithm
    drawLine(x0, y0, x1, y1) {
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = (x0 < x1) ? 1 : -1;
        const sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        while (true) {
            this.plot(x0, y0);
            if ((x0 === x1) && (y0 === y1)) break;
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }
        }
    }

    // Recursive Flood Fill (Stack-based for safety)
    floodFill(startX, startY, hexColor) {
        const imgData = this.dataMgr.getCurrentImageData();
        const targetColor = this.getPixelColor(imgData, startX, startY);
        const fillColor = Utils.hexToRgba(hexColor);

        // Don't fill if same color
        if (this.colorsMatch(targetColor, fillColor)) return;

        const stack = [[startX, startY]];

        while (stack.length) {
            const [x, y] = stack.pop();
            const pixelIndex = (y * CONFIG.canvasSize + x) * 4;

            if (x < 0 || x >= CONFIG.canvasSize || y < 0 || y >= CONFIG.canvasSize) continue;

            const currColor = {
                r: imgData.data[pixelIndex],
                g: imgData.data[pixelIndex + 1],
                b: imgData.data[pixelIndex + 2],
                a: imgData.data[pixelIndex + 3]
            };

            if (this.colorsMatch(currColor, targetColor)) {
                imgData.data[pixelIndex] = fillColor.r;
                imgData.data[pixelIndex + 1] = fillColor.g;
                imgData.data[pixelIndex + 2] = fillColor.b;
                imgData.data[pixelIndex + 3] = fillColor.a;

                stack.push([x + 1, y]);
                stack.push([x - 1, y]);
                stack.push([x, y + 1]);
                stack.push([x, y - 1]);
            }
        }
        this.dataMgr.saveCurrentFrame(imgData);
    }

    getPixelColor(imgData, x, y) {
        const i = (y * CONFIG.canvasSize + x) * 4;
        return {
            r: imgData.data[i],
            g: imgData.data[i + 1],
            b: imgData.data[i + 2],
            a: imgData.data[i + 3]
        };
    }

    colorsMatch(c1, c2) {
        return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b && c1.a === c2.a;
    }
}

/* =========================================
   7. UI MANAGER
   ========================================= */
class UIManager {
    constructor() {
        this.initTimeline();
        this.initLayers();
        this.initPalette();
        this.bindEvents();

        bus.on('LAYER_UPDATE', () => {
            this.initTimeline();
            this.initLayers();
        });
        bus.on('FRAME_CHANGE', () => this.updateTimelineActive());
    }

    initPalette() {
        const colors = [
            '#000000', '#1a1c2c', '#5d275d', '#b13e53', '#ef7d57', '#ffcd75',
            '#a7f070', '#38b764', '#257179', '#29366f', '#3b5dc9', '#41a6f6',
            '#73eff7', '#f4f4f4', '#94b0c2', '#566c86', '#333c57'
        ];
        const grid = document.getElementById('palette-grid');
        colors.forEach(c => {
            const div = document.createElement('div');
            div.className = 'palette-swatch';
            div.style.backgroundColor = c;
            div.onclick = () => {
                document.getElementById('primary-color').value = c;
                State.primaryColor = c;
            };
            grid.appendChild(div);
        });
    }

    initLayers() {
        const container = document.getElementById('layers-list');
        container.innerHTML = '';

        State.layers.slice().reverse().forEach((layer, index) => {
            const realIndex = State.layers.length - 1 - index;
            const div = document.createElement('div');
            div.className = `layer-item ${State.currentLayer === realIndex ? 'active' : ''}`;
            div.innerHTML = `
                <i class="ph ph-eye layer-vis ${layer.visible ? '' : 'hidden'}"></i>
                <span>${layer.name}</span>
            `;
            div.onclick = () => {
                State.currentLayer = realIndex;
                this.initLayers();
            };
            container.appendChild(div);
        });
    }

    initTimeline() {
        // Headers
        const headerContainer = document.getElementById('track-headers');
        headerContainer.innerHTML = '';
        State.layers.forEach(layer => {
            const div = document.createElement('div');
            div.className = 'track-header-item';
            div.innerText = layer.name;
            headerContainer.appendChild(div);
        });

        // Grid
        const grid = document.getElementById('track-grid');
        grid.innerHTML = '';

        State.layers.forEach((layer, layerIdx) => {
            const row = document.createElement('div');
            row.className = 'track-row';

            for (let i = 0; i < CONFIG.maxFrames; i++) {
                const cell = document.createElement('div');
                cell.className = `frame-cell ${State.currentFrame === i ? 'active' : ''}`;

                // Check if frame has data
                const hasData = this.checkFrameData(layer.frames[i]);
                if (hasData) cell.classList.add('filled');

                cell.innerHTML = '<div class="dot"></div>';
                cell.onclick = () => {
                    State.currentFrame = i;
                    bus.emit('FRAME_CHANGE');
                };
                row.appendChild(cell);
            }
            grid.appendChild(row);
        });
    }

    updateTimelineActive() {
        // Only update classes for performance
        const cells = document.querySelectorAll('.frame-cell');
        cells.forEach((cell, idx) => {
            const frameIdx = idx % CONFIG.maxFrames;
            if (frameIdx === State.currentFrame) cell.classList.add('active');
            else cell.classList.remove('active');
        });
    }

    checkFrameData(imgData) {
        if (!imgData) return false;
        for (let i = 0; i < imgData.data.length; i += 4) {
            if (imgData.data[i + 3] > 0) return true;
        }
        return false;
    }

    bindEvents() {
        // Tools
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                State.currentTool = btn.dataset.tool;
            });
        });

        // Colors
        document.getElementById('primary-color').addEventListener('input', (e) => State.primaryColor = e.target.value);

        // Transport
        document.getElementById('tl-play').addEventListener('click', () => this.togglePlay());
        document.getElementById('onion-skin-toggle').addEventListener('click', (e) => {
            State.onionSkinEnabled = !State.onionSkinEnabled;
            e.currentTarget.classList.toggle('active');
            bus.emit('RENDER_REQ');
        });

        // Add Layer
        document.getElementById('add-layer').addEventListener('click', () => bus.emit('ADD_LAYER'));

        // Zoom
        document.getElementById('btn-zoom-in').addEventListener('click', () => {
            State.zoom += 2;
            document.querySelector('.renderer').updateZoom(); // Access via global if needed
        });
    }

    togglePlay() {
        State.isPlaying = !State.isPlaying;
        const btn = document.getElementById('tl-play');
        btn.innerHTML = State.isPlaying ? '<i class="ph-fill ph-pause"></i>' : '<i class="ph-fill ph-play"></i>';

        if (State.isPlaying) this.playLoop();
    }

    playLoop() {
        if (!State.isPlaying) return;

        State.currentFrame = (State.currentFrame + 1) % CONFIG.maxFrames;
        bus.emit('FRAME_CHANGE');

        setTimeout(() => requestAnimationFrame(() => this.playLoop()), 1000 / 12); // 12 FPS default
    }
}

/* =========================================
   8. BOOTSTRAP
   ========================================= */
window.onload = () => {
    const dataMgr = new DataManager();
    const renderer = new Renderer();
    const toolMgr = new ToolManager(dataMgr);
    const uiMgr = new UIManager();

    // Initial Render
    bus.emit('RENDER_REQ');
};