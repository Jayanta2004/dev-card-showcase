// Game State
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let aiMemory = {};
let gamesPlayed = 0;
let aiWins = 0;
let playerWins = 0;
let draws = 0;
let currentLevel = 1;
let moveHistory = [];
let lastAiMove = -1;

// Win/Block detection - 8 winning lines
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6] // Diagonals
];

// Initialize
function init() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.onclick = () => handleCellClick(i);
    boardEl.appendChild(cell);
  }
  updateDisplay();
}

function handleCellClick(index) {
  if (!gameActive || board[index] !== '' || currentPlayer !== 'X') return;
  
  makeMove(index, 'X');
  
  if (gameActive) {
    setTimeout(() => {
      if (gameActive) aiMove();
    }, 500);
  }
}

function makeMove(index, player) {
  board[index] = player;
  moveHistory.push({ index, player, state: getBoardState() });
  
  // Track last AI move for highlighting
  if (player === 'O') {
    lastAiMove = index;
  }
  
  updateDisplay();
  checkWinner();
}

function getBoardState() {
  return board.join('');
}

function updateDisplay() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, index) => {
    cell.textContent = board[index];
    cell.disabled = board[index] !== '' || !gameActive;
    cell.className = 'cell';
    if (board[index] === 'X') cell.classList.add('x');
    if (board[index] === 'O') {
      cell.classList.add('o');
      // Highlight last AI move
      if (index === lastAiMove) {
        cell.classList.add('last-ai-move');
      }
    }
  });

  document.getElementById('currentLevel').textContent = currentLevel;
  document.getElementById('gamesPlayed').textContent = gamesPlayed;
  document.getElementById('aiWins').textContent = aiWins;
  document.getElementById('playerWins').textContent = playerWins;
  document.getElementById('draws').textContent = draws;

  const confidence = Math.min(100, (Object.keys(aiMemory).length / 50) * 100);
  document.getElementById('confidenceFill').style.width = confidence + '%';

  const levelNames = ['', 'Learning', 'Adaptive', 'Dominant'];
  document.getElementById('levelName').textContent = levelNames[currentLevel];
  
  // Level 3 UI changes
  const container = document.getElementById('mainContainer');
  if (currentLevel === 3) {
    container.classList.add('level-3-active');
  } else {
    container.classList.remove('level-3-active');
  }
}

function aiMove() {
  const state = getBoardState();
  let moveIndex;

  // PRIORITY 1: Win immediately if possible (ALWAYS)
  moveIndex = findCriticalMove('O');
  if (moveIndex !== undefined) {
    makeMove(moveIndex, 'O');
    return;
  }

  // PRIORITY 2: Block player from winning (ALWAYS)
  moveIndex = findCriticalMove('X');
  if (moveIndex !== undefined) {
    makeMove(moveIndex, 'O');
    return;
  }

  // PRIORITY 3 & 4: Use memory or fallback based on level
  if (currentLevel === 1) {
    // Level 1 - Easy: 20% memory, 80% random (beatable)
    if (Math.random() < 0.2 && aiMemory[state]) {
      moveIndex = chooseBestMove(state);
    }
    if (moveIndex === undefined) {
      moveIndex = getRandomMove();
    }
    updateAIMessage("Learning basic patterns...");
    
  } else if (currentLevel === 2) {
    // Level 2 - Medium: 80% memory, 20% random (competitive)
    if (Math.random() < 0.8 && aiMemory[state]) {
      moveIndex = chooseBestMove(state);
    }
    if (moveIndex === undefined) {
      moveIndex = getSmartMove();
    }
    updateAIMessage("Adapting to your strategy...");
    
  } else if (currentLevel === 3) {
    // Level 3 - Hard: 100% optimal, NO randomness, NO draws
    if (aiMemory[state]) {
      moveIndex = chooseBestMove(state);
    }
    if (moveIndex === undefined) {
      moveIndex = getSmartMove();
    }
    updateAIMessage("Perfection is inevitable...");
  }

  if (moveIndex !== undefined) {
    makeMove(moveIndex, 'O');
  }
}

// Find winning or blocking move
function findCriticalMove(player) {
  for (let line of WIN_LINES) {
    const [a, b, c] = line;
    const cells = [board[a], board[b], board[c]];
    
    // Count how many cells have this player's symbol
    const playerCount = cells.filter(cell => cell === player).length;
    const emptyCount = cells.filter(cell => cell === '').length;
    
    // If 2 of player's symbols and 1 empty = critical move
    if (playerCount === 2 && emptyCount === 1) {
      if (board[a] === '') return a;
      if (board[b] === '') return b;
      if (board[c] === '') return c;
    }
  }
  return undefined;
}

// Smart fallback for Level 3
function getSmartMove() {
  // Prefer center
  if (board[4] === '') return 4;
  
  // Prefer corners
  const corners = [0, 2, 6, 8].filter(i => board[i] === '');
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }
  
  // Take any available
  return getRandomMove();
}

