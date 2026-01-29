// State management
let state = {
    mode: 'random',
    format: 'hex',
    colors: [],
    lockedColors: new Set(),
    numColors: 5
};

// DOM elements
const elements = {
    modeSelect: document.getElementById('modeSelect'),
    formatButtons: document.querySelectorAll('.format-btn'),
    generateBtn: document.getElementById('generateBtn'),
    paletteContainer: document.getElementById('paletteContainer'),
    contrastGrid: document.getElementById('contrastGrid'),
    exportCSS: document.getElementById('exportCSS'),
    exportTailwind: document.getElementById('exportTailwind'),
    exportJSON: document.getElementById('exportJSON'),
    copyPalette: document.getElementById('copyPalette'),
    exportModal: document.getElementById('exportModal'),
    modalTitle: document.getElementById('modalTitle'),
    exportCode: document.getElementById('exportCode'),
    modalClose: document.getElementById('modalClose'),
    copyModalBtn: document.getElementById('copyModalBtn'),
    downloadModalBtn: document.getElementById('downloadModalBtn'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// Color utility functions
const colorUtils = {
    // Convert HEX to RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    // Convert RGB to HEX
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    // Convert RGB to HSL
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    },

    // Convert HSL to RGB
    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    },

    // Generate random color
    randomColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    },

    // Calculate relative luminance
    getLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    },

    // Calculate contrast ratio
    getContrastRatio(color1, color2) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        const lum1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b);
        const lum2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b);
        
        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);
        
        return (lighter + 0.05) / (darker + 0.05);
    }
};

// Color generation algorithms
const colorGenerators = {
    random() {
        const colors = [];
        for (let i = 0; i < state.numColors; i++) {
            if (state.lockedColors.has(i)) {
                colors.push(state.colors[i]);
            } else {
                colors.push(colorUtils.randomColor());
            }
        }
        return colors;
    },

    monochromatic() {
        const colors = [];
        const baseHue = state.lockedColors.size > 0 
            ? colorUtils.rgbToHsl(...Object.values(colorUtils.hexToRgb(state.colors[0]))).h
            : Math.floor(Math.random() * 360);

        for (let i = 0; i < state.numColors; i++) {
            if (state.lockedColors.has(i)) {
                colors.push(state.colors[i]);
            } else {
                const lightness = 20 + (i * (60 / (state.numColors - 1)));
                const saturation = 50 + (i * 10);
                const rgb = colorUtils.hslToRgb(baseHue, saturation, lightness);
                colors.push(colorUtils.rgbToHex(rgb.r, rgb.g, rgb.b));
            }
        }
        return colors;
    },

    complementary() {
        const colors = [];
        const baseHue = state.lockedColors.size > 0 
            ? colorUtils.rgbToHsl(...Object.values(colorUtils.hexToRgb(state.colors[0]))).h
            : Math.floor(Math.random() * 360);

        for (let i = 0; i < state.numColors; i++) {
            if (state.lockedColors.has(i)) {
                colors.push(state.colors[i]);
            } else {
                const hue = i < state.numColors / 2 ? baseHue : (baseHue + 180) % 360;
                const lightness = 30 + Math.random() * 40;
                const saturation = 50 + Math.random() * 30;
                const rgb = colorUtils.hslToRgb(hue, saturation, lightness);
                colors.push(colorUtils.rgbToHex(rgb.r, rgb.g, rgb.b));
            }
        }
        return colors;
    },

    triadic() {
        const colors = [];
        const baseHue = state.lockedColors.size > 0 
            ? colorUtils.rgbToHsl(...Object.values(colorUtils.hexToRgb(state.colors[0]))).h
            : Math.floor(Math.random() * 360);

        const hues = [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360];

        for (let i = 0; i < state.numColors; i++) {
            if (state.lockedColors.has(i)) {
                colors.push(state.colors[i]);
            } else {
                const hue = hues[i % 3];
                const lightness = 30 + Math.random() * 40;
                const saturation = 50 + Math.random() * 30;
                const rgb = colorUtils.hslToRgb(hue, saturation, lightness);
                colors.push(colorUtils.rgbToHex(rgb.r, rgb.g, rgb.b));
            }
        }
        return colors;
    },

    analogous() {
        const colors = [];
        const baseHue = state.lockedColors.size > 0 
            ? colorUtils.rgbToHsl(...Object.values(colorUtils.hexToRgb(state.colors[0]))).h
            : Math.floor(Math.random() * 360);

        for (let i = 0; i < state.numColors; i++) {
            if (state.lockedColors.has(i)) {
                colors.push(state.colors[i]);
            } else {
                const hue = (baseHue + (i * 30) - 60) % 360;
                const lightness = 35 + Math.random() * 30;
                const saturation = 50 + Math.random() * 30;
                const rgb = colorUtils.hslToRgb(hue, saturation, lightness);
                colors.push(colorUtils.rgbToHex(rgb.r, rgb.g, rgb.b));
            }
        }
        return colors;
    },

    'split-complementary'() {
        const colors = [];
        const baseHue = state.lockedColors.size > 0 
            ? colorUtils.rgbToHsl(...Object.values(colorUtils.hexToRgb(state.colors[0]))).h
            : Math.floor(Math.random() * 360);

        const hues = [
            baseHue,
            (baseHue + 150) % 360,
            (baseHue + 210) % 360
        ];

        for (let i = 0; i < state.numColors; i++) {
            if (state.lockedColors.has(i)) {
                colors.push(state.colors[i]);
            } else {
                const hue = hues[i % 3];
                const lightness = 30 + Math.random() * 40;
                const saturation = 50 + Math.random() * 30;
                const rgb = colorUtils.hslToRgb(hue, saturation, lightness);
                colors.push(colorUtils.rgbToHex(rgb.r, rgb.g, rgb.b));
            }
        }
        return colors;
    }
};

