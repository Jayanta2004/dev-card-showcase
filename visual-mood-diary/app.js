// Mood Diary App
const moodColors = {
    '😊': '#f6d365',
    '😢': '#90caf9',
    '😡': '#ef5350',
    '😌': '#a5d6a7',
    '😱': '#ffd54f',
    '😍': '#f06292'
};

function getToday() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
}

function saveMoodEntry(entry) {
    let entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
    entries.push(entry);
    localStorage.setItem('moodEntries', JSON.stringify(entries));
}

function getMoodEntries() {
    return JSON.parse(localStorage.getItem('moodEntries') || '[]');
}

function renderHistory() {
    const entries = getMoodEntries().slice(-10).reverse();
    const list = document.getElementById('mood-history');
    list.innerHTML = '';
    entries.forEach(e => {
        const li = document.createElement('li');
        li.innerHTML = `<span style="font-size:1.3em;">${e.emoji}</span> <span>${e.date}</span> <span>${e.note ? '— ' + e.note : ''}</span>`;
        list.appendChild(li);
    });
}

function renderChart() {
    const entries = getMoodEntries();
    const moodCounts = {};
    entries.forEach(e => {
        moodCounts[e.emoji] = (moodCounts[e.emoji] || 0) + 1;
    });
    const ctx = document.getElementById('moodChart').getContext('2d');
    if (window.moodChartObj) window.moodChartObj.destroy();
    window.moodChartObj = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(moodCounts),
            datasets: [{
                label: 'Mood Frequency',
                data: Object.values(moodCounts),
                backgroundColor: Object.keys(moodCounts).map(e => moodColors[e] || '#fda085')
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, precision: 0 } }
        }
    });
}

function renderWordCloud() {
    const entries = getMoodEntries();
    const words = {};
    entries.forEach(e => {
        if (e.note) {
            e.note.split(/\s+/).forEach(word => {
                word = word.toLowerCase();
                if (word.length > 2) words[word] = (words[word] || 0) + 1;
            });
        }
    });
    const wordArray = Object.entries(words).map(([text, weight]) => [text, weight]);
    WordCloud(document.getElementById('wordcloud'), {
        list: wordArray.length ? wordArray : [['mood', 1]],
        gridSize: 18,
        weightFactor: 8,
        color: '#f76b1c',
        backgroundColor: '#fff',
        rotateRatio: 0.2
    });
}

document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    });
});

document.getElementById('log-mood').addEventListener('click', function() {
    const emojiBtn = document.querySelector('.emoji-btn.selected');
    const note = document.getElementById('mood-note').value.trim();
    if (!emojiBtn) {
        alert('Please select an emoji for your mood!');
        return;
    }
    const entry = {
        emoji: emojiBtn.dataset.emoji,
        note: note,
        date: getToday()
    };
    saveMoodEntry(entry);
    document.getElementById('mood-note').value = '';
    document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
    renderHistory();
    renderChart();
    renderWordCloud();
});

window.onload = function() {
    renderHistory();
    renderChart();
    renderWordCloud();
};
