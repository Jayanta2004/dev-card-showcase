/**
 * ScreamScroll - UI Manager
 * 
 * Coordinates visual feedback, visualizer rendering,
 * and HUD updates based on audio and scroll state.
 */

class UIManager {
    constructor() {
        this.canvas = document.getElementById('audio-canvas');
        this.ctx = this.canvas?.getContext('2d');
        this.intensityBar = document.querySelector('.intensity-bar-fill');
        this.energyField = document.querySelector('.energy-field');
        this.statusDot = document.querySelector('.status-dot');
        this.statusText = document.querySelector('.status-text');
        this.scrollContainer = document.querySelector('.scroll-container');

        this.isMoving = false;

        // Canvas sizing
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    /**
     * Update UI based on current state
     * @param {Object} audioData - State from AudioProcessor
     * @param {Object} scrollState - State from ScrollingEngine
     */
    update(audioData, scrollState) {
        this.updateVisualizer(audioData.frequencyData);
        this.updateIntensity(audioData.sustained);
        this.updateHistoryGraph(audioData.sustained);
        this.updateMotionEffects(scrollState.velocity);

        // Glitch Effect on peak
        if (audioData.current > 0.6) {
            this.triggerGlitch();
        }

        // Update status indicators
        if (audioData.sustained > 0.01) {
            this.statusDot.classList.add('active');
            this.statusText.textContent = audioData.isWhistling ? "Ascending" : "Listening";
            this.energyField.classList.add('active');

            // Particles
            if (window.ParticleSystem) {
                window.ParticleSystem.update(audioData.sustained, scrollState.velocity);
            }
        } else {
            this.statusDot.classList.remove('active');
            this.statusText.textContent = "Standby";
            this.energyField.classList.remove('active');
        }
    }

    updateHistoryGraph(amplitude) {
        // Implement history graph logic here - we'll need a way to store history in UIManager or pass it
        // For now, let's just draw a rolling wave on top of the visualizer or similar
        // We'll simplify and use a CSS approach or a second canvas if needed
    }

    triggerGlitch() {
        document.body.classList.add('glitch-active');
        setTimeout(() => document.body.classList.remove('glitch-active'), 150);
    }

    updateVisualizer(data) {
        if (!this.ctx || !data) return;

        const width = this.canvas.width;
        const height = this.canvas.height;
        const barWidth = (width / data.length) * 2;
        let x = 0;

        this.ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < data.length; i++) {
            const barHeight = (data[i] / 255) * height;

            // Neon gradient for bars
            const grad = this.ctx.createLinearGradient(0, height, 0, 0);
            grad.addColorStop(0, '#00f2ff');
            grad.addColorStop(1, '#7000ff');

            this.ctx.fillStyle = grad;
            this.ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

            x += barWidth;
        }
    }

    updateIntensity(amplitude) {
        if (!this.intensityBar) return;
        const percent = Math.min(100, amplitude * 200); // Scale up for visibility
        this.intensityBar.style.width = `${percent}%`;
    }

    updateMotionEffects(velocity) {
        if (!this.scrollContainer) return;

        // Apply visual feedback for movement
        if (velocity > 5) {
            this.scrollContainer.classList.add('motion-blur');

            // Shake effect for high intensity
            if (velocity > 20) {
                document.body.classList.add('text-moving');
            } else {
                document.body.classList.remove('text-moving');
            }
        } else {
            this.scrollContainer.classList.remove('motion-blur');
            document.body.classList.remove('text-moving');
        }
    }

    hideInitOverlay() {
        const overlay = document.querySelector('.init-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
            // Remove from DOM after transition
            setTimeout(() => overlay.style.display = 'none', 800);
        }
    }
}

// Export as factory
window.createUIManager = () => new UIManager();
