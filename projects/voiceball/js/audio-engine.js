class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.dataArray = null;
        this.bufferLength = 0;
        this.isActive = false;

        this.currentVolume = 0;
        this.smoothedVolume = 0;
        this.peakVolume = 0;
        this.volumeHistory = [];
        this.historySize = 30;

        this.calibrationData = {
            minVolume: 0,
            maxVolume: 100,
            threshold: 30,
            isCalibrated: false
        };

        this.sensitivity = 1.0;
        this.smoothingFactor = 0.8;
        this.spikeThreshold = 2.5;
        this.lastSpikeTime = 0;
        this.spikeDebounce = 200;

        this.onVolumeChange = null;
        this.onSpike = null;
        this.onError = null;
    }

    async initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: false
                }
            });

            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();

            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.3;
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);

            this.microphone.connect(this.analyser);

            this.isActive = true;
            this.startAnalysis();

            return true;
        } catch (error) {
            console.error('Audio initialization failed:', error);
            if (this.onError) {
                this.onError(error);
            }
            return false;
        }
    }

    startAnalysis() {
        if (!this.isActive) return;

        const analyze = () => {
            if (!this.isActive) return;

            this.analyser.getByteTimeDomainData(this.dataArray);

            let sum = 0;
            for (let i = 0; i < this.bufferLength; i++) {
                const normalized = (this.dataArray[i] - 128) / 128;
                sum += normalized * normalized;
            }

            const rms = Math.sqrt(sum / this.bufferLength);
            this.currentVolume = rms * 100 * this.sensitivity;

            this.smoothedVolume = (this.smoothingFactor * this.smoothedVolume) +
                ((1 - this.smoothingFactor) * this.currentVolume);

            this.volumeHistory.push(this.smoothedVolume);
            if (this.volumeHistory.length > this.historySize) {
                this.volumeHistory.shift();
            }

            if (this.smoothedVolume > this.peakVolume) {
                this.peakVolume = this.smoothedVolume;
            }

            this.detectSpike();

            if (this.onVolumeChange) {
                this.onVolumeChange({
                    current: this.smoothedVolume,
                    peak: this.peakVolume,
                    raw: this.currentVolume,
                    normalized: this.getNormalizedVolume()
                });
            }

            requestAnimationFrame(analyze);
        };

        analyze();
    }

    detectSpike() {
        if (this.volumeHistory.length < 5) return;

        const recent = this.volumeHistory.slice(-5);
        const average = recent.reduce((a, b) => a + b, 0) / recent.length;

        const now = Date.now();
        if (this.currentVolume > average * this.spikeThreshold &&
            now - this.lastSpikeTime > this.spikeDebounce) {

            this.lastSpikeTime = now;

            if (this.onSpike) {
                this.onSpike({
                    intensity: this.currentVolume / average,
                    volume: this.currentVolume
                });
            }
        }
    }

    getNormalizedVolume() {
        if (!this.calibrationData.isCalibrated) {
            return Math.min(this.smoothedVolume / 50, 1);
        }

        const range = this.calibrationData.maxVolume - this.calibrationData.minVolume;
        const normalized = (this.smoothedVolume - this.calibrationData.minVolume) / range;
        return Math.max(0, Math.min(1, normalized));
    }

    getFrequencyData() {
        if (!this.analyser) return null;

        const frequencyData = new Uint8Array(this.bufferLength);
        this.analyser.getByteFrequencyData(frequencyData);
        return frequencyData;
    }

    async calibrate(duration = 3000) {
        return new Promise((resolve) => {
            const samples = [];
            const startTime = Date.now();

            const collectSamples = () => {
                const elapsed = Date.now() - startTime;
                const progress = elapsed / duration;

                if (progress < 1) {
                    samples.push(this.smoothedVolume);
                    requestAnimationFrame(collectSamples);
                } else {
                    samples.sort((a, b) => a - b);

                    const percentile10 = samples[Math.floor(samples.length * 0.1)];
                    const percentile90 = samples[Math.floor(samples.length * 0.9)];

                    this.calibrationData.minVolume = percentile10;
                    this.calibrationData.maxVolume = percentile90;
                    this.calibrationData.threshold = (percentile10 + percentile90) / 2;
                    this.calibrationData.isCalibrated = true;

                    resolve(this.calibrationData);
                }
            };

            collectSamples();
        });
    }

    setSensitivity(value) {
        this.sensitivity = value;
    }

    setSmoothing(value) {
        this.smoothingFactor = Math.max(0, Math.min(1, value));
    }

    setSpikeThreshold(value) {
        this.spikeThreshold = value;
    }

    resetPeak() {
        this.peakVolume = 0;
    }

    stop() {
        this.isActive = false;

        if (this.microphone) {
            this.microphone.disconnect();
        }

        if (this.audioContext) {
            this.audioContext.close();
        }
    }

    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        this.isActive = true;
        this.startAnalysis();
    }

    pause() {
        this.isActive = false;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioEngine;
}
