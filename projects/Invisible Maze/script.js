/* ============================================================
   INVISIBLE MAZE - ENHANCED GAME ENGINE
   Author: Vijay
   Description:
   An advanced memory-based maze game with power-ups, 
   achievements, lives system, particle effects, and more!
   ============================================================ */

/* =======================
   GLOBAL CONSTANTS
   ======================= */

const PREVIEW_TIMES = {
  beginner: 5000,
  easy: 4000,
  normal: 2500,
  hard: 1500,
  expert: 1000
};

const MAZE_SIZES = {
  beginner: 5,
  easy: 7,
  normal: 9,
  hard: 11,
  expert: 13
};

const COLLISION_MODES = {
  BLOCK: "block",
  RESET: "reset",
  LIVES: "lives"
};

const GAME_STATES = {
  PREVIEW: "preview",
  PLAYING: "playing",
  WON: "won",
  LOST: "lost",
  PAUSED: "paused"
};

const DIRECTIONS = {
  ArrowUp: { r: -1, c: 0 },
  ArrowDown: { r: 1, c: 0 },
  ArrowLeft: { r: 0, c: -1 },
  ArrowRight: { r: 0, c: 1 },
  w: { r: -1, c: 0 },
  s: { r: 1, c: 0 },
  a: { r: 0, c: -1 },
  d: { r: 0, c: 1 }
};

const POWERUP_TYPES = {
  REVEAL: "reveal",
  TELEPORT: "teleport",
  SHIELD: "shield"
};

const MAX_LIVES = 3;
const MAX_HINTS = 3;

/* =======================
   DOM REFERENCES
   ======================= */

const mazeContainer = document.getElementById("maze");
const minimapContainer = document.getElementById("minimap");
const particlesCanvas = document.getElementById("particles");
const particlesCtx = particlesCanvas.getContext("2d");

const timerLabel = document.getElementById("timer");
const movesCounter = document.getElementById("movesCounter");
const hitsCounter = document.getElementById("hitsCounter");
const livesCounter = document.getElementById("livesCounter");
const levelCounter = document.getElementById("levelCounter");
const activePowerupLabel = document.getElementById("activePowerup");
const livesContainer = document.getElementById("livesContainer");
const powerupContainer = document.getElementById("powerupContainer");

const restartBtn = document.getElementById("restartBtn");
const hintBtn = document.getElementById("hintBtn");
const achievementsBtn = document.getElementById("achievementsBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");

const revealBtn = document.getElementById("revealBtn");
const teleportBtn = document.getElementById("teleportBtn");
const shieldBtn = document.getElementById("shieldBtn");

const difficultySelect = document.getElementById("difficulty");
const collisionSelect = document.getElementById("collision");
const fogCheckbox = document.getElementById("fog");
const minimapCheckbox = document.getElementById("minimap");
const breadcrumbsCheckbox = document.getElementById("breadcrumbs");

const achievementsModal = document.getElementById("achievementsModal");
const leaderboardModal = document.getElementById("leaderboardModal");
const closeAchievements = document.getElementById("closeAchievements");
const closeLeaderboard = document.getElementById("closeLeaderboard");

/* =======================
   MAZE GENERATION
   ======================= */

function generateMaze(size) {
  // Create empty maze
  const maze = Array(size).fill(null).map(() => Array(size).fill(1));
  
  // Recursive backtracking algorithm
  function carve(row, col) {
    maze[row][col] = 0;
    
    const directions = [
      [-2, 0], [2, 0], [0, -2], [0, 2]
    ].sort(() => Math.random() - 0.5);
    
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size && maze[newRow][newCol] === 1) {
        maze[row + dr/2][col + dc/2] = 0;
        carve(newRow, newCol);
      }
    }
  }
  
  carve(1, 1);
  
  // Set start position
  maze[0][0] = "S";
  maze[0][1] = 0;
  maze[1][0] = 0;
  
  // Set end position
  maze[size-1][size-1] = "E";
  maze[size-1][size-2] = 0;
  maze[size-2][size-1] = 0;
  
  // Add some shortcuts for variety
  for (let i = 0; i < size * 0.3; i++) {
    const r = Math.floor(Math.random() * (size - 2)) + 1;
    const c = Math.floor(Math.random() * (size - 2)) + 1;
    if (maze[r][c] === 1) maze[r][c] = 0;
  }
  
  return maze;
}

/* =======================
   GAME STATE
   ======================= */

