const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const recommendationsDiv = document.getElementById('recommendations');
const favoritesList = document.getElementById('favorites-list');
const readingList = document.getElementById('reading-list');

let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let reading = JSON.parse(localStorage.getItem('reading') || '[]');

function saveLists() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    localStorage.setItem('reading', JSON.stringify(reading));
}

function renderList(list, element, removeHandler) {
    element.innerHTML = '';
    list.forEach((book, idx) => {
        const li = document.createElement('li');
        li.textContent = `${book.title} by ${book.authors}`;
        li.setAttribute('tabindex', '0');
        li.setAttribute('role', 'listitem');
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.setAttribute('aria-label', `Remove ${book.title} by ${book.authors}`);
        removeBtn.onclick = () => removeHandler(idx);
        removeBtn.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                removeHandler(idx);
            }
        };
        li.appendChild(removeBtn);
        element.appendChild(li);
    });
}

function renderFavorites() {
    renderList(favorites, favoritesList, idx => {
        favorites.splice(idx, 1);
        saveLists();
        renderFavorites();
    });
}

function renderReading() {
    renderList(reading, readingList, idx => {
        reading.splice(idx, 1);
        saveLists();
        renderReading();
    });
}

function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'region');
    card.setAttribute('aria-label', `${book.title} by ${book.authors}`);
    const title = document.createElement('div');
    title.className = 'book-title';
    title.textContent = book.title;
    const authors = document.createElement('div');
    authors.className = 'book-authors';
    authors.textContent = book.authors;
    const actions = document.createElement('div');
    actions.className = 'book-actions';
    const favBtn = document.createElement('button');
    favBtn.textContent = 'Add to Favorites';
    favBtn.setAttribute('aria-label', `Add ${book.title} by ${book.authors} to favorites`);
    favBtn.onclick = () => {
        if (!favorites.some(b => b.id === book.id)) {
            favorites.push(book);
            saveLists();
            renderFavorites();
        }
    };
    favBtn.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!favorites.some(b => b.id === book.id)) {
                favorites.push(book);
                saveLists();
                renderFavorites();
            }
        }
    };
    const readBtn = document.createElement('button');
    readBtn.textContent = 'Add to Reading List';
    readBtn.className = 'reading';
    readBtn.setAttribute('aria-label', `Add ${book.title} by ${book.authors} to reading list`);
    readBtn.onclick = () => {
        if (!reading.some(b => b.id === book.id)) {
            reading.push(book);
            saveLists();
            renderReading();
        }
    };
    readBtn.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!reading.some(b => b.id === book.id)) {
                reading.push(book);
                saveLists();
                renderReading();
            }
        }
    };
    actions.appendChild(favBtn);
    actions.appendChild(readBtn);
    card.appendChild(title);
    card.appendChild(authors);
    card.appendChild(actions);
    return card;
}

searchForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;
    recommendationsDiv.innerHTML = '<em>Searching...</em>';
    // Use Google Books API for demo
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`);
    const data = await res.json();
    if (!data.items || data.items.length === 0) {
        recommendationsDiv.innerHTML = '<em>No books found.</em>';
        return;
    }
    recommendationsDiv.innerHTML = '';
    data.items.forEach(item => {
        const info = item.volumeInfo;
        const book = {
            id: item.id,
            title: info.title || 'Untitled',
            authors: (info.authors || ['Unknown']).join(', ')
        };
        recommendationsDiv.appendChild(createBookCard(book));
    });
});

// Initial render
renderFavorites();
renderReading();
