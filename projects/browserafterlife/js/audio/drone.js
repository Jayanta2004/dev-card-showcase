
export class DroneEngine {
    constructor(synth) {
        this.synth = synth;
        this.active = false;
        this.baseFreq = 55; // A1
        this.nodes = [];
    }

    start() {
        if (this.active) return;
        this.active = true;

        // Create 3 oscs detuned
        const freqs = [this.baseFreq, this.baseFreq * 1.5, this.baseFreq * 2.02];

        freqs.forEach(f => {
            const osc = this.synth.ctx.createOscillator();
            const gain = this.synth.ctx.createGain();

            osc.frequency.value = f;
            osc.type = 'triangle';

            // LFO for volume
            const lfo = this.synth.ctx.createOscillator();
            lfo.frequency.value = 0.1 + Math.random() * 0.2;
            const lfoGain = this.synth.ctx.createGain();
            lfoGain.gain.value = 0.1;

            lfo.connect(lfoGain);
            lfoGain.connect(gain.gain);

            osc.connect(gain);
            gain.connect(this.synth.master);

            osc.start();
            lfo.start();

            this.nodes.push(osc, lfo, gain, lfoGain);
        });
    }

    setIntensity(level) {
        // 0.0 - 1.0
        // Increase pitch or LFO speed based on haunting level
        // For now, simpler implementation:
        if (!this.active) return;
        // logic to modulate frequencies...
    }
}