let mazeData = [];
let player = { row: 0, col: 0 };
let gameState = GAME_STATES.PREVIEW;
let difficulty = "normal";
let collisionMode = COLLISION_MODES.RESET;
let fogOfWar = false;
let showMinimap = false;
let showBreadcrumbs = false;

let currentLevel = 1;
let lives = MAX_LIVES;
let hintsRemaining = MAX_HINTS;
let visitedCells = new Set();

// Power-ups
let powerups = {
  reveal: 1,
  teleport: 1,
  shield: 1
};
let activePowerup = null;
let shieldHits = 0;

// Particles
let particles = [];

/* =======================
   ANALYTICS & STATS
   ======================= */

let stats = {
  moves: 0,
  wallHits: 0,
  startTime: null,
  endTime: null,
  hintsUsed: 0,
  powerupsUsed: 0
};

/* =======================
   ACHIEVEMENTS SYSTEM
   ======================= */

const ACHIEVEMENTS = {
  firstWin: { name: "First Victory", desc: "Complete your first maze", unlocked: false },
  speedster: { name: "Speedster", desc: "Complete a maze in under 30 seconds", unlocked: false },
  perfectRun: { name: "Perfect Navigator", desc: "Complete without hitting walls", unlocked: false },
  survivor: { name: "Survivor", desc: "Complete with 1 life remaining", unlocked: false },
  explorer: { name: "Explorer", desc: "Complete 10 mazes", unlocked: false },
  master: { name: "Maze Master", desc: "Complete expert difficulty", unlocked: false },
  efficient: { name: "Efficient", desc: "Complete with under 50 moves", unlocked: false },
  memorizer: { name: "Memory King", desc: "Complete without using hints", unlocked: false }
};

let totalMazesCompleted = 0;

/* =======================
   UTILITY FUNCTIONS
   ======================= */

function cloneMaze(maze) {
  return maze.map(row => [...row]);
}

function resetStats() {
  stats.moves = 0;
  stats.wallHits = 0;
  stats.startTime = Date.now();
  stats.endTime = null;
  stats.hintsUsed = 0;
  stats.powerupsUsed = 0;
  visitedCells.clear();
  visitedCells.add(`${player.row},${player.col}`);
}

function elapsedTime() {
  if (!stats.startTime) return 0;
  const end = stats.endTime || Date.now();
  return Math.floor((end - stats.startTime) / 1000);
}

function updateUI() {
  movesCounter.textContent = stats.moves;
  hitsCounter.textContent = stats.wallHits;
  livesCounter.textContent = lives;
  levelCounter.textContent = currentLevel;
  
  if (collisionMode === COLLISION_MODES.LIVES) {
    livesContainer.style.display = 'block';
  } else {
    livesContainer.style.display = 'none';
  }
  
  revealBtn.disabled = powerups.reveal <= 0;
  teleportBtn.disabled = powerups.teleport <= 0;
  shieldBtn.disabled = powerups.shield <= 0;
  
  revealBtn.textContent = `👁️ Reveal (${powerups.reveal})`;
  teleportBtn.textContent = `🌀 Teleport (${powerups.teleport})`;
  shieldBtn.textContent = `🛡️ Shield (${powerups.shield})`;
  
  hintBtn.textContent = `💡 Hint (${hintsRemaining})`;
  hintBtn.disabled = hintsRemaining <= 0;
}

/* =======================
   PARTICLES SYSTEM
   ======================= */

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.life = 1;
    this.color = color;
    this.size = Math.random() * 3 + 2;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 0.02;
    this.vy += 0.1; 
  }
  
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function createParticles(x, y, color, count = 10) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, color));
  }
}

function updateParticles() {
  if (!particlesCanvas) return;
  
  particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
  
  particles = particles.filter(p => {
    p.update();
    p.draw(particlesCtx);
    return p.life > 0;
  });
  
  requestAnimationFrame(updateParticles);
}

function initParticlesCanvas() {
  const rect = mazeContainer.getBoundingClientRect();
  particlesCanvas.width = rect.width;
  particlesCanvas.height = rect.height;
  particlesCanvas.style.position = 'absolute';
  particlesCanvas.style.top = '0';
  particlesCanvas.style.left = '0';
  particlesCanvas.style.pointerEvents = 'none';
  updateParticles();
}

/* =======================
   MAZE INITIALIZATION
   ======================= */

function findStartPosition() {
  mazeData.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell === "S") {
        player.row = r;
        player.col = c;
      }
    });
  });
}

