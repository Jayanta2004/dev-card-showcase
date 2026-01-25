/**
 * Piano UI Controller
 * Handles piano rendering and interaction
 */

class Piano {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.keys = [];
        this.keyMap = new Map();

        // Keyboard mapping
        this.keyboardMap = {
            'a': 'C4',
            'w': 'Db4',
            's': 'D4',
            'e': 'Eb4',
            'd': 'E4',
            'f': 'F4',
            't': 'Gb4',
            'g': 'G4',
            'y': 'Ab4',
            'h': 'A4',
            'u': 'Bb4',
            'j': 'B4',
            'k': 'C5'
        };

        this.initialize();
    }

    /**
     * Initialize piano keys
     */
    initialize() {
        this.createKeys();
        this.attachEventListeners();
    }

    /**
     * Create piano key elements
     */
    createKeys() {
        const notes = [
            'C4', 'Db4', 'D4', 'Eb4', 'E4', 'F4', 'Gb4', 'G4', 'Ab4', 'A4', 'Bb4', 'B4',
            'C5', 'Db5', 'D5', 'Eb5', 'E5', 'F5', 'Gb5', 'G5', 'Ab5', 'A5', 'Bb5', 'B5', 'C6'
        ];
        // Map keyboard to these notes. 
        // Lower octave: Z X C V B N M , . /
        // Upper octave: Q W E R T Y U I O P [ ] \
        // This is a rough mapping, let's just map as many as we can or keep it simple.
        // Let's stick to the visual generation. Key binding needs update in constructor if we want full support.

        notes.forEach((note, index) => {
            const keyElement = document.createElement('div');
            const isBlack = note.includes('b');

            keyElement.className = `key ${isBlack ? 'black' : 'white'}`;
            keyElement.dataset.note = note;

            // Add note name
            const noteName = document.createElement('span');
            noteName.className = 'note-name';
            noteName.textContent = note;
            keyElement.appendChild(noteName);

            // Allow keyboard label if we have a mapping (omitted for now to keep UI clean or update later)
            // const keyLabel = document.createElement('span'); ...

            this.container.appendChild(keyElement);
            this.keys.push(keyElement);
            this.keyMap.set(note, keyElement);
        });
    }

    /**
     * Attach event listeners for mouse and keyboard interaction
     */
    attachEventListeners() {
        // Mouse events
        this.keys.forEach(key => {
            const note = key.dataset.note;

            key.addEventListener('mousedown', () => {
                this.pressKey(note, true);
            });

            key.addEventListener('mouseup', () => {
                this.releaseKey(note);
            });

            key.addEventListener('mouseleave', () => {
                this.releaseKey(note);
            });

            // Touch events for mobile
            key.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.pressKey(note, true);
            });

            key.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.releaseKey(note);
            });
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (this.keyboardMap[key] && !e.repeat) {
                this.pressKey(this.keyboardMap[key], true);
            }
        });

        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (this.keyboardMap[key]) {
                this.releaseKey(this.keyboardMap[key]);
            }
        });
    }

    /**
     * Press a piano key
     */
    pressKey(note, playSound = false) {
        const keyElement = this.keyMap.get(note);
        if (!keyElement) return;

        keyElement.classList.add('active');

        if (playSound) {
            audioEngine.playNote(note);
            this.updateCurrentNote(note);
        }
    }

    /**
     * Release a piano key
     */
    releaseKey(note) {
        const keyElement = this.keyMap.get(note);
        if (!keyElement) return;

        keyElement.classList.remove('active');
    }

    /**
     * Highlight a key without sound (for auto-play visual feedback)
     */
    highlightKey(note, duration = 500) {
        const keyElement = this.keyMap.get(note);
        if (!keyElement) return;

        keyElement.classList.add('active', 'playing');

        setTimeout(() => {
            keyElement.classList.remove('active', 'playing');
        }, duration);
    }

    /**
     * Update current note display
     */
    updateCurrentNote(note) {
        const noteDisplay = document.getElementById('currentNote');
        if (noteDisplay) {
            noteDisplay.textContent = note;
            noteDisplay.style.color = '#667eea';
            noteDisplay.style.fontWeight = 'bold';
        }
    }

    /**
     * Clear current note display
     */
    clearCurrentNote() {
        const noteDisplay = document.getElementById('currentNote');
        if (noteDisplay) {
            noteDisplay.textContent = '—';
            noteDisplay.style.color = '#999';
        }
    }

    /**
     * Reset all keys
     */
    resetAllKeys() {
        this.keys.forEach(key => {
            key.classList.remove('active', 'playing');
        });
        this.clearCurrentNote();
    }
}

// Create global piano instance (will be initialized in main.js)
let piano = null;