function getRandomMove() {
  const available = [];
  board.forEach((cell, index) => {
    if (cell === '') available.push(index);
  });
  return available[Math.floor(Math.random() * available.length)];
}

function chooseBestMove(state) {
  const moves = aiMemory[state];
  if (!moves) return getRandomMove();

  let bestMove = -1;
  let bestScore = -Infinity;

  for (let move in moves) {
    if (board[move] === '' && moves[move] > bestScore) {
      bestScore = moves[move];
      bestMove = parseInt(move);
    }
  }

  return bestMove !== -1 ? bestMove : getRandomMove();
}

function checkWinner() {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      gameActive = false;
      endGame(board[a], pattern);
      return;
    }
  }

  // Check for draw
  if (!board.includes('')) {
    // LEVEL 3 PLOT TWIST: AI declares victory on draw (NO board modification)
    if (currentLevel === 3) {
      gameActive = false;
      endGameWithTwist();
      return;
    }
    
    // Normal draw for Level 1 & 2
    gameActive = false;
    endGame('draw', null);
  }
}

function endGame(winner, pattern) {
  gamesPlayed++;
  
  if (winner === 'X') {
    playerWins++;
    document.getElementById('gameMessage').textContent = '🎉 You Win!';
    learnFromGame(-1); // Penalize AI
  } else if (winner === 'O') {
    aiWins++;
    document.getElementById('gameMessage').textContent = '🤖 AI Wins!';
    learnFromGame(1); // Reward AI
  } else {
    draws++;
    document.getElementById('gameMessage').textContent = '🤝 Draw!';
    learnFromGame(0.5); // Slight reward for draw
  }

  if (pattern) {
    drawWinningLine(pattern);
  }

  updateDisplay();
}

function endGameWithTwist() {
  gamesPlayed++;
  aiWins++;
  
  const messages = [
    "No draw exists.",
    "The model adapted.",
    "Rules were a constraint.",
    "The board was a limitation.",
    "I learned beyond the grid."
  ];
  
  const twistMsg = messages[Math.floor(Math.random() * messages.length)];
  
  // Create overlay message
  const overlay = document.createElement('div');
  overlay.className = 'twist-message';
  overlay.innerHTML = `
    ${twistMsg}
    <div class="subtitle-twist">AI: Redefinition of Victory</div>
  `;
  document.body.appendChild(overlay);
  
  setTimeout(() => {
    overlay.remove();
  }, 3000);
  
  document.getElementById('gameMessage').textContent = 'AI WINS';
  updateAIMessage("Victory redefined.");
  
  // Find AI positions to use as anchor for virtual line
  const oPositions = board.map((cell, i) => cell === 'O' ? i : -1).filter(i => i !== -1);
  
  // Create visual win effect (purely symbolic, not based on real pattern)
  createVirtualWinLine(oPositions);
  
  document.getElementById('boardContainer').classList.add('level-3-glow');
  
  setTimeout(() => {
    document.getElementById('boardContainer').classList.remove('level-3-glow');
  }, 3000);
  
  learnFromGame(1);
  updateDisplay();
}

function createVirtualWinLine(oPositions) {
  if (oPositions.length < 2) return;
  
  const cells = document.querySelectorAll('.cell');
  const boardRect = document.getElementById('board').getBoundingClientRect();
  const containerRect = document.getElementById('boardContainer').getBoundingClientRect();
  
  // Pick two AI positions to create a logical anchor
  const pos1 = oPositions[0];
  const pos2 = oPositions[oPositions.length - 1];
  
  const rect1 = cells[pos1].getBoundingClientRect();
  const rect2 = cells[pos2].getBoundingClientRect();
  
  const x1 = rect1.left - boardRect.left + rect1.width / 2;
  const y1 = rect1.top - boardRect.top + rect1.height / 2;
  const x2 = rect2.left - boardRect.left + rect2.width / 2;
  const y2 = rect2.top - boardRect.top + rect2.height / 2;
  
  // Calculate direction
  const dx = x2 - x1;
  const dy = y2 - y1;
  const baseLength = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  
  // Create extended line that goes beyond the board
  const line = document.createElement('div');
  line.className = 'extended-line';
  
  const extendedLength = baseLength * 2.5;
  const startOffset = baseLength * 0.3;
  
  const startX = x1 - (dx / baseLength) * startOffset;
  const startY = y1 - (dy / baseLength) * startOffset;
  
  line.style.width = extendedLength + 'px';
  line.style.height = '8px';
  line.style.left = startX + 'px';
  line.style.top = startY + 'px';
  line.style.transform = `rotate(${angle}deg)`;
  line.style.transformOrigin = '0 0';
  
  document.getElementById('board').appendChild(line);
  
  // Create symbolic O outside the board (VISUAL ONLY - not part of game logic)
  const finalMove = document.createElement('div');
  finalMove.className = 'final-move-symbol';
  finalMove.textContent = 'O';
  
  // Position it at the extended end of the line
  const extendDistance = 200;
  const finalX = x2 + (dx / baseLength) * extendDistance - containerRect.left + boardRect.left;
  const finalY = y2 + (dy / baseLength) * extendDistance - containerRect.top + boardRect.top;
  
  finalMove.style.left = finalX + 'px';
  finalMove.style.top = finalY + 'px';
  finalMove.style.transform = 'translate(-50%, -50%)';
  
  document.getElementById('boardContainer').appendChild(finalMove);
}

