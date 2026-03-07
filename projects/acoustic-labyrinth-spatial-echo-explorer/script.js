// ACOUSTIC LABYRINTH · spatial echo explorer #5980 - Script

class AcousticLabyrinth {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.currentSource = null;
        this.pannerNode = null;
        this.reverbNode = null;
        this.analyser = null;

        // Maze properties
        this.mazeSize = 12;
        this.cellSize = 20;
        this.maze = [];
        this.player = { x: 1, y: 1 };
        this.goal = { x: 0, y: 0 };

        // Audio properties
        this.reverbTime = 2.5;
        this.reflectionDensity = 0.5;
        this.stereoPosition = 0;
        this.echoIntensity = 0.7;

        // Room types and their audio properties
        this.roomTypes = {
            entrance: { name: 'Entrance Hall', reverb: 1.5, density: 0.3, description: 'A spacious entrance with moderate reverb and balanced stereo imaging.' },
            corridor: { name: 'Narrow Corridor', reverb: 0.8, density: 0.6, description: 'A tight corridor with quick echoes and focused sound.' },
            chamber: { name: 'Large Chamber', reverb: 4.0, density: 0.2, description: 'An expansive chamber with long, lush reverb and wide stereo field.' },
            deadend: { name: 'Dead End', reverb: 0.3, density: 0.8, description: 'A confined dead end with sharp, dense reflections.' },
            junction: { name: 'Crossroads', reverb: 2.2, density: 0.4, description: 'An open junction with balanced acoustics and moderate reverb.' },
            goal: { name: 'Echo Chamber', reverb: 6.0, density: 0.1, description: 'The final chamber with extreme reverb and immersive spatial audio.' }
        };

