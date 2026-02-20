import { Config } from '../core/Config.js';

/**
 * @class Effects
 * @description Audio effects chain.
 * Adds Delay and simple Filter to master output to create space and texture.
 */
export class Effects {
    /**
     * @param {AudioContext} context 
     */
    constructor(context) {
        this.ctx = context;

        // Create Nodes
        this.input = this.ctx.createGain();
        this.output = this.ctx.createGain();

        this.delay = this.ctx.createDelay(1.0);
        this.feedback = this.ctx.createGain();
        this.filter = this.ctx.createBiquadFilter();

        this.compressor = this.ctx.createDynamicsCompressor();

        this._setupGraph();
        this._setDefaults();
    }

    _setupGraph() {
        // Route: Input -> Output (Dry)
        this.input.connect(this.compressor);

        // Route: Input -> Delay -> Filter -> Feedback -> Delay (Wet Loop)
        this.input.connect(this.delay);
        this.delay.connect(this.filter);
        this.filter.connect(this.feedback);
        this.feedback.connect(this.delay);

        // Wet to Output
        this.filter.connect(this.output); // Send effect to output

        // Dry to Output via Compressor
        this.compressor.connect(this.output);
    }

    _setDefaults() {
        this.delay.delayTime.value = Config.AUDIO.DELAY_TIME;
        this.feedback.gain.value = Config.AUDIO.DELAY_FEEDBACK;

        this.filter.type = 'lowpass';
        this.filter.frequency.value = 2000;
        this.filter.Q.value = Config.AUDIO.FILTER_Q;
    }

    /**
     * @method setFilterFreq
     * @param {number} freq 
     */
    setFilterFreq(freq) {
        this.filter.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.1);
    }
}
