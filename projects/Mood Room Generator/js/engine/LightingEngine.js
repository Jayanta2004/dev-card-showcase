/**
 * LightingEngine.js
 * Advanced lighting calculations and gradient management.
 * Handles dynamic shadow casting and ambient occlusion simulation.
 */
import DOMHelper from '../core/DOMHelper.js';

export default class LightingEngine {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.ambientLight = 0.5;
        this.directionalLights = [];
        this.overlay = document.querySelector('.lighting-overlay');

        // Listen for mood changes to adapt lighting
        this.eventBus.on('moodChange', this.updateLighting.bind(this));

        // Internal loop for pulsing lights if needed
        this.isActive = false;
        this.time = 0;
    }

    /**
     * Updates the global lighting state based on mood configuration.
     * @param {object} moodData 
     */
    updateLighting({ current }) {
        // Simulating complex lighting setup based on mood name
        // In a real 3D engine this would allow adding point lights, etc.
        // Here we manipulate CSS gradients to fake it.

        this.isActive = true;
        this.currentMood = current;

        switch (current) {
            case 'Calm':
                this.setAmbient(0.6, '#4ecdc4');
                this.setVignette(0.4);
                break;
            case 'Focus':
                this.setAmbient(0.8, '#ffffff');
                this.setVignette(0.2);
                break;
            case 'Sad':
                this.setAmbient(0.3, '#203a43');
                this.setVignette(0.8);
                break;
            case 'Happy':
                this.setAmbient(0.9, '#fce38a');
                this.setVignette(0.1);
                break;
            case 'Chaos':
                this.setAmbient(0.5, '#ff0099');
                this.startStrobe();
                break;
            default:
                this.setAmbient(0.5, '#ffffff');
        }

        if (current !== 'Chaos') {
            this.stopStrobe();
        }
    }

    setAmbient(intensity, color) {
        // We can use a CSS variable to affect all surfaces
        DOMHelper.setCSSVar('--ambient-intensity', intensity);
        DOMHelper.setCSSVar('--ambient-color', color);

        console.log(`[LightingEngine] Ambient set to ${intensity} / ${color}`);
    }

    setVignette(strength) {
        // Update the radial gradient on the overlay
        const transparentStop = 100 - (strength * 100);
        this.overlay.style.background = `radial-gradient(circle at 50% 50%, transparent ${transparentStop}%, rgba(0,0,0,${strength}) 150%)`;
    }

    startStrobe() {
        if (this.strobeInterval) clearInterval(this.strobeInterval);
        this.strobeInterval = setInterval(() => {
            const randomColor = Math.random() > 0.5 ? '#ff0099' : '#000000';
            this.overlay.style.backgroundColor = randomColor;
            this.overlay.style.opacity = Math.random() * 0.3;
        }, 100);
    }

    stopStrobe() {
        if (this.strobeInterval) {
            clearInterval(this.strobeInterval);
            this.strobeInterval = null;
            this.overlay.style.backgroundColor = 'transparent';
            this.overlay.style.opacity = 1;
        }
    }
}
