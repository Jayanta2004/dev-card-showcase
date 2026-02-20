// ===== Color Palette Generator - Complete Script =====

// State Management
const state = {
    currentPalette: [],
    lockedColors: [],
    favorites: [],
    colorScheme: 'analogous',
    colorCount: 5,
    mode: 'random'
};

// DOM Elements
const elements = {
    modeButtons: document.querySelectorAll('.mode-btn'),
    uploadArea: document.getElementById('uploadArea'),
    imageInput: document.getElementById('imageInput'),
    schemeSelect: document.getElementById('schemeSelect'),
    colorCountSlider: document.getElementById('colorCount'),
    colorCountValue: document.getElementById('colorCountValue'),
    generateBtn: document.getElementById('generateBtn'),
    paletteContainer: document.getElementById('paletteContainer'),
    exportCssBtn: document.getElementById('exportCss'),
    exportJsonBtn: document.getElementById('exportJson'),
    saveFavoriteBtn: document.getElementById('saveFavorite'),
    favoritesList: document.getElementById('favoritesList'),
    fgColorPicker: document.getElementById('fgColorPicker'),
    fgColorText: document.getElementById('fgColorText'),
    bgColorPicker: document.getElementById('bgColorPicker'),
    bgColorText: document.getElementById('bgColorText'),
    contrastPreview: document.getElementById('contrastPreview'),
    ratioValue: document.getElementById('ratioValue'),
    wcagBadges: document.querySelectorAll('.wcag-badge'),
    exportModal: document.getElementById('exportModal'),
    exportCode: document.getElementById('exportCode'),
    copyCodeBtn: document.getElementById('copyCode'),
    closeModalBtn: document.getElementById('closeModal'),
    toast: document.getElementById('toast'),
    colorWheel: document.getElementById('colorWheel')
};

// ===== Color Utility Functions =====

// Convert HEX to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Convert RGB to HEX
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Convert RGB to HSL
function rgbToHsl(r, g, b) {
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
}

// Convert HSL to RGB
function hslToRgb(h, s, l) {
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
}

// Generate Random Color
function generateRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

// ===== Color Scheme Generation =====

function generateColorScheme(baseColor, scheme, count) {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const colors = [];
    
    switch (scheme) {
        case 'analogous':
            for (let i = 0; i < count; i++) {
                const newH = (hsl.h + (i * 30) - 30) % 360;
                const newRgb = hslToRgb(newH, hsl.s, hsl.l);
                colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
            }
            break;
            
        case 'complementary':
            colors.push(baseColor);
            const compH = (hsl.h + 180) % 360;
            const compRgb = hslToRgb(compH, hsl.s, hsl.l);
            colors.push(rgbToHex(compRgb.r, compRgb.g, compRgb.b));
            
            // Fill remaining with variations
            for (let i = 2; i < count; i++) {
                const varH = i % 2 === 0 ? hsl.h : compH;
                const varL = hsl.l + (i * 10) - 20;
                const varRgb = hslToRgb(varH, hsl.s, Math.max(10, Math.min(90, varL)));
                colors.push(rgbToHex(varRgb.r, varRgb.g, varRgb.b));
            }
            break;
            
        case 'triadic':
            for (let i = 0; i < count; i++) {
                const newH = (hsl.h + (i * 120)) % 360;
                const newRgb = hslToRgb(newH, hsl.s, hsl.l);
                colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
            }
            break;
            
        case 'tetradic':
            for (let i = 0; i < count; i++) {
                const newH = (hsl.h + (i * 90)) % 360;
                const newRgb = hslToRgb(newH, hsl.s, hsl.l);
                colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
            }
            break;
            
        case 'monochromatic':
            for (let i = 0; i < count; i++) {
                const newL = 20 + (i * (60 / count));
                const newRgb = hslToRgb(hsl.h, hsl.s, newL);
                colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
            }
            break;
            
        case 'split-complementary':
            colors.push(baseColor);
            const split1H = (hsl.h + 150) % 360;
            const split2H = (hsl.h + 210) % 360;
            const split1Rgb = hslToRgb(split1H, hsl.s, hsl.l);
            const split2Rgb = hslToRgb(split2H, hsl.s, hsl.l);
            colors.push(rgbToHex(split1Rgb.r, split1Rgb.g, split1Rgb.b));
            colors.push(rgbToHex(split2Rgb.r, split2Rgb.g, split2Rgb.b));
            
            // Fill remaining
            for (let i = 3; i < count; i++) {
                const varH = (hsl.h + (i * 60)) % 360;
                const varRgb = hslToRgb(varH, hsl.s, hsl.l);
                colors.push(rgbToHex(varRgb.r, varRgb.g, varRgb.b));
            }
            break;
    }
    
    return colors.slice(0, count);
}

