// --- DOM Elements ---
const inputs = {
    blur: document.getElementById('inp-blur'),
    alpha: document.getElementById('inp-alpha'),
    sat: document.getElementById('inp-sat'),
    rad: document.getElementById('inp-rad'),
    color: document.getElementById('inp-color')
};

const displays = {
    blur: document.getElementById('val-blur'),
    alpha: document.getElementById('val-alpha'),
    sat: document.getElementById('val-sat'),
    rad: document.getElementById('val-rad'),
    hex: document.getElementById('hex-display')
};

const card = document.getElementById('glass-card');
const codeOutput = document.getElementById('code-output');
const previewBg = document.getElementById('preview-bg');
const bgBtns = document.querySelectorAll('.bg-btn');
const copyBtn = document.getElementById('btn-copy');
const toast = document.getElementById('toast');

// --- State ---
let state = {
    blur: 10,
    alpha: 0.5,
    saturation: 100, // Backdrop saturation
    radius: 16,
    color: '#ffffff'
};

// --- Initialization ---
function init() {
    // Add Event Listeners
    inputs.blur.addEventListener('input', updateState);
    inputs.alpha.addEventListener('input', updateState);
    inputs.sat.addEventListener('input', updateState);
    inputs.rad.addEventListener('input', updateState);
    inputs.color.addEventListener('input', updateState);

    // Background Switcher
    bgBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            bgBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Remove old classes
            previewBg.className = 'preview-panel';
            // Add new class
            previewBg.classList.add(`bg-${btn.dataset.bg}`);
        });
    });

    // Copy Button
    copyBtn.addEventListener('click', copyCode);

    // Set initial background
    previewBg.classList.add('bg-gradient-1');
    updateVisuals();
}

// --- Logic ---

function updateState(e) {
    const id = e.target.id;
    const val = e.target.value;

    if (id === 'inp-blur') state.blur = val;
    if (id === 'inp-alpha') state.alpha = val;
    if (id === 'inp-sat') state.saturation = val;
    if (id === 'inp-rad') state.radius = val;
    if (id === 'inp-color') state.color = val;

    updateVisuals();
}

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function updateVisuals() {
    // Update Text Displays
    displays.blur.innerText = `${state.blur}px`;
    displays.alpha.innerText = state.alpha;
    displays.sat.innerText = `${state.saturation}%`;
    displays.rad.innerText = `${state.radius}px`;
    displays.hex.innerText = state.color.toUpperCase();

    // Convert Hex to RGB for rgba() string
    const rgb = hexToRgb(state.color);
    const rgbaString = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${state.alpha})`;
    const borderString = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;

    // Apply Styles to Card
    card.style.background = rgbaString;
    card.style.backdropFilter = `blur(${state.blur}px) saturate(${state.saturation}%)`;
    card.style.webkitBackdropFilter = `blur(${state.blur}px) saturate(${state.saturation}%)`; // Safari
    card.style.borderRadius = `${state.radius}px`;
    card.style.borderColor = borderString;

    // Generate Code String
    const css = `.glass-panel {
    /* From https://css.glass */
    background: ${rgbaString};
    border-radius: ${state.radius}px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(${state.blur}px) saturate(${state.saturation}%);
    -webkit-backdrop-filter: blur(${state.blur}px) saturate(${state.saturation}%);
    border: 1px solid ${borderString};
}`;

    codeOutput.innerText = css;
}

function copyCode() {
    const code = codeOutput.innerText;
    navigator.clipboard.writeText(code).then(() => {
        showToast();
    });
}

function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// Start
init();