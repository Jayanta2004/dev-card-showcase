// AURALTIDE · Fluid Acoustic Canvas - JavaScript Implementation

class AuraltideCanvas {
    constructor() {
        this.canvas = document.getElementById('acoustic-canvas');
        this.waveformCanvas = document.getElementById('waveform-canvas');
        this.harmonicCanvas = document.getElementById('harmonic-canvas');
        this.rippleOverlay = document.getElementById('ripple-overlay');

        this.ctx = this.canvas.getContext('2d');
        this.waveformCtx = this.waveformCanvas.getContext('2d');
        this.harmonicCtx = this.harmonicCanvas.getContext('2d');

        this.audioContext = null;
        this.masterGain = null;
        this.oscillators = [];
        this.waves = [];
        this.ripples = [];
        this.isPlaying = false;

        this.currentMode = 'ripple';
        this.colorScheme = 'ocean';

        // Audio parameters
        this.baseFrequency = 220;
        this.harmonicCount = 3;
        this.modulationDepth = 0.25;
        this.waveformType = 'sine';

        // Visual parameters
        this.waveSpeed = 1.0;
        this.waveAmplitude = 50;
        this.rippleIntensity = 1.0;

        // Performance tracking
        this.lastTime = 0;
        this.frameCount = 0;
        this.fps = 0;

        this.init();
        this.setupEventListeners();
        this.setupControls();
        this.animate();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Initialize audio context on user interaction
        document.getElementById('enable-audio').addEventListener('click', () => {
            this.initializeAudio();
        });
    }

    async initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0.3;

            // Create initial oscillators
            this.createOscillators();

            document.getElementById('audio-warning').style.display = 'none';
            this.isPlaying = true;

