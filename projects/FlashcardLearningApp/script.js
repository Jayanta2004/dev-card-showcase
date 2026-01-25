// Active Recall Flashcards - Spaced Repetition System
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Chart.js
    let studyActivityChart = null;
    let masteryChart = null;
    
    // Application State
    let appState = {
        decks: [],
        currentDeckId: null,
        currentCardIndex: 0,
        studySession: {
            startTime: null,
            cardsStudied: [],
            currentDeckId: null,
            mode: 'random'
        },
        stats: {
            totalStudyTime: 0,
            streakDays: 0,
            lastStudyDate: null,
            sessions: []
        },
        settings: {
            autoFlip: true,
            showTimer: true,
            defaultDifficulty: 'medium'
        }
    };
    
    // Spaced Repetition Algorithm Constants
    const SPACED_REPETITION = {
        intervals: [1, 3, 7, 14, 30, 60, 120], // Days until next review
        easeFactors: {
            again: 1.3,   // Harder - review sooner
            hard: 1.2,    // Slightly harder
            good: 1.0,    // Default
            easy: 0.9     // Easier - review later
        }
    };
    
    // Initialize the application
    function initApp() {
        loadAppData();
        setupEventListeners();
        renderAllViews();
        updateDashboard();
        initCharts();
        
        // Start session timer if in study mode
        if (document.getElementById('study').classList.contains('active')) {
            startStudySession();
        }
    }
    
    // Load app data from localStorage
    function loadAppData() {
        const savedData = localStorage.getItem('activeRecallData');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            appState.decks = parsed.decks || [];
            appState.stats = parsed.stats || appState.stats;
            appState.settings = parsed.settings || appState.settings;
            
            // Initialize sample data if no decks exist
            if (appState.decks.length === 0) {
                initializeSampleData();
            }
        } else {
            initializeSampleData();
        }
        
        // Check and update streak
        updateStreak();
    }
    
    // Save app data to localStorage
    function saveAppData() {
        localStorage.setItem('activeRecallData', JSON.stringify(appState));
    }
    
    // Initialize with sample data
    function initializeSampleData() {
        appState.decks = [
            {
                id: 'deck-1',
                name: 'Spanish Vocabulary',
                description: 'Basic Spanish words and phrases for beginners',
                category: 'Language',
                color: '#4CAF50',
                createdAt: new Date().toISOString(),
                cards: [
                    {
                        id: 'card-1',
                        question: 'Hola',
                        answer: 'Hello',
                        extra: 'Common greeting in Spanish',
                        tags: ['greetings', 'basic'],
                        difficulty: 'easy',
                        history: [],
                        nextReview: new Date().toISOString(),
                        interval: 1,
                        easeFactor: 2.5,
                        isHard: false,
                        mastery: 0.8
                    },
                    {
                        id: 'card-2',
                        question: 'Gracias',
                        answer: 'Thank you',
                        extra: 'Expressing gratitude',
                        tags: ['greetings', 'basic'],
                        difficulty: 'easy',
                        history: [],
                        nextReview: new Date().toISOString(),
                        interval: 1,
                        easeFactor: 2.5,
                        isHard: false,
                        mastery: 0.7
                    },
                    {
                        id: 'card-3',
                        question: 'Por favor',
                        answer: 'Please',
                        extra: 'Polite request',
                        tags: ['greetings', 'basic'],
                        difficulty: 'easy',
                        history: [],
                        nextReview: new Date().toISOString(),
                        interval: 1,
                        easeFactor: 2.5,
                        isHard: false,
                        mastery: 0.9
                    },
                    {
                        id: 'card-4',
                        question: '¿Cómo estás?',
                        answer: 'How are you?',
                        extra: 'Common greeting asking about well-being',
                        tags: ['greetings', 'conversation'],
                        difficulty: 'medium',
                        history: [],
                        nextReview: new Date().toISOString(),
                        interval: 1,
                        easeFactor: 2.5,
                        isHard: true,
                        mastery: 0.4
                    }
                ]
            },
            {
                id: 'deck-2',
                name: 'Biology Basics',
                description: 'Fundamental concepts in biology',
                category: 'Science',
                color: '#2196F3',
                createdAt: new Date().toISOString(),
                cards: [
                    {
                        id: 'card-5',
                        question: 'What is the powerhouse of the cell?',
                        answer: 'Mitochondria',
                        extra: 'Produces energy through cellular respiration',
                        tags: ['cell biology', 'organelles'],
                        difficulty: 'medium',
                        history: [],
                        nextReview: new Date().toISOString(),
                        interval: 1,
                        easeFactor: 2.5,
                        isHard: false,
                        mastery: 0.6
                    },
                    {
                        id: 'card-6',
                        question: 'What does DNA stand for?',
                        answer: 'Deoxyribonucleic Acid',
                        extra: 'Molecule that carries genetic instructions',
                        tags: ['genetics', 'molecular biology'],
                        difficulty: 'medium',
                        history: [],
                        nextReview: new Date().toISOString(),
                        interval: 1,
                        easeFactor: 2.5,
                        isHard: false,
                        mastery: 0.7
                    }
                ]
            },
            {
                id: 'deck-3',
                name: 'World Capitals',
                description: 'Capital cities of countries around the world',
                category: 'Geography',
                color: '#FF9800',
                createdAt: new Date().toISOString(),
                cards: [
                    {
                        id: 'card-7',
                        question: 'What is the capital of Japan?',
                        answer: 'Tokyo',
                        extra: 'Largest city in Japan with over 13 million residents',
                        tags: ['asia', 'capitals'],
                        difficulty: 'easy',
                        history: [],
                        nextReview: new Date().toISOString(),
                        interval: 1,
                        easeFactor: 2.5,
                        isHard: false,
                        mastery: 0.9
                    },
                    {
                        id: 'card-8',
                        question: 'What is the capital of Brazil?',
                        answer: 'Brasília',
                        extra: 'Planned city built in the late 1950s',
                        tags: ['south america', 'capitals'],
                        difficulty: 'medium',
                        history: [],
                        nextReview: new Date().toISOString(),
                        interval: 1,
                        easeFactor: 2.5,
                        isHard: true,
                        mastery: 0.3
                    }
                ]
            }
        ];
        
        // Initialize stats with sample sessions
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        appState.stats = {
            totalStudyTime: 2845, // 47 minutes in seconds
            streakDays: 3,
            lastStudyDate: yesterday.toISOString(),
            sessions: [
                {
                    id: 'session-1',
                    deckId: 'deck-1',
                    date: yesterday.toISOString(),
                    duration: 845,
                    cardsStudied: 12,
                    cardsMastered: 8
                },
                {
                    id: 'session-2',
                    deckId: 'deck-2',
                    date: new Date().toISOString(),
                    duration: 1200,
                    cardsStudied: 15,
                    cardsMastered: 10
                }
            ]
        };
        
        saveAppData();
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const view = this.dataset.view;
                switchView(view);
            });
        });
        
        // Study View
        document.getElementById('studyDeckSelect').addEventListener('change', updateStudyCards);
        document.getElementById('studyModeSelect').addEventListener('change', updateStudyCards);
        document.getElementById('flashcard').addEventListener('click', flipCard);
        document.getElementById('showAnswerBtn').addEventListener('click', flipCard);
        document.getElementById('markHardBtn').addEventListener('click', toggleHardCard);
        document.getElementById('prevCardBtn').addEventListener('click', showPreviousCard);
        document.getElementById('nextCardBtn').addEventListener('click', showNextCard);
        
        // Recall buttons
        document.querySelectorAll('.recall-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const rating = parseInt(this.dataset.rating);
                rateCard(rating);
            });
        });
        
        // Quick Study buttons
        document.getElementById('quickAll').addEventListener('click', () => quickStudy('random'));
        document.getElementById('quickHard').addEventListener('click', () => quickStudy('hard'));
        document.getElementById('quickDue').addEventListener('click', () => quickStudy('due'));
        
        // Deck Management
        document.getElementById('createDeckBtn').addEventListener('click', openDeckModal);
        document.getElementById('emptyCreateDeckBtn').addEventListener('click', openDeckModal);
        document.getElementById('saveDeckBtn').addEventListener('click', saveDeck);
        
        // Card Creation
        document.getElementById('saveCardBtn').addEventListener('click', saveCard);
        document.getElementById('saveAndNewBtn').addEventListener('click', saveCardAndNew);
        document.getElementById('clearFormBtn').addEventListener('click', clearCardForm);
        document.getElementById('importCardsBtn').addEventListener('click', openImportModal);
        document.getElementById('bulkAddBtn').addEventListener('click', openBulkAddModal);
        
        // Form inputs for live preview
        document.getElementById('cardQuestionInput').addEventListener('input', updateCardPreview);
        document.getElementById('cardAnswerInput').addEventListener('input', updateCardPreview);
        document.getElementById('cardExtraInput').addEventListener('input', updateCardPreview);
        
        // Difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Import modal
        document.querySelectorAll('.import-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.import-option').forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                const type = this.dataset.type;
                document.getElementById('importTextSection').classList.toggle('hidden', type !== 'text');
                document.getElementById('importJsonSection').classList.toggle('hidden', type !== 'json');
            });
        });
        
        document.getElementById('processImportBtn').addEventListener('click', processImport);
        document.getElementById('processBulkBtn').addEventListener('click', processBulkAdd);
        
        // Export button
        document.getElementById('exportBtn').addEventListener('click', exportData);
        
        // Stats period filter
        document.getElementById('statsPeriod').addEventListener('change', updateStatistics);
        
        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('active');
                });
            });
        });
        
        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }
    
    // Handle keyboard shortcuts
    function handleKeyboardShortcuts(e) {
        // Only handle shortcuts when not in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(e.key) {
            case ' ':
            case 'Enter':
                if (document.getElementById('study').classList.contains('active')) {
                    e.preventDefault();
                    flipCard();
                }
                break;
            case 'ArrowLeft':
                if (document.getElementById('study').classList.contains('active')) {
                    e.preventDefault();
                    showPreviousCard();
                }
                break;
            case 'ArrowRight':
                if (document.getElementById('study').classList.contains('active')) {
                    e.preventDefault();
                    showNextCard();
                }
                break;
            case '1':
            case '2':
            case '3':
            case '4':
                if (document.getElementById('study').classList.contains('active') && 
                    document.getElementById('flashcard').classList.contains('flipped')) {
                    e.preventDefault();
                    rateCard(parseInt(e.key));
                }
                break;
            case 'h':
                if (document.getElementById('study').classList.contains('active')) {
                    e.preventDefault();
                    toggleHardCard();
                }
                break;
        }
    }
    
    // Switch between views
    function switchView(viewId) {
        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === viewId) {
                btn.classList.add('active');
            }
        });
        
        // Update active view
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(viewId).classList.add('active');
        
        // Update specific view content
        if (viewId === 'study') {
            renderStudyView();
            startStudySession();
        } else if (viewId === 'decks') {
            renderDecksView();
        } else if (viewId === 'stats') {
            updateStatistics();
        } else if (viewId === 'create') {
            renderCreateView();
        }
    }
    
    // Render all views with current data
    function renderAllViews() {
        updateDashboard();
        renderStudyView();
        renderDecksView();
        renderCreateView();
        updateStatistics();
    }
    
    // Update dashboard view
    function updateDashboard() {
        const totalCards = appState.decks.reduce((total, deck) => total + deck.cards.length, 0);
        const masteredCards = appState.decks.reduce((total, deck) => {
            return total + deck.cards.filter(card => card.mastery >= 0.8).length;
        }, 0);
        
        // Update dashboard stats
        document.getElementById('totalDecksCount').textContent = appState.decks.length;
        document.getElementById('dashboardTotalCards').textContent = totalCards;
        document.getElementById('dashboardMastered').textContent = masteredCards;
        document.getElementById('streakDays').textContent = appState.stats.streakDays;
        
        // Update sidebar progress
        document.getElementById('totalCardsCount').textContent = totalCards;
        document.getElementById('masteredCount').textContent = masteredCards;
        
        const masteryPercentage = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;
        document.querySelector('.progress-percent').textContent = `${masteryPercentage}%`;
        
        // Update progress circle
        const circumference = 157; // 2 * π * r (r=25)
        const offset = circumference - (masteryPercentage / 100) * circumference;
        document.querySelector('.progress-fill').style.strokeDashoffset = offset;
        
        // Update recent sessions
        renderRecentSessions();
    }
    
    // Render recent study sessions
    function renderRecentSessions() {
        const sessionsList = document.getElementById('sessionsList');
        const recentSessions = appState.stats.sessions.slice(-5).reverse();
        
        if (recentSessions.length === 0) {
            sessionsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <p>No study sessions yet. Start studying to see your history!</p>
                </div>
            `;
            return;
        }
        
        sessionsList.innerHTML = recentSessions.map(session => {
            const deck = appState.decks.find(d => d.id === session.deckId);
            const deckName = deck ? deck.name : 'Unknown Deck';
            const date = new Date(session.date);
            const duration = formatDuration(session.duration);
            
            return `
                <div class="session-item">
                    <div class="session-header">
                        <span class="session-deck">${deckName}</span>
                        <span class="session-date">${date.toLocaleDateString()}</span>
                    </div>
                    <div class="session-stats">
                        <div class="session-stat">
                            <i class="fas fa-clock"></i>
                            <span>${duration}</span>
                        </div>
                        <div class="session-stat">
                            <i class="fas fa-copy"></i>
                            <span>${session.cardsStudied} cards</span>
                        </div>
                        <div class="session-stat">
                            <i class="fas fa-star"></i>
                            <span>${session.cardsMastered} mastered</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Render study view
    function renderStudyView() {
        // Populate deck select
        const deckSelect = document.getElementById('studyDeckSelect');
        deckSelect.innerHTML = '<option value="all">All Decks</option>';
        
        appState.decks.forEach(deck => {
            const option = document.createElement('option');
            option.value = deck.id;
            option.textContent = deck.name;
            deckSelect.appendChild(option);
        });
        
        // Set default deck if none selected
        if (appState.currentDeckId) {
            deckSelect.value = appState.currentDeckId;
        }
        
        // Update cards based on selection
        updateStudyCards();
    }
    
    // Update study cards based on selection
    function updateStudyCards() {
        const deckId = document.getElementById('studyDeckSelect').value;
        const mode = document.getElementById('studyModeSelect').value;
        
        appState.currentDeckId = deckId === 'all' ? null : deckId;
        appState.studySession.mode = mode;
        appState.currentCardIndex = 0;
        
        // Get filtered cards
        const cards = getFilteredCards(deckId, mode);
        
        // Update UI
        document.getElementById('totalStudyCards').textContent = cards.length;
        document.getElementById('cardsRemaining').textContent = cards.length;
        
        if (cards.length > 0) {
            displayCard(cards[0]);
            updateProgressBar(0, cards.length);
        } else {
            displayNoCards();
        }
        
        // Save study session state
        appState.studySession.currentDeckId = deckId;
        saveAppData();
    }
    
    // Get filtered cards based on deck and mode
    function getFilteredCards(deckId, mode) {
        let cards = [];
        
        // Get cards from selected deck(s)
        if (deckId === 'all') {
            appState.decks.forEach(deck => {
                cards = cards.concat(deck.cards);
            });
        } else {
            const deck = appState.decks.find(d => d.id === deckId);
            if (deck) {
                cards = deck.cards;
            }
        }
        
        // Filter based on study mode
        const now = new Date();
        
        switch(mode) {
            case 'hard':
                return cards.filter(card => card.isHard);
            case 'due':
                return cards.filter(card => new Date(card.nextReview) <= now);
            case 'sequential':
                return cards;
            case 'random':
            default:
                return shuffleArray([...cards]);
        }
    }
    
    // Display a card
    function displayCard(card) {
        const deck = appState.decks.find(d => d.cards.some(c => c.id === card.id));
        
        // Update front of card
        document.getElementById('cardCategory').textContent = deck ? deck.name : 'General';
        document.getElementById('cardQuestion').textContent = card.question;
        document.getElementById('cardCategoryBack').textContent = deck ? deck.name : 'General';
        document.getElementById('cardQuestionBack').textContent = card.question;
        document.getElementById('cardAnswer').textContent = card.answer;
        
        // Update extra info if available
        const extraElement = document.getElementById('cardExtra');
        if (card.extra && card.extra.trim() !== '') {
            extraElement.textContent = card.extra;
            extraElement.style.display = 'block';
        } else {
            extraElement.style.display = 'none';
        }
        
        // Update hard button state
        const hardBtn = document.getElementById('markHardBtn');
        if (card.isHard) {
            hardBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Marked as Hard';
            hardBtn.classList.add('warning');
        } else {
            hardBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Mark as Hard';
            hardBtn.classList.remove('warning');
        }
        
        // Make sure card is flipped to front
        document.getElementById('flashcard').classList.remove('flipped');
        
        // Update card number
        const cards = getFilteredCards(appState.studySession.currentDeckId, appState.studySession.mode);
        const currentIndex = cards.findIndex(c => c.id === card.id) + 1;
        document.getElementById('currentCardNum').textContent = currentIndex;
    }
    
    // Display no cards message
    function displayNoCards() {
        document.getElementById('cardCategory').textContent = 'No Cards';
        document.getElementById('cardQuestion').textContent = 'No cards available for study with the current filters.';
        document.getElementById('cardAnswer').textContent = 'Try changing your study mode or deck selection.';
        document.getElementById('cardExtra').style.display = 'none';
        document.getElementById('currentCardNum').textContent = '0';
        document.getElementById('cardsRemaining').textContent = '0';
    }
    
    // Flip card animation
    function flipCard() {
        document.getElementById('flashcard').classList.toggle('flipped');
    }
    
    // Toggle hard status for current card
    function toggleHardCard() {
        const cards = getFilteredCards(appState.studySession.currentDeckId, appState.studySession.mode);
        if (cards.length === 0) return;
        
        const currentCard = cards[appState.currentCardIndex];
        currentCard.isHard = !currentCard.isHard;
        
        // Update button
        const hardBtn = document.getElementById('markHardBtn');
        if (currentCard.isHard) {
            hardBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Marked as Hard';
            hardBtn.classList.add('warning');
            showToast('Card marked as hard');
        } else {
            hardBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Mark as Hard';
            hardBtn.classList.remove('warning');
            showToast('Card unmarked as hard');
        }
        
        saveAppData();
    }
    
    // Rate card (spaced repetition algorithm)
    function rateCard(rating) {
        const cards = getFilteredCards(appState.studySession.currentDeckId, appState.studySession.mode);
        if (cards.length === 0) return;
        
        const currentCard = cards[appState.currentCardIndex];
        const now = new Date();
        
        // Calculate new interval based on rating
        let easeFactorChange = 0;
        let intervalMultiplier = 1;
        
        switch(rating) {
            case 1: // Again
                easeFactorChange = -0.2;
                intervalMultiplier = 0.1;
                break;
            case 2: // Hard
                easeFactorChange = -0.1;
                intervalMultiplier = 0.5;
                break;
            case 3: // Good
                easeFactorChange = 0;
                intervalMultiplier = 1;
                break;
            case 4: // Easy
                easeFactorChange = 0.1;
                intervalMultiplier = 1.5;
                break;
        }
        
        // Update card properties
        currentCard.easeFactor = Math.max(1.3, Math.min(3.0, currentCard.easeFactor + easeFactorChange));
        currentCard.interval = Math.max(1, Math.ceil(currentCard.interval * intervalMultiplier));
        
        // Calculate next review date
        const nextReview = new Date(now);
        nextReview.setDate(nextReview.getDate() + currentCard.interval);
        currentCard.nextReview = nextReview.toISOString();
        
        // Update mastery score (0-1)
        const masteryChange = rating === 1 ? -0.3 : rating === 2 ? -0.1 : rating === 3 ? 0.1 : 0.2;
        currentCard.mastery = Math.max(0, Math.min(1, (currentCard.mastery || 0) + masteryChange));
        
        // Add to history
        currentCard.history.push({
            date: now.toISOString(),
            rating: rating,
            interval: currentCard.interval
        });
        
        // Mark as not hard if rated good or easy
        if (rating >= 3) {
            currentCard.isHard = false;
        }
        
        // Update session stats
        appState.studySession.cardsStudied.push({
            cardId: currentCard.id,
            rating: rating,
            timestamp: now.toISOString()
        });
        
        // Update mastered cards count for this session
        const cardsMasteredStudy = document.getElementById('cardsMasteredStudy');
        if (rating >= 3) {
            cardsMasteredStudy.textContent = parseInt(cardsMasteredStudy.textContent) + 1;
        }
        
        // Show next card
        setTimeout(() => {
            showNextCard();
            showToast(rating === 1 ? 'Card needs more practice' : 
                     rating === 2 ? 'Card marked as hard' : 
                     rating === 3 ? 'Good job!' : 'Excellent!');
        }, 300);
        
        saveAppData();
    }
    
    // Show next card
    function showNextCard() {
        const cards = getFilteredCards(appState.studySession.currentDeckId, appState.studySession.mode);
        if (cards.length === 0) return;
        
        appState.currentCardIndex = (appState.currentCardIndex + 1) % cards.length;
        displayCard(cards[appState.currentCardIndex]);
        updateProgressBar(appState.currentCardIndex, cards.length);
        
        // Update cards remaining
        document.getElementById('cardsRemaining').textContent = cards.length - appState.currentCardIndex;
    }
    
    // Show previous card
    function showPreviousCard() {
        const cards = getFilteredCards(appState.studySession.currentDeckId, appState.studySession.mode);
        if (cards.length === 0) return;
        
        appState.currentCardIndex = (appState.currentCardIndex - 1 + cards.length) % cards.length;
        displayCard(cards[appState.currentCardIndex]);
        updateProgressBar(appState.currentCardIndex, cards.length);
        
        // Update cards remaining
        document.getElementById('cardsRemaining').textContent = cards.length - appState.currentCardIndex;
    }
    
    // Update progress bar
    function updateProgressBar(current, total) {
        const percentage = total > 0 ? ((current + 1) / total) * 100 : 0;
        document.getElementById('studyProgress').style.width = `${percentage}%`;
    }
    
    // Start study session timer
    function startStudySession() {
        appState.studySession.startTime = new Date();
        
        // Update timer every second
        const timerElement = document.getElementById('sessionTime');
        setInterval(() => {
            if (appState.studySession.startTime) {
                const elapsed = Math.floor((new Date() - appState.studySession.startTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    // Quick study functions
    function quickStudy(mode) {
        switchView('study');
        setTimeout(() => {
            document.getElementById('studyModeSelect').value = mode;
            updateStudyCards();
        }, 100);
    }
    
    // Render decks view
    function renderDecksView() {
        const decksGrid = document.getElementById('decksGrid');
        
        if (appState.decks.length === 0) {
            decksGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-layer-group"></i>
                    <h3>No Decks Yet</h3>
                    <p>Create your first deck to start studying!</p>
                    <button id="emptyCreateDeckBtn" class="btn primary">
                        <i class="fas fa-plus"></i> Create Your First Deck
                    </button>
                </div>
            `;
            
            // Reattach event listener
            document.getElementById('emptyCreateDeckBtn').addEventListener('click', openDeckModal);
            return;
        }
        
        decksGrid.innerHTML = appState.decks.map(deck => {
            const totalCards = deck.cards.length;
            const masteredCards = deck.cards.filter(card => card.mastery >= 0.8).length;
            const masteryPercentage = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;
            
            // Calculate due cards
            const now = new Date();
            const dueCards = deck.cards.filter(card => new Date(card.nextReview) <= now).length;
            
            return `
                <div class="deck-card" style="border-top-color: ${deck.color}">
                    <div class="deck-header">
                        <h3 class="deck-title">${deck.name}</h3>
                        <div class="deck-actions">
                            <button class="deck-action-btn edit-deck" data-deck-id="${deck.id}" title="Edit Deck">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="deck-action-btn delete-deck" data-deck-id="${deck.id}" title="Delete Deck">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    ${deck.description ? `<p class="deck-description">${deck.description}</p>` : ''}
                    <div class="deck-stats">
                        <div class="deck-stat">
                            <span class="deck-stat-value">${totalCards}</span>
                            <span class="deck-stat-label">Cards</span>
                        </div>
                        <div class="deck-stat">
                            <span class="deck-stat-value">${masteredCards}</span>
                            <span class="deck-stat-label">Mastered</span>
                        </div>
                        <div class="deck-stat">
                            <span class="deck-stat-value">${dueCards}</span>
                            <span class="deck-stat-label">Due</span>
                        </div>
                    </div>
                    <div class="deck-progress">
                        <div class="progress-label">
                            <span>Mastery</span>
                            <span>${masteryPercentage}%</span>
                        </div>
                        <div class="progress-bar-small">
                            <div class="progress-fill-small" style="width: ${masteryPercentage}%"></div>
                        </div>
                    </div>
                    <div class="deck-footer">
                        <button class="btn secondary small study-deck-btn" data-deck-id="${deck.id}">
                            <i class="fas fa-book-open"></i> Study
                        </button>
                        <button class="btn primary small add-to-deck-btn" data-deck-id="${deck.id}">
                            <i class="fas fa-plus"></i> Add Cards
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Attach event listeners to deck buttons
        document.querySelectorAll('.edit-deck').forEach(btn => {
            btn.addEventListener('click', function() {
                const deckId = this.dataset.deckId;
                editDeck(deckId);
            });
        });
        
        document.querySelectorAll('.delete-deck').forEach(btn => {
            btn.addEventListener('click', function() {
                const deckId = this.dataset.deckId;
                deleteDeck(deckId);
            });
        });
        
        document.querySelectorAll('.study-deck-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const deckId = this.dataset.deckId;
                switchView('study');
                setTimeout(() => {
                    document.getElementById('studyDeckSelect').value = deckId;
                    updateStudyCards();
                }, 100);
            });
        });
        
        document.querySelectorAll('.add-to-deck-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const deckId = this.dataset.deckId;
                switchView('create');
                setTimeout(() => {
                    document.getElementById('cardDeckSelect').value = deckId;
                }, 100);
            });
        });
    }
    
    // Open deck modal for creation/editing
    function openDeckModal() {
        document.getElementById('deckModal').classList.add('active');
        document.getElementById('deckModalTitle').textContent = 'Create New Deck';
        document.getElementById('deckName').value = '';
        document.getElementById('deckDescription').value = '';
        document.getElementById('deckCategory').value = '';
        
        // Reset color selector
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.remove('active');
        });
        document.querySelector('.color-option[data-color="#4CAF50"]').classList.add('active');
        
        // Clear any deck ID from modal
        document.getElementById('deckModal').dataset.deckId = '';
    }
    
    // Edit existing deck
    function editDeck(deckId) {
        const deck = appState.decks.find(d => d.id === deckId);
        if (!deck) return;
        
        document.getElementById('deckModal').classList.add('active');
        document.getElementById('deckModalTitle').textContent = 'Edit Deck';
        document.getElementById('deckName').value = deck.name;
        document.getElementById('deckDescription').value = deck.description || '';
        document.getElementById('deckCategory').value = deck.category || '';
        
        // Set color
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.remove('active');
            if (opt.dataset.color === deck.color) {
                opt.classList.add('active');
            }
        });
        
        // Store deck ID for saving
        document.getElementById('deckModal').dataset.deckId = deckId;
    }
    
    // Save deck (create or update)
    function saveDeck() {
        const name = document.getElementById('deckName').value.trim();
        if (!name) {
            alert('Please enter a deck name');
            return;
        }
        
        const description = document.getElementById('deckDescription').value.trim();
        const category = document.getElementById('deckCategory').value.trim();
        const activeColor = document.querySelector('.color-option.active');
        const color = activeColor ? activeColor.dataset.color : '#4CAF50';
        
        const deckId = document.getElementById('deckModal').dataset.deckId;
        
        if (deckId) {
            // Update existing deck
            const deckIndex = appState.decks.findIndex(d => d.id === deckId);
            if (deckIndex !== -1) {
                appState.decks[deckIndex].name = name;
                appState.decks[deckIndex].description = description;
                appState.decks[deckIndex].category = category;
                appState.decks[deckIndex].color = color;
            }
        } else {
            // Create new deck
            const newDeck = {
                id: 'deck-' + Date.now(),
                name: name,
                description: description,
                category: category,
                color: color,
                createdAt: new Date().toISOString(),
                cards: []
            };
            
            appState.decks.push(newDeck);
        }
        
        saveAppData();
        renderAllViews();
        document.getElementById('deckModal').classList.remove('active');
        showToast(deckId ? 'Deck updated successfully' : 'Deck created successfully');
    }
    
    // Delete deck with confirmation
    function deleteDeck(deckId) {
        if (!confirm('Are you sure you want to delete this deck? All cards in it will be permanently deleted.')) {
            return;
        }
        
        const deckIndex = appState.decks.findIndex(d => d.id === deckId);
        if (deckIndex !== -1) {
            appState.decks.splice(deckIndex, 1);
            saveAppData();
            renderAllViews();
            showToast('Deck deleted successfully');
        }
    }
    
    // Render create cards view
    function renderCreateView() {
        // Populate deck select
        const deckSelect = document.getElementById('cardDeckSelect');
        deckSelect.innerHTML = '<option value="">Create New Deck</option>';
        
        appState.decks.forEach(deck => {
            const option = document.createElement('option');
            option.value = deck.id;
            option.textContent = deck.name;
            deckSelect.appendChild(option);
        });
        
        // Also populate import deck select
        const importDeckSelect = document.getElementById('importDeckSelect');
        importDeckSelect.innerHTML = '<option value="">Create New Deck</option>';
        
        appState.decks.forEach(deck => {
            const option = document.createElement('option');
            option.value = deck.id;
            option.textContent = deck.name;
            importDeckSelect.appendChild(option);
        });
        
        // Populate bulk add deck select
        const bulkDeckSelect = document.getElementById('bulkDeckSelect');
        bulkDeckSelect.innerHTML = '<option value="">Create New Deck</option>';
        
        appState.decks.forEach(deck => {
            const option = document.createElement('option');
            option.value = deck.id;
            option.textContent = deck.name;
            bulkDeckSelect.appendChild(option);
        });
        
        // Update recent cards
        updateRecentCards();
    }
    
    // Update card preview
    function updateCardPreview() {
        const question = document.getElementById('cardQuestionInput').value.trim() || 'Your question will appear here';
        const answer = document.getElementById('cardAnswerInput').value.trim() || 'Your answer will appear here';
        const extra = document.getElementById('cardExtraInput').value.trim();
        
        document.getElementById('previewQuestion').textContent = question;
        document.getElementById('previewQuestionBack').textContent = question;
        document.getElementById('previewAnswer').textContent = answer;
        
        const extraElement = document.getElementById('previewExtra');
        if (extra) {
            extraElement.textContent = extra;
            extraElement.style.display = 'block';
        } else {
            extraElement.style.display = 'none';
        }
    }
    
    // Save a new card
    function saveCard() {
        const question = document.getElementById('cardQuestionInput').value.trim();
        const answer = document.getElementById('cardAnswerInput').value.trim();
        
        if (!question || !answer) {
            alert('Please enter both a question and an answer');
            return;
        }
        
        const deckId = document.getElementById('cardDeckSelect').value;
        const newDeckName = document.getElementById('newDeckName').value.trim();
        const extra = document.getElementById('cardExtraInput').value.trim();
        const tags = document.getElementById('cardTagsInput').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const difficulty = document.querySelector('.difficulty-btn.active').dataset.difficulty;
        
        let targetDeckId = deckId;
        
        // Create new deck if needed
        if (!deckId && newDeckName) {
            const newDeck = {
                id: 'deck-' + Date.now(),
                name: newDeckName,
                description: '',
                category: '',
                color: '#4CAF50',
                createdAt: new Date().toISOString(),
                cards: []
            };
            
            appState.decks.push(newDeck);
            targetDeckId = newDeck.id;
            showToast('New deck created');
        } else if (!deckId && !newDeckName) {
            alert('Please select a deck or create a new one');
            return;
        }
        
        // Find the deck
        const deck = appState.decks.find(d => d.id === targetDeckId);
        if (!deck) {
            alert('Selected deck not found');
            return;
        }
        
        // Create new card
        const newCard = {
            id: 'card-' + Date.now(),
            question: question,
            answer: answer,
            extra: extra,
            tags: tags,
            difficulty: difficulty,
            history: [],
            nextReview: new Date().toISOString(),
            interval: 1,
            easeFactor: 2.5,
            isHard: false,
            mastery: 0.5
        };
        
        deck.cards.push(newCard);
        saveAppData();
        
        // Clear form if not "Save & New"
        if (!event.target || event.target.id !== 'saveAndNewBtn') {
            clearCardForm();
        }
        
        // Update UI
        updateRecentCards();
        updateDashboard();
        showToast('Card saved successfully');
    }
    
    // Save card and clear form for next card
    function saveCardAndNew() {
        saveCard();
        
        // Keep the deck selection
        const deckId = document.getElementById('cardDeckSelect').value;
        
        // Clear only the card fields
        document.getElementById('cardQuestionInput').value = '';
        document.getElementById('cardAnswerInput').value = '';
        document.getElementById('cardExtraInput').value = '';
        document.getElementById('cardTagsInput').value = '';
        
        // Restore deck selection
        document.getElementById('cardDeckSelect').value = deckId;
        
        // Focus on question field
        document.getElementById('cardQuestionInput').focus();
        
        // Update preview
        updateCardPreview();
    }
    
    // Clear card form
    function clearCardForm() {
        document.getElementById('cardQuestionInput').value = '';
        document.getElementById('cardAnswerInput').value = '';
        document.getElementById('cardExtraInput').value = '';
        document.getElementById('cardTagsInput').value = '';
        document.getElementById('newDeckName').value = '';
        document.getElementById('cardDeckSelect').value = '';
        
        // Reset difficulty to medium
        document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.difficulty-btn.medium').classList.add('active');
        
        updateCardPreview();
    }
    
    // Update recent cards list
    function updateRecentCards() {
        const recentList = document.getElementById('recentCardsList');
        
        // Get recent cards from all decks
        let allCards = [];
        appState.decks.forEach(deck => {
            deck.cards.forEach(card => {
                allCards.push({
                    ...card,
                    deckName: deck.name
                });
            });
        });
        
        // Sort by ID (which includes timestamp) and get latest 5
        const recentCards = allCards
            .sort((a, b) => b.id.localeCompare(a.id))
            .slice(0, 5);
        
        if (recentCards.length === 0) {
            recentList.innerHTML = '<p class="empty-text">No cards yet. Create your first card!</p>';
            return;
        }
        
        recentList.innerHTML = recentCards.map(card => `
            <div class="recent-item">
                <div class="recent-question">${truncateText(card.question, 40)}</div>
                <div class="recent-deck">${card.deckName}</div>
            </div>
        `).join('');
    }
    
    // Open import modal
    function openImportModal() {
        document.getElementById('importModal').classList.add('active');
        document.getElementById('importText').value = '';
        document.getElementById('importJson').value = '';
    }
    
    // Process import
    function processImport() {
        const activeImport = document.querySelector('.import-option.active');
        const importType = activeImport.dataset.type;
        
        if (importType === 'text') {
            importTextCards();
        } else {
            importJsonCards();
        }
    }
    
    // Import cards from text
    function importTextCards() {
        const text = document.getElementById('importText').value.trim();
        if (!text) {
            alert('Please enter some cards to import');
            return;
        }
        
        const deckId = document.getElementById('importDeckSelect').value;
        const newDeckName = deckId ? null : 'Imported Cards';
        
        let targetDeckId = deckId;
        
        // Create new deck if needed
        if (!deckId) {
            const newDeck = {
                id: 'deck-' + Date.now(),
                name: newDeckName,
                description: 'Imported cards',
                category: 'Imported',
                color: '#607D8B',
                createdAt: new Date().toISOString(),
                cards: []
            };
            
            appState.decks.push(newDeck);
            targetDeckId = newDeck.id;
        }
        
        // Find the deck
        const deck = appState.decks.find(d => d.id === targetDeckId);
        if (!deck) {
            alert('Error: Deck not found');
            return;
        }
        
        // Parse text lines
        const lines = text.split('\n');
        let importedCount = 0;
        
        lines.forEach(line => {
            line = line.trim();
            if (!line) return;
            
            const parts = line.split('|').map(part => part.trim());
            if (parts.length < 2) return;
            
            const question = parts[0];
            const answer = parts[1];
            const tags = parts.length > 2 ? parts[2].split(',').map(tag => tag.trim()) : [];
            const extra = parts.length > 3 ? parts[3] : '';
            
            const newCard = {
                id: 'card-' + Date.now() + '-' + importedCount,
                question: question,
                answer: answer,
                extra: extra,
                tags: tags,
                difficulty: 'medium',
                history: [],
                nextReview: new Date().toISOString(),
                interval: 1,
                easeFactor: 2.5,
                isHard: false,
                mastery: 0.5
            };
            
            deck.cards.push(newCard);
            importedCount++;
        });
        
        saveAppData();
        renderAllViews();
        document.getElementById('importModal').classList.remove('active');
        showToast(`Successfully imported ${importedCount} cards`);
    }
    
    // Import cards from JSON
    function importJsonCards() {
        const jsonText = document.getElementById('importJson').value.trim();
        if (!jsonText) {
            alert('Please enter JSON data to import');
            return;
        }
        
        try {
            const importedData = JSON.parse(jsonText);
            
            // Check if it's a full export or just cards
            if (importedData.decks) {
                // Full app data import
                appState.decks = importedData.decks;
                if (importedData.stats) appState.stats = importedData.stats;
                showToast('Full data import successful');
            } else if (Array.isArray(importedData)) {
                // Just cards array
                // We need to know which deck to add them to
                const deckId = document.getElementById('importDeckSelect').value;
                if (!deckId) {
                    alert('Please select a deck to import cards into');
                    return;
                }
                
                const deck = appState.decks.find(d => d.id === deckId);
                if (!deck) {
                    alert('Selected deck not found');
                    return;
                }
                
                importedData.forEach(cardData => {
                    const newCard = {
                        id: 'card-' + Date.now() + '-' + Math.random(),
                        question: cardData.question || '',
                        answer: cardData.answer || '',
                        extra: cardData.extra || '',
                        tags: cardData.tags || [],
                        difficulty: cardData.difficulty || 'medium',
                        history: [],
                        nextReview: new Date().toISOString(),
                        interval: 1,
                        easeFactor: 2.5,
                        isHard: false,
                        mastery: 0.5
                    };
                    
                    deck.cards.push(newCard);
                });
                
                showToast(`Imported ${importedData.length} cards`);
            } else {
                alert('Invalid JSON format. Expected array of cards or full export data.');
                return;
            }
            
            saveAppData();
            renderAllViews();
            document.getElementById('importModal').classList.remove('active');
        } catch (error) {
            alert('Invalid JSON: ' + error.message);
        }
    }
    
    // Open bulk add modal
    function openBulkAddModal() {
        document.getElementById('bulkAddModal').classList.add('active');
        document.getElementById('bulkCards').value = '';
        document.getElementById('bulkTags').value = '';
    }
    
    // Process bulk add
    function processBulkAdd() {
        const text = document.getElementById('bulkCards').value.trim();
        if (!text) {
            alert('Please enter some cards to add');
            return;
        }
        
        const deckId = document.getElementById('bulkDeckSelect').value;
        const defaultTags = document.getElementById('bulkTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        let targetDeckId = deckId;
        
        // Create new deck if needed
        if (!deckId) {
            const newDeck = {
                id: 'deck-' + Date.now(),
                name: 'Bulk Added Cards',
                description: 'Cards added in bulk',
                category: 'Bulk',
                color: '#9C27B0',
                createdAt: new Date().toISOString(),
                cards: []
            };
            
            appState.decks.push(newDeck);
            targetDeckId = newDeck.id;
        }
        
        // Find the deck
        const deck = appState.decks.find(d => d.id === targetDeckId);
        if (!deck) {
            alert('Error: Deck not found');
            return;
        }
        
        // Parse text lines
        const lines = text.split('\n');
        let addedCount = 0;
        
        lines.forEach(line => {
            line = line.trim();
            if (!line) return;
            
            const parts = line.split('|').map(part => part.trim());
            if (parts.length < 2) return;
            
            const question = parts[0];
            const answer = parts[1];
            const lineTags = parts.length > 2 ? parts[2].split(',').map(tag => tag.trim()) : [];
            const extra = parts.length > 3 ? parts[3] : '';
            
            // Combine line tags with default tags
            const allTags = [...new Set([...defaultTags, ...lineTags])];
            
            const newCard = {
                id: 'card-' + Date.now() + '-' + addedCount,
                question: question,
                answer: answer,
                extra: extra,
                tags: allTags,
                difficulty: 'medium',
                history: [],
                nextReview: new Date().toISOString(),
                interval: 1,
                easeFactor: 2.5,
                isHard: false,
                mastery: 0.5
            };
            
            deck.cards.push(newCard);
            addedCount++;
        });
        
        saveAppData();
        renderAllViews();
        document.getElementById('bulkAddModal').classList.remove('active');
        showToast(`Successfully added ${addedCount} cards`);
    }
    
    // Update statistics view
    function updateStatistics() {
        const period = parseInt(document.getElementById('statsPeriod').value);
        const now = new Date();
        const startDate = period === 'all' ? null : new Date(now.getTime() - period * 24 * 60 * 60 * 1000);
        
        // Filter sessions by period
        let filteredSessions = appState.stats.sessions;
        if (startDate) {
            filteredSessions = filteredSessions.filter(session => 
                new Date(session.date) >= startDate
            );
        }
        
        // Calculate metrics
        const totalStudyTime = filteredSessions.reduce((total, session) => total + session.duration, 0);
        const totalCardsStudied = filteredSessions.reduce((total, session) => total + session.cardsStudied, 0);
        const totalCardsMastered = filteredSessions.reduce((total, session) => total + session.cardsMastered, 0);
        
        const avgRecallRate = totalCardsStudied > 0 ? Math.round((totalCardsMastered / totalCardsStudied) * 100) : 0;
        const cardsPerSession = filteredSessions.length > 0 ? Math.round(totalCardsStudied / filteredSessions.length) : 0;
        
        // Update metric displays
        document.getElementById('avgRecallRate').textContent = `${avgRecallRate}%`;
        document.getElementById('totalStudyTime').textContent = `${Math.round(totalStudyTime / 3600)}h`;
        document.getElementById('cardsPerSession').textContent = cardsPerSession;
        
        // Update deck performance table
        updateDeckPerformanceTable();
        
        // Update charts
        updateCharts(filteredSessions);
    }
    
    // Update deck performance table
    function updateDeckPerformanceTable() {
        const tableBody = document.getElementById('deckPerformanceTable');
        
        const deckStats = appState.decks.map(deck => {
            const totalCards = deck.cards.length;
            const masteredCards = deck.cards.filter(card => card.mastery >= 0.8).length;
            const avgScore = totalCards > 0 ? 
                Math.round(deck.cards.reduce((sum, card) => sum + (card.mastery || 0), 0) / totalCards * 100) : 0;
            
            // Find last studied date
            let lastStudied = 'Never';
            const cardHistories = deck.cards.flatMap(card => card.history);
            if (cardHistories.length > 0) {
                const latestHistory = cardHistories.sort((a, b) => 
                    new Date(b.date) - new Date(a.date)
                )[0];
                if (latestHistory) {
                    lastStudied = new Date(latestHistory.date).toLocaleDateString();
                }
            }
            
            return {
                name: deck.name,
                totalCards,
                masteredCards,
                avgScore,
                lastStudied
            };
        });
        
        tableBody.innerHTML = deckStats.map(stat => `
            <tr>
                <td>${stat.name}</td>
                <td>${stat.totalCards}</td>
                <td>${stat.masteredCards}</td>
                <td>${stat.avgScore}%</td>
                <td>${stat.lastStudied}</td>
            </tr>
        `).join('');
    }
    
    // Initialize charts
    function initCharts() {
        const activityCtx = document.getElementById('studyActivityChart').getContext('2d');
        const masteryCtx = document.getElementById('masteryChart').getContext('2d');
        
        // Study Activity Chart
        studyActivityChart = new Chart(activityCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Cards Studied',
                    data: [],
                    backgroundColor: 'rgba(74, 111, 165, 0.7)',
                    borderColor: 'rgba(74, 111, 165, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 5
                        }
                    }
                }
            }
        });
        
        // Mastery Distribution Chart
        masteryChart = new Chart(masteryCtx, {
            type: 'doughnut',
            data: {
                labels: ['New', 'Learning', 'Reviewing', 'Mastered'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        '#FF9800', // New - Orange
                        '#2196F3', // Learning - Blue
                        '#9C27B0', // Reviewing - Purple
                        '#4CAF50'  // Mastered - Green
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        // Initial chart update
        updateCharts(appState.stats.sessions);
    }
    
    // Update charts with data
    function updateCharts(sessions) {
        // Update activity chart (last 7 days)
        const last7Days = Array.from({length: 7}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        });
        
        const dailyData = Array(7).fill(0);
        const now = new Date();
        
        sessions.forEach(session => {
            const sessionDate = new Date(session.date);
            const daysAgo = Math.floor((now - sessionDate) / (1000 * 60 * 60 * 24));
            
            if (daysAgo >= 0 && daysAgo < 7) {
                dailyData[6 - daysAgo] += session.cardsStudied;
            }
        });
        
        studyActivityChart.data.labels = last7Days;
        studyActivityChart.data.datasets[0].data = dailyData;
        studyActivityChart.update();
        
        // Update mastery chart
        let allCards = [];
        appState.decks.forEach(deck => {
            allCards = allCards.concat(deck.cards);
        });
        
        const masteryLevels = {
            new: allCards.filter(card => !card.history || card.history.length === 0).length,
            learning: allCards.filter(card => (card.mastery || 0) < 0.5).length,
            reviewing: allCards.filter(card => (card.mastery || 0) >= 0.5 && (card.mastery || 0) < 0.8).length,
            mastered: allCards.filter(card => (card.mastery || 0) >= 0.8).length
        };
        
        masteryChart.data.datasets[0].data = [
            masteryLevels.new,
            masteryLevels.learning,
            masteryLevels.reviewing,
            masteryLevels.mastered
        ];
        masteryChart.update();
    }
    
    // Update streak based on last study date
    function updateStreak() {
        if (!appState.stats.lastStudyDate) return;
        
        const lastStudy = new Date(appState.stats.lastStudyDate);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Check if last study was yesterday or today
        if (lastStudy.toDateString() === today.toDateString()) {
            // Already studied today, keep streak
        } else if (lastStudy.toDateString() === yesterday.toDateString()) {
            // Studied yesterday, increment streak
            appState.stats.streakDays++;
            appState.stats.lastStudyDate = today.toISOString();
            saveAppData();
        } else {
            // Streak broken
            appState.stats.streakDays = 1;
            appState.stats.lastStudyDate = today.toISOString();
            saveAppData();
        }
    }
    
    // Export app data
    function exportData() {
        const exportData = {
            decks: appState.decks,
            stats: appState.stats,
            settings: appState.settings,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `active-recall-data-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showToast('Data exported successfully');
    }
    
    // Show toast notification
    function showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
    
    // Utility Functions
    
    // Shuffle array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // Format duration in seconds to mm:ss
    function formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // Truncate text with ellipsis
    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    // Initialize the application
    initApp();
});