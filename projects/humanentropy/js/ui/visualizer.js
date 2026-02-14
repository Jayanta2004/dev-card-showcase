import { MathUtils } from '../utils/math-utils.js';

/**
 * Visualizer
 * Renders the "Illusion of Randomness" on the main canvas.
 * Particles go from chaotic to ordered based on user predictability.
 */
export class Visualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.maxParticles = 150;
        this.entropyLevel = 1.0; // 1.0 = High Entropy (Chaos), 0.0 = Low Entropy (Order)
        this.targetPos = { x: 0, y: 0 };

        this.resize();
        this.initParticles();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    initParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 2 + 1,
                color: '#fff',
                angle: Math.random() * Math.PI * 2,
                targetIndex: i // For grid formation
            });
        }
    }

    /**
     * Updates particle physics based on entropy.
     * @param {Object} inputState - current mouse pos
     * @param {number} entropyScore - 0 to 1 (normalized predictability inverted)
     */
    update(inputState, entropyScore) {
        // entropyScore: 1.0 (High Entropy/Chaos) -> 0.0 (Low Entropy/Order)
        // If user is predictable (Low Entropy), particles organize.
        // If user is random (High Entropy), particles wander.

        // Invert key: 
        // Logic input: "Predictability" (0-1). 
        // Let's say entropyScore passed here is actually "Predictability" for easier logic math?
        // No, let's keep it as Entropy (1 = Chaos).

        this.entropyLevel = MathUtils.lerp(this.entropyLevel, entropyScore, 0.05);
        this.targetPos = inputState || { x: this.centerX, y: this.centerY };

        // Grid destinations for order mode
        const cols = 15;
        const spacing = 40;
        const offsetX = this.centerX - (cols * spacing) / 2;
        const offsetY = this.centerY - (Math.ceil(this.maxParticles / cols) * spacing) / 2;

        this.particles.forEach((p, i) => {
            // Chaos vs Order forces

            // 1. Brownian / Chaotic Force (High Entropy)
            const chaosForce = {
                x: (Math.random() - 0.5) * 20 * this.entropyLevel,
                y: (Math.random() - 0.5) * 20 * this.entropyLevel
            };

            // 2. Attraction Force (Low Entropy - Follow User or Grid)
            // If very low entropy (highly predictable), snap to grid.
            // If Med entropy, swarm mouse.

            let destX, destY;

            if (this.entropyLevel < 0.3) {
                // Grid Formation
                const col = i % cols;
                const row = Math.floor(i / cols);
                destX = offsetX + col * spacing;
                destY = offsetY + row * spacing;
            } else {
                // Mouse Swarm
                destX = this.targetPos.x;
                destY = this.targetPos.y;
            }

            // Vector to dest
            const dx = destX - p.x;
            const dy = destY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Attraction strength inversely proportional to entropy
            // High entropy = 0 attraction. Low entropy = strong attraction.
            const attractStrength = (1 - this.entropyLevel) * 0.05;

            p.vx += dx * attractStrength;
            p.vy += dy * attractStrength;

            // Apply Chaos
            p.vx += (Math.random() - 0.5) * this.entropyLevel;
            p.vy += (Math.random() - 0.5) * this.entropyLevel;

            // Damping
            p.vx *= 0.9;
            p.vy *= 0.9;

            // Update
            p.x += p.vx;
            p.y += p.vy;

            // Boundaries (Wrap)
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            // Color shift
            // High entropy = Cyan (Active/Random)
            // Low entropy = Red (Detected/System Control)
            // 0-1 range
            // We want nice interpolation.
            // Cyan: 180 deg hue. Red: 340/0 deg hue.
            // Let's do roughly:
            // Entropy 1 -> Cyan (#00f0ff)
            // Entropy 0 -> Red (#ff0055)

            // HSL approach needed or just simple switch? 
            // Keep it simple white/cyan/red triggers.
            if (this.entropyLevel > 0.8) p.color = '#00f0ff';
            else if (this.entropyLevel < 0.3) p.color = '#ff0055';
            else p.color = '#ffffff';
        });
    }

    draw() {
        this.ctx.fillStyle = 'rgba(10, 11, 16, 0.2)'; // Trails
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw connections if low entropy (Order)
        if (this.entropyLevel < 0.5) {
            this.ctx.strokeStyle = 'rgba(255, 0, 85, 0.1)';
            this.ctx.beginPath();
            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const p1 = this.particles[i];
                    const p2 = this.particles[j];
                    const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                    if (dist < 50) {
                        this.ctx.moveTo(p1.x, p1.y);
                        this.ctx.lineTo(p2.x, p2.y);
                    }
                }
            }
            this.ctx.stroke();
        }

        // Draw Predicted Path (Ghost)
        if (this.predictionPath && this.predictionPath.length > 0) {
            this.drawPrediction();
        }
    }

    /**
     * Updates the predicted path to render.
     * @param {Array} path - Array of {x, y} points
     */
    setPredictionPath(path) {
        this.predictionPath = path;
    }

    drawPrediction() {
        this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();

        this.predictionPath.forEach((pt, i) => {
            if (i === 0) this.ctx.moveTo(pt.x, pt.y);
            else this.ctx.lineTo(pt.x, pt.y);
        });

        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw end point indicator
        const end = this.predictionPath[this.predictionPath.length - 1];
        if (end) {
            this.ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
            this.ctx.beginPath();
            this.ctx.arc(end.x, end.y, 10, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
}
