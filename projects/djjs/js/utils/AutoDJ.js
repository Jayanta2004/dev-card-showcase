import AudioEngine from '../audio/AudioEngine.js';
import { lerp, map } from './MathUtils.js';

class AutoDJ {
    constructor() {
        this.active = false;
        this.chaosActive = false;
        this.mixer = null;
        this.decks = null;
        this.effects = null;

        this.lastBeatTime = 0;
        this.beatCount = 0;
        this.xfaderTarget = 0; // -1 to 1
        this.xfaderCurrent = 0;
    }

    init(mixer, decks, effects) {
        this.mixer = mixer;
        this.decks = decks;
        this.effects = effects;

        // Start Loop
        this.update();
    }

    toggleAuto() {
        this.active = !this.active;
        console.log("AutoDJ:", this.active ? "ON" : "OFF");
        return this.active;
    }

    triggerChaos() {
        this.chaosActive = true;
        // Randomize FX
        if (this.effects) {
            const dist = Math.random();
            const delayTime = 0.1 + Math.random() * 0.5;
            const delayFeed = Math.random() * 0.8;

            this.effects.distortion.setAmount(dist);
            this.effects.delay.setTime(delayTime);
            this.effects.delay.setFeedback(delayFeed);
            this.effects.delay.setMix(Math.random() * 0.5);

            // Visual Freakout
            document.body.style.filter = `hue-rotate(${Math.random() * 360}deg) contrast(1.2)`;
        }

        setTimeout(() => {
            this.chaosActive = false;
            // Reset somewhat
            this.effects.distortion.setAmount(0);
            this.effects.delay.setMix(0);
            document.body.style.filter = 'none';
        }, 2000); // 2s chaos
    }

    update() {
        requestAnimationFrame(() => this.update());
        if (!this.active) return;

        const now = AudioEngine.time;

        // Simple Auto-Mix Logic (Ping Pong every 8 seconds)
        const cycle = 8;
        const phase = (now % (cycle * 2)) / cycle; // 0 to 2

        // 0..1 -> Move to B (1)
        // 1..2 -> Move to A (-1)

        let target = 0;
        if (phase < 1) target = 1;      // Moving to B
        else target = -1;               // Moving to A

        // Smooth lerp
        this.xfaderCurrent = lerp(this.xfaderCurrent, target, 0.01);

        if (this.mixer) {
            this.mixer.setCrossfader(this.xfaderCurrent);

            // Sync visual fader?
            const slider = document.getElementById('crossfader');
            if (slider) slider.value = this.xfaderCurrent;
        }

        // Ensure decks are playing
        if (this.decks) {
            if (!this.decks['A'].isPlaying) this.decks['A'].play();
            if (!this.decks['B'].isPlaying) this.decks['B'].play();
        }
    }
}

export default new AutoDJ();
