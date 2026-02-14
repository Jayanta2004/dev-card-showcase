class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.visualizerCanvas = document.getElementById('visualizerCanvas');

        this.audioEngine = null;
        this.physicsEngine = null;
        this.visualizer = null;

        this.isRunning = false;
        this.isPaused = false;
        this.isCalibrating = false;

        this.score = 0;
        this.particles = [];
        this.maxParticles = 50;

        this.lastFrameTime = 0;
        this.fps = 60;

        this.elements = {
            permissionOverlay: document.getElementById('permissionOverlay'),
            errorOverlay: document.getElementById('errorOverlay'),
            tutorialOverlay: document.getElementById('tutorialOverlay'),
            calibrationModal: document.getElementById('calibrationModal'),
            requestMicBtn: document.getElementById('requestMicBtn'),
            retryBtn: document.getElementById('retryBtn'),
            startGameBtn: document.getElementById('startGameBtn'),
            calibrateBtn: document.getElementById('calibrateBtn'),
            resetBtn: document.getElementById('resetBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            skipCalibrationBtn: document.getElementById('skipCalibrationBtn'),
            sensitivitySlider: document.getElementById('sensitivitySlider'),
            gravitySlider: document.getElementById('gravitySlider'),
            frictionSlider: document.getElementById('frictionSlider'),
            sensitivityValue: document.getElementById('sensitivityValue'),
            gravityValue: document.getElementById('gravityValue'),
            frictionValue: document.getElementById('frictionValue'),
            scoreValue: document.getElementById('scoreValue'),
            volumeValue: document.getElementById('volumeValue'),
            peakValue: document.getElementById('peakValue'),
            intensityBar: document.getElementById('intensityBar'),
            calibrationProgress: document.getElementById('calibrationProgress'),
            calibrationInstruction: document.getElementById('calibrationInstruction'),
            calibrationVisual: document.getElementById('calibrationVisual'),
            errorMessage: document.getElementById('errorMessage'),
            particlesContainer: document.getElementById('particlesContainer')
        };

        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.setupEventListeners();

        this.elements.permissionOverlay.classList.remove('hidden');
    }

    setupEventListeners() {
        this.elements.requestMicBtn.addEventListener('click', () => this.requestMicrophone());
        this.elements.retryBtn.addEventListener('click', () => this.requestMicrophone());
        this.elements.startGameBtn.addEventListener('click', () => this.startGame());
        this.elements.calibrateBtn.addEventListener('click', () => this.startCalibration());
        this.elements.resetBtn.addEventListener('click', () => this.reset());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.skipCalibrationBtn.addEventListener('click', () => this.skipCalibration());

        this.elements.sensitivitySlider.addEventListener('input', (e) => {
            const value = e.target.value / 100;
            this.elements.sensitivityValue.textContent = `${e.target.value}%`;
            if (this.audioEngine) {
                this.audioEngine.setSensitivity(value * 2);
            }
            if (this.physicsEngine) {
                this.physicsEngine.setForceMultiplier(value);
            }
        });

        this.elements.gravitySlider.addEventListener('input', (e) => {
            const value = e.target.value / 100;
            this.elements.gravityValue.textContent = `${e.target.value}%`;
            if (this.physicsEngine) {
                this.physicsEngine.setGravity(value);
            }
        });

        this.elements.frictionSlider.addEventListener('input', (e) => {
            const value = e.target.value / 100;
            this.elements.frictionValue.textContent = `${e.target.value}%`;
            if (this.physicsEngine) {
                this.physicsEngine.setFriction(value);
            }
        });
    }

    async requestMicrophone() {
        this.elements.errorOverlay.classList.add('hidden');

        this.audioEngine = new AudioEngine();

        const success = await this.audioEngine.initialize();

        if (success) {
            this.elements.permissionOverlay.classList.add('hidden');
            this.elements.tutorialOverlay.classList.remove('hidden');

            this.setupAudioCallbacks();
        } else {
            this.showError('Microphone access denied. Please allow microphone access and try again.');
        }
    }

    setupAudioCallbacks() {
        this.audioEngine.onVolumeChange = (data) => {
            this.updateVolumeDisplay(data);

            if (this.isRunning && !this.isPaused) {
                this.physicsEngine.update(data);
            }
        };

        this.audioEngine.onSpike = (data) => {
            if (this.isRunning && !this.isPaused) {
                this.physicsEngine.applyJump(data.intensity);
                this.createParticleBurst(data.intensity);
                this.score += Math.floor(data.intensity * 10);
                this.updateScore();
            }
        };

        this.audioEngine.onError = (error) => {
            this.showError(`Audio error: ${error.message}`);
        };
    }

    startGame() {
        this.elements.tutorialOverlay.classList.add('hidden');

        this.physicsEngine = new PhysicsEngine(this.canvas.width, this.canvas.height);
        this.visualizer = new Visualizer(this.visualizerCanvas, this.audioEngine);

        this.isRunning = true;
        this.gameLoop();
    }

    gameLoop(timestamp = 0) {
        if (!this.isRunning) return;

        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;

        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBall();
        this.drawParticles();

        this.visualizer.draw();

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    drawBall() {
        const ballState = this.physicsEngine.getBallState();

        for (let i = 0; i < ballState.trail.length; i++) {
            const point = ballState.trail[i];
            const alpha = (i / ballState.trail.length) * 0.3;
            const radius = ballState.radius * (i / ballState.trail.length);

            this.ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }

        const gradient = this.ctx.createRadialGradient(
            ballState.position.x, ballState.position.y, 0,
            ballState.position.x, ballState.position.y, ballState.radius
        );
        gradient.addColorStop(0, ballState.color);
        gradient.addColorStop(0.7, ballState.color);
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(ballState.position.x, ballState.position.y, ballState.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = ballState.color;
        this.ctx.fillStyle = ballState.color;
        this.ctx.beginPath();
        this.ctx.arc(ballState.position.x, ballState.position.y, ballState.radius * 0.8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    drawParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];

            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2;
            particle.life -= 0.02;

            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.fillStyle = `rgba(${particle.color}, ${particle.life})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    createParticleBurst(intensity) {
        const ballState = this.physicsEngine.getBallState();
        const particleCount = Math.min(Math.floor(intensity * 10), 20);

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 3;

            this.particles.push({
                x: ballState.position.x,
                y: ballState.position.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 3,
                life: 1,
                color: `99, 102, 241`
            });
        }

        while (this.particles.length > this.maxParticles) {
            this.particles.shift();
        }
    }

    async startCalibration() {
        this.elements.calibrationModal.classList.remove('hidden');
        this.isCalibrating = true;

        this.elements.calibrationProgress.style.width = '0%';
        this.elements.calibrationInstruction.textContent = 'Speak at your normal volume for 3 seconds...';

        const duration = 3000;
        const startTime = Date.now();

        const updateProgress = () => {
            if (!this.isCalibrating) return;

            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / duration) * 100, 100);
            this.elements.calibrationProgress.style.width = `${progress}%`;

            if (progress < 100) {
                requestAnimationFrame(updateProgress);
            }
        };

        updateProgress();

        await this.audioEngine.calibrate(duration);

        this.elements.calibrationInstruction.textContent = 'Calibration complete!';

        setTimeout(() => {
            this.elements.calibrationModal.classList.add('hidden');
            this.isCalibrating = false;
        }, 1000);
    }

    skipCalibration() {
        this.isCalibrating = false;
        this.elements.calibrationModal.classList.add('hidden');
    }

    updateVolumeDisplay(data) {
        this.elements.volumeValue.textContent = `${Math.floor(data.current)}%`;
        this.elements.peakValue.textContent = `${Math.floor(data.peak)}%`;
        this.elements.intensityBar.style.height = `${Math.min(data.normalized * 100, 100)}%`;
    }

    updateScore() {
        this.elements.scoreValue.textContent = this.score;
    }

    togglePause() {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.elements.pauseBtn.innerHTML = '<span class="btn-icon">▶️</span><span>Resume</span>';
            this.audioEngine.pause();
        } else {
            this.elements.pauseBtn.innerHTML = '<span class="btn-icon">⏸️</span><span>Pause</span>';
            this.audioEngine.resume();
        }
    }

    reset() {
        this.score = 0;
        this.updateScore();

        if (this.physicsEngine) {
            this.physicsEngine.reset();
        }

        if (this.audioEngine) {
            this.audioEngine.resetPeak();
        }

        this.particles = [];
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;

        if (this.physicsEngine) {
            this.physicsEngine.resize(rect.width, rect.height);
        }

        if (this.visualizer) {
            this.visualizer.resize();
        }
    }

    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorOverlay.classList.remove('hidden');
        this.elements.permissionOverlay.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});
