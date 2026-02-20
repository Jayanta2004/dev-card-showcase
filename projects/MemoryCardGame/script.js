// Game State
let gameState = {
    theme: 'emojis',
    difficulty: 'easy',
    mode: 'classic',
    moves: 0,
    time: 0,
    timerInterval: null,
    isPaused: false,
    firstCard: null,
    secondCard: null,
    lockBoard: false,
    pairsFound: 0,
    totalPairs: 0,
    currentLevel: 1,
    cards: []
};

// Theme Data
const themes = {
    emojis: ['😀', '😂', '😍', '🤩', '😎', '🥳', '😇', '🤠', '🥵', '🥶', '😱', '🤯', '🥴', '😴', '🤓', '🧐'],
    flags: ['🇺🇸', '🇬🇧', '🇫🇷', '🇩🇪', '🇪🇸', '🇮🇹', '🇯🇵', '🇨🇳', '🇮🇳', '🇧🇷', '🇨🇦', '🇦🇺', '🇰🇷', '🇲🇽', '🇷🇺', '🇿🇦'],
    programming: ['⚛️', '🅰️', '📘', '🐍', '☕', '⚡', '🔷', '🟢', '🔴', '🟣', '🟡', '💎', '🦀', '🐹', '🐿️', '🦕']
};

// Difficulty Settings
const difficultySettings = {
    easy: { rows: 3, cols: 4, timeLimit: 0 },
    medium: { rows: 4, cols: 4, timeLimit: 120 },
    hard: { rows: 4, cols: 6, timeLimit: 180 }
};

// DOM Elements
const menuScreen = document.getElementById('menu');
const gameScreen = document.getElementById('gameScreen');
const highScoresScreen = document.getElementById('highScoresScreen');
const gameBoard = document.getElementById('gameBoard');
const moveCount = document.getElementById('moveCount');
const timer = document.getElementById('timer');
const pairsFoundEl = document.getElementById('pairsFound');
const totalPairsEl = document.getElementById('totalPairs');
const levelIndicator = document.getElementById('levelIndicator');
const currentLevelEl = document.getElementById('currentLevel');
const gameOverModal = document.getElementById('gameOverModal');
const pauseModal = document.getElementById('pauseModal');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadHighScores();
});

// Event Listeners Setup
function setupEventListeners() {
    // Theme Selection
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.theme = btn.dataset.theme;
        });
    });

    // Difficulty Selection
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.difficulty = btn.dataset.difficulty;
        });
    });

    // Mode Selection
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.mode = btn.dataset.mode;
        });
    });

    // Start Game
    document.getElementById('startGame').addEventListener('click', startGame);

    // Game Controls
    document.getElementById('pauseBtn').addEventListener('click', pauseGame);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('menuBtn').addEventListener('click', () => {
        pauseGame();
        document.getElementById('quitGame').click();
    });

    // High Scores
    document.getElementById('viewHighScores').addEventListener('click', showHighScores);
    document.getElementById('backToMenu').addEventListener('click', () => {
        highScoresScreen.classList.remove('active');
        menuScreen.classList.add('active');
    });
    document.getElementById('clearScores').addEventListener('click', clearAllScores);

    // Score Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            displayHighScores(btn.dataset.filter);
        });
    });

    // Modal Buttons
    document.getElementById('playAgain').addEventListener('click', () => {
        gameOverModal.classList.remove('active');
        restartGame();
    });

    document.getElementById('backToMenuFromModal').addEventListener('click', () => {
        gameOverModal.classList.remove('active');
        gameScreen.classList.remove('active');
        menuScreen.classList.add('active');
        stopTimer();
    });

    document.getElementById('resumeGame').addEventListener('click', resumeGame);
    document.getElementById('quitGame').addEventListener('click', () => {
        pauseModal.classList.remove('active');
        gameScreen.classList.remove('active');
        menuScreen.classList.add('active');
        stopTimer();
    });
}

// Start Game
function startGame() {
    menuScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    resetGameState();
    createBoard();
    startTimer();
    
    if (gameState.mode === 'progressive') {
        levelIndicator.style.display = 'block';
        currentLevelEl.textContent = gameState.currentLevel;
    } else {
        levelIndicator.style.display = 'none';
    }
}

// Reset Game State
function resetGameState() {
    gameState.moves = 0;
    gameState.time = 0;
    gameState.pairsFound = 0;
    gameState.firstCard = null;
    gameState.secondCard = null;
    gameState.lockBoard = false;
    gameState.isPaused = false;
    
    if (gameState.mode !== 'progressive') {
        gameState.currentLevel = 1;
    }
    
    updateStats();
}