// ===== Image Color Extraction =====

function extractColorsFromImage(imageFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Resize for faster processing
                const maxSize = 100;
                const scale = Math.min(maxSize / img.width, maxSize / img.height);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                
                // Extract dominant colors using simple color quantization
                const colorMap = {};
                for (let i = 0; i < imageData.length; i += 4) {
                    const r = Math.floor(imageData[i] / 51) * 51;
                    const g = Math.floor(imageData[i + 1] / 51) * 51;
                    const b = Math.floor(imageData[i + 2] / 51) * 51;
                    const key = `${r},${g},${b}`;
                    colorMap[key] = (colorMap[key] || 0) + 1;
                }
                
                // Sort by frequency and get top colors
                const sortedColors = Object.entries(colorMap)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, state.colorCount)
                    .map(([rgb]) => {
                        const [r, g, b] = rgb.split(',').map(Number);
                        return rgbToHex(r, g, b);
                    });
                
                resolve(sortedColors);
            };
            img.src = e.target.result;
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
    });
}

// ===== Palette Display =====

function displayPalette(colors) {
    state.currentPalette = colors;
    elements.paletteContainer.innerHTML = '';
    
    colors.forEach((color, index) => {
        const card = document.createElement('div');
        card.className = 'color-card';
        card.innerHTML = `
            <div class="color-preview" style="background-color: ${color}">
                <button class="lock-btn ${state.lockedColors[index] ? 'locked' : ''}" data-index="${index}">
                    ${state.lockedColors[index] ? '🔒' : '🔓'}
                </button>
            </div>
            <div class="color-info">
                <div class="color-value">${color.toUpperCase()}</div>
                <divclass="color-actions">
                    <button class="action-btn" onclick="copyColor('${color}')">📋 Copy</button>
                    <button class="action-btn" onclick="pickColor(${index})">🎨 Pick</button>
                </div>
            </div>
        `;
        
        // Click to copy
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.lock-btn') && !e.target.closest('.action-btn')) {
                copyColor(color);
            }
        });
        
        elements.paletteContainer.appendChild(card);
    });
    
    // Add lock button listeners
    document.querySelectorAll('.lock-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            state.lockedColors[index] = !state.lockedColors[index];
            btn.classList.toggle('locked');
            btn.textContent = state.lockedColors[index] ? '🔒' : '🔓';
        });
    });
    
    drawColorWheel();
}

// ===== Color Wheel Visualization =====

function drawColorWheel() {
    const canvas = elements.colorWheel;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw color wheel
    for (let angle = 0; angle < 360; angle++) {
        const startAngle = (angle - 0.5) * Math.PI / 180;
        const endAngle = (angle + 0.5) * Math.PI / 180;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        const rgb = hslToRgb(angle, 100, 50);
        ctx.fillStyle = rgbToHex(rgb.r, rgb.g, rgb.b);
        ctx.fill();
    }
    
    // Draw inner white circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    
    // Mark palette colors on wheel
    state.currentPalette.forEach(color => {
        const rgb = hexToRgb(color);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const angle = hsl.h * Math.PI / 180;
        const x = centerX + Math.cos(angle) * radius * 0.85;
        const y = centerY + Math.sin(angle) * radius * 0.85;
        
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
    });
}

// ===== Accessibility Checker =====

