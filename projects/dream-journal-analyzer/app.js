// Dream Journal Analyzer - app.js

const dreamInput = document.getElementById('dreamInput');
const tagsInput = document.getElementById('tagsInput');
const addDreamBtn = document.getElementById('addDreamBtn');
const dreamList = document.getElementById('dreamList');
const searchInput = document.getElementById('searchInput');
const insightsDiv = document.getElementById('insights');
const patternsChart = document.getElementById('patternsChart');

let dreams = JSON.parse(localStorage.getItem('dreams') || '[]');

function saveDreams() {
    localStorage.setItem('dreams', JSON.stringify(dreams));
}

function addDream(text, tags) {
    const date = new Date().toLocaleDateString();
    dreams.unshift({ text, tags, date });
    saveDreams();
    renderDreams();
    analyzeDreams();
}

function renderDreams(filter = '') {
    dreamList.innerHTML = '';
    dreams.filter(dream => {
        const search = filter.toLowerCase();
        return dream.text.toLowerCase().includes(search) || dream.tags.join(',').toLowerCase().includes(search);
    }).forEach(dream => {
        const li = document.createElement('li');
        li.innerHTML = `<div>${dream.text}</div>
            <div class="tags">${dream.tags.map(t => `#${t}`).join(' ')}</div>
            <div class="date">${dream.date}</div>`;
        dreamList.appendChild(li);
    });
}

function analyzeDreams() {
    // Simple NLP: extract most common words, tags, and basic mood
    const allText = dreams.map(d => d.text).join(' ').toLowerCase();
    const words = allText.match(/\b[a-z]{4,}\b/g) || [];
    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    const sorted = Object.entries(freq).sort((a,b) => b[1]-a[1]);
    const topWords = sorted.slice(0, 5).map(([w]) => w);
    // Mood: count positive/negative words
    const positive = ['happy','love','excited','peace','joy','fun','safe','beautiful','calm','hope'];
    const negative = ['fear','sad','angry','lost','cry','danger','dark','pain','stress','worry'];
    let moodScore = 0;
    words.forEach(w => {
        if (positive.includes(w)) moodScore++;
        if (negative.includes(w)) moodScore--;
    });
    let mood = 'Neutral';
    if (moodScore > 2) mood = 'Positive';
    else if (moodScore < -2) mood = 'Negative';
    // Tag frequency
    const tagFreq = {};
    dreams.forEach(d => d.tags.forEach(t => tagFreq[t] = (tagFreq[t]||0)+1));
    const tagLabels = Object.keys(tagFreq);
    const tagData = tagLabels.map(t => tagFreq[t]);
    // Show insights
    insightsDiv.innerHTML = `
        <b>Most common themes:</b> ${topWords.join(', ') || 'N/A'}<br>
        <b>Overall mood:</b> ${mood}<br>
        <b>Dreams logged:</b> ${dreams.length}
    `;
    // Chart
    if (window.patternsChartObj) window.patternsChartObj.destroy();
    window.patternsChartObj = new Chart(patternsChart, {
        type: 'bar',
        data: {
            labels: tagLabels,
            datasets: [{
                label: 'Tag Frequency',
                data: tagData,
                backgroundColor: '#3a7bd5',
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

addDreamBtn.onclick = () => {
    const text = dreamInput.value.trim();
    const tags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean);
    if (!text) return;
    addDream(text, tags);
    dreamInput.value = '';
    tagsInput.value = '';
};

searchInput.oninput = () => {
    renderDreams(searchInput.value);
};

// Initial render
renderDreams();
analyzeDreams();
