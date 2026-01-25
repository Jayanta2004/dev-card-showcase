// Click Ripple Animation

// Configuration
let config = {
    pattern: 'circle',
    colorMode: 'random',
    size: 150,
    duration: 1500,
    soundEnabled: true,
    trailEnabled: false,
    showCounter: true,
    currentSound: 'drop',
    clickCount: 0,
    colorsUsed: new Set(),
    autoClick: null
};

// DOM Elements
const dom = {
    // Pattern buttons
    patternBtns: document.querySelectorAll('.pattern-btn'),
    
    // Color buttons
    colorBtns: document.querySelectorAll('.color-btn'),
    
    // Sliders
    rippleSize: document.getElementById('rippleSize'),
    sizeValue: document.getElementById('sizeValue'),
    rippleDuration: document.getElementById('rippleDuration'),
    durationValue: document.getElementById('durationValue'),
    
    // Toggles
    soundToggle: document.getElementById('soundToggle'),
    trailToggle: document.getElementById('trailToggle'),
    clickCounter: document.getElementById('clickCounter'),
    
    // Sound buttons
    soundBtns: document.querySelectorAll('.sound-btn'),
    
    // Action buttons
    clearBtn: document.getElementById('clearBtn'),
    autoClickBtn: document.getElementById('autoClickBtn'),
    presetBtn: document.getElementById('presetBtn'),
    
    // Stats
    clickCount: document.getElementById('clickCount'),
    colorCount: document.getElementById('colorCount'),
    
    // Animation area
    animationArea: document.getElementById('animationArea'),
    
    // Presets
    presetCards: document.querySelectorAll('.preset-card'),
    presetsGrid: document.getElementById('presetsGrid'),
    
    // Audio elements
    dropSound: document.getElementById('dropSound'),
    bubbleSound: document.getElementById('bubbleSound'),
    glassSound: document.getElementById('glassSound'),
    bellSound: document.getElementById('bellSound'),
    chimeSound: document.getElementById('chimeSound'),
    clickSound: document.getElementById('clickSound')
};

// Color palettes
const colorPalettes = {
    random: [
        '#E53E3E', '#DD6B20', '#D69E2E', '#38A169', '#319795',
        '#3182CE', '#5A67D8', '#805AD5', '#D53F8C', '#ED64A6'
    ],
    gradient: [
        'linear-gradient(135deg, #2E8B57, #D69E2E)',
        'linear-gradient(135deg, #D69E2E, #E53E3E)',
        'linear-gradient(135deg, #E53E3E, #805AD5)',
        'linear-gradient(135deg, #805AD5, #319795)'
    ],
    monochrome: [
        '#4A5568', '#718096', '#A0AEC0', '#CBD5E0', '#E2E8F0'
    ],
    pastel: [
        '#FEB2B2', '#9AE6B4', '#90CDF4', '#FAF089', '#D6BCFA'
    ]
};

// Initialize
function init() {
    setupEventListeners();
    updateStats();
    
    // Set initial slider values
    updateSizeValue();
    updateDurationValue();
    
    // Load saved settings
    loadSettings();
}

