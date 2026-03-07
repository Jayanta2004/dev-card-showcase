// SPECTRALOOM · chromatic sound fusion #5979 - Script

class SpectraloomStudio {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.reverbNode = null;
        this.analyser = null;
        this.isPlaying = false;
        this.fusionBlobs = [];
        this.currentProgression = [];
        this.tempo = 120;
        this.sustainTime = 3;
        this.blendMode = 'additive';

        // Color to chord mapping
        this.chordMap = {
            '#FF6B6B': { name: 'Cmaj7', notes: [60, 64, 67, 71], hue: 'red' },
            '#4ECDC4': { name: 'Dm7', notes: [62, 65, 69, 72], hue: 'teal' },
            '#45B7D1': { name: 'Em7', notes: [64, 67, 71, 74], hue: 'blue' },
            '#FFA502': { name: 'Fmaj7', notes: [65, 69, 72, 76], hue: 'orange' },
            '#FF4757': { name: 'Gm7', notes: [67, 70, 74, 77], hue: 'pink' },
            '#3742FA': { name: 'Am7', notes: [69, 72, 76, 79], hue: 'purple' },
            '#2ED573': { name: 'Bm7b5', notes: [71, 74, 77, 81], hue: 'green' },
            '#FF9FF3': { name: 'C#maj7', notes: [61, 65, 68, 72], hue: 'magenta' }
        };

