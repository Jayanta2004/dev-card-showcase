/**
 * ScreamScroll - Audio Echo Soundscape
 * 
 * Generates an ambient hum that responds to user input,
 * creating a feedback loop of sound energy.
 */

class EchoSoundscape {
    constructor() {
        this.audioContext = null;
        this.oscillator = null;
        this.gainNode = null;
        this.filter = null;
        this.isStarted = false;
    }

    init(ctx) {
        this.audioContext = ctx;
        this.oscillator = this.audioContext.createOscillator();
        this.gainNode = this.audioContext.createGain();
        this.filter = this.audioContext.createBiquadFilter();

        this.oscillator.type = 'sine';
        this.oscillator.frequency.setValueAtTime(55, this.audioContext.currentTime); // Low A hum

        this.filter.type = 'lowpass';
        this.filter.frequency.setValueAtTime(200, this.audioContext.currentTime);

        this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);

        this.oscillator.connect(this.filter);
        this.filter.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);

        this.oscillator.start();
        this.isStarted = true;
    }

    update(amplitude) {
        if (!this.isStarted) return;

        // Map amplitude to volume and filter frequency
        const targetGain = amplitude * 0.1; // Subtle ambient feedback
        const targetFreq = 50 + (amplitude * 100);

        this.gainNode.gain.setTargetAtTime(targetGain, this.audioContext.currentTime, 0.1);
        this.oscillator.frequency.setTargetAtTime(targetFreq, this.audioContext.currentTime, 0.1);
    }
}

window.EchoSoundscape = new EchoSoundscape();
