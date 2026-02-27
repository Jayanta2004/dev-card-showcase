// Entry point for Decentralized Book Exchange
// App logic for book listing, lending/borrowing, and reputation

// --- Data Model ---
let books = JSON.parse(localStorage.getItem('books') || '[]');
let borrows = JSON.parse(localStorage.getItem('borrows') || '[]');
let users = JSON.parse(localStorage.getItem('users') || '{}'); // {username: {reputation: 0, borrows: 0, lends: 0, returns: 0}}

// --- UI Elements ---
const bookForm = document.getElementById('book-form');
const booksContent = document.getElementById('books-content');
const borrowsContent = document.getElementById('borrows-content');
const reputationContent = document.getElementById('reputation-content');

// --- Utility Functions ---
function saveBooks() { localStorage.setItem('books', JSON.stringify(books)); }
function saveBorrows() { localStorage.setItem('borrows', JSON.stringify(borrows)); }
function saveUsers() { localStorage.setItem('users', JSON.stringify(users)); }

function addBook(title, author, owner) {
	books.push({ title, author, owner, available: true, borrower: null });
	if (!users[owner]) users[owner] = { reputation: 0, borrows: 0, lends: 0, returns: 0 };
	users[owner].lends++;
	saveBooks(); saveUsers();
	updateBooks();
	updateReputation();
}

function borrowBook(idx, borrower) {
	if (!users[borrower]) users[borrower] = { reputation: 0, borrows: 0, lends: 0, returns: 0 };
	if (!books[idx].available) return;
	books[idx].available = false;
	books[idx].borrower = borrower;
	borrows.push({ ...books[idx], idx, date: new Date().toISOString().slice(0,10) });
	users[borrower].borrows++;
	saveBooks(); saveBorrows(); saveUsers();
	updateBooks();
	updateBorrows();
	updateReputation();
}

function returnBook(idx, borrower) {
	if (!books[idx] || books[idx].available || books[idx].borrower !== borrower) return;
	books[idx].available = true;
	books[idx].borrower = null;
	users[borrower].returns++;
	users[borrower].reputation += 1;
	saveBooks(); saveUsers();
	updateBooks();
	updateBorrows();
	updateReputation();
}

function removeBook(idx, owner) {
	if (books[idx].owner !== owner) return;
	books.splice(idx, 1);
	saveBooks();
	updateBooks();
	updateBorrows();
}

// --- UI Update Functions ---
function updateBooks() {
	if (books.length === 0) {
		booksContent.innerHTML = '<em>No books listed yet.</em>';
		return;
	}
	let html = '';
	books.forEach((b, idx) => {
		html += `<div class="book-card">
			<h3>${b.title}</h3>
			<div><small>${b.author}</small></div>
			<div class="owner">Owner: ${b.owner}</div>
			<div>Status: ${b.available ? '<span style=\'color:green\'>Available</span>' : `<span style=\'color:#e24a2a\'>Borrowed by ${b.borrower}</span>`}</div>
			<input type="text" class="borrower-name" placeholder="Your Name" maxlength="24" style="margin-top:8px;" />
			<button class="borrow-btn" data-idx="${idx}" ${!b.available ? 'disabled' : ''}>Borrow</button>
			<button class="remove-btn" data-idx="${idx}">Remove</button>
		</div>`;
	});
	booksContent.innerHTML = html;
	// Attach event listeners
	document.querySelectorAll('.borrow-btn').forEach(btn => {
		btn.addEventListener('click', function() {
			const idx = parseInt(this.getAttribute('data-idx'));
			const name = this.parentElement.querySelector('.borrower-name').value.trim();
			if (!name) { alert('Enter your name to borrow.'); return; }
			borrowBook(idx, name);
		});
	});
	document.querySelectorAll('.remove-btn').forEach(btn => {
		btn.addEventListener('click', function() {
			const idx = parseInt(this.getAttribute('data-idx'));
			const owner = books[idx].owner;
			const name = prompt('Enter your name to confirm removal:');
			if (name && name === owner) removeBook(idx, owner);
			else alert('Only the owner can remove this book.');
		});
	});
}

function updateBorrows() {
	if (borrows.length === 0) {
		borrowsContent.innerHTML = '<em>No books borrowed yet.</em>';
		return;
	}
	let html = '<ul>';
	borrows.forEach((b, i) => {
		if (!b.available) {
			html += `<li><b>${b.title}</b> by ${b.author} (Owner: ${b.owner}) - Borrowed on ${b.date} <button class="return-btn" data-idx="${b.idx}">Return</button></li>`;
		}
	});
	html += '</ul>';
	borrowsContent.innerHTML = html;
	document.querySelectorAll('.return-btn').forEach(btn => {
		btn.addEventListener('click', function() {
			const idx = parseInt(this.getAttribute('data-idx'));
			const borrower = books[idx].borrower;
			const name = prompt('Enter your name to confirm return:');
			if (name && name === borrower) returnBook(idx, borrower);
			else alert('Only the borrower can return this book.');
		});
	});
}

function updateReputation() {
	if (Object.keys(users).length === 0) {
		reputationContent.innerHTML = '<em>No community activity yet.</em>';
		return;
	}
	let html = '<table style="width:100%;border-collapse:collapse;">';
	html += '<tr style="background:#f0f4f8;"><th>User</th><th>Reputation</th><th>Borrows</th><th>Lends</th><th>Returns</th></tr>';
	Object.keys(users).forEach(u => {
		const user = users[u];
		html += `<tr><td>${u}</td><td>${user.reputation}</td><td>${user.borrows}</td><td>${user.lends}</td><td>${user.returns}</td></tr>`;
	});
	html += '</table>';
	reputationContent.innerHTML = html;
}

// --- Event Listeners ---
if (bookForm) {
	bookForm.addEventListener('submit', function(e) {
		e.preventDefault();
		const title = document.getElementById('book-title').value.trim();
		const author = document.getElementById('book-author').value.trim();
		const owner = document.getElementById('book-owner').value.trim();
		if (!title || !author || !owner) {
			alert('Please enter all book details.');
			return;
		}
		addBook(title, author, owner);
		bookForm.reset();
	});
}

// --- Initial Render ---
updateBooks();
updateBorrows();
updateReputation();
