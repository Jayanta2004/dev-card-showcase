import { Simulation } from './core/Simulation.js';
import { UIManager } from './ui/UIManager.js';
import { CanvasGraph } from './ui/CanvasGraph.js';
import { InputHandler } from './ui/InputHandler.js';

import { NotificationSystem } from './utils/NotificationSystem.js';
import { ThemeManager } from './ui/ThemeManager.js';
import { HelpModal } from './ui/HelpModal.js';

class App {
    constructor() {
        this.simCanvas = document.getElementById('sim-canvas');
        this.graphCanvas = document.getElementById('graph-canvas');

        this.themeManager = new ThemeManager();
        this.notifications = new NotificationSystem();
        this.helpModal = new HelpModal();
        this.simulation = new Simulation(this.simCanvas);
        this.graph = new CanvasGraph('graph-canvas');
        this.uiManager = new UIManager(this.simulation, this.graph, this.notifications);
        this.inputHandler = new InputHandler(this.simCanvas, this.simulation);

        this.handleResize();
        window.addEventListener('resize', this.handleResize.bind(this));

        // Start Loop
        requestAnimationFrame(this.loop.bind(this));
    }

    handleResize() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        this.simulation.resize(w, h);
        this.graph.resize(w, h);
    }

    loop(timestamp) {
        // Update Logic
        this.simulation.update(timestamp);

        // Update UI Stats occasionally? Or every frame?
        this.uiManager.updateStats();

        // Loop
        requestAnimationFrame(this.loop.bind(this));
    }
}

// Bootstrap
// Bootstrap
const init = () => {
    try {
        window.app = new App();
        console.log('LiquidAssets Initialized.');
    } catch (e) {
        console.error('Initialization Failed:', e);
        alert('Error: ' + e.message);
    }
};

if (document.readyState === 'loading') { // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', init);
} else { // `DOMContentLoaded` has already fired
    init();
}
