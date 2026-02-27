
        // Game variables
        let score = 0;
        let level = 1;
        let lives = 3;
        let timeLeft = 60;
        let combo = 0;
        let gameActive = false;
        let gamePaused = false;
        let gameInterval;
        let wordInterval;
        let timeInterval;
        let fallingWords = [];
        let difficulty = "easy";
        
        // DOM elements
        const gameArea = document.getElementById('game-area');
        const wordInput = document.getElementById('word-input');
        const scoreElement = document.getElementById('score');
        const levelElement = document.getElementById('level');
        const livesElement = document.getElementById('lives');
        const timeElement = document.getElementById('time');
        const comboDisplay = document.getElementById('combo-display');
        const gameOverScreen = document.getElementById('game-over');
        const finalScoreElement = document.getElementById('final-score');
        const wordCountElement = document.getElementById('word-count');
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const resetBtn = document.getElementById('reset-btn');
        const restartBtn = document.getElementById('restart-btn');
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        
        // Word lists for different difficulty levels
        const wordLists = {
            easy: ["code", "game", "type", "fast", "key", "word", "fun", "play", "test", "speed", 
                   "learn", "skill", "time", "goal", "hit", "run", "java", "html", "css", "web"],
            
            medium: ["programming", "keyboard", "velocity", "accuracy", "reaction", "developer", 
                    "algorithm", "function", "variable", "constant", "syntax", "debug", "compile", 
                    "execute", "iteration", "recursive", "optimize", "framework", "library"],
            
            hard: ["asynchronous", "cryptography", "quantum computing", "machine learning", 
                  "neural network", "blockchain", "virtualization", "microservices", 
                  "containerization", "authentication", "authorization", "refactoring", 
                  "polymorphism", "encapsulation", "inheritance", "abstraction"]
        };
        
        // Difficulty settings
        const difficultySettings = {
            easy: { speed: 1.5, spawnRate: 2000, wordLength: 5 },
            medium: { speed: 2.0, spawnRate: 1500, wordLength: 8 },
            hard: { speed: 2.5, spawnRate: 1000, wordLength: 12 }
        };
        
        // Initialize game
        function initGame() {
            score = 0;
            level = 1;
            lives = 3;
            timeLeft = 60;
            combo = 0;
            fallingWords = [];
            
            updateDisplay();
            wordInput.value = "";
            wordInput.disabled = false;
            wordInput.focus();
            
            // Clear game area
            gameArea.innerHTML = '<div class="word-count" id="word-count">Words: 0</div>';
            gameArea.appendChild(gameOverScreen);
            gameOverScreen.style.display = 'none';
            
            // Reset combo display
            comboDisplay.textContent = "";
            
            // Set active difficulty button
            difficultyBtns.forEach(btn => {
                if (btn.dataset.difficulty === difficulty) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
        
        // Start the game
        function startGame() {
            if (gameActive) return;
            
            gameActive = true;
            gamePaused = false;
            startBtn.disabled = true;
            pauseBtn.textContent = "PAUSE";
            
            // Start game loop
            gameInterval = setInterval(updateGame, 50);
            
            // Start spawning words
            const spawnRate = difficultySettings[difficulty].spawnRate;
            wordInterval = setInterval(spawnWord, spawnRate);
            
            // Start timer
            timeInterval = setInterval(updateTimer, 1000);
            
            // Focus input
            wordInput.focus();
        }
        
        // Pause/Resume game
        function togglePause() {
            if (!gameActive) return;
            
            gamePaused = !gamePaused;
            
            if (gamePaused) {
                clearInterval(gameInterval);
                clearInterval(wordInterval);
                clearInterval(timeInterval);
                pauseBtn.textContent = "RESUME";
                wordInput.disabled = true;
            } else {
                gameInterval = setInterval(updateGame, 50);
                const spawnRate = difficultySettings[difficulty].spawnRate;
                wordInterval = setInterval(spawnWord, spawnRate);
                timeInterval = setInterval(updateTimer, 1000);
                pauseBtn.textContent = "PAUSE";
                wordInput.disabled = false;
                wordInput.focus();
            }
        }
        
        // Reset game
        function resetGame() {
            clearInterval(gameInterval);
            clearInterval(wordInterval);
            clearInterval(timeInterval);
            gameActive = false;
            gamePaused = false;
            startBtn.disabled = false;
            pauseBtn.textContent = "PAUSE";
            initGame();
        }
        
        // Spawn a new falling word
        function spawnWord() {
            if (!gameActive || gamePaused) return;
            
            const wordList = wordLists[difficulty];
            const word = wordList[Math.floor(Math.random() * wordList.length)];
            
            // Create word element
            const wordElement = document.createElement('div');
            wordElement.className = 'word';
            wordElement.textContent = word;
            wordElement.dataset.word = word;
            
            // Random horizontal position
            const maxLeft = gameArea.offsetWidth - wordElement.offsetWidth;
            const leftPos = Math.floor(Math.random() * maxLeft);
            
            // Set initial position
            wordElement.style.left = `${leftPos}px`;
            wordElement.style.top = '-50px';
            
            // Random color for word
            const colors = ['#ff5555', '#55ff55', '#5555ff', '#ffff55', '#ff55ff', '#55ffff'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            wordElement.style.color = color;
            wordElement.style.border = `1px solid ${color}`;
            wordElement.style.backgroundColor = `${color}10`;
            
            // Add to game area
            gameArea.appendChild(wordElement);
            
            // Store word data
            fallingWords.push({
                element: wordElement,
                word: word,
                y: -50,
                speed: difficultySettings[difficulty].speed * (1 + level * 0.1)
            });
            
            // Update word count
            wordCountElement.textContent = `Words: ${fallingWords.length}`;
        }
        
        // Update game state
        function updateGame() {
            if (!gameActive || gamePaused) return;
            
            // Update each falling word
            for (let i = fallingWords.length - 1; i >= 0; i--) {
                const word = fallingWords[i];
                
                // Move word down
                word.y += word.speed;
                word.element.style.top = `${word.y}px`;
                
                // Check if word reached bottom
                if (word.y > gameArea.offsetHeight - 50) {
                    // Remove word
                    word.element.classList.add('missed');
                    setTimeout(() => {
                        if (word.element.parentNode) {
                            word.element.remove();
                        }
                    }, 500);
                    
                    // Remove from array
                    fallingWords.splice(i, 1);
                    
                    // Decrease lives
                    loseLife();
                    
                    // Reset combo
                    combo = 0;
                    updateComboDisplay();
                }
            }
            
            // Update word count
            wordCountElement.textContent = `Words: ${fallingWords.length}`;
        }
        
        // Update timer
        function updateTimer() {
            if (!gameActive || gamePaused) return;
            
            timeLeft--;
            timeElement.textContent = timeLeft;
            
            // Check if time is up
            if (timeLeft <= 0) {
                endGame();
            }
            
            // Update level based on time (every 15 seconds)
            const newLevel = Math.max(1, Math.floor((60 - timeLeft) / 15) + 1);
            if (newLevel > level) {
                level = newLevel;
                levelElement.textContent = level;
                
                // Show level up notification
                comboDisplay.textContent = `LEVEL UP! Level ${level}`;
                comboDisplay.style.color = '#ffff00';
                setTimeout(() => {
                    updateComboDisplay();
                }, 2000);
            }
        }
        
        // Handle word input
        wordInput.addEventListener('input', function() {
            if (!gameActive || gamePaused) return;
            
            // Highlight words that start with the input
            const inputValue = wordInput.value.toLowerCase();
            
            fallingWords.forEach(word => {
                if (word.word.startsWith(inputValue)) {
                    word.element.style.boxShadow = '0 0 10px #ffff00';
                    word.element.style.transform = 'scale(1.05)';
                } else {
                    word.element.style.boxShadow = 'none';
                    word.element.style.transform = 'scale(1)';
                }
            });
        });
        
        // Handle word submission
        wordInput.addEventListener('keydown', function(e) {
            if (!gameActive || gamePaused) return;
            
            if (e.key === 'Enter') {
                const inputValue = wordInput.value.trim().toLowerCase();
                
                if (inputValue === '') return;
                
                // Find matching word
                let wordFound = false;
                for (let i = 0; i < fallingWords.length; i++) {
                    const word = fallingWords[i];
                    
                    if (word.word === inputValue) {
                        // Word matched!
                        wordFound = true;
                        
                        // Remove word with animation
                        word.element.classList.add('typed');
                        setTimeout(() => {
                            if (word.element.parentNode) {
                                word.element.remove();
                            }
                        }, 300);
                        
                        // Remove from array
                        fallingWords.splice(i, 1);
                        
                        // Update score
                        updateScore(word.word.length * 10 * (1 + combo * 0.2));
                        
                        // Increase combo
                        combo++;
                        updateComboDisplay();
                        
                        break;
                    }
                }
                
                // Reset input
                wordInput.value = "";
                
                // If word not found, reset combo
                if (!wordFound) {
                    combo = 0;
                    updateComboDisplay();
                    
                    // Shake input to indicate error
                    wordInput.style.borderColor = '#ff5555';
                    wordInput.style.boxShadow = '0 0 10px #ff5555';
                    setTimeout(() => {
                        wordInput.style.borderColor = '#00ffcc';
                        wordInput.style.boxShadow = '0 0 10px rgba(0, 255, 204, 0.5)';
                    }, 500);
                }
            }
        });
        
        // Update score
        function updateScore(points) {
            score += Math.floor(points);
            scoreElement.textContent = score;
            
            // Animate score update
            scoreElement.style.transform = 'scale(1.3)';
            setTimeout(() => {
                scoreElement.style.transform = 'scale(1)';
            }, 200);
        }
        
        // Update combo display
        function updateComboDisplay() {
            if (combo > 1) {
                comboDisplay.textContent = `${combo}x COMBO! +${Math.floor(combo * 5)}%`;
                comboDisplay.style.color = '#ff5555';
            } else {
                comboDisplay.textContent = "";
            }
        }
        
        // Lose a life
        function loseLife() {
            lives--;
            livesElement.textContent = lives;
            
            // Animate life loss
            livesElement.style.color = '#ff5555';
            livesElement.style.transform = 'scale(1.3)';
            setTimeout(() => {
                livesElement.style.color = '#ffff00';
                livesElement.style.transform = 'scale(1)';
            }, 300);
            
            // Check if game over
            if (lives <= 0) {
                endGame();
            }
        }
        
        // End the game
        function endGame() {
            gameActive = false;
            clearInterval(gameInterval);
            clearInterval(wordInterval);
            clearInterval(timeInterval);
            
            // Show game over screen
            finalScoreElement.textContent = score;
            gameOverScreen.style.display = 'flex';
            wordInput.disabled = true;
            startBtn.disabled = false;
        }
        
        // Update all display elements
        function updateDisplay() {
            scoreElement.textContent = score;
            levelElement.textContent = level;
            livesElement.textContent = lives;
            timeElement.textContent = timeLeft;
        }
        
        // Event listeners for buttons
        startBtn.addEventListener('click', startGame);
        pauseBtn.addEventListener('click', togglePause);
        resetBtn.addEventListener('click', resetGame);
        restartBtn.addEventListener('click', resetGame);
        
        // Event listeners for difficulty buttons
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Update difficulty
                difficulty = this.dataset.difficulty;
                
                // Update active button
                difficultyBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Reset game with new difficulty
                if (!gameActive) {
                    resetGame();
                }
            });
        });
        
        // Initialize the game
        initGame();
        
        // Add some visual effects
        document.addEventListener('DOMContentLoaded', function() {
            // Create some background stars
            for (let i = 0; i < 50; i++) {
                const star = document.createElement('div');
                star.style.position = 'absolute';
                star.style.width = Math.random() * 3 + 'px';
                star.style.height = star.style.width;
                star.style.backgroundColor = '#ffffff';
                star.style.borderRadius = '50%';
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 100 + '%';
                star.style.opacity = Math.random() * 0.5 + 0.2;
                document.body.appendChild(star);
            }
        });
