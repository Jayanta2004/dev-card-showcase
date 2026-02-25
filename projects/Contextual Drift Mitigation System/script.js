document.addEventListener('DOMContentLoaded', function() {
    const inputText = document.getElementById('inputText');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const mitigationContainer = document.getElementById('mitigationContainer');
    const driftScore = document.getElementById('driftScore');
    const contextSwitches = document.getElementById('contextSwitches');
    const coherenceLevel = document.getElementById('coherenceLevel');

    const exportBtn = document.getElementById('exportBtn');
    const clearBtn = document.getElementById('clearBtn');
    const sampleBtn = document.getElementById('sampleBtn');
    let currentAnalysis = null;

    analyzeBtn.addEventListener('click', function() {
        const text = inputText.value.trim();
        if (!text) {
            alert('Please enter some text to analyze.');
            return;
        }

        const analysis = analyzeDrift(text);
        currentAnalysis = analysis;
        displayResults(analysis);
        displayMitigations(analysis);
        updateStats(analysis);
    });

    exportBtn.addEventListener('click', function() {
        if (!currentAnalysis) {
            alert('Please analyze some text first.');
            return;
        }
        exportResults(currentAnalysis);
    });

    clearBtn.addEventListener('click', function() {
        inputText.value = '';
        resultsContainer.innerHTML = '<div class="empty-state">No analysis yet. Enter text and click "Analyze Drift" to check for contextual drift.</div>';
        mitigationContainer.innerHTML = '<div class="empty-state">Suggestions will appear here after analysis.</div>';
        updateStats({
            score: 0,
            switches: 0,
            coherence: 'High',
            sentencesCount: 0,
            avgSentenceLength: 0,
            uniqueWords: 0,
            totalWords: 0,
            lexicalDiversity: 0
        });
        currentAnalysis = null;
    });

    sampleBtn.addEventListener('click', function() {
        const sampleText = `The weather today is quite pleasant. I decided to go for a walk in the park. The flowers are blooming beautifully. Suddenly, I remembered that I need to buy groceries. The store is just around the corner. I picked up some fruits and vegetables. Then I thought about my upcoming vacation. The beach sounds amazing. I should book the tickets soon. Speaking of travel, my car needs maintenance. The mechanic said it's due for an oil change. After that, I can plan the road trip. The mountains are calling me.`;
        inputText.value = sampleText;
    });

    function displayResults(analysis) {
        let html = '';
        if (analysis.issues.length === 0) {
            html = '<div class="empty-state">No contextual drift issues detected. Your text maintains good coherence!</div>';
        } else {
            analysis.issues.forEach(issue => {
                const severityClass = issue.type || 'low';
                html += `
                    <div class="drift-issue ${severityClass}">
                        <strong>Sentence ${issue.sentence}:</strong> ${issue.text}<br>
                        <em>${issue.reason}</em>
                    </div>
                `;
            });
        }
        resultsContainer.innerHTML = html;
    }

    function displayMitigations(analysis) {
        let html = '';
        if (analysis.suggestions.length === 0) {
            html = '<div class="empty-state">No mitigation suggestions needed. Your text is well-structured!</div>';
        } else {
            analysis.suggestions.forEach(suggestion => {
                html += `
                    <div class="mitigation-suggestion">
                        <strong>Suggestion:</strong> ${suggestion}
                    </div>
                `;
            });
        }
        mitigationContainer.innerHTML = html;
    }

    function updateStats(analysis) {
        document.getElementById('driftScore').textContent = `${Math.round(analysis.score * 100)}%`;
        document.getElementById('driftScore').className = analysis.score > 0.7 ? 'high' : '';
        document.getElementById('contextSwitches').textContent = analysis.switches;
        document.getElementById('coherenceLevel').textContent = analysis.coherence;
        document.getElementById('sentencesCount').textContent = analysis.sentencesCount;
        document.getElementById('avgSentenceLength').textContent = `${Math.round(analysis.avgSentenceLength)} words`;
        document.getElementById('uniqueWords').textContent = analysis.uniqueWords;
        document.getElementById('totalWords').textContent = analysis.totalWords;
        document.getElementById('lexicalDiversity').textContent = `${Math.round(analysis.lexicalDiversity || 0)}%`;
    }

    function analyzeDrift(text) {
        // This is the main function that orchestrates the entire drift analysis process
        // It takes the input text and performs multiple types of analysis to detect contextual drift

        // Step 1: Split the text into sentences for granular analysis
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).map(s => s.trim());

        // Initialize arrays to collect issues and suggestions from various analyses
        const issues = [];
        const suggestions = [];
        let switches = 0; // Counter for context switches
        let totalDrift = 0; // Accumulator for total drift score

        // Analysis 1: Sentence transition analysis
        // Check similarity between consecutive sentences to detect abrupt topic changes
        for (let i = 1; i < sentences.length; i++) {
            const prevWords = getKeywords(sentences[i-1]);
            const currWords = getKeywords(sentences[i]);
            const similarity = calculateSimilarity(prevWords, currWords);

            if (similarity < 0.3) {
                switches++;
                issues.push({
                    sentence: i + 1,
                    text: sentences[i],
                    type: 'high',
                    reason: 'Low keyword similarity with previous sentence'
                });
                suggestions.push(`Consider adding transition words between sentences ${i} and ${i+1} to improve flow.`);
                totalDrift += 1;
            } else if (similarity < 0.5) {
                issues.push({
                    sentence: i + 1,
                    text: sentences[i],
                    type: 'medium',
                    reason: 'Moderate contextual shift'
                });
                suggestions.push(`Review sentence ${i+1} for relevance to the previous context.`);
                totalDrift += 0.5;
            }
        }

        // Analysis 2: Pronoun consistency check
        // Ensure pronouns are used consistently to maintain reference clarity
        const pronouns = text.match(/\b(he|she|it|they|we|I|you)\b/gi) || [];
        const pronounAnalysis = checkPronounConsistency(sentences, pronouns);
        issues.push(...pronounAnalysis.issues);
        suggestions.push(...pronounAnalysis.suggestions);
        totalDrift += pronounAnalysis.drift;

        // Analysis 3: Topic coherence analysis
        // Verify that main topics are maintained throughout the text
        const topicAnalysis = analyzeTopicCoherence(sentences);
        issues.push(...topicAnalysis.issues);
        suggestions.push(...topicAnalysis.suggestions);
        totalDrift += topicAnalysis.drift;

        // Analysis 4: Repetition check
        // Detect excessive word repetition that might indicate lack of variety
        const repetitionAnalysis = checkRepetition(sentences);
        issues.push(...repetitionAnalysis.issues);
        suggestions.push(...repetitionAnalysis.suggestions);
        totalDrift += repetitionAnalysis.drift;

        // Analysis 5: Sentence length variation
        // Check for inconsistent sentence lengths that might affect readability
        const lengthAnalysis = checkSentenceLengthVariation(sentences);
        issues.push(...lengthAnalysis.issues);
        suggestions.push(...lengthAnalysis.suggestions);
        totalDrift += lengthAnalysis.drift;

        // Analysis 6: Lexical diversity
        // Assess the variety of vocabulary used in the text
        const diversityAnalysis = checkLexicalDiversity(text);
        issues.push(...diversityAnalysis.issues);
        suggestions.push(...diversityAnalysis.suggestions);
        totalDrift += diversityAnalysis.drift;

        // Analysis 7: Temporal consistency
        // Ensure time-related references are used consistently
        const temporalAnalysis = checkTemporalConsistency(sentences);
        issues.push(...temporalAnalysis.issues);
        suggestions.push(...temporalAnalysis.suggestions);
        totalDrift += temporalAnalysis.drift;

        // Analysis 8: Logical flow
        // Check for proper logical connectors between ideas
        const logicAnalysis = checkLogicalFlow(sentences);
        issues.push(...logicAnalysis.issues);
        suggestions.push(...logicAnalysis.suggestions);
        totalDrift += logicAnalysis.drift;

        // Calculate final drift score and coherence level
        const score = Math.min(100, (totalDrift / sentences.length) * 100);

        // Return comprehensive analysis results
        return {
            issues,
            suggestions,
            switches,
            score,
            coherence: score < 20 ? 'High' : score < 50 ? 'Medium' : 'Low',
            sentencesCount: sentences.length,
            avgSentenceLength: sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length,
            uniqueWords: new Set(text.toLowerCase().match(/\b\w+\b/g)).size,
            totalWords: text.split(/\s+/).length
        };
    }

    function getKeywords(sentence) {
        return sentence.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !isStopWord(word));
    }

    function isStopWord(word) {
        const stops = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'an', 'a'];
        return stops.includes(word);
    }

    function calculateSimilarity(words1, words2) {
        const set1 = new Set(words1);
        const set2 = new Set(words2);
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        return intersection.size / union.size || 0;
    }

    function checkPronounConsistency(sentences, pronouns) {
        const issues = [];
        const suggestions = [];
        let drift = 0;

        // Simple check: if pronouns change too frequently
        const pronounCount = {};
        pronouns.forEach(p => {
            const lower = p.toLowerCase();
            pronounCount[lower] = (pronounCount[lower] || 0) + 1;
        });

        const mainPronoun = Object.keys(pronounCount).reduce((a, b) => pronounCount[a] > pronounCount[b] ? a : b, '');
        const changes = Object.keys(pronounCount).length;

        if (changes > 3) {
            issues.push({
                sentence: 'Multiple',
                text: 'Inconsistent pronoun usage',
                type: 'medium',
                reason: 'Multiple pronouns used, may indicate topic shifts'
            });
            suggestions.push('Ensure pronouns refer to consistent subjects throughout the text.');
            drift += 0.5;
        }

        return { issues, suggestions, drift };
    }

    function displayResults(analysis) {
        if (analysis.issues.length === 0) {
            resultsContainer.innerHTML = '<p>No significant contextual drift detected. The text appears coherent.</p>';
        } else {
            resultsContainer.innerHTML = analysis.issues.map(issue =>
                `<div class="drift-issue ${issue.type}">
                    <strong>Sentence ${issue.sentence}:</strong> ${issue.text}<br>
                    <em>Reason: ${issue.reason}</em>
                </div>`
            ).join('');
        }
    }

    function displayMitigations(analysis) {
        if (analysis.suggestions.length === 0) {
            mitigationContainer.innerHTML = '<p>No mitigation suggestions needed.</p>';
        } else {
            mitigationContainer.innerHTML = analysis.suggestions.map(suggestion =>
                `<div class="mitigation-suggestion">${suggestion}</div>`
            ).join('');
        }
    }

    function updateStats(analysis) {
        driftScore.textContent = Math.round(analysis.score) + '%';
        driftScore.className = analysis.score > 50 ? 'high' : '';
        contextSwitches.textContent = analysis.switches;
        coherenceLevel.textContent = analysis.coherence;
        document.getElementById('sentencesCount').textContent = analysis.sentencesCount;
        document.getElementById('avgSentenceLength').textContent = Math.round(analysis.avgSentenceLength) + ' chars';
        document.getElementById('uniqueWords').textContent = analysis.uniqueWords;
        document.getElementById('totalWords').textContent = analysis.totalWords;
        document.getElementById('lexicalDiversity').textContent = Math.round((analysis.uniqueWords / analysis.totalWords) * 100) + '%';
    }

    function analyzeTopicCoherence(sentences) {
        const issues = [];
        const suggestions = [];
        let drift = 0;

        // Simple topic coherence: check if main topics persist
        const allWords = sentences.join(' ').toLowerCase().match(/\b\w+\b/g) || [];
        const wordFreq = {};
        allWords.forEach(word => {
            if (word.length > 3 && !isStopWord(word)) {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });

        const topTopics = Object.keys(wordFreq).sort((a, b) => wordFreq[b] - wordFreq[a]).slice(0, 5);

        for (let i = 1; i < sentences.length; i++) {
            const sentenceWords = sentences[i].toLowerCase().match(/\b\w+\b/g) || [];
            const hasTopic = topTopics.some(topic => sentenceWords.includes(topic));
            if (!hasTopic && i > sentences.length * 0.7) {
                issues.push({
                    sentence: i + 1,
                    text: sentences[i],
                    type: 'medium',
                    reason: 'Late sentence lacks main topic keywords'
                });
                suggestions.push(`Ensure sentence ${i+1} relates back to main topics: ${topTopics.slice(0, 3).join(', ')}.`);
                drift += 0.3;
            }
        }

        return { issues, suggestions, drift };
    }

    function checkRepetition(sentences) {
        const issues = [];
        const suggestions = [];
        let drift = 0;

        const wordCount = {};
        sentences.forEach((sentence, index) => {
            const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
            words.forEach(word => {
                if (word.length > 3) {
                    wordCount[word] = wordCount[word] || [];
                    wordCount[word].push(index);
                }
            });
        });

        Object.keys(wordCount).forEach(word => {
            const occurrences = wordCount[word];
            if (occurrences.length > sentences.length * 0.3) {
                issues.push({
                    sentence: 'Multiple',
                    text: `Word "${word}" repeated ${occurrences.length} times`,
                    type: 'low',
                    reason: 'Excessive word repetition'
                });
                suggestions.push(`Consider using synonyms for "${word}" to improve variety.`);
                drift += 0.1;
            }
        });

        return { issues, suggestions, drift };
    }

    function checkSentenceLengthVariation(sentences) {
        const issues = [];
        const suggestions = [];
        let drift = 0;

        const lengths = sentences.map(s => s.split(/\s+/).length);
        const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
        const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
        const stdDev = Math.sqrt(variance);

        if (stdDev > avgLength * 0.5) {
            issues.push({
                sentence: 'Overall',
                text: 'High variation in sentence lengths',
                type: 'low',
                reason: 'Inconsistent sentence lengths may indicate structural issues'
            });
            suggestions.push('Aim for more consistent sentence lengths to improve readability.');
            drift += 0.2;
        }

        return { issues, suggestions, drift };
    }

    function checkLexicalDiversity(text) {
        const issues = [];
        const suggestions = [];
        let drift = 0;

        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        const uniqueWords = new Set(words);
        const diversity = uniqueWords.size / words.length;

        if (diversity < 0.3) {
            issues.push({
                sentence: 'Overall',
                text: 'Low lexical diversity',
                type: 'medium',
                reason: 'Limited vocabulary may reduce clarity'
            });
            suggestions.push('Incorporate more varied vocabulary to enhance expressiveness.');
            drift += 0.4;
        }

        return { issues, suggestions, drift };
    }

    function checkTemporalConsistency(sentences) {
        const issues = [];
        const suggestions = [];
        let drift = 0;

        const timeWords = ['yesterday', 'today', 'tomorrow', 'now', 'then', 'before', 'after', 'past', 'future', 'ago', 'later'];
        const temporalRefs = [];

        sentences.forEach((sentence, index) => {
            const lower = sentence.toLowerCase();
            const hasTime = timeWords.some(word => lower.includes(word));
            if (hasTime) {
                temporalRefs.push(index);
            }
        });

        if (temporalRefs.length > 0 && temporalRefs.length < sentences.length * 0.1) {
            issues.push({
                sentence: 'Multiple',
                text: 'Sparse temporal references',
                type: 'low',
                reason: 'Inconsistent use of time-related language'
            });
            suggestions.push('Ensure temporal references are consistent throughout the narrative.');
            drift += 0.1;
        }

        return { issues, suggestions, drift };
    }

    function exportResults(analysis) {
        const report = {
            timestamp: new Date().toISOString(),
            driftScore: analysis.score,
            coherenceLevel: analysis.coherence,
            contextSwitches: analysis.switches,
            sentencesCount: analysis.sentencesCount,
            avgSentenceLength: analysis.avgSentenceLength,
            uniqueWords: analysis.uniqueWords,
            totalWords: analysis.totalWords,
            lexicalDiversity: (analysis.uniqueWords / analysis.totalWords) * 100,
            issues: analysis.issues,
            suggestions: analysis.suggestions
        };

        const dataStr = JSON.stringify(report, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const exportFileDefaultName = 'drift-analysis-report.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
});