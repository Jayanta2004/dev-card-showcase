const bike = document.getElementById("bike");
const speedDisplay = document.getElementById("speed");
const laneLines = document.getElementById("laneLines");
const road = document.getElementById("road");
const gameOverScreen = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");

const lanes = [120, 210, 300];
let currentLane = 1;

bike.style.left = lanes[currentLane] + "px";

let speed = 0;
let maxSpeed = 240;
let acceleration = 1.5;
let brakePower = 3;
let friction = 0.4;

let keys = {};
let obstacles = [];
let running = true;

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

document.addEventListener("keydown", (e) => {
    if (!running) return;

    if (e.key === "ArrowLeft" && currentLane > 0) {
        currentLane--;
        bike.style.left = lanes[currentLane] + "px";
    }
    if (e.key === "ArrowRight" && currentLane < lanes.length - 1) {
        currentLane++;
        bike.style.left = lanes[currentLane] + "px";
    }
});

function spawnObstacle() {
    if (!running) return;

    const obs = document.createElement("div");
    obs.classList.add("obstacle");

    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    obs.style.left = lane + "px";
    obs.style.top = "-100px";

    road.appendChild(obs);
    obstacles.push(obs);
}

setInterval(spawnObstacle, 1500);

function gameOver() {
    running = false;
    gameOverScreen.style.display = "flex";
}

restartBtn.onclick = () => location.reload();

function update() {

    if (!running) return;

    if (keys["ArrowUp"]) speed += acceleration;
    if (keys["ArrowDown"]) speed -= brakePower;
    if (!keys["ArrowUp"]) speed -= friction;

    if (speed < 0) speed = 0;
    if (speed > maxSpeed) speed = maxSpeed;

    speedDisplay.textContent = Math.floor(speed);

    laneLines.style.top =
        (parseFloat(laneLines.style.top || -100) + speed * 0.05) + "%";

    obstacles.forEach((obs, index) => {
        let top = parseFloat(obs.style.top);
        top += speed * 0.1;
        obs.style.top = top + "px";

        const bRect = bike.getBoundingClientRect();
        const oRect = obs.getBoundingClientRect();

        if (!(bRect.right < oRect.left ||
              bRect.left > oRect.right ||
              bRect.bottom < oRect.top ||
              bRect.top > oRect.bottom)) {
            gameOver();
        }

        if (top > 700) {
            obs.remove();
            obstacles.splice(index, 1);
        }
    });

    requestAnimationFrame(update);
}

update();