/**
 * Fractal-Explorer Engine
 * Renders the Mandelbrot set using pixel manipulation on HTML5 Canvas.
 * Optimized with adaptive resolution (low-res during interaction).
 */

// --- Configuration ---
const canvas = document.getElementById('fractal-canvas');
const ctx = canvas.getContext('2d', { alpha: false }); // No transparency needed
const width = window.innerWidth;
const height = window.innerHeight;

// UI Elements
const uiCoords = {
    x: document.getElementById('coord-x'),
    y: document.getElementById('coord-y'),
    zoom: document.getElementById('zoom-level')
};
const loadingIndicator = document.getElementById('loading');
const iterSlider = document.getElementById('iter-slider');
const iterVal = document.getElementById('iter-val');
const paletteSelect = document.getElementById('palette-select');

// --- State ---
const state = {
    x: -0.5,           // Center X
    y: 0.0,            // Center Y
    zoom: 250,         // Pixels per unit (Zoom level)
    maxIter: 100,      // Detail level
    palette: 'fire',   // Color scheme
    isDragging: false,
    lastX: 0,
    lastY: 0
};

// --- Palette Definitions (RGB Mapping) ---
const PALETTES = {
    // Fire: Black -> Red -> Yellow -> White
    fire: (t) => {
        return [t * 255, t * t * 255, t * t * t * 255];
    },
    // Ocean: Dark Blue -> Cyan -> White
    ocean: (t) => {
        return [t * t * 50, t * 150, t * 255];
    },
    // Matrix: Black -> Green -> Bright Green
    matrix: (t) => {
        return [0, t * 255, t * t * 100];
    },
    // Psychedelic: Sine waves for rainbow effect
    psycho: (t) => {
        return [
            Math.sin(t * 10) * 127 + 128,
            Math.sin(t * 10 + 2) * 127 + 128,
            Math.sin(t * 10 + 4) * 127 + 128
        ];
    },
    // Black & White
    bw: (t) => {
        const v = t * 255;
        return [v, v, v];
    }
};

// --- Initialization ---
function init() {
    resizeCanvas();
    setupEvents();
    requestRender(); // Initial render
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function setupEvents() {
    // 1. Zoom (Scroll)
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        const zoomFactor = 1.1;
        // Mouse position relative to center
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - canvas.width / 2;
        const mouseY = e.clientY - rect.top - canvas.height / 2;

        // Calculate world coordinates before zoom
        const worldX = state.x + mouseX / state.zoom;
        const worldY = state.y + mouseY / state.zoom;

        if (e.deltaY < 0) {
            state.zoom *= zoomFactor; // Zoom In
        } else {
            state.zoom /= zoomFactor; // Zoom Out
        }

        // Adjust center to zoom towards mouse
        state.x = worldX - mouseX / state.zoom;
        state.y = worldY - mouseY / state.zoom;

        updateUI();
        requestRender(true); // Low quality render during zoom
    }, { passive: false });

    // 2. Pan (Drag)
    canvas.addEventListener('mousedown', (e) => {
        state.isDragging = true;
        state.lastX = e.clientX;
        state.lastY = e.clientY;
        canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!state.isDragging) return;
        
        const dx = e.clientX - state.lastX;
        const dy = e.clientY - state.lastY;
        
        state.x -= dx / state.zoom;
        state.y -= dy / state.zoom;
        
        state.lastX = e.clientX;
        state.lastY = e.clientY;

        updateUI();
        requestRender(true); // Low quality render during drag
    });

    window.addEventListener('mouseup', () => {
        if(state.isDragging) {
            state.isDragging = false;
            canvas.style.cursor = 'grab';
            requestRender(false); // High quality final render
        }
    });

    // 3. Controls
    document.getElementById('btn-reset').addEventListener('click', () => {
        state.x = -0.5;
        state.y = 0.0;
        state.zoom = 250;
        updateUI();
        requestRender();
    });

    iterSlider.addEventListener('input', (e) => {
        state.maxIter = parseInt(e.target.value);
        iterVal.innerText = state.maxIter;
        requestRender();
    });

    paletteSelect.addEventListener('change', (e) => {
        state.palette = e.target.value;
        requestRender();
    });

    document.getElementById('btn-download').addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'mandelbrot-snap.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

// --- Rendering Engine ---
let renderTimeout;

function requestRender(lowQuality = false) {
    loadingIndicator.classList.add('visible');
    
    // Cancel any pending high-res render
    if (renderTimeout) clearTimeout(renderTimeout);

    if (lowQuality) {
        // Immediate low-res render
        renderFractal(4); // pixelStep = 4 (skip pixels)
    } else {
        // Debounce high-res render (wait for interaction to stop)
        renderTimeout = setTimeout(() => {
            renderFractal(1); // pixelStep = 1 (full detail)
            loadingIndicator.classList.remove('visible');
        }, 100);
    }
}

function renderFractal(pixelStep) {
    const w = canvas.width;
    const h = canvas.height;
    
    // Get raw pixel data
    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;
    
    // Optimization: Pre-calculate constants
    const max = state.maxIter;
    const colorFunc = PALETTES[state.palette];
    
    // Center offset
    const offsetX = w / 2;
    const offsetY = h / 2;

    for (let py = 0; py < h; py += pixelStep) {
        for (let px = 0; px < w; px += pixelStep) {
            
            // Map pixel to complex plane (c = a + bi)
            const a0 = state.x + (px - offsetX) / state.zoom;
            const b0 = state.y + (py - offsetY) / state.zoom;

            // Mandelbrot Algorithm: z = z^2 + c
            let a = 0;
            let b = 0;
            let iter = 0;

            // Optimization: check |z|^2 < 4
            while (a*a + b*b <= 4 && iter < max) {
                let temp = a*a - b*b + a0;
                b = 2*a*b + b0;
                a = temp;
                iter++;
            }

            // Coloring
            let color;
            if (iter === max) {
                color = [0, 0, 0]; // Inside set is black
            } else {
                // Smooth coloring (removes banding)
                // const smoothed = iter + 1 - Math.log(Math.log(Math.sqrt(a*a + b*b))) / Math.log(2);
                const t = iter / max;
                color = colorFunc(t);
            }

            // Write pixel (and neighbors if lowQuality)
            const pixelIndex = (py * w + px) * 4;
            
            // Fill block if pixelStep > 1
            if (pixelStep > 1) {
                for (let by = 0; by < pixelStep && py + by < h; by++) {
                    for (let bx = 0; bx < pixelStep && px + bx < w; bx++) {
                        const idx = ((py + by) * w + (px + bx)) * 4;
                        data[idx] = color[0];     // R
                        data[idx + 1] = color[1]; // G
                        data[idx + 2] = color[2]; // B
                        data[idx + 3] = 255;      // Alpha
                    }
                }
            } else {
                data[pixelIndex] = color[0];
                data[pixelIndex + 1] = color[1];
                data[pixelIndex + 2] = color[2];
                data[pixelIndex + 3] = 255;
            }
        }
    }

    ctx.putImageData(imgData, 0, 0);
}

function updateUI() {
    uiCoords.x.innerText = `X: ${state.x.toFixed(6)}`;
    uiCoords.y.innerText = `Y: ${state.y.toFixed(6)}`;
    uiCoords.zoom.innerText = `Zoom: ${(state.zoom/250).toFixed(1)}x`;
}

// Start
init();
window.addEventListener('resize', () => {
    resizeCanvas();
    requestRender();
});