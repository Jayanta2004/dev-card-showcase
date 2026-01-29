/**
 * GuitarJS - Keyboard Logic
 * Defines key mappings and handles keyboard events.
 */

const KeyboardStr = (() => {
    // Mapping keys to strings (index 0 = Low E, 5 = High E)
    // Mapping keys to strings (index 0 = Low E, 5 = High E)
    // Row: A S D F G H
    const KEY_TO_STRING = {
        'a': 0, 'A': 0,
        's': 1, 'S': 1,
        'd': 2, 'D': 2,
        'f': 3, 'F': 3,
        'g': 4, 'G': 4,
        'h': 5, 'H': 5,
        'j': 5, 'J': 5, // Extra buffer mapping for comfort if needed
        'k': 5, 'K': 5  // Extra buffer
    };

    // Active notes tracking to handle Sustain
    const activeKeys = new Map(); // key -> noteObject

    function init() {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
    }

    function handleKeyDown(e) {
        if (e.repeat) return; // Prevent machine gun repeating

        const key = e.key;

        // String Plucker
        if (KEY_TO_STRING.hasOwnProperty(key)) {
            const strIndex = KEY_TO_STRING[key];

            // Allow basic chording (holding shift or numeric keys?)
            // Requirement: "Chords (at least 3)"
            // Implementation: Number keys change fret buffer?
            // Simple approach: Key pluck plays OPEN string.
            // But to do chords, we need logic.
            // Let's add simplified "Chord Mode" keys:
            // 1, 2, 3 -> Hold to set fret offsets.

            // Pass shift key state to determining chord shape
            const fretOffsets = getChordOffsets(e.shiftKey);
            const fret = fretOffsets[strIndex] || 0;

            const note = Fretboard.pluckString(strIndex, fret);
            activeKeys.set(key, note);
        }
    }

    function handleKeyUp(e) {
        const key = e.key;
        if (activeKeys.has(key)) {
            const note = activeKeys.get(key);
            window.audioEngine.dampen(note);
            activeKeys.delete(key);
        }
    }

    // Chord Logic
    // Maps currently held modifier keys to fret offsets
    let chordMode = 'open'; // open, E, A, D etc.

    const heldModifiers = new Set();

    window.addEventListener('keydown', (e) => {
        if (['1', '2', '3', '4'].includes(e.key)) heldModifiers.add(e.key);
    });
    window.addEventListener('keyup', (e) => {
        if (['1', '2', '3', '4'].includes(e.key)) heldModifiers.delete(e.key);
    });

    function getChordOffsets(isShiftHeld) {
        // Default: Open
        let offsets = [0, 0, 0, 0, 0, 0];

        // Shift OR '1': E Major Shape (Standard E Chord)
        // Strings: 0 2 2 1 0 0 (E2, B2, E3, G#3, B3, E4)
        if (isShiftHeld || heldModifiers.has('1')) {
            offsets = [0, 2, 2, 1, 0, 0];
        }

        // 2: A Major Shape
        // Strings: X 0 2 2 2 0 (Mute low E? or just 0)
        else if (heldModifiers.has('2')) {
            offsets = [0, 0, 2, 2, 2, 0];
        }

        // 3: G Major Shape
        // 3 2 0 0 0 3
        else if (heldModifiers.has('3')) {
            offsets = [3, 2, 0, 0, 0, 3];
        }

        return offsets;
    }

    return {
        init
    };
})();
