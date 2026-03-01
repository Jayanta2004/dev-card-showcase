// HARMONIC ORB · Tactile Tone Sculpture - JavaScript Implementation

class HarmonicOrb {
    constructor() {
        this.canvas = document.getElementById('orb-canvas');
        this.harmonicCanvas = document.getElementById('harmonic-analysis');

        // Three.js setup
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.orb = null;
        this.geometry = null;
        this.material = null;

        // Audio setup
        this.audioContext = null;
        this.masterGain = null;
        this.oscillators = [];
        this.analyser = null;

        // Interaction state
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.dragVelocity = { x: 0, y: 0 };
        this.orbRotation = { x: 0, y: 0 };
        this.orbScale = 1.0;
        this.morphIntensity = 1.0;

        // Audio parameters
        this.baseFrequency = 220;
        this.harmonicCount = 3;
        this.timbreShift = 0;
        this.dynamicsCompression = 1.0;
        this.colorScheme = 'harmonic';

        // Performance tracking
        this.lastTime = 0;
        this.frameCount = 0;
        this.fps = 0;

        // Harmonic analysis
        this.frequencyData = new Uint8Array(256);

        this.init();
        this.setupEventListeners();
        this.setupControls();
        this.animate();
    }

    init() {
        this.setupThreeJS();
        this.createOrb();
        this.resizeCanvas();

        // Initialize audio context on user interaction
        document.getElementById('enable-audio').addEventListener('click', () => {
            this.initializeAudio();
        });

        window.addEventListener('resize', () => this.resizeCanvas());
    }

