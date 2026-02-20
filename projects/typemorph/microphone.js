
/**
 * TypeMorph - Microphone Input
 * Analyzes audio volume level to drive animation.
 */

class Microphone {
    constructor() {
        this.active = false;
        this.stream = null;
        this.analyzer = null;
        this.source = null;
        this.dataArray = null;
        this.volume = 0; // 0.0 to 1.0 smoothed
    }

    async toggle() {
        if (this.active) {
            this.stop();
        } else {
            await this.start();
        }
    }

    async start() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Use shared context
            const ctx = window.AUDIO_MANAGER.init();

            // Ensure it's running (in case mic was clicked first)
            window.AUDIO_MANAGER.resume();

            this.analyzer = ctx.createAnalyser();
            this.analyzer.fftSize = 256;
            this.source = ctx.createMediaStreamSource(this.stream);
            this.source.connect(this.analyzer);

            this.dataArray = new Uint8Array(this.analyzer.frequencyBinCount);

            this.active = true;
            console.log('Microphone Active');

        } catch (err) {
            console.error('Mic access denied:', err);
            alert('Could not access microphone. Please allow permissions.');
        }
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        this.active = false;
        this.volume = 0;
        console.log('Microphone Stopped');
    }

    update() {
        if (!this.active || !this.analyzer) return;

        this.analyzer.getByteFrequencyData(this.dataArray);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        const avg = sum / this.dataArray.length;

        // Normalize 0-255 -> 0-1
        // Smooth it
        const targetVol = avg / 128; // boost a bit
        this.volume += (targetVol - this.volume) * 0.1;
    }
}

window.MICROPHONE = new Microphone();
