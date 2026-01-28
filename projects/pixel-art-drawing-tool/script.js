document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('pixelCanvas');
    const colors = document.querySelectorAll('.color');
    const customColor = document.getElementById('customColor');
    const tools = document.querySelectorAll('.tool');
    const clearBtn = document.getElementById('clear');
    const exportBtn = document.getElementById('export');

    let currentColor = '#000000';
    let currentTool = 'pencil';
    let isDrawing = false;

    // Create 32x32 grid
    for (let i = 0; i < 32 * 32; i++) {
        const pixel = document.createElement('div');
        pixel.classList.add('pixel');
        pixel.dataset.index = i;
        canvas.appendChild(pixel);
    }

    const pixels = document.querySelectorAll('.pixel');

    // Color selection
    colors.forEach(color => {
        color.addEventListener('click', () => {
            currentColor = color.dataset.color;
            colors.forEach(c => c.classList.remove('selected'));
            color.classList.add('selected');
        });
    });

    customColor.addEventListener('input', (e) => {
        currentColor = e.target.value;
        colors.forEach(c => c.classList.remove('selected'));
    });

    // Tool selection
    tools.forEach(tool => {
        tool.addEventListener('click', () => {
            currentTool = tool.id;
            tools.forEach(t => t.classList.remove('active'));
            tool.classList.add('active');
        });
    });

    // Drawing functionality
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        draw(e);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDrawing) {
            draw(e);
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
    });

    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
    });

    function draw(e) {
        if (e.target.classList.contains('pixel')) {
            const pixel = e.target;
            if (currentTool === 'pencil') {
                pixel.style.backgroundColor = currentColor;
            } else if (currentTool === 'eraser') {
                pixel.style.backgroundColor = 'white';
            } else if (currentTool === 'fill') {
                fillArea(pixel);
            }
        }
    }

    function fillArea(startPixel) {
        const startColor = startPixel.style.backgroundColor || 'white';
        if (startColor === currentColor) return;

        const queue = [startPixel];
        const visited = new Set();

        while (queue.length > 0) {
            const pixel = queue.shift();
            const index = pixel.dataset.index;

            if (visited.has(index)) continue;
            visited.add(index);

            const color = pixel.style.backgroundColor || 'white';
            if (color !== startColor) continue;

            pixel.style.backgroundColor = currentColor;

            // Add adjacent pixels
            const row = Math.floor(index / 32);
            const col = index % 32;

            // Up
            if (row > 0) {
                const upIndex = (row - 1) * 32 + col;
                const upPixel = pixels[upIndex];
                if (!visited.has(upIndex.toString())) {
                    queue.push(upPixel);
                }
            }

            // Down
            if (row < 31) {
                const downIndex = (row + 1) * 32 + col;
                const downPixel = pixels[downIndex];
                if (!visited.has(downIndex.toString())) {
                    queue.push(downPixel);
                }
            }

            // Left
            if (col > 0) {
                const leftIndex = row * 32 + (col - 1);
                const leftPixel = pixels[leftIndex];
                if (!visited.has(leftIndex.toString())) {
                    queue.push(leftPixel);
                }
            }

            // Right
            if (col < 31) {
                const rightIndex = row * 32 + (col + 1);
                const rightPixel = pixels[rightIndex];
                if (!visited.has(rightIndex.toString())) {
                    queue.push(rightPixel);
                }
            }
        }
    }

    // Clear canvas
    clearBtn.addEventListener('click', () => {
        pixels.forEach(pixel => {
            pixel.style.backgroundColor = 'white';
        });
    });

    // Export as PNG
    exportBtn.addEventListener('click', () => {
        // Create a temporary canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 512;
        tempCanvas.height = 512;
        const ctx = tempCanvas.getContext('2d');

        // Draw each pixel
        pixels.forEach((pixel, index) => {
            const row = Math.floor(index / 32);
            const col = index % 32;
            const color = pixel.style.backgroundColor || 'white';
            ctx.fillStyle = color;
            ctx.fillRect(col * 16, row * 16, 16, 16);
        });

        // Create download link
        const link = document.createElement('a');
        link.download = 'pixel-art.png';
        link.href = tempCanvas.toDataURL();
        link.click();
    });
});