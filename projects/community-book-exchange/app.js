// Community Book Exchange
// Features: List books to give/borrow, arrange swaps, requests, modals, localStorage, modern UI
// Author: Ayaanshaikh12243

// --- DATA ---
let books = JSON.parse(localStorage.getItem('cbxBooks') || 'null') || [
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', owner: 'You', type: 'give', location: 'Downtown', desc: 'Classic novel, paperback, good condition.' },
    { title: '1984', author: 'George Orwell', owner: 'Alice', type: 'borrow', location: 'Westside', desc: 'Looking to borrow for a month.' },
    { title: 'To Kill a Mockingbird', author: 'Bob', type: 'give', author: 'Harper Lee', location: 'Eastside', desc: 'Hardcover, like new.' }
];
let swapRequests = JSON.parse(localStorage.getItem('cbxSwaps') || 'null') || [
    { bookTitle: '1984', from: 'You', to: 'Alice', status: 'pending', message: 'Hi Alice, I can lend you my copy!' }
];
const user = 'You';

// --- DOM ELEMENTS ---
const addBookBtn = document.getElementById('addBookBtn');
const myBooksBtn = document.getElementById('myBooksBtn');
const browseBtn = document.getElementById('browseBtn');
const swapRequestsBtn = document.getElementById('swapRequestsBtn');
const aboutBtn = document.getElementById('aboutBtn');
const browseSection = document.getElementById('browseSection');
const myBooksSection = document.getElementById('myBooksSection');
const swapRequestsSection = document.getElementById('swapRequestsSection');
const aboutSection = document.getElementById('aboutSection');
const bookList = document.getElementById('bookList');
const myBookList = document.getElementById('myBookList');
const swapRequestList = document.getElementById('swapRequestList');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');

// --- NAVIGATION ---
addBookBtn.onclick = () => showAddBookModal();
myBooksBtn.onclick = () => showSection('myBooks');
browseBtn.onclick = () => showSection('browse');
swapRequestsBtn.onclick = () => showSection('swapRequests');
aboutBtn.onclick = () => showSection('about');
closeModal.onclick = hideModal;
modal.onclick = (e) => { if (e.target.id === 'modal') hideModal(); };

function showSection(section) {
    browseSection.classList.add('hidden');
    myBooksSection.classList.add('hidden');
    swapRequestsSection.classList.add('hidden');
    aboutSection.classList.add('hidden');
    if (section === 'browse') browseSection.classList.remove('hidden');
    if (section === 'myBooks') myBooksSection.classList.remove('hidden');
    if (section === 'swapRequests') swapRequestsSection.classList.remove('hidden');
    if (section === 'about') aboutSection.classList.remove('hidden');
    if (section === 'browse') renderBookList();
    if (section === 'myBooks') renderMyBookList();
    if (section === 'swapRequests') renderSwapRequests();
}

