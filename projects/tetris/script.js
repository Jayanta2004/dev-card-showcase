
        // Game constants
        const COLS = 10;
        const ROWS = 20;
        const BLOCK_SIZE = 30;
        const COLORS = [
            null,
            '#FF0D72', // I
            '#0DC2FF', // J
            '#0DFF72', // L
            '#F538FF', // O
            '#FF8E0D', // S
            '#FFE138', // T
            '#3877FF'  // Z
        ];

        // Tetromino shapes
        const SHAPES = [
            null,
            [
                [0,0,0,0],
                [1,1,1,1],
                [0,0,0,0],
                [0,0,0,0]
            ],
            [
                [2,0,0],
                [2,2,2],
                [0,0,0]
            ],
            [
                [0,0,3],
                [3,3,3],
                [0,0,0]
            ],
            [
                [4,4],
                [4,4]
            ],
            [
                [0,5,5],
                [5,5,0],
                [0,0,0]
            ],
            [
                [0,6,0],
                [6,6,6],
                [0,0,0]
            ],
            [
                [7,7,0],
                [0,7,7],
                [0,0,0]
            ]
        ];

        // Game variables
        let canvas, ctx;
        let board = [];
        let currentPiece;
        let score = 0;
        let level = 1;
        let rowsCleared = 0;
        let gameOver = false;
        let dropCounter = 0;
        let dropInterval = 1000;
        let lastTime = 0;
        let isPaused = false;

        // Initialize game
        function init() {
            canvas = document.getElementById('tetris');
            ctx = canvas.getContext('2d');
            
            // Scale canvas
            ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
            
            // Initialize board
            createBoard();
            
            // Create first piece
            currentPiece = createPiece();
            
            // Start game loop
            requestAnimationFrame(update);
            
            // Set up event listeners
            document.addEventListener('keydown', handleKeyPress);
            document.getElementById('restart').addEventListener('click', restartGame);
        }

        function createBoard() {
            board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
        }

        function createPiece() {
            const rand = Math.floor(Math.random() * 7) + 1;
            return {
                shape: SHAPES[rand],
                color: COLORS[rand],
                x: Math.floor(COLS / 2) - Math.floor(SHAPES[rand][0].length / 2),
                y: 0
            };
        }

        function draw() {
            // Clear canvas
            ctx.fillStyle = '#0d1b2a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw board
            board.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        ctx.fillStyle = COLORS[value];
                        ctx.fillRect(x, y, 0.9, 0.9);
                        ctx.strokeStyle = '#000';
                        ctx.strokeRect(x, y, 0.9, 0.9);
                    }
                });
            });
            
            // Draw current piece
            drawPiece(currentPiece);
            
            // Draw grid
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            for (let x = 0; x <= COLS; x++) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, ROWS);
                ctx.stroke();
            }
            for (let y = 0; y <= ROWS; y++) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(COLS, y);
                ctx.stroke();
            }
        }

        function drawPiece(piece) {
            ctx.fillStyle = piece.color;
            piece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        ctx.fillRect(piece.x + x, piece.y + y, 0.9, 0.9);
                        ctx.strokeStyle = '#000';
                        ctx.strokeRect(piece.x + x, piece.y + y, 0.9, 0.9);
                    }
                });
            });
        }

        function collide(board, piece) {
            return piece.shape.find((row, y) => {
                return row.find((value, x) => {
                    return value &&
                        (board[y + piece.y] &&
                        board[y + piece.y][x + piece.x]) !== 0;
                });
            });
        }

        function merge(board, piece) {
            piece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        board[y + piece.y][x + piece.x] = value;
                    }
                });
            });
        }

        function rotate(piece) {
            const rotated = [];
            for (let y = 0; y < piece.shape[0].length; y++) {
                const newRow = [];
                for (let x = piece.shape.length - 1; x >= 0; x--) {
                    newRow.push(piece.shape[x][y]);
                }
                rotated.push(newRow);
            }
            
            // Check if rotation is valid
            const testPiece = {
                ...piece,
                shape: rotated
            };
            
            if (!collide(board, testPiece)) {
                return rotated;
            }
            return piece.shape;
        }

        function clearRows() {
            let cleared = 0;
            
            outer: for (let y = ROWS - 1; y >= 0; y--) {
                for (let x = 0; x < COLS; x++) {
                    if (board[y][x] === 0) {
                        continue outer;
                    }
                }
                
                // Remove the row and add new empty row at top
                const row = board.splice(y, 1)[0].fill(0);
                board.unshift(row);
                cleared++;
                y++; // Check same row again
            }
            
            if (cleared > 0) {
                // Update score
                const points = [0, 100, 300, 500, 800][cleared] * level;
                score += points;
                rowsCleared += cleared;
                
                // Update level every 10 rows
                level = Math.floor(rowsCleared / 10) + 1;
                
                // Increase speed with level
                dropInterval = Math.max(100, 1000 - (level - 1) * 100);
                
                updateDisplay();
            }
        }

        function update(time = 0) {
            if (gameOver || isPaused) {
                requestAnimationFrame(update);
                return;
            }
            
            const deltaTime = time - lastTime;
            lastTime = time;
            
            dropCounter += deltaTime;
            if (dropCounter > dropInterval) {
                dropPiece();
                dropCounter = 0;
            }
            
            draw();
            requestAnimationFrame(update);
        }

        function dropPiece() {
            currentPiece.y++;
            if (collide(board, currentPiece)) {
                currentPiece.y--;
                merge(board, currentPiece);
                clearRows();
                currentPiece = createPiece();
                
                // Check game over
                if (collide(board, currentPiece)) {
                    gameOver = true;
                    showGameOver();
                }
            }
        }

        function handleKeyPress(event) {
            if (gameOver || isPaused) {
                if (event.key === 'p') {
                    isPaused = false;
                }
                return;
            }
            
            switch(event.key) {
                case 'ArrowLeft':
                    currentPiece.x--;
                    if (collide(board, currentPiece)) currentPiece.x++;
                    break;
                case 'ArrowRight':
                    currentPiece.x++;
                    if (collide(board, currentPiece)) currentPiece.x--;
                    break;
                case 'ArrowDown':
                    dropPiece();
                    break;
                case 'ArrowUp':
                    currentPiece.shape = rotate(currentPiece);
                    break;
                case ' ':
                    // Hard drop
                    while(!collide(board, currentPiece)) {
                        currentPiece.y++;
                    }
                    currentPiece.y--;
                    dropPiece();
                    break;
                case 'p':
                    isPaused = !isPaused;
                    break;
            }
        }

        function updateDisplay() {
            document.getElementById('score').textContent = score;
            document.getElementById('level').textContent = level;
            document.getElementById('rows').textContent = rowsCleared;
        }

        function showGameOver() {
            document.getElementById('finalScore').textContent = score;
            document.getElementById('gameOver').style.display = 'block';
        }

        function restartGame() {
            createBoard();
            currentPiece = createPiece();
            score = 0;
            level = 1;
            rowsCleared = 0;
            gameOver = false;
            dropInterval = 1000;
            isPaused = false;
            updateDisplay();
            document.getElementById('gameOver').style.display = 'none';
            lastTime = 0;
            dropCounter = 0;
        }

        // Start game when page loads
        window.addEventListener('load', init);