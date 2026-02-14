        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const canvas = document.getElementById('mandala-canvas');
            const ctx = canvas.getContext('2d');
            const savedCanvas = document.getElementById('saved-image');
            const savedCtx = savedCanvas.getContext('2d');
            const brushSizeSlider = document.getElementById('brush-size');
            const brushSizeValue = document.getElementById('brush-size-value');
            const brushSizeDisplay = document.getElementById('brush-size-display');
            const opacitySlider = document.getElementById('brush-opacity');
            const opacityValue = document.getElementById('opacity-value');
            const opacityDisplay = document.getElementById('opacity-display');
            const symmetrySlider = document.getElementById('symmetry-count');
            const symmetryValue = document.getElementById('symmetry-value');
            const symmetryDisplay = document.getElementById('symmetry-display');
            const symmetryDots = document.getElementById('symmetry-dots');
            const colorOptions = document.querySelectorAll('.color-option');
            const customColorPicker = document.getElementById('custom-color');
            const toolButtons = document.querySelectorAll('.tool-btn');
            const clearCanvasBtn = document.getElementById('clear-canvas');
            const saveMandalaBtn = document.getElementById('save-mandala');
            const undoBtn = document.getElementById('undo-btn');
            const redoBtn = document.getElementById('redo-btn');
            const resetViewBtn = document.getElementById('reset-view');
            const closeModalBtn = document.getElementById('close-modal');
            const shareMandalaBtn = document.getElementById('share-mandala');
            const saveModal = document.getElementById('save-modal');
            const templateCards = document.querySelectorAll('.template-card');
            
            // Drawing state
            let drawing = false;
            let currentTool = 'brush';
            let currentColor = '#8b5cf6';
            let brushSize = 5;
            let opacity = 1.0;
            let symmetry = 8;
            let lastX = 0;
            let lastY = 0;
            let canvasOffsetX = 0;
            let canvasOffsetY = 0;
            let scale = 1;
            
            // History for undo/redo
            let history = [];
            let historyIndex = -1;
            const MAX_HISTORY = 20;
            
            // Initialize canvas
            function initCanvas() {
                // Set canvas size to match container
                const container = canvas.parentElement;
                const size = Math.min(container.clientWidth, container.clientHeight) - 50;
                canvas.width = size;
                canvas.height = size;
                
                // Clear canvas with dark background
                ctx.fillStyle = '#0a0a15';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw center point
                drawCenterPoint();
                
                // Draw symmetry guides
                drawSymmetryGuides();
                
                // Initialize history
                saveToHistory();
                
                // Initialize grid
                drawGrid();
            }
            
            // Draw grid
            function drawGrid() {
                const grid = document.getElementById('canvas-grid');
                grid.innerHTML = '';
                
                const size = canvas.width;
                const cellSize = 50;
                const cols = Math.ceil(size / cellSize);
                const rows = Math.ceil(size / cellSize);
                
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('width', '100%');
                svg.setAttribute('height', '100%');
                
                // Draw vertical lines
                for (let i = 0; i <= cols; i++) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', (i * cellSize) + 'px');
                    line.setAttribute('y1', '0');
                    line.setAttribute('x2', (i * cellSize) + 'px');
                    line.setAttribute('y2', '100%');
                    line.setAttribute('stroke', 'rgba(255, 255, 255, 0.1)');
                    line.setAttribute('stroke-width', '1');
                    svg.appendChild(line);
                }
                
                // Draw horizontal lines
                for (let i = 0; i <= rows; i++) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', '0');
                    line.setAttribute('y1', (i * cellSize) + 'px');
                    line.setAttribute('x2', '100%');
                    line.setAttribute('y2', (i * cellSize) + 'px');
                    line.setAttribute('stroke', 'rgba(255, 255, 255, 0.1)');
                    line.setAttribute('stroke-width', '1');
                    svg.appendChild(line);
                }
                
                // Draw center lines
                const centerLineX = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                centerLineX.setAttribute('x1', '50%');
                centerLineX.setAttribute('y1', '0');
                centerLineX.setAttribute('x2', '50%');
                centerLineX.setAttribute('y2', '100%');
                centerLineX.setAttribute('stroke', 'rgba(139, 92, 246, 0.3)');
                centerLineX.setAttribute('stroke-width', '2');
                svg.appendChild(centerLineX);
                
                const centerLineY = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                centerLineY.setAttribute('x1', '0');
                centerLineY.setAttribute('y1', '50%');
                centerLineY.setAttribute('x2', '100%');
                centerLineY.setAttribute('y2', '50%');
                centerLineY.setAttribute('stroke', 'rgba(139, 92, 246, 0.3)');
                centerLineY.setAttribute('stroke-width', '2');
                svg.appendChild(centerLineY);
                
                grid.appendChild(svg);
            }
            
            // Draw center point
            function drawCenterPoint() {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            
            // Draw symmetry guides
            function drawSymmetryGuides() {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const radius = Math.min(canvas.width, canvas.height) / 2 - 20;
                
                ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
                ctx.lineWidth = 1;
                
                const angleStep = (2 * Math.PI) / symmetry;
                
                for (let i = 0; i < symmetry; i++) {
                    const angle = i * angleStep;
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);
                    
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
                
                // Draw outer circle
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Update symmetry dots visualizer
            function updateSymmetryDots() {
                symmetryDots.innerHTML = '';
                
                for (let i = 0; i < 16; i++) {
                    const dot = document.createElement('div');
                    dot.className = 'symmetry-dot';
                    if (i < symmetry) {
                        dot.classList.add('active');
                    }
                    symmetryDots.appendChild(dot);
                }
            }
            
            // Initialize template patterns
            function initTemplates() {
                templateCards.forEach(card => {
                    const pattern = card.querySelector('.mandala-pattern');
                    const rays = symmetry; // Use current symmetry value
                    
                    // Clear existing rays
                    pattern.innerHTML = '';
                    
                    // Add rays
                    const angleStep = 360 / rays;
                    for (let i = 0; i < rays; i++) {
                        const ray = document.createElement('div');
                        ray.className = 'mandala-ray';
                        ray.style.transform = `rotate(${i * angleStep}deg)`;
                        pattern.appendChild(ray);
                    }
                });
            }
            
            // Save canvas state to history
            function saveToHistory() {
                // Remove any future states if we're not at the end
                if (historyIndex < history.length - 1) {
                    history = history.slice(0, historyIndex + 1);
                }
                
                // Save current canvas state
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                history.push(imageData);
                historyIndex++;
                
                // Limit history size
                if (history.length > MAX_HISTORY) {
                    history.shift();
                    historyIndex--;
                }
                
                // Update undo/redo button states
                updateUndoRedoButtons();
            }
            
            // Update undo/redo button states
            function updateUndoRedoButtons() {
                undoBtn.disabled = historyIndex <= 0;
                redoBtn.disabled = historyIndex >= history.length - 1;
            }
            
            // Undo last action
            function undo() {
                if (historyIndex > 0) {
                    historyIndex--;
                    const imageData = history[historyIndex];
                    ctx.putImageData(imageData, 0, 0);
                    updateUndoRedoButtons();
                }
            }
            
            // Redo last undone action
            function redo() {
                if (historyIndex < history.length - 1) {
                    historyIndex++;
                    const imageData = history[historyIndex];
                    ctx.putImageData(imageData, 0, 0);
                    updateUndoRedoButtons();
                }
            }
            
            // Draw with symmetry
            function drawSymmetrically(x, y, drawFunction) {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const angleStep = (2 * Math.PI) / symmetry;
                
                for (let i = 0; i < symmetry; i++) {
                    ctx.save();
                    
                    // Translate to center
                    ctx.translate(centerX, centerY);
                    
                    // Rotate for this section
                    ctx.rotate(i * angleStep);
                    
                    // Translate back and apply drawing
                    ctx.translate(-centerX, -centerY);
                    
                    // Call the drawing function
                    drawFunction(x, y);
                    
                    ctx.restore();
                }
            }
            
            // Start drawing
            function startDrawing(e) {
                drawing = true;
                const rect = canvas.getBoundingClientRect();
                lastX = (e.clientX - rect.left) / scale;
                lastY = (e.clientY - rect.top) / scale;
                
                if (currentTool === 'brush' || currentTool === 'eraser') {
                    draw(e);
                }
            }
            
            // Draw
            function draw(e) {
                if (!drawing) return;
                
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) / scale;
                const y = (e.clientY - rect.top) / scale;
                
                ctx.globalAlpha = opacity;
                
                if (currentTool === 'brush') {
                    ctx.strokeStyle = currentColor;
                    ctx.fillStyle = currentColor;
                    ctx.lineWidth = brushSize;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    
                    drawSymmetrically(x, y, (symX, symY) => {
                        ctx.beginPath();
                        ctx.moveTo(lastX, lastY);
                        ctx.lineTo(symX, symY);
                        ctx.stroke();
                        
                        // Draw dots at the ends for smoother lines
                        ctx.beginPath();
                        ctx.arc(symX, symY, brushSize / 2, 0, Math.PI * 2);
                        ctx.fill();
                    });
                } 
                else if (currentTool === 'eraser') {
                    ctx.strokeStyle = '#0a0a15';
                    ctx.fillStyle = '#0a0a15';
                    ctx.lineWidth = brushSize;
                    ctx.lineCap = 'round';
                    
                    drawSymmetrically(x, y, (symX, symY) => {
                        ctx.beginPath();
                        ctx.moveTo(lastX, lastY);
                        ctx.lineTo(symX, symY);
                        ctx.stroke();
                    });
                }
                else if (currentTool === 'line') {
                    // For line tool, we'll draw on mouse up
                }
                else if (currentTool === 'circle') {
                    // For circle tool, we'll draw on mouse up
                }
                else if (currentTool === 'square') {
                    // For square tool, we'll draw on mouse up
                }
                
                lastX = x;
                lastY = y;
            }
            
            // Stop drawing
            function stopDrawing() {
                if (drawing) {
                    drawing = false;
                    saveToHistory();
                }
            }
            
            // Draw shape on mouse up
            function drawShape(startX, startY, endX, endY) {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                
                ctx.globalAlpha = opacity;
                ctx.strokeStyle = currentColor;
                ctx.fillStyle = currentColor;
                ctx.lineWidth = brushSize;
                
                if (currentTool === 'line') {
                    drawSymmetrically(endX, endY, (symX, symY) => {
                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        ctx.lineTo(symX, symY);
                        ctx.stroke();
                    });
                }
                else if (currentTool === 'circle') {
                    const radius = Math.sqrt(
                        Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
                    );
                    
                    drawSymmetrically(startX, startY, (symX, symY) => {
                        ctx.beginPath();
                        ctx.arc(symX, symY, radius, 0, Math.PI * 2);
                        ctx.stroke();
                    });
                }
                else if (currentTool === 'square') {
                    const size = Math.max(
                        Math.abs(endX - startX),
                        Math.abs(endY - startY)
                    );
                    
                    drawSymmetrically(startX, startY, (symX, symY) => {
                        ctx.beginPath();
                        ctx.rect(symX - size/2, symY - size/2, size, size);
                        ctx.stroke();
                    });
                }
            }
            
            // Fill tool
            function fillArea(x, y) {
                // For simplicity, we'll fill the entire canvas with the current color
                // In a more advanced version, you would implement flood fill algorithm
                ctx.globalAlpha = opacity;
                ctx.fillStyle = currentColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Redraw center and guides
                drawCenterPoint();
                drawSymmetryGuides();
            }
            
            // Clear canvas
            function clearCanvas() {
                if (confirm("Are you sure you want to clear the canvas?")) {
                    ctx.fillStyle = '#0a0a15';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    drawCenterPoint();
                    drawSymmetryGuides();
                    saveToHistory();
                }
            }
            
            // Save mandala as image
            function saveMandala() {
                // Copy canvas to saved canvas
                savedCtx.fillStyle = '#0a0a15';
                savedCtx.fillRect(0, 0, savedCanvas.width, savedCanvas.height);
                savedCtx.drawImage(canvas, 0, 0, savedCanvas.width, savedCanvas.height);
                
                // Show modal
                saveModal.style.display = 'flex';
            }
            
            // Share mandala
            function shareMandala() {
                savedCanvas.toBlob(function(blob) {
                    if (navigator.share && navigator.canShare) {
                        const file = new File([blob], 'mandala.png', { type: 'image/png' });
                        
                        if (navigator.canShare({ files: [file] })) {
                            navigator.share({
                                files: [file],
                                title: 'My Digital Mandala',
                                text: 'Check out this mandala I created with the Digital Mandala Creator!'
                            })
                            .catch(error => console.log('Sharing failed:', error));
                        } else {
                            // Fallback: download
                            const link = document.createElement('a');
                            link.download = 'mandala.png';
                            link.href = savedCanvas.toDataURL('image/png');
                            link.click();
                        }
                    } else {
                        // Fallback: download
                        const link = document.createElement('a');
                        link.download = 'mandala.png';
                        link.href = savedCanvas.toDataURL('image/png');
                        link.click();
                    }
                }, 'image/png');
            }
            
            // Apply template
            function applyTemplate(templateName) {
                // Clear canvas first
                ctx.fillStyle = '#0a0a15';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const maxRadius = Math.min(canvas.width, canvas.height) / 2 - 30;
                
                ctx.strokeStyle = currentColor;
                ctx.fillStyle = currentColor;
                ctx.lineWidth = 3;
                ctx.globalAlpha = 1.0;
                
                switch(templateName) {
                    case 'basic':
                        // Draw concentric circles
                        for (let i = 1; i <= 5; i++) {
                            const radius = (maxRadius / 5) * i;
                            ctx.beginPath();
                            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                            ctx.stroke();
                        }
                        break;
                        
                    case 'floral':
                        // Draw flower-like pattern
                        const petals = 8;
                        const petalAngle = (2 * Math.PI) / petals;
                        
                        for (let i = 0; i < petals; i++) {
                            ctx.save();
                            ctx.translate(centerX, centerY);
                            ctx.rotate(i * petalAngle);
                            
                            // Draw petal
                            ctx.beginPath();
                            ctx.ellipse(0, maxRadius * 0.6, maxRadius * 0.3, maxRadius * 0.6, 0, 0, Math.PI * 2);
                            ctx.stroke();
                            
                            ctx.restore();
                        }
                        break;
                        
                    case 'geometric':
                        // Draw geometric pattern
                        for (let i = 0; i < symmetry; i++) {
                            ctx.save();
                            ctx.translate(centerX, centerY);
                            ctx.rotate(i * (2 * Math.PI / symmetry));
                            
                            // Draw triangle
                            ctx.beginPath();
                            ctx.moveTo(0, 0);
                            ctx.lineTo(maxRadius * 0.7, 0);
                            ctx.lineTo(0, maxRadius * 0.4);
                            ctx.closePath();
                            ctx.stroke();
                            
                            ctx.restore();
                        }
                        break;
                        
                    case 'lotus':
                        // Draw lotus pattern
                        const lotusLayers = 3;
                        for (let layer = 0; layer < lotusLayers; layer++) {
                            const layerRadius = maxRadius * (0.3 + layer * 0.2);
                            const layerPetals = 8 + layer * 4;
                            const layerAngle = (2 * Math.PI) / layerPetals;
                            
                            for (let i = 0; i < layerPetals; i++) {
                                ctx.save();
                                ctx.translate(centerX, centerY);
                                ctx.rotate(i * layerAngle);
                                
                                // Draw lotus petal
                                ctx.beginPath();
                                ctx.ellipse(0, layerRadius, layerRadius * 0.4, layerRadius * 0.2, 0, 0, Math.PI * 2);
                                ctx.stroke();
                                
                                ctx.restore();
                            }
                        }
                        break;
                        
                    case 'radial':
                        // Draw radial lines
                        for (let i = 0; i < symmetry; i++) {
                            ctx.save();
                            ctx.translate(centerX, centerY);
                            ctx.rotate(i * (2 * Math.PI / symmetry));
                            
                            // Draw line
                            ctx.beginPath();
                            ctx.moveTo(0, 0);
                            ctx.lineTo(maxRadius, 0);
                            ctx.stroke();
                            
                            // Draw dots along the line
                            for (let j = 1; j <= 5; j++) {
                                const dotRadius = 5;
                                const dotX = (maxRadius / 6) * j;
                                ctx.beginPath();
                                ctx.arc(dotX, 0, dotRadius, 0, Math.PI * 2);
                                ctx.fill();
                            }
                            
                            ctx.restore();
                        }
                        break;
                        
                    case 'star':
                        // Draw star pattern
                        const starPoints = 8;
                        const starAngle = (2 * Math.PI) / starPoints;
                        
                        for (let i = 0; i < starPoints; i++) {
                            ctx.save();
                            ctx.translate(centerX, centerY);
                            ctx.rotate(i * starAngle);
                            
                            // Draw star point
                            ctx.beginPath();
                            ctx.moveTo(0, 0);
                            ctx.lineTo(maxRadius * 0.8, 0);
                            ctx.lineTo(maxRadius * 0.4, maxRadius * 0.4);
                            ctx.closePath();
                            ctx.stroke();
                            
                            ctx.restore();
                        }
                        break;
                }
                
                drawCenterPoint();
                saveToHistory();
            }
            
            // Event Listeners
            
            // Brush size slider
            brushSizeSlider.addEventListener('input', function() {
                brushSize = parseInt(this.value);
                brushSizeValue.textContent = brushSize;
                brushSizeDisplay.textContent = brushSize;
            });
            
            // Opacity slider
            opacitySlider.addEventListener('input', function() {
                opacity = parseInt(this.value) / 100;
                opacityValue.textContent = this.value;
                opacityDisplay.textContent = this.value + '%';
            });
            
            // Symmetry slider
            symmetrySlider.addEventListener('input', function() {
                symmetry = parseInt(this.value);
                symmetryValue.textContent = symmetry;
                symmetryDisplay.textContent = symmetry;
                
                // Update symmetry guides
                ctx.fillStyle = '#0a0a15';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                drawCenterPoint();
                drawSymmetryGuides();
                
                // Update symmetry dots
                updateSymmetryDots();
                
                // Update template patterns
                initTemplates();
            });
            
            // Color options
            colorOptions.forEach(option => {
                option.addEventListener('click', function() {
                    colorOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');
                    currentColor = this.getAttribute('data-color');
                    customColorPicker.value = currentColor;
                });
            });
            
            // Custom color picker
            customColorPicker.addEventListener('input', function() {
                currentColor = this.value;
                
                // Find and activate matching color option, or deactivate all
                let foundMatch = false;
                colorOptions.forEach(option => {
                    if (option.getAttribute('data-color') === currentColor) {
                        option.classList.add('active');
                        foundMatch = true;
                    } else {
                        option.classList.remove('active');
                    }
                });
                
                // If no match found, deactivate all color options
                if (!foundMatch) {
                    colorOptions.forEach(option => option.classList.remove('active'));
                }
            });
            
            // Tool buttons
            toolButtons.forEach(button => {
                button.addEventListener('click', function() {
                    toolButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    currentTool = this.getAttribute('data-tool');
                });
            });
            
            // Canvas events
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseout', stopDrawing);
            
            // Touch events for mobile
            canvas.addEventListener('touchstart', function(e) {
                e.preventDefault();
                const touch = e.touches[0];
                startDrawing(touch);
            });
            
            canvas.addEventListener('touchmove', function(e) {
                e.preventDefault();
                const touch = e.touches[0];
                draw(touch);
            });
            
            canvas.addEventListener('touchend', stopDrawing);
            
            // Clear canvas button
            clearCanvasBtn.addEventListener('click', clearCanvas);
            
            // Save mandala button
            saveMandalaBtn.addEventListener('click', saveMandala);
            
            // Undo/redo buttons
            undoBtn.addEventListener('click', undo);
            redoBtn.addEventListener('click', redo);
            
            // Reset view button
            resetViewBtn.addEventListener('click', function() {
                // Reset any view transformations (zoom/pan) if implemented
                // For now, just reinitialize canvas
                initCanvas();
            });
            
            // Close modal button
            closeModalBtn.addEventListener('click', function() {
                saveModal.style.display = 'none';
            });
            
            // Share mandala button
            shareMandalaBtn.addEventListener('click', shareMandala);
            
            // Template cards
            templateCards.forEach(card => {
                card.addEventListener('click', function() {
                    const templateName = this.getAttribute('data-template');
                    
                    // Update color based on template
                    const patternColor = this.querySelector('.mandala-pattern').style.color;
                    currentColor = patternColor;
                    customColorPicker.value = patternColor;
                    
                    // Update color options
                    colorOptions.forEach(option => {
                        if (option.getAttribute('data-color') === patternColor) {
                            option.classList.add('active');
                        } else {
                            option.classList.remove('active');
                        }
                    });
                    
                    applyTemplate(templateName);
                });
            });
            
            // Initialize everything
            initCanvas();
            updateSymmetryDots();
            initTemplates();
            updateUndoRedoButtons();
            
            // Handle window resize
            window.addEventListener('resize', function() {
                initCanvas();
                drawGrid();
            });
        });