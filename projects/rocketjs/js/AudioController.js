export class AudioController {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.5;

        this.engineOsc = null;
        this.engineGain = null;
        this.initialized = false;
    }

    async init() {
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
        this.initialized = true;
    }

    startEngine() {
        if (!this.initialized) return;
        if (this.engineOsc) return;

        this.engineOsc = this.ctx.createOscillator();
        this.engineGain = this.ctx.createGain();

        // Brown noise approximation or low sine for rumble
        this.engineOsc.type = 'sawtooth';
        this.engineOsc.frequency.value = 50;

        // Lowpass filter to make it rumbly
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 120;

        this.engineOsc.connect(filter);
        filter.connect(this.engineGain);
        this.engineGain.connect(this.masterGain);

        this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.engineGain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 2);

        this.engineOsc.start();
    }

    setEnginePitch(throttle) {
        if (!this.engineOsc) return;
        // Pitch goes up with speed
        const targetFreq = 50 + (throttle * 100);
        this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);

        // Volume jitter for texture
        const jitter = Math.random() * 0.05;
        this.engineGain.gain.setTargetAtTime(0.3 + jitter, this.ctx.currentTime, 0.1);
    }

    stopEngine() {
        if (this.engineOsc) {
            this.engineGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1);
            this.engineOsc.stop(this.ctx.currentTime + 1);
            this.engineOsc = null;
        }
    }

    playExplosion() {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 1);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 1);
    }

    playAlert() {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.setValueAtTime(0, this.ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(800, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
    }
}
