// js/main.js
import { StateManager } from './engine/stateManager.js';
import { ScrollInverter } from './logic/scrollInverter.js';
import { Renderer } from './ui/renderer.js';
import { TimelineLogic } from './logic/timeline.js';
import { GlitchEffects } from './ui/glitchEffects.js';

class App {
    constructor() {
        this.stateManager = new StateManager();
        this.scrollInverter = new ScrollInverter(document.querySelector('.reverse-scroll-container'));
        this.renderer = new Renderer(document.getElementById('timeline'));
        this.glitchEffects = new GlitchEffects();
        this.timelineLogic = new TimelineLogic(this.stateManager, this.renderer, this.glitchEffects);
        
        this.init();
    }

    init() {
        // Initialize cursor
        this.initCursor();
        
        // Start scroll inverter
        this.scrollInverter.init();
        
        // Load initial state
        if (this.stateManager.hasSavedState()) {
            this.stateManager.loadState();
        } else {
            this.stateManager.initDefaultState();
        }
        
        // Initial render
        this.timelineLogic.renderCurrentState();
        
        // Setup global event listeners
        this.setupEventListeners();
        
        console.log("ParadoxSite Engine Initialized.");
    }

    initCursor() {
        const cursor = document.getElementById('cursor-follower');
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        document.addEventListener('mousedown', () => cursor.classList.add('active'));
        document.addEventListener('mouseup', () => cursor.classList.remove('active'));
        
        // Add hover effects on clickable elements
        document.addEventListener('mouseover', (e) => {
            if(e.target.tagName === 'BUTTON' || e.target.classList.contains('clickable')) {
                cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if(e.target.tagName === 'BUTTON' || e.target.classList.contains('clickable')) {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            }
        });
    }

    setupEventListeners() {
        // Handle global timeline resets or major paradox triggers
        document.addEventListener('paradoxTriggered', (e) => {
            this.handleParadox(e.detail);
        });
    }
    
    async handleParadox(details) {
        // Trigger global glitch
        this.glitchEffects.triggerGlobalGlitch();
        
        // Wait for visual effect
        await new Promise(r => setTimeout(r, 500));
        
        // Process paradox logical rewrite
        this.timelineLogic.processParadox(details.nodeId, details.choiceId);
    }
}

// Boot application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.ParadoxApp = new App();
});
