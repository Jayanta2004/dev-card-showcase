const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");

let board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = true;

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

  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      roundWon = true;
      break;
    }
  }

  if (roundWon) {
    statusText.textContent = `Player ${currentPlayer} wins! 🎉`;
    gameActive = false;
    return;
  }

  if (!board.includes("")) {
    statusText.textContent = "It's a draw 😐";
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function resetGame() {
  board.fill("");
  currentPlayer = "X";
  gameActive = true;
  statusText.textContent = "Player X's turn";
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("X", "O");
  });
}

cells.forEach(cell => cell.addEventListener("click", handleCellClick));
resetBtn.addEventListener("click", resetGame);
