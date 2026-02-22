// Utility functions for Dream Pattern Analyzer

/**
 * Remove stop words and return an array of significant words.
 * @param {string[]} words
 * @param {string[]} stopWords
 * @returns {string[]}
 */
function filterStopWords(words, stopWords) {
    return words.filter(w => !stopWords.includes(w) && w.length > 2);
}

/**
 * Count word frequencies in an array of words.
 * @param {string[]} words
 * @returns {Object}
 */
function wordFrequency(words) {
    const freq = {};
    words.forEach(w => {
        freq[w] = (freq[w] || 0) + 1;
    });
    return freq;
}

/**
 * Get top N frequent words from a frequency object.
 * @param {Object} freq
 * @param {number} n
 * @returns {Array}
 */
function getTopWords(freq, n = 5) {
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, n);
}

/**
 * Find all matches from a list in a word array.
 * @param {string[]} words
 * @param {string[]} list
 * @returns {string[]}
 */
function findMatches(words, list) {
    return list.filter(item => words.includes(item));
}

/**
 * Capitalize the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Export for browser
window.DreamUtils = {
    filterStopWords,
    wordFrequency,
    getTopWords,
    findMatches,
    capitalize
};