            // Start the audio
            await this.audioContext.resume();
            this.updateAudioStatus();

        } catch (error) {
            console.error('Audio initialization failed:', error);
            alert('Audio initialization failed. Please check your browser settings.');
        }
    }

    createOscillators() {
        // Clear existing oscillators
        this.oscillators.forEach(osc => {
            try {
                osc.stop();
                osc.disconnect();
            } catch (e) {}
        });
        this.oscillators = [];

        // Create new oscillators for each harmonic
        for (let i = 0; i < this.harmonicCount; i++) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = this.waveformType;
            oscillator.frequency.value = this.baseFrequency * (i + 1);

            // Set harmonic amplitude (decreasing with each harmonic)
            gainNode.gain.value = 0.3 / (i + 1);

            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);

            oscillator.start();
            this.oscillators.push({ oscillator, gainNode, harmonic: i + 1 });
        }
    }

    updateOscillators() {
        if (!this.audioContext) return;

        this.oscillators.forEach((osc, index) => {
            osc.oscillator.type = this.waveformType;
            osc.oscillator.frequency.value = this.baseFrequency * (index + 1);
            osc.gainNode.gain.value = 0.3 / (index + 1) * (1 + this.modulationDepth * Math.sin(Date.now() * 0.001));
        });
    }

    setupEventListeners() {
        // Canvas interaction
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());

        // Mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentMode = btn.dataset.mode;
            });
        });
    }

    setupControls() {
        // Audio controls
        const baseFreqSlider = document.getElementById('base-frequency');
        const baseFreqValue = document.getElementById('base-frequency-value');
        baseFreqSlider.addEventListener('input', (e) => {
            this.baseFrequency = parseFloat(e.target.value);
            baseFreqValue.textContent = `${this.baseFrequency} Hz`;
            this.updateOscillators();
            this.updateHarmonicDisplay();
        });

        const harmonicSlider = document.getElementById('harmonic-count');
        const harmonicValue = document.getElementById('harmonic-count-value');
        harmonicSlider.addEventListener('input', (e) => {
            this.harmonicCount = parseInt(e.target.value);
            harmonicValue.textContent = this.harmonicCount;
            this.createOscillators();
            this.updateHarmonicDisplay();
        });

        const modulationSlider = document.getElementById('modulation-depth');
        const modulationValue = document.getElementById('modulation-depth-value');
        modulationSlider.addEventListener('input', (e) => {
            this.modulationDepth = parseFloat(e.target.value) / 100;
            modulationValue.textContent = `${e.target.value}%`;
        });

        const waveformSelect = document.getElementById('waveform-type');
        waveformSelect.addEventListener('change', (e) => {
            this.waveformType = e.target.value;
            this.updateOscillators();
        });

        // Visual controls
        const waveSpeedSlider = document.getElementById('wave-speed');
        const waveSpeedValue = document.getElementById('wave-speed-value');
        waveSpeedSlider.addEventListener('input', (e) => {
            this.waveSpeed = parseFloat(e.target.value);
            waveSpeedValue.textContent = `${this.waveSpeed}x`;
        });

        const waveAmpSlider = document.getElementById('wave-amplitude');
        const waveAmpValue = document.getElementById('wave-amplitude-value');
        waveAmpSlider.addEventListener('input', (e) => {
            this.waveAmplitude = parseInt(e.target.value);
            waveAmpValue.textContent = this.waveAmplitude;
        });

        const rippleSlider = document.getElementById('ripple-intensity');
        const rippleValue = document.getElementById('ripple-intensity-value');
        rippleSlider.addEventListener('input', (e) => {
            this.rippleIntensity = parseFloat(e.target.value);
            rippleValue.textContent = `${this.rippleIntensity}x`;
        });

        const colorSelect = document.getElementById('color-scheme');
        colorSelect.addEventListener('change', (e) => {
            this.colorScheme = e.target.value;
            document.body.className = `${this.colorScheme}-theme`;
        });
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.currentMode === 'ripple') {
            this.createRipple(x, y);
            this.createWave(x, y);
        }
    }

    handleMouseDown(e) {
        if (this.currentMode === 'draw') {
            this.isDrawing = true;
            this.lastDrawPoint = { x: e.clientX, y: e.clientY };
        }
    }

    handleMouseMove(e) {
        if (this.isDrawing && this.currentMode === 'draw') {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Create wave based on drawing motion
            const speed = Math.sqrt(
                Math.pow(e.clientX - this.lastDrawPoint.x, 2) +
                Math.pow(e.clientY - this.lastDrawPoint.y, 2)
            );

            this.createWave(x, y, speed * 0.1);
            this.lastDrawPoint = { x: e.clientX, y: e.clientY };
        }
    }

    handleMouseUp() {
        this.isDrawing = false;
    }

    createRipple(x, y) {
        const ripple = {
            x: x,
            y: y,
            radius: 0,
            maxRadius: 200,
            speed: 2 * this.rippleIntensity,
            opacity: 1,
            created: Date.now()
        };

        this.ripples.push(ripple);

        // Create ripple element
        const rippleEl = document.createElement('div');
        rippleEl.className = 'ripple';
        rippleEl.style.left = `${x - 50}px`;
        rippleEl.style.top = `${y - 50}px`;
        this.rippleOverlay.appendChild(rippleEl);

        // Remove ripple element after animation
        setTimeout(() => {
            if (rippleEl.parentNode) {
                rippleEl.parentNode.removeChild(rippleEl);
            }
        }, 2000);
    }

    createWave(x, y, intensity = 1) {
        const wave = {
            x: x,
            y: y,
            radius: 0,
            maxRadius: 300,
            speed: this.waveSpeed * intensity,
            amplitude: this.waveAmplitude,
            frequency: this.baseFrequency / 100, // Convert to visual frequency
            phase: Math.random() * Math.PI * 2,
            created: Date.now(),
            life: 3000 // 3 seconds
        };

        this.waves.push(wave);

        // Modulate audio based on wave creation
        if (this.audioContext && this.isPlaying) {
            this.modulateAudioForWave(wave);
        }
    }

    modulateAudioForWave(wave) {
        // Temporarily modulate frequency based on wave position
        const freqMod = (wave.x / this.canvas.width - 0.5) * 50; // ±50 Hz modulation
        const ampMod = wave.amplitude / 100; // Amplitude modulation

        this.oscillators.forEach((osc, index) => {
            const originalFreq = this.baseFrequency * (index + 1);
            osc.oscillator.frequency.setValueAtTime(
                originalFreq + freqMod,
                this.audioContext.currentTime
            );
            osc.oscillator.frequency.linearRampToValueAtTime(
                originalFreq,
                this.audioContext.currentTime + 0.5
            );

            osc.gainNode.gain.setValueAtTime(
                osc.gainNode.gain.value * ampMod,
                this.audioContext.currentTime
            );
            osc.gainNode.gain.linearRampToValueAtTime(
                osc.gainNode.gain.value / ampMod,
                this.audioContext.currentTime + 0.5
            );
        });
    }

    updateHarmonicDisplay() {
        const fundamentalEl = document.getElementById('fundamental-freq');
        const seriesEl = document.getElementById('harmonic-series');

        fundamentalEl.textContent = `Fundamental: ${this.baseFrequency} Hz`;

        const harmonics = [];
        for (let i = 1; i <= this.harmonicCount; i++) {
            harmonics.push(this.baseFrequency * i);
        }
        seriesEl.textContent = `Series: ${harmonics.join(', ')} Hz`;
    }

    updateAudioStatus() {
        const statusEl = document.getElementById('audio-status');
        const statusText = document.querySelector('.status-text');

        if (this.audioContext && this.audioContext.state === 'running') {
            statusEl.innerHTML = '<i class="fas fa-wave-square"></i>';
            statusText.textContent = 'Generative Synthesis Active';
        } else {
            statusEl.innerHTML = '<i class="fas fa-pause"></i>';
            statusText.textContent = 'Audio Paused';
        }
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const aspectRatio = 600 / 1200;

        this.canvas.width = containerWidth;
        this.canvas.height = containerWidth * aspectRatio;

        // Update waveform canvas
        this.waveformCanvas.width = this.waveformCanvas.parentElement.clientWidth - 40;
    }

    animate(currentTime = 0) {
        // Calculate FPS
        this.frameCount++;
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;

            // Update performance display
            document.getElementById('visual-fps').textContent = this.fps;
            document.getElementById('active-waves').textContent = this.waves.length;
            if (this.audioContext) {
                const latency = Math.round(this.audioContext.baseLatency * 1000);
                document.getElementById('audio-latency').textContent = `${latency}ms`;
            }
        }

        this.update();
        this.render();

        requestAnimationFrame((time) => this.animate(time));
    }

    update() {
        // Update waves
        this.waves = this.waves.filter(wave => {
            wave.radius += wave.speed;
            wave.phase += 0.1;
            return wave.radius < wave.maxRadius && (Date.now() - wave.created) < wave.life;
        });

        // Update ripples
        this.ripples = this.ripples.filter(ripple => {
            ripple.radius += ripple.speed;
            ripple.opacity = 1 - (ripple.radius / ripple.maxRadius);
            return ripple.radius < ripple.maxRadius;
        });

        // Autonomous mode - create random waves
        if (this.currentMode === 'auto' && Math.random() < 0.02) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            this.createWave(x, y, 0.5);
        }

        // Update audio parameters
        if (this.audioContext && this.isPlaying) {
            this.updateOscillators();
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = this.getGradient();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render waves
        this.waves.forEach(wave => {
            this.renderWave(wave);
        });

        // Render waveform
        this.renderWaveform();

        // Render harmonic analysis
        this.renderHarmonicAnalysis();
    }

    getGradient() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);

        switch (this.colorScheme) {
            case 'ocean':
                gradient.addColorStop(0, '#e0f2fe');
                gradient.addColorStop(1, '#3b82f6');
                break;
            case 'sunset':
                gradient.addColorStop(0, '#fef3c7');
                gradient.addColorStop(1, '#dc2626');
                break;
            case 'aurora':
                gradient.addColorStop(0, '#d1fae5');
                gradient.addColorStop(1, '#059669');
                break;
            case 'cosmic':
                gradient.addColorStop(0, '#f3e8ff');
                gradient.addColorStop(1, '#7c3aed');
                break;
        }

        return gradient;
    }

    renderWave(wave) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.6;
        this.ctx.strokeStyle = this.getWaveColor();
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();

        // Create wave pattern
        const segments = 100;
        const angleStep = (Math.PI * 2) / segments;

        for (let i = 0; i <= segments; i++) {
            const angle = i * angleStep;
            const x = wave.x + Math.cos(angle) * wave.radius;
            const y = wave.y + Math.sin(angle) * wave.radius;

            // Add wave modulation
            const modulation = Math.sin(angle * wave.frequency + wave.phase) * wave.amplitude * 0.1;
            const modulatedX = x + Math.cos(angle) * modulation;
            const modulatedY = y + Math.sin(angle) * modulation;

            if (i === 0) {
                this.ctx.moveTo(modulatedX, modulatedY);
            } else {
                this.ctx.lineTo(modulatedX, modulatedY);
            }
        }

        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.restore();
    }

    getWaveColor() {
        switch (this.colorScheme) {
            case 'ocean': return '#06b6d4';
            case 'sunset': return '#f97316';
            case 'aurora': return '#34d399';
            case 'cosmic': return '#c084fc';
            default: return '#06b6d4';
        }
    }

    renderWaveform() {
        const ctx = this.waveformCtx;
        const width = this.waveformCanvas.width;
        const height = this.waveformCanvas.height;

        // Clear
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Draw waveform
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const samples = 200;
        for (let i = 0; i < samples; i++) {
            const x = (i / samples) * width;
            let y = height / 2;

            // Generate waveform based on current harmonics
            for (let h = 1; h <= this.harmonicCount; h++) {
                const amplitude = 1 / h * 20;
                const frequency = h * 0.1;
                y += Math.sin(x * frequency * 0.01 + Date.now() * 0.001) * amplitude;
            }

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();

        // Update frequency display
        document.getElementById('current-frequency').textContent = `${this.baseFrequency} Hz`;
        document.getElementById('current-amplitude').textContent = `${(this.waveAmplitude / 100).toFixed(2)}`;
        document.getElementById('current-harmonics').textContent = `${this.harmonicCount} layers`;
    }

    renderHarmonicAnalysis() {
        const ctx = this.harmonicCtx;
        const width = this.harmonicCanvas.width;
        const height = this.harmonicCanvas.height;

        // Clear
        ctx.fillStyle = '#581c87';
        ctx.fillRect(0, 0, width, height);

        // Draw harmonic bars
        const barWidth = width / this.harmonicCount - 10;
        for (let i = 0; i < this.harmonicCount; i++) {
            const amplitude = 1 / (i + 1);
            const barHeight = amplitude * height * 0.8;

            ctx.fillStyle = `hsl(${200 + i * 30}, 70%, 60%)`;
            ctx.fillRect(
                i * (barWidth + 10) + 5,
                height - barHeight,
                barWidth,
                barHeight
            );

            // Label
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                `${this.baseFrequency * (i + 1)}Hz`,
                i * (barWidth + 10) + barWidth / 2 + 5,
                height - 5
            );
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuraltideCanvas();
});