function initializeGame() {
  const size = MAZE_SIZES[difficulty];
  mazeData = generateMaze(size);
  findStartPosition();
  resetStats();
  lives = MAX_LIVES;
  hintsRemaining = MAX_HINTS;
  activePowerup = null;
  shieldHits = 0;
  gameState = GAME_STATES.PREVIEW;
  
  updateUI();
  renderMaze(false);
  renderMinimap();
  startPreviewTimer();
  initParticlesCanvas();
}

/* =======================
   RENDERING LOGIC
   ======================= */

function getCellPosition(row, col) {
  const cellSize = 50;
  const gap = 2;
  return {
    x: col * (cellSize + gap) + cellSize / 2,
    y: row * (cellSize + gap) + cellSize / 2
  };
}

function renderMaze(hidden) {
  mazeContainer.innerHTML = "";
  const cellSize = window.innerWidth < 600 ? 36 : 48;
  mazeContainer.style.gridTemplateColumns = `repeat(${mazeData[0].length}, ${cellSize}px)`;

  mazeData.forEach((row, r) => {
    row.forEach((cell, c) => {
      const div = document.createElement("div");
      div.classList.add("cell");

      if (cell === 1) div.classList.add("wall");
      else div.classList.add("path");

      if (hidden && cell === 1 && !(activePowerup === POWERUP_TYPES.REVEAL)) {
        div.classList.add("hidden");
      }

      if (fogOfWar && hidden) {
        const dist = Math.abs(player.row - r) + Math.abs(player.col - c);
        if (dist > 1 && cell === 1) div.classList.add("hidden");
      }

      if (r === player.row && c === player.col) {
        div.classList.add("player");
        if (activePowerup === POWERUP_TYPES.SHIELD) {
          div.classList.add("shielded");
        }
      }

      if (cell === "E") {
        div.classList.add("goal");
      }
      
      if (showBreadcrumbs && visitedCells.has(`${r},${c}`) && !(r === player.row && c === player.col)) {
        div.classList.add("visited");
      }

      mazeContainer.appendChild(div);
    });
  });
}

function renderMinimap() {
  if (!showMinimap) {
    minimapContainer.style.display = 'none';
    return;
  }
  
  minimapContainer.style.display = 'block';
  minimapContainer.innerHTML = "";
  minimapContainer.style.gridTemplateColumns = `repeat(${mazeData[0].length}, 8px)`;
  
  mazeData.forEach((row, r) => {
    row.forEach((cell, c) => {
      const div = document.createElement("div");
      div.classList.add("minimap-cell");
      
      if (cell === 1) div.classList.add("minimap-wall");
      if (r === player.row && c === player.col) div.classList.add("minimap-player");
      if (cell === "E") div.classList.add("minimap-goal");
      
      minimapContainer.appendChild(div);
    });
  });
}

/* =======================
   GAME FLOW
   ======================= */

let timerInterval;

function startPreviewTimer() {
  timerLabel.textContent = `Memorizing... ${Math.floor(PREVIEW_TIMES[difficulty] / 1000)}s`;
  let remaining = PREVIEW_TIMES[difficulty];
  
  const countdownInterval = setInterval(() => {
    remaining -= 100;
    timerLabel.textContent = `Memorizing... ${Math.ceil(remaining / 1000)}s`;
    if (remaining <= 0) clearInterval(countdownInterval);
  }, 100);
  
  setTimeout(() => {
    gameState = GAME_STATES.PLAYING;
    renderMaze(true);
    startGameTimer();
  }, PREVIEW_TIMES[difficulty]);
}

function startGameTimer() {
  timerInterval = setInterval(() => {
    timerLabel.textContent = `${elapsedTime()}s`;
  }, 100);
}

function stopGameTimer() {
  if (timerInterval) clearInterval(timerInterval);
}

