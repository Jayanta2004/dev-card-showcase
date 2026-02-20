class Visualizer {
    constructor(canvas, audioEngine) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioEngine = audioEngine;

        this.width = canvas.width;
        this.height = canvas.height;

        this.barCount = 64;
        this.barWidth = 0;
        this.barGap = 2;

        this.colors = {
            primary: '#6366f1',
            secondary: '#ec4899',
            accent: '#14b8a6',
            background: 'rgba(0, 0, 0, 0.3)'
        };

        this.smoothedBars = new Array(this.barCount).fill(0);
        this.smoothingFactor = 0.7;

        this.mode = 'bars';
        this.isActive = true;

        this.resize();
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        this.width = rect.width;
        this.height = rect.height;
        this.barWidth = (this.width - (this.barCount - 1) * this.barGap) / this.barCount;
    }

    draw() {
        if (!this.isActive) return;

        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.width, this.height);

        if (this.mode === 'bars') {
            this.drawFrequencyBars();
        } else if (this.mode === 'waveform') {
            this.drawWaveform();
        } else if (this.mode === 'circular') {
            this.drawCircular();
        }
    }

    drawFrequencyBars() {
        const frequencyData = this.audioEngine.getFrequencyData();
        if (!frequencyData) return;

        const step = Math.floor(frequencyData.length / this.barCount);

        for (let i = 0; i < this.barCount; i++) {
            const index = i * step;
            const value = frequencyData[index] / 255;

            this.smoothedBars[i] = (this.smoothingFactor * this.smoothedBars[i]) +
                ((1 - this.smoothingFactor) * value);

            const barHeight = this.smoothedBars[i] * this.height;
            const x = i * (this.barWidth + this.barGap);
            const y = this.height - barHeight;

            const gradient = this.ctx.createLinearGradient(x, y, x, this.height);
            gradient.addColorStop(0, this.colors.secondary);
            gradient.addColorStop(0.5, this.colors.primary);
            gradient.addColorStop(1, this.colors.accent);

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, this.barWidth, barHeight);

            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = this.colors.primary;
            this.ctx.fillRect(x, y, this.barWidth, barHeight);
            this.ctx.shadowBlur = 0;
        }
    }

    drawWaveform() {
        const frequencyData = this.audioEngine.getFrequencyData();
        if (!frequencyData) return;

        this.ctx.beginPath();
        this.ctx.strokeStyle = this.colors.primary;
        this.ctx.lineWidth = 2;

        const sliceWidth = this.width / frequencyData.length;
        let x = 0;

        for (let i = 0; i < frequencyData.length; i++) {
            const v = frequencyData[i] / 255;
            const y = v * this.height;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.ctx.stroke();

        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.colors.primary;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    drawCircular() {
        const frequencyData = this.audioEngine.getFrequencyData();
        if (!frequencyData) return;

        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(this.width, this.height) / 3;

        const step = Math.floor(frequencyData.length / this.barCount);
        const angleStep = (Math.PI * 2) / this.barCount;

        for (let i = 0; i < this.barCount; i++) {
            const index = i * step;
            const value = frequencyData[index] / 255;

            this.smoothedBars[i] = (this.smoothingFactor * this.smoothedBars[i]) +
                ((1 - this.smoothingFactor) * value);

            const angle = i * angleStep - Math.PI / 2;
            const barLength = this.smoothedBars[i] * radius;

            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + barLength);
            const y2 = centerY + Math.sin(angle) * (radius + barLength);

            const hue = (i / this.barCount) * 360;
            this.ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`;
            this.ctx.lineWidth = 3;

            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();

            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = this.ctx.strokeStyle;
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        }
    }

    setMode(mode) {
        if (['bars', 'waveform', 'circular'].includes(mode)) {
            this.mode = mode;
        }
    }

    start() {
        this.isActive = true;
    }

    stop() {
        this.isActive = false;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Visualizer;
}
