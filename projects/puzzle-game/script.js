document.addEventListener('DOMContentLoaded', function() {
    // Game Elements
    const puzzleBoard = document.getElementById('puzzleBoard');
    const originalImage = document.getElementById('originalImage');
    const timerElement = document.getElementById('timer');
    const movesElement = document.getElementById('moves');
    const completedElement = document.getElementById('completed');
    
    // Buttons
    const shuffleBtn = document.getElementById('shuffleBtn');
    const resetBtn = document.getElementById('resetBtn');
    const hintBtn = document.getElementById('hintBtn');
    const togglePreviewBtn = document.getElementById('togglePreview');
    const changeImageBtn = document.getElementById('changeImage');
    
    // Modals
    const imageModal = document.getElementById('imageModal');
    const completionModal = document.getElementById('completionModal');
    const closeModalBtn = document.getElementById('closeModal');
    const confirmImageBtn = document.getElementById('confirmImage');
    const playAgainBtn = document.getElementById('playAgain');
    const shareResultBtn = document.getElementById('shareResult');
    
    // Image selection
    const imageOptions = document.querySelectorAll('.image-option');
    const imageUpload = document.getElementById('imageUpload');
    const uploadArea = document.getElementById('uploadArea');
    const uploadPreview = document.getElementById('uploadPreview');
    
    // Difficulty buttons
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    
    // Game state
    let gameState = {
        difficulty: 4, // 3x3, 4x4, 5x5, 6x6
        pieces: [],
        emptyIndex: null,
        moves: 0,
        time: 0,
        timer: null,
        isPlaying: false,
        currentImage: null,
        isPreviewVisible: false,
        pieceSize: 0,
        correctPositions: []
    };
    
    // Available images (Unsplash URLs)
    const imageLibrary = {
        landscape: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        city: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000',
        nature: 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5',
        animal: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e'
    };
    
    // Initialize game
    initGame();
    
    // Event Listeners
    shuffleBtn.addEventListener('click', shufflePuzzle);
    resetBtn.addEventListener('click', resetGame);
    hintBtn.addEventListener('click', showHint);
    togglePreviewBtn.addEventListener('click', togglePreview);
    changeImageBtn.addEventListener('click', openImageModal);
    closeModalBtn.addEventListener('click', closeImageModal);
    confirmImageBtn.addEventListener('click', confirmImageSelection);
    playAgainBtn.addEventListener('click', playAgain);
    shareResultBtn.addEventListener('click', shareResult);
    
    // Image selection events
    imageOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            imageOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            this.classList.add('selected');
        });
    });
    
    // Image upload handling
    uploadArea.addEventListener('click', () => imageUpload.click());
    imageUpload.addEventListener('change', handleImageUpload);
    
    // Difficulty selection
    difficultyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const level = parseInt(this.dataset.level);
            setDifficulty(level);
            
            // Update active button
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === imageModal) {
            closeImageModal();
        }
        if (event.target === completionModal) {
            completionModal.style.display = 'none';
        }
    });
    
    // Functions
    function initGame() {
        // Load default image
        gameState.currentImage = imageLibrary.landscape;
        
        // Setup puzzle
        setupPuzzle();
        
        // Start with shuffled pieces
        shufflePuzzle();
        
        // Start timer
        startTimer();
        
        // Update UI
        updateStats();
    }
    
    function setupPuzzle() {
        // Clear puzzle board
        puzzleBoard.innerHTML = '';
        
        // Set grid based on difficulty
        const gridSize = gameState.difficulty;
        puzzleBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        
        // Calculate piece size
        const boardWidth = puzzleBoard.clientWidth;
        gameState.pieceSize = boardWidth / gridSize;
        
        // Create pieces array
        gameState.pieces = [];
        const totalPieces = gridSize * gridSize;
        gameState.emptyIndex = totalPieces - 1; // Last piece is empty
        
        // Clear correct positions
        gameState.correctPositions = [];
        
        for (let i = 0; i < totalPieces; i++) {
            gameState.pieces.push(i);
            gameState.correctPositions.push(i);
            
            // Create puzzle piece element
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.dataset.index = i;
            piece.dataset.correctPosition = i;
            
            // Set background image for piece
            if (i !== gameState.emptyIndex) {
                const row = Math.floor(i / gridSize);
                const col = i % gridSize;
                
                piece.style.backgroundImage = `url('${gameState.currentImage}')`;
                piece.style.backgroundPosition = `${(col / (gridSize - 1)) * 100}% ${(row / (gridSize - 1)) * 100}%`;
                piece.style.backgroundSize = `${gridSize * 100}% ${gridSize * 100}%`;
                
                // Add piece number
                const number = document.createElement('div');
                number.className = 'piece-number';
                number.textContent = i + 1;
                piece.appendChild(number);
                
                // Make piece draggable
                piece.setAttribute('draggable', 'true');
                piece.addEventListener('dragstart', handleDragStart);
                piece.addEventListener('dragover', handleDragOver);
                piece.addEventListener('drop', handleDrop);
                piece.addEventListener('dragend', handleDragEnd);
                
                // Add click event for mobile/touch
                piece.addEventListener('click', handlePieceClick);
            } else {
                piece.classList.add('empty');
                piece.innerHTML = '<i class="fas fa-th-large"></i>';
            }
            
            puzzleBoard.appendChild(piece);
            gameState.pieces[i] = piece;
        }
        
        // Set original image preview
        originalImage.innerHTML = '';
        const img = document.createElement('img');
        img.src = gameState.currentImage;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        originalImage.appendChild(img);
        
        // Hide preview initially
        originalImage.style.display = 'none';
        togglePreviewBtn.innerHTML = '<i class="fas fa-eye"></i> Show Preview';
        gameState.isPreviewVisible = false;
    }
    
    function shufflePuzzle() {
        const totalPieces = gameState.difficulty * gameState.difficulty;
        const indices = Array.from({ length: totalPieces - 1 }, (_, i) => i);
        
        // Fisher-Yates shuffle algorithm
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        
        // Add empty piece at the end
        indices.push(totalPieces - 1);
        
        // Update puzzle board
        updatePuzzleBoard(indices);
        
        // Reset moves
        gameState.moves = 0;
        updateStats();
    }
    
    function updatePuzzleBoard(indices) {
        // Clear puzzle board
        puzzleBoard.innerHTML = '';
        
        // Update pieces array
        const gridSize = gameState.difficulty;
        
        indices.forEach((pieceIndex, boardIndex) => {
            const piece = gameState.pieces[pieceIndex].cloneNode(true);
            
            // Update dataset
            piece.dataset.index = pieceIndex;
            piece.dataset.boardIndex = boardIndex;
            
            // Check if piece is in correct position
            if (pieceIndex === boardIndex) {
                piece.classList.add('correct');
            } else {
                piece.classList.remove('correct');
            }
            
            // Reattach event listeners
            if (!piece.classList.contains('empty')) {
                piece.setAttribute('draggable', 'true');
                piece.addEventListener('dragstart', handleDragStart);
                piece.addEventListener('dragover', handleDragOver);
                piece.addEventListener('drop', handleDrop);
                piece.addEventListener('dragend', handleDragEnd);
                piece.addEventListener('click', handlePieceClick);
            }
            
            puzzleBoard.appendChild(piece);
        });
        
        // Update empty index
        gameState.emptyIndex = indices.indexOf(gameState.difficulty * gameState.difficulty - 1);
        
        // Check if puzzle is solved
        checkPuzzleCompletion();
    }
    
    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', this.dataset.index);
        this.classList.add('dragging');
        
        // For mobile
        e.dataTransfer.effectAllowed = 'move';
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    
    function handleDrop(e) {
        e.preventDefault();
        const draggedIndex = e.dataTransfer.getData('text/plain');
        const targetIndex = this.dataset.boardIndex;
        
        // Check if move is valid (adjacent to empty space)
        if (isValidMove(draggedIndex, targetIndex)) {
            movePiece(draggedIndex, targetIndex);
        }
    }
    
    function handleDragEnd(e) {
        this.classList.remove('dragging');
    }
    
    function handlePieceClick(e) {
        const clickedIndex = parseInt(this.dataset.boardIndex);
        const emptyIndex = gameState.emptyIndex;
        
        // Check if clicked piece is adjacent to empty space
        if (isAdjacent(clickedIndex, emptyIndex)) {
            const pieceIndex = this.dataset.index;
            movePiece(pieceIndex, clickedIndex);
        }
    }
    
    function isValidMove(pieceIndex, targetIndex) {
        const emptyIndex = gameState.emptyIndex;
        return isAdjacent(targetIndex, emptyIndex);
    }
    
    function isAdjacent(index1, index2) {
        const gridSize = gameState.difficulty;
        const row1 = Math.floor(index1 / gridSize);
        const col1 = index1 % gridSize;
        const row2 = Math.floor(index2 / gridSize);
        const col2 = index2 % gridSize;
        
        // Check if positions are adjacent (up, down, left, right)
        return (Math.abs(row1 - row2) === 1 && col1 === col2) || 
               (Math.abs(col1 - col2) === 1 && row1 === row2);
    }
    
    function movePiece(pieceIndex, fromIndex) {
        const toIndex = gameState.emptyIndex;
        
        // Swap positions in the board
        const boardPieces = Array.from(puzzleBoard.children);
        const temp = boardPieces[fromIndex];
        boardPieces[fromIndex] = boardPieces[toIndex];
        boardPieces[toIndex] = temp;
        
        // Update board indices
        boardPieces.forEach((piece, index) => {
            if (piece.dataset) {
                piece.dataset.boardIndex = index;
                
                // Check if piece is in correct position
                if (parseInt(piece.dataset.index) === index) {
                    piece.classList.add('correct');
                } else {
                    piece.classList.remove('correct');
                }
            }
        });
        
        // Clear and rebuild board
        puzzleBoard.innerHTML = '';
        boardPieces.forEach(piece => puzzleBoard.appendChild(piece));
        
        // Update empty index
        gameState.emptyIndex = fromIndex;
        
        // Update moves
        gameState.moves++;
        updateStats();
        
        // Check if puzzle is solved
        checkPuzzleCompletion();
    }
    
    function checkPuzzleCompletion() {
        const boardPieces = Array.from(puzzleBoard.children);
        let correctCount = 0;
        
        boardPieces.forEach((piece, index) => {
            if (piece.dataset && parseInt(piece.dataset.index) === index) {
                correctCount++;
            }
        });
        
        const totalPieces = gameState.difficulty * gameState.difficulty;
        const percentage = Math.round((correctCount / totalPieces) * 100);
        completedElement.textContent = `${percentage}%`;
        
        // Check if puzzle is complete
        if (correctCount === totalPieces) {
            completePuzzle();
        }
    }
    
    function completePuzzle() {
        // Stop timer
        clearInterval(gameState.timer);
        gameState.isPlaying = false;
        
        // Update completion modal
        document.getElementById('finalTime').textContent = timerElement.textContent;
        document.getElementById('finalMoves').textContent = gameState.moves;
        document.getElementById('finalDifficulty').textContent = 
            getDifficultyName(gameState.difficulty);
        
        // Show completion modal after a short delay
        setTimeout(() => {
            completionModal.style.display = 'flex';
        }, 1000);
    }
    
    function startTimer() {
        if (gameState.timer) {
            clearInterval(gameState.timer);
        }
        
        gameState.time = 0;
        gameState.timer = setInterval(() => {
            gameState.time++;
            updateTimer();
        }, 1000);
        
        gameState.isPlaying = true;
    }
    
    function updateTimer() {
        const minutes = Math.floor(gameState.time / 60).toString().padStart(2, '0');
        const seconds = (gameState.time % 60).toString().padStart(2, '0');
        timerElement.textContent = `${minutes}:${seconds}`;
    }
    
    function updateStats() {
        movesElement.textContent = gameState.moves;
    }
    
    function resetGame() {
        // Reset moves and timer
        gameState.moves = 0;
        gameState.time = 0;
        
        // Reset puzzle to correct positions
        const correctIndices = Array.from({ length: gameState.difficulty * gameState.difficulty }, (_, i) => i);
        updatePuzzleBoard(correctIndices);
        
        // Restart timer
        startTimer();
        updateStats();
    }
    
    function showHint() {
        // Highlight pieces that are in correct position
        const pieces = document.querySelectorAll('.puzzle-piece:not(.empty)');
        
        pieces.forEach(piece => {
            const index = parseInt(piece.dataset.boardIndex);
            const correctIndex = parseInt(piece.dataset.index);
            
            if (index === correctIndex) {
                // Pulse animation for correct pieces
                piece.style.animation = 'pulseHint 1s ease';
                
                // Remove animation after it completes
                setTimeout(() => {
                    piece.style.animation = '';
                }, 1000);
            }
        });
        
        // Add CSS for pulse animation
        if (!document.querySelector('#hint-animation')) {
            const style = document.createElement('style');
            style.id = 'hint-animation';
            style.textContent = `
                @keyframes pulseHint {
                    0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.7); }
                    70% { box-shadow: 0 0 0 15px rgba(46, 204, 113, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    function togglePreview() {
        gameState.isPreviewVisible = !gameState.isPreviewVisible;
        
        if (gameState.isPreviewVisible) {
            originalImage.style.display = 'block';
            togglePreviewBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Preview';
        } else {
            originalImage.style.display = 'none';
            togglePreviewBtn.innerHTML = '<i class="fas fa-eye"></i> Show Preview';
        }
    }
    
    function openImageModal() {
        imageModal.style.display = 'flex';
    }
    
    function closeImageModal() {
        imageModal.style.display = 'none';
    }
    
    function confirmImageSelection() {
        const selectedOption = document.querySelector('.image-option.selected');
        const selectedImage = selectedOption.dataset.image;
        
        // Update current image
        gameState.currentImage = imageLibrary[selectedImage];
        
        // Reset game with new image
        resetGame();
        setupPuzzle();
        shufflePuzzle();
        
        // Close modal
        closeImageModal();
    }
    
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            alert('Please select an image file.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            // Show preview
            uploadPreview.innerHTML = `<img src="${event.target.result}" alt="Uploaded Image">`;
            uploadPreview.style.display = 'block';
            
            // Update selected image
            gameState.currentImage = event.target.result;
            
            // Reset game with new image
            resetGame();
            setupPuzzle();
            shufflePuzzle();
            
            // Close modal
            closeImageModal();
        };
        
        reader.readAsDataURL(file);
    }
    
    function setDifficulty(level) {
        gameState.difficulty = level;
        resetGame();
        setupPuzzle();
        shufflePuzzle();
    }
    
    function getDifficultyName(level) {
        const names = {
            3: 'Easy',
            4: 'Medium',
            5: 'Hard',
            6: 'Expert'
        };
        return names[level] || 'Medium';
    }
    
    function playAgain() {
        completionModal.style.display = 'none';
        resetGame();
        shufflePuzzle();
    }
    
    function shareResult() {
        const time = timerElement.textContent;
        const moves = gameState.moves;
        const difficulty = getDifficultyName(gameState.difficulty);
        
        const text = `I solved a ${gameState.difficulty}x${gameState.difficulty} puzzle in ${time} with ${moves} moves! Try it yourself:`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Puzzle Game Result',
                text: text,
                url: window.location.href
            });
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(text).then(() => {
                alert('Result copied to clipboard! Share it with your friends.');
            });
        }
    }
});