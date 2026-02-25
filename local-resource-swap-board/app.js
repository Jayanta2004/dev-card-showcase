// Local Resource Swap Board
// Author: EWOC Contributors
// Description: Users list and request items to borrow or swap (e.g., tools, books, kitchen gadgets)

const lendForm = document.getElementById('lendForm');
const borrowForm = document.getElementById('borrowForm');
const confirmation = document.getElementById('confirmation');
const lendListDiv = document.getElementById('lendList');
const borrowListDiv = document.getElementById('borrowList');

const STORAGE_KEY = 'resourceSwapBoard';

function getData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { lend: [], borrow: [] };
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function renderLendList() {
    const data = getData();
    if (!data.lend.length) {
        lendListDiv.innerHTML = '<em>No items listed to lend yet.</em>';
        return;
    }
    lendListDiv.innerHTML = data.lend.slice().reverse().map((l, idx) =>
        `<div class="lend-card">
            <b>${escapeHtml(l.name)}</b> can lend <b>${escapeHtml(l.item)}</b>
            <button onclick="proposeBorrow(${data.lend.length-1-idx})">Request to Borrow</button>
        </div>`
    ).join('');
}

function renderBorrowList() {
    const data = getData();
    if (!data.borrow.length) {
        borrowListDiv.innerHTML = '<em>No borrow requests yet.</em>';
        return;
    }
    borrowListDiv.innerHTML = data.borrow.slice().reverse().map((b, idx) =>
        `<div class="borrow-card">
            <b>${escapeHtml(b.name)}</b> wants to borrow <b>${escapeHtml(b.item)}</b>
            <button onclick="proposeLend(${data.borrow.length-1-idx})">Offer to Lend</button>
        </div>`
    ).join('');
}

window.proposeBorrow = function(idx) {
    const data = getData();
    const lend = data.lend[idx];
    const user = prompt('Enter your name (to request this item):');
    if (!user) return;
    confirmation.textContent = `Borrow request sent to ${lend.name}!`;
    confirmation.classList.remove('hidden');
    setTimeout(() => confirmation.classList.add('hidden'), 2000);
};

window.proposeLend = function(idx) {
    const data = getData();
    const borrow = data.borrow[idx];
    const user = prompt('Enter your name (to offer this item):');
    if (!user) return;
    confirmation.textContent = `Lend offer sent to ${borrow.name}!`;
    confirmation.classList.remove('hidden');
    setTimeout(() => confirmation.classList.add('hidden'), 2000);
};

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

lendForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = lendForm.lendName.value.trim();
    const item = lendForm.lendItem.value.trim();
    if (!name || !item) return;
    const data = getData();
    data.lend.push({ name, item });
    saveData(data);
    confirmation.textContent = 'Item listed to lend!';
    confirmation.classList.remove('hidden');
    lendForm.reset();
    renderLendList();
    setTimeout(() => confirmation.classList.add('hidden'), 2000);
});

borrowForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = borrowForm.borrowName.value.trim();
    const item = borrowForm.borrowItem.value.trim();
    if (!name || !item) return;
    const data = getData();
    data.borrow.push({ name, item });
    saveData(data);
    confirmation.textContent = 'Borrow request posted!';
    confirmation.classList.remove('hidden');
    borrowForm.reset();
    renderBorrowList();
    setTimeout(() => confirmation.classList.add('hidden'), 2000);
});

// Initial load
renderLendList();
renderBorrowList();
