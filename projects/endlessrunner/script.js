
        // Game variables
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const gameOverScreen = document.getElementById('gameOverScreen');
        
        // Set canvas dimensions
        canvas.width = 800;
        canvas.height = 400;
        
        // Game state
        let game = {
            running: false,
            paused: false,
            score: 0,
            speed: 5,
            obstaclesAvoided: 0,
            gameTime: 0,
            isDay: true,
            dayProgress: 0,
            player: {
                x: 100,
                y: canvas.height - 100,
                width: 40,
                height: 60,
                velocityY: 0,
                isJumping: false,
                isDucking: false,
                jumpForce: 15,
                gravity: 0.8,
                color: '#00b4d8'
            },
            obstacles: [],
            background: [],
            clouds: [],
            stars: [],
            particles: [],
            lastObstacleTime: 0,
            obstacleInterval: 1500,
            speedIncreaseInterval: 10000, // Increase speed every 10 seconds
            lastSpeedIncrease: 0
        };
        
        // Initialize game elements
        function initGame() {
            game.obstacles = [];
            game.background = [];
            game.clouds = [];
            game.stars = [];
            game.particles = [];
            game.score = 0;
            game.speed = 5;
            game.obstaclesAvoided = 0;
            game.gameTime = 0;
            game.isDay = true;
            game.dayProgress = 0;
            game.player.y = canvas.height - 100;
            game.player.velocityY = 0;
            game.player.isJumping = false;
            game.player.isDucking = false;
            
            // Create initial background elements
            for (let i = 0; i < 20; i++) {
                game.background.push({
                    x: Math.random() * canvas.width,
                    y: canvas.height - 30,
                    width: 20 + Math.random() * 30,
                    height: 10 + Math.random() * 20,
                    color: `rgb(${100 + Math.random() * 100}, ${80 + Math.random() * 60}, 40)`
                });
            }
            
            // Create initial clouds
            for (let i = 0; i < 5; i++) {
                game.clouds.push({
                    x: Math.random() * canvas.width,
                    y: 50 + Math.random() * 100,
                    width: 60 + Math.random() * 80,
                    height: 30 + Math.random() * 20,
                    speed: 0.5 + Math.random() * 0.5
                });
            }
            
            // Create initial stars (for night)
            for (let i = 0; i < 50; i++) {
                game.stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * 200,
                    size: 1 + Math.random() * 2,
                    brightness: 0.3 + Math.random() * 0.7
                });
            }
            
            updateStats();
        }
        
        // Update statistics display
        function updateStats() {
            document.getElementById('score').textContent = Math.floor(game.score) + 'm';
            document.getElementById('speed').textContent = game.speed.toFixed(1) + 'x';
            document.getElementById('obstacles').textContent = game.obstaclesAvoided;
            document.getElementById('time').textContent = game.isDay ? 'Day' : 'Night';
            
            // Update time progress
            const timeProgress = document.getElementById('timeProgress');
            timeProgress.style.width = (game.dayProgress * 100) + '%';
            
            // Update time icons
            const timeIcon = document.getElementById('timeIcon');
            const nextTimeIcon = document.getElementById('nextTimeIcon');
            
            if (game.isDay) {
                timeIcon.textContent = '☀️';
                nextTimeIcon.textContent = '🌙';
            } else {
                timeIcon.textContent = '🌙';
                nextTimeIcon.textContent = '☀️';
            }
        }
        
        // Draw game elements
        function draw() {
            // Clear canvas with sky color based on time of day
            if (game.isDay) {
                // Day sky gradient
                const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                skyGradient.addColorStop(0, '#87CEEB');
                skyGradient.addColorStop(1, '#E0F7FF');
                ctx.fillStyle = skyGradient;
            } else {
                // Night sky gradient
                const nightGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                nightGradient.addColorStop(0, '#0a1931');
                nightGradient.addColorStop(1, '#1a1a2e');
                ctx.fillStyle = nightGradient;
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw stars at night
            if (!game.isDay) {
                game.stars.forEach(star => {
                    ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                    ctx.fill();
                });
            }
            
            // Draw clouds (darker at night)
            game.clouds.forEach(cloud => {
                if (game.isDay) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                } else {
                    ctx.fillStyle = 'rgba(150, 150, 180, 0.7)';
                }
                ctx.beginPath();
                ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // Draw ground
            const groundGradient = ctx.createLinearGradient(0, canvas.height - 30, 0, canvas.height);
            if (game.isDay) {
                groundGradient.addColorStop(0, '#8BC34A');
                groundGradient.addColorStop(1, '#689F38');
            } else {
                groundGradient.addColorStop(0, '#4a5c29');
                groundGradient.addColorStop(1, '#2e3b1a');
            }
            ctx.fillStyle = groundGradient;
            ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
            
            // Draw background elements (grass, rocks)
            game.background.forEach(item => {
                ctx.fillStyle = item.color;
                ctx.fillRect(item.x, item.y, item.width, item.height);
            });
            
            // Draw player
            ctx.fillStyle = game.player.color;
            
            // Draw player with different shapes based on state
            if (game.player.isDucking) {
                // Ducking shape (wider, shorter)
                ctx.fillRect(game.player.x, game.player.y + 30, game.player.width, game.player.height - 30);
                // Head
                ctx.beginPath();
                ctx.arc(game.player.x + game.player.width / 2, game.player.y + 30, 15, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Standing shape
                ctx.fillRect(game.player.x, game.player.y, game.player.width, game.player.height);
                // Head
                ctx.beginPath();
                ctx.arc(game.player.x + game.player.width / 2, game.player.y - 10, 20, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Draw obstacles
            game.obstacles.forEach(obstacle => {
                ctx.fillStyle = obstacle.color;
                
                switch(obstacle.type) {
                    case 'rock':
                        // Draw rock
                        ctx.beginPath();
                        ctx.arc(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.width / 2, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                    case 'crate':
                        // Draw crate with lines
                        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                        ctx.strokeStyle = '#5a3e2b';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                        // Crate lines
                        ctx.beginPath();
                        ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y);
                        ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(obstacle.x, obstacle.y + obstacle.height / 2);
                        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height / 2);
                        ctx.stroke();
                        break;
                    case 'hole':
                        // Draw hole
                        ctx.beginPath();
                        ctx.ellipse(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, 
                                  obstacle.width / 2, obstacle.height / 2, 0, 0, Math.PI * 2);
                        ctx.fill();
                        // Darker center
                        ctx.fillStyle = '#111';
                        ctx.beginPath();
                        ctx.ellipse(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, 
                                  obstacle.width / 3, obstacle.height / 3, 0, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                    case 'spike':
                        // Draw spike
                        ctx.beginPath();
                        ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
                        ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y);
                        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
                        ctx.closePath();
                        ctx.fill();
                        break;
                }
            });
            
            // Draw particles
            game.particles.forEach(particle => {
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = particle.alpha;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            });
            
            // Draw score
            ctx.fillStyle = game.isDay ? '#000' : '#fff';
            ctx.font = '24px Arial';
            ctx.fillText(`Distance: ${Math.floor(game.score)}m`, 20, 40);
            ctx.fillText(`Speed: ${game.speed.toFixed(1)}x`, 20, 70);
            ctx.fillText(`Time: ${game.isDay ? 'Day' : 'Night'}`, canvas.width - 150, 40);
            
            // Draw paused text
            if (game.paused) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#fff';
                ctx.font = '48px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
                ctx.font = '24px Arial';
                ctx.fillText('Press P to resume', canvas.width / 2, canvas.height / 2 + 40);
                ctx.textAlign = 'left';
            }
        }
        
        // Update game state
        function update() {
            if (!game.running || game.paused) return;
            
            // Update game time
            game.gameTime += 16; // Approximately 60 FPS
            
            // Increase score based on speed
            game.score += game.speed * 0.1;
            
            // Update day/night cycle (every 30 seconds)
            game.dayProgress = (game.gameTime % 30000) / 30000;
            if (game.gameTime % 30000 < 15000) {
                game.isDay = true;
            } else {
                game.isDay = false;
            }
            
            // Increase speed over time
            if (game.gameTime - game.lastSpeedIncrease > game.speedIncreaseInterval) {
                game.speed += 0.5;
                game.lastSpeedIncrease = game.gameTime;
                createParticles(game.player.x + game.player.width / 2, canvas.height - 100, '#00b4d8');
            }
            
            // Update player
            game.player.velocityY += game.player.gravity;
            game.player.y += game.player.velocityY;
            
            // Keep player on ground
            if (game.player.y > canvas.height - 100) {
                game.player.y = canvas.height - 100;
                game.player.velocityY = 0;
                game.player.isJumping = false;
            }
            
            // Update background elements
            game.background.forEach(item => {
                item.x -= game.speed * 0.5;
                if (item.x < -item.width) {
                    item.x = canvas.width;
                }
            });
            
            // Update clouds
            game.clouds.forEach(cloud => {
                cloud.x -= cloud.speed * (game.isDay ? 1 : 0.5);
                if (cloud.x < -cloud.width) {
                    cloud.x = canvas.width + cloud.width;
                    cloud.y = 50 + Math.random() * 100;
                }
            });
            
            // Generate obstacles
            const currentTime = Date.now();
            if (currentTime - game.lastObstacleTime > game.obstacleInterval) {
                createObstacle();
                game.lastObstacleTime = currentTime;
                
                // Decrease obstacle interval as speed increases (more frequent obstacles)
                game.obstacleInterval = Math.max(500, 1500 - (game.speed * 100));
            }
            
            // Update obstacles
            for (let i = game.obstacles.length - 1; i >= 0; i--) {
                const obstacle = game.obstacles[i];
                obstacle.x -= game.speed * 2;
                
                // Check collision
                if (checkCollision(game.player, obstacle)) {
                    gameOver();
                    return;
                }
                
                // Remove obstacles that are off screen
                if (obstacle.x < -obstacle.width) {
                    game.obstacles.splice(i, 1);
                    game.obstaclesAvoided++;
                    createParticles(obstacle.x + obstacle.width, obstacle.y + obstacle.height / 2, '#90e0ef');
                }
            }
            
            // Update particles
            for (let i = game.particles.length - 1; i >= 0; i--) {
                const particle = game.particles[i];
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.1; // Gravity
                particle.alpha -= 0.02;
                particle.size *= 0.98;
                
                if (particle.alpha <= 0) {
                    game.particles.splice(i, 1);
                }
            }
            
            updateStats();
        }
        
        // Create a new obstacle
        function createObstacle() {
            const types = ['rock', 'crate', 'hole', 'spike'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            let width, height, y, color;
            
            switch(type) {
                case 'rock':
                    width = 30 + Math.random() * 20;
                    height = 30 + Math.random() * 20;
                    y = canvas.height - 30 - height;
                    color = '#5a5a5a';
                    break;
                case 'crate':
                    width = 40;
                    height = 40;
                    y = canvas.height - 30 - height;
                    color = '#8b4513';
                    break;
                case 'hole':
                    width = 60 + Math.random() * 40;
                    height = 40;
                    y = canvas.height - 30 - height / 2;
                    color = '#333';
                    break;
                case 'spike':
                    width = 40;
                    height = 30;
                    y = canvas.height - 30 - height;
                    color = '#ff0054';
                    break;
            }
            
            game.obstacles.push({
                type: type,
                x: canvas.width,
                y: y,
                width: width,
                height: height,
                color: color
            });
        }
        
        // Create particles
        function createParticles(x, y, color) {
            for (let i = 0; i < 10; i++) {
                game.particles.push({
                    x: x,
                    y: y,
                    size: 3 + Math.random() * 5,
                    color: color,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4 - 2,
                    alpha: 0.8
                });
            }
        }
        
        // Check collision between player and obstacle
        function checkCollision(player, obstacle) {
            // Adjust player bounds for ducking
            let playerHeight = player.isDucking ? player.height - 30 : player.height;
            let playerY = player.isDucking ? player.y + 30 : player.y;
            
            return player.x < obstacle.x + obstacle.width &&
                   player.x + player.width > obstacle.x &&
                   playerY < obstacle.y + obstacle.height &&
                   playerY + playerHeight > obstacle.y;
        }
        
        // Jump function
        function jump(forceMultiplier = 1) {
            if (!game.player.isJumping && game.running) {
                game.player.velocityY = -game.player.jumpForce * forceMultiplier;
                game.player.isJumping = true;
                createParticles(game.player.x + game.player.width / 2, game.player.y + game.player.height, '#00b4d8');
            }
        }
        
        // Duck function
        function duck() {
            if (!game.player.isJumping && game.running) {
                game.player.isDucking = true;
                setTimeout(() => {
                    game.player.isDucking = false;
                }, 500);
            }
        }
        
        // Game over
        function gameOver() {
            game.running = false;
            game.paused = false;
            
            // Show game over screen
            document.getElementById('finalScore').textContent = Math.floor(game.score) + 'm';
            gameOverScreen.style.display = 'block';
            
            // Update button states
            document.getElementById('playBtn').disabled = false;
            document.getElementById('pauseBtn').disabled = true;
            
            // Create explosion particles
            for (let i = 0; i < 30; i++) {
                createParticles(
                    game.player.x + game.player.width / 2,
                    game.player.y + game.player.height / 2,
                    '#ff0054'
                );
            }
        }
        
        // Start game
        function startGame() {
            if (!game.running) {
                initGame();
                game.running = true;
                game.paused = false;
                gameOverScreen.style.display = 'none';
                
                // Update button states
                document.getElementById('playBtn').disabled = true;
                document.getElementById('pauseBtn').disabled = false;
                
                gameLoop();
            }
        }
        
        // Toggle pause
        function togglePause() {
            if (game.running) {
                game.paused = !game.paused;
                document.getElementById('pauseBtn').textContent = game.paused ? '▶️ Resume' : '⏸️ Pause';
            }
        }
        
        // Restart game
        function restartGame() {
            gameOverScreen.style.display = 'none';
            startGame();
        }
        
        // Game loop
        function gameLoop() {
            update();
            draw();
            
            if (game.running) {
                requestAnimationFrame(gameLoop);
            }
        }
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case ' ':
                case 'Spacebar':
                    if (!game.running) {
                        startGame();
                    } else {
                        jump();
                    }
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    if (game.running) {
                        jump(1.5); // Higher jump
                    }
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    if (game.running) {
                        duck();
                    }
                    e.preventDefault();
                    break;
                case 'p':
                case 'P':
                    if (game.running) {
                        togglePause();
                    }
                    break;
            }
        });
        
        // Initialize the game
        initGame();
        draw();
        
        // Button event listeners
        document.getElementById('playBtn').addEventListener('click', startGame);
        document.getElementById('pauseBtn').addEventListener('click', togglePause);
        
        // Touch controls for mobile
        canvas.addEventListener('touchstart', (e) => {
            if (!game.running) {
                startGame();
            } else {
                jump();
            }
            e.preventDefault();
        });
        
        // Double tap for higher jump
        let lastTap = 0;
        canvas.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0) {
                jump(1.5); // Double tap for higher jump
            }
            lastTap = currentTime;
            e.preventDefault();
        });
        
        // Swipe down for duck
        let startY;
        canvas.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        }, {passive: true});
        
        canvas.addEventListener('touchmove', (e) => {
            if (!startY || !game.running) return;
            
            const currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            
            if (deltaY > 50) { // Swipe down
                duck();
                startY = null;
            }
        }, {passive: true});
