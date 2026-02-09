// Movie & TV Watchlist Manager
let watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');

function renderWatchlist() {
    const listDiv = document.getElementById('watchlist');
    listDiv.innerHTML = '';
    watchlist.forEach(w => {
        const card = document.createElement('div');
        card.className = 'watch-card';
        card.innerHTML += `<b>${w.title}</b><br><span>${w.genres.join(', ')}</span><br>`;
        if (w.episodes) {
            card.innerHTML += `<div class="progress-bar"><div class="progress" style="width:${Math.min(100, Math.round(100*w.progress/w.episodes))}%"></div></div>`;
            card.innerHTML += `<small>${w.progress}/${w.episodes} episodes</small><br>`;
        }
        card.innerHTML += `<small>Rating: ${w.rating}/10</small><br>`;
        card.innerHTML += `<p>${w.review}</p>`;
        card.innerHTML += `<small>Reminder: ${w.reminder || 'None'}</small>`;
        listDiv.appendChild(card);
    });
}

document.getElementById('add-btn').onclick = function() {
    const title = document.getElementById('title-input').value.trim();
    const genres = document.getElementById('genre-input').value.split(',').map(g => g.trim()).filter(g => g);
    const episodes = parseInt(document.getElementById('episodes-input').value);
    const progress = parseInt(document.getElementById('progress-input').value);
    const rating = parseInt(document.getElementById('rating-input').value);
    const review = document.getElementById('review-input').value.trim();
    const reminder = document.getElementById('reminder-input').value;
    if (!title || !genres.length || isNaN(rating)) {
        alert('Please fill all required fields.');
        return;
    }
    watchlist.push({ title, genres, episodes, progress, rating, review, reminder });
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    renderWatchlist();
    renderReminders();
};

function renderReminders() {
    const remindersDiv = document.getElementById('calendar-reminders');
    remindersDiv.innerHTML = '';
    watchlist.forEach(w => {
        if (w.reminder) {
            remindersDiv.innerHTML += `<div><b>${w.title}</b>: ${w.reminder}</div>`;
        }
    });
}

document.getElementById('export-json-btn').onclick = function() {
    const json = JSON.stringify(watchlist, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'watchlist.json';
    link.click();
};

document.getElementById('export-csv-btn').onclick = function() {
    let csv = 'Title,Genres,Episodes,Progress,Rating,Review,Reminder\n';
    watchlist.forEach(w => {
        csv += `${w.title},${w.genres.join('|')},${w.episodes || ''},${w.progress || ''},${w.rating},"${w.review.replace(/\n/g,' ')}",${w.reminder || ''}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'watchlist.csv';
    link.click();
};

document.getElementById('share-btn').onclick = function() {
    const titles = watchlist.map(w => w.title).join(', ');
    navigator.clipboard.writeText(`My Watchlist: ${titles}`);
    alert('Watchlist copied to clipboard!');
};

renderWatchlist();
renderReminders();