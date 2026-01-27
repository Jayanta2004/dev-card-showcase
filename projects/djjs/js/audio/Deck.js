import AudioEngine from './AudioEngine.js';

export default class Deck {
    constructor(id) {
        this.id = id; // 'A' or 'B'
        this.buffer = null;
        this.source = null;
        this.isPlaying = false;

        // Playback State
        this.startTime = 0;
        this.pauseTime = 0;
        this.playbackRate = 1.0;

        // Audio Nodes
        this.gainNode = AudioEngine.context.createGain();
        // Filter Nodes could go here

        // Connect to Master Mix (Will be handled by Mixer class later, but for now connect to engine)
        // ideally: Deck.gain -> Mixer.channelGain -> Master
        // We will expose the gainNode so Mixer can connect it.
    }

    load(buffer) {
        this.buffer = buffer;
        this.stop();
        this.pauseTime = 0;
        console.log(`Deck ${this.id}: Loaded Track`);
    }

    play() {
        if (this.isPlaying || !this.buffer) return;

        this.source = AudioEngine.context.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.loop = false; // We handle looping manually if needed for micro-loops
        this.source.playbackRate.value = this.playbackRate;

        // Connect
        this.source.connect(this.gainNode);

        // Math for offsets
        // If we paused at 5s, we start at 5s.
        // If we are at 0, we start at 0.
        // We need to account for when "now" is.

        this.startTime = AudioEngine.time - this.pauseTime;
        this.source.start(0, this.pauseTime);

        this.isPlaying = true;
        this.source.onended = () => {
            // Handle natural end vs stop
            // this.isPlaying = false; 
        };
    }

    pause() {
        if (!this.isPlaying || !this.source) return;

        this.source.stop();
        this.pauseTime = AudioEngine.time - this.startTime;
        this.isPlaying = false;
        this.source = null;
    }

    cue() {
        this.pause();
        this.pauseTime = 0; // Return to start
    }

    setRate(rate) {
        this.playbackRate = rate;
        if (this.source) {
            this.source.playbackRate.setValueAtTime(rate, AudioEngine.time);
        }
    }

    get currentTime() {
        if (this.isPlaying) {
            return (AudioEngine.time - this.startTime) * this.playbackRate; // Approximation
        }
        return this.pauseTime;
    }

    get duration() {
        return this.buffer ? this.buffer.duration : 0;
    }
}
