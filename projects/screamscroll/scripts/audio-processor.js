/**
 * ScreamScroll - Audio Processor
 * 
 * Handles Web Audio API initialization, microphone stream capture,
 * Real-time frequency analysis, and amplitude mapping for scrolling.
 */

class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.dataArray = null;
        this.isInitialized = false;

        // Audio processing parameters
        this.smoothingConstant = 0.85; // Temporal smoothing for amplitude
        this.minDecibels = -90;
        this.maxDecibels = -10;

        // Sustained audio detection
        this.amplitudeHistory = [];
        this.historyLength = 10; // Number of frames to track for sustained sound
        this.threshold = 0.05; // Minimum amplitude to consider as "sound"

        this.currentAmplitude = 0;
        this.sustainedAmplitude = 0;
    }

    /**
     * Request microphone access and initialize audio context
     */
    async initialize() {
        if (this.isInitialized) return true;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = this.smoothingConstant;

            this.microphone.connect(this.analyser);

            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);

            this.isInitialized = true;
            console.log("AudioProcessor initialized successfully.");
            return true;
        } catch (error) {
            console.error("Error initializing AudioProcessor:", error);
            return false;
        }
    }

    /**
     * Process current audio frame and update amplitude metrics
     */
    update() {
        if (!this.isInitialized || !this.analyser) return { sustained: 0, isWhistling: false };

        this.analyser.getByteFrequencyData(this.dataArray);

        // 1. Calculate general amplitude (RMS)
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i] * this.dataArray[i];
        }
        const rms = Math.sqrt(sum / this.dataArray.length);
        const normalizedAmplitude = rms / 255;
        this.currentAmplitude = normalizedAmplitude;

        // 2. Detection of Whistling (High Frequency Peak)
        // Whistling is typically in the 1kHz - 4kHz range.
        // With fftSize 256, each bin is approx 44100 / 256 = 172Hz (if 44.1k)
        // 1kHz is around bin 6, 4kHz is around bin 23.
        let highFreqSum = 0;
        const whistleStartBin = 15; // Roughly 2.5kHz
        const whistleEndBin = 40;   // Roughly 7kHz
        for (let i = whistleStartBin; i < whistleEndBin; i++) {
            highFreqSum += this.dataArray[i];
        }
        const highFreqAvg = highFreqSum / (whistleEndBin - whistleStartBin);
        const isWhistling = highFreqAvg > 120; // Threshold for whistling

        // 3. Update history for sustained detection
        this.amplitudeHistory.push(normalizedAmplitude);
        if (this.amplitudeHistory.length > this.historyLength) {
            this.amplitudeHistory.shift();
        }

        const sumHistory = this.amplitudeHistory.reduce((a, b) => a + b, 0);
        this.sustainedAmplitude = sumHistory / this.amplitudeHistory.length;

        if (this.sustainedAmplitude < this.threshold) {
            this.sustainedAmplitude = 0;
        }

        return {
            sustained: this.sustainedAmplitude,
            current: this.currentAmplitude,
            isWhistling: isWhistling
        };
    }

    /**
     * Get frequency data for visualizer
     */
    getFrequencyData() {
        if (!this.isInitialized) return null;
        this.analyser.getByteFrequencyData(this.dataArray);
        return this.dataArray;
    }

    /**
     * Set sensitivity / threshold calibration
     * @param {number} value - New threshold value (0.0 to 0.5)
     */
    setThreshold(value) {
        this.threshold = Math.max(0, Math.min(0.5, value));
    }

    /**
     * Resume audio context if suspended (browser behavior)
     */
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
}

// Export as a singleton or factory if needed, but here we'll just expose it to window
window.AudioProcessor = new AudioProcessor();