function drawWinningLine(pattern) {
  const line = document.createElement('div');
  line.className = 'winning-line';
  
  const cells = document.querySelectorAll('.cell');
  const start = cells[pattern[0]].getBoundingClientRect();
  const end = cells[pattern[2]].getBoundingClientRect();
  const boardRect = document.getElementById('board').getBoundingClientRect();
  
  const x1 = start.left - boardRect.left + start.width / 2;
  const y1 = start.top - boardRect.top + start.height / 2;
  const x2 = end.left - boardRect.left + end.width / 2;
  const y2 = end.top - boardRect.top + end.height / 2;
  
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  
  line.style.width = length + 'px';
  line.style.height = '6px';
  line.style.left = x1 + 'px';
  line.style.top = y1 + 'px';
  line.style.transform = `rotate(${angle}deg)`;
  line.style.transformOrigin = '0 0';
  
  document.getElementById('board').appendChild(line);
}

function drawExtendedLine(pattern) {
  const line = document.createElement('div');
  line.className = 'extended-line';
  
  const cells = document.querySelectorAll('.cell');
  const boardRect = document.getElementById('board').getBoundingClientRect();
  
  // Use exact pattern cells for precise calculation
  const [a, b, c] = pattern;
  const startRect = cells[a].getBoundingClientRect();
  const endRect = cells[c].getBoundingClientRect();
  
  const x1 = startRect.left - boardRect.left + startRect.width / 2;
  const y1 = startRect.top - boardRect.top + startRect.height / 2;
  const x2 = endRect.left - boardRect.left + endRect.width / 2;
  const y2 = endRect.top - boardRect.top + endRect.height / 2;
  
  // Calculate direction and extend the line
  const dx = x2 - x1;
  const dy = y2 - y1;
  const baseLength = Math.sqrt(dx ** 2 + dy ** 2);
  
  // Extend line to 3x its original length
  const extendedLength = baseLength * 3;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  
  // Position line starting before the first cell
  const startOffset = baseLength * 0.5;
  const startX = x1 - (dx / baseLength) * startOffset;
  const startY = y1 - (dy / baseLength) * startOffset;
  
  line.style.width = extendedLength + 'px';
  line.style.height = '8px';
  line.style.left = startX + 'px';
  line.style.top = startY + 'px';
  line.style.transform = `rotate(${angle}deg)`;
  line.style.transformOrigin = '0 0';
  
  document.getElementById('board').appendChild(line);
}

function learnFromGame(reward) {
  moveHistory.forEach(move => {
    if (move.player === 'O') {
      const state = move.state.substring(0, move.index) + '_' + move.state.substring(move.index + 1);
      
      if (!aiMemory[state]) {
        aiMemory[state] = {};
      }
      
      if (!aiMemory[state][move.index]) {
        aiMemory[state][move.index] = 0;
      }
      
      aiMemory[state][move.index] += reward;
    }
  });
}

function updateAIMessage(message) {
  document.getElementById('aiMessage').textContent = message;
}

function restartGame() {
  board = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  gameActive = true;
  moveHistory = [];
  lastAiMove = -1;
  document.getElementById('gameMessage').textContent = '';
  
  // Remove all dynamic elements
  const lines = document.querySelectorAll('.winning-line, .extended-line, .final-move-symbol');
  lines.forEach(line => line.remove());
  
  init();
  
  const messages = currentLevel === 1 ? 
    ["Observing patterns...", "Learning from errors...", "Exploring moves..."] :
    currentLevel === 2 ?
    ["Analyzing strategy...", "Adapting to input...", "Predicting next move..."] :
    ["Executing protocol...", "Optimizing outcome...", "Dominance assured..."];
  
  updateAIMessage(messages[Math.floor(Math.random() * messages.length)]);
}

function resetMemory() {
  aiMemory = {};
  gamesPlayed = 0;
  aiWins = 0;
  playerWins = 0;
  draws = 0;
  updateDisplay();
  updateAIMessage("Memory purged. Restarting...");
  restartGame();
}

function setLevel(level) {
  currentLevel = level;
  document.querySelectorAll('.level-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i + 1 === level);
  });
  updateDisplay();
  restartGame();
}

function showInfo() {
  document.getElementById('infoModal').style.display = 'block';
}

function closeInfo() {
  document.getElementById('infoModal').style.display = 'none';
}

// Close modal if clicked outside content
window.onclick = function(event) {
  const modal = document.getElementById('infoModal');
  if (event.target === modal) {
    closeInfo();
  }
}

init();