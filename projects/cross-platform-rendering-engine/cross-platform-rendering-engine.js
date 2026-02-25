// Cross-Platform Rendering Engine JavaScript

class CrossPlatformRenderer {
    constructor() {
        this.canvas = document.getElementById('renderCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gl = null;
        this.shapes = [];
        this.selectedShape = null;
        this.isAnimating = false;
        this.animationId = null;
        this.currentPlatform = 'web';
        this.renderMode = '2d';
        this.fps = 60;
        this.lastTime = 0;
        this.frameCount = 0;
        this.fpsDisplay = 0;

        this.init();
        this.setupEventListeners();
        this.loadSettings();
        this.startRenderLoop();
    }

    init() {
        this.resizeCanvas();
        this.setupWebGL();
        this.loadShapes();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    setupWebGL() {
        try {
            this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
            if (this.gl) {
                console.log('WebGL initialized successfully');
            }
        } catch (e) {
            console.warn('WebGL not supported:', e);
        }
    }

    setupEventListeners() {
        // Canvas events
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));

        // Control events
        document.getElementById('addShapeBtn').addEventListener('click', this.showAddShapeModal.bind(this));
        document.getElementById('clearCanvasBtn').addEventListener('click', this.clearCanvas.bind(this));
        document.getElementById('startAnimationBtn').addEventListener('click', this.toggleAnimation.bind(this));
        document.getElementById('resetViewBtn').addEventListener('click', this.resetView.bind(this));

        // Platform selection
        document.querySelectorAll('.platform-card').forEach(card => {
            card.addEventListener('click', () => this.selectPlatform(card.dataset.platform));
        });

        // Settings
        document.getElementById('renderMode').addEventListener('change', this.changeRenderMode.bind(this));
        document.getElementById('backgroundColor').addEventListener('input', this.changeBackground.bind(this));
        document.getElementById('gridSize').addEventListener('input', this.updateGrid.bind(this));
        document.getElementById('snapToGrid').addEventListener('change', this.toggleSnapToGrid.bind(this));

        // Export
        document.getElementById('exportImageBtn').addEventListener('click', this.exportImage.bind(this));
        document.getElementById('exportVideoBtn').addEventListener('click', this.exportVideo.bind(this));
        document.getElementById('exportCodeBtn').addEventListener('click', this.exportCode.bind(this));

        // Modal events
        document.querySelector('.close').addEventListener('click', this.closeModal.bind(this));
        document.getElementById('addShapeForm').addEventListener('submit', this.addShape.bind(this));

        // Window resize
        window.addEventListener('resize', this.resizeCanvas.bind(this));

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.selectedShape = this.getShapeAt(x, y);
        if (this.selectedShape) {
            this.selectedShape.isDragging = true;
            this.selectedShape.offsetX = x - this.selectedShape.x;
            this.selectedShape.offsetY = y - this.selectedShape.y;
        }
    }

    handleMouseMove(e) {
        if (!this.selectedShape || !this.selectedShape.isDragging) return;

        const rect = this.canvas.getBoundingClientRect();
        let x = e.clientX - rect.left - this.selectedShape.offsetX;
        let y = e.clientY - rect.top - this.selectedShape.offsetY;

        if (this.snapToGrid) {
            const gridSize = parseInt(document.getElementById('gridSize').value);
            x = Math.round(x / gridSize) * gridSize;
            y = Math.round(y / gridSize) * gridSize;
        }

        this.selectedShape.x = x;
        this.selectedShape.y = y;
        this.saveShapes();
    }

    handleMouseUp() {
        if (this.selectedShape) {
            this.selectedShape.isDragging = false;
        }
        this.selectedShape = null;
    }

    handleWheel(e) {
        e.preventDefault();
        // Zoom functionality could be implemented here
    }

