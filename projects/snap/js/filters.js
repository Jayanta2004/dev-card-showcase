/**
 * filters.js
 * Logic for generating CSS filter strings and Canvas operations.
 */

import { getState } from './state.js';

/**
 * Generates the CSS filter string from the state object.
 * @param {Object} filtersObject - The dictionary of filter values
 * @returns {string} - CSS filter string
 */
export function generateFilterString(filtersObject) {
    const {
        brightness,
        contrast,
        saturate,
        blur,
        grayscale,
        sepia,
        invert, // New
        'hue-rotate': hueRotate
    } = filtersObject;

    return `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturate}%)
        grayscale(${grayscale}%)
        sepia(${sepia}%)
        invert(${invert}%)
        hue-rotate(${hueRotate}deg)
        blur(${blur}px)
    `.trim(); // formatting for readability in devtools
}

/**
 * Available Presets
 */
export const PRESETS = {
    normal: {}, // Defaults
    bw: { grayscale: 100, contrast: 120 },
    vintage: { sepia: 50, contrast: 80, brightness: 110, saturate: 80 },
    warm: { sepia: 30, 'hue-rotate': -10, saturate: 120, brightness: 105 },
    cool: { 'hue-rotate': 180, saturate: 80, contrast: 90 },
    drama: { contrast: 150, saturate: 110, brightness: 90, sepia: 20 },
};

/**
 * Draws the image + filters to a canvas for export.
 * This effectively "bakes" the CSS filters into pixels.
 * @param {HTMLImageElement} imgElement 
 * @param {HTMLCanvasElement} canvasElement 
 * @param {Object} filters 
 */
export function drawToCanvas(imgElement, canvasElement, filters) {
    if (!imgElement || !canvasElement) return;

    const ctx = canvasElement.getContext('2d');

    // Set canvas dimensions to match the natural image size
    // For rotation 90/270, we need to swap width/height logic if we want to change canvas size.
    // However, to keep it simple, let's just rotate the context.

    // Calculate rotated dimensions
    let width = imgElement.naturalWidth;
    let height = imgElement.naturalHeight;
    const { rotate, flipH, flipV } = filters;

    const isRotated = rotate === 90 || rotate === 270;

    canvasElement.width = isRotated ? height : width;
    canvasElement.height = isRotated ? width : height;

    // Apply Filters
    const filterString = generateFilterString(filters);
    ctx.filter = filterString;

    // Apply Transforms
    ctx.save();

    // 1. Move to center
    ctx.translate(canvasElement.width / 2, canvasElement.height / 2);

    // 2. Rotate
    ctx.rotate((rotate * Math.PI) / 180);

    // 3. Flip
    const scaleX = flipH ? -1 : 1;
    const scaleY = flipV ? -1 : 1;
    ctx.scale(scaleX, scaleY);

    // 4. Draw Image (centered)
    // When rotated, we draw based on original dims, centered.
    ctx.drawImage(imgElement, -width / 2, -height / 2, width, height);

    ctx.restore();
}

/**
 * Triggers a download of the current canvas content.
 * @param {HTMLCanvasElement} canvas 
 * @param {string} filename 
 */
export function downloadCanvas(canvas, filename = 'snap-export.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png', 0.9); // High quality PNG
    link.click();
}
