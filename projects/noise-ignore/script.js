        // Game variables
        let score = 0;
        let timeLeft = 60;
        let level = 1;
        let distractionsClicked = 0;
        let gameActive = false;
        let gameTimer;
        let noiseElements = [];
        let soundEnabled = true;
        let targetClicks = 0;
        let maxLevel = 5;
        
        // DOM elements
        const scoreElement = document.getElementById('score');
        const timeElement = document.getElementById('time');
        const levelElement = document.getElementById('level');
        const distractionsElement = document.getElementById('distractions');
        const startBtn = document.getElementById('startBtn');
        const resetBtn = document.getElementById('resetBtn');
        const focusObject = document.getElementById('focusObject');
        const gameContainer = document.getElementById('gameContainer');
        const gameMessage = document.getElementById('gameMessage');
        const messageTitle = document.getElementById('messageTitle');
        const messageText = document.getElementById('messageText');
        const finalScoreElement = document.getElementById('finalScore');
        const playAgainBtn = document.getElementById('playAgainBtn');
        const levelIndicator = document.getElementById('levelIndicator');
        const soundToggle = document.getElementById('soundToggle');
        
        // Sound effects
        const clickSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3');
        const correctSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3');
        const wrongSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3');
        const levelUpSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
        const gameOverSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-sad-game-over-trombone-471.mp3');
        
        // Set sound volume
        clickSound.volume = 0.3;
        correctSound.volume = 0.5;
        wrongSound.volume = 0.5;
        levelUpSound.volume = 0.5;
        gameOverSound.volume = 0.5;
        
        // Game initialization
        function initGame() {
            score = 0;
            timeLeft = 60;
            level = 1;
            distractionsClicked = 0;
            targetClicks = 0;
            updateUI();
            removeAllNoiseElements();
            focusObject.style.display = 'flex';
            focusObject.style.left = '50%';
            focusObject.style.top = '50%';
            gameMessage.style.display = 'none';
            levelIndicator.textContent = `Level ${level}`;
        }
        
        // Update UI elements
        function updateUI() {
            scoreElement.textContent = score;
            timeElement.textContent = timeLeft;
            levelElement.textContent = level;
            distractionsElement.textContent = distractionsClicked;
        }
        
        // Start the game
        function startGame() {
            if (gameActive) return;
            
            gameActive = true;
            startBtn.disabled = true;
            resetBtn.disabled = false;
            
            // Start game timer
            gameTimer = setInterval(() => {
                timeLeft--;
                timeElement.textContent = timeLeft;
                
                // Check if time is up
                if (timeLeft <= 0) {
                    endGame();
                }
                
                // Level progression based on target clicks
                if (targetClicks >= level * 5 && level < maxLevel) {
                    levelUp();
                }
                
                // Add noise elements periodically
                if (timeLeft % (10 - level) === 0) {
                    addNoiseElement();
                }
                
                // Move existing noise elements
                moveNoiseElements();
                
            }, 1000);
            
            // Add initial noise elements
            for (let i = 0; i < level * 2; i++) {
                setTimeout(() => addNoiseElement(), i * 500);
            }
            
            // Play start sound if enabled
            if (soundEnabled) {
                clickSound.currentTime = 0;
                clickSound.play();
            }
        }
        
        // Level up function
        function levelUp() {
            level++;
            targetClicks = 0;
            levelIndicator.textContent = `Level ${level}`;
            
            // Update level display
            levelElement.textContent = level;
            
            // Show level up message
            showTemporaryMessage(`Level ${level}`, `More distractions incoming!`);
            
            // Add more noise elements for new level
            for (let i = 0; i < level * 2; i++) {
                setTimeout(() => addNoiseElement(), i * 300);
            }
            
            // Play level up sound if enabled
            if (soundEnabled) {
                levelUpSound.currentTime = 0;
                levelUpSound.play();
            }
        }
        
        // End the game
        function endGame() {
            gameActive = false;
            clearInterval(gameTimer);
            startBtn.disabled = false;
            
            // Show game over message
            gameMessage.style.display = 'block';
            
            // Determine message based on score
            if (level >= maxLevel) {
                messageTitle.textContent = "You Win!";
                messageText.textContent = "Congratulations! You mastered all levels!";
            } else {
                messageTitle.textContent = "Game Over";
                messageText.textContent = "Your final score is:";
            }
            
            finalScoreElement.textContent = score;
            
            // Remove all noise elements
            removeAllNoiseElements();
            
            // Play game over sound if enabled
            if (soundEnabled) {
                gameOverSound.currentTime = 0;
                gameOverSound.play();
            }
        }
        
        // Add a noise/distraction element
        function addNoiseElement() {
            if (!gameActive) return;
            
            const noiseElement = document.createElement('div');
            noiseElement.className = 'noise-element';
            
            // Random size
            const size = Math.random() * 80 + 40;
            noiseElement.style.width = `${size}px`;
            noiseElement.style.height = `${size}px`;
            
            // Random position
            const x = Math.random() * (gameContainer.offsetWidth - size);
            const y = Math.random() * (gameContainer.offsetHeight - size);
            noiseElement.style.left = `${x}px`;
            noiseElement.style.top = `${y}px`;
            
            // Random color
            const colors = [
                'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
                'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
                'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
                'linear-gradient(135deg, #a6c0fe 0%, #f68084 100%)',
                'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)'
            ];
            noiseElement.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            // Random icon
            const icons = [
                'fas fa-star', 'fas fa-heart', 'fas fa-bell', 'fas fa-gem',
                'fas fa-cloud', 'fas fa-bolt', 'fas fa-fire', 'fas fa-music'
            ];
            const icon = document.createElement('i');
            icon.className = icons[Math.floor(Math.random() * icons.length)];
            noiseElement.appendChild(icon);
            
            // Add click event
            noiseElement.addEventListener('click', () => {
                if (!gameActive) return;
                
                distractionsClicked++;
                score = Math.max(0, score - 5); // Prevent negative score
                updateUI();
                
                // Remove the noise element
                noiseElement.remove();
                const index = noiseElements.indexOf(noiseElement);
                if (index > -1) noiseElements.splice(index, 1);
                
                // Play wrong sound if enabled
                if (soundEnabled) {
                    wrongSound.currentTime = 0;
                    wrongSound.play();
                }
                
                // Show feedback
                noiseElement.style.backgroundColor = '#ff0000';
                setTimeout(() => {
                    if (noiseElement.parentNode) {
                        noiseElement.remove();
                    }
                }, 200);
            });
            
            // Add to game container and noiseElements array
            gameContainer.appendChild(noiseElement);
            noiseElements.push(noiseElement);
        }
        
        // Move existing noise elements
        function moveNoiseElements() {
            if (!gameActive) return;
            
            noiseElements.forEach(element => {
                // Random movement
                const x = parseFloat(element.style.left) + (Math.random() * 40 - 20);
                const y = parseFloat(element.style.top) + (Math.random() * 40 - 20);
                
                // Keep within bounds
                const maxX = gameContainer.offsetWidth - element.offsetWidth;
                const maxY = gameContainer.offsetHeight - element.offsetHeight;
                
                element.style.left = `${Math.max(0, Math.min(maxX, x))}px`;
                element.style.top = `${Math.max(0, Math.min(maxY, y))}px`;
            });
        }
        
        // Remove all noise elements
        function removeAllNoiseElements() {
            noiseElements.forEach(element => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });
            noiseElements = [];
        }
        
        // Show a temporary message
        function showTemporaryMessage(title, text) {
            const tempMessage = document.createElement('div');
            tempMessage.className = 'game-message';
            tempMessage.innerHTML = `
                <h2>${title}</h2>
                <p>${text}</p>
            `;
            tempMessage.style.display = 'block';
            tempMessage.style.zIndex = '50';
            gameContainer.appendChild(tempMessage);
            
            setTimeout(() => {
                tempMessage.remove();
            }, 2000);
        }
        
        // Event Listeners
        startBtn.addEventListener('click', startGame);
        
        resetBtn.addEventListener('click', () => {
            clearInterval(gameTimer);
            gameActive = false;
            startBtn.disabled = false;
            resetBtn.disabled = false;
            initGame();
        });
        
        playAgainBtn.addEventListener('click', () => {
            gameMessage.style.display = 'none';
            initGame();
            startGame();
        });
        
        focusObject.addEventListener('click', () => {
            if (!gameActive) return;
            
            // Update score and target clicks
            score += 10;
            targetClicks++;
            updateUI();
            
            // Move focus object to random position
            const maxX = gameContainer.offsetWidth - focusObject.offsetWidth;
            const maxY = gameContainer.offsetHeight - focusObject.offsetHeight;
            const x = Math.random() * maxX;
            const y = Math.random() * maxY;
            
            focusObject.style.left = `${x}px`;
            focusObject.style.top = `${y}px`;
            
            // Play correct sound if enabled
            if (soundEnabled) {
                correctSound.currentTime = 0;
                correctSound.play();
            }
            
            // Add visual feedback
            focusObject.style.transform = 'scale(0.9)';
            setTimeout(() => {
                focusObject.style.transform = 'scale(1)';
            }, 100);
        });
        
        soundToggle.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            const icon = soundToggle.querySelector('i');
            if (soundEnabled) {
                icon.className = 'fas fa-volume-up';
                soundToggle.style.color = '#6a11cb';
            } else {
                icon.className = 'fas fa-volume-mute';
                soundToggle.style.color = '#888';
            }
        });
        
        // Initialize the game
        initGame();
        
        // Add some visual effects for the focus object
        setInterval(() => {
            if (!gameActive) return;
            
            // Pulsing effect for focus object
            focusObject.style.boxShadow = `0 0 ${20 + Math.sin(Date.now() / 300) * 10}px rgba(106, 17, 203, 0.7)`;
        }, 50);