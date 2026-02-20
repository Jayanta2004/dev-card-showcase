import AudioEngine from './AudioEngine.js';

export class Delay {
    constructor() {
        this.input = AudioEngine.context.createGain();
        this.output = AudioEngine.context.createGain();
        this.wet = AudioEngine.context.createGain();
        this.dry = AudioEngine.context.createGain();

        this.delayNode = AudioEngine.context.createDelay(2.0); // Max 2s
        this.feedbackNode = AudioEngine.context.createGain();

        // Routing
        // Input -> Dry -> Output
        // Input -> Delay -> Feedback -> Delay
        // Delay -> Wet -> Output

        this.input.connect(this.dry);
        this.input.connect(this.delayNode);

        this.delayNode.connect(this.feedbackNode);
        this.feedbackNode.connect(this.delayNode); // Loop

        this.delayNode.connect(this.wet);

        this.dry.connect(this.output);
        this.wet.connect(this.output);

        // Defaults
        this.dry.gain.value = 1;
        this.wet.gain.value = 0;
        this.feedbackNode.gain.value = 0.4;
        this.delayNode.delayTime.value = 0.5; // 500ms
    }

    setMix(amount) {
        // Equal power crossfade
        const val = Math.max(0, Math.min(1, amount));
        this.dry.gain.value = Math.cos(val * 0.5 * Math.PI);
        this.wet.gain.value = Math.sin(val * 0.5 * Math.PI);
    }

    setTime(time) {
        this.delayNode.delayTime.setTargetAtTime(time, AudioEngine.time, 0.01);
    }

    setFeedback(amount) {
        this.feedbackNode.gain.setTargetAtTime(amount, AudioEngine.time, 0.01);
    }
}

export class Distortion {
    constructor() {
        this.input = AudioEngine.context.createGain();
        this.output = AudioEngine.context.createGain();
        this.shaper = AudioEngine.context.createWaveShaper();

        this.input.connect(this.shaper);
        this.shaper.connect(this.output);

        this.shaper.curve = this.makeDistortionCurve(0); // Off initially
        this.shaper.oversample = '4x';
    }

    setAmount(amount) {
        // amount 0 to 1
        // heavily affect curve
        const curveAmount = amount * 400; // arbitrary multiplier
        this.shaper.curve = this.makeDistortionCurve(curveAmount);
    }

    makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        let x;
        for (let i = 0; i < n_samples; ++i) {
            x = i * 2 / n_samples - 1;
            // Sigmoidish wave shaper
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }
}
