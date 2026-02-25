// --- DOM Elements ---
const root = document.documentElement;
const cssOutput = document.getElementById('cssOutput');
const btnCopy = document.getElementById('btnCopy');

// Controls
const blurSlider = document.getElementById('blur');
const opacitySlider = document.getElementById('opacity');
const saturationSlider = document.getElementById('saturation');
const colorPicker = document.getElementById('baseColor');
const borderToggle = document.getElementById('addBorder');

// Value Displays
const blurVal = document.getElementById('blurVal');
const opacityVal = document.getElementById('opacityVal');
const saturationVal = document.getElementById('saturationVal');
const colorVal = document.getElementById('colorVal');

// --- Helper: Hex to RGB ---
function hexToRgb(hex) {
    let r = 0, g = 0, b = 0;
    // 3 digits
    if (hex.length == 4) {
        r = "0x" + hex[1] + hex[1];
        g = "0x" + hex[2] + hex[2];
        b = "0x" + hex[3] + hex[3];
    // 6 digits
    } else if (hex.length == 7) {
        r = "0x" + hex[1] + hex[2];
        g = "0x" + hex[3] + hex[4];
        b = "0x" + hex[5] + hex[6];
    }
    return `${+r}, ${+g}, ${+b}`;
}

// --- Generator Logic ---
function updateGlass() {
    // Get Values
    const blur = blurSlider.value;
    const opacity = opacitySlider.value;
    const saturation = saturationSlider.value;
    const hexColor = colorPicker.value;
    const rgbColor = hexToRgb(hexColor);
    const hasBorder = borderToggle.checked;

    // Update UI Displays
    blurVal.innerText = `${blur}px`;
    opacityVal.innerText = opacity;
    saturationVal.innerText = `${saturation}%`;
    colorVal.innerText = hexColor.toUpperCase();

    // Update CSS Variables via Root
    root.style.setProperty('--g-blur', `${blur}px`);
    root.style.setProperty('--g-opacity', opacity);
    root.style.setProperty('--g-saturation', `${saturation}%`);
    root.style.setProperty('--g-color', rgbColor);
    
    let borderString = 'none';
    if (hasBorder) {
        borderString = `1px solid rgba(${rgbColor}, 0.2)`;
    }
    root.style.setProperty('--g-border', borderString);

    generateCodeString(blur, opacity, saturation, rgbColor, borderString);
}

function generateCodeString(blur, opacity, saturation, rgb, border) {
    const cssString = `/* Glassmorphism CSS */
background-color: rgba(${rgb}, ${opacity});
backdrop-filter: blur(${blur}px) saturate(${saturation}%);
-webkit-backdrop-filter: blur(${blur}px) saturate(${saturation}%);
border: ${border};
border-radius: 20px; /* Optional */`;

    cssOutput.innerText = cssString;
}

// --- Event Listeners ---
[blurSlider, opacitySlider, saturationSlider, colorPicker, borderToggle].forEach(input => {
    input.addEventListener('input', updateGlass);
});

btnCopy.addEventListener('click', () => {
    const code = cssOutput.innerText;
    navigator.clipboard.writeText(code).then(() => {
        const ogText = btnCopy.innerText;
        btnCopy.innerText = 'Copied!';
        btnCopy.style.background = '#10b981'; // Success green
        
        setTimeout(() => {
            btnCopy.innerText = ogText;
            btnCopy.style.background = 'var(--accent)';
        }, 1500);
    });
});

// Initial load
updateGlass();