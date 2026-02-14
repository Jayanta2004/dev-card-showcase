/* ============================================
   MOUSE TREMOR ART - UI CONTROLLER
   UI state management, controls, and application logic
   ============================================ */

(function () {
    'use strict';

    /* ============================================
       UI CONTROLLER CLASS
       ============================================ */

    class UIController {
        constructor() {
            // Core components
            this.tremorDetector = null;
            this.artRenderer = null;

            // DOM elements
            this.canvas = null;
            this.canvasOverlay = null;
            this.modeIndicator = null;

            // Control elements
            this.sensitivitySlider = null;
            this.smoothingSlider = null;
            this.lineWidthSlider = null;
            this.opacitySlider = null;
            this.colorPicker = null;
            this.modeButtons = null;
            this.clearButton = null;
            this.exportButton = null;

            // Display elements
            this.tremorIntensityDisplay = null;
            this.pointsDrawnDisplay = null;
            this.modeNameDisplay = null;
            this.sensitivityValue = null;
            this.smoothingValue = null;
            this.lineWidthValue = null;
            this.opacityValue = null;
            this.colorValue = null;

            // State
            this.isInitialized = false;
            this.isDrawing = false;
            this.currentMode = 'lines';

            // Settings
            this.settings = {
                sensitivity: 1.0,
                smoothing: 30,
                lineWidth: 2,
                opacity: 80,
                color: '#00d4ff',
                mode: 'lines'
            };

            // Animation
            this.displayUpdateInterval = null;

            // Initialize
            this.init();
        }

        /* ============================================
           INITIALIZATION
           ============================================ */

        init() {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        }

        initializeApp() {
            // Get DOM elements
            this.getDOMElements();

            // Initialize components
            this.initializeComponents();

            // Load saved settings
            this.loadSettings();

            // Setup event listeners
            this.setupEventListeners();

            // Start display updates
            this.startDisplayUpdates();

            this.isInitialized = true;
            console.log('Mouse Tremor Art initialized successfully');
        }

        getDOMElements() {
            // Canvas
            this.canvas = document.getElementById('art-canvas');
            this.canvasOverlay = document.getElementById('canvas-overlay');
            this.modeIndicator = document.getElementById('mode-indicator');

            // Controls
            this.sensitivitySlider = document.getElementById('sensitivity-slider');
            this.smoothingSlider = document.getElementById('smoothing-slider');
            this.lineWidthSlider = document.getElementById('linewidth-slider');
            this.opacitySlider = document.getElementById('opacity-slider');
            this.colorPicker = document.getElementById('color-picker');
            this.modeButtons = document.querySelectorAll('.mode-button');
            this.clearButton = document.getElementById('clear-button');
            this.exportButton = document.getElementById('export-button');

            // Displays
            this.tremorIntensityDisplay = document.getElementById('tremor-intensity-display');
            this.pointsDrawnDisplay = document.getElementById('points-drawn-display');
            this.modeNameDisplay = document.getElementById('mode-name');
            this.sensitivityValue = document.getElementById('sensitivity-value');
            this.smoothingValue = document.getElementById('smoothing-value');
            this.lineWidthValue = document.getElementById('linewidth-value');
            this.opacityValue = document.getElementById('opacity-value');
            this.colorValue = document.getElementById('color-value');
        }

        initializeComponents() {
            // Create tremor detector
            this.tremorDetector = new window.TremorDetector();
            this.tremorDetector.startTracking();

            // Create art renderer
            this.artRenderer = new window.ArtRenderer(this.canvas);
            this.artRenderer.startRendering();

            // Set callbacks
            this.tremorDetector.onMovementStart = () => this.handleMovementStart();
        }

        /* ============================================
           EVENT LISTENERS
           ============================================ */

        setupEventListeners() {
            // Mouse movement on canvas
            this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            this.canvas.addEventListener('mouseenter', () => this.handleMouseEnter());
            this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());

            // Sensitivity slider
            this.sensitivitySlider.addEventListener('input', (e) => {
                this.settings.sensitivity = parseFloat(e.target.value);
                this.tremorDetector.setSensitivity(this.settings.sensitivity);
                this.updateSensitivityDisplay();
                this.updateSliderFill(this.sensitivitySlider);
            });

            // Smoothing slider
            this.smoothingSlider.addEventListener('input', (e) => {
                this.settings.smoothing = parseFloat(e.target.value);
                this.tremorDetector.setSmoothing(this.settings.smoothing);
                this.updateSmoothingDisplay();
                this.updateSliderFill(this.smoothingSlider);
            });

            // Line width slider
            this.lineWidthSlider.addEventListener('input', (e) => {
                this.settings.lineWidth = parseFloat(e.target.value);
                this.artRenderer.setLineWidth(this.settings.lineWidth);
                this.updateLineWidthDisplay();
                this.updateSliderFill(this.lineWidthSlider);
            });

            // Opacity slider
            this.opacitySlider.addEventListener('input', (e) => {
                this.settings.opacity = parseFloat(e.target.value);
                this.artRenderer.setStrokeOpacity(this.settings.opacity / 100);
                this.updateOpacityDisplay();
                this.updateSliderFill(this.opacitySlider);
            });

            // Color picker
            this.colorPicker.addEventListener('input', (e) => {
                this.settings.color = e.target.value;
                this.artRenderer.setStrokeColor(this.settings.color);
                this.updateColorDisplay();
            });

            // Mode buttons
            this.modeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const mode = button.getAttribute('data-mode');
                    this.setDrawingMode(mode);
                });
            });

            // Clear button
            this.clearButton.addEventListener('click', () => this.clearCanvas());

            // Export button
            this.exportButton.addEventListener('click', () => this.exportArt());

            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => this.handleKeyboard(e));

            // Initialize slider fills
            this.updateAllSliderFills();
        }

        /* ============================================
           MOUSE HANDLING
           ============================================ */

        handleMouseMove(e) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const timestamp = performance.now();

            // Update tremor detector
            const tremorData = this.tremorDetector.updatePosition(x, y, timestamp);

            // Draw if we have valid tremor data
            if (tremorData) {
                this.artRenderer.drawTremorData(tremorData);
                this.isDrawing = true;
            }
        }

        handleMouseEnter() {
            // Reset tremor detector state
            this.tremorDetector.hasStarted = false;
        }

        handleMouseLeave() {
            this.isDrawing = false;
        }

        handleMovementStart() {
            // Hide overlay on first movement
            if (this.canvasOverlay) {
                this.canvasOverlay.classList.add('hidden');
            }
        }

        /* ============================================
           DRAWING MODE CONTROL
           ============================================ */

        setDrawingMode(mode) {
            this.settings.mode = mode;
            this.currentMode = mode;

            // Update renderer
            this.artRenderer.setDrawingMode(mode);

            // Update UI
            this.modeButtons.forEach(button => {
                if (button.getAttribute('data-mode') === mode) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });

            // Update mode display
            this.updateModeDisplay();

            // Save settings
            this.saveSettings();
        }

        /* ============================================
           CANVAS OPERATIONS
           ============================================ */

        clearCanvas() {
            this.artRenderer.clearCanvas();
            this.tremorDetector.resetState();

            // Show overlay again
            if (this.canvasOverlay) {
                this.canvasOverlay.classList.remove('hidden');
            }

            // Reset displays
            this.updatePointsDisplay();
        }

        async exportArt() {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const filename = `tremor-art-${timestamp}.png`;

            const success = await this.artRenderer.downloadPNG(filename);

            if (success) {
                console.log('Art exported successfully:', filename);
            } else {
                console.error('Failed to export art');
            }
        }

        /* ============================================
           KEYBOARD SHORTCUTS
           ============================================ */

        handleKeyboard(e) {
            // Ignore if typing in input
            if (e.target.tagName === 'INPUT') return;

            switch (e.key.toLowerCase()) {
                case 'c':
                    this.clearCanvas();
                    break;
                case 'e':
                    this.exportArt();
                    break;
                case '1':
                    this.setDrawingMode('lines');
                    break;
                case '2':
                    this.setDrawingMode('spikes');
                    break;
                case '3':
                    this.setDrawingMode('shards');
                    break;
                case '4':
                    this.setDrawingMode('organic');
                    break;
            }
        }

        /* ============================================
           DISPLAY UPDATES
           ============================================ */

        startDisplayUpdates() {
            // Update displays at 10 FPS (every 100ms)
            this.displayUpdateInterval = setInterval(() => {
                this.updateTremorIntensityDisplay();
                this.updatePointsDisplay();
            }, 100);
        }

        updateTremorIntensityDisplay() {
            if (this.tremorIntensityDisplay) {
                const intensity = this.tremorDetector.getTremorIntensity();
                this.tremorIntensityDisplay.textContent = intensity.toFixed(1);
            }
        }

        updatePointsDisplay() {
            if (this.pointsDrawnDisplay) {
                const points = this.tremorDetector.getTotalPoints();
                this.pointsDrawnDisplay.textContent = points.toLocaleString();
            }
        }

        updateModeDisplay() {
            if (this.modeNameDisplay) {
                const modeNames = {
                    'lines': 'Lines',
                    'spikes': 'Spikes',
                    'shards': 'Shards',
                    'organic': 'Organic'
                };
                this.modeNameDisplay.textContent = modeNames[this.currentMode] || this.currentMode;
            }
        }

        updateSensitivityDisplay() {
            if (this.sensitivityValue) {
                this.sensitivityValue.textContent = `${this.settings.sensitivity.toFixed(1)}x`;
            }
        }

        updateSmoothingDisplay() {
            if (this.smoothingValue) {
                this.smoothingValue.textContent = `${Math.round(this.settings.smoothing)}%`;
            }
        }

        updateLineWidthDisplay() {
            if (this.lineWidthValue) {
                this.lineWidthValue.textContent = `${this.settings.lineWidth.toFixed(1)}px`;
            }
        }

        updateOpacityDisplay() {
            if (this.opacityValue) {
                this.opacityValue.textContent = `${Math.round(this.settings.opacity)}%`;
            }
        }

        updateColorDisplay() {
            if (this.colorValue) {
                this.colorValue.textContent = this.settings.color.toUpperCase();
            }
        }

        /* ============================================
           SLIDER FILL EFFECT
           ============================================ */

        updateSliderFill(slider) {
            const min = parseFloat(slider.min);
            const max = parseFloat(slider.max);
            const value = parseFloat(slider.value);
            const percentage = ((value - min) / (max - min)) * 100;

            slider.style.backgroundPosition = `${100 - percentage}% 0`;
        }

        updateAllSliderFills() {
            this.updateSliderFill(this.sensitivitySlider);
            this.updateSliderFill(this.smoothingSlider);
            this.updateSliderFill(this.lineWidthSlider);
            this.updateSliderFill(this.opacitySlider);
        }

        /* ============================================
           SETTINGS PERSISTENCE
           ============================================ */

        saveSettings() {
            try {
                localStorage.setItem('tremorArtSettings', JSON.stringify(this.settings));
            } catch (error) {
                console.warn('Failed to save settings:', error);
            }
        }

        loadSettings() {
            try {
                const saved = localStorage.getItem('tremorArtSettings');
                if (saved) {
                    const settings = JSON.parse(saved);

                    // Apply saved settings
                    if (settings.sensitivity !== undefined) {
                        this.settings.sensitivity = settings.sensitivity;
                        this.sensitivitySlider.value = settings.sensitivity;
                        this.tremorDetector.setSensitivity(settings.sensitivity);
                    }

                    if (settings.smoothing !== undefined) {
                        this.settings.smoothing = settings.smoothing;
                        this.smoothingSlider.value = settings.smoothing;
                        this.tremorDetector.setSmoothing(settings.smoothing);
                    }

                    if (settings.lineWidth !== undefined) {
                        this.settings.lineWidth = settings.lineWidth;
                        this.lineWidthSlider.value = settings.lineWidth;
                        this.artRenderer.setLineWidth(settings.lineWidth);
                    }

                    if (settings.opacity !== undefined) {
                        this.settings.opacity = settings.opacity;
                        this.opacitySlider.value = settings.opacity;
                        this.artRenderer.setStrokeOpacity(settings.opacity / 100);
                    }

                    if (settings.color !== undefined) {
                        this.settings.color = settings.color;
                        this.colorPicker.value = settings.color;
                        this.artRenderer.setStrokeColor(settings.color);
                    }

                    if (settings.mode !== undefined) {
                        this.setDrawingMode(settings.mode);
                    }

                    // Update displays
                    this.updateAllDisplays();
                    this.updateAllSliderFills();
                }
            } catch (error) {
                console.warn('Failed to load settings:', error);
            }
        }

        updateAllDisplays() {
            this.updateSensitivityDisplay();
            this.updateSmoothingDisplay();
            this.updateLineWidthDisplay();
            this.updateOpacityDisplay();
            this.updateColorDisplay();
            this.updateModeDisplay();
        }

        /* ============================================
           CLEANUP
           ============================================ */

        destroy() {
            // Stop display updates
            if (this.displayUpdateInterval) {
                clearInterval(this.displayUpdateInterval);
            }

            // Destroy components
            if (this.tremorDetector) {
                this.tremorDetector.destroy();
            }

            if (this.artRenderer) {
                this.artRenderer.destroy();
            }

            // Remove event listeners
            document.removeEventListener('keydown', (e) => this.handleKeyboard(e));
        }
    }

    /* ============================================
       AUTO-INITIALIZE
       ============================================ */

    // Create global instance
    window.tremorArtApp = new UIController();

})();
