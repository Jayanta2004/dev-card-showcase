/**
 * AudioEngine - Handles Morse code sound synthesis using Web Audio API
 */
export class AudioEngine {
    constructor() {
        this.ctx = null;
        this.oscillator = null;
        this.gainNode = null;
        this.analyser = null;
        this.frequency = 600;
        this.isStarted = false;
        this.waveform = 'sine';
        this.masterVolume = 0.5;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.ctx.createGain();
            this.analyser = this.ctx.createAnalyser();
            this.analyser.fftSize = 256;

            this.gainNode.connect(this.analyser);
            this.analyser.connect(this.ctx.destination);
            this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        }

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setWaveform(type) {
        this.waveform = type;
    }

    start() {
        this.init();
        this.stop();

        this.oscillator = this.ctx.createOscillator();
        this.oscillator.type = this.waveform;
        this.oscillator.frequency.setValueAtTime(this.frequency, this.ctx.currentTime);
        this.oscillator.connect(this.gainNode);

        const now = this.ctx.currentTime;
        this.gainNode.gain.cancelScheduledValues(now);
        this.gainNode.gain.setValueAtTime(0, now);
        this.gainNode.gain.linearRampToValueAtTime(this.masterVolume, now + 0.005);

        this.oscillator.start();
        this.isStarted = true;
    }

    /**
     * Stop playing the Morse beep
     */
    stop() {
        if (this.oscillator && this.isStarted) {
            const now = this.ctx.currentTime;
            this.gainNode.gain.cancelScheduledValues(now);
            this.gainNode.gain.linearRampToValueAtTime(0, now + 0.005);

            // Wait for ramp-down before stopping oscillator
            const osc = this.oscillator;
            setTimeout(() => {
                try { osc.stop(); } catch (e) { }
            }, 10);

            this.isStarted = false;
        }
    }
}
