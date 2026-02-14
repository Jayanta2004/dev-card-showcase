const gridSize = 8;
const grid = document.getElementById("grid");
const piecesContainer = document.getElementById("pieces");
const scoreEl = document.getElementById("score");
const rotateBtn = document.getElementById("rotateBtn");

let score = 0;
let selectedPiece = null;

const shapes = [
    [[1,1],[1,1]],             // square
    [[1,1,1]],                 // line
    [[1,0],[1,0],[1,1]],       // L
    [[0,1],[1,1],[1,0]]        // S
];

// Create grid
let gridData = [];
for (let i = 0; i < gridSize; i++) {
    gridData[i] = [];
    for (let j = 0; j < gridSize; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.row = i;
        cell.dataset.col = j;
        grid.appendChild(cell);
        gridData[i][j] = 0;
    }
}

// Create pieces
function createPiece(shape) {
    const piece = document.createElement("div");
    piece.classList.add("piece");

    piece.shape = shape;
    piece.draggable = true;

    piece.style.gridTemplateColumns = `repeat(${shape[0].length}, 18px)`;

    shape.forEach(row => {
        row.forEach(cell => {
            const block = document.createElement("div");
            block.classList.add("block");
            block.style.visibility = cell ? "visible" : "hidden";
            piece.appendChild(block);
        });
    });

    piece.addEventListener("dragstart", () => {
        selectedPiece = piece;
        piece.classList.add("dragging");
    });

    piece.addEventListener("dragend", () => {
        piece.classList.remove("dragging");
    });

    return piece;
}

function spawnPieces() {
    piecesContainer.innerHTML = "";
    for (let i = 0; i < 3; i++) {
        const shape = JSON.parse(JSON.stringify(
            shapes[Math.floor(Math.random() * shapes.length)]
        ));
        piecesContainer.appendChild(createPiece(shape));
    }
}

spawnPieces();

// Grid drop logic
grid.addEventListener("dragover", e => {
    e.preventDefault();
});

grid.addEventListener("drop", e => {
    if (!selectedPiece) return;

    const cell = e.target;
    if (!cell.classList.contains("cell")) return;

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    const shape = selectedPiece.shape;

    if (canPlace(shape, row, col)) {
        placeShape(shape, row, col);
        selectedPiece.remove();
        score += 10;
        scoreEl.textContent = score;

        if (piecesContainer.children.length === 0) {
            spawnPieces();
        }
    }
});

// Placement checks
function canPlace(shape, r, c) {
    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j]) {
                let nr = r + i;
                let nc = c + j;
                if (
                    nr >= gridSize ||
                    nc >= gridSize ||
                    gridData[nr][nc] === 1
                ) return false;
            }
        }
    }
    return true;
}

function placeShape(shape, r, c) {
    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j]) {
                let nr = r + i;
                let nc = c + j;
                gridData[nr][nc] = 1;
                const cell = document.querySelector(
                    `.cell[data-row='${nr}'][data-col='${nc}']`
                );
                cell.classList.add("filled");
            }
        }
    }
    clearLines();
}

// Line clear logic
function clearLines() {
    for (let i = 0; i < gridSize; i++) {
        if (gridData[i].every(v => v === 1)) {
            for (let j = 0; j < gridSize; j++) {
                gridData[i][j] = 0;
            }
            score += 50;
        }
    }
    renderGrid();
    scoreEl.textContent = score;
}

function renderGrid() {
    document.querySelectorAll(".cell").forEach(cell => {
        const r = cell.dataset.row;
        const c = cell.dataset.col;
        cell.classList.toggle("filled", gridData[r][c]);
    });
}

// Rotate button
rotateBtn.addEventListener("click", () => {
    if (!selectedPiece) return;
    selectedPiece.shape = rotate(selectedPiece.shape);
    refreshPiece(selectedPiece);
});

function rotate(matrix) {
    return matrix[0].map((_, i) =>
        matrix.map(row => row[i]).reverse()
    );
}

function refreshPiece(piece) {
    piece.innerHTML = "";
    const shape = piece.shape;
    piece.style.gridTemplateColumns = `repeat(${shape[0].length}, 18px)`;

    shape.forEach(row => {
        row.forEach(cell => {
            const block = document.createElement("div");
            block.classList.add("block");
            block.style.visibility = cell ? "visible" : "hidden";
            piece.appendChild(block);
        });
    });
}
