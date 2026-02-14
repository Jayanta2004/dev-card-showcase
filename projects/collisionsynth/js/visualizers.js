/**
 * @file visualizers.js
 * @description Advanced audio visualization for CollisionSynth.
 * Provides spectrum analysis, waveform mapping, and reactive geometry.
 */

class Visualizer {
    constructor(audioEngine, canvas) {
        this.audio = audioEngine;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.analyser = null;
        this.dataArray = null;
        this.bufferLength = 0;

        this.active = false;
        this.type = 'circular'; // 'bars', 'oscilloscope', 'circular'
    }

    init() {
        if (!this.audio.initialized) return;

        this.analyser = this.audio.ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        // Connect Master to Analyser without interrupting chain
        this.audio.masterGain.connect(this.analyser);
        this.active = true;

        // Cycle types on click maybe?
        console.log("Visualizer active in " + this.type + " mode");
    }

    /**
     * Toggles between available visualization modes.
     */
    nextMode() {
        const modes = ['circular', 'bars', 'oscilloscope', 'waveform'];
        const idx = modes.indexOf(this.type);
        this.type = modes[(idx + 1) % modes.length];
    }

    /**
     * Main draw call, executed every frame by the orchestrator.
     */
    draw() {
        if (!this.active) return;

        this.ctx.save();
        switch (this.type) {
            case 'circular':
                this.analyser.getByteFrequencyData(this.dataArray);
                this.drawCircularSpectrum();
                break;
            case 'bars':
                this.analyser.getByteFrequencyData(this.dataArray);
                this.drawBars();
                break;
            case 'oscilloscope':
                this.analyser.getByteTimeDomainData(this.dataArray);
                this.drawOscilloscope();
                break;
            case 'waveform':
                this.analyser.getByteTimeDomainData(this.dataArray);
                this.drawWaveform();
                break;
        }
        this.ctx.restore();
    }

    drawCircularSpectrum() {
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        const radius = Math.min(cx, cy) * 0.4;

        this.ctx.translate(cx, cy);
        this.ctx.beginPath();

        for (let i = 0; i < this.bufferLength; i++) {
            const val = this.dataArray[i] / 255.0;
            const angle = (i / this.bufferLength) * Math.PI * 2;
            const r = radius + (val * 100);

            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;

            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }

        this.ctx.closePath();
        this.ctx.strokeStyle = Utils.getCSSVar('--accent-primary');
        this.ctx.globalAlpha = 0.2;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Inner Glow
        const gradient = this.ctx.createRadialGradient(0, 0, radius * 0.8, 0, 0, radius * 1.2);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, `rgba(0, 242, 255, ${0.05 + (this.dataArray[10] / 500)})`);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }

    drawBars() {
        const barWidth = (this.canvas.width / this.bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            const barHeight = (this.dataArray[i] / 255) * this.canvas.height * 0.3;
            const intensity = this.dataArray[i] / 255;

            this.ctx.fillStyle = `rgba(255, 0, 122, ${0.1 + intensity * 0.4})`;
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }

    drawOscilloscope() {
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = Utils.getCSSVar('--accent-primary');
        this.ctx.beginPath();

        const sliceWidth = this.canvas.width * 1.0 / this.bufferLength;
        let x = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            const v = this.dataArray[i] / 128.0;
            const y = v * this.canvas.height / 2;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            x += sliceWidth;
        }

        this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
        this.ctx.globalAlpha = 0.4;
        this.ctx.stroke();
    }

    drawWaveform() {
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = Utils.getCSSVar('--accent-secondary');
        this.ctx.beginPath();

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const step = this.canvas.width / this.bufferLength;

        for (let i = 0; i < this.bufferLength; i++) {
            const v = (this.dataArray[i] - 128) / 128.0;
            const x = i * step;
            const y = centerY + v * 200;

            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.globalAlpha = 0.3;
        this.ctx.stroke();
    }
}
