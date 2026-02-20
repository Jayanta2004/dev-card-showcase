// Book Reading Progress Tracker
const addBookForm = document.getElementById('add-book-form');
const booksListDiv = document.getElementById('books-list');

let books = JSON.parse(localStorage.getItem('books') || '[]');

function saveBooks() {
    localStorage.setItem('books', JSON.stringify(books));
}

function renderBooks() {
    booksListDiv.innerHTML = '';
    books.forEach((book, idx) => {
        const div = document.createElement('div');
        div.className = 'book-entry';
        const percent = Math.min(100, Math.round((book.currentPage / book.totalPages) * 100));
        div.innerHTML = `
            <span class="book-title">${book.title}</span>
            <span class="book-author">by ${book.author}</span>
            <div class="progress-bar-bg">
                <div class="progress-bar" style="width:${percent}%;"></div>
            </div>
            <div class="progress-info">${book.currentPage} / ${book.totalPages} pages (${percent}%)</div>
            <div class="goal-date">Goal: ${book.goalDate}</div>
            <form class="update-form" data-idx="${idx}">
                <input type="number" min="0" max="${book.totalPages}" value="${book.currentPage}" required>
                <button type="submit">Update</button>
            </form>
        `;
        booksListDiv.appendChild(div);
    });
    // Add event listeners for update forms
    document.querySelectorAll('.update-form').forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const idx = parseInt(form.getAttribute('data-idx'));
            const input = form.querySelector('input');
            books[idx].currentPage = Math.min(books[idx].totalPages, Math.max(0, parseInt(input.value)));
            saveBooks();
            renderBooks();
        });
    });
}

addBookForm.addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const totalPages = parseInt(document.getElementById('total-pages').value);
    const goalDate = document.getElementById('goal-date').value;
    books.push({
        title,
        author,
        totalPages,
        goalDate,
        currentPage: 0
    });
    saveBooks();
    renderBooks();
    addBookForm.reset();
});

// Initial render
renderBooks();
