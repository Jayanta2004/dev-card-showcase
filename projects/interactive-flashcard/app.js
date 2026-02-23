// Interactive Flashcard App
// Author: Ayaanshaikh12243
// Description: Create, review, and share flashcard decks for learning

// --- State Management ---
const state = {
    decks: [], // {id, name, cards: [{id, front, back}]}
    view: 'decks',
    selectedDeck: null,
    review: {
        deckId: null,
        order: [],
        current: 0,
        flipped: false,
    },
    settings: {
        theme: 'default',
    },
};

// --- Utility Functions ---
function saveState() {
    localStorage.setItem('flashcardState', JSON.stringify(state));
}
function loadState() {
    const saved = localStorage.getItem('flashcardState');
    if (saved) {
        const parsed = JSON.parse(saved);
        state.decks = parsed.decks || [];
        state.view = parsed.view || 'decks';
        state.selectedDeck = parsed.selectedDeck || null;
        state.review = parsed.review || { deckId: null, order: [], current: 0, flipped: false };
        state.settings = parsed.settings || { theme: 'default' };
    }
}
function uuid() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// --- Navigation ---
function setView(view) {
    state.view = view;
    saveState();
    render();
}
document.getElementById('decksBtn').onclick = () => setView('decks');
document.getElementById('reviewBtn').onclick = () => setView('review');
document.getElementById('shareBtn').onclick = () => setView('share');
document.getElementById('settingsBtn').onclick = () => setView('settings');

// --- Render Functions ---
function render() {
    const main = document.getElementById('mainContent');
    switch (state.view) {
        case 'decks':
            main.innerHTML = renderDecks();
            break;
        case 'review':
            main.innerHTML = renderReview();
            break;
        case 'share':
            main.innerHTML = renderShare();
            break;
        case 'settings':
            main.innerHTML = renderSettings();
            break;
    }
    attachEventListeners();
}

// --- Decks View ---
function renderDecks() {
    let html = `<h2>Decks</h2>
        <form id="deckForm">
            <input type="text" id="deckName" placeholder="Deck Name" required />
            <button type="submit">Add Deck</button>
        </form>
        <div class="deck-list">
            ${state.decks.map(deck => `
                <div class="deck-item" data-id="${deck.id}">
                    <span style="font-weight:bold;">${deck.name}</span>
                    <span>Cards: ${deck.cards.length}</span>
                    <div class="actions">
                        <button class="edit-deck">Edit</button>
                        <button class="delete-deck">Delete</button>
                        <button class="manage-cards">Cards</button>
                    </div>
                </div>
            `).join('')}
        </div>
        <div id="cardsManager"></div>`;
    return html;
}

// --- Cards Manager ---
function renderCardsManager(deckId) {
    const deck = state.decks.find(d => d.id === deckId);
    if (!deck) return '';
    let html = `<h3>Manage Cards for ${deck.name}</h3>
        <form id="cardForm">
            <input type="text" id="cardFront" placeholder="Front" required />
            <input type="text" id="cardBack" placeholder="Back" required />
            <button type="submit">Add Card</button>
        </form>
        <div class="flashcard-list">
            ${deck.cards.map(card => `
                <div class="flashcard-item" data-id="${card.id}">
                    <span><strong>Q:</strong> ${card.front}</span>
                    <span><strong>A:</strong> ${card.back}</span>
                    <div class="actions">
                        <button class="edit-card">Edit</button>
                        <button class="delete-card">Delete</button>
                    </div>
                </div>
            `).join('')}
        </div>`;
    return html;
}

