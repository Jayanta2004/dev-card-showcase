/**
 * MorseEngine - Decodes DOT/DASH sequences into characters
 */
export class MorseEngine {
    constructor() {
        this.dictionary = {
            '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
            '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
            '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
            '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
            '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
            '--..': 'Z', '-----': '0', '.----': '1', '..---': '2', '...--': '3',
            '....-': '4', '.....': '5', '-....': '6', '--...': '7', '---..': '8',
            '----.': '9', '.-.-.-': '.', '--..--': ',', '..--..': '?', '.----.': "'",
            '-.-.--': '!', '-..-.': '/', '-...-': '=', '.-.-.': '+', '-....-': '-',
            '.-..-.': '"', '.--.-.': '@'
        };

        // Timing constants (ms)
        this.DOT_THRESHOLD = 200; // < 200ms is a dot
        this.CHAR_GAP = 700;      // > 700ms gap means character finished
        this.WORD_GAP = 2000;     // > 2000ms gap means word finished
    }

    /**
     * Decode a sequence of dots and dashes
     * @param {string} sequence - e.g., ".-"
     * @returns {string} Decoded character or empty string if not found
     */
    decode(sequence) {
        return this.dictionary[sequence] || '';
    }

    /**
     * Determine if a press duration is a dot or a dash
     * @param {number} duration - ms
     * @returns {string} "." or "-"
     */
    getSymbol(duration) {
        return duration < this.DOT_THRESHOLD ? '.' : '-';
    }
}
