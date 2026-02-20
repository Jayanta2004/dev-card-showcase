// Language Learning Progress Tracker
// Uses Chart.js for practice analytics

const vocabForm = document.getElementById('vocab-form');
const vocabListDiv = document.getElementById('vocab-list');
const grammarForm = document.getElementById('grammar-form');
const grammarListDiv = document.getElementById('grammar-list');
const practiceForm = document.getElementById('practice-form');
const practiceListDiv = document.getElementById('practice-list');
const practiceChartCanvas = document.getElementById('practice-chart');

let vocab = JSON.parse(localStorage.getItem('vocab') || '[]');
let grammar = JSON.parse(localStorage.getItem('grammar') || '[]');
let practice = JSON.parse(localStorage.getItem('practice') || '[]');

function saveData() {
    localStorage.setItem('vocab', JSON.stringify(vocab));
    localStorage.setItem('grammar', JSON.stringify(grammar));
    localStorage.setItem('practice', JSON.stringify(practice));
}

function renderVocab() {
    vocabListDiv.innerHTML = '';
    vocab.slice().reverse().forEach(v => {
        const div = document.createElement('div');
        div.className = 'vocab-entry';
        div.innerHTML = `
            <span class="vocab-word">${v.word}</span>
            <span class="vocab-meaning">${v.meaning}</span>
        `;
        vocabListDiv.appendChild(div);
    });
}

function renderGrammar() {
    grammarListDiv.innerHTML = '';
    grammar.slice().reverse().forEach(g => {
        const div = document.createElement('div');
        div.className = 'grammar-entry';
        div.innerHTML = `
            <span class="grammar-topic">${g.topic}</span>
            <span class="grammar-notes">${g.notes}</span>
        `;
        grammarListDiv.appendChild(div);
    });
}

function renderPractice() {
    practiceListDiv.innerHTML = '';
    practice.slice().reverse().forEach(p => {
        const div = document.createElement('div');
        div.className = 'practice-entry';
        div.innerHTML = `
            <span class="practice-date">${p.date}</span>
            <span class="practice-type">${p.type}</span>
            <span class="practice-minutes">${p.minutes} min</span>
        `;
        practiceListDiv.appendChild(div);
    });
}

function renderPracticeChart() {
    if (window.practiceChart) window.practiceChart.destroy();
    // Group by date, sum minutes
    const dateTotals = {};
    practice.forEach(p => {
        dateTotals[p.date] = (dateTotals[p.date] || 0) + parseInt(p.minutes);
    });
    const dates = Object.keys(dateTotals).sort();
    const totals = dates.map(d => dateTotals[d]);
    window.practiceChart = new Chart(practiceChartCanvas, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Practice Minutes',
                data: totals,
                backgroundColor: '#185a9d',
                borderRadius: 8
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, ticks: { color: '#185a9d' } },
                x: { ticks: { color: '#43cea2' } }
            }
        }
    });
}

vocabForm.addEventListener('submit', e => {
    e.preventDefault();
    const word = document.getElementById('vocab-word').value.trim();
    const meaning = document.getElementById('vocab-meaning').value.trim();
    vocab.push({ word, meaning });
    saveData();
    renderVocab();
    vocabForm.reset();
});

grammarForm.addEventListener('submit', e => {
    e.preventDefault();
    const topic = document.getElementById('grammar-topic').value.trim();
    const notes = document.getElementById('grammar-notes').value.trim();
    grammar.push({ topic, notes });
    saveData();
    renderGrammar();
    grammarForm.reset();
});

practiceForm.addEventListener('submit', e => {
    e.preventDefault();
    const date = document.getElementById('practice-date').value;
    const type = document.getElementById('practice-type').value.trim();
    const minutes = parseInt(document.getElementById('practice-minutes').value);
    practice.push({ date, type, minutes });
    saveData();
    renderPractice();
    renderPracticeChart();
    practiceForm.reset();
});

// Initial render
renderVocab();
renderGrammar();
renderPractice();
renderPracticeChart();
