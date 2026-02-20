// FlashcardPDF - Main JavaScript

// Global Variables
let flashcards = [];
let selectedCards = new Set();
let currentTemplate = 'simple';
let currentCardSize = '3x5';
let cardsPerPage = 6;
let currentPreviewPage = 1;
let totalPreviewPages = 1;
let zoomLevel = 100;

// Sample flashcards for demo
const sampleFlashcards = [
    {
        id: 1,
        front: "Photosynthesis",
        back: "The process by which plants convert sunlight, water, and carbon dioxide into glucose and oxygen.",
        category: "science",
        difficulty: "medium"
    },
    {
        id: 2,
        front: "Mitochondria",
        back: "The powerhouse of the cell, responsible for producing ATP through cellular respiration.",
        category: "science",
        difficulty: "easy"
    },
    {
        id: 3,
        front: "JavaScript",
        back: "A programming language that enables interactive web pages and is an essential part of web applications.",
        category: "programming",
        difficulty: "easy"
    },
    {
        id: 4,
        front: "GDP",
        back: "Gross Domestic Product - The total value of goods produced and services provided in a country during one year.",
        category: "economics",
        difficulty: "medium"
    },
    {
        id: 5,
        front: "Photosynthesis Equation",
        back: "6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂",
        category: "science",
        difficulty: "hard"
    }
];

// DOM Elements
const dom = {
    // Navigation
    saveProjectBtn: document.getElementById('saveProjectBtn'),
    exportBtn: document.getElementById('exportBtn'),
    
    // Sidebar inputs
    flashcardSetName: document.getElementById('flashcardSetName'),
    flashcardSubject: document.getElementById('flashcardSubject'),
    cardCount: document.getElementById('cardCount'),
    cardsPerPage: document.getElementById('cardsPerPage'),
    sizeOptions: document.querySelectorAll('.size-option'),
    
    // Quick add form
    frontText: document.getElementById('frontText'),
    backText: document.getElementById('backText'),
    clearFieldsBtn: document.getElementById('clearFieldsBtn'),
    addCardBtn: document.getElementById('addCardBtn'),
    
    // Import buttons
    importCSVBtn: document.getElementById('importCSVBtn'),
    importTextBtn: document.getElementById('importTextBtn'),
    importImageBtn: document.getElementById('importImageBtn'),
    
    // Templates
    templateCards: document.querySelectorAll('.template-card'),
    
    // Print settings
    cutLines: document.getElementById('cutLines'),
    pageNumbers: document.getElementById('pageNumbers'),
    doubleSided: document.getElementById('doubleSided'),
    includeAnswers: document.getElementById('includeAnswers'),
    paperSize: document.getElementById('paperSize'),
    marginSize: document.getElementById('marginSize'),
    
    // Cards container
    cardsContainer: document.getElementById('cardsContainer'),
    totalCards: document.getElementById('totalCards'),
    cardPages: document.getElementById('cardPages'),
    
    // Bulk actions
    selectAllBtn: document.getElementById('selectAllBtn'),
    deleteSelectedBtn: document.getElementById('deleteSelectedBtn'),
    reorderBtn: document.getElementById('reorderBtn'),
    duplicateBtn: document.getElementById('duplicateBtn'),
    addSampleBtn: document.getElementById('addSampleBtn'),
    
    // Preview controls
    zoomOutBtn: document.getElementById('zoomOutBtn'),
    zoomInBtn: document.getElementById('zoomInBtn'),
    zoomLevel: document.getElementById('zoomLevel'),
    previewPage: document.getElementById('previewPage'),
    prevPageBtn: document.getElementById('prevPageBtn'),
    nextPageBtn: document.getElementById('nextPageBtn'),
    currentPage: document.getElementById('currentPage'),
    totalPages: document.getElementById('totalPages'),
    previewContainer: document.getElementById('previewContainer'),
    
    // Export buttons
    exportPDFBtn: document.getElementById('exportPDFBtn'),
    exportImageBtn: document.getElementById('exportImageBtn'),
    shareBtn: document.getElementById('shareBtn'),
    printBtn: document.getElementById('printBtn'),
    
    // Modals
    importModal: document.getElementById('importModal'),
    studyModal: document.getElementById('studyModal'),
    modalCloses: document.querySelectorAll('.modal-close'),
    
    // Import modal elements
    importTabs: document.querySelectorAll('.tab-btn'),
    importTabContents: document.querySelectorAll('.import-tab'),
    csvDropArea: document.getElementById('csvDropArea'),
    csvFileInput: document.getElementById('csvFileInput'),
    csvPreview: document.getElementById('csvPreview'),
    textInput: document.getElementById('textInput'),
    textSeparator: document.getElementById('textSeparator'),
    customSeparator: document.getElementById('customSeparator'),
    imagesDropArea: document.getElementById('imagesDropArea'),
    imagesFileInput: document.getElementById('imagesFileInput'),
    imagesPreview: document.getElementById('imagesPreview'),
    cancelImportBtn: document.getElementById('cancelImportBtn'),
    confirmImportBtn: document.getElementById('confirmImportBtn'),
    
    // Study modal elements
    studyCard: document.getElementById('studyCard'),
    studyFront: document.getElementById('studyFront'),
    studyBack: document.getElementById('studyBack'),
    prevStudyBtn: document.getElementById('prevStudyBtn'),
    flipCardBtn: document.getElementById('flipCardBtn'),
    nextStudyBtn: document.getElementById('nextStudyBtn'),
    studyProgress: document.getElementById('studyProgress'),
    studyProgressFill: document.getElementById('studyProgressFill'),
    shuffleCards: document.getElementById('shuffleCards'),
    autoFlip: document.getElementById('autoFlip'),
    studyMode: document.getElementById('studyMode'),
    ratingButtons: document.querySelectorAll('.rating-btn')
};

