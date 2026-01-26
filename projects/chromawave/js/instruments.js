import { random } from './utils.js';

export class InstrumentEngine {
    constructor(audioController) {
        this.audioCtrl = audioController;
        this.ctx = null;
        this.masterGain = null;

        // Auto-Play State
        this.isPlaying = false;
        this.tempo = 120;
        this.nextNoteTime = 0;
        this.beatCount = 0;
        this.timerID = null;
        this.currentGenre = 'techno'; // Default style

        // Scales (Pentatonic for pleasant random generation)
        this.scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // C Major Pentatonic
    }

    init() {
        if (!this.audioCtrl.isInitialized) return;
        this.ctx = this.audioCtrl.ctx;

        // Create Master Gain for Instruments
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.5; // Prevent clipping

        // Connect to Main Analyser so visuals react!
        this.masterGain.connect(this.audioCtrl.analyser);
        // Connect to Speakers
        this.masterGain.connect(this.ctx.destination);
    }

    // --- SYNTHESIS ---

    playTone(freq, duration = 0.5, type = 'sine') {
        if (!this.ctx) this.init();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        // Envelope (ADSR-ish)
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.05); // Attack
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration); // Decay

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playKick() {
        if (!this.ctx) this.init();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Pitch Drop for Kick
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

        // Envelope
        gain.gain.setValueAtTime(1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }

    playSnare() {
        if (!this.ctx) this.init();

        // Noise Buffer
        const bufferSize = this.ctx.sampleRate * 0.2; // 0.2 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Filter to shape tone
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;

        // Envelope
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
    }

    playHiHat() {
        if (!this.ctx) this.init();

        // High freq noise
        const bufferSize = this.ctx.sampleRate * 0.05;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 5000;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
    }

    // --- AUTO PLAY & SONGS ---

    setGenre(genre) {
        this.currentGenre = genre;
        this.beatCount = 0; // Reset
    }

    toggleAutoPlay() {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
            // Need to handle scheduling relative to audio time
            this.nextNoteTime = this.ctx.currentTime;
            this.scheduler();
        } else {
            clearTimeout(this.timerID);
        }
        return this.isPlaying;
    }

    scheduler() {
        // Lookahead scheduler
        // While there are notes that will need to play before the next interval, schedule them
        while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
            this.scheduleNote(this.nextNoteTime);
            this.nextBeat();
        }

        if (this.isPlaying) {
            this.timerID = setTimeout(() => this.scheduler(), 25);
        }
    }

    nextBeat() {
        const secondsPerBeat = 60.0 / this.tempo;
        this.nextNoteTime += 0.25 * secondsPerBeat; // 16th notes
        this.beatCount++;
    }

    scheduleNote(time) {
        // Determine Genre Pattern
        const step = this.beatCount % 16;

        // --- TECHNO (Driving, fast) ---
        if (this.currentGenre === 'techno') {
            this.tempo = 135;
            // Kick on every beat
            if (step % 4 === 0) {
                this.playKickAt(time);
                this.dispatchLightEvent('kick');
            }
            // Hat on off-beats
            if (step % 2 !== 0) {
                this.playHiHatAt(time);
                this.dispatchLightEvent('hat');
            }
            // Snare on 5, 13
            if (step === 4 || step === 12) {
                this.playSnareAt(time);
                this.dispatchLightEvent('snare');
            }
            // Random Bass Arp
            if (step % 2 === 0 && Math.random() > 0.4) {
                const note = this.scale[Math.floor(random(0, 3))]; // Low notes
                this.playToneAt(note, time, 0.1);
                this.dispatchLightEvent('piano');
            }
        }

        // --- CHILL (Slow, spacious) ---
        else if (this.currentGenre === 'chill') {
            this.tempo = 90;
            // Kick on 1
            if (step === 0) {
                this.playKickAt(time);
                this.dispatchLightEvent('kick');
            }
            // Snare on 9
            if (step === 8) {
                this.playSnareAt(time);
                this.dispatchLightEvent('snare');
            }
            // Soft Hats
            if (step % 4 === 2) {
                this.playHiHatAt(time);
                this.dispatchLightEvent('hat');
            }
            // Melodic Chords (approximated)
            if (step === 0 || step === 6 || step === 10) {
                if (Math.random() > 0.3) {
                    const note = this.scale[Math.floor(random(2, 6))]; // Mid notes
                    this.playToneAt(note, time, 0.5);
                    this.dispatchLightEvent('piano');
                }
            }
        }

        // --- CHAOS (Random, fast) ---
        else if (this.currentGenre === 'chaos') {
            this.tempo = 160;
            if (Math.random() > 0.7) {
                this.playKickAt(time);
                this.dispatchLightEvent('kick');
            }
            if (Math.random() > 0.6) {
                this.playSnareAt(time);
                this.dispatchLightEvent('snare');
            }
            if (Math.random() > 0.5) {
                this.playHiHatAt(time);
                this.dispatchLightEvent('hat');
            }
            if (Math.random() > 0.6) {
                const note = this.scale[Math.floor(random(0, this.scale.length))];
                this.playToneAt(note, time, 0.1);
                this.dispatchLightEvent('piano');
            }
        }
    }

    dispatchLightEvent(instrument) {
        // Emit custom event so UI can light up buttons
        window.dispatchEvent(new CustomEvent('instrument-play', { detail: { instrument } }));
    }

    // Scheduled versions of play methods
    playKickAt(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + 0.5);
    }

    playSnareAt(time) {
        const bufferSize = this.ctx.sampleRate * 0.2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.8, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(time);
    }

    playHiHatAt(time) {
        const bufferSize = this.ctx.sampleRate * 0.05;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 6000;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(time);
    }

    playToneAt(freq, time, duration = 0.5) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.3, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + duration);
    }
}
