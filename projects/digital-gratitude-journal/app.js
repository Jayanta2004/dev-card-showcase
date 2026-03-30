// Digital Gratitude Journal
const form = document.getElementById('gratitude-form');
const entryInput = document.getElementById('entry');
const entryList = document.getElementById('entry-list');
const shareBtn = document.getElementById('share-btn');
const trendChart = document.getElementById('trend-chart');

let entries = JSON.parse(localStorage.getItem('gratitudeEntries') || '[]');

function renderEntries() {
    entryList.innerHTML = '';
    entries.forEach((entry, idx) => {
        const li = document.createElement('li');
        li.textContent = `${entry.date}: ${entry.text}`;
        entryList.appendChild(li);
    });
}

function addEntry(text) {
    const date = new Date().toLocaleDateString();
    entries.push({ date, text });
    localStorage.setItem('gratitudeEntries', JSON.stringify(entries));
    renderEntries();
    renderTrend();
}

form.addEventListener('submit', e => {
    e.preventDefault();
    const text = entryInput.value.trim();
    if (text) {
        addEntry(text);
        entryInput.value = '';
    }
});

shareBtn.addEventListener('click', () => {
    if (entries.length === 0) return alert('No entries to share!');
    const latest = entries[entries.length - 1];
    navigator.clipboard.writeText(`${latest.date}: ${latest.text}`);
    alert('Latest entry copied to clipboard!');
});

function renderTrend() {
    // Simple trend: count entries per day
    const data = {};
    entries.forEach(entry => {
        data[entry.date] = (data[entry.date] || 0) + 1;
    });
    const labels = Object.keys(data);
    const values = Object.values(data);
    if (trendChart) {
        const ctx = trendChart.getContext('2d');
        ctx.clearRect(0, 0, trendChart.width, trendChart.height);
        // Draw a simple bar chart
        const max = Math.max(...values, 1);
        const barWidth = trendChart.width / labels.length;
        values.forEach((v, i) => {
            ctx.fillStyle = '#4caf50';
            ctx.fillRect(i * barWidth, trendChart.height - (v / max) * trendChart.height, barWidth - 4, (v / max) * trendChart.height);
            ctx.fillStyle = '#333';
            ctx.fillText(labels[i], i * barWidth + 2, trendChart.height - 4);
        });
    }
}

trendChart.width = 400;
trendChart.height = 150;
renderEntries();
renderTrend();