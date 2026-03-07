// PULSEMATRIX · rhythmic pattern laboratory #5976
// Interactive rhythm grid with pulsating geometric nodes and synchronized audio

class PulseMatrix {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.currentStep = 0;
        this.tempo = 120;
        this.intensity = 1.0;
        this.syncopation = 0.3;
        this.gridSize = 8;
        this.grid = this.createEmptyGrid();
        this.selectedSound = 'kick';
        this.sounds = {};
        this.animationId = null;
        this.lastTime = 0;
        this.fps = 60;
        this.frameCount = 0;
        this.stepInterval = null;
        this.waveformData = new Uint8Array(1024);

        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupAudio();
        this.setupEventListeners();
        this.setupSoundLibrary();
        this.startAnimation();
        this.updateUI();
    }

    createEmptyGrid() {
        return Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(false));
    }

    setupCanvas() {
        this.canvas = document.getElementById('rhythm-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.waveformCanvas = document.getElementById('waveform-canvas');
        this.waveformCtx = this.waveformCanvas.getContext('2d');

        // Set canvas size
        this.resizeCanvas();

        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = 400;
        this.waveformCanvas.width = rect.width;
        this.waveformCanvas.height = 80;
        this.cellSize = Math.min(this.canvas.width / this.gridSize, this.canvas.height / this.gridSize);
    }

    async setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            await this.audioContext.resume();

            // Create analyser for waveform visualization
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.connect(this.audioContext.destination);

            // Create gain node for master volume
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.analyser);
            this.masterGain.gain.value = 0.3;

            this.createSounds();
        } catch (error) {
            console.error('Audio setup failed:', error);
        }
    }

    createSounds() {
        // Create different drum sounds using oscillators and noise
        this.sounds = {
            kick: this.createKickSound(),
            snare: this.createSnareSound(),
            hihat: this.createHiHatSound(),
            clap: this.createClapSound(),
            shaker: this.createShakerSound(),
            cowbell: this.createCowbellSound()
        };
    }

    createKickSound() {
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.8 * this.intensity, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);

            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
    }

    createSnareSound() {
        return () => {
            // Mix of noise and tone
            const noise = this.createNoiseBuffer();
            const noiseSource = this.audioContext.createBufferSource();
            const noiseGain = this.audioContext.createGain();
            const oscillator = this.audioContext.createOscillator();
            const oscGain = this.audioContext.createGain();

            noiseSource.buffer = noise;
            noiseGain.gain.setValueAtTime(0.6 * this.intensity, this.audioContext.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscGain.gain.setValueAtTime(0.3 * this.intensity, this.audioContext.currentTime);
            oscGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

            noiseSource.connect(noiseGain);
            noiseGain.connect(this.masterGain);
            oscillator.connect(oscGain);
            oscGain.connect(this.masterGain);

            noiseSource.start();
            oscillator.start();
            noiseSource.stop(this.audioContext.currentTime + 0.2);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    }

    createHiHatSound() {
        return () => {
            const noise = this.createNoiseBuffer();
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            filter.type = 'highpass';
            filter.frequency.setValueAtTime(7000, this.audioContext.currentTime);

            gainNode.gain.setValueAtTime(0.3 * this.intensity, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

            source.buffer = noise;
            source.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.masterGain);

            source.start();
            source.stop(this.audioContext.currentTime + 0.1);
        };
    }

    createClapSound() {
        return () => {
            const noise = this.createNoiseBuffer();
            const source1 = this.audioContext.createBufferSource();
            const source2 = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            filter.Q.setValueAtTime(1, this.audioContext.currentTime);

            gainNode.gain.setValueAtTime(0.5 * this.intensity, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

            source1.buffer = noise;
            source2.buffer = noise;

            source1.connect(filter);
            source2.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.masterGain);

            source1.start();
            source2.start(this.audioContext.currentTime + 0.01);
            source1.stop(this.audioContext.currentTime + 0.3);
            source2.stop(this.audioContext.currentTime + 0.3);
        };
    }

    createShakerSound() {
        return () => {
            const noise = this.createNoiseBuffer();
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            filter.type = 'highpass';
            filter.frequency.setValueAtTime(5000, this.audioContext.currentTime);

            gainNode.gain.setValueAtTime(0.2 * this.intensity, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

            source.buffer = noise;
            source.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.masterGain);

            source.start();
            source.stop(this.audioContext.currentTime + 0.15);
        };
    }

    createCowbellSound() {
        return () => {
            const oscillator1 = this.audioContext.createOscillator();
            const oscillator2 = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator1.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator2.frequency.setValueAtTime(540, this.audioContext.currentTime);

            gainNode.gain.setValueAtTime(0.4 * this.intensity, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

            oscillator1.connect(gainNode);
            oscillator2.connect(gainNode);
            gainNode.connect(this.masterGain);

            oscillator1.start();
            oscillator2.start();
            oscillator1.stop(this.audioContext.currentTime + 0.5);
            oscillator2.stop(this.audioContext.currentTime + 0.5);
        };
    }

    createNoiseBuffer() {
        const bufferSize = this.audioContext.sampleRate * 0.1;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        return buffer;
    }

    setupEventListeners() {
        // Canvas interaction
        this.canvas.addEventListener('mousedown', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasDrag(e));
        this.canvas.addEventListener('mouseup', () => this.isDragging = false);

        // Control sliders
        document.getElementById('tempo-slider').addEventListener('input', (e) => {
            this.tempo = parseInt(e.target.value);
            this.updateStepInterval();
            this.updateUI();
        });

        document.getElementById('intensity-slider').addEventListener('input', (e) => {
            this.intensity = parseFloat(e.target.value);
            this.updateUI();
        });

        document.getElementById('syncopation-slider').addEventListener('input', (e) => {
            this.syncopation = parseFloat(e.target.value);
            this.updateUI();
        });

        document.getElementById('grid-size-select').addEventListener('change', (e) => {
            this.gridSize = parseInt(e.target.value.split('x')[0]);
            this.grid = this.createEmptyGrid();
            this.resizeCanvas();
            this.updateUI();
        });

        // Buttons
        document.getElementById('play-btn').addEventListener('click', () => this.play());
        document.getElementById('stop-btn').addEventListener('click', () => this.stop());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearGrid());
        document.getElementById('random-btn').addEventListener('click', () => this.randomizeGrid());
        document.getElementById('export-midi-btn').addEventListener('click', () => this.exportMIDI());
        document.getElementById('save-pattern-btn').addEventListener('click', () => this.savePattern());

        // Sound selection
        document.querySelectorAll('.sound-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.sound-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedSound = btn.dataset.sound;
            });
        });
    }

    setupSoundLibrary() {
        // Sound library is already set up in createSounds()
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);

        if (col >= 0 && col < this.gridSize && row >= 0 && row < this.gridSize) {
            this.grid[row][col] = !this.grid[row][col];
            this.isDragging = true;
            this.lastDragValue = this.grid[row][col];
        }
    }

    handleCanvasDrag(e) {
        if (!this.isDragging) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);

        if (col >= 0 && col < this.gridSize && row >= 0 && row < this.gridSize) {
            this.grid[row][col] = this.lastDragValue;
        }
    }

    play() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.currentStep = 0;
        this.updateStepInterval();
        document.getElementById('play-btn').innerHTML = '<i class="fas fa-pause"></i> Pause';
    }

    stop() {
        this.isPlaying = false;
        if (this.stepInterval) {
            clearInterval(this.stepInterval);
            this.stepInterval = null;
        }
        document.getElementById('play-btn').innerHTML = '<i class="fas fa-play"></i> Play';
    }

    updateStepInterval() {
        if (this.stepInterval) {
            clearInterval(this.stepInterval);
        }

        const stepDuration = (60 / this.tempo) * 1000 / this.gridSize; // milliseconds per step

        this.stepInterval = setInterval(() => {
            this.advanceStep();
        }, stepDuration);
    }

    advanceStep() {
        // Play sounds for current step
        for (let row = 0; row < this.gridSize; row++) {
            if (this.grid[row][this.currentStep]) {
                this.playSoundForRow(row);
            }
        }

        this.currentStep = (this.currentStep + 1) % this.gridSize;
        this.updateUI();
    }

    playSoundForRow(row) {
        // Map row to sound type
        const soundMap = ['kick', 'snare', 'hihat', 'clap', 'shaker', 'cowbell', 'kick', 'snare'];
        const soundType = soundMap[row % soundMap.length];

        if (this.sounds[soundType]) {
            this.sounds[soundType]();
        }
    }

    clearGrid() {
        this.grid = this.createEmptyGrid();
    }

    randomizeGrid() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                // Add some syncopation randomness
                const probability = 0.3 + (this.syncopation * 0.4);
                this.grid[row][col] = Math.random() < probability;
            }
        }
    }

    exportMIDI() {
        // Basic MIDI export functionality
        const midiData = this.generateMIDIData();
        const blob = new Blob([midiData], { type: 'audio/midi' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'pulsematrix-pattern.mid';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateMIDIData() {
        // Simplified MIDI generation
        // In a real implementation, you'd use a proper MIDI library
        const header = [0x4D, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x01];
        const tempo = Math.floor(60000000 / this.tempo); // microseconds per quarter note

        // This is a very basic MIDI implementation
        // A full implementation would require a proper MIDI library
        return new Uint8Array([...header, ...Array(100).fill(0)]);
    }

    savePattern() {
        const pattern = {
            grid: this.grid,
            tempo: this.tempo,
            intensity: this.intensity,
            syncopation: this.syncopation,
            gridSize: this.gridSize,
            name: document.getElementById('pattern-name').textContent.replace('Pattern: ', '')
        };

        const blob = new Blob([JSON.stringify(pattern, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'pulsematrix-pattern.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    startAnimation() {
        const animate = (currentTime) => {
            this.frameCount++;
            if (currentTime - this.lastTime >= 1000) {
                this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
                this.frameCount = 0;
                this.lastTime = currentTime;
            }

            this.draw();
            this.updateWaveform();
            this.updatePerformanceMonitor();

            this.animationId = requestAnimationFrame(animate);
        };

        this.animationId = requestAnimationFrame(animate);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        for (let i = 0; i <= this.gridSize; i++) {
            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.canvas.height);
            this.ctx.stroke();

            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
            this.ctx.stroke();
        }

        // Draw cells
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col]) {
                    this.drawCell(row, col);
                }
            }
        }

        // Highlight current step
        if (this.isPlaying) {
            this.ctx.fillStyle = 'rgba(255, 107, 107, 0.3)';
            this.ctx.fillRect(
                this.currentStep * this.cellSize,
                0,
                this.cellSize,
                this.canvas.height
            );
        }
    }

    drawCell(row, col) {
        const x = col * this.cellSize + 2;
        const y = row * this.cellSize + 2;
        const size = this.cellSize - 4;

        // Pulsating effect based on current step
        const distance = Math.abs(col - this.currentStep);
        const pulseFactor = this.isPlaying ? Math.max(0, 1 - distance / 4) : 0;
        const scale = 1 + pulseFactor * 0.3;

        this.ctx.save();
        this.ctx.translate(x + size/2, y + size/2);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-(x + size/2), -(y + size/2));

        // Draw geometric node
        const centerX = x + size/2;
        const centerY = y + size/2;
        const radius = size/2 * (0.5 + pulseFactor * 0.5);

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.getCellColor(row, col, pulseFactor);
        this.ctx.fill();

        // Add glow effect
        if (pulseFactor > 0) {
            this.ctx.shadowColor = this.getCellColor(row, col, pulseFactor);
            this.ctx.shadowBlur = 10 * pulseFactor;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }

        this.ctx.restore();
    }

    getCellColor(row, col, pulseFactor) {
        const baseColors = [
            '#ff6b6b', // kick - red
            '#4ecdc4', // snare - teal
            '#45b7d1', // hihat - blue
            '#ffa502', // clap - orange
            '#ff4757', // shaker - pink
            '#3742fa', // cowbell - purple
            '#2ed573', // green
            '#ffa502'  // yellow
        ];

        const color = baseColors[row % baseColors.length];
        const alpha = 0.6 + pulseFactor * 0.4;
        return color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    }

    updateWaveform() {
        if (!this.analyser) return;

        this.analyser.getByteTimeDomainData(this.waveformData);

        this.waveformCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.waveformCtx.fillRect(0, 0, this.waveformCanvas.width, this.waveformCanvas.height);

        this.waveformCtx.lineWidth = 2;
        this.waveformCtx.strokeStyle = '#ff6b6b';
        this.waveformCtx.beginPath();

        const sliceWidth = this.waveformCanvas.width / this.waveformData.length;
        let x = 0;

        for (let i = 0; i < this.waveformData.length; i++) {
            const v = this.waveformData[i] / 128.0;
            const y = v * this.waveformCanvas.height / 2;

            if (i === 0) {
                this.waveformCtx.moveTo(x, y);
            } else {
                this.waveformCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.waveformCtx.stroke();
    }

    updatePerformanceMonitor() {
        document.getElementById('fps-counter').textContent = `FPS: ${this.fps}`;
        document.getElementById('active-nodes').textContent = this.countActiveNodes();

        // Estimate memory usage (rough approximation)
        const memoryUsage = Math.round(performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0);
        document.getElementById('memory-usage').textContent = `${memoryUsage}MB`;

        // Audio latency (simplified)
        const latency = this.audioContext ? Math.round(this.audioContext.baseLatency * 1000) : 0;
        document.getElementById('audio-latency').textContent = `${latency}ms`;
    }

    countActiveNodes() {
        let count = 0;
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col]) count++;
            }
        }
        return count;
    }

    updateUI() {
        document.getElementById('tempo-value').textContent = this.tempo;
        document.getElementById('intensity-value').textContent = this.intensity.toFixed(1);
        document.getElementById('syncopation-value').textContent = this.syncopation.toFixed(1);
        document.getElementById('current-step').textContent = `Step: ${this.currentStep}`;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new PulseMatrix();
});