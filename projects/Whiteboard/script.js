document.addEventListener('DOMContentLoaded', function() {
    // Get canvas and context
    const canvas = document.getElementById('whiteboard');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = window.innerWidth - 250; // Account for sidebar
    canvas.height = window.innerHeight - 150; // Account for header and footer
    
    // Drawing state
    let drawing = false;
    let currentTool = 'brush';
    let currentColor = '#000000';
    let brushSize = 5;
    let startX, startY;
    let history = [];
    let historyIndex = -1;
    let isPanning = false;
    let offsetX = 0;
    let offsetY = 0;
    let scale = 1;
    let showGrid = true;
    
    // Update UI elements
    const currentToolElement = document.getElementById('currentTool');
    const currentSizeElement = document.getElementById('currentSize');
    const mousePosElement = document.getElementById('mousePos');
    const brushSizeSlider = document.getElementById('brushSize');
    const sizeValueElement = document.getElementById('sizeValue');
    
    // Initialize
    resizeCanvas();
    drawGrid();
    
    // Event Listeners for Tools
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentTool = this.dataset.tool;
            currentToolElement.textContent = currentTool.charAt(0).toUpperCase() + currentTool.slice(1);
            canvas.style.cursor = currentTool === 'eraser' ? 'cell' : 'crosshair';
        });
    });
    
    // Event Listeners for Colors
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentColor = this.style.backgroundColor || '#000000';
        });
    });
    
    // Color picker
    const colorPicker = document.getElementById('colorPicker');
    colorPicker.addEventListener('input', function() {
        currentColor = this.value;
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    });
    
    // Brush size
    brushSizeSlider.addEventListener('input', function() {
        brushSize = parseInt(this.value);
        sizeValueElement.textContent = brushSize + 'px';
        currentSizeElement.textContent = brushSize + 'px';
    });
    
    // Clear button
    document.getElementById('clearBtn').addEventListener('click', function() {
        if (confirm('Clear the entire canvas?')) {
            saveState();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawGrid();
        }
    });
    
    // Save button
    document.getElementById('saveBtn').addEventListener('click', function() {
        const link = document.createElement('a');
        link.download = 'whiteboard-drawing.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
    
    // Grid toggle
    document.getElementById('gridToggle').addEventListener('click', function() {
        showGrid = !showGrid;
        redrawCanvas();
        this.classList.toggle('active');
    });
    
    // Undo/Redo
    document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('redoBtn').addEventListener('click', redo);
    
    // Zoom buttons
    document.getElementById('zoomInBtn').addEventListener('click', () => zoom(1.2));
    document.getElementById('zoomOutBtn').addEventListener('click', () => zoom(0.8));
    
    // Canvas event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    
    // Pan with middle mouse button
    canvas.addEventListener('mousedown', function(e) {
        if (e.button === 1) { // Middle mouse button
            isPanning = true;
            canvas.style.cursor = 'grabbing';
        }
    });
    
    canvas.addEventListener('mousemove', function(e) {
        if (isPanning) {
            offsetX += e.movementX;
            offsetY += e.movementY;
            redrawCanvas();
        }
        
        // Update mouse position display
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        mousePosElement.textContent = `${Math.round(x)}, ${Math.round(y)}`;
    });
    
    canvas.addEventListener('mouseup', function(e) {
        if (e.button === 1) {
            isPanning = false;
            canvas.style.cursor = currentTool === 'eraser' ? 'cell' : 'crosshair';
        }
    });
    
    // Zoom with mouse wheel
    canvas.addEventListener('wheel', function(e) {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        zoom(zoomFactor);
    });
    
    // Window resize
    window.addEventListener('resize', function() {
        resizeCanvas();
        redrawCanvas();
    });
    
    // Functions
    function resizeCanvas() {
        canvas.width = window.innerWidth - 250;
        canvas.height = window.innerHeight - 150;
        redrawCanvas();
    }
    
    function startDrawing(e) {
        if (isPanning) return;
        
        drawing = true;
        const coords = getCoordinates(e);
        startX = coords.x;
        startY = coords.y;
        
        if (currentTool === 'text') {
            const text = prompt('Enter text:', 'Hello');
            if (text) {
                saveState();
                ctx.font = `${brushSize * 3}px Arial`;
                ctx.fillStyle = currentColor;
                ctx.fillText(text, startX, startY);
            }
        } else {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
        }
    }
    
    function draw(e) {
        if (!drawing || isPanning) return;
        
        const coords = getCoordinates(e);
        const x = coords.x;
        const y = coords.y;
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (currentTool === 'brush') {
            ctx.lineWidth = brushSize;
            ctx.strokeStyle = currentColor;
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (currentTool === 'eraser') {
            ctx.lineWidth = brushSize * 2;
            ctx.strokeStyle = '#ffffff';
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (currentTool === 'line') {
            redrawCanvas();
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(x, y);
            ctx.lineWidth = brushSize;
            ctx.strokeStyle = currentColor;
            ctx.stroke();
        } else if (currentTool === 'rect') {
            redrawCanvas();
            const width = x - startX;
            const height = y - startY;
            ctx.lineWidth = brushSize;
            ctx.strokeStyle = currentColor;
            ctx.strokeRect(startX, startY, width, height);
        } else if (currentTool === 'circle') {
            redrawCanvas();
            const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, Math.PI * 2);
            ctx.lineWidth = brushSize;
            ctx.strokeStyle = currentColor;
            ctx.stroke();
        }
    }
    
    function stopDrawing() {
        if (drawing && currentTool !== 'text') {
            saveState();
        }
        drawing = false;
        ctx.beginPath();
    }
    
    function getCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        let x, y;
        
        if (e.type.includes('touch')) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        
        // Apply pan and zoom transformations
        x = (x - offsetX) / scale;
        y = (y - offsetY) / scale;
        
        return { x, y };
    }
    
    function drawGrid() {
        if (!showGrid) return;
        
        const gridSize = 20 * scale;
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Vertical lines
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
    }
    
    function redrawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Restore from history if available
        if (history.length > 0 && historyIndex >= 0) {
            const img = new Image();
            img.src = history[historyIndex];
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
                drawGrid();
            };
        } else {
            drawGrid();
        }
    }
    
    function saveState() {
        // Remove any future states if we're not at the end
        history = history.slice(0, historyIndex + 1);
        
        // Save current state
        history.push(canvas.toDataURL());
        historyIndex++;
        
        // Limit history to 50 states
        if (history.length > 50) {
            history.shift();
            historyIndex--;
        }
    }
    
    function undo() {
        if (historyIndex > 0) {
            historyIndex--;
            redrawCanvas();
        }
    }
    
    function redo() {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            redrawCanvas();
        }
    }
    
    function zoom(factor) {
        scale *= factor;
        redrawCanvas();
        
        // Update zoom display
        document.getElementById('zoomInfo').textContent = Math.round(scale * 100) + '%';
    }
    
    // Touch event handlers
    function handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }
    
    function handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }
    
    function handleTouchEnd(e) {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        canvas.dispatchEvent(mouseEvent);
    }
    
    // Add zoom info element to footer
    const footer = document.querySelector('footer p');
    const zoomInfo = document.createElement('span');
    zoomInfo.id = 'zoomInfo';
    zoomInfo.textContent = '100%';
    zoomInfo.style.marginLeft = '10px';
    zoomInfo.style.fontWeight = 'bold';
    zoomInfo.style.color = '#38a169';
    footer.innerHTML += ' | Zoom: ';
    footer.appendChild(zoomInfo);
});