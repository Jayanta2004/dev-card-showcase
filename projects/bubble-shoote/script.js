    (function() {
        // ---------- BUBBLE SHOOTER GAME ----------
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const bubblesDisplay = document.getElementById('bubblesDisplay');
        const comboDisplay = document.getElementById('comboDisplay');
        const nextBubblePreview = document.getElementById('nextBubblePreview');
        const aimHandle = document.getElementById('aimHandle');
        const shootBtn = document.getElementById('shootBtn');
        const resetBtn = document.getElementById('resetBtn');
        const colorBtns = document.querySelectorAll('.color-btn');

        // Game constants
        const ROWS = 8;
        const COLS = 12;
        const BUBBLE_RADIUS = 25;
        const GRID_WIDTH = COLS * BUBBLE_RADIUS * 2;
        const GRID_HEIGHT = ROWS * BUBBLE_RADIUS * 2;
        const GRID_OFFSET_X = (canvas.width - GRID_WIDTH) / 2;
        const GRID_OFFSET_Y = 50;

        // Game state
        let grid = [];
        let score = 0;
        let combo = 0;
        let currentBubble = null;
        let nextBubbleColor = '';
        let selectedColor = 'red';
        let aimAngle = 0; // in radians
        let gameActive = true;

        // Available colors
        const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'cyan'];
        const colorMap = {
            red: '#ff4d4d',
            green: '#4dff4d',
            blue: '#4d4dff',
            yellow: '#ffff4d',
            purple: '#ff4dff',
            cyan: '#4dffff'
        };

        // Initialize grid
        function initGrid() {
            grid = [];
            for (let row = 0; row < ROWS; row++) {
                grid[row] = [];
                for (let col = 0; col < COLS; col++) {
                    // Random bubbles for top rows only
                    if (row < 4 && Math.random() > 0.3) {
                        const randomColor = colors[Math.floor(Math.random() * colors.length)];
                        grid[row][col] = randomColor;
                    } else {
                        grid[row][col] = null;
                    }
                }
            }
            
            // Set next bubble
            nextBubbleColor = colors[Math.floor(Math.random() * colors.length)];
            updateNextPreview();
            
            // Set current bubble
            spawnNewBubble();
        }

        // Spawn new bubble
        function spawnNewBubble() {
            currentBubble = {
                color: nextBubbleColor,
                x: canvas.width / 2,
                y: canvas.height - 80,
                active: false
            };
            
            nextBubbleColor = colors[Math.floor(Math.random() * colors.length)];
            updateNextPreview();
        }

        // Update next bubble preview
        function updateNextPreview() {
            nextBubblePreview.style.backgroundColor = colorMap[nextBubbleColor];
        }

        // Shoot bubble
        function shootBubble() {
            if (!gameActive || !currentBubble) return;
            
            currentBubble.active = true;
            
            // Calculate direction based on aim angle
            const speed = 8;
            const dx = Math.sin(aimAngle) * speed;
            const dy = -Math.cos(aimAngle) * speed;
            
            currentBubble.vx = dx;
            currentBubble.vy = dy;
        }

        // Find grid position from coordinates
        function getGridPosition(x, y) {
            const col = Math.floor((x - GRID_OFFSET_X) / (BUBBLE_RADIUS * 2));
            const row = Math.floor((y - GRID_OFFSET_Y) / (BUBBLE_RADIUS * 2));
            
            if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
                return { row, col };
            }
            return null;
        }

        // Find adjacent matching bubbles
        function findMatches(row, col, color, visited = null) {
            if (!visited) {
                visited = new Array(ROWS).fill().map(() => new Array(COLS).fill(false));
            }
            
            if (row < 0 || row >= ROWS || col < 0 || col >= COLS || 
                visited[row][col] || grid[row][col] !== color) {
                return [];
            }
            
            visited[row][col] = true;
            let matches = [{ row, col }];
            
            // Check all adjacent cells (including diagonal for bubbles)
            const directions = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1],           [0, 1],
                [1, -1],  [1, 0],  [1, 1]
            ];
            
            for (let [dr, dc] of directions) {
                const newRow = row + dr;
                const newCol = col + dc;
                const adjMatches = findMatches(newRow, newCol, color, visited);
                matches = matches.concat(adjMatches);
            }
            
            return matches;
        }

        // Remove matches and update score
        function removeMatches() {
            let anyRemoved = false;
            let matchesToRemove = [];
            
            // Find all matches of 3+
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    if (grid[row][col]) {
                        const matches = findMatches(row, col, grid[row][col]);
                        if (matches.length >= 3) {
                            matchesToRemove = matchesToRemove.concat(matches);
                            anyRemoved = true;
                        }
                    }
                }
            }
            
            if (anyRemoved) {
                // Remove duplicates
                const uniqueMatches = [];
                const seen = new Set();
                
                for (let match of matchesToRemove) {
                    const key = `${match.row},${match.col}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        uniqueMatches.push(match);
                    }
                }
                
                // Update score (more bubbles = bigger bonus)
                const matchCount = uniqueMatches.length;
                const baseScore = matchCount * 10;
                const comboBonus = combo * 5;
                score += baseScore + comboBonus;
                combo++;
                
                // Remove bubbles
                for (let match of uniqueMatches) {
                    grid[match.row][match.col] = null;
                }
                
                // Drop bubbles above
                applyGravity();
                
                return true;
            }
            
            // No matches, reset combo
            combo = 0;
            return false;
        }

        // Apply gravity to bubbles
        function applyGravity() {
            for (let col = 0; col < COLS; col++) {
                for (let row = ROWS - 1; row >= 0; row--) {
                    if (grid[row][col] === null) {
                        // Find bubble above
                        for (let above = row - 1; above >= 0; above--) {
                            if (grid[above][col] !== null) {
                                grid[row][col] = grid[above][col];
                                grid[above][col] = null;
                                break;
                            }
                        }
                    }
                }
            }
        }

        // Update game
        function update() {
            if (!gameActive) return;

            // Update current bubble
            if (currentBubble && currentBubble.active) {
                currentBubble.x += currentBubble.vx;
                currentBubble.y += currentBubble.vy;
                
                // Check wall collisions
                if (currentBubble.x < BUBBLE_RADIUS || currentBubble.x > canvas.width - BUBBLE_RADIUS) {
                    currentBubble.vx *= -1;
                }
                
                // Check if bubble reached top
                if (currentBubble.y < GRID_OFFSET_Y) {
                    // Find grid position to place bubble
                    const gridPos = getGridPosition(currentBubble.x, currentBubble.y);
                    
                    if (gridPos && gridPos.row >= 0 && gridPos.row < ROWS && 
                        gridPos.col >= 0 && gridPos.col < COLS && 
                        !grid[gridPos.row][gridPos.col]) {
                        
                        // Place bubble in grid
                        grid[gridPos.row][gridPos.col] = currentBubble.color;
                        currentBubble.active = false;
                        
                        // Check for matches
                        removeMatches();
                        
                        // Spawn new bubble
                        spawnNewBubble();
                        
                        // Check for game over (bubbles too high)
                        for (let col = 0; col < COLS; col++) {
                            if (grid[0][col] !== null) {
                                gameActive = false;
                                break;
                            }
                        }
                    } else {
                        // Bounce
                        currentBubble.vy *= -0.8;
                    }
                }
            }

            // Update displays
            let bubbleCount = 0;
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    if (grid[row][col]) bubbleCount++;
                }
            }
            
            bubblesDisplay.textContent = bubbleCount;
            scoreDisplay.textContent = score;
            comboDisplay.textContent = combo;
        }

        // Draw everything
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw grid background
            ctx.fillStyle = '#0e3753';
            ctx.fillRect(GRID_OFFSET_X - 10, GRID_OFFSET_Y - 10, GRID_WIDTH + 20, GRID_HEIGHT + 20);
            
            // Draw grid lines
            ctx.strokeStyle = '#2c6b9c';
            ctx.lineWidth = 1;
            
            for (let row = 0; row <= ROWS; row++) {
                const y = GRID_OFFSET_Y + row * BUBBLE_RADIUS * 2;
                ctx.beginPath();
                ctx.moveTo(GRID_OFFSET_X, y);
                ctx.lineTo(GRID_OFFSET_X + GRID_WIDTH, y);
                ctx.stroke();
            }
            
            for (let col = 0; col <= COLS; col++) {
                const x = GRID_OFFSET_X + col * BUBBLE_RADIUS * 2;
                ctx.beginPath();
                ctx.moveTo(x, GRID_OFFSET_Y);
                ctx.lineTo(x, GRID_OFFSET_Y + GRID_HEIGHT);
                ctx.stroke();
            }

            // Draw bubbles
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    if (grid[row][col]) {
                        const x = GRID_OFFSET_X + col * BUBBLE_RADIUS * 2 + BUBBLE_RADIUS;
                        const y = GRID_OFFSET_Y + row * BUBBLE_RADIUS * 2 + BUBBLE_RADIUS;
                        
                        // Bubble shadow
                        ctx.shadowColor = '#00000080';
                        ctx.shadowBlur = 10;
                        ctx.shadowOffsetY = 3;
                        
                        // Bubble
                        ctx.beginPath();
                        ctx.arc(x, y, BUBBLE_RADIUS - 2, 0, Math.PI * 2);
                        ctx.fillStyle = colorMap[grid[row][col]];
                        ctx.fill();
                        
                        // Highlight
                        ctx.shadowBlur = 0;
                        ctx.beginPath();
                        ctx.arc(x - 5, y - 5, 8, 0, Math.PI * 2);
                        ctx.fillStyle = '#ffffff60';
                        ctx.fill();
                        
                        // Outline
                        ctx.strokeStyle = '#ffffff80';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.arc(x, y, BUBBLE_RADIUS - 2, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                }
            }

            // Draw aim line
            const startX = canvas.width / 2;
            const startY = canvas.height - 50;
            const endX = startX + Math.sin(aimAngle) * 200;
            const endY = startY - Math.cos(aimAngle) * 200;
            
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = '#ffffff80';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 10]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw current bubble
            if (currentBubble && !currentBubble.active) {
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#ffffff';
                ctx.beginPath();
                ctx.arc(currentBubble.x, currentBubble.y, BUBBLE_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = colorMap[currentBubble.color];
                ctx.fill();
                
                // Highlight
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.arc(currentBubble.x - 8, currentBubble.y - 8, 8, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff60';
                ctx.fill();
            }

            // Draw active bubble
            if (currentBubble && currentBubble.active) {
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(currentBubble.x, currentBubble.y, BUBBLE_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = colorMap[currentBubble.color];
                ctx.fill();
            }

            // Game over message
            if (!gameActive) {
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#000000b0';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = '#ffeb99';
                ctx.font = 'bold 40px Segoe UI';
                ctx.textAlign = 'center';
                ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
                ctx.font = '24px Segoe UI';
                ctx.fillStyle = '#ffffff';
                ctx.fillText('Score: ' + score, canvas.width/2, canvas.height/2 + 50);
            }
        }

        // Animation loop
        function gameLoop() {
            update();
            draw();
            requestAnimationFrame(gameLoop);
        }

        // Event listeners
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Calculate aim angle
            const dx = mouseX - canvas.width / 2;
            const dy = canvas.height - 50 - mouseY;
            aimAngle = Math.atan2(dx, dy);
            
            // Limit angle
            aimAngle = Math.max(-Math.PI/3, Math.min(Math.PI/3, aimAngle));
            
            // Update aim handle
            const handleX = 50 + (aimAngle / (Math.PI/3)) * 50;
            aimHandle.style.left = handleX + '%';
        });

        shootBtn.addEventListener('click', () => {
            shootBubble();
        });

        resetBtn.addEventListener('click', () => {
            initGrid();
            score = 0;
            combo = 0;
            gameActive = true;
            spawnNewBubble();
        });

        // Color selection
        colorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                colorBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedColor = btn.dataset.color;
                
                // For demo, we'll just change next bubble color
                nextBubbleColor = selectedColor;
                updateNextPreview();
            });
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                shootBubble();
            }
        });

        // Initialize
        initGrid();
        gameLoop();
    })();