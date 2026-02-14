/**
 * CHROMACHORD - UI CONTROLLER MODULE
 * Handles user interface interactions and visual feedback
 */

class UIController {
    constructor() {
        // DOM Elements
        this.elements = {
            uploadSection: null,
            uploadZone: null,
            uploadButton: null,
            imageInput: null,
            analysisSection: null,
            previewImage: null,
            changeImageBtn: null,
            colorSwatch: null,
            colorHex: null,
            colorRgb: null,
            colorHsl: null,
            colorPalette: null,
            chordName: null,
            chordNotes: null,
            noteIndicators: [],
            playButton: null,
            durationSlider: null,
            durationValue: null,
            volumeSlider: null,
            volumeValue: null,
            audioFeedback: null,
            loadingOverlay: null,
            loadingText: null,
            errorToast: null,
            errorMessage: null
        };

        // State
        this.currentChord = null;
        this.isDragging = false;
    }

    /**
     * Initialize UI controller and bind events
     */
    initialize() {
        this.cacheElements();
        this.bindEvents();
    }

    /**
     * Cache DOM element references
     */
    cacheElements() {
        this.elements.uploadSection = document.getElementById('uploadSection');
        this.elements.uploadZone = document.getElementById('uploadZone');
        this.elements.uploadButton = document.getElementById('uploadButton');
        this.elements.imageInput = document.getElementById('imageInput');
        this.elements.analysisSection = document.getElementById('analysisSection');
        this.elements.previewImage = document.getElementById('previewImage');
        this.elements.changeImageBtn = document.getElementById('changeImageBtn');
        this.elements.colorSwatch = document.getElementById('colorSwatch');
        this.elements.colorHex = document.getElementById('colorHex');
        this.elements.colorRgb = document.getElementById('colorRgb');
        this.elements.colorHsl = document.getElementById('colorHsl');
        this.elements.colorPalette = document.getElementById('colorPalette');
        this.elements.chordName = document.getElementById('chordName');
        this.elements.chordNotes = document.getElementById('chordNotes');
        this.elements.playButton = document.getElementById('playButton');
        this.elements.durationSlider = document.getElementById('durationSlider');
        this.elements.durationValue = document.getElementById('durationValue');
        this.elements.volumeSlider = document.getElementById('volumeSlider');
        this.elements.volumeValue = document.getElementById('volumeValue');
        this.elements.audioFeedback = document.getElementById('audioFeedback');
        this.elements.loadingOverlay = document.getElementById('loadingOverlay');
        this.elements.errorToast = document.getElementById('errorToast');
        this.elements.errorMessage = document.getElementById('errorMessage');

        // Cache note indicators
        for (let i = 1; i <= 4; i++) {
            this.elements.noteIndicators.push(document.getElementById(`note${i}`));
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Upload zone click
        this.elements.uploadZone.addEventListener('click', () => {
            this.elements.imageInput.click();
        });

        // Upload button click
        this.elements.uploadButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.elements.imageInput.click();
        });

