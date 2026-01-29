document.addEventListener('DOMContentLoaded', function() {
    // Game Configuration
    const gameConfig = {
        difficulty: 'easy',
        theme: 'animals',
        soundEnabled: true,
        gridSizes: {
            easy: { rows: 4, cols: 4, totalPairs: 8 },
            medium: { rows: 4, cols: 6, totalPairs: 12 },
            hard: { rows: 6, cols: 6, totalPairs: 18 }
        }
    };

    // Theme Icons
    const themeIcons = {
        animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'],
        fruits: ['🍎', '🍌', '🍇', '🍓', '🍉', '🍊', '🍋', '🍒', '🍑', '🥭', '🍍', '🥝'],
        emojis: ['😀', '😎', '🤩', '😍', '🤗', '😜', '😇', '🤠', '🥳', '😋', '🤓', '🥰'],
        vehicles: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚']
    };

    // Game State
    let gameState = {
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        moves: 0,
        score: 0,
        time: 0,
        timer: null,
        gameStarted: false,
        canFlip: true
    };

    // DOM Elements
    const elements = {
        gameBoard: document.getElementById('game-board'),
        timeDisplay: document.getElementById('time'),
        movesDisplay: document.getElementById('moves'),
        scoreDisplay: document.getElementById('score'),
        matchesDisplay: document.getElementById('matches'),
        gameStatus: document.getElementById('game-status'),
        welcomeScreen: document.getElementById('welcome-screen'),
        celebrationModal: document.getElementById('celebration-modal'),
        finalTime: document.getElementById('final-time'),
        finalMoves: document.getElementById('final-moves'),
        finalScore: document.getElementById('final-score'),
        yourScore: document.getElementById('your-score'),
        leaderboard: document.getElementById('leaderboard')
    };

    // Sound Elements
    const sounds = {
        flip: document.getElementById('flip-sound'),
        match: document.getElementById('match-sound'),
        win: document.getElementById('win-sound'),
        hint: document.getElementById('hint-sound')
    };

    // Initialize Game
    function initGame() {
        setupEventListeners();
        updateLeaderboard();
    }

    // Event Listeners
    function setupEventListeners() {
        // Difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                gameConfig.difficulty = this.dataset.level;
                resetGame();
            });
        });

        // Theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                gameConfig.theme = this.dataset.theme;
                resetGame();
            });
        });

        // Control buttons
        document.getElementById('start-game').addEventListener('click', startGame);
        document.getElementById('reset-game').addEventListener('click', resetGame);
        document.getElementById('sound-toggle').addEventListener('click', toggleSound);
        document.getElementById('hint-btn').addEventListener('click', showHint);
        document.getElementById('play-again').addEventListener('click', playAgain);
        document.getElementById('close-modal').addEventListener('click', closeModal);
    }

    // Start Game
    function startGame() {
        if (gameState.gameStarted) return;
        
        gameState.gameStarted = true;
        elements.welcomeScreen.style.display = 'none';
        elements.gameStatus.textContent = 'Game Started! Find matching pairs!';
        
        createCards();
        startTimer();
        
        // Update start button text
        const startBtn = document.getElementById('start-game');
        startBtn.innerHTML = '<i class="fas fa-play"></i> Game Running!';
        startBtn.disabled = true;
    }

    // Create Cards
    function createCards() {
        const grid = gameConfig.gridSizes[gameConfig.difficulty];
        const totalPairs = grid.totalPairs;
        const icons = themeIcons[gameConfig.theme];
        
        // Select random icons for this game
        const selectedIcons = [];
        while (selectedIcons.length < totalPairs) {
            const randomIcon = icons[Math.floor(Math.random() * icons.length)];
            if (!selectedIcons.includes(randomIcon)) {
                selectedIcons.push(randomIcon);
            }
        }
        
        // Create pairs
        let cardValues = [];
        selectedIcons.forEach(icon => {
            cardValues.push(icon, icon);
        });
        
        // Shuffle cards
        cardValues = shuffleArray(cardValues);
        
        // Clear game board
        elements.gameBoard.innerHTML = '';
        
        // Create cards grid
        const cardsGrid = document.createElement('div');
        cardsGrid.className = 'cards-grid';
        cardsGrid.style.gridTemplateColumns = `repeat(${grid.cols}, 1fr)`;
        cardsGrid.style.gridTemplateRows = `repeat(${grid.rows}, 1fr)`;
        
        // Create card elements
        gameState.cards = [];
        cardValues.forEach((value, index) => {
            const card = createCardElement(value, index);
            cardsGrid.appendChild(card);
            gameState.cards.push({
                element: card,
                value: value,
                isFlipped: false,
                isMatched: false,
                index: index
            });
        });
        
        elements.gameBoard.appendChild(cardsGrid);
        updateMatchesDisplay();
    }

    // Create Card Element
    function createCardElement(value, index) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        
        const content = document.createElement('div');
        content.className = 'card-content';
        content.textContent = '?';
        
        card.appendChild(content);
        
        card.addEventListener('click', () => flipCard(index));
        
        return card;
    }

    // Flip Card
    function flipCard(index) {
        if (!gameState.gameStarted || !gameState.canFlip) return;
        
        const card = gameState.cards[index];
        if (card.isFlipped || card.isMatched) return;
        
        // Flip the card
        card.isFlipped = true;
        card.element.classList.add('flipped');
        card.element.querySelector('.card-content').textContent = card.value;
        
        gameState.flippedCards.push(card);
        
        // Play sound
        if (gameConfig.soundEnabled) {
            sounds.flip.currentTime = 0;
            sounds.flip.play();
        }
        
        // Check for match
        if (gameState.flippedCards.length === 2) {
            gameState.canFlip = false;
            gameState.moves++;
            elements.movesDisplay.textContent = gameState.moves;
            
            setTimeout(checkMatch, 500);
        }
    }

    // Check for Match
    function checkMatch() {
        const [card1, card2] = gameState.flippedCards;
        
        if (card1.value === card2.value) {
            // Match found
            card1.isMatched = true;
            card2.isMatched = true;
            
            card1.element.classList.add('matched');
            card2.element.classList.add('matched');
            
            gameState.matchedPairs++;
            gameState.score += 100;
            
            // Bonus for quick matches
            if (gameState.time < 30) {
                gameState.score += 50;
            }
            
            updateScore();
            updateMatchesDisplay();
            
            // Play match sound
            if (gameConfig.soundEnabled) {
                sounds.match.currentTime = 0;
                sounds.match.play();
            }
            
            // Check for win
            const totalPairs = gameConfig.gridSizes[gameConfig.difficulty].totalPairs;
            if (gameState.matchedPairs === totalPairs) {
                endGame();
            }
        } else {
            // No match - flip cards back
            setTimeout(() => {
                card1.isFlipped = false;
                card2.isFlipped = false;
                
                card1.element.classList.remove('flipped');
                card2.element.classList.remove('flipped');
                
                card1.element.querySelector('.card-content').textContent = '?';
                card2.element.querySelector('.card-content').textContent = '?';
            }, 1000);
        }
        
        gameState.flippedCards = [];
        gameState.canFlip = true;
    }

    // Show Hint
    function showHint() {
        if (!gameState.gameStarted || gameState.moves < 3) return;
        
        // Find first unflipped card
        const unflippedCards = gameState.cards.filter(card => !card.isFlipped && !card.isMatched);
        if (unflippedCards.length === 0) return;
        
        // Take 3 moves as penalty
        gameState.moves += 3;
        elements.movesDisplay.textContent = gameState.moves;
        
        // Show hint by briefly flipping a card
        const hintCard = unflippedCards[Math.floor(Math.random() * unflippedCards.length)];
        hintCard.element.classList.add('flipped');
        hintCard.element.querySelector('.card-content').textContent = hintCard.value;
        
        // Play hint sound
        if (gameConfig.soundEnabled) {
            sounds.hint.currentTime = 0;
            sounds.hint.play();
        }
        
        // Flip back after 1 second
        setTimeout(() => {
            hintCard.element.classList.remove('flipped');
            hintCard.element.querySelector('.card-content').textContent = '?';
        }, 1000);
    }

    // Start Timer
    function startTimer() {
        clearInterval(gameState.timer);
        gameState.time = 0;
        updateTimeDisplay();
        
        gameState.timer = setInterval(() => {
            gameState.time++;
            updateTimeDisplay();
        }, 1000);
    }

    // Update Time Display
    function updateTimeDisplay() {
        const minutes = Math.floor(gameState.time / 60);
        const seconds = gameState.time % 60;
        elements.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Update Score
    function updateScore() {
        // Calculate score based on moves and time
        let calculatedScore = gameState.score;
        
        // Bonus for fewer moves
        const totalPairs = gameConfig.gridSizes[gameConfig.difficulty].totalPairs;
        const perfectMoves = totalPairs * 2;
        if (gameState.moves <= perfectMoves) {
            calculatedScore += 200;
        } else if (gameState.moves <= perfectMoves * 1.5) {
            calculatedScore += 100;
        }
        
        // Bonus for faster time
        if (gameState.time < 60) {
            calculatedScore += 150;
        } else if (gameState.time < 120) {
            calculatedScore += 100;
        } else if (gameState.time < 180) {
            calculatedScore += 50;
        }
        
        gameState.score = calculatedScore;
        elements.scoreDisplay.textContent = gameState.score;
        elements.yourScore.textContent = gameState.score;
    }

    // Update Matches Display
    function updateMatchesDisplay() {
        const totalPairs = gameConfig.gridSizes[gameConfig.difficulty].totalPairs;
        elements.matchesDisplay.textContent = `${gameState.matchedPairs}/${totalPairs}`;
    }

    // End Game
    function endGame() {
        clearInterval(gameState.timer);
        gameState.gameStarted = false;
        
        // Calculate final score
        updateScore();
        
        // Update final stats
        const minutes = Math.floor(gameState.time / 60);
        const seconds = gameState.time % 60;
        elements.finalTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        elements.finalMoves.textContent = gameState.moves;
        elements.finalScore.textContent = gameState.score;
        
        // Play win sound
        if (gameConfig.soundEnabled) {
            sounds.win.currentTime = 0;
            sounds.win.play();
        }
        
        // Show celebration modal
        setTimeout(() => {
            elements.celebrationModal.style.display = 'flex';
        }, 1000);
        
        // Update leaderboard
        updateLeaderboard();
    }

    // Reset Game
    function resetGame() {
        clearInterval(gameState.timer);
        
        gameState = {
            cards: [],
            flippedCards: [],
            matchedPairs: 0,
            moves: 0,
            score: 0,
            time: 0,
            timer: null,
            gameStarted: false,
            canFlip: true
        };
        
        elements.timeDisplay.textContent = '00:00';
        elements.movesDisplay.textContent = '0';
        elements.scoreDisplay.textContent = '0';
        elements.matchesDisplay.textContent = '0/8';
        elements.gameStatus.textContent = 'Ready to Play!';
        elements.welcomeScreen.style.display = 'block';
        
        // Clear game board
        elements.gameBoard.innerHTML = '';
        elements.gameBoard.appendChild(elements.welcomeScreen);
        
        // Reset start button
        const startBtn = document.getElementById('start-game');
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
        startBtn.disabled = false;
        
        // Update matches display based on difficulty
        const totalPairs = gameConfig.gridSizes[gameConfig.difficulty].totalPairs;
        elements.matchesDisplay.textContent = `0/${totalPairs}`;
    }

    // Play Again
    function playAgain() {
        closeModal();
        resetGame();
        startGame();
    }

    // Close Modal
    function closeModal() {
        elements.celebrationModal.style.display = 'none';
    }

    // Toggle Sound
    function toggleSound() {
        gameConfig.soundEnabled = !gameConfig.soundEnabled;
        const soundBtn = document.getElementById('sound-toggle');
        
        if (gameConfig.soundEnabled) {
            soundBtn.innerHTML = '<i class="fas fa-volume-up"></i> Sound On';
        } else {
            soundBtn.innerHTML = '<i class="fas fa-volume-mute"></i> Sound Off';
        }
    }

    // Update Leaderboard
    function updateLeaderboard() {
        // In a real app, you would save to localStorage or a backend
        // For now, we'll just update the "You!" score
        elements.yourScore.textContent = gameState.score;
        
        // Sort leaderboard items (simple simulation)
        const items = Array.from(elements.leaderboard.children);
        items.sort((a, b) => {
            const scoreA = parseInt(a.querySelector('.score').textContent);
            const scoreB = parseInt(b.querySelector('.score').textContent);
            return scoreB - scoreA;
        });
        
        // Update ranks
        items.forEach((item, index) => {
            item.querySelector('.rank').textContent = index + 1;
            elements.leaderboard.appendChild(item);
        });
    }

    // Utility Functions
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Initialize the game
    initGame();
});