// Dream Pattern Analyzer - Simple Text Analysis

const dreamInput = document.getElementById('dreamInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsDiv = document.getElementById('results');
const historyDiv = document.getElementById('history');

// Store dreams in localStorage
function getDreams() {
    return JSON.parse(localStorage.getItem('dreams') || '[]');
}
function saveDream(dream, analysis) {
    const dreams = getDreams();
    dreams.push({ dream, analysis, date: new Date().toLocaleDateString() });
    localStorage.setItem('dreams', JSON.stringify(dreams));
}

// Simple text analysis for recurring words, emotions, symbols
function analyzeDream(text) {
    const stopWords = ['the','and','a','to','of','in','it','is','was','for','on','with','as','at','by','an','be','this','that','from','or','but','are','so','if','my','me','i'];
    const emotionWords = ['happy','sad','fear','angry','joy','love','hate','excited','scared','peaceful','anxious','calm','confused','lonely','hopeful','guilty','proud','ashamed','relieved','jealous'];
    const symbolWords = ['water','fire','flying','falling','teeth','chase','death','baby','school','exam','snake','car','house','door','window','animal','forest','mountain','ocean','mirror'];
    
    const words = text.toLowerCase().replace(/[^a-zA-Z\s]/g, '').split(/\s+/);
    const freq = {};
    words.forEach(w => {
        if (!stopWords.includes(w) && w.length > 2) {
            freq[w] = (freq[w] || 0) + 1;
        }
    });
    // Top recurring words
    const sorted = Object.entries(freq).sort((a,b) => b[1]-a[1]);
    const topWords = sorted.slice(0,5).map(([w,c]) => `${w} (${c})`).join(', ');
    // Emotions
    const foundEmotions = emotionWords.filter(e => words.includes(e));
    // Symbols
    const foundSymbols = symbolWords.filter(s => words.includes(s));
    return {
        topWords: topWords || 'None',
        emotions: foundEmotions.length ? foundEmotions.join(', ') : 'None',
        symbols: foundSymbols.length ? foundSymbols.join(', ') : 'None'
    };
}

function renderHistory() {
    const dreams = getDreams();
    if (dreams.length === 0) {
        historyDiv.innerHTML = '<em>No dreams logged yet.</em>';
        return;
    }
    let html = '<ul>';
    dreams.slice().reverse().forEach(({dream, analysis, date}, idx) => {
        html += `<li><strong>${date}</strong>: <span title="${dream}">${dream.length > 40 ? dream.slice(0,40)+'...' : dream}</span><br>
        <small>Words: ${analysis.topWords} | Emotions: ${analysis.emotions} | Symbols: ${analysis.symbols}</small></li>`;
    });
    html += '</ul>';
    // Pattern summary
    const allWords = dreams.flatMap(d => d.dream.toLowerCase().replace(/[^a-zA-Z\s]/g, '').split(/\s+/));
    const freq = {};
    allWords.forEach(w => {
        if (w.length > 2) freq[w] = (freq[w] || 0) + 1;
    });
    const sorted = Object.entries(freq).sort((a,b) => b[1]-a[1]);
    const topOverall = sorted.slice(0,5).map(([w,c]) => `${w} (${c})`).join(', ');
    html += `<div class="pattern-summary"><strong>Top recurring words overall:</strong> ${topOverall || 'None'}</div>`;
    historyDiv.innerHTML = html;
}

analyzeBtn.addEventListener('click', () => {
    const text = dreamInput.value.trim();
    if (!text) {
        resultsDiv.innerHTML = '<span style="color:red">Please enter your dream description.</span>';
        return;
    }
    const analysis = analyzeDream(text);
    resultsDiv.innerHTML = `<strong>Top Words:</strong> ${analysis.topWords}<br>
        <strong>Emotions:</strong> ${analysis.emotions}<br>
        <strong>Symbols:</strong> ${analysis.symbols}`;
    saveDream(text, analysis);
    renderHistory();
    dreamInput.value = '';
});

// Initial render
renderHistory();
