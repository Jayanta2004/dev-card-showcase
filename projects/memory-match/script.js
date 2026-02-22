    (function() {
        // ---------- MEMORY MATCH GAME ----------
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const pairsLeft = document.getElementById('pairsLeft');
        const progressFill = document.getElementById('progressFill');
        const matchedCount = document.getElementById('matchedCount');
        const movesDisplay = document.getElementById('movesDisplay');
        const bestScore = document.getElementById('bestScore');
        const messageDisplay = document.getElementById('messageDisplay');
        const newGameBtn = document.getElementById('newGameBtn');
        const resetBtn = document.getElementById('resetBtn');
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');

        // Game constants
        const CARD_COLORS = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
            '#ffeaa7', '#dfe6e9', '#fdcb6e', '#e17055',
            '#6c5ce7', '#00b894', '#fd79a8', '#74b9ff',
            '#f9ca24', '#f0932b', '#badc58', '#22a6b3'
        ];

        // Game state
        let grid = [];
        let rows = 4;
        let cols = 4;
        let cardSize = 140; // 600/4 ≈ 150, minus padding
        let cardPadding = 10;
        
        let cards = [];
        let flippedCards = [];
        let matchedPairs = 0;
        let totalPairs = 0;
        let moves = 0;
        let canFlip = true;
        let gameComplete = false;
        
        // Best score storage
        let bestScores = {
            easy: localStorage.getItem('memoryBestEasy') || Infinity,
            medium: localStorage.getItem('memoryBestMedium') || Infinity,
            hard: localStorage.getItem('memoryBestHard') || Infinity
        };

        // Update best score display
        function updateBestScore() {
            const diff = getCurrentDifficulty();
            const score = bestScores[diff];
            bestScore.textContent = score === Infinity ? '—' : score;
        }

        // Get current difficulty
        function getCurrentDifficulty() {
            if (rows === 4 && cols === 4) return 'easy';
            if (rows === 4 && cols === 6) return 'medium';
            return 'hard';
        }

        // Initialize game
        function initGame() {
            // Calculate card size based on grid
            cardSize = (canvas.width / Math.max(rows, cols)) - cardPadding;
            
            // Create pairs
            totalPairs = (rows * cols) / 2;
            let values = [];
            
            // Generate pairs
            for (let i = 0; i < totalPairs; i++) {
                values.push(i, i); // Two of each
            }
            
            // Shuffle
            for (let i = values.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [values[i], values[j]] = [values[j], values[i]];
            }
            
            // Create cards
            cards = [];
            let index = 0;
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    cards.push({
                        row,
                        col,
                        value: values[index],
                        flipped: false,
                        matched: false,
                        color: CARD_COLORS[values[index] % CARD_COLORS.length]
                    });
                    index++;
                }
            }
            
            // Reset game state
            flippedCards = [];
            matchedPairs = 0;
            moves = 0;
            canFlip = true;
            gameComplete = false;
            
            // Update UI
            updateStats();
            updateBestScore();
            messageDisplay.textContent = 'Find matching pairs!';
            
            // Draw
            draw();
        }

        // Update statistics
        function updateStats() {
            const remaining = totalPairs - matchedPairs;
            pairsLeft.textContent = remaining;
            matchedCount.textContent = `${matchedPairs}/${totalPairs}`;
            
            const progress = (matchedPairs / totalPairs) * 100;
            progressFill.style.width = progress + '%';
            
            movesDisplay.textContent = moves;
        }

        // Check if game is complete
        function checkGameComplete() {
            if (matchedPairs === totalPairs) {
                gameComplete = true;
                messageDisplay.textContent = '🎉 CONGRATULATIONS! You won!';
                
                // Update best score
                const diff = getCurrentDifficulty();
                if (moves < bestScores[diff]) {
                    bestScores[diff] = moves;
                    localStorage.setItem(`memoryBest${diff.charAt(0).toUpperCase() + diff.slice(1)}`, moves);
                    updateBestScore();
                    messageDisplay.textContent = '🎉 NEW RECORD! Congratulations!';
                }
            }
        }

        // Handle card click
        function handleCardClick(row, col) {
            if (!canFlip || gameComplete) return;
            
            // Find card
            const cardIndex = cards.findIndex(c => c.row === row && c.col === col);
            const card = cards[cardIndex];
            
            // Check if card can be flipped
            if (card.flipped || card.matched) return;
            if (flippedCards.length === 2) return;
            
            // Flip card
            card.flipped = true;
            flippedCards.push(card);
            
            // Check for match if we have 2 cards
            if (flippedCards.length === 2) {
                moves++;
                canFlip = false;
                
                const [card1, card2] = flippedCards;
                
                if (card1.value === card2.value) {
                    // Match found
                    setTimeout(() => {
                        card1.matched = true;
                        card2.matched = true;
                        matchedPairs++;
                        
                        flippedCards = [];
                        canFlip = true;
                        
                        updateStats();
                        checkGameComplete();
                        draw();
                        
                        messageDisplay.textContent = '✅ Match found!';
                    }, 500);
                } else {
                    // No match
                    setTimeout(() => {
                        card1.flipped = false;
                        card2.flipped = false;
                        flippedCards = [];
                        canFlip = true;
                        
                        draw();
                        
                        messageDisplay.textContent = '❌ Not a match, try again';
                    }, 800);
                }
            }
            
            updateStats();
            draw();
        }

        // Draw the game
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw cards
            cards.forEach(card => {
                const x = card.col * (cardSize + cardPadding) + cardPadding;
                const y = card.row * (cardSize + cardPadding) + cardPadding;
                
                // Card shadow
                ctx.shadowColor = '#00000080';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetY = 4;
                
                if (card.matched) {
                    // Matched card (glowing effect)
                    ctx.shadowColor = '#ffd966';
                    ctx.shadowBlur = 20;
                    
                    ctx.fillStyle = card.color;
                    ctx.beginPath();
                    ctx.roundRect(x, y, cardSize, cardSize, 15);
                    ctx.fill();
                    
                    // Checkmark
                    ctx.shadowBlur = 0;
                    ctx.font = `bold ${cardSize * 0.6}px 'Segoe UI'`;
                    ctx.fillStyle = '#ffffff';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('✓', x + cardSize/2, y + cardSize/2);
                    
                } else if (card.flipped) {
                    // Flipped card (showing color)
                    ctx.fillStyle = card.color;
                    ctx.beginPath();
                    ctx.roundRect(x, y, cardSize, cardSize, 15);
                    ctx.fill();
                    
                    // Pattern
                    ctx.fillStyle = '#ffffff60';
                    ctx.font = `bold ${cardSize * 0.4}px 'Segoe UI'`;
                    ctx.fillText('?', x + cardSize/2, y + cardSize/2);
                    
                } else {
                    // Face down card
                    // Gradient background
                    const gradient = ctx.createLinearGradient(x, y, x + cardSize, y + cardSize);
                    gradient.addColorStop(0, '#8f6bb3');
                    gradient.addColorStop(1, '#6d4c7d');
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.roundRect(x, y, cardSize, cardSize, 15);
                    ctx.fill();
                    
                    // Pattern
                    ctx.strokeStyle = '#e6d9ff40';
                    ctx.lineWidth = 2;
                    for (let i = 0; i < 3; i++) {
                        ctx.beginPath();
                        ctx.moveTo(x + 10, y + 10 + i * 20);
                        ctx.lineTo(x + cardSize - 10, y + 10 + i * 20);
                        ctx.stroke();
                    }
                }
                
                // Card border
                ctx.shadowBlur = 0;
                ctx.strokeStyle = '#e6d9ff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(x, y, cardSize, cardSize, 15);
                ctx.stroke();
            });

            // Game complete overlay
            if (gameComplete) {
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#000000b0';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = '#ffd966';
                ctx.font = 'bold 40px Segoe UI';
                ctx.textAlign = 'center';
                ctx.fillText('YOU WIN!', canvas.width/2, canvas.height/2 - 30);
                
                ctx.font = '24px Segoe UI';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(`Moves: ${moves}`, canvas.width/2, canvas.height/2 + 20);
            }
        }

        // Helper for rounded rect
        CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
            if (w < 2 * r) r = w / 2;
            if (h < 2 * r) r = h / 2;
            this.moveTo(x + r, y);
            this.lineTo(x + w - r, y);
            this.quadraticCurveTo(x + w, y, x + w, y + r);
            this.lineTo(x + w, y + h - r);
            this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            this.lineTo(x + r, y + h);
            this.quadraticCurveTo(x, y + h, x, y + h - r);
            this.lineTo(x, y + r);
            this.quadraticCurveTo(x, y, x + r, y);
            return this;
        };

        // Event listeners
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            
            // Calculate which card was clicked
            const col = Math.floor(x / (cardSize + cardPadding));
            const row = Math.floor(y / (cardSize + cardPadding));
            
            if (row >= 0 && row < rows && col >= 0 && col < cols) {
                handleCardClick(row, col);
            }
        });

        newGameBtn.addEventListener('click', () => {
            initGame();
        });

        resetBtn.addEventListener('click', () => {
            // Reset current game
            cards.forEach(card => {
                card.flipped = false;
                card.matched = false;
            });
            flippedCards = [];
            matchedPairs = 0;
            moves = 0;
            canFlip = true;
            gameComplete = false;
            
            updateStats();
            messageDisplay.textContent = 'Game reset';
            draw();
        });

        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                
                const diff = btn.dataset.diff;
                switch(diff) {
                    case 'easy':
                        rows = 4;
                        cols = 4;
                        break;
                    case 'medium':
                        rows = 4;
                        cols = 6;
                        break;
                    case 'hard':
                        rows = 6;
                        cols = 6;
                        break;
                }
                
                initGame();
            });
        });

        // Initialize game
        initGame();
    })();