// Initialize the application
function init() {
    setupEventListeners();
    loadSampleData();
    updateCardStats();
    renderCards();
    setupDragAndDrop();
    updatePreview();
}

// Setup event listeners
function setupEventListeners() {
    // Navigation buttons
    dom.saveProjectBtn.addEventListener('click', saveProject);
    dom.exportBtn.addEventListener('click', exportPDF);
    
    // Sidebar inputs
    dom.flashcardSetName.addEventListener('input', updateSetName);
    dom.cardCount.addEventListener('change', updateCardCount);
    dom.cardsPerPage.addEventListener('change', updateCardsPerPage);
    
    // Size options
    dom.sizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            dom.sizeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            currentCardSize = this.dataset.size;
            updatePreview();
        });
    });
    
    // Quick add form
    dom.clearFieldsBtn.addEventListener('click', clearFormFields);
    dom.addCardBtn.addEventListener('click', addFlashcardFromForm);
    
    // Import buttons
    dom.importCSVBtn.addEventListener('click', () => showModal(dom.importModal));
    dom.importTextBtn.addEventListener('click', () => {
        showModal(dom.importModal);
        switchImportTab('text');
    });
    dom.importImageBtn.addEventListener('click', () => {
        showModal(dom.importModal);
        switchImportTab('images');
    });
    
    // Templates
    dom.templateCards.forEach(card => {
        card.addEventListener('click', function() {
            dom.templateCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            currentTemplate = this.dataset.template;
            updatePreview();
        });
    });
    
    // Print settings
    dom.cutLines.addEventListener('change', updatePreview);
    dom.pageNumbers.addEventListener('change', updatePreview);
    dom.doubleSided.addEventListener('change', updatePreview);
    dom.includeAnswers.addEventListener('change', updatePreview);
    dom.paperSize.addEventListener('change', updatePreview);
    dom.marginSize.addEventListener('change', updatePreview);
    
    // Bulk actions
    dom.selectAllBtn.addEventListener('click', selectAllCards);
    dom.deleteSelectedBtn.addEventListener('click', deleteSelectedCards);
    dom.reorderBtn.addEventListener('click', reorderCards);
    dom.duplicateBtn.addEventListener('click', duplicateSet);
    dom.addSampleBtn.addEventListener('click', addSampleCards);
    
    // Preview controls
    dom.zoomOutBtn.addEventListener('click', () => adjustZoom(-20));
    dom.zoomInBtn.addEventListener('click', () => adjustZoom(20));
    dom.previewPage.addEventListener('change', changePreviewPage);
    dom.prevPageBtn.addEventListener('click', prevPreviewPage);
    dom.nextPageBtn.addEventListener('click', nextPreviewPage);
    
    // Export buttons
    dom.exportPDFBtn.addEventListener('click', generatePDF);
    dom.exportImageBtn.addEventListener('click', exportAsImage);
    dom.shareBtn.addEventListener('click', shareFlashcards);
    dom.printBtn.addEventListener('click', printFlashcards);
    
    // Modal controls
    dom.modalCloses.forEach(close => {
        close.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Import modal
    dom.importTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            switchImportTab(tabId);
        });
    });
    
    dom.csvFileInput.addEventListener('change', handleCSVUpload);
    dom.csvDropArea.addEventListener('click', () => dom.csvFileInput.click());
    
    dom.textSeparator.addEventListener('change', function() {
        const isCustom = this.value === 'custom';
        dom.customSeparator.style.display = isCustom ? 'block' : 'none';
        if (isCustom) dom.customSeparator.focus();
    });
    
    dom.imagesFileInput.addEventListener('change', handleImageUpload);
    dom.imagesDropArea.addEventListener('click', () => dom.imagesFileInput.click());
    
    dom.cancelImportBtn.addEventListener('click', () => hideModal(dom.importModal));
    dom.confirmImportBtn.addEventListener('click', confirmImport);
    
    // Study mode
    dom.prevStudyBtn.addEventListener('click', prevStudyCard);
    dom.flipCardBtn.addEventListener('click', flipStudyCard);
    dom.nextStudyBtn.addEventListener('click', nextStudyCard);
    dom.studyCard.addEventListener('click', flipStudyCard);
    
    dom.ratingButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            rateStudyCard(parseInt(this.dataset.rating));
        });
    });
    
    // Auto-save on changes
    document.addEventListener('input', autoSave);
}

