// ===== Memory Card Game - Complete Game Logic =====

// Game Data - Themes
const THEMES = {
    emojis: ['😀', '🎉', '🚀', '⭐', '🎨', '🎮', '🎵', '🏆', '💎', '🌈', '🔥', '⚡'],
    flags: ['🇺🇸', '🇬🇧', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸', '🇯🇵', '🇨🇦', '🇦🇺', '🇧🇷', '🇮🇳', '🇨🇳'],
    programming: ['{ }', '< >', '[ ]', '( )', 'fn', 'var', 'let', 'if', 'for', '&&', '||', '===']
};

// Difficulty Settings
const DIFFICULTY = {
    easy: { rows: 3, cols: 4, pairs: 6, timeLimit: 0 },
    medium: { rows: 4, cols: 4, pairs: 8, timeLimit: 90 },
    hard: { rows: 4, cols: 6, pairs: 12, timeLimit: 120 }
};

// Game State
let gameState = {
    theme: 'emojis',
    difficulty: 'easy',
    mode: 'classic',
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    timer: 0,
    timerInterval: null,
    isPaused: false,
    currentLevel: 1,
    score: 0
};

// DOM Elements
const menuScreen = document.getElementById('menuScreen');
const gameScreen = document.getElementById('gameScreen');
const highScoresScreen = document.getElementById('highScoresScreen');
const gameBoard = document.getElementById('gameBoard');
const movesCount = document.getElementById('movesCount');
const timer = document.getElementById('timer');
const matchesCount = document.getElementById('matchesCount');
const levelCount = document.getElementById('levelCount');
const levelInfo = document.getElementById('levelInfo');

// Modals
const gameOverModal = document.getElementById('gameOverModal');
const pauseModal = document.getElementById('pauseModal');

// Initialize Game
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadHighScores();
});

// Event Listeners Setup
function setupEventListeners() {
    // Theme selection
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.theme = btn.dataset.theme;
        });
    });

    // Difficulty selection
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.difficulty = btn.dataset.difficulty;
        });
    });

    // Mode selection
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.mode = btn.dataset.mode;
        });
    });

    // Start game
    document.getElementById('startGameBtn').addEventListener('click', startGame);

    // High scores
    document.getElementById('highScoresBtn').addEventListener('click', showHighScores);
    document.getElementById('backToMenuBtn').addEventListener('click', showMenu);

    // Game controls
    document.getElementById('pauseBtn').addEventListener('click', pauseGame);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('quitBtn').addEventListener('click', quitGame);

    // Modal buttons
    document.getElementById('resumeBtn').addEventListener('click', resumeGame);
    document.getElementById('pauseQuitBtn').addEventListener('click', quitGame);
    document.getElementById('playAgainBtn').addEventListener('click', playAgain);
    document.getElementById('backToMenuBtn2').addEventListener('click', showMenu);

    // High scores filter
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterHighScores(btn.dataset.filter);
        });
    });
}

// Start New Game
function startGame() {
    // Reset game state
    gameState.cards = [];
    gameState.flippedCards = [];
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.timer = 0;
    gameState.isPaused = false;
    gameState.currentLevel = 1;
    gameState.score = 0;

    // Show level info for progressive mode
    if (gameState.mode === 'progressive') {
        levelInfo.style.display = 'block';
        levelCount.textContent = gameState.currentLevel;
    } else {
        levelInfo.style.display = 'none';
    }

    // Create game board
    createGameBoard();

    // Switch to game screen
    switchScreen(gameScreen);

    // Start timer
    startTimer();

    // Update UI
    updateGameUI();
}

// Create Game Board
function createGameBoard() {
    const config = DIFFICULTY[gameState.difficulty];
    const themeIcons = THEMES[gameState.theme];
    
    // Get pairs for current level (progressive mode)
    let pairsNeeded = config.pairs;
    if (gameState.mode === 'progressive') {
        pairsNeeded = Math.min(config.pairs, 4 + gameState.currentLevel);
    }

    // Select random icons
    const selectedIcons = shuffleArray([...themeIcons]).slice(0, pairsNeeded);
    
    // Create pairs
    const cardValues = [...selectedIcons, ...selectedIcons];
    gameState.cards = shuffleArray(cardValues);

    // Clear and setup board
    gameBoard.innerHTML = '';
    gameBoard.className = `game-board grid-${config.cols}x${config.rows}`;

    // Create card elements
    gameState.cards.forEach((value, index) => {
        const card = createCard(value, index);
        gameBoard.appendChild(card);
    });
}

