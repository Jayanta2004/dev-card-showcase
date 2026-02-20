class AudioEngine {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.analyser = null;
    }

    async init() {
        if (this.context) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();

        if (this.context.state === 'suspended') {
            await this.context.resume();
        }

        // Global Compressor (Limiter)
        this.compressor = this.context.createDynamicsCompressor();
        this.compressor.threshold.value = -1; // Prevent clipping
        this.compressor.knee.value = 10;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0.005;
        this.compressor.release.value = 0.25;

        // Master Chain
        this.masterGain = this.context.createGain();

        // Master Analyser (Visuals)
        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = 256;

        // Connections: MasterGain -> Compressor -> Analyser -> Destination
        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.analyser);
        this.analyser.connect(this.context.destination);

        console.log("AudioEngine: Context Created", this.context.state);
    }

    async loadAudio(url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await this.context.decodeAudioData(arrayBuffer);
    }

    get time() {
        return this.context ? this.context.currentTime : 0;
    }
}

// Export singleton
export default new AudioEngine();
