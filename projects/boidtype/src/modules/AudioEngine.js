/**
 * AudioEngine - Integrates Web Audio API to provide frequency analysis 
 * for the simulation. This allows boids to react to sound intensity
 * and specific frequency bands.
 * 
 * @class AudioEngine
 */
export class AudioEngine {
    /**
     * Initializes the audio context and analyzer.
     */
    constructor() {
        /** @type {AudioContext|null} Global audio environment */
        this.ctx = null;

        /** @type {AnalyserNode|null} FFT analyzer node */
        this.analyser = null;

        /** @type {Uint8Array} Frequency data buffer */
        this.dataArray = null;

        /** @type {boolean} Flag for user-initiated activation */
        this.initialized = false;

        /** @type {number} Current overall volume (0.0 to 1.0) */
        this.volume = 0;
    }

    /**
     * Resumes or starts the audio context. 
     * Must be called in response to a user gesture.
     */
    async init() {
        if (this.initialized) return;

        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.ctx.createAnalyser();
            this.analyser.fftSize = 256;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = this.ctx.createMediaStreamSource(stream);
            source.connect(this.analyser);

            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            this.initialized = true;
            console.log("AudioEngine: Sound analysis active.");
        } catch (err) {
            console.warn("AudioEngine: Microphone access denied or unavailable.", err);
        }
    }

    /**
     * Updates the frequency data and volume levels for the current frame.
     */
    update() {
        if (!this.initialized || !this.analyser) return;

        this.analyser.getByteFrequencyData(this.dataArray);

        // Calculate average volume
        let total = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            total += this.dataArray[i];
        }
        this.volume = total / (this.dataArray.length * 255);
    }

    /**
     * Retrieves the intensity of a specific frequency range.
     * @param {number} start - Start percentage of frequency spectrum (0-1).
     * @param {number} end - End percentage of frequency spectrum (0-1).
     * @returns {number} Average intensity for the band (0-1).
     */
    getFrequencyBand(start, end) {
        if (!this.initialized || !this.dataArray) return 0;

        const startIdx = Math.floor(start * this.dataArray.length);
        const endIdx = Math.floor(end * this.dataArray.length);

        let subtotal = 0;
        let count = 0;
        for (let i = startIdx; i <= endIdx; i++) {
            subtotal += this.dataArray[i];
            count++;
        }

        return count > 0 ? subtotal / (count * 255) : 0;
    }

    /**
     * Gets the intensity of "bass" frequencies.
     * @returns {number} Bass intensity (0-1).
     */
    getBass() {
        return this.getFrequencyBand(0, 0.1);
    }

    /**
     * Gets the intensity of "mid" frequencies.
     * @returns {number} Mid intensity (0-1).
     */
    getMid() {
        return this.getFrequencyBand(0.2, 0.5);
    }

    /**
     * Gets the intensity of "high" frequencies.
     * @returns {number} High intensity (0-1).
     */
    getTreble() {
        return this.getFrequencyBand(0.6, 0.9);
    }
}