// --- Review View ---
function renderReview() {
    if (!state.decks.length) return '<p>No decks available. Add a deck to start reviewing.</p>';
    if (!state.review.deckId) {
        // Select deck to review
        return `<h2>Review</h2>
            <select id="reviewDeck">
                <option value="">Select Deck</option>
                ${state.decks.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
            </select>`;
    }
    const deck = state.decks.find(d => d.id === state.review.deckId);
    if (!deck || !deck.cards.length) return '<p>No cards in this deck.</p>';
    const card = deck.cards[state.review.order[state.review.current]];
    let html = `<h2>Review: ${deck.name}</h2>
        <div class="flashcard${state.review.flipped ? ' flipped' : ''}" id="reviewCard">
            ${state.review.flipped ? card.back : card.front}
        </div>
        <div style="margin-top:1rem;">
            <button id="prevCard">Previous</button>
            <button id="flipCard">Flip</button>
            <button id="nextCard">Next</button>
        </div>
        <div style="margin-top:1rem;">Card ${state.review.current + 1} of ${deck.cards.length}</div>
        <button id="endReview" style="margin-top:1rem;">End Review</button>`;
    return html;
}

// --- Share View ---
function renderShare() {
    let html = `<h2>Share Decks</h2>
        <button id="exportDecks">Export Decks (JSON)</button>
        <input type="file" id="importDecks" accept="application/json" style="display:none;" />
        <button id="importDecksBtn">Import Decks</button>
        <div id="shareStatus"></div>`;
    return html;
}

// --- Settings View ---
function renderSettings() {
    return `<h2>Settings</h2>
        <div class="settings">
            <label>Theme:
                <select id="theme">
                    <option value="default"${state.settings.theme==='default'?' selected':''}>Default</option>
                    <option value="dark"${state.settings.theme==='dark'?' selected':''}>Dark</option>
                </select>
            </label>
        </div>`;
}