function checkAchievements() {
  const time = elapsedTime();
  
  if (!ACHIEVEMENTS.firstWin.unlocked) {
    unlockAchievement('firstWin');
  }
  
  if (time < 30 && !ACHIEVEMENTS.speedster.unlocked) {
    unlockAchievement('speedster');
  }
  
  if (stats.wallHits === 0 && !ACHIEVEMENTS.perfectRun.unlocked) {
    unlockAchievement('perfectRun');
  }
  
  if (lives === 1 && collisionMode === COLLISION_MODES.LIVES && !ACHIEVEMENTS.survivor.unlocked) {
    unlockAchievement('survivor');
  }
  
  if (stats.moves < 50 && !ACHIEVEMENTS.efficient.unlocked) {
    unlockAchievement('efficient');
  }
  
  if (stats.hintsUsed === 0 && !ACHIEVEMENTS.memorizer.unlocked) {
    unlockAchievement('memorizer');
  }
  
  if (difficulty === 'expert' && !ACHIEVEMENTS.master.unlocked) {
    unlockAchievement('master');
  }
  
  totalMazesCompleted++;
  if (totalMazesCompleted >= 10 && !ACHIEVEMENTS.explorer.unlocked) {
    unlockAchievement('explorer');
  }
  
  saveAchievements();
}

function unlockAchievement(key) {
  ACHIEVEMENTS[key].unlocked = true;
  showNotification(`🏆 Achievement Unlocked: ${ACHIEVEMENTS[key].name}`);
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function winGame() {
  gameState = GAME_STATES.WON;
  stats.endTime = Date.now();
  stopGameTimer();
  
  checkAchievements();
  saveToLeaderboard();
  
  const pos = getCellPosition(player.row, player.col);
  createParticles(pos.x, pos.y, '#facc15', 30);
  
  timerLabel.textContent = `🎉 Level ${currentLevel} Complete! Time: ${elapsedTime()}s | Moves: ${stats.moves} | Hits: ${stats.wallHits}`;
  
  currentLevel++;
  
  setTimeout(() => {
    if (confirm(`Level ${currentLevel-1} Complete! Continue to Level ${currentLevel}?`)) {
      // Add powerup rewards
      powerups.reveal++;
      if (currentLevel % 3 === 0) powerups.teleport++;
      if (currentLevel % 2 === 0) powerups.shield++;
      initializeGame();
    }
  }, 1000);
}

function loseGame() {
  gameState = GAME_STATES.LOST;
  stats.endTime = Date.now();
  stopGameTimer();
  
  timerLabel.textContent = `💀 Game Over! You ran out of lives. Level reached: ${currentLevel}`;
  
  setTimeout(() => {
    if (confirm('Game Over! Try again?')) {
      currentLevel = 1;
      powerups = { reveal: 1, teleport: 1, shield: 1 };
      initializeGame();
    }
  }, 1000);
}

/* =======================
   MOVEMENT & COLLISION
   ======================= */

function attemptMove(dr, dc) {
  if (gameState !== GAME_STATES.PLAYING) return;

  const newRow = player.row + dr;
  const newCol = player.col + dc;

  // Check boundaries
  if (
    newRow < 0 ||
    newCol < 0 ||
    newRow >= mazeData.length ||
    newCol >= mazeData[0].length ||
    mazeData[newRow][newCol] === 1
  ) {
    stats.wallHits++;
    
    const pos = getCellPosition(player.row, player.col);
    createParticles(pos.x, pos.y, '#ef4444', 15);
    
    if (activePowerup === POWERUP_TYPES.SHIELD) {
      shieldHits++;
      if (shieldHits >= 5) {
        deactivatePowerup();
      }
    } else if (collisionMode === COLLISION_MODES.RESET) {
      findStartPosition();
      visitedCells.clear();
      visitedCells.add(`${player.row},${player.col}`);
    } else if (collisionMode === COLLISION_MODES.LIVES) {
      lives--;
      updateUI();
      if (lives <= 0) {
        loseGame();
        return;
      }
    }
    
    renderMaze(true);
    renderMinimap();
    updateUI();
    return;
  }

  // Valid move
  player.row = newRow;
  player.col = newCol;
  stats.moves++;
  visitedCells.add(`${player.row},${player.col}`);
  
  const pos = getCellPosition(player.row, player.col);
  createParticles(pos.x, pos.y, '#4ade80', 8);

  // Check for win condition
  if (mazeData[newRow][newCol] === "E") {
    winGame();
    renderMaze(true);
    renderMinimap();
    return;
  }

  renderMaze(true);
  renderMinimap();
  updateUI();
}

/* =======================
   INPUT HANDLING
   ======================= */

document.addEventListener("keydown", e => {
  if (!DIRECTIONS[e.key]) return;
  e.preventDefault();
  const { r, c } = DIRECTIONS[e.key];
  attemptMove(r, c);
});

/* =======================
   POWER-UPS SYSTEM
   ======================= */

function activateReveal() {
  if (powerups.reveal <= 0 || gameState !== GAME_STATES.PLAYING) return;
  
  powerups.reveal--;
  stats.powerupsUsed++;
  activePowerup = POWERUP_TYPES.REVEAL;
  powerupContainer.style.display = 'block';
  activePowerupLabel.textContent = 'Reveal Walls';
  
  renderMaze(true);
  updateUI();
  
  setTimeout(() => {
    deactivatePowerup();
  }, 3000);
}

function activateTeleport() {
  if (powerups.teleport <= 0 || gameState !== GAME_STATES.PLAYING) return;
  
  powerups.teleport--;
  stats.powerupsUsed++;
  
  // Find cells near the exit
  let exitRow, exitCol;
  mazeData.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell === "E") {
        exitRow = r;
        exitCol = c;
      }
    });
  });
  
  // Find valid cells near exit
  const nearExit = [];
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      const r = exitRow + dr;
      const c = exitCol + dc;
      if (r >= 0 && r < mazeData.length && c >= 0 && c < mazeData[0].length) {
        if (mazeData[r][c] !== 1 && mazeData[r][c] !== "E") {
          nearExit.push({r, c});
        }
      }
    }
  }
  
  if (nearExit.length > 0) {
    const target = nearExit[Math.floor(Math.random() * nearExit.length)];
    const oldPos = getCellPosition(player.row, player.col);
    createParticles(oldPos.x, oldPos.y, '#8b5cf6', 20);
    
    player.row = target.r;
    player.col = target.c;
    visitedCells.add(`${player.row},${player.col}`);
    
    const newPos = getCellPosition(player.row, player.col);
    createParticles(newPos.x, newPos.y, '#8b5cf6', 20);
  }
  
  renderMaze(true);
  renderMinimap();
  updateUI();
}