function calculateContrastRatio(fg, bg) {
    const fgRgb = hexToRgb(fg);
    const bgRgb = hexToRgb(bg);
    
    const getLuminance = (r, g, b) => {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c /= 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const l1 = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
    const l2 = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
}

function updateContrastChecker() {
    const fg = elements.fgColorPicker.value;
    const bg = elements.bgColorPicker.value;
    
    elements.fgColorText.value = fg;
    elements.bgColorText.value = bg;
    
    const ratio = calculateContrastRatio(fg, bg);
    elements.ratioValue.textContent = ratio.toFixed(2);
    
    // Update preview
    elements.contrastPreview.style.color = fg;
    elements.contrastPreview.style.backgroundColor = bg;
    
    // Update WCAG badges
    const badges = Array.from(elements.wcagBadges);
    
    // AA Normal Text (4.5:1)
    if (ratio >= 4.5) {
        badges[0].classList.add('pass');
        badges[0].classList.remove('fail');
        badges[0].querySelector('.badge-icon').textContent = '✓';
    } else {
        badges[0].classList.add('fail');
        badges[0].classList.remove('pass');
        badges[0].querySelector('.badge-icon').textContent = '✗';
    }
    
    // AA Large Text (3:1)
    if (ratio >= 3) {
        badges[1].classList.add('pass');
        badges[1].classList.remove('fail');
        badges[1].querySelector('.badge-icon').textContent = '✓';
    } else {
        badges[1].classList.add('fail');
        badges[1].classList.remove('pass');
        badges[1].querySelector('.badge-icon').textContent = '✗';
    }
    
    // AAA (7:1)
    if (ratio >= 7) {
        badges[2].classList.add('pass');
        badges[2].classList.remove('fail');
        badges[2].querySelector('.badge-icon').textContent = '✓';
    } else {
        badges[2].classList.add('fail');
        badges[2].classList.remove('pass');
        badges[2].querySelector('.badge-icon').textContent = '✗';
    }
}

// ===== Favorites Management =====

function saveFavorite() {
    if (state.currentPalette.length === 0) {
        showToast('Generate a palette first!');
        return;
    }
    
    const favorite = {
        colors: state.currentPalette,
        scheme: state.colorScheme,
        timestamp: new Date().toLocaleString()
    };
    
    state.favorites.push(favorite);
    localStorage.setItem('colorPaletteFavorites', JSON.stringify(state.favorites));
    displayFavorites();
    showToast('Palette saved to favorites!');
}

function displayFavorites() {
    if (state.favorites.length === 0) {
        elements.favoritesList.innerHTML = '<div class="empty-state">No favorites yet</div>';
        return;
    }
    
    elements.favoritesList.innerHTML = '';
    
    state.favorites.forEach((fav, index) => {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        item.innerHTML = `
            <div class="favorite-colors">
                ${fav.colors.map(c => `<div class="favorite-color" style="background-color: ${c}"></div>`).join('')}
            </div>
            <div class="favorite-meta">
                ${fav.scheme} • ${fav.timestamp}
                <button class="favorite-delete" onclick="deleteFavorite(${index})">✕</button>
            </div>
        `;
        
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-delete')) {
                state.currentPalette = fav.colors;
                state.colorScheme = fav.scheme;
                elements.schemeSelect.value = fav.scheme;
                displayPalette(fav.colors);
                showToast('Palette loaded!');
            }
        });
        
        elements.favoritesList.appendChild(item);
    });
}

function deleteFavorite(index) {
    state.favorites.splice(index, 1);
    localStorage.setItem('colorPaletteFavorites', JSON.stringify(state.favorites));
    displayFavorites();
    showToast('Favorite deleted');
}

// ===== Export Functions =====

function exportToCSS() {
    const css = state.currentPalette.map((color, i) => 
        `--color-${i + 1}: ${color};`
    ).join('\n');
    
    const fullCss = `:root {\n  ${css}\n}`;
    showExportModal('CSS Variables', fullCss);
}

function exportToJSON() {
    const json = JSON.stringify({
        palette: state.currentPalette,
        scheme: state.colorScheme,
        timestamp: new Date().toISOString()
    }, null, 2);
    
    showExportModal('JSON Export', json);
}

function showExportModal(title, code) {
    elements.exportModal.classList.add('active');
    elements.exportModal.querySelector('h2').textContent = title;
    elements.exportCode.value = code;
}

