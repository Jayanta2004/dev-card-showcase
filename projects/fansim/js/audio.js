/**
 * FanSim | Audio Engine
 * ---------------------------------------------------------
 * Uses the Web Audio API to generate procedural white noise
 * that simulates the hum and air turbulence of a fan.
 * ---------------------------------------------------------
 */

class FanAudio {
    constructor() {
        this.ctx = null;
        this.noiseNode = null;
        this.filter = null;
        this.gainNode = null;

        // Motor Hum Layers
        this.oscillator = null;
        this.oscGain = null;

        this.isInitialized = false;
        this.baseFrequency = 400;
        this.targetVolume = 0;
        this.currentVolume = 0;
    }

    /**
     * Initialize Audio Context on user interaction
     */
    async init() {
        if (this.isInitialized) return;

        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();

            // 1. Air Turbulence (White Noise)
            const bufferSize = 2 * this.ctx.sampleRate;
            const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            this.noiseNode = this.ctx.createBufferSource();
            this.noiseNode.buffer = noiseBuffer;
            this.noiseNode.loop = true;

            this.filter = this.ctx.createBiquadFilter();
            this.filter.type = 'lowpass';
            this.filter.frequency.value = this.baseFrequency;

            this.gainNode = this.ctx.createGain();
            this.gainNode.gain.value = 0;

            // 2. Motor Hum (Oscillator)
            this.oscillator = this.ctx.createOscillator();
            this.oscillator.type = 'triangle'; // Smoother than sawtooth
            this.oscillator.frequency.value = 60; // Base hum

            this.oscGain = this.ctx.createGain();
            this.oscGain.gain.value = 0;

            // Connections
            this.noiseNode.connect(this.filter);
            this.filter.connect(this.gainNode);
            this.gainNode.connect(this.ctx.destination);

            this.oscillator.connect(this.oscGain);
            this.oscGain.connect(this.ctx.destination);

            this.noiseNode.start();
            this.oscillator.start();
            this.isInitialized = true;

            console.log("[Audio] Multi-layer engine active.");
            document.getElementById('audio-status').querySelector('.val').textContent = 'Audio: Active';
        } catch (e) {
            console.error("[Audio] Failed to initialize:", e);
        }
    }

    /**
     * Sync audio parameters with current rotational velocity
     * Called every frame by the FanVisuals loop
     * @param {number} velocity - 0.0 to 1.0
     */
    syncWithVelocity(velocity) {
        if (!this.isInitialized) return;

        const now = this.ctx.currentTime;

        // 1. Modulate Air Volume & Pitch
        // Turbulence gets deeper and louder as speed increases
        const turbulenceVol = velocity * 0.4;
        const turbulenceFreq = 100 + (velocity * 800);

        this.gainNode.gain.setTargetAtTime(turbulenceVol, now, 0.1);
        this.filter.frequency.setTargetAtTime(turbulenceFreq, now, 0.1);

        // 2. Modulate Motor Hum
        // Motor hum increases in pitch and volume
        const motorVol = velocity * 0.15;
        const motorFreq = 50 + (velocity * 150); // From 50Hz to 200Hz

        this.oscGain.gain.setTargetAtTime(motorVol, now, 0.1);
        this.oscillator.frequency.setTargetAtTime(motorFreq, now, 0.1);
    }

    /**
     * Target based update (legacy/compatibility)
     */
    update(level) {
        // Now handled frame-by-frame via syncWithVelocity
        // which is triggered by the physics engine.
    }

    /**
     * Resume context if suspended
     */
    async resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
    }
}

// Global instance
const audioController = new FanAudio();
