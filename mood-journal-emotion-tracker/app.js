// Mood Journal & Emotion Tracker
let moods = JSON.parse(localStorage.getItem('moods') || '[]');

function renderAnalytics() {
    const analytics = document.getElementById('mood-analytics');
    const moodCounts = {};
    moods.forEach(m => {
        moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
    });
    analytics.innerHTML = Object.keys(moodCounts).map(m => `<b>${m}:</b> ${moodCounts[m]}<br>`).join('');
}

function renderTrends() {
    const canvas = document.getElementById('emotion-trends');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,600,300);
    const tags = {};
    moods.forEach(m => {
        m.emotions.forEach(e => {
            tags[e] = (tags[e] || 0) + 1;
        });
    });
    const keys = Object.keys(tags);
    ctx.fillStyle = '#4f8cff';
    keys.forEach((k, idx) => {
        ctx.fillRect(idx*60+40, 300-tags[k]*20, 40, tags[k]*20);
        ctx.font = 'bold 14px Segoe UI';
        ctx.fillStyle = '#333';
        ctx.fillText(k, idx*60+40, 290);
    });
}

function renderHeatmap() {
    const heatmap = document.getElementById('heatmap');
    heatmap.innerHTML = '';
    let days = {};
    moods.forEach(m => {
        days[m.date] = m;
    });
    const today = new Date();
    for (let i = 0; i < 28; i++) {
        const d = new Date(today.getTime() - (27-i)*86400000);
        const dateStr = d.toISOString().split('T')[0];
        const cell = document.createElement('div');
        cell.className = 'heat-cell';
        cell.textContent = d.getDate();
        if (days[dateStr]) {
            cell.setAttribute('data-mood', days[dateStr].mood);
            cell.title = `${days[dateStr].mood} (${days[dateStr].emotions.join(', ')})`;
        }
        heatmap.appendChild(cell);
    }
}

document.getElementById('log-btn').onclick = function() {
    const date = document.getElementById('mood-date').value || new Date().toISOString().split('T')[0];
    const mood = document.getElementById('mood-select').value;
    const emotions = document.getElementById('emotion-tags').value.split(',').map(e => e.trim()).filter(e => e);
    const journal = document.getElementById('journal-entry').value.trim();
    moods.push({ date, mood, emotions, journal });
    localStorage.setItem('moods', JSON.stringify(moods));
    renderAnalytics();
    renderTrends();
    renderHeatmap();
};

document.getElementById('export-csv-btn').onclick = function() {
    let csv = 'Date,Mood,Emotions,Journal\n';
    moods.forEach(m => {
        csv += `${m.date},${m.mood},${m.emotions.join('|')},"${m.journal.replace(/\n/g,' ')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mood-journal.csv';
    link.click();
};

document.getElementById('export-pdf-btn').onclick = function() {
    alert('PDF export is a placeholder. Use browser print to PDF for now.');
};

renderAnalytics();
renderTrends();
renderHeatmap();