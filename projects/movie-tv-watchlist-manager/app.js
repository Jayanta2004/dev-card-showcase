// Movie & TV Watchlist Manager
const addItemForm = document.getElementById('add-item-form');
const watchlistDiv = document.getElementById('watchlist');

let watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');

function saveWatchlist() {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

function renderWatchlist() {
    watchlistDiv.innerHTML = '';
    watchlist.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'watchlist-entry';
        div.innerHTML = `
            <span class="item-title">${item.title}</span>
            <span class="item-type">${item.type}</span>
            <span class="item-year">${item.year ? item.year : ''}</span>
            <div>
                <button class="status-btn${item.completed ? ' completed' : ''}" data-idx="${idx}">${item.completed ? 'Completed' : 'Mark Completed'}</button>
            </div>
            <div class="rating">
                <label>Rating:</label>
                <input type="number" min="1" max="10" value="${item.rating || ''}" data-idx="${idx}">
            </div>
        `;
        watchlistDiv.appendChild(div);
    });
    // Add event listeners for status and rating
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = parseInt(btn.getAttribute('data-idx'));
            watchlist[idx].completed = !watchlist[idx].completed;
            saveWatchlist();
            renderWatchlist();
        });
    });
    document.querySelectorAll('.rating input').forEach(input => {
        input.addEventListener('change', e => {
            const idx = parseInt(input.getAttribute('data-idx'));
            let val = parseInt(input.value);
            if (val < 1) val = 1;
            if (val > 10) val = 10;
            watchlist[idx].rating = val;
            saveWatchlist();
            renderWatchlist();
        });
    });
}

addItemForm.addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const type = document.getElementById('type').value;
    const year = document.getElementById('year').value;
    watchlist.push({ title, type, year, completed: false, rating: null });
    saveWatchlist();
    renderWatchlist();
    addItemForm.reset();
});

// Initial render
renderWatchlist();
