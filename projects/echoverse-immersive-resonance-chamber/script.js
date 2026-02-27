// ECHOVERSE · Immersive Resonance Chamber #5971 - JavaScript Implementation

class EchoverseResonanceChamber {
    constructor() {
        this.audioContext = null;
        this.isAudioEnabled = false;
        this.soundLayers = {};
        this.audioNodes = {};
        this.interactionMode = 'cursor';
        this.mousePosition = { x: 0, y: 0 };
        this.animationFrame = null;

        this.initializeElements();
        this.setupEventListeners();
        this.initializeAudioWarning();
        this.startVisualUpdates();
    }

    initializeElements() {
        // Audio warning
        this.audioWarning = document.getElementById('audio-warning');
        this.enableAudioBtn = document.getElementById('enable-audio');

        // Resonance chamber
        this.resonanceChamber = document.getElementById('resonance-chamber');
        this.interactionCursor = document.getElementById('interaction-cursor');

        // Audio controls
        this.masterVolume = document.getElementById('master-volume');
        this.reverbDepth = document.getElementById('reverb-depth');
        this.pitchModulation = document.getElementById('pitch-modulation');
        this.spatialWidth = document.getElementById('spatial-width');

        // Layer controls
        this.layerToggles = {
            ambient: document.getElementById('ambient-toggle'),
            harmonic: document.getElementById('harmonic-toggle'),
            percussive: document.getElementById('percussive-toggle'),
            atmospheric: document.getElementById('atmospheric-toggle'),
            organic: document.getElementById('organic-toggle')
        };

        this.layerVolumes = {
            ambient: document.getElementById('ambient-volume'),
            harmonic: document.getElementById('harmonic-volume'),
            percussive: document.getElementById('percussive-volume'),
            atmospheric: document.getElementById('atmospheric-volume'),
            organic: document.getElementById('organic-volume')
        };

        // Mode buttons
        this.modeButtons = document.querySelectorAll('.mode-btn');

        // Audio analysis
        this.audioVisualizer = document.getElementById('audio-visualizer');
        this.freqRange = document.getElementById('freq-range');
        this.activeLayers = document.getElementById('active-layers');
        this.reverbTime = document.getElementById('reverb-time');
        this.spatialPos = document.getElementById('spatial-pos');

        // Performance metrics
        this.audioLatency = document.getElementById('audio-latency');
        this.cpuUsage = document.getElementById('cpu-usage');
        this.memoryUsage = document.getElementById('memory-usage');

        // Value displays
        this.valueDisplays = {
            'master-volume': document.getElementById('master-volume-value'),
            'reverb-depth': document.getElementById('reverb-depth-value'),
            'pitch-modulation': document.getElementById('pitch-modulation-value'),
            'spatial-width': document.getElementById('spatial-width-value'),
            'ambient-volume': document.getElementById('ambient-volume-value'),
            'harmonic-volume': document.getElementById('harmonic-volume-value'),
            'percussive-volume': document.getElementById('percussive-volume-value'),
            'atmospheric-volume': document.getElementById('atmospheric-volume-value'),
            'organic-volume': document.getElementById('organic-volume-value')
        };
    }

