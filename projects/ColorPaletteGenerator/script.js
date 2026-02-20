// DOM Elements
const paletteContainer = document.querySelector('.palette-container');
const generateBtn = document.getElementById('generateBtn');
const lockAllBtn = document.getElementById('lockAllBtn');
const saveFavBtn = document.getElementById('saveFavBtn');
const clearFavBtn = document.getElementById('clearFavBtn');
const currentHexElement = document.getElementById('currentHex');
const copyHexBtn = document.getElementById('copyHexBtn');
const favoritesContainer = document.getElementById('favoritesContainer');
const emptyFavMessage = document.getElementById('emptyFavMessage');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');

// State
let currentPalette = [];
let lockedColors = new Set();
let favoritePalettes = JSON.parse(localStorage.getItem('favoritePalettes')) || [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    generatePalette();
    renderFavorites();
    updateLockAllButton();
});

// Generate random hex color
function generateRandomColor() {
    const hexChars = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += hexChars[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Generate a full palette
function generatePalette() {
    currentPalette = [];
    paletteContainer.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        // If color is locked, keep it; otherwise generate new
        let color;
        if (lockedColors.has(i)) {
            color = currentPalette[i] || generateRandomColor();
        } else {
            color = generateRandomColor();
        }
        
        currentPalette.push(color);
        createColorElement(color, i);
    }
    
    // Update the current hex display
    currentHexElement.textContent = currentPalette[0];
}

// Create a color element for the palette
function createColorElement(color, index) {
    const colorItem = document.createElement('div');
    colorItem.className = 'color-item';
    colorItem.style.backgroundColor = color;
    colorItem.dataset.index = index;
    
    // Create color info section
    const colorInfo = document.createElement('div');
    colorInfo.className = 'color-info';
    
    const hexSpan = document.createElement('span');
    hexSpan.className = 'color-hex';
    hexSpan.textContent = color;
    
    const lockBtn = document.createElement('button');
    lockBtn.className = `lock-btn ${lockedColors.has(index) ? 'locked' : ''}`;
    lockBtn.innerHTML = lockedColors.has(index) ? '<i class="fas fa-lock"></i>' : '<i class="fas fa-lock-open"></i>';
    lockBtn.dataset.index = index;
    
    // Add event listeners
    colorItem.addEventListener('click', () => copyHexToClipboard(color));
    lockBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering parent click
        toggleLockColor(index, lockBtn);
    });
    
    // Assemble the element
    colorInfo.appendChild(hexSpan);
    colorInfo.appendChild(lockBtn);
    colorItem.appendChild(colorInfo);
    paletteContainer.appendChild(colorItem);
}

// Toggle lock status of a color
function toggleLockColor(index, lockBtn) {
    if (lockedColors.has(index)) {
        lockedColors.delete(index);
        lockBtn.classList.remove('locked');
        lockBtn.innerHTML = '<i class="fas fa-lock-open"></i>';
    } else {
        lockedColors.add(index);
        lockBtn.classList.add('locked');
        lockBtn.innerHTML = '<i class="fas fa-lock"></i>';
    }
    updateLockAllButton();
}

// Update lock all button text
function updateLockAllButton() {
    const lockIcon = lockAllBtn.querySelector('i');
    if (lockedColors.size === 5) {
        lockAllBtn.innerHTML = '<i class="fas fa-lock-open"></i> Unlock All Colors';
    } else if (lockedColors.size > 0) {
        lockAllBtn.innerHTML = '<i class="fas fa-lock-open"></i> Unlock All Colors';
    } else {
        lockAllBtn.innerHTML = '<i class="fas fa-lock"></i> Lock All Colors';
    }
}

// Copy hex to clipboard
function copyHexToClipboard(hex) {
    navigator.clipboard.writeText(hex).then(() => {
        // Update current hex display
        currentHexElement.textContent = hex;
        
        // Show notification
        showNotification(`Copied: ${hex}`);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        showNotification('Failed to copy to clipboard');
    });
}