function activateShield() {
  if (powerups.shield <= 0 || gameState !== GAME_STATES.PLAYING) return;
  
  powerups.shield--;
  stats.powerupsUsed++;
  activePowerup = POWERUP_TYPES.SHIELD;
  shieldHits = 0;
  powerupContainer.style.display = 'block';
  activePowerupLabel.textContent = 'Shield Active';
  
  renderMaze(true);
  updateUI();
}

function deactivatePowerup() {
  activePowerup = null;
  powerupContainer.style.display = 'none';
  renderMaze(true);
  updateUI();
}

function useHint() {
  if (hintsRemaining <= 0 || gameState !== GAME_STATES.PLAYING) return;
  
  hintsRemaining--;
  stats.hintsUsed++;
  
  renderMaze(false);
  updateUI();
  
  setTimeout(() => {
    renderMaze(true);
  }, 1500);
}

/* =======================
   ACHIEVEMENTS & LEADERBOARD
   ======================= */

function loadAchievements() {
  const saved = localStorage.getItem('invisibleMazeAchievements');
  if (saved) {
    const data = JSON.parse(saved);
    Object.keys(data).forEach(key => {
      if (ACHIEVEMENTS[key]) {
        ACHIEVEMENTS[key].unlocked = data[key];
      }
    });
  }
  
  const completed = localStorage.getItem('invisibleMazesCompleted');
  if (completed) {
    totalMazesCompleted = parseInt(completed);
  }
}

function saveAchievements() {
  const data = {};
  Object.keys(ACHIEVEMENTS).forEach(key => {
    data[key] = ACHIEVEMENTS[key].unlocked;
  });
  localStorage.setItem('invisibleMazeAchievements', JSON.stringify(data));
  localStorage.setItem('invisibleMazesCompleted', totalMazesCompleted);
}

function displayAchievements() {
  const list = document.getElementById('achievementsList');
  list.innerHTML = '';
  
  Object.keys(ACHIEVEMENTS).forEach(key => {
    const achievement = ACHIEVEMENTS[key];
    const div = document.createElement('div');
    div.className = 'achievement-item';
    if (achievement.unlocked) div.classList.add('unlocked');
    
    div.innerHTML = `
      <span class="achievement-icon">${achievement.unlocked ? '🏆' : '🔒'}</span>
      <div>
        <div class="achievement-name">${achievement.name}</div>
        <div class="achievement-desc">${achievement.desc}</div>
      </div>
    `;
    
    list.appendChild(div);
  });
  
  achievementsModal.style.display = 'block';
}

function saveToLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem('invisibleMazeLeaderboard') || '[]');
  
  leaderboard.push({
    level: currentLevel,
    time: elapsedTime(),
    moves: stats.moves,
    hits: stats.wallHits,
    difficulty: difficulty,
    date: new Date().toLocaleDateString()
  });
  
  leaderboard.sort((a, b) => {
    if (a.level !== b.level) return b.level - a.level;
    return a.time - b.time;
  });
  
  localStorage.setItem('invisibleMazeLeaderboard', JSON.stringify(leaderboard.slice(0, 50)));
}

function displayLeaderboard() {
  const list = document.getElementById('leaderboardList');
  list.innerHTML = '';
  
  const leaderboard = JSON.parse(localStorage.getItem('invisibleMazeLeaderboard') || '[]');
  
  if (leaderboard.length === 0) {
    list.innerHTML = '<p style="text-align:center;opacity:0.6;">No scores yet!</p>';
  } else {
    const table = document.createElement('table');
    table.className = 'leaderboard-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>#</th>
          <th>Level</th>
          <th>Time</th>
          <th>Moves</th>
          <th>Hits</th>
          <th>Difficulty</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    leaderboard.slice(0, 20).forEach((entry, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${entry.level}</td>
        <td>${entry.time}s</td>
        <td>${entry.moves}</td>
        <td>${entry.hits}</td>
        <td>${entry.difficulty}</td>
        <td>${entry.date}</td>
      `;
      tbody.appendChild(row);
    });
    
    list.appendChild(table);
  }
  
  leaderboardModal.style.display = 'block';
}

/* =======================
   SETTINGS (LOCAL STORAGE)
   ======================= */

function saveSettings() {
  const data = {
    difficulty,
    collisionMode,
    fogOfWar,
    showMinimap,
    showBreadcrumbs
  };
  localStorage.setItem("invisibleMazeSettings", JSON.stringify(data));
}

function loadSettings() {
  const data = JSON.parse(
    localStorage.getItem("invisibleMazeSettings")
  );
  if (!data) return;

  difficulty = data.difficulty || difficulty;
  collisionMode = data.collisionMode || collisionMode;
  fogOfWar = data.fogOfWar || fogOfWar;
  showMinimap = data.showMinimap || false;
  showBreadcrumbs = data.showBreadcrumbs || false;
  
  difficultySelect.value = difficulty;
  collisionSelect.value = collisionMode;
  fogCheckbox.checked = fogOfWar;
  minimapCheckbox.checked = showMinimap;
  breadcrumbsCheckbox.checked = showBreadcrumbs;
}

/* =======================
   UI CONTROLS & EVENT LISTENERS
   ======================= */

restartBtn.addEventListener("click", () => {
  initializeGame();
});

hintBtn.addEventListener("click", () => {
  useHint();
});

achievementsBtn.addEventListener("click", () => {
  displayAchievements();
});

leaderboardBtn.addEventListener("click", () => {
  displayLeaderboard();
});

revealBtn.addEventListener("click", () => {
  activateReveal();
});

teleportBtn.addEventListener("click", () => {
  activateTeleport();
});

shieldBtn.addEventListener("click", () => {
  activateShield();
});

difficultySelect.addEventListener("change", (e) => {
  difficulty = e.target.value;
  saveSettings();
});

collisionSelect.addEventListener("change", (e) => {
  collisionMode = e.target.value;
  saveSettings();
  updateUI();
});

fogCheckbox.addEventListener("change", (e) => {
  fogOfWar = e.target.checked;
  saveSettings();
  renderMaze(gameState === GAME_STATES.PLAYING);
});

minimapCheckbox.addEventListener("change", (e) => {
  showMinimap = e.target.checked;
  saveSettings();
  renderMinimap();
});

breadcrumbsCheckbox.addEventListener("change", (e) => {
  showBreadcrumbs = e.target.checked;
  saveSettings();
  renderMaze(gameState === GAME_STATES.PLAYING);
});

closeAchievements.addEventListener("click", () => {
  achievementsModal.style.display = 'none';
});

closeLeaderboard.addEventListener("click", () => {
  leaderboardModal.style.display = 'none';
});

window.addEventListener("click", (e) => {
  if (e.target === achievementsModal) {
    achievementsModal.style.display = 'none';
  }
  if (e.target === leaderboardModal) {
    leaderboardModal.style.display = 'none';
  }
});

/* =======================
   BOOTSTRAP
   ======================= */

loadSettings();
loadAchievements();
initializeGame();

/* ============================================================
   END OF SCRIPT
   ============================================================ */
