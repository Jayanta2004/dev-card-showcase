export class AudioController {
    constructor() {
        this.ctx = null;
        this.analyser = null;
        this.source = null;
        this.isInitialized = false;

        // Configuration
        this.fftSize = 2048;
        this.smoothingTimeConstant = 0.8;
        this.sensitivity = 1.0;

        // Placeholders for analysis data
        this.dataArray = null;
        this.bufferLength = 0;
    }

    async init() {
        if (this.isInitialized) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = this.fftSize;
        this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;

        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        this.isInitialized = true;

        // Default to microphone on start if possible, but usually triggered by user action
        return this.ctx.resume();
    }

    async useMicrophone() {
        if (!this.isInitialized) await this.init();
        if (this.source) this.source.disconnect();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            this.source = this.ctx.createMediaStreamSource(stream);
            this.source.connect(this.analyser);
        } catch (err) {
            console.error('Microphone access denied:', err);
            alert('Microphone access required for this mode.');
        }
    }

    async useFile(file) {
        if (!this.isInitialized) await this.init();
        if (this.source) {
            this.source.disconnect();
            if (this.source.stop) this.source.stop(); // Stop previous file playback
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);

            // Create buffer source for playback
            this.source = this.ctx.createBufferSource();
            this.source.buffer = audioBuffer;
            this.source.loop = true; // Loop for continuous visual

            // Connect to analyser AND speakers (destination) so we can hear it
            this.source.connect(this.analyser);
            this.analyser.connect(this.ctx.destination);

            this.source.start(0);
        };
        reader.readAsArrayBuffer(file);
    }

    updateSettings(smoothing, gain) {
        if (this.analyser) {
            this.analyser.smoothingTimeConstant = smoothing;
        }
        // Note: Gain node implementation omitted for simplicity, can be added if requested
    }

    getAnalysis() {
        if (!this.isInitialized) return { bass: 0, mid: 0, treble: 0, raw: [] };

        this.analyser.getByteFrequencyData(this.dataArray);

        // Calculate Average Frequency Bands
        // FFT Size 2048 -> 1024 bins
        // 44.1kHz sample rate -> Max freq ~22kHz
        // Bins are roughly 21.5Hz wide

        const bassEnd = Math.floor(this.bufferLength * 0.05); // ~0-1kHz
        const midEnd = Math.floor(this.bufferLength * 0.25);  // ~1-5kHz
        // Rest is treble

        let bassSum = 0;
        let midSum = 0;
        let trebleSum = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            const val = this.dataArray[i];
            if (i < bassEnd) bassSum += val;
            else if (i < midEnd) midSum += val;
            else trebleSum += val;
        }

        const bassAvg = (bassSum / bassEnd) * this.sensitivity;
        const midAvg = (midSum / (midEnd - bassEnd)) * this.sensitivity;
        const trebleAvg = (trebleSum / (this.bufferLength - midEnd)) * this.sensitivity;

        return {
            bass: Math.min(bassAvg, 255) || 0,     // 0-255
            mid: Math.min(midAvg, 255) || 0,       // 0-255
            treble: Math.min(trebleAvg, 255) || 0, // 0-255
            raw: this.dataArray     // Full array for waveform/particles
        };
    }

    setSensitivity(val) {
        this.sensitivity = val;
    }
}
