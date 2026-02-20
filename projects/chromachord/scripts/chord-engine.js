/**
 * CHROMACHORD - CHORD ENGINE MODULE
 * Handles Web Audio API synthesis and color-to-music mapping
 */

class ChordEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.reverbNode = null;
        this.activeOscillators = [];
        this.isPlaying = false;

        // Musical note frequencies (A4 = 440Hz)
        this.noteFrequencies = {
            'C': [32.70, 65.41, 130.81, 261.63, 523.25, 1046.50],
            'C#': [34.65, 69.30, 138.59, 277.18, 554.37, 1108.73],
            'D': [36.71, 73.42, 146.83, 293.66, 587.33, 1174.66],
            'D#': [38.89, 77.78, 155.56, 311.13, 622.25, 1244.51],
            'E': [41.20, 82.41, 164.81, 329.63, 659.25, 1318.51],
            'F': [43.65, 87.31, 174.61, 349.23, 698.46, 1396.91],
            'F#': [46.25, 92.50, 185.00, 369.99, 739.99, 1479.98],
            'G': [49.00, 98.00, 196.00, 392.00, 783.99, 1567.98],
            'G#': [51.91, 103.83, 207.65, 415.30, 830.61, 1661.22],
            'A': [55.00, 110.00, 220.00, 440.00, 880.00, 1760.00],
            'A#': [58.27, 116.54, 233.08, 466.16, 932.33, 1864.66],
            'B': [61.74, 123.47, 246.94, 493.88, 987.77, 1975.53]
        };

        // Chord intervals (semitones from root)
        this.chordTypes = {
            'major': [0, 4, 7],
            'minor': [0, 3, 7],
            'diminished': [0, 3, 6],
            'augmented': [0, 4, 8],
            'major7': [0, 4, 7, 11],
            'minor7': [0, 3, 7, 10],
            'dominant7': [0, 4, 7, 10],
            'suspended': [0, 5, 7]
        };

        this.initializeAudioContext();
    }

    /**
     * Initialize Web Audio API context
     */
    initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.7;

            // Create reverb effect
            this.createReverb();

            // Connect master gain to destination
            this.masterGain.connect(this.audioContext.destination);

        } catch (error) {
            console.error('Web Audio API not supported:', error);
            throw new Error('Audio initialization failed');
        }
    }

    /**
     * Create reverb effect using convolver
     */
    createReverb() {
        this.reverbNode = this.audioContext.createConvolver();

        // Create impulse response for reverb
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 2; // 2 second reverb
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }

        this.reverbNode.buffer = impulse;
    }

    /**
     * Map color to musical chord
     * @param {Object} color - Color object with HSL values
     * @returns {Object} Chord information
     */
    colorToChord(color) {
        // Map hue (0-360) to note (C-B)
        const noteIndex = Math.floor((color.h / 360) * 12);
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const rootNote = notes[noteIndex];

        // Map saturation to chord type
        let chordType;
        if (color.s < 25) {
            chordType = 'diminished';
        } else if (color.s < 50) {
            chordType = 'minor';
        } else if (color.s < 75) {
            chordType = 'major';
        } else {
            chordType = 'augmented';
        }

        // Map lightness to octave (0-5)
        let octave;
        if (color.l < 33) {
            octave = 2; // Low
        } else if (color.l < 66) {
            octave = 3; // Mid
        } else {
            octave = 4; // High
        }

        // Get chord intervals
        const intervals = this.chordTypes[chordType];

        // Calculate frequencies for each note in chord
        const frequencies = this.getChordFrequencies(rootNote, intervals, octave);

        // Get note names
        const noteNames = this.getChordNoteNames(rootNote, intervals);

        return {
            root: rootNote,
            type: chordType,
            octave: octave,
            frequencies: frequencies,
            noteNames: noteNames,
            fullName: `${rootNote} ${this.capitalizeFirst(chordType)}`
        };
    }

    /**
     * Get frequencies for chord notes
     * @param {string} rootNote - Root note name
     * @param {Array<number>} intervals - Semitone intervals
     * @param {number} octave - Octave number
     * @returns {Array<number>} Frequencies
     */
    getChordFrequencies(rootNote, intervals, octave) {
        const frequencies = [];
        const rootFreq = this.noteFrequencies[rootNote][octave];

        for (const interval of intervals) {
            // Calculate frequency using equal temperament
            const freq = rootFreq * Math.pow(2, interval / 12);
            frequencies.push(freq);
        }

        return frequencies;
    }

    /**
     * Get note names for chord
     * @param {string} rootNote - Root note name
     * @param {Array<number>} intervals - Semitone intervals
     * @returns {Array<string>} Note names
     */
    getChordNoteNames(rootNote, intervals) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const rootIndex = notes.indexOf(rootNote);
        const noteNames = [];

        for (const interval of intervals) {
            const noteIndex = (rootIndex + interval) % 12;
            noteNames.push(notes[noteIndex]);
        }

        return noteNames;
    }

    /**
     * Play chord with given parameters
     * @param {Object} chord - Chord information
     * @param {number} duration - Duration in seconds
     * @param {number} volume - Volume (0-1)
     */
    async playChord(chord, duration = 2.0, volume = 0.7) {
        // Stop any currently playing sounds
        this.stopChord();

        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        this.isPlaying = true;
        const currentTime = this.audioContext.currentTime;

        // Create oscillators for each note in chord
        const oscillators = [];
        const gainNodes = [];

        for (let i = 0; i < chord.frequencies.length; i++) {
            const freq = chord.frequencies[i];

            // Create oscillator
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = 'sine'; // Pure sine wave for clean sound
            oscillator.frequency.value = freq;

            // Create gain node for this oscillator (ADSR envelope)
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 0;

            // Create filter for warmth
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 2000;
            filter.Q.value = 1;

            // Create reverb send
            const reverbGain = this.audioContext.createGain();
            reverbGain.gain.value = 0.3;

            // Connect nodes
            oscillator.connect(gainNode);
            gainNode.connect(filter);

            // Dry signal
            filter.connect(this.masterGain);

            // Wet signal (reverb)
            filter.connect(reverbGain);
            reverbGain.connect(this.reverbNode);
            this.reverbNode.connect(this.masterGain);

            // ADSR Envelope
            const attackTime = 0.05;
            const decayTime = 0.1;
            const sustainLevel = volume * 0.8;
            const releaseTime = 0.3;

            // Attack
            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, currentTime + attackTime);

            // Decay
            gainNode.gain.linearRampToValueAtTime(sustainLevel, currentTime + attackTime + decayTime);

            // Sustain (hold at sustainLevel)
            gainNode.gain.setValueAtTime(sustainLevel, currentTime + duration - releaseTime);

            // Release
            gainNode.gain.linearRampToValueAtTime(0, currentTime + duration);

            // Start oscillator
            oscillator.start(currentTime);
            oscillator.stop(currentTime + duration);

            oscillators.push(oscillator);
            gainNodes.push(gainNode);
        }

        this.activeOscillators = oscillators;

        // Clean up after playback
        setTimeout(() => {
            this.isPlaying = false;
            this.activeOscillators = [];
        }, duration * 1000);
    }

    /**
     * Stop currently playing chord
     */
    stopChord() {
        if (this.activeOscillators.length > 0) {
            const currentTime = this.audioContext.currentTime;

            for (const oscillator of this.activeOscillators) {
                try {
                    oscillator.stop(currentTime);
                } catch (error) {
                    // Oscillator may already be stopped
                }
            }

            this.activeOscillators = [];
            this.isPlaying = false;
        }
    }

    /**
     * Set master volume
     * @param {number} volume - Volume (0-1)
     */
    setVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
        }
    }

    /**
     * Get current playback state
     * @returns {boolean} True if playing
     */
    getPlaybackState() {
        return this.isPlaying;
    }

    /**
     * Capitalize first letter of string
     * @param {string} str - Input string
     * @returns {string} Capitalized string
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Clean up audio resources
     */
    dispose() {
        this.stopChord();

        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChordEngine;
}
