import { globalAudioContext } from './AudioContextManager.js';
import { OscillatorBank } from './OscillatorBank.js';
import { Effects } from './Effects.js';
import { Config } from '../core/Config.js';
import { MathUtils } from '../utils/MathUtils.js';
import { Logger } from '../utils/Logger.js';

/**
 * @class SoundEngine
 * @description Main controller for the auditory experience.
 * Listens to EventManager and manipulating OscillatorBank and Effects.
 */
export class SoundEngine {
    constructor(eventManager) {
        this.events = eventManager;
        this.context = null;
        this.synth = null;
        this.effects = null;

        // State
        this.baseFreq = Config.AUDIO.ROOT_FREQ;
        this.isColliding = false;

        this._initEvents();
    }

    async init() {
        // Wait for user gesture typically, but we prepare the graph
        this.context = globalAudioContext.getContext();

        // Create Effects Chain: Synth -> Effects -> Destination
        this.effects = new Effects(this.context);
        this.effects.output.connect(this.context.destination);

        // Create Synth
        this.synth = new OscillatorBank(this.context, this.effects.input);

        Logger.info('SoundEngine Initialized');
        return true;
    }

    _initEvents() {
        this.events.on('INPUT_START', () => {
            // We don't trigger attack immediately on click, maybe wait for movement logic
            // But usually a touch 'starts' the possibility of sound
            this.synth?.setGain(0.1); // Low hum on touch
        });

        this.events.on('INPUT_MOVE', (data) => {
            this._processMovement(data);
        });

        this.events.on('INPUT_END', () => {
            if (this.synth) {
                this.synth.triggerRelease();
            }
        });

        this.events.on('COLLISION_DETECTED', () => {
            if (!this.isColliding) {
                this.isColliding = true;
                this._onCollisionStart();
            }
        });

        this.events.on('COLLISION_CLEARED', () => {
            if (this.isColliding) {
                this.isColliding = false;
                this._onCollisionEnd();
            }
        });
    }

    _processMovement(data) {
        if (!this.synth) return;

        const { speed } = data;

        // Map Speed to Frequency
        // Faster = Higher Pitch
        const targetFreq = MathUtils.map(
            speed,
            Config.INPUT.MIN_SPEED,
            Config.INPUT.MAX_SPEED,
            this.baseFreq,
            Config.AUDIO.MAX_FREQ
        );

        // Map Speed to Volume (Dynamics)
        // Faster = Louder
        const targetGain = MathUtils.map(
            speed,
            Config.INPUT.MIN_SPEED,
            Config.INPUT.MAX_SPEED,
            0.1, // Minimum audible while moving
            Config.AUDIO.MAX_GAIN
        );

        this.synth.setFrequency(targetFreq);
        this.synth.setGain(targetGain);
    }

    _onCollisionStart() {
        // Change Timbre when crossing lines (like scratching texture)
        if (this.synth) {
            this.synth.setTimbre(Config.AUDIO.CROSS_TIMBRE_TYPE);
            this.baseFreq = Config.AUDIO.ROOT_FREQ * 1.5; // Bump base freq for tension
        }
    }

    _onCollisionEnd() {
        // Revert Timbre
        if (this.synth) {
            this.synth.setTimbre(Config.AUDIO.DEFAULT_TYPE);
            this.baseFreq = Config.AUDIO.ROOT_FREQ;
        }
    }
}
