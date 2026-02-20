    (function() {
        // state
        let gridSize = 16;                 // current size (n x n)
        let pixels = [];                   // flat array of colors (hex strings)
        let isDrawing = false;              // for drag painting
        let currentColor = '#3366cc';       

        // DOM elements
        const gridContainer = document.getElementById('pixelGrid');
        const colorPicker = document.getElementById('colorPicker');
        const currentColorBox = document.getElementById('currentColorBox');
        const fillBtn = document.getElementById('fillBtn');
        const clearBtn = document.getElementById('clearBtn');
        const resizeBtn = document.getElementById('resizeBtn');
        const gridSizeInput = document.getElementById('gridSize');
        const saveBtn = document.getElementById('saveBtn');
        const exportJsonBtn = document.getElementById('exportJsonBtn');
        const importBtn = document.getElementById('importBtn');
        const fileInput = document.getElementById('importFile');

        // ---- init helpers ----
        function initPixelsArray(size, initialColor = '#f0f0f0') {
            return new Array(size * size).fill(initialColor);
        }

        // render grid based on current pixels array and gridSize
        function renderGrid() {
            gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
            gridContainer.innerHTML = ''; // clear

            for (let i = 0; i < pixels.length; i++) {
                const pixel = document.createElement('div');
                pixel.className = 'pixel';
                pixel.style.backgroundColor = pixels[i];
                pixel.dataset.index = i;

                // mouse events for drawing
                pixel.addEventListener('mousedown', (e) => {
                    e.preventDefault(); // prevent drag selection
                    isDrawing = true;
                    const idx = e.target.dataset.index;
                    if (idx !== undefined) {
                        pixels[idx] = currentColor;
                        e.target.style.backgroundColor = currentColor;
                    }
                });

                pixel.addEventListener('mouseenter', (e) => {
                    if (!isDrawing) return;
                    const idx = e.target.dataset.index;
                    if (idx !== undefined) {
                        pixels[idx] = currentColor;
                        e.target.style.backgroundColor = currentColor;
                    }
                });

                pixel.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    const target = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (target && target.classList.contains('pixel')) {
                        const idx = target.dataset.index;
                        if (idx !== undefined) {
                            pixels[idx] = currentColor;
                            target.style.backgroundColor = currentColor;
                        }
                    }
                    isDrawing = true;
                }, { passive: false });

                pixel.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                    if (!isDrawing) return;
                    const touch = e.touches[0];
                    const target = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (target && target.classList.contains('pixel')) {
                        const idx = target.dataset.index;
                        if (idx !== undefined) {
                            pixels[idx] = currentColor;
                            target.style.backgroundColor = currentColor;
                        }
                    }
                }, { passive: false });

                gridContainer.appendChild(pixel);
            }
        }

        // rebuild entire grid with new size & reset pixels to default
        function resizeGrid(newSize) {
            gridSize = newSize;
            pixels = initPixelsArray(gridSize, '#f0f0f0'); // light grey default
            renderGrid();
        }

        // ---- initialization (default 16x16) ----
        pixels = initPixelsArray(16, '#f0f0f0');
        renderGrid();

        // ---- color management ----
        colorPicker.addEventListener('input', (e) => {
            currentColor = e.target.value;
            currentColorBox.style.backgroundColor = currentColor;
        });
        // set initial color box
        currentColorBox.style.backgroundColor = colorPicker.value;

        // ---- fill all ----
        fillBtn.addEventListener('click', () => {
            const newColor = currentColor;
            for (let i = 0; i < pixels.length; i++) {
                pixels[i] = newColor;
            }
            // update all pixel divs
            document.querySelectorAll('.pixel').forEach((pixel, idx) => {
                pixel.style.backgroundColor = newColor;
            });
        });

        // ---- clear grid (set to default off-white) ----
        clearBtn.addEventListener('click', () => {
            const defaultColor = '#f0f0f0';
            for (let i = 0; i < pixels.length; i++) {
                pixels[i] = defaultColor;
            }
            document.querySelectorAll('.pixel').forEach((pixel) => {
                pixel.style.backgroundColor = defaultColor;
            });
        });

        // ---- resize button ----
        resizeBtn.addEventListener('click', () => {
            let newSize = parseInt(gridSizeInput.value, 10);
            if (isNaN(newSize) || newSize < 4) newSize = 4;
            if (newSize > 32) newSize = 32;
            gridSizeInput.value = newSize;  // correct if out of range
            resizeGrid(newSize);
        });

        // ---- stop drawing when mouse up / leave window ----
        window.addEventListener('mouseup', () => { isDrawing = false; });
        window.addEventListener('touchend', (e) => { 
            e.preventDefault(); 
            isDrawing = false; 
        }, { passive: false });
        window.addEventListener('touchcancel', (e) => { isDrawing = false; });

        // prevent dragging on grid container
        gridContainer.addEventListener('dragstart', (e) => e.preventDefault());

        // ---- SAVE AS PNG (using canvas) ----
        function downloadPNG() {
            const cellSize = 20; // each pixel block in output image
            const canvas = document.createElement('canvas');
            canvas.width = gridSize * cellSize;
            canvas.height = gridSize * cellSize;
            const ctx = canvas.getContext('2d');

            for (let row = 0; row < gridSize; row++) {
                for (let col = 0; col < gridSize; col++) {
                    const idx = row * gridSize + col;
                    ctx.fillStyle = pixels[idx];
                    ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                }
            }

            // download
            const link = document.createElement('a');
            link.download = `pixelart_${gridSize}x${gridSize}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }

        saveBtn.addEventListener('click', downloadPNG);

        // ---- EXPORT AS JSON (only colors array + size) ----
        function exportJSON() {
            const data = {
                size: gridSize,
                pixels: pixels,  // full array of hex strings
                version: 'pixel-forge-1'
            };
            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `pixelart_${gridSize}x${gridSize}.json`;
            link.click();
            URL.revokeObjectURL(url);
        }

        exportJsonBtn.addEventListener('click', exportJSON);

        // ---- IMPORT JSON ----
        importBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target.result);
                    if (json.size && json.pixels && Array.isArray(json.pixels) && json.pixels.length === json.size * json.size) {
                        // valid
                        gridSize = json.size;
                        pixels = json.pixels.slice(); // copy
                        gridSizeInput.value = gridSize;
                        renderGrid();  // rebuild with imported colors
                    } else {
                        alert('Invalid file format: must contain "size" and "pixels" array of length size*size');
                    }
                } catch (err) {
                    alert('Error parsing JSON: ' + err.message);
                }
                fileInput.value = ''; // allow re-upload same file
            };
            reader.readAsText(file);
        });

        // optional: stop drawing if mouse leaves grid container (avoid stuck drawing)
        gridContainer.addEventListener('mouseleave', () => {
            isDrawing = false;
        });

        // Additional touch fix: disable page scroll when touching grid
        gridContainer.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        gridContainer.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    })();