const grid = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const movesEl = document.getElementById("moves");
const levelEl = document.getElementById("level");
const message = document.getElementById("message");
const startBtn = document.getElementById("startBtn");

let size = 6;
let playerPos = 0;
let treasurePos = 0;
let traps = [];
let score = 0;
let moves = 0;
let level = 1;

function createGrid() {
    grid.innerHTML = "";
    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;
        cell.onclick = () => movePlayer(i);
        grid.appendChild(cell);
    }
    render();
}

function randomPosition() {
    return Math.floor(Math.random() * size * size);
}

function startGame() {
    score = 0;
    moves = 0;
    level = 1;
    setupLevel();
    startBtn.style.display = "none";
}

function setupLevel() {
    playerPos = 0;
    treasurePos = randomPosition();

    traps = [];
    for (let i = 0; i < level; i++) {
        let trap;
        do {
            trap = randomPosition();
        } while (trap === playerPos || trap === treasurePos);
        traps.push(trap);
    }

    moves = 0;
    message.textContent = "";
    updateStats();
    render();
}

function movePlayer(index) {
    const distance = Math.abs(index - playerPos);
    if (distance !== 1 && distance !== size) return;

    playerPos = index;
    moves++;

    if (playerPos === treasurePos) {
        score += 50;
        level++;
        message.textContent = "Treasure found!";
        setupLevel();
        return;
    }

    if (traps.includes(playerPos)) {
        score = Math.max(0, score - 20);
        message.textContent = "Hit a trap!";
    }

    updateStats();
    render();
}

function render() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        cell.classList.remove("player", "treasure", "trap");
        const i = Number(cell.dataset.index);

        if (i === playerPos) cell.classList.add("player");
    });
}

function updateStats() {
    scoreEl.textContent = score;
    movesEl.textContent = moves;
    levelEl.textContent = level;
}

startBtn.onclick = startGame;
createGrid();
