/**
 * Audio Engine - Web Audio API Implementation
 * Handles sound generation and playback
 */

class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.activeOscillators = new Map();
        this.initialized = false;
    }

    /**
     * Initialize the audio context
     * Must be called after user interaction
     */
    initialize() {
        if (this.initialized) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.3; // Master volume
        this.masterGain.connect(this.audioContext.destination);
        
        this.initialized = true;
        console.log('Audio Engine initialized');
    }

    /**
     * Get frequency for a given note
     * Uses A4 = 440Hz as reference
     */
    getNoteFrequency(note) {
        const noteFrequencies = {
            'C4': 261.63,
            'Db4': 277.18,
            'D4': 293.66,
            'Eb4': 311.13,
            'E4': 329.63,
            'F4': 349.23,
            'Gb4': 369.99,
            'G4': 392.00,
            'Ab4': 415.30,
            'A4': 440.00,
            'Bb4': 466.16,
            'B4': 493.88,
            'C5': 523.25
        };
        
        return noteFrequencies[note] || 440;
    }

    /**
     * Play a note with attack and release envelope
     */
    playNote(note, duration = 0.5) {
        if (!this.initialized) {
            this.initialize();
        }

        const frequency = this.getNoteFrequency(note);
        const now = this.audioContext.currentTime;

        // Create oscillator
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine'; // Piano-like sound
        oscillator.frequency.value = frequency;

        // Create gain node for envelope
        const gainNode = this.audioContext.createGain();
        
        // ADSR Envelope
        const attackTime = 0.01;
        const decayTime = 0.1;
        const sustainLevel = 0.7;
        const releaseTime = 0.3;

        // Attack
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(1, now + attackTime);
        
        // Decay to sustain
        gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        
        // Release
        const releaseStart = now + duration;
        gainNode.gain.setValueAtTime(sustainLevel, releaseStart);
        gainNode.gain.linearRampToValueAtTime(0, releaseStart + releaseTime);

        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Start and stop
        oscillator.start(now);
        oscillator.stop(now + duration + releaseTime);

        // Store active oscillator
        this.activeOscillators.set(note, { oscillator, gainNode });

        // Clean up after note ends
        oscillator.onended = () => {
            oscillator.disconnect();
            gainNode.disconnect();
            this.activeOscillators.delete(note);
        };

        return { oscillator, gainNode };
    }

    /**
     * Stop a specific note immediately
     */
    stopNote(note) {
        if (this.activeOscillators.has(note)) {
            const { oscillator, gainNode } = this.activeOscillators.get(note);
            const now = this.audioContext.currentTime;
            
            // Quick fade out
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.05);
            
            oscillator.stop(now + 0.05);
            this.activeOscillators.delete(note);
        }
    }

    /**
     * Stop all currently playing notes
     */
    stopAllNotes() {
        this.activeOscillators.forEach((_, note) => {
            this.stopNote(note);
        });
    }

    /**
     * Set master volume
     */
    setVolume(value) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, value));
        }
    }
}

// Create global audio engine instance
const audioEngine = new AudioEngine();