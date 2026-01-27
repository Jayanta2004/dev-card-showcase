import AudioEngine from '../audio/AudioEngine.js';

export class Visualizer {
    constructor() {
        this.fpsElement = document.getElementById('fps-counter');
        this.lastTime = 0;
        this.frameCount = 0;

        this.dataArray = new Uint8Array(AudioEngine.analyser.frequencyBinCount);

        this.callbacks = []; // Hooks for other UI components to update on RAF

        this.start();
    }

    addCallback(fn) {
        this.callbacks.push(fn);
    }

    start() {
        const loop = (time) => {
            // FPS
            const delta = time - this.lastTime;
            if (delta >= 1000) {
                this.fpsElement.innerText = `${this.frameCount} FPS`;
                this.frameCount = 0;
                this.lastTime = time;
            }
            this.frameCount++;

            // Audio Data
            if (AudioEngine.analyser) {
                AudioEngine.analyser.getByteFrequencyData(this.dataArray);
                this.reactToAudio();
            }

            // Run Callbacks
            this.callbacks.forEach(fn => fn(time, this.dataArray));

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    reactToAudio() {
        // Simple bass kick detection
        const bass = this.dataArray.slice(0, 5);
        const avgBass = bass.reduce((a, b) => a + b, 0) / bass.length;

        // Glitch effect on body or buttons based on bass
        if (avgBass > 200) {
            document.body.style.boxShadow = `inset 0 0 ${avgBass / 5}px rgba(0,255,136, 0.1)`;
        } else {
            document.body.style.boxShadow = 'none';
        }
    }
}

export default new Visualizer();