// Create Game Board
function createBoard() {
    gameBoard.innerHTML = '';
    
    const settings = difficultySettings[gameState.difficulty];
    const totalCards = settings.rows * settings.cols;
    gameState.totalPairs = totalCards / 2;
    
    // Adjust difficulty for progressive mode
    let cardCount = totalCards;
    if (gameState.mode === 'progressive') {
        const levelMultiplier = Math.min(gameState.currentLevel, 3);
        cardCount = Math.min(totalCards, 12 + (levelMultiplier - 1) * 4);
    }
    
    // Get theme icons
    const themeIcons = themes[gameState.theme];
    const selectedIcons = themeIcons.slice(0, cardCount / 2);
    const cardValues = [...selectedIcons, ...selectedIcons];
    shuffleArray(cardValues);
    
    // Set grid class
    gameBoard.className = `game-board ${gameState.difficulty}`;
    
    // Create cards
    gameState.cards = cardValues.map((value, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.value = value;
        card.dataset.index = index;
        
        card.innerHTML = `
            <div class="card-front"></div>
            <div class="card-back">${value}</div>
        `;
        
        card.addEventListener('click', () => flipCard(card));
        gameBoard.appendChild(card);
        
        return card;
    });
    
    totalPairsEl.textContent = gameState.totalPairs;
}

// Flip Card
function flipCard(card) {
    if (gameState.lockBoard) return;
    if (gameState.isPaused) return;
    if (card === gameState.firstCard) return;
    if (card.classList.contains('matched')) return;
    
    card.classList.add('flipped');
    
    if (!gameState.firstCard) {
        gameState.firstCard = card;
        return;
    }
    
    gameState.secondCard = card;
    gameState.moves++;
    updateStats();
    
    checkForMatch();
}

// Check for Match
function checkForMatch() {
    const isMatch = gameState.firstCard.dataset.value === gameState.secondCard.dataset.value;
    
    if (isMatch) {
        disableCards();
        gameState.pairsFound++;
        updateStats();
        
        if (gameState.pairsFound === gameState.totalPairs) {
            setTimeout(() => handleGameComplete(), 500);
        }
    } else {
        unflipCards();
    }
}

// Disable Matched Cards
function disableCards() {
    gameState.firstCard.classList.add('matched');
    gameState.secondCard.classList.add('matched');
    resetBoard();
}