    setupThreeJS() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0f0a19);

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 1000);
        this.camera.position.z = 5;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.canvas.appendChild(this.renderer.domElement);

        // Lighting
        this.setupLighting();

        // Controls
        this.setupCameraControls();
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Point lights for color accents
        const pointLight1 = new THREE.PointLight(0x6366f1, 0.5, 100);
        pointLight1.position.set(-5, 0, 5);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xec4899, 0.5, 100);
        pointLight2.position.set(5, 0, -5);
        this.scene.add(pointLight2);
    }

    setupCameraControls() {
        // Mouse controls for camera
        this.mouse = new THREE.Vector2();
        this.target = new THREE.Vector2();
        this.windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
    }

    createOrb() {
        // Create sphere geometry
        this.geometry = new THREE.SphereGeometry(1, 64, 64);

        // Create material
        this.material = new THREE.MeshPhongMaterial({
            color: 0x6366f1,
            shininess: 100,
            transparent: true,
            opacity: 0.8,
            wireframe: false
        });

        // Create mesh
        this.orb = new THREE.Mesh(this.geometry, this.material);
        this.orb.castShadow = true;
        this.orb.receiveShadow = true;

        this.scene.add(this.orb);

        // Add wireframe overlay
        this.wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        this.wireframeOrb = new THREE.Mesh(this.geometry, this.wireframeMaterial);
        this.wireframeOrb.visible = false;
        this.scene.add(this.wireframeOrb);
    }

    async initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create analyser for visualization
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.connect(this.audioContext.destination);

            // Create master gain
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.analyser);
            this.masterGain.gain.value = 0.3;

            // Create initial oscillators
            this.createOscillators();

            document.getElementById('audio-warning').style.display = 'none';
            this.updateSynthesisStatus();

            // Start the audio
            await this.audioContext.resume();

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

            oscillator.type = this.getWaveformForHarmonic(i);
            oscillator.frequency.value = this.baseFrequency * (i + 1) * (1 + this.timbreShift * 0.01);

            // Set harmonic amplitude with compression
            const amplitude = (0.3 / (i + 1)) * this.dynamicsCompression;
            gainNode.gain.value = amplitude;

            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);

            oscillator.start();

            this.oscillators.push({ oscillator, gainNode, harmonic: i + 1 });
        }
    }

    getWaveformForHarmonic(harmonicIndex) {
        const waveforms = ['sine', 'triangle', 'sawtooth', 'square'];
        return waveforms[harmonicIndex % waveforms.length];
    }

    updateOscillators() {
        if (!this.audioContext || !this.oscillators.length) return;

        this.oscillators.forEach((osc, index) => {
            const frequency = this.baseFrequency * (index + 1) * (1 + this.timbreShift * 0.01);
            osc.oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

            const amplitude = (0.3 / (index + 1)) * this.dynamicsCompression;
            osc.gainNode.gain.setValueAtTime(amplitude, this.audioContext.currentTime);
        });
    }

    setupEventListeners() {
        // Mouse events for orb interaction
        this.renderer.domElement.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.renderer.domElement.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.renderer.domElement.addEventListener('mouseup', () => this.handleMouseUp());
        this.renderer.domElement.addEventListener('wheel', (e) => this.handleWheel(e));

        // Touch events for mobile
        this.renderer.domElement.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.renderer.domElement.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.renderer.domElement.addEventListener('touchend', () => this.handleTouchEnd());
    }

    handleMouseDown(e) {
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.dragVelocity = { x: 0, y: 0 };
    }

    handleMouseMove(e) {
        if (this.isDragging) {
            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;

            this.dragVelocity.x = deltaX * 0.01;
            this.dragVelocity.y = deltaY * 0.01;

            // Update orb rotation based on drag
            this.orbRotation.x += deltaY * 0.01;
            this.orbRotation.y += deltaX * 0.01;

            // Calculate morphing based on drag direction and speed
            const dragSpeed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const dragDirection = Math.atan2(deltaY, deltaX);

            this.morphOrb(dragSpeed, dragDirection);

            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        }

        // Update mouse position for camera controls
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    handleMouseUp() {
        this.isDragging = false;
        this.dragVelocity = { x: 0, y: 0 };
    }

    handleWheel(e) {
        e.preventDefault();
        const zoomSpeed = 0.1;
        this.camera.position.z += e.deltaY * zoomSpeed * 0.01;
        this.camera.position.z = Math.max(2, Math.min(10, this.camera.position.z));
    }

    handleTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            this.handleMouseDown(e.touches[0]);
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            this.handleMouseMove(e.touches[0]);
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.handleMouseUp();
    }

    morphOrb(dragSpeed, dragDirection) {
        if (!this.geometry) return;

        const positions = this.geometry.attributes.position;
        const time = Date.now() * 0.001;

        // Morph the geometry based on interaction
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);

            // Calculate distance from interaction point (simplified)
            const distance = Math.sqrt(x * x + y * y + z * z);

            // Apply morphing based on drag parameters
            const morphFactor = Math.sin(distance * 5 + time * 2) * dragSpeed * 0.001 * this.morphIntensity;
            const newRadius = 1 + morphFactor;

            positions.setXYZ(i, x * newRadius, y * newRadius, z * newRadius);
        }

        positions.needsUpdate = true;
        this.geometry.computeVertexNormals();

        // Update wireframe if visible
        if (this.wireframeOrb) {
            this.wireframeOrb.geometry.copy(this.geometry);
        }

        // Update audio based on morphing
        this.updateAudioFromMorph(dragSpeed, dragDirection);
    }

    updateAudioFromMorph(dragSpeed, dragDirection) {
        if (!this.audioContext) return;

        // Map morphing to audio parameters
        const speedFactor = Math.min(dragSpeed * 0.1, 2);
        const directionFactor = dragDirection / Math.PI;

        // Update harmonics based on speed (pulling outward)
        this.harmonicCount = Math.max(1, Math.min(12, 3 + Math.floor(speedFactor * 3)));
        document.getElementById('harmonic-count').value = this.harmonicCount;
        document.getElementById('harmonic-count-value').textContent = this.harmonicCount;

        // Update timbre based on rotation
        this.timbreShift = directionFactor * 50;
        document.getElementById('timbre-shift').value = this.timbreShift;
        document.getElementById('timbre-shift-value').textContent = `${this.timbreShift.toFixed(0)}%`;

        // Update dynamics based on compression
        this.dynamicsCompression = 1 + speedFactor * 0.5;
        document.getElementById('dynamics-compression').value = this.dynamicsCompression;
        document.getElementById('dynamics-compression-value').textContent = `${this.dynamicsCompression.toFixed(1)}x`;

        // Recreate oscillators with new parameters
        this.createOscillators();

        // Update display
        this.updateParameterDisplay();
    }

    setupControls() {
        // Audio controls
        const baseFreqSlider = document.getElementById('base-frequency');
        const baseFreqValue = document.getElementById('base-frequency-value');
        baseFreqSlider.addEventListener('input', (e) => {
            this.baseFrequency = parseFloat(e.target.value);
            baseFreqValue.textContent = `${this.baseFrequency} Hz`;
            this.updateOscillators();
            this.updateParameterDisplay();
        });

        const harmonicSlider = document.getElementById('harmonic-count');
        const harmonicValue = document.getElementById('harmonic-count-value');
        harmonicSlider.addEventListener('input', (e) => {
            this.harmonicCount = parseInt(e.target.value);
            harmonicValue.textContent = this.harmonicCount;
            this.createOscillators();
            this.updateParameterDisplay();
        });

        const timbreSlider = document.getElementById('timbre-shift');
        const timbreValue = document.getElementById('timbre-shift-value');
        timbreSlider.addEventListener('input', (e) => {
            this.timbreShift = parseFloat(e.target.value);
            timbreValue.textContent = `${this.timbreShift}%`;
            this.updateOscillators();
            this.updateParameterDisplay();
        });

        const dynamicsSlider = document.getElementById('dynamics-compression');
        const dynamicsValue = document.getElementById('dynamics-compression-value');
        dynamicsSlider.addEventListener('input', (e) => {
            this.dynamicsCompression = parseFloat(e.target.value);
            dynamicsValue.textContent = `${this.dynamicsCompression.toFixed(1)}x`;
            this.updateOscillators();
            this.updateParameterDisplay();
        });

        // Visual controls
        const sizeSlider = document.getElementById('orb-size');
        const sizeValue = document.getElementById('orb-size-value');
        sizeSlider.addEventListener('input', (e) => {
            this.orbScale = parseFloat(e.target.value);
            sizeValue.textContent = `${this.orbScale.toFixed(1)}x`;
            this.orb.scale.setScalar(this.orbScale);
            if (this.wireframeOrb) this.wireframeOrb.scale.setScalar(this.orbScale);
        });

        const morphSlider = document.getElementById('morph-intensity');
        const morphValue = document.getElementById('morph-intensity-value');
        morphSlider.addEventListener('input', (e) => {
            this.morphIntensity = parseFloat(e.target.value);
            morphValue.textContent = `${this.morphIntensity.toFixed(1)}x`;
        });

        const colorSelect = document.getElementById('color-scheme');
        colorSelect.addEventListener('change', (e) => {
            this.colorScheme = e.target.value;
            this.updateColorScheme();
        });

        const wireframeToggle = document.getElementById('wireframe-toggle');
        wireframeToggle.addEventListener('change', (e) => {
            if (this.wireframeOrb) {
                this.wireframeOrb.visible = e.target.checked;
            }
        });

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.loadPreset(btn.dataset.preset);
            });
        });
    }

    loadPreset(preset) {
        const presets = {
            bell: { frequency: 523, harmonics: 5, timbre: 10, dynamics: 1.2 },
            pad: { frequency: 220, harmonics: 8, timbre: -20, dynamics: 0.8 },
            lead: { frequency: 330, harmonics: 3, timbre: 30, dynamics: 1.5 },
            bass: { frequency: 110, harmonics: 4, timbre: -10, dynamics: 2.0 },
            noise: { frequency: 200, harmonics: 12, timbre: 50, dynamics: 0.5 },
            pulse: { frequency: 440, harmonics: 2, timbre: 0, dynamics: 1.8 }
        };

        const presetData = presets[preset];
        if (presetData) {
            this.baseFrequency = presetData.frequency;
            this.harmonicCount = presetData.harmonics;
            this.timbreShift = presetData.timbre;
            this.dynamicsCompression = presetData.dynamics;

            // Update UI
            document.getElementById('base-frequency').value = this.baseFrequency;
            document.getElementById('base-frequency-value').textContent = `${this.baseFrequency} Hz`;
            document.getElementById('harmonic-count').value = this.harmonicCount;
            document.getElementById('harmonic-count-value').textContent = this.harmonicCount;
            document.getElementById('timbre-shift').value = this.timbreShift;
            document.getElementById('timbre-shift-value').textContent = `${this.timbreShift}%`;
            document.getElementById('dynamics-compression').value = this.dynamicsCompression;
            document.getElementById('dynamics-compression-value').textContent = `${this.dynamicsCompression.toFixed(1)}x`;

            this.createOscillators();
            this.updateParameterDisplay();
        }
    }

    updateColorScheme() {
        const colors = {
            harmonic: 0x6366f1,
            cosmic: 0x0f0a19,
            aurora: 0x059669,
            plasma: 0xdc2626
        };

        if (this.material) {
            this.material.color.setHex(colors[this.colorScheme] || 0x6366f1);
        }

        document.body.className = `${this.colorScheme}-theme`;
    }

    updateParameterDisplay() {
        const timbreLabels = ['Cold', 'Neutral', 'Warm', 'Bright', 'Harsh'];
        const timbreIndex = Math.floor((this.timbreShift + 50) / 25);
        const timbreLabel = timbreLabels[Math.max(0, Math.min(4, timbreIndex))];

        const dynamicsLabels = ['Soft', 'Medium', 'Loud', 'Punchy', 'Crushing'];
        const dynamicsIndex = Math.floor((this.dynamicsCompression - 0.1) / 0.4);
        const dynamicsLabel = dynamicsLabels[Math.max(0, Math.min(4, dynamicsIndex))];

        document.getElementById('harmonics-value').textContent = this.harmonicCount;
        document.getElementById('timbre-value').textContent = timbreLabel;
        document.getElementById('dynamics-value').textContent = dynamicsLabel;
        document.getElementById('frequency-value').textContent = `${this.baseFrequency} Hz`;
    }

    updateSynthesisStatus() {
        const statusEl = document.getElementById('synthesis-status');
        const statusText = document.querySelector('.status-text');

        if (this.audioContext && this.audioContext.state === 'running') {
            statusEl.innerHTML = '<i class="fas fa-wave-square"></i>';
            statusText.textContent = '3D Synthesis Active';
        } else {
            statusEl.innerHTML = '<i class="fas fa-pause"></i>';
            statusText.textContent = 'Synthesis Paused';
        }
    }

    resizeCanvas() {
        if (!this.camera || !this.renderer) return;

        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    animate(currentTime = 0) {
        requestAnimationFrame((time) => this.animate(time));

        // Calculate FPS
        this.frameCount++;
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;

            // Update performance display
            document.getElementById('render-fps').textContent = this.fps;
            document.getElementById('active-oscillators').textContent = this.oscillators.length;
            if (this.audioContext) {
                const latency = Math.round(this.audioContext.baseLatency * 1000);
                document.getElementById('audio-latency').textContent = `${latency}ms`;
            }
        }

        this.update();
        this.render();
    }

    update() {
        if (!this.orb) return;

        // Update orb rotation
        this.orb.rotation.x = this.orbRotation.x;
        this.orb.rotation.y = this.orbRotation.y;

        if (this.wireframeOrb) {
            this.wireframeOrb.rotation.x = this.orbRotation.x;
            this.wireframeOrb.rotation.y = this.orbRotation.y;
        }

        // Gentle continuous rotation when not interacting
        if (!this.isDragging) {
            this.orbRotation.y += 0.005;
        }

        // Update camera position based on mouse
        this.camera.position.x += (this.mouse.x * 2 - this.camera.position.x) * 0.05;
        this.camera.position.y += (-this.mouse.y * 2 - this.camera.position.y) * 0.05;
        this.camera.lookAt(this.scene.position);

        // Update audio analysis
        if (this.analyser) {
            this.analyser.getByteFrequencyData(this.frequencyData);
            this.updateHarmonicAnalysis();
        }
    }

    render() {
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    updateHarmonicAnalysis() {
        const ctx = this.harmonicCanvas.getContext('2d');
        const width = this.harmonicCanvas.width;
        const height = this.harmonicCanvas.height;

        // Clear
        ctx.fillStyle = '#0f0a19';
        ctx.fillRect(0, 0, width, height);

        // Draw frequency bars
        const barWidth = width / this.frequencyData.length;
        let maxFrequency = 0;
        let peakIndex = 0;

        for (let i = 0; i < this.frequencyData.length; i++) {
            const barHeight = (this.frequencyData[i] / 255) * height;
            const hue = (i / this.frequencyData.length) * 360;

            ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
            ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);

            if (this.frequencyData[i] > maxFrequency) {
                maxFrequency = this.frequencyData[i];
                peakIndex = i;
            }
        }

        // Update analysis values
        const fundamentalFreq = this.baseFrequency;
        const peakFreq = (peakIndex / this.frequencyData.length) * 20000; // Rough estimation
        const spectralCentroid = this.calculateSpectralCentroid();

        document.getElementById('fundamental-freq').textContent = `${fundamentalFreq} Hz`;
        document.getElementById('peak-freq').textContent = `${Math.round(peakFreq)} Hz`;
        document.getElementById('spectral-centroid').textContent = `${Math.round(spectralCentroid)} Hz`;
    }

    calculateSpectralCentroid() {
        let numerator = 0;
        let denominator = 0;

        for (let i = 0; i < this.frequencyData.length; i++) {
            const frequency = (i / this.frequencyData.length) * 20000;
            const magnitude = this.frequencyData[i];

            numerator += frequency * magnitude;
            denominator += magnitude;
        }

        return denominator > 0 ? numerator / denominator : 0;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HarmonicOrb();
});