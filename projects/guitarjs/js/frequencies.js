/**
 * GuitarJS - Frequency Logic
 * Handles frequency calculations and note mappings.
 */

const Frequencies = (() => {
    // Concert A4
    const BASE_A4 = 440;

    // Standard Tuning: E2, A2, D3, G3, B3, E4
    // Open string frequencies
    const STRING_TUNINGS = [
        82.41,  // E2 (Low E)
        110.00, // A2
        146.83, // D3
        196.00, // G3
        246.94, // B3
        329.63  // E4 (High E)
    ];

    /**
     * Calculates frequency for a given string and fret.
     * @param {number} stringIndex - 0 (Low E) to 5 (High E)
     * @param {number} fret - Fret number (0 for open string)
     * @returns {number} Frequency in Hz
     */
    function getFrequency(stringIndex, fret) {
        if (stringIndex < 0 || stringIndex >= STRING_TUNINGS.length) {
            console.error(`Invalid string index: ${stringIndex}`);
            return 0;
        }
        
        const baseFreq = STRING_TUNINGS[stringIndex];
        // Formula: f = f0 * (2 ^ (n/12))
        return baseFreq * Math.pow(2, fret / 12);
    }

    /**
     * Returns the note name (approximate) for display purposes if needed.
     * @param {number} stringIndex 
     * @param {number} fret 
     */
    function getNoteName(stringIndex, fret) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        // E2 is MIDI note 40.
        // String open MIDI notes: 40, 45, 50, 55, 59, 64
        const stringMidiBases = [40, 45, 50, 55, 59, 64];
        
        const midiNum = stringMidiBases[stringIndex] + fret;
        const noteIndex = midiNum % 12;
        const octave = Math.floor(midiNum / 12) - 1;
        
        return `${notes[noteIndex]}${octave}`;
    }

    return {
        getFrequency,
        getNoteName,
        STRING_COUNT: 6,
        FRET_COUNT: 22 // Standard electric guitar range
    };
})();
