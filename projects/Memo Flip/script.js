/**
 * Memo-Flip Logic
 * Handles grid generation, shuffling, matching logic, and game state.
 */

// --- Icons Library (FontAwesome Classes) ---
const ICONS = [
    'fa-ghost', 'fa-gem', 'fa-flask', 'fa-dice-d20', 
    'fa-dragon', 'fa-ice-cream', 'fa-rocket', 'fa-puzzle-piece',
    'fa-anchor', 'fa-bomb', 'fa-feather-alt', 'fa-fish',
    'fa-frog', 'fa-moon', 'fa-robot', 'fa-snowman',
    'fa-spider', 'fa-umbrella'
];

// --- DOM Elements ---
const gameBoard = document.getElementById('game-board');
const moveEl = document.getElementById('move-count');
const timeEl = document.getElementById('time-count');
const restartBtn = document.getElementById('restart-btn');
const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
const modal = document.getElementById('win-modal');
const playAgainBtn = document.getElementById('play-again-btn');

// --- Game State ---
let gridDimension = 4; // Default 4x4
let cardsArray = [];
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let moves = 0;
let time = 0;
let timerInterval = null;
let gameActive = false;
let matchesFound = 0;

// --- Initialization ---

function init() {
    restartBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', resetGame);
    
    difficultyRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            gridDimension = parseInt(e.target.value);
            resetGame();
        });
    });

    resetGame();
}

function resetGame() {
    // Reset State
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
    moves = 0;
    time = 0;
    matchesFound = 0;
    gameActive = false;
    
    // UI Reset
    moveEl.innerText = '0';
    timeEl.innerText = '00:00';
    clearInterval(timerInterval);
    modal.classList.remove('show');
    
    generateGrid();
}

function generateGrid() {
    // 1. Determine Cards Needed
    const totalCards = gridDimension * gridDimension;
    const pairsNeeded = totalCards / 2;
    
    // 2. Select Icons & Duplicate for Pairs
    // Shuffle full icon list first to get random subset
    const shuffledIcons = [...ICONS].sort(() => 0.5 - Math.random());
    const selectedIcons = shuffledIcons.slice(0, pairsNeeded);
    const deck = [...selectedIcons, ...selectedIcons];
    
    // 3. Fisher-Yates Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // 4. Render Grid
    gameBoard.innerHTML = '';
    gameBoard.className = `game-board grid-${gridDimension}`;
    
    deck.forEach(iconClass => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.icon = iconClass;
        
        card.innerHTML = `
            <div class="card-face card-front">
                <i class="fas fa-question"></i>
            </div>
            <div class="card-face card-back">
                <i class="fas ${iconClass}"></i>
            </div>
        `;
        
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

// --- Gameplay Logic ---

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return; // Prevent double click on same card

    // Start Timer on first click
    if (!gameActive) {
        gameActive = true;
        startTimer();
    }

    this.classList.add('flip');

    if (!hasFlippedCard) {
        // First card flipped
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    // Second card flipped
    secondCard = this;
    incrementMoves();
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.icon === secondCard.dataset.icon;

    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    // Match found: Remove event listeners (already handled by logic, but safe to keep)
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);

    resetBoard();
    matchesFound++;
    
    // Check Win Condition
    const totalPairs = (gridDimension * gridDimension) / 2;
    if (matchesFound === totalPairs) {
        endGame();
    }
}

function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetBoard();
    }, 1000); // 1 second delay to memorize
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function incrementMoves() {
    moves++;
    moveEl.innerText = moves;
}

// --- Timer & End Game ---

function startTimer() {
    timerInterval = setInterval(() => {
        time++;
        const minutes = Math.floor(time / 60).toString().padStart(2, '0');
        const seconds = (time % 60).toString().padStart(2, '0');
        timeEl.innerText = `${minutes}:${seconds}`;
    }, 1000);
}

function endGame() {
    clearInterval(timerInterval);
    
    // Populate Modal
    document.getElementById('final-moves').innerText = moves;
    document.getElementById('final-time').innerText = timeEl.innerText;
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 500); // Small delay for final flip animation
}

// Start
init();