
export class SpectralSynth {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ctx.createGain();
        this.master.connect(this.ctx.destination);
        this.master.gain.value = 0.3; // Safety volume

        this.oscillators = [];
        this.LFOs = [];

        this.reverb = this.createReverb();
        this.master.connect(this.reverb); // Also connect direct? No, full wet for ghosts? Mix.
        this.reverb.connect(this.ctx.destination);

        this.started = false;
    }

    async init() {
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
        this.started = true;
    }

    createReverb() {
        // Procedural Impulse Response for "Cathedral" sound
        const length = 3; // seconds
        const decay = 2; // seconds
        const rate = this.ctx.sampleRate;
        const lengthFrames = rate * length;
        const impulse = this.ctx.createBuffer(2, lengthFrames, rate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < lengthFrames; i++) {
            const n = i / lengthFrames;
            // Pink noise ish
            left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
            right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
        }

        const convolver = this.ctx.createConvolver();
        convolver.buffer = impulse;

        const gain = this.ctx.createGain();
        gain.gain.value = 0.5;
        convolver.connect(gain);

        return gain; // Return the chain end (Convolver -> Gain)
    }

    playTone(freq, duration, type = 'sine') {
        if (!this.started) return;

        const osc = this.ctx.createOscillator();
        const env = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        // Envelope: Attack, Decay
        env.gain.setValueAtTime(0, this.ctx.currentTime);
        env.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.1);
        env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(env);
        env.connect(this.master);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    // Detailed Noise Generator
    playStatic(duration) {
        if (!this.started) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;

        const gain = this.ctx.createGain();
        gain.gain.value = 0.05;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.master);

        noise.start();
    }
}
