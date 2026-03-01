// DrumsJS - Auto-Play Drum Machine
class DrumsJS {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.tempo = 120;
        this.currentStep = 0;
        this.intervalId = null;
        this.currentPattern = 'rock';

        // Drum pad configuration
        this.drumPads = [
            { key: 'Q', name: 'Kick', frequency: 60, type: 'sine', color: '#FF6B6B' },
            { key: 'W', name: 'Snare', frequency: 200, type: 'square', color: '#4ECDC4' },
            { key: 'E', name: 'Hi-Hat', frequency: 8000, type: 'sawtooth', color: '#45B7D1' },
            { key: 'R', name: 'Tom', frequency: 150, type: 'triangle', color: '#FFA07A' },
            { key: 'A', name: 'Clap', frequency: 1000, type: 'square', color: '#98D8C8' },
            { key: 'S', name: 'Cymbal', frequency: 5000, type: 'sawtooth', color: '#F7DC6F' },
            { key: 'D', name: 'Perc', frequency: 300, type: 'triangle', color: '#BB8FCE' },
            { key: 'F', name: 'Bass', frequency: 40, type: 'sine', color: '#85C1E9' }
        ];

        // Beat patterns
        this.beatPatterns = {
            rock: ['Q', null, 'E', null, 'W', null, 'E', null, 'Q', null, 'E', null, 'W', null, 'E', null],
            funk: ['Q', 'E', null, 'E', 'W', 'E', null, 'E', 'Q', 'E', null, 'E', 'W', 'E', 'Q', 'E'],
            hiphop: ['Q', null, null, 'E', 'W', null, 'E', null, 'Q', null, 'E', null, 'W', null, null, 'E'],
            reggae: ['Q', null, 'E', null, null, 'W', 'E', null, 'Q', null, 'E', null, null, 'W', 'E', null],
            disco: ['Q', 'E', 'E', 'E', 'Q', 'E', 'E', 'E', 'Q', 'E', 'E', 'E', 'Q', 'E', 'E', 'E']
        };

        this.init();
        this.setupEventListeners();
    }

    init() {
        this.createDrumPads();
        this.updateBPMDisplay();
    }

    createDrumPads() {
        const drumKit = document.getElementById('drumKit');

        this.drumPads.forEach(pad => {
            const padElement = document.createElement('div');
            padElement.className = 'drum-pad';
            padElement.dataset.key = pad.key;
            padElement.style.borderColor = pad.color;
            padElement.innerHTML = `
                <div class="key">${pad.key}</div>
                <div class="name">${pad.name}</div>
            `;

            // Add click event
            padElement.addEventListener('click', () => {
                this.playDrum(pad);
            });

            drumKit.appendChild(padElement);
        });
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            const key = e.key.toUpperCase();
            const pad = this.drumPads.find(p => p.key === key);

            if (pad) {
                e.preventDefault();
                this.playDrum(pad);
            }
        });

        // Play button
        document.getElementById('playBtn').addEventListener('click', () => {
            this.togglePlay();
        });

        // Tempo slider
        document.getElementById('tempoSlider').addEventListener('input', (e) => {
            this.setTempo(parseInt(e.target.value));
        });

        // Pattern buttons
        document.querySelectorAll('.pattern-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setPattern(e.target.dataset.pattern);
            });
        });
    }

    async initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Resume audio context if suspended (required by some browsers)
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    async playDrum(pad) {
        await this.initAudio();

        // Play the sound
        this.generateDrumSound(pad.frequency, pad.type);

        // Visual feedback
        this.animatePad(pad.key);
    }

    generateDrumSound(frequency, type, duration = 0.2) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;

        // Create envelope for more natural sound
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    animatePad(key) {
        const padElement = document.querySelector(`[data-key="${key}"]`);
        if (padElement) {
            padElement.classList.add('active');
            setTimeout(() => {
                padElement.classList.remove('active');
            }, 100);
        }
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        const playBtn = document.getElementById('playBtn');

        if (this.isPlaying) {
            playBtn.textContent = '⏸ Pause';
            playBtn.classList.add('playing');
            this.startAutoPlay();
        } else {
            playBtn.textContent = '▶ Play';
            playBtn.classList.remove('playing');
            this.stopAutoPlay();
        }
    }

    startAutoPlay() {
        const stepTime = (60 / this.tempo) * 1000 / 4; // 16th notes

        this.intervalId = setInterval(() => {
            const pattern = this.beatPatterns[this.currentPattern];
            const drumKey = pattern[this.currentStep];

            if (drumKey) {
                const pad = this.drumPads.find(p => p.key === drumKey);
                if (pad) {
                    this.playDrum(pad);
                }
            }

            this.currentStep = (this.currentStep + 1) % pattern.length;
        }, stepTime);
    }

    stopAutoPlay() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.currentStep = 0;
    }

    setTempo(newTempo) {
        this.tempo = newTempo;
        this.updateBPMDisplay();

        // Restart auto-play with new tempo if currently playing
        if (this.isPlaying) {
            this.stopAutoPlay();
            this.startAutoPlay();
        }
    }

    setPattern(patternName) {
        this.currentPattern = patternName;
        this.currentStep = 0;

        // Update active button
        document.querySelectorAll('.pattern-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-pattern="${patternName}"]`).classList.add('active');
    }

    updateBPMDisplay() {
        document.getElementById('bpmDisplay').textContent = `${this.tempo} BPM`;
    }
}

// Initialize DrumsJS when page loads
let drumsJS;
document.addEventListener('DOMContentLoaded', () => {
    drumsJS = new DrumsJS();
});

// Initialize audio on first user interaction (required by browsers)
document.addEventListener('click', () => {
    if (drumsJS && !drumsJS.audioContext) {
        drumsJS.initAudio();
    }
}, { once: true });

document.addEventListener('keydown', () => {
    if (drumsJS && !drumsJS.audioContext) {
        drumsJS.initAudio();
    }
}, { once: true });