    handleKeyDown(e) {
        if (e.key === 'Delete' && this.selectedShape) {
            this.deleteShape(this.selectedShape);
        } else if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            // Undo functionality
        } else if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            // Redo functionality
        }
    }

    getShapeAt(x, y) {
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const shape = this.shapes[i];
            if (this.isPointInShape(x, y, shape)) {
                return shape;
            }
        }
        return null;
    }

    isPointInShape(x, y, shape) {
        switch (shape.type) {
            case 'rectangle':
                return x >= shape.x && x <= shape.x + shape.width &&
                       y >= shape.y && y <= shape.y + shape.height;
            case 'circle':
                const dx = x - (shape.x + shape.radius);
                const dy = y - (shape.y + shape.radius);
                return Math.sqrt(dx * dx + dy * dy) <= shape.radius;
            case 'triangle':
                // Triangle hit detection logic
                return this.isPointInTriangle(x, y, shape);
            default:
                return false;
        }
    }

    isPointInTriangle(x, y, triangle) {
        // Simple triangle hit detection
        const { x: x1, y: y1 } = triangle.points[0];
        const { x: x2, y: y2 } = triangle.points[1];
        const { x: x3, y: y3 } = triangle.points[2];

        const area = 0.5 * (-y2 * x3 + y1 * (-x2 + x3) + x1 * (y2 - y3) + x2 * y3);
        const s = 1 / (2 * area) * (y1 * x3 - x1 * y3 + (y3 - y1) * x + (x1 - x3) * y);
        const t = 1 / (2 * area) * (x1 * y2 - y1 * x2 + (y1 - y2) * x + (x2 - x1) * y);

        return s > 0 && t > 0 && (s + t) < 1;
    }

    showAddShapeModal() {
        document.getElementById('addShapeModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('addShapeModal').style.display = 'none';
        document.getElementById('addShapeForm').reset();
    }

    addShape(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const shapeType = formData.get('shapeType');
        const color = formData.get('color');
        const x = parseInt(formData.get('x')) || 100;
        const y = parseInt(formData.get('y')) || 100;

        let shape;

        switch (shapeType) {
            case 'rectangle':
                shape = {
                    id: Date.now(),
                    type: 'rectangle',
                    x: x,
                    y: y,
                    width: parseInt(formData.get('width')) || 100,
                    height: parseInt(formData.get('height')) || 100,
                    color: color,
                    rotation: 0,
                    scale: 1
                };
                break;
            case 'circle':
                shape = {
                    id: Date.now(),
                    type: 'circle',
                    x: x,
                    y: y,
                    radius: parseInt(formData.get('radius')) || 50,
                    color: color,
                    rotation: 0,
                    scale: 1
                };
                break;
            case 'triangle':
                shape = {
                    id: Date.now(),
                    type: 'triangle',
                    x: x,
                    y: y,
                    points: [
                        { x: 0, y: -50 },
                        { x: -43, y: 25 },
                        { x: 43, y: 25 }
                    ],
                    color: color,
                    rotation: 0,
                    scale: 1
                };
                break;
        }

        if (shape) {
            this.shapes.push(shape);
            this.saveShapes();
            this.closeModal();
        }
    }

    deleteShape(shape) {
        const index = this.shapes.indexOf(shape);
        if (index > -1) {
            this.shapes.splice(index, 1);
            this.saveShapes();
        }
    }

    clearCanvas() {
        this.shapes = [];
        this.saveShapes();
    }

    toggleAnimation() {
        this.isAnimating = !this.isAnimating;
        const btn = document.getElementById('startAnimationBtn');
        btn.textContent = this.isAnimating ? 'Stop Animation' : 'Start Animation';
        btn.classList.toggle('btn-secondary', !this.isAnimating);
        btn.classList.toggle('btn-primary', this.isAnimating);
    }

    resetView() {
        // Reset zoom and pan
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    selectPlatform(platform) {
        this.currentPlatform = platform;
        document.querySelectorAll('.platform-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-platform="${platform}"]`).classList.add('selected');

        // Update platform preview
        this.updatePlatformPreview();
    }

    updatePlatformPreview() {
        const viewport = document.querySelector('.platform-viewport');
        const deviceFrame = viewport.querySelector('.device-frame');

        // Remove existing frame
        if (deviceFrame) {
            deviceFrame.remove();
        }

        // Create new frame based on platform
        const frame = document.createElement('div');
        frame.className = 'device-frame';

        let frameStyle = '';
        switch (this.currentPlatform) {
            case 'mobile':
                frameStyle = 'width: 375px; height: 667px; border-width: 20px;';
                break;
            case 'tablet':
                frameStyle = 'width: 768px; height: 1024px; border-width: 30px;';
                break;
            case 'desktop':
                frameStyle = 'width: 100%; height: 100%; border-width: 0;';
                break;
            case 'web':
            default:
                frameStyle = 'width: 100%; height: 100%; border-width: 0;';
                break;
        }

        frame.style.cssText = frameStyle;

        // Create inner canvas for preview
        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = parseInt(frameStyle.match(/width:\s*(\d+)/)[1]) || this.canvas.width;
        previewCanvas.height = parseInt(frameStyle.match(/height:\s*(\d+)/)[1]) || this.canvas.height;
        previewCanvas.style.width = '100%';
        previewCanvas.style.height = '100%';

        frame.appendChild(previewCanvas);
        viewport.appendChild(frame);

        // Render preview
        const ctx = previewCanvas.getContext('2d');
        this.renderToContext(ctx, previewCanvas.width, previewCanvas.height);
    }

    changeRenderMode(e) {
        this.renderMode = e.target.value;
        if (this.renderMode === 'webgl' && !this.gl) {
            alert('WebGL is not supported in this browser.');
            e.target.value = '2d';
            this.renderMode = '2d';
        }
    }

    changeBackground(e) {
        this.canvas.style.backgroundColor = e.target.value;
    }

    updateGrid(e) {
        // Grid size changed, could update visual grid
    }

    toggleSnapToGrid(e) {
        this.snapToGrid = e.target.checked;
    }

    startRenderLoop() {
        const render = (currentTime) => {
            this.frameCount++;
            if (currentTime - this.lastTime >= 1000) {
                this.fpsDisplay = this.frameCount;
                this.frameCount = 0;
                this.lastTime = currentTime;
                this.updateFPSDisplay();
            }

            this.render();
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }

    render() {
        this.clear();

        if (this.renderMode === 'webgl' && this.gl) {
            this.renderWebGL();
        } else {
            this.render2D();
        }

        this.drawGrid();
        this.updateInfo();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    render2D() {
        this.shapes.forEach(shape => {
            this.ctx.save();
            this.ctx.translate(shape.x + (shape.width || shape.radius || 0) / 2,
                             shape.y + (shape.height || shape.radius || 0) / 2);
            this.ctx.rotate(shape.rotation);
            this.ctx.scale(shape.scale, shape.scale);

            this.ctx.fillStyle = shape.color;
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;

            switch (shape.type) {
                case 'rectangle':
                    this.ctx.fillRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
                    this.ctx.strokeRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
                    break;
                case 'circle':
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, shape.radius, 0, 2 * Math.PI);
                    this.ctx.fill();
                    this.ctx.stroke();
                    break;
                case 'triangle':
                    this.ctx.beginPath();
                    this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
                    this.ctx.lineTo(shape.points[1].x, shape.points[1].y);
                    this.ctx.lineTo(shape.points[2].x, shape.points[2].y);
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.stroke();
                    break;
            }

            if (shape === this.selectedShape) {
                this.drawSelectionBox(shape);
            }

            this.ctx.restore();
        });

        if (this.isAnimating) {
            this.animateShapes();
        }
    }

    renderWebGL() {
        // WebGL rendering implementation would go here
        // For now, fall back to 2D rendering
        this.render2D();
    }

    drawGrid() {
        const gridSize = parseInt(document.getElementById('gridSize').value);
        if (gridSize <= 0) return;

        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;

        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawSelectionBox(shape) {
        this.ctx.strokeStyle = '#007bff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);

        const bounds = this.getShapeBounds(shape);
        this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

        this.ctx.setLineDash([]);
    }

    getShapeBounds(shape) {
        switch (shape.type) {
            case 'rectangle':
                return { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
            case 'circle':
                return {
                    x: shape.x,
                    y: shape.y,
                    width: shape.radius * 2,
                    height: shape.radius * 2
                };
            case 'triangle':
                const xs = shape.points.map(p => p.x + shape.x);
                const ys = shape.points.map(p => p.y + shape.y);
                return {
                    x: Math.min(...xs),
                    y: Math.min(...ys),
                    width: Math.max(...xs) - Math.min(...xs),
                    height: Math.max(...ys) - Math.min(...ys)
                };
            default:
                return { x: 0, y: 0, width: 0, height: 0 };
        }
    }

    animateShapes() {
        this.shapes.forEach(shape => {
            shape.rotation += 0.01;
            if (shape.type === 'circle') {
                shape.radius += Math.sin(Date.now() * 0.001) * 0.5;
            }
        });
    }

    updateInfo() {
        const info = document.querySelector('.render-info');
        if (info) {
            info.innerHTML = `
                <div class="info-item">
                    <span class="info-label">FPS:</span>
                    <span>${this.fpsDisplay}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Shapes:</span>
                    <span>${this.shapes.length}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Platform:</span>
                    <span>${this.currentPlatform}</span>
                </div>
            `;
        }
    }

    updateFPSDisplay() {
        // FPS is updated in updateInfo()
    }

    exportImage() {
        const link = document.createElement('a');
        link.download = `rendering-${Date.now()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();

        this.addToExportHistory('Image', link.download);
    }

    exportVideo() {
        // Video export implementation would go here
        alert('Video export feature coming soon!');
    }

    exportCode() {
        const code = this.generateCode();
        const blob = new Blob([code], { type: 'text/plain' });
        const link = document.createElement('a');
        link.download = `rendering-code-${Date.now()}.js`;
        link.href = URL.createObjectURL(blob);
        link.click();

        this.addToExportHistory('Code', link.download);
    }

    generateCode() {
        let code = `// Generated rendering code\nconst canvas = document.getElementById('canvas');\nconst ctx = canvas.getContext('2d');\n\n`;

        this.shapes.forEach((shape, index) => {
            code += `// Shape ${index + 1}\n`;
            code += `ctx.fillStyle = '${shape.color}';\n`;
            code += `ctx.strokeStyle = '#000';\n`;
            code += `ctx.lineWidth = 2;\n`;

            switch (shape.type) {
                case 'rectangle':
                    code += `ctx.fillRect(${shape.x}, ${shape.y}, ${shape.width}, ${shape.height});\n`;
                    code += `ctx.strokeRect(${shape.x}, ${shape.y}, ${shape.width}, ${shape.height});\n`;
                    break;
                case 'circle':
                    code += `ctx.beginPath();\n`;
                    code += `ctx.arc(${shape.x + shape.radius}, ${shape.y + shape.radius}, ${shape.radius}, 0, 2 * Math.PI);\n`;
                    code += `ctx.fill();\n`;
                    code += `ctx.stroke();\n`;
                    break;
                case 'triangle':
                    code += `ctx.beginPath();\n`;
                    shape.points.forEach((point, i) => {
                        const cmd = i === 0 ? 'moveTo' : 'lineTo';
                        code += `ctx.${cmd}(${shape.x + point.x}, ${shape.y + point.y});\n`;
                    });
                    code += `ctx.closePath();\n`;
                    code += `ctx.fill();\n`;
                    code += `ctx.stroke();\n`;
                    break;
            }
            code += `\n`;
        });

        return code;
    }

    addToExportHistory(type, filename) {
        const historyList = document.querySelector('.history-list');
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <span>${type}: ${filename}</span>
            <span>${new Date().toLocaleTimeString()}</span>
        `;
        historyList.appendChild(item);
    }

    renderToContext(ctx, width, height) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = this.canvas.style.backgroundColor || '#f8f9fa';
        ctx.fillRect(0, 0, width, height);

        const scaleX = width / this.canvas.width;
        const scaleY = height / this.canvas.height;
        const scale = Math.min(scaleX, scaleY);

        ctx.save();
        ctx.scale(scale, scale);

        this.shapes.forEach(shape => {
            ctx.save();
            ctx.translate(shape.x + (shape.width || shape.radius || 0) / 2,
                         shape.y + (shape.height || shape.radius || 0) / 2);
            ctx.rotate(shape.rotation);
            ctx.scale(shape.scale, shape.scale);

            ctx.fillStyle = shape.color;
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;

            switch (shape.type) {
                case 'rectangle':
                    ctx.fillRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
                    ctx.strokeRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
                    break;
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(0, 0, shape.radius, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.stroke();
                    break;
                case 'triangle':
                    ctx.beginPath();
                    ctx.moveTo(shape.points[0].x, shape.points[0].y);
                    ctx.lineTo(shape.points[1].x, shape.points[1].y);
                    ctx.lineTo(shape.points[2].x, shape.points[2].y);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    break;
            }

            ctx.restore();
        });

        ctx.restore();
    }

    saveShapes() {
        localStorage.setItem('crossPlatformRenderer_shapes', JSON.stringify(this.shapes));
    }

    loadShapes() {
        const saved = localStorage.getItem('crossPlatformRenderer_shapes');
        if (saved) {
            this.shapes = JSON.parse(saved);
        }
    }

    loadSettings() {
        const settings = {
            renderMode: localStorage.getItem('renderMode') || '2d',
            backgroundColor: localStorage.getItem('backgroundColor') || '#f8f9fa',
            gridSize: localStorage.getItem('gridSize') || '20',
            snapToGrid: localStorage.getItem('snapToGrid') === 'true'
        };

        document.getElementById('renderMode').value = settings.renderMode;
        document.getElementById('backgroundColor').value = settings.backgroundColor;
        document.getElementById('gridSize').value = settings.gridSize;
        document.getElementById('snapToGrid').checked = settings.snapToGrid;

        this.renderMode = settings.renderMode;
        this.canvas.style.backgroundColor = settings.backgroundColor;
        this.snapToGrid = settings.snapToGrid;
    }

    saveSettings() {
        localStorage.setItem('renderMode', this.renderMode);
        localStorage.setItem('backgroundColor', document.getElementById('backgroundColor').value);
        localStorage.setItem('gridSize', document.getElementById('gridSize').value);
        localStorage.setItem('snapToGrid', document.getElementById('snapToGrid').checked);
    }
}

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const renderer = new CrossPlatformRenderer();

    // Navigation event listeners
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = e.target.dataset.section;
            showSection(sectionId);
        });
    });

    // Show default section
    showSection('renderer');

    // Save settings on change
    document.querySelectorAll('#settings input, #settings select').forEach(input => {
        input.addEventListener('change', () => renderer.saveSettings());
    });
});