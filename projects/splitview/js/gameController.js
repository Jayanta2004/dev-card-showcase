// Game controller - orchestrates the entire game flow

const GameController = {
    state: 'upload', // upload, preview, playing, success
    difficulty: 'easy',
    hintsEnabled: true,
    startTime: null,
    elapsedTime: 0,
    timerInterval: null,
    alignmentCheckInterval: null,
    currentImageData: null,

    /**
     * Initialize the game controller
     */
    init() {
        this.state = 'upload';
        this.difficulty = 'easy';
        this.hintsEnabled = true;
        this.startTime = null;
        this.elapsedTime = 0;

        // Initialize modules
        ImageProcessor.init();
        WindowManager.init();
        AlignmentDetector.init(this.difficulty, this.hintsEnabled);

        // Setup message handlers
        this.setupMessageHandlers();
    },

    /**
     * Setup message handlers for window communication
     */
    setupMessageHandlers() {
        WindowManager.onMessage('position-update', () => {
            if (this.state === 'playing') {
                this.checkAlignmentStatus();
            }
        });
    },

    /**
     * Load an image
     * @param {File|string} source - Image file or URL
     */
    async loadImage(source) {
        try {
            const imageData = await ImageProcessor.loadImage(source);
            this.currentImageData = imageData;
            this.showPreview();
        } catch (error) {
            Utils.showToast('Failed to load image', 'error');
            console.error(error);
        }
    },

    /**
     * Load a sample image
     * @param {string} type - Sample type
     */
    loadSample(type) {
        try {
            const imageData = ImageProcessor.generateSample(type);
            this.currentImageData = imageData;
            this.showPreview();
        } catch (error) {
            Utils.showToast('Failed to generate sample', 'error');
            console.error(error);
        }
    },

    /**
     * Show preview section
     */
    showPreview() {
        this.state = 'preview';

        // Draw preview
        const previewCanvas = document.getElementById('previewCanvas');
        ImageProcessor.drawPreview(previewCanvas);

        // Update UI
        document.getElementById('uploadSection').classList.add('hidden');
        document.getElementById('previewSection').classList.remove('hidden');
    },

    /**
     * Change difficulty
     * @param {string} difficulty - New difficulty level
     */
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        AlignmentDetector.updateSettings({ difficulty: difficulty });
    },

    /**
     * Toggle hints
     * @param {boolean} enabled - Hints enabled
     */
    setHints(enabled) {
        this.hintsEnabled = enabled;
        AlignmentDetector.updateSettings({ hintsEnabled: enabled });
    },

    /**
     * Start the game
     */
    async startGame() {
        try {
            // Split image into quadrants
            const quadrants = ImageProcessor.splitIntoQuadrants();

            // Create popup windows
            await WindowManager.createWindows(quadrants);

            // Update state
            this.state = 'playing';
            this.startTime = Date.now();
            this.elapsedTime = 0;

            // Show game section
            document.getElementById('previewSection').classList.add('hidden');
            document.getElementById('gameSection').classList.remove('hidden');

            // Start timer
            this.startTimer();

            // Start alignment checking
            this.startAlignmentChecking();

            Utils.showToast('Arrange the windows to solve the puzzle!', 'info');
        } catch (error) {
            Utils.showToast(error.message, 'error');
            console.error(error);
        }
    },

    /**
     * Start the game timer
     */
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            document.getElementById('timeValue').textContent = Utils.formatTime(this.elapsedTime);
        }, 1000);
    },

    /**
     * Stop the game timer
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    /**
     * Start alignment checking
     */
    startAlignmentChecking() {
        this.alignmentCheckInterval = setInterval(() => {
            this.checkAlignmentStatus();
        }, CONFIG.WINDOW.checkInterval);
    },

    /**
     * Stop alignment checking
     */
    stopAlignmentChecking() {
        if (this.alignmentCheckInterval) {
            clearInterval(this.alignmentCheckInterval);
            this.alignmentCheckInterval = null;
        }
    },

    /**
     * Check current alignment status
     */
    checkAlignmentStatus() {
        // Check if all windows are still open
        if (!WindowManager.areAllWindowsOpen()) {
            this.handleWindowClosed();
            return;
        }

        const windows = WindowManager.windows;
        const alignmentStatus = AlignmentDetector.checkAlignment(windows);

        // Update UI
        this.updateAlignmentUI(alignmentStatus);

        // Send visual feedback to windows
        this.updateWindowFeedback(alignmentStatus);

        // Check for completion
        if (AlignmentDetector.isComplete(alignmentStatus)) {
            this.handleSuccess();
        }
    },

    /**
     * Update alignment UI elements
     * @param {Object} alignmentStatus - Alignment status
     */
    updateAlignmentUI(alignmentStatus) {
        const alignmentValue = document.getElementById('alignmentValue');
        const alignmentFill = document.getElementById('alignmentFill');

        alignmentValue.textContent = `${alignmentStatus.percentage}%`;
        alignmentFill.style.width = `${alignmentStatus.percentage}%`;

        // Change color based on alignment quality
        if (alignmentStatus.percentage >= CONFIG.ALIGNMENT.perfect) {
            alignmentFill.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        } else if (alignmentStatus.percentage >= CONFIG.ALIGNMENT.good) {
            alignmentFill.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        } else {
            alignmentFill.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        }
    },

    /**
     * Update visual feedback in popup windows
     * @param {Object} alignmentStatus - Alignment status
     */
    updateWindowFeedback(alignmentStatus) {
        WindowManager.windows.forEach(windowData => {
            // Send alignment status
            WindowManager.sendToWindow(windowData.quadrantId, {
                type: 'set-aligned',
                aligned: alignmentStatus.aligned
            });

            // Send hints if enabled
            if (this.hintsEnabled) {
                const hint = AlignmentDetector.getHintForWindow(
                    windowData.quadrantId,
                    WindowManager.windows
                );
                WindowManager.sendToWindow(windowData.quadrantId, {
                    type: 'show-hint',
                    show: hint.show,
                    direction: hint.direction
                });
            } else {
                WindowManager.sendToWindow(windowData.quadrantId, {
                    type: 'show-hint',
                    show: false
                });
            }
        });
    },

    /**
     * Handle window closed event
     */
    handleWindowClosed() {
        Utils.showToast('A window was closed. Please restart the game.', 'warning');
        this.stopGame();
    },

    /**
     * Handle successful completion
     */
    handleSuccess() {
        this.state = 'success';
        this.stopTimer();
        this.stopAlignmentChecking();

        // Update success UI
        document.getElementById('finalTime').textContent = Utils.formatTime(this.elapsedTime);
        document.getElementById('finalDifficulty').textContent = CONFIG.DIFFICULTY[this.difficulty].name;

        // Show success section
        document.getElementById('gameSection').classList.add('hidden');
        document.getElementById('successSection').classList.remove('hidden');

        // Celebrate in popup windows
        WindowManager.broadcastToWindows({
            type: 'set-aligned',
            aligned: true
        });

        Utils.showToast('Puzzle solved! 🎉', 'success');
    },

    /**
     * Reset window positions
     */
    resetPositions() {
        WindowManager.resetPositions();
        AlignmentDetector.reset();
        Utils.showToast('Positions reset', 'info');
    },

    /**
     * Stop the current game
     */
    stopGame() {
        this.stopTimer();
        this.stopAlignmentChecking();
        WindowManager.closeAllWindows();
        AlignmentDetector.reset();
    },

    /**
     * Start a new game with current image
     */
    async newGame() {
        this.stopGame();

        // Reset to preview
        this.state = 'preview';
        document.getElementById('successSection').classList.add('hidden');
        document.getElementById('gameSection').classList.add('hidden');
        document.getElementById('previewSection').classList.remove('hidden');
    },

    /**
     * Start completely new game with new image
     */
    newImage() {
        this.stopGame();
        ImageProcessor.clear();
        this.currentImageData = null;

        // Reset to upload
        this.state = 'upload';
        document.getElementById('successSection').classList.add('hidden');
        document.getElementById('gameSection').classList.add('hidden');
        document.getElementById('previewSection').classList.add('hidden');
        document.getElementById('uploadSection').classList.remove('hidden');
    },

    /**
     * Cleanup
     */
    destroy() {
        this.stopGame();
        WindowManager.destroy();
        ImageProcessor.clear();
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameController;
}
