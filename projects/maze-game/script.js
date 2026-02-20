
        // Game constants
        const GRID_SIZE = 20;
        const PLAYER_COLOR = '#4dabf7';
        const ENEMY_COLOR = '#ff6b6b';
        const ITEM_COLOR = '#51cf66';
        const POWERUP_COLOR = '#ffd43b';
        const WALL_COLOR = '#1a3b5a';
        const PATH_COLOR = '#0a1929';
        
        // Game variables
        let player = { x: 1, y: 1 };
        let enemies = [];
        let items = [];
        let powerUps = [];
        let walls = [];
        let score = 0;
        let itemsCollected = 0;
        let totalItems = 10;
        let lives = 3;
        let level = 1;
        let gameRunning = true;
        let powerUpActive = false;
        let powerUpTimer = 0;
        const POWERUP_DURATION = 300; // 5 seconds at 60fps
        
        // Canvas setup
        const canvas = document.getElementById('mazeCanvas');
        const ctx = canvas.getContext('2d');
        
        // Initialize the game
        function initGame() {
            // Reset game state
            player = { x: 1, y: 1 };
            enemies = [];
            items = [];
            powerUps = [];
            walls = [];
            itemsCollected = 0;
            gameRunning = true;
            powerUpActive = false;
            powerUpTimer = 0;
            
            // Generate maze based on level
            generateMaze();
            
            // Generate items
            generateItems();
            
            // Generate power-ups
            generatePowerUps();
            
            // Generate enemies based on level
            generateEnemies();
            
            // Update UI
            updateUI();
            
            // Hide game message
            document.getElementById('gameMessage').style.display = 'none';
            
            // Start game loop
            if (typeof gameLoop !== 'undefined') {
                cancelAnimationFrame(gameLoop);
            }
            requestAnimationFrame(gameLoop);
        }
        
        // Generate maze walls
        function generateMaze() {
            // Clear walls
            walls = [];
            
            // Create outer walls
            for (let x = 0; x < canvas.width / GRID_SIZE; x++) {
                walls.push({ x: x, y: 0 });
                walls.push({ x: x, y: Math.floor(canvas.height / GRID_SIZE) - 1 });
            }
            
            for (let y = 0; y < canvas.height / GRID_SIZE; y++) {
                walls.push({ x: 0, y: y });
                walls.push({ x: Math.floor(canvas.width / GRID_SIZE) - 1, y: y });
            }
            
            // Generate random inner walls based on level
            const wallCount = 50 + level * 10;
            for (let i = 0; i < wallCount; i++) {
                let wallX = Math.floor(Math.random() * (canvas.width / GRID_SIZE - 4)) + 2;
                let wallY = Math.floor(Math.random() * (canvas.height / GRID_SIZE - 4)) + 2;
                
                // Ensure walls don't block the starting position
                if ((wallX !== 1 || wallY !== 1) && (wallX !== 2 || wallY !== 1) && (wallX !== 1 || wallY !== 2)) {
                    walls.push({ x: wallX, y: wallY });
                }
            }
            
            // Ensure there's a path to all areas (simplified)
            // In a full implementation, we would use a maze generation algorithm
        }
        
        // Generate collectible items
        function generateItems() {
            items = [];
            totalItems = 10 + level * 2;
            
            for (let i = 0; i < totalItems; i++) {
                let itemX, itemY;
                let attempts = 0;
                
                do {
                    itemX = Math.floor(Math.random() * (canvas.width / GRID_SIZE - 2)) + 1;
                    itemY = Math.floor(Math.random() * (canvas.height / GRID_SIZE - 2)) + 1;
                    attempts++;
                } while (
                    (itemX === player.x && itemY === player.y) ||
                    isWall(itemX, itemY) ||
                    isItemAt(itemX, itemY) ||
                    attempts < 100
                );
                
                if (attempts < 100) {
                    items.push({ x: itemX, y: itemY });
                }
            }
        }
        
        // Generate power-ups
        function generatePowerUps() {
            powerUps = [];
            const powerUpCount = 2 + Math.floor(level / 2);
            
            for (let i = 0; i < powerUpCount; i++) {
                let powerUpX, powerUpY;
                let attempts = 0;
                
                do {
                    powerUpX = Math.floor(Math.random() * (canvas.width / GRID_SIZE - 2)) + 1;
                    powerUpY = Math.floor(Math.random() * (canvas.height / GRID_SIZE - 2)) + 1;
                    attempts++;
                } while (
                    (powerUpX === player.x && powerUpY === player.y) ||
                    isWall(powerUpX, powerUpY) ||
                    isItemAt(powerUpX, powerUpY) ||
                    isPowerUpAt(powerUpX, powerUpY) ||
                    attempts < 100
                );
                
                if (attempts < 100) {
                    powerUps.push({ x: powerUpX, y: powerUpY });
                }
            }
        }
        
        // Generate enemies
        function generateEnemies() {
            enemies = [];
            const enemyCount = Math.min(3 + level, 8); // Cap at 8 enemies
            
            for (let i = 0; i < enemyCount; i++) {
                let enemyX, enemyY;
                let attempts = 0;
                
                do {
                    enemyX = Math.floor(Math.random() * (canvas.width / GRID_SIZE - 4)) + 2;
                    enemyY = Math.floor(Math.random() * (canvas.height / GRID_SIZE - 4)) + 2;
                    attempts++;
                } while (
                    Math.abs(enemyX - player.x) < 5 && Math.abs(enemyY - player.y) < 5 ||
                    isWall(enemyX, enemyY) ||
                    isEnemyAt(enemyX, enemyY) ||
                    attempts < 100
                );
                
                if (attempts < 100) {
                    enemies.push({
                        x: enemyX,
                        y: enemyY,
                        color: ENEMY_COLOR,
                        speed: 0.5 + level * 0.1, // Increase speed with level
                        moveCounter: 0,
                        moveDelay: Math.floor(Math.random() * 10) // Stagger enemy movements
                    });
                }
            }
        }
        
        // Check if position has a wall
        function isWall(x, y) {
            return walls.some(wall => wall.x === x && wall.y === y);
        }
        
        // Check if position has an item
        function isItemAt(x, y) {
            return items.some(item => item.x === x && item.y === y);
        }
        
        // Check if position has a power-up
        function isPowerUpAt(x, y) {
            return powerUps.some(powerUp => powerUp.x === x && powerUp.y === y);
        }
        
        // Check if position has an enemy
        function isEnemyAt(x, y) {
            return enemies.some(enemy => enemy.x === x && enemy.y === y);
        }
        
        // Move player
        function movePlayer(dx, dy) {
            if (!gameRunning) return;
            
            const newX = player.x + dx;
            const newY = player.y + dy;
            
            // Check for walls
            if (isWall(newX, newY)) return;
            
            // Check canvas boundaries
            if (newX < 0 || newX >= canvas.width / GRID_SIZE ||
                newY < 0 || newY >= canvas.height / GRID_SIZE) return;
            
            // Move player
            player.x = newX;
            player.y = newY;
            
            // Check for item collection
            const itemIndex = items.findIndex(item => item.x === player.x && item.y === player.y);
            if (itemIndex !== -1) {
                items.splice(itemIndex, 1);
                itemsCollected++;
                score += 10 * level;
                
                // Check for level completion
                if (itemsCollected >= totalItems) {
                    levelComplete();
                }
            }
            
            // Check for power-up collection
            const powerUpIndex = powerUps.findIndex(powerUp => powerUp.x === player.x && powerUp.y === player.y);
            if (powerUpIndex !== -1) {
                powerUps.splice(powerUpIndex, 1);
                activatePowerUp();
                score += 50;
            }
            
            // Update UI
            updateUI();
        }
        
        // Activate power-up (freeze enemies)
        function activatePowerUp() {
            powerUpActive = true;
            powerUpTimer = POWERUP_DURATION;
            
            // Change enemy colors to indicate they're frozen
            enemies.forEach(enemy => {
                enemy.originalColor = enemy.color;
                enemy.color = '#aaa';
            });
        }
        
        // Update power-up timer
        function updatePowerUp() {
            if (powerUpActive) {
                powerUpTimer--;
                
                if (powerUpTimer <= 0) {
                    powerUpActive = false;
                    // Restore enemy colors
                    enemies.forEach(enemy => {
                        if (enemy.originalColor) {
                            enemy.color = enemy.originalColor;
                        }
                    });
                }
            }
        }
        
        // Move enemies
        function moveEnemies() {
            if (powerUpActive) return; // Enemies don't move when power-up is active
            
            enemies.forEach(enemy => {
                enemy.moveCounter++;
                
                // Only move every few frames (based on speed)
                if (enemy.moveCounter >= 10 - enemy.speed * 5) {
                    enemy.moveCounter = 0;
                    
                    // Simple pathfinding: move towards player
                    const dx = player.x - enemy.x;
                    const dy = player.y - enemy.y;
                    
                    // Try to move horizontally or vertically towards player
                    let moveX = 0, moveY = 0;
                    
                    if (Math.abs(dx) > Math.abs(dy)) {
                        moveX = dx > 0 ? 1 : -1;
                    } else {
                        moveY = dy > 0 ? 1 : -1;
                    }
                    
                    // Check if move is valid
                    const newX = enemy.x + moveX;
                    const newY = enemy.y + moveY;
                    
                    if (!isWall(newX, newY)) {
                        enemy.x = newX;
                        enemy.y = newY;
                    } else {
                        // If can't move towards player, try random move
                        const moves = [
                            { dx: 1, dy: 0 },
                            { dx: -1, dy: 0 },
                            { dx: 0, dy: 1 },
                            { dx: 0, dy: -1 }
                        ];
                        
                        const randomMove = moves[Math.floor(Math.random() * moves.length)];
                        const altX = enemy.x + randomMove.dx;
                        const altY = enemy.y + randomMove.dy;
                        
                        if (!isWall(altX, altY)) {
                            enemy.x = altX;
                            enemy.y = altY;
                        }
                    }
                    
                    // Check for collision with player
                    if (enemy.x === player.x && enemy.y === player.y) {
                        playerCaught();
                    }
                }
            });
        }
        
        // Handle player caught by enemy
        function playerCaught() {
            lives--;
            updateUI();
            
            if (lives <= 0) {
                gameOver(false);
            } else {
                // Reset player position
                player.x = 1;
                player.y = 1;
                
                // Flash the screen (visual feedback)
                canvas.style.backgroundColor = 'rgba(255, 100, 100, 0.3)';
                setTimeout(() => {
                    canvas.style.backgroundColor = '';
                }, 300);
            }
        }
        
        // Handle level completion
        function levelComplete() {
            score += 100 * level;
            level++;
            
            // Update UI
            updateUI();
            
            // Show level complete message
            document.getElementById('messageTitle').textContent = `Level ${level-1} Complete!`;
            document.getElementById('messageText').textContent = `You collected all items! Get ready for level ${level} with more enemies.`;
            document.getElementById('gameMessage').style.display = 'block';
            
            // Continue to next level after a delay
            setTimeout(() => {
                initGame();
            }, 2000);
        }
        
        // Handle game over
        function gameOver(win) {
            gameRunning = false;
            
            if (win) {
                document.getElementById('messageTitle').textContent = "You Win!";
                document.getElementById('messageText').textContent = `Congratulations! You completed all levels with a score of ${score}.`;
            } else {
                document.getElementById('messageTitle').textContent = "Game Over";
                document.getElementById('messageText').textContent = `You were caught by an enemy! Final score: ${score}.`;
            }
            
            document.getElementById('gameMessage').style.display = 'block';
        }
        
        // Update UI elements
        function updateUI() {
            document.getElementById('scoreValue').textContent = score;
            document.getElementById('itemsValue').textContent = `${itemsCollected}/${totalItems}`;
            document.getElementById('livesValue').textContent = lives;
            document.getElementById('levelValue').textContent = level;
            document.getElementById('enemiesValue').textContent = enemies.length;
        }
        
        // Draw the game
        function draw() {
            // Clear canvas
            ctx.fillStyle = PATH_COLOR;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw walls
            ctx.fillStyle = WALL_COLOR;
            walls.forEach(wall => {
                ctx.fillRect(wall.x * GRID_SIZE, wall.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                
                // Add some texture to walls
                ctx.strokeStyle = '#15375a';
                ctx.strokeRect(wall.x * GRID_SIZE, wall.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            });
            
            // Draw items
            ctx.fillStyle = ITEM_COLOR;
            items.forEach(item => {
                ctx.beginPath();
                ctx.arc(
                    item.x * GRID_SIZE + GRID_SIZE/2,
                    item.y * GRID_SIZE + GRID_SIZE/2,
                    GRID_SIZE/3,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                // Add glow effect
                ctx.shadowColor = ITEM_COLOR;
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
            });
            
            // Draw power-ups
            ctx.fillStyle = POWERUP_COLOR;
            powerUps.forEach(powerUp => {
                ctx.beginPath();
                ctx.arc(
                    powerUp.x * GRID_SIZE + GRID_SIZE/2,
                    powerUp.y * GRID_SIZE + GRID_SIZE/2,
                    GRID_SIZE/2.5,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                // Add star shape inside
                ctx.fillStyle = '#ffa94d';
                ctx.beginPath();
                ctx.moveTo(powerUp.x * GRID_SIZE + GRID_SIZE/2, powerUp.y * GRID_SIZE + GRID_SIZE/4);
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 2 * Math.PI) / 5 - Math.PI/2;
                    const x = powerUp.x * GRID_SIZE + GRID_SIZE/2 + Math.cos(angle) * GRID_SIZE/4;
                    const y = powerUp.y * GRID_SIZE + GRID_SIZE/2 + Math.sin(angle) * GRID_SIZE/4;
                    ctx.lineTo(x, y);
                    
                    const innerAngle = angle + Math.PI/5;
                    const innerX = powerUp.x * GRID_SIZE + GRID_SIZE/2 + Math.cos(innerAngle) * GRID_SIZE/8;
                    const innerY = powerUp.y * GRID_SIZE + GRID_SIZE/2 + Math.sin(innerAngle) * GRID_SIZE/8;
                    ctx.lineTo(innerX, innerY);
                }
                ctx.closePath();
                ctx.fill();
                
                // Reset color
                ctx.fillStyle = POWERUP_COLOR;
                
                // Add glow effect
                ctx.shadowColor = POWERUP_COLOR;
                ctx.shadowBlur = 15;
                ctx.fill();
                ctx.shadowBlur = 0;
            });
            
            // Draw enemies
            enemies.forEach(enemy => {
                ctx.fillStyle = enemy.color;
                ctx.beginPath();
                ctx.arc(
                    enemy.x * GRID_SIZE + GRID_SIZE/2,
                    enemy.y * GRID_SIZE + GRID_SIZE/2,
                    GRID_SIZE/2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                // Add enemy eyes
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(
                    enemy.x * GRID_SIZE + GRID_SIZE/2 - GRID_SIZE/4,
                    enemy.y * GRID_SIZE + GRID_SIZE/2 - GRID_SIZE/6,
                    GRID_SIZE/6,
                    0,
                    Math.PI * 2
                );
                ctx.arc(
                    enemy.x * GRID_SIZE + GRID_SIZE/2 + GRID_SIZE/4,
                    enemy.y * GRID_SIZE + GRID_SIZE/2 - GRID_SIZE/6,
                    GRID_SIZE/6,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                // Add enemy pupils
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(
                    enemy.x * GRID_SIZE + GRID_SIZE/2 - GRID_SIZE/4,
                    enemy.y * GRID_SIZE + GRID_SIZE/2 - GRID_SIZE/6,
                    GRID_SIZE/8,
                    0,
                    Math.PI * 2
                );
                ctx.arc(
                    enemy.x * GRID_SIZE + GRID_SIZE/2 + GRID_SIZE/4,
                    enemy.y * GRID_SIZE + GRID_SIZE/2 - GRID_SIZE/6,
                    GRID_SIZE/8,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            });
            
            // Draw player
            ctx.fillStyle = PLAYER_COLOR;
            ctx.beginPath();
            ctx.arc(
                player.x * GRID_SIZE + GRID_SIZE/2,
                player.y * GRID_SIZE + GRID_SIZE/2,
                GRID_SIZE/2,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Add player details
            ctx.fillStyle = '#a5d8ff';
            ctx.beginPath();
            ctx.arc(
                player.x * GRID_SIZE + GRID_SIZE/2,
                player.y * GRID_SIZE + GRID_SIZE/2 - GRID_SIZE/6,
                GRID_SIZE/4,
                0,
                Math.PI
            );
            ctx.fill();
            
            // Add glow effect to player
            ctx.shadowColor = PLAYER_COLOR;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        // Game loop
        function gameLoop() {
            if (!gameRunning) return;
            
            // Update game state
            moveEnemies();
            updatePowerUp();
            
            // Draw everything
            draw();
            
            // Continue game loop
            requestAnimationFrame(gameLoop);
        }
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    movePlayer(0, -1);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    movePlayer(0, 1);
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    movePlayer(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    movePlayer(1, 0);
                    break;
                case ' ':
                    // Space bar for action (can be used for special ability)
                    break;
            }
        });
        
        // Button controls
        document.getElementById('up').addEventListener('click', () => movePlayer(0, -1));
        document.getElementById('down').addEventListener('click', () => movePlayer(0, 1));
        document.getElementById('left').addEventListener('click', () => movePlayer(-1, 0));
        document.getElementById('right').addEventListener('click', () => movePlayer(1, 0));
        document.getElementById('action').addEventListener('click', () => {
            // Special action (could be implemented as a dash/teleport)
            if (gameRunning) {
                score += 5; // Bonus for using action
                updateUI();
            }
        });
        
        // Restart button
        document.getElementById('restartButton').addEventListener('click', () => {
            // Reset game stats
            score = 0;
            lives = 3;
            level = 1;
            initGame();
        });
        
        // Initialize the game
        initGame();
        
        // Add some visual effects to the header
        const header = document.querySelector('.header');
        setInterval(() => {
            const hue = Math.sin(Date.now() / 10000) * 30 + 200;
            header.style.boxShadow = `0 8px 16px rgba(0, 0, 0, 0.4), 0 0 30px hsla(${hue}, 100%, 60%, 0.3)`;
        }, 100);
    