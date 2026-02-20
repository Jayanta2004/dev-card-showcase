import { AudioController } from './audio.js';
import { VisualEngine } from './visuals.js';
import { UIController } from './ui.js';
import { InstrumentEngine } from './instruments.js';

class App {
    constructor() {
        this.audioController = new AudioController();
        this.visualEngine = new VisualEngine();
        this.instrumentEngine = new InstrumentEngine(this.audioController);
        this.uiController = new UIController(this);

        this.isPaused = false;

        this.init();
    }

    init() {
        console.log('CHROMAWAVE Initializing...');

        // Resize optimization
        window.addEventListener('resize', () => {
            this.visualEngine.resize();
        });

        // Start Loop
        this.animate();
    }

    startAudioContext() {
        return this.audioController.init();
    }

    animate() {
        if (!this.isPaused) {
            // 1. Get Audio Data
            const audioData = this.audioController.getAnalysis();

            // 2. Update Visuals
            this.visualEngine.render(audioData);

            // 3. Update Debug Stats
            this.uiController.updateStats(audioData);
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Start App when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