// Setup event listeners
function setupEventListeners() {
    // Pattern selection
    dom.patternBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dom.patternBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            config.pattern = btn.dataset.pattern;
            saveSettings();
        });
    });
    
    // Color mode selection
    dom.colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dom.colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            config.colorMode = btn.dataset.color;
            saveSettings();
        });
    });
    
    // Size slider
    dom.rippleSize.addEventListener('input', () => {
        config.size = parseInt(dom.rippleSize.value);
        updateSizeValue();
        saveSettings();
    });
    
    // Duration slider
    dom.rippleDuration.addEventListener('input', () => {
        config.duration = parseInt(dom.rippleDuration.value);
        updateDurationValue();
        saveSettings();
    });
    
    // Toggles
    dom.soundToggle.addEventListener('change', () => {
        config.soundEnabled = dom.soundToggle.checked;
        saveSettings();
    });
    
    dom.trailToggle.addEventListener('change', () => {
        config.trailEnabled = dom.trailToggle.checked;
        saveSettings();
    });
    
    dom.clickCounter.addEventListener('change', () => {
        config.showCounter = dom.clickCounter.checked;
        saveSettings();
    });
    
    // Sound selection
    dom.soundBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dom.soundBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            config.currentSound = btn.dataset.sound;
            saveSettings();
        });
    });
    
    // Action buttons
    dom.clearBtn.addEventListener('click', clearAllRipples);
    dom.autoClickBtn.addEventListener('click', toggleAutoClick);
    dom.presetBtn.addEventListener('click', saveCurrentPreset);
    
    // Click listener for animation area
    dom.animationArea.addEventListener('click', handleClick);
    
    // Preset cards
    dom.presetCards.forEach(card => {
        card.addEventListener('click', () => {
            loadPreset(card.dataset.preset);
        });
    });
    
    // Add context menu prevention
    dom.animationArea.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        // Right click creates special ripple
        createRipple(e, true);
    });
}

// Update slider display values
function updateSizeValue() {
    dom.sizeValue.textContent = `${config.size}px`;
}

function updateDurationValue() {
    const seconds = config.duration / 1000;
    dom.durationValue.textContent = `${seconds.toFixed(1)}s`;
}

// Handle click events
function handleClick(event) {
    createRipple(event);
}

function createRipple(event, isRightClick = false) {
    const rect = dom.animationArea.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Update click count
    config.clickCount++;
    updateStats();
    
    // Create ripple element
    const ripple = document.createElement('div');
    ripple.className = `ripple ${config.pattern}`;
    
    // Set position and size
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = `${config.size}px`;
    ripple.style.height = `${config.size}px`;
    ripple.style.animationDuration = `${config.duration}ms`;
    
    // Set color based on mode
    const color = getColor(x, y, isRightClick);
    ripple.style.color = color;
    
    // Add to animation area
    dom.animationArea.appendChild(ripple);
    
    // Play sound
    if (config.soundEnabled) {
        playSound(isRightClick);
    }
    
    // Show click counter
    if (config.showCounter) {
        showClickCounter(x, y, config.clickCount);
    }
    
    // Remove ripple after animation
    setTimeout(() => {
        ripple.remove();
    }, config.duration);
    
    // Create trail effect
    if (config.trailEnabled) {
        createTrail(x, y, color);
    }
    
    // Save color used
    if (typeof color === 'string' && color.startsWith('#')) {
        config.colorsUsed.add(color);
        updateStats();
    }
    
    // Save settings
    saveSettings();
}

// Get color based on mode and position
function getColor(x, y, isRightClick = false) {
    const palette = colorPalettes[config.colorMode];
    
    if (isRightClick) {
        // Special color for right click
        return '#E53E3E'; // Red color
    }
    
    switch (config.colorMode) {
        case 'random':
            return palette[Math.floor(Math.random() * palette.length)];
        
        case 'gradient':
            // Position-based gradient
            const width = dom.animationArea.clientWidth;
            const height = dom.animationArea.clientHeight;
            const hue = Math.floor((x / width) * 360);
            const saturation = 70 + Math.floor((y / height) * 30);
            return `hsl(${hue}, ${saturation}%, 60%)`;
        
        case 'monochrome':
            const index = Math.floor(Math.random() * palette.length);
            return palette[index];
        
        case 'pastel':
            return palette[Math.floor(Math.random() * palette.length)];
        
        default:
            return '#2E8B57'; // Fallback color
    }
}

// Play sound effect
function playSound(isRightClick = false) {
    let sound;
    
    if (isRightClick) {
        sound = dom.clickSound;
    } else {
        switch (config.currentSound) {
            case 'drop': sound = dom.dropSound; break;
            case 'bubble': sound = dom.bubbleSound; break;
            case 'glass': sound = dom.glassSound; break;
            case 'bell': sound = dom.bellSound; break;
            case 'chime': sound = dom.chimeSound; break;
            case 'click': sound = dom.clickSound; break;
            default: sound = dom.dropSound;
        }
    }
    
    // Clone and play to allow overlapping sounds
    const soundClone = sound.cloneNode();
    soundClone.volume = 0.3;
    soundClone.play();
}