        this.init();
        this.setupEventListeners();
        this.startVisualization();
    }

    init() {
        this.setupCanvas();
        this.initAudio();
        this.updateUI();
    }

    setupCanvas() {
        this.canvas = document.getElementById('fusion-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.spectrumCanvas = document.getElementById('spectrum-canvas');
        this.spectrumCtx = this.spectrumCanvas.getContext('2d');

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
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create master gain
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.7;

            // Create reverb
            this.createReverb();

            // Create analyser for spectrum visualization
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;

            // Connect nodes
            this.masterGain.connect(this.reverbNode);
            this.reverbNode.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            // Resume context on user interaction
            document.addEventListener('click', () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            }, { once: true });
        } catch (error) {
            console.error('Web Audio API not supported:', error);
        }
    }

    createReverb() {
        this.reverbNode = this.audioContext.createConvolver();

        // Create impulse response for reverb
        const length = this.audioContext.sampleRate * 2;
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }

        this.reverbNode.buffer = impulse;
    }

    setupEventListeners() {
        // Color block drag and drop
        const colorBlocks = document.querySelectorAll('.color-block');
        colorBlocks.forEach(block => {
            block.addEventListener('dragstart', this.handleColorDragStart.bind(this));
        });

        this.canvas.addEventListener('dragover', this.handleCanvasDragOver.bind(this));
        this.canvas.addEventListener('drop', this.handleCanvasDrop.bind(this));
        this.canvas.addEventListener('dragleave', this.handleCanvasDragLeave.bind(this));

        // Controls
        document.getElementById('master-volume').addEventListener('input', this.handleMasterVolume.bind(this));
        document.getElementById('tempo').addEventListener('input', this.handleTempo.bind(this));
        document.getElementById('reverb').addEventListener('input', this.handleReverb.bind(this));
        document.getElementById('blend-mode').addEventListener('change', this.handleBlendMode.bind(this));
        document.getElementById('sustain-time').addEventListener('input', this.handleSustainTime.bind(this));

        // Buttons
        document.getElementById('play-btn').addEventListener('click', this.playFusion.bind(this));
        document.getElementById('stop-btn').addEventListener('click', this.stopFusion.bind(this));
        document.getElementById('clear-canvas').addEventListener('click', this.clearCanvas.bind(this));
        document.getElementById('export-btn').addEventListener('click', this.exportMIDI.bind(this));
    }

    handleColorDragStart(e) {
        const color = e.target.dataset.color;
        e.dataTransfer.setData('text/plain', color);
        e.dataTransfer.effectAllowed = 'copy';
    }

    handleCanvasDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        this.showDropIndicator(true);
    }

    handleCanvasDragLeave(e) {
        this.showDropIndicator(false);
    }

    handleCanvasDrop(e) {
        e.preventDefault();
        this.showDropIndicator(false);

        const color = e.dataTransfer.getData('text/plain');
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.addFusionBlob(color, x, y);
    }

    showDropIndicator(show) {
        const overlay = document.querySelector('.canvas-overlay');
        overlay.classList.toggle('visible', show);
    }

    addFusionBlob(color, x, y) {
        const blob = {
            color: color,
            x: x,
            y: y,
            radius: 50,
            chord: this.chordMap[color],
            active: true,
            created: Date.now()
        };

        this.fusionBlobs.push(blob);
        this.updateCurrentChord();
        this.playChord(blob.chord);

        // Auto-remove after sustain time
        setTimeout(() => {
            blob.active = false;
            this.updateCurrentChord();
        }, this.sustainTime * 1000);
    }

    playChord(chord) {
        if (!chord || !this.audioContext) return;

        const now = this.audioContext.currentTime;

        chord.notes.forEach((note, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            // Convert MIDI note to frequency
            const frequency = 440 * Math.pow(2, (note - 69) / 12);

            oscillator.frequency.setValueAtTime(frequency, now);
            oscillator.type = 'sine';

            // Stagger note starts slightly for richer sound
            const startTime = now + (index * 0.01);
            const endTime = startTime + this.sustainTime;

            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, endTime - 0.5);
            gainNode.gain.linearRampToValueAtTime(0, endTime);

            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);

            oscillator.start(startTime);
            oscillator.stop(endTime);
        });

        // Add to progression
        this.currentProgression.push(chord.name);
        if (this.currentProgression.length > 8) {
            this.currentProgression.shift();
        }
        this.updateProgressionDisplay();
    }

    updateCurrentChord() {
        const activeBlobs = this.fusionBlobs.filter(blob => blob.active);
        if (activeBlobs.length === 0) {
            document.getElementById('current-chord-display').textContent = 'None';
            return;
        }

        // For multiple chords, show blended result
        if (activeBlobs.length === 1) {
            document.getElementById('current-chord-display').textContent = activeBlobs[0].chord.name;
        } else {
            const chordNames = activeBlobs.map(blob => blob.chord.name).join(' + ');
            document.getElementById('current-chord-display').textContent = chordNames;
        }
    }

    updateProgressionDisplay() {
        const display = this.currentProgression.join(' → ');
        document.getElementById('progression-display').textContent = display || 'Empty';
    }

    handleMasterVolume(e) {
        const volume = parseFloat(e.target.value);
        if (this.masterGain) {
            this.masterGain.gain.value = volume;
        }
        document.getElementById('master-volume-value').textContent = Math.round(volume * 100) + '%';
    }

    handleTempo(e) {
        this.tempo = parseInt(e.target.value);
        document.getElementById('tempo-value').textContent = this.tempo;
    }

    handleReverb(e) {
        const reverbAmount = parseFloat(e.target.value);
        // Adjust reverb mix
        document.getElementById('reverb-value').textContent = Math.round(reverbAmount * 100) + '%';
    }

    handleBlendMode(e) {
        this.blendMode = e.target.value;
    }

    handleSustainTime(e) {
        this.sustainTime = parseFloat(e.target.value);
        document.getElementById('sustain-time-value').textContent = this.sustainTime + 's';
    }

    playFusion() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        document.getElementById('play-btn').innerHTML = '<i class="fas fa-pause"></i> Pause Fusion';

        // Play all active blobs in sequence based on tempo
        const interval = (60 / this.tempo) * 1000;

        this.playbackInterval = setInterval(() => {
            this.fusionBlobs.forEach(blob => {
                if (blob.active) {
                    this.playChord(blob.chord);
                }
            });
        }, interval);
    }

    stopFusion() {
        this.isPlaying = false;
        clearInterval(this.playbackInterval);
        document.getElementById('play-btn').innerHTML = '<i class="fas fa-play"></i> Play Fusion';
    }

    clearCanvas() {
        this.fusionBlobs = [];
        this.currentProgression = [];
        this.updateCurrentChord();
        this.updateProgressionDisplay();
    }

    exportMIDI() {
        // Basic MIDI export functionality
        const midiData = this.generateMIDIData();
        const blob = new Blob([midiData], { type: 'audio/midi' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'spectraloom-fusion.mid';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateMIDIData() {
        // Simplified MIDI generation for chord progression
        // In a real implementation, you'd use a proper MIDI library
        const header = [0x4D, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x01];
        const tempo = Math.floor(60000000 / this.tempo);

        return new Uint8Array([...header, ...Array(100).fill(0)]);
    }

    startVisualization() {
        const animate = () => {
            this.drawFusionCanvas();
            this.drawSpectrum();
            requestAnimationFrame(animate);
        };
        animate();
    }

    drawFusionCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw fusion blobs
        this.fusionBlobs.forEach(blob => {
            if (!blob.active) return;

            const alpha = Math.max(0.3, 1 - (Date.now() - blob.created) / (this.sustainTime * 1000));

            this.ctx.save();
            this.ctx.globalAlpha = alpha;

            // Create gradient
            const gradient = this.ctx.createRadialGradient(
                blob.x, blob.y, 0,
                blob.x, blob.y, blob.radius
            );
            gradient.addColorStop(0, blob.color);
            gradient.addColorStop(1, blob.color + '00');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw chord name
            this.ctx.fillStyle = 'white';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(blob.chord.name, blob.x, blob.y + 5);

            this.ctx.restore();
        });

        // Draw blend effects between overlapping blobs
        this.drawBlendEffects();
    }

    drawBlendEffects() {
        for (let i = 0; i < this.fusionBlobs.length; i++) {
            for (let j = i + 1; j < this.fusionBlobs.length; j++) {
                const blob1 = this.fusionBlobs[i];
                const blob2 = this.fusionBlobs[j];

                if (!blob1.active || !blob2.active) continue;

                const dx = blob1.x - blob2.x;
                const dy = blob1.y - blob2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < blob1.radius + blob2.radius) {
                    // Draw blend connection
                    this.ctx.strokeStyle = this.blendColors(blob1.color, blob2.color);
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    this.ctx.moveTo(blob1.x, blob1.y);
                    this.ctx.lineTo(blob2.x, blob2.y);
                    this.ctx.stroke();

                    // Draw blend result at midpoint
                    const midX = (blob1.x + blob2.x) / 2;
                    const midY = (blob1.y + blob2.y) / 2;

                    this.ctx.fillStyle = this.blendColors(blob1.color, blob2.color);
                    this.ctx.beginPath();
                    this.ctx.arc(midX, midY, 15, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
    }

    blendColors(color1, color2) {
        // Simple color blending based on blend mode
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);

        let result;
        switch (this.blendMode) {
            case 'additive':
                result = {
                    r: Math.min(255, c1.r + c2.r),
                    g: Math.min(255, c1.g + c2.g),
                    b: Math.min(255, c1.b + c2.b)
                };
                break;
            case 'multiplicative':
                result = {
                    r: (c1.r * c2.r) / 255,
                    g: (c1.g * c2.g) / 255,
                    b: (c1.b * c2.b) / 255
                };
                break;
            case 'harmonic':
            default:
                result = {
                    r: (c1.r + c2.r) / 2,
                    g: (c1.g + c2.g) / 2,
                    b: (c1.b + c2.b) / 2
                };
        }

        return `rgb(${Math.round(result.r)}, ${Math.round(result.g)}, ${Math.round(result.b)})`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    drawSpectrum() {
        if (!this.analyser) return;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        this.spectrumCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.spectrumCtx.fillRect(0, 0, this.spectrumCanvas.width, this.spectrumCanvas.height);

        const barWidth = this.spectrumCanvas.width / bufferLength * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = (dataArray[i] / 255) * this.spectrumCanvas.height;

            const hue = (i / bufferLength) * 360;
            this.spectrumCtx.fillStyle = `hsl(${hue}, 70%, 50%)`;
            this.spectrumCtx.fillRect(x, this.spectrumCanvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    updateUI() {
        document.getElementById('tempo-value').textContent = this.tempo;
        document.getElementById('sustain-time-value').textContent = this.sustainTime + 's';
        document.getElementById('master-volume-value').textContent = '70%';
        document.getElementById('reverb-value').textContent = '30%';
    }
}

// Initialize the studio when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SpectraloomStudio();
});