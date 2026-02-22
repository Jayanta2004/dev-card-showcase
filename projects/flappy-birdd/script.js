    (function() {
        // ---------- FLAPPY BIRD GAME ----------
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const highScoreDisplay = document.getElementById('highScoreDisplay');
        const statusDisplay = document.getElementById('statusDisplay');
        const gamesPlayed = document.getElementById('gamesPlayed');
        const bestStreak = document.getElementById('bestStreak');
        const avgScore = document.getElementById('avgScore');
        const startBtn = document.getElementById('startBtn');
        const resetBtn = document.getElementById('resetBtn');
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');

        // Game constants
        const GRAVITY = 0.5;
        const JUMP_FORCE = -10;
        const PIPE_WIDTH = 60;
        const PIPE_GAP = 150;
        const PIPE_SPACING = 300;
        
        // Difficulty settings
        const difficultySettings = {
            easy: {
                gravity: 0.4,
                jumpForce: -11,
                pipeGap: 170,
                pipeSpeed: 2
            },
            medium: {
                gravity: 0.5,
                jumpForce: -10,
                pipeGap: 150,
                pipeSpeed: 3
            },
            hard: {
                gravity: 0.6,
                jumpForce: -9,
                pipeGap: 130,
                pipeSpeed: 4
            }
        };

        // Game state
        let gameActive = false;
        let gameStarted = false;
        let score = 0;
        let highScore = localStorage.getItem('flappyHighScore') || 0;
        let gameStats = {
            gamesPlayed: parseInt(localStorage.getItem('flappyGamesPlayed') || 0),
            totalScore: parseInt(localStorage.getItem('flappyTotalScore') || 0),
            bestStreak: parseInt(localStorage.getItem('flappyBestStreak') || 0)
        };
        
        // Bird
        let bird = {
            x: 150,
            y: 350,
            width: 30,
            height: 30,
            velocity: 0
        };
        
        // Pipes
        let pipes = [];
        let currentDifficulty = 'medium';
        
        // Frame counter for pipe spawning
        let frameCount = 0;

        // Update stats display
        function updateStatsDisplay() {
            gamesPlayed.textContent = gameStats.gamesPlayed;
            bestStreak.textContent = gameStats.bestStreak;
            const avg = gameStats.gamesPlayed > 0 ? 
                Math.round(gameStats.totalScore / gameStats.gamesPlayed) : 0;
            avgScore.textContent = avg;
        }

        // Save stats
        function saveStats() {
            localStorage.setItem('flappyGamesPlayed', gameStats.gamesPlayed);
            localStorage.setItem('flappyTotalScore', gameStats.totalScore);
            localStorage.setItem('flappyBestStreak', gameStats.bestStreak);
        }

        // Initialize game
        function initGame() {
            bird = {
                x: 150,
                y: 350,
                width: 30,
                height: 30,
                velocity: 0
            };
            
            pipes = [];
            score = 0;
            frameCount = 0;
            gameStarted = false;
            gameActive = false;
            
            scoreDisplay.textContent = score;
            highScoreDisplay.textContent = highScore;
            statusDisplay.textContent = '👆 Tap to start';
            
            draw();
        }

        // Start game
        function startGame() {
            if (gameActive) return;
            
            gameStarted = true;
            gameActive = true;
            bird.velocity = JUMP_FORCE;
            statusDisplay.textContent = '🎯 FLY!';
            
            gameStats.gamesPlayed++;
            saveStats();
            updateStatsDisplay();
        }

        // Game over
        function gameOver() {
            gameActive = false;
            
            // Update stats
            gameStats.totalScore += score;
            if (score > gameStats.bestStreak) {
                gameStats.bestStreak = score;
            }
            saveStats();
            updateStatsDisplay();
            
            // Update high score
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('flappyHighScore', highScore);
                highScoreDisplay.textContent = highScore;
                statusDisplay.textContent = '🏆 NEW HIGH SCORE!';
            } else {
                statusDisplay.textContent = '💀 GAME OVER';
            }
            
            draw();
        }

        // Jump
        function jump() {
            if (!gameActive) {
                if (gameStarted) {
                    // Restart after game over
                    initGame();
                    startGame();
                } else {
                    startGame();
                }
                return;
            }
            
            bird.velocity = difficultySettings[currentDifficulty].jumpForce;
        }

        // Spawn new pipe
        function spawnPipe() {
            const settings = difficultySettings[currentDifficulty];
            const minHeight = 100;
            const maxHeight = canvas.height - settings.pipeGap - 100;
            const height = Math.random() * (maxHeight - minHeight) + minHeight;
            
            pipes.push({
                x: canvas.width,
                topHeight: height,
                bottomY: height + settings.pipeGap,
                passed: false
            });
        }

        // Update game
        function update() {
            if (!gameActive) return;
            
            const settings = difficultySettings[currentDifficulty];
            
            // Bird physics
            bird.velocity += settings.gravity;
            bird.y += bird.velocity;
            
            // Check boundaries
            if (bird.y < 0) {
                bird.y = 0;
                bird.velocity = 0;
            }
            
            if (bird.y + bird.height > canvas.height) {
                gameOver();
                return;
            }
            
            // Spawn pipes
            frameCount++;
            if (frameCount % Math.floor(60 / settings.pipeSpeed * 2) === 0) {
                spawnPipe();
            }
            
            // Move pipes
            for (let i = pipes.length - 1; i >= 0; i--) {
                const pipe = pipes[i];
                pipe.x -= settings.pipeSpeed;
                
                // Remove off-screen pipes
                if (pipe.x + PIPE_WIDTH < 0) {
                    pipes.splice(i, 1);
                    continue;
                }
                
                // Check collision
                if (bird.x + bird.width > pipe.x && bird.x < pipe.x + PIPE_WIDTH) {
                    if (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY) {
                        gameOver();
                        return;
                    }
                }
                
                // Score point
                if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x) {
                    pipe.passed = true;
                    score++;
                    scoreDisplay.textContent = score;
                }
            }
            
            draw();
        }

        // Draw everything
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Sky gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#6ec3ff');
            gradient.addColorStop(0.7, '#9fd9ff');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Clouds
            ctx.fillStyle = '#ffffffb0';
            ctx.shadowColor = '#00000020';
            ctx.shadowBlur = 20;
            
            for (let i = 0; i < 3; i++) {
                const x = (Date.now() * 0.02 + i * 200) % (canvas.width + 200) - 100;
                ctx.beginPath();
                ctx.arc(x, 100, 30, 0, Math.PI * 2);
                ctx.arc(x + 40, 80, 25, 0, Math.PI * 2);
                ctx.arc(x - 20, 80, 25, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.shadowBlur = 0;
            
            // Draw pipes
            pipes.forEach(pipe => {
                // Top pipe
                ctx.fillStyle = '#2e8b57';
                ctx.shadowColor = '#00000080';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetY = 3;
                
                ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
                
                // Pipe cap
                ctx.fillStyle = '#3cb371';
                ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, PIPE_WIDTH + 10, 30);
                
                // Bottom pipe
                ctx.fillStyle = '#2e8b57';
                ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, canvas.height - pipe.bottomY);
                
                // Bottom cap
                ctx.fillStyle = '#3cb371';
                ctx.fillRect(pipe.x - 5, pipe.bottomY, PIPE_WIDTH + 10, 30);
                
                // Highlights
                ctx.fillStyle = '#ffffff40';
                ctx.fillRect(pipe.x + 5, pipe.topHeight - 30, 10, 30);
                ctx.fillRect(pipe.x + 5, pipe.bottomY, 10, 30);
            });
            
            // Draw bird
            ctx.shadowColor = '#00000080';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetY = 3;
            
            // Body
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.ellipse(bird.x + bird.width/2, bird.y + bird.height/2, 
                       bird.width/2, bird.height/2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Eye
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(bird.x + bird.width - 5, bird.y + 10, 5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(bird.x + bird.width - 5, bird.y + 10, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Beak
            ctx.fillStyle = '#ffa500';
            ctx.beginPath();
            ctx.moveTo(bird.x + bird.width, bird.y + 12);
            ctx.lineTo(bird.x + bird.width + 15, bird.y + 15);
            ctx.lineTo(bird.x + bird.width, bird.y + 18);
            ctx.fill();
            
            // Wing
            ctx.fillStyle = '#ffa500';
            ctx.beginPath();
            ctx.ellipse(bird.x + 5, bird.y + 18, 10, 5, -0.3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
            
            // Ground
            ctx.fillStyle = '#8b5a2b';
            ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
            
            // Grass
            ctx.fillStyle = '#228b22';
            for (let i = 0; i < 10; i++) {
                const x = i * 50 + (Date.now() * 0.05) % 50;
                ctx.beginPath();
                ctx.moveTo(x, canvas.height - 20);
                ctx.lineTo(x + 20, canvas.height - 40);
                ctx.lineTo(x - 20, canvas.height - 40);
                ctx.fill();
            }
            
            // Game over overlay
            if (!gameActive && gameStarted) {
                ctx.fillStyle = '#000000b0';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }

        // Animation loop
        function gameLoop() {
            update();
            requestAnimationFrame(gameLoop);
        }

        // Event listeners
        canvas.addEventListener('click', jump);
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                jump();
            }
        });

        startBtn.addEventListener('click', () => {
            if (!gameActive) {
                initGame();
                startGame();
            }
        });

        resetBtn.addEventListener('click', () => {
            initGame();
        });

        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                currentDifficulty = btn.dataset.diff;
                initGame();
            });
        });

        // Initialize
        initGame();
        updateStatsDisplay();
        gameLoop();
    })();