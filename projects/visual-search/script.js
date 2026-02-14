        // Game configuration
        const gameConfig = {
            levels: 5,
            timePerLevel: 60, // seconds
            baseObjectsPerLevel: 5,
            objects: [
                { name: "Star", icon: "fa-star", color: "#FFD700", emoji: "⭐" },
                { name: "Heart", icon: "fa-heart", color: "#FF416C", emoji: "❤️" },
                { name: "Music Note", icon: "fa-music", color: "#9B59B6", emoji: "🎵" },
                { name: "Key", icon: "fa-key", color: "#FFA500", emoji: "🔑" },
                { name: "Gem", icon: "fa-gem", color: "#00d2ff", emoji: "💎" },
                { name: "Apple", icon: "fa-apple-alt", color: "#FF4B2B", emoji: "🍎" },
                { name: "Book", icon: "fa-book", color: "#8B4513", emoji: "📚" },
                { name: "Camera", icon: "fa-camera", color: "#34495E", emoji: "📷" },
                { name: "Globe", icon: "fa-globe-americas", color: "#3498DB", emoji: "🌎" },
                { name: "Coffee Cup", icon: "fa-coffee", color: "#8B4513", emoji: "☕" },
                { name: "Lightbulb", icon: "fa-lightbulb", color: "#F1C40F", emoji: "💡" },
                { name: "Cloud", icon: "fa-cloud", color: "#ECF0F1", emoji: "☁️" }
            ],
            sceneObjects: [
                "fa-circle", "fa-square", "fa-triangle", "fa-hexagon", 
                "fa-ellipsis-h", "fa-times", "fa-plus", "fa-minus",
                "fa-asterisk", "fa-certificate", "fa-dot-circle"
            ]
        };

        // Game state
        let gameState = {
            currentLevel: 1,
            score: 0,
            timeLeft: gameConfig.timePerLevel,
            objectsFound: 0,
            totalObjects: gameConfig.baseObjectsPerLevel,
            gameActive: false,
            timerInterval: null,
            currentTargets: [],
            foundTargets: [],
            sceneObjects: []
        };

        // DOM elements
        const scene = document.getElementById('scene');
        const targetList = document.getElementById('target-list');
        const timerElement = document.getElementById('timer');
        const levelElement = document.getElementById('level');
        const foundElement = document.getElementById('found');
        const scoreElement = document.getElementById('score');
        const levelIndicator = document.getElementById('level-indicator');
        const startBtn = document.getElementById('start-btn');
        const resetBtn = document.getElementById('reset-btn');
        const nextBtn = document.getElementById('next-btn');

        // Initialize game
        function initGame() {
            clearInterval(gameState.timerInterval);
            gameState.currentLevel = 1;
            gameState.score = 0;
            gameState.timeLeft = gameConfig.timePerLevel;
            gameState.objectsFound = 0;
            gameState.totalObjects = gameConfig.baseObjectsPerLevel;
            gameState.gameActive = false;
            gameState.currentTargets = [];
            gameState.foundTargets = [];
            gameState.sceneObjects = [];
            
            updateUI();
            generateLevel();
            setupEventListeners();
        }

        // Generate a level
        function generateLevel() {
            // Clear previous objects
            scene.innerHTML = '';
            targetList.innerHTML = '';
            gameState.currentTargets = [];
            gameState.foundTargets = [];
            gameState.sceneObjects = [];
            
            // Set level-specific values
            gameState.totalObjects = gameConfig.baseObjectsPerLevel + Math.floor(gameState.currentLevel / 2);
            gameState.timeLeft = gameConfig.timePerLevel - (gameState.currentLevel * 3);
            if (gameState.timeLeft < 20) gameState.timeLeft = 20;
            
            // Select random target objects for this level
            const shuffledObjects = [...gameConfig.objects].sort(() => Math.random() - 0.5);
            gameState.currentTargets = shuffledObjects.slice(0, gameState.totalObjects);
            
            // Create target list
            gameState.currentTargets.forEach((target, index) => {
                const li = document.createElement('li');
                li.className = 'target-item';
                li.id = `target-${index}`;
                li.innerHTML = `
                    <div class="target-icon" style="color: ${target.color}">
                        <i class="fas ${target.icon}"></i>
                    </div>
                    <span class="target-name">${target.name}</span>
                `;
                targetList.appendChild(li);
            });
            
            // Generate scene with objects
            generateSceneObjects();
            
            // Update UI
            updateUI();
        }

        // Generate objects in the scene
        function generateSceneObjects() {
            const sceneWidth = scene.offsetWidth;
            const sceneHeight = scene.offsetHeight;
            
            // Add target objects
            gameState.currentTargets.forEach((target, index) => {
                const size = 30 + Math.random() * 30;
                const x = Math.random() * (sceneWidth - size * 2) + size;
                const y = Math.random() * (sceneHeight - size * 2) + size;
                
                const obj = document.createElement('div');
                obj.className = 'game-object';
                obj.id = `obj-${index}`;
                obj.dataset.targetIndex = index;
                obj.style.width = `${size}px`;
                obj.style.height = `${size}px`;
                obj.style.left = `${x}px`;
                obj.style.top = `${y}px`;
                obj.style.color = target.color;
                obj.style.fontSize = `${size}px`;
                obj.innerHTML = `<i class="fas ${target.icon}"></i>`;
                
                scene.appendChild(obj);
                gameState.sceneObjects.push(obj);
                
                // Add click event
                obj.addEventListener('click', () => handleObjectClick(index));
            });
            
            // Add decoy objects (not targets)
            const decoyCount = 20 + gameState.currentLevel * 5;
            for (let i = 0; i < decoyCount; i++) {
                const size = 20 + Math.random() * 25;
                const x = Math.random() * (sceneWidth - size * 2) + size;
                const y = Math.random() * (sceneHeight - size * 2) + size;
                const decoyType = gameConfig.sceneObjects[Math.floor(Math.random() * gameConfig.sceneObjects.length)];
                const colors = ['#7F8C8D', '#95A5A6', '#BDC3C7', '#ECF0F1', '#D5DBDB'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                const obj = document.createElement('div');
                obj.className = 'game-object decoy';
                obj.style.width = `${size}px`;
                obj.style.height = `${size}px`;
                obj.style.left = `${x}px`;
                obj.style.top = `${y}px`;
                obj.style.color = color;
                obj.style.fontSize = `${size}px`;
                obj.style.opacity = 0.7 + Math.random() * 0.3;
                obj.innerHTML = `<i class="fas ${decoyType}"></i>`;
                
                scene.appendChild(obj);
                gameState.sceneObjects.push(obj);
                
                // Add click event to decoys (wrong answer)
                obj.addEventListener('click', handleDecoyClick);
            }
        }

        // Handle clicking on a target object
        function handleObjectClick(targetIndex) {
            if (!gameState.gameActive || gameState.foundTargets.includes(targetIndex)) return;
            
            // Mark object as found
            gameState.foundTargets.push(targetIndex);
            gameState.objectsFound++;
            
            // Update score
            const timeBonus = Math.floor(gameState.timeLeft / 2);
            const levelBonus = gameState.currentLevel * 10;
            gameState.score += 50 + timeBonus + levelBonus;
            
            // Update UI
            const targetElement = document.getElementById(`target-${targetIndex}`);
            targetElement.classList.add('found');
            
            const objElement = document.getElementById(`obj-${targetIndex}`);
            objElement.classList.add('found');
            
            // Show feedback
            showClickFeedback(objElement, '+ ' + (50 + timeBonus + levelBonus));
            
            // Check if level is complete
            if (gameState.objectsFound === gameState.totalObjects) {
                levelComplete();
            }
            
            updateUI();
        }

        // Handle clicking on a decoy object
        function handleDecoyClick(event) {
            if (!gameState.gameActive) return;
            
            // Penalty for wrong click
            gameState.score -= 10;
            if (gameState.score < 0) gameState.score = 0;
            
            // Show feedback
            showClickFeedback(event.target, '-10');
            
            updateUI();
        }

        // Show feedback when clicking objects
        function showClickFeedback(element, text) {
            const rect = element.getBoundingClientRect();
            const sceneRect = scene.getBoundingClientRect();
            
            const feedback = document.createElement('div');
            feedback.className = 'click-feedback';
            feedback.textContent = text;
            feedback.style.left = `${rect.left - sceneRect.left + rect.width / 2}px`;
            feedback.style.top = `${rect.top - sceneRect.top}px`;
            
            scene.appendChild(feedback);
            
            // Remove feedback after animation
            setTimeout(() => {
                feedback.remove();
            }, 1000);
        }

        // Level complete
        function levelComplete() {
            clearInterval(gameState.timerInterval);
            gameState.gameActive = false;
            
            // Bonus for time left
            const timeBonus = gameState.timeLeft * 5;
            gameState.score += timeBonus;
            
            // Show level complete message
            const gameOverDiv = document.createElement('div');
            gameOverDiv.className = 'game-over';
            gameOverDiv.innerHTML = `
                <h2>Level ${gameState.currentLevel} Complete!</h2>
                <p>Time Bonus: +${timeBonus} points</p>
                <p>Total Score: ${gameState.score}</p>
                <button id="continue-btn" style="margin-top: 20px; padding: 15px 40px; font-size: 1.3rem;">
                    ${gameState.currentLevel < gameConfig.levels ? 'Next Level' : 'Play Again'}
                </button>
            `;
            
            scene.appendChild(gameOverDiv);
            gameOverDiv.style.display = 'flex';
            
            // Enable next button
            nextBtn.disabled = false;
            
            // Update UI
            updateUI();
            
            // Add event listener to continue button
            document.getElementById('continue-btn').addEventListener('click', () => {
                gameOverDiv.remove();
                
                if (gameState.currentLevel < gameConfig.levels) {
                    nextLevel();
                } else {
                    // Game complete
                    showGameComplete();
                }
            });
        }

        // Show game complete screen
        function showGameComplete() {
            const gameOverDiv = document.createElement('div');
            gameOverDiv.className = 'game-over';
            gameOverDiv.innerHTML = `
                <h2>Congratulations!</h2>
                <p>You've completed all ${gameConfig.levels} levels!</p>
                <p>Final Score: <strong>${gameState.score}</strong></p>
                <button id="restart-btn" style="margin-top: 20px; padding: 15px 40px; font-size: 1.3rem;">
                    Play Again
                </button>
            `;
            
            scene.appendChild(gameOverDiv);
            gameOverDiv.style.display = 'flex';
            
            // Add event listener to restart button
            document.getElementById('restart-btn').addEventListener('click', () => {
                gameOverDiv.remove();
                initGame();
            });
        }

        // Move to next level
        function nextLevel() {
            gameState.currentLevel++;
            gameState.objectsFound = 0;
            gameState.foundTargets = [];
            
            generateLevel();
            updateUI();
            
            // Disable next button until level is complete
            nextBtn.disabled = true;
        }

        // Start the game timer
        function startGame() {
            if (gameState.gameActive) return;
            
            gameState.gameActive = true;
            gameState.timeLeft = gameConfig.timePerLevel - (gameState.currentLevel * 3);
            if (gameState.timeLeft < 20) gameState.timeLeft = 20;
            
            // Update timer every second
            gameState.timerInterval = setInterval(() => {
                gameState.timeLeft--;
                updateUI();
                
                // Check if time ran out
                if (gameState.timeLeft <= 0) {
                    clearInterval(gameState.timerInterval);
                    gameState.timeLeft = 0;
                    gameState.gameActive = false;
                    
                    // Show time's up message
                    const gameOverDiv = document.createElement('div');
                    gameOverDiv.className = 'game-over';
                    gameOverDiv.innerHTML = `
                        <h2>Time's Up!</h2>
                        <p>You found ${gameState.objectsFound} of ${gameState.totalObjects} objects</p>
                        <button id="retry-btn" style="margin-top: 20px; padding: 15px 40px; font-size: 1.3rem;">
                            Try Again
                        </button>
                    `;
                    
                    scene.appendChild(gameOverDiv);
                    gameOverDiv.style.display = 'flex';
                    
                    // Add event listener to retry button
                    document.getElementById('retry-btn').addEventListener('click', () => {
                        gameOverDiv.remove();
                        generateLevel();
                        updateUI();
                    });
                }
            }, 1000);
            
            updateUI();
        }

        // Update UI elements
        function updateUI() {
            timerElement.textContent = `${gameState.timeLeft}s`;
            levelElement.textContent = gameState.currentLevel;
            levelIndicator.textContent = gameState.currentLevel;
            foundElement.textContent = `${gameState.objectsFound}/${gameState.totalObjects}`;
            scoreElement.textContent = gameState.score;
            
            // Update button states
            startBtn.disabled = gameState.gameActive;
            startBtn.innerHTML = gameState.gameActive 
                ? '<i class="fas fa-play"></i> Game Running' 
                : '<i class="fas fa-play"></i> Start Game';
                
            resetBtn.disabled = !gameState.gameActive && gameState.objectsFound > 0;
            nextBtn.disabled = gameState.currentLevel >= gameConfig.levels || 
                gameState.objectsFound < gameState.totalObjects || 
                gameState.gameActive;
        }

        // Setup event listeners
        function setupEventListeners() {
            startBtn.addEventListener('click', startGame);
            resetBtn.addEventListener('click', () => {
                clearInterval(gameState.timerInterval);
                gameState.gameActive = false;
                gameState.objectsFound = 0;
                gameState.foundTargets = [];
                gameState.timeLeft = gameConfig.timePerLevel - (gameState.currentLevel * 3);
                if (gameState.timeLeft < 20) gameState.timeLeft = 20;
                
                // Reset target and object states
                gameState.currentTargets.forEach((_, index) => {
                    const targetElement = document.getElementById(`target-${index}`);
                    if (targetElement) targetElement.classList.remove('found');
                    
                    const objElement = document.getElementById(`obj-${index}`);
                    if (objElement) objElement.classList.remove('found');
                });
                
                updateUI();
            });
            
            nextBtn.addEventListener('click', nextLevel);
        }

        // Initialize the game when page loads
        window.addEventListener('DOMContentLoaded', initGame);