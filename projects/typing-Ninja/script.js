        // Game variables
        let score = 0;
        let lives = 3;
        let time = 60;
        let wordsCut = 0;
        let combo = 0;
        let gameActive = false;
        let gameInterval;
        let wordInterval;
        let wordSpeed = 1.5;
        let wordFrequency = 2000; // ms
        let wordList = [];

        // DOM elements
        const gameArea = document.getElementById('gameArea');
        const wordInput = document.getElementById('word-input');
        const scoreElement = document.getElementById('score');
        const livesElement = document.getElementById('lives');
        const timeElement = document.getElementById('time');
        const wordsCutElement = document.getElementById('words-cut');
        const comboDisplay = document.getElementById('comboDisplay');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const restartBtn = document.getElementById('restartBtn');
        const gameMessage = document.getElementById('gameMessage');
        const messageTitle = document.getElementById('messageTitle');
        const messageText = document.getElementById('messageText');
        const messageBtn = document.getElementById('messageBtn');
        const difficultySelect = document.getElementById('difficulty');

        // Word lists by difficulty
        const wordLists = {
            easy: ["cat", "dog", "sun", "moon", "star", "tree", "book", "pen", "car", "house", 
                   "bird", "fish", "rain", "snow", "fire", "water", "earth", "wind", "love", "code"],
            medium: ["javascript", "python", "computer", "keyboard", "monitor", "programming",
                     "algorithm", "database", "network", "internet", "browser", "developer",
                     "framework", "function", "variable", "constant", "syntax", "paradigm"],
            hard: ["asynchronous", "concurrency", "polymorphism", "encapsulation", 
                   "inheritance", "recursion", "heuristic", "quantum", "blockchain",
                   "cryptography", "neural", "algorithmic", "complexity", "optimization"],
            ninja: ["supercalifragilisticexpialidocious", "antidisestablishmentarianism",
                    "pneumonoultramicroscopicsilicovolcanoconiosis", "hippopotomonstrosesquippedaliophobia",
                    "floccinaucinihilipilification", "pseudopseudohypoparathyroidism"]
        };

        // Initialize game
        function initGame() {
            score = 0;
            lives = 3;
            time = 60;
            wordsCut = 0;
            combo = 0;
            gameArea.innerHTML = '<div class="combo-display" id="comboDisplay"></div>';
            comboDisplay.style.display = 'none';
            updateUI();
            setDifficulty();
        }

        // Set difficulty
        function setDifficulty() {
            const difficulty = difficultySelect.value;
            wordList = wordLists[difficulty];
            
            switch(difficulty) {
                case 'easy':
                    wordSpeed = 1;
                    wordFrequency = 2500;
                    break;
                case 'medium':
                    wordSpeed = 1.5;
                    wordFrequency = 2000;
                    break;
                case 'hard':
                    wordSpeed = 2;
                    wordFrequency = 1500;
                    break;
                case 'ninja':
                    wordSpeed = 2.5;
                    wordFrequency = 1000;
                    break;
            }
        }

        // Start game
        function startGame() {
            if (gameActive) return;
            
            initGame();
            gameActive = true;
            wordInput.disabled = false;
            wordInput.focus();
            
            // Start game timer
            gameInterval = setInterval(() => {
                time--;
                updateUI();
                
                if (time <= 0) {
                    endGame(true); // Win (time ran out but survived)
                }
            }, 1000);
            
            // Start generating words
            wordInterval = setInterval(generateWord, wordFrequency);
            
            startBtn.disabled = true;
        }

        // Pause game
        function pauseGame() {
            if (!gameActive) return;
            
            gameActive = !gameActive;
            
            if (!gameActive) {
                clearInterval(gameInterval);
                clearInterval(wordInterval);
                wordInput.disabled = true;
                pauseBtn.textContent = 'Resume';
            } else {
                gameInterval = setInterval(() => {
                    time--;
                    updateUI();
                    
                    if (time <= 0) {
                        endGame(true);
                    }
                }, 1000);
                
                wordInterval = setInterval(generateWord, wordFrequency);
                wordInput.disabled = false;
                wordInput.focus();
                pauseBtn.textContent = 'Pause';
            }
        }

        // Generate random word
        function generateWord() {
            if (!gameActive) return;
            
            const word = wordList[Math.floor(Math.random() * wordList.length)];
            const wordElement = document.createElement('div');
            wordElement.className = 'word';
            wordElement.textContent = word;
            wordElement.dataset.word = word.toLowerCase();
            
            // Random horizontal position
            const maxLeft = gameArea.offsetWidth - 150;
            const leftPos = Math.random() * maxLeft;
            wordElement.style.left = leftPos + 'px';
            wordElement.style.top = '0px';
            
            gameArea.appendChild(wordElement);
            
            // Animate word falling
            let topPos = 0;
            const fallInterval = setInterval(() => {
                if (!gameActive) {
                    clearInterval(fallInterval);
                    return;
                }
                
                topPos += wordSpeed;
                wordElement.style.top = topPos + 'px';
                
                // Check if word hit bottom
                if (topPos > gameArea.offsetHeight - 50) {
                    clearInterval(fallInterval);
                    wordElement.remove();
                    loseLife();
                }
            }, 16);
            
            // Store interval ID for cleanup
            wordElement.dataset.interval = fallInterval;
        }

        // Check typed word
        wordInput.addEventListener('input', function() {
            if (!gameActive) return;
            
            const typedWord = this.value.trim().toLowerCase();
            const words = document.querySelectorAll('.word');
            
            words.forEach(wordElement => {
                const targetWord = wordElement.dataset.word;
                
                if (typedWord === targetWord) {
                    // Word matched!
                    clearInterval(parseInt(wordElement.dataset.interval));
                    wordElement.classList.add('cutting');
                    
                    // Update score and combo
                    combo++;
                    score += 10 * combo;
                    wordsCut++;
                    
                    // Show combo
                    showCombo(combo, wordElement);
                    
                    // Remove word after animation
                    setTimeout(() => {
                        wordElement.remove();
                    }, 500);
                    
                    // Clear input
                    this.value = '';
                    
                    // Update UI
                    updateUI();
                }
            });
            
            // Reset combo if input is cleared
            if (typedWord === '' && combo > 0) {
                combo = 0;
                comboDisplay.style.display = 'none';
            }
        });

        // Show combo effect
        function showCombo(comboCount, element) {
            if (comboCount > 1) {
                const rect = element.getBoundingClientRect();
                const gameRect = gameArea.getBoundingClientRect();
                
                comboDisplay.textContent = `${comboCount}x COMBO!`;
                comboDisplay.style.left = (rect.left - gameRect.left + rect.width/2) + 'px';
                comboDisplay.style.top = (rect.top - gameRect.top) + 'px';
                comboDisplay.style.display = 'block';
                
                // Hide after 1 second
                setTimeout(() => {
                    comboDisplay.style.display = 'none';
                }, 1000);
            }
        }

        // Lose a life
        function loseLife() {
            lives--;
            updateUI();
            combo = 0;
            comboDisplay.style.display = 'none';
            
            // Visual feedback for losing life
            gameArea.style.borderColor = '#ff0000';
            setTimeout(() => {
                if (gameActive) {
                    gameArea.style.borderColor = '#00ff88';
                }
            }, 300);
            
            if (lives <= 0) {
                endGame(false); // Lose
            }
        }

        // Update UI elements
        function updateUI() {
            scoreElement.textContent = score;
            livesElement.textContent = lives;
            timeElement.textContent = time;
            wordsCutElement.textContent = wordsCut;
        }

        // End game
        function endGame(isWin) {
            gameActive = false;
            clearInterval(gameInterval);
            clearInterval(wordInterval);
            
            // Clear all words
            document.querySelectorAll('.word').forEach(word => {
                clearInterval(parseInt(word.dataset.interval));
                word.remove();
            });
            
            wordInput.disabled = true;
            startBtn.disabled = false;
            
            // Show message
            if (isWin) {
                messageTitle.textContent = 'Victory!';
                messageText.textContent = `You survived with ${lives} lives left! Final Score: ${score}`;
            } else {
                messageTitle.textContent = 'Game Over';
                messageText.textContent = `You cut ${wordsCut} words. Final Score: ${score}`;
            }
            
            gameMessage.style.display = 'block';
        }

        // Restart game
        function restartGame() {
            initGame();
            startGame();
            gameMessage.style.display = 'none';
        }

        // Event listeners
        startBtn.addEventListener('click', startGame);
        pauseBtn.addEventListener('click', pauseGame);
        restartBtn.addEventListener('click', restartGame);
        messageBtn.addEventListener('click', restartGame);
        difficultySelect.addEventListener('change', setDifficulty);

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !gameActive) {
                startGame();
                e.preventDefault();
            }
            
            if (e.code === 'Escape' && gameActive) {
                pauseGame();
            }
            
            if (e.code === 'Enter' && gameMessage.style.display === 'block') {
                restartGame();
            }
        });

        // Focus input when clicking game area
        gameArea.addEventListener('click', () => {
            if (gameActive) {
                wordInput.focus();
            }
        });

        // Initialize on load
        initGame();
        setDifficulty();