// Create Card Element
function createCard(value, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = index;
    card.dataset.value = value;

    card.innerHTML = `
        <div class="card-inner">
            <div class="card-back">?</div>
            <div class="card-front">${value}</div>
        </div>
    `;

    card.addEventListener('click', () => handleCardClick(card));
    return card;
}

// Handle Card Click
function handleCardClick(card) {
    // Prevent clicks when paused or card already flipped
    if (gameState.isPaused || card.classList.contains('flipped') || 
        card.classList.contains('matched') || gameState.flippedCards.length >= 2) {
        return;
    }

    // Flip card
    card.classList.add('flipped');
    gameState.flippedCards.push(card);

    // Check for match when two cards are flipped
    if (gameState.flippedCards.length === 2) {
        gameState.moves++;
        updateGameUI();
        checkForMatch();
    }
}

// Check for Match
function checkForMatch() {
    const [card1, card2] = gameState.flippedCards;
    const value1 = card1.dataset.value;
    const value2 = card2.dataset.value;

    if (value1 === value2) {
        // Match found
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            gameState.matchedPairs++;
            gameState.flippedCards = [];
            
            // Calculate score
            gameState.score += calculateScore();
            
            updateGameUI();
            checkGameComplete();
        }, 600);
    } else {
        // No match
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            gameState.flippedCards = [];
        }, 1000);
    }
}

// Calculate Score
function calculateScore() {
    const baseScore = 100;
    const timeBonus = Math.max(0, 50 - gameState.timer);
    const movesPenalty = gameState.moves * 2;
    return baseScore + timeBonus - movesPenalty;
}

// Check Game Complete
function checkGameComplete() {
    const config = DIFFICULTY[gameState.difficulty];
    let totalPairs = config.pairs;
    
    if (gameState.mode === 'progressive') {
        totalPairs = Math.min(config.pairs, 4 + gameState.currentLevel);
    }

    if (gameState.matchedPairs === totalPairs) {
        if (gameState.mode === 'progressive' && gameState.currentLevel < 5) {
            // Next level
            setTimeout(() => {
                gameState.currentLevel++;
                nextLevel();
            }, 1000);
        } else {
            // Game over
            setTimeout(() => {
                endGame();
            }, 500);
        }
    }
}

// Next Level (Progressive Mode)
function nextLevel() {
    gameState.matchedPairs = 0;
    gameState.flippedCards = [];
    levelCount.textContent = gameState.currentLevel;
    
    // Add time bonus
    gameState.score += 500;
    
    createGameBoard();
    updateGameUI();
}