        // File input change
        this.elements.imageInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        // Drag and drop events
        this.elements.uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.handleDragOver();
        });

        this.elements.uploadZone.addEventListener('dragleave', () => {
            this.handleDragLeave();
        });

        this.elements.uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleDrop(e.dataTransfer.files);
        });

        // Change image button
        this.elements.changeImageBtn.addEventListener('click', () => {
            this.resetToUpload();
        });

        // Play button
        this.elements.playButton.addEventListener('click', () => {
            this.handlePlayButtonClick();
        });

        // Duration slider
        this.elements.durationSlider.addEventListener('input', (e) => {
            this.updateDurationDisplay(e.target.value);
        });

        // Volume slider
        this.elements.volumeSlider.addEventListener('input', (e) => {
            this.updateVolumeDisplay(e.target.value);
        });

        // Prevent default drag behavior on document
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }

    /**
     * Handle file selection
     * @param {FileList} files - Selected files
     */
    handleFileSelect(files) {
        if (files && files.length > 0) {
            const file = files[0];
            this.validateAndProcessFile(file);
        }
    }

    /**
     * Handle drag over event
     */
    handleDragOver() {
        if (!this.isDragging) {
            this.isDragging = true;
            this.elements.uploadZone.classList.add('drag-over');
        }
    }

    /**
     * Handle drag leave event
     */
    handleDragLeave() {
        this.isDragging = false;
        this.elements.uploadZone.classList.remove('drag-over');
    }

    /**
     * Handle drop event
     * @param {FileList} files - Dropped files
     */
    handleDrop(files) {
        this.handleDragLeave();
        this.handleFileSelect(files);
    }

    /**
     * Validate and process image file
     * @param {File} file - Image file
     */
    validateAndProcessFile(file) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            this.showError('Please upload a valid image file (JPG, PNG, or WebP)');
            return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showError('Image file is too large. Please upload an image under 10MB');
            return;
        }

        // Emit file selected event
        this.emitEvent('fileSelected', { file });
    }

    /**
     * Show loading overlay
     * @param {string} message - Loading message
     */
    showLoading(message = 'Analyzing colors...') {
        const loadingText = this.elements.loadingOverlay.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = message;
        }
        this.elements.loadingOverlay.classList.remove('hidden');
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        this.elements.loadingOverlay.classList.add('hidden');
    }

    /**
     * Show error toast
     * @param {string} message - Error message
     */
    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorToast.classList.remove('hidden');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    /**
     * Hide error toast
     */
    hideError() {
        this.elements.errorToast.classList.add('hidden');
    }

    /**
     * Display analysis results
     * @param {Object} results - Analysis results
     */
    displayResults(results) {
        const { dominant, palette, image, chord } = results;

        // Update preview image
        this.elements.previewImage.src = image.src;

        // Update color display
        this.updateColorDisplay(dominant);

        // Update color palette
        this.updateColorPalette(palette);

        // Update chord display
        this.updateChordDisplay(chord);

        // Show analysis section, hide upload section
        this.elements.uploadSection.classList.add('hidden');
        this.elements.analysisSection.classList.remove('hidden');

        // Store current chord
        this.currentChord = chord;
    }

    /**
     * Update color display
     * @param {Object} color - Dominant color
     */
    updateColorDisplay(color) {
        // Update swatch
        this.elements.colorSwatch.style.backgroundColor = color.hex;

        // Update color values
        this.elements.colorHex.textContent = color.hex.toUpperCase();
        this.elements.colorRgb.textContent = `RGB(${color.r}, ${color.g}, ${color.b})`;
        this.elements.colorHsl.textContent = `HSL(${color.h}°, ${color.s}%, ${color.l}%)`;
    }

    /**
     * Update color palette
     * @param {Array<Object>} palette - Color palette
     */
    updateColorPalette(palette) {
        // Clear existing palette
        this.elements.colorPalette.innerHTML = '';

        // Create swatches
        for (const color of palette) {
            const swatch = document.createElement('div');
            swatch.className = 'palette-swatch';
            swatch.style.backgroundColor = color.hex;
            swatch.title = color.hex.toUpperCase();

            // Click to use this color
            swatch.addEventListener('click', () => {
                this.emitEvent('paletteColorSelected', { color });
            });

            this.elements.colorPalette.appendChild(swatch);
        }
    }

    /**
     * Update chord display
     * @param {Object} chord - Chord information
     */
    updateChordDisplay(chord) {
        // Update chord name
        this.elements.chordName.textContent = chord.fullName;

        // Update chord notes
        this.elements.chordNotes.textContent = chord.noteNames.join(' - ');

        // Update note indicators
        for (let i = 0; i < this.elements.noteIndicators.length; i++) {
            const indicator = this.elements.noteIndicators[i];
            const label = indicator.querySelector('.note-label');

            if (i < chord.noteNames.length) {
                indicator.classList.add('active');
                label.textContent = chord.noteNames[i];
            } else {
                indicator.classList.remove('active');
                label.textContent = '';
            }
        }
    }

    /**
     * Handle play button click
     */
    handlePlayButtonClick() {
        const isPlaying = this.elements.playButton.classList.contains('playing');

        if (isPlaying) {
            this.emitEvent('stopChord');
        } else {
            const duration = parseFloat(this.elements.durationSlider.value);
            const volume = parseFloat(this.elements.volumeSlider.value) / 100;
            this.emitEvent('playChord', { duration, volume });
        }
    }

    /**
     * Update play button state
     * @param {boolean} isPlaying - Whether audio is playing
     */
    updatePlayButtonState(isPlaying) {
        const playIcon = this.elements.playButton.querySelector('.play-icon');
        const stopIcon = this.elements.playButton.querySelector('.stop-icon');
        const buttonText = this.elements.playButton.querySelector('.button-text');

        if (isPlaying) {
            this.elements.playButton.classList.add('playing');
            playIcon.classList.add('hidden');
            stopIcon.classList.remove('hidden');
            buttonText.textContent = 'Stop';

            // Show audio feedback
            this.showAudioFeedback();

            // Animate note indicators
            this.animateNoteIndicators(true);
        } else {
            this.elements.playButton.classList.remove('playing');
            playIcon.classList.remove('hidden');
            stopIcon.classList.add('hidden');
            buttonText.textContent = 'Play Chord';

            // Hide audio feedback
            this.hideAudioFeedback();

            // Stop note animations
            this.animateNoteIndicators(false);
        }
    }

    /**
     * Show audio feedback overlay
     */
    showAudioFeedback() {
        this.elements.audioFeedback.classList.add('active');
    }

    /**
     * Hide audio feedback overlay
     */
    hideAudioFeedback() {
        this.elements.audioFeedback.classList.remove('active');
    }

    /**
     * Animate note indicators
     * @param {boolean} animate - Whether to animate
     */
    animateNoteIndicators(animate) {
        for (const indicator of this.elements.noteIndicators) {
            if (indicator.classList.contains('active')) {
                if (animate) {
                    indicator.classList.add('playing');
                } else {
                    indicator.classList.remove('playing');
                }
            }
        }
    }

    /**
     * Update duration display
     * @param {number} value - Duration value
     */
    updateDurationDisplay(value) {
        this.elements.durationValue.textContent = `${parseFloat(value).toFixed(1)}s`;
    }

    /**
     * Update volume display
     * @param {number} value - Volume value
     */
    updateVolumeDisplay(value) {
        this.elements.volumeValue.textContent = `${Math.round(value)}%`;
        this.emitEvent('volumeChanged', { volume: parseFloat(value) / 100 });
    }

    /**
     * Reset to upload screen
     */
    resetToUpload() {
        this.elements.analysisSection.classList.add('hidden');
        this.elements.uploadSection.classList.remove('hidden');
        this.elements.imageInput.value = '';
        this.currentChord = null;

        // Stop any playing audio
        this.emitEvent('stopChord');
    }

    /**
     * Get current settings
     * @returns {Object} Current settings
     */
    getSettings() {
        return {
            duration: parseFloat(this.elements.durationSlider.value),
            volume: parseFloat(this.elements.volumeSlider.value) / 100
        };
    }

    /**
     * Emit custom event
     * @param {string} eventName - Event name
     * @param {Object} detail - Event detail
     */
    emitEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Add event listener
     * @param {string} eventName - Event name
     * @param {Function} callback - Callback function
     */
    on(eventName, callback) {
        document.addEventListener(eventName, (e) => callback(e.detail));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}
