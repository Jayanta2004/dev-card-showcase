/**
 * @file audio.js
 * @description Advanced Web Audio synthesis engine for CollisionSynth.
 * Converts physical collisions into harmonically rich rhythmic sounds.
 */

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.limiter = null;

        // Effects nodes
        this.reverbNode = null;
        this.delayNode = null;
        this.delayFeedback = null;

        this.initialized = false;

        // Configuration
        this.scale = Utils.SCALES.pentatonic;
        this.baseMidi = 36; // C2

        this.activeVoices = new Set();
        this.maxVoices = 16;
    }

    async init() {
        if (this.initialized) return;

        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        // Master Chain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.5;

        this.limiter = this.ctx.createDynamicsCompressor();
        this.limiter.threshold.setValueAtTime(-3, this.ctx.currentTime);
        this.limiter.knee.setValueAtTime(40, this.ctx.currentTime);
        this.limiter.ratio.setValueAtTime(12, this.ctx.currentTime);
        this.limiter.attack.setValueAtTime(0, this.ctx.currentTime);
        this.limiter.release.setValueAtTime(0.25, this.ctx.currentTime);

        // Setup Effects
        await this.setupEffects();

        // Connect Chain: Master -> Limiter -> Destination
        this.masterGain.connect(this.limiter);
        this.limiter.connect(this.ctx.destination);

        this.initialized = true;
        console.log("Audio Engine Initialized");
    }

    async setupEffects() {
        // 1. Reverb (Algorithmic approximation using Convolver)
        this.reverbNode = this.ctx.createConvolver();
        this.reverbNode.buffer = this.generateImpulseResponse(2.5, 2.0);

        this.reverbWet = this.ctx.createGain();
        this.reverbWet.gain.value = 0.4;

        // 2. Delay
        this.delayNode = this.ctx.createDelay(1.0);
        this.delayNode.delayTime.value = 0.375; // Dotted eighth at ~120bpm

        this.delayFeedback = this.ctx.createGain();
        this.delayFeedback.gain.value = 0.3;

        this.delayFilter = this.ctx.createBiquadFilter();
        this.delayFilter.type = 'lowpass';
        this.delayFilter.frequency.value = 1500;

        // Connect Delay Loop
        this.delayNode.connect(this.delayFeedback);
        this.delayFeedback.connect(this.delayFilter);
        this.delayFilter.connect(this.delayNode);

        // Connect Main to Effects
        this.masterGain.connect(this.reverbNode);
        this.reverbNode.connect(this.reverbWet);
        this.reverbWet.connect(this.limiter);

        this.masterGain.connect(this.delayNode);
        this.delayNode.connect(this.limiter);
    }

    generateImpulseResponse(duration, decay) {
        const sampleRate = this.ctx.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.ctx.createBuffer(2, length, sampleRate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const n = length - i;
            const envelope = Math.pow(n / length, decay);
            left[i] = (Math.random() * 2 - 1) * envelope;
            right[i] = (Math.random() * 2 - 1) * envelope;
        }
        return impulse;
    }

    trigger(ball, wall, normal) {
        if (!this.initialized) return;
        if (this.activeVoices.size >= this.maxVoices) return;

        const now = this.ctx.currentTime;

        // Determine Pitch based on Wall Geometry
        // Vertical walls (y1 != y2) map to scale degree
        // Horizontal walls (x1 != x2) map to velocity
        const wallLength = wall.length;
        const wallCenter = wall.center;

        // Normalize wall center to a scale index
        const screenWidth = window.innerWidth; // Approximate or pass from main
        const screenHeight = window.innerHeight;

        const normPos = (wallCenter.x / screenWidth + wallCenter.y / screenHeight) / 2;
        const scaleIdx = Math.floor(normPos * this.scale.length * 3) % (this.scale.length * 2);

        const octave = Math.floor(scaleIdx / this.scale.length);
        const note = this.scale[scaleIdx % this.scale.length];
        const freq = Utils.midiToFreq(this.baseMidi + (octave * 12) + note);

        // Velocity based on ball speed
        const velocity = Utils.clamp(ball.vel.mag() / 15, 0.1, 1.0);

        this.playTone(freq, velocity, wallLength);
    }

    playTone(freq, velocity, length) {
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const sub = this.ctx.createOscillator();
        const fmOsc = this.ctx.createOscillator();
        const fmGain = this.ctx.createGain();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();

        // Voice management
        const voiceId = Symbol();
        this.activeVoices.add(voiceId);

        // Osc 1: Primary
        osc.type = Math.random() > 0.5 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // FM Modulation
        fmOsc.type = 'sine';
        fmOsc.frequency.setValueAtTime(freq * 1.5, now);
        fmGain.gain.setValueAtTime(velocity * 500, now);
        fmGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        // LFO for Filter or Pan
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(Utils.random(2, 8), now);
        lfoGain.gain.setValueAtTime(1000, now);

        // Osc 2: Sub
        sub.type = 'sine';
        sub.frequency.setValueAtTime(freq / 2, now);

        // Filter: Mapping wall length to brightness
        filter.type = 'lowpass';
        const cutoff = Utils.map(length, 100, 1000, 500, 8000);
        filter.frequency.setValueAtTime(cutoff, now);
        filter.Q.setValueAtTime(5, now);

        // Envelope
        const attack = 0.005;
        const decay = Utils.map(velocity, 0.1, 1, 0.1, 1.2);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(velocity * 0.4, now + attack);
        gain.gain.exponentialRampToValueAtTime(0.001, now + attack + decay);

        // Connections
        fmOsc.connect(fmGain);
        fmGain.connect(osc.frequency);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        osc.connect(filter);
        sub.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        // Start & Cleanup
        osc.start(now);
        sub.start(now);
        fmOsc.start(now);
        lfo.start(now);

        const totalDuration = attack + decay;
        osc.stop(now + totalDuration);
        sub.stop(now + totalDuration);
        fmOsc.stop(now + totalDuration);
        lfo.stop(now + totalDuration);

        setTimeout(() => {
            osc.disconnect();
            sub.disconnect();
            fmOsc.disconnect();
            fmGain.disconnect();
            lfo.disconnect();
            lfoGain.disconnect();
            gain.disconnect();
            filter.disconnect();
            this.activeVoices.delete(voiceId);
        }, (totalDuration + 0.5) * 1000);
    }

    setReverb(val) {
        if (!this.initialized) return;
        this.reverbWet.gain.setTargetAtTime(val * 0.8, this.ctx.currentTime, 0.1);
    }

    setScale(scaleName) {
        if (Utils.SCALES[scaleName]) {
            this.scale = Utils.SCALES[scaleName];
        }
    }
}
