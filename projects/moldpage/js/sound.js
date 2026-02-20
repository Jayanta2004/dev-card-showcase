/**
 * MoldPage Audio Module (sound.js)
 * 
 * Uses the Web Audio API to generate procedural, eerie soundscapes and interactive
 * feedback without the need for external assets.
 * 
 * FEATURES:
 * - Procedural "Squelch": Randomly tuned oscillators for click feedback.
 * - Atmospheric Hum: Low-frequency throb that scales with infection level.
 * - Growth Whispers: Occasional high-frequency noise bursts.
 * 
 * @namespace MoldAudio
 */

const MoldAudio = (() => {
    let audioCtx = null;
    let mainGain = null;
    let humOsc = null;
    let humGain = null;

    /**
     * Initializes the Web Audio context after user interaction (browser requirement).
     */
    const init = () => {
        if (audioCtx) return;

        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        mainGain = audioCtx.createGain();
        mainGain.gain.value = 0.5;
        mainGain.connect(audioCtx.destination);

        createAtmosphericHum();
        console.info('[AUDIO] Soundscape initialized.');
    };

    /**
     * Creates a persistent low-frequency throb.
     */
    const createAtmosphericHum = () => {
        humOsc = audioCtx.createOscillator();
        humGain = audioCtx.createGain();

        humOsc.type = 'sine';
        humOsc.frequency.setValueAtTime(40, audioCtx.currentTime); // Low frequency throb

        humGain.gain.setValueAtTime(0.02, audioCtx.currentTime);

        humOsc.connect(humGain);
        humGain.connect(mainGain);

        humOsc.start();

        // Add a LFO (Low Frequency Oscillator) to make the hum "breathe"
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();

        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.2, audioCtx.currentTime); // 5 second cycle
        lfoGain.gain.setValueAtTime(0.01, audioCtx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(humGain.gain);
        lfo.start();
    };

    /**
     * Plays a procedural "squelch" or "spore" sound.
     */
    const playSquelch = () => {
        if (!audioCtx) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = Math.random() > 0.5 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(150 + Math.random() * 300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.2);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(mainGain);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    };

    /**
     * Adjusts hum intensity based on infection level.
     * @param {number} level - 0 to 100
     */
    const setInfectionVolume = (level) => {
        if (!humGain) return;
        const targetGain = 0.02 + (level / 100) * 0.08;
        humGain.gain.exponentialRampToValueAtTime(targetGain, audioCtx.currentTime + 2);
    };

    return {
        init,
        playSquelch,
        setInfectionVolume
    };
})();

window.MoldAudio = MoldAudio;