// Timer Functions
function startTimer() {
    clearInterval(gameState.timerInterval);
    const config = DIFFICULTY[gameState.difficulty];
    
    if (gameState.mode === 'timeattack' && config.timeLimit > 0) {
        // Countdown timer
        gameState.timer = config.timeLimit;
        gameState.timerInterval = setInterval(() => {
            if (!gameState.isPaused) {
                gameState.timer--;
                updateTimerDisplay();
                
                if (gameState.timer <= 0) {
                    clearInterval(gameState.timerInterval);
                    endGame(true); // Time's up
                }
            }
        }, 1000);
    } else {
        // Count up timer
        gameState.timer = 0;
        gameState.timerInterval = setInterval(() => {
            if (!gameState.isPaused) {
                gameState.timer++;
                updateTimerDisplay();
            }
        }, 1000);
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timer / 60);
    const seconds = gameState.timer % 60;
    timer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Pause/Resume
function pauseGame() {
    gameState.isPaused = true;
    pauseModal.classList.add('active');
}

function resumeGame() {
    gameState.isPaused = false;
    pauseModal.classList.remove('active');
}

// Restart Game
function restartGame() {
    clearInterval(gameState.timerInterval);
    startGame();
}

// Quit Game
function quitGame() {
    clearInterval(gameState.timerInterval);
    pauseModal.classList.remove('active');
    gameOverModal.classList.remove('active');
    showMenu();
}

// Play Again
function playAgain() {
    gameOverModal.classList.remove('active');
    startGame();
}

// End Game
function endGame(timeUp = false) {
    clearInterval(gameState.timerInterval);
    
    // Calculate final score
    const finalScore = Math.max(0, gameState.score);
    
    // Update modal
    document.getElementById('gameOverTitle').textContent = 
        timeUp ? "Time's Up!" : "Congratulations!";
    document.getElementById('finalTime').textContent = timer.textContent;
    document.getElementById('finalMoves').textContent = gameState.moves;
    document.getElementById('finalScore').textContent = finalScore;
    
    // Save high score
    const isNewRecord = saveHighScore(finalScore);
    if (isNewRecord && !timeUp) {
        document.getElementById('newRecordBanner').style.display = 'block';
    } else {
        document.getElementById('newRecordBanner').style.display = 'none';
    }
    
    gameOverModal.classList.add('active');
}

// Update Game UI
function updateGameUI() {
    movesCount.textContent = gameState.moves;
    const config = DIFFICULTY[gameState.difficulty];
    let totalPairs = config.pairs;
    
    if (gameState.mode === 'progressive') {
        totalPairs = Math.min(config.pairs, 4 + gameState.currentLevel);
    }
    
    matchesCount.textContent = `${gameState.matchedPairs}/${totalPairs}`;
}

// High Scores Management
function saveHighScore(score) {
    const scores = getHighScores();
    const newScore = {
        theme: gameState.theme,
        difficulty: gameState.difficulty,
        mode: gameState.mode,
        score: score,
        moves: gameState.moves,
        time: timer.textContent,
        date: new Date().toLocaleDateString()
    };
    
    scores.push(newScore);
    scores.sort((a, b) => b.score - a.score);
    const topScores = scores.slice(0, 50);
    
    localStorage.setItem('memoryGameScores', JSON.stringify(topScores));
    
    // Check if it's in top 10
    return scores.indexOf(newScore) < 10;
}

function getHighScores() {
    const scores = localStorage.getItem('memoryGameScores');
    return scores ? JSON.parse(scores) : [];
}

function loadHighScores() {
    filterHighScores('all');
}

function filterHighScores(filter) {
    const scores = getHighScores();
    const scoresList = document.getElementById('scoresList');
    
    let filteredScores = scores;
    if (filter !== 'all') {
        filteredScores = scores.filter(s => s.theme === filter);
    }
    
    if (filteredScores.length === 0) {
        scoresList.innerHTML = '<div class="empty-scores">No scores yet. Play a game to set a record!</div>';
        return;
    }
    
    scoresList.innerHTML = filteredScores.slice(0, 20).map((score, index) => `
        <div class="score-item">
            <div class="score-rank">#${index + 1}</div>
            <div class="score-info">
                <div class="theme-mode">${capitalize(score.theme)} - ${capitalize(score.mode)}</div>
                <div class="difficulty">${capitalize(score.difficulty)} • ${score.date}</div>
            </div>
            <div class="score-stats">
                <span>🏆 ${score.score}</span>
                <span>⏱️ ${score.time}</span>
                <span>👣 ${score.moves}</span>
            </div>
        </div>
    `).join('');
}

// Screen Management
function switchScreen(screen) {
    [menuScreen, gameScreen, highScoresScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

function showMenu() {
    switchScreen(menuScreen);
}

function showHighScores() {
    switchScreen(highScoresScreen);
    loadHighScores();
}

// Utility Functions
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gameScreen.classList.contains('active')) {
        if (pauseModal.classList.contains('active')) {
            resumeGame();
        } else if (!gameOverModal.classList.contains('active')) {
            pauseGame();
        }
    }
});
