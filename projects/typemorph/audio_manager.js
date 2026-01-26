
/**
 * TypeMorph - Audio Manager
 * Manages the shared AudioContext and Global Master Gain.
 */

class AudioManager {
    constructor() {
        this.ctx = null;
        this.isReady = false;
    }

    init() {
        if (this.ctx) return this.ctx;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.isReady = true;
        console.log("Global AudioContext Initialized");

        return this.ctx;
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
}

window.AUDIO_MANAGER = new AudioManager();
