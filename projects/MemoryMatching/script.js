        // Game variables
        const gameBoard = document.getElementById('game-board');
        const movesElement = document.getElementById('moves');
        const timerElement = document.getElementById('timer');
        const matchesElement = document.getElementById('matches');
        const restartButton = document.getElementById('restart');
        const resetButton = document.getElementById('reset');
        const winPopup = document.getElementById('win-popup');
        const winMovesElement = document.getElementById('win-moves');
        const winTimeElement = document.getElementById('win-time');
        const playAgainButton = document.getElementById('play-again');

        let cards = [];
        let flippedCards = [];
        let matchedPairs = 0;
        let moves = 0;
        let totalPairs = 8;
        let gameStarted = false;
        let timerInterval;
        let seconds = 0;
        let minutes = 0;

        // Card symbols
        const symbols = [
            'fa-heart', 'fa-star', 'fa-moon', 'fa-sun',
            'fa-cloud', 'fa-bolt', 'fa-gem', 'fa-rocket',
            'fa-heart', 'fa-star', 'fa-moon', 'fa-sun',
            'fa-cloud', 'fa-bolt', 'fa-gem', 'fa-rocket'
        ];

        // Initialize the game
        function initGame() {
            // Reset game state
            cards = [];
            flippedCards = [];
            matchedPairs = 0;
            moves = 0;
            gameStarted = false;
            seconds = 0;
            minutes = 0;
            
            // Clear the game board
            gameBoard.innerHTML = '';
            
            // Update UI
            movesElement.textContent = moves;
            matchesElement.textContent = `${matchedPairs}/${totalPairs}`;
            timerElement.textContent = '00:00';
            
            // Create shuffled cards
            const shuffledSymbols = shuffleArray([...symbols]);
            
            // Create card elements
            for (let i = 0; i < shuffledSymbols.length; i++) {
                const card = document.createElement('div');
                card.classList.add('card-container');
                
                card.innerHTML = `
                    <div class="card" data-id="${i}">
                        <div class="card-face card-front">
                            <i class="fas ${shuffledSymbols[i]}"></i>
                        </div>
                        <div class="card-face card-back">
                            <i class="fas fa-question"></i>
                        </div>
                    </div>
                `;
                
                card.addEventListener('click', () => flipCard(card));
                gameBoard.appendChild(card);
                
                // Store card data
                cards.push({
                    element: card,
                    symbol: shuffledSymbols[i],
                    id: i,
                    flipped: false,
                    matched: false
                });
            }
            
            // Hide win popup
            winPopup.style.display = 'none';
            
            // Stop any existing timer
            clearInterval(timerInterval);
        }

        // Shuffle array using Fisher-Yates algorithm
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        // Flip card function
        function flipCard(cardContainer) {
            // Don't flip if already flipped or matched
            const cardIndex = cards.findIndex(c => c.element === cardContainer);
            const card = cards[cardIndex];
            
            if (card.flipped || card.matched || flippedCards.length >= 2) {
                return;
            }
            
            // Start timer on first move
            if (!gameStarted) {
                startTimer();
                gameStarted = true;
            }
            
            // Flip the card
            const cardElement = cardContainer.querySelector('.card');
            cardElement.classList.add('flipped');
            card.flipped = true;
            flippedCards.push(card);
            
            // Check for match if two cards are flipped
            if (flippedCards.length === 2) {
                moves++;
                movesElement.textContent = moves;
                
                // Check if cards match
                if (flippedCards[0].symbol === flippedCards[1].symbol) {
                    // Match found
                    flippedCards[0].matched = true;
                    flippedCards[1].matched = true;
                    flippedCards[0].element.classList.add('matched');
                    flippedCards[1].element.classList.add('matched');
                    
                    matchedPairs++;
                    matchesElement.textContent = `${matchedPairs}/${totalPairs}`;
                    
                    // Clear flipped cards
                    flippedCards = [];
                    
                    // Check for win
                    if (matchedPairs === totalPairs) {
                        setTimeout(() => {
                            endGame();
                        }, 800);
                    }
                } else {
                    // No match, flip cards back after a delay
                    setTimeout(() => {
                        flippedCards[0].element.querySelector('.card').classList.remove('flipped');
                        flippedCards[1].element.querySelector('.card').classList.remove('flipped');
                        flippedCards[0].flipped = false;
                        flippedCards[1].flipped = false;
                        flippedCards = [];
                    }, 1000);
                }
            }
        }

        // Start game timer
        function startTimer() {
            clearInterval(timerInterval);
            seconds = 0;
            minutes = 0;
            
            timerInterval = setInterval(() => {
                seconds++;
                if (seconds === 60) {
                    minutes++;
                    seconds = 0;
                }
                
                const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
                const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
                timerElement.textContent = `${formattedMinutes}:${formattedSeconds}`;
            }, 1000);
        }

        // End game and show win popup
        function endGame() {
            clearInterval(timerInterval);
            
            // Update win popup stats
            winMovesElement.textContent = moves;
            winTimeElement.textContent = timerElement.textContent;
            
            // Show win popup
            winPopup.style.display = 'flex';
            
            // Create confetti
            createConfetti();
        }

        // Create confetti animation
        function createConfetti() {
            const colors = ['#ff9a9e', '#fad0c4', '#a1c4fd', '#c2e9fb', '#ffecd2', '#fcb69f'];
            const confettiCount = 150;
            
            for (let i = 0; i < confettiCount; i++) {
                const confetti = document.createElement('div');
                confetti.classList.add('confetti');
                
                // Random position
                const left = Math.random() * 100;
                const size = Math.random() * 15 + 5;
                const color = colors[Math.floor(Math.random() * colors.length)];
                const animationDuration = Math.random() * 3 + 2;
                const delay = Math.random() * 2;
                
                // Style confetti
                confetti.style.left = `${left}vw`;
                confetti.style.width = `${size}px`;
                confetti.style.height = `${size}px`;
                confetti.style.backgroundColor = color;
                confetti.style.animation = `confettiRain ${animationDuration}s ease-in ${delay}s forwards`;
                
                // Add to body
                document.body.appendChild(confetti);
                
                // Remove after animation
                setTimeout(() => {
                    confetti.remove();
                }, (animationDuration + delay) * 1000);
            }
        }

        // Event listeners
        restartButton.addEventListener('click', initGame);
        
        resetButton.addEventListener('click', () => {
            if (confirm("Are you sure you want to reset all game statistics?")) {
                initGame();
            }
        });
        
        playAgainButton.addEventListener('click', () => {
            initGame();
        });

        // Initialize the game on page load
        window.addEventListener('DOMContentLoaded', initGame);
