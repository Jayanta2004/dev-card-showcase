/**
 * Main Application Entry Point
 * Initializes all components and manages application state
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

/**
 * Initialize the entire application
 */
function initializeApp() {
    console.log('🎹 Initializing PianoJS...');

    // Initialize piano UI
    piano = new Piano('piano');
    console.log('✓ Piano UI initialized');

    // Initialize auto-play controller
    autoPlayController = new AutoPlayController();
    console.log('✓ Auto-play controller initialized');

    // Initialize controls manager
    controlsManager = new ControlsManager(autoPlayController);
    console.log('✓ Controls manager initialized');

    // Initialize audio on first user interaction
    document.addEventListener('click', () => {
        if (!audioEngine.initialized) {
            audioEngine.initialize();
            console.log('✓ Audio engine initialized');
        }
    }, { once: true });

    // Add keyboard shortcuts info
    addKeyboardShortcuts();

    console.log('🎉 PianoJS ready!');
}

/**
 * Add global keyboard shortcuts
 */
function addKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Prevent shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
            return;
        }

        switch(e.key.toLowerCase()) {
            case ' ': // Spacebar - Play/Pause
                e.preventDefault();
                if (autoPlayController.isPlaying && !autoPlayController.isPaused) {
                    autoPlayController.pause();
                    controlsManager.updateButtons(false);
                } else {
                    autoPlayController.play();
                    controlsManager.updateButtons(true);
                }
                break;
            
            case 'r': // R - Restart
                e.preventDefault();
                autoPlayController.restart();
                controlsManager.updateButtons(true);
                break;
            
            case 'escape': // Escape - Stop
                e.preventDefault();
                autoPlayController.stop();
                controlsManager.updateButtons(false);
                break;
        }
    });
}

/**
 * Handle page visibility changes
 * Pause playback when tab is hidden
 */
document.addEventListener('visibilitychange', () => {
    if (document.hidden && autoPlayController && autoPlayController.isPlaying) {
        autoPlayController.pause();
        controlsManager.updateButtons(false);
    }
});

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
    if (autoPlayController) {
        autoPlayController.stop();
    }
    if (audioEngine) {
        audioEngine.stopAllNotes();
    }
});