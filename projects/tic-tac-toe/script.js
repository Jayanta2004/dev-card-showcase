const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const turnIcon = document.getElementById("turnIcon");
const resetBtn = document.getElementById("resetBtn");
const resetScoreBtn = document.getElementById("resetScoreBtn");
const xWinsEl = document.getElementById("xWins");
const oWinsEl = document.getElementById("oWins");
const drawsEl = document.getElementById("draws");

let board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = true;
let scores = {
  X: Number(localStorage.getItem("tttWinsX")) || 0,
  O: Number(localStorage.getItem("tttWinsO")) || 0,
  D: Number(localStorage.getItem("tttDraws")) || 0
};

const winPatterns = [
  [0,1,2],
  [3,4,5],
  [6,7,8],
  [0,3,6],
  [1,4,7],
  [2,5,8],
  [0,4,8],
  [2,4,6]
];

function handleCellClick(e) {
  const index = e.target.dataset.index;

  if (board[index] !== "" || !gameActive) return;

  board[index] = currentPlayer;
  e.target.textContent = currentPlayer;
  e.target.classList.add(currentPlayer);

  checkResult();
}

function checkResult() {
  let roundWon = false;
  let winningPattern = null;

  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      roundWon = true;
      winningPattern = pattern;
      break;
    }
  }

  if (roundWon) {
    statusText.textContent = `Player ${currentPlayer} wins! 🎉`;
    highlightWin(winningPattern);
    updateScores(currentPlayer);
    gameActive = false;
    return;
  }

  if (!board.includes("")) {
    statusText.textContent = "It's a draw 😐";
    updateScores("D");
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer}'s turn`;
  updateTurnIndicator();
}

function resetGame() {
  board.fill("");
  currentPlayer = "X";
  gameActive = true;
  statusText.textContent = "Player X's turn";
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("X", "O");
    cell.classList.remove("win");
  });
  updateTurnIndicator();
}

function updateTurnIndicator() {
  turnIcon.textContent = currentPlayer;
  turnIcon.classList.toggle("x", currentPlayer === "X");
  turnIcon.classList.toggle("o", currentPlayer === "O");
}

function highlightWin(pattern) {
  if (!pattern) return;
  pattern.forEach(index => {
    cells[index].classList.add("win");
  });
}

function updateScores(result) {
  if (result === "X") scores.X += 1;
  if (result === "O") scores.O += 1;
  if (result === "D") scores.D += 1;

  xWinsEl.textContent = scores.X;
  oWinsEl.textContent = scores.O;
  drawsEl.textContent = scores.D;

  localStorage.setItem("tttWinsX", String(scores.X));
  localStorage.setItem("tttWinsO", String(scores.O));
  localStorage.setItem("tttDraws", String(scores.D));
}

function resetScores() {
  scores = { X: 0, O: 0, D: 0 };
  xWinsEl.textContent = "0";
  oWinsEl.textContent = "0";
  drawsEl.textContent = "0";
  localStorage.setItem("tttWinsX", "0");
  localStorage.setItem("tttWinsO", "0");
  localStorage.setItem("tttDraws", "0");
}

function hydrateScores() {
  xWinsEl.textContent = scores.X;
  oWinsEl.textContent = scores.O;
  drawsEl.textContent = scores.D;
}

hydrateScores();
updateTurnIndicator();
cells.forEach(cell => cell.addEventListener("click", handleCellClick));
resetBtn.addEventListener("click", resetGame);
resetScoreBtn.addEventListener("click", resetScores);