// --- Event Listeners ---
function attachEventListeners() {
    // Deck Form
    const deckForm = document.getElementById('deckForm');
    if (deckForm) {
        deckForm.onsubmit = function(e) {
            e.preventDefault();
            const name = document.getElementById('deckName').value.trim();
            if (name) {
                state.decks.push({ id: uuid(), name, cards: [] });
                saveState();
                render();
            }
        };
        document.querySelectorAll('.edit-deck').forEach(btn => {
            btn.onclick = function() {
                const id = this.closest('.deck-item').getAttribute('data-id');
                editDeck(id);
            };
        });
        document.querySelectorAll('.delete-deck').forEach(btn => {
            btn.onclick = function() {
                const id = this.closest('.deck-item').getAttribute('data-id');
                state.decks = state.decks.filter(d => d.id !== id);
                saveState();
                render();
            };
        });
        document.querySelectorAll('.manage-cards').forEach(btn => {
            btn.onclick = function() {
                const id = this.closest('.deck-item').getAttribute('data-id');
                state.selectedDeck = id;
                document.getElementById('cardsManager').innerHTML = renderCardsManager(id);
                attachCardManagerListeners(id);
            };
        });
    }
    // Review Deck Selection
    const reviewDeck = document.getElementById('reviewDeck');
    if (reviewDeck) {
        reviewDeck.onchange = function() {
            const id = this.value;
            if (id) {
                const deck = state.decks.find(d => d.id === id);
                state.review.deckId = id;
                state.review.order = deck.cards.map((_, i) => i);
                state.review.current = 0;
                state.review.flipped = false;
                saveState();
                render();
            }
        };
    }
    // Review Controls
    const reviewCard = document.getElementById('reviewCard');
    if (reviewCard) {
        reviewCard.onclick = function() {
            state.review.flipped = !state.review.flipped;
            saveState();
            render();
        };
    }
    const prevCard = document.getElementById('prevCard');
    if (prevCard) {
        prevCard.onclick = function() {
            if (state.review.current > 0) {
                state.review.current--;
                state.review.flipped = false;
                saveState();
                render();
            }
        };
    }
    const nextCard = document.getElementById('nextCard');
    if (nextCard) {
        nextCard.onclick = function() {
            const deck = state.decks.find(d => d.id === state.review.deckId);
            if (state.review.current < deck.cards.length - 1) {
                state.review.current++;
                state.review.flipped = false;
                saveState();
                render();
            }
        };
    }
    const flipCard = document.getElementById('flipCard');
    if (flipCard) {
        flipCard.onclick = function() {
            state.review.flipped = !state.review.flipped;
            saveState();
            render();
        };
    }
    const endReview = document.getElementById('endReview');
    if (endReview) {
        endReview.onclick = function() {
            state.review.deckId = null;
            state.review.order = [];
            state.review.current = 0;
            state.review.flipped = false;
            saveState();
            render();
        };
    }
    // Share
    const exportDecks = document.getElementById('exportDecks');
    if (exportDecks) {
        exportDecks.onclick = function() {
            const data = JSON.stringify(state.decks, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'flashcard_decks.json';
            a.click();
            URL.revokeObjectURL(url);
            document.getElementById('shareStatus').innerText = 'Decks exported!';
        };
    }
    const importDecksBtn = document.getElementById('importDecksBtn');
    if (importDecksBtn) {
        importDecksBtn.onclick = function() {
            document.getElementById('importDecks').click();
        };
    }
    const importDecks = document.getElementById('importDecks');
    if (importDecks) {
        importDecks.onchange = function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const imported = JSON.parse(evt.target.result);
                    if (Array.isArray(imported)) {
                        state.decks = imported;
                        saveState();
                        render();
                        document.getElementById('shareStatus').innerText = 'Decks imported!';
                    } else {
                        document.getElementById('shareStatus').innerText = 'Invalid file format.';
                    }
                } catch {
                    document.getElementById('shareStatus').innerText = 'Error importing file.';
                }
            };
            reader.readAsText(file);
        };
    }
    // Settings
    const theme = document.getElementById('theme');
    if (theme) {
        theme.onchange = function() {
            state.settings.theme = this.value;
            document.body.className = this.value;
            saveState();
        };
    }
}
// --- Card Manager Listeners ---
function attachCardManagerListeners(deckId) {
    const deck = state.decks.find(d => d.id === deckId);
    if (!deck) return;
    const cardForm = document.getElementById('cardForm');
    if (cardForm) {
        cardForm.onsubmit = function(e) {
            e.preventDefault();
            const front = document.getElementById('cardFront').value.trim();
            const back = document.getElementById('cardBack').value.trim();
            if (front && back) {
                deck.cards.push({ id: uuid(), front, back });
                saveState();
                document.getElementById('cardsManager').innerHTML = renderCardsManager(deckId);
                attachCardManagerListeners(deckId);
            }
        };
        document.querySelectorAll('.edit-card').forEach(btn => {
            btn.onclick = function() {
                const id = this.closest('.flashcard-item').getAttribute('data-id');
                editCard(deckId, id);
            };
        });
        document.querySelectorAll('.delete-card').forEach(btn => {
            btn.onclick = function() {
                const id = this.closest('.flashcard-item').getAttribute('data-id');
                deck.cards = deck.cards.filter(c => c.id !== id);
                saveState();
                document.getElementById('cardsManager').innerHTML = renderCardsManager(deckId);
                attachCardManagerListeners(deckId);
            };
        });
    }
}
// --- Edit Deck Modal (Simple Prompt) ---
function editDeck(id) {
    const deck = state.decks.find(d => d.id === id);
    if (!deck) return;
    const name = prompt('Edit deck name:', deck.name);
    if (name !== null && name.trim() !== '') {
        deck.name = name.trim();
        saveState();
        render();
    }
}
// --- Edit Card Modal (Simple Prompt) ---
function editCard(deckId, cardId) {
    const deck = state.decks.find(d => d.id === deckId);
    if (!deck) return;
    const card = deck.cards.find(c => c.id === cardId);
    if (!card) return;
    const front = prompt('Edit card front:', card.front);
    const back = prompt('Edit card back:', card.back);
    if (front !== null && front.trim() !== '' && back !== null && back.trim() !== '') {
        card.front = front.trim();
        card.back = back.trim();
        saveState();
        document.getElementById('cardsManager').innerHTML = renderCardsManager(deckId);
        attachCardManagerListeners(deckId);
    }
}
// --- Initialization ---
loadState();
render();
