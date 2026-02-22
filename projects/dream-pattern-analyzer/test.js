// Dream Pattern Analyzer - Basic Test Suite

function testAnalyzeDream() {
    const sample = "I was flying over a mountain and felt happy and free.";
    const result = analyzeDream(sample);
    console.assert(result.topWords.includes('flying'), 'Should detect "flying"');
    console.assert(result.emotions.includes('happy'), 'Should detect "happy"');
    console.assert(result.symbols.includes('mountain'), 'Should detect "mountain"');
    console.log('testAnalyzeDream passed');
}

function testSentiment() {
    const pos = DreamSentiment.analyzeSentiment('I am happy and proud');
    const neg = DreamSentiment.analyzeSentiment('I am sad and angry');
    const neu = DreamSentiment.analyzeSentiment('I am walking in a room');
    console.assert(pos === 'Very Positive' || pos === 'Positive', 'Positive sentiment');
    console.assert(neg === 'Very Negative' || neg === 'Negative', 'Negative sentiment');
    console.assert(neu === 'Neutral', 'Neutral sentiment');
    console.log('testSentiment passed');
}

function runAllTests() {
    testAnalyzeDream();
    testSentiment();
    // Add more tests as features grow
}

runAllTests();
