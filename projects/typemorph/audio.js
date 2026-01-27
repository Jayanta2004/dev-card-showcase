
/**
 * TypeMorph - Audio Engine V2
 * Advanced Generative Soundscape.
 * - Nodes: Osc -> Filter -> Delay -> Master
 */

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.filter = null;
        this.delay = null;
        this.osc = null;
        this.lfo = null;
        this.isStarted = false;
        this.volume = 0.15; // Slightly louder master
    }

    start() {
        if (this.isStarted) return;

        // Use global manager
        this.ctx = window.AUDIO_MANAGER.init();

        // --- Signal Chain ---

        // 1. Master Output
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.ctx.destination);

        // 2. Delay (Echo) Effect
        this.delay = this.ctx.createDelay(1.0);
        this.delay.delayTime.value = 0.3; // 300ms echo

        const delayFeedback = this.ctx.createGain();
        delayFeedback.gain.value = 0.4; // 40% feedback

        this.delay.connect(delayFeedback);
        delayFeedback.connect(this.delay);
        this.delay.connect(this.masterGain);

        // 3. Low Pass Filter (Muffles sound)
        this.filter = this.ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.value = 800; // Start slightly muffled
        this.filter.connect(this.masterGain);
        this.filter.connect(this.delay); // Send filtered sound to delay too

        // --- Drone Source ---

        this.osc = this.ctx.createOscillator();
        this.osc.type = 'sine';
        this.osc.frequency.value = 60; // Deep bass drone

        // LFO for modulation
        this.lfo = this.ctx.createOscillator();
        this.lfo.type = 'triangle';
        this.lfo.frequency.value = 0.1; // Very slow breathing

        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 20;

        this.lfo.connect(lfoGain);
        lfoGain.connect(this.osc.frequency);

        this.osc.connect(this.filter);

        // Start
        this.osc.start();
        this.lfo.start();

        this.isStarted = true;
        console.log('Audio Engine V2 Active');
    }

    update(mouseSpeed, proximitySum) {
        if (!this.isStarted) return;

        const time = this.ctx.currentTime;

        // 1. Pitch Modulation using Speed
        // Speed adds brightness and slight pitch rise
        const targetPitch = 60 + (mouseSpeed * 2);
        this.osc.frequency.setTargetAtTime(targetPitch, time, 0.2);

        // 2. Filter Opening using Proximity
        // Close interaction = Brighter sound (Filter opens up)
        // ProximitySum is 0 to N. 
        const targetFreq = 400 + (proximitySum * 2000); // 400Hz -> 2400Hz
        this.filter.frequency.setTargetAtTime(targetFreq, time, 0.1);

        // 3. Volume Swell
        // If moving fast or interacting, swell volume slightly
        const targetVol = this.volume + (mouseSpeed * 0.002);
        this.masterGain.gain.setTargetAtTime(Math.min(0.5, targetVol), time, 0.1);
    }

    triggerPluck() {
        if (!this.isStarted) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.filter); // Route through filter -> delay

        // Pentatonic Scale (C Minor Pentatonic: C, Eb, F, G, Bb)
        const scale = [261.63, 311.13, 349.23, 392.00, 466.16, 523.25];
        const freq = scale[Math.floor(Math.random() * scale.length)];

        osc.frequency.value = freq;
        osc.type = 'triangle';

        // Pluck Envelope
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

        osc.start(t);
        osc.stop(t + 0.6);
    }

    toggleMute(muted) {
        if (this.masterGain) {
            // Smooth mute
            this.masterGain.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, 0.2);
        }
    }

    getVolume() {
        if (!this.analyzer) return 0;
        this.analyzer.getByteFrequencyData(this.dataArray);

        let sum = 0;
        // Skip low frequencies (DC offset)
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        const avg = sum / this.dataArray.length;

        // Return normalized 0-1
        // Since generated audio is quieter than full-blown music, boost it
        return Math.min(1, avg / 50);
    }
}

window.AUDIO = new AudioEngine();
