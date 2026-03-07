// RESONANCE ARCHIVE · living audio anthology #5981 - Script

class ResonanceArchive {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.currentSource = null;
        this.analyser = null;
        this.resonances = [];
        this.selectedSources = [];
        this.isRecording = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.currentBlend = null;
        this.evolutionHistory = [];

        // Blend parameters
        this.blendIntensity = 0.5;
        this.morphRate = 1.0;
        this.echoDepth = 0.3;

        this.init();
        this.setupEventListeners();
        this.loadStoredResonances();
        this.updateEvolutionTimeline();
    }

    init() {
        this.setupAudio();
        this.setupCanvas();
        this.updateUI();
    }

    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create master gain
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.7;

            // Create analyser for visualization
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;

            // Connect nodes
            this.masterGain.connect(this.analyser);
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

    setupCanvas() {
        this.waveformCanvas = document.getElementById('waveform-canvas');
        this.waveformCtx = this.waveformCanvas.getContext('2d');
        this.recordingCanvas = document.getElementById('recording-canvas');
        this.recordingCtx = this.recordingCanvas.getContext('2d');

        // Set canvas sizes
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = this.waveformCanvas.parentElement;
        this.waveformCanvas.width = container.clientWidth;
        this.waveformCanvas.height = 200;
    }

    setupEventListeners() {
        // Upload functionality
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('audio-file');

        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('drop', this.handleFileDrop.bind(this));
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Recording functionality
        document.getElementById('record-btn').addEventListener('click', this.showRecordingModal.bind(this));
        document.getElementById('start-recording').addEventListener('click', this.startRecording.bind(this));
        document.getElementById('stop-recording').addEventListener('click', this.stopRecording.bind(this));

        // Modal controls
        document.querySelector('.modal-close').addEventListener('click', this.hideRecordingModal.bind(this));

        // Playback controls
        document.getElementById('play-master').addEventListener('click', this.playArchive.bind(this));
        document.getElementById('stop-master').addEventListener('click', this.stopPlayback.bind(this));
        document.getElementById('master-volume').addEventListener('input', this.handleMasterVolume.bind(this));

        // Blending controls
        document.getElementById('generate-btn').addEventListener('click', this.generateBlend.bind(this));
        document.getElementById('preview-blend').addEventListener('click', this.previewBlend.bind(this));
        document.getElementById('save-blend').addEventListener('click', this.saveBlend.bind(this));

        // Blend parameters
        document.getElementById('blend-intensity').addEventListener('input', this.updateBlendParameters.bind(this));
        document.getElementById('morph-rate').addEventListener('input', this.updateBlendParameters.bind(this));
        document.getElementById('echo-depth').addEventListener('input', this.updateBlendParameters.bind(this));

        // Search and filter
        document.getElementById('search-input').addEventListener('input', this.filterResonances.bind(this));
        document.getElementById('sort-select').addEventListener('change', this.sortResonances.bind(this));
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleFileDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');

        const files = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith('audio/')
        );

        if (files.length > 0) {
            this.processAudioFiles(files);
        }
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            this.processAudioFiles(files);
        }
    }

    async processAudioFiles(files) {
        for (const file of files) {
            try {
                const resonance = await this.createResonanceFromFile(file);
                this.resonances.push(resonance);
                this.saveResonancesToStorage();
                this.renderResonanceGrid();
                this.addEvolutionEvent(`Added resonance: ${resonance.title}`);
            } catch (error) {
                console.error('Error processing audio file:', error);
            }
        }
    }

    async createResonanceFromFile(file) {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

        return {
            id: Date.now() + Math.random(),
            title: file.name.replace(/\.[^/.]+$/, ''),
            audioBuffer: audioBuffer,
            duration: audioBuffer.duration,
            accessCount: 0,
            blendCount: 0,
            evolutionStage: 'Original',
            createdAt: new Date().toISOString(),
            waveform: this.generateWaveformData(audioBuffer),
            tags: ['user-contributed']
        };
    }

    generateWaveformData(audioBuffer) {
        const channelData = audioBuffer.getChannelData(0);
        const samples = 200; // Number of waveform points
        const blockSize = Math.floor(channelData.length / samples);
        const waveform = [];

        for (let i = 0; i < samples; i++) {
            const start = blockSize * i;
            let sum = 0;

            for (let j = 0; j < blockSize; j++) {
                sum += Math.abs(channelData[start + j]);
            }

            waveform.push(sum / blockSize);
        }

        return waveform;
    }

    showRecordingModal() {
        document.getElementById('recording-modal').classList.add('show');
    }

    hideRecordingModal() {
        document.getElementById('recording-modal').classList.remove('show');
        if (this.isRecording) {
            this.stopRecording();
        }
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = async () => {
                const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
                const resonance = await this.createResonanceFromBlob(blob, 'Live Recording');
                this.resonances.push(resonance);
                this.saveResonancesToStorage();
                this.renderResonanceGrid();
                this.addEvolutionEvent(`Recorded live resonance: ${resonance.title}`);
                this.hideRecordingModal();

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            this.updateRecordingUI();

            document.getElementById('start-recording').classList.add('recording');
            document.getElementById('start-recording').textContent = '🔴 Recording...';
            document.getElementById('start-recording').disabled = true;
            document.getElementById('stop-recording').disabled = false;

        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.updateRecordingUI();
        }
    }

    updateRecordingUI() {
        if (this.isRecording) {
            this.recordingTimer = setInterval(() => {
                const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                document.getElementById('recording-time').textContent =
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }, 1000);
        } else {
            clearInterval(this.recordingTimer);
            document.getElementById('recording-time').textContent = '00:00';
            document.getElementById('start-recording').classList.remove('recording');
            document.getElementById('start-recording').textContent = '🎬 Start Recording';
            document.getElementById('start-recording').disabled = false;
            document.getElementById('stop-recording').disabled = true;
        }
    }

    async createResonanceFromBlob(blob, title) {
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

        return {
            id: Date.now() + Math.random(),
            title: title,
            audioBuffer: audioBuffer,
            duration: audioBuffer.duration,
            accessCount: 0,
            blendCount: 0,
            evolutionStage: 'Original',
            createdAt: new Date().toISOString(),
            waveform: this.generateWaveformData(audioBuffer),
            tags: ['live-recorded']
        };
    }

    playArchive() {
        if (this.resonances.length === 0) return;

        // Stop current playback
        this.stopPlayback();

        // Select a random resonance weighted by access count
        const totalWeight = this.resonances.reduce((sum, r) => sum + (r.accessCount + 1), 0);
        let random = Math.random() * totalWeight;

        let selectedResonance;
        for (const resonance of this.resonances) {
            random -= (resonance.accessCount + 1);
            if (random <= 0) {
                selectedResonance = resonance;
                break;
            }
        }

        if (!selectedResonance) {
            selectedResonance = this.resonances[Math.floor(Math.random() * this.resonances.length)];
        }

        this.playResonance(selectedResonance);
    }

    playResonance(resonance) {
        // Stop current playback
        this.stopPlayback();

        // Create source
        const source = this.audioContext.createBufferSource();
        source.buffer = resonance.audioBuffer;

        // Connect to master gain
        source.connect(this.masterGain);

        // Start playback
        source.start();
        this.currentSource = source;

        // Update resonance stats
        resonance.accessCount++;
        this.saveResonancesToStorage();

        // Update UI
        this.updateCurrentTrackInfo(resonance);
        this.renderResonanceGrid();

        // Auto-stop when finished
        source.onended = () => {
            this.currentSource = null;
            this.updateCurrentTrackInfo(null);
        };

        // Start visualization
        this.startVisualization();
    }

    stopPlayback() {
        if (this.currentSource) {
            try {
                this.currentSource.stop();
            } catch (e) {
                // Source might already be stopped
            }
            this.currentSource = null;
        }
        this.updateCurrentTrackInfo(null);
    }

    updateCurrentTrackInfo(resonance) {
        const titleEl = document.getElementById('current-title');
        const metaEl = document.getElementById('current-meta');
        const accessEl = document.getElementById('access-count');
        const blendEl = document.getElementById('blend-count');
        const evolutionEl = document.getElementById('evolution-stage');

        if (resonance) {
            titleEl.textContent = resonance.title;
            metaEl.textContent = `${this.formatDuration(resonance.duration)} • ${resonance.evolutionStage}`;
            accessEl.textContent = resonance.accessCount;
            blendEl.textContent = resonance.blendCount;
            evolutionEl.textContent = resonance.evolutionStage;
        } else {
            titleEl.textContent = 'No resonance playing';
            metaEl.textContent = 'Select a resonance to begin';
            accessEl.textContent = '0';
            blendEl.textContent = '0';
            evolutionEl.textContent = 'Original';
        }
    }

    generateBlend() {
        if (this.resonances.length < 2) {
            alert('Need at least 2 resonances to create a blend');
            return;
        }

        // Select random resonances for blending
        const shuffled = [...this.resonances].sort(() => Math.random() - 0.5);
        this.selectedSources = shuffled.slice(0, Math.min(3, shuffled.length));

        this.renderSourceList();
        this.createBlend();
    }

    renderSourceList() {
        const sourceList = document.getElementById('source-list');
        sourceList.innerHTML = '';

        this.selectedSources.forEach((resonance, index) => {
            const sourceItem = document.createElement('div');
            sourceItem.className = 'source-item';
            sourceItem.innerHTML = `
                <span>${resonance.title}</span>
                <button class="remove-btn" data-index="${index}">×</button>
            `;

            sourceItem.querySelector('.remove-btn').addEventListener('click', () => {
                this.selectedSources.splice(index, 1);
                this.renderSourceList();
            });

            sourceList.appendChild(sourceItem);
        });
    }

    createBlend() {
        if (this.selectedSources.length === 0) return;

        const blendDuration = Math.max(...this.selectedSources.map(r => r.duration));
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * blendDuration;

        this.currentBlend = this.audioContext.createBuffer(2, length, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = this.currentBlend.getChannelData(channel);

            // Mix all selected sources
            this.selectedSources.forEach((resonance, index) => {
                const sourceData = resonance.audioBuffer.getChannelData(channel % resonance.audioBuffer.numberOfChannels);
                const phase = index * 0.3; // Slight phase offset for each source

                for (let i = 0; i < Math.min(length, sourceData.length); i++) {
                    // Apply blend intensity and morphing
                    const morphFactor = Math.sin(i / length * Math.PI * this.morphRate) * 0.5 + 0.5;
                    const blendFactor = this.blendIntensity / this.selectedSources.length;

                    // Add echo effect
                    let sample = sourceData[i] * blendFactor;
                    if (i > sampleRate * 0.1) { // Add echo after 100ms
                        const echoIndex = Math.floor(i - sampleRate * 0.1);
                        if (echoIndex >= 0) {
                            sample += channelData[echoIndex] * this.echoDepth;
                        }
                    }

                    channelData[i] += sample * (1 + morphFactor * 0.5);
                }
            });

            // Normalize
            const maxValue = Math.max(...channelData.map(Math.abs));
            if (maxValue > 1) {
                for (let i = 0; i < length; i++) {
                    channelData[i] /= maxValue;
                }
            }
        }
    }

    previewBlend() {
        if (!this.currentBlend) {
            this.createBlend();
        }

        if (this.currentBlend) {
            this.stopPlayback();

            const source = this.audioContext.createBufferSource();
            source.buffer = this.currentBlend;
            source.connect(this.masterGain);
            source.start();

            this.currentSource = source;
            this.updateCurrentTrackInfo({ title: 'Blend Preview', duration: this.currentBlend.duration, accessCount: 0, blendCount: 0, evolutionStage: 'Preview' });

            source.onended = () => {
                this.currentSource = null;
                this.updateCurrentTrackInfo(null);
            };

            this.startVisualization();
        }
    }

    saveBlend() {
        if (!this.currentBlend) return;

        const blendResonance = {
            id: Date.now() + Math.random(),
            title: `Blend ${new Date().toLocaleDateString()}`,
            audioBuffer: this.currentBlend,
            duration: this.currentBlend.duration,
            accessCount: 0,
            blendCount: this.selectedSources.length,
            evolutionStage: 'Blended',
            createdAt: new Date().toISOString(),
            waveform: this.generateWaveformData(this.currentBlend),
            tags: ['algorithmic-blend'],
            sourceResonances: this.selectedSources.map(r => r.id)
        };

        this.resonances.push(blendResonance);
        this.saveResonancesToStorage();
        this.renderResonanceGrid();

        // Update blend counts for source resonances
        this.selectedSources.forEach(resonance => {
            resonance.blendCount++;
        });
        this.saveResonancesToStorage();

        this.addEvolutionEvent(`Created blend: ${blendResonance.title}`);
        this.selectedSources = [];
        this.renderSourceList();
    }

    updateBlendParameters(e) {
        const param = e.target.id;
        const value = parseFloat(e.target.value);

        switch (param) {
            case 'blend-intensity':
                this.blendIntensity = value;
                document.getElementById('blend-intensity-value').textContent = value.toFixed(1);
                break;
            case 'morph-rate':
                this.morphRate = value;
                document.getElementById('morph-rate-value').textContent = value.toFixed(1);
                break;
            case 'echo-depth':
                this.echoDepth = value;
                document.getElementById('echo-depth-value').textContent = value.toFixed(1);
                break;
        }

        if (this.currentBlend) {
            this.createBlend();
        }
    }

    renderResonanceGrid() {
        const grid = document.getElementById('resonance-grid');
        grid.innerHTML = '';

        const filteredResonances = this.getFilteredResonances();

        filteredResonances.forEach(resonance => {
            const item = document.createElement('div');
            item.className = 'resonance-item';
            item.innerHTML = `
                <div class="resonance-waveform"></div>
                <div class="resonance-info">
                    <h3>${resonance.title}</h3>
                    <div class="resonance-meta">
                        ${this.formatDuration(resonance.duration)} • ${resonance.evolutionStage}
                    </div>
                    <div class="resonance-stats">
                        <span>🔊 ${resonance.accessCount}</span>
                        <span>🔗 ${resonance.blendCount}</span>
                    </div>
                </div>
                <button class="resonance-play-btn" data-id="${resonance.id}">▶️</button>
            `;

            // Draw waveform
            const waveformEl = item.querySelector('.resonance-waveform');
            this.drawWaveform(waveformEl, resonance.waveform);

            // Add click handlers
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('resonance-play-btn')) {
                    this.playResonance(resonance);
                }
            });

            item.querySelector('.resonance-play-btn').addEventListener('click', () => {
                this.playResonance(resonance);
            });

            grid.appendChild(item);
        });
    }

    drawWaveform(element, waveformData) {
        const canvas = document.createElement('canvas');
        canvas.width = element.clientWidth;
        canvas.height = element.clientHeight;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(255, 107, 107, 0.3)';
        ctx.strokeStyle = 'rgba(255, 107, 107, 0.8)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        const sliceWidth = canvas.width / waveformData.length;
        let x = 0;

        for (let i = 0; i < waveformData.length; i++) {
            const v = waveformData[i];
            const y = (v * canvas.height) / 2;

            if (i === 0) {
                ctx.moveTo(x, canvas.height / 2 - y);
            } else {
                ctx.lineTo(x, canvas.height / 2 - y);
            }

            x += sliceWidth;
        }

        ctx.stroke();
        element.appendChild(canvas);
    }

    getFilteredResonances() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const sortBy = document.getElementById('sort-select').value;

        let filtered = this.resonances.filter(resonance =>
            resonance.title.toLowerCase().includes(searchTerm) ||
            resonance.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );

        // Sort
        switch (sortBy) {
            case 'recent':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'popular':
                filtered.sort((a, b) => b.accessCount - a.accessCount);
                break;
            case 'blended':
                filtered.sort((a, b) => b.blendCount - a.blendCount);
                break;
            case 'duration':
                filtered.sort((a, b) => b.duration - a.duration);
                break;
        }

        return filtered;
    }

    filterResonances() {
        this.renderResonanceGrid();
    }

    sortResonances() {
        this.renderResonanceGrid();
    }

    startVisualization() {
        if (!this.visualizationRunning) {
            this.visualizationRunning = true;
            this.animateWaveform();
        }
    }

    animateWaveform() {
        if (!this.visualizationRunning) return;

        requestAnimationFrame(() => this.animateWaveform());

        if (this.analyser) {
            const bufferLength = this.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            this.analyser.getByteFrequencyData(dataArray);

            this.drawFrequencyBars(dataArray);
        }
    }

    drawFrequencyBars(dataArray) {
        const canvas = this.waveformCanvas;
        const ctx = this.waveformCtx;
        const width = canvas.width;
        const height = canvas.height;

        ctx.fillStyle = 'rgb(10, 10, 10)';
        ctx.fillRect(0, 0, width, height);

        const barWidth = (width / dataArray.length) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            barHeight = (dataArray[i] / 255) * height;

            const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
            gradient.addColorStop(0, `hsl(${200 + i * 0.5}, 70%, 50%)`);
            gradient.addColorStop(1, `hsl(${220 + i * 0.5}, 70%, 30%)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    handleMasterVolume(e) {
        const volume = parseFloat(e.target.value);
        if (this.masterGain) {
            this.masterGain.gain.value = volume;
        }
    }

    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    saveResonancesToStorage() {
        const resonancesToSave = this.resonances.map(resonance => ({
            ...resonance,
            audioBuffer: null // Can't store AudioBuffer in localStorage
        }));
        localStorage.setItem('resonanceArchive', JSON.stringify(resonancesToSave));
    }

    loadStoredResonances() {
        const stored = localStorage.getItem('resonanceArchive');
        if (stored) {
            const parsed = JSON.parse(stored);
            // Note: AudioBuffers can't be restored from localStorage
            // In a real implementation, you'd need to re-upload or stream the audio
            this.resonances = parsed;
            this.renderResonanceGrid();
        }
    }

    addEvolutionEvent(description) {
        const event = {
            id: Date.now(),
            description: description,
            timestamp: new Date().toISOString()
        };

        this.evolutionHistory.unshift(event);
        this.evolutionHistory = this.evolutionHistory.slice(0, 20); // Keep last 20 events
        this.updateEvolutionTimeline();
    }

    updateEvolutionTimeline() {
        const timeline = document.getElementById('evolution-timeline');
        timeline.innerHTML = '';

        this.evolutionHistory.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = 'timeline-event';
            eventEl.innerHTML = `
                <h4>Evolution Event</h4>
                <p>${event.description}</p>
                <div class="timestamp">${new Date(event.timestamp).toLocaleString()}</div>
            `;
            timeline.appendChild(eventEl);
        });
    }

    updateUI() {
        this.renderResonanceGrid();
        this.updateEvolutionTimeline();
    }
}

// Initialize the Resonance Archive when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ResonanceArchive();
});