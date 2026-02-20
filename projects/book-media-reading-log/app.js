// Book & Media Reading Log
let log = JSON.parse(localStorage.getItem('readingLog') || '[]');
let goal = parseInt(localStorage.getItem('readingGoal') || '0');
let covers = {};

function renderLog() {
    const logEntries = document.getElementById('log-entries');
    logEntries.innerHTML = '';
    log.forEach((entry, idx) => {
        const card = document.createElement('div');
        card.className = 'log-card';
        if (entry.cover) {
            card.innerHTML += `<img src="${entry.cover}" alt="Cover">`;
        }
        card.innerHTML += `<b>${entry.title}</b><br><small>${entry.author} (${entry.type})</small><br><span>${entry.genres.join(', ')}</span><br>`;
        card.innerHTML += `<div class="progress-bar"><div class="progress" style="width:${Math.min(100, Math.round(100*entry.progress/entry.pages))}%"></div></div>`;
        card.innerHTML += `<small>${entry.progress}/${entry.pages} pages</small><br><small>Added: ${entry.date}</small>`;
        logEntries.appendChild(card);
    });
}

function renderGoal() {
    const goalProgress = document.getElementById('goal-progress');
    if (!goal || goal === 0) {
        goalProgress.textContent = 'No goal set.';
        return;
    }
    const completed = log.filter(e => e.progress >= e.pages).length;
    goalProgress.innerHTML = `<b>${completed}</b> / <b>${goal}</b> completed`;
    goalProgress.innerHTML += `<div class="progress-bar"><div class="progress" style="width:${Math.min(100, Math.round(100*completed/goal))}%"></div></div>`;
}

function renderTimeline() {
    const timeline = document.getElementById('timeline-visual');
    timeline.innerHTML = '';
    log.forEach(entry => {
        const dot = document.createElement('div');
        dot.className = 'timeline-dot';
        dot.title = `${entry.title} (${entry.date})`;
        dot.textContent = entry.title[0].toUpperCase();
        timeline.appendChild(dot);
    });
}

document.getElementById('add-btn').onclick = function() {
    const title = document.getElementById('title-input').value.trim();
    const author = document.getElementById('author-input').value.trim();
    const type = document.getElementById('type-input').value.trim();
    const genres = document.getElementById('genre-input').value.split(',').map(g => g.trim()).filter(g => g);
    const pages = parseInt(document.getElementById('pages-input').value);
    const progress = parseInt(document.getElementById('progress-input').value);
    const coverInput = document.getElementById('cover-input');
    if (!title || !author || !type || !pages || isNaN(progress)) {
        alert('Please fill all fields.');
        return;
    }
    let cover = '';
    if (coverInput.files && coverInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            cover = e.target.result;
            addEntry({ title, author, type, genres, pages, progress, cover, date: new Date().toLocaleDateString() });
        };
        reader.readAsDataURL(coverInput.files[0]);
    } else {
        addEntry({ title, author, type, genres, pages, progress, cover: '', date: new Date().toLocaleDateString() });
    }
};

function addEntry(entry) {
    log.push(entry);
    localStorage.setItem('readingLog', JSON.stringify(log));
    renderLog();
    renderGoal();
    renderTimeline();
}

document.getElementById('set-goal-btn').onclick = function() {
    goal = parseInt(document.getElementById('goal-input').value);
    localStorage.setItem('readingGoal', goal);
    renderGoal();
};

document.getElementById('export-json-btn').onclick = function() {
    const json = JSON.stringify(log, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'reading-log.json';
    link.click();
};

document.getElementById('export-csv-btn').onclick = function() {
    let csv = 'Title,Author,Type,Genres,Pages,Progress,Date\n';
    log.forEach(e => {
        csv += `${e.title},${e.author},${e.type},${e.genres.join('|')},${e.pages},${e.progress},${e.date}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'reading-log.csv';
    link.click();
};

document.getElementById('share-btn').onclick = function() {
    const completed = log.filter(e => e.progress >= e.pages).length;
    const stats = `I have completed ${completed} out of ${goal || 'my'} reading goals!`;
    navigator.clipboard.writeText(stats);
    alert('Stats copied to clipboard!');
};

renderLog();
renderGoal();
renderTimeline();