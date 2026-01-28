import AudioEngine from './AudioEngine.js';
import { clamp } from '../utils/MathUtils.js';

class ChannelStrip {
    constructor() {
        // Chain: Input(from Deck) -> EQ Low -> EQ Mid -> EQ High -> Volume -> Output(to Crossfader)
        this.input = AudioEngine.context.createGain();

        this.low = AudioEngine.context.createBiquadFilter();
        this.low.type = 'lowshelf';
        this.low.frequency.value = 320;

        this.mid = AudioEngine.context.createBiquadFilter();
        this.mid.type = 'peaking';
        this.mid.frequency.value = 1000;
        this.mid.Q.value = 0.5;

        this.high = AudioEngine.context.createBiquadFilter();
        this.high.type = 'highshelf';
        this.high.frequency.value = 3200;

        this.fader = AudioEngine.context.createGain();
        this.output = AudioEngine.context.createGain();

        // Connect
        this.input.connect(this.low);
        this.low.connect(this.mid);
        this.mid.connect(this.high);
        this.high.connect(this.fader);
        this.fader.connect(this.output);

        // Init
        this.fader.gain.value = 1;
    }

    setEQ(band, value) {
        // Value -1 to 1 (cut to boost)
        // Map to decibels: -20dB to +6dB
        // -1 -> -20, 0 -> 0, 1 -> 6
        let db = 0;
        if (value > 0) db = value * 6;
        else db = value * 20; // Cut is deeper

        const node = this[band]; // low, mid, high
        if (node) {
            node.gain.setTargetAtTime(db, AudioEngine.time, 0.01);
        }
    }

    setVolume(vol) {
        this.fader.gain.setTargetAtTime(vol, AudioEngine.time, 0.01);
    }
}

class Mixer {
    constructor() {
        this.channelA = new ChannelStrip();
        this.channelB = new ChannelStrip();

        // Crossfader
        // A -> xfaderA -> Master
        // B -> xfaderB -> Master
        this.xfaderA = AudioEngine.context.createGain();
        this.xfaderB = AudioEngine.context.createGain();

        this.channelA.output.connect(this.xfaderA);
        this.channelB.output.connect(this.xfaderB);

        this.output = AudioEngine.context.createGain(); // Mixer Output

        this.xfaderA.connect(this.output);
        this.xfaderB.connect(this.output);

        // Initial Crossfader position (Center)
        this.setCrossfader(0);
    }

    setCrossfader(value, curveType = 'linear') {
        const val = clamp(value, -1, 1);
        // Map -1..1 to 0..1 for internal calculation
        const x = (val + 1) / 2;

        let gainA, gainB;

        if (curveType === 'linear') {
            // Simple linear
            gainA = 1 - x;
            gainB = x;
        } else if (curveType === 'sharp') {
            // DJ Battle curve
            // Cut is rapid at the edges
            // A stays full until center, then cuts
            // B stays full until center, then cuts (flipped)
            // simplified power curve for now
            gainA = Math.cos(x * Math.PI / 2);
            gainB = Math.cos((1 - x) * Math.PI / 2);
        } else {
            // Equal Power (Smooth)
            gainA = Math.cos(x * 0.5 * Math.PI);
            gainB = Math.sin(x * 0.5 * Math.PI);
        }

        this.xfaderA.gain.setTargetAtTime(gainA, AudioEngine.time, 0.01);
        this.xfaderB.gain.setTargetAtTime(gainB, AudioEngine.time, 0.01);
    }
}

export default new Mixer();