// Setup drag and drop for cards
function setupDragAndDrop() {
    const cardsContainer = dom.cardsContainer;
    
    let draggedCard = null;
    
    cardsContainer.addEventListener('dragstart', function(e) {
        if (e.target.classList.contains('flashcard-item')) {
            draggedCard = e.target;
            e.target.classList.add('dragging');
        }
    });
    
    cardsContainer.addEventListener('dragend', function(e) {
        if (draggedCard) {
            draggedCard.classList.remove('dragging');
            draggedCard = null;
        }
    });
    
    cardsContainer.addEventListener('dragover', function(e) {
        e.preventDefault();
        const afterElement = getDragAfterElement(cardsContainer, e.clientY);
        const draggable = document.querySelector('.dragging');
        
        if (afterElement == null) {
            cardsContainer.appendChild(draggable);
        } else {
            cardsContainer.insertBefore(draggable, afterElement);
        }
        
        // Update card order in array
        updateCardOrder();
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.flashcard-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Load sample data
function loadSampleData() {
    flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
    
    if (flashcards.length === 0) {
        // Add sample cards if no saved data
        flashcards = [...sampleFlashcards];
        saveToLocalStorage();
    }
}

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
    localStorage.setItem('setName', dom.flashcardSetName.value);
    localStorage.setItem('subject', dom.flashcardSubject.value);
}

// Auto-save function
function autoSave() {
    setTimeout(saveToLocalStorage, 1000);
}

// Update card statistics
function updateCardStats() {
    const total = flashcards.length;
    const pages = Math.ceil(total / cardsPerPage);
    
    dom.totalCards.textContent = `${total} card${total !== 1 ? 's' : ''}`;
    dom.cardPages.textContent = `${pages} page${pages !== 1 ? 's' : ''}`;
}

// Render flashcards
function renderCards() {
    dom.cardsContainer.innerHTML = '';
    
    if (flashcards.length === 0) {
        dom.cardsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-layer-group"></i>
                <h3>No flashcards yet</h3>
                <p>Add your first flashcard using the form on the left</p>
                <button class="btn-primary" id="addSampleBtn">
                    <i class="fas fa-magic"></i> Add Sample Cards
                </button>
            </div>
        `;
        
        // Re-add event listener to sample button
        document.getElementById('addSampleBtn').addEventListener('click', addSampleCards);
        return;
    }
    
    flashcards.forEach((card, index) => {
        const cardElement = createCardElement(card, index + 1);
        dom.cardsContainer.appendChild(cardElement);
    });
    
    updateCardStats();
}

function createCardElement(card, number) {
    const cardElement = document.createElement('div');
    cardElement.className = 'flashcard-item';
    cardElement.draggable = true;
    cardElement.dataset.id = card.id;
    
    if (selectedCards.has(card.id)) {
        cardElement.classList.add('selected');
    }
    
    cardElement.innerHTML = `
        <div class="card-header">
            <div class="card-number">${number}</div>
            <div class="card-actions">
                <button class="card-action-btn edit-card" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="card-action-btn delete-card" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="card-action-btn select-card" title="Select">
                    <i class="fas fa-check"></i>
                </button>
            </div>
        </div>
        <div class="card-content">
            <div class="card-front-content">${escapeHtml(card.front)}</div>
            <div class="card-back-content">${escapeHtml(card.back)}</div>
        </div>
        <div class="card-footer">
            <div class="card-category">${card.category || 'General'}</div>
            <div class="card-difficulty ${card.difficulty || 'medium'}">
                ${card.difficulty || 'Medium'}
            </div>
        </div>
    `;
    
    // Add event listeners
    const editBtn = cardElement.querySelector('.edit-card');
    const deleteBtn = cardElement.querySelector('.delete-card');
    const selectBtn = cardElement.querySelector('.select-card');
    
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        editCard(card.id);
    });
    
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteCard(card.id);
    });
    
    selectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSelectCard(card.id);
    });
    
    cardElement.addEventListener('click', (e) => {
        if (!e.target.closest('.card-actions')) {
            toggleSelectCard(card.id);
        }
    });
    
    return cardElement;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add flashcard from form
function addFlashcardFromForm() {
    const front = dom.frontText.value.trim();
    const back = dom.backText.value.trim();
    
    if (!front || !back) {
        alert('Please enter both front and back text.');
        return;
    }
    
    const newCard = {
        id: Date.now(),
        front: front,
        back: back,
        category: dom.flashcardSubject.value,
        difficulty: 'medium'
    };
    
    flashcards.push(newCard);
    saveToLocalStorage();
    renderCards();
    updatePreview();
    clearFormFields();
    
    // Scroll to new card
    const cardsContainer = dom.cardsContainer;
    cardsContainer.scrollTop = cardsContainer.scrollHeight;
}

function clearFormFields() {
    dom.frontText.value = '';
    dom.backText.value = '';
    dom.frontText.focus();
}

// Edit card
function editCard(cardId) {
    const card = flashcards.find(c => c.id === cardId);
    if (!card) return;
    
    // For simplicity, we'll just delete and re-add
    // In a more advanced version, you could show an edit modal
    dom.frontText.value = card.front;
    dom.backText.value = card.back;
    dom.flashcardSubject.value = card.category || 'general';
    
    deleteCard(cardId);
    
    // Scroll to form
    document.querySelector('.quick-add').scrollIntoView({ behavior: 'smooth' });
    dom.frontText.focus();
}

// Delete card
function deleteCard(cardId) {
    if (confirm('Are you sure you want to delete this flashcard?')) {
        flashcards = flashcards.filter(c => c.id !== cardId);
        selectedCards.delete(cardId);
        saveToLocalStorage();
        renderCards();
        updatePreview();
        updateDeleteButton();
    }
}

// Toggle card selection
function toggleSelectCard(cardId) {
    if (selectedCards.has(cardId)) {
        selectedCards.delete(cardId);
    } else {
        selectedCards.add(cardId);
    }
    
    const cardElement = document.querySelector(`.flashcard-item[data-id="${cardId}"]`);
    if (cardElement) {
        cardElement.classList.toggle('selected');
    }
    
    updateDeleteButton();
}

function selectAllCards() {
    selectedCards.clear();
    flashcards.forEach(card => selectedCards.add(card.id));
    
    document.querySelectorAll('.flashcard-item').forEach(card => {
        card.classList.add('selected');
    });
    
    updateDeleteButton();
}

function deleteSelectedCards() {
    if (selectedCards.size === 0) return;
    
    if (confirm(`Delete ${selectedCards.size} selected card(s)?`)) {
        flashcards = flashcards.filter(card => !selectedCards.has(card.id));
        selectedCards.clear();
        saveToLocalStorage();
        renderCards();
        updatePreview();
        updateDeleteButton();
    }
}

function updateDeleteButton() {
    dom.deleteSelectedBtn.disabled = selectedCards.size === 0;
    if (selectedCards.size > 0) {
        dom.deleteSelectedBtn.innerHTML = `<i class="fas fa-trash"></i> Delete (${selectedCards.size})`;
    } else {
        dom.deleteSelectedBtn.innerHTML = `<i class="fas fa-trash"></i> Delete Selected`;
    }
}

function reorderCards() {
    // Simple alphabetical sort by front text
    flashcards.sort((a, b) => a.front.localeCompare(b.front));
    saveToLocalStorage();
    renderCards();
    updatePreview();
}

function duplicateSet() {
    if (flashcards.length === 0) return;
    
    const duplicated = flashcards.map(card => ({
        ...card,
        id: Date.now() + Math.random()
    }));
    
    flashcards = [...flashcards, ...duplicated];
    saveToLocalStorage();
    renderCards();
    updatePreview();
    
    alert(`Duplicated ${duplicated.length} cards. Total: ${flashcards.length} cards`);
}

function addSampleCards() {
    flashcards = [...flashcards, ...sampleFlashcards.map(card => ({
        ...card,
        id: Date.now() + Math.random()
    }))];
    
    saveToLocalStorage();
    renderCards();
    updatePreview();
    
    alert('Added sample flashcards to your set!');
}

// Update card order after drag and drop
function updateCardOrder() {
    const cardElements = document.querySelectorAll('.flashcard-item');
    const newOrder = [];
    
    cardElements.forEach(element => {
        const cardId = parseInt(element.dataset.id);
        const card = flashcards.find(c => c.id === cardId);
        if (card) newOrder.push(card);
    });
    
    flashcards = newOrder;
    saveToLocalStorage();
}

// Update set name
function updateSetName() {
    saveToLocalStorage();
}

function updateCardCount() {
    const count = parseInt(dom.cardCount.value);
    const currentCount = flashcards.length;
    
    if (count > currentCount) {
        // Add empty cards
        const toAdd = count - currentCount;
        for (let i = 0; i < toAdd; i++) {
            flashcards.push({
                id: Date.now() + i,
                front: `New Card ${currentCount + i + 1}`,
                back: 'Enter definition here...',
                category: dom.flashcardSubject.value,
                difficulty: 'medium'
            });
        }
    } else if (count < currentCount) {
        // Remove cards from end
        flashcards.splice(count);
    }
    
    saveToLocalStorage();
    renderCards();
    updatePreview();
}

function updateCardsPerPage() {
    cardsPerPage = parseInt(dom.cardsPerPage.value);
    updateCardStats();
    updatePreview();
}

// Preview functions
function updatePreview() {
    if (flashcards.length === 0) {
        dom.previewContainer.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-file-pdf"></i>
                <h3>PDF Preview</h3>
                <p>Your flashcards will appear here as a printable PDF</p>
                <div class="preview-info">
                    <div class="info-item">
                        <i class="fas fa-print"></i>
                        <span>Ready for printing</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-cut"></i>
                        <span>Cut lines included</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-palette"></i>
                        <span>Customizable templates</span>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    totalPreviewPages = Math.ceil(flashcards.length / cardsPerPage);
    updatePreviewNavigation();
    
    // Generate preview HTML
    const previewHTML = generatePreviewHTML();
    dom.previewContainer.innerHTML = previewHTML;
    
    // Apply zoom
    applyZoom();
}

function generatePreviewHTML() {
    const pages = [];
    
    for (let page = 0; page < totalPreviewPages; page++) {
        const startIdx = page * cardsPerPage;
        const endIdx = startIdx + cardsPerPage;
        const pageCards = flashcards.slice(startIdx, endIdx);
        
        const pageHTML = `
            <div class="preview-page ${currentTemplate}" data-page="${page + 1}">
                ${generatePageHeader(page + 1)}
                <div class="cards-grid" style="grid-template-columns: repeat(${Math.ceil(Math.sqrt(cardsPerPage))}, 1fr);">
                    ${pageCards.map((card, idx) => generateCardPreview(card, startIdx + idx + 1)).join('')}
                </div>
                ${generatePageFooter(page + 1)}
            </div>
        `;
        
        pages.push(pageHTML);
    }
    
    return pages.join('');
}

function generatePageHeader(pageNumber) {
    const setName = dom.flashcardSetName.value || 'My Study Set';
    const subject = dom.flashcardSubject.value || 'General';
    
    return `
        <div class="page-header">
            <h2 class="set-name">${escapeHtml(setName)}</h2>
            <div class="page-meta">
                <span class="subject">${subject}</span>
                <span class="page-number">Page ${pageNumber} of ${totalPreviewPages}</span>
            </div>
        </div>
    `;
}

function generateCardPreview(card, number) {
    const cardSize = getCardSizeClass();
    
    return `
        <div class="preview-card ${cardSize}">
            <div class="card-number-preview">${number}</div>
            <div class="card-front-preview">
                <div class="card-content-preview">${escapeHtml(card.front)}</div>
                <div class="card-label-preview">FRONT</div>
            </div>
            ${dom.includeAnswers.checked ? `
                <div class="card-back-preview">
                    <div class="card-content-preview">${escapeHtml(card.back)}</div>
                    <div class="card-label-preview">BACK</div>
                </div>
            ` : ''}
            ${dom.cutLines.checked ? '<div class="cut-line"></div>' : ''}
        </div>
    `;
}

function generatePageFooter(pageNumber) {
    return `
        <div class="page-footer">
            ${dom.pageNumbers.checked ? `<div class="footer-page-number">${pageNumber}</div>` : ''}
            <div class="footer-info">Generated with FlashcardPDF</div>
        </div>
    `;
}

function getCardSizeClass() {
    switch (currentCardSize) {
        case '3x5': return 'size-3x5';
        case '4x6': return 'size-4x6';
        case '5x8': return 'size-5x8';
        default: return 'size-3x5';
    }
}

function updatePreviewNavigation() {
    dom.currentPage.textContent = currentPreviewPage;
    dom.totalPages.textContent = totalPreviewPages;
    
    // Update page selector
    dom.previewPage.innerHTML = '';
    for (let i = 1; i <= totalPreviewPages; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Page ${i}`;
        option.selected = i === currentPreviewPage;
        dom.previewPage.appendChild(option);
    }
    
    // Update button states
    dom.prevPageBtn.disabled = currentPreviewPage === 1;
    dom.nextPageBtn.disabled = currentPreviewPage === totalPreviewPages;
}

function changePreviewPage() {
    currentPreviewPage = parseInt(dom.previewPage.value);
    updatePreviewNavigation();
    
    // Scroll to selected page
    const pageElement = document.querySelector(`.preview-page[data-page="${currentPreviewPage}"]`);
    if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function prevPreviewPage() {
    if (currentPreviewPage > 1) {
        currentPreviewPage--;
        dom.previewPage.value = currentPreviewPage;
        changePreviewPage();
    }
}

function nextPreviewPage() {
    if (currentPreviewPage < totalPreviewPages) {
        currentPreviewPage++;
        dom.previewPage.value = currentPreviewPage;
        changePreviewPage();
    }
}

function adjustZoom(amount) {
    zoomLevel = Math.max(50, Math.min(200, zoomLevel + amount));
    dom.zoomLevel.textContent = `${zoomLevel}%`;
    applyZoom();
}

function applyZoom() {
    const pages = document.querySelectorAll('.preview-page');
    pages.forEach(page => {
        page.style.transform = `scale(${zoomLevel / 100})`;
        page.style.transformOrigin = 'top center';
    });
}

// Import functions
function switchImportTab(tabId) {
    // Update tab buttons
    dom.importTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabId);
    });
    
    // Update tab content
    dom.importTabContents.forEach(tab => {
        tab.classList.toggle('active', tab.id === `${tabId}Tab`);
    });
}

function handleCSVUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const csvContent = e.target.result;
        previewCSV(csvContent);
    };
    reader.readAsText(file);
}

function previewCSV(csvContent) {
    const lines = csvContent.split('\n');
    const previewHTML = lines.slice(0, 10).map(line => {
        const cells = line.split(',').slice(0, 2); // Only show first two columns
        return `<div class="csv-line">${cells.map(cell => `<span>${escapeHtml(cell)}</span>`).join(' | ')}</div>`;
    }).join('');
    
    dom.csvPreview.innerHTML = previewHTML;
    
    if (lines.length > 10) {
        dom.csvPreview.innerHTML += `<div class="csv-more">... and ${lines.length - 10} more lines</div>`;
    }
}

function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    dom.imagesPreview.innerHTML = '';
    
    files.slice(0, 10).forEach((file, index) => {
        if (!file.type.startsWith('image/')) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'image-preview-item';
            imgContainer.innerHTML = `
                <img src="${e.target.result}" alt="Image ${index + 1}">
                <div class="image-info">
                    <span>Image ${index + 1}</span>
                    <input type="text" placeholder="Front text" class="image-front-input">
                    <input type="text" placeholder="Back text" class="image-back-input">
                </div>
            `;
            dom.imagesPreview.appendChild(imgContainer);
        };
        reader.readAsDataURL(file);
    });
    
    if (files.length > 10) {
        dom.imagesPreview.innerHTML += `<div class="images-more">... and ${files.length - 10} more images</div>`;
    }
}

