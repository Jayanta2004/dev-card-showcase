document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const boardContainer = document.getElementById('chessboard');
    const sizeSlider = document.getElementById('boardSize');
    const sizeValue = document.getElementById('sizeValue');
    const statusText = document.getElementById('statusText');
    const resetBtn = document.getElementById('resetBtn');

    // Tabs & Mode Controls
    const tabVisualizer = document.getElementById('tabVisualizer');
    const tabPuzzle = document.getElementById('tabPuzzle');
    const visualizerControls = document.getElementById('visualizerControls');
    const puzzleControls = document.getElementById('puzzleControls');

    // Visualizer Elements
    const speedSlider = document.getElementById('speedControl');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const solutionCountEl = document.getElementById('solutionCount');
    const operationCountEl = document.getElementById('operationCount');

    // Puzzle Elements
    const targetCountEl = document.getElementById('targetCount');
    const placedCountEl = document.getElementById('placedCount');
    const submitBtn = document.getElementById('submitBtn');
    const hintBtn = document.getElementById('hintBtn');
    const undoBtn = document.getElementById('undoBtn'); 

    // Modal Elements
    const infoBtn = document.getElementById('infoBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const gotItBtn = document.getElementById('gotItBtn');
    const infoModal = document.getElementById('infoModal');

    // State Variables 
    let N = parseInt(sizeSlider.value);
    let speed = parseInt(speedSlider.value);
    let currentMode = 'visualizer'; 
    let grid = [];
    
    // Visualizer State
    let isRunning = false;
    let isPaused = false;
    let operations = 0;
    let solutions = 0;

    // Puzzle State
    let queensPlaced = 0;
    let moveHistory = []; 

    
    function initApp() {
        setupTabs();
        setupEventListeners();
        setupModal();
        initBoard();
    }

    function setupModal() {
        const openModal = () => infoModal.classList.remove('hidden');
        const closeModal = () => infoModal.classList.add('hidden');

        infoBtn.addEventListener('click', openModal);
        closeModalBtn.addEventListener('click', closeModal);
        gotItBtn.addEventListener('click', closeModal);
        
        infoModal.addEventListener('click', (e) => {
            if (e.target === infoModal) closeModal();
        });
    }

    function setupTabs() {
        tabVisualizer.addEventListener('click', () => switchMode('visualizer'));
        tabPuzzle.addEventListener('click', () => switchMode('puzzle'));
    }

    function switchMode(mode) {
        currentMode = mode;
        resetVisualization();
        
        if (mode === 'visualizer') {
            tabVisualizer.classList.add('active');
            tabPuzzle.classList.remove('active');
            visualizerControls.classList.remove('hidden');
            puzzleControls.classList.add('hidden');
            boardContainer.classList.remove('interactive');
            statusText.innerHTML = "Visualizer Mode: Ready.";
        } else {
            tabPuzzle.classList.add('active');
            tabVisualizer.classList.remove('active');
            puzzleControls.classList.remove('hidden');
            visualizerControls.classList.add('hidden');
            boardContainer.classList.add('interactive');
            statusText.innerHTML = "Puzzle Mode: Place your queens!";
        }
    }

    function initBoard() {
        boardContainer.innerHTML = '';
        boardContainer.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
        grid = Array(N).fill().map(() => Array(N).fill(0));
        
        // Reset Puzzle State
        queensPlaced = 0;
        moveHistory = [];
        undoBtn.disabled = true;
        targetCountEl.innerText = N;
        updatePuzzleStats();
        
        for (let row = 0; row < N; row++) {
            for (let col = 0; col < N; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                cell.id = `cell-${row}-${col}`;
                
                cell.addEventListener('click', () => handleCellClick(row, col));
                boardContainer.appendChild(cell);
            }
        }
        
        operations = 0;
        solutions = 0;
        updateVisualizerStats();
        statusText.className = 'status-indicator';
    }

    // --- UI Helpers ---
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    function updateVisualizerStats() {
        solutionCountEl.innerText = solutions;
        operationCountEl.innerText = operations;
    }

    function updatePuzzleStats() {
        placedCountEl.innerText = queensPlaced;
        undoBtn.disabled = moveHistory.length === 0;
    }

    function placeQueen(row, col) {
        const cell = document.getElementById(`cell-${row}-${col}`);
        cell.innerHTML = '<i class="fas fa-chess-queen queen"></i>';
        grid[row][col] = 1;
    }

    function removeQueen(row, col) {
        const cell = document.getElementById(`cell-${row}-${col}`);
        cell.innerHTML = '';
        grid[row][col] = 0;
    }

    function highlightCell(row, col, status) {
        const cell = document.getElementById(`cell-${row}-${col}`);
        cell.classList.remove('safe', 'danger');
        if (status) cell.classList.add(status);
    }

    function clearAllHighlights() {
        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                highlightCell(r, c, null);
            }
        }
    }

    // --- PUZZLE MODE LOGIC ---
    function handleCellClick(row, col) {
        if (currentMode !== 'puzzle') return;
        
        clearAllHighlights();
        statusText.className = 'status-indicator';
        statusText.innerHTML = "Keep going...";

        if (grid[row][col] === 1) {
            removeQueen(row, col);
            queensPlaced--;
            moveHistory.push({ action: 'remove', r: row, c: col });
        } else {
            if (queensPlaced >= N) {
                statusText.innerHTML = `<span class="text-error"><i class="fas fa-exclamation-triangle"></i> You can only place ${N} Queens!</span>`;
                return;
            }
            placeQueen(row, col);
            queensPlaced++;
            moveHistory.push({ action: 'place', r: row, c: col });
        }
        updatePuzzleStats();
    }

    function undoMove() {
        if (moveHistory.length === 0) return;
        
        clearAllHighlights();
        const lastMove = moveHistory.pop();
        
        if (lastMove.action === 'place') {
            removeQueen(lastMove.r, lastMove.c);
            queensPlaced--;
        } else if (lastMove.action === 'remove') {
            placeQueen(lastMove.r, lastMove.c);
            queensPlaced++;
        }
        
        updatePuzzleStats();
        statusText.className = 'status-indicator';
        statusText.innerHTML = "Move undone.";
    }

    function checkUserSolution() {
        clearAllHighlights();
        if (queensPlaced !== N) {
            statusText.innerHTML = `<span class="text-error"><i class="fas fa-times-circle"></i> Place exactly ${N} Queens first!</span>`;
            return;
        }

        let queens = [];
        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                if (grid[r][c] === 1) queens.push({r, c});
            }
        }

        for (let i = 0; i < queens.length; i++) {
            for (let j = i + 1; j < queens.length; j++) {
                let q1 = queens[i];
                let q2 = queens[j];

                if (q1.r === q2.r || q1.c === q2.c || Math.abs(q1.r - q2.r) === Math.abs(q1.c - q2.c)) {
                    statusText.innerHTML = `<span class="text-error"><i class="fas fa-times-circle"></i> Incorrect! Queens are attacking each other.</span>`;
                    
                    highlightCell(q1.r, q1.c, 'danger');
                    highlightCell(q2.r, q2.c, 'danger');
                    return;
                }
            }
        }
        statusText.innerHTML = `<span class="text-success"><i class="fas fa-check-circle"></i> Brilliant! You solved it!</span>`;
    }

    function showOptimalSolution() {
        initBoard(); 
        statusText.innerHTML = "Generating solution...";
        
        let tempGrid = Array(N).fill().map(() => Array(N).fill(0));
        
        function solveInstantly(col) {
            if (col >= N) return true;
            for (let i = 0; i < N; i++) {
                if (isSafeInstant(tempGrid, i, col)) {
                    tempGrid[i][col] = 1;
                    if (solveInstantly(col + 1)) return true;
                    tempGrid[i][col] = 0;
                }
            }
            return false;
        }

        function isSafeInstant(board, row, col) {
            for (let i = 0; i < col; i++) if (board[row][i] === 1) return false;
            for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) if (board[i][j] === 1) return false;
            for (let i = row, j = col; j >= 0 && i < N; i++, j--) if (board[i][j] === 1) return false;
            return true;
        }

        if (solveInstantly(0)) {
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    if (tempGrid[r][c] === 1) {
                        placeQueen(r, c);
                        queensPlaced++;
                    }
                }
            }
            updatePuzzleStats();
            
            moveHistory = [];
            undoBtn.disabled = true;
            statusText.innerHTML = `<span class="text-success"><i class="fas fa-lightbulb"></i> Here is a valid optimal solution!</span>`;
        } else {
            statusText.innerHTML = `<span class="text-error">No solution exists for N=${N}.</span>`;
        }
    }

    // --- VISUALIZER MODE LOGIC ---
    async function isSafeVisualizer(row, col) {
        for (let i = 0; i < col; i++) {
            operations++;
            highlightCell(row, i, 'danger');
            await checkPause();
            await sleep(speed / 4);
            highlightCell(row, i, null);
            if (grid[row][i] === 1) return false;
        }

        for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
            operations++;
            highlightCell(i, j, 'danger');
            await checkPause();
            await sleep(speed / 4);
            highlightCell(i, j, null);
            if (grid[i][j] === 1) return false;
        }

        for (let i = row, j = col; j >= 0 && i < N; i++, j--) {
            operations++;
            highlightCell(i, j, 'danger');
            await checkPause();
            await sleep(speed / 4);
            highlightCell(i, j, null);
            if (grid[i][j] === 1) return false;
        }
        
        updateVisualizerStats();
        return true;
    }

    async function solveNQVisualizer(col) {
        if (!isRunning) return false;
        
        if (col >= N) {
            solutions++;
            updateVisualizerStats();
            statusText.innerHTML = `<span class="text-success">Solution ${solutions} found!</span>`;
            await sleep(speed * 2); 
            return false; 
        }

        for (let i = 0; i < N; i++) {
            if (!isRunning) return false;
            await checkPause();

            highlightCell(i, col, 'safe');
            await sleep(speed / 2);
            
            if (await isSafeVisualizer(i, col)) {
                placeQueen(i, col);
                await sleep(speed);

                await solveNQVisualizer(col + 1);
                
                if (!isRunning) return false;
                await checkPause();
                removeQueen(i, col);
                statusText.innerHTML = `Backtracking from Column ${col+1}...`;
                await sleep(speed / 2);
            }
            highlightCell(i, col, null);
        }
        return false;
    }

    async function checkPause() {
        while (isPaused) {
            await sleep(100);
        }
    }

    async function startVisualization() {
        if (isRunning && !isPaused) return;

        if (isPaused) {
            isPaused = false;
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            statusText.innerHTML = "Algorithm running...";
            return;
        }

        initBoard();
        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        sizeSlider.disabled = true;
        tabPuzzle.disabled = true; 
        statusText.innerHTML = "Algorithm running...";

        await solveNQVisualizer(0);

        if (isRunning) {
            statusText.innerHTML = `<span class="text-success">Visualization Complete. Found ${solutions} solutions.</span>`;
            isRunning = false;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            sizeSlider.disabled = false;
            tabPuzzle.disabled = false;
        }
    }

    function resetVisualization() {
        isRunning = false;
        isPaused = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        sizeSlider.disabled = false;
        tabVisualizer.disabled = false;
        tabPuzzle.disabled = false;
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        initBoard();
        statusText.innerHTML = currentMode === 'visualizer' ? "Ready to start." : "Puzzle Mode: Place your queens!";
    }

    function togglePause() {
        isPaused = !isPaused;
        if (isPaused) {
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            statusText.innerHTML = "Paused.";
        } else {
            startVisualization();
        }
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        sizeSlider.addEventListener('input', (e) => {
            sizeValue.innerText = e.target.value;
            N = parseInt(e.target.value);
            resetVisualization();
        });

        speedSlider.addEventListener('input', (e) => {
            speed = parseInt(e.target.value);
        });

        startBtn.addEventListener('click', startVisualization);
        pauseBtn.addEventListener('click', togglePause);
        
        submitBtn.addEventListener('click', checkUserSolution);
        undoBtn.addEventListener('click', undoMove);
        hintBtn.addEventListener('click', showOptimalSolution);
        
        resetBtn.addEventListener('click', resetVisualization);
    }

    // Start App
    initApp();
});