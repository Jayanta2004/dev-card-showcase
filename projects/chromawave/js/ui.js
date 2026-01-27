export class UIController {
    constructor(app) {
        this.app = app;

        // Element Refs
        this.overlay = document.getElementById('start-overlay');
        this.btnStart = document.getElementById('btn-start');

        this.btnMic = document.getElementById('btn-mic');
        this.btnFile = document.getElementById('btn-file');
        this.fileInput = document.getElementById('file-upload');

        this.sliderSensitivity = document.getElementById('sensitivity');
        this.sliderSmoothing = document.getElementById('smoothing');
        this.sliderIntensity = document.getElementById('intensity');
        this.selectTheme = document.getElementById('color-mode');

        // Instruments
        this.btnDrumKick = document.getElementById('btn-drum-kick');
        this.btnDrumSnare = document.getElementById('btn-drum-snare');
        this.btnDrumHat = document.getElementById('btn-drum-hat');

        this.btnPianoC = document.getElementById('btn-piano-c');
        this.btnPianoE = document.getElementById('btn-piano-e');
        this.btnPianoG = document.getElementById('btn-piano-g');

        this.selectJamStyle = document.getElementById('jam-style');
        this.btnAutoPlay = document.getElementById('btn-autoplay');

        this.btnFreeze = document.getElementById('btn-freeze');
        this.btnExport = document.getElementById('btn-export');

        this.debugFps = document.getElementById('debug-fps');
        this.debugFreq = document.getElementById('debug-freq');

        this.lastTime = performance.now();
        this.frameCount = 0;

        this.bindEvents();
        this.bindVisualFeedback();
    }

    bindVisualFeedback() {
        // Listen for auto-play events to light up buttons
        window.addEventListener('instrument-play', (e) => {
            const type = e.detail.instrument;
            let btn = null;
            if (type === 'kick') btn = this.btnDrumKick;
            if (type === 'snare') btn = this.btnDrumSnare;
            if (type === 'hat') btn = this.btnDrumHat;
            if (type === 'piano') {
                // Randomly light up a piano key for effect
                const keys = [this.btnPianoC, this.btnPianoE, this.btnPianoG];
                btn = keys[Math.floor(Math.random() * keys.length)];
            }

            if (btn) {
                btn.classList.add('flash');
                setTimeout(() => btn.classList.remove('flash'), 100);
            }
        });
    }

    bindEvents() {
        // 1. Start Experience (Audio Context Requirement)
        this.btnStart.addEventListener('click', async () => {
            await this.app.startAudioContext();
            this.overlay.classList.add('hidden');

            // Auto start mic
            this.app.audioController.useMicrophone();
        });

        // 2. Audio Source Switching
        this.btnMic.addEventListener('click', () => {
            this.app.audioController.useMicrophone();
            this.setActiveSource('mic');
        });

        this.btnFile.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.app.audioController.useFile(e.target.files[0]);
                this.setActiveSource('file');
            }
        });

        // 3. Audio Settings
        this.sliderSmoothing.addEventListener('input', (e) => {
            const val = e.target.value / 100; // 0-0.95 (checked by max in HTML)
            this.app.audioController.updateSettings(val);
        });

        this.sliderSensitivity.addEventListener('input', (e) => {
            // 0-200 slider -> 0-2.0 multiplier
            const val = e.target.value / 100;
            this.app.audioController.setSensitivity(val);
        });

        // 4. Visual Settings
        this.sliderIntensity.addEventListener('input', (e) => {
            // 0-200 slider -> 0-2.0 multiplier
            const val = e.target.value / 100;
            this.app.visualEngine.setIntensity(val);
        });

        this.selectTheme.addEventListener('change', (e) => {
            this.app.visualEngine.setTheme(e.target.value);
        });

        document.getElementById('kaleidoscope-toggle').addEventListener('change', (e) => {
            this.app.visualEngine.setKaleidoscope(e.target.checked);
        });

        // 5. Instruments
        const playKick = () => {
            this.app.instrumentEngine.playKick();
            this.app.visualEngine.triggerBurst('bass');
        };
        const playSnare = () => {
            this.app.instrumentEngine.playSnare();
            this.app.visualEngine.triggerBurst('mid');
        };
        const playHat = () => {
            this.app.instrumentEngine.playHiHat();
            this.app.visualEngine.triggerBurst('treble');
        };
        const playTone = (freq) => {
            this.app.instrumentEngine.playTone(freq);
            this.app.visualEngine.triggerBurst('mid');
        };

        this.btnDrumKick.addEventListener('mousedown', playKick);
        this.btnDrumSnare.addEventListener('mousedown', playSnare);
        this.btnDrumHat.addEventListener('mousedown', playHat);

        this.btnPianoC.addEventListener('mousedown', () => playTone(261.63));
        this.btnPianoE.addEventListener('mousedown', () => playTone(329.63));
        this.btnPianoG.addEventListener('mousedown', () => playTone(392.00));

        window.addEventListener('keydown', (e) => {
            if (e.key === 'z') playKick();
            if (e.key === 'x') playSnare();
            if (e.key === 'c') playHat();
            if (e.key === 'a') playTone(261.63);
            if (e.key === 's') playTone(329.63);
            if (e.key === 'd') playTone(392.00);
        });

        this.selectJamStyle.addEventListener('change', (e) => {
            this.app.instrumentEngine.setGenre(e.target.value);
        });

        this.btnAutoPlay.addEventListener('click', () => {
            if (this.app.audioController.ctx && this.app.audioController.ctx.state === 'suspended') {
                this.app.audioController.ctx.resume();
            }
            const isPlaying = this.app.instrumentEngine.toggleAutoPlay();
            this.btnAutoPlay.textContent = isPlaying ? "STOP AUTO-JAM" : "START AUTO-JAM";
            this.btnAutoPlay.classList.toggle('active', isPlaying);
        });

        // 6. Actions
        this.btnFreeze.addEventListener('click', () => {
            this.app.isPaused = !this.app.isPaused;
            this.btnFreeze.classList.toggle('active');
            if (!this.app.isPaused) this.app.animate(); // Restart loop
        });

        this.btnExport.addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = 'chromawave-export.png';
            link.href = document.getElementById('chromawave-canvas').toDataURL();
            link.click();
        });
    }

    setActiveSource(type) {
        if (type === 'mic') {
            this.btnMic.classList.add('active');
            this.btnFile.classList.remove('active');
        } else {
            this.btnMic.classList.remove('active');
            this.btnFile.classList.add('active');
        }
    }

    updateStats(audioData) {
        // FPS Counter
        const now = performance.now();
        this.frameCount++;
        if (now - this.lastTime >= 1000) {
            this.debugFps.textContent = `FPS: ${this.frameCount}`;
            this.frameCount = 0;
            this.lastTime = now;
        }

        // Freq Estimate (Dominant Bass)
        const bassVal = audioData.bass.toFixed(0);
        this.debugFreq.textContent = `Bass: ${bassVal}`;
    }
}
