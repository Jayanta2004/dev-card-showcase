window.AudioSys = class AudioSys {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.ctx.destination);
    }

    playTone(freq, type, duration, slide = 0) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if (slide) {
            osc.frequency.exponentialRampToValueAtTime(freq + slide, this.ctx.currentTime + duration);
        }

        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playMove() { this.playTone(200, 'sine', 0.1, -50); }
    playBump() { this.playTone(100, 'sawtooth', 0.1, -20); }
    playKey() {
        this.playTone(600, 'sine', 0.1);
        setTimeout(() => this.playTone(900, 'sine', 0.2), 100);
    }
    playDoor() { this.playTone(150, 'square', 0.3, 100); }
    playTeleport() {
        this.playTone(800, 'sine', 0.1, -200);
        setTimeout(() => this.playTone(800, 'sine', 0.1, 200), 100);
    }
    playSlide() { this.playTone(300, 'triangle', 0.1, -50); }
    playWin() {
        [440, 554, 659, 880].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'triangle', 0.3), i * 100);
        });
    }
    playDie() {
        this.playTone(200, 'sawtooth', 0.4, -150);
        setTimeout(() => this.playTone(150, 'sawtooth', 0.4, -100), 200);
    }
};