// Show click counter
function showClickCounter(x, y, count) {
    const counter = document.createElement('div');
    counter.className = 'click-counter';
    counter.textContent = count;
    counter.style.left = `${x}px`;
    counter.style.top = `${y}px`;
    
    dom.animationArea.appendChild(counter);
    
    setTimeout(() => {
        counter.remove();
    }, 1000);
}

// Create trail effect
function createTrail(x, y, color) {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const trail = document.createElement('div');
            trail.className = 'ripple circle';
            trail.style.left = `${x}px`;
            trail.style.top = `${y}px`;
            trail.style.width = `${config.size / 2}px`;
            trail.style.height = `${config.size / 2}px`;
            trail.style.animationDuration = `${config.duration / 2}ms`;
            trail.style.color = color;
            trail.style.opacity = '0.5';
            
            dom.animationArea.appendChild(trail);
            
            setTimeout(() => {
                trail.remove();
            }, config.duration / 2);
        }, i * 100);
    }
}

// Clear all ripples
function clearAllRipples() {
    const ripples = document.querySelectorAll('.ripple, .click-counter');
    ripples.forEach(ripple => ripple.remove());
    
    // Reset stats
    config.clickCount = 0;
    config.colorsUsed.clear();
    updateStats();
    
    // Stop auto click if running
    if (config.autoClick) {
        clearInterval(config.autoClick);
        config.autoClick = null;
        dom.autoClickBtn.innerHTML = '<i class="fas fa-magic"></i> Auto Click';
    }
    
    saveSettings();
}

// Toggle auto click mode
function toggleAutoClick() {
    if (config.autoClick) {
        // Stop auto click
        clearInterval(config.autoClick);
        config.autoClick = null;
        dom.autoClickBtn.innerHTML = '<i class="fas fa-magic"></i> Auto Click';
    } else {
        // Start auto click
        config.autoClick = setInterval(() => {
            const area = dom.animationArea.getBoundingClientRect();
            const x = Math.random() * area.width;
            const y = Math.random() * area.height;
            
            const event = {
                clientX: area.left + x,
                clientY: area.top + y
            };
            
            createRipple(event);
        }, 300);
        
        dom.autoClickBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Auto Click';
    }
}

// Save current settings as preset
function saveCurrentPreset() {
    const name = prompt('Enter a name for this preset:');
    if (!name) return;
    
    const preset = {
        name: name,
        pattern: config.pattern,
        colorMode: config.colorMode,
        size: config.size,
        duration: config.duration,
        sound: config.currentSound
    };
    
    // Save to localStorage
    const presets = JSON.parse(localStorage.getItem('ripplePresets') || '[]');
    presets.push(preset);
    localStorage.setItem('ripplePresets', JSON.stringify(presets));
    
    // Update UI
    addPresetToUI(preset);
    
    alert(`Preset "${name}" saved!`);
}

function addPresetToUI(preset) {
    const presetCard = document.createElement('div');
    presetCard.className = 'preset-card';
    presetCard.dataset.preset = preset.name.toLowerCase().replace(/\s+/g, '-');
    
    const colorClass = preset.colorMode === 'gradient' ? preset.colorMode : 'random';
    
    presetCard.innerHTML = `
        <div class="preset-preview ${colorClass}"></div>
        <span>${preset.name}</span>
    `;
    
    presetCard.addEventListener('click', () => {
        loadPreset(preset);
    });
    
    dom.presetsGrid.appendChild(presetCard);
}

