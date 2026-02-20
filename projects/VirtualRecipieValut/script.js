/* 
  Receipt Vault - Core Logic
  Handles IndexedDB storage, Image processing, and UI interactions.
*/

// --- State & Constants ---
const DB_NAME = 'ReceiptVaultDB';
const DB_VERSION = 1;
const STORE_NAME = 'receipts';

let db;
let currentFilter = 'all';

// --- DOM Elements ---
const els = {
    addBtn: document.getElementById('addReceiptBtn'),
    modal: document.getElementById('addModal'),
    closeModalBtn: document.getElementById('closeModal'),
    receiptForm: document.getElementById('receiptForm'),
    imageInput: document.getElementById('receiptImage'),
    imagePreviewLabel: document.getElementById('imagePreviewLabel'),
    imagePreviewDisplay: document.getElementById('imagePreviewDisplay'),
    previewImg: document.getElementById('previewImg'),
    removeImageBtn: document.getElementById('removeImage'),
    receiptsGrid: document.getElementById('receiptsGrid'),
    emptyState: document.getElementById('emptyState'),
    totalDisplay: document.getElementById('monthlyTotal'),
    currentDateDisplay: document.getElementById('currentDate'),
    filterChips: document.querySelectorAll('.filter-chip'),
    dateInput: document.getElementById('date')
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initDB();
    setupEventListeners();
    updateDateDisplay();
    els.dateInput.valueAsDate = new Date(); // Default to today
});

function updateDateDisplay() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long' };
    els.currentDateDisplay.textContent = now.toLocaleDateString('en-US', options);
}

// --- IndexedDB Operations ---
function initDB() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error);
        alert("Error opening database. This app requires IndexedDB to function.");
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        loadReceipts();
    };

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            objectStore.createIndex('date', 'date', { unique: false });
            objectStore.createIndex('category', 'category', { unique: false });
        }
    };
}

function addReceiptToDB(receipt) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(receipt);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getAllReceipts() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function deleteReceiptFromDB(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// --- UI Logic ---
function setupEventListeners() {
    // Modal Toggles
    els.addBtn.addEventListener('click', () => {
        els.modal.classList.add('open');
    });

    els.closeModalBtn.addEventListener('click', () => {
        closeModal();
    });

    els.modal.addEventListener('click', (e) => {
        if (e.target === els.modal) closeModal();
    });

    // Image Handling
    els.imageInput.addEventListener('change', handleImageSelect);
    els.removeImageBtn.addEventListener('click', clearImageSelection);

    // Form Submission
    els.receiptForm.addEventListener('submit', handleFormSubmit);

    // Filters
    els.filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // UI Update
            els.filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            // Logic Update
            currentFilter = chip.dataset.category;
            loadReceipts(); // Reload list with filter
        });
    });
}

function closeModal() {
    els.modal.classList.remove('open');
    els.receiptForm.reset();
    clearImageSelection();
    els.dateInput.valueAsDate = new Date(); // Reset date to today
}

function handleImageSelect(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            els.previewImg.src = e.target.result;
            els.imagePreviewLabel.hidden = true;
            els.imagePreviewDisplay.hidden = false;
        };
        reader.readAsDataURL(file);
    }
}

function clearImageSelection() {
    els.imageInput.value = '';
    els.previewImg.src = '';
    els.imagePreviewLabel.hidden = false;
    els.imagePreviewDisplay.hidden = true;
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const category = document.querySelector('input[name="category"]:checked').value;
    const imageData = els.previewImg.src;

    if (!imageData || imageData === '') {
        alert("Please attach a receipt image.");
        return;
    }

    const newReceipt = {
        amount,
        date,
        category,
        image: imageData,
        timestamp: Date.now()
    };

    try {
        await addReceiptToDB(newReceipt);
        closeModal();
        loadReceipts();
    } catch (error) {
        console.error("Error saving receipt:", error);
        alert("Failed to save receipt.");
    }
}

async function loadReceipts() {
    try {
        const allReceipts = await getAllReceipts();

        // Filter
        const filteredReceipts = currentFilter === 'all'
            ? allReceipts
            : allReceipts.filter(r => r.category === currentFilter);

        // Sort by Date (newest first)
        filteredReceipts.sort((a, b) => new Date(b.date) - new Date(a.date));

        renderReceipts(filteredReceipts);
        updateMonthlyTotal(allReceipts); // Total always reflects real spending, or scoped to filter? 
        // Requirement says "Monthly Totals: Auto-sum expenses for the current month."
        // Usually this means ALL expenses for the month, regardless of tab filter, OR filtered view.
        // Let's make it scoped to the global month context but filtered by category if selected could be confusing.
        // Let's stick to "Current Month Total" implies ALL expenses for this month.

    } catch (error) {
        console.error("Error loading receipts:", error);
    }
}

function renderReceipts(receipts) {
    els.receiptsGrid.innerHTML = '';

    if (receipts.length === 0) {
        els.receiptsGrid.appendChild(els.emptyState);
        els.emptyState.hidden = false;
        return;
    }

    els.emptyState.hidden = true;

    receipts.forEach(receipt => {
        const card = document.createElement('div');
        card.className = 'receipt-card';
        card.innerHTML = `
            <div class="receipt-thumbnail-container">
                <img src="${receipt.image}" alt="Receipt" class="receipt-thumbnail">
            </div>
            <div class="receipt-details">
                <div class="receipt-category">${receipt.category}</div>
                <div class="receipt-amount">$${receipt.amount.toFixed(2)}</div>
                <div class="receipt-date">${formatDate(receipt.date)}</div>
            </div>
            <button class="delete-btn" onclick="deleteReceipt(${receipt.id})">
                <span class="material-symbols-rounded">delete</span>
            </button>
        `;
        els.receiptsGrid.appendChild(card);
    });
}

function updateMonthlyTotal(receipts) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const total = receipts.reduce((sum, r) => {
        const rDate = new Date(r.date);
        if (rDate.getMonth() === currentMonth && rDate.getFullYear() === currentYear) {
            return sum + r.amount;
        }
        return sum;
    }, 0);

    els.totalDisplay.textContent = `$${total.toFixed(2)}`;
}

function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Window scope for delete button click handler
window.deleteReceipt = async (id) => {
    if (confirm('Are you sure you want to delete this receipt?')) {
        try {
            await deleteReceiptFromDB(id);
            loadReceipts();
        } catch (error) {
            console.error("Error deleting receipt:", error);
        }
    }
};
