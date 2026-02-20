/**
 * BlinkClick Main Application
 * Orchestrates the neural interaction flow.
 */

class BlinkClickApp {
    constructor() {
        this.camera = new CameraEngine('webcam');
        this.detector = new BlinkDetector();
        this.ui = new UIController();
        this.audio = new AudioEngine();
        this.particles = new ParticleSystem('detection-canvas');

        this.canvas = document.getElementById('detection-canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

        this.isProcessing = false;
        this.setupEventListeners();
        this.initBackgroundGlitch();
    }

    /**
     * Bind DOM events
     */
    setupEventListeners() {
        this.ui.startBtn.addEventListener('click', () => {
            this.audio.init();
            this.startSystem();
        });
    }

    /**
     * Start the entire system
     */
    async startSystem() {
        try {
            this.ui.logTerminal("REQUESTING WEBCAM ACCESS...");
            await this.camera.start();

            this.ui.hideOverlay();
            this.ui.logTerminal("WEBCAM LINK ESTABLISHED.");
            this.audio.playUI();

            // Sync canvas dimensions
            const dims = this.camera.getDimensions();
            this.canvas.width = dims.width;
            this.canvas.height = dims.height;

            // Setup detector regions
            this.detector.setupRegions(dims.width, dims.height);

            this.isProcessing = true;
            this.processLoop();

            this.ui.enableInterface();
        } catch (err) {
            this.ui.logTerminal("FAILED TO INITIALIZE OPTICAL SENSORS.");
            alert("Camera access is required for this experiment.");
        }
    }

    /**
     * Main processing loop
     */
    processLoop() {
        if (!this.isProcessing) return;

        if (this.camera.isReady()) {
            // Clear and draw frame overlay if needed
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // In a real app we might draw the face detected points, 
            // but for this pixel-diff approach we just process.
            this.ctx.drawImage(this.camera.video, 0, 0, this.canvas.width, this.canvas.height);

            const results = this.detector.analyze(this.camera.video, this.ctx);

            if (results) {
                this.ui.updateHUD(results);

                // Draw neural heatmap
                this.ui.drawHeatmap(this.ctx, results.heatmap, this.detector.gridCols, this.detector.gridRows);

                if (results.detected) {
                    this.audio.playSuccess();
                    this.ui.triggerSuccess(results.comboCount);
                    this.particles.burst(this.canvas.width / 2, this.canvas.height / 2, '#7000ff', 40);
                }
            }

            this.particles.update();
        }

        requestAnimationFrame(() => this.processLoop());
    }

    /**
     * Aesthetic background effect
     */
    initBackgroundGlitch() {
        this.glitch = new GlitchEngine('background-glitch');
        this.glitch.render();
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    window.app = new BlinkClickApp();
});
