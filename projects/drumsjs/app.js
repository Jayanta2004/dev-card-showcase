/**
 * Main Application - Event handlers and initialization
 */

/**
 * Global keyboard handler for drum pads
 */
document.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();
    
    // Check if key corresponds to a drum pad
    if (drumSounds.find(d => d.key === key)) {
        e.preventDefault();
        activatePad(key);
    }
    
    // Spacebar toggles play/pause (if not focused on a button)
    if (e.key === ' ' && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        togglePlay();
    }
});

/**
 * Double-click play button to cycle patterns quickly
 */
let lastClickTime = 0;
document.getElementById('playBtn').addEventListener('click', () => {
    const now = Date.now();
    if (now - lastClickTime < 300) {
        changePattern(1);
    }
    lastClickTime = now;
});

/**
 * Initialize application
 */
function init() {
    // Set up event listeners
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    
    document.getElementById('tempoSlider').addEventListener('input', (e) => {
        updateTempo(parseInt(e.target.value));
    });
    
    document.getElementById('prevPattern').addEventListener('click', () => {
        changePattern(-1);
    });
    
    document.getElementById('nextPattern').addEventListener('click', () => {
        changePattern(1);
    });
    
    // Create UI elements
    createDrumPads();
    createStepGrid();
    createParticles();
    
    // Initialize pattern display
    updatePatternDisplay();
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}