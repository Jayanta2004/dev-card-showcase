// Dream Pattern Analyzer - Simple Sentiment Analysis

const positiveWords = ['happy','joy','love','excited','peaceful','hopeful','proud','relieved','calm','grateful','inspired','content','cheerful','optimistic','satisfied'];
const negativeWords = ['sad','fear','angry','hate','scared','anxious','confused','lonely','guilty','ashamed','jealous','worried','depressed','upset','frustrated'];

function analyzeSentiment(text) {
    const words = text.toLowerCase().replace(/[^a-zA-Z\s]/g, '').split(/\s+/);
    let score = 0;
    words.forEach(w => {
        if (positiveWords.includes(w)) score++;
        if (negativeWords.includes(w)) score--;
    });
    if (score > 2) return 'Very Positive';
    if (score > 0) return 'Positive';
    if (score === 0) return 'Neutral';
    if (score < -2) return 'Very Negative';
    return 'Negative';
}

window.DreamSentiment = { analyzeSentiment };