    setupEventListeners() {
        // Audio enable button
        this.enableAudioBtn.addEventListener('click', () => this.enableAudio());

        // Mouse tracking
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.resonanceChamber.addEventListener('mouseenter', () => this.showInteractionCursor());
        this.resonanceChamber.addEventListener('mouseleave', () => this.hideInteractionCursor());

        // Audio controls
        this.masterVolume.addEventListener('input', (e) => this.updateMasterVolume(e.target.value));
        this.reverbDepth.addEventListener('input', (e) => this.updateReverbDepth(e.target.value));
        this.pitchModulation.addEventListener('input', (e) => this.updatePitchModulation(e.target.value));
        this.spatialWidth.addEventListener('input', (e) => this.updateSpatialWidth(e.target.value));

        // Layer controls
        Object.keys(this.layerToggles).forEach(layer => {
            this.layerToggles[layer].addEventListener('change', (e) => this.toggleLayer(layer, e.target.checked));
            this.layerVolumes[layer].addEventListener('input', (e) => this.updateLayerVolume(layer, e.target.value));
        });

        // Mode buttons
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.setInteractionMode(btn.dataset.mode));
        });

        // Sound nodes
        document.querySelectorAll('.sound-node').forEach(node => {
            node.addEventListener('mousedown', (e) => this.handleNodeInteraction(e, node));
        });

        // Update value displays
        Object.keys(this.valueDisplays).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', (e) => {
                    this.valueDisplays[id].textContent = e.target.value + (id.includes('volume') || id.includes('depth') || id.includes('width') ? '%' : id.includes('modulation') ? '%' : '%');
                });
            }
        });
    }

    async enableAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            await this.audioContext.resume();

            this.isAudioEnabled = true;
            this.audioWarning.classList.add('hidden');

            this.initializeAudioLayers();
            this.startAudioProcessing();

            console.log('ECHOVERSE: Audio context enabled');
        } catch (error) {
            console.error('ECHOVERSE: Failed to enable audio:', error);
            alert('Unable to enable audio. Please check your browser settings.');
        }
    }

    initializeAudioLayers() {
        // Create master gain node
        this.audioNodes.masterGain = this.audioContext.createGain();
        this.audioNodes.masterGain.connect(this.audioContext.destination);

        // Create reverb
        this.createReverb();

        // Create spatial audio panner
        this.audioNodes.panner = this.audioContext.createPanner();
        this.audioNodes.panner.panningModel = 'HRTF';
        this.audioNodes.panner.distanceModel = 'inverse';
        this.audioNodes.panner.connect(this.audioNodes.masterGain);

        // Initialize sound layers
        this.initializeSoundLayers();

        // Create analyzer for visualization
        this.audioNodes.analyzer = this.audioContext.createAnalyser();
        this.audioNodes.analyzer.fftSize = 256;
        this.audioNodes.analyzer.connect(this.audioNodes.masterGain);

        this.audioData = new Uint8Array(this.audioNodes.analyzer.frequencyBinCount);
    }

    createReverb() {
        this.audioNodes.reverb = this.audioContext.createConvolver();

        // Create impulse response for reverb
        const length = this.audioContext.sampleRate * 2;
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }

        this.audioNodes.reverb.buffer = impulse;
        this.audioNodes.reverb.connect(this.audioNodes.panner);

        // Dry/wet mix
        this.audioNodes.dryGain = this.audioContext.createGain();
        this.audioNodes.wetGain = this.audioContext.createGain();
        this.audioNodes.dryGain.connect(this.audioNodes.panner);
        this.audioNodes.wetGain.connect(this.audioNodes.reverb);
    }

    initializeSoundLayers() {
        const layers = ['ambient', 'harmonic', 'percussive', 'atmospheric', 'organic'];

        layers.forEach(layer => {
            this.soundLayers[layer] = {
                oscillator: null,
                gain: this.audioContext.createGain(),
                filter: this.audioContext.createBiquadFilter(),
                isActive: true,
                volume: 0.5,
                frequency: this.getBaseFrequency(layer),
                modulation: 0
            };

            // Connect nodes
            this.soundLayers[layer].gain.connect(this.audioNodes.dryGain);
            this.soundLayers[layer].filter.connect(this.soundLayers[layer].gain);

            // Create oscillator
            this.createOscillatorForLayer(layer);
        });
    }

    createOscillatorForLayer(layer) {
        const layerData = this.soundLayers[layer];

        if (layerData.oscillator) {
            layerData.oscillator.stop();
        }

        layerData.oscillator = this.audioContext.createOscillator();
        layerData.oscillator.type = this.getOscillatorType(layer);
        layerData.oscillator.frequency.setValueAtTime(layerData.frequency, this.audioContext.currentTime);

        // Add frequency modulation
        const modulationGain = this.audioContext.createGain();
        const modulationOsc = this.audioContext.createOscillator();
        modulationOsc.frequency.setValueAtTime(0.5, this.audioContext.currentTime);
        modulationGain.gain.setValueAtTime(0, this.audioContext.currentTime);

        modulationOsc.connect(modulationGain);
        modulationGain.connect(layerData.oscillator.frequency);

        layerData.modulationGain = modulationGain;
        layerData.modulationOsc = modulationOsc;

        // Connect and start
        layerData.oscillator.connect(layerData.filter);
        layerData.oscillator.start();
        layerData.modulationOsc.start();

        // Set initial volume
        layerData.gain.gain.setValueAtTime(layerData.volume, this.audioContext.currentTime);
    }

    getBaseFrequency(layer) {
        const frequencies = {
            ambient: 110,      // A2
            harmonic: 220,     // A3
            percussive: 440,   // A4
            atmospheric: 880,  // A5
            organic: 55        // A1
        };
        return frequencies[layer] || 220;
    }

    getOscillatorType(layer) {
        const types = {
            ambient: 'sine',
            harmonic: 'triangle',
            percussive: 'square',
            atmospheric: 'sawtooth',
            organic: 'sine'
        };
        return types[layer] || 'sine';
    }

    handleMouseMove(event) {
        const rect = this.resonanceChamber.getBoundingClientRect();
        this.mousePosition.x = event.clientX - rect.left;
        this.mousePosition.y = event.clientY - rect.top;

        // Update cursor position
        this.interactionCursor.style.left = this.mousePosition.x + 'px';
        this.interactionCursor.style.top = this.mousePosition.y + 'px';

        if (this.isAudioEnabled && this.interactionMode === 'cursor') {
            this.updateAudioFromMouse();
        }
    }

    updateAudioFromMouse() {
        const centerX = this.resonanceChamber.offsetWidth / 2;
        const centerY = this.resonanceChamber.offsetHeight / 2;

        const deltaX = (this.mousePosition.x - centerX) / centerX; // -1 to 1
        const deltaY = (this.mousePosition.y - centerY) / centerY; // -1 to 1

        // Update spatial positioning
        this.audioNodes.panner.positionX.setValueAtTime(deltaX * 10, this.audioContext.currentTime);
        this.audioNodes.panner.positionZ.setValueAtTime(deltaY * 10, this.audioContext.currentTime);

        // Update sound parameters based on position
        Object.keys(this.soundLayers).forEach(layer => {
            const layerData = this.soundLayers[layer];

            // Frequency modulation based on X position
            const baseFreq = this.getBaseFrequency(layer);
            const modulatedFreq = baseFreq * (1 + deltaX * 0.5);
            layerData.oscillator.frequency.setValueAtTime(modulatedFreq, this.audioContext.currentTime);

            // Volume modulation based on Y position
            const volumeMod = 0.3 + (deltaY + 1) * 0.35; // 0.3 to 1.0
            layerData.gain.gain.setValueAtTime(layerData.volume * volumeMod, this.audioContext.currentTime);

            // Filter modulation
            const filterFreq = 200 + Math.abs(deltaX) * 2000;
            layerData.filter.frequency.setValueAtTime(filterFreq, this.audioContext.currentTime);
        });

        // Update reverb based on distance from center
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const reverbMix = Math.min(distance, 1);
        this.audioNodes.dryGain.gain.setValueAtTime(1 - reverbMix * 0.7, this.audioContext.currentTime);
        this.audioNodes.wetGain.gain.setValueAtTime(reverbMix * 0.7, this.audioContext.currentTime);

        // Update spatial position display
        this.updateSpatialPosition(deltaX, deltaY);
    }

    updateMasterVolume(value) {
        if (this.audioNodes.masterGain) {
            this.audioNodes.masterGain.gain.setValueAtTime(value / 100, this.audioContext.currentTime);
        }
    }

    updateReverbDepth(value) {
        if (this.audioNodes.dryGain && this.audioNodes.wetGain) {
            const dry = 1 - (value / 100) * 0.8;
            const wet = (value / 100) * 0.8;
            this.audioNodes.dryGain.gain.setValueAtTime(dry, this.audioContext.currentTime);
            this.audioNodes.wetGain.gain.setValueAtTime(wet, this.audioContext.currentTime);
        }
    }

    updatePitchModulation(value) {
        Object.values(this.soundLayers).forEach(layer => {
            if (layer.modulationGain) {
                const modulationAmount = (value / 100) * 50; // 0 to 50 Hz modulation
                layer.modulationGain.gain.setValueAtTime(modulationAmount, this.audioContext.currentTime);
            }
        });
    }

    updateSpatialWidth(value) {
        if (this.audioNodes.panner) {
            this.audioNodes.panner.coneOuterGain = value / 100;
        }
    }

    toggleLayer(layer, enabled) {
        this.soundLayers[layer].isActive = enabled;
        const volume = enabled ? this.soundLayers[layer].volume : 0;
        this.soundLayers[layer].gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
        this.updateActiveLayersCount();
    }

    updateLayerVolume(layer, value) {
        this.soundLayers[layer].volume = value / 100;
        if (this.soundLayers[layer].isActive) {
            this.soundLayers[layer].gain.gain.setValueAtTime(this.soundLayers[layer].volume, this.audioContext.currentTime);
        }
    }

    setInteractionMode(mode) {
        this.interactionMode = mode;

        // Update button states
        this.modeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });

        console.log('ECHOVERSE: Interaction mode set to', mode);
    }

    handleNodeInteraction(event, node) {
        const layer = node.dataset.layer;
        const rect = this.resonanceChamber.getBoundingClientRect();
        const startX = event.clientX - rect.left;
        const startY = event.clientY - rect.top;

        const handleMouseMove = (e) => {
            const newX = e.clientX - rect.left;
            const newY = e.clientY - rect.top;

            // Update node position
            const percentageX = (newX / rect.width) * 100;
            const percentageY = (newY / rect.height) * 100;

            node.style.left = percentageX + '%';
            node.style.top = percentageY + '%';

            // Update audio based on new position
            if (this.isAudioEnabled) {
                const deltaX = (percentageX - 50) / 50; // -1 to 1
                const deltaY = (percentageY - 50) / 50; // -1 to 1

                // Update spatial positioning for this layer
                const layerData = this.soundLayers[layer];
                if (layerData) {
                    const baseFreq = this.getBaseFrequency(layer);
                    const modulatedFreq = baseFreq * (1 + deltaX * 0.3);
                    layerData.oscillator.frequency.setValueAtTime(modulatedFreq, this.audioContext.currentTime);

                    const volumeMod = 0.5 + (deltaY + 1) * 0.25;
                    layerData.gain.gain.setValueAtTime(layerData.volume * volumeMod, this.audioContext.currentTime);
                }
            }
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    updateSpatialPosition(deltaX, deltaY) {
        let position = 'Center';
        if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
            if (deltaX > 0.5) position = 'Right';
            else if (deltaX < -0.5) position = 'Left';
            if (deltaY > 0.5) position = 'Back';
            else if (deltaY < -0.5) position = 'Front';
        }
        this.spatialPos.textContent = position;
    }

    updateActiveLayersCount() {
        const activeCount = Object.values(this.soundLayers).filter(layer => layer.isActive).length;
        this.activeLayers.textContent = `${activeCount}/5`;
    }

    startAudioProcessing() {
        if (this.audioContext && this.audioNodes.analyzer) {
            const processAudio = () => {
                if (this.isAudioEnabled) {
                    this.audioNodes.analyzer.getByteFrequencyData(this.audioData);
                    this.updateVisualizer();
                    this.updateAudioMetrics();
                }
                requestAnimationFrame(processAudio);
            };
            processAudio();
        }
    }

    updateVisualizer() {
        const canvas = this.audioVisualizer;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.fillStyle = 'rgb(10, 10, 10)';
        ctx.fillRect(0, 0, width, height);

        const barWidth = (width / this.audioData.length) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < this.audioData.length; i++) {
            barHeight = (this.audioData[i] / 255) * height;

            const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
            gradient.addColorStop(0, '#00ffff');
            gradient.addColorStop(0.5, '#ff00ff');
            gradient.addColorStop(1, '#ffff00');

            ctx.fillStyle = gradient;
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    updateAudioMetrics() {
        // Calculate frequency range
        let minFreq = 20000;
        let maxFreq = 20;
        let activeBins = 0;

        for (let i = 0; i < this.audioData.length; i++) {
            if (this.audioData[i] > 10) {
                activeBins++;
                const freq = (i / this.audioData.length) * (this.audioContext.sampleRate / 2);
                minFreq = Math.min(minFreq, freq);
                maxFreq = Math.max(maxFreq, freq);
            }
        }

        if (activeBins > 0) {
            this.freqRange.textContent = `${Math.round(minFreq)}Hz - ${Math.round(maxFreq)}Hz`;
        }

        // Update reverb time (simulated)
        const reverbValue = this.reverbDepth ? this.reverbDepth.value : 50;
        this.reverbTime.textContent = (0.5 + (reverbValue / 100) * 2.5).toFixed(1) + 's';
    }

    startVisualUpdates() {
        const updateVisuals = () => {
            this.updatePerformanceMetrics();
            this.updateWaveAnimations();
            this.animationFrame = requestAnimationFrame(updateVisuals);
        };
        updateVisuals();
    }

    updatePerformanceMetrics() {
        // Simulate performance metrics
        const latency = Math.random() * 5 + 10;
        const cpu = Math.random() * 15 + 15;
        const memory = Math.random() * 10 + 35;

        this.audioLatency.textContent = latency.toFixed(1) + 'ms';
        this.cpuUsage.textContent = cpu.toFixed(1) + '%';
        this.memoryUsage.textContent = memory.toFixed(0) + 'MB';
    }

    updateWaveAnimations() {
        // Update wave animations based on audio activity
        if (this.audioData) {
            const avgAmplitude = this.audioData.reduce((sum, value) => sum + value, 0) / this.audioData.length;
            const intensity = avgAmplitude / 255;

            document.querySelectorAll('.wave').forEach((wave, index) => {
                const delay = index * 0.5;
                wave.style.animationDuration = (2 + intensity * 2) + 's';
                wave.style.opacity = 0.3 + intensity * 0.7;
            });
        }
    }

    showInteractionCursor() {
        this.interactionCursor.style.opacity = '1';
    }

    hideInteractionCursor() {
        this.interactionCursor.style.opacity = '0';
    }

    initializeAudioWarning() {
        // Show warning initially
        this.audioWarning.classList.remove('hidden');
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        if (this.audioContext) {
            this.audioContext.close();
        }

        // Stop all oscillators
        Object.values(this.soundLayers).forEach(layer => {
            if (layer.oscillator) {
                layer.oscillator.stop();
            }
            if (layer.modulationOsc) {
                layer.modulationOsc.stop();
            }
        });
    }
}

// Initialize the ECHOVERSE when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const echoverse = new EchoverseResonanceChamber();

    // Handle page unload
    window.addEventListener('beforeunload', () => {
        echoverse.destroy();
    });
});