function confirmImport() {
    // For simplicity, we'll just add some sample cards
    // In a real app, you would parse the imported data
    
    const importedCards = [
        {
            id: Date.now() + 1,
            front: "Imported Card 1",
            back: "This is imported data",
            category: dom.flashcardSubject.value,
            difficulty: "medium"
        },
        {
            id: Date.now() + 2,
            front: "Imported Card 2",
            back: "More imported content",
            category: dom.flashcardSubject.value,
            difficulty: "easy"
        }
    ];
    
    flashcards = [...flashcards, ...importedCards];
    saveToLocalStorage();
    renderCards();
    updatePreview();
    hideModal(dom.importModal);
    
    alert(`Imported ${importedCards.length} flashcards successfully!`);
}

// Export functions
function generatePDF() {
    alert('Generating PDF... (In a real app, this would use jsPDF library)');
    
    // Simulate PDF generation
    setTimeout(() => {
        const link = document.createElement('a');
        link.download = `${dom.flashcardSetName.value || 'flashcards'}.pdf`;
        link.href = '#';
        link.click();
        
        alert('PDF generated successfully!');
    }, 1000);
}

function exportAsImage() {
    alert('Exporting as image... (Would use html2canvas in a real app)');
}

function shareFlashcards() {
    const setName = dom.flashcardSetName.value || 'My Flashcards';
    const url = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: setName,
            text: `Check out my flashcard set: ${setName}`,
            url: url
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!');
        });
    }
}

