/**
 * CHROMACHORD - MAIN APPLICATION
 * Orchestrates all modules and manages application flow
 */

class ChromachordApp {
    constructor() {
        this.colorAnalyzer = null;
        this.chordEngine = null;
        this.uiController = null;
        this.currentAnalysis = null;
        this.currentChord = null;
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            // Initialize modules
            this.colorAnalyzer = new ColorAnalyzer();
            this.chordEngine = new ChordEngine();
            this.uiController = new UIController();

            // Initialize UI controller
            this.uiController.initialize();

            // Initialize color analyzer with canvas
            const canvas = document.getElementById('analysisCanvas');
            this.colorAnalyzer.initialize(canvas);

            // Bind event listeners
            this.bindEvents();

            console.log('Chromachord initialized successfully');
        } catch (error) {
            console.error('Initialization error:', error);
            this.uiController.showError('Failed to initialize application');
        }
    }

    /**
     * Bind application-level event listeners
     */
    bindEvents() {
        // File selected event
        this.uiController.on('fileSelected', async (data) => {
            await this.handleFileSelected(data.file);
        });

        // Play chord event
        this.uiController.on('playChord', async (data) => {
            await this.handlePlayChord(data.duration, data.volume);
        });

        // Stop chord event
        this.uiController.on('stopChord', () => {
            this.handleStopChord();
        });

        // Volume changed event
        this.uiController.on('volumeChanged', (data) => {
            this.handleVolumeChanged(data.volume);
        });

        // Palette color selected event
        this.uiController.on('paletteColorSelected', async (data) => {
            await this.handlePaletteColorSelected(data.color);
        });
    }

    /**
     * Handle file selection
     * @param {File} file - Selected image file
     */
    async handleFileSelected(file) {
        try {
            // Show loading overlay
            this.uiController.showLoading('Analyzing colors...');

            // Small delay to show loading animation
            await this.delay(300);

            // Analyze image
            const analysis = await this.colorAnalyzer.analyzeImage(file);

            // Generate chord from dominant color
            const chord = this.chordEngine.colorToChord(analysis.dominant);

            // Store current analysis and chord
            this.currentAnalysis = analysis;
            this.currentChord = chord;

            // Hide loading overlay
            this.uiController.hideLoading();

            // Display results
            this.uiController.displayResults({
                dominant: analysis.dominant,
                palette: analysis.palette,
                image: analysis.image,
                chord: chord
            });

        } catch (error) {
            console.error('File processing error:', error);
            this.uiController.hideLoading();
            this.uiController.showError('Failed to analyze image. Please try another image.');
        }
    }

    /**
     * Handle play chord request
     * @param {number} duration - Chord duration in seconds
     * @param {number} volume - Volume (0-1)
     */
    async handlePlayChord(duration, volume) {
        if (!this.currentChord) {
            this.uiController.showError('No chord available to play');
            return;
        }

        try {
            // Update UI to playing state
            this.uiController.updatePlayButtonState(true);

            // Play chord
            await this.chordEngine.playChord(this.currentChord, duration, volume);

            // Wait for chord to finish
            await this.delay(duration * 1000);

            // Update UI to stopped state
            this.uiController.updatePlayButtonState(false);

        } catch (error) {
            console.error('Playback error:', error);
            this.uiController.updatePlayButtonState(false);
            this.uiController.showError('Audio playback failed');
        }
    }

    /**
     * Handle stop chord request
     */
    handleStopChord() {
        this.chordEngine.stopChord();
        this.uiController.updatePlayButtonState(false);
    }

    /**
     * Handle volume change
     * @param {number} volume - New volume (0-1)
     */
    handleVolumeChanged(volume) {
        this.chordEngine.setVolume(volume);
    }

    /**
     * Handle palette color selection
     * @param {Object} color - Selected color
     */
    async handlePaletteColorSelected(color) {
        try {
            // Generate new chord from selected color
            const chord = this.chordEngine.colorToChord(color);

            // Update current chord
            this.currentChord = chord;

            // Update displays
            this.uiController.updateColorDisplay(color);
            this.uiController.updateChordDisplay(chord);

        } catch (error) {
            console.error('Color selection error:', error);
            this.uiController.showError('Failed to generate chord from selected color');
        }
    }

    /**
     * Utility delay function
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Clean up resources
     */
    dispose() {
        if (this.chordEngine) {
            this.chordEngine.dispose();
        }
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new ChromachordApp();
    await app.initialize();

    // Store app instance globally for debugging
    window.chromachordApp = app;

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        app.dispose();
    });
});