// --- BOOK LIST ---
function renderBookList() {
    bookList.innerHTML = '';
    books.forEach((book, idx) => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <span class="book-title">${book.title}</span>
            <span class="book-meta">by ${book.author}</span>
            <span class="book-meta">${book.type === 'give' ? 'Giving Away' : 'Wants to Borrow'}</span>
            <span class="book-meta">Owner: ${book.owner}</span>
            <span class="book-meta">Location: ${book.location}</span>
            <span class="book-meta">${book.desc}</span>
            <div class="book-actions">
                <button onclick="showBookDetails(${idx})">Details</button>
                ${book.owner !== user ? `<button onclick="requestSwap(${idx})">Request Swap</button>` : ''}
                ${book.owner === user ? `<button onclick="editBook(${idx})">Edit</button><button onclick="deleteBook(${idx})">Delete</button>` : ''}
            </div>
        `;
        bookList.appendChild(card);
    });
}
window.showBookDetails = function(idx) {
    const book = books[idx];
    modalBody.innerHTML = `
        <h2>${book.title}</h2>
        <p><b>Author:</b> ${book.author}</p>
        <p><b>Type:</b> ${book.type === 'give' ? 'Giving Away' : 'Wants to Borrow'}</p>
        <p><b>Owner:</b> ${book.owner}</p>
        <p><b>Location:</b> ${book.location}</p>
        <p>${book.desc}</p>
    `;
    showModal();
};
window.editBook = function(idx) {
    showAddBookModal(books[idx], idx);
};
window.deleteBook = function(idx) {
    if (confirm('Delete this book?')) {
        books.splice(idx, 1);
        localStorage.setItem('cbxBooks', JSON.stringify(books));
        renderBookList();
        renderMyBookList();
    }
};

// --- ADD/EDIT BOOK MODAL ---
function showAddBookModal(book = null, idx = null) {
    modalBody.innerHTML = `
        <h2>${book ? 'Edit' : 'Add'} Book</h2>
        <input id="bookTitle" placeholder="Title" value="${book ? book.title : ''}" style="width:100%;margin-bottom:8px;">
        <input id="bookAuthor" placeholder="Author" value="${book ? book.author : ''}" style="width:100%;margin-bottom:8px;">
        <select id="bookType" style="width:100%;margin-bottom:8px;">
            <option value="give" ${book && book.type === 'give' ? 'selected' : ''}>Giving Away</option>
            <option value="borrow" ${book && book.type === 'borrow' ? 'selected' : ''}>Wants to Borrow</option>
        </select>
        <input id="bookLocation" placeholder="Location" value="${book ? book.location : ''}" style="width:100%;margin-bottom:8px;">
        <textarea id="bookDesc" placeholder="Description" style="width:100%;margin-bottom:8px;">${book ? book.desc : ''}</textarea>
        <button onclick="submitBook(${idx !== null ? idx : ''})">${book ? 'Save' : 'Add'} Book</button>
    `;
    showModal();
}
window.submitBook = function(idx) {
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const type = document.getElementById('bookType').value;
    const location = document.getElementById('bookLocation').value.trim();
    const desc = document.getElementById('bookDesc').value.trim();
    if (!title || !author || !type || !location) {
        alert('Please fill all required fields.');
        return;
    }
    const book = { title, author, owner: user, type, location, desc };
    if (idx !== undefined && idx !== null && books[idx]) {
        books[idx] = book;
    } else {
        books.push(book);
    }
    localStorage.setItem('cbxBooks', JSON.stringify(books));
    renderBookList();
    renderMyBookList();
    hideModal();
};

// --- MY BOOKS ---
function renderMyBookList() {
    myBookList.innerHTML = '';
    const myBooks = books.filter(b => b.owner === user);
    if (myBooks.length === 0) {
        myBookList.innerHTML = '<p>No books listed yet. Add your first book!</p>';
        return;
    }
    myBooks.forEach((book, idx) => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <span class="book-title">${book.title}</span>
            <span class="book-meta">by ${book.author}</span>
            <span class="book-meta">${book.type === 'give' ? 'Giving Away' : 'Wants to Borrow'}</span>
            <span class="book-meta">Location: ${book.location}</span>
            <span class="book-meta">${book.desc}</span>
            <div class="book-actions">
                <button onclick="editBook(${books.indexOf(book)})">Edit</button>
                <button onclick="deleteBook(${books.indexOf(book)})">Delete</button>
            </div>
        `;
        myBookList.appendChild(card);
    });
}

// --- SWAP REQUESTS ---
function renderSwapRequests() {
    swapRequestList.innerHTML = '';
    const mySwaps = swapRequests.filter(r => r.from === user || r.to === user);
    if (mySwaps.length === 0) {
        swapRequestList.innerHTML = '<p>No swap requests yet.</p>';
        return;
    }
    mySwaps.forEach((req, idx) => {
        const card = document.createElement('div');
        card.className = 'swap-card';
        card.innerHTML = `
            <b>Book:</b> ${req.bookTitle}<br>
            <b>From:</b> ${req.from}<br>
            <b>To:</b> ${req.to}<br>
            <b>Status:</b> ${req.status}<br>
            <b>Message:</b> ${req.message}<br>
            ${req.to === user && req.status === 'pending' ? `<button onclick="respondSwap(${idx},'accepted')">Accept</button><button onclick="respondSwap(${idx},'declined')">Decline</button>` : ''}
        `;
        swapRequestList.appendChild(card);
    });
}
window.requestSwap = function(idx) {
    const book = books[idx];
    modalBody.innerHTML = `
        <h2>Request Swap</h2>
        <p>Request <b>${book.title}</b> from <b>${book.owner}</b>?</p>
        <textarea id="swapMsg" placeholder="Message (optional)" style="width:100%;margin-bottom:8px;"></textarea>
        <button onclick="submitSwapRequest(${idx})">Send Request</button>
    `;
    showModal();
};
window.submitSwapRequest = function(idx) {
    const book = books[idx];
    const message = document.getElementById('swapMsg').value.trim();
    swapRequests.push({ bookTitle: book.title, from: user, to: book.owner, status: 'pending', message });
    localStorage.setItem('cbxSwaps', JSON.stringify(swapRequests));
    renderSwapRequests();
    hideModal();
    alert('Swap request sent!');
};
window.respondSwap = function(idx, status) {
    swapRequests[idx].status = status;
    localStorage.setItem('cbxSwaps', JSON.stringify(swapRequests));
    renderSwapRequests();
    alert('Swap request ' + status + '.');
};

// --- MODAL LOGIC ---
function showModal() {
    modal.classList.remove('hidden');
}
function hideModal() {
    modal.classList.add('hidden');
    modalBody.innerHTML = '';
}

// --- INIT ---
function init() {
    renderBookList();
    renderMyBookList();
    renderSwapRequests();
    showSection('browse');
}
init();

// --- EXTENSIONS: More Features ---
// 1. User profiles
// 2. Book cover images
// 3. Search/filter books
// 4. Swap history
// 5. Notifications
// 6. Ratings/reviews
// 7. Export/import data
// 8. Accessibility improvements
// 9. Animations and UI transitions
// 10. Data validation and error handling
// ... (This file can be extended further as needed)