function printFlashcards() {
    window.print();
}

function saveProject() {
    saveToLocalStorage();
    alert('Project saved successfully!');
}

function exportPDF() {
    generatePDF();
}

// Study mode functions
let currentStudyIndex = 0;
let studyCards = [];

function startStudyMode() {
    if (flashcards.length === 0) {
        alert('Add some flashcards first!');
        return;
    }
    
    studyCards = [...flashcards];
    
    if (dom.shuffleCards.checked) {
        shuffleArray(studyCards);
    }
    
    currentStudyIndex = 0;
    updateStudyCard();
    showModal(dom.studyModal);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateStudyCard() {
    if (studyCards.length === 0) return;
    
    const card = studyCards[currentStudyIndex];
    dom.studyFront.textContent = card.front;
    dom.studyBack.textContent = card.back;
    
    // Reset card to front
    dom.studyCard.classList.remove('flipped');
    
    // Update progress
    const progress = ((currentStudyIndex + 1) / studyCards.length) * 100;
    dom.studyProgress.textContent = `Card ${currentStudyIndex + 1} of ${studyCards.length}`;
    dom.studyProgressFill.style.width = `${progress}%`;
}

function prevStudyCard() {
    if (currentStudyIndex > 0) {
        currentStudyIndex--;
        updateStudyCard();
    }
}

function nextStudyCard() {
    if (currentStudyIndex < studyCards.length - 1) {
        currentStudyIndex++;
        updateStudyCard();
    } else {
        alert('You\'ve completed all cards!');
        hideModal(dom.studyModal);
    }
}

function flipStudyCard() {
    dom.studyCard.classList.toggle('flipped');
}

function rateStudyCard(rating) {
    // Update card difficulty based on rating
    const card = studyCards[currentStudyIndex];
    card.difficulty = rating === 1 ? 'hard' : rating === 2 ? 'medium' : rating === 3 ? 'easy' : 'mastered';
    
    // Move to next card
    nextStudyCard();
}

// Modal helpers
function showModal(modal) {
    modal.style.display = 'flex';
}

function hideModal(modal) {
    modal.style.display = 'none';
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);

// Add study mode button to navigation (not in original HTML)
const studyModeBtn = document.createElement('button');
studyModeBtn.className = 'btn-primary';
studyModeBtn.innerHTML = '<i class="fas fa-graduation-cap"></i> Study Mode';
studyModeBtn.addEventListener('click', startStudyMode);
document.querySelector('.user-actions').insertBefore(studyModeBtn, dom.exportBtn);

// Add CSS for preview pages
const previewCSS = `
    .preview-page {
        background: white;
        border: 1px solid #ccc;
        margin: 20px auto;
        padding: 40px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        max-width: 800px;
        page-break-after: always;
    }
    
    .page-header {
        text-align: center;
        margin-bottom: 40px;
        padding-bottom: 20px;
        border-bottom: 2px solid #e0e0e0;
    }
    
    .set-name {
        color: #2C3E50;
        margin-bottom: 10px;
    }
    
    .page-meta {
        display: flex;
        justify-content: space-between;
        color: #95A5A6;
        font-size: 0.9rem;
    }
    
    .cards-grid {
        display: grid;
        gap: 20px;
        margin-bottom: 40px;
    }
    
    .preview-card {
        position: relative;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        min-height: 200px;
        background: white;
        break-inside: avoid;
    }
    
    .size-3x5 {
        aspect-ratio: 3/5;
    }
    
    .size-4x6 {
        aspect-ratio: 2/3;
    }
    
    .size-5x8 {
        aspect-ratio: 5/8;
    }
    
    .card-number-preview {
        position: absolute;
        top: 10px;
        right: 10px;
        background: #4A6CF7;
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        font-weight: bold;
    }
    
    .card-content-preview {
        font-size: 1rem;
        line-height: 1.5;
        margin-bottom: 20px;
    }
    
    .card-label-preview {
        position: absolute;
        bottom: 10px;
        left: 20px;
        font-size: 0.8rem;
        color: #95A5A6;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .card-back-preview {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 2px dashed #e0e0e0;
    }
    
    .cut-line {
        position: absolute;
        border: 1px dashed #F44336;
        top: -1px;
        left: -1px;
        right: -1px;
        bottom: -1px;
        pointer-events: none;
    }
    
    .page-footer {
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid #e0e0e0;
        color: #95A5A6;
        font-size: 0.9rem;
    }
    
    .footer-page-number {
        margin-bottom: 10px;
        font-weight: bold;
    }
`;

const style = document.createElement('style');
style.textContent = previewCSS;
document.head.appendChild(style);