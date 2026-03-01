import { Config } from '../core/Config.js';
import { MathUtils } from '../utils/MathUtils.js';

/**
 * @class OscillatorBank
 * @description A polyphonic-capable synthesizer voice.
 * For BlindPainter, we mostly need a continuous monophonic stream that changes parameters,
 * but having a 'Bank' allows us to layer sounds for richer texture.
 */
export class OscillatorBank {
    /**
     * @param {AudioContext} context 
     * @param {AudioNode} destination 
     */
    constructor(context, destination) {
        this.ctx = context;
        this.output = this.ctx.createGain();
        this.output.connect(destination);
        this.output.gain.value = 0; // Start silent

        // Primary Oscillator
        this.osc = this.ctx.createOscillator();
        this.osc.type = Config.AUDIO.DEFAULT_TYPE;
        this.osc.start();

        // Sub Oscillator (for body)
        this.subOsc = this.ctx.createOscillator();
        this.subOsc.type = 'sine';
        this.subOsc.start();

        // Sub Gain
        this.subGain = this.ctx.createGain();
        this.subGain.gain.value = 0.3;

        // Connect graph
        this.osc.connect(this.output);
        this.subOsc.connect(this.subGain);
        this.subGain.connect(this.output);

        this.isPlaying = false;
    }

    /**
     * @method setFrequency
     * @param {number} freq 
     */
    setFrequency(freq) {
        const time = this.ctx.currentTime;
        // Smooth transition to avoid audible clicking
        this.osc.frequency.setTargetAtTime(freq, time, 0.05);
        this.subOsc.frequency.setTargetAtTime(freq / 2, time, 0.05); // Sub is octave lower
    }

    /**
     * @method setGain
     * @param {number} val 
     */
    setGain(val) {
        const time = this.ctx.currentTime;
        const clamped = MathUtils.clamp(val, Config.AUDIO.MIN_GAIN, Config.AUDIO.MAX_GAIN);
        this.output.gain.setTargetAtTime(clamped, time, 0.02);
    }

    /**
     * @method setTimbre
     * @param {string} type - 'sine', 'square', 'sawtooth', 'triangle'
     */
    setTimbre(type) {
        if (this.osc.type !== type) {
            this.osc.type = type;
        }
    }

    /**
     * @method triggerAttack
     * @description Ramp up volume.
     */
    triggerAttack() {
        const time = this.ctx.currentTime;
        this.output.gain.cancelScheduledValues(time);
        this.output.gain.setTargetAtTime(Config.AUDIO.MAX_GAIN, time, Config.AUDIO.ATTACK_TIME);
        this.isPlaying = true;
    }

    /**
     * @method triggerRelease
     * @description Ramp down volume.
     */
    triggerRelease() {
        const time = this.ctx.currentTime;
        this.output.gain.cancelScheduledValues(time);
        this.output.gain.setTargetAtTime(0, time, Config.AUDIO.RELEASE_TIME);
        this.isPlaying = false;
    }
}
