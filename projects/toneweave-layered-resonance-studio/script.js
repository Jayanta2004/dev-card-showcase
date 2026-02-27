// TONEWEAVE · layered resonance studio #5978 - Script

class ToneweaveStudio {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.layers = new Map();
        this.layerCounter = 0;
        this.sessionStartTime = Date.now();
        this.sessionTimer = null;

        this.init();
        this.setupEventListeners();
        this.startSessionTimer();
    }

    init() {
        // Initialize Web Audio API
        this.initAudio();

        // Update UI elements
        this.updateLayerCount();
        this.updatePlaybackStatus('Ready');
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0.7;

            // Resume context on user interaction
            document.addEventListener('click', () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            }, { once: true });
        } catch (error) {
            console.error('Web Audio API not supported:', error);
            this.showError('Web Audio API not supported in this browser');
        }
    }

    setupEventListeners() {
        // Fragment drag and drop
        const fragments = document.querySelectorAll('.fragment-block');
        fragments.forEach(fragment => {
            fragment.addEventListener('dragstart', this.handleDragStart.bind(this));
        });

        const canvas = document.getElementById('resonance-canvas');
        canvas.addEventListener('dragover', this.handleDragOver.bind(this));
        canvas.addEventListener('drop', this.handleDrop.bind(this));
        canvas.addEventListener('dragleave', this.handleDragLeave.bind(this));

        // Global controls
        document.getElementById('master-volume').addEventListener('input', this.handleMasterVolume.bind(this));
        document.getElementById('fade-duration').addEventListener('input', this.handleFadeDuration.bind(this));
        document.getElementById('clear-canvas').addEventListener('click', this.clearCanvas.bind(this));
    }

    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.type);
        e.dataTransfer.effectAllowed = 'copy';
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        e.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        const fragmentType = e.dataTransfer.getData('text/plain');
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.addLayer(fragmentType, x, y);
    }

    addLayer(type, x, y) {
        if (!this.audioContext) return;

        const layerId = ++this.layerCounter;
        const layer = {
            id: layerId,
            type: type,
            x: x,
            y: y,
            volume: 0.8,
            isPlaying: false,
            audioNodes: null,
            element: null
        };

        // Create visual element
        layer.element = this.createLayerElement(layer);
        document.getElementById('resonance-canvas').appendChild(layer.element);

        // Create audio nodes
        layer.audioNodes = this.createAudioNodes(type);

        // Add to layers map
        this.layers.set(layerId, layer);

        // Add to layer controls
        this.addLayerControl(layer);

        // Start playing
        this.playLayer(layer);

        this.updateLayerCount();
    }

    createLayerElement(layer) {
        const element = document.createElement('div');
        element.className = 'layered-fragment';
        element.style.left = `${layer.x - 40}px`;
        element.style.top = `${layer.y - 40}px`;
        element.dataset.layerId = layer.id;

        const icon = this.getFragmentIcon(layer.type);
        element.innerHTML = `<i class="${icon}"></i>`;

        // Make draggable
        element.draggable = true;
        element.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', layer.id);
            e.dataTransfer.effectAllowed = 'move';
        });

        // Click to toggle play/pause
        element.addEventListener('click', () => {
            this.toggleLayer(layer.id);
        });

        return element;
    }

    createAudioNodes(type) {
        const gainNode = this.audioContext.createGain();
        gainNode.connect(this.masterGain);
        gainNode.gain.value = 0;

        let sourceNode;

        switch (type) {
            case 'ocean':
                sourceNode = this.createOceanSound();
                break;
            case 'forest':
                sourceNode = this.createForestSound();
                break;
            case 'rain':
                sourceNode = this.createRainSound();
                break;
            case 'wind':
                sourceNode = this.createWindSound();
                break;
            case 'birds':
                sourceNode = this.createBirdSound();
                break;
            case 'thunder':
                sourceNode = this.createThunderSound();
                break;
            case 'fire':
                sourceNode = this.createFireSound();
                break;
            case 'bells':
                sourceNode = this.createBellSound();
                break;
            default:
                sourceNode = this.createDefaultSound();
        }

        if (sourceNode) {
            sourceNode.connect(gainNode);
        }

        return { source: sourceNode, gain: gainNode };
    }

    // Ambient sound generators using Web Audio API
    createOceanSound() {
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        const gain2 = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        oscillator1.frequency.setValueAtTime(0.1, this.audioContext.currentTime);
        oscillator1.frequency.setValueAtTime(0.15, this.audioContext.currentTime + 1);
        oscillator2.frequency.setValueAtTime(0.08, this.audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(0.12, this.audioContext.currentTime + 1);

        gain1.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain2.gain.setValueAtTime(0.2, this.audioContext.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, this.audioContext.currentTime);

        oscillator1.connect(gain1);
        oscillator2.connect(gain2);
        gain1.connect(filter);
        gain2.connect(filter);

        oscillator1.start();
        oscillator2.start();

        return filter;
    }

    createForestSound() {
        const noise = this.createWhiteNoise();
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        filter.Q.setValueAtTime(0.5, this.audioContext.currentTime);

        gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);

        noise.connect(filter);
        filter.connect(gain);

        return gain;
    }

    createRainSound() {
        const noise = this.createWhiteNoise();
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);

        gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);

        noise.connect(filter);
        filter.connect(gain);

        return gain;
    }

    createWindSound() {
        const noise = this.createPinkNoise();
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, this.audioContext.currentTime);

        lfo.frequency.setValueAtTime(0.1, this.audioContext.currentTime);
        lfoGain.gain.setValueAtTime(200, this.audioContext.currentTime);

        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        noise.connect(filter);
        filter.connect(gain);

        lfo.start();

        return gain;
    }

    createBirdSound() {
        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        // Simple chirp pattern
        const now = this.audioContext.currentTime;
        oscillator.frequency.setValueAtTime(1000, now);
        oscillator.frequency.setValueAtTime(1200, now + 0.1);
        oscillator.frequency.setValueAtTime(800, now + 0.2);

        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.1, now + 0.05);
        gain.gain.setValueAtTime(0, now + 0.3);

        oscillator.connect(gain);
        oscillator.start(now);
        oscillator.stop(now + 0.3);

        return gain;
    }

    createThunderSound() {
        const noise = this.createWhiteNoise();
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(100, this.audioContext.currentTime);

        gain.gain.setValueAtTime(0.8, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 2);

        noise.connect(filter);
        filter.connect(gain);

        return gain;
    }

    createFireSound() {
        const noise = this.createWhiteNoise();
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
        filter.Q.setValueAtTime(2, this.audioContext.currentTime);

        gain.gain.setValueAtTime(0.05, this.audioContext.currentTime);

        noise.connect(filter);
        filter.connect(gain);

        return gain;
    }

    createBellSound() {
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        oscillator1.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(1000, this.audioContext.currentTime);

        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 3);

        oscillator1.connect(gain);
        oscillator2.connect(gain);

        oscillator1.start();
        oscillator2.start();

        setTimeout(() => {
            oscillator1.stop();
            oscillator2.stop();
        }, 3000);

        return gain;
    }

    createDefaultSound() {
        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);

        oscillator.connect(gain);
        oscillator.start();

        return gain;
    }

    createWhiteNoise() {
        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.start();

        return source;
    }

    createPinkNoise() {
        // Simple approximation of pink noise
        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            data[i] *= 0.11;
            b6 = white * 0.115926;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.start();

        return source;
    }

    getFragmentIcon(type) {
        const icons = {
            ocean: 'fas fa-water',
            forest: 'fas fa-tree',
            rain: 'fas fa-cloud-rain',
            wind: 'fas fa-wind',
            birds: 'fas fa-dove',
            thunder: 'fas fa-bolt',
            fire: 'fas fa-fire',
            bells: 'fas fa-bell'
        };
        return icons[type] || 'fas fa-music';
    }

    playLayer(layer) {
        if (!layer.audioNodes) return;

        const fadeDuration = parseFloat(document.getElementById('fade-duration').value);
        const now = this.audioContext.currentTime;

        layer.audioNodes.gain.gain.cancelScheduledValues(now);
        layer.audioNodes.gain.gain.setValueAtTime(layer.audioNodes.gain.gain.value, now);
        layer.audioNodes.gain.gain.linearRampToValueAtTime(layer.volume, now + fadeDuration);

        layer.isPlaying = true;
        layer.element.classList.add('playing');

        this.updatePlaybackStatus('Playing');
    }

    pauseLayer(layer) {
        if (!layer.audioNodes) return;

        const fadeDuration = parseFloat(document.getElementById('fade-duration').value);
        const now = this.audioContext.currentTime;

        layer.audioNodes.gain.gain.cancelScheduledValues(now);
        layer.audioNodes.gain.gain.setValueAtTime(layer.audioNodes.gain.gain.value, now);
        layer.audioNodes.gain.gain.linearRampToValueAtTime(0, now + fadeDuration);

        layer.isPlaying = false;
        layer.element.classList.remove('playing');
    }

    toggleLayer(layerId) {
        const layer = this.layers.get(layerId);
        if (!layer) return;

        if (layer.isPlaying) {
            this.pauseLayer(layer);
        } else {
            this.playLayer(layer);
        }
    }

    addLayerControl(layer) {
        const layerList = document.getElementById('layer-list');
        const emptyState = layerList.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        const layerItem = document.createElement('div');
        layerItem.className = 'layer-item';
        layerItem.dataset.layerId = layer.id;

        layerItem.innerHTML = `
            <div class="layer-item-header">
                <span class="layer-item-title">${this.getFragmentName(layer.type)}</span>
                <div class="layer-item-controls">
                    <input type="range" min="0" max="1" step="0.01" value="${layer.volume}" class="volume-control">
                    <button class="remove-layer" title="Remove layer">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;

        // Volume control
        const volumeControl = layerItem.querySelector('.volume-control');
        volumeControl.addEventListener('input', (e) => {
            layer.volume = parseFloat(e.target.value);
            if (layer.isPlaying && layer.audioNodes) {
                layer.audioNodes.gain.gain.value = layer.volume;
            }
        });

        // Remove layer
        const removeBtn = layerItem.querySelector('.remove-layer');
        removeBtn.addEventListener('click', () => {
            this.removeLayer(layer.id);
        });

        layerList.appendChild(layerItem);
    }

    getFragmentName(type) {
        const names = {
            ocean: 'Ocean Waves',
            forest: 'Forest Ambience',
            rain: 'Rainfall',
            wind: 'Wind Chimes',
            birds: 'Birdsong',
            thunder: 'Thunder',
            fire: 'Crackling Fire',
            bells: 'Tibetan Bells'
        };
        return names[type] || 'Unknown';
    }

    removeLayer(layerId) {
        const layer = this.layers.get(layerId);
        if (!layer) return;

        // Stop audio
        if (layer.audioNodes) {
            layer.audioNodes.gain.gain.value = 0;
            if (layer.audioNodes.source && layer.audioNodes.source.stop) {
                try {
                    layer.audioNodes.source.stop();
                } catch (e) {
                    // Source might already be stopped
                }
            }
        }

        // Remove visual element
        if (layer.element) {
            layer.element.remove();
        }

        // Remove from controls
        const layerItem = document.querySelector(`.layer-item[data-layer-id="${layerId}"]`);
        if (layerItem) {
            layerItem.remove();
        }

        // Remove from layers map
        this.layers.delete(layerId);

        this.updateLayerCount();

        // Add empty state if no layers
        if (this.layers.size === 0) {
            const layerList = document.getElementById('layer-list');
            layerList.innerHTML = '<p class="empty-state">No layers added yet</p>';
            this.updatePlaybackStatus('Ready');
        }
    }

    handleMasterVolume(e) {
        const volume = parseFloat(e.target.value);
        if (this.masterGain) {
            this.masterGain.gain.value = volume;
        }
        document.getElementById('master-volume-value').textContent = Math.round(volume * 100) + '%';
    }

    handleFadeDuration(e) {
        const duration = parseFloat(e.target.value);
        document.getElementById('fade-duration-value').textContent = duration + 's';
    }

    clearCanvas() {
        // Remove all layers
        const layerIds = Array.from(this.layers.keys());
        layerIds.forEach(id => this.removeLayer(id));
    }

    updateLayerCount() {
        const count = this.layers.size;
        document.getElementById('layer-count').textContent = `${count} layer${count !== 1 ? 's' : ''}`;
    }

    updatePlaybackStatus(status) {
        document.getElementById('playback-status').textContent = status;
    }

    startSessionTimer() {
        this.sessionTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 1000);
            const hours = Math.floor(elapsed / 3600);
            const minutes = Math.floor((elapsed % 3600) / 60);
            const seconds = elapsed % 60;
            document.getElementById('session-time').textContent =
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    showError(message) {
        // Simple error display - could be enhanced with a proper notification system
        console.error(message);
        alert(message);
    }
}

// Initialize the studio when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ToneweaveStudio();
});