function copyCode() {
    elements.exportCode.select();
    document.execCommand('copy');
    showToast('Code copied to clipboard!');
}

// ===== Utility Functions =====

function copyColor(color) {
    navigator.clipboard.writeText(color);
    showToast(`Copied ${color}`);
}

function pickColor(index) {
    const input = document.createElement('input');
    input.type = 'color';
    input.value = state.currentPalette[index];
    input.click();
    
    input.addEventListener('change', () => {
        state.currentPalette[index] = input.value;
        displayPalette(state.currentPalette);
    });
}

function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// ===== Event Listeners =====

// Mode Selection
elements.modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        elements.modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.mode = btn.dataset.mode;
        
        if (state.mode === 'image') {
            elements.uploadArea.style.display = 'block';
        } else {
            elements.uploadArea.style.display = 'none';
        }
    });
});

// Image Upload
elements.uploadArea.addEventListener('click', () => {
    elements.imageInput.click();
});

elements.uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.uploadArea.classList.add('dragover');
});

elements.uploadArea.addEventListener('dragleave', () => {
    elements.uploadArea.classList.remove('dragover');
});

elements.uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.uploadArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
    }
});

elements.imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImageUpload(file);
    }
});

async function handleImageUpload(file) {
    try {
        const colors = await extractColorsFromImage(file);
        state.currentPalette = colors;
        displayPalette(colors);
        showToast('Colors extracted from image!');
    } catch (error) {
        showToast('Error processing image');
        console.error(error);
    }
}

// Color Scheme Selection
elements.schemeSelect.addEventListener('change', () => {
    state.colorScheme = elements.schemeSelect.value;
});

// Color Count Slider
elements.colorCountSlider.addEventListener('input', () => {
    state.colorCount = parseInt(elements.colorCountSlider.value);
    elements.colorCountValue.textContent = state.colorCount;
});

// Generate Button
elements.generateBtn.addEventListener('click', () => {
    if (state.mode === 'random') {
        const baseColor = generateRandomColor();
        const colors = generateColorScheme(baseColor, state.colorScheme, state.colorCount);
        
        // Preserve locked colors
        const finalColors = colors.map((color, i) => 
            state.lockedColors[i] && state.currentPalette[i] ? state.currentPalette[i] : color
        );
        
        displayPalette(finalColors);
    } else {
        showToast('Please upload an image first');
    }
});

// Export Buttons
elements.exportCssBtn.addEventListener('click', exportToCSS);
elements.exportJsonBtn.addEventListener('click', exportToJSON);
elements.saveFavoriteBtn.addEventListener('click', saveFavorite);

// Accessibility Checker
elements.fgColorPicker.addEventListener('input', updateContrastChecker);
elements.bgColorPicker.addEventListener('input', updateContrastChecker);
elements.fgColorText.addEventListener('change', (e) => {
    elements.fgColorPicker.value = e.target.value;
    updateContrastChecker();
});
elements.bgColorText.addEventListener('change', (e) => {
    elements.bgColorPicker.value = e.target.value;
    updateContrastChecker();
});

// Modal
elements.closeModalBtn.addEventListener('click', () => {
    elements.exportModal.classList.remove('active');
});

elements.exportModal.addEventListener('click', (e) => {
    if (e.target === elements.exportModal) {
        elements.exportModal.classList.remove('active');
    }
});

elements.copyCodeBtn.addEventListener('click', copyCode);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.target.matches('input, textarea, select')) {
        e.preventDefault();
        elements.generateBtn.click();
    }
});

// ===== Initialization =====

function init() {
    // Load favorites from localStorage
    const saved = localStorage.getItem('colorPaletteFavorites');
    if (saved) {
        state.favorites = JSON.parse(saved);
    }
    
    displayFavorites();
    
    // Generate initial palette
    const baseColor = generateRandomColor();
    const colors = generateColorScheme(baseColor, state.colorScheme, state.colorCount);
    displayPalette(colors);
    
    // Initialize contrast checker
    updateContrastChecker();
    
    showToast('Press Space to generate new palettes!');
}

// Start the app
window.addEventListener('DOMContentLoaded', init);
            
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
