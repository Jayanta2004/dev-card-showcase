const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");
const speedDisplay = document.getElementById("speed");
const restartBtn = document.getElementById("restartBtn");

let score = 0;
let speed = 4;
let isGameOver = false;

let playerX = 100;
let playerY = 120;

const moveSpeed = 5;
const keys = {};

let obstacles = [];

/* ========================
   KEY CONTROLS
======================== */
document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

/* ========================
   SPAWN OBSTACLES
======================== */
function spawnObstacle() {
    const obstacle = document.createElement("div");
    obstacle.classList.add("obstacle");

    obstacle.style.top = Math.random() * 260 + "px";
    obstacle.style.left = "600px";

    gameArea.appendChild(obstacle);
    obstacles.push(obstacle);
}

/* ========================
   GAME LOOP
======================== */
function update() {
    if (isGameOver) return;

    // Movement
    if (keys["ArrowLeft"]) playerX -= moveSpeed;
    if (keys["ArrowRight"]) playerX += moveSpeed;
    if (keys["ArrowUp"]) playerY += moveSpeed;
    if (keys["ArrowDown"]) playerY -= moveSpeed;

    // Boundaries
    if (playerX < 0) playerX = 0;
    if (playerX > 560) playerX = 560;
    if (playerY < 0) playerY = 0;
    if (playerY > 260) playerY = 260;

    player.style.left = playerX + "px";
    player.style.bottom = playerY + "px";

    // Move obstacles
    obstacles.forEach((obs, index) => {
        let left = parseInt(obs.style.left);
        left -= speed;
        obs.style.left = left + "px";

        if (checkCollision(obs)) {
            gameOver();
        }

        if (left < -40) {
            obs.remove();
            obstacles.splice(index, 1);
        }
    });

    requestAnimationFrame(update);
}

/* ========================
   COLLISION
======================== */
function checkCollision(obstacle) {
    const playerRect = player.getBoundingClientRect();
    const obsRect = obstacle.getBoundingClientRect();

    return !(
        playerRect.right < obsRect.left ||
        playerRect.left > obsRect.right ||
        playerRect.bottom < obsRect.top ||
        playerRect.top > obsRect.bottom
    );
}

/* ========================
   SCORE
======================== */
function updateScore() {
    if (isGameOver) return;

    score++;
    scoreDisplay.textContent = score;

    if (score % 150 === 0) {
        speed += 1;
        speedDisplay.textContent = speed;
    }
}

/* ========================
   GAME OVER
======================== */
function gameOver() {
    isGameOver = true;
    player.style.background = "red";
    restartBtn.classList.remove("hidden");
}

/* ========================
   RESTART
======================== */
restartBtn.addEventListener("click", () => {
    location.reload();
});

/* ========================
   START GAME
======================== */
setInterval(spawnObstacle, 1200);
setInterval(updateScore, 100);

update();