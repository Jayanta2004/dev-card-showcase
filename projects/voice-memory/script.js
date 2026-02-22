    (function() {
        // ---------- SNAKE GAME SETUP ----------
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const highScoreDisplay = document.getElementById('highScoreDisplay');
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        
        // Game state
        const gridSize = 20;
        const tileCount = canvas.width / gridSize;
        
        let snake = [
            {x: 10, y: 10}
        ];
        let direction = {x: 0, y: 0};
        let food = {};
        let score = 0;
        let highScore = localStorage.getItem('snakeHighScore') || 0;
        let gameRunning = false;
        let gamePaused = false;
        let gameLoop = null;
        
        highScoreDisplay.textContent = highScore;

        // Initialize food position
        function randomFood() {
            food = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
            // Make sure food doesn't spawn on snake
            for (let segment of snake) {
                if (segment.x === food.x && segment.y === food.y) {
                    randomFood();
                    break;
                }
            }
        }

        // Draw game
        function draw() {
            // Clear canvas
            ctx.fillStyle = '#1d3924';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw snake
            ctx.fillStyle = '#86f09e';
            for (let i = 0; i < snake.length; i++) {
                const segment = snake[i];
                if (i === 0) {
                    // Head
                    ctx.fillStyle = '#b7ffb1';
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize/2, segment.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
                    ctx.fill();
                    // Eyes
                    ctx.fillStyle = '#000000';
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize/2 - 4, segment.y * gridSize + gridSize/2 - 4, 3, 0, Math.PI * 2);
                    ctx.arc(segment.x * gridSize + gridSize/2 + 4, segment.y * gridSize + gridSize/2 - 4, 3, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Body
                    ctx.fillStyle = '#5ed478';
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize/2, segment.y * gridSize + gridSize/2, gridSize/2 - 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Draw food
            ctx.fillStyle = '#ff7b7b';
            ctx.beginPath();
            ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 3, 0, Math.PI * 2);
            ctx.fill();
            // Shine
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(food.x * gridSize + gridSize/2 - 3, food.y * gridSize + gridSize/2 - 3, 2, 0, Math.PI * 2);
            ctx.fill();

            // Draw grid lines (faint)
            ctx.strokeStyle = '#2d5533';
            ctx.lineWidth = 0.5;
            for (let i = 0; i <= tileCount; i++) {
                ctx.beginPath();
                ctx.moveTo(i * gridSize, 0);
                ctx.lineTo(i * gridSize, canvas.height);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * gridSize);
                ctx.lineTo(canvas.width, i * gridSize);
                ctx.stroke();
            }

            // Paused overlay
            if (gamePaused && gameRunning) {
                ctx.fillStyle = '#00000080';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 30px Segoe UI';
                ctx.textAlign = 'center';
                ctx.fillText('⏸ PAUSED', canvas.width/2, canvas.height/2);
            }
        }

        // Update game state
        function update() {
            if (!gameRunning || gamePaused) return;

            // Move snake head
            const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

            // Check wall collision (wrap around)
            if (head.x < 0) head.x = tileCount - 1;
            if (head.x >= tileCount) head.x = 0;
            if (head.y < 0) head.y = tileCount - 1;
            if (head.y >= tileCount) head.y = 0;

            // Check self collision
            for (let segment of snake) {
                if (head.x === segment.x && head.y === segment.y) {
                    gameOver();
                    return;
                }
            }

            snake.unshift(head);

            // Check food collision
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                scoreDisplay.textContent = score;
                randomFood();
            } else {
                snake.pop();
            }

            draw();
        }

        function gameOver() {
            gameRunning = false;
            gamePaused = false;
            if (gameLoop) {
                clearInterval(gameLoop);
                gameLoop = null;
            }
            
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('snakeHighScore', highScore);
                highScoreDisplay.textContent = highScore;
            }

            // Draw game over
            ctx.fillStyle = '#000000b0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffb5b5';
            ctx.font = 'bold 40px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 20);
            ctx.font = '20px Segoe UI';
            ctx.fillText('score: ' + score, canvas.width/2, canvas.height/2 + 30);
            
            updateUIState();
        }

        function startGame() {
            // Reset game
            snake = [{x: 10, y: 10}];
            direction = {x: 1, y: 0}; // Start moving right
            score = 0;
            gameRunning = true;
            gamePaused = false;
            scoreDisplay.textContent = score;
            randomFood();
            
            if (gameLoop) clearInterval(gameLoop);
            gameLoop = setInterval(update, 150);
            
            updateUIState();
        }

        function stopGame() {
            gameRunning = false;
            gamePaused = false;
            if (gameLoop) {
                clearInterval(gameLoop);
                gameLoop = null;
            }
            // Draw stopped message
            ctx.fillStyle = '#1d3924';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#aaffaa';
            ctx.font = 'bold 30px Segoe UI';
            ctx.textAlign = 'center';
            ctx.fillText('👇 PRESS START', canvas.width/2, canvas.height/2);
            
            updateUIState();
        }

        function updateUIState() {
            startBtn.disabled = gameRunning;
            stopBtn.disabled = !gameRunning;
        }

        // ---------- GESTURE RECOGNITION (SIMULATED WITH MOUSE FOR DEMO) ----------
        // In a real app, we'd use TensorFlow.js or MediaPipe
        // For this demo, we'll simulate with mouse movement to show the concept
        
        const gestureArrow = document.getElementById('gestureArrow');
        const gestureLabel = document.getElementById('gestureLabel');
        const cameraLed = document.getElementById('cameraLed');
        const cameraStatusText = document.getElementById('cameraStatusText');
        
        let lastGesture = 'NONE';
        let gestureEnabled = false;
        let fistDetected = false;

        // Simulate camera activation
        setTimeout(() => {
            cameraLed.classList.add('active');
            cameraStatusText.innerHTML = '📷 camera ready';
            gestureEnabled = true;
        }, 1000);

        // Simulate hand tracking with mouse (for demo purposes)
        // In a real implementation, this would come from ML model
        document.addEventListener('mousemove', (e) => {
            if (!gestureEnabled || !gameRunning) return;
            
            // Convert mouse position to direction
            // We divide screen into 4 zones to simulate hand position
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            let newDir = null;
            
            if (y < 0.3) {
                // Top area - up
                newDir = {x: 0, y: -1};
                gestureArrow.textContent = '👆';
                gestureLabel.textContent = 'UP';
            } else if (y > 0.7) {
                // Bottom area - down
                newDir = {x: 0, y: 1};
                gestureArrow.textContent = '👇';
                gestureLabel.textContent = 'DOWN';
            } else if (x < 0.3) {
                // Left area - left
                newDir = {x: -1, y: 0};
                gestureArrow.textContent = '👈';
                gestureLabel.textContent = 'LEFT';
            } else if (x > 0.7) {
                // Right area - right
                newDir = {x: 1, y: 0};
                gestureArrow.textContent = '👉';
                gestureLabel.textContent = 'RIGHT';
            }
            
            // Update direction if valid and not reversing
            if (newDir && !gamePaused) {
                // Prevent snake from going back into itself
                if (snake.length > 1) {
                    if ((direction.x === -newDir.x && direction.y === -newDir.y)) {
                        // Can't reverse, ignore
                        return;
                    }
                }
                direction = newDir;
            }
        });

        // Simulate fist detection with mouse click (pause)
        document.addEventListener('click', () => {
            if (!gameRunning) return;
            
            // Toggle pause on click (simulating fist gesture)
            gamePaused = !gamePaused;
            
            if (gamePaused) {
                gestureArrow.textContent = '✊';
                gestureLabel.textContent = 'PAUSED';
                setTimeout(() => {
                    if (gamePaused) {
                        gestureArrow.textContent = lastGesture || '👆';
                        gestureLabel.textContent = lastGesture || 'NONE';
                    }
                }, 1000);
            }
            
            draw();
        });

        // Keyboard controls as fallback
        document.addEventListener('keydown', (e) => {
            if (!gameRunning || gamePaused) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    if (direction.y === 0) direction = {x: 0, y: -1};
                    break;
                case 'ArrowDown':
                    if (direction.y === 0) direction = {x: 0, y: 1};
                    break;
                case 'ArrowLeft':
                    if (direction.x === 0) direction = {x: -1, y: 0};
                    break;
                case 'ArrowRight':
                    if (direction.x === 0) direction = {x: 1, y: 0};
                    break;
            }
        });

        // Button handlers
        startBtn.addEventListener('click', startGame);
        stopBtn.addEventListener('click', stopGame);

        // Initial draw
        stopGame(); // Show start message
        
        // Random food initial
        randomFood();
    })();