/**
 * Image-FX Logic
 * Handles file loading, canvas rendering, and applying filters using CSS filters for performance.
 */

// DOM Elements
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const uploadInput = document.getElementById('upload-input');
const uploadPlaceholder = document.getElementById('upload-placeholder');

const inputs = {
    brightness: document.getElementById('brightness'),
    contrast: document.getElementById('contrast'),
    saturation: document.getElementById('saturation'),
    blur: document.getElementById('blur')
};

const displays = {
    brightness: document.getElementById('val-brightness'),
    contrast: document.getElementById('val-contrast'),
    saturation: document.getElementById('val-saturation'),
    blur: document.getElementById('val-blur')
};

// State
let originalImage = null;
let currentSettings = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    rotate: 0,
    flipH: 1,
    flipV: 1,
    filter: 'none'
};

// --- Initialization ---
function init() {
    // File Upload
    uploadPlaceholder.addEventListener('click', () => uploadInput.click());
    uploadInput.addEventListener('change', loadImage);

    // Sliders
    Object.keys(inputs).forEach(key => {
        inputs[key].addEventListener('input', updateSettings);
    });

    // Transforms
    document.getElementById('rotate-left').addEventListener('click', () => {
        currentSettings.rotate -= 90;
        renderImage();
    });
    document.getElementById('rotate-right').addEventListener('click', () => {
        currentSettings.rotate += 90;
        renderImage();
    });
    document.getElementById('flip-h').addEventListener('click', () => {
        currentSettings.flipH *= -1;
        renderImage();
    });
    document.getElementById('flip-v').addEventListener('click', () => {
        currentSettings.flipV *= -1;
        renderImage();
    });

    // Presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            applyPreset(e.target.dataset.filter);
        });
    });

    // Actions
    document.getElementById('btn-reset').addEventListener('click', resetSettings);
    document.getElementById('btn-download').addEventListener('click', downloadImage);
}

// --- Image Handling ---

function loadImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        originalImage = new Image();
        originalImage.src = reader.result;
        originalImage.onload = () => {
            uploadPlaceholder.classList.add('hidden');
            resetSettings();
        };
    };
    reader.readAsDataURL(file);
}

function updateSettings(e) {
    const id = e.target.id;
    currentSettings[id] = e.target.value;
    
    // Update labels
    displays[id].innerText = id === 'blur' ? `${currentSettings[id]}px` : `${currentSettings[id]}%`;
    
    renderImage();
}

function renderImage() {
    if (!originalImage) return;

    // Canvas size resets on every write, so we handle rotation dimensions
    if (Math.abs(currentSettings.rotate % 180) === 90) {
        canvas.width = originalImage.naturalHeight;
        canvas.height = originalImage.naturalWidth;
    } else {
        canvas.width = originalImage.naturalWidth;
        canvas.height = originalImage.naturalHeight;
    }

    ctx.save();
    
    // 1. Move origin to center
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // 2. Rotate
    ctx.rotate(currentSettings.rotate * Math.PI / 180);
    
    // 3. Scale (Flip)
    ctx.scale(currentSettings.flipH, currentSettings.flipV);
    
    // 4. Draw Filter String
    // We use the Context Filter API (faster than manual pixel manipulation for basic edits)
    // Note: ctx.filter is supported in modern browsers.
    let filterString = `brightness(${currentSettings.brightness}%) contrast(${currentSettings.contrast}%) saturate(${currentSettings.saturation}%) blur(${currentSettings.blur}px)`;
    
    if (currentSettings.filter === 'grayscale') filterString += ' grayscale(100%)';
    if (currentSettings.filter === 'sepia') filterString += ' sepia(100%)';
    if (currentSettings.filter === 'invert') filterString += ' invert(100%)';
    
    ctx.filter = filterString;

    // 5. Draw Image (offset by half width/height because of translate)
    // We draw natural dimensions, rotation handles the swap
    ctx.drawImage(originalImage, -originalImage.naturalWidth / 2, -originalImage.naturalHeight / 2);
    
    ctx.restore();
}

function applyPreset(filter) {
    currentSettings.filter = filter;
    
    // Reset sliders if 'none' is clicked? Optional.
    // keeping sliders creates "Sepia + High Contrast" combos which is cool.
    renderImage();
}

function resetSettings() {
    currentSettings = {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        rotate: 0,
        flipH: 1,
        flipV: 1,
        filter: 'none'
    };
    
    // Reset UI Inputs
    inputs.brightness.value = 100;
    inputs.contrast.value = 100;
    inputs.saturation.value = 100;
    inputs.blur.value = 0;
    
    // Reset Displays
    displays.brightness.innerText = "100%";
    displays.contrast.innerText = "100%";
    displays.saturation.innerText = "100%";
    displays.blur.innerText = "0px";
    
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-filter="none"]').classList.add('active');

    renderImage();
}

function downloadImage() {
    if (!originalImage) return;
    
    const link = document.createElement('a');
    link.download = 'image-fx-edit.png';
    link.href = canvas.toDataURL();
    link.click();
}

// Start
init();