// Load preset
function loadPreset(presetData) {
    let preset;
    
    if (typeof presetData === 'string') {
        // Built-in preset
        switch (presetData) {
            case 'ocean':
                preset = {
                    pattern: 'wave',
                    colorMode: 'gradient',
                    size: 200,
                    duration: 2000,
                    currentSound: 'drop'
                };
                break;
            case 'fire':
                preset = {
                    pattern: 'burst',
                    colorMode: 'gradient',
                    size: 180,
                    duration: 1200,
                    currentSound: 'bubble'
                };
                break;
            case 'forest':
                preset = {
                    pattern: 'circle',
                    colorMode: 'random',
                    size: 160,
                    duration: 1800,
                    currentSound: 'chime'
                };
                break;
            case 'space':
                preset = {
                    pattern: 'spiral',
                    colorMode: 'gradient',
                    size: 220,
                    duration: 2500,
                    currentSound: 'glass'
                };
                break;
        }
    } else {
        // Custom preset
        preset = presetData;
    }
    
    if (preset) {
        // Update config
        config.pattern = preset.pattern || 'circle';
        config.colorMode = preset.colorMode || 'random';
        config.size = preset.size || 150;
        config.duration = preset.duration || 1500;
        config.currentSound = preset.sound || preset.currentSound || 'drop';
        
        // Update UI
        updateUIFromConfig();
        updateSizeValue();
        updateDurationValue();
        
        // Create a sample ripple
        const area = dom.animationArea.getBoundingClientRect();
        const x = area.width / 2;
        const y = area.height / 2;
        
        const event = {
            clientX: area.left + x,
            clientY: area.top + y
        };
        
        createRipple(event);
        
        alert(`Loaded preset: ${preset.name || presetData}`);
    }
}

// Update UI from config
function updateUIFromConfig() {
    // Update pattern buttons
    dom.patternBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.pattern === config.pattern);
    });
    
    // Update color buttons
    dom.colorBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === config.colorMode);
    });
    
    // Update sound buttons
    dom.soundBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sound === config.currentSound);
    });
    
    // Update sliders
    dom.rippleSize.value = config.size;
    dom.rippleDuration.value = config.duration;
    
    // Update toggles
    dom.soundToggle.checked = config.soundEnabled;
    dom.trailToggle.checked = config.trailEnabled;
    dom.clickCounter.checked = config.showCounter;
}

// Update stats display
function updateStats() {
    dom.clickCount.textContent = config.clickCount;
    dom.colorCount.textContent = config.colorsUsed.size;
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('rippleConfig', JSON.stringify(config));
}

// Load settings from localStorage
function loadSettings() {
    const saved = JSON.parse(localStorage.getItem('rippleConfig'));
    if (saved) {
        config = { ...config, ...saved };
        config.colorsUsed = new Set(saved.colorsUsed || []);
        
        updateUIFromConfig();
        updateStats();
        updateSizeValue();
        updateDurationValue();
    }
    
    // Load saved presets
    loadSavedPresets();
}

// Load saved presets from localStorage
function loadSavedPresets() {
    const presets = JSON.parse(localStorage.getItem('ripplePresets') || '[]');
    presets.forEach(preset => addPresetToUI(preset));
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Space bar to create ripple at random position
    if (e.code === 'Space') {
        e.preventDefault();
        const area = dom.animationArea.getBoundingClientRect();
        const x = Math.random() * area.width;
        const y = Math.random() * area.height;
        
        const event = {
            clientX: area.left + x,
            clientY: area.top + y
        };
        
        createRipple(event);
    }
    
    // C to clear all
    if (e.code === 'KeyC' && e.ctrlKey) {
        e.preventDefault();
        clearAllRipples();
    }
    
    // A to toggle auto click
    if (e.code === 'KeyA' && e.ctrlKey) {
        e.preventDefault();
        toggleAutoClick();
    }
    
    // 1-4 for quick pattern selection
    if (e.code >= 'Digit1' && e.code <= 'Digit5') {
        const patterns = ['circle', 'ring', 'wave', 'burst', 'spiral'];
        const index = parseInt(e.code.slice(-1)) - 1;
        if (patterns[index]) {
            config.pattern = patterns[index];
            updateUIFromConfig();
            saveSettings();
        }
    }
});