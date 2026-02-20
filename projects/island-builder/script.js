class IslandBuilder {
    constructor() {
        this.score = 0;
        this.turnsLeft = 20;
        this.maxTurns = 20;
        this.currentTile = null;
        this.placedTiles = [];
        this.gameHistory = [];
        this.isGameOver = false;
        
        // Game board setup (20x20 grid)
        this.boardSize = 20;
        this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(null));
        
        // Tile types with their properties
        this.tileTypes = {
            water: { emoji: '🌊', name: 'Water', description: 'Scores with adjacent land', color: '#3498db' },
            land: { emoji: '🟫', name: 'Land', description: 'Basic terrain, works with everything', color: '#f39c12' },
            forest: { emoji: '🌲', name: 'Forest', description: 'Scores well with land and mountains', color: '#27ae60' },
            mountain: { emoji: '⛰️', name: 'Mountain', description: 'Bonus with forests', color: '#95a5a6' },
            building: { emoji: '🏠', name: 'Building', description: 'High value with land', color: '#e74c3c' }
        };
        
        // Create tile deck
        this.deck = this.createDeck();
        this.shuffleDeck();
        
        this.setupEventListeners();
        this.initializeBoard();
        this.drawNewTile();
        this.updateDisplay();
    }
    
    createDeck() {
        // Create a balanced deck of tiles
        const deck = [];
        const distribution = {
            land: 8,      // Most common, basic terrain
            water: 6,     // Common, for coastal areas
            forest: 5,    // Good scoring with land
            building: 3,  // High value, limited
            mountain: 3   // Strategic, limited
        };
        
        for (const [type, count] of Object.entries(distribution)) {
            for (let i = 0; i < count; i++) {
                deck.push(type);
            }
        }
        
        return deck;
    }
    
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    setupEventListeners() {
        // Button events
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('undoBtn').addEventListener('click', () => this.undoLastMove());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('drawTile').addEventListener('click', () => this.drawNewTile());
        document.getElementById('discardTile').addEventListener('click', () => this.discardTile());
        document.getElementById('playAgain').addEventListener('click', () => this.newGame());
        document.getElementById('shareScore').addEventListener('click', () => this.shareScore());
        document.getElementById('zoomIn').addEventListener('click', () => this.zoomBoard(1.1));
        document.getElementById('zoomOut').addEventListener('click', () => this.zoomBoard(0.9));
        
        // Drag and drop for tile placement
        document.addEventListener('dragstart', (e) => this.handleDragStart(e));
        document.addEventListener('dragover', (e) => this.handleDragOver(e));
        document.addEventListener('drop', (e) => this.handleDrop(e));
    }
    
    initializeBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'board-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', () => this.placeTile(row, col));
                cell.addEventListener('mouseenter', () => this.highlightValidPlacement(row, col));
                cell.addEventListener('mouseleave', () => this.clearHighlights());
                
                gameBoard.appendChild(cell);
            }
        }
    }
    
    drawNewTile() {
        if (this.deck.length === 0) {
            this.endGame();
            return;
        }
        
        if (this.currentTile) {
            // If there's already a current tile, this acts as discard
            this.discardTile();
            return;
        }
        
        const tileType = this.deck.pop();
        this.currentTile = tileType;
        
        const tileData = this.tileTypes[tileType];
        const preview = document.getElementById('tilePreview');
        const tileName = document.getElementById('tileName');
        const tileDescription = document.getElementById('tileDescription');
        
        preview.innerHTML = tileData.emoji;
        preview.className = 'tile-preview';
        preview.draggable = true;
        preview.dataset.tileType = tileType;
        
        tileName.textContent = tileData.name;
        tileDescription.textContent = tileData.description;
        
        document.getElementById('discardTile').disabled = false;
        document.getElementById('drawTile').textContent = this.deck.length > 0 ? 'Draw Next' : 'No more tiles';
        document.getElementById('drawTile').disabled = true; // Disable until tile is placed
        
        this.updateDisplay();
        this.showValidPlacements();
    }
    
    discardTile() {
        if (!this.currentTile || this.turnsLeft <= 0) return;
        
        this.turnsLeft--;
        this.currentTile = null;
        
        const preview = document.getElementById('tilePreview');
        preview.innerHTML = '<div class="tile-placeholder">Draw a tile!</div>';
        preview.draggable = false;
        
        document.getElementById('tileName').textContent = '-';
        document.getElementById('tileDescription').textContent = '-';
        document.getElementById('discardTile').disabled = true;
        document.getElementById('drawTile').disabled = false;
        document.getElementById('drawTile').textContent = 'Draw Tile';
        
        this.clearHighlights();
        this.updateDisplay();
        
        if (this.turnsLeft <= 0) {
            this.endGame();
        }
    }
    
    placeTile(row, col) {
        if (!this.currentTile || !this.isValidPlacement(row, col)) return;
        
        // Save state for undo
        this.gameHistory.push({
            board: this.board.map(row => [...row]),
            placedTiles: [...this.placedTiles],
            score: this.score,
            turnsLeft: this.turnsLeft,
            currentTile: this.currentTile
        });
        
        // Place the tile
        this.board[row][col] = this.currentTile;
        this.placedTiles.push({ row, col, type: this.currentTile });
        
        // Calculate and add score
        const scoreGained = this.calculateScore(row, col, this.currentTile);
        this.score += scoreGained;
        
        // Show score animation
        if (scoreGained > 0) {
            this.showScoreAnimation(row, col, scoreGained);
        }
        
        // Update visual board
        this.updateBoardCell(row, col, this.currentTile);
        
        // Clear current tile
        this.currentTile = null;
        const preview = document.getElementById('tilePreview');
        preview.innerHTML = '<div class="tile-placeholder">Draw next tile!</div>';
        preview.draggable = false;
        
        document.getElementById('tileName').textContent = '-';
        document.getElementById('tileDescription').textContent = '-';
        document.getElementById('discardTile').disabled = true;
        document.getElementById('drawTile').disabled = false;
        document.getElementById('drawTile').textContent = 'Draw Tile';
        
        this.clearHighlights();
        this.updateDisplay();
        
        // Check for game end conditions
        if (this.turnsLeft <= 0 || this.deck.length === 0) {
            setTimeout(() => this.endGame(), 500);
        }
    }
    
    isValidPlacement(row, col) {
        // Cell must be empty
        if (this.board[row][col] !== null) return false;
        
        // If board is empty, allow placement anywhere in center area
        if (this.placedTiles.length === 0) {
            return row >= 8 && row <= 12 && col >= 8 && col <= 12;
        }
        
        // Must be adjacent to existing tile or can start a new island (with gap)
        const hasAdjacentTile = this.hasAdjacentTile(row, col);
        const isNewIslandSpot = this.isValidNewIslandSpot(row, col);
        
        return hasAdjacentTile || isNewIslandSpot;
    }
    
    hasAdjacentTile(row, col) {
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        for (const [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;
            
            if (newRow >= 0 && newRow < this.boardSize && 
                newCol >= 0 && newCol < this.boardSize && 
                this.board[newRow][newCol] !== null) {
                return true;
            }
        }
        
        return false;
    }
    
    isValidNewIslandSpot(row, col) {
        // Allow new islands if there's at least 2 cells gap from existing tiles
        for (let i = 0; i < this.placedTiles.length; i++) {
            const tile = this.placedTiles[i];
            const distance = Math.abs(row - tile.row) + Math.abs(col - tile.col);
            if (distance < 3) return false;
        }
        
        return true;
    }
    
    calculateScore(row, col, tileType) {
        let score = 0;
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        // Base score for placement
        score += 1;
        
        // Check adjacent tiles for scoring bonuses
        for (const [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;
            
            if (newRow >= 0 && newRow < this.boardSize && 
                newCol >= 0 && newCol < this.boardSize && 
                this.board[newRow][newCol] !== null) {
                
                const adjacentType = this.board[newRow][newCol];
                score += this.getAdjacencyScore(tileType, adjacentType);
            }
        }
        
        // Cluster bonus - same type tiles in a group
        const clusterSize = this.getClusterSize(row, col, tileType);
        if (clusterSize >= 3) {
            score += clusterSize - 2; // Bonus for clusters of 3+
        }
        
        return score;
    }
    
    getAdjacencyScore(tile1, tile2) {
        const bonuses = {
            'water-land': 2,
            'land-water': 2,
            'forest-land': 3,
            'land-forest': 3,
            'building-land': 4,
            'land-building': 4,
            'mountain-forest': 3,
            'forest-mountain': 3,
            'mountain-land': 2,
            'land-mountain': 2
        };
        
        const key = `${tile1}-${tile2}`;
        return bonuses[key] || 1; // Base bonus for any adjacency
    }
    
    getClusterSize(row, col, tileType) {
        const visited = new Set();
        const stack = [[row, col]];
        let size = 0;
        
        while (stack.length > 0) {
            const [r, c] = stack.pop();
            const key = `${r}-${c}`;
            
            if (visited.has(key)) continue;
            if (r < 0 || r >= this.boardSize || c < 0 || c >= this.boardSize) continue;
            if (this.board[r][c] !== tileType) continue;
            
            visited.add(key);
            size++;
            
            // Add adjacent cells to check
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (const [dx, dy] of directions) {
                stack.push([r + dx, c + dy]);
            }
        }
        
        return size;
    }
    
    showScoreAnimation(row, col, score) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${score}`;
        popup.style.left = '50%';
        popup.style.top = '50%';
        
        cell.appendChild(popup);
        
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 1500);
    }
    
    updateBoardCell(row, col, tileType) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        const tileData = this.tileTypes[tileType];
        
        cell.textContent = tileData.emoji;
        cell.className = `board-cell occupied tile ${tileType}`;
        cell.style.background = tileData.color;
        cell.style.color = 'white';
        cell.style.fontWeight = 'bold';
    }
    
    showValidPlacements() {
        this.clearHighlights();
        
        if (!this.currentTile) return;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.isValidPlacement(row, col)) {
                    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    cell.classList.add('highlight');
                }
            }
        }
    }
    
    highlightValidPlacement(row, col) {
        if (!this.currentTile) return;
        
        this.clearHighlights();
        
        if (this.isValidPlacement(row, col)) {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add('highlight');
        } else {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add('invalid');
        }
    }
    
    clearHighlights() {
        const cells = document.querySelectorAll('.board-cell');
        cells.forEach(cell => {
            cell.classList.remove('highlight', 'invalid');
        });
    }
    
    showHint() {
        if (!this.currentTile) {
            this.showMessage("Draw a tile first!");
            return;
        }
        
        let bestScore = 0;
        let bestPositions = [];
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.isValidPlacement(row, col)) {
                    const score = this.calculateScore(row, col, this.currentTile);
                    if (score > bestScore) {
                        bestScore = score;
                        bestPositions = [[row, col]];
                    } else if (score === bestScore) {
                        bestPositions.push([row, col]);
                    }
                }
            }
        }
        
        this.clearHighlights();
        
        if (bestPositions.length > 0) {
            bestPositions.forEach(([row, col]) => {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                cell.style.background = 'rgba(255, 215, 0, 0.6)';
                cell.style.border = '2px solid gold';
            });
            
            this.showMessage(`Best placement(s) would score ${bestScore} points!`);
            
            setTimeout(() => {
                this.clearHighlights();
                this.showValidPlacements();
            }, 3000);
        } else {
            this.showMessage("No valid placements available!");
        }
    }
    
    showMessage(text) {
        // Create a temporary message display
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            z-index: 1001;
            font-weight: bold;
        `;
        message.textContent = text;
        document.body.appendChild(message);
        
        setTimeout(() => {
            document.body.removeChild(message);
        }, 2000);
    }
    
    undoLastMove() {
        if (this.gameHistory.length === 0) {
            this.showMessage("No moves to undo!");
            return;
        }
        
        const lastState = this.gameHistory.pop();
        
        this.board = lastState.board;
        this.placedTiles = lastState.placedTiles;
        this.score = lastState.score;
        this.turnsLeft = lastState.turnsLeft;
        this.currentTile = lastState.currentTile;
        
        // Restore the deck
        if (this.currentTile) {
            this.deck.push(this.currentTile);
        }
        
        // Rebuild the board visually
        this.rebuildBoard();
        
        // Restore tile display
        if (this.currentTile) {
            const tileData = this.tileTypes[this.currentTile];
            const preview = document.getElementById('tilePreview');
            preview.innerHTML = tileData.emoji;
            preview.draggable = true;
            
            document.getElementById('tileName').textContent = tileData.name;
            document.getElementById('tileDescription').textContent = tileData.description;
            document.getElementById('discardTile').disabled = false;
        }
        
        this.updateDisplay();
        this.showValidPlacements();
    }
    
    rebuildBoard() {
        // Clear all cells
        const cells = document.querySelectorAll('.board-cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'board-cell';
            cell.style.background = '';
            cell.style.color = '';
        });
        
        // Rebuild placed tiles
        this.placedTiles.forEach(tile => {
            this.updateBoardCell(tile.row, tile.col, tile.type);
        });
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('turnsLeft').textContent = this.turnsLeft;
        document.getElementById('islandCount').textContent = this.countIslands();
        document.getElementById('deckCount').textContent = `${this.deck.length} tiles`;
        
        // Update undo button
        document.getElementById('undoBtn').disabled = this.gameHistory.length === 0;
    }
    
    countIslands() {
        if (this.placedTiles.length === 0) return 0;
        
        const visited = new Set();
        let islandCount = 0;
        
        for (const tile of this.placedTiles) {
            const key = `${tile.row}-${tile.col}`;
            if (!visited.has(key)) {
                this.exploreIsland(tile.row, tile.col, visited);
                islandCount++;
            }
        }
        
        return islandCount;
    }
    
    exploreIsland(row, col, visited) {
        const stack = [[row, col]];
        
        while (stack.length > 0) {
            const [r, c] = stack.pop();
            const key = `${r}-${c}`;
            
            if (visited.has(key)) continue;
            if (r < 0 || r >= this.boardSize || c < 0 || c >= this.boardSize) continue;
            if (this.board[r][c] === null) continue;
            
            visited.add(key);
            
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (const [dx, dy] of directions) {
                stack.push([r + dx, c + dy]);
            }
        }
    }
    
    endGame() {
        this.isGameOver = true;
        
        const finalScore = this.score;
        const islandsBuilt = this.countIslands();
        const tilesPlaced = this.placedTiles.length;
        const avgScore = tilesPlaced > 0 ? Math.round(finalScore / tilesPlaced) : 0;
        
        document.getElementById('finalScore').textContent = finalScore;
        document.getElementById('finalIslands').textContent = islandsBuilt;
        document.getElementById('finalTiles').textContent = tilesPlaced;
        document.getElementById('avgScore').textContent = avgScore;
        
        // Score rating
        let rating, emoji;
        if (finalScore >= 200) {
            rating = "Master Builder!";
            emoji = "🏆";
        } else if (finalScore >= 150) {
            rating = "Skilled Architect!";
            emoji = "⭐";
        } else if (finalScore >= 100) {
            rating = "Great Builder!";
            emoji = "🌟";
        } else if (finalScore >= 50) {
            rating = "Good Effort!";
            emoji = "👍";
        } else {
            rating = "Keep Practicing!";
            emoji = "🌱";
        }
        
        document.getElementById('scoreRating').innerHTML = `
            <span class="rating-emoji">${emoji}</span>
            <span class="rating-text">${rating}</span>
        `;
        
        document.getElementById('gameOverModal').classList.remove('hidden');
    }
    
    newGame() {
        this.score = 0;
        this.turnsLeft = this.maxTurns;
        this.currentTile = null;
        this.placedTiles = [];
        this.gameHistory = [];
        this.isGameOver = false;
        
        this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(null));
        this.deck = this.createDeck();
        this.shuffleDeck();
        
        this.initializeBoard();
        this.updateDisplay();
        
        document.getElementById('gameOverModal').classList.add('hidden');
        document.getElementById('discardTile').disabled = true;
        document.getElementById('drawTile').disabled = false;
        document.getElementById('drawTile').textContent = 'Draw Tile';
        
        const preview = document.getElementById('tilePreview');
        preview.innerHTML = '<div class="tile-placeholder">Draw a tile to start!</div>';
        preview.draggable = false;
        
        document.getElementById('tileName').textContent = '-';
        document.getElementById('tileDescription').textContent = '-';
    }
    
    shareScore() {
        const text = `I just scored ${this.score} points in Island Builder! 🏝️ Built ${this.countIslands()} islands with ${this.placedTiles.length} tiles. Can you beat my score?`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Island Builder Score',
                text: text,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(text).then(() => {
                this.showMessage('Score copied to clipboard!');
            });
        }
    }
    
    zoomBoard(factor) {
        const board = document.getElementById('gameBoard');
        const currentTransform = board.style.transform || 'scale(1)';
        const currentScale = parseFloat(currentTransform.match(/scale\(([\d.]+)\)/)?.[1] || '1');
        const newScale = Math.max(0.5, Math.min(2, currentScale * factor));
        
        board.style.transform = `scale(${newScale})`;
        board.style.transformOrigin = 'center';
    }
    
    // Drag and drop functionality
    handleDragStart(e) {
        if (e.target.classList.contains('tile-preview') && this.currentTile) {
            e.dataTransfer.setData('text/plain', this.currentTile);
            e.target.classList.add('dragging');
        }
    }
    
    handleDragOver(e) {
        if (e.target.classList.contains('board-cell')) {
            e.preventDefault();
            const row = parseInt(e.target.dataset.row);
            const col = parseInt(e.target.dataset.col);
            this.highlightValidPlacement(row, col);
        }
    }
    
    handleDrop(e) {
        e.preventDefault();
        
        if (e.target.classList.contains('board-cell')) {
            const row = parseInt(e.target.dataset.row);
            const col = parseInt(e.target.dataset.col);
            this.placeTile(row, col);
        }
        
        const preview = document.getElementById('tilePreview');
        preview.classList.remove('dragging');
        this.clearHighlights();
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new IslandBuilder();
});