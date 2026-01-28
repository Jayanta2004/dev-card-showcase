/* ===== Maze Layout =====
0 = empty
1 = wall
*/
const mazeData = [
    [0,1,0,0,0,1,0],
    [0,1,0,1,0,1,0],
    [0,0,0,1,0,0,0],
    [1,1,0,1,0,1,1],
    [0,0,0,0,0,0,0],
    [0,1,1,1,1,1,0],
    [0,0,0,0,0,0,0],
];

const maze = document.getElementById("maze");
let playerPos = { x: 0, y: 0 };
const goalPos = { x: 6, y: 6 };

/* ===== Render Maze ===== */
function renderMaze() {
    maze.innerHTML = "";
    mazeData.forEach((row, y) => {
        row.forEach((cell, x) => {
            const div = document.createElement("div");
            div.classList.add("cell");

            if (cell === 1) div.classList.add("wall");
            if (x === playerPos.x && y === playerPos.y) div.classList.add("player");
            if (x === goalPos.x && y === goalPos.y) div.classList.add("goal");

            maze.appendChild(div);
        });
    });
}

/* ===== Movement Logic ===== */
function move(dx, dy) {
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    if (
        newX >= 0 && newX < 7 &&
        newY >= 0 && newY < 7 &&
        mazeData[newY][newX] === 0
    ) {
        playerPos = { x: newX, y: newY };
        renderMaze();
        checkWin();
    }
}

function checkWin() {
    if (playerPos.x === goalPos.x && playerPos.y === goalPos.y) {
        document.getElementById("status").innerText = "🎉 You reached the goal!";
        recognition.stop();
    }
}

/* ===== Voice Recognition ===== */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.lang = "en-US";

recognition.onresult = (event) => {
    const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
    document.getElementById("status").innerText = "Heard: " + command;

    if (command.includes("up")) move(0, -1);
    if (command.includes("down")) move(0, 1);
    if (command.includes("left")) move(-1, 0);
    if (command.includes("right")) move(1, 0);
};

recognition.onerror = () => {
    document.getElementById("status").innerText = "⚠️ Voice recognition error";
};

function startListening() {
    recognition.start();
    document.getElementById("status").innerText = "🎧 Listening for commands...";
}

/* Init */
renderMaze();