// Show notification
function showNotification(message) {
    notificationText.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// Save current palette to favorites
function savePaletteToFavorites() {
    const paletteData = {
        colors: [...currentPalette],
        date: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        id: Date.now()
    };
    
    favoritePalettes.push(paletteData);
    localStorage.setItem('favoritePalettes', JSON.stringify(favoritePalettes));
    
    showNotification('Palette saved to favorites!');
    renderFavorites();
}

// Render favorites
function renderFavorites() {
    favoritesContainer.innerHTML = '';
    
    if (favoritePalettes.length === 0) {
        emptyFavMessage.style.display = 'block';
        favoritesContainer.appendChild(emptyFavMessage);
        return;
    }
    
    emptyFavMessage.style.display = 'none';
    
    // Reverse to show newest first
    [...favoritePalettes].reverse().forEach(palette => {
        const favPalette = document.createElement('div');
        favPalette.className = 'fav-palette';
        
        // Create colors row
        const favColors = document.createElement('div');
        favColors.className = 'fav-colors';
        
        palette.colors.forEach(color => {
            const favColor = document.createElement('div');
            favColor.className = 'fav-color';
            favColor.style.backgroundColor = color;
            favColor.title = `Click to copy: ${color}`;
            
            favColor.addEventListener('click', () => {
                copyHexToClipboard(color);
            });
            
            favColors.appendChild(favColor);
        });
        
        // Create info section
        const favInfo = document.createElement('div');
        favInfo.className = 'fav-info';
        
        const favDate = document.createElement('span');
        favDate.className = 'fav-date';
        favDate.textContent = palette.date;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-fav';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.title = 'Remove from favorites';
        
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFavorite(palette.id);
        });
        
        favInfo.appendChild(favDate);
        favInfo.appendChild(removeBtn);
        
        // Assemble the favorite palette
        favPalette.appendChild(favColors);
        favPalette.appendChild(favInfo);
        favoritesContainer.appendChild(favPalette);
    });
}

// Remove a favorite
function removeFavorite(id) {
    favoritePalettes = favoritePalettes.filter(palette => palette.id !== id);
    localStorage.setItem('favoritePalettes', JSON.stringify(favoritePalettes));
    renderFavorites();
    showNotification('Removed from favorites');
}

// Clear all favorites
function clearFavorites() {
    if (favoritePalettes.length === 0) {
        showNotification('No favorites to clear');
        return;
    }
    
    if (confirm('Are you sure you want to clear all favorite palettes?')) {
        favoritePalettes = [];
        localStorage.removeItem('favoritePalettes');
        renderFavorites();
        showNotification('All favorites cleared');
    }
}

// Toggle lock all colors
function toggleLockAllColors() {
    if (lockedColors.size === 5) {
        // All are locked, unlock all
        lockedColors.clear();
    } else if (lockedColors.size > 0) {
        // Some are locked, unlock all
        lockedColors.clear();
    } else {
        // None are locked, lock all
        for (let i = 0; i < 5; i++) {
            lockedColors.add(i);
        }
    }
    
    // Regenerate palette to reflect changes
    generatePalette();
    updateLockAllButton();
}

// Event Listeners
generateBtn.addEventListener('click', generatePalette);
lockAllBtn.addEventListener('click', toggleLockAllColors);
saveFavBtn.addEventListener('click', savePaletteToFavorites);
clearFavBtn.addEventListener('click', clearFavorites);
copyHexBtn.addEventListener('click', () => copyHexToClipboard(currentHexElement.textContent));

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Spacebar to generate new palette
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        generatePalette();
    }
    
    // Ctrl/Cmd + S to save to favorites
    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
        e.preventDefault();
        savePaletteToFavorites();
    }
    
    // L to lock/unlock all
    if (e.code === 'KeyL' && e.target === document.body) {
        e.preventDefault();
        toggleLockAllColors();
    }
});

// Add instructions tooltip on first visit
if (!localStorage.getItem('colorPaletteVisited')) {
    setTimeout(() => {
        showNotification('Tip: Press Spacebar to generate new palettes quickly!');
        localStorage.setItem('colorPaletteVisited', 'true');
    }, 1500);
}