// Initialize the application
function init() {
    attachEventListeners();
    generatePalette();
}

// Attach event listeners
function attachEventListeners() {
    elements.modeSelect.addEventListener('change', (e) => {
        state.mode = e.target.value;
    });

    elements.formatButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.formatButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.format = btn.dataset.format;
            renderPalette();
        });
    });

    elements.generateBtn.addEventListener('click', () => {
        generatePalette();
    });

    elements.exportCSS.addEventListener('click', () => exportAs('css'));
    elements.exportTailwind.addEventListener('click', () => exportAs('tailwind'));
    elements.exportJSON.addEventListener('click', () => exportAs('json'));
    elements.copyPalette.addEventListener('click', copyAllColors);

    elements.modalClose.addEventListener('click', closeModal);
    elements.copyModalBtn.addEventListener('click', copyModalCode);
    elements.downloadModalBtn.addEventListener('click', downloadModalCode);

    // Close modal on outside click
    elements.exportModal.addEventListener('click', (e) => {
        if (e.target === elements.exportModal) {
            closeModal();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            generatePalette();
        }
        if (e.key === 'Escape' && elements.exportModal.classList.contains('show')) {
            closeModal();
        }
    });
}

// Generate new palette
function generatePalette() {
    state.colors = colorGenerators[state.mode]();
    renderPalette();
    renderContrastInfo();
}

// Render palette cards
function renderPalette() {
    elements.paletteContainer.innerHTML = '';

    state.colors.forEach((color, index) => {
        const card = createColorCard(color, index);
        elements.paletteContainer.appendChild(card);
    });
}

// Create a color card
function createColorCard(color, index) {
    const card = document.createElement('div');
    card.className = 'color-card';

    const rgb = colorUtils.hexToRgb(color);
    const hsl = colorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);

    const isLocked = state.lockedColors.has(index);

    card.innerHTML = `
        <div class="color-preview" style="background-color: ${color}">
            <div class="color-actions">
                <button class="action-btn ${isLocked ? 'locked' : ''}" data-action="lock" data-index="${index}">
                    <i class="fas fa-${isLocked ? 'lock' : 'lock-open'}"></i>
                </button>
                <button class="action-btn" data-action="copy" data-index="${index}">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        </div>
        <div class="color-info">
            <div class="color-value">${formatColor(color, rgb, hsl)}</div>
            <div class="color-formats">
                <div class="color-format-item">
                    <span class="format-label">HEX:</span>
                    <span>${color.toUpperCase()}</span>
                </div>
                <div class="color-format-item">
                    <span class="format-label">RGB:</span>
                    <span>${rgb.r}, ${rgb.g}, ${rgb.b}</span>
                </div>
                <div class="color-format-item">
                    <span class="format-label">HSL:</span>
                    <span>${hsl.h}°, ${hsl.s}%, ${hsl.l}%</span>
                </div>
            </div>
        </div>
    `;

    // Add event listeners
    const lockBtn = card.querySelector('[data-action="lock"]');
    const copyBtn = card.querySelector('[data-action="copy"]');

    lockBtn.addEventListener('click', () => toggleLock(index));
    copyBtn.addEventListener('click', () => copyColor(color, index));

    return card;
}