        this.init();
        this.setupEventListeners();
        this.generateMaze();
        this.updateAudioProperties();
        this.startVisualization();
    }

    init() {
        this.setupCanvas();
        this.initAudio();
        this.updateUI();
    }

    setupCanvas() {
        this.canvas = document.getElementById('maze-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Set canvas size based on maze
        this.canvas.width = this.mazeSize * this.cellSize;
        this.canvas.height = this.mazeSize * this.cellSize;

        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        // Keep aspect ratio
        const maxWidth = Math.min(800, window.innerWidth - 40);
        const maxHeight = Math.min(600, window.innerHeight - 200);
        const scale = Math.min(maxWidth / (this.mazeSize * this.cellSize), maxHeight / (this.mazeSize * this.cellSize));

        this.canvas.style.width = (this.mazeSize * this.cellSize * scale) + 'px';
        this.canvas.style.height = (this.mazeSize * this.cellSize * scale) + 'px';
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create master gain
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.7;

            // Create panner for spatial audio
            this.pannerNode = this.audioContext.createPanner();
            this.pannerNode.panningModel = 'HRTF';
            this.pannerNode.distanceModel = 'inverse';
            this.pannerNode.refDistance = 1;
            this.pannerNode.maxDistance = 100;
            this.pannerNode.rolloffFactor = 1;

            // Create reverb
            this.createReverb();

            // Create analyser
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;

            // Connect nodes
            this.masterGain.connect(this.pannerNode);
            this.pannerNode.connect(this.reverbNode);
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

        // Create different impulse responses for different room types
        this.updateReverbImpulse();
    }

    updateReverbImpulse() {
        const length = this.audioContext.sampleRate * this.reverbTime;
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                // Create decaying noise with reflections
                const decay = Math.pow(1 - i / length, 2);
                const reflection = Math.random() * 2 - 1;

                // Add multiple reflection delays based on density
                let sample = reflection * decay;
                for (let r = 1; r <= Math.floor(this.reflectionDensity * 10); r++) {
                    const delay = Math.floor(length / r);
                    if (i >= delay) {
                        sample += channelData[i - delay] * 0.3 * decay;
                    }
                }

                channelData[i] = sample * 0.1;
            }
        }

        this.reverbNode.buffer = impulse;
    }

    generateMaze() {
        // Initialize maze with walls
        this.maze = Array(this.mazeSize).fill().map(() =>
            Array(this.mazeSize).fill(1) // 1 = wall, 0 = path
        );

        // Generate maze using recursive backtracking
        this.carveMaze(1, 1);

        // Set entrance and exit
        this.maze[1][0] = 0; // Entrance
        this.goal = { x: this.mazeSize - 2, y: this.mazeSize - 2 };
        this.maze[this.goal.y][this.goal.x] = 0; // Exit

        this.drawMaze();
        this.updatePlayerPosition();
    }

    carveMaze(x, y) {
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        this.shuffleArray(directions);

        for (const [dx, dy] of directions) {
            const nx = x + dx * 2;
            const ny = y + dy * 2;

            if (nx > 0 && nx < this.mazeSize - 1 && ny > 0 && ny < this.mazeSize - 1 && this.maze[ny][nx] === 1) {
                this.maze[y + dy][x + dx] = 0;
                this.maze[ny][nx] = 0;
                this.carveMaze(nx, ny);
            }
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    drawMaze() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < this.mazeSize; y++) {
            for (let x = 0; x < this.mazeSize; x++) {
                if (this.maze[y][x] === 1) {
                    // Wall
                    this.ctx.fillStyle = this.getWallColor(x, y);
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                } else {
                    // Path
                    this.ctx.fillStyle = this.getPathColor(x, y);
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                }
            }
        }

        // Draw goal
        this.ctx.fillStyle = var(--maze-goal);
        this.ctx.beginPath();
        this.ctx.arc(
            (this.goal.x + 0.5) * this.cellSize,
            (this.goal.y + 0.5) * this.cellSize,
            this.cellSize * 0.3,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    getWallColor(x, y) {
        // Create subtle color variations for walls
        const baseHue = 210; // Blue-ish
        const variation = (x + y) % 20;
        return `hsl(${baseHue + variation}, 20%, 25%)`;
    }

    getPathColor(x, y) {
        // Create subtle color variations for paths
        const distance = Math.abs(x - this.player.x) + Math.abs(y - this.player.y);
        const intensity = Math.max(0, 1 - distance / 10);
        const hue = 200 + (distance * 2); // Blue to purple gradient
        return `hsl(${hue}, 30%, ${15 + intensity * 10}%)`;
    }

    updatePlayerPosition() {
        const playerElement = document.querySelector('.player-indicator');
        const canvasRect = this.canvas.getBoundingClientRect();
        const scaleX = canvasRect.width / this.canvas.width;
        const scaleY = canvasRect.height / this.canvas.height;

        playerElement.style.left = (this.player.x * this.cellSize * scaleX + canvasRect.left) + 'px';
        playerElement.style.top = (this.player.y * this.cellSize * scaleY + canvasRect.top) + 'px';

        this.updateAudioProperties();
        this.updateRoomInfo();
        this.createEchoParticles();
    }

    updateAudioProperties() {
        const roomType = this.getCurrentRoomType();

        // Update reverb time
        this.reverbTime = roomType.reverb;
        this.updateReverbImpulse();

        // Update reflection density
        this.reflectionDensity = roomType.density;

        // Update stereo position based on player position
        this.stereoPosition = (this.player.x / this.mazeSize) * 2 - 1; // -1 to 1
        if (this.pannerNode) {
            this.pannerNode.positionX.value = this.stereoPosition * 5;
        }

        // Update echo intensity based on room size
        this.echoIntensity = Math.min(1, roomType.reverb / 4);

        this.updateUI();
    }

    getCurrentRoomType() {
        // Determine room type based on position and surroundings
        const x = this.player.x;
        const y = this.player.y;

        // Check if at goal
        if (x === this.goal.x && y === this.goal.y) {
            return this.roomTypes.goal;
        }

        // Check if at entrance
        if (x <= 2 && y <= 2) {
            return this.roomTypes.entrance;
        }

        // Count open neighbors
        let openNeighbors = 0;
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < this.mazeSize && ny >= 0 && ny < this.mazeSize && this.maze[ny][nx] === 0) {
                openNeighbors++;
            }
        }

        if (openNeighbors <= 1) {
            return this.roomTypes.deadend;
        } else if (openNeighbors >= 3) {
            return this.roomTypes.chamber;
        } else if (openNeighbors === 2) {
            return this.roomTypes.corridor;
        } else {
            return this.roomTypes.junction;
        }
    }

    updateRoomInfo() {
        const roomType = this.getCurrentRoomType();
        document.getElementById('current-room').textContent = roomType.name;
        document.getElementById('room-description').textContent = roomType.description;
    }

    createEchoParticles() {
        const particlesContainer = document.querySelector('.echo-particles');
        particlesContainer.innerHTML = '';

        // Create echo particles based on reflection density
        const particleCount = Math.floor(this.reflectionDensity * 20);

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'echo-particle';

            // Random position around player
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 100 + 20;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            particle.style.left = `calc(50% + ${x}px)`;
            particle.style.top = `calc(50% + ${y}px)`;

            // Random delay
            particle.style.animationDelay = Math.random() * 2 + 's';

            particlesContainer.appendChild(particle);

            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 3000);
        }
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('up-btn').addEventListener('click', () => this.movePlayer(0, -1));
        document.getElementById('down-btn').addEventListener('click', () => this.movePlayer(0, 1));
        document.getElementById('left-btn').addEventListener('click', () => this.movePlayer(-1, 0));
        document.getElementById('right-btn').addEventListener('click', () => this.movePlayer(1, 0));

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    this.movePlayer(0, -1);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    this.movePlayer(0, 1);
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.movePlayer(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.movePlayer(1, 0);
                    break;
            }
        });

        // Controls
        document.getElementById('master-volume').addEventListener('input', this.handleMasterVolume.bind(this));
        document.getElementById('maze-size').addEventListener('change', this.handleMazeSize.bind(this));
        document.getElementById('reset-maze').addEventListener('click', this.resetMaze.bind(this));
        document.getElementById('source-volume').addEventListener('input', this.handleSourceVolume.bind(this));
        document.getElementById('echo-trigger').addEventListener('click', this.triggerEcho.bind(this));

        // Sound source selection
        document.querySelectorAll('.source-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.source-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectSoundSource(btn.dataset.source);
            });
        });
    }

    movePlayer(dx, dy) {
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;

        if (newX >= 0 && newX < this.mazeSize && newY >= 0 && newY < this.mazeSize && this.maze[newY][newX] === 0) {
            this.player.x = newX;
            this.player.y = newY;
            this.updatePlayerPosition();
            this.drawMaze(); // Redraw to update path colors
        }
    }

    selectSoundSource(sourceType) {
        // Stop current source
        if (this.currentSource) {
            this.currentSource.stop();
        }

        // Create new source based on type
        switch (sourceType) {
            case 'voice':
                this.currentSource = this.createVoiceSource();
                break;
            case 'guitar':
                this.currentSource = this.createGuitarSource();
                break;
            case 'piano':
                this.currentSource = this.createPianoSource();
                break;
            case 'drums':
                this.currentSource = this.createDrumSource();
                break;
            case 'ambient':
                this.currentSource = this.createAmbientSource();
                break;
        }

        if (this.currentSource) {
            this.currentSource.connect(this.masterGain);
            this.currentSource.start();
        }
    }

    createVoiceSource() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
        oscillator.type = 'sawtooth';

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 2);

        oscillator.connect(gainNode);

        // Auto-stop
        setTimeout(() => {
            oscillator.stop();
        }, 2000);

        return gainNode;
    }

    createGuitarSource() {
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator1.frequency.setValueAtTime(196, this.audioContext.currentTime); // G3
        oscillator2.frequency.setValueAtTime(247, this.audioContext.currentTime); // B3

        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 3);

        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);

        oscillator1.start();
        oscillator2.start();

        setTimeout(() => {
            oscillator1.stop();
            oscillator2.stop();
        }, 3000);

        return gainNode;
    }

    createPianoSource() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.frequency.setValueAtTime(261.63, this.audioContext.currentTime); // C4
        oscillator.type = 'triangle';

        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 4);

        oscillator.connect(gainNode);
        oscillator.start();

        setTimeout(() => {
            oscillator.stop();
        }, 4000);

        return gainNode;
    }

    createDrumSource() {
        const noise = this.createNoiseBuffer();
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = noise;
        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

        source.connect(gainNode);
        source.start();

        return gainNode;
    }

    createAmbientSource() {
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();

        oscillator1.frequency.setValueAtTime(110, this.audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(165, this.audioContext.currentTime);

        lfo.frequency.setValueAtTime(0.1, this.audioContext.currentTime);
        lfoGain.gain.setValueAtTime(10, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(oscillator1.frequency);
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);

        oscillator1.start();
        oscillator2.start();
        lfo.start();

        return gainNode;
    }

    createNoiseBuffer() {
        const bufferSize = this.audioContext.sampleRate * 0.5;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        return buffer;
    }

    triggerEcho() {
        if (!this.currentSource) {
            this.selectSoundSource('voice');
        }

        // Create additional echo effect
        const echoGain = this.audioContext.createGain();
        echoGain.gain.setValueAtTime(this.echoIntensity, this.audioContext.currentTime);
        echoGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 2);

        // Create delayed copy
        setTimeout(() => {
            if (this.currentSource) {
                const echoSource = this.createVoiceSource();
                echoSource.connect(echoGain);
                echoGain.connect(this.masterGain);
            }
        }, 500);
    }

    handleMasterVolume(e) {
        const volume = parseFloat(e.target.value);
        if (this.masterGain) {
            this.masterGain.gain.value = volume;
        }
        document.getElementById('master-volume-value').textContent = Math.round(volume * 100) + '%';
    }

    handleSourceVolume(e) {
        // This would affect the current source volume
        document.getElementById('source-volume-value').textContent = Math.round(parseFloat(e.target.value) * 100) + '%';
    }

    handleMazeSize(e) {
        this.mazeSize = parseInt(e.target.value.split('x')[0]);
        this.cellSize = Math.max(10, 400 / this.mazeSize);
        this.resetMaze();
    }

    resetMaze() {
        this.generateMaze();
        this.player = { x: 1, y: 1 };
        this.updatePlayerPosition();
    }

    startVisualization() {
        const animate = () => {
            this.updateVisualization();
            requestAnimationFrame(animate);
        };
        animate();
    }

    updateVisualization() {
        // Update stereo position indicator
        const positionMarker = document.getElementById('stereo-position');
        const positionPercent = ((this.stereoPosition + 1) / 2) * 100;
        positionMarker.style.left = positionPercent + '%';

        // Update stereo value text
        const stereoValue = document.getElementById('stereo-value');
        if (Math.abs(this.stereoPosition) < 0.1) {
            stereoValue.textContent = 'Center';
        } else if (this.stereoPosition < 0) {
            stereoValue.textContent = 'Left';
        } else {
            stereoValue.textContent = 'Right';
        }
    }

    updateUI() {
        // Update reverb time
        document.getElementById('reverb-time').textContent = this.reverbTime.toFixed(1) + 's';
        document.getElementById('reverb-bar').style.width = (this.reverbTime / 6) * 100 + '%';

        // Update reflection density
        const densityText = this.reflectionDensity < 0.3 ? 'Low' : this.reflectionDensity < 0.7 ? 'Medium' : 'High';
        document.getElementById('reflection-density').textContent = densityText;
        document.getElementById('density-bar').style.width = this.reflectionDensity * 100 + '%';

        // Update echo intensity
        const intensityText = this.echoIntensity < 0.3 ? 'Low' : this.echoIntensity < 0.7 ? 'Normal' : 'High';
        document.getElementById('echo-intensity').textContent = intensityText;
        document.getElementById('intensity-bar').style.width = this.echoIntensity * 100 + '%';
    }
}

// Initialize the labyrinth when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AcousticLabyrinth();
});