// Unflip Cards
function unflipCards() {
    gameState.lockBoard = true;
    
    setTimeout(() => {
        gameState.firstCard.classList.remove('flipped');
        gameState.secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

// Reset Board
function resetBoard() {
    [gameState.firstCard, gameState.secondCard] = [null, null];
    gameState.lockBoard = false;
}

// Timer Functions
function startTimer() {
    stopTimer();
    gameState.timerInterval = setInterval(() => {
        if (!gameState.isPaused) {
            gameState.time++;
            updateStats();
            
            // Time attack mode countdown
            if (gameState.mode === 'timeattack') {
                const settings = difficultySettings[gameState.difficulty];
                if (settings.timeLimit && gameState.time >= settings.timeLimit) {
                    handleTimeUp();
                }
            }
        }
    }, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Update Stats Display
function updateStats() {
    moveCount.textContent = gameState.moves;
    timer.textContent = formatTime(gameState.time);
    pairsFoundEl.textContent = gameState.pairsFound;
    totalPairsEl.textContent = gameState.totalPairs;
    
    if (gameState.mode === 'progressive') {
        currentLevelEl.textContent = gameState.currentLevel;
    }
}

// Handle Game Complete
function handleGameComplete() {
    stopTimer();
    
    const score = calculateScore();
    const isHighScore = checkHighScore(score);
    
    if (gameState.mode === 'progressive') {
        // Progressive mode - continue to next level
        gameState.currentLevel++;
        showLevelCompleteModal(score, isHighScore);
    } else {
        // Other modes - show game over
        showGameOverModal(score, isHighScore);
    }
}

// Handle Time Up (Time Attack Mode)
function handleTimeUp() {
    stopTimer();
    document.getElementById('gameOverTitle').textContent = '⏰ Time\'s Up!';
    const score = calculateScore();
    showGameOverModal(score, false);
}

// Calculate Score
function calculateScore() {
    const baseScore = gameState.pairsFound * 100;
    const moveBonus = Math.max(0, 500 - (gameState.moves * 10));
    const timeBonus = gameState.mode === 'timeattack' 
        ? Math.max(0, difficultySettings[gameState.difficulty].timeLimit - gameState.time) * 5
        : Math.max(0, 300 - gameState.time);
    
    const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 }[gameState.difficulty];
    const levelBonus = gameState.mode === 'progressive' ? gameState.currentLevel * 200 : 0;
    
    return Math.round((baseScore + moveBonus + timeBonus + levelBonus) * difficultyMultiplier);
}

// Show Game Over Modal
function showGameOverModal(score, isHighScore) {
    document.getElementById('gameOverTitle').textContent = '🎉 Congratulations!';
    document.getElementById('finalTime').textContent = formatTime(gameState.time);
    document.getElementById('finalMoves').textContent = gameState.moves;
    document.getElementById('finalScore').textContent = score.toLocaleString();
    
    const newHighScoreRow = document.getElementById('newHighScoreRow');
    if (isHighScore) {
        newHighScoreRow.style.display = 'block';
        saveHighScore(score);
    } else {
        newHighScoreRow.style.display = 'none';
    }
    
    gameOverModal.classList.add('active');
}

// Show Level Complete Modal (Progressive Mode)
function showLevelCompleteModal(score, isHighScore) {
    document.getElementById('gameOverTitle').textContent = `🎯 Level ${gameState.currentLevel - 1} Complete!`;
    document.getElementById('finalTime').textContent = formatTime(gameState.time);
    document.getElementById('finalMoves').textContent = gameState.moves;
    document.getElementById('finalScore').textContent = score.toLocaleString();
    
    document.getElementById('newHighScoreRow').style.display = 'none';
    document.getElementById('playAgain').textContent = 'Next Level';
    
    gameOverModal.classList.add('active');
}

// Pause Game
function pauseGame() {
    if (!gameState.isPaused) {
        gameState.isPaused = true;
        pauseModal.classList.add('active');
    }
}

// Resume Game
function resumeGame() {
    gameState.isPaused = false;
    pauseModal.classList.remove('active');
}

// Restart Game
function restartGame() {
    stopTimer();
    if (gameState.mode === 'progressive') {
        gameState.currentLevel = 1;
    }
    startGame();
}

// High Scores Management
function saveHighScore(score) {
    const highScores = JSON.parse(localStorage.getItem('memoryGameHighScores') || '[]');
    
    const newScore = {
        score: score,
        moves: gameState.moves,
        time: gameState.time,
        theme: gameState.theme,
        difficulty: gameState.difficulty,
        mode: gameState.mode,
        level: gameState.currentLevel,
        date: new Date().toISOString()
    };
    
    highScores.push(newScore);
    highScores.sort((a, b) => b.score - a.score);
    
    // Keep top 50 scores
    if (highScores.length > 50) {
        highScores.length = 50;
    }
    
    localStorage.setItem('memoryGameHighScores', JSON.stringify(highScores));
}

function checkHighScore(score) {
    const highScores = JSON.parse(localStorage.getItem('memoryGameHighScores') || '[]');
    
    if (highScores.length < 10) return true;
    
    const lowestTopScore = highScores.slice(0, 10).reduce((min, s) => 
        Math.min(min, s.score), Infinity);
    
    return score > lowestTopScore;
}

function loadHighScores() {
    displayHighScores('all');
}

function showHighScores() {
    menuScreen.classList.remove('active');
    highScoresScreen.classList.add('active');
    displayHighScores('all');
}

function displayHighScores(filter) {
    const scoresList = document.getElementById('scoresList');
    const highScores = JSON.parse(localStorage.getItem('memoryGameHighScores') || '[]');
    
    let filteredScores = highScores;
    if (filter !== 'all') {
        filteredScores = highScores.filter(s => s.theme === filter);
    }
    
    if (filteredScores.length === 0) {
        scoresList.innerHTML = '<div class="no-scores-message">No high scores yet. Play a game to set a record!</div>';
        return;
    }
    
    scoresList.innerHTML = filteredScores.slice(0, 20).map((score, index) => `
        <div class="score-item">
            <div class="score-rank">#${index + 1}</div>
            <div class="score-details">
                <div class="score-theme">${capitalizeFirst(score.theme)} - ${capitalizeFirst(score.difficulty)} - ${capitalizeFirst(score.mode)}</div>
                <div class="score-mode">${formatTime(score.time)} | ${score.moves} moves</div>
            </div>
            <div class="score-stats">
                <span class="score-value">${score.score.toLocaleString()}</span>
                <span class="score-time">${formatDate(score.date)}</span>
            </div>
        </div>
    `).join('');
}

function clearAllScores() {
    if (confirm('Are you sure you want to clear all high scores? This cannot be undone!')) {
        localStorage.removeItem('memoryGameHighScores');
        displayHighScores('all');
    }
}

// Utility Functions
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString();
}

// Keyboard Support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (gameOverModal.classList.contains('active')) {
            gameOverModal.classList.remove('active');
        } else if (pauseModal.classList.contains('active')) {
            resumeGame();
        } else if (gameScreen.classList.contains('active')) {
            pauseGame();
        }
    }
});
