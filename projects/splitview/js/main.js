// Main application entry point

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Check browser support
    const support = Utils.checkBrowserSupport();
    if (!support.popup) {
        Utils.showToast('Your browser does not support popup windows', 'error');
        return;
    }
    if (!support.canvas) {
        Utils.showToast('Your browser does not support canvas', 'error');
        return;
    }

    // Initialize game controller
    GameController.init();

    // Setup event listeners
    setupEventListeners();

    // Show welcome message
    Utils.showToast('Welcome to SplitView! Upload an image to begin.', 'info');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Upload section
    setupUploadListeners();

    // Preview section
    setupPreviewListeners();

    // Game section
    setupGameListeners();

    // Success section
    setupSuccessListeners();

    // Window cleanup on page unload
    window.addEventListener('beforeunload', () => {
        GameController.destroy();
    });
}

/**
 * Setup upload section listeners
 */
function setupUploadListeners() {
    const uploadArea = document.getElementById('uploadArea');
    const uploadButton = document.getElementById('uploadButton');
    const imageInput = document.getElementById('imageInput');
    const sampleGrid = document.getElementById('sampleGrid');

    // Upload button click
    uploadButton.addEventListener('click', () => {
        imageInput.click();
    });

    // Upload area click
    uploadArea.addEventListener('click', (e) => {
        if (e.target === uploadArea || e.target.closest('.upload-icon, .upload-title, .upload-description')) {
            imageInput.click();
        }
    });

    // File input change
    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                Utils.showToast('Please select an image file', 'error');
                return;
            }
            await GameController.loadImage(file);
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', async (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            await GameController.loadImage(file);
        } else {
            Utils.showToast('Please drop an image file', 'error');
        }
    });

    // Sample images
    sampleGrid.addEventListener('click', (e) => {
        const sampleItem = e.target.closest('.sample-item');
        if (sampleItem) {
            const sampleType = sampleItem.dataset.sample;
            GameController.loadSample(sampleType);
        }
    });
}

/**
 * Setup preview section listeners
 */
function setupPreviewListeners() {
    const changeButton = document.getElementById('changeButton');
    const startButton = document.getElementById('startButton');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const hintsToggle = document.getElementById('hintsToggle');

    // Change image button
    changeButton.addEventListener('click', () => {
        GameController.newImage();
    });

    // Difficulty selection
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            difficultyButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update difficulty
            const difficulty = btn.dataset.difficulty;
            GameController.setDifficulty(difficulty);
        });
    });

    // Hints toggle
    hintsToggle.addEventListener('change', (e) => {
        GameController.setHints(e.target.checked);
    });

    // Start button
    startButton.addEventListener('click', async () => {
        await GameController.startGame();
    });
}

/**
 * Setup game section listeners
 */
function setupGameListeners() {
    const resetButton = document.getElementById('resetButton');
    const closeAllButton = document.getElementById('closeAllButton');
    const newGameButton = document.getElementById('newGameButton');

    // Reset positions
    resetButton.addEventListener('click', () => {
        GameController.resetPositions();
    });

    // Close all windows
    closeAllButton.addEventListener('click', () => {
        GameController.stopGame();
        GameController.newImage();
    });

    // New game
    newGameButton.addEventListener('click', () => {
        GameController.stopGame();
        GameController.newImage();
    });
}

/**
 * Setup success section listeners
 */
function setupSuccessListeners() {
    const playAgainButton = document.getElementById('playAgainButton');
    const newImageButton = document.getElementById('newImageButton');

    // Play again with same image
    playAgainButton.addEventListener('click', async () => {
        await GameController.newGame();
    });

    // Try new image
    newImageButton.addEventListener('click', () => {
        GameController.newImage();
    });
}

// Handle visibility change to pause/resume game
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden - could pause timer here if needed
    } else {
        // Page is visible again
        if (GameController.state === 'playing') {
            // Check if windows are still open
            if (!WindowManager.areAllWindowsOpen()) {
                Utils.showToast('Some windows were closed', 'warning');
            }
        }
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key - close all windows
    if (e.key === 'Escape' && GameController.state === 'playing') {
        GameController.stopGame();
        GameController.newImage();
    }

    // R key - reset positions
    if (e.key === 'r' && GameController.state === 'playing') {
        GameController.resetPositions();
    }

    // H key - toggle hints
    if (e.key === 'h' && GameController.state === 'playing') {
        const hintsToggle = document.getElementById('hintsToggle');
        hintsToggle.checked = !hintsToggle.checked;
        GameController.setHints(hintsToggle.checked);
    }
});

// Export for debugging
if (typeof window !== 'undefined') {
    window.SplitView = {
        GameController,
        WindowManager,
        ImageProcessor,
        AlignmentDetector,
        Utils,
        CONFIG
    };
}
