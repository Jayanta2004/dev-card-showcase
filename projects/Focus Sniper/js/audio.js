// ==================== AUDIO SYSTEM ====================

const AudioManager = {
    context: null,
    masterVolume: 0.3,
    enabled: true,
    sounds: {},

    /**
     * Initialize audio context
     */
    init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Audio system initialized');
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            this.enabled = false;
        }
    },

    /**
     * Play a tone with specified frequency and duration
     */
    playTone(frequency, duration = 0.1, volume = 1.0, type = 'sine') {
        if (!this.enabled || !this.context) return;

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(volume * this.masterVolume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    },

    /**
     * Play hit sound
     */
    playHit() {
        if (!this.enabled) return;
        
        const frequencies = [800, 1000, 1200];
        const freq = Utils.randomChoice(frequencies);
        this.playTone(freq, 0.05, 0.3, 'square');
        
        // Add a quick harmonic
        setTimeout(() => {
            this.playTone(freq * 1.5, 0.03, 0.15, 'sine');
        }, 20);
    },

    /**
     * Play miss sound
     */
    playMiss() {
        if (!this.enabled) return;
        this.playTone(200, 0.15, 0.2, 'sawtooth');
    },

    /**
     * Play critical hit sound
     */
    playCritical() {
        if (!this.enabled) return;
        
        // Ascending tones
        this.playTone(600, 0.05, 0.4, 'square');
        setTimeout(() => this.playTone(800, 0.05, 0.4, 'square'), 50);
        setTimeout(() => this.playTone(1000, 0.1, 0.5, 'square'), 100);
        setTimeout(() => this.playTone(1200, 0.15, 0.6, 'sine'), 150);
    },

    /**
     * Play combo sound
     */
    playCombo(comboLevel) {
        if (!this.enabled) return;
        
        const baseFreq = 400 + (comboLevel * 100);
        this.playTone(baseFreq, 0.08, 0.4, 'square');
        setTimeout(() => {
            this.playTone(baseFreq * 1.5, 0.1, 0.3, 'sine');
        }, 30);
    },

    /**
     * Play target spawn sound
     */
    playTargetSpawn() {
        if (!this.enabled) return;
        this.playTone(400, 0.05, 0.15, 'sine');
        setTimeout(() => this.playTone(600, 0.05, 0.1, 'sine'), 40);
    },

    /**
     * Play distraction sound
     */
    playDistraction() {
        if (!this.enabled) return;
        
        // Annoying beep
        this.playTone(1000, 0.08, 0.2, 'square');
        setTimeout(() => this.playTone(1200, 0.08, 0.2, 'square'), 100);
    },

    /**
     * Play warning sound
     */
    playWarning() {
        if (!this.enabled) return;
        
        // Alternating tones
        this.playTone(800, 0.15, 0.25, 'sawtooth');
        setTimeout(() => this.playTone(600, 0.15, 0.25, 'sawtooth'), 150);
    },

    /**
     * Play focus loss sound
     */
    playFocusLoss() {
        if (!this.enabled) return;
        
        // Descending tone
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(600, this.context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.context.currentTime + 0.3);

        gainNode.gain.setValueAtTime(0.2 * this.masterVolume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + 0.3);
    },

    /**
     * Play focus recovery sound
     */
    playFocusRecovery() {
        if (!this.enabled) return;
        
        // Ascending tone
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, this.context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.context.currentTime + 0.2);

        gainNode.gain.setValueAtTime(0.15 * this.masterVolume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + 0.2);
    },

    /**
     * Play game start sound
     */
    playGameStart() {
        if (!this.enabled) return;
        
        const notes = [400, 500, 600, 800];
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, 0.15, 0.3, 'sine');
            }, index * 100);
        });
    },

    /**
     * Play game over sound
     */
    playGameOver() {
        if (!this.enabled) return;
        
        const notes = [600, 500, 400, 300];
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, 0.2, 0.3, 'sawtooth');
            }, index * 150);
        });
    },

    /**
     * Play achievement sound
     */
    playAchievement() {
        if (!this.enabled) return;
        
        // Victory fanfare
        const melody = [
            [523, 0.1],  // C
            [659, 0.1],  // E
            [784, 0.1],  // G
            [1047, 0.3]  // C (high)
        ];

        let delay = 0;
        melody.forEach(([freq, duration]) => {
            setTimeout(() => {
                this.playTone(freq, duration, 0.4, 'sine');
            }, delay);
            delay += duration * 1000;
        });
    },

    /**
     * Play UI click sound
     */
    playClick() {
        if (!this.enabled) return;
        this.playTone(800, 0.03, 0.2, 'square');
    },

    /**
     * Play timer tick sound
     */
    playTick() {
        if (!this.enabled) return;
        this.playTone(1200, 0.02, 0.1, 'square');
    },

    /**
     * Play explosion sound
     */
    playExplosion() {
        if (!this.enabled) return;

        // White noise burst
        const bufferSize = this.context.sampleRate * 0.3;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const output = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
        }

        const noise = this.context.createBufferSource();
        const gainNode = this.context.createGain();
        const filter = this.context.createBiquadFilter();

        noise.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.context.destination);

        gainNode.gain.setValueAtTime(0.3 * this.masterVolume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);

        noise.start(this.context.currentTime);
        noise.stop(this.context.currentTime + 0.3);
    },

    /**
     * Play laser sound
     */
    playLaser() {
        if (!this.enabled) return;

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(1000, this.context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3 * this.masterVolume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + 0.1);
    },

    /**
     * Play powerup sound
     */
    playPowerup() {
        if (!this.enabled) return;

        const frequencies = [400, 500, 600, 700, 800, 900, 1000];
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, 0.05, 0.2, 'sine');
            }, index * 30);
        });
    },

    /**
     * Set master volume
     */
    setVolume(volume) {
        this.masterVolume = Utils.clamp(volume, 0, 1);
    },

    /**
     * Toggle audio on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    },

    /**
     * Set enabled state
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (enabled && !this.context) {
            this.init();
        }
    }
};

// Initialize on load
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        // Initialize on first user interaction
        const initAudio = () => {
            AudioManager.init();
            document.removeEventListener('click', initAudio);
            document.removeEventListener('keydown', initAudio);
        };
        document.addEventListener('click', initAudio);
        document.addEventListener('keydown', initAudio);
    });
}