// Format color based on selected format
function formatColor(hex, rgb, hsl) {
    switch (state.format) {
        case 'hex':
            return hex.toUpperCase();
        case 'rgb':
            return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        case 'hsl':
            return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        default:
            return hex;
    }
}

// Toggle color lock
function toggleLock(index) {
    if (state.lockedColors.has(index)) {
        state.lockedColors.delete(index);
    } else {
        state.lockedColors.add(index);
    }
    renderPalette();
}

// Copy single color
function copyColor(color, index) {
    const rgb = colorUtils.hexToRgb(color);
    const hsl = colorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
    const formatted = formatColor(color, rgb, hsl);

    navigator.clipboard.writeText(formatted).then(() => {
        showToast(`Copied ${formatted}!`, 'success');
    });
}

// Copy all colors
function copyAllColors() {
    const allColors = state.colors.map(color => {
        const rgb = colorUtils.hexToRgb(color);
        const hsl = colorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
        return formatColor(color, rgb, hsl);
    }).join('\n');

    navigator.clipboard.writeText(allColors).then(() => {
        showToast('All colors copied!', 'success');
    });
}

// Render contrast information
function renderContrastInfo() {
    elements.contrastGrid.innerHTML = '';

    // Check contrast between all pairs
    for (let i = 0; i < state.colors.length - 1; i++) {
        for (let j = i + 1; j < state.colors.length; j++) {
            const color1 = state.colors[i];
            const color2 = state.colors[j];
            const ratio = colorUtils.getContrastRatio(color1, color2);

            const item = document.createElement('div');
            item.className = 'contrast-item';
            item.innerHTML = `
                <div class="contrast-colors">
                    <div class="contrast-swatch" style="background: ${color1}"></div>
                    <span class="contrast-vs">vs</span>
                    <div class="contrast-swatch" style="background: ${color2}"></div>
                </div>
                <div class="contrast-info">
                    <span class="contrast-ratio">${ratio.toFixed(2)}:1</span>
                    <div class="contrast-badges">
                        <span class="badge ${ratio >= 4.5 ? 'pass' : 'fail'}">AA ${ratio >= 4.5 ? 'Pass' : 'Fail'}</span>
                        <span class="badge ${ratio >= 7 ? 'pass' : 'fail'}">AAA ${ratio >= 7 ? 'Pass' : 'Fail'}</span>
                    </div>
                </div>
            `;
            elements.contrastGrid.appendChild(item);
        }
    }
}

// Export functions
function exportAs(type) {
    let code = '';
    let filename = '';
    let title = '';

    switch (type) {
        case 'css':
            code = generateCSSCode();
            filename = 'palette.css';
            title = 'CSS Variables';
            break;
        case 'tailwind':
            code = generateTailwindCode();
            filename = 'tailwind.config.js';
            title = 'Tailwind Config';
            break;
        case 'json':
            code = generateJSONCode();
            filename = 'palette.json';
            title = 'JSON Export';
            break;
    }

    elements.modalTitle.textContent = title;
    elements.exportCode.value = code;
    elements.downloadModalBtn.dataset.filename = filename;
    elements.exportModal.classList.add('show');
}

function generateCSSCode() {
    return `:root {
${state.colors.map((color, i) => `  --color-${i + 1}: ${color};`).join('\n')}
}

/* Example usage:
.element {
  background-color: var(--color-1);
  color: var(--color-2);
}
*/`;
}

function generateTailwindCode() {
    const colorObj = {};
    state.colors.forEach((color, i) => {
        colorObj[`color-${i + 1}`] = color;
    });

    return `module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(colorObj, null, 8)}
    }
  }
}

// Example usage: className="bg-color-1 text-color-2"`;
}

function generateJSONCode() {
    const palette = state.colors.map((color, i) => {
        const rgb = colorUtils.hexToRgb(color);
        const hsl = colorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
        return {
            name: `color-${i + 1}`,
            hex: color,
            rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
            hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
        };
    });

    return JSON.stringify({ palette, mode: state.mode }, null, 2);
}

// Modal functions
function closeModal() {
    elements.exportModal.classList.remove('show');
}

function copyModalCode() {
    navigator.clipboard.writeText(elements.exportCode.value).then(() => {
        showToast('Code copied to clipboard!', 'success');
    });
}

function downloadModalCode() {
    const code = elements.exportCode.value;
    const filename = elements.downloadModalBtn.dataset.filename;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}!`, 'success');
}

// Show toast notification
function showToast(message, type = 'success') {
    elements.toastMessage.textContent = message;
    elements.toast.className = `toast ${type} show`;

    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
