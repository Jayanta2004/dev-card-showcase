import { AudioEngine } from './audio.js';
import { MorseEngine } from './engine.js';
import { InputHandler } from './input.js';
import { UIController } from './ui.js';

class MorseApp {
    constructor() {
        this.audio = new AudioEngine();
        this.engine = new MorseEngine();
        this.ui = new UIController({
            onExport: () => this.handleExport(),
            onOscChange: (type) => this.audio.setWaveform(type),
            onThemeChange: (theme) => document.body.setAttribute('data-theme', theme),
            onVolChange: (val) => this.audio.masterVolume = val,
            onPitchChange: (val) => this.audio.frequency = val,
            onPlayback: (text) => this.handlePlayback(text),
            onTabChange: (tab) => this.currentTab = tab
        });

        this.input = new InputHandler({
            onStart: () => this.handlePressStart(),
            onEnd: (duration) => this.handlePressEnd(duration)
        });

        this.currentBuffer = '';
        this.lastReleaseTime = Date.now();
        this.startTime = Date.now();
        this.isWaitingForChar = false;
        this.isWaitingForWord = false;
        this.visualizerStarted = false;
        this.isPlayingBack = false;

        this.initCheatSheet();
        this.startTick();
    }

    initCheatSheet() {
        this.ui.populateCheatSheet(this.engine.dictionary);
    }

    handlePressStart() {
        if (this.isPlayingBack) return;
        this.audio.init();
        if (!this.visualizerStarted) {
            this.ui.drawVisualizer(this.audio.analyser);
            this.visualizerStarted = true;
        }
        this.audio.start();
        this.ui.setKeyState(true);
        this.isWaitingForChar = false;
        this.isWaitingForWord = false;
    }

    handlePressEnd(duration) {
        if (this.isPlayingBack) return;
        this.audio.stop();
        this.ui.setKeyState(false);
        this.lastReleaseTime = Date.now();

        const symbol = this.engine.getSymbol(duration);
        this.currentBuffer += symbol;
        this.ui.updateBuffer(this.currentBuffer);

        // Feature 2: Paper Tape
        this.ui.addTapeSymbol(symbol === '.' ? 'dot' : 'dash');
    }

    async handlePlayback(text) {
        if (this.isPlayingBack || !text) return;
        this.isPlayingBack = true;
        this.audio.init();
        if (!this.visualizerStarted) {
            this.ui.drawVisualizer(this.audio.analyser);
            this.visualizerStarted = true;
        }

        const dotTime = 100;
        const dashTime = 300;
        const intraGap = 100;
        const charGap = 400;
        const wordGap = 800;

        const words = text.toUpperCase().split(' ');

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            for (let j = 0; j < word.length; j++) {
                const char = word[j];
                const sequence = Object.keys(this.engine.dictionary).find(key => this.engine.dictionary[key] === char);

                if (sequence) {
                    for (let k = 0; k < sequence.length; k++) {
                        const sym = sequence[k];
                        const duration = sym === '.' ? dotTime : dashTime;

                        this.audio.start();
                        this.ui.setKeyState(true);
                        this.ui.addTapeSymbol(sym === '.' ? 'dot' : 'dash');

                        await new Promise(r => setTimeout(r, duration));

                        this.audio.stop();
                        this.ui.setKeyState(false);

                        await new Promise(r => setTimeout(r, intraGap));
                    }
                    this.ui.addCharacter(char);
                    await new Promise(r => setTimeout(r, charGap));
                }
            }
            if (i < words.length - 1) {
                this.ui.addCharacter(' ');
                await new Promise(r => setTimeout(r, wordGap));
            }
        }

        this.isPlayingBack = false;
        this.handleCompleteTransmission();
    }

    handleCompleteTransmission() {
        const text = this.ui.decodedDisplay.innerText.replace('_', '').trim();
        if (text) {
            this.ui.addToHistory(text);
        }
    }

    handleExport() {
        const text = this.ui.decodedDisplay.innerText.replace('_', '').trim();
        const blob = new Blob([`MORSEKEY TRANSCRIPT\nGenerated: ${new Date().toLocaleString()}\n\n${text}`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'morse_transcript.txt';
        a.click();
        URL.revokeObjectURL(url);
    }

    startTick() {
        const tick = () => {
            const now = Date.now();
            const timeSinceRelease = now - this.lastReleaseTime;

            if (this.currentBuffer.length > 0 && !this.input.isPressed && !this.isPlayingBack) {
                // Character gap detection
                if (timeSinceRelease >= this.engine.CHAR_GAP && !this.isWaitingForChar) {
                    this.decodeBuffer();
                    this.isWaitingForChar = true;
                }

                // Word gap detection
                if (timeSinceRelease >= this.engine.WORD_GAP && !this.isWaitingForWord) {
                    this.ui.addCharacter(' ');
                    this.isWaitingForWord = true;
                }

                // Update timing visualizer
                let progress = 0;
                if (timeSinceRelease < this.engine.CHAR_GAP) {
                    progress = (timeSinceRelease / this.engine.CHAR_GAP) * 100;
                } else if (timeSinceRelease < this.engine.WORD_GAP) {
                    progress = ((timeSinceRelease - this.engine.CHAR_GAP) / (this.engine.WORD_GAP - this.engine.CHAR_GAP)) * 100;
                } else {
                    progress = 100;
                }
                this.ui.updateTiming(progress);
            } else if (this.input.isPressed && !this.isPlayingBack) {
                // When pressed, show duration-based progress (optional visual flair)
                const holdTime = now - this.input.startTime;
                const progress = Math.min((holdTime / this.engine.DOT_THRESHOLD) * 50, 100);
                this.ui.updateTiming(progress);
            } else {
                this.ui.updateTiming(0);
            }

            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    decodeBuffer() {
        const char = this.engine.decode(this.currentBuffer);
        if (char) {
            this.ui.addCharacter(char);
        } else {
            console.log('Unknown sequence:', this.currentBuffer);
        }
        this.currentBuffer = '';
        this.ui.clearBuffer();
    }
}

// Start application
window.addEventListener('DOMContentLoaded', () => {
    new MorseApp();
});
