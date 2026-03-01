// Language Learning Progress Tracker
let logs = JSON.parse(localStorage.getItem('languageLogs') || '[]');
let selectedLanguage = localStorage.getItem('selectedLanguage') || 'English';

document.getElementById('language-dropdown').value = selectedLanguage;
document.getElementById('language-dropdown').onchange = function() {
    selectedLanguage = this.value;
    localStorage.setItem('selectedLanguage', selectedLanguage);
    renderStudyLog();
    renderProgressChart();
    renderStreaks();
    renderReminders();
};

document.getElementById('log-btn').onclick = function() {
    const vocab = document.getElementById('vocab-input').value.split(',').map(v => v.trim()).filter(v => v);
    const grammar = document.getElementById('grammar-input').value.split(',').map(g => g.trim()).filter(g => g);
    const practice = document.getElementById('practice-input').value.trim();
    const date = document.getElementById('entry-date').value || new Date().toISOString().split('T')[0];
    if (!vocab.length && !grammar.length && !practice) {
        alert('Please fill at least one field.');
        return;
    }
    logs.push({ language: selectedLanguage, vocab, grammar, practice, date });
    localStorage.setItem('languageLogs', JSON.stringify(logs));
    renderStudyLog();
    renderProgressChart();
    renderStreaks();
    renderReminders();
};

function renderStudyLog() {
    const logDiv = document.getElementById('study-log');
    logDiv.innerHTML = '';
    logs.filter(l => l.language === selectedLanguage).forEach(l => {
        const card = document.createElement('div');
        card.className = 'study-card';
        card.innerHTML = `<b>${l.date}</b><br><small>${l.practice}</small><br><span>Vocab: ${l.vocab.join(', ')}</span><br><span>Grammar: ${l.grammar.join(', ')}</span>`;
        logDiv.appendChild(card);
    });
}

function renderProgressChart() {
    const canvas = document.getElementById('progress-chart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,600,300);
    const filtered = logs.filter(l => l.language === selectedLanguage);
    ctx.fillStyle = '#4f8cff';
    filtered.forEach((l, idx) => {
        ctx.fillRect(idx*20+40, 300-l.vocab.length*10, 16, l.vocab.length*10);
        ctx.font = 'bold 14px Segoe UI';
        ctx.fillStyle = '#333';
        ctx.fillText(l.date, idx*20+40, 290);
    });
}

function renderStreaks() {
    const streakDiv = document.getElementById('streak-info');
    const filtered = logs.filter(l => l.language === selectedLanguage);
    let streak = 0;
    let lastDate = null;
    filtered.forEach(l => {
        const d = new Date(l.date);
        if (lastDate && (d - lastDate === 86400000)) {
            streak++;
        } else {
            streak = 1;
        }
        lastDate = d;
    });
    streakDiv.innerHTML = `<b>Current Streak:</b> ${streak} days`;
}

function renderReminders() {
    const remindersDiv = document.getElementById('repetition-reminders');
    const filtered = logs.filter(l => l.language === selectedLanguage);
    let reminders = [];
    filtered.forEach(l => {
        l.vocab.forEach(v => {
            reminders.push(`Review: ${v} (added ${l.date})`);
        });
    });
    remindersDiv.innerHTML = reminders.slice(-5).map(r => `<div>${r}</div>`).join('');
}

document.getElementById('export-csv-btn').onclick = function() {
    let csv = 'Language,Date,Vocab,Grammar,Practice\n';
    logs.forEach(l => {
        csv += `${l.language},${l.date},${l.vocab.join('|')},${l.grammar.join('|')},${l.practice}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'language-log.csv';
    link.click();
};

document.getElementById('export-json-btn').onclick = function() {
    const json = JSON.stringify(logs, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'language-log.json';
    link.click();
};

renderStudyLog();
renderProgressChart();
renderStreaks();
renderReminders();