
        // Game variables
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const gameOverScreen = document.getElementById('gameOver');
        const startScreen = document.getElementById('startScreen');
        const finalScoreElement = document.getElementById('finalScore');
        const highScoreElement = document.getElementById('highScore');

        // Game state
        let gameState = {
            bird: {
                x: 100,
                y: canvas.height / 2,
                width: 34,
                height: 24,
                velocity: 0,
                gravity: 0.5,
                jumpStrength: -10,
                rotation: 0
            },
            pipes: [],
            score: 0,
            highScore: localStorage.getItem('flappyHighScore') || 0,
            gameOver: false,
            gameStarted: false,
            paused: false,
            frameCount: 0,
            pipeInterval: 100, // Frames between pipes
            gapSize: 180, // Gap between top and bottom pipes
            pipeWidth: 52,
            pipeSpeed: 3,
            groundHeight: 60
        };

        // Initialize high score display
        highScoreElement.textContent = `High Score: ${gameState.highScore}`;

        // Bird pixel art colors
        const birdColors = {
            body: '#FFD700',      // Gold body
            wing: '#FFA500',      // Orange wing
            beak: '#FF4500',      // Red-orange beak
            eye: '#FFFFFF',       // White eye
            pupil: '#000000',     // Black pupil
            outline: '#8B4513'    // Brown outline
        };

        // Pipe colors
        const pipeColors = {
            top: '#228B22',       // Forest green
            bottom: '#32CD32'     // Lime green
        };

        // Draw pixel bird
        function drawBird() {
            const bird = gameState.bird;
            ctx.save();
            ctx.translate(bird.x + bird.width/2, bird.y + bird.height/2);
            ctx.rotate(bird.rotation * Math.PI/180);
            
            // Bird body (main shape)
            ctx.fillStyle = birdColors.body;
            ctx.fillRect(-bird.width/2, -bird.height/2, bird.width, bird.height);
            
            // Bird outline
            ctx.strokeStyle = birdColors.outline;
            ctx.lineWidth = 2;
            ctx.strokeRect(-bird.width/2, -bird.height/2, bird.width, bird.height);
            
            // Wing
            ctx.fillStyle = birdColors.wing;
            ctx.fillRect(-bird.width/2 + 5, -bird.height/2 + 5, 15, 10);
            
            // Beak
            ctx.fillStyle = birdColors.beak;
            ctx.fillRect(bird.width/2 - 5, -3, 10, 6);
            
            // Eye
            ctx.fillStyle = birdColors.eye;
            ctx.fillRect(bird.width/2 - 10, -bird.height/2 + 5, 8, 8);
            
            // Pupil
            ctx.fillStyle = birdColors.pupil;
            ctx.fillRect(bird.width/2 - 6, -bird.height/2 + 7, 4, 4);
            
            ctx.restore();
        }

        // Draw pixel pipe
        function drawPipe(pipe) {
            // Draw top pipe
            ctx.fillStyle = pipeColors.top;
            ctx.fillRect(pipe.x, 0, gameState.pipeWidth, pipe.topHeight);
            
            // Draw bottom pipe
            ctx.fillStyle = pipeColors.bottom;
            ctx.fillRect(pipe.x, pipe.topHeight + gameState.gapSize, 
                        gameState.pipeWidth, canvas.height);
            
            // Draw pipe caps (wider part at ends)
            ctx.fillStyle = '#2E8B57'; // Darker green for caps
            ctx.fillRect(pipe.x - 5, pipe.topHeight - 10, gameState.pipeWidth + 10, 10);
            ctx.fillRect(pipe.x - 5, pipe.topHeight + gameState.gapSize, 
                        gameState.pipeWidth + 10, 10);
        }

        // Draw ground
        function drawGround() {
            // Grass
            ctx.fillStyle = '#7CFC00';
            ctx.fillRect(0, canvas.height - gameState.groundHeight, canvas.width, gameState.groundHeight);
            
            // Dirt
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
            
            // Grass details (pixel style)
            ctx.fillStyle = '#32CD32';
            for(let i = 0; i < canvas.width; i += 20) {
                for(let j = 0; j < 3; j++) {
                    ctx.fillRect(i + j * 5, canvas.height - gameState.groundHeight - 10 + j * 3, 3, 10 - j * 3);
                }
            }
        }

        // Draw background with clouds
        function drawBackground() {
            // Sky gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#1E90FF');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw clouds
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for(let i = 0; i < 3; i++) {
                const x = (gameState.frameCount * 0.5 + i * 300) % (canvas.width + 200) - 100;
                const y = 80 + i * 60;
                
                // Pixelated cloud
                ctx.beginPath();
                ctx.arc(x, y, 20, 0, Math.PI * 2);
                ctx.arc(x + 25, y - 10, 25, 0, Math.PI * 2);
                ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
                ctx.arc(x + 25, y + 10, 18, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Update bird physics
        function updateBird() {
            const bird = gameState.bird;
            
            // Apply gravity
            bird.velocity += bird.gravity;
            bird.y += bird.velocity;
            
            // Update rotation based on velocity
            bird.rotation = Math.min(bird.velocity * 3, 90);
            
            // Check ground collision
            if (bird.y + bird.height > canvas.height - gameState.groundHeight) {
                bird.y = canvas.height - gameState.groundHeight - bird.height;
                if (!gameState.gameOver) {
                    endGame();
                }
            }
            
            // Check ceiling collision
            if (bird.y < 0) {
                bird.y = 0;
                bird.velocity = 0;
            }
        }

        // Make bird jump
        function birdJump() {
            if (gameState.gameOver || !gameState.gameStarted || gameState.paused) return;
            
            gameState.bird.velocity = gameState.bird.jumpStrength;
            gameState.bird.rotation = -25;
            
            // Play jump sound (if we had one)
            // jumpSound.play();
        }

        // Generate new pipe
        function generatePipe() {
            const minHeight = 50;
            const maxHeight = canvas.height - gameState.gapSize - gameState.groundHeight - minHeight;
            const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
            
            gameState.pipes.push({
                x: canvas.width,
                topHeight: topHeight,
                passed: false
            });
        }

        // Update pipes
        function updatePipes() {
            for (let i = gameState.pipes.length - 1; i >= 0; i--) {
                const pipe = gameState.pipes[i];
                
                // Move pipe
                pipe.x -= gameState.pipeSpeed;
                
                // Check if pipe is off screen
                if (pipe.x + gameState.pipeWidth < 0) {
                    gameState.pipes.splice(i, 1);
                    continue;
                }
                
                // Check if bird passed the pipe
                if (!pipe.passed && pipe.x + gameState.pipeWidth < gameState.bird.x) {
                    pipe.passed = true;
                    gameState.score++;
                    scoreElement.textContent = gameState.score;
                    
                    // Increase speed slightly every 5 pipes
                    if (gameState.score % 5 === 0) {
                        gameState.pipeSpeed += 0.2;
                    }
                }
                
                // Check collision
                if (checkCollision(pipe)) {
                    endGame();
                }
            }
            
            // Generate new pipe
            if (gameState.frameCount % gameState.pipeInterval === 0) {
                generatePipe();
            }
        }

        // Check collision with pipe
        function checkCollision(pipe) {
            const bird = gameState.bird;
            
            // Bird bounding box
            const birdLeft = bird.x;
            const birdRight = bird.x + bird.width;
            const birdTop = bird.y;
            const birdBottom = bird.y + bird.height;
            
            // Pipe bounding boxes
            const pipeLeft = pipe.x;
            const pipeRight = pipe.x + gameState.pipeWidth;
            const topPipeBottom = pipe.topHeight;
            const bottomPipeTop = pipe.topHeight + gameState.gapSize;
            
            // Check collision with top pipe
            if (birdRight > pipeLeft && birdLeft < pipeRight) {
                if (birdTop < topPipeBottom || birdBottom > bottomPipeTop) {
                    return true;
                }
            }
            
            return false;
        }

        // End game
        function endGame() {
            gameState.gameOver = true;
            
            // Update high score
            if (gameState.score > gameState.highScore) {
                gameState.highScore = gameState.score;
                localStorage.setItem('flappyHighScore', gameState.highScore);
                highScoreElement.textContent = `New High Score: ${gameState.highScore}!`;
            } else {
                highScoreElement.textContent = `High Score: ${gameState.highScore}`;
            }
            
            finalScoreElement.textContent = `Score: ${gameState.score}`;
            gameOverScreen.style.display = 'block';
        }

        // Reset game
        function resetGame() {
            gameState = {
                bird: {
                    x: 100,
                    y: canvas.height / 2,
                    width: 34,
                    height: 24,
                    velocity: 0,
                    gravity: 0.5,
                    jumpStrength: -10,
                    rotation: 0
                },
                pipes: [],
                score: 0,
                highScore: gameState.highScore,
                gameOver: false,
                gameStarted: true,
                paused: false,
                frameCount: 0,
                pipeInterval: 100,
                gapSize: 180,
                pipeWidth: 52,
                pipeSpeed: 3,
                groundHeight: 60
            };
            
            scoreElement.textContent = '0';
            gameOverScreen.style.display = 'none';
            startScreen.style.display = 'none';
        }

        // Start game
        function startGame() {
            resetGame();
            gameState.gameStarted = true;
            startScreen.style.display = 'none';
        }

        // Toggle pause
        function togglePause() {
            if (!gameState.gameStarted || gameState.gameOver) return;
            gameState.paused = !gameState.paused;
        }

        // Game loop
        function gameLoop() {
            if (!gameState.paused && gameState.gameStarted && !gameState.gameOver) {
                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Draw everything
                drawBackground();
                drawGround();
                
                // Update and draw pipes
                updatePipes();
                gameState.pipes.forEach(drawPipe);
                
                // Update and draw bird
                updateBird();
                drawBird();
                
                gameState.frameCount++;
            } else if (gameState.paused) {
                // Draw pause overlay
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = 'white';
                ctx.font = '48px "Courier New", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('PAUSED', canvas.width/2, canvas.height/2);
            }
            
            requestAnimationFrame(gameLoop);
        }

        // Event listeners
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                birdJump();
                e.preventDefault();
            }
            
            if (e.code === 'KeyP') {
                togglePause();
            }
            
            if (e.code === 'Enter' && gameState.gameOver) {
                resetGame();
            }
            
            if (e.code === 'Enter' && !gameState.gameStarted) {
                startGame();
            }
        });

        canvas.addEventListener('click', () => {
            birdJump();
        });

        canvas.addEventListener('touchstart', (e) => {
            birdJump();
            e.preventDefault();
        });

        // Prevent scrolling on mobile
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        // Start game loop
        gameLoop();

        // Initial instructions
        console.log('🎮 Pixel Flappy Controls:');
        console.log('SPACE or UP ARROW - Jump');
        console.log('P - Pause');
        console.log('Tap/Click on mobile');
        console.log('🎯 Avoid the pipes!');