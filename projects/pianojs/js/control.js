/**
 * Auto-Play Controller
 * Manages melody playback and timing
 */

class AutoPlayController {
    constructor() {
        this.isPlaying = false;
        this.isPaused = false;
        this.currentMelody = null;
        this.currentNoteIndex = 0;
        this.timeoutId = null;
        this.tempo = 1.0; // Normal speed
        this.loopMode = true;
        this.melodyName = 'twinkle';
        
        // Tempo multipliers
        this.tempoValues = {
            slow: 1.5,
            normal: 1.0,
            fast: 0.6
        };
    }

    /**
     * Start auto-play
     */
    play() {
        if (this.isPlaying && !this.isPaused) return;

        audioEngine.initialize(); // Ensure audio is ready

        if (this.isPaused) {
            this.isPaused = false;
            this.updateStatus('Playing');
        } else {
            this.currentMelody = getMelody(this.melodyName);
            this.currentNoteIndex = 0;
            this.updateStatus('Playing');
        }

        this.isPlaying = true;
        this.playNextNote();
    }

    /**
     * Pause auto-play
     */
    pause() {
        if (!this.isPlaying || this.isPaused) return;

        this.isPaused = true;
        this.isPlaying = false;
        
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }

        audioEngine.stopAllNotes();
        piano.resetAllKeys();
        this.updateStatus('Paused');
    }

    /**
     * Restart melody from beginning
     */
    restart() {
        this.stop();
        this.currentNoteIndex = 0;
        this.isPaused = false;
        this.play();
    }

    /**
     * Stop auto-play completely
     */
    stop() {
        this.isPlaying = false;
        this.isPaused = false;
        
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }

        audioEngine.stopAllNotes();
        piano.resetAllKeys();
        this.updateStatus('Stopped');
    }

    /**
     * Play the next note in the melody
     */
    playNextNote() {
        if (!this.isPlaying || this.isPaused || !this.currentMelody) return;

        const melody = this.currentMelody.notes;
        
        if (this.currentNoteIndex >= melody.length) {
            if (this.loopMode) {
                this.currentNoteIndex = 0;
            } else {
                this.stop();
                this.updateStatus('Finished');
                return;
            }
        }

        const { note, duration } = melody[this.currentNoteIndex];
        
        // Play note and highlight key
        audioEngine.playNote(note, duration * this.tempo);
        piano.highlightKey(note, duration * this.tempo * 1000);
        piano.updateCurrentNote(note);

        this.currentNoteIndex++;

        // Schedule next note
        const delay = duration * this.tempo * 1000;
        this.timeoutId = setTimeout(() => {
            this.playNextNote();
        }, delay);
    }

    /**
     * Change melody
     */
    setMelody(melodyName) {
        const wasPlaying = this.isPlaying;
        this.stop();
        this.melodyName = melodyName;
        this.currentNoteIndex = 0;
        
        if (wasPlaying) {
            setTimeout(() => this.play(), 100);
        }
    }

    /**
     * Set tempo
     */
    setTempo(tempoName) {
        this.tempo = this.tempoValues[tempoName] || 1.0;
    }

    /**
     * Toggle loop mode
     */
    setLoopMode(enabled) {
        this.loopMode = enabled;
    }

    /**
     * Update status display
     */
    updateStatus(status) {
        const statusElement = document.getElementById('statusText');
        if (statusElement) {
            statusElement.textContent = status;
            
            // Color coding
            const colors = {
                'Playing': '#00c851',
                'Paused': '#ffbb33',
                'Stopped': '#ff4444',
                'Finished': '#667eea',
                'Ready': '#999'
            };
            
            statusElement.style.color = colors[status] || '#999';
        }
    }
}

/**
 * UI Controls Manager
 * Handles button clicks and UI updates
 */

class ControlsManager {
    constructor(autoPlayController) {
        this.autoPlay = autoPlayController;
        this.initializeControls();
    }

    /**
     * Initialize all control event listeners
     */
    initializeControls() {
        // Play button
        const playBtn = document.getElementById('playBtn');
        playBtn.addEventListener('click', () => {
            this.autoPlay.play();
            this.updateButtons(true);
        });

        // Pause button
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.addEventListener('click', () => {
            this.autoPlay.pause();
            this.updateButtons(false);
        });

        // Restart button
        const restartBtn = document.getElementById('restartBtn');
        restartBtn.addEventListener('click', () => {
            this.autoPlay.restart();
            this.updateButtons(true);
        });

        // Melody selector
        const melodySelect = document.getElementById('melodySelect');
        melodySelect.addEventListener('change', (e) => {
            this.autoPlay.setMelody(e.target.value);
        });

        // Tempo buttons
        const tempoButtons = document.querySelectorAll('.tempo-btn');
        tempoButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tempo = btn.dataset.tempo;
                this.autoPlay.setTempo(tempo);
                
                // Update active state
                tempoButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Mode buttons
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.autoPlay.setLoopMode(mode === 'loop');
                
                // Update active state
                modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    /**
     * Update play/pause button states
     */
    updateButtons(isPlaying) {
        const playBtn = document.getElementById('playBtn');
        const pauseBtn = document.getElementById('pauseBtn');

        if (isPlaying) {
            playBtn.disabled = true;
            pauseBtn.disabled = false;
        } else {
            playBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    }
}

// Global instances (will be initialized in main.js)
let autoPlayController = null;
let controlsManager = null;