const gameArea = document.getElementById("gameArea");
const car = document.getElementById("car");
const scoreDisplay = document.getElementById("score");
const speedDisplay = document.getElementById("speed");
const restartBtn = document.getElementById("restartBtn");

let score = 0;
let speed = 6;
let isGameOver = false;
let obstacleInterval;
let scoreAnimation;

const lanePositions = [40, 155, 270];
let currentLaneIndex = 1;

let targetX = lanePositions[currentLaneIndex];
let currentX = targetX;

car.style.left = currentX + "px";

/* CONTROLS */
document.addEventListener("keydown", (e) => {
    if (isGameOver) return;

    if (e.key === "ArrowLeft" && currentLaneIndex > 0) {
        currentLaneIndex--;
        targetX = lanePositions[currentLaneIndex];
        car.style.transform = "rotate(-8deg)";
    }

    if (e.key === "ArrowRight" && currentLaneIndex < lanePositions.length - 1) {
        currentLaneIndex++;
        targetX = lanePositions[currentLaneIndex];
        car.style.transform = "rotate(8deg)";
    }
});

/* Smooth Movement */
function smoothMove() {
    currentX += (targetX - currentX) * 0.2;
    car.style.left = currentX + "px";

    if (Math.abs(targetX - currentX) < 1) {
        car.style.transform = "rotate(0deg)";
    }

    if (!isGameOver) {
        requestAnimationFrame(smoothMove);
    }
}

smoothMove();

/* Create Obstacles */
function createObstacle() {
    if (isGameOver) return;

    const obstacle = document.createElement("div");
    obstacle.classList.add("obstacle");

    const randomLane =
        lanePositions[Math.floor(Math.random() * lanePositions.length)];

    obstacle.style.left = randomLane + "px";
    obstacle.style.top = "-120px";

    gameArea.appendChild(obstacle);

    moveObstacle(obstacle);
}

function moveObstacle(obstacle) {
    let obstacleTop = -120;

    function animate() {
        if (isGameOver) return;

        obstacleTop += speed;
        obstacle.style.top = obstacleTop + "px";

        if (checkCollision(obstacle)) {
            gameOver();
            return;
        }

        if (obstacleTop > 600) {
            obstacle.remove();
            return;
        }

        requestAnimationFrame(animate);
    }

    animate();
}

/* Collision */
function checkCollision(obstacle) {
    const carRect = car.getBoundingClientRect();
    const obsRect = obstacle.getBoundingClientRect();

    return !(
        carRect.bottom < obsRect.top ||
        carRect.top > obsRect.bottom ||
        carRect.right < obsRect.left ||
        carRect.left > obsRect.right
    );
}

/* Score */
function updateScore() {
    if (isGameOver) return;

    score++;
    scoreDisplay.textContent = score;

    if (score % 200 === 0) {
        speed += 1;
        speedDisplay.textContent = speed;
    }

    scoreAnimation = requestAnimationFrame(updateScore);
}

/* Game Over */
function gameOver() {
    isGameOver = true;

    cancelAnimationFrame(scoreAnimation);
    clearInterval(obstacleInterval);

    car.style.background = "red";
    car.style.boxShadow = "0 0 40px red";
    car.style.transform = "scale(1.1) rotate(10deg)";

    restartBtn.classList.remove("hidden");
}

/* Restart */
restartBtn.addEventListener("click", () => {
    document.querySelectorAll(".obstacle").forEach(obs => obs.remove());

    score = 0;
    speed = 6;
    isGameOver = false;
    currentLaneIndex = 1;

    targetX = lanePositions[currentLaneIndex];
    currentX = targetX;

    scoreDisplay.textContent = score;
    speedDisplay.textContent = speed;

    car.style.background = "linear-gradient(180deg, #ff2fd8, #ff0066)";
    car.style.boxShadow = "0 0 25px #ff00ff";
    car.style.transform = "rotate(0deg) scale(1)";

    restartBtn.classList.add("hidden");

    smoothMove();
    startGame();
});

/* Start Game */
function startGame() {
    updateScore();
    obstacleInterval = setInterval(createObstacle, 900);
}

startGame();