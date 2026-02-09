import { Logger } from '../utils/Logger.js';

/**
 * @class AudioContextManager
 * @description Singleton wrapper for the Web Audio API Context.
 * Browsers auto-suspend AudioContext until a user gesture. This class handles the wake-up call.
 */
export class AudioContextManager {
    constructor() {
        // Initialize with vendor prefixes if necessary (older browsers, though standard is good now)
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
        this.state = this.context.state;

        this._initListeners();
    }

    _initListeners() {
        this.context.onstatechange = () => {
            this.state = this.context.state;
            Logger.info(`AudioContext State Change: ${this.state}`);
        };
    }

    /**
     * @method resume
     * @description Attempts to resume the context. Must be called inside a user gesture handler.
     * @returns {Promise<boolean>} Success state
     */
    async resume() {
        if (this.context.state === 'running') return true;

        try {
            await this.context.resume();
            Logger.info('AudioContext Resumed Successfully');
            return true;
        } catch (error) {
            Logger.error('Failed to resume AudioContext', error);
            return false;
        }
    }

    /**
     * @method getContext
     * @returns {AudioContext}
     */
    getContext() {
        return this.context;
    }

    /**
     * @method now
     * @returns {number} Current audio time
     */
    now() {
        return this.context.currentTime;
    }
}

export const globalAudioContext = new AudioContextManager();
