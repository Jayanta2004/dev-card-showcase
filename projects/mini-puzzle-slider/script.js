const board = document.getElementById("board");
const movesDisplay = document.getElementById("moves");
const timerDisplay = document.getElementById("timer");
const winMessage = document.getElementById("win-message");

let tiles = [];
let moves = 0;
let timer = 0;
let interval;

function init() {
    tiles = [...Array(8).keys()].map(n => n + 1);
    tiles.push(null);
    render();
    startTimer();
}

function render() {
    board.innerHTML = "";
    tiles.forEach((tile, index) => {
        const div = document.createElement("div");
        div.classList.add("tile");
        if (tile === null) {
            div.classList.add("empty");
        } else {
            div.textContent = tile;
            div.addEventListener("click", () => moveTile(index));
        }
        board.appendChild(div);
    });
}

function moveTile(index) {
    const emptyIndex = tiles.indexOf(null);
    const validMoves = [index - 1, index + 1, index - 3, index + 3];

    if (validMoves.includes(emptyIndex)) {
        [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];
        moves++;
        movesDisplay.textContent = moves;
        render();
        checkWin();
    }
}

function shuffle(level) {
    let shuffleCount = level === "easy" ? 20 : level === "medium" ? 50 : 100;
    for (let i = 0; i < shuffleCount; i++) {
        const rand = Math.floor(Math.random() * 8);
        moveTile(rand);
    }
    moves = 0;
    movesDisplay.textContent = 0;
    winMessage.classList.add("hidden");
}

function checkWin() {
    if (tiles.slice(0,8).every((val,i)=> val === i+1)) {
        winMessage.classList.remove("hidden");
        clearInterval(interval);
    }
}

function resetGame() {
    moves = 0;
    timer = 0;
    movesDisplay.textContent = 0;
    timerDisplay.textContent = 0;
    winMessage.classList.add("hidden");
    clearInterval(interval);
    init();
}

function startTimer() {
    interval = setInterval(() => {
        timer++;
        timerDisplay.textContent = timer;
    }, 1000);
}

init();