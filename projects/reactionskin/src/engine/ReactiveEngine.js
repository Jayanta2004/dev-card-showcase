/**
 * Reactive Environment Engine (PRO Edition)
 * 
 * Bridges the physical and digital domains by monitoring the user's
 * microphone input and translating environmental sound into 
 * RD simulation parameters. 
 * 
 * Logic: Volume Analysis -> Normalized Mapping -> Parameter Modulation
 * 
 * @class ReactiveEngine
 */
export class ReactiveEngine {
    /**
     * @param {Simulation} simulation - Target simulation engine
     */
    constructor(simulation) {
        /** @type {Simulation} */
        this.sim = simulation;

        /** @type {AudioContext} */
        this.audioCtx = null;
        /** @type {AnalyserNode} Web Audio FFT analyzer */
        this.analyser = null;
        /** @type {boolean} Flag for monitoring state */
        this.isActive = false;

        // --- Modulation Mapping Constants ---

        /** @type {number} Baseline feed rate to return to in silence */
        this.baseFeed = 0.055;

        /** @type {number} Modulation depth (how much sound affects params) */
        this.sensitivity = 0.012;
    }

    /**
     * Requests microphone permission and initializes the Web Audio 
     * analysis graph. This must be triggered by a user gesture.
     * 
     * @returns {Promise<void>}
     */
    async enable() {
        if (this.isActive) return;

        try {
            // Request system-level mic stream
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.audioCtx.createMediaStreamSource(stream);

            // Create analyzer with small FFT size for rapid responsiveness
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;

            source.connect(this.analyser);

            this.isActive = true;
            console.log('Reactive Engine: Listening to Biosphere');
            this.process();
        } catch (err) {
            console.error('Reactive Engine: Authorization Denied', err);
        }
    }

    /**
     * Animation-frame synchronized audio analysis loop.
     * Extracts amplitude data and updates simulation feed rates.
     * 
     * @private
     */
    process() {
        if (!this.isActive) return;

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);

        // Calculate root-mean-square (approximate) volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = avg / 255;

        // Modulate Feed rate. 
        // Logic: Louder sounds inject more energy into Substance A, 
        // causing patterns to grow or "bloom" in response to loudness.
        this.sim.feed = this.baseFeed + (normalized * this.sensitivity);

        // Recursive loop via rAF
        requestAnimationFrame(() => this.process());
    }

    /**
     * Safely terminates audio monitoring and closes the stream.
     */
    disable() {
        this.isActive = false;
        if (this.audioCtx) {
            this.audioCtx.close();
            this.audioCtx = null;
        }
    }
}
