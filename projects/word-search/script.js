    (function() {
        // ---------- WORD SEARCH GAME ----------
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const wordsList = document.getElementById('wordsList');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const gridSizeDisplay = document.getElementById('gridSizeDisplay');
        const timeDisplay = document.getElementById('timeDisplay');
        const selectionDisplay = document.getElementById('selectionDisplay');
        const newGameBtn = document.getElementById('newGameBtn');
        const resetBtn = document.getElementById('resetBtn');
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');

        // Game constants
        const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        // Word lists by difficulty
        const wordLists = {
            easy: [
                'CAT', 'DOG', 'BIRD', 'FISH', 'FROG',
                'ANT', 'BEE', 'COW', 'PIG', 'DUCK',
                'OWL', 'RAT', 'BAT', 'FOX', 'BEAR'
            ],
            medium: [
                'PYTHON', 'JAVA', 'RUBY', 'SWIFT', 'BASIC',
                'APPLE', 'BANANA', 'GRAPE', 'MANGO', 'PEACH',
                'OCEAN', 'RIVER', 'FOREST', 'DESERT', 'MOUNTAIN'
            ],
            hard: [
                'ELEPHANT', 'GIRAFFE', 'DOLPHIN', 'PENGUIN', 'KANGAROO',
                'CHOCOLATE', 'VANILLA', 'STRAWBERRY', 'BLUEBERRY', 'CARAMEL',
                'HARMONY', 'SYMPHONY', 'MELODY', 'RHYTHM', 'POETRY'
            ]
        };

        // Game state
        let grid = [];
        let gridSize = 12;
        let words = [];
        let foundWords = [];
        let currentDifficulty = 'easy';
        
        // Selection state
        let isSelecting = false;
        let startCell = null;
        let endCell = null;
        let selectedCells = [];
        
        // Timer
        let startTime = null;
        let timerInterval = null;
        let elapsedSeconds = 0;

        // Initialize game
        function initGame() {
            // Set grid size based on difficulty
            switch(currentDifficulty) {
                case 'easy':
                    gridSize = 10;
                    break;
                case 'medium':
                    gridSize = 12;
                    break;
                case 'hard':
                    gridSize = 14;
                    break;
            }
            
            gridSizeDisplay.textContent = `${gridSize}x${gridSize}`;
            
            // Select words for this game
            const allWords = wordLists[currentDifficulty];
            words = [...allWords].sort(() => 0.5 - Math.random()).slice(0, 8);
            
            // Create empty grid
            grid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
            
            // Place words in grid
            placeWords();
            
            // Fill remaining cells with random letters
            fillRemaining();
            
            // Reset selection
            clearSelection();
            
            // Reset found words
            foundWords = [];
            
            // Update word list display
            updateWordList();
            
            // Reset timer
            resetTimer();
            
            // Draw grid
            draw();
        }

        // Place words in grid
        function placeWords() {
            const directions = [
                [0, 1],   // right
                [1, 0],   // down
                [1, 1],   // diagonal down-right
                [0, -1],  // left
                [-1, 0],  // up
                [-1, -1], // diagonal up-left
                [1, -1],  // diagonal down-left
                [-1, 1]   // diagonal up-right
            ];

            for (let word of words) {
                let placed = false;
                let attempts = 0;
                
                while (!placed && attempts < 1000) {
                    const direction = directions[Math.floor(Math.random() * directions.length)];
                    const [dx, dy] = direction;
                    
                    const startRow = Math.floor(Math.random() * gridSize);
                    const startCol = Math.floor(Math.random() * gridSize);
                    
                    let valid = true;
                    let row = startRow;
                    let col = startCol;
                    
                    // Check if word fits
                    for (let i = 0; i < word.length; i++) {
                        if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
                            valid = false;
                            break;
                        }
                        if (grid[row][col] !== '' && grid[row][col] !== word[i]) {
                            valid = false;
                            break;
                        }
                        row += dx;
                        col += dy;
                    }
                    
                    if (valid) {
                        // Place the word
                        row = startRow;
                        col = startCol;
                        for (let i = 0; i < word.length; i++) {
                            grid[row][col] = word[i];
                            row += dx;
                            col += dy;
                        }
                        placed = true;
                    }
                    
                    attempts++;
                }
            }
        }

        // Fill empty cells with random letters
        function fillRemaining() {
            for (let row = 0; row < gridSize; row++) {
                for (let col = 0; col < gridSize; col++) {
                    if (grid[row][col] === '') {
                        grid[row][col] = LETTERS[Math.floor(Math.random() * LETTERS.length)];
                    }
                }
            }
        }

        // Update word list display
        function updateWordList() {
            let html = '';
            words.forEach(word => {
                const found = foundWords.includes(word);
                html += `<div class="word-item ${found ? 'found' : ''}">${word}</div>`;
            });
            wordsList.innerHTML = html;
            
            scoreDisplay.textContent = `${foundWords.length}/${words.length}`;
        }

        // Check if selected cells form a word
        function checkSelection() {
            if (selectedCells.length === 0) return;
            
            // Get word from selected cells
            let selectedWord = '';
            for (let cell of selectedCells) {
                selectedWord += grid[cell.row][cell.col];
            }
            
            // Check forward and backward
            const reversed = selectedWord.split('').reverse().join('');
            
            let found = null;
            for (let word of words) {
                if (!foundWords.includes(word)) {
                    if (word === selectedWord || word === reversed) {
                        found = word;
                        break;
                    }
                }
            }
            
            if (found) {
                // Word found!
                foundWords.push(found);
                updateWordList();
                selectionDisplay.textContent = `✅ Found: ${found}!`;
                
                // Highlight found word permanently
                // (already highlighted in yellow)
                
                // Check if all words found
                if (foundWords.length === words.length) {
                    selectionDisplay.textContent = '🎉 CONGRATULATIONS! All words found!';
                }
            } else {
                selectionDisplay.textContent = `❌ Not a word: ${selectedWord}`;
            }
        }

        // Clear selection
        function clearSelection() {
            isSelecting = false;
            startCell = null;
            endCell = null;
            selectedCells = [];
            selectionDisplay.textContent = '👆 Click and drag to select';
        }

        // Get cell from mouse coordinates
        function getCellFromMouse(x, y) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            const canvasX = (x - rect.left) * scaleX;
            const canvasY = (y - rect.top) * scaleY;
            
            const cellSize = canvas.width / gridSize;
            const col = Math.floor(canvasX / cellSize);
            const row = Math.floor(canvasY / cellSize);
            
            if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
                return { row, col };
            }
            return null;
        }

        // Update selection based on start and end cells
        function updateSelection() {
            if (!startCell || !endCell) return;
            
            selectedCells = [];
            
            const dx = endCell.col - startCell.col;
            const dy = endCell.row - startCell.row;
            
            // Determine direction
            const steps = Math.max(Math.abs(dx), Math.abs(dy));
            
            if (steps === 0) {
                selectedCells = [startCell];
                return;
            }
            
            // Check if it's a straight line (horizontal, vertical, or diagonal)
            if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) {
                // Not a straight line
                return;
            }
            
            const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
            const stepY = dy === 0 ? 0 : dy / Math.abs(dy);
            
            for (let i = 0; i <= steps; i++) {
                const row = startCell.row + i * stepY;
                const col = startCell.col + i * stepX;
                
                if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
                    selectedCells.push({ row, col });
                }
            }
        }

        // Draw the grid
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const cellSize = canvas.width / gridSize;
            
            // Draw grid lines
            ctx.strokeStyle = '#34495e';
            ctx.lineWidth = 2;
            
            for (let i = 0; i <= gridSize; i++) {
                ctx.beginPath();
                ctx.moveTo(i * cellSize, 0);
                ctx.lineTo(i * cellSize, canvas.height);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(0, i * cellSize);
                ctx.lineTo(canvas.width, i * cellSize);
                ctx.stroke();
            }
            
            // Draw letters
            ctx.font = `bold ${cellSize * 0.5}px 'Segoe UI', monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            for (let row = 0; row < gridSize; row++) {
                for (let col = 0; col < gridSize; col++) {
                    const x = col * cellSize + cellSize / 2;
                    const y = row * cellSize + cellSize / 2;
                    
                    // Check if cell is selected
                    const isSelected = selectedCells.some(cell => cell.row === row && cell.col === col);
                    
                    if (isSelected) {
                        // Selected cells highlight
                        ctx.fillStyle = '#f1c40f80';
                        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                    }
                    
                    // Check if cell is part of a found word
                    let isFound = false;
                    for (let word of foundWords) {
                        // This is simplified - in a real game you'd store word positions
                        // For demo, we'll just highlight randomly to show the effect
                    }
                    
                    ctx.fillStyle = '#2c3e50';
                    ctx.fillText(grid[row][col], x, y);
                }
            }
        }

        // Timer functions
        function startTimer() {
            if (timerInterval) clearInterval(timerInterval);
            startTime = Date.now() - elapsedSeconds * 1000;
            
            timerInterval = setInterval(() => {
                const now = Date.now();
                elapsedSeconds = Math.floor((now - startTime) / 1000);
                
                const minutes = Math.floor(elapsedSeconds / 60);
                const seconds = elapsedSeconds % 60;
                timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }, 1000);
        }

        function resetTimer() {
            if (timerInterval) clearInterval(timerInterval);
            elapsedSeconds = 0;
            timeDisplay.textContent = '0:00';
            startTimer();
        }

        // Event listeners
        canvas.addEventListener('mousedown', (e) => {
            const cell = getCellFromMouse(e.clientX, e.clientY);
            if (cell) {
                isSelecting = true;
                startCell = cell;
                endCell = cell;
                selectedCells = [cell];
                draw();
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!isSelecting) return;
            
            const cell = getCellFromMouse(e.clientX, e.clientY);
            if (cell) {
                endCell = cell;
                updateSelection();
                draw();
            }
        });

        canvas.addEventListener('mouseup', () => {
            if (isSelecting && selectedCells.length > 0) {
                checkSelection();
            }
            isSelecting = false;
            draw();
        });

        canvas.addEventListener('mouseleave', () => {
            if (isSelecting) {
                isSelecting = false;
                draw();
            }
        });

        newGameBtn.addEventListener('click', () => {
            initGame();
        });

        resetBtn.addEventListener('click', () => {
            clearSelection();
            draw();
        });

        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                currentDifficulty = btn.dataset.diff;
                initGame();
            });
        });

        // Initialize game
        initGame();
    })();