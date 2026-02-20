
// Basic Formant Frequencies (Vowels)
const FORMANTS = {
    'a': [800, 1200],
    'e': [500, 2300],
    'i': [300, 2500],
    'o': [500, 1000],
    'u': [300, 800]
};

export class VoiceSynth {
    constructor(synth) {
        this.synth = synth;
    }

    whisper(text) {
        // Very abstract "whisper" - filtered noise
        // This won't actually speak English, but simulate speech patterns

        const ctx = this.synth.ctx;
        const t = ctx.currentTime;

        // Noise Source
        const bufferSize = ctx.sampleRate * 2; // 2 sec max
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        // Filters acting as vocal tract
        const f1 = ctx.createBiquadFilter();
        f1.type = 'bandpass';
        f1.Q.value = 5;

        const f2 = ctx.createBiquadFilter();
        f2.type = 'bandpass';
        f2.Q.value = 5;

        // Envelope
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);

        // Syllable simulator
        let offset = 0;
        const syllables = text.length / 3;

        for (let i = 0; i < syllables; i++) {
            const vowel = ['a', 'e', 'i', 'o', 'u'][Math.floor(Math.random() * 5)];
            const form = FORMANTS[vowel];

            f1.frequency.setValueAtTime(form[0], t + offset);
            f2.frequency.setValueAtTime(form[1], t + offset);

            gain.gain.linearRampToValueAtTime(0.05, t + offset + 0.05);
            gain.gain.linearRampToValueAtTime(0, t + offset + 0.15);

            offset += 0.2;
        }

        noise.connect(f1);
        noise.connect(f2);
        f1.connect(gain);
        f2.connect(gain);
        gain.connect(this.synth.master);

        noise.start();
        noise.stop(t + offset + 0.5);
    }
}
